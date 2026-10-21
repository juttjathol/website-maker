"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Eye, LoaderCircle, Rocket, Sparkles, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/site/BrandLogo";
import { TEMPLATES, type TemplateInfo } from "@/lib/templates";
import type { Project } from "@/lib/schema";
import { dbPut } from "@/lib/db";
import { SiteChrome, SiteStyleTag } from "@/components/site/SiteChrome";
import { SiteBody } from "@/components/site/renderers";
import { cx } from "@/lib/util";
import { AccountMenu } from "@/components/account/AccountMenu";

const FILTERS = ["All", ...Array.from(new Set(TEMPLATES.map((template) => template.category)))];

export default function TemplatesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [preview, setPreview] = useState<{ template: TemplateInfo; project: Project } | null>(null);
  const [creating, setCreating] = useState("");
  const started = useRef(false);

  const openTemplate = useCallback(async (template: TemplateInfo) => {
    const project = template.make();
    await dbPut(project);
    router.push(`/builder?project=${encodeURIComponent(project.id)}`);
  }, [router]);

  const startTemplate = useCallback(async (template: TemplateInfo) => {
    setCreating(template.id);
    await openTemplate(template);
  }, [openTemplate]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const id = new URLSearchParams(window.location.search).get("use");
    if (!id || !TEMPLATES.some((t) => t.id === id)) return;
    const template = TEMPLATES.find((t) => t.id === id)!;
    void openTemplate(template);
  }, [openTemplate]);

  const visible = useMemo(() => filter === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter), [filter]);

  const showPreview = (template: TemplateInfo) => {
    const project = template.make();
    setPreview({ template, project });
  };

  return (
    <main className="min-h-screen bg-[#f8f7fc]">
      <header className="sticky top-0 z-40 border-b border-[#ebe8f2] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <BrandMark size={32} />
            {BRAND.name}
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link href="/projects" className="btn-app ghost">My websites</Link>
            <Link href="/guide" className="btn-app ghost">Guide</Link>
            <AccountMenu />
            <Link href="/builder" className="btn-app primary"><Rocket size={14} /> Start building</Link>
          </nav>
        </div>
      </header>

      <section className="template-hero">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white"><ArrowLeft size={13} /> Back to home</Link>
          <div className="mt-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white"><Sparkles size={13} /> Ready-made, fully editable</div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">A beautiful start, <span className="text-[#c6bbff]">already made.</span></h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">Pick a design that feels like you. Every word, color, photo and section is yours to change — you can start editing in seconds.</p>
          </div>
          <div className="mt-9 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f} className={cx("template-filter", filter === f && "active")} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">{filter === "All" ? "All templates" : `${filter} templates`}</h2>
            <p className="mt-1 text-sm text-[#7b7590]">{visible.length} professional designs. Every page and block is editable.</p>
          </div>
          <Link href="/builder" className="hidden items-center gap-1.5 text-sm font-bold text-[#6d5ae6] sm:inline-flex">Start from scratch <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              loading={creating === template.id}
              onPreview={() => showPreview(template)}
              onUse={() => void startTemplate(template)}
            />
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-[#e8e4f2] bg-white p-6 text-center sm:p-8">
          <h3 className="text-lg font-extrabold">Have your own idea?</h3>
          <p className="mt-1 text-sm text-[#7b7590]">Start with a blank page and build it block by block.</p>
          <Link href="/builder" className="btn-app primary mt-4"><Rocket size={14} /> Build from scratch</Link>
        </div>
      </section>

      {preview ? (
        <div className="template-preview-modal" role="dialog" aria-modal="true" aria-label={`Preview ${preview.template.name}`}>
          <div className="template-preview-toolbar">
            <div className="flex min-w-0 items-center gap-2"><span className="template-preview-dot" /><strong className="truncate">{preview.template.name}</strong><span className="text-xs text-white/60">Preview</span></div>
            <div className="flex items-center gap-2">
              <button className="btn-app ghost !border-white/20 !bg-white/10 !text-white" onClick={() => { const t = preview.template; setPreview(null); void startTemplate(t); }}><Rocket size={13} /> Use this design</button>
              <button className="template-preview-close" onClick={() => setPreview(null)} aria-label="Close preview"><X size={17} /></button>
            </div>
          </div>
          <div className="template-preview-scroll">
            <SiteStyleTag />
            <SiteChrome project={preview.project}>
              <SiteBody blocks={preview.project.pages[0].blocks} mode="preview" />
            </SiteChrome>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function TemplateCard({
  template,
  loading,
  onPreview,
  onUse,
}: {
  template: TemplateInfo;
  loading: boolean;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <article className="template-card">
      <button className="template-image" onClick={onPreview} aria-label={`Preview ${template.name}`}>
        <Image src={template.image} alt="" width={800} height={500} className="h-full w-full object-cover" />
        <span className="template-image-overlay"><Eye size={16} /> Preview design</span>
        <span className="template-category" style={{ background: template.accent }}>{template.category}</span>
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-extrabold">{template.name}</h3>
            <p className="mt-1 text-[13px] text-[#7b7590]">{template.tagline}</p>
          </div>
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#f1effa] text-[#6d5ae6]"><Check size={15} /></span>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-app ghost flex-1 !justify-center" onClick={onPreview}><Eye size={13} /> Preview</button>
          <button className="btn-app primary flex-1 !justify-center" onClick={onUse} disabled={loading}>
            {loading ? <LoaderCircle size={13} className="animate-spin" /> : <Rocket size={13} />}
            {loading ? "Opening…" : "Use template"}
          </button>
        </div>
      </div>
    </article>
  );
}
