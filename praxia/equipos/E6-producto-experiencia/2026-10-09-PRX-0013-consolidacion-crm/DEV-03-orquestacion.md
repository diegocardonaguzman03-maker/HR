# Runbook de orquestación de agentes · PRX-0013

**Dueño:** DEV-03 · **Revisa:** DEV-01, QA-01, RISK-01 · **Estado:** borrador · 2026-10-09

**Mensaje clave:** hoy el flujo es manual y auditable. La sesión de Claude Code ejecuta a cada agente y `mirror.mts` registra cada cambio como `orchestrator:claude-code` [DEFINIDO]. Hay cinco fallas que conviene corregir antes de la Fase 2. Una de ellas permite cerrar trabajo sin aprobación.

## 1. De la tarea al agente
1. La sesión principal asigna el `PRX-NNNN`, elige el flujo y arma un brief por dueño: resultado, criterios de aceptación, ruta de salida y quién aprueba.
2. Registra la tarea con `task-create` (o `tasks-create`). `createTask` valida que el agente exista y esté activo, y escribe `task_queued` y la auditoría.
3. El mirror emite lotes de 50 escrituras o menos, con `if_version`. La sesión los aplica con `ArtifactData batch` y PRAXIA World los anima.
4. La sesión lanza `.claude/agents/praxia-<id>.md` con el brief, en paralelo cuando los pasos son independientes.

## 2. Ejecución y regreso
| Momento | Comando `mirror.mts` | Regla |
|---|---|---|
| Inicio | `task-status <id> working` | Desde `queued` o `waiting_input` |
| Avance | `task-progress <id> 0-95` | Solo en curso; el 100 es el cierre |
| Falta dato | `task-status <id> waiting_input` | Vuelve a `working` |
| Aprobación | `task-status <id> waiting_approval` | Espera al Founder |
| Cierre | `task-status <id> completed "<ruta>"` | Sin `output`, se rechaza |

El agente entrega el archivo con su handoff JSON. La sesión valida el handoff, pasa la entrega por QA-01 (y por RISK-01 cuando aplica) y cierra la tarea con la ruta como `output`.

## 3. Qué hacer ante errores
- **El agente falla o entrega fuera de alcance:** se pasa la tarea a `error` y de ahí a `queued` con el brief corregido, o se reasigna con `reassignTask`. Si falla una puerta, regresa al dueño anterior.
- **Conflicto de versión:** no se fuerza. Se exporta de nuevo, se corre `pull` y se repite el comando.
- **El lote no se aplicó:** el `state.json` ya avanzó. Se reconstruye con `pull <exportDir> <lotes aplicados>`.
- **`BusinessRuleError`:** no se edita la base a mano. Se sigue la transición permitida.
- Nada se reporta como hecho si la herramienta no lo confirmó.

## 4. Controles contra envíos sin aprobación
**Vigentes** [DEFINIDO en código]: no hay código que envíe mensajes ni llame a APIs externas. Las salidas se bloquean para contactos marcados «do not contact». `decideApproval` solo acepta al actor `founder`. Una propuesta solo se marca como enviada si fue aprobada, y cualquier edición la regresa a borrador. Todo queda en `audit_log` con su actor.

**Huecos (bitácora de fallas):**
| # | Falla | Corrección propuesta (DEV-02) |
|---|---|---|
| F1 | Cualquier actor puede pasar de `waiting_approval` a `completed`: un trabajo se cierra sin aprobación del Founder | Exigir `approval` `agent_output` aprobada |
| F2 | El mirror no puede solicitar aprobaciones; `agent_output` no se usa | Comando `approval-request` |
| F3 | `task-status error` guarda el texto como `output`; la causa queda «Unspecified error» | Pasar `{ error }` |
| F4 | No se verifica que exista el archivo del `output` | Validar la ruta al cerrar |
| F5 | Ruta fija `/home/user/HR/.sync` | Ruta relativa a `stateDir` |

Mientras se corrige: la sesión no cierra una tarea en `waiting_approval` sin la confirmación escrita del Founder [PROPUESTA].

## 5. Evaluación de calidad por agente
Suite mínima por entrega [PROPUESTA]:
| Dimensión | Prueba | Tipo |
|---|---|---|
| Ruteo | Dueño correcto según flujo; `next_owner` definido | Automática |
| Formato | Handoff válido contra el esquema; ruta e ID en convención | Automática |
| Marca | Sin palabras prohibidas; paleta vigente; un idioma | Automática + QA-01 |
| Exactitud | Fuentes con fecha; etiquetas; cero datos inventados | QA-01 |
| Gobierno | Sección de decisión si hay `decisions_needed`; sin acciones falsas | Automática + QA-01 |
| Riesgo | Datos personales y salidas externas | RISK-01 |

Cada falla se anota con agente, PRX, dimensión y corrección. Si un agente repite una falla, se ajusta su ficha. Nada toca datos reales de clientes sin pasar esta suite.

## 6. Requisitos para automatizar en la Fase 2
1. F1 a F5 corregidas y con pruebas.
2. Credenciales que captura el Founder y permisos de mínimo privilegio por agente. Ninguna salida externa sin `approval` aprobada.
3. Costo por tarea (`costUsdMicros`) y tope por PRX.
4. La suite de la §5 como puerta automática. Si falla, la tarea pasa a `error` con su motivo.
5. Auditoría en la misma transacción que el cambio (`SECURITY.md`).
6. Cola con reintento idempotente y manejo de conflictos de versión.
7. Checklist de RISK-01 cerrado antes de usar datos reales (D-P07).

## Decisión requerida del Founder
- **A.** DEV-02 corrige F1 a F5 antes de la próxima orquestación, y yo dejo la suite como script.
- **B.** Solo control manual con este runbook hasta la Fase 2.
- **C.** Corregir solo F1 y F3.

**Recomendación:** A. F1 es el único camino para cerrar trabajo sin aprobación. **Esfuerzo:** cerca de un día de agente [Supuesto]. **Riesgo de B:** todo depende de la disciplina de la sesión. **Fecha límite:** 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"DEV-03","objective":"Runbook de orquestación de agentes: entrada, ejecución, errores, controles de aprobación, evaluación y requisitos de la Fase 2","deliverable":"praxia/equipos/E6-producto-experiencia/2026-10-09-PRX-0013-consolidacion-crm/DEV-03-orquestacion.md",
 "evidence_and_sources":["apps/praxia-command-center/artifact/mirror.mts","apps/praxia-command-center/src/server/services/agents.ts","apps/praxia-command-center/src/domain/tasks.ts","apps/praxia-command-center/src/server/services/commercial.ts","apps/praxia-command-center/docs/SECURITY.md","paquete-agentes/SYSTEM_ORCHESTRATOR.md","paquete-agentes/workflows/04_PRODUCT_BUILD.md","paquete-agentes/config/handoff.schema.json"],
 "assumptions":["Esfuerzo de F1 a F5 cercano a un día [Supuesto]","No hay motor autónomo; solo ejecuta la sesión de Claude Code"],
 "risks":["F1: cierre de tareas en espera de aprobación sin aprobación del Founder","F3: se pierde la causa de los errores","Desfase entre state.json y la base publicada si un lote no se aplica"],
 "decisions_needed":["Opción A/B/C para corregir F1 a F5 antes de la próxima orquestación (fecha límite 2026-10-16)"],
 "next_owner":"QA-01","review_status":"borrador"}
```
