"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, TriangleAlert } from "lucide-react";
import { dbGet, dbPut } from "@/lib/db";
import { newProject, useEditor } from "@/lib/store";
import type { Project } from "@/lib/schema";
import { BuilderWorkbench } from "@/components/builder/BuilderWorkbench";

let bootstrapPromise: Promise<Project> | null = null;
const pendingProjects = new Map<string, Promise<Project>>();

export default function BuilderPage() {
  const loadProject = useEditor((s) => s.loadProject);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let id = params.get("project");
        let found: Project | null = null;

        if (id) {
          const pending = pendingProjects.get(id);
          found = pending ? await pending : await dbGet(id);
          if (!found) {
            setError("We couldn't find that website. It may have been deleted from this browser.");
            return;
          }
        } else {
          const promptParam = params.get("prompt");
          if (!bootstrapPromise || promptParam) {
            const created = newProject("My new website");
            id = created.id;
            const nextParams = new URLSearchParams(window.location.search);
            nextParams.set("project", created.id);
            window.history.replaceState(null, "", `/builder?${nextParams.toString()}`);
            const task = dbPut(created).then(() => created);
            bootstrapPromise = task;
            pendingProjects.set(created.id, task);
          }
          found = await bootstrapPromise;
        }

        if (alive && found) {
          loadProject(found);
          setProject(found);
        }
      } catch (e) {
        console.error("Could not load builder project", e);
        if (alive) setError("Something went wrong while opening your website. Please try again.");
      }
    };
    void load();
    return () => { alive = false; };
  }, [loadProject]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f4fb] p-5">
        <section className="max-w-md rounded-2xl border border-[#e5e1ef] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><TriangleAlert size={24} /></div>
          <h1 className="mt-4 text-xl font-extrabold">Website not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6c668a]">{error}</p>
          <Link href="/projects" className="btn-app primary mt-5"><ArrowLeft size={14} /> Go to My websites</Link>
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f4fb]">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#6c668a]">
          <LoaderCircle size={18} className="animate-spin text-[#6d5ae6]" /> Opening your website…
        </div>
      </main>
    );
  }

  return <BuilderWorkbench project={project} />;
}
