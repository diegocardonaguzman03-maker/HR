/**
 * PRAXIA's real backlog as recorded in the repository on 2026-10-09: work the agents already delivered (with the
 * file where each output lives) and work that is genuinely pending (QA/risk reviews, open founder decisions).
 * Importing it creates normal task records — completed ones with their output, pending ones queued. Nothing is
 * marked as in progress: that only happens when the founder (or, in Phase 2, the engine) starts a task.
 */
import { and, eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { agentEvents, agents, agentTasks, type TaskPriority } from "../db/schema";
import { audit, nowIso } from "../services/common";
import { createTask } from "../services/agents";

export const BACKLOG_ACTOR = "system:backlog-import";
const PRX12 = "praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial";

type Item = { agentId: string; title: string; instructions: string; priority?: TaskPriority; dueDate?: string; output?: string };

export const BACKLOG: readonly Item[] = [
  // Delivered (outputs are in the repository)
  { agentId: "SAL-02", title: "PRX-0012 · Prospect bases for 6 sectors", instructions: "123 companies, 133 contacts; emails not verified.", output: `${PRX12}/0N-*/base-*.csv` },
  { agentId: "RES-01", title: "PRX-0012 · Evidence by sector (A1–A21)", instructions: "21 approved figures with sources; Deloitte and Gartner wording corrected.", output: `${PRX12}/00-evidencia/evidencia-por-sector.md` },
  { agentId: "DSN-01", title: "PRX-0012 · Master deck and deck builder", instructions: "PRAXIA-branded master deck, pptxgenjs builder with content schema.", output: `${PRX12}/00-maestro/deck-praxia-maestro.pptx` },
  { agentId: "MKT-02", title: "PRX-0012 · Six sector decks and messaging", instructions: "One deck per sector plus thesis, hook and objections per sector.", output: `${PRX12}/deck-builder/content/MENSAJES.md` },
  { agentId: "DEV-02", title: "Command Center · Phase 0 + 1 revenue slice", instructions: "CRM, proposals, contracts, invoicing, dashboard, PRAXIA World.", output: "apps/praxia-command-center" },
  // Pending
  { agentId: "QA-01", title: "Quality review of the PRX-0012 decks", instructions: "Sources, brand fidelity, consistency; release recommendation.", priority: "high", dueDate: "2026-10-13" },
  { agentId: "RISK-01", title: "Claims and privacy review of PRX-0012", instructions: "Decks' claims and the contact bases before any first send.", priority: "high", dueDate: "2026-10-13" },
  { agentId: "SAL-02", title: "Verify contact emails before the first send", instructions: "Every email is still [unknown pattern]@domain and marked NOT VERIFIED.", priority: "high" },
  { agentId: "DSN-01", title: "Put the real contact channel in the 7 decks", instructions: "Waiting for the founder to give the channel ([CONTACT CHANNEL — TO COMPLETE]).", priority: "normal" },
  { agentId: "RES-01", title: "Second evidence round for sectors 04–06", instructions: "Needs the founder's go-ahead (proposed deadline 2026-10-13).", priority: "normal", dueDate: "2026-10-13" },
  { agentId: "FIN-01", title: "Recommendation for D-P05: what the USD 10k goal measures", instructions: "Options: recognized revenue, net collections, contracted.", priority: "normal", dueDate: "2026-10-16" },
  { agentId: "CEO-01", title: "Decision brief for D-P02, D-P03 and D-P06", instructions: "Service names, business backlog, Command Center language.", priority: "normal", dueDate: "2026-10-16" },
  { agentId: "DEV-03", title: "Phase 2 · Connect the agent execution engine", instructions: "LLM provider credentials and tool permissions; agents then run tasks on their own.", priority: "low" },
];

/** Idempotent: an item whose agent already has a task with the same title is skipped. Returns how many were created. */
export async function importBacklog(db: DB, actor: string = BACKLOG_ACTOR): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  for (const item of BACKLOG) {
    const [agent] = await db.select().from(agents).where(eq(agents.id, item.agentId));
    const [exists] = await db.select({ id: agentTasks.id }).from(agentTasks).where(and(eq(agentTasks.agentId, item.agentId), eq(agentTasks.title, item.title)));
    if (!agent?.active || exists) { skipped++; continue; }
    if (item.output) {
      const now = nowIso();
      const [task] = await db
        .insert(agentTasks)
        .values({ agentId: item.agentId, title: item.title, instructions: item.instructions, origin: "orchestrator", priority: item.priority ?? "normal", status: "completed", progress: 100, output: item.output, completedAt: now })
        .returning();
      await db.insert(agentEvents).values({ agentId: item.agentId, taskId: task!.id, type: "task_completed", message: "Imported from the repository record (delivered 2026-10-09)" });
      await audit(db, actor, "task.import", "agent_task", task!.id, null, task);
    } else {
      await createTask(db, { agentId: item.agentId, title: item.title, instructions: item.instructions, origin: "orchestrator", priority: item.priority ?? "normal", dueDate: item.dueDate ?? null }, actor);
    }
    created++;
  }
  return { created, skipped };
}
