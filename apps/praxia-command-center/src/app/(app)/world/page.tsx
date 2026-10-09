import { getContext } from "@/server/context";
import { listAgentsWithStatus, EXECUTION_ENGINE } from "@/server/services/agents";
import { WorldHost } from "./WorldHost";

export const metadata = { title: "PRAXIA World" };

export default async function WorldPage({ searchParams }: { searchParams: Promise<{ agent?: string }> }) {
  const { db } = await getContext();
  const { agent } = await searchParams;
  const agents = await listAgentsWithStatus(db);
  return (
    <WorldHost
      initialSelected={agent ?? null}
      engineNote={EXECUTION_ENGINE.connected ? null : EXECUTION_ENGINE.reason}
      agents={agents.map((a) => ({
        id: a.id, role: a.role, department: a.department, status: a.status, statusNote: a.statusNote, currentTaskTitle: a.currentTask?.title ?? null, avatar: a.avatar,
        team: a.team, description: a.description, skills: a.skills, tasksCompleted: a.tasksCompleted, tasksOpen: a.tasksOpen, costUsdMicros: a.costUsdMicros,
      }))}
    />
  );
}
