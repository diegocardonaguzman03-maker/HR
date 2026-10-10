import { eq } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { pipelineStages, services, CURRENCIES } from "../db/schema";
import { audit, BusinessRuleError, nowIso, type Actor } from "./common";

export const serviceInput = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000),
  pricingModel: z.enum(["fixed", "milestone", "retainer"]),
  priceMin: z.number().int().positive().nullable(),
  priceMax: z.number().int().positive().nullable(),
  currency: z.enum(CURRENCIES),
  typicalWeeks: z.string().trim().max(100).nullable(),
  pricingStatus: z.enum(["proposed", "validated"]),
  active: z.boolean(),
});

/** Service definitions are editable configuration (PRD §2.4), never fixed products. */
export async function updateService(db: DB, id: string, raw: z.input<typeof serviceInput>, actor: Actor = "founder") {
  const input = serviceInput.parse(raw);
  if (input.priceMin && input.priceMax && input.priceMax < input.priceMin) throw new BusinessRuleError("Maximum price must be ≥ minimum price.");
  const [before] = await db.select().from(services).where(eq(services.id, id));
  if (!before) throw new BusinessRuleError("Service not found.");
  const [after] = await db.update(services).set({ ...input, updatedAt: nowIso() }).where(eq(services.id, id)).returning();
  await audit(db, actor, "service.update", "service", id, before, after);
  return after!;
}

export const stageInput = z.object({ name: z.string().trim().min(2).max(60), defaultProbability: z.number().min(0).max(1) });

/** Stages are customizable (name + default probability). Won/lost stages keep 100% / 0%. */
export async function updateStage(db: DB, id: string, raw: z.input<typeof stageInput>, actor: Actor = "founder") {
  const input = stageInput.parse(raw);
  const [before] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, id));
  if (!before) throw new BusinessRuleError("Stage not found.");
  if (before.kind !== "open" && input.defaultProbability !== before.defaultProbability) throw new BusinessRuleError("Closed stages keep a fixed probability (won 100%, lost 0%).");
  const [after] = await db.update(pipelineStages).set(input).where(eq(pipelineStages.id, id)).returning();
  await audit(db, actor, "stage.update", "pipeline_stage", id, before, after);
  return after!;
}
