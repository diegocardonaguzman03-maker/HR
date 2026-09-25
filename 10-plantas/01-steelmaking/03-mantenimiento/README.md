# Manuales de Mantenimiento Crítico — Acería (Steelmaking)

| Código | Versión | Estado | Custodios | Fecha |
|---|---|---|---|---|
| IDX-MM-ACE | 0.1 | Borrador para validación | Gerente Sindicalizado (Líder Academia de Mantenimiento y Confiabilidad) · C-10 Superintendente de Mantenimiento de Acería · revisión técnica experto-operativo-metalurgia · revisión de seguridad experto-seguridad-salud | 2026-09-25 |

**Mensaje clave:** estos 10 manuales cubren los equipos de la Acería cuya falla de mantenimiento puede matar (agua–metal, olla que cae, perforación, alta tensión, radiación) o dañar el producto (conicidad, gap, oscilación, agua de molde). Cada uno trae LOTO con puntos de aislamiento y prueba de energía cero, especificaciones con límite de rechazo, instrumento y frecuencia, pasos ★ para certificar (TD-P07) y checklist de liberación **firmado por Mantenimiento y Operación**. Todos los valores salen de `../00-ficha-tecnica-acería.md` (FT-ACE-001); lo que depende del fabricante está marcado **[Validar con OEM / Ingeniería de Mantenimiento]** y **no debe usarse en planta hasta validarse**.

## 1. Índice de manuales

| Código | Manual | Dueño | Ejecutan | Figura | Normas clave |
|---|---|---|---|---|---|
| MM-EAF-01 | [Fugas en paneles y bóveda enfriados por agua](MM-EAF-01-fugas-paneles-boveda.md) | C-11 | S-19, S-23, S-21 | `../img/mm-panel-enfriado-fuga.svg` | NOM-004, 027, 009, 033 |
| MM-EAF-02 | [Brazos, columnas, regulación hidráulica y cambio de bóveda/delta](MM-EAF-02-brazos-columnas-regulacion-cambio-boveda.md) | C-11 | S-19, S-22, S-20, S-04 | — (mermaid) | NOM-004, 006, 009, 020, 029 |
| MM-EAF-03 | [Refractario del EAF: solera, bancos, EBT y gunning](MM-EAF-03-refractario-eaf-solera-ebt-gunning.md) | C-15 | S-24, S-03 | `../img/mm-ebt-cambio.svg` | NOM-033, 015, 010, 009 |
| MM-EAF-04 | [Transformador del horno y maniobras de alta tensión](MM-EAF-04-transformador-maniobras-alta-tension.md) | C-12 | S-20 | — (mermaid unifilar) | NOM-029, NOM-001-SEDE |
| MM-OLL-01 | [Válvula deslizante, tapón poroso y revestimiento de ollas](MM-OLL-01-valvula-deslizante-tapon-revestimiento-ollas.md) | C-15 | S-24, S-08 | — (mermaid) | NOM-033, 015, 006 |
| MM-CC-01 | [Moldes: conicidad y desgaste (CC1 placas / CC2 tubos)](MM-CC-01-moldes-conicidad-desgaste.md) | C-11 | S-25, S-19, S-21, S-22 | `../img/mm-molde-conicidad.svg` | NOM-004, 006, 012 |
| MM-CC-02 | [Segmentos y guías: gap y alineación](MM-CC-02-segmentos-guias-gap-alineacion.md) | C-11 | S-25, S-19, S-21, S-22 | `../img/mm-segmento-gap-alineacion.svg` | NOM-004, 006, 020, 033 |
| MM-CC-03 | [Agua de molde, secundaria y emergencia](MM-CC-03-agua-molde-secundaria-emergencia.md) | C-12 | S-19, S-21 | `../img/mm-agua-emergencia.svg` | NOM-004, 029, 009 |
| MM-CC-04 | [Hidráulica de oscilación, nivel, barra tapón y fuente de Cs-137](MM-CC-04-hidraulica-oscilacion-nivel-tapon-fuente-cs137.md) | C-12 | S-22, S-21 | — (mermaid) | NOM-012, 020, 029; licencia CNSNS |
| MM-GR-01 | [Grúas de colada: ganchos, frenos, cables, límites](MM-GR-01-gruas-colada-inspeccion.md) | C-11 | S-19, S-20, S-09 (checklist diario), S-26 | `../img/mm-gancho-grua-inspeccion.svg` | NOM-006, 009, 029 |

Estructura de cada manual (plantilla de la guía de estilo §3): 1 Objetivo · 2 Roles · 3 Descripción + figura + mermaid · 4 Equipos · **5 Especificaciones, tolerancias y frecuencias** (+ 5.1 rutina preventiva/predictiva) · 6 Seguridad (LOTO y energía cero) · 7 Calidad · 8 Paso a paso con ★ y checklist de liberación · 9 Condiciones anormales · 10 Registros · 11 Competencia (TD-P07) · 12 Referencias · 13 Control de cambios.

## 2. Ventanas de paro usadas en el plan [Supuesto — validar con C-10 y C-13]

| Ventana | Descripción | Duración típica |
|---|---|---|
| **V0** | En operación, sin paro (rutas, predictivo, muestreo) | — |
| **V1** | Entre coladas (EAF) / entre secuencias (CC) / estación de ollas | 5–15 min (EAF) · 30–60 min (CC) |
| **V2** | Paro semanal programado por equipo (EAF-1 y EAF-2 alternados; CC1 y CC2 alternados) | EAF 8–12 h · CC 6–8 h |
| **V3** | Paro mensual extendido | 24 h |
| **V4** | Paro mayor anual por equipo | 7–10 días |
| **T** | Taller fuera de línea (moldes, segmentos, ollas, servos) | Según tarea |

## 3. Plan maestro de mantenimiento preventivo y predictivo

| Equipo | Tarea | Tipo | Frecuencia | Rol | Duración | Ventana | Manual |
|---|---|---|---|---|---|---|---|
| EAF paneles/bóveda | Inspección visual de fugas | Preventivo | Cada colada | S-02 / S-03 | 2 min | V1 | MM-EAF-01 |
| EAF paneles/bóveda | Tendencia ΔQ y T de salida | Predictivo | Diario | S-21 | 20 min | V0 | MM-EAF-01 |
| EAF paneles/bóveda | UT de espesores en zonas calientes | Predictivo | Semanal | S-19 | 2 h | V2 | MM-EAF-01 |
| EAF paneles/bóveda | Prueba de lógica ΔQ (2 % / 4 %) | Prueba | Trimestral | S-21 + C-12 | 2 h | V2 | MM-EAF-01 |
| EAF paneles/bóveda | Calibración FT, TT, PT | Calibración | Anual | S-21 | 1 turno | V4 | MM-EAF-01 |
| EAF brazos/HPU | Recorrido HPU | Preventivo | Diario | S-22 | 20 min | V0 | MM-EAF-02 |
| EAF brazos/HPU | Holgura de guías y lubricación de columnas | Preventivo | Semanal | S-19 / S-26 | 1.5 h | V2 | MM-EAF-02 |
| EAF brazos/HPU | Análisis de fluido HFC (ISO 4406, % agua) | Predictivo | Mensual | S-22 | 15 min | V0 | MM-EAF-02 |
| EAF brazos/HPU | Precarga de acumuladores | Preventivo | Mensual | S-22 | 1 h | V2 | MM-EAF-02 |
| EAF brazos/HPU | Termografía de brazos, zapatas y cables flexibles | Predictivo | Mensual | S-20 | 1 h | V0 | MM-EAF-02 |
| EAF brazos/HPU | Megger de aislamiento de brazos (≥ 1 MΩ) | Prueba | Trimestral | S-20 | 1 h | V2 | MM-EAF-02 |
| EAF brazos/HPU | Prueba de respuesta de regulación | Prueba | Trimestral | S-21 / S-22 | 2 h | V2 | MM-EAF-02 |
| EAF bóveda | Cambio de delta / bóveda | Correctivo programado | Por condición (delta 150–300 coladas) | S-19, S-04, S-24 | 4–8 h | V2 | MM-EAF-02 |
| EAF refractario | Termografía de coraza | Predictivo | Diario | S-24 / C-15 | 20 min | V0 | MM-EAF-03 |
| EAF refractario | Escaneo láser de perfil | Predictivo | Semanal | C-15 / S-24 | 30 min | V2 | MM-EAF-03 |
| EAF refractario | Gunning programado | Preventivo | Semanal | S-24 | 1–2 h | V2 | MM-EAF-03 |
| EAF EBT | Cambio de camisas del EBT | Preventivo | 150–250 coladas / Ø ≥ 230 mm | S-24, S-03, S-19 | 1.5–3 h | V2 | MM-EAF-03 |
| EAF EBT | Cambio de bloque de asiento | Preventivo | 400–600 coladas | S-24 | 4–6 h | V2 extendido | MM-EAF-03 |
| EAF refractario | Reline de bancos/solera | Mayor | Por campaña | S-24 + REPSE | 3–5 días | V4 | MM-EAF-03 |
| Transformador EAF | Recorrido y detector de fuga aceite–agua | Preventivo | Diario | S-20 | 20 min | V0 | MM-EAF-04 |
| Transformador EAF | DGA (laboratorio) + monitor en línea | Predictivo | Mensual / continuo | S-20 / laboratorio | 30 min | V0 | MM-EAF-04 |
| Transformador EAF | Fisicoquímicos de aceite (tanque y OLTC) | Predictivo | Trimestral | Laboratorio | — | V0 | MM-EAF-04 |
| Transformador EAF | Termografía MT y secundario | Predictivo | Mensual | S-20 | 1 h | V0 | MM-EAF-04 |
| Interruptor del horno | Mantenimiento por contador / semestral | Preventivo | Semestral | S-20 | 4 h | V3 | MM-EAF-04 |
| OLTC | Mantenimiento por número de operaciones | Preventivo | Intervalo OEM | S-20 + OEM | 1–2 turnos | V3 / V4 | MM-EAF-04 |
| Transformador EAF | Megger, PI, Tan δ, TTR, resistencia, boquillas | Prueba | Anual | S-20 + proveedor | 1–2 turnos | V4 | MM-EAF-04 |
| Protecciones | Inyección secundaria (87T, 50/51, 51N, 49) | Prueba | Anual | S-21 / proveedor | 4 h | V4 | MM-EAF-04 |
| Ollas | Inspección posvaciado + termoescáner | Preventivo / predictivo | Cada colada | S-08 | 10 min | V1 | MM-OLL-01 |
| Ollas | Cambio de placas y colectora | Preventivo | 2–5 coladas o por condición | S-24 / S-08 | 30–45 min | V1 (olla fuera de ciclo) | MM-OLL-01 |
| Ollas | Prueba de caudal de tapón | Prueba | Cada colada | S-06 / S-08 | 2 min | V1 | MM-OLL-01 |
| Ollas | Medición de espesor residual | Predictivo | Semanal por olla | S-24 / C-15 | 20 min | T | MM-OLL-01 |
| Ollas | Reparación intermedia de línea de escoria | Preventivo | ≈ 30–40 coladas | S-24 | 1–2 turnos | T | MM-OLL-01 |
| Ollas | Reline completo | Mayor | 60–80 coladas | S-24 + REPSE | 2–3 días + secado | T | MM-OLL-01 |
| Ollas | END de muñones | Prueba | Anual / tras golpe | Inspector nivel II | 2 h | T | MM-OLL-01 |
| CC moldes | Medición de conicidad CC1 en máquina | Predictivo | Cada paro de CC1 | S-25 | 30 min | V1 / V2 | MM-CC-01 |
| CC moldes | Cambio de molde CC1 | Preventivo | Por tonelaje / condición | S-19, S-25, S-21 | 3–4 h | V2 | MM-CC-01 |
| CC moldes | Cambio de tubo CC2 (por línea) | Preventivo | 400–700 coladas | S-19, S-25 | 45–60 min/línea | V1 (línea fuera) | MM-CC-01 |
| CC moldes | Medición completa, prueba de presión y TC en taller | Preventivo | Cada salida de máquina | S-25 | 2 h / 45 min | T | MM-CC-01 |
| CC segmentos | Corrida de gap checker | Predictivo | Cada paro programado CC1 | S-21, S-25 | 1–1.5 h | V2 | MM-CC-02 |
| CC segmentos | Prueba de boquillas en máquina | Prueba | Cada paro | S-19 / S-12 | 30 min | V2 | MM-CC-02 |
| CC segmentos | Alineación con plantilla de arco | Preventivo | Trimestral y tras cambio | S-25, S-19 | 4–8 h | V3 | MM-CC-02 |
| CC segmentos | Cambio de segmentos 0–3 | Preventivo | Por tonelaje / condición | S-19, S-25, S-22 | 2–3 h c/u | V2 | MM-CC-02 |
| CC segmentos | Reconstrucción en taller | Preventivo | Cada salida | S-25 | 2–3 turnos | T | MM-CC-02 |
| CC2 guías | Alineación de guías y enderezadores | Preventivo | Trimestral | S-25 | 4 h/línea | V3 | MM-CC-02 |
| CC agua | Recorrido casa de bombas | Preventivo | Cada turno | S-19 | 30 min | V0 | MM-CC-03 |
| CC agua | Arranque semanal de diésel D-1/D-2 (30 min) | Prueba | Semanal | S-19, S-20 | 1 h | V0 | MM-CC-03 |
| CC agua | Prueba de cambio a emergencia (≤ 15 s, Q ≥ 90 %) | Prueba ★ | Mensual | S-21, S-19, S-20, S-12 | 1–2 h | V2 (sin acero) | MM-CC-03 |
| CC agua | Prueba integral de apagón | Prueba ★ | Anual | C-12 + todos | 1 turno | V4 | MM-CC-03 |
| CC agua | Química del agua de molde | Predictivo | Diario / semanal | Aguas | — | V0 | MM-CC-03 |
| CC agua | Vibraciones y termografía de bombas | Predictivo | Mensual | C-14 / S-20 | 2 h | V0 | MM-CC-03 |
| CC hidráulica | Análisis de oscilación (frecuencia, carrera, juego lateral) | Predictivo | Mensual y tras cambio de molde | S-21 | 1 h/línea | V1 / V2 | MM-CC-04 |
| CC hidráulica | Aceite (ISO 4406, agua) y precargas | Predictivo | Mensual | S-22 | 1 h | V0 / V2 | MM-CC-04 |
| CC1 tapón | Juego y calibración del mecanismo de tapón | Preventivo | Cada distribuidor / semanal | S-21, S-19 | 30 min | V1 | MM-CC-04 |
| CC nivel | Calibración de sensor (CC1) / detector radiométrico (CC2) | Calibración | Quincenal–mensual / cada cambio | S-21 (+ ESR en CC2) | 30 min | V1 | MM-CC-04 |
| CC2 fuente Cs-137 | Obturador, señalización, tasa de dosis, prueba de fuga | Prueba regulatoria | Mensual / según licencia CNSNS | ESR | 1–2 h | V2 | MM-CC-04 |
| Grúas de colada | Checklist pre-uso | Preventivo | Diario | S-09 | 15 min | V0 | MM-GR-01 |
| Grúas de colada | Inspección frecuente (cables, frenos, límites, gancho) | Preventivo | Semanal | S-19, S-20 | 3–4 h | V2 (grúa) | MM-GR-01 |
| Grúas de colada | Medición de gancho y prueba de par de cada freno | Prueba ★ | Mensual | S-19, S-20 | 3 h | V2 (grúa) | MM-GR-01 |
| Grúas de colada | Calibración del limitador de carga | Calibración | Semestral | S-20 | 2 h | V3 (grúa) | MM-GR-01 |
| Grúas de colada | Inspección periódica + END | Prueba | Anual | Inspector + S-19 | 2–3 turnos | V4 (grúa) | MM-GR-01 |
| Grúas de colada | Prueba de carga 125 % | Prueba | Tras reparación mayor | C-11 + S-19, S-20 | 1 turno | V3 / V4 | MM-GR-01 |

**Regla del plan:** una tarea marcada "Prueba ★" vencida **bloquea** la operación del equipo (agua de emergencia de CC, frenos de grúa de colada) hasta que se ejecute. El planeador C-13 la programa con prioridad 1 en el CMMS.

## 4. Matriz de puntos de aislamiento (resumen)

| Equipo | Eléctrica | Hidráulica | Agua | Gases O₂/GN/Ar | Mecánica / gravedad | Radiación |
|---|---|---|---|---|---|---|
| EAF (paneles, brazos, refractario) | Interruptor + seccionador MT + tierras (S-20) | HPU + acumuladores 0 bar | V1/V2 por circuito + dren | Estación de lanzas/quemadores, purga N₂ | Perno de basculamiento, calzas de columnas, bóveda asegurada | — |
| Transformador EAF | Interruptor extraído, seccionador, cuchillas de tierra, tierras temporales en primario y secundario | — | Intercambiador aceite–agua | — | — | — |
| Ollas | Precalentador, volteador | Cilindro de válvula retirado; volteador | — | GN de precalentador; Ar del tapón | Olla en base / perno del volteador | — |
| CC moldes y segmentos | EMS, motores de rodillos | Oscilación, ancho, cilindros de apriete | Molde, secundaria, rodillos | Aire de atomización | Barra falsa bloqueada; molde/segmento sujeto | Obturador Cs-137 (CC2, ESR) |
| CC agua | CCM de bombas; baterías y selector del diésel | — | Succión/descarga; torre y XV-1 solo con máquina parada | — | — | — |
| Grúas de colada | Seccionador de rieles + interruptor principal + radio | Thrusters de freno | — | — | Bloque apoyado; grúa vecina bloqueada; resortes de freno | — |

**Prueba de energía cero (siempre):** intento de arranque local y remoto rechazado · detector de tensión probado antes y después · manómetros en 0 bar · gases O₂ 19.5–23.5 %, CO < 25 ppm y < 10 % LEL para entrar; 0 % LEL detectable (≤ 1 % de lectura del equipo) para trabajo en caliente; salir a CO 25 ppm o 10 % LEL, evacuar a CO 200 ppm o 20 % LEL (MS-ACE-05/06) · radiámetro < 2 × fondo con el obturador cerrado y el candado del ESR (C-16) (CC2, MS-ACE-07).

**Llave cautiva:** nunca sustituye al LOTO en mantenimiento; todo trabajo de esta serie es intervención en el equipo y exige LOTO completo con candado personal (MS-ACE-02 §6.4).

## 5. Competencia y certificación (TD-P07)
- Cada manual lista sus pasos ★ en la sección 11: son la lista de verificación del evaluador de TD-P07 (todos los ★ deben aprobarse; vigencia de 12 meses para alturas, espacios confinados, grúas/izaje, eléctrico NOM-029 y fuentes radiactivas, y de 24 meses como máximo para las demás tareas críticas (TD-P07); reevaluación tras incidente o cambio).
- El sistema de permisos no emite un permiso a quien no tenga la certificación vigente (TD-P07, integración LMS–permisos).
- Normas por rol: S-20 → **NOM-029** (autorización escrita del patrón para MT); S-23 → **NOM-027** + calificación ASME IX/AWS; S-24, S-08 y personal de reline → **NOM-033**; quien trabaje en grúas, bóveda y torres → **NOM-009**; S-21 POE y ESR → **NOM-012** + licencia CNSNS; S-09/S-04 → **NOM-006**; S-22 → **NOM-020** (acumuladores). Verificar con Jurídico Laboral / SSO.

## 6. Validaciones pendientes antes de usar en planta
1. Ingeniería de Mantenimiento / OEM: todos los valores marcados [Validar] (espesores, torques, presiones, fuerzas de resortes, tiempos internos de la lógica de agua, criterios de desgaste de placas y moldes, vida de refractarios).
2. Voltaje primario del transformador del EAF (aquí 34.5 kV [Supuesto]) y estudio de arc flash.
3. Ventanas de paro V1–V4 con C-10 y C-13.
4. Licencia CNSNS: periodicidad de pruebas de fuga y límites de tasa de dosis (ESR).
5. Programa NOM-006 de cada grúa y periodicidad de prueba de carga.

## 7. Revisión cruzada requerida
- **experto-operativo-metalurgia:** visto bueno técnico (coherencia con FT-ACE-001, variables de calidad).
- **experto-seguridad-salud:** visto bueno de seguridad (LOTO, NOMs, pasos ★).
- **experto-relaciones-laborales:** nuevas certificaciones para S-19 a S-26 (tocan escalafón y CMCAP).
- **experto-documentacion-mejora:** control documental y alta en el sistema de gestión.

## 8. Decisión requerida del Director
| Opción | Descripción | Costo / esfuerzo | Riesgo |
|---|---|---|---|
| A | Enviar los 10 manuales a validación OEM/Ingeniería de Mantenimiento y, en paralelo, diseñar la ruta de certificación TD-P07 de S-19 a S-26 | Alto esfuerzo de Academia de Mantenimiento; costo de validación externa por cotizar [Supuesto] | Bajo |
| B | Validar primero los 4 de mayor severidad (MM-CC-03, MM-GR-01, MM-EAF-01, MM-EAF-04) y el resto en una segunda ola | Menor esfuerzo inicial | Medio: seis manuales siguen en borrador |
| C | Mantener como material de capacitación sin uso en planta hasta que existan los manuales de operación MO | Mínimo | Alto: brecha de competencia en tareas críticas |

**Recomendación:** **B**, con fecha límite para decidir de 2 semanas, porque concentra la validación en los procesos que pueden causar fatalidades múltiples.
