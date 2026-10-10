import { getRuntime } from "../runtime";
export async function getDb() { return getRuntime().db; }
export type { DB } from "@/server/db/client";
