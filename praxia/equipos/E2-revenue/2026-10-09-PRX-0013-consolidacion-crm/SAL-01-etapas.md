# PRX-0013 · Etapas, fit score y brechas del CRM (SAL-01, WF01 paso 3)

**Mensaje clave.** El CRM controla las etapas con campos, no con evidencia. Solo Closed Won exige prueba (firma o aceptación). Hoy una oportunidad puede llegar a Qualified o Proposal Sent sin /calificar, sin discovery y sin propuesta aprobada. Propongo tres cambios [PROPUESTA]:
- que cada etapa se gane con evidencia registrada;
- que el fit 1–5 mida solo el encaje estructural con el ICP;
- que se corrija la escala del fit: el importador guarda 1–5 y la interfaz valida 0–100.

Supuesto de la meta de USD 10k: ingreso reconocido (D-P05, opción A) [PENDIENTE].

## 1. Las 12 etapas [PROPUESTA]

Las 117 organizaciones se quedan como `target`. Solo se abre una oportunidad cuando la empresa cumple la entrada de Identified.

| # | Etapa (dueño) | Entrada | Salida | Evidencia mínima |
|---|---|---|---|---|
| 1 | Identified (SAL-02) | Fit ≥ 3, sin señal de anti-cliente | Hipótesis de problema (§3.1) ligada a un servicio A–G | Fuente y fecha, fit justificado, trigger con URL y fecha ≤ 12 meses |
| 2 | Researched (RES-02, SAL-01) | Trigger, comprador (§3.2) e hipótesis verificados | Contacto con fuente pública, ABM Priority calculada, primer contacto aprobado por el Founder | Nota de investigación, tier, `lawfulBasis` ≠ `not_assessed`, `doNotContact` = falso |
| 3 | Contacted (Founder) | Contacto 1:1 del Founder, D-P07 cerrada, correo `valid` | Responde → 4. Sin respuesta tras 2 intentos en 21 días → 12 | Actividad `outbound` manual con canal y mensaje aprobado |
| 4 | Engaged (Founder, SAL-03) | Respuesta registrada | Conversación ejecutiva hecha | Actividad `inbound` y luego `meeting`, más `problemStatement` |
| 5 | Qualified (SAL-01) | /calificar ≥ 21, sin 1 en sponsor (C1) ni en valor (C2) | Discovery agendada con el economic buyer o el champion | Los 7 puntajes con evidencia, el total y el sponsor |
| 6 | Discovery Scheduled (SAL-03) | Fecha y asistentes confirmados | Reunión realizada | `nextActionDate` y guía §8.3 |
| 7 | Discovery Completed (SAL-03, SAL-01) | Nota §8.3 de una página | Nueva calificación ≥ 28 sin 1 en C1 ni C2, y valor en juego que justifique USD 20k. Si queda entre 21 y 27, más discovery | Nota, nueva calificación, valor en juego con supuestos |
| 8 | Proposal Development (SAL-03, DEL-02, FIN-01) | Servicio y monto en el rango §5.2, nunca por hora | Propuesta `approved`: el Founder aprobó el precio y pasaron RISK-01 y QA-01 | Líneas con `estimatedCost`, piso de margen, aprobación |
| 9 | Proposal Sent (Founder) | `sentAt` y vigencia de 30 días | Pide cambios → 10; acepta → 11; vence → se reemite o 12 | `sentAt`, `validUntil`, `expectedCloseDate` |
| 10 | Negotiation (Founder, FIN-01) | El comprador pide cambios por escrito | Versión final aceptada o rechazo | Una versión por cambio; cada precio aprobado por el Founder |
| 11 | Closed Won (Founder) | `signatureEvidence` o `acceptanceEvidence` (ya se exige) | Handoff a WF02 y FIN-01 | Contrato, monto y fecha |
| 12 | Closed Lost | Motivo de catálogo | Fecha de reactivación o descarte | `lostReason` y aprendizaje |

Si una puerta falla, la oportunidad vuelve al dueño anterior.

## 2. Regla del fit 1–5 [PROPUESTA]

El fit mide el encaje estructural. El trigger va aparte, como «Señal» de la fórmula ABM, para no contarlo dos veces. Hay 5 atributos y cada uno suma solo si tiene fuente pública:
1. Opera en México o LatAm.
2. Tiene escala que estresa a la organización: ≥ 250 empleados, o una ronda Serie B o posterior en 24 meses (umbral por validar).
3. Puede pagar: USD 20k es inmaterial frente a sus ingresos o su financiamiento.
4. Tiene un problema de §3.1 plausible y ligado a un servicio A–G.
5. Existe en la organización un comprador de §3.2.

**Puntaje:** número de atributos que cumple, con mínimo 1. Si no cumple el atributo 1, el máximo es 2. Si hay evidencia de anti-cliente, el puntaje es 1.

El fit es el `Fit_ICP` de ABM Priority (§8.2). Tiers: Tier 1 ≥ 85, Tier 2 de 72 a 84 y Tier 3 < 72.

## 3. Campos que faltan (recomendación, no código)

1. **Escala del fit:** fijarla en 1–5 (hoy `updateOrganization` y el formulario usan 0–100) y agregar `fitJustification` y `fitSource`.
2. **ABM:** agregar `fitBudget`, `fitAccess` y `signal`, además de la prioridad y el tier calculados.
3. **Trigger:** agregar `triggerType`, `triggerUrl` y `triggerDate`.
4. **Calificación:** crear una tabla con los 7 criterios, su evidencia, el total, la fecha y el autor. Funciona como puerta de entrada de las etapas 5 y 8.
5. **Oportunidad:** agregar `sponsorContactId`, `decisionDate`, `valueAtStake`, `valueAssumptions` y el enlace a la nota de discovery.
6. **Puertas por evidencia:**
   - Contacted: exige una actividad outbound y la base legal evaluada. Hoy `logActivity` solo bloquea `doNotContact`.
   - Discovery Completed: exige una reunión registrada.
   - Proposal Sent: exige una propuesta con `approvedAt` y `sentAt`.
7. **Saltos de etapa:** `moveOpportunityStage` valida solo la etapa destino. Debe exigir también la evidencia de las etapas que se saltan.
8. **Pérdida:** convertir `lostReason` en catálogo (sin respuesta, sin sponsor, sin presupuesto, timing, competencia, anti-cliente, precio) y agregar fecha de reactivación.

## Decisión requerida del Founder

- **A (recomendada):** aprobar las etapas, el fit 1–5 con sus topes y las brechas 1 a 8 como backlog. Esfuerzo medio: cambios de esquema y validación.
- **B:** aprobar etapas y fit, pero registrar la calificación en notas, sin control automático. Esfuerzo bajo.
- **C:** aplazar hasta cerrar D-P05 y D-P07. El pipeline sigue sin reglas.

**Riesgos.** Con B o C, el pipeline puede inflarse sin evidencia. Además, los umbrales de 250 empleados y de 2 intentos en 21 días no están validados.

**Fecha límite:** 2026-10-16. En cualquier opción, el primer contacto espera a D-P07.

```json
{"brief_id":"PRX-0013","owner":"SAL-01",
 "objective":"Entrada, salida y evidencia de las 12 etapas, regla de fit 1-5 y brechas del CRM",
 "deliverable":"praxia/equipos/E2-revenue/2026-10-09-PRX-0013-consolidacion-crm/SAL-01-etapas.md",
 "evidence_and_sources":["skill §3, §5.2, §7, §8.2, §8.3, §11.3","workflows/01_LEAD_TO_CONTRACT.md","src/server/seed/base.ts","src/server/services/crm.ts","src/server/services/importer.ts","src/server/db/schema.ts"],
 "assumptions":["Meta USD 10k = ingreso reconocido (D-P05 A, pendiente)","Escala de 250 empleados o Serie B+ [PROPUESTA]","2 intentos en 21 días [PROPUESTA]"],
 "risks":["Escala del fit inconsistente (1-5 frente a 0-100)","Etapas sin puerta de evidencia","Primer contacto bloqueado hasta D-P07"],
 "decisions_needed":["Aprobar etapas, regla de fit y backlog de campos (A/B/C)"],
 "next_owner":"QA-01","review_status":"borrador"}
```
