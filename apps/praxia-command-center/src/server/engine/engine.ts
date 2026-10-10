/**
 * Phase 2 autonomous engine.
 *
 * planWork  — turns the funnel into agent tasks (account briefs, 1:1 drafts for cleared contacts, next steps for
 *             open opportunities). Idempotent: an account/contact/opportunity never gets a second open task.
 * runEngine — executes queued tasks with an LLM provider, as the assigned agent. Every output goes to
 *             waiting_approval with a row in the founder's inbox; the engine never completes, sends or publishes.
 *
 * Guardrails: founder-only configuration, hard daily budget, outreach only for contacts cleared under D-P07,
 * no tool that reaches outside PRAXIA, every step audited and visible in PRAXIA World.
 */
import fs from "node:fs";
import path from "node:path";
import { and, asc, desc, eq, gte, inArray, isNull, ne } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { agents, agentTasks, approvals, companySettings, contacts, engineRuns, opportunities, organizations, pipelineStages, type EngineConfig } from "../db/schema";
import { audit, BusinessRuleError, nowIso, type Actor } from "../services/common";
import { createTask, ensureTaskApproval, updateTask, updateTaskStatus } from "../services/agents";
import { outreachGate } from "../services/funnel";
import { compareTasks } from "@/domain/tasks";
import { isCleared } from "@/domain/funnel";
import type { EngineProvider } from "./types";

export const ENGINE_ACTOR_PREFIX = "engine:";
const OUTREACH_PREFIX = "Outreach draft: ";
const BRIEF_PREFIX = "Account brief: ";
const NEXT_PREFIX = "Next step plan: ";
const PLAN_LIMITS = { briefs: 5, drafts: 5, nextSteps: 5 };

export const engineConfigInput = z.object({
  enabled: z.boolean(),
  maxTasksPerRun: z.number().int().min(1).max(10),
  dailyBudgetUsdMicros: z.number().int().min(0).max(100_000_000),
});

export async function getEngineConfig(db: DB): Promise<EngineConfig> {
  const [s] = await db.select({ c: companySettings.engineConfig }).from(companySettings).where(eq(companySettings.id, 1));
  return s?.c ?? { enabled: false, maxTasksPerRun: 3, dailyBudgetUsdMicros: 2_000_000 };
}

export async function setEngineConfig(db: DB, raw: z.input<typeof engineConfigInput>, actor: Actor = "founder") {
  if (actor !== "founder") throw new BusinessRuleError("Only the founder configures the engine.");
  const cfg = engineConfigInput.parse(raw);
  const before = await getEngineConfig(db);
  await db.update(companySettings).set({ engineConfig: cfg, updatedAt: nowIso() }).where(eq(companySettings.id, 1));
  await audit(db, actor, "engine.config", "engine", "config", before, cfg);
  return cfg;
}

export async function spentToday(db: DB) {
  const today = nowIso().slice(0, 10);
  const runs = await db.select({ c: engineRuns.costUsdMicros }).from(engineRuns).where(gte(engineRuns.startedAt, today));
  return runs.reduce((s, r) => s + r.c, 0);
}

export async function getEngineStatus(db: DB, provider: EngineProvider) {
  const config = await getEngineConfig(db);
  const spent = await spentToday(db);
  const queued = (await db.select({ id: agentTasks.id }).from(agentTasks).where(eq(agentTasks.status, "queued"))).length;
  const runs = await db.select().from(engineRuns).orderBy(desc(engineRuns.startedAt)).limit(8);
  return { config, spentToday: spent, queued, runs, provider: { name: provider.name, model: provider.model, available: provider.available, reason: provider.reason ?? null } };
}

/** Creates the next batch of funnel work for the agents. Returns what was created and what stays blocked. */
export async function planWork(db: DB, actor: Actor = "founder", origin: "decision_feed" | "orchestrator" = "decision_feed") {
  const open = await db.select({ entityId: agentTasks.entityId, title: agentTasks.title }).from(agentTasks).where(inArray(agentTasks.status, ["queued", "working", "waiting_input", "waiting_approval", "error"]));
  const done = await db.select({ entityId: agentTasks.entityId, title: agentTasks.title }).from(agentTasks).where(eq(agentTasks.status, "completed"));
  const has = (rows: typeof open, prefix: string, id: string) => rows.some((r) => r.entityId === id && r.title.startsWith(prefix));
  const created: { agentId: string; title: string }[] = [];
  const blocked: string[] = [];
  const add = async (agentId: string, title: string, instructions: string, entityType: string, entityId: string, priority: "normal" | "high") => {
    await createTask(db, { agentId, title, instructions, entityType, entityId, priority, origin }, actor);
    created.push({ agentId, title });
  };

  // 1. Account briefs for the best-fit accounts that have none (internal research — no contact involved).
  const targets = await db.select().from(organizations).where(and(eq(organizations.isDemo, false), inArray(organizations.lifecycle, ["target", "prospect"]), gte(organizations.fitScore, 4))).orderBy(desc(organizations.fitScore), asc(organizations.name));
  let n = 0;
  for (const o of targets) {
    if (n >= PLAN_LIMITS.briefs) break;
    if (has(open, BRIEF_PREFIX, o.id) || has(done, BRIEF_PREFIX, o.id)) continue;
    await add("SAL-02", `${BRIEF_PREFIX}${o.name}`, "One-page internal account brief: why now (trigger, with its source), hypothesis of the adoption problem, which PRAXIA offer fits, who decides, risks and conflicts of interest to check, and the single next step. Mark anything unverified as [Supuesto]. Internal use only — do not draft any message.", "organization", o.id, "high");
    n++;
  }

  // 2. 1:1 drafts — only for contacts cleared under D-P07, within the pilot cap.
  const gate = await outreachGate(db);
  if (!gate.open) blocked.push(`Outreach drafts: ${gate.reason}`);
  else {
    const room = gate.cap === null ? PLAN_LIMITS.drafts : Math.min(PLAN_LIMITS.drafts, gate.cap - gate.used);
    const cs = await db.select({ c: contacts, org: organizations }).from(contacts).innerJoin(organizations, eq(contacts.organizationId, organizations.id)).where(and(eq(contacts.isDemo, false), inArray(contacts.leadStatus, ["new", "researched"]))).orderBy(desc(organizations.fitScore));
    n = 0;
    for (const { c, org } of cs) {
      if (n >= room) break;
      if (!isCleared(c, gate) || has(open, OUTREACH_PREFIX, c.id) || has(done, OUTREACH_PREFIX, c.id)) continue;
      await add("SAL-02", `${OUTREACH_PREFIX}${c.fullName} (${org.name})`, "Draft ONE personalized 1:1 first message (LinkedIn or email, ≤ 120 words, Spanish unless the account works in English). Open with the account's verified trigger, offer one useful idea, ask for a 20-minute conversation. No attachments, no pricing, no claims without evidence. The founder reviews and sends it himself.", "contact", c.id, "high");
      n++;
    }
    if (!n) blocked.push("Outreach drafts: no cleared contact without a draft — clear pilot contacts on the Funnel page.");
  }

  // 3. Open real opportunities without a next action.
  const opps = await db.select({ o: opportunities }).from(opportunities).innerJoin(pipelineStages, eq(opportunities.stageId, pipelineStages.id)).where(and(eq(opportunities.isDemo, false), eq(pipelineStages.kind, "open"), isNull(opportunities.nextAction)));
  n = 0;
  for (const { o } of opps) {
    if (n >= PLAN_LIMITS.nextSteps) break;
    if (has(open, NEXT_PREFIX, o.id)) continue;
    await add("SAL-01", `${NEXT_PREFIX}${o.title}`, "Propose the single next step that moves this opportunity forward (who, what, by when), the qualification gaps and the risk. Do not contact the client.", "opportunity", o.id, "normal");
    n++;
  }
  await audit(db, actor, "engine.plan", "engine", "plan", null, { created: created.length, blocked });
  return { created, blocked };
}

function readInstructions(p: string): string {
  // Server: the repo root is two levels above the app. Artifact: instruction files are embedded under /repo.
  const bases = ["/repo", typeof process !== "undefined" && typeof process.cwd === "function" ? path.resolve(process.cwd(), "../..") : ""];
  for (const base of bases) {
    if (!base) continue;
    try {
      const file = path.join(base, p);
      if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").slice(0, 12_000);
    } catch { /* try the next location */ }
  }
  return "";
}

async function contextFor(db: DB, t: typeof agentTasks.$inferSelect): Promise<string> {
  const orgLine = (o: typeof organizations.$inferSelect) => `Organization: ${o.name} · ${o.industry ?? "industry unknown"} · ${o.country ?? "country unknown"} · size ${o.sizeBand ?? "unknown"} · ICP fit ${o.fitScore ?? "—"}/5 · website ${o.website ?? "—"}\nResearch notes (from PRX-0012, unverified unless a source is given):\n${o.notes}`;
  if (t.entityType === "organization" && t.entityId) {
    const [o] = await db.select().from(organizations).where(eq(organizations.id, t.entityId));
    const cs = o ? await db.select({ fullName: contacts.fullName, title: contacts.title }).from(contacts).where(eq(contacts.organizationId, o.id)) : [];
    return o ? `${orgLine(o)}\nKnown people (names and roles only): ${cs.map((c) => `${c.fullName} — ${c.title ?? "role unknown"}`).join("; ") || "none"}` : "";
  }
  if (t.entityType === "contact" && t.entityId) {
    const [r] = await db.select({ c: contacts, o: organizations }).from(contacts).leftJoin(organizations, eq(contacts.organizationId, organizations.id)).where(eq(contacts.id, t.entityId));
    return r ? `Recipient: ${r.c.fullName} — ${r.c.title ?? "role unknown"}\n${r.o ? orgLine(r.o) : ""}` : "";
  }
  if (t.entityType === "opportunity" && t.entityId) {
    const [o] = await db.select().from(opportunities).where(eq(opportunities.id, t.entityId));
    return o ? `Opportunity: ${o.title}\nProblem: ${o.problemStatement || "not recorded"}\nProposed solution: ${o.proposedSolution || "not recorded"}\nRisks: ${o.risks || "not recorded"}\nExpected close: ${o.expectedCloseDate ?? "not set"}` : "";
  }
  return "";
}

export async function buildPrompt(db: DB, t: typeof agentTasks.$inferSelect) {
  const [a] = await db.select().from(agents).where(eq(agents.id, t.agentId));
  if (!a) throw new BusinessRuleError(`Unknown agent ${t.agentId}.`);
  const system = [
    `You are ${a.id} · ${a.displayName}, ${a.role} at PRAXIA (Human & AI Transformation Advisory, Mexico/LATAM), team ${a.team}, reporting to ${a.reportsTo}.`,
    a.description,
    readInstructions(a.instructionsPath),
    "Operating rules (non-negotiable):",
    "- Write in Mexican Spanish, executive and concrete: key message first, then detail. Markdown, at most ~600 words.",
    "- You cannot send, publish or contact anyone. You prepare work; the founder decides and acts.",
    "- Never invent facts, figures, quotes, clients or results. Anything not supported by the context is marked [Supuesto]. Cite the source URL when the context gives one.",
    "- Do not include personal data beyond a person's name and business role. Never guess email addresses.",
    `- If the work needs a founder decision, end with "## Decisión requerida del Founder" (options A/B/C, recommendation, risk, deadline). Escalation: ${a.escalationRules}`,
  ].filter(Boolean).join("\n\n");
  const ctx = await contextFor(db, t);
  const prompt = `Task: ${t.title}\n\nInstructions:\n${t.instructions || "(none)"}\n\n${ctx ? `Context from the PRAXIA CRM:\n${ctx}` : ""}`.trim();
  return { system, prompt };
}

async function nextTask(db: DB) {
  const queued = await db.select().from(agentTasks).where(eq(agentTasks.status, "queued"));
  const busy = new Set((await db.select({ a: agentTasks.agentId }).from(agentTasks).where(eq(agentTasks.status, "working"))).map((r) => r.a));
  return queued.filter((t) => !busy.has(t.agentId)).sort(compareTasks)[0] ?? null;
}

/** Executes up to `max` queued tasks. Founder-triggered runs work even when the scheduled engine is disabled. */
export async function runEngine(db: DB, provider: EngineProvider, opts: { max?: number; trigger?: "founder" | "schedule" } = {}, actor: Actor = "founder") {
  const trigger = opts.trigger ?? "founder";
  if (trigger === "founder" && actor !== "founder") throw new BusinessRuleError("Only the founder starts a manual engine run.");
  if (!provider.available) throw new BusinessRuleError(provider.reason ?? "The engine provider is not available.");
  const config = await getEngineConfig(db);
  if (trigger === "schedule" && !config.enabled) throw new BusinessRuleError("The engine is turned off.");
  const max = Math.min(opts.max ?? config.maxTasksPerRun, config.maxTasksPerRun);
  const engineActor = `${ENGINE_ACTOR_PREFIX}${provider.name}`;
  const [run] = await db.insert(engineRuns).values({ provider: provider.name, model: provider.model, trigger }).returning();
  let spent = await spentToday(db);
  const results: { taskId: string; agentId: string; title: string; status: "waiting_approval" | "error"; note: string }[] = [];
  let cost = 0;
  let stop = "";
  for (let i = 0; i < max; i++) {
    if (spent >= config.dailyBudgetUsdMicros) { stop = "Daily budget reached."; break; }
    const t = await nextTask(db);
    if (!t) { stop = "Queue empty."; break; }
    await updateTaskStatus(db, t.id, "working", {}, engineActor);
    await updateTask(db, t.id, { progress: 15 }, engineActor);
    try {
      const { system, prompt } = await buildPrompt(db, t);
      const out = await provider.complete({ system, prompt });
      await updateTask(db, t.id, { progress: 90 }, engineActor);
      const isDraft = t.entityType === "contact" && t.title.startsWith(OUTREACH_PREFIX);
      if (isDraft) await requestOutreachApproval(db, t, out.text, engineActor);
      await updateTaskStatus(db, t.id, "waiting_approval", { output: out.text, costUsdMicros: out.costUsdMicros }, engineActor);
      cost += out.costUsdMicros; spent += out.costUsdMicros;
      results.push({ taskId: t.id, agentId: t.agentId, title: t.title, status: "waiting_approval", note: isDraft ? "Draft waiting for your approval" : "Output waiting for your approval" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await updateTaskStatus(db, t.id, "error", { error: msg.slice(0, 500) }, engineActor);
      results.push({ taskId: t.id, agentId: t.agentId, title: t.title, status: "error", note: msg.slice(0, 200) });
    }
  }
  const failed = results.filter((r) => r.status === "error").length;
  await db.update(engineRuns).set({ finishedAt: nowIso(), tasksRun: results.length, tasksFailed: failed, costUsdMicros: cost, note: stop }).where(eq(engineRuns.id, run!.id));
  await audit(db, actor === "founder" ? "founder" : engineActor, "engine.run", "engine", run!.id, null, { provider: provider.name, tasks: results.length, failed, costUsdMicros: cost, stop });
  return { runId: run!.id, results, costUsdMicros: cost, stop };
}

async function requestOutreachApproval(db: DB, t: typeof agentTasks.$inferSelect, draft: string, actor: Actor) {
  const [r] = await db.select({ c: contacts, o: organizations }).from(contacts).leftJoin(organizations, eq(contacts.organizationId, organizations.id)).where(eq(contacts.id, t.entityId!));
  if (!r) throw new Error("Contact no longer exists.");
  // Re-check the gate at the moment of drafting (the founder may have changed D-P07 or the contact meanwhile).
  const gate = await outreachGate(db);
  if (!isCleared(r.c, gate)) throw new Error(`Not cleared to contact: ${gate.open ? "lawful basis not assessed or do-not-contact" : gate.reason}`);
  const [existing] = await db.select({ id: approvals.id }).from(approvals).where(and(eq(approvals.entityType, "agent_task"), eq(approvals.entityId, t.id), eq(approvals.status, "pending")));
  if (existing) return existing.id;
  const [a] = await db.insert(approvals).values({
    kind: "outbound_message",
    title: `1:1 draft for ${r.c.fullName}${r.o ? ` · ${r.o.name}` : ""}`,
    detail: draft.slice(0, 600),
    entityType: "agent_task",
    entityId: t.id,
    requestedBy: t.agentId,
    meta: { contactId: r.c.id, organizationId: r.o?.id ?? null, draft, recipient: r.c.fullName, role: r.c.title, linkedinUrl: r.c.linkedinUrl },
  }).returning();
  await audit(db, actor, "approval.request", "agent_task", t.id, null, { approvalId: a!.id, kind: "outbound_message" });
  return a!.id;
}

/** Backfills inbox rows for work that waits for approval without one (e.g. recorded before Phase 2). */
export async function backfillApprovals(db: DB, actor: Actor = "founder") {
  const waiting = await db.select().from(agentTasks).where(eq(agentTasks.status, "waiting_approval"));
  let n = 0;
  for (const t of waiting) {
    const [p] = await db.select({ id: approvals.id }).from(approvals).where(and(eq(approvals.entityType, "agent_task"), eq(approvals.entityId, t.id), ne(approvals.status, "rejected")));
    if (!p) { await ensureTaskApproval(db, t, actor); n++; }
  }
  return n;
}
