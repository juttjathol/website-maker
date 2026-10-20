"use client";
import React from "react";
import Link from "next/link";
import type { Block, FieldDef } from "@/lib/schema";
import { MAX_SCENE_OBJECTS, sceneObject, sceneObjects, type Shape3D } from "@/lib/scene-3d";
import { useEditor } from "@/lib/store";
import { FieldRow } from "./Field";

const SCENE_FIELDS: FieldDef[] = [
  { key: "title", label: "Scene title", kind: "text" },
  { key: "description", label: "Subtitle", kind: "text" },
  { key: "background", label: "Background", kind: "color" },
  { key: "height", label: "Stage height (px)", kind: "number", min: 240, max: 800 },
  { key: "perspective", label: "Camera perspective (px)", kind: "number", min: 500, max: 1800, step: 50 },
  { key: "animate", label: "Gentle animation in preview / export", kind: "toggle" },
];
const OBJECT_FIELDS: FieldDef[] = [
  { key: "name", label: "Accessible name", kind: "text" },
  { key: "shape", label: "Shape", kind: "select", options: [
    { value: "cube", label: "Cube" }, { value: "diamond", label: "Diamond cube" }, { value: "panel", label: "Panel" },
  ] },
  { key: "color", label: "Color", kind: "color" },
  { key: "size", label: "Size (px)", kind: "number", min: 24, max: 180 },
  { key: "x", label: "Horizontal position (%)", kind: "number", min: 5, max: 95 },
  { key: "y", label: "Vertical position (%)", kind: "number", min: 5, max: 95 },
  { key: "depth", label: "Depth (px)", kind: "number", min: -200, max: 200 },
  ...["X", "Y", "Z"].map((axis): FieldDef => ({ key: `rotate${axis}`, label: `${axis} rotation (degrees)`, kind: "number", min: -180, max: 180 })),
];

export function Scene3DInspector({ block }: { block: Block }) {
  const plan = useEditor((s) => s.plan);
  const update = useEditor((s) => s.updateProp);
  const selection = useEditor((s) => s.sceneSelection);
  const setActive = (index: number) => useEditor.getState().selectSceneObject(block.id, index);
  const active = selection?.blockId === block.id ? selection.index : 0;
  const objects = sceneObjects(block.props.objects);
  const index = Math.min(active, objects.length - 1);
  const object = objects[index];
  const saveObjects = (value: typeof objects) => update(block.id, "objects", value);
  const add = (shape: Shape3D) => {
    if (objects.length >= MAX_SCENE_OBJECTS) return;
    saveObjects([...objects, sceneObject(shape, objects.length)]);
    setActive(objects.length);
  };
  if (plan !== "pro") return <div className="rounded-xl bg-[#f7f5fd] p-4 text-sm leading-relaxed">
    <strong>3D tools are included in Webloom Pro.</strong>
    <p className="my-2">Your saved scene is kept safe. Upgrade to edit or export it, or delete this block to continue on Free.</p>
    <Link className="btn-app primary" href="/account">Request Pro</Link>
  </div>;
  return <div className="space-y-4">
    <div className="rounded-xl bg-[#f7f5fd] p-3 text-xs leading-relaxed text-[#716b89]">
      Drag objects on the canvas or focus one and use arrow keys. Hold Shift for bigger steps. These lightweight CSS 3D shapes export without external scripts. Custom model uploads are not included.
    </div>
    {SCENE_FIELDS.map((field) => <FieldRow key={field.key} field={field} value={block.props[field.key]} onChange={(v) => update(block.id, field.key, v)} />)}
    <hr className="border-[#e7e4f0]" />
    <h3 className="text-sm font-bold">Objects ({objects.length}/{MAX_SCENE_OBJECTS})</h3>
    <div className="flex flex-wrap gap-2">
      {(["cube", "diamond", "panel"] as Shape3D[]).map((shape) => <button key={shape} type="button" className="btn-app ghost !px-2 !text-xs" disabled={objects.length >= MAX_SCENE_OBJECTS} onClick={() => add(shape)}>+ {shape}</button>)}
    </div>
    {object ? <>
      <label className="inspector-label" htmlFor={`scene-object-${block.id}`}>Edit object</label>
      <select id={`scene-object-${block.id}`} className="inspector-input" value={index} onChange={(e) => setActive(Number(e.target.value))}>
        {objects.map((obj, i) => <option key={i} value={i}>{i + 1}. {obj.name}</option>)}
      </select>
      {OBJECT_FIELDS.map((field) => <FieldRow key={field.key} field={field} value={object[field.key as keyof typeof object]} onChange={(v) => {
        const next = objects.map((obj, i) => i === index ? { ...obj, [field.key]: v } : obj);
        saveObjects(next);
      }} />)}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-app ghost !text-xs" disabled={objects.length >= MAX_SCENE_OBJECTS} onClick={() => {
          saveObjects([...objects, { ...object, name: `${object.name} copy`, x: Math.min(95, object.x + 5) }]); setActive(objects.length);
        }}>Duplicate object</button>
        <button type="button" className="btn-app ghost !text-xs" onClick={() => saveObjects(objects.filter((_, i) => i !== index))}>Delete object</button>
      </div>
    </> : <p className="text-xs text-[#716b89]">Add your first object above.</p>}
  </div>;
}
