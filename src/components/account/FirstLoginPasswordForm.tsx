"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { callWebloomAdminFunction } from "@/lib/supabase/admin-functions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function FirstLoginPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password.length < 12 || password.length > 128) {
      setError("Choose a password between 12 and 128 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don’t match. Please try again.");
      return;
    }

    setSaving(true);
    try {
      await callWebloomAdminFunction({ action: "complete_first_password_change", newPassword: password });
      const client = getSupabaseBrowserClient();
      const { error: refreshError } = client ? await client.auth.refreshSession() : { error: new Error("Supabase is not configured.") };
      if (refreshError) throw refreshError;
      router.replace("/projects");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t update your password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <>
      <form className="account-auth-form" onSubmit={submit}>
        <label htmlFor="first-password">New password</label>
        <input
          id="first-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 12 characters"
        />
        <label htmlFor="confirm-first-password">Confirm new password</label>
        <input
          id="confirm-first-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Type it again"
        />
        {error ? <p className="account-auth-error" role="alert">{error}</p> : null}
        <button className="btn-app primary w-full !py-3" type="submit" disabled={saving}>
          <LockKeyhole size={15} /> {saving ? "Securing your account…" : "Save my new password"}
        </button>
      </form>
      <button className="account-signout" type="button" onClick={() => void signOut()}>Sign out</button>
    </>
  );
}
