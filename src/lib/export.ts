"use client";
/**
 * Static export engine — renders the JSON project into a real static website
 * (HTML5 + CSS + tiny JS), zips it and downloads it. Runs fully client-side.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import JSZip from "jszip";
import type { Block, Page, Project } from "./schema";
import { SiteBody } from "@/components/site/renderers";
import { SITE_CSS } from "./site-css";
import { assert3DExportAllowed } from "./scene-3d";
import { getMyPlan } from "./db";
import { pageFileName, walkBlocks } from "./tree";
import { downloadBlob, escapeAttr, escapeHtml } from "./util";

/* ------------------------------ theme → CSS vars --------------------------- */

export function themeVars(theme: Project["theme"]): React.CSSProperties {
  return {
    ["--wk-primary" as any]: theme.primary,
    ["--wk-bg" as any]: theme.background,
    ["--wk-text" as any]: theme.text,
    ["--wk-muted" as any]: theme.muted,
    ["--wk-surface" as any]: theme.surface,
    ["--wk-accent" as any]: theme.accent,
    ["--wk-radius" as any]: `${theme.radius}px`,
    ["--wk-primary-contrast" as any]: "#ffffff",
    ["--wk-shadow" as any]: "0 10px 30px rgba(22,18,36,.08)",
    ["--wk-wrap" as any]: "1120px",
  };
}

export function themeFontClass(font: string): string {
  return `wk-font-${font || "modern"}`;
}

/* --------------------------------- runtime JS ------------------------------ */

export const SITE_JS = `/* Webloom site runtime — tiny progressive enhancements */
(function(){
  /* mobile nav */
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-nav-toggle]');
    if(t){var nav=t.closest('.wk-navbar-inner');if(!nav)return;
      var links=nav.querySelector('[data-nav-links]');if(links)links.classList.toggle('wk-open');}
  });

  /* countdown */
  function tick(){
    document.querySelectorAll('[data-countdown]').forEach(function(el){
      var target=new Date(el.getAttribute('data-countdown')||'').getTime();
      if(isNaN(target))return;
      var diff=Math.max(0,target-Date.now());
      var d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,
          m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60;
      var set=function(k,v){var n=el.querySelector('[data-cd="'+k+'"]');if(n)n.textContent=(v<10?'0':'')+v;};
      set('days',d);set('hours',h);set('mins',m);set('secs',s);
    });
  }
  tick();setInterval(tick,1000);

  /* popup */
  var pop=document.querySelector('[data-popup]');
  if(pop){
    var key='wk-pop-'+location.pathname;
    var dismissed=false;try{dismissed=sessionStorage.getItem(key)==='1';}catch(e){}
    if(!dismissed){
      pop.style.display='none';
      var delay=(parseInt(pop.getAttribute('data-delay'),10)||3)*1000;
      setTimeout(function(){pop.style.display='';},delay);
      pop.addEventListener('click',function(e){
        if(e.target.closest('[data-popup-close]')||e.target===pop){
          pop.style.display='none';try{sessionStorage.setItem(key,'1');}catch(err){}
        }
      });
    }
  }

  /* mailto forms */
  document.addEventListener('submit',function(e){
    var form=e.target;
    if(!(form instanceof HTMLFormElement))return;
    var mail=form.getAttribute('data-mailto');
    if(!mail)return;
    e.preventDefault();
    var lines=[];
    form.querySelectorAll('input,textarea,select').forEach(function(f){
      if(!f.name)return;
      lines.push(f.name+': '+(f.value||''));
    });
    var subject='Message from '+location.hostname;
    var body=lines.join('\\n');
    form.innerHTML='<div class="wk-faq-item" style="padding:18px 22px"><strong>Thank you!</strong> Your email app should open now — just press send.</div>';
    location.href='mailto:'+mail+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
})();`;

/* --------------------------------- page HTML ------------------------------- */

function faviconSvg(theme: Project["theme"]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${theme.primary}"/><circle cx="16" cy="16" r="7" fill="#fff"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Watermark HTML for free-plan static exports (matches <Watermark/>). */
export function watermarkHtml(): string {
  return `<div class="wk-watermark" aria-hidden="true"><span class="wk-watermark-dot"></span><span class="wk-watermark-text">WEBLOOM <b>by JATHOL</b></span></div>`;
}

export function renderPageHtml(project: Project, page: Page, opts: { watermark?: boolean } = {}): string {
  const title = page.seo?.title || project.seo?.title || project.name;
  const description = page.seo?.description || project.seo?.description || "";
  const inner = renderToStaticMarkup(
    React.createElement(
      "div",
      { className: `wk-site ${themeFontClass(project.theme.font)}`, style: themeVars(project.theme) },
      React.createElement(SiteBody as any, { blocks: page.blocks, mode: "static" as const }),
      opts.watermark ? React.createElement("div", {
        className: "wk-watermark",
        "aria-hidden": true,
      },
        React.createElement("span", { className: "wk-watermark-dot" }),
        React.createElement("span", { className: "wk-watermark-text" },
          "WEBLOOM ",
          React.createElement("b", null, "by JATHOL")))
      : null
    )
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:type" content="website">
<meta name="generator" content="Webloom">
<link rel="icon" href="${faviconSvg(project.theme)}">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
${inner}
<script src="assets/site.js"></script>
</body>
</html>`;
}

/* ------------------------------- image harvest ----------------------------- */

const IMG_KEYS = ["src", "image", "avatar", "logoImage"];

export function collectImages(blocks: Block[] | undefined, into: Set<string>) {
  walkBlocks(blocks || [], (b) => {
    for (const key of IMG_KEYS) {
      const v = (b.props as any)?.[key];
      if (typeof v === "string" && v && !v.startsWith("data:")) into.add(v);
    }
    for (const key of ["images", "members", "posts", "items"]) {
      const list = (b.props as any)?.[key];
      if (Array.isArray(list)) {
        for (const it of list) {
          if (it && typeof it === "object") {
            for (const k of IMG_KEYS) {
              const v = it[k];
              if (typeof v === "string" && v && !v.startsWith("data:")) into.add(v);
            }
          }
        }
      }
    }
  });
}

export function readmeTxt(project: Project): string {
  return `========================================
  ${project.name} — your new website
========================================

This folder is your complete website. It works on ANY web host
in the world. There is nothing to install.

----------------------------------------
OPTION 1 — The easiest way (2 minutes)
----------------------------------------
1. Go to:  https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. That's it! Netlify gives you a live link
   (like https://your-site.netlify.app) within seconds.
   You can later change the name of the link for free.

----------------------------------------
OPTION 2 — Free forever with GitHub Pages
----------------------------------------
1. Create a free account at https://github.com
2. Create a new repository called:  your-name.github.io
3. Upload ALL files from this folder into the repository
   (Settings → Pages → Source: "Deploy from a branch" → main)
4. Your site goes live at https://your-name.github.io

----------------------------------------
OPTION 3 — Any other host
----------------------------------------
Upload the folder contents to any hosting that serves
static files: Cloudflare Pages, Vercel, Hostinger, GoDaddy,
Namecheap, your university or company server, a USB stick…

----------------------------------------
Just want to look at it?
----------------------------------------
Double-click the file called  index.html  — it opens in your
browser exactly as the world will see it.

----------------------------------------
Files in this folder
----------------------------------------
index.html ……… your pages (one file per page)
assets/site.css… the design (colors, fonts, layout)
assets/site.js… tiny helper (menu, countdown, forms)
README.txt ……… this guide

Tip: keep file names as they are — the menu links use them.

Made with Webloom — the free drag & drop website builder.
`;
}

/* --------------------------------- the ZIP -------------------------------- */

async function fetchBinary(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function exportProjectZip(project: Project): Promise<void> {
  const zip = new JSZip();
  const imgFolder = zip.folder("assets");

  /* Free owners keep the watermark; Pro owners export without it. */
  const plan = await getMyPlan();
  assert3DExportAllowed(project, plan);
  const watermark = plan !== "pro";

  /* harvest + download local images, build rewrite map */
  const images = new Set<string>();
  for (const page of project.pages) collectImages(page.blocks, images);
  const rewrite = new Map<string, string>();
  let i = 0;
  for (const src of images) {
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) continue;
    const ext = (src.split(".").pop() || "jpg").split("?")[0].toLowerCase();
    const name = `img-${i++}.${ext === "svg" ? "svg" : ext === "png" ? "png" : ext === "webp" ? "webp" : ext === "gif" ? "gif" : "jpg"}`;
    const buf = await fetchBinary(src);
    if (buf) {
      imgFolder?.file(name, buf);
      rewrite.set(src, `assets/${name}`);
    }
  }

  /* pages */
  for (const page of project.pages) {
    let html = renderPageHtml(project, page, { watermark });
    for (const [from, to] of rewrite) {
      html = html.split(`src="${from}"`).join(`src="${to}"`);
    }
    zip.file(pageFileName(page, project.pages), html);
  }

  /* assets */
  zip.file("assets/site.css", SITE_CSS);
  zip.file("assets/site.js", SITE_JS);
  zip.file("README.txt", readmeTxt(project));

  const blob = await zip.generateAsync({ type: "blob" });
  const safe = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "my-website";
  downloadBlob(blob, `${safe}.zip`);
}
