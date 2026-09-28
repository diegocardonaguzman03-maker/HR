import { NAVIGATOR_GROUPS } from '../config/processConfig';
import { steps } from '../sim/clock';
import { useAppStore } from '../store/useAppStore';

/** Persistent process navigator (brief §15). */
export function Navigator() {
  const open = useAppStore((s) => s.panels.navigator);
  const stepIndex = useAppStore((s) => s.stepIndex);
  const goToStep = useAppStore((s) => s.goToStep);
  const goToGroup = useAppStore((s) => s.goToGroup);
  const all = steps();
  const activeGroup = all[stepIndex]?.navigatorGroup;
  const activeGroupIdx = NAVIGATOR_GROUPS.findIndex((g) => g.id === activeGroup);
  if (!open) return null;

  return (
    <aside className="hud-panel animate-slide pointer-events-auto flex max-h-full w-64 flex-col">
      <div className="px-4 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Process navigator</div>
      <ol className="flex-1 overflow-y-auto px-2 pb-3">
        {NAVIGATOR_GROUPS.map((g, gi) => {
          const groupSteps = all.map((s, i) => ({ s, i })).filter((x) => x.s.navigatorGroup === g.id);
          if (!groupSteps.length) return null;
          const active = g.id === activeGroup;
          const done = gi < activeGroupIdx;
          return (
            <li key={g.id}>
              <button
                onClick={() => goToGroup(g.id)}
                className={`group flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left transition ${active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
              >
                <span className={`font-mono text-[11px] ${active ? 'text-amber-300' : done ? 'text-zinc-400' : 'text-zinc-600'}`}>{g.number}</span>
                <span className={`text-[12px] uppercase tracking-wide ${active ? 'font-semibold text-zinc-50' : done ? 'text-zinc-300' : 'text-zinc-500'}`}>{g.label}</span>
                {done && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-zinc-500" />}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </button>
              {active && (
                <ul className="mb-1 ml-9 border-l border-white/10">
                  {groupSteps.map(({ s, i }) => (
                    <li key={s.state}>
                      <button
                        onClick={() => goToStep(i)}
                        className={`block w-full px-2 py-1 text-left text-[11px] ${i === stepIndex ? 'text-amber-200' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        {String(i + 1).padStart(2, '0')} · {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      <div className="border-t border-white/10 px-4 py-2 text-[10px] leading-relaxed text-zinc-500">
        Optional operations (e.g. vacuum degassing) are configured in <span className="font-mono text-zinc-400">processConfig.ts</span>.
      </div>
    </aside>
  );
}
