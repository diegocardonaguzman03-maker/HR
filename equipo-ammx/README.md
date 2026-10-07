# Equipo digital de Diego — módulo de tareas puntuales (ArcelorMittal México)

**Qué es:** un equipo de 13 agentes de Claude Code que recibe tareas puntuales de Diego Cardona (Director de Desarrollo Organizacional y Adquisición de Talento, ArcelorMittal México), las resuelve, las revisa y las entrega listas para usar, y lleva el tablero, las fechas y la memoria de la cartera de proyectos.

> Este módulo es independiente del resto del repositorio, que describe a GASM, una empresa **ficticia**. Los datos de GASM no se usan en entregables de ArcelorMittal. El repositorio es público: aquí no se guardan notas sensibles (regla 4.7 del prompt maestro).

## Cómo se usa
| Diego escribe | Qué pasa |
|---|---|
| `/ammx-tarea @Uziel: prepara el plan de cierre de SAFETS` | El Coordinador abre la tarea `T-AAMM-NNN`, la clasifica, Uziel la resuelve con sus apoyos, ATLAS y AEGIS la revisan y se entrega con resumen de 3–5 líneas |
| `Alex, diseña la academia de mantenimiento` | Igual: Alex toma el ownership y se arma el equipo automático |
| `/ammx-tarea estatus T-2610-004` | Estado de una tarea |
| `/ammx-brief` | Morning Brief del día |
| `/ammx-brief lunes` · `jueves` · `viernes` | Tablero semanal con 3 decisiones · recordatorios · resumen de logros para Cynthia |
| `/ammx-brief command-center` | Tabla de toda la cartera |
| `/ammx-brief agente Maribel` | Qué está haciendo un agente |
| `Aegis, audita ...` · `Atlas, valida ...` · `Nexus, diseña ...` | Revisión o arquitectura a pedido |

## El equipo
| Área | Agentes |
|---|---|
| Coordinación | Coordinador — PMO |
| Reclutamiento | Enrique (gerente) · Sheccid (operación y candidato) · Alondra (intake y sourcing) |
| Capacitación | Alex (gerente) · Alejandro (registros y operación) · Diana (indicadores, plataformas, buzón) · Emma (diseño instruccional) · Uziel (técnica, seguridad y piso) |
| Desarrollo Organizacional | Maribel (gerente) |
| Control y apoyo | Auditor — AEGIS (bloquea) · Experto de Operaciones — ATLAS · NEXUS (IA y datos) |

Los agentes con nombre de persona representan el **rol**, no a la persona: no hablan ni se comprometen en su nombre.

## Archivos
| Archivo | Contenido |
|---|---|
| [prompt-maestro.md](prompt-maestro.md) | Instrucción común del equipo (une los dos prompts originales) |
| [conciliacion-de-prompts.md](conciliacion-de-prompts.md) | Qué se tomó de cada prompt, reparto de funciones, qué se retiró por privacidad y **10 confirmaciones para Diego** |
| [tareas/flujo-de-tareas.md](tareas/flujo-de-tareas.md) | El módulo: ciclo de vida, clasificación, enrutamiento, revisiones, entrega y registro |
| [tareas/tablero-de-tareas.md](tareas/tablero-de-tareas.md) | Tareas abiertas y cerradas, carga por agente |
| [tareas/ficha-de-tarea.md](tareas/ficha-de-tarea.md) | Plantilla de cada tarea |
| [tareas/formatos.md](tareas/formatos.md) | Recordatorio, escalamiento, challenge, dictámenes ATLAS y AEGIS, Morning Brief, Command Center, memoria, ficha de reunión |
| [cartera/cartera-de-proyectos.md](cartera/cartera-de-proyectos.md) | Memoria de los 31 proyectos con Command Center |
| [memoria/decisiones-de-diego.md](memoria/decisiones-de-diego.md) | Decisiones registradas y las 3 pendientes del primer tablero |
| [memoria/reglas-aprendidas.md](memoria/reglas-aprendidas.md) | Correcciones que se vuelven regla (NAFTA, STEELA...) |
| [entregas/](entregas/) | Una carpeta por tarea con su ficha y entregable |
| `.claude/agents/ammx-*.md` | Fichas de los 13 agentes (misma estructura de 8 apartados) |
| `.claude/skills/ammx-tarea/`, `.claude/skills/ammx-brief/` | Los comandos `/ammx-tarea` y `/ammx-brief` |
| [`apps/ammx-ops/`](../apps/ammx-ops/README.md) | **AMMX Agent Operations**: la nave 3D donde se ve trabajar a los agentes, con chat, tareas, proyectos, alertas y decisiones (simulación con datos ilustrativos) |

## Notas sensibles
Notas de relación con stakeholders, juicios sobre proveedores, datos personales y cifras confidenciales **no van al repositorio**. Diego los da en la conversación cuando una tarea los necesita. En una copia local, la carpeta `equipo-ammx/privado/` está excluida de git para guardarlos.
