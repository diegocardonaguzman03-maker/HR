'use client';
// Mounts the PixiJS world and bridges it to the stores.
// Domain state flows in (store → game). User picks flow out (game → ui store).
import { useEffect, useRef } from 'react';
import { GameWorld } from '@/game/world/GameWorld';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';

let instance: GameWorld | null = null;
export const getGame = () => instance;

export function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const game = new GameWorld({
      onPick: (p) => {
        const u = useUi.getState();
        if (!p) return u.select(null);
        if (p.kind === 'citadel') {
          u.select(p);
          return u.openOs('today');
        }
        u.select(p);
      },
      onHover: (p) => useUi.getState().setHover(p),
      onDoubleClickTerritory: (t) => useUi.getState().focus(t === 'citadel' ? { type: 'citadel' } : { type: 'territory', id: t }),
      onCameraTerritory: (t) => useUi.getState().setCameraTerritory(t),
    });
    instance = game;
    game.setWorld(useWorld.getState().world);
    void game.init(el).then(() => {
      const u = useUi.getState();
      game.setReducedMotion(u.reducedMotion);
      game.setSelection(u.selection, u.hover);
    });

    const unsubWorld = useWorld.subscribe((s, prev) => {
      if (s.world !== prev.world) game.setWorld(s.world);
    });
    const unsubUi = useUi.subscribe((s, prev) => {
      if (s.selection !== prev.selection || s.hover !== prev.hover) game.setSelection(s.selection, s.hover);
      if (s.camera && s.camera !== prev.camera) game.focus(s.camera.target);
      if (s.reducedMotion !== prev.reducedMotion) game.setReducedMotion(s.reducedMotion);
    });
    return () => {
      unsubWorld();
      unsubUi();
      game.destroy();
      instance = null;
    };
  }, []);

  // Keep focus targets visible next to open panels.
  const panelOpen = useUi((s) => !!(s.selection && s.selection.kind !== 'citadel') || !!s.chat);
  const wide = useUi((s) => !!(s.workspace || s.agentProfile || s.os));
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    instance?.setInsets(
      mobile
        ? { right: 0, left: 0, bottom: panelOpen ? Math.round(window.innerHeight * 0.64) : 130, top: 56 }
        : { right: wide ? 720 : panelOpen ? 400 : 0, left: 64, bottom: 90, top: 56 },
    );
  }, [panelOpen, wide]);

  return <div ref={ref} className="absolute inset-0 select-none" aria-label="Interactive world map" role="application" />;
}
