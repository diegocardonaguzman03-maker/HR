"use client";
/**
 * Status changes from PRAXIA World's mission control. Every change goes through the same server action and
 * transition rules as the Tasks page; the dialogs collect what a transition requires (output, error, reason).
 */
import { updateTaskStatusAction } from "@/app/actions/governance";
import { canTransition } from "@/domain/tasks";
import { askChoice, askConfirm, askText } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";
import type { TaskStatus } from "@/server/db/schema";

export type OpsTask = { id: string; title: string; status: TaskStatus; output: string | null };

export const STATUS_LABEL: Record<TaskStatus, string> = {
  queued: "Queued",
  working: "In progress",
  waiting_input: "Waiting for input",
  waiting_approval: "Waiting for approval",
  completed: "Completed",
  error: "Error",
  cancelled: "Cancelled",
};

/** Verb shown on the button that moves a task into each status. */
export const ACTION_LABEL: Record<TaskStatus, string> = {
  queued: "Back to queue",
  working: "Start / resume",
  waiting_input: "Needs input",
  waiting_approval: "Send for approval",
  completed: "Complete",
  error: "Record error",
  cancelled: "Cancel",
};

/** Asks for whatever the transition needs and records it. Returns true when the change was saved. */
export async function changeTaskStatus(task: OpsTask, to: TaskStatus | "waiting"): Promise<boolean> {
  let target: TaskStatus | null = to === "waiting" ? null : to;
  if (to === "waiting") {
    const options = (["waiting_input", "waiting_approval"] as const).filter((s) => canTransition(task.status, s));
    if (!options.length) return false;
    target =
      options.length === 1
        ? options[0]!
        : ((await askChoice({
            title: "What is the task waiting for?",
            message: task.title,
            options: options.map((s) => ({ value: s, label: s === "waiting_input" ? "Input or information from someone" : "Your approval of the output" })),
          })) as TaskStatus | null);
    if (!target) return false;
  }
  if (!target || !canTransition(task.status, target)) {
    toast.bad(`A ${STATUS_LABEL[task.status].toLowerCase()} task cannot move to ${STATUS_LABEL[target ?? task.status].toLowerCase()}.`);
    return false;
  }
  const opts: { output?: string; error?: string } = {};
  if (target === "completed") {
    const o = await askText({
      title: "Complete task",
      message: task.title,
      label: "Output (the deliverable or where it is saved)",
      defaultValue: task.output ?? "",
      required: true,
      confirmLabel: "Complete",
    });
    if (!o) return false;
    opts.output = o;
  } else if (target === "error") {
    const e = await askText({ title: "Record an error", message: task.title, label: "What went wrong?", required: true, confirmLabel: "Record error" });
    if (!e) return false;
    opts.error = e;
  } else if (target === "cancelled") {
    if (!(await askConfirm({ title: "Cancel this task?", message: task.title, confirmLabel: "Cancel task", danger: true }))) return false;
  }
  const r = await updateTaskStatusAction(task.id, target, opts);
  if (r.ok) toast.ok(`${task.title.slice(0, 40)} → ${STATUS_LABEL[target]}`);
  else toast.bad(r.error);
  return r.ok;
}
