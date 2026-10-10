import "server-only";
import { revalidatePath } from "next/cache";
import { attempt, type Result } from "@/server/services/common";
import { requireFounder } from "@/server/session";
import { getDb } from "@/server/db/client";
import type { DB } from "@/server/db/client";

/** Runs a founder-authorised mutation, converts business-rule errors into results and revalidates pages. */
export async function run<T>(fn: (db: DB, actor: "founder") => Promise<T>, revalidate: string[] = ["/"]): Promise<Result<T>> {
  const res = await attempt(async () => {
    const actor = await requireFounder();
    return fn(await getDb(), actor);
  });
  if (res.ok) for (const p of revalidate) revalidatePath(p, p === "/" ? "layout" : "page");
  return res;
}
