"use client";

import { getSupabaseBrowserClient } from "./client";

type EdgePayload = Record<string, unknown>;

async function edgeFunctionError(error: unknown): Promise<Error> {
  let message = error instanceof Error ? error.message : "The Supabase account service could not complete the request.";
  const context = error && typeof error === "object" && "context" in error
    ? (error as { context?: unknown }).context
    : null;
  if (context instanceof Response) {
    try {
      const payload = await context.clone().json() as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // Preserve the generic SDK message if the function returned non-JSON.
    }
  }
  return new Error(message);
}

export async function callWebloomAdminFunction<T = EdgePayload>(body: EdgePayload): Promise<T> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase account service is not connected.");
  const { data, error } = await client.functions.invoke("webloom-admin-users", { body });
  if (error) throw await edgeFunctionError(error);
  return data as T;
}
