import type { Spot, ZoneDef, ZoneId } from '../types';

// World layout (meters). Camera looks from +z toward -z, so every screen faces +z and agents
// face −z (rotation π) while they work. Back row: z −24…−7. Front row: z 7…24. Corridor between.
export const BACK_LANE = -4.9;
export const FRONT_LANE = 4.9;
export const FACILITY = { minX: -47, maxX: 47, minZ: -26, maxZ: 26 };

export const ZONES: ZoneDef[] = [
  { id: 'ld', name: 'Learning & Development Center', short: 'L&D', center: [-24, -15.5], size: [42, 17], door: [-14, -7], side: 'back', accent: '#F58220', floor: '#2a3038', agents: ['alex', 'alejandro', 'diana', 'emma', 'uziel'] },
  { id: 'ops', name: 'Industrial Operations Room', short: 'Operaciones', center: [17, -15.5], size: [28, 17], door: [6, -7], side: 'back', accent: '#e5484d', floor: '#2b2b2f', agents: ['atlas'] },
  { id: 'dock', name: 'Bahía de logística', short: 'Logística', center: [39, -15.5], size: [12, 17], door: [39, -7], side: 'back', accent: '#a1a1aa', floor: '#26292e', agents: [] },
  { id: 'ta', name: 'Talent Acquisition Hub', short: 'Talent Acquisition', center: [-35, 15.5], size: [20, 17], door: [-28, 7], side: 'front', accent: '#3b82f6', floor: '#262c36', agents: ['enrique', 'sheccid', 'alondra'] },
  { id: 'od', name: 'Organizational Development Lab', short: 'Desarrollo Org.', center: [-15, 15.5], size: [16, 17], door: [-10, 7], side: 'front', accent: '#a855f7', floor: '#2a2834', agents: ['maribel'] },
  { id: 'war', name: 'Project War Room', short: 'War Room', center: [2, 15.5], size: [14, 17], door: [7, 7], side: 'front', accent: '#eab308', floor: '#2c2b27', agents: [] },
  { id: 'ai', name: 'AI & Digital Lab', short: 'AI Lab', center: [20, 15.5], size: [18, 17], door: [13, 7], side: 'front', accent: '#22d3ee', floor: '#1f2a30', agents: ['nexus'] },
  { id: 'audit', name: 'Quality & Audit Room', short: 'Auditoría', center: [39, 15.5], size: [12, 17], door: [35, 7], side: 'front', accent: '#10b981', floor: '#1f2b27', agents: ['aegis'] },
  { id: 'pmo', name: 'PMO / Strategy Control Tower', short: 'PMO', center: [0, 0], size: [8, 8], door: [0, 4.9], side: 'center', accent: '#002B5C', floor: '#22262c', agents: ['pmo'] },
];

export const zoneById = (id: ZoneId) => ZONES.find((z) => z.id === id)!;

export type PropKind = 'desk' | 'wall' | 'none';
export type ScreenKind =
  | 'vacancies' | 'calendar' | 'videocall' | 'funnel' | 'vacancywall'
  | 'succession' | 'talent' | 'projectwall'
  | 'agents' | 'auditqueue' | 'risk'
  | 'academy' | 'trainingcal' | 'compliance' | 'charts' | 'workinstr' | 'video' | 'certs' | 'ojt'
  | 'process' | 'reliability' | 'safety' | 'kpis' | 'portfolio';

export interface SpotDef extends Spot { prop: PropKind; screen?: ScreenKind; width?: number; label?: string }

const P = Math.PI;
export const SPOTS: SpotDef[] = [
  // Talent Acquisition Hub
  { id: 'ta_funnel', zone: 'ta', pos: [-40, 10.6], face: P, prop: 'wall', screen: 'funnel', width: 5.4, label: 'Hiring funnel' },
  { id: 'ta_vacancy', zone: 'ta', pos: [-33, 10.6], face: P, prop: 'wall', screen: 'vacancywall', width: 4.2, label: 'Muro de vacantes' },
  { id: 'enrique_desk', zone: 'ta', pos: [-41, 15.5], face: P, prop: 'desk', screen: 'vacancies' },
  { id: 'sheccid_desk', zone: 'ta', pos: [-36.5, 15.5], face: P, prop: 'desk', screen: 'calendar' },
  { id: 'alondra_desk', zone: 'ta', pos: [-32, 15.5], face: P, prop: 'desk', screen: 'videocall' },
  { id: 'ta_interview', zone: 'ta', pos: [-41, 21.6], face: P, prop: 'none', label: 'Sala de entrevistas' },
  // Organizational Development Lab
  { id: 'od_succession', zone: 'od', pos: [-17, 10.6], face: P, prop: 'wall', screen: 'succession', width: 5.2, label: 'Matriz de sucesión' },
  { id: 'maribel_desk', zone: 'od', pos: [-19.5, 18.5], face: P, prop: 'desk', screen: 'talent' },
  { id: 'od_orgchart', zone: 'od', pos: [-13, 20.2], face: P, prop: 'none', label: 'Organigrama vivo' },
  // War Room
  { id: 'war_wall', zone: 'war', pos: [1, 10.6], face: P, prop: 'wall', screen: 'projectwall', width: 5.8, label: 'Muro de proyectos' },
  // AI Lab
  { id: 'nexus_desk', zone: 'ai', pos: [16.5, 17], face: P, prop: 'desk', screen: 'agents' },
  { id: 'nexus_graph', zone: 'ai', pos: [22.5, 20.6], face: P, prop: 'none', label: 'Knowledge graph' },
  { id: 'nexus_pipeline', zone: 'ai', pos: [24.5, 12.4], face: P, prop: 'none', label: 'Pipeline de documentos' },
  // Quality & Audit
  { id: 'aegis_wall', zone: 'audit', pos: [39, 10.6], face: P, prop: 'wall', screen: 'risk', width: 5, label: 'Matriz de riesgos' },
  { id: 'aegis_desk', zone: 'audit', pos: [39, 19.5], face: P, prop: 'desk', screen: 'auditqueue' },
  { id: 'aegis_line', zone: 'audit', pos: [36.2, 15.6], face: P, prop: 'none', label: 'Línea de auditoría' },
  // Learning & Development Center
  { id: 'alex_roadmap', zone: 'ld', pos: [-40, -21.4], face: P, prop: 'wall', screen: 'academy', width: 6, label: 'Roadmap de academias' },
  { id: 'alejandro_cal', zone: 'ld', pos: [-33, -21.4], face: P, prop: 'wall', screen: 'trainingcal', width: 5, label: 'Calendario de capacitación' },
  { id: 'diana_wall', zone: 'ld', pos: [-26.5, -21.4], face: P, prop: 'wall', screen: 'compliance', width: 5, label: 'Cumplimiento' },
  { id: 'ld_class', zone: 'ld', pos: [-17.5, -21.4], face: P, prop: 'wall', screen: 'video', width: 6, label: 'Aula: Safety training' },
  { id: 'ld_certs', zone: 'ld', pos: [-4.8, -21.4], face: P, prop: 'wall', screen: 'certs', width: 3.4, label: 'Muro de certificaciones' },
  { id: 'alex_desk', zone: 'ld', pos: [-42, -13], face: P, prop: 'desk', screen: 'academy' },
  { id: 'alejandro_desk', zone: 'ld', pos: [-38, -13], face: P, prop: 'desk', screen: 'trainingcal' },
  { id: 'diana_desk', zone: 'ld', pos: [-34, -13], face: P, prop: 'desk', screen: 'charts' },
  { id: 'emma_desk', zone: 'ld', pos: [-30, -13], face: P, prop: 'desk', screen: 'workinstr' },
  { id: 'uziel_desk', zone: 'ld', pos: [-26, -13], face: P, prop: 'desk', screen: 'ojt' },
  { id: 'ld_ojt', zone: 'ld', pos: [-20, -9.6], face: P, prop: 'none', label: 'Zona OJT' },
  { id: 'ld_heights', zone: 'ld', pos: [-10.5, -12.4], face: P, prop: 'none', label: 'Trabajo en alturas' },
  { id: 'ld_maint', zone: 'ld', pos: [-5.2, -9.8], face: P, prop: 'none', label: 'Maintenance Academy' },
  { id: 'ld_leader', zone: 'ld', pos: [-42.5, -8.8], face: P, prop: 'none', label: 'Liderazgo' },
  // Industrial Operations Room
  { id: 'atlas_wall', zone: 'ops', pos: [12, -21.4], face: P, prop: 'wall', screen: 'process', width: 7, label: 'Cadena de proceso' },
  { id: 'ops_rel', zone: 'ops', pos: [19.5, -21.4], face: P, prop: 'wall', screen: 'reliability', width: 6, label: 'Confiabilidad' },
  { id: 'ops_safety', zone: 'ops', pos: [26, -21.4], face: P, prop: 'wall', screen: 'safety', width: 4.5, label: 'Seguridad' },
  { id: 'atlas_desk', zone: 'ops', pos: [10, -14.5], face: P, prop: 'desk', screen: 'kpis' },
  { id: 'atlas_furnace', zone: 'ops', pos: [24, -9.6], face: P, prop: 'none', label: 'Horno de arco eléctrico' },
  // PMO tower
  { id: 'pmo_console', zone: 'pmo', pos: [0, 4.2], face: P, prop: 'none', label: 'Consola PMO' },
  { id: 'pmo_side', zone: 'pmo', pos: [-4.3, 1.6], face: P / 2 + 0.35, prop: 'none' },
];

export const spotById = (id: string) => {
  const s = SPOTS.find((x) => x.id === id);
  if (!s) throw new Error(`spot ${id}`);
  return s;
};

// War-room table seats (8). Agents sit on both long sides facing the table.
export const WAR_TABLE = { x: 2, z: 16.4, w: 6.4, d: 2.4 };
export const MEETING_SEATS: Spot[] = [-0.6, 1.2, 2.8, 4.6].flatMap((dx, i) => [
  { id: `seat_s${i}`, zone: 'war' as ZoneId, pos: [WAR_TABLE.x - 2 + dx, WAR_TABLE.z - 1.9] as [number, number], face: 0 },
  { id: `seat_n${i}`, zone: 'war' as ZoneId, pos: [WAR_TABLE.x - 2 + dx, WAR_TABLE.z + 1.9] as [number, number], face: P },
]);

// The Director overlooks the floor from the mezzanine on top of the PMO tower.
export const MEZZANINE_Y = 5.6;
