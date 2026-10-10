# PRX-0013 · Handoff de Closed Won al kickoff, con gate G0

**Autor:** DEL-01 · **Fecha:** 2026-10-09 · **Estado:** borrador para QA-01 · Todo el documento es **[PROPUESTA]**.

**Mensaje clave.** Hoy `signContract` pasa directo de la firma al ingreso y la factura, y el contrato se queda en `signed` sin dueño de entrega. Propongo dos controles: **Listo para kickoff** (interno, lo aprueba el Founder) y **G0** (lo aprueba el sponsor al cerrar SENSE, skill §10.6). Los dos se registran con los estados, tareas y aprobaciones que ya existen, sin tocar código.

## 1. Secuencia y responsables (WF02, paso 1)

| # | Responsable | Entregable | Plazo desde la firma |
|---|---|---|---|
| H1 | SAL-03 | Paquete de handoff: propuesta aceptada, SOW, valor en juego, hipótesis de valor, contrapartes (sponsor, Change Owner, Data Owner) y compromisos hechos en la venta | 2 días hábiles |
| H2 | DEL-01 | Delivery charter (resultados, alcance, exclusiones y gates) y plan de equipo con `/equipo` (dotación, días-persona y margen) | 4 días |
| H3 | FIN-01 | Margen validado (objetivo ≥ 50 %) y calendario de facturación ligado a gates (§7.3) | 4 días |
| H4 | RISK-01 | NDA y cesión de PI firmados por cada asociado; reglas de tratamiento de datos del cliente | antes de compartir información |
| H5 | DAT-01 | Plan de baseline: fuentes, Data Owner, método y fecha de medición | 5 días |
| H6 | CX-01 | Ficha de salud de la cuenta, canal y cadencia de comunicación con el cliente | 5 días |
| H7 | DEL-02 (y DEL-03 si hay IA) | Hipótesis de intervención para la agenda del kickoff | 5 días |
| H8 | QA-01 | Revisión del kickoff deck (§10.7) | antes de enviarlo |
| H9 | **Founder** | Revisión como Principal y aprobación de «Listo para kickoff» | — |

Las tarifas de asociados las proporciona el Founder; no se estiman.

## 2. Criterios

**Listo para kickoff** (se pasa de `signed` a `active`):
1. Contrato `signed` con evidencia de firma y SOW adjunto.
2. Sponsor, Change Owner y Data Owner con nombre.
3. Charter y plan de equipo cerrados; margen ≥ 50 % con las tarifas reales, o una excepción aprobada por el Founder.
4. NDA y cesión de PI firmados por todo el que vaya a ver información del cliente.
5. Horas del Founder por semana confirmadas contra su capacidad.
6. Kickoff deck revisado por QA-01 y por el Principal.

**G0** (cierre de SENSE):
1. Business case con el costo de no actuar aprobado por escrito por el sponsor.
2. Baseline medido y validado por DAT-01 (fuente, fecha y método).
3. KPIs de resultado definidos. La asistencia y las horas de formación no cuentan.
4. Riesgos y supuestos con dueño. Si G0 falla, el trabajo regresa a DAT-01 o DEL-02, según la causa.

En el Adoption Gap Diagnostic, G0 coincide con la aprobación del informe.

## 3. Qué queda registrado en el Command Center (sin cambiar código)

- **Estado del contrato:** `signed` significa contratado y en handoff. `active` significa kickoff aprobado; el Founder lo cambia con `setContractStatus`, que ya permite `signed → active` y lo deja en el log de auditoría. `completed` se usa al cierre, después de G3.
- **Tareas:** se crea una tarea por paso H1–H8 con `createTask`, usando `entityType: "contract"`, `entityId` = id del contrato, `origin: "orchestrator"`, `dueDate` según la tabla y títulos estándar («H2 · Delivery charter · {contrato}»). La regla de duplicados que ya existe evita repetir tareas abiertas.
- **Aprobaciones:** se registran dos en `approvals`, de tipo `contract`: «Listo para kickoff · {contrato}» y «G0 · {contrato}». En el detalle va la ruta de la evidencia (acta del sponsor, baseline).
- **Regla para FIN-01:** el anticipo de inicio se factura al firmar, pero el ingreso por hito (`basis: milestone`) no se reconoce antes de que G0 esté aprobado. Facturar no es lo mismo que reconocer ingreso.

**Lo que falta en el sistema** (para DEV-01; Projects v1, Fase 2): crear las tareas H1–H8 automáticamente al firmar, un tipo de aprobación `delivery_gate`, bloquear el reconocimiento por hito sin G0 y un módulo de proyecto con hitos y riesgos.

## Decisión requerida del Founder

| Opción | Qué implica | Riesgo | Esfuerzo |
|---|---|---|---|
| **A** | Adoptar el handoff hoy con registro manual | Puede olvidarse algún paso | Bajo, en tiempo del Founder |
| **B** | A ahora, y automatizarlo en Projects v1 (DEV-01) | Ocupa capacidad de la Fase 2 | Medio |
| **C** | Esperar a Projects v1 | El primer contrato podría llegar sin proceso | Ninguno hoy |

**Recomendación:** B. Faltan datos para operarlo: tarifas de asociados y horas del Founder disponibles por semana.
**Fecha límite:** 2026-10-16, o antes de firmar el primer contrato real si ocurre primero.

## Handoff

```json
{"brief_id":"PRX-0013","owner":"DEL-01","objective":"Diseñar el handoff de Closed Won al kickoff, con gate G0 y trazabilidad en el Command Center",
 "deliverable":"praxia/equipos/E4-delivery-adopcion/2026-10-09-PRX-0013-consolidacion-crm/DEL-01-handoff.md",
 "evidence_and_sources":["Skill §6.5, §7.3, §10.2–§10.7","workflows/02_CLIENT_DELIVERY.md","commercial.ts: signContract, setContractStatus, recognizeRevenue","agents.ts: createTask","schema.ts: contracts, agentTasks, approvals"],
 "assumptions":["Los plazos H1–H9 son propuestos","El Founder cubre el rol de Principal","No hay contratos reales firmados"],
 "risks":["Saturación del Founder (D-P01)","Registro manual incompleto hasta Projects v1","Reconocer ingreso antes de G0 si no se respeta la regla de FIN-01"],
 "decisions_needed":["Opción A/B/C de registro y automatización","Tarifas de asociados","Horas del Founder disponibles por semana"],
 "next_owner":"QA-01","review_status":"borrador"}
```
