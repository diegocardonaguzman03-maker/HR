# Revisión de seguridad del MVP — ACERÍA DIGITAL ACADEMY

| Código | Versión | Estado | Revisor (VETO) | Fecha | Alcance |
|---|---|---|---|---|---|
| ADX-SR-001 | 0.1 | **DRAFT — NOT VALIDATED** | ADX-04 Ingeniero de Seguridad | 2026-10-05 | `src/content/hazards.json` (12 peligros), UI del MVP, módulo `mod.eaf-energy-safety`, WI `wi.electrode-system-check` (DEMO) |

> **Mensaje clave.** El mapa de peligros del MVP está completo como **contenido educativo general** (12/12 peligros, todos con ≥ 4 controles por jerarquía). **Todo lo específico de planta (zonas de exclusión, enclavamientos, permisos, condiciones de paro y escalamiento) está marcado `SME_REQUIRED`**, porque los manuales MS-ACE son borradores. La liberación del MVP queda **condicionada**: ADX-04 no emite VETO sobre el contenido de `hazards.json`, pero **sí bloqueará la liberación** si la UI no cumple los 4 principios de la sección 1 (ver condiciones de VETO, sección 3).

---

## 1. Principios que la aplicación debe cumplir (obligatorios)

| # | Principio | Cómo se verifica |
|---|---|---|
| P1 | **Aviso permanente** visible en todas las pantallas con contenido industrial (no descartable), con este texto literal: *"Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad."* | Revisión visual de cada ruta; prueba automatizada que busca el texto en el layout |
| P2 | **La información crítica nunca depende solo de una señal visual.** Severidad, estado de validación y advertencias se muestran siempre con **texto + icono + color** (y nombre accesible para lector de pantalla). En el visor 3D, los hotspots de peligro llevan etiqueta de texto, no solo color. | Prueba con escala de grises y con lector de pantalla; contraste WCAG AA |
| P3 | **La plataforma nunca certifica competencia industrial.** Las evaluaciones en línea dan constancia de **conocimiento** (niveles 1–3). La competencia en tareas críticas solo la otorga la **evaluación práctica en campo con evaluador calificado** (TD-P07). Ningún texto, insignia ni certificado dice "certificado", "autorizado" o "competente para operar". | Revisión de textos de resultados, certificados y exportaciones |
| P4 | **Nada `DRAFT_NOT_VALIDATED`, `SME_REQUIRED` o `DEMO` se presenta como procedimiento aprobado.** Cada objeto muestra su estado con etiqueta visible; los campos `SME_REQUIRED` se muestran como **"Pendiente de validación de planta"** (no se ocultan ni se rellenan); no existe ningún objeto `PLANT_APPROVED` en el MVP. | `npm run check:content` + revisión de UI de peligros, WI y documentos |
| P5 | La app **nunca** describe bypass de enclavamientos, pasos de LOTO, distancias, setpoints ni procedimientos de emergencia de planta que no provengan de un documento aprobado. | Búsqueda en `src/content/*.json` y revisión de ADX-04 |
| P6 | Mensaje de **derecho a detener el trabajo** visible en el módulo de seguridad y en cada peligro (Regla 13 del README MS-ACE). | Revisión visual |

## 2. Tabla de peligros: riesgo residual y lo que falta de planta

Riesgo residual **del contenido de capacitación** (no de la operación): probabilidad de que el contenido induzca un error peligroso en planta. Todos los peligros están en `DRAFT_NOT_VALIDATED` porque citan borradores MS-ACE además de `src.industry-general`.

| ID | Peligro | Severidad | Riesgo residual del contenido | Qué falta de planta (SME_REQUIRED) | Quién valida |
|---|---|---|---|---|---|
| `haz.molten-metal` | Metal y escoria líquidos | Crítica | Bajo (sin distancias publicadas) | Radio de zonas roja/amarilla (horno, puerta de escoria, vaciado), estudio de la nave, enclavamientos de basculado, permisos | C-16 + Gerente de Acería |
| `haz.water-molten-metal` | Agua/humedad con metal líquido; DRI húmedo y reoxidación | Crítica | **Medio**: el riesgo es poco intuitivo para el nuevo ingreso; la capacitación debe reforzarse con evaluación práctica | Criterios de rechazo de DRI (humedad, temperatura, gases), umbrales de detección de fuga, distancia de evacuación, reanudación tras fuga, inertización de silos | C-07 + C-16 + OEM |
| `haz.electrical` | Arco, circuito secundario, alta tensión | Crítica | Bajo | Estudio de arco eléctrico, distancias de aproximación, pasos de LOTO del EAF, lógica de enclavamientos | Mantto. Eléctrico + C-16 + OEM |
| `haz.stored-energy` | Hidráulica, gravedad, resortes | Crítica | **Medio**: la WI DEMO de electrodos toca brazos y mordazas | LOTO hidráulico/gravedad/resortes, verificación de energía cero, soportes mecánicos | Mantenimiento + C-16 |
| `haz.oxygen` | Oxígeno | Crítica | Bajo | Zonas de lanzas y válvulas, enclavamientos de lanzas y quemadores, permisos | C-07 + C-16 + OEM |
| `haz.gas-co` | CO, gases del horno, H₂, gas natural | Crítica | Bajo | Umbrales de alarma/evacuación (verificar NOM-010/033), mapa de detectores fijos, cortes automáticos | C-16 / SSO |
| `haz.thermal` | Calor radiante y estrés térmico | Alta | Bajo | Evaluación térmica por puesto (NOM-015), régimen trabajo-descanso | C-16 + Servicio Médico |
| `haz.suspended-load` | Cargas suspendidas e izaje | Crítica | Bajo | Ancho de ruta de olla, plan de izaje crítico, dispositivos de grúa | C-16 + OEM grúa |
| `haz.height` | Trabajo en altura | Crítica | Bajo | Puntos de anclaje certificados, plan de rescate, permisos | C-16 |
| `haz.line-of-fire` | Atrapamiento, golpe, proyección (incluye bandas de DRI) | Alta | Bajo | Zonas de movimiento, guardas con enclavamiento, criterio LOTO vs. paro | C-16 + Mantenimiento |
| `haz.noise-dust` | Ruido y polvo (incluye DRI) | Media | Bajo | Mapeo de ruido y polvo, niveles de acción (NOM-011/010) | C-16 / Higiene Industrial |
| `haz.confined-space` | Fosas, ductos, silos de DRI | Crítica | Bajo | Criterios de atmósfera, aislamientos positivos, permisos y rescate (NOM-033) | C-16 |

**Total de campos pendientes en `hazards.json`:** 60 (5 campos × 12 peligros), todos con el dato faltante y el responsable de aprobarlo.

**Observación.** Ninguna cifra de los borradores MS-ACE (distancias, ppm, % LEL, tiempos) se copió a la app, porque en los borradores están marcadas como [Supuesto] o [Verificar con la NOM vigente / SSO]. Cuando C-16 las valide, se publican con estado `PLANT_APPROVED` solo con la firma del Validation Board.

## 3. Condiciones de SAFETY VETO (bloquean la liberación)

| # | Condición de VETO | Condición para levantarlo |
|---|---|---|
| V1 | Falta el aviso permanente (P1) en cualquier pantalla con contenido industrial, o su texto no es el literal | Aviso presente en el layout raíz y verificado en todas las rutas |
| V2 | Severidad, estado o advertencia transmitidos **solo** por color o por señal visual (P2) | Texto + icono + color y nombre accesible en todos los componentes |
| V3 | Cualquier texto, insignia o certificado que diga o sugiera que el usuario es **competente, certificado o autorizado** para operar o intervenir equipo (P3) | Textos cambiados a "constancia de conocimiento"; enlace a la evaluación práctica TD-P07 |
| V4 | Algún objeto en `PLANT_APPROVED`, o contenido `DRAFT_NOT_VALIDATED`/`DEMO` presentado como procedimiento aprobado (P4) | `check:content` sin objetos aprobados; etiquetas de estado visibles |
| V5 | Un campo `SME_REQUIRED` oculto, vacío o reemplazado por un valor inventado | Campo mostrado como "Pendiente de validación de planta" |
| V6 | Contenido con distancias, setpoints, pasos de LOTO, lógica de enclavamientos, **bypass** o procedimiento de emergencia de planta sin documento aprobado (P5) | Texto retirado o convertido a `SME_REQUIRED` |
| V7 | La WI DEMO `wi.electrode-system-check` no muestra de forma visible que es DEMO y que requiere LOTO y permiso según procedimiento aprobado | Banner DEMO + referencia a `haz.electrical` y `haz.stored-energy` |
| V8 | `npm run check:content` con errores en `hazards.json` o en referencias a `haz.*` | 0 errores de esquema y de referencias de peligros |

> **Estado al 2026-10-05:** `hazards.json` valida contra el esquema `Hazard` (12/12, 0 errores). `check:content` aún reporta errores de referencias en **otros** archivos (p. ej., `equipment.json` y `training.json` vacíos), que son de ADX-05/ADX-07. V8 queda **abierto** hasta que se resuelvan las referencias a `haz.*` y `eq.*`. La revisión de UI (V1–V7) **no se ha hecho**: está pendiente.

## 4. Checklist de liberación que firmará ADX-04

| # | Punto | Cumple (Sí/No) | Evidencia |
|---|---|---|---|
| 1 | Los 12 peligros del catálogo están en `hazards.json` y validan contra el esquema | Sí | Validación zod, 2026-10-05 |
| 2 | Cada peligro tiene ≥ 3 controles por jerarquía y EPP genérico | Sí | `hazards.json` |
| 3 | exclusionZone, interlock, permit, stopCondition y escalation: `SME_REQUIRED` con dato faltante y responsable | Sí | `hazards.json` |
| 4 | Ningún objeto `PLANT_APPROVED` en todo `src/content/` | | `check:content` |
| 5 | Aviso permanente literal en todas las pantallas (P1) | | Revisión de UI |
| 6 | Texto + icono + color en severidad, estado y advertencias; prueba en escala de grises y lector de pantalla (P2) | | Revisión de UI / accesibilidad |
| 7 | Resultados y constancias sin lenguaje de certificación de competencia (P3) | | Revisión de textos |
| 8 | Campos `SME_REQUIRED` visibles como "Pendiente de validación de planta" (P4, V5) | | Revisión de UI |
| 9 | Sin bypass, LOTO, distancias ni setpoints inventados en ningún JSON (P5) | | Búsqueda en `src/content/` |
| 10 | Derecho a detener el trabajo visible (P6) | | Revisión de UI |
| 11 | WI DEMO marcada y ligada a sus peligros (V7) | | Revisión de UI |
| 12 | `check:content` con 0 errores | | Salida del comando |

**Firma ADX-04:** pendiente — se firma cuando los 12 puntos estén en "Sí". Firmar este checklist **no** valida contenido para uso en planta; eso solo lo hace el Validation Board con C-16.

## 5. Revisión cruzada requerida
- **experto-operativo-metalurgia (C-07):** descripción del DRI húmedo/reoxidación y del sistema de electrodos (contenido general).
- **Documentación y Mejora:** alta de ADX-SR-001 en el control documental y del flujo de estados (`docs/validation-checklist.md`).
- **Relaciones Laborales:** el principio P3 (la app no certifica) afecta el uso de constancias para DC-3 y escalafón del personal sindicalizado.
- **C-16 / Gerente de Acería:** validación de los 60 campos `SME_REQUIRED`.

## 6. Decisión requerida del Director

| Opción | Descripción | Riesgo | Costo | 
|---|---|---|---|
| **A (recomendada)** | Liberar el MVP como **piloto de capacitación educativa** cuando se cumplan V1–V8, con los 60 campos visibles como "Pendiente de validación de planta", y ordenar a C-16 validar los datos de planta con base en la validación de la serie MS-ACE (60 días, decisión pendiente del README MS-ACE) | Bajo: el usuario ve que el dato no está validado; la competencia sigue en TD-P07 | Horas de C-16, C-07 y Mantenimiento [Supuesto: sin inversión adicional] |
| B | No liberar hasta tener los datos de planta validados | Retrasa la capacitación en riesgos críticos de nuevo ingreso | Sin costo inmediato; costo de oportunidad |
| C | Liberar con las cifras de los borradores MS-ACE como si fueran datos de planta | **Alto — ADX-04 emitiría SAFETY VETO**: valores [Supuesto] presentados como aprobados | — |

**Recomendación:** A. **Fecha límite sugerida para decidir:** 2026-10-15 [Supuesto], alineada con la decisión pendiente de validación de la serie MS-ACE.

*Referencias normativas (NOM-004, 006, 009, 010, 011, 015, 029, 033-STPS): verificar con Jurídico Laboral / SSO.*
