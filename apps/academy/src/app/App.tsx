import { lazy, Suspense, useEffect, useState } from 'react';
import { idx } from '../lib/content';
import { useApp, type Mode } from '../stores/useApp';
import { TopBar } from '../components/shell/TopBar';
import { Sidebar } from '../components/shell/Sidebar';
import { ViewToolbar } from '../components/shell/ViewToolbar';
import { LoadingScreen } from '../components/shell/LoadingScreen';
import { Welcome } from '../components/shell/Welcome';
import { Disclaimer, DISCLAIMER } from '../components/ui/Disclaimer';
import { EquipmentPanel } from '../components/panel/EquipmentPanel';
import { StagePanel } from '../components/panel/StagePanel';
import { LearnPlayer } from '../components/training/LearnPlayer';
import { PerformJobAid } from '../components/training/PerformJobAid';
import { AssessmentView } from '../components/training/AssessmentView';
import { Library } from '../components/library/Library';
import { DocumentViewer } from '../components/library/DocumentViewer';
import { VideoPlayer } from '../components/library/VideoPlayer';
import { AskAceria } from '../components/assistant/AskAceria';

const Scene = lazy(() => import('../components/3d/Scene').then((m) => ({ default: m.Scene })));
const MODES: Mode[] = ['explore', 'learn', 'perform', 'assess', 'library'];

/** #/modo[/id] ↔ estado (deep links compartibles, sin servidor). */
function useHashRoute() {
  const s = useApp();
  useEffect(() => {
    const apply = () => {
      const [, m, id] = location.hash.split('/');
      if (!m || !MODES.includes(m as Mode)) return;
      const st = useApp.getState();
      if (st.mode !== m) st.setMode(m as Mode);
      if (id) {
        if (m === 'explore' && idx.equipment.has(id)) st.selectEquipment(id);
        if (m === 'explore' && idx.stage.has(id)) st.selectStage(id);
        if (m === 'learn' && idx.module.has(id)) st.set({ moduleId: id });
        if (m === 'perform' && idx.wi.has(id)) st.set({ wiId: id });
        if (m === 'assess' && idx.assessment.has(id)) st.set({ assessmentId: id });
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  useEffect(() => {
    const id = s.mode === 'explore' ? s.selectedEq ?? s.selectedStage : s.mode === 'learn' ? s.moduleId : s.mode === 'perform' ? s.wiId : s.mode === 'assess' ? s.assessmentId : null;
    const h = `#/${s.mode}${id ? `/${id}` : ''}`;
    if (location.hash !== h) history.replaceState(null, '', h);
  }, [s.mode, s.selectedEq, s.selectedStage, s.moduleId, s.wiId, s.assessmentId]);
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

function RightPanel() {
  const { mode, selectedEq, selectedStage, picking, set } = useApp();
  const eq = selectedEq ? idx.equipment.get(selectedEq) : null;
  if (eq && !picking && mode !== 'explore') {
    return (
      <div className="flex h-full flex-col">
        <button className="label border-b border-[var(--color-line)] px-4 py-2 text-left hover:text-[var(--color-text)]" onClick={() => set({ selectedEq: null })}>← Volver a {({ learn: 'la lección', perform: 'la instrucción', assess: 'la evaluación', library: 'la biblioteca', explore: '' } as const)[mode]}</button>
        <div className="min-h-0 flex-1"><EquipmentPanel eq={eq} /></div>
      </div>
    );
  }
  if (mode === 'learn') return <LearnPlayer />;
  if (mode === 'perform') return <PerformJobAid />;
  if (mode === 'assess') return <AssessmentView />;
  if (mode === 'library') return <Library />;
  if (eq) return <EquipmentPanel eq={eq} />;
  const st = selectedStage ? idx.stage.get(selectedStage) : null;
  if (st) return <StagePanel st={st} />;
  return <Welcome />;
}

/** ?capture=1: solo la escena (lo usa scripts/capture-media.mjs para imágenes y el video placeholder). */
const CAPTURE = typeof location !== 'undefined' && new URLSearchParams(location.search).has('capture');
if (typeof window !== 'undefined') (window as unknown as { __adxStore: typeof useApp }).__adxStore = useApp;

export function App() {
  if (CAPTURE) {
    return (
      <div className="relative h-full">
        <Suspense fallback={null}><Scene /></Suspense>
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
  return (
    <div className="flex h-full flex-col">
      <a href="#panel" className="skip-link">Saltar al panel de información</a>
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)_minmax(360px,420px)]">
        <SidebarShell />
        <main className="relative h-[46vh] min-h-[280px] lg:h-auto" aria-label="Vista 3D del horno">
          <Suspense fallback={null}><Scene /></Suspense>
          <LoadingScreen />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center"><ViewToolbar /></div>
          <p className="pointer-events-none absolute left-3 top-3 rounded bg-black/50 px-2 py-1 font-mono text-[10.5px] text-[var(--color-text-3)]">Modelo esquemático · disposición ilustrativa, no a escala de planta</p>
          <ArcNote />
        </main>
        <section id="panel" tabIndex={-1} aria-label="Panel de información" className="min-h-0 flex-1 border-l border-[var(--color-line)] bg-[var(--color-surface)] lg:flex-none">
          <RightPanel />
        </section>
      </div>
      <Disclaimer />
      <DocumentViewer />
      <VideoPlayer />
      <AskAceria />
    </div>
  );
}
