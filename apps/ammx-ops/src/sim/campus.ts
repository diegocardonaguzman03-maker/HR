import { DESK, PARKING, ROOMS, WEEK, roomById, seats, toMin, type CampusSession, type Room } from '../data/campus';
import { useStore, type AttendanceStatus, type Participant } from '../store/useStore';

// Deterministic campus simulation: every person's position is a pure function of the sim minute,
// so changing speed or day never desynchronises anything.

const WALK = 2.3; // meters per sim minute (same pace as the agents at 1×)
type V2 = [number, number];

// ------------------------------------------------------------------ paths
interface Path { pts: V2[]; cum: number[]; total: number }
function makePath(pts: V2[]): Path {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, total: cum[cum.length - 1] };
}
function along(p: Path, d: number): { x: number; z: number; h: number } {
  if (p.pts.length === 1) return { x: p.pts[0][0], z: p.pts[0][1], h: 0 };
  const dd = Math.max(0, Math.min(p.total, d));
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < dd) i++;
  const a = p.pts[i - 1];
  const b = p.pts[i];
  const seg = p.cum[i] - p.cum[i - 1] || 1;
  const u = (dd - p.cum[i - 1]) / seg;
  return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, h: Math.atan2(b[0] - a[0], b[1] - a[1]) };
}

const QUEUE_Z = [-2.4, -0.8, 0.8, 2.4];
const visitorSpot = (k: number): V2 => [DESK.x - 1.25, QUEUE_Z[k % 4]];
export const practicanteSpot = (k: number): V2 => [DESK.x + 1.25, QUEUE_Z[k % 4]];

/** Courtyard route from the reception's courtyard exit to a room seat or spot. */
function toRoom(r: Room, target: V2): V2[] {
  const inside: V2 = r.x0 >= 113 ? [r.door[0] + 1.0, r.door[1]] : [r.door[0], r.door[1] + (r.z0 < 0 ? -1.0 : 1.0)];
  return [[72.6, 0], [r.outside[0], 0], r.outside, r.door, inside, target];
}
const ARRIVE: V2[] = [PARKING, [64, 9.2], [64, 7], [64.4, 5.6]];
const LOBBY_OUT: V2[] = [[65.0, 5.0], [70.6, 5.0], [72.6, 0]];
const EXIT_HOME: V2[] = [[73, 0], [73.2, 8.3], [64.5, 9.4], PARKING];

// ------------------------------------------------------------------ segments
type Seg =
  | { t0: number; t1: number; kind: 'walk'; path: Path }
  | { t0: number; t1: number; kind: 'stay'; x: number; z: number; h: number; seated: boolean };

export interface Pose { visible: boolean; x: number; z: number; h: number; seated: boolean; walking: boolean }
const HIDDEN: Pose = { visible: false, x: 0, z: 0, h: 0, seated: false, walking: false };

function poseAt(segs: Seg[], m: number): Pose {
  if (!segs.length || m < segs[0].t0 || m > segs[segs.length - 1].t1) return HIDDEN;
  for (const s of segs) {
    if (m < s.t0 || m > s.t1) continue;
    if (s.kind === 'stay') return { visible: true, x: s.x, z: s.z, h: s.h, seated: s.seated, walking: false };
    const p = along(s.path, ((m - s.t0) / Math.max(0.001, s.t1 - s.t0)) * s.path.total);
    return { visible: true, x: p.x, z: p.z, h: p.h, seated: false, walking: true };
  }
  return HIDDEN;
}

class Builder {
  segs: Seg[] = [];
  t: number;
  pos: V2;
  constructor(t: number, pos: V2) {
    this.t = t;
    this.pos = pos;
  }
  walk(pts: V2[]) {
    const path = makePath([this.pos, ...pts]);
    const t1 = this.t + path.total / WALK;
    this.segs.push({ t0: this.t, t1, kind: 'walk', path });
    this.t = t1;
    this.pos = pts[pts.length - 1];
    return this;
  }
  stayUntil(t1: number, h: number, seated = false) {
    if (t1 > this.t) this.segs.push({ t0: this.t, t1, kind: 'stay', x: this.pos[0], z: this.pos[1], h, seated });
    this.t = Math.max(this.t, t1);
    return this;
  }
}

// ------------------------------------------------------------------ seeded random
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ session plans
export interface PersonPlan { name: string; org: string; segs: Seg[]; checkin: number; noShow: boolean; arrive: number }
export interface SessionPlan {
  session: CampusSession;
  room: Room;
  start: number;
  end: number;
  practice: [number, number] | null;
  people: PersonPlan[];
  instructor: Seg[];
  practicante: number;
  practicanteSegs: Seg[];
}

export const phaseOf = (sp: { start: number; end: number; practice: [number, number] | null }, m: number) => {
  if (m < sp.start - 45) return 'Programada';
  if (m < sp.start) return 'Registro de asistencia';
  if (m > sp.end) return 'Concluida';
  const f = (m - sp.start) / (sp.end - sp.start);
  if (sp.practice && m >= sp.practice[0] && m <= sp.practice[1]) return 'Práctica';
  if (f < 0.08) return 'Bienvenida y reglas';
  if (f > 0.95) return 'Cierre y evaluación de reacción';
  if (f > 0.8) return 'Evaluación';
  return 'Teoría';
};

const cache = new Map<string, SessionPlan>();

export function participantsFor(sess: CampusSession, captured: Participant[] | undefined, day: number): Participant[] {
  if (captured && captured.length) return captured;
  if (sess.room === 'virtual') return [];
  const r = rng(`${sess.id}|${day}|count`);
  const n = Math.max(4, Math.round(sess.cupo * (0.7 + 0.3 * r())));
  return Array.from({ length: n }, (_, i) => ({ name: `Participante ${String(i + 1).padStart(2, '0')}`, org: sess.audience }));
}

export function planFor(sess: CampusSession, day: number, captured: Participant[] | undefined, practicanteIdx: number): SessionPlan | null {
  const room = roomById(sess.room);
  if (!room) return null;
  const list = participantsFor(sess, captured, day);
  const key = `${sess.id}|${day}|${sess.start}|${sess.durationMin}|${sess.room}|${list.map((p) => p.name).join(',')}|${practicanteIdx}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const start = toMin(sess.start);
  const end = start + sess.durationMin;
  const practice: [number, number] | null = room.practical ? [start + (end - start) * 0.45, start + (end - start) * 0.8] : null;
  const st = seats(room);
  const people: PersonPlan[] = list.map((p, i) => {
    const r = rng(`${sess.id}|${day}|${i}`);
    const r1 = r();
    const noShow = !captured?.length && r() < 0.07;
    const arrive = r1 < 0.86 ? start - 52 + r1 * 30 : start - 12 + (r1 - 0.86) * 150;
    const seat: V2 = st[i % st.length];
    const b = new Builder(arrive, PARKING).walk([...ARRIVE.slice(1), visitorSpot(i)]);
    const checkin = b.t;
    b.stayUntil(b.t + 2, Math.PI / 2);
    b.walk([...LOBBY_OUT, ...toRoom(room, seat).slice(1)]);
    b.stayUntil(Math.max(b.t, practice ? practice[0] : end), Math.PI, true);
    if (practice) {
      const a = (i / Math.max(1, list.length)) * Math.PI * 2;
      const rad = 1.3 + (i % 3) * 0.55;
      const spot: V2 = [room.station[0] + Math.cos(a) * rad, room.station[1] + Math.sin(a) * rad * 0.8];
      b.walk([spot]).stayUntil(practice[1], Math.atan2(room.station[0] - spot[0], room.station[1] - spot[1]));
      b.walk([seat]).stayUntil(end, Math.PI, true);
    }
    b.stayUntil(end + r() * 4, Math.PI, true);
    b.walk([...toRoom(room, seat).slice(0, 5).reverse(), ...EXIT_HOME]);
    return { name: p.name, org: p.org, segs: noShow ? [] : b.segs, checkin: noShow ? Infinity : checkin, noShow, arrive };
  });
  // Instructor: greeted at the desk, then teaches at the front and leads the practice.
  const front: V2 = [(room.x0 + room.x1) / 2, room.z0 + 1.7];
  const ib = new Builder(start - 62, PARKING).walk([...ARRIVE.slice(1), visitorSpot(practicanteIdx)]);
  ib.stayUntil(ib.t + 3, Math.PI / 2).walk([...LOBBY_OUT, ...toRoom(room, front).slice(1)]);
  if (practice) {
    ib.stayUntil(practice[0], 0);
    ib.walk([[room.station[0], room.station[1] - 1.1]]).stayUntil(practice[1], 0).walk([front]);
  }
  ib.stayUntil(end + 6, 0).walk([...toRoom(room, front).slice(0, 5).reverse(), ...EXIT_HOME]);
  // Practicante: takes the attendance list at the room door at the start of the class.
  const desk = practicanteSpot(practicanteIdx);
  const behind: V2[] = [[70.6, desk[1]], [70.6, 4.4], [72.6, 0]];
  const doorIn: V2 = room.x0 >= 113 ? [room.door[0] + 0.9, room.door[1] - 0.8] : [room.door[0] - 0.8, room.door[1] + (room.z0 < 0 ? -0.9 : 0.9)];
  const pb = new Builder(start - 26, desk).walk([...behind, ...toRoom(room, doorIn).slice(1)]);
  pb.stayUntil(start + 14, room.z0 < 0 ? Math.PI : 0).walk([...toRoom(room, doorIn).slice(0, 5).reverse(), [72.6, 0], [70.6, 4.4], [70.6, desk[1]], desk]);
  const plan: SessionPlan = { session: sess, room, start, end, practice, people, instructor: ib.segs, practicante: practicanteIdx, practicanteSegs: pb.segs };
  cache.set(key, plan);
  if (cache.size > 200) cache.delete(cache.keys().next().value as string);
  return plan;
}

export const personPose = poseAt;

/** Sessions of the selected day that take place in a campus room, with practicante assignment. */
export function dayPlans(): SessionPlan[] {
  const st = useStore.getState();
  const day = st.campusDay;
  const list = st.sessions.filter((s) => s.days.includes(day) && roomById(s.room)).sort((a, b) => toMin(a.start) - toMin(b.start));
  const busyUntil = [0, 0, 0, 0];
  return list
    .map((s) => {
      const start = toMin(s.start);
      let p = busyUntil.findIndex((t) => t <= start - 26);
      if (p < 0) p = list.indexOf(s) % 4;
      busyUntil[p] = start + 30;
      return planFor(s, day, st.participants[s.id], p);
    })
    .filter((x): x is SessionPlan => !!x);
}

export type LiveStatus = AttendanceStatus | 'pendiente' | 'en camino';
export function attendanceAt(plan: SessionPlan, idx: number, m: number, override?: Record<number, AttendanceStatus>): LiveStatus {
  const o = override?.[idx];
  if (o) return o;
  const p = plan.people[idx];
  if (p.noShow) return m > plan.start + 15 ? 'ausente' : 'pendiente';
  if (m < p.arrive) return 'pendiente';
  if (m < p.checkin) return 'en camino';
  return p.checkin <= plan.start ? 'presente' : 'tarde';
}

export function summary(plan: SessionPlan, m: number, override?: Record<number, AttendanceStatus>) {
  const out = { presente: 0, tarde: 0, ausente: 0, pendiente: 0, total: plan.people.length };
  plan.people.forEach((_, i) => {
    const s = attendanceAt(plan, i, m, override);
    if (s === 'presente') out.presente++;
    else if (s === 'tarde') out.tarde++;
    else if (s === 'ausente') out.ausente++;
    else out.pendiente++;
  });
  return out;
}

export const minuteOfDay = (m: number) => ((m % 1440) + 1440) % 1440;

const STATION_NAME: Record<string, string> = {
  loto: 'el tablero de bloqueo', alturas: 'la torre de alturas', confinados: 'el tanque de entrada confinada', izaje: 'el puente grúa de práctica',
  electrica: 'los tableros eléctricos', transporte: 'el tractocamión de práctica',
};

// ------------------------------------------------------------------ live log
const fired = new Set<string>();
let primedDay = -1;
export function campusTick(simMinute: number) {
  const st = useStore.getState();
  const day = st.campusDay;
  const m = minuteOfDay(simMinute);
  const plans = dayPlans();
  const events: { key: string; at: number; text: () => string }[] = [];
  for (const p of plans) {
    const s = p.session;
    const room = p.room.short;
    const k = `${day}|${s.id}`;
    events.push({ key: `${k}|inst`, at: p.start - 30, text: () => `Practicante ${p.practicante + 1} recibió al instructor de ${s.title} y lo acompañó al ${room}.` });
    events.push({
      key: `${k}|start`, at: p.start + 15,
      text: () => {
        const sm = summary(p, m, st.attendance[`${s.id}|${day}`]);
        return `Inició ${s.title} en ${p.room.short}: ${sm.presente + sm.tarde}/${sm.total} presentes (${sm.tarde} tarde, ${sm.ausente} ausentes).`;
      },
    });
    if (p.practice) events.push({ key: `${k}|prac`, at: p.practice[0], text: () => `${s.title}: los participantes pasan a la práctica en ${STATION_NAME[p.room.id] ?? 'la estación de práctica'}.` });
    events.push({
      key: `${k}|end`, at: p.end,
      text: () => {
        const sm = summary(p, m, st.attendance[`${s.id}|${day}`]);
        return `Concluyó ${s.title} (${p.room.short}). Lista de asistencia capturada: ${sm.presente + sm.tarde}/${sm.total}.`;
      },
    });
  }
  for (const s of st.sessions.filter((x) => x.days.includes(day) && (x.room === 'externo' || x.room === 'virtual'))) {
    events.push({ key: `${day}|${s.id}|ext`, at: toMin(s.start), text: () => `Inició ${s.title} en ${s.room === 'virtual' ? 'modalidad virtual' : `sede externa ${s.location}`}.` });
  }
  // On the first tick of a day, earlier events are taken as already happened (no flood).
  if (primedDay !== day) {
    primedDay = day;
    events.filter((e) => e.at < m).forEach((e) => fired.add(e.key));
    const live = plans.filter((p) => m >= p.start && m <= p.end);
    if (live.length) st.log(`${WEEK.days[day]}: ${live.length} clases en curso en el campus de capacitación.`, undefined, 'info');
  }
  for (const e of events) {
    if (m >= e.at && m < e.at + 30 && !fired.has(e.key)) {
      fired.add(e.key);
      st.log(e.text(), undefined, 'info');
    }
  }
}

export { ROOMS };
