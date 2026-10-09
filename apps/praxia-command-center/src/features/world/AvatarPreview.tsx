"use client";

/**
 * Avatar preview for the avatar editor. Draws with the same `drawAvatar` as PRAXIA World, on a plain 2D canvas
 * (no WebGL context per preview).
 */
import { useEffect, useRef } from "react";
import { createCanvasPainter, drawAvatar } from "./avatar";
import { PRAXIA_COLORS, type AvatarPose } from "./layout";
import type { AvatarConfig } from "./types";

export type AvatarPreviewProps = {
  avatar: AvatarConfig;
  pose?: AvatarPose;
  /** CSS pixel size of the square preview. */
  size?: number;
  /** Draw a small isometric floor tile under the avatar. */
  showFloor?: boolean;
  label?: string;
  className?: string;
};

/** Avatar units shown vertically (covers the celebrate pose with raised arms). */
const VIEW_UNITS = 44;

export function AvatarPreview({ avatar, pose = "idle", size = 96, showFloor = true, label, className }: AvatarPreviewProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const avatarKey = JSON.stringify(avatar);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = (size / VIEW_UNITS) * dpr;
    ctx.setTransform(scale, 0, 0, scale, (size * dpr) / 2, size * dpr * 0.86);
    const painter = createCanvasPainter(ctx);
    if (showFloor) {
      painter.poly([0, -6, 14, 1, 0, 8, -14, 1], true).fill({ color: PRAXIA_COLORS.graphite2 }).stroke({
        width: 0.6,
        color: PRAXIA_COLORS.niebla,
        alpha: 0.35,
      });
    }
    drawAvatar(painter, JSON.parse(avatarKey) as AvatarConfig, pose);
  }, [avatarKey, pose, size, showFloor]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label ?? "Avatar preview"}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export default AvatarPreview;
