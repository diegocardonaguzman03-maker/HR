# MO-EAF-03 — Alimentación continua de DRI/HBI por el 5.º agujero

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-EAF-03 — Alimentación continua de DRI/HBI por el 5.º agujero |
| Área | Hornos · EAF-1 / EAF-2 |
| Serie | Operación |
| Manual base | `02-operacion/eaf/MO-EAF-03-alimentacion-continua-dri.md` v0.1 (visto bueno técnico y de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-01 Primer Hornero · S-02 Segundo Hornero · C-07 Ingeniero de Proceso · C-05 Supervisor de Hornos |
| Presentación | MO-EAF-03_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Fundir ≈ 100 t de DRI por colada a 30–35 kg/min/MW, con baño plano, sin icebergs y sin DRI húmedo

**Principio rector:** Se alimenta al ritmo que el horno funde: nunca más de 35 kg/min/MW.

**Por qué importa:** El DRI es el 60 % de la carga. Si entra más rápido de lo que la potencia funde, se acumula y luego se funde de golpe: ebullición violenta y escoria por la puerta. Si entra húmedo genera vapor e H₂ y explota. Bien alimentado, diluye N y residuales.

## 2. Objetivos de aprendizaje

1. **Aceptar solo DRI seco y en norma.** Revisar metalización, C, finos, T y humedad del lote; con cualquier evidencia de agua, no se alimenta.
2. **Calcular y ajustar la tasa.** Tasa = kg/min/MW × MW / 1,000; rampa de 25 a 32 kg/min/MW en 2–3 min y ajuste con la T del baño.
3. **Evitar y corregir icebergs.** Reconocer caída de T, arco inestable y montón visible; detener el DRI, O₂ a la zona y potencia plena.
4. **Terminar en el total y a tiempo.** ≈ 100 t de DRI; paro 3–5 min antes del vaciado y registro completo de la colada.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Sesión 1 de 3: apertura y por qué importa | 30 | Casos de ebullición violenta por iceberg | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del flujo con el corte del horno | Láminas 3–6 |
| 3. Balance de masa y energía | 90 | Ejercicio: tasa con MW y kg/min/MW | Calculadora, tendencias N2 |
| 4. Equipos y parámetros | 60 | Consigna inicial por tipo de material | Láminas 7–8 |
| 5. Seguridad | 60 | Espacio confinado con N₂; árbol de emergencia | Láminas 9–10, EPP físico |
| 6. Calidad y paso a paso | 75 | Lectura guiada de los 12 pasos; pasos ★ | Láminas 11–13 |
| 7. Condiciones anormales | 45 | Simulacro de mesa: iceberg y boiling | Lámina 14 |
| 8. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 17 |
| 9. Cierre y ruta a OJT | 30 | Plan de OJT y certificación | Láminas 15–16, 18 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en la alimentación | RACI |
| --- | --- | --- |
| C-07 Ingeniero de Proceso EAF / LF | Dueño; define kg/min/MW, rampas, relación cal/DRI y límites de T | A |
| S-01 Primer Hornero | Arranca, ajusta y detiene; vigila T, escoria y señales de iceberg | R |
| S-02 Segundo Hornero | Mide T durante la alimentación; observa el baño por puerta y cámara | R |
| C-05 Supervisor de Hornos | Autoriza consignas fuera de rango y DRI de calidad dudosa | C |
| Planta DRI / transporte | Informa metalización, C, finos y T; avisa cualquier humedad | I / C |

### 4.2 Flujo del proceso

1. **Lote OK:** Seco, finos ≤ 5 %, en especificación
2. **Arranque:** Canasta ≥ 70 % fundida, baño plano
3. **Rampa:** 25 → 32 kg/min/MW en 2–3 min
4. **Cal:** Relación cal/DRI de C-07
5. **Medir T:** 1,570–1,610 °C a mitad de la etapa
6. **Ajustar:** < 1,560: −10–20 %; > 1,630: +5–10 %
7. **Vigilar iceberg:** Caída de T, arco raro, montón visible
8. **Paro:** ≈ 100 t; 3–5 min antes del vaciado

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Transportador de DRI caliente | Lleva DRI de la planta DRI | 500–650 °C; con N₂ [Validar con OEM] | Sin alarma de O₂ alto; sellos OK |
| Silos y tolvas de día | Almacenan DRI frío y HBI | Cerrados y secos | Sin agua; T del silo sin alarma |
| Alimentador con báscula | Dosifica la tasa | 0–5.0 t/min; ± 1 % [Supuesto] | Calibración vigente; sin atascos |
| Tolva de cal y dolomita | Co-alimenta fundentes | Cal 30–45 kg/t; dolomita 10–15 kg/t | Nivel suficiente para la colada |
| Ducto del 5.º agujero | Lleva el DRI al centro del horno | Enfriado por agua [Validar con OEM] | Sin obstrucción; agua sin alarma |
| Controlador de tasa | Tasa = kg/min/MW × MW | Consigna 30–35 kg/min/MW | Enclavamientos activos |
| Cámara del horno | Ver montones de DRI | — | Imagen disponible |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| Consigna | 32 kg/min/MW | 30–35 | > 35 o < 25 | > 35: bajar; < 25: ver causa |
| Tasa de DRI | 3.8 t/min | 3.5–4.3 t/min | > 4.3 t/min frío/HBI | Bajar a 32 kg/min/MW |
| DRI por colada | ≈ 100 t | 95–105 t | ± 10 t del cálculo | Ajustar con C-07 |
| T del baño | 1,590 °C | 1,570–1,610 [Supuesto] | < 1,560 o > 1,630 °C | Ajustar la tasa (flujo) |
| T del DRI caliente | 600 °C | 500–650 °C | < 450 °C | Recalcular consigna con C-07 |
| Metalización | ≥ 93 % [Supuesto] | 92–95 % | < 91 % | Bajar tasa; más O₂/C; C-07 |
| Finos (< 3 mm) | ≤ 3 % [Supuesto] | — | > 5 % | Bajar la tasa y avisar |
| Humedad del DRI/HBI | Seco, sin agua | — | Cualquier evidencia | ★ No alimentar |

> C del DRI 1.5–3.0 % (< 1.2 %: ajustar C); cal/DRI 50–65 kg/t [Supuesto]. > 4.3 t/min solo con DRI caliente validado [Validar con Ingeniería de Proceso].

### 4.5 Seguridad: controles críticos

- ★ **DRI húmedo no entra al horno:** Agua + DRI = vapor e H₂: explosión. Silos y transportadores cerrados; con cualquier evidencia de agua, no se alimenta.
- ★ **Límite anti-iceberg: 35 kg/min/MW:** Arranque con baño plano y T ≥ 1,560 °C. Más de 35 solo con DRI caliente, validación de C-07 y gestión del cambio.
- ★ **N₂ en galerías del transportador:** Solo con permiso de espacio confinado, purga y medición: O₂ 19.5–23.5 %, CO < 25 ppm y < 10 % LEL (MS-ACE-05/06).
- ★ **CO en la plataforma de bóveda:** Detector multigás: CO 25 ppm salir, 200 ppm evacuar el sector. Nadie bajo el 5.º agujero durante la alimentación.

**EPP:** Casco, lentes y ropa ignífuga · Guantes y botas con metatarsal · Protección auditiva · Detector personal de CO y de O₂ en galerías · Respirador para polvo en tolvas y transportadores

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| N del acero | ≤ 50 ppm al vaciado [Supuesto] | Muestra al vaciado | Envejecimiento; menor ductilidad |
| P al vaciado | ≤ 0.015 % | Muestra antes de vaciar | P fuera de especificación |
| C del baño | 0.04–0.08 % al vaciado | O activo + muestra | Sobreoxidación o C alto |
| Residuales Cu, Sn, Ni, Cr | Diluidos por el DRI; según grado | Muestra | Grietas superficiales en laminación |
| Rendimiento metálico | Según balance de C-07 | Cada colada | FeO alto en escoria = pérdida de Fe |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Revisa la calidad del lote | En nivel 2: metalización, C, finos, T y reporte de humedad de la planta DRI | En rango; sin humedad | ★ | S-01 |
| 2 | Verifica el sistema | Tolvas con inventario; alimentador sin alarmas; ducto del 5.º agujero libre; cal disponible | Sin alarmas |  | S-01 |
| 3 | Confirma el arranque | Energía ≥ 150 kWh/t, baño plano (corriente estable), escoria espumosa formándose | Canasta ≥ 70 % fundida |  | S-01 |
| 4 | Arranca con rampa | Inicia a 25 kg/min/MW y sube a 32 kg/min/MW en 2–3 min | Tasa estable |  | S-01 |
| 5 | Arranca la cal | Relación cal/DRI según C-07; dolomita según el MgO objetivo | Relación en consigna |  | S-01 |
| 6 | Mide T a mitad de la etapa | S-02 mide con la lanza manipuladora ≈ min 24–26 de arco | 1,570–1,610 °C |  | S-02 |
| 7 | Ajusta la consigna | < 1,560 °C: baja 10–20 %; > 1,630 °C: sube 5–10 % sin pasar 35 kg/min/MW | T en rango |  | S-01 |
| 8 | Vigila señales de iceberg | Caída de T, arco inestable en una fase, montón bajo el 5.º agujero, caída de CO en humos | Sin señales | ★ | S-01 / S-02 |
| 9 | Corrige un iceberg | Detén el DRI, O₂ a la zona, potencia plena, mide T; reanuda a 25 kg/min/MW cuando se funda | Montón fundido; T ≥ 1,580 °C | ★ | S-01 |
| 10 | Controla el total | Sigue el acumulado contra el objetivo (≈ 100 t) calculado por nivel 2 | ± 5 t del objetivo |  | S-01 |
| 11 | Detén la alimentación | 3–5 min antes del vaciado (fin de la etapa 3) o al llegar al total | DRI detenido |  | S-01 |
| 12 | Registra | Total de DRI, tasa y kg/min/MW promedio, T medidas y eventos | Registro completo |  | S-01 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Humedad en el DRI | Detener el DRI; aislar el lote; no usar hasta que C-07 y la planta DRI lo liberen | C-05, C-07, DRI |
| Caída de T > 20 °C en 5 min | Bajar o detener el DRI; potencia plena; O₂ a la zona | C-07 |
| Ebullición violenta (boiling) | Detener DRI y C; bajar O₂; todos fuera del frente de la puerta; no agregar C | C-05, C-04 |
| Arco inestable con DRI | Bajar la tasa; ajustar O₂/C (MO-EAF-05) | C-07 |
| Alimentador atascado | Cambiar a DRI frío/HBI si hay; Mantenimiento con LOTO | C-05, Mtto |
| O₂ o T alta en silo/transportador | Protocolo de la planta DRI; purga de N₂; no entrar | C-05, C-16 |
| Finos en el 4.º agujero | Bajar la tasa; avisar a la planta DRI | C-07 |
| Fuga de agua (Δ caudal > 2 %) | DRI se detiene; con > 4 % o agua visible: arco fuera, no inclinar, evacuar ≥ 25 m | C-05, C-04 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. A 119 MW y 32 kg/min/MW, ¿cuál es la tasa de DRI?
   a) ≈ 2.8 t/min
   b) ≈ 3.8 t/min
   c) ≈ 4.8 t/min

2. ¿Con qué condición arrancas la alimentación de DRI?
   a) Al cerrar la bóveda
   b) Canasta ≥ 70 % fundida, baño plano
   c) Cuando la T pasa de 1,630 °C

3. La T del baño cae a 1,550 °C durante la alimentación. ¿Qué haces?
   a) Subir la tasa 10 %
   b) Bajar la tasa 10–20 %; buscar iceberg
   c) Agregar carbono en masa

4. ¿Cuál es el límite de consigna para evitar icebergs?
   a) 25 kg/min/MW
   b) 35 kg/min/MW
   c) 45 kg/min/MW

5. La planta DRI reporta un lote mojado. ¿Qué haces?
   a) Alimentarlo a tasa baja
   b) No alimentar y aislar el lote
   c) Mezclarlo con DRI caliente

**Clave de respuestas:**

1. b) ≈ 3.8 t/min — 119 × 32 / 1,000 ≈ 3.8 t/min: 100 t de DRI en ≈ 26 min.
2. b) Canasta ≥ 70 % fundida, baño plano — Con chatarra sólida alta el DRI se pega y forma icebergs. Energía acumulada ≥ 150 kWh/t.
3. b) Bajar la tasa 10–20 %; buscar iceberg — < 1,560 °C: bajar la tasa 10–20 %, potencia plena y revisar acumulación.
4. b) 35 kg/min/MW — Más de 35 kg/min/MW solo con DRI caliente validado por C-07 y gestión del cambio.
5. b) No alimentar y aislar el lote — DRI húmedo genera vapor e H₂: explosión. Se aísla hasta que C-07 y la planta DRI lo liberen.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-01 Primer Hornero | U | 20 h | 120 h / 40 coladas | 24 meses |
| S-02 Segundo Hornero | L | 8 h | 20 coladas | 24 meses |
| C-07 Ingeniero de Proceso | O | 24 h | — | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Rechaza un lote con humedad y explica el mecanismo de explosión (vapor + H₂)
- [ ] Calcula la tasa en t/min a partir de MW y kg/min/MW
- [ ] Reconoce 3 señales de iceberg y ejecuta la corrección
- [ ] Conoce los enclavamientos que detienen el DRI
- [ ] Ante una ebullición violenta, despeja el frente de la puerta

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **DRI húmedo no se alimenta.** Cualquier evidencia de agua: detener el DRI y aislar el lote.
- **Nunca más de 35 kg/min/MW.** Arriba de ese límite el DRI se acumula: iceberg y ebullición violenta.
- **Sin baño plano no hay DRI.** Arranque con la canasta ≥ 70 % fundida y escoria espumosa formándose.
- **Galerías con N₂: solo con permiso.** Espacio confinado: purga y medición de O₂, CO y LEL antes de entrar.

## 7. Por confirmar

- Inertización del transportador, ducto del 5.º agujero y enclavamientos con el OEM
- Tasa > 4.3 t/min con DRI caliente: requiere validación de C-07 y gestión del cambio
- T del baño, metalización, C, finos, cal/DRI y N al vaciado (supuestos)

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno con observaciones — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

