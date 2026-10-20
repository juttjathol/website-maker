import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminDashboard, type AdminAuditItem, type AdminCustomer, type AdminSubscriptionRequest } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return <AdminNotice title="Admin tools are not connected" text="Configure Supabase and run the Webloom database migration before platform administration is available." />;
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=%2Fadmin");

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_platform_admin");
  if (adminError) {
    return <AdminNotice title="Finish the secure admin setup" text="The database is connected, but the Webloom security migration has not been applied yet. Follow the production checklist in the README." />;
  }
  if (isAdmin !== true) {
    return <AdminNotice title="This area is for Webloom administrators" text="Your account is signed in, but it does not have platform-admin permission. Customer management is restricted to authorized staff." />;
  }

  // This route is force-dynamic; the admin metric is intentionally relative to request time.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [customersResult, projectMetricsResult, recentResult, auditsResult, storageStatsResult, requestsResult] = await Promise.all([
    supabase.from("profiles").select("id,email,display_name,created_at,suspended_at,must_change_password,plan").order("created_at", { ascending: false }).limit(200),
    supabase.rpc("admin_project_counts"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("audit_logs").select("id,actor_id,action,target_email,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.rpc("admin_storage_stats"),
    supabase.from("subscription_requests").select("id,user_id,email,message,status,created_at").order("created_at", { ascending: false }).limit(200),
  ]);
  const queryError = customersResult.error || projectMetricsResult.error || recentResult.error || auditsResult.error || storageStatsResult.error || requestsResult.error;
  if (queryError) {
    const errorDetail = [
      queryError.code ? `Code: ${queryError.code}` : "",
      queryError.message || "The dashboard query failed.",
      queryError.details ? `Details: ${queryError.details}` : "",
      queryError.hint ? `Hint: ${queryError.hint}` : "",
    ].filter(Boolean).join("\n");
    return <AdminNotice title="Unable to load the customer dashboard" text="A customer or reporting query failed. Review the authenticated Supabase error detail below, then check the Webloom migration and RLS grants." detail={errorDetail} />;
  }

  const counts = new Map<string, number>();
  for (const row of projectMetricsResult.data || []) counts.set(row.user_id, Number(row.project_count) || 0);
  const totalProjects = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const customers: AdminCustomer[] = (customersResult.data || []).map((customer) => ({
    id: customer.id,
    email: customer.email,
    displayName: customer.display_name || "",
    createdAt: customer.created_at,
    suspended: Boolean(customer.suspended_at),
    mustChangePassword: Boolean(customer.must_change_password),
    projectCount: counts.get(customer.id) || 0,
    plan: customer.plan === "pro" ? "pro" : "free",
  }));
  const subscriptionRequests: AdminSubscriptionRequest[] = (requestsResult.data || []).map((request) => ({
    id: Number(request.id),
    userId: request.user_id || "",
    email: request.email,
    message: request.message || "",
    status: request.status === "approved" ? "approved" : request.status === "rejected" ? "rejected" : "pending",
    createdAt: request.created_at,
  }));
  const audit: AdminAuditItem[] = (auditsResult.data || []).map((item) => ({
    id: item.id,
    actorId: item.actor_id,
    action: item.action,
    targetEmail: item.target_email || "Unknown customer",
    createdAt: item.created_at,
  }));

  return (
    <main className="admin-page-shell">
      <header className="admin-page-header"><Link href="/" className="account-auth-brand"><span><Sparkles size={16} /></span>{BRAND.name}<span className="admin-brand-badge">STAFF</span></Link><Link href="/account" className="btn-app ghost"><ArrowLeft size={14} /> Account</Link></header>
      <div className="admin-page-content">
        <div className="admin-page-title"><div><p className="account-eyebrow">WEBLOOM OPERATIONS</p><h1>Customer dashboard</h1><p>Review account health, cloud projects and recent staff actions.</p></div><span className="account-status-pill"><ShieldCheck size={14} /> Admin access verified</span></div>
        <AdminDashboard
          customers={customers}
          totalCustomers={customersResult.count || 0}
          totalProjects={totalProjects}
          newCustomers={recentResult.count || 0}
          audit={audit}
          currentAdminId={user.id}
          storageStats={storageStatsResult.data?.[0] || null}
          subscriptionRequests={subscriptionRequests}
        />
      </div>
    </main>
  );
}

function AdminNotice({ title, text, detail }: { title: string; text: string; detail?: string }) {
  return (
    <main className="admin-page-shell">
      <header className="admin-page-header"><Link href="/" className="account-auth-brand"><span><Sparkles size={16} /></span>{BRAND.name}<span className="admin-brand-badge">STAFF</span></Link><Link href="/account" className="btn-app ghost"><ArrowLeft size={14} /> Account</Link></header>
      <section className="admin-notice-card"><div className="account-auth-icon"><LockKeyhole size={22} /></div><h1>{title}</h1><p>{text}</p>{detail ? <pre className="admin-error-detail">{detail}</pre> : null}<Link href="/" className="btn-app primary mt-5">Back to Webloom</Link></section>
    </main>
  );
}
