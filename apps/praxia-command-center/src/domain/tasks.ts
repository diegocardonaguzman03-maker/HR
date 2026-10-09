/**
 * Agent task rules shared by the server services, the PRAXIA World board and the tests (pure, no DB).
 */
import type { TaskPriority, TaskStatus } from "@/server/db/schema";

/** Allowed status changes. The board, the task controls and the service all enforce this same table. */
export const TASK_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  queued: ["working", "cancelled"],
  working: ["waiting_input", "waiting_approval", "completed", "error", "cancelled"],
  waiting_input: ["working", "cancelled"],
  waiting_approval: ["working", "completed", "cancelled"],
  error: ["queued", "cancelled"],
  completed: [],
  cancelled: [],
};

export const canTransition = (from: TaskStatus, to: TaskStatus) => TASK_TRANSITIONS[from].includes(to);

export const OPEN_TASK_STATUSES: readonly TaskStatus[] = ["queued", "working", "waiting_input", "waiting_approval", "error"];
export const isOpenTask = (s: TaskStatus) => OPEN_TASK_STATUSES.includes(s);

/** A task can move to another agent while nobody has produced an output for it yet. */
export const REASSIGNABLE: readonly TaskStatus[] = ["queued", "working", "waiting_input", "error"];

export const PRIORITY_RANK: Readonly<Record<TaskPriority, number>> = { urgent: 0, high: 1, normal: 2, low: 3 };

/** Display order (most urgent first). Same values as TASK_PRIORITIES in the schema, without importing it client-side. */
export const PRIORITY_OPTIONS: readonly TaskPriority[] = ["urgent", "high", "normal", "low"];

export const PRIORITY_LABEL: Readonly<Record<TaskPriority, string>> = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" };

/** Overdue = open task whose due date (YYYY-MM-DD) is before today (YYYY-MM-DD). */
export function isOverdue(t: { status: TaskStatus; dueDate: string | null }, today: string): boolean {
  return !!t.dueDate && isOpenTask(t.status) && t.dueDate < today;
}

/** Board order inside a column: priority, then due date (none last), then oldest first. */
export function compareTasks(
  a: { priority: TaskPriority; dueDate: string | null; createdAt: string },
  b: { priority: TaskPriority; dueDate: string | null; createdAt: string },
): number {
  const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (p) return p;
  const da = a.dueDate ?? "9999-12-31";
  const db = b.dueDate ?? "9999-12-31";
  if (da !== db) return da < db ? -1 : 1;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

/** Board columns. "Waiting" groups the two states that need someone else (input or approval). */
export const BOARD_COLUMNS = [
  { id: "queued", label: "Queued", statuses: ["queued"] },
  { id: "working", label: "In progress", statuses: ["working"] },
  { id: "waiting", label: "Waiting", statuses: ["waiting_input", "waiting_approval"] },
  { id: "error", label: "Blocked / error", statuses: ["error"] },
  { id: "done", label: "Done", statuses: ["completed"] },
] as const satisfies readonly { id: string; label: string; statuses: readonly TaskStatus[] }[];

export type BoardColumnId = (typeof BOARD_COLUMNS)[number]["id"];

export function columnOf(status: TaskStatus): BoardColumnId | null {
  return BOARD_COLUMNS.find((c) => (c.statuses as readonly TaskStatus[]).includes(status))?.id ?? null;
}

/**
 * Status a card should take when dropped on a column, or null when the move is not allowed.
 * "Waiting" resolves to waiting_input (approval is requested explicitly from the card).
 */
export function dropTarget(from: TaskStatus, column: BoardColumnId): TaskStatus | null {
  const wanted: Record<BoardColumnId, TaskStatus[]> = {
    queued: ["queued"],
    working: ["working"],
    waiting: ["waiting_input", "waiting_approval"],
    error: ["error"],
    done: ["completed"],
  };
  return wanted[column].find((s) => s !== from && canTransition(from, s)) ?? null;
}
