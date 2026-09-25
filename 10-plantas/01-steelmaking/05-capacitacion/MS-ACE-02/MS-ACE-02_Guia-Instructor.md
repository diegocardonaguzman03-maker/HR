# MS-ACE-02 — Aislamiento y bloqueo (LOTO) de EAF, LF, CC y equipos

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MS-ACE-02 — Aislamiento y bloqueo (LOTO) de EAF, LF, CC y equipos |
| Área | Acería · EAF, LF, ollas, CC1, CC2, grúas y patio |
| Serie | Seguridad |
| Manual base | `04-seguridad/MS-ACE-02-loto-aislamiento-bloqueo.md` v0.2 (borrador para validación; revisión de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-19 · S-20 · S-21 · S-22 · S-23 · S-24 · S-25 · S-26 · S-01 · S-12 · C-04 · C-05 · C-06 · C-11 · C-12 · contratistas |
| Presentación | MS-ACE-02_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Un candado, una persona, una llave: nadie mete el cuerpo hasta probar todas las energías en cero

**Principio rector:** Un candado, una persona, una llave. Prueba energía cero antes de tocar.

**Por qué importa:** Un transformador de 140 MVA, brazos de electrodo, acumuladores hidráulicos, agua a presión y gases pueden liberar su energía sin aviso. Si alguien tiene el cuerpo dentro del equipo, el resultado es electrocución, aplastamiento, quemadura o asfixia. Solo la prueba de energía cero lo evita.

## 2. Objetivos de aprendizaje

1. **Identificar todas las energías.** Eléctrica, hidráulica, neumática, agua, gases, gravedad, térmica y radiación, con la lista de puntos del equipo.
2. **Aislar, bloquear y etiquetar.** Candado de equipo y tarjeta en cada punto; llaves a la caja grupal; un candado personal por trabajador.
3. **Probar energía cero.** Intento de arranque, 0 V vivo–muerto–vivo, 0 bar, multigás en rango y Cs-137 < 2 × fondo.
4. **Distinguir llave cautiva de LOTO.** Llave cautiva solo para acceso de rutina listado; toda intervención en el equipo exige LOTO completo.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de reenergización; reglas | Láminas 1–2 |
| 2. Roles y flujo de 10 pasos | 45 | Recorrido del flujo con la caja grupal | Láminas 3–5 |
| 3. Puntos de bloqueo | 75 | Ejercicio: identificar puntos en EAF y CC | Láminas 6–7, figuras |
| 4. Equipos y energía cero | 75 | Práctica vivo–muerto–vivo y lectura de manómetros | Láminas 8–9, kit LOTO |
| 5. Controles y llave cautiva | 60 | Casos: ¿llave cautiva o LOTO completo? | Láminas 10–11 |
| 6. Registros y paso a paso | 75 | Llenado de un permiso con los 11 pasos | Láminas 12–14 |
| 7. Condiciones anormales | 60 | Simulacro de mesa: candado sin dueño | Lámina 15 |
| 8. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en el bloqueo | RACI |
| --- | --- | --- |
| C-16 Especialista de Seguridad | Dueño; audita bloqueos (VCC); aprueba métodos alternos | A |
| C-04 Jefe de Turno | Autoriza la liberación a mantenimiento; custodia la caja grupal | R |
| C-05 / C-06 Supervisores | Entregan el equipo vacío, frío y estacionado | R |
| C-11 / C-12 Mantenimiento | Emiten el permiso; identifican energías con la lista de puntos | R |
| S-20 Electricista de Acería | Único que opera interruptores de media y alta tensión y aplica tierras | R |
| S-22 Técnico Hidráulico | Descarga acumuladores y verifica 0 bar | R |
| S-19, S-21, S-23 a S-25, contratistas | Colocan su candado personal; verifican energía cero antes de tocar | R |
| C-16 como ESR | Cierra el obturador de Cs-137, pone su candado y mide < 2 × fondo | R |

### 4.2 Flujo del proceso

1. **Preparar:** Permiso + lista de puntos del equipo
2. **Avisar y parar:** Horno vacío y a nivel; máquina vacía
3. **Aislar:** Interruptor, válvulas, pasadores, obturador
4. **Bloquear:** Candado de equipo + tarjeta; caja grupal
5. **Candado personal:** Uno por trabajador, antes de entrar
6. **Liberar residual:** 0 bar, calzas, drenar, purgar, ≤ 50 °C
7. **Energía cero:** Arranque, 0 V, 0 bar, gas, radiación
8. **Trabajar:** Repetir prueba si > 2 h o cambia alcance
9. **Retiro ordenado:** Contar personal; agua, hidráulica, eléctrica

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Candado personal | Identifica a cada trabajador | Rojo, llave única, foto y nombre | Uno por persona; nunca prestado |
| Candado de equipo y caja grupal | Bloquean puntos; guardan llaves | Caja para ≥ 20 candados personales | Numerados según la lista |
| Tarjeta NO OPERAR | Informa quién, por qué y cuándo | Nombre, fecha, radio | Una por candado |
| Detector de AT y multímetro | Prueba de ausencia de tensión | Multímetro CAT III 1,000 V / CAT IV 600 V | Vivo–muerto–vivo |
| Tierras temporales | Contra reenergización e inducción | Según corriente de falla [Validar con C-12] | Inspección y registro |
| Calzas, pasadores, bridas ciegas | Bloqueo de gravedad y de gases | Diseño OEM [Validar con OEM] | Pintados en rojo; numeradas |
| Multigás y medidor de radiación | Atmósfera y obturador de Cs-137 | O₂, CO, LEL; μSv/h | Bump test diario; calibración |

### 4.4 Parámetros

| Parámetro | Objetivo | Límite | Acción |
| --- | --- | --- | --- |
| Tensión en el punto | 0 V | Cualquier lectura > 0 | No tocar; C-12 revisa |
| Hidráulica y acumuladores | 0 bar | > 0 bar | Descargar de nuevo |
| Agua de panel o molde | 0 bar | > 0 bar o flujo en dren | Revisar; doble bloqueo |
| O₂ / gas natural / argón | 0 bar en venteo | > 0 bar | Revisar doble bloqueo |
| Atmósfera de entrada | O₂ 19.5–23.5 % | CO ≥ 25 ppm o ≥ 10 % LEL | Salir; no ingresar |
| Evacuación del sector | — | CO ≥ 200 ppm o ≥ 20 % LEL | Evacuar el sector |
| Superficie de trabajo | ≤ 40 °C | > 50 °C [Supuesto] | Esperar enfriamiento |
| Cs-137 con obturador cerrado | Fondo 0.1–0.3 μSv/h | ≥ 2 × fondo | Alejarse ≥ 3 m; ESR |

> Trabajo en caliente: 0 % LEL detectable (≤ 1 % de lectura del equipo). Horno a 0° con pasador. Límites de radiación [Validar con ESR].

### 4.5 Seguridad: controles críticos

- ★ **Aislamiento eléctrico por S-20:** Interruptor extraído y bloqueado, seccionador abierto y tierras en AT. Prueba vivo–muerto–vivo con registro.
- ★ **Gravedad y acumuladores en cero:** Acumuladores a 0 bar; calzas en brazos y columnas; pasador de basculamiento y de barra falsa.
- ★ **Fluidos con doble bloqueo:** Agua, O₂, gas natural y argón con doble bloqueo y venteo; brida ciega si hay ingreso; manómetro 0 bar.
- ★ **Agua de molde con acero: prohibido:** Nunca cerrar el agua de molde con acero líquido o hebra sin solidificar. C-06 confirma máquina vacía.

**EPP:** EPP básico de nave: casco, lentes y botas metatarsales · Ropa FR o algodón, guantes y protección auditiva · S-20: EPP para arco según estudio [Validar con C-12] · Detector multigás si hay ingreso (MS-ACE-05)

### 4.6 Calidad

| Qué se controla | Criterio | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Permiso de trabajo | Lista de puntos, lecturas cero, firmas | Cada bloqueo | No se trabaja |
| Bitácora de caja grupal | Candados y transferencias de turno | Cada colocación y retiro | Candado sin dueño |
| Retiro forzado de candado | C-04 + C-16, búsqueda ≥ 30 min | Cada caso, con investigación | Riesgo de reenergizar |
| Tierras temporales (S-20) | Aplicadas y retiradas | Registro por maniobra | Energización con tierras |
| Agua restablecida | Caudal y ΔT en rango | Antes de energizar | Panel sobrecalentado |
| Auditorías VCC de LOTO | ≥ 4 al mes por área [Supuesto] | C-16 | Acción correctiva |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Prepara | Permiso de trabajo y lista de puntos (figura); identifica todas las energías, incluida radiación | Lista completa y firmada | ★ | C-11 / C-12 |
| 2 | Avisa | Informa a C-04, al púlpito y a los afectados: equipo, hora y duración | Aviso en bitácora |  | C-11 / C-12 |
| 3 | Para el equipo | EAF vacío y a nivel; CC con máquina vacía, sin acero y hebra fuera; olla vacía | Entrega firmada | ★ | C-05 / C-06 |
| 4 | Aísla la energía eléctrica | En AT: extrae el interruptor, abre el seccionador y aplica tierras; en BT abre el interruptor del MCC | Abierto visible | ★ | S-20 |
| 5 | Aísla fluidos | Cierra agua; O₂, gas natural, argón y aire con doble bloqueo y venteo; brida ciega si hay ingreso | Válvulas cerradas y rotuladas | ★ | S-19 / S-22 |
| 6 | Bloquea y etiqueta | Candado de equipo + tarjeta en cada punto; llaves a la caja grupal | Todos los puntos con candado | ★ | Emisor |
| 7 | Pon tu candado personal | Cada trabajador pone su candado en la caja grupal antes de entrar | 1 candado por persona | ★ | Ejecutores |
| 8 | Libera energía residual | Acumuladores a 0 bar; calzas y pasadores; drena agua; purga gases; enfría a ≤ 50 °C | 0 bar; calzas puestas | ★ | S-22, S-19 |
| 9 | Prueba energía cero | Arranque desde HMI y local sin movimiento; 0 V vivo–muerto–vivo; 0 bar; multigás; Cs-137 < 2 × fondo | Todo en cero y anotado | ★ | S-20, ejecutor |
| 10 | Trabaja | Si se interrumpe > 2 h o cambia el alcance, repite la prueba del paso 9 | Sin cambio de condición |  | Ejecutores |
| 11 | Retira ordenadamente | Herramientas y calzas fuera; cuenta al personal; cada quien quita su candado; agua, hidráulica, eléctrica | Personal completo fuera | ★ | Emisor + C-05 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| El equipo se mueve en la prueba | Detén todo; revisa la lista de puntos; no trabajes | C-12, C-16 |
| Presión que no baja a 0 bar | Descarga de nuevo; si persiste, aísla aguas arriba | S-22, C-11 |
| Tensión inducida en AT | Aplica tierras en ambos lados del trabajo | S-20, C-12 |
| Candado de alguien que no aparece | Procedimiento de retiro forzado: localizar, verificar, registrar | C-04, C-16 |
| Multigás en alarma | Sal; ventila; aislamiento positivo con brida ciega | C-16 |
| Radiación > 2 × fondo | Aléjate ≥ 3 m [Supuesto]; delimita; llama al ESR | ESR, C-16 |
| Cerrar agua de molde con acero | Prohibido. Escala | C-04, C-03 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuántos candados personales pone cada trabajador en la caja grupal?
   a) Uno propio
   b) Uno por cuadrilla
   c) Ninguno si hay candado de equipo

2. ¿Quién opera interruptores de media y alta tensión y aplica tierras?
   a) El supervisor
   b) S-20 Electricista
   c) Cualquier ejecutor

3. En la prueba de arranque el equipo se mueve. ¿Qué haces?
   a) Trabajo con cuidado
   b) Detengo todo y reviso los puntos
   c) Pongo otro candado

4. Vas a cambiar un componente en la plataforma de bóveda. ¿Basta la llave cautiva?
   a) Sí, siempre
   b) No, se requiere LOTO completo
   c) Solo si hay supervisor

5. ¿En qué orden se reenergiza el equipo al retirar el LOTO?
   a) Eléctrica, hidráulica, agua
   b) Agua, hidráulica, eléctrica
   c) Todo a la vez

**Clave de respuestas:**

1. a) Uno propio — Un candado, una persona, una llave. Nunca se presta ni se usa el de otro.
2. b) S-20 Electricista — Solo S-20, con prueba vivo–muerto–vivo (NOM-029).
3. b) Detengo todo y reviso los puntos — Hay un punto omitido o puenteado: nadie trabaja hasta encontrar la energía no aislada.
4. b) No, se requiere LOTO completo — La llave cautiva es solo para acceso de rutina listado. Toda intervención exige LOTO completo.
5. b) Agua, hidráulica, eléctrica — Primero agua con caudales normales, luego hidráulica, al final eléctrica.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-19, S-21 a S-26 (ejecutores) | U | 8 h | 5 bloqueos | 24 meses |
| S-20 Electricista | O | 8 h + 16 h | 10 maniobras de AT | 12 meses |
| S-01, S-12 | U | 4 h | 3 entregas de equipo | 24 meses |
| S-02, S-03, S-06, S-07 (llave cautiva) | L | 2 h | 3 accesos | 24 meses |
| C-04, C-05, C-06, C-11, C-12 | O | 12 h | 10 permisos con tutor | 24 meses |
| Contratistas | U | 8 h (TD-P08) | 2 bloqueos | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Identifica todas las energías del equipo con la lista de puntos (figura 1 o 2)
- [ ] Aísla fluidos con doble bloqueo y venteo, y brida ciega si hay ingreso
- [ ] Coloca su propio candado personal y nunca usa el de otro
- [ ] Descarga acumuladores y coloca calzas y pasadores antes de entrar
- [ ] Hace la prueba de energía cero completa (incluido Cs-137 < 2 × fondo) y la anota
- [ ] Retira en orden y reenergiza agua, luego hidráulica, luego eléctrica

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Un candado, una persona, una llave.** Tu candado en la caja grupal antes de entrar; nunca prestado.
- **Sin energía cero no se toca.** 0 V, 0 bar, calzas y pasadores puestos, anotado en el permiso.
- **Llave cautiva no es LOTO.** Solo acceso de rutina listado; para intervenir el equipo, LOTO completo.
- **Agua de molde con acero: nunca.** No se cierra el agua de molde con acero líquido en la máquina.

## 7. Por confirmar

- Clase del detector de AT y calibre de tierras con el diagrama unifilar y C-12
- Calzas y pasadores según OEM; temperatura de contacto ≤ 50 °C (supuesto)
- Límite < 2 × fondo de Cs-137 con el ESR; frecuencia de VCC de LOTO

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-26 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

