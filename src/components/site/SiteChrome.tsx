"use client";
/**
 * SiteChrome — wraps blocks in the .wk-site shell with theme variables.
 * Shared by the editor canvas and the preview route.
 */
import React from "react";
import type { Page, Project } from "@/lib/schema";
import { themeVars, themeFontClass, SITE_JS } from "@/lib/export";
import { SITE_CSS } from "@/lib/site-css";
import { SiteBody } from "./renderers";
import { Watermark } from "./Watermark";

export function SiteStyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: SITE_CSS }} />;
}

export function SiteChrome({
  project,
  children,
  watermark = false,
  plan = "free",
}: {
  project: Project;
  children: React.ReactNode;
  /** Show the free-plan "WEBLOOM by JATHOL" bubble */
  watermark?: boolean;
  plan?: "free" | "pro";
}) {
  return (
    <div
      data-plan={plan}
      className={`wk-site ${themeFontClass(project.theme.font)}`}
      style={themeVars(project.theme)}
    >
      {children}
      {watermark ? <Watermark /> : null}
    </div>
  );
}

/** Full static page renderer used by /preview (includes runtime script) */
export function SiteStaticView({ project, page, watermark = false }: { project: Project; page: Page; watermark?: boolean }) {
  return (
    <>
      <SiteStyleTag />
      <div
        data-plan={watermark ? "free" : "pro"}
        className={`wk-site ${themeFontClass(project.theme.font)}`}
        style={themeVars(project.theme)}
      >
        <SiteBody blocks={page.blocks} mode="static" />
        {watermark ? <Watermark /> : null}
      </div>
      <script dangerouslySetInnerHTML={{ __html: SITE_JS }} />
    </>
  );
}
