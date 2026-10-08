import type { AgentDef } from '../types';

// Agents named after people represent the ROLE, never the person (equipo-ammx/prompt-maestro.md 1.3).
// Scripts are what each agent visibly does in the simulation; every activity is tied to a real
// project of the team's portfolio (equipo-ammx/cartera/cartera-de-proyectos.md).
export const AGENTS: AgentDef[] = [
  {
    id: 'enrique', name: 'Enrique', role: 'Gerente de Reclutamiento', zone: 'ta', virtual: false,
    shirt: '#2f5d9b', pants: '#2a2f38', skin: '#c99a76', hair: '#2b211b', hairStyle: 'short', height: 1.0,
    focus: 'Operación de reclutamiento disciplinada, rápida y medible.',
    script: [
      { spot: 'enrique_desk', minutes: 40, status: 'working', anim: 'type', task: 'Primera versión de las 14 plantillas de comunicación', project: 'R1', next: 'Plantillas v1 para la sesión con Oracle / TI', feed: 'Enrique avanzó la versión 1 de las plantillas de comunicación para Oracle.' },
      { spot: 'ta_funnel', minutes: 25, status: 'analyzing', anim: 'screen', task: 'Revisión semanal de envejecimiento de vacantes', project: 'R6', next: 'Reporte de vacantes con interpretación ejecutiva', feed: 'Enrique revisó el envejecimiento de vacantes en el funnel.' },
      { spot: 'ta_vacancy', minutes: 20, status: 'working', anim: 'present', task: 'Mapa de entrega del contratado al onboarding', project: 'R4', next: 'Mapa de la costura reclutamiento–onboarding', feed: 'Enrique trabajó el mapa de entrega reclutamiento → onboarding con Alex.' },
    ],
  },
  {
    id: 'sheccid', name: 'Sheccid', role: 'Reclutadora · operación y experiencia del candidato', zone: 'ta', virtual: false,
    shirt: '#c2410c', pants: '#1f2937', skin: '#d8a988', hair: '#1c1410', hairStyle: 'long', height: 0.95,
    focus: 'Primero la ejecución: ninguna vacante estancada sin responsable ni fecha.',
    script: [
      { spot: 'sheccid_desk', minutes: 35, status: 'working', anim: 'type', task: 'Agenda de entrevistas y seguimiento a candidatos', project: 'R3', next: 'Lista de posiciones estancadas con siguiente acción', feed: 'Sheccid actualizó la agenda de entrevistas de la semana.' },
      { spot: 'ta_interview', minutes: 20, status: 'meeting', anim: 'talk', task: 'Coordinación de entrevista en sala', project: 'R3', next: 'Retroalimentación al candidato', feed: 'Sheccid coordinó una entrevista en la sala de TA.' },
      { spot: 'ta_funnel', minutes: 15, status: 'analyzing', anim: 'screen', task: 'Higiene de datos del ATS', project: 'R6', next: 'Datos limpios para el tablero', feed: 'Sheccid depuró estatus de candidatos en el ATS.' },
    ],
  },
  {
    id: 'alondra', name: 'Alondra', role: 'Reclutadora · intake y sourcing', zone: 'ta', virtual: false,
    shirt: '#0f766e', pants: '#334155', skin: '#e0b394', hair: '#4a2f21', hairStyle: 'bun', height: 0.96,
    focus: 'Intake completo y radar externo de talento.',
    script: [
      { spot: 'alondra_desk', minutes: 30, status: 'meeting', anim: 'phone', task: 'Intake con hiring manager (ALINEA / R.E.T.A.)', project: 'R2', next: 'Formato de intake completo', feed: 'Alondra hizo un intake por videollamada con un hiring manager.' },
      { spot: 'alondra_desk', minutes: 25, status: 'analyzing', anim: 'type', task: 'Mapa de talento para perfiles técnicos escasos', project: 'R2', next: 'Longlist anónima por familia de puesto', feed: 'Alondra avanzó el mapa de talento de perfiles técnicos.' },
      { spot: 'ta_vacancy', minutes: 15, status: 'working', anim: 'present', task: 'Adopción de la Guía para hiring managers', project: 'R3', next: 'Plan de difusión de la guía', feed: 'Alondra preparó el plan de difusión de la Guía para hiring managers.' },
    ],
  },
  {
    id: 'alex', name: 'Alex', role: 'Gerente de Capacitación', zone: 'ld', virtual: false,
    shirt: '#002B5C', pants: '#2b2f36', skin: '#c48f6b', hair: '#1e1a17', hairStyle: 'short', height: 1.02,
    focus: 'De función administrativa a sistema de control del riesgo operativo.',
    script: [
      { spot: 'alex_roadmap', minutes: 30, status: 'working', anim: 'present', task: 'Arquitectura de academias (incluye Maintenance & Reliability)', project: 'C12', next: 'Marco de competencias de la academia', feed: 'Alex revisó el roadmap de academias.' },
      { spot: 'alex_desk', minutes: 30, status: 'working', anim: 'type', task: 'Cierre de pendientes del Playbook de onboarding', project: 'C1', next: 'Playbook con contactos por área', feed: 'Alex avanzó los pendientes del Playbook del nuevo ingreso.' },
      { spot: 'alex_desk', minutes: 15, status: 'waiting', anim: 'idle', task: 'Instructor experto en sitio: cobertura por definir', project: 'C7', next: 'Propuesta lista al decidir cobertura', feed: 'Alex dejó lista la decisión de cobertura del instructor experto (C7).' },
    ],
  },
  {
    id: 'alejandro', name: 'Alejandro', role: 'Analista · registros y operación', zone: 'ld', virtual: false,
    shirt: '#4b5563', pants: '#1f2937', skin: '#b98563', hair: '#151110', hairStyle: 'short', height: 0.99,
    focus: 'Registros completos y evidencias listas para auditoría.',
    script: [
      { spot: 'alejandro_cal', minutes: 25, status: 'working', anim: 'present', task: 'Calendario de cursos y convocatorias', project: 'C9', next: 'Calendario del mes con instructores', feed: 'Alejandro coordinó el calendario de capacitación.' },
      { spot: 'alejandro_desk', minutes: 35, status: 'analyzing', anim: 'type', task: 'Conciliación de registros entre AMU, IMaS y 360Learning', project: 'C9', next: 'Lista de no conformidades con fecha de cierre', feed: 'Alejandro concilió registros entre plataformas.' },
      { spot: 'ld_certs', minutes: 15, status: 'working', anim: 'inspect', task: 'Vencimientos y evidencias de certificaciones', project: 'C14', next: 'Reporte de vencimientos', feed: 'Alejandro revisó vencimientos en el muro de certificaciones.' },
      { spot: 'alejandro_campus', minutes: 25, status: 'working', anim: 'talk', task: 'Listas de asistencia con las practicantes del campus', project: 'C9', next: 'Listas conciliadas para DC-3', feed: 'Alejandro revisó con las practicantes las listas de asistencia del campus.' },
    ],
  },
  {
    id: 'diana', name: 'Diana', role: 'Analista · indicadores, plataformas y buzón', zone: 'ld', virtual: false,
    shirt: '#7c3aed', pants: '#27272a', skin: '#e3b899', hair: '#3b2418', hairStyle: 'long', height: 0.95,
    focus: 'Indicadores conectados con seguridad, disponibilidad y calidad, no métricas de vanidad.',
    script: [
      { spot: 'diana_wall', minutes: 30, status: 'analyzing', anim: 'screen', task: 'Tablero de cumplimiento de capacitación', project: 'C9', next: 'Tablero mensual con interpretación', feed: 'Diana actualizó el tablero de cumplimiento de capacitación.' },
      { spot: 'diana_desk', minutes: 25, status: 'working', anim: 'type', task: 'Solicitudes del buzón de Capacitación', project: 'C11', next: 'Reporte de solicitudes abiertas', feed: 'Diana clasificó solicitudes del buzón de Capacitación.' },
      { spot: 'diana_desk', minutes: 20, status: 'analyzing', anim: 'type', task: 'Asistencia y aprobación de SAFETS por sitio', project: 'C2', next: 'Indicadores SAFETS por sitio', feed: 'Diana analizó la asistencia de SAFETS por sitio.' },
    ],
  },
  {
    id: 'emma', name: 'Emma', role: 'Especialista · diseño instruccional', zone: 'ld', virtual: false,
    shirt: '#db2777', pants: '#334155', skin: '#efc6a6', hair: '#7a4a2a', hairStyle: 'bun', height: 0.94,
    focus: 'Cómo se aprende: rutas, onboarding y material de OJT.',
    script: [
      { spot: 'emma_desk', minutes: 35, status: 'working', anim: 'type', task: 'Rutas de integración por segmento (30/60/90)', project: 'C1', next: 'Ruta operativa 30/60/90', feed: 'Emma editó la ruta de integración 30/60/90.' },
      { spot: 'ld_ojt', minutes: 25, status: 'working', anim: 'inspect', task: 'Instrucción de trabajo como material de aprendizaje', project: 'C6', next: 'Formato de instrucción de trabajo para OJT', feed: 'Emma trabajó instrucciones de trabajo en la zona OJT.' },
      { spot: 'ld_class', minutes: 15, status: 'analyzing', anim: 'screen', task: 'Lecciones aprendidas de Learning Week 2026', project: 'C10', next: 'Propuesta Learning Week 2027', feed: 'Emma revisó lecciones aprendidas de Learning Week.' },
    ],
  },
  {
    id: 'uziel', name: 'Uziel', role: 'Especialista · técnica, seguridad y piso', zone: 'ld', virtual: false,
    shirt: '#ea580c', pants: '#1e293b', skin: '#b07a55', hair: '#120e0c', hairStyle: 'short', height: 1.01,
    focus: '¿Esto realmente funciona en piso?',
    script: [
      { spot: 'ld_heights', minutes: 30, status: 'working', anim: 'inspect', task: 'Práctica de trabajo en alturas con operadores', project: 'C2', next: 'Evidencia del bloque B1 de SAFETS', feed: 'Uziel condujo práctica de trabajo en alturas.' },
      { spot: 'uziel_desk', minutes: 25, status: 'working', anim: 'type', task: 'Semanas → fechas reales en el deck de gobierno de SAFETS', project: 'C2', next: 'Deck de gobierno con fechas reales y RACI', feed: 'Uziel cambió semanas por fechas en el deck de gobierno de SAFETS.' },
      { spot: 'ld_maint', minutes: 20, status: 'blocked', anim: 'idle', task: 'Diplomado de mantenimiento: espera respuesta de Fernando', project: 'C5', next: 'Ajuste del catálogo según respuesta', feed: 'Uziel reporta: el diplomado de mantenimiento sigue sin respuesta del director.' },
      { spot: 'ld_ojt', minutes: 20, status: 'working', anim: 'talk', task: 'Piloto OJT: puestos, instructor y evidencia', project: 'C6', next: 'Matriz de habilitación del piloto', feed: 'Uziel trabajó con operadores en la zona OJT.' },
      { spot: 'uziel_campus', minutes: 25, status: 'working', anim: 'inspect', task: 'Observación de práctica en el Aula LOTO del campus', project: 'C2', next: 'Evidencia de práctica LOTO', feed: 'Uziel observó la práctica en el Aula LOTO del campus.' },
    ],
  },
  {
    id: 'maribel', name: 'Maribel', role: 'Gerente de Desarrollo Organizacional', zone: 'od', virtual: false,
    shirt: '#6d28d9', pants: '#1f2937', skin: '#d9a47f', hair: '#2a1a12', hairStyle: 'long', height: 0.97,
    focus: 'No hay sucesión sin desarrollo.',
    script: [
      { spot: 'od_succession', minutes: 30, status: 'analyzing', anim: 'screen', task: 'Paquete de sucesión para la revisión NAFTA', project: 'D1', next: 'Paquete para aprobación de Cynthia', feed: 'Maribel actualizó la matriz de sucesión.' },
      { spot: 'maribel_desk', minutes: 30, status: 'working', anim: 'type', task: 'Arquitectura de liderazgo por nivel (70-20-10)', project: 'D2', next: 'Arquitectura supervisor · gerente · director', feed: 'Maribel avanzó la arquitectura del programa de liderazgo.' },
      { spot: 'od_orgchart', minutes: 20, status: 'working', anim: 'inspect', task: 'Gobierno del reconocimiento diario (CERO Héroe)', project: 'D3', next: 'Reglas de gobierno y propuesta de nombre', feed: 'Maribel trabajó las reglas del reconocimiento diario.' },
    ],
  },
  {
    id: 'pmo', name: 'Coordinador · PMO', role: 'Coordinación, tablero y cadencias', zone: 'pmo', virtual: true,
    shirt: '#1e3a5f', pants: '#111827', skin: '#c7a07f', hair: '#3a3a3a', hairStyle: 'short', height: 1.0,
    focus: 'Ningún compromiso sin dueño, fecha y siguiente paso.',
    script: [
      { spot: 'pmo_console', minutes: 30, status: 'working', anim: 'screen', task: 'Tablero de tareas y carga del equipo', project: 'MOD', next: 'Tablero semanal con 3 decisiones', feed: 'PMO actualizó el tablero de la cartera.' },
      { spot: 'pmo_side', minutes: 20, status: 'analyzing', anim: 'screen', task: 'Escaneo de fechas: vencidas y próximas', project: 'MOD', next: 'Recordatorios del jueves', feed: 'PMO revisó fechas críticas y dependencias.' },
    ],
  },
  {
    id: 'atlas', name: 'ATLAS', role: 'Experto de Operaciones · acero y minería', zone: 'ops', virtual: true,
    shirt: '#7f1d1d', pants: '#1c1917', skin: '#b58a6a', hair: '#4a4a4a', hairStyle: 'short', height: 1.03,
    focus: 'Que todo tenga sentido en el piso de planta y en la mina.',
    script: [
      { spot: 'atlas_wall', minutes: 25, status: 'analyzing', anim: 'screen', task: 'Validar turnos y cobertura para SAFETS y OJT', project: 'C6', next: 'Dictamen: Alineado / Ajustar', feed: 'ATLAS revisó compatibilidad de la capacitación con los turnos.' },
      { spot: 'atlas_furnace', minutes: 20, status: 'working', anim: 'inspect', task: 'Mapa de proceso para Círculos de Calidad', project: 'D4', next: 'Áreas candidatas al piloto de círculos', feed: 'ATLAS revisó el proceso de acería para el piloto de círculos.' },
      { spot: 'atlas_desk', minutes: 25, status: 'analyzing', anim: 'type', task: 'Diplomado de mantenimiento vs. backlog y MTTR', project: 'C5', next: 'Impacto operativo del diplomado', feed: 'ATLAS conectó el diplomado con MTBF, MTTR y backlog.' },
    ],
  },
  {
    id: 'nexus', name: 'NEXUS', role: 'Arquitecto de IA, datos y digital', zone: 'ai', virtual: true,
    shirt: '#0e7490', pants: '#0f172a', skin: '#c9a184', hair: '#262626', hairStyle: 'none', height: 1.0,
    focus: '¿Cuál es el problema operativo que queremos resolver?',
    script: [
      { spot: 'nexus_pipeline', minutes: 25, status: 'working', anim: 'inspect', task: 'Pipeline de ingesta y control documental', project: 'X1', next: 'Arquitectura de la plataforma de conocimiento', feed: 'NEXUS revisó el pipeline de ingesta de documentos.' },
      { spot: 'nexus_graph', minutes: 20, status: 'analyzing', anim: 'screen', task: 'Fuentes de datos para People Analytics', project: 'X4', next: 'Inventario de fuentes con dueño', feed: 'NEXUS mapeó fuentes de datos para People Analytics.' },
      { spot: 'nexus_desk', minutes: 25, status: 'working', anim: 'type', task: 'Opciones para extender STEELA a México', project: 'D5', next: 'Matriz construir / comprar / extender', feed: 'NEXUS preparó opciones para extender STEELA.' },
    ],
  },
  {
    id: 'aegis', name: 'AEGIS', role: 'Auditor de calidad, riesgo y uso de IA', zone: 'audit', virtual: true,
    shirt: '#065f46', pants: '#111827', skin: '#d1a786', hair: '#5a5a5a', hairStyle: 'short', height: 1.0,
    focus: 'Ningún entregable llega al Director sin pasar la rúbrica.',
    script: [
      { spot: 'aegis_desk', minutes: 30, status: 'analyzing', anim: 'type', task: 'Cola de auditoría (rúbrica de 12 criterios)', project: 'MOD', next: 'Dictamen: Aprobado / Con cambios / Bloqueado', feed: 'AEGIS completó un dictamen de la cola de auditoría.' },
      { spot: 'aegis_line', minutes: 20, status: 'working', anim: 'inspect', task: 'Validación de evidencia y datos', project: 'MOD', next: 'Lista de datos sin fuente', feed: 'AEGIS validó evidencia en la línea de auditoría.' },
      { spot: 'aegis_wall', minutes: 15, status: 'analyzing', anim: 'screen', task: 'Matriz de riesgos de la cartera', project: 'MOD', next: 'Riesgos para el brief del Director', feed: 'AEGIS actualizó la matriz de riesgos.' },
    ],
  },
];

export const agentById = (id: string) => AGENTS.find((a) => a.id === id);

export const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  working: { label: 'Trabajando', color: '#22c55e', dot: '🟢' },
  waiting: { label: 'Esperando', color: '#eab308', dot: '🟡' },
  meeting: { label: 'En reunión', color: '#3b82f6', dot: '🔵' },
  analyzing: { label: 'Analizando', color: '#a855f7', dot: '🟣' },
  blocked: { label: 'Bloqueado', color: '#ef4444', dot: '🔴' },
  available: { label: 'Disponible', color: '#e4e4e7', dot: '⚪' },
};
