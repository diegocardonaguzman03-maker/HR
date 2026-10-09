import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { agentEvents, agents, agentTasks, type AgentStatus, type AvatarConfig, type TaskStatus } from "../db/schema";
import { audit, BusinessRuleError, nowIso, type Actor } from "./common";

/**
 * Execution engine status. Phase 1 ships the task, event and approval model; autonomous LLM execution is connected
 * in Phase 2 (provider credentials + tool permissions). Until then no agent runs on its own, so idle agents are
 * reported as OFFLINE and any "working" state comes from a task the founder explicitly updated.
 */
export const EXECUTION_ENGINE = {
  connected: false,
  reason: "Agent execution engine not connected yet (Phase 2). Tasks are queued and can be updated manually by the founder.",
} as const;

export type AgentWithStatus = typeof agents.$inferSelect & {
  status: AgentStatus;
  statusSource: "task" | "manual" | "engine";
  statusNote: string;
  currentTask: { id: string; title: string; status: TaskStatus } | null;
  tasksCompleted: number;
  tasksOpen: number;
  costUsdMicros: number;
};

const TASK_TO_AGENT_STATUS: Partial<Record<TaskStatus, AgentStatus>> = {
  working: "working",
  waiting_approval: "waiting_approval",
  waiting_input: "waiting_input",
  error: "error",
};
const PRECEDENCE: TaskStatus[] = ["working", "waiting_approval", "waiting_input", "error"];

export async function listAgentsWithStatus(db: DB): Promise<AgentWithStatus[]> {
  const rows = await db.select().from(agents).orderBy(asc(agents.department), asc(agents.id));
  const tasks = await db.select().from(agentTasks).orderBy(desc(agentTasks.updatedAt));
  return rows.map((a) => {
    const mine = tasks.filter((t) => t.agentId === a.id);
    const active = PRECEDENCE.map((s) => mine.find((t) => t.status === s)).find(Boolean) ?? null;
    const base = {
      ...a,
      tasksCompleted: mine.filter((t) => t.status === "completed").length,
      tasksOpen: mine.filter((t) => ["queued", "working", "waiting_input", "waiting_approval"].includes(t.status)).length,
      costUsdMicros: mine.reduce((s, t) => s + t.costUsdMicros, 0),
    };
    if (active) {
      return { ...base, status: TASK_TO_AGENT_STATUS[active.status]!, statusSource: EXECUTION_ENGINE.connected ? ("task" as const) : ("manual" as const), statusNote: EXECUTION_ENGINE.connected ? `Task: ${active.title}` : `Task: ${active.title} (status set manually by the founder)`, currentTask: { id: active.id, title: active.title, status: active.status } };
    }
    if (!a.active) return { ...base, status: "offline" as const, statusSource: "engine" as const, statusNote: "Agent deactivated.", currentTask: null };
    return EXECUTION_ENGINE.connected
      ? { ...base, status: "available" as const, statusSource: "engine" as const, statusNote: "Ready for tasks.", currentTask: null }
      : { ...base, status: "offline" as const, statusSource: "engine" as const, statusNote: EXECUTION_ENGINE.reason, currentTask: null };
  });
}

export const taskInput = z.object({
  agentId: z.string().min(1),
  title: z.string().trim().min(3, "title is required").max(300),
  instructions: z.string().trim().max(20000).optional().default(""),
  origin: z.enum(["founder", "decision_feed", "orchestrator"]).optional().default("founder"),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
});

/** Creates a real task record. It stays queued until an execution engine (or the founder) picks it up. */
export async function createTask(db: DB, raw: z.input<typeof taskInput>, actor: Actor = "founder") {
  const input = taskInput.parse(raw);
  const [agent] = await db.select().from(agents).where(eq(agents.id, input.agentId));
  if (!agent) throw new BusinessRuleError("Unknown agent.");
  if (!agent.active) throw new BusinessRuleError(`${agent.id} is deactivated.`);
  if (input.entityType && input.entityId) {
    const dup = await db
      .select({ id: agentTasks.id })
      .from(agentTasks)
      .where(and(eq(agentTasks.agentId, input.agentId), eq(agentTasks.entityId, input.entityId), eq(agentTasks.title, input.title), inArray(agentTasks.status, ["queued", "working", "waiting_input", "waiting_approval"])));
    if (dup.length) throw new BusinessRuleError("An identical open task already exists for this agent.", { taskId: dup[0]!.id });
  }
  const [task] = await db.insert(agentTasks).values(input).returning();
  await db.insert(agentEvents).values({ agentId: input.agentId, taskId: task!.id, type: "task_queued", message: input.title });
  await audit(db, actor, "task.create", "agent_task", task!.id, null, task);
  return task!;
}

const EVENT_FOR: Record<TaskStatus, (typeof agentEvents.$inferInsert)["type"] | null> = {
  queued: "task_queued",
  working: "task_started",
  waiting_input: "task_waiting_input",
  waiting_approval: "task_waiting_approval",
  completed: "task_completed",
  error: "task_failed",
  cancelled: "task_cancelled",
};
const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  queued: ["working", "cancelled"],
  working: ["waiting_input", "waiting_approval", "completed", "error", "cancelled"],
  waiting_input: ["working", "cancelled"],
  waiting_approval: ["working", "completed", "cancelled"],
  error: ["queued", "cancelled"],
  completed: [],
  cancelled: [],
};

/** Status change recorded by the founder (manual) or by the engine. Writes the event that drives PRAXIA World. */
export async function updateTaskStatus(db: DB, taskId: string, status: TaskStatus, opts: { output?: string; error?: string; costUsdMicros?: number } = {}, actor: Actor = "founder") {
  const [t] = await db.select().from(agentTasks).where(eq(agentTasks.id, taskId));
  if (!t) throw new BusinessRuleError("Task not found.");
  if (!TRANSITIONS[t.status].includes(status)) throw new BusinessRuleError(`Cannot move a ${t.status} task to ${status}.`);
  if (status === "completed" && !(opts.output ?? t.output)?.trim()) throw new BusinessRuleError("A completed task must have an output (the deliverable or its location).");
  const now = nowIso();
  const [after] = await db
    .update(agentTasks)
    .set({
      status,
      output: opts.output ?? t.output,
      errorMessage: status === "error" ? (opts.error ?? "Unspecified error") : t.errorMessage,
      costUsdMicros: t.costUsdMicros + (opts.costUsdMicros ?? 0),
      startedAt: status === "working" && !t.startedAt ? now : t.startedAt,
      completedAt: status === "completed" ? now : t.completedAt,
      updatedAt: now,
    })
    .where(eq(agentTasks.id, taskId))
    .returning();
  await db.insert(agentEvents).values({ agentId: t.agentId, taskId, type: EVENT_FOR[status]!, message: actor === "founder" ? `Manual update by founder: ${status}` : status });
  await audit(db, actor, `task.${status}`, "agent_task", taskId, { status: t.status }, { status });
  return after!;
}

export const avatarInput = z.object({
  bodyType: z.enum(["a", "b", "c"]),
  skinTone: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  hairStyle: z.enum(["short", "long", "bun", "buzz", "curly"]),
  hairColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  outfitColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accessory: z.enum(["none", "glasses", "headset", "badge"]),
});

export async function updateAvatar(db: DB, agentId: string, raw: AvatarConfig, actor: Actor = "founder") {
  const avatar = avatarInput.parse(raw);
  const [before] = await db.select().from(agents).where(eq(agents.id, agentId));
  if (!before) throw new BusinessRuleError("Unknown agent.");
  await db.update(agents).set({ avatar, updatedAt: nowIso() }).where(eq(agents.id, agentId));
  await audit(db, actor, "agent.avatar", "agent", agentId, before.avatar, avatar);
  return avatar;
}

export async function listTasks(db: DB, filter: { agentId?: string; status?: TaskStatus[] } = {}, limit = 200) {
  const conds = [filter.agentId ? eq(agentTasks.agentId, filter.agentId) : undefined, filter.status?.length ? inArray(agentTasks.status, filter.status) : undefined].filter(Boolean);
  return db.select().from(agentTasks).where(conds.length ? and(...(conds as never[])) : undefined).orderBy(desc(agentTasks.createdAt)).limit(limit);
}

export async function listEvents(db: DB, since?: string, limit = 100) {
  return db.select().from(agentEvents).where(since ? sql`${agentEvents.at} > ${since}` : undefined).orderBy(desc(agentEvents.at)).limit(limit);
}
