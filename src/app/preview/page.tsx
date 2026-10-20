"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";
import { dbGet, getMyPlan } from "@/lib/db";
import { pageFileName } from "@/lib/tree";
import type { Page, Project } from "@/lib/schema";
import { SiteChrome, SiteStyleTag } from "@/components/site/SiteChrome";
import { SiteBody } from "@/components/site/renderers";

export default function PreviewPage() {
  const [data, setData] = useState<{ project: Project; page: Page } | null>(null);
  const [error, setError] = useState("");
  const [watermark, setWatermark] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("project");
      if (!id) { setError("No website was selected for preview."); return; }
      const project = await dbGet(id);
      if (!project) { setError("This website is not available in this browser."); return; }
      const pageId = params.get("page");
      const page = project.pages.find((p) => p.id === pageId) || project.pages[0];
      if (alive && page) {
      setData({ project, page });
      setWatermark((await getMyPlan()) !== "pro");
    }
    };
    void load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!data) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const toggle = target.closest("[data-nav-toggle]");
      if (toggle) {
        toggle.closest(".wk-navbar-inner")?.querySelector("[data-nav-links]")?.classList.toggle("wk-open");
      }
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (anchor) {
        const href = anchor.getAttribute("href") || "";
        if (href && !href.startsWith("#") && !/^(https?:|mailto:|tel:|sms:|javascript:)/i.test(href) && anchor.target !== "_blank") {
          event.preventDefault();
          const file = href.split(/[?#]/)[0].split("/").pop() || "index.html";
          const nextPage = data.project.pages.find((p) => pageFileName(p, data.project.pages) === file);
          if (nextPage) {
            setData({ project: data.project, page: nextPage });
            window.history.replaceState(null, "", `/preview?project=${encodeURIComponent(data.project.id)}&page=${encodeURIComponent(nextPage.id)}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }
      const close = target.closest("[data-popup-close]");
      const popup = target.closest("[data-popup]");
      if (close || (popup && target === popup)) (popup as HTMLElement | null)?.remove();
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const email = form?.getAttribute?.("data-mailto");
      if (!email) return;
      event.preventDefault();
      const body = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input,textarea,select"))
        .filter((field) => field.name)
        .map((field) => `${field.name}: ${field.value}`)
        .join("\n");
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("Message from " + location.hostname)}&body=${encodeURIComponent(body)}`;
    };
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);

    const popup = document.querySelector<HTMLElement>("[data-popup]");
    if (popup) {
      const delay = (Number(popup.dataset.delay) || 3) * 1000;
      const timer = window.setTimeout(() => { popup.style.display = ""; }, delay);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener("click", onClick);
        document.removeEventListener("submit", onSubmit);
      };
    }
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const tick = () => document.querySelectorAll<HTMLElement>("[data-countdown]").forEach((el) => {
      const target = new Date(el.getAttribute("data-countdown") || "").getTime();
      if (Number.isNaN(target)) return;
      const diff = Math.max(0, target - Date.now());
      const values = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        mins: Math.floor(diff / 60000) % 60,
        secs: Math.floor(diff / 1000) % 60,
      };
      Object.entries(values).forEach(([key, value]) => {
        const node = el.querySelector<HTMLElement>(`[data-cd="${key}"]`);
        if (node) node.textContent = String(value).padStart(2, "0");
      });
    });
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [data]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5fd] p-5">
        <section className="max-w-md rounded-2xl border border-[#e5e1ef] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><TriangleAlert size={24} /></div>
          <h1 className="mt-4 text-xl font-extrabold">Preview unavailable</h1>
          <p className="mt-2 text-sm text-[#6c668a]">{error}</p>
          <Link href="/projects" className="btn-app primary mt-5"><ArrowLeft size={14} /> My websites</Link>
        </section>
      </main>
    );
  }

  if (!data) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f5fd]"><span className="flex items-center gap-2 text-sm text-[#77708f]"><LoaderCircle className="animate-spin text-[#6d5ae6]" size={17} /> Preparing your preview…</span></main>;
  }

  return (
    <main className="preview-page">
      <div className="preview-topbar">
        <div className="flex min-w-0 items-center gap-2">
          <span className="preview-w-mark"><Sparkles size={13} /></span>
          <strong className="truncate">{data.project.name}</strong>
          <span className="preview-page-label">· {data.page.name} preview</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/builder?project=${encodeURIComponent(data.project.id)}`} className="btn-app ghost !py-1.5 !text-xs"><ArrowLeft size={13} /> Back to editor</Link>
          <button className="preview-open-button" onClick={() => window.open(`/preview?project=${encodeURIComponent(data.project.id)}&page=${encodeURIComponent(data.page.id)}`, "_blank", "noopener,noreferrer")} title="Open preview in a new tab"><ExternalLink size={14} /></button>
        </div>
      </div>
      <div className="preview-site-wrap">
        <SiteStyleTag />
        <SiteChrome project={data.project} watermark={watermark}>
          <SiteBody blocks={data.page.blocks} mode="preview" />
        </SiteChrome>
      </div>
    </main>
  );
}
