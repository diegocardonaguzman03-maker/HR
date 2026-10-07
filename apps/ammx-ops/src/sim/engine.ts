import type { AgentStatus, Anim, Task, ZoneId } from '../types';
import { AGENTS, agentById } from '../data/agents';
import { BACK_LANE, FRONT_LANE, MEETING_SEATS, MEZZANINE_Y, SPOTS, spotById, zoneById } from '../data/zones';
import { MEETINGS } from '../data/seed';
import { projectById } from '../data/projects';
import { useStore } from '../store/useStore';
import { SIM_START_MIN } from '../config';

// ---------------------------------------------------------------------------------------------
// Movement runtime: mutable, read every frame by the 3D avatars (no React re-render per frame).
// ---------------------------------------------------------------------------------------------
type V2 = [number, number];

interface Intent {
  kind: 'script' | 'meeting' | 'task' | 'review';
  pos: V2;
  zone: ZoneId;
  face: number;
  minutes: number;
  status: AgentStatus;
  anim: Anim;
  task: string;
  project: string;
  next: string;
  feed?: string;
  onDone?: () => void;
}

export interface AgentBody {
  id: string;
  x: number;
  z: number;
  heading: number;
  zone: ZoneId;
  path: V2[];
  walking: boolean;
  anim: Anim;
  intent: Intent | null;
  phase: 'idle' | 'going' | 'doing';
  until: number; // sim minute when the current intent ends
  scriptIdx: number;
  interrupt: Intent | null; // pending high-priority intent (meeting / review)
  seat: number | null;
  walkPhase: number;
}

export const BODIES: Record<string, AgentBody> = {};

AGENTS.forEach((a, i) => {
  const s = spotById(a.script[0].spot);
  BODIES[a.id] = {
    id: a.id, x: s.pos[0], z: s.pos[1], heading: s.face, zone: s.zone, path: [], walking: false, anim: a.script[0].anim,
    intent: null, phase: 'idle', until: 0, scriptIdx: (i * 2) % a.script.length, interrupt: null, seat: null, walkPhase: 0,
  };
});

const laneOf = (z: ZoneId) => (zoneById(z).side === 'back' ? BACK_LANE : FRONT_LANE);

export function routeBetween(_from: V2, fromZone: ZoneId, to: V2, toZone: ZoneId): V2[] {
  if (fromZone === toZone) return [to];
  const fz = zoneById(fromZone);
  const tz = zoneById(toZone);
  const fl = laneOf(fromZone);
  const tl = laneOf(toZone);
  const pts: V2[] = [fz.door, [fz.door[0], fl]];
  if (fl !== tl) {
    let cx = tz.door[0];
    if (Math.abs(cx) < 5.5) cx = (fz.door[0] >= 0 ? 1 : -1) * 6;
    pts.push([cx, fl], [cx, tl]);
  }
  pts.push([tz.door[0], tl], tz.door, to);
  return pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.05);
}

const deskOf = (id: string) => {
  const d = SPOTS.find((s) => s.id === `${id}_desk`) ?? (id === 'pmo' ? spotById('pmo_console') : spotById(agentById(id)!.script[0].spot));
  return d;
};

function go(b: AgentBody, it: Intent) {
  b.intent = it;
  b.path = routeBetween([b.x, b.z], b.zone, it.pos, it.zone);
  b.phase = 'going';
  b.walking = true;
  const st = useStore.getState();
  st.setAgent(b.id, {
    status: it.status, task: it.task, project: it.project, next: it.next,
    mode: it.kind === 'script' ? 'script' : it.kind,
  });
}

function scriptIntent(b: AgentBody): Intent {
  const a = agentById(b.id)!;
  const act = a.script[b.scriptIdx % a.script.length];
  b.scriptIdx++;
  const s = spotById(act.spot);
  return { kind: 'script', pos: s.pos, zone: s.zone, face: s.face, minutes: act.minutes, status: act.status, anim: act.anim, task: act.task, project: act.project, next: act.next, feed: act.feed };
}

// ---------------------------------------------------------------------------------------------
// Meetings: rotate the portfolio's collaboration meetings; agents walk to the War Room table.
// ---------------------------------------------------------------------------------------------
interface Meeting { project: string; title: string; members: string[]; outcome: string; called: number; start: number | null; end: number }
let meeting: Meeting | null = null;
let nextMeetingAt = SIM_START_MIN + 22;
let meetingIdx = 0;

export function callMeeting(project: string, title: string, members: string[], outcome: string) {
  if (meeting) {
    useStore.getState().notify('Ya hay una reunión en curso en el War Room.');
    return false;
  }
  const st = useStore.getState();
  const seats = [...MEETING_SEATS];
  meeting = { project, title, members, outcome, called: st.simMinute, start: null, end: 0 };
  members.forEach((m, i) => {
    const b = BODIES[m];
    const seat = seats[i % seats.length];
    b.seat = i;
    b.interrupt = {
      kind: 'meeting', pos: seat.pos, zone: 'war', face: seat.face, minutes: 999, status: 'meeting', anim: 'talk',
      task: `Reunión: ${title}`, project, next: 'Acuerdos de la reunión',
    };
    if (b.phase === 'doing' && b.intent?.kind === 'script') b.phase = 'idle';
  });
  st.setMeeting({ project, title, members });
  st.log(`Reunión convocada en el War Room: ${title}.`, undefined, 'meeting');
  return true;
}

function updateMeeting(now: number) {
  if (!meeting) {
    if (now >= nextMeetingAt) {
      const m = MEETINGS[meetingIdx++ % MEETINGS.length];
      // Skip members busy on a task assigned by the Director.
      const free = m.members.filter((id) => BODIES[id].intent?.kind !== 'task' && BODIES[id].intent?.kind !== 'review');
      if (free.length >= 2) callMeeting(m.project, m.title, free, m.outcome);
      nextMeetingAt = now + 75;
    }
    return;
  }
  const arrived = meeting.members.every((id) => BODIES[id].intent?.kind === 'meeting' && BODIES[id].phase === 'doing');
  if (meeting.start === null && (arrived || now - meeting.called > 35)) {
    meeting.start = now;
    meeting.end = now + 18;
  }
  if (meeting.start !== null && now >= meeting.end) {
    const st = useStore.getState();
    const p = projectById(meeting.project);
    st.log(`Reunión ${meeting.title}: el equipo ${meeting.outcome}.`, undefined, 'meeting');
    st.bumpProject(meeting.project, 3, `Reunión de equipo: ${meeting.outcome}.`);
    if (p && meeting.members.includes('atlas') && Math.random() < 0.5) st.log(`ATLAS señaló una dependencia operativa en ${p.name}.`, 'atlas', 'alert');
    meeting.members.forEach((id) => {
      const b = BODIES[id];
      b.seat = null;
      if (b.intent?.kind === 'meeting') b.phase = 'idle';
    });
    meeting = null;
    st.setMeeting(null);
  }
}

// ---------------------------------------------------------------------------------------------
// Tasks assigned by the Director: packet → owner works at desk → ATLAS → AEGIS → approval.
// ---------------------------------------------------------------------------------------------
const dispatched = new Set<string>();
const taskWorkAcc: Record<string, number> = {};
const RATE: Record<Task['priority'], number> = { U0: 2.4, U1: 1.8, U2: 1.3, U3: 1.0, U4: 0.8 }; // % per sim minute

export const DIRECTOR_POS: [number, number, number] = [0, MEZZANINE_Y + 2.2, -1];

export function packetLanded(to: string, label: string) {
  const st = useStore.getState();
  const t = st.tasks.find((x) => x.id === label);
  if (!t) return;
  if (t.stage === 'queued') {
    st.updateTask(t.id, { stage: 'working' });
    st.log(`${agentById(t.owner)!.name} recibió ${t.id}: ${t.title}.`, t.owner, 'task');
    const b = BODIES[t.owner];
    b.interrupt = taskIntent(t);
    if (b.phase === 'doing' && b.intent?.kind === 'script') b.phase = 'idle';
  } else if (t.stage === 'atlas' || t.stage === 'aegis') {
    const reviewer = to;
    const b = BODIES[reviewer];
    const d = deskOf(reviewer);
    b.interrupt = {
      kind: 'review', pos: d.pos, zone: d.zone, face: d.face, minutes: 14, status: 'analyzing', anim: 'type',
      task: `Revisión de ${t.id}: ${t.title}`, project: t.project, next: reviewer === 'atlas' ? 'Dictamen operativo' : 'Dictamen de auditoría',
      onDone: () => reviewDone(t.id, reviewer),
    };
    if (b.phase === 'doing' && b.intent?.kind === 'script') b.phase = 'idle';
  }
}

function taskIntent(t: Task): Intent {
  const d = deskOf(t.owner);
  return { kind: 'task', pos: d.pos, zone: d.zone, face: d.face, minutes: 999, status: 'working', anim: 'type', task: `${t.id}: ${t.title}`, project: t.project, next: t.output || 'Entregable' };
}

function advanceStage(t: Task) {
  const st = useStore.getState();
  const owner = agentById(t.owner)!;
  const order: Task['stage'][] = [];
  if (t.reviews.atlas) order.push('atlas');
  if (t.reviews.aegis) order.push('aegis');
  if (t.reviews.director) order.push('approval');
  order.push('done');
  const idx = t.stage === 'working' ? 0 : order.indexOf(t.stage) + 1;
  const next = order[idx];
  st.updateTask(t.id, { stage: next });
  const from: [number, number, number] = [BODIES[t.owner].x, 1.6, BODIES[t.owner].z];
  if (next === 'atlas' || next === 'aegis') {
    const reviewer = next;
    st.sendPacket({ from, to: reviewer, color: reviewer === 'atlas' ? '#ef4444' : '#10b981', label: t.id });
    st.log(`${owner.name} envió ${t.id} a ${reviewer === 'atlas' ? 'revisión de ATLAS' : 'auditoría de AEGIS'}.`, t.owner, 'audit');
  } else if (next === 'approval') {
    st.addDecision({ title: `Aprobar ${t.id}: ${t.title}`, context: `Entregable: ${t.output || 'sin especificar'}. Revisado por ${[t.reviews.atlas && 'ATLAS', t.reviews.aegis && 'AEGIS'].filter(Boolean).join(' y ') || 'nadie (sin revisión pedida)'}.`, options: ['Aprobar', 'Pedir cambios'], recommendation: 'Aprobar si el entregable responde lo pedido.', project: t.project, source: 'Tarea', taskId: t.id });
    st.alert({ level: 'attention', text: `${t.id} espera tu aprobación.`, source: 'Simulación', target: { kind: 'project', id: t.project } });
    st.log(`${t.id} quedó listo para aprobación del Director.`, t.owner, 'task');
  } else if (next === 'done') {
    st.alert({ level: 'done', text: `${t.id} completada: ${t.title}.`, source: 'Simulación', target: { kind: 'agent', id: t.owner } });
    st.log(`${owner.name} entregó ${t.id}: ${t.title}.`, t.owner, 'task');
    st.bumpProject(t.project, 4, `Tarea ${t.id} entregada.`);
  }
}

function reviewDone(taskId: string, reviewer: string) {
  const st = useStore.getState();
  const t = st.tasks.find((x) => x.id === taskId);
  if (!t) return;
  const verdict = reviewer === 'atlas' ? (Math.random() < 0.75 ? 'Alineado' : 'Ajustar (corregido por el dueño)') : Math.random() < 0.7 ? 'Aprobado' : 'Aprobado con cambios';
  st.log(`${reviewer === 'atlas' ? 'ATLAS' : 'AEGIS'} dictaminó ${t.id}: ${verdict}.`, reviewer, 'audit');
  advanceStage(t);
}

function updateTasks(dtMin: number) {
  const st = useStore.getState();
  for (const t of st.tasks) {
    if (t.stage === 'queued' && !dispatched.has(t.id)) {
      dispatched.add(t.id);
      st.sendPacket({ from: DIRECTOR_POS, to: t.owner, color: '#F58220', label: t.id });
    }
    if (t.stage === 'working') {
      const b = BODIES[t.owner];
      if (b.intent?.kind === 'task' && b.phase === 'doing') {
        const before = t.progress + (taskWorkAcc[t.id] ?? 0);
        const after = Math.min(100, before + RATE[t.priority] * dtMin);
        taskWorkAcc[t.id] = after - t.progress;
        if ((taskWorkAcc[t.id] ?? 0) >= 2 || after >= 100) {
          st.updateTask(t.id, { progress: Math.round(after) });
          st.setAgent(t.owner, { progress: Math.round(after) });
          taskWorkAcc[t.id] = 0;
          for (const mark of [35, 70]) {
            if (before < mark && after >= mark) {
              t.supports.forEach((s) => st.log(`${agentById(s)!.name} aportó su parte a ${t.id}.`, s, 'task'));
            }
          }
          if (after >= 100) {
            b.phase = 'idle';
            advanceStage({ ...t, progress: 100 });
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Frame step
// ---------------------------------------------------------------------------------------------
let pushAcc = 0;
let simMinute = SIM_START_MIN;

export function getSimMinute() {
  return simMinute;
}

export function step(dtReal: number) {
  const st = useStore.getState();
  const speed = st.speed;
  const dt = Math.min(dtReal, 0.1);
  const dtMin = dt * speed;
  simMinute += dtMin;
  pushAcc += dt;
  if (pushAcc > 0.25) {
    pushAcc = 0;
    st.tick(simMinute);
  }
  updateMeeting(simMinute);
  updateTasks(dtMin);

  const walk = 2.3 * Math.max(0.35, Math.min(speed, 4));
  for (const id in BODIES) {
    const b = BODIES[id];
    if (speed === 0) {
      b.walking = false;
      continue;
    }
    if (b.interrupt && b.phase !== 'going') {
      const it = b.interrupt;
      b.interrupt = null;
      go(b, it);
    }
    if (b.phase === 'idle') {
      // Resume an unfinished Director task before the role script.
      const t = st.tasks.find((x) => x.owner === id && x.stage === 'working');
      go(b, t ? taskIntent(t) : scriptIntent(b));
    }
    if (b.phase === 'going') {
      const target = b.path[0];
      if (!target) {
        b.phase = 'doing';
        b.walking = false;
        b.until = simMinute + (b.intent?.minutes ?? 10);
        b.zone = b.intent!.zone;
        b.anim = b.intent!.anim;
        continue;
      }
      const dx = target[0] - b.x;
      const dz = target[1] - b.z;
      const dist = Math.hypot(dx, dz);
      const stepLen = walk * dt;
      const desired = Math.atan2(dx, dz);
      b.heading = lerpAngle(b.heading, desired, Math.min(1, dt * 10));
      if (dist <= stepLen) {
        b.x = target[0];
        b.z = target[1];
        b.path.shift();
        // Track zone changes while walking through doors and corridor.
        if (Math.abs(b.z) < 7) b.zone = b.z < 0 ? zoneAtDoor(b.x, 'back') : zoneAtDoor(b.x, 'front');
      } else {
        b.x += (dx / dist) * stepLen;
        b.z += (dz / dist) * stepLen;
      }
      b.walking = true;
      b.walkPhase += dt * walk * 3.2;
    } else if (b.phase === 'doing') {
      b.heading = lerpAngle(b.heading, b.intent!.face, Math.min(1, dt * 6));
      if (simMinute >= b.until) {
        const it = b.intent!;
        if (it.kind === 'script' && it.feed && Math.random() < 0.45) st.log(it.feed, id);
        if (it.kind === 'script') st.setAgent(id, { progress: Math.min(100, st.agents[id].progress + 4) });
        it.onDone?.();
        b.phase = 'idle';
      }
    }
  }
}

function zoneAtDoor(x: number, side: 'back' | 'front'): ZoneId {
  // Nearest door on that side of the corridor (the corridor itself belongs to no room).
  let best: ZoneId = side === 'back' ? 'ld' : 'pmo';
  let bd = Infinity;
  for (const id of ['ld', 'ops', 'dock', 'ta', 'od', 'war', 'ai', 'audit', 'pmo'] as ZoneId[]) {
    const z = zoneById(id);
    if (z.side !== side && !(id === 'pmo' && side === 'front')) continue;
    const d = Math.abs(z.door[0] - x);
    if (d < bd) {
      bd = d;
      best = id;
    }
  }
  return best;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

// ---------------------------------------------------------------------------------------------
// Actions from the UI
// ---------------------------------------------------------------------------------------------
export function sendToAudit(agentId: string) {
  const st = useStore.getState();
  const a = st.agents[agentId];
  const b = BODIES[agentId];
  st.sendPacket({ from: [b.x, 1.6, b.z], to: 'aegis', color: '#10b981', label: `audit:${agentId}` });
  st.log(`${agentById(agentId)!.name} envió "${a.next}" a auditoría de AEGIS.`, agentId, 'audit');
  const ab = BODIES.aegis;
  const d = deskOf('aegis');
  ab.interrupt = {
    kind: 'review', pos: d.pos, zone: d.zone, face: d.face, minutes: 12, status: 'analyzing', anim: 'type',
    task: `Auditoría de "${a.next}" (${agentById(agentId)!.name})`, project: a.project, next: 'Dictamen de auditoría',
    onDone: () => {
      const s2 = useStore.getState();
      const v = Math.random() < 0.65 ? 'Aprobado con cambios' : 'Aprobado';
      s2.log(`AEGIS dictaminó "${a.next}": ${v}.`, 'aegis', 'audit');
      s2.say(agentId, { from: 'agent', text: `AEGIS revisó "${a.next}" con la rúbrica de 12 criterios: ${v}.`, at: s2.simMinute });
    },
  };
  if (ab.phase === 'doing' && ab.intent?.kind === 'script') ab.phase = 'idle';
}
