# PRX-0013 · Revisión de arquitectura: CRM, mirror y base del Artifact

DEV-01 · 2026-10-09 · Borrador para QA-01 y RISK-01

**Mensaje clave.** El diseño de usar los mismos servicios en el servidor, en el mirror y en la página es correcto y conviene conservarlo. La sincronización todavía no es segura con más de un escritor: hoy puede perder ediciones, reescribir cambios ajenos (eco) y llenar la base. Además, `.sync/2` tiene listos 117 organizaciones y 130 contactos reales, y D-P07 sigue sin decidir. Antes de la Fase 2 hay que fijar quién es el sistema de registro.

Contraste con el contrato `db` 0.2.75: no hay transacciones (gana la última escritura), el tope es de 25,000 documentos por base, `onSnapshot` también entrega las escrituras propias y existe `acquire` para leases.

## 1. Riesgos

| # | Riesgo | Evidencia | Sev. |
|---|---|---|---|
| R1 | **Privacidad / D-P07** | `.sync/2`: 117 organizaciones y 130 contactos con nombre, cargo y LinkedIn; no puedo confirmar si se aplicaron. `audit_log` copia filas completas y se replica: la lee cualquiera con acceso al Artifact. `.sync/` tiene ruta fija y nunca se limpia | Alta |
| R2 | **Concurrencia** | La página escribe con `set` sin versión. El mirror usa `if_version` con un contador propio: `pull` supone versión 1 y no ve las escrituras de la página. Guarda `state.json` antes de saber si el lote se aplicó | Alta |
| R3 | **Eco de escrituras** | `flush()` termina con `last = next`: un cambio remoto que llega durante el flush se reescribe después y rompe el `if_version` del mirror. No se filtra `hasPendingWrites`: una escritura propia tardía pisa una edición local más nueva. El primer snapshot se descarta sin reconciliar con el `get()` del arranque | Media-alta |
| R4 | **Versiones de esquema** | No hay `schema_version`. El mirror usa las migraciones del working tree; una columna desconocida hace fallar `upsertRow` en el callback y deja `foreign_keys = OFF` | Media |
| R5 | **Límites de la base** | Un documento por fila de `audit_log` y `agent_events`: 248 de las 495 escrituras del import fueron auditoría. El arranque lee las 20 colecciones completas | Media |
| R6 | **Integridad** | Las reglas solo corren en el cliente: un Contributor puede escribir `audit_log` o tareas `orchestrator` y falsear el estado «session» | Media |
| R7 | **Estado «session» sin latido** | `agents.ts` toma «working» de la tarea orquestada. Si la sesión muere, el agente se queda en «working» indefinidamente | Media |
| R8 | **Importador** | No es transaccional; el dedupe de organizaciones usa `lower()` (solo ASCII); `fitScore` sin auditoría. A favor: sin correos, `not_assessed`, procedencia e idempotencia | Baja |

## 2. Decisiones que conviene fijar (ADR) [PROPUESTA]

- **ADR-001 Sistema de registro.** La base del Artifact funciona como **réplica de visualización con un solo escritor**: el mirror ahora y el motor en la Fase 2. La página solo lee los datos del CRM y de finanzas.
- **ADR-002 Protocolo de sincronización.** Versión por documento en toda escritura. Un lease (`acquire`) para el escritor único. El mirror confirma el lote antes de guardar su estado y vuelve a hacer `pull` si hay conflicto. El runtime ignora `hasPendingWrites`, reconcilia el primer snapshot y actualiza `last` documento por documento.
- **ADR-003 Esquema versionado.** Un documento `meta/schema` con la versión de las migraciones. La página y el mirror no escriben si la versión no coincide.
- **ADR-004 Retención.** `audit_log` y `agent_events` se agrupan por día o se podan. La réplica no lleva copias con datos personales; la auditoría completa vive solo en el servidor.
- **ADR-005 Contrato del motor.** El motor de la Fase 2 usa la misma máquina de estados de tareas (`canTransition`). El mirror es su primer adaptador.

## 3. Cinco siguientes pasos hacia la Fase 2

| # | Paso | Dueño | Esfuerzo [Supuesto] |
|---|---|---|---|
| 1 | Detener la carga de datos reales hasta que se decida D-P07. Confirmar si `.sync/2` ya se aplicó y, si la decisión es A, borrar esos documentos y vaciar `.sync/` | Founder, RISK-01, DEV-03 | 0.5 día |
| 2 | Implementar ADR-002 y ADR-003, con pruebas de integración de conflicto, eco y esquema desfasado | DEV-02, DEV-03 | 2–3 días |
| 3 | Latido con `acquire` (TTL de 10 min) para las tareas orquestadas y un estado «stale» cuando el lease vence | DEV-02 | 1 día |
| 4 | Presupuesto de documentos y retención (ADR-004); dedupe Unicode y transacción en el importador | DEV-02 | 1–2 días |
| 5 | Especificación del motor de ejecución: interfaz `claim/run/report/cost`, permisos de herramientas, aprobación del Founder para todo lo externo y tope de gasto por tarea. Se justifica en horas del Founder liberadas por semana, no como producto vendible (§6.6, §11.1) | DEV-01 | 2 días |

Filtro de valor: el Command Center es interno y no pasa el filtro de USD 20k como oferta; se justifica si libera horas del Founder para vender (§11.2). El motor implica gasto en LLM y requiere decisión del Founder.

## Decisión requerida del Founder

**D-P09 [PROPUESTA]: quién escribe en la base del Artifact**
- **A.** Un solo escritor: el mirror o el motor escriben y la página solo lee el CRM. Es lo más simple y lo más seguro.
- **B.** Varios escritores con versiones y leases: la página también edita. Implica más código y más superficie de error.
- **C.** Dejar todo como está. Se aceptan pérdidas silenciosas de datos.

**Recomendación:** A. **Riesgos de A:** si se edita desde claude.ai, el cambio tarda en aparecer. **Costo:** incluido en el paso 2. **Fecha límite:** antes de la próxima ejecución del mirror y a más tardar el 2026-10-16.

Recordatorio: D-P07 (cuándo cargar datos reales) sigue pendiente. Mientras no se decida, el paso 1 aplica.

```json
{"brief_id":"PRX-0013","owner":"DEV-01","objective":"Revisión de arquitectura del CRM, el mirror y la sincronización con la base del Artifact; riesgos, ADR y 5 pasos hacia la Fase 2",
 "deliverable":"praxia/equipos/E6-producto-experiencia/2026-10-09-PRX-0013-consolidacion-crm/DEV-01-arquitectura.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/services/importer.ts","apps/praxia-command-center/artifact/mirror.mts","apps/praxia-command-center/artifact/src/runtime.ts","apps/praxia-command-center/src/server/services/agents.ts","apps/praxia-command-center/docs/SECURITY.md","Contrato db 0.2.75 (db.d.ts)","Conteo de .sync/1-4","registro-de-decisiones.md (D-P07, D-P08)"],
 "assumptions":["Los esfuerzos son estimaciones [Supuesto]","No se verificó si los lotes de .sync/2 se aplicaron a la base publicada"],
 "risks":["R1 privacidad y D-P07","R2 concurrencia","R3 eco de escrituras","R4 esquema sin versión","R5 tope de 25k documentos","R6 integridad del lado del cliente","R7 estado session sin latido","R8 importador no transaccional"],
 "decisions_needed":["D-P09 escritor único (A/B/C)","D-P07 carga de datos reales (pendiente)"],
 "next_owner":"QA-01","review_status":"borrador"}
```
