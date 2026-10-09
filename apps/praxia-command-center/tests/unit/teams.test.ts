import { describe, it, expect } from "vitest";
import agents from "@/server/seed/agents.json";
import { TEAMS, buildOrgTree, teamIdOf, teamOf, type OrgNode } from "@/domain/teams";

describe("company structure (team design)", () => {
  it("every registry agent belongs to one of the eight delivery teams, as in the design", () => {
    for (const a of agents) expect(teamIdOf(a.team), a.id).not.toBeNull();
    const members = (id: string) => agents.filter((a) => teamIdOf(a.team) === id).map((a) => a.id).sort();
    expect(members("E1")).toEqual(["CEO-01", "STR-01"]);
    expect(members("E2")).toEqual(["SAL-01", "SAL-02", "SAL-03"]);
    expect(members("E3")).toEqual(["DSN-01", "MKT-01", "MKT-02", "MKT-03", "PR-01"]);
    expect(members("E8")).toEqual(["QA-01", "RISK-01"]);
    expect(TEAMS).toHaveLength(8);
  });

  it("parses team ids and rejects unknown ones", () => {
    expect(teamIdOf("E5 Research, Datos e IP")).toBe("E5");
    expect(teamIdOf("E9 Nothing")).toBeNull();
    expect(teamIdOf(undefined)).toBeNull();
    expect(teamOf("E4 Delivery y Adopción")?.workflows).toEqual(["WF02", "WF05"]);
  });

  it("builds the reporting tree from the Founder with all 28 agents", () => {
    const tree = buildOrgTree(agents);
    expect(tree.id).toBe("Founder");
    expect(tree.children.map((c) => c.id)).toEqual(["CEO-01"]);
    const ceo = tree.children[0]!;
    expect(ceo.children.map((c) => c.id)).toContain("SAL-01");
    const count = (n: OrgNode<unknown>): number => n.children.reduce((s, c) => s + 1 + count(c), 0);
    expect(count(tree)).toBe(28);
  });

  it("keeps agents with a missing manager or a reporting cycle visible", () => {
    const tree = buildOrgTree([
      { id: "A", reportsTo: "Nobody" },
      { id: "B", reportsTo: "C" },
      { id: "C", reportsTo: "B" },
    ]);
    const ids = JSON.stringify(tree);
    for (const id of ["A", "B", "C"]) expect(ids).toContain(`"id":"${id}"`);
  });
});
