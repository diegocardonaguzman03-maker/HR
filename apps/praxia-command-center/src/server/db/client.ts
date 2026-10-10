import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import * as schema from "./schema";

export type DB = LibSQLDatabase<typeof schema>;

export function createDatabase(url: string, authToken?: string): { db: DB; client: Client } {
  const client = createClient({ url, authToken });
  return { db: drizzle(client, { schema }), client };
}

export async function migrateDatabase(db: DB) {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
}

const globalForDb = globalThis as unknown as { __praxiaDb?: DB; __praxiaDbReady?: Promise<void> };

/** Process-wide database (server only). Migrations are applied once on first use. */
export async function getDb(): Promise<DB> {
  if (!globalForDb.__praxiaDb) {
    const { db } = createDatabase(process.env.PRAXIA_DB_URL ?? "file:./data/praxia.db", process.env.PRAXIA_DB_AUTH_TOKEN);
    globalForDb.__praxiaDb = db;
    globalForDb.__praxiaDbReady = migrateDatabase(db);
  }
  await globalForDb.__praxiaDbReady;
  return globalForDb.__praxiaDb;
}
