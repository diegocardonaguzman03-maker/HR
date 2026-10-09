# PRX-0013 · Métricas de embudo, de contacto investigado a Closed Won
MKT-03 · 2026-10-09 · Borrador para QA-01

**Mensaje clave:** la línea base es cero (130 contactos `researched`, 0 oportunidades reales), así que las metas son hipótesis [Supuesto] que se recalibran en la semana 4. El CRM ya mide de contacto a Closed Won. No mide **qué canal o contenido originó cada conversación**, que es lo que pide WF03 paso 8. [PROPUESTA]

Universo: `isDemo = false`. Etapas de `src/server/seed/base.ts` (posiciones 1 a 12).

## 1. Métricas

| # | Métrica | Fórmula | Fuente en el CRM | Frecuencia |
|---|---|---|---|---|
| M1 | Contactables | contactos `researched`, `doNotContact = false` y `lawfulBasis ≠ not_assessed` | `contacts` | Semanal |
| M2 | Tasa de contacto | contactos con ≥1 actividad outbound (email, linkedin o call) ÷ M1 | `activities` (`direction`, `contactId`) → `contactsReached` | Semanal |
| M3 | Tasa de respuesta | contactos con inbound ÷ contactos alcanzados | `contactsReplied / contactsReached` (`replyRate`, ya existe) | Semanal |
| M4 | Respuesta → conversación | oportunidades creadas con `primaryContactId` entre los que respondieron ÷ respondieron | `opportunities.createdAt`, `primaryContactId` | Semanal |
| M5 | Conversación → calificada | oportunidades con `maxStagePosition ≥ 5` ÷ creadas | `opportunities` | Quincenal |
| M6 | Calificada → discovery realizado | `maxStagePosition ≥ 7` ÷ `≥ 5` | `opportunities` | Quincenal |
| M7 | Discovery → propuesta enviada | `≥ 9` ÷ `≥ 7` | `opportunities` y `proposals.status` | Mensual |
| M8 | Propuesta → Closed Won | ganadas ÷ `≥ 9` (ganar exige evidencia de firma o aceptación) | `opportunities`, `contracts`, `proposals` | Mensual |
| M9 | Diagnósticos pagados | Closed Won con el servicio A (Transformation Diagnostic) | `opportunities.serviceId` | Mensual |
| M10 | Pipeline ponderado, win rate, ciclo, ticket | ya calculados en `computeSalesMetrics` | `pipeline.ts` | Semanal (pipeline), mensual (resto) |
| M11 | Días por etapa | diferencia entre actividades `stage_change` consecutivas | `activities.type = stage_change` | Mensual |

Embudo §8.1: M2–M3 insight → conversación · M4–M6 conversación → discovery · M7–M9 discovery → diagnóstico pagado.

## 2. Metas iniciales (4 semanas) [Supuesto]
M1 ≥ 40 · M2 40 alcanzados (unos 10 por semana: precisión, no volumen) · M3 ≥ 20% (unas 8 respuestas) · M4 ≥ 50% (unas 4 conversaciones) · M6 2 discovery realizados · M7 1 propuesta de diagnóstico. No se espera cierre en 4 semanas (horizonte de 31 a 60 días, skill §11.4). Todas son hipótesis de calibración, no compromisos. [Supuesto]

## 3. Experimento de 4 semanas · EXP-01 [PROPUESTA]
**Pregunta:** ¿un mensaje que abre con un trigger observable de la cuenta y una pregunta ejecutiva sobre la brecha de adopción (variante A) genera más conversaciones que uno que abre con el insight de una publicación de LinkedIn de la serie *The Adoption Gap* (variante B)?

- **Muestra:** 40 contactables de cuentas Tier 1 y 2, asignados 20 y 20 de forma alterna.
- **Métrica primaria:** M4 (conversaciones). **Secundarias:** M3 y M6. Guardarraíl: 0 quejas y 0 solicitudes de baja sin atender.
- **Registro manual:** el Founder envía y anota cada toque con el prefijo `[EXP01-A]` o `[EXP01-B]` en `subject`. Un toque y un seguimiento a los 7 días; revisión semanal (skill §11.3).
- **Lectura:** con n = 20 por brazo el resultado es direccional, no significativo. Si un brazo duplica las conversaciones del otro, pasa a ser la base.
- **Condición previa:** D-P07 resuelta y base legal evaluada por contacto. Ningún agente envía mensajes.

## 4. Lo que no se puede medir hoy
1. **Atribución por canal o contenido (bloquea WF03).** `opportunities` y `activities` no tienen campo de origen; `contacts.source` registra de dónde vino el dato, no qué canal generó la conversación.
2. **Variante del experimento:** depende de una convención de texto, sin validación.
3. **Puntaje de calificación §8.2 (7 criterios, umbral 28):** `opportunities` no tiene ese campo. `leadScore` y `fitScore` miden otra cosa.
4. **Embudo por cohorte o periodo:** el embudo usa `maxStagePosition` acumulado de toda la historia, así que la conversión de un mes no se separa de la de otro.
5. **Detalle menor:** `meetingsBooked` filtra por `createdAt`, no por `occurredAt` (se le reporta a DAT-01; no se modificó código).

## Decisión requerida del Founder
**Tema:** cómo se registra el origen de cada conversación.
- **A.** Convención manual en `subject` durante 4 semanas, sin tocar el código.
- **B.** Agregar los campos `originChannel` y `originContentId` antes del primer contacto.
- **C.** A ahora, y B cuando termine EXP-01.

**Recomendación: C.** Arranca sin bloquear y usa lo aprendido para diseñar los campos. **Riesgo:** con A el dato se rompe si cambia el prefijo. **Esfuerzo:** A no cuesta nada; B es una migración pequeña de DAT-01 y UX-01. **Fecha límite:** antes del primer contacto real (sujeto a D-P07).

```json
{"brief_id":"PRX-0013","owner":"MKT-03","objective":"Definir métricas de embudo desde contacto investigado hasta Closed Won, metas iniciales y experimento de 4 semanas","deliverable":"praxia/equipos/E3-marca-demanda/2026-10-09-PRX-0013-consolidacion-crm/MKT-03-embudo.md",
 "evidence_and_sources":["apps/praxia-command-center/src/domain/pipeline.ts","apps/praxia-command-center/src/server/seed/base.ts","apps/praxia-command-center/src/server/db/schema.ts","apps/praxia-command-center/src/server/services/crm.ts","Skill PRAXIA §8.1, §8.2, §11.2–11.4, §12"],
 "assumptions":["Línea base cero: 130 contactos researched, 0 oportunidades reales","Todas las metas son [Supuesto] y se recalibran en la semana 4","Los registros demo quedan excluidos"],
 "risks":["Sin campo de origen no se cumple WF03 paso 8","Los contactos importados tienen lawfulBasis not_assessed; D-P07 bloquea el outreach","n=20 por brazo: resultado solo direccional"],
 "decisions_needed":["Registro del origen de la conversación: A, B o C (recomendación C)","D-P07, ya abierta"],
 "next_owner":"QA-01","review_status":"borrador"}
```
