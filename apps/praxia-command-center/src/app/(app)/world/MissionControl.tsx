"use client";
/**
 * Mission control under PRAXIA World: the task board (drag a card to change its status), each agent's
 * workload, and the live feed of recorded task events. Everything here reads and writes the same records
 * the world animates.
 */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Badge, Input, Select } from "@/components/ui/primitives";
import { AgentStatusBadge } from "@/components/agents/StatusBadge";
import { BOARD_COLUMNS, PRIORITY_LABEL, PRIORITY_OPTIONS, compareTasks, dropTarget, type BoardColumnId } from "@/domain/tasks";
import { toast } from "@/lib/ui-store";
import type { AgentStatus, TaskPriority, TaskStatus } from "@/server/db/schema";
import type { BoardTask } from "@/server/services/agents";
import type { WorldEvent } from "@/features/world/types";
import { EVENT_LABEL } from "./TaskDetail";
import { STATUS_LABEL, changeTaskStatus } from "./taskOps";

export type McAgent = { id: string; role: string; department: string; status: AgentStatus; currentTaskTitle: string | null; currentTaskProgress?: number | null; tasksOpen: number; tasksQueued?: number; tasksOverdue?: number; tasksCompleted: number };

const PRIORITY_TONE: Record<TaskPriority, "bad" | "clay" | "neutral" | "indigo"> = { urgent: "bad", high: "clay", normal: "indigo", low: "neutral" };
/** Reference load for the workload bar (open tasks per agent). An assumption until real capacity data exists. */
const CAPACITY = 5;
const TABS = [
  { id: "board", label: "Task board" },
  { id: "workload", label: "Workload" },
  { id: "activity", label: "Live activity" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function MissionControl({
  open, onToggle, tasks, agents, feed, agentFilter, setAgentFilter, onOpenTask, onFocusAgent, onChanged, newTaskButton, emptyBoard,
}: {
  open: boolean;
  onToggle: () => void;
  tasks: BoardTask[];
  agents: McAgent[];
  feed: WorldEvent[];
  agentFilter: string;
  setAgentFilter: (id: string) => void;
  onOpenTask: (id: string) => void;
  onFocusAgent: (id: string) => void;
  onChanged: () => void;
  newTaskButton: React.ReactNode;
  /** Shown instead of the columns when there are no tasks at all. */
  emptyBoard?: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("board");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [prio, setPrio] = useState("");
  const [dragging, setDragging] = useState<BoardTask | null>(null);
  const [over, setOver] = useState<BoardColumnId | null>(null);

  const deptOf = useMemo(() => new Map(agents.map((a) => [a.id, a.department])), [agents]);
  const departments = useMemo(() => [...new Set(agents.map((a) => a.department))].sort(), [agents]);
  const term = q.trim().toLowerCase();
  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (!agentFilter || t.agentId === agentFilter) &&
          (!dept || deptOf.get(t.agentId) === dept) &&
          (!prio || t.priority === prio) &&
          (!term || t.title.toLowerCase().includes(term) || t.agentId.toLowerCase().includes(term)),
      ),
    [tasks, agentFilter, dept, prio, term, deptOf],
  );

  const counts = useMemo(() => {
    const c = { queued: 0, working: 0, waiting: 0, error: 0, overdue: 0 };
    for (const t of tasks) {
      if (t.status === "queued") c.queued++;
      else if (t.status === "working") c.working++;
      else if (t.status === "waiting_input" || t.status === "waiting_approval") c.waiting++;
      else if (t.status === "error") c.error++;
      if (t.overdue) c.overdue++;
    }
    return c;
  }, [tasks]);

  const drop = async (col: BoardColumnId) => {
    const t = dragging;
    setDragging(null);
    setOver(null);
    if (!t) return;
    const target = dropTarget(t.status, col);
    if (!target) {
      if (col !== BOARD_COLUMNS.find((c) => (c.statuses as readonly TaskStatus[]).includes(t.status))?.id) toast.bad(`A ${STATUS_LABEL[t.status].toLowerCase()} task cannot move to “${BOARD_COLUMNS.find((c) => c.id === col)!.label}”.`);
      return;
    }
    if (await changeTaskStatus(t, col === "waiting" ? "waiting" : target)) onChanged();
  };

  return (
    <section className={`flex shrink-0 flex-col border-t border-hair bg-graphite-2 ${open ? "h-[40vh] min-h-[280px]" : ""}`} aria-label="Mission control">
      <header className="flex flex-wrap items-center gap-2 px-4 py-2">
        <button onClick={onToggle} className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] text-indigo-soft uppercase" aria-expanded={open}>
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />} Mission control
        </button>
        <div className="hidden items-center gap-1.5 font-mono text-[11px] text-niebla md:flex">
          <span>{counts.queued} queued</span>·<span className="text-indigo-soft">{counts.working} in progress</span>·<span className="text-clay">{counts.waiting} waiting</span>·<span className={counts.error ? "text-bad" : ""}>{counts.error} error</span>·<span className={counts.overdue ? "text-bad" : ""}>{counts.overdue} overdue</span>
        </div>
        {open && (
          <nav className="ml-2 flex gap-1" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`rounded-md px-2.5 py-1 text-[12.5px] ${tab === t.id ? "bg-graphite-3 text-ivory" : "text-mute hover:text-ivory"}`}>{t.label}</button>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">{newTaskButton}</div>
      </header>

      {open && tab === "board" && !tasks.length && emptyBoard}
      {open && tab === "board" && !!tasks.length && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-mute" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks" className="h-8 w-44 pl-7 text-[12.5px]" aria-label="Search tasks" />
            </div>
            <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="h-8 w-48 text-[12.5px]" aria-label="Filter by agent">
              <option value="">All agents</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.role}</option>)}
            </Select>
            <Select value={dept} onChange={(e) => setDept(e.target.value)} className="h-8 w-48 text-[12.5px]" aria-label="Filter by department">
              <option value="">All departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Select value={prio} onChange={(e) => setPrio(e.target.value)} className="h-8 w-36 text-[12.5px]" aria-label="Filter by priority">
              <option value="">Any priority</option>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </Select>
            {(agentFilter || dept || prio || q) && <button className="text-[12px] text-mute hover:text-ivory" onClick={() => { setAgentFilter(""); setDept(""); setPrio(""); setQ(""); }}>Clear filters</button>}
            <span className="ml-auto hidden text-[11.5px] text-mute lg:inline">Drag a card to another column to change its status · click it to edit, reassign or see its history</span>
          </div>
          <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-3">
            {BOARD_COLUMNS.map((col) => {
              const items = visible.filter((t) => (col.statuses as readonly TaskStatus[]).includes(t.status)).sort(compareTasks);
              const valid = dragging ? dropTarget(dragging.status, col.id) !== null : false;
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => { if (valid) { e.preventDefault(); setOver(col.id); } }}
                  onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
                  onDrop={(e) => { e.preventDefault(); void drop(col.id); }}
                  className={`flex w-[250px] min-w-[230px] shrink-0 flex-col rounded-xl border transition-colors ${dragging ? (valid ? (over === col.id ? "border-indigo bg-indigo/10" : "border-indigo/50") : "border-hair opacity-50") : "border-hair"} bg-graphite`}
                  aria-label={`${col.label} column`}
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="px-label">{col.label}</span>
                    <span className="font-mono text-[11px] text-mute">{items.length}</span>
                  </div>
                  <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                    {items.map((t) => (
                      <li key={t.id}>
                        <div
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); e.dataTransfer.effectAllowed = "move"; setDragging(t); }}
                          onDragEnd={() => { setDragging(null); setOver(null); }}
                          onClick={() => onOpenTask(t.id)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenTask(t.id); } }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${t.title}, ${t.agentId}, ${STATUS_LABEL[t.status]}`}
                          className="cursor-grab rounded-lg border border-hair bg-graphite-2 p-2.5 transition-colors hover:border-indigo/60 focus-visible:border-indigo focus-visible:outline-none active:cursor-grabbing"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <button
                              className="font-mono text-[11px] text-indigo-soft hover:underline"
                              onClick={(e) => { e.stopPropagation(); onFocusAgent(t.agentId); }}
                              title={`Show ${t.agentId} in the HQ`}
                            >{t.agentId}</button>
                            <Badge tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                          </div>
                          <div className="line-clamp-2 text-[13px] leading-snug">{t.title}</div>
                          {(t.status === "waiting_input" || t.status === "waiting_approval") && <div className="mt-1 text-[11.5px] text-clay">{t.status === "waiting_input" ? "Needs input" : "Needs your approval"}</div>}
                          {t.status === "error" && t.errorMessage && <div className="mt-1 line-clamp-2 text-[11.5px] text-bad">{t.errorMessage}</div>}
                          {(t.status === "working" || t.status === "waiting_input" || t.status === "waiting_approval") && (
                            <div className="mt-2 flex items-center gap-2" title="Recorded progress">
                              <div className="h-1 flex-1 overflow-hidden rounded-full bg-graphite-3"><div className={`h-full rounded-full ${t.status === "working" ? "bg-indigo" : "bg-clay"}`} style={{ width: `${t.progress}%` }} /></div>
                              <span className="font-mono text-[10.5px] text-mute">{t.progress}%</span>
                            </div>
                          )}
                          <div className="mt-1.5 flex items-center justify-between font-mono text-[10.5px] text-mute">
                            <span className={t.overdue ? "text-bad" : ""}>{t.dueDate ? `${t.overdue ? "Overdue · " : "Due "}${t.dueDate}` : "No due date"}</span>
                            {t.status === "completed" && <span>{(t.completedAt ?? t.updatedAt).slice(0, 10)}</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                    {!items.length && <li className="px-1 py-3 text-center text-[12px] text-mute">{dragging && valid ? "Drop here" : "Nothing here"}</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {open && tab === "workload" && (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-3">
          <table className="px-table">
            <thead><tr><th>Agent</th><th>Status</th><th>Current task</th><th className="text-right">Queued</th><th className="text-right">Open</th><th className="text-right">Overdue</th><th className="text-right">Done</th><th>Load</th></tr></thead>
            <tbody>
              {[...agents].sort((a, b) => b.tasksOpen - a.tasksOpen || (a.id < b.id ? -1 : 1)).map((a) => {
                return (
                  <tr key={a.id} className="cursor-pointer hover:bg-graphite-3/50" onClick={() => onFocusAgent(a.id)}>
                    <td><div className="font-mono text-[12px] text-indigo-soft">{a.id}</div><div className="text-[11.5px] text-mute">{a.role}</div></td>
                    <td><AgentStatusBadge status={a.status} /></td>
                    <td className="max-w-[300px] text-[12.5px]">{a.currentTaskTitle ? <>{a.currentTaskTitle}{a.currentTaskProgress != null && <span className="ml-1 font-mono text-[11px] text-mute">{a.currentTaskProgress}%</span>}</> : <span className="text-mute">—</span>}</td>
                    <td className="text-right font-mono">{a.tasksQueued ?? 0}</td>
                    <td className="text-right font-mono">{a.tasksOpen}</td>
                    <td className={`text-right font-mono ${a.tasksOverdue ? "text-bad" : ""}`}>{a.tasksOverdue ?? 0}</td>
                    <td className="text-right font-mono">{a.tasksCompleted}</td>
                    <td className="w-40"><div className="h-1.5 overflow-hidden rounded-full bg-graphite-3"><div className="h-full rounded-full bg-indigo" style={{ width: `${Math.min(100, (a.tasksOpen / CAPACITY) * 100)}%` }} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[11.5px] text-mute">Load = open tasks against a reference of {CAPACITY} per agent [Supuesto]. Click a row to find the agent in the HQ.</p>
        </div>
      )}

      {open && tab === "activity" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
          {!feed.length ? (
            <p className="py-6 text-center text-[13px] text-mute">No task events yet. Assign a task and it will fly from your desk to the agent.</p>
          ) : (
            <ol className="divide-y divide-hair">
              {feed.map((e) => {
                const t = e.taskId ? tasks.find((x) => x.id === e.taskId) : undefined;
                return (
                  <li key={e.id} className="flex items-baseline gap-3 py-1.5 text-[12.5px]">
                    <span className="w-[70px] shrink-0 font-mono text-[10.5px] text-mute">{new Date(e.at).toLocaleTimeString()}</span>
                    <button className="w-[64px] shrink-0 text-left font-mono text-[11.5px] text-indigo-soft hover:underline" onClick={() => onFocusAgent(e.agentId)}>{e.agentId}</button>
                    <span className="w-[130px] shrink-0 text-ivory">{EVENT_LABEL[e.type] ?? e.type}</span>
                    <span className="min-w-0 flex-1 truncate text-niebla">
                      {t ? <button className="hover:underline" onClick={() => onOpenTask(t.id)}>{t.title}</button> : null}
                      {e.message && e.message !== t?.title && <span className="text-mute">{t ? " — " : ""}{e.message}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
