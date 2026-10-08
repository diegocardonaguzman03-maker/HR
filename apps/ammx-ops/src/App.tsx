import { Component, useEffect, useState, type ReactNode } from 'react';
import { World } from './scene/World';
import { TopBar } from './ui/TopBar';
import { DirectorPanel } from './ui/DirectorPanel';
import { AgentPanel } from './ui/AgentPanel';
import { Dock } from './ui/Dock';
import { Overlays } from './ui/Modals';
import { useStore } from './store/useStore';
import { DEMO_NOTICE, DIRECTOR } from './config';

export default function App() {
  useEffect(() => {
    if (window.innerWidth < 900) useStore.getState().setLeftOpen(false);
  }, []);
  return (
    <div className="app">
      <div className="world">
        <SceneGuard>
          <World />
        </SceneGuard>
      </div>
      <TopBar />
      <DirectorPanel />
      <AgentPanel />
      <Dock />
      <Overlays />
      <Toast />
      <Intro />
      <div className="demo-flag" title={DEMO_NOTICE}>SIMULACIÓN · datos ilustrativos</div>
    </div>
  );
}

function Toast() {
  const t = useStore((s) => s.toast);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!t) return;
    setShow(true);
    const h = setTimeout(() => setShow(false), 3200);
    return () => clearTimeout(h);
  }, [t?.nonce]);
  if (!t || !show) return null;
  return <div className="toast">{t.text}</div>;
}

function Intro() {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem('ammx-intro') !== '1';
    } catch {
      return true;
    }
  });
  if (!open) return null;
  const close = () => {
    try {
      sessionStorage.setItem('ammx-intro', '1');
    } catch {
      /* storage unavailable */
    }
    setOpen(false);
  };
  return (
    <div className="intro-bg">
      <div className="intro">
        <div className="eyebrow">ArcelorMittal México · {DIRECTOR.title}</div>
        <h1>Bienvenido, {DIRECTOR.first}</h1>
        <p>
          Tu equipo de agentes trabaja en esta nave: Talent Acquisition, Learning &amp; Development, Desarrollo Organizacional, Operaciones,
          AI Lab, Auditoría y la torre PMO con tu Command Center arriba. Por el pasillo del lado derecho llegas al Campus de Capacitación, con las clases en vivo.
        </p>
        <ul>
          <li>Haz clic en un agente para hablar con él, ver su trabajo o asignarle una tarea.</li>
          <li>Usa <b>+ Nueva tarea</b> y mira cómo viaja a su área y pasa por ATLAS y AEGIS.</li>
          <li>Pregunta lo que quieras en la barra superior: “¿Quién tiene bloqueos hoy?”</li>
        </ul>
        <p className="hint">{DEMO_NOTICE} Los agentes con nombre de persona representan el rol, no a la persona.</p>
        <button className="primary" onClick={close}>Entrar al centro de operaciones</button>
      </div>
    </div>
  );
}

// If the 3D view cannot start (no WebGL, blocked GPU), keep the rest of the app usable and say why.
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

class SceneGuard extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: webglAvailable() ? null : 'Este navegador o visor no tiene WebGL disponible.' };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="scene-error">
        <b>La vista 3D no pudo iniciar aquí.</b>
        <span>{this.state.error}</span>
        <span>El resto del centro de operaciones funciona. Prueba abrir el link en Chrome o Edge con la aceleración por hardware activada.</span>
      </div>
    );
  }
}
