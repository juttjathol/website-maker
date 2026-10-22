import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Boxes, Check, CloudUpload, Download, LayoutTemplate,
  MousePointerClick, Palette, Rocket, Sparkles, Undo2, Wand2,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";
import { BrandMark } from "@/components/site/BrandLogo";
import { HeroPromptLauncher } from "@/components/site/HeroPromptLauncher";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Interactive3DShowcase, Mini3DCube } from "@/components/site/Interactive3DShowcase";

const FEATURES = [
  {
    icon: Wand2,
    title: "Text-to-Build AI Chat",
    text: "Just describe your website in plain English — like chatting with a friend — and watch your pages, sections, copy, and colors build themselves live.",
  },
  {
    icon: Boxes,
    title: "Interactive 3D Motion Graphics",
    text: "Add hardware-accelerated CSS 3D cubes, diamond crystals, and floating glass panels that orbit smoothly on phones and desktops with zero bloat.",
  },
  {
    icon: Palette,
    title: "One-click brand palettes",
    text: "Switch your entire site between Warm Espresso, Midnight Neon, Emerald Botanical, or Obsidian Luxe in one click — or customize every shade.",
  },
  {
    icon: MousePointerClick,
    title: "Easy drag, drop & 1-click reorder",
    text: "Drag blocks onto the page, insert ready-made section combos, or use quick up/down arrows to rearrange sections effortlessly on computer or phone.",
  },
  {
    icon: Undo2,
    title: "Autosave & unlimited undo",
    text: "Your work is saved automatically as you type or chat, with instant undo and redo. Experiment freely with zero risk.",
  },
  {
    icon: CloudUpload,
    title: "Download or export to Shopify",
    text: "Download clean static website files for any host, or generate a complete Shopify Online Store theme ZIP in one click.",
  },
];

const MARQUEE_ITEMS = [
  "✦ Text-to-Build AI Chat",
  "✦ Interactive 3D Motion Graphics",
  "✦ 30+ Drag & Drop Blocks",
  "✦ One-Click Designer Palettes",
  "✦ Quick Section Combos",
  "✦ Mobile-First Responsive Design",
  "✦ Static Website ZIP Export",
  "✦ Native Shopify Theme Export",
];

const STEPS = [
  {
    n: "1",
    title: "Chat or Drag to Design",
    text: "Describe your dream website in the AI Chat to generate it automatically, or pick a template and drag blocks into place.",
  },
  {
    n: "2",
    title: "Style & Add 3D Motion",
    text: "Click any text to rewrite it, apply one-click brand palettes, drop in 3D motion scenes, and preview on phone, tablet, and computer.",
  },
  {
    n: "3",
    title: "Publish Anywhere",
    text: "Export a ready-to-upload website ZIP or Shopify theme, then follow our plain-language publishing guide.",
  },
];

const FAQS = [
  {
    q: "How does Text-to-Build chat work?",
    a: "Open the builder and type what kind of website you want in the Chat tab — for example, 'Build a cozy bakery called Sweet Crumb with menu, gallery, pricing and contact'. Webloom immediately assembles tailored sections, headlines, and colors on your canvas. You can keep chatting to add 3D motion graphics, switch to dark mode, or rename your brand.",
  },
  {
    q: "Do I need to know anything about coding?",
    a: "Absolutely not. Webloom is built for people who have never made a website before. Everything is visual and conversational: chat to build, drag blocks, click text to edit it, and pick designer color palettes in one click.",
  },
  {
    q: "How much does it cost?",
    a: "The builder is free to use. You design your site, preview it and download the finished website as many times as you like. Putting the site online can also be free — hosts like Netlify and GitHub Pages host simple websites at no cost.",
  },
  {
    q: "Where will my website live? Do I need an account?",
    a: "You can build as a guest, and your projects stay in this browser. Webloom accounts are currently granted by an administrator; approved customers can sync small projects across devices within the published cloud limits. When you're ready, export clean website files for a host of your choice, or create a Shopify theme ZIP for your online store.",
  },
  {
    q: "Will my site and 3D motion graphics work on phones?",
    a: "Yes — every block and 3D motion scene is mobile-responsive out of the box. Your site automatically adjusts to look well-organized on phones, tablets, and large screens, and you can even edit directly from your phone.",
  },
  {
    q: "Can I edit my site later?",
    a: "Of course. Guest projects stay in this browser; approved accounts can sync projects within the account and platform storage limits. Make changes whenever you like, then export an updated ZIP. Keep an exported backup of work that matters.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* ============================ NAV ============================ */}
      <SiteHeader current="home" />

      {/* ============================ HERO ============================ */}
      <section className="grad-brand motion-hero-shell relative overflow-hidden">
        {/* Ambient motion graphics aurora orbs */}
        <div className="motion-orb motion-orb-violet pointer-events-none" aria-hidden="true" />
        <div className="motion-orb motion-orb-coral pointer-events-none" aria-hidden="true" />
        <div className="motion-grid-backdrop pointer-events-none" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-5 md:pb-20 md:pt-18">
          <div className="grid items-center gap-10 lg:grid-cols-[1.06fr_.94fr] lg:gap-12">
            <div>
              <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#6d5ae6]/25 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-[#5546c8] shadow-xs sm:text-sm">
                <Sparkles size={14} className="motion-spin-slow" /> Free to start · AI Text-to-Build · 3D Motion
              </div>
              <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-[#161224] sm:text-4xl md:text-[3.45rem]">
                Describe your website, <span className="text-grad">watch it bloom<br className="hidden md:block" /> in 3D &amp; motion</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5c5675] sm:mt-5 sm:text-lg">
                Chat with {BRAND.name} to generate a complete website automatically, or design
                visually with one-click brand styles, interactive 3D motion graphics, and drag &amp; drop blocks.
              </p>

              {/* Interactive Text-to-Build Launcher */}
              <HeroPromptLauncher />

              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <Link href="/builder" className="btn-app primary !justify-center !px-6 !py-3.5 !text-[15px]">
                  <Rocket size={17} /> Open Visual Builder
                </Link>
                <Link href="/templates" className="btn-app ghost !justify-center !px-6 !py-3.5 !text-[15px]">
                  <LayoutTemplate size={17} /> Browse 12 Templates
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#5c5675] sm:mt-6 sm:text-sm">
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Builds as you chat</span>
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Mobile &amp; 3D ready</span>
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Yours forever</span>
              </div>
            </div>

            {/* 3D Motion Graphics Interactive Visual Stage */}
            <div className="motion-stage relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-[#6d5ae6]/35 via-[#22d3ee]/20 to-[#e8622c]/30 blur-2xl" />
              <div className="motion-orbit-ring pointer-events-none" aria-hidden="true" />
              <div className="motion-orbit-ring-reverse pointer-events-none" aria-hidden="true" />

              {/* Floating 3D Cubes around the Hero Stage */}
              <Mini3DCube size={44} color="#8b5cf6" className="motion-hero-cube-top" />
              <Mini3DCube size={38} color="#f97316" className="motion-hero-cube-bottom" />

              <div className="motion-hero-card-3d relative overflow-hidden rounded-[22px] border border-white/70 bg-[#120e24] p-2 shadow-[0_32px_90px_rgba(22,18,36,.28)] sm:rounded-[24px] sm:p-2.5">
                <div className="mb-2 flex items-center justify-between gap-2 px-2 py-1 text-[11px] text-white/75">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2.5 w-2.5 flex-none rounded-full bg-[#fb7185]" />
                    <span className="h-2.5 w-2.5 flex-none rounded-full bg-[#fbbf24]" />
                    <span className="h-2.5 w-2.5 flex-none rounded-full bg-[#34d399]" />
                    <span className="ml-1.5 truncate font-semibold text-white/90">Webloom Studio · 3D + AI Canvas</span>
                  </div>
                  <span className="flex-none rounded-full bg-[#6d5ae6]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#ddd6fe]">
                    ⚡ Auto-Building
                  </span>
                </div>
                <Image
                  src="/images/landing-hero.jpg"
                  alt="Illustration of a website being built with drag and drop blocks, 3D scenes, and AI chat"
                  width={1200}
                  height={800}
                  priority
                  className="relative rounded-[14px] sm:rounded-[16px]"
                />
              </div>

              {/* Desktop Floating Motion Card 1: AI Chat Prompt Bubble */}
              <div className="motion-float-card motion-float-top-left">
                <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#5b47df]">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#6d5ae6] text-white">
                    <Wand2 size={13} />
                  </span>
                  <span>Text-to-Build Chat</span>
                  <span className="motion-pulse-dot ml-auto" />
                </div>
                <p className="mt-1.5 text-[11.5px] font-medium leading-snug text-[#251f3d]">
                  “Build a cozy coffee shop with warm espresso colors, 3D hero &amp; reviews”
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-[#eef8f1] px-2 py-0.5 text-[9.5px] font-bold text-[#1f7a45]">✓ Hero + 3D Scene</span>
                  <span className="rounded-full bg-[#f3f0ff] px-2 py-0.5 text-[9.5px] font-bold text-[#5b47df]">✓ Warm Espresso</span>
                </div>
              </div>

              {/* Desktop Floating Motion Card 2: One-Click Palette Switcher */}
              <div className="motion-float-card motion-float-bottom-right">
                <div className="flex items-center gap-2.5">
                  <BrandMark size={32} />
                  <div>
                    <div className="text-[11px] font-extrabold text-[#1f1935]">8 Designer Palettes + 3D</div>
                    <div className="text-[10px] text-[#6d658a]">One-click theme &amp; motion restyle</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  {["#6d5ae6", "#0b0a14", "#9c4a27", "#15803d", "#0284c7", "#e11d48", "#d4a853"].map((hex) => (
                    <span
                      key={hex}
                      className="h-4 w-4 rounded-full border border-black/15 shadow-2xs"
                      style={{ background: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile-organized 3D Feature Pills (visible on phones where floating overlays would clip) */}
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:hidden">
                <div className="rounded-2xl border border-[#e5dff6] bg-white/95 p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#5b47df]">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#6d5ae6] text-white">
                      <Wand2 size={13} />
                    </span>
                    <span>Text-to-Build AI Chat</span>
                    <span className="motion-pulse-dot ml-auto" />
                  </div>
                  <p className="mt-1 text-xs text-[#3b3358]">
                    Describe your business in plain English &amp; watch sections generate live.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e5dff6] bg-white/95 p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#1f1935]">
                    <BrandMark size={24} />
                    <span>3D Motion &amp; 8 Palettes</span>
                  </div>
                  <p className="mt-1 text-xs text-[#3b3358]">
                    Switch brand colors and add interactive 3D cubes &amp; crystals in one tap.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* mini stats */}
          <div className="mt-10 grid grid-cols-2 gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur sm:mt-14 sm:gap-4 sm:p-6 md:grid-cols-4">
            {[
              ["AI + 3D", "Chat, drag & 3D motion"],
              ["30+", "Ready-made blocks"],
              [String(TEMPLATES.length), "Designer templates"],
              ["0", "Lines of code needed"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/60 p-2.5 sm:bg-transparent sm:p-0">
                <div className="text-xl font-extrabold tracking-tight text-[#161224] sm:text-2xl">{v}</div>
                <div className="mt-0.5 text-xs text-[#5c5675] sm:text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== MOTION MARQUEE TICKER ====================== */}
      <div className="motion-marquee-bar" aria-label="Webloom capabilities">
        <div className="motion-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span key={idx} className="motion-marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ========================== FEATURES ========================== */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">Everything you need</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
            Professional tools, <span className="text-grad">zero learning curve</span>
          </h2>
          <p className="mt-3 text-base text-[#5c5675] sm:mt-4 sm:text-lg">
            We took everything complicated about building websites and made it
            conversational, 3D-ready, and visual — on both computer and mobile.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card-hover motion-3d-card rounded-2xl border border-[#eceaf4] bg-white p-6 sm:p-7"
            >
              <div className="motion-3d-icon grid h-12 w-12 place-items-center rounded-xl bg-[#efedfc] text-[#6d5ae6]">
                <f.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5c5675] sm:text-base">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INTERACTIVE 3D MOTION GRAPHICS SHOWCASE ================= */}
      <Interactive3DShowcase />

      {/* ========================== HOW IT WORKS ========================== */}
      <section id="how" className="bg-[#f7f5fd] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">How it works</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              From idea to online in <span className="text-grad">three steps</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3 md:gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="card-hover motion-3d-card relative rounded-2xl border border-[#e9e5f8] bg-white p-6 sm:p-8">
                <div className="motion-3d-icon grid h-11 w-11 place-items-center rounded-full bg-[#6d5ae6] text-lg font-extrabold text-white shadow-md">
                  {s.n}
                </div>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5c5675] sm:text-base">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-gradient-to-r from-[#6d5ae6] to-[#e8622c] p-6 text-white sm:mt-12 sm:p-8">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/20 sm:h-14 sm:w-14">
                <Download size={24} />
              </div>
              <div className="min-w-[200px] flex-1">
                <h3 className="text-lg font-bold sm:text-xl">Getting online is the easy part</h3>
                <p className="mt-1 text-sm text-white/85 sm:text-base">
                  One click gives you a downloadable website folder — plus a picture-perfect
                  guide that walks you through putting it online for free.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2.5 text-sm font-semibold sm:mt-6 sm:grid-cols-3 sm:gap-3">
              {[
                ["Netlify Drop", "Drag the folder → live in seconds"],
                ["GitHub Pages", "Free hosting, free forever"],
                ["Any host you like", "Your files, your rules"],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl bg-white/15 px-4 py-3">
                  <div>{t}</div>
                  <div className="mt-0.5 text-xs font-normal text-white/80 sm:text-sm">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================== TEMPLATES ========================== */}
      <section id="templates" className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">Starter templates</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              Start with a <span className="text-grad">head start</span>
            </h2>
            <p className="mt-3 text-base text-[#5c5675] sm:mt-4 sm:text-lg">
              Twelve complete, professional designs. Pick one, swap in your words and
              photos, or ask the AI Chat to customize it for you.
            </p>
          </div>
          <Link href="/templates" className="btn-app ghost !px-5 !py-3">
            Browse all templates <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/templates?use=${t.id}`}
              className="card-hover motion-3d-card group overflow-hidden rounded-2xl border border-[#eceaf4] bg-white"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={640}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <span
                  className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md"
                  style={{ background: t.accent }}
                >
                  {t.category}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 sm:p-5">
                <div className="min-w-0 pr-2">
                  <h3 className="truncate font-bold">{t.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-[#5c5675]">{t.tagline}</p>
                </div>
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#efedfc] text-[#6d5ae6] transition-transform group-hover:translate-x-1">
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="bg-[#f7f5fd] py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-5">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">FAQ</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              Questions, answered <span className="text-grad">plainly</span>
            </h2>
          </div>
          <div className="mt-10 space-y-3 sm:mt-12">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-[#e9e5f8] bg-white px-5 py-2 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-sm font-semibold sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#efedfc] text-[#6d5ae6] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-[#5c5675] sm:text-base">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FINAL CTA ========================== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:py-24">
        <div className="grad-dark relative overflow-hidden rounded-[24px] px-5 py-14 text-center text-white sm:rounded-[28px] sm:px-8 sm:py-20">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#6d5ae6] opacity-40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#e8622c] opacity-30 blur-3xl" />
          <Mini3DCube size={42} color="#a78bfa" className="motion-cta-cube-left hidden sm:block" />
          <Mini3DCube size={36} color="#38bdf8" className="motion-cta-cube-right hidden sm:block" />
          <div className="relative mx-auto mb-5 flex justify-center">
            <BrandMark size={56} className="motion-float-badge shadow-xl" />
          </div>
          <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl md:text-[2.6rem]">
            Your website is waiting to bloom 🌱
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base text-white/80 sm:mt-4 sm:text-lg">
            No sign-up. No credit card. No code. Describe it in chat, add 3D motion graphics, or drag &amp; drop blocks — and walk away with a finished website.
          </p>
          <div className="relative mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/builder" className="btn-app primary !justify-center !px-7 !py-4 !text-[15px]">
              <Rocket size={18} /> Start building now
            </Link>
            <Link href="/templates" className="btn-app ghost !justify-center !border-white/30 !bg-white/10 !px-7 !py-4 !text-[15px] !text-white hover:!bg-white/20">
              <LayoutTemplate size={18} /> Pick a template
            </Link>
          </div>
        </div>
      </section>

      {/* ========================== FOOTER ========================== */}
      <footer className="border-t border-[#eceaf4] py-10 sm:py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
          <div>
            <div className="flex items-center gap-2.5 text-lg font-extrabold">
              <BrandMark size={34} />
              <span>{BRAND.name}</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-[#5c5675]">
              {BRAND.tagline} The friendly AI + 3D motion drag &amp; drop website builder for everyone.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#5c5675] sm:gap-x-8">
            <Link href="/builder" className="hover:text-[#161224]">Builder</Link>
            <Link href="/templates" className="hover:text-[#161224]">Templates</Link>
            <Link href="/guide" className="hover:text-[#161224]">Getting started</Link>
            <Link href="/projects" className="hover:text-[#161224]">My websites</Link>
            <a href="#3d-motion" className="hover:text-[#161224]">3D Motion</a>
            <a href="#features" className="hover:text-[#161224]">Features</a>
            <a href="#faq" className="hover:text-[#161224]">FAQ</a>
          </nav>
          <p className="text-sm text-[#8d85ab]">© 2026 {BRAND.name}. Made with care.</p>
        </div>
      </footer>
    </div>
  );
}
