# MM-EAF-02 — Brazos portaelectrodos, columnas, regulación hidráulica y cambio de bóveda / delta

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MM-EAF-02 — Brazos portaelectrodos, columnas, regulación hidráulica y cambio de bóveda / delta |
| Área | Acería · EAF-1 / EAF-2 |
| Serie | Mantenimiento |
| Manual base | `03-mantenimiento/MM-EAF-02-brazos-columnas-regulacion-cambio-boveda.md` v0.2 (borrador para validación; visto bueno de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-19 Mecánico · S-22 Técnico Hidráulico · S-20 Electricista · S-21 Instrumentista · S-04 Grúa de Carga · C-11 |
| Presentación | MM-EAF-02_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Brazos aislados, regulación estable y bóveda cambiada sin nadie bajo la carga ni energía almacenada

**Principio rector:** Nadie trabaja bajo una columna, un brazo o una bóveda que no esté calzada y a 0 bar.

**Por qué importa:** La columna, el brazo y la bóveda de 50–70 t guardan energía hidráulica y de gravedad: un acumulador cargado o una columna sin calza aplasta. Un brazo mal aislado o una mordaza floja provoca arco a la bóveda, rotura o caída del electrodo al baño.

## 2. Objetivos de aprendizaje

1. **Bloquear todas las energías.** LOTO E1–E6, calzas bajo columnas y acumuladores descargados; prueba: sin movimiento, 0 bar y 0 V.
2. **Izar la bóveda con plan.** Balancín certificado en 4 orejas, prueba de levante a 100 mm por 1 min y nadie a ± 5 m de la carga.
3. **Dejar brazos aislados y firmes.** Megger ≥ 1 MΩ a 1,000 V DC, torque OEM en cruz y zapatas sin cráteres > 2 mm.
4. **Probar antes de liberar.** Holgura electrodo–delta ≥ 50 mm, agua sin fugas, escalón de 100 mm y deriva ≤ 5 mm en 10 min.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de aplastamiento y caída de electrodo | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del flujo con el corte del horno | Láminas 3–6 |
| 3. Equipos y especificaciones | 90 | Hidráulica proporcional, HFC y acumuladores | Láminas 7–8 |
| 4. Seguridad, LOTO y energía cero | 90 | E1–E6 en plano; descarga de acumuladores | Láminas 9–10, candados |
| 5. Calidad y paso a paso | 90 | Lectura guiada de los 16 pasos; pasos ★ | Láminas 11–13 |
| 6. Práctica de torque y megger | 60 | Torque en cruz; megger en brazo de muestra | Torquímetro, megger |
| 7. Condiciones anormales | 30 | Simulacro de mesa: columna que deriva | Lámina 14 |
| 8. Evaluación teórica | 30 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en brazos y cambio de bóveda | RACI |
| --- | --- | --- |
| C-11 Supervisor de Mantenimiento Mecánico | Dueño; OT, LOTO grupal, plan de izaje y liberación | A |
| S-19 Mecánico de Acería | Guías, mordazas, uniones y cambio de bóveda o delta | R |
| S-22 Técnico Hidráulico | HPU, válvulas proporcionales, acumuladores, cilindros y aceite | R |
| S-04 Operador de Grúa de Carga | Iza la bóveda (grúa 120/40 t) y el delta | R |
| S-20 Electricista | LOTO eléctrico MT, megger de brazos y termografía | R |
| S-21 Instrumentista | Transductores de posición; prueba de respuesta de regulación | R |
| S-01 Operador de Púlpito | Posiciona brazos y bóveda; firma la liberación | R |
| C-16 Especialista de Seguridad | Izaje crítico, altura y LOTO | C |

### 4.2 Flujo del proceso

1. **Paro programado:** OT, permisos y reserva inspeccionada
2. **Posicionar:** Horno vacío, bóveda girada a cambio
3. **LOTO:** MT, HPU, O₂/GN, agua y calzas
4. **Energía cero:** Sin movimiento, 0 bar, 0 V
5. **Drenar agua:** V1/V2 cerradas, drenes a 0 bar
6. **Izar y colocar:** Balancín, grúa 120/40 t, centrar
7. **Brazos:** Holgura, zapatas, torque, megger
8. **Agua y LOTO fuera:** Sin fuga; retiro en orden inverso
9. **Probar y liberar:** Levante, giro, escalón; firma

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Brazo portaelectrodo | Conducir corriente, sostener electrodo | Aislado de la columna | ≥ 1 MΩ a 1,000 V DC; sin fuga |
| Mordaza y zapata (Cu) | Apretar el electrodo de 610 mm | Resortes; apertura hidráulica | Cráteres ≤ 2 mm; fuerza OEM |
| Columna y rodillos guía | Guiar el movimiento vertical | Holgura 0.5–1.0 mm [Validar OEM] | Verticalidad ≤ 1 mm/m |
| Cilindro y servo | Mover la columna con control fino | ISO 4406 ≤ 16/14/11 | Deriva ≤ 5 mm en 10 min [Validar] |
| HPU con fluido HFC | Presión para regular y mover | 120–160 bar [Validar OEM] | 30–50 °C; filtros sin alarma ΔP |
| Acumuladores de vejiga | Respaldo y respuesta rápida | Precarga N₂ ≈ 0.9 × P mín | ±5 % OEM; registro NOM-020 |
| Bóveda y delta | Cerrar horno, aislar electrodos | 50–70 t / 8–12 t [Validar OEM] | Holgura electrodo–delta ≥ 50 mm |

### 4.4 Parámetros

| Especificación | Objetivo | Tolerancia | Límite / rechazo | Frecuencia |
| --- | --- | --- | --- | --- |
| Temperatura de HFC | 40 °C | 30–50 °C | > 55 °C; no operar > 60 | Continuo |
| Agua en el HFC | 40 % | 35–45 % | < 35 o > 50 % | Mensual |
| Limpieza (ISO 4406) | 16/14/11 | ≤ 17/15/12 | > 18/16/13 | Mensual |
| Precarga de acumulador | 0.9 × P mín | ±5 % | < 80 % | Mensual |
| Aislamiento de brazo | ≥ 10 MΩ | ≥ 1 MΩ a 1,000 V DC | < 1 MΩ: no energizar | Trimestral y tras cambio |
| Termografía de brazos | ΔT ≤ 10 °C | — | 10–30 investigar; > 30 | Mensual |
| Holgura de rodillos guía | 0.5 mm | 0.5–1.0 mm | > 1.5 mm | Semanal |
| Holgura electrodo–delta | ≥ 75 mm | ≥ 50 mm por lado | < 50 mm: recentrar | Cada cambio |

> Presión de HPU, torques (ej. M36 10.9 ≈ 2,500 N·m), vida del delta 150–300 coladas y deriva: [Validar con OEM / Ingeniería de Mantenimiento].

### 4.5 Seguridad: controles críticos

- ★ **LOTO E1–E6 con calzas:** MT con tierras (S-20), HPU y acumuladores descargados a tanque, O₂/GN, agua V1/V2 y calzas y pernos de giro y basculamiento.
- ★ **Prueba de energía cero:** Intento de mover columna y bóveda desde HMI y mando local sin respuesta; 0 bar; detector de tensión vivo–muerto–vivo.
- ★ **Izaje crítico de la bóveda:** Plan de izaje, balancín certificado, prueba a 100 mm; nadie en el radio de giro ni a ± 5 m de la carga (MS-ACE-04).
- ★ **Altura, calor y trabajo en caliente:** Arnés y línea de vida (NOM-009); bóveda ≤ 60 °C o EPP térmico; al cortar o soldar, 0 % LEL detectable.

**EPP:** Casco, lentes y careta · Guantes de carnaza y de nitrilo (hidráulica) · Ropa FR y botas metatarsales · Arnés de cuerpo completo en altura · Protección auditiva · Termografía en operación: ropa aluminizada

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Estabilidad de regulación | Corriente de arco sin oscilación | Tendencia corriente/impedancia, trimestral | Más kWh/t; T de vaciado fuera de ±15 °C |
| Contacto zapata–electrodo | ΔT ≤ 10 °C | Termografía mensual | Rotura; punta al baño (C alto) |
| Holgura electrodo–delta | ≥ 50 mm | Cada cambio de bóveda o delta | Arco a bóveda; contaminación |
| Consumo de electrodo | 1.3–1.6 kg/t | KPI por turno (C-07) | Desgaste lateral por mordaza floja |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Prepara y posiciona | Reserva y balancín con certificado; horno vacío; electrodos retirados o asegurados; bóveda girada | Reserva lista y posición |  | C-11, S-01 |
| 2 | Aplica LOTO E1–E6 | Candado de cada ejecutante; calzas bajo columnas | Todos los candados | ★ | Todos |
| 3 | Prueba energía cero | Intento de movimiento desde HMI y mando local; HPU y acumuladores 0 bar; detector de tensión | Sin movimiento, 0 bar, 0 V | ★ | C-11, S-22 |
| 4 | Drena agua de bóveda | Cierra V1/V2, abre drenes hasta 0 bar; desconecta mangueras y tapa conexiones | Sin agua | ★ | S-19 |
| 5 | Iza la bóveda | Balancín en 4 orejas; levante a 100 mm, espera 1 min; traslada a su base | Estable, nadie bajo la carga | ★ | S-04, S-19 |
| 6 | Coloca la reserva | Baja sobre el anillo; centra con marcas; asiento uniforme, holgura ≤ 10 mm [Validar] | Asentada | ★ | S-04, S-19 |
| 7 | Cambia el delta si aplica | Retira pernos o cuñas; iza con aparejo certificado; coloca el nuevo con mortero OEM | Sin escalón > 10 mm |  | S-19, S-24 |
| 8 | Mide holgura electrodo–delta | Plantilla de electrodo o flexómetro en los 3 agujeros | ≥ 50 mm por lado |  | S-19 |
| 9 | Revisa brazos y mordazas | Limpia zapatas; mide cráteres (≤ 2 mm); abre y cierra la mordaza 3 veces | Abre y cierra, sin fuga |  | S-19, S-22 |
| 10 | Mide holgura de guías | Lainas en cada rodillo | 0.5–1.0 mm |  | S-19 |
| 11 | Aprieta uniones | Torquímetro calibrado en cruz al valor OEM; marca de pintura | Torque registrado | ★ | S-19 |
| 12 | Megger de aislamiento | 1,000 V DC por 1 min, brazo–columna y mordaza–brazo | ≥ 1 MΩ (objetivo ≥ 10) | ★ | S-20 |
| 13 | Conecta agua y prueba | Conecta, ventea y presuriza a presión de operación 10 min | Sin fuga; ΔQ ≤ 0.5 % | ★ | S-19, S-21 |
| 14 | Retira LOTO | Orden inverso; verifica que el personal esté fuera | Candados retirados | ★ | Todos |
| 15 | Pruebas funcionales | Levante y giro completos; escalón de 100 mm por columna; deriva en 10 min | Tiempo OEM; deriva ≤ 5 mm |  | S-22, S-21 |
| 16 | Libera | Checklist de liberación firmado por Mantenimiento y Operación | Firmado por C-11 y C-05 | ★ | C-11, C-05 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Columna cae o deriva con HPU parada | No trabajar bajo la columna; calzar | C-11, S-22 |
| Arco entre brazo y bóveda | Arco fuera; megger; recentrar | C-05, C-12 |
| Oscilación de corriente sin causa | Prueba de respuesta; muestreo de aceite | S-22, C-07 |
| HFC > 55 °C | Reducir ciclo; revisar enfriador y válvula de alivio | S-22 |
| Electrodo resbala en la mordaza | Detener regulación; cambiar paquete de resortes o zapata | C-05, C-11 |
| Fuga de fluido a alta presión | Detener HPU; no tocar el chorro (inyección) | C-11, servicio médico |
| Fuga de agua en brazo o cable | Arco fuera; revisar si cae agua al horno (MM-EAF-01) | C-05, C-11 |
| Bóveda no asienta o se atora | No forzar; limpiar anillo; revisar cilindros de levante | S-19, S-22 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuál es el aislamiento mínimo del brazo antes de energizar?
   a) 0.5 MΩ
   b) 1 MΩ a 1,000 V DC
   c) 100 kΩ

2. La columna deriva con la HPU parada. ¿Qué haces?
   a) Seguir, la HPU está fuera
   b) No trabajar debajo y calzar
   c) Arrancar la HPU para sostenerla

3. ¿Qué holgura mínima debe haber entre electrodo y delta?
   a) ≥ 20 mm
   b) ≥ 50 mm por lado
   c) ≥ 150 mm

4. ¿Cómo se hace la prueba de levante de la bóveda?
   a) A 100 mm, esperar 1 min
   b) A 1 m, esperar 10 s
   c) Sin prueba si el balancín es nuevo

5. ¿Con qué gas se recarga un acumulador de vejiga?
   a) Aire comprimido
   b) Oxígeno
   c) Solo N₂ seco

**Clave de respuestas:**

1. b) 1 MΩ a 1,000 V DC — Con menos de 1 MΩ no se energiza; el objetivo es ≥ 10 MΩ.
2. b) No trabajar debajo y calzar — Sello o retención dañados: la gravedad y la energía guardada siguen presentes. Calzar y avisar a C-11 y S-22.
3. b) ≥ 50 mm por lado — Menos de 50 mm provoca arco a la bóveda y rotura; se recentra la bóveda o la columna.
4. a) A 100 mm, esperar 1 min — Se levanta a 100 mm y se espera 1 min para confirmar carga estable, sin nadie bajo la carga.
5. c) Solo N₂ seco — Solo N₂ seco; la precarga es ≈ 0.9 × la presión mínima de trabajo, ±5 %.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-19 Mecánico | U | 16 h | 40 h / 2 cambios de bóveda | 24 meses; altura e izaje 12 |
| S-22 Técnico Hidráulico | U | 24 h | 40 h | 24 meses |
| S-20 Electricista | U | NOM-029 + 8 h | 16 h | 12 meses |
| S-04 Operador de Grúa | U | NOM-006 + izaje | 2 izajes de bóveda | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Aplica LOTO E1–E6 con candado propio y prueba energía cero: sin movimiento, 0 bar, 0 V
- [ ] Calza columnas y descarga acumuladores a 0 bar antes de abrir líneas; drena la bóveda
- [ ] Hace prueba de levante y no permite a nadie bajo la bóveda durante el izaje
- [ ] Aprieta uniones con torquímetro calibrado y mide megger ≥ 1 MΩ antes de energizar
- [ ] Prueba el agua sin fugas antes de retirar LOTO y retira candados con conteo de personal
- [ ] Verifica holgura electrodo–delta ≥ 50 mm y libera con firma de C-11 y C-05

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Calzas y 0 bar antes de meter las manos.** Columnas calzadas y acumuladores descargados antes de abrir líneas.
- **Nadie bajo la bóveda en izaje.** Prueba a 100 mm y ± 5 m de la proyección de la carga libres.
- **Menos de 1 MΩ: no se energiza.** Megger a 1,000 V DC después de cada cambio de bóveda.
- **Sin LOTO y energía cero no se toca.** Candado propio en E1–E6 y prueba de movimiento, presión y tensión.

## 7. Por confirmar

- Presión de HPU, torques de uniones y fuerza de mordaza con el OEM
- Holgura de rodillos, deriva de cilindro y asiento de bóveda ≤ 10 mm
- Peso de bóveda y delta; vida del delta 150–300 coladas

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | Pendiente |
| Seguridad | experto-seguridad-salud | Pendiente |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

