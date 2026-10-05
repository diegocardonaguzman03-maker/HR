/** Carga y valida misiones, escenarios y cursos (src/content/missions/*.json). */
import { Course, Mission, ProcedureDocs, SceneDef, checkMission, type CourseT, type MissionT, type ProcedureDocsT, type SceneDefT } from './schema';
import heights from '../content/missions/heights-prep.json';
import sceneHeights from '../content/missions/scene-heights.json';
import courseHeights from '../content/missions/course-heights.json';
import loto from '../content/missions/loto-01.json';
import sceneLoto from '../content/missions/scene-loto.json';
import courseLoto from '../content/missions/course-loto.json';

const scenes: Record<string, SceneDefT> = {};
for (const s of [sceneHeights, sceneLoto]) { const p = SceneDef.parse(s); scenes[p.id] = p; }
export const missions: Record<string, MissionT> = {};
for (const m of [heights, loto]) {
  const p = Mission.parse(m);
  const errs = checkMission(p, scenes[p.sceneId]);
  if (errs.length) console.warn(`Misión ${p.id} con errores:`, errs);
  missions[p.id] = p;
}
export const courses: CourseT[] = [Course.parse(courseHeights), Course.parse(courseLoto)];
export const sceneFor = (m: MissionT) => scenes[m.sceneId];
export const rawMissionContent = { missions: [heights, loto], scenes: [sceneHeights, sceneLoto], courses: [courseHeights, courseLoto] };

/** Documentos descargables de cada procedimiento (Instrucción de trabajo, Manual operativo, Checklist). */
const docModules = import.meta.glob('../content/missions/docs-*.json', { eager: true, import: 'default' });
export const procedures: ProcedureDocsT[] = Object.values(docModules).map((d) => ProcedureDocs.parse(d)).sort((a, b) => a.title.localeCompare(b.title));
export const docsForMission = (missionId: string) => procedures.find((p) => p.missionId === missionId);
