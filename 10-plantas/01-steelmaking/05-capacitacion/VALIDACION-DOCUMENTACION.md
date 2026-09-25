# Validación de diseño instruccional y formato — Materiales de capacitación de la Acería

| Campo | Valor |
|---|---|
| Código | VAL-ACE-DOC-001 |
| Versión | 0.1 |
| Estado | Borrador para aprobación del Director |
| Dueño | experto-documentacion-mejora (ex TD-14, Centro de Diseño, Plataformas y Datos) |
| Aprobó | Pendiente — Director de C&D |
| Fecha | 2026-09-26 |
| Alcance | 49 paquetes de capacitación (`05-capacitacion/<CÓDIGO>/contenido.json`) y 30 instrucciones de trabajo (`06-instrucciones-trabajo/IT-*.md`) |
| Revisión cruzada | Seguridad y Salud, Relaciones Laborales y Operativo/Metalurgia (en paralelo, sobre sus propios campos) |

## 1. Mensaje clave
- **49 de 49 JSON** cumplen todos los límites de caracteres de la especificación y son JSON válidos. Todos llevan `validacion.documentacion = "visto bueno — 2026-09-26"`.
- **30 de 30 IT** tienen ahora las 12 secciones en orden, un encabezado de control completo, su figura `it-<código>-puesto.svg` (existe y es XML válido) y rutas `../img/` válidas.
- **Dictamen general: visto bueno con observaciones.** Quedan 4 observaciones que no son de mi campo (sección 5) y hay que **regenerar los 49 PPTX y guías**, porque hoy no reflejan las ediciones de validación.

## 2. Método
| Paso | Qué se hizo | Evidencia |
|---|---|---|
| 1 | Script de límites sobre los 49 JSON: todos los campos de la tabla de `ESPECIFICACION.md` (títulos ≤ 55, `titulo_corto` ≤ 26, `subtitle` ≤ 120, KPI 4 × 6/32, cadena 4–6 × 24, objetivos 4 × 40/140, flujo, figuras existentes, tablas, pasos, quiz, reglas, EPP, viñetas "•") | 0 archivos con error al cierre |
| 2 | Coherencia de títulos con contenido: número de pasos, pasos ★, filas de equipos y de roles | 0 incoherencias reales (3 falsos positivos del analizador revisados a mano) |
| 3 | Plan de sesión: suma de minutos contra la teoría del rol principal (KPI "teoría"), con tope de 480 min por sesión | 49/49 correctos |
| 4 | `python3 -m json.tool` en los 49 archivos después de cada lote de ediciones | 49/49 válidos |
| 5 | Script estructural sobre las 30 IT: secciones y numeración, 13 campos del encabezado, código IT-ACE, versión 0.1, estado, "Aprobó: Pendiente", figura del puesto, rutas, enlaces, líneas (150–300), mermaid, tabla con columna ★, recuadro 🛑 ALTO por tarea, casillas ☐, oraciones > 20 palabras | Resultados en la sección 4 |

Todas las ediciones fueron **puntuales** (reemplazo de una cadena única, verificada antes de escribir). No se reescribió ningún archivo completo ni se reformateó el JSON, porque otros tres expertos editaban en paralelo.

## 3. Presentaciones (49 `contenido.json`): cambios hechos

### 3.1 Límites de caracteres (MO-EAF-07, archivo de referencia)
| Campo | Antes | Después |
|---|---|---|
| `titulos.roles` (56 caracteres; decía "Seis roles", pero la tabla tiene 7) | Seis roles, un dueño: C-05 autoriza lo que sale de norma | Siete roles; C-05 autoriza lo que sale de norma |
| `figuras[1].titulo` (59) | La olla que recibe debe estar caliente, cerrada y con argón | La olla receptora: caliente, cerrada y con argón |
| Celda de `equipos` (46; solo se acortó, sin cambiar el valor ni la marca) | Retroinclinación ≤ 3 s a −3° [Validar con OEM] | Retroinclina ≤ 3 s a −3° [Validar con OEM] |
| `plan_sesion` | 360 min (6 h) frente a 16 h de teoría | 480 min, "Sesión 1 de 2" (bloques 3, 4, 5, 6 y 8 ampliados) |

### 3.2 Títulos: conclusión en vez de tema, o número que no coincidía con la lámina
| Código | Campo | Antes | Después |
|---|---|---|---|
| MM-CC-02 | equipos | Diez equipos sostienen y miden la geometría | Estos equipos sostienen y miden la geometría |
| MM-CC-03 | equipos | Diez equipos; ninguna barrera puede quedar fuera | Ningún equipo de las barreras puede quedar fuera |
| MM-CC-04 | equipos | Doce equipos controlan la interfaz acero–molde | Estos equipos controlan la interfaz acero–molde |
| MM-CC-04 | competencia | Certificación nivel U y protección radiológica | Nivel U y curso POE vigente antes de calibrar |
| MM-EAF-02 | equipos | Diez componentes; el aislamiento ≥ 1 MΩ manda | En los componentes, el aislamiento ≥ 1 MΩ manda |
| MM-EAF-04 | equipos | Nueve equipos; las protecciones deben estar probadas | Equipos en servicio solo con protecciones probadas |
| MM-OLL-01 | equipos | Once componentes; la válvula debe cerrar siempre | Componente clave: la válvula debe cerrar siempre |
| MO-CC1-01 | seguridad | Humedad, carga suspendida y espacio confinado | Humedad, carga suspendida y confinado: sin atajos |
| MO-CC2-06 | calidad | Buza equivocada, velocidad equivocada | Buza equivocada da velocidad equivocada |
| MO-CC2-08 | seguridad | Gases, carga suspendida y acero caliente en movimiento | Gases, carga suspendida y acero caliente: aléjate |
| MO-EAF-06 | seguridad | Sonda húmeda y puerta ocupada: los riesgos | Sonda húmeda o puerta ocupada: no se mide |

Motivo de los títulos de equipos: la tabla de la lámina tiene como máximo 7 filas; un título que dice "Diez" o "Doce" no coincide con lo que ve el participante.

### 3.3 Objetivos: verbos observables
| Código | Antes | Después |
|---|---|---|
| MO-CC1-01 | Trabajar sin exponerte | Aplicar permisos, LOTO e izaje seguro |
| MO-CC1-04 | Proteger al personal | Mantener la exclusión bajo el molde |
| MO-CC2-04 | Leer el lazo de nivel | Explicar el lazo de nivel |
| MM-EAF-04 | Leer aceite, gases y pruebas | Evaluar aceite, gases y pruebas |
| MO-EAF-05 | Leer y corregir la escoria | Evaluar y corregir la escoria |
| MS-ACE-01 | Reconocer las tres zonas | Señalar las tres zonas en campo |
| MS-ACE-05 | Reconocer el espacio y su peligro | Identificar el espacio y su peligro |
| MS-ACE-06 | Reconocer los cinco gases | Identificar los cinco gases |
| MS-ACE-08 | Reconocer y atender el golpe de calor | Detectar y atender el golpe de calor |
| MS-ACE-08 (detalle) | Conocer el régimen trabajo/descanso… | Seguir el régimen trabajo/descanso… |

### 3.4 Plan de sesión (regla: tope de 480 min por sesión)
- **Teoría ≤ 8 h (11 cursos):** el plan suma exactamente la teoría: 480 min, o 240 min en MS-ACE-06 y MS-ACE-08. Sin cambios.
- **Teoría > 8 h (38 cursos):** el plan describe la sesión 1 (480 min). El primer bloque ahora dice **"1. Sesión 1 de N: apertura y por qué importa"**, con N = teoría ÷ 8 h redondeado hacia arriba. Reparto: 16 cursos con N = 2, 13 con N = 3, 5 con N = 4 (MM-CC-01, MM-CC-02, MO-CC1-09, MO-CC2-04 y MO-EAF-04) y 4 con N = 5 (MM-EAF-04, MO-CC1-04, MO-LF-01 y MO-OLL-02). El README muestra cada caso.
- **Fuente de la teoría:** el KPI "teoría" del rol principal, que coincide con la primera fila de `competencia.roles`. Excepción: MO-CC2-02 toma 24 h (16 h + 8 h POE), como dice su KPI.

### 3.5 Revisados sin cambio
`titulo_corto` (49 ≤ 26), `subtitle` (49 ≤ 120 y redactados como resultado esperado), `kpis` (4 por curso; valores ≤ 6), `cadena` (4–6, ≤ 24). Ninguno usa la viñeta "•".

## 4. Instrucciones de trabajo (30 IT)

| Verificación | Resultado inicial | Acción | Resultado final |
|---|---|---|---|
| 12 secciones en orden | 7 IT (S-01 a S-05, C-05, C-17) sin la sección "1. Encabezado de control" y con numeración de 1 a 11 | Se insertó el encabezado H2 y se renumeraron las secciones 2 a 12 | 30/30 |
| Encabezado de control (13 campos, IT-ACE-xxx, v0.1, "Borrador para validación", "Aprobó: Pendiente — Director") | Completo en las 30 | — | 30/30 |
| Figura `img/it-<código>-puesto.svg` | Existe y es XML válido (minidom) en las 30; nombre con código en mayúsculas (`it-S01-puesto.svg`) | — | 30/30 |
| Rutas `../img/` y enlaces relativos | Sin rutas rotas | — | 30/30 |
| Extensión de 150 a 300 líneas | 185 a 299 | — | 30/30 |
| Mini flujo mermaid por tarea | Faltaba en C-05 Tarea 6 y C-17 Tarea 6 | Se agregó un flujo construido solo con los pasos existentes | 30/30 |
| Oraciones de 20 palabras o menos | 7 oraciones largas en prosa (S-02, S-05, S-09, S-10, S-12 ×2, C-17) | Se partieron en dos, sin cambiar su contenido | Quedan 21 casos, todos en contenido de seguridad o técnico: reglas de oro, checklists con parámetros, aviso de marcas [Validar]/[Supuesto] y plan de formación de C-04. No se tocaron |
| Recuadro 🛑 ALTO en cada tarea | Falta en C-04 T5 (usa "🛑 Prohibido"), C-05 T6, C-06 T6, C-17 T5 y T6 | No se agregó, porque es contenido de seguridad | Observación O-2 |
| Encabezado "Tarea N — nombre (MO-XXX-NN)" | Las rutinas de mando (C-xx) y 2 tareas transversales (S-11 T1, S-23 T2) citan la DP, varios manuales o ninguno | Se acepta: la especificación permite rutinas de supervisión para mandos | Sin acción |
| Tabla "Paso / Qué hago / Cómo verifico / ★" | C-06 T2 (VCC) y T5 (emergencias) usan "Punto" y "Escenario" en la primera columna | Se acepta: variante justificada para mandos | Sin acción |

## 5. Observaciones abiertas (para otros dueños)
| # | Observación | Dueño sugerido | Fecha sugerida |
|---|---|---|---|
| O-1 | Regenerar los 49 PPTX y guías con `_herramientas/build_deck.js`. MO-LF-01 y MO-OLL-02 aún no tienen PPTX ni guía | Centro de Diseño (TD-02 y TD-06) | Después de que los 4 expertos cierren |
| O-2 | Agregar el recuadro 🛑 ALTO en C-04 T5, C-05 T6, C-06 T6 y C-17 T5 y T6. En C-04 T5, homologar "🛑 Prohibido" con el formato estándar | experto-seguridad-salud | 2026-10-02 |
| O-3 | Diseñar las sesiones 2 a N en los 38 cursos de más de 8 h. Hoy el plan detalla solo la sesión 1. Propuesta: sesiones 2 a N como práctica guiada en simulador o maqueta y repaso de pasos ★, con la misma evaluación | Célula de Procesos sind. y TD-02 | 2026-10-09 |
| O-4 | Homologar la vigencia de grúas para C-04 (IT-C04 §10: la DP dice 12 meses; MO-OLL-02 §11 dice 24) | experto-relaciones-laborales y experto-seguridad-salud | 2026-10-02 |

## 6. Indicadores de calidad documental (línea base, 2026-09-26)
| Indicador | Fórmula | Línea base | Meta |
|---|---|---|---|
| JSON conformes a límites | JSON sin error ÷ 49 | 1/49 al inicio → 49/49 | 100 % en cada regeneración |
| IT conformes a estructura | IT con 12 secciones, encabezado y figura ÷ 30 | 23/30 → 30/30 | 100 % |
| Paquetes generados y vigentes | PPTX regenerados después de la validación ÷ 49 | 0/49 (47 de versiones previas) | 49/49 antes de la aprobación |

**Estandarización:** los scripts de verificación se usaron desde el scratchpad de la sesión. Se recomienda incorporarlos a `_herramientas/` como paso previo a `build_deck.js` (decisión B).

## 7. Revisión cruzada requerida
- **Seguridad y Salud:** O-2 y O-4, y confirmar que los títulos de seguridad reescritos (MO-CC1-01, MO-CC2-08 y MO-EAF-06) conservan su intención.
- **Relaciones Laborales:** O-4. Las IT de sindicalizados no se tocaron en su contenido laboral.
- **Operativo/Metalurgia:** confirmar la celda acortada de MO-EAF-07 ("Retroinclina ≤ 3 s a −3° [Validar con OEM]").

## 8. Decisión requerida del Director
| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A** | Aceptar el visto bueno con observaciones. Regenerar los 49 paquetes cuando cierren O-2 y O-4 | Bajo | Sin costo adicional; tiempo del Centro de Diseño [Supuesto: 1 día] |
| B | A, y además incorporar los scripts de verificación a `_herramientas/` como control obligatorio antes de generar | Muy bajo; previene regresiones | [Supuesto: 0.5 día de TD-06] |
| C | Regenerar ya, sin esperar O-2 y O-4 | Habría que publicar dos versiones de algunos paquetes | Retrabajo |

**Recomendación:** B. **Fecha límite para decidir:** 2026-10-02, para que la regeneración entre antes de arrancar la DNC del ciclo.

## 9. Control de cambios
| Versión | Fecha | Cambio | Elaboró |
|---|---|---|---|
| 0.1 | 2026-09-26 | Validación inicial de diseño instruccional y formato | experto-documentacion-mejora |
