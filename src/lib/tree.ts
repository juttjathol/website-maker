/** Pure helpers for navigating/mutating the block tree. */
import type { Block, BlockStyle, BlockType, Page } from "./schema";
import { BLOCKS } from "./registry";
import { clone, uid } from "./util";

const DEFAULT_BLOCK_STYLES: Partial<Record<BlockType, BlockStyle>> = {
  section: { paddingTop: 56, paddingBottom: 56 },
  columns: { paddingTop: 24, paddingBottom: 24 },
  divider: { paddingTop: 16, paddingBottom: 16 },
  heading: { paddingTop: 10, paddingBottom: 10 },
  text: { paddingTop: 10, paddingBottom: 10 },
  image: { paddingTop: 12, paddingBottom: 12 },
  button: { paddingTop: 10, paddingBottom: 10 },
  buttons: { paddingTop: 10, paddingBottom: 10 },
  icon: { paddingTop: 10, paddingBottom: 10 },
  video: { paddingTop: 14, paddingBottom: 14 },
  gallery: { paddingTop: 18, paddingBottom: 18 },
  list: { paddingTop: 10, paddingBottom: 10 },
  countdown: { paddingTop: 12, paddingBottom: 12 },
  map: { paddingTop: 12, paddingBottom: 12 },
  social: { paddingTop: 10, paddingBottom: 10 },
  html: { paddingTop: 12, paddingBottom: 12 },
  hero: { paddingTop: 80, paddingBottom: 80 },
  features: { paddingTop: 72, paddingBottom: 72 },
  about: { paddingTop: 72, paddingBottom: 72 },
  services: { paddingTop: 72, paddingBottom: 72 },
  testimonials: { paddingTop: 72, paddingBottom: 72 },
  pricing: { paddingTop: 72, paddingBottom: 72 },
  faq: { paddingTop: 72, paddingBottom: 72 },
  contact: { paddingTop: 72, paddingBottom: 72 },
  cta: { paddingTop: 52, paddingBottom: 52 },
  team: { paddingTop: 72, paddingBottom: 72 },
  newsletter: { paddingTop: 64, paddingBottom: 64 },
  blogList: { paddingTop: 72, paddingBottom: 72 },
};

export function createBlock(type: BlockType, propsOverride?: Record<string, any>): Block {
  const def = BLOCKS[type];
  const props = { ...clone(def.defaultProps), ...(propsOverride || {}) };
  if (type === "countdown" && !props.target) {
    props.target = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 16);
  }
  const block: Block = {
    id: uid(),
    type,
    props,
    style: { ...clone(DEFAULT_BLOCK_STYLES[type] || {}), ...clone(def.defaultStyle || {}) },
    children: [],
  };
  if (type === "columns") {
    const cols = Number(props.cols) || 2;
    block.children = Array.from({ length: cols }, () => ({
      id: uid(),
      type: "column" as const,
      props: {},
      style: {},
      children: [],
    }));
  }
  return block;
}

export interface BlockLocation {
  block: Block;
  parent: Block | null;
  /** siblings array that contains this block */
  list: Block[];
  index: number;
}

export function findBlock(blocks: Block[], id: string): BlockLocation | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) return { block: b, parent: null, list: blocks, index: i };
    if (b.children?.length) {
      const found = findBlock(b.children, id);
      if (found) return { ...found, parent: found.parent ?? b };
    }
  }
  return null;
}

export function findInPage(page: Page, id: string): BlockLocation | null {
  return findBlock(page.blocks, id);
}

/** Remove a block by id (mutates copy-in-progress). Returns the removed block. */
export function removeBlock(blocks: Block[], id: string): Block | null {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) return blocks.splice(i, 1)[0] ?? null;
    if (blocks[i].children?.length) {
      const removed = removeBlock(blocks[i].children!, id);
      if (removed) return removed;
    }
  }
  return null;
}

/** Insert a block into a container (parentId null = page root). */
export function insertBlock(
  blocks: Block[],
  block: Block,
  parentId: string | null,
  index: number
): boolean {
  if (!parentId) {
    const i = Math.max(0, Math.min(index, blocks.length));
    blocks.splice(i, 0, block);
    return true;
  }
  const loc = findBlock(blocks, parentId);
  if (!loc) return false;
  const target = loc.block;
  if (!target.children) target.children = [];
  const i = Math.max(0, Math.min(index, target.children.length));
  target.children.splice(i, 0, block);
  return true;
}

/** Can `block` be a child of container with id parentId? */
export function canAccept(parentId: string | null, blocks: Block[]): boolean {
  if (!parentId) return true;
  const loc = findBlock(blocks, parentId);
  if (!loc) return false;
  return !!BLOCKS[loc.block.type]?.acceptsChildren;
}

/** Walk all blocks depth-first */
export function walkBlocks(blocks: Block[], fn: (b: Block) => void): void {
  for (const b of blocks) {
    fn(b);
    if (b.children?.length) walkBlocks(b.children, fn);
  }
}

/** Set a nested prop by path like "items.0.title" (mutates) */
export function setPropPath(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split(".");
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null) cur[p] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

/** Adjust column children count when "cols" changes */
export function syncColumns(block: Block): void {
  if (block.type !== "columns") return;
  const cols = Math.min(4, Math.max(1, Number(block.props.cols) || 2));
  if (!block.children) block.children = [];
  while (block.children.length < cols) {
    block.children.push({
      id: uid(),
      type: "column",
      props: {},
      style: {},
      children: [],
    });
  }
  if (block.children.length > cols) {
    const removed = block.children.splice(cols);
    const destination = block.children[cols - 1];
    if (destination) {
      destination.children ||= [];
      for (const column of removed) destination.children.push(...(column.children || []));
    }
  }
}

export function pageFileName(page: Page, pages: Page[]): string {
  const idx = pages.findIndex((p) => p.id === page.id);
  if (idx === 0) return "index.html";
  if (idx < 0) return `${page.slug || "page"}.html`;

  const exportSlug = (candidate: Page, pageIndex: number) => {
    const slug = candidate.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    return !slug || slug === "index" ? `page-${pageIndex + 1}` : slug;
  };
  const used = new Set<string>();
  for (let i = 1; i <= idx; i++) {
    const base = exportSlug(pages[i], i);
    let unique = base;
    let suffix = 2;
    while (used.has(unique)) unique = `${base}-${suffix++}`;
    used.add(unique);
    if (i === idx) return `${unique}.html`;
  }
  return `page-${idx + 1}.html`;
}
