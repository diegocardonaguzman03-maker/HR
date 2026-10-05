# Revisión de Relaciones Laborales: ACERÍA DIGITAL ACADEMY MVP 0.1 (textos y reglas de uso con personal sindicalizado)

| Código | Versión | Estado | Revisor | Fecha de corte | Alcance |
|---|---|---|---|---|---|
| ADX-RL-001 | 0.1 | **BORRADOR, NO VALIDADO POR JURÍDICO LABORAL** | `experto-relaciones-laborales` (staff del Director) | 2026-10-05 | `src/components/training/AssessmentView.tsx`, `LearnPlayer.tsx`, `PerformJobAid.tsx`, `QuestionView.tsx`; `src/components/ui/Disclaimer.tsx`; `src/components/panel/HazardCard.tsx` (solo el texto disciplinario); `src/content/questions.json` › `q.electrode-6`; `src/content/assessments.json`; `src/lib/analytics/index.ts`; `docs/architecture.md` §4 bis; `docs/reviews/review-formacion.md` (TRN-03, TRN-06, TRN-12, TRN-18, §5 y §6); `docs/release-approval.md` (R2, C2, C7 y decisión 4); `docs/plan-lanzamiento-piloto.md`; `04-processes/process-manual.md` TD-P05 y TD-P09 |

> **Mensaje clave.** **Visto bueno laboral: CONDICIONADO.** Los textos van en la dirección correcta: dicen que la evaluación no es DC-3, que no habilita para operar y que no se usa para escalafón ni sanciones, y el xAPI viaja marcado como no certificante. Para que el personal sindicalizado entre al piloto (D-011-4A) faltan **cuatro cosas**:
> 1. **Ajustar 8 textos** (§1), 5 de ellos bloqueantes. Los más importantes: el aviso `NOT_FOR_HR` debe cubrir también el *avance* en la plataforma y los exámenes de suficiencia y de escalafón; el aviso de registro no debe dar a entender anonimato total, y debe verse **al entrar** a la app, no solo en EVALUAR; el encabezado «Aprobaste / Aún no apruebas» se cambia (TRN-18).
> 2. **Bloquear la ruta LMS → DC-3.** TD-P09, paso 2, genera la DC-3 «automáticamente para quien aprobó». Un `passed` de la plataforma que llegue al LMS puede disparar una DC-3 sin curso ni evaluación válida. Hace falta una regla de exclusión escrita antes de conectar cualquier LRS o LMS (§2).
> 3. **Acta de la CMCAP** con la cláusula de no uso, la participación voluntaria y dentro de la jornada, y el manejo de datos (§4).
> 4. **Validación de Jurídico Laboral** de 12 puntos (§5), entre ellos el aviso de privacidad conforme a la LFPDPPP vigente.
>
> **Hallazgo nuevo que afecta al piloto en curso:** D-011-4 permite «confianza **e instructores**». En Acería, buena parte de los instructores internos de oficio son de **categoría sindicalizada** **[Supuesto: verificar en la plantilla]**. Si usan la app como alumnos con registro, el piloto ya incluye sindicalizados sin acuerdo de la CMCAP. Propongo que participen **solo como facilitadores** hasta el acuerdo (Decisión 3, §7).

Escala:
- **APROBADO:** se publica tal cual.
- **CAMBIAR:** se publica con el texto propuesto; **(B)** bloquea la entrada de sindicalizados, **(R)** es recomendable pero no bloquea.
- **CONDICIÓN:** se aprueba sujeto a una regla operativa o documental.

---

## 1. Dictamen sobre cada texto

### 1.1 Avisos de no uso (TRN-03) y evaluación (TRN-18)

| ID | Dónde | Texto actual | Dictamen | Texto exacto propuesto | Por qué |
|---|---|---|---|---|---|
| **RL-01** | `AssessmentView.tsx` › `NOT_FOR_HR` (lista de evaluaciones y resultado) | «Esta evaluación es solo para tu aprendizaje. No es una constancia DC-3, no te habilita para operar y no se usa para escalafón, ascensos, cambios de puesto, sanciones ni bonos. Puedes repetirla las veces que necesites.» | **CAMBIAR (B)** | «Esta evaluación es solo para tu aprendizaje. No es una constancia DC-3, no es un examen de suficiencia ni de escalafón y no te habilita para operar. Ni este resultado ni tu avance en la plataforma se usan para escalafón, ascensos, cambios de puesto o de categoría, evaluación de desempeño, sanciones ni bonos. Puedes repetirla las veces que necesites.» | (a) El texto actual protege solo «esta evaluación», pero la app también registra lecciones vistas, fichas abiertas y la práctica de EJECUTAR. El supervisor podría usar el *avance* para presionar o comparar. (b) Agrega los dos exámenes que el trabajador asocia con «aprobar»: el de suficiencia (LFT art. 153-U) y el de capacidad del escalafón (art. 159 y la cláusula del CCT). (c) «Categoría» es el término del CCT. (d) «Evaluación de desempeño» lo alinea con `q.electrode-6`. **Nota técnica:** `NotForHr()` parte el texto por `'. '` y pone en negritas la primera oración. El texto propuesto conserva esa primera oración y no tiene otros `'. '` problemáticos. Quitar del comentario del código la leyenda «pendiente de visto bueno» cuando se aplique. Verificar con Jurídico Laboral |
| **RL-02** | `AssessmentView.tsx`, lista › introducción | «Comprueba tu comprensión. Es una evaluación de conocimiento: **no certifica competencia** para operar.» | **APROBADO** | (sin cambio) | Claro y sin lenguaje de calificación laboral |
| **RL-03** | `AssessmentView.tsx`, lista › tarjeta | «N preguntas (M calificadas) · mínimo 80 % y las 3 preguntas de seguridad (▲) bien contestadas» | **APROBADO** | (sin cambio) | Es la regla de aprendizaje, no un requisito laboral. Que las preguntas de seguridad sean eliminatorias no implica sanción |
| **RL-04** | `AssessmentView.tsx`, resultado › `<h2>` (TRN-18) | «✔ Aprobaste la evaluación de conocimiento / ✕ Aún no apruebas la evaluación de conocimiento — X de Y (Z %)» | **CAMBIAR (B)** | Si alcanza el mínimo: «✔ Comprensión suficiente — X de Y (Z %)». Si no: «✕ Aún no: repasa y vuelve a intentarlo — X de Y (Z %)» | **No acepto la mitigación de TRN-18 para sindicalizados.** En el CCT y en la práctica de planta, «aprobar» o «reprobar» un examen es el lenguaje de los exámenes de escalafón y de suficiencia. Una captura de pantalla con «Aprobaste» es justo la evidencia que puede terminar en una mesa de escalafón o en una queja. «Comprensión suficiente» describe lo mismo sin esa carga. Para el piloto con confianza no bloquea, pero conviene aplicarlo desde ya para no tener dos versiones |
| **RL-05** | `AssessmentView.tsx`, resultado › nota | «⚠ Este resultado no certifica competencia. Es evidencia de conocimiento. La competencia para operar la evalúa y firma un evaluador en piso con el procedimiento aprobado de la planta, bajo supervisión.» | **APROBADO** | (sin cambio) | Es consistente con TD-P07 y con la DC-3: la emite la CMCAP sobre una capacitación real, no la plataforma |
| **RL-06** | `AssessmentView.tsx` › `CRITICAL_MISSED` | «Para terminar necesitas contestar bien todas las preguntas de seguridad (marcadas con ▲). Repasa el módulo de seguridad y vuelve a intentarlo.» | **APROBADO** | (sin cambio) | Es formativo y no sugiere consecuencia |
| **RL-07** | `AssessmentView.tsx`, resultado | «Una pregunta es de repaso y no cuenta para la calificación.» | **APROBADO** | (sin cambio) | Sin riesgo |
| **RL-08** | `questions.json` › `q.electrode-6.explanation` (última oración) | «Tampoco se usa para escalafón ni para evaluar tu desempeño.» | **CAMBIAR (B)** | «Tampoco se usa para escalafón, ascensos, sanciones ni bonos, ni para evaluar tu desempeño.» | Debe decir lo mismo que `NOT_FOR_HR`. Si un aviso enumera cinco usos prohibidos y el otro solo dos, el sindicato puede leer que los otros tres sí están permitidos en ese contexto. La pregunta es `unscoredQuestionIds` y no cuenta para el resultado: es correcto que sea de repaso |
| **RL-09** | `questions.json` › `q.electrode-6`, enunciado y opciones | «Si apruebas esta evaluación en la plataforma, ¿qué significa?» con la opción correcta «…no te habilita para operar» y el distractor «…ya cuentas con tu constancia DC-3…» | **APROBADO** | (sin cambio) | Refuerza el mensaje. Si se aplica RL-04, se puede cambiar «Si apruebas» por «Si sales con comprensión suficiente», pero no bloquea |

### 1.2 Aviso de registro y equipo compartido (TRN-12)

| ID | Dónde | Texto actual | Dictamen | Texto exacto propuesto | Por qué |
|---|---|---|---|---|---|
| **RL-10** | `AssessmentView.tsx` › `RecordingNotice`, registro activo | «Esta plataforma guarda en este equipo, sin tu nombre, qué lecciones viste y tu resultado, para mejorar el curso.» | **CAMBIAR (B)**, más la **CONDICIÓN de ubicación** | «Esta plataforma guarda solo en este equipo, sin tu nombre ni tu número de ficha, qué lecciones viste, tus respuestas y tu resultado. Se usa para mejorar el curso con datos de todo el grupo, no para evaluarte a ti. Puedes desactivar el registro o borrarlo al terminar.» **Condición:** el mismo aviso, con los dos botones, debe aparecer **al entrar a la app por primera vez en el equipo** (antes del primer evento `initialized`), además de en EVALUAR | (a) Hoy el aviso aparece solo en EVALUAR, pero `track()` registra desde que se abre la app (`EafModel.tsx`: `initialized`, `opened`; `TopBar.tsx`: `mode-changed`; `LearnPlayer.tsx`: lecciones). El trabajador queda registrado **antes** de enterarse. Eso es un problema de transparencia (LFPDPPP) y de confianza con el sindicato. (b) La app también guarda **respuestas por pregunta**, no solo «tu resultado». (c) «Sin tu nombre» es cierto, pero el identificador es un **seudónimo persistente** por navegador. Con la hora y la lista de quién usó el kiosco en ese turno, se puede saber quién es. Por eso el texto **no promete anonimato**: promete el uso («no para evaluarte a ti»), que es lo que la CMCAP puede vigilar. Verificar con Jurídico Laboral |
| **RL-11** | `RecordingNotice`, registro desactivado | «El registro está desactivado: en este equipo no se guarda qué lecciones viste ni tu resultado.» | **CAMBIAR (R)** | «El registro está desactivado: en este equipo no se guarda qué lecciones viste, tus respuestas ni tu resultado.» | Consistencia con RL-10 |
| **RL-12** | `RecordingNotice`, botones | «Desactivar registro» / «Activar registro» | **APROBADO** | (sin cambio) | Claro |
| **RL-13** | `RecordingNotice`, botón y confirmación | «Terminar sesión en equipo compartido» → «Listo: se borró lo guardado en este equipo.» | **CAMBIAR (B)** | Botón: «Borrar mis datos de este equipo y terminar». Confirmación: «Listo: se borró de este equipo lo que viste, tus respuestas y tu avance.» | «Terminar sesión» hace pensar que hubo un inicio de sesión con nombre (no lo hay) y no avisa que también se **borra el avance** (`resetProgress`). El trabajador debe saber qué pierde y qué se elimina. En kiosco, el instructor lo pulsa al final de cada sesión de grupo (regla operativa del acta, §4) |

### 1.3 Otros textos de `src/components/` que tocan lo laboral

| ID | Dónde | Texto actual | Dictamen | Texto exacto propuesto | Por qué |
|---|---|---|---|---|---|
| **RL-14** | `PerformJobAid.tsx` | «No acredita que puedas hacer la tarea en planta: eso lo evalúa un instructor en piso con el procedimiento aprobado.» | **CAMBIAR (R)** | «No acredita que puedas hacer la tarea en planta: eso lo evalúa un evaluador autorizado en piso con el procedimiento aprobado.» | En TD-P07 quien firma la competencia es el **evaluador calificado**, no cualquier instructor. Así queda igual que RL-05 y `q.electrode-6` |
| **RL-15** | `Disclaimer.tsx` | «La plataforma no certifica competencia para trabajo sin supervisión.» | **APROBADO** | (sin cambio) | Sin riesgo |
| **RL-16** | `LearnPlayer.tsx` y `QuestionView.tsx` | Textos de navegación e instrucciones | **APROBADO** | (sin cambio) | No tienen contenido laboral |
| **RL-17** | `HazardCard.tsx` (fuera del alcance de formación, pero es un compromiso disciplinario) | «Si un control falta o tienes duda: detente y avisa. Detenerte nunca se sanciona.» | **CAMBIAR (R)** y **revisión cruzada de SSO** | «Si un control falta o tienes duda: detente y avisa. Detenerte por seguridad nunca se sanciona.» | Me parece un mensaje correcto y valioso. Pero es una **promesa disciplinaria** de la Empresa, publicada, que un trabajador puede invocar ante la Comisión de Honor y Justicia o en un juicio. «Por seguridad» la ata a la política de derecho a detener el trabajo y evita leerla como una inmunidad general. Debe tener respaldo en el Reglamento Interior de Trabajo o en la política SSO vigente. Verificar con Jurídico Laboral / SSO |

### 1.4 Analítica xAPI (`src/lib/analytics/index.ts`) (TRN-06, SAF-11)

| ID | Elemento | Estado actual | Dictamen | Propuesta exacta o condición | Por qué |
|---|---|---|---|---|---|
| **RL-18** | Actor | `account: { homePage: 'urn:gasm:aceria-digital-academy', name: 'anon-…' }`, persistente por navegador; `resetActor()` lo borra | **CONDICIÓN** | (1) En la documentación (`architecture.md` §4 bis, comentarios del código y el acta) llamarlo **«identificador seudónimo por equipo»**, no «anónimo». (2) En la fase 1 **no** se conecta a ningún LRS ni LMS con datos de sindicalizados. (3) El export (`exportXapi`) **no se cruza** con listas de asistencia, roles de turno ni bitácoras de kiosco. (4) Los informes a la CMCAP se dan por módulo, con un **mínimo de 5 participantes por grupo** **[Supuesto]**; si hay menos, no se reporta ese grupo | Un identificador persistente que se puede volver a ligar a una persona es dato personal en el sentido de la LFPDPPP. Llamarlo «anónimo» y luego reidentificarlo sería el peor escenario frente al sindicato. Verificar con Jurídico Laboral |
| **RL-19** | Verbo `passed`/`failed` (IRI ADL estándar) | Se conserva la IRI ADL; display «aprobó la comprobación de conocimiento» / «no alcanzó el mínimo…»; categoría `knowledge-check-non-certifying`; `certifies-competency: false`; actividad «no válida para DC-3 ni para tareas críticas» | **CONDICIÓN (B)** y **CAMBIAR (R)** del display | **Condición:** antes de conectar cualquier LRS o LMS, el área de Plataformas (TD-16/TD-17) documenta y prueba una **regla de exclusión**: toda sentencia con la categoría `urn:gasm:adx:category:knowledge-check-non-certifying` o con `certifies-competency = false` **no** cambia el estado del curso a «acreditado», **no** entra al flujo de TD-P09 y **no** genera DC-3. **Display (R):** `passed` → «comprensión suficiente en la comprobación de conocimiento (no certifica)»; `failed` → «aún sin comprensión suficiente en la comprobación de conocimiento (no certifica)» | La marca de no certificante está bien hecha, pero los LMS **no la leen solos**. TD-P09, paso 2, dice textualmente que la DC-3 se genera «automáticamente desde el LMS para quienes aprobaron». Un `passed` estándar es justo lo que ese automatismo busca. El display alinea el lenguaje con RL-04. Alternativa si Plataformas no puede garantizar la regla: usar una IRI propia (`urn:gasm:adx:verb:knowledge-check-met`) solo para el piloto con sindicalizados |
| **RL-20** | Nombres de actividad (`activityDefinition`) y categoría `NON_CERT` | «Evaluación de conocimiento (no certifica competencia; no válida para DC-3 ni para tareas críticas)»; «Práctica en simulación (no es verificación OJT ni certificación TD-P07)» | **APROBADO** | (sin cambio) | Correcto y suficiente |
| **RL-21** | Datos por ítem (`answered`), intento, duración, `criticalOk` | Se guardan por evento con fecha y hora | **CONDICIÓN** | Uso **solo agregado** (por ítem o por módulo) para mejorar el diseño. El número de intentos y la duración **nunca** se reportan por persona ni se usan como indicador de «rapidez» o «esfuerzo» | Son los datos que más fácilmente se convierten en una evaluación de desempeño encubierta |
| **RL-22** | Registro activo por defecto (`enabled()` = activo salvo `'off'`) | Modelo *opt-out* | **CONDICIÓN** | Aceptable para el piloto **si** se cumple RL-10 (aviso al entrar) y la CMCAP lo acuerda (§4, punto 5). Si Jurídico Laboral o la CMCAP lo piden, se cambia a *opt-in* (el registro inicia desactivado y el trabajador lo activa) | Con datos solo locales y seudónimos, el *opt-out* informado es razonable. Con sindicalizados, la última palabra la tiene el acuerdo. Verificar con Jurídico Laboral |
| **RL-23** | Nota `urn:gasm:adx:note` | «Evidencia de aprendizaje; no certifica competencia» | **APROBADO** | (sin cambio) | Redundante con la categoría; no estorba |

### 1.5 Dictamen sobre `review-formacion.md` y `release-approval.md`

| Referencia | Dictamen de RL |
|---|---|
| **TRN-03** (formación) | **Visto bueno con cambios**: RL-01 y RL-08. Con eso se cierra la parte de RL |
| **TRN-06** (formación) / **SAF-11** (seguridad) | **Visto bueno laboral con condición**: RL-19 (regla de exclusión LMS → DC-3 antes de cualquier conexión) y, si se puede, el display alineado |
| **TRN-12** (formación) | **Visto bueno con cambios**: RL-10 (texto y aviso al entrar), RL-11 y RL-13. Además, el **aviso de privacidad simplificado** lo redacta Jurídico (J-07). Sin ese aviso, no entran sindicalizados |
| **TRN-18** (formación) | **No se acepta la mitigación para sindicalizados**: se aplica RL-04 |
| **Formación §5** (riesgos) | De acuerdo. Agrego R-RL-07 a R-RL-12 (§3) |
| **Formación §6** (decisión) | Ya está decidida (D-011-4A). Esta revisión entrega el acta que la opción A pedía (§4) |
| **Release R2** | De acuerdo con la severidad. Mitigación completa = textos §1 + regla LMS (RL-19) + acta CMCAP (§4) + validación de Jurídico (§5) |
| **Release C2** (población) | De acuerdo, con una precisión: los **instructores sindicalizados** participan como facilitadores sin registro hasta el acuerdo (Decisión 3) |
| **Release C7** | **CAMBIAR (R)** a: «Ningún resultado ni avance del piloto se registra como DC-3, certificación TD-P07, examen de suficiencia (LFT art. 153-U), examen de capacidad para escalafón ni dato de desempeño. La evidencia es solo agregada (N1–N2) y no entra al flujo TD-P09.» |
| **Release decisión 4** | Ya resuelta (D-011-4A). Los pasos para cumplirla están en §6 |

---

## 2. Dos ajustes de proceso que pide esta revisión (soy custodio de TD-P09)

| # | Documento | Problema | Ajuste propuesto (no aplicado; pide visto bueno de `experto-documentacion-mejora`) |
|---|---|---|---|
| P-1 | `04-processes/process-manual.md` › TD-P09, paso 2 | La DC-3 se genera «automáticamente desde el LMS para quienes aprobaron». No distingue las evaluaciones formativas | Agregar: «Los registros de plataformas o actividades marcadas como **formativas / no certificantes** (por ejemplo, la categoría xAPI `knowledge-check-non-certifying`) **no generan DC-3** ni se reportan en la DC-4. La DC-3 solo procede de un curso del plan DC-2 con evaluación válida y firmas de la CMCAP.» |
| P-2 | `04-processes/process-manual.md` › TD-P05, paso 5 y SLA | El cierre manda los «resultados de la evaluación» a TD-P09 y reporta las inasistencias al supervisor en 24 h | Para el piloto ADX con sindicalizados: **no** se reportan inasistencias (la participación es voluntaria) y los resultados de la app **no** pasan a TD-P09. Se registra solo la **asistencia a la sesión** como tiempo de capacitación dentro de la jornada |

---

## 3. Riesgos frente al marco laboral y de datos

*Todas las referencias legales: verificar con Jurídico Laboral. No tengo el texto del CCT vigente de Acería; las referencias al CCT son por tipo de cláusula. **Pido a Jurídico o a Relaciones Laborales de planta las cláusulas de capacitación, escalafón, jornada y tiempo extra, y del reglamento de la CMCAP.***

| # | Marco | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|---|
| R-RL-01 | **LFT Cap. III Bis, art. 153-A y siguientes** (obligación de capacitar; capacitación dentro de la jornada salvo convenio) | Que la app se use fuera de la jornada (casa, descanso en roles 4x4 o 14x7) y luego se reclame como tiempo extra (arts. 66-68), o que se perciba como capacitación sin pago | Media | Medio | Acta, punto 4: solo dentro de la jornada, en sala o kiosco, con instructor. **No distribuir** `web/index.html` fuera de planta durante el piloto. El uso libre fuera de jornada no se pide, no se registra y no genera obligación |
| R-RL-02 | **Art. 153-E** (CMCAP) y **art. 153-F** (funciones) | Introducir una herramienta de capacitación con sindicalizados sin que la CMCAP la conozca. Eso es motivo de queja y de pérdida de confianza en la Comisión | Alta si se omite | Alto | Acta, puntos 1 y 9. Informes agregados a la Comisión |
| R-RL-03 | **Art. 153-H** (obligaciones del trabajador: asistir y presentar exámenes) | Que, por estar en este capítulo, se entienda que la app es **obligatoria** y que su evaluación es un examen de los que obliga el art. 153-H | Media | Medio | El piloto **no forma parte del plan DC-2** y es **voluntario** (acta, punto 4). Si en la fase 2 se incorpora al DC-2, se renegocia en la CMCAP |
| R-RL-04 | **Art. 153-U** (examen de suficiencia) | Que un trabajador pida que su «aprobado» en la app valga como examen de suficiencia y se le expida la constancia; o, al revés, que la Empresa lo use para negarla | Baja | Medio | RL-01 y RL-04; acta, punto 3 |
| R-RL-05 | **Art. 153-V** y **DC-3 / DC-4** (constancias e informe a la STPS) | Generar una DC-3 desde el LMS por un `passed` de la app, sin curso ni evaluación válidos. Es una constancia sin sustento ante una inspección (arts. 994 y relacionados) y una puerta para habilitar sin TD-P07 | Media si se conecta un LMS | **Alto** | RL-19 (regla de exclusión), P-1, release C7 |
| R-RL-06 | **Escalafón, arts. 154-159**, y cláusulas de escalafón del CCT | Que el resultado o el avance se use como antecedente en un movimiento escalafonario o en el examen de capacidad (art. 159). Eso genera conflicto en la Comisión Mixta de Escalafón, juicios por preferencia de derechos y boicot a la plataforma | Media | **Alto** | RL-01, RL-04, RL-08; cláusula de no uso (§4.2); prohibir capturas o exportes individuales |
| R-RL-07 | **CCT** (capacitación, permisos, categorías) | Que el CCT regule cómo se introducen nuevas modalidades de capacitación (en línea o e-learning) o pida un acuerdo previo con la sección. No tengo el texto | **[Supuesto]** Media | Medio | Revisar las cláusulas (J-02). El acta dice expresamente que no modifica el CCT (punto 10) |
| R-RL-08 | **Reforma 2019** (legitimación del CCT, democracia sindical) | Firmar el acta con una representación que no sea la del sindicato titular del CCT legitimado, o con delegados sin facultades | Baja | Medio | J-03: confirmar la titularidad del CCT y las facultades de los representantes en la CMCAP |
| R-RL-09 | **LFPDPPP** (ley vigente; verificar la versión publicada en el DOF en 2025) y aviso de privacidad | Registrar datos de aprendizaje con un seudónimo persistente **sin aviso previo** (hoy el aviso sale hasta EVALUAR); llamarlo «anónimo» y luego reidentificarlo; enviarlo a un LRS de un proveedor sin contrato de encargado | Media | Alto (reputacional y sindical, más el regulatorio) | RL-10 (aviso al entrar), RL-18, aviso de privacidad simplificado (J-07), sin LRS en la fase 1 |
| R-RL-10 | **No discriminación** (LFT arts. 2, 3 y 133) | Brecha digital, de lectura o de edad: si el resultado se comparara, perjudicaría a quien tiene menos práctica con computadoras | Media | Medio | Modo facilitado por el instructor, guía impresa y participación voluntaria; los resultados no se comparan entre personas |
| R-RL-11 | **Disciplina** (RIT, art. 47) | Uso del registro o del texto «detenerte nunca se sanciona» en un procedimiento disciplinario, a favor o en contra | Baja | Medio | Cláusula de no uso, inciso (d); RL-17 |
| R-RL-12 | **Instructores sindicalizados en el piloto actual** | Que D-011-4 («confianza e instructores») meta sindicalizados al piloto por la puerta de los instructores | Media **[Supuesto]** | Medio | Decisión 3: solo como facilitadores, con el registro desactivado, hasta el acuerdo |

---

## 4. Propuesta de acta de la CMCAP para incluir al personal sindicalizado en el piloto

> **Para preparar la posición. No es un acuerdo.** El texto se presenta al Director. Solo él decide si se lleva a la CMCAP y en qué términos; ningún agente lo comparte con el sindicato. Se recomienda una **reunión previa informal** con el secretario de la sección o con el delegado de capacitación, con el Director o con quien él designe, antes de la sesión formal.

### 4.1 Estructura del acta

**ACTA DE SESIÓN [ordinaria / extraordinaria] N.º [__] DE LA COMISIÓN MIXTA DE CAPACITACIÓN, ADIESTRAMIENTO Y PRODUCTIVIDAD — PLANTA ACERÍA, GRUPO ACERO SIERRA MADRE**

- **Lugar y fecha:** [__], [__] de [octubre / noviembre] de 2026, [hh:mm] h.
- **Asistentes:** representantes de la Empresa [nombres y puestos]; representantes de los trabajadores, Sección [__] del Sindicato [__], titular del CCT [nombres y cargos]; invitados sin voto: Director de C&D o su representante, instructor líder del piloto, Especialista STPS (TD-15).
- **Quórum:** [__] (según el reglamento interno de la CMCAP).
- **Orden del día:** 1) Presentación de la plataforma Acería Digital Academy y de los resultados preliminares del piloto con personal de confianza. 2) Propuesta de incorporar al personal sindicalizado al piloto. 3) Acuerdos. 4) Asuntos generales.

**Antecedentes:** la Empresa presenta la plataforma Acería Digital Academy, una herramienta de aprendizaje con un modelo 3D del horno de arco eléctrico, lecciones, práctica en simulación y una evaluación de conocimiento. Está en fase piloto, su contenido es educativo (no es procedimiento aprobado de planta) y **no certifica competencia**. Se muestran a la Comisión las pantallas con los avisos de uso.

### 4.2 Acuerdos propuestos

1. **Objeto y alcance.** Se acuerda incorporar al piloto de Acería Digital Academy a un grupo de hasta **[20] trabajadores sindicalizados** de Acería **[Supuesto]**, prioritariamente de nuevo ingreso y de las categorías [__], del [__] al [__] de 2026 (**[3] semanas** **[Supuesto]**). El piloto **no forma parte del plan y programas de capacitación (DC-2)** vigentes ni los sustituye.

2. **Naturaleza formativa.** La plataforma y sus evaluaciones son herramientas de aprendizaje. **No son** constancias de competencias o habilidades laborales (DC-3), ni exámenes de suficiencia, ni exámenes de capacidad para escalafón, ni certificación de tareas críticas. Ningún resultado de la plataforma habilita a un trabajador para operar.

3. **Cláusula de no uso (texto propuesto).**
   > «Las partes acuerdan que los resultados, avances, respuestas, intentos, tiempos y cualquier otro registro generado por los trabajadores sindicalizados en la plataforma Acería Digital Academy durante el piloto tienen carácter **exclusivamente formativo**. En consecuencia, la Empresa se obliga a **no utilizarlos, directa ni indirectamente, como criterio, antecedente o elemento de prueba** para: (a) movimientos de escalafón, ascensos, permutas, cambios de puesto, de categoría o de turno; (b) exámenes de capacidad o de suficiencia previstos en la Ley Federal del Trabajo o en el Contrato Colectivo de Trabajo; (c) evaluaciones de desempeño; (d) medidas disciplinarias, sanciones o rescisión de la relación de trabajo; (e) bonos, incentivos o premios; ni (f) la emisión de constancias DC-3 o de certificaciones de tareas críticas. El único uso permitido es elaborar indicadores **agregados por módulo**, sin identificar a ninguna persona, que se presentarán a esta Comisión. Ningún supervisor o jefe podrá pedir a un trabajador que le muestre sus resultados ni exportar registros individuales.»

4. **Uso voluntario y dentro de la jornada (texto propuesto).**
   > «La participación en el piloto es **voluntaria**. El trabajador que decida no participar, o que deje de hacerlo en cualquier momento, no tendrá ninguna consecuencia y recibirá su capacitación de la forma prevista en el plan vigente. Las sesiones se realizan **dentro de la jornada de trabajo**, en la sala de capacitación o en el kiosco designado, con un instructor presente, sin afectar el salario ni las prestaciones, y su duración se registra como tiempo de capacitación. La Empresa no pedirá el uso de la plataforma fuera de la jornada ni en dispositivos personales. No se reportarán inasistencias al piloto como falta.»

5. **Datos y privacidad.** La plataforma guarda los registros **solo en el equipo de la sala o del kiosco**, sin nombre, número de ficha ni CURP, con un identificador técnico por equipo. Se informa al trabajador con un aviso **al entrar** a la plataforma. El trabajador puede desactivar el registro o borrarlo. El instructor borra los datos del equipo al final de cada sesión de grupo. En el piloto **no** se envían datos a ningún sistema externo, LMS ni expediente, y **no** se cruzan con listas de asistencia ni roles de turno. Los registros se eliminan de los equipos al terminar el piloto, después de obtener los indicadores agregados. El aviso de privacidad lo emite la Empresa conforme a la ley aplicable.

6. **Relación con la DC-3 y la DC-4.** Ninguna actividad de la plataforma genera DC-3 ni se informa en la DC-4. Si en una fase posterior la Empresa propone incorporar la plataforma al plan DC-2, lo presentará previamente a esta Comisión para su análisis y acuerdo.

7. **Apoyo y accesibilidad.** La Empresa ofrece una sesión facilitada por un instructor, guía impresa y apoyo de lectura para quien lo necesite. Los resultados no se comparan entre personas.

8. **Retroalimentación.** Los trabajadores participantes contestan una encuesta anónima de reacción. La Empresa presenta a la Comisión, a más tardar [__] días hábiles después del cierre, un informe con indicadores agregados (participación, resultados por módulo, comentarios), sin datos individuales.

9. **Seguimiento y quejas.** Cualquier presunto uso contrario a este acuerdo se presenta ante esta Comisión, que lo revisará en un plazo de [5] días hábiles. Si se confirma, la Empresa deja sin efecto el acto de que se trate.

10. **Alcance jurídico.** Este acuerdo no modifica el Contrato Colectivo de Trabajo, no crea categorías ni requisitos nuevos de escalafón y no establece precedente para la fase de implantación, que se acordará por separado.

11. **Vigencia.** Del [__] al cierre del piloto y hasta la entrega del informe del punto 8. La cláusula de no uso (punto 3) se mantiene **por tiempo indefinido** respecto de los datos generados en el piloto.

**Firmas:** representantes de la Empresa y de los trabajadores en la CMCAP.

### 4.3 Argumentos para la sesión (beneficio para el trabajador)

- **Más seguridad:** el módulo de energía eléctrica, energía almacenada y metal líquido refuerza «detente y avisa».
- **Aprender sin riesgo y a su ritmo:** puede repetir las veces que quiera y no hay consecuencias.
- **Mejor preparación** para la capacitación en piso y para el OJT. A futuro, y con un acuerdo aparte, puede apoyar la preparación para los exámenes de escalafón (no los sustituye).
- **Voz del sindicato en el diseño:** la Comisión recibe los resultados y puede pedir ajustes.

**Concesiones posibles** (preparadas; las decide el Director): registro *opt-in* en lugar de *opt-out*; un observador sindical en la primera sesión; un piloto más chico (10 personas); borrado de los datos al terminar cada sesión, en lugar de al terminar el piloto. **No negociable** para la Empresa **[Recomendación]**: que la plataforma no certifica y que su contenido no es procedimiento aprobado (es una regla de seguridad, no laboral).

---

## 5. Lo que debe validar Jurídico Laboral

| # | Punto a validar | Verificar con Jurídico Laboral |
|---|---|---|
| J-01 | Que el texto de `NOT_FOR_HR` (RL-01), `q.electrode-6` (RL-08) y la cláusula de no uso (§4.2-3) son coherentes con el CCT y no generan obligaciones mayores de las que se pretenden, por ejemplo la vigencia indefinida | Sí |
| J-02 | Las cláusulas del CCT sobre capacitación (modalidades, jornada, tiempo extra), escalafón y examen de capacidad, y si introducir una herramienta en línea requiere acuerdo previo con la sección | Sí |
| J-03 | La titularidad del CCT legitimado (reforma 2019) y las facultades de los representantes de la CMCAP para firmar el acta | Sí |
| J-04 | Que un piloto voluntario fuera del DC-2 no genera la obligación de DC-3 (arts. 153-A, 153-H, 153-V) ni de reportarlo en la DC-4 | Sí |
| J-05 | La relación con el art. 153-U (examen de suficiencia) y el art. 159 (examen de capacidad en escalafón) | Sí |
| J-06 | Si la capacitación dentro de la jornada en sala o kiosco cumple el art. 153-A y el CCT, y el tratamiento del uso fuera de la jornada (tiempo extra, arts. 66-68) | Sí |
| J-07 | **Aviso de privacidad simplificado** (texto al entrar a la app) e integral, conforme a la LFPDPPP vigente (confirmar la versión publicada en el DOF en 2025): ¿el identificador seudónimo persistente es dato personal?, base de tratamiento, derechos ARCO, conservación y borrado | Sí |
| J-08 | Si el modelo *opt-out* informado (RL-22) es suficiente o se requiere *opt-in* | Sí |
| J-09 | Requisitos contractuales antes de enviar datos a un LRS o LMS de un tercero (encargado, transferencia) | Sí |
| J-10 | El alcance del texto «Detenerte por seguridad nunca se sanciona» (RL-17) frente al RIT y la política SSO | Sí (con SSO) |
| J-11 | Si los instructores sindicalizados pueden participar en el piloto como facilitadores sin acuerdo de la CMCAP (Decisión 3) | Sí |
| J-12 | El carácter del acta (acuerdo de la CMCAP, no convenio modificatorio del CCT) y si debe depositarse o registrarse | Sí |

---

## 6. Ruta para cumplir D-011-4A

| # | Qué | Quién | Cuándo **[Supuesto]** |
|---|---|---|---|
| 1 | Decisión 3: instructores sindicalizados como facilitadores sin registro | Director | **2026-10-08** |
| 2 | Aplicar en el código RL-01, RL-04, RL-08, RL-10 (texto y aviso al entrar), RL-13 y, si se aprueba, las (R); actualizar `architecture.md` §4 bis («seudónimo») y release C7 | ADX (desarrollo) + ADX-07, con revisión final de RL | 2026-10-16 |
| 3 | Validación de Jurídico Laboral J-01 a J-12, más el aviso de privacidad | Jurídico Laboral | 2026-10-21 |
| 4 | Regla de exclusión LMS → DC-3 (RL-19) y ajustes P-1 y P-2 a TD-P09 y TD-P05 | TD-16/TD-17 + `experto-documentacion-mejora` + RL | 2026-10-21 (antes de cualquier conexión a LMS) |
| 5 | Reunión previa informal con la sección | Director o su designado, con RL y `gerente-personal-sindicalizado` | Semana del 2026-10-19 |
| 6 | Sesión de la CMCAP y firma del acta | CMCAP (TD-15 levanta el acta) | 2026-10-26 → 10-30 (plan de lanzamiento, semana 3) |
| 7 | Entrada del grupo sindicalizado | `gerente-personal-sindicalizado` / `sind-procesos` | Después de la firma (noviembre de 2026) |

---

## 7. Decisión requerida del Director

D-011-4A ya está decidida. Lo que sigue son decisiones para **ejecutarla**.

| # | Tema | Opciones | Recomendación | Riesgos | Costo **[Supuesto]** | Fecha límite |
|---|---|---|---|---|---|---|
| 1 | **Textos de la app** (§1) | **A)** Aplicar todos los CAMBIAR, (B) y (R), antes de la sesión de la CMCAP, para que la Comisión vea la versión final. **B)** Aplicar solo los (B): RL-01, RL-04, RL-08, RL-10, RL-13, más la condición RL-19. **C)** Dejar los textos actuales y resolverlo solo en el acta | **A** | A: ninguno relevante. B: quedan inconsistencias menores (RL-14, display xAPI, C7). C: **alto**; «Aprobaste», el aviso de registro tardío y el aviso de no uso parcial son justo lo que el sindicato puede objetar en la sesión | A: ≈ 0.5–1 día de desarrollo + nuevo e2e · B: ≈ 0.5 día · C: $0 | **2026-10-12** |
| 2 | **Acta de la CMCAP** (§4) | **A)** Usar la propuesta de §4 como posición de la Empresa, con una reunión previa informal y la sesión en la semana del 26 al 30 de octubre. **B)** Llevar solo una carta de la Empresa con la regla de uso (declaración unilateral), sin un acuerdo firmado. **C)** Posponer la entrada de los sindicalizados a la fase 2 | **A** | A: bajo; requiere una sesión y la validación de Jurídico. B: medio; la declaración unilateral protege menos y el sindicato no se siente parte. C: bajo en lo laboral, pero la población objetivo (nuevo ingreso sindicalizado) no se valida en 1–2 meses | A: $0 adicional (tiempo interno de la CMCAP ≈ 2 h × 6–8 personas) · B: $0 · C: costo de oportunidad | **2026-10-16** (para convocar) |
| 3 | **Instructores sindicalizados en el piloto actual** (R-RL-12) | **A)** Participan solo como facilitadores (operan la app frente al grupo con el registro desactivado) hasta el acuerdo. **B)** Participan como alumnos con el registro desactivado. **C)** Quedan fuera del piloto hasta el acuerdo | **A** | A: bajo; aprovecha su experiencia sin generar datos suyos. B: medio; siguen siendo sindicalizados usando la herramienta sin acuerdo. C: bajo, pero se pierden facilitadores clave | $0 | **2026-10-08** |
| 4 | **Conexión a LMS/LRS** | **A)** Ninguna conexión en la fase 1; antes de conectar, regla de exclusión probada (RL-19) y P-1 aprobado. **B)** Conectar ya solo con personal de confianza. **C)** Cambiar a una IRI propia en lugar de `passed` | **A** | A: ninguno; la evidencia agregada se saca con `exportXapi`. B: medio; si el automatismo de TD-P09 corre, puede generar DC-3 sin sustento (también para confianza). C: bajo, pero se pierde interoperabilidad | A: $0 · B: ≈ 2–3 días de TI · C: < 0.5 día | 2026-10-30 |

**Recomendación integral:** 1-A, 2-A, 3-A y 4-A. Cuando el Director decida, se registra en `equipo-director/decisiones/registro-de-decisiones.md` como D-011-4.1 a 4.4 y se actualiza `equipo-director/seguimiento-objetivos.md`.

---

## 8. Revisión cruzada requerida

| Área | Qué revisa |
|---|---|
| **Jurídico Laboral** | §5 completo (J-01 a J-12) y el aviso de privacidad |
| `experto-seguridad-salud` | RL-17 («Detenerte por seguridad nunca se sanciona») y la regla de derecho a detener el trabajo |
| `experto-documentacion-mejora` | P-1 y P-2 (TD-P09 y TD-P05), `architecture.md` §4 bis y el control de versiones del acta |
| `gerente-personal-sindicalizado` / `sind-procesos` | Logística del grupo sindicalizado, la sala, los kioscos y el borrado de datos al final de cada sesión |
| `experto-liderazgo-cambio` | Mensaje a supervisores: no pedir ni ver resultados individuales |
| ADX-07 / ADX (desarrollo) | Aplicar los textos de §1 y volver a correr las pruebas `app.test.tsx`, `assessment-analytics.test.ts` y e2e |

---

## 9. Cierre

**Resumen (5 líneas):**
1. Visto bueno laboral **condicionado**. 9 textos APROBADOS (más 2 elementos xAPI); 8 CAMBIAR (5 bloquean: RL-01, RL-04, RL-08, RL-10, RL-13); 4 CONDICIONES en xAPI (RL-18, RL-19, RL-21, RL-22).
2. El riesgo mayor no está en la UI: TD-P09 genera la DC-3 automáticamente para «quien aprobó». Hace falta una regla de exclusión antes de cualquier LMS.
3. El aviso de registro debe salir al entrar a la app y no prometer anonimato: el identificador es un seudónimo.
4. El acta de la CMCAP propuesta incluye la cláusula de no uso (6 incisos), el uso voluntario dentro de la jornada, el manejo de datos y la cláusula de no modificar el CCT.
5. Antes de abrir el piloto a sindicalizados: decisiones 1 a 4, Jurídico J-01 a J-12 y la firma del acta.

**Archivo creado:** `apps/academy/docs/reviews/review-relaciones-laborales.md` (este documento). No se editó código ni se hizo commit.

**Decisiones pendientes del Director:** 1) textos (2026-10-12); 2) acta de la CMCAP (2026-10-16); 3) instructores sindicalizados (2026-10-08); 4) conexión a LMS/LRS (2026-10-30).
