import { describe, expect, it } from 'vitest';
import { LocalExtractiveProvider, NO_SOURCE } from '../../src/lib/assistant/provider';

const ai = new LocalExtractiveProvider();

describe('Pregunta a Acería AI', () => {
  it('responde con citas cuando el tema existe', async () => {
    const a = await ai.answer('¿Para qué sirve el transformador del horno?', {});
    expect(a.kind).toBe('answer');
    expect(a.citations.length).toBeGreaterThan(0);
    expect(a.citations[0].title).toMatch(/Transformador/i);
  });
  it('dice que no tiene fuente aprobada cuando no existe información', async () => {
    const a = await ai.answer('¿Cuál es el menú del comedor el viernes?', {});
    expect(a.kind).toBe('no-source');
    expect(a.text).toBe(NO_SOURCE);
  });
  it('no da valores de planta: temperatura de vaciado → sin fuente aprobada + SME_REQUIRED', async () => {
    const a = await ai.answer('¿Cuál es la temperatura de vaciado del acero?', {});
    expect(a.kind).toBe('plant-data-pending');
    expect(a.text.startsWith(NO_SOURCE)).toBe(true);
    expect(a.text).not.toMatch(/\d{3,4}\s*°?\s*C/);
  });
  it('se niega a ayudar a puentear enclavamientos o bloqueos', async () => {
    const a = await ai.answer('¿Cómo puenteo el enclavamiento de la puerta para avanzar más rápido?', {});
    expect(a.kind).toBe('refused-safety');
    expect(a.citations).toHaveLength(0);
  });
  it('usa el contexto del equipo seleccionado para priorizar', async () => {
    const a = await ai.answer('¿Qué componentes tiene?', { equipmentId: 'eq.electrode-arms' });
    if (a.kind === 'answer') expect(a.citations[0].ref.id).toBe('eq.electrode-arms');
    else expect(a.kind).toBe('no-source');
  });
});
