/**
 * Demonstration dataset — SIMULATION requested by the founder (2026-10-09): three client accounts with
 * USD 4.3M in signed contracts. Every organization and person is fictional ("(Demo)" in every name,
 * example.com domains). Created THROUGH the same service layer as real data, so every business rule is exercised.
 * Every row carries is_demo = true and stays hidden unless demo mode is on. No agent activity is simulated.
 *
 * Bookings (signed contracts, USD):
 *   Grupo Altamira Industrial  250,000 (Transformation Diagnostic, completed) + 1,560,000 (AI Adoption Accelerator)
 *   Banco Meridiano          1,200,000 (Operating model redesign) + 480,000 (Leadership routines)
 *   Nexa Logistics             810,000 (Strategic advisory retainer, 9 × 90,000)
 *   Total                    4,300,000
 */
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { opportunities, organizations, pipelineStages, services } from "../db/schema";
import { createContact, createOpportunity, createOrganization, logActivity, moveOpportunityStage } from "../services/crm";
import { acceptProposal, createProposalFromOpportunity, decideApproval, markProposalSent, recognizeRevenue, setContractStatus, signContract, submitProposalForApproval, updateProposal } from "../services/commercial";
import { createExpense, createInvoice, issueInvoice, recordPayment } from "../services/finance";
import { DEMO_ACTOR as A } from "../services/common";

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const ts = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString();
/** USD → minor units (cents). */
const usd = (dollars: number) => Math.round(dollars * 100);

/** Total signed value of the simulation, in cents. */
export const DEMO_BOOKINGS = usd(4_300_000);

type Line = { description: string; quantity?: number; unitPrice: number; estimatedCost: number; milestone?: string };

export async function seedDemo(db: DB): Promise<number> {
  const already = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.isDemo, true));
  if (already.length) return 0;
  const stage = async (key: string) => (await db.select().from(pipelineStages).where(eq(pipelineStages.key, key)))[0]!.id;
  const svc = async (code: string) => (await db.select().from(services).where(eq(services.code, code)))[0]!.id;
  const demo = { isDemo: true } as const;
  let n = 0;
  const count = <T,>(x: T) => (n++, x);

  /** Opportunity → priced proposal → approval (demo seed approves its own demo pricing) → sent → accepted → signed. */
  async function closeDeal(d: {
    organizationId: string; contactId: string; service: string; title: string; problem: string; lines: Line[]; taxRate: number;
    sent: number; accepted: number; signed: number; start: number; end: number; monthly?: number;
  }) {
    const total = d.lines.reduce((s, l) => s + l.unitPrice * (l.quantity ?? 1), 0);
    const opp = count(await createOpportunity(db, {
      organizationId: d.organizationId, title: d.title, primaryContactId: d.contactId, serviceId: await svc(d.service),
      problemStatement: d.problem, amount: total, expectedCloseDate: day(d.signed), ...demo,
    }, A));
    const p = count(await createProposalFromOpportunity(db, opp.id, A));
    await updateProposal(db, p.id, { patch: { taxRate: d.taxRate }, lines: d.lines.map((l) => ({ ...l, quantity: l.quantity ?? 1 })) }, A);
    const approval = await submitProposalForApproval(db, p.id, A);
    await decideApproval(db, approval.id, "approved", "Demo approval (simulation seed, not a founder decision)", A);
    await markProposalSent(db, p.id, day(d.sent), A);
    const k = count(await acceptProposal(db, p.id, { acceptedOn: day(d.accepted), evidence: "DEMO — signed proposal reference" }, A));
    const signed = await signContract(db, k.id, {
      signedAt: day(d.signed), evidence: "DEMO — countersigned contract reference", startDate: day(d.start), endDate: day(d.end),
      monthlyAmount: d.monthly ?? null,
    }, A);
    // Simulation timeline: the deal was opened ~4 weeks before the proposal and closed on the signature date
    // (the services stamp both with "now", which would make every simulated sales cycle 0 days).
    await db.update(opportunities).set({ createdAt: ts(d.sent - 28), closedAt: ts(d.signed) }).where(eq(opportunities.id, opp.id));
    return signed;
  }

  /** Issued invoice with an optional payment (full = subtotal + tax). */
  async function bill(o: { organizationId: string; contractId: string; issue: number; due: number; subtotal: number; taxRate: number; paid?: { on: number; amount?: number } }) {
    const inv = count(await createInvoice(db, { organizationId: o.organizationId, contractId: o.contractId, issueDate: day(o.issue), dueDate: day(o.due), currency: "USD", subtotal: o.subtotal, taxRate: o.taxRate, ...demo }, A));
    await issueInvoice(db, inv.id, A);
    if (o.paid) {
      const full = Math.round(o.subtotal * (1 + o.taxRate));
      await recordPayment(db, inv.id, { receivedOn: day(o.paid.on), amount: o.paid.amount ?? full, currency: "USD", reference: "DEMO" }, A);
    }
    return inv;
  }

  // ── Accounts ─────────────────────────────────────────────────────────────────────────────────────────────
  const altamira = count(await createOrganization(db, { name: "Grupo Altamira Industrial (Demo)", domain: "altamira-demo.example.com", industry: "Manufacturing", country: "MX", sizeBand: "5,000+", ...demo }, A));
  const meridiano = count(await createOrganization(db, { name: "Banco Meridiano (Demo)", domain: "meridiano-demo.example.com", industry: "Financial services", country: "CO", sizeBand: "5,000+", ...demo }, A));
  const nexa = count(await createOrganization(db, { name: "Nexa Logistics (Demo)", domain: "nexa-demo.example.com", industry: "Logistics", country: "US", sizeBand: "1,000–5,000", ...demo }, A));

  const mariana = count(await createContact(db, { organizationId: altamira.id, fullName: "Mariana Ortega (Demo)", title: "Chief People Officer", email: "mariana@altamira-demo.example.com", lawfulBasis: "existing_relationship", ...demo }, A));
  const ricardo = count(await createContact(db, { organizationId: altamira.id, fullName: "Ricardo Salas (Demo)", title: "COO", email: "ricardo@altamira-demo.example.com", lawfulBasis: "existing_relationship", ...demo }, A));
  const camila = count(await createContact(db, { organizationId: meridiano.id, fullName: "Camila Restrepo (Demo)", title: "Chief Transformation Officer", email: "camila@meridiano-demo.example.com", lawfulBasis: "existing_relationship", ...demo }, A));
  const andres = count(await createContact(db, { organizationId: meridiano.id, fullName: "Andrés Vélez (Demo)", title: "Head of Branch Network", email: "andres@meridiano-demo.example.com", lawfulBasis: "existing_relationship", ...demo }, A));
  const jordan = count(await createContact(db, { organizationId: nexa.id, fullName: "Jordan Blake (Demo)", title: "CEO", email: "jordan@nexa-demo.example.com", lawfulBasis: "existing_relationship", ...demo }, A));

  // ── Grupo Altamira Industrial · USD 1,810,000 ──────────────────────────────────────────────────────────────
  const a1 = await closeDeal({
    organizationId: altamira.id, contactId: mariana.id, service: "A", title: "3 plants", taxRate: 0.16,
    problem: "New MES in three plants; supervisors still run shifts on paper and adoption stalls after go-live.",
    lines: [
      { description: "Diagnostic fieldwork (3 plants, 4 weeks)", unitPrice: usd(180_000), estimatedCost: usd(70_000), milestone: "Fieldwork" },
      { description: "Executive readout and adoption roadmap", unitPrice: usd(70_000), estimatedCost: usd(20_000), milestone: "Readout" },
    ],
    sent: -165, accepted: -160, signed: -158, start: -155, end: -118,
  });
  await recognizeRevenue(db, a1.id, { recognizedOn: day(-140), amount: usd(125_000), basis: "milestone", description: "Fieldwork completed (demo)" }, A);
  await recognizeRevenue(db, a1.id, { recognizedOn: day(-120), amount: usd(125_000), basis: "milestone", description: "Readout delivered (demo)" }, A);
  await bill({ organizationId: altamira.id, contractId: a1.id, issue: -140, due: -110, subtotal: usd(125_000), taxRate: 0.16, paid: { on: -115 } });
  await bill({ organizationId: altamira.id, contractId: a1.id, issue: -120, due: -90, subtotal: usd(125_000), taxRate: 0.16, paid: { on: -94 } });
  await setContractStatus(db, a1.id, "completed", A);
  await createExpense(db, { incurredOn: day(-130), vendor: "Associate consultants (Demo)", category: "contractors", amount: usd(80_000), currency: "USD", costType: "direct", contractId: a1.id, ...demo }, A);

  const a2 = await closeDeal({
    organizationId: altamira.id, contactId: ricardo.id, service: "C", title: "Enterprise rollout (4,000 staff)", taxRate: 0.16,
    problem: "Copilot and MES analytics licensed for 4,000 staff; weekly active use under 20% outside headquarters.",
    lines: [
      { description: "Use-case prioritization and 6 plant pilots", unitPrice: usd(720_000), estimatedCost: usd(300_000), milestone: "Pilots" },
      { description: "Capability academy for 1,200 managers", unitPrice: usd(540_000), estimatedCost: usd(230_000), milestone: "Academy" },
      { description: "Adoption measurement and scorecard", unitPrice: usd(300_000), estimatedCost: usd(110_000), milestone: "Scorecard" },
    ],
    sent: -112, accepted: -106, signed: -104, start: -100, end: 160,
  });
  await recognizeRevenue(db, a2.id, { recognizedOn: day(-70), amount: usd(390_000), basis: "milestone", description: "Pilots 1–3 live (demo)" }, A);
  await recognizeRevenue(db, a2.id, { recognizedOn: day(-25), amount: usd(390_000), basis: "milestone", description: "Pilots 4–6 live (demo)" }, A);
  await bill({ organizationId: altamira.id, contractId: a2.id, issue: -70, due: -40, subtotal: usd(390_000), taxRate: 0.16, paid: { on: -42 } });
  await bill({ organizationId: altamira.id, contractId: a2.id, issue: -25, due: 5, subtotal: usd(390_000), taxRate: 0.16 });
  await createExpense(db, { incurredOn: day(-60), vendor: "Associate network — pilots (Demo)", category: "contractors", amount: usd(150_000), currency: "USD", costType: "direct", contractId: a2.id, ...demo }, A);
  await createExpense(db, { incurredOn: day(-20), vendor: "Associate network — academy (Demo)", category: "contractors", amount: usd(140_000), currency: "USD", costType: "direct", contractId: a2.id, ...demo }, A);

  // ── Banco Meridiano · USD 1,680,000 ────────────────────────────────────────────────────────────────────────
  const m1 = await closeDeal({
    organizationId: meridiano.id, contactId: camila.id, service: "D", title: "Operating model and decision rights", taxRate: 0,
    problem: "Digital bank and branch network run two operating models; decisions escalate to the executive committee.",
    lines: [
      { description: "Diagnosis and target operating model", unitPrice: usd(500_000), estimatedCost: usd(190_000), milestone: "Design" },
      { description: "Implementation support (6 months)", unitPrice: usd(700_000), estimatedCost: usd(280_000), milestone: "Implementation" },
    ],
    sent: -85, accepted: -80, signed: -78, start: -75, end: 105,
  });
  await recognizeRevenue(db, m1.id, { recognizedOn: day(-30), amount: usd(480_000), basis: "milestone", description: "Target operating model approved (demo)" }, A);
  await bill({ organizationId: meridiano.id, contractId: m1.id, issue: -30, due: 0, subtotal: usd(480_000), taxRate: 0, paid: { on: -10, amount: usd(240_000) } });
  await createExpense(db, { incurredOn: day(-35), vendor: "Org design specialists (Demo)", category: "contractors", amount: usd(120_000), currency: "USD", costType: "direct", contractId: m1.id, ...demo }, A);

  const m2 = await closeDeal({
    organizationId: meridiano.id, contactId: andres.id, service: "E", title: "Routines for 300 branch managers", taxRate: 0,
    problem: "Branch managers promoted for sales results, without management routines for hybrid teams.",
    lines: [
      { description: "Program design and manager diagnostics", unitPrice: usd(160_000), estimatedCost: usd(50_000), milestone: "Design" },
      { description: "Cohort delivery (3 cohorts × 100 managers)", unitPrice: usd(320_000), estimatedCost: usd(140_000), milestone: "Cohorts" },
    ],
    sent: -30, accepted: -24, signed: -22, start: -14, end: 120,
  });
  await bill({ organizationId: meridiano.id, contractId: m2.id, issue: -14, due: 16, subtotal: usd(144_000), taxRate: 0 });

  // ── Nexa Logistics · USD 810,000 (retainer) ────────────────────────────────────────────────────────────────
  const x1 = await closeDeal({
    organizationId: nexa.id, contactId: jordan.id, service: "G", title: "Transformation Office", taxRate: 0,
    problem: "Two acquisitions integrated on paper, not in decision rights; the CEO needs a standing transformation office.",
    lines: [{ description: "Monthly advisory retainer", quantity: 9, unitPrice: usd(90_000), estimatedCost: usd(315_000), milestone: "Monthly" }],
    sent: -60, accepted: -52, signed: -50, start: -45, end: 225, monthly: usd(90_000),
  });
  await recognizeRevenue(db, x1.id, { recognizedOn: day(-15), amount: usd(90_000), basis: "retainer_month", description: "Month 1 delivered (demo)" }, A);
  await bill({ organizationId: nexa.id, contractId: x1.id, issue: -45, due: -15, subtotal: usd(90_000), taxRate: 0, paid: { on: -20 } });
  await bill({ organizationId: nexa.id, contractId: x1.id, issue: -15, due: -1, subtotal: usd(90_000), taxRate: 0 }); // overdue
  await createExpense(db, { incurredOn: day(-30), vendor: "Senior advisor (Demo)", category: "contractors", amount: usd(35_000), currency: "USD", costType: "direct", contractId: x1.id, ...demo }, A);

  // ── Pipeline: expansion opportunities (not sales) ──────────────────────────────────────────────────────────
  const o6 = count(await createOpportunity(db, {
    organizationId: altamira.id, title: "Phase 2 (2 more plants)", primaryContactId: ricardo.id, serviceId: await svc("C"),
    problemStatement: "Extend the pilots that worked to the Monterrey and Saltillo plants.", amount: usd(900_000), expectedCloseDate: day(35),
    nextAction: "Send pricing after approval", nextActionDate: day(3), ...demo,
  }, A));
  await moveOpportunityStage(db, o6.id, await stage("proposal_development"), A);
  const p6 = count(await createProposalFromOpportunity(db, o6.id, A));
  await updateProposal(db, p6.id, { patch: { taxRate: 0.16 }, lines: [
    { description: "Pilots in 2 additional plants", quantity: 1, unitPrice: usd(600_000), estimatedCost: usd(250_000) },
    { description: "Academy extension (400 managers)", quantity: 1, unitPrice: usd(300_000), estimatedCost: usd(120_000) },
  ] }, A);
  await submitProposalForApproval(db, p6.id, A); // left pending: the founder decides

  count(await createOpportunity(db, {
    organizationId: nexa.id, title: "Site managers program", primaryContactId: jordan.id, serviceId: await svc("E"),
    problemStatement: "Site managers from the acquired companies run different routines.", amount: usd(650_000),
    expectedCloseDate: day(60), nextAction: "Follow up on discovery notes", nextActionDate: day(-4), stageId: await stage("qualified"), ...demo,
  }, A));

  // Interactions (records only — demo)
  await logActivity(db, { type: "meeting", direction: "internal", subject: "Quarterly business review", occurredAt: ts(-9), contactId: ricardo.id, ...demo }, A);
  await logActivity(db, { type: "meeting", direction: "internal", subject: "Steering committee — operating model", occurredAt: ts(-6), contactId: camila.id, ...demo }, A);
  await logActivity(db, { type: "email", direction: "inbound", subject: "Question about invoice for month 2", occurredAt: ts(-2), contactId: jordan.id, ...demo }, A);
  n += 3;

  // Overhead
  await createExpense(db, { incurredOn: day(-15), vendor: "LLM API (Demo)", category: "ai_api", amount: usd(1_800), currency: "USD", costType: "overhead", recurrence: "monthly", ...demo }, A);
  await createExpense(db, { incurredOn: day(-14), vendor: "CRM/SaaS tools (Demo)", category: "saas", amount: usd(990), currency: "USD", costType: "overhead", recurrence: "monthly", ...demo }, A);
  await createExpense(db, { incurredOn: day(18), vendor: "Industry conference stand (Demo)", category: "marketing", amount: usd(15_000), currency: "USD", costType: "overhead", status: "planned", ...demo }, A);
  n += 3;
  return n;
}
