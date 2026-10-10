/**
 * PRAXIA World — PixiJS 8 scene (isometric HQ, avatars, camera, interaction).
 *
 * Loaded only in the browser through a dynamic import from `PraxiaWorld.tsx`, so PixiJS never runs during SSR.
 * Everything is drawn procedurally with `Graphics`; there are no external images.
 */
import {
  Container,
  Graphics,
  Rectangle,
  Text,
  type Application,
  type ContainerChild,
  type FederatedPointerEvent,
  type TextStyleOptions,
} from "pixi.js";
import { drawAvatar, mix, type AvatarPainter } from "./avatar";
import {
  BACK_WALL_HEIGHT,
  FRONT_WALL_HEIGHT,
  PRAXIA_COLORS as C,
  RAIL_HEIGHT,
  SLAB,
  SLAB_DEPTH,
  CELEBRATE_MS,
  FOUNDER_TILE,
  TONE_COLORS,
  WORLD_AREAS,
  WORLD_FURNITURE,
  arcPoint,
  areaById,
  assignSeats,
  clampZoom,
  depthOf,
  easeInOut,
  fitCamera,
  flightForEvent,
  resolveAnimation,
  resolvePose,
  seatScreenPosition,
  statusVisual,
  toIso,
  workActivity,
  type AvatarPose,
  type FlightKind,
  type Point,
  type FurnitureItem,
  type Seat,
  type StatusBubble,
  type WorldArea,
  type WallStyle,
} from "./layout";
import type { WorldAgent, WorldEvent } from "./types";

// Compile-time guarantee that a PixiJS Graphics can be passed to drawAvatar.
const asPainter = (g: Graphics): AvatarPainter => g;

export type WorldSceneOptions = {
  fontFamily: string;
  reducedMotion: boolean;
  onSelect: (agentId: string | null) => void;
};

export type WorldScene = {
  setAgents(agents: WorldAgent[]): void;
  setSelected(agentId: string | null): void;
  setReducedMotion(reducedMotion: boolean): void;
  setOnSelect(onSelect: (agentId: string | null) => void): void;
  /** Fit the whole HQ in the viewport (also re-enables auto-fit on resize). */
  fit(): void;
  /** Zoom around the viewport centre by a factor (clamped). */
  zoomBy(factor: number): void;
  /** Plays real task events (each id once): document flights, pulses and the completion celebration. */
  playEvents(events: WorldEvent[]): void;
  /** Smoothly pans the camera to an agent. */
  focusAgent(agentId: string): void;
  /** Smoothly pans the camera to a room (e.g. a delivery team's room). */
  focusArea(areaId: string): void;
  destroy(): void;
};

// ---------------------------------------------------------------------------------------------------------------
// Iso drawing helpers
// ---------------------------------------------------------------------------------------------------------------
const P = (x: number, y: number, z = 0): [number, number] => {
  const p = toIso(x, y);
  return [p.x, p.y - z];
};
const flat = (...pts: [number, number][]) => pts.flat();

type BoxColors = { top: number; left: number; right: number; topAlpha?: number; edge?: number; edgeAlpha?: number };

/** Axis-aligned box on the tile grid: footprint (x, y, w, h), from elevation z0 up to z0 + height. */
function isoBox(g: Graphics, x: number, y: number, w: number, h: number, height: number, c: BoxColors, z0 = 0) {
  const z1 = z0 + height;
  // +y face (screen lower-left)
  g.poly(flat(P(x, y + h, z0), P(x + w, y + h, z0), P(x + w, y + h, z1), P(x, y + h, z1))).fill({ color: c.left });
  // +x face (screen lower-right)
  g.poly(flat(P(x + w, y, z0), P(x + w, y + h, z0), P(x + w, y + h, z1), P(x + w, y, z1))).fill({ color: c.right });
  // top
  g.poly(flat(P(x, y, z1), P(x + w, y, z1), P(x + w, y + h, z1), P(x, y + h, z1))).fill({
    color: c.top,
    alpha: c.topAlpha ?? 1,
  });
  if (c.edge !== undefined) {
    g.poly(flat(P(x, y, z1), P(x + w, y, z1), P(x + w, y + h, z1), P(x, y + h, z1)), true).stroke({
      width: 0.8,
      color: c.edge,
      alpha: c.edgeAlpha ?? 0.25,
    });
  }
}

// PixiJS 8.22 leaves `closePath` undefined when `poly` gets no second argument, so stroked polygons pass `true`.
function isoTop(g: Graphics, x: number, y: number, w: number, h: number, z = 0) {
  return g.poly(flat(P(x, y, z), P(x + w, y, z), P(x + w, y + h, z), P(x, y + h, z)), true);
}

// ---------------------------------------------------------------------------------------------------------------
// Static HQ
// ---------------------------------------------------------------------------------------------------------------
const FLOOR_FILL: Record<WorldArea["kind"], number> = {
  team: 0x15161d,
  founder: 0x17162a,
  conference: 0x15161d,
  cafe: 0x17171c,
  reception: 0x18191f,
  terrace: 0x1b1c22,
};

function drawSlabAndFloors(layer: Container) {
  const g = new Graphics();
  // Floating slab with visible thickness.
  const { x, y, w, h } = SLAB;
  g.poly(flat(P(x, y + h), P(x + w, y + h), P(x + w, y + h, -SLAB_DEPTH), P(x, y + h, -SLAB_DEPTH))).fill({
    color: 0x08090c,
  });
  g.poly(flat(P(x + w, y), P(x + w, y + h), P(x + w, y + h, -SLAB_DEPTH), P(x + w, y, -SLAB_DEPTH))).fill({
    color: 0x0a0b10,
  });
  isoTop(g, x, y, w, h).fill({ color: 0x101118 });
  isoTop(g, x, y, w, h).stroke({ width: 1, color: C.niebla, alpha: 0.16 });
  // Front edge highlight (Ivory hairline) to give the slab a crisp model-like finish.
  g.moveTo(...P(x, y + h)).lineTo(...P(x + w, y + h)).lineTo(...P(x + w, y)).stroke({
    width: 1,
    color: C.ivory,
    alpha: 0.12,
  });

  for (const area of WORLD_AREAS) {
    isoTop(g, area.x, area.y, area.w, area.h).fill({ color: FLOOR_FILL[area.kind] });
    // Tile grid (Niebla hairlines)
    const lineAlpha = area.kind === "terrace" ? 0.05 : 0.06;
    for (let i = 1; i < area.w; i++) {
      g.moveTo(...P(area.x + i, area.y)).lineTo(...P(area.x + i, area.y + area.h));
    }
    for (let j = 1; j < area.h; j++) {
      g.moveTo(...P(area.x, area.y + j)).lineTo(...P(area.x + area.w, area.y + j));
    }
    g.stroke({ width: 1, color: C.niebla, alpha: lineAlpha });
    if (area.kind === "terrace") {
      // Deck planks: extra hairlines along x.
      for (let j = 0; j < area.h; j++) {
        for (const t of [0.33, 0.66]) {
          g.moveTo(...P(area.x, area.y + j + t)).lineTo(...P(area.x + area.w, area.y + j + t));
        }
      }
      g.stroke({ width: 1, color: C.niebla, alpha: 0.035 });
    }
    if (area.kind === "reception") {
      // Entrance mat (Clay, human accent)
      isoTop(g, area.x + 1.6, area.y + area.h - 0.9, 1.8, 0.7).fill({ color: C.clay, alpha: 0.22 });
    }
    if (area.accent !== null) {
      // Team colour: a trim along the room's back edges and a soft rug in the middle of the room.
      g.moveTo(...P(area.x, area.y + area.h)).lineTo(...P(area.x, area.y)).lineTo(...P(area.x + area.w, area.y)).stroke({ width: 2, color: area.accent, alpha: 0.55 });
      isoTop(g, area.x + 0.5, area.y + 0.5, area.w - 1, area.h - 1).fill({ color: area.accent, alpha: area.kind === "founder" ? 0.09 : 0.045 });
    }
  }
  layer.addChild(g);
}

type WallEdge = "backRight" | "backLeft" | "frontLeft" | "frontRight";

function wallSegment(edge: WallEdge, area: WorldArea, i: number, style: WallStyle, height: number): Graphics | null {
  if (style === "none") return null;
  let a: [number, number];
  let b: [number, number];
  let depth: number;
  switch (edge) {
    case "backRight": // y = area.y, along x
      a = [area.x + i, area.y];
      b = [area.x + i + 1, area.y];
      depth = area.x + i + 0.5 + area.y;
      break;
    case "backLeft": // x = area.x, along y
      a = [area.x, area.y + i];
      b = [area.x, area.y + i + 1];
      depth = area.x + area.y + i + 0.5;
      break;
    case "frontLeft": // y = area.y + h, along x
      a = [area.x + i, area.y + area.h];
      b = [area.x + i + 1, area.y + area.h];
      depth = area.x + i + 0.5 + area.y + area.h;
      break;
    case "frontRight": // x = area.x + w, along y
      a = [area.x + area.w, area.y + i];
      b = [area.x + area.w, area.y + i + 1];
      depth = area.x + area.w + area.y + i + 0.5;
      break;
  }
  const g = new Graphics();
  const a0 = P(a[0], a[1]);
  const b0 = P(b[0], b[1]);
  const aH = P(a[0], a[1], height);
  const bH = P(b[0], b[1], height);
  if (style === "glass") {
    g.poly(flat(a0, b0, bH, aH)).fill({ color: C.ivory, alpha: 0.045 });
    g.moveTo(...a0).lineTo(...b0).stroke({ width: 1, color: C.niebla, alpha: 0.2 });
    g.moveTo(...aH).lineTo(...bH).stroke({ width: 1.2, color: C.niebla, alpha: 0.55 });
    g.moveTo(...a0).lineTo(...aH).stroke({ width: 0.8, color: C.niebla, alpha: 0.18 });
  } else {
    g.poly(flat(a0, b0, bH, aH)).fill({ color: C.ivory, alpha: 0.025 });
    g.moveTo(...aH).lineTo(...bH).stroke({ width: 1.4, color: C.ivory, alpha: 0.45 });
    g.moveTo(...a0).lineTo(...aH).stroke({ width: 1, color: C.niebla, alpha: 0.35 });
  }
  g.zIndex = depth;
  return g;
}

function drawWalls(layer: Container) {
  for (const area of WORLD_AREAS) {
    const backH = area.backWalls === "rail" ? RAIL_HEIGHT : BACK_WALL_HEIGHT;
    const frontH = area.frontWalls === "rail" ? RAIL_HEIGHT : FRONT_WALL_HEIGHT;
    const add = (g: Graphics | null) => g && layer.addChild(g);
    for (let i = 0; i < area.w; i++) add(wallSegment("backRight", area, i, area.backWalls, backH));
    for (let j = 0; j < area.h; j++) add(wallSegment("backLeft", area, j, area.backWalls, backH));
    for (let i = 0; i < area.w; i++) {
      if (!area.doors.frontLeft.includes(i)) add(wallSegment("frontLeft", area, i, area.frontWalls, frontH));
    }
    for (let j = 0; j < area.h; j++) {
      if (!area.doors.frontRight.includes(j)) add(wallSegment("frontRight", area, j, area.frontWalls, frontH));
    }
  }
}

function monoStyle(fontFamily: string, size: number, fill: number, weight: "400" | "700" = "400"): TextStyleOptions {
  return { fontFamily, fontSize: size, fill, fontWeight: weight, letterSpacing: size * 0.12 };
}

const WALL_ANGLE = Math.atan(0.5); // slope of a tile edge on screen
const TILE_EDGE_LEN = Math.hypot(24, 12);

function drawLabels(layer: Container, fontFamily: string) {
  for (const area of WORLD_AREAS) {
    const height = area.backWalls === "rail" ? RAIL_HEIGHT : BACK_WALL_HEIGHT;
    const label = new Text({
      text: area.label.toUpperCase(),
      style: monoStyle(fontFamily, 9, area.accent ?? C.ivory, area.accent !== null ? "700" : "400"),
      resolution: 3,
    });
    label.alpha = area.accent !== null ? 0.95 : 0.82;
    label.anchor.set(0, 0.5);
    const startInset = 0.35;
    const available = (area.w - startInset * 2) * TILE_EDGE_LEN;
    const natural = label.width;
    if (natural > available) label.scale.x = available / natural;
    label.skew.set(0, WALL_ANGLE);
    const [lx, ly] = P(area.x + startInset, area.y, area.backWalls === "rail" ? height + 7 : height * 0.65);
    label.position.set(lx, ly);
    label.zIndex = area.x + area.y + 0.4;
    layer.addChild(label);

    if (area.kind === "reception") {
      // Brand line on the back-left glass wall, reading upward to the right.
      const tagline = new Text({
        text: "TURN STRATEGY INTO ADOPTION.",
        style: monoStyle(fontFamily, 7, C.niebla),
        resolution: 3,
      });
      tagline.alpha = 0.85;
      tagline.anchor.set(0, 0.5);
      const avail = (area.h - 0.7) * TILE_EDGE_LEN;
      if (tagline.width > avail) tagline.scale.x = avail / tagline.width;
      tagline.skew.set(0, -WALL_ANGLE);
      const [tx, ty] = P(area.x, area.y + area.h - 0.35, height * 0.55);
      tagline.position.set(tx, ty);
      tagline.zIndex = area.x + area.y + 0.4;
      layer.addChild(tagline);
    }
  }
}

type MonitorHandle = { glow: Graphics; setOn(on: boolean): void };

const monitorPanel = (x: number, y: number) =>
  flat(P(x + 0.22, y + 0.62, 12), P(x + 0.78, y + 0.62, 12), P(x + 0.78, y + 0.62, 24), P(x + 0.22, y + 0.62, 24));

function drawPlant(g: Graphics, x: number, y: number, big = false) {
  const s = big ? 0.8 : 0.44;
  const ox = x + (1 - s) / 2;
  const oy = y + (1 - s) / 2;
  isoBox(g, ox, oy, s, s, big ? 9 : 7, { top: 0x2a2c36, left: 0x1f2029, right: 0x1a1b23, edge: C.ivory, edgeAlpha: 0.3 });
  // Architectural-model foliage: Ivory and Niebla tones only.
  const [cx, cy] = P(x + 0.5, y + 0.5, big ? 9 : 7);
  const r = big ? 7 : 5;
  g.circle(cx - r * 0.45, cy - r * 0.9, r * 0.75).fill({ color: 0x6f727d });
  g.circle(cx + r * 0.5, cy - r * 1.1, r * 0.7).fill({ color: C.niebla, alpha: 0.85 });
  g.circle(cx, cy - r * 1.7, r * 0.72).fill({ color: 0xcfcac0, alpha: 0.85 });
}

function drawFurniture(layer: Container, monitors: Map<string, MonitorHandle>) {
  const deskColors: BoxColors = { top: 0x262833, left: 0x1a1b23, right: 0x14151c, edge: C.ivory, edgeAlpha: 0.14 };
  const add = (g: Graphics, item: FurnitureItem, bias = 0) => {
    g.zIndex = depthOf(item.x + item.w / 2, item.y + item.h / 2) + bias;
    layer.addChild(g);
  };

  for (const item of WORLD_FURNITURE) {
    const { x, y, w, h } = item;
    const g = new Graphics();
    switch (item.kind) {
      case "desk": {
        isoBox(g, x + 0.1, y + 0.14, 0.8, 0.72, 10, deskColors);
        // Keyboard on the side facing the chair
        isoTop(g, x + 0.3, y + 0.2, 0.4, 0.14, 10).fill({ color: 0x3a3c48 });
        // Monitor (we see its back; the screen faces the seated agent)
        const [stx, sty] = P(x + 0.5, y + 0.62, 10);
        g.rect(stx - 0.6, sty - 2.5, 1.2, 2.5).fill({ color: 0x2b2d38 });
        g.poly(monitorPanel(x, y)).fill({ color: 0x24262f });
        add(g, item);

        const glow = new Graphics();
        const [gx, gy] = P(x + 0.5, y + 0.62, 20);
        glow.ellipse(gx, gy, 18, 10).fill({ color: C.indigo, alpha: 0.12 });
        glow.ellipse(gx, gy, 10, 6).fill({ color: C.indigo, alpha: 0.16 });
        isoTop(glow, x + 0.14, y + 0.18, 0.72, 0.4, 10.2).fill({ color: C.indigo, alpha: 0.14 });
        glow.visible = false;
        glow.zIndex = g.zIndex - 0.02; // just behind the monitor body
        layer.addChild(glow);

        const rim = new Graphics();
        rim.zIndex = g.zIndex + 0.01;
        layer.addChild(rim);
        const setOn = (on: boolean) => {
          glow.visible = on;
          glow.alpha = 1;
          rim.clear();
          rim.poly(monitorPanel(x, y), true).stroke({ width: on ? 1.3 : 1, color: on ? C.indigo : C.niebla, alpha: on ? 0.95 : 0.28 });
          // Top edge of the screen catches the light.
          if (on) rim.moveTo(...P(x + 0.22, y + 0.62, 24)).lineTo(...P(x + 0.78, y + 0.62, 24)).stroke({ width: 1.6, color: C.indigo });
        };
        setOn(false);
        if (item.seatIndex !== undefined) monitors.set(`desk:${item.areaId}:${item.seatIndex}`, { glow, setOn });
        continue;
      }
      case "chair":
      case "conference-chair": {
        isoBox(g, x + 0.3, y + 0.3, 0.4, 0.4, 6, { top: 0x2f313d, left: 0x23252f, right: 0x1d1e27 });
        // Back rest on the -y side
        g.poly(flat(P(x + 0.3, y + 0.3, 6), P(x + 0.7, y + 0.3, 6), P(x + 0.7, y + 0.3, 15), P(x + 0.3, y + 0.3, 15))).fill({
          color: 0x2a2c36,
        });
        add(g, item, -0.3);
        continue;
      }
      case "plant":
        drawPlant(g, x, y);
        break;
      case "planter":
        drawPlant(g, x, y, true);
        break;
      case "coffee-counter":
        isoBox(g, x + 0.08, y, 0.84, 1, 14, { top: 0xe9e4da, left: 0x1d1e27, right: 0x181920, edge: C.ivory, edgeAlpha: 0.4 });
        break;
      case "coffee-machine": {
        isoBox(g, x + 0.08, y, 0.84, 1, 14, { top: 0xe9e4da, left: 0x1d1e27, right: 0x181920, edge: C.ivory, edgeAlpha: 0.4 });
        isoBox(g, x + 0.25, y + 0.25, 0.45, 0.5, 11, { top: 0x2a2c36, left: 0x1b1c24, right: 0x15161d }, 14);
        const [lx, ly] = P(x + 0.7, y + 0.5, 21);
        g.circle(lx + 2, ly + 1, 1.4).fill({ color: C.clay }); // ready light
        const [cx, cy] = P(x + 0.5, y + 0.85, 14);
        g.roundRect(cx - 1.5, cy - 4, 3, 4, 0.8).fill({ color: C.ivory }); // cup
        g.roundRect(cx + 4, cy - 2, 3, 4, 0.8).fill({ color: C.clay, alpha: 0.9 }); // cup
        break;
      }
      case "bistro-table": {
        const [sx, sy] = P(x + 0.5, y + 0.5);
        g.ellipse(sx, sy, 7, 3.5).fill({ color: 0x000000, alpha: 0.3 });
        g.rect(sx - 0.8, sy - 16, 1.6, 16).fill({ color: 0x3a3c48 });
        g.ellipse(sx, sy - 16, 9, 4.5).fill({ color: 0xd8d3c9 }).stroke({ width: 0.8, color: C.ivory, alpha: 0.6 });
        g.roundRect(sx + 1, sy - 21, 3, 4, 0.8).fill({ color: C.clay, alpha: 0.9 });
        break;
      }
      case "reception-counter":
        isoBox(g, x, y + 0.2, 1, 0.6, 15, { top: 0xe9e4da, left: 0x1d1e27, right: 0x181920, edge: C.ivory, edgeAlpha: 0.5 });
        // Indigo light strip on the visitor-facing side
        g.moveTo(...P(x + 0.04, y + 0.8, 4)).lineTo(...P(x + 0.96, y + 0.8, 4)).stroke({ width: 1.2, color: C.indigo, alpha: 0.85 });
        break;
      case "sofa":
        isoBox(g, x + 0.1, y + 0.2, w - 0.2, 0.6, 6, { top: mix(C.clay, C.graphite, 0.35), left: mix(C.clay, C.graphite, 0.6), right: mix(C.clay, C.graphite, 0.68) });
        isoBox(g, x + 0.1, y + 0.2, w - 0.2, 0.16, 8, { top: mix(C.clay, C.graphite, 0.45), left: mix(C.clay, C.graphite, 0.55), right: mix(C.clay, C.graphite, 0.68) }, 6);
        break;
      case "conference-table":
        isoBox(g, x + 0.1, y + 0.1, w - 0.2, h - 0.2, 10, { top: 0x2a2c36, left: 0x1a1b23, right: 0x14151c, edge: C.ivory, edgeAlpha: 0.3 });
        break;
      case "wall-screen": {
        // Large display on the back-left glass wall (systems → Indigo, Violet edge used sparingly).
        const sx = x + 0.04;
        g.poly(flat(P(sx, y, 5), P(sx, y + h, 5), P(sx, y + h, 18), P(sx, y, 18)), true).fill({ color: C.indigo, alpha: 0.28 }).stroke({
          width: 1,
          color: C.violet,
          alpha: 0.75,
        });
        g.zIndex = depthOf(x, y + h / 2) + 0.2;
        layer.addChild(g);
        continue;
      }
      case "parasol-table": {
        const [sx, sy] = P(x + 0.5, y + 0.5);
        g.ellipse(sx, sy, 12, 6).fill({ color: 0x000000, alpha: 0.25 });
        g.rect(sx - 0.8, sy - 14, 1.6, 14).fill({ color: 0x3a3c48 });
        g.ellipse(sx, sy - 14, 8, 4).fill({ color: 0xd8d3c9 });
        g.rect(sx - 0.6, sy - 38, 1.2, 24).fill({ color: C.niebla });
        g.poly([sx - 18, sy - 34, sx, sy - 44, sx + 18, sy - 34, sx, sy - 27]).fill({ color: C.ivory, alpha: 0.95 });
        g.poly([sx - 18, sy - 34, sx, sy - 27, sx + 18, sy - 34]).stroke({ width: 1.4, color: C.clay, alpha: 0.9 });
        break;
      }
      case "lounger":
        isoBox(g, x + 0.15, y + 0.1, 0.7, 0.8, 4, { top: 0xd8d3c9, left: 0x2a2c36, right: 0x23252f });
        isoBox(g, x + 0.15, y + 0.1, 0.7, 0.2, 5, { top: 0xe9e4da, left: 0x3a3c48, right: 0x2f313d }, 4);
        break;
    }
    add(g, item);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------------------------------------------
type AgentSprite = {
  agent: WorldAgent;
  seat: Seat;
  body: Container;
  figure: Graphics;
  decal: Graphics;
  overlay: Container;
  bubble: Container;
  bubbleGfx: Graphics;
  bubbleText: Text;
  tag: Container;
  tagBg: Graphics;
  tagText: Text;
  statusSince: number;
  /** Desk inbox tray (queued tasks) and its count badge. */
  tray: Container;
  trayGfx: Graphics;
  trayText: Text;
  trayKey: string;
  /** Recorded progress bar above the head. */
  progressBar: Graphics;
  progressKey: string;
  celebrateUntil: number;
  shakeUntil: number;
  nextGlyphAt: number;
  drawnPose: AvatarPose | null;
  drawnFrame: number;
  drawnBubble: StatusBubble | "unset";
  avatarKey: string;
  phase: number;
};

const hashPhase = (id: string) => {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) % 1000;
};

const headTop = (pose: AvatarPose) => (pose === "seated" || pose === "typing" ? -28 : pose === "celebrate" ? -38 : -34);

export function createWorldScene(app: Application, options: WorldSceneOptions): WorldScene {
  let onSelect = options.onSelect;
  let reducedMotion = options.reducedMotion;
  const fontFamily = options.fontFamily;
  let selectedId: string | null = null;
  let hoveredId: string | null = null;
  let userMovedCamera = false;
  let fitScale = 1;

  const camera = new Container();
  const floorLayer = new Container();
  const decalLayer = new Container();
  const depthLayer = new Container({ sortableChildren: true });
  const agentLayer = depthLayer; // avatars are depth-sorted with furniture and walls
  const overlayLayer = new Container({ sortableChildren: true });
  camera.addChild(floorLayer, decalLayer, depthLayer, overlayLayer);
  app.stage.addChild(camera);

  const monitors = new Map<string, MonitorHandle>();
  drawSlabAndFloors(floorLayer);
  drawWalls(depthLayer);
  drawFurniture(depthLayer, monitors);
  drawLabels(depthLayer, fontFamily);

  const sprites = new Map<string, AgentSprite>();
  const bodyIds = new WeakMap<ContainerChild, string>();

  // ------------------------------------------------------------------ founder desk + effects layer
  const fxLayer = new Container();
  camera.addChild(fxLayer);
  const founderPoint: Point = (() => {
    const [x, y] = P(FOUNDER_TILE.x, FOUNDER_TILE.y, 16);
    return { x, y };
  })();
  {
    const beacon = new Container();
    const g = new Graphics();
    g.poly([0, -7, 5, 0, 0, 7, -5, 0]).fill({ color: C.indigo }).stroke({ width: 1, color: C.ivory, alpha: 0.8 });
    const label = new Text({ text: "FOUNDER", style: monoStyle(fontFamily, 8, C.ivory, "700"), resolution: 3 });
    label.anchor.set(0.5, 0);
    label.position.set(0, 9);
    const pill = new Graphics();
    pill.roundRect(-label.width / 2 - 4, 7.5, label.width + 8, label.height + 3, 3).fill({ color: C.graphite, alpha: 0.92 }).stroke({ width: 1, color: C.indigo, alpha: 0.9 });
    beacon.addChild(g, pill, label);
    beacon.position.set(founderPoint.x, founderPoint.y - 6);
    overlayLayer.addChild(beacon);
  }

  // ------------------------------------------------------------------ camera
  const applyFit = () => {
    const f = fitCamera(app.screen.width, app.screen.height, 28);
    fitScale = f.scale;
    camera.scale.set(f.scale);
    camera.position.set(f.x, f.y);
  };

  const zoomAt = (sx: number, sy: number, factor: number) => {
    camTween = null;
    const old = camera.scale.x;
    const next = clampZoom(old * factor, fitScale);
    if (next === old) return;
    const wx = (sx - camera.x) / old;
    const wy = (sy - camera.y) / old;
    camera.scale.set(next);
    camera.position.set(sx - wx * next, sy - wy * next);
    userMovedCamera = true;
  };

  const onResize = () => {
    if (!userMovedCamera) applyFit();
  };
  app.renderer.on("resize", onResize);

  const canvas = app.canvas;
  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none";
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const factor = Math.exp(-e.deltaY * unit * 0.0015);
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
  };
  canvas.addEventListener("wheel", onWheel, { passive: false });

  // ------------------------------------------------------------------ pointer: pan, select, hover
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  let drag: { pointerId: number; sx: number; sy: number; cx: number; cy: number; moved: boolean } | null = null;

  const agentIdFrom = (target: unknown): string | null => {
    let node = target as ContainerChild | null;
    while (node) {
      const id = bodyIds.get(node);
      if (id) return id;
      node = node.parent as ContainerChild | null;
    }
    return null;
  };

  const onPointerDown = (e: FederatedPointerEvent) => {
    if (e.button !== undefined && e.button > 0) return;
    camTween = null;
    drag = { pointerId: e.pointerId, sx: e.global.x, sy: e.global.y, cx: camera.x, cy: camera.y, moved: false };
  };
  const onPointerMove = (e: FederatedPointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dx = e.global.x - drag.sx;
    const dy = e.global.y - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 4) {
      drag.moved = true;
      canvas.style.cursor = "grabbing";
    }
    if (drag.moved) {
      camera.position.set(drag.cx + dx, drag.cy + dy);
      userMovedCamera = true;
    }
  };
  const onPointerUp = (e: FederatedPointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const wasDrag = drag.moved;
    drag = null;
    canvas.style.cursor = hoveredId ? "pointer" : "grab";
    if (!wasDrag) onSelect(agentIdFrom(e.target));
  };
  const onPointerUpOutside = () => {
    drag = null;
    canvas.style.cursor = "grab";
  };
  app.stage.on("pointerdown", onPointerDown);
  app.stage.on("globalpointermove", onPointerMove);
  app.stage.on("pointerup", onPointerUp);
  app.stage.on("pointerupoutside", onPointerUpOutside);

  const setHovered = (id: string | null) => {
    if (hoveredId === id) return;
    const prev = hoveredId;
    hoveredId = id;
    if (prev) refreshChrome(prev);
    if (id) refreshChrome(id);
    if (!drag) canvas.style.cursor = id ? "pointer" : "grab";
  };

  // ------------------------------------------------------------------ agent sprites
  const textStyle = (size: number, fill: number, weight: "400" | "700" = "700") => monoStyle(fontFamily, size, fill, weight);

  function createSprite(agent: WorldAgent, seat: Seat, now: number): AgentSprite {
    const body = new Container();
    const figure = new Graphics();
    body.addChild(figure);
    body.eventMode = "static";
    body.cursor = "pointer";
    body.hitArea = new Rectangle(-11, -38, 22, 41);
    body.on("pointerover", () => setHovered(agent.id));
    body.on("pointerout", () => {
      if (hoveredId === agent.id) setHovered(null);
    });
    bodyIds.set(body, agent.id);
    bodyIds.set(figure, agent.id);

    const decal = new Graphics();
    const overlay = new Container();
    const bubble = new Container();
    const bubbleGfx = new Graphics();
    const bubbleText = new Text({ text: "", style: textStyle(10, C.graphite), resolution: 3 });
    bubbleText.anchor.set(0.5, 0.5);
    bubbleText.position.set(0, -8.5);
    bubble.addChild(bubbleGfx, bubbleText);
    const tag = new Container();
    const tagBg = new Graphics();
    const tagText = new Text({ text: agent.id, style: textStyle(10, C.ivory), resolution: 3 });
    tagText.anchor.set(0.5, 1);
    tag.addChild(tagBg, tagText);
    const progressBar = new Graphics();
    overlay.addChild(progressBar, bubble, tag);

    const tray = new Container();
    const trayGfx = new Graphics();
    const trayText = new Text({ text: "", style: textStyle(8, C.ivory), resolution: 3 });
    trayText.anchor.set(0.5, 0.5);
    tray.addChild(trayGfx, trayText);
    if (seat.desk) {
      tray.zIndex = depthOf(seat.desk.x + 0.5, seat.desk.y + 0.5) + 0.03;
      depthLayer.addChild(tray);
    }

    agentLayer.addChild(body);
    decalLayer.addChild(decal);
    overlayLayer.addChild(overlay);

    const sprite: AgentSprite = {
      agent,
      seat,
      body,
      figure,
      decal,
      overlay,
      bubble,
      bubbleGfx,
      bubbleText,
      tag,
      tagBg,
      tagText,
      statusSince: now,
      tray,
      trayGfx,
      trayText,
      trayKey: "",
      progressBar,
      progressKey: "",
      celebrateUntil: 0,
      shakeUntil: 0,
      nextGlyphAt: now + (hashPhase(agent.id) % 700),
      drawnPose: null,
      drawnFrame: -1,
      drawnBubble: "unset",
      avatarKey: "",
      phase: hashPhase(agent.id),
    };
    placeSprite(sprite);
    return sprite;
  }

  function placeSprite(s: AgentSprite) {
    const p = seatScreenPosition(s.seat);
    s.body.position.set(p.x, p.y);
    s.body.zIndex = depthOf(s.seat.x + 0.5, s.seat.y + 0.5);
    s.decal.position.set(p.x, p.y);
    s.overlay.position.set(p.x, p.y);
    if (s.seat.desk) {
      s.tray.zIndex = depthOf(s.seat.desk.x + 0.5, s.seat.desk.y + 0.5) + 0.03;
      if (!s.tray.parent) depthLayer.addChild(s.tray);
    } else if (s.tray.parent) {
      s.tray.parent.removeChild(s.tray);
    }
    s.trayKey = "";
  }

  function drawFigure(s: AgentSprite, pose: AvatarPose, frame: number) {
    s.figure.clear();
    drawAvatar(asPainter(s.figure), s.agent.avatar, pose, { frame });
    s.drawnPose = pose;
    s.drawnFrame = frame;
    layoutOverlay(s);
  }

  function drawBubble(s: AgentSprite, kind: StatusBubble) {
    s.drawnBubble = kind;
    const g = s.bubbleGfx;
    g.clear();
    s.bubbleText.visible = false;
    if (!kind) {
      s.bubble.visible = false;
      return;
    }
    s.bubble.visible = true;
    const fill = kind === "error" ? C.error : kind === "done" ? C.ivory : C.clay;
    g.roundRect(-7.5, -15, 15, 13, 4).fill({ color: fill }).stroke({ width: 1, color: C.graphite, alpha: 0.55 });
    g.poly([-2.5, -2.4, 2.5, -2.4, 0, 1.6]).fill({ color: fill });
    if (kind === "approval" || kind === "input") {
      s.bubbleText.text = kind === "approval" ? "!" : "?";
      s.bubbleText.style.fill = C.graphite;
      s.bubbleText.visible = true;
    } else if (kind === "error") {
      g.moveTo(-2.6, -11.1).lineTo(2.6, -5.9).moveTo(2.6, -11.1).lineTo(-2.6, -5.9).stroke({
        width: 1.6,
        color: C.ivory,
        cap: "round",
      });
    } else {
      g.moveTo(-3, -8.6).lineTo(-0.8, -6.3).lineTo(3.2, -11).stroke({ width: 1.6, color: C.graphite, cap: "round" });
    }
  }

  function layoutOverlay(s: AgentSprite) {
    // The bubble sits beside the head (not above it) so it stays clear of the room label on the back glass.
    const top = headTop(s.drawnPose ?? "idle");
    s.bubble.position.set(11, top + 11);
    s.progressBar.position.set(0, top - 4);
    s.tag.position.set(0, s.progressBar.visible ? top - 10 : top - 6);
  }

  /** Progress bar of the current task (recorded value). Shown while the task is open and being worked. */
  function drawProgress(s: AgentSprite) {
    const p = s.agent.currentTaskProgress;
    const show = p !== null && p !== undefined && ["working", "waiting_input", "waiting_approval"].includes(s.agent.status);
    const key = show ? `${p}:${s.agent.status}` : "";
    if (key === s.progressKey) return;
    s.progressKey = key;
    const g = s.progressBar;
    g.clear();
    g.visible = show;
    if (show) {
      const w = 22;
      const color = s.agent.status === "working" ? C.indigo : C.clay;
      g.roundRect(-w / 2 - 1, -2.5, w + 2, 5, 2.5).fill({ color: C.graphite, alpha: 0.9 }).stroke({ width: 0.8, color: C.niebla, alpha: 0.35 });
      if (p > 0) g.roundRect(-w / 2, -1.5, (w * Math.min(100, p)) / 100, 3, 1.5).fill({ color });
    }
    layoutOverlay(s);
  }

  /** Inbox tray on the desk: one sheet per queued task (max 3) and a count badge (red when something is overdue). */
  function drawTray(s: AgentSprite) {
    const desk = s.seat.desk;
    const queued = s.agent.tasksQueued ?? 0;
    const overdue = s.agent.tasksOverdue ?? 0;
    const key = desk ? `${queued}:${overdue}:${desk.x},${desk.y}` : "";
    if (key === s.trayKey) return;
    s.trayKey = key;
    const g = s.trayGfx;
    g.clear();
    s.trayText.visible = false;
    if (!desk || queued <= 0) return;
    const sheets = Math.min(3, queued);
    for (let i = 0; i < sheets; i++) {
      isoTop(g, desk.x + 0.62, desk.y + 0.16, 0.24, 0.3, 10.4 + i * 1.3).fill({ color: C.ivory, alpha: 0.92 - i * 0.04 }).stroke({ width: 0.6, color: C.graphite, alpha: 0.5 });
    }
    const [bx, by] = P(desk.x + 0.74, desk.y + 0.31, 10.4 + sheets * 1.3 + 7);
    g.circle(bx, by, 5.2).fill({ color: overdue ? C.error : C.indigo }).stroke({ width: 1, color: C.graphite, alpha: 0.7 });
    s.trayText.text = queued > 9 ? "9+" : String(queued);
    s.trayText.position.set(bx, by + 0.2);
    s.trayText.visible = true;
  }

  /** Rings, name tag and alpha: depends on status, hover and selection. */
  function refreshChrome(id: string) {
    const s = sprites.get(id);
    if (!s) return;
    const v = statusVisual(s.agent.status);
    const selected = selectedId === id;
    const hovered = hoveredId === id;
    const g = s.decal;
    g.clear();
    if (selected) g.ellipse(0, 0, 15, 7).fill({ color: C.indigo, alpha: 0.16 });
    g.ellipse(0, 0, 10.5, 5).stroke({
      width: 1.3,
      color: TONE_COLORS[v.tone],
      alpha: s.agent.status === "offline" ? 0.22 : 0.8,
    });
    if (hovered && !selected) g.ellipse(0, 0, 13.5, 6.4).stroke({ width: 1.2, color: C.ivory, alpha: 0.75 });
    if (selected) g.ellipse(0, 0, 15, 7).stroke({ width: 2, color: C.indigo, alpha: 1 });

    s.body.alpha = v.alpha;
    s.bubble.alpha = v.alpha < 1 ? 0.8 : 1;

    s.tag.visible = selected || hovered;
    if (s.tag.visible) {
      s.tagText.text = s.agent.id;
      const w = s.tagText.width + 10;
      const h = s.tagText.height + 4;
      s.tagBg.clear();
      s.tagBg.roundRect(-w / 2, -h - 1, w, h, 3).fill({ color: C.graphite, alpha: 0.92 }).stroke({
        width: 1,
        color: selected ? C.indigo : C.niebla,
        alpha: selected ? 1 : 0.45,
      });
      s.tagText.position.set(0, -2);
    }
    // Keep hovered/selected on top of neighbours' overlays.
    s.overlay.zIndex = selected ? 2 : hovered ? 1 : 0;
  }

  function refreshMonitors() {
    // A monitor glows only for a seated agent whose status is `working`; every other desk is dark.
    const lit = new Set<string>();
    for (const s of sprites.values()) {
      if (s.seat.desk && statusVisual(s.agent.status).monitorOn) lit.add(s.seat.key);
    }
    for (const [key, m] of monitors) m.setOn(lit.has(key));
  }

  // ------------------------------------------------------------------ effects: work glyphs, flights, pulses
  type Glyph = { text: Text; x0: number; y0: number; dx: number; start: number; dur: number };
  type Flight = { paper: Graphics; trail: Graphics; from: Point; to: Point; start: number; dur: number; color: number; onArrive?: () => void; pts: Point[] };
  type Ring = { g: Graphics; x: number; y: number; start: number; dur: number; color: number; r: number };
  const glyphPool: Text[] = [];
  const glyphs: Glyph[] = [];
  const flights: Flight[] = [];
  const rings: Ring[] = [];
  const played = new Set<string>();
  let nextFlightAt = 0;
  let camTween: { fx: number; fy: number; tx: number; ty: number; start: number; dur: number } | null = null;

  const deskPoint = (s: AgentSprite, z = 13): Point => {
    if (s.seat.desk) {
      const [x, y] = P(s.seat.desk.x + 0.62, s.seat.desk.y + 0.3, z);
      return { x, y };
    }
    const p = seatScreenPosition(s.seat);
    return { x: p.x, y: p.y - 20 };
  };
  const monitorTop = (s: AgentSprite): Point => {
    if (s.seat.desk) {
      const [x, y] = P(s.seat.desk.x + 0.5, s.seat.desk.y + 0.62, 27);
      return { x, y };
    }
    const p = seatScreenPosition(s.seat);
    return { x: p.x, y: p.y - 40 };
  };

  function spawnGlyph(s: AgentSprite, now: number) {
    const act = workActivity(s.agent.department);
    let text = glyphPool.pop();
    if (!text) {
      if (glyphs.length >= 120) return;
      text = new Text({ text: "", style: textStyle(11, act.color), resolution: 3 });
      text.anchor.set(0.5, 1);
    }
    text.text = act.glyphs[Math.floor(Math.random() * act.glyphs.length)]!;
    text.style.fill = act.color;
    text.alpha = 0;
    text.visible = true;
    fxLayer.addChild(text);
    const o = monitorTop(s);
    glyphs.push({ text, x0: o.x + (Math.random() - 0.5) * 8, y0: o.y, dx: (Math.random() - 0.5) * 14, start: now, dur: 1500 + Math.random() * 500 });
  }

  function ring(at: Point, color: number, now: number, r = 14, dur = 900) {
    if (reducedMotion) return;
    const g = new Graphics();
    fxLayer.addChild(g);
    rings.push({ g, x: at.x, y: at.y, start: now, dur, color, r });
  }

  function drawPaper(g: Graphics, kind: FlightKind) {
    const stripe = kind === "assign" ? C.indigo : kind === "handoff" ? C.violet : kind === "approval" ? C.clay : kind === "cancel" ? C.niebla : C.ivory;
    g.roundRect(-4.5, -6, 9, 12, 1.2).fill({ color: C.ivory }).stroke({ width: 0.8, color: C.graphite, alpha: 0.6 });
    g.rect(-4.5, -6, 9, 2.6).fill({ color: stripe });
    for (let i = 0; i < 3; i++) g.rect(-3, -1.6 + i * 2.2, i === 2 ? 4 : 6, 0.8).fill({ color: 0x8a8d97 });
    if (kind === "deliver") g.moveTo(-2.2, 3.4).lineTo(-0.4, 5).lineTo(2.8, 1.4).stroke({ width: 1.4, color: C.indigo, cap: "round" });
    if (kind === "approval") g.circle(3.2, 4.2, 2.6).fill({ color: C.clay });
  }

  function launch(kind: FlightKind, from: Point, to: Point, color: number, start: number, onArrive?: () => void) {
    const paper = new Graphics();
    drawPaper(paper, kind);
    const trail = new Graphics();
    fxLayer.addChild(trail, paper);
    paper.position.set(from.x, from.y);
    paper.visible = false;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    flights.push({ paper, trail, from, to, start, dur: kind === "cancel" ? 900 : Math.min(2200, 800 + dist * 1.6), color, onArrive, pts: [] });
  }

  function playEvent(e: WorldEvent, now: number) {
    const s = sprites.get(e.agentId);
    if (!s) return;
    const start = Math.max(now, nextFlightAt);
    const f = flightForEvent(e.type, e.message);
    if (f && !reducedMotion) {
      nextFlightAt = start + 280;
      const desk = deskPoint(s);
      switch (f.kind) {
        case "assign":
          launch("assign", founderPoint, desk, C.indigo, start, () => ring(desk, C.indigo, performance.now()));
          break;
        case "handoff": {
          const from = f.fromAgentId ? sprites.get(f.fromAgentId) : undefined;
          launch("handoff", from ? deskPoint(from) : founderPoint, desk, C.violet, start, () => ring(desk, C.violet, performance.now()));
          break;
        }
        case "deliver":
          s.celebrateUntil = start + CELEBRATE_MS;
          launch("deliver", monitorTop(s), founderPoint, C.ivory, start, () => ring(founderPoint, C.ivory, performance.now(), 18));
          break;
        case "approval":
          launch("approval", monitorTop(s), founderPoint, C.clay, start, () => ring(founderPoint, C.clay, performance.now(), 18));
          break;
        case "cancel":
          launch("cancel", desk, { x: desk.x, y: desk.y - 26 }, C.niebla, start);
          break;
      }
      return;
    }
    if (e.type === "task_completed") s.celebrateUntil = now + CELEBRATE_MS;
    const at = seatScreenPosition(s.seat);
    if (e.type === "task_started") ring({ x: at.x, y: at.y }, C.indigo, now, 16);
    else if (e.type === "task_failed") { ring({ x: at.x, y: at.y }, C.error, now, 16); s.shakeUntil = now + 700; }
    else if (e.type === "task_waiting_input") ring({ x: at.x, y: at.y }, C.clay, now, 16);
    else if (e.type === "task_updated") ring({ x: at.x, y: at.y + headTop(s.drawnPose ?? "idle") - 4 }, C.indigo, now, 10, 700);
  }

  function tickEffects(now: number) {
    for (let i = glyphs.length - 1; i >= 0; i--) {
      const gl = glyphs[i]!;
      const t = (now - gl.start) / gl.dur;
      if (t >= 1 || reducedMotion) {
        gl.text.visible = false;
        fxLayer.removeChild(gl.text);
        glyphPool.push(gl.text);
        glyphs.splice(i, 1);
        continue;
      }
      gl.text.position.set(gl.x0 + gl.dx * t, gl.y0 - 34 * easeInOut(t));
      gl.text.alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      gl.text.scale.set(0.85 + 0.25 * t);
    }
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]!;
      if (now < f.start) continue;
      const raw = (now - f.start) / f.dur;
      const t = easeInOut(Math.min(1, raw));
      const lift = Math.hypot(f.to.x - f.from.x, f.to.y - f.from.y) < 40 ? 6 : 70;
      const p = arcPoint(f.from, f.to, t, lift);
      f.paper.visible = true;
      f.paper.position.set(p.x, p.y);
      f.paper.rotation = Math.sin(raw * Math.PI * 2) * 0.25;
      f.paper.scale.set(1 + 0.35 * Math.sin(Math.PI * t));
      if (f.color === C.niebla) f.paper.alpha = 1 - t;
      f.pts.push(p);
      if (f.pts.length > 7) f.pts.shift();
      f.trail.clear();
      f.pts.forEach((q, k) => f.trail.circle(q.x, q.y, 0.6 + k * 0.25).fill({ color: f.color, alpha: 0.08 + k * 0.05 }));
      if (raw >= 1) {
        f.paper.destroy();
        f.trail.destroy();
        flights.splice(i, 1);
        f.onArrive?.();
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]!;
      const t = (now - r.start) / r.dur;
      if (t >= 1) {
        r.g.destroy();
        rings.splice(i, 1);
        continue;
      }
      const k = easeInOut(t);
      r.g.clear();
      r.g.ellipse(r.x, r.y, r.r * (0.4 + k), r.r * 0.5 * (0.4 + k)).stroke({ width: 2 * (1 - t) + 0.5, color: r.color, alpha: 1 - t });
    }
    if (camTween) {
      const t = Math.min(1, (now - camTween.start) / camTween.dur);
      const k = easeInOut(t);
      camera.position.set(camTween.fx + (camTween.tx - camTween.fx) * k, camTween.fy + (camTween.ty - camTween.fy) * k);
      if (t >= 1) camTween = null;
    }
  }

  // ------------------------------------------------------------------ ticker
  const tick = () => {
    const now = performance.now();
    tickEffects(now);
    for (const s of sprites.values()) {
      const status = s.agent.status;
      const since = now - s.statusSince;
      const celebrating = now < s.celebrateUntil && now >= s.celebrateUntil - CELEBRATE_MS;
      const pose = celebrating ? "celebrate" : resolvePose(status, since);
      const anim = celebrating ? (reducedMotion ? "none" : "celebrate") : resolveAnimation(status, since, reducedMotion);
      if (anim === "typing" && now >= s.nextGlyphAt) {
        spawnGlyph(s, now);
        s.nextGlyphAt = now + 650 + Math.random() * 650;
      }
      s.figure.x = now < s.shakeUntil && !reducedMotion ? Math.sin(now / 28) * 1.6 : 0;
      const frame = anim === "typing" ? Math.floor((now + s.phase * 7) / 170) % 2 : 0;
      if (pose !== s.drawnPose || frame !== s.drawnFrame) drawFigure(s, pose, frame);

      const t = now + s.phase * 13;
      switch (anim) {
        case "typing":
          s.figure.y = Math.sin(t / 120) > 0.3 ? -0.8 : 0;
          break;
        case "celebrate":
          s.figure.y = -Math.abs(Math.sin(t / 150)) * 4;
          break;
        default:
          s.figure.y = 0;
      }
      s.bubble.scale.set(anim === "bubble-pulse" ? 1 + 0.07 * (0.5 + 0.5 * Math.sin(t / 320)) : 1);

      if (s.seat.desk) {
        const m = monitors.get(s.seat.key);
        if (m && m.glow.visible) m.glow.alpha = anim === "typing" ? 0.82 + 0.18 * Math.sin(t / 420) : 1;
      }
    }
  };
  app.ticker.add(tick);
  app.ticker.maxFPS = reducedMotion ? 30 : 60;

  function panTo(wx: number, wy: number) {
    const scale = camera.scale.x;
    const tx = app.screen.width / 2 - wx * scale;
    const ty = app.screen.height / 2 - wy * scale;
    userMovedCamera = true;
    if (reducedMotion) {
      camera.position.set(tx, ty);
      return;
    }
    camTween = { fx: camera.x, fy: camera.y, tx, ty, start: performance.now(), dur: 650 };
  }

  // ------------------------------------------------------------------ public API
  const scene: WorldScene = {
    setAgents(agents) {
      const now = performance.now();
      const seats = assignSeats(agents);
      const seen = new Set<string>();
      for (const agent of agents) {
        const seat = seats.get(agent.id);
        if (!seat || seen.has(agent.id)) continue;
        seen.add(agent.id);
        let s = sprites.get(agent.id);
        if (!s) {
          s = createSprite(agent, seat, now);
          sprites.set(agent.id, s);
        } else {
          if (s.agent.status !== agent.status) s.statusSince = now;
          s.agent = agent;
          if (s.seat.key !== seat.key) {
            s.seat = seat;
            placeSprite(s);
          }
        }
        const key = JSON.stringify(agent.avatar);
        if (key !== s.avatarKey) {
          s.avatarKey = key;
          s.drawnPose = null; // force redraw on next tick
        }
        const v = statusVisual(agent.status);
        if (s.drawnBubble !== v.bubble) drawBubble(s, v.bubble);
        if (s.drawnPose === null) {
          drawFigure(s, resolvePose(agent.status, now - s.statusSince), 0);
        } else {
          layoutOverlay(s);
        }
        drawProgress(s);
        drawTray(s);
        refreshChrome(agent.id);
      }
      for (const [id, s] of sprites) {
        if (seen.has(id)) continue;
        s.tray.destroy({ children: true });
        s.body.destroy({ children: true });
        s.decal.destroy();
        s.overlay.destroy({ children: true });
        sprites.delete(id);
        if (hoveredId === id) hoveredId = null;
      }
      refreshMonitors();
    },
    setSelected(agentId) {
      if (selectedId === agentId) return;
      const prev = selectedId;
      selectedId = agentId;
      if (prev) refreshChrome(prev);
      if (agentId) refreshChrome(agentId);
    },
    setReducedMotion(value) {
      reducedMotion = value;
      app.ticker.maxFPS = value ? 30 : 60;
    },
    setOnSelect(fn) {
      onSelect = fn;
    },
    fit() {
      userMovedCamera = false;
      applyFit();
    },
    zoomBy(factor) {
      zoomAt(app.screen.width / 2, app.screen.height / 2, factor);
    },
    playEvents(events) {
      const now = performance.now();
      const fresh = events.filter((e) => !played.has(e.id)).sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
      for (const e of fresh) {
        played.add(e.id);
        playEvent(e, now);
      }
    },
    focusAgent(agentId) {
      const s = sprites.get(agentId);
      if (!s) return;
      const p = seatScreenPosition(s.seat);
      panTo(p.x, p.y - 20);
    },
    focusArea(areaId) {
      const a = areaById(areaId);
      if (!a) return;
      const c = toIso(a.x + a.w / 2, a.y + a.h / 2);
      panTo(c.x, c.y - 10);
    },
    destroy() {
      app.ticker.remove(tick);
      app.renderer.off("resize", onResize);
      canvas.removeEventListener("wheel", onWheel);
      app.stage.off("pointerdown", onPointerDown);
      app.stage.off("globalpointermove", onPointerMove);
      app.stage.off("pointerup", onPointerUp);
      app.stage.off("pointerupoutside", onPointerUpOutside);
      sprites.clear();
      monitors.clear();
      glyphs.length = 0;
      flights.length = 0;
      rings.length = 0;
      glyphPool.length = 0;
    },
  };

  applyFit();
  return scene;
}
