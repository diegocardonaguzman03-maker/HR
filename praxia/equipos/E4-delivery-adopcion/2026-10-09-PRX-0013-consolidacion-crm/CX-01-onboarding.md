# PRX-0013 · Onboarding de cliente, primeros 30 días después de la firma
**Dueño:** CX-01 · **Fecha:** 2026-10-09 · **Estado:** borrador para QA-01 · **Etiqueta general:** [PROPUESTA]

**Mensaje clave.** Propongo que la firma abra 30 días de onboarding con dueño, tareas y señales de salud registradas en el Command Center, con la meta de llegar a G0 (baseline aprobado). CX-01 prepara y el Founder envía.

**Día 0 (disparador).** El contrato pasa a `signed` con `signedAt` y `signatureEvidence`, y la organización pasa a `lifecycle = client`. [PENDIENTE: DEV-01 confirma si ese cambio ya es automático].

## Checklist semana a semana

| Semana | Qué se hace (dueño) | Registro en el Command Center |
|---|---|---|
| **S1 · días 1-7** | Borrador de bienvenida y acuse, sin prometer resultados (CX-01; envía el Founder). Se confirman sponsor, Change Owner y contactos con base legal (CX-01). Se agenda el kickoff (DEL-01). Se revisan NDA y tratamiento de datos (RISK-01). | `activity` tipo `email` (outbound, `recordedManually`) cuando el Founder envíe. `agent_tasks`: DEL-01 «Kickoff», RISK-01 «Revisión NDA/datos», con `entityType=contract`. Contactos con `lawfulBasis` capturado. |
| **S2 · días 8-14** | Kickoff y outcomes charter (DEL-01). Se acuerdan la cadencia (Adoption Office semanal, steering mensual) y el canal de soporte con tiempo de acuse (CX-01). Se solicitan los datos del baseline (DAT-01). | `activity` tipo `meeting` (kickoff). `activity` tipo `note` «Cadencia y canal acordados». `agent_tasks` DAT-01 «Solicitud de baseline» con `dueDate`. |
| **S3 · días 15-21** | Primer status report (DEL-01). Se valida el baseline (DAT-01). **Primer health check** (CX-01). Los issues se clasifican por urgencia, impacto y dueño (WF05). | `activity` tipo `note` «Health check S3» con las 5 señales en formato fijo. Cada issue es una `agent_task` al dueño (DEL-01 o DEV-01) con `priority`. |
| **S4 · días 22-30** | Revisión de 30 días con el sponsor: avance hacia G0, riesgos, siguiente ola (DEL-01 y CX-01). Se concilia la primera factura y su cobro. Se actualiza la base de conocimiento (COM-01). | `activity` tipo `meeting` «Revisión 30 días». `activity` tipo `note` «Health check D30». La factura y el pago van en su módulo. `agent_task` COM-01 «Artículo de conocimiento». |

Formato de la nota de salud: `Salud: Verde/Amarillo/Rojo · S1..S5 · acción · dueño · fecha`. Se adjunta a la organización y a la oportunidad con `actor = CX-01`.

## 5 señales de salud del cliente
Son señales de riesgo de la relación, no KPI de éxito (regla de oro 6).

| # | Señal | Verde | Amarillo | Rojo |
|---|---|---|---|---|
| S1 | El sponsor está presente en kickoff y revisión de 30 días | 2/2 | 1/2 | 0/2 [Supuesto] |
| S2 | Días desde la solicitud hasta la entrega del baseline | ≤10 días hábiles | 11-15 | >15 [Supuesto] |
| S3 | Tiempo de respuesta del cliente a solicitudes | ≤2 días hábiles | 3-5 | >5 [Supuesto] |
| S4 | Sesiones de Adoption Office realizadas contra las planeadas | ≥80% | 60-79% | <60% [Supuesto] |
| S5 | Primera factura | Pagada en plazo | Vencida 1-15 días | Vencida >15 días [Supuesto] |

**Regla de semáforo [PROPUESTA].** Dos señales en amarillo o una en rojo ponen al cliente en Amarillo. Dos en rojo lo ponen en Rojo. Con Rojo se crea una `agent_task` `urgent` a DEL-01 y la nota se escala al Founder. Se recalibra con los 3 primeros clientes.

**Brechas (sin tocar código).** No existe un campo de salud del cliente, nada crea las tareas del Día 0 al firmar y DEV-01 tiene que validar `entityType=contract`.

## Decisión requerida del Founder
**Cómo registrar el onboarding y la salud del cliente.**
- **A.** Notas estructuradas y tareas manuales con el esquema actual. Esfuerzo bajo, sin código. Su límite: no hay tablero de salud.
- **B.** A, y además DEV-01 agrega un campo de salud y crea las tareas del Día 0 al firmar. Esfuerzo medio, entra en el backlog de DEV-01.
- **C.** Llevar el seguimiento en una hoja externa. Se descarta porque rompe el flujo único.

**Recomendación:** A desde hoy y B antes de firmar el primer contrato. **Riesgo si no se decide:** el primer cliente entra sin dueño después de la firma. **Fecha límite:** 2026-10-23 o antes de la primera firma, lo que ocurra primero.

```json
{"brief_id":"PRX-0013","owner":"CX-01",
 "objective":"Checklist de onboarding de 30 días y 5 señales de salud, mapeados al Command Center",
 "deliverable":"praxia/equipos/E4-delivery-adopcion/2026-10-09-PRX-0013-consolidacion-crm/CX-01-onboarding.md",
 "evidence_and_sources":["skill §8.1, §10.5, §10.6, §10.7","workflows/02_CLIENT_DELIVERY.md paso 7","workflows/05_CUSTOMER_SUPPORT.md pasos 1, 2 y 6","apps/praxia-command-center/src/server/db/schema.ts (activities, agent_tasks, contracts, organizations)"],
 "assumptions":["Umbrales S1-S5 [Supuesto], sin datos de clientes","Cadencia de gobernanza según §10.5"],
 "risks":["Sin campo de salud ni disparador de Día 0, el registro depende de captura manual","entityType=contract sin validar"],
 "decisions_needed":["Modelo de registro de onboarding y salud: A, B o C"],
 "next_owner":"QA-01","review_status":"borrador"}
```
