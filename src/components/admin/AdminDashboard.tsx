"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Ban, CheckCircle2, Clipboard, Coins, FolderOpen, KeyRound, LoaderCircle, Plus, Search, Shield, Users, X } from "lucide-react";
import { formatBytes } from "@/lib/storage-limits";
import { callWebloomAdminFunction } from "@/lib/supabase/admin-functions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AdminCustomer {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  suspended: boolean;
  mustChangePassword: boolean;
  projectCount: number;
  plan: "free" | "pro";
  credits: number;
}

export interface AdminSubscriptionRequest {
  id: number;
  userId: string;
  email: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  requestedCredits: number;
  requestType: "credits" | "pricing";
  createdAt: string;
}

export interface AdminAuditItem {
  id: number;
  actorId: string;
  action: string;
  targetEmail: string;
  createdAt: string;
}

export interface AdminStorageStats {
  used_bytes: number | string;
  limit_bytes: number | string;
  cloud_project_count: number | string;
  customers_with_cloud_projects: number | string;
}

interface IssuedCredential {
  email: string;
  password: string;
}

interface CustomerFunctionResponse {
  user: { id: string; email: string; name?: string };
  temporaryPassword: string;
}

export function AdminDashboard({
  customers,
  totalCustomers,
  totalProjects,
  newCustomers,
  audit,
  currentAdminId,
  storageStats,
  subscriptionRequests: initialSubscriptionRequests,
  loadRequestsViaFunction = false,
}: {
  customers: AdminCustomer[];
  totalCustomers: number;
  totalProjects: number;
  newCustomers: number;
  audit: AdminAuditItem[];
  currentAdminId: string;
  storageStats: AdminStorageStats | null;
  subscriptionRequests: AdminSubscriptionRequest[];
  loadRequestsViaFunction?: boolean;
}) {
  const router = useRouter();
  const [fetchedRequests, setFetchedRequests] = useState<AdminSubscriptionRequest[] | null>(null);
  const subscriptionRequests = fetchedRequests ?? initialSubscriptionRequests;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [pendingId, setPendingId] = useState("");
  const [pendingSubId, setPendingSubId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [message, setMessage] = useState("");
  const [credential, setCredential] = useState<IssuedCredential | null>(null);
  const [copied, setCopied] = useState(false);

  const refreshRequestsFromFunction = useCallback(async () => {
    try {
      const res = await callWebloomAdminFunction<{
        requests?: Array<{
          id: number;
          user_id?: string | null;
          email: string;
          message?: string | null;
          status?: string;
          requested_credits?: number;
          request_type?: string;
          created_at: string;
        }>;
      }>({ action: "list_subscription_requests" });
      if (Array.isArray(res.requests)) {
        setFetchedRequests(
          res.requests.map((r) => ({
            id: Number(r.id),
            userId: r.user_id || "",
            email: r.email,
            message: r.message || "",
            status: r.status === "approved" ? "approved" : r.status === "rejected" ? "rejected" : "pending",
            requestedCredits: typeof r.requested_credits === "number" ? r.requested_credits : 10,
            requestType: r.request_type === "pricing" ? "pricing" : "credits",
            createdAt: r.created_at,
          }))
        );
      }
    } catch {
      // Ignore fallback error if function is unreachable
    }
  }, []);

  useEffect(() => {
    if (!loadRequestsViaFunction) return;
    let alive = true;
    void callWebloomAdminFunction<{
      requests?: Array<{
        id: number;
        user_id?: string | null;
        email: string;
        message?: string | null;
        status?: string;
        requested_credits?: number;
        request_type?: string;
        created_at: string;
      }>;
    }>({ action: "list_subscription_requests" })
      .then((res) => {
        if (alive && Array.isArray(res.requests)) {
          setFetchedRequests(
            res.requests.map((r) => ({
              id: Number(r.id),
              userId: r.user_id || "",
              email: r.email,
              message: r.message || "",
              status: r.status === "approved" ? "approved" : r.status === "rejected" ? "rejected" : "pending",
              requestedCredits: typeof r.requested_credits === "number" ? r.requested_credits : 10,
              requestType: r.request_type === "pricing" ? "pricing" : "credits",
              createdAt: r.created_at,
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [loadRequestsViaFunction]);

  const visible = useMemo(() => customers.filter((customer) => {
    const textMatch = `${customer.email} ${customer.displayName}`.toLowerCase().includes(query.trim().toLowerCase());
    const statusMatch = statusFilter === "all" || (statusFilter === "paused" ? customer.suspended : !customer.suspended);
    return textMatch && statusMatch;
  }), [customers, query, statusFilter]);

  const createCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setMessage("");
    setCredential(null);
    try {
      const result = await callWebloomAdminFunction<CustomerFunctionResponse>({
        action: "create_customer",
        name: createName,
        email: createEmail,
      });
      setCredential({ email: result.user.email, password: result.temporaryPassword });
      setCopied(false);
      setCreateName("");
      setCreateEmail("");
      setMessage(`Access created for ${result.user.email}. Copy the one-time password below and share it privately.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The customer account could not be created.");
    } finally {
      setCreating(false);
    }
  };

  const resetCustomerPassword = async (customer: AdminCustomer) => {
    if (!window.confirm(`Issue a new temporary password for ${customer.email}? Their existing password will stop working; they must choose a new one at next sign-in.`)) return;
    setPendingId(customer.id);
    setMessage("");
    setCredential(null);
    try {
      const result = await callWebloomAdminFunction<CustomerFunctionResponse>({
        action: "reset_customer_password",
        userId: customer.id,
      });
      setCredential({ email: result.user.email, password: result.temporaryPassword });
      setCopied(false);
      setMessage(`A one-time password was generated for ${result.user.email}. Share it privately.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The customer password could not be reset.");
    } finally {
      setPendingId("");
    }
  };

  const toggleSuspension = async (customer: AdminCustomer) => {
    const next = !customer.suspended;
    const action = next ? "Pause cloud access for" : "Restore cloud access for";
    if (!window.confirm(`${action} ${customer.email}? ${next ? "They will no longer be able to read or save cloud projects." : "They will be able to use their cloud workspace again."}`)) return;
    setPendingId(customer.id);
    setMessage("");
    const client = getSupabaseBrowserClient();
    const { error } = client
      ? await client.rpc("admin_set_user_suspension", { p_user_id: customer.id, p_suspended: next })
      : { error: new Error("Admin service is not connected.") };
    setPendingId("");
    if (error) {
      setMessage(error.message || "This customer could not be updated.");
      return;
    }
    setMessage(`${customer.email} has been ${next ? "paused" : "restored"}.`);
    router.refresh();
  };

  const adjustCustomerCredits = async (customer: AdminCustomer, delta: number) => {
    setPendingSubId(customer.id);
    setMessage("");
    try {
      const res = await callWebloomAdminFunction<{ credits?: number }>({
        action: "adjust_user_credits",
        userId: customer.id,
        delta,
      });
      setMessage(
        `${delta >= 0 ? `Added +${delta}` : `Adjusted ${delta}`} credits for ${customer.email} (new balance: ${res.credits ?? customer.credits + delta} credits).`
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not adjust user credits.");
    } finally {
      setPendingSubId("");
    }
  };

  const customAdjustCustomerCredits = async (customer: AdminCustomer) => {
    const raw = window.prompt(
      `How many credits would you like to add to ${customer.email}? (Current balance: ${customer.credits} credits. Enter a positive number like 50, or negative like -10 to deduct.)`,
      "40"
    );
    if (!raw) return;
    const delta = Math.round(Number(raw));
    if (!Number.isFinite(delta) || delta === 0) return;
    await adjustCustomerCredits(customer, delta);
  };

  const reviewSubscriptionRequest = async (request: AdminSubscriptionRequest, status: "approved" | "rejected") => {
    const creditsToGrant = status === "approved" ? Math.max(0, request.requestedCredits || 10) : 0;
    const note = status === "approved" && request.userId
      ? ` This will automatically add +${creditsToGrant} credits to their account.`
      : "";
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} request from ${request.email}?${note}`)) return;
    setPendingSubId(`req-${request.id}`);
    setMessage("");
    try {
      await callWebloomAdminFunction({
        action: "set_subscription_request_status",
        requestId: request.id,
        status,
        grantCredits: creditsToGrant,
      });
      setMessage(
        status === "approved"
          ? `Approved request from ${request.email} (+${creditsToGrant} credits added).`
          : `Request from ${request.email} rejected.`
      );
      if (loadRequestsViaFunction) {
        await refreshRequestsFromFunction();
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The request could not be updated.");
    } finally {
      setPendingSubId("");
    }
  };

  const copyCredential = async () => {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(credential.password);
      setCopied(true);
    } catch {
      setMessage("Clipboard access was blocked. Select the temporary password and copy it manually.");
    }
  };

  const sharedUsed = Number(storageStats?.used_bytes || 0);
  const sharedLimit = Number(storageStats?.limit_bytes || 0);
  const sharedPercent = sharedLimit > 0 ? Math.min(100, sharedUsed / sharedLimit * 100) : 0;
  const pendingRequests = subscriptionRequests.filter((request) => request.status === "pending").length;

  return (
    <>
      <div className="admin-metric-grid">
        <Metric icon={<Users size={18} />} label="Customer accounts" value={totalCustomers.toLocaleString()} detail="Provisioned Webloom accounts" />
        <Metric icon={<FolderOpen size={18} />} label="Cloud websites" value={totalProjects.toLocaleString()} detail="Owner-protected project documents" />
        <Metric icon={<Activity size={18} />} label="New this month" value={newCustomers.toLocaleString()} detail="Accounts created in the last 30 days" />
        <Metric icon={<Shield size={18} />} label="Loaded customer records" value={customers.length.toLocaleString()} detail="Latest 200 accounts, newest first" />
      </div>

      <section className="admin-card admin-storage-card">
        <div className="admin-card-heading"><div><h2>Cloud storage guardrail</h2><p>Project documents stop at this hard application cap; edits remain local when cloud capacity is exhausted.</p></div><Shield size={17} className="text-[#6d5ae6]" /></div>
        {storageStats ? (
          <div className="admin-storage-content">
            <div className="admin-storage-line"><strong>{formatBytes(sharedUsed)}</strong><span>of {formatBytes(sharedLimit)} reserved for project documents</span><b>{Math.round(sharedPercent)}%</b></div>
            <div className="admin-storage-progress" role="progressbar" aria-label="Webloom shared cloud project data pool" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(sharedPercent)}><span style={{ width: `${sharedPercent}%` }} /></div>
            <p>{Number(storageStats.cloud_project_count).toLocaleString()} cloud websites across {Number(storageStats.customers_with_cloud_projects).toLocaleString()} accounts. Each account is capped at 5 MiB and 25 websites; each website is capped at 1 MiB.</p>
          </div>
        ) : <p className="admin-empty">Storage statistics are unavailable.</p>}
      </section>

      <section className="admin-card admin-create-card">
        <div className="admin-card-heading"><div><h2>Grant customer access</h2><p>Public sign-ups are disabled. Create a verified email/password account and share its one-time password privately.</p></div><KeyRound size={17} className="text-[#6d5ae6]" /></div>
        <form className="admin-create-user-form" onSubmit={(event) => void createCustomer(event)}>
          <label><span>Customer name</span><input required minLength={2} maxLength={80} autoComplete="name" value={createName} onChange={(event) => setCreateName(event.target.value)} placeholder="Full name" /></label>
          <label><span>Email address</span><input required type="email" maxLength={254} autoComplete="email" value={createEmail} onChange={(event) => setCreateEmail(event.target.value)} placeholder="customer@example.com" /></label>
          <button className="btn-app primary" type="submit" disabled={creating}>{creating ? <LoaderCircle size={14} className="animate-spin" /> : <Users size={14} />}{creating ? "Creating account…" : "Create customer account"}</button>
        </form>
        {credential ? (
          <div className="admin-password-issued" role="status">
            <div><strong>Temporary password for {credential.email}</strong><button type="button" className="admin-dismiss-secret" onClick={() => { setCredential(null); setCopied(false); }} aria-label="Dismiss temporary password"><X size={15} /></button></div>
            <input aria-label="One-time temporary password" value={credential.password} readOnly onFocus={(event) => event.currentTarget.select()} />
            <p>This password is shown only in this page session. Share it over a private channel; the customer will be required to choose a new password at first sign-in. Never put it in a support ticket or log.</p>
            <button type="button" className="btn-app ghost" onClick={() => void copyCredential()}><Clipboard size={13} /> {copied ? "Copied" : "Copy temporary password"}</button>
          </div>
        ) : null}
      </section>

      <section className="admin-card">
        <div className="admin-card-heading"><div><h2>Customers</h2><p>Account controls apply to cloud data; customer website content is not shown here.</p></div><span className="admin-list-count">{visible.length} shown</span></div>
        <div className="admin-table-tools">
          <label className="admin-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a customer by email" /></label>
          <select className="admin-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="Filter account status">
            <option value="all">All accounts</option><option value="active">Active</option><option value="paused">Paused</option>
          </select>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Joined</th><th>Websites</th><th>Status</th><th>Credits</th><th>Credits &amp; Access Controls</th></tr></thead>
            <tbody>
              {visible.map((customer) => {
                const isBusy = pendingId === customer.id;
                const status = customer.suspended ? "Paused" : customer.mustChangePassword ? "Setup needed" : "Active";
                return (
                  <tr key={customer.id}>
                    <td><strong>{customer.displayName || customer.email.split("@")[0]}</strong><small>{customer.email}</small></td>
                    <td>{new Date(customer.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</td>
                    <td>{customer.projectCount}</td>
                    <td><span className={`admin-status ${customer.suspended ? "paused" : customer.mustChangePassword ? "setup" : "active"}`}>{status}</span></td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f1ff] px-2.5 py-1 text-xs font-extrabold text-[#5744d4]">
                        <Coins size={12} className="text-amber-500" />
                        {customer.id === currentAdminId ? "Admin (∞)" : `${customer.credits} Credits`}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-row-action restore"
                          onClick={() => void adjustCustomerCredits(customer, 10)}
                          disabled={isBusy || pendingSubId === customer.id}
                          title="Add +10 credits (1 website download)"
                        >
                          <Plus size={12} /> +10 Credits
                        </button>
                        <button
                          className="admin-row-action restore"
                          onClick={() => void adjustCustomerCredits(customer, 40)}
                          disabled={isBusy || pendingSubId === customer.id}
                          title="Add +40 credits (1 website build + 1 download)"
                        >
                          <Plus size={12} /> +40 Credits
                        </button>
                        <button
                          className="admin-row-action reset"
                          onClick={() => void customAdjustCustomerCredits(customer)}
                          disabled={isBusy || pendingSubId === customer.id}
                          title="Add or deduct a custom credit amount"
                        >
                          <Coins size={12} /> Custom
                        </button>
                        <button className={`admin-row-action ${customer.suspended ? "restore" : "pause"}`} onClick={() => void toggleSuspension(customer)} disabled={isBusy || customer.id === currentAdminId} title={customer.id === currentAdminId ? "You cannot pause your own admin account" : undefined}>
                          {customer.suspended ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                          {isBusy ? "Updating…" : customer.suspended ? "Restore" : "Pause"}
                        </button>
                        <button className="admin-row-action reset" onClick={() => void resetCustomerPassword(customer)} disabled={isBusy || customer.id === currentAdminId} title={customer.id === currentAdminId ? "Use your own account security settings" : "Issue a new one-time password"}>
                          {isBusy ? <LoaderCircle size={13} className="animate-spin" /> : <KeyRound size={13} />}
                          Reset password
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visible.length ? <tr><td colSpan={6} className="admin-empty">No accounts match those filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {totalCustomers > customers.length ? <p className="admin-pagination-note">Showing the latest 200 of {totalCustomers.toLocaleString()} accounts. Narrow your search or use database reports for older records.</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>Credit requests &amp; pricing inquiries</h2>
            <p>Users requesting credits to download their website (+10) or build new websites (+30), or asking about credit pricing. Approving adds the requested credits automatically.</p>
          </div>
          <span className="admin-list-count">{pendingRequests} pending</span>
        </div>
        {subscriptionRequests.length ? (
          <div className="admin-audit-list">
            {subscriptionRequests.map((request) => (
              <div key={request.id}>
                <span className={`admin-audit-dot ${request.status === "rejected" ? "warning" : ""}`} />
                <span>
                  <strong>
                    {request.email}{" "}
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-[#f3f0ff] px-2 py-0.5 text-[10px] font-extrabold text-[#5744d4]">
                      {request.requestType === "pricing" ? "💬 Pricing Inquiry" : "🪙 Credit Request"} · +{request.requestedCredits} Credits
                    </span>
                  </strong>
                  <small>{request.message ? `“${request.message}” · ` : ""}{new Date(request.createdAt).toLocaleString()}</small>
                </span>
                {request.status === "pending" ? (
                  <span className="admin-row-actions">
                    <button className="admin-row-action restore" onClick={() => void reviewSubscriptionRequest(request, "approved")} disabled={pendingSubId === `req-${request.id}`} title={`Approve and add +${request.requestedCredits} credits to this user`}>
                      {pendingSubId === `req-${request.id}` ? <LoaderCircle size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Approve (+{request.requestedCredits} Credits)
                    </button>
                    <button className="admin-row-action reset" onClick={() => void reviewSubscriptionRequest(request, "rejected")} disabled={pendingSubId === `req-${request.id}`} title="Reject this request">
                      <X size={13} />
                      Reject
                    </button>
                  </span>
                ) : (
                  <span className={`admin-status ${request.status === "approved" ? "active" : "paused"}`}>{request.status}</span>
                )}
              </div>
            ))}
          </div>
        ) : <p className="admin-empty">No credit requests or pricing messages yet.</p>}
      </section>

      <section className="admin-card admin-audit-card">
        <div className="admin-card-heading"><div><h2>Recent staff actions</h2><p>Customer access changes and password resets are recorded for accountability.</p></div><Activity size={17} className="text-[#77708f]" /></div>
        {audit.length ? <div className="admin-audit-list">{audit.map((item) => <div key={item.id}><span className={`admin-audit-dot ${item.action === "customer_suspended" ? "warning" : ""}`} /><span><strong>{auditTitle(item.action)}</strong><small>{item.targetEmail}</small></span><time>{new Date(item.createdAt).toLocaleString()}</time></div>)}</div> : <p className="admin-empty">No administrative actions have been recorded yet.</p>}
      </section>
      {message ? <p className="admin-feedback" role="status">{message}</p> : null}
    </>
  );
}

function auditTitle(action: string) {
  const titles: Record<string, string> = {
    customer_suspended: "Customer access paused",
    customer_restored: "Customer access restored",
    customer_created: "Customer account created",
    customer_password_reset: "Customer password reset",
  };
  return titles[action] || action.replaceAll("_", " ");
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <article className="admin-metric-card"><span className="admin-metric-icon">{icon}</span><span className="admin-metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
