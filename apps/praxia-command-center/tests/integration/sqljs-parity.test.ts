/**
 * The published Artifact runs the same services on sql.js (SQLite compiled to WebAssembly).
 * This test re-runs the core revenue lifecycle on that engine to prove parity with libsql.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createBrowserDb } from "../../artifact/sqljs-db";
import { seedBase } from "@/server/seed/base";
import { seedDemo } from "@/server/seed/demo";
import { loadDashboard } from "@/server/services/dashboard";
import { todayIso } from "@/server/services/common";

const migrations = fs.readdirSync(path.join(process.cwd(), "drizzle")).filter((f) => f.endsWith(".sql")).sort().map((f) => fs.readFileSync(path.join(process.cwd(), "drizzle", f), "utf8"));

describe("sql.js engine parity", () => {
  it("runs base seed, the demo lifecycle and the dashboard identically", async () => {
    const { db } = await createBrowserDb(migrations);
    await seedBase(db);
    await seedDemo(db);
    const d = await loadDashboard(db, { includeDemo: true, periodKey: "ytd", today: todayIso() });
    expect(d.finance.bookings.value).toBe(1_200_000);
    expect(d.finance.collected.value).toBe(300_000);
    expect(d.operations.openApprovals).toBe(1);
  });
});
