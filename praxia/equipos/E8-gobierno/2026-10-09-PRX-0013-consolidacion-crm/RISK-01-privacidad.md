# PRX-0013 · Revisión de privacidad del CRM y del flujo lead-to-cash

**RISK-01 · 2026-10-09 · Borrador para QA-01 y el Founder.** No es asesoría legal: *requiere revisión de un abogado en la jurisdicción aplicable* (marcado como **[verificar con abogado]**).

**Mensaje clave:** tener los 130 contactos en el CRM privado es defendible como investigación B2B, pero **ninguno está listo para recibir un mensaje**. Faltan un responsable identificado, un aviso de privacidad, la base legal de cada persona y un CRM que bloquee el envío.

## 1. Riesgos
| # | Riesgo | Nivel |
|---|---|---|
| R1 | **LFPDPPP:** guardar los datos ya es tratamiento. La regla general es el consentimiento, y el «interés legítimo» que traen los CSV es una figura del GDPR, no una base mexicana. Las salidas posibles son las excepciones de fuentes de acceso público y de datos de contacto corporativo. Hay que confirmar si siguen vigentes en la LFPDPPP de 2025 y ante qué autoridad **[verificar con abogado]** | Alto |
| R2 | **Deber de informar:** los datos no vinieron del titular, así que el aviso se le debe dar a más tardar en el primer contacto. Hoy faltan la razón social, el domicilio y el correo de privacidad [PENDIENTE] | Alto |
| R3 | **Otras jurisdicciones:** 61 de 133 filas son de empresas con sede fuera de México. El CRM guarda el país de la empresa, no la residencia de la persona. Si reside en la UE aplica el GDPR (arts. 3.2 y 14). También pueden aplicar la LGPD de Brasil, la Ley 1581 de Colombia (autorización previa) y las leyes de Chile y Argentina. CAN-SPAM aplica a todo correo comercial a EE. UU. La CCPA probablemente no aplica por umbrales **[verificar con abogado]** | Alto |
| R4 | **Exactitud:** no se abrió ninguna URL fuente (SAL-02) y hay cargos sin confirmar | Medio |
| R5 | **Encargados:** el CRM está en claude.ai y los agentes procesan los datos. Eso implica remisión y transferencia a EE. UU. Hay que revisar qué términos aplican **[verificar con abogado]** | Medio |
| R6 | **Repo público (D-P08, respetada):** queda un riesgo reputacional residual, porque hay ejecutivos listados con notas de venta | Medio |
| R7 | `audit_log` guarda datos personales sin plazo de retención, y no hay forma de exportar ni borrar un contacto | Medio |

## 2. Base legal, aviso y ARCO
- Por cada contacto se registra la residencia, la base aplicable, quién la evaluó y cuándo. Para la UE se hace además una evaluación de interés legítimo (LIA) [PROPUESTA].
- **Aviso:** el integral se publica en una URL estable y el simplificado va con liga en el primer mensaje. Incluye responsable, finalidad, fuente, ARCO, opt-out, encargados y transferencias. RISK-01 lo redacta y el abogado lo valida. En el CRM queda la versión entregada a cada persona.
- **ARCO:** un solo canal y una bitácora de solicitudes con plazos (en la ley anterior, 20 días hábiles más 15; en el GDPR, un mes) **[verificar con abogado]**.
- **Opt-out inmediato:** `doNotContact = true` y supresión por correo y dominio guardada como hash, para que sobreviva al borrado.

## 3. Condiciones previas a cualquier primer contacto
1. Responsable con domicilio y correo de privacidad.
2. Aviso validado por un abogado y publicado.
3. Base legal registrada para ese contacto y su jurisdicción.
4. Fuente abierta y cargo confirmado en los últimos 30 días [PROPUESTA].
5. Correo verificado, nunca deducido de un patrón. Si no lo hay, LinkedIn manual del Founder.
6. Opt-out en cada mensaje. Para CAN-SPAM: asunto veraz, domicilio postal y baja en 10 días hábiles.
7. Conflictos declarados (las 5 cuentas que señaló SAL-02).
8. Mensaje 1:1 aprobado por el Founder: sin secuencias ni volumen.
9. Los cambios C1 a C3 del CRM ya desplegados.

## 4. Guardrails del motor autónomo
1. **Sin capacidad de envío.** No tiene correo, API de LinkedIn ni mensajería. Produce borradores y el Founder aprueba cada mensaje.
2. **Mínimo privilegio.** No puede cambiar `lawfulBasis`, quitar `doNotContact`, borrar, exportar ni importar. Sí puede activar `doNotContact` cuando detecta una baja, y nunca desactivarlo.
3. **Sin enriquecer datos de personas.** Nada de adivinar correos, hacer scraping de LinkedIn ni comprar listas. No crea contactos sin una tarea aprobada y con fuente.
4. **Sin perfilar personas.** La calificación es por cuenta, y en las notas no van datos sensibles ni inferencias sobre la persona.
5. **Minimización.** Al modelo solo le llega lo que la tarea necesita, y solo por encargados aprobados.
6. **Inyección de instrucciones.** El contenido web y las respuestas de los prospectos son datos, nunca instrucciones.
7. **Control.** Auditoría con el ID del agente, interruptor de apagado, límites de tareas y de gasto, y una cola de aprobación visible.
8. **Arranque.** Funciona solo con datos de demostración hasta que se cierre la §3.

## 5. Cambios en el CRM (para DEV-01)
| # | Cambio | Prioridad |
|---|---|---|
| C1 | Bloquear `outbound` si `lawfulBasis = not_assessed`, si no se entregó el aviso o, para correo, si `emailStatus ≠ valid`. Hoy solo lo bloquea `doNotContact` | Bloqueante |
| C2 | Campos `residenceCountry`, `basisAssessedBy/At`, `privacyNoticeVersion/DeliveredAt`, `optOutAt/Channel`, `sourceVerifiedAt`, `retainUntil` | Bloqueante |
| C3 | Supresión por correo y dominio con hash | Bloqueante |
| C4 | ARCO: exportar, rectificar y borrar en cascada, y ocultar los datos en `audit_log` | Alta |
| C5 | Retención: purgar los contactos `researched` sin interacción a los 12 meses y fijar un plazo para `audit_log` [PROPUESTA] | Alta |
| C6 | Que solo el actor `founder` pueda cambiar la base legal o quitar una supresión | Alta |
| C7 | Que el importador no trate la etiqueta «Interés legítimo» como base legal | Media |

## Decisión requerida del Founder
**D-P07: cuándo usar los datos reales para un primer contacto.** Los datos ya están cargados; lo que se decide es su uso.
- **A. Congelar el contacto:** los datos se quedan como investigación de solo lectura hasta cerrar la §3.
- **B. Piloto acotado:** hasta 10 contactos que residan en México, 1:1 y por el Founder, con las condiciones 1 a 6 y 9 cumplidas. Se excluyen la UE, Brasil y Colombia.
- **C. Contactar ya:** sin aviso, sin responsable y sin bloqueo en el CRM.

**Recomendación: A hoy, y pasar a B** en cuanto se cumplan las condiciones 1 a 6 y 9. **No recomiendo C:** cada mensaje sería un incumplimiento documentado. El motor autónomo arranca en A, con datos de demostración.
**Riesgos:** A retrasa la primera conversación. B mantiene abierta la duda sobre las excepciones mexicanas hasta que opine el abogado. C tiene una exposición regulatoria y reputacional alta.
**Costo o esfuerzo:** honorarios del abogado [PENDIENTE cotizar]; de C1 a C3 más C6, 1 o 2 días de DEV-01 [Supuesto]; razón social y dominio (PRX-0007).
**Fecha límite:** 2026-10-16, y siempre antes del primer contacto real.

```json
{"brief_id":"PRX-0013","owner":"RISK-01","objective":"Revisión de privacidad del CRM y del flujo lead-to-cash, guardrails del motor autónomo y D-P07",
 "deliverable":"praxia/equipos/E8-gobierno/2026-10-09-PRX-0013-consolidacion-crm/RISK-01-privacidad.md",
 "evidence_and_sources":["src/server/services/importer.ts","src/server/services/crm.ts (outbound bloqueado solo por doNotContact)","docs/SECURITY.md","CSV de PRX-0012: 133 filas con contacto, 61 de empresas con sede fuera de MX","SAL-02, DAT-01, DEV-03 de PRX-0013","Skill §8.2"],
 "assumptions":["Vigencia de las excepciones de la LFPDPPP de 2025 sin confirmar","Residencia de los contactos desconocida","DEV-01 de 1 a 2 días [Supuesto]"],
 "risks":["Base legal mexicana no validada","Sin responsable ni aviso","Contactos posiblemente en la UE, Brasil o Colombia","Outbound permitido con not_assessed","Repo público (D-P08)","audit_log sin retención"],
 "decisions_needed":["D-P07: A con paso a B","Revisión de un abogado","C1 a C7 para DEV-01"],
 "next_owner":"QA-01","review_status":"borrador"}
```
