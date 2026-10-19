"use client";
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, X } from "lucide-react";

export type GuideAction = "add" | "edit" | "theme" | "mobile" | "publish";

const STEPS: { title: string; description: string; action: GuideAction; actionLabel: string }[] = [
  { title: "Add a section", description: "Open the block library, then drag a section or content block onto your page. Try a hero, an image, or a call-to-action to get started.", action: "add", actionLabel: "Open the block library" },
  { title: "Make it yours", description: "Select any text or image on the page to edit it. Use the layers panel when a block is hard to select, then change its words, links and pictures in the inspector.", action: "edit", actionLabel: "Open layers" },
  { title: "Set your style", description: "Choose a color palette and font in the theme panel. You can also adjust spacing and colors for an individual block without changing the whole site.", action: "theme", actionLabel: "Open theme settings" },
  { title: "Check the phone view", description: "Use the device controls to switch between computer, tablet and phone. Preview before you publish so the page feels good on every screen.", action: "mobile", actionLabel: "Preview on a phone" },
  { title: "Publish or export", description: "Download a website ZIP for regular hosting, or create a Shopify theme ZIP for an online store. The publish guide walks you through the next steps.", action: "publish", actionLabel: "Open publishing guide" },
];

export function BuilderGuide({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (action: GuideAction) => void;
}) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const current = STEPS[step];

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="publish-modal guide-modal" role="dialog" aria-modal="true" aria-labelledby="builder-guide-title">
        <header className="publish-head">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-white/15"><CircleHelp size={20} /></div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-white/65">Webloom · beginner guide</div>
              <h2 id="builder-guide-title" className="truncate text-lg font-extrabold">Your first website, step by step</h2>
            </div>
          </div>
          <button className="publish-close" onClick={onClose} aria-label="Close guide"><X size={18} /></button>
        </header>

        <div className="publish-body">
          <div className="publish-step-content">
            <div className="flex items-center justify-between gap-3">
              <p className="publish-kicker !mb-0">STEP {step + 1} OF {STEPS.length}</p>
              <div className="flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
                {STEPS.map((item, index) => <span key={item.title} className={`h-1.5 w-7 rounded-full ${index <= step ? "bg-[#6d5ae6]" : "bg-[#e8e4f2]"}`} />)}
              </div>
            </div>
            <div className="guide-step-card">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#efedfc] text-sm font-extrabold text-[#6d5ae6]">{step + 1}</div>
              <h3 className="mt-4">{current.title}</h3>
              <p className="publish-copy">{current.description}</p>
            </div>
            <button className="btn-app primary !w-full !justify-center !py-3" onClick={() => { onAction(current.action); onClose(); }}>
              {current.actionLabel} <ArrowRight size={15} />
            </button>
            <div className="publish-actions">
              <button className="btn-app ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}><ArrowLeft size={14} /> Back</button>
              {step < STEPS.length - 1 ? (
                <button className="btn-app ghost" onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}>Next tip <ArrowRight size={14} /></button>
              ) : (
                <button className="btn-app ghost" onClick={() => { setStep(0); onClose(); }}>Finish <Check size={14} /></button>
              )}
            </div>
            <p className="publish-footnote">You can reopen this guide anytime with the <CircleHelp size={12} className="inline" /> button in the builder.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
