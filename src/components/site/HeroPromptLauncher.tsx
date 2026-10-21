"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { STARTER_CHAT_PROMPTS } from "@/lib/text-to-build";

export function HeroPromptLauncher() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const launch = (text: string) => {
    const clean = text.trim();
    if (!clean) {
      router.push("/builder");
      return;
    }
    router.push(`/builder?prompt=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="mt-7 rounded-2xl border border-[#dcd4f7] bg-white/90 p-3.5 shadow-[0_18px_50px_rgba(88,69,210,0.12)] backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-[#5243c2]">
        <span className="inline-flex items-center gap-1.5">
          <Wand2 size={14} /> New: Text-to-Build AI Chat — describe your website &amp; it builds itself
        </span>
        <span className="hidden rounded-full bg-[#efedfc] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6d5ae6] sm:inline-block">
          Instant
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          launch(prompt);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Build a cozy coffee shop called Velvet Roast with menu, gallery & reviews…"
          aria-label="Describe your website to build it automatically"
          className="min-w-0 flex-1 rounded-xl border border-[#e2dcf2] bg-[#fbfaff] px-3.5 py-3 text-sm text-[#1e1833] outline-none transition focus:border-[#6d5ae6] focus:bg-white focus:ring-3 focus:ring-[#6d5ae6]/15"
        />
        <button
          type="submit"
          className="btn-app primary !rounded-xl !px-5 !py-3 !text-sm"
        >
          <Sparkles size={15} />
          <span>{prompt.trim() ? "Generate Website" : "Open AI Builder"}</span>
          <ArrowRight size={15} />
        </button>
      </form>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[#7d7599]">Try:</span>
        {STARTER_CHAT_PROMPTS.slice(0, 4).map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => launch(item.prompt)}
            className="rounded-full border border-[#e6e1f4] bg-[#f8f6fe] px-2.5 py-1 text-[11px] font-semibold text-[#4b4269] transition hover:border-[#6d5ae6] hover:bg-[#efecfe] hover:text-[#5744d4]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
