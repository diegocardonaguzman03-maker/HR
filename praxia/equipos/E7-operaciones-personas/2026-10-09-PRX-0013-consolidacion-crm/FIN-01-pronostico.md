# PRX-0013 · Pronóstico a 90 días y base de la meta de USD 10k
**FIN-01 · 2026-10-09 · Borrador para QA-01 · Ventana: 9 oct 2026 a 7 ene 2027**

## Mensaje clave
Las 117 cuentas no generan USD 10k/mes en 90 días: el escenario base es **un diagnóstico pagado** (rango 0 a 4). La meta llega cuando un diagnóstico se convierte en sprint o programa, después de esta ventana. La simulación de USD 4.3M muestra dónde se distorsionan margen y caja; **no es pronóstico** y nunca se suma a lo real.

---

## 1. REAL: de 117 cuentas a diagnósticos pagados

**Punto de partida [DEFINIDO]:** 117 cuentas, 0 oportunidades, 0 contratos, 0 ingresos. En las bases de PRX-0012, unas 36 empresas tienen prioridad A (conteo de FIN-01 sobre los CSV; el CRM deduplica a 117).

**Restricciones:** sin contacto hasta decidir D-P07, la ventana efectiva es de unos 75 días [Supuesto]; diciembre frena firmas [Supuesto]; la capacidad del Founder es el límite (§10.4); sin razón social y RFC no hay CFDI ni cobranza en México [PENDIENTE].

**Escenarios** (tasas [Supuesto] internas, no benchmarks)

| | Conservador | Base | Optimista |
|---|---|---|---|
| Cuentas contactadas por el Founder | 30 | 45 | 60 |
| → conversación ejecutiva | 20 % = 6 | 25 % = 11 | 33 % = 20 |
| → discovery | 50 % = 3 | 50 % = 6 | 60 % = 12 |
| → propuesta de diagnóstico | 33 % = 1 | 50 % = 3 | 50 % = 6 |
| → **diagnóstico pagado** | 30 % = **0** (rango 0–1) | 40 % = **1** (rango 1–2) | 50 % = **3** (rango 2–4) |
| Contratado (USD 12k c/u [Supuesto]; rango USD 8k–15k §5.2) | 0–12k | 12k (8k–30k) | 36k (16k–60k) |
| Promedio mensual contratado | 0–4k | 4k | 12k |
| Cobrado neto de IVA en la ventana (50 % al firmar, §7.3) | 0–6k | 6k | 18k |

**Lectura**
- Solo el optimista toca USD 10k/mes, y solo con base «contratado»; un diagnóstico firmado en diciembre se reconoce en enero.
- **Margen:** 15–25 días-persona por diagnóstico (§10.2). Si lo entrega el Founder solo, el costo en caja es casi cero pero consume su agenda; con asociado, precio mínimo = costo directo ÷ 0.5. Costo diario de asociados [PENDIENTE, lo da el Founder].
- **Semanal:** conversaciones, discovery y propuestas; dólares solo desde *Proposal Development* (regla de CEO-01).

---

## 2. SIMULACIÓN (demo etiquetada, ficticia, no es pronóstico)
Fuente: `apps/praxia-command-center/src/server/seed/demo.ts`. Cálculo de FIN-01.

| Métrica | Valor demo |
|---|---|
| Contratado | USD 4,300k (5 contratos, ticket medio de 860k) |
| Reconocido | 1,600k (37 % del contratado) |
| Facturado (subtotal) | 1,834k |
| Cobrado neto / bruto | 970k / 1,072k (incluye 102k de IVA que se debe al SAT) |
| Cuentas por cobrar (bruto) | 926k; 90k vencidos (Nexa) |
| Margen estimado en propuestas | 60.3 % |
| Margen bruto real sobre reconocido | 67.2 % (1,600k − 525k de costo directo) |

**Lo que enseña**
1. **Margen inflado:** el costo se registra después del ingreso (Meridiano: 40 % del valor reconocido, 26 % del costo estimado). Medir margen por contrato contra avance.
2. **Facturar antes de entregar** deja 234k sin reconocer (ingreso diferido, aún no modelado).
3. **Caja no es utilidad:** de +545k netos, 102k son IVA del SAT; el gasto general (2.8k/mes) omite la compensación del Founder e infla utilidad y runway.
4. **Concentración:** Altamira = 42 % del contratado, 64 % del reconocido.
5. **Escala:** el ticket demo supera 50 veces el tope de la oferta ancla (USD 15k); no es referencia de precio ni de pipeline.

---

## 3. Base recomendada para D-P05 [PROPUESTA]
**A. Ingreso reconocido como métrica principal, promedio móvil de 3 meses, con B (cobrado neto de IVA) siempre a la vista.**
- C es irregular (la demo marcaría USD 4.3M en un trimestre y luego cero) y premia firmar, no entregar.
- B va 39 % por debajo de lo reconocido en la demo y hoy depende del RFC.
- A sigue el trabajo entregado y cuadra con el margen por contrato. Mientras sea cero, se reportan diagnósticos pagados firmados.

> Requiere revisión de un contador en la jurisdicción aplicable: reconocimiento de ingresos, IVA, CFDI y tratamiento de anticipos.

---

## Decisión requerida del Founder
**Tema:** qué mide la meta de USD 10k/mes (D-P05).

| Opción | Qué mide | Riesgo |
|---|---|---|
| **A** (recomendada) | Reconocido, promedio de 3 meses, con B visible | Requiere disciplina para registrar el costo junto con el ingreso |
| B | Cobrado neto de IVA | Bloqueado por el RFC; retraso de 30 a 60 días |
| C | Contratado | Irregular; sobrestima el avance |

- **Costo o esfuerzo:** cero en desarrollo; la medida ya es configurable en el Command Center.
- **Fecha límite:** 2026-10-16.
- **Decisiones relacionadas:** D-P07 (arranque del contacto) y el costo diario de asociados.

```json
{"brief_id":"PRX-0013","owner":"FIN-01",
 "objective":"Pronóstico real a 90 días (117 cuentas → diagnósticos pagados) separado de la simulación demo; recomendación de base para D-P05",
 "deliverable":"praxia/equipos/E7-operaciones-personas/2026-10-09-PRX-0013-consolidacion-crm/FIN-01-pronostico.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/seed/demo.ts","apps/praxia-command-center/docs/FINANCIAL_DEFINITIONS.md","Skill PRAXIA §5.2, §7, §10.2, §10.4, §11.2","CSV de PRX-0012 (conteo de prioridad)","CEO-01-cadencia.md (PRX-0013)","registro-de-decisiones.md"],
 "assumptions":["Tasas del embudo internas sin dato histórico","Precio del diagnóstico USD 12k","Ventana efectiva de 75 días por D-P07","Anticipo de 50 % al firmar","Diciembre frena las firmas"],
 "risks":["Sin RFC no hay CFDI ni cobranza en México","Capacidad del Founder","Costo de asociados desconocido","Confundir la demo con pipeline real"],
 "decisions_needed":["D-P05 base de la meta","D-P07 arranque del contacto","Costo diario de asociados"],
 "next_owner":"QA-01","review_status":"borrador"}
```
