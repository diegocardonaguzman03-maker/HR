import Link from "next/link";
import { getContext } from "@/server/context";
import { listAgentsWithStatus, EXECUTION_ENGINE } from "@/server/services/agents";
import { Card, PageHeader } from "@/components/ui/primitives";
import { AgentStatusBadge } from "@/components/agents/StatusBadge";

export const metadata = { title: "AI Agents" };

export default async function AgentsPage() {
  const { db } = await getContext();
  const agents = await listAgentsWithStatus(db);
  const depts = [...new Set(agents.map((a) => a.department))];
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader label="AI organization · 28 roles · all active (decision D-P01 = C)" title="Agent registry"
        description={<>Configuration lives in the database and in each agent's instruction file (<code className="font-mono text-[12px]">.claude/agents/praxia-*.md</code>), not in application code. {EXECUTION_ENGINE.connected ? "" : <span className="text-warn">{EXECUTION_ENGINE.reason}</span>}</>} />
      <div className="flex flex-col gap-8">
        {depts.map((d) => (
          <section key={d}>
            <div className="px-label mb-3">{d}</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {agents.filter((a) => a.department === d).map((a) => (
                <Link key={a.id} href={`/agents/${a.id}`}>
                  <Card className="h-full p-4 transition-colors hover:border-niebla/40">
                    <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[12px] text-indigo-soft">{a.id}</span><AgentStatusBadge status={a.status} title={a.statusNote} manual={a.statusSource === "manual"} /></div>
                    <div className="font-display text-[14.5px] font-semibold leading-snug">{a.role}</div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-niebla">{a.description}</p>
                    <div className="mt-3 flex gap-4 font-mono text-[10.5px] text-mute"><span>{a.tasksCompleted} done</span><span>{a.tasksOpen} open</span><span>{a.team}</span></div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
