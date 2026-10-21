"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Check, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import type { Project } from "@/lib/schema";
import { useEditor } from "@/lib/store";
import {
  applyPromptToProject,
  STARTER_CHAT_PROMPTS,
} from "@/lib/text-to-build";

interface ChatTurn {
  id: string;
  role: "assistant" | "user";
  text: string;
  changes?: string[];
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  "Add a pricing section with 3 plans",
  "Switch to Midnight Neon dark mode",
  "Add customer testimonials and FAQ",
];

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-extrabold text-[#221b38]">{part.slice(2, -2)}</strong>;
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
  const [liveMode, setLiveMode] = useState(true);
  const [liveStatus, setLiveStatus] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Tell me about the website you want to build — your business, style, colors, or sections. As you describe it, I’ll build and update it live on your canvas!",
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const consumedInitialRef = useRef(false);
  const lastLivePromptRef = useRef("");

  const runPrompt = useCallback((rawPrompt: string, source: "chat" | "live" = "chat") => {
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
      setLiveStatus(result.changes.slice(0, 2).join(" · ") || "Canvas updated live");
    }
  }, [applyProjectSnapshot, plan, project]);

  useEffect(() => {
    if (initialPrompt && !consumedInitialRef.current) {
      consumedInitialRef.current = true;
      runPrompt(initialPrompt, "chat");
      onPromptConsumed?.();
    }
  }, [initialPrompt, onPromptConsumed, runPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  // Live build as user describes their website when liveMode is enabled
  useEffect(() => {
    if (!liveMode) return;
    const trimmed = input.trim();
    if (trimmed.length < 18 || trimmed === lastLivePromptRef.current) return;
    const timer = window.setTimeout(() => {
      runPrompt(trimmed, "live");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [input, liveMode, runPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    runPrompt(trimmed, "chat");
  };

  return (
    <div className="chat-builder-panel flex flex-1 flex-col min-h-0">
      <div className="border-b border-[#e8e4f2] bg-gradient-to-r from-[#f6f3ff] via-[#fbfaff] to-[#fff5ef] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#6d5ae6] text-white shadow-sm">
              <Sparkles size={14} />
            </span>
            <div>
              <h2 className="text-xs font-extrabold text-[#211b38]">Text-to-Build Chat</h2>
              <p className="text-[10.5px] text-[#787094]">Describe it — watch it build itself</p>
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

        <label className="mt-2.5 flex cursor-pointer items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#5b5377] border border-[#e7e2f3]">
          <span className="flex items-center gap-1.5">
            <Wand2 size={12} className="text-[#6d5ae6]" />
            Auto-build on canvas while I type
          </span>
          <input
            type="checkbox"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
            className="accent-[#6d5ae6]"
          />
        </label>
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
                ? "ml-5 rounded-2xl rounded-br-sm bg-[#6d5ae6] px-3 py-2.5 text-xs leading-relaxed text-white shadow-sm"
                : "mr-2 rounded-2xl rounded-bl-sm border border-[#e7e3f3] bg-white p-3 text-xs leading-relaxed text-[#474060] shadow-xs"
            }
          >
            <div>{turn.role === "assistant" ? renderFormattedText(turn.text) : turn.text}</div>

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

      <form onSubmit={handleSubmit} className="border-t border-[#e7e4f0] bg-white p-2.5">
        {liveStatus ? (
          <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-[#f3f0ff] px-2.5 py-1 text-[10px] font-bold text-[#5a47d0]">
            <Sparkles size={11} /> Live updated: {liveStatus}
          </div>
        ) : null}
        <div className="relative">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe your website or ask for a change… e.g. “Build a cozy bakery called Sweet Crumb with menu, gallery & pricing”"
            aria-label="Describe your website to build it"
            className="inspector-input !pr-10 resize-none !text-xs"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send prompt to build website"
            title="Build / update website"
            className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-[#6d5ae6] text-white transition hover:bg-[#5845d0] disabled:opacity-40"
          >
            <ArrowUp size={14} />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#8d85ab]">
          <span>Press Enter to apply · Shift+Enter for new line</span>
          <span>100% free</span>
        </div>
      </form>
    </div>
  );
}
