import { describe, it, expect } from "vitest";
import { formatMoney, parseMoneyInput } from "@/domain/money";
import { buildSnapshot, findRate, reportedValue, sumReported, type FxRate } from "@/domain/fx";

const rates: FxRate[] = [
  { base: "USD", quote: "MXN", rate: 18.0, source: "test A", rateDate: "2026-09-01" },
  { base: "USD", quote: "MXN", rate: 19.0, source: "test B", rateDate: "2026-10-01" },
];

describe("money", () => {
  it("parses user input into minor units", () => {
    expect(parseMoneyInput("12,500")).toBe(1_250_000);
    expect(parseMoneyInput("$ 1,000.5")).toBe(100_050);
    expect(parseMoneyInput("0.07")).toBe(7);
    expect(parseMoneyInput("abc")).toBeNull();
    expect(parseMoneyInput("1.234")).toBeNull();
  });
  it("formats with explicit currency code", () => {
    expect(formatMoney(1_250_000, "USD")).toBe("USD 12,500.00");
    expect(formatMoney(null, "MXN")).toBe("—");
  });
});

describe("fx", () => {
  it("uses the latest rate on or before the date, never a future one", () => {
    expect(findRate(rates, "USD", "MXN", "2026-09-15")?.rate).toBe(18);
    expect(findRate(rates, "USD", "MXN", "2026-10-05")?.rate).toBe(19);
    expect(findRate(rates, "USD", "MXN", "2026-08-01")).toBeNull();
  });
  it("inverts pairs when needed", () => {
    const r = findRate(rates, "MXN", "USD", "2026-10-05")!;
    expect(r.rate).toBeCloseTo(1 / 19);
    expect(r.source).toContain("inverse");
  });
  it("builds snapshots and keeps the original amount", () => {
    const snap = buildSnapshot(rates, 1_900_000, "MXN", "2026-10-02", "USD")!;
    expect(snap.reportingAmount).toBe(100_000);
    expect(snap.fxSource).toContain("test B");
  });
  it("reports missing FX instead of assuming zero", () => {
    const recs = [
      { amount: 100, currency: "USD" as const },
      { amount: 500, currency: "MXN" as const, reportingCurrency: null, reportingAmount: null },
    ];
    expect(reportedValue(recs[1]!, "USD")).toBeNull();
    expect(sumReported(recs, "USD")).toEqual({ total: 100, missingFx: 1 });
  });
});
