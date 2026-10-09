import initSqlJs, { type Database } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "@/server/db/schema";
import type { DB } from "@/server/db/client";

/** Runs the migration SQL (drizzle-kit output) on a sql.js database. */
export function applyMigrations(sqlite: Database, migrations: string[]) {
  for (const m of migrations) for (const stmt of m.split("--> statement-breakpoint")) if (stmt.trim()) sqlite.run(stmt);
}

export async function createBrowserDb(migrations: string[], wasmBinary?: ArrayBuffer) {
  const SQL = await initSqlJs(wasmBinary ? { wasmBinary } : undefined);
  const sqlite = new SQL.Database();
  sqlite.run("PRAGMA foreign_keys = ON;");
  applyMigrations(sqlite, migrations);
  const db = drizzle(sqlite, { schema }) as unknown as DB;
  return { db, sqlite };
}
