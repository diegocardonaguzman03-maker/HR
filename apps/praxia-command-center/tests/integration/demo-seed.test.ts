import { describe, it, expect } from "vitest";
import { freshDb } from "../helpers";
import { seedDemo } from "@/server/seed/demo";
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
    expect(demo.finance.bookings.value).toBe(1_200_000);
    expect(demo.finance.collected.value).toBe(300_000);
    expect(demo.finance.overdueReceivables.value).toBe(696_000 - 300_000);
    expect(demo.operations.openApprovals).toBe(1);
    expect(demo.sales.weightedPipeline.missingFx).toBe(1); // MXN deal without a rate
    expect(demo.decisions.length).toBeGreaterThan(0);
    expect((await listAgentsWithStatus(db)).every((a) => a.status === "offline")).toBe(true);
  });
});
