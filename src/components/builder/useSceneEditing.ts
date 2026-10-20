"use client";
import { useEffect, type RefObject } from "react";
import { useEditor } from "@/lib/store";
import { findBlock } from "@/lib/tree";
import { bounded, sceneObjects } from "@/lib/scene-3d";

/** Delegate object dragging; commit once per gesture so undo restores the whole move. */
export function useSceneEditing(frame: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = frame.current;
    if (!root || !enabled) return;
    type Target = { el: HTMLElement; blockId: string; index: number };
    let drag: (Target & { pointer: number; startX: number; startY: number; x: number; y: number; width: number; height: number; nextX: number; nextY: number }) | null = null;
    const target = (event: Event): Target | null => {
      const el = (event.target as HTMLElement)?.closest<HTMLElement>("[data-scene-object]");
      const scene = el?.closest<HTMLElement>("[data-scene-id]");
      return el && scene ? { el, blockId: scene.dataset.sceneId!, index: Number(el.dataset.sceneObject) } : null;
    };
    const getObjects = (t: Target) => {
      const page = useEditor.getState().getCurrentPage();
      const block = page && findBlock(page.blocks, t.blockId)?.block;
      return block ? sceneObjects(block.props.objects) : [];
    };
    const commit = (t: Target, x: number, y: number) => {
      const objects = getObjects(t);
      if (!objects[t.index]) return;
      objects[t.index] = { ...objects[t.index], x, y };
      useEditor.getState().updateProp(t.blockId, "objects", objects, "");
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || drag) return;
      const t = target(e);
      if (!t) return;
      const obj = getObjects(t)[t.index];
      const rect = t.el.closest(".wk-scene-stage")?.getBoundingClientRect();
      if (!obj || !rect?.width || !rect.height) return;
      e.preventDefault(); e.stopPropagation();
      useEditor.getState().selectSceneObject(t.blockId, t.index);
      t.el.focus({ preventScroll: true });
      t.el.setPointerCapture(e.pointerId);
      drag = { ...t, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, x: obj.x, y: obj.y,
        nextX: obj.x, nextY: obj.y, width: rect.width, height: rect.height };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      e.preventDefault(); e.stopPropagation();
      drag.nextX = bounded(drag.x + (e.clientX - drag.startX) / drag.width * 100, 5, 95, drag.x);
      drag.nextY = bounded(drag.y + (e.clientY - drag.startY) / drag.height * 100, 5, 95, drag.y);
      drag.el.style.left = `${drag.nextX}%`; drag.el.style.top = `${drag.nextY}%`;
    };
    const finish = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      e.stopPropagation();
      const d = drag; drag = null;
      const cancelled = e.type !== "pointerup";
      d.el.style.left = `${cancelled ? d.x : d.nextX}%`; d.el.style.top = `${cancelled ? d.y : d.nextY}%`;
      if (d.el.hasPointerCapture(d.pointer)) d.el.releasePointerCapture(d.pointer);
      if (!cancelled && (d.x !== d.nextX || d.y !== d.nextY)) commit(d, d.nextX, d.nextY);
    };
    const key = (e: KeyboardEvent) => {
      const t = target(e);
      if (!t || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      const obj = getObjects(t)[t.index];
      if (!obj) return;
      e.preventDefault(); e.stopPropagation();
      useEditor.getState().selectSceneObject(t.blockId, t.index);
      const step = e.shiftKey ? 5 : 1;
      commit(t, bounded(obj.x + (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0), 5, 95, obj.x),
        bounded(obj.y + (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0), 5, 95, obj.y));
    };
    root.addEventListener("pointerdown", down, true);
    root.addEventListener("pointermove", move, true);
    root.addEventListener("pointerup", finish, true);
    root.addEventListener("pointercancel", finish, true);
    root.addEventListener("lostpointercapture", finish, true);
    root.addEventListener("keydown", key, true);
    return () => {
      root.removeEventListener("pointerdown", down, true); root.removeEventListener("pointermove", move, true);
      root.removeEventListener("pointerup", finish, true); root.removeEventListener("pointercancel", finish, true);
      root.removeEventListener("lostpointercapture", finish, true); root.removeEventListener("keydown", key, true);
      if (drag) { drag.el.style.left = `${drag.x}%`; drag.el.style.top = `${drag.y}%`; }
    };
  }, [frame, enabled]);
}
