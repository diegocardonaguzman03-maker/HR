# MO-EAF-06 — Medición de temperatura, oxígeno activo y muestreo

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MO-EAF-06 — Medición de temperatura, oxígeno activo y muestreo |
| Área | Hornos · EAF-1 / EAF-2 |
| Serie | Operación |
| Manual base | `02-operacion/eaf/MO-EAF-06-temperatura-oxigeno-muestreo.md` v0.1 (visto bueno técnico y de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-02 Segundo Hornero · S-11 Muestrero / Analista · S-01 Primer Hornero · C-05 Supervisor de Hornos |
| Presentación | MO-EAF-06_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Medir T y O activo y tomar una muestra confiable para vaciar en ventana, sin exponer a nadie en la puerta

**Principio rector:** Sonda seca, puerta libre y curva válida; si no, no hay lectura.

**Por qué importa:** Con la T, el O y la muestra se decide el vaciado y se calcula el Al de la olla. Una lectura falsa vacía acero frío, sobreoxidado o fuera de grado. Y una sonda húmeda o una persona frente a la puerta durante la inmersión son quemaduras graves.

## 2. Objetivos de aprendizaje

1. **Usar solo sondas secas e íntegras.** Tomar del almacén seco el tipo correcto; desechar la sonda con cartón húmedo, roto o golpeado.
2. **Medir en el momento correcto.** M1 a mitad del DRI (T); M2 al inicio del afino (T + O + muestra); M3 1–2 min antes de vaciar (T + O).
3. **Validar la curva.** Meseta ≤ 2 °C por ≥ 1.5 s; si no, repetir con otra sonda, máximo 2 intentos.
4. **Decidir el vaciado con datos.** T 1,630 ± 15 °C, O 500–900 ppm, C 0.04–0.08 %, P ≤ 0.015 %; enviar T y O a olla y LF.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de proyección por sonda húmeda | Láminas 1–2 |
| 2. Roles y flujo del proceso | 45 | Recorrido del flujo; momentos M1, M2 y M3 | Láminas 3–6 |
| 3. Sondas y curvas | 90 | Interpretar 5 curvas reales; relación C–O | Sondas físicas, curvas impresas |
| 4. Equipos y parámetros | 60 | Ventana de vaciado por grado | Láminas 7–8 |
| 5. Seguridad | 60 | Zona de la puerta; medición manual; EPP | Láminas 9–10, EPP físico |
| 6. Calidad y paso a paso | 75 | Lectura guiada de los 11 pasos; pasos ★ | Láminas 11–13 |
| 7. Condiciones anormales | 45 | Simulacro de mesa: proyección al inmergir | Lámina 14 |
| 8. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 17 |
| 9. Cierre y ruta a OJT | 30 | Plan de OJT y certificación | Láminas 15–16, 18 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en la medición | RACI |
| --- | --- | --- |
| C-05 Supervisor de Hornos | Dueño; autoriza la medición manual y vaciar con datos incompletos | A |
| S-02 Segundo Hornero | Monta la sonda, opera la lanza, valida la curva y envía la muestra | R |
| S-11 Muestrero / Analista | Analiza la muestra en el espectrómetro; reporta en ≤ 4 min [Supuesto] | R |
| S-01 Primer Hornero | Pide la medición a tiempo; decide ajustes y la hora de vaciado | R |
| C-07 Ingeniero de Proceso | Define momentos de medición, tipos de sonda y reglas de validación | C |
| C-09 Metalurgista de Producto | Define límites químicos por grado | C |

### 4.2 Flujo del proceso

1. **Pedir:** S-01 solicita M1, M2 o M3
2. **Sonda:** Seca, íntegra y del tipo correcto
3. **Montar:** “Contacto OK” en la HMI
4. **Puerta libre:** Arco reducido o apagado; nadie al frente
5. **Inmergir:** 300–400 mm; T 4–6 s, O 8–12 s
6. **Validar:** Meseta; si no, otra sonda (máx. 2)
7. **Muestra:** Tubo neumático; laboratorio ≤ 4 min
8. **Decidir:** T, O, C, P en ventana → MO-EAF-07

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Lanza manipuladora | Inmerge sondas sin exponer a nadie | Profundidad y tiempo [Validar con OEM] | Contacto de portasondas; sin alarmas |
| Termopar desechable | Temperatura | ± 3 °C [Supuesto] | Lote vigente, almacenado seco |
| Sonda T + O (celda ZrO₂) | Temperatura y O activo | Rango de O según proveedor | Lote vigente, seca, sin golpes |
| Muestreador (paleta) | Muestra para espectrómetro | Con desoxidante Al/Zr | Seco y sin daño |
| HMI de lectura | Muestra la curva y el valor | Validación automática de meseta | Calibración mensual [Supuesto] |
| Tubo neumático y OES | Envía y analiza la muestra | C, P, S, Mn, Cu, Ni, Cr, Mo, Sn | Sin atascos; OES estandarizado |
| Lanza manual de respaldo | Medir si falla el robot | — | Guardada seca; solo con autorización |

### 4.4 Parámetros

| Parámetro | Objetivo | Rango | Alarma | Acción |
| --- | --- | --- | --- | --- |
| T de vaciado | 1,630 °C | 1,615–1,645 °C | < 1,610 o > 1,650 °C | < 1,610: calentar; > 1,650: LF |
| O activo al vaciado | 700 ppm | 500–900 ppm | > 1,000 o < 400 ppm | > 1,000: menos O₂, más C |
| C al vaciado | 0.06 % | 0.04–0.08 % | > 0.10 % | Más O₂ en el afino |
| P al vaciado | ≤ 0.012 % | ≤ 0.015 % | > 0.015 % | No vaciar sin C-05 / C-09 |
| Profundidad | 350 mm | 300–400 mm [Validar con OEM] | < 250 mm | Repetir: T falsa en escoria |
| Tiempo de inmersión | T 5 s; O 10 s | T 4–6 s; O 8–12 s | > 15 s | Sonda destruida; repetir |
| Meseta válida | ≤ 2 °C en ≥ 1.5 s [Supuesto] | — | Sin meseta | Repetir con otra sonda |
| Tiempo de análisis | ≤ 4 min [Supuesto] | 3–5 min | > 6 min | S-01 decide con T y O |

> Calentar ≈ 1 min por 8–10 °C con tap 14 [Supuesto]. Termopar tipo S o B [Validar con OEM]. Dos lecturas sin energía con > 10 °C de diferencia: revisar lote.

### 4.5 Seguridad: controles críticos

- ★ **Sonda seca o no entra:** Almacén seco y cerrado; cartón íntegro. Sonda húmeda o golpeada se desecha: puede proyectar metal por la puerta.
- ★ **Nadie frente a la puerta:** Roja ≤ 5 m de la puerta, amarilla 5–15 m, mientras la lanza está dentro. Se mide con la lanza manipuladora.
- ★ **Medición manual solo autorizada:** Con OK de C-05, arco apagado, EPP aluminizado completo, un intento y un segundo trabajador observando.
- ★ **Arco y retiro de la muestra:** Potencia reducida o arco apagado según la práctica [Validar con OEM]; retiro lento; la muestra se enfría protegida.

**EPP:** Careta con visor dorado y capucha aluminizada · Chaqueta, polainas y guantes aluminizados · Ropa ignífuga y botas metatarsales · Protección auditiva y detector multigás · Laboratorio: lentes y guantes para muestra caliente

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| T de vaciado | 1,630 ± 15 °C según grado | Sonda en M3, cada colada | Olla congelada o refractario dañado |
| O activo | 500–900 ppm | Sonda en M2 y M3 | Al fuera de rango o exceso de inclusiones |
| Química del baño | C 0.04–0.08 %; P ≤ 0.015 % | Muestra en M2 | Colada fuera de grado |
| Representatividad | Paleta sin porosidad ni escoria | Visual en laboratorio | Análisis falso |
| Trazabilidad | Colada, momento y hora | Etiqueta automática | Error de asignación |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Prepara sondas | Del almacén seco, el tipo requerido (T, T + O, muestreador); cartón sin humedad, roturas ni golpes | Sonda íntegra y seca | ★ | S-02 |
| 2 | Monta la sonda | En el portasondas hasta el tope; verifica “contacto OK” en la HMI | Contacto OK |  | S-02 |
| 3 | Coordina con el púlpito | S-01 reduce potencia o apaga el arco según la práctica; DRI detenido en M2/M3 | Confirmación por radio |  | S-01 |
| 4 | Despeja la puerta | Nadie frente a la puerta ni en la trayectoria de la lanza | Zona libre | ★ | S-02 |
| 5 | Inmerge | Ciclo automático: 300–400 mm bajo la escoria; T 4–6 s, O 8–12 s | Ciclo completo |  | S-02 |
| 6 | Valida la curva | Meseta ≤ 2 °C por ≥ 1.5 s; si no es válida, repite con otra sonda (máx. 2 intentos) | Lectura válida |  | S-02 |
| 7 | Retira y envía la muestra | Retira la paleta sin golpear; enfría en posición protegida; tubo neumático con identificación | Muestra en laboratorio |  | S-02 |
| 8 | Analiza | Prepara la superficie, analiza y reporta en ≤ 4 min | Resultado en nivel 2 |  | S-11 |
| 9 | Decide | Compara T, O, C y P con la ventana del grado; decide ajuste o vaciado | Ventana cumplida |  | S-01 |
| 10 | Informa a olla y LF | Envía T y O finales para el cálculo de adiciones (MO-EAF-07) y a LF | Datos transmitidos |  | S-01 |
| 11 | Respaldo manual | Solo si falla el robot: OK de C-05, arco apagado, EPP completo, un intento, segundo trabajador observando | Lectura sin exposición prolongada | ★ | S-02 / C-05 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Sin meseta o lectura errática | Repetir con otra sonda; limpiar contactos; revisar profundidad | S-01; C-07 si repite |
| Proyección al inmergir | Retirar la lanza y alejarse; apartar el lote; no usar sus sondas (MS-ACE-03) | C-05, C-16 |
| Muestra con porosidad o escoria | Tomar una nueva muestra | S-11 |
| Lanza manipuladora sin servicio | Mantenimiento; respaldo manual solo con autorización de C-05 | C-05, Mtto |
| Laboratorio > 6 min sin resultado | S-01 decide con T y O; C-05 autoriza vaciar solo si el grado lo permite | C-05, C-09 |
| T > 30 °C distinta a la esperada | Repetir la medición; revisar el DRI (MO-EAF-03) | C-07 |
| P > 0.015 % | No vaciar; aplicar MO-EAF-05 | C-05, C-09 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Qué haces con una sonda cuyo cartón está húmedo?
   a) Secarla junto a la puerta
   b) Desecharla
   c) Usarla solo para medir T

2. ¿Qué curva de temperatura es válida?
   a) Subida lenta sin meseta
   b) Meseta ≤ 2 °C por ≥ 1.5 s
   c) Picos y caídas bruscas

3. ¿Cuál es la ventana típica de T de vaciado?
   a) 1,560–1,590 °C
   b) 1,615–1,645 °C
   c) 1,680–1,710 °C

4. Falla la lanza manipuladora. ¿Qué haces?
   a) Medir a mano de inmediato
   b) Pedir autorización a C-05
   c) Vaciar sin medir

5. ¿Para qué sirve el O activo medido en M3?
   a) Calcular el Al de la olla
   b) Medir el nitrógeno
   c) Conocer el peso vaciado

**Clave de respuestas:**

1. b) Desecharla — Sonda húmeda = proyección de metal por la puerta. Se desecha y se revisa el almacén.
2. b) Meseta ≤ 2 °C por ≥ 1.5 s — Subida lenta: sonda en escoria. Picos: contacto o termopar dañado. En ambos casos se repite.
3. b) 1,615–1,645 °C — Objetivo 1,630 °C según grado; < 1,610 se calienta; > 1,650 se ajusta y se avisa a LF.
4. b) Pedir autorización a C-05 — Respaldo manual solo con OK de C-05, arco apagado, EPP completo, un intento y un observador.
5. a) Calcular el Al de la olla — Con el O activo se calculan el Al y las aleaciones de la olla (MO-EAF-07).

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-02 Segundo Hornero | U | 12 h | 40 h / 50 mediciones | 24 meses |
| S-11 Muestrero / Analista | U | 24 h | 80 h / 100 análisis | 24 meses |
| S-01 Primer Hornero | U | 8 h | 20 decisiones de vaciado | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Rechaza una sonda húmeda o dañada
- [ ] Mantiene la zona de la puerta libre durante la inmersión
- [ ] Reconoce una curva válida y una no válida
- [ ] Conoce las condiciones de la medición manual y no la hace sin autorización

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Sonda húmeda no entra al horno.** Cartón húmedo, roto o golpeado: se desecha.
- **Nadie frente a la puerta en la inmersión.** Roja ≤ 5 m; se mide con la lanza manipuladora.
- **Sin meseta no hay lectura.** Se repite con otra sonda, máximo 2 intentos.
- **Medición manual solo con OK de C-05.** Arco apagado, EPP completo, un intento y un observador.

## 7. Por confirmar

- Profundidad y tiempos de la lanza, tipo de termopar y práctica de arco durante la medición con el OEM
- Exactitud ± 3 °C, meseta, tiempo de análisis, calibración mensual y velocidad de calentamiento (supuestos)

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-25 |
| Seguridad | experto-seguridad-salud | Pendiente |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

