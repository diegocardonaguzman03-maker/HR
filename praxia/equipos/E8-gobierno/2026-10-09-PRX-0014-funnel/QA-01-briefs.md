# QA-01 · Revisión de briefs de cuenta · PRX-0014

QA-01 · 2026-10-10 · uso interno · autor revisado: SAL-02. Fuentes: bases y notas de PRX-0012, `STR-01-tiers.md`, `SAL-02-top20.md`, QA-01 de PRX-0013.

## Dictamen general: APROBADO CON CAMBIOS
Las cifras y los nombres coinciden con las bases de PRX-0012. No hay correos inferidos ni mensajes redactados, y todos los siguientes pasos son internos. Los cambios corrigen un dato sin fuente, el tier citado, dos handoffs faltantes y dos excesos de longitud. Ningún brief sale del equipo hasta cerrar los cambios y D-P07.

| Brief | Dictamen | Hallazgos | Cambios |
|---|---|---|---|
| APM Terminals | Con cambios | L4 «suplente en PRX-0013»: lo es en el top 20 de SAL-02; en STR-01 es A (#14). L37 «Hutchison (competidor)»: la base no lo dice. L45-50 duplica la decisión 2 de STR-01 (COI). | Citar el tier de STR-01. Marcar [Supuesto]. Remitir el COI a STR-01. |
| BanBajío | Con cambios | L37 «del Rincón… dirige ahora Banamex»: la base dice «sin confirmación posterior». L34: los cargos tienen fuente; el rol es lo hipotético. L40: la base dice «patrón desconocido», no «patrón no verificado». Sin JSON. | Marcar [No verificado]. Corregir L34 y L40. Agregar JSON. |
| Capgemini | Con cambios | L35 «Fit_Acceso = 0 (STR-01)»: **dato sin fuente**; STR-01 no puntúa el acceso (L83). STR-01 la pone en A (#15) y baja a B (70) el 17-nov-2026, cuando WNS cumple 13 meses. L10 «hoy son ~2,300»: la nota no tiene fecha. 699 palabras. Sin JSON. | Quitar el dato. Poner el tier y la fecha de caída. Recortar a ≤600 palabras (§4 repite la decisión). Agregar JSON. |
| DHL Supply Chain | Con cambios | L16 «el uso y el valor no los mide nadie»: afirmación categórica. L26 Croche: la fuente es Forbes, sin fecha. L11 cita el corte de SAL-02; con STR-01 queda en B (70, cálculo QA). | Redactar como hipótesis. Agregar «reconfirmar». Citar el tier. |
| EPAM NEORIS | Con cambios | L11 «excluida» y L32 «TCS y BMW» vienen de SAL-02; en STR-01 EPAM es B (70: 5/2/0) y BMW es #22. L41-43 mezcla «prioridad A» con «Tier 3» (ABM §8.2, no adoptada). 794 palabras. | Poner las opciones en la escala de STR-01 (B, C o descarte). Corregir L32. Recortar a ≤600 (L28). |

## Hallazgos transversales
1. En PRX-0013 conviven dos clasificaciones (SAL-02 y STR-01). Cada brief debe citar ambas hasta que el Founder decida la regla (STR-01, decisión 1, 2026-10-16).
2. La reverificación tiene tres dueños (SAL-02, RES-02 y RES-01 en STR-01). Hace falta uno solo.
3. Voz, ofertas (§5.2, precios experimentales, D-P02) y KPI correctos. Datos personales limitados a nombre y cargo con fuente pública (§8.2, D-P08).
4. Los mensajes clave dan por hechos triggers [No verificado]. Vale solo para uso interno.

## Decisión requerida del Founder
**Cuentas competidoras.** STR-01 manda a Accenture a C por ser competidor, pero Capgemini queda en A y EPAM en B.
- **A.** Tratarlas como cliente por la vía de la adopción interna y anotar la excepción en STR-01.
- **B.** Aplicarles la puerta de competidor y pasarlas a C.
- **C.** Esperar a que SAL-01 analice si son competidores o aliados.

**Recomendación:** A, coherente con las notas de PRX-0012. **Riesgo:** exponer IP; se mitiga con un NDA revisado por un abogado. **Esfuerzo:** bajo. **Fecha límite:** 2026-10-16.

```json
{"brief_id":"PRX-0014","owner":"QA-01","objective":"QA de 5 briefs de SAL-02","deliverable":"praxia/equipos/E8-gobierno/2026-10-09-PRX-0014-funnel/QA-01-briefs.md","evidence_and_sources":["PRX-0012 base-*.csv y notas","STR-01-tiers.md","SAL-02-top20.md"],"assumptions":["Tiers de DHL y EPAM calculados por QA-01"],"risks":["Fit_Acceso sin fuente","Tier de SAL-02 citado como PRX-0013"],"decisions_needed":["Cuentas competidoras A/B/C"],"next_owner":"SAL-02","review_status":"aprobado por QA con cambios"}
```
