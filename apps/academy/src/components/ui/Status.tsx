import type { ReactNode } from 'react';
import { STATUS_META, splitPending } from '../../lib/content/status';
import type { ValidationStatus } from '../../lib/content/schema';
import { idx } from '../../lib/content';

/** Chip de estado: texto + icono + color (nunca solo color). */
export function StatusChip({ status, compact = false }: { status: ValidationStatus; compact?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10.5px] font-medium tracking-wide"
      style={{ color: m.color, borderColor: `color-mix(in srgb, ${m.color} 45%, transparent)`, background: `color-mix(in srgb, ${m.color} 10%, transparent)` }}
      title={m.help}
      data-status={status}
    >
      <span aria-hidden>{m.icon}</span>
      {compact ? m.short : m.label}
    </span>
  );
}

/** Texto que puede contener una marca SME_REQUIRED / PLACEHOLDER: la parte pendiente se muestra como campo por validar. */
export function OpText({ text, className = '' }: { text: string; className?: string }) {
  const { before, pending } = splitPending(text);
  if (!pending) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {before && <span>{before} </span>}
      <span role="note" className="mt-1 block rounded border border-dashed border-[var(--color-st-sme)]/60 bg-[var(--color-st-sme)]/[0.07] px-2 py-1.5 text-[12.5px] text-[var(--color-text-2)]">
        <span className="mr-1 font-mono text-[10.5px] font-semibold tracking-wide text-[var(--color-st-sme)]">
          <span aria-hidden>⚠ </span>{pending.kind === 'SME_REQUIRED' ? 'PENDIENTE DE VALIDACIÓN DE PLANTA (SME_REQUIRED)' : 'PENDIENTE DE VALIDACIÓN DE PLANTA (PLACEHOLDER)'}
        </span>
        <span className="block">{pending.text}</span>
      </span>
    </span>
  );
}

export function Section({ title, children, testid }: { title: string; children: ReactNode; testid?: string }) {
  return (
    <section className="mb-5" data-testid={testid}>
      <h3 className="label mb-2">{title}</h3>
      {children}
    </section>
  );
}

export function Bullets({ items, empty = 'Sin información registrada.' }: { items: string[]; empty?: string }) {
  if (!items.length) return <p className="text-[var(--color-text-3)]">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2 text-[13.5px] text-[var(--color-text-2)]">
          <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-3)]" />
          <OpText text={t} />
        </li>
      ))}
    </ul>
  );
}

export function Sources({ ids }: { ids: string[] }) {
  return (
    <div className="mt-6 border-t border-[var(--color-line)] pt-3">
      <h3 className="label mb-2">Fuentes</h3>
      <ul className="space-y-1">
        {ids.map((id) => {
          const s = idx.source.get(id);
          return (
            <li key={id} className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-3)]">
              {s ? <StatusChip status={s.status} compact /> : null}
              <span>{s?.title ?? id}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const btn = 'inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-text-3)] hover:bg-[var(--color-surface-3)] disabled:cursor-not-allowed disabled:opacity-40';
export const btnPrimary = 'inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-[13px] font-semibold text-[var(--color-accent-ink)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40';
