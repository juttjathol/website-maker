"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  FolderKanban,
  LayoutTemplate,
  Menu,
  Plus,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/site/BrandLogo";
import { AccountMenu } from "@/components/account/AccountMenu";

interface SiteHeaderProps {
  current?: "home" | "templates" | "projects" | "guide";
  onPrimaryClick?: () => void;
  primaryLabel?: string;
}

export function SiteHeader({
  current = "home",
  onPrimaryClick,
  primaryLabel,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#161224]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BrandMark size={34} />
          <span className="truncate">{BRAND.name}</span>
        </Link>

        {/* Desktop navigation */}
        {current === "home" ? (
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#5c5675] lg:flex">
            <a href="#features" className="transition hover:text-[#161224]">Features</a>
            <a href="#3d-motion" className="inline-flex items-center gap-1 font-semibold text-[#6d5ae6] transition hover:text-[#4c39c7]">
              <Boxes size={14} /> 3D Motion
            </a>
            <a href="#how" className="transition hover:text-[#161224]">How it works</a>
            <a href="#templates" className="transition hover:text-[#161224]">Templates</a>
            <Link href="/guide" className="transition hover:text-[#161224]">Guide</Link>
            <a href="#faq" className="transition hover:text-[#161224]">FAQ</a>
          </nav>
        ) : (
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/templates"
              className={`btn-app ghost ${current === "templates" ? "!border-[#cec4f8] !bg-[#f5f2ff] !text-[#5845d2]" : ""}`}
            >
              <LayoutTemplate size={14} /> Templates
            </Link>
            <Link
              href="/projects"
              className={`btn-app ghost ${current === "projects" ? "!border-[#cec4f8] !bg-[#f5f2ff] !text-[#5845d2]" : ""}`}
            >
              <FolderKanban size={14} /> My websites
            </Link>
            <Link
              href="/guide"
              className={`btn-app ghost ${current === "guide" ? "!border-[#cec4f8] !bg-[#f5f2ff] !text-[#5845d2]" : ""}`}
            >
              <BookOpen size={14} /> Guide
            </Link>
          </nav>
        )}

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {current === "home" ? (
            <Link href="/projects" className="btn-app ghost">
              My websites
            </Link>
          ) : null}
          <AccountMenu />
          {onPrimaryClick ? (
            <button type="button" className="btn-app primary" onClick={onPrimaryClick}>
              <Plus size={15} /> {primaryLabel || "Create a website"}
            </button>
          ) : (
            <Link href="/builder" className="btn-app primary">
              <Rocket size={14} /> {primaryLabel || "Start building"} <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Mobile compact actions + menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {onPrimaryClick ? (
            <button
              type="button"
              className="btn-app primary !px-3 !py-2 !text-xs"
              onClick={onPrimaryClick}
            >
              <Plus size={14} /> {primaryLabel || "New site"}
            </button>
          ) : (
            <Link href="/builder" className="btn-app primary !px-3 !py-2 !text-xs">
              <Rocket size={13} /> Build
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#e3dfed] bg-white text-[#29233d] shadow-2xs transition hover:border-[#6d5ae6] hover:text-[#6d5ae6]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down drawer */}
      {mobileMenuOpen ? (
        <div className="border-t border-[#ece9f5] bg-white/98 px-4 pb-5 pt-3 shadow-xl backdrop-blur-lg md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/builder?prompt=Build%20a%20modern%20website"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl border border-[#dcd4f7] bg-gradient-to-r from-[#f5f2ff] to-[#fff6f0] p-3 text-left"
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#6d5ae6] text-white">
                <Sparkles size={15} />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-xs font-extrabold text-[#1e1836]">AI Text-to-Build</strong>
                <small className="block truncate text-[10px] text-[#6d658a]">Chat to generate</small>
              </span>
            </Link>
            <Link
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl border border-[#e7e3f2] bg-[#faf9fe] p-3 text-left"
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#efedfc] text-[#6d5ae6]">
                <LayoutTemplate size={15} />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-xs font-extrabold text-[#1e1836]">12 Templates</strong>
                <small className="block truncate text-[10px] text-[#6d658a]">Ready-made sites</small>
              </span>
            </Link>
          </div>

          <nav className="mt-3 grid gap-1 text-sm font-semibold text-[#352e4d]">
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-[#f5f2ff]"
            >
              <span className="flex items-center gap-2.5">
                <FolderKanban size={16} className="text-[#6d5ae6]" /> My websites
              </span>
              <ArrowRight size={14} className="text-[#968eb0]" />
            </Link>
            <Link
              href="/guide"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-[#f5f2ff]"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen size={16} className="text-[#6d5ae6]" /> Getting started guide
              </span>
              <ArrowRight size={14} className="text-[#968eb0]" />
            </Link>
            {current === "home" ? (
              <div className="mt-1 flex flex-wrap gap-1.5 border-t border-[#f0edf7] pt-3">
                {[
                  ["#features", "Features"],
                  ["#3d-motion", "3D Motion Studio"],
                  ["#how", "How it works"],
                  ["#templates", "Templates"],
                  ["#faq", "FAQ"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full border border-[#e5e0f3] bg-[#faf9fe] px-3 py-1.5 text-xs font-bold text-[#524971] hover:border-[#6d5ae6] hover:text-[#6d5ae6]"
                  >
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </nav>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0edf7] pt-3">
            <AccountMenu />
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-app primary !px-4 !py-2 !text-xs"
            >
              <Rocket size={13} /> Open Visual Builder
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
