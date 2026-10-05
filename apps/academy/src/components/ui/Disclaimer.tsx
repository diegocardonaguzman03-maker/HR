import { useEffect, useRef } from 'react';

export const DISCLAIMER = 'Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad.';

/** Aviso permanente (no se puede cerrar). Revisión de seguridad ADX-04, principio P1. */
export function Disclaimer() {
  const ref = useRef<HTMLElement>(null);
  // publica la altura del aviso para que nada flotante (asistente) lo tape
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--disclaimer-h', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <footer ref={ref} role="contentinfo" data-testid="disclaimer" className="flex min-h-9 items-center gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-[12px] text-[var(--color-text-2)]">
      <span aria-hidden className="font-semibold text-[var(--color-warning)]">⚠</span>
      <span><strong className="font-semibold text-[var(--color-text)]">Aviso de seguridad:</strong> {DISCLAIMER} La plataforma no certifica competencia para trabajo sin supervisión.</span>
    </footer>
  );
}
