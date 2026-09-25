# MO-CC2-06 — Cambio rápido de buza calibrada y taponeo o cierre de línea

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-CC2-06 — Cambio rápido de buza calibrada y taponeo o cierre de línea |
| Área | Colada Continua 2 · palanquilla (6 líneas) |
| Serie | Operación |
| Manual base | `02-operacion/cc2/MO-CC2-06-cambio-rapido-buza-cierre-linea.md` v0.1 (visto bueno técnico sin observaciones y de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-13 Plataforma · S-14 Ayudante · S-12 Púlpito · S-15 Preparador · C-06 |
| Presentación | MO-CC2-06_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Cambiar la buza en ≤ 2 s sin perder la línea y cerrar en ≤ 10 s una línea que se vuelve peligrosa

**Principio rector:** Si una línea se vuelve peligrosa, ciérrala de inmediato con placa ciega.

**Por qué importa:** La buza de ZrO₂ se erosiona o se tapa y la línea te avisa con la velocidad. El cambio rápido corta el chorro 1–2 s; si el mecanismo se detiene a medias, el acero se derrama. Una línea con desbordamiento, breakout o sin agua se vuelve peligrosa en segundos.

## 2. Objetivos de aprendizaje

1. **Detectar la buza gastada.** Más de 3.5 m/min (erosión) o menos de 2.3 m/min (taponamiento); diferencia > 0.4 m/min; vida 8–12 h.
2. **Usar la buza correcta.** Mismo Ø de la orden (160 × 160: 20–24 mm), ≥ 900 °C y en el carril ≤ 30 s después de salir del horno.
3. **Cambiar sin exponerse.** Del lado contrario a la expulsión; un solo empuje continuo en ≤ 2 s.
4. **Cerrar a tiempo.** Placa ciega en ≤ 10 s; tapón con varilla como respaldo; ante breakout, detener la extracción.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de derrame en el cambio y de cierre tardío; reglas de oro | Portada y objetivos |
| 2. Roles y flujo del proceso | 60 | Recorrido del flujo con el esquema del cambio rápido | Roles, flujo y figura |
| 3. Equipos y parámetros | 90 | Ejercicio: diagnosticar la buza con la velocidad por línea | Equipos y parámetros, tendencias HMI |
| 4. Seguridad | 60 | Posición segura, línea de expulsión y EPP aluminizado | Seguridad, EPP físico |
| 5. Calidad y paso a paso | 90 | Lectura guiada de los 16 pasos; pasos ★ | Calidad y paso a paso |
| 6. Condiciones anormales | 60 | Simulacro de mesa: placa ciega que no cierra | Condiciones anormales |
| 7. Evaluación teórica | 60 | Autoevaluación de 5 preguntas y retroalimentación | Autoevaluación |
| 8. Cierre y ruta a OJT | 30 | Plan de OJT, simulacro de cierre y certificación | Competencia y cierre |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en el cambio o cierre | RACI |
| --- | --- | --- |
| C-06 Supervisor de Colada Continua | Autoriza el cambio y decide el cierre; en emergencia S-13 cierra y avisa | A |
| S-13 Operador de Plataforma | Ejecuta el cambio de buza y el cierre con placa ciega o tapón | R |
| S-14 Ayudante de Colada | Trae la buza caliente, vigila molde y chorro, confirma el nivel | R |
| S-12 Operador de Púlpito | Fija la velocidad, regresa a automático y ajusta la cola de la línea | R |
| C-08 Ingeniero de Proceso | Analiza la vida de buzas y los taponamientos repetidos | C |
| S-15 Preparador de Distribuidores | Mantiene el horno de repuesto con buzas calientes | C |

### 4.2 Flujo del proceso

1. **Detectar:** > 3.5 o < 2.3 m/min, chorro o vida
2. **Autorizar:** Radio a C-06 y S-12: línea X
3. **Buza lista:** Ø de la orden; ≥ 900 °C
4. **Velocidad fija:** S-12 pasa la línea a manual
5. **Empujar:** Un solo movimiento; ≤ 2 s
6. **Revisar chorro:** Compacto y centrado
7. **Automático:** Nivel ± 5 mm en ≤ 30 s
8. **Si falla:** Placa ciega ≤ 10 s o tapón
9. **Registrar:** Línea, hora, Ø, horas y causa

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Mecanismo de cambio rápido | Cambia la buza o cierra la línea | Empuje ≤ 2 s [Validar OEM] | Carril libre; cilindro operando |
| Buzas de repuesto | Reemplazo | Ø de la orden (160 × 160: 20–24 mm) | ≥ 900 °C y ≥ 30 min en el horno |
| Placas ciegas | Cierran la línea | 1 por línea + 2 de repuesto | Precalentadas en el horno |
| Horno de buzas | Mantiene buzas calientes | ≥ 900 °C [Validar OEM] | Mínimo 6 buzas y 2 placas |
| Tenazas para buza | Manipulan la buza caliente | Mango ≥ 1.2 m [Validar] | Sin deformación |
| Varilla de taponeo | Respaldo de cierre desde arriba | Tapón Ø 15–24 mm; varilla ≥ 3 m | 2 listas y secas por turno |
| Cajón receptor | Recibe la buza usada | Seco, con arena seca | Vacío al inicio del turno |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| Velocidad de la línea | 3.0 m/min | 2.5–3.5 m/min | > 3.5 o < 2.3 [Validar] | Cambio de buza |
| Diferencia vs. promedio | 0 m/min | ± 0.3 m/min | > ± 0.4 m/min | Programa el cambio |
| Horas de la buza | ≤ 10 h | 8–12 h [Validar] | > 12 h | Cambio programado |
| T de la buza de repuesto | 1,000 °C | ≥ 900 °C [Validar OEM] | < 850 °C | No la uses; toma otra |
| Corte del chorro | ≤ 2 s | 1–2 s [Validar OEM] | > 5 s | Revisa el mecanismo |
| Recuperación del nivel | ≤ 30 s | 15–30 s | > 60 s | Velocidad fija y avisa |
| Cierre de emergencia | ≤ 10 s | 5–10 s | > 30 s | Usa el tapón con varilla |
| Nivel del distribuidor | 700–850 mm | — | > 870 mm | Cierra un poco la olla |

> Una buza de 22 mm (≈ 3.0 m/min) que se abre a 23.5 mm lleva la línea a ≈ 3.4 m/min. Vida y tiempos: [Validar con OEM / C-08].

### 4.5 Seguridad: controles críticos

- ★ **Fuera de la línea de expulsión:** Solo S-13 y S-14 en la posición de cambio, del lado contrario a la salida de la buza; EPP aluminizado (MS-ACE-01).
- ★ **Solo buzas y placas calientes:** Del horno de repuesto a ≥ 900 °C: una buza fría o húmeda explota o se congela.
- ★ **Cierre con respaldo:** Placa ciega en ≤ 10 s; si no cierra, tapón con varilla desde la plataforma con barandal (MS-ACE-10).
- ★ **Molde de línea cerrada con ESR:** Obturador cerrado por el ESR (C-16), con su candado y < 2 × fondo medido antes de intervenir el molde (MS-ACE-07).

**EPP:** Chamarra y polainas aluminizadas · Careta con visor dorado · Casco con barbiquejo y guantes aluminizados · Botas de fundidor y ropa retardante a la flama · Protección auditiva y dosímetro personal

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Ø de la buza de repuesto | El de la orden, ± 0.2 mm | Calibrador al cargar el horno | Velocidad fuera de rango |
| Chorro después del cambio | Compacto y centrado | Visual inmediato | Salpicaduras, pinholes, romboidad |
| Palanquilla del cambio | Marcada B [Validar] | La que contiene el cambio | Marca de nivel, inclusiones |
| Causa del cierre de línea | Registrada | Cada cierre | Pérdida de aprendizaje |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Confirma la necesidad | Velocidad, forma del chorro y horas de servicio | Criterio de cambio cumplido |  | S-12, S-13 |
| 2 | Avisa y pide autorización | Radio a C-06 y S-12: cambio de buza línea X | Autorizado |  | S-13 |
| 3 | Verifica la buza de repuesto | Ø en la etiqueta y temperatura del horno | Ø correcto; ≥ 900 °C | ★ | S-14 |
| 4 | Fija la velocidad | S-12 pasa la línea a velocidad fija | Línea en manual |  | S-12 |
| 5 | Coloca la buza | Con tenazas, en ≤ 30 s desde que sale del horno | Buza asentada en el carril | ★ | S-14, S-13 |
| 6 | Toma la posición segura | Del lado contrario a la expulsión | Nadie en la línea de expulsión | ★ | S-13, S-14 |
| 7 | Empuja la buza | Un solo movimiento continuo | ≤ 2 s; la usada cae al cajón | ★ | S-13 |
| 8 | Revisa el chorro | Compacto y centrado en el molde | Sin abanico ni desviación |  | S-14 |
| 9 | Regresa a automático | Cuando el nivel esté a ± 10 mm del punto de ajuste | ± 5 mm en ≤ 30 s |  | S-12 |
| 10 | Registra y repone | Línea, hora, Ø, horas de la usada y causa; carga otra buza del mismo Ø | Registro completo; horno con 6 |  | S-13, S-15 |
| 11 | Decide el cierre y avisa | Radio: cierre de línea X; en emergencia actúa y luego avisa | S-12 enterado |  | S-13 |
| 12 | Empuja la placa ciega | Placa del horno, igual que en los pasos 5–7 | Chorro cortado en ≤ 10 s | ★ | S-13, S-14 |
| 13 | Tapona si no cierra | Tapón cónico con varilla en la boca de la buza, presión firme 30–60 s [Validar] | Chorro cortado | ★ | S-13 |
| 14 | Controla la línea cerrada | Breakout o atoramiento: detén la extracción; si no, cola controlada (MO-CC2-07) | Línea en condición segura | ★ | S-12 |
| 15 | Compensa el distribuidor | Cierra un poco la olla; el nivel tiende a subir | 700–850 mm |  | S-13 |
| 16 | Marca y reporta | Última palanquilla de la línea con C; reporte de causa, hora y acciones | Rastreo y reporte a C-06 |  | S-16, S-13 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| La buza nueva no fluye | Empuja otra buza caliente; si falla, placa ciega | C-06 |
| Mecanismo atorado a medio camino | Cierra con tapón desde arriba; no fuerces con las manos | C-06, C-11 |
| Chorro abierto tras el cambio | Cierra la línea (bloque asiento dañado o escoria en el pozo) | C-06, C-08 |
| La placa ciega no cierra | Tapón con varilla | C-06 |
| Taponamientos en varias líneas | Avisa al LF (química) y a C-08 | C-06, C-07, C-08 |
| Distribuidor sube al cerrar líneas | Cierra la olla parcialmente; con > 870 mm, cierre adicional | C-06 |
| Buza expulsada fuera del cajón | Acordona; deja enfriar; no la toques sin tenazas | C-06 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. Una línea baja sola a 2.2 m/min. ¿Qué pasa con su buza?
   a) Se está tapando
   b) Se está erosionando
   c) Está bien

2. ¿Qué temperatura mínima debe tener la buza de repuesto?
   a) 600 °C
   b) 900 °C
   c) 1,300 °C

3. ¿Dónde te colocas al empujar la buza?
   a) Frente a la expulsión
   b) Bajo el distribuidor
   c) Del lado contrario a la expulsión

4. La placa ciega no cierra la línea. ¿Qué sigue?
   a) Tapón cónico con varilla
   b) Esperar a que se congele
   c) Cortar el agua de molde

5. ¿En cuánto tiempo se cierra una línea en emergencia?
   a) ≤ 2 min
   b) ≤ 10 s
   c) ≤ 5 min

**Clave de respuestas:**

1. a) Se está tapando — Menos de 2.3 m/min indica taponamiento (óxidos, Al alto o acero frío): cambio de buza.
2. b) 900 °C — ≥ 900 °C y ≥ 30 min en el horno [Validar OEM]; con < 850 °C no se usa.
3. c) Del lado contrario a la expulsión — La buza usada sale caliente hacia el cajón; nadie se coloca en la línea de expulsión.
4. a) Tapón cónico con varilla — El tapón con varilla desde arriba es el respaldo; el agua de molde nunca se corta.
5. b) ≤ 10 s — 5–10 s con placa ciega; si pasa de 30 s, se usa el tapón con varilla.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-13 Operador de Plataforma | U | 8 h | 15 cambios + 3 cierres o simulacro | 24 meses; radiación 12 |
| S-14 Ayudante de Colada | U | 8 h | 15 cambios de buza | 24 meses; radiación 12 |
| S-12 Operador de Púlpito | U | 4 h | 10 cambios | 24 meses; radiación 12 |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Verifica Ø y temperatura de la buza de repuesto antes de usarla
- [ ] Se coloca fuera de la línea de expulsión
- [ ] Cambia la buza en un solo empuje (≤ 2 s)
- [ ] Cierra una línea con placa ciega en ≤ 10 s (simulacro)
- [ ] Tapona con varilla como respaldo y detiene la extracción ante un breakout

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Buza de la orden y caliente.** Mismo Ø de la orden y ≥ 900 °C; nunca una buza fría o húmeda.
- **Nadie en la línea de expulsión.** El cambio se hace del lado contrario a la salida de la buza usada.
- **Un solo empuje.** Movimiento continuo; si se atora, tapón desde arriba, nunca las manos.
- **Línea peligrosa, línea cerrada.** Desbordamiento, breakout o sin agua: placa ciega de inmediato.

## 7. Por confirmar

- Tiempo de empuje, temperatura de buzas y vida de buza con el OEM / C-08
- Taponeo: presión 30–60 s, largo de varilla y mango de tenazas
- Marca B de la palanquilla del cambio, zona de exclusión de 3 m y simulacro trimestral (C-16)

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno con observaciones — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

