/**
 * Banderas de funciones. El asistente «Pregunta a Acería AI» está OCULTO en el piloto por el VETO de Seguridad
 * (ADX-04, docs/reviews/review-seguridad.md §8.11, opción B). Solo se activa en una segunda liberación,
 * después de §8.11-D, una ronda ADX-RED de 20 preguntas y la firma de ADX-04: build con VITE_ASSISTANT=on.
 */
export const ASSISTANT_ENABLED = import.meta.env.VITE_ASSISTANT === 'on';
