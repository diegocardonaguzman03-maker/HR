# MO-CC2-04 — Colada en estado estable: nivel de molde, aceite, EMS, velocidad y enfriamiento

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-CC2-04 — Colada en estado estable: nivel de molde, aceite, EMS, velocidad y enfriamiento |
| Área | Colada Continua 2 · palanquilla (6 líneas) |
| Serie | Operación |
| Manual base | `02-operacion/cc2/MO-CC2-04-colada-estado-estable.md` v0.1 (visto bueno técnico y de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-12 Púlpito · S-13 Plataforma · S-14 Ayudante · S-11 Muestrero · C-06 · C-08 |
| Presentación | MO-CC2-04_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Cuidar cinco variables por línea y dos del distribuidor, y responder a tiempo a un breakout o a una falla de agua

**Principio rector:** La velocidad es un síntoma: si una línea cambia sola, su buza cambió.

**Por qué importa:** En colada abierta no hay barra tapón: el caudal lo fijan la buza y la altura del distribuidor, y el control de nivel ajusta la velocidad. Si el menisco se mueve más de 5 mm aparecen pinholes e inclusiones; si falta aceite o agua de molde vienen el breakout o la perforación del tubo.

## 2. Objetivos de aprendizaje

1. **Explicar el lazo de nivel.** Explicar cómo el nivel del distribuidor y la buza fijan la velocidad en colada abierta.
2. **Mantener las variables en rango.** Nivel ± 5 mm, aceite 15–25 mL/min, agua ≥ 1,800 L/min con ΔT 6–10 °C, 2.5–3.5 m/min y 1.5–2.0 L/kg.
3. **Detectar la buza por la velocidad.** Más de 3.5 m/min: erosión; menos de 2.3 m/min: taponamiento; diferencia > 0.4 m/min entre líneas.
4. **Responder a emergencias.** Falla de agua: emergencia en ≤ 15 s o cerrar olla y líneas. Breakout: cerrar la línea, mantener agua y evacuar.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Sesión 1 de 4: apertura y por qué importa | 30 | Casos de breakout y de falla de agua; reglas de oro | Portada y objetivos |
| 2. Roles y flujo del proceso | 60 | El lazo de nivel: distribuidor, buza, nivel y velocidad | Roles, flujo y figuras |
| 3. Equipos y parámetros | 90 | Ejercicio: diagnosticar la buza con tendencias de velocidad | Equipos y parámetros, tendencias HMI |
| 4. Seguridad | 60 | Breakout, falla de agua y radiación con el árbol de decisión | Seguridad y árbol de emergencias |
| 5. Calidad y paso a paso | 90 | Lectura guiada de los 13 pasos; rondas y registros | Calidad y paso a paso |
| 6. Condiciones anormales | 60 | Simulacro de mesa: falla de agua ≤ 15 s y breakout | Condiciones anormales |
| 7. Evaluación teórica | 60 | Autoevaluación de 5 preguntas y retroalimentación | Autoevaluación |
| 8. Cierre y ruta a OJT | 30 | Plan de OJT, simulador y certificación | Competencia y cierre |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en colada estable | RACI |
| --- | --- | --- |
| C-08 Ingeniero de Proceso | Dueño de parámetros y tablas (rampa, oscilación, rociado, buzas) | A |
| C-06 Supervisor de Colada Continua | Dirige el turno; decide cerrar líneas y bajar velocidad | A (turno) |
| S-12 Operador de Púlpito | Vigila en la HMI nivel, velocidad, agua, EMS y alarmas; ajusta en rango | R |
| S-13 Operador de Plataforma | Controla nivel y temperatura del distribuidor y la capa de cubierta | R |
| S-14 Ayudante de Colada | Rondas en moldes y línea: chorro, aceite, rociado y palanquilla | R |
| S-11 Muestrero | Toma las muestras químicas del distribuidor | R |
| C-09 Metalurgista de Producto | Recibe las desviaciones que afectan la calidad | I |
| C-16 (función de ESR) | Autoriza cualquier intervención en la zona controlada del molde | C |

### 4.2 Flujo del proceso

1. **Distribuidor:** 700–850 mm; sobrecalentamiento 20–35 °C
2. **Buza:** 160 × 160: Ø 20–24 mm (nominal 22)
3. **Nivel de molde:** Radiométrico ± 5 mm; alarma ± 10 mm
4. **Lazo de nivel:** Ajusta la velocidad de extracción
5. **Velocidad:** 2.5–3.5 m/min (nominal 3.0)
6. **Rociado:** 1.5–2.0 L/kg según tabla de velocidad
7. **Oscilación:** 150–250 cpm; carrera 6–10 mm
8. **EMS:** 250–400 A, 2–5 Hz: mejora el centro

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Medidor Cs-137 (6) | Nivel de molde | ± 5 mm | Sin alarma; obturador abierto |
| Extractores-enderezadores | Velocidad y enderezado | 2.5–3.5 m/min | Sin alarmas de presión ni de motor |
| Agua de molde | Forma la piel | ≈ 2,000 L/min; ΔT 6–10 °C | Caudal ≥ 90 %; ΔT ≤ 12 °C |
| Agua de emergencia | Respaldo del agua de molde | Entrada ≤ 15 s | Tanque lleno; diésel en automático |
| Rociado secundario | Termina la solidificación | Pie de rodillos + Z1–Z3; 1.5–2.0 L/kg | Caudal por zona según tabla |
| Aceite y oscilador | Lubrican y despegan la piel | 15–25 mL/min; 150–250 cpm, 6–10 mm | Nivel de aceite; frecuencia sigue velocidad |
| EMS | Agita el acero | 250–400 A; 2–5 Hz [Validar OEM] | Sin disparo; agua del EMS OK |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| Sobrecalentamiento | 28 °C | 20–35 °C | < 20 o > 35 °C | > 45 °C: C-06 decide cerrar |
| Nivel del distribuidor | 775 mm | 700–850 mm | < 600 o > 870 mm | < 450 mm: cierra L1 y L6 |
| Nivel de molde | Punto de ajuste | ± 5 mm | ± 10 mm | Revisa chorro y buza |
| Velocidad de colada | 3.0 m/min | 2.5–3.5 m/min | < 2.3 o > 3.5 [Validar] | Cambio de buza (MO-CC2-06) |
| Aceite | 20 mL/min | 15–25 mL/min | < 12 o sin flujo | Sin flujo: baja a 2.0 m/min |
| Caudal de agua de molde | 2,000 L/min | 1,800–2,200 L/min | < 1,800 L/min (90 %) | < 1,600 [Validar]: cierra línea |
| ΔT de agua de molde | 8 °C | 6–10 °C | > 12 °C | > 15 °C [Validar]: cierra línea |
| Agua secundaria | 1.75 L/kg | 1.5–2.0 L/kg | < 1.4 o > 2.1 L/kg | Revisa bombas y boquillas |

> EMS 300 A / 3 Hz y T de enderezado ≥ 950 °C: [Validar OEM]. Oscilación 200 cpm a 3.0 m/min. Química: Al ≤ 0.005 % y Mn/Si ≥ 3 [Validar].

### 4.5 Seguridad: controles críticos

- ★ **Breakout: cerrar y evacuar:** Cierra la línea, detén su extracción, mantén agua de molde y secundaria; evacúa bajo la máquina y a ≥ 20 m (MS-ACE-09).
- ★ **Falla de agua de molde:** Confirma la entrada de emergencia en ≤ 15 s; si no entra, cierra olla y 6 líneas y evacúa la plataforma a ≥ 10 m.
- ★ **Radiación Cs-137:** Nada dentro del molde con obturador abierto: el ESR (C-16) cierra, pone candado y mide < 2 × fondo (MS-ACE-07).
- ★ **Calor y salpicaduras:** Careta y EPP aluminizado en rondas, sin asomarse al molde; hidratación, pausas y rotación (MS-ACE-08).

**EPP:** Casco y careta con filtro IR · Chamarra aluminizada en la plataforma · Ropa retardante a la flama y guantes aluminizados · Botas de fundidor y protección auditiva · Dosímetro personal (POE)

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Nivel de molde | ± 5 mm | Continuo; tendencias por línea | Pinholes, inclusiones, marcas |
| Sobrecalentamiento | 20–35 °C | Cada 15 min | Rechupe y porosidad; buza congelada |
| Aceite | 15–25 mL/min | Cada ronda (1 h) | Pegado y breakout; pinholes |
| EMS en servicio | 250–400 A; 2–5 Hz | Continuo (HMI) | Porosidad y rechupe central |
| Romboidad | ΔD ≤ 6 mm | 1 por línea por colada (MO-CC2-09) | Grietas en la diagonal |
| Química | Grado FT-ACE-001 §7; CE ≤ 0.55 | 1 muestra por colada | Colada fuera de grado |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Recibe el turno en la HMI | Alarmas activas, velocidad y nivel por línea, estado del agua de emergencia | Entrega firmada con pendientes |  | S-12 |
| 2 | Verifica el agua de emergencia | Nivel del tanque y bombas diésel en automático | Todo en verde | ★ | S-12 |
| 3 | Vigila el nivel de molde | Continuo en las 6 líneas; atiende toda alarma de ± 10 mm | ± 5 mm | ★ | S-12 |
| 4 | Vigila el agua de molde | Caudal y ΔT por línea | ≥ 1,800 L/min; ΔT 6–10 °C | ★ | S-12 |
| 5 | Mide T del distribuidor | Cada 15 min y a la mitad de cada olla | Sobrecalentamiento 20–35 °C |  | S-13 |
| 6 | Controla el distribuidor | Ajusta la apertura de la olla | 700–850 mm |  | S-13 |
| 7 | Mantiene la capa de cubierta | Agrega polvo cubridor donde se vea acero descubierto | Sin acero expuesto |  | S-13 |
| 8 | Ronda de moldes (1 h) | Por línea: forma del chorro, aceite en rotámetro, salpicaduras, EMS | Chorro centrado; aceite en rango |  | S-14 |
| 9 | Ronda de línea (2 h) | Desde el pasillo seguro: rociado, forma de la palanquilla, ruido de rodillos | Rociado uniforme; palanquilla recta |  | S-14 |
| 10 | Compara velocidades | Una diferencia > 0.4 m/min entre líneas indica buza tapada o erosionada | Tendencia estable |  | S-12 |
| 11 | Toma muestra química | 1 por colada, del distribuidor | Resultado recibido |  | S-11 |
| 12 | Registra | Hoja de colada: temperaturas, niveles, velocidades, alarmas y acciones | Registro completo por colada |  | S-12, S-13 |
| 13 | Responde a anormales | Según la tabla de anormales; ante falla de agua o breakout actúa de inmediato | Respuesta en el tiempo definido | ★ | S-12/13/14 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Breakout bajo el molde | Cierra la línea, detén extracción, mantén agua; evacúa a ≥ 20 m; el ESR revisa el Cs-137 | C-06, C-04, C-16 |
| Pérdida de señal de nivel | Velocidad fija solo si C-06 autoriza; si no vuelve en 5 min, cierra; no toques la fuente | C-06, S-21, C-16 |
| Nivel sube sin control | Sube la velocidad; si no alcanza, cambio de buza o cierre antes de desbordar | C-06 |
| Velocidad < 2.3 m/min | Buza tapándose: cambio de buza; avisa al LF si es por química | C-06, C-07 |
| Falla de agua de molde | Emergencia en ≤ 15 s; si no entra, cierra olla y 6 líneas; evacúa a ≥ 10 m | C-04, C-06 |
| ΔT > 12 °C en una línea | Revisa el caudal; si ΔT > 15 °C [Validar], cierra la línea | C-06, S-25 |
| Disparo del EMS | Sigue colando; marca las palanquillas E desde el disparo; C-09 decide | C-06, S-20, C-09 |
| Distribuidor < 450 mm | Cierra L1 y L6; si sigue bajando, cierra L2 y L5 | C-06 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. Una línea sube sola a 3.7 m/min. ¿Qué indica?
   a) Buza erosionada
   b) Buza tapándose
   c) Falta de aceite

2. ¿En cuánto tiempo debe entrar el agua de emergencia al molde?
   a) ≤ 60 s
   b) ≤ 5 min
   c) ≤ 15 s

3. Hay breakout en una línea. ¿Qué haces con el agua de molde?
   a) La cierro de inmediato
   b) La mantengo con la secundaria
   c) La reduzco al 50 %

4. ¿Qué rango de nivel de molde se mantiene en automático?
   a) ± 2 mm
   b) ± 5 mm
   c) ± 20 mm

5. ¿Qué haces si se dispara el EMS?
   a) Sigo colando y marco palanquillas E
   b) Cierro la línea
   c) Bajo a 1.0 m/min

**Clave de respuestas:**

1. a) Buza erosionada — La buza se erosiona, crece el caudal y la línea acelera sobre 3.5 m/min: cambio de buza.
2. c) ≤ 15 s — Si no entra en ≤ 15 s: cierra la olla y las 6 líneas y evacúa la plataforma a ≥ 10 m.
3. b) La mantengo con la secundaria — Se mantienen el agua de molde y la secundaria; se cierra la línea y se evacúa a ≥ 20 m.
4. b) ± 5 mm — ± 5 mm, con alarma a ± 10 mm. Fuera de rango aparecen pinholes, inclusiones y marcas profundas.
5. a) Sigo colando y marco palanquillas E — Se sigue colando; se marcan las palanquillas E desde el disparo y C-09 decide su destino.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-12 Operador de Púlpito | U | 32 h (simulador [Validar]) | 160 h / 20 coladas | 24 meses; radiación 12 |
| S-13 Operador de Plataforma | U | 24 h | 120 h / 20 coladas | 24 meses; radiación 12 |
| S-14 Ayudante de Colada | U | 16 h | 120 h / 20 coladas | 24 meses; radiación 12 |
| C-06 Supervisor | O | 24 h | 10 turnos acompañados | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Explica cómo el nivel del distribuidor y la buza fijan la velocidad en colada abierta
- [ ] Responde a una alarma de nivel de molde de ± 10 mm
- [ ] Simulacro de falla de agua: verifica la emergencia en ≤ 15 s y cierra olla y líneas
- [ ] Simulacro de breakout: cierra la línea, mantiene el agua y evacúa
- [ ] Identifica en rondas un chorro abierto, falta de aceite y rociado tapado

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **La falla de agua es emergencia.** Emergencia en ≤ 15 s; si no entra, cierra olla y líneas y evacúa.
- **En breakout el agua se mantiene.** Cierra la línea, mantén agua de molde y secundaria, evacúa a ≥ 20 m.
- **La buza se cambia, no se fuerza.** Fuera de 2.3–3.5 m/min se cambia la buza; nunca pases el máximo de la tabla.
- **El molde se interviene solo con el ESR.** Obturador cerrado con candado del ESR y < 2 × fondo medido.

## 7. Por confirmar

- EMS, distribución de agua por zona, tiempo de deslizamiento negativo y T de enderezado con el OEM
- Límites de cierre: caudal < 1,600 L/min, ΔT > 15 °C y velocidad < 2.3 m/min (C-08)
- Química de colada abierta (Al ≤ 0.005 %, Mn/Si ≥ 3) con C-07 y C-08; propuesta para la ficha

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno con observaciones — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

