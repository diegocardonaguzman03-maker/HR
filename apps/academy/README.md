# ACERÍA DIGITAL ACADEMY — Horno de arco eléctrico (módulo inicial)

Entorno web interactivo de aprendizaje sobre el **horno de arco eléctrico (EAF)** de GASM. Tiene un modelo 3D con 15 hotspots, fichas de 9 pestañas por equipo, el mapa del proceso, los modos **EXPLORAR · APRENDER · EJECUTAR · EVALUAR**, una biblioteca de documentos y videos y el asistente **Pregunta a Acería AI**, que solo responde con citas.

> **Aviso de seguridad.** Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad. **La plataforma no certifica competencia.** Ningún contenido de esta versión está aprobado por planta. Los datos de planta aparecen como `SME_REQUIRED` o `PLACEHOLDER — REQUIRES PLANT VALIDATION`.

## Uso rápido
```bash
cd apps/academy
npm install
npm run dev          # http://localhost:5173
npm run build        # valida contenido + typecheck + dist/
npm run build:web    # web/index.html autocontenido (+ documents/, videos/, images/)
```

## Comandos
| Comando | Qué hace |
|---|---|
| `npm run check:content` | Valida el JSON con zod, las referencias cruzadas, los nodos 3D y la regla «nada PLANT_APPROVED sin firma» |
| `npm run typecheck` | TypeScript estricto |
| `npm test` | Pruebas unitarias y de componentes (Vitest + Testing Library) |
| `npm run e2e` | Pruebas e2e en Chromium real sobre `dist/` (requiere `npm run build`) |
| `npm run model` | Regenera `src/assets/eaf.glb` y `public/models/eaf.nodes.json` |
| `npm run docs:pdf` | Regenera los PDF de `public/documents/` desde el contenido |
| `npm run media` | Captura imágenes y el video placeholder desde la escena (requiere `dist/`) |

## Qué incluye el MVP
| Pieza | Dónde |
|---|---|
| Una etapa de proceso: **03 Fusión** (más las otras 5 en el mapa) | `src/content/processes.json` |
| Un sistema principal: **electrodos** (electrodos, brazos y mástiles, transformador, circuito secundario) dentro de 15 equipos | `equipment.json` |
| Una instrucción: **revisión del sistema de electrodos antes de reanudar la fusión** (DEMO) | `work-instructions.json` y modo EJECUTAR |
| Un módulo de seguridad: **energía eléctrica, energía almacenada y metal líquido** | `training.json` |
| Un módulo de formación y una evaluación de 10 preguntas (incluye identificar en 3D) | `training.json`, `questions.json`, `assessments.json` |
| Un video placeholder con capítulos y subtítulos | `public/videos/` |
| Documentos descargables: WI, job aid y 2 guías (PDF) | `public/documents/` |
| Una experiencia de IA: recuperación local con citas y negativas | `src/lib/assistant/` |

## Documentación
| Documento | Contenido |
|---|---|
| `docs/00-plan-maestro.md` | Secciones A–J: producto, agentes, viaje del usuario, IA, diseño, stack, 3D, MVP, carpetas, backlog |
| `docs/architecture.md` | Arquitectura del sistema, flujo de datos, integración futura y escalabilidad |
| `docs/content-schema.md` | Modelo de contenido y catálogo de IDs |
| `docs/design-system.md` | Tokens, componentes y reglas de seguridad visual |
| `docs/3d-asset-guidelines.md` + `docs/nodos-3d.md` | Pipeline 3D, contrato de nodos y presupuestos |
| `docs/templates/*` | Plantillas de etapa de proceso, equipo, módulo de seguridad, instrucción de trabajo y módulo de formación |
| `docs/safety-review.md` | Revisión de seguridad (ADX-04, veto) |
| `docs/reviews/*` | Revisión multidisciplinaria y red team |
| `docs/validation-checklist.md` | Lista de verificación del Validation Board |
| `docs/qa-report.md` · `docs/performance-report.md` | Resultados de pruebas y rendimiento |
| `docs/backlog-fase-2.md` | Siguiente fase |

## Cómo agregar contenido
Edita `src/content/*.json` siguiendo `docs/content-schema.md` y las plantillas. Luego corre `npm run check:content`. Los datos de planta solo se capturan desde procedimientos aprobados y con las firmas de Seguridad y Operaciones (`docs/validation-checklist.md`).

## Privacidad
La analítica es local, anónima y solo registra eventos de aprendizaje. No guarda movimientos, tecleo ni el texto de las preguntas al asistente. Se puede desactivar con `localStorage['adx.analytics']='off'` y está lista para exportarse como xAPI a un LRS cuando la empresa lo apruebe.
