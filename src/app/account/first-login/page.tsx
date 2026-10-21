import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/site/BrandLogo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FirstLoginPasswordForm } from "@/components/account/FirstLoginPasswordForm";

export const dynamic = "force-dynamic";

export default async function FirstLoginPage() {
  if (!isSupabaseConfigured()) redirect("/sign-in");
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  if (user.app_metadata?.webloom_must_change_password !== true) redirect("/projects");

  return (
    <main className="account-auth-page">
      <div className="account-auth-background" />
      <Link href="/" className="account-auth-brand"><BrandMark size={32} />{BRAND.name}</Link>
      <section className="account-auth-card">
        <div className="account-auth-icon"><LockKeyhole size={23} /></div>
        <p className="account-eyebrow">SECURE YOUR ACCOUNT</p>
        <h1>Choose your own password</h1>
        <p className="account-auth-copy">Your first password was temporary. Set a new one before using your saved websites. Signed in as <strong>{user.email}</strong>.</p>
        <FirstLoginPasswordForm />
        <p className="account-auth-legal">Use at least 12 characters. Your password is stored securely by Supabase and is never shown to Webloom staff.</p>
      </section>
      <footer className="account-auth-footer">One quick setup, then you’re ready to build.</footer>
    </main>
  );
}
