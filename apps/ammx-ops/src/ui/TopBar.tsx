import { useEffect, useRef, useState } from 'react';
import { useStore, fmtTime } from '../store/useStore';
import { runCommand } from '../sim/chat';
import type { Action } from '../store/useStore';
import type { AlertLevel } from '../types';

export function doAction(a: Action | undefined) {
  if (!a) return;
  const st = useStore.getState();
  if (a.kind === 'agent' && a.id) {
    st.select(a.id);
    st.flyTo('agent', a.id);
  } else if (a.kind === 'project' && a.id) st.open({ kind: 'project', id: a.id });
  else if (a.kind === 'zone' && a.id) st.flyTo('zone', a.id);
  else if (a.kind === 'decisions') st.open({ kind: 'decisions' });
  else if (a.kind === 'projects') st.open({ kind: 'projects' });
  else if (a.kind === 'newtask') st.open({ kind: 'newtask' });
  else if (a.kind === 'newproject') st.open({ kind: 'newproject' });
}

export function TopBar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const open = useStore((s) => s.open);
  return (
    <header className="topbar">
      <button className="brand" onClick={() => useStore.getState().flyTo('home')} title="Vista general">
        <span className="brand-mark" />
        <span className="brand-text">
          <b>AMMX</b> Agent Operations
          <small>Talent · Learning · OD</small>
        </span>
      </button>
      <CommandBar />
      <div className="top-actions">
        <div className="seg">
          <button className={view === 'operational' ? 'on' : ''} onClick={() => setView('operational')}>Operativa</button>
          <button className={view === 'strategic' ? 'on' : ''} onClick={() => setView('strategic')}>Estratégica</button>
        </div>
        <button className="tb-btn" onClick={() => open({ kind: 'projects' })}>Proyectos</button>
        <button className="tb-btn primary" onClick={() => open({ kind: 'newtask' })}>
          <span className="long">+ Nueva tarea</span>
          <span className="short">+ Tarea</span>
        </button>
        <Notifications />
        <Clock />
        <button className="tb-icon" onClick={() => open({ kind: 'help' })} title="Ayuda">?</button>
      </div>
    </header>
  );
}

function CommandBar() {
  const [q, setQ] = useState('');
  const result = useStore((s) => s.command);
  const setCommand = useStore((s) => s.setCommand);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setCommand(null);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [setCommand]);
  const submit = (text: string) => {
    const r = runCommand(text);
    setCommand(r);
    setQ('');
  };
  const examples = ['¿Quién tiene bloqueos hoy?', 'Muestra las vacantes críticas', 'Pregunta a Maribel sobre sucesión', '¿Qué programas de capacitación van atrasados?', 'Crea un proyecto'];
  const [focused, setFocused] = useState(false);
  return (
    <div className="cmd">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
      >
        <span className="cmd-icon">⌘</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Pregunta al equipo de agentes AMMX…"
          aria-label="Barra de comandos"
        />
        <kbd>/</kbd>
      </form>
      {focused && !q && !result && (
        <div className="cmd-drop">
          <div className="cmd-title">Ejemplos</div>
          {examples.map((e) => (
            <button key={e} className="cmd-line" onMouseDown={() => submit(e)}>{e}</button>
          ))}
        </div>
      )}
      {result && (
        <div className="cmd-drop">
          <div className="cmd-title">
            {result.title}
            <button className="x" onClick={() => setCommand(null)}>×</button>
          </div>
          {result.lines.map((l, i) => (
            <button key={i} className={`cmd-line ${l.action ? 'link' : ''}`} onClick={() => { doAction(l.action); if (l.action) setCommand(null); }}>
              {l.text}
            </button>
          ))}
          <div className="cmd-foot">Respuesta generada del tablero y la simulación (sin modelo de IA conectado).</div>
        </div>
      )}
    </div>
  );
}

const LEVELS: { id: AlertLevel; label: string; icon: string }[] = [
  { id: 'critical', label: 'Crítico', icon: '🔴' },
  { id: 'attention', label: 'Atención', icon: '🟠' },
  { id: 'info', label: 'Información', icon: '🔵' },
  { id: 'done', label: 'Completado', icon: '🟢' },
];

function Notifications() {
  const alerts = useStore((s) => s.alerts);
  const seen = useStore((s) => s.alertsSeen);
  const mark = useStore((s) => s.markAlertsSeen);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AlertLevel | 'all'>('all');
  const unread = Math.max(0, alerts.length - seen);
  const list = alerts.filter((a) => tab === 'all' || a.level === tab);
  return (
    <div className="notif">
      <button
        className="tb-icon bell"
        onClick={() => {
          setOpen(!open);
          mark();
        }}
        aria-label="Notificaciones"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-drop">
          <div className="tabs">
            <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>Todas</button>
            {LEVELS.map((l) => (
              <button key={l.id} className={tab === l.id ? 'on' : ''} onClick={() => setTab(l.id)}>
                {l.icon} {l.label} <small>{alerts.filter((a) => a.level === l.id).length}</small>
              </button>
            ))}
          </div>
          <div className="notif-list">
            {list.map((a) => (
              <button key={a.id} className={`notif-item ${a.level}`} onClick={() => { doAction(a.target ? { kind: a.target.kind, id: a.target.id } : undefined); setOpen(false); }}>
                <span>{LEVELS.find((l) => l.id === a.level)?.icon}</span>
                <span className="ni-text">{a.text}</span>
                <span className={`src ${a.source === 'Cartera' ? 'real' : ''}`}>{a.source} · {fmtTime(a.at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Clock() {
  const m = useStore((s) => s.simMinute);
  const speed = useStore((s) => s.speed);
  const setSpeed = useStore((s) => s.setSpeed);
  return (
    <div className="clock" title="Reloj de la simulación">
      <span className="time">{fmtTime(m)}</span>
      <div className="speeds">
        {[0, 1, 2, 4].map((s) => (
          <button key={s} className={speed === s ? 'on' : ''} onClick={() => setSpeed(s)} aria-label={s === 0 ? 'Pausa' : `Velocidad ${s}x`}>
            {s === 0 ? '❚❚' : `${s}×`}
          </button>
        ))}
      </div>
    </div>
  );
}
