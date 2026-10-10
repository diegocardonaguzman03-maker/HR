"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Badge, Button } from "@/components/ui/primitives";
import { clearForPilotAction, engineStatusAction, planWorkAction, runEngineAction, setEngineConfigAction } from "@/app/actions/engine";
import { askConfirm, askText } from "@/lib/dialog";
import { toast } from "@/lib/ui-store";

type Status = Extract<Awaited<ReturnType<typeof engineStatusAction>>, { ok: true }>["value"];
const usd = (micros: number) => `USD ${(micros / 1_000_000).toFixed(2)}`;

/** Engine control: plan the funnel work, run the agents, configure the budget. Everything it produces waits for you. */
export function EngineControls({ queued }: { queued: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<Status | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const refreshStatus = async () => { const r = await engineStatusAction(); if (r.ok) setStatus(r.value as Status); };
  useEffect(() => {
    void refreshStatus();
    // The viewer's Claude connects shortly after load in the Artifact; re-check once so the Run button lights up.
    const t = setTimeout(() => void refreshStatus(), 2500);
    return () => clearTimeout(t);
  }, [queued]);

  const plan = () => start(async () => {
    const r = await planWorkAction();
    if (!r.ok) { toast.bad(r.error); return; }
    const v = r.value as { created: unknown[]; blocked: string[] };
    toast.ok(v.created.length ? `${v.created.length} task(s) queued for the agents.` : "Nothing new to plan.");
    for (const b of v.blocked) toast.bad(b);
    router.refresh(); void refreshStatus();
  });
  const runN = (n: number) => start(async () => {
    setRunning(`Running ${n} task${n > 1 ? "s" : ""}… the agents are working (watch PRAXIA World).`);
    const r = await runEngineAction(n);
    setRunning(null);
    if (!r.ok) { toast.bad(r.error); return; }
    const v = r.value as { results: { status: string; title: string; note: string }[]; stop: string };
    const ok = v.results.filter((x) => x.status === "waiting_approval").length;
    toast.ok(`${ok} output(s) waiting for your approval${v.results.length - ok ? ` · ${v.results.length - ok} failed` : ""}${v.stop ? ` · ${v.stop}` : ""}`);
    for (const f of v.results.filter((x) => x.status === "error")) toast.bad(`${f.title}: ${f.note}`);
    router.refresh(); void refreshStatus();
  });
  const configure = async () => {
    if (!status) return;
    const max = await askText({ title: "Tasks per run", label: "1–10", defaultValue: String(status.config.maxTasksPerRun), required: true, confirmLabel: "Next" });
    if (!max) return;
    const budget = await askText({ title: "Daily budget (USD)", message: "Hard cap on API spend per day. Runs on the claude.ai viewer use your plan and cost 0 here.", label: "USD", defaultValue: (status.config.dailyBudgetUsdMicros / 1_000_000).toFixed(2), required: true, confirmLabel: "Save" });
    if (!budget) return;
    start(async () => {
      const r = await setEngineConfigAction({ ...status.config, maxTasksPerRun: Number(max), dailyBudgetUsdMicros: Math.round(Number(budget) * 1_000_000) });
      if (r.ok) { toast.ok("Engine settings saved."); void refreshStatus(); } else toast.bad(r.error);
    });
  };
  const toggle = () => start(async () => {
    if (!status) return;
    if (!status.config.enabled && !(await askConfirm({ title: "Turn on scheduled runs?", message: "Allows scheduled runs within the daily budget. Every output still waits for your approval; nothing is sent." }))) return;
    const r = await setEngineConfigAction({ ...status.config, enabled: !status.config.enabled });
    if (r.ok) void refreshStatus(); else toast.bad(r.error);
  });

  const p = status?.provider;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <Badge tone={p?.available ? "ok" : "warn"}>{p ? (p.available ? "engine ready" : "engine offline") : "checking…"}</Badge>
        {p && <span className="font-mono text-[11.5px] text-niebla">{p.model}</span>}
        {status && <Badge tone={status.config.enabled ? "indigo" : "neutral"}>{status.config.enabled ? "scheduled: on" : "scheduled: off"}</Badge>}
        {status && <span className="font-mono text-[11.5px] text-mute">spent today {usd(status.spentToday)} / {usd(status.config.dailyBudgetUsdMicros)} · {status.queued} queued</span>}
      </div>
      {p && !p.available && p.reason && <p className="text-[12.5px] text-warn">{p.reason}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending} onClick={plan}>1 · Plan funnel work</Button>
        <Button variant="primary" size="sm" disabled={pending || !p?.available || !status?.queued} onClick={() => runN(1)}>2 · Run next task</Button>
        <Button variant="primary" size="sm" disabled={pending || !p?.available || !status?.queued} onClick={() => runN(status?.config.maxTasksPerRun ?? 3)}>Run {status?.config.maxTasksPerRun ?? 3}</Button>
        <Button variant="ghost" size="sm" disabled={pending || !status} onClick={configure}>Budget & limits</Button>
        <Button variant="ghost" size="sm" disabled={pending || !status} onClick={toggle}>{status?.config.enabled ? "Turn scheduled off" : "Turn scheduled on"}</Button>
      </div>
      {running && <p className="animate-pulse text-[12.5px] text-indigo-soft">{running}</p>}
      {!!status?.runs.length && (
        <table className="px-table mt-1"><thead><tr><th>Run</th><th>Provider</th><th className="text-right">Tasks</th><th className="text-right">Failed</th><th className="text-right">Cost</th><th>Note</th></tr></thead>
          <tbody>{status.runs.map((r) => <tr key={r.id}><td className="font-mono text-[11.5px]">{r.startedAt.slice(0, 16).replace("T", " ")}</td><td className="font-mono text-[11.5px]">{r.provider}</td><td className="text-right font-mono">{r.tasksRun}</td><td className="text-right font-mono">{r.tasksFailed}</td><td className="text-right font-mono">{usd(r.costUsdMicros)}</td><td className="text-[12px] text-niebla">{r.note}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}

export function ClearForPilotButton({ contactId, disabled }: { contactId: string; disabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button size="sm" disabled={pending || disabled} onClick={async () => {
      if (!(await askConfirm({ title: "Clear this contact for the pilot?", message: "Records that you assessed the lawful basis (legitimate interest, 1:1, B2B role). The engine may then draft a message for your approval. Nothing is sent." }))) return;
      start(async () => { const r = await clearForPilotAction(contactId); if (r.ok) { toast.ok("Cleared for the pilot."); router.refresh(); } else toast.bad(r.error); });
    }}>Clear</Button>
  );
}
