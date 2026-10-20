import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assert3DExportAllowed, bounded, has3DBlocks, MAX_SCENE_OBJECTS, normalizeObject, sceneObject, sceneObjects } from "../src/lib/scene-3d";
import { createBlock } from "../src/lib/tree";
import { newProject, useEditor } from "../src/lib/store";
import { Scene3D } from "../src/components/site/Scene3D";
import { renderPageHtml } from "../src/lib/export";
import { buildShopifyThemeFiles } from "../src/lib/shopify-export";
import { SITE_CSS } from "../src/lib/site-css";

const projectWithScene = () => {
  const p = newProject("3D demo");
  p.pages[0].blocks = [createBlock("section")];
  p.pages[0].blocks[0].children = [createBlock("scene3d")];
  return p;
};

test("3D values are bounded, including malformed imported JSON", () => {
  assert.equal(bounded(Infinity, 0, 10, 5), 5);
  const obj = normalizeObject({ x: -200, y: 300, size: 9999, rotateX: NaN, color: "url(evil)", depth: -999 });
  assert.equal(obj.x, 5); assert.equal(obj.y, 95); assert.equal(obj.size, 180);
  assert.equal(obj.rotateX, -22); assert.equal(obj.color, "#8b5cf6"); assert.equal(obj.depth, -200);
  assert.equal(sceneObjects(Array(40).fill(null)).length, MAX_SCENE_OBJECTS);
  assert.deepEqual(sceneObjects({}), []);
  assert.equal(sceneObject("diamond").rotateZ, 45);
});

test("nested 3D export is blocked on Free and allowed on Pro", () => {
  const p = projectWithScene();
  assert.equal(has3DBlocks(p.pages[0].blocks), true);
  assert.throws(() => assert3DExportAllowed(p, "free"), /need Webloom Pro/);
  assert.doesNotThrow(() => assert3DExportAllowed(p, "pro"));
  assert.doesNotThrow(() => assert3DExportAllowed(newProject("Normal site"), "free"));
});

test("renderer exports six planes, accessible names, safe colors and static animation", () => {
  const block = createBlock("scene3d");
  block.props.objects = [{ ...sceneObject(), name: '<script>bad</script>', color: "red;background:url(evil)" }];
  const html = renderToStaticMarkup(React.createElement(Scene3D, { block, mode: "static" }));
  assert.equal((html.match(/class="wk-3d-face /g) || []).length, 6);
  assert.match(html, /wk-3d-float/); assert.match(html, /role="img"/);
  assert.doesNotMatch(html, /<script>|url\(evil\)|tabindex=/);
  assert.match(html, /&lt;script&gt;/);
  const editHtml = renderToStaticMarkup(React.createElement(Scene3D, { block, mode: "editor" }));
  assert.match(editHtml, /tabindex="0"/); assert.match(editHtml, /wk-3d-still/);
  assert.match(SITE_CSS, /prefers-reduced-motion:reduce/);
  assert.match(SITE_CSS, /data-plan=free/);
});

test("static HTML uses the same geometry without fetching a model or runtime", () => {
  const p = projectWithScene();
  const html = renderPageHtml(p, p.pages[0]);
  assert.match(html, /wk-scene-stage/); assert.match(html, /--obj-distance:0px/);
  assert.match(html, /assets\/site.css/); assert.doesNotMatch(html, /three\.js|\.glb|\.gltf/);
});

test("Shopify exports also enforce Pro for nested scenes", async () => {
  await assert.rejects(buildShopifyThemeFiles(projectWithScene()), /need Webloom Pro/);
});

test("editor gates insertion and editing and keeps undo/redo for Pro", () => {
  useEditor.getState().loadProject(newProject("Editor test"));
  useEditor.getState().setPlan("free");
  const before = useEditor.getState().getCurrentPage()!.blocks.length;
  useEditor.getState().addBlock("scene3d", null, before);
  assert.equal(useEditor.getState().getCurrentPage()!.blocks.length, before);
  useEditor.getState().addBlockTree(createBlock("section", {}), null, before);
  useEditor.getState().setPlan("pro");
  useEditor.getState().addBlock("scene3d", null, before);
  const scene = useEditor.getState().getCurrentPage()!.blocks[before];
  const objects = sceneObjects(scene.props.objects);
  const original = objects[0].x;
  useEditor.getState().updateProp(scene.id, "objects", [{ ...objects[0], x: 70 }, ...objects.slice(1)]);
  assert.equal(useEditor.getState().getCurrentPage()!.blocks[before].props.objects[0].x, 70);
  useEditor.getState().undo();
  assert.equal(useEditor.getState().getCurrentPage()!.blocks[before].props.objects[0].x, original);
  useEditor.getState().redo();
  assert.equal(useEditor.getState().getCurrentPage()!.blocks[before].props.objects[0].x, 70);
  // Each drag uses a distinct history entry even when gestures finish quickly.
  const afterRedo = sceneObjects(useEditor.getState().getCurrentPage()!.blocks[before].props.objects);
  useEditor.getState().updateProp(scene.id, "objects", [{ ...afterRedo[0], x: 75 }, ...afterRedo.slice(1)], "");
  useEditor.getState().updateProp(scene.id, "objects", [{ ...afterRedo[0], x: 80 }, ...afterRedo.slice(1)], "");
  useEditor.getState().undo();
  assert.equal(useEditor.getState().getCurrentPage()!.blocks[before].props.objects[0].x, 75);
  useEditor.getState().selectSceneObject(scene.id, 1);
  assert.deepEqual(useEditor.getState().sceneSelection, { blockId: scene.id, index: 1 });
  useEditor.getState().setPlan("free");
  useEditor.getState().updateProp(scene.id, "title", "Changed");
  assert.notEqual(useEditor.getState().getCurrentPage()!.blocks[before].props.title, "Changed");
  const count = useEditor.getState().getCurrentPage()!.blocks.length;
  useEditor.getState().duplicateBlockById(scene.id);
  assert.equal(useEditor.getState().getCurrentPage()!.blocks.length, count);
  useEditor.getState().removeBlockById(scene.id);
  assert.equal(useEditor.getState().getCurrentPage()!.blocks.length, count - 1);
});
