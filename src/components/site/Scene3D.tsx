import React from "react";
import type { Block, EditorMode } from "@/lib/schema";
import { bounded, sceneObjects } from "@/lib/scene-3d";

/** Pure markup: the same perspective/geometry is used in editor, preview and ZIPs. */
export function Scene3D({ block, mode }: { block: Block; mode: EditorMode }) {
  const p = block.props;
  const objects = sceneObjects(p.objects);
  const faces = ["front", "back", "right", "left", "top", "bottom"];
  return (
    <section className="wk-scene" data-scene-id={block.id} aria-label={String(p.title || "3D scene")}>
      <div className="wk-scene-locked">This 3D scene needs Webloom Pro. Open Account to request an upgrade, or delete this block to export on Free.</div>
      <div className="wk-scene-content" style={{ background: /^#[0-9a-f]{6}$/i.test(p.background) ? p.background : "#100b24" }}>
        <div className="wk-scene-copy"><h2>{p.title}</h2><p>{p.description}</p></div>
        <div className="wk-scene-stage" style={{ height: bounded(p.height, 240, 800, 420), perspective: bounded(p.perspective, 500, 1800, 900) }}>
          {objects.map((obj, i) => {
            const depth = obj.shape === "panel" ? obj.size * 0.12 : obj.size;
            const style = {
              left: `${obj.x}%`, top: `${obj.y}%`, width: obj.size, height: obj.size,
              "--obj-size": `${obj.size}px`, "--obj-half": `${depth / 2}px`, "--obj-depth": `${depth}px`,
              "--obj-color": obj.color, "--obj-x": `${obj.rotateX}deg`, "--obj-y": `${obj.rotateY}deg`,
              "--obj-z": `${obj.rotateZ}deg`, "--obj-distance": `${obj.depth}px`,
            } as React.CSSProperties;
            return (
              <div key={i} className="wk-3d-object" data-scene-object={i} style={style}
                tabIndex={mode === "editor" ? 0 : undefined} role={mode === "editor" ? "button" : "img"}
                aria-label={mode === "editor" ? `${obj.name}. Drag to move, or use arrow keys. Shift moves faster.` : obj.name}>
                <div className={p.animate && mode !== "editor" ? "wk-3d-float" : "wk-3d-still"} style={{ animationDelay: `${i * -1.3}s` }}>
                  <div className="wk-3d-solid" aria-hidden="true">
                    {faces.map((face) => <span key={face} className={`wk-3d-face wk-3d-${face}`} />)}
                  </div>
                </div>
              </div>
            );
          })}
          {!objects.length ? <p className="wk-scene-empty">Add a 3D object from the settings panel.</p> : null}
        </div>
        {mode === "editor" ? <p className="wk-scene-hint">Drag an object to position it · Arrow keys to nudge · Change depth, rotation and color in Content</p> : null}
      </div>
    </section>
  );
}
