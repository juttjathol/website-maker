import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next") || "/projects";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/projects";
  const supabase = await getSupabaseServerClient();

  if (!supabase || !code) {
    return NextResponse.redirect(new URL("/sign-in?error=setup", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=link", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
