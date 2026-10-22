"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ImagePlus, Sparkles, Wand2, X } from "lucide-react";
import { STARTER_CHAT_PROMPTS } from "@/lib/text-to-build";
import { PENDING_REF_IMAGE_KEY } from "@/components/builder/ChatBuilderPanel";

export function HeroPromptLauncher() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refName, setRefName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const launch = (text: string) => {
    const clean = text.trim();
    if (refImage && typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(PENDING_REF_IMAGE_KEY, refImage);
      } catch {
        // Ignore sessionStorage errors
      }
      router.push(
        clean
          ? `/builder?prompt=${encodeURIComponent(clean)}`
          : `/builder?prompt=${encodeURIComponent("Copy my reference website image")}`
      );
      return;
    }
    if (!clean) {
      router.push("/builder");
      return;
    }
    router.push(`/builder?prompt=${encodeURIComponent(clean)}`);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRefImage(String(reader.result || ""));
      setRefName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mt-6 rounded-2xl border border-[#dcd4f7] bg-white/95 p-3.5 shadow-[0_18px_50px_rgba(88,69,210,0.12)] backdrop-blur-md sm:mt-7">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#5243c2]">
        <span className="inline-flex items-center gap-1.5">
          <Wand2 size={14} className="flex-none" />
          <span>Text &amp; Image-to-Build AI — describe your site or upload a reference pic</span>
        </span>
        <span className="hidden rounded-full bg-[#efedfc] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#6d5ae6] sm:inline-block">
          Instant Clone
        </span>
      </div>

      {refImage ? (
        <div className="mb-2.5 flex items-center gap-2.5 rounded-xl border border-[#cfc4f7] bg-[#f6f3ff] p-2">
          <img
            src={refImage}
            alt="Reference website"
            className="h-11 w-14 flex-none rounded-lg border border-[#ddd5f8] object-cover"
          />
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-xs font-extrabold text-[#241c3d]">
              {refName || "Reference website image"}
            </strong>
            <span className="block truncate text-[11px] text-[#685f88]">
              We’ll build an editable copy matching this screenshot’s layout &amp; colors
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefImage(null);
              setRefName("");
            }}
            aria-label="Remove reference image"
            className="grid h-7 w-7 flex-none place-items-center rounded-lg text-[#6e668a] hover:bg-white hover:text-[#be423a]"
          >
            <X size={15} />
          </button>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          launch(prompt);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelect}
        />
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              refImage
                ? "Optional: Add your brand name (or click Generate Copy now)…"
                : "e.g. Build a cozy coffee shop called Velvet Roast, or attach a reference pic…"
            }
            aria-label="Describe your website to build it automatically"
            className="w-full min-w-0 rounded-xl border border-[#e2dcf2] bg-[#fbfaff] py-3 pl-3.5 pr-28 text-sm text-[#1e1833] outline-none transition focus:border-[#6d5ae6] focus:bg-white focus:ring-3 focus:ring-[#6d5ae6]/15"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Upload a reference website image to copy its design"
            className="absolute right-2 inline-flex items-center gap-1 rounded-lg border border-[#ded6f8] bg-[#f4f1ff] px-2.5 py-1.5 text-[11px] font-extrabold text-[#5744d4] transition hover:border-[#6d5ae6] hover:bg-[#eae4ff]"
          >
            <ImagePlus size={13} />
            <span>Ref Pic</span>
          </button>
        </div>
        <button
          type="submit"
          className="btn-app primary !justify-center !rounded-xl !px-5 !py-3 !text-sm"
        >
          <Sparkles size={15} />
          <span>
            {refImage
              ? "Build Copy of Pic"
              : prompt.trim()
                ? "Generate Website"
                : "Open AI Builder"}
          </span>
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
