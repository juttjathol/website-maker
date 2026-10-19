"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, Copy, FileUp, Globe2, LayoutTemplate,
  Cloud, HardDrive, LoaderCircle, MoreHorizontal, Pencil, Plus, Sparkles, Trash2,
} from "lucide-react";
import type { Project } from "@/lib/schema";
import { BRAND } from "@/lib/brand";
import { dbDelete, dbGetAll, dbPut, syncLocalProjects } from "@/lib/db";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AccountMenu } from "@/components/account/AccountMenu";
import { newProject } from "@/lib/store";
import { formatTime, downloadBlob } from "@/lib/util";
import { duplicateProject, prepareImportedProject } from "@/lib/project-ops";
import { TEMPLATES } from "@/lib/templates";
import { walkBlocks } from "@/lib/tree";

export default function ProjectsPage() {
  const router = useRouter();
  const accountsConfigured = isSupabaseConfigured();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("My new website");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [syncingLocal, setSyncingLocal] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const all = await dbGetAll();
    all.sort((a, b) => b.updatedAt - a.updatedAt);
    setProjects(all);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    void dbGetAll().then((all) => {
      if (cancelled) return;
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(all);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let alive = true;
    void client.auth.getUser().then(({ data }) => { if (alive) setAccountEmail(data.user?.email ?? null); });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setAccountEmail(session?.user?.email ?? null);
      void dbGetAll().then((all) => { all.sort((a, b) => b.updatedAt - a.updatedAt); setProjects(all); });
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  const syncGuestDrafts = async () => {
    if (!window.confirm("Copy guest websites from this browser into your signed-in account? Local copies will remain on this device.")) return;
    setSyncingLocal(true);
    try {
      const count = await syncLocalProjects();
      await refresh();
      showToast(count ? `${count} website${count === 1 ? "" : "s"} synced to your account.` : "There are no guest websites to sync.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Sync could not finish. Your local websites are still safe.");
    } finally {
      setSyncingLocal(false);
    }
  };

  const createBlank = async () => {
    setBusy(true);
    const project = newProject(newName.trim() || "My new website");
    await dbPut(project);
    router.push(`/builder?project=${encodeURIComponent(project.id)}`);
  };

  const duplicateWebsite = async (project: Project) => {
    await dbPut(duplicateProject(project));
    await refresh();
    showToast("Website duplicated.");
  };

  const removeProject = async (project: Project) => {
    if (!window.confirm(`Delete “${project.name}” from this browser? This cannot be undone.`)) return;
    await dbDelete(project.id);
    await refresh();
    showToast("Website deleted.");
  };

  const downloadBackup = (project: Project) => {
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }), `${slug(project.name)}-backup.json`);
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw: unknown = JSON.parse(await file.text());
      await dbPut(prepareImportedProject(raw));
      await refresh();
      showToast("Backup imported successfully.");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not read this backup file.");
    } finally {
      event.target.value = "";
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  return (
    <main className="min-h-screen bg-[#f8f7fc]">
      <header className="border-b border-[#ebe8f2] bg-white">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#6d5ae6] text-white"><Sparkles size={16} /></span>
            {BRAND.name}
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link href="/templates" className="btn-app ghost"><LayoutTemplate size={15} /> Templates</Link>
            <Link href="/guide" className="btn-app ghost">Guide</Link>
            <AccountMenu />
            <button className="btn-app primary" onClick={() => { setNewName("My new website"); setCreateOpen(true); }}><Plus size={15} /> Create a website</button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#817b96] hover:text-[#6d5ae6]"><ArrowLeft size={13} /> Back to home</Link>
            <h1 className="text-3xl font-extrabold tracking-tight">My websites</h1>
            <p className="mt-2 text-sm text-[#6c668a]">Your projects, templates and backups — all in one place.</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={importBackup} />
            <button className="btn-app ghost" onClick={() => fileInput.current?.click()}><FileUp size={14} /> Import backup</button>
            <button className="btn-app primary" onClick={() => { setNewName("My new website"); setCreateOpen(true); }}><Plus size={14} /> New website</button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e8e4f2] bg-white px-5 py-4 text-xs text-[#6c668a]">
          {accountEmail ? (
            <>
              <span className="inline-flex items-center gap-2 font-semibold text-[#37304f]"><Cloud size={15} className="text-[#6d5ae6]" /> Cloud account · {accountEmail}</span>
              <span>Cloud projects sync within your account and Webloom’s storage limits. Guest drafts stay local until you choose to sync them; export backups for important work.</span>
              <button className="btn-app ghost !ml-auto !px-3 !py-1.5 !text-[11px]" onClick={() => void syncGuestDrafts()} disabled={syncingLocal}><HardDrive size={13} /> {syncingLocal ? "Syncing…" : "Sync guest drafts"}</button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 font-semibold text-[#37304f]"><HardDrive size={15} className="text-[#6d5ae6]" /> Guest mode · saved on this device</span>
              <span>{accountsConfigured ? "Sign in to sync your websites across devices." : "Cloud accounts are not connected for this Webloom deployment yet."}</span>
              <Link href="/sign-in" className="ml-auto font-bold text-[#6d5ae6]">{accountsConfigured ? "Sign in · request access →" : "Account setup details →"}</Link>
            </>
          )}
        </div>

        {loading ? (
          <div className="grid min-h-[320px] place-items-center text-sm text-[#8d85ab]"><span className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={17} /> Loading your websites…</span></div>
        ) : projects.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDuplicate={() => void duplicateWebsite(project)}
                onDelete={() => void removeProject(project)}
                onBackup={() => downloadBackup(project)}
              />
            ))}
            <button className="new-project-card" onClick={() => { setNewName("My new website"); setCreateOpen(true); }}>
              <span className="new-project-icon"><Plus size={24} /></span>
              <strong>Create another website</strong>
              <span>A simple starter page or a template</span>
            </button>
          </div>
        ) : (
          <div className="empty-projects mt-9">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#efedfc] text-[#6d5ae6]"><Globe2 size={27} /></div>
            <h2 className="mt-5 text-xl font-extrabold">Your first website starts here</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6c668a]">Pick a starting point or open a blank canvas. Your work saves automatically — no account needed.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="btn-app primary !px-5 !py-3" onClick={() => { setNewName("My new website"); setCreateOpen(true); }}><Plus size={15} /> Create a website</button>
              <Link href="/templates" className="btn-app ghost !px-5 !py-3"><LayoutTemplate size={15} /> Browse templates</Link>
            </div>
            <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
              {TEMPLATES.slice(0, 3).map((tpl) => (
                <Link key={tpl.id} href={`/templates?use=${tpl.id}`} className="quick-template">
                  <img src={tpl.image} alt="" />
                  <span><strong>{tpl.name}</strong><small>{tpl.tagline}</small></span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-[#e8e4f2] bg-white p-5 sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold">Keep a copy somewhere safe</h3>
            <p className="mt-1 text-xs text-[#7b7590]">Your websites are stored in this browser. Use the menu on any website to download a backup or export its files.</p>
          </div>
          <Link href="/templates" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#6d5ae6] sm:mt-0">Explore templates <ArrowRight size={14} /></Link>
        </div>
      </div>

      {createOpen ? (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
          <section className="create-project-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <div className="flex items-start justify-between">
              <div>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#efedfc] text-[#6d5ae6]"><Plus size={20} /></div>
                <h2 id="create-title" className="mt-4 text-xl font-extrabold">Create a website</h2>
                <p className="mt-1 text-sm text-[#6c668a]">Start with a ready-to-edit sample page or pick a full template.</p>
              </div>
              <button className="icon-button" onClick={() => setCreateOpen(false)} aria-label="Close">×</button>
            </div>
            <label className="mt-5 block text-xs font-bold text-[#514b68]">Give your project a name</label>
            <input className="inspector-input mt-1.5 !py-2.5 !text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void createBlank(); }} autoFocus />
            <button className="btn-app primary mt-3 w-full !justify-center !py-3" onClick={() => void createBlank()} disabled={busy}><Plus size={15} /> Create a website with a sample page</button>
            <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#aaa4b9]"><span className="h-px flex-1 bg-[#eceaf4]" /> OR PICK A TEMPLATE <span className="h-px flex-1 bg-[#eceaf4]" /></div>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.slice(0, 4).map((tpl) => (
                <Link key={tpl.id} href={`/templates?use=${tpl.id}`} className="quick-template">
                  <img src={tpl.image} alt="" />
                  <span><strong>{tpl.name}</strong><small>{tpl.category}</small></span>
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
            <Link href="/templates" className="mt-4 flex justify-center text-xs font-bold text-[#6d5ae6]">See all {TEMPLATES.length} templates</Link>
          </section>
        </div>
      ) : null}
      {toast ? <div role="status" className="toast">{toast}</div> : null}
    </main>
  );
}

function ProjectCard({
  project,
  onDuplicate,
  onDelete,
  onBackup,
}: {
  project: Project;
  onDuplicate: () => void;
  onDelete: () => void;
  onBackup: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const cover = getCover(project);
  return (
    <article className="project-card">
      <Link href={`/builder?project=${encodeURIComponent(project.id)}`} className="project-cover">
        {cover ? <img src={cover} alt="" /> : <div className="project-cover-placeholder" />}
        <span className="project-pages-pill">{project.pages.length} {project.pages.length === 1 ? "page" : "pages"}</span>
      </Link>
      <div className="project-card-info">
        <div className="flex min-w-0 items-start gap-2">
          <Link href={`/builder?project=${encodeURIComponent(project.id)}`} className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-extrabold hover:text-[#6d5ae6]">{project.name || "Untitled website"}</h2>
            <p className="mt-1 text-[11px] text-[#8d85ab]">Edited {formatTime(project.updatedAt)}</p>
          </Link>
          <div className="relative">
            <button className="icon-button" aria-label="Website options" onClick={() => setMenu(!menu)}><MoreHorizontal size={17} /></button>
            {menu ? (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} />
                <div className="project-menu">
                  <Link href={`/builder?project=${encodeURIComponent(project.id)}`} onClick={() => setMenu(false)}><Pencil size={13} /> Edit website</Link>
                  <button onClick={() => { setMenu(false); onDuplicate(); }}><Copy size={13} /> Make a copy</button>
                  <button onClick={() => { setMenu(false); onBackup(); }}><ArrowDownToLine size={13} /> Download backup</button>
                  <button className="danger" onClick={() => { setMenu(false); onDelete(); }}><Trash2 size={13} /> Delete website</button>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <Link className="btn-app primary mt-4 w-full !justify-center" href={`/builder?project=${encodeURIComponent(project.id)}`}><Pencil size={13} /> Continue editing</Link>
      </div>
    </article>
  );
}

function getCover(project: Project): string {
  let image = "";
  walkBlocks(project.pages[0]?.blocks || [], (block) => {
    if (image) return;
    if (block.type === "hero" && block.props.image) image = block.props.image;
    else if (block.type === "image" && block.props.src) image = block.props.src;
  });
  return image;
}

function slug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "my-website";
}
