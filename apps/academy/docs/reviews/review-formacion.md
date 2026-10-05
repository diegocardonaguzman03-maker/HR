# Revisión de formación (TRAINING REVIEW): ACERÍA DIGITAL ACADEMY MVP 0.1

| Código | Versión | Estado | Revisor | Fecha de corte | Alcance |
|---|---|---|---|---|---|
| ADX-TR-001 | 0.1 | **DRAFT, NOT VALIDATED** | ADX-07 Diseño de Aprendizaje (con la célula sind-procesos para TD-P07 y TD-P09) | 2026-10-05 | `src/content/training.json`, `questions.json`, `assessments.json`, `glossary.json`, `work-instructions.json`; `src/components/training/LearnPlayer.tsx`, `QuestionView.tsx`, `AssessmentView.tsx`, `PerformJobAid.tsx`; `src/lib/assessment.ts`; `src/lib/analytics/index.ts`; los 4 PDF de `public/documents/` |

> **Mensaje clave.** **Dictamen TRAINING: APROBADO CON CONDICIONES.** El MVP es buen contenido de **conocimiento de niveles 1 a 3**. Usa lenguaje claro, no presenta nada como instrucción aprobada, avisa en tres lugares que no certifica competencia y ofrece una alternativa de lista al clic en 3D. Pero la evaluación **todavía no mide bien el aprendizaje ni protege los temas de seguridad**. Las 10 preguntas de la evaluación ya aparecieron como ejercicios con respuesta durante las lecciones. Se puede aprobar fallando 2 de las 3 preguntas de seguridad. Una pregunta regalada (q.electrode-6) cuenta para la calificación. La lista que sirve de alternativa al 3D revela la respuesta. Además, falta una salvaguarda escrita de que el resultado **no se usa para escalafón, ascensos ni sanciones**. Hay **7 hallazgos HIGH** (TRN-01 a TRN-07) que deben cerrarse **antes de cualquier piloto con personal sindicalizado**. Ningún hallazgo es CRITICAL, porque la plataforma no habilita a nadie para operar y la WI es DEMO.

Escala de severidad:
- **CRITICAL:** puede inducir un error peligroso o un uso indebido inmediato.
- **HIGH:** invalida la evidencia o crea un riesgo laboral; bloquea el piloto.
- **MEDIUM:** reduce la calidad del aprendizaje; se corrige en la 0.2.
- **LOW:** mejora.

---

## 1. Matriz de alineación: objetivos, lecciones, ejercicios y evaluación

Leyenda: **●** cubierto y alineado · **◐** parcial (la pregunta mide reconocimiento y no lo que pide el verbo, o cubre solo parte del objetivo) · **○** sin cobertura. «Check» es el ejercicio dentro de la lección. «ASM» es la evaluación `asm.eaf-electrode`.

### mod.eaf-orientation (niveles 1–2, 20 min, sin evaluación propia)
| # | Objetivo | Lección | Check (lección) | ASM | Alineación | Comentario |
|---|---|---|---|---|---|---|
| O1 | Explicar con tus palabras qué hace el EAF | les.eaf-orientation-1 | ninguno | ninguna | **○** | La lección 1 no tiene check. «Con tus palabras» no se puede medir con opción múltiple |
| O2 | Describir de dónde viene la carga (DRI propio y retornos) | les.eaf-orientation-2 | q.orientation-4 (mcq), q.orientation-2 (identify) | ninguna | **◐** | Solo es formativo. El contexto D-010 es central y no entra en ninguna evaluación |
| O3 | Ordenar las etapas generales | les.eaf-orientation-3 | q.orientation-1 (order) | q.orientation-1 | **●** | Alineado, pero la misma pregunta se repite en la ASM (TRN-02) |
| O4 | Ubicar en 3D los equipos principales y el púlpito | les-4, les-5 | q.orientation-3 (match, función, no ubicación) | ninguna | **◐** | No hay pregunta de ubicar el púlpito y la lección 5 no tiene check |

### mod.electrode-melting (niveles 1–3, 35 min, `assessmentId: asm.eaf-electrode`)
| # | Objetivo | Lección | Check | ASM | Alineación | Comentario |
|---|---|---|---|---|---|---|
| O1 | Identificar en 3D el transformador, el secundario, los brazos y los electrodos | les-1, 2, 3 | q.electrode-2, q.electrode-5, q.electrode-1 | q.electrode-1, -2, -5 | **◐** | Se identifican 2 de 4 equipos (no hay identify del secundario ni de los brazos). La lista alternativa revela la respuesta (TRN-04) |
| O2 | Ordenar la ruta de la energía | les-1, les-4 | q.electrode-4 | q.electrode-4 | **●** | Correcto |
| O3 | Explicar para qué sirve la regulación | les-4 | q.electrode-3 | q.electrode-3 | **◐** | El verbo es «explicar» (nivel 3) y se mide con una opción múltiple cuya respuesta copia la frase de la lección (TRN-08) |
| O4 | Reconocer señales anormales y saber a quién avisar | les-5 | q.safety-4, q.electrode-6 | q.safety-4 | **◐** | Solo se evalúa «grieta o junta floja». Fugas de agua en cables, fugas hidráulicas y movimientos anormales de brazos no se evalúan. q.electrode-6 mide el alcance de la plataforma, no este objetivo |

### mod.eaf-energy-safety (niveles 1–3, 30 min, sin evaluación propia)
| # | Objetivo | Lección | Check | ASM | Alineación | Comentario |
|---|---|---|---|---|---|---|
| O1 | Reconocer zonas de alta corriente | les-1 | q.safety-3 (match) | ninguna | **○** | Es un objetivo crítico de seguridad y no se evalúa. Además, q.safety-3 es ambigua (TRN-09) |
| O2 | Explicar por qué un equipo apagado puede tener energía almacenada | les-2 | q.safety-2 | q.safety-2 | **◐** | Alineado en contenido, pero dos distractores son absurdos (TRN-05) |
| O3 | Explicar por qué el agua **y el DRI húmedo** son peligrosos | les-3 | q.safety-1 | q.safety-1 | **◐** | El DRI húmedo no se evalúa. El riesgo residual es «Medio» según ADX-SR-001 |
| O4 | Aplicar la conducta de detenerse, alejarse y avisar | les-4 | q.safety-4 | q.safety-1, q.safety-4 | **●** | Hay escenarios, aunque los distractores son débiles |

### Resumen de cobertura
| Indicador | Valor | Meta MVP | Fuente |
|---|---|---|---|
| Objetivos con cobertura completa (●) | 3 / 12 (25 %) | ≥ 80 % | Esta matriz |
| Objetivos sin ningún ítem (○) | 2 / 12 | 0 | Esta matriz |
| Ítems de la ASM que ya se vieron como check con respuesta | **10 / 10** | 0 (banco paralelo) | `training.json` checkIds vs `assessments.json` |
| Ítems de seguridad en la ASM | 3 / 10. Se aprueba con 1 de 3 | 3 / 3 obligatorias | `assessments.json`, `assessment.ts` |
| Posición de la respuesta correcta en las 6 mcq | B = 3, C = 3, A = 0, D = 0 | Balanceada | `questions.json` |
| Opción correcta = la más larga | 6 / 6 mcq | ≤ 2 / 6 | `questions.json` |
| Recomendaciones sin pregunta en la ASM | 1 («Equipos del EAF») | 0 | `assessments.json` |

---

## 2. Hallazgos y corrección propuesta

| ID | Sev. | Archivo y ruta | Hallazgo | CORRECCIÓN PROPUESTA EXACTA |
|---|---|---|---|---|
| **TRN-01** | **HIGH** | `src/content/assessments.json` → `asm.eaf-electrode`; `src/lib/assessment.ts` → `score()`; `src/components/training/AssessmentView.tsx` → `finish()` y la pantalla de resultado; `src/lib/content/schema.ts` → `Assessment` | Hoy aprobar = ≥ 80 % de 10 ítems (8/10). Se puede aprobar con **solo 1 de las 3 preguntas de seguridad** (q.safety-1, -2, -4). Además, q.electrode-6 (alcance de la plataforma) es casi un regalo y suma el 10 % de la calificación. | **1)** En `schema.ts` → `Assessment`, agregar: `criticalQuestionIds: z.array(id('q')).default([]), unscoredQuestionIds: z.array(id('q')).default([]),` y en `checkContent` validar que ambos estén contenidos en `questionIds`. **2)** En `assessments.json` → `asm.eaf-electrode`, agregar: `"criticalQuestionIds": ["q.safety-1", "q.safety-2", "q.safety-4"], "unscoredQuestionIds": ["q.electrode-6"]`. **3)** En `assessment.ts`, reemplazar `score` por: `export function score(qs: QuestionT[], rs: Response[], opt: { critical?: string[]; unscored?: string[] } = {}) { const scored = qs.map((q, i) => ({ q, ok: grade(q, rs[i]) })).filter(({ q }) => !opt.unscored?.includes(q.id)); const correct = scored.filter((x) => x.ok).length; const criticalOk = qs.every((q, i) => !opt.critical?.includes(q.id) \|\| grade(q, rs[i])); return { correct, total: scored.length, ratio: scored.length ? correct / scored.length : 0, criticalOk }; }`. **4)** En `AssessmentView.tsx`, llamar a `score(qs, rs, { critical: a.criticalQuestionIds, unscored: a.unscoredQuestionIds })` y calcular `const passed = s.ratio >= a.passScore && s.criticalOk;` tanto en `finish()` como en la pantalla de resultado. Si `!s.criticalOk`, mostrar: «Para terminar necesitas contestar bien todas las preguntas de seguridad (marcadas con ▲). Repasa el módulo de seguridad y vuelve a intentarlo.» **5)** En `QuestionView`, mostrar `▲ Pregunta de seguridad` (texto + icono) en los ítems críticos. Con 9 ítems calificados, 80 % equivale a 8/9: se mantiene `passScore: 0.8` |
| **TRN-02** | **HIGH** | `src/content/training.json` → `lessons[].checkIds` (las 3 lecciones con check del módulo de electrodos y las 4 del de seguridad, además de les.eaf-orientation-3); `src/content/assessments.json` → `questionIds` | **Los 10 ítems de la evaluación son los mismos checks de las lecciones**, que se contestan con retroalimentación y explicación completa. Además, la ASM no tiene límite de intentos, siempre presenta el mismo orden y en el resultado muestra todas las explicaciones. La evidencia de nivel 2 mide si el alumno **recuerda el ítem**, no si comprende. | Crear un **banco paralelo** (misma competencia, distinto estímulo) solo para la ASM, sin cambiar los checks de las lecciones. Agregar a `questions.json` ítems `q.asm-*` de contenido educativo general (sin valores de planta). Por ejemplo: `q.asm-energy-1` (order: «Ordena del primer al último equipo por donde pasa la corriente: Mordazas / Barras fijas / Punta del electrodo / Transformador / Cables flexibles»); `q.asm-stored-1` (mcq: «El horno está apagado y un compañero quiere pasar por debajo de un brazo portaelectrodo para acortar camino. ¿Qué le dices?»); `q.asm-water-1` (mcq con DRI húmedo: «Ves que el DRI del silo de día se ve mojado después de una lluvia. ¿Qué haces?», con la respuesta «Avisas de inmediato al supervisor o al púlpito y no te acercas al horno a revisarlo»); `q.asm-signals-1` (mcq: fuga de agua en un cable flexible); `q.asm-zone-1` (identify del circuito secundario). En `assessments.json`, sustituir los `questionIds` por los `q.asm-*` y conservar q.electrode-6 como no calificado. Regla en `content-schema.md`: «Ningún `questionId` de una ASM puede aparecer en `checkIds`», con su validación en `checkContent`: `for (const a of c.assessments) a.questionIds.forEach((q) => { if (c.training.some((m) => m.lessons.some((l) => l.checkIds.includes(q))) && !a.unscoredQuestionIds?.includes(q)) e.push(\`${a.id}: ${q} ya se usa como check de lección\`); });`. **Todo ítem nuevo pasa por ADX-02/03 (contenido técnico) y ADX-04 (seguridad) antes de publicarse** |
| **TRN-03** | **HIGH** | `src/components/training/AssessmentView.tsx` → aviso del resultado (`role="note"`) y la lista de evaluaciones; `src/content/questions.json` → q.electrode-6 `explanation` | **Riesgo laboral con sindicalizados.** El aviso dice que el resultado «no certifica competencia», pero **no dice para qué NO se usa**. Si un supervisor pide ver la pantalla o el export xAPI, el resultado puede terminar usándose para escalafón, movimientos de categoría, asignación de puesto, sanciones o bonos. Eso contraviene el CCT y la función de la CMCAP, y desincentiva la participación (verificar con Jurídico Laboral). | Agregar en `AssessmentView.tsx`, **debajo** del aviso actual y **también** en la lista de evaluaciones, el texto (pendiente de visto bueno de `experto-relaciones-laborales`): «**Esta evaluación es solo para tu aprendizaje.** No es una constancia DC-3, no te habilita para operar y no se usa para escalafón, ascensos, cambios de puesto, sanciones ni bonos. Puedes repetirla las veces que necesites.» En la explicación de q.electrode-6, agregar al final: «Tampoco se usa para escalafón ni para evaluar tu desempeño.» La regla de uso se formaliza en la **Decisión requerida §6, opción A** |
| **TRN-04** | **HIGH** | `src/content/questions.json` → q.orientation-2, q.electrode-1, q.electrode-2 (`prompt`); `src/components/training/QuestionView.tsx` → `<select data-testid="identify-select">` | La lista que sirve de alternativa accesible al 3D (buena práctica) **revela la respuesta**: el texto del prompt coincide con el nombre del equipo en la lista. «5.º agujero» lleva a «Alimentación continua de DRI (5.º agujero)», «columnas de grafito» a «Electrodos de grafito» y «transforma la energía» a «Transformador del horno». El ítem mide coincidencia de palabras, no identificación. | Reescribir los prompts **por función o por ubicación, sin las palabras del nombre**. **q.orientation-2:** «Haz clic en el equipo por donde la carga metálica principal de GASM entra al horno de forma continua durante la fusión.» **q.electrode-1:** «Haz clic en el equipo que se consume con el uso y al que se le agregan secciones nuevas con una unión roscada.» **q.electrode-2:** «Haz clic en el equipo que recibe la energía de la red en alta tensión y la entrega al horno con menor tensión y muy alta corriente.» (Este prompt todavía orienta por función, lo cual es aceptable en nivel 2.) En `QuestionView.tsx`, ordenar las opciones de la lista **por número de hotspot**, como hoy, y **no** mostrar en la lista ningún texto que repita el prompt. Validar con ADX-08 (accesibilidad) que la lista siga siendo una alternativa equivalente |
| **TRN-05** | **HIGH** | `src/content/questions.json` → q.safety-2, q.safety-4, q.safety-1 (`options`, `answer`); q.orientation-4, q.electrode-3, q.electrode-6 (`answer`) | Hay **distractores implausibles** en ítems de seguridad: «el grafito se vuelve magnético», «el púlpito lo mueve de forma aleatoria», «no haces nada», «lo comentas la próxima semana», «le echas DRI encima». Además, en las 6 mcq la correcta es **siempre la más larga** y está **siempre en B o C**. Un alumno sin conocimiento acierta por descarte. Los ítems sí tienen una sola respuesta correcta. | **q.safety-2:** `"options": ["No es peligroso: si no hay corriente eléctrica, el brazo no se puede mover", "Solo es peligroso mientras el horno está caliente; ya frío no hay riesgo", "Porque puede tener energía almacenada (presión hidráulica o su propio peso) y moverse o caer", "Solo es peligroso si alguien lo está moviendo desde el púlpito en ese momento"], "answer": 2`. **q.safety-4:** `"options": ["Detienes la actividad, reportas al supervisor o al púlpito y esperas indicaciones", "Lo anotas en la bitácora y lo reportas al terminar la revisión", "Le avisas al compañero de al lado y sigues con la revisión", "Revisas con la lámpara de cerca para confirmar si de verdad es una grieta antes de avisar"], "answer": 0`. **q.safety-1:** `"options": ["La secas tú mismo con lo que tengas a la mano", "Sigues trabajando y lo reportas al final del turno", "Pones una señal en el piso para que nadie pise ahí y sigues con tu tarea", "Te detienes, te alejas, avisas de inmediato a tu supervisor o al púlpito y no dejas que nadie se acerque"], "answer": 3`. **q.electrode-3:** acortar la correcta a «Para mantener estable el arco moviendo cada electrodo» y mover a `"answer": 0`. Regla de redacción en `content-schema.md`: la correcta no es la opción más larga en más de 1 de cada 3 ítems; las posiciones de la correcta se balancean A/B/C/D; los distractores son **errores reales de nuevo ingreso** (fuente: ADX-04 y supervisores de turno). Alternativa en código: barajar las opciones de mcq de forma determinista con `shuffledOrder(q.options.length, q.id + 'O')` en `QuestionView`, guardando el índice original en la respuesta |
| **TRN-06** | **HIGH** | `src/lib/analytics/index.ts` → `toXapi()`, `VERB_IRI`; `src/components/training/PerformJobAid.tsx` → `track('checked', ...)` y `track('completed', wi.id, ...)` | **Riesgo de que la evidencia se lea como certificación.** En la ASM se emite el verbo xAPI estándar `passed`, y muchos LMS lo usan como disparador de «curso acreditado» o de constancia. En EJECUTAR se emiten `checked` (pasos marcados «Revisé este paso») y `completed` de la WI, que en un expediente parecen verificación OJT o TD-P07. La nota `urn:gasm:adx:note` está en `context.extensions`, donde casi ningún LMS la muestra. | **1)** En `toXapi`, agregar `contextActivities: { category: [{ objectType: 'Activity', id: 'urn:gasm:adx:category:knowledge-check-non-certifying', definition: { name: { 'es-MX': 'Evidencia de conocimiento. No es DC-3 ni certificación TD-P07' } } }] }` dentro de `context`, y en `result` agregar `extensions: { 'urn:gasm:adx:certifies-competency': false }`. **2)** Para la ASM, cambiar `display` a `{ 'es-MX': 'aprobó la comprobación de conocimiento' }` / `'no alcanzó el mínimo en la comprobación de conocimiento'`. **3)** En `PerformJobAid.tsx`, cambiar el objeto de los eventos a `` `${wi.id}#practica-sim-${s.n}` `` y `` `${wi.id}#practica-sim` ``, y agregar `result: { simulated: true }`. **4)** En el `VERB_IRI`, mapear `checked` a `http://adlnet.gov/expapi/verbs/interacted` (ya está) y **documentar** en `docs/architecture.md` que ningún evento de la plataforma alimenta TD-P07 ni la emisión de DC-3 |
| **TRN-07** | **HIGH** | `src/content/work-instructions.json` → `wi.electrode-system-check.prerequisites[0]`; `public/documents/jobaid-electrode-system-check.pdf` y `wi-electrode-system-check.pdf` (se regeneran) | El prerrequisito dice «**Haber aprobado** los módulos de orientación al EAF y de seguridad…», pero **esos dos módulos no tienen evaluación** (`assessmentId` ausente), así que el requisito no se puede evidenciar. Además, convierte el resultado en línea en una **puerta de acceso a una tarea**, que es un uso cercano a la habilitación (TD-P07) y toca la asignación de trabajo (CMCAP, escalafón). | Reemplazar por: `"Haber completado los módulos de orientación al EAF y de seguridad de energía eléctrica, energía almacenada y metal líquido (formación general de conocimiento; no habilita para la tarea ni sustituye la certificación en piso TD-P07)."`. Regenerar los dos PDF con `npm run` del generador de documentos (lo hace ADX-06, no esta revisión) |
| **TRN-08** | MEDIUM | `src/content/training.json` → `objectives` de los 3 módulos | Verbos no medibles o no medidos: «Explicar con tus palabras», «Explicar… regulación», «Explicar por qué…». Todos se evalúan con opción múltiple, es decir, se reconocen, no se explican. Hay dos lecturas posibles: o bajar el verbo a lo que realmente se mide, o agregar un ítem de explicación. | Reescribir: **eaf-orientation O1:** «Reconocer qué hace el horno de arco eléctrico y cuál es su principal fuente de calor». **electrode-melting O3:** «Elegir, entre varias, la descripción correcta de para qué sirve la regulación de electrodos». **energy-safety O2:** «Reconocer por qué un equipo apagado todavía puede moverse o caer». **energy-safety O3:** «Reconocer por qué el agua y el DRI húmedo son peligrosos cerca de metal líquido». Mantener «Explicar» solo para el nivel 3 de la fase 2, con explicación oral verificada por el instructor en el OJT (§5) |
| **TRN-09** | MEDIUM | `src/content/questions.json` → q.safety-3 `pairs` | Relación **ambigua**: «Bloqueo y liberación de energía según LOTO» también aplica a «Alta corriente en el circuito secundario», y «Detener, alejarse y avisar» también aplica a «Salpicaduras de metal líquido». No hay una sola respuesta correcta defendible. | Cambiar a: `{ "left": "Alta corriente en el circuito secundario", "right": "No entrar a la zona restringida sin autorización y permiso" }`, `{ "left": "Energía hidráulica almacenada", "right": "Nunca ponerse debajo de un brazo o de la bóveda, aunque el horno esté apagado" }`, `{ "left": "Salpicaduras de metal líquido", "right": "Usar la ropa ignífuga o aluminizada que marque la zona y quedarse fuera del área de vaciado" }`, `{ "left": "Agua cerca de metal líquido", "right": "Alejarse y avisar de inmediato; no intentar secarla" }`. Mantener la nota SME_REQUIRED en `explanation` |
| **TRN-10** | MEDIUM | `src/content/assessments.json` → `recommendations`; `src/components/training/AssessmentView.tsx` → botón de recomendación; `src/lib/content/schema.ts` → `checkContent` | (a) La recomendación «Equipos del EAF» no corresponde a ninguna pregunta de la ASM: es código muerto. (b) La recomendación lleva al **inicio** del módulo (`lessonIdx: 0`) y no a la lección que corresponde al error. (c) Ningún error de seguridad deriva al módulo de seguridad si el tema es «Condiciones anormales» (sí lo hace, pero q.safety-4 está en electrode-melting/les-5 y en seguridad/les-4: hay que elegir uno). | **1)** Cambiar el esquema de la recomendación a `{ topic, moduleId, lessonId }` y en `AssessmentView` navegar con `lessonIdx: idx.module.get(r.moduleId)!.lessons.findIndex((l) => l.id === r.lessonId)`. **2)** Eliminar `{ "topic": "Equipos del EAF", ... }`. **3)** Asignar `lessonId`: Etapas → les.eaf-orientation-3; Sistema de electrodos → les.electrode-melting-3; Regulación → les.electrode-melting-4; Ruta de la energía → les.electrode-melting-1; Componentes → les.electrode-melting-2; Alcance → les.electrode-melting-5; Agua y metal líquido → les.eaf-energy-safety-3; Energía almacenada → les.eaf-energy-safety-2; Condiciones anormales → les.eaf-energy-safety-4. **4)** En `checkContent`: `for (const a of c.assessments) a.recommendations.forEach((r) => { if (!a.questionIds.some((q) => c.questions.find((x) => x.id === q)?.topic === r.topic)) e.push(\`${a.id}: recomendación sin pregunta (${r.topic})\`); });` |
| **TRN-11** | MEDIUM | `src/lib/analytics/index.ts`; `src/components/training/LearnPlayer.tsx` (pantalla `module-complete`) | **Kirkpatrick N1 no existe**: no hay ningún evento de reacción (utilidad, claridad, confianza). **N2 es débil**: solo se registra `score.scaled` global. No hay respuesta por ítem (no se puede hacer análisis de dificultad ni de discriminación), no hay número de intento ni duración, y el `object` no tiene `definition` (nombre ni tipo). `completed` del módulo se registra con solo dar clic en «Siguiente», aunque no se haya contestado ningún check. | **1)** Agregar el verbo `'responded'` → `http://adlnet.gov/expapi/verbs/responded` y, en `module-complete`, 3 preguntas de escala 1–5 sin texto libre: «Lo que aprendí me sirve en mi trabajo», «Las explicaciones fueron claras», «Me siento más seguro de saber cuándo detenerme y avisar». Registrar `track('responded', \`${mod.id}#n1-${k}\`, { response: valor })`. **2)** En `finish()`, por cada ítem: `track('answered', q.id, { success: grade(q, rs[k]), attempt: n })`, con `answered` → `http://adlnet.gov/expapi/verbs/answered`. Y en el evento global, agregar `{ raw: s.correct, max: s.total, attempt: n, durationSec }`, con `toXapi` mapeando `score.raw/max` y `duration` ISO-8601. **3)** En `toXapi`, agregar a `object` la `definition: { name: { 'es-MX': título }, type: 'http://adlnet.gov/expapi/activities/assessment' \| '.../lesson' \| '.../question' }`. **4)** Emitir `completed` del módulo solo si se verificaron todos los `checkIds`. Si no, emitir `progressed` con `{ checksDone, checksTotal }` |
| **TRN-12** | MEDIUM | `src/lib/analytics/index.ts` → `anonymousActor()`, `enabled()/setEnabled()`; UI (no hay control) | **Evidencia apta para piloto, pero no para expediente.** (a) El actor es anónimo por navegador: en un **kiosco compartido** del piso o en la sala de capacitación, varios trabajadores quedan como un solo actor, y el dato N2 se mezcla. (b) `setEnabled` no tiene control en la UI: el trabajador no ve ni decide sobre su registro (aviso de privacidad, LFPDPPP; verificar con Jurídico). (c) No hay un flujo definido para llevar la evidencia al expediente (LMS y TD-P09) sin convertirla en DC-3. | **1)** Agregar en la pantalla de inicio de ASM un aviso visible: «Esta plataforma guarda en este equipo, sin tu nombre, qué lecciones viste y tu resultado, para mejorar el curso. [Desactivar registro]», conectado a `setEnabled(false)`. **2)** Agregar un botón «Terminar sesión en equipo compartido» que llame a `clearEvents()`, `resetProgress()` y borre `adx.actor`. **3)** Documentar en `docs/architecture.md` que en la fase 1 la evidencia **solo** sirve para indicadores agregados N1–N2 por módulo. Si va al expediente individual, el registro se hace en el LMS bajo el proceso TD-P09 como «constancia interna de conocimiento» (no DC-3), con aviso de privacidad y acuerdo previo de la CMCAP (§6) |
| **TRN-13** | MEDIUM | `src/components/training/LearnPlayer.tsx` → `Lesson`; `src/content/glossary.json` | **Accesibilidad pedagógica.** (a) Lo que el 3D resalta (`focus`) no aparece en texto: si el 3D no carga o el alumno usa lector de pantalla, no sabe qué equipo se está mostrando. No se encontró un modo sin WebGL. (b) El glosario (35 términos, bien escrito) **no se muestra en las lecciones**: solo lo usan el asistente y el PDF. Términos como pie líquido, solera, delta, EBT, taps, refractario y escoria espumosa aparecen sin ayuda. | **1)** En `Lesson`, debajo del título: `<p className="label">Equipos que se resaltan en el modelo:</p><Bullets items={[...new Set(l.focus.map((n) => idx.equipment.get('eq.' + n.replace(/^eaf__/, '').split('_')[0])?.name).filter(Boolean))]} />`. ADX-09 debe confirmar el mapeo nodo → equipo. **2)** Agregar una sección «Palabras de esta lección» que muestre las entradas de `glossary.json` cuyo `term` aparezca en `body` o en `keyPoints`, emparejando sin acentos ni mayúsculas. **3)** ADX-08 debe confirmar que existe un mensaje alternativo cuando WebGL no está disponible y que las lecciones siguen siendo útiles en texto y PDF |
| **TRN-14** | MEDIUM | `public/documents/guide-electrode-melting.pdf` (sección «Etapa 03 — Fusión», tabla de variables) | **Nivel de lenguaje.** La guía del participante de **nuevo ingreso** incluye una tabla de variables de proceso para ingeniería: perfil de potencia, impedancia, armónicos, kWh/t, «icebergs», tasa por MW. Esto rebasa los niveles 1–3 del módulo y puede inducir a buscar «el valor». | En el generador del PDF, **excluir** la tabla de variables de la etapa de la guía de participante (dejarla solo en el manual técnico o en la ficha de etapa para el nivel 3 o superior). En su lugar, poner una línea: «Las condiciones de operación de la fusión las define el procedimiento aprobado de la planta: SME_REQUIRED.» El responsable del generador es ADX-06/ADX-01 |
| **TRN-15** | MEDIUM | `public/documents/*.pdf` (las 4 guías) | **Accesibilidad del PDF.** La marca de agua «USO NO AUTORIZADO / BORRADOR» está hecha de **texto**: al extraer el texto (lector de pantalla, copiar y pegar) las letras se intercalan con el contenido. Además, el metadato `Title` es `about:blank`. | Generar la marca de agua como imagen o artefacto (`aria-hidden` y CSS `::before` con `content` de imagen SVG, o `pointer-events:none` con `role="presentation"`, y en el HTML fuente usar una `<svg>` con `aria-hidden="true"`). Fijar `<title>` del HTML fuente a `doc.title` antes de imprimir con Chromium. Verificar con `pdftotext` que el texto salga limpio |
| **TRN-16** | LOW | `src/content/questions.json` → q.electrode-5 (Cambiador de taps) | «Cambia la **relación** del transformador» es un tecnicismo para nuevo ingreso. | `"right": "Ajusta la tensión que el transformador entrega al horno"` |
| **TRN-17** | LOW | `src/lib/assessment.ts` → `isAnswered` (order); `AssessmentView.tsx` → resultado | En las preguntas de ordenar, el ítem cuenta como contestado sin ninguna interacción, y la calificación es «todo o nada» sin decir qué posición falló. Un solo intercambio vale cero, sin retroalimentación útil. | Mantener todo o nada para la calificación (la secuencia es el objetivo), pero en la revisión del resultado mostrar «Tu orden: … / Orden correcto: …». Agregar el estado `touched` en `Response` de tipo `order` y que `isAnswered` devuelva `r.touched === true` |
| **TRN-18** | LOW | `src/components/training/AssessmentView.tsx` → encabezado del resultado | «✔ Aprobado / ✕ No aprobado» tiene una connotación de calificación laboral. | Cambiar por «✔ Comprensión suficiente» / «✕ Aún no: repasa y vuelve a intentarlo», y conservar «— X de Y (Z %)» |
| **TRN-19** | LOW | `src/content/training.json` → les.electrode-melting-1/4 `keyPoints`; guías PDF | Los puntos clave que empiezan con «SME_REQUIRED» salen en el PDF como «⚠ SME_REQUIRED — DATO DE PLANTA PENDIENTE:» **seguido de nada**. | Redactar: `"Taps, tensiones y corrientes de operación: SME_REQUIRED (las define el procedimiento aprobado de la planta)"` y `"Ritmo de alimentación y setpoints: SME_REQUIRED (los define el procedimiento aprobado de la planta)"`, como ya se hace en les.eaf-energy-safety-1 |

**Lo que está bien y debe conservarse:**
- El aviso «no certifica competencia» aparece en la lección 5, en q.electrode-6, en el resultado de la ASM, en el cierre de la WI y en los PDF.
- Los SME_REQUIRED son visibles y no se rellenan.
- Hay alternativa por lista en el identify y los controles de ordenar se pueden usar con teclado.
- Los resultados usan texto + icono + color.
- La analítica es mínima y no guarda texto libre.
- El contexto D-010 es correcto: DRI ≈ 95–100 %, retornos ≤ 5 %, sin chatarra comprada.
- Las frases son cortas y se habla al alumno de «tú».
- La WI incluye un paso de ALTO y el derecho a detener el trabajo.

---

## 3. Corte del 80 % y recomendaciones: dictamen

- **El 80 % sí tiene sentido** para conocimiento de niveles 1–3 en inducción: es una práctica habitual en programas de seguridad, y corresponde a 8/9 con TRN-01. **Por sí solo no basta** si el alumno puede fallar los temas de seguridad. Por eso la regla queda así: **≥ 80 % y 3/3 ítems de seguridad críticos** (TRN-01).
- **Intentos ilimitados: mantenerlos.** No castigan y reducen el riesgo laboral. Para que sigan siendo válidos hace falta el banco paralelo (TRN-02). En la fase 2 conviene rotar los ítems por intento.
- **Las recomendaciones están bien pensadas por tema**, pero deben llevar a la lección exacta y no tener temas huérfanos (TRN-10).

## 4. Evidencia: Kirkpatrick y expediente (sin certificar)

| Uso | ¿Sirve hoy? | Con las correcciones | Límite que no se cruza |
|---|---|---|---|
| **N1, reacción** | No (no hay evento) | Sí, de forma agregada por módulo (TRN-11) | Sin texto libre, sin nombre |
| **N2, aprendizaje** | Parcial (solo el % global, actor anónimo por navegador) | Sí: % por ítem, por intento y por módulo (TRN-02, TRN-11, TRN-12) | Es «evidencia de conocimiento», no de competencia |
| **Expediente individual (LMS, TD-P09)** | No (anónimo, en un solo navegador) | Solo como **constancia interna de conocimiento**, registrada en el LMS con aviso de privacidad y acuerdo de la CMCAP | **No es DC-3.** La DC-3 se emite solo por un curso del plan DC-2 con agente capacitador registrado y evaluación conforme a la LFT (verificar con Jurídico Laboral). El módulo en línea puede ser **una parte** de ese curso, nunca la constancia completa |
| **Certificación de tarea crítica (TD-P07)** | No, y así debe seguir | Ningún evento de la plataforma la alimenta (TRN-06) | La otorga solo un evaluador calificado en piso, con procedimiento aprobado, después del OJT. Es la ruta N4–N5 |

Mapa de niveles ADX → evidencia:
- **N1–N3:** plataforma (lecciones, checks y ASM).
- **N4 Demostrar:** práctica en simulación (EJECUTAR), que solo cuenta como evidencia de práctica.
- **N4 real y N5 Ejecutar bajo supervisión:** OJT y evaluador en piso (TD-P07).

## 5. Riesgos laborales al usarlo con sindicalizados (revisión cruzada: `experto-relaciones-laborales`)

| Riesgo | Probabilidad | Impacto | Mitigación propuesta |
|---|---|---|---|
| Que el resultado se use para escalafón, ascenso, cambio de puesto o sanción | Media | Alto (conflicto con el CCT; queja ante la CMCAP; boicot a la plataforma) | Texto en la UI (TRN-03); regla de uso acordada en la CMCAP (§6-A); el export xAPI no identifica a la persona en la fase 1 |
| Que el «aprobado» en línea se use como requisito para asignar una tarea | Media | Alto (equivale a habilitar sin TD-P07) | TRN-07 y TRN-06 |
| Capacitación fuera de la jornada (por ejemplo, desde casa en roles 4x4 o 14x7) | Media | Medio (pago de tiempo extra o reclamo; verificar LFT art. 153 y siguientes con Jurídico Laboral) | Programarlo **dentro de la jornada** en TD-P05, en la sala o kiosco, con el tiempo registrado (85 min en total por los 3 módulos) |
| Brecha digital o de lectura en una parte del personal | Media | Medio (resultados injustos, exclusión) | Modo facilitado por un instructor con proyector; guía PDF impresa; fase 2 con audio y narración |
| Datos de kiosco compartido mezclados o reidentificables por turno | Baja | Medio | TRN-12 (cerrar sesión en equipo compartido; solo datos agregados) |

---

## 6. Decisión requerida del Director

**Tema:** regla de uso de los resultados de la plataforma con personal sindicalizado.

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Declarar por escrito, y presentar a la CMCAP para su acuerdo, que los resultados de ACERÍA DIGITAL ACADEMY son **formativos**: se usan solo en indicadores agregados N1–N2, **no** se usan para escalafón, ascensos, cambios de puesto, sanciones ni bonos, y **no** son DC-3 ni certificación TD-P07. El texto de TRN-03 se publica en la app. | Bajo. Requiere una sesión de la CMCAP | $0 adicional (tiempo interno) **[Supuesto]** |
| B | Publicar el texto en la app sin llevarlo a la CMCAP en esta fase. | Medio: el sindicato puede objetar el registro de datos de sus agremiados aunque sean anónimos | $0 |
| C | Piloto solo con personal de confianza hasta que la CMCAP acuerde la regla. | Bajo laboral, pero retrasa la validación con la población objetivo (nuevo ingreso sindicalizado) | Costo de oportunidad de 1 a 2 meses **[Supuesto]** |

- **Recomendación:** opción A, junto con el cierre de TRN-01 a TRN-07 antes del piloto.
- **Fecha límite sugerida para decidir:** antes de programar el piloto en TD-P05, como referencia **2026-10-30** **[Supuesto]**.
- Verificar con Jurídico Laboral.

---

## 7. Renglón para la tabla de validación (`docs/validation-checklist.md`)

**Firmas:**

| Función | Agente/rol | Resultado | Fecha |
|---|---|---|---|
| Formación | ADX-07 | **APROBADO CON CONDICIONES**: cerrar TRN-01 a TRN-07 (HIGH) antes de cualquier piloto con sindicalizados; TRN-08 a TRN-15 (MEDIUM) en la v0.2; ver `docs/reviews/review-formacion.md` | 2026-10-05 |

**Sección C, estado propuesto:**

| # | Criterio | Estado | Evidencia |
|---|---|---|---|
| C1 | Objetivos medibles y alineados | **No cumple**: 3/12 completos | Matriz §1; TRN-08 |
| C2 | La evaluación cubre los objetivos; las recomendaciones apuntan a módulos existentes | **Parcial**: los módulos existen, pero hay un tema huérfano, 2 objetivos sin ítem y 10/10 ítems repetidos | TRN-02, TRN-10 |
| C3 | Lenguaje apto para nuevo ingreso | **Cumple en la app / parcial en el PDF** | TRN-13, TRN-14, TRN-16 |
| C4 | xAPI sin datos personales ni texto libre | **Cumple**. Falta la etiqueta de no certificación en un lugar visible para el LMS | TRN-06, TRN-12 |

---

## 8. Recomendaciones para la fase 2

1. **Banco de ítems con metadatos:** objetivo, nivel, tema, si el ítem es crítico y la justificación de cada distractor, más rotación por intento. Revisar los ítems con un análisis de dificultad y discriminación cuando haya al menos 30 intentos por ítem.
2. **Escenarios ramificados** de identificación de peligros sobre el 3D: «¿qué ves mal en esta escena?», con fugas, una persona bajo carga o una junta con brillo. Mide el nivel 2 al 3 mejor que la opción múltiple.
3. **Nivel 3, explicar:** una pregunta de explicación oral que verifica el instructor en el OJT, con una rúbrica de 3 criterios registrada en el LMS. No se usa texto libre en la app.
4. **Puente formal con TD-P07:** una lista de verificación de observación en piso (N4–N5) que **cite** los módulos previos como requisito de **haberlos completado**, no aprobado. El evaluador calificado firma en el LMS; la plataforma no participa.
5. **Integración con el LMS por TD-P09:** LRS con actor identificado solo después del acuerdo de la CMCAP y el aviso de privacidad, con la categoría «non-certifying» obligatoria. Tablero agregado por sitio y área (N1–N2) para la célula de procesos.
6. **Accesibilidad:** narración en audio de cada lección (para baja alfabetización y entornos con ruido), modo sin 3D completo y versión impresa con imágenes de los equipos.
7. **Módulos de orientación y de seguridad con una evaluación propia corta** (5 o 6 ítems, 100 % en los críticos), para que el prerrequisito de la WI se pueda evidenciar como «completado».
8. **Medición N3:** observación de conducta a 30, 60 y 90 días (reportes de «detener y avisar» por área, sin individualizar), en coordinación con `sind-servicio-clientes`.

---

## 9. Revisión cruzada requerida

| Revisor | Por qué |
|---|---|
| `experto-relaciones-laborales` | TRN-03, TRN-07, TRN-12, §5 y §6 (CMCAP, escalafón, jornada, datos de sindicalizados) |
| `experto-seguridad-salud` / ADX-04 | TRN-01, TRN-05, TRN-09 y los ítems nuevos de TRN-02 (contenido de seguridad y la regla de ítems críticos) |
| `experto-operativo-metalurgia` / ADX-02 y ADX-03 | La redacción técnica de los ítems nuevos (TRN-02, TRN-04) y TRN-14 |
| `experto-documentacion-mejora` | Las reglas nuevas en `content-schema.md` y `validation-checklist.md` (TRN-02, TRN-05, TRN-10) |
| ADX-08 (accesibilidad) / ADX-09 (3D) | TRN-04, TRN-13, TRN-15 |

*Fuentes:* los archivos citados en el alcance, con corte al 2026-10-05; `docs/safety-review.md` (ADX-SR-001); `docs/validation-checklist.md`. Toda referencia a la LFT, al CCT o a la LFPDPPP está pendiente de verificar con Jurídico Laboral.

---

## Re-revisión (2026-10-05)

| Código | Versión | Estado | Revisor | Corte | Base verificada |
|---|---|---|---|---|---|
| ADX-TR-001 | 0.2 | **DRAFT, NOT VALIDATED** | ADX-07 Diseño de Aprendizaje | 2026-10-05 | Commit `4912e42` + árbol de trabajo; `src/content/{training,questions,assessments,glossary,work-instructions}.json`; `src/lib/assessment.ts`; `src/lib/analytics/index.ts`; `src/lib/content/schema.ts`; `src/components/training/*.tsx`; los 4 PDF de `public/documents/` (generados 2026-10-05 15:59 UTC); `docs/architecture.md` §4 bis; `docs/content-schema.md` |

**Pruebas corridas:** `npx tsx scripts/check-content.ts` → «✓ Contenido válido» (23 preguntas, 3 módulos, 215 campos SME_REQUIRED). `npx vitest run` → **116/116 en verde** (4 archivos). Solo hay un aviso de `act(...)` en `app.test.tsx`, que no afecta el resultado. No se corrió Playwright.

> **Mensaje clave.** **Los 7 HIGH (TRN-01 a TRN-07) están CERRADOS en el código y el contenido.** Hay una evaluación con banco paralelo `q.asm-*`, 3 preguntas de seguridad eliminatorias, una pregunta no calificada, prompts de identificación que no revelan la respuesta, distractores plausibles, xAPI marcado como no certificante y el prerrequisito de la WI como «completado». De los 12 MEDIUM y LOW, **9 están cerrados, 2 siguen abiertos** (TRN-11 parcial y TRN-15, la marca de agua del PDF) y **1 se acepta con mitigación** (TRN-18). **Dictamen nuevo de TRAINING: APROBADO PARA PILOTO CONTROLADO, CON CONDICIONES.** Las condiciones ya no son de código: son el visto bueno de Relaciones Laborales a los textos de uso (TRN-03 y TRN-12), la revisión técnica y de seguridad de los ítems nuevos `q.asm-*` y la decisión §6 del Director.

### R1. Estado de los hallazgos TRN-01 a TRN-19

| ID | Sev. | Estado | Evidencia (archivo → qué se verificó) |
|---|---|---|---|
| TRN-01 | HIGH | **CERRADO** | `assessments.json`: `criticalQuestionIds` = q.asm-stored-1, q.asm-water-1, q.asm-signals-1 y `unscoredQuestionIds` = q.electrode-6. `assessment.ts`: `score()` excluye las no calificadas y devuelve `criticalOk` y `criticalMissed`; `isPassed = ratio ≥ passScore && criticalOk`. `AssessmentView.tsx` usa `isPassed` en `finish()` y en el resultado, y muestra el aviso `critical-missed`. `QuestionView.tsx` muestra «▲ Pregunta de seguridad» (texto + icono + `sr-only`). `schema.ts` (líneas 368–372) valida subconjuntos y que una pregunta no sea crítica y no calificada a la vez. Con 9 calificadas, aprobar = 8/9 y 3/3 críticas. Pruebas: `assessment-analytics.test.ts` y `app.test.tsx` |
| TRN-02 | HIGH | **CERRADO** (falta revisión técnica de los ítems; ver R4) | La evaluación usa 9 ítems paralelos `q.asm-*` más q.electrode-6, que no se califica. **0 de 9 ítems calificados aparecen en `checkIds`.** La regla está en `schema.ts` (línea 374) y en `content-schema.md` (línea 44), y tiene prueba en `content.test.ts`. Ya hay un ítem de DRI húmedo (q.asm-water-1) y uno de identificar el secundario (q.asm-zone-1). Se aceptan los intentos ilimitados, el orden fijo y las explicaciones en el resultado, según §3, porque el banco ya es paralelo. La rotación queda para la fase 2 |
| TRN-03 | HIGH | **CERRADO en la app** (falta el visto bueno de RL) | `AssessmentView.tsx`: la constante `NOT_FOR_HR` tiene el texto propuesto, palabra por palabra, y se muestra en la lista de evaluaciones y en el resultado (`data-testid="not-for-hr"`). La explicación de q.electrode-6 termina con «Tampoco se usa para escalafón ni para evaluar tu desempeño.» `architecture.md` §4 bis repite la regla. El código mismo lo marca «pendiente de visto bueno de experto-relaciones-laborales» |
| TRN-04 | HIGH | **CERRADO** (falta la confirmación de ADX-08) | Los prompts de q.orientation-2, q.electrode-1 y q.electrode-2 ya se escriben por función o ubicación. Ninguna palabra del prompt coincide con el nombre en la lista: «banda y chute» no lleva a «Alimentación continua de DRI (5.º agujero)», y «se consume… unión roscada» no lleva a «Electrodos de grafito». Los nuevos q.asm-zone-1, q.asm-arms-1 y q.asm-control-1 siguen la misma regla. La lista de `QuestionView` muestra los 15 equipos por número de hotspot |
| TRN-05 | HIGH | **CERRADO** (falta escribir la regla de redacción) | Ya se aplicaron las opciones propuestas en q.safety-1, q.safety-2, q.safety-4 y q.electrode-3. En las 10 mcq, la correcta queda en A = 3, B = 2, C = 2 y D = 3, y es la más larga solo en 2 de 10 (q.safety-1 y q.safety-2, ambas son checks de lección). En las 4 mcq de la evaluación queda en A, B, C y D, y nunca es la más larga. Ya no hay distractores absurdos. **Pendiente menor:** la regla de redacción (correcta ≠ más larga, posiciones balanceadas, distractores = errores reales) **no está** en `content-schema.md` |
| TRN-06 | HIGH | **CERRADO** | `analytics/index.ts → toXapi()`: `contextActivities.category` = `urn:gasm:adx:category:knowledge-check-non-certifying`; `result.extensions['urn:gasm:adx:certifies-competency'] = false`; display «aprobó / no alcanzó el mínimo en la comprobación de conocimiento»; `activityDefinition()` nombra la evaluación «no válida para DC-3 ni para tareas críticas». `PerformJobAid.tsx` emite `${wi.id}#practica-sim[-n]` con `simulated: true`, que se tipa como `simulation` («no es verificación OJT ni certificación TD-P07»). Está documentado en `architecture.md` §4 bis. Prueba: `assessment-analytics.test.ts` |
| TRN-07 | HIGH | **CERRADO** | `work-instructions.json → prerequisites[0]` tiene el texto propuesto, palabra por palabra («Haber completado… no habilita para la tarea ni sustituye la certificación en piso TD-P07»). Se verificó con `pdftotext` en `wi-` y `jobaid-electrode-system-check.pdf` |
| TRN-08 | MEDIUM | **CERRADO** | Los objetivos de `training.json` ya usan los verbos medidos: «Reconocer…», «Elegir…», «Señalar…», «Ordenar…». Ya no queda ningún «Explicar» en los 12 objetivos |
| TRN-09 | MEDIUM | **CERRADO** | q.safety-3 ya tiene los 4 pares propuestos, cada uno con una sola respuesta defendible, y conserva el SME_REQUIRED en `explanation` |
| TRN-10 | MEDIUM | **CERRADO** | Las recomendaciones tienen `{topic, moduleId, lessonId}` y ya no existe «Equipos del EAF». `AssessmentView → goTo()` abre la lección exacta. `schema.ts` (líneas 376–379) valida que la lección esté en el módulo y que cada tema tenga una pregunta. Hay 10 recomendaciones y 10 temas en la evaluación; no quedan huérfanas. q.safety-4 sigue como check en dos lecciones, pero ya no entra en la evaluación, así que el punto (c) ya no aplica |
| TRN-11 | MEDIUM | **ABIERTO (parcial)** | **Hecho:** el verbo `answered` por ítem (success, attempt, critical, scored); el evento global con `raw/max/attempt/durationSec/criticalOk`; en xAPI, `score.raw/min/max` y `duration` ISO-8601, y `object.definition` por tipo. **Falta:** (1) **N1 de reacción**, porque no hay verbo `responded` ni las 3 preguntas de escala en `module-complete`; (2) `LearnPlayer.tsx` emite `completed` del módulo con solo pulsar «Terminar módulo», aunque no se haya verificado ningún check |
| TRN-12 | MEDIUM | **CERRADO en la app** (falta el visto bueno de RL y Jurídico) | `AssessmentView.tsx → RecordingNotice` muestra el aviso «sin tu nombre…», el botón «Desactivar registro» (`setEnabled`) y el botón «Terminar sesión en equipo compartido» (`clearEvents`, `resetProgress` y el nuevo `resetActor`). `architecture.md` §4 bis dice que la evidencia es solo agregada N1–N2 y que el expediente se lleva por TD-P09 como «constancia interna de conocimiento». Pruebas en `app.test.tsx` y `assessment-analytics.test.ts`. El texto del aviso de privacidad (LFPDPPP) no se ha validado con Jurídico |
| TRN-13 | MEDIUM | **CERRADO** (falta la confirmación de ADX-08 y ADX-09) | `LearnPlayer.tsx` tiene `FocusList` («Equipos que se resaltan en el modelo», con `equipmentForNode`) y `LessonWords` («Palabras de esta lección», con coincidencia sin acentos ni mayúsculas sobre `glossary.json`). Prueba en `app.test.tsx` (TRN-13). Queda para ADX-08 confirmar el modo sin WebGL |
| TRN-14 | MEDIUM | **CERRADO** | En `guide-electrode-melting.pdf`, la «Etapa 03 — Fusión» ya no tiene la tabla de variables y dice «Las condiciones de operación de la fusión las define el procedimiento aprobado de la planta» + SME_REQUIRED. `pdftotext` ya no encuentra «impedancia», «armónicos», «kWh/t» ni «icebergs». **Residuo LOW:** las tablas de componentes de la guía todavía usan vocabulario de ingeniería, como «perfil de potencia» y «válvula proporcional/servo» (ver R4) |
| TRN-15 | MEDIUM | **ABIERTO (parcial)** | **Hecho:** el metadato `Title` de los 4 PDF ya es el título real del documento, según `pdfinfo`. **Falta:** la marca de agua sigue siendo texto extraíble. `pdftotext` devuelve 151 a 916 renglones de una o dos letras sueltas por PDF («O / N / O / M / DE…») intercalados con el contenido. Afecta a lectores de pantalla y a copiar y pegar |
| TRN-16 | LOW | **CERRADO** | En q.electrode-5, la pareja de «Cambiador de derivaciones (taps)» ahora dice «Ajusta la tensión que el transformador entrega al horno» |
| TRN-17 | LOW | **CERRADO** | `Response` de tipo order tiene `touched`, y `isAnswered` exige `touched === true`. El resultado muestra «Tu orden / Orden correcto» cuando la respuesta falla. Prueba en `assessment-analytics.test.ts` |
| TRN-18 | LOW | **ACEPTADO con mitigación** | El encabezado dice «✔ Aprobaste la evaluación de conocimiento / ✕ Aún no apruebas la evaluación de conocimiento — X de Y (Z %)». Conserva el verbo «aprobar», pero lo limita a «evaluación de conocimiento» y siempre va junto a los avisos «no certifica competencia» y `NOT_FOR_HR`. Se acepta para el piloto, **sujeto a que RL lo revise junto con TRN-03**. Si RL lo pide, se cambia por «Comprensión suficiente / Aún no» |
| TRN-19 | LOW | **CERRADO** | Todos los puntos clave con SME_REQUIRED de `training.json` dicen qué falta y quién lo da. En el PDF, «DATO DE PLANTA PENDIENTE (SME_REQUIRED): tabla de taps…» ya no queda vacío |

**Resumen:** 16 CERRADOS (5 de ellos con una validación externa pendiente), 2 ABIERTOS parciales (TRN-11 y TRN-15, ambos MEDIUM) y 1 ACEPTADO (TRN-18, LOW). **No queda ningún HIGH abierto.**

### R2. Matriz de alineación actualizada

Leyenda igual a la de §1. «ASM» es `asm.eaf-electrode` con el banco paralelo.

| Módulo | # | Objetivo (texto actual) | Check (lección) | ASM | Antes → ahora | Comentario |
|---|---|---|---|---|---|---|
| eaf-orientation | O1 | Reconocer qué hace el EAF y cuál es su principal fuente de calor | ninguno (la lección 1 sigue sin check) | ninguno | ○ → **○** | Se corrigió el verbo, pero sigue sin ítem |
| eaf-orientation | O2 | Reconocer de dónde viene la carga metálica en GASM | q.orientation-4, q.orientation-2 | indirecto: q.asm-stages-1 (DRI por bandas), q.asm-water-1 | ◐ → **◐** | D-010 solo se evalúa de forma directa como check formativo |
| eaf-orientation | O3 | Ordenar las etapas generales | q.orientation-1 | q.asm-stages-1 (paralelo) | ● → **●** | Ya no se repite el ítem |
| eaf-orientation | O4 | Señalar en 3D los equipos principales y el púlpito | q.orientation-2 (identify), q.orientation-3 (match) | q.asm-control-1 (púlpito) | ◐ → **◐** | El púlpito ya se evalúa, pero la lección 5 («El púlpito de control») sigue sin check |
| electrode-melting | O1 | Señalar en 3D el transformador, el secundario, los brazos y los electrodos | q.electrode-2, q.electrode-1, q.electrode-5 | q.asm-zone-1 (secundario), q.asm-arms-1 (brazos) | ◐ → **●** | Los 4 equipos ya se identifican entre check y evaluación; la evaluación toma una muestra de 2 de 4 |
| electrode-melting | O2 | Ordenar la ruta de la energía | q.electrode-4 | q.asm-energy-1 | ● → **●** | Paralelo |
| electrode-melting | O3 | Elegir la descripción correcta de la regulación | q.electrode-3 | q.asm-regulation-1 (escenario) | ◐ → **●** | El verbo y el ítem ya coinciden |
| electrode-melting | O4 | Elegir la conducta ante una señal anormal y a quién avisar | q.safety-4 | q.asm-signals-1 ▲, q.asm-control-1 | ◐ → **●** | Ya entra la fuga de agua en un cable flexible |
| eaf-energy-safety | O1 | Señalar las zonas de alta corriente | q.safety-3 (corregida) | q.asm-zone-1 | ○ → **●** | Ver la observación R4-1: q.asm-zone-1 no es crítica |
| eaf-energy-safety | O2 | Reconocer por qué un equipo apagado todavía puede moverse o caer | q.safety-2 | q.asm-stored-1 ▲ | ◐ → **●** | Los distractores ya son plausibles |
| eaf-energy-safety | O3 | Reconocer por qué el agua y el DRI húmedo son peligrosos | q.safety-1 | q.asm-water-1 ▲ (DRI mojado) | ◐ → **●** | Ya se evalúa el DRI húmedo |
| eaf-energy-safety | O4 | Elegir la conducta de detenerse, alejarse y avisar | q.safety-4, q.safety-1 | q.asm-signals-1 ▲, q.asm-water-1 ▲, q.asm-stored-1 ▲ | ● → **●** | Es el objetivo más cubierto |

| Indicador | Antes | Ahora | Meta MVP | Fuente |
|---|---|---|---|---|
| Objetivos con cobertura completa (●) | 3/12 (25 %) | **9/12 (75 %)** | ≥ 80 % | R2 |
| Objetivos sin ningún ítem (○) | 2/12 | **1/12** (orientación O1) | 0 | R2 |
| Ítems calificados de la ASM que ya se vieron como check | 10/10 | **0/9** | 0 | `schema.ts` (línea 374) y `content.test.ts` |
| Ítems de seguridad críticos en la ASM | 3, se aprobaba con 1 | **3, obligatorios 3/3** | 3/3 | `assessments.json`, `isPassed` |
| Posición de la correcta (10 mcq) | B = 3, C = 3 (de 6) | **A 3 · B 2 · C 2 · D 3** | Balanceada | `questions.json` |
| Correcta = la más larga | 6/6 | **2/10** (0/4 en la ASM) | ≤ 1 de cada 3 | `questions.json` |
| Recomendaciones sin pregunta | 1 | **0** | 0 | `schema.ts` (línea 379) |

Los 3 objetivos que todavía no están en ● son del módulo de orientación, que **no tiene evaluación propia**. Para llegar a ≥ 80 % basta con agregar un check a les.eaf-orientation-1 (O1) y otro a les.eaf-orientation-5 (O4). Es la recomendación 7 de la fase 2 (§8).

### R3. Dictamen nuevo de TRAINING

**APROBADO PARA PILOTO CONTROLADO, CON CONDICIONES** (antes: aprobado con condiciones y piloto con sindicalizados bloqueado).

- **Desde formación**, la evaluación ya mide comprensión de niveles 1 a 3 con evidencia válida: ítems paralelos, seguridad eliminatoria y distractores plausibles. Ya no se puede leer como certificación ni en la interfaz ni en el xAPI. La plataforma **sigue sin certificar competencia**: los niveles 4 y 5 quedan en el OJT y en el evaluador en piso (TD-P07).
- **Condiciones antes del piloto con personal sindicalizado** (ninguna es de código):
  1. Visto bueno de `experto-relaciones-laborales` a los textos de TRN-03 y TRN-12, y al encabezado de TRN-18.
  2. Revisión de ADX-02/03 (contenido técnico) y ADX-04 o `experto-seguridad-salud` (seguridad) de los 9 ítems `q.asm-*` y de la selección de críticos.
  3. Decisión del Director sobre la regla de uso (§6).
  4. Programar el piloto dentro de la jornada (§5).
- **Para la v0.2, no bloquean el piloto:** TRN-11 (N1 de reacción y `completed` condicionado a los checks), TRN-15 (marca de agua del PDF como imagen), la regla de redacción de TRN-05 en `content-schema.md`, los checks de orientación O1 y O4, y las observaciones de R4.

**Renglón propuesto para `docs/validation-checklist.md`** (no se editó ese archivo):

| Función | Agente/rol | Resultado | Fecha |
|---|---|---|---|
| Formación | ADX-07 | **APROBADO PARA PILOTO CONTROLADO, CON CONDICIONES**: TRN-01 a TRN-07 cerrados. Antes del piloto con sindicalizados: visto bueno de RL (TRN-03, TRN-12, TRN-18), revisión técnica y de seguridad de `q.asm-*` y decisión §6. TRN-11 y TRN-15 quedan para la v0.2 | 2026-10-05 |

Sección C, estado propuesto: **C1 Parcial** (9/12 objetivos ●) · **C2 Cumple** (0 ítems repetidos y 0 temas huérfanos; los objetivos de orientación sin evaluación propia quedan anotados) · **C3 Cumple en la app / parcial en el PDF** (vocabulario de componentes y marca de agua) · **C4 Cumple** (categoría no certificante visible para el LMS).

### R4. Observaciones nuevas (no bloquean)

1. **q.asm-zone-1 (zona de alta corriente) no es crítica.** Es un objetivo de seguridad, igual que los otros tres. Hay que decidir con ADX-04 si se vuelve crítica. Si se agrega, aprobar exige 4/4 críticas y sigue en 8/9.
2. **Rúbrica de los ítems `q.asm-*`:** no hay ningún registro de que ADX-02/03/04 los hayan revisado. Ningún archivo de `docs/reviews/` los cita.
3. **Guía `guide-electrode-melting.pdf`:** las tablas de componentes («perfil de potencia», «válvula proporcional/servo», «zapata de contacto») vienen de la ficha técnica y rebasan el nivel de nuevo ingreso. Conviene simplificar esas tablas en la guía del participante (ADX-06).
4. **La regla de redacción de distractores** (TRN-05) se aplicó en el contenido, pero no se documentó en `content-schema.md` ni se valida en `checkContent` (por ejemplo, alertar cuando la correcta es la más larga en más de 1 de cada 3 ítems).

### R5. Pendientes para el Director

| # | Pendiente | Responsable | Para cuándo **[Supuesto]** |
|---|---|---|---|
| 1 | **Visto bueno de Relaciones Laborales** al texto `NOT_FOR_HR` (TRN-03), al aviso de registro y al botón de equipo compartido (TRN-12), y al encabezado del resultado (TRN-18). Incluye la revisión de Jurídico Laboral (LFT, CCT, LFPDPPP) | `experto-relaciones-laborales` + Jurídico Laboral | Antes de 2026-10-30 |
| 2 | **Decidir §6** (regla de uso de resultados con sindicalizados: A, B o C). La recomendación sigue siendo **A**: llevarla a la CMCAP | Director | 2026-10-30 |
| 3 | **Revisión técnica y de seguridad de los 9 ítems `q.asm-*`** y de la lista de críticos, incluida la observación R4-1 | `experto-operativo-metalurgia` (ADX-02/03) + `experto-seguridad-salud` (ADX-04) | Antes del piloto |
| 4 | **Confirmar la accesibilidad** de la lista alternativa al 3D (TRN-04), el modo sin WebGL (TRN-13) y el mapeo nodo → equipo | ADX-08 / ADX-09 | Antes del piloto |
| 5 | **Programar el piloto dentro de la jornada** (85 min por los 3 módulos) en TD-P05, en sala o kiosco | `sind-procesos` / `gerente-personal-sindicalizado` | Al decidir el punto 2 |
| 6 | **v0.2:** cerrar TRN-11 (N1 y `completed` condicionado), TRN-15 (marca de agua como imagen), los checks de orientación O1 y O4, la regla de distractores en `content-schema.md` y R4-3 | ADX-07 + ADX-06 (generador de PDF) | v0.2 |

**Decisión requerida del Director:** sigue vigente la de §6 (opción A recomendada; riesgo bajo; costo $0 adicional **[Supuesto]**; fecha 2026-10-30 **[Supuesto]**). La re-revisión no agrega decisiones nuevas. Verificar con Jurídico Laboral.
