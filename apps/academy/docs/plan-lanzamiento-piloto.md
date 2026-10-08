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
- **Link del piloto:** https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/069f602bfeb545e1c34a2eeec87853afd0b8500b/apps/academy/web/index.html
- **Soporte:** el instructor de C&D asignado. Los fallos del 3D se reportan con una captura de pantalla; la app sigue usable sin 3D.
- **Reportes de contenido:** se mandan a ADX-01, que los asigna a SME y a Seguridad.

---

# Piloto de la Misión 01 — Trabajo en Alturas (decisión D-012, 2026-10-05)

**Mensaje clave:** la experiencia principal de la academia ahora es **completar misiones**. El piloto prueba la Misión 01 con **5 trabajadores reales de nuevo ingreso**, en modo DEMO, sin instrucciones previas. Mide si saben qué hacer, si aprenden y si la experiencia se entiende sola.

**Link:** https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/3dba97d912bad33c53e831e99039477aa2c22b69/apps/academy/web/index.html

**Versión 2 (2026-10-05): más fluida + Misión LOTO + menú de Procedimientos con 6 PDF descargables.** Seguridad (ADX-04) levantó el veto y la aprobó con condiciones (`docs/reviews/review-seguridad-loto-documentos.md`). Link: https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/02d9951f92d9b430220b55794ec23434dc92ea7f/apps/academy/web/index.html

> **Nota (D-017, 2026-10-08):** el repositorio pasa a privado y los links de githack de esta página dejan de funcionar. El acceso del piloto es por la intranet o desde el disco del equipo: `entregables/2026-10-07-lanzamiento-piloto-misiones/acceso-piloto-sin-link-publico.md`.

**Versión 2.1 (2026-10-06, D-014):** cambios de Operativo/Metalurgia y Relaciones Laborales, y verificación de Seguridad cerrada. LOTO está habilitada para el piloto con personal de confianza, en modo DEMO. Link: https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/fa25ff0f34fb2eee70bc7d8df4b7645c63c0f7a1/apps/academy/web/index.html

| Concepto | Definición |
|---|---|
| Participantes | 5 de nuevo ingreso de confianza [Supuesto]. **Participan solo trabajadores de confianza (incluido el nuevo ingreso de confianza). Un trabajador de nuevo ingreso contratado en un puesto de categoría sindicalizable, aunque esté en periodo de prueba o de capacitación inicial, cuenta como personal sindicalizado para D-011-4 y no participa hasta el acuerdo de la CMCAP. Los instructores sindicalizados participan solo como facilitadores, con el registro desactivado (ADX-RL-001, Decisión 3).** (RL-L-14, D-014) |
| Estado | **LANZADO (D-015, 2026-10-07).** Kit de ejecución: `entregables/2026-10-07-lanzamiento-piloto-misiones/` |
| Alcance | Misión 01 Trabajo en Alturas + Misión 02 LOTO + menú de Procedimientos (6 PDF DEMO) |
| Formato | Sesión individual de unos 40 min: el instructor observa sin explicar (prueba de 10 segundos), las dos misiones, búsqueda del checklist de LOTO y entrevista breve |
| Fechas | 2026-10-12 → 2026-10-16 [Supuesto] |
| Responsables | ADX-01 (conducción), ADX-07 (aprendizaje), ADX-13 (registro de fallas), ADX-04 (observa la parte de seguridad) |

## Qué se mide
| Pregunta (red team de UX) | Cómo se mide | Meta [Supuesto] |
|---|---|---|
| ¿Empieza en ≤ 10 s sin ayuda? | Tiempo hasta el primer clic útil | 5/5 |
| ¿Sabe en qué paso va y qué hacer? | Observación y entrevista | ≥ 4/5 |
| ¿Se recupera de un error y entiende por qué? | Observación de reintentos | ≥ 4/5 |
| ¿Encuentra el detalle técnico sin salir? | Uso de «¿Por qué?» o «Procedimiento» | ≥ 3/5 |
| Aprendizaje | Pasos sin errores al primer intento y errores críticos | Sin errores críticos en el 2.º intento |
| Utilidad percibida | Escala 1–5 en la entrevista | ≥ 4.2 |

## Condiciones (Seguridad y Relaciones Laborales)
- Solo en DEMO: la secuencia es ilustrativa y **no** se usa para operar.
- Antes de cualquier uso operativo, se reemplaza por el procedimiento aprobado de trabajo en alturas, validado por Operaciones y Seguridad.
- Relaciones Laborales validó los textos de «detente y avisa» y de no uso (ADX-RL-002, D-014), solo para personal de confianza.
- Los 7 hallazgos MEDIUM de UX se priorizan con lo que salga del piloto.

## Después del piloto
- Informe al Director el 2026-10-19 [Supuesto].
- Ajustes a la Misión 01.
- Decisión sobre la siguiente misión: 02 Ejecutar la tarea, o una misión de LOTO o del EAF con el mismo motor.
