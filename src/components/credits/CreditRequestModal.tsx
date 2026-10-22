"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Coins,
  Download,
  LoaderCircle,
  MessageSquare,
  PlusCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  CREATE_WEBSITE_COST,
  DOWNLOAD_WEBSITE_COST,
  FREE_STARTER_CREDITS,
  submitCreditRequestToAdmin,
} from "@/lib/credits";

const CREDIT_PACKS = [
  { credits: 10, label: "+10 Credits", sub: "Download 1 website file" },
  { credits: 40, label: "+40 Credits", sub: "1 Website (30) + Download (10)" },
  { credits: 100, label: "+100 Credits", sub: "Studio Pack · 3 sites + downloads" },
  { credits: 250, label: "+250 Credits", sub: "Agency Pack · Full access" },
];

export function CreditRequestModal({
  open,
  onClose,
  currentCredits,
  requiredCredits = DOWNLOAD_WEBSITE_COST,
  reason = "download",
  userEmail,
  isSignedIn,
  onCreditsUpdated,
}: {
  open: boolean;
  onClose: () => void;
  currentCredits: number;
  requiredCredits?: number;
  reason?: "download" | "create" | "general";
  userEmail?: string | null;
  isSignedIn?: boolean;
  onCreditsUpdated?: () => void;
}) {
  const [tab, setTab] = useState<"credits" | "pricing">("credits");
  const [selectedCredits, setSelectedCredits] = useState<number>(
    reason === "create" ? 40 : 10
  );
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) return null;

  const shortfall = Math.max(0, requiredCredits - currentCredits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResultMessage("");
    setErrorMessage("");
    try {
      const res = await submitCreditRequestToAdmin({
        requestedCredits: Math.max(10, selectedCredits),
        requestType: tab,
        message: note,
      });
      setResultMessage(res.message);
      setNote("");
      onCreditsUpdated?.();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not send request right now. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="publish-modal max-w-[560px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
      >
        <header className="publish-head">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/20 text-amber-200">
              <Coins size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/75">
                Webloom Credits System
              </div>
              <h2 id="credits-modal-title" className="truncate text-lg font-extrabold text-white">
                {reason === "download"
                  ? "Add 10 Credits to Download Your Website"
                  : reason === "create"
                    ? "Get More Credits to Create Another Website"
                    : "Request or Buy Webloom Credits"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="publish-close text-white/80 hover:text-white"
            onClick={onClose}
            aria-label="Close credits modal"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          {/* Credit Balance & Cost Summary */}
          <div className="rounded-2xl border border-[#e5def7] bg-gradient-to-r from-[#f7f4ff] to-[#fff8f2] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6e668a]">
                  Your Credit Balance
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#1e1836]">
                    {currentCredits} Credits
                  </span>
                  {shortfall > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900">
                      Need +{shortfall} more credits
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="rounded-xl border border-[#e2daf5] bg-white px-3 py-2 text-right">
                <div className="text-[10px] font-bold uppercase text-[#7c7498]">
                  {reason === "download" ? "Download File Cost" : "New Website Cost"}
                </div>
                <div className="text-sm font-extrabold text-[#6d5ae6]">
                  {reason === "download"
                    ? `${DOWNLOAD_WEBSITE_COST} Credits`
                    : `${CREATE_WEBSITE_COST} Credits`}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#e8e2f6] pt-3 text-center text-[11px]">
              <div className="rounded-lg bg-white/80 px-2 py-1.5">
                <strong className="block text-[#231c3d]">{FREE_STARTER_CREDITS} Credits</strong>
                <span className="text-[#726a8f]">Free starter balance</span>
              </div>
              <div className="rounded-lg bg-white/80 px-2 py-1.5">
                <strong className="block text-[#231c3d]">{CREATE_WEBSITE_COST} Credits</strong>
                <span className="text-[#726a8f]">Make 1 website</span>
              </div>
              <div className="rounded-lg bg-white/80 px-2 py-1.5">
                <strong className="block text-[#6d5ae6]">+{DOWNLOAD_WEBSITE_COST} Credits</strong>
                <span className="text-[#726a8f]">Download ZIP file</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs: Request Credits vs Ask Admin About Pricing */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f3f1f9] p-1">
            <button
              type="button"
              onClick={() => setTab("credits")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-extrabold transition ${
                tab === "credits"
                  ? "bg-white text-[#5b47df] shadow-xs"
                  : "text-[#6f688a] hover:text-[#231c3d]"
              }`}
            >
              <PlusCircle size={14} />
              <span>Request Credits</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("pricing")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-extrabold transition ${
                tab === "pricing"
                  ? "bg-white text-[#5b47df] shadow-xs"
                  : "text-[#6f688a] hover:text-[#231c3d]"
              }`}
            >
              <MessageSquare size={14} />
              <span>Ask Pricing / Buy Credits</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="inspector-label">
                {tab === "credits"
                  ? "How many credits would you like the Admin to add?"
                  : "How many credits are you interested in buying?"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CREDIT_PACKS.map((pack) => {
                  const active = selectedCredits === pack.credits;
                  return (
                    <button
                      key={pack.credits}
                      type="button"
                      onClick={() => setSelectedCredits(pack.credits)}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-[#6d5ae6] bg-[#f4f1ff] shadow-2xs"
                          : "border-[#e6e1f2] bg-white hover:border-[#b9acf2]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-extrabold text-[#221b3a]">
                          {pack.label}
                        </strong>
                        {active ? (
                          <Sparkles size={13} className="text-[#6d5ae6]" />
                        ) : null}
                      </div>
                      <span className="mt-0.5 block text-[10.5px] text-[#746c90]">
                        {pack.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs font-bold text-[#615a7a]">Custom amount:</span>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  step={10}
                  value={selectedCredits}
                  onChange={(e) => setSelectedCredits(Math.max(10, Number(e.target.value) || 10))}
                  className="inspector-input !w-28 !py-1.5 !text-xs font-bold"
                />
                <span className="text-xs text-[#7c7498]">credits</span>
              </div>
            </div>

            <div>
              <label className="inspector-label" htmlFor="credit-request-note">
                {tab === "credits"
                  ? "Message to Admin (optional)"
                  : "Your message to Admin about credit pricing"}
              </label>
              <textarea
                id="credit-request-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  tab === "credits"
                    ? "e.g. Hi Admin, I finished building my website and need +10 credits to download the ZIP file!"
                    : "e.g. Hi Admin, please share the price for 40 or 100 credits and how I can pay so you can add them to my account."
                }
                className="inspector-input !text-xs"
              />
            </div>

            {!isSignedIn ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                <strong>Tip:</strong> You are currently in guest mode.{" "}
                <Link href="/sign-in" className="font-extrabold text-[#6d5ae6] underline">
                  Sign in to your account
                </Link>{" "}
                so the Admin can add credits directly to your account balance ({userEmail || "your email"}).
              </div>
            ) : (
              <div className="text-[11px] text-[#746c90]">
                Signed in as <strong className="text-[#261f3f]">{userEmail}</strong> — once the Admin approves or you purchase credits, they are added straight to this account.
              </div>
            )}

            {resultMessage ? (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold leading-relaxed text-emerald-900"
              >
                <CheckCircle2 size={16} className="mt-0.5 flex-none text-emerald-600" />
                <span>{resultMessage}</span>
              </div>
            ) : null}

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
              >
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button type="button" className="btn-app ghost" onClick={onClose}>
                Continue editing
              </button>
              <button
                type="submit"
                disabled={sending}
                className="btn-app primary !px-5 !py-2.5"
              >
                {sending ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : tab === "credits" ? (
                  <Download size={15} />
                ) : (
                  <Send size={15} />
                )}
                <span>
                  {sending
                    ? "Sending to Admin…"
                    : tab === "credits"
                      ? `Request +${selectedCredits} Credits from Admin`
                      : `Message Admin for ${selectedCredits} Credits Pricing`}
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
