# MS-ACE-03 — Prevención de explosiones por contacto agua–metal líquido

## Guía del instructor y contenido del curso

| Campo | Valor |
| --- | --- |
| Proceso | MS-ACE-03 — Prevención de explosiones por contacto agua–metal líquido |
| Área | Acería · EAF, ollas, LF, CC1, CC2 y patio de chatarra |
| Serie | Seguridad |
| Manual base | `04-seguridad/MS-ACE-03-explosiones-agua-metal-liquido.md` v0.2 (borrador para validación; revisión de seguridad con observaciones · 2026-09-25) |
| Audiencia | S-01 · S-02 · S-03 · S-04 · S-05 · S-07 · S-08 · S-10 · S-12 · S-13 · S-14 · S-24 · C-15 · C-17 |
| Presentación | MS-ACE-03_Capacitacion_AMMX.pptx (estándar AMMX) |
| Estado | Borrador para validación: no se usa en planta hasta validar los valores marcados |

## 1. Objetivo del curso

Nada húmedo, nada cerrado y nada frío toca el metal líquido

**Principio rector:** Nada húmedo, nada cerrado y nada frío toca el metal líquido.

**Por qué importa:** 1 L de agua atrapada bajo el acero se convierte en ≈ 1,700 L de vapor a 100 °C y en más de 8,000 L a la temperatura del acero. Si ese vapor queda confinado bajo el baño, en un recipiente o en una fosa, explota y proyecta metal líquido a decenas de metros.

## 2. Objetivos de aprendizaje

1. **Rechazar chatarra peligrosa.** Detectar recipientes cerrados, cilindros, agua, hielo y lodo; separar, abrir y escurrir antes de la canasta.
2. **Vigilar el agua del EAF.** Δ caudal ≤ 2 %, presión 4–6 bar y paneles ≤ 60 °C antes de energizar; responder a la alarma en ≤ 1 min.
3. **Asegurar ollas, fosas y útiles secos.** Olla 1,000–1,100 °C; fosas sin agua; herramientas y adiciones secas; ollas de escoria secas.
4. **Responder a una fuga.** Arco fuera, no bascular ni mover electrodos, evacuar a ≥ 25 m; reanudar solo con C-05 y C-07.

## 3. Plan de sesión

| Bloque | Min | Actividad | Recurso |
| --- | --- | --- | --- |
| 1. Apertura y por qué importa | 30 | Casos de explosiones agua–metal; reglas | Láminas 1–2 |
| 2. Roles y seis barreras | 45 | Mapa de fuentes de agua y sus barreras | Láminas 3–5 |
| 3. Árbol de fuga en el EAF | 60 | Lectura de la rama A y del panel enfriado | Láminas 6–7 |
| 4. Equipos y límites | 75 | Ejercicio: leer Δ caudal y ΔT en HMI | Láminas 8–9 |
| 5. Controles y EPP seco | 60 | Identificar prohibidos en fotos de chatarra | Láminas 10–11 |
| 6. Registros y paso a paso | 75 | Lectura guiada de los 11 pasos; pasos ★ | Láminas 12–14 |
| 7. Condiciones anormales | 75 | Simulacro de mesa: fuga de panel con Δ > 4 % | Lámina 15 |
| 8. Evaluación teórica | 45 | Autoevaluación de 5 preguntas + retroalimentación | Lámina 16 |
| 9. Cierre y ruta a OJT | 15 | Plan de OJT y certificación | Lámina 17 |

## 4. Contenido clave

### 4.1 Roles

| Rol | Qué hace contra el agua | RACI |
| --- | --- | --- |
| C-07 Ingeniero de Proceso / C-16 | Co-dueños: límites de humedad, reanudación tras fuga, auditoría | A |
| C-17 / S-05 Patio de Chatarra | Inspeccionan cada camión; rechazan húmedo, cerrado y prohibido | R |
| S-01 Púlpito de Horno | Vigila la alarma de fuga (Δ caudal) y corta el arco | R |
| S-02 / S-03 Horno de piso | Herramientas secas y precalentadas; buscan agua en el horno | R |
| S-08 / C-15 Ollas y refractarios | Ollas y refractarios secos y precalentados | R |
| S-10 Manejo de Escoria | Ollas de escoria secas; volteo en área seca | R |
| S-12 / S-13 / S-14 Colada | Vigilan ΔT y caudal de agua de molde; responden a fugas | R |
| C-08 Ingeniero de Proceso de CC | Criterio técnico en fugas de molde y secundaria | C |

### 4.2 Flujo del proceso

1. **Inspección patio:** Sin recipientes cerrados, agua ni hielo
2. **Canasta:** No gotea; C-17 libera
3. **Agua del EAF:** Δ ≤ 2 %, 4–6 bar, paneles ≤ 60 °C
4. **Vigilar fusión:** Alarma Δ > 2 %: respuesta ≤ 1 min
5. **Olla caliente:** 1,000–1,100 °C; fría > 4 h: ≥ 8 h
6. **Fosas y útiles:** Cero agua; herramientas secas
7. **Molde CC:** ΔT y caudal por línea en rango
8. **Registrar:** Rechazos, alarmas y acciones

### 4.3 Equipos

| Equipo | Función | Especificación clave | Verificar antes |
| --- | --- | --- | --- |
| Detección de fugas del EAF | Compara caudal de entrada y salida | Alarma Δ > 2 %; disparo Δ > 4 % | Enclavamiento mensual [Supuesto] |
| Termopares y presostato | Panel sin flujo; pérdida de presión | > 60 °C; 4–6 bar, alarma < 3 bar | Lecturas en HMI por turno |
| Precalentadores de olla | Secan y calientan el refractario | 1,000–1,100 °C; fría > 4 h: ≥ 8 h | Pirómetro de estación |
| Bandejas de secado | Quitan humedad a lanzas y útiles | ≥ 150 °C [Supuesto] | Termómetro de bandeja |
| Bodega techada de adiciones | Evita humedad en cal y aleaciones | Piso seco, techo sin goteras | Inspección semanal |
| Bombas de achique de fosas | Mantienen fosas sin agua | Arranque automático por nivel | Prueba por turno |
| Agua de molde y de emergencia | Evita molde seco o con fuga | Alarma ΔT/caudal; emergencia ≤ 15 s | HMI; prueba mensual |

### 4.4 Parámetros

| Parámetro | Normal | Alarma / límite | Acción |
| --- | --- | --- | --- |
| Δ caudal agua EAF | ≤ 2 % (objetivo < 1) | > 2 % alarma; > 4 % disparo | Reducir potencia / arco fuera |
| Salida de panel | ≤ 60 °C | > 60 °C | Revisar caudal; LOTO |
| Presión agua EAF | 4–6 bar | < 3 bar | Reducir potencia |
| Olla (cara caliente) | 1,000–1,100 °C | < 1,000 °C | No recibe acero |
| Olla fría > 4 h | ≥ 8 h precalentar | < 8 h | No usar |
| Humedad DRI/HBI | ≤ 1 % [Supuesto] | > 1 % o mojado | Detener el lote; C-07 |
| Agua en fosas | 0 cm | Cualquier agua | No vaciar; achique |
| ΔT molde CC1 / CC2 | 6–9 / 6–10 °C | > 11 / > 12 °C; Q < 90 % | Reducir velocidad |

> Herramientas y lanzas ≥ 150 °C [Supuesto]. Secado de refractario nuevo según curva [Validar con OEM]. Tras fuga con agua en el baño: nadie a < 25 m.

### 4.5 Seguridad: controles críticos

- ★ **Inspección y rechazo en patio:** Recipientes cerrados se cortan o perforan; chatarra con agua, hielo o lodo no entra; canasta que gotea no se carga.
- ★ **Detección de fugas del EAF:** Alarma Δ caudal > 2 % y disparo > 4 %. Con agua en el horno: arco fuera, no bascular, evacuar ≥ 25 m.
- ★ **Olla y útiles calientes y secos:** Olla ≥ 1,000 °C (fría > 4 h: ≥ 8 h); lanzas y herramientas secas y calientes; adiciones de bodega techada.
- ★ **Fosas secas y molde vigilado:** Cero agua bajo el vaciado y en el foso de escoria; ΔT y caudal de molde con agua de emergencia ≤ 15 s.

**EPP:** EPP de zona roja frente a metal líquido (MS-ACE-01) · El EPP también debe estar seco, incluidos los guantes · Guante mojado sobre metal caliente: quemadura por vapor · Ropa FR o 100 % algodón; prohibido lo sintético

### 4.6 Calidad

| Qué se controla | Criterio | Cómo y cuándo | Si falla |
| --- | --- | --- | --- |
| Rechazo de chatarra | Lote libre de prohibidos | Registro del patio, cada camión | Recipiente cerrado al horno |
| Alarmas de agua EAF y CC | Respuesta registrada | Historiador de proceso | Fuga sin respuesta |
| Precalentamiento de ollas | 1,000–1,100 °C | Registro de ollas, cada ciclo | Olla fuera de ciclo |
| Bitácora de fugas de panel | Reparación con LOTO | MM-EAF-01 | Fuga recurrente |
| Incidentes agua–metal | Análisis ICAM | Cada evento | Causa sin corregir |
| Hidrógeno en el acero | Bajo; sin humedad | LIMS si se requiere [Validar con C-09] | Pinholes y sopladuras |

### 4.7 Paso a paso

| # | Paso | Cómo hacerlo y qué medir | Criterio | ★ | Rol |
| --- | --- | --- | --- | --- | --- |
| 1 | Inspecciona cada camión | Desde la plataforma: recipientes cerrados, agua, hielo, lodo, cilindros; pórtico de radiación sin alarma | Lote libre de prohibidos | ★ | S-05 |
| 2 | Separa y abre recipientes | Todo tubo o recipiente cerrado se aparta, se corta o perfora y se escurre | Ningún cerrado en canasta | ★ | S-05, C-17 |
| 3 | Revisa la canasta | Si gotea agua, espera y escurre; C-17 libera | Sin goteo visible | ★ | S-04, C-17 |
| 4 | Verifica agua del EAF | HMI: Δ caudal ≤ 2 %, presión 4–6 bar, paneles ≤ 60 °C; por la puerta: sin agua ni vapor | Todo en rango | ★ | S-01, S-02 |
| 5 | Vigila fuga en la fusión | Alarma Δ > 2 %: reduce potencia; busca vapor, llama amarilla o chisporroteo | Respuesta ≤ 1 min | ★ | S-01 |
| 6 | Precalienta la olla | 1,000–1,100 °C en cara caliente; si estuvo > 4 h fuera, ≥ 8 h de precalentamiento | Registro en rango | ★ | S-08 |
| 7 | Revisa pisos y fosas | Foso de vaciado, pista del carro y foso de escoria sin agua; bombas de achique probadas | Cero agua estancada | ★ | S-03, S-10 |
| 8 | Prepara útiles y adiciones | Lanzas, cucharas y barras en bandeja de secado; adiciones de bodega techada; alambre seco | Secas y calientes | ★ | S-02, S-07 |
| 9 | Revisa ollas de escoria | Secas, sin agua de lluvia; si tienen agua, se voltean y secan antes de usar | Olla seca | ★ | S-10 |
| 10 | Vigila agua de molde | ΔT y caudal por línea en HMI; en alarma reduce velocidad y sigue condiciones anormales | Parámetros en rango | ★ | S-12 |
| 11 | Registra | Anota rechazos de chatarra, alarmas de fuga y acciones | Registro completo |  | S-05/S-01/S-12 |

### 4.8 Condiciones anormales

| Síntoma | Acción inmediata | Avisar a |
| --- | --- | --- |
| Δ > 4 %, vapor o llama amarilla | Arco fuera; NO bascules ni muevas electrodos; evacúa a ≥ 25 m | C-05, C-07, C-04 |
| Agua visible sobre el baño | Igual; nadie frente a puerta ni EBT; reanuda solo C-05 + C-07 | C-04, C-16 |
| Explosión al cargar canasta | Evacúa; atiende lesionados; retén el lote para investigar | C-04, C-17, C-16 |
| Olla húmeda o mal precalentada | Olla fuera de ciclo | C-15, C-05 |
| ΔT de molde alto o Q < 90 % | Reduce velocidad; si no se recupera en ≤ 1 min, cierra la línea | C-06, C-08 |
| Agua en la fosa de vaciado | No vacíes; achique; seca con absorbente seco | C-05 |

## 5. Evaluación

### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)

1. ¿Cuántos litros de vapor genera 1 L de agua a 100 °C?
   a) ≈ 17 L
   b) ≈ 170 L
   c) ≈ 1,700 L

2. El Δ caudal del EAF pasa de 4 % y ves vapor. ¿Qué NO debes hacer?
   a) Cortar el arco
   b) Bascular el horno
   c) Evacuar a ≥ 25 m

3. Una olla estuvo 6 h fuera de ciclo. ¿Cuánto precalentamiento necesita?
   a) ≥ 2 h
   b) ≥ 4 h
   c) ≥ 8 h

4. La canasta gotea agua al levantarla. ¿Qué haces?
   a) Cargo rápido
   b) Espero, escurro y C-17 libera
   c) Cargo solo la mitad

5. Hay agua estancada en la fosa bajo el vaciado. ¿Qué haces?
   a) Vacío con cuidado
   b) No vacío; achique y secado
   c) Echo arena y vacío

**Clave de respuestas:**

1. c) ≈ 1,700 L — ≈ 1,700 L a 100 °C y más de 8,000 L a la temperatura del acero. Confinado, explota.
2. b) Bascular el horno — Bascular mezcla el agua con el baño y provoca la explosión. Arco fuera, no bascular, alejarse.
3. c) ≥ 8 h — Fuera de ciclo > 4 h: ≥ 8 h de precalentamiento y cara caliente ≥ 1,000 °C.
4. b) Espero, escurro y C-17 libera — Chatarra con agua sobre el talón líquido puede explotar. No se carga canasta que gotea.
5. b) No vacío; achique y secado — Cualquier agua en fosas detiene el vaciado: achique y secado con absorbente seco.

### 5.2 Evaluación práctica de competencia (TD-P07)

Nivel requerido: **U** (escala ILUO).

| Rol | ILUO | Teoría | OJT supervisado | Vigencia |
| --- | --- | --- | --- | --- |
| S-05, C-17 Patio | U | 8 h | 40 h + 30 camiones | 24 meses |
| S-01 Púlpito de Horno | O | 8 h | 20 coladas + simulador | 24 meses |
| S-02, S-03, S-07, S-10 | U | 6 h | 20 h | 24 meses |
| S-08, S-24, C-15 Ollas | U | 6 h | 10 ollas | 24 meses |
| S-12, S-13, S-14 Colada | U | 6 h | 10 coladas | 24 meses |
| S-04 Canasta | U | 4 h | 10 canastas | 24 meses |

Lista de verificación de pasos ★ (todos deben demostrarse correctamente):

- [ ] Reconoce y rechaza recipientes cerrados y chatarra con agua; no carga canasta que gotea
- [ ] Verifica Δ caudal, presión y temperatura de paneles del EAF antes de energizar
- [ ] Atiende la alarma Δ > 2 % en ≤ 1 min y explica por qué no se bascula con agua
- [ ] Confirma olla ≥ 1,000 °C y herramientas y adiciones secas y calientes
- [ ] Revisa fosas, pisos y ollas de escoria sin agua antes del vaciado
- [ ] Vigila ΔT y caudal de molde; reduce velocidad o cierra la línea en alarma

Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).

## 6. Reglas que no se negocian

- **Nada húmedo, cerrado o frío al metal.** Olla ≥ 1,000 °C; útiles secos y calientes; recipientes abiertos.
- **Con agua en el horno no se bascula.** Arco fuera, no mover electrodos, evacuar a ≥ 25 m del horno.
- **Canasta que gotea no se carga.** Escurrir y esperar la liberación de C-17.
- **Agua en la fosa = no se vacía.** Achique y secado antes de cualquier vaciado.

## 7. Por confirmar

- Humedad del DRI/HBI ≤ 1 % y temperatura de herramientas ≥ 150 °C (supuestos)
- Tiempo de espera sin vapor ≥ 30 min tras fuga (supuesto)
- Frecuencia de prueba del enclavamiento de fugas y curva de secado de refractario con OEM

## 8. Validación

| Revisión | Responsable | Estado |
| --- | --- | --- |
| Técnica (operación, metalurgia y control de proceso) | experto-operativo-metalurgia | visto bueno — 2026-09-26 |
| Seguridad | experto-seguridad-salud | visto bueno — 2026-09-26 |
| Laboral (roles, certificación, escalafón) | experto-relaciones-laborales | visto bueno — 2026-09-26 |
| Diseño instruccional y formato | experto-documentacion-mejora | visto bueno — 2026-09-26 |
| Aprobación | Director de C&D | Pendiente |

