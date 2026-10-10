# PRX-0013 · Regla de tiers A/B/C para las cuentas del CRM

**STR-01 · 2026-10-09 · borrador para QA-01 · [PROPUESTA]**

## Mensaje clave
La regla combina fit ICP, frescura del trigger y sector, y reparte las 117 cuentas en **16 A, 24 B y 77 C**. Las 16 de tier A tienen fit 5 y un trigger de §3.3 con 12 meses o menos. Financieros, retail y manufactura suman 18 del top 25. **7 cuentas del top 25 tienen una marca de posible conflicto de interés y no se contactan hasta que el Founder las libere.**

## La regla [PROPUESTA]
**Puntaje = 10 × Fit + 10 × Trigger + 5 × Sector** (máximo 85).

- **Fit:** `fit_icp_1a5` de PRX-0012. En las cuentas fusionadas se usa el mayor.
- **Trigger (0–3):**
  - Base 3 si es un trigger de §3.3: nuevo CEO, DG o CHRO; M&A, integración o escisión; reestructura o cierre; IA, automatización o core a escala; ronda grande o licencia bancaria.
  - Base 2 si es una señal de escala: planta, expansión o capex.
  - Se resta 1 si el evento más reciente tiene de 13 a 24 meses, y 2 si tiene más de 24 meses o no tiene fecha.
- **Sector:**
  - **+1** para Financieros, Retail y Manufactura. Concentran las cuentas con fit ≥4 y trigger fresco (11, 10 y 9) y las sedes de decisión en México (13, 20 y 11).
  - **0** para High tech, donde la mayoría son filiales con decisión global, y para Logística, donde solo 1 de 20 cuentas combina fit ≥4 y trigger fresco.
  - **−1** para Startups: 2 de 11 tienen sede en México, la capacidad de pagar USD 20k está sin verificar y hay riesgo de anti-cliente (§3.3).

**Cortes:**
- **A:** 80 puntos o más, con trigger 3.
- **B:** de 70 a 79.
- **C:** menos de 70.

**Puertas:** pasan a C sin importar el puntaje las cuentas con fit ≤2 (13), con trigger 0 (8) y los aliados o competidores (5: Microsoft, Google, SAP, AWS y Accenture, que se tratan como canal y no como clientes).

**Desempate:** primero la cuenta con contacto con fuente pública, luego el trigger más reciente.

**Conflicto de interés (COI):** la cuenta conserva su tier, pero nadie la contacta hasta que el Founder confirme por escrito que no hay conflicto.

El sector de cada cuenta es su industria en el CRM, que viene de la primera base importada: Bimbo, Sigma, Arca y Herdez están en Manufactura, y 99minutos en Startups.

## Conteo

| Sector | A | B | C | Total |
|---|---|---|---|---|
| 01 Manufactura | 3 | 7 | 15 | 25 |
| 02 Startups | 0 | 2 | 9 | 11 |
| 03 High tech | 4 | 2 | 14 | 20 |
| 04 Servicios financieros | 4 | 7 | 13 | 24 |
| 05 Retail y consumo | 4 | 3 | 11 | 18 |
| 06 Logística | 1 | 3 | 15 | 19 |
| **Total** | **16** | **24** | **77** | **117** |

27 de las cuentas C tienen 60 o 65 puntos. Son la reserva: suben a B si aparece un trigger nuevo o un acceso.

## Top 25
En la columna F/T/S van fit, trigger y sector. Los datos son de PRX-0012.

| # | Cuenta | F/T/S | Pts | Razón |
|---|---|---|---|---|
| 1 | BanBajío | 5/3/+1 | 85 | Nuevo DG y reestructura en cuatro DGA (jul-2026) |
| 2 | GNP Seguros | 5/3/+1 | 85 | Palantir/AIP a escala (jul-2026): IA instalada que falta adoptar |
| 3 | Banamex | 5/3/+1 | 85 | Nuevo CEO (jun-2026) en plena separación de Citi |
| 4 | Palacio de Hierro | 5/3/+1 | 85 | CEO externa y reorganización directiva (jun-2026) |
| 5 | Nemak **[COI]** | 5/3/+1 | 85 | Nuevo CEO (abr-2026) e integración de una adquisición |
| 6 | Volkswagen de México | 5/3/+1 | 85 | Nuevo VP Ejecutivo de RH y Organización (abr-2026) |
| 7 | Liverpool | 5/3/+1 | 85 | 34 proyectos de IA; tiendas como centros de fulfillment |
| 8 | FEMSA (OXXO) **[COI]** | 5/3/+1 | 85 | Nuevo CEO, nueva CHRO y nuevo DG de OXXO |
| 9 | Grupo Coppel **[COI]** | 5/3/+1 | 85 | Nuevo DG; inversión digital de MXN 80 mil M ya decidida |
| 10 | Metalsa | 5/3/+1 | 85 | Cambio de DG ligado a su transformación (nov-2025) |
| 11 | Kapital | 5/3/+1 | 85 | Integración de Intercam desde oct-2025 |
| 12 | Softtek **[COI]** | 5/3/0 | 80 | Nuevo CEO global (1-oct-2026) |
| 13 | NTT DATA México | 5/3/0 | 80 | Nuevo DG tras la integración (abr-2026) |
| 14 | APM Terminals **[COI]** | 5/3/0 | 80 | Fase II con grúas automatizadas (mar-2026) |
| 15 | Capgemini México | 5/3/0 | 80 | Integración de WNS (oct-2025) |
| 16 | Encora | 5/3/0 | 80 | Comprada por Coforge (abr-2026); contacto [PENDIENTE] |
| 17 | Nu México **[COI]** | 4/3/+1 | 75 | Opera como banco (ago-2026) y cambia de CEO |
| 18 | Hotmart | 5/3/−1 | 75 | Recorte del 10% y giro a IA (jul-2026) |
| 19 | Banco Plata **[COI]** | 4/3/+1 | 75 | Licencia bancaria y Serie C de USD 405M (2026) |
| 20 | Nissan Mexicana | 4/3/+1 | 75 | Cierre de CIVAC y consolidación de plantas (mar-2026) |
| 21 | Kavak | 5/3/−1 | 75 | Serie F de USD 300M y nuevo Head of People |
| 22 | BMW Planta SLP | 4/3/+1 | 75 | Nuevo CEO de planta e inversión de 800 MEUR |
| 23 | BanCoppel | 4/3/+1 | 75 | Mismo trigger que la #9: se aborda como una sola cuenta |
| 24 | Grupo La Comer | 4/3/+1 | 75 | Nuevo DG externo (ene-2026) |
| 25 | Hey Banco | 4/3/+1 | 75 | Se separa de Banregio como banco independiente (2026) |

Las posiciones 17 a 35 empatan en 75 puntos y el corte del top 25 lo decide el desempate. Fuera del top 25 siguen Banorte, Whirlpool, Herdez, Sigma, Bimbo, Santander, Walmex, Heineken, BBVA y Sanborns.

## Límites
- Los triggers salen de la investigación y **todavía no son evidencia**. RES-01 debe volver a verificar la fuente de cada cuenta A antes de cualquier contacto.
- La regla no puntúa el acceso del Founder ni sus credenciales [PENDIENTE], que es el criterio que más puede cambiar el orden.
- En el CRM, el `fitScore` de 99minutos es 3, pero su fit más alto es 4, porque el importador guarda el primer registro. Su tier no cambia: sigue en C.

## Decisión requerida del Founder
**1. Regla de tiers.** Fecha límite: 2026-10-16, antes del primer contacto (D-P07). Esfuerzo bajo.
- **A** (recomendada): adoptarla como está.
- **B**: usar la fórmula ABM de §8.2, que pide que usted nos diga primero con qué cuentas tiene acceso.
- **C**: conservar la `prioridad` de PRX-0012, con 36 cuentas A y criterios distintos según el analista.

Riesgo de A: el orden cambia cuando se conozca el acceso.

**2. Conflictos de interés.** Hay 20 cuentas marcadas, 7 de ellas en el top 25. Fecha límite: antes de cualquier secuencia.
- **A** (recomendada): confirmar por escrito, cuenta por cuenta, si hay conflicto.
- **B**: excluir todas las marcadas.

```json
{"brief_id":"PRX-0013","owner":"STR-01","objective":"Regla explícita de tiers A/B/C (sector + fit ICP + trigger) aplicada a las 117 cuentas del CRM; top 25 y conteos",
 "deliverable":"praxia/equipos/E1-direccion/2026-10-09-PRX-0013-consolidacion-crm/STR-01-tiers.md",
 "evidence_and_sources":["praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/*/base-*.csv (fit_icp_1a5, trigger_detectado, fecha_fuente, notas)","apps/praxia-command-center/src/server/services/importer.ts (deduplicación: 123 registros de empresa → 117 cuentas)","Skill PRAXIA §3.3 (triggers, anti-cliente), §8.2 (ABM)"],
 "assumptions":["Fecha de corte 2026-10-09; recencia por el evento más reciente con fecha","Pesos y cortes 10/10/5, A≥80 con T=3, B 70–79 [PROPUESTA]","Sector de la cuenta = primera base importada (industria en el CRM)","Acceso y credenciales del Founder no puntuados [PENDIENTE]"],
 "risks":["Triggers sin reverificar (RES-01)","7 cuentas del top 25 con marca de conflicto de interés","El empate en 75 puntos hace que el corte del top 25 dependa del desempate","fitScore de 99minutos desalineado en el CRM"],
 "decisions_needed":["Adoptar la regla de tiers (A/B/C)","Declaración de conflictos de interés en 20 cuentas"],
 "next_owner":"QA-01","review_status":"borrador"}
```
