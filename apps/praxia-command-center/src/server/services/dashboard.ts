import { and, eq, inArray, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { activities, approvals, contacts, contracts, expenses, invoices, opportunities, organizations, payments, pipelineStages, proposalLines, proposals, revenueEntries } from "../db/schema";
import { computeFinanceMetrics, type FinanceInput } from "@/domain/finance";
import { computeSalesMetrics } from "@/domain/pipeline";
import { buildDecisionFeed } from "@/domain/decisions";
import { resolvePeriod, type PeriodKey } from "@/domain/period";
import { demoFilter, getSettings, loadRates } from "./common";
import { listAgentsWithStatus } from "./agents";
import { listStages } from "./crm";

type FinanceData = FinanceInput & { rawContracts: (typeof contracts.$inferSelect)[]; rawInvoices: (typeof invoices.$inferSelect)[] };

export async function loadFinanceInput(db: DB, includeDemo: boolean, periodKey: PeriodKey, today: string): Promise<FinanceData> {
  const settings = await getSettings(db);
  const rates = await loadRates(db);
  const cs = await db.select().from(contracts).where(demoFilter(contracts.isDemo, includeDemo));
  const kindById = new Map(cs.map((c) => [c.id, c.kind]));
  const rev = await db.select().from(revenueEntries).where(demoFilter(revenueEntries.isDemo, includeDemo));
  const invs = await db.select().from(invoices).where(demoFilter(invoices.isDemo, includeDemo));
  return {
    rawContracts: cs,
    rawInvoices: invs,
    contracts: cs.map((c) => ({ ...c, amount: c.totalAmount })),
    revenue: rev.map((r) => ({ ...r, contractKind: kindById.get(r.contractId) ?? "project" })),
    invoices: invs,
    payments: await db.select().from(payments).where(demoFilter(payments.isDemo, includeDemo)),
    expenses: await db.select().from(expenses).where(demoFilter(expenses.isDemo, includeDemo)),
    settings,
    rates,
    period: resolvePeriod(periodKey, today),
    today,
  };
}

export async function loadDashboard(db: DB, opts: { includeDemo: boolean; periodKey: PeriodKey; today: string }) {
  const { includeDemo, periodKey, today } = opts;
  const fin = await loadFinanceInput(db, includeDemo, periodKey, today);
  const finance = computeFinanceMetrics(fin);
  const stages = await listStages(db);
  const opps = await db.select().from(opportunities).where(demoFilter(opportunities.isDemo, includeDemo));
  const leads = await db.select({ id: contacts.id, leadStatus: contacts.leadStatus }).from(contacts).where(demoFilter(contacts.isDemo, includeDemo));
  const acts = await db.select().from(activities).where(demoFilter(activities.isDemo, includeDemo));
  const props = await db.select().from(proposals).where(demoFilter(proposals.isDemo, includeDemo));
  const lines = props.length ? await db.select().from(proposalLines).where(inArray(proposalLines.proposalId, props.map((p) => p.id))) : [];
  const subtotalOf = (pid: string) => Math.round(lines.filter((l) => l.proposalId === pid).reduce((s, l) => s + l.quantity * l.unitPrice, 0));
  const sales = computeSalesMetrics({
    opportunities: opps,
    stages,
    leads,
    activities: acts,
    proposals: props.map((p) => ({ subtotal: subtotalOf(p.id), currency: p.currency, status: p.status })),
    rates: fin.rates,
    reportingCurrency: fin.settings.reportingCurrency,
    period: fin.period,
    today,
  });

  // Operational
  const orgs = await db.select().from(organizations).where(demoFilter(organizations.isDemo, includeDemo));
  const orgName = new Map(orgs.map((o) => [o.id, o.name]));
  const activeContracts = fin.rawContracts.filter((c) => ["signed", "active"].includes(c.status));
  const pendingApprovals = await db.select().from(approvals).where(and(eq(approvals.status, "pending"), demoFilter(approvals.isDemo, includeDemo)));
  const agents = await listAgentsWithStatus(db);

  // Decision feed inputs
  const stageKind = new Map(stages.map((s) => [s.id, s.kind]));
  const lastAct = new Map<string, string>();
  for (const a of acts) if (a.opportunityId && a.recordedManually && (!lastAct.has(a.opportunityId) || a.occurredAt > lastAct.get(a.opportunityId)!)) lastAct.set(a.opportunityId, a.occurredAt);
  const overdue = finance.invoiceStates
    .filter((s) => s.derivedStatus === "overdue")
    .map((s) => {
      const inv = fin.rawInvoices.find((i) => i.id === s.id)!;
      return { id: inv.id, number: inv.number, organizationName: orgName.get(inv.organizationId) ?? "—", balance: s.balance, currency: inv.currency, daysOverdue: s.daysOverdue };
    });
  const invoicedContracts = new Set(fin.rawInvoices.filter((i) => i.status !== "void" && i.contractId).map((i) => i.contractId));
  const missingFx =
    fin.contracts.filter((c) => c.signedAt && c.currency !== fin.settings.reportingCurrency && c.reportingAmount === null).length +
    fin.invoices.filter((i) => i.status === "issued" && i.currency !== fin.settings.reportingCurrency && i.fxRate === null).length +
    fin.payments.filter((p) => p.currency !== fin.settings.reportingCurrency && p.reportingAmount === null).length +
    fin.expenses.filter((e) => e.currency !== fin.settings.reportingCurrency && e.reportingAmount === null).length +
    fin.revenue.filter((r) => r.currency !== fin.settings.reportingCurrency && r.reportingAmount === null).length;
  const mtd = periodKey === "mtd" ? finance : computeFinanceMetrics({ ...fin, period: resolvePeriod("mtd", today) });
  const dayOfMonth = Number(today.slice(8, 10));
  const daysInMonth = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0)).getUTCDate();

  const decisions = buildDecisionFeed({
    today,
    reportingCurrency: fin.settings.reportingCurrency,
    overdueInvoices: overdue,
    pendingApprovals: pendingApprovals.map((a) => ({
      id: a.id,
      kind: a.kind,
      title: a.title,
      detail: a.detail,
      href: a.entityType === "proposal" ? `/proposals/${a.entityId}` : "/approvals",
      createdAt: a.createdAt,
      requestedBy: a.requestedBy,
    })),
    openOpportunities: opps
      .filter((o) => stageKind.get(o.stageId) === "open")
      .map((o) => ({ ...o, organizationName: orgName.get(o.organizationId) ?? "—", lastActivityAt: lastAct.get(o.id) ?? null })),
    signedContractsWithoutInvoice: fin.rawContracts
      .filter((c) => c.signedAt && ["signed", "active"].includes(c.status) && !invoicedContracts.has(c.id))
      .map((c) => ({ id: c.id, title: c.title, organizationName: orgName.get(c.organizationId) ?? "—", totalAmount: c.totalAmount, currency: c.currency, signedAt: c.signedAt! })),
    missingFxCount: missingFx,
    openingCashConfigured: fin.settings.openingCashAmount !== null,
    targetProgress: mtd.revenueVsTarget.value === null ? null : { ratio: mtd.revenueVsTarget.value, expectedRatio: dayOfMonth / daysInMonth, basis: fin.settings.targetBasis },
    expiredProposals: props.filter((p) => p.validUntil && p.validUntil < today && ["sent", "negotiation", "approved"].includes(p.status)).map((p) => ({ id: p.id, opportunityId: p.opportunityId, title: p.title, validUntil: p.validUntil! })),
  });

  const demoCounts = await db.select({ n: sql<number>`count(*)` }).from(organizations).where(eq(organizations.isDemo, true));
  return {
    period: fin.period,
    settings: fin.settings,
    finance,
    sales,
    operations: {
      activeClients: new Set(activeContracts.map((c) => c.organizationId)).size,
      activeContracts: activeContracts.length,
      openApprovals: pendingApprovals.length,
      agentTasksCompleted: agents.reduce((s, a) => s + a.tasksCompleted, 0),
      agentTasksOpen: agents.reduce((s, a) => s + a.tasksOpen, 0),
      agentsWorking: agents.filter((a) => a.status === "working").length,
    },
    decisions,
    hasDemoData: (demoCounts[0]?.n ?? 0) > 0,
    stages,
  };
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;
export { pipelineStages };
