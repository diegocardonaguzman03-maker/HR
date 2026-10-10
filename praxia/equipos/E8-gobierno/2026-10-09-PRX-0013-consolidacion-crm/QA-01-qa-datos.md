# PRX-0013 · QA de los datos importados al CRM

**Revisor:** QA-01 (no fui autor) · 2026-10-09 · **Insumos:** las 6 bases `base-*.csv`, `importer.ts`, `crm.ts`, la prueba de integración y la `ESPECIFICACION.md` de PRX-0012.

**Dictamen: APROBADO CON CAMBIOS.** El import cuadra con las bases y respeta las reglas duras: sin correos, base legal `not_assessed` y procedencia en cada registro. Sirve para trabajo interno con condiciones. No sirve para contactar.

## 1. Conciliación [DEFINIDO: cálculo propio sobre los CSV]
- Las 6 bases suman 152 filas (28, 16, 22, 31, 31 y 24) con 119 nombres de empresa distintos.
- Se crearon **117 organizaciones**. Dos nombres se unieron por dominio: Sigma Alimentos se unió a Sigma Foods y DHL Express a DHL Supply Chain.
- De las 133 filas con contacto se crearon **130 contactos**. Se descartaron 3 repetidos en la misma organización (Bimbo, Sigma y 99minutos).
- Se omitieron **22 filas**: 19 sin contacto y 3 repetidas. Coincide con el resultado reportado.

## 2. Completitud por campo
| Campo | Completo | Observación |
|---|---|---|
| Dominio (org., n=117) | 99 (85 %) | A 18 les falta porque el valor trae «[verificar]» o «[PENDIENTE]» y el importador lo descarta |
| País | 117 (100 %) | Texto libre con unas 45 variantes («EE. UU.», «EE.UU.», «Estados Unidos»…); 2 con [PENDIENTE] o [verificar] |
| Tamaño | 117 con valor | Solo 30 (26 %) sin marca; 87 (74 %) dicen «estimado, PENDIENTE verificar» |
| Fit 1–5 | 117 (100 %) | 5: 24 · 4: 43 · 3: 35 · 2: 15 |
| LinkedIn de la empresa | 0 % | Todo [PENDIENTE] (sin scraping) |
| Cargo del contacto (n=133) | 133 (100 %) | 4 con [PENDIENTE]; 70 con matices entre paréntesis («según…», «desde…») |
| LinkedIn del contacto | 0 % | 88 con [PENDIENTE] y 45 vacíos |
| URL fuente y fecha del contacto | 133 (100 %) | Todas consultadas el 2026-10-09 |
| Fecha de la fuente del trigger | 62 (53 %) ISO | 55 sin día o mes («[día PENDIENTE]») |

## 3. Duplicados y variantes entre sectores
1. **Rappi (02) y Rappi México (05) quedaron como dos organizaciones.** El dominio de la 02 trae «[verificar]» y los nombres no coinciden.
2. **Diego Coppel Sullivan está dos veces**, en «Grupo Coppel — BanCoppel» (04) y en «Grupo Coppel» (05), con el mismo cargo.
3. **DHL Express México quedó dentro de DHL Supply Chain México** porque comparten `dhl.com`. Son unidades de negocio distintas y se perdió el trigger de Express (fit 3, C).
4. Bimbo, Herdez, Sigma, Arca, 99minutos y DHL aparecen en dos sectores o unidades. El CRM conserva solo el sector, el fit, la prioridad y el trigger de la primera fila. En 4 casos el fit era distinto (Herdez, Sigma, Arca y 99minutos).

## 4. Valores [PENDIENTE] o estimados que entraron al CRM
- `sizeBand`: 87 organizaciones con «[estimado, PENDIENTE verificar]», y 1 valor recortado a 120 caracteres.
- `website`: 15 URL guardadas con el texto « [verificar]» pegado, así que el enlace está roto.
- `country`: 2 registros. `title`: 4 contactos con [PENDIENTE].
- `notes`: 64 organizaciones con «[PENDIENTE]». En las notas es aceptable; en los campos estructurados, no.
- Ningún correo se guardó. Las 152 filas dicen `NO VERIFICADO` y el patrón no se cargó.

## 5. Consistencia con las reglas del importador
- **Se cumple:** correo nulo, `emailStatus=unknown`, `lawfulBasis=not_assessed`, fuente `research:PRX-0012` más la URL e import idempotente (verificado por la prueba).
- **No se cumple: escala del fit.** El importador guarda de 1 a 5, pero la ficha del CRM dice «Fit score (0–100)» y la validación de edición acepta de 0 a 100. Hoy un 5 se lee como 5/100.
- **Normalización:** `domainOf` falla con dominios anotados. Eso causa los huecos de dominio y el duplicado de Rappi.
- **Fusión:** cuando hay coincidencia, los datos de la segunda fila se descartan sin aviso.
- **Prueba:** no fija las cifras esperadas (117, 130 y 22). Una regresión no la haría fallar.
- **Gobierno:** la especificación de PRX-0012 dice: «Ningún contacto se carga al Command Center hasta cerrar la decisión D-P07». **D-P07 sigue pendiente** en el registro. El encargo del Founder (consolidar el CRM) puede leerse como autorización, pero no está registrada.

## 6. Recomendación de liberación: **liberar con condiciones** (solo uso interno)
1. El Founder registra D-P07 por escrito. Si elige A, se retiran los contactos.
2. Fusionar Rappi, quitar el contacto Coppel repetido y separar o anotar DHL Express (SAL-02).
3. Unificar la escala del fit: mostrar «x/5» o convertir a 0–100 (DEV-02).
4. Quitar «[verificar]» de `website` y `domain`, y marcar `sizeBand` como estimado (SAL-02 y DEV-02).
5. Fijar las cifras esperadas en la prueba (DEV-02).
6. **Prohibido contactar** hasta verificar los correos y validar la base legal con RISK-01 y un abogado. *Requiere revisión de un abogado en la jurisdicción aplicable.*

## Decisión requerida del Founder
**Uso del CRM con los prospectos de PRX-0012**
- **A (recomendada):** liberar para trabajo interno con las condiciones 1 a 6, registrar D-P07 = B (solo uso interno, sin contacto) y aplicar las correcciones antes de priorizar cuentas.
- **B:** liberar tal como está. Riesgo: segmentar con tamaños estimados, un fit mal leído y duplicados.
- **C:** retirar los contactos hasta cerrar el checklist de RISK-01 (D-P07 = A).
- **Esfuerzo de A:** unas 2 a 3 horas entre SAL-02 y DEV-02 [PROPUESTA]. **Fecha límite:** antes de priorizar cuentas, como tarde el 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"QA-01","objective":"QA de los datos de PRX-0012 importados al CRM",
 "deliverable":"praxia/equipos/E8-gobierno/2026-10-09-PRX-0013-consolidacion-crm/QA-01-qa-datos.md",
 "evidence_and_sources":["PRX-0012/0*/base-*.csv","PRX-0012/ESPECIFICACION.md","src/server/services/importer.ts","src/server/services/crm.ts","src/components/crm/forms.tsx","tests/integration/prospect-import.test.ts"],
 "assumptions":["Cálculo sobre los CSV simulando las reglas del importador; no se consultó la base del artefacto"],
 "risks":["D-P07 sin registrar frente a la regla de PRX-0012","Escala del fit 1-5 frente a 0-100","Duplicados Rappi y Coppel; fusión indebida de DHL Express","74 % de tamaños estimados"],
 "decisions_needed":["D-P07: registrar el uso interno sin contacto (recomendada B)","Uso del CRM: A, B o C"],
 "next_owner":"SAL-02","review_status":"aprobado por QA"}
```
