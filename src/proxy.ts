import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig, isSupabaseConfigured } from "@/lib/supabase/config";

/** Keep Supabase's refreshed auth cookies in sync before server-rendered routes read them. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const { url, publishableKey } = getSupabasePublicConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refresh the session for server-rendered routes. Authorization is still
  // enforced by database RLS; this redirect only forces first-login password setup.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const appMetadata = (claims as Record<string, unknown> | null)?.app_metadata as Record<string, unknown> | undefined;
  if (
    appMetadata?.webloom_must_change_password === true
    && request.nextUrl.pathname !== "/account/first-login"
  ) {
    const redirectResponse = NextResponse.redirect(new URL("/account/first-login", request.url));
    for (const cookie of response.cookies.getAll()) redirectResponse.cookies.set(cookie);
    return redirectResponse;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
