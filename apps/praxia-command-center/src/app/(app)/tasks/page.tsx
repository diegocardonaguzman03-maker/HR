import Link from "next/link";
import { getContext } from "@/server/context";
import { listTasks, EXECUTION_ENGINE } from "@/server/services/agents";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { TaskControls } from "./TaskControls";
import { PRIORITY_LABEL, isOverdue } from "@/domain/tasks";
import { todayIso } from "@/server/services/common";

export const metadata = { title: "Tasks" };

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ agent?: string }> }) {
  const { db } = await getContext();
  const { agent } = await searchParams;
  const tasks = await listTasks(db, agent ? { agentId: agent } : {});
  const today = todayIso();
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader label="AI organization" title={agent ? `Tasks · ${agent}` : "Agent tasks"} actions={<Link href="/world" className="inline-flex items-center rounded-lg border border-hair px-3 py-1.5 text-[13px] hover:bg-graphite-3">Manage in PRAXIA World</Link>}
        description={<>Every task is a persistent record with an auditable event trail. {EXECUTION_ENGINE.connected ? null : <>No engine runs tasks yet: when you work a task yourself (for example running the agent in Claude Code), record its status and output here — it is labelled as a <em>manual update by founder</em>.</>}</>} />
      {!tasks.length ? <EmptyState title="No tasks yet">Assign tasks from an agent's page, an opportunity, or the decision feed.</EmptyState> : (
        <Card className="overflow-x-auto">
          <table className="px-table">
            <thead><tr><th>Created</th><th>Agent</th><th>Task</th><th>Priority</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-[12px]">{t.createdAt.slice(0, 10)}</td>
                  <td><Link href={`/agents/${t.agentId}`} className="font-mono text-[12px] text-indigo-soft hover:underline">{t.agentId}</Link></td>
                  <td className="max-w-[420px]">{t.title}{t.instructions && <div className="line-clamp-2 text-[12px] text-mute">{t.instructions}</div>}{t.output && <div className="text-[12px] text-ok">Output: {t.output}</div>}{t.errorMessage && <div className="text-[12px] text-bad">{t.errorMessage}</div>}</td>
                  <td className="text-[12px]">{PRIORITY_LABEL[t.priority]}</td>
                  <td className={`font-mono text-[12px] ${isOverdue(t, today) ? "text-bad" : ""}`}>{t.dueDate ?? "—"}</td>
                  <td><Badge tone={t.status === "completed" ? "ok" : t.status === "working" ? "indigo" : t.status === "error" ? "bad" : t.status === "cancelled" ? "neutral" : "warn"}>{t.status.replace("_", " ")}</Badge>{t.status === "working" && <div className="mt-1 font-mono text-[11px] text-mute">{t.progress}%</div>}</td>
                  <td><TaskControls id={t.id} status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
