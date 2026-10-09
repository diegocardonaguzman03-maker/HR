import { attempt, type Result } from "@/server/services/common";
import type { DB } from "@/server/db/client";
import { getRuntime } from "../runtime";
import { nav } from "../router";
import { toast } from "@/lib/ui-store";

/** Same contract as the server runner: rules + audit in the services, then persist to the Artifact database. */
export async function run<T>(fn: (db: DB, actor: "founder") => Promise<T>, _revalidate: string[] = []): Promise<Result<T>> {
  const rt = getRuntime();
  const res = await attempt(() => fn(rt.db, "founder"));
  if (res.ok) {
    const f = await rt.flush();
    if (f.error) toast.bad(`Saved in this view but not to the database: ${f.error}`);
    nav.refresh();
  }
  return res;
}
