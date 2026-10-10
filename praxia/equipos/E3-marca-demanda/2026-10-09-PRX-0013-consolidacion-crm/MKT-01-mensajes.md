# PRX-0013 · Mapa mensaje–sector para las notas del CRM

| | |
|---|---|
| Owner · estado | MKT-01 (E3) · borrador para QA-01 · 2026-10-09 · uso interno, no es material para clientes |
| Fuentes | PRX-0012: `MENSAJES.md` (MKT-02) y §4 de `evidencia-por-sector.md` (RES-01). Solo cifras A1–A21 |

**Mensaje clave:** la nota de cada cuenta lleva tesis, gancho, oferta y cifras. La entrada es siempre el **Adoption Gap Diagnostic** («según alcance»); por sector cambia la continuidad. Nada sale antes de cerrar D-P07 y verificar las URL de la §4. [PROPUESTA]

**Notación [PROPUESTA]:** hoy «A» significa prioridad, servicio y cifra a la vez. Propongo prioridad → **T1/T2/T3**, servicio → **S-A…S-G** (nombres abiertos, D-P02) y cifra → **A#**.

---

## 1. Mapa por sector (bloque para pegar en la nota de la cuenta)

**01 · Manufactura** — Comprador: COO, VP de Operaciones, director de planta.
- Tesis: la planta ya invirtió; el retorno depende de que supervisores y operadores cambien cómo deciden en el turno.
- Gancho: «Invertiste en la planta. Falta que el turno adopte.»
- Oferta: Diagnostic (S-A) → S-E, liderazgo de supervisores.
- Cifras: A13, A14 (siempre con «asociación, no causalidad»), A15, A16. A13 y A16 no se restan.

**02 · Startups y scale-ups** — Comprador: CEO/fundador; Head of People o COO como champion.
- Tesis: la ronda compra crecimiento, no una organización lista para escalar; se rompen los derechos de decisión y los primeros managers.
- Gancho: «Escalar no es contratar. Es adoptar otra forma de operar.»
- Oferta: Diagnostic corto (S-A) → S-D, diseño organizacional y cadencia de gestión.
- Cifras: A19, A20, A10, A6.

**03 · High tech y servicios TI** — Comprador: CEO/country manager, CTO o Chief AI Officer.
- Tesis: venden IA a sus clientes, pero su propio delivery no la adoptó; licencias de copilotos no son lead time ni calidad distintos.
- Gancho: «Desplegar copilotos no es adoptarlos.»
- Oferta: Diagnostic (S-A) → AI Adoption Accelerator (S-C) + línea base (S-F).
- Cifras: A17 (46% junto con 84%, en la misma frase), A7, A18 (con «prevé»).

**04 · Servicios financieros y fintech** — Comprador: CEO/DG, COO, CHRO; Riesgo y Cumplimiento como gatekeepers.
- Tesis: la inversión en core, canales o IA ya está hecha; el valor depende de que sucursal, crédito y riesgo operen distinto, con evidencia trazable.
- Gancho: «La inversión ya está hecha. Falta la adopción.»
- Oferta: Diagnostic (S-A) → S-C + S-F (evidencia auditable). NDA y privacidad antes de tocar datos.
- Cifras: A11, A3, A6 (todas transversales: decirlo).

**05 · Retail y consumo** — Comprador: CEO/DG, COO o director de tiendas; director omnicanal como champion.
- Tesis: la estrategia es omnicanal; el último metro es el gerente de tienda, y la rotación borra cada capacitación antes de volverse hábito.
- Gancho: «Omnicanal en la estrategia. Adopción en la tienda.»
- Oferta: Diagnostic por muestra de formatos (S-A) → S-B + S-E para gerentes.
- Cifras: A11, A3, A21 (con «prevé»; transversales).

**06 · Logística y cadena de suministro** — Comprador: COO o director de operaciones; CHRO en integraciones.
- Tesis: el nearshoring trajo capacidad más rápido que la capacidad de gestión; el WMS registra la operación, pero no la gobierna.
- Gancho: «Implementar el WMS no es adoptarlo.»
- Oferta: Diagnostic por CEDIS y turno (S-A) → S-B + S-E para supervisores.
- Cifras: A15, A11, A6, A18 (con «prevé»).

**Reglas fijas:** A1 y A2 nunca en una misma frase causal. Sin casos, clientes ni ROI. CTA: conversación o diagnóstico, nunca un curso.

---

## 2. Regla de campaña o recurso por tier [PROPUESTA]

Prioridad A/B/C de la base = T1/T2/T3 (empresas únicas antes de deduplicar: 36 / 52 / 35).

| Tier | Motion | Recurso | CTA | Quién | Pasa al siguiente tier si… |
|---|---|---|---|---|---|
| **T1** | ABM 1:1, liderado por el Founder | Deck del sector + una línea de hipótesis de valor ligada al trigger verificado | Conversación de 30 min → discovery (§8.3) | Founder; SAL-02 confirma trigger y contacto | — |
| **T2** | 1:pocos por sector | Serie de LinkedIn del Founder con el gancho del sector; deck sin personalizar solo si responde | Respuesta → conversación | MKT-02 produce, el Founder publica | Respuesta calificada o trigger nuevo con fuente → T1 |
| **T3** | Nurture 1:muchos | Solo contenido orgánico (70/20/10), sin contacto directo | Ninguno | MKT-02 | Trigger nuevo con URL y fecha → SAL-02 recalifica |

Topes: nada de frío masivo (§8.1); máximo 10 cuentas T1 activas a la vez. **KPI (§11.2):** conversaciones con decisores, respuestas calificadas y reuniones originadas, por tier y sector. Vistas, likes y seguidores no cuentan.

---

## Decisión requerida del Founder

**Tema:** regla de activación por tier para la primera ola.

| Opción | Qué implica | Riesgo | Esfuerzo |
|---|---|---|---|
| **A** | Activar T1 de los seis sectores (36 cuentas), por lotes de 10 | Sectores 04–06 salen con cifras solo transversales | Alto para el Founder |
| **B** | Activar T1 de 01–03 (18 cuentas, con evidencia sectorial); T1 de 04–06 en nurture T2 hasta la segunda ronda de RES-01 | Menos cobertura sectorial al inicio | Medio |
| **C** | Solo contenido (T2/T3 para todos) hasta cerrar D-P07 | Conversaciones más lentas | Bajo |

**Recomendación [PROPUESTA]:** **B**, condicionada a D-P07 y a la verificación de las URL A1–A21. Aprobar también la notación T#/S-#/A#.
**Costo:** sin gasto externo; tiempo del Founder (unas 2–3 h por semana para T1).
**Fecha límite sugerida:** 2026-10-16.

---

## Handoff

```json
{"brief_id":"PRX-0013","owner":"MKT-01","objective":"Mapa mensaje–sector y regla de campaña por tier para las notas de las cuentas del CRM","deliverable":"praxia/equipos/E3-marca-demanda/2026-10-09-PRX-0013-consolidacion-crm/MKT-01-mensajes.md",
 "evidence_and_sources":["PRX-0012 deck-builder/content/MENSAJES.md (MKT-02)","PRX-0012 00-evidencia/evidencia-por-sector.md §2 y §4 (RES-01)","PRX-0012 ESPECIFICACION.md (lista S-A a S-G, prioridad A/B/C)","Skill §5.2, §8.1, §11.2, §12, §13"],
 "assumptions":["Prioridad A/B/C de la base equivale a T1/T2/T3 en el CRM","El conteo 36/52/35 es de empresas únicas antes de deduplicar; el CRM tiene 117 cuentas","La capacidad del Founder es de unas 10 cuentas T1 a la vez"],
 "risks":["D-P07 sigue abierta y el CRM ya tiene cuentas importadas: no hay contacto hasta cerrarla","URL A1–A21 sin verificación visual","Sectores 04–06 sin cifra propia del sector","Ambigüedad de la letra A en las notas actuales del CRM"],
 "decisions_needed":["Regla de activación por tier para la primera ola (A/B/C), antes del 2026-10-16","Notación T#/S-#/A# en el CRM","D-P02 (nombres de servicios) sigue abierta"],
 "next_owner":"QA-01","review_status":"borrador"}
```
