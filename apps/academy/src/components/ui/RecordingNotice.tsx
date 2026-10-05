import { useId, useState, useSyncExternalStore } from 'react';
import { clearEvents, enabled, forgetNoticeSeen, markNoticeSeen, noticeSeen, resetActor, setEnabled, subscribeEnabled } from '../../lib/analytics';
import { resetProgress } from '../../lib/progress';
import { btn, btnPrimary } from './Status';

/**
 * Textos del aviso de registro (TRN-12). Revisión de Relaciones Laborales ADX-RL-001: RL-10, RL-11 y RL-13.
 * No prometen anonimato: el identificador es un seudónimo por equipo (RL-18). Verificar con Jurídico Laboral.
 */
export const RECORDING_ON = 'Esta plataforma guarda solo en este equipo, sin tu nombre ni tu número de ficha, qué lecciones viste, tus respuestas y tu resultado. Se usa para mejorar el curso con datos de todo el grupo, no para evaluarte a ti. Puedes desactivar el registro o borrarlo al terminar.';
export const RECORDING_OFF = 'El registro está desactivado: en este equipo no se guarda qué lecciones viste, tus respuestas ni tu resultado.';
export const CLEAR_LABEL = 'Borrar mis datos de este equipo y terminar';
export const CLEARED_MSG = 'Listo: se borró de este equipo lo que viste, tus respuestas y tu avance.';

/** Borra eventos, avance e identificador; el siguiente usuario del equipo vuelve a ver el aviso al entrar. */
function clearDevice() { clearEvents(); resetProgress(); resetActor(); forgetNoticeSeen(); }

/** Texto y controles del aviso de registro. `prefix` distingue los data-testid del aviso al entrar y del de EVALUAR. */
export function RecordingControls({ prefix = '', onCleared }: { prefix?: string; onCleared?: () => void }) {
  const on = useSyncExternalStore(subscribeEnabled, enabled, enabled);
  const [cleared, setCleared] = useState(false);
  return (
    <>
      <p>{on ? RECORDING_ON : RECORDING_OFF}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className={btn} aria-pressed={!on} onClick={() => setEnabled(!on)} data-testid={`${prefix}toggle-recording`}>{on ? 'Desactivar registro' : 'Activar registro'}</button>
        <button className={btn} onClick={() => { clearDevice(); setCleared(true); onCleared?.(); }} data-testid={`${prefix}clear-shared`}>{CLEAR_LABEL}</button>
      </div>
      {cleared && <p role="status" className="mt-1">{CLEARED_MSG}</p>}
    </>
  );
}

/** Aviso de registro en EVALUAR (siempre visible ahí). */
export function RecordingNotice() {
  return (
    <div className="mb-4 rounded border border-[var(--color-line)] p-2 text-[12.5px] text-[var(--color-text-2)]" data-testid="recording-notice">
      <RecordingControls />
    </div>
  );
}

/**
 * RL-10 (condición de ubicación): el aviso aparece al entrar a la app por primera vez en el equipo, en el primer
 * render, antes de que la escena 3D cargue y registre `initialized`. No bloquea: es una franja en el flujo de la
 * página, sin atrapar el foco. Se recuerda por equipo al pulsar «Entendido»; borrar los datos lo vuelve a activar
 * para la siguiente persona.
 */
export function FirstRunNotice({ where = 'También lo encuentras en EVALUAR.' }: { where?: string }) {
  const [open, setOpen] = useState(() => !noticeSeen());
  const [cleared, setCleared] = useState(false);
  const titleId = useId();
  if (!open) return null;
  return (
    <section role="region" aria-labelledby={titleId} data-testid="first-run-notice"
      className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-2 text-[12.5px] text-[var(--color-text-2)]">
      <h2 id={titleId} className="text-[13px] font-semibold text-[var(--color-text)]"><span aria-hidden>ⓘ </span>Aviso de registro en este equipo</h2>
      <RecordingControls prefix="first-run-" onCleared={() => setCleared(true)} />
      <div className="mt-2">
        <button className={btnPrimary} onClick={() => { if (!cleared) markNoticeSeen(); setOpen(false); }} data-testid="first-run-dismiss">Entendido</button>
        <span className="ml-2 text-[11.5px]">{where}</span>
      </div>
    </section>
  );
}
