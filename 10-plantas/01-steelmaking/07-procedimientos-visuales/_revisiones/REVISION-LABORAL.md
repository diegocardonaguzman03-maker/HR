# Revisión Laboral de los Procedimientos Operativos Visuales (POV) de la Acería

| Código | Versión | Estado | Alcance | Elaboró | Aprobó | Fecha |
|---|---|---|---|---|---|---|
| REV-LAB-POV-001 | 1.0 | Borrador para validación | 29 POV de operación (`json/MO-*.json`): EAF-01…08, OLL-01/02, LF-01, CC1-01…09, CC2-01…09 | experto-relaciones-laborales | **Pendiente: Director de C&D** | 2026-09-28 |

> **Mensaje clave para el Director.** Doy **visto bueno laboral** a los 29 POV: **26 con observaciones y 3 limpios**. **Ninguno queda "No aprobado"**. En los JSON no queda ningún sindicalizado con funciones de mando, autorización, disposición o firma de liberación: detienen, avisan y escalan (LFT art. 9). Corregí **61 campos** en 26 POV. Lo más importante: (1) **quité las 3 dobles A**: C-17 en EAF-02 y C-06 en CC1-04 y CC2-04 pasan a R; (2) **el mando queda visible**: donde el dueño es un ingeniero sin mando (C-07 o C-08), el supervisor de línea aparece como R; (3) **S-18 ya no "dispone" ni "libera"** en CC1-09: clasifica con la tabla y C-09 firma, igual que en CC2-09; (4) quité del POV CC2-09 una **frase disciplinaria** ("es una falta grave"); (5) **vigencias de 12 meses** para señaleros y operadores de grúa que faltaban (S-02, S-13, S-15, C-04, C-05). Quedan **5 decisiones** (§8). Las que más pesan son el **rol S-27**, porque hoy S-15 y S-17 (nivel N-3) operan grúas de 25 a 50 t, y el **escarpeo** sin código. **No se comprometió nada con el sindicato ni con la CMCAP.**

**Cómo entregué los cambios.** No edité ningún JSON. Hay un archivo por proceso en `_revisiones/laboral/<código>.json` (29 archivos, 61 cambios con su motivo). Probé con `node aplicar-revisiones.mjs --dry`: **0 errores**. Además apliqué los cambios en memoria y corrí `validate.mjs` sobre los 29 POV: **0 errores** (títulos ≤ 42, acciones ≤ 260, reglas de oro ≤ 110, preguntas de decisión y roles R/A de cada paso). No agregué ni borré pasos.

**Fuentes:** `ESPECIFICACION.md` (POV), `00-catalogo-procesos-y-roles.md` (CAT-ACE-001), `01-organizacion/descripciones-puesto-sindicalizados.md` (DP-ACE-S v0.2: §3 escalafón, §4 vigencias y uso de evaluaciones, §5 matriz), `descripciones-puesto-confianza.md` (DP-ACE-C v0.2: §0 convenciones, §4 matriz), `01-organizacion/REVISION-LABORAL.md` (REV-LAB-ACE-001), los 29 manuales MO (§2 roles, §8 pasos, §11 certificación), las IT de `06-instrucciones-trabajo/`, `04-processes/process-manual.md` (TD-P07) y `03-department-design/training-and-development-policy.md`. **Las referencias legales no están validadas: verificar con Jurídico Laboral.** No tengo el texto del CCT; donde aplica lo marco como **[CCT: pedir texto]**.

**Criterios que apliqué** (separando ley, CCT, lo negociable y lo recomendado):
- **Ley (LFT art. 9):** las funciones de dirección, vigilancia y fiscalización son de confianza. Un sindicalizado **ejecuta, detiene, avisa y escala**. No autoriza, no decide desviaciones, no dispone de producto y no firma liberaciones. Sí puede **firmar el registro de lo que él mismo hizo** (lista de entrega de olla, registro de secado, entrega de turno): es trazabilidad, no autorización.
- **Ley (arts. 153-U y 154–159):** la certificación TD-P07 prueba la aptitud del trabajador en **los pasos de su propio puesto**. Si evalúa pasos de otro puesto, puede discutirse en la CMCAP o en un ascenso.
- **Recomendado (DP-ACE-C §0):** un solo A por proceso, que es el dueño C-xx. R = hace cumplir en su ámbito, sea el supervisor de línea o el ejecutor sindicalizado. C = consultado. I = informado.
- **Recomendado (DP-ACE-S §4):** el material de capacitación no asigna responsabilidad disciplinaria. La sanción solo procede por el Reglamento Interior y el CCT.
- **Vigencias:** 12 meses para alturas, espacios confinados, grúas e izaje (incluye al señalero), trabajo eléctrico y fuentes radiactivas. **≤ 24 meses** para lo demás (TD-P07 y política de C&D).

---

## 1. Resultado por POV

| POV | Resultado laboral | Cambios | Qué se corrigió o qué queda observado |
|---|---|---|---|
| POV-EAF-01 | Visto bueno con observaciones | 4 | S-01 "libera el horno" → "avisa que el horno está listo". Se agrega **S-05 (I)**, que recibe el aviso del paso 18 del manual |
| POV-EAF-02 | Visto bueno con observaciones | 2 | **Doble A resuelta**: C-17 pasa de A a R (supervisa el patio); dueño único C-05 |
| POV-EAF-03 | Visto bueno con observaciones | 2 | C-05 pasa de C a R (mando visible; el dueño C-07 es ingeniero). **S-02 es R pero no está en el catálogo** |
| POV-EAF-04 | Visto bueno con observaciones | 3 | S-02 queda en **I** (catálogo, manual y DP) y su "does" ya no le asigna la medición. C-05 pasa de C a R |
| POV-EAF-05 | Visto bueno con observaciones | 2 | C-05 pasa de C a R (mando visible) |
| POV-EAF-06 | Visto bueno con observaciones | 2 | S-01 ya no "decide": confirma la hora de vaciado o ajusta según la consigna. **S-01 es R pero no está en el catálogo** |
| POV-EAF-07 | **Visto bueno** | 0 | — |
| POV-EAF-08 | Visto bueno con observaciones | 4 | S-01 ya no "libera el horno". Registro: "responsable" → "quién lo ejecutó". **S-02 señalero: 12 meses**. C-05 autoriza el método B de alturas: 12 meses. **S-01 es R pero no está en el catálogo** |
| POV-OLL-01 | Visto bueno con observaciones | 0 | **S-09 es R pero no está en el catálogo**. S-08 firma la lista de entrega de su propio trabajo; lo acepto (el retiro de la olla lo decide C-15) |
| POV-OLL-02 | Visto bueno con observaciones | 5 | S-06 "libera la olla" → "confirma la olla lista". S-09 "puede negarse" → "no la mueve y avisa a C-04". **C-04 evaluador de izaje: 12 meses**. **S-06 es R pero no está en el catálogo** |
| POV-LF-01 | Visto bueno con observaciones | 7 | S-06 ya no "libera": entrega la olla (título, check, regla de oro, fin del proceso). C-05 pasa de C a R |
| POV-CC1-01 | Visto bueno con observaciones | 4 | S-15 opera la grúa de 50 t **mientras no exista S-27**. Se agrega su **certificación de grúa (NOM-006, 12 meses)**, que el POV había omitido. S-13 se evalúa en sus propios pasos (16 a 18) |
| POV-CC1-02 | **Visto bueno** | 0 | — |
| POV-CC1-03 | Visto bueno con observaciones | 0 | **S-09 y S-11 son R pero no están en el catálogo** |
| POV-CC1-04 | Visto bueno con observaciones | 3 | **Doble A resuelta**: C-06 pasa de "A (turno)" a R; dueño C-08. Vigencia de C-08: de "—" a ≤ 24 meses. **S-11 es R pero no está en el catálogo** |
| POV-CC1-05 | Visto bueno con observaciones | 2 | S-13 como señalero de S-09 (pasos 2 y 15): **señales de izaje 12 meses**. **S-14 es R pero no está en el catálogo** |
| POV-CC1-06 | Visto bueno con observaciones | 1 | La certificación de S-13 distingue los pasos que ejecuta de los que solo debe conocer. **S-15 es R pero no está en el catálogo** |
| POV-CC1-07 | Visto bueno con observaciones | 0 | **S-16 y S-09 son R pero no están en el catálogo** |
| POV-CC1-08 | Visto bueno con observaciones | 1 | S-17 opera la grúa de 45 t **mientras no exista S-27** (su certificación de 12 meses ya estaba) |
| POV-CC1-09 | Visto bueno con observaciones | 11 | S-18 "Clasifica y dispone" → "Clasifica con la tabla". "Libera o retén" → "Registra el estado": sin desviación queda liberado; cualquier otra cosa queda retenida hasta que firme C-09. **Escarpador sin código**: queda como supuesto de S-18, pendiente de decisión, y se quita "contratista REPSE" del material para el trabajador. Evaluador nivel 4 según TD-P07. Vigencia de C-09. **S-11 y S-17 son R pero no están en el catálogo** |
| POV-CC2-01 | **Visto bueno** | 0 | — (S-15 opera la grúa de 50 t con su certificación de 12 meses; ver S-27) |
| POV-CC2-02 | Visto bueno con observaciones | 1 | S-14 "No liberes" → "Alto: avisa a C-06" (la liberación es de C-06) |
| POV-CC2-03 | Visto bueno con observaciones | 1 | Paso 2, alto de S-13: "no sigas y avisa a C-06". S-13 no vigila a otros trabajadores. **S-09, S-11 y S-16 son R pero no están en el catálogo** |
| POV-CC2-04 | Visto bueno con observaciones | 2 | **Doble A resuelta**: C-06 pasa de "A (turno)" a R; dueño C-08. **S-11 es R pero no está en el catálogo** |
| POV-CC2-05 | Visto bueno con observaciones | 0 | **S-11 es R pero no está en el catálogo**. El paso 2 dice "con señalero" sin decir quién (ver §6) |
| POV-CC2-06 | Visto bueno con observaciones | 0 | **S-12 y S-16 son R pero no están en el catálogo**. S-16 tampoco está en el manual §2 (sí en el §8) |
| POV-CC2-07 | Visto bueno con observaciones | 0 | **S-16 y S-09 son R pero no están en el catálogo**. S-09 tampoco está en el manual §2 (sí en el §8) |
| POV-CC2-08 | Visto bueno con observaciones | 1 | S-17 opera la grúa de 25 t **mientras no exista S-27** |
| POV-CC2-09 | Visto bueno con observaciones | 3 | Regla de oro sin "falta grave". Decisión del paso 5: "> 11: retén para rechazo (C-09)". Teoría de S-18: "clasificación" en lugar de "disposición". **S-11 y S-17 son R pero no están en el catálogo** |

**Totales:** 3 con visto bueno, 26 con visto bueno con observaciones, 0 no aprobados; 61 cambios.

## 2. Hallazgos

| # | Hallazgo | Tipo | Severidad | Estado |
|---|---|---|---|---|
| H-01 | **Dobles A** en EAF-02 (C-05 y C-17), CC1-04 y CC2-04 (C-08 y C-06). Los manuales §2 usan "A (patio)" y "A (turno)" | Consistencia / RACI | Alta | Corregido en los POV; falta corregir los manuales |
| H-02 | Donde el dueño A es un **ingeniero sin mando** (C-07 en EAF-03/04/05 y LF-01; C-08 en CC1-04 y CC2-04), el supervisor que dirige a los sindicalizados aparecía como C, o no quedaba claro. Sin un mando visible, en la práctica el S-01, el S-06 o el S-12 terminan dirigiendo | LFT art. 9 | Alta | Corregido: C-05 y C-06 pasan a R (DP-ACE-C = S). Hay que alinear los manuales §2 |
| H-03 | Verbos de autorización o disposición en sindicalizados: "libera el horno" (S-01, EAF-01 y EAF-08), "libera la olla" (S-06, LF-01 y OLL-02), "decide ajustes y hora de vaciado" (S-01, EAF-06), "clasifica y dispone" y "libera o retén" (S-18, CC1-09), "No liberes" (S-14, CC2-02) | LFT art. 9 | Media | Corregido (14 campos). El contenido técnico no cambia |
| H-04 | **Frase disciplinaria** en la regla de oro de CC2-09: "Liberar por presión de producción es una falta grave". Registro de EAF-08 con campo "responsable" | Riesgo laboral | Alta | Corregido |
| H-05 | **S-27 no existe**: S-15 (N-3) opera la grúa de 50 t en CC1-01 y CC2-01, y S-17 (N-3) las de 45 t y 25 t en CC1-08 y CC2-08. S-04 (N-5) y S-09 (N-6) hacen izajes comparables en un nivel más alto. En CC1-01 faltaba además la certificación de grúa | Escalafón / salario / seguridad | **Alta** | POV corregidos (cobertura provisional y certificación de 12 meses). **Decisión D-L1** |
| H-06 | **Escarpador sin código** en CC1-09. El POV decía "S-18 o contratista REPSE" en un material para el trabajador | Materia de trabajo / REPSE (arts. 12–15) | Alta | Queda como supuesto de S-18, sin mencionar al contratista. **Decisión D-L2** |
| H-07 | **25 casos de sindicalizados que ejecutan como R** en el manual o en el POV pero no están como ejecutores en el catálogo o en DP-ACE-S (§4). Si no se corrige, el plan DC-2 y la matriz de certificación los omiten, y su aptitud escalafonaria para ese proceso no queda registrada | Capacitación / escalafón | Alta | Se reporta. **Decisión D-L3** |
| H-08 | La matriz §5 de DP-ACE-S usa **"A" para un sindicalizado** por proceso (S-01, S-12, S-13, S-02…). En los POV la A es siempre el dueño C-xx. "A" (rinde cuentas y aprueba) en un sindicalizado se puede leer como función de confianza | LFT art. 9 / consistencia | Media | Se reporta. **Decisión D-L4** |
| H-09 | Vigencias que faltaban o estaban vacías: S-02 señalero (EAF-08), S-13 señalero (CC1-05), S-15 grúa (CC1-01), C-04 evaluador de izaje (OLL-02), C-05 que autoriza alturas (EAF-08); "—" en C-08 (CC1-04) y C-09 (CC1-09) | TD-P07 / criterio de 12 meses | Media | Corregido |
| H-10 | La certificación evaluaba a S-13 en pasos de otro puesto (CC1-01 paso 11 de S-15; CC1-06 pasos de S-15 y C-06). CC1-09 decía "inspector nivel 4", que podría ser un sindicalizado dictaminando a otro | Arts. 153-U y 159 / DP-ACE-S §3.3 | Media | Corregido |
| H-11 | Otras referencias a pasos compartidos: CC1-02 (S-12, paso 3), CC1-03 (paso 2), CC1-04 (paso 1), CC1-07 (S-12, paso 11), CC2-02 (S-14 paso 6; S-12 pasos 9 y 17), CC2-03 (S-12 paso 12; S-14 pasos 8 y 12), CC2-05 (S-12 paso 12), CC2-07 (S-14 paso 8), CC2-09 (S-18 paso 12), EAF-07 (S-01 paso 3), LF-01 (S-06 paso 9), OLL-01 (S-08 paso 3). En el manual son pasos compartidos entre dos puestos | Consistencia | Baja | Aceptado. Se pide a la revisión técnica que lo confirme |
| H-12 | El POV no explica al trabajador de nuevo ingreso que **la certificación no es una sanción**. La especificación no tiene un campo para eso, y el glosario ya se llena con las altas de la revisión de Usuario (algunos POV pasan de 10 términos) | Riesgo laboral / comunicación | Baja | No lo agregué al JSON. **Decisión D-L5** (nota fija en la plantilla) |
| H-13 | Los registros llevan el nombre de quien ejecuta ("inspector", "quién lo ejecutó", firmas de entrega). Sirven para la trazabilidad, pero son datos personales | Datos personales / uso de evidencia | Baja | Criterio: se usan para trazabilidad y formación, no como sanción (DP-ACE-S §4). Verificar con Jurídico Laboral |
| H-14 | EAF-01: S-03 tiene nivel 2 y "3 para suplir a S-02". Suplir a una categoría superior requiere certificación de nivel 3 y el pago que fije el CCT **[CCT: pedir texto]** | Escalafón / suplencias | Baja | Se reporta (tema N-3 de REV-LAB-ACE-001) |

## 3. Inconsistencias reportadas por los autores: cómo quedaron

| Inconsistencia | Resolución en los POV | Pendiente fuera del POV |
|---|---|---|
| S-27 (grúa de CC y producto) no existe; sus pasos los cubren S-15 y S-17 | Se deja S-15 o S-17 como ejecutor y su "does" dice "mientras se decide el rol S-27". Se agrega la certificación de grúa de S-15 en CC1-01 (NOM-006, 12 meses) | Catálogo §3 y **D-L1** |
| Escarpador sin código en MO-CC1-09 | Paso 10 y certificación: "[Supuesto: función de S-18, pendiente de decisión]". Se quita "contratista REPSE" | **D-L2**; catálogo §3; manual CC1-09 §2 y §11 |
| Doble A en EAF-02 (C-05 y C-17) | C-17 pasa a R (supervisa el patio) | Manual EAF-02 §2: quitar "A (patio)" |
| Doble A en CC1-04 y CC2-04 (C-08 y C-06) | C-06 pasa a R (supervisa el turno) | Manuales CC1-04 y CC2-04 §2: quitar "A (turno)" |
| S-16, S-09, S-14 y S-15 son R en el manual pero no en el catálogo | Se mantienen como R en el POV porque ejecutan pasos o izajes reales | Catálogo §2 y DP-ACE-S §5 (lista completa en §4). **D-L3** |
| S-18 "dispone" en MO-CC2-09 (se dejó que C-09 firma) | **Confirmo el criterio**: S-18 clasifica y retiene; C-09 firma la disposición. Se ajustó la decisión del paso 5 ("retén para rechazo"). **Se aplicó el mismo criterio a MO-CC1-09**, donde S-18 todavía "disponía" y "liberaba" | Manual CC1-09 §8 (pasos "Clasifica y dispone" y "Libera o retén") |
| S-02 R/I en MO-EAF-04 | Queda **I**, igual que en el catálogo, el manual y DP-ACE-S. No ejecuta pasos; se corrigió su "does" | Ninguno |
| S-05 en el paso 18 de MO-EAF-01 | Se agrega S-05 como **I** y el paso 17 del POV avisa a S-04 y S-05 | Manual EAF-01 §2, catálogo y DP-ACE-S: S-05 = I en MO-EAF-01 |

## 4. Cambios que requieren el catálogo, las DP, los manuales o el CCT

No los hice porque esos archivos están fuera de mi alcance en este encargo. Son propuestas para decisión.

**4.1 Catálogo CAT-ACE-001 §2, columna "Roles que ejecutan"** (y DP-ACE-S §5, de C o I a R). Hoy estos sindicalizados son R en el manual o en el POV pero no están en el catálogo:

| Proceso | Agregar como ejecutor | Letra actual en DP-ACE-S | Nota |
|---|---|---|---|
| MO-EAF-03 | S-02 | I | Mide la temperatura durante la alimentación |
| MO-EAF-06 | S-01 | C | Pide la medición, reduce la potencia y confirma el vaciado |
| MO-EAF-08 | S-01 | C | Desenergiza, bloquea y desliza |
| MO-OLL-01 | S-09 | I | Voltea la olla y la lleva al carro |
| MO-OLL-02 | S-06 | C | Confirma la olla lista |
| MO-CC1-03 / MO-CC2-03 | S-09, S-11 (y S-16 en CC2) | —, I, I | Olla en torreta, muestra, despunte |
| MO-CC1-04 / MO-CC2-04 | S-11 | C | Muestra de producto |
| MO-CC1-05 | S-14 | — | Mantiene el molde durante el cambio |
| MO-CC2-05 | S-11 | — | Muestra de la nueva colada |
| MO-CC1-06 | S-15 | C | Entrega la SEN y el distribuidor nuevo |
| MO-CC2-06 | S-12, S-16 | C, — | Velocidad fija; marca "C". S-16 falta también en el manual §2 |
| MO-CC1-07 / MO-CC2-07 | S-16, S-09 | I, I | Corte de cola; retiro de olla. En CC2-07, S-09 falta en el manual §2 |
| MO-CC1-09 / MO-CC2-09 | S-11, S-17 | I, C | Macroataque; separación física |
| MO-EAF-01 | S-05 como **I** | — | Aviso de horno listo |

**4.2 Manuales §2:** quitar "A (patio)" en EAF-02 y "A (turno)" en CC1-04 y CC2-04 (pasan a R). Poner C-05 como R en EAF-03, EAF-04, EAF-05 y LF-01. En el §8 de CC1-09, cambiar "dispone" y "libera" por "clasifica" y "registra"; el POV de CC2-09 ya tiene el criterio correcto. Cambiar "Libera" por "Avisa" o "Entrega" en EAF-01 (paso 18), LF-01 (paso 14) y OLL-02 (S-06).

**4.3 DP-ACE-S §5:** reemplazar la **"A" sindicalizada** por "R" (o "R*" = ejecutor principal) y dejar la A solo para el dueño C-xx, como en DP-ACE-C §0 (D-L4). Recalcular la fila R+A y los planes de formación de los ejecutores de §4.1.

**4.4 DP-ACE-C §4:** C-17 queda como S en EAF-02 (sin cambio). Confirmar C-05 como S en EAF-03, EAF-04, EAF-05 y LF-01 y C-06 como S en CC1-04 y CC2-04 (sin cambio). La diferencia está en los manuales, no en la DP.

**4.5 CCT [CCT: pedir texto]:** (a) la categoría y el nivel del operador de grúa de CC y producto (S-27), o el pago de categoría superior a S-15 y S-17 mientras operan grúas; (b) quién escarpa: materia de trabajo; (c) el pago de las suplencias de nivel 3 (S-03 → S-02); (d) las recertificaciones de 12 meses dentro de la jornada.

## 5. Temas para la CMCAP y el sindicato (preparados, no comprometidos)

| # | Tema | Foro | Posición propuesta | Beneficio para el trabajador |
|---|---|---|---|---|
| N-7 (ya abierto) | Crear el rol S-27 en lugar de que S-15 y S-17 operen grúas de 25 a 50 t | Sindicato | Categoría propia con su certificación NOM-006 de 12 meses | Nivel y salario que reconocen el riesgo del izaje; certificación con valor oficial (DC-3) |
| N-8 (ya abierto) | Escarpeo de planchón con personal propio (S-18 certificado o categoría nueva) | Sindicato | Preferir personal propio | Conserva la materia de trabajo |
| N-9 (nuevo) | Plan DC-2 2027: certificar a los R nuevos de §4.1 y las recertificaciones de 12 meses de señaleros (S-02, S-13) y operadores de grúa (S-15, S-17) | CMCAP | Dentro de la jornada, con constancia DC-3 | Constancias vigentes; más seguridad |
| N-10 (nuevo) | Criterio de firmas: el sindicalizado firma el registro de lo que hizo, no liberaciones ni disposiciones | Sindicato / CMCAP | Presentarlo como protección: la responsabilidad de liberar es del mando de confianza | Menos exposición a responsabilidades que no le tocan |

## 6. Puntos a verificar con Jurídico Laboral y con SSO

| # | Punto | Por qué |
|---|---|---|
| J-10 | Si S-15 y S-17 (N-3) operan grúas que en otras áreas opera S-04 (N-5), ¿hay riesgo de un reclamo de salario igual por trabajo igual (art. 86) o de un pago de categoría superior según el CCT? | Sustenta D-L1 |
| J-11 | Escarpeo: ¿forma parte del objeto social preponderante? Si es así, la subcontratación está prohibida (arts. 12–15, REPSE; es el mismo punto que J-8) | Sustenta D-L2 |
| J-12 | Alcance del art. 9 frente a un inspector sindicalizado (S-18) que "libera" producto con una tabla aprobada | Confirma el criterio aplicado en CC1-09 y CC2-09 |
| J-13 | Uso de registros con nombre (inspección, empalme, entrega) como evidencia; tratamiento de datos personales | Riesgo de que un registro de trazabilidad termine usándose como sanción |
| SSO-1 | La NOM-006 aplica al señalero; la vigencia de 12 meses aplica a S-02 (EAF-08) y a S-13 (CC1-05, OLL-02). En CC2-05 el paso 2 dice "con señalero" sin decir quién | Confirmar el criterio y completar el paso (revisión de Seguridad y Técnica) |

## 7. Revisión cruzada requerida

- **experto-operativo-metalurgia (técnica):** que confirme que los cambios de redacción no alteran el contenido técnico: EAF-06 paso 10, LF-01 paso 14, CC1-09 pasos 9, 10 y 15. Que confirme también las referencias a pasos compartidos de H-11 y la equivalencia B1…C13 de CC1-06. Queda por resolver quién dispone de las palanquillas sin marca en CC2-08 (C-06 en roles, C-09 en anormales).
- **experto-seguridad-salud:** vigencias de 12 meses de señaleros y operadores de grúa (H-09, SSO-1). Su revisión cambia la acción del paso 2 de CC2-03; mi cambio laboral quedó en el ALTO de ese paso, así que las dos revisiones no chocan.
- **experto-documentacion-mejora:** la nota fija sobre la certificación en la plantilla (D-L5). La revisión de Usuario lleva varios glosarios por encima del máximo de 10 términos que fija la especificación. Hay que actualizar el catálogo, los manuales §2 y DP-ACE-S (§4) después de las decisiones.
- **gerente-personal-sindicalizado:** el plan DC-2 2027 con los R nuevos (§4.1) y la carga de recertificación de 12 meses.
- **experto-liderazgo-cambio:** comunicar a S-01, S-06, S-12, S-13 y S-18 el criterio "ejecuta, detiene, avisa; el mando decide", y a C-05 y C-06 que aparecen como R con mando explícito.

## 8. Decisión requerida del Director

| # | Tema | Opciones | Recomendación | Riesgos | Costo | Fecha límite |
|---|---|---|---|---|---|---|
| **D-L1** | Operador de grúa de CC y producto (S-27). Hoy lo cubren S-15 y S-17 en 4 POV | **A.** Crear S-27 en CAT-ACE-001 (nivel propuesto N-5 [Supuesto]) y reclasificar a los S-15 y S-17 que hoy operan grúas. **B.** Mantener a S-15 y S-17 con certificación NOM-006 de 12 meses y pago de categoría superior según el CCT mientras operan. **C.** Dejarlo para la revisión del CCT | **A**, aplicando **B** como medida transitoria mientras se negocia | B sin pago: posible reclamo por el art. 86 (J-10). C: se mantiene una certificación de izaje en un nivel N-3 | ≈ 12–14 plazas N-5 [Supuesto], la mayoría por reclasificación de S-15 y S-17 (costo neto = diferencia de nivel, por calcular con Compensaciones). Formación: ≈ 40 h de curso NOM-006 por persona y ≈ 8 h/año de recertificación [Supuesto] | 2026-10-16 (cierre de la DNC y del plan DC-2 2027) |
| **D-L2** | Escarpeo de planchón (MO-CC1-09) | **A.** Asignarlo a S-18 con certificación de escarpeo (NOM-027), que es lo que dice hoy el POV. **B.** Crear una categoría propia de escarpador. **C.** Contratista REPSE | **A**, y evaluar **B** si la carga de escarpeo lo justifica | C: prohibido si el escarpeo es parte del objeto social (J-11); además, conflicto con el sindicato por la materia de trabajo | A: 16 h de teoría + 40 h de OJT por inspector certificado (manual §11) | 2026-10-16 |
| **D-L3** | Reconciliar el catálogo, DP-ACE-S y los manuales §2 con los R reales de los POV (§4.1 y §4.2) | **A.** Actualizar el catálogo y DP-ACE-S con todos los R y corregir los manuales (dobles A, C-05 y C-06 como R, S-05 como I). **B.** Degradar a C/I en el manual y el POV a los R que no ejecutan pasos (S-09 en EAF-07 y CC1-07; S-14 en CC1-05; S-17 en CC1-09), y actualizar el resto. **C.** Publicar la v0.1 de los POV con la diferencia documentada | **A** | C: el plan DC-2 no incluye las certificaciones de esos R y su aptitud escalafonaria no queda registrada | Horas internas (≈ 16 h entre los custodios) | 2026-10-09 (antes de publicar los PDF v0.1) |
| **D-L4** | Convención RACI de los sindicalizados en DP-ACE-S §5 (hoy hay un "A sindicalizado" por proceso) | **A.** Cambiarla a R o R* (ejecutor principal) y dejar la A solo para el dueño C-xx, como en los POV y en DP-ACE-C. **B.** Mantener la A con una nota que diga "sin funciones de mando". **C.** Sin cambio | **A** | B y C: los documentos se contradicen, y en una controversia "A" se puede leer como función de confianza (art. 9) | Horas internas | 2026-10-09 |
| **D-L5** | Mensaje al trabajador sobre qué es la certificación | **A.** Nota fija en la plantilla (sección de certificación): "Prueba que sabes hacer los pasos ★ de tu puesto; se registra con DC-3; si no apruebas, te reentrenan: no es sanción". La liga con el escalafón se agrega **solo** cuando se decida D-3 de REV-LAB-ACE-001 y la acuerde la CMCAP. **B.** Agregar también ya la liga con el escalafón. **C.** No poner nada | **A** | B: adelanta ante los trabajadores una posición que todavía no se negocia (compromete a la empresa). C: un nuevo ingreso puede percibir la evaluación como amenaza | ≈ 1 h (render.mjs) | Antes de la próxima generación de los PDF |

**Decisiones previas que siguen abiertas y afectan a los POV:** D-3 de REV-LAB-ACE-001 (liga certificación–escalafón) y D-5 (S-27 y escarpeo, que D-L1 y D-L2 detallan).

---

## 9. Resumen, archivos y decisiones pendientes

**Resumen (5 líneas):**
1. Visto bueno laboral a los 29 POV: 3 sin observaciones y 26 con observaciones; ninguno "No aprobado". 61 cambios en `_revisiones/laboral/`, con 0 errores de validación.
2. Ningún sindicalizado conserva funciones de mando, autorización, disposición o firma de liberación (LFT art. 9); se quitó la frase disciplinaria de CC2-09.
3. Un solo A por proceso (se resolvieron EAF-02, CC1-04 y CC2-04) y mando visible de C-05 y C-06 donde el dueño es un ingeniero.
4. Certificación coherente con TD-P07: 12 meses para grúas y señaleros, cada trabajador se evalúa en los pasos de su puesto y un evaluador nivel 4 no puede ser un sindicalizado que dictamine.
5. Pendiente: crear S-27, asignar el escarpeo, reconciliar el catálogo, DP-ACE-S y los manuales (25 R), y la convención de la "A" sindicalizada.

**Archivos creados:** `_revisiones/laboral/MO-*.json` (29) y `_revisiones/REVISION-LABORAL.md`. No se editó ningún JSON de `json/` ni otro documento.

**Decisiones pendientes del Director:** D-L1 a D-L5 (§8); D-3 y D-5 de REV-LAB-ACE-001; aprobación de esta revisión ("Aprobó" pendiente).
