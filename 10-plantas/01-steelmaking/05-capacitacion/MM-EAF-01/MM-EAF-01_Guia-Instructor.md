# MM-EAF-01 — Detección y reparación de fugas en paneles y bóveda enfriados por agua

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MM-EAF-01 — Detección y reparación de fugas en paneles y bóveda enfriados por agua |
| Área | Acería · EAF-1 / EAF-2 |
| Serie | Mantenimiento |
| Manual base | `03-mantenimiento/MM-EAF-01-fugas-paneles-boveda.md` v0.2 (borrador para validación; visto bueno de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-19 Mecánico · S-23 Soldador · S-21 Instrumentista · S-20 Electricista · S-04 Grúa de Carga · C-11 |
| Presentación | MM-EAF-01_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Detectar, aislar y reparar la fuga sin exponer a nadie al contacto agua–metal líquido

**Principio rector:** Con agua en el horno no se bascula, no se mueven electrodos y nadie se acerca a menos de 25 m.

**Por qué importa:** Agua más acero líquido es explosión de vapor: proyección de metal y fatalidad. Este manual es de riesgo máximo. Una fuga pequeña que no se detecta también mete hidrógeno al acero y termina en sopladuras y rechazo en laminación.

## 2. Objetivos de aprendizaje

1. **Asegurar el horno ante una fuga.** Con ΔQ > 4 % o agua visible: arco fuera, no bascular, evacuar a ≥ 25 m y esperar sin vapor ≥ 30 min.
2. **Aislar con LOTO y energía cero.** Bloquear E1–E6 con candado personal y probar: arranque rechazado, 0 V, 0 bar y gases en rango.
3. **Decidir: soldar o cambiar el panel.** UT en malla de 50 × 50 mm: todo ≥ 5 mm se repara con WPS; si no, se cambia el panel completo.
4. **Probar y liberar.** Prueba hidrostática 10 bar / 30 min sin caída; ΔQ ≤ 0.5 % y liberación firmada por C-11 y C-05.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de explosión agua–metal; reglas de oro | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del flujo con la figura del panel | Láminas 3–6 |
| 3. Equipos y especificaciones | 75 | Ejercicio: calcular ΔQ con lecturas de FT | Láminas 7–8, calculadora |
| 4. Seguridad, LOTO y energía cero | 90 | Puntos E1–E6 en plano; prueba de energía cero | Láminas 9–10, candados |
| 5. Calidad y paso a paso | 105 | Lectura guiada de los 16 pasos; pasos ★ | Láminas 11–13 |
| 6. Práctica de UT y prueba hidrostática | 60 | Malla UT en tubo de muestra; registro de prueba | Equipo UT, manómetro |
| 7. Condiciones anormales | 30 | Simulacro de mesa: ΔQ > 4 % con metal | Lámina 14 |
| 8. Evaluación teórica | 30 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en la reparación de fugas | RACI |
| --- | --- | --- |
| C-11 Supervisor de Mantenimiento Mecánico | Dueño; emite OT, coordina LOTO y firma la liberación | A |
| S-19 Mecánico de Acería | Aislamiento del agua, cambio de panel, prueba hidrostática | R |
| S-23 Soldador Calificado | Reparación de tubos por soldadura con WPS calificado | R |
| S-21 Instrumentista | Calibra FT, TT y PT; verifica la lógica de fuga | R |
| S-01 Operador de Púlpito de Horno | Detiene el arco, no bascula, bloqueo de operación; firma la liberación | R |
| C-05 Supervisor de Hornos | Autoriza el paro y firma la liberación por operación | A (operación) |
| S-04 Operador de Grúa de Carga | Iza el panel de repuesto o la bóveda | R |

### 4.2 Flujo del proceso

1. **Alarma:** ΔQ > 2 % o fuga visible
2. **Asegurar horno:** Arco fuera, no bascular, ≥ 25 m
3. **Esperar:** Circuito cerrado; sin vapor ≥ 30 min
4. **LOTO E1–E6:** Candados y prueba de energía cero
5. **Drenar y medir:** 0 bar; UT alrededor de la fuga
6. **Reparar o cambiar:** Espesor ≥ 5 mm soldar; si no, panel
7. **Prueba 10 bar:** 30 min, caída 0 bar y sin goteo
8. **Circular agua:** ΔQ ≤ 0.5 %, P 4–6 bar
9. **Liberar:** Firma C-11 y C-05

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Paneles de pared (tubo) | Enfriar la pared sobre la escoria | Ø 70 × 10 mm A106-B [Validar OEM] | Espesor ≥ 5 mm; pandeo ≤ 20 mm |
| Bóveda enfriada y codo | Enfriar bóveda y ducto de humos | Circuitos por sector [Validar OEM] | ΔQ ≤ 0.5 %; T salida ≤ 60 °C |
| Medidores FT ent/sal | Detectar la fuga | Electromagnéticos, ±0.5 % | Etiqueta de calibración ≤ 12 meses |
| Transmisores TT y PT | T de salida y presión | Pt100; 0–10 bar | Coincide con manómetro ±0.2 bar |
| Válvulas V1 / V2 | Aislar el circuito (punto LOTO) | Mariposa/compuerta con candado | Cierre hermético, porta-candado |
| Bombas y cabezal | Suministro de agua al horno | 2,200 m³/h, 4–6 bar | P ≥ 4 bar en cabezal |
| Bomba de prueba hidrostática | Prueba de presión | 0–25 bar; manómetro clase 0.5 | Manómetro calibrado |

### 4.4 Parámetros

| Especificación | Objetivo | Tolerancia | Límite / rechazo | Frecuencia |
| --- | --- | --- | --- | --- |
| Presión de suministro | 5 bar | 4–6 bar | < 3 bar alarma | Continuo |
| Caudal total | 2,200 m³/h | ±5 % | < 90 % del nominal | Continuo |
| ΔQ por circuito | ≤ 0.5 % | 0–1 % | > 2 % alarma; > 4 % disparo | Continuo |
| T salida de panel | ≤ 50 °C [Supuesto] | 35–55 °C | > 60 °C alarma | Continuo |
| Espesor de tubo (UT) | 10 mm nuevo | ≥ 6 mm | < 5 mm: cambiar | Semanal zona caliente |
| Pandeo del panel | 0 mm | ≤ 10 mm | > 20 mm: cambiar | Semanal |
| Prueba hidrostática | 10 bar / 30 min | ≥ 1.5 × 6 bar | Caída o goteo = rechazo | Cada reparación |
| Lógica ΔQ (4–20 mA) | Alarma 2 %, disparo 4 % | ±0.2 % | No dispara: no operar | Trimestral |

> Tubo, pandeo, filtro de 5 s y torques de bridas: [Validar con OEM / Ingeniería de Mantenimiento]. Calibración de FT anual (> ±1 %: recalibrar).

### 4.5 Seguridad: controles críticos

- ★ **Disparo y evacuación por agua:** ΔQ > 4 % dispara el arco. Con agua en el horno: no bascular, evacuar a ≥ 25 m y esperar sin vapor ≥ 30 min (MS-ACE-03).
- ★ **LOTO E1–E6 con candado personal:** Eléctrica MT (S-20), hidráulica, O₂/GN purgado con N₂, neumática y DRI, agua V1/V2 y perno de basculamiento.
- ★ **Prueba de energía cero:** Arranque rechazado en HMI y botonera, detector de tensión, 0 bar; O₂ 19.5–23.5 %, CO < 25 ppm, < 10 % LEL.
- ★ **Trabajo en caliente y altura:** Soldar solo con 0 % LEL detectable (≤ 1 % de lectura) en monitoreo continuo; arnés y línea de vida (NOM-009).

**EPP:** Casco, lentes y careta facial · Ropa FR o aluminizada y guantes para calor · Botas metatarsales y protección auditiva · Arnés de cuerpo completo en altura · Respirador P100 en demolición de escoria · Soldadura: careta DIN 10–13, mangas y peto

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Ingreso de agua al baño | 0 (ΔQ ≤ 0.5 %) | PLC continuo | H alto: sopladuras y pinholes |
| H en acero (grados sensibles) | ≤ 5 ppm en LF [Validar con C-09] | Sonda de H tras colada sospechosa | Porosidad; rechazo en laminación |
| Escoria espumosa estable | Sin manchas de escoria enfriada | Visual del S-01 | Arco descubierto, más daño a paneles |
| T de salida de panel | ≤ 60 °C | TT continuo | Incrustación, fatiga térmica, fuga |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Recibe la alarma | Identifica en la HMI el circuito con mayor ΔQ y mayor T de salida | Circuito identificado |  | S-01, S-21 |
| 2 | Asegura el horno | ΔQ > 4 % o agua visible: arco, O₂/GN/C fuera; no bascules ni muevas electrodos; evacúa a ≥ 25 m | Nadie a menos de 25 m | ★ | S-01, C-05 |
| 3 | Espera la evaporación | Cierra el circuito a distancia; sin vapor visible ≥ 30 min [Supuesto]; reanuda solo con C-05 + C-07 | Autorización registrada | ★ | C-05, C-07 |
| 4 | Vacía el horno si es seguro | Vaciado por EBT solo con autorización de C-05 y sin agua sobre el baño | Sin metal o talón controlado | ★ | S-01, C-05 |
| 5 | Emite OT y permisos | OT, permiso en caliente, altura y, si aplica, espacio confinado; análisis de riesgos | Permisos firmados | ★ | C-11, C-16 |
| 6 | Aplica LOTO E1–E6 | Cada ejecutante coloca su candado en la caja grupal | Candados y tarjetas puestos | ★ | Todos |
| 7 | Prueba energía cero | Arranque desde HMI y botonera; detector de tensión; 0 bar; O₂ 19.5–23.5 %, CO < 25 ppm, < 10 % LEL | Sin energía; gases en rango | ★ | C-11, S-20 |
| 8 | Drena y ventea | Abre dren y venteo; espera que el manómetro marque 0 bar | 0 bar, sin flujo | ★ | S-19 |
| 9 | Localiza y mide espesores | Visual o aire a 2 bar con agua jabonosa [Validar]; UT en malla 50 × 50 mm, 300 mm alrededor | Todo ≥ 5 mm: reparar |  | S-19 |
| 10 | Repara por soldadura | Permiso vigente, LEL ≤ 1 % continuo; corta ≥ 150 mm, bisel 37.5°, GTAW + E7018 [Validar WPS] | Sin porosidad ni socavado | ★ | S-23 |
| 11 | O cambia el panel | Iza con plan de izaje; juntas nuevas; bridas en cruz, M20 8.8: 350–400 N·m [Validar OEM] | Panel asentado | ★ | S-19, S-04 |
| 12 | Prueba hidrostática | Llena, ventea, sube a 10 bar, aísla la bomba y sostén 30 min | Caída 0 bar, sin goteo | ★ | S-19, C-11 |
| 13 | Inspecciona la soldadura | Visual y líquidos penetrantes en las uniones reparadas | Sin indicaciones |  | S-23 |
| 14 | Retira LOTO | En orden inverso; cada quien retira su candado; personal fuera verificado | Candados fuera, área limpia | ★ | Todos |
| 15 | Circula agua y verifica | Abre V2 y luego V1; circula 10 min; ΔQ ≤ 0.5 %, T estable, P 4–6 bar | Valores en rango | ★ | S-21, S-01 |
| 16 | Libera el equipo | Checklist de liberación firmado por Mantenimiento y Operación | Firmado por C-11 y C-05 | ★ | C-11, C-05 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| ΔQ > 4 % (disparo) | Arco fuera, no bascular, evacuar a ≥ 25 m; cerrar circuito; sin vapor ≥ 30 min | C-05, C-04, C-07 |
| Detector en alarma en el trabajo | Detén el trabajo en caliente y sal; ventila; revisa E3 | C-11, C-16 |
| CO ≥ 200 ppm o ≥ 20 % LEL | Evacúa el sector | C-11, C-16 |
| ΔQ entre 2 y 4 % | Revisar visualmente con el arco apagado; comparar FT | C-05, S-21 |
| ΔQ oscila sin fuga visible | Ventear el circuito; limpiar electrodos del FT | S-21 |
| T salida > 60 °C, caudal normal | Reducir potencia; revisar escoria y quemador | S-01, C-07 |
| P < 3 bar | Cambiar a bomba de reserva; si no recupera, detener el arco | C-12, C-05 |
| Explosión o proyección de metal | Emergencia MS-ACE-09; no reingresar sin autorización | C-04, Brigada |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Con qué ΔQ se dispara el arco del horno?
   a) > 2 %
   b) > 4 %
   c) > 10 %

2. Hay agua visible sobre el baño. ¿Qué haces con el horno?
   a) Bascular para vaciar rápido
   b) No bascular y evacuar a ≥ 25 m
   c) Subir los electrodos y seguir

3. Por UT, un punto junto a la fuga mide 4.5 mm. ¿Qué procede?
   a) Soldar la fuga
   b) Cambiar el panel completo
   c) Operar y medir la semana siguiente

4. ¿Cuál es la prueba hidrostática después de reparar?
   a) 6 bar por 10 min
   b) 10 bar por 30 min
   c) 25 bar por 5 min

5. ¿Qué atmósfera se requiere para soldar u oxicortar?
   a) < 10 % LEL
   b) 0 % LEL detectable (≤ 1 % de lectura)
   c) < 20 % LEL

**Clave de respuestas:**

1. b) > 4 % — ΔQ > 2 % da alarma e inspección; ΔQ > 4 % abre el interruptor del arco y corta O₂, GN y carbono.
2. b) No bascular y evacuar a ≥ 25 m — Con agua en el horno no se bascula ni se mueven electrodos; se evacúa y se espera sin vapor ≥ 30 min.
3. b) Cambiar el panel completo — Se repara solo si todos los puntos miden ≥ 5 mm; con menos de 5 mm se cambia el tubo o el panel.
4. b) 10 bar por 30 min — 10 bar sostenidos 30 min con la bomba aislada: cualquier caída o goteo es rechazo.
5. b) 0 % LEL detectable (≤ 1 % de lectura) — < 10 % LEL es para entrar; para trabajo en caliente se exige 0 % LEL detectable en monitoreo continuo.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-19 Mecánico | U | 16 h | 40 h / 3 reparaciones | 24 meses; altura y confinado 12 |
| S-23 Soldador | U | 8 h + ASME IX/AWS | 3 reparaciones | 24 meses; 6 sin uso: recalificar |
| S-21 Instrumentista | U | 12 h | 2 pruebas de lógica | 24 meses |
| S-20 Electricista | O | NOM-029 + MT | 3 bloqueos E1 | 12 meses |
| S-04 Grúa de Carga | U | NOM-006 + izaje | 2 izajes de panel | 12 meses |
| C-11 Emisor de permisos | O | 12 h | 5 permisos con tutor | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] No bascula con agua, evacúa a ≥ 25 m y vacía solo con autorización de C-05
- [ ] Firma permisos en caliente, altura y confinado; aplica LOTO completo E1–E6
- [ ] Prueba energía cero: arranque rechazado, 0 V, 0 bar y gases (≤ 1 % LEL para soldar)
- [ ] Suelda con monitoreo continuo o iza el panel sin nadie bajo la carga
- [ ] Prueba hidrostática 10 bar / 30 min sin caída
- [ ] Retira candados con conteo, circula agua antes de energizar y libera con doble firma

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Agua en el horno: no se bascula.** Arco fuera, evacuar a ≥ 25 m y esperar sin vapor ≥ 30 min.
- **Sin LOTO y energía cero no se toca.** Candado personal en E1–E6 y prueba de arranque, tensión, presión y gases.
- **Menos de 5 mm: se cambia.** El tubo o panel con espesor < 5 mm no se repara con soldadura.
- **Sin prueba de 10 bar no se libera.** 30 min sin caída ni goteo; liberación firmada por C-11 y C-05.

## 7. Por confirmar

- Diámetro y espesor del tubo, pandeo y torque de bridas con el OEM
- Tiempo de espera sin vapor ≥ 30 min y T de salida ≤ 50 °C (supuestos)
- WPS de reparación y H ≤ 5 ppm en LF (validar con C-09)

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | Pendiente |
| Seguridad | experto-seguridad-salud | Pendiente |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

