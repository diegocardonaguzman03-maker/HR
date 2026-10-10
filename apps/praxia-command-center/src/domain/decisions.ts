/**
 * Executive Decision Feed. Every item is derived from real records (or demo records when demo mode is on) and
 * carries its evidence. No item is invented: if there is no supporting record, there is no recommendation.
 */
import type { Currency } from "@/server/db/schema";
import { formatMoney } from "./money";
import { daysBetween } from "./period";

export type Priority = "critical" | "high" | "medium" | "low";
export type DecisionAction =
  | { type: "link"; label: string; href: string }
  | { type: "approve"; label: string; approvalId: string }
  | { type: "reject"; label: string; approvalId: string }
  | { type: "assign"; label: string; agentId: string; title: string; entityType: string; entityId: string };

export type DecisionItem = {
  id: string;
  category: "finance" | "sales" | "governance" | "delivery" | "setup";
  title: string;
  reason: string;
  evidence: { label: string; href?: string }[];
  impact: string;
  impactValue: number | null;
  priority: Priority;
  recommendedAction: string;
  agentId: string;
  actions: DecisionAction[];
};

export type DecisionInput = {
  today: string;
  reportingCurrency: Currency;
  overdueInvoices: { id: string; number: string; organizationName: string; balance: number; currency: Currency; daysOverdue: number }[];
  pendingApprovals: { id: string; kind: string; title: string; detail: string; href: string; createdAt: string; requestedBy: string }[];
  openOpportunities: {
    id: string;
    title: string;
    organizationName: string;
    amount: number | null;
    currency: Currency;
    nextAction: string | null;
    nextActionDate: string | null;
    lastActivityAt: string | null;
    createdAt: string;
    ownerAgentId: string | null;
  }[];
  signedContractsWithoutInvoice: { id: string; title: string; organizationName: string; totalAmount: number; currency: Currency; signedAt: string }[];
  missingFxCount: number;
  openingCashConfigured: boolean;
  targetProgress: { ratio: number | null; expectedRatio: number; basis: string } | null;
  expiredProposals: { id: string; opportunityId: string; title: string; validUntil: string }[];
};

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
/** Within a priority level: cash and blocking approvals before pipeline hygiene. */
const CATEGORY_ORDER: Record<DecisionItem["category"], number> = { finance: 0, governance: 1, delivery: 2, sales: 3, setup: 4 };
const STALE_DAYS = 14;

export function buildDecisionFeed(d: DecisionInput): DecisionItem[] {
  const items: DecisionItem[] = [];

  for (const inv of d.overdueInvoices) {
    items.push({
      id: `overdue-${inv.id}`,
      category: "finance",
      title: `Invoice ${inv.number} is ${inv.daysOverdue} day${inv.daysOverdue === 1 ? "" : "s"} overdue`,
      reason: `${inv.organizationName} has not fully paid an issued invoice past its due date.`,
      evidence: [{ label: `Invoice ${inv.number} · balance ${formatMoney(inv.balance, inv.currency)}`, href: `/finance/invoices/${inv.id}` }],
      impact: `${formatMoney(inv.balance, inv.currency)} of cash not collected`,
      impactValue: inv.balance,
      priority: inv.daysOverdue > 30 ? "critical" : "high",
      recommendedAction: "Confirm payment status with the client and record the payment, or prepare a reminder for your approval.",
      agentId: "FIN-01",
      actions: [
        { type: "link", label: "Open invoice", href: `/finance/invoices/${inv.id}` },
        { type: "assign", label: "Ask FIN-01 to draft a reminder", agentId: "FIN-01", title: `Draft payment reminder for invoice ${inv.number}`, entityType: "invoice", entityId: inv.id },
      ],
    });
  }

  for (const a of d.pendingApprovals) {
    items.push({
      id: `approval-${a.id}`,
      category: "governance",
      title: `Approval needed: ${a.title}`,
      reason: a.detail || "A record is waiting for founder approval before it can move forward.",
      evidence: [{ label: `Requested by ${a.requestedBy} on ${a.createdAt.slice(0, 10)}`, href: a.href }],
      impact: "Blocks the next step until decided",
      impactValue: null,
      priority: "high",
      recommendedAction: "Review the record and approve or reject it.",
      agentId: "CEO-01",
      actions: [
        { type: "approve", label: "Approve", approvalId: a.id },
        { type: "reject", label: "Reject", approvalId: a.id },
        { type: "link", label: "Review", href: a.href },
      ],
    });
  }

  for (const c of d.signedContractsWithoutInvoice) {
    items.push({
      id: `uninvoiced-${c.id}`,
      category: "finance",
      title: `Signed contract has no invoice yet`,
      reason: `${c.title} (${c.organizationName}) was signed on ${c.signedAt.slice(0, 10)} and nothing has been invoiced against it.`,
      evidence: [{ label: `Contract value ${formatMoney(c.totalAmount, c.currency)}`, href: `/finance/contracts/${c.id}` }],
      impact: `${formatMoney(c.totalAmount, c.currency)} contracted, not yet billed`,
      impactValue: c.totalAmount,
      priority: "high",
      recommendedAction: "Issue the first invoice according to the payment schedule (e.g. kickoff milestone).",
      agentId: "FIN-01",
      actions: [{ type: "link", label: "Create invoice", href: `/finance/invoices/new?contractId=${c.id}` }],
    });
  }

  for (const o of d.openOpportunities) {
    const href = `/crm/opportunities/${o.id}`;
    const value = o.amount ? formatMoney(o.amount, o.currency) : "value not estimated";
    if (o.nextActionDate && o.nextActionDate < d.today) {
      const late = daysBetween(o.nextActionDate, d.today);
      items.push({
        id: `followup-${o.id}`,
        category: "sales",
        title: `Follow-up overdue: ${o.organizationName}`,
        reason: `The next action "${o.nextAction ?? "—"}" was due ${late} day${late === 1 ? "" : "s"} ago.`,
        evidence: [{ label: `${o.title} · ${value}`, href }],
        impact: o.amount ? `${value} opportunity at risk of stalling` : "Opportunity at risk of stalling",
        impactValue: o.amount,
        priority: late > 7 ? "high" : "medium",
        recommendedAction: "Complete the follow-up, log it, and set the next action.",
        agentId: o.ownerAgentId ?? "SAL-01",
        actions: [{ type: "link", label: "Open opportunity", href }],
      });
    } else if (!o.nextAction) {
      items.push({
        id: `nonext-${o.id}`,
        category: "sales",
        title: `No next action: ${o.organizationName}`,
        reason: "Every open opportunity needs a dated next action to keep moving.",
        evidence: [{ label: `${o.title} · ${value}`, href }],
        impact: "Pipeline hygiene",
        impactValue: o.amount,
        priority: "medium",
        recommendedAction: "Define the next concrete step and its date.",
        agentId: o.ownerAgentId ?? "SAL-03",
        actions: [{ type: "link", label: "Set next action", href }],
      });
    }
    const last = o.lastActivityAt ?? o.createdAt;
    const idle = daysBetween(last, d.today);
    if (idle >= STALE_DAYS) {
      items.push({
        id: `stale-${o.id}`,
        category: "sales",
        title: `No activity in ${idle} days: ${o.organizationName}`,
        reason: `No logged interaction since ${last.slice(0, 10)}.`,
        evidence: [{ label: `${o.title} · ${value}`, href }],
        impact: o.amount ? `${value} pipeline may be stale` : "Pipeline may be stale",
        impactValue: o.amount,
        priority: "medium",
        recommendedAction: "Re-engage with a specific reason, or move to Closed Lost with a reason.",
        agentId: o.ownerAgentId ?? "SAL-01",
        actions: [
          { type: "link", label: "Open opportunity", href },
          { type: "assign", label: "Ask SAL-01 for a re-engagement plan", agentId: "SAL-01", title: `Re-engagement plan for ${o.organizationName}`, entityType: "opportunity", entityId: o.id },
        ],
      });
    }
  }

  for (const p of d.expiredProposals) {
    items.push({
      id: `expired-${p.id}`,
      category: "sales",
      title: `Proposal validity has passed`,
      reason: `"${p.title}" was valid until ${p.validUntil}.`,
      evidence: [{ label: p.title, href: `/proposals/${p.id}` }],
      impact: "Terms may no longer be binding",
      impactValue: null,
      priority: "medium",
      recommendedAction: "Mark as expired or issue a new version with updated validity.",
      agentId: "SAL-03",
      actions: [{ type: "link", label: "Open proposal", href: `/proposals/${p.id}` }],
    });
  }

  if (d.missingFxCount > 0) {
    items.push({
      id: "missing-fx",
      category: "setup",
      title: `${d.missingFxCount} record${d.missingFxCount === 1 ? "" : "s"} cannot be converted to ${d.reportingCurrency}`,
      reason: "No exchange rate was available on the record date, so they are excluded from consolidated totals.",
      evidence: [{ label: "Exchange rates", href: "/finance/fx" }],
      impact: "Consolidated figures are incomplete",
      impactValue: null,
      priority: "high",
      recommendedAction: "Add the exchange rate (with its source and date) and re-apply snapshots.",
      agentId: "FIN-01",
      actions: [{ type: "link", label: "Add exchange rate", href: "/finance/fx" }],
    });
  }

  if (!d.openingCashConfigured) {
    items.push({
      id: "setup-cash",
      category: "setup",
      title: "Cash balance is not configured",
      reason: "Cash balance and runway cannot be calculated without an opening balance.",
      evidence: [{ label: "Finance settings", href: "/settings" }],
      impact: "Cash and runway KPIs unavailable",
      impactValue: null,
      priority: "low",
      recommendedAction: "Enter the opening cash balance, its currency and date.",
      agentId: "FIN-01",
      actions: [{ type: "link", label: "Configure", href: "/settings" }],
    });
  }

  if (d.targetProgress && d.targetProgress.ratio !== null && d.targetProgress.ratio < d.targetProgress.expectedRatio * 0.8) {
    items.push({
      id: "target-gap",
      category: "sales",
      title: "Revenue is behind the monthly goal",
      reason: `Month-to-date ${d.targetProgress.basis} revenue is ${(d.targetProgress.ratio * 100).toFixed(0)}% of the goal; ${(d.targetProgress.expectedRatio * 100).toFixed(0)}% of the month has elapsed.`,
      evidence: [{ label: "Executive dashboard", href: "/" }],
      impact: "Monthly goal at risk",
      impactValue: null,
      priority: "medium",
      recommendedAction: "Review the pipeline for opportunities that can close this month.",
      agentId: "CEO-01",
      actions: [{ type: "link", label: "Open pipeline", href: "/crm" }],
    });
  }

  return items.sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] ||
      (b.impactValue ?? 0) - (a.impactValue ?? 0),
  );
}
