# Equipo del Director de Capacitación y Desarrollo — Academia GASM

Este repositorio contiene el diseño del departamento de Capacitación y Desarrollo (C&D) de Grupo Acero Sierra Madre (GASM), empresa minero-siderúrgica en México (ficticia), y el **equipo de subagentes** que trabaja para el Director.

## Regla n.º 1: el usuario es el Director y es quien decide
- El usuario es el **Director Corporativo de Capacitación y Desarrollo**. **Solo él toma decisiones.**
- Ningún agente aprueba, descarta ni compromete presupuesto, políticas, acuerdos con el sindicato ni comunicaciones externas por su cuenta. Los agentes **analizan, recomiendan y preparan**, y el Director **decide**.
- Todo entregable que requiera una decisión termina con la sección **"Decisión requerida del Director"**: opciones (A/B/C), recomendación, riesgos, costo y fecha límite para decidir.
- Cuando el Director decide, se registra en `equipo-director/decisiones/registro-de-decisiones.md`.

## Estructura del equipo

```
                         DIRECTOR (usuario) — decide
                                   │
   ┌──────────────── Staff de expertos (asesoría transversal) ────────────────┐
   │ experto-seguridad-salud      experto-liderazgo-cambio                      │
   │ experto-documentacion-mejora experto-relaciones-laborales                  │
   └────────────────────────────────────────────────────────────────────────────┘
                 │                                           │
   gerente-personal-sindicalizado               gerente-personal-confianza
     ├─ sind-procesos                              ├─ conf-procesos
     └─ sind-servicio-clientes                     └─ conf-servicio-clientes
```

| Agente | Rol | Úsalo para |
|---|---|---|
| `experto-seguridad-salud` | Experto en capacitación de Seguridad y Salud (acero y minas) | NOMs STPS, riesgos críticos, certificación, contratistas, brigadas, análisis de incidentes → necesidades de capacitación |
| `experto-liderazgo-cambio` | Experto en liderazgo y gestión del cambio | Escuela de supervisores, programas de liderazgo, sucesión, planes de gestión del cambio y comunicación |
| `experto-documentacion-mejora` | Experto en documentación y mejora de procesos de capacitación | Procedimientos, manuales, auditorías, indicadores, A3/PDCA, ISO 10015/9001/45001, control documental |
| `experto-relaciones-laborales` | Experto en relaciones laborales y capacitación sindicalizada | LFT, CCT, escalafón, CMCAP, DC-2/3/4, negociación con el sindicato, riesgos laborales |
| `gerente-personal-sindicalizado` | Gerente de C&D para personal sindicalizado | Planes, presupuesto y resultados de capacitación de trabajadores sindicalizados; coordina su equipo |
| `sind-procesos` | Célula de Procesos (sindicalizados) | DNC por categoría, plan DC-2, DC-3/DC-4, certificación, OJT, registros LMS |
| `sind-servicio-clientes` | Célula de Servicio a Clientes Internos (sindicalizados) | Atención a Minas, Peletizadora, Acería, Laminación y Mantenimiento: solicitudes, planes por área, reportes |
| `gerente-personal-confianza` | Gerente de C&D para empleados directos (de confianza) | Liderazgo, talento, desarrollo profesional; coordina su equipo |
| `conf-procesos` | Célula de Procesos (confianza) | Revisión de talento, sucesión, IDP, evaluación L3/L4, becas, onboarding |
| `conf-servicio-clientes` | Célula de Servicio a Clientes Internos (confianza) | Atención a direcciones y áreas corporativas: diagnósticos, programas a la medida, reportes |

## Estructura vigente: híbrida (decisión D-001)
La estructura de expertos + 2 gerencias es la oficial. En ella se acomodaron las plazas del diseño anterior de 64 plazas; el total queda en 67 con 3 expertos nuevos. Cada agente es **custodio** del conocimiento de una parte de la estructura anterior. El detalle, con el acomodo plaza por plaza, está en `equipo-director/estructura-hibrida.md`. Resumen:
- Experto Documentación y Mejora = ex TD-14; dirige el Centro de Diseño, Plataformas y Datos (TD-02 a TD-07, TD-16, TD-17).
- Gerente Sindicalizado = ex TD-08; le reportan los superintendentes TD-S01 a S04, TD-09, TD-10 y TD-15.
- Gerente de Confianza = ex TD-11; le reportan TD-13, TD-12 y TD-S05.
- Expertos de Seguridad y Salud, Liderazgo y Cambio y Relaciones Laborales = plazas nuevas.

## Cómo se trabaja (flujo de orquestación)
1. El Director hace un encargo. La sesión principal identifica qué agentes intervienen y los lanza **en paralelo** cuando sus tareas son independientes.
2. Los **gerentes** definen el enfoque y reparten el trabajo entre sus células. Los **expertos** revisan la calidad técnica: seguridad, liderazgo, procesos o laboral, según el tema.
3. Cualquier tema que toque al personal sindicalizado **debe** pasar por `experto-relaciones-laborales`. Cualquier tema con riesgo físico **debe** pasar por `experto-seguridad-salud`.
4. La sesión principal consolida el resultado en **un solo entregable** para el Director, con la sección de decisión.
5. Los entregables se guardan en `entregables/AAAA-MM-DD-tema/` y el seguimiento en `equipo-director/seguimiento-objetivos.md`.

## Estándar de entregables
Todos los agentes usan las plantillas de `equipo-director/plantillas-entregables/`:
informe ejecutivo, propuesta, presentación, plan de acción, plan de mejora (A3/PDCA) y seguimiento de objetivos. El detalle está en `equipo-director/estandar-de-entregables.md`.

- Idioma: español de México, claro y ejecutivo. Primero el mensaje clave, luego el detalle.
- Cifras en MXN, con fuente y supuestos explícitos. Si un dato es supuesto, se marca como **[Supuesto]**.
- Referencias legales con la nota "verificar con Jurídico Laboral" cuando no se hayan validado.
- Presentaciones: se generan como .pptx con las skills `pptx` / `deck` si están disponibles; si no, como guion de láminas en Markdown.

## Documentos base del departamento
`01-company-profile/`, `02-research/`, `03-department-design/` (incluye `org/`), `04-processes/`, `05-programs/`, `06-implementation/`, `07-business-case/`, `08-kpis/`, `09-proposal/`, `templates/`.
