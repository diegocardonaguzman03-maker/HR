# Intake del diagnóstico de adopción de IA · PRX-0013 · DEL-03

**Mensaje clave.** 15 campos bastan para decidir si una cuenta merece el diagnóstico y para que el piloto arranque con línea base. Siete se llenan antes de la primera reunión y ocho en discovery. Todo cabe en el esquema actual del CRM, sin tocar código. [PROPUESTA]

**Contexto.** 30 de las 117 cuentas de PRX-0012 sugieren «C AI Adoption Accelerator». El intake alimenta `/calificar` (§8.2) y `/discovery` (§8.3).

## Campos

| # | Campo | Para qué sirve | Momento | Dónde queda en el CRM |
|---|---|---|---|---|
| 1 | Organización y dominio | Evitar duplicados | Antes | `organizations.name`, `domain` |
| 2 | Industria y tamaño | Dimensionar el piloto | Antes | `organizations.industry`, `sizeBand` |
| 3 | Trigger de IA con URL y fecha | Prueba la urgencia (criterio 6 de §8.2) | Antes | `organizations.notes`, `source`, `sourceRetrievedAt` |
| 4 | Sponsor: nombre, cargo y fuente pública | Saber si hay mandato y acceso (criterios 1 y 7) | Antes | `contacts.fullName`, `title`, `source` |
| 5 | Base legal y estado del correo | Que nadie contacte sin validar (D-P07) | Antes | `contacts.lawfulBasis`, `emailStatus`, `doNotContact` |
| 6 | Hipótesis de problema económico | Abrir con el valor, no con el servicio | Antes (borrador) | `opportunities.problemStatement` |
| 7 | Oferta sugerida y siguiente paso | Ordenar el pipeline | Antes | `opportunities.serviceId`, `nextAction`, `nextActionDate` |
| 8 | IA ya comprada: herramientas, fecha y población con acceso | Medir el lado «comprado» de la brecha | Discovery | Notas: `activities` tipo `meeting` ligada a la oportunidad |
| 9 | Uso real hoy y dato que lo prueba | Línea base del KPI de comportamiento y criterio 4 | Discovery | Notas |
| 10 | 1 a 3 flujos de trabajo candidatos, con función y personas | Acotar el piloto a trabajo concreto | Discovery | `opportunities.proposedSolution` |
| 11 | KPI de negocio, valor actual y fuente | Línea base del KPI de impacto | Discovery | `opportunities.problemStatement` (sección «Valor») |
| 12 | Costo de no actuar por mes, con la cifra del cliente | Probar el filtro de USD 20k (criterio 2) | Discovery | `opportunities.problemStatement` |
| 13 | Readiness 1 a 5 en las 5 capas de la Adoption Architecture | Elegir el tipo de piloto | Discovery | Notas (matriz) |
| 14 | Decisores, proceso de compra, presupuesto y fecha | Pronóstico y criterio 3 | Discovery | `contacts` adicionales; `opportunities.amount`, `expectedCloseDate` |
| 15 | Restricciones: datos sensibles, política de IA, seguridad, relación laboral | Cuidar el alcance y avisar a RISK-01 | Discovery | `opportunities.risks` |

## Reglas de captura
- Los campos 1 a 7 vienen del CSV y de fuentes públicas. No se inventan correos y los nombres llevan su fuente.
- La readiness (campo 13) es un juicio con evidencia, no una cifra del AGI.
- Horas de formación y asistencia nunca son meta; los campos 9 y 11 son la línea base.
- Puerta: sin los campos 9, 11 y 12 no hay charter de piloto; la oportunidad regresa a discovery.

## Decisión requerida del Founder
**1. ¿Dónde viven los campos 8, 9 y 13?**
- A: notas con plantilla fija, sin cambiar código. **Recomendado** hasta tener 5 diagnósticos reales.
- B: columnas nuevas en `opportunities` (lo hacen DEV-03 y DAT-01; cuesta 1 o 2 días [Supuesto]).
- C: tabla de intake aparte.
- Riesgo de A: las notas en texto libre no se pueden consultar como datos. Mitigación: encabezados fijos en el orden 8, 9 y 13.
- Fecha límite: 2026-10-16.

**2. ¿Con qué oferta se vende?** El «diagnóstico de adopción de IA» no tiene nombre propio en §5.2. Opciones: Adoption Gap Diagnostic con alcance de IA (recomendado) o fase de entrada del AI Adoption Accelerator. Las letras A a G del CSV tampoco coinciden con §5.2 (D-P02).
- Fecha límite: 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"DEL-03","objective":"Intake mínimo del diagnóstico de adopción de IA mapeado al CRM",
 "deliverable":"praxia/equipos/E4-delivery-adopcion/2026-10-09-PRX-0013-consolidacion-crm/DEL-03-intake.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/db/schema.ts (organizations, contacts, opportunities, activities)","Bases CSV de PRX-0012 (30 de 117 cuentas con C AI Adoption Accelerator)","Skill §5.2, §6.2, §6.3, §6.6, §8.2, §8.3"],
 "assumptions":["No se crean columnas nuevas; los datos sin campo propio van a activities","El esfuerzo de la opción B (1 o 2 días) es un supuesto"],
 "risks":["Notas en texto libre que no se pueden consultar","Taxonomía de servicios del CSV distinta de la skill §5.2 (D-P02)","Carga de datos reales antes de cerrar D-P07"],
 "decisions_needed":["Dónde guardar los campos 8, 9 y 13 (A/B/C)","Con qué oferta se vende el diagnóstico de IA"],
 "next_owner":"QA-01","review_status":"borrador"}
```
