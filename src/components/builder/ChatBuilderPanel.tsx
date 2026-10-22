"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import type { Project } from "@/lib/schema";
import { useEditor } from "@/lib/store";
import {
  applyPromptToProject,
  STARTER_CHAT_PROMPTS,
} from "@/lib/text-to-build";
import {
  analyzeReferenceWebsiteImage,
  buildProjectFromReferenceAnalysis,
} from "@/lib/image-to-website";

export const PENDING_REF_IMAGE_KEY = "webloom:pending-ref-image";

interface ChatTurn {
  id: string;
  role: "assistant" | "user";
  text: string;
  referenceImage?: string;
  paletteSwatches?: string[];
  changes?: string[];
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  "Add a 3D motion graphics scene",
  "Add a pricing section with 3 plans",
  "Switch to Midnight Neon dark mode",
  "Add customer testimonials and FAQ",
];

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-extrabold text-[#221b38]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function ChatBuilderPanel({
  project,
  initialPrompt,
  onPromptConsumed,
}: {
  project: Project;
  initialPrompt?: string;
  onPromptConsumed?: () => void;
}) {
  const plan = useEditor((s) => s.plan);
  const applyProjectSnapshot = useEditor((s) => s.applyProjectSnapshot);
  const undo = useEditor((s) => s.undo);
  const undoStack = useEditor((s) => s.undoStack);

  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedName, setAttachedName] = useState<string>("");
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [liveStatus, setLiveStatus] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Describe the website you want — or **upload a reference screenshot** of any website you like! I’ll copy its layout, colors, and sections onto your canvas so you can edit everything in your own way.",
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const consumedInitialRef = useRef(false);
  const lastLivePromptRef = useRef("");

  const runPrompt = useCallback(
    (rawPrompt: string, source: "chat" | "live" = "chat") => {
      const trimmed = rawPrompt.trim();
      if (!trimmed) return;
      const latestProject = useEditor.getState().project || project;
      const result = applyPromptToProject(latestProject, trimmed, { plan });
      applyProjectSnapshot(result.project, result.focusBlockId);

      if (result.focusBlockId) {
        window.setTimeout(() => {
          document
            .querySelector(`[data-block-id="${result.focusBlockId}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 80);
      }

      if (source === "chat") {
        lastLivePromptRef.current = trimmed;
        setLiveStatus("");
        setTurns((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: "user", text: trimmed },
          {
            id: `a-${Date.now() + 1}`,
            role: "assistant",
            text: result.reply,
            changes: result.changes,
            suggestions: result.suggestions,
          },
        ]);
        setInput("");
      } else {
        lastLivePromptRef.current = trimmed;
        setLiveStatus(
          result.changes.slice(0, 2).join(" · ") || "Canvas updated live"
        );
      }
    },
    [applyProjectSnapshot, plan, project]
  );

  const runImageAndPromptBuild = useCallback(
    async (imageDataUrl: string, rawPrompt: string) => {
      setAnalyzingImage(true);
      setLiveStatus("Analyzing reference website screenshot…");
      try {
        const analysis = await analyzeReferenceWebsiteImage(imageDataUrl);
        const latestProject = useEditor.getState().project || project;
        const result = buildProjectFromReferenceAnalysis(
          latestProject,
          analysis,
          rawPrompt,
          plan
        );
        applyProjectSnapshot(result.project, result.focusBlockId);

        if (result.focusBlockId) {
          window.setTimeout(() => {
            document
              .querySelector(`[data-block-id="${result.focusBlockId}"]`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 80);
        }

        const userLabel =
          rawPrompt.trim() ||
          "Copy this reference website layout and style onto my canvas";
        setTurns((prev) => [
          ...prev,
          {
            id: `u-${Date.now()}`,
            role: "user",
            text: userLabel,
            referenceImage: analysis.heroCropDataUrl || imageDataUrl,
          },
          {
            id: `a-${Date.now() + 1}`,
            role: "assistant",
            text: result.reply,
            paletteSwatches: [
              analysis.backgroundHex,
              analysis.surfaceHex,
              analysis.primaryHex,
              analysis.accentHex,
              analysis.textHex,
            ],
            changes: result.changes,
            suggestions: result.suggestions,
          },
        ]);
        setInput("");
        setAttachedImage(null);
        setAttachedName("");
        setLiveStatus("");
      } catch (err) {
        setLiveStatus("");
        setTurns((prev) => [
          ...prev,
          {
            id: `a-err-${Date.now()}`,
            role: "assistant",
            text:
              err instanceof Error
                ? `I couldn’t read that image (${err.message}). Try another screenshot or PNG/JPG file.`
                : "I couldn’t read that reference image. Try another screenshot or PNG/JPG file.",
          },
        ]);
      } finally {
        setAnalyzingImage(false);
      }
    },
    [applyProjectSnapshot, plan, project]
  );

  useEffect(() => {
    if (consumedInitialRef.current) return;
    let pendingImg: string | null = null;
    if (typeof window !== "undefined") {
      try {
        pendingImg = window.sessionStorage.getItem(PENDING_REF_IMAGE_KEY);
        if (pendingImg) {
          window.sessionStorage.removeItem(PENDING_REF_IMAGE_KEY);
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }

    if (pendingImg) {
      consumedInitialRef.current = true;
      void runImageAndPromptBuild(pendingImg, initialPrompt || "");
      onPromptConsumed?.();
      return;
    }

    if (initialPrompt) {
      consumedInitialRef.current = true;
      runPrompt(initialPrompt, "chat");
      onPromptConsumed?.();
    }
  }, [initialPrompt, onPromptConsumed, runImageAndPromptBuild, runPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  // Live build as user describes their website when liveMode is enabled (text-only)
  useEffect(() => {
    if (!liveMode || attachedImage) return;
    const trimmed = input.trim();
    if (trimmed.length < 18 || trimmed === lastLivePromptRef.current) return;
    const timer = window.setTimeout(() => {
      runPrompt(trimmed, "live");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [attachedImage, input, liveMode, runPrompt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please choose an image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(String(reader.result || ""));
      setAttachedName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            setAttachedImage(String(reader.result || ""));
            setAttachedName("Pasted website screenshot");
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (analyzingImage) return;
    if (attachedImage) {
      void runImageAndPromptBuild(attachedImage, input);
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) return;
    runPrompt(trimmed, "chat");
  };

  return (
    <div className="chat-builder-panel flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#e8e4f2] bg-gradient-to-r from-[#f6f3ff] via-[#fbfaff] to-[#fff5ef] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#6d5ae6] text-white shadow-sm">
              <Sparkles size={14} />
            </span>
            <div>
              <h2 className="text-xs font-extrabold text-[#211b38]">
                Text &amp; Image-to-Build AI
              </h2>
              <p className="text-[10.5px] text-[#787094]">
                Describe it or upload a reference screenshot
              </p>
            </div>
          </div>
          {undoStack.length > 0 ? (
            <button
              type="button"
              onClick={undo}
              className="inline-flex items-center gap-1 rounded-md border border-[#ded8ef] bg-white px-2 py-1 text-[10px] font-bold text-[#5e567a] hover:border-[#6d5ae6] hover:text-[#6d5ae6]"
              title="Undo last change"
            >
              <RotateCcw size={11} /> Undo
            </button>
          ) : null}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#d6cdf8] bg-white px-2.5 py-1.5 text-[10.5px] font-extrabold text-[#5744d4] shadow-2xs transition hover:border-[#6d5ae6] hover:bg-[#f5f2ff]"
          >
            <ImagePlus size={13} />
            <span>Upload Reference Pic</span>
          </button>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#e7e2f3] bg-white/85 px-2.5 py-1.5 text-[10px] font-semibold text-[#5b5377]">
            <span className="flex items-center gap-1 truncate">
              <Wand2 size={11} className="flex-none text-[#6d5ae6]" />
              <span className="truncate">Live build</span>
            </span>
            <input
              type="checkbox"
              checked={liveMode}
              onChange={(e) => setLiveMode(e.target.checked)}
              className="accent-[#6d5ae6]"
            />
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Starter ideas */}
        <div className="rounded-xl border border-[#e8e3f4] bg-[#faf9fe] p-2.5">
          <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#7c7399]">
            One-click website starters
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_CHAT_PROMPTS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => runPrompt(item.prompt, "chat")}
                className="rounded-lg border border-[#e2dcf2] bg-white px-2 py-1 text-left text-[10.5px] font-semibold text-[#3f3859] transition hover:border-[#6d5ae6] hover:bg-[#f3f0ff] hover:text-[#5744d4]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {turns.map((turn) => (
          <div
            key={turn.id}
            className={
              turn.role === "user"
                ? "ml-4 rounded-2xl rounded-br-sm bg-[#6d5ae6] px-3 py-2.5 text-xs leading-relaxed text-white shadow-sm"
                : "mr-2 rounded-2xl rounded-bl-sm border border-[#e7e3f3] bg-white p-3 text-xs leading-relaxed text-[#474060] shadow-xs"
            }
          >
            {turn.referenceImage ? (
              <div className="mb-2 overflow-hidden rounded-xl border border-white/25 bg-black/20">
                <img
                  src={turn.referenceImage}
                  alt="Uploaded reference website"
                  className="max-h-32 w-full object-cover"
                />
                <div className="px-2 py-1 text-[10px] font-bold text-white/90">
                  📸 Reference Website Pic
                </div>
              </div>
            ) : null}

            <div>
              {turn.role === "assistant"
                ? renderFormattedText(turn.text)
                : turn.text}
            </div>

            {turn.paletteSwatches && turn.paletteSwatches.length > 0 ? (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-[#ece8f6] bg-[#faf9fe] px-2.5 py-1.5">
                <span className="text-[10px] font-bold text-[#6e668a]">
                  Matched Palette:
                </span>
                {turn.paletteSwatches.map((hex, i) => (
                  <span
                    key={`${hex}-${i}`}
                    title={hex}
                    className="h-4 w-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ background: hex }}
                  />
                ))}
              </div>
            ) : null}

            {turn.changes && turn.changes.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {turn.changes.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-[#eef8f1] px-2 py-0.5 text-[10px] font-bold text-[#267347]"
                  >
                    <Check size={10} /> {c}
                  </span>
                ))}
              </div>
            ) : null}

            {turn.suggestions && turn.suggestions.length > 0 ? (
              <div className="mt-2.5 space-y-1 border-t border-[#f0edf8] pt-2">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#9289ad]">
                  Try saying next:
                </div>
                <div className="flex flex-wrap gap-1">
                  {turn.suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => runPrompt(sug, "chat")}
                      className="rounded-md bg-[#f5f3fc] px-2 py-1 text-left text-[10.5px] font-semibold text-[#5b49d0] transition hover:bg-[#e8e3fb]"
                    >
                      “{sug}”
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#e7e4f0] bg-white p-2.5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {attachedImage ? (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-[#cfc4f7] bg-[#f6f3ff] p-2">
            <img
              src={attachedImage}
              alt="Reference website preview"
              className="h-11 w-14 flex-none rounded-lg border border-[#ded6f8] object-cover"
            />
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[11px] font-extrabold text-[#241c3d]">
                {attachedName || "Reference website image"}
              </strong>
              <span className="block truncate text-[10px] text-[#685f88]">
                Ready to clone layout, colors &amp; sections
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedImage(null);
                setAttachedName("");
              }}
              aria-label="Remove reference image"
              className="grid h-6 w-6 flex-none place-items-center rounded-md text-[#6e668a] hover:bg-white hover:text-[#be423a]"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        {liveStatus ? (
          <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-[#f3f0ff] px-2.5 py-1 text-[10px] font-bold text-[#5a47d0]">
            <Sparkles size={11} /> {liveStatus}
          </div>
        ) : null}

        <div className="relative">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              attachedImage
                ? "Optional: Add your brand name or details (or press Enter now to build an exact copy of this reference pic)…"
                : "Describe your website, or click the image icon to upload a reference website screenshot to copy…"
            }
            aria-label="Describe your website or attach a reference image"
            className="inspector-input !pb-8 !pr-10 resize-none !text-xs"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload a reference website image to copy its design"
            aria-label="Upload a reference website image"
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md border border-[#e2dcf2] bg-[#f8f6fe] px-2 py-1 text-[10px] font-bold text-[#5a47d0] transition hover:border-[#6d5ae6] hover:bg-[#efecfe]"
          >
            <ImagePlus size={12} />
            <span>Reference Pic</span>
          </button>
          <button
            type="submit"
            disabled={analyzingImage || (!input.trim() && !attachedImage)}
            aria-label="Send prompt or reference image to build website"
            title="Build / update website"
            className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-[#6d5ae6] text-white transition hover:bg-[#5845d0] disabled:opacity-40"
          >
            {analyzingImage ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <ArrowUp size={14} />
            )}
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#8d85ab]">
          <span>Paste or upload any website pic to copy it</span>
          <span>Enter to build</span>
        </div>
      </form>
    </div>
  );
}
