'use client';
// Desktop minimap: territories, structures, alerts, agents and the camera
// footprint. Click a territory to fly there.
import { useEffect, useRef } from 'react';
import { getGame } from '@/components/GameCanvas';
import { CITADEL_TILE, TERRITORIES, WORLD_SIZE, territoryAt } from '@/data/territories';
import { STATE_COLORS } from '@/game/agents/behavior';
import { agentPositions } from '@/game/diorama/DioramaWorld';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import { hex } from '@/components/ui/primitives';

const W = 210;
const H = 112;

const toMini = (tx: number, ty: number) => ({
  x: W / 2 + ((tx - ty) / WORLD_SIZE) * (W / 2 - 4),
  y: 4 + ((tx + ty) / (WORLD_SIZE * 2)) * (H - 8),
});
const fromMini = (x: number, y: number) => {
  const a = ((x - W / 2) / (W / 2 - 4)) * WORLD_SIZE;
  const b = ((y - 4) / (H - 8)) * WORLD_SIZE * 2;
  return [(a + b) / 2, (b - a) / 2] as const;
};

export function MiniMap() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext('2d')!;
    ctx.scale(dpr, dpr);
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 150) return;
      last = t;
      const s = useWorld.getState().world;
      const sel = useUi.getState().selection;
      ctx.clearRect(0, 0, W, H);
      for (const terr of TERRITORIES) {
        ctx.beginPath();
        terr.polygon.forEach(([x, y], i) => {
          const p = toMini(x, y);
          if (i) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fillStyle = hex(terr.palette.groundAlt);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.stroke();
      }
      // frontier fog (unexplored)
      const fogA = toMini(50, 50);
      ctx.fillStyle = 'rgba(200,204,208,0.10)';
      ctx.beginPath();
      ctx.ellipse(fogA.x, fogA.y + 18, 40, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // citadel
      const c = toMini(CITADEL_TILE[0], CITADEL_TILE[1]);
      ctx.fillStyle = '#e2bd5c';
      ctx.fillRect(c.x - 3, c.y - 3, 6, 6);
      // structures + alerts
      for (const p of Object.values(s.projects)) {
        if (p.status === 'archived') continue;
        const m = toMini(p.tile[0], p.tile[1]);
        const blocked = p.status === 'blocked';
        const waiting = Object.values(s.agents).some((a) => a.state === 'waiting' && a.currentTask?.projectId === p.id);
        ctx.fillStyle = blocked ? '#ef4444' : waiting ? '#facc15' : p.priority === 'critical' ? '#f59e0b' : p.status === 'paused' ? '#6b7280' : '#cbd5e1';
        ctx.fillRect(m.x - 2, m.y - 1.5, 4, 3);
        if (sel?.kind === 'project' && sel.id === p.id) {
          ctx.strokeStyle = '#f2e6c8';
          ctx.strokeRect(m.x - 4, m.y - 3.5, 8, 7);
        }
      }
      // agents
      for (const a of Object.values(s.agents)) {
        const pos = agentPositions.get(a.id) ?? a.position;
        const m = toMini(pos[0], pos[1]);
        ctx.fillStyle = hex(STATE_COLORS[a.state]);
        ctx.beginPath();
        ctx.arc(m.x, m.y, sel?.kind === 'agent' && sel.id === a.id ? 3 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // camera footprint
      const view = getGame()?.getViewTiles();
      if (view) {
        ctx.beginPath();
        view.forEach(([x, y], i) => {
          const p = toMini(x, y);
          if (i) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(242,230,200,0.75)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const [tx, ty] = fromMini(e.clientX - r.left, e.clientY - r.top);
    if (tx < 0 || ty < 0 || tx > WORLD_SIZE || ty > WORLD_SIZE) return;
    const t = territoryAt(tx, ty);
    const u = useUi.getState();
    if (e.detail > 1 || e.shiftKey) u.focus({ type: 'tile', x: tx, y: ty });
    else u.focus(t === 'citadel' ? { type: 'citadel' } : { type: 'territory', id: t });
  };

  return (
    <div className="glass pointer-events-auto absolute bottom-3 right-3 z-20 hidden rounded-xl p-2 lg:block">
      <div className="mb-1 flex items-center justify-between px-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        <span>World</span>
        <span className="flex gap-2 normal-case tracking-normal">
          <span className="text-yellow-300">● waiting</span>
          <span className="text-red-400">● blocked</span>
        </span>
      </div>
      <canvas ref={ref} style={{ width: W, height: H }} className="cursor-pointer" onClick={onClick} aria-label="Minimap — click a territory to move the camera" />
      <div className="mt-1 grid grid-cols-2 gap-x-2 px-0.5 text-[9.5px] text-zinc-500">
        {TERRITORIES.map((t) => (
          <button key={t.id} type="button" className="truncate text-left hover:text-zinc-200" onClick={() => useUi.getState().focus({ type: 'territory', id: t.id })}>
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: hex(t.palette.accent) }} />
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
