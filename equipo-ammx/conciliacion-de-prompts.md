# Conciliación de los dos prompts

**Mensaje clave:** los dos prompts describen el mismo equipo y el mismo propósito. Se unieron en un solo prompt maestro, se tomó el **prompt v1.0 como base** (es el más preciso sobre proyectos, reglas y equipo) y se le agregaron del **AMMX OS** los agentes NEXUS, los proyectos que faltaban, el Morning Brief, el Command Center, los permisos por nivel y los principios de seguridad y evidencia. Quedan **10 confirmaciones** para Diego (§4).

Fuentes: "Prompt maestro — Entorno multiagente de la Dirección de DO y Adquisición de Talento, v1.0, octubre 2026" (en adelante **v1.0**) y "AMMX Talent, Learning & OD AI Operating System" (en adelante **OS**).

## 1. Qué se tomó de cada uno

| Tema | v1.0 | OS | Resultado en el módulo |
|---|---|---|---|
| Principal | Diego Cardona | Francisco Cardona | **Diego Cardona** (coincide con la cuenta del usuario). Confirmación #1 |
| Coordinación | Coordinador | PMO | Un solo agente: **Coordinador — PMO** |
| Auditoría | Auditor (rúbrica de 9) | AEGIS (marco de 10) | Un solo agente: **Auditor — AEGIS**, rúbrica unificada de 12 criterios |
| Operaciones | Experto de Operaciones | ATLAS | Un solo agente: **Experto de Operaciones — ATLAS** |
| IA y datos | — | NEXUS | Se agrega **NEXUS** con ficha de la misma estructura que las demás (regla de equidad) |
| Fichas | 8 apartados iguales | Listas de responsabilidades | Se usa la estructura de 8 apartados para los 13 agentes y se suman las responsabilidades del OS |
| Proyectos | R1–R5, C1–C11, D1–D5 | 01–20 | Se conservan los IDs de v1.0; los del OS se mapean o se agregan (R6, C12–C14, D6–D7, X1–X4). Ver cartera |
| Prioridades | P1–P5 por tema | P0–P4 por urgencia | **P1–P5** ordena la cartera; la urgencia de tareas pasa a **U0–U4** para no confundir las dos escalas |
| Evidencia | Por confirmar / Ilustrativa / Probado–Piloto–Conceptual | Known / Assumption / Requires validation | **Confirmado / Supuesto / Por confirmar** + "Ilustrativa" + madurez |
| Permisos | Límites de acción (lista) | Level 1/2/3 | **N1 / N2 / N3** con la lista de v1.0 dentro de N3 |
| Cadencias | Diario, L-V, mensual, trimestral | Morning Brief, Command Center | Se integran: `/ammx-brief` con modos diario, lunes, miércoles, jueves, viernes y Command Center |
| Seguridad | Revisión de Operaciones | "AI is not the source of truth"; conocer ≠ competente ≠ autorizado | Regla 4.4 del prompt maestro |
| Idioma | Español en todo entregable | Etiquetas en inglés | Español; se conservan en inglés nombres de producto y términos técnicos |
| Autonomía | Trabajo autónomo por ciclo | "No fingir actividad autónoma" | El ciclo corre cuando Diego invoca el entorno o con una rutina que él autorice |
| Interfaz visual | — | Digital Operations Center (salas, tarjetas, actividad en vivo) | **Fuera del alcance de este módulo.** Queda como decisión (§5) |

## 2. Reparto de funciones donde los prompts no coinciden

| Agente | v1.0 | OS | Reparto aplicado |
|---|---|---|---|
| Sheccid | Reclutadora: operativas, sindicalizadas y alto volumen; experiencia del candidato | Operación del reclutamiento: screening, agenda, ATS, ofertas, reportes | **Ejecución y control del proceso + experiencia del candidato**, foco en operativas y alto volumen |
| Alondra | Reclutadora: intake con hiring managers; profesionales, técnicas y liderazgo | Sourcing y mercado de talento | **Intake + sourcing y mercado de talento**, foco en profesionales, técnicas y liderazgo |
| Emma | Diseño instruccional, onboarding, desarrollo no técnico | Especialista técnica: OJT, SOP, instrucciones de trabajo | **Diseño instruccional de todo** (incluye convertir SOP e instrucciones en material de aprendizaje y la estructura de matrices). No define contenido técnico: eso es de Uziel, ATLAS y el dueño de la operación. Confirmación #5 |
| Uziel | Técnica, seguridad y OJT | Despliegue en piso ("¿esto funciona en piso?") | **Contenido técnico y de seguridad + despliegue y validación en piso** |
| Alejandro | Datos, registros, cumplimiento, logística | Operación de capacitación: calendarios, convocatorias, evidencias | Ambos: **registros y cumplimiento + operación y logística** |
| Diana | Indicadores, plataformas, buzón | Analítica de aprendizaje | Ambos: **analítica + plataformas + buzón** |
| Maribel | Sucesión, liderazgo, cultura, reconocimiento, IA en RH | + desempeño, eGEDP, Peakon, People Analytics | Se suman las del OS |
| Enrique | Estrategia y proceso; R1, R4, R5 | + analítica, presupuesto, gobierno, internacionales, practicantes | Se suman las del OS |

## 3. Qué se retiró por privacidad (repositorio público)
Por instrucción de Diego (2026-10-07) el módulo se publica **sin notas sensibles**. Se retiraron:
- Notas de relación y contexto político sobre stakeholders (en la tabla de personas clave solo quedan rol y cómo preparar material).
- Observaciones y orden de preferencia sobre proveedores de la lista corta del Learning Campus (C8).
- Nombres de personas destinatarias de correos internos (R1).
- La dirección completa del buzón de Capacitación.

Esas notas no se pierden: Diego las conserva fuera del repositorio y las da a los agentes en la conversación cuando una tarea las necesite (regla 4.7).

## 4. Confirmaciones para Diego (máximo 10, agrupadas)

| # | Tema | Pregunta | Propuesta del equipo |
|---|---|---|---|
| 1 | Identidad | El OS nombra como principal a "Francisco Cardona"; v1.0 a "Diego Cardona" (y usa "Francisco Cardona" para otra persona en un proyecto). ¿El principal eres tú, Diego? | Sí: Diego. Se corrigió en todo el módulo |
| 2 | Alcance de sitios | El OS agrega Monterrey. ¿Entra en el alcance de la dirección? | Mantener LZC, Mina y Celaya/Pachuca hasta que confirmes |
| 3 | Sistemas | ¿Oracle MyHR es el nombre interno de Oracle Cloud HCM? ¿Siguen vigentes AM/GO, APLI, Korn Ferry, SHL y Peakon? | Tratar MyHR = Oracle Cloud HCM |
| 4 | Proveedor del diplomado (C5) | ¿"Pabelon Academy" o "Pavillion"? | No usar el nombre en entregables hasta confirmar |
| 5 | Emma y Uziel | ¿Apruebas el reparto: Emma = diseño instruccional (incluye instrucciones de trabajo como material); Uziel = contenido técnico, seguridad y despliegue en piso? | Aprobar |
| 6 | Dueños de proyectos nuevos | Dueños propuestos: C12 Academias → Alex; C13 Observaciones de Oro 2.0 → Uziel + Maribel; C14 LSGR → Uziel; D6 Lean Six Sigma → Maribel; X1 Plataforma de conocimiento → Alex; X2 Inmersivo 3D → Emma; X3 Habilidades digitales → Maribel | Aprobar o reasignar |
| 7 | Cifras históricas | ¿Fuente y vigencia de: ~200 contrataciones/año; Learning Week ~3,989 participantes y 4.8/5 (¿qué edición?); supervisores formados; LSS 15/22/99? | Usarlas solo como "Ilustrativa" hasta tener fuente |
| 8 | Términos | ¿Qué es LSGR? ¿Qué es SISSMAC? ¿"3A" en Círculos de Calidad es A3? | — |
| 9 | Fechas críticas | Fechas de: revisión NAFTA, comité de gobierno de SAFETS, respuesta esperada de Fernando | Recordatorio 5 días hábiles antes de cada una |
| 10 | Observaciones de Oro | v1.0 la trata como reconocimiento mensual (D3); el OS la rediseña como programa de observación conductual separado del reconocimiento (C13). ¿Cuál vale? | Separar observación (C13) y reconocimiento (D3), como propone el OS |

## 5. Decisiones abiertas sobre el módulo
| Tema | Opciones | Recomendación |
|---|---|---|
| Interfaz visual (Digital Operations Center del OS) | A) Quedarse en Claude Code con comandos y archivos · B) Construir una página web de Command Center que lea el tablero · C) Construir el entorno completo con salas y tarjetas de agentes | **A** durante 4 semanas para probar el flujo; luego B si el tablero se usa a diario. C no se justifica sin uso probado |
| Cadencias automáticas | A) Diego invoca `/ammx-brief` · B) Rutina programada (lunes, jueves y viernes) que deja el brief listo | **A** las primeras 2 semanas; B cuando el tablero tenga fechas reales |
