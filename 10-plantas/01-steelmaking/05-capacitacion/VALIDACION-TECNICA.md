# Validación técnica de materiales de capacitación — Acería

| Campo | Valor |
|---|---|
| Elaboró | experto-operativo-metalurgia (custodio de FT-ACE-001) |
| Fecha | 2026-09-26 |
| Alcance | 10 presentaciones MM-*, 10 presentaciones MS-ACE-*, verificación numérica de 29 MO-*, 8 IT de mantenimiento (IT-S19 a IT-S26), homologaciones de IT-S11 y MO-CC2-03 |
| Base | Manuales MM-/MS-/MO- (versión revisada) y ficha FT-ACE-001 v0.3 |
| Estado | Recomendación técnica. **El Director decide** |

## 1. Mensaje clave
Los 49 `contenido.json` y las 8 IT de mantenimiento **son técnicamente aptos para capacitación**. Hice 16 correcciones puntuales en mis campos. Quedan **4 incoherencias en los documentos fuente** (tres manuales y una DP) que no me toca editar en esta tarea. Hay que corregirlas antes de usar esos manuales en planta, porque hoy la presentación y el manual dicen cosas distintas.

## 2. Resultado por material

### 2.1 Presentaciones de mantenimiento (MM) y de seguridad (MS-ACE)
Revisé `flujo`, `figuras`, `equipos`, `parametros`, `parametros_nota`, `calidad`, el contenido de `pasos`, `anormales` y `quiz` contra cada manual y la ficha. También confirmé que existan los SVG y que se respeten los límites de caracteres de ESPECIFICACION.md.

| Código | `validacion.tecnica` | Corrección hecha en el JSON |
|---|---|---|
| MM-CC-01 | visto bueno | — |
| MM-CC-02 | visto bueno | — |
| MM-CC-03 | visto bueno | Condición anormal "ΔT alto" con sus límites: > 11 °C (CC1) y > 12 °C (CC2), con caudal normal |
| MM-CC-04 | visto bueno | Criterio del paso 9 con su unidad: carrera ±0.1 mm |
| MM-EAF-01 | visto bueno | — |
| MM-EAF-02 | visto bueno | — |
| MM-EAF-03 | visto bueno | — |
| MM-EAF-04 | **con observaciones** | Energía específica de 560–620 a **560 kWh/t (520–600)**, según FT-ACE-001 v0.3 §2 |
| MM-GR-01 | visto bueno | Sobrecalentamiento 20–30 °C acotado a CC1 (en CC2 es 20–35 °C) |
| MM-OLL-01 | visto bueno | — |
| MS-ACE-01 | visto bueno | Paso 11: nadie bajo la máquina hasta que la hebra salga de los extractores y C-06 libere |
| MS-ACE-02 | visto bueno | — |
| MS-ACE-03 | visto bueno | — |
| MS-ACE-04 | **con observaciones** | Grúas de CC: **2 × 50 t, 2 × 45 t y 1 × 25 t** (FT v0.2). Retiro de cable de grúa de colada: **6 alambres rotos en un paso o 3 en un torón, o Ø −5 %** (MM-GR-01; criterio para grúas de metal líquido). Estaba en 12 alambres, el criterio de grúa general |
| MS-ACE-05 | **con observaciones** | Prueba del tapón al reconectar el argón: **100–200 NL/min** (MM-OLL-01). Estaba en 50–150 NL/min, que es la agitación suave del LF, no la prueba del tapón |
| MS-ACE-06 | visto bueno | "N₂ alto" corregido a "N alto en acero, clogging" (el defecto es la captación de nitrógeno) |
| MS-ACE-07 | visto bueno | — |
| MS-ACE-08 | visto bueno | Filas de hidratación, pérdida de peso y zona roja rotuladas "Normal / Límite / Acción". Antes quedaban bajo las columnas Ligera / Moderada / Pesada y se leían mal |
| MS-ACE-09 | visto bueno | — |
| MS-ACE-10 | visto bueno | — |

Nota general: los valores marcados [Validar con OEM] o [Supuesto] se dejan como están. El visto bueno es para capacitación, no para liberar parámetros de planta.

### 2.2 Operación (MO-*, 29 JSON)
Un script comparó cada número de los campos técnicos contra el manual y la ficha. Los únicos números que no aparecen en el manual son distractores del quiz o cálculos derivados correctos (por ejemplo, 12,000 mm × 1.012 ≈ 12,150 mm y 119 MW × 32 kg/min/MW ≈ 3.8 t/min). Hice una sola corrección:
- **MO-EAF-02**, lectura de la figura: "tap-to-tap ≈ 58 min" no está en el manual y contradice la ficha (55 min). Queda: "Una 2.ª canasta suma ≈ 3 min de arco apagado: hay que cuidar el tap-to-tap de 55 min".
- **MO-EAF-07**: no tenía la clave `validacion`. Agregué `{"tecnica": "visto bueno — 2026-09-26"}`.

### 2.3 Homologaciones pedidas
| Tema | Resolución |
|---|---|
| Sobrecalentamiento en MO-CC2-03 (alarma < 20 °C y acción a < 15 °C) | El JSON sigue al manual: alarma < 20 °C, **< 20 °C avisa a C-06** y **< 15 °C C-06 decide** si arranca menos líneas o regresa la olla. Cambié la celda de acción en `parametros` y la fila de `anormales`. **Observación al manual MO-CC2-03:** el §5 no dice qué se hace entre 15 y 20 °C. Propongo escribir "avisa a C-06 y C-08 y vigila la tendencia" |
| Tiempo de análisis del laboratorio (IT-S11) | IT-S11 ya usaba **≤ 4 min (3–5; alarma > 6 min)**, igual que MO-EAF-06 §5 y MO-LF-01. Actualicé la nota del §10 para que diga que el valor está homologado. **La DP-ACE-S de S-11** (`01-organizacion/descripciones-puesto-sindicalizados.md`, líneas 1174, 1193 y 1208) dice ≤ 3 min y hay que corregirla. La meta final la valida C-09 |

### 2.4 Instrucciones de trabajo de mantenimiento (IT-S19 a IT-S26)
Revisé la sección 6 (pasos, mediciones y límites), la 8 y la 9 (registros) contra MM-/MS-. En los 8 encabezados quedó firmado: "experto-operativo-metalurgia — visto bueno (con observaciones), 2026-09-26".

| IT | Corrección o nota |
|---|---|
| IT-S19 Mecánico | Tarea 4: criterio de cable completo, "6 alambres rotos en un paso **o 3 en un torón**" |
| IT-S20 Electricista | Sin cambios. Maniobra de AT, pruebas del transformador (PI, Tan δ, TTR) y conteo de tierras coherentes con MM-EAF-04 |
| IT-S21 Instrumentista | Sin cambios. Lógica ΔQ 2/4 %, emergencia ≤ 15 s, ESR y calibración ±2 % coherentes |
| IT-S22 Hidráulico | Tarea 3: "agua ≤ 500 ppm" aplica **solo si el aceite es mineral**. La HPU de CC puede usar HFC |
| IT-S23 Soldador | Tarea 3, paso 6: E7018 **seco, del horno de electrodos (bajo hidrógeno)**. Una fuga de panel reparada con electrodo húmedo mete H al tubo y agrieta en frío |
| IT-S24 Refractarista | Sin cambios. EBT, gunning, espesores y olla coherentes con MM-EAF-03 y MM-OLL-01 |
| IT-S25 Taller de moldes | Sin cambios. Conicidad, Cu, diagonales, runout y gap coherentes con MM-CC-01 y MM-CC-02 |
| IT-S26 Lubricador | Sin cambios |

Observación común a las 8 IT: los torques, las presiones de prueba y los intervalos siguen marcados [Validar con OEM]. No se usan en planta hasta que Ingeniería de Mantenimiento los valide.

## 3. Incoherencias en documentos fuente (no editados, por instrucción)
| # | Documento | Qué dice | Qué debe decir | Fuente |
|---|---|---|---|---|
| 1 | MM-EAF-04 §7 (línea 133) | Energía 560–620 kWh/t | 560 kWh/t (520–600) | FT-ACE-001 v0.3 §2 |
| 2 | MS-ACE-04 §4 (líneas 13 y 58) | Grúas de CC 2 × 50 t + 2 × 25 t | 2 × 50 t + 2 × 45 t con tenaza + 1 × 25 t con electroimán | FT-ACE-001 v0.2 §6 |
| 3 | MS-ACE-04 §4 (línea 60) | Cable: 12 alambres en un paso o 4 en un torón | Grúa de colada: 6 en un paso o 3 en un torón (como MM-GR-01) | MM-GR-01 §5 [Verificar ASME B30.2 / OEM] |
| 4 | MS-ACE-05 §7 | Argón reconectado 50–150 NL/min | Prueba del tapón 100–200 NL/min a presión de prueba OEM | MM-OLL-01 §5 |
| 5 | DP-ACE-S S-11 | Análisis ≤ 3 min | ≤ 4 min [Supuesto] (3–5; alarma > 6) | MO-EAF-06 §5 |
| 6 | MO-CC2-03 §5 | Sin acción para 15–20 °C | "< 20 °C: avisa a C-06/C-08; < 15 °C: C-06 decide" | Criterio de proceso |

También siguen abiertas las observaciones de figuras (`eaf-perfil-potencia.svg`, `eaf-ciclo-colada.svg`, `eaf-corte-horno.svg`) que ya estaban en `02-operacion/REVISION-TECNICA.md` (S-7).

## 4. Revisión cruzada necesaria
- **experto-seguridad-salud:** los puntos 2, 3 y 4 son controles de izaje y de espacio confinado; tiene que dar su visto bueno a la corrección de MS-ACE-04 y MS-ACE-05.
- **experto-documentacion-mejora:** control de cambios de los 3 manuales y de la DP. Regenerar los .pptx y las guías de los JSON que cambiaron (MM-CC-03, MM-CC-04, MM-EAF-04, MM-GR-01, MS-ACE-01, -04, -05, -06, -08, MO-CC2-03 y MO-EAF-02).
- **experto-relaciones-laborales:** el cambio en la DP de S-11 toca a un puesto sindicalizado, aunque solo afecta una meta de tiempo.

## 5. Decisión requerida del Director
**Tema:** cómo corregir las 6 incoherencias de la sección 3 en los documentos fuente.

| Opción | Qué implica | Riesgo | Costo |
|---|---|---|---|
| **A. Corregir ya los 3 manuales, la DP y MO-CC2-03** (versión 0.x+1, con control de cambios) | Manual, presentación e IT dicen lo mismo | Bajo | Interno: ≈ 1 día de trabajo de los expertos [Supuesto] |
| B. Corregir solo los de seguridad (MS-ACE-04 y MS-ACE-05) y dejar los demás para la revisión anual | Menos trabajo ahora | Medio: el energético (MM-EAF-04) y la DP siguen incoherentes con la ficha | Interno |
| C. No corregir y usar solo las presentaciones | Ninguno inmediato | Alto: el instructor enseña un valor y el manual de planta dice otro (cable de grúa de colada) | $0 |

**Recomendación: A.** El criterio del cable de la grúa de colada es un control crítico de caída de olla y no debe quedar con dos valores. **Fecha límite para decidir:** 2026-10-02, antes de la primera sesión piloto de MM-GR-01 y MS-ACE-04 [Supuesto].
