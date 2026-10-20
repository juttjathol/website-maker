"use client";
/** Shopify Online Store 2.0 theme exporter. Generates a native theme ZIP, not a static-site ZIP. */
import JSZip from "jszip";
import type { Block, Page, Project } from "./schema";
import { renderPageHtml, SITE_JS } from "./export";
import { assert3DExportAllowed } from "./scene-3d";
import { getMyPlan } from "./db";
import { SITE_CSS } from "./site-css";
import { pageFileName, walkBlocks } from "./tree";
import { downloadBlob, escapeHtml } from "./util";

const MAX_ASSET_BYTES = 19 * 1024 * 1024;
const MAX_SECTION_BYTES = 240 * 1024;
const MAX_THEME_BYTES = 48 * 1024 * 1024;

type ThemeFile = string | ArrayBuffer;

const SHOPIFY_CSS = `
:root{--store-primary:#6d5ae6;--store-ink:#161224;--store-muted:#6b6680;--store-line:#e7e3ee;--store-surface:#f7f5fa}
*{box-sizing:border-box}
body{margin:0;color:var(--store-ink);background:var(--store-background,#fff);font-family:Arial,Helvetica,sans-serif}
.shopify-main{min-height:50vh}
.shop-skip-link{position:absolute;left:-9999px;top:auto}.shop-skip-link:focus{left:1rem;top:1rem;z-index:9999;background:white;padding:12px;border-radius:8px}
.webloom-shop-actions{display:flex;align-items:center;gap:10px;margin-left:16px;white-space:nowrap}
.webloom-shop-actions a{display:inline-flex;align-items:center;gap:6px;color:var(--wk-text,#161224);font-size:13px;font-weight:700;text-decoration:none}
.webloom-shop-actions a:hover{text-decoration:underline}
.webloom-shop-actions .webloom-cart-count{display:inline-grid;min-width:20px;height:20px;place-items:center;padding:0 5px;border-radius:999px;background:var(--wk-primary,#6d5ae6);color:#fff;font-size:10px}
.shop-section{padding:clamp(36px,6vw,76px) 22px;max-width:1240px;margin:0 auto}
.shop-heading{margin:0 0 26px;font-size:clamp(26px,4vw,40px);line-height:1.1;letter-spacing:-.04em}
.shop-subheading{margin:0 0 20px;color:var(--store-muted);line-height:1.65}
.shop-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.shop-product-card{min-width:0;border:1px solid var(--store-line);border-radius:14px;overflow:hidden;background:#fff;color:inherit;text-decoration:none;transition:transform .18s,box-shadow .18s}
.shop-product-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px #16122414}
.shop-product-card img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;background:var(--store-surface)}
.shop-product-card-body{padding:15px}
.shop-product-card h3{margin:0;font-size:15px;line-height:1.4}
.shop-product-card p{margin:7px 0 0;color:var(--store-muted);font-size:13px}
.shop-product-price{margin-top:10px;color:var(--store-ink);font-size:14px;font-weight:800}
.shop-product-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:clamp(30px,6vw,80px);align-items:start}
.shop-product-media img{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border-radius:16px;background:var(--store-surface)}
.shop-product-info{position:sticky;top:30px}
.shop-product-title{margin:0 0 12px;font-size:clamp(30px,4.2vw,52px);line-height:1.03;letter-spacing:-.045em}
.shop-product-price-large{margin:0 0 22px;font-size:20px;font-weight:800}
.shop-product-description{margin-top:24px;color:var(--store-muted);line-height:1.75}
.shop-form-stack{display:grid;gap:14px}
.shop-label{display:block;margin-bottom:6px;font-size:12px;font-weight:750}
.shop-select,.shop-input{width:100%;min-height:46px;border:1px solid #dcd7e5;border-radius:9px;padding:10px 12px;background:#fff;color:var(--store-ink);font:inherit}
.shop-button{display:inline-flex;min-height:46px;align-items:center;justify-content:center;gap:8px;border:0;border-radius:10px;padding:12px 19px;background:var(--store-primary);color:#fff;font:inherit;font-weight:800;text-decoration:none;cursor:pointer}
.shop-button:hover{filter:brightness(1.06)}
.shop-button:disabled{opacity:.5;cursor:not-allowed}
.shop-button.secondary{background:#f1eef7;color:var(--store-ink)}
.shop-cart-list{width:100%;border-collapse:collapse}
.shop-cart-list th,.shop-cart-list td{padding:14px 10px;border-bottom:1px solid var(--store-line);text-align:left;vertical-align:middle}
.shop-cart-list th{color:var(--store-muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.shop-cart-item{display:flex;align-items:center;gap:14px;min-width:200px}
.shop-cart-item img{width:72px;height:72px;object-fit:cover;border-radius:9px;background:var(--store-surface)}
.shop-cart-item a{color:inherit;font-weight:750;text-decoration:none}
.shop-cart-summary{margin:28px 0 0 auto;max-width:400px;display:grid;gap:12px}
.shop-cart-total{display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid var(--store-line);font-weight:850}
.shop-empty-state{padding:28px;border:1px dashed #d9d3e4;border-radius:14px;color:var(--store-muted);text-align:center}
.shop-search-form{display:flex;gap:10px;max-width:720px;margin:22px 0 34px}
.shop-search-form input{flex:1;min-width:0}
.shop-pagination{display:flex;justify-content:center;gap:16px;margin-top:28px;color:var(--store-muted)}
.shop-pagination a{color:var(--store-primary)}
.shop-richtext{max-width:760px;line-height:1.8;color:var(--store-muted)}
.shop-richtext img{max-width:100%;height:auto}
.shop-collection-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.shop-collection-card{display:block;padding:20px;border:1px solid var(--store-line);border-radius:14px;color:inherit;text-decoration:none;background:white}
.shop-collection-card img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:9px}
.shop-header-fallback,.shop-footer-fallback{padding:16px 22px;background:#fff;border-bottom:1px solid var(--store-line)}
.shop-header-fallback-inner,.shop-footer-fallback-inner{max-width:1240px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
.shop-header-fallback a,.shop-footer-fallback a{color:inherit;text-decoration:none;font-weight:750}
.shop-header-fallback nav{display:flex;align-items:center;gap:18px}
.shop-footer-fallback{border-top:1px solid var(--store-line);border-bottom:0;color:var(--store-muted);font-size:13px}
.shop-alert{margin:0 0 18px;padding:12px 14px;border-radius:9px;background:#fff5e7;color:#7a4c12}
@media(max-width:850px){.shop-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.shop-product-layout{grid-template-columns:1fr}.shop-product-info{position:static}.shop-collection-list{grid-template-columns:repeat(2,minmax(0,1fr))}.webloom-shop-actions{margin-left:4px}}
@media(max-width:560px){.shop-product-grid{gap:10px}.shop-cart-list th:nth-child(2),.shop-cart-list td:nth-child(2){display:none}.shop-cart-item img{width:56px;height:56px}.shop-cart-list th,.shop-cart-list td{padding:10px 5px}.shop-search-form{flex-direction:column}.shop-collection-list{grid-template-columns:1fr}.webloom-shop-actions a{font-size:11px}}
`;

function htmlBody(project: Project, page: Page, blocks: Block[], watermark = false): string {
  const rendered = renderPageHtml(project, { ...page, blocks }, { watermark });
  const startMarker = "<body>\n";
  const endMarker = "\n<script src=\"assets/site.js\"></script>";
  const start = rendered.indexOf(startMarker);
  const end = rendered.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error("Could not prepare the Shopify page markup.");
  return rendered.slice(start + startMarker.length, end);
}

function blockImageSources(project: Project): Set<string> {
  const sources = new Set<string>();
  const imageKeys = ["src", "image", "avatar", "logoImage"];
  for (const page of project.pages) {
    walkBlocks(page.blocks || [], (block) => {
      const props = block.props || {};
      for (const key of imageKeys) {
        const value = props[key];
        if (typeof value === "string" && value) sources.add(value);
      }
      for (const key of ["html", "code", "customHtml"]) {
        const markup = props[key];
        if (typeof markup !== "string") continue;
        for (const match of markup.matchAll(/\bsrc\s*=\s*["']([^"']+)["']/gi)) sources.add(decodeHtmlAttribute(match[1]));
      }
      for (const key of ["images", "members", "posts", "items"]) {
        const list = props[key];
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          if (!item || typeof item !== "object") continue;
          for (const imageKey of imageKeys) {
            const value = item[imageKey];
            if (typeof value === "string" && value) sources.add(value);
          }
        }
      }
    });
  }
  return sources;
}

function imageExtension(source: string): string {
  if (source.startsWith("data:")) {
    const mime = source.slice(5, source.indexOf(";"));
    const ext = mime.split("/")[1] || "jpg";
    return ext === "jpeg" ? "jpg" : ext.replace("svg+xml", "svg");
  }
  try {
    const path = new URL(source, typeof window === "undefined" ? "https://webloom.invalid" : window.location.origin).pathname;
    const match = path.match(/\.([a-z0-9]{2,5})$/i);
    return match?.[1]?.toLowerCase() || "jpg";
  } catch {
    return "jpg";
  }
}

async function collectThemeImages(project: Project): Promise<{ assets: Map<string, ArrayBuffer>; sourceNames: Map<string, string> }> {
  const assets = new Map<string, ArrayBuffer>();
  const sourceNames = new Map<string, string>();
  let index = 0;
  let totalBytes = 0;

  for (const source of blockImageSources(project)) {
    if (/^https?:\/\//i.test(source)) continue;
    let response: Response;
    try {
      response = await fetch(source);
    } catch {
      throw new Error(`Webloom could not read one of your uploaded images. Re-upload the image and try again.`);
    }
    if (!response.ok) throw new Error(`An image used on your site could not be packaged (${source.slice(0, 80)}). Re-upload it and try again.`);
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength) continue;
    if (bytes.byteLength > MAX_ASSET_BYTES) throw new Error("Shopify limits individual theme assets to about 20 MB. Reduce this image and try again.");
    totalBytes += bytes.byteLength;
    if (totalBytes > 42 * 1024 * 1024) throw new Error("The Shopify theme images are too large to upload. Reduce or remove a few large images and try again.");
    const ext = imageExtension(source);
    const name = `webloom-image-${String(++index).padStart(2, "0")}.${ext}`;
    assets.set(name, bytes);
    sourceNames.set(source, name);
  }
  return { assets, sourceNames };
}

function decodeHtmlAttribute(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function safeHandle(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "page";
}

function shopifyPageHandle(page: Page, pages: Page[]): string {
  return safeHandle(pageFileName(page, pages).replace(/\.html$/i, "")).slice(0, 40);
}

function prepareLiquidMarkup(
  rawMarkup: string,
  project: Project,
  sourceNames: Map<string, string>,
  options: { addStoreActions?: boolean } = {}
): string {
  const tokens = new Map<string, string>();
  let tokenIndex = 0;
  const addToken = (liquid: string) => {
    const token = `WEBLOOM_LIQUID_TOKEN_${tokenIndex++}_END`;
    tokens.set(token, liquid);
    return token;
  };
  let markup = rawMarkup;

  markup = markup.replace(/\bsrc=(["'])(.*?)\1/gi, (attribute, _quote: string, encodedSource: string) => {
    const source = decodeHtmlAttribute(encodedSource);
    const name = sourceNames.get(source);
    return name ? `src="${addToken(`{{ '${name}' | asset_url }}`)}"` : attribute;
  });

  const pages = project.pages;
  markup = markup.replace(/\bhref="([^"]*)"/g, (attribute, href: string) => {
    const decoded = decodeHtmlAttribute(href);
    if (!decoded || /^(#|https?:|mailto:|tel:|sms:|javascript:|data:)/i.test(decoded)) return attribute;
    const pathname = decoded.split(/[?#]/)[0].replace(/^\.\//, "");
    const suffix = decoded.slice(pathname.length);
    const destination = pages.find((page) => pageFileName(page, pages) === pathname || pageFileName(page, pages) === pathname.split("/").pop());
    if (!destination) return attribute;
    if (destination.id === pages[0]?.id) {
      return `href="${addToken(`{{ routes.root_url }}${suffix}`)}"`;
    }
    const handle = shopifyPageHandle(destination, pages);
    return `href="${addToken(`{% if pages['${handle}'] != blank %}{{ pages['${handle}'].url }}{% else %}/pages/${handle}{% endif %}${suffix}`)}"`;
  });

  if (options.addStoreActions) {
    const shopActions = `<div class="webloom-shop-actions"><a href="${addToken("{{ routes.all_products_collection_url }}")}">Shop</a><a href="${addToken("{{ routes.cart_url }}")}">Cart <span class="webloom-cart-count">${addToken("{{ cart.item_count }}")}</span></a></div>`;
    if (markup.includes("</nav>")) markup = markup.replace("</nav>", `</nav>${shopActions}`);
    else if (markup.includes("</header>")) markup = markup.replace("</header>", `${shopActions}</header>`);
  }

  // Liquid from customer-entered copy/custom HTML is emitted literally, not run
  // with Shopify privileges. Only explicit exporter tokens above become Liquid.
  markup = markup.replace(/\{\{/g, "&#123;&#123;").replace(/\{%/g, "&#123;%");
  markup = markup.replace(/<img\b([^>]*?)\/?\s*>/gi, (_tag, attributes: string) => {
    const hasWidth = /\bwidth\s*=/.test(attributes);
    const hasHeight = /\bheight\s*=/.test(attributes);
    return `<img${attributes}${hasWidth ? "" : ' width="1200"'}${hasHeight ? "" : ' height="800"'}>`;
  });
  for (const [token, liquid] of tokens) markup = markup.replaceAll(token, liquid);
  return markup;
}

function fallbackHeader(project: Project): string {
  return `<div class="wk-site wk-font-${project.theme.font}"><header class="shop-header-fallback"><div class="shop-header-fallback-inner"><a href="index.html">${escapeHtml(project.name)}</a><nav></nav></div></header></div>`;
}

function fallbackFooter(project: Project): string {
  return `<div class="wk-site wk-font-${project.theme.font}"><footer class="shop-footer-fallback"><div class="shop-footer-fallback-inner"><span>© ${new Date().getFullYear()} ${escapeHtml(project.name)}</span><a href="index.html">Home</a></div></footer></div>`;
}

function findChromeBlock(page: Page, type: "navbar" | "footer"): Block | undefined {
  return page.blocks.find((block) => block.type === type);
}

function shopifySectionSchema(name: string): string {
  return `{% schema %}\n${JSON.stringify({
    name,
    settings: [{ type: "liquid", id: "markup", label: "Page content", info: "This content is generated by Webloom and can be edited here or in Webloom." }],
    presets: [{ name }],
  }, null, 2)}\n{% endschema %}`;
}

function liquidContentSection(): string {
  return `{% comment %}Webloom-generated content section. Edit the Custom Liquid content in the Shopify theme editor.{% endcomment %}\n<div class="webloom-liquid-content">{{ section.settings.markup }}</div>\n${shopifySectionSchema("Webloom content")}\n`;
}

function jsonTemplate(sectionType: string, settings: Record<string, unknown> = {}): string {
  return JSON.stringify({ sections: { main: { type: sectionType, settings } }, order: ["main"] }, null, 2);
}

function themeInfo(name: string) {
  return [
    {
      name: "theme_info",
      theme_name: name.slice(0, 50),
      theme_author: "Webloom",
      theme_version: "1.0.0",
      theme_documentation_url: "https://help.shopify.com/manual/online-store/themes",
      theme_support_url: "https://help.shopify.com/",
    },
    {
      name: "Webloom colors",
      settings: [
        { type: "color", id: "color_primary", label: "Store button color", default: "#6d5ae6" },
        { type: "color", id: "color_surface", label: "Store surface color", default: "#f7f5fa" },
      ],
    },
  ];
}

function shopHeaderMarkup(project: Project, page: Page, watermark: boolean): string {
  const navbar = findChromeBlock(page, "navbar");
  return navbar ? htmlBody(project, page, [navbar], watermark) : fallbackHeader(project);
}

function shopFooterMarkup(project: Project, page: Page, watermark: boolean): string {
  const footer = findChromeBlock(page, "footer");
  return footer ? htmlBody(project, page, [footer], watermark) : fallbackFooter(project);
}

function makeLiquidSettingContent(rawMarkup: string, project: Project, sourceNames: Map<string, string>, addStoreActions = false): string {
  const prepared = prepareLiquidMarkup(rawMarkup, project, sourceNames, { addStoreActions });
  const length = new TextEncoder().encode(prepared).byteLength;
  if (length > 48 * 1024) {
    throw new Error("One Shopify page is over Shopify’s 50 KB custom-Liquid setting limit. Remove or shorten some custom HTML/content blocks, then try again.");
  }
  return prepared;
}

function safeColor(color: string, fallback: string): string {
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

function makeThemeLayout(project: Project): string {
  const text = safeColor(project.theme.text, "#161224");
  return `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="{{ settings.color_primary }}">
  <title>{{ page_title | escape }} · {{ shop.name | escape }}</title>
  {% if page_description %}<meta name="description" content="{{ page_description | escape }}">{% endif %}
  <link rel="canonical" href="{{ canonical_url }}">
  <style>:root{--store-primary:{{ settings.color_primary }};--store-background:{{ settings.color_surface }};--store-ink:${text}}</style>
  {{ 'webloom.css' | asset_url | stylesheet_tag }}
  {{ 'shopify-store.css' | asset_url | stylesheet_tag }}
  {{ content_for_header }}
</head>
<body>
  <a class="shop-skip-link" href="#MainContent">Skip to content</a>
  {% sections 'header-group' %}
  <main id="MainContent" class="shopify-main">{{ content_for_layout }}</main>
  {% sections 'footer-group' %}
  <script src="{{ 'webloom.js' | asset_url }}" defer></script>
</body>
</html>
`;
}

function makeHeaderSection(): string {
  return `{% comment %}Webloom-generated header. Edit its Custom Liquid setting in the theme editor.{% endcomment %}\n<div class="webloom-liquid-content">{{ section.settings.markup }}</div>\n${shopifySectionSchema("Webloom header")}\n`;
}

function makeFooterSection(): string {
  return `{% comment %}Webloom-generated footer. Edit its Custom Liquid setting in the theme editor.{% endcomment %}\n<div class="webloom-liquid-content">{{ section.settings.markup }}</div>\n${shopifySectionSchema("Webloom footer")}\n`;
}

function makeFeaturedProductsSection(): string {
  const schema = {
    name: "Featured products",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Shop the collection" },
      { type: "collection", id: "collection", label: "Collection" },
      { type: "range", id: "products_to_show", min: 2, max: 8, step: 2, default: 4, label: "Products to show" },
    ],
    presets: [{ name: "Featured products" }],
  };
  return `{% assign featured_collection = section.settings.collection | default: collections.all %}
<section class="shop-section">
  <h2 class="shop-heading">{{ section.settings.heading | escape }}</h2>
  {% if featured_collection != blank and featured_collection.products_count > 0 %}
    <div class="shop-product-grid">
      {% for product in featured_collection.products limit: section.settings.products_to_show %}
        {% render 'product-card', product: product %}
      {% endfor %}
    </div>
  {% else %}
    <div class="shop-empty-state">Add products to your Shopify store to show them here.</div>
  {% endif %}
</section>
{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`;
}

function makeProductCardSnippet(): string {
  return `<a class="shop-product-card" href="{{ product.url }}">
  {% if product.featured_image %}
    {{ product.featured_image | image_url: width: 900 | image_tag: loading: 'lazy', widths: '320, 480, 640, 900', alt: product.title }}
  {% else %}
    <div class="shop-empty-state">Product photo</div>
  {% endif %}
  <div class="shop-product-card-body">
    <h3>{{ product.title | escape }}</h3>
    {% if product.vendor != blank %}<p>{{ product.vendor | escape }}</p>{% endif %}
    <div class="shop-product-price">{{ product.price | money }}</div>
  </div>
</a>
`;
}

function makeCommerceSections(): Record<string, string> {
  const productSchema = {
    name: "Main product",
    settings: [
      { type: "checkbox", id: "show_vendor", label: "Show vendor", default: false },
      { type: "checkbox", id: "show_quantity", label: "Show quantity selector", default: true },
    ],
    presets: [{ name: "Main product" }],
  };
  const collectionSchema = {
    name: "Main collection",
    settings: [{ type: "range", id: "products_per_page", min: 4, max: 48, step: 4, default: 16, label: "Products per page" }],
    presets: [{ name: "Main collection" }],
  };
  const simpleSchema = (name: string) => JSON.stringify({ name, settings: [], presets: [{ name }] }, null, 2);

  return {
    "main-product.liquid": `{% assign current_variant = product.selected_or_first_available_variant %}
<section class="shop-section">
  <div class="shop-product-layout">
    <div class="shop-product-media">
      {% if product.featured_image %}
        {{ product.featured_image | image_url: width: 1600 | image_tag: loading: 'eager', widths: '480, 720, 960, 1200, 1600', alt: product.title }}
      {% else %}<div class="shop-empty-state">Add a product image in Shopify Admin.</div>{% endif %}
    </div>
    <div class="shop-product-info">
      {% if section.settings.show_vendor and product.vendor != blank %}<p class="shop-subheading">{{ product.vendor | escape }}</p>{% endif %}
      <h1 class="shop-product-title">{{ product.title | escape }}</h1>
      <p class="shop-product-price-large">{{ current_variant.price | money }}</p>
      {% form 'product', product, class: 'shop-form-stack' %}
        {% if product.has_only_default_variant %}
          <input type="hidden" name="id" value="{{ current_variant.id }}">
        {% else %}
          <div><label class="shop-label" for="ProductVariant-{{ section.id }}">Choose an option</label><select class="shop-select" id="ProductVariant-{{ section.id }}" name="id">
            {% for variant in product.variants %}<option value="{{ variant.id }}"{% if variant.id == current_variant.id %} selected{% endif %}{% unless variant.available %} disabled{% endunless %}>{{ variant.title | escape }} · {{ variant.price | money }}{% unless variant.available %} · Sold out{% endunless %}</option>{% endfor %}
          </select></div>
        {% endif %}
        {% if section.settings.show_quantity %}<div><label class="shop-label" for="ProductQuantity-{{ section.id }}">Quantity</label><input class="shop-input" id="ProductQuantity-{{ section.id }}" type="number" name="quantity" min="1" value="1"></div>{% endif %}
        <button class="shop-button" type="submit" name="add"{% unless product.available %} disabled{% endunless %}>{% if product.available %}Add to cart{% else %}Sold out{% endif %}</button>
      {% endform %}
      {% if product.description != blank %}<div class="shop-product-description">{{ product.description }}</div>{% endif %}
    </div>
  </div>
</section>
{% schema %}
${JSON.stringify(productSchema, null, 2)}
{% endschema %}
`,
    "main-collection.liquid": `{% paginate collection.products by section.settings.products_per_page %}
<section class="shop-section">
  <h1 class="shop-heading">{{ collection.title | escape }}</h1>
  {% if collection.description != blank %}<div class="shop-richtext shop-subheading">{{ collection.description }}</div>{% endif %}
  {% if collection.products_count > 0 %}
    <div class="shop-product-grid">{% for product in collection.products %}{% render 'product-card', product: product %}{% endfor %}</div>
  {% else %}<div class="shop-empty-state">There are no products in this collection yet.</div>{% endif %}
  {% if paginate.pages > 1 %}<nav class="shop-pagination" aria-label="Pagination">{{ paginate | default_pagination }}</nav>{% endif %}
</section>
{% endpaginate %}
{% schema %}
${JSON.stringify(collectionSchema, null, 2)}
{% endschema %}
`,
    "main-cart.liquid": `{% if cart.item_count == 0 %}
<section class="shop-section"><h1 class="shop-heading">Your cart</h1><div class="shop-empty-state"><p>Your cart is empty.</p><a class="shop-button" href="{{ routes.all_products_collection_url }}">Continue shopping</a></div></section>
{% else %}
<section class="shop-section">
  <h1 class="shop-heading">Your cart</h1>
  {% form 'cart', cart %}
    <table class="shop-cart-list"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th></tr></thead><tbody>
      {% for item in cart.items %}<tr>
        <td><div class="shop-cart-item">{% if item.image %}{{ item.image | image_url: width: 180 | image_tag: loading: 'lazy', widths: '72, 144, 180', alt: item.product.title }}{% endif %}<span><a href="{{ item.url }}">{{ item.product.title | escape }}</a>{% unless item.product.has_only_default_variant %}<small class="shop-subheading">{{ item.variant.title | escape }}</small>{% endunless %}</span></div></td>
        <td>{{ item.price | money }}</td>
        <td><input class="shop-input" type="number" name="updates[]" min="0" value="{{ item.quantity }}" aria-label="Quantity for {{ item.product.title | escape }}"></td>
        <td>{{ item.final_line_price | money }}</td>
      </tr>{% endfor %}
    </tbody></table>
    <div class="shop-cart-summary"><button class="shop-button secondary" type="submit" name="update">Update cart</button><div class="shop-cart-total"><span>Subtotal</span><span>{{ cart.total_price | money }}</span></div><p class="shop-subheading">Shipping and taxes are calculated at checkout.</p><button class="shop-button" type="submit" name="checkout">Continue to checkout</button></div>
  {% endform %}
</section>
{% endif %}
{% schema %}
${simpleSchema("Main cart")}
{% endschema %}
`,
    "main-page.liquid": `<section class="shop-section"><h1 class="shop-heading">{{ page.title | escape }}</h1><div class="shop-richtext">{{ page.content }}</div></section>
{% schema %}
${simpleSchema("Main page")}
{% endschema %}
`,
    "main-search.liquid": `<section class="shop-section">
  <h1 class="shop-heading">Search</h1>
  <form class="shop-search-form" action="{{ routes.search_url }}" method="get" role="search"><input class="shop-input" type="search" name="q" value="{{ search.terms | escape }}" placeholder="Search products and pages"><button class="shop-button" type="submit">Search</button></form>
  {% if search.performed %}<h2 class="shop-subheading">Results for “{{ search.terms | escape }}”</h2>
    {% paginate search.results by 20 %}<div class="shop-product-grid">{% for item in search.results %}<a class="shop-product-card" href="{{ item.url }}">{% if item.featured_image %}{{ item.featured_image | image_url: width: 900 | image_tag: loading: 'lazy', widths: '320, 480, 640, 900', alt: item.title }}{% endif %}<div class="shop-product-card-body"><h3>{{ item.title | escape }}</h3>{% if item.price %}<div class="shop-product-price">{{ item.price | money }}</div>{% endif %}</div></a>{% else %}<div class="shop-empty-state">No results found. Try another search.</div>{% endfor %}</div>{% if paginate.pages > 1 %}<nav class="shop-pagination">{{ paginate | default_pagination }}</nav>{% endif %}{% endpaginate %}
  {% endif %}
</section>
{% schema %}
${simpleSchema("Search results")}
{% endschema %}
`,
    "main-404.liquid": `<section class="shop-section"><p class="shop-subheading">404 · PAGE NOT FOUND</p><h1 class="shop-heading">This page took a wrong turn.</h1><p class="shop-subheading">The page may have moved or the address may be incomplete.</p><a class="shop-button" href="{{ routes.root_url }}">Go to the home page</a></section>
{% schema %}
${simpleSchema("404 page")}
{% endschema %}
`,
    "main-blog.liquid": `<section class="shop-section"><h1 class="shop-heading">{{ blog.title | escape }}</h1>{% paginate blog.articles by 12 %}<div class="shop-product-grid">{% for article in blog.articles %}<a class="shop-product-card" href="{{ article.url }}">{% if article.image %}{{ article.image | image_url: width: 900 | image_tag: loading: 'lazy', widths: '320, 480, 640, 900', alt: article.title }}{% endif %}<div class="shop-product-card-body"><h2>{{ article.title | escape }}</h2><p>{{ article.excerpt_or_content | strip_html | truncate: 140 }}</p></div></a>{% else %}<div class="shop-empty-state">No articles have been published yet.</div>{% endfor %}</div>{% if paginate.pages > 1 %}<nav class="shop-pagination">{{ paginate | default_pagination }}</nav>{% endif %}{% endpaginate %}</section>
{% schema %}
${simpleSchema("Blog articles")}
{% endschema %}
`,
    "main-article.liquid": `<article class="shop-section"><p class="shop-subheading">{{ article.published_at | date: '%B %d, %Y' }}</p><h1 class="shop-heading">{{ article.title | escape }}</h1>{% if article.image %}{{ article.image | image_url: width: 1600 | image_tag: loading: 'lazy', widths: '480, 720, 960, 1200, 1600', alt: article.title }}{% endif %}<div class="shop-richtext">{{ article.content }}</div><p><a href="{{ blog.url }}">← Back to {{ blog.title | escape }}</a></p></article>
{% schema %}
${simpleSchema("Article")}
{% endschema %}
`,
    "main-list-collections.liquid": `<section class="shop-section"><h1 class="shop-heading">Shop collections</h1><div class="shop-collection-list">{% for collection in collections %}{% unless collection.handle == 'frontpage' %}<a class="shop-collection-card" href="{{ collection.url }}">{% if collection.featured_image %}{{ collection.featured_image | image_url: width: 900 | image_tag: loading: 'lazy', widths: '320, 480, 640, 900', alt: collection.title }}{% endif %}<h2>{{ collection.title | escape }}</h2></a>{% endunless %}{% else %}<div class="shop-empty-state">Create a collection in Shopify Admin to get started.</div>{% endfor %}</div></section>
{% schema %}
${simpleSchema("Collections list")}
{% endschema %}
`,
  };
}

function addJsonTemplates(files: Map<string, ThemeFile>, pages: Page[], project: Project, sourceNames: Map<string, string>, watermark: boolean) {
  files.set("templates/index.json", JSON.stringify({
    sections: {
      main: { type: "webloom-liquid", settings: { markup: makeLiquidSettingContent(htmlBody(project, pages[0], pages[0].blocks.filter((b) => b.type !== "navbar" && b.type !== "footer"), watermark), project, sourceNames) } },
      products: { type: "featured-products", settings: { heading: "Shop the collection", products_to_show: 4 } },
    },
    order: ["main", "products"],
  }, null, 2));

  files.set("templates/page.json", jsonTemplate("main-page"));
  files.set("templates/product.json", jsonTemplate("main-product"));
  files.set("templates/collection.json", jsonTemplate("main-collection"));
  files.set("templates/cart.json", jsonTemplate("main-cart"));
  files.set("templates/search.json", jsonTemplate("main-search"));
  files.set("templates/404.json", jsonTemplate("main-404"));
  files.set("templates/blog.json", jsonTemplate("main-blog"));
  files.set("templates/article.json", jsonTemplate("main-article"));
  files.set("templates/list-collections.json", jsonTemplate("main-list-collections"));

  for (let index = 1; index < pages.length; index++) {
    const page = pages[index];
    const handle = shopifyPageHandle(page, pages);
    const setting = makeLiquidSettingContent(htmlBody(project, page, page.blocks.filter((b) => b.type !== "navbar" && b.type !== "footer"), watermark), project, sourceNames);
    files.set(`templates/page.webloom-${handle}.json`, jsonTemplate("webloom-liquid", { markup: setting }));
  }
}

function validateThemeFiles(files: Map<string, ThemeFile>) {
  const required = [
    "layout/theme.liquid", "templates/index.json", "templates/product.json", "templates/collection.json",
    "templates/cart.json", "templates/search.json", "templates/page.json", "templates/404.json",
    "config/settings_schema.json", "config/settings_data.json", "sections/header-group.json", "sections/footer-group.json",
  ];
  for (const path of required) if (!files.has(path)) throw new Error(`Shopify theme is missing the required ${path} file.`);

  const sectionNames = new Set([...files.keys()].filter((path) => path.startsWith("sections/") && path.endsWith(".liquid")).map((path) => path.slice("sections/".length, -".liquid".length)));
  for (const [path, value] of files) {
    if (path.endsWith(".json")) {
      let data: any;
      try { data = JSON.parse(value as string); } catch { throw new Error(`Webloom found a JSON issue in ${path}. Please try again.`); }
      if (path.startsWith("templates/") || path.startsWith("sections/")) {
        const sections = data.sections || {};
        const order: string[] = data.order || [];
        if (order.length !== Object.keys(sections).length || order.some((id) => !sections[id])) throw new Error(`The Shopify template order is incomplete in ${path}.`);
        for (const id of order) {
          const type = sections[id]?.type;
          if (!sectionNames.has(type)) throw new Error(`Shopify template ${path} references a missing section: ${type}.`);
        }
      }
    }
    if (path.startsWith("sections/") && path.endsWith(".liquid")) {
      const source = value as string;
      if (new TextEncoder().encode(source).byteLength > MAX_SECTION_BYTES) throw new Error(`The generated ${path} section is too large for Shopify. Remove a large custom HTML block and try again.`);
      const schema = source.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/);
      if (schema) {
        try { JSON.parse(schema[1]); } catch { throw new Error(`Shopify could not read the section settings in ${path}.`); }
      }
    }
  }
}

export async function buildShopifyThemeFiles(project: Project): Promise<Map<string, ThemeFile>> {
  if (!project.pages.length) throw new Error("Add at least one page before creating a Shopify theme.");
  const pages = project.pages;
  const firstPage = pages[0];
  const { assets, sourceNames } = await collectThemeImages(project);
  const files = new Map<string, ThemeFile>();
  const plan = await getMyPlan();
  assert3DExportAllowed(project, plan);
  const watermark = plan !== "pro";

  files.set("layout/theme.liquid", makeThemeLayout(project));
  files.set("assets/webloom.css", SITE_CSS);
  files.set("assets/shopify-store.css", SHOPIFY_CSS);
  files.set("assets/webloom.js", SITE_JS);
  for (const [name, bytes] of assets) files.set(`assets/${name}`, bytes);

  files.set("sections/webloom-liquid.liquid", liquidContentSection());
  files.set("sections/header.liquid", makeHeaderSection());
  files.set("sections/footer.liquid", makeFooterSection());
  files.set("sections/featured-products.liquid", makeFeaturedProductsSection());
  for (const [filename, source] of Object.entries(makeCommerceSections())) files.set(`sections/${filename}`, source);
  files.set("snippets/product-card.liquid", makeProductCardSnippet());

  const headerMarkup = makeLiquidSettingContent(shopHeaderMarkup(project, firstPage, watermark), project, sourceNames, true);
  const footerMarkup = makeLiquidSettingContent(shopFooterMarkup(project, firstPage, watermark), project, sourceNames);
  files.set("sections/header-group.json", JSON.stringify({
    type: "header",
    name: "Header group",
    sections: { header: { type: "header", settings: { markup: headerMarkup } } },
    order: ["header"],
  }, null, 2));
  files.set("sections/footer-group.json", JSON.stringify({
    type: "footer",
    name: "Footer group",
    sections: { footer: { type: "footer", settings: { markup: footerMarkup } } },
    order: ["footer"],
  }, null, 2));

  addJsonTemplates(files, pages, project, sourceNames, watermark);
  files.set("config/settings_schema.json", JSON.stringify(themeInfo(`Webloom — ${project.name}`), null, 2));
  files.set("config/settings_data.json", JSON.stringify({
    current: { color_primary: safeColor(project.theme.primary, "#6d5ae6"), color_surface: safeColor(project.theme.surface, "#f7f5fa") },
    presets: { "Webloom": { color_primary: safeColor(project.theme.primary, "#6d5ae6"), color_surface: safeColor(project.theme.surface, "#f7f5fa") } },
  }, null, 2));
  files.set("locales/en.default.json", JSON.stringify({ general: { accessibility: { skip_to_content: "Skip to content" } } }, null, 2));
  files.set("README.txt", shopifyReadme(project, pages));

  validateThemeFiles(files);
  return files;
}

export function shopifyReadme(project: Project, pages: Page[]): string {
  const extraPages = pages.slice(1).map((page) => {
    const handle = shopifyPageHandle(page, pages);
    return `- Create a Shopify Page with the handle "${handle}" and assign the theme template "page.webloom-${handle}".`;
  }).join("\n");
  return `WEBLOOM SHOPIFY THEME — ${project.name}

This is a Shopify Online Store 2.0 theme ZIP. Upload the ZIP itself; do not extract it first.

1. In Shopify Admin, open Online Store → Themes.
2. Choose Add theme → Upload zip file and select this ZIP.
3. Click Customize on the newly uploaded, unpublished theme. Preview it before publishing.
4. Add products and collections in Shopify Admin. The theme includes working product, collection, cart, search, blog, article and 404 templates.
5. The homepage includes your Webloom design plus a featured-products area. Open the theme editor to select a collection and edit the featured-products settings.
6. If your Webloom project has extra pages, create Shopify Pages with these handles and select the matching Webloom template in each page's Theme template menu:
${extraPages || "- No additional Webloom pages were included."}
7. Review navigation, payment/shipping settings, product data, tax and legal pages before publishing. Shopify checkout and payment settings are configured in your Shopify store, not in this theme ZIP.

Your site text and images are included in the theme. The Webloom content is available in the Shopify theme editor's Custom Liquid content field; you can also continue editing your original project in Webloom.

Contact/newsletter forms configured in Webloom continue to use the email address you entered and open a visitor's email app. They are not stored in Shopify's customer database. Replace them with Shopify-native forms/apps if you need in-store lead capture.

Shopify's ZIP validator is the final authority for your store and current platform rules. This package is generated in the Shopify Online Store 2.0 folder structure and is preflight-checked by Webloom, but the theme should be previewed in your development store before you publish it.

Made with Webloom.
`;
}

export async function exportShopifyThemeZip(project: Project): Promise<void> {
  const files = await buildShopifyThemeFiles(project);
  const zip = new JSZip();
  for (const [path, content] of files) zip.file(path, content);
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  if (blob.size > MAX_THEME_BYTES) throw new Error("The Shopify ZIP exceeds Shopify's 50 MB theme upload limit. Reduce the number or size of your images and try again.");
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "webloom-store";
  downloadBlob(blob, `${safeName}-shopify-theme.zip`);
}
