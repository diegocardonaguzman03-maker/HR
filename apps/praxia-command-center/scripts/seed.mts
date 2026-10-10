import { createDatabase, migrateDatabase } from "../src/server/db/client";
import { seedBase } from "../src/server/seed/base";

const url = process.env.PRAXIA_DB_URL ?? "file:./data/praxia.db";
const { db } = createDatabase(url, process.env.PRAXIA_DB_AUTH_TOKEN);
await migrateDatabase(db);
await seedBase(db);
console.log(`Base configuration seeded in ${url} (settings, 12 stages, 7 services, 28 agents). No business data was created.`);
