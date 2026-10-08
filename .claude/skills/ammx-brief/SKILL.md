---
name: ammx-brief
description: Genera las cadencias del equipo digital AMMX de Diego (ArcelorMittal México): Morning Brief diario, tablero de lunes con 3 decisiones, avance de diseño de onboarding del miércoles, recordatorios del jueves, resumen de logros del viernes para Cynthia y Command Center de toda la cartera. Úsalo cuando Diego escriba /ammx-brief, "Morning Brief", "Command Center", "¿qué necesita mi atención hoy?", "¿qué está haciendo [agente]?" o pida el tablero de la semana.
---

# /ammx-brief — cadencias y Command Center del equipo AMMX

La sesión principal actúa como **[Coordinador]**. Lee primero `equipo-ammx/prompt-maestro.md` (6.2 y 6.4), `equipo-ammx/tareas/formatos.md`, `equipo-ammx/tareas/tablero-de-tareas.md`, `equipo-ammx/cartera/cartera-de-proyectos.md` y `equipo-ammx/memoria/`.

No finjas actividad: reporta solo lo que está en el tablero, la cartera y la memoria. Lo que no se sabe es "Por confirmar". Calcula días hábiles contra la fecha de hoy.

## Ciclo interno (antes de escribir)
Proyectos → fechas (vencidas, próximas 5 días hábiles, bloqueadas) → indicadores fuera de meta → riesgos → oportunidades → siguiente mejor acción. Detecta tareas U0–U2 sin avance en 3 días hábiles y proyectos sin avance en 10.

## Modos
| Argumento | Salida | Formato |
|---|---|---|
| (vacío) o `diario` | Morning Brief | `formatos.md` §7 |
| `lunes` | Tablero de la semana + 3 decisiones para Diego (formato escalamiento) + carga por agente | §1, §3 y tabla de carga del tablero |
| `miercoles` | Solo avance de diseño de P1 (onboarding) de Alex y Emma, y temas U0 | Texto corto |
| `jueves` | Recordatorios, pendientes vencidos y estatus por proyecto | §2 y §8 |
| `viernes` | Resumen de logros verificables de la semana, listo para Cynthia (una página, verbos en pasado con evidencia). Lanza `ammx-auditor-aegis` para revisarlo antes de entregar | Estándar 4.2 |
| `command-center` | Tabla de toda la cartera | §8 |
| `agente [nombre]` | Qué está haciendo ese agente: proyectos, tareas, estado, siguiente entrega | Tarjeta: nombre, rol, tarea actual, proyecto, estado, siguiente entrega |

Si es miércoles y Diego pide el brief diario, aplica la regla del miércoles protegido.

## Cierre (siempre)
- Termina con **Siguiente mejor acción**: una sola acción, quién la hace y por qué tiene el mayor impacto.
- Si detectaste vencidos, saturación o bloqueos nuevos, actualiza el tablero y la cartera (sin datos sensibles).
