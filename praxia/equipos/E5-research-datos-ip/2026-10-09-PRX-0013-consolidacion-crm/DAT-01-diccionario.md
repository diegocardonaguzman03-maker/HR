# PRX-0013 · Diccionario de datos y reglas de calidad del CRM
**DAT-01 · 2026-10-09 · Borrador para QA-01 y RISK-01**

**Mensaje clave.** El CRM valida formatos, etapas y cierres. Tiene cuatro huecos:
- no exige base legal antes del contacto saliente;
- pierde la fecha de procedencia de los contactos;
- deduplica mal por nombre;
- no da procedencia ni deduplicación a las oportunidades.

Fuente: `schema.ts`, `crm.ts`, `importer.ts` y `domain/pipeline.ts` [DEFINIDO en código].

## 1. Diccionario mínimo
Columna «Hoy»: **Sí** = el código lo bloquea · **Parcial** = lo valida con huecos · **No** = no lo valida.

### Organizaciones
| Campo | Regla | Hoy |
|---|---|---|
| `name` | Obligatorio, de 2 a 200 caracteres | Sí |
| `domain` | Normalizado y único | Parcial: los nulos no se controlan y en la captura manual no se valida el formato |
| `website`, `linkedin_url` | Empiezan con `http(s)://` | Sí |
| `country` / `industry` | [PROPUESTA] ISO 3166-1 alfa-2 / catálogo de PRX-0012 | No: texto libre |
| `fit_score` | Una sola escala | **Inconsistente:** el importador usa de 1 a 5 y la edición de 0 a 100 |
| `lifecycle` | Enum; pasa a `client` solo con Closed Won | Sí |
| `source`, `source_retrieved_at` | Obligatorios si el dato es externo | Parcial: la fecha mezcla `AAAA-MM-DD` con ISO completo y no tiene formato validado |

### Contactos
| Campo | Regla | Hoy |
|---|---|---|
| `full_name` | Obligatorio, de 2 a 200 caracteres | Sí |
| `organization_id` | [PROPUESTA] obligatorio para prospectos | No |
| `email` | Formato válido, único y en minúsculas | Sí; está vacío en los 130 contactos importados |
| `email_status` | `valid` solo si hay correo | No |
| `lawful_basis` | Enum; `not_assessed` por defecto | Parcial: no guarda evidencia, fecha ni quién evaluó |
| `do_not_contact` | Bloquea la actividad saliente | Sí |
| `source_retrieved_at` | Fecha de consulta de la fuente | **No:** guarda la hora de la importación |

### Oportunidades
| Campo | Regla | Hoy |
|---|---|---|
| `organization_id`, `title`, `stage_id` | Obligatorios | Sí |
| `amount` / `currency` | Entero positivo en centavos / USD o MXN | Sí |
| `probability_override` | De 0 a 1 | Sí |
| Fechas | `AAAA-MM-DD` válida | Parcial: el regex acepta 2026-02-31 |
| Campos por etapa | `required_fields` de cada etapa | Sí, al crear, editar y mover |
| Closed Won / Closed Lost | Evidencia de firma o aceptación / motivo de pérdida | Sí |
| `primary_contact_id` | De la misma organización | No |
| Procedencia | Origen de la oportunidad | No existe el campo |
| `owner_agent_id` | Debe existir en `agents` | No |

## 2. Reglas transversales
**Deduplicación.**
- Organizaciones: por dominio y después por `lower(name)`. En SQLite, `lower()` solo convierte ASCII, así que no detecta duplicados que difieren en acentos, sufijos societarios o puntuación. Al editar no se buscan duplicados.
- Contactos: por correo y, solo en el importador, por nombre dentro de la organización (distingue «Jose» de «José»).
- Oportunidades: sin deduplicación.
- [PROPUESTA] Agregar una columna `name_key` sin acentos, sin sufijos y en minúsculas.

**Procedencia.** Cada registro externo lleva `source` y la fecha de consulta. Manda el primer origen: una nueva importación no sobrescribe. Cada carga queda en `audit_log` como `crm.import`.

**Base legal.** Los 130 contactos están en `not_assessed` y D-P07 sigue [PENDIENTE]. Hoy nada impide registrar actividad saliente ni abrir oportunidades con esos contactos. *Requiere revisión de un abogado en la jurisdicción aplicable.*

**Claves foráneas.** No verifiqué que `PRAGMA foreign_keys` esté activo en libsql [PENDIENTE: DEV-01].

## 3. Controles de calidad medibles
Todos filtran `is_demo=0`. Se corren después de cada importación y cada semana en `/tablero` [PROPUESTA].

| # | Control | Consulta o criterio | Meta |
|---|---|---|---|
| C1 | Procedencia completa | `SELECT COUNT(*) FROM organizations WHERE is_demo=0 AND (source='manual' OR source_retrieved_at IS NULL OR source_retrieved_at NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*');` y la misma consulta en `contacts` | 0 |
| C2 | Organizaciones duplicadas | `SELECT lower(trim(name)), COUNT(*) FROM organizations WHERE is_demo=0 GROUP BY 1 HAVING COUNT(*)>1;` y, en el script, la misma comparación con `name_key` | 0 grupos |
| C3 | Contactos duplicados o sin organización | `SELECT organization_id, lower(trim(full_name)) FROM contacts WHERE is_demo=0 GROUP BY 1,2 HAVING COUNT(*)>1;` y `SELECT COUNT(*) FROM contacts WHERE is_demo=0 AND organization_id IS NULL;` | 0 y 0 |
| C4 | Contacto sin base legal | `SELECT COUNT(*) FROM contacts c WHERE is_demo=0 AND (lawful_basis='not_assessed' OR do_not_contact=1) AND (lead_status IN ('contacted','engaged','qualified') OR EXISTS (SELECT 1 FROM activities a WHERE a.contact_id=c.id AND a.direction='outbound'));` | 0 (bloqueante) |
| C5 | Integridad de oportunidades | `SELECT COUNT(*) FROM opportunities o JOIN contacts c ON c.id=o.primary_contact_id WHERE o.is_demo=0 AND (c.organization_id IS NULL OR c.organization_id<>o.organization_id);` y % de oportunidades abiertas con `next_action_date` vencida o vacía | 0 cruces; menos del 10 % vencidas [PROPUESTA] |

**Línea base [PENDIENTE].** El `data/praxia.db` local solo tiene 4 registros demo por tabla. Corrí C1 a C5 en solo lectura y todos dan 0, pero solo porque no hay datos reales. La línea base se toma en el entorno donde se hizo la importación. Espero que C1 marque las fechas de los 130 contactos (son de la importación) y que C4 dé 0.

## 4. Huecos para DEV-01 [PROPUESTA]
- **G1.** Copiar al contacto la fecha de la fuente.
- **G2.** Bloquear la actividad saliente y las etapas desde Contacted cuando el contacto esté en `not_assessed`.
- **G3.** Agregar evidencia, fecha y evaluador de la base legal.
- **G4.** Deduplicar con `name_key`.
- **G5.** Usar una sola escala de `fit_score`, de 1 a 5.
- **G6.** Validar que el contacto pertenezca a la organización y que las fechas existan en el calendario.

## Decisión requerida del Founder
**Tema:** cómo adoptar el diccionario y los controles.
- **A.** Aprobar y encargar a DEV-01 los huecos G1 a G6, con G2 y G3 revisados por RISK-01.
- **B.** Aprobar solo como reporte manual en `/tablero`, sin cambios de código.
- **C.** Posponer hasta cerrar D-P07.

**Recomendación:** A. Sin el bloqueo G2, cumplir la base legal depende de la memoria del operador.
**Riesgos:** con B, puede registrarse un contacto saliente sin base legal; con C, se acumulan duplicados y fechas incorrectas.
**Esfuerzo:** A es bajo o medio [Supuesto]; B es mínimo.
**Fecha límite:** antes del primer contacto real o el 2026-10-16, lo que ocurra primero.

```json
{"brief_id":"PRX-0013","owner":"DAT-01","objective":"Diccionario de datos y reglas de calidad del CRM",
 "deliverable":"praxia/equipos/E5-research-datos-ip/2026-10-09-PRX-0013-consolidacion-crm/DAT-01-diccionario.md",
 "evidence_and_sources":["src/server/db/schema.ts","src/server/services/crm.ts","src/server/services/importer.ts","src/domain/pipeline.ts","src/server/seed/base.ts","Consultas de solo lectura sobre data/praxia.db (solo demo)"],
 "assumptions":["Los 117 y 130 registros viven en otro entorno","El esfuerzo de G1 a G6 es una estimación"],
 "risks":["Actividad saliente con not_assessed","La fecha de los contactos es la de la importación","Duplicados por acentos o sufijos","Claves foráneas sin verificar"],
 "decisions_needed":["Adopción del diccionario (A/B/C)","D-P07 pendiente"],
 "next_owner":"QA-01","review_status":"borrador"}
```
