import { useApp, type Mode, type Quality } from '../../stores/useApp';
import { track } from '../../lib/analytics';
import { btnPrimary } from '../ui/Status';

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'explore', label: 'EXPLORAR', hint: 'Recorre el horno y sus equipos' },
  { id: 'learn', label: 'APRENDER', hint: 'Lecciones guiadas' },
  { id: 'perform', label: 'EJECUTAR', hint: 'Ayuda de trabajo paso a paso' },
  { id: 'assess', label: 'EVALUAR', hint: 'Comprueba lo aprendido' },
  { id: 'library', label: 'BIBLIOTECA', hint: 'Documentos y videos' },
];
const Q: { id: Quality; label: string }[] = [{ id: 'auto', label: 'Auto' }, { id: 'low', label: 'Baja' }, { id: 'medium', label: 'Media' }, { id: 'high', label: 'Alta' }];

export function TopBar() {
  const { mode, setMode, quality, effective, set, assistantOpen } = useApp();
  return (
    <header className="flex min-h-13 flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="grid h-7 w-7 place-items-center rounded bg-[var(--color-accent)] font-mono text-[12px] font-bold text-[var(--color-accent-ink)]">AD</span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-wide">ACERÍA DIGITAL ACADEMY</p>
          <p className="font-mono text-[10.5px] text-[var(--color-text-3)]">HORNO DE ARCO ELÉCTRICO · GASM</p>
        </div>
      </div>
      <nav aria-label="Modos" className="order-3 flex w-full gap-0.5 overflow-x-auto md:order-none md:w-auto">
        {MODES.map((m) => (
          <button key={m.id} title={m.hint} aria-current={mode === m.id ? 'page' : undefined} data-testid={`mode-${m.id}`}
            onClick={() => { setMode(m.id); track('mode-changed', m.id); }}
            className={`shrink-0 rounded-md px-3 py-1.5 font-mono text-[11.5px] font-medium tracking-wider transition ${mode === m.id ? 'bg-[var(--color-surface-3)] text-[var(--color-text)] shadow-[inset_0_-2px_0_var(--color-accent)]' : 'text-[var(--color-text-3)] hover:text-[var(--color-text)]'}`}>
            {m.label}
          </button>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-3)]">
          <span className="hidden sm:inline">Gráficos</span>
          <select aria-label="Calidad de gráficos" data-testid="quality" value={quality} className="rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-1.5 py-1 text-[12px] text-[var(--color-text)]"
            onChange={(e) => { const q = e.target.value as Quality; try { localStorage.setItem('adx.quality', q); } catch { /* */ } set({ quality: q, effective: q === 'auto' ? effective : q }); }}>
            {Q.map((x) => <option key={x.id} value={x.id}>{x.label}{x.id === 'auto' && quality === 'auto' ? ` (${({ low: 'baja', medium: 'media', high: 'alta' } as const)[effective]})` : ''}</option>)}
          </select>
        </label>
        <button className={btnPrimary} aria-expanded={assistantOpen} onClick={() => set({ assistantOpen: !assistantOpen })} data-testid="open-assistant">
          <span aria-hidden>✦</span> Pregunta a Acería AI
        </button>
      </div>
    </header>
  );
}
