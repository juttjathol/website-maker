import type { BlockStyle } from "./schema";

/** Fast unique id */
export function uid(prefix = "b"): string {
  return (
    prefix +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36).slice(-4)
  );
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function clone<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page"
  );
}

/** Build a style object from BlockStyle for inline application */
export function blockCss(style: BlockStyle | undefined): React.CSSProperties {
  if (!style) return {};
  const s: React.CSSProperties = {};
  if (style.paddingTop != null) s.paddingTop = style.paddingTop;
  if (style.paddingBottom != null) s.paddingBottom = style.paddingBottom;
  if (style.paddingLeft != null) s.paddingLeft = style.paddingLeft;
  if (style.paddingRight != null) s.paddingRight = style.paddingRight;
  if (style.marginTop != null) s.marginTop = style.marginTop;
  if (style.marginBottom != null) s.marginBottom = style.marginBottom;
  if (style.backgroundColor) s.backgroundColor = style.backgroundColor;
  if (style.textColor) s.color = style.textColor;
  if (style.accentColor) (s as Record<string, any>)["--wk-primary"] = style.accentColor;
  if (style.borderRadius != null && style.borderWidth) {
    s.borderRadius = style.borderRadius;
  }
  if (style.borderWidth) {
    s.borderStyle = "solid";
    s.borderWidth = style.borderWidth;
    s.borderColor = style.borderColor || "rgba(0,0,0,0.12)";
    if (style.borderRadius != null) s.borderRadius = style.borderRadius;
  } else if (style.borderRadius) {
    s.borderRadius = style.borderRadius;
  }
  return s;
}

/** visibility classes from hideOn */
export function hideClass(style: BlockStyle | undefined): string {
  const hide = style?.hideOn ?? [];
  return [
    hide.includes("desktop") ? "wk-hide-desktop" : "",
    hide.includes("tablet") ? "wk-hide-tablet" : "",
    hide.includes("mobile") ? "wk-hide-mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
