/**
 * PRAXIA World — pure layout and state logic (no PixiJS import, unit tested).
 *
 * Coordinate system
 * - Tile space: integer grid, `x` grows to the screen's lower-right and `y` to the screen's lower-left.
 * - Screen (world) space: 2:1 isometric projection via `toIso`. Elevation (height above the floor) is
 *   subtracted from the projected `y` by the renderer.
 * - Depth: objects are painted back to front by `depthOf(x, y) = x + y` measured at the object's footprint
 *   centre, which is the classic ordering for a 2:1 isometric grid.
 */
import { WORLD_DEPARTMENTS, type AgentStatus, type WorldAgent } from "./types";

export type WorldDepartment = (typeof WORLD_DEPARTMENTS)[number];

// ---------------------------------------------------------------------------------------------------------------
// Brand palette (Brand Guidelines v1.0, skill §14.1 / §15.1) as numeric colours for the renderer.
// ---------------------------------------------------------------------------------------------------------------
export const PRAXIA_COLORS = {
  graphite: 0x0c0d12,
  graphite2: 0x15161d,
  ivory: 0xf5f2ec,
  indigo: 0x5b4bff,
  violet: 0x8b5cf6,
  clay: 0xe9663c,
  niebla: 0xa7aab5,
  /** Not a brand token: muted red reserved for the error state only (UI-01 to confirm). */
  error: 0xe5484d,
} as const;

export const toCssHex = (color: number): string => `#${color.toString(16).padStart(6, "0").toUpperCase()}`;

// ---------------------------------------------------------------------------------------------------------------
// Isometric projection
// ---------------------------------------------------------------------------------------------------------------
export const TILE_W = 48;
export const TILE_H = 24;

export type Point = { x: number; y: number };

/** Projects tile coordinates to screen coordinates (2:1 isometric). */
export function toIso(x: number, y: number): Point {
  return { x: (x - y) * (TILE_W / 2), y: (x + y) * (TILE_H / 2) };
}

/** Inverse of `toIso` (screen → tile coordinates, at floor level). */
export function fromIso(sx: number, sy: number): Point {
  const a = sx / (TILE_W / 2);
  const b = sy / (TILE_H / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

/** Painter's-algorithm depth for an object whose footprint centre is at tile coordinates (x, y). */
export const depthOf = (x: number, y: number): number => x + y;

// ---------------------------------------------------------------------------------------------------------------
// HQ layout: a 4 × 4 grid of 5 × 5 rooms separated by 1-tile corridors, on a floating slab.
// ---------------------------------------------------------------------------------------------------------------
export const ROOM_SIZE = 5;
export const CORRIDOR = 1;
const CELL = ROOM_SIZE + CORRIDOR;
export const GRID_COLS = 4;
export const GRID_ROWS = 4;
export const GRID_W = GRID_COLS * ROOM_SIZE + (GRID_COLS - 1) * CORRIDOR; // 23
export const GRID_H = GRID_ROWS * ROOM_SIZE + (GRID_ROWS - 1) * CORRIDOR; // 23
/** The slab extends one tile beyond the rooms on every side. */
export const SLAB = { x: -1, y: -1, w: GRID_W + 2, h: GRID_H + 2 } as const;
export const SLAB_DEPTH = 14;
export const BACK_WALL_HEIGHT = 20;
export const FRONT_WALL_HEIGHT = 12;
export const RAIL_HEIGHT = 8;

export type AreaKind = "department" | "reception" | "cafe" | "conference" | "terrace";

export type WallStyle = "glass" | "rail" | "none";

export type WorldArea = {
  id: string;
  kind: AreaKind;
  /** Registry department this room hosts (department rooms only). */
  department: WorldDepartment | null;
  /** Short label painted on the back glass wall (rendered uppercase, Space Mono). */
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  backWalls: WallStyle;
  frontWalls: WallStyle;
  /** Door gaps on the front walls, in local tile offsets. */
  doors: { frontLeft: number[]; frontRight: number[] };
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const cellRect = (col: number, row: number, spanCols = 1) => ({
  x: col * CELL,
  y: row * CELL,
  w: spanCols * ROOM_SIZE + (spanCols - 1) * CORRIDOR,
  h: ROOM_SIZE,
});

const STANDARD_DOORS = { frontLeft: [2], frontRight: [2] };

function departmentRoom(department: WorldDepartment, label: string, col: number, row: number): WorldArea {
  return {
    id: `dept-${slug(department)}`,
    kind: "department",
    department,
    label,
    ...cellRect(col, row),
    backWalls: "glass",
    frontWalls: "glass",
    doors: STANDARD_DOORS,
  };
}

/**
 * The room layout table. Back of the HQ (top of the screen) holds leadership and strategy; the front holds
 * the public areas (Café, Main Reception, Terrace).
 */
export const WORLD_AREAS: readonly WorldArea[] = [
  departmentRoom("Executive Leadership", "Executive", 0, 0),
  departmentRoom("Strategy & Research", "Strategy & Research", 1, 0),
  departmentRoom("Data, Quality & Governance", "Data · QA · Gov", 2, 0),
  departmentRoom("Operations & Finance", "Ops & Finance", 3, 0),
  departmentRoom("Product & Engineering", "Product & Eng", 0, 1),
  departmentRoom("UX, UI & Creative Design", "UX · UI · Design", 1, 1),
  departmentRoom("Client Delivery", "Client Delivery", 2, 1),
  departmentRoom("Customer Success", "Customer Success", 3, 1),
  departmentRoom("Sales & Business Development", "Sales & Biz Dev", 0, 2),
  departmentRoom("Marketing & Public Relations", "Marketing & PR", 1, 2),
  departmentRoom("Human Resources & Internal Communications", "HR & Internal Comms", 2, 2),
  {
    id: "conference",
    kind: "conference",
    department: null,
    label: "Conference",
    ...cellRect(3, 2),
    backWalls: "glass",
    frontWalls: "glass",
    doors: STANDARD_DOORS,
  },
  {
    id: "cafe",
    kind: "cafe",
    department: null,
    label: "Café",
    ...cellRect(0, 3),
    backWalls: "glass",
    frontWalls: "none",
    doors: { frontLeft: [], frontRight: [] },
  },
  {
    id: "reception",
    kind: "reception",
    department: null,
    label: "Main Reception",
    ...cellRect(1, 3),
    backWalls: "glass",
    frontWalls: "none",
    doors: { frontLeft: [], frontRight: [] },
  },
  {
    id: "terrace",
    kind: "terrace",
    department: null,
    label: "Terrace",
    ...cellRect(2, 3, 2),
    backWalls: "rail",
    frontWalls: "rail",
    doors: { frontLeft: [5], frontRight: [] },
  },
];

const roomByDepartment = new Map<WorldDepartment, WorldArea>();
for (const area of WORLD_AREAS) if (area.department) roomByDepartment.set(area.department, area);

export const isWorldDepartment = (value: string): value is WorldDepartment =>
  (WORLD_DEPARTMENTS as readonly string[]).includes(value);

/** Returns the room that hosts a department, or null for an unknown department. */
export function roomForDepartment(department: string): WorldArea | null {
  return isWorldDepartment(department) ? (roomByDepartment.get(department) ?? null) : null;
}

export function areaById(id: string): WorldArea | null {
  return WORLD_AREAS.find((a) => a.id === id) ?? null;
}

// ---------------------------------------------------------------------------------------------------------------
// Furniture (declarative; the renderer draws each kind).
// ---------------------------------------------------------------------------------------------------------------
export type FurnitureKind =
  | "desk"
  | "chair"
  | "plant"
  | "coffee-counter"
  | "coffee-machine"
  | "bistro-table"
  | "reception-counter"
  | "sofa"
  | "conference-table"
  | "conference-chair"
  | "wall-screen"
  | "planter"
  | "parasol-table"
  | "lounger";

/** Absolute tile footprint. `seatIndex` links a desk/chair to the department seat it serves. */
export type FurnitureItem = {
  kind: FurnitureKind;
  areaId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  seatIndex?: number;
};

/** Department rooms: 4 workstations. The agent sits on the chair tile, the desk is the next tile toward +y. */
export const DESK_SEATS: readonly { chair: Point; desk: Point }[] = [
  { chair: { x: 1, y: 1 }, desk: { x: 1, y: 2 } },
  { chair: { x: 3, y: 1 }, desk: { x: 3, y: 2 } },
  { chair: { x: 1, y: 3 }, desk: { x: 1, y: 4 } },
  { chair: { x: 3, y: 3 }, desk: { x: 3, y: 4 } },
];
export const DESKS_PER_ROOM = DESK_SEATS.length;

type LocalItem = { kind: FurnitureKind; x: number; y: number; w?: number; h?: number; seatIndex?: number };

function localFurniture(area: WorldArea): LocalItem[] {
  switch (area.kind) {
    case "department":
      return [
        ...DESK_SEATS.flatMap((s, i): LocalItem[] => [
          { kind: "chair", ...s.chair, seatIndex: i },
          { kind: "desk", ...s.desk, seatIndex: i },
        ]),
        { kind: "plant", x: 4, y: 4 },
        { kind: "plant", x: 0, y: 2 },
      ];
    case "conference":
      return [
        { kind: "wall-screen", x: 0, y: 1, w: 0, h: 3 },
        { kind: "conference-table", x: 1, y: 2, w: 3, h: 1 },
        { kind: "conference-chair", x: 1, y: 1 },
        { kind: "conference-chair", x: 2, y: 1 },
        { kind: "conference-chair", x: 3, y: 1 },
        { kind: "conference-chair", x: 1, y: 3 },
        { kind: "conference-chair", x: 2, y: 3 },
        { kind: "conference-chair", x: 3, y: 3 },
        { kind: "plant", x: 4, y: 4 },
      ];
    case "cafe":
      return [
        { kind: "coffee-counter", x: 0, y: 1 },
        { kind: "coffee-machine", x: 0, y: 2 },
        { kind: "coffee-counter", x: 0, y: 3 },
        { kind: "bistro-table", x: 2, y: 2 },
        { kind: "bistro-table", x: 3, y: 4 },
        { kind: "plant", x: 0, y: 4 },
        { kind: "plant", x: 4, y: 4 },
      ];
    case "reception":
      return [
        { kind: "reception-counter", x: 1, y: 1 },
        { kind: "reception-counter", x: 2, y: 1 },
        { kind: "reception-counter", x: 3, y: 1 },
        { kind: "sofa", x: 1, y: 3, w: 2, h: 1 },
        { kind: "plant", x: 0, y: 4 },
        { kind: "plant", x: 4, y: 4 },
      ];
    case "terrace":
      return [
        { kind: "planter", x: 0, y: 4 },
        { kind: "planter", x: 4, y: 4 },
        { kind: "planter", x: 8, y: 4 },
        { kind: "planter", x: 10, y: 0 },
        { kind: "planter", x: 10, y: 2 },
        { kind: "planter", x: 10, y: 4 },
        { kind: "parasol-table", x: 2, y: 2 },
        { kind: "parasol-table", x: 6, y: 2 },
        { kind: "lounger", x: 4, y: 2 },
        { kind: "lounger", x: 8, y: 2 },
      ];
  }
}

export const WORLD_FURNITURE: readonly FurnitureItem[] = WORLD_AREAS.flatMap((area) =>
  localFurniture(area).map((item) => ({
    kind: item.kind,
    areaId: area.id,
    x: area.x + item.x,
    y: area.y + item.y,
    w: item.w ?? 1,
    h: item.h ?? 1,
    ...(item.seatIndex === undefined ? {} : { seatIndex: item.seatIndex }),
  })),
);

// ---------------------------------------------------------------------------------------------------------------
// Seat assignment (deterministic by agent id).
// ---------------------------------------------------------------------------------------------------------------
export type Seat = {
  /** Unique key: `desk:<areaId>:<index>` or `overflow:<n>`. */
  key: string;
  areaId: string;
  /** Tile the agent occupies. */
  x: number;
  y: number;
  /** Desk in front of the agent, or null for overflow spots (no workstation). */
  desk: Point | null;
  deskIndex: number | null;
  overflow: boolean;
  /** Small screen-space nudge used only if overflow spots ever run out (keeps avatars from overlapping). */
  nudge: Point;
};

/**
 * Standing spots for agents without a desk (department full or unknown department), in fill order.
 * Every spot is a free tile (no furniture).
 */
export const OVERFLOW_SPOTS: readonly { areaId: string; x: number; y: number }[] = (() => {
  const local: { areaId: string; pts: [number, number][] }[] = [
    { areaId: "reception", pts: [[2, 2], [4, 2], [3, 3], [1, 4]] },
    { areaId: "cafe", pts: [[2, 1], [4, 2], [1, 3], [2, 4]] },
    {
      areaId: "terrace",
      pts: [[1, 1], [3, 1], [5, 1], [7, 1], [9, 1], [1, 3], [3, 3], [5, 3], [7, 3], [9, 3]],
    },
  ];
  return local.flatMap(({ areaId, pts }) => {
    const area = areaById(areaId);
    if (!area) return [];
    return pts.map(([x, y]) => ({ areaId, x: area.x + x, y: area.y + y }));
  });
})();

/** Code-point comparison: stable across locales and runtimes. */
const compareIds = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Assigns every agent a unique seat. Department agents take their room's desks in ascending id order;
 * anyone beyond the room's capacity (or with an unknown department) gets an overflow standing spot.
 * The result depends only on the set of (id, department) pairs, never on input order.
 */
export function assignSeats(agents: ReadonlyArray<Pick<WorldAgent, "id" | "department">>): Map<string, Seat> {
  const sorted = [...agents].sort((a, b) => compareIds(a.id, b.id));
  const seats = new Map<string, Seat>();
  const usedPerRoom = new Map<string, number>();
  const overflowQueue: string[] = [];

  for (const agent of sorted) {
    if (seats.has(agent.id) || overflowQueue.includes(agent.id)) continue; // duplicate ids: first wins
    const room = roomForDepartment(agent.department);
    const used = room ? (usedPerRoom.get(room.id) ?? 0) : DESKS_PER_ROOM;
    const deskSeat = room ? DESK_SEATS[used] : undefined;
    if (room && deskSeat) {
      usedPerRoom.set(room.id, used + 1);
      seats.set(agent.id, {
        key: `desk:${room.id}:${used}`,
        areaId: room.id,
        x: room.x + deskSeat.chair.x,
        y: room.y + deskSeat.chair.y,
        desk: { x: room.x + deskSeat.desk.x, y: room.y + deskSeat.desk.y },
        deskIndex: used,
        overflow: false,
        nudge: { x: 0, y: 0 },
      });
    } else {
      overflowQueue.push(agent.id);
    }
  }

  overflowQueue.forEach((id, n) => {
    const spot = OVERFLOW_SPOTS[n % OVERFLOW_SPOTS.length];
    if (!spot) return;
    const lap = Math.floor(n / OVERFLOW_SPOTS.length);
    seats.set(id, {
      key: `overflow:${n}`,
      areaId: spot.areaId,
      x: spot.x,
      y: spot.y,
      desk: null,
      deskIndex: null,
      overflow: true,
      nudge: { x: lap * 9 * (lap % 2 === 0 ? -1 : 1), y: lap * 3 },
    });
  });

  return seats;
}

/** Screen position of an agent's feet. */
export function seatScreenPosition(seat: Seat): Point {
  const p = toIso(seat.x + 0.5, seat.y + 0.5);
  return { x: p.x + seat.nudge.x, y: p.y + seat.nudge.y };
}

// ---------------------------------------------------------------------------------------------------------------
// Status → pose (truthful animation contract).
// ---------------------------------------------------------------------------------------------------------------
export type AvatarPose = "idle" | "seated" | "typing" | "celebrate";
export type StatusAnimation = "none" | "typing" | "bubble-pulse" | "celebrate";
export type StatusBubble = "approval" | "input" | "error" | "done" | null;
export type StatusTone = "indigo" | "clay" | "error" | "ivory" | "niebla" | "offline";

export type StatusVisual = {
  pose: AvatarPose;
  /** Pose after `poseDurationMs` (brief poses such as the completed celebration). */
  settlePose: AvatarPose;
  poseDurationMs: number | null;
  animation: StatusAnimation;
  bubble: StatusBubble;
  alpha: number;
  /** Desk monitor glows Indigo. True only while working. */
  monitorOn: boolean;
  tone: StatusTone;
  label: string;
};

export const CELEBRATE_MS = 2400;

/** Exhaustive over AgentStatus (a missing status is a compile error). */
export const STATUS_VISUALS: Readonly<Record<AgentStatus, StatusVisual>> = {
  working: {
    pose: "typing",
    settlePose: "typing",
    poseDurationMs: null,
    animation: "typing",
    bubble: null,
    alpha: 1,
    monitorOn: true,
    tone: "indigo",
    label: "Working",
  },
  waiting_approval: {
    pose: "idle",
    settlePose: "idle",
    poseDurationMs: null,
    animation: "bubble-pulse",
    bubble: "approval",
    alpha: 1,
    monitorOn: false,
    tone: "clay",
    label: "Waiting for approval",
  },
  waiting_input: {
    pose: "idle",
    settlePose: "idle",
    poseDurationMs: null,
    animation: "bubble-pulse",
    bubble: "input",
    alpha: 1,
    monitorOn: false,
    tone: "clay",
    label: "Waiting for input",
  },
  error: {
    pose: "idle",
    settlePose: "idle",
    poseDurationMs: null,
    animation: "bubble-pulse",
    bubble: "error",
    alpha: 1,
    monitorOn: false,
    tone: "error",
    label: "Error",
  },
  completed: {
    pose: "celebrate",
    settlePose: "idle",
    poseDurationMs: CELEBRATE_MS,
    animation: "celebrate",
    bubble: "done",
    alpha: 1,
    monitorOn: false,
    tone: "ivory",
    label: "Completed",
  },
  available: {
    pose: "idle",
    settlePose: "idle",
    poseDurationMs: null,
    animation: "none",
    bubble: null,
    alpha: 1,
    monitorOn: false,
    tone: "niebla",
    label: "Available",
  },
  offline: {
    pose: "seated",
    settlePose: "seated",
    poseDurationMs: null,
    animation: "none",
    bubble: null,
    alpha: 0.45,
    monitorOn: false,
    tone: "offline",
    label: "Offline",
  },
};

/** Legend order. */
export const STATUS_ORDER: readonly AgentStatus[] = [
  "working",
  "waiting_approval",
  "waiting_input",
  "error",
  "completed",
  "available",
  "offline",
];

/** Unknown runtime values degrade to `offline`: the world never shows activity it cannot prove. */
export function statusVisual(status: string): StatusVisual {
  return Object.prototype.hasOwnProperty.call(STATUS_VISUALS, status)
    ? STATUS_VISUALS[status as AgentStatus]
    : STATUS_VISUALS.offline;
}

/** Pose to draw `msSinceChange` milliseconds after the agent entered `status`. */
export function resolvePose(status: string, msSinceChange: number): AvatarPose {
  const v = statusVisual(status);
  return v.poseDurationMs !== null && msSinceChange >= v.poseDurationMs ? v.settlePose : v.pose;
}

/** Effective animation, honouring reduced motion and brief poses. */
export function resolveAnimation(status: string, msSinceChange: number, reducedMotion: boolean): StatusAnimation {
  if (reducedMotion) return "none";
  const v = statusVisual(status);
  if (v.animation === "celebrate" && v.poseDurationMs !== null && msSinceChange >= v.poseDurationMs) return "none";
  return v.animation;
}

export const TONE_COLORS: Readonly<Record<StatusTone, number>> = {
  indigo: PRAXIA_COLORS.indigo,
  clay: PRAXIA_COLORS.clay,
  error: PRAXIA_COLORS.error,
  ivory: PRAXIA_COLORS.ivory,
  niebla: PRAXIA_COLORS.niebla,
  offline: PRAXIA_COLORS.niebla,
};

// ---------------------------------------------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------------------------------------------
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2;

/** Screen-space bounds of the whole HQ (slab, walls, labels), before camera transform. */
export function worldBounds(): { x: number; y: number; width: number; height: number } {
  const top = toIso(SLAB.x, SLAB.y);
  const left = toIso(SLAB.x, SLAB.y + SLAB.h);
  const right = toIso(SLAB.x + SLAB.w, SLAB.y);
  const bottom = toIso(SLAB.x + SLAB.w, SLAB.y + SLAB.h);
  const minY = top.y - BACK_WALL_HEIGHT - 24; // headroom for walls and an avatar's name tag
  const maxY = bottom.y + SLAB_DEPTH;
  return { x: left.x, y: minY, width: right.x - left.x, height: maxY - minY };
}

/**
 * Clamps a zoom level to [ZOOM_MIN, ZOOM_MAX]. If the "fit whole HQ" scale is below ZOOM_MIN (small viewports),
 * the lower bound relaxes to that fit scale so the whole HQ can always be shown.
 */
export function clampZoom(zoom: number, fitScale: number = ZOOM_MIN): number {
  const min = Math.min(ZOOM_MIN, fitScale);
  return Math.min(ZOOM_MAX, Math.max(min, zoom));
}

/** Scale and offset that fit `worldBounds()` inside a viewport with padding. */
export function fitCamera(
  viewportWidth: number,
  viewportHeight: number,
  padding = 24,
): { scale: number; x: number; y: number } {
  const b = worldBounds();
  const availW = Math.max(1, viewportWidth - padding * 2);
  const availH = Math.max(1, viewportHeight - padding * 2);
  const raw = Math.min(availW / b.width, availH / b.height);
  const scale = Math.min(ZOOM_MAX, raw);
  return {
    scale,
    x: viewportWidth / 2 - (b.x + b.width / 2) * scale,
    y: viewportHeight / 2 - (b.y + b.height / 2) * scale,
  };
}
