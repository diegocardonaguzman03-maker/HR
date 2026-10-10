import { createDatabase, migrateDatabase, type DB } from "@/server/db/client";
import { seedBase } from "@/server/seed/base";

/** Fresh, fully migrated and base-seeded in-memory database for each test. */
export async function freshDb(): Promise<DB> {
  const { db } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedBase(db);
  return db;
}
