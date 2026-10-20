"use client";
import React, { useState } from "react";
import { useEditor } from "@/lib/store";
import type { BlockStyle, Device, Project } from "@/lib/schema";
import { BLOCKS } from "@/lib/registry";
import { findBlock } from "@/lib/tree";
import { Scene3DInspector } from "./Scene3DInspector";
import { FieldRow } from "./Field";
import { Icon } from "@/components/site/icons";
import { cx } from "@/lib/util";
import { Copy, Eye, Trash2 } from "lucide-react";



export function Inspector({ project }: { project: Project }) {
  const selectedId = useEditor((s) => s.selectedId);
  const currentPageId = useEditor((s) => s.currentPageId);
  const updateProp = useEditor((s) => s.updateProp);
  const updateStyle = useEditor((s) => s.updateStyle);
  const updatePage = useEditor((s) => s.updatePage);
  const rename = useEditor((s) => s.renameProject);
  const remove = useEditor((s) => s.removeBlockById);
  const duplicate = useEditor((s) => s.duplicateBlockById);
  const page = project.pages.find((p) => p.id === currentPageId) || project.pages[0];
  const isHomePage = page?.id === project.pages[0]?.id;
  const selected = page && selectedId ? findBlock(page.blocks, selectedId)?.block ?? null : null;
  const [tab, setTab] = useState<"content" | "style" | "page">("content");
  const [tabContext, setTabContext] = useState("");
  const contextKey = selected ? `block:${selected.id}` : `page:${currentPageId}`;
  const activeTab = tabContext === contextKey ? tab : selected ? "content" : "page";
  const chooseTab = (next: "content" | "style" | "page") => {
    setTab(next);
    setTabContext(contextKey);
  };

  const def = selected ? BLOCKS[selected.type] : null;

  return (
    <aside className="panel panel-right flex flex-col">
      {selected && def ? (
        <>
          <div className="flex items-center gap-3 border-b border-[#e7e4f0] px-4 py-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#efedfc] text-[#6d5ae6]"><Icon name={def.icon} size={18} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-extrabold">{def.label}</h2>
              <p className="truncate text-[10.5px] text-[#8d85ab]">{def.description}</p>
            </div>
            <button className="icon-button" title="Duplicate block" onClick={() => duplicate(selected.id)}><Copy size={14} /></button>
            <button className="icon-button danger" title="Delete block" onClick={() => remove(selected.id)}><Trash2 size={14} /></button>
          </div>
          <div className="flex border-b border-[#e7e4f0] px-3 pt-1">
            <button className={cx("tab-btn", activeTab === "content" && "active")} onClick={() => chooseTab("content")}>Content</button>
            <button className={cx("tab-btn", activeTab === "style" && "active")} onClick={() => chooseTab("style")}>Style</button>
          </div>
          {activeTab === "content" ? (
            <div className="space-y-4 p-4">
              {selected.type === "scene3d" ? <Scene3DInspector key={selected.id} block={selected} /> : def.fields.length ? def.fields.map((field) => {
                if (field.showIf && selected.props[field.showIf.key] !== field.showIf.equals) return null;
                return (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={selected.props[field.key]}
                    onChange={(value) => updateProp(selected.id, field.key, value)}
                  />
                );
              }) : (
                <div className="rounded-xl bg-[#f7f5fd] p-4 text-[12px] leading-relaxed text-[#716b89]">
                  This block is a layout container. Drag other blocks into it from the left panel.
                </div>
              )}
              <div className="rounded-xl border border-[#eceaf4] p-3 text-[11px] leading-relaxed text-[#8d85ab]">
                <strong className="text-[#6b6485]">Inline edit:</strong> you can also click any text on the page and type directly.
              </div>
            </div>
          ) : null}
          {activeTab === "style" ? (
            <StyleEditor block={selected} onChange={(patch) => updateStyle(selected.id, patch)} />
          ) : null}
        </>
      ) : (
        <>
          <div className="border-b border-[#e7e4f0] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#efedfc] text-[#6d5ae6]"><Icon name="FileText" size={18} /></span>
              <div>
                <h2 className="text-sm font-extrabold">Page settings</h2>
                <p className="text-[10.5px] text-[#8d85ab]">Details visitors and search engines see</p>
              </div>
            </div>
          </div>
          <div className="flex border-b border-[#e7e4f0] px-3 pt-1">
            <button className={cx("tab-btn", activeTab === "page" && "active")} onClick={() => chooseTab("page")}>Page</button>
            <button className={cx("tab-btn", activeTab === "content" && "active")} onClick={() => chooseTab("content")}>Site</button>
          </div>
          {activeTab === "page" ? (
            <div className="space-y-4 p-4">
              {page ? (
                <>
                  <div>
                    <label className="inspector-label">Page name</label>
                    <input className="inspector-input" value={page.name} onChange={(e) => updatePage(page.id, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className="inspector-label">Page address / file name</label>
                    <div className="flex items-center gap-1 rounded-lg border border-[#e2def0] px-2.5">
                      <span className="text-xs text-[#8d85ab]">/</span>
                      <input className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[13px] outline-none disabled:text-[#8d85ab]" value={isHomePage ? "index" : page.slug} disabled={isHomePage} onChange={(e) => updatePage(page.id, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
                      <span className="text-xs text-[#8d85ab]">.html</span>
                    </div>
                    <p className="mt-1 text-[10.5px] text-[#8d85ab]">Use a simple name with no spaces. Home page is always index.html.</p>
                  </div>
                  <div>
                    <label className="inspector-label">Search result title</label>
                    <input className="inspector-input" value={page.seo.title} onChange={(e) => updatePage(page.id, { seo: { ...page.seo, title: e.target.value } })} placeholder={page.name} />
                  </div>
                  <div>
                    <label className="inspector-label">Search result description</label>
                    <textarea className="inspector-input min-h-[86px] resize-y" value={page.seo.description} onChange={(e) => updatePage(page.id, { seo: { ...page.seo, description: e.target.value } })} placeholder="A short description of this page" />
                  </div>
                  <div className="rounded-xl bg-[#f7f5fd] p-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#8d85ab]">Search preview</div>
                    <div className="mt-2 truncate text-[15px] font-medium text-[#1a0dab]">{page.seo.title || page.name}</div>
                    <div className="truncate text-[11px] text-[#188038]">yourwebsite.com/{isHomePage ? "" : `${page.slug}.html`}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4d5156]">{page.seo.description || "Add a description so people know what this page is about."}</div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
          {activeTab === "content" ? (
            <SiteSettings project={project} onRename={rename} />
          ) : null}
        </>
      )}
    </aside>
  );
}

function StyleEditor({ block, onChange }: { block: { style: BlockStyle }; onChange: (p: Partial<BlockStyle>) => void }) {
  const style = block.style || {};
  const align = style.align || "left";
  const devices = ["desktop", "tablet", "mobile"] as Device[];
  const hideOn = style.hideOn || [];
  const toggleDevice = (device: Device) => {
    const next = hideOn.includes(device) ? hideOn.filter((x) => x !== device) : [...hideOn, device];
    onChange({ hideOn: next });
  };

  return (
    <div className="space-y-5 p-4">
      <div>
        <label className="inspector-label">Text alignment</label>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#f1eff8] p-1">
          {(["left", "center", "right"] as const).map((a) => (
            <button key={a} className={cx("rounded-md py-1.5 text-xs font-semibold capitalize", align === a ? "bg-white text-[#5b49d0] shadow-sm" : "text-[#807995] hover:text-[#3b3552]")} onClick={() => onChange({ align: a })}>{a}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberStyle label="Top padding" value={style.paddingTop} onChange={(v) => onChange({ paddingTop: v })} max={180} />
        <NumberStyle label="Bottom padding" value={style.paddingBottom} onChange={(v) => onChange({ paddingBottom: v })} max={180} />
        <NumberStyle label="Left padding" value={style.paddingLeft} onChange={(v) => onChange({ paddingLeft: v })} max={120} />
        <NumberStyle label="Right padding" value={style.paddingRight} onChange={(v) => onChange({ paddingRight: v })} max={120} />
        <NumberStyle label="Top margin" value={style.marginTop} onChange={(v) => onChange({ marginTop: v })} max={180} />
        <NumberStyle label="Bottom margin" value={style.marginBottom} onChange={(v) => onChange({ marginBottom: v })} max={180} />
      </div>
      <div>
        <label className="inspector-label">Maximum content width</label>
        <select className="inspector-input" value={style.maxWidth ?? 1120} onChange={(e) => onChange({ maxWidth: Number(e.target.value) || 0 })}>
          <option value={1120}>Standard (1120px)</option>
          <option value={960}>Narrow (960px)</option>
          <option value={760}>Reading width (760px)</option>
          <option value={0}>Full width</option>
        </select>
      </div>
      <ColorStyle label="Background color" value={style.backgroundColor || ""} onChange={(v) => onChange({ backgroundColor: v || undefined })} />
      <ColorStyle label="Text color" value={style.textColor || ""} onChange={(v) => onChange({ textColor: v || undefined })} />
      <ColorStyle label="Accent color" value={style.accentColor || ""} onChange={(v) => onChange({ accentColor: v || undefined })} />
      <div className="rounded-xl border border-[#e9e6f2] p-3">
        <div className="mb-2 text-xs font-bold">Hide this block on…</div>
        <div className="space-y-2">
          {devices.map((d) => (
            <label key={d} className="flex cursor-pointer items-center justify-between text-xs text-[#5d5775]">
              {d === "desktop" ? "Computers" : d === "tablet" ? "Tablets" : "Phones"}
              <input type="checkbox" className="accent-[#6d5ae6]" checked={hideOn.includes(d)} onChange={() => toggleDevice(d)} />
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-[#f7f5fd] p-3 text-[11px] leading-relaxed text-[#8d85ab]">
        Spacing and colors apply only to this block. Use the <strong>Theme</strong> tab to change the entire site.
      </div>
    </div>
  );
}

function NumberStyle({ label, value, onChange, max }: { label: string; value?: number; onChange: (n: number | undefined) => void; max: number }) {
  return (
    <div>
      <label className="inspector-label">{label}</label>
      <div className="flex items-center gap-1">
        <input type="number" min="0" max={max} step="4" className="inspector-input !px-2" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value) || undefined)} />
        <span className="text-[10px] text-[#8d85ab]">px</span>
      </div>
    </div>
  );
}

function ColorStyle({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="inspector-label">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-md border border-[#e1dced] p-0.5" />
        <input className="inspector-input" value={value} placeholder="Use theme default" onChange={(e) => onChange(e.target.value)} />
        {value ? <button className="text-[10px] text-[#6d5ae6]" onClick={() => onChange("")}>Reset</button> : null}
      </div>
    </div>
  );
}

function SiteSettings({ project, onRename }: { project: Project; onRename: (name: string) => void }) {
  const setSeo = useEditor((s) => s.setSeo);
  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="inspector-label">Website name</label>
        <input className="inspector-input" value={project.name} onChange={(e) => onRename(e.target.value)} />
        <p className="mt-1 text-[10.5px] text-[#8d85ab]">This is used for your project and browser tabs.</p>
      </div>
      <div>
        <label className="inspector-label">Default browser title</label>
        <input className="inspector-input" value={project.seo.title} onChange={(e) => setSeo({ title: e.target.value })} />
      </div>
      <div>
        <label className="inspector-label">Default site description</label>
        <textarea className="inspector-input min-h-[90px] resize-y" value={project.seo.description} onChange={(e) => setSeo({ description: e.target.value })} />
      </div>
      <div className="rounded-xl border border-[#eceaf4] p-3">
        <div className="flex items-center gap-2 text-xs font-bold"><Eye size={14} className="text-[#6d5ae6]" /> Visitors can see these details in search results</div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#8d85ab]">Page-specific titles and descriptions are in the Page tab when no block is selected.</p>
      </div>
      <div className="rounded-xl bg-[#fff8eb] p-3 text-[11px] leading-relaxed text-[#8a6a25]">
        Projects are saved on this device in your browser. Download a copy from My websites to keep a backup.
      </div>
    </div>
  );
}
