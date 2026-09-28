import { NAVIGATOR_GROUPS } from '../config/processConfig';
import { steps } from '../sim/clock';
import { useAppStore } from '../store/useAppStore';
import { useSnapshot } from './useSnapshot';

const SPEEDS = [0.5, 1, 2, 4];

function Btn({ onClick, label, children, disabled }: { onClick: () => void; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center rounded-sm border border-white/10 px-2 text-xs text-zinc-200 transition hover:border-white/30 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** Process timeline + simulation controls (brief §6, §14). */
export function Timeline() {
  const { step, stepIndex, total, progress } = useSnapshot();
  const playing = useAppStore((s) => s.playing);
  const speed = useAppStore((s) => s.speed);
  const mode = useAppStore((s) => s.mode);
  const st = useAppStore.getState();
  const all = steps();
  const totalDur = all.reduce((a, s) => a + s.duration, 0);
  const elapsed = all.slice(0, stepIndex).reduce((a, s) => a + s.duration, 0) + progress * step.duration;
  const groups = NAVIGATOR_GROUPS.filter((g) => all.some((s) => s.navigatorGroup === g.id));

  return (
    <footer className="hud-panel pointer-events-auto mx-3 mb-3 px-3 pb-3 pt-2.5 md:px-4">
      {/* stage timeline */}
      <div className="relative flex gap-1">
        {groups.map((g) => {
          const idx = all.map((s, i) => ({ s, i })).filter((x) => x.s.navigatorGroup === g.id);
          const dur = idx.reduce((a, x) => a + x.s.duration, 0);
          const first = idx[0].i;
          const last = idx[idx.length - 1].i;
          const active = stepIndex >= first && stepIndex <= last;
          const done = stepIndex > last;
          const localStart = all.slice(0, first).reduce((a, s) => a + s.duration, 0);
          const fill = done ? 1 : active ? Math.min(1, (elapsed - localStart) / dur) : 0;
          return (
            <button
              key={g.id}
              onClick={() => st.goToGroup(g.id)}
              style={{ flexGrow: dur }}
              className="group relative basis-0 text-left"
              title={g.label}
            >
              <div className={`mb-1 hidden truncate text-[10px] sm:block uppercase tracking-wider ${active ? 'font-semibold text-amber-300' : done ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                {g.timelineLabel}
              </div>
              <div className="h-1.5 overflow-hidden rounded-[1px] bg-white/[0.07]">
                <div className={`h-full ${active ? 'bg-amber-400' : 'bg-zinc-500'}`} style={{ width: `${fill * 100}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* controls */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Btn label="Restart" onClick={() => st.restart()}>⟲</Btn>
        <Btn label="Previous step" onClick={() => st.prev()} disabled={stepIndex === 0}>◀◀</Btn>
        <button
          onClick={() => st.togglePlay()}
          className={`font-hud flex h-9 w-28 items-center justify-center gap-1.5 text-sm font-bold tracking-[0.15em] ${playing ? 'border border-white/25 text-zinc-100' : 'bg-gradient-to-r from-amber-300 to-orange-500 text-zinc-900'}`} style={{ clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
        >
          {playing ? '❚❚ PAUSE' : '▶ PLAY'}
        </button>
        <Btn label="Next step" onClick={() => st.next()} disabled={stepIndex >= total - 1}>▶▶</Btn>
        <div className="flex items-center gap-1 rounded-sm border md:ml-2 border-white/10 p-0.5">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => st.setSpeed(s)} className={`h-7 rounded-sm px-2 font-mono text-[11px] ${speed === s ? 'bg-white/15 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {s}×
            </button>
          ))}
        </div>
        <div className="order-first w-full min-w-0 md:order-none md:ml-3 md:w-auto md:flex-1">
          <div className="truncate text-xs text-zinc-200">
            <span className="font-mono text-amber-300">STEP {String(stepIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
            <span className="mx-2 text-zinc-600">|</span>
            {step.title}
          </div>
          <div className="mt-1 h-[3px] rounded bg-white/[0.07]">
            <div className="h-full rounded bg-zinc-300" style={{ width: `${(elapsed / totalDur) * 100}%` }} />
          </div>
        </div>
        {mode === 'explore' ? (
          <button onClick={() => st.setMode('guided')} className="hud-btn-primary !flex-row !items-center !px-4 !py-2 text-xs">
            <span className="hidden sm:inline">START PROCESS</span><span className="sm:hidden">GUIDED</span>
          </button>
        ) : (
          <button onClick={() => st.setMode('explore')} className="h-8 rounded-sm border border-white/20 px-4 text-xs font-semibold tracking-wide text-zinc-100 hover:border-white/40">
            EXIT<span className="hidden sm:inline"> {mode === 'guided' ? 'GUIDED MODE' : 'FOLLOW MODE'}</span>
          </button>
        )}
      </div>
    </footer>
  );
}
