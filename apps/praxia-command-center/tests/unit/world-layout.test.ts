import { describe, it, expect } from "vitest";
import { AGENT_STATUSES } from "@/server/db/schema";
import { TEAM_IDS } from "@/domain/teams";
import {
  DESKS_PER_ROOM,
  GRID_H,
  GRID_W,
  OVERFLOW_SPOTS,
  STATUS_VISUALS,
  TILE_H,
  TILE_W,
  WORLD_AREAS,
  WORLD_FURNITURE,
  ZOOM_MAX,
  ZOOM_MIN,
  assignSeats,
  clampZoom,
  depthOf,
  fitCamera,
  fromIso,
  resolveAnimation,
  resolvePose,
  roomForTeam,
  statusVisual,
  toIso,
  worldBounds,
} from "@/features/world/layout";

/** The 28-agent registry shape (ids and delivery teams), taken from the seed. */
const REGISTRY: { id: string; team: string }[] = [
  ["CEO-01", "E1 Dirección"],
  ["STR-01", "E1 Dirección"],
  ["RES-01", "E5 Research, Datos e IP"],
  ["RES-02", "E5 Research, Datos e IP"],
  ["SAL-01", "E2 Revenue"],
  ["SAL-02", "E2 Revenue"],
  ["SAL-03", "E2 Revenue"],
  ["MKT-01", "E3 Marca y Demanda"],
  ["MKT-02", "E3 Marca y Demanda"],
  ["MKT-03", "E3 Marca y Demanda"],
  ["PR-01", "E3 Marca y Demanda"],
  ["DEL-01", "E4 Delivery y Adopción"],
  ["DEL-02", "E4 Delivery y Adopción"],
  ["DEL-03", "E4 Delivery y Adopción"],
  ["DEV-01", "E6 Producto y Experiencia"],
  ["DEV-02", "E6 Producto y Experiencia"],
  ["DEV-03", "E6 Producto y Experiencia"],
  ["UX-01", "E6 Producto y Experiencia"],
  ["UI-01", "E6 Producto y Experiencia"],
  ["DSN-01", "E3 Marca y Demanda"],
  ["OPS-01", "E7 Operaciones y Personas"],
  ["FIN-01", "E7 Operaciones y Personas"],
  ["HR-01", "E7 Operaciones y Personas"],
  ["COM-01", "E7 Operaciones y Personas"],
  ["CX-01", "E4 Delivery y Adopción"],
  ["DAT-01", "E5 Research, Datos e IP"],
  ["RISK-01", "E8 Gobierno"],
  ["QA-01", "E8 Gobierno"],
].map(([id, team]) => ({ id: id as string, team: team as string }));

const seatSnapshot = (agents: { id: string; team: string }[]) =>
  Object.fromEntries([...assignSeats(agents)].map(([id, s]) => [id, s.key]));

describe("toIso", () => {
  it("projects tiles onto a 2:1 isometric grid", () => {
    expect(TILE_W).toBe(2 * TILE_H);
    expect(toIso(0, 0)).toEqual({ x: 0, y: 0 });
    expect(toIso(1, 0)).toEqual({ x: TILE_W / 2, y: TILE_H / 2 });
    expect(toIso(0, 1)).toEqual({ x: -TILE_W / 2, y: TILE_H / 2 });
    expect(toIso(1, 1)).toEqual({ x: 0, y: TILE_H });
    expect(toIso(2, 3)).toEqual({ x: -TILE_W / 2, y: (5 * TILE_H) / 2 });
  });

  it("is linear and inverted by fromIso", () => {
    for (const [x, y] of [
      [0, 0],
      [3.5, 1.25],
      [-2, 7],
      [22, 22],
    ] as const) {
      const p = toIso(x, y);
      const back = fromIso(p.x, p.y);
      expect(back.x).toBeCloseTo(x, 10);
      expect(back.y).toBeCloseTo(y, 10);
    }
  });

  it("orders depth back-to-front along x + y", () => {
    expect(depthOf(1, 1)).toBeGreaterThan(depthOf(0, 1));
    expect(depthOf(3, 0)).toBe(depthOf(0, 3));
  });
});

describe("room layout", () => {
  it("gives every delivery team exactly one room", () => {
    for (const team of TEAM_IDS) {
      const rooms = WORLD_AREAS.filter((a) => a.team === team);
      expect(rooms, team).toHaveLength(1);
      expect(roomForTeam(team)?.team).toBe(team);
    }
    expect(roomForTeam("E3 Marca y Demanda")?.team).toBe("E3");
    expect(WORLD_AREAS.filter((a) => a.kind === "team")).toHaveLength(TEAM_IDS.length);
    expect(roomForTeam("Unknown team")).toBeNull();
  });

  it("includes the founder's office and the shared areas: reception, café, conference and terrace", () => {
    const kinds = WORLD_AREAS.map((a) => a.kind);
    for (const kind of ["founder", "reception", "cafe", "conference", "terrace"] as const) expect(kinds).toContain(kind);
    expect(WORLD_AREAS).toHaveLength(13);
  });

  it("keeps areas inside the grid and never overlapping", () => {
    const occupied = new Map<string, string>();
    for (const a of WORLD_AREAS) {
      expect(a.x).toBeGreaterThanOrEqual(0);
      expect(a.y).toBeGreaterThanOrEqual(0);
      expect(a.x + a.w).toBeLessThanOrEqual(GRID_W);
      expect(a.y + a.h).toBeLessThanOrEqual(GRID_H);
      for (let x = a.x; x < a.x + a.w; x++) {
        for (let y = a.y; y < a.y + a.h; y++) {
          const key = `${x},${y}`;
          expect(occupied.get(key), `${a.id} overlaps ${occupied.get(key)}`).toBeUndefined();
          occupied.set(key, a.id);
        }
      }
    }
  });

  it("places overflow spots on free tiles inside their area", () => {
    const furnitureTiles = new Set<string>();
    for (const f of WORLD_FURNITURE) {
      if (f.kind === "wall-screen") continue; // mounted on the wall, not on the floor
      for (let x = f.x; x < f.x + f.w; x++) for (let y = f.y; y < f.y + f.h; y++) furnitureTiles.add(`${x},${y}`);
    }
    const keys = OVERFLOW_SPOTS.map((s) => `${s.x},${s.y}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of OVERFLOW_SPOTS) {
      expect(furnitureTiles.has(`${s.x},${s.y}`), `${s.areaId} ${s.x},${s.y}`).toBe(false);
      const area = WORLD_AREAS.find((a) => a.id === s.areaId);
      expect(area).toBeDefined();
      if (!area) continue;
      expect(s.x >= area.x && s.x < area.x + area.w && s.y >= area.y && s.y < area.y + area.h).toBe(true);
    }
  });
});

describe("seat assignment", () => {
  it("gives the 28 registry agents unique desk seats in their own team room", () => {
    expect(REGISTRY).toHaveLength(28);
    const seats = assignSeats(REGISTRY);
    expect(seats.size).toBe(28);
    const keys = [...seats.values()].map((s) => s.key);
    expect(new Set(keys).size).toBe(28);
    const tiles = [...seats.values()].map((s) => `${s.x},${s.y}`);
    expect(new Set(tiles).size).toBe(28);
    for (const agent of REGISTRY) {
      const seat = seats.get(agent.id);
      expect(seat?.overflow).toBe(false);
      expect(seat?.desk).not.toBeNull();
      expect(seat?.areaId).toBe(roomForTeam(agent.team)?.id);
    }
  });

  it("is deterministic and independent of input order", () => {
    const base = seatSnapshot(REGISTRY);
    expect(seatSnapshot(REGISTRY)).toEqual(base);
    expect(seatSnapshot([...REGISTRY].reverse())).toEqual(base);
    const shuffled = [...REGISTRY].sort((a, b) => (a.id.length * 31 + a.id.charCodeAt(1)) - (b.id.length * 31 + b.id.charCodeAt(1)));
    expect(seatSnapshot(shuffled)).toEqual(base);
  });

  it("assigns desks within a room in ascending id order", () => {
    const seats = assignSeats(REGISTRY);
    // E3 has five people, so it gets a double room.
    expect(seats.get("DSN-01")?.deskIndex).toBe(0);
    expect(seats.get("MKT-01")?.deskIndex).toBe(1);
    expect(seats.get("MKT-02")?.deskIndex).toBe(2);
    expect(seats.get("MKT-03")?.deskIndex).toBe(3);
    expect(seats.get("PR-01")?.deskIndex).toBe(4);
    expect(seats.get("PR-01")?.areaId).toBe("team-e3");
  });

  it("sends agents beyond room capacity or with unknown teams to unique overflow spots", () => {
    const crowded = Array.from({ length: DESKS_PER_ROOM + 3 }, (_, i) => ({
      id: `X-${String(i).padStart(2, "0")}`,
      team: "E2 Revenue",
    }));
    const stray = { id: "ZZ-01", team: "Not A Team" };
    const seats = assignSeats([...crowded, stray]);
    expect(seats.size).toBe(crowded.length + 1);
    expect([...seats.values()].filter((s) => s.overflow)).toHaveLength(4);
    expect(seats.get("ZZ-01")?.overflow).toBe(true);
    expect(new Set([...seats.values()].map((s) => s.key)).size).toBe(seats.size);
  });
});

describe("status → pose", () => {
  it("covers every status in the schema", () => {
    for (const status of AGENT_STATUSES) expect(STATUS_VISUALS[status], status).toBeDefined();
    expect(Object.keys(STATUS_VISUALS).sort()).toEqual([...AGENT_STATUSES].sort());
  });

  it("maps offline to a seated, dimmed, non-animated pose", () => {
    const v = STATUS_VISUALS.offline;
    expect(v.pose).toBe("seated");
    expect(v.animation).toBe("none");
    expect(v.monitorOn).toBe(false);
    expect(v.alpha).toBeCloseTo(0.45, 2);
    expect(resolveAnimation("offline", 0, false)).toBe("none");
  });

  it("uses the typing pose, typing animation and lit monitor only for working", () => {
    for (const status of AGENT_STATUSES) {
      const v = STATUS_VISUALS[status];
      const isWorking = status === "working";
      expect(v.pose === "typing", status).toBe(isWorking);
      expect(v.settlePose === "typing", status).toBe(isWorking);
      expect(v.animation === "typing", status).toBe(isWorking);
      expect(v.monitorOn, status).toBe(isWorking);
      for (const ms of [0, 1000, 10_000]) expect(resolvePose(status, ms) === "typing", `${status}@${ms}`).toBe(isWorking);
    }
  });

  it("degrades unknown statuses to offline instead of inventing activity", () => {
    expect(statusVisual("busy")).toBe(STATUS_VISUALS.offline);
    expect(resolvePose("busy", 0)).toBe("seated");
  });

  it("shows waiting and error states as standing with a bubble", () => {
    expect(STATUS_VISUALS.waiting_approval).toMatchObject({ pose: "idle", bubble: "approval", tone: "clay" });
    expect(STATUS_VISUALS.waiting_input).toMatchObject({ pose: "idle", bubble: "input", tone: "clay" });
    expect(STATUS_VISUALS.error).toMatchObject({ pose: "idle", bubble: "error", tone: "error" });
    expect(STATUS_VISUALS.available).toMatchObject({ pose: "idle", animation: "none", bubble: null });
  });

  it("celebrates completion briefly, then settles", () => {
    expect(resolvePose("completed", 0)).toBe("celebrate");
    expect(resolveAnimation("completed", 0, false)).toBe("celebrate");
    expect(resolvePose("completed", 60_000)).toBe("idle");
    expect(resolveAnimation("completed", 60_000, false)).toBe("none");
  });

  it("turns every animation off under reduced motion", () => {
    for (const status of AGENT_STATUSES) expect(resolveAnimation(status, 0, true)).toBe("none");
  });
});

describe("camera", () => {
  it("clamps zoom to 0.6–2.0, relaxing the floor only to fit a small viewport", () => {
    expect(ZOOM_MIN).toBe(0.6);
    expect(ZOOM_MAX).toBe(2);
    expect(clampZoom(5)).toBe(2);
    expect(clampZoom(0.1)).toBe(0.6);
    expect(clampZoom(1.3)).toBe(1.3);
    expect(clampZoom(0.1, 0.4)).toBe(0.4);
  });

  it("fits the whole HQ inside the viewport", () => {
    const b = worldBounds();
    const f = fitCamera(1200, 800, 24);
    expect(b.width * f.scale).toBeLessThanOrEqual(1200 - 48 + 1e-6);
    expect(b.height * f.scale).toBeLessThanOrEqual(800 - 48 + 1e-6);
    // centred
    expect(f.x + (b.x + b.width / 2) * f.scale).toBeCloseTo(600, 6);
    expect(f.y + (b.y + b.height / 2) * f.scale).toBeCloseTo(400, 6);
  });
});
