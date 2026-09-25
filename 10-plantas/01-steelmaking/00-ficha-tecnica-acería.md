# Ficha Técnica de la Acería (Steelmaking) — Complejo Acería Norte

| Código | Versión | Estado | Custodio |
|---|---|---|---|
| FT-ACE-001 | 0.3 (v0.2: buza de CC2, capacidad, grúas de producto, HSLA; v0.3: energía y tasa de DRI del EAF coherentes con el transformador) | **Borrador para validación** | Gerente de Acería (C-01) + Ingenieros de Proceso (C-07, C-08) |

> ⚠️ **Fuente única de datos técnicos.** Todos los manuales, descripciones de puesto y materiales de capacitación de la Acería usan los valores de esta ficha. Son **valores de referencia típicos** para una acería eléctrica alimentada con DRI de este tamaño. **Antes de usar cualquier manual en planta**, Ingeniería de Proceso debe validarlos contra los manuales de los fabricantes (OEM), las especificaciones de GASM y los parámetros reales de la planta. Si un valor cambia, se cambia primero aquí.

## 1. Alcance del área Steelmaking (Acería)

```
 DRI (planta de reducción directa) ──► transportador ──┐
                                                       ▼
 Patio de chatarra ─► canastas ─► EAF-1 / EAF-2 ─► Olla ─► Horno Olla LF-1 / LF-2 ─► Olla ─┬─► CC1 (planchón) ─► Laminación en caliente (tira)
                                                                                         └─► CC2 (palanquilla) ─► Laminación de largos (varilla)
```

| Área | Equipos | Producto |
|---|---|---|
| Hornos | EAF-1, EAF-2 (horno de arco eléctrico de corriente alterna) | Acero líquido primario |
| Metalurgia secundaria | LF-1, LF-2 (horno olla), flota de ollas de 150 t | Acero líquido en composición y temperatura |
| Colada Continua 1 (CC1) | Máquina de planchón, 1 línea | Planchón de 230 mm × 900–1,650 mm |
| Colada Continua 2 (CC2) | Máquina de palanquilla, 6 líneas | Palanquilla de 160 × 160 mm (opcional 130 × 130 mm) |

**Producción de diseño:** 2.2 Mt/año de acero líquido. CC1 ≈ 1.3 Mt/año y CC2 ≈ 0.9 Mt/año. La operación es continua 24/7, con 4 cuadrillas en rol 4x4 de 12 h.

## 2. Horno de Arco Eléctrico (EAF-1 y EAF-2), iguales

| Parámetro | Valor de referencia |
|---|---|
| Tipo | Horno de arco de corriente alterna (AC), 3 electrodos, vaciado excéntrico por el fondo (EBT) |
| Peso de vaciado (colada) | 150 t de acero líquido |
| Talón líquido (hot heel) | 20–30 t |
| Diámetro de la coraza | 7.3 m |
| Transformador | 140 MVA; voltaje secundario hasta 1,200 V; cambiador de derivaciones bajo carga (OLTC) |
| Electrodos | Grafito UHP de 610 mm (24"), 3 columnas; niples cónicos 4TPI |
| Consumo de electrodo | 1.3–1.6 kg/t |
| Carga metálica | 60% DRI/HBI (alimentación continua por el 5.º agujero de la bóveda) + 40% chatarra (1–2 canastas) |
| Canasta de chatarra | 90 m³; carga típica de 55–70 t |
| Alimentación de DRI | 3.5–4.3 t/min con arco estable y escoria espumosa (≈ 30–35 kg/min/MW a ≈ 120 MW activos); hasta 5.0 t/min solo con DRI caliente validado |
| Temperatura del DRI caliente (si aplica) | 500–650 °C |
| Quemadores/lanzas de O₂ (jet coherente) | 4 en pared, hasta 2,500 Nm³/h cada uno, más gas natural para el modo quemador |
| Consumo de O₂ | 30–40 Nm³/t |
| Inyección de carbono | 8–12 kg/t (finos de coque/antracita) |
| Cal / dolomita | Cal 30–45 kg/t; dolomita 10–15 kg/t |
| Escoria objetivo | Basicidad B2 (CaO/SiO₂) 1.8–2.2; FeO 25–35%; MgO 8–10% (saturación) |
| Energía eléctrica | Objetivo 560 kWh/t (rango 520–600) de acero líquido. Límite físico: 140 MVA × FP ≈ 0.85 ≈ 119 MW activos, así que 560 kWh/t ≈ 84 MWh ≈ 42 min de arco. Cada +15 kWh/t alarga el arco ≈ 1 min |
| Tiempo de colada a colada (tap-to-tap) | 55 min objetivo (55–57 min real); arco encendido 42–44 min a 560 kWh/t |
| Temperatura de vaciado | 1,630 °C ± 15 °C (según grado) |
| Química al vaciado (típica) | C 0.04–0.08%; O activo 500–900 ppm; P ≤ 0.015% |
| Enfriamiento por agua | Paneles de pared y bóveda de tubo; caudal total ≈ 2,200 m³/h a 4–6 bar |
| Alarmas de agua | Temperatura de salida de panel > 60 °C; **fuga: diferencia de caudal entrada–salida > 2% (alarma) y > 4% (disparo del arco)**; presión baja < 3 bar |
| Humos | 4.º agujero con evacuación directa (DES), cámara de combustión y casa de bolsas; presión del horno −5 a −15 Pa |
| Coladas por día (por horno) | ≈ 22–24 |

## 3. Ollas y Horno Olla (LF-1 y LF-2)

| Parámetro | Valor de referencia |
|---|---|
| Ollas | Flota de 10 ollas de 150 t (7 en ciclo, 3 en mantenimiento o reserva) |
| Refractario de la olla | Línea de escoria MgO-C; barril y fondo Al₂O₃-MgO-C; vida de 60–80 coladas |
| Válvula deslizante | Placas de 2 o 3 piezas; buza colectora; arena de sello de cromita (apertura libre ≥ 98% objetivo) |
| Tapón poroso | 1–2 en el fondo; argón |
| Precalentamiento de la olla | 1,000–1,100 °C en la cara caliente antes de recibir acero (olla fría fuera de ciclo > 4 h: precalentar ≥ 8 h) |
| Transformador del LF | 25 MVA; electrodos de 457 mm (18") |
| Velocidad de calentamiento | 4–5 °C/min |
| Argón | Agitación fuerte 400–600 NL/min (desulfuración); suave 50–150 NL/min (flotación de inclusiones, ≥ 8 min antes del envío) |
| Alimentador de alambre | 2 líneas: CaSi (tratamiento de inclusiones), Al, C |
| Objetivos típicos | S ≤ 0.010%; Al soluble 0.020–0.045% (acero calmado al Al para CC1); temperatura de envío a CC = líquidus + sobrecalentamiento + pérdidas de transporte |
| Tiempo de tratamiento | 35–45 min |

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
| Molde | Placas de Cu-Ag con recubrimiento de Ni; longitud 900 mm; conicidad en caras angostas ≈ 1.0–1.2%/m |
| Agua de molde | Caras anchas ≈ 4,200 L/min cada una; caras angostas ≈ 450 L/min cada una; ΔT 6–9 °C; alarma ΔT > 11 °C o caudal < 90% |
| Control de nivel de molde | Sensor de corrientes parásitas (eddy current); **nivel ±3 mm (normal); alarma ±8 mm** |
| Oscilación | Hidráulica, 120–200 cpm, carrera 4–8 mm, oscilación no senoidal |
| Polvo de molde | Consumo 0.3–0.5 kg/t; capa líquida 8–15 mm |
| Sobrecalentamiento en el distribuidor | 20–30 °C sobre el líquidus (líquidus típico de acero bajo carbono ≈ 1,525 °C) |
| Enfriamiento secundario | 10 zonas de niebla aire–agua; agua específica 0.8–1.2 L/kg |
| Segmentos | 14 segmentos; espesor (gap) de rodillos según la tabla de conicidad; tolerancia ± 0.5 mm |
| Sistema de predicción de breakout (BOP) | Termopares en las placas del molde (3 filas); alarma por patrón de "sticker" |
| Barra falsa | Tipo cadena, inserción por abajo |
| Corte | Oxicorte (O₂ + gas natural); longitud del planchón 8–11 m |
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
| Molde | Tubo de Cu-Ag de 1,000 mm; conicidad 0.8–1.0%/m; agitador electromagnético (EMS) |
| Agua de molde | ≈ 2,000 L/min por línea; velocidad en la ranura 10–12 m/s; ΔT 6–10 °C; alarma ΔT > 12 °C o caudal < 90% |
| Control de nivel de molde | **Radiométrico con fuente sellada de Cs-137** (ver MS-ACE-07); nivel ±5 mm |
| Oscilación | 150–250 cpm; carrera 6–10 mm |
| Sobrecalentamiento | 20–35 °C |
| Enfriamiento secundario | Pie de rodillos + 3 zonas de rociado; agua específica 1.5–2.0 L/kg |
| Enderezado | Rodillos extractores-enderezadores multipunto |
| Barra falsa | Rígida |
| Corte | Oxicorte automático; palanquilla de 12 m |
| Agua de emergencia | Igual que CC1 (torre + diésel, ≤ 15 s) |

## 6. Grúas de la nave

| Grúa | Capacidad | Uso |
|---|---|---|
| Grúas de carga (nave de hornos) | 2 × 120/40 t | Canastas de chatarra, mantenimiento de bóveda |
| Grúas de colada (nave de ollas) | 2 × 250/63 t, con doble sistema de freno y límites redundantes | Ollas llenas de acero |
| Grúas de CC y de producto | 2 × 50 t (distribuidores, segmentos, moldes) + 2 × 45 t con tenaza (planchón de CC1, hasta ≈ 32.8 t + tenaza) + 1 × 25 t con electroimán (palanquilla de CC2) | Corregido en v0.2: las grúas de 25 t no pueden levantar planchones de CC1 |

## 7. Grados típicos (familias)

| Familia | Máquina | Ejemplo de química (%) | Uso |
|---|---|---|---|
| Bajo carbono calmado al Al | CC1 | C 0.03–0.06; Mn 0.20–0.35; Al 0.025–0.045; S ≤ 0.010 | Lámina automotriz y de electrodomésticos |
| HSLA | CC1 | C 0.06–0.10; Mn 0.8–1.4; Nb 0.02–0.05 | Tubería, estructural. ⚠️ **Rango peritéctico**: riesgo de grieta longitudinal; usar polvo de molde peritéctico, velocidad −0.2 m/min y enfriamiento secundario suave (0.8–0.9 L/kg) |
| Varilla corrugada | CC2 | C 0.25–0.35; Mn 0.8–1.2; Si 0.15–0.30; CE ≤ 0.55 | Varilla NMX-B-506 / ASTM A615 |
| Barras comerciales | CC2 | C 0.15–0.25; Mn 0.6–0.9 | Perfiles y barras |

## 8. Supuestos de plantilla (para dimensionar puestos)

| Área | Plantilla aproximada [Supuesto] |
|---|---|
| Hornos EAF + LF + ollas + patio de chatarra | ≈ 380 |
| CC1 + CC2 (incluye preparación de distribuidores y despacho) | ≈ 330 |
| Mantenimiento de Acería (mecánico, eléctrico, instrumentación, hidráulica, refractarios, taller de moldes/segmentos) | ≈ 250 |
| Staff de confianza (gerencia, superintendencias, jefes de turno, ingeniería, calidad, seguridad) | ≈ 60 |
| **Total Steelmaking** | **≈ 1,020** (coherente con la cartera del coordinador TD-C-ACN-02: ≈ 1,000) |
