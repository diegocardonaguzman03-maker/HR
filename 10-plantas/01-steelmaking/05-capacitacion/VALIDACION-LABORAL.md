# Validación Laboral — Presentaciones (49) e Instrucciones de Trabajo (30) de la Acería

| Código | Versión | Estado | Alcance | Elaboró | Aprobó | Fecha |
|---|---|---|---|---|---|---|
| VAL-LAB-ACE-002 | 1.0 | Borrador para validación | `05-capacitacion/<CÓDIGO>/contenido.json` (campos `audiencia`, `roles`, `competencia.roles`, `validacion.laboral`) y `06-instrucciones-trabajo/IT-*.md` (encabezado, Mi puesto, Mi turno/jornada, Mi certificación) | experto-relaciones-laborales | **Pendiente — Director de C&D** | 2026-09-26 |

> **Mensaje clave para el Director.** Doy **visto bueno laboral** a los 79 materiales: 14 presentaciones sin observaciones, 35 presentaciones y las 30 IT **con observaciones**. Corregí lo que me toca: (1) vigencias alineadas al criterio 12 / 24 meses, incluida la de **C-04 en grúas/izaje (MO-OLL-02) homologada a 12 meses**; (2) códigos de rol y audiencias completas; (3) redacción sin mando para los sindicalizados (LFT art. 9): **avisan, detienen y escalan**; (4) en las 30 IT, una nota de que **la evaluación no es sanción**, de que existe el **examen de suficiencia (art. 153-U)** y de que el relevo es tiempo de trabajo. La observación de fondo: **43 asignaciones "R" de los manuales no coinciden con la matriz de DP-ACE-S**. Eso cambia quién debe certificarse. Hay que conciliarlas antes de cargar el plan DC-2 2027. No se comprometió nada con el sindicato.

**Fuentes:** `00-catalogo-procesos-y-roles.md` (CAT-ACE-001), `01-organizacion/descripciones-puesto-sindicalizados.md` y `-confianza.md` (v0.2, revisadas), `01-organizacion/REVISION-LABORAL.md` (REV-LAB-ACE-001), las ESPECIFICACION.md de `05-capacitacion/` y `06-instrucciones-trabajo/`, y la LFT (arts. 9, 58–61, 66–68, 153-A, 153-E, 153-U y 154–159). Las referencias legales **no están validadas**: verificar con Jurídico Laboral. No tengo el texto del CCT. Donde hace falta, lo marco como **[CCT: pedir texto]**.

**Método:** ediciones puntuales con reemplazo exacto de cadenas y control de concurrencia (se relee el archivo y se reintenta si otro experto lo modificó), porque otros expertos editan los mismos archivos en paralelo. No se reescribió ningún archivo completo. Los 49 JSON pasan `python3 -m json.tool`.

## A. Presentaciones (49 `contenido.json`)

### A.1 Hallazgos y correcciones

| # | Hallazgo | Corrección | Estado |
|---|---|---|---|
| P-01 | "Operador de grúa de CC / de producto" sin código de rol (S-27 no existe en el catálogo) en MM-CC-01, MM-CC-02, MO-CC1-01, MO-CC1-08, MO-CC2-01, MO-CC2-08 | Nombre homologado a "Grúa de CC 50 t (hoy S-15)" y "Grúa de producto (hoy S-17)", con "S-27 propuesto" donde cabe | Corregido; S-27 pendiente de decisión (D-5 de REV-LAB-ACE-001) |
| P-02 | "S-22 / S-20" sin nombre del rol (MM-CC-01, MM-CC-02); vigencia ambigua "24 / 12 meses" | "S-22 Hidráulico / S-20 Electricista"; vigencia "S-22: 24 · S-20: 12 meses" (NOM-029) | Corregido |
| P-03 | Audiencia incompleta: faltaban roles que ejecutan (R) | Se agregaron S-01 (MM-EAF-01/02/03), S-19 (MM-EAF-03), S-23 (MM-GR-01, MM-OLL-01), S-11 (MO-CC1-03), S-20 (MS-ACE-04), C-11/C-06/C-05 donde firman la liberación; "S-19 / S-22" y "S-22 · S-20" desglosados con nombre | Corregido |
| P-04 | Vigencias fuera del criterio 12 / 24 meses | MO-OLL-02 C-04: 24 → **12** (izaje). MO-EAF-02 C-17: 12 → "24; pórtico 12". MM-CC-03 S-12: 12 → 24. MO-CC2-09 C-09: "12 [Validar]" → "24; carta anual [Validar]". MO-CC1-08 y MO-CC2-08 S-17: "12 (izaje)" → "24; izaje 12". MO-OLL-01 S-24: "olla 12" → "confinado 12". MM-CC-02/03 S-19: redacción "24 meses; …12" | Corregido |
| P-05 | Faltaba la vigencia de 12 meses asociada a la tarea en el rol | MO-EAF-02 S-05: "pórtico e izaje 12" (electroimán). MO-EAF-08 S-02: "altura y señalero 12"; S-03: "altura e izaje 12". MM-CC-01 S-25: "POE 12". MO-CC2-03/04/06/07: S-12, S-13 y S-14 de CC2 con "radiación 12" (MS-ACE-07) | Corregido |
| P-06 | Certificaciones sin vigencia ("—") | MO-CC1-04 C-08 y MO-CC1-09 C-09: "24 meses" | Corregido |
| P-07 | Redacción de mando en roles sindicalizados | MO-CC2-08 S-17 "dirige la grúa" → "da señales a la grúa". MS-ACE-05 vigía "controla entradas" → "registra entradas". MS-ACE-10 "Supervisor u observador / Vigila la tarea" → "Supervisor u observador designado / Observa la tarea" | Corregido |
| P-08 | MS-ACE-08: la CMCAP "valida el régimen de descansos". El régimen de descansos por calor es materia de la Comisión Mixta de Seguridad e Higiene y del CCT, no de la CMCAP (art. 153-E) | Rol: "Relaciones Laborales / Comisión Mixta de SyH — Revisan el régimen de descansos con el sindicato (CCT)" | Corregido en `roles`. **Abierto** en `competencia.checklist` (campo de SSO): dice "validado con Relaciones Laborales y la CMCAP" |
| P-09 | **Discrepancias RACI manual ↔ matriz DP-ACE-S §5.** Hay 43 casos en que un sindicalizado es "R" en la presentación y en la DP aparece como C, I o vacío (tabla A.2). Un "R" obliga a certificarse, suma horas al DC-2 y puede leerse como materia de trabajo de la categoría | No cambié las letras: salen del manual, que ya tiene el visto bueno técnico | **Abierto**: conciliar en DP-ACE-S v0.3 o en los manuales (Decisión D-A) |
| P-10 | Roles fuera del catálogo como ejecutores: S-20 en MM-CC-01/02/03, S-26 en MM-CC-02, S-19 en MM-CC-04, S-04 en MM-EAF-01/03, S-21 en MM-EAF-02/04 | Se dejan como están y se marca la observación | **Abierto**: actualizar CAT-ACE-001 o los manuales |
| P-11 | MS-ACE-06 (todo el personal), MS-ACE-08 (personal expuesto, brigada) y MS-ACE-09 (brigadistas, todo el personal) tienen 12 meses aunque no están en las 5 categorías | Se conservan como excepción "manda la norma" (simulacros y brigadas NOM-002; estrés térmico NOM-015) | **Abierto**: SSO confirma la base normativa o se pasan a 24 meses |
| P-12 | MO-CC1-09: "Escarpador [Supuesto]" (S-18 o contratista REPSE) | Sin cambio | **Abierto**: D-5 y riesgo REPSE (arts. 12–15) |
| P-13 | La guía del instructor (generada por `build_deck.js`) dice "aún no competente y repite OJT", pero no dice que la evaluación no es sanción ni menciona el art. 153-U | Fuera de mis campos: no modifiqué el script | **Abierto**: experto-documentacion-mejora agrega a las notas de la lámina 10: "La evaluación no es sanción; conserva categoría y salario; puede pedir examen de suficiencia (art. 153-U)" |
| P-14 | Redacción de mando en campos de otros expertos: MM-EAF-02 `titulos.roles` ("S-22 manda en la energía hidráulica"), MO-CC2-01 `checklist` ("Dirige el izaje", S-15), MS-ACE-05 `seguridad` ("vigía… ordena la salida") | Fuera de mis campos | **Abierto**: sugiero "S-22 controla la energía hidráulica", "Da las señales del izaje" y "da la señal de salida" |

**Resultado en `validacion.laboral`:** "visto bueno — 2026-09-26" en 14 presentaciones (MO-CC1-02, MO-CC2-02, MO-EAF-01, 02, 04, 05, 07, MO-LF-01, MS-ACE-01, 02, 03, 05, 07, 10). "Visto bueno con observaciones — 2026-09-26" en las otras 35 (por P-01, P-09, P-10, P-11 o P-12).

### A.2 Discrepancias RACI por conciliar (sindicalizado "R" en la presentación y no R/A en DP-ACE-S)

| Proceso | Rol (DP-ACE-S) |
|---|---|
| MM-CC-01 | S-20 (—) |
| MM-CC-02 | S-20 (—), S-26 (—) |
| MM-CC-03 | S-20 (C), S-12 (C) |
| MM-CC-04 | S-19 (I) |
| MM-EAF-01 | S-01 (C), S-04 (—) |
| MM-EAF-02 | S-01 (C), S-21 (—) |
| MM-EAF-03 | S-01 (I), S-04 (I), S-19 (—) |
| MM-EAF-04 | S-01 (I), S-21 (C) |
| MM-GR-01 | S-23 (C) |
| MM-OLL-01 | S-09 (C), S-19 (—), S-22 (C), S-23 (—) |
| MO-CC1-03 / MO-CC2-03 | S-09 (—), S-11 (I); en CC2 además S-16 (I) |
| MO-CC1-04 / MO-CC2-04 | S-11 (C) |
| MO-CC1-05 / MO-CC2-05 | S-14 (—) / S-11 (—) |
| MO-CC1-06 / MO-CC2-06 | S-15 (C) / S-12 (C) |
| MO-CC1-07 / MO-CC2-07 | S-09 (I), S-16 (I) / S-16 (I) |
| MO-CC1-09 / MO-CC2-09 | S-11 (I), S-17 (C) |
| MO-EAF-03 | S-02 (I) |
| MO-EAF-06 / MO-EAF-08 | S-01 (C) |
| MO-OLL-01 | S-09 (I) |
| MO-OLL-02 | S-06 (C) |

Criterio que propongo: **"R" solo si el rol ejecuta pasos ★ del proceso**. En ese caso se certifica y entra a la matriz de DP-ACE-S. Si solo avisa, apoya o firma una liberación de operación, queda como C o I y no se certifica en ese proceso.

## B. Instrucciones de trabajo (30 IT)

| # | Hallazgo | Corrección | Estado |
|---|---|---|---|
| I-01 | "Revisión laboral: Pendiente" en las 30 IT | "experto-relaciones-laborales — visto bueno (con observaciones), 2026-09-26" | Corregido (30) |
| I-02 | S-12 a S-26 no decían que el puesto es sindicalizado | "sindicalizado" en la fila Rol | Corregido (15) |
| I-03 | La fila "Reporta a" de S-02, S-03, S-07, S-13 y S-14 decía "coordinación / guía técnica del S-xx" y podía leerse como línea de mando entre sindicalizados | "Recibe la secuencia (o guía) técnica del S-xx, sin relación de mando (LFT art. 9)". Se revisó la línea de reporte de las 30 IT contra DP-ACE-S y DP-ACE-C: coinciden | Corregido |
| I-04 | 24 IT sindicalizadas no decían en "Mi puesto" que el trabajador no tiene mando | Se agregó: "Sin funciones de mando (LFT art. 9): si algo no está bien, aviso, detengo y escalo a C-xx" (en segunda persona en S-12 a S-18) | Corregido (24; S-01 y S-02 ya lo tenían) |
| I-05 | S-19, S-20, S-21, S-23, S-24 y S-25 decían que el Técnico A "lidera", "libera" o es "soldador líder" | "Coordina técnicamente, da el liberado técnico, evaluador en pareja; sin mando" y "referente técnico de soldadura" | Corregido |
| I-06 | La jornada no se mencionaba. Los diagramas muestran llegada a las 06:30–06:45 / 18:30–18:45, antes del relevo de las 07:00 / 19:00 (tiempo a disposición del patrón, art. 58). C-04 decía "entrega–recepción 15 min antes" | Turno: "jornada según el CCT [CCT: pedir texto]" (26 S). Nota "Mi jornada" en "Mi turno": el relevo es tiempo de trabajo, se cuenta o se paga según el CCT, y los arts. 59–61 y 66–68 y la reforma de 40 h están en revisión (30). C-04: el relevo "cuenta como tiempo de trabajo" | Corregido; el fondo (4x4 de 12 h) sigue abierto (J-1, J-2 de REV-LAB-ACE-001) |
| I-07 | La sección "Mi certificación" no decía que la evaluación no es sanción, ni mencionaba el examen de suficiencia, el escalafón, la suspensión preventiva o la capacitación en jornada | Nota laboral en las 26 IT S (6 puntos) y en las 4 IT C (6 puntos, que incluyen cómo evalúan a sindicalizados y cómo asignan suplencias por escalafón) | Corregido (30) |
| I-08 | C-04: MO-OLL-02 con 24 meses y la nota "pendiente de homologar" | **12 meses** (grúas/izaje), alineado con DP-ACE-C y con la presentación MO-OLL-02 | Corregido en la IT y en el JSON. **Abierto:** el manual MO-OLL-02 §11 sigue en 24 meses |
| I-09 | Vigencias de ILUO, horas y 12 / 24 meses de las 30 IT comparadas con la fila "Vigencia" de cada plan de DP-ACE-S y DP-ACE-C | Coinciden en los 30 puestos (alturas, confinados, grúas/izaje, eléctrico, radiación) | Sin cambio |
| I-10 | Horas de teoría y OJT distintas entre manual y DP (S-06, S-09, S-18) y meta de tiempo del laboratorio (S-11: ≤ 3 contra ≤ 4 min) | Las IT ya lo marcan "pendiente de homologar" | **Abierto**: el Gerente Sindicalizado homologa las horas antes del DC-2 |
| I-11 | S-25 trabaja en horario de día, pero la nota de jornada menciona el relevo de las 07:00 / 19:00 | Se deja la nota genérica ("pactado en el CCT") | Observación menor |

## C. Temas para el sindicato y la CMCAP (preparar la posición; no se compromete nada sin autorización del Director)

| # | Tema | Foro | Posición propuesta | Beneficio para el trabajador |
|---|---|---|---|---|
| T-1 | Vigencias de 12 meses (alturas, confinados, izaje, eléctrico, radiación), incluidos C-04 y los S de CC2 con radiación | CMCAP (plan DC-2 2027) | Recertificación en jornada, en bloques del día de relevo | DC-3 vigente y más seguridad |
| T-2 | Tiempo de relevo (06:45 / 18:45) y capacitación en rol 4x4 | Sindicato + Jurídico | Contar el relevo como jornada o pagarlo según el CCT; capacitación en jornada | Pago correcto del tiempo trabajado |
| T-3 | Uso de las evaluaciones: no es sanción; reevaluación [Supuesto: 2 en ≤ 60 días]; suspensión preventiva ≤ 15 días sin pérdida de salario | Sindicato + Comisión Mixta de SyH | Texto de las IT como base del acuerdo | Protección frente a sanciones por evaluación |
| T-4 | Examen de suficiencia (art. 153-U) abierto para todos los pasos ★ | CMCAP | Calendario trimestral de exámenes | Ascenso sin cursar lo que ya sabe |
| T-5 | Nuevos "R" de la tabla A.2 (p. ej. S-01 en mantenimiento del EAF, S-26 en segmentos, S-09 en MM-OLL-01) | CMCAP (DNC por categoría) | Certificar solo a quien ejecuta pasos ★ | Carga de formación justa y reconocida |
| T-6 | Régimen de descansos por calor (MS-ACE-08) | Comisión Mixta de SyH + sindicato (no la CMCAP) | Régimen WBGT por puesto con relevos pagados como jornada | Salud y jornada protegida |
| T-7 | S-27 Operador de Grúa de CC y Producto (hoy lo cubren S-15 y S-17) | Sindicato (CCT) | Categoría propia con certificación NOM-006 de 12 meses | Reconocimiento de la categoría de izaje |
| T-8 | Técnicos A y operadores de púlpito como "evaluadores en pareja", sin dictamen ni mando | Sindicato | Tal como está en las IT | Carrera técnica reconocida |

## D. Puntos a verificar con Jurídico Laboral

| # | Punto |
|---|---|
| J-1 | El art. 58 y el tiempo de relevo antes de la jornada; la cláusula del CCT sobre el 4x4 (arts. 59–61, 66–68) y la reforma de 40 h |
| J-2 | La redacción de las notas de certificación de las IT frente a los arts. 153-A, 153-U y 154–159 y frente al Reglamento Interior de Trabajo (acto inseguro deliberado, audiencia y representación sindical) |
| J-3 | La base normativa de las vigencias de 12 meses que no están en las 5 categorías (NOM-002 brigadas y simulacros, NOM-015), junto con SSO |
| J-4 | El escarpeo con contratista (MO-CC1-09): riesgo REPSE (arts. 12–15) |

## E. Revisión cruzada requerida

- **experto-seguridad-salud:** P-08 (checklist de MS-ACE-08), P-11 (vigencias de 12 meses de MS-ACE-06/08/09), P-14 (vigía de MS-ACE-05), "radiación 12" en S-12/S-13/S-14 de CC2 y "Revisión de seguridad" pendiente en las IT.
- **experto-operativo-metalurgia:** conciliar la tabla A.2 (los "R" salen de los manuales) y el manual MO-OLL-02 §11 (vigencia de C-04).
- **experto-documentacion-mejora:** P-13 (nota no punitiva en `build_deck.js`), P-14 (`titulos.roles` de MM-EAF-02) y DP-ACE-S v0.3 con la matriz conciliada.
- **gerente-personal-sindicalizado:** horas de OJT y de teoría por homologar (I-10) y efecto de A.2 en el DC-2.

## Decisión requerida del Director

| # | Tema | Opciones | Recomendación | Riesgos | Costo | Fecha límite |
|---|---|---|---|---|---|---|
| D-A | Conciliar los 43 "R" de la tabla A.2 | **A.** Aplicar el criterio "R = ejecuta pasos ★" y actualizar DP-ACE-S v0.3 y los manuales antes de la DNC. **B.** Aceptar los manuales como están y ampliar la matriz de la DP. **C.** Dejarlo para la versión 1.0 | **A** | B: más horas de certificación y reclamos de materia de trabajo o categoría. C: el DC-2 2027 sale con una población equivocada | Horas internas (≈ 2 sesiones con Operativo y Gerente Sindicalizado) [Supuesto] | 2026-10-16 (cierre de la DNC) |
| D-B | Tiempo de relevo antes de las 07:00 / 19:00 | **A.** Pedir dictamen a Jurídico y ajustar los diagramas para que el relevo quede dentro de la jornada. **B.** Mantener la llegada anticipada y pagarla según el CCT. **C.** No cambiar nada | **A** | C: exposición a reclamos de tiempo extra (art. 58) | Escenario B: ≈ 15 min × 159 trabajadores por turno y por día [Supuesto; cuantificar con Nómina] | 2026-10-30 |
| D-C | Llevar T-1 a T-8 a la CMCAP y al sindicato | **A.** Autorizar que prepare el guion y el acta modelo para la siguiente sesión de la CMCAP. **B.** Solo T-1 y T-4 (DC-2). **C.** Esperar a D-A y D-B | **A**, después de D-A | Presentar los "R" sin conciliar genera discusiones de categoría | Horas internas | Sesión de la CMCAP de noviembre 2026 [Supuesto] |

## Resumen, archivos y decisiones pendientes

**Resumen (5 líneas):**
1. Visto bueno laboral: 14 presentaciones sin observaciones, 35 con observaciones y las 30 IT con observaciones.
2. Vigencias alineadas a 12 / 24 meses, incluida la de C-04 en grúas/izaje (12 meses); códigos de rol y audiencias corregidos.
3. Redacción sin mando (art. 9) en roles, "Reporta a" y "Mi puesto"; en las 30 IT, la evaluación no es sanción y se menciona el art. 153-U.
4. Nueva nota de jornada: el relevo previo a las 07:00 / 19:00 es tiempo de trabajo (art. 58).
5. Queda abierto: conciliar los 43 "R" con DP-ACE-S, el S-27, las vigencias de MS-ACE-06/08/09 con SSO y el manual MO-OLL-02 §11.

**Archivos modificados:** 49 `05-capacitacion/*/contenido.json` (solo los campos laborales) y 30 `06-instrucciones-trabajo/IT-*.md` (encabezado, "Mi puesto", "Mi turno" y "Mi certificación"). **Creado:** este archivo.

**Decisiones pendientes del Director:** D-A, D-B y D-C. También siguen abiertas D-1 a D-5 de REV-LAB-ACE-001.
