/** Carga y valida misiones, escenarios y cursos (src/content/missions/*.json). */
import { Course, Mission, SceneDef, checkMission, type CourseT, type MissionT, type SceneDefT } from './schema';
import heights from '../content/missions/heights-prep.json';
import sceneHeights from '../content/missions/scene-heights.json';
import courseHeights from '../content/missions/course-heights.json';

const scenes: Record<string, SceneDefT> = {};
for (const s of [sceneHeights]) { const p = SceneDef.parse(s); scenes[p.id] = p; }
export const missions: Record<string, MissionT> = {};
for (const m of [heights]) {
  const p = Mission.parse(m);
  const errs = checkMission(p, scenes[p.sceneId]);
  if (errs.length) console.warn(`Misión ${p.id} con errores:`, errs);
  missions[p.id] = p;
}
export const courses: CourseT[] = [Course.parse(courseHeights)];
export const sceneFor = (m: MissionT) => scenes[m.sceneId];
export const rawMissionContent = { missions: [heights], scenes: [sceneHeights], courses: [courseHeights] };
