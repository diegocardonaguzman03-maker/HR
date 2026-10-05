# Plantilla — Instrucción de trabajo (WI) para ACERÍA DIGITAL ACADEMY

> **Uso:** la planta captura aquí una instrucción de trabajo para cargarla en `src/content/work-instructions.json` (esquema `WorkInstruction` de `src/lib/content/schema.ts`) y generar sus dos formatos: **instrucción detallada (PDF)** y **job aid** (`documents.json`, tipos `WI` y `JobAid`).
> **Estado de esta plantilla:** Borrador para aprobación del Director. Dueño: ADX-06. Revisión de proceso: experto-documentacion-mejora.

## 0. Reglas antes de llenar
1. **Nunca inventes datos de planta.** Límites, setpoints, presiones, temperaturas, distancias, torques, criterios de aceptación, pasos de LOTO, verificación de energía cero, permisos, enclavamientos, bypass, secuencias de energización, condiciones para reanudar y procedimientos de emergencia se copian **solo** de un documento aprobado y se cita su código. Si no existe, escribe `SME_REQUIRED: <qué dato falta y quién lo da>` o `PLACEHOLDER — REQUIRES PLANT VALIDATION: <qué falta>`.
2. Distingue **CONTENIDO EDUCATIVO GENERAL** (se puede escribir) de **INSTRUCCIÓN APROBADA DE PLANTA** (requiere firmas).
3. Español de México, frases cortas, en segunda persona y en imperativo («Observa…», «Confirma…»), para alguien de nuevo ingreso.
4. Un paso = una acción verificable. Entre 5 y 12 pasos. Si hay más, divide la tarea.
5. **El paso 1** confirma con el supervisor la autorización y el estado de energía. **Debe existir un paso de ALTO** (detención y escalamiento).

## 1. Reglas de estado (`status`)
| Estado | Cuándo se usa | ¿Puede publicarse en la academia? | Marca visible |
|---|---|---|---|
| `DEMO` | Demostración de estructura del producto | Sí | `DEMO CONTENT` |
| `GENERAL_EDUCATIONAL` | Conocimiento general de la industria, sin pasos de planta | Sí | `CONTENIDO EDUCATIVO GENERAL` |
| `DRAFT_NOT_VALIDATED` | Proviene de un borrador de `10-plantas/` | Sí, solo para estudio | `DRAFT — NOT VALIDATED` |
| `SME_REQUIRED` | La mayor parte depende de datos de planta pendientes | Sí, con campos pendientes visibles | `SME_REQUIRED` |
| `PLANT_APPROVED` | Instrucción aprobada con **todas** las firmas de la sección 9 | **Prohibido en el MVP.** Después, solo con firmas completas y `approvalDate` | `APPROVED` |

**Regla de bloqueo:** un documento pasa a `PLANT_APPROVED` solo con la firma de **Seguridad y Salud** **y** la de **Operaciones** (dueño del proceso), además de las demás firmas de la sección 9. Si falta cualquiera de las dos, el estado máximo es `DRAFT_NOT_VALIDATED`. `npm run check:content` rechaza `PLANT_APPROVED` sin fecha de aprobación.

## 2. Encabezado (control documental)
| Campo | Valor |
|---|---|
| ID de la academia (`id`) | `wi.<tarea-en-kebab-case>` |
| Código de planta | `<p. ej. IT-EAF-0N>` |
| Título (`title`) | `<verbo + objeto + condición>` |
| Versión | `<0.1, 0.2… / 1.0 al aprobar>` |
| Estado (`status`) | `<ver sección 1>` |
| Área / equipo | `<Hornos — EAF-1 / EAF-2>` |
| Dueño del proceso | `<puesto>` |
| Elaboró | `<nombre y puesto>` |
| Documentos aprobados de referencia | `<códigos y versiones; si no hay, "Ninguno — SME_REQUIRED">` |
| Fecha de elaboración / próxima revisión | `<AAAA-MM-DD> / <AAAA-MM-DD>` |

## 3. Propósito y rol
- **Propósito (`purpose`):** `<qué se logra y qué riesgo controla, en 2–3 frases>`
- **Rol (`role`):** `<quién ejecuta> con <quién autoriza/verifica>`
- **Alcance / no incluye:** `<límites de la tarea>`

## 4. Relaciones (IDs del catálogo fijo de `docs/content-schema.md`)
| Campo | IDs |
|---|---|
| `equipmentIds` | `eq.…` |
| `hazardIds` | `haz.…` (la lista la valida ADX-04 Seguridad) |
| `documentIds` | `doc.wi-<tarea>`, `doc.jobaid-<tarea>` |
| `sourceIds` | `src.…` (cada dato debe poder rastrearse a una fuente) |

## 5. Prerrequisitos, EPP y herramientas
- **Prerrequisitos (`prerequisites`):** competencia/certificación, autorización, permisos, aislamiento requerido, comunicación. `<lista>`
- **EPP (`ppe`):** según la matriz de EPP aprobada por Seguridad. `<lista>`
- **Herramientas (`tools`):** solo herramientas e instrumentos autorizados y calibrados. `<lista>`

## 6. Pasos (`steps`) — copiar el bloque por cada paso
| Campo | Contenido | Obligatorio |
|---|---|---|
| `n` | Número consecutivo | Sí |
| `title` | Nombre corto del paso | Sí |
| `action` | Qué hace la persona, en imperativo, con la posición y el medio | Sí |
| `why` | Por qué importa (riesgo o resultado que protege) | Sí |
| `visual` | Descripción de la foto, ilustración o captura que acompaña el paso | Recomendado |
| `check` | Cómo comprueba la persona que lo hizo bien | Sí |
| `expected` | Resultado esperado / criterio de aceptación (con fuente aprobada o `SME_REQUIRED`) | Sí |
| `warning` | Advertencia de seguridad o calidad | Si aplica |
| `commonError` | Error frecuente observado | Recomendado |
| `escalation` | A quién avisa y cuándo se detiene | Sí en pasos críticos |

Paso críticos marcados con ★ en el PDF: los que controlan un peligro `critical` (energía, metal líquido, agua–metal, cargas suspendidas, altura).

## 7. Cierre (`completion`)
`<condiciones verificables de tarea terminada, registros entregados y quién libera>`

## 8. Job aid
Extrae de los pasos solo `title` + `check` + la regla de ALTO, en una página, con casillas. Lleva la misma versión y marca de estado que la WI.

## 9. Firmas de validación (Validation Board)
| Rol | Qué valida | Nombre | Firma | Fecha | Obligatoria para `PLANT_APPROVED` |
|---|---|---|---|---|---|
| **Operaciones** — dueño del proceso (Supervisor / Superintendente de Hornos) | Que los pasos reflejan la práctica real y segura | | | | **Sí** |
| **Seguridad y Salud** (experto-seguridad-salud / área SSO de planta) | Peligros, controles, LOTO, permisos, EPP, ALTO y emergencias | | | | **Sí (veto)** |
| Ingeniería de Proceso / experto-operativo-metalurgia | Valores técnicos y criterios de aceptación | | | | Sí si hay valores técnicos |
| Mantenimiento (mecánico/eléctrico) | Puntos de inspección del equipo | | | | Si aplica |
| Relaciones Laborales | Impacto en puestos sindicalizados / CMCAP | | | | Si ejecutan sindicalizados |
| Documentación y Mejora | Formato, código, control de versión | | | | Sí |
| Director de C&D | Autoriza la publicación en la academia | | | | **Sí** |

## 10. Control de cambios
| Versión | Fecha | Cambio | Elaboró | Aprobó |
|---|---|---|---|---|
| 0.1 | | Creación | | |
