# ACERÍA DIGITAL ACADEMY — Plan maestro

**Módulo inicial:** Horno de Arco Eléctrico — Entorno Interactivo de Aprendizaje
**Dueño:** ADX-01 Product Director · **Estado:** MVP en construcción · **Fecha:** 2026-10-05

> Este entorno de capacitación apoya el aprendizaje y no reemplaza los procedimientos de operación aprobados, las instrucciones de trabajo, los permisos, la supervisión ni los requisitos de seguridad.

## 0. Principio rector del contenido
| Etiqueta | Significado | Cómo se muestra |
|---|---|---|
| `GENERAL_EDUCATIONAL` | Conocimiento general de la industria del EAF; no describe a la planta | Insignia gris «Contenido educativo general» |
| `DEMO` | Contenido de demostración para mostrar el producto | Insignia azul «DEMO» |
| `SME_REQUIRED` | El dato debe darlo un experto de planta con un documento aprobado | Campo con borde ámbar «SME_REQUIRED — requiere validación de planta» |
| `DRAFT_NOT_VALIDATED` | Borrador interno (p. ej., manuales de `10-plantas/`) | Insignia roja «Borrador no validado» |
| `PLANT_APPROVED` | Aprobado por el Industrial Validation Board con documento de planta | Insignia verde con dueño, versión y fecha |

**Hoy no existe contenido `PLANT_APPROVED`.** Ningún límite, setpoint, temperatura, presión, adición, paso de LOTO, enclavamiento o secuencia crítica se inventa. Se muestra como `SME_REQUIRED`.

Contexto de GASM (D-010): el EAF se carga con ≈ 95–100 % de DRI de pelet propio (HYL y Midrex, por bandas directas) más retornos internos ≤ 5 %; no hay chatarra comprada. La etapa «Carga» del proceso genérico se adapta a «Carga de DRI y retornos».

---

## A. Arquitectura de producto
```
┌──────────────────────────── Shell de la aplicación ────────────────────────────┐
│ Barra superior: marca · ruta (EAF › Fusión) · modo EXPLORAR/APRENDER/EJECUTAR/   │
│ EVALUAR · progreso · biblioteca · calidad gráfica · aviso permanente            │
├──────────────┬──────────────────────────────────────────┬────────────────────────┤
│ Mapa de      │ Escena 3D (R3F)                           │ Panel de información   │
│ proceso      │  · modelo GLB por nodos con IDs           │  (pestañas por equipo) │
│ (colapsable) │  · hotspots · foco · aislar · rayos X ·    │  Resumen · Operación · │
│              │    corte · explosionado · tour guiado      │  Componentes · Seguri- │
│              │                                           │  dad · Controles · ... │
├──────────────┴──────────────────────────────────────────┴────────────────────────┤
│ «Pregunta a Acería AI…» (contexto: módulo, etapa, equipo, hotspot, paso)          │
└──────────────────────────────────────────────────────────────────────────────────┘
```
| Módulo | Responsabilidad | Depende de |
|---|---|---|
| `content/` | JSON validados por esquema (procesos, equipos, peligros, entrenamiento, hotspots, documentos, videos, evaluación) | — |
| `lib/content` | Carga, valida (zod) e indexa el contenido; resuelve referencias por ID | content |
| `components/3d` | Escena, modelo, hotspots, cámara, modos de vista, calidad | lib/content (solo IDs) |
| `components/training` | Motores de Aprender, Ejecutar y Evaluar | lib/content, stores |
| `components/library` | Biblioteca, visor de documentos, reproductor de video | lib/content |
| `lib/assistant` | Recuperación local + proveedor de respuesta; nunca sin fuente | lib/content |
| `lib/analytics` | Bus de eventos de aprendizaje → almacenamiento local + adaptador xAPI | stores |
| `stores` | Estado de UI, selección, modo, progreso (zustand) | — |

## B. Plan de agentes
| Fase | Agentes | Entregable |
|---|---|---|
| 1–3 Problema, producto, información | 01, 08, 07 | Este plan (A–J) |
| 4–5 UX y sistema de diseño | 08, 10 | `design-system.md`, tokens en `src/styles` |
| 6 Esquemas de contenido | 11, 06, 07 | `content-schema.md`, `src/types/content.ts`, `src/lib/content/schema.ts` |
| Contenido | 02 + 03 (proceso y tareas), 04 (peligros, VETO), 05 (equipos), 06 (WI y job aid), 07 (aprendizaje y evaluación) | `src/content/*.json` |
| 7 Arquitectura 3D | 09, 10 | `3d-asset-guidelines.md`, `scripts/build-eaf-glb.mjs`, `public/models/eaf.glb` |
| 8–13 Implementación | 10, 11, 12 (con la sesión principal) | App |
| 14–15 Rendimiento y pruebas | 13 | `qa-report.md`, `performance-report.md`, pruebas |
| 16 Revisión multidisciplinaria | 14 (con 02, 03, 04, 07) | `validation-checklist.md` (tabla de validación) |
| Red team | adx-red-ux, adx-red-software, adx-red-safety, adx-red-performance | Hallazgos CRITICAL/HIGH/MEDIUM/LOW |
| 17–18 Corrección y build final | 01 decide; 10/11 corrigen; 13 re-prueba | Liberación |

**Revisión cruzada:** el metalurgista revisa el contenido operativo; el operador cuestiona la teoría poco práctica; Seguridad revisa lo que propone el operador (VETO); L&D convierte lo aprobado en aprendizaje; UX simplifica lo que presenta L&D; WebGL cuestiona las interacciones caras; el artista técnico optimiza; QA cuestiona todo; el Product Director arbitra.

## C. Viaje del usuario (nuevo ingreso, primer día)
1. **Inicio:** «ACERÍA DIGITAL ACADEMY». Una tarjeta destacada: *Horno de Arco Eléctrico — Entorno Interactivo*, con «Empieza aquí» y la duración estimada. Aviso de uso visible.
2. **Orientación (≤ 30 s):** tres pistas sobre la escena: gira y acércate · los puntos numerados se pueden tocar · el mapa de proceso te guía.
3. **EXPLORAR:** gira el horno, toca «03 Electrodos» y se abre el panel con sus pestañas. Prueba rayos X o «ocultar estructura».
4. **APRENDER:** elige «02 Fusión». La cámara viaja, se resaltan los equipos, corre la animación y aparece la explicación paso a paso. Al final, un control de conocimiento de 2 preguntas.
5. **EJECUTAR:** abre el job aid «Revisión del sistema de electrodos (DEMO)», marca los pasos revisados y descarga la instrucción detallada en PDF. Todo indica que es DEMO / no validado.
6. **EVALUAR:** identifica componentes en 3D, ordena la secuencia, elige peligro y control y responde un escenario. Recibe puntaje, fortalezas, brechas y módulos recomendados.
7. **Pregunta a Acería AI:** «¿Qué peligros hay aquí?». Responde con citas de las fuentes autorizadas del panel; si no hay fuente, lo dice.
8. **Biblioteca:** filtra por proceso, equipo, tipo, rol o módulo; previsualiza y descarga.

Cualquier contenido está a ≤ 3 interacciones desde la escena.

## D. Arquitectura de información
- **Navegación global:** Inicio · Módulo EAF · Biblioteca · Mi progreso.
- **Dentro del módulo:** Modo (Explorar / Aprender / Ejecutar / Evaluar) · Mapa de proceso (Recepción de DRI y retornos → Carga y pie líquido → Fusión → Afino → Vaciado → Metalurgia secundaria) · Escena · Panel de información.
- **Pestañas del equipo:** Resumen · Operación · Componentes · Seguridad · Controles · Mantenimiento · Entrenamiento · Documentos · Videos.
- **Objetos de contenido:** Proceso/Etapa · Equipo · Componente · Peligro · Control · Hotspot · Tarea/WI · Módulo de aprendizaje · Pregunta · Documento · Video. Todo se referencia por ID estable (`eaf.electrode-system`, `haz.eaf.electrical-arc`, …).
- **Estado de validación** en cada objeto (ver §0).

## E. Sistema de diseño (propuesta; detalle en `design-system.md`)
- **Fondo grafito profundo**, paneles de vidrio mate, bordes finos de 1 px y profundidad sutil. Primero oscuro; alto contraste opcional.
- **Paleta:**
  - `--bg` #0C0E11 · `--surface` #14171C · `--surface-2` #1B1F25 · `--line` #2A3039
  - `--text` #E9E7E2 (blanco hueso) · `--muted` #98A0AA · `--steel` #A9B6C3
  - Un solo acento, **ámbar de colada** #E8A33D, para la selección y el progreso.
  - **Colores semánticos de seguridad:** peligro #E5484D · advertencia #F2C230 (amarillo ISO) · obligatorio #3E8EDE (azul ISO) · seguro #34B37E.
  - **Estado de validación:** DEMO #6E8BB0 · SME_REQUIRED #E8A33D · no validado #E5484D · aprobado #34B37E.
- **Tipografía:**
  - IBM Plex Sans para la interfaz, con estética de software de ingeniería;
  - IBM Plex Mono para códigos, IDs y valores.
  - Escala: 11 / 12 / 13 / 15 / 18 / 24 / 32.
- **Espaciado** con base de 4 px; radios de 2–6 px.
- **Componentes:** barra superior, riel de proceso, panel con pestañas, hotspot (punto numerado con pulso suave y anillo de estado), tooltip, modal, toasts, chips de estado, barra de progreso, formularios, estados de carga, vacío y error.
- **Movimiento:** foco de cámara suave de 0.6–1 s, transición de panel de 150–200 ms y pulso de hotspot; se respeta `prefers-reduced-motion`.

## F. Decisión de stack técnico
| Capa | Elección | Motivo |
|---|---|---|
| App | **Vite + React 18 + TypeScript estricto** | SPA estática que se publica en un artifact, en GitHub Pages o en una intranet; no necesita SSR; ya está probada en `apps/steel-twin` |
| 3D | three + @react-three/fiber + drei + postprocessing | Ecosistema maduro; ya está validado en el gemelo |
| Estado | zustand | Ligero, sin boilerplate |
| Estilos | Tailwind v4 + tokens CSS | Tokens del sistema de diseño en un solo lugar |
| Contenido | JSON + **zod** (validación en build y en pruebas) | Operaciones o Capacitación cambia el contenido sin tocar código |
| Pruebas | Vitest + Testing Library; e2e con Playwright | Arranque, navegación, hotspot, descarga, modos, progreso, evaluación |
| Asistente | Recuperador local (BM25 sobre el contenido aprobado) + interfaz `AnswerProvider` (extractivo hoy; LLM con RAG mañana) | Funciona sin servidor y nunca responde sin fuente |
| Documentos | PDF generados desde el contenido (Playwright), en `public/documents` | Descargables y versionados |

## G. Estrategia de optimización 3D
- **Pipeline:** `scripts/build-eaf-glb.mjs` arma el EAF por sistemas con nodos nombrados `eaf__<sistema>__<componente>` y vacíos `hs__<hotspot>`. Exporta GLB y lo optimiza con gltf-transform: dedupe, weld, quantize y **meshopt**.
- La app carga el GLB con `useGLTF`. Los hotspots y la selección se resuelven por nombre de nodo, no por código.
- **Presupuestos** (escritorio, HIGH): ≤ 150 k triángulos, ≤ 150 draw calls y GLB ≤ 1.5 MB.
- **Presets de calidad:**

  | Preset | Sombras | Postproceso | DPR |
  |---|---|---|---|
  | LOW | Ninguna | Ninguno | Máx. 1 |
  | MEDIUM | Sombra de contacto | Bloom | Hasta 1.5 |
  | HIGH | Direccional | AO + bloom + SMAA | Hasta 2 |

  **AUTO** elige con la GPU detectada, el tipo de puntero y el monitor de rendimiento.
- Instancing para piezas repetidas, frustum culling y materiales compartidos (sin texturas pesadas: PBR por color). Code-splitting de la escena y del visor de documentos, y pantalla de carga con progreso real.

## H. Alcance del MVP («uno de cada uno, excelente»)
| Elemento | Elección |
|---|---|
| Etapa del proceso | **03 Fusión** (con alimentación continua de DRI) |
| Sistema de equipo principal | **Sistema de electrodos**: electrodos, brazos portaelectrodos, mástiles y regulación, transformador y barras conductoras |
| Instrucción de trabajo | **Revisión del sistema de electrodos antes de reanudar la fusión** (DEMO; los pasos de planta son SME_REQUIRED) |
| Módulo de seguridad | **Energía eléctrica, energía almacenada y metal líquido alrededor del EAF** |
| Módulo de entrenamiento | **Conoce el sistema de electrodos y la fusión** (niveles 1–3) |
| Evaluación | Identificar componentes en 3D, ordenar la secuencia, peligro → control y escenario |
| Video | Placeholder con reproductor completo (capítulos, subtítulos VTT, pantalla completa), grabado de la propia escena |
| Documento descargable | WI detallada + job aid (PDF) del sistema de electrodos, con estado DEMO |
| Asistente IA | Pregunta a Acería AI con contexto y citas; se niega a responder sin fuente |
| Escena | EAF completo (coraza, bóveda, electrodos, brazos, transformador, barras, O₂/quemadores, puerta de escoria, EBT, hidráulica, refractario, enfriamiento, extracción de humos, cuarto de control, 5.º agujero de DRI) |

El resto de las etapas y equipos existe como estructura navegable con contenido educativo general y `SME_REQUIRED`.

## I. Arquitectura de carpetas
```
apps/academy/
  docs/            plan, arquitectura, esquema de contenido, sistema de diseño, 3D, QA, rendimiento, validación, backlog
  scripts/         build-eaf-glb.mjs · build-documents.mjs · record-video.mjs · check-content.mjs
  public/
    models/        eaf.glb
    documents/     *.pdf
    videos/        *.webm + *.vtt
  src/
    app/           App, rutas por vista, layout
    components/
      3d/          Scene, EafModel, Hotspots, CameraDirector, ViewModes, Quality
      ui/          Button, Tabs, Badge, Panel, Tooltip, Modal, Toast, Progress, StatusChip
      training/    LearnPlayer, PerformJobAid, Assessment
      library/     Library, DocumentViewer, VideoPlayer
      assistant/   AskAcería
    content/       processes.json · equipment.json · hazards.json · hotspots.json · training.json · work-instructions.json · assessment.json · documents.json · videos.json · glossary.json
    lib/           content (schema, loader, index), assistant (retriever, providers), analytics, download
    stores/        useUi, useProgress
    types/         content.ts
    styles/        tokens.css, index.css
  tests/           unit, componentes, e2e
```

## J. Backlog de implementación (MVP)
| # | Historia | Agente | Criterio de aceptación |
|---|---|---|---|
| 1 | Esquema de contenido y validación con zod | 11 | `npm run check:content` en verde; tipos estrictos |
| 2 | Contenido del EAF (proceso, equipos, peligros, hotspots, WI, entrenamiento, evaluación) | 02, 03, 04, 05, 06, 07 | Todo valor operativo es `SME_REQUIRED`; Seguridad sin veto |
| 3 | GLB del EAF con nombres y hotspots | 09 | GLB ≤ 1.5 MB; todos los IDs de hotspots existen en el contenido |
| 4 | Shell, tokens, tipografía, aviso permanente | 08, 11 | Visible en todas las vistas; accesible por teclado |
| 5 | Escena: órbita, foco, resaltado, aislar, ocultar, rayos X, corte, explosionado | 10 | 60 FPS en escritorio (HIGH); sin errores |
| 6 | Hotspots + panel con 9 pestañas | 10, 08 | Abre en ≤ 1 clic; la info de seguridad no depende solo del color |
| 7 | Modo Aprender (Fusión) con cámara guiada | 07, 10 | Paso a paso, con progreso y control de conocimiento |
| 8 | Modo Ejecutar (job aid) + descarga de PDF | 06, 11 | Marca de pasos; descarga funcional; estado DEMO visible |
| 9 | Modo Evaluar | 07, 11 | Puntaje, fortalezas, brechas, recomendaciones |
| 10 | Biblioteca + visor de documentos + reproductor de video | 11 | Filtros, vista previa, descarga, capítulos, subtítulos, pantalla completa |
| 11 | Pregunta a Acería AI | 12 | Respuestas con citas; rechazo sin fuente; usa el contexto |
| 12 | Analítica local + adaptador xAPI | 11 | Eventos registrados sin datos personales |
| 13 | Calidad LOW/MEDIUM/HIGH/AUTO, carga con progreso | 10 | AUTO baja calidad en equipos modestos |
| 14 | Accesibilidad: teclado, ARIA, alto contraste, movimiento reducido | 08, 13 | Recorrido completo sin mouse |
| 15 | Pruebas unitarias, de componentes y e2e | 13 | Verde en CI local |
| 16 | Validación industrial + red team + correcciones | 14, red team, 01 | CRITICAL = 0; HIGH prácticos cerrados |
| 17 | Documentación final (14 entregables) | 01, 11 | Todos los documentos en `docs/` |
