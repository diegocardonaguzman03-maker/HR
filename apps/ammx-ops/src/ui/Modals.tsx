import { useMemo, useState } from 'react';
import { useStore, fmtTime, allProjects } from '../store/useStore';
import { AGENTS, STATUS_META, agentById } from '../data/agents';
import { PROJECT_STATUS } from '../data/projects';
import { callMeeting } from '../sim/engine';
import { Chat } from './AgentPanel';
import { DEMO_NOTICE, DIRECTOR } from '../config';
import type { ProjectDef, Task } from '../types';
import { stageLabel } from '../sim/chat';
import { AgendaView, LivePanel, SessionEditor } from './CampusPanels';

export function Overlays() {
  const o = useStore((s) => s.overlay);
  const close = useStore((s) => s.close);
  if (o.kind === 'none') return null;
  if (o.kind === 'live') return <LivePanel key={o.room} room={o.room} />;
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      {o.kind === 'projects' && <ProjectsView />}
      {o.kind === 'project' && <ProjectRoom id={o.id} />}
      {o.kind === 'newtask' && <NewTask agent={o.agent} project={o.project} />}
      {o.kind === 'newproject' && <NewProject />}
      {o.kind === 'decisions' && <Decisions />}
      {o.kind === 'chat' && <FullChat id={o.agent} />}
      {o.kind === 'help' && <Help />}
      {o.kind === 'agenda' && <AgendaView />}
      {o.kind === 'session' && <SessionEditor key={`${o.id ?? 'new'}|${o.day ?? ''}`} id={o.id} day={o.day} />}
    </div>
  );
}

function Shell({ title, sub, children, wide, onBack }: { title: string; sub?: string; children: React.ReactNode; wide?: boolean; onBack?: () => void }) {
  const close = useStore((s) => s.close);
  return (
    <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-label={title}>
      <div className="modal-h">
        {onBack && <button className="back" onClick={onBack}>‹ Proyectos</button>}
        <div>
          <div className="modal-t">{title}</div>
          {sub && <div className="modal-s">{sub}</div>}
        </div>
        <button className="x" onClick={close} aria-label="Cerrar">×</button>
      </div>
      <div className="modal-b">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Projects
function ProjectsView() {
  const extra = useStore((s) => s.extraProjects);
  const rt = useStore((s) => s.projects);
  const open = useStore((s) => s.open);
  const [area, setArea] = useState<string>('Destacados');
  const [q, setQ] = useState('');
  const all = allProjects(extra);
  const areas = ['Destacados', 'Todos', 'Reclutamiento', 'Capacitación', 'Desarrollo Organizacional', 'Digital y analítica'];
  const list = all.filter((p) => (area === 'Todos' ? true : area === 'Destacados' ? p.featured || extra.includes(p) : p.area === area)).filter((p) => !q || `${p.id} ${p.name}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Shell title="Proyectos" sub={`${all.length} proyectos en la cartera del equipo · avance ilustrativo`} wide>
      <div className="pv-bar">
        <div className="tabs">
          {areas.map((a) => (
            <button key={a} className={area === a ? 'on' : ''} onClick={() => setArea(a)}>{a}</button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar proyecto…" />
        <button className="primary" onClick={() => open({ kind: 'newproject' })}>+ Nuevo proyecto</button>
      </div>
      <div className="pgrid">
        {list.map((p) => (
          <button key={p.id} className="pcard" onClick={() => open({ kind: 'project', id: p.id })}>
            <div className="pc-top">
              <span className="pid">{p.id}</span>
              <span className="pst" style={{ color: PROJECT_STATUS[p.status].color }}>{PROJECT_STATUS[p.status].icon} {PROJECT_STATUS[p.status].label}</span>
            </div>
            <div className="pc-name">{p.name}</div>
            <div className="pc-meta">
              Dueño: <b>{agentById(p.owner)?.name ?? p.owner}</b>{p.ownerProposed ? ' (propuesto)' : ''}
            </div>
            <div className="pc-team">
              {p.team.slice(0, 6).map((t) => (
                <span key={t} className="mini" style={{ background: agentById(t)?.shirt }} title={agentById(t)?.name}>{agentById(t)?.name.slice(0, 1)}</span>
              ))}
            </div>
            <div className="rp-bar sm"><i style={{ width: `${rt[p.id]?.progress ?? p.progress}%` }} /></div>
            <div className="pc-foot">
              <span>{p.priority !== '—' ? `${p.priority} · ` : ''}{p.urgency}</span>
              <span>Fecha: {p.due}</span>
            </div>
            <div className="pc-foot">
              <span>{p.milestones.filter((m) => m.done).length}/{p.milestones.length} hitos</span>
              <span>{p.risks.length} riesgos</span>
            </div>
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- Project room
function ProjectRoom({ id }: { id: string }) {
  const extra = useStore((s) => s.extraProjects);
  const rt = useStore((s) => s.projects[id]);
  const agents = useStore((s) => s.agents);
  const tasks = useStore((s) => s.tasks);
  const decisions = useStore((s) => s.decisions);
  const feed = useStore((s) => s.feed);
  const open = useStore((s) => s.open);
  const p = allProjects(extra).find((x) => x.id === id);
  if (!p) return <Shell title="Proyecto no encontrado">—</Shell>;
  const team = Array.from(new Set([p.owner, ...p.team])).filter((t) => agentById(t));
  const myTasks = tasks.filter((t) => t.project === id);
  const myDecisions = decisions.filter((d) => d.project === id && !d.resolved);
  const activity = feed.filter((f) => f.text.includes(p.name) || f.text.includes(id) || (f.agent && team.includes(f.agent))).slice(0, 8);
  const prog = Math.round(rt?.progress ?? p.progress);
  return (
    <Shell title={`${p.id} · ${p.name}`} sub={`Project room · ${p.area}`} wide onBack={() => open({ kind: 'projects' })}>
      <div className="room">
        <div className="room-wall">
          <div className="room-hero">
            <div>
              <div className="eyebrow">Objetivo</div>
              <p>{p.objective}</p>
            </div>
            <div className="room-stats">
              <div><small>Estado</small><b style={{ color: PROJECT_STATUS[p.status].color }}>{PROJECT_STATUS[p.status].icon} {PROJECT_STATUS[p.status].label}</b></div>
              <div><small>Avance</small><b>{prog} %</b><i className="tag">Ilustrativo</i></div>
              <div><small>Prioridad</small><b>{p.priority !== '—' ? `${p.priority} · ` : ''}{p.urgency}</b></div>
              <div><small>Madurez</small><b>{p.maturity}</b></div>
              <div><small>Fecha</small><b>{p.due}</b></div>
            </div>
          </div>
          <div className="room-grid">
            <div className="sticky yellow">
              <h4>Equipo</h4>
              {team.map((t) => {
                const a = agentById(t)!;
                return (
                  <button key={t} className="member" onClick={() => { useStore.getState().select(t); useStore.getState().flyTo('agent', t); useStore.getState().close(); }}>
                    <span className="mini" style={{ background: a.shirt }}>{a.name.slice(0, 1)}</span>
                    <span><b>{a.name}</b>{t === p.owner ? ' · dueño' : ''}<small>{STATUS_META[agents[t].status].dot} {agents[t].task}</small></span>
                  </button>
                );
              })}
              <button className="primary full" onClick={() => {
                if (callMeeting(p.id, p.name, team.slice(0, 8), 'revisó hitos, riesgos y siguientes pasos')) {
                  useStore.getState().close();
                  useStore.getState().flyTo('zone', 'war');
                }
              }}>Convocar al War Room</button>
            </div>
            <div className="sticky blue">
              <h4>Línea de tiempo e hitos</h4>
              <ol className="timeline">
                {p.milestones.map((m) => (
                  <li key={m.label} className={m.done ? 'done' : ''}>
                    <span />{m.label}{m.date ? <small> · {m.date}</small> : null}
                  </li>
                ))}
              </ol>
              <div className="next"><b>Siguiente paso:</b> {p.next}</div>
            </div>
            <div className="sticky pink">
              <h4>Riesgos</h4>
              {p.risks.length ? p.risks.map((r) => <p key={r}>⚠ {r}</p>) : <p className="hint">Sin riesgos registrados.</p>}
              <h4>Decisiones</h4>
              {p.decision && <p>❓ {p.decision}</p>}
              {myDecisions.map((d) => <p key={d.id}>❓ {d.title}</p>)}
              {!p.decision && myDecisions.length === 0 && <p className="hint">Sin decisiones pendientes.</p>}
              {(p.decision || myDecisions.length > 0) && <button className="link" onClick={() => open({ kind: 'decisions' })}>Ir a decisiones ›</button>}
            </div>
            <div className="sticky green">
              <h4>Tareas</h4>
              {myTasks.length === 0 && <p className="hint">Sin tareas del Director en este proyecto.</p>}
              {myTasks.map((t) => (
                <p key={t.id}>{t.id} · {t.title} — {stageLabel(t.stage)} ({t.progress} %)</p>
              ))}
              <button className="link" onClick={() => open({ kind: 'newtask', project: p.id, agent: p.owner })}>+ Asignar tarea en este proyecto</button>
              <h4>Documentos</h4>
              {p.documents.length ? p.documents.map((d) => <p key={d}>📄 {d}</p>) : <p className="hint">Sin documentos registrados.</p>}
            </div>
            <div className="sticky">
              <h4>KPI</h4>
              {p.kpis.length ? p.kpis.map((k) => <p key={k}>📈 {k}</p>) : <p className="hint">Por definir.</p>}
              <h4>Últimas actualizaciones</h4>
              {(rt?.updates ?? []).slice(0, 4).map((u, i) => <p key={i}><small>{fmtTime(u.at)}</small> {u.text}</p>)}
              {(rt?.updates ?? []).length === 0 && <p className="hint">Sin actualizaciones en esta jornada.</p>}
            </div>
            <div className="sticky dark">
              <h4>Actividad de agentes</h4>
              {activity.map((f) => <p key={f.id}><small>{fmtTime(f.at)}</small> {f.text}</p>)}
              {activity.length === 0 && <p className="hint">Sin actividad todavía.</p>}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- New task
function NewTask({ agent, project }: { agent?: string; project?: string }) {
  const extra = useStore((s) => s.extraProjects);
  const all = allProjects(extra);
  const [f, setF] = useState({
    title: '', description: '', priority: 'U2' as Task['priority'], due: '', owner: agent ?? 'alex', supports: [] as string[], project: project ?? (agent ? all.find((p) => p.owner === agent)?.id ?? 'MOD' : 'MOD'), output: '',
    atlas: false, aegis: true, director: true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const valid = f.title.trim().length > 2;
  const submit = () => {
    const st = useStore.getState();
    const t = st.addTask({ title: f.title.trim(), description: f.description, priority: f.priority, due: f.due, owner: f.owner, supports: f.supports, project: f.project, output: f.output, reviews: { atlas: f.atlas, aegis: f.aegis, director: f.director } });
    st.log(`${DIRECTOR.first} asignó ${t.id} a ${agentById(f.owner)!.name}: ${t.title}.`, undefined, 'task');
    st.notify(`${t.id} enviada a ${agentById(f.owner)!.name}. Mira cómo llega a su área.`);
    st.close();
    st.select(f.owner);
    st.flyTo('home');
  };
  return (
    <Shell title="Nueva tarea" sub="Se clasifica, viaja al área del agente y pasa por las revisiones que marques">
      <div className="form">
        <label>Nombre de la tarea<input autoFocus value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej. Plan de cierre de SAFETS" /></label>
        <label>Descripción<textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Qué necesitas, para quién y para cuándo" /></label>
        <div className="row">
          <label>Prioridad
            <select value={f.priority} onChange={(e) => set('priority', e.target.value as Task['priority'])}>
              <option value="U0">U0 · Seguridad / legal</option>
              <option value="U1">U1 · Ejecutivo crítico</option>
              <option value="U2">U2 · Estratégico</option>
              <option value="U3">U3 · Optimización</option>
              <option value="U4">U4 · Deseable</option>
            </select>
          </label>
          <label>Fecha de entrega<input type="date" value={f.due} onChange={(e) => set('due', e.target.value)} /></label>
        </div>
        <div className="row">
          <label>Agente asignado
            <select value={f.owner} onChange={(e) => set('owner', e.target.value)}>
              {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.role}</option>)}
            </select>
          </label>
          <label>Proyecto
            <select value={f.project} onChange={(e) => set('project', e.target.value)}>
              {all.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
            </select>
          </label>
        </div>
        <div className="lbl">Agentes de apoyo</div>
        <div className="chips">
          {AGENTS.filter((a) => a.id !== f.owner).map((a) => (
            <button key={a.id} type="button" className={f.supports.includes(a.id) ? 'on' : ''} onClick={() => set('supports', f.supports.includes(a.id) ? f.supports.filter((x) => x !== a.id) : [...f.supports, a.id])}>{a.name}</button>
          ))}
        </div>
        <label>Entregable esperado<input value={f.output} onChange={(e) => set('output', e.target.value)} placeholder="Ej. One pager para Cynthia" /></label>
        <div className="lbl">Revisiones</div>
        <div className="checks">
          <label><input type="checkbox" checked={f.atlas} onChange={(e) => set('atlas', e.target.checked)} /> Revisión de ATLAS (operación)</label>
          <label><input type="checkbox" checked={f.aegis} onChange={(e) => set('aegis', e.target.checked)} /> Auditoría de AEGIS</label>
          <label><input type="checkbox" checked={f.director} onChange={(e) => set('director', e.target.checked)} /> Aprobación de {DIRECTOR.first}</label>
        </div>
        <div className="form-foot">
          <span className="hint">La tarea vive en esta sesión del navegador. Para el trabajo real, usa <code>/ammx-tarea</code> en Claude Code.</span>
          <button className="primary" disabled={!valid} onClick={submit}>Crear y asignar</button>
        </div>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- New project
function NewProject() {
  const extra = useStore((s) => s.extraProjects);
  const [f, setF] = useState({ name: '', objective: '', owner: 'maribel', team: [] as string[], area: 'Digital y analítica' as ProjectDef['area'], urgency: 'U2' as ProjectDef['urgency'], due: '' });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const submit = () => {
    const st = useStore.getState();
    const id = `N${extra.length + 1}`;
    const p: ProjectDef = {
      id, name: f.name.trim(), area: f.area, owner: f.owner, team: f.team, status: 'notstarted', priority: '—', urgency: f.urgency, maturity: 'Conceptual', progress: 0, due: f.due || 'Por confirmar', featured: true,
      objective: f.objective || 'Por definir', milestones: [{ label: 'Definir problema, objetivo y población', done: false }, { label: 'Revisión de ATLAS y AEGIS', done: false }], risks: [], documents: [], kpis: [], next: 'Definir problema, objetivo y población.',
    };
    st.addProject(p);
    st.log(`${DIRECTOR.first} lanzó el proyecto ${id}: ${p.name} (dueño: ${agentById(f.owner)!.name}).`, f.owner, 'task');
    st.alert({ level: 'info', text: `Nuevo proyecto ${id}: ${p.name}.`, source: 'Simulación', target: { kind: 'project', id } });
    st.open({ kind: 'project', id });
  };
  return (
    <Shell title="Nueva iniciativa" sub="Se crea en la cartera de esta sesión y abre su project room">
      <div className="form">
        <label>Nombre<input autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Proyecto de IA para nómina inteligente" /></label>
        <label>Objetivo<textarea rows={3} value={f.objective} onChange={(e) => set('objective', e.target.value)} placeholder="¿Cuál es el problema operativo que queremos resolver?" /></label>
        <div className="row">
          <label>Dueño
            <select value={f.owner} onChange={(e) => set('owner', e.target.value)}>
              {AGENTS.filter((a) => !a.virtual).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label>Área
            <select value={f.area} onChange={(e) => set('area', e.target.value as ProjectDef['area'])}>
              {['Reclutamiento', 'Capacitación', 'Desarrollo Organizacional', 'Digital y analítica'].map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </div>
        <div className="row">
          <label>Urgencia
            <select value={f.urgency} onChange={(e) => set('urgency', e.target.value as ProjectDef['urgency'])}>
              {['U0', 'U1', 'U2', 'U3', 'U4'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label>Fecha meta<input type="date" value={f.due} onChange={(e) => set('due', e.target.value)} /></label>
        </div>
        <div className="lbl">Equipo</div>
        <div className="chips">
          {AGENTS.filter((a) => a.id !== f.owner).map((a) => (
            <button key={a.id} type="button" className={f.team.includes(a.id) ? 'on' : ''} onClick={() => set('team', f.team.includes(a.id) ? f.team.filter((x) => x !== a.id) : [...f.team, a.id])}>{a.name}</button>
          ))}
        </div>
        <div className="form-foot">
          <span className="hint">NEXUS sugiere: si el proyecto propone IA, define primero el problema operativo.</span>
          <button className="primary" disabled={f.name.trim().length < 3} onClick={submit}>Crear proyecto</button>
        </div>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- Decisions
function Decisions() {
  const decisions = useStore((s) => s.decisions);
  const resolve = useStore((s) => s.resolveDecision);
  const pending = decisions.filter((d) => !d.resolved);
  const done = decisions.filter((d) => d.resolved);
  return (
    <Shell title="Decisiones del Director" sub={`${pending.length} pendientes · solo ${DIRECTOR.first} decide`}>
      <div className="dec-list">
        {pending.map((d) => (
          <div key={d.id} className="dec">
            <div className="dec-h">
              <b>{d.title}</b>
              <span className="tag">{d.project ? `${d.project} · ` : ''}{d.source}</span>
            </div>
            <p>{d.context}</p>
            <p className="rec"><b>Recomendación del equipo:</b> {d.recommendation}</p>
            <div className="opts">
              {d.options.map((o) => (
                <button key={o} onClick={() => resolve(d.id, o)}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        {pending.length === 0 && <div className="hint">No hay decisiones pendientes.</div>}
        {done.length > 0 && <div className="sub-h">Tomadas en esta sesión</div>}
        {done.map((d) => (
          <div key={d.id} className="dec done">
            <b>{d.title}</b> → {d.resolved}
          </div>
        ))}
        <div className="hint">Las decisiones tomadas aquí viven en esta sesión. Para dejarlas en el registro oficial, dilas en Claude Code (<code>equipo-ammx/memoria/decisiones-de-diego.md</code>).</div>
      </div>
    </Shell>
  );
}

function FullChat({ id }: { id: string }) {
  const a = agentById(id)!;
  return (
    <Shell title={`Chat con ${a.name}`} sub={a.role}>
      <Chat id={id} big />
    </Shell>
  );
}

function Help() {
  const rows = useMemo(
    () => [
      ['Arrastrar (clic izquierdo)', 'Desplazar la nave'],
      ['Clic derecho + arrastrar', 'Girar la vista'],
      ['Rueda / pellizcar', 'Acercar o alejar'],
      ['Clic en un agente', 'Abrir su panel: chat, trabajo, proyectos y acciones'],
      ['Clic en el nombre de un área', 'Volar a ese departamento (vista estratégica)'],
      ['/ o Ctrl+K', 'Barra de comandos'],
      ['+ Nueva tarea', 'Asignar una tarea: viaja al área del agente y pasa por ATLAS, AEGIS y tu aprobación'],
    ],
    [],
  );
  return (
    <Shell title="Cómo usar el centro de operaciones">
      <table className="help">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}><td>{k}</td><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="hint">{DEMO_NOTICE}</p>
      <p className="hint">Los agentes con nombre de persona representan el rol, no a la persona. Estados de los agentes: {Object.values(STATUS_META).map((s) => `${s.dot} ${s.label}`).join(' · ')}.</p>
    </Shell>
  );
}
