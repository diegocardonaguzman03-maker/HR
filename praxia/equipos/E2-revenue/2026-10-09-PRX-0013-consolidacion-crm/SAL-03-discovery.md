# Discovery y propuesta conectados al CRM

PRX-0013 · SAL-03 · 2026-10-09 · Borrador interno [PROPUESTA] · Siguiente revisor: QA-01

**Mensaje clave:** cada respuesta del discovery llena un campo de `opportunities`, y cada fase de la propuesta es una fila de `proposal_lines`. Lo real siempre lleva `isDemo = false`.

## 1. Guía de discovery (45 min, 12 preguntas)

Se pide permiso para tomar notas. La nota va a `activities` (`type = meeting`, `actor = SAL-03`) y separa citas, inferencias y supuestos.

| # | Bloque | Pregunta | Campo CRM |
|---|---|---|---|
| 1 | Contexto | ¿Qué transformación impulsan? ¿Qué lanzaron en 12 meses? | `title` |
| 2 | Contexto | ¿Por qué ahora? ¿Qué lo hace urgente? | nota (calificación, criterio 6) · `risks` si no hay urgencia |
| 3 | Brecha | ¿Qué debería pasar y no pasa? ¿Dónde se ve? | `problemStatement`, en palabras del cliente |
| 4 | Brecha | ¿Qué dicen los datos de uso, tiempo o costo? ¿Tendríamos acceso? | nota (baseline) · `risks` si no hay datos |
| 5 | Brecha | ¿Qué intentaron? ¿Qué hacen distinto los equipos que sí adoptan? | `proposedSolution` (hipótesis) |
| 6 | Valor | ¿Qué indicador del negocio se movería y cuánto? | nota (valor en juego, §7.2) |
| 7 | Valor | ¿Cuánto les cuesta cada mes que esto siga igual? | nota (costo de no actuar) → base de `amount` |
| 8 | Valor | ¿Diagnóstico, una o dos prioridades o un programa? | `serviceId` |
| 9 | Decisión | ¿Quién patrocina y responde por el resultado? | `primaryContactId` |
| 10 | Decisión | ¿Quién más decide? ¿Cómo compran (compras, legal, alta de proveedor)? | `risks` |
| 11 | Decisión | ¿Hay presupuesto, en qué moneda y para cuándo deciden? | `currency` · `expectedCloseDate` |
| 12 | Cierre | Hipótesis de valor en una frase y siguiente paso con fecha. | `nextAction` · `nextActionDate` |

**Reglas de captura**
- Gates de etapa: `discovery_completed` exige contacto y `problemStatement`; `proposal_development`, `amount` y `serviceId`; `proposal_sent`, además `expectedCloseDate`.
- `amount` es el fee estimado (no el valor en juego), en centavos. Vacío hasta que el Founder revise el rango.
- Calificación §8.2 en la nota: propuesta solo con ≥ 28 y sin ningún 1 en sponsor o valor.
- `ownerAgentId = SAL-03` desde el discovery hasta la propuesta.

## 2. Plantilla de propuesta (proposals + proposal_lines)

**Encabezado (`proposals`):** `title` en lenguaje del problema · `summary` = sección 2 · `currency` USD o MXN · `taxRate = 0.16` (IVA aparte) · `validUntil` = emisión + 30 días · `draft → internal_review → approved`: aprueba y envía solo el Founder.

**Secciones §9.2:** las 6 (Enfoque), 7 (Alcance), 10 (Cronograma) y 11 (Inversión) se vuelven líneas, una por fase con gate de pago. Las demás (1, 3–5, 8, 9, 12–14) viven solo en el documento.

| `position` | `description` (fase y entregables) | `milestone` (gate de pago) | `quantity` | `unitPrice` | `estimatedCost` | `serviceId` |
|---|---|---|---|---|---|---|
| 1 | Fase 1: [entregables · criterio de aceptación] | Firma | 1 | [Founder] | [días-persona × costo diario] | [código] |
| 2 | Fase 2: [entregables · criterio de aceptación] | G1 | 1 | [Founder] | [ídem] | [código] |
| 3 | Fase 3 / cierre: [entregables] | G2 / cierre | 1 | [Founder] | [ídem] | [código] |
| 4 | Complemento opcional (máximo uno) | [gate] | 1 | [Founder] | [ídem] | [código] |

**Reglas de las líneas**
- Nunca por hora ni día-consultor: `quantity` = 1 por fase, o meses en un retainer (mínimo 3).
- Pagos por gate, no por calendario: diagnóstico 50/50; sprint o programa 40/30/30 [PROPUESTA §7.3].
- `estimatedCost` = Σ (días-persona × costo diario) + herramientas; el costo diario lo da el Founder (§10.4). Viajes a costo, fuera de las líneas.
- Antes de `internal_review`: margen por línea ≥ 50 %, fee entre 5 % y 15 % del valor en juego anual, total dentro del rango §5.2 y ROI nunca garantizado. Piso y margen quedan marcados para revisión del Founder hasta que FIN-01 los valide.

## 3. Hallazgos para la consolidación

1. No hay campo para la calificación ni para el valor en juego: viven en una nota que no sirve de gate.
2. El catálogo A–G no coincide con las ofertas §5.2. Solo equivalen A (diagnóstico), C (AI Accelerator) y G (retainer); el Sprint y el Program no tienen código. D-P02 sigue pendiente.

## Decisión requerida del Founder

| Tema | Opciones | Recomendación | Riesgo | Esfuerzo | Fecha límite |
|---|---|---|---|---|---|
| Catálogo de `serviceId` | A: usar A–G y anotar la oferta en `description` · B: alinear el catálogo a §5.2 · C: esperar D-P02 | A ahora, B al cerrar D-P02 | Con C, sin `serviceId` no se avanza de etapa | A nulo · B lo hace el dueño del Command Center | 2026-10-16 |
| Campos de calificación y valor en juego | A: dejarlos en la nota · B: agregar `qualificationScore` y `valueAtStake` | B | Con A avanza una propuesta < 28 | Cambio menor de esquema (no lo hace SAL-03) | 2026-10-16 |

```json
{"brief_id":"PRX-0013","owner":"SAL-03","objective":"Guía de discovery de 12 preguntas y plantilla de propuesta conectadas a los campos del CRM (opportunities, proposals, proposal_lines)","deliverable":"praxia/equipos/E2-revenue/2026-10-09-PRX-0013-consolidacion-crm/SAL-03-discovery.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/db/schema.ts","apps/praxia-command-center/src/server/seed/base.ts (STAGES, SERVICES)","Skill §7.2, §7.3, §8.2, §8.3, §9.2, §10.4","templates/CLIENT_DISCOVERY.md"],
 "assumptions":["Los montos del CRM están en centavos de la moneda original","La calificación y el valor en juego se guardan en una nota de actividad mientras no haya campo","No se fija ningún precio; unitPrice y el costo diario los define el Founder"],
 "risks":["El catálogo A–G no coincide con las ofertas §5.2 (D-P02 pendiente)","Sin campo de calificación, una propuesta con menos de 28 puede avanzar"],
 "decisions_needed":["Catálogo de serviceId mientras D-P02 siga abierta","Agregar los campos qualificationScore y valueAtStake"],
 "next_owner":"QA-01","review_status":"borrador"}
```
