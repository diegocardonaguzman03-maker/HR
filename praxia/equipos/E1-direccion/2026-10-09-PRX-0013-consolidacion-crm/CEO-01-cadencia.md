# PRX-0013 · Prioridades a 30 días y cadencia de pipeline
**CEO-01 · 2026-10-09 · Borrador para QA-01 · Ventana: 9 oct a 8 nov 2026**

## Mensaje clave
Las 117 empresas y 130 contactos son una **lista, no un pipeline**: 0 oportunidades, sin montos y sin base legal evaluada. El CRM ya está consolidado; el reto de los 30 días es convertir la lista en **conversaciones con decisores**. Nombro el patrón (skill §1): seguir puliendo el Command Center sería alejarse de la acción comercial. **Propuesta:** congelar funciones nuevas del CRM (solo correcciones) y medir la semana por conversaciones, no por registros.

## Prioridades a 30 días [PROPUESTA]
| # | Prioridad | Dueño | Resultado verificable | Fecha |
|---|---|---|---|---|
| 1 | Decidir D-P07 (datos reales). Antes, RISK-01 confirma que la página publicada en githack no expone contactos de PRX-0012 | Founder · RISK-01 | Decisión registrada y checklist de RISK-01 cerrado | 16 oct |
| 2 | Clasificar las 117 cuentas en niveles A, B y C con el ICP; el nivel A tiene como máximo 15 cuentas, cada una con una hipótesis de problema económico | SAL-01 (ICP) · SAL-02 · RES-02 | 15 cuentas A con fuente y fecha | 20 oct |
| 3 | Cerrar D-P02 y la oferta ancla (Diagnóstico) para tener algo concreto que vender | SAL-01 · DEL-02 | Ficha del diagnóstico aprobada por el Founder | 23 oct |
| 4 | Decidir D-P05 para que el tablero mida algo definido | FIN-01 → Founder | Métrica de USD 10k registrada | 16 oct |
| 5 | Primeras conversaciones ejecutivas. El Founder es quien contacta, y solo cuentas A | Founder · SAL-03 (kit de discovery) · MKT-02 (LinkedIn) | 10 conversaciones, 3 discovery, 1 propuesta de diagnóstico en desarrollo | 8 nov |

Metas del punto 5: [Supuesto] de arranque, no pronóstico; dependen de D-P07 y de la aprobación de cada contacto.

## Reglas del CRM consolidado [PROPUESTA]
- La demo (USD 4.3M) nunca entra a un KPI ni se cita como pipeline.
- Ningún registro pasa a *Contacted* si su base legal sigue en `not_assessed`.
- El pipeline ponderado cuenta solo desde *Proposal Development* (con monto y servicio); antes se reportan cantidades, no dólares.
- Oportunidad sin siguiente acción fechada = en riesgo.

## Dueños por etapa (etapas de `seed/base.ts`)
| Etapa | Dueño | Apoyo / puerta |
|---|---|---|
| Identified · Researched | SAL-02 | RES-02 verifica la fuente |
| Contacted · Engaged | **Founder** ejecuta | SAL-02 prepara · MKT-02 prepara la voz · RISK-01 revisa la base legal |
| Qualified | SAL-01 | Problema económico y comprador confirmados |
| Discovery Scheduled · Completed | SAL-03 | DEL-02 aporta la hipótesis de diagnóstico |
| Proposal Development | SAL-03 | FIN-01 (costo, margen y precio) · DEL-02 (alcance) |
| Proposal Sent | **Founder** envía | RISK-01 · QA-01 antes del envío |
| Negotiation | SAL-01 | FIN-01 · RISK-01 (NDA y contrato) |
| Closed Won | FIN-01 (factura y cobranza, lead-to-cash) | DEL-01 da inicio al proyecto |
| Closed Lost | SAL-01 | Registra el motivo y lo que se aprende |

## Revisión semanal de pipeline: lunes, 30 minutos, en el Command Center
1. **Higiene (5').** SAL-02: demo separada, registros sin base legal, oportunidades sin siguiente acción.
2. **Movimiento (10').** SAL-01: entradas, avances, estancadas más de 14 días y pérdidas con motivo.
3. **Siguiente acción (5').** SAL-03: acción, dueño y fecha por oportunidad.
4. **Decisiones (8').** CEO-01 presenta la cola; el Founder decide.
5. **Compromisos (2').** CEO-01 actualiza el registro de decisiones.

**Mensual (primer lunes, 60', skill §11.3):** ingresos vs meta según D-P05, conversión discovery → propuesta → cierre, ciclo comercial, horas del Founder. Conduce FIN-01; sintetiza CEO-01.

## Qué sube al Founder (siempre)
- Todo primer contacto externo y todo paso a *Contacted*.
- Propuestas, precios vinculantes, descuentos, NDA y contratos.
- Cargar correos o datos personales (mientras D-P07 siga abierta).
- Cambios en el nivel A o salidas del ICP; cerrar como perdida una cuenta A.
- Gasto, herramientas pagadas o conexiones externas del CRM.

Lo demás lo deciden los dueños de etapa y se informa en la revisión.

## Decisión requerida del Founder
**Tema:** cómo usar los 30 días.
- **A.** Congelar funciones nuevas del CRM y vender: prioridades 1 a 5 y revisión de los lunes.
- **B.** Seguir construyendo el Command Center y contactar después.
- **C.** Repartir el esfuerzo a la mitad.

**Recomendación: A.** Pasa los dos filtros: el valor a 10 años lo da un primer caso, y un cliente paga USD 20k por un diagnóstico, no por un CRM. **Riesgos:** sin D-P07, la prioridad 5 se limita a la red personal del Founder; saturación del Founder (D-P01). **Esfuerzo:** 30' semanales más las conversaciones. **Fecha límite:** 16 oct 2026, junto con D-P07 y D-P05.

```json
{"brief_id":"PRX-0013","owner":"CEO-01","objective":"Prioridades a 30 días sobre el CRM consolidado y cadencia semanal de revisión de pipeline","deliverable":"praxia/equipos/E1-direccion/2026-10-09-PRX-0013-consolidacion-crm/CEO-01-cadencia.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/seed/base.ts (etapas)","praxia/01-equipo/registro-de-decisiones.md (D-P02, D-P05, D-P07, D-P08)","praxia/01-equipo/diseno-del-equipo.md (flujos y dueños)","Skill PRAXIA §1, §11.2, §11.3, §11.4","Brief PRX-0013 (estado del CRM: 117 empresas, 130 contactos, 0 oportunidades)"],
 "assumptions":["Metas de 10 conversaciones, 3 discovery y 1 propuesta son [Supuesto] de arranque, no pronóstico","Revisión los lunes; el Founder puede mover el día","No se verificó si el HTML publicado en githack incluye contactos de PRX-0012"],
 "risks":["Contactar antes de cerrar D-P07 y la base legal","Mezclar la demo con datos reales en KPI","Patrón del Founder: seguir construyendo herramienta en lugar de vender","Saturación del Founder por la cola de decisiones (D-P01)"],
 "decisions_needed":["Uso de los 30 días: A/B/C (recomendado A) antes del 16 oct","D-P07 antes del 16 oct","D-P05 antes del 16 oct"],
 "next_owner":"QA-01","review_status":"borrador"}
```
