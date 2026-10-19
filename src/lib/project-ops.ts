import type { Block, BlockStyle, BlockType, Project, Seo, Theme } from "./schema";
import { BLOCKS } from "./registry";
import { clone, uid } from "./util";

/** Clone a saved project into an independent website, with fresh tree IDs. */
export function duplicateProject(source: Project): Project {
  const copy = clone(source);
  copy.id = uid("pr");
  copy.name = `${source.name} (copy)`;
  copy.createdAt = Date.now();
  copy.updatedAt = copy.createdAt;
  copy.pages.forEach((page) => {
    page.id = uid("p");
    const rekey = (block: Block) => {
      block.id = uid("b");
      block.children?.forEach(rekey);
    };
    page.blocks.forEach(rekey);
  });
  return copy;
}

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normaliseSlug(value: string, fallback: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

function normaliseSeo(value: unknown, fallbackTitle: string): Seo {
  const seo = isRecord(value) ? value : {};
  return {
    title: typeof seo.title === "string" ? seo.title : fallbackTitle,
    description: typeof seo.description === "string" ? seo.description : "",
    ...(typeof seo.image === "string" ? { image: seo.image } : {}),
  };
}

function normaliseBlock(value: unknown): Block {
  if (!isRecord(value) || typeof value.type !== "string" || !Object.prototype.hasOwnProperty.call(BLOCKS, value.type)) {
    throw new Error("This backup contains an unknown or invalid content block.");
  }
  if (value.children !== undefined && !Array.isArray(value.children)) {
    throw new Error("This backup contains a malformed content block.");
  }
  const type = value.type as BlockType;
  const props = isRecord(value.props) ? value.props : {};
  const style = isRecord(value.style) ? value.style as BlockStyle : {};
  return {
    id: uid("b"),
    type,
    props: { ...clone(BLOCKS[type].defaultProps), ...props },
    style: { ...style },
    children: Array.isArray(value.children) ? value.children.map(normaliseBlock) : [],
  };
}

function normaliseTheme(value: unknown): Theme {
  const theme = isRecord(value) ? value : {};
  const font = ["modern", "serif", "rounded", "mono"].includes(theme.font) ? theme.font : "modern";
  return {
    mode: theme.mode === "dark" ? "dark" : "light",
    primary: typeof theme.primary === "string" ? theme.primary : "#6d5ae6",
    background: typeof theme.background === "string" ? theme.background : "#ffffff",
    text: typeof theme.text === "string" ? theme.text : "#161224",
    muted: typeof theme.muted === "string" ? theme.muted : "#5c5675",
    surface: typeof theme.surface === "string" ? theme.surface : "#f4f2fb",
    accent: typeof theme.accent === "string" ? theme.accent : "#e8622c",
    font,
    radius: Number.isFinite(theme.radius) ? Math.max(0, Math.min(32, Number(theme.radius))) : 14,
  };
}

/** Validate and prepare an imported JSON backup as a new independent project. */
export function prepareImportedProject(raw: unknown): Project {
  if (!isRecord(raw) || typeof raw.name !== "string" || !Array.isArray(raw.pages)) {
    throw new Error("This file does not look like a Webloom website backup.");
  }
  if (!raw.pages.length) throw new Error("This backup does not contain any pages.");

  const pagesSoFar: { slug: string }[] = [];
  const pages = raw.pages.map((value: unknown, index: number) => {
    if (!isRecord(value) || typeof value.name !== "string" || !Array.isArray(value.blocks)) {
      throw new Error("This backup contains a page that could not be read.");
    }
    const name = value.name.trim() || `Page ${index + 1}`;
    const preferred = index === 0 ? "index" : normaliseSlug(typeof value.slug === "string" ? value.slug : name, `page-${index + 1}`);
    const base = index > 0 && preferred === "index" ? `page-${index + 1}` : preferred;
    let slug = base;
    let suffix = 2;
    while (pagesSoFar.some((page) => page.slug === slug)) slug = `${base}-${suffix++}`;
    pagesSoFar.push({ slug });
    return {
      id: uid("p"),
      name,
      slug,
      seo: normaliseSeo(value.seo, name),
      blocks: value.blocks.map(normaliseBlock),
    };
  });

  const now = Date.now();
  const project: Project = {
    id: uid("pr"),
    name: raw.name.trim() ? `${raw.name.trim()} (imported)` : "Imported website",
    theme: normaliseTheme(raw.theme),
    seo: normaliseSeo(raw.seo, raw.name.trim() || "Imported website"),
    pages,
    createdAt: now,
    updatedAt: now,
  };
  if (typeof raw.favicon === "string") project.favicon = raw.favicon;
  return project;
}
