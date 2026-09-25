# MO-CC1-04 — Colada en estado estable

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-CC1-04 — Colada en estado estable |
| Área | Colada Continua 1 · planchón |
| Serie | Operación |
| Manual base | `02-operacion/cc1/MO-CC1-04-colada-estado-estable.md` v0.1 (visto bueno técnico y de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-12 Operador de Púlpito · S-13 Operador de Plataforma · S-14 Ayudante de Colada · S-11 Muestrero · C-06 · C-08 |
| Presentación | MO-CC1-04_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Mantener nivel ± 3 mm, velocidad por sobrecalentamiento y ancho, agua y polvo en rango, y responder bien a cada alarma

**Principio rector:** Nadie bajo el molde, y ante agua en el molde o breakout, el tapón se cierra primero.

**Por qué importa:** En estado estable salen ≈ 2.8 t/min de acero (1,300 mm a 1.2 m/min) con una cáscara de solo 15–20 mm a la salida del molde. Un sticker mal atendido termina en breakout; una fuga de agua en el molde, en explosión. Y cada desviación de nivel, agua o temperatura se vuelve un defecto en el planchón.

## 2. Objetivos de aprendizaje

1. **Mantener nivel y velocidad.** Nivel de molde ± 3 mm; velocidad 0.8–1.6 m/min según la tabla velocidad–SH–ancho; cambios ≤ 0.1 m/min por minuto.
2. **Cuidar agua, polvo y enfriamiento.** Agua de molde ≥ 95 % y ΔT 6–9 °C; capa líquida 8–15 mm; secundario según modelo; enderezado HSLA ≥ 900 °C.
3. **Responder a sticker y breakout.** Sticker: 0.3–0.5 m/min ≥ 30 s y rampa ≤ 0.2. Breakout: tapón, extracción, olla, evacuación y conteo.
4. **Mantener la exclusión bajo el molde.** Zona de exclusión bajo el molde y segmentos 1–3 toda la colada; agua de emergencia en ≤ 15 s.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Sesión 1 de 5: apertura y por qué importa | 30 | Casos de breakout y fuga de agua; reglas de oro | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del flujo con el molde y el perfil | Láminas 3–6 |
| 3. Equipos y parámetros | 90 | Ejercicio: usar la tabla velocidad–SH–ancho | Láminas 7–8, tabla impresa |
| 4. Seguridad | 60 | Árbol de decisión de emergencias | Láminas 9–10 |
| 5. Calidad y paso a paso | 105 | Lectura guiada de la rutina; pasos ★ | Láminas 11–13 |
| 6. Condiciones anormales | 75 | Simulacro de mesa: sticker, breakout y agua | Lámina 14 |
| 7. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + preguntas orales | Lámina 16 |
| 8. Cierre y ruta a OJT | 30 | Plan de OJT, simulador y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en la colada | RACI |
| --- | --- | --- |
| C-08 Ingeniero de Proceso de CC | Dueño de tablas de velocidad, agua, oscilación y polvo; analiza BOP | A |
| C-06 Supervisor de Colada Continua | Dirige el turno; decide ante anormales; autoriza acceso bajo el molde | A (turno) |
| S-12 Operador de Púlpito | Velocidad, nivel, enfriamiento, oscilación, BOP, alarmas y registros | R |
| S-13 Operador de Plataforma | Nivel y temperatura del distribuidor, argón, flux, muestras, olla | R |
| S-14 Ayudante de Colada | Polvo de molde, capa líquida, observación del menisco, costras | R |
| S-11 Muestrero | Muestras de producto | R |
| S-21 Instrumentista | Fallas de sensor de nivel, termopares BOP y medidores de agua | C |
| C-09 Metalurgista de Producto | Recibe planchones con eventos para disposición (MO-CC1-09) | I |

### 4.2 Flujo del proceso

1. **Zona libre:** Nadie bajo el molde ni en segmentos 1–3
2. **Revisar HMI:** Nivel, agua, secundario, BOP, emergencia
3. **Medir SH:** 3 por olla; objetivo 20–30 °C
4. **Ajustar velocidad:** Tabla velocidad–SH–ancho; máx. 1.6
5. **Distribuidor:** 900–1,100 mm; flux sin ojos de acero
6. **Polvo de molde:** Capa líquida 8–15 mm; 0.3–0.5 kg/t
7. **Vigilar:** Agua, secundario, enderezado, tapón
8. **Atender alarma:** Sticker, nivel, agua, clogging, breakout
9. **Registrar:** Hoja de colada y eventos por planchón

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Lazo de nivel | Mantiene el menisco con el tapón | Eddy current + PID; ± 3 mm | Señal estable; calibración vigente |
| Agua de molde | Enfría las placas | ≈ 4,200 / 450 L/min; ΔT 6–9 °C | Caudal y ΔT con alarmas activas |
| Agua de emergencia | Respaldo del agua de molde | Torre + diésel; ≤ 15 s | ★ Estado listo en HMI |
| Oscilador hidráulico | Despega la cáscara | 120–200 cpm; carrera 4–8 mm | Frecuencia y carrera según tabla |
| Secundario y modelo | Solidifica el planchón | 10 zonas; 0.8–1.2 L/kg | Modelo activo; tabla de respaldo |
| BOP | Predice stickers | Termopares en 3 filas | Termopares con lectura |
| Polvo de molde | Aísla, lubrica, absorbe inclusiones | 0.3–0.5 kg/t; capa 8–15 mm | Tipo por grado; sacos secos |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| Nivel de molde | 0 mm | ± 3 mm | ± 8 mm | Ver pérdida de nivel |
| Velocidad de colada | 1.2 m/min | 0.8–1.6 m/min | > 1.6 m/min | Respetar tabla velocidad–SH |
| Sobrecalentamiento | 25 °C | 20–30 °C | < 15 o > 35 °C | Tabla; > 40: máx. 0.8 m/min |
| Nivel del distribuidor | 1,000 mm | 900–1,100 mm | < 900 o > 1,250 mm | Subir flujo / cerrar olla |
| Argón de barra tapón | 4–5 NL/min | 3–8 NL/min | > 8 NL/min | No exceder: pinholes |
| Agua de molde | 7.5 °C; 4,200 L/min | ΔT 6–9 °C; ± 5 % | ΔT > 11 °C o < 90 % | Bajar a 0.8 m/min |
| Capa líquida de polvo | 10–12 mm | 8–15 mm | < 6 o > 18 mm | Agregar / reducir polvo |
| Enderezado (HSLA) | ≥ 920 °C | ≥ 900 °C | < 880 °C | Reducir agua Z6–Z8 |

> Con SH < 15 °C no se baja la velocidad: se congela la SEN. Tabla velocidad–SH–ancho, reparto de agua y oscilación: [Validar con OEM / Ingeniería de Proceso].

### 4.5 Seguridad: controles críticos

- ★ **Zona de exclusión bajo el molde:** Permanente bajo el molde y segmentos 1–3; acceso solo con autorización de C-06 y la máquina a velocidad reducida.
- ★ **Agua de emergencia ≤ 15 s:** Si falla el agua de molde y la emergencia no entra: cierra tapón y olla, detén y evacúa.
- ★ **Agua en el molde:** Vapor, reventones o gotas en el menisco: cierra el tapón de inmediato, detén, evacúa la plataforma y no reanudes.
- ★ **Plataforma de molde:** Zona roja ≤ 3 m del molde: solo S-13 y S-14 con aluminizado seco; herramientas y polvo secos.

**EPP:** Careta IR, chamarra aluminizada y ropa FR · Guantes y botas con metatarsal · Respirador P100 al agregar polvo de molde · Protección auditiva y detector de O₂/CO · Hidratación y pausas por estrés térmico

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Nivel de molde | ± 3 mm; eventos > ± 8 mm marcados | Continuo, nivel 2 | Inclusiones de polvo, grietas |
| Sobrecalentamiento | 20–30 °C | 3 mediciones por colada | Segregación central / clogging |
| Capa líquida y consumo de polvo | 8–15 mm; 0.3–0.5 kg/t | 1 medición y consumo por colada | Stickers, grietas, depresiones |
| Simetría de agua de molde | ΔT 6–9 °C; diferencia ≤ 1.5 °C | Continuo, nivel 2 | Grietas longitudinales, depresiones |
| Enderezado (HSLA) | ≥ 900 °C | Pirómetro continuo | Grietas transversales y de esquina |
| Eventos por planchón | Marcado automático | Tracking en MES | Inspección especial (MO-CC1-09) |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Verifica la zona de exclusión | Al inicio del turno y tras cada evento: barreras y nadie bajo el molde | Zona despejada | ★ | C-06 / S-14 |
| 2 | Revisa el HMI | Nivel, velocidad, agua de molde, enfriamiento, oscilación, BOP, agua de emergencia lista | Todo en verde |  | S-12 |
| 3 | Mide temperatura | A los 5 min de abrir cada olla, a mitad y 10 min antes del final | SH 20–30 °C |  | S-13 |
| 4 | Ajusta la velocidad | Aplica la tabla velocidad–SH–ancho; cambios ≤ 0.1 m/min por minuto | Dentro de tabla |  | S-12 |
| 5 | Cuida el distribuidor | Nivel 900–1,100 mm con la válvula de la olla; flux siempre cubriendo, sin acero visible | Sin ojos de acero |  | S-13 |
| 6 | Agrega polvo de molde | Poco y seguido: capa negra uniforme; sin zonas rojas; no tapar la SEN | Superficie negra |  | S-14 |
| 7 | Mide la capa líquida | Método de alambres a 1/4 del ancho, lado fijo y móvil, lejos de la SEN | 8–15 mm |  | S-14 |
| 8 | Retira costras del menisco | Con herramienta seca, sin perturbar el nivel; solo si el rim > 10 mm | Menisco libre |  | S-14 |
| 9 | Vigila el agua de molde | Caudal ≥ 95 %, ΔT 6–9 °C, diferencia entre anchas ≤ 1.5 °C | En rango |  | S-12 |
| 10 | Vigila el secundario | Modelo activo; caudal = consigna ± 5 % por zona; aire 2.5–4 bar | En rango |  | S-12 |
| 11 | Vigila el enderezado (HSLA) | Pirómetro en el enderezado | ≥ 900 °C |  | S-12 |
| 12 | Vigila la posición del tapón | Tendencia estable ± 5 %; subida sostenida = clogging (MO-CC1-06) | Estable |  | S-12 |
| 13 | Toma la muestra | A mitad de colada, del distribuidor | Muestra identificada |  | S-11 / S-13 |
| 14 | Atiende las alarmas BOP | Baja a 0.3–0.5 m/min, mantén ≥ 30 s y recupera con rampa ≤ 0.2 m/min por minuto | Sin breakout | ★ | S-12 |
| 15 | Varía la inmersión de SEN | Cada 2 h, ± 10 mm dentro de 120–160 mm [Validar con OEM / Ingeniería de Proceso] | Inmersión en rango |  | S-13 |
| 16 | Ajusta ancho y registra | Ancho en caliente a ≤ 1.0 m/min y marca transición; registra T, pesos, polvo, capa y eventos | Hoja de colada completa |  | S-12 / S-13 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Alarma BOP de sticker | ★ Baja a 0.3–0.5 m/min ≥ 30 s; rampa ≤ 0.2; sin cambios bruscos | C-06; C-08 si ≥ 2 |
| Breakout | ★ Tapón, extracción, olla; evacúa y cuenta; nadie se acerca sin C-06 | C-04, C-06, C-16 |
| Pérdida de nivel (± 8 mm) | Tapón manual a 0.8 m/min; si en 5 min no se recupera, cierre | C-06, S-21 |
| Rebose del molde | Cierra el tapón; baja velocidad; si sale acero, evacúa y detén | C-06, C-04 |
| Clogging (tapón sube > 10 %) | Argón en pasos de 1 NL/min hasta 8; prepara cambio de SEN | C-06, C-08, C-07 |
| ΔT > 11 °C o caudal < 90 % | Baja la velocidad a 0.8 m/min; revisa; avisa a S-21 | C-06, C-12 |
| Falla de agua de molde o apagón | ★ Emergencia ≤ 15 s; si no entra: cierra tapón y olla, detén y evacúa | C-04, C-06, C-12 |
| Agua en el molde (vapor, gotas) | ★ Cierra el tapón de inmediato; detén; evacúa; no reanudes | C-04, C-06, C-11 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Por qué no se debe colar a más de 1.6 m/min?
   a) Se gasta más polvo
   b) El cráter sale de la máquina
   c) Se sobrecalienta el molde

2. Salta una alarma BOP de sticker. ¿Qué pasa con la velocidad?
   a) Sube a 1.6 m/min
   b) Baja a 0.3–0.5 m/min ≥ 30 s
   c) Se detiene la máquina

3. El SH baja a 12 °C. ¿Qué haces con la velocidad?
   a) No la bajas y avisas a C-08
   b) La bajas a 0.8 m/min
   c) Detienes la máquina

4. ¿Qué indica que la barra tapón suba de forma sostenida más de 10 %?
   a) Falta argón en la olla
   b) Clogging de la SEN
   c) Nivel de molde alto

5. Ves gotas y reventones en el menisco. ¿Qué haces primero?
   a) Agregar polvo
   b) Cerrar el tapón de inmediato
   c) Bajar la velocidad a 0.8

**Clave de respuestas:**

1. b) El cráter sale de la máquina — A 1.6 m/min la punta del cráter llega a ≈ 29 m de ≈ 32 m de longitud metalúrgica.
2. b) Baja a 0.3–0.5 m/min ≥ 30 s — Se mantiene baja ≥ 30 s o hasta normalizar y se recupera con rampa ≤ 0.2 m/min por minuto.
3. a) No la bajas y avisas a C-08 — Bajar la velocidad enfría más el distribuidor y congela la SEN; si baja de 10 °C se prepara el cierre.
4. b) Clogging de la SEN — Al₂O₃ depositada en la SEN: sube argón en pasos de 1 NL/min hasta 8 y prepara cambio de SEN.
5. b) Cerrar el tapón de inmediato — Es agua en el molde: riesgo de explosión. Tapón cerrado, detener, evacuar la plataforma y no reanudar.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-12 Operador de Púlpito | U | 40 h | 240 h + simulador | 24 meses |
| S-13 Operador de Plataforma | U | 24 h | 160 h | 24 meses |
| S-14 Ayudante de Colada | U | 16 h | 120 h | 24 meses |
| C-06 Supervisor de CC | O (evaluador) | 24 h + evaluador | — | 24 meses |
| C-08 Ingeniero de Proceso de CC | O | 40 h | — | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Mantiene y verifica la zona de exclusión bajo el molde
- [ ] Responde a sticker: 0.3–0.5 m/min, espera ≥ 30 s, rampa ≤ 0.2 m/min por minuto
- [ ] Responde a breakout en orden: tapón, extracción, olla, evacuación
- [ ] Verifica agua de emergencia en ≤ 15 s y sabe qué hacer si no entra
- [ ] Ante agua en el molde cierra el tapón de inmediato

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Nadie bajo el molde en colada.** Zona de exclusión bajo el molde y segmentos 1–3; acceso solo con C-06.
- **Agua en el molde: tapón cerrado.** Vapor, reventones o gotas: cierra, detén, evacúa y no reanudes.
- **Breakout: tapón, extracción, olla.** Después evacúa y cuenta; nadie regresa sin autorización de C-06.
- **Nunca más de 1.6 m/min.** Respeta la tabla velocidad–SH–ancho; con SH < 15 °C no bajes.

## 7. Por confirmar

- Tabla velocidad–SH–ancho, reparto de agua por zona, ley de oscilación y lógica del BOP con el OEM
- Respuesta a falla de oscilación e ingreso de agua de máquina en breakout según OEM

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno con observaciones — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

