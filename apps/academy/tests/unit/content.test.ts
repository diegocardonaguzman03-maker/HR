import { describe, expect, it } from 'vitest';
import nodes from '../../public/models/eaf.nodes.json';
import { ContentBundle, crossCheck, emptyMarks, isSmeRequired, type ContentBundleT } from '../../src/lib/content/schema';
import { raw } from '../../src/lib/content';

const bundle = ContentBundle.parse(raw);
const clone = (): ContentBundleT => structuredClone(bundle);

describe('contenido', () => {
  it('cumple el esquema y no tiene referencias rotas (incluye nodos 3D)', () => {
    expect(crossCheck(bundle, new Set(nodes as string[]))).toEqual([]);
  });
  it('MVP completo: 1 etapa MVP, sistema de electrodos, 1 WI, módulo de seguridad, 1 evaluación, video y documento descargable', () => {
    expect(bundle.processes.find((p) => p.id === 'stage.melt')).toBeTruthy();
    expect(bundle.equipment.find((e) => e.id === 'eq.electrodes')).toBeTruthy();
    expect(bundle.workInstructions).toHaveLength(1);
    expect(bundle.training.find((m) => m.id === 'mod.eaf-energy-safety')).toBeTruthy();
    expect(bundle.assessments).toHaveLength(1);
    expect(bundle.videos.length).toBeGreaterThan(0);
    expect(bundle.documents.length).toBeGreaterThan(0);
  });
  it('nada está PLANT_APPROVED en el MVP (regla de seguridad)', () => {
    const all = [...bundle.sources, ...bundle.processes, ...bundle.equipment, ...bundle.hazards, ...bundle.workInstructions, ...bundle.training, ...bundle.documents, ...bundle.videos, ...bundle.assessments, ...bundle.glossary.map((g) => ({ id: g.term, status: g.status }))];
    expect(all.filter((x) => x.status === 'PLANT_APPROVED').map((x) => x.id)).toEqual([]);
  });
  it('crossCheck bloquea PLANT_APPROVED en cualquier colección (SAF-16)', () => {
    const cols = ['sources', 'processes', 'equipment', 'hazards', 'workInstructions', 'training', 'assessments', 'documents', 'videos', 'glossary'] as const;
    for (const col of cols) {
      const c = clone();
      (c[col][0] as { status: string }).status = 'PLANT_APPROVED';
      expect(crossCheck(c).some((e) => /PLANT_APPROVED no permitido/.test(e)), col).toBe(true);
    }
    const d = clone(); d.documents[0].status = 'PLANT_APPROVED'; d.documents[0].approvalDate = '2026-10-01';
    expect(crossCheck(d).some((e) => /PLANT_APPROVED no permitido/.test(e)), 'con fecha tampoco').toBe(true);
  });
  it('preguntas críticas y no calificadas son subconjuntos de la evaluación y sus ítems no se practican en lecciones (TRN-01 / TRN-02)', () => {
    const a = bundle.assessments[0];
    expect(a.criticalQuestionIds.length).toBeGreaterThan(0);
    const c = clone(); c.assessments[0].criticalQuestionIds = [...a.criticalQuestionIds, 'q.no-existe'];
    expect(crossCheck(c)).toContain(`${a.id}: criticalQuestionIds incluye q.no-existe, que no está en questionIds`);
    const u = clone(); u.assessments[0].unscoredQuestionIds = ['q.no-existe'];
    expect(crossCheck(u).some((e) => /unscoredQuestionIds incluye q.no-existe/.test(e))).toBe(true);
    const scored = a.questionIds.find((q) => !a.unscoredQuestionIds.includes(q))!;
    const o = clone(); o.training[0].lessons[0].checkIds.push(scored);
    expect(crossCheck(o).some((e) => e.includes(`${scored} ya aparece como ejercicio`))).toBe(true);
  });
  it('rechaza marcas SME_REQUIRED vacías (§3.7)', () => {
    expect(emptyMarks(bundle)).toEqual([]);
    expect(emptyMarks({ t: 'Pasos de LOTO: SME_REQUIRED:' })).toHaveLength(1);
    expect(emptyMarks({ t: 'SME_REQUIRED (C-07)' })).toHaveLength(1);
    expect(emptyMarks({ t: 'SME_REQUIRED: tabla de taps; la dan la OEM y C-07' })).toHaveLength(0);
    const c = clone(); c.hazards[0].permit = 'SME_REQUIRED:';
    expect(crossCheck(c).some((e) => /marca SME_REQUIRED vacía/.test(e))).toBe(true);
  });
  it('los campos de planta de cada peligro están marcados SME_REQUIRED (no inventados)', () => {
    for (const h of bundle.hazards) {
      for (const f of [h.exclusionZone, h.interlock, h.permit, h.escalation]) expect(isSmeRequired(f) || f.includes('SME_REQUIRED'), `${h.id}: ${f}`).toBe(true);
      expect(h.stopCondition).toContain('SME_REQUIRED');
    }
  });
  it('los valores de variables de proceso no traen cifras de planta sin marca', () => {
    for (const p of bundle.processes) for (const v of p.variables) expect(v.value, `${p.id} · ${v.name}`).toMatch(/SME_REQUIRED|PLACEHOLDER/);
  });
  it('cada hotspot apunta a un equipo existente', () => {
    const eq = new Set(bundle.equipment.map((e) => e.id));
    for (const h of bundle.hotspots) expect(eq.has(h.targetId)).toBe(true);
  });
});
