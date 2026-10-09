/**
 * Demonstration dataset. Fictional organizations and people ("(Demo)" in every name, example.com domains).
 * Created THROUGH the same service layer as real data, so every business rule is exercised.
 * Every row carries is_demo = true. No agent activity is simulated: demo mode never fakes agent work.
 */
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { organizations, pipelineStages, services } from "../db/schema";
import { createContact, createOpportunity, createOrganization, logActivity, moveOpportunityStage } from "../services/crm";
import { acceptProposal, createProposalFromOpportunity, decideApproval, markProposalSent, recognizeRevenue, signContract, submitProposalForApproval, updateProposal } from "../services/commercial";
import { createExpense, createInvoice, issueInvoice, recordPayment } from "../services/finance";
import { DEMO_ACTOR as A } from "../services/common";

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const ts = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString();

export async function seedDemo(db: DB): Promise<number> {
  const already = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.isDemo, true));
  if (already.length) return 0;
  const stage = async (key: string) => (await db.select().from(pipelineStages).where(eq(pipelineStages.key, key)))[0]!.id;
  const svc = async (code: string) => (await db.select().from(services).where(eq(services.code, code)))[0]!.id;
  const demo = { isDemo: true } as const;
  let n = 0;
  const count = <T,>(x: T) => (n++, x);

  // Organizations
  const norte = count(await createOrganization(db, { name: "Norte Manufacturing (Demo)", domain: "norte-demo.example.com", industry: "Manufacturing", country: "MX", sizeBand: "1,000–5,000", ...demo }, A));
  const andes = count(await createOrganization(db, { name: "Andes Retail Group (Demo)", domain: "andes-demo.example.com", industry: "Retail", country: "CO", sizeBand: "5,000+", ...demo }, A));
  const pacific = count(await createOrganization(db, { name: "Pacific Logistics (Demo)", domain: "pacific-demo.example.com", industry: "Logistics", country: "US", sizeBand: "500–1,000", ...demo }, A));
  const sierra = count(await createOrganization(db, { name: "Sierra Health (Demo)", domain: "sierra-demo.example.com", industry: "Healthcare", country: "MX", sizeBand: "1,000–5,000", ...demo }, A));

  // Contacts (fictional)
  const c1 = count(await createContact(db, { organizationId: norte.id, fullName: "Laura Méndez (Demo)", title: "Chief People Officer", email: "laura@norte-demo.example.com", lawfulBasis: "legitimate_interest", ...demo }, A));
  const c2 = count(await createContact(db, { organizationId: andes.id, fullName: "Diego Ríos (Demo)", title: "Head of Transformation", email: "diego@andes-demo.example.com", lawfulBasis: "legitimate_interest", ...demo }, A));
  const c3 = count(await createContact(db, { organizationId: pacific.id, fullName: "Sam Carter (Demo)", title: "COO", email: "sam@pacific-demo.example.com", lawfulBasis: "legitimate_interest", ...demo }, A));
  const c4 = count(await createContact(db, { organizationId: sierra.id, fullName: "Patricia Vega (Demo)", title: "CEO", email: "patricia@sierra-demo.example.com", lawfulBasis: "existing_relationship", ...demo }, A));

  // Activities (records of interactions — demo only)
  await logActivity(db, { type: "linkedin", direction: "outbound", subject: "Connection note (sent manually)", occurredAt: ts(-20), contactId: c2.id, ...demo }, A);
  await logActivity(db, { type: "linkedin", direction: "inbound", subject: "Reply: interested in AI adoption gap", occurredAt: ts(-18), contactId: c2.id, ...demo }, A);
  await logActivity(db, { type: "email", direction: "outbound", subject: "Intro email (sent manually)", occurredAt: ts(-12), contactId: c3.id, ...demo }, A);
  await logActivity(db, { type: "meeting", direction: "internal", subject: "Discovery call", occurredAt: ts(-6), contactId: c1.id, ...demo }, A);
  n += 4;

  // 1) Won deal with signed contract, revenue, invoices and payment (Norte)
  const o1 = count(
    await createOpportunity(db, {
      organizationId: norte.id, title: "Transformation Diagnostic", primaryContactId: c1.id, serviceId: await svc("A"),
      problemStatement: "New MES rolled out in 3 plants; supervisors still run shifts on paper.", amount: 1_200_000, expectedCloseDate: day(-10), ...demo,
    }, A),
  );
  const p1 = count(await createProposalFromOpportunity(db, o1.id, A));
  await updateProposal(db, p1.id, { lines: [{ description: "Transformation Diagnostic — 4 weeks", quantity: 1, unitPrice: 1_200_000, estimatedCost: 450_000 }] }, A);
  const a1 = await submitProposalForApproval(db, p1.id, A);
  await decideApproval(db, a1.id, "approved", "Demo approval (seed, not a founder decision)", A);
  await markProposalSent(db, p1.id, day(-25), A);
  const k1 = count(await acceptProposal(db, p1.id, { acceptedOn: day(-21), evidence: "DEMO — signed proposal reference" }, A));
  await signContract(db, k1.id, { signedAt: day(-20), evidence: "DEMO — countersigned contract reference", startDate: day(-19), endDate: day(10) }, A);
  await recognizeRevenue(db, k1.id, { recognizedOn: day(-5), amount: 600_000, basis: "milestone", description: "Fieldwork completed (demo)" }, A);
  const i1 = count(await createInvoice(db, { organizationId: norte.id, contractId: k1.id, issueDate: day(-19), dueDate: day(-4), currency: "USD", subtotal: 600_000, taxRate: 0.16, ...demo }, A));
  await issueInvoice(db, i1.id, A);
  await recordPayment(db, i1.id, { receivedOn: day(-8), amount: 300_000, currency: "USD", reference: "DEMO" }, A);
  await createExpense(db, { incurredOn: day(-7), vendor: "Associate consultant (Demo)", category: "contractors", amount: 200_000, currency: "USD", costType: "direct", contractId: k1.id, ...demo }, A);
  n += 3;

  // 2) Proposal awaiting founder approval (Andes)
  const o2 = count(
    await createOpportunity(db, {
      organizationId: andes.id, title: "AI Adoption Accelerator", primaryContactId: c2.id, serviceId: await svc("C"),
      problemStatement: "Copilot licenses for 2,000 staff; weekly active use under target.", amount: 3_500_000, expectedCloseDate: day(25),
      nextAction: "Send pricing after approval", nextActionDate: day(2), ...demo,
    }, A),
  );
  await moveOpportunityStage(db, o2.id, await stage("proposal_development"), A);
  const p2 = count(await createProposalFromOpportunity(db, o2.id, A));
  await updateProposal(db, p2.id, {
    lines: [
      { description: "Use-case prioritization & pilots (8 weeks)", quantity: 1, unitPrice: 2_800_000, estimatedCost: 1_200_000 },
      { description: "Adoption measurement", quantity: 1, unitPrice: 700_000, estimatedCost: 300_000 },
    ],
  }, A);
  await submitProposalForApproval(db, p2.id, A);

  // 3) Overdue follow-up (Pacific)
  count(
    await createOpportunity(db, {
      organizationId: pacific.id, title: "Operating model redesign", primaryContactId: c3.id, serviceId: await svc("D"),
      problemStatement: "Two acquisitions integrated on paper, not in decision rights.", amount: 2_500_000, currency: "USD",
      expectedCloseDate: day(40), nextAction: "Follow up on discovery notes", nextActionDate: day(-6), stageId: await stage("qualified"), ...demo,
    }, A),
  );

  // 4) MXN opportunity (Sierra) — converts only if a USD/MXN rate exists
  count(
    await createOpportunity(db, {
      organizationId: sierra.id, title: "Leadership & Capability Transformation", primaryContactId: c4.id, serviceId: await svc("E"),
      problemStatement: "Clinical managers promoted without management routines.", amount: 45_000_000, currency: "MXN",
      expectedCloseDate: day(55), nextAction: "Discovery workshop", nextActionDate: day(5), stageId: await stage("discovery_scheduled"), ...demo,
    }, A),
  );

  // Overhead
  await createExpense(db, { incurredOn: day(-15), vendor: "LLM API (Demo)", category: "ai_api", amount: 18_000, currency: "USD", costType: "overhead", recurrence: "monthly", ...demo }, A);
  await createExpense(db, { incurredOn: day(-14), vendor: "CRM/SaaS tools (Demo)", category: "saas", amount: 9_900, currency: "USD", costType: "overhead", recurrence: "monthly", ...demo }, A);
  await createExpense(db, { incurredOn: day(12), vendor: "Conference stand (Demo)", category: "marketing", amount: 150_000, currency: "USD", costType: "overhead", status: "planned", ...demo }, A);
  n += 3;
  return n;
}
