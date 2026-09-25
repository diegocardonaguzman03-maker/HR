# Validación de seguridad de los materiales de capacitación de la Acería

| Código | Versión | Estado | Revisó | Referencias | Fecha |
|---|---|---|---|---|---|
| VS-ACE-CAP-001 | 1.0 | Para conocimiento y decisión del Director | experto-seguridad-salud | Serie MS-ACE revisada · `04-seguridad/REVISION-SEGURIDAD.md` (criterios unificados) · manuales MO/MM · `05-capacitacion/ESPECIFICACION.md` · `06-instrucciones-trabajo/ESPECIFICACION.md` | 2026-09-26 |

**Mensaje clave:** doy visto bueno de seguridad a las **49 presentaciones** y a las **30 instrucciones de trabajo (IT)**. En 7 presentaciones y 12 IT el visto bueno lleva observaciones, que ya corregí en el texto. Las demás no tenían observaciones. Las marcas ★ (`critico`) de las 49 presentaciones coinciden con los pasos ★ de su manual; lo comprobé con un script. La prueba de frenos de la grúa de colada quedó homologada a **200–300 mm y 10 s** (MS-ACE-04). La frecuencia de prueba del agua de emergencia quedó homologada al valor de MM-CC-03: **prueba de cambio mensual en paro y arranque de diésel semanal**. **Los materiales no se usan en planta** hasta que se validen los valores marcados [Supuesto] o [Validar] y el Director tome las decisiones D-1 a D-5 de `REVISION-SEGURIDAD.md`.

**Alcance de edición.** En las presentaciones solo cambié `seguridad`, `reglas`, las marcas `critico`, `competencia.checklist` y `validacion.seguridad`. La única excepción es MO-OLL-02, donde el encargo C pidió homologar la prueba de frenos en toda la presentación. En las IT solo cambié la sección 2 (reglas de oro), la 5 (EPP), los recuadros ALTO, la 7 (controles críticos), la 8 (si algo sale mal) y la celda "Revisión de seguridad". Las excepciones fueron IT-S09, IT-S12 e IT-C06, en las filas de la prueba de frenos y del agua de emergencia (encargo C). Todos los cambios fueron ediciones puntuales. Validé los JSON con `python3 -m json.tool`. No hice commits.

## 1. Criterios que verifiqué en cada documento

| Tema | Criterio unificado | Resultado |
|---|---|---|
| LEL | Se entra con < 10 % LEL. El trabajo en caliente se permite con 0 % LEL detectable (≤ 1 % de lectura). Se sale a ≥ 10 % y se evacúa el sector a ≥ 20 % | Se cumple. Se completaron MM-EAF-02, MS-ACE-05, IT-S16 e IT-S24 |
| CO / O₂ | CO 25 ppm = salir; 200 ppm = evacuar el sector. O₂ 19.5–23.5 % | Se cumple. Se completaron IT-S07, IT-S08, IT-S10 y MS-ACE-09 |
| Vigencias | 12 meses para alturas, espacios confinados, grúas/izaje, eléctrico y radiación. 24 meses para lo demás | Las vigencias de `competencia.roles` son campo de Relaciones Laborales. En mis campos no encontré discrepancias |
| Zonas de exclusión | Vaciado ≤ 10 / 10–25 m · canasta ≤ 15 / 15–30 m · muestreo ≤ 5 / 5–15 m · ruta de olla ± 5 / ± 15 m · arranque de CC ≤ 10 / 10–20 m · molde ≤ 3 m · volteo ≤ 15 m · evacuación a ≥ 25 m; breakout bajo la máquina y a ≥ 20 m | Se cumple en los 49 JSON y en las 30 IT |
| Radiación | Solo el ESR (C-16) opera el obturador; se trabaja con < 2 × fondo; si no, alejarse ≥ 3 m | Se cumple. Aclaré la redacción de MM-CC-04 |
| Pasos ★ | `critico` = true solo en los pasos ★ del manual; `checklist` = pasos ★, como máximo 6 | Coinciden 49 de 49 (incluidos los manuales con pasos fusionados o con subsecciones). Límites de caracteres: sin excesos |

## 2. Presentaciones (05-capacitacion)

| Documento | Hallazgo | Corrección | Estado |
|---|---|---|---|
| MO-OLL-02 | La prueba de frenos decía 100–200 mm y 5 s, contra 200–300 mm y 10 s de MS-ACE-04 | Cambié a 200–300 mm y 10 s en el control de seguridad, la regla, el checklist y, por el encargo C, en objetivos, flujo, `flujo_takeaway`, parámetros, paso 7 y quiz | Visto bueno con observaciones |
| MO-CC1-02 | La regla "prueba ≤ 7 días" del agua de emergencia era ambigua frente a MM-CC-03 | "Arranque semanal y prueba de cambio mensual vigentes" | Visto bueno con observaciones |
| MM-EAF-02 | El trabajo en caliente decía "0 % LEL detectable" sin la tolerancia del equipo | Agregué "(≤ 1 % de lectura)" | Visto bueno con observaciones |
| MM-CC-04 | `figura_lectura` decía "fondo … o < 2 × fondo", una variante que ya se retiró | "< 2 × fondo (fondo ≈ 0.1–0.3 µSv/h)" | Visto bueno con observaciones |
| MS-ACE-01 | El checklist no cubría los pasos ★ 1–2 (prueba de sirena, semáforo y CCTV) ni el 5 (barreras) | Los fusioné en los ítems 2 y 3; el checklist sigue con 6 ítems | Visto bueno con observaciones |
| MS-ACE-05 | Al checklist le faltaba la evacuación a ≥ 20 % LEL | Límites completos: entrar < 10 %, trabajo en caliente ≤ 1 %, evacuar ≥ 20 % | Visto bueno con observaciones |
| MS-ACE-09 | El checklist de reingreso decía "atmósfera en rango", sin valores | < 10 % LEL, CO < 25 ppm, O₂ 19.5–23.5 % | Visto bueno con observaciones |
| MM-CC-01, MM-CC-02, MM-CC-03, MM-EAF-01, MM-EAF-03, MM-EAF-04, MM-GR-01, MM-OLL-01 | Sin hallazgos. Controles, EPP, reglas, ★ y checklist coinciden con el manual | — | Visto bueno |
| MO-CC1-01, 03 a 09 | Sin hallazgos | — | Visto bueno |
| MO-CC2-01 a 09 | Sin hallazgos (breakout ≥ 20 m, falla de agua ≥ 10 m, ESR < 2 × fondo) | — | Visto bueno |
| MO-EAF-01 a 08, MO-LF-01, MO-OLL-01 | Sin hallazgos | — | Visto bueno |
| MS-ACE-02, 03, 04, 06, 07, 08, 10 | Sin hallazgos. Fecha de validación actualizada a 2026-09-26 | — | Visto bueno |

## 3. Instrucciones de trabajo (06-instrucciones-trabajo)

| Documento | Hallazgo | Corrección | Estado |
|---|---|---|---|
| IT-S09 Grúa de colada | Prueba de frenos a 100–200 mm y 5 s con la nota "pendiente de homologar" | Diagrama, paso 6, regla de oro 3 y sección 7 cambiados a 200–300 mm y 10 s. La nota ahora dice "criterio homologado" y pide actualizar MO-OLL-02 | Visto bueno con observaciones |
| IT-C04 Jefe de Turno | La prueba de frenos no aparecía en el ALTO de la tarea 2. La tarea 5 (CI) no tenía recuadro ALTO. El agua de emergencia mencionaba solo la prueba mensual | ALTO con la prueba de frenos a 200–300 mm y 10 s. Nuevo ALTO en la tarea 5 (conteo, rescate sin ERA, reingreso). Sección 7: prueba mensual y diésel semanal | Visto bueno con observaciones |
| IT-C05 Supervisor de Hornos | La tarea 6 (entrega de turno) no tenía recuadro ALTO | ALTO con 3 condiciones (LOTO o permiso sin dueño, fuga sin causa, barreras fuera de servicio) | Visto bueno con observaciones |
| IT-C06 Supervisor de CC | La tarea 6 no tenía recuadro ALTO. La VCC V1 decía "prueba ≤ 7 días" | ALTO con 3 condiciones. V1: arranque de diésel ≤ 7 días y prueba de cambio mensual (MM-CC-03) | Visto bueno con observaciones |
| IT-C17 Supervisor de Patio | Las tareas 5 y 6 no tenían recuadro ALTO | Dos ALTO: pieza radiológica solo para el ESR, conteo, oxicorte; camión retenido, canasta que gotea, pórtico fuera de servicio | Visto bueno con observaciones |
| IT-S12 Púlpito de colada | "Prueba ≤ 7 días" del agua de emergencia | Arranque de diésel ≤ 7 días y prueba de cambio mensual vigente, en la sección 7 y en el paso 7 | Visto bueno con observaciones |
| IT-S07 Ayudante de horno olla | EPP: sin CO 200 ppm y sin O₂ > 23.5 %. La regla de oro 2 pedía solo O₂ y vigía | Umbrales completos. Regla: medición O₂ → LEL → CO, vigía y rescate listo | Visto bueno con observaciones |
| IT-S08 Preparador de ollas | EPP sin CO 200 ppm. La entrada a olla no pedía desconectar el argón ni tener rescate listo | Umbrales completos. Sección 7: argón desconectado, vigía y rescate (MS-ACE-05) | Visto bueno con observaciones |
| IT-S10 Manejo de escoria | EPP sin CO 200 ppm | Agregado | Visto bueno con observaciones |
| IT-S15 Preparador de distribuidores | La entrada al confinado no pedía rescate listo | Regla de oro 2 y sección 7: valores de gases, vigía afuera y rescate ≤ 10 min | Visto bueno con observaciones |
| IT-S16 Corte y marcado | El EPP no tenía detector de gas, aunque el ALTO usa 10/20 % LEL. Faltaba "sin grasa en O₂" | Fila de multigás. Sección 7: antirretornos y conexiones de O₂ sin grasa | Visto bueno con observaciones |
| IT-S24 Refractarista | Al permiso de confinado le faltaban rescate y argón desconectado. Faltaba ≤ 1 % LEL para oxicortar | Sección 7 completada | Visto bueno con observaciones |
| IT-S01 a S06, S11, S13, S14, S17 a S23, S25, S26 | Sin hallazgos. Reglas de oro, EPP, ALTO, controles y respuestas coinciden con los manuales y la serie MS-ACE | — | Visto bueno |

## 4. Homologaciones del encargo C

| Tema | Diferencia | Criterio adoptado | Dónde se aplicó | Pendiente |
|---|---|---|---|---|
| Prueba de frenos de la grúa de colada | MO-OLL-02: 100–200 mm y 5 s · MS-ACE-04: 200–300 mm y 10 s | **200–300 mm y 10 s sin deslizamiento** (el más estricto) | Presentación MO-OLL-02, IT-S09, IT-C04 | **Actualizar el manual MO-OLL-02** (§6.1, fila ★ de frenos, y paso 7 de §8) y regenerar su PPTX y su guía. Lo hace el custodio de la serie MO con visto bueno de experto-operativo-metalurgia |
| Frecuencia de la prueba del agua de emergencia | Figura: "prueba mensual" · MO-CC2-03/04: "prueba semanal" | Valor de MM-CC-03: **prueba de cambio a emergencia mensual, en paro y sin acero; arranque de diésel D-1/D-2 semanal**. Las dos cifras son correctas porque se refieren a pruebas distintas | `img/mm-agua-emergencia.svg` (encabezado de la lógica: "Cambio automático · prueba mensual en paro · diésel semanal", validado con minidom); presentación MO-CC1-02; IT-C04, IT-C06, IT-S12 | Aclarar en MO-CC2-03 §6 y MO-CC2-04 §6 que la prueba semanal es el arranque de diésel y que la prueba de cambio es mensual. Regenerar `img/png/mm-agua-emergencia.png` y los PPTX de MM-CC-03 y MO-CC2-04 |

## 5. Observaciones fuera de mi alcance (para otros expertos)

- **Documentación y Mejora:** regenerar los PPTX y las guías de las 49 presentaciones después de las correcciones, porque los archivos generados ya no coinciden con el JSON. También registrar esta revisión en el control de cambios de las IT (sección 12).
- **Relaciones Laborales:** en IT-S09, la sección 10 evalúa el paso 7 de MO-OLL-02, que no se certifica hasta que el OEM confirme el peso de la traviesa (D-5). Lo mismo aplica a la fila S-09 de la presentación MO-OLL-02.
- **experto-operativo-metalurgia:** confirmar en el manual MO-OLL-02 el cambio de la prueba de frenos, porque afecta el tiempo de ciclo de la grúa.

## 6. Decisión requerida del Director

| Opción | Descripción | Riesgo | Costo | Fecha límite |
|---|---|---|---|---|
| **A (recomendada)** | Aprobar la homologación a 200–300 mm y 10 s en la grúa de colada y ordenar la actualización de MO-OLL-02 y la regeneración de los materiales antes de la primera sesión | Bajo; + ≈ 5 s por izaje [Supuesto] | Horas del custodio de MO y de Documentación | 2026-10-09 |
| B | Mantener 100–200 mm y 5 s en MO-OLL-02 hasta que el OEM se pronuncie | Dos criterios en planta; la prueba es menos exigente con metal líquido | Sin costo | — |
| C | Pedir primero al OEM el criterio de prueba de frenos y la traviesa (junto con D-5) | Retrasa la certificación de S-09 | Consulta al OEM | 2026-10-09 |

Recomiendo la opción A, junto con la C para el peso de la traviesa (D-5).

**Revisión cruzada requerida:** Relaciones Laborales (vigencias, sindicalizados, lenguaje de las IT) · Documentación y Mejora (regeneración y control documental) · experto-operativo-metalurgia (MO-OLL-02, MO-CC2-03/04). Las referencias NOM citadas se deben verificar con Jurídico Laboral / SSO.
