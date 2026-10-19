"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Cloud, HardDrive, KeyRound, LoaderCircle, LogOut, RefreshCw, Shield, UserRound } from "lucide-react";
import { syncLocalProjects } from "@/lib/db";
import { CLOUD_STORAGE_LIMITS, formatBytes } from "@/lib/storage-limits";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AccountStorageStatus {
  project_count: number;
  account_used_bytes: number;
  account_limit_bytes: number;
  project_limit_bytes: number;
  shared_used_bytes: number;
  shared_limit_bytes: number;
  shared_remaining_bytes: number;
}

export function AccountDashboard({
  userId,
  email,
  initialName,
  createdAt,
  projectCount,
  isAdmin,
  isSuspended,
  storageStatus,
}: {
  userId: string;
  email: string;
  initialName: string;
  createdAt: string;
  projectCount: number;
  isAdmin: boolean;
  isSuspended: boolean;
  storageStatus: AccountStorageStatus | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setSavingName(true);
    setMessage("");
    const { error } = await client.from("profiles").update({ display_name: name.trim().slice(0, 80) }).eq("id", userId);
    setSavingName(false);
    setMessage(error ? "We could not save that name. Please try again." : "Your account details are saved.");
  };

  const syncDrafts = async () => {
    const confirmed = window.confirm("Copy guest websites saved in this browser into your Webloom account? This does not delete the local copies. Cloud storage has per-account and shared-pool limits.");
    if (!confirmed) return;
    setSyncing(true);
    setMessage("");
    try {
      const count = await syncLocalProjects();
      setSynced(count);
      setMessage(count ? `${count} website${count === 1 ? "" : "s"} copied to your account.` : "There are no guest websites on this device to copy.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync could not finish. Your local websites are still safe.");
    } finally {
      setSyncing(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");
    if (newPassword.length < 12 || newPassword.length > 128) {
      setPasswordMessage("Choose a password between 12 and 128 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Those passwords don’t match.");
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setSavingPassword(true);
    const { error } = await client.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordMessage("We couldn’t change your password. Please try again or contact a Webloom administrator.");
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated. Keep it somewhere safe.");
  };

  const signOut = async () => {
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  const accountUsed = Number(storageStatus?.account_used_bytes || 0);
  const accountLimit = Number(storageStatus?.account_limit_bytes || CLOUD_STORAGE_LIMITS.accountBytes);
  const sharedUsed = Number(storageStatus?.shared_used_bytes || 0);
  const sharedLimit = Number(storageStatus?.shared_limit_bytes || CLOUD_STORAGE_LIMITS.sharedBytes);
  const accountPercent = Math.min(100, Math.max(0, accountUsed / Math.max(1, accountLimit) * 100));
  const sharedPercent = Math.min(100, Math.max(0, sharedUsed / Math.max(1, sharedLimit) * 100));

  return (
    <>
      {isSuspended ? <div role="alert" className="account-alert">Cloud project access is paused. Local copies remain on the devices where they were saved, but changes cannot sync to the cloud. Contact Webloom support if you think this is a mistake.</div> : null}
      <div className="account-dashboard-grid">
        <section className="account-card account-profile-card">
          <div className="account-card-heading"><span className="account-card-icon"><UserRound size={18} /></span><div><h2>Profile</h2><p>Your sign-in and display details</p></div></div>
          <div className="account-email-row"><span>Email address</span><strong>{email}</strong><small>Account access granted by Webloom staff</small></div>
          <form className="account-profile-form" onSubmit={saveProfile}>
            <label htmlFor="account-display-name">Display name</label>
            <input id="account-display-name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" />
            <button className="btn-app primary" type="submit" disabled={savingName}>{savingName ? <LoaderCircle size={14} className="animate-spin" /> : null}{savingName ? "Saving…" : "Save name"}</button>
          </form>
          <p className="account-created-note">Account created {new Date(createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        </section>

        <section className="account-card account-cloud-card">
          <div className="account-card-heading"><span className="account-card-icon cloud"><Cloud size={18} /></span><div><h2>Your cloud workspace</h2><p>Only you can access these websites</p></div></div>
          <div className="account-cloud-stat"><strong>{projectCount}</strong><span>{projectCount === 1 ? "website" : "websites"} saved to your account</span></div>
          <p className="account-card-copy">Cloud saves have a 1 MiB per-website limit and a 5 MiB per-account limit. If a limit is reached, your edits remain saved on this device and can still be exported or backed up.</p>
          {storageStatus ? (
            <div className="account-storage-usage">
              <div className="account-storage-line"><span>My cloud space</span><strong>{formatBytes(accountUsed)} / {formatBytes(accountLimit)}</strong></div>
              <div className="account-storage-bar" role="progressbar" aria-label="Your account cloud storage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(accountPercent)}><span style={{ width: `${accountPercent}%` }} /></div>
              <div className="account-storage-line shared"><span>Shared Webloom pool</span><strong>{formatBytes(sharedUsed)} / {formatBytes(sharedLimit)}</strong></div>
              <div className="account-storage-bar shared" role="progressbar" aria-label="Shared Webloom cloud storage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(sharedPercent)}><span style={{ width: `${sharedPercent}%` }} /></div>
            </div>
          ) : <p className="account-storage-unavailable">Cloud usage details are temporarily unavailable. Local copies remain available.</p>}
          <button className="btn-app ghost" onClick={syncDrafts} disabled={syncing || isSuspended}><HardDrive size={14} /> {syncing ? "Copying local websites…" : "Copy local websites to my account"}</button>
          {synced !== null ? <p className="account-inline-result" role="status">{message}</p> : null}
        </section>

        <section className="account-card">
          <div className="account-card-heading"><span className="account-card-icon"><KeyRound size={18} /></span><div><h2>Password & security</h2><p>Change your sign-in password</p></div></div>
          <form className="account-profile-form" onSubmit={changePassword}>
            <label htmlFor="account-new-password">New password</label>
            <input id="account-new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 12 characters" />
            <label htmlFor="account-confirm-password">Confirm new password</label>
            <input id="account-confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type it again" />
            {passwordMessage ? <p className="account-inline-result" role="status">{passwordMessage}</p> : null}
            <button className="btn-app primary" type="submit" disabled={savingPassword}>{savingPassword ? <LoaderCircle size={14} className="animate-spin" /> : null}{savingPassword ? "Updating…" : "Update password"}</button>
          </form>
          <p className="account-created-note">If you forget your password, ask a Webloom administrator to issue a reset. Email recovery is not enabled yet.</p>
        </section>

        <section className="account-card account-next-card">
          <div className="account-card-heading"><span className="account-card-icon"><RefreshCw size={18} /></span><div><h2>Keep building</h2><p>Pick up right where you left off</p></div></div>
          <p className="account-card-copy">Manage your projects, explore the new templates, or follow the beginner-friendly walkthrough.</p>
          <div className="account-action-list">
            <Link href="/projects"><span>Open My websites</span><ArrowRight size={15} /></Link>
            <Link href="/templates"><span>Browse all templates</span><ArrowRight size={15} /></Link>
            <Link href="/guide"><span>Open the step-by-step guide</span><ArrowRight size={15} /></Link>
            {isAdmin ? <Link href="/admin"><span><Shield size={14} /> Platform admin dashboard</span><ArrowRight size={15} /></Link> : null}
          </div>
        </section>
      </div>
      {message && synced === null ? <p className="account-inline-result" role="status">{message}</p> : null}
      <button className="account-signout" onClick={signOut}><LogOut size={14} /> Sign out of Webloom</button>
    </>
  );
}
