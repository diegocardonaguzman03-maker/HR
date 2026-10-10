"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import type { WorldAgent, WorldEvent } from "@/features/world/types";
import { roomForTeam, workActivity } from "@/features/world/layout";
import { teamOf, type TeamId } from "@/domain/teams";
import { TeamChip } from "./TeamViews";
import { AvatarPreview } from "@/features/world/AvatarPreview";
import { importBacklogAction, worldSnapshotAction } from "@/app/actions/governance";
import { AgentStatusBadge } from "@/components/agents/StatusBadge";
import { AssignTask } from "@/components/agents/AssignTask";
import { Badge, Button } from "@/components/ui/primitives";
import { toast } from "@/lib/ui-store";
import { PRIORITY_LABEL, compareTasks, isOpenTask } from "@/domain/tasks";
import type { BoardTask } from "@/server/services/agents";
import { MissionControl } from "./MissionControl";
import { TaskDetail } from "./TaskDetail";
import { STATUS_LABEL } from "./taskOps";

const PraxiaWorld = dynamic(() => import("@/features/world/PraxiaWorld"), { ssr: false, loading: () => <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-widest text-mute uppercase">Loading headquarters…</div> });

type HostAgent = WorldAgent & { reportsTo: string; statusSource?: string; description: string; skills: string[]; tasksCompleted: number; tasksOpen: number; costUsdMicros: number; active: boolean };

const POLL_MS = 4000;

export function WorldHost({ agents: initialAgents, tasks: initialTasks, feed: initialFeed, lastEventAt, initialSelected, engineNote }: { agents: HostAgent[]; tasks: BoardTask[]; feed: WorldEvent[]; lastEventAt: string | null; initialSelected: string | null; engineNote: string | null }) {
  const [agents, setAgents] = useState(initialAgents);
  const [tasks, setTasks] = useState(initialTasks);
  const [feed, setFeed] = useState(initialFeed);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [focus, setFocus] = useState<{ kind: "agent" | "area"; id: string; nonce: number } | null>(initialSelected ? { kind: "agent", id: initialSelected, nonce: 1 } : null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [mcOpen, setMcOpen] = useState(true);
  const [agentFilter, setAgentFilter] = useState(initialSelected ?? "");
  const [reduced, setReduced] = useState(false);
  const cursor = useRef<string | null>(lastEventAt);
  const syncing = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /** Pulls statuses, the board and any task events recorded since the last sync (those are animated). */
  const sync = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const snap = await worldSnapshotAction(cursor.current);
      setAgents((prev) => prev.map((a) => ({ ...a, ...(snap.agents.find((s) => s.id === a.id) ?? {}) })));
      setTasks(snap.tasks);
      if (snap.events.length) {
        cursor.current = snap.events.reduce((m, e) => (e.at > m ? e.at : m), cursor.current ?? "");
        setEvents(snap.events);
        setFeed((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          return [...snap.events.filter((e) => !seen.has(e.id)), ...prev].slice(0, 120);
        });
      }
    } catch {
      /* session expired or offline: keep the last state */
    } finally {
      syncing.current = false;
    }
  }, []);

  useEffect(() => {
    const t = setInterval(sync, POLL_MS);
    return () => clearInterval(t);
  }, [sync]);

  const selectAgent = useCallback((id: string | null) => {
    setSelected(id);
    if (id) setAgentFilter(id);
  }, []);
  const focusAgent = useCallback((id: string) => {
    selectAgent(id);
    setFocus((f) => ({ kind: "agent", id, nonce: (f?.nonce ?? 0) + 1 }));
  }, [selectAgent]);
  const focusTeam = useCallback((id: TeamId) => {
    const room = roomForTeam(id);
    if (room) setFocus((f) => ({ kind: "area", id: room.id, nonce: (f?.nonce ?? 0) + 1 }));
  }, []);

  const worldAgents = useMemo<WorldAgent[]>(
    () => agents.map(({ id, role, department, team, status, statusNote, currentTaskTitle, currentTaskProgress, tasksQueued, tasksOverdue, avatar }) => ({ id, role, department, team, status, statusNote, currentTaskTitle, currentTaskProgress, tasksQueued, tasksOverdue, avatar })),
    [agents],
  );
  const a = agents.find((x) => x.id === selected) ?? null;
  const agentTasks = useMemo(() => (a ? tasks.filter((t) => t.agentId === a.id && isOpenTask(t.status)).sort(compareTasks) : []), [a, tasks]);
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;
  const working = agents.filter((x) => x.status === "working").length;
  const options = useMemo(() => agents.map((x) => ({ id: x.id, label: `${x.id} · ${x.role}` })), [agents]);

  return (
    <div className="-mx-6 -my-8 flex h-[calc(100dvh-4rem)] flex-col lg:-mx-10">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <PraxiaWorld agents={worldAgents} selectedAgentId={selected} onSelectAgent={selectAgent} reducedMotion={reduced} events={events} focus={focus} />
        <div className="pointer-events-none absolute top-4 right-4 rounded-lg border border-hair bg-graphite/80 px-3 py-2 text-right backdrop-blur">
          <div className="px-label">PRAXIA World · HQ</div>
          <div className="font-mono text-[11px] text-niebla">{agents.length} agents · {working} working</div>
          {engineNote && <div className="mt-1 max-w-[280px] text-[11px] text-warn">{engineNote} Animations replay what is recorded.</div>}
        </div>
        {a && (
          <aside className="absolute top-0 right-0 bottom-0 w-[min(380px,92vw)] overflow-y-auto border-l border-hair bg-graphite-2/95 p-5 backdrop-blur" aria-label={`Agent ${a.id}`}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AvatarPreview avatar={a.avatar} size={64} showFloor={false} />
                <div>
                  <div className="font-mono text-[12px] text-indigo-soft">{a.id}</div>
                  <div className="font-display text-[16px] leading-snug font-semibold">{a.role}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-mute"><TeamChip team={a.team} /> {teamOf(a.team)?.name ?? a.team}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close panel" className="text-mute hover:text-ivory"><X size={16} /></button>
            </div>
            <dl className="mb-4 grid grid-cols-[90px_1fr] gap-x-2 gap-y-1 text-[12px]">
              <dt className="text-mute">Reports to</dt>
              <dd>{a.reportsTo === "Founder" ? <span className="text-ivory">Founder</span> : <button className="font-mono text-indigo-soft hover:underline" onClick={() => focusAgent(a.reportsTo)}>{a.reportsTo}</button>}</dd>
              <dt className="text-mute">Team owns</dt>
              <dd className="text-niebla">{teamOf(a.team)?.owns ?? "—"}</dd>
              <dt className="text-mute">Delivers to</dt>
              <dd className="truncate font-mono text-[11px] text-niebla" title={teamOf(a.team)?.folder}>{teamOf(a.team)?.folder ?? "—"}</dd>
              {agents.some((x) => x.reportsTo === a.id) && (<>
                <dt className="text-mute">Direct reports</dt>
                <dd className="flex flex-wrap gap-1">{agents.filter((x) => x.reportsTo === a.id).map((x) => <button key={x.id} className="font-mono text-indigo-soft hover:underline" onClick={() => focusAgent(x.id)}>{x.id}</button>)}</dd>
              </>)}
            </dl>
            <div className="mb-4 rounded-lg border border-hair p-3 text-[13px]">
              <div className="mb-1 flex items-center gap-2"><AgentStatusBadge status={a.status} manual={a.statusSource === "manual"} /> <span className="text-niebla">{a.currentTaskTitle ?? "No active task"}</span></div>
              {a.currentTaskProgress != null && a.currentTaskTitle && (
                <div className="my-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-graphite-3"><div className="h-full rounded-full bg-indigo" style={{ width: `${a.currentTaskProgress}%` }} /></div><span className="font-mono text-[11px] text-mute">{a.currentTaskProgress}%</span></div>
              )}
              <div className="text-[11.5px] text-mute">{a.statusNote}</div>
              <div className="mt-2 text-[11.5px] text-niebla">In the HQ, while a task is in progress: <span className="text-ivory">{workActivity(a.department).label.toLowerCase()}</span>.</div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-hair p-2"><div className="font-display text-[18px]">{a.tasksOpen}</div><div className="px-label">open</div></div>
              <div className="rounded-lg border border-hair p-2"><div className={`font-display text-[18px] ${a.tasksOverdue ? "text-bad" : ""}`}>{a.tasksOverdue ?? 0}</div><div className="px-label">overdue</div></div>
              <div className="rounded-lg border border-hair p-2"><div className="font-display text-[18px]">{a.tasksCompleted}</div><div className="px-label">done</div></div>
            </div>

            <div className="mb-2 flex items-center justify-between"><span className="px-label">Open tasks</span><span className="font-mono text-[11px] text-mute">{agentTasks.length}</span></div>
            <ul className="mb-4 flex flex-col gap-1.5">
              {agentTasks.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setOpenTaskId(t.id)} className="w-full rounded-lg border border-hair px-3 py-2 text-left hover:border-indigo/60">
                    <div className="flex items-center justify-between gap-2"><span className="line-clamp-1 text-[12.5px]">{t.title}</span><span className={`shrink-0 font-mono text-[10.5px] ${t.status === "working" ? "text-indigo-soft" : t.status === "error" ? "text-bad" : t.status === "queued" ? "text-mute" : "text-clay"}`}>{STATUS_LABEL[t.status]}</span></div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-mute">{PRIORITY_LABEL[t.priority]}{t.dueDate && <span className={t.overdue ? "text-bad" : ""}> · due {t.dueDate}</span>}{t.status === "working" && ` · ${t.progress}%`}</div>
                  </button>
                </li>
              ))}
              {!agentTasks.length && <li className="text-[12px] text-mute">No open tasks.</li>}
            </ul>

            <div className="flex flex-col gap-2">
              <AssignTask agents={options} defaultAgentId={a.id} variant="primary" label={`Assign a task to ${a.id}`} onDone={sync} />
              <Link href={`/agents/${a.id}`} className="rounded-lg border border-hair px-3 py-1.5 text-center text-[13px] hover:bg-graphite-3">View work, instructions & performance</Link>
              <Link href={`/agents/${a.id}#avatar`} className="rounded-lg border border-hair px-3 py-1.5 text-center text-[13px] hover:bg-graphite-3">Customize avatar</Link>
              <button disabled className="flex items-center justify-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-[13px] text-mute" title="Chat needs a connected LLM provider (Phase 2)"><MessageSquare size={13} />Chat — available when the execution engine is connected</button>
            </div>
            <div className="mt-5 px-label mb-2">Skills</div>
            <div className="flex flex-wrap gap-1">{a.skills.map((s) => <Badge key={s} className="normal-case tracking-normal">{s}</Badge>)}</div>
          </aside>
        )}
      </div>

      <MissionControl
        open={mcOpen}
        onToggle={() => setMcOpen((o) => !o)}
        tasks={tasks}
        agents={agents}
        feed={feed}
        agentFilter={agentFilter}
        setAgentFilter={setAgentFilter}
        onOpenTask={setOpenTaskId}
        onFocusAgent={focusAgent}
        onFocusTeam={focusTeam}
        selectedAgentId={selected}
        onChanged={sync}
        emptyBoard={
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-6 text-center">
            <p className="max-w-lg text-[13px] text-niebla">No tasks yet, so every desk is quiet. Assign a task and watch it fly from your desk to the agent, or load the team&apos;s real backlog from the repository: work already delivered (with the file where it lives) and work that is pending. Nothing is set to in progress.</p>
            <Button variant="primary" onClick={async () => { const r = await importBacklogAction(); if (r.ok) { toast.ok(`${r.value.created} tasks loaded.`); await sync(); } else toast.bad(r.error); }}>Load PRAXIA&apos;s backlog</Button>
          </div>
        }
        newTaskButton={<AssignTask agents={options} defaultAgentId={selected ?? undefined} label="New task" variant="primary" onDone={sync} />}
      />

      <TaskDetail task={openTask} agents={agents} onClose={() => setOpenTaskId(null)} onChanged={sync} />
    </div>
  );
}
