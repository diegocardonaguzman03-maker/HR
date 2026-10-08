import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { Mission, SceneDef, checkMission } from '../../src/missions/schema';
import { rawMissionContent, missions, sceneFor, procedures, docsForMission } from '../../src/missions/content';
import { useMission } from '../../src/missions/store';
import { MissionApp } from '../../src/missions/ui/MissionApp';

// jsdom no tiene WebGL: el escenario se sustituye por un marcador listo de inmediato.
vi.mock('../../src/missions/scene/MissionScene', () => ({ default: ({ onReady }: { onReady?: () => void }) => { setTimeout(() => onReady?.(), 0); return <div data-testid="scene-mock" />; } }));

const m = missions['heights-prep'];
const initial = useMission.getState();
beforeEach(() => { localStorage.clear(); localStorage.setItem('adx.recording-notice-seen', '1'); act(() => useMission.setState({ ...initial, view: 'path', missionId: null, results: {}, stepIdx: 0, listMode: false }, true)); });

describe('motor de misiones — contenido', () => {
  it('la misión y el escenario cumplen el esquema y las referencias cruzadas', () => {
    const scene = SceneDef.parse(rawMissionContent.scenes[0]);
    const mission = Mission.parse(rawMissionContent.missions[0]);
    expect(checkMission(mission, scene)).toEqual([]);
  });
  it('tiene 8 pasos y usa al menos 7 tipos de interacción distintos', () => {
    expect(m.steps).toHaveLength(8);
    expect(new Set(m.steps.map((s) => s.type)).size).toBeGreaterThanOrEqual(7);
  });
  it('es DEMO (nunca PLANT_APPROVED) y el procedimiento marca lo específico de planta como SME_REQUIRED', () => {
    expect(m.status).toBe('DEMO');
    expect(m.procedure.status).not.toBe('PLANT_APPROVED');
    expect(JSON.stringify(m.procedure)).toMatch(/SME_REQUIRED/);
    expect(m.procedure.note).toMatch(/no es el procedimiento de la planta/i);
  });
  it('cada pregunta de selección o decisión tiene exactamente una opción correcta', () => {
    for (const s of m.steps) {
      const opts = s.type === 'inspect' ? s.decision.options : s.type === 'select' || s.type === 'decide' ? s.options : null;
      if (opts) expect(opts.filter((o) => o.correct), s.id).toHaveLength(1);
    }
  });
  it('el validador rechaza objetos de escenario inexistentes', () => {
    const bad = Mission.parse({ ...rawMissionContent.missions[0], steps: [{ ...rawMissionContent.missions[0].steps[1], targets: [{ objectId: 'no-existe', label: 'x', why: 'x', control: 'x' }], required: 1 }] });
    expect(checkMission(bad, sceneFor(m)).join()).toMatch(/objeto inexistente no-existe/);
  });
});

const startStep = async () => { fireEvent.click(await screen.findByTestId('step-start')); const sk = screen.queryByTestId('skip-demo'); if (sk) fireEvent.click(sk); };
const cont = () => fireEvent.click(screen.getByTestId('continue'));

describe('motor de misiones — experiencia', () => {
  it('pantalla inicial: solo misión, objetivo, progreso y un botón', () => {
    render(<MissionApp />);
    const intro = screen.getByTestId('mission-intro');
    expect(intro).toHaveTextContent('MISIÓN 01');
    expect(intro).toHaveTextContent(m.objective);
    expect(screen.getByTestId('intro-progress')).toHaveTextContent('0 / 8 pasos completados');
    expect(screen.getByTestId('start-mission')).toHaveTextContent('COMENZAR MISIÓN');
  });

  it('completa la misión paso a paso con retroalimentación inmediata, continuar bloqueado hasta terminar y resultados de dominio', async () => {
    render(<MissionApp />);
    fireEvent.click(screen.getByTestId('start-mission'));
    // 1 observar
    await startStep();
    expect(screen.getByTestId('continue')).toBeDisabled();
    fireEvent.click(screen.getByTestId('observe-next')); fireEvent.click(screen.getByTestId('observe-next'));
    fireEvent.click(screen.getByTestId('observe-confirm'));
    expect(screen.getByTestId('continue')).toBeEnabled(); cont();
    // 2 identificar (alternativa de lista; un distractor primero)
    await startStep();
    fireEvent.click(screen.getByTestId('help-list'));
    fireEvent.click(screen.getByRole('button', { name: /Señal de uso obligatorio de EPP/ }));
    expect(screen.getByTestId('feedback')).toHaveAttribute('data-kind', 'bad');
    for (const n of ['Borde derecho de la plataforma', 'Centro del piso de la plataforma', 'Cables aéreos', 'Caja de herramientas', 'Persona caminando abajo', 'Mancha en el piso de la plataforma', 'Luminaria a cambiar']) fireEvent.click(screen.getByRole('button', { name: new RegExp('^' + n) }));
    expect(screen.getByTestId('identify-count')).toHaveTextContent('7 de 7');
    cont();
    // 3 confirmar: marcar una trampa da error explicado
    await startStep();
    const box = screen.getByTestId('confirm');
    fireEvent.click(within(box).getByText('«Es rápido, no hace falta permiso»'));
    fireEvent.click(screen.getByTestId('confirm-verify'));
    expect(screen.getByTestId('feedback')).toHaveTextContent('La duración no cambia el riesgo');
    fireEvent.click(within(box).getByText('«Es rápido, no hace falta permiso»'));
    for (const t of ['Permiso de trabajo en alturas autorizado', 'Capacitación vigente para trabajo en altura', 'Aptitud médica vigente', 'Plan de rescate definido antes de empezar', 'Energía de la luminaria aislada y bloqueada']) fireEvent.click(within(box).getByText(t));
    fireEvent.click(screen.getByTestId('confirm-verify'));
    cont();
    // 4 inspeccionar
    await startStep();
    for (const z of ['correas-hombro', 'costuras', 'hebillas', 'argolla-dorsal', 'etiqueta', 'correa-pierna']) { fireEvent.click(screen.getByTestId(`zone-${z}`)); fireEvent.click(screen.getByTestId(z === 'correa-pierna' ? 'judge-defect' : 'judge-ok')); }
    expect(screen.getByTestId('feedback')).toHaveAttribute('data-kind', 'warn');
    fireEvent.click(screen.getByRole('button', { name: /retiro de servicio/ }));
    cont();
    // 5 acceso
    await startStep();
    for (const n of ['Escalera fija', 'Barandal frontal', 'Borde derecho de la plataforma']) fireEvent.click(screen.getByRole('button', { name: new RegExp('^' + n) }));
    cont();
    // 6 anclaje
    await startStep();
    fireEvent.click(screen.getByRole('button', { name: /designado/ }));
    cont();
    // 7 ordenar
    await startStep();
    const want = m.steps[6].type === 'sequence' ? m.steps[6].items.map((i) => i.label) : [];
    for (let pos = 0; pos < want.length; pos++) for (let g = 0; g < 10; g++) {
      const cur = within(screen.getByTestId('sequence')).getAllByRole('listitem').map((li) => li.textContent ?? '');
      if (cur[pos].includes(want[pos])) break;
      fireEvent.click(screen.getByLabelText(`Subir «${want[pos]}»`));
    }
    fireEvent.click(screen.getByTestId('sequence-verify'));
    cont();
    // 8 decidir
    await startStep();
    fireEvent.click(screen.getByRole('button', { name: /No inicio/ }));
    fireEvent.click(screen.getByTestId('continue'));
    const done = await screen.findByTestId('mission-complete');
    expect(screen.getByTestId('result-correct')).toHaveTextContent('6 / 8');
    expect(within(screen.getByTestId('mastery')).getAllByRole('progressbar')).toHaveLength(m.masteryAreas.length);
    expect(done).toHaveTextContent('no te habilita para trabajar en altura');
    expect(screen.getByTestId('complete-title')).toHaveTextContent('PRÁCTICA TERMINADA');
    expect(screen.queryByTestId('critical-alert')).toBeNull();
    fireEvent.click(screen.getByTestId('continue-path'));
    expect(screen.getByTestId('learning-path')).toHaveTextContent('COMPLETADA');
  });

  it('la ayuda contextual se abre sobre el escenario y al cerrar regresa al mismo paso', async () => {
    render(<MissionApp />);
    fireEvent.click(screen.getByTestId('start-mission'));
    await startStep();
    fireEvent.click(screen.getByTestId('help-procedure'));
    expect(screen.getByTestId('context-drawer')).toHaveTextContent(/no es el procedimiento de la planta/i);
    fireEvent.click(screen.getByTestId('drawer-close'));
    expect(screen.queryByTestId('context-drawer')).toBeNull();
    expect(screen.getByTestId('step-counter')).toHaveTextContent('01 / 08');
  });

  it('guarda el avance y permite continuar donde se quedó', async () => {
    const { unmount } = render(<MissionApp />);
    fireEvent.click(screen.getByTestId('start-mission'));
    await startStep();
    fireEvent.click(screen.getByTestId('observe-next')); fireEvent.click(screen.getByTestId('observe-next')); fireEvent.click(screen.getByTestId('observe-confirm'));
    cont();
    unmount();
    act(() => useMission.setState({ view: 'intro', missionId: 'heights-prep' }));
    render(<MissionApp />);
    expect(screen.getByTestId('start-mission')).toHaveTextContent('CONTINUAR MISIÓN (paso 2)');
  });
});

describe('motor de misiones — errores críticos', () => {
  it('elegir una acción insegura en un paso crítico marca «con errores críticos» y no completa la misión', async () => {
    const steps = m.steps;
    act(() => useMission.setState({ view: 'complete', missionId: m.id, startedAt: Date.now() - 60000, endedAt: Date.now(),
      results: Object.fromEntries(steps.map((s) => [s.id, { done: true, mistakes: s.id === 'confirmar-inicio' ? 1 : 0, wrong: s.id === 'confirmar-inicio' ? ['iniciar'] : [] }])) }));
    render(<MissionApp />);
    expect(screen.getByTestId('complete-title')).toHaveTextContent('CON ERRORES CRÍTICOS');
    expect(screen.getByTestId('critical-alert')).toHaveTextContent('puede causar una lesión grave o la muerte');
    expect(screen.getByTestId('missed')).toHaveTextContent('Elegiste «Inicio la tarea; es rápida»');
    expect(JSON.parse(localStorage.getItem('adx.missions.done') ?? '[]')).not.toContain(m.id);
  });
  it('SAF-R-02 · LOTO: marcar «candado prestado» en validar-requisitos es error crítico', () => {
    const lm = missions['loto-01'];
    act(() => useMission.setState({ view: 'complete', missionId: lm.id, startedAt: Date.now() - 60000, endedAt: Date.now(),
      results: Object.fromEntries(lm.steps.map((s) => [s.id, { done: true, mistakes: s.id === 'validar-requisitos' ? 1 : 0, wrong: s.id === 'validar-requisitos' ? ['prestado'] : [] }])) }));
    render(<MissionApp />);
    expect(screen.getByTestId('complete-title')).toHaveTextContent('CON ERRORES CRÍTICOS');
    expect(screen.getByTestId('critical-alert')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('adx.missions.done') ?? '[]')).not.toContain(lm.id);
  });
  it('en un paso de identificar se deben encontrar todos los peligros', () => {
    for (const s of m.steps) if (s.type === 'identify') expect(s.required).toBe(s.targets.length);
  });
});

describe('SAF-H-R1 — la precaución no se castiga', () => {
  it('marcar como dañada una zona que está bien no cuenta como error crítico', () => {
    act(() => useMission.setState({ view: 'complete', missionId: m.id, startedAt: Date.now() - 60000, endedAt: Date.now(),
      results: Object.fromEntries(m.steps.map((s) => [s.id, { done: true, mistakes: s.id === 'inspeccionar-arnes' ? 1 : 0, wrong: s.id === 'inspeccionar-arnes' ? ['zona:costuras'] : [] }])) }));
    render(<MissionApp />);
    expect(screen.queryByTestId('critical-alert')).toBeNull();
  });
  it('no detectar el daño sí es crítico', () => {
    act(() => useMission.setState({ view: 'complete', missionId: m.id, startedAt: Date.now() - 60000, endedAt: Date.now(),
      results: Object.fromEntries(m.steps.map((s) => [s.id, { done: true, mistakes: s.id === 'inspeccionar-arnes' ? 1 : 0, wrong: s.id === 'inspeccionar-arnes' ? ['zona:correa-pierna'] : [] }])) }));
    render(<MissionApp />);
    expect(screen.getByTestId('critical-alert')).toBeInTheDocument();
  });
});


import { ProcedureDocs } from '../../src/missions/schema';

describe('todas las misiones del motor', () => {
  for (const mm of Object.values(missions)) {
    it(`${mm.id}: esquema, referencias, DEMO y una sola opción correcta`, () => {
      expect(checkMission(mm, sceneFor(mm))).toEqual([]);
      expect(mm.status).toBe('DEMO');
      for (const s of mm.steps) {
        const opts = s.type === 'inspect' ? s.decision.options : s.type === 'select' || s.type === 'decide' ? s.options : null;
        if (opts) expect(opts.filter((o) => o.correct), s.id).toHaveLength(1);
      }
    });
  }
  it('LOTO usa los 8 tipos de interacción', () => {
    expect(new Set(missions['loto-01'].steps.map((s) => s.type)).size).toBe(8);
  });
  it('SAF-D-07: todo marcador SME_REQUIRED dice qué dato falta («SME_REQUIRED: …»)', () => {
    const all = JSON.stringify([missions, procedures]);
    expect(all.match(/SME_REQUIRED(?!:)/g) ?? []).toEqual([]);
  });
  it('SAF-L-03: cada misión declara qué autorización NO otorga', () => {
    for (const mm of Object.values(missions)) expect(mm.authorization.length, mm.id).toBeGreaterThan(5);
  });
});

describe('procedimientos y documentos', () => {
  it('cada misión tiene sus 3 documentos (instrucción, manual, checklist) en DEMO y con SME_REQUIRED', () => {
    for (const id of Object.keys(missions)) {
      const d = docsForMission(id);
      expect(d, id).toBeTruthy();
      ProcedureDocs.parse(d);
      for (const k of ['wi', 'manual', 'checklist'] as const) {
        expect(d![k].status).toBe('DEMO');
        expect(d![k].file).toMatch(/^documents\/procedimientos\/.+\.pdf$/);
      }
      expect(JSON.stringify(d)).toMatch(/SME_REQUIRED/);
    }
    expect(procedures.length).toBeGreaterThanOrEqual(2);
  });
  it('el menú de procedimientos lista, abre el lector y ofrece las 3 descargas', () => {
    act(() => useMission.setState({ view: 'procedures', missionId: 'heights-prep' }));
    render(<MissionApp />);
    const card = screen.getByTestId('proc-loto-banda');
    for (const code of ['WI-LOTO-001-DEMO', 'MO-LOTO-001-DEMO', 'CL-LOTO-001-DEMO']) {
      const a = within(card).getByTestId(`dl-${code}`);
      expect(a).toHaveAttribute('download');
      expect(a).toHaveAttribute('target', '_blank'); // abierta desde el disco, el PDF no saca de la app
      expect(a.getAttribute('href')).toBe(`./documents/procedimientos/${code}.pdf`);
    }
    fireEvent.click(within(card).getByTestId('read-loto-banda'));
    expect(screen.getByTestId('proc-reader')).toHaveTextContent(/DEMO/);
    fireEvent.click(screen.getByTestId('reader-tab-checklist'));
    expect(screen.getByTestId('proc-reader')).toHaveTextContent(/Crítico/);
    fireEvent.click(screen.getByTestId('reader-close'));
    fireEvent.click(within(card).getByTestId('play-loto-01'));
    expect(screen.getByTestId('mission-intro')).toHaveTextContent('BLOQUEO Y ETIQUETADO');
  });
});
