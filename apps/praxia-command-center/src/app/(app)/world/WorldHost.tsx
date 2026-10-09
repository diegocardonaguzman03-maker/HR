"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import type { WorldAgent } from "@/features/world/types";
import { AvatarPreview } from "@/features/world/AvatarPreview";
import { worldSnapshotAction } from "@/app/actions/governance";
import { AgentStatusBadge } from "@/components/agents/StatusBadge";
import { AssignTask } from "@/components/agents/AssignTask";
import { Badge } from "@/components/ui/primitives";

const PraxiaWorld = dynamic(() => import("@/features/world/PraxiaWorld"), { ssr: false, loading: () => <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-widest text-mute uppercase">Loading headquarters…</div> });

type HostAgent = WorldAgent & { team: string; description: string; skills: string[]; tasksCompleted: number; tasksOpen: number; costUsdMicros: number };

export function WorldHost({ agents: initial, initialSelected, engineNote }: { agents: HostAgent[]; initialSelected: string | null; engineNote: string | null }) {
  const [agents, setAgents] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Live sync with the same database: poll real task-derived statuses.
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const snap = await worldSnapshotAction();
        setAgents((prev) => prev.map((a) => ({ ...a, ...(snap.find((s) => s.id === a.id) ?? {}) })));
      } catch { /* session expired or offline: keep last state */ }
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const worldAgents = useMemo<WorldAgent[]>(() => agents.map(({ id, role, department, status, statusNote, currentTaskTitle, avatar }) => ({ id, role, department, status, statusNote, currentTaskTitle, avatar })), [agents]);
  const a = agents.find((x) => x.id === selected) ?? null;
  const working = agents.filter((x) => x.status === "working").length;

  return (
    <div className="-mx-6 -my-8 lg:-mx-10">
      <div className="relative h-[calc(100dvh-4rem)] overflow-hidden">
        <PraxiaWorld agents={worldAgents} selectedAgentId={selected} onSelectAgent={setSelected} reducedMotion={reduced} />
        <div className="pointer-events-none absolute top-4 right-4 rounded-lg border border-hair bg-graphite/80 px-3 py-2 text-right backdrop-blur">
          <div className="px-label">PRAXIA World · HQ</div>
          <div className="font-mono text-[11px] text-niebla">{agents.length} agents · {working} working{engineNote && working ? " (manual)" : ""}</div>
          {engineNote && <div className="mt-1 max-w-[260px] text-[11px] text-warn">{engineNote}</div>}
        </div>
        {a && (
          <aside className="absolute top-0 right-0 bottom-0 w-[min(380px,92vw)] overflow-y-auto border-l border-hair bg-graphite-2/95 p-5 backdrop-blur" aria-label={`Agent ${a.id}`}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AvatarPreview avatar={a.avatar} size={64} showFloor={false} />
                <div>
                  <div className="font-mono text-[12px] text-indigo-soft">{a.id}</div>
                  <div className="font-display text-[16px] font-semibold leading-snug">{a.role}</div>
                  <div className="text-[12px] text-mute">{a.department}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close panel" className="text-mute hover:text-ivory"><X size={16} /></button>
            </div>
            <div className="mb-4 rounded-lg border border-hair p-3 text-[13px]">
               <div className="mb-1 flex items-center gap-2"><AgentStatusBadge status={a.status} manual={!!engineNote && !!a.currentTaskTitle} /> <span className="text-niebla">{a.currentTaskTitle ?? "No active task"}</span></div>
              <div className="text-[11.5px] text-mute">{a.statusNote}</div>
            </div>
            <p className="mb-4 text-[13px] text-niebla">{a.description}</p>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-hair p-2"><div className="font-display text-[18px]">{a.tasksCompleted}</div><div className="px-label">done</div></div>
              <div className="rounded-lg border border-hair p-2"><div className="font-display text-[18px]">{a.tasksOpen}</div><div className="px-label">open</div></div>
              <div className="rounded-lg border border-hair p-2"><div className="font-display text-[18px]">{a.costUsdMicros ? `$${(a.costUsdMicros / 1e6).toFixed(2)}` : "—"}</div><div className="px-label">AI cost</div></div>
            </div>
            <div className="px-label mb-2">Skills</div>
            <div className="mb-5 flex flex-wrap gap-1">{a.skills.map((s) => <Badge key={s} className="normal-case tracking-normal">{s}</Badge>)}</div>
            <div className="flex flex-col gap-2">
              <AssignTask agents={agents.map((x) => ({ id: x.id, label: `${x.id} · ${x.role}` }))} defaultAgentId={a.id} />
              <Link href={`/agents/${a.id}`} className="rounded-lg border border-hair px-3 py-1.5 text-center text-[13px] hover:bg-graphite-3">View work, instructions & performance</Link>
              <Link href={`/agents/${a.id}#avatar`} className="rounded-lg border border-hair px-3 py-1.5 text-center text-[13px] hover:bg-graphite-3">Customize avatar</Link>
              <button disabled className="flex items-center justify-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-[13px] text-mute" title="Chat needs a connected LLM provider (Phase 2)"><MessageSquare size={13} />Chat — available when the execution engine is connected</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
