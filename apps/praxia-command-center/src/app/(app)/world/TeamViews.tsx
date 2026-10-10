"use client";
/**
 * The company structure inside mission control, laid out like the team design
 * (praxia/01-equipo/diseno-del-equipo.md): the eight delivery teams with what each one owns, and the reporting
 * lines from the Founder down. Every number comes from the same task records the board and the HQ use.
 */
import { useMemo } from "react";
import { TEAMS, buildOrgTree, teamIdOf, teamOf, type OrgNode, type TeamId } from "@/domain/teams";
import type { AgentStatus } from "@/server/db/schema";
import type { BoardTask } from "@/server/services/agents";

export type StructAgent = { id: string; role: string; team: string; reportsTo: string; status: AgentStatus; currentTaskTitle: string | null; tasksOpen: number; tasksOverdue?: number };

export const STATUS_DOT: Record<AgentStatus, string> = {
  working: "bg-indigo",
  waiting_approval: "bg-clay",
  waiting_input: "bg-clay",
  error: "bg-bad",
  completed: "bg-ivory",
  available: "bg-niebla",
  offline: "bg-hair",
};

export function TeamChip({ team, className = "" }: { team: string; className?: string }) {
  const t = teamOf(team);
  if (!t) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border border-hair px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] ${className}`} title={`${t.id} ${t.name}`}>
      <span className="size-1.5 rounded-full" style={{ background: t.color }} />
      {t.id}
    </span>
  );
}

export function TeamsView({ agents, tasks, onFocusTeam, onFocusAgent, onOpenTask, onShowBoard }: {
  agents: StructAgent[];
  tasks: BoardTask[];
  onFocusTeam: (id: TeamId) => void;
  onFocusAgent: (id: string) => void;
  onOpenTask: (id: string) => void;
  onShowBoard: (id: TeamId) => void;
}) {
  const teamOfAgent = useMemo(() => new Map(agents.map((a) => [a.id, teamIdOf(a.team)])), [agents]);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-[12px] text-niebla">The org chart says who reports to whom; the teams say <span className="text-ivory">who delivers what</span>. Each team owns its workflows and keeps its deliverables in its folder.</p>
        <span className="hidden font-mono text-[10.5px] text-mute lg:inline">8 teams · {agents.length} agents</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TEAMS.map((team) => {
          const members = agents.filter((a) => teamIdOf(a.team) === team.id).sort((a, b) => (a.id < b.id ? -1 : 1));
          const mine = tasks.filter((t) => teamOfAgent.get(t.agentId) === team.id);
          const open = mine.filter((t) => t.status !== "completed");
          const working = mine.filter((t) => t.status === "working").length;
          const waiting = mine.filter((t) => t.status === "waiting_input" || t.status === "waiting_approval").length;
          const overdue = mine.filter((t) => t.overdue).length;
          const done = mine.filter((t) => t.status === "completed").length;
          const top = [...open].sort((a, b) => (a.status === "working" ? -1 : 0) - (b.status === "working" ? -1 : 0)).slice(0, 2);
          return (
            <article key={team.id} className="flex flex-col rounded-xl border border-hair bg-graphite p-3" style={{ borderTopColor: team.color, borderTopWidth: 3 }} aria-label={`${team.id} ${team.name}`}>
              <header className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px]" style={{ color: team.color }}>{team.id}</div>
                  <h3 className="font-display text-[15px] leading-tight font-semibold">{team.name}</h3>
                </div>
                <button onClick={() => onFocusTeam(team.id)} className="shrink-0 rounded-md border border-hair px-2 py-0.5 text-[11px] text-niebla hover:text-ivory" title="Show the team's room in the HQ">Room</button>
              </header>
              <div className="mb-2 text-[11.5px] text-niebla">Owns: <span className="text-ivory">{team.owns}</span></div>
              <ul className="mb-2 flex flex-wrap gap-1">
                {members.map((m) => (
                  <li key={m.id}>
                    <button onClick={() => onFocusAgent(m.id)} className="flex items-center gap-1 rounded-md border border-hair px-1.5 py-0.5 font-mono text-[10.5px] hover:border-indigo/60" title={`${m.id} · ${m.role} · ${STATUS_LABEL_AGENT[m.status]}`}>
                      <span className={`size-1.5 rounded-full ${STATUS_DOT[m.status]}`} />{m.id}
                      {m.tasksOpen > 0 && <span className="text-mute">{m.tasksOpen}</span>}
                    </button>
                  </li>
                ))}
              </ul>
              <dl className="mb-2 grid grid-cols-4 gap-1 text-center">
                {[
                  ["Open", open.length, ""],
                  ["Working", working, "text-indigo-soft"],
                  ["Waiting", waiting, waiting ? "text-clay" : ""],
                  ["Overdue", overdue, overdue ? "text-bad" : ""],
                ].map(([label, n, cls]) => (
                  <div key={label as string} className="rounded-md bg-graphite-2 py-1">
                    <dd className={`font-display text-[15px] ${cls}`}>{n}</dd>
                    <dt className="font-mono text-[9px] tracking-[0.12em] text-mute uppercase">{label}</dt>
                  </div>
                ))}
              </dl>
              <ul className="mb-2 flex flex-col gap-1">
                {top.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => onOpenTask(t.id)} className="w-full truncate text-left text-[12px] text-niebla hover:text-ivory">
                      <span className={t.status === "working" ? "text-indigo-soft" : "text-mute"}>{t.agentId}</span> · {t.title}
                    </button>
                  </li>
                ))}
                {!top.length && <li className="text-[12px] text-mute">No open tasks{done ? ` · ${done} delivered` : ""}.</li>}
              </ul>
              <footer className="mt-auto flex items-center justify-between gap-2 border-t border-hair pt-2">
                <span className="truncate font-mono text-[10px] text-mute" title={team.folder}>{team.folder}</span>
                <button onClick={() => onShowBoard(team.id)} className="shrink-0 text-[11.5px] text-indigo-soft hover:underline">Board →</button>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_LABEL_AGENT: Record<AgentStatus, string> = {
  working: "Working",
  waiting_approval: "Waiting for approval",
  waiting_input: "Waiting for input",
  error: "Error",
  completed: "Completed",
  available: "Available",
  offline: "Offline",
};

export function OrgChart({ agents, selectedId, onFocusAgent }: { agents: StructAgent[]; selectedId: string | null; onFocusAgent: (id: string) => void }) {
  const tree = useMemo(() => buildOrgTree(agents), [agents]);
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
      <p className="mb-3 text-[12px] text-niebla">Reporting lines from the team design. Colour = delivery team; dot = live status. Click anyone to find them in the HQ.</p>
      <div className="flex flex-col items-center">
        <OrgBox node={tree} selectedId={selectedId} onFocusAgent={onFocusAgent} />
        {tree.children.map((top) => (
          <div key={top.id} className="flex w-full flex-col items-center">
            <div className="h-4 w-px bg-hair" />
            <OrgBox node={top} selectedId={selectedId} onFocusAgent={onFocusAgent} />
            {top.children.length > 0 && (
              <>
                <div className="h-4 w-px bg-hair" />
                <div className="grid w-full gap-x-4 gap-y-3 border-t border-hair pt-4 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
                  {top.children.map((branch) => (
                    <div key={branch.id} className="flex flex-col">
                      <OrgBranch node={branch} selectedId={selectedId} onFocusAgent={onFocusAgent} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgBranch({ node, selectedId, onFocusAgent }: { node: OrgNode<StructAgent>; selectedId: string | null; onFocusAgent: (id: string) => void }) {
  return (
    <div className="flex flex-col">
      <OrgBox node={node} selectedId={selectedId} onFocusAgent={onFocusAgent} />
      {node.children.length > 0 && (
        <ul className="ml-3 border-l border-hair pl-3">
          {node.children.map((c) => (
            <li key={c.id} className="relative mt-2 before:absolute before:top-4 before:-left-3 before:w-3 before:border-t before:border-hair">
              <OrgBranch node={c} selectedId={selectedId} onFocusAgent={onFocusAgent} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrgBox({ node, selectedId, onFocusAgent }: { node: OrgNode<StructAgent>; selectedId: string | null; onFocusAgent: (id: string) => void }) {
  const a = node.agent;
  const team = a ? teamOf(a.team) : null;
  return (
    <>
      {a ? (
        <button
          onClick={() => onFocusAgent(a.id)}
          className={`flex w-[230px] items-center gap-2 rounded-lg border bg-graphite px-2.5 py-1.5 text-left hover:border-indigo/60 ${selectedId === a.id ? "border-indigo" : "border-hair"}`}
          style={{ borderLeftColor: team?.color, borderLeftWidth: 3 }}
          aria-label={`${a.id}, ${a.role}, ${team ? `${team.id} ${team.name}` : "no team"}, ${STATUS_LABEL_AGENT[a.status]}`}
        >
          <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[a.status]}`} />
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[11px] text-indigo-soft">{a.id}{team && <span className="ml-1.5 text-mute">{team.id}</span>}</span>
            <span className="block truncate text-[12px]">{a.role}</span>
          </span>
          {a.tasksOpen > 0 && <span className={`font-mono text-[11px] ${a.tasksOverdue ? "text-bad" : "text-mute"}`} title="Open tasks">{a.tasksOpen}</span>}
        </button>
      ) : (
        <div className="flex w-[230px] items-center gap-2 rounded-lg border border-indigo bg-indigo/10 px-2.5 py-2">
          <span className="size-2 rotate-45 bg-indigo" />
          <span><span className="block font-mono text-[11px] text-indigo-soft">FOUNDER</span><span className="block text-[12px]">Decides · approves every output</span></span>
        </div>
      )}
    </>
  );
}
