# Revisión Técnica: Procedimientos Operativos Visuales (POV) de la Acería

| Revisión | Revisor | Alcance | Fecha | Resultado |
|---|---|---|---|---|
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | 29 POV (EAF-01…08, OLL-01/02, LF-01, CC1-01…09, CC2-01…09) contra su manual MO v0.1 y FT-ACE-001 v0.3, **después** de los 509 cambios de Documentación, Usuario, Laboral y Seguridad | 2026-09-28 | **29 de 29 con visto bueno: 7 sin observaciones y 22 con observaciones. Ninguno queda "No aprobado".** 53 correcciones en `_revisiones/tecnica/<código>.json`, ya aplicadas y validadas |

> **Mensaje clave.** Ningún revisor alteró un valor técnico, una unidad, un rango ni una secuencia del manual de forma que ponga en riesgo la operación o la calidad. Los ALTO nuevos de Seguridad usan valores que están en los manuales o en la serie MS-ACE (60 °C de panel, bordo libre ≥ 300 mm, ≤ 45 °C en el distribuidor, ≥ 1.5 m y ≤ 2 min en el muestreo). Encontré **5 errores técnicos que venían del borrador original** y que las otras revisiones no podían detectar: Al en coladas de CC2 (EAF-07 y LF-01), la velocidad con agua de emergencia en CC1-04, la 2.ª canasta en EAF-02 y el método B en EAF-08. Los corregí. Las 3 condiciones anormales que sustituyó Seguridad pueden salir de "Si algo sale mal", porque su criterio ya quedó en un paso del mismo POV o del POV vecino. Los PDF de `pdf/` **no** reflejan todavía estos cambios: hay que regenerarlos con `render.mjs`.

## 1. Cómo se revisó

1. Para cada POV comparé paso por paso contra §5 (parámetros), §8 (procedimiento), §9 (anormales) y §11 (certificación) de su manual, y contra FT-ACE-001 v0.3.
2. Revisé los 329 cambios `set` de la bitácora `cambios-aplicados.tsv`, con prioridad en `check`, `action`, `stop` y `abnormal`. Los 180 `append` son glosario, EPP, 2 roles y 5 anormales: los revisé por contenido.
3. Rehíce el mapa de numeración manual → POV en los 29 procesos. En 13 POV los números cambian porque se unieron o separaron pasos, así que revisé cada `certification[].evaluated`.
4. Revisé la cadena `previous` / `next` / `startsWhen` / `endsWhen` en el flujo completo: patio → EAF → olla → LF → grúa → CC1/CC2 → corte → inspección.
5. Apliqué y validé: `node aplicar-revisiones.mjs` (53 cambios, 0 errores) y `node validate.mjs` (29 de 29 ✓). No agregué ni borré pasos.

## 2. Resultado por POV

| POV | Estado | Cambios | Lo principal |
|---|---|---|---|
| EAF-01 Preparación del horno | Con observaciones | 3 | Certificación con la numeración del POV (el paso 17 del manual es el 16 del POV) |
| EAF-02 Carga con canasta | Con observaciones | 5 | **Paso 17: la 2.ª canasta repite los pasos 8 a 16**, no del 7 al 16 (ver §4-b); certificación con número de paso |
| EAF-03 Alimentación de DRI | Con observaciones | 1 | Certificación de S-02 con número de paso |
| EAF-04 Fusión | Con observaciones | 2 | Permisivo de agua en 4–6 bar (no "≥ 3 bar", que es la alarma); el ALTO de T de panel > 60 °C ahora dice la acción: bajar el tap 2 posiciones |
| EAF-05 Escoria espumosa | Con observaciones | 4 | Inicio del proceso en la fusión de canasta (modo quemador), no con el baño plano; certificación renumerada (el paso 6 del manual se separó en dos) |
| EAF-06 Medición y muestreo | Con observaciones | 3 | Frase larga del paso 13 dividida sin tocar el [Supuesto]; certificación renumerada |
| EAF-07 Vaciado por EBT | Con observaciones | 1 | **Adiciones: Al solo en grados de CC1; los de CC2 van sin Al** (el Al tapa las buzas calibradas) |
| EAF-08 Electrodos | Con observaciones | 4 | **Método B incluye el paso 6** (limpiar la caja de la columna); certificación renumerada y separando lo que S-02 ejecuta de lo que verifica |
| OLL-01 Preparación de olla | Con observaciones | 2 | La última olla de la secuencia (CC1-07 y CC2-07) también entra a preparación |
| OLL-02 Traslado de ollas | Con observaciones | 1 | Inicio con "S-06 entrega" (igual que LF-01). Ver el tema v0.2 de la altura de traslado |
| LF-01 Horno olla | Con observaciones | 4 | **Al ≤ 0.005 % y sin alambre de Al en CC2**; T de envío de las 4 familias; aviso a S-12 y C-04 si el tratamiento pasa de 50 min |
| CC1-01 Distribuidor | Con observaciones | 2 | "Restos de casco" pasa a "restos de costra (acero y escoria pegados)"; fila de certificación diferenciada |
| CC1-02 Barra falsa | **Visto bueno** | 0 | Fiel al manual |
| CC1-03 Arranque | **Visto bueno** | 0 | Fiel al manual; T de 1.ª colada (líquidus + 25 a 35 °C ≈ 1,550–1,560 °C) coherente con LF-01 |
| CC1-04 Colada estable | Con observaciones | 1 | **Falla de bombeo con agua de emergencia: 0.3–0.5 m/min y preparar el cierre** (decía 0.8 m/min, que es la respuesta a ΔT alto) |
| CC1-05 Cambio de olla | Con observaciones | 1 | Certificación de S-13 con su paso ★ 6 (cerrar la olla); los pasos 2 y 15 quedan como señales a la grúa |
| CC1-06 Cambio de SEN / distribuidor | Con observaciones | 5 | Aclaración de 10 s y 15 s; rango de nivel del manual (0 a −30 mm, alarma < −40 mm); certificación con equivalencia al manual |
| CC1-07 Fin de colada | Con observaciones | 2 | El ALTO bajo 400 mm dice "cierra el tapón de inmediato"; la olla vacía va a MO-OLL-01 |
| CC1-08 Corte y mesa | **Visto bueno** | 0 | Fiel al manual; peso teórico y grúa de 45 t correctos |
| CC1-09 Inspección de planchón | Con observaciones | 4 | Banda de 5–10 mm (antes quedaba sin instrucción); se repone [Validar con OEM] del escarpeo a ≥ 150 °C; tolerancia de ancho; fila de certificación diferenciada |
| CC2-01 Distribuidor y buzas | Con observaciones | 1 | Fila de certificación diferenciada |
| CC2-02 Barra falsa rígida | **Visto bueno** | 0 | Numeración de certificación con equivalencia al manual, correcta |
| CC2-03 Arranque por línea | **Visto bueno** | 0 | "Repite los pasos 7 a 11" es correcto (manual 9–14) |
| CC2-04 Colada estable | **Visto bueno** | 0 | Fiel al manual |
| CC2-05 Cambio de olla | Con observaciones | 1 | Glosario del vórtice alineado con CC2-07 (ver §4-d) |
| CC2-06 Cambio de buza | **Visto bueno** | 0 | Referencias a pasos (5 a 7, 11, 12, 13) correctas |
| CC2-07 Fin de colada | Con observaciones | 2 | Criterio de cierre de L3 y L4 en 280–320 mm, nunca bajo 250 mm (decía "nivel ≥ 300 mm"); la olla vacía va a MO-OLL-01 |
| CC2-08 Corte y lecho | Con observaciones | 3 | "Antirretorno" pasa a "arrestaflamas" (término único), sin cambiar el control |
| CC2-09 Inspección de palanquilla | Con observaciones | 1 | Criterio de palanquilla doblada en el paso de medición (ver §3) |
| **Total** | **29 con visto bueno (7 sin observaciones)** | **53** | |

## 3. Las 3 condiciones anormales sustituidas por Seguridad

**Dictamen: aceptables.** En los tres casos la respuesta de seguridad (gases o ácido) protege la vida y el criterio técnico sigue visible para el operador en un paso del POV.

| POV | Condición que salió | Dónde queda el criterio | Dictamen técnico |
|---|---|---|---|
| EAF-05 | "P > 0.015 % antes de vaciar" | POV-EAF-06: paso 10 (ventana con P ≤ 0.015 % y decisión "con P alto no vacíes: avisa a C-05") y anormal 7 ("P > 0.015 % → no vacíes; MO-EAF-05 §9") | Aceptable. El P se mide y se decide en EAF-06, no durante el espumado |
| LF-01 | "Tratamiento > 50 min" | Paso 10 de LF-01 (lo agregué): "si el tratamiento va a pasar de 50 min, avisa a S-12 y a C-04". El paso 14 conserva la meta de 35–45 min | Aceptable con esta corrección. Es coordinación de secuencia, no seguridad ni calidad del acero |
| CC2-09 | "Palanquilla doblada" | POV-CC2-08 anormal 6 (detener, LOTO, liberar) y POV-CC2-04 anormal 6. En CC2-09 paso 6 agregué: "doblada: retén "R" para rechazo (C-09)" | Aceptable con esta corrección |

Las tres siguen en §9 de su manual. Si el Director elige la opción A de la decisión D-1 de Seguridad (bloque fijo de emergencias en `render.mjs`), estas 3 condiciones pueden regresar a "Si algo sale mal" en la versión 1.0.

## 4. Dudas técnicas abiertas: resolución

| # | Duda | Resolución |
|---|---|---|
| a | **CC1-06: el paso dice "≤ 10 s" y la pregunta "≤ 15 s"** | Los dos valores son correctos y tienen funciones distintas. **10 s** es el criterio de aceptación del cambio (objetivo 5 s). **15 s** es el límite de tapón cerrado: si el cambiador no terminó en 15 s, se reabre con la SEN vieja (manual §5 y §9). Corregí el `check`: "Sin flujo ≤ 10 s (objetivo ≤ 5 s). Con el tapón cerrado, nunca más de 15 s." La pregunta se queda como está |
| b | **EAF-02 paso 17: "repite los pasos 7 a 16"** | **Empieza en 8.** El paso 7 espera el aviso de MO-EAF-01, que no ocurre entre canastas (el horno no se prepara entre la 1.ª y la 2.ª). La 2.ª canasta se arma y pesa antes en el patio (pasos 3 a 6), y el aviso a S-04 es la "zona libre" del paso 10. Corregido en el POV; el manual se corrige en v0.2 (M-07 de Documentación) |
| c | **CC1-01 "restos de casco"** | En el manual, "casco" es la coraza metálica (así lo define el glosario del POV), pero en el paso 3 se usa por error para lo que queda después del volteo. Lo que se retira es **costra** (acero y escoria solidificados pegados) y escoria suelta. Corregido |
| d | **Vórtice: ≈ 500 mm (CC2-05) contra ≤ 300 mm (CC2-07)** | Son dos fenómenos distintos y el manual CC2-05 §3 los mezcla. El **vórtice sobre las buzas calibradas de 20–24 mm** aparece cerca de **300 mm** (CC2-07: cierre de L3 y L4 a 300 mm, nunca bajo 250). Los **500 mm** del cambio de olla son un **mínimo de reserva y de limpieza**: 850 → 500 mm son ≈ 13 t, ≈ 3.8 min a 3.4 t/min, y el acero necesita tiempo de residencia para que floten las inclusiones mientras abre la olla nueva. Dejé en el glosario de CC2-05 la misma definición que en CC2-07 y expliqué los 500 mm. Se corrige MO-CC2-05 §3 en v0.2 [Validar con C-08] |
| e | **CC1-05: certificación de S-13** | Correcto lo que observó Documentación: citaba los pasos 2 y 15 (los ejecuta S-09) y omitía su paso ★ 6 (cerrar la olla al primer signo de escoria o con ≤ 4 t, que además es regla de oro). Quedó "Pasos 6, 8 y 11; señales a la grúa en los pasos 2 y 15 (los ejecuta S-09)" |
| f | **Filas repetidas del mismo puesto (CC1-09 S-18 y CC2-01 S-15; también CC1-01 S-15)** | **No se unen.** Son dos competencias distintas con vigencias distintas: inspección (24 meses) y escarpeo [Supuesto]; preparación (24 meses) y grúa de CC de 50 t (12 meses, NOM-006). Unirlas perdería la vigencia de 12 meses del izaje. Las diferencié en `level`: "3 (inspección)", "3 (preparación de distribuidor)" |
| g | **Números de paso en `certification[].evaluated`** | Revisé los 29 POV con el mapa manual → POV. Estaban bien en 21. Corregí EAF-01, EAF-02, EAF-03, EAF-05, EAF-06, EAF-08, CC1-05 y CC1-06 (texto sin número, numeración del manual o paso de otro puesto). CC2-02 y CC2-06 citan los dos números (POV y manual) de forma explícita y correcta: se dejan |

## 5. Cambios de los revisores que alteraban valores técnicos

Ninguno cambió un valor del manual. Revisé en especial:

- **Seguridad (115):** todos los valores de sus ALTO y respuestas están en el manual o en MS-ACE (60 °C de panel, 300 mm de bordo libre [Supuesto], 45 °C, 1.5 m y 2 min en roja, 25/200 ppm de CO, 10/20 % LEL, < 2 × fondo). Ajusté 3 textos suyos sin debilitar el control: EAF-04 paso 8 (el ALTO ahora dice "baja el tap 2 posiciones", que es la respuesta del manual), CC1-07 paso 6 ("cierra el tapón de inmediato") y CC2-08 paso 1 (término "arrestaflamas").
- **Laboral (61):** en CC1-09 el paso 9 dejaba sin instrucción los defectos de 5–10 mm y el paso 10 perdió la marca [Validar con OEM] del escarpeo a ≥ 150 °C. Corregí los dos manteniendo su criterio: S-18 clasifica y C-09 dispone.
- **Documentación (178) y Usuario (155):** solo redacción y términos. Confirmé que las divisiones de frases no movieron valores. "DRI (HRD)" en EAF-07 es correcto: HRD es "hierro de reducción directa" y está en el glosario.

## 6. Coherencia del flujo entre POV vecinos

| Interfaz | Resultado |
|---|---|
| EAF-07 → LF-01 → OLL-02 → CC1-03 / CC2-03 | Coherente. T de envío (LF-01), T de 1.ª colada (CC1-03: líquidus + 25 a 35 °C; CC2-03: SH 25–40 °C) y SH en estado estable (20–30 °C CC1, 20–35 °C CC2) cuadran entre sí. Bordo libre ≥ 300 mm y "sin fuga" están igual en LF-01 paso 14 y OLL-02 paso 2 |
| EAF-07 / LF-01 → CC2 | **Corregido:** EAF-07 y LF-01 pedían Al en todas las coladas. En CC2 el Al soluble debe ser ≤ 0.005 % (colada abierta, buza calibrada) |
| CC1-05 / CC2-05 / CC1-07 / CC2-07 → OLL-01 | **Corregido:** la última olla vacía de la secuencia no llegaba a preparación en la cadena |
| EAF-05 inicio | **Corregido:** empieza con el modo quemador en la fusión de canasta (MO-EAF-04), no con el baño plano |
| Tabla nivel–velocidad del distribuidor | Igual en CC1-05, CC1-06 y CC1-07 (800 → 0.9; 700 → 0.6; 600 → 0.4 m/min); cierre a 400 mm en CC1 |
| Cierre de líneas en CC2 | Coherente: CC2-04 (< 450 mm cierra L1/L6), CC2-05 (< 450 mm L1/L6, < 350 mm L2/L5), CC2-07 (450/350/300 mm) |
| Agua de emergencia ≤ 15 s | Igual en CC1-02, CC1-03, CC1-04, CC1-07, CC2-03, CC2-04 y FT-ACE-001 |

## 7. Temas para los manuales MO v0.2

| # | Manual | Cambio | Por qué | Responsable propuesto |
|---|---|---|---|---|
| T-01 | MO-EAF-02 §8 paso 17 | "Repite 8–16 con la 2.ª canasta ya armada y pesada; el aviso es la zona libre del paso 10" | Paso 7 no aplica entre canastas | experto-operativo-metalurgia + C-05 |
| T-02 | MO-EAF-07 §8 paso 3 y MO-LF-01 §8 paso 8 | Decir que el Al se agrega solo en grados de CC1; CC2 sin Al | Riesgo de tapar buzas calibradas | C-07 / C-09 |
| T-03 | MO-EAF-08 §8 paso 14 | Método B = pasos 1–3, **5**–10 y 12–13; §11: separar lo que S-02 ejecuta de lo que verifica | Caja de la columna sucia → holgura en la junta | C-05 / C-12 |
| T-04 | MO-CC2-05 §3 | Vórtice ≤ 300 mm (igual que CC2-07); 500 mm = reserva y limpieza | Contradicción entre manuales (M-05 de Documentación) | C-08 [Validar con OEM] |
| T-05 | MO-OLL-02 §5 | Altura sobre obstáculos: §5 dice ≥ 500 mm y §6.3 y MS-ACE-04 dicen ≥ 1 m. Dejar ≥ 1 m [Supuesto] en los dos | Contradicción interna; el POV ya usa 1 m (lo más seguro) | C-04 / C-16 |
| T-06 | MO-CC1-01 §8 paso 3 | "Restos de costra" en lugar de "restos de casco"; resolver el orden limpieza → permiso (tema c de Seguridad) | Término confuso; exposición | C-06 / C-15 |
| T-07 | MO-CC1-05 §8 paso 6 y §11 | Marcar ★ el cierre de la olla y evaluarlo a S-13 | Ya es regla de oro y está en la lista corta | C-06 |
| T-08 | MO-CC1-06 §5, §8 (B6) y §9 | Escribir juntos "criterio ≤ 10 s; límite 15 s con tapón cerrado"; pasar la numeración A1…C13 a la plantilla (M-09) | Confusión entre 10 y 15 s | C-08 |
| T-09 | MO-CC1-04 §9 | Separar en dos filas "ΔT/caudal < 90 %" (0.8 m/min) y "falla de bombeo" (emergencia → 0.3–0.5 m/min) también en la lista corta | Evitar la confusión que tenía el POV | C-08 |
| T-10 | MO-EAF-04 §8 paso 1 | Escribir los valores del permisivo de agua (Δ ≤ 2 %, 4–6 bar, T panel ≤ 60 °C) | El paso dice solo "agua" | C-07 |
| T-11 | MO-EAF-05 §1 y §3 | Disparador: el proceso empieza con el modo quemador en la fusión de canasta | Coherencia con los pasos 1–2 | C-07 |
| T-12 | MO-CC2-07 §8 paso 6 | Criterio "chorro cortado a 280–320 mm; nunca bajo 250 mm" | El criterio solo decía "chorro cortado" | C-08 |
| T-13 | MO-CC2-09 §9 | Definir "palanquilla doblada" con un valor (flecha > 40 mm o que no entra al horno de Laminación) [Validar con Laminación] | Criterio no medible | C-09 |
| T-14 | Todos los MO, §8 ↔ §11 | Pasos ★ evaluados = pasos ★ marcados (M-03 de Documentación, que apoyo) | 10 manuales con diferencias | Autor + experto-documentacion-mejora |
| T-15 | Todos los MO, §9 | Fila "Detector personal en alarma (A1/A2)" (tema f de Seguridad, que apoyo) | Libera espacio en el POV | experto-seguridad-salud |

**Valores que siguen dependiendo del fabricante** (se conservan las marcas en los POV; no se usan como definitivos en la certificación): torque de 4,500 N·m y junta ≥ 300 mm bajo la mordaza (EAF-08); corona de arena de 50–100 mm y coladas del tubo del EBT (EAF-01); altura de la canasta de 0.5–1.0 m (EAF-02); ángulo de desescoriado −3 a −8° (EAF-05); profundidad de inmersión de 300–400 mm (EAF-06); 250 t de la grúa con o sin traviesa (OLL-02, tema e y D-4 de Seguridad); tiempo de cambio de buza ≤ 2 s y rampa de CC2 (CC2-03, CC2-06); tabla velocidad–SH–ancho de CC1 (CC1-04).

## 8. Revisión cruzada que necesita esta entrega

- **experto-seguridad-salud:** confirmar los 3 ajustes a sus textos (EAF-04 paso 8, CC1-07 paso 6, CC2-08 paso 1) y la nueva respuesta de CC1-04 anormal 3 (falla de bombeo). Ninguno quita un control; todos agregan la acción del manual.
- **experto-relaciones-laborales:** CC1-09 pasos 9 y 10 (se conserva que S-18 clasifica y C-09 dispone) y las etiquetas de nivel en las filas de certificación de CC1-01, CC1-09 y CC2-01. También el cambio de "libera" por "entrega" en OLL-02 (inicio).
- **experto-documentacion-mejora:** registrar T-01 a T-15 en el plan de manuales v0.2; glosario de CC2-05 (vórtice); cadena `previous`/`next` de OLL-01, CC1-07 y CC2-07; **regenerar los 29 PDF** (`node render.mjs`), que hoy no incluyen ninguna de las revisiones.

## 9. Decisión requerida del Director

**D-T1. Las 3 condiciones anormales sustituidas por Seguridad (EAF-05, LF-01 y CC2-09)**

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Aceptar la sustitución. El criterio técnico se conserva en pasos del POV (EAF-06 paso 10, LF-01 paso 10, CC2-09 paso 6). Ya está aplicado | Bajo: el operador ve el criterio en el paso donde actúa | Ninguno adicional |
| B | Revertir: regresar las 3 condiciones y quitar las respuestas a gases o ácido | Alto: el operador no sabe qué hacer cuando suena su detector o le salpica ácido | ≈ 2 h de edición [Supuesto] |
| C | Regresar las 3 condiciones en v1.0 cuando exista el bloque fijo de emergencias (D-1 de Seguridad, opción A) | Bajo | Incluido en D-1 |

**D-T2. Manuales MO v0.2 antes de emitir los POV v1.0**

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Corregir los temas T-01 a T-15 en los manuales v0.2 con validación de C-07, C-08, C-09 y C-05 antes del 2026-10-16. Mientras tanto, usar los POV corregidos como **borrador de capacitación** (igual que D-2 de Seguridad) | Bajo: POV y manual quedan iguales antes de certificar a nadie con TD-P07 | ≈ 24 h de ingeniería de proceso y 8 h de este staff [Supuesto]; sin costo externo |
| B | Emitir los POV v1.0 ya y corregir los manuales después | Medio: el POV y el manual dicen cosas distintas en 5 puntos técnicos (Al en CC2, método B, 2.ª canasta, vórtice, altura de traslado); una auditoría o una evaluación TD-P07 los encontraría | Ninguno inmediato |
| C | Esperar también a la validación de todos los valores [Validar con OEM] antes de usar los POV | Alto para la capacitación: retrasa la inducción de nuevo ingreso varias semanas | Gestión con los OEM |

**Fecha límite sugerida para decidir:** 2026-10-09 [Supuesto], para cerrar los manuales v0.2 el 2026-10-16 y regenerar los PDF antes del siguiente grupo de nuevo ingreso (misma fecha que D-1 a D-4 de Seguridad: 2026-10-15).

## 10. Archivos

- `_revisiones/tecnica/MO-*.json`: 29 archivos, 53 cambios, firma "Técnica" en `review[]`.
- `json/MO-*.json`: 29 POV con los cambios aplicados (`aplicar-revisiones.mjs`: 53 aplicados, 0 errores; `validate.mjs`: 29 de 29 ✓).
- `_revisiones/cambios-aplicados.tsv`: regenerado por la herramienta; incluye las filas del revisor "tecnica".
- Este informe.
