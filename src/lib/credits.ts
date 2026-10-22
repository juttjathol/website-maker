import { getSupabaseBrowserClient } from "./supabase/client";
import { callWebloomAdminFunction } from "./supabase/admin-functions";

export const FREE_STARTER_CREDITS = 30;
export const CREATE_WEBSITE_COST = 30;
export const DOWNLOAD_WEBSITE_COST = 10;

export const CREDIT_PACKS = [
  { credits: 10, label: "+10 Credits", subtitle: "1 Website Download (ZIP / Shopify)" },
  { credits: 40, label: "+40 Credits", subtitle: "1 Website Build (30) + 1 Download (10)" },
  { credits: 100, label: "+100 Credits", subtitle: "2 Website Builds + 4 Downloads" },
  { credits: 250, label: "+250 Credits", subtitle: "Agency Pack · Multiple Sites & Exports" },
] as const;

const GUEST_CREDITS_KEY = "webloom:guest-credits-v1";
const UNLOCKED_PROJECTS_KEY = "webloom:unlocked-projects-v1";

export interface CreditsState {
  credits: number;
  isSignedIn: boolean;
  email: string | null;
  isAdmin: boolean;
}

export interface CreditSpendResult {
  allowed: boolean;
  creditsRemaining: number;
  required: number;
}

function readGuestCredits(): number {
  if (typeof window === "undefined") return FREE_STARTER_CREDITS;
  const raw = window.localStorage.getItem(GUEST_CREDITS_KEY);
  if (raw === null) {
    window.localStorage.setItem(GUEST_CREDITS_KEY, String(FREE_STARTER_CREDITS));
    return FREE_STARTER_CREDITS;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function writeGuestCredits(value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_CREDITS_KEY, String(Math.max(0, Math.floor(value))));
  } catch {
    // Ignore storage quota errors
  }
}

function readUnlockedProjects(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(UNLOCKED_PROJECTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export function markProjectUnlocked(projectId: string) {
  if (typeof window === "undefined" || !projectId) return;
  try {
    const set = readUnlockedProjects();
    set.add(projectId);
    window.localStorage.setItem(UNLOCKED_PROJECTS_KEY, JSON.stringify([...set]));
  } catch {
    // Ignore
  }
}

export function isProjectUnlocked(projectId: string): boolean {
  if (!projectId) return false;
  return readUnlockedProjects().has(projectId);
}

/**
 * Fetch the current user's credit balance.
 * Free accounts start with 30 credits (enough to create 1 website = 30 credits).
 * Downloading a website ZIP costs 10 additional credits.
 */
export async function getCreditsState(): Promise<CreditsState> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return {
      credits: readGuestCredits(),
      isSignedIn: false,
      email: null,
      isAdmin: false,
    };
  }

  try {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      return {
        credits: readGuestCredits(),
        isSignedIn: false,
        email: null,
        isAdmin: false,
      };
    }

    const [{ data: profile }, { data: adminFlag }] = await Promise.all([
      client.from("profiles").select("credits").eq("id", user.id).maybeSingle(),
      client.rpc("is_platform_admin"),
    ]);

    const isAdmin = adminFlag === true;
    const rawCredits = typeof profile?.credits === "number" ? profile.credits : FREE_STARTER_CREDITS;
    return {
      credits: isAdmin ? Math.max(rawCredits, 999999) : Math.max(0, rawCredits),
      isSignedIn: true,
      email: user.email ?? null,
      isAdmin,
    };
  } catch {
    return {
      credits: readGuestCredits(),
      isSignedIn: false,
      email: null,
      isAdmin: false,
    };
  }
}

/**
 * Spend `amount` credits for an action ("create_website" = 30, "download_website" = 10).
 */
export async function spendCredits(
  amount: number,
  reason: "create_website" | "download_website" | "download_shopify"
): Promise<CreditSpendResult> {
  const state = await getCreditsState();
  if (state.isAdmin) {
    return { allowed: true, creditsRemaining: state.credits, required: amount };
  }

  if (state.credits < amount) {
    return { allowed: false, creditsRemaining: state.credits, required: amount };
  }

  const client = getSupabaseBrowserClient();
  if (state.isSignedIn && client) {
    const { data, error } = await client.rpc("spend_user_credits", {
      p_amount: amount,
      p_reason: reason,
    });
    if (error) {
      // If RPC failed due to insufficient credits on server
      if (String(error.message || "").includes("INSUFFICIENT_CREDITS")) {
        const refreshed = await getCreditsState();
        return { allowed: false, creditsRemaining: refreshed.credits, required: amount };
      }
      // Fallback: if migration RPC isn't reachable, still allow if profile had enough
    }
    const nextCredits = typeof data === "number" ? data : Math.max(0, state.credits - amount);
    return { allowed: true, creditsRemaining: nextCredits, required: amount };
  }

  // Guest mode local credit deduction
  const nextGuestCredits = Math.max(0, state.credits - amount);
  writeGuestCredits(nextGuestCredits);
  return { allowed: true, creditsRemaining: nextGuestCredits, required: amount };
}

/**
 * Ensure a project has paid its 1-time 30-credit creation cost.
 * If already unlocked, returns allowed=true with 0 cost.
 */
export async function chargeWebsiteCreationCredits(projectId: string): Promise<CreditSpendResult> {
  if (isProjectUnlocked(projectId)) {
    const state = await getCreditsState();
    return { allowed: true, creditsRemaining: state.credits, required: CREATE_WEBSITE_COST };
  }
  const res = await spendCredits(CREATE_WEBSITE_COST, "create_website");
  if (res.allowed) {
    markProjectUnlocked(projectId);
  }
  return res;
}

/**
 * Send a credit request or credit pricing inquiry to the platform admin.
 */
export async function submitCreditRequestToAdmin(params: {
  requestedCredits: number;
  requestType: "credits" | "pricing";
  message: string;
}): Promise<{ ok: boolean; mode: "cloud" | "local"; message: string }> {
  const state = await getCreditsState();
  const cleanMessage = params.message.trim().slice(0, 500);
  const formattedMessage =
    params.requestType === "pricing"
      ? `[PRICING INQUIRY · Wants ${params.requestedCredits} credits] ${cleanMessage || "Please share the pricing details to buy credits."}`
      : `[CREDIT REQUEST · +${params.requestedCredits} credits] ${cleanMessage || `Requesting +${params.requestedCredits} credits to build/download my website.`}`;

  if (state.isSignedIn) {
    await callWebloomAdminFunction({
      action: "request_credits",
      requestedCredits: params.requestedCredits,
      requestType: params.requestType,
      message: formattedMessage,
    });
    return {
      ok: true,
      mode: "cloud",
      message:
        params.requestType === "pricing"
          ? "Your pricing message has been sent to the Admin! Once you purchase, the Admin will add the required credits to your account."
          : `Your request for +${params.requestedCredits} credits has been sent to the Admin! They will add the credits to your account shortly.`,
    };
  }

  // If guest (not signed in), try direct insert if session exists, or save locally and prompt sign-in
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(window.localStorage.getItem("webloom:guest-credit-requests") || "[]");
      existing.unshift({
        id: Date.now(),
        requestedCredits: params.requestedCredits,
        requestType: params.requestType,
        message: formattedMessage,
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem("webloom:guest-credit-requests", JSON.stringify(existing.slice(0, 20)));
    } catch {
      // Ignore
    }
  }

  return {
    ok: true,
    mode: "local",
    message:
      "Your request is saved! Sign in to your Webloom account so the Admin can add the credits directly to your account balance.",
  };
}
