# Kit de lanzamiento — Piloto de misiones (Trabajo en Alturas y LOTO)

**Origen:** decisión del Director del 2026-10-07 (D-015), con base en D-012, D-013 y D-014 · **Dueño del piloto:** ADX-01 (conducción) · **Fecha de corte:** 2026-10-16

## 1. Mensaje clave
El piloto queda **lanzado**. Del 2026-10-12 al 2026-10-16 **[Supuesto]**, 5 trabajadores de nuevo ingreso **de confianza** juegan, en sesiones individuales, las dos misiones: Trabajo en Alturas 01 «Preparación de la tarea» y Bloqueo y Etiquetado (LOTO) 01 «Aislar un equipo para mantenimiento». Las misiones se juegan en modo DEMO y sin instrucciones previas. El objetivo es medir si la experiencia se entiende sola, si la persona aprende y si se detectan riesgos de uso.

**Link de la versión 2.1:** https://rawcdn.githack.com/diegocardonaguzman03-maker/HR/fa25ff0f34fb2eee70bc7d8df4b7645c63c0f7a1/apps/academy/web/index.html

> Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad.

## 2. Reglas que no se negocian
1. **Solo personal de confianza.** El nuevo ingreso contratado en un puesto de categoría sindicalizable no participa, aunque esté en periodo de prueba (D-011-4 y RL-L-14). Si hay duda sobre el puesto, la persona no participa y se consulta a Relaciones Laborales.
2. **Solo DEMO.** Ni las misiones ni los 6 PDF se usan para operar, para dar permisos ni como evidencia de capacitación, de bloqueo o de inspección. **No se emite DC-3.**
3. **No se evalúa a la persona.** Los resultados no se usan para escalafón, ascensos, cambios de puesto, evaluación de desempeño, sanciones ni bonos. En el informe no aparecen nombres; solo los códigos P1 a P5.
4. **El supervisor del participante no está en la sala.** Solo están el instructor y el observador de Seguridad.
5. **Borrar los datos al terminar.** Después de cada sesión se pulsa «Borrar mis datos de este equipo y terminar», antes de que entre la siguiente persona.
6. **Detener la sesión si algo se interpreta mal.** Si un participante dice que haría en planta algo inseguro que vio o creyó ver en la misión, el instructor detiene la sesión, lo aclara y lo anota como hallazgo de seguridad.

## 3. Plan de acción (5W2H)

| # | Qué | Por qué | Quién | Dónde | Cuándo | Cómo | Cuánto (MXN) | Evidencia de cierre | Estado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Seleccionar 5 participantes y 2 suplentes | Población válida (regla 1) | gerente-personal-confianza + conf-servicio-clientes | Inducción de confianza | 2026-10-08 | Lista de nuevo ingreso de confianza; Relaciones Laborales confirma que ningún puesto es sindicalizable | $0 | Lista con códigos P1 a P5 y el visto bueno de Relaciones Laborales | 🟡 |
| 2 | Enviar la convocatoria (§7) | Participación voluntaria e informada | conf-servicio-clientes | Correo interno | 2026-10-08 | Texto del §7; la envía C&D, no el jefe directo | $0 | Confirmaciones recibidas | 🟡 |
| 3 | Preparar 2 equipos y probar el link (§4) | Que la sesión no falle por la técnica | TD-16/TD-17 (Plataformas) + ADX-13 | Sala de capacitación | 2026-10-09 | Checklist del §4, en la red de planta | $0 | Checklist firmado por Plataformas | 🟡 |
| 4 | Ensayo con un instructor que no participó en el diseño | Calibrar la guía y los tiempos | ADX-07 | Sala | 2026-10-09 | Guía del §5 completa, con cronómetro | $0 | Ajustes anotados en la guía | 🟡 |
| 5 | Ejecutar las 5 sesiones | Datos del piloto | ADX-01 (instructor) + ADX-04 (observa la parte de seguridad) | Sala | 2026-10-12 → 10-16 | Guía §5 y hoja §6; 1 sesión de unos 40 min por persona | Horas internas **[Supuesto]** | 5 hojas de observación completas y el registro `registro-resultados.csv` | ⚪ |
| 6 | Consolidar resultados y elaborar el informe | Decisión de seguir, ajustar o detener | ADX-01 + ADX-07 + ADX-13 | – | 2026-10-19 | Plantilla de informe ejecutivo, con métricas contra metas (§8) | $0 | Informe al Director con «Decisión requerida» | ⚪ |

**Costo:** $0 adicional **[Supuesto]**. Se usan sala, equipos y horas internas de C&D. Las horas de los participantes son de inducción, dentro de su jornada.
**Hito de revisión con el Director:** 2026-10-19 **[Supuesto]**.
**Escalamiento:** un hallazgo de seguridad o laboral se reporta al Director el mismo día. No se espera al informe.

## 4. Checklist del equipo (antes de cada día y entre sesiones)
- [ ] El link de la versión 2.1 abre en el navegador del equipo de planta (Chrome o Edge actualizado) y el escenario 3D carga en menos de 10 s.
- [ ] Pantalla de 13" o más, mouse conectado y audio no requerido.
- [ ] Los 6 PDF se descargan desde «Procedimientos» (WI, MO y CL de Alturas y de LOTO).
- [ ] Antes de cada participante: el botón «Borrar mis datos de este equipo y terminar» está pulsado y la pantalla inicial muestra las misiones sin avance.
- [ ] Registro: activado para participantes. Si un instructor sindicalizado facilita, va desactivado (ADX-RL-001, Decisión 3).
- [ ] Hay un cronómetro y hojas de observación impresas (§6), una por participante.
- [ ] Plan B si falla la red: un segundo equipo con el mismo link ya cargado.

## 5. Guía del instructor (sesión de unos 40 min)

| Min | Momento | Qué hace el instructor | Qué **no** hace |
|---|---|---|---|
| 0–3 | Bienvenida | Lee el guion A | No explica la plataforma ni las misiones |
| 3–5 | Prueba de 10 segundos | Abre la pantalla inicial, dice «Adelante» y arranca el cronómetro. Anota el tiempo hasta el primer clic útil | No señala la pantalla |
| 5–17 | Misión Alturas 01 | Observa y anota en la hoja. Si la persona se atora más de 60 s, dice solo: «¿Qué crees que te pide la pantalla?» | No da la respuesta ni dice «muy bien» o «mal» |
| 17–29 | Misión LOTO 01 | Pide «Ahora entra a la misión de bloqueo». Observa igual | Igual que arriba |
| 29–31 | Procedimientos | Pide «Busca el checklist de LOTO y descárgalo». Anota si lo encuentra solo | No le dice dónde está el menú |
| 31–38 | Entrevista | Hace las preguntas del guion B y anota las respuestas textuales | No discute las respuestas |
| 38–40 | Cierre | Lee el guion C. Pulsa «Borrar mis datos…» frente al participante | No comenta su resultado con nadie más |

**Guion A (bienvenida).** «Gracias por venir. Estamos probando una herramienta de capacitación, no a ti. No hay respuestas buenas ni malas para nosotros: si algo no se entiende, es un problema de la herramienta. Lo que hagas aquí no se usa para evaluarte, ni para tu puesto, ni para nada de tu expediente. Es práctica, no te habilita para trabajar en altura ni para bloquear equipos, y no es una constancia DC-3. Te voy a pedir que pienses en voz alta. Yo no te voy a ayudar, porque quiero ver si la herramienta se entiende sola. Puedes parar cuando quieras.»

**Guion B (entrevista).**
1. En tus palabras, ¿qué tenías que lograr en cada misión?
2. ¿Hubo un momento en que no supiste qué hacer? ¿Cuál?
3. Cuando te equivocaste, ¿entendiste por qué?
4. ¿Qué harías distinto en planta después de esto? *(Si la respuesta implica un acto inseguro, se aplica la regla 6.)*
5. ¿Te quedó claro que esto es práctica y no un procedimiento de la planta? ¿Qué te lo dijo?
6. Del 1 al 5, ¿qué tan útil te parece para aprender antes de ir a planta? ¿Por qué?
7. ¿Qué le quitarías o le agregarías?

**Guion C (cierre).** «Terminamos. Voy a borrar tus datos de este equipo frente a ti. Recuerda: para trabajar en altura o aplicar un bloqueo necesitas la capacitación y la autorización de la planta, y si una condición no se cumple, te detienes y avisas a tu supervisor o, si no te atiende, a Seguridad Industrial.»

## 6. Hoja de observación (una por participante)

**Código:** P__ · **Fecha:** ____ · **Equipo:** ____ · **Instructor:** ____ · **Observador de Seguridad:** ____
*(No se anota el nombre ni el número de ficha.)*

| Indicador | Alturas 01 | LOTO 01 |
|---|---|---|
| Segundos hasta el primer clic útil (solo al inicio) | | – |
| Pasos donde se atoró más de 60 s (número de paso) | | |
| ¿Usó «¿Por qué?» o «Procedimiento»? (sí/no y en qué paso) | | |
| ¿Usó «Usar lista»? (sí/no) | | |
| Resultado final (pasos correctos al primer intento / 8) | | |
| ¿Terminó con errores críticos? (sí/no y en qué paso) | | |
| ¿Se recuperó después del error y explicó por qué? (sí/no) | | |
| Encontró y descargó el checklist de LOTO solo (sí/no, segundos) | – | |
| Comentarios textuales relevantes | | |
| **Hallazgo de seguridad** (regla 6): qué dijo o hizo y cómo se aclaró | | |
| **Hallazgo laboral** (miedo a ser evaluado, dudas sobre el uso de datos) | | |

Utilidad percibida (1–5): ____ · Firma del instructor: ____ *(firma de la hoja de observación, no del participante)*

## 7. Convocatoria (borrador para que la envíe C&D)

> **Asunto:** Invitación: prueba de una herramienta de capacitación (40 min)
>
> Hola:
>
> Capacitación y Desarrollo está probando una nueva herramienta de práctica con misiones sobre trabajo en alturas y bloqueo de energías (LOTO). Te invitamos a una sesión individual de unos 40 minutos, dentro de tu jornada de inducción, entre el 12 y el 16 de octubre.
>
> Lo que se prueba es la herramienta, no a ti. Tu participación es voluntaria. Lo que hagas en la sesión no se usa para evaluarte, ni para tu puesto, ni para tu expediente, y tus resultados no llevan tu nombre. Es práctica: no te habilita para ninguna tarea ni es una constancia DC-3.
>
> Responde a este correo con el horario que prefieras. Si tienes dudas, escríbenos.
>
> Capacitación y Desarrollo

## 8. Metas del piloto (vienen del plan de lanzamiento)

| Pregunta | Meta **[Supuesto]** |
|---|---|
| Empieza en 10 s o menos sin ayuda | 5/5 |
| Sabe en qué paso va y qué hacer | ≥ 4/5 |
| Se recupera de un error y entiende por qué | ≥ 4/5 |
| Encuentra el detalle técnico sin salir de la misión | ≥ 3/5 |
| Encuentra y descarga el checklist de LOTO solo | ≥ 4/5 |
| Distingue que es práctica y no procedimiento de planta (pregunta B5) | 5/5 |
| Utilidad percibida | ≥ 4.2 |
| Hallazgos de seguridad sin aclarar al cierre | 0 |

**Criterio para detener el piloto:** un hallazgo de seguridad que se repite en 2 participantes, o cualquier participante que diga que la misión le autoriza a hacer la tarea. En ese caso se suspenden las sesiones restantes y se avisa al Director el mismo día.

## 9. Lo que no cubre este piloto
- Personal sindicalizado: espera el acuerdo de la CMCAP y la validación de Jurídico Laboral (D-011-4).
- Datos de planta: los SME_REQUIRED se completan en el taller SME F2-01 antes de quitar el estado DEMO.
- Uso operativo: ninguna misión ni documento sustituye el procedimiento aprobado de la planta.
