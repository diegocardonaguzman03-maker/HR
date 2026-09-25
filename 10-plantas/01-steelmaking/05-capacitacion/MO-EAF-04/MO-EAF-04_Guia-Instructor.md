# MO-EAF-04 — Fusión: perfil de potencia y regulación de electrodos

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-EAF-04 — Fusión: perfil de potencia y regulación de electrodos |
| Área | Hornos · EAF-1 / EAF-2 |
| Serie | Operación |
| Manual base | `02-operacion/eaf/MO-EAF-04-fusion-perfil-potencia-electrodos.md` v0.1 (visto bueno técnico y de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-01 Primer Hornero · S-02 Segundo Hornero · C-05 Supervisor de Hornos · C-07 Ingeniero de Proceso |
| Presentación | MO-EAF-04_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Fundir en ≈ 42–44 min de arco con 560 kWh/t, arco estable y sin dañar bóveda, paneles ni electrodos

**Principio rector:** Tap alto solo con arco cubierto; nadie arriba con el interruptor cerrado.

**Por qué importa:** El arco entrega hasta ≈ 119 MW. Cubierto, esa energía funde la carga; expuesto, perfora paneles y mete agua al horno. Energizar con alguien en la plataforma es una fatalidad. Cada error de perfil se paga en kWh/t, electrodo y minutos de tap-to-tap.

## 2. Objetivos de aprendizaje

1. **Energizar con permisivos en verde.** Bóveda, 0°, agua, hidráulica, presión y todas las llaves cautivas en el tablero; plataformas vacías.
2. **Seguir el perfil de potencia.** Tap 10 en perforación, tap 15 en fusión y baño plano con arco cubierto, tap 14 en afino.
3. **Proteger paneles y electrodos.** Bajar tap con espuma baja o T de panel > 60 °C; ante un colapso, subir electrodos y bajar tap.
4. **Cerrar en energía y tiempo.** 560 kWh/t (520–600), 42–44 min de arco y 1.3–1.6 kg/t de electrodo; registrar todo.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Sesión 1 de 4: apertura y por qué importa | 30 | Casos de arco con fuga de agua y rotura de electrodo | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del perfil por etapas | Láminas 3–6 |
| 3. Eléctrica del EAF y regulación | 90 | Z = V/I; tap y longitud de arco; arco cubierto | Pizarrón, tendencias HMI |
| 4. Equipos y parámetros | 75 | Ejercicio: MWh y minutos de arco con 560 kWh/t | Láminas 7–8, calculadora |
| 5. Seguridad | 60 | Llave cautiva vs. LOTO; puntos de bloqueo | Láminas 9–10, EPP físico |
| 6. Calidad y paso a paso | 60 | Lectura guiada de los 12 pasos; pasos ★ | Láminas 11–13 |
| 7. Condiciones anormales | 45 | Simulacro: disparo por agua y arco inestable | Lámina 14, simulador |
| 8. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 17 |
| 9. Cierre y ruta a OJT | 30 | Plan de OJT y certificación | Láminas 15–16, 18 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en la fusión | RACI |
| --- | --- | --- |
| C-07 Ingeniero de Proceso EAF / LF | Dueño; define perfiles por receta, consignas de impedancia y límites | A |
| S-01 Primer Hornero | Selecciona perfil, energiza, vigila la regulación y atiende alarmas | R |
| C-05 Supervisor de Hornos | Autoriza desviaciones del perfil y operar con una fase en falla | C |
| S-20 Electricista / S-21 Instrumentista | Atienden fallas del interruptor, OLTC, regulación y medición | C |
| S-02 Segundo Hornero | Informa lo que ve: colapso, arco expuesto, escoria | I |

### 4.2 Flujo del proceso

1. **Permisivos:** Agua, bóveda, 0°, llaves completas
2. **Energizar:** Plataformas vacías; “arco en 10 s”
3. **Perforación:** Tap 10, arco corto, ≈ 2 min
4. **Fusión:** Tap 15, ≈ 66 kA, arco cubierto
5. **Baño plano:** ≥ 150 kWh/t; corriente estable
6. **DRI + espuma:** Tap 15 solo con espuma; si no, 12–13
7. **Afino:** Tap 14; T y O en ventana
8. **Apagar:** Interruptor abierto → MO-EAF-07

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Transformador del horno | Suministra potencia | 140 MVA; secundario hasta 1,200 V | Sin alarma de aceite ni Buchholz |
| OLTC | Cambia el voltaje (tap) | 15 posiciones [Validar con OEM] | Contador dentro de mantenimiento |
| Interruptor de vacío | Energiza y desenergiza | ≈ 2–4 operaciones por colada | Contador y estado sin alarma |
| Regulación hidráulica | Posiciona los electrodos | Por impedancia; servoválvulas | Presión en rango; sin fugas |
| Electrodos | Conducen la corriente | 610 mm UHP; niple 4TPI | Longitud; sin grietas (MO-EAF-08) |
| Medición eléctrica | Control y registro | kA, V, MW, kWh | Lectura estable en las 3 fases |
| T de paneles | Detecta arco expuesto | Alarma T de salida > 60 °C | Sin alarma |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| Energía eléctrica | 560 kWh/t | 520–600 kWh/t | > 600 o < 520 | Revisar causas; reportar a C-07 |
| Tiempo de arco | 42–44 min | 40–46 min | > 47 min | Registrar la causa |
| Potencia en baño plano | ≈ 119 MW | 112–119 MW | < 105 MW sostenido | Revisar espuma, tap, regulación |
| Corriente por fase | 66–67 kA | 58–67 kA | > 67 kA | Regulación reduce; bajar tap |
| Desbalance entre fases | ≤ 5 % | 0–10 % [Supuesto] | > 10 % por > 30 s | Revisar electrodo y regulación |
| Cortocircuitos | 0/min | ≤ 2/min en perforación | > 5/min | Revisar impedancia y regulación |
| T de salida de panel | ≤ 50 °C | 35–55 °C | > 60 °C | Bajar 2 taps; mejorar espuma |
| Consumo de electrodo | 1.4 kg/t | 1.3–1.6 kg/t | > 1.7 kg/t | Revisar roturas y oxidación |

> Δ caudal de agua > 2 % alarma, > 4 % disparo; presión del horno > 0 Pa: no subir tap. Tabla de taps: [Validar con OEM / Ingeniería de Proceso].

### 4.5 Seguridad: controles críticos

- ★ **Nadie arriba con interruptor cerrado:** Toda subida: interruptor abierto + llave cautiva por persona o LOTO completo. Sin todas las llaves en el tablero no cierra.
- ★ **Disparo por agua: no se rearma:** Disparo automático > 4 %. No rearmar, no inclinar ni mover electrodos; evacuar a ≥ 25 m (MS-ACE-03).
- ★ **Tap alto solo con arco cubierto:** El arco expuesto perfora paneles y mete agua. T de panel > 60 °C: bajar tap y mejorar la espuma.
- ★ **Ruido, radiación y campo magnético:** > 100 dB(A) y UV/IR: púlpito cerrado y EPP. Personal con implantes no entra a la zona de barras.

**EPP:** Púlpito: ropa ignífuga y calzado de seguridad · Piso: casco y careta con visor dorado · Chaqueta aluminizada frente a la puerta · Guantes y botas metatarsales · Doble protección auditiva con arco encendido · Detector multigás (CO 25/200 ppm)

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| T al final del afino | 1,630 ± 15 °C según grado | Termopar desechable (MO-EAF-06) | Sobre-T: refractario y N; baja: congela |
| Captura de N | Mínima; ≤ 50 ppm [Supuesto] | Laboratorio, al vaciado | N alto en bajo carbono |
| Energía por colada | 560 kWh/t (520–600) | Nivel 2, cada colada | Costo; problema de escoria o DRI |
| Consumo de electrodo | 1.3–1.6 kg/t | Nivel 2, por turno | Costo; roturas |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Verifica permisivos | HMI: bóveda asentada, 0° ± 2°, agua, hidráulica, presión negativa, llaves cautivas completas | Todos en verde | ★ | S-01 |
| 2 | Selecciona el perfil | Perfil de la receta según el grado y el número de canastas | Perfil correcto en nivel 2 |  | S-01 |
| 3 | Energiza | CCTV y radio: plataformas vacías, llaves en el tablero; avisa “arco en 10 s”; cierra el interruptor | Arco en las 3 fases | ★ | S-01 |
| 4 | Perfora | Tap 10, regulación automática; vigila cortocircuitos y desbalance | Penetración en ≈ 2 min |  | S-01 |
| 5 | Pasa a fusión | Tap 15 con arco cubierto por chatarra; quemadores en modo quemador (MO-EAF-05) | ≈ 66 kA, ≈ 117 MW |  | S-01 |
| 6 | Vigila colapsos | Si la corriente se dispara o cae de golpe: sube electrodos, baja tap y confirma integridad | Sin rotura | ★ | S-01 |
| 7 | Detecta baño plano | Corriente estable, baja el ruido, energía ≥ 150 kWh/t | Baño plano |  | S-01 |
| 8 | Inicia DRI y espuma | Arranca MO-EAF-03 y MO-EAF-05; tap 15 solo si la espuma cubre el arco | T de panel ≤ 60 °C | ★ | S-01 |
| 9 | Ajusta tap por espuma | Espuma baja: tap 12–13 y corrige O₂/C; espuma estable: tap 15 | Arco estable |  | S-01 |
| 10 | Afina | DRI detenido; tap 14; medición de T y O (MO-EAF-06) | T y O en ventana |  | S-01 / S-02 |
| 11 | Apaga el arco | Abre el interruptor; sube electrodos a posición de vaciado | Interruptor abierto |  | S-01 |
| 12 | Registra | kWh/t, minutos de arco, MW promedio, roturas y alarmas | Registro completo |  | S-01 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Arco inestable, ruido alto | Bajar 2 taps; corregir O₂/C; bajar la tasa de DRI | C-07 |
| Colapso de chatarra | Subir electrodos, bajar tap; revisar electrodos y corriente | C-05 |
| Rotura de electrodo | Abrir interruptor; el trozo en el baño se funde; columna corta: MO-EAF-08 | C-05 |
| Disparo por fuga de agua (> 4 %) | No rearmar; no inclinar ni mover electrodos; evacuar ≥ 25 m; MO-EAF-01 | C-05, C-04, C-07, Mtto |
| T de panel > 60 °C | Bajar tap; mejorar espuma; si no baja, aislar el panel con C-05 | C-05 |
| Desbalance > 10 % | Revisar longitudes; fase a manual solo con autorización de C-05 | C-05, S-21 |
| Disparo del interruptor | No rearmar más de 1 vez sin revisar; S-20 investiga | S-20, C-05 |
| Electrodo baja solo (deriva) | Abrir interruptor; bloquear hidráulica; LOTO completo, no basta la llave | S-22, C-05 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuál es la potencia activa máxima que da el transformador?
   a) ≈ 100 MW
   b) ≈ 119 MW
   c) ≈ 140 MW

2. ¿Cuándo se usa el tap 15 (1,200 V)?
   a) Siempre, para fundir más rápido
   b) Solo con el arco cubierto
   c) Solo en la perforación

3. La T de salida de un panel sube a 62 °C. ¿Qué haces?
   a) Subir tap para terminar antes
   b) Bajar 2 taps y mejorar la espuma
   c) Seguir; es normal en baño plano

4. Hay disparo por fuga de agua (> 4 %). ¿Qué haces?
   a) Rearmar y seguir con tap bajo
   b) No rearmar ni inclinar; evacuar
   c) Inclinar para sacar el agua

5. ¿Cuál es la energía eléctrica objetivo por colada?
   a) 360 kWh/t
   b) 560 kWh/t
   c) 760 kWh/t

**Clave de respuestas:**

1. b) ≈ 119 MW — 140 MVA × FP ≈ 0.85 ≈ 119 MW: es un límite físico.
2. b) Solo con el arco cubierto — El arco largo expuesto radia a las paredes y perfora paneles. Con espuma baja: tap 12–13.
3. b) Bajar 2 taps y mejorar la espuma — > 60 °C: bajar tap y corregir O₂/C; si no baja, aislar el panel con C-05.
4. b) No rearmar ni inclinar; evacuar — No se rearma ni se mueve el horno; evacuar a ≥ 25 m y aplicar MO-EAF-01 §9.
5. b) 560 kWh/t — 560 kWh/t (520–600). Fuera de rango se revisan demoras, O₂, escoria y DRI.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-01 Primer Hornero | U | 32 h | 160 h / 60 coladas + simulador | 24 meses |
| C-05 Supervisor de Hornos | O (evaluador) | 32 h + evaluador | — | 24 meses |
| C-07 Ingeniero de Proceso | O | 40 h | — | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Enumera los permisivos; verifica llaves completas y plataformas vacías antes de energizar
- [ ] Distingue llave cautiva de LOTO completo (MS-ACE-02 §6.4)
- [ ] Explica por qué el tap alto solo se usa con arco cubierto
- [ ] Responde a un colapso de chatarra sin romper electrodos
- [ ] No rearma tras un disparo por fuga de agua
- [ ] Lee la T de panel y reacciona antes de 60 °C

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Nadie arriba con el interruptor cerrado.** Llave cautiva por persona o LOTO completo; plataformas vacías antes de energizar.
- **Disparo por agua: no se rearma.** No inclinar ni mover electrodos; evacuar a ≥ 25 m hasta que C-05 y C-07 autoricen.
- **Tap alto solo con arco cubierto.** Espuma baja o panel > 60 °C: bajar tap.
- **Un solo rearme sin revisión.** Si el interruptor vuelve a disparar, S-20 investiga antes de energizar.

## 7. Por confirmar

- Tabla de taps, posiciones del OLTC y permisivos para energizar con el OEM
- Tiempo de arco: la ficha da 42 min y el perfil de referencia ≈ 44 min a 560 kWh/t (propuesta a la ficha)
- Desbalance 0–10 % y N ≤ 50 ppm (supuestos)

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

