# Revisión de usuario (nuevo ingreso) — 29 POV de la Acería

| Campo | Valor |
|---|---|
| Documento revisado | POV-EAF-01…08, POV-OLL-01/02, POV-LF-01, POV-CC1-01…09, POV-CC2-01…09 (v0.1) y `pdf/00-MAPA-ACERIA-procesos-y-roles.pdf` |
| Revisión | Usuario nuevo ingreso (ESPECIFICACION.md, tabla "Revisión") |
| Revisor | gerente-personal-sindicalizado (Líder de la Academia de Mantenimiento y Confiabilidad; dueño de la capacitación sindicalizada) |
| Fecha | 2026-09-28 |
| Resultado | **Visto bueno con observaciones** en los 29 POV. 222 cambios en total en la simulación con `aplicar-revisiones.mjs --dry` (incluye los de otros revisores), 0 errores |
| Correcciones | `_revisiones/usuario/<código>.json` (29 archivos): **155 cambios de texto**, de los cuales 129 son términos nuevos de glosario y 26 aclaran textos. No cambian valores técnicos, roles, RACI, EPP ni condiciones de ALTO |

## Mensaje clave

**Una persona nueva sí entiende con los POV para qué sirve el proceso, qué hace en cada paso y cuándo detenerse. Todavía no sabe bien a quién avisar ni qué significan unas 120 palabras técnicas.** La base es buena: cada paso tiene un solo puesto, verbo en imperativo, un "Está bien si" medible y un ALTO observable. En las pruebas con los perfiles S-03 Tercer Hornero y S-14 Ayudante de Colada encontré cuatro barreras que frenan la lectura: siglas sin explicar, códigos de puesto sin nombre, el glosario al final y marcas [Supuesto] mezcladas con el valor. Las dos primeras se corrigen con los archivos de esta revisión; las otras dos requieren ajustar el generador y el mapa (sección 5). Para la inducción recomiendo la **opción B**: usar los POV desde la inducción y el OJT, con un piloto en noviembre (≈ MXN 221 mil el primer año, [Supuesto]).

---

## 1. Cómo se hizo la prueba

- **Perfiles:** hice la lectura en frío como **S-03 Tercer Hornero** (N-3, puesto de ingreso a Hornos) y como **S-14 Ayudante de Colada** (el puesto con más pasos ★ en colada), y como instructor que debe preparar el OJT y la evaluación TD-P07.
- **Material leído:** el mapa completo (14 págs.); 9 POV en PDF de todas las áreas: EAF-02, EAF-05, EAF-07, OLL-01, LF-01, CC1-03, CC1-05, CC2-03 y CC2-06 (a 50 dpi, además de la extracción de texto); y los 29 JSON campo por campo (`purpose`, `whyItMatters`, `roles[].does`, `goldenRules`, `steps[].action/check/stop/decision`, `abnormal`, `certification`, `glossary`).
- **Las 6 preguntas de la prueba:** (1) ¿Para qué es el proceso? (2) ¿Dónde está mi puesto? (3) ¿Qué hago en cada paso? (4) ¿Cómo sé que lo hice bien? (5) ¿Cuándo me detengo? (6) ¿A quién aviso? También revisé si las palabras técnicas estaban explicadas y si las reglas de oro se pueden memorizar.
- **Criterio:** "Sí" = un nuevo responde solo, sin preguntar; "Parcial" = responde, pero necesita que alguien le explique una sigla, un código o una notación.

## 2. Resultado de la prueba por POV

| POV | Para qué | Mi puesto | Qué hago | Cómo sé | Cuándo paro | A quién aviso | Términos agregados | Cambios principales de esta revisión |
|---|---|---|---|---|---|---|---|---|
| EAF-01 | Sí | Sí | Sí | Parcial | Sí | Parcial | 5 | HMI, nivel 2, LOTO, bóveda, coraza; "presión del horno (negativa)" |
| EAF-02 | Sí | Sí | Parcial | Sí | Sí | Parcial | 4 | Paso 16: dice qué POV abrir; bóveda, tap, zona de exclusión, LOTO |
| EAF-03 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | Consigna, rampa, afino, nivel 2, HMI |
| EAF-04 | Sí | Sí | Parcial | Sí | Sí | Parcial | 5 | Paso 4: la pregunta coincide con la respuesta "No"; llave cautiva, desbalance, escoria espumosa |
| EAF-05 | Parcial | Sí | Sí | Sí | Sí | Parcial | 6 | `purpose` en palabras de operador (se conservan los valores); fundentes, MgO, Nm³/h, baño plano |
| EAF-06 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | M1/M2/M3, ppm, HMI, nivel 2, zona roja |
| EAF-07 | Sí | Parcial (S-09 es R sin pasos) | Parcial | Sí | Sí | Parcial | 4 | Paso 6: "HRD" pasa a "DRI (HRD)"; argón, fosa, permisivos |
| EAF-08 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | LOTO, llave cautiva, torque, delta, señalero |
| OLL-01 | Sí | Sí | Sí | Sí | Sí | Parcial | 4 | Buza, pirómetro, termografía, NL/min |
| OLL-02 | Sí | Sí | Sí | Sí | Sí | Parcial | 4 | Anticolisión, límite superior, zona roja, LF |
| LF-01 | Sí | Parcial (S-11 es R sin pasos) | Parcial | Parcial (6 valores [Validar]) | Sí | Parcial | 4 | Paso 5: la acción dice "baja la bóveda"; breakout, HSLA, bajo C al Al, NL/min |
| CC1-01 | Sí | Sí | Sí | Sí | Sí | Parcial | 4 | "Casco del distribuidor" (no es el casco de EPP), LEL, vigía, espacio confinado |
| CC1-02 | Sí | Sí | Parcial | Sí | Sí | Parcial | 5 | Paso 8: explica la "prueba de arranque" del LOTO; segmentos, oscilación, cámara de rociado |
| CC1-03 | Sí | Parcial (3 `does` sin verbo; S-11 sin pasos) | Parcial | Parcial | Sí | Parcial | 4 | `does` de S-12, S-13 y S-14 con verbo; notación "menisco −60 mm" aclarada (pasos 11 y 13) |
| CC1-04 | Sí | Parcial (3 `does` sin verbo) | Parcial | Sí | Sí | Parcial | 4 | `does` de S-12, S-13 y S-14 con verbo; "peritécticos −0.2 m/min" en frase; regla de oro 3 sin flechas |
| CC1-05 | Parcial | Parcial (S-14 es R sin pasos) | Sí | Sí | Sí | Parcial | 4 | `purpose` y regla de oro 3 (700 / 500 mm) sin contradicción aparente |
| CC1-06 | Sí | Sí | Parcial | Sí | Sí | Parcial | 4 | Fases "Opción A: cambio de SEN" y "Opción B: cambio de distribuidor"; paso 15 dice qué pasa de 3 a 5 min |
| CC1-07 | Sí | Parcial (S-09 es R sin pasos) | Sí | Sí | Sí | Parcial | 4 | Paso 12: "Sin O₂" pasa a "No uses O₂"; escorial, segmentos, abombamiento |
| CC1-08 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | Carga caliente, escuadra, puente de corte, calzas, trazabilidad |
| CC1-09 | Sí | Parcial (S-17 es R sin pasos) | Sí | Sí | Sí | Parcial | 4 | Volteador, permiso en caliente, HSLA, MES |
| CC2-01 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | Paso 16: nombre de C-11 (no está en `roles[]`); L1–L6, pozo de buza, tara, plomada |
| CC2-02 | Sí | Sí | Parcial | Sí | Sí | Parcial | 4 | Paso 7: explica la "prueba de arranque"; LOTO, Cs-137, cebar |
| CC2-03 | Sí | Parcial (S-09 es R sin pasos) | Sí | Sí | Sí | Parcial | 4 | L1–L6, lancear, rotámetro, zona roja |
| CC2-04 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | Romboidad, pinholes, placa ciega, rotámetro, LIMS |
| CC2-05 | Parcial | Sí | Sí | Sí | Sí | Parcial | 5 | `purpose`: qué no baja de 500 mm; LF, lancear, radio de giro, nave de ollas |
| CC2-06 | Sí | Sí | Sí | Sí | Sí | Parcial | 4 | Rastreo, línea de expulsión, HMI, L1–L6 |
| CC2-07 | Sí | Parcial (C-16 es R sin pasos) | Sí | Sí | Sí | Parcial | 4 | L1–L6, menisco, EMS, Cs-137 |
| CC2-08 | Sí | Sí | Sí | Sí | Sí | Parcial | 5 | Antirretorno de llama, electroimán, estiba, pirómetro |
| CC2-09 | Sí | Sí | Sí | Sí | Sí | Parcial | 4 | Galga, flecha, LIMS, permiso en caliente |

**Lectura del cuadro.** "Cuándo paro" pasa en los 29 POV: cada ALTO es observable ("hay agua en la fosa") y el recuadro rojo lo destaca. "A quién aviso" queda en Parcial en los 29 POV por un problema del generador, que no se puede corregir en el JSON: el recuadro de ALTO dice "Detén y avisa", pero no dice a quién. Además, en `abnormal[].call` y en el texto de los pasos solo aparecen códigos (C-05, C-04, C-16) que un nuevo todavía no conoce.

## 3. Principales barreras de entendimiento

1. **Siglas y jerga sin explicar (la barrera más frecuente).** HMI, nivel 2, LOTO, NL/min, Nm³/h, ppm, LEL, HSLA, peritéctico, tracking/rastreo, MES, LIMS, L1–L6, Cs-137, tap y "prueba de arranque" aparecían sin definir. Agregué **129 términos** a los glosarios, con definiciones en lenguaje de operador y sin valores nuevos (cada glosario queda entre 10 y 12 términos).
2. **Códigos de puesto en lugar de nombres.** "Avisa a C-05 y C-16" obliga a buscar el código en la página 2. C-11 (CC2-01) ni siquiera está en la lista de roles del POV. En el JSON corregí el caso de C-11; el resto debe resolverlo el generador (mejora G-2).
3. **El glosario está al final (pág. 6), después de los pasos.** El nuevo se topa con las palabras antes de encontrar su definición. Hay que llevarlo al frente (mejora G-1).
4. **Marcas [Supuesto] y [Validar con OEM] dentro del valor.** En LF-01 hay 6 marcas en 10 pasos. Un nuevo no sabe si el número vale o no. Se deben conservar por regla, pero hay que mostrarlas como nota al pie con una leyenda (mejora G-3).
5. **Notaciones de ingeniero.** "Cabeza → menisco −60 mm", "Peritécticos (HSLA): −0.2 m/min", "tapón → extracción → olla → evacúa", "Sin O₂". Se reescribieron en frases, con los mismos valores.
6. **Fases que en realidad son alternativas.** En CC1-06, "Cambio de SEN" y "Cambio de distribuidor" parecían pasos seguidos. Se renombraron como Opción A y Opción B.
7. **Roles R sin pasos.** S-09 (EAF-07, CC1-07, CC2-03), S-11 (LF-01, CC1-03), S-14 (CC1-05), S-17 (CC1-09) y C-16 (CC2-07) aparecen como "R" sin pasos propios. En el mapa se ven como "participas", sin decir qué hacen. Esto es tema del RACI: lo turno a Laboral y Técnica, no lo cambié.
8. **Figura principal ilegible impresa.** Las figuras de `img/` son cortes de ingeniería con texto de 5–6 pt. A 50 dpi, y hasta en carta, no se leen (CC1-03 dedica la pág. 3 completa a una figura diminuta). Para un nuevo hace falta una vista simple (mejora G-4).

**Reglas de oro.** En general son memorizables: cortas, con una imagen concreta ("El agua bajo el metal líquido explota", "Olla fría, húmeda o fosa con agua = no se vacía"). Hay dos excepciones, ya corregidas: CC1-04 n.º 3, que usaba flechas, y CC1-05 n.º 3, que decía 700 mm y 500 mm en la misma frase. Recomendación de uso: que el instructor enseñe las 3 reglas de oro del POV como **primer y último minuto** de cada sesión y que se pregunten de memoria en la evaluación.

**`purpose`, `whyItMatters`, `does` y `check`.** `whyItMatters` es la parte más fuerte: dice la consecuencia en palabras de planta. `purpose` está bien en 26 POV; EAF-05, CC1-05 y CC2-05 se ajustaron. En `does`, 6 descripciones (CC1-03 y CC1-04) no tenían verbo y ya se corrigieron. `check` es medible en todos los pasos; solo EAF-01 (presión) y CC1-03 (notación) necesitaban aclaración.

## 4. Mapa y ruta de lectura por puesto: ¿sirve para la inducción y la certificación?

**Lo que funciona.** La portada ("Busca tu puesto → Sigue tu ruta → Certifícate"), el flujo del acero por áreas, la matriz puesto × proceso y el índice final por puesto son claros y ubican al nuevo en 5 minutos.

**Lo que hay que cambiar para usarlo en la inducción (TD-P08) y en la certificación (TD-P07):**

| # | Hallazgo | Propuesta |
|---|---|---|
| M-1 | La seguridad crítica (MS-ACE-01 y los MS citados) va **al final** de cada ruta | Ponerla **como paso 1**, antes de la IT, porque en TD-P08 la seguridad se ve en los días 3–5, antes del OJT |
| M-2 | Los roles que trabajan en varias áreas (S-09 en 4 áreas, S-11 en 4, S-13 y S-14 en CC1 y CC2) tienen su ruta partida en varias páginas | Una **ruta consolidada por puesto** en el índice final, en el orden en que se certifica |
| M-3 | "participas" no dice qué hace el puesto | Mostrar el texto de `does` del rol |
| M-4 | "1 pasos tuyos" | Concordancia: "1 paso tuyo" |
| M-5 | En los roles C sin IT aparece "Lee tu instrucción de trabajo — (tu turno completo)" | "Sin IT: usa tu descripción de puesto (DP)" |
| M-6 | La ruta no dice cuánto cuesta certificarse | Agregar por POV las horas de teoría, OJT, el nivel y la vigencia de `certification[]`, y el total del puesto. Ejemplo S-03 en Hornos: 28 h de teoría + 100 h de OJT (EAF-01, 07 y 08). S-14 en CC1: 54 h de teoría + 220 h de OJT, más eventos |
| M-7 | "Nivel 3" en el POV y "U" (ILUO) en las presentaciones de `05-capacitacion/` | Mostrar ambos, "Nivel 3 (U)", para que el instructor, el POV y el registro en IMaS/DC-3 digan lo mismo |
| M-8 | La caja "Patio" del flujo no lleva a ningún POV | Ligarla a POV-EAF-02 (la carga empieza en el patio) |
| M-9 | La ruta dice "N pasos tuyos", pero no cuáles | Poner los números de paso ("pasos 2 y 3") para que el nuevo vaya directo a sus tarjetas |

## 5. Mejoras propuestas al generador (descritas; no edité código)

| # | Mejora | Archivo | Por qué |
|---|---|---|---|
| G-1 | Mover "Palabras que vas a escuchar" a la pág. 1–2 (antes de los pasos) y marcar en negritas, dentro de las tarjetas, los términos que están en el glosario | `render.mjs` | Barrera 3 |
| G-2 | Expandir los códigos de puesto a "C-05 Supervisor de Hornos" en `abnormal[].call` y en el recuadro de ALTO: "Detén y avisa a **[rol A del proceso]**" | `render.mjs` | Pregunta 6 de la prueba (Parcial en los 29 POV) |
| G-3 | Mostrar [Supuesto] y [Validar con OEM] como superíndice "†", con la leyenda "valor de referencia por confirmar con Ingeniería antes de usar en planta" | `render.mjs` | Barrera 4; se conserva la marca que exige la especificación |
| G-4 | Permitir una "vista simple" de la figura principal (esquema grande con 3–5 rótulos) o ampliar la figura a una página con los rótulos legibles | `render.mjs` + `img/` | Barrera 8 |
| G-5 | Hoja opcional "Mis pasos en este POV" por puesto: las tarjetas del rol, sus ★, sus ALTO y a quién avisar. Es la hoja que usan el aprendiz y su padrino en el OJT | `render.mjs` | Liga directa con la bitácora OJT |
| G-6 | Agregar al checklist de bolsillo "Cuándo me detengo" (todos los `stop` del rol) y el canal de radio o el nombre del puesto al que se avisa | `render.mjs` | Hoy solo lleva los pasos ★ |
| G-7 | Tabla de certificación con ILUO y columna "Constancia DC-3 (curso)"; formato único de OJT "h / n eventos" (hoy se mezclan "6 cierres", "120 h", "40 h / 8 sellados") | `render.mjs` y JSON (Laboral/Documentación) | Planeación del OJT y del DC-3 |
| G-8 | Validador: glosario de 5 a 12 términos; aviso si una sigla en mayúsculas de los pasos no está en el glosario ni en un léxico común; `does` que empiece con verbo; "paso N" citado en `decision.no` que exista | `validate.mjs` | Evita que las barreras regresen |
| G-9 | Mapa: mejoras M-1 a M-9 | `mapa.mjs` | Sección 4 |

## 6. Cómo usar los POV en la inducción y en el OJT

| Etapa (TD-P08 / TD-P07) | Qué se hace con el POV | Quién | Horas por persona | Cómo se evalúa | Liga con DC-3 |
|---|---|---|---|---|---|
| **0. Inducción de sitio** (días 3–5; dentro de las 40 h de inducción de ingreso del DP) | Lectura del mapa: flujo del acero, "busca tu puesto", zonas rojas, reglas de oro de su área y MS-ACE-01 primero | Instructor técnico de la Academia de Acería (IN) + supervisor del área (C-05 / C-06) | 4 h (dentro de las 40 h) | Prueba de 15 min: ubicar su puesto, decir 3 reglas de oro y 3 ALTO de su área (≥ 80 %) | Se registra en la DC-3 de la inducción de seguridad |
| **1. Lectura guiada por POV** (semanas 2–4) | Por cada POV donde es R, en el orden de la ruta: `purpose`, carriles, sus tarjetas, ALTO y "si algo sale mal" | Instructor IN o padrino certificado (S-02 / S-13 en N-6 o más; guía técnica, sin mando, art. 9 — **verificar con Relaciones Laborales y CMCAP**) | 1 h por POV + 1 h de recorrido en campo ("señálame el equipo, la zona roja y a quién avisas") | "Explícame el POV": el aprendiz lo explica con el checklist de bolsillo en la mano | Forma parte de las horas de teoría de `certification[]` |
| **2. OJT supervisado** (semanas 4–12 o más, según el POV) | Bitácora OJT por número de paso del POV. Cada ★ se observa lo que diga `certification[].ojt` | Padrino / instructor; lo firma el supervisor del turno | Lo de `certification[]` (S-03: 100 h; S-14 en CC1: ≈ 220 h + eventos) | Bitácora completa; cada ★ al menos 3 veces sin corrección **[Supuesto]** | Horas y eventos de la bitácora = evidencia de la DC-3 |
| **3. Evaluación TD-P07** (≤ 15 días después del OJT) | Checklist = pasos ★ del POV (todos obligatorios) + 2 escenarios de `abnormal[]` + preguntas orales (reglas de oro, ALTO, a quién avisar) | Evaluador nivel 4 con formación de evaluador (pareja sindicalizado + confianza o C&D, según DP-ACE-S) | 1–2 h por POV | Competente / aún no competente. Si no es competente: retroalimentación y regreso al OJT. No se usa como sanción | **DC-3 por puesto y POV** (agente capacitador interno), carga en el LMS/IMaS en ≤ 48 h, lista DC-4 / SIRCE — **verificar con Jurídico Laboral** |
| **4. Mantener** | VCC mensual con el checklist de bolsillo; re-evaluación al vencer (12/24 meses) o si cambia el POV | Supervisor (VCC); C&D | 0.5 h/mes | Hallazgos de VCC → reentrenamiento | Nueva DC-3 al recertificar |

**Regla práctica para la sesión:** ninguna sesión de POV dura más de 2 h en aula. Se empieza y se termina con las 3 reglas de oro. El POV impreso se queda en la estación y el checklist de bolsillo se lo lleva el aprendiz.

## 7. Observaciones para otros revisores (no las cambié porque no son de mi área)

| POV | Observación | Para |
|---|---|---|
| CC1-06 paso 7 | "Está bien si ≤ 10 s sin flujo", pero la pregunta es "¿Cambió en ≤ 15 s?" | Técnica |
| EAF-02 paso 17 | "Repite los pasos 7 a 16": ¿debe empezar en el paso 8 (Prepara el horno)? | Técnica |
| CC1-01 paso 2 | "Restos de casco": ¿es la coraza o el acero solidificado (costra)? Agregué al glosario que "casco" aquí no es el EPP | Técnica |
| Todos | El recuadro de ALTO no dice a quién avisar (ver G-2) | Seguridad + Documentación |
| 9 POV (lista en §3, barrera 7) | Roles R sin pasos propios | Laboral |
| 17 POV | El glosario ya quedó en 12 términos (límite). Si Documentación agrega términos, primero debe quitar o fusionar | Documentación |
| CC2-08 | "Opera la grúa de producto (hoy sin código propio)" | Laboral |

## 8. Revisión cruzada que necesita este entregable

- **Relaciones Laborales (`experto-relaciones-laborales`):** padrinos sindicalizados en el OJT (guía técnica sin mando), uso de la evaluación TD-P07 como formación y no como sanción, DC-3/DC-4 y el acuerdo con la CMCAP.
- **Seguridad y Salud (`experto-seguridad-salud`):** que el recuadro de ALTO diga a quién avisar (G-2) y que la seguridad vaya primero en la ruta (M-1).
- **Documentación y Mejora (`experto-documentacion-mejora`):** cambios al generador, al mapa y al validador (G-1 a G-9), y el límite del glosario.
- **Operativo/Metalurgia (`experto-operativo-metalurgia`):** las 3 observaciones técnicas de §7 y la redacción de "menisco −60 mm" y "peritécticos".

## Decisión requerida del Director

**Tema:** cómo se usan los POV en la inducción y el OJT de los sindicalizados de la Acería, y si se ajustan el generador y el mapa antes de publicarlos.

| Opción | Qué incluye | Costo 1.er año (MXN) | Riesgos |
|---|---|---|---|
| **A.** Usar los POV como quedan tras las revisiones | Etapas 0–4 de §6 sin cambiar el generador | ≈ 164,000 **[Supuesto]**: tiempo de aprendices 77 ingresos × 4 h × 180 = 55,440; instructor 12 grupos × 4 h × 450 = 21,600; impresión de 29 POV × 20 juegos × 150 = 87,000 | Siguen las barreras 2, 3, 4 y 8 (a quién avisar, glosario al final, [Supuesto], figura ilegible). Más dudas en el OJT y en la evaluación |
| **B.** A + mejoras G-1 a G-9 y M-1 a M-9 + piloto con 10 ingresos (S-03 y S-14) en noviembre, midiendo la prueba de 15 min antes y después | Ajustes que hace el Centro de Diseño, Plataformas y Datos (TD-02 a TD-07); piloto en la inducción de noviembre; publicación general en diciembre | ≈ 221,000 **[Supuesto]**: A + 60 h de ajustes × 550 = 33,000 + piloto 10 × 6 h × 180 = 10,800 + 30 h de instructor × 450 = 13,500 | Retrasa un mes la publicación general. Depende de la carga del Centro de Diseño |
| **C.** B + POV digital en el LMS: microaprendizaje por POV, código QR en el equipo y video corto | 29 módulos e-learning + 29 videos | ≈ 800,000 **[Supuesto]**: B + 29 × 12,000 + 29 × 8,000 | Costo alto antes de validar los valores [Supuesto]/[Validar con OEM]: si cambian, hay que rehacer los videos |

**Supuestos de costo:** 77 ingresos al año (≈ 8 % de 963 plazas sindicalizadas de la Acería, más movimientos de escalafón); hora de aprendiz MXN 180, hora de instructor MXN 450 y hora de diseño MXN 550, con carga social. Todos son **[Supuesto]** hasta que Finanzas y Compensaciones den el dato real.

**Recomendación: opción B.** Resuelve la pregunta que hoy nadie contesta bien ("¿a quién aviso?"), cuesta ≈ MXN 57,000 más que A y deja medido el efecto antes de publicar en toda la Acería. C conviene cuando los valores del manual estén validados (2027).

**Decisiones secundarias ligadas a B:** (1) autorizar que los padrinos del OJT sean sindicalizados certificados en N-6 o más (requiere visto bueno de Relaciones Laborales y acuerdo en la CMCAP); (2) que la DC-3 se emita por puesto y POV (verificar con Jurídico Laboral).

**Fecha límite para decidir:** **2026-10-16** [Supuesto]. Así el Centro de Diseño alcanza a hacer los ajustes y el piloto entra con la inducción de noviembre.
