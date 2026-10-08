'use client';
// Mounts the 3D diorama and bridges it to the stores.
// Domain state flows in (store → game). User picks flow out (game → ui store).
import { useEffect, useRef } from 'react';
import { DioramaWorld } from '@/game/diorama/DioramaWorld';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';

let instance: DioramaWorld | null = null;
export const getGame = () => instance;

export function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const game = new DioramaWorld({
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
    (window as unknown as { __fccWorld?: DioramaWorld }).__fccWorld = game;
    game.setWorld(useWorld.getState().world);
    game
      .init(el)
      .then(() => {
        const u = useUi.getState();
        game.setReducedMotion(u.reducedMotion);
        game.setSelection(u.selection, u.hover);
      })
      .catch((err) => {
        // No WebGL (or a blocked GPU): keep the rest of the interface usable.
        console.error('[world] map failed to start', err);
        el.innerHTML =
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#9a978f;font:13px/1.5 ui-sans-serif,system-ui,sans-serif">The map could not start in this browser (WebGL unavailable). Agents, projects and chat still work from the menus on the left and the ⌘K palette.</div>';
      });

    const unsubWorld = useWorld.subscribe((s, prev) => {
      if (s.world !== prev.world) game.setWorld(s.world);
    });
    const unsubEvents = useWorld.getState().onEvent((e) => game.onEvent(e));
    const unsubUi = useUi.subscribe((s, prev) => {
      if (s.selection !== prev.selection || s.hover !== prev.hover) game.setSelection(s.selection, s.hover);
      if (s.camera && s.camera !== prev.camera) game.focus(s.camera.target);
      if (s.reducedMotion !== prev.reducedMotion) game.setReducedMotion(s.reducedMotion);
    });
    return () => {
      unsubWorld();
      unsubEvents();
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
