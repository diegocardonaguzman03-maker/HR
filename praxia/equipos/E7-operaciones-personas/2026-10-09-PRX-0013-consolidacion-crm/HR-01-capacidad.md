# PRX-0013 · Capacidad del Founder y primer asociado
**HR-01 · 2026-10-09 · Borrador para QA-01 · Horizonte: 12 semanas (9 oct a 31 dic 2026)**

## Mensaje clave
La restricción son las horas del Founder, no los agentes: PRX-0013 produjo 19 documentos en un día, unas 3 h de lectura [Supuesto]. En el escenario medio, el primer diagnóstico lo sube a unas 25 h/semana, sobre las 20 supuestas, aun con un **People & Adoption Analyst** por proyecto como primer asociado; en ese pico la venta se reduce al mínimo. [PROPUESTA]

## Supuestos [Supuesto]
- Founder disponible 20 h/semana (**debe confirmarlo**); 10 contactos por semana (MKT-03).
- Base de 6.5 h/semana: pipeline 0.75, cola de agentes 3, aprobar contactos 1.75, contenido 1. Conversación 1 h · discovery 2 h · propuesta 2 h.
- Diagnóstico: Principal al 40% (skill §10.2), unas 16 h/semana durante 4 semanas.

## Escenarios [Supuesto]
| | Bajo | Medio | Alto |
|---|---|---|---|
| Respuesta · conversación · discovery · propuesta · cierre | 10 · 40 · 40 · 50 · 25 % | 20 · 50 · 50 · 50 · 33 % | 30 · 50 · 50 · 60 · 40 % |
| Conversaciones / discovery / propuestas | 5 / 2 / 1 | 12 / 6 / 3 | 18 / 9 / 5 |
| Diagnósticos firmados | 0 | 1 (semana 8) | 2 (semanas 6 y 9) |
| Founder en venta (h/semana) | ~7 | ~9 | ~10 |
| Founder en pico de delivery (h/semana) | — | ~25 | ~42 |
| Primer asociado | No antes de la semana 12 | Analyst al firmar | Analyst al firmar; Adoption Architect si se traslapan |

## Primer asociado [PROPUESTA]
- **Perfil:** People & Adoption Analyst (skill §10.1). Entrevistas y talleres con el cliente, encuestas, Scorecard; Python, SQL o Power BI. Por proyecto, no en nómina: de 8 a 12 días-persona por diagnóstico [Supuesto], porque los agentes absorben el análisis y el borrador del informe. Tarifa diaria: dato del Founder (§10.4).
- **Buscar:** al enviar la primera propuesta. Banco de 2 candidatos; la búsqueda toma de 3 a 4 semanas [Supuesto].
- **Contratar:** al firmar, o si la carga proyectada supera el 80% de la disponibilidad 2 semanas seguidas. Decide el Founder.
- **Antes de compartir información del cliente:** NDA, cesión de PI y no captación firmados (§9.4). Borrador de RISK-01; requiere revisión de un abogado en la jurisdicción aplicable.

## Qué absorben los agentes
| Preparan los agentes | Hace el Founder o un humano |
|---|---|
| Investigación de cuentas e higiene del CRM (SAL-02, RES-02) | Enviar mensajes o publicar |
| Borradores de contacto y contenido (MKT-02) | Conversaciones, discovery y negociación |
| Kit de discovery y borrador de propuesta (SAL-03) | Precio vinculante, firma y contratos |
| Costo y margen (FIN-01); NDA en borrador (RISK-01) | Entrevistas y talleres con el cliente |
| Encuesta, Scorecard y borrador del informe (DEL-02, DAT-01) | Presentar al sponsor; aprobación final |
| Piezas (DSN-01) y filtro previo (QA-01) | Contratación y gasto |

**Motor autónomo (Fase 2):** baja horas solo si se limita a trabajo interno y entrega al Founder en lotes; sin tope, sube la revisión. Antes deben corregirse las fallas F1 a F5 de DEV-03.

## Decisión requerida del Founder
**Tema:** tope de revisión y política del primer asociado.
- **A.** Cola semanal de máximo 5 piezas (≤ 3 h), consolidada por QA-01; banco de Analysts desde la primera propuesta; contratación por proyecto al firmar.
- **B.** Asociado con anticipo mensual desde ya.
- **C.** Sin asociado hasta tener 2 diagnósticos; el Founder cubre el campo.

**Recomendación: A.** Protege el tiempo de venta sin costo fijo antes de tener ingresos. **Riesgos:** B es costo sin pipeline; con C, el Founder también hace el campo, rebasa aún más su disponibilidad desde la semana 8 y arriesga el primer caso, el activo a 10 años. **Esfuerzo:** dos datos del Founder: horas disponibles y tarifa diaria. **Fecha límite:** 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"HR-01","objective":"Plan de capacidad: horas de revisión del Founder en 3 escenarios, disparador y perfil del primer asociado, y tareas que absorben los agentes","deliverable":"praxia/equipos/E7-operaciones-personas/2026-10-09-PRX-0013-consolidacion-crm/HR-01-capacidad.md",
 "evidence_and_sources":["Skill PRAXIA §9.4, §10.1, §10.2, §10.3, §10.4, §11.3","praxia/01-equipo/diseno-del-equipo.md §4 y §8","praxia/01-equipo/registro-de-decisiones.md (D-P01)","E3 MKT-03-embudo.md (10 contactos por semana)","E1 CEO-01-cadencia.md","E6 DEV-03-orquestacion.md (F1 a F5)","Conteo de 19 documentos PRX-0013 en equipos/"],
 "assumptions":["Disponibilidad del Founder: 20 h/semana","Las tasas de conversión de cada escenario","Tiempos por actividad y 10 min de lectura por documento","Principal al 40%, unas 16 h/semana por diagnóstico","Analyst de 8 a 12 días-persona por diagnóstico; búsqueda de 3 a 4 semanas"],
 "risks":["Saturación del Founder por la cola de 28 agentes (D-P01)","En el escenario medio se rebasa la disponibilidad en la semana 8 si no hay asociado","Compartir información del cliente sin NDA, cesión de PI y no captación","Un motor autónomo sin tope aumenta la revisión"],
 "decisions_needed":["Tope de revisión y política del primer asociado: A/B/C (recomendado A) antes del 2026-10-16","Dato del Founder: horas disponibles por semana","Dato del Founder: tarifa diaria de referencia del asociado"],
 "next_owner":"QA-01","review_status":"borrador"}
```
