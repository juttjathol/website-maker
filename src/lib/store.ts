"use client";
/**
 * Editor store (zustand) — current project + selection + history + autosave.
 */
import { create } from "zustand";
import type { Block, BlockType, Device, Page, Project, Seo, Theme } from "./schema";
import {
  createBlock, findBlock, insertBlock, removeBlock, setPropPath, syncColumns,
} from "./tree";
import { clone, uid } from "./util";
import { has3DBlocks } from "./scene-3d";
import { dbPut } from "./db";

const HISTORY_LIMIT = 60;

export type SaveState = "saved" | "saving" | "unsaved" | "idle" | "local" | "sync-error" | "quota";

interface EditorState {
  plan: "free" | "pro";
  setPlan: (plan: "free" | "pro") => void;
  project: Project | null;
  currentPageId: string | null;
  selectedId: string | null;
  sceneSelection: { blockId: string; index: number } | null;
  selectSceneObject: (blockId: string, index: number) => void;
  hoveredId: string | null;
  device: Device;
  previewMode: boolean;
  saveState: SaveState;
  undoStack: string[];
  redoStack: string[];
  leftTab: "add" | "layers" | "pages" | "theme";

  /* lifecycle */
  loadProject: (p: Project | null) => void;
  getCurrentPage: () => Page | null;

  /* history */
  commit: (label?: string) => void;
  undo: () => void;
  redo: () => void;

  /* blocks */
  addBlock: (type: BlockType, parentId: string | null, index: number) => void;
  addBlockTree: (block: Block, parentId: string | null, index: number) => void;
  removeBlockById: (id: string) => void;
  duplicateBlockById: (id: string) => void;
    moveBlock: (id: string, newParentId: string | null, index: number, history?: boolean) => void;
  updateProp: (id: string, path: string, value: any, historyGroup?: string) => void;
  updateStyle: (id: string, patch: Record<string, any>) => void;

  /* pages */
  addPage: (name: string) => void;
  removePage: (id: string) => void;
  updatePage: (id: string, patch: Partial<Page>) => void;
  setCurrentPage: (id: string) => void;

  /* project */
  renameProject: (name: string) => void;
  setTheme: (patch: Partial<Theme>) => void;
  setSeo: (patch: Partial<Seo>) => void;

  /* ui */
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setDevice: (d: Device) => void;
  setPreviewMode: (on: boolean) => void;
  setLeftTab: (t: EditorState["leftTab"]) => void;
  setSaveState: (s: SaveState) => void;
}

function withPage(project: Project, pageId: string | null, fn: (page: Page) => void): Project {
  const p = clone(project);
  const page = p.pages.find((x) => x.id === pageId) || p.pages[0];
  if (page) fn(page);
  p.updatedAt = Date.now();
  return p;
}

function uniquePageSlug(pages: Page[], pageId: string, value: string): string {
  const pageIndex = pages.findIndex((page) => page.id === pageId);
  if (pageIndex === 0) return "index";
  const fallback = `page-${pageIndex >= 0 ? pageIndex + 1 : pages.length + 1}`;
  const normalised = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const base = !normalised || normalised === "index" ? fallback : normalised;
  let candidate = base;
  let suffix = 2;
  while (pages.some((page) => page.id !== pageId && page.slug === candidate)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastHistoryGroup = "";
let lastHistoryAt = 0;

export const useEditor = create<EditorState>((set, get) => {
  const scheduleSave = (project: Project) => {
    set({ saveState: "unsaved" });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      set({ saveState: "saving" });
      try {
        const result = await dbPut(project);
        set({
          saveState: result === "cloud" ? "saved" : result === "offline" ? "sync-error" : result === "quota" ? "quota" : "local",
        });
      } catch {
        set({ saveState: "unsaved" });
      }
    }, 600);
  };

  const mutate = (fn: (p: Project) => Project, history = true, group = "") => {
    const { project } = get();
    if (!project) return;
    let next = clone(project);
    next = fn(next);
    if (history) {
      const now = Date.now();
      const coalesce = !!group && group === lastHistoryGroup && now - lastHistoryAt < 800;
      let undoStack = get().undoStack;
      if (!coalesce) undoStack = [...undoStack, JSON.stringify(project)].slice(-HISTORY_LIMIT);
      lastHistoryGroup = group;
      lastHistoryAt = now;
      set({ project: next, undoStack, redoStack: [], saveState: "unsaved" });
    } else {
      lastHistoryGroup = "";
      set({ project: next, saveState: "unsaved" });
    }
    scheduleSave(next);
  };

  return {
    plan: "free",
    setPlan: (plan) => set({ plan }),
    project: null,
    currentPageId: null,
    sceneSelection: null,
    selectSceneObject: (blockId, index) => set({ selectedId: blockId, sceneSelection: { blockId, index } }),
    selectedId: null,
    hoveredId: null,
    device: "desktop",
    previewMode: false,
    saveState: "idle",
    undoStack: [],
    redoStack: [],
    leftTab: "add",

    loadProject: (p) => {
      set({
        project: p,
        currentPageId: p?.pages[0]?.id ?? null,
        sceneSelection: null,
        selectedId: null,
        hoveredId: null,
        undoStack: [],
        redoStack: [],
        // The loader doesn't know whether a project came from browser storage or Supabase;
        // show neutral status until the next write confirms its destination.
        saveState: "idle",
      });
    },

    getCurrentPage: () => {
      const { project, currentPageId } = get();
      if (!project) return null;
      return project.pages.find((p) => p.id === currentPageId) || project.pages[0] || null;
    },

    commit: () => {
      const { project, undoStack } = get();
      if (!project) return;
      lastHistoryGroup = "";
      set({ undoStack: [...undoStack, JSON.stringify(project)].slice(-HISTORY_LIMIT), redoStack: [] });
    },

    undo: () => {
      const { project, undoStack, redoStack } = get();
      if (!project || !undoStack.length) return;
      const restored = JSON.parse(undoStack[undoStack.length - 1]) as Project;
      const nextUndo = undoStack.slice(0, -1);
      const nextRedo = [...redoStack, JSON.stringify(project)].slice(-HISTORY_LIMIT);
      lastHistoryGroup = "";
      set({ project: restored, undoStack: nextUndo, redoStack: nextRedo, saveState: "unsaved" });
      scheduleSave(restored);
    },

    redo: () => {
      const { project, undoStack, redoStack } = get();
      if (!project || !redoStack.length) return;
      const restored = JSON.parse(redoStack[redoStack.length - 1]) as Project;
      const nextRedo = redoStack.slice(0, -1);
      const nextUndo = [...undoStack, JSON.stringify(project)].slice(-HISTORY_LIMIT);
      lastHistoryGroup = "";
      set({ project: restored, undoStack: nextUndo, redoStack: nextRedo, saveState: "unsaved" });
      scheduleSave(restored);
    },

    addBlock: (type, parentId, index) => {
      const block = createBlock(type);
      get().addBlockTree(block, parentId, index);
    },

    addBlockTree: (block, parentId, index) => {
      if (get().plan !== "pro" && has3DBlocks([block])) return;
      mutate((p) =>
        withPage(p, get().currentPageId, (page) => {
          insertBlock(page.blocks, block, parentId, index);
        })
      );
      set({ selectedId: block.id });
    },

    removeBlockById: (id) => {
      const { selectedId } = get();
      mutate((p) =>
        withPage(p, get().currentPageId, (page) => {
          removeBlock(page.blocks, id);
        })
      );
      if (selectedId === id) set({ selectedId: null });
    },

    duplicateBlockById: (id) => {
      const source = get().getCurrentPage()?.blocks || [];
      const block = findBlock(source, id)?.block;
      if (get().plan !== "pro" && block && has3DBlocks([block])) return;
      mutate((p) =>
        withPage(p, get().currentPageId, (page) => {
          const loc = findBlock(page.blocks, id);
          if (!loc) return;
          const copy = clone(loc.block);
          const reid = (b: Block) => {
            b.id = uid();
            b.children?.forEach(reid);
          };
          reid(copy);
          loc.list.splice(loc.index + 1, 0, copy);
        })
      );
    },

    moveBlock: (id, newParentId, index, history = true) => {
      mutate(
        (p) =>
          withPage(p, get().currentPageId, (page) => {
            const loc = findBlock(page.blocks, id);
            if (!loc) return;
            // disallow moving a container into itself/descendant
            const target: Block | null = newParentId
              ? findBlock(page.blocks, newParentId)?.block ?? null
              : null;
            const isDescendant = (root: Block, pid: string): boolean => {
              if (root.id === pid) return true;
              return (root.children || []).some((c) => isDescendant(c, pid));
            };
            if (target && isDescendant(loc.block, target.id)) return;

            const removed = removeBlock(page.blocks, id);
            if (!removed) return;
            insertBlock(page.blocks, removed, newParentId, index);
          }),
        history
      );
    },

    updateProp: (id, path, value, historyGroup) => {
      const block = findBlock(get().getCurrentPage()?.blocks || [], id)?.block;
      if (block?.type === "scene3d" && get().plan !== "pro") return;
      mutate(
        (p) =>
          withPage(p, get().currentPageId, (page) => {
            const loc = findBlock(page.blocks, id);
            if (!loc) return;
            setPropPath(loc.block.props, path, value);
            if (path === "cols") syncColumns(loc.block);
          }),
        true,
        historyGroup ?? `prop:${id}:${path}`
      );
    },

    updateStyle: (id, patch) => {
      const block = findBlock(get().getCurrentPage()?.blocks || [], id)?.block;
      if (block?.type === "scene3d" && get().plan !== "pro") return;
      mutate(
        (p) =>
          withPage(p, get().currentPageId, (page) => {
            const loc = findBlock(page.blocks, id);
            if (!loc) return;
            Object.assign(loc.block.style, patch);
          }),
        true,
        `style:${id}:${Object.keys(patch).sort().join(",")}`
      );
    },

    addPage: (name) => {
      const pageId = uid("p");
      const page: Page = {
        id: pageId,
        name,
        slug: uniquePageSlug(get().project?.pages || [], pageId, name),
        seo: { title: name, description: "" },
        blocks: [
          createBlock("navbar"),
          createBlock("hero"),
          createBlock("footer"),
        ],
      };
      mutate((p) => {
        p.pages.push(page);
        return p;
      });
      set({ currentPageId: page.id });
    },

    removePage: (id) => {
      const { project, currentPageId } = get();
      if (!project || project.pages.length <= 1) return;
      mutate((p) => {
        p.pages = p.pages.filter((x) => x.id !== id);
        return p;
      });
      if (currentPageId === id) {
        const remaining = get().project?.pages;
        set({ currentPageId: remaining?.[0]?.id ?? null });
      }
    },

    updatePage: (id, patch) => {
      mutate((p) => {
        const page = p.pages.find((x) => x.id === id);
        if (page) {
          const nextPatch = { ...patch };
          if (typeof patch.slug === "string") nextPatch.slug = uniquePageSlug(p.pages, id, patch.slug);
          Object.assign(page, nextPatch);
        }
        return p;
      }, true, `page:${id}:${Object.keys(patch).sort().join(",")}`);
    },

    setCurrentPage: (id) => set({ currentPageId: id, selectedId: null }),

    renameProject: (name) =>
      mutate((p) => {
        p.name = name;
        return p;
      }, true, "project-name"),

    setTheme: (patch) =>
      mutate((p) => {
        Object.assign(p.theme, patch);
        return p;
      }, true, `theme:${Object.keys(patch).sort().join(",")}`),

    setSeo: (patch) =>
      mutate((p) => {
        Object.assign(p.seo, patch);
        return p;
      }, true, `seo:${Object.keys(patch).sort().join(",")}`),

    select: (id) => set({ selectedId: id }),
    hover: (id) => set({ hoveredId: id }),
    setDevice: (device) => set({ device }),
    setPreviewMode: (previewMode) => set({ previewMode }),
    setLeftTab: (leftTab) => set({ leftTab }),
    setSaveState: (saveState) => set({ saveState }),
  };
});

/** Standalone helpers for project creation outside the editor store */
export function newProject(name: string): Project {
  const now = Date.now();
  return {
    id: uid("pr"),
    name,
    theme: {
      mode: "light",
      primary: "#6d5ae6",
      background: "#ffffff",
      text: "#161224",
      muted: "#5c5675",
      surface: "#f4f2fb",
      accent: "#e8622c",
      font: "modern",
      radius: 14,
    },
    seo: { title: name, description: "A website made with Webloom." },
    pages: [
      {
        id: uid("p"),
        name: "Home",
        slug: "index",
        seo: { title: name, description: "A website made with Webloom." },
        blocks: [
          createBlock("navbar"),
          createBlock("hero"),
          createBlock("features"),
          createBlock("cta"),
          createBlock("footer"),
        ],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
