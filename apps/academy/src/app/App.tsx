import { lazy, Suspense, useEffect, useState } from 'react';
import { idx } from '../lib/content';
import { useApp, type Mode } from '../stores/useApp';
import { TopBar } from '../components/shell/TopBar';
import { Sidebar } from '../components/shell/Sidebar';
import { ViewToolbar } from '../components/shell/ViewToolbar';
import { LoadingScreen } from '../components/shell/LoadingScreen';
import { Welcome } from '../components/shell/Welcome';
import { Disclaimer, DISCLAIMER } from '../components/ui/Disclaimer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useLoad } from '../stores/useLoad';
import { EquipmentPanel } from '../components/panel/EquipmentPanel';
import { StagePanel } from '../components/panel/StagePanel';
import { LearnPlayer } from '../components/training/LearnPlayer';
import { PerformJobAid } from '../components/training/PerformJobAid';
import { AssessmentView } from '../components/training/AssessmentView';
import { Library } from '../components/library/Library';
import { DocumentViewer } from '../components/library/DocumentViewer';
import { VideoPlayer } from '../components/library/VideoPlayer';
import { AskAceria } from '../components/assistant/AskAceria';
import { ASSISTANT_ENABLED } from '../lib/features';

const Scene = lazy(() => import('../components/3d/Scene').then((m) => ({ default: m.Scene })));
const MODES: Mode[] = ['explore', 'learn', 'perform', 'assess', 'library'];

const routeId = (s: ReturnType<typeof useApp.getState>) =>
  s.mode === 'explore' ? s.selectedEq ?? s.selectedStage : s.mode === 'learn' ? s.moduleId : s.mode === 'perform' ? s.wiId : s.mode === 'assess' ? s.assessmentId : null;

/** #/modo[/id] ↔ estado (deep links compartibles, sin servidor). Se sincroniza sin volver a renderizar la app (RT-PERF-02). */
function useHashRoute() {
  useEffect(() => {
    const apply = () => {
      const [, m, id] = location.hash.split('/');
      if (!m || !MODES.includes(m as Mode)) return;
      const st = useApp.getState();
      if (st.mode !== m) st.setMode(m as Mode);
      if (id) {
        if (m === 'explore' && idx.equipment.has(id)) st.selectEquipment(id);
        if (m === 'explore' && idx.stage.has(id)) st.selectStage(id);
        // RT-SW-08: un enlace a otro módulo empieza en su lección 1
        if (m === 'learn' && idx.module.has(id) && st.moduleId !== id) st.set({ moduleId: id, lessonIdx: 0 });
        if (m === 'perform' && idx.wi.has(id)) st.set({ wiId: id });
        if (m === 'assess' && idx.assessment.has(id)) st.set({ assessmentId: id });
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  useEffect(() => {
    const write = (s: ReturnType<typeof useApp.getState>, modeChanged: boolean) => {
      const id = routeId(s);
      const h = `#/${s.mode}${id ? `/${id}` : ''}`;
      if (location.hash === h) return;
      // RT-SW-08: cambiar de modo crea una entrada de historial (Atrás no sale de la app)
      if (modeChanged) history.pushState(null, '', h); else history.replaceState(null, '', h);
    };
    write(useApp.getState(), false);
    return useApp.subscribe((s, p) => {
      // UX-02: al cambiar de modo, el panel no se queda fijo en el equipo que estaba abierto
      if (s.mode === p.mode && routeId(s) === routeId(p)) return;
      write(s, s.mode !== p.mode);
      if (s.mode !== p.mode && s.selectedEq && s.selectedEq === p.selectedEq) s.set({ selectedEq: null, selectedComponentNode: null });
    });
  }, []);
}

function ArcNote() {
  const on = useApp((s) => s.arcDemo);
  return on ? <p role="note" className="pointer-events-none absolute right-3 top-3 rounded bg-black/70 px-2 py-1 font-mono text-[11px] text-[var(--color-st-demo)]">◇ ARCO DEMOSTRATIVO — animación ilustrativa, no representa parámetros reales</p> : null;
}

/** Una sola barra lateral: columna fija en escritorio, plegable en pantallas angostas. */
function SidebarShell() {
  const [open, setOpen] = useState(false);
  return (
    <aside className="order-last border-t border-[var(--color-line)] bg-[var(--color-surface)] lg:order-none lg:border-r lg:border-t-0">
      <button className="label w-full px-4 py-2 text-left lg:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '▾' : '▸'} Mapa del proceso y lista de equipos</button>
      <div className={`${open ? 'block' : 'hidden'} lg:block lg:h-full`}><Sidebar /></div>
    </aside>
  );
}

const BACK = { learn: 'la lección', perform: 'la instrucción', assess: 'la evaluación', library: 'la biblioteca', explore: '' } as const;

/**
 * RT-SW-04: en Aprender, Ejecutar, Evaluar y Biblioteca el árbol de entrenamiento queda montado (oculto)
 * mientras se consulta la ficha de un equipo; así no se pierde el avance de la evaluación ni de la WI.
 */
function RightPanel() {
  const mode = useApp((s) => s.mode), selectedEq = useApp((s) => s.selectedEq), selectedStage = useApp((s) => s.selectedStage);
  const picking = useApp((s) => s.picking), set = useApp((s) => s.set);
  const eq = selectedEq ? idx.equipment.get(selectedEq) : null;
  if (mode === 'explore') {
    if (eq) return <EquipmentPanel eq={eq} />;
    const st = selectedStage ? idx.stage.get(selectedStage) : null;
    return st ? <StagePanel st={st} /> : <Welcome />;
  }
  const peek = !!eq && !picking;
  return (
    <div className="relative h-full">
      <div className="h-full" hidden={peek} data-testid="training-host">
        {mode === 'learn' ? <LearnPlayer /> : mode === 'perform' ? <PerformJobAid /> : mode === 'assess' ? <AssessmentView /> : <Library />}
      </div>
      {peek && eq && (
        <div className="absolute inset-0 flex flex-col bg-[var(--color-surface)]" data-testid="equipment-peek">
          <button className="label border-b border-[var(--color-line)] px-4 py-2 text-left hover:text-[var(--color-text)]" onClick={() => set({ selectedEq: null, selectedComponentNode: null })} data-testid="peek-back">← Volver a {BACK[mode]}</button>
          <div className="min-h-0 flex-1"><EquipmentPanel eq={eq} /></div>
        </div>
      )}
    </div>
  );
}

/** Si la escena 3D falla (sin WebGL, chunk no disponible), se avisa y la app sigue en modo lista (RT-SW-02). */
function SafeScene() {
  return (
    <ErrorBoundary fallback={null} onError={(e) => useLoad.getState().set({ phase: 'error', loaded: 0, total: 0, message: `el 3D no está disponible en este equipo (${e.message})` })}>
      <Suspense fallback={null}><Scene /></Suspense>
    </ErrorBoundary>
  );
}

/** Pantalla mínima si la app entera no puede iniciar: el aviso de seguridad sigue visible. */
export function AppCrashed() {
  return (
    <div className="flex h-full flex-col">
      <main className="grid flex-1 place-items-center p-4">
        <p role="alert" className="max-w-md text-center text-[14px]">La academia no pudo iniciar en este equipo. Recarga la página; si sigue igual, avisa a Capacitación.</p>
      </main>
      <Disclaimer />
    </div>
  );
}

/** ?capture=1: solo la escena (lo usa scripts/capture-media.mjs para imágenes y el video placeholder). */
const CAPTURE = typeof location !== 'undefined' && new URLSearchParams(location.search).has('capture');
/** RT-SW-14: el store solo se expone en desarrollo, en capturas (?capture) y en pruebas (?e2e). */
if (typeof window !== 'undefined' && (import.meta.env.DEV || CAPTURE || new URLSearchParams(location.search).has('e2e'))) (window as unknown as { __adxStore: typeof useApp }).__adxStore = useApp;

export function App() {
  if (CAPTURE) {
    return (
      <div className="relative h-full">
        <SafeScene />
        <LoadingScreen />
        <div data-capture-badge className="absolute inset-x-4 top-4 font-mono">
          <p className="inline-block rounded bg-black/70 px-2 py-1 text-[13px] text-[var(--color-st-demo)]">◇ DEMO · VIDEO PLACEHOLDER · MODELO ESQUEMÁTICO, NO OPERACIÓN REAL</p>
          <p className="mt-1 max-w-[70%] rounded bg-black/60 px-2 py-0.5 text-[10.5px] text-[var(--color-text-2)]">{DISCLAIMER}</p>
        </div>
      </div>
    );
  }
  return <Main />;
}

function Main() {
  useHashRoute();
  const mode = useApp((s) => s.mode);
  return (
    <div className="flex h-full flex-col">
      <a href="#panel" className="skip-link">Saltar al panel de información</a>
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)_minmax(360px,420px)]">
        <SidebarShell />
        <main className="relative h-[46vh] min-h-[280px] lg:h-auto" aria-label="Vista 3D del horno">
          <SafeScene />
          <LoadingScreen />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center"><ViewToolbar /></div>
          <p className="pointer-events-none absolute left-3 top-3 rounded bg-black/50 px-2 py-1 font-mono text-[10.5px] text-[var(--color-text-3)]">Modelo esquemático · disposición ilustrativa, no a escala de planta</p>
          <ArcNote />
        </main>
        <section id="panel" tabIndex={-1} aria-label="Panel de información" className="min-h-0 flex-1 border-l border-[var(--color-line)] bg-[var(--color-surface)] lg:flex-none">
          <ErrorBoundary key={mode} fallback={<p role="alert" className="p-4 text-[13.5px]">Esta sección no se pudo mostrar. Cambia de modo o recarga la página; el resto de la academia sigue disponible.</p>}>
            <RightPanel />
          </ErrorBoundary>
        </section>
      </div>
      <Disclaimer />
      <DocumentViewer />
      <VideoPlayer />
      {ASSISTANT_ENABLED && <AskAceria />}
    </div>
  );
}
