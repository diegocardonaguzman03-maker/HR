"use server";
import { decideApproval } from "@/server/services/commercial";
import { createTask, updateTaskStatus, updateAvatar } from "@/server/services/agents";
import type { AvatarConfig, TaskStatus } from "@/server/db/schema";
import { run } from "./run";

export async function decideApprovalAction(approvalId: string, decision: "approved" | "rejected", note: string | null) {
  return run((db, actor) => decideApproval(db, approvalId, decision, note, actor), ["/", "/approvals"]);
}

export async function assignTaskAction(input: { agentId: string; title: string; instructions?: string; origin?: "founder" | "decision_feed"; entityType?: string | null; entityId?: string | null }) {
  return run((db, actor) => createTask(db, input, actor), ["/", "/tasks", "/agents", "/world"]);
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus, opts: { output?: string; error?: string } = {}) {
  return run((db, actor) => updateTaskStatus(db, taskId, status, opts, actor), ["/", "/tasks", "/agents", "/world"]);
}

export async function updateAvatarAction(agentId: string, avatar: AvatarConfig) {
  return run((db, actor) => updateAvatar(db, agentId, avatar, actor), ["/agents", "/world"]);
}

/** Live snapshot for PRAXIA World polling (statuses derived from recorded task events). */
export async function worldSnapshotAction() {
  const { requireFounder } = await import("@/server/session");
  const { getDb } = await import("@/server/db/client");
  const { listAgentsWithStatus } = await import("@/server/services/agents");
  await requireFounder();
  const agents = await listAgentsWithStatus(await getDb());
  return agents.map((a) => ({ id: a.id, status: a.status, statusNote: a.statusNote, currentTaskTitle: a.currentTask?.title ?? null, tasksCompleted: a.tasksCompleted, tasksOpen: a.tasksOpen }));
}
