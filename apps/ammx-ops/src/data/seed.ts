import type { Alert, Decision } from '../types';

// Alerts from the portfolio are facts of the team's board. "Ilustrativa" alerts are the examples
// requested in the app brief; they carry no real figure from ArcelorMittal.
export const SEED_ALERTS: Alert[] = [
  { id: 'a1', level: 'critical', text: 'SAFETS cierra en diciembre 2026: preparar cierre, evidencia y continuidad 2027.', source: 'Cartera', target: { kind: 'project', id: 'C2' }, at: 0 },
  { id: 'a2', level: 'critical', text: 'Integridad de datos (P3): no conformidades de auditoría sin fecha de cierre.', source: 'Cartera', target: { kind: 'project', id: 'C9' }, at: 0 },
  { id: 'a3', level: 'attention', text: 'Diplomado de mantenimiento bloqueado: espera respuesta del Director de Mantenimiento.', source: 'Cartera', target: { kind: 'project', id: 'C5' }, at: 0 },
  { id: 'a4', level: 'attention', text: 'Revisión NAFTA del Succession Plan sin fecha confirmada.', source: 'Cartera', target: { kind: 'project', id: 'D1' }, at: 0 },
  { id: 'a5', level: 'attention', text: 'Uziel lleva 5 proyectos y 2 propuestos: revisar carga.', source: 'Cartera', target: { kind: 'agent', id: 'uziel' }, at: 0 },
  { id: 'a6', level: 'attention', text: '10 confirmaciones del arranque pendientes del Director.', source: 'Cartera', target: { kind: 'project', id: 'MOD' }, at: 0 },
  { id: 'a7', level: 'critical', text: '3 vacantes críticas con más de 60 días abiertas.', source: 'Ilustrativa', target: { kind: 'zone', id: 'ta' }, at: 0 },
  { id: 'a8', level: 'attention', text: '12 certificaciones de capacitación por vencer.', source: 'Ilustrativa', target: { kind: 'agent', id: 'alejandro' }, at: 0 },
  { id: 'a9', level: 'attention', text: '2 posiciones de sucesión sin sucesor listo.', source: 'Ilustrativa', target: { kind: 'project', id: 'D1' }, at: 0 },
  { id: 'a10', level: 'attention', text: 'Hito de Maintenance & Reliability Academy retrasado.', source: 'Ilustrativa', target: { kind: 'project', id: 'C5' }, at: 0 },
  { id: 'a11', level: 'info', text: 'Un documento de la AI Knowledge Platform está fuera de vigencia.', source: 'Ilustrativa', target: { kind: 'project', id: 'X1' }, at: 0 },
  { id: 'a12', level: 'done', text: 'Módulo de tareas puntuales entregado (T-2610-001).', source: 'Cartera', target: { kind: 'project', id: 'MOD' }, at: 0 },
];

// Pending decisions recorded in equipo-ammx/memoria/decisiones-de-diego.md.
export const SEED_DECISIONS: Decision[] = [
  { id: 'dc1', title: 'Cobertura del instructor experto en sitio', project: 'C7', source: 'Cartera',
    context: 'La propuesta para Logística Interna no puede pasar a aprobación interna sin definir la cobertura.',
    options: ['A) Un turno fijo (día)', 'B) Rotativo con la cuadrilla', 'C) Turno fijo en piloto de 8–12 semanas y decidir después'],
    recommendation: 'C. ATLAS: validar con Operaciones del sitio si la acería trabaja con cuadrillas rotativas.' },
  { id: 'dc2', title: 'Versión impresa del Playbook del nuevo ingreso', project: 'C1', source: 'Cartera',
    context: 'El Playbook (33 pp.) está listo en digital; falta decidir la versión impresa con fotografía.',
    options: ['A) Impresa con sesión de fotografía propia', 'B) Solo digital', 'C) Impresa con activos de marca existentes'],
    recommendation: 'C, para no detener P1 por la fotografía.' },
  { id: 'dc3', title: 'Cadencias automáticas del brief', project: 'MOD', source: 'Cartera',
    context: 'El equipo solo trabaja cuando el Director lo invoca.',
    options: ['A) Invocar el brief a mano', 'B) Rutina programada lunes, jueves y viernes', 'C) A las 2 semanas pasar de A a B'],
    recommendation: 'C, cuando el tablero tenga fechas reales.' },
  { id: 'dc4', title: '10 confirmaciones del arranque', project: 'MOD', source: 'Cartera',
    context: 'Principal, sitios, sistemas, proveedor del diplomado, reparto Emma/Uziel, dueños de proyectos nuevos, cifras históricas, términos, fechas críticas y Observaciones de Oro.',
    options: ['A) Responder ahora', 'B) Agendar para el lunes'], recommendation: 'A: desbloquea fechas y dueños de 8 proyectos.' },
];

// Collaboration meetings the simulation rotates through (teams from the portfolio).
export const MEETINGS = [
  { project: 'C5', title: 'Maintenance & Reliability Academy', members: ['alex', 'emma', 'uziel', 'diana', 'atlas', 'aegis'], outcome: 'acordó el marco de competencias por grupo y la dependencia con Operaciones' },
  { project: 'C1', title: 'Onboarding Transformation', members: ['alex', 'emma', 'enrique', 'sheccid', 'diana'], outcome: 'cerró la lista de contactos por área pendiente del Playbook' },
  { project: 'D1', title: 'Succession Planning', members: ['maribel', 'enrique', 'alondra', 'aegis'], outcome: 'revisó brechas de readiness antes del paquete para Cynthia' },
  { project: 'X1', title: 'AI Knowledge Platform', members: ['alex', 'nexus', 'atlas', 'aegis'], outcome: 'definió los metadatos mínimos de control documental' },
  { project: 'D4', title: 'Quality Circles', members: ['maribel', 'atlas', 'uziel'], outcome: 'seleccionó áreas candidatas para el piloto' },
  { project: 'R4', title: 'Costura reclutamiento–onboarding', members: ['enrique', 'alex', 'sheccid', 'emma'], outcome: 'mapeó la entrega del contratado a la cohorte de lunes' },
];

export const KPIS = [
  { label: 'Vacantes abiertas', value: '38', trend: '+3', bad: true },
  { label: 'Tiempo de cobertura', value: '47 d', trend: '−2 d', bad: false },
  { label: 'Cumplimiento de capacitación', value: '86 %', trend: '+1 pt', bad: false },
  { label: 'DC-3 pendientes', value: '124', trend: '+9', bad: true },
  { label: 'Cobertura de sucesión', value: '62 %', trend: '=', bad: false },
  { label: 'Horas por persona (año)', value: '31 h', trend: '+2 h', bad: false },
];
