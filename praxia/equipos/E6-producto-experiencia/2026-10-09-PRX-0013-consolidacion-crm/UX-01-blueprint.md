# Service blueprint del flujo lead-to-cash · PRX-0013

**Dueño:** UX-01 · **Revisan:** DEV-01, QA-01, RISK-01 · **Estado:** borrador · 2026-10-09

**Mensaje clave:** el Command Center registra bien la segunda mitad del flujo (propuesta → cobro) con candados reales: aprobación de precio solo del Founder, evidencia obligatoria de aceptación y firma, y factura limitada al valor del contrato [DEFINIDO en código]. La primera mitad (prospecto → discovery) y el kickoff dependen de la memoria del Founder: no hay oportunidad, aprobación ni registro estructurado que los sostenga. El riesgo es que las 117 cuentas se queden quietas.

## Blueprint (lectura: una fila por paso)

| Paso | Acción del Founder | Acción de agentes | Pantalla | Registro que queda | Punto de dolor |
|---|---|---|---|---|---|
| 1. Prospecto investigado | Revisa la prioridad y elige qué cuentas trabajar | SAL-02 y RES-02 investigan con fuente pública; SAL-01 prioriza | `/crm/organizations`, `/crm/contacts` | `organizations` (target) y `contacts` (researched) con fuente y fecha; `lawful_basis = not_assessed` | Las 117 cuentas no tienen oportunidad: el embudo de `/sales` las ignora y no hay «siguiente acción» |
| 2. Primer contacto aprobado | Aprueba el mensaje y lo envía fuera del sistema | SAL-03 redacta; RISK-01 revisa privacidad (D-P07) | `/outreach` (Fase 2, vacío); registro manual en el contacto | `activities` (outbound, manual); la opp exige `primaryContactId` en *Contacted* | El tipo de aprobación `outbound_message` existe en el esquema pero ningún flujo lo crea: la aprobación del mensaje no deja rastro |
| 3. Discovery | Conduce la reunión de 45' (skill §8.3) | SAL-03 prepara la guía y la nota; SAL-01 califica (§8.2) | `/crm/opportunities/[id]` | Etapas *Discovery Scheduled/Completed*; `problemStatement`; actividad `meeting` | No hay plantilla de nota ni campos para valor en juego, sponsor y puntaje de calificación: la regla «≥ 28 avanza» no se puede aplicar |
| 4. Propuesta | Define el alcance final | DEL-02 alcance; FIN-01 costo y margen; RISK-01 claims; QA-01 calidad | `/proposals/[id]` | `proposals` (draft) y `proposal_lines` con costo estimado | Las puertas de RISK-01 y QA-01 ocurren en el chat; la propuesta no muestra si las pasó |
| 5. Aprobación | Aprueba o rechaza el precio | Ninguna (solo el Founder decide) | `/approvals` | `approvals` (`proposal_pricing`), `approved_at`, `audit_log` | Aprobar no es enviar: la propuesta queda en *approved* hasta que el Founder recuerde marcar «sent» |
| 6. Firma | Registra la aceptación y luego la firma con evidencia | RISK-01 prepara el borrador de contrato (requiere abogado) | `/proposals/[id]` → `/finance/contracts/[id]` | Contrato *pending_signature* → *signed*; opp en *Closed Won*; org pasa a *client* | Pide evidencia dos veces (aceptación y firma); la aprobación `contract` no se usa |
| 7. Kickoff | Confirma inicio y fechas | DEL-01 plan y gates (§6.5 SENSE/G0); CX-01 bienvenida | `/projects` (solo economía); contrato → *active* | `setContractStatus(active)`; nada más | No existe objeto de kickoff: sin hitos, sponsor, baseline ni fecha G0. Facturación y entrega no se conectan |
| 8. Factura | Crea, revisa y emite | FIN-01 calcula el monto por hito | `/finance/invoices/new` | `invoices` draft → issued con número `PRX-AAAA-NNNN` y snapshot FX | Se captura a mano; no lee los hitos de `proposal_lines`. No es CFDI [PENDIENTE: razón social, RFC] |
| 9. Cobro | Registra el pago recibido | FIN-01 da seguimiento a la cartera | `/finance/invoices/[id]`, `/finance` | `payments`; estado derivado *overdue* o *paid*; meta USD 10k | No hay recordatorio de vencimiento ni tarea automática a FIN-01; D-P05 sigue sin definir qué mide la meta |

## Los 5 cambios de mayor impacto [PROPUESTA]

1. **Oportunidad por cuenta priorizada.** Crear una opp en *Researched* para las cuentas Tier 1, con dueño (SAL-01) y siguiente acción con fecha. *Uso observable:* % de cuentas Tier 1 con siguiente acción vigente.
2. **Aprobación de primer contacto.** Activar `outbound_message`: SAL-03 deja el borrador, RISK-01 lo valida y el Founder lo aprueba en `/approvals`. El registro manual de envío se habilita solo con la aprobación vigente. No automatiza envíos.
3. **Nota de discovery y puntaje §8.2 en la oportunidad.** Siete puntajes de 1 a 5, valor en juego y sponsor como campos. La etapa *Proposal Development* exige un total ≥ 28 y que no haya un 1 en sponsor ni en valor. *Uso observable:* tasa discovery → propuesta.
4. **Puertas visibles en la propuesta.** Una aprobación `agent_output` por QA-01 y RISK-01 (corrige F1/F2 de DEV-03), con *submit* bloqueado hasta que ambas estén resueltas. Después de aprobar, el Founder ve el botón «Marcar enviada» como siguiente acción.
5. **Kickoff como objeto con calendario de facturación.** Al firmar se genera un kickoff con sponsor, baseline, fecha G0 y los hitos de `proposal_lines`. Cada hito propone una factura en borrador y una tarea a FIN-01 para cuando vence. *Uso observable:* días entre hito entregado y factura emitida.

## Decisión requerida del Founder

- **A.** Construir los 5 cambios en este orden: 1 → 2 → 3 → 4 → 5.
- **B.** Solo 1 y 2, para mover las 117 cuentas antes del primer contacto.
- **C.** Posponer todo y operar con el flujo manual actual.

**Recomendación:** B ahora y A completo antes del primer contrato. **Riesgo de C:** las cuentas se enfrían y no queda evidencia de qué mensaje aprobó el Founder. **Esfuerzo:** de 1 a 3 días de trabajo de agente para B [Supuesto]. **Depende de** D-P07 y D-P05. **Fecha límite:** 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"UX-01","objective":"Service blueprint lead-to-cash (9 pasos × 5 carriles) y los 5 cambios de mayor impacto","deliverable":"praxia/equipos/E6-producto-experiencia/2026-10-09-PRX-0013-consolidacion-crm/UX-01-blueprint.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/db/schema.ts","apps/praxia-command-center/src/server/seed/base.ts","apps/praxia-command-center/src/server/services/commercial.ts","apps/praxia-command-center/src/server/services/finance.ts","apps/praxia-command-center/src/server/services/importer.ts","apps/praxia-command-center/src/app/(app)/projects/page.tsx","apps/praxia-command-center/src/app/(app)/outreach/page.tsx","praxia/00-fuentes/paquete-agentes/workflows/01_LEAD_TO_CONTRACT.md","Skill PRAXIA §6.5, §8.2, §8.3, §11","DEV-03-orquestacion.md (F1/F2)"],
 "assumptions":["El importador de PRX-0012 crea organizaciones y contactos, pero no oportunidades","Esfuerzo de la opción B de 1 a 3 días de agente [Supuesto]","Sin prueba de uso con el Founder: el blueprint se basa en el código, no en observación"],
 "risks":["Primer contacto sin rastro de aprobación","Puertas QA/RISK fuera del sistema","Facturación desconectada de hitos; factura no fiscal hasta definir la razón social"],
 "decisions_needed":["Opción A/B/C para los 5 cambios (fecha límite 2026-10-16)"],
 "next_owner":"DEV-01","review_status":"borrador"}
```
