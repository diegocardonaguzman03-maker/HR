"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { reassignTaskAction, taskEventsAction, updateTaskAction } from "@/app/actions/governance";
import { Modal } from "@/components/ui/Modal";
import { Badge, Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { PRIORITY_LABEL, PRIORITY_OPTIONS, REASSIGNABLE, TASK_TRANSITIONS, isOpenTask } from "@/domain/tasks";
import { askConfirm } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";
import type { TaskPriority } from "@/server/db/schema";
import type { BoardTask } from "@/server/services/agents";
import { ACTION_LABEL, STATUS_LABEL, changeTaskStatus } from "./taskOps";

export const EVENT_LABEL: Record<string, string> = {
  task_queued: "Assigned",
  task_started: "Started",
  task_waiting_input: "Waiting for input",
  task_waiting_approval: "Sent for approval",
  task_completed: "Completed",
  task_failed: "Error",
  task_cancelled: "Cancelled",
  task_reassigned: "Reassigned",
  task_updated: "Updated",
};

type Ev = { id: string; type: string; message: string; at: string; agentId: string };

export function TaskDetail({ task, agents, onClose, onChanged }: { task: BoardTask | null; agents: { id: string; role: string; active?: boolean }[]; onClose: () => void; onChanged: () => void }) {
  const [pending, start] = useTransition();
  const [events, setEvents] = useState<Ev[]>([]);
  const [form, setForm] = useState({ title: "", instructions: "", priority: "normal" as TaskPriority, dueDate: "", progress: 0, agentId: "" });

  useEffect(() => {
    if (!task) return;
    setForm({ title: task.title, instructions: task.instructions, priority: task.priority, dueDate: task.dueDate ?? "", progress: task.progress, agentId: task.agentId });
    let live = true;
    taskEventsAction(task.id).then((e) => live && setEvents(e)).catch(() => live && setEvents([]));
    return () => { live = false; };
    // Re-sync only when the task itself changes, not on every poll that returns a fresh object.
  }, [task?.id, task?.updatedAt]);

  if (!task) return null;
  const open = isOpenTask(task.status);
  const progressEditable = task.status === "working" || task.status === "waiting_input";
  const dirty =
    form.title.trim() !== task.title ||
    form.instructions.trim() !== task.instructions ||
    form.priority !== task.priority ||
    (form.dueDate || null) !== task.dueDate ||
    (progressEditable && form.progress !== task.progress);

  const save = () =>
    start(async () => {
      const patch: Parameters<typeof updateTaskAction>[1] = {};
      if (form.title.trim() !== task.title) patch.title = form.title.trim();
      if (form.instructions.trim() !== task.instructions) patch.instructions = form.instructions.trim();
      if (form.priority !== task.priority) patch.priority = form.priority;
      if ((form.dueDate || null) !== task.dueDate) patch.dueDate = form.dueDate || null;
      if (progressEditable && form.progress !== task.progress) patch.progress = form.progress;
      const r = await updateTaskAction(task.id, patch);
      if (r.ok) { toast.ok("Task updated."); onChanged(); } else toast.bad(r.error);
    });

  const reassign = () =>
    start(async () => {
      const to = form.agentId;
      if (!(await askConfirm({ title: `Reassign to ${to}?`, message: "The task goes back to the new agent's queue and its recorded progress restarts.", confirmLabel: "Reassign" }))) return;
      const r = await reassignTaskAction(task.id, to);
      if (r.ok) { toast.ok(`Task reassigned to ${to}.`); onChanged(); onClose(); } else toast.bad(r.error);
    });

  const move = (to: (typeof TASK_TRANSITIONS)[keyof typeof TASK_TRANSITIONS][number]) =>
    start(async () => {
      if (await changeTaskStatus(task, to)) { onChanged(); if (to === "completed" || to === "cancelled") onClose(); }
    });

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={task.title} description={`${task.agentId} · ${STATUS_LABEL[task.status]} · created ${task.createdAt.slice(0, 10)}`} wide>
      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-3">
          <Field label="Task"><Input value={form.title} disabled={!open} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select value={form.priority} disabled={!open} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
              </Select>
            </Field>
            <Field label="Due date"><Input type="date" value={form.dueDate} disabled={!open} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
          </div>
          <Field label={`Recorded progress · ${form.progress}%`} hint={progressEditable ? "What you record here drives the progress bar above the agent." : "Progress can be recorded while the task is in progress or waiting for input."}>
            <input type="range" min={0} max={95} step={5} value={Math.min(95, form.progress)} disabled={!progressEditable} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="w-full accent-[var(--color-indigo)]" aria-label="Recorded progress" />
          </Field>
          <Field label="Instructions"><Textarea value={form.instructions} disabled={!open} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></Field>
          {task.output && <div className="rounded-lg border border-ok/40 bg-ok/5 p-2 text-[12.5px]"><span className="px-label">Output</span><div>{task.output}</div></div>}
          {task.errorMessage && <div className="rounded-lg border border-bad/40 bg-bad/5 p-2 text-[12.5px] text-bad">{task.errorMessage}</div>}
          {open && <div className="flex justify-end"><Button variant="primary" disabled={!dirty || pending || form.title.trim().length < 3} onClick={save}>Save changes</Button></div>}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="px-label mb-2">Status</div>
            <div className="mb-2"><Badge tone={task.status === "completed" ? "ok" : task.status === "working" ? "indigo" : task.status === "error" ? "bad" : task.status === "cancelled" ? "neutral" : "warn"}>{STATUS_LABEL[task.status]}</Badge>{task.overdue && <Badge tone="bad" className="ml-1">Overdue</Badge>}</div>
            <div className="flex flex-col gap-1.5">
              {TASK_TRANSITIONS[task.status].map((s) => (
                <Button key={s} size="sm" variant={s === "cancelled" ? "ghost" : "secondary"} disabled={pending} onClick={() => move(s)}>{ACTION_LABEL[s]}</Button>
              ))}
              {!TASK_TRANSITIONS[task.status].length && <span className="text-[12px] text-mute">Closed task.</span>}
            </div>
          </div>
          <div>
            <div className="px-label mb-2">Assigned agent</div>
            <Select value={form.agentId} disabled={!REASSIGNABLE.includes(task.status) || pending} onChange={(e) => setForm({ ...form, agentId: e.target.value })} aria-label="Assigned agent">
              {agents.filter((a) => a.active !== false || a.id === task.agentId).map((a) => <option key={a.id} value={a.id}>{a.id} · {a.role}</option>)}
            </Select>
            {form.agentId !== task.agentId && <Button size="sm" className="mt-2 w-full" disabled={pending} onClick={reassign}>Reassign to {form.agentId}</Button>}
            {!REASSIGNABLE.includes(task.status) && open && <p className="mt-1 text-[11.5px] text-mute">A task waiting for approval keeps its agent.</p>}
            <Link href={`/agents/${task.agentId}`} className="mt-2 block text-[12px] text-indigo-soft hover:underline">Open {task.agentId}&apos;s page →</Link>
          </div>
          <div>
            <div className="px-label mb-2">History</div>
            <ol className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {events.map((e) => (
                <li key={e.id} className="text-[12px]">
                  <div className="font-mono text-[10.5px] text-mute">{new Date(e.at).toLocaleString()} · {e.agentId}</div>
                  <div><span className="text-ivory">{EVENT_LABEL[e.type] ?? e.type}</span>{e.message && <span className="text-niebla"> — {e.message}</span>}</div>
                </li>
              ))}
              {!events.length && <li className="text-[12px] text-mute">No events.</li>}
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}
