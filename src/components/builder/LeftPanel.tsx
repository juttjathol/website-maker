"use client";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEditor } from "@/lib/store";
import type { Block, BlockType, Project } from "@/lib/schema";
import { BLOCKS, BLOCK_LIST } from "@/lib/registry";
import { Icon } from "@/components/site/icons";
import { cx } from "@/lib/util";
import {
  ChevronDown, ChevronRight, GripVertical, Layers3, Plus, Search, Trash2,
} from "lucide-react";

const CATEGORIES = [
  { id: "sections", label: "Sections" },
  { id: "content", label: "Content" },
  { id: "layout", label: "Layout" },
] as const;

type Tab = "add" | "layers" | "pages" | "theme";

function DraggableBlock({
  type,
  onAdd,
  locked = false,
}: {
  type: BlockType;
  onAdd: () => void;
  locked?: boolean;
}) {
  const def = BLOCKS[type];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    disabled: locked,
    id: `palette-${type}`,
    data: { source: "palette", blockType: type },
  });
  return (
    <div
      ref={setNodeRef}
      className="palette-item"
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        cursor: "default",
      }}
    >
      <span className="palette-icon"><Icon name={def.icon} size={16} /></span>
      <button type="button" className="palette-add" disabled={locked} onClick={onAdd} title={`Add ${def.label}`}>
        <span>{def.label}</span>
        <span className="palette-plus"><Plus size={13} /></span>
      </button>
      <button
        type="button"
        className="palette-drag"
        disabled={locked}
        {...attributes}
        {...listeners}
        title={`Drag ${def.label} onto your page`}
        aria-label={`Drag ${def.label}`}
      >
        <GripVertical size={15} />
      </button>
    </div>
  );
}

function LayerRows({
  blocks,
  depth = 0,
  onSelect,
}: {
  blocks: Block[];
  depth?: number;
  onSelect: (id: string) => void;
}) {
  const selectedId = useEditor((s) => s.selectedId);
  const removeBlock = useEditor((s) => s.removeBlockById);
  const duplicateBlock = useEditor((s) => s.duplicateBlockById);
  return (
    <div className="space-y-0.5">
      {blocks.map((block) => {
        const def = BLOCKS[block.type];
        return (
          <React.Fragment key={block.id}>
            <div
              className={cx("layer-row", selectedId === block.id && "selected")}
              style={{ paddingLeft: 8 + depth * 15 }}
              onClick={() => onSelect(block.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(block.id); }}
            >
              {block.children?.length ? <ChevronDown size={12} className="flex-none text-[#9e97b6]" /> : <span className="w-3 flex-none" />}
              <Icon name={def?.icon || "Layers3"} size={14} />
              <span className="min-w-0 flex-1 truncate">{def?.label || block.type}</span>
              <button
                className="layer-action"
                title="Duplicate"
                onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
              >
                <Layers3 size={12} />
              </button>
              <button
                className="layer-action danger"
                title="Delete"
                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
              >
                <Trash2 size={12} />
              </button>
            </div>
            {block.children?.length ? (
              <LayerRows blocks={block.children} depth={depth + 1} onSelect={onSelect} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function LeftPanel({ project }: { project: Project }) {
  const plan = useEditor((s) => s.plan);
  const tab = useEditor((s) => s.leftTab);
  const setTab = useEditor((s) => s.setLeftTab);
  const pageId = useEditor((s) => s.currentPageId);
  const setPage = useEditor((s) => s.setCurrentPage);
  const addBlock = useEditor((s) => s.addBlock);
  const select = useEditor((s) => s.select);
  const removePage = useEditor((s) => s.removePage);
  const addPage = useEditor((s) => s.addPage);
  const setTheme = useEditor((s) => s.setTheme);
  const page = project.pages.find((p) => p.id === pageId) || project.pages[0];
  const [query, setQuery] = useState("");
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCK_LIST.filter((b) => !q || `${b.label} ${b.description} ${b.category}`.toLowerCase().includes(q));
  }, [query]);

  const chooseBlock = (type: BlockType) => {
    addBlock(type, null, page?.blocks.length ?? 0);
    setTab("add");
  };

  const chooseLayer = (id: string) => {
    select(id);
      document.querySelector(`[data-block-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <aside className="panel panel-left flex flex-col">
      <div className="flex border-b border-[#e7e4f0] px-2 pt-2">
        {([
          ["add", "Add"],
          ["layers", "Layers"],
          ["pages", "Pages"],
          ["theme", "Theme"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button key={id} className={cx("tab-btn", tab === id && "active")} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "add" ? (
        <div className="p-3">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9992b1]" />
            <input
              className="inspector-input !pl-9"
              placeholder="Find a block…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mb-3 rounded-lg bg-[#f7f5fd] px-2.5 py-2 text-[11px] leading-relaxed text-[#716b89]">
            Click <strong>+</strong> to add a block, or drag the grip onto your page.
          </div>
          {plan !== "pro" ? <div className="mb-3 rounded-lg border border-[#e7e4f0] p-3 text-xs leading-relaxed">
            <strong>New: 3D scenes</strong><p className="my-1">Cubes, diamond cubes and panels. Drag, rotate and animate with Pro.</p>
            <Link href="/account" className="font-bold text-[#6d5ae6]">Request Webloom Pro →</Link>
          </div> : null}
          {CATEGORIES.map((category) => {
            const items = matches.filter((x) => x.category === category.id);
            if (!items.length) return null;
            const isCollapsed = collapsed[category.id] && !query;
            return (
              <section key={category.id} className="mb-4">
                <button
                  type="button"
                  className="mb-2 flex w-full items-center gap-1.5 px-1 text-left text-[10.5px] font-extrabold uppercase tracking-[.11em] text-[#8b84a4]"
                  onClick={() => setCollapsed((x) => ({ ...x, [category.id]: !x[category.id] }))}
                >
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  {category.label} <span className="font-semibold tracking-normal">({items.length})</span>
                </button>
                {!isCollapsed ? (
                  <div className="space-y-1.5">
                    {items.map((b) => (
                      <DraggableBlock key={b.type} type={b.type} locked={b.type === "scene3d" && plan !== "pro"} onAdd={() => chooseBlock(b.type)} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}

      {tab === "layers" ? (
        <div className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Page layers</h2>
              <p className="mt-0.5 text-[11px] text-[#8d85ab]">Select a part to edit it</p>
            </div>
            <span className="rounded-full bg-[#efedfc] px-2 py-1 text-[10px] font-bold text-[#6d5ae6]">{page?.blocks.length ?? 0} blocks</span>
          </div>
          {page?.blocks.length ? (
            <LayerRows blocks={page.blocks} onSelect={chooseLayer} />
          ) : (
            <div className="drop-hint !px-3 !py-6">This page is empty. Add a block to begin.</div>
          )}
        </div>
      ) : null}

      {tab === "pages" ? (
        <div className="p-3">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Your pages</h2>
              <p className="mt-0.5 text-[11px] text-[#8d85ab]">Each page becomes its own file.</p>
            </div>
            <button className="btn-app primary !px-2.5 !py-1.5 !text-[11px]" onClick={() => { setNewPageOpen(!newPageOpen); setNewPageName(""); }}>
              <Plus size={13} /> Add page
            </button>
          </div>
          {newPageOpen ? (
            <form
              className="mb-3 rounded-xl border border-[#e1dcf0] bg-[#f9f8fd] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (newPageName.trim()) addPage(newPageName.trim());
                setNewPageName("");
                setNewPageOpen(false);
              }}
            >
              <label className="inspector-label">Page name</label>
              <input autoFocus className="inspector-input" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="e.g. About us" />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" className="btn-app ghost !py-1.5 !text-[11px]" onClick={() => setNewPageOpen(false)}>Cancel</button>
                <button type="submit" className="btn-app primary !py-1.5 !text-[11px]">Create page</button>
              </div>
            </form>
          ) : null}
          <div className="space-y-2">
            {project.pages.map((p, i) => (
              <div key={p.id} className={cx("page-card", pageId === p.id && "active")}>
                <button className="min-w-0 flex-1 text-left" onClick={() => setPage(p.id)}>
                  <span className="flex items-center gap-2 text-[13px] font-semibold">
                    <span className="page-num">{i === 0 ? "⌂" : i + 1}</span>
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="mt-1 block truncate pl-7 text-[10.5px] text-[#8d85ab]">{i === 0 ? "Home page" : `/${p.slug}.html`}</span>
                </button>
                {project.pages.length > 1 ? (
                  <button
                    className="page-delete"
                    title="Delete page"
                    onClick={() => {
                      if (window.confirm(`Delete the “${p.name}” page? This cannot be undone.`)) removePage(p.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-[#f7f5fd] p-3 text-[11.5px] leading-relaxed text-[#716b89]">
            <strong>Tip:</strong> Use the navigation block to link pages together. For example, set the About link to <code>about.html</code>.
          </div>
        </div>
      ) : null}

      {tab === "theme" ? (
        <div className="space-y-5 p-3">
          <div>
            <h2 className="text-sm font-bold">Your design style</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#8d85ab]">Change the whole site’s colors and fonts in one place.</p>
          </div>
          <div>
            <label className="inspector-label">Color mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={cx("theme-mode-card", project.theme.mode === "light" && "active")}
                onClick={() => setTheme({ mode: "light", background: "#ffffff", text: "#161224", muted: "#5c5675", surface: "#f4f2fb" })}
              >
                <span className="theme-mode-swatch light" /> Light
              </button>
              <button
                className={cx("theme-mode-card", project.theme.mode === "dark" && "active")}
                onClick={() => setTheme({ mode: "dark", background: "#11101b", text: "#f8f6ff", muted: "#b4aec8", surface: "#242134" })}
              >
                <span className="theme-mode-swatch dark" /> Dark
              </button>
            </div>
          </div>
          <ColorField label="Main brand color" value={project.theme.primary} onChange={(v) => setTheme({ primary: v })} />
          <ColorField label="Page background" value={project.theme.background} onChange={(v) => setTheme({ background: v })} />
          <ColorField label="Main text" value={project.theme.text} onChange={(v) => setTheme({ text: v })} />
          <ColorField label="Secondary text" value={project.theme.muted} onChange={(v) => setTheme({ muted: v })} />
          <ColorField label="Card / section background" value={project.theme.surface} onChange={(v) => setTheme({ surface: v })} />
          <ColorField label="Accent color" value={project.theme.accent} onChange={(v) => setTheme({ accent: v })} />
          <div>
            <label className="inspector-label">Font style</label>
            <select className="inspector-input" value={project.theme.font} onChange={(e) => setTheme({ font: e.target.value as Project["theme"]["font"] })}>
              <option value="modern">Modern sans-serif</option>
              <option value="serif">Classic serif</option>
              <option value="rounded">Friendly rounded</option>
              <option value="mono">Monospace / technical</option>
            </select>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="inspector-label !mb-0">Corner roundness</label>
              <span className="text-[11px] font-bold text-[#6d5ae6]">{project.theme.radius}px</span>
            </div>
            <input type="range" min="0" max="32" value={project.theme.radius} className="w-full accent-[#6d5ae6]" onChange={(e) => setTheme({ radius: Number(e.target.value) })} />
          </div>
          <button
            type="button"
            className="btn-app ghost w-full"
            onClick={() => setTheme({ primary: "#6d5ae6", background: "#ffffff", text: "#161224", muted: "#5c5675", surface: "#f4f2fb", accent: "#e8622c", font: "modern", radius: 14 })}
          >
            Reset to Webloom style
          </button>
          <div className="rounded-xl border border-[#eceaf4] p-3">
            <div className="text-[11px] font-bold text-[#8d85ab]">PREVIEW</div>
            <div className="mt-2 rounded-xl p-3" style={{ background: project.theme.background, color: project.theme.text, border: `1px solid ${project.theme.surface}` }}>
              <div className="text-sm font-bold">Your brand, your style</div>
              <div className="mt-1 text-xs" style={{ color: project.theme.muted }}>This is how your colors look together.</div>
              <div className="mt-3 inline-flex rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: project.theme.primary }}>Button</div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (s: string) => void }) {
  return (
    <div>
      <label className="inspector-label">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-md border border-[#e1dced] bg-white p-0.5" />
        <input className="inspector-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
