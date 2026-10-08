// Training campus connected to the warehouse by a covered walkway. Layout inspired by the
// Lázaro Cárdenas training site (classroom wings around a courtyard, user-service offices,
// parking). Schedule seed: "Agenda semanal de capacitación · Lázaro Cárdenas · 05–10 oct 2026".

export type RoomId = 'loto' | 'alturas' | 'confinados' | 'izaje' | 'electrica' | 'transporte' | 'induccion' | 'aula12' | 'aula17';
export type EquipKind = RoomId;

export interface Room {
  id: RoomId;
  name: string;
  short: string;
  x0: number; x1: number; z0: number; z1: number;
  door: [number, number]; // point on the wall
  outside: [number, number]; // point on the courtyard walkway in front of the door
  practical: boolean; // has a hands-on practice station
  station: [number, number]; // where trainees gather for practice
  accent: string;
}

export const CAMPUS = { x0: 57, x1: 125, z0: -24, z1: 24 };
export const WALKWAY = { x0: 47.4, x1: 60, z: 0, w: 3.2 };
export const RECEPTION = { x0: 60, x1: 72, z0: -7, z1: 7, south: [64, 7] as [number, number], entry: [60.6, 0] as [number, number], exit: [72, 0] as [number, number] };
export const DESK = { x: 66.4, z0: -3.2, z1: 3.2 };
export const PARKING: [number, number] = [63, 20];
export const COURT_Z = 0; // main walkway of the courtyard

const north = (id: RoomId, name: string, short: string, cx: number, practical: boolean, accent: string, station: [number, number]): Room => ({
  id, name, short, x0: cx - 6.2, x1: cx + 6.2, z0: -22, z1: -9.5, door: [cx + 4.2, -9.5], outside: [cx + 4.2, -7.6], practical, station, accent,
});
const south = (id: RoomId, name: string, short: string, cx: number, practical: boolean, accent: string, station: [number, number]): Room => ({
  id, name, short, x0: cx - 6.2, x1: cx + 6.2, z0: 9.5, z1: 22, door: [cx - 4.6, 9.5], outside: [cx - 4.6, 7.6], practical, station, accent,
});
const east = (id: RoomId, name: string, short: string, z0: number, z1: number, accent: string, practical = false): Room => ({
  id, name, short, x0: 113.4, x1: 124.5, z0, z1, door: [113.4, z1 - 2], outside: [111.6, z1 - 2], practical, station: [121.5, (z0 + z1) / 2], accent,
});

export const ROOMS: Room[] = [
  north('loto', 'Aula LOTO · Bloqueo y etiquetado', 'LOTO', 79.3, true, '#ef4444', [83.2, -19.4]),
  north('alturas', 'Aula Trabajo en alturas', 'Alturas', 92.3, true, '#f59e0b', [96.2, -18.8]),
  north('confinados', 'Aula Espacios confinados', 'Confinados', 105.3, true, '#a855f7', [109.0, -18.6]),
  south('izaje', 'Aula Maniobras e izaje', 'Izaje', 79.3, true, '#eab308', [79.3, 19.2]),
  south('electrica', 'Aula Seguridad eléctrica', 'Eléctrica', 92.3, true, '#3b82f6', [92.3, 19.4]),
  south('transporte', 'Aula Transporte y transportistas', 'Transporte', 105.3, true, '#22c55e', [105.3, 19.0]),
  east('induccion', 'Aula de Inducción de Seguridad (S1)', 'Inducción S1', -22, -7.6, '#F58220'),
  east('aula12', 'Aula 12', 'Aula 12', -7.2, 7.2, '#94a3b8'),
  east('aula17', 'Aula 17', 'Aula 17', 7.6, 22, '#94a3b8'),
];
export const roomById = (id: string) => ROOMS.find((r) => r.id === id);

/** Seat positions (trainees face −z, toward the screen on the room's low-z wall). */
export function seats(r: Room): [number, number][] {
  const out: [number, number][] = [];
  const cx = (r.x0 + r.x1) / 2;
  const width = r.x1 - r.x0;
  const cols = width > 11.5 ? 5 : 4;
  const rowStart = r.z0 + 3.4;
  const rowEnd = r.practical && r.station[1] > r.z0 + 6 ? r.station[1] - 2.6 : r.z1 - 1.4;
  const rows = Math.max(2, Math.floor((rowEnd - rowStart) / 1.55) + 1);
  // practical rooms on the north row keep a side aisle for the station
  const span = r.z0 < 0 && r.x0 < 113 ? width - 4.6 : width - 2.4;
  const left = r.z0 < 0 && r.x0 < 113 ? r.x0 + 1.3 : cx - span / 2;
  for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) out.push([left + (span * (c + 0.5)) / cols, rowStart + row * 1.55]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Week and schedule
// ---------------------------------------------------------------------------------------------
export const WEEK = { label: '05 al 10 de octubre de 2026', days: ['Lun 05', 'Mar 06', 'Mié 07', 'Jue 08', 'Vie 09', 'Sáb 10'], iso: ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10'] };

export type Category = 'seguridad' | 'operativo' | 'webinar';
export interface CampusSession {
  id: string;
  title: string;
  category: Category;
  days: number[]; // 0 = Lun … 5 = Sáb
  start: string; // HH:MM
  durationMin: number;
  room: RoomId | 'externo' | 'virtual';
  location: string; // sede shown on the agenda
  instructor: string;
  cupo: number;
  audience: string;
  courseId?: string;
  totalHours?: number;
  dateLabel?: string;
}

const D = (h: number) => h * 60;
// Durations of the daily safety blocks are not on the agenda: 4 h is an assumption.
export const DURATION_NOTE = 'Duración de los cursos de seguridad: 4 h [Supuesto]; cursos operativos: 8 h por día [Supuesto].';

export const SEED_SESSIONS: CampusSession[] = [
  { id: 's-basico-ext', title: 'Curso Básico de Seguridad Externa', category: 'seguridad', days: [0, 1, 2, 3, 4], start: '08:00', durationMin: D(4), room: 'induccion', location: 'Campus · Inducción S1', instructor: 'Por confirmar', cupo: 20, audience: 'Contratistas' },
  { id: 's-transportistas', title: 'Transportistas', category: 'seguridad', days: [0, 2, 4], start: '09:00', durationMin: D(4), room: 'transporte', location: 'Campus · Aula Transporte', instructor: 'Por confirmar', cupo: 12, audience: 'Transportistas' },
  { id: 's-izaje', title: 'Maniobras e izaje', category: 'seguridad', days: [0, 2, 4], start: '08:00', durationMin: D(4), room: 'izaje', location: 'Campus · Aula Izaje', instructor: 'Por confirmar', cupo: 12, audience: 'Personal operativo' },
  { id: 's-electrica', title: 'Seguridad eléctrica', category: 'seguridad', days: [0, 4], start: '14:00', durationMin: D(4), room: 'electrica', location: 'Campus · Aula Eléctrica', instructor: 'Por confirmar', cupo: 12, audience: 'Personal operativo' },
  { id: 's-loto-am', title: 'Bloqueo y etiquetado', category: 'seguridad', days: [1, 5], start: '08:00', durationMin: D(4), room: 'loto', location: 'Campus · Aula LOTO', instructor: 'Por confirmar', cupo: 12, audience: 'Personal operativo y mantenimiento' },
  { id: 's-loto-pm', title: 'Bloqueo y etiquetado', category: 'seguridad', days: [3], start: '14:00', durationMin: D(4), room: 'loto', location: 'Campus · Aula LOTO', instructor: 'Por confirmar', cupo: 12, audience: 'Personal operativo y mantenimiento' },
  { id: 's-basico-int', title: 'Curso básico de seguridad interna', category: 'seguridad', days: [1], start: '08:00', durationMin: D(4), room: 'aula12', location: 'Campus · Aula 12', instructor: 'Por confirmar', cupo: 20, audience: 'Empleados / Sindicato' },
  { id: 's-alturas-pm', title: 'Trabajos en alturas', category: 'seguridad', days: [2], start: '14:00', durationMin: D(4), room: 'alturas', location: 'Campus · Aula Alturas', instructor: 'Por confirmar', cupo: 10, audience: 'Personal operativo' },
  { id: 's-alturas-am', title: 'Trabajos en alturas', category: 'seguridad', days: [5], start: '08:00', durationMin: D(4), room: 'alturas', location: 'Campus · Aula Alturas', instructor: 'Por confirmar', cupo: 10, audience: 'Personal operativo' },
  { id: 's-confinados', title: 'Espacios confinados', category: 'seguridad', days: [3, 5], start: '08:00', durationMin: D(4), room: 'confinados', location: 'Campus · Aula Confinados', instructor: 'Por confirmar', cupo: 10, audience: 'Personal operativo' },

  { id: 'o-compresores', title: 'Compresores axial tipo tornillo', category: 'operativo', days: [0, 1, 2], start: '07:00', durationMin: D(8), room: 'externo', location: 'CECATI', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento', courseId: '133730', totalHours: 24, dateLabel: '05–07 oct' },
  { id: 'o-alineacion', title: 'Alineación con indicadores de carátula', category: 'operativo', days: [0, 1, 2, 3, 4], start: '07:00', durationMin: D(8), room: 'externo', location: 'CECATI', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento', courseId: '133804', totalHours: 40, dateLabel: '05–09 oct' },
  { id: 'o-abb', title: 'Control y programación de variadores ABB', category: 'operativo', days: [1, 2, 3], start: '07:00', durationMin: D(8), room: 'externo', location: 'ITLAC', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento eléctrico', courseId: '133726', totalHours: 24, dateLabel: '06–08 oct' },
  { id: 'o-flechas', title: 'Maquinado de flechas', category: 'operativo', days: [0, 1, 2, 3], start: '07:00', durationMin: D(8), room: 'externo', location: 'CONALEP', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento mecánico', courseId: '133805', totalHours: 32, dateLabel: '05–08 oct' },
  { id: 'o-canalizacion', title: 'Canalización y cableado eléctrico por tubería', category: 'operativo', days: [1, 2, 3], start: '07:00', durationMin: D(8), room: 'externo', location: 'ITLAC', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento eléctrico', courseId: '133915', totalHours: 24, dateLabel: '06–08 oct' },
  { id: 'o-micromaster', title: 'Drives Micromaster SIEMENS', category: 'operativo', days: [1, 2, 3], start: '07:00', durationMin: D(8), room: 'externo', location: 'ITLAC', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento eléctrico', courseId: '133918', totalHours: 24, dateLabel: '06–08 oct' },
  { id: 'o-oxicorte', title: 'Oxicorte', category: 'operativo', days: [3, 4], start: '07:00', durationMin: D(8), room: 'externo', location: 'CECATI', instructor: 'Por confirmar', cupo: 12, audience: 'Mantenimiento mecánico', courseId: '133648', totalHours: 16, dateLabel: '08–09 oct' },
  { id: 'o-incert-08', title: 'Cálculo de incertidumbre', category: 'operativo', days: [3], start: '07:00', durationMin: D(8), room: 'aula17', location: 'Campus · Aula 17', instructor: 'Por confirmar', cupo: 14, audience: 'Calidad y laboratorio', courseId: '134353', totalHours: 8, dateLabel: '08 oct' },
  { id: 'o-radiacion', title: 'Radiación y altas temperaturas', category: 'operativo', days: [3], start: '08:00', durationMin: D(8), room: 'aula12', location: 'Campus · Aula 12', instructor: 'Por confirmar', cupo: 16, audience: 'Personal operativo', courseId: '134386', totalHours: 8, dateLabel: '08 oct' },
  { id: 'o-incert-09', title: 'Cálculo de incertidumbre', category: 'operativo', days: [4], start: '07:00', durationMin: D(8), room: 'aula17', location: 'Campus · Aula 17', instructor: 'Por confirmar', cupo: 14, audience: 'Calidad y laboratorio', courseId: '134357', totalHours: 8, dateLabel: '09 oct' },

  { id: 'w-excel-ia', title: 'Excel + IA para automatizar reportes y análisis', category: 'webinar', days: [2], start: '15:00', durationMin: 60, room: 'virtual', location: 'Virtual', instructor: 'Por confirmar', cupo: 0, audience: 'Abierto' },
];

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Day index of the real date inside the agenda week, else Thursday (the day the agenda was loaded). */
export function defaultDay() {
  const iso = new Date().toISOString().slice(0, 10);
  const i = WEEK.iso.indexOf(iso);
  return i >= 0 ? i : 3;
}
