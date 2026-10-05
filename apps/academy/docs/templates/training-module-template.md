# Plantilla — Módulo de entrenamiento (ACERÍA DIGITAL ACADEMY)

> Dueño: ADX-07 Learning Designer. Se captura en `src/content/training.json` (tipo `TrainingModule` de `src/lib/content/schema.ts`). Las preguntas van en `questions.json` y la evaluación en `assessments.json`.
> Esta plataforma apoya el aprendizaje y **no certifica competencia**: la competencia la certifica un evaluador en piso con el procedimiento aprobado de la planta.

## 1. Ficha del módulo
| Campo | Valor | Regla |
|---|---|---|
| `id` | `mod.<tema>` | Del catálogo de `content-schema.md` o con el mismo patrón |
| `title` | | Corto, en español de México |
| `summary` | | 1–2 frases: qué aprende el alumno y para qué |
| `levels` | `[1, 2, 3]` | 1 Comprender · 2 Identificar · 3 Explicar · 4 Demostrar · 5 Ejecutar bajo supervisión (4–5 solo con OJT y evaluador en piso) |
| `durationMin` | | Minutos estimados (microlearning: 3–7 min por lección) |
| `objectives` | | 3–5 objetivos con verbo observable (identificar, ordenar, explicar, reconocer) |
| `workInstructionIds` | `wi.*` | Solo instrucciones existentes en `work-instructions.json` |
| `assessmentId` | `asm.*` | Opcional |
| `status` | `GENERAL_EDUCATIONAL` / `DEMO` / `DRAFT_NOT_VALIDATED` / `SME_REQUIRED` | `PLANT_APPROVED` está prohibido en el MVP |
| `sourceIds` | `src.*` | Toda pieza cita su fuente |

## 2. Lecciones (3–6 por módulo)
| Campo | Regla |
|---|---|
| `id` | `les.<módulo-sin-prefijo>-<n>` (p. ej. `les.electrode-melting-1`) |
| `title` | Pregunta o idea clave |
| `stageId` | Opcional: `stage.raw`, `stage.charge`, `stage.melt`, `stage.refine`, `stage.tap`, `stage.secondary` |
| `focus` | Nodos 3D a resaltar, solo de `docs/nodos-3d.md` (`eaf__arms`, `eaf__arms_clamp`, …) |
| `camera` | Opcional `{ "position": [x,y,z], "target": [x,y,z] }` en metros. Referencias: horno en el origen (radio ≈ 3.2 m, bóveda ≈ 5 m), transformador x ≈ −9, púlpito z ≈ +10, EBT x ≈ +4 |
| `body` | 2–4 párrafos cortos (≤ 2 frases cada uno) |
| `keyPoints` | 2–4 ideas para recordar |
| `checkIds` | 0–2 preguntas `q.*` de control de conocimiento |

## 3. Preguntas (`questions.json`)
| `kind` | Campos propios | Uso recomendado |
|---|---|---|
| `mcq` | `options[]`, `answer` (índice desde 0) | Conceptos y conducta segura (escenarios) |
| `identify` | `answerEquipmentId` (`eq.*`) | El alumno hace clic en el equipo correcto del 3D |
| `order` | `items[]` (≥ 3, en desorden), `correctOrder[]` (índices de `items` en el orden correcto) | Etapas del proceso, ruta de la energía (nunca secuencias críticas de planta) |
| `match` | `pairs[{left,right}]` (≥ 2) | Componente ↔ función, peligro ↔ control general |

Todas llevan `id` (`q.<tema>-<n>`), `prompt`, `topic` (se usa para recomendaciones), `level` y `explanation` (por qué es correcta, en lenguaje sencillo).

## 4. Evaluación (`assessments.json`)
- `passScore` (0–1), 8–10 `questionIds`, y `recommendations` que ligan cada `topic` con el `moduleId` que se debe repasar.
- El título o el resumen dice que **no certifica competencia**.

## 5. Lista de verificación antes de entregar
- [ ] Sin límites, setpoints, temperaturas, presiones, adiciones, parámetros de vaciado, pasos de LOTO, enclavamientos ni secuencias críticas inventados. Donde hagan falta: `SME_REQUIRED: <dato> (<quién lo da>)`.
- [ ] Se distingue contenido educativo general de instrucción aprobada de planta.
- [ ] Contexto GASM (D-010) correcto: ≈ 95–100 % DRI (HYL y Midrex) por bandas y 5.º agujero; retornos ≤ 5 %; sin chatarra comprada.
- [ ] Preguntas de seguridad con la conducta «detener, alejarse y avisar».
- [ ] Todos los IDs existen (`npm run check:content` sin errores).
- [ ] Revisión cruzada: metalurgia/operación (ADX-02/03), seguridad con veto (ADX-04), UX (ADX-08) y Validation Board (`docs/validation-checklist.md`).
