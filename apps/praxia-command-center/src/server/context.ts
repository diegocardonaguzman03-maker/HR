import "server-only";
import { cookies } from "next/headers";
import { getDb } from "./db/client";
import { todayIso } from "./services/common";

export const DEMO_COOKIE = "praxia_demo";

/** Request context for server components: database, demo mode and the business date. */
export async function getContext() {
  const db = await getDb();
  const includeDemo = (await cookies()).get(DEMO_COOKIE)?.value === "1";
  return { db, includeDemo, today: todayIso() };
}
