'use client';
// ⌘K / Ctrl+K — the fastest way to navigate and act.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUi } from '@/store/uiStore';
import { useWorld } from '@/store/worldStore';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/components/ui/primitives';
import { paletteItems, type PaletteItem } from './commands';

export function CommandPalette() {
  const open = useUi((s) => s.paletteOpen);
  const seed = useUi((s) => s.paletteSeed);
  if (!open) return null;
  return <PaletteInner seed={seed} />;
}

function PaletteInner({ seed }: { seed: string }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [q, setQ] = useState(seed);
  const [idx, setIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => paletteItems(world, q), [world, q]);

  useEffect(() => setIdx(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${idx}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [idx]);

  const run = (it: PaletteItem | undefined) => {
    if (!it) return;
    u.setPalette(false);
    it.run();
  };

  let lastGroup = '';
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-3 pt-[12vh]" onPointerDown={(e) => e.target === e.currentTarget && u.setPalette(false)}>
      <div role="dialog" aria-label="Command palette" className="glass-solid w-full max-w-xl overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/8 px-4">
          <Icon name="command" size={16} className="text-zinc-500" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
              if (e.key === 'Enter') { e.preventDefault(); run(items[idx]); }
              if (e.key === 'Escape') { e.preventDefault(); u.setPalette(false); }
            }}
            placeholder="Type a command or ask: “Take me to Praxia”, “What is SCOUT doing?”, “OJT”…"
            className="h-12 flex-1 bg-transparent text-[13.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-1.5">
          {items.length === 0 && <p className="px-3 py-6 text-center text-[12px] text-zinc-500">No matches. Try “show critical projects” or an agent name.</p>}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <div key={it.id}>
                {header && <div className="px-3 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{header}</div>}
                <button
                  type="button"
                  data-idx={i}
                  onMouseMove={() => setIdx(i)}
                  onClick={() => run(it)}
                  className={cx('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left', i === idx ? 'bg-[var(--accent)]/12 text-zinc-50' : 'text-zinc-300')}
                >
                  <Icon name={it.icon} size={15} className={i === idx ? 'text-[var(--accent)]' : 'text-zinc-500'} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px]">{it.label}</span>
                  {it.hint && <span className="max-w-[45%] truncate text-[11px] text-zinc-500">{it.hint}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
