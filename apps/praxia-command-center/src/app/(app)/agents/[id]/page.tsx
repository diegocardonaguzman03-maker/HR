import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getContext } from "@/server/context";
import { agentEvents, agentTasks } from "@/server/db/schema";
import { listAgentsWithStatus } from "@/server/services/agents";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { AgentStatusBadge } from "@/components/agents/StatusBadge";
import { AssignTask } from "@/components/agents/AssignTask";
import { AvatarEditor } from "./AvatarEditor";

function readInstructions(rel: string) {
  if (!/^\.claude\/agents\/praxia-[a-z0-9-]+\.md$/.test(rel)) return null; // allowlist: never read arbitrary repo files
  // Instruction files live at the repository root (two levels above the app).
  for (const base of [path.resolve(process.cwd(), "../.."), process.cwd()]) {
    const p = path.join(base, rel);
    if (p.startsWith(base + path.sep) && fs.existsSync(p) && fs.realpathSync(p).startsWith(base + path.sep)) return fs.readFileSync(p, "utf8");
  }
  return null;
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db } = await getContext();
  const all = await listAgentsWithStatus(db);
  const a = all.find((x) => x.id === id);
  if (!a) notFound();
  const [tasks, events] = await Promise.all([
    db.select().from(agentTasks).where(eq(agentTasks.agentId, id)).orderBy(desc(agentTasks.createdAt)).limit(50),
    db.select().from(agentEvents).where(eq(agentEvents.agentId, id)).orderBy(desc(agentEvents.at)).limit(30),
  ]);
  const instructions = readInstructions(a.instructionsPath);
  const outputs = tasks.filter((t) => t.status === "completed" && t.output);
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader label={`${a.department} · ${a.team} · reports to ${a.reportsTo}`} title={`${a.id} — ${a.role}`} description={a.description}
        actions={<><AssignTask agents={all.map((x) => ({ id: x.id, label: `${x.id} · ${x.role}` }))} defaultAgentId={a.id} /><Link href={`/world?agent=${a.id}`} className="inline-flex items-center rounded-lg border border-hair px-3 py-1.5 text-[13px] hover:bg-graphite-3">Find in PRAXIA World</Link></>} />
      <Card className="mb-6 grid grid-cols-2 gap-5 p-5 md:grid-cols-5">
        <Stat label="Status" value={<AgentStatusBadge status={a.status} manual={a.statusSource === "manual"} />} sub={a.statusNote} />
        <Stat label="Current task" value={a.currentTask?.title ?? "—"} />
        <Stat label="Tasks completed" value={a.tasksCompleted} />
        <Stat label="Open tasks" value={a.tasksOpen} />
        <Stat label="AI cost" value={a.costUsdMicros ? `USD ${(a.costUsdMicros / 1_000_000).toFixed(2)}` : "—"} sub="recorded execution cost (none until the engine runs)" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Work" title="Tasks & outputs" action={<Link href={`/tasks?agent=${a.id}`} className="text-[12px] text-niebla hover:text-ivory">Manage in Tasks →</Link>} />
            {!tasks.length ? <p className="text-[13px] text-mute">No tasks yet. Assign one — it is stored as a real task and queued.</p> : (
              <table className="px-table"><thead><tr><th>Created</th><th>Task</th><th>Origin</th><th>Status</th></tr></thead>
                <tbody>{tasks.map((t) => <tr key={t.id}><td className="font-mono text-[12px]">{t.createdAt.slice(0, 10)}</td><td>{t.title}{t.output && <div className="text-[12px] text-niebla">→ {t.output}</div>}</td><td className="text-[12px] text-mute">{t.origin.replace("_", " ")}</td><td><Badge>{t.status.replace("_", " ")}</Badge></td></tr>)}</tbody>
              </table>
            )}
            {outputs.length > 0 && <p className="mt-3 text-[12px] text-mute">{outputs.length} recorded output(s).</p>}
          </Card>
          <Card className="p-5">
            <SectionTitle label="Configuration" title="System instructions" />
            <p className="mb-3 text-[12px] text-mute">Source: <code className="font-mono">{a.instructionsPath}</code> (edit the file to change the agent — no code change needed).</p>
            {instructions ? <pre className="max-h-[420px] overflow-auto rounded-lg border border-hair bg-graphite p-4 text-[11.5px] leading-relaxed whitespace-pre-wrap text-niebla">{instructions}</pre> : <p className="text-[13px] text-warn">Instruction file not found from this deployment.</p>}
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle label="Capabilities" title="Skills & permissions" />
            <div className="px-label mb-2">Skills / deliverables</div>
            <ul className="mb-4 list-disc pl-4 text-[13px]">{a.skills.map((s) => <li key={s}>{s}</li>)}</ul>
            <div className="px-label mb-2">Allowed tools</div>
            <div className="mb-4 flex flex-wrap gap-1">{a.allowedTools.map((t) => <Badge key={t}>{t}</Badge>)}</div>
            <div className="px-label mb-1">Data access</div><p className="mb-3 text-[13px]">{a.dataAccessPolicy}</p>
            <div className="px-label mb-1">Model</div><p className="mb-3 text-[13px]">{a.modelConfig.provider ? `${a.modelConfig.provider} · ${a.modelConfig.model}` : "Not configured (Phase 2)"}</p>
            <div className="px-label mb-1">Escalation</div><p className="text-[13px]">{a.escalationRules}</p>
          </Card>
          <Card className="p-5" id="avatar"><SectionTitle label="PRAXIA World" title="Avatar" /><AvatarEditor agentId={a.id} initial={a.avatar} /></Card>
          <Card className="p-5">
            <SectionTitle label="Execution log" title="Events" />
            {events.length ? <ul className="flex flex-col gap-1.5 font-mono text-[11.5px]">{events.map((e) => <li key={e.id}><span className="text-mute">{e.at.slice(0, 16).replace("T", " ")}</span> {e.type.replace("task_", "")} <span className="text-niebla">{e.message}</span></li>)}</ul> : <p className="text-[13px] text-mute">No execution events recorded.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
