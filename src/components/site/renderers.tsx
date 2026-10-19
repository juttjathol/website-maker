/**
 * Site renderers — every block type, rendered as pure React components.
 * Used by (1) the editor canvas and (2) the static exporter via
 * renderToStaticMarkup, guaranteeing the exported site matches the preview.
 * No hooks allowed in here (must work in renderToStaticMarkup).
 */
import React from "react";
import type { Block, EditorMode } from "@/lib/schema";
import { blockCss, cx, hideClass } from "@/lib/util";
import { Icon, SocialIcon } from "./icons";

/* --------------------------------- helpers -------------------------------- */

/** In editor mode, marks a text node as inline-editable via data-wk-edit path */
function ed(mode: EditorMode, path: string) {
  return mode === "editor"
    ? ({
        "data-wk-edit": path,
        contentEditable: true,
        suppressContentEditableWarning: true,
        spellCheck: true,
      } as any)
    : {};
}

interface ViewProps {
  block: Block;
  children: React.ReactNode;
  as?: any;
  className?: string;
  /** extra inline style merged over block style */
  style?: React.CSSProperties;
  mode?: EditorMode;
}

export function BlockView({
  block, children, as: Tag = "div", className, style,
}: ViewProps) {
  return (
    <Tag
      data-block-id={block.id}
      id={block.props?.anchorId || undefined}
      className={cx("wk-block", hideClass(block.style), block.style?.className, className)}
      style={{ ...blockCss(block.style), ...style }}
    >
      {children}
    </Tag>
  );
}

function Wrap({ block, children, className }: { block: Block; children: React.ReactNode; className?: string }) {
  const st = block.style || {};
  const inner: React.CSSProperties = {};
  if (st.maxWidth && st.maxWidth > 0) {
    inner.maxWidth = st.maxWidth;
    inner.marginLeft = "auto";
    inner.marginRight = "auto";
  }
  return (
    <div className={cx("wk-wrap", className)} style={inner}>
      {children}
    </div>
  );
}

function Btn({
  text, link, variant = "primary", size = "md", newTab, mode, path,
}: {
  text: string; link: string; variant?: string; size?: string; newTab?: boolean;
  mode?: EditorMode; path?: string;
}) {
  return (
    <a
      className={`wk-btn wk-btn-${variant} ${size !== "md" ? `wk-btn-${size}` : ""}`}
      href={link || "#"}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      {...(path && mode ? ed(mode, path) : {})}
    >
      {text}
    </a>
  );
}

function youtubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{6,})/) ||
    url.match(/v=([\w-]{6,})/);
  return m ? m[1] : null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function videoEmbed(url: string): string | null {
  const y = youtubeId(url);
  if (y) return `https://www.youtube.com/embed/${y}`;
  const v = vimeoId(url);
  if (v) return `https://player.vimeo.com/video/${v}`;
  return null;
}

function splitText(text: string): string[] {
  return String(text || "").split(/\n{2,}/);
}

function Eyebrow({ children, mode, path }: any) {
  return (
    <p className="wk-eyebrow" {...ed(mode, path)}>{children}</p>
  );
}

/* --------------------------------- renderers ------------------------------- */

function SectionBlock({ block, mode, renderChildren }: RProps) {
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>{renderChildren(block.children, mode)}</Wrap>
    </BlockView>
  );
}

function ColumnsBlock({ block, mode, renderChildren }: RProps) {
  const cols = Math.min(4, Math.max(1, Number(block.props.cols) || 2));
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div
          className={`wk-columns wk-cols-${cols}`}
          style={{ gap: block.props.gap != null ? block.props.gap : 28 }}
          data-columns-id={block.id}
        >
          {renderChildren(block.children, mode)}
        </div>
      </Wrap>
    </BlockView>
  );
}

function ColumnBlock({ block, mode, renderChildren }: RProps) {
  return (
    <div className="wk-column" data-block-id={block.id} data-column-id={block.id}>
      {renderChildren(block.children, mode)}
    </div>
  );
}

function SpacerBlock({ block }: RProps) {
  return <div className="wk-spacer" data-block-id={block.id} style={{ height: Number(block.props.size) || 40 }} />;
}

function DividerBlock({ block }: RProps) {
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <hr className={block.props.variant === "dots" ? "wk-divider wk-divider-dots" : "wk-divider"} />
      </Wrap>
    </BlockView>
  );
}

function HeadingBlock({ block, mode }: RProps) {
  const level = ["h1", "h2", "h3", "h4"].includes(block.props.level) ? block.props.level : "h2";
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        {React.createElement(
          level,
          {
            className: `wk-heading wk-${level}`,
            style: { textAlign: block.style?.align || "left" },
            ...ed(mode, "text"),
          },
          block.props.text
        )}
      </Wrap>
    </BlockView>
  );
}

function TextBlock({ block, mode }: RProps) {
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-text" style={{ textAlign: block.style?.align || "left" }} {...ed(mode, "text")}>
          {splitText(block.props.text).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Wrap>
    </BlockView>
  );
}

function ImageBlock({ block, mode }: RProps) {
  const shape = block.props.shape === "square" ? "" : block.props.shape === "round" ? "wk-image-round" : "";
  const img = (
    <img
      src={block.props.src}
      alt={block.props.alt || ""}
      loading="lazy"
      {...(mode === "editor" ? {} : {})}
    />
  );
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <figure className={cx("wk-image", shape)} style={{ margin: 0, textAlign: block.style?.align || "left" }}>
          {block.props.link ? (
            <a href={block.props.link} style={{ display: "block" }}>{img}</a>
          ) : (
            img
          )}
          {block.props.caption ? (
            <figcaption {...ed(mode, "caption")}>{block.props.caption}</figcaption>
          ) : null}
        </figure>
      </Wrap>
    </BlockView>
  );
}

function ButtonBlock({ block, mode }: RProps) {
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div style={{ textAlign: block.style?.align || "left" }}>
          <Btn
            text={block.props.text || "Button"}
            link={block.props.link || "#"}
            variant={block.props.variant || "primary"}
            size={block.props.size || "md"}
            newTab={block.props.newTab}
            mode={mode}
            path="text"
          />
        </div>
      </Wrap>
    </BlockView>
  );
}

function ButtonsBlock({ block, mode }: RProps) {
  const buttons: any[] = block.props.buttons || [];
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-buttons" style={{ justifyContent: block.style?.align === "center" ? "center" : block.style?.align === "right" ? "flex-end" : "flex-start" }}>
          {buttons.map((b, i) => (
            <Btn key={i} {...b} mode={mode} path={`buttons.${i}.text`} />
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function IconBlock({ block }: RProps) {
  const size = Number(block.props.size) || 52;
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div
          className={block.props.variant === "plain" ? "" : "wk-icon"}
          style={{
            textAlign: block.style?.align || "left",
            width: size, height: size,
            ...(block.props.variant === "plain" ? { display: "inline-flex", color: "var(--wk-primary)" } : {}),
          }}
        >
          <Icon name={block.props.icon} size={Math.round(size * 0.5)} />
        </div>
      </Wrap>
    </BlockView>
  );
}

function VideoBlock({ block }: RProps) {
  const src = videoEmbed(block.props.url || "");
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-video">
          {src ? (
            <iframe
              src={src}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", padding: 20, textAlign: "center" }}>
              Paste a YouTube or Vimeo link in the settings panel
            </div>
          )}
        </div>
      </Wrap>
    </BlockView>
  );
}

function GalleryBlock({ block }: RProps) {
  const images: any[] = block.props.images || [];
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-gallery">
          {images.map((im, i) => (
            <img key={i} src={im.src} alt={im.alt || ""} loading="lazy" />
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function ListBlock({ block, mode }: RProps) {
  const items: any[] = block.props.items || [];
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <ul className="wk-list">
          {items.map((it, i) => (
            <li key={i}>
              <span className="wk-check">✓</span>
              <span {...ed(mode, `items.${i}.text`)}>{it.text}</span>
            </li>
          ))}
        </ul>
      </Wrap>
    </BlockView>
  );
}

function CountdownBlock({ block, mode }: RProps) {
  const target = block.props.target || "";
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div style={{ textAlign: block.style?.align || "left" }}>
          {block.props.label ? (
            <p className="wk-h4" style={{ marginBottom: 16 }} {...ed(mode, "label")}>{block.props.label}</p>
          ) : null}
          <div
            className="wk-countdown"
            data-countdown={target}
            data-variant={block.props.variant || "boxes"}
            style={{ justifyContent: block.style?.align === "center" ? "center" : "flex-start" }}
          >
            {[
              ["00", "Days"],
              ["00", "Hours"],
              ["00", "Mins"],
              ["00", "Secs"],
            ].map(([v, l]) => (
              <div key={l} className="wk-countdown-item">
                <strong data-cd={l.toLowerCase()}>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </BlockView>
  );
}

function MapBlock({ block }: RProps) {
  const q = encodeURIComponent(block.props.query || "Kuala Lumpur, Malaysia");
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-map">
          <iframe
            src={`https://maps.google.com/maps?q=${q}&z=${Number(block.props.zoom) || 14}&output=embed`}
            title="Map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Wrap>
    </BlockView>
  );
}

function SocialBlock({ block }: RProps) {
  const items: any[] = block.props.items || [];
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-social" style={{ justifyContent: block.style?.align === "center" ? "center" : "flex-start" }}>
          {items.map((it, i) => (
            <a key={i} href={it.url || "#"} target="_blank" rel="noreferrer" aria-label={it.platform}>
              <SocialIcon platform={it.platform} />
            </a>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function HtmlBlock({ block, mode }: RProps) {
  const code = block.props.code || "";
  if (mode !== "static") {
    const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:8px;font-family:system-ui,sans-serif;color:#28243c}body{min-height:80px}</style></head><body>${code}</body></html>`;
    return (
      <BlockView block={block} className="wk-section">
        <Wrap block={block}>
          <iframe className="wk-embed wk-code-frame" title="Custom code preview" sandbox="allow-scripts allow-forms allow-popups" srcDoc={srcDoc} loading="lazy" />
        </Wrap>
      </BlockView>
    );
  }
  return (
    <BlockView block={block} className="wk-section">
      <Wrap block={block}>
        <div className="wk-embed" dangerouslySetInnerHTML={{ __html: code }} />
      </Wrap>
    </BlockView>
  );
}

/* ------------------------------- big sections ------------------------------ */

function NavbarBlock({ block, mode }: RProps) {
  const p = block.props;
  const links: any[] = p.links || [];
  return (
    <BlockView block={block} as="header" className={cx("wk-navbar", p.variant === "dark" ? "wk-nav-dark" : "")}>
      <Wrap block={block}>
        <div className="wk-navbar-inner" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <a className="wk-brand" href="index.html">
            {p.logoImage ? (
              <img src={p.logoImage} alt="" />
            ) : (
              <span className="wk-brand-dot" />
            )}
            <span {...ed(mode, "logoText")}>{p.logoText}</span>
          </a>
          <button className="wk-nav-toggle" type="button" aria-label="Menu" data-nav-toggle>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <nav className="wk-nav-links" data-nav-links>
            {links.map((l, i) => (
              <a key={i} href={l.link || "#"} {...ed(mode, `links.${i}.label`)}>{l.label}</a>
            ))}
            {p.showCta ? (
              <a className={`wk-btn wk-btn-primary wk-btn-sm${p.variant === "dark" ? " wk-btn-ghostw" : ""}`} href={p.ctaLink || "#"} style={p.variant === "dark" ? { background: "#fff", color: "var(--wk-primary)" } : undefined} {...ed(mode, "ctaText")}>
                {p.ctaText}
              </a>
            ) : null}
          </nav>
        </div>
      </Wrap>
    </BlockView>
  );
}

function HeroBlock({ block, mode }: RProps) {
  const p = block.props;
  const variant = p.variant || "split";
  return (
    <BlockView
      block={block}
      as="section"
      className={cx("wk-hero", variant === "centered" && "wk-hero-centered", variant === "dark" && "wk-hero-dark")}
    >
      {variant === "dark" || variant === "centered" ? (
        <div className="wk-hero-blob" aria-hidden><i /><i /></div>
      ) : null}
      <Wrap block={block}>
        <div className="wk-hero-grid">
          <div>
            {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
            {p.showBadge && p.badge ? <div style={{ marginBottom: 16 }}><span className="wk-badge" {...ed(mode, "badge")}>{p.badge}</span></div> : null}
            <h1 className="wk-h1" {...ed(mode, "heading")}>{p.heading}</h1>
            {p.lead ? (
              <p className="wk-lead" style={{ marginTop: 18 }} {...ed(mode, "lead")}>{p.lead}</p>
            ) : null}
            <div className="wk-hero-actions">
              <Btn text={p.primaryText} link={p.primaryLink} variant={variant === "dark" ? "primary" : "primary"} mode={mode} path="primaryText" />
              {p.showSecondary ? (
                <Btn text={p.secondaryText} link={p.secondaryLink} variant={variant === "dark" ? "ghost" : "secondary"} mode={mode} path="secondaryText" />
              ) : null}
            </div>
            {p.showStats && p.stats?.length ? (
              <div className="wk-hero-stats">
                {p.stats.map((s: any, i: number) => (
                  <div key={i}>
                    <strong {...ed(mode, `stats.${i}.value`)}>{s.value}</strong>
                    <span {...ed(mode, `stats.${i}.label`)}>{s.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {variant === "split" && p.image ? (
            <div className="wk-hero-media">
              <img src={p.image} alt="" loading="lazy" />
            </div>
          ) : null}
        </div>
      </Wrap>
    </BlockView>
  );
}

function FeaturesBlock({ block, mode }: RProps) {
  const p = block.props;
  const items: any[] = p.items || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        {p.variant === "list" ? (
          <div className="wk-features-list">
            {items.map((it, i) => (
              <div className="wk-feature-row" key={i}>
                <div className="wk-icon"><Icon name={it.icon} size={26} /></div>
                <div>
                  <h3 className="wk-h4" {...ed(mode, `items.${i}.title`)}>{it.title}</h3>
                  <p className="wk-muted" {...ed(mode, `items.${i}.text`)}>{it.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wk-features-grid">
            {items.map((it, i) => (
              <div className="wk-card" key={i}>
                <div className="wk-icon"><Icon name={it.icon} size={26} /></div>
                <h3 {...ed(mode, `items.${i}.title`)}>{it.title}</h3>
                <p {...ed(mode, `items.${i}.text`)}>{it.text}</p>
              </div>
            ))}
          </div>
        )}
      </Wrap>
    </BlockView>
  );
}

function AboutBlock({ block, mode }: RProps) {
  const p = block.props;
  const checklist: any[] = p.checklist || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className={cx("wk-split", p.variant === "image-right" && "wk-split-reverse")}>
          <div className="wk-split-media">
            <img src={p.image} alt="" loading="lazy" />
          </div>
          <div>
            {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
            <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
            <div className="wk-text wk-muted" style={{ marginTop: 16 }} {...ed(mode, "text")}>
              {splitText(p.text).map((t, i) => <p key={i}>{t}</p>)}
            </div>
            {checklist.length ? (
              <ul className="wk-checklist">
                {checklist.map((c, i) => (
                  <li key={i} {...ed(mode, `checklist.${i}.text`)}>{c.text ?? c}</li>
                ))}
              </ul>
            ) : null}
            {p.showButton ? (
              <div style={{ marginTop: 26 }}>
                <Btn text={p.buttonText} link={p.buttonLink} variant="secondary" mode={mode} path="buttonText" />
              </div>
            ) : null}
          </div>
        </div>
      </Wrap>
    </BlockView>
  );
}

function ServicesBlock({ block, mode }: RProps) {
  const p = block.props;
  const items: any[] = p.items || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        <div className="wk-services-grid">
          {items.map((it, i) => (
            <div className="wk-service" key={i}>
              <div className="wk-icon"><Icon name={it.icon} size={26} /></div>
              <h3 {...ed(mode, `items.${i}.title`)}>{it.title}</h3>
              <p {...ed(mode, `items.${i}.text`)}>{it.text}</p>
              {it.linkText ? <a href={it.link || "#"} {...ed(mode, `items.${i}.linkText`)}>{it.linkText} →</a> : null}
            </div>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function TestimonialsBlock({ block, mode }: RProps) {
  const p = block.props;
  const items: any[] = p.items || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        <div className="wk-testimonials-grid">
          {items.map((it, i) => (
            <div className="wk-quote" key={i}>
              {Number(it.stars) > 0 ? (
                <div className="wk-quote-stars">{"★".repeat(Math.min(5, Number(it.stars)))}</div>
              ) : null}
              <p {...ed(mode, `items.${i}.quote`)}>“{it.quote}”</p>
              <div className="wk-quote-person">
                {it.avatar ? <img src={it.avatar} alt="" /> : <div className="wk-icon" style={{ width: 46, height: 46, borderRadius: 999 }}><Icon name="Users" size={20} /></div>}
                <div>
                  <strong {...ed(mode, `items.${i}.name`)}>{it.name}</strong>
                  <span {...ed(mode, `items.${i}.role`)}>{it.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function PricingBlock({ block, mode }: RProps) {
  const p = block.props;
  const plans: any[] = p.plans || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        <div className="wk-pricing-grid">
          {plans.map((pl, i) => (
            <div className={cx("wk-plan", pl.featured && "wk-plan-featured")} key={i}>
              {pl.featured && pl.badge ? <div className="wk-plan-badge" {...ed(mode, `plans.${i}.badge`)}>{pl.badge}</div> : null}
              <h3 {...ed(mode, `plans.${i}.name`)}>{pl.name}</h3>
              <div className="wk-plan-price" {...ed(mode, `plans.${i}.price`)}>
                {pl.price}<span>{pl.period}</span>
              </div>
              <ul>
                {(pl.features || []).map((f: any, j: number) => (
                  <li key={j} {...ed(mode, `plans.${i}.features.${j}.text`)}>{f.text ?? f}</li>
                ))}
              </ul>
              <Btn text={pl.ctaText} link={pl.ctaLink} variant={pl.featured ? "primary" : "secondary"} mode={mode} path={`plans.${i}.ctaText`} />
            </div>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function FaqBlock({ block, mode }: RProps) {
  const p = block.props;
  const items: any[] = p.items || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        <div className="wk-faq" style={{ marginLeft: "auto", marginRight: "auto" }}>
          {items.map((it, i) => (
            <details className="wk-faq-item" key={i} open={i === 0}>
              <summary {...ed(mode, `items.${i}.q`)}>{it.q}</summary>
              <div className="wk-faq-a" {...ed(mode, `items.${i}.a`)}>{it.a}</div>
            </details>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function ContactBlock({ block, mode }: RProps) {
  const p = block.props;
  const isMail = p.formDest !== "url";
  const formAttrs: any = isMail
    ? { "data-mailto": p.formEmail || "hello@example.com", method: "post", action: "#" }
    : { method: "post", action: p.formUrl || "#" };
  const form = (
    <form className="wk-form" {...formAttrs} data-wk-form>
      <div className="wk-form-row">
        <label>First name<input name="firstName" type="text" required placeholder="Your name" /></label>
        <label>Last name<input name="lastName" type="text" placeholder="Your last name" /></label>
      </div>
      <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
      <label>Message<textarea name="message" required placeholder="How can we help?" /></label>
      <div>
        <button className="wk-btn wk-btn-primary" type="submit" {...ed(mode, "buttonText")}>{p.buttonText || "Send message"}</button>
      </div>
      <p className="wk-form-note">Your details are sent straight to us — no spam, ever.</p>
    </form>
  );
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        {p.variant === "form" ? (
          <div className="wk-center" style={{ maxWidth: 640, margin: "0 auto 36px" }}>
            {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
            <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
            {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
          </div>
        ) : (
          <div className="wk-contact-grid">
            <div>
              {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
              <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
              {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
              <div className="wk-contact-info" style={{ marginTop: 28 }}>
                {p.email ? (
                  <div className="wk-contact-info-item">
                    <div className="wk-icon" style={{ width: 44, height: 44 }}><Icon name="Mail" size={20} /></div>
                    <div><strong>Email</strong><span {...ed(mode, "email")}>{p.email}</span></div>
                  </div>
                ) : null}
                {p.phone ? (
                  <div className="wk-contact-info-item">
                    <div className="wk-icon" style={{ width: 44, height: 44 }}><Icon name="Phone" size={20} /></div>
                    <div><strong>Phone</strong><span {...ed(mode, "phone")}>{p.phone}</span></div>
                  </div>
                ) : null}
                {p.address ? (
                  <div className="wk-contact-info-item">
                    <div className="wk-icon" style={{ width: 44, height: 44 }}><Icon name="MapPin" size={20} /></div>
                    <div><strong>Address</strong><span {...ed(mode, "address")}>{p.address}</span></div>
                  </div>
                ) : null}
              </div>
            </div>
            <div>{form}</div>
          </div>
        )}
        {p.variant === "form" ? <div style={{ maxWidth: 640, margin: "0 auto" }}>{form}</div> : null}
      </Wrap>
    </BlockView>
  );
}

function CtaBlock({ block, mode }: RProps) {
  const p = block.props;
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-cta">
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p {...ed(mode, "lead")}>{p.lead}</p> : null}
          <div className="wk-hero-actions" style={{ justifyContent: "center" }}>
            <Btn text={p.primaryText} link={p.primaryLink} variant="primary" mode={mode} path="primaryText" />
            {p.showSecondary ? (
              <Btn text={p.secondaryText} link={p.secondaryLink} variant="ghost" mode={mode} path="secondaryText" />
            ) : null}
          </div>
        </div>
      </Wrap>
    </BlockView>
  );
}

function FooterBlock({ block, mode }: RProps) {
  const p = block.props;
  const columns: any[] = p.columns || [];
  const social: any[] = p.social || [];
  return (
    <BlockView block={block} as="footer" className="wk-footer">
      <Wrap block={block}>
        <div className="wk-footer-grid">
          <div>
            <a className="wk-brand" href="index.html" style={{ color: "#fff" }}>
              <span className="wk-brand-dot" />
              <span {...ed(mode, "logoText")}>{p.logoText}</span>
            </a>
            <p style={{ marginTop: 16, maxWidth: 280, fontSize: ".95rem", lineHeight: 1.7 }} {...ed(mode, "blurb")}>
              {p.blurb}
            </p>
            {social.length ? (
              <div className="wk-social" style={{ marginTop: 20 }}>
                {social.map((s, i) => (
                  <a key={i} href={s.url || "#"} aria-label={s.platform} style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>
                    <SocialIcon platform={s.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h4 {...ed(mode, `columns.${i}.title`)}>{col.title}</h4>
              {(col.links || []).map((l: any, j: number) => (
                <a key={j} href={l.link || "#"} {...ed(mode, `columns.${i}.links.${j}.label`)}>{l.label}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="wk-footer-bottom">
          <span {...ed(mode, "copyright")}>{p.copyright}</span>
          <span>Made with ❤️</span>
        </div>
      </Wrap>
    </BlockView>
  );
}

function TeamBlock({ block, mode }: RProps) {
  const p = block.props;
  const members: any[] = p.members || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        <div className="wk-team-grid">
          {members.map((m, i) => (
            <div className="wk-member" key={i}>
              <img src={m.image} alt={m.name} loading="lazy" />
              <h3 {...ed(mode, `members.${i}.name`)}>{m.name}</h3>
              <span {...ed(mode, `members.${i}.role`)}>{m.role}</span>
            </div>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function NewsletterBlock({ block, mode }: RProps) {
  const p = block.props;
  const isMail = p.formDest === "email";
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 12, marginBottom: 24 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
          <form
            className="wk-newsletter"
            style={{ margin: "0 auto" }}
            {...(isMail
              ? { "data-mailto": p.formEmail || "hello@example.com", method: "post", action: "#" }
              : { method: "post", action: p.formUrl || "#" })}
            data-wk-form
          >
            <input type="email" name="email" required placeholder="Your email address" />
            <button className="wk-btn wk-btn-primary" type="submit" {...ed(mode, "buttonText")}>{p.buttonText || "Subscribe"}</button>
          </form>
        </div>
      </Wrap>
    </BlockView>
  );
}

function BlogListBlock({ block, mode }: RProps) {
  const p = block.props;
  const posts: any[] = p.posts || [];
  return (
    <BlockView block={block} as="section" className="wk-section">
      <Wrap block={block}>
        <div className="wk-center" style={{ maxWidth: 720, margin: "0 auto 42px" }}>
          {p.eyebrow ? <Eyebrow mode={mode} path="eyebrow">{p.eyebrow}</Eyebrow> : null}
          <h2 className="wk-h2" {...ed(mode, "heading")}>{p.heading}</h2>
          {p.lead ? <p className="wk-lead" style={{ marginTop: 14 }} {...ed(mode, "lead")}>{p.lead}</p> : null}
        </div>
        <div className="wk-blog-grid">
          {posts.map((post, i) => (
            <article className="wk-post" key={i}>
              {post.image ? <img src={post.image} alt="" loading="lazy" /> : null}
              <div className="wk-post-body">
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--wk-muted)" }}>
                  {post.category ? <span className="wk-badge" style={{ padding: "3px 10px", fontSize: 11 }}>{post.category}</span> : null}
                  {post.date ? <span>{post.date}</span> : null}
                </div>
                <h3 {...ed(mode, `posts.${i}.title`)}>{post.title}</h3>
                <p {...ed(mode, `posts.${i}.excerpt`)}>{post.excerpt}</p>
                <a href={post.link || "#"}>Read more →</a>
              </div>
            </article>
          ))}
        </div>
      </Wrap>
    </BlockView>
  );
}

function PopupBlock({ block, mode }: RProps) {
  const p = block.props;
  return (
    <div className="wk-popup" data-popup data-delay={Number(p.delay) || 3} style={mode === "static" || mode === "preview" ? { display: "none" } : mode === "editor" ? { position: "absolute" } : undefined}>
      <div className="wk-popup-card">
        {mode === "editor" ? <div className="wk-popup-preview-badge">Popup preview</div> : null}
        <button className="wk-popup-close" type="button" data-popup-close aria-label="Close">×</button>
        <h3 {...ed(mode, "title")}>{p.title}</h3>
        <p {...ed(mode, "text")}>{p.text}</p>
        <a className="wk-btn wk-btn-primary" href={p.buttonLink || "#"} {...ed(mode, "buttonText")}>{p.buttonText}</a>
      </div>
    </div>
  );
}

/* -------------------------------- dispatch --------------------------------- */

interface RProps {
  block: Block;
  mode: EditorMode;
  renderChildren: (children: Block[] | undefined, mode: EditorMode) => React.ReactNode;
}

const RENDERERS: Record<string, React.ComponentType<RProps>> = {
  section: SectionBlock,
  columns: ColumnsBlock,
  column: ColumnBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  buttons: ButtonsBlock,
  icon: IconBlock,
  video: VideoBlock,
  gallery: GalleryBlock,
  list: ListBlock,
  countdown: CountdownBlock,
  map: MapBlock,
  social: SocialBlock,
  html: HtmlBlock,
  navbar: NavbarBlock,
  hero: HeroBlock,
  features: FeaturesBlock,
  about: AboutBlock,
  services: ServicesBlock,
  testimonials: TestimonialsBlock,
  pricing: PricingBlock,
  faq: FaqBlock,
  contact: ContactBlock,
  cta: CtaBlock,
  footer: FooterBlock,
  team: TeamBlock,
  newsletter: NewsletterBlock,
  blogList: BlogListBlock,
  popup: PopupBlock,
};

export function renderBlocks(blocks: Block[] | undefined, mode: EditorMode): React.ReactNode {
  if (!blocks || !blocks.length) return null;
  return blocks.map((b) => <BlockRenderer key={b.id} block={b} mode={mode} />);
}

export function BlockRenderer({
  block,
  mode,
  renderChildren: customRenderChildren,
}: {
  block: Block;
  mode: EditorMode;
  renderChildren?: (children: Block[] | undefined, mode: EditorMode) => React.ReactNode;
}) {
  const R = RENDERERS[block.type];
  if (!R) {
    return (
      <div className="wk-empty-drop" data-block-id={block.id}>
        Unknown block: {block.type}
      </div>
    );
  }
  return <R block={block} mode={mode} renderChildren={customRenderChildren || renderBlocks} />;
}

export function SiteBody({ blocks, mode }: { blocks: Block[]; mode: EditorMode }) {
  return <>{renderBlocks(blocks, mode)}</>;
}
