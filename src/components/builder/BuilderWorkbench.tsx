"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  closestCenter, DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  ArrowLeft, Check, ChevronDown, CircleHelp, Cloud, CloudOff, Download, Eye, HardDrive,
  Monitor, Plus, Redo2, Rocket, ShoppingBag, Smartphone, Tablet, Undo2, X,
} from "lucide-react";
import type { BlockType, Device, Project } from "@/lib/schema";
import { BRAND } from "@/lib/brand";
import { BLOCKS } from "@/lib/registry";
import { useEditor } from "@/lib/store";
import { findBlock } from "@/lib/tree";
import { exportProjectZip } from "@/lib/export";
import { exportShopifyThemeZip } from "@/lib/shopify-export";
import { cx } from "@/lib/util";
import { Canvas } from "./Canvas";
import { Inspector } from "./Inspector";
import { LeftPanel } from "./LeftPanel";
import { PublishWizard } from "./PublishWizard";
import { BuilderGuide, type GuideAction } from "./BuilderGuide";

const DEVICE_BUTTONS: { device: Device; label: string; Icon: typeof Monitor }[] = [
  { device: "desktop", label: "Computer preview", Icon: Monitor },
  { device: "tablet", label: "Tablet preview", Icon: Tablet },
  { device: "mobile", label: "Phone preview", Icon: Smartphone },
];

export function BuilderWorkbench({ project: initialProject }: { project: Project }) {
  const project = useEditor((s) => s.project) || initialProject;
  const pageId = useEditor((s) => s.currentPageId);
  const device = useEditor((s) => s.device);
  const previewMode = useEditor((s) => s.previewMode);
  const saveState = useEditor((s) => s.saveState);
  const undoStack = useEditor((s) => s.undoStack);
  const redoStack = useEditor((s) => s.redoStack);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const setDevice = useEditor((s) => s.setDevice);
  const setPreviewMode = useEditor((s) => s.setPreviewMode);
  const setPage = useEditor((s) => s.setCurrentPage);
  const addPage = useEditor((s) => s.addPage);
  const setLeftTab = useEditor((s) => s.setLeftTab);
  const addBlock = useEditor((s) => s.addBlock);
  const moveBlock = useEditor((s) => s.moveBlock);
  const [dragType, setDragType] = useState<BlockType | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [shopifyExporting, setShopifyExporting] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toast, setToast] = useState("");
  const currentPage = project.pages.find((p) => p.id === pageId) || project.pages[0];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resolveTarget = (overData: any) => {
    if (!overData) return null;
    if (overData.source === "container") return { parentId: overData.parentId as string | null, index: 9999 };
    if (overData.source === "canvas") return { parentId: (overData.parentId ?? null) as string | null, index: Number(overData.index) || 0 };
    return null;
  };

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as any;
    if (data?.source === "palette") setDragType(data.blockType);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragType(null);
    const active = event.active.data.current as any;
    const over = event.over?.data.current as any;
    if (!active || !over || !currentPage) return;
    const target = resolveTarget(over);
    if (!target) return;

    if (active.source === "palette") {
      // Prevent a malformed drop into a non-container target.
      if (target.parentId) {
        const targetBlock = findBlock(currentPage.blocks, target.parentId)?.block;
        if (!targetBlock || !BLOCKS[targetBlock.type]?.acceptsChildren) return;
      }
      addBlock(active.blockType as BlockType, target.parentId, target.index);
      return;
    }

    if (active.source === "canvas") {
      const source = findBlock(currentPage.blocks, active.blockId) as any;
      if (!source) return;
      // array-style reordering: dropping on a sortable block puts the item at
      // that block's original index. The store removes the source then inserts.
      const index = target.index;
      if (source.parent?.id === target.parentId && source.index === index) return;
      moveBlock(active.blockId, target.parentId, index, true);
    }
  };

  const performExport = async (): Promise<boolean> => {
    setExporting(true);
    try {
      await exportProjectZip(project);
      showToast("Your website download is ready!");
      return true;
    } catch (error) {
      console.error("Website export failed", error);
      showToast("Couldn't create the download. Please try again.");
      return false;
    } finally {
      setExporting(false);
    }
  };

  const performShopifyExport = async (): Promise<boolean> => {
    setShopifyExporting(true);
    try {
      await exportShopifyThemeZip(project);
      showToast("Your Shopify theme ZIP is ready. Preview it in Shopify before publishing.");
      return true;
    } catch (error) {
      console.error("Shopify theme export failed", error);
      showToast(error instanceof Error ? error.message : "Could not create the Shopify theme ZIP. Please try again.");
      return false;
    } finally {
      setShopifyExporting(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const saveLabel = saveState === "saving" || saveState === "unsaved"
    ? "Saving…"
    : saveState === "sync-error"
      ? "Sync pending"
      : saveState === "quota"
        ? "Local only"
        : saveState === "local"
          ? "Saved on device"
          : saveState === "saved"
            ? "Cloud saved"
            : "Ready";

  return (
    <div className="builder-shell">
      <header className="builder-toolbar">
        <div className="toolbar-left">
          <Link href="/projects" className="toolbar-back" title="Back to My websites">
            <ArrowLeft size={16} />
          </Link>
          <Link href="/" className="toolbar-brand" title={`${BRAND.name} home`}>
            <span className="toolbar-brand-mark">W</span>
            <span className="toolbar-brand-name">{BRAND.name}</span>
          </Link>
          <span className="toolbar-divider" />
          <input
            className="project-name-input"
            aria-label="Website name"
            value={project.name}
            onChange={(e) => useEditor.getState().renameProject(e.target.value)}
            title="Click to rename your website"
          />
          <span
            className={cx("save-state", saveState === "saved" && "is-saved")}
            title={saveState === "quota" ? "Cloud storage limits were reached. Your project is safe on this device; download a backup to keep it." : undefined}
          >
            {saveState === "saving" || saveState === "unsaved" ? <Cloud size={13} /> : saveState === "local" ? <HardDrive size={13} /> : saveState === "sync-error" || saveState === "quota" ? <CloudOff size={13} /> : <Check size={13} />}
            {saveLabel}
          </span>
        </div>

        <div className="toolbar-center">
          <div className="page-select-wrap">
            <select
              className="toolbar-page-select"
              value={currentPage?.id || ""}
              onChange={(e) => setPage(e.target.value)}
              aria-label="Current page"
            >
              {project.pages.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}
            </select>
            <ChevronDown size={13} />
          </div>
          <button className="toolbar-icon-button" title="Add a new page" onClick={() => { addPage("New page"); setLeftTab("pages"); }}>
            <Plus size={15} />
          </button>
          <span className="toolbar-divider small-hide" />
          <div className="history-buttons small-hide">
            <button className="toolbar-icon-button" title="Undo" disabled={!undoStack.length} onClick={undo}><Undo2 size={15} /></button>
            <button className="toolbar-icon-button" title="Redo" disabled={!redoStack.length} onClick={redo}><Redo2 size={15} /></button>
          </div>
        </div>

        <div className="toolbar-right">
          {!previewMode ? (
            <div className="device-switcher small-hide">
              {DEVICE_BUTTONS.map(({ device: d, label, Icon }) => (
                <button key={d} className={cx("device-button", device === d && "active")} title={label} aria-label={label} onClick={() => setDevice(d)}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          ) : null}
          <button className="toolbar-icon-button builder-help-button" title="Step-by-step guide" aria-label="Step-by-step guide" onClick={() => setGuideOpen(true)}>
            <CircleHelp size={16} />
          </button>
          <button className={cx("btn-app", "ghost", "toolbar-preview")} onClick={() => setPreviewMode(!previewMode)} title={previewMode ? "Return to editing" : "Hide the editing panels"}>
            {previewMode ? <X size={14} /> : <Eye size={14} />}
            <span>{previewMode ? "Edit" : "Preview"}</span>
          </button>
          <button className="btn-app ghost export-button" onClick={performExport} disabled={exporting} title="Download a static website ZIP">
            <Download size={14} /> <span>{exporting ? "Preparing…" : "Download"}</span>
          </button>
          <button className="btn-app ghost export-button shopify-export-button" onClick={() => void performShopifyExport()} disabled={shopifyExporting} title="Build a native Shopify theme ZIP">
            <ShoppingBag size={14} /> <span>{shopifyExporting ? "Preparing…" : "Shopify"}</span>
          </button>
          <button className="btn-app primary publish-button" onClick={() => setPublishOpen(true)}>
            <Rocket size={14} /> <span>Go live</span>
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragType(null)}
      >
        <main className={cx("builder-main", previewMode && "preview-on")}>
          {!previewMode ? <LeftPanel project={project} /> : null}
          <Canvas project={project} previewMode={previewMode} />
          {!previewMode ? <Inspector project={project} /> : null}
        </main>
        <DragOverlay dropAnimation={null}>
          {dragType ? (
            <div className="drag-overlay-card">
              <span className="drag-overlay-icon">✦</span>
              <span>{BLOCKS[dragType]?.label}</span>
              <span className="drag-overlay-hint">Drop onto your page</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {publishOpen ? (
        <PublishWizard project={project} onClose={() => setPublishOpen(false)} onExport={performExport} onShopifyExport={performShopifyExport} />
      ) : null}
      <BuilderGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onAction={(action: GuideAction) => {
          if (action === "add") setLeftTab("add");
          if (action === "edit") setLeftTab("layers");
          if (action === "theme") setLeftTab("theme");
          if (action === "mobile") { setDevice("mobile"); setPreviewMode(true); }
          if (action === "publish") setPublishOpen(true);
        }}
      />
      {toast ? <div role="status" className="toast">{toast}</div> : null}
    </div>
  );
}
