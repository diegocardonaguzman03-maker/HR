# PRX-0013 · Aliados en el CRM (PR-01)

**Mensaje clave:** los aliados que más le sirven a PRAXIA están donde ya se dispara la compra: en la implementación de IA, en las rondas de inversión y en las reorganizaciones. Se registran en el CRM sin contacto, con fuente pública y con revisión reputacional. Ningún acuerdo ni comisión sale sin el Founder. [PROPUESTA]

## 1. Tipos de aliado, por prioridad
| # | Tipo | Sectores de la base PRX-0012 | Qué aporta | Qué ofrece PRAXIA |
|---|---|---|---|---|
| 1 | **Integradores** de ERP, CRM, datos e IA | 01, 03, 04, 05, 06 | Acceso en el momento del trigger «implementación de IA» | Ellos entregan el despliegue; PRAXIA responde por la adopción y mide lo que el despliegue no mide (§8.4) |
| 2 | **Ecosistema de inversión**: equipos de plataforma de fondos y aceleradoras | 02, 03, 04 | Portafolio con ronda grande y crecimiento que estresa a la organización | Diagnóstico como baseline para el portafolio |
| 3 | **Asociaciones y cámaras** sectoriales, de RH, fintech, logística y tecnología | Los 6 | Escenarios y credibilidad prestada | Contenido sobre el Adoption Gap, sin cifras del AGI |
| 4 | **Firmas complementarias**: estrategia boutique, procesos y lean, integración post-M&A, búsqueda ejecutiva | 01, 04, 06 | Referidos cuando hay nuevo CEO o CHRO, M&A o turnaround | La continuidad que su entregable no cubre |

Ejemplos de nombres: ninguno por ahora. Cualquier nombre que se proponga entra como [Supuesto, por verificar].

## 2. Criterios de alta como `partner`
**Puertas (se cumplen todas):**
1. Es complementario. Si vende change management o adopción, es competidor o co-delivery y se marca así.
2. Tiene una fuente pública verificable de su rol (URL y fecha).
3. Cubre al menos uno de los 6 sectores y coincide con cuentas de la base.
4. No tiene conflicto con empleadores actuales o anteriores del Founder.
5. Pasó una revisión de prensa de 24 meses sin controversia activa.
6. Se da de alta solo después de cerrar D-P07, igual que las cuentas prospecto.

**Campos del esquema actual (`organizations`):** `name`, `domain`, `website`, `industry` (sector principal), `country`, `linkedinUrl`, `lifecycle = partner`, `source` (URL) y `sourceRetrievedAt`. `fitScore` se deja vacío para no mezclar aliados con el puntaje ICP. El esquema no tiene campos propios de aliado; por eso se usan notas estructuradas.

**Notas mínimas (`notes`):**
```
[PARTNER]
tipo: integrador | inversión | asociación | firma complementaria
sectores: 01, 06
cuentas en común (PRX-0012): N [por validar]
valor para PRAXIA / valor para el aliado:
estado: identificado | en conversación (solo el Founder) | acuerdo firmado
acuerdo: ninguno | referido sin comisión | otro (requiere abogado)
competencia o conflicto: no | sí (detalle)
revisión reputacional: AAAA-MM-DD · resultado
alta aprobada por: Founder (fecha)
```
**Regla de un solo lifecycle:** si una organización es prospecto y aliado a la vez, manda la relación comercial vigente y la otra se anota en las notas.

## 3. Riesgo reputacional a vigilar
- **Pérdida de independencia.** Si PRAXIA cobra comisión al integrador cuyo despliegue mide, el baseline deja de ser independiente. Sin comisiones en el Horizonte 1, y cualquier pago se revela al cliente.
- **Quedar como capacitador subcontratado.** Hay que rechazar paquetes de «formación de usuarios» dentro del proyecto del integrador (§2: PRAXIA no es formación corporativa).
- **Culpa heredada.** Si el despliegue falla, PRAXIA no debe absorberlo. Hacen falta un alcance y unos KPI propios por escrito.
- **Claims inflados.** Nada de «partner oficial» ni uso de logos sin un acuerdo firmado. Un aliado tampoco se presenta como referencia o caso.
- **Datos.** No se intercambian listas de cuentas ni de contactos con aliados (LFPDPPP; requiere revisión de un abogado en la jurisdicción aplicable).
- **Escenarios pagados.** Un patrocinio no se presenta como invitación.
- **Canales.** praxia.com y hello@praxia.com están [PENDIENTES] y no aparecen en materiales de alianza.

## Decisión requerida del Founder
**Política de aliados para el Horizonte 1**
- **A.** Solo registrar como «identificado», sin conversaciones.
- **B.** Registrar y permitir referidos recíprocos sin comisión, con el Founder como único contacto.
- **C.** B más comisiones o co-venta.

**Recomendación:** B, después de D-P07. C queda fuera hasta que existan razón social, revisión legal y un primer caso.
**Riesgos:** con A no se consigue credibilidad prestada; con C se compromete la independencia.
**Esfuerzo:** 2 a 3 horas al mes del Founder [Supuesto]. Sin gasto.
**Fecha límite sugerida:** 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"PR-01","objective":"Tipos de aliado, criterios de alta como partner en el CRM y riesgo reputacional para las 117 cuentas prospecto","deliverable":"praxia/equipos/E3-marca-demanda/2026-10-09-PRX-0013-consolidacion-crm/PR-01-aliados.md",
 "evidence_and_sources":["apps/praxia-command-center/src/server/db/schema.ts (tabla organizations)","Skill PRAXIA §2, §3.3, §8.1, §8.2, §8.4, §13","praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/ESPECIFICACION.md","registro-de-decisiones.md (D-P07, D-P08)"],
 "assumptions":["Esfuerzo de 2 a 3 h/mes del Founder [Supuesto]","No hay aliados ni acuerdos registrados","Las cuentas en común con la base no están validadas"],
 "risks":["Pérdida de independencia por comisiones","Posicionamiento como capacitador subcontratado","Claims de alianza sin acuerdo firmado","Intercambio de datos personales con terceros"],
 "decisions_needed":["Política de aliados H1: A/B/C (recomendada B, después de D-P07)","Campos de aliado: notas estructuradas ahora; columnas propias en el esquema como mejora futura para ENG"],
 "next_owner":"QA-01","review_status":"borrador"}
```
*Revisión: QA-01 y RISK-01 (datos y claims).*
