import { describe, it, expect } from "vitest";
import { computeSalesMetrics, validateStageMove, type OpportunityRec, type StageRec } from "@/domain/pipeline";
import { buildDecisionFeed, type DecisionInput } from "@/domain/decisions";
import { resolvePeriod } from "@/domain/period";

const stages: StageRec[] = [
  { id: "s1", key: "identified", name: "Identified", position: 1, defaultProbability: 0.02, kind: "open", requiredFields: [] },
  { id: "s2", key: "qualified", name: "Qualified", position: 2, defaultProbability: 0.2, kind: "open", requiredFields: ["primaryContactId", "problemStatement"] },
  { id: "s3", key: "negotiation", name: "Negotiation", position: 3, defaultProbability: 0.75, kind: "open", requiredFields: ["amount"] },
  { id: "w", key: "closed_won", name: "Closed Won", position: 4, defaultProbability: 1, kind: "won", requiredFields: ["amount"] },
  { id: "l", key: "closed_lost", name: "Closed Lost", position: 5, defaultProbability: 0, kind: "lost", requiredFields: ["lostReason"] },
];
const opp = (o: Partial<OpportunityRec>): OpportunityRec => ({
  id: "o", title: "t", organizationId: "org", stageId: "s1", amount: null, currency: "USD", probabilityOverride: null, expectedCloseDate: null,
  nextAction: null, nextActionDate: null, primaryContactId: null, serviceId: null, problemStatement: "", lostReason: null, maxStagePosition: 1,
  createdAt: "2026-09-01T00:00:00Z", closedAt: null, ...o,
});

describe("stage validation", () => {
  it("lists missing required fields", () => {
    expect(validateStageMove(opp({}), stages[1]!)).toEqual(["primaryContactId", "problemStatement"]);
    expect(validateStageMove(opp({ primaryContactId: "c", problemStatement: "Low AI adoption" }), stages[1]!)).toEqual([]);
    expect(validateStageMove(opp({ amount: 0 }), stages[2]!)).toEqual(["amount"]);
  });
});

describe("sales metrics", () => {
  it("weights pipeline, computes win rate, cycle, funnel and reply rate", () => {
    const today = "2026-10-20";
    const m = computeSalesMetrics({
      stages,
      today,
      period: resolvePeriod("ytd", today),
      reportingCurrency: "USD",
      rates: [{ base: "USD", quote: "MXN", rate: 20, source: "t", rateDate: "2026-01-01" }],
      leads: [{ id: "a", leadStatus: "qualified" }, { id: "b", leadStatus: "new" }, { id: "c", leadStatus: "disqualified" }],
      proposals: [{ subtotal: 2_000_000, currency: "MXN", status: "sent" }, { subtotal: 999, currency: "USD", status: "draft" }],
      activities: [
        { type: "email", direction: "outbound", contactId: "a", occurredAt: "2026-10-01", createdAt: "2026-10-01", opportunityId: null },
        { type: "email", direction: "outbound", contactId: "b", occurredAt: "2026-10-01", createdAt: "2026-10-01", opportunityId: null },
        { type: "email", direction: "inbound", contactId: "a", occurredAt: "2026-10-02", createdAt: "2026-10-02", opportunityId: null },
        { type: "meeting", direction: "internal", contactId: "a", occurredAt: "2026-10-09", createdAt: "2026-10-03", opportunityId: null },
      ],
      opportunities: [
        opp({ id: "1", stageId: "s3", amount: 1_000_000, maxStagePosition: 3, expectedCloseDate: "2026-11-15" }),
        opp({ id: "2", stageId: "s2", amount: 2_000_000, currency: "MXN", probabilityOverride: 0.5, maxStagePosition: 2 }),
        opp({ id: "3", stageId: "w", amount: 1_500_000, maxStagePosition: 4, createdAt: "2026-09-01T00:00:00Z", closedAt: "2026-10-01T00:00:00Z" }),
        opp({ id: "4", stageId: "l", amount: 500_000, maxStagePosition: 2, closedAt: "2026-10-02T00:00:00Z" }),
        opp({ id: "5", stageId: "s1", amount: null }),
      ],
    });
    expect(m.activeOpportunities).toBe(3);
    expect(m.opportunitiesWithoutValue).toBe(1);
    expect(m.weightedPipeline.value).toBe(750_000 + 50_000);
    expect(m.openProposalValue.value).toBe(100_000);
    expect(m.winRate).toBe(0.5);
    expect(m.averageDealSize).toBe(1_500_000);
    expect(m.salesCycleDays).toBe(30);
    expect(m.totalLeads).toBe(2);
    expect(m.qualifiedLeads).toBe(1);
    expect(m.replyRate).toBe(0.5);
    expect(m.meetingsBooked).toBe(1);
    expect(m.funnel.map((f) => f.reached)).toEqual([5, 4, 2, 1]);
    expect(m.forecast.find((f) => f.month === "2026-11")?.weighted).toBe(750_000);
  });
});

describe("decision feed", () => {
  const empty: DecisionInput = {
    today: "2026-10-20", reportingCurrency: "USD", overdueInvoices: [], pendingApprovals: [], openOpportunities: [],
    signedContractsWithoutInvoice: [], missingFxCount: 0, openingCashConfigured: true, targetProgress: null, expiredProposals: [],
  };
  it("produces nothing without supporting records", () => {
    expect(buildDecisionFeed(empty)).toEqual([]);
  });
  it("ranks overdue cash and approvals first and carries evidence + actions", () => {
    const feed = buildDecisionFeed({
      ...empty,
      overdueInvoices: [{ id: "i1", number: "PRX-2026-0001", organizationName: "Acme", balance: 500_000, currency: "USD", daysOverdue: 40 }],
      pendingApprovals: [{ id: "a1", kind: "proposal_pricing", title: "Pricing", detail: "", href: "/proposals/p1", createdAt: "2026-10-19T00:00:00Z", requestedBy: "founder" }],
      openOpportunities: [{ id: "o1", title: "Diag", organizationName: "Beta", amount: 1_000_000, currency: "USD", nextAction: "Call", nextActionDate: "2026-10-01", lastActivityAt: "2026-09-01", createdAt: "2026-08-01", ownerAgentId: null }],
    });
    expect(feed[0]!.id).toBe("overdue-i1");
    expect(feed[0]!.priority).toBe("critical");
    expect(feed[1]!.actions.some((a) => a.type === "approve")).toBe(true);
    expect(feed.find((f) => f.id === "followup-o1")?.evidence[0]?.href).toBe("/crm/opportunities/o1");
    expect(feed.find((f) => f.id === "stale-o1")).toBeTruthy();
    for (const f of feed) {
      expect(f.reason).toBeTruthy();
      expect(f.agentId).toMatch(/^[A-Z]+-\d{2}$/);
      expect(f.evidence.length).toBeGreaterThan(0);
    }
  });
});
