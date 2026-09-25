# Especificación — Instrucciones de Trabajo por Rol (IT)

Una **Instrucción de Trabajo (IT)** por rol de la Acería traduce la descripción de puesto (DP-ACE-S / DP-ACE-C) y los manuales de proceso a lo que **esa persona hace en su turno, paso a paso**, en lenguaje sencillo, con gráficos, diagramas e imágenes. Es el documento de bolsillo y de pie de máquina. **No reemplaza al manual**: lo resume por rol y remite a él.

## Alcance (30 IT)
- 26 roles sindicalizados: S-01 a S-26.
- 4 mandos de campo por turno: C-04 Jefe de Turno, C-05 Supervisor de Hornos, C-06 Supervisor de Colada Continua y C-17 Supervisor de Patio.

## Archivo y nombre
`06-instrucciones-trabajo/IT-<código sin guion>-<nombre-corto>.md`, por ejemplo `IT-S01-primer-hornero.md`. Las imágenes nuevas van en `10-plantas/01-steelmaking/img/` con prefijo `it-`; la ruta desde la IT es `../img/archivo.svg`.

## Fuentes obligatorias (nada técnico nuevo)
`00-ficha-tecnica-acería.md` (v0.3), `00-catalogo-procesos-y-roles.md`, `01-organizacion/descripciones-puesto-*.md` (qué hace el rol y en qué procesos es R o A), y los manuales MO-/MM-/MS- de esos procesos (versión revisada). Todo valor sale tal cual del manual, conservando las marcas [Validar con OEM] y [Supuesto].

## Estructura de cada IT (en este orden)
1. **Encabezado de control:** tabla con Código (IT-ACE-S01…), Versión 0.1, Estado "Borrador para validación", Rol, Área, Turno, Reporta a, Manuales de referencia, Elaboró, Revisión técnica, Revisión de seguridad, Revisión laboral, Aprobó (Pendiente — Director).
2. **Mi puesto en 30 segundos:** 3–4 frases de lo que hace y por qué importa, más un recuadro "Mis 3 reglas de oro" (★).
3. **Mi turno de 12 horas:** diagrama mermaid (`flowchart LR` o `timeline`) con Inicio de turno → Durante el turno → Eventos → Entrega de turno, con horas típicas (relevo 07:00 / 19:00).
4. **Mi área de trabajo:** **una figura SVG nueva** (`img/it-<código>-puesto.svg`) con la vista simple de su estación: dónde está, qué equipos opera, zonas roja, amarilla y verde, rutas de escape. Es obligatoria y lleva el estilo de la guía (paleta, leyenda numerada, validada con minidom). Puedes reutilizar además 1–2 figuras existentes de `img/`.
5. **Mi EPP:** tabla de pictograma en texto (Casco / Careta aluminizada / …) con cuándo se usa cada uno.
6. **Mis tareas paso a paso:** una sección por proceso en que el rol es **R** (del catálogo y de la DP). Cada tarea lleva:
   - Encabezado "Tarea N — <nombre> (MO-XXX-NN)".
   - Mini diagrama de flujo mermaid (4–8 cajas).
   - Tabla **Paso | Qué hago | Cómo verifico (medición) | ★**, con 4–10 pasos en lenguaje de operador. El valor objetivo y el límite van en la columna de verificación.
   - Recuadro **🛑 ALTO — detén y avisa si…** con 2–4 condiciones de paro.
7. **Mis controles críticos (★):** checklist con casillas ☐ para usar antes de cada tarea crítica.
8. **Si algo sale mal:** tabla Síntoma → Qué hago → A quién aviso (canal de radio / extensión [Supuesto]).
9. **Registros que lleno:** tabla con el registro, cuándo y dónde (LMS, nivel 2, bitácora).
10. **Mi certificación:** nivel ILUO requerido, teoría (h), OJT, pasos ★ que me evalúan y vigencia (12 meses para alturas, espacios confinados, grúas/izaje, eléctrico y radiación; 24 para el resto).
11. **Glosario rápido:** 6–12 términos.
12. **Control de cambios.**

## Reglas de estilo
- Oraciones de ≤ 20 palabras; verbos en imperativo ("Verifica", "Abre", "Avisa").
- ★ = paso crítico · 🔎 = punto de calidad · 🛑 = paro obligatorio. Pueden usarse en el Markdown de la IT (no en las presentaciones).
- Extensión: 150–300 líneas por IT; que se lea en 10–15 minutos.
- Mandos de campo (C-04, C-05, C-06, C-17): en lugar de pasos de operación, sus tareas son las rutinas de supervisión (arranque de turno, verificación de controles críticos VCC, autorizaciones, entrega de turno, respuesta a emergencias como Comandante del Incidente en el caso de C-04).
- Sin funciones de mando para sindicalizados (LFT art. 9): el sindicalizado **avisa, detiene y escala**; no ordena.
