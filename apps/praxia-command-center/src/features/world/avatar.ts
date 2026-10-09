/**
 * Procedural avatars for PRAXIA World and the avatar editor.
 *
 * `drawAvatar` paints through `AvatarPainter`, the subset of the PixiJS 8 `Graphics` API it needs, so the same
 * code draws on a PixiJS `Graphics` (the world) or on a plain 2D canvas via `createCanvasPainter` (the editor
 * preview, which must not spend a WebGL context per thumbnail). This module has no runtime PixiJS import.
 *
 * Local coordinates: origin at the avatar's feet, y grows downward. Standing height ≈ 33 px, seated ≈ 27 px.
 */
import type { AvatarConfig } from "./types";
import type { AvatarPose } from "./layout";
import { PRAXIA_COLORS } from "./layout";

export type PainterFill = { color: number; alpha?: number };
export type PainterStroke = { width: number; color: number; alpha?: number; cap?: "butt" | "round" | "square" };

/** Structural subset of PixiJS 8 `Graphics`; a `Graphics` instance satisfies it. */
export interface AvatarPainter {
  rect(x: number, y: number, w: number, h: number): AvatarPainter;
  roundRect(x: number, y: number, w: number, h: number, radius?: number): AvatarPainter;
  circle(x: number, y: number, radius: number): AvatarPainter;
  ellipse(x: number, y: number, radiusX: number, radiusY: number): AvatarPainter;
  poly(points: number[], close?: boolean): AvatarPainter;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): AvatarPainter;
  moveTo(x: number, y: number): AvatarPainter;
  lineTo(x: number, y: number): AvatarPainter;
  closePath(): AvatarPainter;
  fill(style: PainterFill): AvatarPainter;
  stroke(style: PainterStroke): AvatarPainter;
}

export type DrawAvatarOptions = {
  /** Typing frame (0/1) alternates the hands; ignored by other poses. */
  frame?: number;
  /** Draw the soft floor shadow (default true). */
  shadow?: boolean;
};

export const AVATAR_STANDING_HEIGHT = 33;
export const AVATAR_SEATED_DROP = 6;

// ---------------------------------------------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------------------------------------------
/** Parses `#RGB` / `#RRGGBB`; returns `fallback` for anything else. */
export function parseHexColor(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m || !m[1]) return fallback;
  const hex = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return parseInt(hex, 16);
}

/** Multiplies RGB channels by `factor` (<1 darkens, >1 lightens, clamped). */
export function shade(color: number, factor: number): number {
  const ch = (shift: number) => Math.max(0, Math.min(255, Math.round(((color >> shift) & 0xff) * factor)));
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** Mixes two colours, t ∈ [0, 1]. */
export function mix(a: number, b: number, t: number): number {
  const ch = (shift: number) =>
    Math.round(((a >> shift) & 0xff) * (1 - t) + ((b >> shift) & 0xff) * t) & 0xff;
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

const luminance = (c: number) => (0.2126 * ((c >> 16) & 0xff) + 0.7152 * ((c >> 8) & 0xff) + 0.0722 * (c & 0xff)) / 255;

// ---------------------------------------------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------------------------------------------
const BODY = {
  a: { torso: 9, shoulder: 0 },
  b: { torso: 11, shoulder: 0.5 },
  c: { torso: 13, shoulder: 1 },
} as const;

const DEFAULTS = {
  skin: 0xc68e6a,
  hair: 0x2b2118,
  outfit: PRAXIA_COLORS.indigo,
};

/**
 * Draws an avatar into `g` (appends to whatever is already there; call `g.clear()` first to redraw).
 * Pure with respect to its inputs: same avatar + pose + frame → same drawing.
 */
export function drawAvatar(g: AvatarPainter, avatar: AvatarConfig, pose: AvatarPose, options: DrawAvatarOptions = {}): void {
  const body = BODY[avatar.bodyType] ?? BODY.b;
  const skin = parseHexColor(avatar.skinTone, DEFAULTS.skin);
  const hair = parseHexColor(avatar.hairColor, DEFAULTS.hair);
  const outfit = parseHexColor(avatar.outfitColor, DEFAULTS.outfit);
  // Trousers: a darker shade of the outfit, but never a black hole on the Graphite floor.
  const pants = luminance(outfit) < 0.12 ? 0x2a2c36 : shade(outfit, 0.55);
  const rim = { width: 0.8, color: PRAXIA_COLORS.niebla, alpha: 0.4 } as const;
  const ink = PRAXIA_COLORS.graphite;
  const frame = (options.frame ?? 0) % 2;

  const seated = pose === "seated" || pose === "typing";
  const drop = seated ? AVATAR_SEATED_DROP : 0;
  const tw = body.torso;
  const torsoTop = -21 + drop;
  const torsoH = 11;
  const headR = 5;
  const headY = -27.5 + drop;

  if (options.shadow !== false) g.ellipse(0, 0, 9, 3.5).fill({ color: 0x000000, alpha: 0.35 });

  // Legs
  if (seated) {
    g.rect(-tw / 2 + 0.5, -10 + drop, tw - 1, 4).fill({ color: pants }); // lap
    g.rect(-3.5, -6, 3, 5).fill({ color: pants });
    g.rect(0.5, -6, 3, 5).fill({ color: pants });
    g.rect(-3.8, -1.5, 3.4, 1.5).fill({ color: 0x1b1c24 });
    g.rect(0.4, -1.5, 3.4, 1.5).fill({ color: 0x1b1c24 });
  } else {
    g.rect(-3.5, -10.5, 3, 9).fill({ color: pants });
    g.rect(0.5, -10.5, 3, 9).fill({ color: pants });
    g.rect(-3.8, -1.8, 3.4, 1.8).fill({ color: 0x1b1c24 });
    g.rect(0.4, -1.8, 3.4, 1.8).fill({ color: 0x1b1c24 });
  }

  // Long hair falls behind the shoulders: paint it before the torso and head.
  if (avatar.hairStyle === "long") {
    g.roundRect(-headR - 1, headY - 1, headR * 2 + 2, 11, 2.5).fill({ color: hair });
  }

  // Arms (behind the torso for idle/seated, in front for typing/celebrate)
  const armW = 2.6;
  const shoulderX = tw / 2 + body.shoulder;
  if (pose === "idle" || pose === "seated") {
    g.roundRect(-shoulderX - armW + 0.6, torsoTop + 1, armW, 10, 1.2).fill({ color: outfit }).stroke(rim);
    g.roundRect(shoulderX - 0.6, torsoTop + 1, armW, 10, 1.2).fill({ color: outfit }).stroke(rim);
    g.circle(-shoulderX - armW / 2 + 0.6, torsoTop + 11.6, 1.4).fill({ color: skin });
    g.circle(shoulderX + armW / 2 - 0.6, torsoTop + 11.6, 1.4).fill({ color: skin });
  }

  // Torso
  g.roundRect(-tw / 2, torsoTop, tw, torsoH, 3).fill({ color: outfit }).stroke(rim);
  // Collar line (Ivory hairline) for structure
  g.moveTo(-1.6, torsoTop + 0.6).lineTo(0, torsoTop + 2.2).lineTo(1.6, torsoTop + 0.6).stroke({
    width: 0.7,
    color: PRAXIA_COLORS.ivory,
    alpha: 0.35,
  });

  if (pose === "typing") {
    // Forearms reach forward to the keyboard; hands alternate with the frame.
    const lift = frame === 0 ? [0, 1] : [1, 0];
    g.roundRect(-shoulderX - 0.4, torsoTop + 2, armW, 7, 1.2).fill({ color: outfit }).stroke(rim);
    g.roundRect(shoulderX - armW + 0.4, torsoTop + 2, armW, 7, 1.2).fill({ color: outfit }).stroke(rim);
    g.circle(-shoulderX + 2.4, torsoTop + 9.5 - (lift[0] ?? 0), 1.5).fill({ color: skin });
    g.circle(shoulderX - 2.4, torsoTop + 9.5 - (lift[1] ?? 0), 1.5).fill({ color: skin });
  } else if (pose === "celebrate") {
    g.roundRect(-shoulderX - armW + 0.4, torsoTop - 9, armW, 10, 1.2).fill({ color: outfit }).stroke(rim);
    g.roundRect(shoulderX - 0.4, torsoTop - 9, armW, 10, 1.2).fill({ color: outfit }).stroke(rim);
    g.circle(-shoulderX - armW / 2 + 0.4, torsoTop - 9.6, 1.5).fill({ color: skin });
    g.circle(shoulderX + armW / 2 - 0.4, torsoTop - 9.6, 1.5).fill({ color: skin });
  }

  // Badge (on the chest)
  if (avatar.accessory === "badge") {
    g.rect(tw / 2 - 4.2, torsoTop + 3, 2.6, 3.4).fill({ color: PRAXIA_COLORS.ivory });
    g.rect(tw / 2 - 4.2, torsoTop + 3, 2.6, 0.9).fill({ color: PRAXIA_COLORS.clay });
  }

  // Neck and head
  g.rect(-1.3, headY + headR - 1, 2.6, 2.6).fill({ color: shade(skin, 0.88) });
  g.circle(0, headY, headR).fill({ color: skin });

  // Hair. Each arc starts with an explicit moveTo: PixiJS keeps the previous shape's last point as the current
  // point after fill(), and an arc would otherwise connect to it.
  const capR = headR + 0.6;
  const cap = (cy: number, r: number) => g.moveTo(-r, cy).arc(0, cy, r, Math.PI, Math.PI * 2).closePath();
  switch (avatar.hairStyle) {
    case "buzz":
      cap(headY - 0.4, headR + 0.2).fill({ color: hair, alpha: 0.7 });
      break;
    case "curly": {
      cap(headY - 0.6, capR).fill({ color: hair });
      for (let i = 0; i <= 5; i++) {
        const a = Math.PI + (i / 5) * Math.PI;
        g.circle(Math.cos(a) * capR, headY - 0.6 + Math.sin(a) * capR, 2.1).fill({ color: hair });
      }
      break;
    }
    case "bun":
      cap(headY - 0.6, capR).fill({ color: hair });
      g.circle(0, headY - headR - 2.2, 2.6).fill({ color: hair });
      break;
    case "long":
      cap(headY - 0.6, capR).fill({ color: hair });
      g.rect(-capR, headY - 0.8, 1.8, 6).fill({ color: hair });
      g.rect(capR - 1.8, headY - 0.8, 1.8, 6).fill({ color: hair });
      break;
    case "short":
    default:
      cap(headY - 0.6, capR).fill({ color: hair });
      g.poly([-capR, headY - 0.6, -capR + 3.5, headY - 0.6, -capR + 1.2, headY + 1.4]).fill({ color: hair });
      break;
  }

  // Face
  g.circle(-1.8, headY + 0.6, 0.7).fill({ color: ink, alpha: 0.9 });
  g.circle(1.8, headY + 0.6, 0.7).fill({ color: ink, alpha: 0.9 });

  // Accessories on the head
  if (avatar.accessory === "glasses") {
    const lens = { width: 0.7, color: PRAXIA_COLORS.ivory, alpha: 0.85 } as const;
    g.roundRect(-3.4, headY - 0.6, 2.8, 2.2, 0.6).stroke(lens);
    g.roundRect(0.6, headY - 0.6, 2.8, 2.2, 0.6).stroke(lens);
    g.moveTo(-0.6, headY + 0.2).lineTo(0.6, headY + 0.2).stroke(lens);
  } else if (avatar.accessory === "headset") {
    const hr = headR + 1.2;
    g.moveTo(Math.cos(Math.PI * 1.05) * hr, headY + Math.sin(Math.PI * 1.05) * hr)
      .arc(0, headY, hr, Math.PI * 1.05, Math.PI * 1.95)
      .stroke({ width: 1.2, color: 0x2a2c36 });
    g.roundRect(-headR - 1.9, headY - 1.5, 2.2, 3.6, 0.8).fill({ color: 0x2a2c36 });
    g.roundRect(headR - 0.3, headY - 1.5, 2.2, 3.6, 0.8).fill({ color: 0x2a2c36 });
    g.moveTo(headR + 0.6, headY + 2).lineTo(2.2, headY + 3.6).stroke({ width: 0.8, color: 0x2a2c36 });
    g.circle(2, headY + 3.6, 0.9).fill({ color: PRAXIA_COLORS.indigo });
  }

  // Celebration sparks (two small diamonds, Ivory and Clay; no rainbow)
  if (pose === "celebrate") {
    const spark = (x: number, y: number, color: number) =>
      g.poly([x, y - 2, x + 1.4, y, x, y + 2, x - 1.4, y]).fill({ color });
    spark(-10, headY - 7, PRAXIA_COLORS.ivory);
    spark(10.5, headY - 4, PRAXIA_COLORS.clay);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 2D canvas adapter (mirrors PixiJS 8 path semantics: fill/stroke consume the current path; a stroke right after
// a fill reuses the filled path, and vice versa).
// ---------------------------------------------------------------------------------------------------------------
const rgba = (color: number, alpha = 1) =>
  `rgba(${(color >> 16) & 0xff},${(color >> 8) & 0xff},${color & 0xff},${alpha})`;

export function createCanvasPainter(ctx: CanvasRenderingContext2D): AvatarPainter {
  let path = new Path2D();
  let lastPath: Path2D | null = null;
  let lastAction: "fill" | "stroke" | null = null;
  let tick = 0;

  const shape = (fn: (p: Path2D) => void): AvatarPainter => {
    fn(path);
    tick++;
    return painter;
  };

  const consume = (action: "fill" | "stroke"): Path2D => {
    const target = tick === 0 && lastAction && lastAction !== action && lastPath ? lastPath : path;
    lastPath = target;
    lastAction = action;
    path = new Path2D();
    tick = 0;
    return target;
  };

  const painter: AvatarPainter = {
    rect: (x, y, w, h) => shape((p) => p.rect(x, y, w, h)),
    roundRect: (x, y, w, h, r = 0) =>
      shape((p) => {
        const rr = Math.max(0, Math.min(r, w / 2, h / 2));
        p.moveTo(x + rr, y);
        p.arcTo(x + w, y, x + w, y + h, rr);
        p.arcTo(x + w, y + h, x, y + h, rr);
        p.arcTo(x, y + h, x, y, rr);
        p.arcTo(x, y, x + w, y, rr);
        p.closePath();
      }),
    circle: (x, y, r) =>
      shape((p) => {
        p.moveTo(x + r, y);
        p.arc(x, y, r, 0, Math.PI * 2);
        p.closePath();
      }),
    ellipse: (x, y, rx, ry) =>
      shape((p) => {
        p.moveTo(x + rx, y);
        p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        p.closePath();
      }),
    poly: (points, close = true) =>
      shape((p) => {
        for (let i = 0; i + 1 < points.length; i += 2) {
          const px = points[i] ?? 0;
          const py = points[i + 1] ?? 0;
          if (i === 0) p.moveTo(px, py);
          else p.lineTo(px, py);
        }
        if (close) p.closePath();
      }),
    arc: (x, y, r, a0, a1, ccw) => shape((p) => p.arc(x, y, r, a0, a1, ccw)),
    moveTo: (x, y) => shape((p) => p.moveTo(x, y)),
    lineTo: (x, y) => shape((p) => p.lineTo(x, y)),
    closePath: () => shape((p) => p.closePath()),
    fill: (style) => {
      const target = consume("fill");
      ctx.fillStyle = rgba(style.color, style.alpha ?? 1);
      ctx.fill(target);
      return painter;
    },
    stroke: (style) => {
      const target = consume("stroke");
      ctx.strokeStyle = rgba(style.color, style.alpha ?? 1);
      ctx.lineWidth = style.width;
      ctx.lineCap = style.cap ?? "butt";
      ctx.lineJoin = "round";
      ctx.stroke(target);
      return painter;
    },
  };
  return painter;
}
