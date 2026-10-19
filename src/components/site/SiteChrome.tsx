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

export function SiteStyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: SITE_CSS }} />;
}

export function SiteChrome({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`wk-site ${themeFontClass(project.theme.font)}`}
      style={themeVars(project.theme)}
    >
      {children}
    </div>
  );
}

/** Full static page renderer used by /preview (includes runtime script) */
export function SiteStaticView({ project, page }: { project: Project; page: Page }) {
  return (
    <>
      <SiteStyleTag />
      <div
        className={`wk-site ${themeFontClass(project.theme.font)}`}
        style={themeVars(project.theme)}
      >
        <SiteBody blocks={page.blocks} mode="static" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: SITE_JS }} />
    </>
  );
}
