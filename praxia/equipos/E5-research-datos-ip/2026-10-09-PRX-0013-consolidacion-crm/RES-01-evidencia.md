# PRX-0013 · Evidencia para el CRM: matriz, regla de cita y lista de bloqueo

Owner: RES-01 (E5) · Consumidores: DAT-01, SAL-02, MKT-02 · 2026-10-09 · Borrador interno para QA-01.
Fuente única: `equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/00-evidencia/evidencia-por-sector.md` §4 (A1–A21). Sin búsquedas nuevas.

**Mensaje clave.** Cada cuenta del CRM cita como máximo tres cifras A#: una ancla de su sector y hasta dos transversales. Ninguna sale a un prospecto antes de que alguien verifique visualmente su URL.

## 1. Matriz evidencia → sector [PROPUESTA, basada en la §4]

Transversales para los 6 sectores: A1, A2, A3, A6, A8, A9, A11, A12. Solo si el contacto es CHRO o de RH: A4, A5.

| Sector | Ancla (redacción aprobada, literal) | Apoyo |
|---|---|---|
| 01 Manufactura | A13 «Solo 4.8% de las empresas manufactureras mexicanas (más de 10 empleados) usa IA, contra 8.0% del promedio nacional y 19.1% del promedio de la OCDE.» CMD con datos del INEGI | A14, A15, A16 |
| 02 Startups | A10 «53% de los líderes dice que la productividad debe aumentar; 80% de la fuerza laboral dice que le falta tiempo o energía.» Microsoft Work Trend Index, 2025 | A19, A20 (contexto de capital) |
| 03 High tech | A17 «84% de los desarrolladores usa o planea usar IA; 46% desconfía de la precisión de sus resultados.» Stack Overflow Developer Survey, 2025 | A6, A7, A10, A18 |
| 04 Financieros | A11 «En México, 56% de las empresas aún no identifica con claridad el valor de negocio de la IA, y solo 27% tiene una estrategia de IA bien definida.» KPMG México, 2025 | A7, A18, A20, A21 |
| 05 Retail | A11 (misma redacción) | A10, A21 |
| 06 Logística | A11 (misma redacción) | A15, A18 |

Los sectores 04, 05 y 06 todavía no tienen una cifra propia verificada. Usan una ancla transversal de México mientras sigue abierta la segunda ronda de PRX-0012 (fecha límite 2026-10-13).

## 2. Regla de cita en las notas de la cuenta [PROPUESTA]

Se agrega una línea con la clave `Evidence:`, igual que las claves que ya escribe el importador (`Trigger:`, `ICP fit:`):

```
Evidence: A13 (CMD/INEGI, 2026); A11 (KPMG México, 2025) · ref. PRX-0012-E §4 · verif. visual: pendiente
```

1. En las notas van el ID y el crédito (editor, año), sin parafrasear ni redondear. El texto literal se copia de la §4 solo al redactar el mensaje.
2. Máximo tres IDs, en este orden: ancla, transversal de México (A11 o A12) y transversal global.
3. Los A# son datos de mercado. Nunca se atribuyen a la cuenta.
4. Los triggers de SAL-02 se quedan en `Trigger:` con su propia URL y no se presentan como evidencia de la brecha.
5. Se mantienen las reglas de la §4: A18 y A21 llevan «prevé»; A14 lleva «asociación, no causalidad»; A1 y A2 no se combinan; A13 y A16 no se restan.
6. La nota cambia a `verif. visual: OK AAAA-MM-DD` solo cuando una persona abrió la URL. Mientras diga `pendiente`, la cifra no sale.
7. En un texto externo el crédito se escribe «Fuente: [editor], [año]» y la URL va en la referencia.

## 3. Lista de bloqueo

**a) No usar.** Todo lo que está en la §3 de PRX-0012. Destacan las redacciones originales de Deloitte («1.6× sin retorno») y de Gartner («47% frena por la cultura»), que se sustituyen por A3 y A5.
**b) Verificación visual antes del primer envío.** Aplica a los 21 IDs, que corresponden a 15 URL. Estos van primero:
- A5: el extracto venía cortado.
- A21: solo se verificó el título.
- A4 y A5: falta la fecha y no se cita n.
- A13, A14, A16, A17 y A19: falta el día de publicación.
- A3: el dato es de octubre de 2025, con n=100 líderes C-suite.

**c) Triggers de las bases que no se citan al prospecto.**
- Banco Azteca, «50% más de productividad»: es una afirmación de su proveedor (UiPath).
- Ualá México, sanciones de la CNBV y morosidad: es información sensible y no va en el primer contacto.
- Las demás cifras que reportan las propias empresas (Liverpool, Alsea, 3B) sirven solo como contexto interno.

## Decisión requerida del Founder

**Tema:** quién verifica visualmente A1–A21. Se necesita un navegador, y el entorno de los agentes no pudo abrir las páginas.

| Opción | Qué implica | Riesgo | Esfuerzo |
|---|---|---|---|
| A | El Founder abre las 15 URL y marca `OK` en el CRM | Bajo | 15–20 min |
| B | Una sesión con acceso web abre las URL y QA-01 deja registro | Que se repita el bloqueo de red | Bajo |
| C | El primer contacto sale sin cifras | El mensaje tiene menos peso | Nulo |

**Recomendación [PROPUESTA]:** A, y aplicar C mientras la verificación siga pendiente. **Fecha límite:** antes del primer contacto real (D-P07).

**Revisión de calidad (§7):** no hay datos nuevos ni inventados; las PROPUESTAS están marcadas; no hay material GASM; el documento está en un solo idioma.

```json
{"brief_id":"PRX-0013","owner":"RES-01","objective":"Matriz evidencia-sector, regla de cita en notas del CRM y lista de bloqueo","deliverable":"praxia/equipos/E5-research-datos-ip/2026-10-09-PRX-0013-consolidacion-crm/RES-01-evidencia.md","evidence_and_sources":["PRX-0012 evidencia-por-sector.md §1-§4","apps/praxia-command-center/src/server/services/importer.ts (claves de notas)","bases base-*.csv de PRX-0012 (trigger_detectado)"],"assumptions":["A1-A21 aprobadas según el brief; verificación visual pendiente","La clave 'Evidence:' sigue la convención del importador mientras D-P06 esté abierta"],"risks":["Sectores 04-06 sin cifra propia","Envío de cifras antes de la verificación visual","Uso de datos sensibles de trigger en el contacto"],"decisions_needed":["Quién verifica A1-A21 (A/B/C)","Segunda ronda de evidencia 04-06 (abierta en PRX-0012, 2026-10-13)"],"next_owner":"QA-01","review_status":"en revisión"}
```
