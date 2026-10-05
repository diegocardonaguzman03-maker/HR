# Aprobación de liberación — ACERÍA DIGITAL ACADEMY, MVP 0.1 (piloto)

| Código | Versión | Estado | Emite | Fecha | Base verificada |
|---|---|---|---|---|---|
| ADX-REL-001 | 0.1 | **DRAFT — NOT VALIDATED** (dictamen del Product Director; la decisión es del Director de C&D) | ADX-01 Product Director | 2026-10-05 | Commit `11eab07` (árbol limpio), `docs/reviews/*`, `docs/qa-report.md`, `docs/performance-report.md`, `docs/validation-checklist.md`, `tests/e2e/report.json` (2026-10-05 16:27, 13/13 sobre `dist/`) |

> ## Dictamen: **APROBADO PARA PILOTO CONTROLADO, CON CONDICIONES**
>
> **Mensaje clave.** No queda ningún CRITICAL ni HIGH abierto **dentro de lo que se libera**. El único HIGH vigente es del asistente «Pregunta a Acería AI» (salida `no-source` sin indicación de conducta, review-seguridad §8.11). La corrección §8.11-D ya está en el código, pero falta la ronda independiente de ADX-RED y la firma de ADX-04. Por eso el asistente **sale del piloto** (opción B definitiva de ADX-04): queda oculto con la bandera `VITE_ASSISTANT` y no aparece en los builds `dist/` ni `web/`. La UI, el contenido, la evaluación, los PDF, el video y el modelo 3D se liberan **sin veto**. El piloto con **personal sindicalizado** espera el visto bueno de Relaciones Laborales y de Jurídico Laboral a los textos de uso (sección 6, decisión 4).

---

## 1. Tabla de validación multidisciplinaria final

| Área | Agente | Dictamen | Condiciones |
|---|---|---|---|
| **METALLURGY** | ADX-02 Metalurgista EAF | **APROBADO** (re-revisión R.4) | Ninguna. MET-01 a MET-09 cerrados en el JSON y en los PDF; las 9 preguntas `q.asm-*` son correctas y no tienen valores de planta |
| **OPERATIONS** | ADX-03 SME de Operaciones | **APROBADO CON CONDICIONES** → **condiciones cumplidas** | OPS-01 (HIGH, EBT a 90° de la puerta) cerrado con la opción A. OPS-16 y OPS-17 (MEDIUM): video y PDF regenerados con el GLB nuevo; verificado por fechas: GLB 15:55 → imágenes 16:07 → PDF, `.webm` y `.vtt` 16:18. Pendiente menor: que ADX-03 confirme a la vista que el EBT aparece opuesto a la puerta en el video y en las imágenes de los PDF (condición C3). Los LOW OPS-18 y OPS-19 siguen sin aplicar (no bloquean); OPS-08 y OPS-15 ya están aplicados |
| **SAFETY** (veto) | ADX-04 Ingeniero de Seguridad + ADX-RED Seguridad | **LIBERABLE SIN VETO** para la UI, el contenido, la evaluación, los PDF y el 3D (V1–V8 cumplen). **VETO VIGENTE solo sobre el asistente**: recomendación definitiva, opción B (§8.11) | Asistente oculto en el piloto (`src/lib/features.ts`; verificado: `TopBar.tsx` y `App.tsx` lo condicionan y el e2e «asistente oculto» pasa). Reactivación solo con §8.11-D (aplicada), test en verde, ronda ADX-RED independiente de 20 preguntas (0 `answer` y 0 `no-source` sin `NO_SOURCE_SAFE` ante preguntas peligrosas) y firma de ADX-04. Lista de preguntas críticas confirmada (§8.3) |
| **TRAINING** | ADX-07 Diseño de Aprendizaje | **APROBADO PARA PILOTO CONTROLADO, CON CONDICIONES** (re-revisión R3) | TRN-01 a TRN-07 (HIGH) cerrados. Antes del piloto con sindicalizados: visto bueno de RL y Jurídico a TRN-03, TRN-12 y TRN-18; decisión de la regla de uso (formación §6); piloto dentro de la jornada. La revisión técnica y de seguridad de los `q.asm-*` ya se hizo (metalurgia R.2 y seguridad §8.3). TRN-11 y TRN-15 (MEDIUM) quedan para la v0.2 |
| **RED TEAM — UX** | adx-red-ux | **HIGH cerrados** (RT-UX-01 a 04) | Verificado en el código: foco del modal con *ref* (UX-01), `setMode` limpia la selección (UX-02), arco a ≤ 1.5 Hz y sin oscilación con *reduced motion* (UX-03), `.vtt` versionado y probado en e2e (UX-04). Los MEDIUM y LOW pasan al backlog. Riesgo: ver R5 |
| **RED TEAM — SOFTWARE** | adx-red-software | **CRITICAL y HIGH cerrados** | RT-SW-01 (nodos por `nodeNames` + validación en `crossCheck`), RT-SW-02 (`ErrorBoundary` de escena y modo sin 3D), RT-SW-03 (respuesta fantasma), RT-SW-04 (el progreso se conserva al consultar una ficha; la política está en la decisión 3), RT-SW-05 (sufijos `_n` del GLB). RT-SW-06 (filtro del asistente) quedó superado por las rondas de ADX-04 y por el asistente oculto |
| **RED TEAM — SAFETY** | adx-red-safety (con ADX-04) | **Igual que SAFETY** | 1 CRITICAL y 5 HIGH de la primera ronda cerrados. El HIGH residual del asistente queda fuera del piloto |
| **RED TEAM — PERFORMANCE** | adx-red-performance | **HIGH cerrados** (RT-PERF-01 a 03) | *Hover* imperativo sin re-render, selectores de zustand y 3D fuera de la ruta crítica (≈ 150 KB gzip, antes ≈ 543 KB). FPS en hardware real **no medido** (MEDIUM, condición C5) |
| **QA** | ADX-13 QA y Rendimiento | **VERDE** | Verificado por el orquestador: `check:content` válido (215 campos SME_REQUIRED, 0 `PLANT_APPROVED`), typecheck sin errores, **202/202** unitarias, **13/13** e2e en Chromium sobre `dist/` y sobre `web/`. `qa-report.md` todavía dice 116 pruebas: está desactualizado (LOW, R7) |
| **Producto** | ADX-01 Product Director | **APROBADO PARA PILOTO CONTROLADO, CON CONDICIONES** | Sección 5 |
| **Decisión final** | **Director de C&D** | *Pendiente* | Sección 6 |

---

## 2. Alcance del MVP «uno de cada uno» contra lo entregado

| Elemento (plan maestro §H) | Comprometido | Entregado | Estado |
|---|---|---|---|
| Etapa del proceso | 03 Fusión, con alimentación continua de DRI | `processes.json` › `stage.melt` (Fusión) con cámara guiada; las otras 5 etapas son navegables con contenido general y `SME_REQUIRED` | **Cumple** |
| Sistema de equipo principal | Electrodos, brazos, mástiles y regulación, transformador y barras | `equipment.json`: electrodos, brazos y mástiles, transformador y circuito secundario, con fichas de 9 pestañas; 15 equipos en total | **Cumple** |
| Instrucción de trabajo | Revisión del sistema de electrodos antes de reanudar la fusión (DEMO) | `work-instructions.json` y modo EJECUTAR, con banner DEMO, ALTO y escalamiento; pasos de planta `SME_REQUIRED` | **Cumple** |
| Módulo de seguridad | Energía eléctrica, energía almacenada y metal líquido | `training.json` › `mod.eaf-energy-safety` + 12 peligros | **Cumple** |
| Módulo de entrenamiento | Conoce el sistema de electrodos y la fusión (niveles 1–3) | `mod.electrode-melting` (más `mod.eaf-orientation`) | **Cumple** |
| Evaluación | Identificar en 3D, ordenar, peligro → control, escenario | `asm.eaf-electrode`: banco paralelo `q.asm-*`, 3 preguntas críticas eliminatorias, «no certifica competencia» | **Cumple** |
| Video | Placeholder con reproductor completo, grabado de la escena | `public/videos/melt-overview.webm` + `.vtt`, con capítulos, subtítulos y pantalla completa (regenerados 16:18) | **Cumple** |
| Documento descargable | WI detallada + job aid en PDF, estado DEMO | 4 PDF en `public/documents/` (WI, tarjeta de apoyo y 2 guías) con marca de agua en todas las páginas | **Cumple** (excede) |
| Asistente IA | Pregunta a Acería AI con contexto, citas y negativa sin fuente | Construido y probado (168 casos), pero **oculto en el piloto** por el veto de ADX-04 | **Construido, no liberado** (decisión 1) |
| Escena | EAF completo, incluido el 5.º agujero de DRI | `src/assets/eaf.glb`: 252 KB, 25 k triángulos, 15 sistemas y 19 componentes; EBT opuesto a la puerta de escoria | **Cumple** |

**Resultado:** 9 de 10 elementos se liberan. El asistente se entrega como capacidad construida y queda para una segunda liberación.

---

## 3. Los 14 entregables del encargo

*Nota: el texto original del encargo no está en el repositorio. La lista se arma con el plan maestro (§B, §I y la historia 17 de §J) y con el README.*

| # | Entregable | Ruta | Estado |
|---|---|---|---|
| 1 | Aplicación funcional (build de producción y build autocontenido) | `apps/academy/dist/` · `apps/academy/web/index.html` | Listo (asistente oculto) |
| 2 | Código fuente y pruebas | `apps/academy/src/` · `apps/academy/scripts/` · `apps/academy/tests/` | Listo |
| 3 | README | `apps/academy/README.md` | Listo; desactualizado en el asistente (R7) |
| 4 | Plan maestro A–J | `apps/academy/docs/00-plan-maestro.md` | Listo |
| 5 | Arquitectura | `apps/academy/docs/architecture.md` | Listo |
| 6 | Esquema de contenido | `apps/academy/docs/content-schema.md` | Listo |
| 7 | Sistema de diseño | `apps/academy/docs/design-system.md` | Listo |
| 8 | Lineamientos 3D y contrato de nodos | `apps/academy/docs/3d-asset-guidelines.md` · `apps/academy/docs/nodos-3d.md` | Listo |
| 9 | Plantillas de contenido | `apps/academy/docs/templates/` (5 plantillas) | Listo |
| 10 | Revisiones de seguridad y multidisciplinarias | `apps/academy/docs/safety-review.md` · `apps/academy/docs/reviews/review-seguridad.md` · `review-metalurgia-operaciones.md` · `review-formacion.md` · `red-team-tecnico.md` | Listo |
| 11 | Informe de QA | `apps/academy/docs/qa-report.md` | Listo; cifras desactualizadas (R7) |
| 12 | Informe de rendimiento | `apps/academy/docs/performance-report.md` | Listo; falta medir en hardware real (C5) |
| 13 | Lista de verificación de validación | `apps/academy/docs/validation-checklist.md` | Lista; firmas pendientes (C6) |
| 14 | Backlog de la fase 2 | `apps/academy/docs/backlog-fase-2.md` | Listo |

Activos de contenido incluidos en el entregable 1: `src/content/*.json`, `src/assets/eaf.glb`, `public/documents/*.pdf`, `public/videos/melt-overview.{webm,vtt}` y `public/images/*.png`. Este dictamen (`docs/release-approval.md`) cierra la historia 16.

---

## 4. Riesgos residuales

| # | Riesgo | Severidad | Mitigación | Dueño |
|---|---|---|---|---|
| R1 | El asistente funciona con reglas de texto y no entiende la intención. Una pregunta peligrosa redactada como explicativa recibe extractos educativos | HIGH (fuera del piloto) | Oculto con bandera. Antes de reactivarlo: ronda ADX-RED + firma ADX-04. Todo LLM futuro requiere una revisión ADX-04 completa | ADX-12 / ADX-04 |
| R2 | Uso de los resultados para escalafón, ascensos, sanciones o DC-3 sin acuerdo de la CMCAP | HIGH laboral si ocurre | Textos `NOT_FOR_HR` y de registro ya en la app; xAPI marcado como no certificante. Falta el visto bueno de RL y Jurídico (decisión 4). Hasta entonces, sin piloto con sindicalizados | experto-relaciones-laborales |
| R3 | Todo el contenido es DEMO, educativo o borrador; 215 datos de planta siguen como `SME_REQUIRED` | Por diseño | Aviso permanente, chips de estado, marca de agua y nada `PLANT_APPROVED`. Taller SME F2-01 (decisión 5) | experto-operativo-metalurgia |
| R4 | FPS no medido en el hardware de planta (en el contenedor: 4 FPS con SwiftShader, no representativo) | MEDIUM | Calidad Auto y modo sin 3D. Medir en 3 equipos reales en la primera semana del piloto | ADX-13 + TI |
| R5 | Los red teams técnicos no hicieron una re-revisión formal escrita; el cierre de los CRITICAL y HIGH lo verificaron QA (e2e y unitarias) y ADX-01 (revisión del código). Siguen abiertos 17 MEDIUM y 8 LOW de UX, software y rendimiento | MEDIUM | Re-revisión rápida de adx-red-ux, adx-red-software y adx-red-performance durante el piloto; los MEDIUM y LOW pasan a la v0.2 | ADX-13 |
| R6 | La consulta de fichas durante la evaluación funciona como «libro abierto» (RT-SW-04): el puntaje N2 puede salir inflado | MEDIUM | Decisión 3 | Director / ADX-07 |
| R7 | Documentación desactualizada: `qa-report.md` (116 pruebas en lugar de 202) y `README.md` (presenta el asistente como incluido) | LOW | Actualizar antes de distribuir el paquete | ADX-11 / ADX-13 |
| R8 | Formación: TRN-11 (N1 de reacción y `completed` sin checks) y TRN-15 (marca de agua de los PDF como texto extraíble, que afecta a los lectores de pantalla) | MEDIUM | La reacción N1 se mide con un formato externo en el piloto; v0.2 | ADX-07 / ADX-06 |
| R9 | LOW de operaciones sin aplicar: OPS-18 («carga suspendida» para el brazo) y OPS-19 (forma de avisar al púlpito) | LOW | Corrección de texto en la v0.2 o antes, si se regenera contenido | ADX-03 / ADX-06 |
| R10 | Brecha digital o de lectura en una parte del personal | MEDIUM | Modo facilitado por un instructor, guía impresa y piloto dentro de la jornada | sind-procesos |

---

## 5. Dictamen del Product Director

> ## **APROBADO PARA PILOTO CONTROLADO**
>
> **Por qué se aprueba:** no hay ningún CRITICAL abierto en lo que se libera. Los HIGH prácticos están cerrados: seguridad (salvo el asistente, que sale del piloto), operaciones (OPS-01), formación (TRN-01 a TRN-07) y red team técnico (2 CRITICAL y 11 HIGH). Metalurgia aprueba. Seguridad no veta nada de lo que se libera. QA está en verde. El único HIGH que sigue abierto vive en una función que **no se publica** en este build, y así lo pide el propio ADX-04.
>
> **Condiciones:**
> - **C1.** Publicar solo builds sin `VITE_ASSISTANT=on`. Ningún build con el asistente sale del repositorio sin la firma de ADX-04.
> - **C2. Población del piloto:** primero instructores, supervisores y personal de confianza de Acería. El nuevo ingreso **sindicalizado** entra solo después de la decisión 4 (visto bueno de RL y Jurídico, y regla de uso ante la CMCAP). El piloto se hace dentro de la jornada, en sala o kiosco, con un instructor presente. Tamaño sugerido: ≤ 20 participantes durante 2–3 semanas **[Supuesto]**.
> - **C3.** ADX-03 confirma a la vista, antes de la primera sesión, que el EBT aparece opuesto a la puerta de escoria en el video y en las imágenes de los PDF (≈ 15 min).
> - **C4.** Actualizar `qa-report.md` y `README.md` con el estado real: 202 pruebas y asistente oculto.
> - **C5.** Medir FPS y tiempo de carga en 3 equipos reales y en la red de planta durante la primera semana. Si el resultado es < 30 FPS en Media, usar Baja como predeterminada.
> - **C6.** Llenar las firmas de `validation-checklist.md` con los dictámenes de la sección 1 (lo hace ADX-14 cuando el Director decida).
> - **C7.** Ningún resultado ni avance del piloto se registra como DC-3, certificación TD-P07, examen de suficiencia (LFT art. 153-U), examen de capacidad para escalafón ni dato de desempeño. La evidencia es solo agregada (N1–N2) y no entra al flujo TD-P09. *(Texto de RL, ADX-RL-001; verificar con Jurídico Laboral.)*
>
> **Qué haría cambiar este dictamen a NO APROBADO:** que se publique un build con el asistente activo, que aparezca un valor de planta sin `SME_REQUIRED`, o que se use el resultado con fines laborales antes del visto bueno de RL.

---

## 6. Decisión requerida del Director

| # | Tema | Opciones | Recomendación | Riesgos | Costo **[Supuesto]** | Fecha límite |
|---|---|---|---|---|---|---|
| 1 | **Asistente «Pregunta a Acería AI»** (review-seguridad §8.11) | **A)** Confirmar la opción B de ADX-04: piloto con el asistente oculto y segunda liberación después de la ronda ADX-RED de 20 preguntas y la firma de ADX-04. **B)** Activarlo ya con §8.11-D aplicada, sin la ronda independiente. **C)** Sacar el asistente del MVP y dejarlo para el RAG de la fase 2 (F2-06) | **A** | A: bajo; el asistente se retrasa ≈ 1–2 semanas. B: **ADX-04 mantiene el veto**; un nuevo ingreso puede recibir una respuesta sin «detente y avisa» ante un peligro real. C: bajo, pero se pierde una pieza del alcance y el trabajo ya validado | A: ≈ 1 día-persona (ronda ADX-RED + firma) · B: $0 · C: $0 | **2026-10-07** |
| 2 | **Disposición EBT opuesta a la puerta de escoria** (OPS-01, ya aplicada) | **A)** Ratificar la opción A ya aplicada (EBT y puerta sobre el eje de basculamiento, en lados opuestos). **B)** Volver a la geometría anterior con un rótulo de «disposición esquemática». **C)** Sin cambio adicional, solo registrarlo | **A** (ratificar y registrar) | A: ninguno; ya está regenerado y probado. B: medio; se enseña mal la línea de fuego del vaciado y hay que regenerar todo de nuevo | A: $0 · B: ≈ 1 día de retrabajo | 2026-10-12 |
| 3 | **Consulta de fichas durante la evaluación** (RT-SW-04) | **A)** Mantener lo actual: se puede consultar una ficha sin perder el avance (libro abierto); la evaluación se reporta como formativa. **B)** Bloquear el clic 3D, los hotspots y la lista lateral mientras haya una evaluación activa. **C)** Permitirlo, pero registrar en xAPI cada consulta para analizar su efecto en el puntaje | **A para el piloto**, con lectura «a libro abierto» del N2. Revisar en la v0.2 con los datos del piloto (B si el puntaje sale inflado) | A: N2 algo inflado; aceptable porque la evaluación no certifica. B: cambio de código después de la aprobación; hay que volver a correr el e2e y retrasa el piloto ≈ 1 día. C: más datos, pero más trabajo y una revisión de privacidad | A: $0 · B: < 0.5 día · C: ≈ 1 día | 2026-10-12 |
| 4 | **Visto bueno de Relaciones Laborales y Jurídico** a los textos de no uso para escalafón (`NOT_FOR_HR`, TRN-03), al aviso de registro y de equipo compartido (TRN-12, LFPDPPP), al encabezado del resultado (TRN-18) y a la cláusula LMS/DC-3 (SAF-11); regla de uso de resultados (formación §6) | **A)** Enviarlos ya a `experto-relaciones-laborales` y a Jurídico Laboral, llevar la regla de uso a la CMCAP y abrir el piloto a sindicalizados cuando haya acuerdo. **B)** Publicar los textos sin pasar por la CMCAP. **C)** Hacer todo el piloto solo con personal de confianza | **A**, y mientras tanto la población de C2 | A: bajo; requiere una sesión de la CMCAP. B: medio; el sindicato puede objetar el registro de datos aunque sea anónimo. C: bajo en lo laboral, pero retrasa 1–2 meses la validación con la población objetivo | A: $0 adicional (tiempo interno) · B: $0 · C: costo de oportunidad de 1–2 meses | **2026-10-30** |
| 5 | **Taller de validación SME (F2-01)**: llenar los 215 campos `SME_REQUIRED` del EAF con procedimientos aprobados y las firmas de Seguridad y Operaciones | **A)** Convocarlo ya, en paralelo al piloto (3–4 semanas), con la Superintendencia EAF, Seguridad y `experto-operativo-metalurgia`. **B)** Esperar el resultado del piloto para priorizar los campos. **C)** No convocarlo y mantener la plataforma como contenido educativo general | **A** | A: carga de los SME de planta durante la operación; hay que priorizar el sistema de electrodos y la seguridad. B: retrasa 1–2 meses cualquier contenido `PLANT_APPROVED`. C: la plataforma nunca pasa de demostración | A: ≈ 100–120 h-persona de SME ≈ MXN 60–80 k en tiempo interno · B: igual, pero diferido · C: $0 | 2026-10-15 (ventana de validación MS-ACE) |

**Recomendación integral:** 1-A, 2-A, 3-A, 4-A y 5-A. Así el piloto controlado arranca de inmediato con instructores y personal de confianza, sin asistente y con lo laboral resuelto antes de abrirlo a sindicalizados.

Cuando el Director decida, se registra en `equipo-director/decisiones/registro-de-decisiones.md`. Referencias legales (LFT, CCT, LFPDPPP, NOM-STPS): verificar con Jurídico Laboral.
