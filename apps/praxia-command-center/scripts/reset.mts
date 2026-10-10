import fs from "node:fs";
import { createDatabase, migrateDatabase } from "../src/server/db/client";
import { seedBase } from "../src/server/seed/base";

const url = process.env.PRAXIA_DB_URL ?? "file:./data/praxia.db";
if (!url.startsWith("file:")) throw new Error("db:reset only works on local file databases.");
const file = url.replace(/^file:/, "");
for (const f of [file, `${file}-wal`, `${file}-shm`, `${file}-journal`]) if (fs.existsSync(f)) fs.rmSync(f);
fs.mkdirSync(file.split("/").slice(0, -1).join("/") || ".", { recursive: true });
const { db } = createDatabase(url);
await migrateDatabase(db);
await seedBase(db);
console.log(`Reset ${url}: fresh schema + base configuration.`);
