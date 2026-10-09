# PRX-0013 · Inteligencia competitiva por cuenta en el CRM

**RES-02 · 2026-10-09 · borrador para QA-01**

**Mensaje clave:** hoy el CRM no sabe contra quién compite PRAXIA en cada cuenta, y SAL-01 califica sin ese dato. Propongo seis campos con fuente obligatoria, una forma de capturarlos en `notes` desde hoy y una regla de vigencia. Ninguna de las 117 cuentas tiene un competidor asignado en este documento: no lo revisé cuenta por cuenta y no nombro a nadie sin fuente. [PROPUESTA]

## 1. Campos por cuenta [PROPUESTA]
Una cuenta puede tener varios competidores, así que conviene una tabla hija `account_competitors` (1:N con `organizations`):

| Campo | Valores | Regla |
|---|---|---|
| `competitor_name` | texto o `desconocido` | Solo con fuente pública |
| `competitor_type` | `estrategia` · `rh_cambio` · `integrador_tecnologia` · `equipo_interno` | Usa el comparativo de la skill §4: unos recomiendan, otros facilitan y PRAXIA asegura la adopción |
| `role` | `incumbente` · `competidor_en_proceso` · `aliado_posible` | Un incumbente puede abrir la puerta (p. ej., una IA implantada con poco uso) |
| `signal` | `comunicado` · `caso_publicado` · `vacante` · `alianza` · `mencion_contacto` | Qué evidencia hay |
| `source_url` + `source_date` + `retrieved_at` | URL, fecha de publicación, fecha de captura | Sin URL no hay registro |
| `confidence` | `alta` · `media` · `baja` | Ver §3 |

En `organizations` va un resumen: `ci_status` = `sin_verificar` (valor por defecto para las 117) · `sin_senal` · `con_senal`.

## 2. Captura provisional en `notes` (desde hoy)
Una línea por señal, con formato fijo para poder migrarla después con un script:

```
[CI] tipo=integrador_tecnologia | rol=incumbente | competidor=<nombre> | senal=comunicado | fuente=<URL> | fecha_fuente=AAAA-MM-DD | capturado=AAAA-MM-DD | confianza=alta | por=RES-02
```

- Si la cuenta no se ha revisado, se escribe `[CI] estado=sin_verificar`.
- Si se revisó y no hay nada, se escribe `[CI] estado=sin_senal | capturado=AAAA-MM-DD`.
- Lo que diga un contacto en una conversación se registra como `senal=mencion_contacto | fuente=actividad:<id>`, nunca va con confianza alta y no sale de PRAXIA.
- No se capturan precios de competidores salvo con fuente pública y fecha.

## 3. Confianza y regla de actualización [PROPUESTA]
- **Alta:** fuente primaria (comunicado de la cuenta o del proveedor, registro público de compras) con 12 meses o menos.
- **Media:** prensa o caso publicado por el proveedor, de 24 meses o menos, o una mención de un contacto.
- **Baja:** inferencia indirecta, como una vacante o una alianza sin alcance claro.

**Cuándo se actualiza:**
1. En el WF01, paso 2: RES-02 verifica antes de que SAL-01 califique. Ninguna cuenta pasa a `prospect` con `ci_status = sin_verificar`.
2. Se vuelve a verificar al pasar a propuesta y cuando aparece un trigger (skill §3.3: nuevo CEO o CHRO, implantación de IA, M&A).
3. Las señales pierden vigencia: después de 12 meses la alta baja a media, y después de 24 meses la señal pasa a `historica` y no cuenta en la calificación.
4. Nunca se usa información de empleadores ni material confidencial de terceros. Ante la duda, no se registra.

## Decisión requerida del Founder
| Opción | Qué implica | Esfuerzo |
|---|---|---|
| **A** | Tabla hija `account_competitors` y `ci_status`, más un script que migre las líneas `[CI]` | Un cambio de esquema y una migración |
| **B** | Seis columnas planas en `organizations` | Menor, pero solo cabe un competidor por cuenta |
| **C** | Solo notas etiquetadas, sin cambiar el esquema | Ninguno, pero no se puede filtrar ni reportar |

- **Recomendación:** A. Mientras tanto, usar el formato de §2.
- **Riesgo:** registrar nombres de terceros en un repositorio público (D-P08). Por eso la fuente es obligatoria y no se registra nada confidencial. Hay que coordinarlo con D-P07.
- **Fecha límite sugerida:** 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"RES-02","objective":"Definir campos de inteligencia competitiva por cuenta, captura provisional en notes y regla de actualización","deliverable":"praxia/equipos/E5-research-datos-ip/2026-10-09-PRX-0013-consolidacion-crm/RES-02-competencia.md","evidence_and_sources":["apps/praxia-command-center/src/server/db/schema.ts (organizations, sin campos de competencia)","Skill §3.3, §4, §8.2","WF01 paso 2"],"assumptions":["No se revisaron las 117 cuentas una por una; todas arrancan en sin_verificar","Umbrales de vigencia de 12 y 24 meses [PROPUESTA]"],"risks":["Nombres de terceros en un repo público (D-P08)","Señales viejas que sesguen la calificación"],"decisions_needed":["Opción A/B/C de modelo de datos (fecha límite sugerida 2026-10-16)"],"next_owner":"QA-01","review_status":"borrador"}
```
