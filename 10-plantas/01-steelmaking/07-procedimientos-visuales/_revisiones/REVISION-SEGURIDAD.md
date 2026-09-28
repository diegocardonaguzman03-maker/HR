# Revisión de Seguridad — Procedimientos Operativos Visuales (POV) de la Acería

| Revisión | Revisor | Alcance | Fecha | Resultado |
|---|---|---|---|---|
| Seguridad | experto-seguridad-salud | 29 POV (EAF-01…08, OLL-01/02, LF-01, CC1-01…09, CC2-01…09) contra su manual MO y la serie MS-ACE-01…10 | 2026-09-28 | **29 de 29 con visto bueno con observaciones. Ninguno queda "No aprobado".** 115 correcciones en `_revisiones/seguridad/<código>.json` |

> **Mensaje clave.** Los 29 POV son fieles a los controles críticos de sus manuales: zonas de exclusión, "nunca agua sobre metal", LOTO y llave cautiva, ESR para el Cs-137 y evacuación a ≥ 25 m. Ninguno expone a una persona nueva a un peligro que el manual prohíba. Lo que faltaba era que la persona nueva **viera la condición de ALTO en el paso donde se expone**. Por eso la mayor parte de las correcciones (62 de 115) son ALTO observables en pasos ★. Se agregó también la respuesta a la alarma del detector de gases en 6 POV (CO, argón, gas natural), 10 EPP que faltaban y 3 huecos de los manuales que se deben corregir en el origen. Los POV se pueden usar en capacitación **como borrador**: las distancias de las zonas siguen marcadas como [Supuesto] hasta que se haga el estudio de la nave (MS-ACE-01).

Las correcciones se probaron con `node aplicar-revisiones.mjs --dry`: 0 errores de ruta. Además, cada POV corregido pasa `validate.mjs` y respeta los límites de la especificación (máximo 7 condiciones anormales y 5 peligros, action ≤ 260 caracteres). No se agregan ni se borran pasos.

## 1. Resultado por POV

Tipos de corrección: **ALTO** = condición de alto en un paso · **EPP** · **Anormal** = respuesta en "Si algo sale mal" · **Otro** = action, check, zona o peligro.

| POV | Estado | Cambios | ALTO | EPP | Anormal | Otro | Lo principal |
|---|---|---|---|---|---|---|---|
| POV-EAF-01 Preparación del horno | Visto bueno con observaciones | 10 | 5 | – | 4 | 1 | ALTO en proyección, limpieza de puerta, lanza de O₂ y retiro de llaves con conteo; llave cautiva en falla o con prueba vencida lleva a LOTO; espera de evaporación ante fuga; respuesta a CO |
| POV-EAF-02 Carga con canasta | Visto bueno con observaciones | 5 | 2 | 1 | 2 | – | Chaleco en patio; posible explosivo: no se mueve (hueco del manual); bocina y zona antes de abrir la concha; persona en la ruta de la canasta |
| POV-EAF-03 Alimentación de DRI | Visto bueno con observaciones | 6 | – | – | 4 | 2 | Límite de LEL para entrar a galerías; peligro de CO en la bóveda y su respuesta; retirada a zona verde ante ebullición |
| POV-EAF-04 Fusión y electrodos | Visto bueno con observaciones | 3 | 1 | – | 2 | – | ALTO si T de panel > 60 °C; la alarma de fuga de 2 % se atiende antes del disparo de 4 % |
| POV-EAF-05 Escoria espumosa | Visto bueno con observaciones | 5 | 2 | – | 2 | 1 | Desescoriar solo con "olla seca" y "zona libre"; muestreo a ≥ 1.5 m y ≤ 2 min; peatones fuera de la ruta del portaollas; respuesta a CO (sustituye la condición de P > 0.015 %) |
| POV-EAF-06 Temperatura y muestreo | Visto bueno con observaciones | 3 | 2 | – | – | 1 | ALTO de inmersión ligado a la confirmación de S-01; medición manual con observador y EPP seco; se conserva la marca [Supuesto] del "un solo intento" |
| POV-EAF-07 Vaciado por EBT | Visto bueno con observaciones | 9 | 3 | – | 2 | 4 | Olla < 1,000 °C como ALTO medible; aviso de al menos 30 s; sin sirena no hay vaciado; no abrir el EBT sin "zona libre"; posición protegida de S-02; lanceo con [Validar con OEM]; respuesta a CO |
| POV-EAF-08 Electrodos | Visto bueno con observaciones | 3 | 2 | – | – | 1 | Tapón de izaje roscado antes de abrir la mordaza; conteo de llaves; [Validar con OEM / C-12] del movimiento de la mordaza |
| POV-OLL-01 Preparación de olla | Visto bueno con observaciones | 6 | 3 | – | 3 | – | ALTO en volteo, lanza de O₂ y traslado; respuesta a CO y gas natural en el precalentador |
| POV-OLL-02 Traslado de ollas | Visto bueno con observaciones | 4 | 4 | – | – | – | No liberar una olla con fuga o bordo libre < 300 mm; persona en la ruta o balanceo detiene el traslado; señalero único; desenganchar solo con "asentada OK" |
| POV-LF-01 Horno olla | Visto bueno con observaciones | 6 | 2 | – | 2 | 2 | Nadie en la plataforma al energizar; ALTO de agitación fuerte; muestreo seguro; latigazo del alambre; respuesta a detector y a monitor de O₂, sin rescate sin ERA (sustituye "> 50 min") |
| POV-CC1-01 Distribuidor CC1 | Visto bueno con observaciones | 3 | 3 | – | – | – | Limpieza interior solo con permiso (orden del manual, ver §3); ≤ 45 °C y rescate listo; ruta del carro |
| POV-CC1-02 Barra falsa CC1 | Visto bueno con observaciones | 3 | 3 | – | – | – | El recorrido inicial es solo visual (LOTO antes de meter manos); exclusión durante la inserción; conteo antes de retirar candados |
| POV-CC1-03 Arranque CC1 | Visto bueno con observaciones | 5 | 4 | – | 1 | – | ALTO en olla suspendida, giro de torreta y apertura de olla; barra que no se desconecta; en breakout se mantiene el agua de molde |
| POV-CC1-04 Colada estable CC1 | Visto bueno con observaciones | 1 | – | – | – | 1 | El muestrero entra acompañado y con herramienta seca |
| POV-CC1-05 Cambio de olla CC1 | Visto bueno con observaciones | 4 | 1 | – | 2 | 1 | Vigía en el lanceo; en rebose, dejar solidificar y nunca agua |
| POV-CC1-06 Cambio de SEN y distribuidor CC1 | Visto bueno con observaciones | 2 | 1 | – | 1 | – | Ruta de carros y fosa seca; cambiador que no acciona |
| POV-CC1-07 Fin de colada CC1 | Visto bueno con observaciones | 6 | 3 | 1 | 1 | 1 | Careta de oxicorte; LOTO con prueba de arranque antes de entrar a la máquina; en breakout de cola se mantiene el agua de molde |
| POV-CC1-08 Corte y mesa CC1 | Visto bueno con observaciones | 2 | 1 | 1 | – | – | Careta de oxicorte; ropa sin grasa |
| POV-CC1-09 Inspección de planchón | Visto bueno con observaciones | 4 | 2 | 1 | 1 | – | Careta de oxicorte para escarpeo; área sin combustibles; campana, regadera y lavaojos; salpicadura de ácido |
| POV-CC2-01 Distribuidor CC2 | Visto bueno con observaciones | 2 | 2 | – | – | – | Bloqueo del carro antes de trabajar bajo el distribuidor (el POV lo omitía) |
| POV-CC2-02 Barra falsa CC2 | Visto bueno con observaciones | 2 | 2 | – | – | – | Prueba de arranque del oscilador y de los extractores como ALTO |
| POV-CC2-03 Arranque CC2 | Visto bueno con observaciones | 2 | 1 | – | – | 1 | Rutas de escape libres; condiciones del lanceo (certificado, lanza ≥ 3 m, sin grasa) |
| POV-CC2-04 Colada estable CC2 | Visto bueno con observaciones | 2 | – | – | – | 2 | Nunca cortar el agua de molde en un breakout; revisión del Cs-137 por el ESR después |
| POV-CC2-05 Cambio de olla CC2 | Visto bueno con observaciones | 2 | 2 | – | – | – | El giro que hace S-12 depende de la confirmación de S-13; condiciones del lanceo |
| POV-CC2-06 Cambio de buza CC2 | Visto bueno con observaciones | 2 | 2 | – | – | – | Nadie en la línea de expulsión al cerrar; barandal para taponear desde arriba |
| POV-CC2-07 Fin de colada CC2 | Visto bueno con observaciones | 4 | 3 | – | – | 1 | Olla suspendida; LOTO con prueba de arranque; no inspeccionar sin registro del ESR |
| POV-CC2-08 Corte y lecho CC2 | Visto bueno con observaciones | 2 | – | 2 | – | – | Careta de oxicorte y chaleco |
| POV-CC2-09 Inspección de palanquilla | Visto bueno con observaciones | 7 | 3 | 3 | 1 | – | EPP químico, careta y chaleco; cargas suspendidas; guardas y permiso en caliente; salpicadura de ácido (sustituye "palanquilla doblada") |
| **Total** | **29 con visto bueno con observaciones** | **115** | **62** | **10** | **27** | **16** | |

## 2. Hallazgos principales

1. **ALTO que faltaba en el paso donde la persona se expone (62 correcciones).** Los POV ponían la condición de ALTO en el paso que establece el control (por ejemplo, "Despeja la zona") pero no en el paso que expone (abrir el EBT, abrir la olla, girar la torreta, desenganchar). Cuando esos pasos los ejecuta otro puesto, la persona nueva no ve la dependencia. Se ligó el ALTO a la confirmación por radio del paso previo (EAF-05, EAF-06, EAF-07, CC1-03, CC2-05, OLL-02). También faltaba ALTO en los retiros de LOTO y de llave cautiva (conteo de personas = candados o llaves), en la prueba de arranque de los LOTO de CC y en el izaje con persona bajo la carga.
2. **Respuesta a la alarma del detector de gases.** Casi todos los POV listan CO, argón o gas natural como peligro principal y ponen el detector en el EPP, pero no dicen qué hacer cuando suena (A1: CO 25 ppm, 10 % LEL u O₂ fuera de 19.5–23.5 % → salir a zona verde y avisar · A2: CO 200 ppm o 20 % LEL → C-04 evacúa · nunca rescatar sin ERA; MS-ACE-06). Se agregó la respuesta donde el gas es un peligro principal del proceso: EAF-01, EAF-03, EAF-05, EAF-07, OLL-01 y LF-01. En los POV de CC no hay espacio: el límite de 7 condiciones anormales ya está ocupado con respuestas críticas (breakout, agua de molde). **Ver la decisión D-1.**
3. **Sustitución de 3 condiciones anormales de producción o calidad** para no pasar de 7: EAF-05 ("P > 0.015 %", sigue en POV-EAF-06), LF-01 ("tratamiento > 50 min") y CC2-09 ("palanquilla doblada", sigue en POV-CC2-08). Las tres siguen en §9 de su manual. **Requiere el visto bueno de experto-operativo-metalurgia**, que aplica sus cambios después del mío: si reescribe `abnormal[6]` de esos POV, se mezclarían los textos.
4. **EPP que faltaba (10).** Careta de oxicorte para S-16 y el escarpeo (CC1-07, CC1-08, CC1-09, CC2-08); chaleco de alta visibilidad en patio y en el lecho (EAF-02, CC2-08, CC2-09); protección química y careta facial para el macroataque con HCl caliente (CC2-09). No se agregó chaleco al señalero en zona de metal líquido (ver §3, tema a).
5. **Breakout: mantener el agua de molde.** Dos respuestas de CC1 decían "detén y evacúa" sin la regla crítica "mantén el agua de molde; nunca la cortes; nadie se acerca sin C-06" (CC1-03, CC1-07). CC2-04 no decía que el ESR revisa el contenedor de Cs-137 después del breakout. Se corrigió.
6. **Lanceo con O₂.** Faltaba el vigía en CC1-05 y las condiciones de MS-ACE-06 en CC2-03 y CC2-05 (solo S-13 certificado, lanza ≥ 3 m, guantes sin grasa, aluminizado seco).
7. **Radiación (Cs-137) y LOTO.** Están bien resueltos en CC2-02, CC2-06 y CC2-07: el obturador lo cierra el ESR con candado y medición < 2 × fondo. En CC2-01 faltaba el bloqueo del carro antes de trabajar bajo el distribuidor, que el manual sí exige.
8. **LFT art. 9.** Todos los ALTO nuevos son del tipo "detén, no inicies y avisa". Ninguno da mando al personal sindicalizado: las autorizaciones siguen en C-04, C-05, C-06 y el ESR.
9. **Observación para Documentación y Mejora (no es de seguridad):** en `certification[].evaluated` algunos POV citan los pasos con la numeración del manual y otros con la del POV (CC1-01, CC2-02 y CC2-06 mezclan ambas). La persona nueva no sabe qué paso le van a evaluar.

## 3. Temas que requieren cambio en los manuales MO / MS

| # | Manual | Hallazgo | Riesgo | Cambio propuesto | Dueño |
|---|---|---|---|---|---|
| a | **MS-ACE-04 §6.2** | Pide "chaleco o brazalete de señalero" para el señalero en la zona de ollas. Un chaleco de alta visibilidad común es sintético, y MS-ACE-01 §6.2 y MS-ACE-08 prohíben la ropa sintética junto al metal líquido porque se funde sobre la piel | Quemadura agravada del señalero (S-13, S-03, S-08) | Cambiar a "brazalete o distintivo de señalero de material FR o aluminizado"; chaleco de alta visibilidad solo en patio y lecho, lejos del metal líquido | C-16 / experto-seguridad-salud |
| b | **MO-EAF-02 §6 y §9; MS-ACE-03 §6.3** | Los explosivos y municiones en la chatarra se "rechazan con protocolo con autoridades", pero no hay procedimiento: quién los toca, qué perímetro se pone y a quién se avisa (SEDENA / autoridad) | Una persona nueva podría mover una munición al "separar lo prohibido" | Agregar una fila en §9: no mover, perímetro, evacuar el patio y aviso a C-17, C-16, C-04 y a la autoridad por el canal autorizado [verificar con Jurídico / SSO]. En el POV se puso un ALTO provisional ("no lo muevas y avisa") | C-17 / C-16 |
| c | **MO-CC1-01 §8** | El paso 3 (limpiar el interior) va antes del paso 4 (permiso de espacio confinado, LOTO y medición). Si la limpieza exige meter el cuerpo, la secuencia expone a la persona | Atmósfera o calor en el distribuidor sin permiso | Invertir el orden o precisar "limpieza desde afuera; si hay que entrar, primero el paso 4" | C-06 / C-15 |
| d | **MO-CC1-09 y MO-CC2-09 §9** | Tienen regadera y lavaojos como control, pero no dicen qué hacer ante una salpicadura de HCl caliente (tiempo de enjuague, hoja de seguridad, servicio médico) | Quemadura química mal atendida | Agregar la fila de primeros auxilios con el tiempo de enjuague de la hoja de seguridad del ácido [verificar con SSO / NOM-005 y NOM-018] | C-16 / C-09 |
| e | **MO-OLL-02 §6.1** | Punto de retención: "no se certifica el paso 7 hasta confirmar si los 250 t de la grúa incluyen la traviesa". El POV conserva el [Validar con OEM], pero la certificación de S-09 no puede cerrar ese paso | Olla llena sobre la capacidad real de la grúa | Obtener el dato del OEM y ajustar el límite de 240 t. **Ver la decisión D-4** | C-11 / C-16 / OEM |
| f | **Todos los MO de EAF, LF y CC, §9** | La respuesta al detector de gases solo está en §6.1 (tabla de peligros), no en §9 (condiciones anormales). Por eso los POV no la traían | La persona nueva no asocia la alarma del detector con la acción | Agregar a §9 de cada manual la fila única "Detector personal en alarma (A1/A2)" con los valores de MS-ACE-06 | experto-seguridad-salud con experto-documentacion-mejora |
| g | **MO-EAF-08 §6.3** | La apertura de la mordaza con personal en la plataforma depende de que el sistema de llaves solo permita ese movimiento [Validar con OEM / C-12] | Movimiento no esperado con personas arriba | Cerrar la validación con C-12 antes de certificar el método A | C-12 |
| h | **MO-CC1-02 §8 paso 1** | El recorrido de la línea antes del LOTO no dice que es solo visual | Manos entre rodillos sin bloqueo | Agregar "solo visual; para meter manos o herramientas, LOTO (paso 8)" | C-06 |
| i | **MO-CC1-04 §8 paso 14** | No dice que el muestrero entra a la zona roja acompañado y autorizado, como pide MS-ACE-01 §2 | Exposición del S-11 en la plataforma | Alinear con MS-ACE-01 | C-06 |
| j | **Serie MS-ACE-01 (zonas)** | Todas las distancias de exclusión que usan los POV siguen como [Supuesto — validar con estudio de la nave] | Distancias que podrían no corresponder a la nave real | Terminar el estudio de la nave. **Ver la decisión D-2** | C-16 |

## 4. Revisión cruzada que necesita esta entrega

- **experto-operativo-metalurgia (Técnica):** validar las 3 sustituciones de condiciones anormales (§2, punto 3) y los ALTO nuevos que usan valores de proceso (T de panel > 60 °C, bordo libre ≥ 300 mm, 45 °C en el distribuidor, ≥ 1.5 m y ≤ 2 min en muestreo). Como su revisión se aplica después de la mía, debe revisar `cambios-aplicados.tsv` para evitar que se pisen los mismos campos.
- **experto-relaciones-laborales:** confirmar que los ALTO nuevos ("detén, no inicies y avisa") no asignan mando al personal sindicalizado (LFT art. 9). Criterio del revisor de seguridad: cumplen.
- **experto-documentacion-mejora:** la decisión D-1 (bloque fijo de emergencia en `render.mjs`), la numeración de pasos en `certification[]` y el alta de los cambios de manual del §3.
- **Nota operativa:** `aplicar-revisiones.mjs --dry` escribe `_revisiones/cambios-aplicados.tsv` aunque sea simulación. El archivo se regenera cada vez que alguien corre la herramienta.

## 5. Decisión requerida del Director

**D-1. Cómo mostrar la respuesta a emergencias y gases en todos los POV**

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Documentación y Mejora agrega a `render.mjs` un bloque fijo "En cualquier emergencia" en la sección 5 de todos los POV: protégete (refugio o zona verde en ≤ 30 s), "EMERGENCIA ×3 · lugar · tipo", C-04 manda, detector A1/A2 (25/200 ppm, 10/20 % LEL, O₂ 19.5–23.5 %), nunca agua sobre metal, nunca rescate sin ERA (Reglas que Salvan Vidas 7 y 12) | Bajo. Es el mismo mensaje en los 29 POV y deja libres las 7 condiciones para las propias del proceso | ≈ 4 h de TD-16/TD-17 [Supuesto]; se vuelven a generar los PDF |
| B | Subir el límite a 9 condiciones anormales y agregar la respuesta a gases en cada POV | Medio. Páginas más cargadas y 29 textos que mantener | ≈ 16 h de edición y revisión [Supuesto] |
| C | Dejarlo como está | Alto. La persona nueva no sabe qué hacer cuando suena su detector en la mayoría de los POV | — |

**D-2. Uso de los POV en capacitación antes de validar las zonas [Supuesto]**

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Usar los POV desde ya en inducción y OJT como **borrador de capacitación**, con la leyenda "Distancias en validación — manda la marca en piso y la indicación de C-04/C-06", y ordenar el estudio de la nave de MS-ACE-01 en 60 días | Bajo. Las distancias son conservadoras y la marca en piso manda | Horas de C-16; estudio externo si no hay capacidad interna [Supuesto] |
| B | No usar los POV hasta validar todas las distancias | Se retrasa la capacitación de los nuevos ingresos en los riesgos que pueden matar | Sin costo inmediato |

**D-3. Identificación del señalero junto al metal líquido (tema a del §3)**

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Corregir MS-ACE-04 §6.2: brazalete o distintivo FR o aluminizado para el señalero; chaleco solo en patio y lecho | Bajo | Compra de brazaletes FR [Supuesto: bajo, < $20,000 MXN] |
| B | Mantener el texto actual (chaleco o brazalete) | Chaleco sintético en zona roja: quemadura agravada | — |

**D-4. Certificación del paso 7 de MO-OLL-02 (peso de la traviesa)**

| Opción | Descripción | Riesgo | Costo |
|---|---|---|---|
| **A (recomendada)** | Certificar a S-09 en todos los demás pasos. El paso 7 queda "pendiente de dato OEM" y se pide el dato al fabricante en ≤ 30 días. Mientras tanto, C-04 confirma el peso de cada olla llena contra la celda de carga | Bajo y controlado | Gestión con el OEM |
| B | Certificar el paso 7 con el límite actual de 240 t | Si la traviesa cuenta dentro de los 250 t, el margen real puede ser menor al supuesto | — |

**Fecha límite sugerida para decidir:** 2026-10-15 [Supuesto], la misma de la serie MS-ACE, para regenerar los PDF antes del siguiente grupo de nuevo ingreso.
