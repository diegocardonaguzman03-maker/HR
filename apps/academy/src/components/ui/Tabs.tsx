import { useRef, type KeyboardEvent } from 'react';

/** Pestañas accesibles (role=tablist, flechas izquierda/derecha, Inicio/Fin). */
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: string; badge?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n >= 0) { e.preventDefault(); onChange(tabs[n].id); refs.current[n]?.focus(); }
  };
  return (
    <div role="tablist" aria-label={label} className="scroll-thin flex gap-0.5 overflow-x-auto border-b border-[var(--color-line)] px-2">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el; }}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={value === t.id ? `panel-${t.id}` : undefined}
          tabIndex={value === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
          data-testid={`tab-${t.id}`}
          className={`shrink-0 border-b-2 px-2.5 py-2 font-mono text-[11px] font-medium tracking-wider transition ${value === t.id ? 'border-[var(--color-accent)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-3)] hover:text-[var(--color-text-2)]'}`}
        >
          {t.label}
          {t.badge ? <span className="ml-1 rounded bg-[var(--color-surface-3)] px-1 text-[10px]">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
