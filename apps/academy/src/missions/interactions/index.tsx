/**
 * Tipos de interacción reutilizables del motor de misiones.
 * Cada uno: (1) prepara el escenario (qué es clicable), (2) reacciona a los clics,
 * (3) da retroalimentación inmediata y (4) avisa al terminar con el número de errores.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SceneDefT, StepT } from '../schema';
import { useMission } from '../store';

type P<T extends StepT['type']> = { step: Extract<StepT, { type: T }>; scene: SceneDefT; onDone: (mistakes: number) => void; done: boolean };

const chip = (state: 'idle' | 'ok' | 'bad' | 'on' = 'idle') =>
  `inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-left text-[14px] font-medium transition focus-visible:outline-2 ${
    state === 'ok' ? 'border-[#30a46c] bg-[#30a46c]/15 text-white' : state === 'bad' ? 'border-[#e5484d] bg-[#e5484d]/12 text-white' : state === 'on' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white' : 'border-white/15 bg-white/[0.04] text-[var(--color-text)] hover:border-white/40'
  }`;

/** Escucha los clics en el escenario mientras el componente está montado. */
function useSceneClick(fn: (id: string) => void) {
  const click = useMission((s) => s.click);
  const ref = useRef(fn);
  ref.current = fn;
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (click) ref.current(click.id); }, [click]);
}
const labelOf = (scene: SceneDefT, id: string) => scene.objects.find((o) => o.id === id)?.label ?? id;
const shuffle = <T,>(a: T[], seed: string) => {
  const r = [...a]; let h = [...seed].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 7);
  for (let i = r.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

/* ---------- 01 OBSERVAR ---------- */
export function Observe({ step, onDone, done }: P<'observe'>) {
  const { set, flyTo } = useMission.getState();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = step.tour[i];
    flyTo(t.camera); set({ focus: t.focus, caption: t.caption, interactive: [] });
  }, [i, step, flyTo, set]);
  useEffect(() => () => set({ caption: null, focus: [] }), [set]);
  const last = i === step.tour.length - 1;
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="observe">
      <span className="font-mono text-[12px] text-white/60">Vista {i + 1} de {step.tour.length}</span>
      {!last && <button className={chip('on')} onClick={() => setI(i + 1)} data-testid="observe-next">Siguiente vista →</button>}
      {last && !done && <button className={chip('on')} onClick={() => { set({ caption: null, focus: [] }); onDone(0); }} data-testid="observe-confirm">✓ {step.confirm}</button>}
    </div>
  );
}

/* ---------- 02 IDENTIFICAR ---------- */
export function Identify({ step, scene, onDone, done }: P<'identify'>) {
  const { set, toast } = useMission.getState();
  const listMode = useMission((s) => s.listMode);
  const [found, setFound] = useState<string[]>([]);
  const mistakes = useRef(0);
  const targets = step.targets.map((t) => t.objectId), distractors = step.distractors.map((d) => d.objectId);
  const candidates = useMemo(() => shuffle([...targets, ...distractors], step.id), [step.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { set({ interactive: done ? [] : candidates, markers: [] }); }, [candidates, done, set]);
  useEffect(() => {
    set({ markers: found.map((id) => ({ objectId: id, kind: 'found' as const, label: step.targets.find((t) => t.objectId === id)!.label })) });
  }, [found, step, set]);
  const choose = (id: string) => {
    if (done) return;
    const t = step.targets.find((x) => x.objectId === id);
    if (t) {
      if (found.includes(id)) return;
      const nf = [...found, id];
      setFound(nf);
      toast('ok', t.label, `${t.why} Control: ${t.control}`);
      if (nf.length >= step.required) { set({ interactive: [] }); onDone(mistakes.current); }
      return;
    }
    const d = step.distractors.find((x) => x.objectId === id);
    if (d) { mistakes.current++; toast('bad', 'Revisa de nuevo', d.feedback); }
  };
  useSceneClick(choose);
  const hint = () => {
    const next = targets.find((id) => !found.includes(id));
    if (!next) return;
    set({ markers: [...found.map((id) => ({ objectId: id, kind: 'found' as const, label: step.targets.find((t) => t.objectId === id)!.label })), { objectId: next, kind: 'hint' }] });
    toast('info', 'Pista', step.hint);
  };
  return (
    <div className="flex flex-col gap-2" data-testid="identify">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[15px] font-semibold text-white" aria-live="polite" data-testid="identify-count">{found.length} de {step.required} identificados</span>
        <span className="flex gap-1" aria-hidden>{Array.from({ length: step.required }, (_, i) => <span key={i} className={`h-2 w-6 rounded-full ${i < found.length ? 'bg-[#30a46c]' : 'bg-white/15'}`} />)}</span>
        {!done && <button className="text-[13px] font-medium text-[var(--color-accent)] underline-offset-2 hover:underline" onClick={hint} data-testid="hint">Necesito una pista</button>}
      </div>
      {(listMode || done) && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Elementos del escenario">
          {candidates.map((id) => {
            const isFound = found.includes(id);
            return <button key={id} className={chip(isFound ? 'ok' : 'idle')} disabled={done} onClick={() => choose(id)}>{isFound ? '✓ ' : ''}{labelOf(scene, id)}</button>;
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- 03 CONFIRMAR (lista de verificación) ---------- */
export function Confirm({ step, onDone, done }: P<'confirm'>) {
  const { set, toast } = useMission.getState();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [checkedOnce, setCheckedOnce] = useState(false);
  const mistakes = useRef(0);
  useEffect(() => { set({ interactive: [], focus: ['tablero-permiso'] }); return () => set({ focus: [] }); }, [set]);
  const items = useMemo(() => shuffle(step.items, step.id), [step]);
  const verify = () => {
    setCheckedOnce(true);
    const missing = step.items.filter((i) => i.required && !checked.has(i.id));
    const wrong = step.items.filter((i) => !i.required && checked.has(i.id));
    if (!missing.length && !wrong.length) { onDone(mistakes.current); return; }
    mistakes.current++;
    if (wrong.length) toast('bad', 'Hay algo que no es válido', wrong[0].feedback);
    else toast('bad', 'Falta algo', `${missing.length === 1 ? 'Falta 1 requisito' : `Faltan ${missing.length} requisitos`}. Piensa qué te protege si algo sale mal.`);
  };
  return (
    <div className="flex flex-col gap-2" data-testid="confirm">
      <p className="text-[13px] text-white/70">{step.prompt}</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {items.map((it) => {
          const on = checked.has(it.id);
          const state = done ? (it.required ? 'ok' : 'idle') : checkedOnce && on && !it.required ? 'bad' : on ? 'on' : 'idle';
          return (
            <label key={it.id} className={chip(state) + ' cursor-pointer'}>
              <input type="checkbox" className="h-4 w-4 accent-[var(--color-accent)]" checked={on} disabled={done}
                onChange={() => { const n = new Set(checked); if (on) n.delete(it.id); else n.add(it.id); setChecked(n); }} />
              <span><span className="block">{it.label}</span><span className="block text-[11.5px] font-normal text-white/55">{it.detail}</span></span>
            </label>
          );
        })}
      </div>
      {!done && <button className={chip('on') + ' self-start'} onClick={verify} data-testid="confirm-verify">Verificar</button>}
    </div>
  );
}

/* ---------- 04 INSPECCIONAR ---------- */
export function Inspect({ step, onDone, done }: P<'inspect'>) {
  const { set, toast } = useMission.getState();
  const [states, setStates] = useState<Record<string, 'pending' | 'ok' | 'defect'>>(() => Object.fromEntries(step.zones.map((z) => [z.id, 'pending'])));
  const [choice, setChoice] = useState<string | null>(null);
  const mistakes = useRef(0);
  useEffect(() => { set({ interactive: [], zones: { objectId: step.objectId, states } }); }, [states, step.objectId, set]);
  useEffect(() => () => set({ zones: null }), [set]);
  const check = (zoneId: string) => {
    const z = step.zones.find((x) => x.id === zoneId);
    if (!z || done) return;
    setStates((s) => ({ ...s, [zoneId]: z.defect ? 'defect' : 'ok' }));
    toast(z.defect ? 'bad' : 'ok', z.defect ? `${z.label}: DAÑO` : `${z.label}: en buen estado`, z.finding);
  };
  useSceneClick((id) => { const [obj, zone] = id.split('#'); if (obj === step.objectId && zone) check(zone); });
  const allChecked = Object.values(states).every((s) => s !== 'pending');
  const pending = step.zones.filter((z) => states[z.id] === 'pending').length;
  return (
    <div className="flex flex-col gap-2" data-testid="inspect">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[14px] font-semibold text-white" aria-live="polite">{step.zones.length - pending} de {step.zones.length} zonas revisadas</span>
        {step.zones.map((z) => (
          <button key={z.id} className={chip(states[z.id] === 'ok' ? 'ok' : states[z.id] === 'defect' ? 'bad' : 'idle')} onClick={() => check(z.id)} data-testid={`zone-${z.id}`}>
            {states[z.id] === 'ok' ? '✓ ' : states[z.id] === 'defect' ? '⚠ ' : ''}{z.label}
          </button>
        ))}
      </div>
      {allChecked && (
        <div className="flex flex-col gap-1.5" role="group" aria-label={step.decision.prompt} data-testid="inspect-decision">
          <p className="text-[14px] font-semibold text-white">{step.decision.prompt}</p>
          <div className="flex flex-wrap gap-1.5">
            {step.decision.options.map((o) => (
              <button key={o.id} disabled={done} className={chip(choice === o.id ? (o.correct ? 'ok' : 'bad') : done && o.correct ? 'ok' : 'idle')}
                onClick={() => { setChoice(o.id); if (o.correct) { toast('ok', 'Correcto', o.feedback); onDone(mistakes.current); } else { mistakes.current++; toast('bad', 'Piénsalo otra vez', o.feedback); } }}>{o.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 05 SELECCIONAR ---------- */
export function Select({ step, onDone, done }: P<'select'>) {
  const { set, toast } = useMission.getState();
  const listMode = useMission((s) => s.listMode);
  const [picked, setPicked] = useState<string | null>(null);
  const mistakes = useRef(0);
  const objectIds = step.options.map((o) => o.objectId).filter(Boolean) as string[];
  useEffect(() => { set({ interactive: done ? [] : objectIds, markers: [] }); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (o: (typeof step.options)[number]) => {
    if (done) return;
    setPicked(o.id);
    if (o.correct) {
      set({ interactive: [], markers: o.objectId ? [{ objectId: o.objectId, kind: 'selected', label: o.label }] : [] });
      toast('ok', 'Correcto', o.feedback); onDone(mistakes.current);
    } else {
      mistakes.current++;
      set({ markers: o.objectId ? [{ objectId: o.objectId, kind: 'wrong', label: 'No es correcto' }] : [] });
      toast('bad', 'No es el adecuado', o.feedback);
    }
  };
  useSceneClick((id) => { const o = step.options.find((x) => x.objectId === id); if (o) choose(o); });
  const showList = listMode || objectIds.length < step.options.length;
  return (
    <div className="flex flex-col gap-2" data-testid="select">
      <p className="text-[13px] text-white/70">{step.prompt}{objectIds.length ? ' — haz clic en el escenario' : ''}</p>
      {(showList || done) && (
        <div className="flex flex-wrap gap-1.5">
          {step.options.map((o) => <button key={o.id} disabled={done} className={chip(picked === o.id ? (o.correct ? 'ok' : 'bad') : 'idle')} onClick={() => choose(o)}>{o.label}</button>)}
        </div>
      )}
    </div>
  );
}

/* ---------- 06 ORDENAR ---------- */
export function Sequence({ step, onDone, done }: P<'sequence'>) {
  const { set, toast } = useMission.getState();
  const [order, setOrder] = useState(() => {
    const s = shuffle(step.items.map((i) => i.id), step.id);
    return s.every((id, i) => id === step.items[i].id) ? [...s.slice(1), s[0]] : s;
  });
  const [wrongAt, setWrongAt] = useState<number[]>([]);
  const mistakes = useRef(0);
  useEffect(() => { set({ interactive: [] }); }, [set]);
  const move = (i: number, d: -1 | 1) => { const o = [...order]; [o[i], o[i + d]] = [o[i + d], o[i]]; setOrder(o); setWrongAt([]); };
  const verify = () => {
    const bad = order.map((id, i) => (id === step.items[i].id ? -1 : i)).filter((i) => i >= 0);
    if (!bad.length) { toast('ok', 'Orden correcto', step.done); onDone(mistakes.current); return; }
    mistakes.current++; setWrongAt(bad);
    toast('bad', `${bad.length} ${bad.length === 1 ? 'acción está' : 'acciones están'} fuera de lugar`, step.hint);
  };
  const label = (id: string) => step.items.find((i) => i.id === id)!.label;
  return (
    <div className="flex flex-col gap-2" data-testid="sequence">
      <p className="text-[13px] text-white/70">{step.prompt}</p>
      <ol className="flex flex-col gap-1">
        {order.map((id, i) => (
          <li key={id} className={chip(done ? 'ok' : wrongAt.includes(i) ? 'bad' : 'idle') + ' justify-between'}>
            <span className="flex items-center gap-2"><span className="font-mono text-[var(--color-accent)]">{i + 1}</span>{label(id)}</span>
            {!done && <span className="flex gap-1">
              <button aria-label={`Subir «${label(id)}»`} disabled={i === 0} className="rounded px-2 py-0.5 hover:bg-white/10 disabled:opacity-30" onClick={() => move(i, -1)}>↑</button>
              <button aria-label={`Bajar «${label(id)}»`} disabled={i === order.length - 1} className="rounded px-2 py-0.5 hover:bg-white/10 disabled:opacity-30" onClick={() => move(i, 1)}>↓</button>
            </span>}
          </li>
        ))}
      </ol>
      {!done && <button className={chip('on') + ' self-start'} onClick={verify} data-testid="sequence-verify">Verificar orden</button>}
    </div>
  );
}

/* ---------- 07 DECIDIR ---------- */
export function Decide({ step, onDone, done }: P<'decide'>) {
  const { set, toast } = useMission.getState();
  const [picked, setPicked] = useState<string | null>(null);
  const mistakes = useRef(0);
  useEffect(() => { set({ interactive: [], sceneFlags: { ...useMission.getState().sceneFlags, ...step.sceneChange } }); }, [step, set]);
  return (
    <div className="flex flex-col gap-2" data-testid="decide">
      <p className="rounded-lg border border-white/15 bg-white/[0.04] p-3 text-[14px] text-white">{step.scenario}</p>
      <div className="flex flex-col gap-1.5">
        {step.options.map((o) => (
          <button key={o.id} disabled={done} className={chip(picked === o.id ? (o.correct ? 'ok' : 'bad') : done && o.correct ? 'ok' : 'idle')}
            onClick={() => { setPicked(o.id); if (o.correct) { toast('ok', 'Decisión segura', o.feedback); onDone(mistakes.current); } else { mistakes.current++; toast('bad', 'Esa decisión no es segura', o.feedback); } }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- 08 DEMOSTRAR (acciones en orden sobre el escenario) ---------- */
export function Demonstrate({ step, scene, onDone, done }: P<'demonstrate'>) {
  const { set, toast } = useMission.getState();
  const [n, setN] = useState(0);
  const mistakes = useRef(0);
  useEffect(() => { set({ interactive: done ? [] : step.actions.map((a) => a.objectId) }); }, [done, step, set]);
  useSceneClick((id) => {
    if (done) return;
    const a = step.actions[n];
    if (a && id === a.objectId) {
      toast('ok', a.label, a.feedback);
      if (n + 1 >= step.actions.length) onDone(mistakes.current); else setN(n + 1);
    } else { mistakes.current++; toast('bad', 'Todavía no', `Primero: ${a?.label ?? ''}`); }
  });
  return (
    <div data-testid="demonstrate" className="text-[14px] text-white">
      Acción {Math.min(n + 1, step.actions.length)} de {step.actions.length}: <strong>{step.actions[Math.min(n, step.actions.length - 1)].label}</strong>
      <span className="ml-2 text-white/50">({labelOf(scene, step.actions[Math.min(n, step.actions.length - 1)].objectId)})</span>
    </div>
  );
}

export function Interaction(props: { step: StepT; scene: SceneDefT; onDone: (m: number) => void; done: boolean }) {
  const s = props.step;
  switch (s.type) {
    case 'observe': return <Observe {...props} step={s} />;
    case 'identify': return <Identify {...props} step={s} />;
    case 'confirm': return <Confirm {...props} step={s} />;
    case 'inspect': return <Inspect {...props} step={s} />;
    case 'select': return <Select {...props} step={s} />;
    case 'sequence': return <Sequence {...props} step={s} />;
    case 'decide': return <Decide {...props} step={s} />;
    case 'demonstrate': return <Demonstrate {...props} step={s} />;
  }
}
