import type { Block, BlockType, Page, Project, Theme } from "./schema";
import { createBlock } from "./tree";
import { clone, uid } from "./util";
import { sceneObject } from "./scene-3d";

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  keywords: string[];
  theme: Theme;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "webloom-violet",
    name: "Webloom Violet",
    tagline: "Crisp light canvas with vibrant violet & coral",
    keywords: ["violet", "purple", "webloom", "default", "bright"],
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
    },
  },
  {
    id: "midnight-neon",
    name: "Midnight Neon",
    tagline: "Deep space dark mode with electric indigo & cyan",
    keywords: ["dark", "midnight", "neon", "cyber", "futuristic", "ai", "night", "black"],
    theme: {
      mode: "dark",
      primary: "#7c5cff",
      background: "#0b0a14",
      text: "#f6f5ff",
      muted: "#a39ec4",
      surface: "#171528",
      accent: "#22d3ee",
      font: "modern",
      radius: 16,
    },
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Luxe",
    tagline: "High-contrast dark luxury with warm champagne gold",
    keywords: ["luxury", "gold", "obsidian", "elegant", "VIP", "premium", "upscale"],
    theme: {
      mode: "dark",
      primary: "#d4a853",
      background: "#0f0e0c",
      text: "#faf6ee",
      muted: "#b5ab99",
      surface: "#1c1a16",
      accent: "#e5c178",
      font: "serif",
      radius: 8,
    },
  },
  {
    id: "warm-espresso",
    name: "Warm Espresso",
    tagline: "Artisan cream & roasted coffee tones",
    keywords: ["coffee", "warm", "brown", "espresso", "bakery", "cafe", "cozy", "earthy", "terracotta"],
    theme: {
      mode: "light",
      primary: "#9c4a27",
      background: "#fdfaf6",
      text: "#261811",
      muted: "#6e584d",
      surface: "#f4ece2",
      accent: "#d97736",
      font: "serif",
      radius: 12,
    },
  },
  {
    id: "emerald-studio",
    name: "Emerald Botanical",
    tagline: "Fresh forest green & calm organic neutrals",
    keywords: ["green", "emerald", "forest", "botanical", "nature", "eco", "organic", "wellness", "mint"],
    theme: {
      mode: "light",
      primary: "#15803d",
      background: "#fbfdfb",
      text: "#112419",
      muted: "#4d6657",
      surface: "#eef6f0",
      accent: "#0d9488",
      font: "modern",
      radius: 16,
    },
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    tagline: "Trustworthy sapphire blue & clean sky surfaces",
    keywords: ["blue", "ocean", "navy", "medical", "corporate", "clean", "trust", "sky", "teal"],
    theme: {
      mode: "light",
      primary: "#0284c7",
      background: "#ffffff",
      text: "#0f172a",
      muted: "#475569",
      surface: "#f0f7ff",
      accent: "#0ea5e9",
      font: "modern",
      radius: 12,
    },
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral",
    tagline: "Playful rose-coral energy with friendly rounded corners",
    keywords: ["pink", "coral", "rose", "red", "orange", "playful", "creative", "vibrant", "warm"],
    theme: {
      mode: "light",
      primary: "#e11d48",
      background: "#fffafb",
      text: "#281118",
      muted: "#73525c",
      surface: "#fceef2",
      accent: "#f97316",
      font: "rounded",
      radius: 20,
    },
  },
  {
    id: "editorial-stone",
    name: "Editorial Minimal",
    tagline: "Gallery-grade monochrome stone & classic serif",
    keywords: ["minimal", "minimalist", "serif", "editorial", "monochrome", "architecture", "fashion"],
    theme: {
      mode: "light",
      primary: "#1c1917",
      background: "#fafaf9",
      text: "#1c1917",
      muted: "#57534e",
      surface: "#f0efed",
      accent: "#78716c",
      font: "serif",
      radius: 6,
    },
  },
];

export interface SectionStarter {
  id: string;
  label: string;
  description: string;
  blocks: BlockType[];
}

export const SECTION_STARTERS: SectionStarter[] = [
  {
    id: "launch-pack",
    label: "Hero + Features",
    description: "Opening banner with 3 highlight cards",
    blocks: ["hero", "features"],
  },
  {
    id: "trust-pack",
    label: "Testimonials + FAQ",
    description: "Customer social proof & common answers",
    blocks: ["testimonials", "faq"],
  },
  {
    id: "conversion-pack",
    label: "Pricing + Call to Action",
    description: "3-tier pricing table & closing banner",
    blocks: ["pricing", "cta"],
  },
  {
    id: "story-pack",
    label: "About + Team + Contact",
    description: "Brand story, team photos & inquiry form",
    blocks: ["about", "team", "contact"],
  },
];

interface ArchetypeBlueprint {
  id: string;
  label: string;
  keywords: string[];
  defaultBrand: string;
  presetId: string;
  heroImage: string;
  secondaryImage: string;
  eyebrow: string;
  heading: (brand: string) => string;
  lead: (brand: string) => string;
  badge: string;
  primaryCta: string;
  secondaryCta: string;
  stats: { value: string; label: string }[];
  featuresHeading: string;
  featuresLead: string;
  features: { icon: string; title: string; text: string }[];
  servicesHeading: string;
  servicesLead: string;
  services: { icon: string; title: string; text: string; linkText: string; link: string }[];
  aboutHeading: (brand: string) => string;
  aboutText: (brand: string) => string;
  checklist: string[];
  testimonials: { quote: string; name: string; role: string; avatar: string; stars: number }[];
  pricingHeading: string;
  pricingLead: string;
  plans: {
    name: string;
    price: string;
    period: string;
    features: string[];
    featured: boolean;
    badge: string;
    ctaText: string;
    ctaLink: string;
  }[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  ctaLead: string;
  defaultSections: BlockType[];
}

const ARCHETYPES: ArchetypeBlueprint[] = [
  {
    id: "cafe",
    label: "Coffee Shop & Bakery",
    keywords: ["coffee", "cafe", "bakery", "restaurant", "bistro", "food", "dining", "pastry", "roast", "tea", "kitchen", "bar", "pizza", "burger"],
    defaultBrand: "Velvet Roast",
    presetId: "warm-espresso",
    heroImage: "/images/tpl-restaurant.jpg",
    secondaryImage: "/images/tpl-business.jpg",
    eyebrow: "SMALL-BATCH & FRESH DAILY",
    heading: (b) => `${b} — handcrafted coffee & warm kitchen hospitality`,
    lead: (b) => `At ${b}, we roast single-origin beans in small batches and bake sourdough pastries every morning from scratch. Pull up a chair or order ahead.`,
    badge: "☕ Freshly roasted · Open 7am–9pm daily",
    primaryCta: "Explore the Menu",
    secondaryCta: "Book a Table",
    stats: [
      { value: "100%", label: "Single-origin arabica" },
      { value: "6am", label: "Ovens fired daily" },
      { value: "4.9★", label: "Local guest rating" },
    ],
    featuresHeading: "Crafted slow, served warm",
    featuresLead: "Every cup and plate is made with seasonal ingredients from local growers.",
    features: [
      { icon: "Coffee", title: "House-roasted espresso", text: "Balanced, chocolatey espresso and rotational pour-overs roasted right in-house." },
      { icon: "Sparkles", title: "Morning sourdough & pastries", text: "Flaky croissants, cinnamon knots and artisan loaves baked fresh at dawn." },
      { icon: "Heart", title: "Cozy neighborhood space", text: "Sunlit tables, fast Wi-Fi, and a welcoming patio made for lingering." },
    ],
    servicesHeading: "What’s on the counter today",
    servicesLead: "From morning espresso rituals to weekend brunch plates and private catering.",
    services: [
      { icon: "Coffee", title: "Specialty Coffee & Matcha", text: "Signature lattes, cold brew flights, ceremonial Uji matcha and house syrups.", linkText: "See drink menu", link: "#contact" },
      { icon: "Utensils", title: "All-Day Brunch & Tartines", text: "Seasonal toast plates, shakshuka, grain bowls and warm bakery favorites.", linkText: "See food menu", link: "#contact" },
      { icon: "Gift", title: "Catering & Coffee Boxes", text: "Pastry platters and hot brew totes for office mornings and celebrations.", linkText: "Book catering", link: "#contact" },
    ],
    aboutHeading: (b) => `The story behind ${b}`,
    aboutText: (b) => `${b} began with a simple belief: a neighborhood cafe should feel like a second living room. We partner directly with sustainable farms and bake everything in small batches.`,
    checklist: ["Direct-trade specialty coffee beans", "Organic flour & cultured butter", "Vegan & gluten-friendly options daily"],
    testimonials: [
      { quote: "The brown-butter cardamom latte and warm almond croissant are unmatched. Easily my favorite spot in town.", name: "Nadia Lim", role: "Regular Guest", avatar: "", stars: 5 },
      { quote: "We ordered their pastry boxes for our studio launch and everyone asked where they came from!", name: "Marcus Tan", role: "Creative Director", avatar: "", stars: 5 },
      { quote: "Warm staff, gorgeous interior, and consistently incredible pour-overs.", name: "Elena Rossi", role: "Food Writer", avatar: "", stars: 5 },
    ],
    pricingHeading: "Coffee club & catering packages",
    pricingLead: "Enjoy daily perks or bring our coffee bar to your next gathering.",
    plans: [
      { name: "Daily Sipper", price: "$24", period: "/month", features: ["1bag of house beans monthly", "10% off all cafe drinks", "Free birthday pastry"], featured: false, badge: "", ctaText: "Join Club", ctaLink: "#contact" },
      { name: "Roaster’s Box", price: "$45", period: "/month", features: ["2 single-origin bags monthly", "Unlimited free espresso upgrades", "Priority tasting invites", "Free local delivery"], featured: true, badge: "Most popular", ctaText: "Subscribe Now", ctaLink: "#contact" },
      { name: "Office Morning", price: "$140", period: "/event", features: ["Serves 15–20 guests", "Fresh brew dispensers", "24 assorted artisan pastries"], featured: false, badge: "", ctaText: "Book Catering", ctaLink: "#contact" },
    ],
    faqs: [
      { q: "Do you take table reservations?", a: "Walk-ins are always welcome! For groups of 6 or more, send us a quick note below and we'll save you a table." },
      { q: "Do you have oat milk and gluten-free pastries?", a: "Yes — we carry oat, almond, and soy milk at no extra charge, plus at least three gluten-friendly bakes every day." },
      { q: "Can I order whole cakes or catering boxes?", a: "Absolutely. Place catering orders 48 hours ahead using our contact form." },
    ],
    ctaHeading: "Come by for a warm cup today",
    ctaLead: "Visit us in person or send a message to reserve a table or catering box.",
    defaultSections: ["navbar", "hero", "services", "about", "testimonials", "contact", "footer"],
  },
  {
    id: "saas",
    label: "AI & SaaS Technology",
    keywords: ["saas", "software", "ai", "tech", "app", "startup", "platform", "cloud", "analytics", "automation", "tool", "developer", "data", "crm"],
    defaultBrand: "PulseFlow AI",
    presetId: "midnight-neon",
    heroImage: "/images/tpl-saas.jpg",
    secondaryImage: "/images/tpl-business.jpg",
    eyebrow: "NEXT-GEN WORKFLOW AUTOMATION",
    heading: (b) => `Ship faster with ${b} — your intelligent team copilot`,
    lead: (b) => `${b} connects your docs, customer tickets, and analytics into one real-time workspace so your team spends less time on busywork and more time shipping.`,
    badge: "⚡ 4.9/5 across 3,500+ product teams",
    primaryCta: "Start Free Trial",
    secondaryCta: "See Live Demo",
    stats: [
      { value: "10x", label: "Faster onboarding" },
      { value: "99.99%", label: "Global uptime SLA" },
      { value: "42%", label: "Hours saved weekly" },
    ],
    featuresHeading: "Built for high-velocity teams",
    featuresLead: "Everything you need to automate workflows, track metrics, and collaborate securely.",
    features: [
      { icon: "Zap", title: "Instant AI Automations", text: "Trigger smart actions across your stack in milliseconds without writing boilerplate code." },
      { icon: "BarChart", title: "Live Revenue & Funnel Insights", text: "Spot bottlenecks early with real-time dashboards that update as customers convert." },
      { icon: "Shield", title: "Enterprise-Grade Security", text: "SOC2 Type II controls, role-based permissions, and end-to-end encryption built in." },
    ],
    servicesHeading: "One platform for every department",
    servicesLead: "Modular tools that scale from seed-stage startups to global enterprises.",
    services: [
      { icon: "Cpu", title: "AI Copilot Studio", text: "Train custom assistants on your internal knowledge base in minutes.", linkText: "Explore AI Studio", link: "#pricing" },
      { icon: "TrendingUp", title: "Predictive Analytics", text: "Forecast churn, expansion and sprint velocity with clear visual reports.", linkText: "Explore Analytics", link: "#pricing" },
      { icon: "Layers", title: "One-Click Integrations", text: "Sync with Slack, GitHub, Notion, Stripe and 50+ tools out of the box.", linkText: "View Integrations", link: "#pricing" },
    ],
    aboutHeading: (b) => `Why modern teams switch to ${b}`,
    aboutText: (b) => `We built ${b} because teams were drowning in disconnected tabs. Our mission is to make software feel effortless, fast, and collaborative again.`,
    checklist: ["Setup takes under 5 minutes", "No credit card required to start", "24/7 engineering support"],
    testimonials: [
      { quote: "We replaced four separate tools in our first week. Our weekly sprint planning dropped from two hours to twenty minutes.", name: "Devon Brooks", role: "VP of Product, HexaCloud", avatar: "", stars: 5 },
      { quote: "The speed and polish are unreal. Our whole support team adopted it on day one without training.", name: "Priya Nair", role: "Head of Operations, FinStack", avatar: "", stars: 5 },
      { quote: "Best ROI of any software we bought this year. The live analytics alone paid for the annual plan.", name: "Jonas Lindqvist", role: "CTO, Northwind Labs", avatar: "", stars: 5 },
    ],
    pricingHeading: "Simple, transparent pricing that scales",
    pricingLead: "Start free for 14 days. Upgrade or cancel anytime with one click.",
    plans: [
      { name: "Starter", price: "$0", period: "/month", features: ["Up to 3 team members", "1,000 automated runs/mo", "Core integrations", "Community support"], featured: false, badge: "", ctaText: "Start Free", ctaLink: "#contact" },
      { name: "Growth Pro", price: "$39", period: "/month", features: ["Up to 25 team members", "50,000 automated runs/mo", "AI Copilot & custom workflows", "Priority 24/7 support"], featured: true, badge: "Most popular", ctaText: "Start 14-Day Trial", ctaLink: "#contact" },
      { name: "Enterprise", price: "$129", period: "/month", features: ["Unlimited seats & workspaces", "Unlimited runs + custom SLA", "SSO / SAML & audit logs", "Dedicated solutions engineer"], featured: false, badge: "", ctaText: "Book a Demo", ctaLink: "#contact" },
    ],
    faqs: [
      { q: "How long does setup take?", a: "Most teams connect their workspace and run their first automation in under 5 minutes." },
      { q: "Can I switch plans or cancel anytime?", a: "Yes. You can upgrade, downgrade, or cancel with one click from your billing settings." },
      { q: "Is my company data used to train public models?", a: "Never. Your workspace data stays strictly private and isolated to your organization." },
    ],
    ctaHeading: "Ready to supercharge your team’s workflow?",
    ctaLead: "Join 3,500+ fast-moving teams building with less friction today.",
    defaultSections: ["navbar", "hero", "features", "pricing", "testimonials", "faq", "cta", "footer"],
  },
  {
    id: "fitness",
    label: "Fitness, Gym & Wellness Studio",
    keywords: ["fitness", "gym", "workout", "trainer", "yoga", "pilates", "coach", "crossfit", "sport", "athletic", "health"],
    defaultBrand: "Kinetic Pulse Studio",
    presetId: "sunset-coral",
    heroImage: "/images/tpl-fitness.jpg",
    secondaryImage: "/images/tpl-personal.jpg",
    eyebrow: "STRENGTH · MOBILITY · CONDITIONING",
    heading: (b) => `Train with purpose at ${b}`,
    lead: () => `Small-group strength classes, personal coaching, and recovery sessions designed to help you feel stronger, move better, and build lasting energy.`,
    badge: "🔥 First week unlimited trial for new members",
    primaryCta: "Claim 7-Day Trial",
    secondaryCta: "View Class Schedule",
    stats: [
      { value: "45+", label: "Weekly coached classes" },
      { value: "12:1", label: "Max athlete-to-coach ratio" },
      { value: "100%", label: "Supportive community" },
    ],
    featuresHeading: "Training that fits real life",
    featuresLead: "No ego, no guesswork — just expert coaching and progressive programs.",
    features: [
      { icon: "Dumbbell", title: "Progressive Strength", text: "Structured 50-minute sessions focused on form, power, and measurable progress." },
      { icon: "Activity", title: "HIIT & Metabolic Conditioning", text: "High-energy intervals that boost endurance and leave you feeling unstoppable." },
      { icon: "Heart", title: "Mobility & Recovery", text: "Guided breathwork, stretch, and infrared recovery so your body stays injury-free." },
    ],
    servicesHeading: "Programs for every level",
    servicesLead: "Whether it’s your first workout or your fiftieth race prep, our coaches meet you where you are.",
    services: [
      { icon: "Users", title: "Small-Group Classes", text: "Capped at 12 members so you get personal form cues every session.", linkText: "See class types", link: "#pricing" },
      { icon: "Target", title: "1-on-1 Personal Coaching", text: "Custom programming, nutrition habits, and accountability built around your goals.", linkText: "Meet coaches", link: "#pricing" },
      { icon: "Award", title: "8-Week Transformation", text: "Our signature progressive challenge with body-comp tracking and team support.", linkText: "Join next cohort", link: "#contact" },
    ],
    aboutHeading: (b) => `Inside ${b}`,
    aboutText: (b) => `We created ${b} to bridge the gap between intimidating big-box gyms and personal training. Every session is coached by certified specialists who know your name and your goals.`,
    checklist: ["Certified strength & conditioning coaches", "Luxury locker rooms & smoothie bar", "Flexible class booking via mobile"],
    testimonials: [
      { quote: "I’ve never stuck with a gym longer than two months until now. Down 14lb and deadlifting my personal best!", name: "Samira Hassan", role: "Member for 11 months", avatar: "", stars: 5 },
      { quote: "The coaches actually watch your form and scale movements so you never feel lost.", name: "Ryan Koh", role: "Member for 2 years", avatar: "", stars: 5 },
      { quote: "Best 50 minutes of my day. Great music, zero intimidation, incredible energy.", name: "Chloe Tan", role: "Morning Crew Member", avatar: "", stars: 5 },
    ],
    pricingHeading: "Flexible memberships, zero lock-in",
    pricingLead: "Start with our 7-day trial pass or jump straight into unlimited classes.",
    plans: [
      { name: "7-Day Intro Pass", price: "$29", period: "one-time", features: ["7 days of unlimited classes", "1-on-1 movement assessment", "Free grip socks or shaker"], featured: false, badge: "New members", ctaText: "Claim Intro Pass", ctaLink: "#contact" },
      { name: "Unlimited All-Access", price: "$149", period: "/month", features: ["Unlimited group classes", "Open gym + recovery lounge", "Monthly InBody scan & check-in", "2 free guest passes/month"], featured: true, badge: "Most popular", ctaText: "Join Unlimited", ctaLink: "#contact" },
      { name: "8x Monthly Flex", price: "$109", period: "/month", features: ["8 coached classes per month", "Rollover unused credits", "Discounts on 1-on-1 sessions"], featured: false, badge: "", ctaText: "Choose Flex", ctaLink: "#contact" },
    ],
    faqs: [
      { q: "I’m a total beginner — will I fit in?", a: "100% yes. Every workout has beginner, intermediate, and advanced options demonstrated by your coach." },
      { q: "What should I bring to my first class?", a: "Just comfortable workout clothes, trainers, and a water bottle. We provide towels, lockers, and filtered water." },
      { q: "Can I pause my membership when traveling?", a: "Yes, you can freeze your membership for up to 60 days per year at no charge." },
    ],
    ctaHeading: "Your strongest season starts this week",
    ctaLead: "Book your 7-day trial pass and experience a class with our coaching team.",
    defaultSections: ["navbar", "hero", "features", "services", "pricing", "testimonials", "faq", "contact", "footer"],
  },
  {
    id: "skincare",
    label: "Skincare, Beauty & Ecommerce Boutique",
    keywords: ["skincare", "beauty", "cosmetics", "spa", "salon", "shop", "store", "boutique", "ecommerce", "product", "fashion", "jewelry", "candle", "botanical"],
    defaultBrand: "Botanical Glow",
    presetId: "emerald-studio",
    heroImage: "/images/tpl-skincare.jpg",
    secondaryImage: "/images/tpl-weddings.jpg",
    eyebrow: "CLEAN BOTANICAL FORMULAS",
    heading: (b) => `Radiant, calm skin with ${b}`,
    lead: () => `Plant-powered serums and daily essentials formulated with dermatologist-backed actives, refillable glass packaging, and zero harsh fillers.`,
    badge: "🌿 100% Vegan · Cruelty-Free · Dermatologist Tested",
    primaryCta: "Shop Bestsellers",
    secondaryCta: "Take Skin Quiz",
    stats: [
      { value: "96%", label: "Saw brighter skin in 14 days" },
      { value: "100%", label: "Recyclable glass refills" },
      { value: "18k+", label: "5-star customer reviews" },
    ],
    featuresHeading: "Kind to your skin barrier, gentler on the planet",
    featuresLead: "Fewer, better steps designed to bring out your natural glow without irritation.",
    features: [
      { icon: "Leaf", title: "Cold-pressed botanicals", text: "Nutrient-dense plant oils and extracts harvested at peak potency." },
      { icon: "Droplets", title: "Barrier-first hydration", text: "Ceramides, squalane, and hyaluronic acid that lock in moisture for 24 hours." },
      { icon: "Sparkles", title: "Refillable glass jars", text: "Keep your heavy glass bottle and pop in eco-refill pods to cut waste by 70%." },
    ],
    servicesHeading: "Signature rituals & bestsellers",
    servicesLead: "Explore our award-winning three-step daily routine.",
    services: [
      { icon: "Droplets", title: "Cloud Dew Barrier Serum", text: "Our #1 soothing peptide + niacinamide serum for instant glass-skin bounce.", linkText: "Shop Serum — $38", link: "#contact" },
      { icon: "Sparkles", title: "Green Tea Velvet Cleanser", text: "Melting gel-balm that removes SPF and makeup without stripping.", linkText: "Shop Cleanser — $28", link: "#contact" },
      { icon: "Heart", title: "The Complete 3-Step Ritual", text: "Cleanser, serum, and whipped ceramide cream in a gift-ready linen pouch.", linkText: "Shop Bundle — $84", link: "#contact" },
    ],
    aboutHeading: (b) => `Our philosophy at ${b}`,
    aboutText: (b) => `${b} was born out of frustration with 10-step routines that left sensitive skin stressed. Every formula is crafted in small batches with clinically proven botanicals.`,
    checklist: ["Fragrance-free & sensitive-skin safe", "Clinically tested active concentrations", "Free shipping on orders over $50"],
    testimonials: [
      { quote: "The Cloud Dew Serum completely calmed my redness in a week. My skin has never looked this dewy!", name: "Hannah Yeo", role: "Verified Buyer", avatar: "", stars: 5 },
      { quote: "I love that I only need three products on my shelf now — and the glass bottles look gorgeous.", name: "Claire Dubois", role: "Esthetician", avatar: "", stars: 5 },
      { quote: "Sensitive skin approved! Zero breakouts and my makeup sits so smoothly on top.", name: "Mei Ling", role: "Repeat Customer", avatar: "", stars: 5 },
    ],
    pricingHeading: "Curated sets & subscribe-and-save",
    pricingLead: "Save up to 20% with our curated routine bundles.",
    plans: [
      { name: "Starter Duo", price: "$58", period: "bundle", features: ["Green Tea Cleanser", "Cloud Dew Serum", "Free organic cotton headband"], featured: false, badge: "Save 12%", ctaText: "Order Starter Duo", ctaLink: "#contact" },
      { name: "Complete Glow Set", price: "$84", period: "bundle", features: ["Full 3-Step Daily Routine", "Full-size Gua Sha stone", "Free express shipping", "30-day glow guarantee"], featured: true, badge: "Bestseller", ctaText: "Order Complete Set", ctaLink: "#contact" },
      { name: "Refill Club VIP", price: "$69", period: "/quarter", features: ["Eco refill pods every 90 days", "20% off add-on treatments", "Early access to seasonal drops"], featured: false, badge: "Eco choice", ctaText: "Join Refill Club", ctaLink: "#contact" },
    ],
    faqs: [
      { q: "Are your products safe for sensitive or acne-prone skin?", a: "Yes. All formulas are non-comedogenic, essential-oil-free, and allergy-tested." },
      { q: "What is your return policy?", a: "Try any product for 30 days. If your skin doesn't love it, we'll refund you in full." },
      { q: "Can I export this site as a Shopify store theme?", a: "Yes! Click the Shopify button in the Webloom toolbar to export a ready-to-upload Shopify Online Store theme ZIP." },
    ],
    ctaHeading: "Ready for your healthiest skin yet?",
    ctaLead: "Order your 3-step ritual today with free shipping and our 30-day glow guarantee.",
    defaultSections: ["navbar", "hero", "features", "services", "about", "testimonials", "newsletter", "footer"],
  },
  {
    id: "portfolio",
    label: "Creative Portfolio, Studio & Agency",
    keywords: ["portfolio", "designer", "photography", "photographer", "agency", "studio", "creative", "artist", "architect", "architecture", "interior", "video", "freelance", "personal", "wedding"],
    defaultBrand: "Atelier Nova",
    presetId: "editorial-stone",
    heroImage: "/images/tpl-portfolio.jpg",
    secondaryImage: "/images/tpl-architecture.jpg",
    eyebrow: "BRAND IDENTITY · DIGITAL DESIGN · ART DIRECTION",
    heading: (b) => `${b} shapes timeless brands & digital experiences`,
    lead: () => `An independent design practice crafting visual identities, editorial photography, and high-converting websites for ambitious founders.`,
    badge: "✦ Booking Q4 & Q1 client projects",
    primaryCta: "View Selected Work",
    secondaryCta: "Start a Project",
    stats: [
      { value: "80+", label: "Brands launched" },
      { value: "14", label: "Design awards" },
      { value: "100%", label: "Founder-led craft" },
    ],
    featuresHeading: "A considered approach to every detail",
    featuresLead: "We combine strategic clarity with unmistakable visual craft.",
    features: [
      { icon: "Compass", title: "Brand Strategy & Positioning", text: "Uncovering what makes your story distinct before a single pixel is drawn." },
      { icon: "Palette", title: "Visual Identity Systems", text: "Typography, custom marks, color palettes, and guidelines built to endure." },
      { icon: "Monitor", title: "Interactive Web Experiences", text: "Fast, expressive websites that turn curious visitors into lifelong clients." },
    ],
    servicesHeading: "Capabilities & studio packages",
    servicesLead: "Focused engagements with clear timelines and deliverables.",
    services: [
      { icon: "Brush", title: "Brand Identity Sprint", text: "Logo suite, typography, color world, and brand book delivered in 3 weeks.", linkText: "Inquire about branding", link: "#contact" },
      { icon: "Monitor", title: "Bespoke Website Design", text: "Custom design, copywriting polish, responsive build, and launch support.", linkText: "Inquire about web", link: "#contact" },
      { icon: "Camera", title: "Creative Direction & Campaigns", text: "Art direction for product launches, lookbooks, and visual storytelling.", linkText: "Inquire about direction", link: "#contact" },
    ],
    aboutHeading: (b) => `Inside ${b}`,
    aboutText: (b) => `${b} partners closely with a handful of clients each season so every project receives senior creative attention from first sketch to launch day.`,
    checklist: ["Direct collaboration with lead designers", "Transparent fixed-scope pricing", "Full source files & ownership on handoff"],
    testimonials: [
      { quote: "Our rebrand completely transformed how enterprise clients perceive us. Inquiries doubled within a month of launch.", name: "Julian Mercer", role: "Founder, Kestrel Ventures", avatar: "", stars: 5 },
      { quote: "Thoughtful, organized, and wildly talented. They translated our rough vision into something iconic.", name: "Soraia Al-Mansoor", role: "Creative Lead, Maison Lune", avatar: "", stars: 5 },
      { quote: "Every milestone was delivered on time and exceeded expectations.", name: "Liam O’Connor", role: "Partner, Studio Nord", avatar: "", stars: 5 },
    ],
    pricingHeading: "Transparent project engagements",
    pricingLead: "Fixed-fee packages with clear milestones and zero surprise billing.",
    plans: [
      { name: "Identity Sprint", price: "$2,800", period: "fixed", features: ["Primary & secondary logos", "Color & typography system", "Brand guidelines deck", "2-week turnaround"], featured: false, badge: "", ctaText: "Book Sprint", ctaLink: "#contact" },
      { name: "Brand + Website", price: "$5,500", period: "fixed", features: ["Complete brand identity", "Up to 6 custom web pages", "Mobile optimization & SEO", "Launch & training handoff"], featured: true, badge: "Most popular", ctaText: "Book Full Package", ctaLink: "#contact" },
      { name: "Creative Retainer", price: "$2,200", period: "/month", features: ["Ongoing design & web updates", "Campaign & social assets", "48-hour turnaround queue"], featured: false, badge: "", ctaText: "Inquire Retainer", ctaLink: "#contact" },
    ],
    faqs: [
      { q: "What is your typical project timeline?", a: "Brand sprints take 2–3 weeks, and full brand + website engagements take 4–6 weeks." },
      { q: "Do you offer payment plans?", a: "Yes — projects are typically split 50% at kickoff and 50% upon final delivery." },
      { q: "Can we start with a small discovery call?", a: "Of course. Send a short note below with your timeline and goals, and we'll schedule a 20-minute chat." },
    ],
    ctaHeading: "Have a project in mind? Let’s talk.",
    ctaLead: "Share a few details about what you’re building and we’ll reply within one business day.",
    defaultSections: ["navbar", "hero", "services", "about", "testimonials", "contact", "footer"],
  },
  {
    id: "clinic",
    label: "Clinic, Consulting & Professional Services",
    keywords: ["clinic", "dental", "dentist", "doctor", "medical", "therapy", "law", "legal", "lawyer", "consulting", "agency", "finance", "accounting", "real estate", "property", "cleaning", "plumbing", "service", "business", "education", "course", "school", "tutor", "pet"],
    defaultBrand: "BrightCare Group",
    presetId: "ocean-breeze",
    heroImage: "/images/tpl-business.jpg",
    secondaryImage: "/images/tpl-learning.jpg",
    eyebrow: "TRUSTED PROFESSIONAL CARE",
    heading: (b) => `Expert, compassionate service you can count on at ${b}`,
    lead: (b) => `${b} combines modern expertise with warm, personal attention — making every visit, consultation, and follow-up clear and stress-free.`,
    badge: "✓ Trusted by 3,000+ local families & businesses",
    primaryCta: "Book an Appointment",
    secondaryCta: "Explore Services",
    stats: [
      { value: "15+ yrs", label: "Proven experience" },
      { value: "3,000+", label: "Clients served" },
      { value: "4.9★", label: "Verified client rating" },
    ],
    featuresHeading: "Why clients choose us year after year",
    featuresLead: "Clear communication, modern standards, and genuine care at every step.",
    features: [
      { icon: "Shield", title: "Certified Specialists", text: "An experienced, accredited team dedicated to the highest professional standards." },
      { icon: "Calendar", title: "Same-Week Appointments", text: "Easy online scheduling with evening and weekend slots that fit your calendar." },
      { icon: "Heart", title: "Transparent, Honest Guidance", text: "Upfront pricing and plain-English explanations before any work begins." },
    ],
    servicesHeading: "Comprehensive services tailored to you",
    servicesLead: "Everything you need under one roof, delivered with care.",
    services: [
      { icon: "Check", title: "Initial Consultation & Assessment", text: "A thorough 45-minute review with a tailored action plan and transparent quote.", linkText: "Book consultation", link: "#contact" },
      { icon: "Sparkles", title: "Core Care & Specialist Plans", text: "Modern, gentle solutions using the latest equipment and best practices.", linkText: "Learn more", link: "#contact" },
      { icon: "Users", title: "Ongoing Support & Maintenance", text: "Proactive check-ins and priority support to keep everything on track.", linkText: "See plans", link: "#contact" },
    ],
    aboutHeading: (b) => `Meet the team at ${b}`,
    aboutText: (b) => `For over a decade, ${b} has been the trusted choice for people who value honesty, expertise, and a calm, welcoming environment.`,
    checklist: ["Licensed & insured professionals", "Upfront pricing with no hidden fees", "Convenient parking & central location"],
    testimonials: [
      { quote: "From the warm welcome at reception to the clear explanation of my options, everything felt effortless.", name: "David Chong", role: "Client", avatar: "", stars: 5 },
      { quote: "Honest, punctual, and genuinely caring. I recommend them to everyone in my family.", name: "Farah Aziz", role: "Long-term Client", avatar: "", stars: 5 },
      { quote: "Booking was simple and they solved our issue in a single visit.", name: "Kenneth Lim", role: "Business Owner", avatar: "", stars: 5 },
    ],
    pricingHeading: "Clear, upfront packages",
    pricingLead: "Honest rates with no hidden surprises.",
    plans: [
      { name: "First Consultation", price: "$49", period: "/session", features: ["Full 45-min assessment", "Written recommendations", "Credited toward full plan"], featured: false, badge: "", ctaText: "Book Session", ctaLink: "#contact" },
      { name: "Complete Care Plan", price: "$199", period: "/package", features: ["Comprehensive service package", "Priority scheduling", "Follow-up review included", "Dedicated specialist"], featured: true, badge: "Recommended", ctaText: "Choose Complete", ctaLink: "#contact" },
      { name: "Annual Family / Team", price: "$499", period: "/year", features: ["Covers up to 4 members", "Quarterly check-ins", "20% off additional services"], featured: false, badge: "", ctaText: "Contact Us", ctaLink: "#contact" },
    ],
    faqs: [
      { q: "How quickly can I book an appointment?", a: "We reserve slots every day for new clients and can usually see you within 24–48 hours." },
      { q: "Will I get a clear quote before starting?", a: "Always. We walk you through every option and cost upfront before you decide." },
      { q: "Where are you located?", a: "See our address and contact form below — we have free client parking right out front." },
    ],
    ctaHeading: "Book your visit or ask us a question today",
    ctaLead: "Our friendly team responds within a few hours during business days.",
    defaultSections: ["navbar", "hero", "features", "services", "about", "testimonials", "faq", "contact", "footer"],
  },
];

export interface PromptBuildResult {
  project: Project;
  reply: string;
  changes: string[];
  suggestions: string[];
  focusBlockId?: string | null;
}

/** Extract a brand name if the user specified one, e.g. "called Velvet Roast", "named NovaPay", "for Sweet Crumb" */
export function extractBrandName(prompt: string): string | null {
  const patterns = [
    /(?:called|named|titled|brand\s+name\s+is|rename(?:\s+it|\s+the\s+website|\s+website|\s+site)?\s+to|name\s+it)\s+["'“”]?([A-Z0-9][A-Za-z0-9&'’.\- ]{1,32}?)["'“”]?(?=\s+(?:with|that|and|in|using|featuring|where|which|for|on|to)\b|[,.!?]|$)/i,
    /["'“”]([A-Za-z0-9][A-Za-z0-9&'’.\- ]{1,30})["'“”]\s+(?:website|site|store|shop|studio|cafe|bakery|clinic|agency|portfolio|app)/i,
    /(?:website|site|page|store|shop)\s+for\s+["'“”]?([A-Z][A-Za-z0-9&'’.\- ]{1,28}?)["'“”]?(?=\s+(?:with|that|and|in|using|featuring|where|which)\b|[,.!?]|$)/,
  ];
  for (const re of patterns) {
    const match = prompt.match(re);
    if (match?.[1]) {
      const cleaned = match[1].trim().replace(/\s+/g, " ");
      const stopWords = /^(a|an|the|my|our|small|local|modern|dark|light|cool|new|free|online|business|company|startup|website)$/i;
      if (!stopWords.test(cleaned) && cleaned.length >= 2 && cleaned.length <= 34) {
        return cleaned;
      }
    }
  }
  return null;
}

function detectArchetype(prompt: string): ArchetypeBlueprint {
  const lower = prompt.toLowerCase();
  let best = ARCHETYPES[1]; // default SaaS/modern if generic, or check scores
  let bestScore = 0;
  for (const arch of ARCHETYPES) {
    let score = 0;
    for (const kw of arch.keywords) {
      if (lower.includes(kw)) score += kw.length >= 6 ? 3 : 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }
  if (bestScore === 0) {
    // Check general cues
    if (/menu|eat|drink|dish|cook|chef|dine|latte|cake|bread/.test(lower)) return ARCHETYPES[0];
    if (/workout|muscle|run|sweat|weight|stretch|wellness/.test(lower)) return ARCHETYPES[2];
    if (/skin|glow|cream|serum|perfume|dress|wear|cart|buy/.test(lower)) return ARCHETYPES[3];
    if (/photo|design|art|film|shoot|gallery|work|minimal/.test(lower)) return ARCHETYPES[4];
    if (/patient|client|law|tax|home|repair|doctor|care|learn|class/.test(lower)) return ARCHETYPES[5];
  }
  return best;
}

function detectThemeOverrides(prompt: string, fallbackPresetId?: string): { themePatch: Partial<Theme>; label?: string } {
  const lower = prompt.toLowerCase();
  let matchedPreset: ThemePreset | undefined;

  if (/\b(obsidian|luxury\s+dark|dark\s+gold|black\s+and\s+gold|gold\s+theme)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "obsidian-gold");
  } else if (/\b(dark\s+mode|dark\s+theme|midnight|neon|cyber|futuristic|night\s+mode|black\s+background)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "midnight-neon");
  } else if (/\b(emerald|forest|green|botanical|mint|sage|eco|organic)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "emerald-studio");
  } else if (/\b(espresso|coffee|warm\s+brown|terracotta|beige|cream|earthy|cozy)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "warm-espresso");
  } else if (/\b(ocean|blue|navy|sapphire|sky|teal|aqua)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "ocean-breeze");
  } else if (/\b(coral|pink|rose|sunset|red|orange|vibrant|playful)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "sunset-coral");
  } else if (/\b(minimal|minimalist|editorial|monochrome|stone|black\s+and\s+white)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "editorial-stone");
  } else if (/\b(violet|purple|webloom|indigo|lavender)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "webloom-violet");
  } else if (/\b(light\s+mode|light\s+theme|white\s+background|bright\s+mode)\b/.test(lower)) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === "webloom-violet");
  } else if (fallbackPresetId) {
    matchedPreset = THEME_PRESETS.find((p) => p.id === fallbackPresetId);
  }

  const patch: Partial<Theme> = matchedPreset ? { ...matchedPreset.theme } : {};

  // Explicit dark/light overrides on top of color choice
  if (/\b(dark\s+mode|dark\s+theme|dark\s+background)\b/.test(lower) && patch.mode !== "dark") {
    patch.mode = "dark";
    patch.background = "#0d0b16";
    patch.text = "#f7f5ff";
    patch.muted = "#a7a1c2";
    patch.surface = "#19162b";
  } else if (/\b(light\s+mode|light\s+theme|white\s+background)\b/.test(lower) && patch.mode === "dark") {
    patch.mode = "light";
    patch.background = "#ffffff";
    patch.text = "#161224";
    patch.muted = "#5c5675";
    patch.surface = "#f4f2fb";
  }

  // Font overrides
  if (/\b(serif|editorial|classic\s+font|luxury\s+font)\b/.test(lower)) patch.font = "serif";
  else if (/\b(rounded|friendly\s+font|playful\s+font)\b/.test(lower)) patch.font = "rounded";
  else if (/\b(mono|monospace|technical\s+font|code\s+font)\b/.test(lower)) patch.font = "mono";
  else if (/\b(modern\s+font|sans-serif|clean\s+font)\b/.test(lower)) patch.font = "modern";

  // Radius overrides
  if (/\b(sharp\s+corners|square\s+corners|no\s+rounding)\b/.test(lower)) patch.radius = 2;
  else if (/\b(pill|super\s+rounded|extra\s+rounded|rounder)\b/.test(lower)) patch.radius = 24;

  return {
    themePatch: patch,
    label: matchedPreset?.name,
  };
}

const SECTION_KEYWORDS: { type: BlockType; label: string; regex: RegExp }[] = [
  { type: "hero", label: "Hero banner", regex: /\b(hero|banner|header\s+section|opening\s+section)\b/i },
  { type: "features", label: "Features", regex: /\b(features?|highlights?|benefits?|why\s+choose\s+us)\b/i },
  { type: "services", label: "Services", regex: /\b(services?|menu|offerings?|programs?|classes|products?|packages)\b/i },
  { type: "about", label: "About section", regex: /\b(about(\s+us)?|our\s+story|mission|bio|who\s+we\s+are)\b/i },
  { type: "pricing", label: "Pricing plans", regex: /\b(pric(?:e|es|ing)|plans?|tiers?|memberships?|rates|cost)\b/i },
  { type: "testimonials", label: "Testimonials", regex: /\b(testimonials?|reviews?|quotes?|social\s+proof|happy\s+customers)\b/i },
  { type: "faq", label: "FAQ", regex: /\b(faqs?|questions|q\s*&\s*a|frequently\s+asked)\b/i },
  { type: "team", label: "Team section", regex: /\b(team|staff|founders?|doctors?|coaches?|trainers?|instructors?|crew)\b/i },
  { type: "gallery", label: "Photo gallery", regex: /\b(gallery|photos?|portfolio\s+grid|lookbook|showcase|pictures)\b/i },
  { type: "blogList", label: "Blog / news", regex: /\b(blog|articles?|news|posts?|journal|stories)\b/i },
  { type: "newsletter", label: "Newsletter", regex: /\b(newsletter|email\s+signup|subscribe|mailing\s+list)\b/i },
  { type: "countdown", label: "Countdown timer", regex: /\b(countdown|timer|launch\s+clock|event\s+countdown)\b/i },
  { type: "contact", label: "Contact form", regex: /\b(contact|form|get\s+in\s+touch|inquir(?:e|y)|booking|location|address)\b/i },
  { type: "cta", label: "Call to action", regex: /\b(cta|call\s+to\s+action|closing\s+banner)\b/i },
  { type: "scene3d", label: "3D scene", regex: /\b(3d|three\s*d|cube|diamond\s+scene)\b/i },
];

function createTailoredBlock(
  type: BlockType,
  arch: ArchetypeBlueprint,
  brandName: string,
  themeMode: "light" | "dark"
): Block {
  const b = createBlock(type);
  switch (type) {
    case "navbar":
      b.props = {
        ...b.props,
        logoText: brandName,
        links: [
          { label: "Home", link: "index.html" },
          { label: "Services", link: "#services" },
          { label: "About", link: "#about" },
          { label: "Contact", link: "#contact" },
        ],
        showCta: true,
        ctaText: arch.primaryCta,
        ctaLink: "#contact",
        variant: themeMode === "dark" ? "dark" : "light",
      };
      break;
    case "hero":
      b.props = {
        ...b.props,
        variant: themeMode === "dark" ? "dark" : "split",
        eyebrow: arch.eyebrow,
        heading: arch.heading(brandName),
        lead: arch.lead(brandName),
        badge: arch.badge,
        showBadge: true,
        primaryText: arch.primaryCta,
        primaryLink: "#contact",
        secondaryText: arch.secondaryCta,
        secondaryLink: "#services",
        showSecondary: true,
        image: arch.heroImage,
        stats: arch.stats,
        showStats: true,
      };
      break;
    case "features":
      b.props = {
        ...b.props,
        variant: "cards",
        eyebrow: "WHY CHOOSE US",
        heading: arch.featuresHeading,
        lead: arch.featuresLead,
        items: clone(arch.features),
      };
      break;
    case "services":
      b.props = {
        ...b.props,
        eyebrow: "WHAT WE OFFER",
        heading: arch.servicesHeading,
        lead: arch.servicesLead,
        items: clone(arch.services),
      };
      break;
    case "about":
      b.props = {
        ...b.props,
        variant: "image-left",
        eyebrow: `ABOUT ${brandName.toUpperCase()}`,
        heading: arch.aboutHeading(brandName),
        text: arch.aboutText(brandName),
        checklist: [...arch.checklist],
        image: arch.secondaryImage,
        showButton: true,
        buttonText: arch.primaryCta,
        buttonLink: "#contact",
      };
      break;
    case "testimonials":
      b.props = {
        ...b.props,
        eyebrow: "CLIENT LOVE",
        heading: `Why people love ${brandName}`,
        lead: "Real stories from customers and clients we work with every day.",
        items: clone(arch.testimonials),
      };
      break;
    case "pricing":
      b.props = {
        ...b.props,
        eyebrow: "PRICING & PACKAGES",
        heading: arch.pricingHeading,
        lead: arch.pricingLead,
        plans: clone(arch.plans),
      };
      break;
    case "faq":
      b.props = {
        ...b.props,
        eyebrow: "FAQ",
        heading: "Frequently asked questions",
        lead: `Everything you need to know about ${brandName}.`,
        items: clone(arch.faqs),
      };
      break;
    case "cta":
      b.props = {
        ...b.props,
        heading: arch.ctaHeading,
        lead: arch.ctaLead,
        primaryText: arch.primaryCta,
        primaryLink: "#contact",
        showSecondary: true,
        secondaryText: arch.secondaryCta,
        secondaryLink: "#",
      };
      break;
    case "contact":
      b.props = {
        ...b.props,
        variant: "split",
        eyebrow: "GET IN TOUCH",
        heading: `Connect with ${brandName}`,
        lead: "Send us a message below and our team will get back to you within one business day.",
        email: `hello@${brandName.toLowerCase().replace(/[^a-z0-9]/g, "") || "webloom"}.com`,
        phone: "+60 12-345 6789",
        address: "128 Bloom Avenue, Studio 4",
        buttonText: arch.primaryCta,
      };
      break;
    case "footer":
      b.props = {
        ...b.props,
        logoText: brandName,
        blurb: arch.lead(brandName),
        copyright: `© ${new Date().getFullYear()} ${brandName}. Built with Webloom.`,
      };
      break;
    case "gallery":
      b.props = {
        ...b.props,
        eyebrow: "VISUAL SHOWCASE",
        heading: `Inside ${brandName}`,
        cols: 3,
        images: [
          { src: arch.heroImage, alt: `${brandName} highlight 1`, caption: "Signature experience" },
          { src: arch.secondaryImage, alt: `${brandName} highlight 2`, caption: "Crafted details" },
          { src: "/images/tpl-portfolio.jpg", alt: `${brandName} highlight 3`, caption: "Behind the scenes" },
        ],
      };
      break;
    case "scene3d":
      b.props = {
        ...b.props,
        title: `${brandName} in 3D`,
        description: "Interactive CSS 3D showcase — drag or customize in Webloom Pro.",
        background: "#100b24",
        height: 400,
        perspective: 900,
        animate: true,
        objects: [
          sceneObject("cube", 0),
          { ...sceneObject("diamond", 1), x: 68, y: 54, size: 62 },
        ],
      };
      break;
    default:
      break;
  }
  return b;
}

export function applyPromptToProject(
  currentProject: Project,
  rawPrompt: string,
  options?: { plan?: "free" | "pro"; forceFullBuild?: boolean }
): PromptBuildResult {
  const prompt = rawPrompt.trim();
  const lower = prompt.toLowerCase();
  const plan = options?.plan ?? "free";
  const next = clone(currentProject);
  const page: Page = next.pages[0] || {
    id: uid("p"),
    name: "Home",
    slug: "index",
    seo: { title: next.name, description: "" },
    blocks: [],
  };
  if (!next.pages.length) next.pages.push(page);

  const changes: string[] = [];
  let focusBlockId: string | null = null;

  // Detect if the user is asking for a full site generation vs an incremental edit
  const isDefaultStarter =
    next.name === "My new website" &&
    page.blocks.length <= 5 &&
    page.blocks.some((b) => b.type === "hero" && b.props.heading === "Grow something beautiful online");

  const hasFullBuildIntent =
    options?.forceFullBuild ||
    /\b(build|create|generate|design|make|start)\s+(?:me\s+)?(?:a|an|my|our|the|new)\b/i.test(prompt) ||
    /\b(website|site|landing\s+page|store|homepage|webpage)\s+(?:for|about|called|named)\b/i.test(prompt) ||
    /\bi\s+(?:want|need)\s+(?:a|an)\s+/i.test(prompt) ||
    (isDefaultStarter &&
      !/^(add|remove|delete|change|update|make\s+the|switch|set|rename|turn)\b/i.test(prompt));

  const arch = detectArchetype(prompt);
  const extractedBrand = extractBrandName(prompt);

  if (hasFullBuildIntent) {
    const brandName =
      extractedBrand ||
      (next.name && next.name !== "My new website" ? next.name : arch.defaultBrand);

    next.name = brandName;
    next.seo = {
      title: `${brandName} — ${arch.label}`,
      description: arch.lead(brandName),
    };

    const { themePatch, label: presetLabel } = detectThemeOverrides(prompt, arch.presetId);
    Object.assign(next.theme, themePatch);
    changes.push(`Built ${arch.label}`);
    if (presetLabel) changes.push(`Theme: ${presetLabel}`);

    // Determine sections to include
    const requestedTypes = SECTION_KEYWORDS.filter((k) => k.regex.test(prompt))
      .map((k) => k.type)
      .filter((t) => t !== "scene3d" || plan === "pro");

    const orderedMiddle: BlockType[] = [];
    const baseMiddle = arch.defaultSections.filter((t) => t !== "navbar" && t !== "footer");
    for (const t of baseMiddle) {
      if (!orderedMiddle.includes(t)) orderedMiddle.push(t);
    }
    for (const t of requestedTypes) {
      if (t !== "navbar" && t !== "footer" && !orderedMiddle.includes(t)) {
        // Insert before contact/cta if present
        const contactIdx = orderedMiddle.findIndex((x) => x === "contact" || x === "cta");
        if (contactIdx >= 0) orderedMiddle.splice(contactIdx, 0, t);
        else orderedMiddle.push(t);
      }
    }

    const fullTypes: BlockType[] = ["navbar", ...orderedMiddle, "footer"];
    page.blocks = fullTypes.map((type) =>
      createTailoredBlock(type, arch, brandName, next.theme.mode)
    );
    page.seo = {
      title: `${brandName} — Official Website`,
      description: arch.lead(brandName),
    };

    // Check if user also asked for extra pages (e.g. "with About and Contact pages")
    if (/\babout\s+page\b/i.test(prompt) && !next.pages.some((p) => p.slug === "about")) {
      next.pages.push({
        id: uid("p"),
        name: "About",
        slug: "about",
        seo: { title: `About — ${brandName}`, description: arch.aboutText(brandName) },
        blocks: [
          createTailoredBlock("navbar", arch, brandName, next.theme.mode),
          createTailoredBlock("about", arch, brandName, next.theme.mode),
          createTailoredBlock("team", arch, brandName, next.theme.mode),
          createTailoredBlock("footer", arch, brandName, next.theme.mode),
        ],
      });
      changes.push("+ About page");
    }

    const heroBlock = page.blocks.find((b) => b.type === "hero");
    focusBlockId = heroBlock?.id ?? page.blocks[0]?.id ?? null;
    next.updatedAt = Date.now();

    const sectionNames = orderedMiddle
      .map((t) => SECTION_KEYWORDS.find((k) => k.type === t)?.label || t)
      .join(", ");

    return {
      project: next,
      reply: `I built your **${brandName}** website (${arch.label}) with ${presetLabel || "a custom"} style and ${orderedMiddle.length} sections: ${sectionNames}. Keep chatting to tweak anything — colors, headlines, sections, or pages!`,
      changes,
      suggestions: [
        "Switch to dark mode with neon accents",
        orderedMiddle.includes("pricing") ? "Add a team section and newsletter" : "Add a pricing section with 3 plans",
        "Make the corners rounder and use a serif font",
      ],
      focusBlockId,
    };
  }

  // Incremental / conversational edits on the existing website
  const brandName = extractedBrand || next.name || arch.defaultBrand;

  // 1. Check brand rename
  if (extractedBrand || /\b(rename|call\s+it|name\s+the\s+website|change\s+(?:the\s+)?name\s+to)\b/i.test(lower)) {
    const newBrand =
      extractedBrand ||
      prompt.replace(/^.*?\b(?:rename(?:\s+it|\s+the\s+website)?\s+to|call\s+it|name\s+it)\s+/i, "").replace(/[.!?]+$/, "").trim();
    if (newBrand && newBrand.length <= 40) {
      next.name = newBrand;
      next.seo.title = newBrand;
      page.blocks.forEach((b) => {
        if (b.type === "navbar" || b.type === "footer") b.props.logoText = newBrand;
        if (b.type === "footer") b.props.copyright = `© ${new Date().getFullYear()} ${newBrand}. All rights reserved.`;
      });
      changes.push(`Renamed to ${newBrand}`);
    }
  }

  // 2. Check theme / color / font / mode changes
  const hasThemeCue =
    /\b(color|theme|palette|mode|dark|light|font|serif|rounded|mono|corners?|radius|violet|purple|emerald|green|ocean|blue|espresso|brown|coral|pink|gold|luxury|minimal|neon)\b/i.test(lower);
  if (hasThemeCue) {
    const { themePatch, label } = detectThemeOverrides(prompt);
    if (Object.keys(themePatch).length > 0) {
      Object.assign(next.theme, themePatch);
      page.blocks.forEach((b) => {
        if (b.type === "navbar" && themePatch.mode) {
          b.props.variant = themePatch.mode === "dark" ? "dark" : "light";
        }
        if (b.type === "hero" && themePatch.mode) {
          b.props.variant = themePatch.mode === "dark" ? "dark" : "split";
        }
      });
      changes.push(label ? `Theme: ${label}` : `Updated theme (${next.theme.mode})`);
    }
  }

  // 3. Check hero headline / button text updates
  const headlineMatch =
    prompt.match(/(?:headline|heading|title)\s+(?:to|say|as)\s+["'“”]([^"'“”]+)["'“”]/i) ||
    prompt.match(/(?:make|change)\s+(?:the\s+)?(?:hero\s+)?(?:headline|heading|title)\s+(?:to\s+|say\s+)?["'“”]?([^"'“”.!?]+)["'“”]?/i);
  if (headlineMatch?.[1]) {
    const hero = page.blocks.find((b) => b.type === "hero" || b.type === "heading");
    if (hero) {
      if (hero.type === "hero") hero.props.heading = headlineMatch[1].trim();
      else hero.props.text = headlineMatch[1].trim();
      focusBlockId = hero.id;
      changes.push("Updated headline");
    }
  }

  const buttonMatch =
    prompt.match(/(?:button|cta)\s+(?:text\s+)?(?:to|say)\s+["'“”]?([^"'“”.!?]+)["'“”]?/i);
  if (buttonMatch?.[1]) {
    const buttonLabel = buttonMatch[1].trim();
    const hero = page.blocks.find((b) => b.type === "hero");
    if (hero) {
      hero.props.primaryText = buttonLabel;
      focusBlockId = hero.id;
    }
    const nav = page.blocks.find((b) => b.type === "navbar");
    if (nav) nav.props.ctaText = buttonLabel;
    changes.push(`Button: “${buttonLabel}”`);
  }

  // 4. Check section removals ("remove pricing", "delete faq")
  if (/\b(remove|delete|hide|drop)\b/i.test(lower)) {
    for (const item of SECTION_KEYWORDS) {
      if (item.regex.test(lower)) {
        const before = page.blocks.length;
        page.blocks = page.blocks.filter((b) => b.type !== item.type);
        if (page.blocks.length < before) {
          changes.push(`Removed ${item.label}`);
        }
      }
    }
  }

  // 5. Check adding new pages ("add an About page", "create a Contact page")
  const pageMatch = prompt.match(/\b(?:add|create|make)\s+(?:a|an)\s+([A-Za-z]{2,18})\s+page\b/i);
  if (pageMatch?.[1]) {
    const pageTitle = pageMatch[1].charAt(0).toUpperCase() + pageMatch[1].slice(1).toLowerCase();
    const slug = pageTitle.toLowerCase();
    if (!next.pages.some((p) => p.slug === slug)) {
      const middleType: BlockType =
        slug.includes("about") ? "about" : slug.includes("pric") ? "pricing" : slug.includes("contact") ? "contact" : slug.includes("service") ? "services" : "features";
      next.pages.push({
        id: uid("p"),
        name: pageTitle,
        slug,
        seo: { title: `${pageTitle} — ${brandName}`, description: "" },
        blocks: [
          createTailoredBlock("navbar", arch, brandName, next.theme.mode),
          createTailoredBlock(middleType, arch, brandName, next.theme.mode),
          createTailoredBlock("contact", arch, brandName, next.theme.mode),
          createTailoredBlock("footer", arch, brandName, next.theme.mode),
        ],
      });
      changes.push(`+ ${pageTitle} page`);
    }
  }

  // 6. Check adding sections ("add pricing", "include testimonials and faq", or mentioning sections without remove intent)
  if (!/\b(remove|delete|hide|drop)\b/i.test(lower)) {
    for (const item of SECTION_KEYWORDS) {
      if (item.regex.test(lower)) {
        if (item.type === "scene3d" && plan !== "pro") {
          changes.push("3D scene requires Pro");
          continue;
        }
        // Avoid duplicating if user was only changing hero headline
        if (item.type === "hero" && headlineMatch) continue;
        const newBlock = createTailoredBlock(item.type, arch, brandName, next.theme.mode);
        const footerIdx = page.blocks.findIndex((b) => b.type === "footer");
        if (footerIdx >= 0) {
          page.blocks.splice(footerIdx, 0, newBlock);
        } else {
          page.blocks.push(newBlock);
        }
        focusBlockId = newBlock.id;
        changes.push(`+ ${item.label}`);
      }
    }
  }

  // 7. If nothing specific matched above, treat the prompt as a fresh website description!
  if (changes.length === 0) {
    return applyPromptToProject(currentProject, rawPrompt, { plan, forceFullBuild: true });
  }

  next.updatedAt = Date.now();
  return {
    project: next,
    reply: `Done! I updated your website: **${changes.join(" · ")}**. Remember you can click any text on the canvas to edit it directly, or tell me what to adjust next!`,
    changes,
    suggestions: [
      "Add customer testimonials and FAQ",
      next.theme.mode === "dark" ? "Switch to a warm espresso light theme" : "Switch to Midnight Neon dark mode",
      "Add a pricing table with 3 plans",
    ],
    focusBlockId,
  };
}

export const STARTER_CHAT_PROMPTS = [
  {
    label: "☕ Cozy Coffee & Bakery",
    prompt: "Build a cozy coffee shop and bakery website called Velvet Roast with warm espresso colors, menu services, about story, customer reviews, and contact",
  },
  {
    label: "🚀 Dark AI SaaS Startup",
    prompt: "Create a dark mode AI startup website called PulseFlow AI with features, 3 pricing plans, testimonials, FAQ, and call to action",
  },
  {
    label: "🌿 Clean Skincare Store",
    prompt: "Design a botanical skincare boutique called Botanical Glow with emerald green theme, product rituals, customer reviews, and newsletter",
  },
  {
    label: "🏋️ Fitness & Gym Studio",
    prompt: "Build a high-energy fitness studio website called Kinetic Pulse with classes, coaching services, membership pricing, FAQ, and trial booking",
  },
  {
    label: "📸 Creative Design Portfolio",
    prompt: "Create an editorial design studio portfolio called Atelier Nova with minimalist serif style, capabilities, client testimonials, and project inquiry",
  },
  {
    label: "🩺 Modern Clinic & Care",
    prompt: "Build a trustworthy dental & wellness clinic website called BrightCare with ocean blue theme, services, team, FAQ, and appointment form",
  },
];
