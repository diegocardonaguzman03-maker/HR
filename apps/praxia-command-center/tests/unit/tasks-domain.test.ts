import { describe, it, expect } from "vitest";
import { canTransition, columnOf, compareTasks, dropTarget, isOverdue } from "@/domain/tasks";
import { arcPoint, flightForEvent, workActivity, WORLD_AREAS } from "@/features/world/layout";
import { WORLD_DEPARTMENTS } from "@/features/world/types";

describe("task rules", () => {
  it("drop targets follow the transition table", () => {
    expect(dropTarget("queued", "working")).toBe("working");
    expect(dropTarget("queued", "done")).toBeNull(); // must be worked first
    expect(dropTarget("working", "waiting")).toBe("waiting_input");
    expect(dropTarget("waiting_approval", "done")).toBe("completed");
    expect(dropTarget("error", "queued")).toBe("queued");
    expect(dropTarget("completed", "working")).toBeNull();
    expect(dropTarget("working", "working")).toBeNull();
    for (const col of ["queued", "working", "waiting", "error", "done"] as const) {
      const to = dropTarget("working", col);
      if (to) expect(canTransition("working", to)).toBe(true);
    }
  });

  it("maps statuses to columns", () => {
    expect(columnOf("waiting_approval")).toBe("waiting");
    expect(columnOf("cancelled")).toBeNull();
  });

  it("overdue only for open tasks with a past due date", () => {
    expect(isOverdue({ status: "working", dueDate: "2026-10-08" }, "2026-10-09")).toBe(true);
    expect(isOverdue({ status: "working", dueDate: "2026-10-09" }, "2026-10-09")).toBe(false);
    expect(isOverdue({ status: "completed", dueDate: "2026-01-01" }, "2026-10-09")).toBe(false);
    expect(isOverdue({ status: "queued", dueDate: null }, "2026-10-09")).toBe(false);
  });

  it("sorts by priority, then due date, then age", () => {
    const t = (priority: "urgent" | "high" | "normal" | "low", dueDate: string | null, createdAt: string) => ({ priority, dueDate, createdAt });
    const list = [t("normal", null, "1"), t("urgent", null, "3"), t("normal", "2026-10-10", "2"), t("normal", "2026-10-10", "1")];
    expect(list.sort(compareTasks)).toEqual([t("urgent", null, "3"), t("normal", "2026-10-10", "1"), t("normal", "2026-10-10", "2"), t("normal", null, "1")]);
  });
});

describe("PRAXIA World work visuals", () => {
  it("every department has a work visual; unknown ones get a neutral one", () => {
    for (const d of WORLD_DEPARTMENTS) expect(workActivity(d).glyphs.length).toBeGreaterThan(0);
    expect(workActivity("Unknown").label).toBe("Working");
  });

  it("flights play only for real event types; a handoff names its origin agent", () => {
    expect(flightForEvent("task_queued", "")?.kind).toBe("assign");
    expect(flightForEvent("task_completed", "")?.kind).toBe("deliver");
    expect(flightForEvent("task_reassigned", "Reassigned from SAL-02 (manual update by founder)")).toEqual({ kind: "handoff", fromAgentId: "SAL-02" });
    expect(flightForEvent("task_reassigned", "Reassigned to SAL-03")).toBeNull(); // the sending side plays nothing
    expect(flightForEvent("task_updated", "")).toBeNull();
    expect(flightForEvent("made_up", "")).toBeNull();
  });

  it("arcs start and end at their endpoints and rise in between", () => {
    const a = { x: 0, y: 100 };
    const b = { x: 200, y: 100 };
    expect(arcPoint(a, b, 0)).toEqual(a);
    expect(arcPoint(a, b, 1)).toEqual(b);
    expect(arcPoint(a, b, 0.5).y).toBeLessThan(100);
  });

  it("the founder desk is in Main Reception", () => {
    expect(WORLD_AREAS.some((x) => x.id === "reception")).toBe(true);
  });
});
