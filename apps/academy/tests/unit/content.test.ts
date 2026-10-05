import { describe, expect, it } from 'vitest';
import nodes from '../../public/models/eaf.nodes.json';
import { ContentBundle, crossCheck, isSmeRequired } from '../../src/lib/content/schema';
import { raw } from '../../src/lib/content';

const bundle = ContentBundle.parse(raw);

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
    const all = [...bundle.processes, ...bundle.equipment, ...bundle.hazards, ...bundle.workInstructions, ...bundle.training, ...bundle.documents, ...bundle.videos, ...bundle.assessments];
    expect(all.filter((x) => x.status === 'PLANT_APPROVED').map((x) => x.id)).toEqual([]);
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
