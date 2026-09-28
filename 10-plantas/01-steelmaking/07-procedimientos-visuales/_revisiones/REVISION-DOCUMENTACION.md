# Revisión de Documentación y Lenguaje — 29 POV de la Acería

| Código | Versión | Estado | Revisó | Fecha | Alcance |
|---|---|---|---|---|---|
| REV-DOC-POV-ACE-01 | 0.1 | Borrador para aprobación del Director | experto-documentacion-mejora (Centro de Diseño, Plataformas y Datos) | 2026-09-28 | POV-EAF-01…08, POV-OLL-01/02, POV-LF-01, POV-CC1-01…09, POV-CC2-01…09, mapa 00-MAPA y manuales MO base |

> **Mensaje clave para el Director.** Doy **visto bueno de documentación con observaciones a los 29 POV**; **ninguno queda como "No aprobado"**. El formato es sólido: todos pasan `validate.mjs`, cada paso tiene rol, acción y *check*, y las IT y las presentaciones existen. Dejé **178 correcciones** en `_revisiones/documentacion/`, sin agregar ni borrar pasos. Las más importantes: (1) **un solo término por concepto** (DRI y no "HRD", "la HMI", arrestaflamas, sobrecalentamiento (SH), BOP, distribuidor, lista de entrega de la olla); (2) **frases de 20 palabras o menos** en 28 propósitos y 31 acciones; (3) **11 enlaces de la cadena anterior/siguiente** corregidos; (4) **glosario canónico** con los términos que una persona nueva no conoce (olla, HMI, nivel 2, planchón, palanquilla, línea, rastreo); (5) *checks* vagos ("Registro completo", "Sin alarmas") que ahora dicen qué evidencia se revisa. El control documental tiene **4 brechas que no se arreglan en el JSON**: el PDF no muestra fecha, dueño, próxima revisión ni control de cambios; la aprobación solo prevé al Director; el POV no dice qué versión del manual refleja; y los 29 manuales tienen **dos filas "0.1" en el control de cambios**. Quedan **4 decisiones** (§10).

## 1. Método
1. Leí ESPECIFICACION.md, la guía de estilo (00-guia-de-estilo-y-plantillas.md) y los 29 JSON completos.
2. Revisé con scripts: oraciones de más de 20 palabras, primera palabra de los títulos, *checks* sin evidencia, reciprocidad de `previous`/`next`, referencias "(paso N)" y los números de paso de la certificación contra el POV y contra el manual §8/§11.
3. Revisé visualmente 6 PDF de 5 áreas: POV-EAF-02, POV-EAF-07, POV-LF-01, POV-OLL-02, POV-CC1-03 y POV-CC2-05, más el mapa 00-MAPA (14 páginas).
4. Revisé el flujo completo EAF-07 → LF-01 → OLL-02 → CC1-03 (y su espejo en CC2) para buscar contradicciones.
5. Simulé la aplicación de **todas** las revisiones (documentación, usuario, laboral y seguridad) y corrí `validate()`: **0 errores**. También corrí `node aplicar-revisiones.mjs --dry`: 510 cambios y 0 errores.
6. Para no duplicar trabajo, **no agregué** al glosario términos que Usuario, Laboral o Seguridad ya agregan (se omitieron 23 altas).

## 2. Resultado por POV

Estado de todos: **Visto bueno con observaciones**. Tipos de cambio: P = propósito o "por qué importa" · A = acción · C = *check* · T = título · Ca = cadena · R = registros · G = glosario.

| POV | Cambios | Tipo | Observación principal |
|---|---|---|---|
| POV-EAF-01 | 7 | P, A, T, C, Ca | "el HMI" pasa a "la HMI"; acciones de más de 20 palabras; `next` + MO-EAF-08 (el paso 15 lo programa) |
| POV-EAF-02 | 5 | P, A, C, G | Aviso "EAF-x listo para carga" igual al de EAF-01; el paso 17 ("repite 7 a 16") es fiel al manual, pero el paso 7 no aplica a la 2.ª canasta (acción M-07) |
| POV-EAF-03 | 5 | P, A, C, G | Glosario DRI/HBI con el sinónimo **HRD**; *check* "Sin alarmas" ahora dice qué revisar |
| POV-EAF-04 | 9 | P, A, T, C, Ca, G | "O" suelto pasa a "oxígeno activo"; `next` + MO-EAF-03 y MO-EAF-05; el *check* del registro separa la condición de la referencia (560 kWh/t) |
| POV-EAF-05 | 6 | P, A, C, Ca, G | `previous` + MO-EAF-03 (su startsWhen ya lo cita); glosario: olla de escoria |
| POV-EAF-06 | 6 | A, C, G | *Check* medible del respaldo manual ("≤ 2 min en zona roja") y de la autorización (bitácora); glosario M1/M2/M3 |
| POV-EAF-07 | 11 | P, A, C, R, G | **"HRD" solo aparecía aquí**: pasa a DRI; "lista de entrega de la olla" igual que en OLL-01; registro de la olla recibida con el mismo nombre y lugar; se explica "VCC" |
| POV-EAF-08 | 5 | P, A, C, G | La referencia del método B (pasos 1–4, 7–11, 13 y 14) **sí** está bien mapeada del manual (1–3, 6–10, 12–13); solo se divide la frase |
| POV-LF-01 | 5 | P, A, G | La liberación (paso 14) ahora incluye bordo libre y "sin fuga", que OLL-02 paso 2 exige; glosario: bordo libre y olla |
| POV-OLL-01 | 4 | P, A, C | *Check* de la decisión de retiro: dónde queda y quién la firma |
| POV-OLL-02 | 6 | P, A, C, Ca, G | `next` + **MO-CC2-03** (la primera olla de CC2 también llega por aquí); glosario "LF (horno olla)" |
| POV-CC1-01 | 5 | P, A, C, G | Distribuidor con la definición canónica de CC1 |
| POV-CC1-02 | 3 | P, A, C | Sin hallazgos de fondo |
| POV-CC1-03 | 6 | P, A, T, G | Título "Si no abre: lancea…" pasa a "Lancea con O₂ si la olla no abre" (debe empezar con verbo); glosario: segmentos y rastreo |
| POV-CC1-04 | 6 | P, A, G | "SH" pasa a "Sobrecalentamiento (SH)", como en CC1-03 y CC1-05 |
| POV-CC1-05 | 10 | P, A, C, T, Ca, G | Mismo título que CC1-03 para el lanceo; `next` + MO-OLL-01; *check* "Lista de la olla OK" pasa a lo que se revisa |
| POV-CC1-06 | 5 | P, Ca, G | `next` + MO-CC1-07 (camino de cierre); BOP con la definición canónica |
| POV-CC1-07 | 4 | P, A, Ca, G | `next` + **MO-CC1-01** (el distribuidor usado vuelve a preparación) |
| POV-CC1-08 | 5 | P, A, C, G | "Arrestaflamas (antirretorno de llama)" igual que en CC2-08; glosario: planchón |
| POV-CC1-09 | 6 | P, A, C, G | *Checks* de hallazgos y reportes con evidencia. El paso 10 (escarpeo) queda con el texto de Laboral (ver §6) |
| POV-CC2-01 | 8 | P, A, C, G | Distribuidor con la definición canónica de CC2; glosario: palanquilla y línea (L1–L6) |
| POV-CC2-02 | 6 | P, A, C, G | Pasos 6 y 17 (C-16, ESR) estaban en tercera persona: pasan a segunda persona |
| POV-CC2-03 | 10 | P, A, Ca, G | `previous` + **MO-OLL-02** y startsWhen con el código, igual que CC1-03 |
| POV-CC2-04 | 4 | P, A, G | La acción del paso 5 era descriptiva ("La velocidad es un síntoma…") y pasa a imperativo |
| POV-CC2-05 | 5 | P, A, G | Glosario: LF, distribuidor y línea |
| POV-CC2-06 | 7 | P, A, C, Ca | **Nadie marcaba la palanquilla "B"** aunque está en registros y en el manual §7: el paso 10 ahora avisa a S-12; `previous` + MO-CC2-03 |
| POV-CC2-07 | 7 | P, C, Ca, G | `next` + MO-CC2-01 y `previous` + MO-CC2-06; *check* "Todos enterados" igual al de CC1-07 |
| POV-CC2-08 | 6 | P, A, C, G | Término único con CC1 (arrestaflamas) |
| POV-CC2-09 | 6 | P, C | El *check* "≤ 15 min" contradecía "de inmediato" y se unifica; *checks* de clasificación y gráfica con evidencia |

Además, en 29 POV quedaron uniformes "la HMI" y "[Validar con OEM]" (7 casos de "[Validar OEM]").

## 3. Hallazgos transversales

| # | Hallazgo (evidencia) | Criterio | Severidad | Estado |
|---|---|---|---|---|
| H-01 | **Términos distintos para lo mismo**: "HRD" (EAF-07 y el mapa) contra "DRI" en todo lo demás; "el HMI" (EAF, CC2-01/02) contra "la HMI" (guía, CC1); "antirretorno de llama" (CC2-08) contra "arrestaflamas" (CC1-08/09); "tracking" (CC1) contra "rastreo" (CC2); "SH" o "Sobrecalentamiento" con definiciones distintas; "O" contra "oxígeno activo" | Guía §1, ESPECIFICACION | Media | Corregido en los JSON. Falta el mapa (G-08) y el *stop* de CC2-08 paso 1, que dice "antirretorno" (campo de Seguridad) |
| H-02 | **Frases de más de 20 palabras**: 28 de 29 propósitos, 6 "por qué importa" y 31 acciones (de 463 pasos) | ESPECIFICACION, reglas de redacción | Media | Corregido en los campos que revisé. Usuario y Seguridad reescriben 5 de esos campos con frases largas (§6) |
| H-03 | **Cadena anterior/siguiente incompleta**: CC1-07 y CC2-07 no llevaban a la preparación del distribuidor; OLL-02 no llevaba a CC2-03 ni CC2-03 venía de OLL-02; EAF-05 y CC2-06 citaban un proceso en startsWhen que faltaba en `previous`; CC1-05 no llevaba a OLL-01 (CC2-05 sí) | Trazabilidad de la cadena | Media | Corregidos 11 enlaces. Los ciclos de regreso a "estado estable" (→ CC1-04 y CC2-04) quedan en un solo sentido a propósito |
| H-04 | **Glosario sin términos básicos**: ningún POV definía "olla", "HMI", "planchón", "palanquilla", "línea" ni "rastreo"; "nivel 2" solo estaba en EAF-07. Hay definiciones distintas del mismo término (distribuidor, BOP, SH) | Una persona nueva debe entenderlo | Media | Corregido con un glosario canónico. Con las altas de Usuario, **los glosarios quedan de 10 a 14 términos** (la especificación pide 5 a 10). Decisión D-1 |
| H-05 | ***Checks* que no se pueden verificar**: "Registro completo", "Sin alarmas", "Todos enterados", "MES al día", "Tendencias al día", "Línea en condición segura", "Sin exposición prolongada" | ESPECIFICACION: el *check* dice cómo sabes que está bien | Media | Corregidos 33 *checks* (incluye los que solo cambiaron de término). Los *checks* binarios observables ("Fosa seca y limpia", "La laina no entra") se dejan: son medibles |
| H-06 | **Contradicción entre manuales de CC2 sobre el vórtice**: el glosario de CC2-05 dice "baja de ≈ 500 mm" (manual MO-CC2-05 §3) y el de CC2-07 dice "≤ 300 mm" (manual MO-CC2-07 §3) | Coherencia técnica | Media | **No se cambia**: es un valor técnico. Pasa a Técnica y a los manuales (M-05) |
| H-07 | **Registros incompletos**: los formatos no tienen código ("Formato del turno", "Lista del operador", "Formato de máquina", "Patio"); ningún registro dice cuánto tiempo se guarda (solo CC1-04 lo pone como [Supuesto]); CC2-09 lista un "Certificado de calidad por colada" que ningún paso genera | ISO 9001 §7.5.3 / ISO 10015 | Media | Se unificó el registro de la olla (EAF-07 ↔ OLL-01). Lo demás, acción M-08 |
| H-08 | **Control documental del POV** (en el PDF): la portada no dice dueño, fecha de emisión ni próxima revisión; no hay tabla de control de cambios; "Documentos relacionados" no dice qué versión del manual refleja el POV; la aprobación prevé solo al Director | Plantilla del equipo; guía §3 (el manual pide "Gerente de Acería / Director") | **Alta** | No se corrige desde el JSON. Mejoras G-01 a G-04 y decisión D-2 |
| H-09 | **Presentaciones con marca ajena**: los 29 archivos se llaman `MO-XXX-NN_Capacitacion_AMMX.pptx` y la guía del instructor dice "estándar AMMX". El POV liga la carpeta, no el archivo | Control documental / identidad GASM | Media | Decisión D-3 |
| H-10 | **Numeración de certificación**: revisé todas las referencias "Pasos N" contra el POV. Están bien mapeadas, salvo que CC1-05 (S-13) cita los pasos 2 y 15, que ejecuta S-09, y omite su propio paso ★ 6. Hay filas duplicadas del mismo rol en CC1-09 (S-18) y CC2-01 (S-15) | Trazabilidad con el manual §11 | Baja | Pasa a Laboral (§6) |
| H-11 | **Marcas [Validar] genéricas**: 29 en los POV de CC2 (80 en los manuales de CC2) no dicen quién valida | Guía §1: [Validar con OEM / Ingeniería de Proceso] | Baja | Se respetó el manual; acción M-04 |

### Flujo EAF-07 → LF-01 → OLL-02 → CC1-03 (y su espejo CC2): sin contradicciones de fondo
- **EAF-07 → LF-01**: el fin (EBT cerrado y carro hacia el horno olla) coincide con el inicio de LF-01. Los datos que avisa EAF-07 (T, O, adiciones, escoria) son los que LF-01 lee en el paso 1.
- **LF-01 → OLL-02**: LF-01 liberaba la olla con "olla, colada, T y destino", pero OLL-02 paso 2 pide además "bordo libre ≥ 300 mm y sin fuga". **Corregido** en LF-01 paso 14.
- **OLL-02 → CC1-03**: el asiento en la torreta aparece en los dos POV (OLL-02 pasos 9 a 11 y CC1-03 paso 4), con el mismo criterio (asentada, gancho libre, señales de S-13). Es una interfaz, no una contradicción.
- **Temperaturas**: LF-01 (1.ª olla + 10–15 °C [Validar con C-08]), CC1-03 (líquidus + 25 a 35 °C) y CC1-04 (SH 20–30 °C) son coherentes entre sí.
- **Espejo CC2**: CC2-03 no tenía a OLL-02 como anterior. **Corregido**.

## 4. Observaciones para otros revisores (no las cambié: son campos suyos)

| Para | POV | Observación |
|---|---|---|
| Seguridad | CC2-08 paso 1 | El `stop` dice "antirretorno"; el término común es "arrestaflamas (antirretorno de llama)" |
| Seguridad | EAF-06 paso 13 | Su texto nuevo tiene una frase de 25 palabras. Propuesta: "Con arco apagado y EPP aluminizado completo, haz un solo intento [Supuesto] con observador. Párate de lado a la puerta, a ≥ 1.5 m, máximo 2 min en zona roja." |
| Seguridad | EAF-07 (anormal) | "Cierre de emergencia del EBT según el fabricante" no dice qué documento seguir: citar la instrucción OEM o el MS-ACE que aplique |
| Usuario | CC1-05, CC2-05, EAF-05 (propósito) y CC1-06 paso 15 (decisión) | Sus textos nuevos tienen frases de más de 20 palabras o la marca "[Validar OEM]"; deben quedar en "[Validar con OEM]" |
| Laboral | CC1-09 paso 10 | Su texto quita la marca del manual §7: debe decir "HSLA con Nb: planchón a ≥ 150 °C [Validar con OEM / Ingeniería de Proceso]" |
| Laboral | CC1-05 | La certificación de S-13 cita los pasos 2 y 15 (los ejecuta S-09) y omite su paso ★ 6. Propuesta: "Pasos 6, 8 y 11; señales a la grúa en los pasos 2 y 15" |
| Laboral | CC1-09 y CC2-01 | Hay dos filas de certificación para el mismo rol (S-18 y S-15): conviene unirlas |
| Laboral | CC2-02 y CC2-07 | C-16 (ESR) es R y no tiene IT; CC2-07 no tiene fila de certificación para C-06 ni para C-16 |
| Técnica | CC2-05 y CC2-07 | El vórtice empieza en ≈ 500 mm o en ≤ 300 mm (H-06) |

## 5. Mejoras al generador (no lo edité)

| # | Archivo | Mejora | Por qué |
|---|---|---|---|
| G-01 | render.mjs (portada y pie) | Mostrar el **dueño** (código y nombre del A), la **fecha de emisión**, la **próxima revisión** (+12 meses) y la **versión** en el pie de cada página. Nuevos campos del JSON: `issued`, `nextReview`, `manualVersion` | Control documental: una hoja suelta hoy no dice de qué versión y fecha es |
| G-02 | render.mjs §8 | Agregar la tabla **"Control de cambios"** (versión, fecha, cambio, autor), tomada de un campo `changes[]` o del `review[]` | La plantilla del equipo lo exige y el POV no lo tiene |
| G-03 | render.mjs §8 | Filas de aprobación configurables: dueño del proceso (A), Gerente de Acería (C-01) y Director de C&D | La guía §3 pone "Aprobó: Gerente de Acería / Director"; hoy el POV solo prevé al Director (D-2) |
| G-04 | render.mjs "Documentos relacionados" | Manual con código y **versión**; IT con **nombre del puesto**; nombre del **archivo** .pptx (no la carpeta); MS-ACE citados en los pasos | Trazabilidad POV ↔ manual ↔ IT ↔ presentación |
| G-05 | render.mjs (diagrama de carriles) | Dibujar la caja "Si es No" dentro del carril del mismo puesto o en un margen; hoy cae en la columna del puesto vecino (por ejemplo, en CC2-05 aparece en el carril de S-09). Subir la letra del encabezado de carril (hoy ≈ 5 pt) | Una persona nueva puede pensar que la acción "No" es del otro puesto |
| G-06 | render.mjs (paginación) | Evitar páginas casi vacías: la figura extra ocupa sola la pág. 3 de CC1-03 y 3 filas de anormales pasan a la pág. 7 | Menos hojas y mejor lectura en el piso |
| G-07 | validate.mjs | Agregar reglas: glosario de 5 a 10 términos y sin duplicados; título que empiece con verbo (no "Si"); aviso con frases de más de 20 palabras; "(paso N)" dentro del rango; un solo A; certificación sin roles repetidos; `records` con qué, cuándo y dónde; reciprocidad de la cadena principal | Que los errores de este informe no regresen |
| G-08 | mapa.mjs | Dibujar las flechas de la cadena con `previous`/`next` y no por orden de código: hoy dibuja **EAF-07 → EAF-08**, que no es el flujo, y trata CC1-05/06 y CC2-05/06 como pasos en serie cuando son eventos. Cambiar la etiqueta "chatarra y **HRD**" por "chatarra y DRI" | El mapa es la primera lámina que ve una persona nueva |
| G-09 | aplicar-revisiones.mjs | `--dry` **no debe escribir** `cambios-aplicados.tsv` (hoy lo sobrescribe; lo restauré con git). Registrar en el log cuando dos revisores cambian la misma ruta (el último gana en silencio) | Integridad del registro de cambios |

## 6. Acciones de mejora a los manuales MO (A3 breve)

**Problema.** Los POV se derivan de los manuales MO v0.1, que tienen inconsistencias de control documental y de contenido. Si no se corrigen antes de emitir los POV, el POV y su manual quedan distintos y la certificación TD-P07 evalúa pasos que el manual no marca como ★.

**Línea base (2026-09-28, medida con script sobre los 29 manuales):**
- 29 de 29 manuales tienen **dos filas "0.1" con la misma fecha** en §13: la segunda revisión no subió la versión.
- MO-CC1-08 §13 dice que "el §6 aún dice '50 t para > 17 t netas'", pero el §6 ya está corregido (grúa de 45 t con tenaza), y la corrección de Seguridad no está registrada. **El control de cambios está desactualizado.**
- 10 manuales citan en §11 pasos que **no tienen ★ en §8**: CC1-03 (14), CC1-09 (13), CC2-04 (5, 8, 9), CC2-05 (16), CC2-09 (9), EAF-03 (6), EAF-05 (9, 10), EAF-08 (1, 7) y LF-01 (3, 4, 7, 12). Además, §11 evalúa a un rol en pasos de otro: LF-01 (S-06 en el paso 9, que hace S-07) y EAF-08 (S-02 en los pasos 3, 6 y 12).
- MO-CC1-06 §8 numera los pasos A1…C13 (fuera de la plantilla).
- 80 marcas "[Validar]" sin responsable en los manuales de CC2.
- Citas mezcladas de la ficha: 10 citas a FT-ACE-001 v0.2 y 36 a v0.3 dentro de los mismos manuales.

**Causa raíz (5 porqués, resumido).** Las revisiones cruzadas (técnica, seguridad, laboral) se aplicaron sobre el mismo borrador sin una regla de versionado ni una lista de verificación de coherencia §8 ↔ §11 ↔ §13. Nadie tiene asignada la tarea de cerrar el control de cambios después de cada revisión.

**Meta.** Antes de emitir los POV v1.0: 29 de 29 manuales con versión única por revisión, §8 = §11 en pasos ★ y 0 marcas [Validar] sin responsable.

**Plan de acción (5W2H):**

| # | Qué | Manuales | Quién (propuesto) | Cuándo | Cómo | Evidencia |
|---|---|---|---|---|---|---|
| M-01 | Regla de versionado: cada revisión aprobada sube la versión (0.1 → 0.2); el "Aprobó" y la fecha se llenan en el encabezado | 29 | experto-documentacion-mejora (regla) + experto-operativo-metalurgia (autor) | 2026-10-09 | Instructivo corto de control documental del Centro | §13 con versiones únicas |
| M-02 | Actualizar el §13 de MO-CC1-08: quitar la nota pendiente y registrar la corrección de Seguridad del §6 | MO-CC1-08 | experto-seguridad-salud + autor | 2026-10-02 | Nueva fila 0.2 | §13 al día |
| M-03 | Alinear §8 y §11: marcar ★ en §8 los pasos que §11 evalúa, o quitarlos de §11; corregir la evaluación de pasos de otro rol | CC1-03, CC1-09, CC2-04, CC2-05, CC2-09, EAF-03, EAF-05, EAF-08, LF-01 | experto-operativo-metalurgia + experto-seguridad-salud | 2026-10-16 | Tabla §8 ↔ §11 por manual | 0 diferencias en el script de verificación |
| M-04 | Poner responsable a cada "[Validar]" (OEM, Ingeniería de Proceso, C-15, C-16, Laminación) | CC2-01 a CC2-09 | experto-operativo-metalurgia | 2026-10-16 | Buscar y reemplazar con criterio técnico | 0 marcas genéricas |
| M-05 | Resolver el vórtice (≈ 500 mm en CC2-05 contra ≤ 300 mm en CC2-07) y dejar un solo valor en los dos manuales | CC2-05, CC2-07 | experto-operativo-metalurgia con C-08 | 2026-10-09 | Revisión técnica | Glosario de CC2-05 y CC2-07 igual |
| M-06 | Citar la ficha técnica sin versión dentro del texto (o solo la vigente, v0.3) | Todos los que citan v0.2 | Autor | 2026-10-16 | Buscar y reemplazar | 0 citas a v0.2 |
| M-07 | MO-EAF-02 paso 17: aclarar que en la 2.ª canasta el "horno listo" lo da S-01 con la 1.ª canasta fundida ≥ 70 %, no con MO-EAF-01 | MO-EAF-02 | Autor | 2026-10-09 | Redacción | Paso 17 sin ambigüedad |
| M-08 | §10 Registros: dar código a cada formato (propuesta F-ACE-XXX-NN), dueño, lugar y tiempo de retención; en MO-CC2-09, decir qué paso emite el "certificado de calidad por colada" | 29 | experto-documentacion-mejora + dueños de proceso | 2026-10-23 | Lista maestra de registros de la Acería | Lista maestra aprobada |
| M-09 | MO-CC1-06: pasar la numeración A1…C13 a la numeración de la plantilla o documentar la excepción | MO-CC1-06 | Autor | 2026-10-16 | Redacción | §8 conforme a la guía §3 |
| M-10 | MO-CC2-06: decir en §8 quién marca la palanquilla "B" (hoy solo está en §7 y §10) | MO-CC2-06 | Autor | 2026-10-09 | Redacción | Paso con rol |
| M-11 | Unificar el formato de la "lista corta de pasos ★" (EAF: numerada; CC: casillas) | 29 | Autor | 2026-10-23 | Plantilla | Mismo formato |
| M-12 | Manuales §2 de EAF-02, CC1-04 y CC2-04: un solo A (Laboral ya lo corrigió en los POV) | 3 | experto-relaciones-laborales + autor | 2026-10-09 | Redacción | §2 = POV |

**Verificación.** Volver a correr los scripts de esta revisión (§8 ↔ §11, versiones de §13, marcas [Validar], citas de la ficha) sobre los manuales v0.2. Meta: 0 hallazgos.
**Estandarización.** Incluir la regla de versionado y la lista de verificación de coherencia en el procedimiento de control documental del departamento (TD-P12, custodio: experto-documentacion-mejora) y las reglas G-07 en `validate.mjs`.

## 7. Indicadores de la revisión

| Indicador | Línea base | Después de aplicar | Meta v1.0 |
|---|---|---|---|
| Propósitos con frases de ≤ 20 palabras | 1 de 29 | 29 de 29 en mis campos (26 si se aplican los textos de Usuario) | 29 de 29 |
| Acciones de paso con frases de más de 20 palabras | 31 de 463 | 0 en mis campos (1 con el texto de Seguridad) | 0 |
| Enlaces de la cadena principal que faltaban | 11 | 0 | 0 |
| Términos con dos nombres en los POV | 7 | 1 (el *stop* de CC2-08) | 0 |
| Manuales con control de cambios conforme | 0 de 29 | 0 de 29 | 29 de 29 |

## 8. Revisión cruzada que necesita este entregable
- **experto-operativo-metalurgia (Técnica):** H-06 (vórtice) y acciones M-03 a M-07 y M-09 a M-11.
- **experto-seguridad-salud:** las observaciones de §4 y la acción M-02.
- **experto-relaciones-laborales:** H-10, las observaciones de §4 y la acción M-12. Toca a personal sindicalizado solo en redacción: no cambié roles, RACI, EPP, *stops* ni anormales.
- **gerente-personal-sindicalizado (Usuario):** frases largas en sus propósitos; tamaño de los glosarios (D-1).

## 9. Archivos
- `_revisiones/documentacion/MO-*.json` (29 archivos, 178 cambios, *status* "Visto bueno con observaciones").
- Este informe.

## 10. Decisión requerida del Director

| # | Decisión | Opciones | Recomendación | Riesgo si no se decide | Costo | Fecha límite |
|---|---|---|---|---|---|---|
| D-1 | Tamaño del glosario del POV (hoy queda de 10 a 14 términos) | **A.** Máximo 10 por POV y un **Glosario de la Acería (GL-ACE-001)** único, anexo al mapa, del que salen todas las definiciones · **B.** Subir el límite a 14 en la especificación · **C.** Dejarlo así | **A**: una sola definición por término y una sola fuente que mantener | Definiciones que se contradicen entre POV y hojas más largas | ≈ 8 h del Centro [Supuesto] | 2026-10-05 |
| D-2 | Quién aprueba un POV | **A.** Dueño del proceso (A) + Gerente de Acería (C-01) + Director de C&D · **B.** Solo el Director de C&D (como hoy) · **C.** Solo el Gerente de Acería | **A**: el POV es un documento operativo de planta; la guía §3 ya pide al Gerente de Acería | Un POV aprobado solo por C&D puede no ser reconocido por Operación en una auditoría | Sin costo; ≈ 1 semana más de ciclo | 2026-10-05 |
| D-3 | Nombre y estándar de las presentaciones (`…_Capacitacion_AMMX.pptx`, "estándar AMMX") | **A.** Renombrar a `…_Capacitacion_GASM.pptx` y usar la plantilla GASM · **B.** Mantenerlo | **A**: la identidad de los materiales debe ser de GASM | Materiales con marca ajena en una inspección STPS o en una auditoría | ≈ 4 h para renombrar y religar [Supuesto] | 2026-10-12 |
| D-4 | Orden de emisión | **A.** Corregir los manuales (v0.2, acciones M-01 a M-12) y luego emitir los POV v1.0 con el generador mejorado (G-01 a G-04) · **B.** Emitir ya los POV v0.2 con las 4 revisiones aplicadas y corregir los manuales en paralelo | **A** para emitir; **B** solo para uso piloto en capacitación, marcado "no controlado" | Con B, el POV y el manual pueden decir cosas distintas en una evaluación TD-P07 | A: ≈ 3 semanas del autor y del Centro [Supuesto] | 2026-10-05 |

## 11. Control de cambios

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 0.1 | 2026-09-28 | Emisión para aprobación del Director | experto-documentacion-mejora |
