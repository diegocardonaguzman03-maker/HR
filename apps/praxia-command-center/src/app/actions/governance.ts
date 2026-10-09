"use server";
import { decideApproval } from "@/server/services/commercial";
import { createTask, reassignTask, updateTask, updateTaskStatus, updateAvatar } from "@/server/services/agents";
import type { AvatarConfig, TaskPriority, TaskStatus } from "@/server/db/schema";
import { run } from "./run";

export async function decideApprovalAction(approvalId: string, decision: "approved" | "rejected", note: string | null) {
  return run((db, actor) => decideApproval(db, approvalId, decision, note, actor), ["/", "/approvals"]);
}

export async function assignTaskAction(input: { agentId: string; title: string; instructions?: string; priority?: TaskPriority; dueDate?: string | null; origin?: "founder" | "decision_feed"; entityType?: string | null; entityId?: string | null }) {
  return run((db, actor) => createTask(db, input, actor), ["/", "/tasks", "/agents", "/world"]);
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus, opts: { output?: string; error?: string } = {}) {
  return run((db, actor) => updateTaskStatus(db, taskId, status, opts, actor), ["/", "/tasks", "/agents", "/world"]);
}

export async function updateTaskAction(taskId: string, patch: { title?: string; instructions?: string; priority?: TaskPriority; dueDate?: string | null; progress?: number }) {
  return run((db, actor) => updateTask(db, taskId, patch, actor), ["/", "/tasks", "/agents", "/world"]);
}

export async function reassignTaskAction(taskId: string, toAgentId: string) {
  return run((db, actor) => reassignTask(db, taskId, toAgentId, actor), ["/", "/tasks", "/agents", "/world"]);
}

export async function updateAvatarAction(agentId: string, avatar: AvatarConfig) {
  return run((db, actor) => updateAvatar(db, agentId, avatar, actor), ["/agents", "/world"]);
}

/** Loads PRAXIA's real backlog (delivered work with outputs + pending work) as task records. Idempotent. */
export async function importBacklogAction() {
  const { importBacklog } = await import("@/server/seed/backlog");
  return run((db) => importBacklog(db), ["/", "/tasks", "/agents", "/world"]);
}

/** Event trail of one task (newest first). */
export async function taskEventsAction(taskId: string) {
  const { requireFounder } = await import("@/server/session");
  const { getDb } = await import("@/server/db/client");
  const { listTaskEvents } = await import("@/server/services/agents");
  await requireFounder();
  return listTaskEvents(await getDb(), taskId);
}

/**
 * Live snapshot for PRAXIA World: task-derived agent statuses, the task board and the real events recorded after
 * `sinceEventAt` (the world replays only those as animations).
 */
export async function worldSnapshotAction(sinceEventAt?: string | null) {
  const { requireFounder } = await import("@/server/session");
  const { getDb } = await import("@/server/db/client");
  const { listAgentsWithStatus, listBoard, listEvents } = await import("@/server/services/agents");
  await requireFounder();
  const db = await getDb();
  const [agents, board, events] = await Promise.all([listAgentsWithStatus(db), listBoard(db), listEvents(db, sinceEventAt ?? undefined, 60)]);
  return {
    agents: agents.map((a) => ({ id: a.id, status: a.status, statusSource: a.statusSource, statusNote: a.statusNote, currentTaskTitle: a.currentTask?.title ?? null, currentTaskProgress: a.currentTask?.progress ?? null, tasksCompleted: a.tasksCompleted, tasksOpen: a.tasksOpen, tasksQueued: a.tasksQueued, tasksOverdue: a.tasksOverdue })),
    tasks: board.tasks,
    today: board.today,
    events,
  };
}
