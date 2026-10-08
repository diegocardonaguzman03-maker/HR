# AMMX Agent Operations — centro de operaciones de los agentes

Aplicación web 3D que muestra al equipo digital de la Dirección de Talent Acquisition & Organizational Development de ArcelorMittal México como una nave industrial viva: cada agente tiene su avatar, su área, su tarea actual y su estado, y el Director los ve trabajar, les escribe, les asigna tareas y sigue proyectos, alertas y decisiones.

> **Simulación con datos ilustrativos.** Los proyectos, dueños, hitos, riesgos, documentos y decisiones pendientes vienen de la cartera del equipo (`equipo-ammx/cartera/cartera-de-proyectos.md` y `equipo-ammx/memoria/`). La actividad, los avances en %, los KPI y lo que muestran las pantallas son simulados. Los agentes con nombre de persona representan el **rol**, no a la persona.

## Qué hay en la nave
| Área | Agentes | Qué se ve |
|---|---|---|
| Talent Acquisition Hub | Enrique, Sheccid, Alondra | Funnel con tarjetas que bajan, muro de vacantes, agenda de entrevistas, videollamada de intake, sala de entrevistas, candidatos entrando al pipeline |
| Learning & Development Center | Alex, Alejandro, Diana, Emma, Uziel | Roadmap de academias, calendario, cumplimiento por sitio, aula con video de seguridad, torre de trabajo en alturas, zona OJT con operadores, banco de Maintenance Academy, muro de certificaciones, mesa de liderazgo |
| Organizational Development Lab | Maribel | Matriz 9-box de sucesión, readiness, organigrama vivo, ruta de carrera |
| Industrial Operations Room | ATLAS | Cadena de proceso, confiabilidad (MTBF, MTTR, backlog, OEE), seguridad, banda con mineral hacia un horno de arco eléctrico, maqueta de mina con camión |
| AI & Digital Lab | NEXUS | Pipeline de documentos hacia la base vectorial, embeddings, knowledge graph, red de agentes, racks |
| Quality & Audit Room | AEGIS | Cola de auditoría con la rúbrica de 12 criterios, matriz de riesgos, línea de expedientes con compuertas y sello. Sala cerrada en vidrio verde: independiente |
| PMO / Strategy Control Tower | Coordinador · PMO | Consola y pantallas de cartera; arriba, el **Director Command Center** con su muro curvo |
| Project War Room | (reuniones) | Mesa donde los equipos de proyecto se reúnen; muro de notas |

## Qué puede hacer el Director
- **Ver a cada agente**: etiqueta con estado (🟢 trabajando, 🟡 esperando, 🔵 en reunión, 🟣 analizando, 🔴 bloqueado, ⚪ disponible); al pasar el cursor, tarjeta con tarea, proyecto, avance, siguiente entrega y estado.
- **Clic en un agente**: panel con chat, trabajo actual, bloqueos, proyectos, entregables y 11 acciones (asignar tarea, preguntar, revisar trabajo, agregar fecha, cambiar prioridad, agregar a proyecto, crear reunión, pedir actualización, escalar, enviar a auditoría, chat completo).
- **+ Nueva tarea**: la tarea sale del Command Center como un paquete que vuela al agente; el agente va a su escritorio y trabaja; al terminar, el paquete viaja a ATLAS y a AEGIS si se pidieron esas revisiones, y llega a tus decisiones si pediste aprobación.
- **Proyectos**: 33 tarjetas filtrables; cada una abre su **project room** (objetivo, equipo, hitos, riesgos, decisiones, tareas, documentos, KPI, actividad) y permite convocar al equipo al War Room, donde los agentes caminan a la mesa, se reúnen y regresan.
- **Command Center** (panel izquierdo): acciones críticas, decisiones, proyectos en riesgo, actividad de agentes, prioridades, fechas, KPI y último avance.
- **Barra de comandos** (`/` o `Ctrl+K`): "¿Quién tiene bloqueos hoy?", "Muestra las vacantes críticas", "Pregunta a Maribel sobre sucesión", "¿Qué programas de capacitación van atrasados?", "Crea un proyecto".
- **Alertas** por categoría (crítico, atención, información, completado) con su origen: *Cartera* (hecho del tablero), *Ilustrativa* o *Simulación*.
- **Vista operativa / estratégica** y reloj de simulación con pausa, 1×, 2× y 4×.

## Límites honestos
- El chat y la barra de comandos responden con reglas locales a partir del tablero; **no hay un modelo de IA conectado**. Conectarlo es una decisión de NEXUS y del Director (dónde corre, qué datos ve, costo).
- Tareas, decisiones y proyectos creados en la app viven en la sesión del navegador. El registro oficial sigue en `equipo-ammx/` y se actualiza con `/ammx-tarea` en Claude Code.
- No se usan datos personales ni cifras reales de ArcelorMittal. Para mostrar datos reales hay que conectar las fuentes (Oracle, LMS, Power BI) con la aprobación del Director.

## Ejecutar
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # verificación de tipos + build en dist/
npm run build:web  # un solo index.html autocontenido en web/ (link público)
npm run build:share  # página pequeña + app.js en dist-share/ (para la página de claude.ai)
```
`?q=low` fuerza el modo ligero (sin post-proceso ni sombras suaves) para equipos lentos.

## Estructura
| Carpeta | Contenido |
|---|---|
| `src/data/` | Agentes y sus rutinas por rol, zonas y puestos, proyectos (de la cartera), alertas, decisiones, reuniones |
| `src/sim/engine.ts` | Simulación: rutas por pasillos y puertas, rutinas, reuniones en el War Room, flujo de tareas con ATLAS → AEGIS → aprobación |
| `src/sim/chat.ts` | Respuestas de los agentes y barra de comandos |
| `src/scene/` | Nave, departamentos, utilería animada, avatares, pantallas dibujadas en canvas, cámara |
| `src/ui/` | Barra superior, Command Center, panel del agente, dock de actividad, modales |
| `src/config.ts` | Nombre del Director (un solo lugar; ver confirmación #1 en `equipo-ammx/conciliacion-de-prompts.md`) |
