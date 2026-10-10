# Brief interno semanal · semana al 9 oct 2026 · PRX-0013

**COM-01 (E7) · 2026-10-09 · Borrador para OPS-01 y QA-01 · Uso interno.** Se distribuye solo después de que el Founder lo apruebe.

## Mensaje clave
El CRM tiene una lista, no un pipeline: 117 empresas y 130 contactos, sin correos, con base legal sin evaluar y sin nada enviado [DEFINIDO]. Los 26 entregables escritos coinciden en algo: nada sale a un prospecto mientras D-P07 siga abierta. La restricción son las horas del Founder (HR-01), no los agentes. La pregunta de la semana es de orden: ¿primero vender o primero construir la Fase 2?

## Qué cambió
- Se importó PRX-0012 al Command Center. Hay 0 oportunidades reales.
- Cada uno de los 28 agentes tiene una tarea PRX-0013. PRAXIA World muestra el avance en vivo.
- **La simulación de USD 4.3M es demo** (`isDemo = true`), ilustrativa. No es pronóstico (FIN-01).
- **Fase 2 (motor autónomo):** el Founder la pidió. D-P04 cubre solo las fases 0 y 1, así que falta registrar el alcance, las credenciales y el costo [PENDIENTE].

## Quién entrega qué
**Entregados (26, en borrador).** Siguiente revisor: QA-01, salvo SAL-02 (a SAL-01), DSN-01 (a MKT-01), UI-01 (a UX-01), y DEV-02 y UX-01 (a DEV-01).

| Agente | En una línea |
|---|---|
| CEO-01 | Congelar las funciones nuevas del CRM durante 30 días y vender |
| SAL-01 | Etapas que se ganan con evidencia; fit de 1 a 5 |
| SAL-02 | Top-20, ninguna lista para contacto; empezar con una ola de 8 |
| SAL-03 | Discovery de 12 preguntas conectado al CRM |
| MKT-01 | Mapa mensaje–sector; notación T1 / S-A / A# |
| MKT-02 | Cinco borradores de primer mensaje; ninguno enviado |
| MKT-03 | Embudo con línea base cero; no se mide el origen de cada conversación |
| PR-01 | Aliados sin contacto; referidos sin comisión |
| DSN-01 | One-pager sectorial en PDF carta |
| CX-01 | Onboarding de 30 días hasta G0 |
| DEL-01 | Controles «Listo para kickoff» y G0 |
| DEL-02 | 7 indicadores de adopción por contrato [Supuesto] |
| DEL-03 | Intake de 15 campos sin tocar código |
| RES-01 | Hasta 3 cifras A# por cuenta; ninguna URL verificada |
| RES-02 | Campos de competencia; ninguna cuenta tiene competidor asignado |
| DAT-01 | El CRM no exige base legal antes del contacto |
| DEV-01 | La sincronización no es segura con varios escritores |
| DEV-02 | 3 pruebas P1 probablemente fallan |
| DEV-03 | F1 permite cerrar trabajo sin aprobación |
| UX-01 | La parte de prospecto a discovery depende de la memoria del Founder |
| UI-01 | Las listas no tienen búsqueda ni filtros; hay 3 riesgos de accesibilidad |
| OPS-01 | Higiene del pipeline los lunes, en modo ligero, unos 15 minutos |
| FIN-01 | Escenario base a 90 días: un diagnóstico pagado |
| HR-01 | Cola de revisión del Founder de 5 piezas por semana como máximo |
| RISK-01 | Ningún contacto está listo; faltan 4 bloqueos |

**Pendientes:** STR-01 (14 oct [PROPUESTA]) y QA-01 (revisión, 15 oct).

## Qué sigue

| Fecha | Qué | Dueño |
|---|---|---|
| 12 oct | Primera higiene y revisión de los lunes | OPS-01 · CEO-01 |
| 14 oct | Entrega de STR-01 | STR-01 |
| 15 oct | Revisión de los 27 entregables y una sola cola de lectura para el Founder | QA-01 · RISK-01 |
| 16 oct | Entregable consolidado y siguiente brief | Sesión principal · COM-01 |
| Antes del primer contacto | D-P07, checklist de RISK-01 y verificación de URL (15 a 20 min) | Founder · RISK-01 |

## Qué decide el Founder

| Decisión | Recomendación del dueño | Fecha límite |
|---|---|---|
| D-P07 · Datos reales | A hoy; pasar a B (piloto de ≤10 contactos en México) al cerrar las condiciones (RISK-01) | Antes del primer contacto |
| D-P05 · Meta de USD 10k | A: ingreso reconocido (FIN-01) | 16 oct |
| D-P02 · Nombres de servicios | Skill §5.1 | 16 oct |
| D-P03 · Backlog | PRX-0002, 0006 y 0007 | 16 oct |
| D-P06 · Idioma de la interfaz | B: español (UI-01) | 16 oct |
| D-P09 · Un solo escritor [PROPUESTA] | A (DEV-01) | Antes de la Fase 2 |
| L-02 · Bloquear el contacto sin base legal [PROPUESTA] | A (DEV-02) | Antes del primer contacto |

**Tensión:** CEO-01 recomienda congelar funciones nuevas y el Founder pidió la Fase 2. DEV-01, DEV-03 y RISK-01 piden cerrar D-P09, F1 y los bloqueos de envío antes de cualquier motor autónomo.

## Decisión requerida del Founder
**Tema:** distribuir este brief.
- **A.** Distribuirlo hoy, dentro del repositorio.
- **B.** Distribuirlo después de QA-01, el 15 de octubre.
- **C.** Esperar al consolidado del 16 de octubre.

**Recomendación: A.** Así todos trabajan con la misma versión. **Riesgo:** que se lea la demo como un dato real. **Esfuerzo:** ninguno. **Fecha límite:** 2026-10-12.

```json
{"brief_id":"PRX-0013","owner":"COM-01","objective":"Brief interno semanal de PRX-0013","deliverable":"praxia/equipos/E7-operaciones-personas/2026-10-09-PRX-0013-consolidacion-crm/COM-01-brief.md","evidence_and_sources":["26 entregables PRX-0013 (E1-E8)","01-equipo/registro-de-decisiones.md","apps/praxia-command-center/docs/ROADMAP.md"],"assumptions":["Entrega de STR-01 el 2026-10-14 [PROPUESTA]"],"risks":["Leer la demo de USD 4.3M como real","Fase 2 sin D-P09, F1 ni bloqueos de envío","Saturación del Founder por la carga de revisión"],"decisions_needed":["Distribución del brief","Orden entre la Fase 2 y el foco comercial","D-P07, D-P05, D-P02, D-P03, D-P06, D-P09, L-02"],"next_owner":"OPS-01 → QA-01","review_status":"borrador"}
```

*Tarea de COM-01 después de la aprobación: registrar PRX-0013 en `praxia/README.md`.*
