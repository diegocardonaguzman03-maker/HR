import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { agents, auditLog, pipelineStages, services } from "@/server/db/schema";
import { freshDb } from "../helpers";
import { createContact, createOpportunity, createOrganization, logActivity, moveOpportunityStage, updateContact, updateOpportunity } from "@/server/services/crm";
import { acceptProposal, createProposalFromOpportunity, decideApproval, markProposalSent, recognizeRevenue, signContract, submitProposalForApproval, updateProposal } from "@/server/services/commercial";
import { addFxRate, applyMissingSnapshots, createExpense, createInvoice, issueInvoice, recordPayment, updateSettings, voidInvoice } from "@/server/services/finance";
import { createTask, listAgentsWithStatus, updateTaskStatus } from "@/server/services/agents";
import { loadDashboard } from "@/server/services/dashboard";
import { todayIso } from "@/server/services/common";

let db: DB;
beforeEach(async () => {
  db = await freshDb();
});

const stage = async (key: string) => (await db.select().from(pipelineStages).where(eq(pipelineStages.key, key)))[0]!;
const service = async (code: string) => (await db.select().from(services).where(eq(services.code, code)))[0]!;
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

describe("base seed", () => {
  it("seeds configuration only: 28 agents, 12 stages, 7 services, no business data", async () => {
    expect((await db.select().from(agents)).length).toBe(28);
    expect((await db.select().from(pipelineStages)).length).toBe(12);
    expect((await db.select().from(services)).length).toBe(7);
    const d = await loadDashboard(db, { includeDemo: false, periodKey: "ytd", today: todayIso() });
    expect(d.finance.bookings.value).toBe(0);
    expect(d.finance.collected.value).toBe(0);
    expect(d.sales.activeOpportunities).toBe(0);
    // Only setup items and the (true) gap against the founder's goal — nothing invented.
    expect(d.decisions.every((x) => x.category === "setup" || x.id === "target-gap")).toBe(true);
  });

  it("all agents are reported offline while no execution engine is connected", async () => {
    const list = await listAgentsWithStatus(db);
    expect(list.every((a) => a.status === "offline")).toBe(true);
  });
});

describe("CRM rules", () => {
  it("detects duplicate organizations by domain and name", async () => {
    await createOrganization(db, { name: "Acme Steel", website: "https://www.acme-steel.mx/about" });
    await expect(createOrganization(db, { name: "Other name", domain: "ACME-STEEL.mx" })).rejects.toThrow(/duplicate/i);
    await expect(createOrganization(db, { name: "acme steel" })).rejects.toThrow(/duplicate/i);
  });

  it("validates stage moves and requires evidence for Closed Won", async () => {
    const org = await createOrganization(db, { name: "Beta Corp" });
    const opp = await createOpportunity(db, { organizationId: org.id, title: "AI adoption diagnostic" });
    await expect(moveOpportunityStage(db, opp.id, (await stage("qualified")).id)).rejects.toThrow(/primary contact/);
    const c = await createContact(db, { organizationId: org.id, fullName: "Ana Ruiz", email: "ana@beta.example" });
    await updateOpportunity(db, opp.id, { primaryContactId: c.id, problemStatement: "AI licenses bought, usage below plan." });
    await moveOpportunityStage(db, opp.id, (await stage("qualified")).id);
    await updateOpportunity(db, opp.id, { amount: 1_200_000 });
    await expect(moveOpportunityStage(db, opp.id, (await stage("closed_won")).id)).rejects.toThrow(/signed contract/);
    await expect(moveOpportunityStage(db, opp.id, (await stage("closed_lost")).id)).rejects.toThrow(/lost reason/);
    const other = await createOrganization(db, { name: "Other Corp" });
    await expect(updateOpportunity(db, opp.id, { organizationId: other.id })).rejects.toThrow(/another organization/);
    const lost = await moveOpportunityStage(db, opp.id, (await stage("closed_lost")).id, "founder", { lostReason: "No budget this year" });
    expect(lost.closedAt).toBeTruthy();
    expect(lost.maxStagePosition).toBe((await stage("qualified")).position);
  });

  it("blocks outbound activity to suppressed contacts and progresses lead status from real interactions", async () => {
    const org = await createOrganization(db, { name: "Gamma" });
    const c = await createContact(db, { organizationId: org.id, fullName: "Luis Pérez", email: "luis@gamma.example" });
    await logActivity(db, { type: "email", direction: "outbound", subject: "Intro (sent manually)", occurredAt: new Date().toISOString(), contactId: c.id });
    await logActivity(db, { type: "email", direction: "inbound", subject: "Reply", occurredAt: new Date().toISOString(), contactId: c.id });
    await updateContact(db, c.id, { doNotContact: true });
    await expect(logActivity(db, { type: "linkedin", direction: "outbound", subject: "Follow-up", occurredAt: new Date().toISOString(), contactId: c.id })).rejects.toThrow(/suppression/);
    const d = await loadDashboard(db, { includeDemo: false, periodKey: "mtd", today: todayIso() });
    expect(d.sales.replyRate).toBe(1);
  });
});

describe("revenue lifecycle (end to end)", () => {
  it("opportunity → proposal → approval → acceptance → signature → recognition → invoice → payment → dashboard", async () => {
    await updateSettings(db, { openingCashAmount: 1_000_000, openingCashCurrency: "USD", openingCashDate: daysAgo(60) });
    const org = await createOrganization(db, { name: "Delta Manufacturing", country: "MX", industry: "Manufacturing" });
    const contact = await createContact(db, { organizationId: org.id, fullName: "María López", title: "CHRO", email: "maria@delta.example" });
    const diag = await service("A");
    const opp = await createOpportunity(db, {
      organizationId: org.id,
      title: "Transformation diagnostic",
      primaryContactId: contact.id,
      problemStatement: "ERP rollout finished; managers still run the old process.",
      serviceId: diag.id,
      amount: 1_200_000,
      expectedCloseDate: daysAgo(-20),
      nextAction: "Discovery call",
      nextActionDate: daysAgo(-2),
    });

    // Proposal pricing must be approved before it can be sent.
    const p = await createProposalFromOpportunity(db, opp.id);
    await updateProposal(db, p.id, {
      lines: [
        { description: "Diagnostic (5 layers × 5 levels)", quantity: 1, unitPrice: 1_000_000, estimatedCost: 300_000 },
        { description: "Executive readout", quantity: 1, unitPrice: 200_000, estimatedCost: 50_000 },
      ],
    });
    await expect(markProposalSent(db, p.id, todayIso())).rejects.toThrow(/approved/);
    const approval = await submitProposalForApproval(db, p.id);
    await expect(decideApproval(db, approval.id, "approved", null, "SAL-03")).rejects.toThrow(/founder/);
    await decideApproval(db, approval.id, "approved", "Within range");
    await markProposalSent(db, p.id, todayIso());
    expect((await db.select().from(pipelineStages).where(eq(pipelineStages.id, (await loadOpp(db, opp.id)).stageId)))[0]!.key).toBe("proposal_sent");

    // Acceptance needs evidence and creates a contract awaiting signature — not a booking yet.
    await expect(acceptProposal(db, p.id, { acceptedOn: todayIso(), evidence: "" })).rejects.toThrow(/evidence/);
    const contract = await acceptProposal(db, p.id, { acceptedOn: todayIso(), evidence: "Signed proposal PDF ref DLT-001" });
    let d = await loadDashboard(db, { includeDemo: false, periodKey: "mtd", today: todayIso() });
    expect(d.finance.bookings.value).toBe(0);

    await signContract(db, contract.id, { signedAt: todayIso(), evidence: "Countersigned contract, file DLT-001-signed.pdf", startDate: todayIso() });
    expect((await db.select().from(pipelineStages).where(eq(pipelineStages.id, (await loadOpp(db, opp.id)).stageId)))[0]!.kind).toBe("won");

    await recognizeRevenue(db, contract.id, { recognizedOn: todayIso(), amount: 600_000, basis: "milestone", description: "Kickoff + fieldwork" });
    await expect(recognizeRevenue(db, contract.id, { recognizedOn: todayIso(), amount: 700_000, basis: "milestone" })).rejects.toThrow(/exceed/);

    const inv = await createInvoice(db, { organizationId: org.id, contractId: contract.id, issueDate: todayIso(), dueDate: daysAgo(-15), currency: "USD", subtotal: 600_000, taxRate: 0.16 });
    await expect(createInvoice(db, { organizationId: org.id, contractId: contract.id, issueDate: todayIso(), dueDate: daysAgo(-15), currency: "USD", subtotal: 700_000, taxRate: 0.16 })).rejects.toThrow(/exceed/);
    await expect(recordPayment(db, inv.id, { receivedOn: todayIso(), amount: 100, currency: "USD" })).rejects.toThrow(/issued/);
    await issueInvoice(db, inv.id);
    await expect(recordPayment(db, inv.id, { receivedOn: todayIso(), amount: 999_999, currency: "USD" })).rejects.toThrow(/balance/);
    await expect(recordPayment(db, inv.id, { receivedOn: todayIso(), amount: 100, currency: "MXN" })).rejects.toThrow(/currency/);
    await recordPayment(db, inv.id, { receivedOn: todayIso(), amount: 400_000, currency: "USD", reference: "SPEI 123" });
    await expect(voidInvoice(db, inv.id, "error")).rejects.toThrow(/payments/);

    await createExpense(db, { incurredOn: todayIso(), vendor: "Associate consultant", category: "contractors", amount: 150_000, currency: "USD", costType: "direct", contractId: contract.id });
    await createExpense(db, { incurredOn: todayIso(), vendor: "Anthropic API", category: "ai_api", amount: 20_000, currency: "USD", costType: "overhead" });

    d = await loadDashboard(db, { includeDemo: false, periodKey: "mtd", today: todayIso() });
    const f = d.finance;
    expect(f.bookings.value).toBe(1_200_000);
    expect(f.recognizedRevenue.value).toBe(600_000);
    expect(f.invoicedSubtotal.value).toBe(600_000);
    expect(f.invoicedTotal.value).toBe(696_000);
    expect(f.collected.value).toBe(400_000);
    expect(f.accountsReceivable.value).toBe(296_000);
    expect(f.directCosts.value).toBe(150_000);
    expect(f.operatingExpenses.value).toBe(20_000);
    expect(f.grossProfit.value).toBe(450_000);
    expect(f.operatingProfit.value).toBe(430_000);
    expect(f.cashBalance.value).toBe(1_000_000 + 400_000 - 170_000);
    expect(d.sales.winRate).toBe(1);
    expect(d.sales.averageDealSize).toBe(1_200_000);
    expect(d.operations.activeClients).toBe(1);

    // Every step is auditable.
    const actions = (await db.select().from(auditLog)).map((a) => a.action);
    for (const a of ["proposal.submit", "approval.approved", "proposal.sent", "proposal.accepted", "contract.signed", "revenue.recognize", "invoice.issue", "payment.record"]) {
      expect(actions).toContain(a);
    }
  });

  it("keeps original MXN amounts and reports missing FX until a dated rate is added", async () => {
    const org = await createOrganization(db, { name: "Epsilon MX" });
    await createExpense(db, { incurredOn: daysAgo(3), vendor: "Coworking CDMX", category: "office", amount: 1_900_000, currency: "MXN", costType: "overhead" });
    let d = await loadDashboard(db, { includeDemo: false, periodKey: "ytd", today: todayIso() });
    expect(d.finance.operatingExpenses.missingFx).toBe(1);
    expect(d.decisions.some((x) => x.id === "missing-fx")).toBe(true);
    await addFxRate(db, { base: "USD", quote: "MXN", rate: 19, source: "Banxico FIX (entered manually)", rateDate: daysAgo(5) });
    expect(await applyMissingSnapshots(db)).toBe(1);
    d = await loadDashboard(db, { includeDemo: false, periodKey: "ytd", today: todayIso() });
    expect(d.finance.operatingExpenses.value).toBe(100_000);
    expect(d.finance.operatingExpenses.missingFx).toBe(0);
    expect(org.id).toBeTruthy();
    await expect(updateSettings(db, { reportingCurrency: "MXN" })).rejects.toThrow(/locked/);
  });

  it("excludes demo data from metrics unless demo mode is on", async () => {
    const org = await createOrganization(db, { name: "Demo Co", isDemo: true });
    await createOpportunity(db, { organizationId: org.id, title: "Demo deal", amount: 5_000_000, isDemo: true });
    const real = await loadDashboard(db, { includeDemo: false, periodKey: "ytd", today: todayIso() });
    const demo = await loadDashboard(db, { includeDemo: true, periodKey: "ytd", today: todayIso() });
    expect(real.sales.activeOpportunities).toBe(0);
    expect(demo.sales.activeOpportunities).toBe(1);
    expect(real.hasDemoData).toBe(true);
  });
});

describe("agent tasks", () => {
  it("creates real task records; status changes only through recorded events", async () => {
    const t = await createTask(db, { agentId: "SAL-03", title: "Draft discovery guide" });
    let sal = (await listAgentsWithStatus(db)).find((a) => a.id === "SAL-03")!;
    expect(sal.status).toBe("offline");
    expect(sal.tasksOpen).toBe(1);
    await updateTaskStatus(db, t.id, "working");
    sal = (await listAgentsWithStatus(db)).find((a) => a.id === "SAL-03")!;
    expect(sal.status).toBe("working");
    await expect(updateTaskStatus(db, t.id, "completed")).rejects.toThrow(/output/);
    await updateTaskStatus(db, t.id, "completed", { output: "praxia/equipos/E2-revenue/2026-10-09-PRX-0004/guia.md" });
    sal = (await listAgentsWithStatus(db)).find((a) => a.id === "SAL-03")!;
    expect(sal.status).toBe("offline");
    expect(sal.tasksCompleted).toBe(1);
  });
});

async function loadOpp(db: DB, id: string) {
  const { opportunities } = await import("@/server/db/schema");
  return (await db.select().from(opportunities).where(eq(opportunities.id, id)))[0]!;
}
