# MM-CC-04 — Sistemas hidráulicos de oscilación, control de nivel y barra tapón (incluye la fuente de Cs-137 de CC2)

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MM-CC-04 — Sistemas hidráulicos de oscilación, control de nivel y barra tapón (incluye la fuente de Cs-137 de CC2) |
| Área | Acería · CC1 y CC2 |
| Serie | Mantenimiento |
| Manual base | `03-mantenimiento/MM-CC-04-hidraulica-oscilacion-nivel-tapon-fuente-cs137.md` v0.2 (borrador para validación; visto bueno de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-21 Instrumentista (POE) · S-22 Técnico Hidráulico · S-19 Mecánico · C-16 (ESR) · personal de CC |
| Presentación | MM-CC-04_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Oscilación, nivel y tapón exactos, y trabajo junto a la fuente de Cs-137 solo con obturador cerrado por el ESR

**Principio rector:** Si el radiámetro marca ≥ 2 × fondo con el obturador cerrado, nadie trabaja.

**Por qué importa:** La oscilación evita que la cáscara se pegue; el nivel estable evita atrapar escoria; el tapón regula el flujo. Si fallan: marcas profundas, grietas, pinholes o breakout. En CC2 cada molde tiene una fuente sellada de Cs-137: tiempo, distancia y blindaje, y solo el ESR la opera.

## 2. Objetivos de aprendizaje

1. **Trabajar con la fuente cerrada.** El ESR cierra el obturador, pone su candado y mide < 2 × fondo en el punto de trabajo y a 1 m del detector.
2. **Aislar hidráulica, argón y tapón.** HPU con acumuladores a 0 bar, argón cerrado, perno del tapón y tableros bloqueados; prueba de energía cero.
3. **Medir la oscilación.** Acelerómetros triaxiales a 3 frecuencias: ±1 cpm, carrera ±0.1 mm y juego lateral ≤ 0.15 mm.
4. **Calibrar nivel y tapón.** Radiométrico CC2 ±2 % en 2 puntos; corrientes parásitas CC1 ±1 mm; juego del tapón ≤ 0.5 mm.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Sesión 1 de 3: apertura y por qué importa | 30 | Casos de breakout por pegado y de exposición | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Papel del ESR; recorrido del flujo | Láminas 3–6 |
| 3. Equipos y especificaciones | 90 | Oscilación no senoidal y lazos de nivel | Láminas 7–9 |
| 4. Seguridad, LOTO y energía cero | 90 | Tiempo, distancia, blindaje; LOTO de HPU | Láminas 10–11, radiámetro |
| 5. Calidad y paso a paso | 75 | Lectura guiada de los 13 pasos; pasos ★ | Láminas 12–14 |
| 6. Práctica de análisis de oscilación | 60 | Lectura de un reporte de acelerómetros | Reporte de oscilación |
| 7. Condiciones anormales | 45 | Simulacro de mesa: obturador que no coincide | Lámina 15 |
| 8. Evaluación teórica | 30 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 17 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 18 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en oscilación, nivel y fuente | RACI |
| --- | --- | --- |
| C-12 Supervisor Eléctrico e Instrumentación | Dueño; OT y liberación | A |
| S-22 Técnico Hidráulico | HPU, servoválvulas, cilindros, acumuladores y aceite | R |
| S-21 Instrumentista | Transductores, sensor de nivel, detector y análisis de oscilación | R |
| C-16 como ESR (licencia CNSNS) | Único que opera el obturador, bloquea, mide dosis y hace pruebas de fuga | R / A (radiación) |
| POE (S-21 designados) | Trabajo en el detector con dosímetro personal | R |
| S-19 Mecánico | Resortes y guías de oscilación; mecanismo de barra tapón | R |
| C-08 Ingeniero de Proceso de CC | Parámetros de oscilación y de control de nivel | C |
| C-06 Supervisor de CC | Autoriza la línea sin acero; firma la liberación | A (operación) |

### 4.2 Flujo del proceso

1. **OT:** Línea sin acero; autorización de C-06
2. **Fuente cerrada:** ESR cierra, candado, < 2 × fondo
3. **LOTO:** Hidráulica, eléctrica, argón y tapón
4. **Energía cero:** No oscila ni mueve; 0 bar; 0 V
5. **Mantener:** Mesa, resortes, detector, tapón
6. **Oscilar y medir:** Solo E-H retirado; 3 frecuencias
7. **ESR abre:** Personal fuera de la zona controlada
8. **Calibrar nivel:** 2 puntos, ±2 %
9. **Liberar:** Firma C-12, ESR y C-06

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| HPU de CC | Presión para oscilar, tapón, ancho | ISO VG 46 o HFC [Validar]; 3 µm | ISO 4406 ≤ 15/13/10 |
| Servoválvulas y cilindros | Perfil y carrera de oscilación | Carrera 4–8 (CC1) / 6–10 mm (CC2) | Seguimiento ≤ 2 %; carrera ±0.1 |
| Resortes de lámina y guías | Guiar la mesa sin juego | Sin grietas | Juego lateral ≤ 0.15 mm |
| Sensor de corrientes parásitas | Nivel CC1 ±3 mm | Enfriado | Linealidad ±1 mm |
| Barra tapón y argón (CC1) | Regular flujo; 3–8 NL/min | Servo hidráulico o eléctrico | Juego ≤ 0.5 mm; sin fugas |
| Portafuente Cs-137 (CC2) | Emitir a través del molde | Fuente sellada, licencia CNSNS | Obturador, señalización, candado |
| Detector y radiámetro | Nivel ±5 mm; verificar dosis | Centelleo; radiámetro calibrado | Cuentas estables; certificado |

### 4.4 Parámetros

| Especificación | Objetivo | Tolerancia | Límite / rechazo | Frecuencia |
| --- | --- | --- | --- | --- |
| Frecuencia de oscilación | Ajuste del modelo | ±1 cpm | ±3 cpm | Mensual |
| Carrera real | Ajuste | ±0.1 mm | ±0.3 mm | Mensual |
| Juego lateral de la mesa | ≤ 0.10 mm | ≤ 0.15 mm | > 0.20 mm: resortes | Mensual |
| Limpieza de aceite | 15/13/10 | ≤ 16/14/11 | > 17/15/12 | Mensual |
| Linealidad nivel CC1 | ±0.5 mm | ±1 mm | > ±2 mm | Cambio de molde |
| Juego del tapón | ≤ 0.3 mm | ≤ 0.5 mm | > 1.0 mm | Cada distribuidor |
| Calibración radiométrica | 2 puntos | ±2 % | > ±5 % | Cambio de tubo; mensual |
| Dosis, obturador cerrado | Fondo 0.1–0.3 µSv/h | < 2 × fondo [Validar] | ≥ 2 × fondo: alto | Cada intervención |

> Oscilación hidráulica en CC2 [Supuesto]. Límites de dosis, pruebas de fuga y actividad de la fuente: según licencia CNSNS y el ESR [Validar].

### 4.5 Seguridad: controles críticos

- ★ **Fuente cerrada por el ESR:** Solo el ESR (C-16) opera el obturador y pone su candado; radiámetro < 2 × fondo antes de trabajar (MS-ACE-07).
- ★ **LOTO de hidráulica, argón y tapón:** HPU con acumuladores a 0 bar, tableros de servos y detector, argón cerrado, perno del tapón y carro de distribuidor bloqueado.
- ★ **Prueba de energía cero:** Intento de oscilar y de mover el tapón desde HMI rechazado; 0 bar; detector de tensión; radiámetro en el punto de trabajo.
- ★ **Argón y metal cercano:** O₂ 19.5–23.5 % en zonas bajas (MS-ACE-06); distribuidor retirado y EPP térmico entre secuencias.

**EPP:** Casco, lentes y ropa FR · Guantes de nitrilo para aceite · Botas metatarsales · Dosímetro personal (POE y zona controlada) · Radiámetro con el ESR

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Carrera y frecuencia | Ajuste ±0.1 mm / ±1 cpm | Analizador, mensual | Marcas profundas, pegado, breakout |
| Juego lateral de la mesa | ≤ 0.15 mm | Analizador, mensual | Grietas longitudinales, depresiones |
| Estabilidad de nivel | CC1 ±3 mm; CC2 ±5 mm | Continuo (HMI) | Escoria atrapada, sliver, pinholes |
| Respuesta del tapón | Juego ≤ 0.5 mm | Cada distribuidor | Nivel oscilante, turbulencia |
| Argón al tapón | 3–8 NL/min estable | Cada distribuidor | Clogging de SEN o pinholes |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Programa | OT; línea sin acero; distribuidor retirado o línea tapada | Autorización de C-06 | ★ | C-12 |
| 2 | Cierra la fuente | El ESR cierra el obturador y coloca su candado y tarjeta | Candado del ESR puesto | ★ | C-16 (ESR) |
| 3 | Mide tasa de dosis | El ESR mide en el punto de trabajo y a 1 m del detector | < 2 × fondo en permiso | ★ | C-16 (ESR) |
| 4 | Aplica LOTO | HPU, tableros (si se interviene el detector), argón y perno mecánico del tapón | Candados puestos | ★ | S-22, S-21 |
| 5 | Prueba energía cero | Intento de oscilar y de mover; 0 bar; 0 V | Sin energía | ★ | C-12 |
| 6 | Inspecciona mesa y resortes | Visual con lámpara; grietas en láminas; pernos marcados | Sin grietas; torque OK |  | S-19 |
| 7 | Mantén el detector | Limpieza, conexiones y enfriamiento | Sin daño |  | S-21 (POE) |
| 8 | Retira LOTO hidráulico | Solo el necesario para oscilar; personal fuera de la mesa | Nadie en la mesa | ★ | S-22 |
| 9 | Analiza la oscilación | Acelerómetros triaxiales en el molde; oscila a 3 frecuencias del rango | ±1 cpm; ±0.1 mm; ≤ 0.15 mm |  | S-21 |
| 10 | El ESR abre la fuente | Personal fuera de la zona controlada (salvo POE con dosímetro); el ESR retira candado y abre | Abierto; cuentas estables | ★ | C-16 (ESR) |
| 11 | Calibra el nivel | Calibración de 2 puntos según el sistema (vacío / referencia OEM) | ±2 % |  | S-21 con ESR |
| 12 | Retira LOTO restante | Orden inverso; cada quien retira su candado | Candados retirados | ★ | Todos |
| 13 | Libera | Checklist firmado por Mantenimiento, ESR (si aplica) y Operación | Firma C-12, ESR y C-06 | ★ | C-12, C-06 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Alarma de oscilación | Operación reduce velocidad o termina la colada | C-06, S-22 |
| Nivel oscilante (hunting) | Revisar juego del tapón y argón; C-08 revisa el lazo | C-06, S-21 |
| Señal radiométrica errática | Nivel manual por operación; revisar con el ESR | C-06, ESR |
| Indicador de obturador no coincide | Alejarse ≥ 3 m y delimitar; el ESR mide y bloquea | C-16 (ESR), C-06 |
| Portafuente con metal o fuego | Evacuar la zona; el ESR activa el plan radiológico y avisa a CNSNS | ESR, C-04, C-16 |
| Grieta en resorte de lámina | Programar cambio; revisar juego lateral | C-12, C-11 |
| Aceite > 60 °C | Revisar enfriador y válvula de alivio | S-22 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Quién puede abrir o cerrar el obturador de la fuente de Cs-137?
   a) Cualquier S-21
   b) Solo el ESR (C-16)
   c) El operador de púlpito

2. Con el obturador cerrado, el radiámetro marca 3 × fondo. ¿Qué haces?
   a) Trabajar rápido
   b) No trabajar; alejarse ≥ 3 m
   c) Poner otro candado

3. ¿Cuál es el juego lateral máximo aceptado de la mesa de oscilación?
   a) 0.15 mm
   b) 0.5 mm
   c) 1.0 mm

4. ¿Qué LOTO se retira para hacer el análisis de oscilación?
   a) Todos
   b) Solo el hidráulico necesario
   c) Ninguno

5. ¿Qué caudal de argón lleva la barra tapón en CC1?
   a) 1–2 NL/min
   b) 3–8 NL/min
   c) 20–30 NL/min

**Clave de respuestas:**

1. b) Solo el ESR (C-16) — Solo el ESR con licencia CNSNS opera el obturador, pone su candado y mide la tasa de dosis.
2. b) No trabajar; alejarse ≥ 3 m — ≥ 2 × fondo es alto: alejarse, delimitar y el ESR aplica el plan de emergencia (MS-ACE-07).
3. a) 0.15 mm — Objetivo ≤ 0.10 mm, tolerancia ≤ 0.15 mm; arriba de 0.20 mm se cambian resortes o guías.
4. b) Solo el hidráulico necesario — Solo el LOTO hidráulico necesario para oscilar, con el personal fuera de la mesa.
5. b) 3–8 NL/min — 3–8 NL/min estable: poco tapa la SEN (clogging); mucho deja pinholes.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-21 Instrumentista (POE) | U | 24 h + POE (NOM-012) | 3 calibraciones con ESR | 24 meses; POE y NOM-029 12 |
| S-22 Técnico Hidráulico | U | 32 h | 40 h | 24 meses |
| C-16 como ESR | O | Acreditación CNSNS | — | Licencia; interna 12 meses |
| S-19 Mecánico | U | 8 h + radiológica | 2 intervenciones | 24 meses; radiológica 12 |
| Personal de CC no POE | I | Concientización (2 h) | — | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Confirma línea sin acero y autorización de C-06
- [ ] Verifica que solo el ESR operó el obturador, con su candado, y midió < 2 × fondo
- [ ] Aplica LOTO con candado personal; acumuladores a 0 bar y perno del tapón puesto
- [ ] Prueba energía cero: no oscila ni mueve, 0 bar y 0 V
- [ ] Retira solo el LOTO hidráulico necesario con personal fuera de la mesa
- [ ] Retira el LOTO restante en orden y libera con firma de C-12, ESR y C-06

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Solo el ESR toca el obturador.** Su candado es el primero en ponerse y el último en quitarse.
- **Dosis ≥ 2 × fondo: nadie trabaja.** Alejarse ≥ 3 m, delimitar y avisar al ESR.
- **Sin LOTO y energía cero no se toca.** HPU a 0 bar, argón cerrado, perno del tapón y tableros bloqueados.
- **Nadie en la mesa al oscilar.** Se retira solo el LOTO hidráulico necesario, con conteo.

## 7. Por confirmar

- Límites de dosis, periodicidad de pruebas de fuga y actividad de la fuente (licencia CNSNS / ESR)
- Oscilación hidráulica en CC2 (supuesto) y tipo de aceite de la HPU
- Frecuencia de cambio de servoválvulas (2–3 años)

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-26 |
| Seguridad | experto-seguridad-salud | visto bueno con observaciones — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno con observaciones — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

