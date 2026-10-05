import { useLoad } from '../../stores/useLoad';

const PHASES = { download: 'Descargando modelo 3D', decode: 'Decodificando geometría', compile: 'Preparando sombreadores', ready: 'Listo', error: 'Error' } as const;

/** Pantalla de carga con progreso real (bytes descargados y fases). */
export function LoadingScreen() {
  const { phase, loaded, total, message } = useLoad();
  if (phase === 'ready') return null;
  const pct = phase === 'download' ? (total ? Math.min(80, Math.round((loaded / total) * 80)) : 5) : phase === 'decode' ? 85 : phase === 'compile' ? 95 : 0;
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[var(--color-bg)]" data-testid="loading" data-phase={phase}>
      <div className="w-[min(380px,80vw)] text-center">
        <p className="label mb-3">Acería Digital Academy</p>
        {phase === 'error' ? (
          <div role="alert" data-testid="no-3d">
            <p className="text-[var(--color-danger)]">No se pudo mostrar el modelo 3D: {message}.</p>
            <p className="mt-2 text-[13px] text-[var(--color-text-2)]">Puedes seguir usando la lista de equipos, las lecciones, la evaluación y la biblioteca. En las preguntas de «identificar» elige el equipo en la lista.</p>
          </div>
        ) : (<>
          <div className="h-1.5 overflow-hidden rounded bg-[var(--color-surface-3)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progreso de carga">
            <div className="h-full bg-[var(--color-accent)] transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 font-mono text-[12px] text-[var(--color-text-2)]">
            {PHASES[phase]} · {pct} %{phase === 'download' && total ? ` · ${(loaded / 1024).toFixed(0)} / ${(total / 1024).toFixed(0)} KB` : ''}
          </p>
          {/* RT-UX-11: solo se anuncian los cambios de fase, no cada porcentaje */}
          <p className="sr-only" aria-live="polite">{PHASES[phase]}</p>
        </>)}
      </div>
    </div>
  );
}
