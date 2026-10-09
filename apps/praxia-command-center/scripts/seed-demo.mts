/**
 * DEMONSTRATION DATA — fictional companies and people, every row flagged is_demo = true.
 * Demo rows are hidden from all metrics unless demo mode is switched on, and the UI labels them "DEMO".
 * Never use this on a database you intend to report from without understanding that flag.
 */
import { createDatabase, migrateDatabase } from "../src/server/db/client";
import { seedDemo } from "../src/server/seed/demo";

const url = process.env.PRAXIA_DB_URL ?? "file:./data/praxia.db";
const { db } = createDatabase(url, process.env.PRAXIA_DB_AUTH_TOKEN);
await migrateDatabase(db);
const n = await seedDemo(db);
console.log(`Demo dataset loaded (${n} records, all flagged is_demo). Turn on demo mode in the app to see it.`);
