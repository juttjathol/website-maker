"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AccountMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured());

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let alive = true;
    void client.auth.getUser().then(({ data }) => {
      if (alive) {
        setEmail(data.user?.email ?? null);
        setReady(true);
      }
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await getSupabaseBrowserClient()?.auth.signOut();
    setEmail(null);
  };

  if (!ready || !email) {
    return <Link href="/sign-in" className="btn-app ghost account-menu-link">Sign in</Link>;
  }

  return (
    <div className="account-menu-wrap">
      <Link href="/account" className="btn-app ghost account-menu-link" title={email}>
        <UserRound size={14} /> <span className="account-menu-email">{email}</span>
      </Link>
      <button type="button" className="account-menu-signout" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={14} /></button>
    </div>
  );
}
