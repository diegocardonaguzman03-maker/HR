# Plan de lanzamiento del piloto — ACERÍA DIGITAL ACADEMY (EAF)

**Decisión:** D-011 (2026-10-05). El Director aprobó todo (opción A en las 5 decisiones) y ordenó lanzar.
**Mensaje clave:** el piloto arranca con **personal de confianza e instructores** de Acería. Usa la plataforma con el asistente oculto y evaluación a libro abierto. Mide aprendizaje (N1–N2) y uso, **no certifica**. El personal sindicalizado entra cuando Relaciones Laborales, Jurídico y la CMCAP den su visto bueno.

## 1. Alcance del piloto
| Concepto | Definición |
|---|---|
| Participantes | 20–30 personas [Supuesto]: supervisores de turno EAF, ingenieros de proceso (C-07), instructores internos de C&D y 2–3 técnicos de Seguridad |
| Contenido | Módulos de orientación al EAF, electrodos y fusión, y seguridad de energías; WI DEMO en modo EJECUTAR; evaluación `asm.eaf-electrode` |
| Acceso | Link público de la versión web autocontenida (ver §5). No requiere instalación |
| Duración | 4 semanas [Supuesto]: del 2026-10-12 al 2026-11-06 |
| Reglas | Aviso permanente; nada se usa en piso; la evaluación es a libro abierto y no certifica; los resultados no se usan para escalafón ni desempeño |

## 2. Calendario
| Semana | Actividad | Responsable |
|---|---|---|
| 0 (2026-10-05 → 10-09) | Comunicar el piloto; elegir participantes; preparar el equipo (PC de capacitación y laptops); ronda ADX-RED del asistente; revisión de Relaciones Laborales | ADX-01, conf-servicio-clientes, experto-relaciones-laborales |
| 1 (10-12 → 10-16) | Sesión de arranque (60 min); módulo de orientación; arranque del **taller SME F2-01** (D-011-5) | Instructores C&D; experto-operativo-metalurgia |
| 2 (10-19 → 10-23) | Módulos de electrodos y de seguridad; EJECUTAR | Participantes |
| 3 (10-26 → 10-30) | Evaluación; encuesta de reacción (N1); medición de FPS en equipos reales; acuerdo con la CMCAP (D-011-4) | ADX-07, ADX-13, experto-relaciones-laborales |
| 4 (11-02 → 11-06) | Cierre, informe de resultados y decisión de ampliar (sindicalizados y otras plantas) | ADX-01 → Director |

## 3. Indicadores
| Indicador | Meta [Supuesto] | Fuente |
|---|---|---|
| Participantes que completan los 3 módulos | ≥ 80 % | Registro local / xAPI anónimo |
| Calificación media en la evaluación (libro abierto) | ≥ 85 % y 3/3 críticas | xAPI |
| Utilidad percibida (N1, escala 1–5) | ≥ 4.2 | Encuesta de cierre |
| FPS en equipo de capacitación (calidad Media) | ≥ 30 | Medición ADX-13 |
| Incidentes de contenido (algo leído como instrucción aprobada) | 0 | Reporte de instructores |
| Datos SME validados en el taller F2-01 | ≥ 50 de 215 al cierre del piloto | Experto operativo + Seguridad |

## 4. Segunda liberación: asistente IA (D-011-1)
1. Una ronda independiente de ADX-RED con 20 preguntas (`docs/reviews/red-team-asistente-r2.md`).
2. Si pasa, firma ADX-04 y se hace un build con `VITE_ASSISTANT=on`.
3. Se publica un link nuevo y se registra en esta sección. Si no pasa, sigue oculto y se corrige.

## 5. Acceso y soporte
- **Link del piloto:** se registra en `entregables/2026-10-05-aceria-digital-academy/informe-ejecutivo.md` (sección «Acceso»).
- **Soporte:** el instructor de C&D asignado. Los fallos del 3D se reportan con una captura de pantalla; la app sigue usable sin 3D.
- **Reportes de contenido:** se mandan a ADX-01, que los asigna a SME y a Seguridad.
