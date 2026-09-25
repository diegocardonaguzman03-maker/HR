# Catálogo de Procesos Críticos y Roles — Steelmaking (Acería)

| Código | Versión | Estado | Custodios |
|---|---|---|---|
| CAT-ACE-001 | 0.1 | Borrador para validación | Experto Operativo y Metalurgia (procesos) · Gerente Sindicalizado / Gerente de Confianza (roles) |

Este catálogo fija los **códigos** que usan todos los documentos de la Acería: descripciones de puesto, manuales, matriz rol–proceso y capacitación. No se crean procesos ni roles nuevos sin añadirlos aquí.

## 1. Roles de la Acería

### 1.1 Personal de confianza (C)
| Código | Rol | Área |
|---|---|---|
| C-01 | Gerente de Acería | Acería |
| C-02 | Superintendente de Hornos (EAF y Metalurgia Secundaria) | Hornos |
| C-03 | Superintendente de Colada Continua (CC1 y CC2) | Colada |
| C-04 | Jefe de Turno de Acería | Acería (4 cuadrillas) |
| C-05 | Supervisor de Hornos (EAF / LF) | Hornos |
| C-06 | Supervisor de Colada Continua (CC1 o CC2) | Colada |
| C-07 | Ingeniero de Proceso EAF / LF | Hornos |
| C-08 | Ingeniero de Proceso de Colada Continua | Colada |
| C-09 | Metalurgista de Producto / Ingeniero de Calidad de Acería | Calidad |
| C-10 | Superintendente de Mantenimiento de Acería | Mantenimiento |
| C-11 | Supervisor de Mantenimiento Mecánico | Mantenimiento |
| C-12 | Supervisor de Mantenimiento Eléctrico e Instrumentación | Mantenimiento |
| C-13 | Planeador / Programador de Mantenimiento | Mantenimiento |
| C-14 | Ingeniero de Confiabilidad | Mantenimiento |
| C-15 | Especialista de Refractarios | Hornos / Ollas |
| C-16 | Especialista de Seguridad e Higiene de Acería | Seguridad |
| C-17 | Supervisor de Patio de Chatarra y Materiales | Hornos |

### 1.2 Personal sindicalizado (S)
| Código | Rol | Área |
|---|---|---|
| S-01 | Operador de Púlpito de Horno (Primer Hornero) | EAF |
| S-02 | Operador de Horno de Piso (Segundo Hornero) | EAF |
| S-03 | Ayudante de Horno (Tercer Hornero) | EAF |
| S-04 | Operador de Grúa de Carga (nave de hornos) | EAF |
| S-05 | Operador de Patio de Chatarra (canastas, electroimán, pórtico de radiación) | Patio |
| S-06 | Operador de Horno Olla | LF |
| S-07 | Ayudante de Horno Olla / Alimentación de Alambre | LF |
| S-08 | Preparador de Ollas (Ollero) | Ollas |
| S-09 | Operador de Grúa de Colada (nave de ollas) | Ollas |
| S-10 | Operador de Manejo de Escoria (portaollas de escoria) | EAF / LF |
| S-11 | Muestrero / Analista de Laboratorio de Acería | Calidad |
| S-12 | Operador de Púlpito de Colada (CC1 / CC2) | Colada |
| S-13 | Operador de Plataforma de Colada (olla y distribuidor) | Colada |
| S-14 | Ayudante de Colada (molde y línea) | Colada |
| S-15 | Preparador de Distribuidores | Colada |
| S-16 | Operador de Corte y Marcado | Colada |
| S-17 | Operador de Mesa de Enfriamiento y Despacho | Colada |
| S-18 | Inspector de Calidad de Semiterminado (planchón / palanquilla) | Calidad |
| S-19 | Mecánico de Acería | Mantenimiento |
| S-20 | Electricista de Acería | Mantenimiento |
| S-21 | Instrumentista | Mantenimiento |
| S-22 | Técnico Hidráulico | Mantenimiento |
| S-23 | Soldador Calificado | Mantenimiento |
| S-24 | Refractarista | Mantenimiento / Ollas |
| S-25 | Mecánico de Taller de Moldes y Segmentos | Mantenimiento |
| S-26 | Lubricador | Mantenimiento |

## 2. Procesos críticos y sus manuales

Criterio de "crítico": un error en el proceso puede causar una fatalidad o lesión grave, una explosión o derrame de metal, un daño mayor al equipo o un producto fuera de especificación que llegue al cliente.

### 2.1 Operación — EAF (`02-operacion/eaf/`)
| Código | Proceso crítico | Rol dueño | Roles que ejecutan |
|---|---|---|---|
| MO-EAF-01 | Preparación del horno entre coladas (inspección, reparación de puerta y solera, llenado del EBT, verificación de agua) | C-05 | S-01, S-02, S-03 |
| MO-EAF-02 | Carga de chatarra con canasta | C-05 | S-04, S-05, S-01 |
| MO-EAF-03 | Alimentación continua de DRI/HBI | C-07 | S-01 |
| MO-EAF-04 | Fusión: perfil de potencia y regulación de electrodos | C-07 | S-01 |
| MO-EAF-05 | Escoria espumosa: inyección de O₂ y carbono, desescoriado | C-07 | S-01, S-02, S-10 |
| MO-EAF-06 | Medición de temperatura, oxígeno activo y muestreo | C-05 | S-02, S-11 |
| MO-EAF-07 | Vaciado por EBT y adiciones en olla | C-05 | S-01, S-02, S-03, S-09 |
| MO-EAF-08 | Adición y empalme de electrodos | C-05 | S-02, S-03, S-04 |

### 2.2 Operación — Ollas y Horno Olla (`02-operacion/ollas-lf/`)
| Código | Proceso crítico | Rol dueño | Roles que ejecutan |
|---|---|---|---|
| MO-OLL-01 | Preparación de olla: válvula deslizante, arena de sello, tapón poroso, precalentamiento | C-15 | S-08, S-24 |
| MO-OLL-02 | Traslado de ollas llenas con grúa de colada | C-04 | S-09, S-13 |
| MO-LF-01 | Tratamiento en horno olla: calentamiento, ajuste químico, desulfuración, argón y alambre | C-07 | S-06, S-07, S-11 |

### 2.3 Operación — Colada Continua 1, planchón (`02-operacion/cc1/`)
| Código | Proceso crítico | Rol dueño | Roles que ejecutan |
|---|---|---|---|
| MO-CC1-01 | Preparación y precalentamiento del distribuidor | C-06 | S-15, S-13 |
| MO-CC1-02 | Preparación de máquina: inserción y sellado de la barra falsa | C-06 | S-12, S-14 |
| MO-CC1-03 | Arranque de colada (apertura de olla y distribuidor, llenado del molde) | C-06 | S-12, S-13, S-14 |
| MO-CC1-04 | Colada en estado estable: nivel de molde, velocidad, enfriamiento, polvo de molde | C-08 | S-12, S-13, S-14 |
| MO-CC1-05 | Cambio de olla en secuencia (torreta) | C-06 | S-13, S-09, S-12 |
| MO-CC1-06 | Cambio de buza sumergida (SEN) y cambio de distribuidor en caliente | C-06 | S-13, S-14, S-12 |
| MO-CC1-07 | Fin de colada y cierre de secuencia | C-06 | S-12, S-13, S-14 |
| MO-CC1-08 | Corte, marcado y manejo en mesa de enfriamiento | C-06 | S-16, S-17 |
| MO-CC1-09 | Inspección de calidad del planchón y disposición de defectos | C-09 | S-18 |

### 2.4 Operación — Colada Continua 2, palanquilla (`02-operacion/cc2/`)
| Código | Proceso crítico | Rol dueño | Roles que ejecutan |
|---|---|---|---|
| MO-CC2-01 | Preparación y precalentamiento del distribuidor y las buzas calibradas | C-06 | S-15, S-13 |
| MO-CC2-02 | Preparación de máquina: inserción de la barra falsa rígida (6 líneas) | C-06 | S-12, S-14 |
| MO-CC2-03 | Arranque de colada por línea | C-06 | S-12, S-13, S-14 |
| MO-CC2-04 | Colada en estado estable: nivel de molde, aceite, EMS, velocidad, enfriamiento | C-08 | S-12, S-13, S-14 |
| MO-CC2-05 | Cambio de olla en secuencia (torreta) | C-06 | S-13, S-09, S-12 |
| MO-CC2-06 | Cambio rápido de buza calibrada y taponeo o cierre de línea | C-06 | S-13, S-14 |
| MO-CC2-07 | Fin de colada y cierre de secuencia | C-06 | S-12, S-13, S-14 |
| MO-CC2-08 | Corte, marcado, lecho de enfriamiento y despacho | C-06 | S-16, S-17 |
| MO-CC2-09 | Inspección de calidad de la palanquilla y disposición de defectos | C-09 | S-18 |

### 2.5 Mantenimiento crítico (`03-mantenimiento/`)
| Código | Proceso crítico | Rol dueño | Roles que ejecutan |
|---|---|---|---|
| MM-EAF-01 | Detección y reparación de fugas en paneles y bóveda enfriados por agua | C-11 | S-19, S-23, S-21 |
| MM-EAF-02 | Mantenimiento de brazos portaelectrodos, columnas, regulación hidráulica y cambio de bóveda / delta | C-11 | S-19, S-22, S-20, S-04 |
| MM-EAF-03 | Reparación de refractario del EAF: solera, bancos, EBT (cambio de tubo/bloque) y proyección (gunning) | C-15 | S-24, S-03 |
| MM-EAF-04 | Mantenimiento del transformador del horno y maniobras de alta tensión | C-12 | S-20 |
| MM-OLL-01 | Cambio de placas de válvula deslizante y tapón poroso; revestimiento y reparación de ollas | C-15 | S-24, S-08 |
| MM-CC-01 | Cambio y preparación de moldes (placas CC1 / tubos CC2), medición de conicidad y desgaste | C-11 | S-25, S-19, S-21, S-22 |
| MM-CC-02 | Cambio y alineación de segmentos (CC1) y guías (CC2); medición de gap y alineación | C-11 | S-25, S-19, S-21, S-22 |
| MM-CC-03 | Sistemas de agua de molde, enfriamiento secundario y agua de emergencia (pruebas de torre y bombas diésel) | C-12 | S-19, S-21 |
| MM-CC-04 | Sistemas hidráulicos de oscilación, control de nivel y barra tapón (incluye la fuente de Cs-137 de CC2) | C-12 | S-22, S-21 |
| MM-GR-01 | Inspección y mantenimiento de grúas de colada (ganchos, frenos, cables, límites) | C-11 | S-19, S-20, S-09 (checklist diario), S-26 |

### 2.6 Seguridad crítica (`04-seguridad/`)
| Código | Proceso crítico | Rol dueño | Aplica a |
|---|---|---|---|
| MS-ACE-01 | Trabajo con metal líquido: zonas de exclusión, EPP aluminizado, distancias | C-16 | Todos los roles de planta |
| MS-ACE-02 | Aislamiento y bloqueo (LOTO) para ingresar al EAF, al LF, a la CC y a sus equipos | C-16 | Operación y mantenimiento |
| MS-ACE-03 | Prevención de explosiones por contacto agua–metal líquido | C-07 / C-16 | EAF, ollas, CC, patio |
| MS-ACE-04 | Izaje con grúas de colada y de carga; cargas suspendidas | C-16 | S-04, S-09, S-13, mantenimiento |
| MS-ACE-05 | Espacios confinados (ollas, distribuidores, fosas, ductos de humos, casa de bolsas) | C-16 | S-08, S-15, S-24, mantenimiento |
| MS-ACE-06 | Gases: CO, enriquecimiento de O₂, argón y N₂ (asfixia), gas natural | C-16 | Todos |
| MS-ACE-07 | Fuentes radiactivas (nivel de molde de CC2, detección de chatarra) | C-16 (función de Encargado de Seguridad Radiológica, ESR, con licencia de la CNSNS) | S-05, S-12, S-13, S-14, S-21, S-25 |
| MS-ACE-08 | Estrés térmico, hidratación y EPP | C-16 | Todos |
| MS-ACE-09 | Respuesta a emergencias: fuga de agua en el horno, perforación de olla, breakout en CC, falla de agua de molde o apagón, derrame | C-04 | Todos |
| MS-ACE-10 | Trabajo en altura (bóveda, plataformas, grúas) | C-16 | Operación y mantenimiento |

## 3. Pendientes de catálogo (decisión del Director)
- **Rol faltante:** Operador de Grúa de CC y Producto (grúas de 50 t y 45 t). Hoy lo cubren S-15 (distribuidores) y S-17 (producto). Propuesta: crear el rol S-27.
- **Escarpeo de planchón:** asignarlo a un rol (propuesta: S-18 con certificación) o a un contratista REPSE.
- **Supervisor de mantenimiento de turno:** hoy lo cubre C-12 en modalidad de turno. Propuesta: evaluar crear el rol C-18.
- **Dueño único de MS-ACE-03:** propuesta C-07 como dueño y C-16 como verificador.

## 4. Nomenclatura de imágenes (`img/`)
Prefijos: `eaf-`, `lf-`, `olla-`, `cc1-`, `cc2-`, `mm-`, `ms-`, `org-`. Formato **SVG** (ver la guía de estilo).
