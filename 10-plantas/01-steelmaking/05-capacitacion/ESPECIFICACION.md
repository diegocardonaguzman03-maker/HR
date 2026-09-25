# Especificación — Presentaciones de capacitación por proceso (estándar AMMX)

Cada proceso crítico del catálogo `CAT-ACE-001` (49 procesos) tiene su propia carpeta `05-capacitacion/<CÓDIGO>/`:

| Archivo | Quién lo hace |
|---|---|
| `contenido.json` | El agente autor, extraído del manual validado. Es la **única fuente** de la presentación y de la guía |
| `<CÓDIGO>_Capacitacion_AMMX.pptx` | Se genera con `_herramientas/build_deck.js` (librería oficial AMMX, `/presentacion`) |
| `<CÓDIGO>_Guia-Instructor.md` / `.pdf` | Se genera con el mismo script: plan de sesión, contenido, evaluación con respuestas, checklist y validación |

**Ejemplo de referencia completo:** `MO-EAF-07/contenido.json`. Cópialo y sigue exactamente su estructura.

## Reglas de contenido
1. **Nada técnico nuevo.** Cada valor (temperatura, caudal, distancia, tiempo, rol) sale **tal cual** del manual del proceso (versión revisada por los expertos) o de la ficha FT-ACE-001 v0.3. Si el manual lo marca [Validar con OEM] o [Supuesto], conserva la marca.
2. **Español de México, lenguaje de operador**, frases cortas. Sin emojis. Sin viñetas "•" dentro del texto.
3. **Títulos (`titulos.*`) = conclusión, no tema**, máximo **55 caracteres**. Ejemplo: "Temperatura, oxígeno y peso definen la ventana", no "Parámetros".
4. `titulo_corto` ≤ **26 caracteres** (portada). `subtitle` ≤ 120 caracteres.
5. Terminología AMMX: nivel de competencia en escala **ILUO** (I = nivel 1, L = 2, U = 3, O = 4 del manual). Certificación con registro en **IMaS** y constancia **DC-3/SIRCE**.

## Límites por campo (para que nada se desborde)
| Campo | Límite |
|---|---|
| `kpis` | Exactamente 4; `value` ≤ 6 caracteres, `label` ≤ 32 |
| `cadena` | 4–6 elementos, ≤ 24 caracteres cada uno |
| `objetivos` | 4; `titulo` ≤ 40, `detalle` ≤ 140 |
| `por_que_importa` | ≤ 330 caracteres · `principio` ≤ 110 |
| `roles` | Encabezado + ≤ 8 filas; "Qué hace" ≤ 75 |
| `flujo` | 5–9 elementos; `label` ≤ 18, `desc` ≤ 45 |
| `figuras` | 1–2 SVG **existentes** en `img/` que correspondan al proceso; `lectura` 2–4 frases ≤ 120; `titulo` (conclusión ≤ 55) si hay 2 figuras |
| `equipos` | Encabezado + ≤ 7 filas; celdas ≤ 45 |
| `parametros` | Encabezado + ≤ 8 filas; celdas ≤ 32; `parametros_nota` ≤ 160 |
| `seguridad.controles` | 4; `titulo` ≤ 40, `detalle` ≤ 150 |
| `seguridad.epp` | 3–6 frases ≤ 55 |
| `seguridad.figura` | Opcional; SVG de seguridad existente (`ms-*.svg`) con `figura_titulo` y `figura_lectura` (3 frases) |
| `calidad` | Encabezado + ≤ 6 filas; celdas ≤ 45 · `calidad_takeaway` ≤ 120 |
| `pasos` | 8–16 pasos; `paso` ≤ 30, `como` ≤ 120, `criterio` ≤ 35, `rol` ≤ 14; `critico` = true solo en los pasos ★ del manual |
| `anormales` | Encabezado + ≤ 8 filas; síntoma ≤ 35, acción ≤ 95, avisar ≤ 22 |
| `competencia.roles` | Encabezado + ≤ 6 filas (Rol, ILUO, Teoría, OJT, Vigencia) · `checklist` = pasos ★ del manual, ≤ 6, ≤ 95 caracteres |
| `quiz` | Exactamente 5 preguntas (≤ 90), 3 opciones (≤ 40), `correcta` 0–2, `explicacion` ≤ 140 |
| `reglas` | 4; `titulo` ≤ 45, `detalle` ≤ 100 |
| `plan_sesion` | Encabezado + 6–9 bloques; minutos que sumen las horas de teoría del rol principal (tope 8 h por sesión) |
| `validacion` | Objeto con `tecnica`, `seguridad`, `laboral`, `documentacion`: lo llena **cada experto** con "visto bueno — AAAA-MM-DD" o "visto bueno con observaciones — AAAA-MM-DD" |

## Validación (todos)
| Experto | Revisa y corrige **solo** estos campos |
|---|---|
| `experto-operativo-metalurgia` | `flujo`, `figuras`, `equipos`, `parametros`, `parametros_nota`, `calidad`, `pasos` (contenido), `anormales`, `quiz` |
| `experto-seguridad-salud` | `seguridad`, `reglas`, marcas `critico` de `pasos`, `competencia.checklist` |
| `experto-relaciones-laborales` | `audiencia`, `roles`, `competencia.roles` (vigencias 12/24 meses), redacción no punitiva |
| `experto-documentacion-mejora` | `titulos`, `titulo_corto`, `subtitle`, `objetivos`, `kpis`, `cadena`, `plan_sesion`, límites de caracteres y JSON válido |

Los expertos editan los JSON con **ediciones puntuales** (nunca reescriben el archivo completo), porque trabajan en paralelo sobre los mismos archivos. Después de editar validan con `python3 -m json.tool archivo > /dev/null`.
