# PRX-0013 · Plan de pruebas: importación y flujo lead-to-cash

**Dueño:** DEV-02 · **Fecha:** 2026-10-09 · **Estado:** borrador [PROPUESTA] · **App:** `apps/praxia-command-center`

**Mensaje clave:** propuesta → contrato → factura → cobro ya está cubierto. Faltan pruebas de la importación (casos límite, datos sintéticos), del paso de prospecto importado a oportunidad y de la sincronización en vivo. Tres P1 probablemente fallan hoy (I-03, S-02, S-04).

Estado: **C** = cubierto · **Parcial** · **No** = sin prueba. Tipo: U = unitaria, I = integración (vitest), E = e2e (Playwright).

## 1. Importación (`importer.ts`)

| ID | P | Entrada | Resultado esperado | Tipo | Estado |
|---|---|---|---|---|---|
| I-01 | P1 | CSV con BOM, CRLF, salto de línea dentro de comillas, fila más corta que el encabezado y líneas vacías | Filas correctas; los campos que faltan quedan vacíos | U | Parcial (solo comillas) |
| I-02 | P1 | Fixture sintético de 5 filas importado dos veces | 2.ª corrida: 0 creados y conteos estables. No depende de los CSV reales de PRX-0012 | I | Parcial (usa datos reales) |
| I-03 | P1 | Dos filas «Óptica Norte» / «óptica norte» sin dominio | 1 organización. **Probable fallo:** `findDuplicateOrganization` usa `lower()` de SQLite, que solo convierte ASCII | I | No |
| I-04 | P1 | Fila con `email_patron` y `estado_email` | `email` nulo, `emailStatus=unknown`, `lawfulBasis=not_assessed` | I | C |
| I-05 | P1 | Contacto ya existente con `doNotContact=true` y reimportación | No se duplica ni se reactiva | I | No |
| I-06 | P2 | `empresa` vacía o de 1 carácter | Fila saltada y contada | U/I | No |
| I-07 | P2 | `contacto_nombre` = «PENDIENTE», «[patrón…», «—», «N/D» | Sin contacto. Hoy «N/D» crea uno | I | No |
| I-08 | P2 | `fit_icp_1a5` = 0, 6, «4.5», vacío, 3 | Solo 3 se guarda. Revisar escala: importador 1–5, `updateOrganization` 0–100 | I | Parcial |
| I-09 | P2 | Organización manual previa con el mismo dominio | `organizationsMatched=1`; sus campos no se sobrescriben; el contacto se liga a ella | I | No |
| I-10 | P2 | Cualquier corrida | Un registro `crm.import` en la auditoría con los conteos | I | No |
| I-11 | P3 | Notas de más de 5000 caracteres; «Ana  López» vs «Ana López»; «=HYPERLINK(…)» | Recorte con «…»; sin duplicado; texto escapado | U/I | No |

## 2. Flujo lead-to-cash

| ID | P | Entrada | Resultado esperado | Tipo | Estado |
|---|---|---|---|---|---|
| L-01 | P1 | Contacto importado (`researched`) → oportunidad → … → cobro | Igual que el ciclo manual; procedencia conservada; el tablero lo cuenta | I + E | No |
| L-02 | P1 | Actividad saliente a un contacto con `lawfulBasis=not_assessed` | **Bloqueada** según D-P07 [PENDIENTE de decisión]. Hoy se permite y el contacto pasa a `contacted` | I | No |
| L-03 | P1 | Aprobación, evidencia, montos, pagos (saldo y moneda), anulación, auditoría | Reglas vigentes | I + E | C (`revenue-lifecycle`, `revenue-slice`) |
| L-04 | P2 | Aprobación rechazada y nuevo envío | No se puede enviar; se puede volver a someter | I | No |
| L-05 | P2 | Propuesta rechazada o vencida; oportunidad perdida con motivo | Etapa `lost` y tasa de cierre actualizada | I | Parcial |
| L-06 | P2 | Pagos parciales hasta saldo 0; factura vencida | Estado `paid` y `overdue` en la integración, no solo en la unitaria | I | Parcial |
| L-07 | P2 | Datos importados junto con datos demo | Lo importado cuenta como real; lo demo sigue excluido | I | Parcial |

## 3. Tareas de agentes en vivo (`mirror.mts`, `runtime.ts`)

| ID | P | Entrada | Resultado esperado | Tipo | Estado |
|---|---|---|---|---|---|
| S-01 | P1 | `pull` + `task-create` + `task-status` en directorio temporal | `set` con `if_version` correcto, lotes ≤ 50; `pull` con repetición de lotes reproduce el estado | I | No |
| S-02 | P1 | Ejecutar `mirror.mts` fuera de `/home/user/HR` | Los documentos se escriben bajo `stateDir`. **Fallo seguro:** la ruta `/home/user/HR/.sync` está fija en el código | I | No |
| S-03 | P1 | Cambio remoto simulado con un `ArtifactDb` falso que tenga `onSnapshot` | Se aplica a SQLite y a la línea base; el `flush()` siguiente escribe 0 (sin eco) | U | No |
| S-04 | P1 | Cambio remoto que llega mientras corre `flush()` | No se reenvía. **Probable fallo:** `last = next` sobrescribe la base con una instantánea tomada antes del cambio | U | No |
| S-05 | P2 | Edición local sin guardar y cambio remoto en la misma fila | Regla explícita (gana el último escritor) y aviso | U | No |
| S-06 | P2 | Cambio entre `get()` y la primera instantánea | Se aplica; hoy `first` lo descarta | U | No |
| S-07 | P2 | El lote del mirror se rechaza por `if_version` | El estado del mirror no avanza o pide un nuevo `pull`. Hoy avanza antes de confirmar | I | No |
| S-08 | P2 | Importar en sql.js con `createBrowserDb` | Mismos conteos que en libsql | I | Parcial (la paridad solo cubre la semilla) |
| S-09 | P2 | Tarea creada por el mirror y vista en PRAXIA World publicado | Aparece y se anima sin recargar | E | Parcial (solo vía app) |

**Orden propuesto:** P1 y luego P2. I-03, S-02, S-04 y L-02 exigen cambiar código: va en un encargo aparte, revisado por DEV-01, QA-01 y RISK-01.

## Decisión requerida del Founder

**L-02: ¿se permite actividad saliente a contactos cuya base legal no está evaluada?**

**A.** Bloquear hasta que RISK-01 la evalúe (coherente con D-P07) · **B.** Permitir con aviso y auditoría · **C.** Permitir, como hoy.

**Recomendación:** A. **Riesgo de C:** contactar a ejecutivos reales sin base legal revisada (requiere revisión de un abogado en la jurisdicción aplicable). **Esfuerzo:** una regla en `logActivity` y dos pruebas, menos de medio día. **Fecha límite:** antes del primer contacto real, a más tardar el 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"DEV-02","objective":"Plan de pruebas priorizado para la importación de prospectos y el flujo lead-to-cash con tareas en vivo",
 "deliverable":"praxia/equipos/E6-producto-experiencia/2026-10-09-PRX-0013-consolidacion-crm/DEV-02-pruebas.md",
 "evidence_and_sources":["src/server/services/importer.ts","src/server/services/crm.ts (findDuplicateOrganization, logActivity)","artifact/mirror.mts","artifact/src/runtime.ts","tests/integration/*.test.ts","tests/e2e/revenue-slice.spec.ts","registro-de-decisiones.md (D-P07, D-P08)"],
 "assumptions":["I-03, S-04, S-06 y S-07 son fallos inferidos al leer el código; no se ejecutaron pruebas","S-02 es un fallo seguro por la ruta fija"],
 "risks":["La prueba actual de importación depende de los CSV reales de PRX-0012","Sin S-03/S-04 la sincronización en vivo puede reenviar o pisar cambios"],
 "decisions_needed":["L-02: bloquear actividad saliente con lawfulBasis=not_assessed (A/B/C)"],
 "next_owner":"DEV-01","review_status":"borrador"}
```
