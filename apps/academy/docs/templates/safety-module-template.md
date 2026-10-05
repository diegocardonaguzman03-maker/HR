# Plantilla — Módulo de seguridad para ACERÍA DIGITAL ACADEMY

> **Uso:** diseñar un módulo de seguridad (`mod.*` en `src/content/training.json`, esquema `TrainingModule`) y su guía del participante (`documents.json`, tipo `TrainingGuide`). ADX-04 Seguridad tiene **veto** sobre todo el contenido.
> **Estado de esta plantilla:** Borrador para aprobación del Director. Dueños: ADX-04 + ADX-07. Revisión de proceso: experto-documentacion-mejora.

## 0. Reglas antes de llenar
1. Un módulo de seguridad **forma criterio**; **no sustituye** el procedimiento aprobado, el permiso, el LOTO ni la supervisión. Muestra este aviso al inicio del módulo.
2. Prohibido inventar pasos de LOTO, verificación de energía cero, distancias de exclusión, lógica de enclavamientos, bypass, niveles de alarma de gases o procedimientos de emergencia. Si no hay documento aprobado: `SME_REQUIRED: <dato y quién lo da>`.
3. Se puede enseñar contenido **general**: qué es cada energía, por qué existe cada control, jerarquía de controles, derecho y obligación de detener el trabajo.
4. Cada peligro se liga a un `haz.*` del catálogo fijo; cada lección cita fuentes en `sourceIds` del módulo.
5. Toda lección termina con la **regla de ALTO**: detente, retírate, avisa, espera instrucciones.

## 1. Reglas de estado
Mismas que la plantilla de WI (`work-instruction-template.md` §1). `PLANT_APPROVED` está **prohibido en el MVP** y, después, exige firma de **Seguridad y Salud** y de **Operaciones**, más la autorización del Director de C&D.

## 2. Encabezado
| Campo | Valor |
|---|---|
| ID (`id`) | `mod.<tema>` |
| Título (`title`) | |
| Estado (`status`) | |
| Niveles (`levels`) | `<1–5>` |
| Duración (`durationMin`) | `<min>` |
| Población objetivo | `<puestos; ¿sindicalizados? → revisión de Relaciones Laborales>` |
| NOM / norma relacionada | `<p. ej. NOM-004/009/029-STPS — verificar con Jurídico Laboral / SSO>` |
| Fuentes (`sourceIds`) | `src.…` |

## 3. Resumen y objetivos
- **Resumen (`summary`):** `<2–3 frases>`
- **Objetivos (`objectives`):** verbo observable (identificar, explicar, reconocer, detener). `<3–5 objetivos>`

## 4. Mapa de peligros del módulo
| `haz.*` | Fuente de energía / peligro | Consecuencia | Control (jerarquía) | Dato de planta pendiente |
|---|---|---|---|---|
| | | | eliminación / ingeniería / administrativo / EPP | `SME_REQUIRED: …` |

## 5. Lecciones (`lessons`) — copiar por lección
| Campo | Contenido |
|---|---|
| `id` | `les.<módulo>-<n>` |
| `title` | |
| `stageId` | `stage.…` (opcional) |
| `focus` | IDs de equipo/hotspot a resaltar en 3D |
| `body` | Párrafos cortos de contenido general |
| `keyPoints` | 3–5 puntos para recordar; el último es la regla de ALTO |
| `checkIds` | `q.<tema>-<n>` (preguntas de comprobación) |

## 6. Escenario de decisión (recomendado)
Situación ficticia → opciones → respuesta correcta = **detenerse y escalar** cuando hay duda. Sin datos reales de incidentes de personas identificables.

## 7. Evaluación
`assessmentId`, puntaje mínimo (`passScore`) y preguntas. Los reactivos sobre controles críticos no pueden tener respuesta que implique omitir un control.

## 8. Vínculos
`workInstructionIds` (`wi.*`), documentos (`doc.guide-*`), videos (`vid.*`).

## 9. Firmas de validación
| Rol | Qué valida | Nombre | Firma | Fecha | Obligatoria para publicar como aprobado |
|---|---|---|---|---|---|
| **Seguridad y Salud** (ADX-04 / experto-seguridad-salud / SSO de planta) | Exactitud de peligros, controles y mensajes de ALTO | | | | **Sí (veto)** |
| **Operaciones** (dueño del proceso) | Pertinencia con la operación real | | | | **Sí** |
| Relaciones Laborales | Población sindicalizada, DC-3, CMCAP | | | | Si aplica |
| Documentación y Mejora | Formato y control documental | | | | Sí |
| Director de C&D | Autoriza la publicación | | | | **Sí** |

## 10. Control de cambios
| Versión | Fecha | Cambio | Elaboró | Aprobó |
|---|---|---|---|---|
| 0.1 | | Creación | | |
