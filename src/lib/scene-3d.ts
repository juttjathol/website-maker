/** Lightweight CSS 3D geometry. No model files, remote scripts or storage uploads. */
import type { Block, Project } from "./schema";

export const MAX_SCENE_OBJECTS = 12;
export type Shape3D = "cube" | "diamond" | "panel";
export interface SceneObject {
  name: string;
  shape: Shape3D;
  color: string;
  x: number;
  y: number;
  depth: number;
  size: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export function bounded(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  return value === "" || value == null || !Number.isFinite(n) ? fallback : Math.min(max, Math.max(min, n));
}
export function sceneObject(shape: Shape3D = "cube", index = 0): SceneObject {
  return { name: `${shape[0].toUpperCase()}${shape.slice(1)} ${index + 1}`, shape,
    color: ["#8b5cf6", "#f59e0b", "#38bdf8"][index % 3],
    x: 35 + (index % 3) * 15, y: 50, depth: 0, size: 90,
    rotateX: -22, rotateY: 32, rotateZ: shape === "diamond" ? 45 : 0 };
}
export function normalizeObject(raw: Partial<SceneObject> | null): SceneObject {
  const obj = raw || {};
  const shape = obj.shape === "diamond" || obj.shape === "panel" ? obj.shape : "cube";
  return {
    name: String(obj.name || shape).slice(0, 100), shape,
    color: /^#[0-9a-f]{6}$/i.test(String(obj.color)) ? String(obj.color) : "#8b5cf6",
    x: bounded(obj.x, 5, 95, 50), y: bounded(obj.y, 5, 95, 50),
    depth: bounded(obj.depth, -200, 200, 0), size: bounded(obj.size, 24, 180, 90),
    rotateX: bounded(obj.rotateX, -180, 180, -22), rotateY: bounded(obj.rotateY, -180, 180, 32),
    rotateZ: bounded(obj.rotateZ, -180, 180, 0),
  };
}
export function sceneObjects(value: unknown): SceneObject[] {
  return Array.isArray(value) ? value.slice(0, MAX_SCENE_OBJECTS).map(normalizeObject) : [];
}
export function has3DBlocks(blocks: Block[]): boolean {
  return blocks.some((b) => b.type === "scene3d" || has3DBlocks(b.children || []));
}
export function assert3DExportAllowed(project: Project, plan: "free" | "pro") {
  if (plan !== "pro" && project.pages.some((p) => has3DBlocks(p.blocks))) {
    throw new Error("3D scenes need Webloom Pro. Request Pro from Account, or remove the 3D scenes before exporting.");
  }
}
