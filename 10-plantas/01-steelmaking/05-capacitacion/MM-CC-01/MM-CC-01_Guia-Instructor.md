# MM-CC-01 — Cambio y preparación de moldes (placas CC1 / tubos CC2): medición de conicidad y desgaste

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MM-CC-01 — Cambio y preparación de moldes (placas CC1 / tubos CC2): medición de conicidad y desgaste |
| Área | Acería · CC1, CC2 y taller de moldes |
| Serie | Mantenimiento |
| Manual base | `03-mantenimiento/MM-CC-01-moldes-conicidad-desgaste.md` v0.2 (borrador para validación; visto bueno de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-25 Mecánico de Taller · S-19 Mecánico · S-21 Instrumentista · S-22 · S-20 · operador de grúa de CC · C-16 (ESR) |
| Presentación | MM-CC-01_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Moldes con conicidad, superficie y agua correctas, cambiados sin acero en la máquina ni fuente abierta

**Principio rector:** Nunca se cierra el agua de molde con acero en la máquina.

**Por qué importa:** El molde forma la cáscara del acero. Una conicidad mal ajustada, un Cu delgado o una fuga de agua terminan en grietas, romboidad o breakout, y un breakout con agua es explosión. En CC2 cada molde tiene una fuente de Cs-137: se trabaja solo con el obturador cerrado por el ESR.

## 2. Objetivos de aprendizaje

1. **Medir y decidir en taller.** Conicidad, espesor de Cu, rayas, Ni, lado y diagonales contra criterio: reutilizar, rectificar o desechar.
2. **Cambiar el molde sin riesgo.** Máquina vacía, obturador de Cs-137 cerrado por el ESR, LOTO, energía cero y drenado a 0 bar.
3. **Alinear y verificar en máquina.** Alineación ±0.3 mm con segmento 0 o pie de rodillos, conicidad ±0.05 %/m y termopares BOP al 100 %.
4. **Liberar con caudal nominal.** Sin fugas, caudal ≥ 100 % nominal, oscilación sin alarmas y checklist firmado por C-11 y C-06.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de breakout por molde | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del flujo taller–máquina | Láminas 3–6 |
| 3. Equipos y especificaciones | 90 | Ejercicio: calcular conicidad con Ws, Wi y L | Láminas 7–8, calculadora |
| 4. Seguridad, LOTO y energía cero | 75 | Puntos de bloqueo de CC y papel del ESR | Láminas 9–10, candados |
| 5. Calidad y paso a paso | 90 | Lectura guiada de los 16 pasos; pasos ★ | Láminas 11–13 |
| 6. Práctica de metrología | 60 | Conicímetro, perfilómetro y UT en taller | Taller de moldes |
| 7. Condiciones anormales | 45 | Simulacro de mesa: obturador trabado | Lámina 14 |
| 8. Evaluación teórica | 30 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en el cambio de molde | RACI |
| --- | --- | --- |
| C-11 Supervisor de Mantenimiento Mecánico | Dueño; programa de moldes y liberación a máquina | A |
| S-25 Mecánico de Taller de Moldes | Desarme, medición, armado y pruebas en taller | R |
| S-19 Mecánico de Acería | Cambio en máquina, conexiones de agua y alineación | R |
| S-21 Instrumentista | Termopares BOP, sensor de nivel (CC1) y EMS (CC2) | R |
| S-22 / S-20 | LOTO hidráulico (acumuladores) y eléctrico del EMS (NOM-029) | R |
| Operador de grúa de CC (50 t) | Iza el molde | R |
| C-16 como ESR (CC2) | Cierra el obturador de Cs-137, pone su candado y mide < 2 × fondo | R (CC2) |
| C-06 Supervisor de CC | Entrega la máquina vacía y firma la liberación | A (operación) |

### 4.2 Flujo del proceso

1. **Sale de máquina:** Por tonelaje o defecto
2. **Medir en taller:** Perfil, conicidad, Cu, rayas, Ni
3. **Decidir:** Reusar, rectificar ≤ 2 mm o desechar
4. **Armar:** Torque en secuencia, 3 pasadas
5. **Prueba de presión:** 1.5 × P operación, 30 min
6. **TC y conicidad:** BOP al 100 %; ajuste de tabla
7. **Montar:** Máquina vacía, fuente cerrada, LOTO
8. **Alinear y probar:** ±0.3 mm; caudal nominal
9. **Liberar:** Firma C-11 y C-06

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Placas anchas CC1 (Cu-Ag + Ni) | Solidificar la cáscara | 900 mm; Cu nuevo ≈ 40 mm [Validar] | Cu ≥ 25 mm; rayas ≤ 0.5 mm |
| Placas angostas CC1 | Ancho y conicidad | 1.0–1.2 %/m | ±0.05 %/m del ajuste |
| Termopares BOP (3 filas) | Predicción de breakout | Tipo K / T [Validar] | Todos leen; responden a calor |
| Tubo CC2 (Cu-Ag) | Molde de palanquilla | 1,000 mm; 160 × 160; 0.8–1.0 %/m | Diagonales y conicidad en criterio |
| Chaqueta de agua CC2 | Agua de alta velocidad | Ranura ≈ 4 mm [Validar]; 10–12 m/s | Ranura uniforme ±0.2 mm |
| Conicímetro y perfilómetro | Medir conicidad y perfil | ±0.01 %/m; ±0.02 mm | Calibrados |
| Banco de prueba de presión | Hermeticidad | Hasta 25 bar | Manómetro calibrado |

### 4.4 Parámetros

| Especificación | Objetivo | Tolerancia | Límite / rechazo | Frecuencia |
| --- | --- | --- | --- | --- |
| Conicidad angosta CC1 | Tabla C-08 (1.0–1.2) | ±0.05 %/m | > ±0.1 %/m | Cada armado y paro |
| Espesor de Cu (CC1) | ≥ 35 mm | ≥ 25 mm | < 25 mm: desechar | Cada desarme |
| Rayas / Ni perdido | 0 mm | ≤ 0.3 mm | > 0.5 mm: rectificar | Cada salida |
| Conicidad tubo CC2 | 0.9 %/m | 0.8–1.0 %/m | Pérdida > 20 % | Cada salida |
| Diagonales CC2 | ≤ 0.3 mm | ≤ 0.5 mm | > 0.5 mm: desechar | Cada salida |
| Lado del tubo (menisco) | 160.0 mm | ±0.3 mm | > ±0.5 mm | Cada salida |
| Prueba de presión | 1.5 × P op / 30 min | — | Caída o goteo | Cada armado |
| Alineación a segmento 0 | 0 mm | ±0.3 mm | > ±0.5 mm | Cada cambio |

> Espesores, desgastes, ranura, torques (típ. 100–150 N·m), presión de prueba (típ. 15 bar) y vida de tubos: [Validar con OEM / Ingeniería de Mantenimiento].

### 4.5 Seguridad: controles críticos

- ★ **Máquina vacía antes de tocar el agua:** Fin de secuencia, sin acero ni hebra sin solidificar, barra falsa estacionada; entrega firmada por C-06.
- ★ **Fuente de Cs-137 cerrada (CC2):** El ESR (C-16) cierra el obturador, pone su candado y mide < 2 × fondo en el punto de trabajo y a 1 m (MS-ACE-07).
- ★ **LOTO y prueba de energía cero:** Agua, HPU de oscilación y ancho, EMS y secundario bloqueados; oscilación rechazada, 0 bar y detector de tensión.
- ★ **Izaje del molde:** Aparejo certificado, prueba de levante a 100 mm; nadie bajo la carga ni a ± 5 m de su proyección (MS-ACE-04).

**EPP:** Casco, lentes y careta para esmerilado · Guantes anticorte y botas metatarsales · Protección auditiva · Máquina caliente: ropa FR y guantes para calor · Dosímetro personal cerca de la fuente (CC2)

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Conicidad CC1 | 1.0–1.2 %/m ±0.05 | Conicímetro, cada armado y paro | Grietas longitudinales o transversales |
| Desgaste y Ni CC1 | ≤ 0.5 mm; Ni íntegro | Visual y profundímetro | Grietas en estrella (Cu); marcas |
| Diagonales CC2 | \|D1 − D2\| ≤ 0.5 mm | Perfilómetro | Romboidad, grietas de esquina |
| Conicidad CC2 | 0.8–1.0 %/m | Perfilómetro | Cáscara delgada, abultamiento |
| Ranura de agua | ±0.2 mm | Lainas en 4 lados y 3 alturas | Enfriamiento desigual, romboidad |
| Termopares BOP | 100 % funcionales | Prueba con calor | Breakout no detectado (sticker) |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Verifica el molde nuevo | Hoja de liberación de taller: prueba de presión, conicidad o perfil, TC y torques | Hoja completa y firmada | ★ | S-25, C-11 |
| 2 | Asegura la máquina | Fin de secuencia; sin acero ni hebra sin solidificar; barra falsa estacionada | Entrega firmada por C-06 | ★ | C-06 |
| 3 | Cierra la fuente (CC2) | El ESR cierra el obturador, pone candado y tarjeta y mide en el punto de trabajo y a 1 m | < 2 × fondo en el permiso | ★ | C-16 (ESR) |
| 4 | Aplica LOTO | Agua de molde, HPU, EMS y enfriamiento secundario; candados personales | Candados puestos | ★ | S-19, S-22 |
| 5 | Prueba energía cero | Intento de oscilación; manómetros 0 bar; detector de tensión | Sin energía | ★ | C-11 |
| 6 | Drena y desconecta | Drena el agua hasta 0 bar; desconecta mangueras y acoples; tapa conexiones | 0 bar; sin agua | ★ | S-19 |
| 7 | Retira el molde | Aparejo certificado, prueba de levante a 100 mm, traslado a taller | Nadie bajo la carga | ★ | Grúa, S-19 |
| 8 | Limpia asientos | Mesa de oscilación y asientos sin salpicaduras | Superficies limpias |  | S-19 |
| 9 | Instala el molde | Baja guiado; asienta en pernos de centrado; aprieta anclajes al torque OEM | Asentado | ★ | S-19 |
| 10 | Conecta agua y prueba | Presuriza a presión de operación 10 min | Sin fugas | ★ | S-19 |
| 11 | Alinea con segmento 0 | Regla de alineación y lainas en 4 puntos (pie de rodillos en CC2) | ±0.3 mm |  | S-25 |
| 12 | Verifica conicidad (CC1) | Conicímetro en ambas caras angostas, puntos P1–P3 | Tabla ±0.05 %/m |  | S-25 |
| 13 | Verifica TC y nivel | Todos los TC leen; sensor de nivel (CC1) o detector (CC2) conectado | 100 % |  | S-21 |
| 14 | Retira LOTO | Orden inverso, personal fuera; al final el ESR retira su candado, abre y verifica la señal | Señal de nivel ± 5 mm | ★ | Todos, ESR |
| 15 | Prueba funcional | Agua a caudal nominal (CC1 ≈ 4,200 / 450 L/min; CC2 ≈ 2,000 L/min); oscilación en vacío | Caudal ≥ 100 %, sin alarmas | ★ | S-21, S-12 |
| 16 | Libera | Checklist de liberación firmado por Mantenimiento y Operación | Firmado por C-11 y C-06 | ★ | C-11, C-06 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Fuga de agua en molde con acero | Fin de colada controlado; MS-ACE-09 | C-06, C-04 |
| Alarma BOP repetitiva | Reducir velocidad (MO-CC1-04); revisar TC y conicidad al paro | C-08, S-21 |
| Grietas longitudinales recurrentes | Medir conicidad y desgaste; análisis con C-08 | C-08, C-11 |
| Romboidad en palanquilla | Cambiar el tubo de la línea | C-08, S-25 |
| Prueba de presión cae | Rehacer el armado | S-25 |
| Radiámetro ≥ 2 × fondo, cerrado | No trabajar; alejarse ≥ 3 m y delimitar; plan de emergencia del ESR | C-16 (ESR), C-06 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuándo se puede cerrar el agua de molde?
   a) Al bajar la velocidad
   b) Solo con la máquina vacía
   c) Con la hebra en el segmento 0

2. La placa ancha de CC1 mide 24 mm de Cu. ¿Qué se hace?
   a) Rectificar 2 mm
   b) Desechar la placa
   c) Montar y medir después

3. ¿Con qué diferencia de diagonales se desecha un tubo CC2?
   a) > 0.1 mm
   b) > 0.5 mm
   c) > 2 mm

4. ¿Quién cierra el obturador de Cs-137 antes del cambio en CC2?
   a) El mecánico S-19
   b) El ESR (C-16)
   c) El operador de púlpito

5. ¿Qué tolerancia tiene la alineación molde–segmento 0?
   a) ±0.3 mm
   b) ±1.0 mm
   c) ±3 mm

**Clave de respuestas:**

1. b) Solo con la máquina vacía — Nunca con acero en la máquina: sin acero en molde ni hebra sin solidificar y barra falsa estacionada.
2. b) Desechar la placa — Con Cu < 25 mm la placa va a desecho o recuperación de Cu; el rectificado máximo es 2 mm por vez.
3. b) > 0.5 mm — |D1 − D2| > 0.5 mm provoca romboidad, grietas de esquina y riesgo de breakout.
4. b) El ESR (C-16) — Solo el ESR cierra, pone su candado y mide < 2 × fondo en el punto de trabajo y a 1 m.
5. a) ±0.3 mm — Objetivo 0, tolerancia ±0.3 mm; arriba de ±0.5 mm se corrige con lainas o reajuste.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-25 Mecánico de Taller | U | 32 h | 80 h / 5 CC1 + 10 tubos | 24 meses |
| S-19 Mecánico de Acería | U | 16 h | 3 cambios | 24 meses; izaje 12 |
| S-21 Instrumentista | U | 8 h | 3 verificaciones | 24 meses |
| S-22 / S-20 | U | 8 h / NOM-029 + 4 h | 3 bloqueos | 24 / 12 meses |
| Operador de grúa de CC | U | NOM-006 | 3 izajes de molde | 12 meses |
| Cerca de la fuente (CC2) | L | NOM-012 (8 h) | — | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Revisa la hoja de taller y recibe la máquina vacía firmada por C-06
- [ ] Confirma que el ESR cerró el obturador con su candado y midió < 2 × fondo
- [ ] Aplica LOTO con candado personal, prueba energía cero y drena a 0 bar
- [ ] Iza sin nadie bajo la carga; asienta a torque y prueba sin fugas
- [ ] Retira LOTO con personal fuera y el ESR verifica la señal de nivel
- [ ] Confirma caudal nominal y libera con firma de C-11 y C-06

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Sin máquina vacía no se toca el agua.** Nunca se cierra el agua de molde con acero en la máquina.
- **Fuente cerrada por el ESR (CC2).** Obturador con candado del ESR y radiación < 2 × fondo.
- **Sin hoja de taller el molde no sube.** Presión, conicidad, termopares y torques registrados.
- **Sin LOTO y energía cero no se toca.** Candado personal; oscilación rechazada, 0 bar y 0 V.

## 7. Por confirmar

- Espesores de Cu, desgastes y ranura de chaqueta con el OEM
- Torques, presión de prueba (típ. 15 bar) y peso del molde CC1 (20–30 t)
- Vida de tubos CC2 (400–700 coladas) y tiempo de cambio de molde CC1

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | Pendiente |
| Seguridad | experto-seguridad-salud | Pendiente |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

