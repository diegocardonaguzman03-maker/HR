import { describe, it, expect } from "vitest";
import { freshDb } from "../helpers";
import { DEMO_BOOKINGS, seedDemo } from "@/server/seed/demo";
import { loadDashboard } from "@/server/services/dashboard";
import { listAgentsWithStatus } from "@/server/services/agents";
import { todayIso } from "@/server/services/common";

describe("demo dataset", () => {
  it("is fully flagged, idempotent, invisible by default and never fakes agent work", async () => {
    const db = await freshDb();
    expect(await seedDemo(db)).toBeGreaterThan(10);
    expect(await seedDemo(db)).toBe(0);
    const real = await loadDashboard(db, { includeDemo: false, periodKey: "ytd", today: todayIso() });
    expect(real.finance.bookings.value).toBe(0);
    expect(real.sales.activeOpportunities).toBe(0);
    expect(real.operations.openApprovals).toBe(0);
    const demo = await loadDashboard(db, { includeDemo: true, periodKey: "ytd", today: todayIso() });
    // Simulation requested by the founder: 3 client accounts, USD 4.3M in signed contracts.
    expect(demo.finance.bookings.value).toBe(DEMO_BOOKINGS);
    expect(DEMO_BOOKINGS).toBe(430_000_000);
    expect(demo.operations.activeClients).toBe(3);
    expect(demo.sales.wonCount).toBe(5);
    expect(demo.finance.recognizedRevenue.value).toBe(160_000_000);
    expect(demo.finance.collectedNet.value).toBe(97_000_000);
    expect(demo.finance.overdueReceivables.value).toBe(9_000_000); // Nexa month-2 invoice
    expect(demo.finance.mrr.value).toBe(9_000_000); // the 90k/month retainer
    expect(demo.operations.openApprovals).toBe(1); // phase-2 pricing waits for the founder
    expect(demo.decisions.length).toBeGreaterThan(0);
    expect((await listAgentsWithStatus(db)).every((a) => a.status === "offline")).toBe(true);
    const { auditLog } = await import("@/server/db/schema");
    const entries = await db.select().from(auditLog);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.isDemo && e.actor === "system:demo-seed")).toBe(true);
  });
});
