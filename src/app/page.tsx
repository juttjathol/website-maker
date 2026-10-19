import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Check, CloudUpload, Download, Layers, LayoutTemplate,
  MousePointerClick, Palette, Rocket, Sparkles, Undo2,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";
import { AccountMenu } from "@/components/account/AccountMenu";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "True drag & drop",
    text: "Design your page by dragging blocks exactly where you want them. If you can use a phone, you can build a website.",
  },
  {
    icon: Layers,
    title: "30+ ready-made blocks",
    text: "Heroes, features, pricing, FAQs, contact forms, maps, galleries, countdowns, blogs and more — all fully editable.",
  },
  {
    icon: Palette,
    title: "Beautiful by default",
    text: "Every block is designed by professionals. Change colors, fonts and spacing with simple controls — it always looks good.",
  },
  {
    icon: LayoutTemplate,
    title: "12 starter templates",
    text: "Business, portfolio, restaurant, startup, blog or personal — start with a complete design and make it yours.",
  },
  {
    icon: Undo2,
    title: "Nothing to lose",
    text: "Your work is saved automatically as you type, with unlimited undo. Experiment freely — mistakes are one click away from gone.",
  },
  {
    icon: CloudUpload,
    title: "Live anywhere",
    text: "Download clean website files for a regular host, or create a Shopify theme ZIP — with plain-English steps for what to do next.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Design",
    text: "Drag blocks onto the page, click any text to rewrite it, and make it yours in real time.",
  },
  {
    n: "2",
    title: "Preview",
    text: "See exactly how it looks on computers, tablets and phones — instantly, with one click.",
  },
  {
    n: "3",
    title: "Publish",
    text: "Export a ready-to-upload website or Shopify theme, then follow the plain-language publishing guide.",
  },
];

const FAQS = [
  {
    q: "Do I need to know anything about coding?",
    a: "Absolutely not. Webloom is built for people who have never made a website before. Everything is visual: you drag blocks, click text to edit it, and pick colors from a palette. The code is written for you behind the scenes.",
  },
  {
    q: "How much does it cost?",
    a: "The builder is free to use. You design your site, preview it and download the finished website as many times as you like. Putting the site online can also be free — hosts like Netlify and GitHub Pages host simple websites at no cost.",
  },
  {
    q: "Where will my website live? Do I need an account?",
    a: "You can build as a guest, and your projects stay in this browser. Webloom accounts are currently granted by an administrator; approved customers can sync small projects across devices within the published cloud limits. When you're ready, export clean website files for a host of your choice, or create a Shopify theme ZIP for your online store."
  },
  {
    q: "Can I use my own domain name?",
    a: "Yes. Once your site is downloaded and hosted, every hosting provider lets you connect a custom domain (like yourbusiness.com) in a few clicks — usually for the price of the domain itself.",
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
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#6d5ae6] text-white">
              <Sparkles size={16} />
            </span>
            {BRAND.name}
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
      <section className="grad-brand">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6d5ae6]/25 bg-white/70 px-4 py-1.5 text-sm font-semibold text-[#5546c8]">
                <Sparkles size={14} /> Free to start · Account optional · No code
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#161224] md:text-[3.45rem]">
                Make a website <span className="text-grad">as easy as<br className="hidden md:block" /> dragging blocks</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#5c5675]">
                {BRAND.name} is the friendly drag &amp; drop website builder. Design it
                visually, watch it come alive, then download it and put it online
                anywhere — even if you’ve never done this before.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/builder" className="btn-app primary !px-6 !py-3.5 !text-[15px]">
                  <Rocket size={17} /> Build my website — it’s free
                </Link>
                <Link href="/templates" className="btn-app ghost !px-6 !py-3.5 !text-[15px]">
                  <LayoutTemplate size={17} /> Start from a template
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#5c5675]">
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Saved automatically</span>
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Works on all devices</span>
                <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-[#16a34a]" /> Yours forever</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-[#6d5ae6]/25 via-transparent to-[#e8622c]/25 blur-2xl" />
              <Image
                src="/images/landing-hero.jpg"
                alt="Illustration of a website being built with drag and drop blocks"
                width={1200}
                height={800}
                priority
                className="relative rounded-[22px] shadow-[0_30px_80px_rgba(22,18,36,.25)]"
              />
            </div>
          </div>

          {/* mini stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-white/60 bg-white/60 p-6 backdrop-blur md:grid-cols-4">
            {[
              ["30+", "Ready-made blocks"],
              [String(TEMPLATES.length), "Designer templates"],
              ["2 min", "To put your site online"],
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

      {/* ========================== FEATURES ========================== */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6d5ae6]">Everything you need</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
        Professional tools, <span className="text-grad">zero learning curve</span>
          </h2>
          <p className="mt-4 text-lg text-[#5c5675]">
            We took everything complicated about building websites and made it
            simple — without making the results simple.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card-hover rounded-2xl border border-[#eceaf4] bg-white p-7"
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
              <div key={s.n} className="relative rounded-2xl border border-[#e9e5f8] bg-white p-8">
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
              photos, and you’re already most of the way there.
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
          <h2 className="relative text-3xl font-extrabold tracking-tight md:text-[2.6rem]">
            Your website is waiting to bloom 🌱
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
            No sign-up. No credit card. No code. Just you, a canvas, and a
            finished website at the end of it.
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
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#6d5ae6] text-white">
                <Sparkles size={16} />
              </span>
              {BRAND.name}
            </div>
            <p className="mt-2 max-w-sm text-sm text-[#5c5675]">
              {BRAND.tagline} The free drag &amp; drop website builder for everyone.
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
