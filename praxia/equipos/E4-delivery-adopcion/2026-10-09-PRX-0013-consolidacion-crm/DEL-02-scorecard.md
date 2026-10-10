# PRX-0013 · Adoption Scorecard por contrato
DEL-02 · 2026-10-09 · borrador para QA-01 · [PROPUESTA]

## Mensaje clave
Un contrato firmado registra cuánto se vendió, pero no si el cliente adoptó. Propongo que cada contrato lleve **7 indicadores** con línea base, meta y semáforo, medidos con datos del cliente. Así el Command Center muestra en una misma vista el ingreso y la evidencia de adopción. Hoy no hay clientes ni datos reales: todo umbral es **[Supuesto]** y se calibra en G0 con el sponsor.

## Indicadores
Estructura: niveles del Scorecard [TRABAJADO] × capas de Adoption Architecture [TRABAJADO]. Sin puntaje AGI (fórmula [PENDIENTE]). La asistencia y las horas nunca cuentan como indicador.

| # | Nivel · capa | Indicador y definición | Fuente | Frecuencia | Verde / Ámbar / Rojo [Supuesto] |
|---|---|---|---|---|---|
| 1 | Exposición · Sentido | **Cobertura:** % de la población objetivo del charter con acceso efectivo al cambio (herramienta, proceso o rol) | Padrón del cliente, altas de acceso | Mensual | ≥90% / 70–89% / <70% |
| 2 | Comprensión · Sentido | **Claridad por rol:** % de una muestra que explica bien qué cambia y qué se espera de su rol | Pulso de 3 preguntas o entrevistas | Por ola | ≥80% / 60–79% / <60% |
| 3 | Capacidad · Capacidad | **Habilidad demostrada:** % que ejecuta la tarea crítica con la rúbrica en su puesto | Evaluación en puesto | Por ola | ≥75% / 50–74% / <50% |
| 4 | Comportamiento · Sistema operativo | **Uso recurrente:** % de usuarios objetivo que aplican la nueva práctica con la recurrencia mínima acordada | Logs del sistema, registros del proceso | Quincenal | ≥100% de la meta del periodo / 80–99% / <80% |
| 5 | Comportamiento · Liderazgo | **Patrocinio activo:** % de decisiones y señales comprometidas por sponsor y mandos que se cumplen a tiempo | Actas de comité, minutas | Quincenal | ≥90% / 70–89% / <70% |
| 6 | Impacto · Evidencia | **KPI de negocio:** avance contra la trayectoria del KPI acordado en G0 (lead time, costo, calidad, seguridad, ventas) | Sistema fuente del cliente | Mensual | ≥100% de la trayectoria / 70–99% / <70% o deterioro |
| 7 | Impacto · Evidencia y refuerzo | **Sostenibilidad:** % de rituales, tableros y mecanismos de refuerzo que el cliente opera sin PRAXIA (criterio G3) | Revisión de cierre | Trimestral y cierre | ≥80% / 50–79% / <50% |

**Reglas:**
- Los indicadores 4 y 6 son obligatorios y no se aceptan sin línea base y meta (skill §6.3).
- El semáforo del contrato toma el peor color entre 4, 5 y 6. Exposición y comprensión explican la causa, pero no definen el estado.
- Si un indicador cae a rojo, se abre un plan correctivo, que es la puerta G2 (§10.6).

## Registro en el Command Center (recomendación, sin código)
La tabla `contracts` no se modifica. Se agregan dos tablas ligadas por `contract_id`, con las convenciones de `schema.ts` (`id`, `is_demo`, `created_at`):

**`adoption_indicators`** (definición por contrato)
- `contract_id` (FK con cascada), `position`
- `level` (enum: exposure, comprehension, capability, behavior, impact) y `layer` (enum de las 5 capas)
- `name`, `definition`, `source`, `frequency` (weekly, biweekly, monthly, per_wave, quarterly), `unit`
- `baseline_value`, `baseline_date`, `target_value`, `target_date`
- `green_min`, `amber_min`, `direction` (higher_better o lower_better)
- `owner_agent` y `approved_at`. Los umbrales cambian solo por el flujo de `approvals`.

**`adoption_measurements`** (serie de tiempo)
- `indicator_id` (FK), `measured_on`, `value`, `status` (calculado: green, amber, red), `evidence_ref` (documento o extracto), `notes`, `recorded_by`

**Validaciones sugeridas:**
- Un contrato no pasa a `active` sin indicadores de nivel behavior e impact con línea base, meta y `approved_at` (G0).
- Los nombres que contengan "asistencia" u "horas" se bloquean.
- Solo se guardan agregados: nada de datos personales de los empleados del cliente.
- No se cargan datos reales mientras D-P07 siga abierta.

**Vista:** en la ficha del contrato, el semáforo, la tendencia por indicador y la fecha de la próxima medición, junto al ingreso reconocido.

**Responsables:** DEL-02 define, DAT-01 mide y valida la fuente, CX-01 reporta en el status y QA-01 revisa.

## Decisión requerida del Founder
| Opción | Qué implica |
|---|---|
| **A** | Dos tablas nuevas (`adoption_indicators` + `adoption_measurements`), con historial, validación de G0 y semáforo calculado |
| **B** | Un campo JSON `adoption_scorecard` en `contracts`: más rápido, pero sin serie de tiempo ni validaciones confiables |
| **C** | El Scorecard queda fuera del Command Center, en documentos por proyecto |

- **Recomendación:** A. Liga la venta con la evidencia de adopción, que es el diferenciador de la firma, y alimenta a futuro la base de datos del AGI.
- **Riesgos:** umbrales sin calibrar (todos [Supuesto]); el cliente puede compartir datos sensibles (RISK-01); con A, el contrato no pasa a `active` sin línea base aprobada en G0.
- **Costo o esfuerzo:** A, de 2 a 3 días de desarrollo y pruebas [Supuesto]; B, 1 día; C, nada.
- **Fecha límite:** 2026-10-16, junto con D-P05 y D-P07.

## Handoff
```json
{"brief_id":"PRX-0013","owner":"DEL-02","objective":"Adoption Scorecard por contrato y su registro en el Command Center","deliverable":"praxia/equipos/E4-delivery-adopcion/2026-10-09-PRX-0013-consolidacion-crm/DEL-02-scorecard.md",
 "evidence_and_sources":["Skill §6.2, §6.3, §6.4, §10.6","apps/praxia-command-center/src/server/db/schema.ts (contracts, approvals)","registro-de-decisiones.md (D-P05, D-P07)"],
 "assumptions":["Todos los umbrales verde/ámbar/rojo son [Supuesto] y se calibran en G0","Esfuerzo de desarrollo de A: 2 a 3 días [Supuesto]","No hay clientes ni datos reales"],
 "risks":["Umbrales sin validar con un cliente real","Datos sensibles del cliente: solo agregados; depende de D-P07","Que se lea como puntaje AGI: no lo es"],
 "decisions_needed":["Opción A/B/C para registrar el Scorecard (límite 2026-10-16)"],
 "next_owner":"QA-01","review_status":"borrador"}
```
