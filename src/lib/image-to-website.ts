import type { Project, Theme } from "./schema";
import { applyPromptToProject } from "./text-to-build";
import { createBlock } from "./tree";
import { clone } from "./util";

export interface ImageAnalysisProfile {
  width: number;
  height: number;
  aspectRatio: number;
  mode: "light" | "dark";
  heroVariant: "split" | "centered" | "dark";
  primaryHex: string;
  accentHex: string;
  backgroundHex: string;
  surfaceHex: string;
  textHex: string;
  mutedHex: string;
  navDark: boolean;
  isTallFullPage: boolean;
  fontStyle: Theme["font"];
  radius: number;
  heroCropDataUrl: string;
  secondaryCropDataUrl: string;
  galleryCrops: string[];
  detectedBands: string[];
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [clampByte(r), clampByte(g), clampByte(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function cropRegionToDataUrl(
  img: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  maxOutWidth = 720,
  quality = 0.78
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxOutWidth / Math.max(1, sw));
  canvas.width = Math.max(80, Math.round(sw * scale));
  canvas.height = Math.max(60, Math.round(sh * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Analyze a user-supplied reference website screenshot/mockup in the browser
 * and extract its color palette, layout structure, and visual slices.
 */
export async function analyzeReferenceWebsiteImage(fileOrDataUrl: File | string): Promise<ImageAnalysisProfile> {
  const dataUrl =
    typeof fileOrDataUrl === "string"
      ? fileOrDataUrl
      : await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Could not read reference image."));
          reader.readAsDataURL(fileOrDataUrl);
        });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not decode reference image."));
    el.src = dataUrl;
  });

  const sampleW = 120;
  const sampleH = Math.max(80, Math.min(240, Math.round((img.height / Math.max(1, img.width)) * sampleW)));
  const canvas = document.createElement("canvas");
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d");
  const pixels = ctx
    ? (() => {
        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        return ctx.getImageData(0, 0, sampleW, sampleH).data;
      })()
    : new Uint8ClampedArray(0);

  let totalLum = 0;
  let navLum = 0;
  let navCount = 0;
  let bgR = 0,
    bgG = 0,
    bgB = 0,
    bgCount = 0;

  // Color buckets for vibrant primary & secondary accents
  const accentBuckets = new Map<
    number,
    { count: number; rSum: number; gSum: number; bSum: number; satSum: number }
  >();

  let leftEnergy = 0;
  let rightEnergy = 0;

  const totalPixels = Math.max(1, sampleW * sampleH);
  const navMaxY = Math.max(4, Math.floor(sampleH * 0.1));
  const heroMinY = navMaxY;
  const heroMaxY = Math.floor(sampleH * 0.48);

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const idx = (y * sampleW + x) * 4;
      const r = pixels[idx] ?? 255;
      const g = pixels[idx + 1] ?? 255;
      const b = pixels[idx + 2] ?? 255;
      const lum = luminance(r, g, b);
      totalLum += lum;

      if (y < navMaxY) {
        navLum += lum;
        navCount++;
      }

      const { h, s, l } = rgbToHsl(r, g, b);

      // Low-saturation or extreme-light/dark pixels represent the page background
      if (s < 0.18 || l > 0.9 || l < 0.12) {
        bgR += r;
        bgG += g;
        bgB += b;
        bgCount++;
      }

      // High-saturation mid-luminance pixels represent buttons, badges, and brand accents
      if (s >= 0.28 && l >= 0.18 && l <= 0.82) {
        const hueBucket = Math.floor(h / 20);
        const prev = accentBuckets.get(hueBucket) || {
          count: 0,
          rSum: 0,
          gSum: 0,
          bSum: 0,
          satSum: 0,
        };
        prev.count += 1;
        prev.rSum += r;
        prev.gSum += g;
        prev.bSum += b;
        prev.satSum += s;
        accentBuckets.set(hueBucket, prev);
      }

      // Measure left vs right visual detail in the hero band to detect split vs centered hero
      if (y >= heroMinY && y <= heroMaxY && x > 0) {
        const prevIdx = (y * sampleW + (x - 1)) * 4;
        const diff =
          Math.abs(r - (pixels[prevIdx] ?? r)) +
          Math.abs(g - (pixels[prevIdx + 1] ?? g)) +
          Math.abs(b - (pixels[prevIdx + 2] ?? b));
        if (x < sampleW / 2) leftEnergy += diff;
        else rightEnergy += diff;
      }
    }
  }

  const avgLum = totalLum / totalPixels;
  const avgNavLum = navCount ? navLum / navCount : avgLum;
  const isDark = avgLum < 0.44;
  const navDark = avgNavLum < 0.45;

  const avgBgR = bgCount ? bgR / bgCount : isDark ? 15 : 252;
  const avgBgG = bgCount ? bgG / bgCount : isDark ? 14 : 251;
  const avgBgB = bgCount ? bgB / bgCount : isDark ? 26 : 255;

  const backgroundHex = isDark
    ? rgbToHex(Math.min(32, avgBgR * 0.45), Math.min(30, avgBgG * 0.45), Math.min(48, avgBgB * 0.5))
    : rgbToHex(Math.max(242, avgBgR), Math.max(240, avgBgG), Math.max(245, avgBgB));

  const surfaceHex = isDark
    ? rgbToHex(Math.min(54, avgBgR * 0.65 + 16), Math.min(52, avgBgG * 0.65 + 16), Math.min(72, avgBgB * 0.7 + 22))
    : rgbToHex(Math.max(228, avgBgR - 12), Math.max(226, avgBgG - 12), Math.max(236, avgBgB - 8));

  const sortedAccents = [...accentBuckets.entries()].sort(
    (a, b) => b[1].count * (1 + b[1].satSum / Math.max(1, b[1].count)) - a[1].count * (1 + a[1].satSum / Math.max(1, a[1].count))
  );

  let primaryHex = isDark ? "#7c5cff" : "#6d5ae6";
  let accentHex = isDark ? "#22d3ee" : "#e8622c";

  if (sortedAccents[0] && sortedAccents[0][1].count >= 4) {
    const top = sortedAccents[0][1];
    primaryHex = rgbToHex(top.rSum / top.count, top.gSum / top.count, top.bSum / top.count);
  }
  if (sortedAccents[1] && sortedAccents[1][1].count >= 3) {
    const second = sortedAccents[1][1];
    accentHex = rgbToHex(second.rSum / second.count, second.gSum / second.count, second.bSum / second.count);
  } else {
    accentHex = primaryHex;
  }

  const textHex = isDark ? "#f8f7ff" : "#161224";
  const mutedHex = isDark ? "#a9a3c4" : "#5c5675";

  // Hero layout detection: if left and right energy are nearly equal, it's centered; otherwise split
  const asymmetry = Math.abs(leftEnergy - rightEnergy) / Math.max(1, leftEnergy + rightEnergy);
  const heroVariant: "split" | "centered" | "dark" = isDark
    ? "dark"
    : asymmetry < 0.14
      ? "centered"
      : "split";

  const aspectRatio = img.height / Math.max(1, img.width);
  const isTallFullPage = aspectRatio > 1.15;

  // Create visual crops from the reference image so the generated website mirrors the screenshot
  const w = img.width;
  const h = img.height;

  const heroCropDataUrl = isTallFullPage
    ? cropRegionToDataUrl(img, 0, Math.round(h * 0.04), w, Math.round(h * 0.36), 720, 0.78)
    : cropRegionToDataUrl(img, 0, 0, w, h, 720, 0.8);

  const secondaryCropDataUrl = isTallFullPage
    ? cropRegionToDataUrl(img, 0, Math.round(h * 0.38), w, Math.round(h * 0.32), 680, 0.76)
    : cropRegionToDataUrl(
        img,
        Math.round(w * 0.08),
        Math.round(h * 0.12),
        Math.round(w * 0.84),
        Math.round(h * 0.76),
        680,
        0.76
      );

  const galleryCrops = [
    cropRegionToDataUrl(img, 0, 0, w, Math.round(h * 0.45), 480, 0.72),
    cropRegionToDataUrl(img, 0, Math.round(h * 0.28), w, Math.round(h * 0.45), 480, 0.72),
    cropRegionToDataUrl(img, 0, Math.round(h * 0.52), w, Math.round(h * 0.48), 480, 0.72),
  ].filter(Boolean);

  const detectedBands = [
    navDark ? "Dark Header Bar" : "Clean Top Navbar",
    heroVariant === "centered"
      ? "Centered Visual Hero"
      : heroVariant === "dark"
        ? "Dark Spotlight Hero"
        : "Split 2-Column Hero",
    "3-Column Feature Cards",
    "Visual Split Showcase",
    ...(isTallFullPage ? ["Reference Gallery Grid", "Pricing & Packages", "FAQ & Contact"] : ["Reference Gallery Grid", "Contact & Footer"]),
  ];

  return {
    width: w,
    height: h,
    aspectRatio,
    mode: isDark ? "dark" : "light",
    heroVariant,
    primaryHex,
    accentHex,
    backgroundHex,
    surfaceHex,
    textHex,
    mutedHex,
    navDark,
    isTallFullPage,
    fontStyle: isDark ? "modern" : "modern",
    radius: isDark ? 16 : 14,
    heroCropDataUrl,
    secondaryCropDataUrl,
    galleryCrops,
    detectedBands,
  };
}

/**
 * Build a complete, editable Webloom Project that clones the visual look,
 * color palette, layout structure, and visual sections of the user's reference image.
 */
export function buildProjectFromReferenceAnalysis(
  currentProject: Project,
  analysis: ImageAnalysisProfile,
  userPrompt = "",
  plan: "free" | "pro" = "pro"
): {
  project: Project;
  reply: string;
  changes: string[];
  suggestions: string[];
  focusBlockId: string | null;
} {
  const effectivePrompt =
    userPrompt.trim() ||
    `Build a modern ${analysis.mode === "dark" ? "dark mode" : "light mode"} website with hero, features, about, gallery, pricing and contact`;

  const baseResult = applyPromptToProject(currentProject, effectivePrompt, {
    plan,
    forceFullBuild: true,
  });

  const next = clone(baseResult.project);

  // 1. Apply the exact color palette extracted from the reference screenshot
  next.theme = {
    mode: analysis.mode,
    primary: analysis.primaryHex,
    background: analysis.backgroundHex,
    surface: analysis.surfaceHex,
    text: analysis.textHex,
    muted: analysis.mutedHex,
    accent: analysis.accentHex,
    font: analysis.fontStyle,
    radius: analysis.radius,
  };

  const page = next.pages[0];
  if (page) {
    // 2. Customize Navbar, Hero, About, and Gallery to mirror the reference image
    for (const block of page.blocks) {
      if (block.type === "navbar") {
        block.props.variant = analysis.navDark ? "dark" : "light";
      }
      if (block.type === "hero") {
        block.props.variant = analysis.heroVariant;
        if (analysis.heroCropDataUrl) {
          block.props.image = analysis.heroCropDataUrl;
        }
      }
      if (block.type === "about" && analysis.secondaryCropDataUrl) {
        block.props.image = analysis.secondaryCropDataUrl;
      }
    }

    // 3. Ensure a Gallery section showcasing the reference layout slices is included so the user has the exact visuals on-canvas
    const hasGallery = page.blocks.some((b) => b.type === "gallery");
    if (!hasGallery && analysis.galleryCrops.length > 0) {
      const galleryBlock = createBlock("gallery");
      galleryBlock.props = {
        ...galleryBlock.props,
        eyebrow: "REFERENCE DESIGN SECTIONS",
        heading: `${next.name} Visual Showcase`,
        cols: 3,
        images: analysis.galleryCrops.map((src, i) => ({
          src,
          alt: `Reference design section ${i + 1}`,
          caption: i === 0 ? "Header & Hero Layout" : i === 1 ? "Core Content Section" : "Lower Page Showcase",
        })),
      };
      const aboutIdx = page.blocks.findIndex((b) => b.type === "about");
      if (aboutIdx >= 0) {
        page.blocks.splice(aboutIdx + 1, 0, galleryBlock);
      } else {
        const footerIdx = page.blocks.findIndex((b) => b.type === "footer");
        if (footerIdx >= 0) page.blocks.splice(footerIdx, 0, galleryBlock);
        else page.blocks.push(galleryBlock);
      }
    }

    // 4. Ensure About section is included if not already present so the secondary reference crop is editable
    if (!page.blocks.some((b) => b.type === "about") && analysis.secondaryCropDataUrl) {
      const aboutBlock = createBlock("about");
      aboutBlock.props = {
        ...aboutBlock.props,
        eyebrow: "DESIGNED YOUR WAY",
        heading: `Crafted for ${next.name}`,
        text: "We matched your reference website’s colors, layout structure, and visual sections. Click any text, button, or image on the page to customize it in your own way.",
        image: analysis.secondaryCropDataUrl,
        checklist: [
          `Matched primary color (${analysis.primaryHex})`,
          `Matched ${analysis.mode} mode background (${analysis.backgroundHex})`,
          "100% editable sections, text & images",
        ],
      };
      const heroIdx = page.blocks.findIndex((b) => b.type === "hero");
      if (heroIdx >= 0) page.blocks.splice(heroIdx + 1, 0, aboutBlock);
    }
  }

  const heroBlock = page?.blocks.find((b) => b.type === "hero");
  const changes = [
    "Cloned Reference Layout",
    `Palette: ${analysis.primaryHex} / ${analysis.backgroundHex}`,
    `${analysis.mode === "dark" ? "Dark" : "Light"} Mode`,
    ...analysis.detectedBands.slice(0, 2),
  ];

  return {
    project: next,
    reply: `I analyzed your reference website image and built an editable copy on your canvas! I matched its **${analysis.mode} mode** palette (**${analysis.primaryHex}** primary, **${analysis.backgroundHex}** background, **${analysis.accentHex}** accent), **${analysis.heroVariant} hero layout**, and visual sections. Click any text, image, or block on the page to customize it in your own way!`,
    changes,
    suggestions: [
      "Add a 3D motion graphics scene",
      "Add a pricing table with 3 plans",
      "Change the brand name and headline",
    ],
    focusBlockId: heroBlock?.id ?? page?.blocks[0]?.id ?? null,
  };
}
