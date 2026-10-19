"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Ban, CheckCircle2, Clipboard, FolderOpen, KeyRound, LoaderCircle, Search, Shield, Users, X } from "lucide-react";
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
}: {
  customers: AdminCustomer[];
  totalCustomers: number;
  totalProjects: number;
  newCustomers: number;
  audit: AdminAuditItem[];
  currentAdminId: string;
  storageStats: AdminStorageStats | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [pendingId, setPendingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [message, setMessage] = useState("");
  const [credential, setCredential] = useState<IssuedCredential | null>(null);
  const [copied, setCopied] = useState(false);

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
            <thead><tr><th>Customer</th><th>Joined</th><th>Websites</th><th>Status</th><th>Access controls</th></tr></thead>
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
                      <div className="admin-row-actions">
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
              {!visible.length ? <tr><td colSpan={5} className="admin-empty">No accounts match those filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {totalCustomers > customers.length ? <p className="admin-pagination-note">Showing the latest 200 of {totalCustomers.toLocaleString()} accounts. Narrow your search or use database reports for older records.</p> : null}
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
