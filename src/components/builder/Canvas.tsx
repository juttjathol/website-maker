"use client";
/**
 * Editing canvas. Every block is sortable; nested section and column containers
 * are valid drop targets. The containing BuilderWorkbench owns the DndContext
 * so the palette and canvas participate in one accessible drag session.
 */
import React, { useCallback, useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, Project } from "@/lib/schema";
import { BLOCKS } from "@/lib/registry";
import { BlockRenderer, SiteBody } from "@/components/site/renderers";
import { SiteChrome, SiteStyleTag } from "@/components/site/SiteChrome";
import { useEditor } from "@/lib/store";
import { cx } from "@/lib/util";
import { useSceneEditing } from "./useSceneEditing";
import { pageFileName } from "@/lib/tree";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";

function EmptyContainer({ parentId, big }: { parentId: string | null; big?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: parentId ? `container-${parentId}` : "container-root",
    data: { source: "container", parentId },
  });
  return (
    <div ref={setNodeRef} className="drop-hint" style={big ? { margin: 40 } : { margin: 8 }}>
      {isOver ? "✨ Drop it here" : "Drag blocks here from the left panel"}
    </div>
  );
}

function CanvasBlock({
  block,
  parentId,
  index,
  renderCanvasChildren,
}: {
  block: Block;
  parentId: string | null;
  index: number;
  renderCanvasChildren: (children: Block[] | undefined, parentId: string) => React.ReactNode;
}) {
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const hover = useEditor((s) => s.hover);
  const remove = useEditor((s) => s.removeBlockById);
  const duplicate = useEditor((s) => s.duplicateBlockById);
  const nudge = useEditor((s) => s.nudgeBlock);
  const isDropContainer = block.type === "section" || block.type === "column";

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.id,
      data: { source: "canvas", blockId: block.id, parentId, index, type: block.type },
    });

  // Non-empty containers get an append target across their surface. Empty ones
  // use the visible EmptyContainer target instead to avoid duplicate ids.
  const { setNodeRef: setDropRef } = useDroppable({
    id: `container-${block.id}`,
    data: { source: "container", parentId: block.id },
    disabled: !isDropContainer || !block.children?.length,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (isDropContainer && block.children?.length) setDropRef(node);
      }}
      style={style}
      data-block-id={block.id}
      className={cx("canvas-block", selectedId === block.id && "is-selected")}
      onMouseOver={(e) => {
        e.stopPropagation();
        hover(block.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        select(block.id);
      }}
    >
      <div className="block-float">
        <button className="drag-handle" {...attributes} {...listeners} title="Drag to move" aria-label="Drag block">
          <GripVertical size={13} />
        </button>
        <span className="label">{BLOCKS[block.type]?.label || block.type}</span>
        <button title="Move section up" aria-label="Move block up" onClick={(e) => { e.stopPropagation(); nudge(block.id, -1); }}>
          <ArrowUp size={12} />
        </button>
        <button title="Move section down" aria-label="Move block down" onClick={(e) => { e.stopPropagation(); nudge(block.id, 1); }}>
          <ArrowDown size={12} />
        </button>
        <button title="Duplicate" aria-label="Duplicate block" onClick={(e) => { e.stopPropagation(); duplicate(block.id); }}>
          <Copy size={12} />
        </button>
        <button title="Delete" aria-label="Delete block" onClick={(e) => { e.stopPropagation(); remove(block.id); }}>
          <Trash2 size={12} />
        </button>
      </div>
      <BlockRenderer
        block={block}
        mode="editor"
        renderChildren={(children) => renderCanvasChildren(children, block.id)}
      />
    </div>
  );
}

export function Canvas({ project, previewMode = false }: { project: Project; previewMode?: boolean }) {
  const device = useEditor((s) => s.device);
  const currentPageId = useEditor((s) => s.currentPageId);
  const updateProp = useEditor((s) => s.updateProp);
  const setCurrentPage = useEditor((s) => s.setCurrentPage);
  const hover = useEditor((s) => s.hover);
  const frameRef = useRef<HTMLDivElement>(null);
  const plan = useEditor((s) => s.plan);
  useSceneEditing(frameRef, plan === "pro" && !previewMode);
  const page = project.pages.find((p) => p.id === currentPageId) || project.pages[0];

  const onCanvasBlur = (e: React.FocusEvent) => {
    const el = e.target as HTMLElement;
    const editPath = el.getAttribute?.("data-wk-edit");
    if (!editPath) return;
    const blockEl = el.closest("[data-block-id]");
    const blockId = blockEl?.getAttribute("data-block-id");
    if (!blockId) return;
    const text = (el.innerText || "").replace(/\u00a0/g, " ");
    updateProp(blockId, editPath, text);
  };

  useEffect(() => {
    const iv = window.setInterval(() => {
      document.querySelectorAll<HTMLElement>("[data-countdown]").forEach((el) => {
        const t = new Date(el.getAttribute("data-countdown") || "").getTime();
        if (isNaN(t)) return;
        const diff = Math.max(0, t - Date.now());
        const d = Math.floor(diff / 86400000);
        const h = Math.floor(diff / 3600000) % 24;
        const m = Math.floor(diff / 60000) % 60;
        const s = Math.floor(diff / 1000) % 60;
        const set = (k: string, v: number) => {
          const n = el.querySelector(`[data-cd="${k}"]`);
          if (n) n.textContent = (v < 10 ? "0" : "") + v;
        };
        set("days", d); set("hours", h); set("mins", m); set("secs", s);
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, []);

  const onCanvasClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    const toggle = t.closest("[data-nav-toggle]");
    if (toggle) {
      const nav = toggle.closest(".wk-navbar-inner");
      nav?.querySelector("[data-nav-links]")?.classList.toggle("wk-open");
      e.preventDefault();
      return;
    }
    const anchor = t.closest("a") as HTMLAnchorElement | null;
    if (previewMode && anchor) {
      const href = anchor.getAttribute("href") || "";
      if (href && !href.startsWith("#") && !/^(https?:|mailto:|tel:|sms:|javascript:)/i.test(href) && anchor.target !== "_blank") {
        e.preventDefault();
        const file = href.split(/[?#]/)[0].split("/").pop() || "index.html";
        const destination = project.pages.find((p) => pageFileName(p, project.pages) === file);
        if (destination) setCurrentPage(destination.id);
        return;
      }
    }
    if (anchor || t.closest("[data-wk-form]")) e.preventDefault();
  };

  const renderCanvasChildren = useCallback(
    (children: Block[] | undefined, parentId: string): React.ReactNode => {
      if (!children || children.length === 0) return <EmptyContainer parentId={parentId} />;
      return (
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children.map((child, i) => (
            <CanvasBlock
              key={child.id}
              block={child}
              parentId={parentId}
              index={i}
              renderCanvasChildren={renderCanvasChildren}
            />
          ))}
        </SortableContext>
      );
    },
    []
  );

  if (previewMode) {
    return (
      <div className="canvas-scroll preview-canvas-scroll">
        <div className={cx("canvas-frame", `device-${device}`)} onClick={onCanvasClick} onSubmit={(e) => e.preventDefault()}>
          <SiteStyleTag />
          <SiteChrome project={project} plan={plan}>
            {page ? <SiteBody blocks={page.blocks} mode="preview" /> : null}
          </SiteChrome>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-scroll">
      <div
        ref={frameRef}
        className={cx("canvas-frame", `device-${device}`)}
        onMouseLeave={() => hover(null)}
        onBlur={onCanvasBlur}
        onClick={onCanvasClick}
      >
        <SiteStyleTag />
        <SiteChrome project={project} plan={plan}>
          {!page || page.blocks.length === 0 ? (
            <EmptyContainer parentId={null} big />
          ) : (
            <SortableContext items={page.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {page.blocks.map((block, i) => (
                <CanvasBlock
                  key={block.id}
                  block={block}
                  parentId={null}
                  index={i}
                  renderCanvasChildren={renderCanvasChildren}
                />
              ))}
            </SortableContext>
          )}
        </SiteChrome>
      </div>
    </div>
  );
}
