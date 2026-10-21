import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Check, CloudUpload, Download, Layers, LayoutTemplate,
  MousePointerClick, Palette, Rocket, Sparkles, Undo2, Wand2,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";
import { AccountMenu } from "@/components/account/AccountMenu";
import { BrandMark } from "@/components/site/BrandLogo";
import { HeroPromptLauncher } from "@/components/site/HeroPromptLauncher";

const FEATURES = [
  {
    icon: Wand2,
    title: "Text-to-Build AI Chat",
    text: "Just describe your website in plain English — like chatting with a friend — and watch your pages, sections, copy, and colors build themselves live.",
  },
  {
    icon: Palette,
    title: "One-click brand palettes",
    text: "Switch your entire site between Warm Espresso, Midnight Neon, Emerald Botanical, or Obsidian Luxe in one click — or customize every shade.",
  },
  {
    icon: MousePointerClick,
    title: "Easy drag, drop & 1-click reorder",
    text: "Drag blocks onto the page, insert ready-made section combos, or use quick up/down arrows to rearrange sections effortlessly.",
  },
  {
    icon: Layers,
    title: "30+ blocks & 3D scenes",
    text: "Heroes, pricing tables, FAQs, contact forms, galleries, countdowns, blogs, and interactive CSS 3D scenes — all editable inline.",
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
  "✦ 30+ Drag & Drop Blocks",
  "✦ One-Click Designer Palettes",
  "✦ Quick Section Combos",
  "✦ Interactive 3D CSS Scenes",
  "✦ Instant Mobile & Tablet Preview",
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
    title: "Style in One Click",
    text: "Click any text on the page to rewrite it, apply one-click brand color palettes, and preview on computer, tablet, and phone.",
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
    a: "Open the builder and type what kind of website you want in the Chat tab — for example, 'Build a cozy bakery called Sweet Crumb with menu, gallery, pricing and contact'. Webloom immediately assembles tailored sections, headlines, and colors on your canvas. You can keep chatting to add sections, switch to dark mode, or rename your brand.",
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
    q: "Will my site work on phones?",
    a: "Yes — every block is responsive out of the box. Your site automatically adjusts to look great on phones, tablets and large screens. You can even hide specific blocks on specific devices if you want.",
  },
  {
    q: "Can I edit my site later?",
    a: "Of course. Guest projects stay in this browser; approved accounts can sync projects within the account and platform storage limits. Make changes whenever you like, then export an updated ZIP. Keep an exported backup of work that matters.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================ NAV ============================ */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#161224]">
            <BrandMark size={34} />
            <span>{BRAND.name}</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#5c5675] md:flex">
            <a href="#features" className="hover:text-[#161224]">Features</a>
            <a href="#how" className="hover:text-[#161224]">How it works</a>
            <a href="#templates" className="hover:text-[#161224]">Templates</a>
            <Link href="/guide" className="hover:text-[#161224]">Getting started</Link>
            <a href="#faq" className="hover:text-[#161224]">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/projects" className="btn-app ghost">My websites</Link>
            <AccountMenu />
            <Link href="/builder" className="btn-app primary">
              Start building <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================ HERO ============================ */}
      <section className="grad-brand motion-hero-shell relative overflow-hidden">
        {/* Ambient motion graphics aurora orbs */}
        <div className="motion-orb motion-orb-violet pointer-events-none" aria-hidden="true" />
        <div className="motion-orb motion-orb-coral pointer-events-none" aria-hidden="true" />
        <div className="motion-grid-backdrop pointer-events-none" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 md:pt-18">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6d5ae6]/25 bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#5546c8] shadow-xs">
                <Sparkles size={14} className="motion-spin-slow" /> Free to start · AI Text-to-Build · No code
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight text-[#161224] md:text-[3.45rem]">
                Describe your website, <span className="text-grad">watch it bloom<br className="hidden md:block" /> in seconds</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#5c5675]">
                Chat with {BRAND.name} to generate a complete website automatically, or design
                visually with one-click brand styles and drag &amp; drop blocks — then download
                your site or Shopify theme anytime.
              </p>

              {/* Interactive Text-to-Build Launcher */}
              <HeroPromptLauncher />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/builder" className="btn-app primary !px-6 !py-3.5 !text-[15px]">
                  <Rocket size={17} /> Open Visual Builder
                </Link>
                <Link href="/templates" className="btn-app ghost !px-6 !py-3.5 !text-[15px]">
                  <LayoutTemplate size={17} /> Browse 12 Templates
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#5c5675]">
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Builds as you chat</span>
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Works on all devices</span>
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Yours forever</span>
              </div>
            </div>

            {/* Motion Graphics Interactive Visual Stage */}
            <div className="motion-stage relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-[#6d5ae6]/30 via-[#22d3ee]/15 to-[#e8622c]/25 blur-2xl" />
              <div className="motion-orbit-ring pointer-events-none" aria-hidden="true" />

              <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-[#120e24] p-2.5 shadow-[0_32px_90px_rgba(22,18,36,.28)]">
                <div className="mb-2 flex items-center justify-between px-2 py-1 text-[11px] text-white/75">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
                    <span className="ml-2 font-semibold text-white/90">Webloom Studio · Live AI Canvas</span>
                  </div>
                  <span className="rounded-full bg-[#6d5ae6]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#ddd6fe]">
                    ⚡ Auto-Building
                  </span>
                </div>
                <Image
                  src="/images/landing-hero.jpg"
                  alt="Illustration of a website being built with drag and drop blocks and AI chat"
                  width={1200}
                  height={800}
                  priority
                  className="relative rounded-[16px]"
                />
              </div>

              {/* Floating Motion Card 1: AI Chat Prompt Bubble */}
              <div className="motion-float-card motion-float-top-left">
                <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#5b47df]">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#6d5ae6] text-white">
                    <Wand2 size={13} />
                  </span>
                  <span>Text-to-Build Chat</span>
                  <span className="motion-pulse-dot ml-auto" />
                </div>
                <p className="mt-1.5 text-[11.5px] font-medium leading-snug text-[#251f3d]">
                  “Build a cozy coffee shop with warm espresso colors, menu &amp; reviews”
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-[#eef8f1] px-2 py-0.5 text-[9.5px] font-bold text-[#1f7a45]">✓ Hero + Menu</span>
                  <span className="rounded-full bg-[#f3f0ff] px-2 py-0.5 text-[9.5px] font-bold text-[#5b47df]">✓ Warm Espresso</span>
                </div>
              </div>

              {/* Floating Motion Card 2: One-Click Palette Switcher */}
              <div className="motion-float-card motion-float-bottom-right">
                <div className="flex items-center gap-2.5">
                  <BrandMark size={32} />
                  <div>
                    <div className="text-[11px] font-extrabold text-[#1f1935]">8 Designer Palettes</div>
                    <div className="text-[10px] text-[#6d658a]">One-click theme &amp; font restyle</div>
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
            </div>
          </div>

          {/* mini stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur md:grid-cols-4">
            {[
              ["AI + Visual", "Chat or drag & drop"],
              ["30+", "Ready-made blocks"],
              [String(TEMPLATES.length), "Designer templates"],
              ["0", "Lines of code needed"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-extrabold tracking-tight text-[#161224]">{v}</div>
                <div className="mt-0.5 text-sm text-[#5c5675]">{l}</div>
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
      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">Everything you need</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Professional tools, <span className="text-grad">zero learning curve</span>
          </h2>
          <p className="mt-4 text-lg text-[#5c5675]">
            We took everything complicated about building websites and made it
            conversational and visual — without compromising the results.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card-hover motion-feature-card rounded-2xl border border-[#eceaf4] bg-white p-7"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#efedfc] text-[#6d5ae6]">
                <f.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-[#5c5675]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================== */}
      <section id="how" className="bg-[#f7f5fd] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">How it works</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              From idea to online in <span className="text-grad">three steps</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card-hover relative rounded-2xl border border-[#e9e5f8] bg-white p-8">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#6d5ae6] text-lg font-extrabold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-[#5c5675]">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-gradient-to-r from-[#6d5ae6] to-[#e8622c] p-8 text-white">
            <div className="flex flex-wrap items-center gap-6">
              <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-white/20">
                <Download size={26} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">Getting online is the easy part</h3>
                <p className="mt-1 text-white/85">
                  One click gives you a downloadable website folder — plus a picture-perfect
                  guide that walks you through putting it online for free.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm font-semibold sm:grid-cols-3">
              {[
                ["Netlify Drop", "Drag the folder → live in seconds"],
                ["GitHub Pages", "Free hosting, free forever"],
                ["Any host you like", "Your files, your rules"],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl bg-white/15 px-4 py-3">
                  <div>{t}</div>
                  <div className="mt-0.5 font-normal text-white/80">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================== TEMPLATES ========================== */}
      <section id="templates" className="mx-auto max-w-6xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">Starter templates</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Start with a <span className="text-grad">head start</span>
            </h2>
            <p className="mt-4 text-lg text-[#5c5675]">
              Twelve complete, professional designs. Pick one, swap in your words and
              photos, or ask the AI Chat to customize it for you.
            </p>
          </div>
          <Link href="/templates" className="btn-app ghost !px-5 !py-3">
            Browse all templates <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/templates?use=${t.id}`}
              className="card-hover group overflow-hidden rounded-2xl border border-[#eceaf4]"
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
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="mt-0.5 text-sm text-[#5c5675]">{t.tagline}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efedfc] text-[#6d5ae6] transition-transform group-hover:translate-x-1">
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="bg-[#f7f5fd] py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Questions, answered <span className="text-grad">plainly</span>
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-[#e9e5f8] bg-white px-6 py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#efedfc] text-[#6d5ae6] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 leading-relaxed text-[#5c5675]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FINAL CTA ========================== */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grad-dark relative overflow-hidden rounded-[28px] px-8 py-20 text-center text-white">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#6d5ae6] opacity-40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#e8622c] opacity-30 blur-3xl" />
          <div className="relative mx-auto mb-5 flex justify-center">
            <BrandMark size={56} className="motion-float-badge shadow-xl" />
          </div>
          <h2 className="relative text-3xl font-extrabold tracking-tight md:text-[2.6rem]">
            Your website is waiting to bloom 🌱
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
            No sign-up. No credit card. No code. Describe it in chat or drag &amp; drop blocks — and walk away with a finished website.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/builder" className="btn-app primary !px-7 !py-4 !text-[15px]">
              <Rocket size={18} /> Start building now
            </Link>
            <Link href="/templates" className="btn-app ghost !border-white/30 !bg-white/10 !px-7 !py-4 !text-[15px] !text-white hover:!bg-white/20">
              <LayoutTemplate size={18} /> Pick a template
            </Link>
          </div>
        </div>
      </section>

      {/* ========================== FOOTER ========================== */}
      <footer className="border-t border-[#eceaf4] py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5">
          <div>
            <div className="flex items-center gap-2.5 text-lg font-extrabold">
              <BrandMark size={34} />
              <span>{BRAND.name}</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-[#5c5675]">
              {BRAND.tagline} The friendly AI + drag &amp; drop website builder for everyone.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-[#5c5675]">
            <Link href="/builder" className="hover:text-[#161224]">Builder</Link>
            <Link href="/templates" className="hover:text-[#161224]">Templates</Link>
            <Link href="/guide" className="hover:text-[#161224]">Getting started</Link>
            <Link href="/projects" className="hover:text-[#161224]">My websites</Link>
            <a href="#features" className="hover:text-[#161224]">Features</a>
            <a href="#faq" className="hover:text-[#161224]">FAQ</a>
          </nav>
          <p className="text-sm text-[#8d85ab]">© 2026 {BRAND.name}. Made with care.</p>
        </div>
      </footer>
    </div>
  );
}
