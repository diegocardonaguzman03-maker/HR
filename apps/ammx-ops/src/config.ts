// Single place to change who the Director is. The two source prompts disagree (Diego Cardona vs.
// Francisco Cardona); this app follows its own master prompt. See equipo-ammx/conciliacion-de-prompts.md #1.
export const DIRECTOR = {
  name: 'Francisco Cardona',
  first: 'Francisco',
  title: 'Director Talent Acquisition & Organizational Development',
  company: 'ArcelorMittal México',
};

export const DEMO_NOTICE =
  'Simulación con datos ilustrativos. Proyectos y pendientes vienen de la cartera del equipo (equipo-ammx/); actividad, avances y KPI son simulados.';

export const SIM_START_MIN = 8 * 60; // 08:00
