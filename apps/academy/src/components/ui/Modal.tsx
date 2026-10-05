import { useEffect, useRef, type ReactNode } from 'react';
import { DISCLAIMER } from './Disclaimer';

/** Diálogo modal accesible: foco atrapado, Esc cierra, devuelve el foco al cerrar. */
export function Modal({ title, onClose, children, wide = false, testid }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; testid?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, a, [tabindex="0"]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = [...ref.current.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, video, iframe, [tabindex="0"]')].filter((x) => !x.hasAttribute('disabled'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} data-testid={testid} className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-4 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded px-2 py-1 text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]">✕</button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
        <p role="note" data-testid="modal-disclaimer" className="border-t border-[var(--color-line)] px-4 py-1.5 text-[11.5px] text-[var(--color-text-2)]"><span aria-hidden>⚠ </span><strong>Aviso de seguridad:</strong> {DISCLAIMER}</p>
      </div>
    </div>
  );
}
