import assert from "node:assert/strict";
import test from "node:test";
import { newProject, useEditor } from "../src/lib/store";
import { applyPromptToProject, extractBrandName, THEME_PRESETS } from "../src/lib/text-to-build";
import { buildProjectFromReferenceAnalysis, type ImageAnalysisProfile } from "../src/lib/image-to-website";
import { CREATE_WEBSITE_COST, DOWNLOAD_WEBSITE_COST, FREE_STARTER_CREDITS } from "../src/lib/credits";

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

test("buildProjectFromReferenceAnalysis clones reference website palette, dark mode, hero layout, and cropped slices", () => {
  const start = newProject("My new website");
  const mockAnalysis: ImageAnalysisProfile = {
    width: 1440,
    height: 2400,
    aspectRatio: 0.6,
    mode: "dark",
    backgroundHex: "#0b0a14",
    surfaceHex: "#151326",
    textHex: "#f4f3ff",
    mutedHex: "#a39ec4",
    primaryHex: "#8b5cf6",
    accentHex: "#06b6d4",
    heroVariant: "split",
    navDark: true,
    isTallFullPage: true,
    fontStyle: "modern",
    radius: 14,
    heroCropDataUrl: "data:image/jpeg;base64,MOCK_HERO",
    secondaryCropDataUrl: "data:image/jpeg;base64,MOCK_MID",
    galleryCrops: ["data:image/jpeg;base64,MOCK_HERO", "data:image/jpeg;base64,MOCK_MID", "data:image/jpeg;base64,MOCK_LOW"],
    detectedBands: ["Dark Header", "Split Hero", "Feature Grid", "Gallery"],
  };

  const res = buildProjectFromReferenceAnalysis(
    start,
    mockAnalysis,
    "Create a SaaS website called HyperPulse from this reference screenshot",
    "pro"
  );

  assert.equal(res.project.name, "HyperPulse");
  assert.equal(res.project.theme.mode, "dark");
  assert.equal(res.project.theme.primary, "#8b5cf6");
  assert.equal(res.project.theme.background, "#0b0a14");
  const hero = res.project.pages[0].blocks.find((b) => b.type === "hero");
  assert.ok(hero);
  assert.equal(hero.props.image, "data:image/jpeg;base64,MOCK_HERO");
  assert.ok(res.project.pages[0].blocks.some((b) => b.type === "gallery"));
});

test("credits constants follow 30 starter credits, 30 per website, and 10 per download", () => {
  assert.equal(FREE_STARTER_CREDITS, 30);
  assert.equal(CREATE_WEBSITE_COST, 30);
  assert.equal(DOWNLOAD_WEBSITE_COST, 10);
});

