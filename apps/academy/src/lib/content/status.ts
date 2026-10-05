import type { ValidationStatus } from './schema';

/** Etiquetas visibles de estado. Siempre texto + icono + color (nunca solo color). */
export const STATUS_META: Record<ValidationStatus, { label: string; short: string; icon: string; color: string; help: string }> = {
  GENERAL_EDUCATIONAL: { label: 'Contenido educativo general', short: 'EDUCATIVO', icon: 'ⓘ', color: 'var(--color-st-general)', help: 'Conocimiento general de la industria. No es una instrucción de planta.' },
  DEMO: { label: 'Demostración — no es procedimiento', short: 'DEMO', icon: '◇', color: 'var(--color-st-demo)', help: 'Contenido de demostración del producto. No usar para operar.' },
  SME_REQUIRED: { label: 'Requiere validación de experto (SME)', short: 'SME REQUERIDO', icon: '⚠', color: 'var(--color-st-sme)', help: 'Depende de datos de planta que aún no están validados.' },
  DRAFT_NOT_VALIDATED: { label: 'Borrador interno — NO VALIDADO', short: 'NO VALIDADO', icon: '✎', color: 'var(--color-st-draft)', help: 'Viene de un borrador interno de GASM. No es un procedimiento aprobado.' },
  PLANT_APPROVED: { label: 'Aprobado por planta', short: 'APROBADO', icon: '✔', color: 'var(--color-st-approved)', help: 'Instrucción aprobada por Seguridad y Operaciones de la planta.' },
};

/** Texto pendiente de experto de planta: SME_REQUIRED o PLACEHOLDER. */
export function pending(s: string | undefined): { pending: boolean; kind: 'SME_REQUIRED' | 'PLACEHOLDER' | null; rest: string } {
  if (!s) return { pending: false, kind: null, rest: '' };
  const m = /^\s*(SME_REQUIRED|PLACEHOLDER\s*[—-]\s*REQUIRES PLANT VALIDATION)\s*:?\s*/i.exec(s);
  if (!m) return { pending: false, kind: null, rest: s };
  return { pending: true, kind: /^SME/i.test(m[1]) ? 'SME_REQUIRED' : 'PLACEHOLDER', rest: s.slice(m[0].length) };
}

const MARK = /(SME_REQUIRED|PLACEHOLDER\s*[—-]\s*REQUIRES PLANT VALIDATION)\s*:?\s*/i;
/** Divide un texto en parte educativa + parte pendiente (todo lo que sigue a la marca es dato de planta pendiente). */
export function splitPending(s: string): { before: string; pending: null | { kind: 'SME_REQUIRED' | 'PLACEHOLDER'; text: string } } {
  const m = MARK.exec(s);
  if (!m) return { before: s, pending: null };
  return { before: s.slice(0, m.index).trim(), pending: { kind: /^SME/i.test(m[1]) ? 'SME_REQUIRED' : 'PLACEHOLDER', text: s.slice(m.index + m[0].length).trim() } };
}
