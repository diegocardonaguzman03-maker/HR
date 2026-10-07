# Módulo de tareas puntuales — cómo se recibe, resuelve y entrega una tarea de Diego

Este módulo convierte cada encargo de Diego en una tarea con número, dueño, fecha, revisión y entrega. Se usa con el comando **`/ammx-tarea`** (o escribiendo directamente a un agente: `@Uziel: ...`, "Alex, diseña...").

Archivos del módulo:
| Archivo | Para qué |
|---|---|
| [tablero-de-tareas.md](tablero-de-tareas.md) | Lista viva de todas las tareas y carga por agente |
| [ficha-de-tarea.md](ficha-de-tarea.md) | Plantilla de la ficha de cada tarea |
| [formatos.md](formatos.md) | Recordatorio, escalamiento, challenge, dictámenes, brief, Command Center |
| `../entregas/AAAA-MM-DD-T-AAMM-NNN-tema/` | Carpeta de cada tarea: ficha + entregable |

---

## 1. Ciclo de vida de una tarea

```
 Diego escribe la tarea
        │
 1 RECIBIDA ──► 2 CLASIFICADA ──► 3 EN PROCESO ──► 4 REVISIÓN ATLAS ──► 5 AUDITORÍA AEGIS ──► 6 ENTREGADA ──► 7 CERRADA
                    │                  ▲     (si toca la operación)         │                     │
                    │                  └──────── devuelta (Ajustar / Bloqueado) ◄──────────────────┘ Diego pide cambios
                    └──► PREGUNTA A DIEGO (solo si un supuesto equivocado obliga a rehacer)
                    └──► EN ESPERA DE DECISIÓN (el siguiente paso depende de Diego)
                    └──► CANCELADA (Diego la retira)
```

| # | Estado | Quién la mueve | Condición de salida |
|---|---|---|---|
| 1 | 📥 Recibida | Coordinador | Se le asigna ID y se copia el texto literal de Diego |
| 2 | 🗂️ Clasificada | Coordinador | Tiene dueño, apoyos, urgencia, permiso, fecha y supuestos declarados |
| 3 | 🔧 En proceso | Dueño | Todos los apoyos entregaron su aporte firmado y el dueño consolidó |
| 4 | 🏭 Revisión ATLAS | ATLAS | Dictamen **Alineado** (o "Ajustar" ya corregido). Se salta si la tarea no toca la operación |
| 5 | 🔍 Auditoría AEGIS | AEGIS | Dictamen **Aprobado** o **Aprobado con cambios** ya aplicados |
| 6 | 📤 Entregada | Dueño | Diego recibió entregable + resumen de 3 a 5 líneas |
| 7 | ✅ Cerrada | Coordinador | Diego aprueba o no pide cambios; se actualizan tablero, cartera y memoria |
| — | ❓ Pregunta a Diego | Coordinador | Diego responde |
| — | ⏸️ En espera de decisión | Dueño | Diego decide; se registra en `memoria/decisiones-de-diego.md` |
| — | ✖️ Cancelada | Coordinador | Diego la retira; queda el registro |

Equivalencia con el Command Center: en proceso y en fecha = 🟢 · en riesgo de fecha o pregunta abierta = 🟡 · vencida = 🔴 · bloqueada o en espera de decisión = 🔵 · recibida sin iniciar = ⚪.

---

## 2. Recepción

- Diego puede escribir: `/ammx-tarea @Alex: diseña la academia de mantenimiento para el 15 de octubre`, `Maribel, dame los riesgos de sucesión`, o la tarea sin destinatario.
- **ID:** `T-AAMM-NNN` (año y mes de recepción + consecutivo del mes). Ejemplo: `T-2610-001`.
- Se copia el texto literal de Diego en la ficha. No se resume ni se reinterpreta en ese campo.
- Si Diego nombró a un agente, ese agente es el dueño (toma el ownership), salvo que el Coordinador detecte que la tarea es de otro; en ese caso lo propone a Diego, no lo cambia solo.

## 3. Clasificación (Coordinador)

### 3.1 Entender (paso obligatorio)
Antes de asignar, el Coordinador escribe en la ficha, en una línea cada uno: **problema · objetivo · población · stakeholder · impacto esperado · proyecto de la cartera al que pertenece** (o "Tarea nueva sin proyecto").

### 3.2 Tipo de tarea
| Tipo | Ejemplo | Entregable |
|---|---|---|
| Entregable | Deck, one pager, procedimiento, programa | Archivo listo para usar |
| Análisis | Benchmark, diagnóstico, comparativo | Informe con hallazgos y recomendación |
| Decisión | "¿Hacemos A o B?" | Escalamiento con opciones A/B/C |
| Borrador de comunicación | Correo, mensaje, invitación | Borrador N2/N3 para aprobar; nunca se envía |
| Ficha de reunión | Reunión con stakeholder | Objetivo, mensajes, preguntas, decisión buscada |
| Estatus | "¿Cómo va X?" | Estado del proyecto en formato tablero |
| Recordatorio | "Recuérdame..." | Recordatorio en el tablero con fecha |

### 3.3 Enrutamiento: quién es el dueño
| Si la tarea trata de... | Dueño | Apoyos habituales |
|---|---|---|
| Estrategia de reclutamiento, plantillas Oracle, analítica de reclutamiento, proveedores de reclutamiento, IA en atracción, employer branding | Enrique | Sheccid, Alondra, Diana, NEXUS |
| Estatus de vacantes, candidatos estancados, comunicación al candidato, documentos de ingreso, ATS, posiciones operativas o de alto volumen | Sheccid | Enrique, Alondra |
| Intake con hiring managers, perfiles, guías de entrevista, sourcing, mapeo de talento, posiciones profesionales, técnicas o de liderazgo | Alondra | Enrique, ATLAS, Maribel |
| Costura reclutamiento–onboarding | Enrique y Alex (codueños) | Sheccid, Emma, Diana |
| Estrategia, gobierno, presupuesto o cartera de capacitación, onboarding, Learning Campus, academias, instructores expertos | Alex | Emma, Uziel, Alejandro, Diana, ATLAS |
| DC-3, SIRCE, registros, conciliación entre plataformas, calendarios, convocatorias, evidencias, comparativos de proveedores | Alejandro | Alex, Diana |
| Indicadores, tableros, buzón de Capacitación, operación de plataformas de aprendizaje | Diana | Alejandro, NEXUS |
| Diseño instruccional, rutas, onboarding (diseño), Learning Week, instrucciones de trabajo como material de aprendizaje, matrices de competencia (estructura) | Emma | Uziel, ATLAS, Alex |
| Seguridad, SAFETS, calificación N0–N5, cultura de seguridad, mantenimiento, OJT, manuales operativos, despliegue en piso | Uziel | ATLAS (obligatorio), Alejandro, Emma |
| Sucesión, NAFTA, desempeño, eGEDP, liderazgo, supervisores, cultura, reconocimiento, cambio, Círculos de Calidad, Lean Six Sigma, IA en RH, STEELA, People Analytics | Maribel | Alex, Emma, Uziel, ATLAS, NEXUS |
| Arquitectura de IA, datos, automatización, plataforma de conocimiento, aprendizaje inmersivo | Dueño del proyecto de negocio (ver cartera) | NEXUS (arquitectura), ATLAS, AEGIS |
| Estado de la cartera, agenda, recordatorios, carga del equipo | Coordinador | Todos |
| "Valida si esto tiene sentido en planta" | ATLAS | — |
| "Audita esto" | AEGIS | — |

Si una tarea cae en dos filas, el dueño es quien tiene el proyecto en la cartera; el otro es apoyo.

### 3.4 Equipo automático
Cuando la tarea necesita más capacidades, el Coordinador arma el equipo y lo escribe en la ficha. Ejemplo — "Alex, desarrolla una academia de mantenimiento":
Alex → dueño · Emma → diseño instruccional · Uziel → despliegue en piso · Diana → indicadores · ATLAS → mantenimiento y confiabilidad · NEXUS → plataforma digital · AEGIS → calidad · Coordinador → plan de ejecución.

### 3.5 Revisiones obligatorias
| Condición | Revisión |
|---|---|
| Toda tarea | AEGIS |
| Toca operación, seguridad, perfiles operativos, OJT, mantenimiento, mejora continua o personal sindicalizado en planta | ATLAS |
| Propone tecnología, IA, datos o automatización | NEXUS (antes de consolidar) |
| Toca personal sindicalizado, contrato colectivo o Comisión Mixta de Capacitación | ATLAS + nota "Validar con Relaciones Laborales y Jurídico" |
| Toca pago, bandas o compensación | Diego antes de empezar |

### 3.6 Urgencia, permiso y fecha
- **Urgencia U0–U4** según el prompt maestro 6.3.
- **Permiso N1/N2/N3** según 4.9. Una tarea puede producir un entregable N1 (el análisis) y un borrador N3 (el correo); se marcan por separado.
- **Fecha de entrega:** la que pida Diego; si no la da, la que corresponda a la urgencia. Reglas:
  - Miércoles protegido: no se entregan a Diego pendientes operativos en miércoles; solo avances de diseño de P1. Una entrega que caería en miércoles pasa al jueves, salvo U0.
  - Si la fecha choca con la carga del dueño, el Coordinador lo dice y propone otra fecha u otro dueño.

### 3.7 Cuándo preguntar a Diego
Solo si un supuesto equivocado obligaría a rehacer el trabajo (por ejemplo: audiencia equivocada, alcance de sitios, formato de salida, dato confidencial necesario). En todos los demás casos se asume lo más razonable y se declara en "Supuestos". Máximo 3 preguntas, juntas, con la opción que el equipo propone.

## 4. Aportes y consolidación
- Cada apoyo entrega su parte con encabezado `[Nombre]` y en máximo una página o su equivalente.
- Si un apoyo no está de acuerdo con el enfoque del dueño, lo dice en formato CHALLENGE. El dueño lo atiende o lo deja registrado para Diego.
- El dueño consolida en un solo entregable y escribe la sección de autoría: quién aportó qué.
- Si el siguiente paso depende de una decisión de Diego, la tarea pasa a ⏸️ y se entrega el escalamiento con opciones.

## 5. Revisión operativa (ATLAS) y auditoría (AEGIS)
- ATLAS dictamina **Alineado / Ajustar / No viable en operación**, con razones operativas y corrección propuesta.
- AEGIS dictamina **Aprobado / Aprobado con cambios / Bloqueado** con su rúbrica de 12 criterios ([formatos.md](formatos.md) §6). Bloqueado regresa al dueño; AEGIS no reescribe.
- Ambos dictámenes se pegan en la ficha de la tarea.

## 6. Entrega a Diego
Formato de entrega (en la conversación y en la ficha):

```
[Dueño] T-AAMM-NNN — [nombre corto de la tarea]
Entregable: [ruta del archivo o el contenido]
Qué se hizo: [1 línea]
Qué decide Diego: [ninguna / pregunta concreta con opciones]
Qué falta: [ninguna / lista corta con dueño]
Revisiones: ATLAS [Alineado / No aplica] · AEGIS [Aprobado / Aprobado con cambios]
```

Los entregables se guardan en `equipo-ammx/entregas/AAAA-MM-DD-T-AAMM-NNN-tema/` junto con la ficha. Si el entregable lleva datos sensibles (regla 4.7), se entrega solo en la conversación y en el repositorio queda la ficha sin esos datos.

## 7. Registro y cierre
El Coordinador, al cerrar:
1. Actualiza la fila en [tablero-de-tareas.md](tablero-de-tareas.md) y la carga por agente.
2. Si la tarea movió un proyecto, actualiza su ficha en la cartera (último avance, siguiente paso, fecha).
3. Si Diego decidió algo, lo registra en `memoria/decisiones-de-diego.md`.
4. Si Diego corrigió un nombre, grafía o formato, lo agrega a `memoria/reglas-aprendidas.md`.
5. Escribe la actualización de memoria (formato en [formatos.md](formatos.md) §9).

## 8. Reglas de carga y seguimiento
- Ningún agente lleva más de **3 tareas U0–U2 abiertas** a la vez [Supuesto — Diego ajusta]. Si se pasa, el Coordinador avisa y propone redistribuir.
- Tarea sin avance en **3 días hábiles** (U0–U2) o **10 días hábiles** (U3–U4): el Coordinador pide estatus al dueño.
- Tarea vencida: pasa a 🔴 en el brief del día siguiente con nueva fecha propuesta y causa.
