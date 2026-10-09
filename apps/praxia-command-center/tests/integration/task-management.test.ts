import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { agentEvents, agents, auditLog } from "@/server/db/schema";
import { freshDb } from "../helpers";
import { createTask, listAgentsWithStatus, listBoard, listEvents, listTaskEvents, reassignTask, updateTask, updateTaskStatus } from "@/server/services/agents";

let db: DB;
beforeEach(async () => {
  db = await freshDb();
});

const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

describe("task management (PRAXIA World mission control)", () => {
  it("creates tasks with priority and due date; overdue is counted only for open tasks", async () => {
    const t = await createTask(db, { agentId: "SAL-03", title: "Draft proposal", priority: "urgent", dueDate: yesterday() });
    expect(t.priority).toBe("urgent");
    expect(t.dueDate).toBe(yesterday());
    const board = await listBoard(db);
    expect(board.tasks.find((x) => x.id === t.id)?.overdue).toBe(true);
    let sal = (await listAgentsWithStatus(db)).find((a) => a.id === "SAL-03")!;
    expect(sal.tasksQueued).toBe(1);
    expect(sal.tasksOverdue).toBe(1);
    await updateTaskStatus(db, t.id, "working");
    await updateTaskStatus(db, t.id, "completed", { output: "proposals/draft.md" });
    sal = (await listAgentsWithStatus(db)).find((a) => a.id === "SAL-03")!;
    expect(sal.tasksOverdue).toBe(0);
    expect((await listBoard(db)).tasks.find((x) => x.id === t.id)?.overdue).toBe(false);
  });

  it("rejects malformed due dates and treats an empty one as none", async () => {
    await expect(createTask(db, { agentId: "SAL-03", title: "Bad date", dueDate: "10/09/2026" })).rejects.toThrow(/YYYY-MM-DD/);
    const t = await createTask(db, { agentId: "SAL-03", title: "No date", dueDate: "" });
    expect(t.dueDate).toBeNull();
  });

  it("records progress only while the task is worked, and completion sets it to 100", async () => {
    const t = await createTask(db, { agentId: "DEV-02", title: "Build prototype" });
    await expect(updateTask(db, t.id, { progress: 30 })).rejects.toThrow(/in progress/);
    await updateTaskStatus(db, t.id, "working");
    await updateTask(db, t.id, { progress: 40, priority: "high" });
    const dev = (await listAgentsWithStatus(db)).find((a) => a.id === "DEV-02")!;
    expect(dev.currentTask).toMatchObject({ id: t.id, progress: 40, priority: "high" });
    await expect(updateTask(db, t.id, { progress: 100 })).rejects.toThrow(/Complete/);
    const done = await updateTaskStatus(db, t.id, "completed", { output: "apps/prototype" });
    expect(done.progress).toBe(100);
    await expect(updateTask(db, t.id, { title: "Renamed" })).rejects.toThrow(/no longer be edited/);
    const ev = await listTaskEvents(db, t.id);
    expect(ev.some((e) => e.type === "task_updated" && e.message.includes("progress 40%"))).toBe(true);
  });

  it("an update with no changes writes nothing", async () => {
    const t = await createTask(db, { agentId: "DEV-02", title: "Same" });
    const before = (await db.select().from(auditLog)).length;
    await updateTask(db, t.id, { title: "Same", priority: "normal" });
    expect((await db.select().from(auditLog)).length).toBe(before);
  });

  it("reassigns an open task: back to the new agent's queue, progress reset, an event on both agents", async () => {
    const t = await createTask(db, { agentId: "SAL-02", title: "Account brief" });
    await updateTaskStatus(db, t.id, "working");
    await updateTask(db, t.id, { progress: 50 });
    const moved = await reassignTask(db, t.id, "SAL-03");
    expect(moved).toMatchObject({ agentId: "SAL-03", status: "queued", progress: 0, startedAt: null });
    const ev = await db.select().from(agentEvents).where(eq(agentEvents.taskId, t.id));
    expect(ev.find((e) => e.agentId === "SAL-02" && e.type === "task_reassigned")?.message).toMatch(/Reassigned to SAL-03/);
    expect(ev.find((e) => e.agentId === "SAL-03" && e.type === "task_reassigned")?.message).toMatch(/Reassigned from SAL-02/);
    await expect(reassignTask(db, t.id, "SAL-03")).rejects.toThrow(/already assigned/);
    await expect(reassignTask(db, t.id, "NOPE-01")).rejects.toThrow(/Unknown agent/);
  });

  it("does not reassign tasks waiting for approval, closed tasks, or to deactivated agents", async () => {
    const t = await createTask(db, { agentId: "MKT-02", title: "Article" });
    await updateTaskStatus(db, t.id, "working");
    await updateTaskStatus(db, t.id, "waiting_approval");
    await expect(reassignTask(db, t.id, "MKT-01")).rejects.toThrow(/cannot be reassigned/);
    const u = await createTask(db, { agentId: "MKT-02", title: "Post" });
    await db.update(agents).set({ active: false }).where(eq(agents.id, "MKT-03"));
    await expect(reassignTask(db, u.id, "MKT-03")).rejects.toThrow(/deactivated/);
  });

  it("the board holds open tasks and recent completions, never cancelled ones", async () => {
    const a = await createTask(db, { agentId: "OPS-01", title: "Open one" });
    const b = await createTask(db, { agentId: "OPS-01", title: "Cancelled one" });
    await updateTaskStatus(db, b.id, "cancelled");
    const ids = (await listBoard(db)).tasks.map((t) => t.id);
    expect(ids).toContain(a.id);
    expect(ids).not.toContain(b.id);
  });

  it("events after a cursor are exactly the new ones (what PRAXIA World animates)", async () => {
    await createTask(db, { agentId: "FIN-01", title: "Cash forecast" });
    const all = await listEvents(db);
    const cursor = all[0]!.at;
    await new Promise((r) => setTimeout(r, 5));
    const t = await createTask(db, { agentId: "FIN-01", title: "Margin review" });
    const fresh = await listEvents(db, cursor);
    expect(fresh.map((e) => e.taskId)).toEqual([t.id]);
  });
});

describe("backlog import", () => {
  it("creates delivered tasks with outputs and queued pending ones, never in progress; idempotent", async () => {
    const { importBacklog, BACKLOG } = await import("@/server/seed/backlog");
    const r = await importBacklog(db);
    expect(r.created).toBe(BACKLOG.length);
    const board = await listBoard(db);
    expect(board.tasks.some((t) => t.status === "working")).toBe(false);
    expect(board.tasks.filter((t) => t.status === "completed").every((t) => !!t.output)).toBe(true);
    expect((await importBacklog(db)).created).toBe(0);
    expect((await listAgentsWithStatus(db)).every((a) => a.status === "offline")).toBe(true);
  });
});
