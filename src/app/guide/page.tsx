"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Cloud, Eye, Image as ImageIcon, LayoutTemplate, Rocket, ShoppingBag, Sparkles, Type } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";

const GUIDE_STEPS = [
  {
    id: "start",
    label: "Choose a starting point",
    icon: LayoutTemplate,
    title: "Start with a design you like",
    intro: "You do not need to begin with a blank page. A template gives you a professional structure that you can change completely.",
    details: ["Open the template gallery and filter by the kind of site you are building.", "Choose Preview to look around before committing.", "Select Use this template to create your own editable copy."],
    action: { href: "/templates", label: "Browse the templates" },
  },
  {
    id: "edit",
    label: "Change words and pictures",
    icon: Type,
    title: "Make the page sound and look like you",
    intro: "Every heading, paragraph, button and image is a block. Select one on the canvas, then edit its settings in the panel.",
    details: ["Click a heading to replace the sample copy with your own words.", "Select an image and upload a photo from your device, or paste an image address.", "Keep the first screen clear: tell visitors what you offer and what they can do next."],
    action: { href: "/projects", label: "Open my websites" },
  },
  {
    id: "build",
    label: "Add and arrange sections",
    icon: Sparkles,
    title: "Add the sections your visitors need",
    intro: "A website is made from sections: a hero, services, testimonials, a contact form and more. Add only what helps visitors understand your offer.",
    details: ["Open the Add panel and drag a block onto the page.", "Drag blocks up or down to change their order. Use the layers panel if a block is difficult to select.", "Keep the navigation simple and give important buttons a clear label."],
    action: { href: "/projects", label: "Continue editing" },
  },
  {
    id: "preview",
    label: "Check and save your work",
    icon: Eye,
    title: "Check the layout before sharing",
    intro: "Your website should be comfortable to read on a phone, tablet and computer. Webloom saves as you work; the save indicator tells you where the latest copy lives.",
    details: ["Use the device buttons to review computer, tablet and phone widths.", "Read the page once from top to bottom and check every link and button.", "Guest projects stay in this browser. Sign in with email if you want cloud sync across devices."],
    action: { href: "/sign-in", label: "Set up email sync" },
  },
  {
    id: "publish",
    label: "Publish a regular website",
    icon: Rocket,
    title: "Download and put the website online",
    intro: "A regular Webloom export is a static website ZIP. You can upload its files to a static host such as Netlify, Cloudflare Pages or GitHub Pages.",
    details: ["Open your project and choose Download to create a website ZIP.", "Extract the ZIP on your computer. The folder contains index.html and your site assets.", "Upload the extracted site folder to your host, then open the address it gives you."],
    action: { href: "/projects", label: "Open my websites" },
  },
  {
    id: "shopify",
    label: "Use Shopify for your store",
    icon: ShoppingBag,
    title: "Export a real Shopify Online Store theme",
    intro: "For a Shopify store, use Shopify theme export—not the regular static-site ZIP. The theme includes Liquid layouts and templates for products, collections, cart, search and checkout handoff.",
    details: ["In the builder, choose Shopify to download a Shopify theme ZIP. Keep the ZIP compressed.", "In Shopify Admin, open Online Store → Themes → Add theme → Upload zip file.", "Add your products and collections, preview the unpublished theme, and configure payments and checkout in Shopify Admin."],
    action: { href: "/projects", label: "Open a project to export" },
  },
];

export default function GuidePage() {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const step = GUIDE_STEPS[active];
  const StepIcon = step.icon;
  const progress = Math.round((completed.length / GUIDE_STEPS.length) * 100);

  const markComplete = () => {
    setCompleted((current) => current.includes(step.id) ? current : [...current, step.id]);
    setActive((current) => Math.min(current + 1, GUIDE_STEPS.length - 1));
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f7fc] text-[#241e39]">
      <SiteHeader current="guide" />

      <section className="relative overflow-hidden bg-[#211b36] text-white">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#6d5ae6]/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 md:py-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/65 hover:text-white"><ArrowLeft size={13} /> Back home</Link>
          <div className="mt-7 flex max-w-3xl items-start gap-4">
            <div className="hidden h-12 w-12 flex-none place-items-center rounded-2xl bg-white/10 sm:grid"><CircleHelp size={23} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#c7bdff]">A friendly getting-started guide</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">Build your first website, one small step at a time.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">No coding vocabulary required. Follow the steps in order, or jump to the part you need. You can always come back here.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-7 px-5 py-9 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-12">
        <aside className="h-fit rounded-2xl border border-[#e8e4f2] bg-white p-4 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center justify-between px-2">
            <div><p className="text-xs font-extrabold uppercase tracking-wide text-[#77708d]">Your guide</p><p className="mt-1 text-sm font-bold">{completed.length} of {GUIDE_STEPS.length} steps done</p></div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#efedfc] text-xs font-extrabold text-[#6d5ae6]">{progress}%</div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eeeaf4]"><div className="h-full rounded-full bg-[#6d5ae6] transition-all" style={{ width: `${progress}%` }} /></div>
          <nav className="mt-4 grid gap-1" aria-label="Guide steps">
            {GUIDE_STEPS.map((item, index) => {
              const Icon = item.icon;
              const isDone = completed.includes(item.id);
              return <button key={item.id} onClick={() => setActive(index)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition ${active === index ? "bg-[#f0edff] text-[#5744d5]" : "text-[#625c76] hover:bg-[#f8f7fb]"}`}>
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg ${active === index ? "bg-white" : "bg-[#f3f1f7]"}`}>{isDone ? <Check size={15} /> : <Icon size={15} />}</span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold">{index + 1}. {item.label}</span><span className="mt-0.5 block text-[10px] text-[#89839c]">{isDone ? "Completed" : "Step-by-step"}</span></span>
              </button>;
            })}
          </nav>
          <div className="mt-4 rounded-xl bg-[#f7f6fb] p-3 text-[11px] leading-relaxed text-[#77708d]"><Cloud size={14} className="mb-1 text-[#6d5ae6]" /> Guest work saves in this browser. Cloud sync needs an email account and the Webloom service to be configured.</div>
        </aside>

        <article className="overflow-hidden rounded-3xl border border-[#e8e4f2] bg-white shadow-sm">
          <div className="border-b border-[#efedf4] bg-gradient-to-r from-[#faf9ff] to-white px-6 py-7 md:px-9 md:py-9">
            <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.14em] text-[#6d5ae6]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#efedfc]"><StepIcon size={17} /></span> Step {active + 1} · {step.label}</div>
            <h2 className="mt-5 max-w-2xl text-2xl font-extrabold tracking-tight md:text-3xl">{step.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#716b86] md:text-base">{step.intro}</p>
          </div>
          <div className="px-6 py-7 md:px-9 md:py-9">
            <ol className="grid gap-4">
              {step.details.map((detail, index) => <li key={detail} className="flex gap-3 text-sm leading-relaxed text-[#514b65]"><span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#efedfc] text-[11px] font-extrabold text-[#6d5ae6]">{index + 1}</span><span>{detail}</span></li>)}
            </ol>
            {step.id === "edit" ? <div className="mt-6 grid gap-3 rounded-2xl border border-[#eeeaf5] bg-[#faf9fc] p-4 sm:grid-cols-2"><div className="flex gap-3"><span className="text-[#6d5ae6]"><Type size={16} /></span><span className="text-xs leading-relaxed text-[#6f6984]"><strong className="block text-[#332d48]">Write for people</strong>Short, clear sentences are easier to scan.</span></div><div className="flex gap-3"><span className="text-[#6d5ae6]"><ImageIcon size={16} /></span><span className="text-xs leading-relaxed text-[#6f6984]"><strong className="block text-[#332d48]">Use your own images</strong>Choose clear photos you have permission to use.</span></div></div> : null}
            {step.id === "shopify" ? <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"><strong>Good to know:</strong> Shopify manages products, inventory, payment providers, shipping, taxes and checkout in your Shopify Admin. The Webloom theme is the design and storefront layer; it does not configure those store services.</div> : null}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#efedf4] pt-5">
              <button className="btn-app ghost" onClick={() => setActive((current) => Math.max(0, current - 1))} disabled={active === 0}><ArrowLeft size={14} /> Previous</button>
              <div className="flex flex-wrap gap-2">
                <Link className="btn-app ghost" href={step.action.href}>{step.action.label} <ArrowRight size={14} /></Link>
                <button className="btn-app primary" onClick={markComplete} disabled={completed.includes(step.id) && active === GUIDE_STEPS.length - 1}>{completed.includes(step.id) ? active === GUIDE_STEPS.length - 1 ? "Guide complete" : "Next step" : active === GUIDE_STEPS.length - 1 ? "Finish guide" : "Mark step complete"} <Check size={14} /></button>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
