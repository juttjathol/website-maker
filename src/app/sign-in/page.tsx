"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/site/BrandLogo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  const configured = isSupabaseConfigured();

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const client = getSupabaseBrowserClient();
    if (!client) {
      setError("The Supabase connection is not configured for this deployment yet.");
      return;
    }

    setSigningIn(true);
    try {
      const { data, error: authError } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) throw authError;

      const next = new URLSearchParams(window.location.search).get("next") || "/projects";
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/projects";
      router.replace(data.user?.app_metadata?.webloom_must_change_password === true ? "/account/first-login" : safeNext);
      router.refresh();
    } catch {
      // Keep the response generic so the sign-in page does not disclose whether
      // an email address has a Webloom account.
      setError("We couldn’t sign in with those details. Check your email and password, or ask a Webloom administrator for access.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="account-auth-page">
      <div className="account-auth-background" />
      <Link href="/" className="account-auth-brand"><BrandMark size={32} />{BRAND.name}</Link>
      <section className="account-auth-card">
        <Link href="/" className="account-auth-back"><ArrowLeft size={14} /> Back to Webloom</Link>
        <div className="account-auth-icon"><LockKeyhole size={23} /></div>
        <p className="account-eyebrow">YOUR WEBSITES, WITH YOU</p>
        <h1>Sign in to Webloom</h1>
        <p className="account-auth-copy">Use the email and temporary password supplied by a Webloom administrator. Public self-registration is currently closed.</p>
        <form className="account-auth-form" onSubmit={signIn}>
          <label htmlFor="account-email">Email address</label>
          <input
            id="account-email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="account-password">Password</label>
          <input
            id="account-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="account-auth-error" role="alert">{error}</p> : null}
          {!configured ? <p className="account-setup-hint"><ShieldCheck size={15} /> Supabase URL and publishable key are required in this deployment’s environment settings.</p> : null}
          <button className="btn-app primary w-full !py-3" type="submit" disabled={signingIn || !configured}>
            <LockKeyhole size={15} /> {signingIn ? "Signing in…" : "Sign in securely"}
          </button>
        </form>
        <p className="account-auth-legal">Accounts are provisioned by Webloom staff. If you need access or a password reset, contact the administrator. Website edits remain saved in this browser if cloud sync is unavailable.</p>
      </section>
      <footer className="account-auth-footer">Private accounts. Device-safe drafts.</footer>
    </main>
  );
}
