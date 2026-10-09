import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { agentEvents, agents, agentTasks, TASK_PRIORITIES, type AgentStatus, type AvatarConfig, type TaskStatus } from "../db/schema";
import { audit, BusinessRuleError, nowIso, type Actor } from "./common";
import { canTransition, compareTasks, isOpenTask, isOverdue, REASSIGNABLE } from "@/domain/tasks";

/**
 * Execution engine status. Phase 1 ships the task, event and approval model; autonomous LLM execution is connected
 * in Phase 2 (provider credentials + tool permissions). Until then no agent runs on its own, so idle agents are
 * reported as OFFLINE and any "working" state comes from a task the founder explicitly updated.
 */
export const EXECUTION_ENGINE = {
  connected: false,
  reason: "No autonomous engine yet (Phase 2): agents work only when the founder or an orchestrated Claude Code session runs them, and every step is recorded here.",
} as const;

/** Actor id the orchestrating Claude Code session uses when it records the work of the agents it runs. */
export const ORCHESTRATOR_ACTOR = "orchestrator:claude-code";

export type AgentWithStatus = typeof agents.$inferSelect & {
  status: AgentStatus;
  statusSource: "task" | "manual" | "engine" | "session";
  statusNote: string;
  currentTask: { id: string; title: string; status: TaskStatus; progress: number; priority: (typeof TASK_PRIORITIES)[number] } | null;
  tasksCompleted: number;
  tasksOpen: number;
  tasksQueued: number;
  tasksOverdue: number;
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
  const today = nowIso().slice(0, 10);
  return rows.map((a) => {
    const mine = tasks.filter((t) => t.agentId === a.id);
    const active = PRECEDENCE.map((s) => mine.filter((t) => t.status === s).sort(compareTasks)[0]).find(Boolean) ?? null;
    const base = {
      ...a,
      tasksCompleted: mine.filter((t) => t.status === "completed").length,
      tasksOpen: mine.filter((t) => isOpenTask(t.status)).length,
      tasksQueued: mine.filter((t) => t.status === "queued").length,
      tasksOverdue: mine.filter((t) => isOverdue(t, today)).length,
      costUsdMicros: mine.reduce((s, t) => s + t.costUsdMicros, 0),
    };
    if (active) {
      const currentTask = { id: active.id, title: active.title, status: active.status, progress: active.progress, priority: active.priority };
      const status = TASK_TO_AGENT_STATUS[active.status]!;
      if (EXECUTION_ENGINE.connected) return { ...base, status, statusSource: "task" as const, statusNote: `Task: ${active.title}`, currentTask };
      if (active.origin === "orchestrator") return { ...base, status, statusSource: "session" as const, statusNote: `Task: ${active.title} (run by ${a.id} in the orchestrated Claude Code session)`, currentTask };
      return { ...base, status, statusSource: "manual" as const, statusNote: `Task: ${active.title} (status set manually by the founder)`, currentTask };
    }
    if (!a.active) return { ...base, status: "offline" as const, statusSource: "engine" as const, statusNote: "Agent deactivated.", currentTask: null };
    return EXECUTION_ENGINE.connected
      ? { ...base, status: "available" as const, statusSource: "engine" as const, statusNote: "Ready for tasks.", currentTask: null }
      : { ...base, status: "offline" as const, statusSource: "engine" as const, statusNote: EXECUTION_ENGINE.reason, currentTask: null };
  });
}

/** Optional YYYY-MM-DD; an empty string clears it. */
const dueDateField = z.preprocess((v) => (v === "" ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "due date must be YYYY-MM-DD").nullable().optional());

export const taskInput = z.object({
  agentId: z.string().min(1),
  title: z.string().trim().min(3, "title is required").max(300),
  instructions: z.string().trim().max(20000).optional().default(""),
  origin: z.enum(["founder", "decision_feed", "orchestrator"]).optional().default("founder"),
  priority: z.enum(TASK_PRIORITIES).optional().default("normal"),
  dueDate: dueDateField.transform((v) => v ?? null),
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


/** Status change recorded by the founder (manual) or by the engine. Writes the event that drives PRAXIA World. */
export async function updateTaskStatus(db: DB, taskId: string, status: TaskStatus, opts: { output?: string; error?: string; costUsdMicros?: number } = {}, actor: Actor = "founder") {
  const [t] = await db.select().from(agentTasks).where(eq(agentTasks.id, taskId));
  if (!t) throw new BusinessRuleError("Task not found.");
  if (!canTransition(t.status, status)) throw new BusinessRuleError(`Cannot move a ${t.status} task to ${status}.`);
  if (status === "completed" && !(opts.output ?? t.output)?.trim()) throw new BusinessRuleError("A completed task must have an output (the deliverable or its location).");
  const now = nowIso();
  const [after] = await db
    .update(agentTasks)
    .set({
      status,
      output: opts.output ?? t.output,
      errorMessage: status === "error" ? (opts.error ?? "Unspecified error") : t.errorMessage,
      costUsdMicros: t.costUsdMicros + (opts.costUsdMicros ?? 0),
      progress: status === "completed" ? 100 : status === "queued" ? 0 : t.progress,
      startedAt: status === "working" && !t.startedAt ? now : t.startedAt,
      completedAt: status === "completed" ? now : t.completedAt,
      updatedAt: now,
    })
    .where(eq(agentTasks.id, taskId))
    .returning();
  const message = actor === "founder" ? `Manual update by founder: ${status}` : actor === ORCHESTRATOR_ACTOR ? `${t.agentId} · ${status}${status === "completed" && opts.output ? ` → ${opts.output}` : ""} (Claude Code session)` : status;
  await db.insert(agentEvents).values({ agentId: t.agentId, taskId, type: EVENT_FOR[status]!, message });
  await audit(db, actor, `task.${status}`, "agent_task", taskId, { status: t.status }, { status });
  return after!;
}

export const taskEditInput = z.object({
  title: z.string().trim().min(3, "title is required").max(300).optional(),
  instructions: z.string().trim().max(20000).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: dueDateField,
  progress: z.number().int().min(0).max(100).optional(),
});

/** Edits an open task (title, instructions, priority, due date, recorded progress). */
export async function updateTask(db: DB, taskId: string, raw: z.input<typeof taskEditInput>, actor: Actor = "founder") {
  const patch = taskEditInput.parse(raw);
  const [t] = await db.select().from(agentTasks).where(eq(agentTasks.id, taskId));
  if (!t) throw new BusinessRuleError("Task not found.");
  if (!isOpenTask(t.status)) throw new BusinessRuleError(`A ${t.status} task can no longer be edited.`);
  if (patch.progress !== undefined && patch.progress !== t.progress && t.status !== "working" && t.status !== "waiting_input") {
    throw new BusinessRuleError("Progress can only be recorded while the task is in progress or waiting for input.");
  }
  if (patch.progress === 100) throw new BusinessRuleError("Use Complete to finish a task (it requires an output).");
  const changes = Object.fromEntries(Object.entries(patch).filter(([k, v]) => v !== undefined && v !== (t as Record<string, unknown>)[k]));
  if (!Object.keys(changes).length) return t;
  const [after] = await db.update(agentTasks).set({ ...changes, updatedAt: nowIso() }).where(eq(agentTasks.id, taskId)).returning();
  const what = Object.entries(changes).map(([k, v]) => (k === "progress" ? `progress ${v}%` : k === "instructions" ? "instructions" : `${k} ${v ?? "—"}`)).join(", ");
  await db.insert(agentEvents).values({ agentId: t.agentId, taskId, type: "task_updated", message: actor === "founder" ? `Manual update by founder: ${what}` : what });
  await audit(db, actor, "task.update", "agent_task", taskId, Object.fromEntries(Object.keys(changes).map((k) => [k, (t as Record<string, unknown>)[k]])), changes);
  return after!;
}

/** Moves an open task to another agent. It goes back to the new agent's queue; recorded progress restarts. */
export async function reassignTask(db: DB, taskId: string, toAgentId: string, actor: Actor = "founder") {
  const [t] = await db.select().from(agentTasks).where(eq(agentTasks.id, taskId));
  if (!t) throw new BusinessRuleError("Task not found.");
  if (t.agentId === toAgentId) throw new BusinessRuleError(`The task is already assigned to ${toAgentId}.`);
  if (!REASSIGNABLE.includes(t.status)) throw new BusinessRuleError(`A ${t.status.replace("_", " ")} task cannot be reassigned.`);
  const [to] = await db.select().from(agents).where(eq(agents.id, toAgentId));
  if (!to) throw new BusinessRuleError("Unknown agent.");
  if (!to.active) throw new BusinessRuleError(`${to.id} is deactivated.`);
  const [after] = await db
    .update(agentTasks)
    .set({ agentId: toAgentId, status: "queued", progress: 0, startedAt: null, errorMessage: null, updatedAt: nowIso() })
    .where(eq(agentTasks.id, taskId))
    .returning();
  const who = actor === "founder" ? " (manual update by founder)" : "";
  await db.insert(agentEvents).values({ agentId: t.agentId, taskId, type: "task_reassigned", message: `Reassigned to ${toAgentId}${who}` });
  await db.insert(agentEvents).values({ agentId: toAgentId, taskId, type: "task_reassigned", message: `Reassigned from ${t.agentId}${who}` });
  await audit(db, actor, "task.reassign", "agent_task", taskId, { agentId: t.agentId, status: t.status }, { agentId: toAgentId, status: "queued" });
  return after!;
}

export type BoardTask = typeof agentTasks.$inferSelect & { overdue: boolean };

/** Everything PRAXIA World's mission control needs: open tasks plus the last 14 days of completed ones. */
export async function listBoard(db: DB): Promise<{ tasks: BoardTask[]; today: string }> {
  const today = nowIso().slice(0, 10);
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const rows = await db.select().from(agentTasks).orderBy(desc(agentTasks.updatedAt)).limit(1000);
  const tasks = rows
    .filter((t) => isOpenTask(t.status) || (t.status === "completed" && (t.completedAt ?? t.updatedAt) >= since))
    .map((t) => ({ ...t, overdue: isOverdue(t, today) }));
  return { tasks, today };
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

export async function listTaskEvents(db: DB, taskId: string) {
  return db.select().from(agentEvents).where(eq(agentEvents.taskId, taskId)).orderBy(desc(agentEvents.at)).limit(100);
}
