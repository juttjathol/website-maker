import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="account-page-shell">
        <header className="account-page-header"><Link href="/" className="account-auth-brand"><span><Sparkles size={16} /></span>{BRAND.name}</Link></header>
        <section className="account-setup-card">
          <div className="account-auth-icon"><Database size={22} /></div>
          <p className="account-eyebrow">ACCOUNT SETUP NEEDED</p>
          <h1>Connect secure cloud storage</h1>
          <p>Cloud accounts require this deployment to be connected to Supabase and the reviewed Webloom database migration. Guest projects will continue to save in your browser while cloud services are not configured.</p>
          <Link href="/sign-in" className="btn-app primary mt-5">View sign-in setup</Link>
        </section>
      </main>
    );
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=%2Faccount");

  const [{ data: profile }, { count: projectCount }, { data: admin }, { data: storageRows }] = await Promise.all([
    supabase.from("profiles").select("display_name,suspended_at,created_at,plan").eq("id", user.id).maybeSingle(),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.rpc("is_platform_admin"),
    supabase.rpc("webloom_cloud_storage_status"),
  ]);

  return (
    <main className="account-page-shell">
      <header className="account-page-header">
        <Link href="/" className="account-auth-brand"><span><Sparkles size={16} /></span>{BRAND.name}</Link>
        <Link href="/projects" className="btn-app ghost"><ArrowLeft size={14} /> My websites</Link>
      </header>
      <div className="account-page-content">
        <div className="account-page-title">
          <div><p className="account-eyebrow">YOUR WEBLOOM ACCOUNT</p><h1>Account & cloud sync</h1><p>Your projects are attached to your email, so you can get back to them on another device.</p></div>
          <span className="account-status-pill"><ShieldCheck size={14} /> Private account</span>
        </div>
        <AccountDashboard
          userId={user.id}
          email={user.email || ""}
          initialName={profile?.display_name || ""}
          createdAt={profile?.created_at || user.created_at}
          projectCount={projectCount || 0}
          isAdmin={admin === true}
          isSuspended={Boolean(profile?.suspended_at)}
          plan={profile?.plan === "pro" ? "pro" : "free"}
          storageStatus={storageRows?.[0] || null}
        />
      </div>
      <div className="account-page-footnote"><Mail size={14} /> Customer access is provisioned by Webloom staff. Keep your password private and change any temporary password at first sign-in.</div>
    </main>
  );
}
