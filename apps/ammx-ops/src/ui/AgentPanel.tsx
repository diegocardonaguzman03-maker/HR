import { useEffect, useRef, useState } from 'react';
import { useStore, fmtTime, allProjects } from '../store/useStore';
import { agentById, STATUS_META } from '../data/agents';
import { PROJECT_STATUS } from '../data/projects';
import { zoneById } from '../data/zones';
import { agentReply, stageLabel } from '../sim/chat';
import { callMeeting, sendToAudit } from '../sim/engine';

export function AgentPanel() {
  const id = useStore((s) => s.selected);
  const liveOpen = useStore((s) => s.overlay.kind === 'live');
  if (!id || liveOpen) return null;
  return <AgentPanelInner key={id} id={id} />;
}

function AgentPanelInner({ id }: { id: string }) {
  const a = agentById(id)!;
  const rt = useStore((s) => s.agents[id]);
  const allTasks = useStore((s) => s.tasks);
  const tasks = allTasks.filter((t) => t.owner === id || t.supports.includes(id));
  const extra = useStore((s) => s.extraProjects);
  const projectsRT = useStore((s) => s.projects);
  const select = useStore((s) => s.select);
  const open = useStore((s) => s.open);
  const [tab, setTab] = useState<'chat' | 'work' | 'projects' | 'outputs'>('chat');
  const meta = STATUS_META[rt.status];
  const projs = allProjects(extra).filter((p) => p.owner === id || p.team.includes(id));
  const outputs = projs.filter((p) => p.owner === id).flatMap((p) => p.documents.map((d) => ({ d, p })));

  return (
    <aside className="right-panel">
      <div className="rp-head">
        <div className="avatar" style={{ background: a.shirt }}>
          {a.name.slice(0, 1)}
          <span className="st" style={{ background: meta.color }} />
        </div>
        <div className="rp-id">
          <div className="rp-name">
            {a.name} {a.virtual && <span className="tag">Agente virtual</span>}
          </div>
          <div className="rp-role">{a.role}</div>
          <div className="rp-meta">
            {zoneById(a.zone).name} · <b style={{ color: meta.color }}>{meta.dot} {meta.label}</b>
          </div>
        </div>
        <button className="x" onClick={() => select(null)} aria-label="Cerrar">×</button>
      </div>
      <div className="rp-now">
        <div className="eyebrow">Tarea actual</div>
        <div className="rp-task">{rt.task}</div>
        <div className="rp-bar"><i style={{ width: `${rt.progress}%` }} /></div>
        <div className="rp-sub">
          <span>Siguiente entrega: {rt.next}</span>
          <span>Carga {rt.workload}% · {rt.priority}</span>
        </div>
        <div className="rp-focus">“{a.focus}”</div>
      </div>
      <Actions id={id} />
      <div className="rp-tabs">
        {(['chat', 'work', 'projects', 'outputs'] as const).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {{ chat: 'Chat', work: 'Trabajo', projects: 'Proyectos', outputs: 'Entregables' }[t]}
          </button>
        ))}
      </div>
      <div className="rp-body">
        {tab === 'chat' && <Chat id={id} />}
        {tab === 'work' && (
          <div className="rp-list">
            <div className="li">
              <b>Ahora</b>
              <span>{rt.task}</span>
              <small>Proyecto {rt.project} · {meta.label}</small>
            </div>
            {tasks.length === 0 && <div className="hint">Sin tareas asignadas por el Director. Usa “Asignar tarea”.</div>}
            {tasks.map((t) => (
              <div key={t.id} className="li">
                <b>{t.id} · {t.title}</b>
                <div className="rp-bar sm"><i style={{ width: `${t.progress}%` }} /></div>
                <small>
                  {t.owner === id ? 'Dueño' : 'Apoyo'} · {stageLabel(t.stage)} · {t.priority} · vence {t.due || 'sin fecha'}
                </small>
                {t.supports.length > 0 && <small>Apoyos: {t.supports.map((s) => agentById(s)?.name).join(', ')}</small>}
              </div>
            ))}
            <div className="sub-h">Bloqueos y dependencias</div>
            {projs.filter((p) => p.owner === id && (p.status === 'blocked' || p.decision)).map((p) => (
              <div key={p.id} className="li warn">
                <b>{p.id} · {p.name}</b>
                <small>{p.decision ? `Decisión pendiente: ${p.decision}` : p.risks[0]}</small>
              </div>
            ))}
            {!projs.some((p) => p.owner === id && (p.status === 'blocked' || p.decision)) && <div className="hint">Sin bloqueos registrados.</div>}
          </div>
        )}
        {tab === 'projects' && (
          <div className="rp-list">
            {projs.map((p) => (
              <button key={p.id} className="li link" onClick={() => open({ kind: 'project', id: p.id })}>
                <b>{PROJECT_STATUS[p.status].icon} {p.id} · {p.name}</b>
                <div className="rp-bar sm"><i style={{ width: `${projectsRT[p.id]?.progress ?? p.progress}%` }} /></div>
                <small>{p.owner === id ? 'Dueño' : 'Apoyo'}{p.ownerProposed && p.owner === id ? ' (propuesto)' : ''} · {p.next}</small>
              </button>
            ))}
          </div>
        )}
        {tab === 'outputs' && (
          <div className="rp-list">
            {outputs.length === 0 && <div className="hint">Sin entregables registrados en la cartera para este rol.</div>}
            {outputs.map(({ d, p }) => (
              <div key={d + p.id} className="li">
                <b>📄 {d}</b>
                <small>{p.id} · {p.name}</small>
              </div>
            ))}
            {tasks.filter((t) => t.stage === 'done' && t.owner === id).map((t) => (
              <div key={t.id} className="li">
                <b>✅ {t.output || t.title}</b>
                <small>{t.id} · entregada en la simulación</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function Actions({ id }: { id: string }) {
  const st = useStore.getState;
  const a = agentById(id)!;
  const [mode, setMode] = useState<'none' | 'deadline' | 'priority' | 'project'>('none');
  const extra = useStore((s) => s.extraProjects);
  const ask = (q: string) => {
    const s = st();
    s.say(id, { from: 'user', text: q, at: s.simMinute });
    setTimeout(() => {
      const s2 = st();
      s2.say(id, { from: 'agent', text: agentReply(id, q), at: s2.simMinute });
    }, 400);
  };
  const btns: { label: string; on: () => void }[] = [
    { label: 'Asignar tarea', on: () => st().open({ kind: 'newtask', agent: id }) },
    { label: 'Preguntar', on: () => document.getElementById('chat-input')?.focus() },
    { label: 'Revisar trabajo', on: () => ask('Muéstrame tu trabajo y tus entregables') },
    { label: 'Agregar fecha', on: () => setMode(mode === 'deadline' ? 'none' : 'deadline') },
    { label: 'Cambiar prioridad', on: () => setMode(mode === 'priority' ? 'none' : 'priority') },
    { label: 'Agregar a proyecto', on: () => setMode(mode === 'project' ? 'none' : 'project') },
    {
      label: 'Crear reunión',
      on: () => {
        const rt = st().agents[id];
        const p = allProjects(st().extraProjects).find((x) => x.id === rt.project);
        const team = Array.from(new Set([id, ...(p ? [p.owner, ...p.team] : [])])).filter((x) => agentById(x)).slice(0, 8);
        if (callMeeting(rt.project, p?.name ?? rt.task, team, 'revisó avances y siguientes pasos')) st().notify(`Reunión convocada: ${team.length} agentes van al War Room.`);
        st().flyTo('zone', 'war');
      },
    },
    { label: 'Pedir actualización', on: () => { ask('Dame una actualización de estado'); st().log(`${a.name} envió una actualización de estado al Director.`, id); } },
    {
      label: 'Escalar',
      on: () => {
        const rt = st().agents[id];
        st().addDecision({ title: `Escalamiento de ${a.name}: ${rt.task}`, context: `Escalado desde el panel del agente. Proyecto ${rt.project}.`, options: ['A) Desbloquear y continuar', 'B) Reasignar', 'C) Posponer'], recommendation: 'A, si la tarea sigue siendo prioridad.', project: rt.project, source: 'Tarea' });
        st().log(`${a.name} escaló un tema al Director.`, id, 'alert');
        st().notify('Escalamiento agregado a tus decisiones.');
      },
    },
    { label: 'Enviar a auditoría', on: () => { sendToAudit(id); st().notify('Enviado a AEGIS.'); } },
    { label: 'Abrir chat completo', on: () => st().open({ kind: 'chat', agent: id }) },
  ];
  return (
    <div className="rp-actions">
      <div className="btn-grid">
        {btns.map((b) => (
          <button key={b.label} onClick={b.on} className={b.label === 'Asignar tarea' ? 'primary' : ''}>{b.label}</button>
        ))}
      </div>
      {mode === 'deadline' && (
        <form className="inline-form" onSubmit={(e) => {
          e.preventDefault();
          const v = (e.currentTarget.elements.namedItem('d') as HTMLInputElement).value;
          const s = st();
          s.setAgent(id, { next: `${s.agents[id].next} · vence ${v}` });
          s.log(`Nueva fecha para ${a.name}: ${s.agents[id].task} → ${v}.`, id);
          setMode('none');
        }}>
          <input type="date" name="d" required /> <button>Guardar</button>
        </form>
      )}
      {mode === 'priority' && (
        <div className="inline-form">
          {(['U0', 'U1', 'U2', 'U3', 'U4'] as const).map((p) => (
            <button key={p} onClick={() => { st().setAgent(id, { priority: p }); st().log(`Prioridad de ${a.name} cambiada a ${p}.`, id); setMode('none'); }}>{p}</button>
          ))}
        </div>
      )}
      {mode === 'project' && (
        <form className="inline-form" onSubmit={(e) => {
          e.preventDefault();
          const pid = (e.currentTarget.elements.namedItem('p') as HTMLSelectElement).value;
          const p = allProjects(st().extraProjects).find((x) => x.id === pid);
          if (p && !p.team.includes(id) && p.owner !== id) p.team.push(id);
          st().log(`${a.name} se sumó al proyecto ${pid}.`, id);
          st().notify(`${a.name} agregado a ${pid}.`);
          setMode('none');
        }}>
          <select name="p">
            {allProjects(extra).map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
          </select>
          <button>Agregar</button>
        </form>
      )}
    </div>
  );
}

export function Chat({ id, big = false }: { id: string; big?: boolean }) {
  const msgs = useStore((s) => s.chats[id] ?? []);
  const say = useStore((s) => s.say);
  const a = agentById(id)!;
  const [q, setQ] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs.length]);
  const send = (text: string) => {
    if (!text.trim()) return;
    const st = useStore.getState();
    say(id, { from: 'user', text, at: st.simMinute });
    setQ('');
    setTimeout(() => {
      const s2 = useStore.getState();
      s2.say(id, { from: 'agent', text: agentReply(id, text), at: s2.simMinute });
    }, 450);
  };
  const quick = [`${a.name.split(' ')[0]}, ¿cómo vas?`, '¿Qué te bloquea?', '¿Qué proyectos llevas?', '¿Qué riesgos ves?'];
  return (
    <div className={`chat ${big ? 'big' : ''}`}>
      <div className="chat-log">
        {msgs.length === 0 && <div className="hint">Escríbele a {a.name}. Responde con lo que sabe el tablero: estado, proyectos, bloqueos, fechas y riesgos.</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            <div className="bubble">{m.text}</div>
            <small>{m.from === 'agent' ? a.name : 'Tú'} · {fmtTime(m.at)}</small>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="quick">
        {quick.map((x) => (
          <button key={x} onClick={() => send(x)}>{x}</button>
        ))}
      </div>
      <form className="chat-in" onSubmit={(e) => { e.preventDefault(); send(q); }}>
        <input id="chat-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Mensaje para ${a.name}…`} />
        <button>Enviar</button>
      </form>
      <div className="chat-note">Respuestas locales generadas del tablero; no hay modelo de IA conectado.</div>
    </div>
  );
}
