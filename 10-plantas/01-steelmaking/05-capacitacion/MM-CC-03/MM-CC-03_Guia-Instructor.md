# MM-CC-03 — Sistemas de agua de molde, enfriamiento secundario y agua de emergencia

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MM-CC-03 — Sistemas de agua de molde, enfriamiento secundario y agua de emergencia |
| Área | Acería · casa de bombas CC1 / CC2 |
| Serie | Mantenimiento |
| Manual base | `03-mantenimiento/MM-CC-03-agua-molde-secundaria-emergencia.md` v0.2 (borrador para validación; visto bueno de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-21 Instrumentista · S-19 Mecánico · S-20 Electricista · S-12 Operador de Púlpito de CC · C-12 · C-06 |
| Presentación | MM-CC-03_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

El molde nunca se queda sin agua con acero dentro: emergencia con caudal ≥ 90 % en ≤ 15 s

**Principio rector:** No se cuela con la torre o ambos diésel fuera de servicio.

**Por qué importa:** Si el molde se queda sin agua con acero dentro, la cáscara se funde: breakout y explosión agua–metal. La torre y las bombas diésel son la última barrera y solo sirven si entran solas en 15 s. Una prueba mal restablecida deja la máquina colando sin protección.

## 2. Objetivos de aprendizaje

1. **Mantener las cuatro barreras.** Bomba de reserva en automático, torre ≥ 90 %, XV-1 falla-abierta y diésel D-1/D-2 con combustible ≥ 75 %.
2. **Probar el cambio a emergencia.** Sin acero en CC1 y CC2: XV-1 ≤ 5 s [Validar], diésel ≤ 10 s y caudal en molde ≥ 90 % en ≤ 15 s.
3. **Cuidar caudal, ΔT y química.** Caudal < 90 % o ΔT > 11 °C (CC1) / > 12 °C (CC2) es alarma; conductividad ≤ 100 µS/cm.
4. **Dejar todo en automático.** Selectores en automático y ningún candado de prueba olvidado, verificado por 2 personas y firmado.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de breakout por falla de agua | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Secuencia de emergencia con la figura | Láminas 3–6 |
| 3. Equipos y especificaciones | 90 | Lazos de caudal y ΔT; lectura de tendencias | Láminas 7–8, HMI |
| 4. Seguridad, LOTO y energía cero | 75 | Barreras, selector automático y batería diésel | Láminas 9–10, candados |
| 5. Calidad y paso a paso | 90 | Lectura guiada de los 12 pasos; pasos ★ | Láminas 11–13 |
| 6. Recorrido de casa de bombas | 60 | Ubicar XV-1, torre, D-1/D-2 y selectores | Casa de bombas |
| 7. Condiciones anormales | 45 | Simulacro de mesa: diésel que no arranca | Lámina 14 |
| 8. Evaluación teórica | 30 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en el agua de molde y emergencia | RACI |
| --- | --- | --- |
| C-12 Supervisor Eléctrico e Instrumentación | Dueño; programa las pruebas de emergencia y libera | A |
| S-19 Mecánico de Acería | Bombas, válvulas, intercambiadores, filtros y diésel | R |
| S-21 Instrumentista | FT, TT, PT, LT, lógica de cambio y calibraciones | R |
| S-20 Electricista | Motores, CCM, UPS, baterías y arranque del diésel | R |
| C-06 Supervisor de CC | Autoriza la ventana de prueba; firma la liberación | A (operación) |
| S-12 Operador de Púlpito de CC | Confirma alarmas y caudales en HMI durante la prueba | R |
| Tratamiento de aguas | Química del agua de molde | R |
| C-14 Ingeniero de Confiabilidad | Vibraciones, tendencia de ΔT e incrustación | C |

### 4.2 Flujo del proceso

1. **Falla:** Pérdida de energía o P bajo PSLL (t = 0)
2. **XV-1 abre:** Falla-abierta; ≤ 5 s [Validar]
3. **Torre:** Agua por gravedad a los moldes
4. **D-1 arranca:** Presión en ≤ 10 s; si no, D-2
5. **Q ≥ 90 %:** En todos los moldes en ≤ 15 s
6. **Terminar colada:** Operación aplica MS-ACE-09

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Bombas P-1/P-2/P-3 | Circular agua de molde | 2 en servicio + 1 reserva | Reserva en automático |
| Filtros / coladores | Proteger ranuras del molde | Malla ≤ 200 µm [Validar] | ΔP < 0.5 bar |
| Torre elevada | Agua por gravedad | Volumen ≥ vaciado de máquina [Validar] | Nivel ≥ 90 % |
| XV-1 (falla-abierta) | Conectar la torre | Abre sin energía (resorte) | Carrera completa ≤ 5 s [Validar] |
| Bombas diésel D-1/D-2 | Emergencia prolongada | Arranque automático | Diésel ≥ 75 %; baterías cargadas |
| FT/TT por cara o línea | Alarmas de caudal y ΔT | FT ±1 %; TT ±0.2 °C | Calibrados |
| UPS de control | Mantener PLC e instrumentos | Autonomía ≥ 30 min [Validar] | Prueba de baterías vigente |

### 4.4 Parámetros

| Especificación | Objetivo | Tolerancia | Límite / rechazo | Frecuencia |
| --- | --- | --- | --- | --- |
| Caudal cara ancha CC1 | 4,200 L/min | ±5 % | < 90 % alarma | Continuo |
| ΔT molde CC1 / CC2 | 7.5 / 8 °C | 6–9 / 6–10 °C | > 11 / > 12 °C alarma | Continuo |
| Caudal por línea CC2 | 2,000 L/min | ±5 % | < 90 % alarma | Continuo |
| Conductividad | ≤ 50 µS/cm [Validar] | ≤ 100 µS/cm | > 150 µS/cm | Diario |
| Nivel de torre | 100 % | ≥ 90 % | < 90 % alarma | Continuo / diario |
| Cambio a emergencia | ≤ 10 s | — | > 15 s: no colar | Mensual; anual apagón |
| Arranque de diésel | ≤ 10 s a presión | — | No arranca | Semanal |
| Baterías de arranque 24 V | ≥ 25.5 V [Validar] | — | < 24.5 V | Semanal |

> Presión a moldes (típ. 8–10 bar), T de entrada 35 °C, química del agua, aire de atomización y tiempos de la lógica: [Validar con OEM].

### 4.5 Seguridad: controles críticos

- ★ **Barrera fuera = autorización escrita:** C-03 y C-12 autorizan; con la torre o ambos diésel fuera de servicio la máquina no cuela [Validar con C-03 / C-16].
- ★ **LOTO y prueba de energía cero:** CCM y selector automático, batería del diésel desconectada; arranque local y remoto rechazado, 0 bar y detector de tensión.
- ★ **Torre y XV-1 solo con máquina parada:** La válvula de la torre y la XV-1 se aíslan solo sin acero en la máquina; XV-1 bloqueada mecánicamente.
- ★ **Gases, ruido y químicos:** Escape del diésel: CO < 25 ppm, evacuar a 200 ppm. Tanques: confinado (NOM-033). Químicos con EPP y regadera.

**EPP:** Casco, lentes, guantes y botas de seguridad · Protección auditiva (casa de bombas > 85 dB(A)) · Careta y guantes químicos para tratamiento · Arnés y línea de vida en la torre · EPP eléctrico según categoría en CCM

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Caudal y ΔT de molde | FT-ACE-001 §4–§5 | Continuo | Cáscara delgada, grietas, breakout |
| Calidad del agua de molde | ≤ 100 µS/cm; dureza ≤ 0.5 °dH | Diario / semanal | Incrustación, molde caliente, grietas |
| Agua secundaria por zona | Modelo ±5 % | Continuo | Grietas superficiales e internas |
| Exactitud de TT de molde | ±0.2 °C | Semestral | ΔT falso: alarmas no confiables |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Programa la prueba | Ventana de paro sin acero en CC1 y CC2; aviso a púlpitos | Autorización de C-06 | ★ | C-12 |
| 2 | Verifica condiciones | Torre ≥ 90 %; diésel ≥ 75 %; baterías ≥ 25.5 V; XV-1 cerrada; agua a caudal nominal | Todo en rango |  | S-21, S-19 |
| 3 | Prepara registro | Tendencia de FT de moldes a 1 s; cronómetro; observador en XV-1 y en diésel | Registro activo |  | S-21 |
| 4 | Simula la falla | Sin acero y nadie en acoplamientos ni en el escape; dispara las bombas principales desde el CCM | t = 0 registrado | ★ | S-20 |
| 5 | Observa XV-1 | Tiempo de apertura completa | ≤ 5 s [Validar] |  | S-19 |
| 6 | Observa el diésel | Arranque de D-1 y presión en el cabezal | ≤ 10 s |  | S-19 |
| 7 | Verifica caudal en moldes | Todas las caras (CC1) y todas las líneas (CC2) | ≥ 90 % en ≤ 15 s | ★ | S-21, S-12 |
| 8 | Sostén 10 min | Vigila el nivel de la torre y la temperatura del diésel | Estable |  | S-19 |
| 9 | Prueba D-2 | Repite la prueba con D-1 bloqueado | D-2 cumple ≤ 10 s | ★ | S-19, S-20 |
| 10 | Restablece | Arranca bombas principales, cierra XV-1, diésel a automático, repone la torre | Normal; torre ≥ 90 % | ★ | S-21, S-19 |
| 11 | Verifica selectores | Todos en automático; ningún candado de prueba olvidado | Verificado por 2 personas | ★ | S-21, S-12 |
| 12 | Libera | Checklist firmado por Mantenimiento y Operación con los tiempos medidos | Firmado por C-12 y C-06 | ★ | C-12, C-06 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Caudal de molde < 90 % | Operación reduce velocidad o termina colada; arrancar reserva | C-06, C-12 |
| ΔT alto con caudal normal | Operación reduce velocidad; verificar TT | C-08, S-21 |
| Apagón con acero en máquina | Emergencia automática; operación termina la colada (MS-ACE-09) | C-04, C-12 |
| Diésel no arranca en prueba | No colar si el otro diésel no está disponible | C-03, C-12 |
| Nivel de torre baja sin uso | Revisar XV-1 y tuberías | S-19 |
| Conductividad > 150 µS/cm | Revisar intercambiador (agua cruda); purgar | Aguas, C-12 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuál es el criterio de la prueba de cambio a emergencia?
   a) Q ≥ 50 % en ≤ 30 s
   b) Q ≥ 90 % en ≤ 15 s
   c) Q ≥ 100 % en ≤ 5 s

2. ¿Cómo abre la XV-1 cuando falla la energía?
   a) Con el diésel
   b) Por resorte, sin energía
   c) Manualmente

3. ¿Cuándo se hace la prueba mensual de emergencia?
   a) Colando a baja velocidad
   b) En paro, sin acero en la máquina
   c) Solo con CC2 colando

4. D-1 no arranca y D-2 está en mantenimiento. ¿Qué pasa con la colada?
   a) Se cuela normal
   b) No se cuela
   c) Se cuela a media velocidad

5. ¿Qué se verifica al final de la prueba?
   a) Solo el nivel de torre
   b) Selectores en automático, 2 personas
   c) Que D-1 siga encendido

**Clave de respuestas:**

1. b) Q ≥ 90 % en ≤ 15 s — Caudal en todos los moldes ≥ 90 % en ≤ 15 s; más de 15 s bloquea la colada hasta corregir.
2. b) Por resorte, sin energía — Es falla-abierta: al quitarle energía abre por resorte y conecta la torre por gravedad.
3. b) En paro, sin acero en la máquina — Se programa con C-06 en paro, sin acero en CC1 ni CC2.
4. b) No se cuela — Con ambos diésel fuera de servicio la máquina no cuela; avisar a C-03 y C-12.
5. b) Selectores en automático, 2 personas — Todos los selectores en automático y sin candados de prueba, verificado por 2 personas.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-21 Instrumentista | U | 24 h | 3 pruebas mensuales | 24 meses |
| S-19 Mecánico | U | 16 h | 3 pruebas | 24; torre y tanques 12 |
| S-20 Electricista | U | NOM-029 + 8 h | 3 pruebas | 12 meses |
| S-12 Operador de Púlpito | U | 4 h | Simulacro | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Programa la prueba solo sin acero en CC1 y CC2 y con autorización de C-06
- [ ] Confirma personal fuera de acoplamientos y escape antes de simular la falla
- [ ] Verifica caudal ≥ 90 % en ≤ 15 s en todos los moldes y prueba ambos diésel
- [ ] Restablece bombas, XV-1 y torre ≥ 90 %
- [ ] Deja selectores en automático con doble verificación y libera con firma
- [ ] Sabe que no se cuela con la torre o ambos diésel fuera de servicio

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Más de 15 s: no se cuela.** El cambio a emergencia debe dar caudal ≥ 90 % en ≤ 15 s.
- **Torre o ambos diésel fuera: no se cuela.** Toda barrera fuera requiere autorización escrita de C-03 y C-12.
- **La prueba se hace sin acero.** Paro programado con CC1 y CC2 vacías y autorización de C-06.
- **Todo vuelve a automático.** Selectores y XV-1 en automático, verificado por 2 personas.

## 7. Por confirmar

- Tiempo de apertura de XV-1 (≤ 5 s), volumen de la torre y autonomía de la UPS con el OEM
- Presión a moldes, T de entrada y química del agua
- Regla de barrera fuera de servicio con C-03 / C-16

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | Pendiente |
| Seguridad | experto-seguridad-salud | Pendiente |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

