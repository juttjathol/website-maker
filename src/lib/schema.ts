/**
 * Webloom content model — the JSON-first schema.
 * A whole website is a typed JSON document (Site). The editor writes it,
 * the renderer and the static exporter read it. Single source of truth.
 */

export type Device = "desktop" | "tablet" | "mobile";

export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  /** Primary brand color (buttons, links, accents) */
  primary: string;
  /** Page background */
  background: string;
  /** Main text color */
  text: string;
  /** Secondary / muted text */
  muted: string;
  /** Subtle surface (cards, alt sections) */
  surface: string;
  /** Extra accent color */
  accent: string;
  /** Font family key — maps to a stack in site.css */
  font: "modern" | "serif" | "rounded" | "mono";
  /** Global corner radius (px) */
  radius: number;
}

export interface Seo {
  title: string;
  description: string;
  /** og image url */
  image?: string;
}

export interface BlockStyle {
  /** Vertical padding of the block wrapper (px) */
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  backgroundColor?: string;
  textColor?: string;
  /** Override accent within this block */
  accentColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  /** Max content width (px), 0 = full */
  maxWidth?: number;
  /** Content alignment */
  align?: "left" | "center" | "right";
  /** Hide on devices */
  hideOn?: Device[];
  /** Custom CSS class (advanced) */
  className?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  /** Content + settings — shape depends on type (see block registry) */
  props: Record<string, any>;
  style: BlockStyle;
  children?: Block[];
}

export interface Page {
  id: string;
  name: string;
  /** url slug, e.g. "about" → /about.html */
  slug: string;
  seo: Seo;
  blocks: Block[];
}

export interface Project {
  id: string;
  name: string;
  theme: Theme;
  seo: Seo;
  favicon?: string;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
}

/* ------------------------------------------------------------------ */
/* Block catalogue                                                     */
/* ------------------------------------------------------------------ */

export type BlockType =
  /* layout */
  | "section"
  | "columns"
  | "column"
  | "spacer"
  | "divider"
  /* content */
  | "heading"
  | "text"
  | "image"
  | "button"
  | "buttons"
  | "icon"
  | "video"
  | "gallery"
  | "list"
  | "countdown"
  | "map"
  | "social"
  | "html"
  /* sections */
  | "navbar"
  | "hero"
  | "features"
  | "about"
  | "services"
  | "testimonials"
  | "pricing"
  | "faq"
  | "contact"
  | "cta"
  | "footer"
  | "team"
  | "newsletter"
  | "blogList"
  | "popup";

export type FieldKind =
  | "text"
  | "textarea"
  | "select"
  | "color"
  | "number"
  | "toggle"
  | "link"
  | "image"
  | "icon"
  | "code"
  | "list";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: { value: string; label: string }[];
  /** for "list": the fields of one item */
  itemFields?: FieldDef[];
  /** add button label for lists */
  addLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  help?: string;
  /** show only when another prop equals value */
  showIf?: { key: string; equals: any };
}

export interface BlockDef {
  type: BlockType;
  label: string;
  category: "layout" | "content" | "sections";
  icon: string;
  description: string;
  /** default props when dropping the block */
  defaultProps: Record<string, any>;
  defaultStyle?: BlockStyle;
  /** can contain children (columns, section) */
  acceptsChildren?: boolean;
  /** fields shown in the inspector */
  fields: FieldDef[];
  /** field shown in the "Style" tab is generic; these are content fields */
}

export type EditorMode = "editor" | "preview" | "static";
