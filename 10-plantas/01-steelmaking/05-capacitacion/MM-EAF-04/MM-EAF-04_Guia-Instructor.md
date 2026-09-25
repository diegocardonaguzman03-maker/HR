# MM-EAF-04 — Mantenimiento del transformador del horno y maniobras de alta tensión

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MM-EAF-04 — Mantenimiento del transformador del horno y maniobras de alta tensión |
| Área | Acería · subestaciones de EAF-1 / EAF-2 |
| Serie | Mantenimiento |
| Manual base | `03-mantenimiento/MM-EAF-04-transformador-maniobras-alta-tension.md` v0.2 (borrador para validación; visto bueno de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-20 Electricista (MT certificado) · S-21 Instrumentista · S-01 Operador de Púlpito · C-12 · C-05 |
| Presentación | MM-EAF-04_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Maniobrar con las 5 reglas de oro y mantener el transformador de 140 MVA por aceite, gases y pruebas

**Principio rector:** Sin licencia de maniobra, sin 0 V verificado y sin tierras visibles, nadie toca.

**Por qué importa:** El primario trabaja a 34.5 kV [Supuesto]: un contacto o un arco en maniobra es fatal o deja quemaduras graves. El transformador de 140 MVA sufre cortocircuitos del arco y miles de operaciones de OLTC e interruptor; si falla, el horno se detiene y la secuencia de CC se pierde.

## 2. Objetivos de aprendizaje

1. **Aplicar las 5 reglas de oro.** Desconectar, prevenir reconexión, verificar ausencia de tensión, aterrizar y cortocircuitar, delimitar la zona.
2. **Verificar 0 V sin atajos.** Detector probado en fuente conocida, 3 fases y otra vez en fuente conocida; tierras en primario y secundario.
3. **Leer aceite, gases y pruebas.** Rigidez ≥ 50 kV, humedad ≤ 15 ppm, C₂H₂ ≤ 1 ppm, PI ≥ 1.5, Tan δ ≤ 0.5 %, TTR ±0.5 %.
4. **Restituir con conteo.** Tierras retiradas = colocadas, protecciones probadas y personal contado fuera antes de energizar en vacío.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de electrocución y arco en maniobra | Láminas 1–2 |
| 2. Roles y flujo de la maniobra | 45 | Las 5 reglas de oro en el unifilar | Láminas 3–6, unifilar |
| 3. Equipos y especificaciones | 75 | Lectura de un reporte de DGA y fisicoquímicos | Láminas 7–8, reporte |
| 4. Seguridad, LOTO y energía cero | 90 | Detector, pértiga, tierras y EPP arc-rated | Láminas 9–10, EPP físico |
| 5. Calidad y paso a paso | 90 | Lectura guiada de los 16 pasos; pasos ★ | Láminas 11–13 |
| 6. Práctica de maniobra en mesa | 60 | Maniobra completa con conteo de tierras | Unifilar, pértiga, detector |
| 7. Condiciones anormales | 45 | Simulacro de mesa: disparo por Buchholz | Lámina 14 |
| 8. Evaluación teórica | 30 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace en el transformador y la maniobra | RACI |
| --- | --- | --- |
| C-12 Supervisor Eléctrico e Instrumentación | Dueño; emite licencia de maniobra, autoriza pruebas y libera | A |
| S-20 Electricista (MT certificado) | Maniobras, LOTO eléctrico, tierras, pruebas y mantenimiento | R |
| S-21 Instrumentista | Relés de protección, transmisores y monitor de DGA en línea | R |
| S-01 Operador de Púlpito | Lleva el arco a cero, abre el interruptor; firma la liberación | R |
| C-05 Supervisor de Hornos | Autoriza la indisponibilidad del horno | A (operación) |
| C-14 Ingeniero de Confiabilidad | Tendencias de DGA, Tan δ y termografía; RCA | C |
| C-16 Especialista de Seguridad | Arco eléctrico, distancias y EPP | C |
| Laboratorio acreditado (REPSE) | DGA, fisicoquímicos y pruebas especiales (SFRA) | R (externo) |

### 4.2 Flujo del proceso

1. **Licencia:** Unifilar actualizado; firma C-12 y C-05
2. **Arco a cero:** S-01 abre el interruptor desde púlpito
3. **1. Desconectar:** Verifica abierto; extrae o abre
4. **2. Bloquear:** Candado y tarjeta personales
5. **3. Verificar 0 V:** Fuente conocida, 3 fases, fuente
6. **4. Aterrizar:** Cuchillas y tierras en ambos lados
7. **5. Delimitar:** Barreras y señales
8. **Trabajo y pruebas:** Aceite, pruebas, OLTC, protecciones
9. **Restituir:** Conteo de tierras; vacío; liberación

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Transformador del horno | Alimentar el arco | 140 MVA; secundario ≤ 1,200 V | Protecciones en servicio; DGA normal |
| OLTC | Cambiar el voltaje bajo carga | Aceite separado [Validar] | Contador dentro del intervalo OEM |
| Intercambiador aceite–agua | Enfriar el aceite | P de aceite > P de agua; tubo doble | Detector de fuga sin alarma |
| Interruptor de vacío | Conectar y desconectar el horno | Muchas operaciones por día; contador | Desgaste de contactos en OEM |
| Seccionador y cuchillas de tierra | Aislamiento visible y tierra | Enclavamiento con el interruptor | Enclavamiento probado |
| Buchholz, alivio y protección OLTC | Detectar falla interna | Alarma y disparo | Probados con aire o botón |
| Relé multifunción | 87T, 50/51, 51N, 49 | Ajustes del estudio de coordinación | Inyección secundaria vigente |

### 4.4 Parámetros

| Especificación | Objetivo | Tolerancia | Límite / rechazo | Frecuencia |
| --- | --- | --- | --- | --- |
| T de aceite superior | ≤ 70 °C | ≤ 80 °C | Alarma 85; disparo 95 °C | Continuo |
| T de devanado (49) | ≤ 90 °C | ≤ 100 °C | Alarma 105; disparo 115 | Continuo |
| Rigidez del aceite | ≥ 60 kV | ≥ 50 kV | < 40 kV | Trimestral |
| Humedad en aceite | ≤ 10 ppm | ≤ 15 ppm | > 20 alerta; > 30 acción | Trimestral |
| C₂H₂ en tanque (DGA) | 0 ppm | ≤ 1 ppm | > 1; si crece, evaluar | Mensual |
| Índice de polarización | ≥ 2.0 | ≥ 1.5 | < 1.25: no energizar | Anual |
| Tan δ de devanados | ≤ 0.3 % | ≤ 0.5 % | > 0.7 o +0.2 vs. base | Anual |
| Prueba de protecciones | Disparo según ajuste | ±5 % tiempo/corriente | No dispara: no energizar | Anual |

> Primario 34.5 kV [Supuesto]. Límites de temperatura, megger ≥ 1,000 MΩ e intervalos de OLTC e interruptor: [Validar con OEM / Ingeniería de Mantenimiento].

### 4.5 Seguridad: controles críticos

- ★ **Licencia y 5 reglas de oro:** Licencia de C-12 con unifilar; solo personal certificado NOM-029 con autorización escrita del patrón.
- ★ **LOTO eléctrico y energía cero:** Interruptor extraído, seccionador con candado, cuchillas y tierras; detector probado antes y después; cierre y OLTC rechazados.
- ★ **Arco eléctrico en maniobra:** Maniobra remota cuando exista; EPP arc-rated según IEEE 1584 (típ. ≥ 40 cal/cm² en celdas MT [Validar]).
- ★ **Retroalimentación y energía guardada:** Tierras en ambos lados del punto de trabajo; descargar capacitores RC y resortes del interruptor.

**EPP:** Ropa y careta arc-rated de la categoría de la celda · Guantes dieléctricos con protector de cuero · Botas dieléctricas y casco clase E · Lentes de seguridad · Pértiga y detector de tensión certificados

### 4.6 Calidad

| Variable | Especificación | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Perfil de potencia disponible | Todas las derivaciones del OLTC | Prueba funcional tras mantenimiento | Tap-to-tap > 55 min; T fuera de ±15 °C |
| Energía específica | 560–620 kWh/t | KPI diario (C-07) | Energía alta por derivación bloqueada |
| Paros del horno por transformador | 0 | Mensual en CMMS | Pierde secuencia en CC; reoxidación |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Planea | Licencia de maniobra con unifilar actualizado, lista de pasos y responsables | Firmada por C-12 y C-05 | ★ | C-12 |
| 2 | Charla previa | Revisa pasos, EPP, distancias y rescate | Todos entienden su papel |  | C-12, S-20 |
| 3 | Lleva el arco a cero | Sube electrodos y abre el interruptor desde el púlpito | Indicación abierto | ★ | S-01 |
| 4 | Verifica abierto | Indicador eléctrico e indicador mecánico del interruptor | Ambos en abierto | ★ | S-20 |
| 5 | Desconecta | Extrae el interruptor o abre el seccionador con EPP arc-rated | Aislamiento visible | ★ | S-20 |
| 6 | Bloquea | Candado y tarjeta personales en interruptor, seccionador y CCM de auxiliares | Candados puestos | ★ | S-20, S-21 |
| 7 | Verifica ausencia de tensión | Detector MT: fuente conocida, 3 fases, fuente conocida | 0 V en las 3 fases | ★ | S-20 |
| 8 | Aterriza | Cierra cuchillas de tierra; tierras temporales en primario y secundario | Tierras visibles | ★ | S-20 |
| 9 | Delimita | Barreras y señales; libera el área de trabajo | Zona delimitada | ★ | S-20 |
| 10 | Toma muestra de aceite | Válvula de muestreo, jeringa de vidrio sin burbujas, etiqueta | Muestra válida |  | S-20 |
| 11 | Pruebas eléctricas | Quita tierras solo del devanado bajo prueba; megger 5 kV, PI, Tan δ, TTR; descarga y repón tierras | En tabla y tierras repuestas | ★ | S-20 |
| 12 | Interruptor y OLTC | Mantenimiento según manual OEM y contador | Contactos ≤ 1.2 × fábrica |  | S-20 |
| 13 | Prueba protecciones | Inyección secundaria de 87T, 50/51, 51N; disparo real de Buchholz y OLTC | Disparo correcto | ★ | S-21 |
| 14 | Restituye | Retira tierras con conteo contra registro, abre cuchillas de tierra, retira candados | Tierras contadas = puestas | ★ | S-20 |
| 15 | Energiza en vacío | Personal contado fuera y barreras de celda repuestas; cierra sin arco; ruido y magnetización | Sin alarmas; conteo registrado | ★ | S-20, S-01 |
| 16 | Libera | Checklist de liberación firmado por Mantenimiento y Operación | Firmado por C-12 y C-05 | ★ | C-12, C-05 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Disparo por Buchholz o 87T | No re-energizar; DGA urgente y pruebas | C-12, C-10, C-05 |
| Alarma Buchholz (gas acumulado) | Toma muestra de gas del relé y de aceite | C-12 |
| C₂H₂ creciente en tanque | Evaluar sacar de servicio con el OEM | C-12, C-14 |
| Alarma de fuga aceite–agua | Aislar el intercambiador; revisar humedad en aceite | C-12 |
| Aceite > 85 °C | Reducir potencia; revisar bombas y agua | S-01, S-20 |
| OLTC no cambia | Bloquear el OLTC en derivación segura; revisar | S-20, C-07 |
| Punto caliente ΔT > 30 °C | Programar paro para reapriete | C-12 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuál es el orden correcto de las 5 reglas de oro?
   a) Aterrizar, desconectar, verificar
   b) Desconectar, bloquear, 0 V, tierra, zona
   c) Verificar, aterrizar, desconectar

2. ¿Cómo se usa el detector de tensión MT?
   a) Solo en las 3 fases
   b) Fuente conocida, 3 fases, fuente
   c) Una fase basta

3. El índice de polarización salió en 1.2. ¿Qué procede?
   a) Energizar
   b) No energizar y secar
   c) Repetir en un año

4. Dispara la protección Buchholz. ¿Qué haces?
   a) Re-energizar una vez
   b) No re-energizar; DGA urgente
   c) Bloquear el OLTC y seguir

5. Al restituir, ¿qué se verifica con las tierras temporales?
   a) Que estén limpias
   b) Número retirado = número colocado
   c) Que queden en el primario

**Clave de respuestas:**

1. b) Desconectar, bloquear, 0 V, tierra, zona — Desconectar, prevenir reconexión, verificar ausencia de tensión, aterrizar y cortocircuitar, delimitar la zona.
2. b) Fuente conocida, 3 fases, fuente — Se prueba en fuente conocida antes y después para confirmar que el detector funciona.
3. b) No energizar y secar — PI < 1.25 es rechazo: no se energiza; se seca y se diagnostica. Objetivo ≥ 2.0.
4. b) No re-energizar; DGA urgente — Buchholz o 87T indican falla interna: no se re-energiza hasta DGA y pruebas; avisar a C-12, C-10 y C-05.
5. b) Número retirado = número colocado — Se cuentan contra el registro: una tierra olvidada provoca un cortocircuito al energizar.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **O** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-20 Electricista (maniobra MT) | O | 40 h | 5 maniobras | 12 meses; autorización NOM-029 |
| S-20 Electricista (pruebas) | U | 24 h + termografía I | 2 campañas anuales | 12 meses |
| S-21 Instrumentista | U | 24 h + NOM-029 | 2 pruebas | 12 meses |
| C-12 Supervisor | O | Licencias y protecciones | — | 12 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Tramita la licencia; verifica abierto con doble indicación y extrae con EPP arc-rated
- [ ] Coloca candado y tarjeta personales en cada punto de aislamiento
- [ ] Verifica 0 V con detector probado antes y después; coloca tierras en ambos lados; delimita
- [ ] Repone las tierras tras cada prueba y prueba las protecciones antes de energizar
- [ ] Cuenta tierras al restituir y personal fuera antes de energizar en vacío
- [ ] Libera con checklist firmado por C-12 y C-05

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Sin licencia de maniobra no se toca.** Firmada por C-12 y C-05, con unifilar actualizado.
- **Sin 0 V verificado no hay trabajo.** Detector probado antes y después, en las 3 fases.
- **Tierras en ambos lados, contadas.** Primario y secundario; al restituir, retiradas = colocadas.
- **Solo S-20 certificado maniobra MT.** NOM-029 vigente (12 meses) y autorización escrita del patrón.

## 7. Por confirmar

- Voltaje primario del transformador (34.5 kV supuesto) y estudio de arc flash
- Límites de temperatura, megger e intervalos de OLTC e interruptor con el OEM
- Compartimento de aceite del OLTC separado

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | Pendiente |
| Seguridad | experto-seguridad-salud | Pendiente |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | Pendiente |
| Diseño instruccional y formato | experto-documentacion-mejora | Pendiente |
| Aprobación | Director de C&D | Pendiente |

