import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: process.env.PRAXIA_DB_URL ?? "file:./data/praxia.db" },
});
