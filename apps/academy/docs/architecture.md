# Arquitectura del sistema — ACERÍA DIGITAL ACADEMY

**Mensaje clave:** es una aplicación web estática (sin servidor) que separa tres cosas: el **contenido industrial** (JSON validado por esquema), el **modelo 3D** (GLB con nodos nombrados por contrato) y la **interfaz** (React). Para agregar un equipo, una planta o un procedimiento aprobado se edita contenido y modelo. No se toca código.

## 1. Vista general
```
           ┌──────────────── Contenido (src/content/*.json) ─────────────────┐
           │ etapas · equipos · peligros · hotspots · WI · módulos · preguntas │
           │ evaluaciones · documentos · videos · glosario · fuentes           │
           └──────────────┬─────────────────────────────────┬────────────────┘
                zod (schema.ts) + crossCheck          scripts/build-documents.mjs
                          │                                 │  (PDF desde el mismo JSON)
   scripts/build-eaf-glb.mjs ──► src/assets/eaf.glb ──┐     ▼
   (nodos eaf__*, contrato docs/nodos-3d.md)          │  public/documents/*.pdf
                                                      ▼
 ┌──────────────────────────── App React (Vite) ──────────────────────────────┐
 │ TopBar (modos, calidad, IA) │ Sidebar (mapa proceso, equipos) │ Panel (9 pestañas) │
 │ Scene (R3F): EafModel · Hotspots · CameraDirector · Effects por calidad     │
 │ Modos: Explorar · Aprender · Ejecutar · Evaluar · Biblioteca                │
 │ Asistente: retriever BM25 local → AnswerProvider (citas / negativa)         │
 │ Analítica: eventos locales → xAPI (actor anónimo)                           │
 │ Aviso de seguridad permanente                                               │
 └────────────────────────────────────────────────────────────────────────────┘
```

## 2. Capas y responsabilidades
| Capa | Archivos | Responsabilidad |
|---|---|---|
| Contrato de contenido | `src/lib/content/schema.ts` | Esquemas zod, estados de validación y `crossCheck`. Este último revisa referencias rotas, nodos 3D inexistentes, objetos PLANT_APPROVED sin firma y permutaciones inválidas. |
| Carga de contenido | `src/lib/content/index.ts` | Valida una sola vez al arrancar; arma índices por ID y el mapa nodo 3D → equipo. |
| Estado | `src/stores/useApp.ts`, `useLoad.ts` | zustand: modo, selección, vista 3D (rayos X, corte, despiece, aislar, ocultar), calidad, peticiones de cámara, modo «identificar», modales. |
| 3D | `src/components/3d/*` | `EafModel` carga el GLB con progreso real (bytes → decodificación meshopt → compilación de shaders); resalta, aplica rayos X, corte y despiece, y detecta clics. Además: `Hotspots` (botones HTML accesibles), `CameraDirector` (camera-controls, respeta *reduced motion*) y `Scene` (luces, entorno local, presets de calidad y PerformanceMonitor). |
| UI | `src/components/{shell,panel,training,library,assistant,ui}` | Componentes de presentación. No contienen texto industrial: todo viene del JSON. |
| Asistente | `src/lib/assistant/{retriever,provider}.ts` | BM25 local más un proveedor extractivo con reglas: cita la fuente, se niega con «No tengo una fuente aprobada para esa información.» y rechaza bypass. |
| Analítica | `src/lib/analytics` | Eventos de aprendizaje en `localStorage` y mapeo a xAPI 1.0.3 con `definition`, categoría no certificante y `certifies-competency: false`. |
| Fallos contenidos | `src/components/ui/ErrorBoundary.tsx`, `src/main.tsx`, `App.tsx` | Un *boundary* en la raíz (mensaje + aviso de seguridad) y otro en la escena 3D: si WebGL o el *chunk* fallan, la carga pasa a `error` y la app sigue con la lista, las lecciones, la evaluación y la biblioteca (RT-SW-02). El panel derecho tiene su propio *boundary* por modo. |
| Medios | `scripts/capture-media.mjs`, `scripts/build-documents.mjs` | Imágenes y video placeholder desde la escena; PDF desde el contenido. |

## 3. Flujo de datos
1. `npm run check:content` valida el JSON y el contrato con el GLB (`public/models/eaf.nodes.json`) **antes** de compilar. Si hay errores, el build falla.
2. Al arrancar, `content` se parsea con zod y la UI solo lee de `idx.*`.
3. Clic en el 3D: `EafModel` sube por el árbol hasta `eaf__<sistema>[_<componente>]`, luego `equipmentForNode` y finalmente `selectEquipment`. El panel lee el equipo y sus peligros, documentos, videos y módulos por ID.
4. Las lecciones fijan `focusNodes` y la cámara; la escena resalta esos nodos. En modo Evaluar, `picking = true` convierte el clic 3D en respuesta.
5. Enlaces profundos: `#/modo/id` (por ejemplo `#/explore/eq.electrodes`, `#/learn/mod.electrode-melting`). El *hash* se sincroniza con `useApp.subscribe` (sin re-render). Cambiar de modo usa `pushState` (Atrás no sale de la app); un enlace a otro módulo empieza en la lección 1.
6. En Aprender, Ejecutar, Evaluar y Biblioteca, abrir la ficha de un equipo la superpone y **mantiene montado** el árbol de entrenamiento (RT-SW-04): no se pierde el avance de la evaluación ni de la instrucción.
7. Evaluación: aprobar = `ratio ≥ passScore` **y** todas las `criticalQuestionIds` bien; las `unscoredQuestionIds` no cuentan (TRN-01 / SAF-09). `window.__adxStore` solo existe en desarrollo, con `?capture` o con `?e2e`.

## 4. Seguridad del contenido (por diseño)
- **Cinco estados** visibles siempre con texto, icono y color (`STATUS_META`). `PLANT_APPROVED` está prohibido en el MVP: el validador y las pruebas lo bloquean.
- **Campos de planta**: cualquier texto con `SME_REQUIRED:` o `PLACEHOLDER — REQUIRES PLANT VALIDATION` se muestra en la app y en los PDF como un recuadro de «dato de planta pendiente».
- El **aviso permanente** no se puede cerrar.
- Los documentos no aprobados llevan una marca de agua de NO VALIDADO (imagen SVG decorativa, sin texto extraíble, alfa 0.16) y la leyenda en el encabezado de cada página. El job aid dice «Practicado en simulación» y «No usar en piso»; la guía del participante no trae la tabla de variables de proceso.
- `crossCheck` rechaza `PLANT_APPROVED` en **todas** las colecciones (incluidas fuentes y glosario) y las marcas `SME_REQUIRED` / `PLACEHOLDER` vacías.
- La evaluación y la práctica dicen explícitamente que **no certifican competencia**.
- El asistente no tiene red ni modelo generativo: solo extractos citados.

## 4 bis. Uso de la evidencia de aprendizaje (TRN-06, TRN-12, SAF-11)
- **Ningún evento de la plataforma alimenta la certificación de tareas críticas (TD-P07) ni la emisión de DC-3.** La competencia la evalúa y firma un evaluador en piso con el procedimiento aprobado.
- Cada sentencia xAPI lleva `context.contextActivities.category = urn:gasm:adx:category:knowledge-check-non-certifying` y `result.extensions["urn:gasm:adx:certifies-competency"] = false`. La evaluación se nombra «Evaluación de conocimiento (no certifica competencia; no válida para DC-3 ni para tareas críticas)» y `passed`/`failed` se muestran como «aprobó / no alcanzó el mínimo en la comprobación de conocimiento».
- La práctica de EJECUTAR se registra como `wi.<id>#practica-sim[-n]` con `simulated: true` (tipo `simulation`), nunca como verificación OJT.
- Por ítem se registra `answered` (correcta o no, intento, crítica); en el global, `raw/max`, intento y duración. Sin texto libre ni datos personales.
- En la fase 1 la evidencia **solo** sirve para indicadores agregados N1–N2 por módulo. Si se lleva al expediente individual, el registro se hace en el LMS bajo TD-P09 como «constancia interna de conocimiento» (no DC-3), con aviso de privacidad y acuerdo previo de la CMCAP. El resultado **no se usa para escalafón, ascensos, cambios de puesto, sanciones ni bonos** (TRN-03; verificar con Jurídico Laboral y `experto-relaciones-laborales`).
- El trabajador ve un aviso de registro en EVALUAR, puede **desactivarlo** (`setEnabled(false)`) y, en un equipo compartido, **terminar sesión** (borra eventos, progreso y el actor anónimo).

## 5. Integración futura
| Punto | Hoy (MVP) | Siguiente paso |
|---|---|---|
| Contenido | JSON en el repositorio | CMS o repositorio documental con flujo de firmas (los esquemas zod se conservan como contrato de API). |
| Asistente | `LocalExtractiveProvider` | `AnswerProvider` remoto (RAG con LLM) que **solo** use pasajes recuperados de documentos con estado conocido, cite y conserve las mismas reglas de negativa. |
| Analítica | localStorage + exportación xAPI | Envío a un LRS corporativo con consentimiento y aviso de privacidad (`toXapi`). SCORM: empaquetar `web/index.html` con un adaptador SCORM 1.2/2004. |
| Identidad | Anónima | SSO corporativo. La plataforma **no** emite certificaciones; la DC-3 y la certificación de tareas críticas se quedan en el proceso TD-P07 en piso. |

## 6. Builds
- `npm run build` → `dist/` (chunks separados: three, r3f, escena *lazy*).
- `npm run build:web` → `web/index.html` autocontenido (GLB incrustado) más `documents/`, `videos/` e `images/` copiados.
