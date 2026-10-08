import { AGENTS, STATUS_META, agentById } from '../data/agents';
import { projectById, PROJECT_STATUS } from '../data/projects';
import { ZONES } from '../data/zones';
import { useStore, allProjects, type CommandResult } from '../store/useStore';
import { DIRECTOR } from '../config';
import { dayPlans, minuteOfDay, phaseOf, summary } from './campus';

// Local, rule-based replies built from the board. There is no language model behind them:
// the app answers with what the portfolio and the simulation know, and says so.
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function agentReply(agentId: string, text: string): string {
  const st = useStore.getState();
  const a = agentById(agentId)!;
  const rt = st.agents[agentId];
  const q = norm(text);
  const projs = allProjects(st.extraProjects).filter((p) => p.owner === agentId || p.team.includes(agentId));
  const owned = projs.filter((p) => p.owner === agentId);
  const myTasks = st.tasks.filter((t) => t.owner === agentId && t.stage !== 'done');
  const mentioned = allProjects(st.extraProjects).find((p) => q.includes(norm(p.name)) || q.includes(norm(p.id)) || norm(p.name).split(' ').some((w) => w.length > 6 && q.includes(w)));

  if (mentioned) {
    const p = mentioned;
    const prog = Math.round(st.projects[p.id]?.progress ?? p.progress);
    const open = p.milestones.filter((m) => !m.done).map((m) => m.label);
    const lines = [
      `${p.id} · ${p.name}: ${PROJECT_STATUS[p.status].icon} ${PROJECT_STATUS[p.status].label}, avance ${prog} % (ilustrativo).`,
      `Siguiente paso: ${p.next}`,
      open.length ? `Hitos abiertos: ${open.join('; ')}.` : 'Sin hitos abiertos.',
      p.risks.length ? `Riesgos: ${p.risks.join(' ')}` : 'Sin riesgos registrados.',
      p.decision ? `Decisión pendiente tuya: ${p.decision}.` : '',
      p.owner !== agentId ? `El dueño es ${agentById(p.owner)?.name ?? p.owner}; yo participo como apoyo.` : '',
    ];
    return lines.filter(Boolean).join('\n');
  }
  if (/bloque|blocker|atoras|deten/.test(q)) {
    const blocked = owned.filter((p) => p.status === 'blocked' || p.decision);
    if (!blocked.length) return 'No tengo bloqueos que dependan de ti en este momento.';
    return 'Esto depende de una decisión o de un tercero:\n' + blocked.map((p) => `• ${p.id} ${p.name}: ${p.decision ?? p.risks[0] ?? p.next}`).join('\n');
  }
  if (/proyecto|cartera|portafolio|project/.test(q)) {
    return `Llevo ${owned.length} proyecto(s) como dueño y apoyo ${projs.length - owned.length}:\n` +
      projs.map((p) => `• ${p.id} ${p.name} — ${PROJECT_STATUS[p.status].label}${p.owner === agentId ? ' (dueño)' : ''}`).join('\n');
  }
  if (/fecha|deadline|vence|cuando/.test(q)) {
    const dated = projs.map((p) => `• ${p.id} ${p.name}: ${p.due}`);
    return 'Fechas de mis proyectos (las que no están confirmadas dicen "Por confirmar"):\n' + dated.join('\n');
  }
  if (/riesgo|risk/.test(q)) {
    const r = projs.flatMap((p) => p.risks.map((x) => `• ${p.id}: ${x}`));
    return r.length ? 'Riesgos registrados:\n' + r.join('\n') : 'No tengo riesgos registrados en mis proyectos.';
  }
  if (/tarea|task|pendiente/.test(q) && myTasks.length) {
    return 'Tareas tuyas que tengo abiertas:\n' + myTasks.map((t) => `• ${t.id} ${t.title} — ${stageLabel(t.stage)} (${t.progress} %)`).join('\n');
  }
  if (/hola|buen|hey/.test(q) && q.length < 20) {
    return `Hola, ${DIRECTOR.first}. Estoy en: ${rt.task}. ¿Quieres el estado, mis bloqueos o asignarme algo?`;
  }
  // Default: status report
  return [
    `Estado: ${STATUS_META[rt.status].dot} ${STATUS_META[rt.status].label}.`,
    `Ahora: ${rt.task} (${projectById(rt.project)?.name ?? rt.project}).`,
    `Siguiente entrega: ${rt.next}.`,
    myTasks.length ? `Tareas tuyas abiertas: ${myTasks.map((t) => t.id).join(', ')}.` : '',
    owned.some((p) => p.decision) ? `Necesito una decisión tuya en: ${owned.filter((p) => p.decision).map((p) => p.id).join(', ')}.` : '',
    a.virtual ? '' : 'Represento el rol, no a la persona: cualquier compromiso se valida con ella.',
  ].filter(Boolean).join('\n');
}

export const stageLabel = (s: string) =>
  ({ queued: 'En camino', working: 'En proceso', atlas: 'Revisión ATLAS', aegis: 'Auditoría AEGIS', approval: 'Espera tu aprobación', done: 'Entregada' })[s] ?? s;

// ---------------------------------------------------------------------------------------------
// Global command bar
// ---------------------------------------------------------------------------------------------
export function runCommand(raw: string): CommandResult | null {
  const st = useStore.getState();
  const q = norm(raw.trim());
  if (!q) return null;
  const agentHit = AGENTS.find((a) => q.includes(norm(a.name.split(' ')[0])) || (a.id === 'pmo' && /\bpmo\b|coordinador/.test(q)));

  // "Ask Maribel about succession" / "Pregunta a Maribel sobre sucesión"
  if (agentHit && /(ask|pregunta|preguntale|dile|habla|chat)/.test(q)) {
    const topic = raw.replace(new RegExp(`.*?${agentHit.name.split(' ')[0]}`, 'i'), '').replace(/^\s*(about|sobre|acerca de|de)\s*/i, '').trim();
    st.select(agentHit.id);
    st.open({ kind: 'chat', agent: agentHit.id });
    const msg = topic || 'estado';
    st.say(agentHit.id, { from: 'user', text: msg, at: st.simMinute });
    setTimeout(() => {
      const s2 = useStore.getState();
      s2.say(agentHit.id, { from: 'agent', text: agentReply(agentHit.id, msg), at: s2.simMinute });
    }, 450);
    return null;
  }
  if (/(create|crea|crear|nuevo|nueva|new|lanza).*(proyecto|project|iniciativa|initiative)/.test(q)) {
    st.open({ kind: 'newproject' });
    return null;
  }
  if (/(create|crea|crear|nueva|new|asigna|assign).*(tarea|task)/.test(q) || /^\+?\s*(tarea|task)/.test(q)) {
    st.open({ kind: 'newtask', agent: agentHit?.id });
    return null;
  }
  if (/bloque|blocker|blocked|atorad/.test(q)) {
    const lines = AGENTS.filter((a) => st.agents[a.id].status === 'blocked' || st.agents[a.id].status === 'waiting').map((a) => ({
      text: `${STATUS_META[st.agents[a.id].status].dot} ${a.name}: ${st.agents[a.id].task}`,
      action: { kind: 'agent' as const, id: a.id },
    }));
    const projs = allProjects(st.extraProjects).filter((p) => p.status === 'blocked').map((p) => ({ text: `🔵 ${p.id} ${p.name}: ${p.decision ?? p.risks[0] ?? ''}`, action: { kind: 'project' as const, id: p.id } }));
    return { query: raw, title: 'Bloqueos de hoy', lines: [...lines, ...projs].length ? [...lines, ...projs] : [{ text: 'Nadie reporta bloqueos ahora mismo.' }] };
  }
  if (/vacante|vacanc|recluta|candidat/.test(q)) {
    st.flyTo('zone', 'ta');
    return {
      query: raw, title: 'Vacantes críticas',
      lines: [
        { text: '🔴 3 vacantes críticas con más de 60 días (ilustrativo).', action: { kind: 'zone', id: 'ta' } },
        { text: 'Perfiles escasos: mantenimiento eléctrico, instrumentación, operación de grúas, metalurgia.', action: { kind: 'agent', id: 'enrique' } },
        { text: 'R6 Tablero de reclutamiento: sin iniciar — define las cifras reales.', action: { kind: 'project', id: 'R6' } },
      ],
    };
  }
  if (/atras|behind|retras|riesgo|risk|late|delay/.test(q)) {
    const list = allProjects(st.extraProjects).filter((p) => ['attention', 'risk', 'blocked'].includes(p.status) && (p.area === 'Capacitación' || !/capacit|training/.test(q)));
    return { query: raw, title: /capacit|training/.test(q) ? 'Programas de capacitación que requieren atención' : 'Proyectos que requieren atención', lines: list.map((p) => ({ text: `${PROJECT_STATUS[p.status].icon} ${p.id} ${p.name} — ${p.next}`, action: { kind: 'project' as const, id: p.id } })) };
  }
  if (/agenda|cronograma|calendario de capacit|programa de cursos/.test(q)) {
    st.open({ kind: 'agenda' });
    return null;
  }
  if (/clase|en vivo|campus|aula|curso|participante|asistencia/.test(q)) {
    st.flyTo('campus');
    const m = minuteOfDay(st.simMinute);
    const plans = dayPlans();
    const live = plans.filter((p) => m >= p.start && m <= p.end);
    const lines = (live.length ? live : plans.filter((p) => p.start > m).slice(0, 4)).map((p) => {
      const sm = summary(p, m, st.attendance[`${p.session.id}|${st.campusDay}`]);
      return { text: `${p.room.short} · ${p.session.title} — ${phaseOf(p, m)} · ${sm.presente + sm.tarde}/${sm.total}`, action: { kind: 'live' as const, id: p.room.id } };
    });
    return { query: raw, title: live.length ? 'Clases en vivo en el campus' : 'Próximas clases del campus', lines: [...lines, { text: 'Abrir la agenda semanal', action: { kind: 'agenda' } }] };
  }
  if (/decisi|decide|aprob|approv/.test(q)) {
    st.open({ kind: 'decisions' });
    return null;
  }
  if (/proyecto|project|cartera|portfolio/.test(q) && !agentHit) {
    st.open({ kind: 'projects' });
    return null;
  }
  const zoneHit = ZONES.find((z) => q.includes(norm(z.short)) || q.includes(norm(z.name)));
  if (zoneHit) {
    st.flyTo('zone', zoneHit.id);
    return { query: raw, title: zoneHit.name, lines: zoneHit.agents.map((id) => ({ text: `${agentById(id)!.name}: ${st.agents[id].task}`, action: { kind: 'agent' as const, id } })) };
  }
  if (agentHit) {
    st.select(agentHit.id);
    st.flyTo('agent', agentHit.id);
    return null;
  }
  const projHit = allProjects(st.extraProjects).find((p) => norm(p.name).includes(q) || q.includes(norm(p.id)) || norm(p.name).split(' ').some((w) => w.length > 5 && q.includes(w)));
  if (projHit) {
    st.open({ kind: 'project', id: projHit.id });
    return null;
  }
  if (/hoy|today|atencion|attention|brief/.test(q)) {
    const crit = st.alerts.filter((a) => a.level === 'critical').slice(0, 3);
    return { query: raw, title: 'Lo que necesita tu atención hoy', lines: [...crit.map((a) => ({ text: `🔴 ${a.text}`, action: a.target ? { kind: a.target.kind, id: a.target.id } as const : undefined })), { text: `${st.decisions.filter((d) => !d.resolved).length} decisiones pendientes`, action: { kind: 'decisions' } }] };
  }
  return { query: raw, title: 'Sin coincidencias', lines: [{ text: 'Prueba: "¿Quién tiene bloqueos hoy?", "Muestra las vacantes críticas", "Pregunta a Maribel sobre sucesión", "¿Qué programas van atrasados?", "Crea un proyecto".' }] };
}
