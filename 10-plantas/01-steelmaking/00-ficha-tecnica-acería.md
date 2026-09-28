# Ficha Técnica de la Acería (Steelmaking) — Complejo Acería Norte

| Código | Versión | Estado | Custodio |
|---|---|---|---|
| FT-ACE-001 | 0.4 (v0.2: buza de CC2, capacidad, grúas de producto, HSLA; v0.3: energía y tasa de DRI coherentes con el transformador; **v0.4: carga ≈ 95–100 % DRI de pelet propio por decisión D-010, sin chatarra comprada**) | **Borrador para validación** | Gerente de Acería (C-01) + Ingenieros de Proceso (C-07, C-08) · custodio técnico: experto-operativo-metalurgia |

> ⚠️ **Fuente única de datos técnicos.** Todos los manuales, descripciones de puesto y materiales de capacitación de la Acería usan los valores de esta ficha. Son **valores de referencia típicos** para una acería eléctrica de este tamaño alimentada con DRI. **Antes de usar cualquier manual en planta**, Ingeniería de Proceso debe validarlos contra los manuales de los fabricantes (OEM), las especificaciones de GASM y los parámetros reales de la planta. Si un valor cambia, se cambia primero aquí.
>
> **Interfaces con otras plantas:** los valores de DRI, bandas y balance anual vienen de `10-plantas/00-cadena-de-valor/CV-GASM-001-cadena-de-valor.md`. Si esta ficha y CV-GASM-001 no coinciden, manda CV-GASM-001 y se corrigen las dos.

## 1. Alcance del área Steelmaking (Acería)

**Mensaje clave (D-010, 2026-09-28):** GASM **no compra chatarra**. El EAF funde **DRI de pelet propio (≈ 95–100 %)** que llega por **bandas transportadoras cerradas** desde las plantas **HYL** y **Midrex** a los **silos de día**, y se alimenta **en continuo por el 5.º agujero**. Solo se recirculan **retornos internos ≤ 5 %** (despuntes, rechazos y derrames), en una canasta ocasional. **No hay patio de chatarra ni pórtico de recepción de chatarra externa.**

```
 Planta HYL ──(banda cerrada)──┐                       Tolvas de cal y dolomita ─┐
                               ├─► Torre de transferencia ─► Silos de día (4) ─► Básculas dosificadoras ─┴─► Banda del 5.º agujero ─┐
 Planta Midrex ─(banda cerrada)┘   (límite de batería RD / Acería)   N₂ · T · CO/H₂                                                  ▼
 Retornos internos (despuntes, rechazos, derrames; ≤ 5 %) ─► área techada de retornos ─► canasta ocasional ─────────────► EAF-1 / EAF-2
                                                                                                                                   │
        EAF ─► Olla ─► Horno Olla LF-1 / LF-2 ─► Olla ─┬─► CC1 (planchón) ─► Laminación en caliente (tira)
                                                        └─► CC2 (palanquilla) ─► Laminación de largos (varilla)
```

| Área | Equipos | Producto |
|---|---|---|
| Manejo de materiales | Llegada de 2 bandas de DRI (HYL y Midrex), 4 silos de día, básculas dosificadoras, bandas al 5.º agujero, tolvas de cal y dolomita, área de retornos internos | DRI y fundentes dosificados al EAF |
| Hornos | EAF-1, EAF-2 (horno de arco eléctrico de corriente alterna) | Acero líquido primario |
| Metalurgia secundaria | LF-1, LF-2 (horno olla), flota de ollas de 150 t | Acero líquido en composición y temperatura |
| Colada Continua 1 (CC1) | Máquina de planchón, 1 línea | Planchón de 230 mm × 900–1,650 mm |
| Colada Continua 2 (CC2) | Máquina de palanquilla, 6 líneas | Palanquilla de 160 × 160 mm (opcional 130 × 130 mm) |

**Producción de diseño:** 2.2 Mt/año de acero líquido. CC1 ≈ 1.3 Mt/año y CC2 ≈ 0.9 Mt/año. La operación es continua 24/7, con 4 cuadrillas en rol 4x4 de 12 h. El balance que demuestra que el EAF llega a 2.2 Mt/año con 100 % DRI está en la **§9**.

## 2. Horno de Arco Eléctrico (EAF-1 y EAF-2), iguales

| Parámetro | Valor de referencia |
|---|---|
| Tipo | Horno de arco de corriente alterna (AC), 3 electrodos, vaciado excéntrico por el fondo (EBT) |
| Peso de vaciado (colada) | 150 t de acero líquido |
| Talón líquido (hot heel) | **30–40 t (objetivo 35 t).** Con 100 % DRI el horno **arranca sobre pie líquido**: el DRI se funde al caer en el baño. Un talón mayor que con chatarra da arranque a potencia plena y menos riesgo de acumulaciones (icebergs). Volumen de coraza y bordo libre de la puerta [Validar con OEM] |
| Diámetro de la coraza | 7.3 m |
| Transformador | 140 MVA; voltaje secundario hasta 1,200 V; cambiador de derivaciones bajo carga (OLTC); **factor de potencia de diseño ≈ 0.85; corriente nominal ≈ 67 kA a 1,200 V** (140 MVA / (√3 × 1,200 V)) |
| Potencia activa | Límite físico ≈ **119 MW** (140 MVA × FP 0.85). Potencia media con arco encendido ≈ **115 MW** (baño plano ≈ 117 MW) [Validar con OEM] |
| Electrodos | Grafito UHP de 610 mm (24"), 3 columnas; niples cónicos 4TPI |
| Consumo de electrodo | **1.4–1.7 kg/t (objetivo 1.5).** Sube respecto de la práctica con chatarra por el mayor tiempo de arco; baja la rotura porque no hay colapsos de carga |
| Carga metálica | **≈ 95–100 % DRI** de pelet propio (mezcla HYL + Midrex), alimentación continua por el 5.º agujero, más **retornos internos ≤ 5 %** (objetivo ≈ 3 %). **Sin chatarra comprada** |
| DRI por colada | **≈ 165 t (160–170 t)** para 150 t de vaciado: ≈ 1.13 t de DRI por t de acero líquido (CV-GASM-001). Con 5 t de retornos baja a ≈ 160 t |
| Canasta | 90 m³ **solo para retornos internos**: 10–20 t, **1 canasta cada 2–4 coladas**, al inicio de la colada sobre el pie líquido. **Arranque en frío** (horno sin talón tras reparación de solera): 1 canasta de 40–60 t de retornos. Inventario mínimo de retornos para arranque en frío ≥ 120 t [Supuesto] |
| Alimentación de DRI | **3.5–4.3 t/min** (objetivo 3.7–3.8) con arco estable y escoria espumosa ≈ **30–35 kg/min/MW** a ≈ 115–119 MW. **Máximo 35 kg/min/MW** (control crítico de MO-EAF-03). Se retira la opción de 5.0 t/min con DRI caliente: el DRI llega frío o tibio (≤ 80 °C) |
| Calidad del DRI recibido | Metalización **≥ 92 %** (objetivo ≥ 93 %); carbono de la mezcla **2.2–3.0 %** (HYL 3.0–4.5 %, Midrex 1.5–2.5 %); ganga ácida (SiO₂ + Al₂O₃) 3.5–4.5 % [Supuesto]; tamaño 4–20 mm, **finos < 3 mm ≤ 5 % a la llegada y ≤ 2 % al 5.º agujero** (tras cribado); temperatura **≤ 80 °C**; **sin humedad**. Detalle en §2.1 |
| Quemadores/lanzas de O₂ (jet coherente) | 4 en pared, hasta 2,500 Nm³/h cada uno. Con 100 % DRI trabajan casi siempre en **modo lanza**; el **modo quemador** (con gas natural) solo en arranque en frío, con canasta de retornos o para puntos fríos |
| Consumo de O₂ | **28–38 Nm³/t (objetivo 32).** Descarbura el exceso de carbono del DRI HYL y espuma la escoria |
| Inyección de carbono | **4–8 kg/t (objetivo 6)** de finos de coque/antracita, solo para espumar. El carbono del DRI aporta la mayor parte del carbono de carga. Con más Midrex en la mezcla (menos C) sube hacia 8 kg/t |
| Cal / dolomita | **Cal 45–65 kg/t (objetivo 55); dolomita calcinada 15–25 kg/t (objetivo 20).** Relación cal/DRI ≈ 40–60 kg de cal por t de DRI, según la ganga del lote |
| Escoria | **160–200 kg/t (objetivo ≈ 180)** por la ganga del DRI (antes ≈ 100–130 kg/t con chatarra). ≈ 27 t por colada: **≈ 1 olla de escoria por colada**. Basicidad B2 (CaO/SiO₂) 1.8–2.2; FeO 25–35 % (alarma > 38 %); MgO 8–10 % (saturación); Al₂O₃ 5–8 % [Supuesto] |
| Energía eléctrica | **Objetivo 640 kWh/t (rango 620–680)** de acero líquido. 640 kWh/t × 150 t = 96 MWh ≈ **50 min de arco** a ≈ 115 MW medios. Cada +10 kWh/t alarga el arco ≈ 0.8 min. **Por arriba de ≈ 680 kWh/t no se sostienen 2.2 Mt/año (ver §9)** |
| Efecto de la calidad del DRI en la energía [Supuesto] | Cada −1 punto de metalización: ≈ +12 kWh/t y ≈ +1.5 kg C/t. Cada +1 % de ganga ácida: ≈ +10 kWh/t y ≈ +25 kg de escoria/t |
| Tiempo de colada a colada (tap-to-tap) | **60 min objetivo (58–64 min)**: preparación 5 + arco 50 + vaciado 5. **+3 min** cuando entra la canasta de retornos (1 de cada 2–4 coladas); **promedio ≈ 61 min** |
| Arco encendido | **≈ 50 min (48–53 min)** a 640 kWh/t: arranque sobre pie líquido 3 min + baño plano con DRI 43 min + afino 4 min. **No hay fase de canasta ni perforación** en la colada normal |
| Temperatura de vaciado | 1,630 °C ± 15 °C (según grado) |
| Química al vaciado (típica) | C 0.04–0.08 %; O activo 500–900 ppm; P ≤ 0.015 %; **N ≤ 40 ppm** [Supuesto]; **residuales muy bajos** (Cu ≤ 0.03 %, Cu + Ni + Cr + Mo + Sn ≤ 0.10 % [Supuesto]) porque el hierro viene de mineral propio |
| Enfriamiento por agua | Paneles de pared y bóveda de tubo; caudal total ≈ 2,200 m³/h a 4–6 bar |
| Alarmas de agua | Temperatura de salida de panel > 60 °C; **fuga: diferencia de caudal entrada–salida > 2 % (alarma) y > 4 % (disparo del arco)**; presión baja < 3 bar |
| Humos | 4.º agujero con evacuación directa (DES), cámara de combustión y casa de bolsas; presión del horno −5 a −15 Pa. Más CO en el gas por la descarburación del carbono del DRI: vigilar la postcombustión |
| Coladas por día (por horno) | **22–23 en día de operación** (24 teóricas a 60 min); **≈ 20 de promedio calendario** (7,333 coladas/año por horno) |

### 2.1 Recepción y manejo de DRI (bandas desde HYL y Midrex)

| Parámetro | Valor de referencia |
|---|---|
| Llegada | **2 bandas transportadoras cerradas** directas: 1 desde HYL y 1 desde Midrex. Capacidad de diseño ≈ 250 t/h cada una [Supuesto]; producción media HYL ≈ 150 t/h y Midrex ≈ 163 t/h (CV-GASM-001: 1.2 y 1.3 Mt/año en ≈ 8,000 h) |
| Límite de batería | **Torre de transferencia a la entrada de la nave de silos** [Supuesto]. Hasta ese punto opera Reducción Directa (calidad del DRI, banda y descarga). Desde ahí opera la Acería: S-05 Operador de Manejo de DRI y Retornos, bajo C-17 [Validar con Reducción Directa] |
| Control en la llegada | Báscula de banda por fuente; muestreador automático por turno (metalización, C, finos, ganga); pirómetro o termografía de la banda; criba de finos antes de los silos |
| Silos de día | **4 silos (2 por EAF) de ≈ 1,000 t cada uno** [Supuesto]; ≈ 12 h de autonomía con los dos hornos (consumo ≈ 330 t/h). Cerrados y secos, inertizados con N₂, termopares en varios niveles, medición de CO/H₂ y O₂ en el domo, nivel por radar [Validar con OEM] |
| Temperatura del DRI | En banda y silo **≤ 80 °C**. **Alarma: > 90 °C o subida > 5 °C/h** en cualquier nivel del silo (autocalentamiento por reoxidación). Acción: inertizar con N₂, no cargar más a ese silo y vaciarlo al EAF con prioridad [Validar con OEM] |
| Dosificación | Alimentador por silo → **báscula dosificadora (weigh feeder)** por fuente (HYL y Midrex) → banda del 5.º agujero → tolva de compensación en la bóveda. Exactitud ± 1 % [Supuesto]. La tasa total la manda el control de kg/min/MW; la **proporción HYL/Midrex** la fija C-07 por el carbono objetivo (típica 45–55 % HYL) |
| Carbono de la mezcla | C mezcla = %HYL × C_HYL + %Midrex × C_Midrex. Objetivo 2.2–3.0 %. Con 50/50 y C típicos (≈ 3.7 % y ≈ 2.0 %) ≈ 2.8 %. **> 3.2 %:** descarburación larga y riesgo de ebullición: baja la proporción HYL. **< 1.8 %:** falta carbono para reducir el FeO del DRI: sube la inyección de C |
| Finos | Cribado a < 3 mm antes de los silos. Los finos van a una tolva propia y **no se alimentan por el 5.º agujero** (se van al 4.º agujero y a la casa de bolsas). Destino de los finos: lo define Reducción Directa [Validar con RD] |
| Fundentes | Tolvas de cal y de dolomita calcinada con báscula, alimentadas a la misma banda del 5.º agujero, en proporción al DRI |
| Humedad | **Cero agua.** Bandas cubiertas, silos cerrados, sin rociado de agua sobre DRI (el agua con DRI caliente genera H₂). Agente de extinción y control de incendios en silos: lo define experto-seguridad-salud (MS-ACE-03 / MS-ACE-06) |
| Contingencias | **EAF parado:** Reducción Directa desvía el DRI a su almacenamiento propio [Validar con RD]. **RD parada:** los silos sostienen ≈ 12 h; después se reduce el ritmo o se para el EAF. **No hay chatarra de respaldo** (D-010) |

### 2.2 Retornos internos

| Parámetro | Valor de referencia |
|---|---|
| Origen | Despuntes de cabeza y cola de CC1 y CC2, planchones y palanquillas rechazados (MO-CC1-09, MO-CC2-09), costras de olla y de distribuidor, derrames y metal recuperado de escoria |
| Cantidad | ≈ 2–4 % del acero líquido; **límite ≤ 5 % de la carga metálica** |
| Área | Área techada de retornos en la nave de hornos (sustituye al patio de chatarra); separada por tipo; piso seco |
| Preparación | Corte a ≤ 1.5 × 0.6 m [Supuesto]; **secos** (las costras y derrames enfriados con agua se escurren y se secan bajo techo antes de cargarse); sin escoria adherida en exceso |
| Carga | Canasta de 90 m³, 10–20 t, 1 cada 2–4 coladas, sobre el pie líquido con el horno a 0° y el arco apagado (MO-EAF-02) |
| Verificación radiológica | Detector de radiación en el área de retornos para metal que vuelve de otras áreas, según MS-ACE-07 [Lo define experto-seguridad-salud]. **Ya no hay pórtico de chatarra comprada** |

## 3. Ollas y Horno Olla (LF-1 y LF-2)

| Parámetro | Valor de referencia |
|---|---|
| Ollas | Flota de 10 ollas de 150 t (7 en ciclo, 3 en mantenimiento o reserva) |
| Refractario de la olla | Línea de escoria MgO-C; barril y fondo Al₂O₃-MgO-C; vida de 60–80 coladas |
| Válvula deslizante | Placas de 2 o 3 piezas; buza colectora; arena de sello de cromita (apertura libre ≥ 98 % objetivo) |
| Tapón poroso | 1–2 en el fondo; argón |
| Precalentamiento de la olla | 1,000–1,100 °C en la cara caliente antes de recibir acero (olla fría fuera de ciclo > 4 h: precalentar ≥ 8 h) |
| Transformador del LF | 25 MVA; electrodos de 457 mm (18") |
| Velocidad de calentamiento | 4–5 °C/min |
| Argón | Agitación fuerte 400–600 NL/min (desulfuración); suave 50–150 NL/min (flotación de inclusiones, ≥ 8 min antes del envío) |
| Alimentador de alambre | 2 líneas: CaSi (tratamiento de inclusiones), Al, C |
| Objetivos típicos | S ≤ 0.010 %; Al soluble 0.020–0.045 % (acero calmado al Al para CC1); temperatura de envío a CC = líquidus + sobrecalentamiento + pérdidas de transporte |
| Tiempo de tratamiento | 35–45 min (la cadencia del EAF de ≈ 61 min por horno da ≈ 30 min entre ollas de los dos hornos: con 2 LF hay holgura) |

## 4. Colada Continua 1 (CC1), máquina de planchón

| Parámetro | Valor de referencia |
|---|---|
| Tipo | Vertical-curva, 1 línea, radio 9.5 m, longitud metalúrgica ≈ 32 m |
| Sección | Espesor 230 mm; ancho 900–1,650 mm (ajuste de ancho en caliente) |
| Velocidad de colada | 0.8–1.6 m/min (nominal 1.2 m/min) |
| Torreta de ollas | Brazos tipo mariposa, 2 ollas, pesaje de olla |
| Tubo protector de olla | Con sello de argón |
| Distribuidor (tundish) | 45 t; nivel de operación 900–1,100 mm; control con barra tapón (stopper); presas y diques |
| Buza sumergida (SEN) | Inmersión 120–160 mm; argón en la barra tapón 3–8 NL/min |
| Molde | Placas de Cu-Ag con recubrimiento de Ni; longitud 900 mm; conicidad en caras angostas ≈ 1.0–1.2 %/m |
| Agua de molde | Caras anchas ≈ 4,200 L/min cada una; caras angostas ≈ 450 L/min cada una; ΔT 6–9 °C; alarma ΔT > 11 °C o caudal < 90 % |
| Control de nivel de molde | Sensor de corrientes parásitas (eddy current); **nivel ±3 mm (normal); alarma ±8 mm** |
| Oscilación | Hidráulica, 120–200 cpm, carrera 4–8 mm, oscilación no senoidal |
| Polvo de molde | Consumo 0.3–0.5 kg/t; capa líquida 8–15 mm |
| Sobrecalentamiento en el distribuidor | 20–30 °C sobre el líquidus (líquidus típico de acero bajo carbono ≈ 1,525 °C) |
| Enfriamiento secundario | 10 zonas de niebla aire–agua; agua específica 0.8–1.2 L/kg |
| Segmentos | 14 segmentos; espesor (gap) de rodillos según la tabla de conicidad; tolerancia ± 0.5 mm |
| Sistema de predicción de breakout (BOP) | Termopares en las placas del molde (3 filas); alarma por patrón de "sticker" |
| Barra falsa | Tipo cadena, inserción por abajo |
| Corte | Oxicorte (O₂ + gas natural); longitud del planchón 8–11 m. Despuntes y rechazos → **retornos internos** (§2.2) |
| Agua de emergencia | Torre elevada + bombas diésel; **entrada automática en ≤ 15 s** ante pérdida de energía o de bombeo |

## 5. Colada Continua 2 (CC2), máquina de palanquilla

| Parámetro | Valor de referencia |
|---|---|
| Tipo | Curva, 6 líneas, radio 9 m |
| Sección | 160 × 160 mm (opcional 130 × 130 mm) |
| Velocidad de colada | 2.5–3.5 m/min (160 mm nominal 3.0 m/min). Capacidad de diseño ≈ 3.4 t/min con 6 líneas (≈ 1.7 Mt/año): la máquina tiene holgura sobre el plan de 0.9 Mt/año. Opera por campañas y ajusta la velocidad o el número de líneas a la cadencia de ollas de los EAF |
| Torreta de ollas | 2 brazos; tubo protector con argón |
| Distribuidor | 30 t; nivel de operación 700–850 mm; buza calibrada (metering nozzle) de ZrO₂ con cambio rápido: **160 × 160 mm → 20–24 mm (22 mm a 3.0 m/min)**; 130 × 130 mm → 15–17 mm. Tamaño por balance de masa: caudal ≈ 0.9·√(2·g·h)·área·ρ; con h = 0.8 m, 22 mm ≈ 0.57 t/min por línea [Validar con OEM] |
| Lubricación del molde | Colada abierta con aceite vegetal (colza) 15–25 mL/min por línea |
| Molde | Tubo de Cu-Ag de 1,000 mm; conicidad 0.8–1.0 %/m; agitador electromagnético (EMS) |
| Agua de molde | ≈ 2,000 L/min por línea; velocidad en la ranura 10–12 m/s; ΔT 6–10 °C; alarma ΔT > 12 °C o caudal < 90 % |
| Control de nivel de molde | **Radiométrico con fuente sellada de Cs-137** (ver MS-ACE-07); nivel ±5 mm |
| Oscilación | 150–250 cpm; carrera 6–10 mm |
| Sobrecalentamiento | 20–35 °C |
| Enfriamiento secundario | Pie de rodillos + 3 zonas de rociado; agua específica 1.5–2.0 L/kg |
| Enderezado | Rodillos extractores-enderezadores multipunto |
| Barra falsa | Rígida |
| Corte | Oxicorte automático; palanquilla de 12 m. Despuntes, colas < 6 m y rechazos → **retornos internos** (§2.2) |
| Agua de emergencia | Igual que CC1 (torre + diésel, ≤ 15 s) |

## 6. Grúas de la nave

| Grúa | Capacidad | Uso |
|---|---|---|
| Grúas de carga (nave de hornos) | 2 × 120/40 t | **Canasta de retornos internos** (10–20 t; 40–60 t en arranque en frío), adición de electrodos (MO-EAF-08), cambio de bóveda y delta, refractario y mantenimiento. **Ya no cargan chatarra en cada colada** (v0.4) |
| Grúas de colada (nave de ollas) | 2 × 250/63 t, con doble sistema de freno y límites redundantes | Ollas llenas de acero |
| Grúas de CC y de producto | 2 × 50 t (distribuidores, segmentos, moldes) + 2 × 45 t con tenaza (planchón de CC1, hasta ≈ 32.8 t + tenaza) + 1 × 25 t con electroimán (palanquilla de CC2) | Corregido en v0.2: las grúas de 25 t no pueden levantar planchones de CC1 |

## 7. Grados típicos (familias)

| Familia | Máquina | Ejemplo de química (%) | Uso |
|---|---|---|---|
| Bajo carbono calmado al Al | CC1 | C 0.03–0.06; Mn 0.20–0.35; Al 0.025–0.045; S ≤ 0.010 | Lámina automotriz y de electrodomésticos. El DRI da **N y residuales bajos**, una ventaja para estos grados |
| HSLA | CC1 | C 0.06–0.10; Mn 0.8–1.4; Nb 0.02–0.05 | Tubería, estructural. ⚠️ **Rango peritéctico**: riesgo de grieta longitudinal; usar polvo de molde peritéctico, velocidad −0.2 m/min y enfriamiento secundario suave (0.8–0.9 L/kg) |
| Varilla corrugada | CC2 | C 0.25–0.35; Mn 0.8–1.2; Si 0.15–0.30; CE ≤ 0.55 | Varilla NMX-B-506 / ASTM A615 |
| Barras comerciales | CC2 | C 0.15–0.25; Mn 0.6–0.9 | Perfiles y barras |

## 8. Supuestos de plantilla (para dimensionar puestos)

| Área | Plantilla aproximada [Supuesto] |
|---|---|
| Hornos EAF + LF + ollas + **manejo de DRI, fundentes y retornos** | **≈ 315** (antes ≈ 380 con patio de chatarra). La diferencia sale de S-05: el patio necesitaba ≈ 16 personas por turno (electroimanes, armado de canastas, pórtico, oxicorte de chatarra pesada); el manejo de DRI necesita ≈ 6 por turno (panel de bandas y silos, 2 rondines de bandas y silos, fundentes, 2 en retornos) más un grupo de día para limpieza de bandas y finos: **≈ 30 plazas de S-05 en lugar de 97** [Supuesto; lo concilia experto-relaciones-laborales en DP-ACE-S] |
| CC1 + CC2 (incluye preparación de distribuidores y despacho) | ≈ 330 |
| Mantenimiento de Acería (mecánico, eléctrico, instrumentación, hidráulica, refractarios, taller de moldes/segmentos) | ≈ 250 (incluye bandas, silos y básculas dosificadoras del lado de la Acería) |
| Staff de confianza (gerencia, superintendencias, jefes de turno, ingeniería, calidad, seguridad) | ≈ 60 (C-17 se mantiene, 1 por cuadrilla, ahora como Supervisor de Manejo de Materiales) |
| **Total Steelmaking** | **≈ 955** (antes ≈ 1,020). Cualquier ajuste de plazas sindicalizadas requiere análisis de Relaciones Laborales y decisión del Director (CCT, escalafón, reubicación) |

## 9. Balance de capacidad y energía con 100 % DRI (verificación de v0.4)

**Pregunta:** ¿el transformador de 140 MVA permite fundir 2.2 Mt/año con 100 % DRI a 620–680 kWh/t? **Respuesta: sí, con poca holgura (≈ 5 %).** Por arriba de ≈ 680 kWh/t, o con una potencia media menor de ≈ 108 MW, no se llega.

| Concepto | Cálculo | Resultado |
|---|---|---|
| Coladas necesarias | 2.2 Mt / 150 t | 14,667 coladas/año → **7,333 por horno** |
| Energía por colada | 640 kWh/t × 150 t | 96 MWh |
| Arco encendido | 96 MWh / ≈ 115 MW medios | **≈ 50 min** (arranque 3 min a ≈ 95 MW + baño plano 43 min a ≈ 117 MW + afino 4 min a ≈ 113 MW) |
| Tiempo sin arco | Preparación 5 + vaciado 5 + canasta de retornos prorrateada ≈ 1 | ≈ 11 min |
| Tap-to-tap promedio | 50 + 11 | **≈ 61 min** |
| Horas de horno necesarias | 7,333 × 61 / 60 | ≈ 7,455 h/año (85 % del año) |
| Horas de horno disponibles [Supuesto] | 8,760 − paro semanal 8 h × 52 (416) − paro anual 10 días (240) − demoras no programadas y de secuencia ≈ 3 % (≈ 265) | ≈ 7,840 h/año |
| **Holgura** | 7,840 − 7,455 | **≈ 385 h (≈ 5 %)** |
| Sensibilidad: 680 kWh/t | Arco ≈ 53 min; tap-to-tap ≈ 64 min | ≈ 7,820 h: holgura ≈ 0 % |
| Sensibilidad: 620 kWh/t | Arco ≈ 48.5 min; tap-to-tap ≈ 59.5 min | ≈ 7,270 h: holgura ≈ 7 % |
| DRI necesario | 1.13 t/t × 2.2 Mt (menos ≈ 3 % de retornos) | ≈ 2.42–2.49 Mt/año contra 2.5 Mt de HYL + Midrex: **sin holgura de DRI** |
| Tasa de DRI | ≈ 165 t en ≈ 45 min de alimentación | ≈ 3.7 t/min ≈ 32 kg/min/MW a 115–117 MW: **dentro del máximo de 35 kg/min/MW** |

**Conclusiones para la operación:**
1. El KPI de energía se fija en **640 kWh/t (620–680)** y el tap-to-tap en **60 min** (≈ 61 min de promedio con retornos). El cuello de botella es el transformador: cada minuto sin arco que se ahorre (preparación, vaciado, demoras) es capacidad.
2. **Palancas si el consumo real sale alto:** metalización ≥ 93 %, carbono de la mezcla 2.5–3.0 % aprovechado con O₂ (energía química), talón de 35–40 t, preparación ≤ 5 min, menos canastas de retornos, postcombustión. **DRI caliente** (transporte en caliente desde RD) sería la palanca mayor (≈ −20 kWh/t por cada 100 °C [Supuesto]), pero hoy **no está en el alcance** de D-010.
3. El balance de DRI no tiene holgura: una baja de producción de HYL o Midrex baja directamente el acero. Lo vigilan juntos Reducción Directa y la Acería.

## 10. Control de cambios

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 0.1 | 2026-09-25 | Emisión inicial | Equipo del Director (agentes de EAF, CC1, CC2) |
| 0.2 | 2026-09-25 | Buza de CC2 20–24 mm; capacidad de CC2; grúas de producto de 45 t con tenaza; HSLA peritéctico | Agentes de CC1 y CC2 |
| 0.3 | 2026-09-25 | Energía del EAF coherente con el transformador (≈ 119 MW); tasa de DRI 3.5–4.3 t/min | Agente de EAF |
| 0.4 | 2026-09-28 | **Decisión D-010:** carga ≈ 95–100 % DRI de pelet propio + retornos internos ≤ 5 %; sin chatarra comprada ni patio de chatarra. §1: alcance con bandas desde HYL y Midrex, torre de transferencia y silos de día. §2: talón 30–40 t; FP 0.85 y 67 kA (propuesta P-2 de RT-MO-ACE-001); electrodo 1.4–1.7 kg/t; DRI ≈ 165 t por colada; canasta solo para retornos y arranque en frío; se retira el DRI caliente (P-3 deja de aplicar); calidad del DRI; O₂ 28–38 Nm³/t; C 4–8 kg/t; cal 45–65 y dolomita 15–25 kg/t; escoria 160–200 kg/t; energía 640 kWh/t (620–680); tap-to-tap 60 min; arco ≈ 50 min; 22–23 coladas/día; N y residuales. §2.1 nueva (manejo de DRI) y §2.2 nueva (retornos). §6: uso de grúas de carga. §8: plantilla de hornos ≈ 315 y total ≈ 955. §9 nueva: balance de capacidad (cierra con ≈ 5 % de holgura). La propuesta P-1 (560 kWh/t contra 42 min) queda sustituida por este balance. P-4 a P-11 siguen pendientes de decisión del Director | experto-operativo-metalurgia |
