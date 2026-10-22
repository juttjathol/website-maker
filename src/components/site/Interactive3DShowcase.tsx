"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Boxes, Orbit, Pause, Play, Rocket, RotateCcw, Sparkles, Wand2 } from "lucide-react";

interface Object3D {
  name: string;
  shape: "cube" | "diamond" | "panel";
  color: string;
  glow: string;
  x: number;
  y: number;
  z: number;
  size: number;
  rx: number;
  ry: number;
  rz: number;
}

interface Preset3D {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  background: string;
  gridColor: string;
  ringColor: string;
  prompt: string;
  objects: Object3D[];
}

const PRESETS_3D: Preset3D[] = [
  {
    id: "cosmic",
    name: "Cosmic Prism",
    badge: "Holographic 3D",
    tagline: "Multi-axis rotating hyper-cubes, floating diamond core, and orbital light rings.",
    background: "radial-gradient(circle at 50% 35%, rgba(124,58,237,0.42), rgba(14,10,34,0.98) 72%)",
    gridColor: "rgba(139,92,246,0.26)",
    ringColor: "rgba(56,189,248,0.45)",
    prompt: "Build a futuristic AI studio website called Cosmic Prism with dark neon colors, features, pricing and 3D motion graphics",
    objects: [
      { name: "Core Hypercube", shape: "cube", color: "#8b5cf6", glow: "#a78bfa", x: 50, y: 48, z: 36, size: 96, rx: -24, ry: 38, rz: 0 },
      { name: "Cyan Diamond", shape: "diamond", color: "#06b6d4", glow: "#22d3ee", x: 24, y: 38, z: 65, size: 68, rx: 28, ry: -32, rz: 45 },
      { name: "Coral Prism", shape: "cube", color: "#f97316", glow: "#fb923c", x: 77, y: 60, z: 48, size: 72, rx: -18, ry: -44, rz: 14 },
      { name: "Glass Portal", shape: "panel", color: "#6366f1", glow: "#818cf8", x: 68, y: 28, z: -20, size: 84, rx: 16, ry: -28, rz: -8 },
      { name: "Violet Satellite", shape: "diamond", color: "#ec4899", glow: "#f472b6", x: 28, y: 68, z: 22, size: 54, rx: -30, ry: 25, rz: 45 },
    ],
  },
  {
    id: "solar",
    name: "Solar Monoliths",
    badge: "Warm Kinetic",
    tagline: "Architectural glass panels and golden cubes suspended in warm studio light.",
    background: "radial-gradient(circle at 50% 30%, rgba(234,88,12,0.38), rgba(24,13,18,0.98) 74%)",
    gridColor: "rgba(251,146,60,0.25)",
    ringColor: "rgba(251,191,36,0.45)",
    prompt: "Build a luxury architecture & creative agency website called Solar Monolith with warm amber palette, portfolio gallery and 3D motion graphics",
    objects: [
      { name: "Amber Monolith", shape: "panel", color: "#f59e0b", glow: "#fbbf24", x: 50, y: 48, z: 40, size: 104, rx: -14, ry: 32, rz: 0 },
      { name: "Terracotta Cube", shape: "cube", color: "#ea580c", glow: "#fb923c", x: 26, y: 54, z: 58, size: 78, rx: -26, ry: -35, rz: 10 },
      { name: "Rose Diamond", shape: "diamond", color: "#e11d48", glow: "#fb7185", x: 75, y: 40, z: 64, size: 68, rx: 22, ry: 40, rz: 45 },
      { name: "Gold Satellite", shape: "cube", color: "#d97706", glow: "#fcd34d", x: 70, y: 68, z: 18, size: 56, rx: 18, ry: -22, rz: -15 },
    ],
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    badge: "Botanical 3D",
    tagline: "Bio-luminescent emerald crystals and mint floating geometry with zero runtime bloat.",
    background: "radial-gradient(circle at 50% 35%, rgba(16,185,129,0.36), rgba(7,23,22,0.98) 74%)",
    gridColor: "rgba(52,211,153,0.24)",
    ringColor: "rgba(45,212,191,0.42)",
    prompt: "Build a clean climate-tech website called Emerald Matrix with botanical green colors, features, metrics and 3D motion graphics",
    objects: [
      { name: "Jade Crystal", shape: "diamond", color: "#10b981", glow: "#34d399", x: 50, y: 46, z: 50, size: 94, rx: -25, ry: 42, rz: 45 },
      { name: "Teal Cube", shape: "cube", color: "#0d9488", glow: "#2dd4bf", x: 25, y: 46, z: 32, size: 74, rx: 20, ry: -36, rz: 8 },
      { name: "Sky Panel", shape: "panel", color: "#0284c7", glow: "#38bdf8", x: 75, y: 52, z: 44, size: 86, rx: -18, ry: -30, rz: -6 },
      { name: "Lime Core", shape: "cube", color: "#65a30d", glow: "#a3e635", x: 34, y: 70, z: 64, size: 54, rx: -30, ry: 28, rz: 18 },
    ],
  },
  {
    id: "cyber",
    name: "Cyber Obsidian",
    badge: "Pro Dark Mode",
    tagline: "High-contrast obsidian blocks with electric magenta and cobalt 3D perspective depth.",
    background: "radial-gradient(circle at 50% 35%, rgba(217,70,239,0.34), rgba(9,9,19,0.99) 75%)",
    gridColor: "rgba(217,70,239,0.25)",
    ringColor: "rgba(99,102,241,0.48)",
    prompt: "Build a dark cyberpunk product launch website called Obsidian Core with midnight neon theme, countdown and 3D motion graphics",
    objects: [
      { name: "Magenta Core", shape: "cube", color: "#d946ef", glow: "#f0abfc", x: 50, y: 48, z: 45, size: 92, rx: -28, ry: -38, rz: 12 },
      { name: "Cobalt Cube", shape: "cube", color: "#4f46e5", glow: "#818cf8", x: 24, y: 42, z: 62, size: 74, rx: 24, ry: 32, rz: -10 },
      { name: "Neon Diamond", shape: "diamond", color: "#06b6d4", glow: "#67e8f9", x: 76, y: 44, z: 54, size: 70, rx: -20, ry: 45, rz: 45 },
      { name: "Violet Slab", shape: "panel", color: "#7c3aed", glow: "#c4b5fd", x: 50, y: 72, z: 20, size: 82, rx: 32, ry: -18, rz: 0 },
    ],
  },
];

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

/** Decorative 3D cube badge for Hero & CTA sections */
export function Mini3DCube({
  size = 46,
  color = "#8b5cf6",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const half = size / 2;
  return (
    <div
      className={`wk-mini-3d-wrap pointer-events-none select-none ${className}`}
      style={{ width: size, height: size, perspective: 500 }}
      aria-hidden="true"
    >
      <div
        className="wk-mini-3d-cube"
        style={
          {
            "--cube-size": `${size}px`,
            "--cube-half": `${half}px`,
            "--cube-color": color,
          } as React.CSSProperties
        }
      >
        {FACES.map((face) => (
          <span key={face} className={`wk-mini-3d-face wk-mini-3d-${face}`} />
        ))}
      </div>
    </div>
  );
}

export function Interactive3DShowcase() {
  const [presetId, setPresetId] = useState<string>("cosmic");
  const [speed, setSpeed] = useState<"normal" | "fast" | "paused">("normal");
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: -12, y: 16 });

  const preset = PRESETS_3D.find((p) => p.id === presetId) || PRESETS_3D[0];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Math.round(-ny * 34),
      y: Math.round(nx * 44),
    });
  };

  return (
    <section id="3d-motion" className="relative overflow-hidden bg-[#0d091d] py-16 text-white md:py-24">
      {/* Ambient 3D background lights */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#6d5ae6]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#e8622c]/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/15 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#d8b4fe]">
              <Boxes size={14} /> Interactive 3D Motion Graphics
            </div>
            <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-[2.65rem] md:leading-[1.1]">
              Bring your website to life with{" "}
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#38bdf8] to-[#fb923c] bg-clip-text text-transparent">
                real-time 3D motion
              </span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/75 sm:text-lg">
              Every 3D cube, diamond prism, and floating glass panel is pure hardware-accelerated CSS 3D — zero heavy WebGL scripts, instant loading on phones, and exported cleanly inside your website ZIP.
            </p>
          </div>

          {/* Preset switcher pills */}
          <div className="flex w-full flex-wrap gap-2 lg:w-auto">
            {PRESETS_3D.map((item) => {
              const active = item.id === preset.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPresetId(item.id)}
                  className={`flex-1 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition sm:flex-initial ${
                    active
                      ? "border-[#a78bfa] bg-[#6d5ae6] text-white shadow-[0_8px_25px_rgba(109,90,230,0.45)]"
                      : "border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive 3D Stage + Controls Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          {/* Interactive 3D Holo-Stage */}
          <div
            onPointerMove={handlePointerMove}
            className="wk-holo-stage-shell group relative min-h-[340px] cursor-grab overflow-hidden rounded-3xl border border-white/15 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] active:cursor-grabbing sm:min-h-[420px] sm:p-7"
            style={{ background: preset.background }}
          >
            {/* 3D Perspective Floor Grid */}
            <div
              className="wk-holo-floor-grid pointer-events-none"
              style={{ "--grid-line": preset.gridColor } as React.CSSProperties}
              aria-hidden="true"
            />

            {/* Top HUD overlay */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur-md">
                <span className="motion-pulse-dot" />
                <span>{preset.name}</span>
                <span className="text-white/50">·</span>
                <span className="text-[#c4b5fd]">{preset.badge}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white/75 backdrop-blur-md">
                <Orbit size={13} className="text-[#38bdf8]" />
                <span>Touch or move pointer to tilt 3D camera</span>
              </div>
            </div>

            {/* 3D Camera Rig */}
            <div
              className="wk-holo-camera-viewport"
              style={{ perspective: "980px" }}
            >
              <div
                className={`wk-holo-camera-rig ${
                  speed === "paused"
                    ? "is-paused"
                    : speed === "fast"
                      ? "is-fast"
                      : ""
                }`}
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }}
              >
                {/* 3D Orbital Rings */}
                <div
                  className="wk-holo-ring wk-holo-ring-1"
                  style={{ borderColor: preset.ringColor }}
                  aria-hidden="true"
                />
                <div
                  className="wk-holo-ring wk-holo-ring-2"
                  style={{ borderColor: preset.gridColor }}
                  aria-hidden="true"
                />

                {/* 3D Objects */}
                {preset.objects.map((obj, index) => {
                  const depth = obj.shape === "panel" ? Math.round(obj.size * 0.16) : obj.size;
                  return (
                    <div
                      key={`${preset.id}-${obj.name}`}
                      className="wk-holo-object"
                      style={
                        {
                          left: `${obj.x}%`,
                          top: `${obj.y}%`,
                          width: `${obj.size}px`,
                          height: `${obj.size}px`,
                          "--obj-size": `${obj.size}px`,
                          "--obj-half": `${depth / 2}px`,
                          "--obj-depth": `${depth}px`,
                          "--obj-color": obj.color,
                          "--obj-glow": obj.glow,
                          "--obj-x": `${obj.rx}deg`,
                          "--obj-y": `${obj.ry}deg`,
                          "--obj-z": `${obj.rz}deg`,
                          "--obj-distance": `${obj.z}px`,
                          animationDelay: `${index * -1.4}s`,
                        } as React.CSSProperties
                      }
                    >
                      <div className="wk-holo-float">
                        <div className="wk-holo-solid">
                          {FACES.map((face) => (
                            <span key={face} className={`wk-holo-face wk-3d-${face}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Caption inside stage */}
            <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-white/75">
              <span>{preset.tagline}</span>
              <span className="font-mono text-[11px] text-[#a78bfa]">
                tiltX: {tilt.x}° · tiltY: {tilt.y}°
              </span>
            </div>
          </div>

          {/* Right Control Deck */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">3D Motion Controls</h3>
                <button
                  type="button"
                  onClick={() => setTilt({ x: -12, y: 16 })}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/80 hover:bg-white/15"
                >
                  <RotateCcw size={12} /> Reset angle
                </button>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                Test the live 3D camera right here, or open this scene in the visual builder to customize every shape, depth, and color.
              </p>

              {/* Speed Mode Buttons */}
              <div className="mt-4">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/60">
                  Motion Speed
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {[
                    { id: "normal", label: "Smooth Orbit", Icon: Play },
                    { id: "fast", label: "Hyper Spin", Icon: Sparkles },
                    { id: "paused", label: "Freeze 3D", Icon: Pause },
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSpeed(id as typeof speed)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
                        speed === id
                          ? "border-[#a78bfa] bg-[#6d5ae6] text-white"
                          : "border-white/12 bg-white/5 text-white/75 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={12} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Angle Sliders (great for mobile touch!) */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-bold text-white/75">
                    <span>Camera Pitch (X)</span>
                    <span className="text-[#a78bfa]">{tilt.x}°</span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    value={tilt.x}
                    onChange={(e) => setTilt((prev) => ({ ...prev, x: Number(e.target.value) }))}
                    aria-label="Camera pitch X angle"
                    className="w-full accent-[#8b5cf6]"
                  />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-bold text-white/75">
                    <span>Camera Yaw (Y)</span>
                    <span className="text-[#38bdf8]">{tilt.y}°</span>
                  </div>
                  <input
                    type="range"
                    min={-55}
                    max={55}
                    value={tilt.y}
                    onChange={(e) => setTilt((prev) => ({ ...prev, y: Number(e.target.value) }))}
                    aria-label="Camera yaw Y angle"
                    className="w-full accent-[#38bdf8]"
                  />
                </div>
              </div>

              {/* Active Scene Objects List */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-white/60">
                  <span>Objects in Scene ({preset.objects.length})</span>
                  <span className="text-[#34d399]">6-Face CSS Solids</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {preset.objects.map((obj) => (
                    <div
                      key={obj.name}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs"
                    >
                      <span
                        className="h-3 w-3 flex-none rounded-sm shadow-xs"
                        style={{ background: obj.color }}
                      />
                      <span className="truncate font-semibold text-white/90">{obj.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="mt-5 grid gap-2">
              <Link
                href={`/builder?prompt=${encodeURIComponent(preset.prompt)}`}
                className="btn-app primary !w-full !justify-center !py-3 !text-sm shadow-[0_12px_30px_rgba(109,90,230,0.4)]"
              >
                <Wand2 size={16} /> Build Site with {preset.name} 3D
              </Link>
              <Link
                href="/builder"
                className="btn-app ghost !w-full !justify-center !border-white/20 !bg-white/8 !py-2.5 !text-xs !text-white hover:!bg-white/15"
              >
                <Rocket size={14} /> Open Visual 3D Editor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
