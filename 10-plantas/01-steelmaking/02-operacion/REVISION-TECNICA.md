# Revisión técnica cruzada — Manuales de operación de la Acería

| Código | Versión | Estado | Revisó | Referencia | Fecha |
|---|---|---|---|---|---|
| RT-MO-ACE-001 | 1.0 | Para decisión del Director | experto-operativo-metalurgia (visto bueno operativo, metalúrgico y de control de proceso) | FT-ACE-001 v0.3 · CAT-ACE-001 · Guía de estilo | 2026-09-25 |

**Mensaje clave:** revisé los 29 manuales de operación (8 EAF, 3 Ollas/LF, 9 CC1, 9 CC2) y sus 3 README. Doy **visto bueno técnico a los 29**: 21 con observaciones (ya corregidas en el texto o pendientes de validar con el OEM) y 8 sin observaciones. Los cambios principales son cuatro: (1) el EAF queda alineado con la ficha v0.3 (560 kWh/t, ≤ 119 MW, DRI de 3.5–4.3 t/min); (2) CC1 usa las grúas de producto de 45 t con tenaza de la ficha v0.2; (3) se unificaron entre manuales el sobrecalentamiento de la 1.ª colada, el precalentamiento del distribuidor, el tiempo de cambio de olla, las velocidades de drenado y el Al por grado; (4) en MO-OLL-01, el llenado con arena ahora va después del precalentamiento. **No marqué "Aprobó"**. Tampoco edité las secciones 6 ni el contenido de los pasos ★: mis hallazgos de seguridad están en la sección 4 para experto-seguridad-salud. **Queda abierta una incoherencia de la ficha v0.3:** con 560 kWh/t no se alcanzan 42 min de arco (el cálculo da ≈ 44 min). La decisión está en la sección 7.

## 1. Resultado por manual

| Manual | Hallazgos | Corrección aplicada | Pendiente de validar con OEM / Ingeniería de Proceso |
|---|---|---|---|
| MO-EAF-01 Preparación entre coladas | Coherente con la ficha: agua 2%/4%/60 °C/3 bar, talón de 20–30 t, 5 min dentro del tap-to-tap de 55 min | Solo la referencia a la ficha v0.3. **Sin observaciones** | Rango de inclinación, arena del EBT, vida del tubo |
| MO-EAF-02 Carga con canasta | Se citaba un "OSR" sin código; C-16 es el ESR (CAT-ACE-001). Se remitía a MM-GR-01 para la grúa de carga, pero ese manual cubre solo las grúas de colada | "OSR" → **C-16 (ESR)** en §2, §3, §4, §5, §9, §10 y §11. Nota sobre el alcance de MM-GR-01 | Umbral del pórtico; altura de apertura de canasta |
| MO-EAF-03 Alimentación de DRI | Tasa de 3.5–5.0 t/min y 124 MW, contra la ficha v0.3: 3.5–4.3 t/min y ≈ 119 MW. M1 estaba en "min del ciclo" | Tasa objetivo 3.8 t/min (3.5–4.3); arriba de 4.3 solo con DRI caliente validado. Ejemplo recalculado a 119 MW (≈ 26 min para 100 t). Tabla de consignas a 119 MW. M1 = min 24–26 de arco | Consigna máxima con DRI caliente (ver S-2); metalización y finos del DRI |
| MO-EAF-04 Perfil de potencia | 560–620 kWh/t, 124 MW y cos φ 0.9, contra la ficha v0.3: 560 (520–600) y FP 0.85 → 119 MW. Con el perfil real, 560 kWh/t no cabe en 42 min | Energía 560 (520–600), alarma > 600 / < 520. Potencia ≤ 119 MW. Corriente nominal ≈ 67 kA. Perfil recalculado: 17 → 150 → 490 → 560 kWh/t en ≈ 44 min de arco. Tiempo de arco 42–44 min (alarma > 47). Nota con la regla "+15 kWh/t ≈ +1 min" | Tabla de taps del OLTC, FP real, compensación (SVC). **P-1** |
| MO-EAF-05 Escoria espumosa | B2, FeO, MgO, O₂, C y cal coherentes con la ficha y con el balance de 100 t de DRI | Solo la referencia a v0.3. **Sin observaciones** | Presiones de O₂/gas, altura de espuma, P₂O₅ |
| MO-EAF-06 T, O activo y muestreo | M1 estaba referido a un "minuto del ciclo" ambiguo. [C]·[O] ≈ 0.0030–0.0040 coherente con C 0.04–0.08% y O 500–900 ppm | M1 = min 24–26 de arco (mitad de la etapa 3 de MO-EAF-04) | Profundidad y tiempo de inmersión de la lanza |
| MO-EAF-07 Vaciado EBT y adiciones | Decía "Sin Al" para CC2 sin dar límite. El cálculo de Al (1.125 × O) está bien | Al soluble ≤ 0.005% y Mn/Si ≥ 3 en varilla y barras, igual que MO-LF-01 y MO-CC2-04 | Tiempo de vaciado, ángulo, retroinclinación ≤ 3 s, rendimientos |
| MO-EAF-08 Empalme de electrodos | Consumo de ≈ 140 mm/colada verificado (1.45 kg/t, 503 kg/m). Se remitía a MM-GR-01 para la grúa de carga | Nota sobre el alcance de MM-GR-01 | **Torque de 610 mm (≈ 4,500 N·m)**; tapón de izaje |
| MO-LF-01 Horno olla | Líquidus y T de envío por familia verificados. No había valor para la primera olla de secuencia | Fila "primera olla de secuencia: T de la familia + 10–15 °C", ligada a MO-CC1-03 y MO-CC2-03 | Pérdidas LF → distribuidor (35–45 °C), Ca/Al 0.08–0.14, química de escoria |
| MO-OLL-01 Preparación de olla | **Orden de pasos:** la arena se colocaba antes del precalentamiento, que puede durar ≥ 8 h en olla fría. La arena se sinteriza y baja la apertura libre (≥ 98%); además, no es compatible con un precalentador horizontal | El precalentamiento pasa a paso 10 y el llenado con arena a paso 11 ("olla caliente, justo antes de entregar"). Se actualizaron §3 y el diagrama. El texto de los pasos ★ no cambió | Tipo de precalentador; cantidad y granulometría de la arena |
| MO-OLL-02 Traslado con grúa | Peso de olla llena ≈ 230 t (150 + tara 70–80 + escoria), coherente entre manuales. No se sabe si los 250 t incluyen la traviesa | Sin cambios de contenido | **Tara real de la olla y peso de la traviesa** (P-8, S-5) |
| MO-CC1-01 Distribuidor | 1,100 ± 50 °C; SEN ≥ 1,000 °C. El operador de grúa de CC no tiene código | Rol remitido a la propuesta S-27 (hoy lo cubre S-15). Criterio de precalentamiento adoptado también en CC2 | Curva de precalentamiento y peso del distribuidor vacío |
| MO-CC1-02 Barra falsa | Coherente (molde, agua, nivel ±3/±8 mm, oscilación) | **Sin observaciones** | Posición de la cabeza (650 mm), chatarra de enfriamiento |
| MO-CC1-03 Arranque | La 1.ª colada tenía alarma en < +20 °C en §5 pero < +15 °C en §9; con > +40 °C limitaba a 0.9 m/min, y MO-CC1-04 a 0.8 | §9 cambia a < +20 °C; con > +40 °C, máx. 0.8 m/min | Nivel de apertura del tapón, tiempo de llenado, rampa |
| MO-CC1-04 Estado estable | Faltaba la nota peritéctica de la ficha v0.2 (familia HSLA completa, polvo peritéctico, 0.8–0.9 L/kg). La zona Z7 ("segmentos 6–7") se traslapaba con Z8 ("7–8"). Cráter, oscilación y flujo verificados (22 m a 1.2 m/min; 2.8 t/min) | Fila peritéctica: C 0.06–0.10%, −0.2 m/min, polvo peritéctico, 0.8–0.9 L/kg. Z7 = segmento 6 | Tabla velocidad–SH, ley de oscilación, reparto de agua por zona, lógica del BOP |
| MO-CC1-05 Cambio de olla | Reserva de 1,100 → 700 mm ≈ 18 t ≈ 6.4 min a 2.8 t/min. Cambio en ≤ 2 min (máx. 3). Coherente | **Sin observaciones** | Tabla nivel–peso, detector de escoria |
| MO-CC1-06 SEN y distribuidor | Supuestos bien marcados (cambiador, 2.º carro). Ca/Al igual que MO-LF-01 | **Sin observaciones** | Existencia del cambiador de SEN y del 2.º carro; grapa de unión |
| MO-CC1-07 Fin de secuencia | Drenado con 600 mm → 0.5 m/min, contra 0.4 en MO-CC1-05/06; faltaba 700 mm | Fila de 700 mm → 0.6 y 600 mm → 0.4 m/min en §5 y en el paso 4 | Tiempo de tapado de cola, velocidad de salida |
| MO-CC1-08 Corte y mesa | **Grúas desalineadas con la ficha v0.2 §6:** proponía la de 25 t para planchones ≤ 17 t y la de 50 t para los demás | 2 × 45 t con tenaza para todos los planchones (13.0–32.8 t); 25 t y 50 t no se usan para planchón. Tabla peso–grúa, §4, §5 y §9 corregidos. Rol remitido a S-27 (hoy S-17) | **Peso de la tenaza ≤ 12 t** (P-9); factor de contracción |
| MO-CC1-09 Inspección de planchón | Coherente (eventos, SH > 35 °C, escarpeo) | **Sin observaciones** | Criterios de escarpeo y clases de segregación con Laminación |
| MO-CC2-01 Distribuidor y buzas | Precalentamiento de 1,000–1,100 °C con alarma < 950 °C, contra el paso ★ 1 de MO-CC2-03 (≥ 1,000 °C) y contra CC1 (1,100 ± 50). Buzas verificadas: 22 mm ≈ 0.57 t/min ≈ 3.0 m/min | Criterio único: 1,100 ± 50 °C, no se cuela con < 1,000 °C, > 1,200 °C baja el fuego. Rol de grúa remitido a S-27 | Diámetros de buza (FT §5), vida de buza, separación entre buzas |
| MO-CC2-02 Barra falsa rígida | ESR sin código | C-16 (ESR) en §2, columna Rol, §9 y §11 | Altura de la cabeza (700 mm), holgura, alineación ± 0.5 mm |
| MO-CC2-03 Arranque por línea | La 1.ª colada decía "hasta +10 °C sobre el objetivo" pero la alarma seguía en > 35 °C | 1.ª colada: objetivo 32 °C, rango 25–40, alarma < 20 / > 40; las siguientes quedan en 20–35. ESR = C-16 | Orden de apertura, rampa, nivel de inicio de extracción |
| MO-CC2-04 Estado estable | ESR sin código. Al ≤ 0.005% y Mn/Si ≥ 3 coherentes con LF y EAF | ESR = C-16 | EMS (no está en la ficha), reparto de rociado, T de enderezado |
| MO-CC2-05 Cambio de olla | Alarma de > 4 min, contra > 3 min en CC1; la reserva de 850 → 500 mm (≈ 13 t) dura ≈ 3.8 min a 3.4 t/min | Alarma > 3 min: objetivo 2 y máximo 3, igual que CC1 | Tabla nivel–peso del distribuidor de 30 t |
| MO-CC2-06 Cambio de buza y cierre | Erosión de 22 → 23.5 mm ≈ 3.4 m/min verificada | **Sin observaciones** | Empuje ≤ 2 s, vida de 8–12 h |
| MO-CC2-07 Fin de secuencia | ESR sin código. Niveles de cierre 450/350/300 mm coherentes con CC2-04/05 | ESR = C-16 | Velocidad de cola, agua de molde ≥ 15 min |
| MO-CC2-08 Corte y lecho | Grúa de 25 t con electroimán, coherente con la ficha. Rol sin código | Rol remitido a S-27 (hoy S-17) | T máxima del electroimán, uso de tenaza en caliente |
| MO-CC2-09 Inspección de palanquilla | Romboidad (6 mm ≈ 2.7%; 11 mm ≈ 5%) verificada | **Sin observaciones** | Límites de defectos con Laminación |
| README EAF / CC1 / CC2 | Remitían a la ficha v0.2 y a inconsistencias ya resueltas. En CC1 decía "grúa de 50 t" para planchón. En CC2 el pendiente de MS-ACE-07 ya se resolvió | Referencias a v0.3 y a este documento. Inconsistencias 1–2 del EAF marcadas "resueltas en v0.3" o abiertas (P-1). Tarjeta de CC1 con grúa de 45 t, precalentamiento y cambio de olla. CC2 con C-16 (ESR) | — |

## 2. Valores unificados entre manuales (quedan iguales en todos)

| Parámetro | Valor único | Manuales |
|---|---|---|
| Energía / potencia del EAF | 560 kWh/t (520–600); ≤ 119 MW; ≈ 67 kA nominales | EAF-03, EAF-04, README EAF |
| Tasa de DRI | 3.5–4.3 t/min (objetivo 3.8); hasta 5.0 t/min solo con DRI caliente validado | EAF-03, README EAF |
| T de vaciado / llegada a LF | 1,630 ± 15 °C / ≈ 1,570–1,590 °C | EAF-04/06/07, LF-01 |
| T de envío del LF contra sobrecalentamiento | Envío = líquidus + SH + 35–45 °C. SH: CC1 20–30 (1.ª colada 25–35); CC2 20–35 (1.ª colada 25–40). Primera olla: + 10–15 °C | LF-01, CC1-03/04/05, CC2-03/04/05 |
| Precalentamiento de olla | Cara caliente 1,000–1,100 °C; olla fría > 4 h → ≥ 8 h | OLL-01, EAF-07 |
| Precalentamiento del distribuidor | 1,100 ± 50 °C; no se cuela con < 1,000 °C; SEN ≥ 1,000 °C (CC1); buza ≥ 900 °C (CC2) | CC1-01/06, CC2-01/03 |
| Niveles del distribuidor | CC1: 900–1,100 mm; cambio de olla ≥ 700; cierre 400; alta 1,250. CC2: 700–850; cambio ≥ 500; cierre 450/350/300 | CC1-03…07, CC2-03…07, README |
| Tiempo de cambio de olla | Objetivo 2 min, máximo 3 min; torreta ≤ 60 s | CC1-05, CC2-05 |
| Al por grado | CC1: Al soluble 0.020–0.045%; CC2 (colada abierta): Al soluble ≤ 0.005%, Mn/Si ≥ 3 | EAF-07, LF-01, CC2-04 |
| Peso de olla llena contra grúa | ≈ 230 t (220–240); no izar con > 240 t sin C-04; grúa de 250/63 t | OLL-02, EAF README |
| Grúas de producto | Planchón: 2 × 45 t con tenaza. Palanquilla: 25 t con electroimán. Distribuidores, segmentos y moldes: 50 t | CC1-01/08, CC2-01/08, README |
| ESR | C-16 en función de ESR (licencia CNSNS) | EAF-02, CC2-02/03/04/07, README CC2 |

## 3. Roles
- Los manuales usan los códigos del catálogo. S-20, S-21, S-22, S-09, S-26, S-13 y S-25 solo aparecen como apoyo (C/I) o como ejecutores en los procesos del catálogo. Ningún manual de operación cita MM-EAF-02, MM-CC-01/02 ni MM-GR-01 como ejecutor, así que no hubo que cambiar códigos.
- **C-16 = ESR:** se aplicó en todos los manuales de operación, fuera de §6.
- **Sin código (pendiente del catálogo §3):** operador de grúa de CC y de producto (propuesta S-27; hoy S-15 o S-17) y escarpador (MO-CC1-09). Se dejaron remitidos a la propuesta.

## 4. Observaciones para experto-seguridad-salud (no las edité)
| # | Manual / sección | Observación |
|---|---|---|
| S-1 | MO-EAF-02 §6.1 y §6.2 | Todavía dice "OSR". Debe decir **C-16 (ESR)**, igual que el resto del manual y el catálogo |
| S-2 | MO-EAF-03 §6.1 | El control crítico "consigna ≤ 35 kg/min/MW" limita el DRI caliente a ≈ 4.2 t/min. La ficha permite 5.0 t/min (≈ 42 kg/min/MW a 119 MW). Hay que decidir: mantener 35 (conservador, lo que dejé en la operación) o fijar un límite propio para DRI caliente validado |
| S-3 | MO-CC1-08 §6.1 | Dice "50 t para > 17 t netas". Debe decir **grúa de 45 t con tenaza para todo planchón; la de 25 t y la de 50 t no se usan** (FT v0.2 §6) |
| S-4 | MO-CC1-07 §8 | La zona de exclusión (paso ★ 9) aparece después de retirar el distribuidor. Sugiero confirmarla antes de cerrar el tapón (paso 6), o aclarar que sigue activa desde MO-CC1-04 |
| S-5 | MO-OLL-02 §5 y paso ★ 7 | Si los 250 t de la grúa incluyen la traviesa (≈ 15–25 t [Supuesto]), el límite de 240 t de olla deja poco o ningún margen. Hay que validar con el OEM antes de certificar |
| S-6 | MO-OLL-01 pasos ★ 10–11 | Cambié el orden (precalentar → arena) sin tocar el texto de los pasos. Falta el visto bueno de seguridad a la secuencia |
| S-7 | Figuras en `img/` (fuera de mi alcance) | `eaf-perfil-potencia.svg` (124/126 MW, cos φ 0.9), `eaf-ciclo-colada.svg` (125 MW, 620 kWh/t) y `eaf-corte-horno.svg` ("DRI 3.5–5.0 t/min") contradicen la ficha v0.3. Las debe corregir el dueño de las figuras |

## 5. Pendientes de validar con el OEM / Ingeniería de Proceso (prioridad)
1. **EAF:** FP real y tabla de taps del OLTC. Perfil real de MW por etapa (define P-1). Torque de empalme de 610 mm.
2. **Grúas:** peso de la traviesa de las grúas de 250/63 t y tara de cada olla. Peso de la tenaza de las grúas de 45 t (≤ 12 t para planchón de 32.8 t).
3. **CC1:** existencia del cambiador rápido de SEN y del segundo carro de distribuidor. Tabla velocidad–SH. Ley de oscilación. Reparto de agua por zona.
4. **CC2:** diámetros de buza (FT §5), EMS (250–400 A, 2–5 Hz), niveles mínimos del distribuidor y rampa de arranque.
5. **LF:** pérdidas LF → distribuidor por máquina y T de envío de la primera olla.

## 6. Propuestas de cambio a la ficha FT-ACE-001 (para una v0.4)
| # | Sección | Propuesta | Justificación |
|---|---|---|---|
| P-1 | §2 Energía / tap-to-tap | Cambiar "560 kWh/t ≈ 42 min de arco" por "560 kWh/t ≈ 43–44 min de arco con perfil real (perforación y afino < 119 MW); tap-to-tap 55–57 min". O mantener 42 min con objetivo de 540 kWh/t | 84 MWh a 119 MW constantes = 42.4 min, pero el promedio real del perfil es ≈ 115 MW. A 57 min salen 1,440 / 57 ≈ 25 coladas/día teóricas, así que las 22–24 coladas/día y las 2.2 Mt/año se mantienen |
| P-2 | §2 | Agregar FP de diseño ≈ 0.85 y corriente nominal ≈ 67 kA a 1,200 V | Los usa MO-EAF-04 para alarmas |
| P-3 | §2 | Si se mantiene "5.0 t/min con DRI caliente", fijar la consigna máxima para DRI caliente (≈ 42 kg/min/MW) de acuerdo con Seguridad (S-2) | Hoy el límite de seguridad es 35 kg/min/MW |
| P-4 | §3 | Tabla de T de envío por familia (bajo C 1,585–1,600; HSLA 1,575–1,595; varilla 1,560–1,580; barras 1,570–1,590 °C) y primera olla de secuencia + 10–15 °C | Hoy la ficha solo da la fórmula |
| P-5 | §3 / §7 | Química de colada abierta en CC2: Al soluble ≤ 0.005% y Mn/Si ≥ 3. En CC1: Ca/Al 0.08–0.14 | Evita que se tapen las buzas; hoy está solo en los manuales |
| P-6 | §3 / §6 | Tara de la olla (≈ 70–80 t), peso máximo de olla llena (≤ 240 t) y si los 250 t incluyen la traviesa | Margen de izaje de metal líquido |
| P-7 | §4 / §5 | Sobrecalentamiento de la 1.ª colada: CC1 25–35 °C; CC2 25–40 °C | Unifica MO-CC1-03 y MO-CC2-03 |
| P-8 | §4 / §5 | Niveles del distribuidor: CC1 cambio de olla ≥ 700, cierre 400, alarma alta 1,250 mm. CC2 cambio ≥ 500, cierre 450/350/300 mm | Hoy la ficha solo da el rango de operación |
| P-9 | §4 / §5 | Precalentamiento del distribuidor: 1,100 ± 50 °C, no se cuela con < 1,000 °C (ambas máquinas) | Criterio único |
| P-10 | §4 / §5 | Cambio de olla: objetivo 2 min, máximo 3 min; giro de torreta ≤ 60 s | Criterio único |
| P-11 | §6 | Peso máximo de la tenaza de las grúas de 45 t (≤ 12 t) | 32.8 t + tenaza ≤ 45 t |

## 7. Decisión requerida del Director
**Tema:** cómo cerrar la incoherencia de energía contra tiempo de arco (P-1) y la incorporación de P-2 a P-11 a la ficha. De esto depende liberar los manuales para la certificación TD-P07.

| Opción | Descripción | Riesgos | Costo |
|---|---|---|---|
| **A (recomendada)** | Instruir al custodio de la ficha (C-01 con C-07/C-08) para emitir la **v0.4** con P-1 a P-11 en 2 semanas. P-1 queda como "arco 43–44 min, tap-to-tap 55–57 min" hasta que el OEM confirme el FP y el perfil. Mientras tanto, los manuales se usan en capacitación teórica con sus marcas [Validar] | Bajo. P-1 no cambia la capacidad del plan (22–24 coladas/día) | ≈ 16–24 h de ingeniería interna [Supuesto]; sin costo externo |
| B | Mantener la ficha v0.3 tal cual y pedir al OEM el perfil real antes de tocarla | Los manuales conservan una nota de discrepancia (42 contra 44 min) que confunde al operador en la certificación | Visita o consulta al OEM (por cotizar) [Supuesto]; 4–6 semanas |
| C | Fijar la energía objetivo en 540 kWh/t para sostener 42 min | Exige más energía química o DRI caliente que aún no están validados; riesgo de metas incumplibles en los KPI | Costo de O₂/C adicional por cuantificar [Supuesto] |

**Recomendación:** opción A, más la validación del OEM de los puntos 1 y 2 de la sección 5 (FP, perfil, traviesa y tenaza) antes del uso en planta. Seguridad debe cerrar S-1 a S-6 en paralelo.
**Fecha límite sugerida para decidir:** 2026-10-09 (la misma fecha que las decisiones pendientes de los README de EAF y CC2).

## 8. Revisión cruzada requerida
- **experto-seguridad-salud:** observaciones S-1 a S-7 y visto bueno del nuevo orden de MO-OLL-01.
- **experto-documentacion-mejora:** control de versiones (hoy los manuales siguen en la versión 0.1, con la fila de revisión técnica en el control de cambios) y corrección de las 3 figuras SVG (S-7).
- **experto-relaciones-laborales:** el rol S-27 (operador de grúa de CC y producto) sigue pendiente en el catálogo; hoy lo cubren S-15 y S-17.
- **Ingeniería de Proceso (C-07, C-08), Refractarios (C-15) y OEM:** la sección 5.

## 9. Cierre
**Resumen (5 líneas):**
1. Visto bueno técnico a los 29 manuales (21 con observaciones y 8 sin observaciones); "Aprobó" queda para el Director.
2. El EAF quedó alineado con la ficha v0.3; CC1 quedó con la grúa de 45 t con tenaza; ESR = C-16 en todos los manuales.
3. Se unificaron el sobrecalentamiento de la 1.ª colada, el precalentamiento del distribuidor, el cambio de olla, el drenado, el Al por grado y la T de envío de la primera olla.
4. MO-OLL-01 quedó en el orden real de planta: la arena se coloca después del precalentamiento.
5. Queda abierta la incoherencia de 560 kWh/t contra 42 min de arco (P-1), con 7 observaciones para Seguridad y 11 propuestas a la ficha.

**Archivos modificados:** los 29 manuales `MO-*.md` y los README de `eaf/`, `cc1/` y `cc2/` en `10-plantas/01-steelmaking/02-operacion/`. **Archivo creado:** este documento.

**Decisiones pendientes del Director:** P-1 (opción A, B o C) y la emisión de FT-ACE-001 v0.4 con P-2 a P-11.
