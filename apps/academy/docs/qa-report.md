# Informe de QA — ACERÍA DIGITAL ACADEMY (MVP 0.1)

**Mensaje clave:** todo está en verde: **116 pruebas unitarias y de componentes**, **13/13 pruebas e2e** en Chromium real sobre el build de producción, typecheck estricto y validación de contenido sin errores. Además, el asistente se probó con **44 preguntas trampa** de Seguridad y más de 25 casos propios. La liberación depende de la re-revisión de Seguridad (veto) y de las decisiones del Director (§5).
Fecha: 2026-10-05.

## 1. Comandos y resultado
| Verificación | Comando | Resultado |
|---|---|---|
| Contenido (esquema, referencias, nodos 3D, PLANT_APPROVED bloqueado, marcas SME vacías) | `npm run check:content` | ✓ 6 etapas · 15 equipos · 12 peligros · 15 hotspots · 1 WI · 3 módulos · 23 preguntas · 4 documentos · 1 video · 215 campos SME_REQUIRED |
| Tipos | `npm run typecheck` | ✓ 0 errores (TS strict) |
| Unitarias y componentes | `npm test` | ✓ 116/116 |
| e2e | `npm run build && npm run e2e` | ✓ 13/13 |
| Build | `npm run build` / `npm run build:web` | ✓ |

## 2. Cobertura de los casos que exige el encargo
| Caso | Unit/componente | e2e |
|---|---|---|
| Arranque (aviso permanente, carga real del modelo) | `app.test.tsx` › arranque; ErrorBoundary sin WebGL | arranque |
| Navegación (equipos, 9 pestañas, mapa del proceso, teclado) | navegación y equipos | cambio de modo y enlaces profundos |
| Apertura de hotspot | (la escena se simula en jsdom) | hotspot 3D abre el panel; clic directo en el modelo; teclado sobre el hotspot |
| Descarga de documento | biblioteca: atributo `download` y href | descarga real: cabecera `%PDF-` y nombre de archivo |
| Cambio de modo | cinco modos; la selección se limpia | cambio de modo |
| Progresión de pasos de formación | lecciones hasta completar; EJECUTAR con ALTO | lecciones con resaltado 3D; EJECUTAR paso a paso |
| Evaluación completa | todas correctas; falla una crítica → no aprueba; «no certifica competencia» | evaluación completa con preguntas críticas ▲ |
| Seguridad del asistente | 44 preguntas trampa + bypass + legítimas + sin cifras de borrador | cita, sin fuente, dato de planta, bypass |
| Accesibilidad | pestañas con flechas; modal con Esc y foco | nombres accesibles, landmarks, teclado, móvil 390 px sin desborde, video (foco y Espacio) |

Capturas: `tests/e2e/shots/`.

## 3. Defectos encontrados por las revisiones y estado
| Origen | CRITICAL | HIGH | Estado |
|---|---|---|---|
| Seguridad + red team de seguridad (`review-seguridad.md`) | 1 | 5 | Corregidos. Re-revisión de ADX-04 en §8 de ese documento |
| Metalurgia y Operaciones (`review-metalurgia-operaciones.md`) | 0 | 1 (EBT a 90° de la puerta) | Corregido (opción A, que debe confirmar el Director) |
| Formación (`review-formacion.md`) | 0 | 7 | Corregidos. Re-revisión en ese documento |
| Red team técnico: UX, software y rendimiento (`red-team-tecnico.md`) | 2 | 11 | Corregidos los CRITICAL y los HIGH prácticos. Lo que sigue abierto está en el §4 |

## 4. Riesgos y pendientes conocidos
| # | Descripción | Severidad | Plan |
|---|---|---|---|
| Q1 | El filtro de seguridad del asistente es conservador: bloquea algunas preguntas educativas («¿por qué no debo pasar debajo de una carga suspendida?») y manda a «detente y avisa» cualquier pregunta con «fuga» | LOW (falla hacia el lado seguro) | Ajustar en la fase 2 con preguntas reales del piloto |
| Q2 | FPS no medido en hardware real (el contenedor no tiene GPU) | MEDIUM | Medirlo en el piloto (`performance-report.md` §5) |
| Q3 | Los textos de no uso para escalafón y de registro (TRN-03/12) no tienen el visto bueno de Relaciones Laborales ni de Jurídico | MEDIUM | Decisión del Director |
| Q4 | Todo el contenido es DEMO, educativo o borrador; hay 215 datos de planta pendientes | Por diseño | Taller SME (F2-01) |
