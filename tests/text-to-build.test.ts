import assert from "node:assert/strict";
import test from "node:test";
import { newProject, useEditor } from "../src/lib/store";
import { applyPromptToProject, extractBrandName, THEME_PRESETS } from "../src/lib/text-to-build";

test("extractBrandName finds explicit website brand names from natural language prompts", () => {
  assert.equal(
    extractBrandName("Build a cozy coffee shop website called Velvet Roast with menu and contact"),
    "Velvet Roast"
  );
  assert.equal(
    extractBrandName("Create a dark AI SaaS site named PulseFlow AI with pricing"),
    "PulseFlow AI"
  );
});

test("applyPromptToProject builds a tailored website from a natural-language description", () => {
  const initial = newProject("My new website");
  const res = applyPromptToProject(
    initial,
    "Build a cozy coffee shop website called Sweet Crumb with warm espresso colors, menu services, gallery, pricing and FAQ"
  );

  assert.equal(res.project.name, "Sweet Crumb");
  assert.equal(res.project.theme.primary, "#9c4a27");
  const types = res.project.pages[0].blocks.map((b) => b.type);
  assert.ok(types.includes("navbar"));
  assert.ok(types.includes("hero"));
  assert.ok(types.includes("services"));
  assert.ok(types.includes("gallery"));
  assert.ok(types.includes("pricing"));
  assert.ok(types.includes("faq"));
  assert.ok(types.includes("footer"));
  assert.ok(res.reply.includes("Sweet Crumb"));
});

test("applyPromptToProject supports conversational follow-up edits on an existing site", () => {
  const initial = applyPromptToProject(
    newProject("My new website"),
    "Create a SaaS startup website called NovaCloud"
  ).project;

  // Follow-up 1: change theme to Emerald Botanical and add a team section
  const step1 = applyPromptToProject(
    initial,
    "Change the theme to emerald green and add a team section"
  );
  assert.equal(step1.project.theme.primary, "#15803d");
  assert.ok(step1.project.pages[0].blocks.some((b) => b.type === "team"));

  // Follow-up 2: add an About page
  const step2 = applyPromptToProject(step1.project, "Add an About page");
  assert.ok(step2.project.pages.some((p) => p.slug === "about"));
});

test("store supports applyProjectSnapshot, nudgeBlock, and addSectionBundle with undo", () => {
  const start = newProject("Test Site");
  useEditor.getState().loadProject(start);

  const page0 = useEditor.getState().getCurrentPage()!;
  const initialSecondId = page0.blocks[1].id;

  // Nudge block down
  useEditor.getState().nudgeBlock(initialSecondId, 1);
  assert.equal(useEditor.getState().getCurrentPage()!.blocks[2].id, initialSecondId);

  // Add section bundle
  useEditor.getState().addSectionBundle(["pricing", "faq"]);
  const typesAfterBundle = useEditor.getState().getCurrentPage()!.blocks.map((b) => b.type);
  assert.ok(typesAfterBundle.includes("pricing"));
  assert.ok(typesAfterBundle.includes("faq"));

  // Apply theme preset and undo
  useEditor.getState().setTheme(THEME_PRESETS[1].theme);
  assert.equal(useEditor.getState().project?.theme.mode, "dark");
  useEditor.getState().undo();
  assert.equal(useEditor.getState().project?.theme.mode, "light");
});
