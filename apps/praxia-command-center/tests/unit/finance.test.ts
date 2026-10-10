import { describe, it, expect } from "vitest";
import { computeFinanceMetrics, invoiceState, proposalTotals, type FinanceInput } from "@/domain/finance";
import { resolvePeriod } from "@/domain/period";

const today = "2026-10-20";
const base = (): FinanceInput => ({
  contracts: [],
  revenue: [],
  invoices: [],
  payments: [],
  expenses: [],
  rates: [],
  today,
  period: resolvePeriod("mtd", today),
  settings: {
    reportingCurrency: "USD",
    openingCashAmount: null,
    openingCashCurrency: null,
    openingCashDate: null,
    monthlyRevenueTarget: 1_000_000,
    monthlyRevenueTargetCurrency: "USD",
    targetBasis: "recognized",
  },
});

describe("finance metrics", () => {
  it("returns zeros, not invented values, for an empty company", () => {
    const m = computeFinanceMetrics(base());
    expect(m.bookings.value).toBe(0);
    expect(m.recognizedRevenue.value).toBe(0);
    expect(m.collected.value).toBe(0);
    expect(m.mrr.value).toBeNull();
    expect(m.cashBalance.value).toBeNull();
    expect(m.cashBalance.note).toMatch(/not configured/);
    expect(m.grossMargin.value).toBeNull();
    expect(m.revenueTarget.kind).toBe("goal");
  });

  it("counts bookings only with signature evidence", () => {
    const i = base();
    i.contracts = [
      { id: "c1", kind: "project", status: "signed", signedAt: "2026-10-05", signatureEvidence: "DocuSign 123", amount: 1_500_000, currency: "USD", monthlyAmount: null, startDate: null, endDate: null },
      { id: "c2", kind: "project", status: "pending_signature", signedAt: null, signatureEvidence: null, amount: 9_000_000, currency: "USD", monthlyAmount: null, startDate: null, endDate: null },
    ];
    expect(computeFinanceMetrics(i).bookings.value).toBe(1_500_000);
  });

  it("separates recognized, invoiced and collected; computes AR, overdue, margins and cash", () => {
    const i = base();
    i.settings.openingCashAmount = 500_000;
    i.settings.openingCashCurrency = "USD";
    i.settings.openingCashDate = "2026-09-30";
    i.contracts = [{ id: "c1", kind: "retainer", status: "active", signedAt: "2026-10-01", signatureEvidence: "signed pdf", amount: 1_500_000, currency: "USD", monthlyAmount: 500_000, startDate: "2026-10-01", endDate: "2026-12-31" }];
    i.revenue = [{ recognizedOn: "2026-10-15", amount: 500_000, currency: "USD", contractKind: "retainer" }];
    i.invoices = [
      { id: "i1", status: "issued", issueDate: "2026-10-01", dueDate: "2026-10-10", currency: "USD", subtotal: 500_000, total: 580_000, fxRate: 1, reportingCurrency: "USD" },
      { id: "i2", status: "issued", issueDate: "2026-10-15", dueDate: "2026-11-05", currency: "USD", subtotal: 100_000, total: 116_000, fxRate: 1, reportingCurrency: "USD" },
    ];
    i.payments = [{ invoiceId: "i1", receivedOn: "2026-10-12", amount: 300_000, currency: "USD" }];
    i.expenses = [
      { incurredOn: "2026-10-03", amount: 100_000, currency: "USD", costType: "direct", status: "actual", category: "contractors", recurrence: "none" },
      { incurredOn: "2026-10-04", amount: 50_000, currency: "USD", costType: "overhead", status: "actual", category: "ai_api", recurrence: "monthly" },
      { incurredOn: "2026-10-30", amount: 40_000, currency: "USD", costType: "overhead", status: "planned", category: "saas", recurrence: "none" },
    ];
    const m = computeFinanceMetrics(i);
    expect(m.mrr.value).toBe(500_000);
    expect(m.recognizedRevenue.value).toBe(500_000);
    expect(m.recognizedRecurring.value).toBe(500_000);
    expect(m.invoicedSubtotal.value).toBe(600_000);
    expect(m.invoicedTotal.value).toBe(696_000);
    expect(m.collected.value).toBe(300_000);
    expect(m.accountsReceivable.value).toBe(396_000);
    expect(m.overdueReceivables.value).toBe(280_000);
    expect(m.expectedCollections30.value).toBe(116_000);
    expect(m.directCosts.value).toBe(100_000);
    expect(m.operatingExpenses.value).toBe(50_000);
    expect(m.aiCosts.value).toBe(50_000);
    expect(m.grossProfit.value).toBe(400_000);
    expect(m.grossMargin.value).toBeCloseTo(0.8);
    expect(m.operatingProfit.value).toBe(350_000);
    expect(m.cashBalance.value).toBe(500_000 + 300_000 - 150_000);
    expect(m.cashBalance.kind).toBe("estimate");
    // History is 20 days (opening 2026-09-30 → today) → burn measured over the 30-day minimum, not divided by 3 months.
    expect(m.runwayMonths.value).toBeCloseTo(650_000 / (150_000 / (30 / 30.44)), 3);
    expect(m.collectedNet.value).toBe(Math.round(300_000 * 500_000 / 580_000));
    expect(m.plannedExpenses30.value).toBe(40_000);
    expect(m.revenueVsTarget.value).toBeCloseTo(0.5);
  });

  it("counts MRR only for retainers in force with a start date, and last30 as one month of goal", () => {
    const i = base();
    i.contracts = [
      { id: "r1", kind: "retainer", status: "signed", signedAt: "2026-10-01", signatureEvidence: "e", amount: 1_500_000, currency: "USD", monthlyAmount: 500_000, startDate: null, endDate: null },
      { id: "r2", kind: "retainer", status: "terminated", signedAt: "2026-09-01", signatureEvidence: "e", amount: 900_000, currency: "USD", monthlyAmount: 300_000, startDate: "2026-09-01", endDate: null },
    ];
    expect(computeFinanceMetrics(i).mrr.value).toBeNull();
    i.period = resolvePeriod("last30", today);
    expect(computeFinanceMetrics(i).revenueTarget.value).toBe(1_000_000);
  });

  it("flags records it cannot convert instead of dropping them silently", () => {
    const i = base();
    i.payments = [{ invoiceId: "x", receivedOn: "2026-10-10", amount: 1_000_000, currency: "MXN", reportingCurrency: null, reportingAmount: null }];
    const m = computeFinanceMetrics(i);
    expect(m.collected.value).toBe(0);
    expect(m.collected.missingFx).toBe(1);
  });

  it("derives invoice states", () => {
    const inv = { id: "i", status: "issued" as const, issueDate: "2026-10-01", dueDate: "2026-10-10", currency: "USD" as const, subtotal: 100, total: 116, fxRate: 1, reportingCurrency: "USD" };
    expect(invoiceState(inv, [], "2026-10-05").derivedStatus).toBe("issued");
    expect(invoiceState(inv, [{ invoiceId: "i", amount: 16 }], "2026-10-05").derivedStatus).toBe("partially_paid");
    expect(invoiceState(inv, [], "2026-10-15")).toMatchObject({ derivedStatus: "overdue", daysOverdue: 5 });
    expect(invoiceState(inv, [{ invoiceId: "i", amount: 116 }], "2026-10-15").derivedStatus).toBe("paid");
  });

  it("computes proposal margin and price floor", () => {
    const t = proposalTotals([{ quantity: 1, unitPrice: 1_200_000, estimatedCost: 400_000 }, { quantity: 2, unitPrice: 150_000, estimatedCost: 300_000 }], 0.16, 0.5);
    expect(t.subtotal).toBe(1_500_000);
    expect(t.cost).toBe(700_000);
    expect(t.tax).toBe(240_000);
    expect(t.grossMargin).toBeCloseTo(0.5333, 3);
    expect(t.priceFloor).toBe(1_400_000);
    expect(t.meetsMarginTarget).toBe(true);
  });
});
