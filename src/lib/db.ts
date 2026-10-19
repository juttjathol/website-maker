/*
 * Browser-first project storage with bounded Supabase cloud sync.
 * Guest work stays in IndexedDB. Account work is mirrored locally, but cloud
 * documents are fetched only when missing or newer to keep free-tier egress low.
 */
import type { Project } from "./schema";
import { getSupabaseBrowserClient } from "./supabase/client";
import { CLOUD_STORAGE_LIMITS, cloudQuotaMessage, serializedProjectBytes } from "./storage-limits";

const DB_NAME = "webloom";
const STORE = "projects";
const LS_KEY = "webloom:projects";
const OWNER_KEY = "webloom:project-owners";

let dbPromise: Promise<IDBDatabase> | null = null;
const quotaBlockedUsers = new Set<string>();

export type CloudWriteResult = "cloud" | "local" | "offline" | "quota";
type CloudContext = { client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>; userId: string };

type ProjectMetadata = { id: string; name: string; updated_at: string };

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function lsRead(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(projects: Project[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  } catch {
    // IndexedDB remains the primary store when localStorage is full.
  }
}

function readOwners(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(OWNER_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeOwners(owners: Record<string, string>) {
  try {
    localStorage.setItem(OWNER_KEY, JSON.stringify(owners));
  } catch {
    // Ownership hints only support offline filtering; Supabase RLS is authoritative.
  }
}

function setLocalOwner(projectId: string, userId: string) {
  writeOwners({ ...readOwners(), [projectId]: userId });
}

function clearLocalOwner(projectId: string) {
  const owners = readOwners();
  delete owners[projectId];
  writeOwners(owners);
}

async function localGetAll(): Promise<Project[]> {
  try {
    const db = await openDB();
    const indexed = await new Promise<Project[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as Project[]) || []);
      req.onerror = () => reject(req.error);
    });
    const merged = new Map<string, Project>();
    for (const project of lsRead()) merged.set(project.id, project);
    for (const project of indexed) merged.set(project.id, project);
    return [...merged.values()];
  } catch {
    return lsRead();
  }
}

async function localPut(project: Project): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(project);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    lsWrite(lsRead().filter((p) => p.id !== project.id));
  } catch {
    lsWrite([...lsRead().filter((p) => p.id !== project.id), project]);
  }
}

async function localDelete(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fall through to the localStorage cleanup.
  }
  lsWrite(lsRead().filter((p) => p.id !== id));
}

async function getCloudContext(): Promise<CloudContext | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  try {
    // Read the cached session locally. Every data operation is still authorized
    // by Postgres RLS; avoiding getUser() here saves an Auth HTTP request per save.
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.user) return null;
    return { client, userId: data.session.user.id };
  } catch {
    return null;
  }
}

function projectRow(project: Project) {
  return {
    id: project.id,
    name: project.name.slice(0, 160),
    data: project,
    updated_at: new Date(project.updatedAt || Date.now()).toISOString(),
  };
}

function trackQuotaBlock(userId: string, error: unknown) {
  const message = cloudQuotaMessage(error);
  if (!message) return null;
  const errorText = [
    typeof error === "object" && error && "message" in error ? String(error.message) : "",
    typeof error === "object" && error && "details" in error ? String(error.details) : "",
  ].join(" ");
  if (!errorText.includes("WEBLOOM_PROJECT_TOO_LARGE")) quotaBlockedUsers.add(userId);
  return message;
}

function projectUpdatedAt(project: Project): number {
  return Number.isFinite(project.updatedAt) ? project.updatedAt : 0;
}

export async function dbGetAll(): Promise<Project[]> {
  const local = await localGetAll();
  const context = await getCloudContext();
  const owners = readOwners();

  // Signed-out visitors see guest work only. Account-owned mirrors are private.
  if (!context) return local.filter((project) => !owners[project.id]);

  const ownedLocal = local.filter((project) => owners[project.id] === context.userId);
  const localById = new Map(ownedLocal.map((project) => [project.id, project]));
  const { data: metadata, error } = await context.client
    .from("projects")
    .select("id,name,updated_at")
    .order("updated_at", { ascending: false })
    .limit(CLOUD_STORAGE_LIMITS.accountProjects);
  if (error) return ownedLocal;

  const rows = (metadata || []) as ProjectMetadata[];
  const needsDownload = rows.filter((row) => {
    const localProject = localById.get(row.id);
    return !localProject || projectUpdatedAt(localProject) < Date.parse(row.updated_at);
  });
  const remoteById = new Map<string, Project>();

  if (needsDownload.length) {
    const { data: fetched, error: fetchError } = await context.client
      .from("projects")
      .select("id,data,updated_at")
      .in("id", needsDownload.map((row) => row.id));
    if (!fetchError) {
      for (const row of fetched || []) {
        const project = row.data as Project;
        if (!project || typeof project.id !== "string") continue;
        remoteById.set(project.id, project);
        setLocalOwner(project.id, context.userId);
        await localPut(project);
      }
    }
  }

  const merged = new Map<string, Project>();
  for (const row of rows) {
    const localProject = localById.get(row.id);
    const remoteProject = remoteById.get(row.id);
    if (localProject && projectUpdatedAt(localProject) >= Date.parse(row.updated_at)) {
      merged.set(row.id, localProject);
      if (projectUpdatedAt(localProject) > Date.parse(row.updated_at)) {
        void dbPut(localProject);
      }
    } else if (remoteProject) {
      merged.set(row.id, remoteProject);
    } else if (localProject) {
      // If a newer remote copy could not be downloaded, keep the safe local copy.
      merged.set(row.id, localProject);
    }
    setLocalOwner(row.id, context.userId);
  }

  // Preserve local account-owned drafts whose previous cloud write was offline
  // or quota-blocked. The project never disappears from this device.
  for (const project of ownedLocal) {
    if (merged.has(project.id)) continue;
    merged.set(project.id, project);
    if (rows.length < CLOUD_STORAGE_LIMITS.accountProjects) void dbPut(project);
  }

  return [...merged.values()];
}

export async function dbGet(id: string): Promise<Project | null> {
  const context = await getCloudContext();
  const local = (await localGetAll()).find((project) => project.id === id) || null;
  const owner = readOwners()[id];
  const accountLocal = owner === context?.userId ? local : null;

  if (!context) return owner ? null : local;

  const { data, error } = await context.client.from("projects").select("data,updated_at").eq("id", id).maybeSingle();
  const remote = !error && data?.data && typeof (data.data as Project).id === "string" ? data.data as Project : null;
  if (remote) {
    setLocalOwner(id, context.userId);
    if (accountLocal && projectUpdatedAt(accountLocal) > projectUpdatedAt(remote)) {
      void dbPut(accountLocal);
      return accountLocal;
    }
    await localPut(remote);
    return remote;
  }
  return accountLocal;
}

export async function dbPut(project: Project): Promise<CloudWriteResult> {
  await localPut(project);
  const context = await getCloudContext();
  if (!context) return "local";

  setLocalOwner(project.id, context.userId);
  const projectBytes = serializedProjectBytes(project);
  if (projectBytes > CLOUD_STORAGE_LIMITS.projectBytes) return "quota";
  // Re-check oversized projects after each local edit; they may have been
  // reduced below the limit without a page reload.
  if (quotaBlockedUsers.has(context.userId)) return "quota";

  const { error } = await context.client.from("projects").upsert(projectRow(project));
  if (error) return trackQuotaBlock(context.userId, error) ? "quota" : "offline";
  return "cloud";
}

export async function dbDelete(id: string): Promise<void> {
  const context = await getCloudContext();
  if (context) {
    await context.client.from("projects").delete().eq("id", id);
    quotaBlockedUsers.delete(context.userId);
  }
  await localDelete(id);
  clearLocalOwner(id);
}

/** Explicitly copy guest drafts from this browser into the currently signed-in account. */
export async function syncLocalProjects(): Promise<number> {
  const context = await getCloudContext();
  if (!context) throw new Error("Sign in before syncing this device's websites.");
  if (quotaBlockedUsers.has(context.userId)) {
    throw new Error("Cloud sync is paused for this account after a storage limit was reached. Your local websites remain safe; reload after deleting cloud websites to retry.");
  }

  const owners = readOwners();
  const guests = (await localGetAll()).filter((project) => !owners[project.id]);
  if (!guests.length) return 0;
  if (guests.length > CLOUD_STORAGE_LIMITS.accountProjects) {
    throw new Error(`You can sync up to ${CLOUD_STORAGE_LIMITS.accountProjects} websites at a time. Download backups for the rest; local copies will not be removed.`);
  }
  if (guests.some((project) => serializedProjectBytes(project) > CLOUD_STORAGE_LIMITS.projectBytes)) {
    throw new Error("One or more websites are larger than the 1 MiB cloud-save limit. Compress or remove images, or keep them local and download a backup.");
  }

  const { error } = await context.client.from("projects").upsert(guests.map((project) => projectRow(project)));
  if (error) {
    const quotaMessage = trackQuotaBlock(context.userId, error);
    throw new Error(quotaMessage || error.message);
  }
  for (const project of guests) setLocalOwner(project.id, context.userId);
  return guests.length;
}
