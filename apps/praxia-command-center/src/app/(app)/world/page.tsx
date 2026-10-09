import { getContext } from "@/server/context";
import { listAgentsWithStatus, listBoard, listEvents, EXECUTION_ENGINE } from "@/server/services/agents";
import { WorldHost } from "./WorldHost";

export const metadata = { title: "PRAXIA World" };

export default async function WorldPage({ searchParams }: { searchParams: Promise<{ agent?: string }> }) {
  const { db } = await getContext();
  const { agent } = await searchParams;
  const [agents, board, recent] = await Promise.all([listAgentsWithStatus(db), listBoard(db), listEvents(db, undefined, 60)]);
  return (
    <WorldHost
      initialSelected={agent ?? null}
      engineNote={EXECUTION_ENGINE.connected ? null : EXECUTION_ENGINE.reason}
      tasks={board.tasks}
      feed={recent}
      lastEventAt={recent[0]?.at ?? null}
      agents={agents.map((a) => ({
        id: a.id, role: a.role, department: a.department, status: a.status, statusSource: a.statusSource, statusNote: a.statusNote, currentTaskTitle: a.currentTask?.title ?? null,
        currentTaskProgress: a.currentTask?.progress ?? null, reportsTo: a.reportsTo, tasksQueued: a.tasksQueued, tasksOverdue: a.tasksOverdue, avatar: a.avatar, active: a.active,
        team: a.team, description: a.description, skills: a.skills, tasksCompleted: a.tasksCompleted, tasksOpen: a.tasksOpen, costUsdMicros: a.costUsdMicros,
      }))}
    />
  );
}
