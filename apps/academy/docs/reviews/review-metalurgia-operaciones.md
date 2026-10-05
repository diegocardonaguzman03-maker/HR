# Revisión multidisciplinaria: METALLURGY y OPERATIONS. ACERÍA DIGITAL ACADEMY

| Campo | Valor |
|---|---|
| Revisores | ADX-02 Metalurgista EAF (METALLURGY REVIEW) · ADX-03 SME de Operaciones (OPERATIONS REVIEW). Custodio técnico de FT-ACE-001: experto-operativo-metalurgia |
| Fecha | 2026-10-05 |
| Alcance | `src/content/processes.json`, `equipment.json`, `work-instructions.json`, `training.json`, `questions.json`, `glossary.json`, `hazards.json` (solo exactitud técnica), `hotspots.json`, `documents.json`, `videos.json`; PDF de `public/documents/` (leídos con `pdftotext`); `docs/nodos-3d.md`, `scripts/build-eaf-glb.mjs`, `src/components/3d/anchors.ts` (solo la representación) |
| Referencias | D-010 y `10-plantas/00-cadena-de-valor/CV-GASM-001`; `10-plantas/01-steelmaking/00-ficha-tecnica-acería.md` (FT-ACE-001 v0.4, borrador) |
| Fuera de alcance | Veto de seguridad (ADX-04), accesibilidad y QA de video (ADX-11), código de la app. No se editó ningún archivo fuera de `docs/reviews/` |

## 1. Mensaje clave

El contenido está **bien hecho en lo que más importa**:
- **No hay ningún valor de planta suelto.** Ningún límite, setpoint, temperatura, presión, adición, parámetro de vaciado ni secuencia crítica aparece sin la marca `SME_REQUIRED` o `PLACEHOLDER`.
- **Es 100 % coherente con D-010:** DRI ≈ 95–100 % de HYL y Midrex por bandas y 5.º agujero, retornos internos ≤ 5 % y sin chatarra comprada.
- **Las 14 preguntas tienen respuesta correcta.**

Hay **un hallazgo HIGH en la representación 3D**: la puerta de escoria y el EBT quedan a 90° uno del otro. Un horno real los tiene en lados opuestos, sobre el mismo eje de basculamiento. Así, el modelo enseña al nuevo ingreso una geometría de línea de fuego que no existe.

Además hay hallazgos MEDIUM de precisión metalúrgica (la escoria espumosa se presenta como si fuera solo del afino, la definición de DRI y la señal de fuga por hidrógeno) y de operación (el orden de la WI DEMO y dos preguntas que se pueden interpretar de dos formas).

## 2. Dictamen

| Disciplina | Dictamen | Motivo |
|---|---|---|
| **METALLURGY** (ADX-02) | **APROBADO CON CONDICIONES** | Sin CRITICAL ni HIGH. Antes del piloto deben corregirse MET-01 a MET-04 (MEDIUM) y regenerarse los PDF afectados |
| **OPERATIONS** (ADX-03) | **APROBADO CON CONDICIONES** | OPS-01 (HIGH) debe corregirse o mitigarse según la decisión del Director (§6) antes de mostrar el 3D a personal en piloto. También deben corregirse OPS-02 a OPS-05 (MEDIUM) |

### Renglón para la tabla de validación

| Área | Dictamen | Condiciones |
|---|---|---|
| Metalurgia y Operaciones (ADX-02 / ADX-03) | APROBADO CON CONDICIONES | (1) Corregir MET-01…MET-04 y OPS-02…OPS-05 con el texto de este informe. (2) Resolver OPS-01: reubicar el EBT al lado opuesto de la puerta de escoria en `build-eaf-glb.mjs`, `anchors.ts` y las cámaras de `processes.json` (opción A), o como mínimo poner un rótulo visible de «disposición esquemática» (opción B). (3) Regenerar `eaf.glb` y los PDF (`guide-electrode-melting`, `wi-` y `jobaid-electrode-system-check`). (4) Correr `check:content`. Los LOW son recomendaciones y no bloquean el piloto |

## 3. Verificaciones solicitadas

| # | Verificación | Resultado |
|---|---|---|
| 1 | Exactitud metalúrgica y operativa general | Correcta en general. Se encontró la escoria espumosa ubicada solo en el afino (MET-01/02), la definición de DRI simplificada (MET-03), la señal de fuga por «color de llama» (MET-04) y la disposición del 3D (OPS-01) |
| 2 | Valores de planta sin marca | **Ninguno.** Se corrió `grep -nE "[0-9]+ ?(°C\|bar\|kV\|MVA\|MW\|kA\|%\|kg\|t/h\|min)"` y otra búsqueda amplia de dígitos en todos los JSON y PDF. Solo aparecen: los % de D-010 (contexto aprobado por el Director, correcto); **610 mm** (`eq.electrodes › operationalNotes[0]`) y **140 MVA** (`eq.transformer › operationalNotes[0]`), los dos atribuidos al borrador FT-ACE-001, con `SME_REQUIRED` en la misma frase y coherentes con FT-ACE-001 v0.4 §2 (ver MET-08); y ordinales y números de paso. Ninguna temperatura, presión, flujo, tasa, ángulo ni adición |
| 3 | Consistencia con D-010 | **Consistente** en `processes`, `equipment`, `training`, `questions`, `glossary`, PDF y 3D: el 3D tiene banda y chute de DRI, no tiene patio de chatarra y no muestra la canasta como carga normal |
| 4 | Respuesta correcta inequívoca | Las 14 tienen la clave correcta (se verificaron `correctOrder` de q.orientation-1 = [2,4,0,3,1] y de q.electrode-4 = [1,3,4,0,2]). Dos admiten una lectura doble (OPS-04 y OPS-05) |
| 5 | Terminología en español de México | Buena. Hay términos mezclados: «bóveda» del transformador frente a la bóveda del horno, «mástil (columna)», «taps» frente a «derivaciones» y «Job aid» (OPS-07 a OPS-10) |

## 4. Tabla de hallazgos

Severidad: CRITICAL = valor de planta inventado o instrucción insegura · HIGH = enseña algo engañoso con impacto en seguridad u operación · MEDIUM = imprecisión técnica o ambigüedad que confunde al aprendiz · LOW = estilo, terminología o mejora.

### 4.1 METALLURGY (ADX-02)

| ID | Sev. | Archivo › ruta JSON | Hallazgo | CORRECCIÓN PROPUESTA EXACTA (texto de reemplazo) |
|---|---|---|---|---|
| MET-01 | MEDIUM | `training.json › mod.electrode-melting › lessons[3] (les.electrode-melting-4) › body[2]` (se repite en `guide-electrode-melting.pdf`, p. 3) | «Después, la escoria espumosa…» hace creer que la espuma llega al final. Con 95–100 % DRI sobre pie líquido, la escoria espumosa se forma y se mantiene durante **casi todo el arco en baño plano**. Es la condición normal de la fusión, no un paso posterior. También contradice `processes.json › stage.melt › variables[3]` | `"Desde que hay baño plano, la escoria espumosa se mantiene durante casi toda la fusión: cubre el arco, protege paneles y bóveda y ayuda a aprovechar mejor la energía."` |
| MET-02 | MEDIUM | `training.json › mod.eaf-orientation › lessons[2] (les.eaf-orientation-3) › body[2]` | «En el afino se forma escoria espumosa» deja la espuma solo en el afino (mismo error que MET-01) | `"La escoria espumosa se forma desde la fusión y se mantiene durante el afino: cubre el arco y protege el horno. Al final, el acero sale por el EBT (vaciado excéntrico por el fondo) hacia la olla."` |
| MET-03 | MEDIUM | `glossary.json › [1] (term "DRI") › definition` (se repite en `guide-electrode-melting.pdf`, glosario) | «se le quitó **el** oxígeno» es inexacto. El DRI no está 100 % reducido: trae FeO, carbono y ganga. Esa es la razón por la que la metalización y la ganga son variables clave (`stage.raw › variables[0]` y `[2]`) | `"Hierro de reducción directa: pelet de mineral de hierro al que se le quitó la mayor parte del oxígeno sin fundirlo. Trae hierro metálico, algo de óxido de hierro (FeO), carbono y ganga (la parte no metálica del pelet). En GASM es la principal carga del EAF (≈ 95–100 %)."` |
| MET-04 | MEDIUM | `equipment.json › [11] eq.cooling › observableSignals[1]` | «Llama de color distinto en el 4.º agujero (hidrógeno)» no es una señal confiable: la llama de H₂ es poco visible. Los indicadores reconocidos son la subida de H₂ en el análisis de gases y el vapor o la llama anormal | `"Subida de hidrógeno (H₂) en el análisis de gases, si existe, o vapor o llama anormal en el 4.º agujero"` |
| MET-05 | LOW | `equipment.json › [12] eq.fume › dependencies[3]` | «finos de DRI se van al 4.º agujero» suena a que ese es su camino normal. En realidad los finos se separan antes. Si entraran por el 5.º agujero, la succión los llevaría al 4.º (FT-ACE-001 §2.1) | `"eq.dri-feed (si entran finos de DRI por el 5.º agujero, la succión los arrastra al 4.º agujero y a la casa de bolsas; por eso se separan antes)"` |
| MET-06 | LOW | `processes.json › stage.raw › variables[1] › why` | Lo de que el DRI de HYL tiene más carbono que el de Midrex es una regla general, no una ley; depende de la práctica de cada planta | `"Por lo general, el DRI de HYL trae más carbono que el de Midrex. La mezcla define cuánto oxígeno y carbono habrá que usar en el horno."` |
| MET-07 | LOW | `equipment.json › [13] eq.dri-feed › components[1] › function` | «de forma seca e inertizada» se presenta como hecho del diseño. En FT-ACE-001 está como [Validar con OEM], y `stage.raw › dependencies[2]` dice «según diseño de la planta» | `"Almacenan el DRI seco y protegido de la reoxidación (inertización según el diseño de la planta; SME_REQUIRED: confirmar con OEM / Reducción Directa)."` |
| MET-08 | LOW (observación; no requiere cambio) | `equipment.json › [2] eq.electrodes › operationalNotes[0]` y `[4] eq.transformer › operationalNotes[0]` | 610 mm y 140 MVA son datos de diseño (no operativos), atribuidos al borrador y con `SME_REQUIRED` en la misma frase. Coinciden con FT-ACE-001 v0.4 §2 y con el diámetro del 3D (0.6 m). Se aceptan. Si el Director prefiere cero cifras de planta en el MVP, este es el reemplazo | Electrodos: `"Electrodos de grafito UHP con niples cónicos (el borrador FT-ACE-001 trae diámetro y tipo de niple). SME_REQUIRED: diámetro, grado y tipo de niple confirmados con el proveedor de electrodos y la OEM."` · Transformador: `"El borrador FT-ACE-001 describe un transformador con cambiador de derivaciones bajo carga (OLTC). SME_REQUIRED: potencia nominal, tensiones secundarias, tabla de derivaciones y corrientes validadas por OEM e Ingeniería Eléctrica."` |
| MET-09 | LOW | `glossary.json` (términos nuevos) | Faltan dos términos que usa `processes.json › stage.raw` y que un nuevo ingreso no conoce | Agregar: `{"term":"Metalización","definition":"Porcentaje del hierro del DRI que ya está como hierro metálico. Si baja, el horno necesita más energía y genera más escoria. El valor de recepción lo define la planta: SME_REQUIRED.","status":"GENERAL_EDUCATIONAL"}` y `{"term":"Ganga","definition":"Parte no metálica del pelet y del DRI (principalmente sílice y alúmina). Se va a la escoria y obliga a usar más cal y más energía.","status":"GENERAL_EDUCATIONAL"}` |

### 4.2 OPERATIONS (ADX-03)

| ID | Sev. | Archivo › ruta | Hallazgo | CORRECCIÓN PROPUESTA EXACTA |
|---|---|---|---|---|
| OPS-01 | **HIGH** | `scripts/build-eaf-glb.mjs` (bloques «08 puerta de escoria», «09 vaciado EBT y fosa», «plataforma», cuna basculante y cilindros de basculamiento) · `src/components/3d/anchors.ts › ANCHORS.eaf__ebt, EXPLODE.eaf__ebt` · `processes.json › stage.tap › camera`, `stage.secondary › camera` | **La disposición contradice la práctica general.** La puerta de escoria está en +z y el EBT en +x, a **90°** uno del otro. En un EAF real están en **lados opuestos sobre el mismo eje**: el horno bascula hacia adelante para vaciar y hacia atrás para desescoriar. El propio contenido lo dice (`eq.shell › howItWorks[2]`). Además, las cunas basculantes del modelo (arcos en z = ±1.6) implican basculamiento hacia ±x, lo que dejaría la puerta de escoria del lado de los mástiles. El nuevo ingreso aprendería una ubicación falsa de la línea de fuego del vaciado y del desescoriado | **Opción A (recomendada):** dejar mástiles y transformador en −x, la puerta de escoria y el púlpito en +z y **mover el EBT y la fosa a −z**. En `build-eaf-glb.mjs` reemplazar el bloque 09 por: `add('eaf__ebt', box(1.8, 1.5, 1.4), 'shell', [0, Y0 + 1.0, -3.7]);` · `add('eaf__ebt', box(1.9, 0.12, 1.5), 'steel', [0, Y0 + 1.8, -3.75]);` · `add('eaf__ebt', cyl(0.3, 0.3, 0.3, 20), 'refractory', [0, Y0 + 1.9, -3.95]);` · `add('eaf__ebt', cyl(0.22, 0.18, 0.7, 20), 'refractory', [0, Y0 + 0.0, -3.95]);` · `add('eaf__ebt_pit', lathe([[0, 0.3], [1.35, 0.3], [1.55, 1.5], [1.7, 2.7], [1.85, 2.75]], 40), 'steel', [0, 0, -4.0]);` · `add('eaf__ebt_pit', box(2.6, 0.3, 3.2), 'hydraulic', [0, 0.15, -4.0]);` · `add('eaf__ebt_pit', torus(1.72, 0.08), 'steel', [0, 2.2, -4.0], [Math.PI / 2, 0, 0]);`. En la plataforma, reemplazar las 4 primeras líneas por: `add('env__platform', box(20, Y0, 13), 'concrete', [-3, Y0 / 2, 4.5]);` · `add('env__platform', box(11, Y0, 9), 'concrete', [-7.5, Y0 / 2, -6.5]);` · `add('env__platform', box(5, Y0, 9), 'concrete', [4.5, Y0 / 2, -6.5]);` (deja el hueco x ∈ [−2, 2], z ∈ [−11, −2] para la fosa y el carro de olla; eliminar la rejilla `grating`). Girar las cunas basculantes a los planos x = ±1.6 (eje de basculamiento paralelo a x) y mover los cilindros de basculamiento a z = ±2.6. Mover los barandales de z = ±11 a x = 7 para que no crucen la fosa. En `anchors.ts`: `eaf__ebt: [0.9, 1.5, -4.3]` y `EXPLODE.eaf__ebt: [0, 0, -2.2]`. En `processes.json`: `stage.tap.camera = {"position":[6,5,-12],"target":[0,1,-4]}` y `stage.secondary.camera = {"position":[10,7,-14],"target":[0,1,-4]}`. Regenerar con `npm run model` y verificar `check:content`. **Opción B (mínima):** mantener la geometría y agregar en el visor 3D el rótulo permanente `"Modelo esquemático: la posición relativa de la puerta de escoria y del EBT no es la real. En el horno, la puerta de escoria y el EBT están en lados opuestos; el horno bascula hacia uno para desescoriar y hacia el otro para vaciar."` |
| OPS-02 | MEDIUM | `work-instructions.json › wi.electrode-system-check › steps[1]` y `steps[2]` (y `documents.json › doc.jobaid-electrode-system-check › description`, más los PDF `wi-` y `jobaid-`) | La secuencia no es práctica: primero se toma la posición segura en piso (paso 2) y luego se va al púlpito a revisar la HMI (paso 3), para volver a piso en el paso 4. En la práctica, las alarmas se revisan en el púlpito **antes** de salir a piso | Intercambiar el contenido de `steps[1]` y `steps[2]` y renumerar `n`: el paso 2 pasa a ser «Revisa en el púlpito las señales del sistema» y el paso 3, «Ubícate en la posición segura asignada». Las referencias al «paso 9 (ALTO)» no cambian. En `doc.jobaid…description`: `"Tarjeta de una página con la secuencia corta de la revisión (autorización → púlpito → posición segura → columnas → juntas → brazos → circuito secundario → registro → ALTO → entrega) y casillas para marcar. Lleva la marca DEMO CONTENT."` |
| OPS-03 | MEDIUM | `work-instructions.json › wi.electrode-system-check › steps[2] › action` (paso del púlpito) | En una pausa con baño en el horno, lo primero que confirma un operador de púlpito es que la **alimentación de DRI está detenida** y que no hay alarmas de **agua**. Si el 5.º agujero sigue alimentando con el arco apagado, se forma DRI sin fundir (`eq.dri-feed › commonMistakes[0]`). La WI no lo menciona | `"Junto con el operador del púlpito, revisa en la HMI las alarmas activas y el estado reportado de transformador, interruptor, regulación de electrodos, hidráulica de brazos, agua de enfriamiento (paneles, brazos y cables) y alimentación de DRI por el 5.º agujero (debe estar detenida mientras el arco está apagado). Anota las alarmas que veas. SME_REQUIRED: lista de pantallas, alarmas y señales que la planta exige revisar, y su interpretación aprobada."` |
| OPS-04 | MEDIUM | `questions.json › q.orientation-2 › prompt` | Pregunta con doble lectura: «el equipo por el que entra el DRI (el 5.º agujero de la bóveda)». El 5.º agujero está en la bóveda (`eaf__roof`), y quien haga clic en la bóveda tendrá un error aunque haya entendido el concepto | `"En el modelo 3D, haz clic en el sistema de alimentación continua de DRI: la banda y el chute que bajan hasta el 5.º agujero de la bóveda."` |
| OPS-05 | MEDIUM | `questions.json › q.safety-3 › pairs[0] › right` | Las respuestas de los pares 0 y 1 se parecen: «equipo aislado y bloqueado» y «bloqueo y liberación de energía (LOTO)». Las dos sirven para la energía eléctrica, así que el emparejamiento no es inequívoco | `"Respetar la zona restringida y no acercarse mientras el horno esté energizado"` |
| OPS-06 | LOW | `work-instructions.json › wi.electrode-system-check › steps[3] › action` | «puntas rotas»: con la bóveda cerrada, la punta queda dentro del horno y no se ve desde la posición segura. Solo se ve si la columna está arriba y fuera del horno | Cambiar `"o puntas rotas."` por `"o puntas rotas (la punta solo se ve si la columna está arriba y el procedimiento lo permite)."` |
| OPS-07 | LOW | `equipment.json › [5] eq.secondary-circuit › summary` · `questions.json › q.electrode-2 › explanation` | «bóveda del transformador» se confunde con la **bóveda** del horno, que es la tapa (glosario). Para un nuevo ingreso son dos cosas distintas con el mismo nombre | En `summary`: cambiar `"a la salida de la bóveda del transformador"` por `"a la salida de la casa del transformador"`. En la `explanation`: cambiar `"Suele estar en una bóveda o cuarto separado, junto al horno."` por `"Suele estar en un cuarto separado (casa del transformador), junto al horno."` |
| OPS-08 | LOW | `equipment.json › [3] eq.electrode-arms › components[1] › name` y `howItWorks[2]` · `glossary.json › [22] Mástil` | «Mástil (columna)» choca con «columna de electrodo» | `name`: `"Mástil y rodillos guía"`. `howItWorks[2]`: `"El brazo está fijo a un mástil que corre sobre rodillos guía; un cilindro hidráulico lo sube o baja."`. Glosario: `"Poste vertical que, con un cilindro hidráulico, sube y baja el brazo portaelectrodo. No confundir con la columna de electrodo."` |
| OPS-09 | LOW | `glossary.json › [26] Cambiador de taps` · `training.json › les.electrode-melting-1 › body[1]` · `questions.json › q.electrode-5 › pairs[2] › left` | Se usan dos nombres: «cambiador de taps» (glosario, lección, pregunta) y «cambiador de derivaciones bajo carga (OLTC)» (equipos). Conviene unificarlos | Glosario `term`: `"Cambiador de derivaciones (taps) bajo carga, OLTC"`. Lección: `"El cambiador de derivaciones (taps) ajusta la tensión de salida según la etapa de la colada."`. Pregunta `left`: `"Cambiador de derivaciones (taps)"` |
| OPS-10 | LOW | `questions.json › q.electrode-4 › items[3]` | «Cables flexibles y barras» invierte el orden físico (barras → cables) en una pregunta que trata justamente del orden | `"Barras y cables flexibles del circuito secundario"` (la clave `correctOrder` no cambia) |
| OPS-11 | LOW | `documents.json › doc.jobaid-electrode-system-check › title` | «Job aid» es un anglicismo; el contenido debe estar en español de México | `"Tarjeta de apoyo (DEMO): revisión del sistema de electrodos"` |
| OPS-12 | LOW | `scripts/build-eaf-glb.mjs` (bloque 07: lanza y carbono por la puerta, `eaf__oxygen_lance` / `eaf__oxygen_carbon` hacia z = 2.6–2.7) | El 3D muestra como hecho una lanza o un manipulador por la puerta y el inyector de carbono por la puerta. El contenido dice `SME_REQUIRED: confirmar si existe lanza móvil por la puerta` (`eq.oxygen-carbon › movements[0]`) y FT-ACE-001 solo describe 4 quemadores/lanzas de pared | Agregar a `eq.oxygen-carbon › howItWorks` el texto `"En el modelo 3D se dibujan una lanza y un inyector por la puerta solo como ejemplo; SME_REQUIRED: confirmar con la OEM si existen en la planta."`, o quitar esas dos piezas del bloque 07 |
| OPS-13 | LOW | `videos.json › vid.melt-overview › captions` | `public/videos/melt-overview.vtt` no existe, así que no se pudo revisar la narración. Se envía a ADX-11 | Crear el `.vtt`. Cuando exista, ADX-02/03 revisan el texto con los mismos criterios |
| OPS-14 | LOW | `equipment.json › [8] eq.ebt › howItWorks[1]` | La secuencia de apertura se ve correcta como descripción general, pero conviene decir que es general, porque el orden real de basculamiento y apertura es un parámetro de vaciado | `"Al vaciar, el horno se inclina hacia el EBT, se abre la compuerta y la arena cae; el acero empieza a fluir. (Secuencia general; el orden, los ángulos y los tiempos reales los fija el procedimiento aprobado: SME_REQUIRED, MO-EAF-07 en borrador.)"` |

## 5. Lo que está bien y debe conservarse

- La estructura de `processes.json`: cada variable tiene «por qué importa» y un `SME_REQUIRED` que dice quién da el valor (C-07, C-09, C-05, C-16, OEM). Es el patrón correcto.
- Los riesgos propios del DRI están bien explicados: reoxidación y autocalentamiento en silos, H₂ con humedad, finos, falta de carga de respaldo (no hay chatarra) y la relación entre la tasa de DRI y la potencia (icebergs).
- La regulación de electrodos por impedancia, la mordaza que cierra por resortes, el OLTC y las protecciones (Buchholz) están descritos de forma correcta y sin cifras.
- La WI DEMO tiene un paso de ALTO, escalamiento en cada paso y la decisión de reanudar en manos del supervisor. Es correcto para un nuevo ingreso.
- El 3D: mástiles y transformador del mismo lado (circuito secundario corto), 4.º agujero hacia la casa de bolsas, banda de DRI hacia el 5.º agujero, púlpito con vista a la puerta y electrodos de ≈ 0.6 m. Todo coherente con FT-ACE-001.

## 6. Decisión requerida del Director

**Tema:** OPS-01, la disposición puerta de escoria–EBT en el modelo 3D.

| Opción | Descripción | Costo / esfuerzo | Riesgo |
|---|---|---|---|
| **A** | Reubicar el EBT y la fosa en el lado opuesto a la puerta de escoria (coordenadas en OPS-01), regenerar el GLB y ajustar anclas y cámaras | ≈ 0.5–1 día de ADX-09 y una corrida de `check:content` y e2e. Sin costo externo [Supuesto] | Bajo. Hay que revisar que la cámara y el hotspot del EBT queden visibles |
| **B** | Mantener la geometría y agregar un rótulo de «disposición esquemática» | ≈ 1 h | Medio. El aprendiz retiene la imagen más que el texto, y la línea de fuego del vaciado se enseña mal |
| C | No hacer nada | 0 | Alto. Contradice el propio contenido (`eq.shell › howItWorks[2]`) y la práctica de la industria |

**Recomendación:** opción **A** antes de cualquier piloto con personal de nuevo ingreso. Si el calendario no lo permite, aplicar B como medida temporal y A en el siguiente incremento.
**Fecha límite sugerida para decidir:** antes de congelar el contenido del piloto (propuesta: 2026-10-12).

## 7. Revisión cruzada requerida

- **ADX-04 / experto-seguridad-salud:** OPS-01 (línea de fuego del vaciado y del desescoriado), OPS-03 (alarmas de agua en la WI) y MET-04 (señal de fuga de agua).
- **ADX-09 (3D):** aplicar OPS-01 y OPS-12.
- **ADX-06 / ADX-07 / ADX-11:** aplicar los textos, regenerar los PDF y crear el `.vtt` (OPS-13).
- **experto-documentacion-mejora:** control de versión del contenido y de los PDF regenerados.
- Los cambios no tocan condiciones laborales, así que no requieren revisión de Relaciones Laborales.

## Re-revisión (2026-10-05)

Revisores: ADX-02 (METALLURGY) y ADX-03 (OPERATIONS). Se revisaron `src/content/*.json`, `scripts/build-eaf-glb.mjs`, `src/components/3d/anchors.ts`, `scripts/capture-media.mjs`, `scripts/build-documents.mjs`, `public/videos/melt-overview.vtt` y los 4 PDF de `public/documents/` (con `pdftotext`). `npm run check:content` en verde: 23 preguntas y 215 campos `SME_REQUIRED`.

**Mensaje clave:** los 23 hallazgos de la revisión anterior están cerrados en la fuente. OPS-01 (HIGH) quedó resuelto con la opción A: EBT en −z y puerta de escoria en +z, sobre el mismo eje de basculamiento. Solo hay un cierre parcial (OPS-08, LOW). Lo que falta es **regenerar lo derivado**. Los PDF (15:59) se construyeron con las imágenes anteriores a la reubicación del EBT (las de `public/images/` se recapturaron a las 16:07). El video se está regenerando. Las 9 preguntas `q.asm-*` son correctas, tienen una sola respuesta y no traen valores de planta.

### R.1 Estado de los hallazgos anteriores

| ID | Sev. | Estado | Evidencia |
|---|---|---|---|
| MET-01 | MEDIUM | CERRADO | `les.electrode-melting-4 › body[2]` = «Desde que hay baño plano, la escoria espumosa se mantiene durante casi toda la fusión…»; aparece igual en `guide-electrode-melting.pdf` |
| MET-02 | MEDIUM | CERRADO | `les.eaf-orientation-3 › body[2]` = «La escoria espumosa se forma desde la fusión y se mantiene durante el afino…» |
| MET-03 | MEDIUM | CERRADO | Glosario «DRI»: «…se le quitó la mayor parte del oxígeno… FeO, carbono y ganga…»; aparece igual en el glosario del PDF |
| MET-04 | MEDIUM | CERRADO | `eq.cooling › observableSignals[1]` = «Subida de hidrógeno (H₂) en el análisis de gases, si existe, o vapor o llama anormal en el 4.º agujero» |
| MET-05 | LOW | CERRADO | `eq.fume › dependencies[3]` tiene el texto propuesto |
| MET-06 | LOW | CERRADO | `stage.raw › variables[1] › why` = «Por lo general, el DRI de HYL trae más carbono…» |
| MET-07 | LOW | CERRADO | `cmp.dri-feed-silos › function` dice «inertización según el diseño de la planta; SME_REQUIRED…» |
| MET-08 | LOW | CERRADO | Se aplicó el reemplazo sin cifras: ya no aparecen 610 mm ni 140 MVA en `eq.electrodes` ni en `eq.transformer` |
| MET-09 | LOW | CERRADO | El glosario tiene «Metalización» (con `SME_REQUIRED` y su dueño) y «Ganga» |
| OPS-01 | **HIGH** | **CERRADO en la fuente** (los derivados siguen pendientes: OPS-16 y OPS-17) | `build-eaf-glb.mjs`: el bloque 09 tiene el EBT en z = −3.7 a −3.95 y la fosa en z = −4.0; la puerta de escoria está en z = +3.32 a +3.7; las cunas están en los planos x = ±1.6 (eje de basculamiento paralelo a x); los cilindros de basculamiento están en z = ±2.6; la plataforma deja el hueco x ∈ [−2, 2], z ∈ [−11, −2]; el barandal está en x = 6.9; ya no hay rejilla. `anchors.ts`: `eaf__ebt: [0.9, 1.5, -4.3]` y `EXPLODE.eaf__ebt: [0, 0, -2.2]`. `processes.json`: las cámaras de `stage.tap` y `stage.secondary` son las propuestas. Ningún texto de contenido conserva la disposición a 90° (grep de «+x», «derecha» y «90°»). `src/assets/eaf.glb` se regeneró a las 15:55, después del script |
| OPS-02 | MEDIUM | CERRADO | En la WI, el paso 2 es «Revisa en el púlpito…» y el paso 3, «Ubícate en la posición segura…»; la `description` del job aid lleva la secuencia nueva. Los dos PDF (WI y tarjeta) muestran el orden nuevo |
| OPS-03 | MEDIUM | CERRADO | `steps[1] › action` incluye el agua de enfriamiento y la «alimentación de DRI por el 5.º agujero (debe estar detenida mientras el arco está apagado)» |
| OPS-04 | MEDIUM | CERRADO | El texto de `q.orientation-2` es distinto al propuesto, pero equivalente: «…la banda y el chute que bajan hasta la bóveda». Ya no invita a hacer clic en la bóveda y la respuesta es `eq.dri-feed` |
| OPS-05 | MEDIUM | CERRADO | El texto de `q.safety-3 › pairs[0] › right` también es distinto: «No entrar a la zona restringida sin autorización y permiso». Ya no se confunde con el par 1 (brazo o bóveda) |
| OPS-06 | LOW | CERRADO | El paso 4 de la WI agrega «(la punta solo se ve si la columna está arriba y el procedimiento lo permite)»; también aparece en el PDF |
| OPS-07 | LOW | CERRADO | Dice «casa del transformador» en `eq.secondary-circuit › summary` y en la `explanation` de `q.electrode-2` |
| OPS-08 | LOW | **ABIERTO (parcial)** | El componente ya se llama «Mástil y rodillos guía» y `howItWorks[2]` está corregido. **El glosario «Mástil» todavía dice «Columna vertical…»**, que es justo la confusión con «columna de electrodo» |
| OPS-09 | LOW | CERRADO | El glosario, `les.electrode-melting-1` y `q.electrode-5` dicen «Cambiador de derivaciones (taps)» |
| OPS-10 | LOW | CERRADO | `q.electrode-4 › items[3]` = «Barras y cables flexibles del circuito secundario» |
| OPS-11 | LOW | CERRADO | El título es «Tarjeta de apoyo (DEMO)…»; no queda «Job aid» en los PDF |
| OPS-12 | LOW | CERRADO | Se quitaron la lanza y el inyector que entraban por la puerta (comentario OPS-12 en el bloque 07); `eq.oxygen-carbon › howItWorks[5]` aclara qué muestra el 3D y lleva `SME_REQUIRED`. Ver OPS-15 sobre el ancla |
| OPS-13 | LOW | CERRADO | `melt-overview.vtt` existe y su texto es correcto: [DEMO], D-010 (HYL + Midrex por bandas y 5.º agujero), tasa de DRI = `SME_REQUIRED`, escoria espumosa sin ubicarla en una sola etapa y la nota «no sustituye la capacitación en piso». No trae cifras. Los capítulos coinciden con `videos.json` |
| OPS-14 | LOW | CERRADO | `eq.ebt › howItWorks[1]` incluye «(Secuencia general; … SME_REQUIRED, MO-EAF-07 en borrador.)» |

### R.2 Revisión de las 9 preguntas `q.asm-*` y de `asm.eaf-electrode`

| Pregunta | Correcta | Inequívoca | Distractores | Sin valores de planta | Comentario |
|---|---|---|---|---|---|
| q.asm-stages-1 (order 2,4,3,1,0) | Sí | Sí | n/a | Sí | Coincide con MET-01/02: la espuma acompaña al arco y sigue en el afino. Los ítems 4 («Empieza a entrar carga») y 3 («funde… de forma continua») se distinguen por «empieza» y «continua»; se acepta |
| q.asm-energy-1 (3,1,4,0,2) | Sí | Sí | n/a | Sí | Transformador → barras → cables → mordazas → punta. Es coherente con `q.electrode-4` |
| q.asm-zone-1 | Sí | Sí | — | Sí | La pista «rígida y flexible» separa el circuito secundario de los brazos |
| q.asm-arms-1 | Sí | Sí | — | Sí | La función descrita (sostener, apretar, subir y bajar) solo corresponde a `eq.electrode-arms` |
| q.asm-regulation-1 | Sí | Sí | Buenos (el OLTC es el error típico) | Sí (setpoints = `SME_REQUIRED`) | — |
| q.asm-stored-1 (crítica) | Sí | Sí | Buenos (el D, «aviso y cruzo», es muy plausible) | Sí | Ajuste menor de redacción en OPS-18 |
| q.asm-water-1 (crítica) | Sí | Sí | Buenos (el D, «aparto y anoto al final», es plausible) | Sí | Bien relacionada con el riesgo propio del DRI (H₂, reoxidación) |
| q.asm-signals-1 (crítica) | Sí | Sí | Buenos | Sí | — |
| q.asm-control-1 | Sí | Sí | — | Sí | Redacción ambigua sobre cómo se avisa (OPS-19) |

`assessments.json`: las 3 preguntas críticas son las de energía almacenada, agua y señal anormal, y la elección es correcta. `q.electrode-6` no cuenta para la calificación. Las 10 recomendaciones apuntan a lecciones que existen. El `passScore` es un parámetro de la app, no de la planta.

### R.3 Hallazgos nuevos

| ID | Sev. | Ruta | Hallazgo | CORRECCIÓN EXACTA |
|---|---|---|---|---|
| OPS-15 | LOW | `src/components/3d/anchors.ts › ANCHORS.eaf__oxygen` = `[1.0, 2.6, 5.6]` | Al quitar la lanza de la puerta (OPS-12), el hotspot de O₂/carbono quedó flotando frente a la puerta de escoria, donde ya no hay ninguna pieza. Así vuelve a sugerir una lanza por la puerta | `eaf__oxygen: [3.0, 2.5, 2.1],` (sobre la lanza de pared a 35°: `cos35°·3.7`, `Y0+2.45−Y0`, `sin35°·3.7`). En `EXPLODE.eaf__oxygen`, `[1.6, 0, 1.2]` (radial, hacia fuera de esa lanza) |
| OPS-16 | MEDIUM | `public/videos/melt-overview.webm` (`scripts/capture-media.mjs`) | El `.webm` del repositorio es de las 15:45 y se grabó con el GLB anterior (15:55): las tomas de 0 a 10 s, desde (25, 15, 27), muestran el EBT en +x, a 90° de la puerta. A las 16:08 se estaba regenerando (archivo a medias, sin commit) | Esperar a que termine `npm run media` (después de `npm run model`) y verificar visualmente que el EBT aparezca del lado opuesto a la puerta. No subir un `.webm` truncado |
| OPS-17 | MEDIUM | `public/documents/*.pdf` (`scripts/build-documents.mjs`, `img('overview' / 'section' / 'electrodes' / 'secondary')`) | Los 4 PDF son de las 15:59 y traen incrustadas (base64) las PNG anteriores a la recaptura de las 16:07. El texto está correcto, pero las imágenes de vista general y de corte llevan la disposición vieja del EBT | Correr, en este orden, `npm run model`, `npm run media` y `npm run docs:pdf`. Verificar que la fecha de cada PDF sea posterior a la de `public/images/*.png` |
| OPS-18 | LOW | `questions.json › q.asm-stored-1 › explanation` | «carga suspendida» describe mal el brazo: está guiado y sostenido por hidráulica, no colgado | Cambiar `"Nadie se pone debajo de una carga suspendida, aunque avise."` por `"Nadie se pone debajo de un brazo, de la bóveda ni de otro equipo que pueda bajar, aunque avise."` |
| OPS-19 | LOW | `questions.json › q.asm-control-1 › prompt` | «Ahí avisas, junto con tu supervisor» se puede leer como «ve al púlpito con tu supervisor». En piso se avisa por radio (WI, paso 9) | `"En el modelo 3D, haz clic en el cuarto con vista al horno desde donde se vigila y conduce la operación. Si ves algo anormal en piso, avisas a este cuarto y a tu supervisor por radio o por el medio que marque la planta."` |
| OPS-08 (resto) | LOW | `glossary.json › term "Mástil" › definition` | Sigue pendiente la parte del glosario | `"Poste vertical que, con un cilindro hidráulico, sube y baja el brazo portaelectrodo. No confundir con la columna de electrodo."` |

### R.4 Dictamen nuevo

| Disciplina | Dictamen | Motivo |
|---|---|---|
| **METALLURGY** (ADX-02) | **APROBADO** | MET-01 a MET-09 están cerrados en el JSON y en los PDF. Las `q.asm-*` son metalúrgicamente correctas y no traen ningún valor de planta |
| **OPERATIONS** (ADX-03) | **APROBADO CON CONDICIONES** | OPS-01 (HIGH) y OPS-02 a OPS-05 están cerrados en la fuente. Antes del piloto deben regenerarse el video y los PDF con el GLB nuevo (OPS-16 y OPS-17, MEDIUM). Los LOW (OPS-08 resto, 15, 18 y 19) no bloquean |

### R.5 Renglón para la tabla de validación

| Área | Dictamen | Condiciones |
|---|---|---|
| Metalurgia y Operaciones (ADX-02 / ADX-03), re-revisión 2026-10-05 | METALLURGY: APROBADO · OPERATIONS: APROBADO CON CONDICIONES | (1) Regenerar en orden `npm run model` → `npm run media` → `npm run docs:pdf` y verificar en el video y en las imágenes de los PDF que el EBT esté opuesto a la puerta de escoria (OPS-16 y OPS-17). (2) Recomendado: OPS-08 (glosario), OPS-15 (ancla de O₂), OPS-18 y OPS-19. (3) Correr de nuevo `check:content` y e2e. Ya no se requiere la decisión del Director sobre OPS-01, porque se aplicó la opción A |
