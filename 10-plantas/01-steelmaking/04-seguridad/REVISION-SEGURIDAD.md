# Revisión cruzada de seguridad de los manuales de la Acería

| Código | Versión | Estado | Revisó | Referencias | Fecha |
|---|---|---|---|---|---|
| RS-ACE-001 | 1.0 | Para decisión del Director | experto-seguridad-salud | FT-ACE-001 v0.3 · CAT-ACE-001 · Guía de estilo · `02-research/regulatory-framework-mexico.md` · `02-operacion/REVISION-TECNICA.md` | 2026-09-25 |

**Mensaje clave:** revisé los 49 manuales de la Acería: 29 de operación (MO), 10 de mantenimiento (MM) y 10 de seguridad (MS). **Doy visto bueno de seguridad a los 49**: 45 con observaciones, ya corregidas en el texto, y 4 sin observaciones (MO-CC1-02, MO-CC1-06, MO-CC1-09 y MO-CC2-09). Los criterios de LEL, gases, vigencias, llave cautiva, zonas de exclusión, agua–metal y radiación quedaron iguales en todos los manuales. **Los manuales no se usan en planta** hasta que se validen los valores marcados [Supuesto] y [Validar] y el Director decida los 5 puntos de la última sección. **No marqué "Aprobó".**

Alcance de edición: en MM y MS, todo el archivo. En MO, solo la sección 6, las filas ★ de seguridad de la sección 8, las filas de seguridad de la sección 9, la sección 11 y la celda "Revisión de seguridad" del encabezado. No toqué valores de proceso.

## 1. Criterios unificados (válidos para todos los manuales)

| # | Tema | Criterio único | Documento rector |
|---|---|---|---|
| 1 | LEL en espacios confinados | Se puede **entrar** con **< 10 % LEL**. El **trabajo en caliente** solo se permite con **0 % LEL detectable (≤ 1 % de lectura del equipo)** y monitoreo continuo. Se sale a ≥ 10 % LEL y se **evacúa el sector a ≥ 20 % LEL**. Ningún manual exige 0 % LEL para entrar | MS-ACE-05 §5 |
| 2 | Vigencia de certificaciones | **12 meses** para alturas, espacios confinados, grúas/izaje (incluye señaleros y planeación de izajes), eléctrico (NOM-029) y fuentes radiactivas. **24 meses como máximo** para las demás tareas críticas (TD-P07). Si un rol combina ambas, cada componente conserva su vigencia (p. ej., "24 meses (TD-P07); espacio confinado 12 meses") | Sección 11 de cada manual |
| 3 | Gases | **CO:** 25 ppm = alarma, salir; 200 ppm = evacuación del sector [Verificar NOM-010]. **O₂:** salir si está fuera de 19.5–23.5 %. **Gas natural:** 10 % LEL = alarma, salir y cortar el gas; 20 % LEL = evacuación del sector y corte general | MS-ACE-06 §5.1 |
| 4 | Llave cautiva o LOTO | La **llave cautiva** alcanza solo para el **acceso de rutina** a una zona con enclavamiento validado, si se cumplen 5 condiciones: sistema probado cada mes; tarea en la lista de rutina (EBT, electrodos por método A, inspección visual de plataformas); una llave por persona; confirmación en la HMI; ningún circuito abierto ni entrada al recipiente. El **LOTO completo** es obligatorio para toda **intervención en el equipo**, para entrar a la bóveda, bajo el horno o a la fosa, en el método B de electrodos, si el sistema de llaves está en falla o vencido y en todo trabajo de mantenimiento | MS-ACE-02 §6.4 (nueva) |
| 5 | Zonas de exclusión | Roja/amarilla: vaciado ≤ 10 / 10–25 m; carga de canasta ≤ 15 / 15–30 m; muestreo ≤ 5 / 5–15 m; ruta de olla ± 5 / ± 15 m; arranque de CC ≤ 10 / 10–20 m (solo S-12, S-13, S-14 y C-06); colada estable ≤ 3 m del molde; volteo de escoria ≤ 15 m; carga suspendida: ± 5 m de su proyección. Llegar a un refugio en ≤ 30 s; aviso ≥ 30 s antes | MS-ACE-01 §5, MS-ACE-04 |
| 6 | Agua–metal y humedad | Ante fuga con agua en el baño, **nadie a menos de 25 m** del horno; no se bascula ni se mueven los electrodos; se espera sin vapor visible ≥ 30 min [Supuesto] y se reanuda solo con autorización de C-05 y C-07. Olla a ≥ 1,000 °C (fría > 4 h: ≥ 8 h). Canasta que gotea: no se carga. Fosas sin agua. Herramientas y adiciones secas. Perforación de olla: evacuar a ≥ 25 m | MS-ACE-03, MS-ACE-09 |
| 7 | Radiación en CC2 | El **ESR (C-16)** cierra el obturador, pone su candado y tarjeta y mide **< 2 × fondo** en el punto de trabajo. Si la lectura es ≥ 2 × fondo: no se trabaja, nadie a menos de 3 m y se delimita. Al terminar, solo el ESR abre el obturador y verifica la señal de nivel. Se retiraron las variantes "= fondo" y "≤ fondo" | MS-ACE-07, MS-ACE-02 paso 9e |
| 8 | Pasos ★ | Todo control crítico está marcado ★ y cada paso ★ aparece en la sección 11, en la columna de evaluación o en la lista de verificación. Se verificó con un script en los 49 manuales: no falta ninguno | Guía de estilo §1 |

## 2. Resultado por manual

### 2.1 Seguridad (04-seguridad)

| Manual | Hallazgos | Corrección | Pendiente |
|---|---|---|---|
| MS-ACE-01 Metal líquido | Faltaban en la lista de verificación los pasos ★ 1, 2, 5, 10 y 11 | Lista ampliada; distancias adoptadas como criterio único; versión 0.2 | Estudio de zonas de la nave (C-16) |
| MS-ACE-02 LOTO | No definía cuándo alcanza la llave cautiva; el ESR no tenía código; la tabla de atmósfera no distinguía la entrada del trabajo en caliente | **Nueva §6.4 llave cautiva frente a LOTO**; C-16 como ESR; criterio de LEL; nuevo rol "usuario de llave cautiva"; pasos 5 y 9e en la lista | Validar con OEM/C-12 qué movimientos inhibe cada sistema de llaves (EAF y LF) |
| MS-ACE-03 Agua–metal | "Evacúa ≤ 25 m" era ambiguo; faltaban los pasos ★ 3, 5, 9 y 10 | "A ≥ 25 m"; lista completa; S-04 en la sección 11 | Tiempo de espera ≥ 30 min [Supuesto] |
| MS-ACE-04 Izaje | Señaleros y planeación de izajes a 24 meses; sin fila para el operador de grúa de CC; no se sabía si los 250 t incluyen la traviesa | 12 meses; fila del operador de grúa de CC y producto; nota sobre la traviesa; pasos 4, 6 y 9 en la lista | Peso de la traviesa (OEM); rol S-27 |
| MS-ACE-05 Confinados | Pedía "0 % sostenido" para trabajo en caliente sin tolerancia del equipo; no tenía fila de 20 % LEL; el emisor estaba a 24 meses; "S-05" se confundía con el rol de patio | Criterio único de LEL (recuadro); filas de ≥ 20 % LEL y > 1 % en caliente; emisor a 12 meses; S-03 como entrante; aclaración del programa S-05 Brigadas | Confirmar que el detector resuelve ≤ 1 % LEL (OEM) |
| MS-ACE-06 Gases | El reingreso exigía "0 % LEL"; faltaba "[Verificar NOM-010]" en 200 ppm; faltaban los pasos ★ 4 y 9 en la lista | Reingreso con < 10 % LEL (≤ 1 % si hay trabajo en caliente); nota NOM-010; lista completa | Decisión sobre CO 200 o 50 ppm (D-2) |
| MS-ACE-07 Radiactivas | El ESR no tenía código; S-13 no aparecía (catálogo); faltaban los pasos ★ 1, 5, 6, 9 y 10 | C-16 = ESR; S-13 agregado; fila C-06/C-11 (paso 1); vigencias de 12 meses; lista completa | Suplente del ESR con licencia; restricción de dosis |
| MS-ACE-08 Estrés térmico | Faltaban los pasos ★ 1, 3, 6 y 7 en la lista | Lista completa | Mediciones WBGT por puesto |
| MS-ACE-09 Emergencias | "Evacuación ≤ 25 m"; umbrales de gas incompletos; faltaban los pasos ★ 4, 7, 8 y 9 | "A ≥ 25 m"; umbrales individual y de sector; lista completa | Frecuencia de simulacros (NOM-002) |
| MS-ACE-10 Altura | Emisor y armador de andamios a 24 meses; exigía LOTO del horno sin considerar la llave cautiva | 12 meses; criterio de llave cautiva frente a LOTO; pasos 1, 2 y 10 en la lista | — |
| README 04-seguridad | Valores de LEL, 25 m y vigencias desalineados | Reglas 4, 5, 7, 8 y 10 y tabla de valores actualizadas | — |

### 2.2 Mantenimiento (03-mantenimiento)

| Manual | Hallazgos | Corrección | Pendiente |
|---|---|---|---|
| MM-EAF-01 Fugas de paneles | **Pedía LEL 0 % para entrar**; evacuaba "la plataforma" con espera de 10 min; el paso 5 (permisos) no tenía ★; S-20 y S-04 sin certificación | Criterio de MS-ACE-05 en E3 y en el paso 7 (≤ 1 % para soldar); ≥ 25 m y ≥ 30 min; paso 5 con ★; filas de S-20, S-04 y C-11 a 12 meses; lista completa | WPS y tiempo de espera [Validar] |
| MM-EAF-02 Brazos y bóveda | S-20 y S-04 a 24 meses; sin criterio de LEL para trabajo en caliente | 12 meses; LEL ≤ 1 % para trabajo en caliente; aclara que la llave cautiva no aplica; zona de ± 5 m; lista completa | — |
| MM-EAF-03 Refractario EAF | **Pedía LEL 0 % para entrar**; el gunning (paso 12) no tenía ★; faltaban S-20 y S-04 | Criterio de MS-ACE-05; paso 12 con ★; evacuación a ≥ 25 m; filas a 12 meses; lista completa | Temperatura del aire ≤ 45 °C [Validar] |
| MM-EAF-04 Transformador | Todo el trabajo eléctrico estaba a 24 meses; el retiro de tierras para pruebas (paso 11) y la energización (paso 15) no tenían ★ | 12 meses (NOM-029); pasos 11 y 15 con ★ (reponer tierras, conteo de personal); gases del tanque; lista completa | Tensión de MT y estudio de arco (C-12) |
| MM-GR-01 Grúas de colada | S-26 no aparecía en la sección 11 (catálogo); la vigencia de altura decía "12–24" | Fila de S-26; 12 meses para grúas, eléctrico y altura; lista completa | END e inspector externo REPSE |
| MM-OLL-01 Ollas | **Pedía LEL 0 % para entrar**; O₂ "≥ 19.5 %" sin límite superior; el paso 2 no tenía candado personal ni prueba de energía cero | Criterio de MS-ACE-05; O₂ 19.5–23.5 %; paso 2 completo; zona y evacuación según MS-ACE-01/09; S-09 a 12 meses; lista completa | — |
| MM-CC-01 Moldes | ESR sin código y criterio "≤ fondo"; S-20, S-22 y el operador de grúa no aparecían (catálogo); los pasos 2 y 6 no tenían ★ | C-16 (ESR) y < 2 × fondo; roles y filas agregados; pasos 2 y 6 con ★; lista completa | — |
| MM-CC-02 Segmentos | Sin criterio de atmósfera en la cámara de rociado; el paso 2 no tenía ★; faltaban S-20, S-26 y el operador de grúa | Criterio de MS-ACE-05; paso 2 con ★; filas agregadas; lista completa | — |
| MM-CC-03 Agua de CC | S-20 a 24 meses; CO sin umbral de evacuación | 12 meses; CO 25/200 ppm; gases en tanques; paso 4 con verificación de personal; lista completa | — |
| MM-CC-04 Hidráulica y Cs-137 | **Criterio "= fondo" distinto al de MO-CC2 y MS-ACE-07**; ESR sin código; O₂ "≥ 19.5 %" | < 2 × fondo (en el diagrama, §5, §6 y §8); C-16 = ESR; O₂ 19.5–23.5 %; paso 1 con ★; vigencias de 12 meses para radiación y eléctrico; lista completa | Límite de la licencia CNSNS |
| README 03-mantenimiento | "LEL 0 %" y "radiámetro = fondo" en la prueba de energía cero; vigencia "≤ 24 meses" para todo; figuras sin ruta `../img/`; ejecutores anteriores al catálogo | Criterios unificados; nota de llave cautiva; vigencias; rutas `../img/`; ejecutores del catálogo | — |

**Rutas de imagen (punto 9):** los 10 MM, los 10 MS y los 2 README usan `../img/`, y las 11 figuras citadas existen en `img/`.

### 2.3 Operación (02-operacion)

| Manual | Hallazgos | Corrección (§6, filas ★ de §8, §9, §11) | Pendiente |
|---|---|---|---|
| MO-EAF-01 | Esquema de llave cautiva "[Validar con Seguridad]" con regla de > 15 min; CO "[Validar]"; evacuación de la plataforma | Remite a MS-ACE-02 §6.4 (una llave por persona, confirmación de S-01); CO 25/200; ≥ 25 m y ≥ 30 min; lista ★ ampliada | — |
| MO-EAF-02 | "OSR" en §6 (**S-1**); zona de carga sin distancias; canasta que gotea; el paso 1 (pórtico) no tenía ★; S-04 a 24 meses | ESR (C-16); ≤ 15 / 15–30 m; criterios de MS-ACE-03; segunda pasada y 10 m; paso 1 con ★; S-04, S-05 y C-17 a 12 meses | Umbral del pórtico (ESR) |
| MO-EAF-03 | Control de 35 kg/min/MW contra 5.0 t/min de DRI caliente (**S-2**); O₂ "≥ 19.5 %" en galerías | 35 kg/min/MW se queda como límite; más solo con DRI caliente validado y gestión del cambio de C-16; gases completos; ≥ 25 m | **Decisión D-1** |
| MO-EAF-04 | "LOTO / llave cautiva" y "toda entrada = LOTO" se contradecían | Criterio de §6.4; el paso 3 confirma llaves y plataformas vacías; ≥ 25 m | — |
| MO-EAF-05 | Zona de desescoriado sin distancia; detector solo de CO | ≤ 5 m de la puerta y ≤ 15 m del volteo; multigás; olla de escoria seca con ★ | — |
| MO-EAF-06 | Zona de la puerta sin distancia | ≤ 5 / 5–15 m; ≥ 1.5 m y ≤ 2 min en medición manual | — |
| MO-EAF-07 | Zona de vaciado sin distancia; evacuación sin radio; S-09 a 24 meses | ≤ 10 / 10–25 m, sirena ≥ 30 s; humedad; ≥ 25 m; S-09 a 12 meses | — |
| MO-EAF-08 | "LOTO o llaves cautivas" sin criterio | Método A: llave cautiva. Método B: LOTO completo y altura. Conteo de llaves = personas. S-04 a 12 meses y altura a 12 meses | **Validar con OEM que el sistema de llaves solo permita abrir la mordaza con la columna sujeta por la grúa** |
| MO-LF-01 | LOTO con "tablero de llaves" sin criterio; O₂ solo < 19.5 %; evacuación sin radio | Criterio de §6.4; gases completos; ≤ 5 m en la ventana; ≥ 25 m | — |
| MO-OLL-01 | Nuevo orden precalentamiento → arena sin visto bueno (**S-6**); entrada a olla solo con O₂; S-09 a 24 meses | **Visto bueno a la secuencia**, con control ★ de exposición térmica en el paso 11 (posición protegida, embudo, ≤ 2 min); gases; volteo ≤ 15 m; S-09 a 12 meses | Tipo de precalentador y dispositivo de llenado |
| MO-OLL-02 | Margen "[Validar con Seguridad]"; no se sabe si los 250 t incluyen la traviesa (**S-5**); S-09 y S-13 a 24 meses | ± 5 / ± 15 m; fila ★ de sobrecarga; paso 7 con nota; 12 meses | **No se certifica el paso 7 hasta que el OEM confirme la traviesa (D-5)** |
| MO-CC1-01 | Entrada al distribuidor solo con O₂; "evacúa 15 m" por gas; grúa a 24 meses | O₂ → LEL → CO; 10/20 % LEL; ± 5 m; S-15 (confinado e izaje) y grúa a 12 meses | — |
| MO-CC1-02 | — | **Sin observaciones** | — |
| MO-CC1-03 | Zona roja sin distancias | ≤ 10 / 10–20 m, solo S-12, S-13, S-14 y C-06; multigás | — |
| MO-CC1-04 | No incluía la zona de colada estable de MS-ACE-01 | ≤ 3 m del molde; multigás | — |
| MO-CC1-05 | Evacuación por fuga de olla sin radio; S-09 a 24 meses | ≥ 25 m; ± 5 m; 12 meses | — |
| MO-CC1-06 | — | **Sin observaciones** | — |
| MO-CC1-07 | La zona de exclusión (paso 9) aparecía después del cierre (**S-4**) | Zona continua desde MO-CC1-04; paso 9 = reconfirmación; paso 3 en la lista | — |
| MO-CC1-08 | "50 t para > 17 t" (**S-3**); S-17 y grúa a 24 meses | 45 t con tenaza para todo planchón (25 t y 50 t no); ± 5 m; 12 meses | Peso de la tenaza ≤ 12 t (OEM) |
| MO-CC1-09 | — | **Sin observaciones** | — |
| MO-CC2-01 | Controles de §6.1 sin ★; entrada sin gases; no había fila de grúa | ★ en los controles; gases; 10/20 % LEL; fila de grúa a 12 meses | — |
| MO-CC2-02 | Tasa de dosis sin criterio; protección radiológica "según licencia" | < 2 × fondo, C-16; ≥ 3 m; POE a 12 meses | — |
| MO-CC2-03 | "Radio de 10 m [Validar]" | Criterio de MS-ACE-01 (≤ 10 / 10–20 m, sirena ≥ 30 s) | Estudio de la nave |
| MO-CC2-04 | ESR genérico; sin zona de colada estable | C-16 < 2 × fondo; ≤ 3 m | — |
| MO-CC2-05 | Evacuación sin radio; S-09 a 24 meses | ≥ 25 m; ± 5 m; 12 meses | — |
| MO-CC2-06 | ESR genérico | C-16, candado, < 2 × fondo | Zona de expulsión de 3 m [Validar] |
| MO-CC2-07 | ESR sin criterio; caja de escoria sin distancia | C-16 < 2 × fondo, ≥ 3 m; ≤ 15 m; S-14 radiológica a 12 meses; pasos 12 y 16 en la lista | — |
| MO-CC2-08 | S-17 (grúa) a 24 meses | ± 5 m; 12 meses | T máxima del electroimán |
| MO-CC2-09 | — | **Sin observaciones** | — |

**Observaciones S-1 a S-7 de `REVISION-TECNICA.md`:** S-1, S-3, S-4 y S-6 quedan cerradas. S-2 y S-5 quedan cerradas en el texto, con decisión o validación pendiente (D-1, D-5). S-7 (figuras SVG) está fuera de mi alcance y la atiende el coordinador.

**Fuera de mi alcance (lo señalo para Documentación y Mejora):** la sección 13 de los manuales MO no registra esta revisión; el README de `02-operacion/eaf/` (renglón de llave cautiva) debe remitirse a MS-ACE-02 §6.4.

## 3. Decisión requerida del Director

| # | Tema | Opción A (recomendada) | Opción B | Opción C | Riesgo principal | Costo [Supuesto] | Fecha límite |
|---|---|---|---|---|---|---|---|
| D-1 | Consigna de DRI caliente (S-2) | Mantener **35 kg/min/MW** como límite de seguridad hasta que C-07 valide el DRI caliente y C-16 apruebe un análisis de riesgo (gestión del cambio) | Autorizar desde ya 42 kg/min/MW (5.0 t/min) con DRI caliente | Bajar el límite a 30 kg/min/MW | B: "iceberg" y ebullición violenta frente a la puerta | A: sin costo; posible pérdida de productividad con DRI caliente | 2026-10-09 |
| D-2 | Evacuación por CO | **200 ppm** (techo NIOSH) [Verificar NOM-010] y 25 ppm para salir | Evacuar el sector a 50 ppm | — | B: más evacuaciones y paros | A: sin costo | 2026-10-15 |
| D-3 | Llave cautiva (MS-ACE-02 §6.4) | Aprobar el criterio y pedir a C-12 validar cada sistema de llaves (EAF-1/2, LF-1/2) con prueba mensual registrada, antes de certificar | Usar LOTO completo para todo acceso a plataformas | Mantener la práctica actual sin criterio | C: energización con personas en la plataforma | A: ≈ 16 h de C-12 por horno y prueba mensual; B: ≈ +10–15 min por colada | 2026-10-15 |
| D-4 | Vigencia de 12 meses | Aplicar ya **12 meses** a alturas, confinados, grúas/izaje, eléctrico y radiación (ya está en los manuales) | Transición: 24 meses para las certificaciones vigentes y 12 para las nuevas | 24 meses para todo | C: competencia degradada en tareas que pueden ser fatales | A: ≈ el doble de recertificaciones de esas poblaciones; confirmar horas CMCAP con Relaciones Laborales | 2026-10-31 |
| D-5 | Traviesa de la grúa de 250 t (S-5) | Pedir al OEM el peso de la traviesa y la tara de cada olla; **no certificar el paso ★ 7 de MO-OLL-02** hasta tenerlo | Certificar con 240 t y corregir después | — | B: izaje de metal líquido sin margen real | A: consulta al OEM | 2026-10-09 |

**Recomendación:** opción A en los cinco puntos. En paralelo, usar los manuales solo para capacitación teórica hasta que se validen los [Supuesto] (estudio de zonas de la nave, sistema de llaves, detector ≤ 1 % LEL, licencia CNSNS y NOM citadas).

## 4. Revisión cruzada requerida
- **Relaciones Laborales:** vigencias de 12 meses (horas de recertificación del personal sindicalizado, CMCAP y DC-3) y rol S-27.
- **Documentación y Mejora:** control de versiones de los MO (sección 13) y de las figuras SVG (S-7).
- **Jurídico / SSO:** NOM-010 (CO), NOM-033, NOM-029, NOM-012 y licencia CNSNS. Verificar con Jurídico Laboral / SSO.
- **C-12 y OEM:** sistema de llaves cautivas, peso de la traviesa y de la tenaza.

## 5. Cierre
**Resumen:**
1. Visto bueno de seguridad a los 49 manuales: 45 con observaciones corregidas y 4 sin observaciones. "Aprobó" queda pendiente.
2. Un solo criterio de LEL: < 10 % para entrar, ≤ 1 % de lectura para trabajo en caliente y evacuación a ≥ 20 %. Se corrigieron MM-EAF-01, MM-EAF-03 y MM-OLL-01.
3. La nueva MS-ACE-02 §6.4 separa la llave cautiva (acceso de rutina) del LOTO completo (intervención). MO-EAF-01/04/08 y MO-LF-01 quedaron alineados.
4. Vigencias de 12 y 24 meses, umbrales de gases, zonas de exclusión, agua–metal y el criterio del ESR (C-16) con < 2 × fondo quedaron iguales en todos los manuales.
5. Quedan 5 decisiones del Director (D-1 a D-5) y las validaciones de OEM, CNSNS y NOM.

**Archivos modificados:** los 49 manuales (MO: solo las secciones permitidas y el encabezado), `03-mantenimiento/README.md` y `04-seguridad/README.md`. **Archivo creado:** este documento.
