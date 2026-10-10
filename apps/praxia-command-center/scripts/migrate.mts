import { createDatabase, migrateDatabase } from "../src/server/db/client";

const url = process.env.PRAXIA_DB_URL ?? "file:./data/praxia.db";
const { db } = createDatabase(url, process.env.PRAXIA_DB_AUTH_TOKEN);
await migrateDatabase(db);
console.log(`Migrated ${url}`);
