/**
 * Financial metrics engine. Pure functions over already-loaded records.
 *
 * Definitions (documented in docs/FINANCIAL_DEFINITIONS.md):
 * - Bookings / contracted revenue: total value of contracts SIGNED in the period (signature date + evidence required).
 * - MRR: monthly amount of retainer contracts that are signed/active and in force today.
 * - Recognized revenue: revenue entries recognized in the period (milestone delivered, retainer month served, manual).
 * - Invoiced: issued (non-void) invoices dated in the period — subtotal (pre-tax) and total (incl. tax).
 * - Collected: payments received in the period (cash, incl. tax).
 * - Accounts receivable: open balance of issued invoices as of today; overdue if past due date.
 * - Direct costs: actual expenses typed "direct". Operating expenses: actual expenses typed "overhead".
 * - Gross profit = recognized revenue − direct costs. Operating profit = gross profit − operating expenses.
 * - Cash balance: founder-declared opening cash + collections − actual expenses since the opening date
 *   (assumes expenses are paid when incurred; Phase 1 does not track payables separately).
 * - Runway: cash balance ÷ average monthly actual expenses over the last 3 months.
 */
import type { Currency } from "@/server/db/schema";
import { type FxRate, findRate, convertMinor, sumReported, type Reportable } from "./fx";
import { type Period, inPeriod, addDays, monthsInPeriod } from "./period";

export type MetricKind = "actual" | "forecast" | "estimate" | "goal";
export type Metric = { value: number | null; kind: MetricKind; missingFx: number; note?: string };

export type ContractRec = Reportable & {
  id: string;
  kind: "project" | "retainer";
  status: string;
  signedAt: string | null;
  signatureEvidence: string | null;
  monthlyAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  fxRate?: number | null;
};
export type RevenueRec = Reportable & { recognizedOn: string; contractKind: "project" | "retainer" };
export type InvoiceRec = {
  id: string;
  status: "draft" | "issued" | "void";
  issueDate: string;
  dueDate: string;
  currency: Currency;
  subtotal: number;
  total: number;
  fxRate: number | null;
  reportingCurrency: string | null;
};
export type PaymentRec = Reportable & { invoiceId: string; receivedOn: string };
export type ExpenseRec = Reportable & {
  incurredOn: string;
  costType: "direct" | "overhead";
  status: "actual" | "planned";
  category: string;
  recurrence: "none" | "monthly" | "annual";
};
export type FinanceSettings = {
  reportingCurrency: Currency;
  openingCashAmount: number | null;
  openingCashCurrency: Currency | null;
  openingCashDate: string | null;
  monthlyRevenueTarget: number;
  monthlyRevenueTargetCurrency: Currency;
  targetBasis: "recognized" | "collected" | "contracted";
};

export type FinanceInput = {
  contracts: ContractRec[];
  revenue: RevenueRec[];
  invoices: InvoiceRec[];
  payments: PaymentRec[];
  expenses: ExpenseRec[];
  settings: FinanceSettings;
  rates: FxRate[];
  period: Period;
  today: string;
};

const isBooked = (c: ContractRec) => !!c.signedAt && !!c.signatureEvidence && ["signed", "active", "completed"].includes(c.status);

/** Converts an amount in a record's own currency using the record's stored rate (for derived values like balances). */
function convertWithRecordRate(amount: number, currency: Currency, fxRate: number | null | undefined, recReporting: string | null | undefined, reporting: Currency): number | null {
  if (currency === reporting) return amount;
  if (recReporting === reporting && fxRate) return convertMinor(amount, fxRate);
  return null;
}

export type InvoiceState = {
  id: string;
  paid: number;
  balance: number;
  derivedStatus: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "void";
  daysOverdue: number;
};

/** Derives invoice payment state from its payments (same-currency payments only; cross-currency payments are rejected at entry). */
export function invoiceState(inv: InvoiceRec, payments: { invoiceId: string; amount: number }[], today: string): InvoiceState {
  const paid = payments.filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(inv.total - paid, 0);
  let derivedStatus: InvoiceState["derivedStatus"];
  if (inv.status === "void") derivedStatus = "void";
  else if (inv.status === "draft") derivedStatus = "draft";
  else if (balance === 0) derivedStatus = "paid";
  else if (inv.dueDate < today) derivedStatus = "overdue";
  else if (paid > 0) derivedStatus = "partially_paid";
  else derivedStatus = "issued";
  const daysOverdue = derivedStatus === "overdue" ? Math.round((Date.parse(today) - Date.parse(inv.dueDate)) / 86_400_000) : 0;
  return { id: inv.id, paid, balance, derivedStatus, daysOverdue };
}

export type FinanceMetrics = {
  reportingCurrency: Currency;
  bookings: Metric;
  totalContracted: Metric;
  mrr: Metric;
  recognizedRevenue: Metric;
  recognizedRecurring: Metric;
  recognizedProject: Metric;
  invoicedSubtotal: Metric;
  invoicedTotal: Metric;
  collected: Metric;
  accountsReceivable: Metric;
  overdueReceivables: Metric;
  directCosts: Metric;
  operatingExpenses: Metric;
  aiCosts: Metric;
  grossProfit: Metric;
  grossMargin: Metric;
  operatingProfit: Metric;
  cashBalance: Metric;
  runwayMonths: Metric;
  revenueTarget: Metric;
  revenueVsTarget: Metric;
  expectedCollections30: Metric;
  plannedExpenses30: Metric;
  invoiceStates: InvoiceState[];
};

export function computeFinanceMetrics(input: FinanceInput): FinanceMetrics {
  const { settings, period, today, rates } = input;
  const R = settings.reportingCurrency;

  // Bookings
  const booked = input.contracts.filter(isBooked);
  const bookingsP = sumReported(booked.filter((c) => inPeriod(c.signedAt, period)), R);
  const bookingsAll = sumReported(booked, R);

  // MRR (retainers in force today)
  const retainers = booked.filter(
    (c) => c.kind === "retainer" && c.monthlyAmount && (!c.startDate || c.startDate <= today) && (!c.endDate || c.endDate >= today) && c.status !== "completed",
  );
  const mrr = sumReported(
    retainers.map((c) => ({
      amount: c.monthlyAmount!,
      currency: c.currency,
      reportingCurrency: c.reportingCurrency,
      reportingAmount: c.fxRate && c.reportingCurrency === R ? convertMinor(c.monthlyAmount!, c.fxRate) : null,
    })),
    R,
  );

  // Recognized revenue
  const revP = input.revenue.filter((r) => inPeriod(r.recognizedOn, period));
  const recognized = sumReported(revP, R);
  const recognizedRecurring = sumReported(revP.filter((r) => r.contractKind === "retainer"), R);
  const recognizedProject = sumReported(revP.filter((r) => r.contractKind === "project"), R);

  // Invoicing
  const issued = input.invoices.filter((i) => i.status === "issued");
  const issuedP = issued.filter((i) => inPeriod(i.issueDate, period));
  let invSub = 0, invTot = 0, invMissing = 0;
  for (const i of issuedP) {
    const s = convertWithRecordRate(i.subtotal, i.currency, i.fxRate, i.reportingCurrency, R);
    const t = convertWithRecordRate(i.total, i.currency, i.fxRate, i.reportingCurrency, R);
    if (s === null || t === null) invMissing++;
    else { invSub += s; invTot += t; }
  }

  // Collections
  const collected = sumReported(input.payments.filter((p) => inPeriod(p.receivedOn, period)), R);

  // Receivables
  const invoiceStates = input.invoices.map((i) => invoiceState(i, input.payments, today));
  let ar = 0, arMissing = 0, overdue = 0, overdueMissing = 0, exp30 = 0, exp30Missing = 0;
  const in30 = addDays(today, 30);
  for (const st of invoiceStates) {
    const inv = input.invoices.find((i) => i.id === st.id)!;
    if (inv.status !== "issued" || st.balance === 0) continue;
    const v = convertWithRecordRate(st.balance, inv.currency, inv.fxRate, inv.reportingCurrency, R);
    if (v === null) {
      arMissing++;
      if (st.derivedStatus === "overdue") overdueMissing++;
      else if (inv.dueDate <= in30) exp30Missing++;
      continue;
    }
    ar += v;
    if (st.derivedStatus === "overdue") overdue += v;
    else if (inv.dueDate <= in30) exp30 += v;
  }

  // Expenses
  const actual = input.expenses.filter((e) => e.status === "actual");
  const actualP = actual.filter((e) => inPeriod(e.incurredOn, period));
  const direct = sumReported(actualP.filter((e) => e.costType === "direct"), R);
  const overhead = sumReported(actualP.filter((e) => e.costType === "overhead"), R);
  const ai = sumReported(actualP.filter((e) => e.category === "ai_api"), R);

  const gp = recognized.total - direct.total;
  const op = gp - overhead.total;
  const fxGap = recognized.missingFx + direct.missingFx;

  // Cash
  let cash: Metric;
  let runway: Metric;
  if (settings.openingCashAmount === null || !settings.openingCashDate || !settings.openingCashCurrency) {
    cash = { value: null, kind: "actual", missingFx: 0, note: "Opening cash balance not configured (Settings → Finance)." };
    runway = { value: null, kind: "estimate", missingFx: 0, note: "Requires opening cash balance." };
  } else {
    const since = settings.openingCashDate;
    const openR = settings.openingCashCurrency === R ? settings.openingCashAmount : (() => {
      const r = findRate(rates, settings.openingCashCurrency!, R, since);
      return r ? convertMinor(settings.openingCashAmount!, r.rate) : null;
    })();
    const inflow = sumReported(input.payments.filter((p) => p.receivedOn > since && p.receivedOn <= today), R);
    const outflow = sumReported(actual.filter((e) => e.incurredOn > since && e.incurredOn <= today), R);
    const missing = inflow.missingFx + outflow.missingFx + (openR === null ? 1 : 0);
    const balance = openR === null ? null : openR + inflow.total - outflow.total;
    cash = { value: balance, kind: "actual", missingFx: missing, note: "Opening balance + collections − actual expenses (expenses assumed paid when incurred)." };
    const from90 = addDays(today, -90);
    const burn = sumReported(actual.filter((e) => e.incurredOn > from90 && e.incurredOn <= today), R);
    const monthlyBurn = burn.total / 3;
    runway =
      balance === null
        ? { value: null, kind: "estimate", missingFx: missing, note: "Cash balance unavailable." }
        : monthlyBurn <= 0
          ? { value: null, kind: "estimate", missingFx: burn.missingFx, note: "No expenses recorded in the last 90 days." }
          : { value: balance / monthlyBurn, kind: "estimate", missingFx: burn.missingFx, note: "Months of cash at the average burn of the last 90 days." };
  }

  // Target
  const months = monthsInPeriod(period);
  const targetR = settings.monthlyRevenueTargetCurrency === R ? settings.monthlyRevenueTarget : (() => {
    const r = findRate(rates, settings.monthlyRevenueTargetCurrency, R, today);
    return r ? convertMinor(settings.monthlyRevenueTarget, r.rate) : null;
  })();
  const targetValue = months > 0 && targetR !== null ? targetR * months : null;
  const basisValue = settings.targetBasis === "collected" ? collected.total : settings.targetBasis === "contracted" ? bookingsP.total : recognized.total;

  const planned30 = sumReported(input.expenses.filter((e) => e.status === "planned" && e.incurredOn > today && e.incurredOn <= in30), R);

  const m = (value: number | null, kind: MetricKind, missingFx = 0, note?: string): Metric => ({ value, kind, missingFx, note });

  return {
    reportingCurrency: R,
    bookings: m(bookingsP.total, "actual", bookingsP.missingFx, "Contracts signed in the period (signature evidence required)."),
    totalContracted: m(bookingsAll.total, "actual", bookingsAll.missingFx),
    mrr: retainers.length ? m(mrr.total, "actual", mrr.missingFx, "Active retainer contracts in force today.") : m(null, "actual", 0, "No active retainer contracts."),
    recognizedRevenue: m(recognized.total, "actual", recognized.missingFx),
    recognizedRecurring: m(recognizedRecurring.total, "actual", recognizedRecurring.missingFx),
    recognizedProject: m(recognizedProject.total, "actual", recognizedProject.missingFx),
    invoicedSubtotal: m(invSub, "actual", invMissing, "Issued invoices, before tax."),
    invoicedTotal: m(invTot, "actual", invMissing, "Issued invoices, including tax."),
    collected: m(collected.total, "actual", collected.missingFx, "Payments received (including tax)."),
    accountsReceivable: m(ar, "actual", arMissing, "Open balance of issued invoices."),
    overdueReceivables: m(overdue, "actual", overdueMissing),
    directCosts: m(direct.total, "actual", direct.missingFx),
    operatingExpenses: m(overhead.total, "actual", overhead.missingFx),
    aiCosts: m(ai.total, "actual", ai.missingFx, "Expenses categorised as AI/API."),
    grossProfit: m(gp, "actual", fxGap),
    grossMargin: m(recognized.total ? gp / recognized.total : null, "actual", fxGap, recognized.total ? undefined : "No recognized revenue in the period."),
    operatingProfit: m(op, "actual", fxGap + overhead.missingFx),
    cashBalance: cash,
    runwayMonths: runway,
    revenueTarget: m(targetValue, "goal", 0, `Founder goal (${settings.targetBasis}), not revenue.`),
    revenueVsTarget: m(targetValue ? basisValue / targetValue : null, "actual", 0, `Basis: ${settings.targetBasis} revenue.`),
    expectedCollections30: m(exp30, "forecast", exp30Missing, "Open invoices due in the next 30 days (excludes overdue)."),
    plannedExpenses30: m(planned30.total, "forecast", planned30.missingFx, "Planned expenses in the next 30 days."),
    invoiceStates,
  };
}

/** Pricing helpers for proposals. */
export type ProposalLine = { quantity: number; unitPrice: number; estimatedCost: number };
export function proposalTotals(lines: ProposalLine[], taxRate: number, marginTarget = 0.5) {
  const subtotal = Math.round(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
  const cost = lines.reduce((s, l) => s + l.estimatedCost, 0);
  const tax = Math.round(subtotal * taxRate);
  const grossMargin = subtotal > 0 ? (subtotal - cost) / subtotal : null;
  const priceFloor = marginTarget < 1 ? Math.ceil(cost / (1 - marginTarget)) : null;
  return { subtotal, cost, tax, total: subtotal + tax, grossProfit: subtotal - cost, grossMargin, priceFloor, meetsMarginTarget: grossMargin !== null && grossMargin >= marginTarget };
}
