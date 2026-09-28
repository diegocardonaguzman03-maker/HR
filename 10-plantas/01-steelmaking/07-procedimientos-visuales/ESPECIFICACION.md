# Especificación — Procedimientos Operativos Visuales (POV)

Un **Procedimiento Operativo Visual (POV)** explica un proceso operativo de la Acería **paso a paso, dibujado y ligado a los puestos**. Está hecho para que **una persona nueva** entienda en 15 minutos qué pasa en el proceso, quién hace cada paso, cómo sabe que lo hizo bien y cuándo debe detenerse.

| Documento | Para qué | Nivel de detalle |
|---|---|---|
| Manual MO-XXX-NN | Referencia técnica completa: parámetros, rangos, alarmas | Alto (ingeniería, supervisión) |
| **POV-XXX-NN** (este) | El proceso completo **visto por todos los puestos que participan** | Medio: lenguaje de operador, dibujado |
| IT-Sxx por rol | Lo que **un puesto** hace en su turno en todos sus procesos | Bolsillo |

El POV **no crea contenido técnico nuevo**: todo sale del manual revisado, de la ficha FT-ACE-001 v0.3, del catálogo CAT-ACE-001 y de las descripciones de puesto. Se conservan las marcas [Supuesto] y [Validar con OEM] cuando un valor las tiene en el manual.

## Alcance
29 procesos de operación: MO-EAF-01…08, MO-OLL-01/02, MO-LF-01, MO-CC1-01…09 y MO-CC2-01…09. Código del POV: `POV-<área>-<nn>`, por ejemplo `POV-EAF-07`, `POV-OLL-01`, `POV-LF-01`, `POV-CC1-03`.

## Cómo se genera
1. El contenido se escribe en `json/<código del manual>.json` (ejemplo completo: `json/MO-EAF-07.json`).
2. `node _herramientas/validate.mjs` revisa el formato; `node _herramientas/render.mjs [códigos]` genera `pdf/POV-….pdf`.
3. El PDF se arma solo: portada, diagrama de carriles por puesto, tarjetas de pasos con pictogramas, seguridad, "si algo sale mal", registros, certificación, checklist de bolsillo y tabla de revisión.

## Campos del JSON
| Campo | Regla |
|---|---|
| `code`, `pov`, `title`, `area` (EAF, OLL, LF, CC1, CC2), `areaName`, `version` "0.1", `owner` (código del dueño, A) | Del catálogo y del manual |
| `manual` | Ruta relativa a `10-plantas/01-steelmaking/` del manual MO |
| `deck` | Carpeta de la presentación en `05-capacitacion/` |
| `purpose` | 1–2 frases: qué logra el proceso, en palabras de operador |
| `whyItMatters` | 1–2 frases: qué pasa si se hace mal (seguridad, calidad, producción) |
| `startsWhen`, `endsWhen` | Disparador y fin, con el código del proceso vecino |
| `previous[]`, `next[]` | Códigos MO/MM/MS del catálogo |
| `heroFigure` `{file, caption}` | Figura existente de `img/` (ruta `img/archivo.svg`) que mejor muestra el proceso |
| `figures[]` | 0–2 figuras extra de `img/` (seguridad, corte de equipo) |
| `roles[]` `{code, name, raci, does, it}` | Todos los puestos del manual §2. `does` en una frase. `it` = código de la IT del puesto si existe (IT-S01…IT-S26, IT-C04, IT-C05, IT-C06, IT-C17) |
| `goldenRules[3]` | Las 3 reglas que nunca se rompen, ≤ 110 caracteres cada una |
| `epp[]` | ids de: casco, careta_dorada, careta_facial, lentes, aluminizado, ropa_fr, guantes, botas, auditiva, respirador, detector_gas, arnes, dosimetro, chaleco, proteccion_quimica |
| `dangerZone` `{red, yellow, rule}` | Opcional; si el manual define zonas de exclusión |
| `hazards[]` `{icon, text}` | 3–5 peligros principales |
| `phases[]` | 2–4 fases, por ejemplo "Antes de…", "Durante…", "Al terminar" |
| `steps[]` | **6–18 pasos** (máximo 22): `n` consecutivo, `phase` (índice), `role` (R o A del proceso), `icon`, `title` (≤ 42 caracteres, empieza con verbo), `action` (qué haces, ≤ 260 caracteres), `check` (cómo sabes que está bien, con el valor medible), `critical` (★ si es paso crítico del manual), `quality` (🔎), `stop` (condición de ALTO, opcional), `decision` `{question ≤ 34 caracteres, no}` (opcional), `figure` (opcional) |
| `abnormal[]` | 3–7 condiciones: `{icon, if, do, call}` |
| `records[]` | `{what, when, where}` |
| `certification[]` | `{role, level, theory, ojt, evaluated, validity}`, del manual §11 |
| `glossary[]` | 5–10 términos `{term, def}` |
| `review[]` | Una fila por revisión `{area, who, status, date}` |

**Pictogramas permitidos (`icon`):** ver `_herramientas/icons.mjs` (inspeccionar, verificar, checklist, medir, temperatura, muestra, pesar, nivel, presion, hmi, camara, boton, manual, ajustar, herramienta, reparar, conectar, cambiar, arrancar, detener, terminar, marcar, esperar, tiempo, registrar, avisar, radio, telefono, personas, autorizar, calidad, buscar, objetivo, tendencia, ok, rechazar, olla, vaciar, flujo, subir_bajar, girar, grua, carro, montacargas, material, peso, iman, refractario, gas, oxigeno, agua, agitar, electrico, cortar, rociar, ruta, ubicacion, planta, peligro, alto, fuego, calor, bloqueo, barrera, cono, salida, extintor, primeros_auxilios, seguro, alarma, capacitacion, certificado).

## Reglas de redacción
- Frases de ≤ 20 palabras, verbo en imperativo y segunda persona ("Revisa", "Abre", "Avisa").
- Cada paso dice **quién** (un solo puesto), **qué hace** y **cómo sabe que está bien** con el número del manual.
- Todos los pasos ★ del manual §8 y §11 aparecen como `critical: true`.
- Un paso con `stop` debe tener una condición observable ("hay agua en la fosa"), no una opinión.
- **LFT art. 9:** el personal sindicalizado **no tiene funciones de mando**: detiene, avisa y escala. Las autorizaciones y decisiones son de C-xx.
- No se agregan frecuencias de mantenimiento, límites ni procedimientos que no estén en el manual.

## Revisión (todos los expertos)
| Revisión | Agente | Qué revisa |
|---|---|---|
| Técnica | experto-operativo-metalurgia | Fidelidad al manual y a la ficha, pasos, valores, figuras |
| Seguridad | experto-seguridad-salud | Pasos ★, ALTO, EPP, zonas, peligros, respuesta a anormales |
| Laboral | experto-relaciones-laborales | Roles y RACI iguales al catálogo y a la DP, sin mando para sindicalizados, certificación y escalafón |
| Documentación | experto-documentacion-mejora | Formato, lenguaje claro, control documental, trazabilidad a manual e IT |
| Usuario (nuevo ingreso) | gerente-personal-sindicalizado | ¿Una persona nueva entiende qué hacer? |

Cada revisor registra su resultado en `_revisiones/REVISION-<área>.md` y agrega su fila en `review[]` del JSON.
