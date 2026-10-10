import { cookies } from "next/headers";
import { getRuntime } from "../runtime";
import { todayIso } from "@/server/services/common";
export const DEMO_COOKIE = "praxia_demo";
export async function getContext() {
  const includeDemo = (await cookies()).get(DEMO_COOKIE)?.value === "1";
  return { db: getRuntime().db, includeDemo, today: todayIso() };
}
