# Informe ejecutivo — ACERÍA DIGITAL ACADEMY: horno de arco eléctrico (piloto)

**Para:** Director Corporativo de Capacitación y Desarrollo · **Fecha:** 2026-10-05 · **Estado:** APROBADO PARA PILOTO CONTROLADO (ADX-01), con condiciones

## Mensaje clave
Se construyó y validó el primer módulo de la Academia Digital: un entorno 3D del horno de arco eléctrico con **15 equipos**, fichas de 9 pestañas, mapa del proceso, modos **Explorar · Aprender · Ejecutar · Evaluar**, biblioteca de PDF y video, y aviso de seguridad permanente.
- **Sin datos de planta inventados:** 215 datos quedan marcados como **pendientes de validación de planta (SME_REQUIRED)** y nada se presenta como procedimiento aprobado.
- **Revisión:** pasó por Metalurgia, Operaciones, Seguridad (con veto), Formación, cuatro *red teams* y QA. Hay **202 pruebas unitarias** y **13/13 pruebas en navegador** en verde.
- **El asistente con IA queda oculto en el piloto:** Seguridad mantiene su veto sobre él (ver Decisión 1).

**Link público (cualquier navegador, sin instalar nada):**
https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/<commit>/apps/academy/web/index.html (el commit vigente está en la sección «Acceso»)

## Qué se entregó
| Pieza | Detalle |
|---|---|
| App | `apps/academy`: React, TypeScript estricto, 3D WebGL. Versión web autocontenida en `apps/academy/web/` |
| MVP | Etapa 03 Fusión · sistema de electrodos · WI DEMO «revisión del sistema de electrodos» · módulo de seguridad (energía eléctrica, almacenada y metal líquido) · módulo de formación · evaluación con 3 preguntas de seguridad obligatorias · video DEMO con subtítulos · 4 PDF descargables |
| Documentación | Plan maestro A–J, arquitectura, esquema de contenido, sistema de diseño, lineamientos 3D, 5 plantillas, QA, rendimiento, lista de validación, backlog de la fase 2, aprobación de liberación (`apps/academy/docs/`) |
| Equipo | 18 agentes ADX en `.claude/agents/` (14 especialistas y 4 *red team*) |

## Resultado de la validación
| Área | Dictamen |
|---|---|
| Metalurgia | Aprobado |
| Operaciones | Aprobado con condiciones (cumplidas: video y PDF regenerados con el EBT corregido) |
| Seguridad (veto) | App, contenido, PDF y 3D **liberados**. El asistente sigue con **veto**: en 5 rondas de preguntas trampa siempre apareció alguna pregunta peligrosa sin «detente y avisa» |
| Formación | Aprobado para piloto controlado, con condiciones |
| Red team técnico | 2 CRITICAL y 11 HIGH corregidos |
| QA | 202/202 unitarias · 13/13 e2e · 0 errores de consola |

## Decisión requerida del Director
| # | Decisión | Opciones | Recomendación | Riesgo / costo | Fecha límite |
|---|---|---|---|---|---|
| 1 | Asistente IA en el piloto | **A)** Piloto con el asistente oculto y segunda liberación después de la ronda ADX-RED de 20 preguntas · B) Activarlo ya, contra el veto · C) Quitarlo del producto | **A** | B contradice el veto de Seguridad · A ≈ 1 día de trabajo [Supuesto] | 2026-10-07 |
| 2 | Disposición del EBT opuesta a la puerta de escoria (ya aplicada en el 3D) | **A)** Ratificar · B) Volver al rótulo de «disposición esquemática» | **A** | Ninguno | 2026-10-12 |
| 3 | Consulta de fichas durante la evaluación | **A)** Libro abierto en el piloto · B) Bloquear (hoy la UI bloquea el clic 3D y la lista durante la evaluación) | **A** | Mide comprensión con apoyo, como en el trabajo real | 2026-10-12 |
| 4 | Uso con personal sindicalizado | **A)** Visto bueno de Relaciones Laborales y Jurídico a los textos de «no se usa para escalafón», al registro y a LMS/DC-3, más acuerdo con la CMCAP antes de incluirlos · B) Piloto solo con personal de confianza e instructores · C) Incluirlos sin acuerdo | **A** (B mientras tanto) | C trae riesgo laboral (CCT) | 2026-10-30 |
| 5 | Taller SME para validar los 215 datos de planta | **A)** Taller de 3–4 semanas con la Superintendencia EAF, Seguridad y C-07 · B) Posponer | **A** | ≈ MXN 60–80 k [Supuesto] de horas SME | 2026-10-15 |

Cuando el Director decida, se registra en `equipo-director/decisiones/registro-de-decisiones.md`.

## Acceso
- **Link público:** se fija al commit publicado; se indica en el mensaje de entrega.
- **Código y documentos:** rama `claude/training-development-mining-company-0ctyfw`, carpeta `apps/academy/`.
