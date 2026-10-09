/**
 * Base configuration seed (idempotent). Seeds ONLY configuration: company settings, pipeline stages,
 * editable service definitions and the 28-agent registry. It never creates clients, revenue or activity.
 */
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { agents, companySettings, pipelineStages, services, type AvatarConfig } from "../db/schema";
import agentSeed from "./agents.json";

export const STAGES: { key: string; name: string; p: number; kind: "open" | "won" | "lost"; required: string[] }[] = [
  { key: "identified", name: "Identified", p: 0.02, kind: "open", required: [] },
  { key: "researched", name: "Researched", p: 0.03, kind: "open", required: [] },
  { key: "contacted", name: "Contacted", p: 0.05, kind: "open", required: ["primaryContactId"] },
  { key: "engaged", name: "Engaged", p: 0.1, kind: "open", required: ["primaryContactId"] },
  { key: "qualified", name: "Qualified", p: 0.2, kind: "open", required: ["primaryContactId", "problemStatement"] },
  { key: "discovery_scheduled", name: "Discovery Scheduled", p: 0.25, kind: "open", required: ["primaryContactId", "nextActionDate"] },
  { key: "discovery_completed", name: "Discovery Completed", p: 0.35, kind: "open", required: ["primaryContactId", "problemStatement"] },
  { key: "proposal_development", name: "Proposal Development", p: 0.45, kind: "open", required: ["amount", "serviceId"] },
  { key: "proposal_sent", name: "Proposal Sent", p: 0.55, kind: "open", required: ["amount", "serviceId", "expectedCloseDate"] },
  { key: "negotiation", name: "Negotiation", p: 0.75, kind: "open", required: ["amount", "expectedCloseDate"] },
  { key: "closed_won", name: "Closed Won", p: 1, kind: "won", required: ["amount"] },
  { key: "closed_lost", name: "Closed Lost", p: 0, kind: "lost", required: ["lostReason"] },
];

/** PRD v3.0 §2.4 offerings. Prices only where the PRAXIA skill states a range; everything is "proposed". */
export const SERVICES: { code: string; name: string; description: string; pricingModel: "fixed" | "milestone" | "retainer"; priceMin: number | null; priceMax: number | null; typicalWeeks: string | null }[] = [
  { code: "A", name: "Transformation Diagnostic", description: "Evaluate strategic alignment, organizational readiness, adoption barriers, leadership behaviors and execution gaps.", pricingModel: "fixed", priceMin: 800_000, priceMax: 1_500_000, typicalWeeks: "3–5 weeks" },
  { code: "B", name: "Adoption Architecture", description: "Design operating models, governance, behaviors, routines, communication systems and transformation enablement.", pricingModel: "milestone", priceMin: null, priceMax: null, typicalWeeks: null },
  { code: "C", name: "AI Adoption Accelerator", description: "Use-case prioritization, capability development, workflow redesign, management practices and adoption measurement.", pricingModel: "milestone", priceMin: null, priceMax: null, typicalWeeks: "6–12 weeks" },
  { code: "D", name: "Organizational Effectiveness Advisory", description: "Improve structures, accountability, performance routines, decision-making and execution.", pricingModel: "milestone", priceMin: null, priceMax: null, typicalWeeks: null },
  { code: "E", name: "Leadership & Capability Transformation", description: "Develop the managerial and organizational capabilities required to execute business strategy.", pricingModel: "milestone", priceMin: null, priceMax: null, typicalWeeks: null },
  { code: "F", name: "Transformation Analytics", description: "Adoption metrics, scorecards, analytical dashboards and performance measurement systems.", pricingModel: "fixed", priceMin: null, priceMax: null, typicalWeeks: null },
  { code: "G", name: "Strategic Advisory Retainer", description: "Ongoing executive advisory, implementation guidance, reviews and transformation oversight.", pricingModel: "retainer", priceMin: null, priceMax: null, typicalWeeks: "Monthly (min. 3 months)" },
];

type AgentSeed = Omit<typeof agentSeed[number], "avatar"> & { avatar: AvatarConfig };

export async function seedBase(db: DB) {
  const existing = await db.select().from(companySettings).where(eq(companySettings.id, 1));
  if (!existing.length) await db.insert(companySettings).values({ id: 1 });

  for (const [i, s] of STAGES.entries()) {
    await db
      .insert(pipelineStages)
      .values({ key: s.key, name: s.name, position: i + 1, defaultProbability: s.p, kind: s.kind, requiredFields: s.required })
      .onConflictDoNothing({ target: pipelineStages.key });
  }

  for (const s of SERVICES) {
    await db.insert(services).values({ ...s, currency: "USD", pricingStatus: "proposed" }).onConflictDoNothing({ target: services.code });
  }

  for (const a of agentSeed as AgentSeed[]) {
    await db.insert(agents).values(a).onConflictDoNothing({ target: agents.id });
  }
}
