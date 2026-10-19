/**
 * Starter templates — complete Project factories.
 * Users pick one and land in the editor with a fully designed site.
 */
import type { Block, BlockType, Project, Theme } from "./schema";
import { createBlock } from "./tree";
import { uid } from "./util";
import {
  tplArchitecture,
  tplFitness,
  tplLearning,
  tplPets,
  tplSkincare,
  tplWeddings,
} from "./templates-more";

let TPL_SEQ = 0;

function b(type: BlockType, props: Record<string, any> = {}, style?: Record<string, any>): Block {
  const block = createBlock(type, props);
  if (style) Object.assign(block.style, style);
  return block;
}

function mk(
  name: string,
  theme: Partial<Theme>,
  pages: { name: string; slug: string; blocks: Block[]; description: string }[]
): Project {
  TPL_SEQ += 1;
  const now = Date.now();
  return {
    id: uid("pr"),
    name,
    theme: {
      mode: "light",
      primary: "#6d5ae6",
      background: "#ffffff",
      text: "#161224",
      muted: "#5c5675",
      surface: "#f4f2fb",
      accent: "#e8622c",
      font: "modern",
      radius: 14,
      ...theme,
    },
    seo: { title: name, description: pages[0].description },
    pages: pages.map((p) => ({
      id: uid("p"),
      name: p.name,
      slug: p.slug,
      seo: { title: `${p.name} — ${name}`, description: p.description },
      blocks: p.blocks,
    })),
    createdAt: now - TPL_SEQ * 1000,
    updatedAt: now,
  };
}

/* ------------------------------- 1. Business ------------------------------- */

export function tplBusiness(): Project {
  const nav = () =>
    b("navbar", {
      logoText: "Northwind",
      links: [
        { label: "Home", link: "index.html" },
        { label: "Services", link: "index.html#services" },
        { label: "About", link: "about.html" },
        { label: "Contact", link: "contact.html" },
      ],
      showCta: true,
      ctaText: "Get a free quote",
      ctaLink: "contact.html",
    });
  const footer = () =>
    b("footer", {
      logoText: "Northwind",
      blurb: "A trusted partner for growing businesses. Strategy, design and technology under one roof.",
      copyright: "© 2026 Northwind Consulting. All rights reserved.",
      columns: [
        { title: "Services", links: [{ label: "Strategy", link: "#" }, { label: "Design", link: "#" }, { label: "Technology", link: "#" }] },
        { title: "Company", links: [{ label: "About us", link: "about.html" }, { label: "Careers", link: "#" }, { label: "Contact", link: "contact.html" }] },
        { title: "Legal", links: [{ label: "Privacy policy", link: "#" }, { label: "Terms of service", link: "#" }] },
      ],
      social: [
        { platform: "linkedin", url: "#" },
        { platform: "facebook", url: "#" },
        { platform: "x", url: "#" },
      ],
    });

  return mk(
    "Northwind Consulting",
    { primary: "#1d4ed8", accent: "#f59e0b", surface: "#f0f4ff" },
    [
      {
        name: "Home",
        slug: "index",
        description: "Northwind helps ambitious companies grow with strategy, design and technology.",
        blocks: [
          nav(),
          b("hero", {
            eyebrow: "Business consulting",
            heading: "We help ambitious businesses grow",
            lead: "Strategy, design and technology — delivered by people who care about your results as much as you do.",
            primaryText: "Book a free consultation",
            primaryLink: "contact.html",
            secondaryText: "Our services",
            secondaryLink: "#services",
            showBadge: true,
            badge: "🏆 Award-winning team",
            image: "/images/tpl-business.jpg",
            stats: [
              { value: "15+", label: "Years of experience" },
              { value: "240", label: "Projects delivered" },
              { value: "4.9/5", label: "Client rating" },
            ],
          }),
          b("features", {
            eyebrow: "Why Northwind",
            heading: "A partner you can rely on",
            lead: "We combine deep expertise with a genuine commitment to your success.",
            items: [
              { icon: "TrendingUp", title: "Growth strategy", text: "Clear, practical plans that move your numbers — not just your mood." },
              { icon: "Palette", title: "Brand & design", text: "A brand that looks as good as what you do, everywhere it appears." },
              { icon: "Cpu", title: "Technology", text: "Websites, tools and automation that save your team hours every week." },
            ],
          }),
          b("services", {
            eyebrow: "What we do",
            heading: "Services tailored to your goals",
            lead: "Pick one or combine them — we build the right team around your project.",
            anchorId: "services",
            items: [
              { icon: "Compass", title: "Business strategy", text: "Market research, positioning and a roadmap your team can actually follow.", linkText: "Explore strategy", link: "contact.html" },
              { icon: "Brush", title: "Brand identity", text: "Logo, colours, voice and guidelines that make you unmistakable.", linkText: "Explore design", link: "contact.html" },
              { icon: "Rocket", title: "Digital growth", text: "Websites and campaigns that turn visitors into loyal customers.", linkText: "Explore growth", link: "contact.html" },
            ],
          }, { backgroundColor: "#f0f4ff", paddingTop: 72, paddingBottom: 72 }),
          b("testimonials", {
            eyebrow: "Client stories",
            heading: "Results that speak for themselves",
            items: [
              { quote: "Northwind rebuilt our brand and website in six weeks. Enquiries doubled in the first month.", name: "Amira Hassan", role: "CEO, Bluepeak", stars: 5 },
              { quote: "Smart, responsive and genuinely invested in our outcome. The best consultancy we've worked with.", name: "James Okoro", role: "Director, Farsight Ltd", stars: 5 },
              { quote: "They turned a messy idea into a clear plan — and then delivered it on time.", name: "Lena Fischer", role: "Founder, Craftly", stars: 5 },
            ],
          }),
          b("cta", {
            heading: "Ready to grow your business?",
            lead: "Book a free 30-minute consultation. No pressure, no jargon — just practical advice.",
            primaryText: "Book my consultation",
            primaryLink: "contact.html",
            showSecondary: true,
            secondaryText: "Call us",
            secondaryLink: "tel:+60123456789",
          }),
          footer(),
        ],
      },
      {
        name: "About",
        slug: "about",
        description: "Meet the team behind Northwind Consulting.",
        blocks: [
          nav(),
          b("hero", {
            variant: "centered",
            eyebrow: "About us",
            heading: "People first. Always.",
            lead: "We started Northwind because businesses deserved a partner that listens first and advises second.",
            showSecondary: false,
            showStats: true,
            stats: [
              { value: "2009", label: "Founded" },
              { value: "28", label: "Team members" },
              { value: "12", label: "Countries served" },
            ],
            showBadge: false,
          }),
          b("about", {
            eyebrow: "Our story",
            heading: "Small team. Big commitment.",
            text: "Northwind began as a two-person studio in 2009. Today we're a team of strategists, designers and engineers — and we still work like a small studio: senior people on every project, honest advice, and no account managers in between.\n\nWe believe great consulting is simple: understand the business, tell the truth, and deliver work that pays for itself.",
            checklist: ["Senior experts on every project", "Fixed prices, no surprises", "93% of clients work with us again"],
            image: "/images/tpl-portfolio.jpg",
          }),
          b("team", {
            eyebrow: "Leadership",
            heading: "The people you'll work with",
            members: [
              { name: "Sarah Chen", role: "Managing Partner", image: "/images/tpl-business.jpg" },
              { name: "Adam Osei", role: "Head of Strategy", image: "/images/tpl-portfolio.jpg" },
              { name: "Maya Tan", role: "Creative Director", image: "/images/tpl-personal.jpg" },
              { name: "Lucas Weber", role: "Technology Lead", image: "/images/tpl-saas.jpg" },
            ],
          }),
          b("faq", {
            heading: "Questions we often hear",
            items: [
              { q: "What size of businesses do you work with?", a: "From ambitious startups to established mid-size companies. If we're not the right fit, we'll tell you and suggest someone who is." },
              { q: "How much does a project cost?", a: "Most engagements range from a focused two-week sprint to a six-month transformation. We scope it together and agree a fixed price before we start." },
              { q: "Do you work remotely?", a: "Yes. Our team is distributed across Asia and Europe, and we run projects over video calls with clear weekly updates." },
            ],
          }),
          footer(),
        ],
      },
      {
        name: "Contact",
        slug: "contact",
        description: "Get in touch with Northwind Consulting.",
        blocks: [
          nav(),
          b("contact", {
            variant: "split",
            eyebrow: "Contact",
            heading: "Let's talk about your project",
            lead: "Fill in the form or reach us directly — we reply within one working day.",
            email: "hello@northwind.example",
            phone: "+60 12-345 6789",
            address: "Level 12, Menara Northwind, Kuala Lumpur",
            formDest: "email",
            formEmail: "hello@northwind.example",
            buttonText: "Send message",
          }),
          b("map", { query: "Kuala Lumpur, Malaysia", zoom: 13 }),
          footer(),
        ],
      },
    ]
  );
}

/* ------------------------------- 2. Portfolio ------------------------------ */

export function tplPortfolio(): Project {
  return mk(
    "Maya Tan — Portfolio",
    { primary: "#e8590c", accent: "#12b886", surface: "#fff7f2", font: "modern", radius: 18 },
    [
      {
        name: "Home",
        slug: "index",
        description: "Designer & art director crafting brands that people love.",
        blocks: [
          b("navbar", {
            logoText: "Maya ✳",
            links: [
              { label: "Work", link: "index.html#work" },
              { label: "About", link: "about.html" },
              { label: "Journal", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Hire me",
            ctaLink: "contact.html",
          }),
          b("hero", {
            variant: "dark",
            eyebrow: "Designer & art director",
            heading: "I craft brands people love",
            lead: "Independent designer working with startups and studios worldwide. Identity, web and art direction with soul.",
            primaryText: "See my work",
            primaryLink: "#work",
            secondaryText: "About me",
            secondaryLink: "about.html",
            showBadge: true,
            badge: "🎨 Available for freelance",
            showStats: true,
            stats: [
              { value: "60+", label: "Projects shipped" },
              { value: "9", label: "Design awards" },
              { value: "8 yrs", label: "Experience" },
            ],
          }),
          b("gallery", {
            anchorId: "work",
            images: [
              { src: "/images/tpl-portfolio.jpg", alt: "Brand identity project" },
              { src: "/images/tpl-saas.jpg", alt: "SaaS dashboard design" },
              { src: "/images/tpl-business.jpg", alt: "Corporate campaign" },
              { src: "/images/tpl-blog.jpg", alt: "Editorial design" },
              { src: "/images/tpl-restaurant.jpg", alt: "Restaurant branding" },
              { src: "/images/tpl-personal.jpg", alt: "Personal brand project" },
            ],
          }, { paddingTop: 24 }),
          b("features", {
            variant: "list",
            eyebrow: "What I do",
            heading: "Design that works as good as it looks",
            items: [
              { icon: "Palette", title: "Brand identity", text: "Logos, colour systems and guidelines that make brands unmistakable." },
              { icon: "Monitor", title: "Web design", text: "Beautiful, fast websites designed to convert visitors into fans." },
              { icon: "Camera", title: "Art direction", text: "Campaigns, photoshoots and content that tell a coherent story." },
            ],
          }),
          b("cta", {
            heading: "Have a project in mind?",
            lead: "I take on a handful of projects each quarter. Let's see if we're a match.",
            primaryText: "Start a project",
            primaryLink: "contact.html",
          }),
          b("footer", {
            logoText: "Maya ✳",
            blurb: "Independent designer & art director. Based in Kuala Lumpur, working worldwide.",
            copyright: "© 2026 Maya Tan",
            columns: [
              { title: "Menu", links: [{ label: "Work", link: "#" }, { label: "About", link: "about.html" }, { label: "Journal", link: "blog.html" }] },
              { title: "Elsewhere", links: [{ label: "Dribbble", link: "#" }, { label: "Behance", link: "#" }, { label: "Instagram", link: "#" }] },
            ],
            social: [
              { platform: "instagram", url: "#" },
              { platform: "x", url: "#" },
              { platform: "email", url: "mailto:hello@maya.example" },
            ],
          }),
        ],
      },
      {
        name: "About",
        slug: "about",
        description: "About Maya Tan — designer & art director.",
        blocks: [
          b("navbar", {
            logoText: "Maya ✳",
            links: [
              { label: "Work", link: "index.html#work" },
              { label: "About", link: "about.html" },
              { label: "Journal", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Hire me",
            ctaLink: "contact.html",
          }),
          b("about", {
            variant: "image-left",
            eyebrow: "About me",
            heading: "Design is how I make sense of the world",
            text: "I'm Maya — a designer and art director based in Kuala Lumpur. For the past eight years I've helped startups, restaurants and creative studios find their voice.\n\nWhen I'm not designing, you'll find me photographing morning markets, collecting way too many typefaces, and mentoring young designers.",
            checklist: ["Ex-lead designer at Studio Fon", "Awwwards jury 2025", "Speaks English & Bahasa Malaysia"],
            image: "/images/tpl-personal.jpg",
          }),
          b("testimonials", {
            eyebrow: "Kind words",
            heading: "What clients say",
            items: [
              { quote: "Maya has an rare ability to turn fuzzy ideas into crisp, beautiful design systems.", name: "Rina Patel", role: "Founder, Ori Coffee", stars: 5 },
              { quote: "Fast, thoughtful and incredibly talented. Our new brand turned heads from day one.", name: "Tom Nakamura", role: "CEO, Loopwear", stars: 5 },
              { quote: "The best creative partner we've ever had — genuinely.", name: "Clara Mendes", role: "Director, Studio Mendes", stars: 5 },
            ],
          }),
          b("cta", {
            heading: "Let's create something together",
            lead: "Tell me about your project — I reply to every message personally.",
            primaryText: "Get in touch",
            primaryLink: "contact.html",
          }),
          b("footer", {
            logoText: "Maya ✳",
            blurb: "Independent designer & art director.",
            copyright: "© 2026 Maya Tan",
            columns: [{ title: "Menu", links: [{ label: "Work", link: "index.html" }, { label: "About", link: "about.html" }, { label: "Contact", link: "contact.html" }] }],
            social: [{ platform: "instagram", url: "#" }, { platform: "email", url: "mailto:hello@maya.example" }],
          }),
        ],
      },
      {
        name: "Journal",
        slug: "blog",
        description: "Design notes and stories from Maya.",
        blocks: [
          b("navbar", {
            logoText: "Maya ✳",
            links: [
              { label: "Work", link: "index.html" },
              { label: "About", link: "about.html" },
              { label: "Journal", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Hire me",
            ctaLink: "contact.html",
          }),
          b("blogList", {
            eyebrow: "Journal",
            heading: "Notes on design & life",
            lead: "Occasional thoughts on branding, freelancing and creative work.",
            posts: [
              { title: "How to brief a designer (properly)", excerpt: "A good brief is half the project. Here's the exact template I send my clients.", date: "2026-09-28", image: "/images/tpl-blog.jpg", category: "Process", link: "#" },
              { title: "Colour systems that scale", excerpt: "Why I design in tokens — and how it keeps brands consistent everywhere.", date: "2026-08-15", image: "/images/tpl-portfolio.jpg", category: "Design", link: "#" },
              { title: "My first year freelancing", excerpt: "Lessons, rates and mistakes from going independent.", date: "2026-07-02", image: "/images/tpl-personal.jpg", category: "Freelance", link: "#" },
            ],
          }),
          b("footer", {
            logoText: "Maya ✳",
            blurb: "Independent designer & art director.",
            copyright: "© 2026 Maya Tan",
            columns: [],
            social: [{ platform: "instagram", url: "#" }],
          }),
        ],
      },
    ]
  );
}

/* ------------------------------ 3. Restaurant ------------------------------ */

export function tplRestaurant(): Project {
  return mk(
    "Saffron & Sage",
    { primary: "#b45309", accent: "#166534", background: "#fffdf7", surface: "#f8f1e3", text: "#2b1d0e", muted: "#7c6544", font: "serif", radius: 10 },
    [
      {
        name: "Home",
        slug: "index",
        description: "Modern home-style cooking with a seasonal menu. Book your table at Saffron & Sage.",
        blocks: [
          b("navbar", {
            logoText: "Saffron & Sage",
            links: [
              { label: "Menu", link: "index.html#menu" },
              { label: "About", link: "about.html" },
              { label: "Visit", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Book a table",
            ctaLink: "contact.html",
          }),
          b("hero", {
            eyebrow: "Seasonal kitchen & bar",
            heading: "Simple food, made with soul",
            lead: "A neighbourhood restaurant where every dish is cooked from scratch with local ingredients and a little bit of magic.",
            primaryText: "Book a table",
            primaryLink: "contact.html",
            secondaryText: "See the menu",
            secondaryLink: "#menu",
            image: "/images/tpl-restaurant.jpg",
            showBadge: true,
            badge: "🌿 New autumn menu is here",
            showStats: false,
          }),
          b("services", {
            eyebrow: "What we offer",
            heading: "More than a restaurant",
            anchorId: "menu",
            items: [
              { icon: "Store", title: "Dine in", text: "Lunch and dinner seven days a week in our warm, candle-lit dining room.", linkText: "Book a table", link: "contact.html" },
              { icon: "Gift", title: "Private events", text: "Birthdays, anniversaries, team dinners — we'll make it unforgettable.", linkText: "Plan an event", link: "contact.html" },
              { icon: "ShoppingBag", title: "Takeaway", text: "Your favourites to go, ready in 20 minutes when you order ahead.", linkText: "See takeaway menu", link: "contact.html" },
            ],
          }),
          b("section", {}, { backgroundColor: "#f8f1e3", paddingTop: 72, paddingBottom: 72 }),
          b("gallery", {
            images: [
              { src: "/images/tpl-restaurant.jpg", alt: "Signature dish" },
              { src: "/images/tpl-blog.jpg", alt: "Dessert" },
              { src: "/images/tpl-personal.jpg", alt: "Our dining room" },
            ],
          }),
          b("testimonials", {
            eyebrow: "Guest book",
            heading: "What our guests say",
            items: [
              { quote: "The best meal we've had this year. The mushroom risotto is life-changing.", name: "Aina & Farid", role: "Regulars since 2023", stars: 5 },
              { quote: "Warm service, beautiful food, lovely room. It feels like eating at a friend's house.", name: "Sophie M.", role: "Food blogger", stars: 5 },
              { quote: "They catered our wedding of 80 guests flawlessly. Thank you!", name: "The Lim family", role: "Private event", stars: 5 },
            ],
          }),
          b("cta", {
            heading: "Hungry yet?",
            lead: "Tables go fast on weekends — book yours now.",
            primaryText: "Book a table",
            primaryLink: "contact.html",
            showSecondary: true,
            secondaryText: "Call +60 7-123 4567",
            secondaryLink: "tel:+6071234567",
          }),
          b("footer", {
            logoText: "Saffron & Sage",
            blurb: "Seasonal kitchen & bar. Cooking from scratch since 2018.",
            copyright: "© 2026 Saffron & Sage",
            columns: [
              { title: "Opening hours", links: [{ label: "Mon–Thu: 11:30–22:00", link: "#" }, { label: "Fri–Sat: 11:30–23:00", link: "#" }, { label: "Sun: 10:00–21:00", link: "#" }] },
              { title: "Visit", links: [{ label: "12 Jalan Sage, Pasir Gudang", link: "#" }, { label: "Directions", link: "contact.html" }, { label: "Parking info", link: "#" }] },
            ],
            social: [
              { platform: "instagram", url: "#" },
              { platform: "facebook", url: "#" },
              { platform: "whatsapp", url: "#" },
            ],
          }),
        ],
      },
      {
        name: "About",
        slug: "about",
        description: "The story of Saffron & Sage.",
        blocks: [
          b("navbar", {
            logoText: "Saffron & Sage",
            links: [
              { label: "Menu", link: "index.html#menu" },
              { label: "About", link: "about.html" },
              { label: "Visit", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Book a table",
            ctaLink: "contact.html",
          }),
          b("about", {
            variant: "image-right",
            eyebrow: "Our story",
            heading: "From a family kitchen to your table",
            text: "Saffron & Sage started in 2018 as a weekend supper club run by Chef Lina in her mother's kitchen. Word spread — first among friends, then across the city.\n\nToday we're a full restaurant, but the philosophy hasn't changed: cook like you're feeding family. Every sauce is made in-house, every vegetable chosen at the morning market, every guest welcomed like an old friend.",
            checklist: ["100% cooked from scratch", "Local, seasonal ingredients", "Family-run since day one"],
            image: "/images/tpl-restaurant.jpg",
          }),
          b("countdown", {
            label: "Our next wine dinner starts in",
            target: "2026-12-12T19:00",
            variant: "boxes",
          }, { align: "center" }),
          b("cta", {
            heading: "Come taste the story",
            lead: "We'd love to have you at our table.",
            primaryText: "Reserve now",
            primaryLink: "contact.html",
          }),
          b("footer", {
            logoText: "Saffron & Sage",
            blurb: "Seasonal kitchen & bar.",
            copyright: "© 2026 Saffron & Sage",
            columns: [],
            social: [{ platform: "instagram", url: "#" }, { platform: "whatsapp", url: "#" }],
          }),
        ],
      },
      {
        name: "Visit",
        slug: "contact",
        description: "Find us and book a table.",
        blocks: [
          b("navbar", {
            logoText: "Saffron & Sage",
            links: [
              { label: "Menu", link: "index.html#menu" },
              { label: "About", link: "about.html" },
              { label: "Visit", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Book a table",
            ctaLink: "contact.html",
          }),
          b("contact", {
            variant: "split",
            eyebrow: "Visit us",
            heading: "Find us & book your table",
            lead: "Walk-ins are welcome, but weekends fill up fast. Send us a message to reserve.",
            email: "hello@saffronsage.example",
            phone: "+60 7-123 4567",
            address: "12 Jalan Sage, Pasir Gudang, Johor",
            formDest: "email",
            formEmail: "hello@saffronsage.example",
            buttonText: "Request booking",
          }),
          b("map", { query: "Pasir Gudang, Johor, Malaysia", zoom: 14 }),
          b("footer", {
            logoText: "Saffron & Sage",
            blurb: "Seasonal kitchen & bar.",
            copyright: "© 2026 Saffron & Sage",
            columns: [],
            social: [{ platform: "instagram", url: "#" }],
          }),
        ],
      },
    ]
  );
}

/* -------------------------------- 4. SaaS --------------------------------- */

export function tplSaas(): Project {
  return mk(
    "Fluxio",
    { primary: "#4f46e5", accent: "#06b6d4", surface: "#eef2ff", text: "#0f172a", muted: "#475569", radius: 12 },
    [
      {
        name: "Home",
        slug: "index",
        description: "Fluxio — the friendly way to manage projects, people and deadlines.",
        blocks: [
          b("navbar", {
            logoText: "⚡ Fluxio",
            links: [
              { label: "Features", link: "index.html#features" },
              { label: "Pricing", link: "pricing.html" },
              { label: "FAQ", link: "index.html#faq" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Start free",
            ctaLink: "pricing.html",
          }),
          b("hero", {
            eyebrow: "Project management, simplified",
            heading: "Your team's work, finally in one place",
            lead: "Fluxio brings tasks, chats and deadlines together — so your team spends less time managing work and more time doing it.",
            primaryText: "Start free — 14 days",
            primaryLink: "pricing.html",
            secondaryText: "Watch the tour",
            secondaryLink: "#video",
            showBadge: true,
            badge: "🚀 New: AI summaries are live",
            image: "/images/tpl-saas.jpg",
            showStats: true,
            stats: [
              { value: "12,000+", label: "Teams on Fluxio" },
              { value: "38%", label: "Less time in meetings" },
              { value: "4.8/5", label: "G2 rating" },
            ],
          }),
          b("features", {
            eyebrow: "Features",
            heading: "Everything your team needs",
            lead: "Powerful enough for complex projects, simple enough for everyone.",
            anchorId: "features",
            items: [
              { icon: "Zap", title: "Instant setup", text: "Import your projects from anywhere and be running in under 10 minutes." },
              { icon: "Users", title: "Team collaboration", text: "Comments, mentions and real-time updates keep everyone on the same page." },
              { icon: "Calendar", title: "Smart deadlines", text: "Automatic scheduling that adapts when plans change — because they always do." },
              { icon: "BarChart", title: "Clear reports", text: "Beautiful dashboards that show progress without a spreadsheet in sight." },
              { icon: "Key", title: "Enterprise security", text: "SSO, permissions and encryption that satisfy your IT team." },
              { icon: "Cloud", title: "Works everywhere", text: "Web, desktop and mobile — your work syncs instantly." },
            ],
          }),
          b("video", { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", anchorId: "video" }, { maxWidth: 860 }),
          b("pricing", {
            eyebrow: "Pricing",
            heading: "Simple pricing that scales with you",
            lead: "Start free. Upgrade when your team grows. Cancel anytime.",
            plans: [
              { name: "Free", price: "$0", period: "/month", features: ["Up to 3 projects", "5 team members", "Community support"], featured: false, badge: "", ctaText: "Start free", ctaLink: "#" },
              { name: "Pro", price: "$12", period: "/user/mo", features: ["Unlimited projects", "Unlimited members", "AI summaries", "Priority support"], featured: true, badge: "Most popular", ctaText: "Start 14-day trial", ctaLink: "#" },
              { name: "Enterprise", price: "Custom", period: "", features: ["SSO & advanced security", "Dedicated success manager", "Custom integrations", "SLA & onboarding"], featured: false, badge: "", ctaText: "Talk to sales", ctaLink: "contact.html" },
            ],
          }),
          b("faq", {
            anchorId: "faq",
            eyebrow: "FAQ",
            heading: "Everything you're wondering",
            items: [
              { q: "Is there really a free plan?", a: "Yes — the Free plan is free forever for small teams. No credit card required to start." },
              { q: "Can I import from Trello / Asana / Jira?", a: "Absolutely. One-click importers bring your boards, tasks and comments with you." },
              { q: "How secure is my data?", a: "Your data is encrypted in transit and at rest, hosted in SOC 2 certified data centres, and never sold." },
              { q: "What happens after my trial?", a: "You can choose a plan or stay on Free. Your work is never deleted." },
            ],
          }),
          b("cta", {
            heading: "Give your team its best week",
            lead: "Join 12,000+ teams who ship faster with Fluxio.",
            primaryText: "Start your free trial",
            primaryLink: "pricing.html",
            showSecondary: true,
            secondaryText: "Book a demo",
            secondaryLink: "contact.html",
          }),
          b("footer", {
            logoText: "⚡ Fluxio",
            blurb: "The friendly way to manage projects, people and deadlines.",
            copyright: "© 2026 Fluxio Inc. All rights reserved.",
            columns: [
              { title: "Product", links: [{ label: "Features", link: "index.html" }, { label: "Pricing", link: "pricing.html" }, { label: "Changelog", link: "#" }] },
              { title: "Company", links: [{ label: "About", link: "#" }, { label: "Blog", link: "#" }, { label: "Careers", link: "#" }] },
              { title: "Support", links: [{ label: "Help center", link: "#" }, { label: "Contact", link: "contact.html" }, { label: "Status", link: "#" }] },
            ],
            social: [
              { platform: "x", url: "#" },
              { platform: "linkedin", url: "#" },
              { platform: "github", url: "#" },
            ],
          }),
        ],
      },
      {
        name: "Pricing",
        slug: "pricing",
        description: "Fluxio pricing — simple plans for teams of all sizes.",
        blocks: [
          b("navbar", {
            logoText: "⚡ Fluxio",
            links: [
              { label: "Features", link: "index.html#features" },
              { label: "Pricing", link: "pricing.html" },
              { label: "FAQ", link: "index.html#faq" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Start free",
            ctaLink: "pricing.html",
          }),
          b("pricing", {
            eyebrow: "Pricing",
            heading: "Plans for every stage",
            lead: "All plans include unlimited guests, mobile apps and 256-bit encryption.",
            plans: [
              { name: "Free", price: "$0", period: "/month", features: ["Up to 3 projects", "5 team members", "Community support"], featured: false, badge: "", ctaText: "Start free", ctaLink: "#" },
              { name: "Pro", price: "$12", period: "/user/mo", features: ["Unlimited projects", "Unlimited members", "AI summaries", "Priority support"], featured: true, badge: "Most popular", ctaText: "Start 14-day trial", ctaLink: "#" },
              { name: "Enterprise", price: "Custom", period: "", features: ["SSO & advanced security", "Dedicated success manager", "Custom integrations", "SLA & onboarding"], featured: false, badge: "", ctaText: "Talk to sales", ctaLink: "contact.html" },
            ],
          }),
          b("faq", {
            heading: "Billing questions",
            items: [
              { q: "Can I change plans later?", a: "Yes, upgrade or downgrade at any time — we'll prorate the difference automatically." },
              { q: "Do you offer annual discounts?", a: "Pay yearly and get two months free on any paid plan." },
              { q: "Which payment methods do you accept?", a: "All major credit cards, PayPal and bank transfer for annual Enterprise contracts." },
            ],
          }),
          b("footer", {
            logoText: "⚡ Fluxio",
            blurb: "The friendly way to manage projects.",
            copyright: "© 2026 Fluxio Inc.",
            columns: [],
            social: [{ platform: "x", url: "#" }],
          }),
        ],
      },
      {
        name: "Contact",
        slug: "contact",
        description: "Contact the Fluxio team.",
        blocks: [
          b("navbar", {
            logoText: "⚡ Fluxio",
            links: [
              { label: "Features", link: "index.html" },
              { label: "Pricing", link: "pricing.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Start free",
            ctaLink: "pricing.html",
          }),
          b("contact", {
            variant: "form",
            eyebrow: "Contact",
            heading: "Talk to a human",
            lead: "Questions, feedback or a big idea — our team replies within one working day.",
            email: "hello@fluxio.example",
            formDest: "email",
            formEmail: "hello@fluxio.example",
            buttonText: "Send message",
          }),
          b("footer", {
            logoText: "⚡ Fluxio",
            blurb: "The friendly way to manage projects.",
            copyright: "© 2026 Fluxio Inc.",
            columns: [],
            social: [{ platform: "x", url: "#" }],
          }),
        ],
      },
    ]
  );
}

/* --------------------------------- 5. Blog --------------------------------- */

export function tplBlog(): Project {
  return mk(
    "Slow Mornings",
    { primary: "#0f766e", accent: "#d97706", background: "#fbfaf7", text: "#1c2b2a", muted: "#52655f", surface: "#eef3f0", font: "serif", radius: 12 },
    [
      {
        name: "Home",
        slug: "index",
        description: "A journal about mindful living, good coffee and slow travel.",
        blocks: [
          b("navbar", {
            logoText: "☕ Slow Mornings",
            links: [
              { label: "Home", link: "index.html" },
              { label: "Stories", link: "stories.html" },
              { label: "About", link: "about.html" },
              { label: "Newsletter", link: "index.html#newsletter" },
            ],
            showCta: false,
          }),
          b("hero", {
            variant: "centered",
            eyebrow: "A journal for unhurried days",
            heading: "Slow Mornings",
            lead: "Stories about mindful living, good coffee, and travelling at the speed of walking.",
            primaryText: "Read the latest",
            primaryLink: "#latest",
            secondaryText: "About the journal",
            secondaryLink: "about.html",
            showBadge: false,
            showStats: false,
          }),
          b("blogList", {
            anchorId: "latest",
            eyebrow: "Latest stories",
            heading: "Fresh from the journal",
            posts: [
              { title: "The art of doing nothing (productively)", excerpt: "Why an empty afternoon might be the most productive thing in your week.", date: "2026-10-12", image: "/images/tpl-blog.jpg", category: "Mindful living", link: "#" },
              { title: "A slow weekend in Georgetown", excerpt: "Street art, char kway teow and three cafés worth the detour.", date: "2026-09-30", image: "/images/tpl-restaurant.jpg", category: "Travel", link: "#" },
              { title: "My 5 favourite coffee brewing methods", excerpt: "From V60 to moka pot — simple rituals for better mornings.", date: "2026-09-18", image: "/images/tpl-personal.jpg", category: "Coffee", link: "#" },
            ],
          }),
          b("about", {
            variant: "image-right",
            eyebrow: "About",
            heading: "Written by someone who finally slowed down",
            text: "Hi, I'm Elise. I used to measure days in tasks completed. Now I measure them in walks taken and cups of coffee savoured.\n\nSlow Mornings is where I write about it — honestly, imperfectly, and always with a fresh cup nearby.",
            checklist: ["New stories every fortnight", "No ads, ever", "Reader-supported journal"],
            image: "/images/tpl-personal.jpg",
            showButton: true,
            buttonText: "More about me",
            buttonLink: "about.html",
          }),
          b("newsletter", {
            heading: "Join 4,000 slow mornings",
            lead: "One thoughtful email every other Sunday. Tea optional, but recommended.",
            buttonText: "Subscribe",
            anchorId: "newsletter",
            formDest: "email",
            formEmail: "hello@slowmornings.example",
          }),
          b("footer", {
            logoText: "☕ Slow Mornings",
            blurb: "A journal about mindful living, good coffee and slow travel.",
            copyright: "© 2026 Slow Mornings",
            columns: [
              { title: "Explore", links: [{ label: "Latest stories", link: "#" }, { label: "Travel", link: "#" }, { label: "Coffee", link: "#" }] },
              { title: "About", links: [{ label: "The journal", link: "about.html" }, { label: "Contact", link: "mailto:hello@slowmornings.example" }, { label: "Privacy", link: "#" }] },
            ],
            social: [
              { platform: "instagram", url: "#" },
              { platform: "pinterest", url: "#" },
              { platform: "email", url: "mailto:hello@slowmornings.example" },
            ],
          }),
        ],
      },
      {
        name: "Stories",
        slug: "stories",
        description: "All stories from the Slow Mornings journal.",
        blocks: [
          b("navbar", {
            logoText: "☕ Slow Mornings",
            links: [
              { label: "Home", link: "index.html" },
              { label: "Stories", link: "stories.html" },
              { label: "About", link: "about.html" },
            ],
            showCta: false,
          }),
          b("blogList", {
            eyebrow: "Archive",
            heading: "All stories",
            lead: "Everything we've written, newest first.",
            posts: [
              { title: "The art of doing nothing (productively)", excerpt: "Why an empty afternoon might be the most productive thing in your week.", date: "2026-10-12", image: "/images/tpl-blog.jpg", category: "Mindful living", link: "#" },
              { title: "A slow weekend in Georgetown", excerpt: "Street art, char kway teow and three cafés worth the detour.", date: "2026-09-30", image: "/images/tpl-restaurant.jpg", category: "Travel", link: "#" },
              { title: "My 5 favourite coffee brewing methods", excerpt: "From V60 to moka pot — simple rituals for better mornings.", date: "2026-09-18", image: "/images/tpl-personal.jpg", category: "Coffee", link: "#" },
              { title: "Digital minimalism: one month in", excerpt: "What happened when I deleted half the apps on my phone.", date: "2026-08-22", image: "/images/tpl-saas.jpg", category: "Mindful living", link: "#" },
              { title: "The quiet coast of Terengganu", excerpt: "Empty beaches, wooden boats and the best nasi kerabu of my life.", date: "2026-08-05", image: "/images/tpl-business.jpg", category: "Travel", link: "#" },
              { title: "How I plan a slow week", excerpt: "A gentle system for weeks that feel spacious, not empty.", date: "2026-07-19", image: "/images/tpl-portfolio.jpg", category: "Rituals", link: "#" },
            ],
          }),
          b("footer", {
            logoText: "☕ Slow Mornings",
            blurb: "A journal about mindful living.",
            copyright: "© 2026 Slow Mornings",
            columns: [],
            social: [{ platform: "instagram", url: "#" }],
          }),
        ],
      },
      {
        name: "About",
        slug: "about",
        description: "About the Slow Mornings journal.",
        blocks: [
          b("navbar", {
            logoText: "☕ Slow Mornings",
            links: [
              { label: "Home", link: "index.html" },
              { label: "Stories", link: "stories.html" },
              { label: "About", link: "about.html" },
            ],
            showCta: false,
          }),
          b("about", {
            variant: "image-left",
            eyebrow: "The journal",
            heading: "Why 'Slow Mornings'?",
            text: "It started as a promise to myself: before the world gets loud, one hour that belongs to me. Coffee, a notebook, no notifications.\n\nThat hour changed my weeks. This journal is an invitation to try it for yourself — and to find the slow, good things hiding in ordinary days.",
            checklist: ["Published since 2022", "4,000+ readers", "Written in Kuala Lumpur"],
            image: "/images/tpl-blog.jpg",
            showButton: false,
          }),
          b("footer", {
            logoText: "☕ Slow Mornings",
            blurb: "A journal about mindful living.",
            copyright: "© 2026 Slow Mornings",
            columns: [],
            social: [{ platform: "instagram", url: "#" }],
          }),
        ],
      },
    ]
  );
}

/* ------------------------------- 6. Personal ------------------------------- */

export function tplPersonal(): Project {
  return mk(
    "Alex Rivera",
    { primary: "#7c3aed", accent: "#f43f5e", surface: "#f5f3ff", text: "#1e1b2e", muted: "#5b5670", radius: 16 },
    [
      {
        name: "Home",
        slug: "index",
        description: "Developer, writer and coffee enthusiast. This is my corner of the internet.",
        blocks: [
          b("navbar", {
            logoText: "AR",
            links: [
              { label: "Home", link: "index.html" },
              { label: "About", link: "about.html" },
              { label: "Writing", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Say hello",
            ctaLink: "contact.html",
          }),
          b("hero", {
            variant: "split",
            eyebrow: "Hi, I'm Alex 👋",
            heading: "I build things for the web",
            lead: "Developer, writer and part-time coffee snob based in Johor. I make fast, friendly software and write about the craft.",
            primaryText: "About me",
            primaryLink: "about.html",
            secondaryText: "Read my writing",
            secondaryLink: "blog.html",
            showBadge: true,
            badge: "☕ Currently: building Sidekick",
            image: "/images/tpl-personal.jpg",
            showStats: true,
            stats: [
              { value: "7 yrs", label: "Experience" },
              { value: "40+", label: "Projects shipped" },
              { value: "∞", label: "Cups of coffee" },
            ],
          }),
          b("features", {
            eyebrow: "What I do",
            heading: "A few things I'm good at",
            items: [
              { icon: "Code2", title: "Web development", text: "Fast, accessible websites and apps built with modern tools." },
              { icon: "BookOpen", title: "Writing", text: "Essays and guides about programming, craft and building products." },
              { icon: "Lightbulb", title: "Product thinking", text: "Helping founders shape rough ideas into things people love." },
            ],
          }),
          b("list", {
            items: [
              { text: "Currently building Sidekick — a focus timer for makers" },
              { text: "Writing a free book on practical web performance" },
              { text: "Open to interesting freelance collaborations" },
            ],
          }, { maxWidth: 640 }),
          b("cta", {
            heading: "Want to work together?",
            lead: "I'm always happy to chat about projects, ideas or good coffee.",
            primaryText: "Get in touch",
            primaryLink: "contact.html",
            showSecondary: true,
            secondaryText: "See my work",
            secondaryLink: "blog.html",
          }),
          b("footer", {
            logoText: "Alex Rivera",
            blurb: "Developer, writer and coffee enthusiast.",
            copyright: "© 2026 Alex Rivera",
            columns: [
              { title: "Pages", links: [{ label: "About", link: "about.html" }, { label: "Writing", link: "blog.html" }, { label: "Contact", link: "contact.html" }] },
            ],
            social: [
              { platform: "github", url: "#" },
              { platform: "x", url: "#" },
              { platform: "linkedin", url: "#" },
              { platform: "email", url: "mailto:alex@example.com" },
            ],
          }),
        ],
      },
      {
        name: "About",
        slug: "about",
        description: "More about Alex Rivera.",
        blocks: [
          b("navbar", {
            logoText: "AR",
            links: [
              { label: "Home", link: "index.html" },
              { label: "About", link: "about.html" },
              { label: "Writing", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Say hello",
            ctaLink: "contact.html",
          }),
          b("about", {
            variant: "image-left",
            eyebrow: "About me",
            heading: "From broken HTML to products people use",
            text: "I wrote my first website at 13 — a glorious mess of scrolling marquees. Seventeen years later I still get the same kick out of making things for the web.\n\nI've worked with startups, agencies and big companies, but I like projects best where craft matters and the team cares. When I'm not coding, I'm brewing something with too many steps and walking my dog, Pixel.",
            checklist: ["Full-stack TypeScript specialist", "Ex-Stripe, ex-freelance", "Based in Johor, Malaysia"],
            image: "/images/tpl-personal.jpg",
            showButton: true,
            buttonText: "Download my CV",
            buttonLink: "#",
          }),
          b("team", {
            eyebrow: "Collaborators",
            heading: "People I love working with",
            members: [
              { name: "Priya K.", role: "Designer", image: "/images/tpl-portfolio.jpg" },
              { name: "Jonas B.", role: "Backend engineer", image: "/images/tpl-business.jpg" },
              { name: "Mei L.", role: "Illustrator", image: "/images/tpl-blog.jpg" },
              { name: "Pixel", role: "Chief morale officer", image: "/images/tpl-saas.jpg" },
            ],
          }),
          b("footer", {
            logoText: "Alex Rivera",
            blurb: "Developer, writer and coffee enthusiast.",
            copyright: "© 2026 Alex Rivera",
            columns: [],
            social: [{ platform: "github", url: "#" }, { platform: "email", url: "mailto:alex@example.com" }],
          }),
        ],
      },
      {
        name: "Writing",
        slug: "blog",
        description: "Articles by Alex Rivera.",
        blocks: [
          b("navbar", {
            logoText: "AR",
            links: [
              { label: "Home", link: "index.html" },
              { label: "About", link: "about.html" },
              { label: "Writing", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Say hello",
            ctaLink: "contact.html",
          }),
          b("blogList", {
            eyebrow: "Writing",
            heading: "Notes on building for the web",
            posts: [
              { title: "Ship small, ship often", excerpt: "Why the smallest useful version beats the perfect one every time.", date: "2026-10-08", image: "/images/tpl-saas.jpg", category: "Product", link: "#" },
              { title: "The performance budget that saved our launch", excerpt: "How a simple rule kept our app fast when the team grew.", date: "2026-09-21", image: "/images/tpl-business.jpg", category: "Engineering", link: "#" },
              { title: "Coffee-driven development", excerpt: "A completely serious framework for creative work.", date: "2026-09-02", image: "/images/tpl-blog.jpg", category: "Life", link: "#" },
            ],
          }),
          b("footer", {
            logoText: "Alex Rivera",
            blurb: "Developer, writer and coffee enthusiast.",
            copyright: "© 2026 Alex Rivera",
            columns: [],
            social: [{ platform: "github", url: "#" }],
          }),
        ],
      },
      {
        name: "Contact",
        slug: "contact",
        description: "Get in touch with Alex.",
        blocks: [
          b("navbar", {
            logoText: "AR",
            links: [
              { label: "Home", link: "index.html" },
              { label: "About", link: "about.html" },
              { label: "Writing", link: "blog.html" },
              { label: "Contact", link: "contact.html" },
            ],
            showCta: true,
            ctaText: "Say hello",
            ctaLink: "contact.html",
          }),
          b("contact", {
            variant: "form",
            eyebrow: "Say hello",
            heading: "Drop me a message",
            lead: "Whether it's a project, a question or a coffee recommendation — I'd love to hear from you.",
            email: "alex@example.com",
            formDest: "email",
            formEmail: "alex@example.com",
            buttonText: "Send message",
          }),
          b("footer", {
            logoText: "Alex Rivera",
            blurb: "Developer, writer and coffee enthusiast.",
            copyright: "© 2026 Alex Rivera",
            columns: [],
            social: [{ platform: "github", url: "#" }, { platform: "email", url: "mailto:alex@example.com" }],
          }),
        ],
      },
    ]
  );
}

/* ------------------------------- catalogue -------------------------------- */

export interface TemplateInfo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  image: string;
  accent: string;
  make: () => Project;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "business",
    name: "Business Consulting",
    tagline: "Professional services & agencies",
    category: "Business",
    image: "/images/tpl-business.jpg",
    accent: "#1d4ed8",
    make: tplBusiness,
  },
  {
    id: "portfolio",
    name: "Creative Portfolio",
    tagline: "Designers, artists & freelancers",
    category: "Portfolio",
    image: "/images/tpl-portfolio.jpg",
    accent: "#e8590c",
    make: tplPortfolio,
  },
  {
    id: "restaurant",
    name: "Restaurant & Café",
    tagline: "Food, hospitality & local gems",
    category: "Food",
    image: "/images/tpl-restaurant.jpg",
    accent: "#b45309",
    make: tplRestaurant,
  },
  {
    id: "saas",
    name: "SaaS Landing",
    tagline: "Apps, startups & products",
    category: "Startup",
    image: "/images/tpl-saas.jpg",
    accent: "#4f46e5",
    make: tplSaas,
  },
  {
    id: "blog",
    name: "Blog & Journal",
    tagline: "Writers, newsletters & magazines",
    category: "Blog",
    image: "/images/tpl-blog.jpg",
    accent: "#0f766e",
    make: tplBlog,
  },
  {
    id: "personal",
    name: "Personal Brand",
    tagline: "Résumés, creators & profiles",
    category: "Personal",
    image: "/images/tpl-personal.jpg",
    accent: "#7c3aed",
    make: tplPersonal,
  },
  {
    id: "weddings",
    name: "Weddings & Events",
    tagline: "Thoughtful celebrations and planners",
    category: "Events",
    image: "/images/tpl-weddings.jpg",
    accent: "#8d6b59",
    make: tplWeddings,
  },
  {
    id: "fitness",
    name: "Fitness & Wellness",
    tagline: "Studios, coaches and movement spaces",
    category: "Wellness",
    image: "/images/tpl-fitness.jpg",
    accent: "#bd4f37",
    make: tplFitness,
  },
  {
    id: "pets",
    name: "Pet Care & Walking",
    tagline: "Pet sitters, walkers and local services",
    category: "Services",
    image: "/images/tpl-pets.jpg",
    accent: "#3d7c61",
    make: tplPets,
  },
  {
    id: "architecture",
    name: "Architecture & Interiors",
    tagline: "Studios, spaces and considered design",
    category: "Services",
    image: "/images/tpl-architecture.jpg",
    accent: "#776552",
    make: tplArchitecture,
  },
  {
    id: "skincare",
    name: "Botanical Skincare Shop",
    tagline: "Beauty, wellness and product brands",
    category: "Retail",
    image: "/images/tpl-skincare.jpg",
    accent: "#476047",
    make: tplSkincare,
  },
  {
    id: "learning",
    name: "Courses & Coaching",
    tagline: "Educators, mentors and online courses",
    category: "Education",
    image: "/images/tpl-learning.jpg",
    accent: "#3556a6",
    make: tplLearning,
  },
];

export function makeTemplate(id: string): Project {
  const t = TEMPLATES.find((x) => x.id === id) || TEMPLATES[0];
  return t.make();
}
