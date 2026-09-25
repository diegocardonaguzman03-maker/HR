# MO-CC1-06 — Cambio de SEN y de distribuidor en caliente (incluye clogging)

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-CC1-06 — Cambio de SEN y de distribuidor en caliente (incluye clogging) |
| Área | Colada Continua 1 · planchón |
| Serie | Operación |
| Manual base | `02-operacion/cc1/MO-CC1-06-cambio-sen-y-distribuidor.md` v0.1 (visto bueno técnico y de seguridad sin observaciones · 2026-09-25) |
| Audiencia | S-13 Operador de Plataforma · S-14 Ayudante de Colada · S-12 Operador de Púlpito · S-15 Preparador · C-06 |
| Presentación | MO-CC1-06_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Manejar el clogging y cambiar SEN o distribuidor sin perder la secuencia, sin rebose y sin exponer a nadie

**Principio rector:** Solo piezas precalentadas y liberadas, y nadie bajo el molde hasta que la unión pase el segmento 3.

**Por qué importa:** La alúmina tapa la SEN y el flujo se vuelve asimétrico: grietas, inclusiones y al final pérdida de nivel. Cambiar la SEN o el distribuidor con acero en el molde expone al frente a salpicaduras, y una unión débil o una rampa rápida pueden terminar en breakout.

## 2. Objetivos de aprendizaje

1. **Detectar y manejar el clogging.** Tapón que sube > 10 % en 15 min: argón en pasos de 1 NL/min hasta 8; > 80 % de apertura baja la velocidad.
2. **Cambiar la SEN en caliente.** SEN nueva ≥ 1,000 °C; velocidad 0.5 m/min; ≤ 10 s sin flujo; nivel ± 3 mm en ≤ 60 s.
3. **Cambiar el distribuidor en caliente.** Cerrar el tapón a 400 mm, línea detenida ≤ 3 min, abrir a 500 mm y reanudar a 0.3 m/min con rampa.
4. **Proteger al personal y la unión.** Solo S-13 y S-14 al frente; exclusión bajo el molde hasta que la unión pase el segmento 3.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Sesión 1 de 2: apertura y por qué importa | 30 | Casos de clogging y breakout en la unión | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido de las tres maniobras con las figuras | Láminas 3–6 |
| 3. Equipos y parámetros | 90 | Ejercicio: leer una tendencia del tapón | Láminas 7–8, tendencias reales |
| 4. Seguridad | 60 | Zona roja del frente y exclusión bajo el molde | Láminas 9–10, EPP físico |
| 5. Calidad y paso a paso | 105 | Lectura guiada de los 16 pasos; pasos ★ | Láminas 11–13 |
| 6. Condiciones anormales | 75 | Simulacro de mesa: cambiador que no acciona | Lámina 14 |
| 7. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + preguntas orales | Lámina 16 |
| 8. Cierre y ruta a OJT | 30 | Plan de OJT, simulador y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en el cambio | RACI |
| --- | --- | --- |
| C-06 Supervisor de Colada Continua | Decide el cambio, dirige la maniobra y la zona de exclusión | A |
| S-13 Operador de Plataforma | Opera cambiador de SEN, carros del distribuidor, olla y tapón | R |
| S-14 Ayudante de Colada | Polvo, menisco, centrado de la SEN, costras y grapa | R |
| S-12 Operador de Púlpito | Velocidad, nivel, detención y rampa; eventos en el tracking | R |
| S-15 Preparador de Distribuidores | Entrega distribuidor y SEN de repuesto precalentados (MO-CC1-01) | R |
| C-08 Ingeniero de Proceso de CC | Criterios de clogging, vida de SEN y de distribuidor | C |
| C-07 Ingeniero de Proceso EAF / LF | Ajusta el tratamiento con Ca ante clogging repetido | C |
| C-09 Metalurgista de Producto | Disposición de planchones de unión y con evento | I |

### 4.2 Flujo del proceso

1. **Detectar:** Tapón sube > 10 % en 15 min
2. **Anticlogging:** Ar +1 NL/min cada 5 min, máx. 8
3. **Decidir:** Sin mejora en 15 min o ΔT > 2 °C
4. **Cambio de SEN:** 0.5 m/min; tapón cerrado ≤ 10 s
5. **Recuperar:** Nivel ± 3 mm en ≤ 60 s; rampa
6. **Vaciar el viejo:** Velocidad por nivel; tapón a 400 mm
7. **Cambiar:** Línea detenida ≤ 3 min; SEN centrada
8. **Reanudar:** 500 mm; −60 mm; 0.3 m/min y rampa
9. **Unión:** Exclusión hasta pasar el segmento 3

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Barra tapón y lazo de nivel | Regula flujo; indica clogging | Argón 3–8 NL/min | Tendencia de posición en HMI |
| SEN | Entrega al molde | Inmersión 120–160 mm; manga ZrO₂ | Vida 8–10 h [Validar con OEM] |
| Cambiador de SEN [Supuesto] | Cambia la SEN sin cambiar distribuidor | Hidráulico; placa de SEN | Probado en frío; repuesto caliente |
| Precalentador de SEN | Mantiene la SEN de repuesto | ≥ 1,000 °C | Temperatura registrada |
| Carros de distribuidor [Supuesto] | Intercambian distribuidores | Elevación, traslación, X–Y, pesaje | Frenos, límites; ruta despejada |
| Distribuidor nuevo | Reemplazo | 1,100 ± 50 °C (MO-CC1-01) | ★ ≤ 10 min sin quemador |
| Grapa de unión | Refuerza la unión | Según OEM [Validar con OEM] | Seca, en la plataforma |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| Posición del tapón | Estable ± 5 % | — | > 10 % en 15 min / > 80 % | Escalera anticlogging |
| Argón de barra tapón | 4–5 NL/min | 3–8 NL/min | Máx. 8 NL/min | No exceder: pinholes |
| Relación Ca/Al (LF) | 0.10 | 0.08–0.14 | < 0.07 | C-07 ajusta CaSi en LF |
| SEN de repuesto | ≥ 1,050 °C | 1,000–1,150 °C | < 1,000 °C | No usar |
| Tiempo sin flujo (SEN) | ≤ 5 s | ≤ 10 s | > 15 s | C-06 evalúa |
| Nivel en cambio de SEN | 0 → −20 mm máx. | 0 a −30 mm | < −40 o > + 8 mm | Recuperar en manual |
| Cierre del distribuidor viejo | 400 mm | 400–450 mm | < 400 mm | Riesgo de arrastre de escoria |
| Línea detenida (distrib.) | ≤ 3 min | 2–4 min | > 5 min | Grapa o cierre de secuencia |

> Al reanudar: 0.3 m/min y rampa ≤ 0.2 m/min por minuto. Tiempos, criterios de clogging, Ca/Al y vidas: [Validar con OEM / Ingeniería de Proceso].

### 4.5 Seguridad: controles críticos

- ★ **Zona roja del frente del molde:** Durante la maniobra solo S-13 y S-14 con aluminizado completo; C-06 cuenta al personal.
- ★ **Exclusión bajo el molde:** Reforzada hasta que la unión o el planchón del cambio de SEN pase el segmento 3; rampa lenta.
- ★ **Solo piezas precalentadas:** Distribuidor liberado (MO-CC1-01) y SEN ≥ 1,000 °C. Con vapor o SEN fría, no se usa.
- ★ **Carros y distribuidor viejo:** Ruta despejada, alarma y nadie entre carros; el viejo lleva ≈ 14 t: traslado lento a fosa seca.

**EPP:** Aluminizado completo: chamarra, polainas y capucha · Careta IR, ropa FR y guantes aluminizados · Botas con metatarsal y protección auditiva · Detector personal de O₂/CO

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Simetría del flujo | Diferencia de ΔT ≤ 1.5 °C | Continuo, nivel 2 | Grietas longitudinales, inclusiones |
| Nivel en el cambio | 0 a −30 mm; recupera ≤ 60 s | Tendencia | Slivers, depresiones |
| Planchón de cambio de SEN | Marcado | Tracking en MES | Inspección especial (MO-CC1-09) |
| Planchón de unión | Marcado; inspección 100 % | Tracking en MES | Degradar o rechazar según C-09 |
| Grados incompatibles | Sin mezcla | Cambio de distribuidor | Química fuera de especificación |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Detecta el clogging | Posición del tapón sube > 10 % en 15 min con velocidad y ancho constantes | Tendencia confirmada |  | S-12 |
| 2 | Aplica la escalera | Argón +1 NL/min cada 5 min, máx. 8; pulsa el tapón si el OEM lo permite; > 80 %: −0.1 m/min | Tapón estable |  | S-13 / S-12 |
| 3 | Decide e informa a LF | Sin mejora en 15 min o ΔT entre anchas > 2 °C: cambio de SEN; muestra Ca/Al a C-07 | Decisión de C-06 |  | C-06 / C-08 |
| 4 | Prepara la SEN nueva | Precalentada ≥ 1,000 °C; revisa grietas y puertos | SEN lista | ★ | S-15 / S-13 |
| 5 | Despeja la zona | Solo S-13 y S-14 en el frente; zona bajo el molde despejada | Confirmación de C-06 | ★ | C-06 |
| 6 | Prepara el cambio | Velocidad a 0.5 m/min con rampa; nivel en manual; retira costras; SEN en la guía del cambiador | SEN asentada |  | S-12 / S-13 |
| 7 | Cierra el tapón y cambia | Tapón cerrado y acciona el cambiador: la SEN nueva empuja a la vieja | ≤ 10 s sin flujo | ★ | S-13 |
| 8 | Abre y recupera | Apertura progresiva a 0 mm y automático; inmersión 120–160 mm, centrada ± 5 mm; rampa; marca evento | ± 3 mm en ≤ 60 s |  | S-13 / S-12 |
| 9 | Confirma distribuidor nuevo | Liberado (MO-CC1-01); 1,100 ± 50 °C; SEN ≥ 1,000 °C; carro 2 en espera | Firma de liberación | ★ | S-15 / C-06 |
| 10 | Establece la zona roja | Olla nueva en torreta sin abrir; frente del molde solo S-13 y S-14; nadie bajo el molde | Confirmación | ★ | C-06 |
| 11 | Vacía el distribuidor viejo | Velocidad por nivel: 800 mm 0.9; 700 mm 0.6; 600 mm 0.4 m/min | Nivel baja controlado |  | S-12 |
| 12 | Cierra el tapón a 400 mm | Cierra y detén la extracción (velocidad 0); mantén oscilación y agua de molde | Línea detenida; hora | ★ | S-13 / S-12 |
| 13 | Cambia el distribuidor | Cubre el menisco; carro 1 a la fosa; carro 2 centrado ± 5 mm; grapa si > 3 min; olla a 500 mm | Sin derrame |  | S-13 / S-14 |
| 14 | Abre el tapón | Apertura progresiva hasta nivel −60 mm | Sin rebose | ★ | S-13 |
| 15 | Reanuda y marca | 0.3 m/min; nivel automático; rampa ≤ 0.2 m/min por minuto; marca el planchón de unión | Sin alarma BOP |  | S-12 |
| 16 | Mantén la exclusión | Nadie bajo el molde hasta que la unión pase el segmento 3 (≈ 5 m) | Autorización de C-06 | ★ | C-06 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Nivel ± 8 mm tras cambio de SEN | Revisa centrado e inmersión; baja la velocidad | C-06 |
| SEN rota (flama, nivel errático) | Cambio de SEN inmediato; sin cambiador: distribuidor o cierre | C-06, C-08 |
| El cambiador no acciona | Tapón cerrado ≤ 15 s; si no, reabre con SEN vieja y baja velocidad | C-06, S-22 |
| Clogging repetido | Muestra Ca/Al; revisa sellos de argón; C-07 corrige LF | C-08, C-07 |
| Detención > 5 min | Cierre de secuencia y salida de cola (MO-CC1-07) | C-06, C-04 |
| Breakout en la unión | Respuesta a breakout (MO-CC1-04 §9) | C-04, C-06, C-16 |
| Rebose del molde al reanudar | Cierra el tapón; recupera en manual | C-06 |
| Distribuidor con vapor o SEN fría | No usar; cierre de secuencia si no hay otro | C-06, C-15 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Qué indica mejor que la SEN se está tapando?
   a) La temperatura del molde
   b) La posición de la barra tapón
   c) El consumo de polvo

2. ¿Cuál es el máximo de argón en la barra tapón contra el clogging?
   a) 5 NL/min
   b) 8 NL/min
   c) 15 NL/min

3. ¿Cuánto tiempo sin flujo se permite al cambiar la SEN?
   a) ≤ 10 s
   b) ≤ 60 s
   c) ≤ 3 min

4. ¿A qué nivel se cierra el tapón del distribuidor viejo?
   a) 700 mm
   b) 400 mm
   c) 100 mm

5. La línea lleva más de 5 min detenida en el cambio de distribuidor. ¿Qué haces?
   a) Reanudar a 1.2 m/min
   b) Cierre de secuencia y salida de cola
   c) Esperar 10 min más

**Clave de respuestas:**

1. b) La posición de la barra tapón — El lazo de nivel compensa el clogging abriendo el tapón: una subida sostenida > 10 % en 15 min lo delata.
2. b) 8 NL/min — Se sube en pasos de 1 NL/min cada 5 min hasta 8; más argón da turbulencia en el menisco y pinholes.
3. a) ≤ 10 s — Objetivo ≤ 5 s, límite 10 s; más de 15 s arriesga la cáscara y el nivel, y C-06 evalúa.
4. b) 400 mm — 400 mm (400–450 mm); debajo se arrastra escoria. Después se detiene la extracción.
5. b) Cierre de secuencia y salida de cola — Con > 3 min se inserta la grapa; con > 5 min se cierra la secuencia (MO-CC1-07).

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-13 Operador de Plataforma | U | 16 h | 6 SEN + 4 distribuidores | 24 meses |
| S-14 Ayudante de Colada | U | 8 h | 6 + 4 eventos | 24 meses |
| S-12 Operador de Púlpito | U | 12 h | 6 + 4 eventos (o simulador) | 24 meses |
| C-06 Supervisor de CC | O (evaluador) | 8 h + evaluador | — | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Usa solo SEN y distribuidor precalentados y liberados
- [ ] Establece la zona roja y la zona de exclusión bajo el molde
- [ ] Cambia la SEN con ≤ 10 s sin flujo y recupera el nivel sin rebose
- [ ] Detiene la línea a 400 mm del distribuidor viejo y reanuda con 0.3 m/min y rampa
- [ ] Mantiene la exclusión hasta que la unión pase el segmento 3

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Pieza fría o húmeda no entra.** Distribuidor liberado y SEN ≥ 1,000 °C; con vapor no se usa.
- **Solo dos personas al frente.** S-13 y S-14 con aluminizado completo durante la maniobra.
- **Nadie bajo el molde con la unión.** La exclusión sigue hasta que la unión pase el segmento 3.
- **Argón máximo 8 NL/min.** Más argón no destapa: da turbulencia y pinholes.

## 7. Por confirmar

- Existencia del cambiador rápido de SEN y del segundo carro de distribuidor [Supuesto]
- Tiempos de cambio, criterios de clogging, Ca/Al, vida de SEN y grapa de unión con el OEM

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno con observaciones — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

