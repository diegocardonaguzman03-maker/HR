# Acería (Steelmaking) — Roles, Descripciones de Puesto y Manuales de Procesos Críticos

**Complejo Acería Norte · EAF-1/EAF-2 · Horno Olla LF-1/LF-2 · Colada Continua 1 (planchón) · Colada Continua 2 (palanquilla)**

> **Estado: Borrador para validación (v0.1).** Los elaboró el equipo del Director de C&D (agentes expertos y gerencias) y tienen revisión cruzada técnica, de seguridad y laboral. **Antes de usarlos en planta** deben validarlos Ingeniería de Proceso (C-07, C-08), Mantenimiento (C-10), SSO (C-16) y los fabricantes (OEM) en todos los valores marcados **[Validar con OEM]** o **[Supuesto]**. Después los aprueba el Director. Los PDF son **copias no controladas**; la versión vigente es la del repositorio.

## 1. Qué contiene

| Paquete | Contenido | Documentos |
|---|---|---|
| **Roles, funciones y tareas** | Catálogo de roles y procesos, 26 descripciones de puesto sindicalizadas (963 plazas), 17 de confianza (60 plazas), organigrama, dotación por turno, escalafón y matrices rol × proceso | 5 |
| **Manuales operativos y técnicos** | Ficha técnica, 29 manuales de operación (8 EAF, 3 ollas/LF, 9 CC1, 9 CC2), 10 de mantenimiento crítico, 10 de seguridad crítica, índices y reportes de revisión | ≈ 56 |

## 2. Base común
| Documento | Para qué sirve |
|---|---|
| [Ficha técnica FT-ACE-001](00-ficha-tecnica-acería.md) | Fuente única de parámetros técnicos (v0.3) |
| [Catálogo de procesos y roles CAT-ACE-001](00-catalogo-procesos-y-roles.md) | Códigos de los 43 roles y los 49 procesos críticos |
| [Guía de estilo y plantillas](00-guia-de-estilo-y-plantillas.md) | Estructura de 13 secciones de los manuales y de las descripciones de puesto |

## 3. Organización (`01-organizacion/`)
- [Organigrama de la Acería](01-organizacion/organigrama-acería.md): estructura, turno típico (7 mandos y 159 sindicalizados en planta) y tramos de control.
- [Descripciones de puesto — sindicalizados (S-01 a S-26)](01-organizacion/descripciones-puesto-sindicalizados.md)
- [Descripciones de puesto — confianza (C-01 a C-17)](01-organizacion/descripciones-puesto-confianza.md)

## 4. Manuales
| Serie | Índice | Procesos |
|---|---|---|
| Operación EAF y Ollas/LF | [02-operacion/eaf](02-operacion/eaf/README.md) | MO-EAF-01…08, MO-OLL-01/02, MO-LF-01 |
| Operación CC1 (planchón) | [02-operacion/cc1](02-operacion/cc1/README.md) | MO-CC1-01…09 |
| Operación CC2 (palanquilla) | [02-operacion/cc2](02-operacion/cc2/README.md) | MO-CC2-01…09 |
| Mantenimiento crítico | [03-mantenimiento](03-mantenimiento/README.md) | MM-EAF-01…04, MM-OLL-01, MM-CC-01…04, MM-GR-01 + plan maestro |
| Seguridad crítica | [04-seguridad](04-seguridad/README.md) | MS-ACE-01…10 + Reglas que Salvan Vidas |

Cada manual contiene: control documental, roles (R/A/C/I), descripción con figura técnica (SVG) y diagrama de flujo, equipos y maquinaria, parámetros (objetivo, rango, alarma, acción), seguridad (peligros, controles críticos, EPP, LOTO), calidad, **procedimiento paso a paso con pasos críticos ★**, condiciones anormales, registros, **competencia y certificación (TD-P07)**, referencias y control de cambios.

## 4b. Capacitación e instrucciones de trabajo
| Serie | Índice | Contenido |
|---|---|---|
| Presentaciones de capacitación (estándar AMMX) | [05-capacitacion](05-capacitacion/README.md) | 49 carpetas, una por proceso crítico: `contenido.json` (fuente), presentación `.pptx` AMMX (18 láminas) y guía del instructor (`.md` y `.pdf`) con plan de sesión, evaluación y checklist de certificación. Validadas por los expertos técnico, de seguridad, laboral y de documentación (ver `VALIDACION-*.md`) |
| Instrucciones de trabajo por rol | [06-instrucciones-trabajo](06-instrucciones-trabajo/README.md) | 30 IT (S-01 a S-26, C-04, C-05, C-06, C-17), fáciles y paso a paso, con figura del puesto, diagramas de turno y de tarea, recuadros ALTO y checklist de controles críticos; PDF en `06-instrucciones-trabajo/pdf/` |

## 5. Uso para capacitación (Academia GASM)
- Cada manual es el **contenido base** del curso del proceso y de la **evaluación de certificación**. La lista de pasos ★ de la sección 11 se convierte en el checklist de `templates/critical-task-certification-checklist.md`.
- Las descripciones de puesto definen la **ruta de formación por rol** y la liga con el escalafón.
- Responsables: Célula de Servicio (sind.), con TD-10 y los coordinadores TD-C-ACN-01…05, y Célula de Procesos, con TD-15 (DC-3).

## 6. Correcciones técnicas hechas durante la elaboración
| Versión de la ficha | Corrección | Detectada por |
|---|---|---|
| v0.2 | Buza calibrada de CC2 de 15–17 mm → **20–24 mm** para 160 × 160 mm (balance de masa) | Agente de CC2 |
| v0.2 | Grúas de producto de 25 t → **45 t con tenaza** (planchón de hasta 32.8 t) | Agente de CC1 |
| v0.2 | HSLA marcado como grado **peritéctico** | Agente de CC1 |
| v0.3 | Energía del EAF coherente con el transformador (≈ 119 MW activos) y tasa de DRI de 3.5–4.3 t/min | Agente de EAF |

## 7. Decisiones pendientes del Director
Consolidadas de los reportes de los agentes y de las revisiones cruzadas (ver `REVISION-*.md` en cada carpeta):
1. **Uso de los manuales:** liberar como material de capacitación teórica mientras Ingeniería valida los valores marcados (recomendado, 30–60 días) o esperar la validación completa.
2. **Catálogo:** crear el rol S-27 Operador de Grúa de CC y Producto, el C-18 Supervisor de Mantenimiento de Turno, y asignar el escarpeo y el dueño único de MS-ACE-03 (ver CAT-ACE-001 §3).
3. **Tramo de control del supervisor del EAF** (≈ 35 por turno): crear un segundo C-05 de EAF por turno o aceptar el tramo con apoyo técnico (sin mando) de los S-01. Por el art. 9 de la LFT, un sindicalizado no puede tener funciones de mando.
4. **Seguridad:** umbral de evacuación por CO (200 ppm o 50 ppm), frecuencia de simulacros y restricción de dosis de radiación.
5. **Laboral:** liga entre certificación y escalafón (negociación con el sindicato y la CMCAP) y el efecto de una jornada de 40 h en el rol 4x4.
