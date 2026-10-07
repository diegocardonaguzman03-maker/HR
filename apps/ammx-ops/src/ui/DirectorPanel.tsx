import { useStore, fmtTime, allProjects } from '../store/useStore';
import { AGENTS, STATUS_META } from '../data/agents';
import { PROJECT_STATUS } from '../data/projects';
import { KPIS } from '../data/seed';
import { DIRECTOR } from '../config';
import { doAction } from './TopBar';

export function DirectorPanel() {
  const open = useStore((s) => s.leftOpen);
  const setOpen = useStore((s) => s.setLeftOpen);
  const alerts = useStore((s) => s.alerts);
  const decisions = useStore((s) => s.decisions);
  const agents = useStore((s) => s.agents);
  const feed = useStore((s) => s.feed);
  const projectsRT = useStore((s) => s.projects);
  const extra = useStore((s) => s.extraProjects);
  const tasks = useStore((s) => s.tasks);
  const projects = allProjects(extra);

  if (!open)
    return (
      <button className="left-tab" onClick={() => setOpen(true)}>
        Command Center ›
      </button>
    );

  const critical = alerts.filter((a) => a.level === 'critical').slice(0, 3);
  const atRisk = projects.filter((p) => p.status === 'blocked' || p.status === 'risk' || (p.status === 'attention' && ['U0', 'U1'].includes(p.urgency)));
  const pending = decisions.filter((d) => !d.resolved);
  const counts = Object.keys(STATUS_META).map((k) => ({ k, n: AGENTS.filter((a) => agents[a.id].status === k).length }));
  const priorities = projects.filter((p) => p.urgency === 'U0' || p.priority === 'P1').slice(0, 4);
  const deadlines = projects.filter((p) => /\d{4}/.test(p.due)).concat(projects.filter((p) => p.milestones.some((m) => m.date))).filter((p, i, arr) => arr.indexOf(p) === i).slice(0, 4);
  const latest = feed.filter((f) => f.kind === 'meeting' || f.kind === 'task' || f.kind === 'audit').slice(0, 4);

  return (
    <aside className="left-panel">
      <div className="lp-head">
        <div>
          <div className="eyebrow">Director Command Center</div>
          <div className="lp-name">{DIRECTOR.name}</div>
          <div className="lp-title">{DIRECTOR.title}</div>
        </div>
        <button className="x" onClick={() => setOpen(false)} aria-label="Cerrar panel">‹</button>
      </div>
      <div className="lp-scroll">
        <Section title="Acciones críticas" n={critical.length}>
          {critical.map((a) => (
            <Row key={a.id} tone="crit" onClick={() => doAction(a.target ? { kind: a.target.kind, id: a.target.id } : undefined)} sub={a.source}>{a.text}</Row>
          ))}
        </Section>
        <Section title="Decisiones que necesitas tomar" n={pending.length} action={{ label: 'Ver todas', on: () => useStore.getState().open({ kind: 'decisions' }) }}>
          {pending.slice(0, 4).map((d) => (
            <Row key={d.id} tone="dec" onClick={() => useStore.getState().open({ kind: 'decisions' })} sub={d.project ? `${d.project} · ${d.source}` : d.source}>{d.title}</Row>
          ))}
        </Section>
        <Section title="Proyectos en riesgo" n={atRisk.length}>
          {atRisk.slice(0, 5).map((p) => (
            <Row key={p.id} onClick={() => doAction({ kind: 'project', id: p.id })} sub={p.next} badge={PROJECT_STATUS[p.status].icon}>{p.id} · {p.name}</Row>
          ))}
        </Section>
        <Section title="Actividad de los agentes">
          <div className="status-grid">
            {counts.map(({ k, n }) => (
              <div key={k} className="sg-cell">
                <span className="dot" style={{ background: STATUS_META[k].color }} />
                <b>{n}</b>
                <small>{STATUS_META[k].label}</small>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Prioridades de hoy">
          {priorities.map((p) => (
            <Row key={p.id} onClick={() => doAction({ kind: 'project', id: p.id })} sub={`${p.priority !== '—' ? p.priority + ' · ' : ''}${p.urgency} · ${p.next}`}>{p.name}</Row>
          ))}
          {tasks.filter((t) => t.stage !== 'done').slice(0, 3).map((t) => (
            <Row key={t.id} onClick={() => doAction({ kind: 'agent', id: t.owner })} sub={`${t.priority} · ${t.progress} %`}>{t.id} · {t.title}</Row>
          ))}
        </Section>
        <Section title="Próximas fechas">
          {deadlines.map((p) => (
            <Row key={p.id} onClick={() => doAction({ kind: 'project', id: p.id })} sub={p.milestones.find((m) => m.date && !m.done)?.label ?? p.next} badge={p.due}>{p.name}</Row>
          ))}
          <div className="hint">Fechas sin confirmar: revisión NAFTA, comité SAFETS, respuesta del diplomado.</div>
        </Section>
        <Section title="Resumen de KPI" tag="Ilustrativa">
            <div className="kpi-grid">
              {KPIS.map((k) => (
                <div key={k.label} className="kpi">
                  <small>{k.label}</small>
                  <b>{k.value}</b>
                  <span className={k.bad ? 'bad' : 'good'}>{k.trend}</span>
                </div>
              ))}
            </div>
          </Section>
        <Section title="Último avance">
          {latest.length === 0 && <div className="hint">Aún sin reuniones ni entregas en esta jornada.</div>}
          {latest.map((f) => (
            <Row key={f.id} sub={fmtTime(f.at)}>{f.text}</Row>
          ))}
          <div className="hint">Avance de proyectos hoy: {Object.values(projectsRT).reduce((n, p) => n + p.updates.length, 0)} actualizaciones.</div>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, n, children, action, tag }: { title: string; n?: number; children: React.ReactNode; action?: { label: string; on: () => void }; tag?: string }) {
  return (
    <section className="lp-sec">
      <div className="lp-sec-h">
        <span>{title}</span>
        {n !== undefined && <em>{n}</em>}
        {tag && <i className="tag">{tag}</i>}
        {action && <button onClick={action.on}>{action.label}</button>}
      </div>
      {children}
    </section>
  );
}

function Row({ children, sub, onClick, tone, badge }: { children: React.ReactNode; sub?: string; onClick?: () => void; tone?: 'crit' | 'dec'; badge?: string }) {
  return (
    <button className={`lp-row ${tone ?? ''}`} onClick={onClick} disabled={!onClick}>
      <span className="lp-row-main">
        {badge && <span className="lp-badge">{badge}</span>}
        {children}
      </span>
      {sub && <span className="lp-row-sub">{sub}</span>}
    </button>
  );
}
