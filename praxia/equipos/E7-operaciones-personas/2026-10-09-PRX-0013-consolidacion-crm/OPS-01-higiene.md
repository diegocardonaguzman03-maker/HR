# PRX-0013 · SOP de higiene semanal del pipeline
**OPS-01 · 2026-10-09 · Borrador para QA-01 · Estado: [PROPUESTA]**

## Mensaje clave
La preparan los agentes; el Founder solo resuelve lo que nadie más puede decidir. Con 0 oportunidades cuesta **unos 20' por semana**, 5' de ellos dentro de la revisión de los lunes (CEO-01) [Supuesto]. Costo oculto: **ningún motor ejecuta tareas**, así que el Founder lanza y registra cada corrida.

**Cuándo:** lunes, antes de la revisión; alimenta su bloque «Higiene (5')».

## Qué se revisa [PROPUESTA]
| # | Revisión | Regla | Pantalla | Dueño | Tiempo |
|---|---|---|---|---|---|
| 1 | Demo separada | La demo (USD 4.3M) no aparece en ningún KPI; sin insignias *Demo* con la demo apagada | Inicio · `/sales` · `/settings/audit` | SAL-02 | 3' |
| 2 | Datos incompletos | Contactos con *Lawful basis* `not_assessed`, sin correo o sin fuente; cuentas sin *Fit* o sin industria. Se cuentan, **no se completan con datos inventados** | `/crm/contacts` · `/crm/organizations` | SAL-02; RES-02 verifica la fuente | 10' |
| 3 | Siguientes acciones vencidas | Toda oportunidad abierta tiene acción y fecha; en rojo o *not set* = en riesgo | `/sales` (*Follow-up queue*) · `/crm?view=table` | SAL-03 | 5' |
| 4 | Oportunidades sin monto | Se tolera antes de *Proposal Development*; desde esa etapa es error | Inicio (*without estimated value*) · `/crm?view=table` | SAL-03 · FIN-01 | 3' |
| 5 | Estancadas | Más de 14 días sin cambio de etapa (fecha tomada de la bitácora) | `/settings/audit` | SAL-01 | 5' |
| 6 | Tareas atrasadas | Tareas abiertas con fecha vencida; se reasignan, se reprograman o se cancelan | `/tasks` · `/world` (columna *Overdue*) | OPS-01 | 5' |
| 7 | Aprobaciones pendientes | Más de 7 días en cola = se escalan a la revisión | `/approvals` | CEO-01 ordena; **el Founder decide** | 2' |
| 8 | Horas del Founder | Horas de la semana por proyecto o frente (skill §10.4) | Ninguna pantalla hoy | OPS-01 | 2' |

Con 0 oportunidades, las revisiones 3 a 5 salen vacías.

## Cómo se registra
1. **Una tarea por semana** en `/tasks`, asignada a OPS-01: «Higiene pipeline AAAA-Sxx». En *Output*, una línea de conteos: `not_assessed · vencidas · sin monto · estancadas · tareas atrasadas · aprobaciones >7 d · horas Founder`. Da la tendencia sin construir nada.
2. Las correcciones se hacen en el registro; `/settings/audit` guarda el antes y el después.
3. Lo que requiere decisión va a `/approvals` o a la cola de CEO-01 y se anota en `registro-de-decisiones.md`.
4. No se cambia ningún *Lead status* a *Contacted* mientras D-P07 siga abierta.

## Costo en horas del Founder [Supuesto, a medir 4 semanas]
| Concepto | Hoy (0 opp.) | Con 5 a 10 opp. |
|---|---|---|
| Lanzar las corridas de agentes y registrar resultados (sin motor) | 10' | 15' |
| Resolver aprobaciones y datos que solo él conoce | 5' | 15' |
| Bloque de higiene dentro de la revisión del lunes | 5' | 5' |
| **Total de higiene** | **≈ 20'** | **≈ 35'** |

Con la revisión de 30', la cadencia cuesta de 45 a 60' por semana. Si la higiene pasa de 35', se recorta alcance, no calidad (§10.2).

## Backlog de SOP (congelado, según CEO-01)
Vista de «incompletos y estancadas» en el CRM · registro de horas del Founder · motor de ejecución de tareas.

## Decisión requerida del Founder
**Tema:** alcance de la higiene semanal.
- **A.** SOP completo (las 8 revisiones) desde el lunes 12 de octubre.
- **B.** Modo ligero (revisiones 1, 2, 6, 7 y 8) hasta la primera oportunidad real; después, el SOP completo.
- **C.** Higiene quincenal.

**Recomendación: B.** No gasta tiempo en revisiones vacías y deja lista la disciplina para el primer caso. **Riesgos:** olvidar pasar al modo completo; con C, una acción vencida puede pasar 14 días sin verse. **Esfuerzo:** B ≈ 15', A ≈ 20', C ≈ 10' por semana. **Fecha límite:** 16 de octubre de 2026, junto con D-P05 y D-P07.

```json
{"brief_id":"PRX-0013","owner":"OPS-01","objective":"SOP de higiene semanal del pipeline: qué se revisa, quién lo hace, en qué pantalla, cómo se registra y cuánto le cuesta al Founder","deliverable":"praxia/equipos/E7-operaciones-personas/2026-10-09-PRX-0013-consolidacion-crm/OPS-01-higiene.md",
 "evidence_and_sources":["apps/praxia-command-center/src/app/(app)/{crm,sales,tasks,approvals,world,settings/audit}/page.tsx (pantallas y señales)","src/domain/tasks.ts (isOverdue)","src/domain/pipeline.ts (opportunitiesWithoutValue, requiredFields)","src/server/db/schema.ts (lawfulBasis not_assessed)","praxia/equipos/E1-direccion/2026-10-09-PRX-0013-consolidacion-crm/CEO-01-cadencia.md","Skill PRAXIA §10.2, §10.4, §11.3","Registro de decisiones (D-P05, D-P07)"],
 "assumptions":["Los tiempos son [Supuesto] y se miden durante 4 semanas","No hay motor de ejecución de tareas: el Founder lanza y registra cada corrida","Las estancadas se detectan con la bitácora porque no hay campo de fecha de cambio de etapa"],
 "risks":["Saturación del Founder por las corridas manuales (D-P01)","Completar datos faltantes con información no verificada","Mover contactos a Contacted antes de cerrar D-P07"],
 "decisions_needed":["Alcance de la higiene A/B/C (se recomienda B) antes del 16 de octubre de 2026"],
 "next_owner":"QA-01","review_status":"borrador"}
```
