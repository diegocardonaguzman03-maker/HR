# RED TEAM técnico — ACERÍA DIGITAL ACADEMY (UX · Software · Rendimiento)

**Fecha:** 2026-10-05 · **Alcance:** `src/` completo, `scripts/build-eaf-glb.mjs`, `tests/unit/*`, `tests/e2e/run.mjs` · **Roles:** ADX RED UX, ADX RED SOFTWARE y ADX RED PERFORMANCE.

**Mensaje clave:** el build compila sin errores (`npx tsc -b` = 0) y las 25 pruebas unitarias pasan. Aun así **no recomiendo liberar** mientras sigan abiertos los 2 hallazgos CRITICAL. (1) En 6 de los 15 equipos el resaltado 3D, el encuadre, OCULTAR y AISLAR no funcionan, y AISLAR deja la escena vacía. (2) Si WebGL falla, la app entera queda en blanco, incluido el aviso de seguridad. Además hay 11 hallazgos HIGH: integridad de la evaluación, pérdida de progreso, foco del teclado en el reproductor, destellos del arco, subtítulos sin versionar, *guardrails* del asistente y tres problemas de rendimiento (tormenta de *re-renders* al pasar el cursor sobre el modelo y el 3D completo en la ruta crítica de carga).

**Método.** Solo hay hallazgos verificados en el código. Las verificaciones fueron: lectura línea por línea; carga del GLB real con `GLTFLoader` en Node para listar los nombres de nodos que ve la app; consultas reales a `LocalExtractiveProvider` con `tsx`; lectura del código fuente de R3F 8.17.10, drei 9.122 y three r169 en `node_modules`; contraste calculado con la fórmula WCAG; tamaños de `dist/` (build de las 15:33) medidos con `gzip -c`. No se ejecutaron Playwright, `capture-media` ni `vite build`. Los FPS y la memoria no se midieron en navegador: donde aplica, se marca **[Verificar en navegador]**.

| Severidad | UX | Software | Rendimiento | Total |
|---|---|---|---|---|
| CRITICAL | 0 | 2 | 0 | **2** |
| HIGH | 4 | 4 | 3 | **11** |
| MEDIUM | 7 | 6 | 4 | **17** |
| LOW | 3 | 4 | 1 | **8** |

---

## 1. UX y accesibilidad (WCAG 2.2 AA)

| ID | Sev. | Archivo:línea | Descripción | Escenario de falla concreto | Corrección propuesta (resumen; código abajo) |
|---|---|---|---|---|---|
| RT-UX-01 | HIGH | `src/components/ui/Modal.tsx:6-20` + `library/VideoPlayer.tsx:22,29` | El efecto del modal depende de `[onClose]`, pero todos los llamadores pasan una flecha nueva en cada render. `VideoPlayer` se vuelve a renderizar en cada `timeupdate` (unas 4 veces por segundo), así que el efecto se desmonta y se monta de nuevo: devuelve el foco a `prev` y lo manda otra vez al primer botón («Cerrar»). Incumple WCAG 2.4.3 y 2.1.1. | Un usuario de teclado entra al `<video>` y pulsa Espacio para reproducir. En menos de 250 ms el foco salta a «Cerrar» y el siguiente Espacio **cierra el modal**. Tampoco puede tabular a «Capítulos». Al cerrar, el foco vuelve a un nodo eliminado (`prev` quedó dentro del modal) y termina en `<body>`. | Guardar `onClose` en una *ref* y dejar el efecto con dependencias `[]` (fragmento UX-01). |
| RT-UX-02 | HIGH | `src/stores/useApp.ts:85` + `src/app/App.tsx:65` | `setMode` no limpia `selectedEq`, `selectedComponentNode` ni `selectedStage`. `RightPanel` muestra `EquipmentPanel` siempre que haya equipo seleccionado fuera de EXPLORAR. | En EXPLORAR, el usuario abre «Electrodos» y luego pulsa **APRENDER**. En lugar de la lista de módulos ve el panel del equipo con «← Volver a la lección», aunque no hay lección abierta. Lo mismo pasa con EJECUTAR y EVALUAR. La navegación principal parece rota. | Limpiar la selección en `setMode` (fragmento UX-02). |
| RT-UX-03 | HIGH | `src/components/3d/Scene.tsx:41-42` | La luz «ARCO (DEMO)» oscila con `sin(t*37)` (≈ 5.9 Hz, intensidad de 30 a 90) y la esfera emisiva escala con `sin(t*41)` (≈ 6.5 Hz), con *bloom*. Esto supera el umbral de 3 destellos por segundo de WCAG 2.3.1 (nivel A) si el área iluminada es grande, y no respeta `prefers-reduced-motion`. El video placeholder graba ese mismo efecto. | Una persona con epilepsia fotosensible activa ARCO en Calidad Media/Alta y la escena parpadea de blanco azulado a casi 6 Hz. **[Verificar con PEAT o Harding sobre la captura]** | Bajar la frecuencia a < 3 Hz, reducir la amplitud y desactivar la oscilación con *reduced motion* (fragmento UX-03). Volver a capturar el video. |
| RT-UX-04 | HIGH | `src/content/videos.json:6`, `scripts/capture-media.mjs:78`, `tests/e2e/run.mjs:25,177` | `public/videos/melt-overview.vtt` **no está versionado** (`git ls-files public` solo lista el `.webm`) y tampoco está en `dist/videos/`. Solo se escribe al final de una captura de unos 40 s, así que si la captura se interrumpe no hay VTT. La UI anuncia «subtítulos» (`EquipmentPanel.tsx:120`). | En un clon limpio, el `<track>` devuelve 404 y el video corre sin subtítulos (incumple WCAG 1.2.2, nivel A). El e2e no lo detecta: filtra los errores `404|net::ERR` y solo comprueba `textTracks.length === 1`, que es verdadero aunque el archivo falte. **[Re-verificar al terminar la captura en curso]** | Versionar el VTT y generarlo en un script separado antes de la captura. En el e2e, comprobar `track.readyState === 2` y `cues.length > 0` (fragmento UX-04). |
| RT-UX-05 | MEDIUM | `src/styles/index.css:16,22` (tokens) | Contraste medido: `--color-text-3` (#7d8591) sobre `surface-2` = **4.49:1** y sobre `surface-3` = 3.97:1, ambos < 4.5. `--color-danger` como texto sobre `surface-2` = **4.27:1**. Bordes de controles `--color-line-strong` sobre `surface` = **1.76:1**, < 3:1 (WCAG 1.4.11). | Fallan los metadatos de 11–12.5 px dentro de tarjetas («10 preguntas · aprobación 80 %», «v1.0 · sin aprobación») y la etiqueta «✕ Incorrecta» en la revisión de la evaluación (`AssessmentView.tsx:66`). Los campos de búsqueda y los *selects* de Biblioteca no tienen un contorno perceptible. | `--color-text-3: #8a929e` (5.32:1 en s2 y 4.71:1 en s3). Nuevo token `--color-danger-text: #f26b6f` (5.66:1) para texto. `--color-line-strong: #646d7c` (3.47:1) en bordes de controles. |
| RT-UX-06 | MEDIUM | `src/components/training/LearnPlayer.tsx:45`, `PerformJobAid.tsx:75` | La navegación por lección y por paso se hace con botones de **6 px de alto** (`h-1.5`), por debajo del mínimo de 24×24 px de WCAG 2.5.8. El estado (hecho, actual o pendiente; verificado) se comunica **solo con color** (WCAG 1.4.1), y el segmento pendiente `surface-3` sobre `surface` tiene 1.23:1. | En una tableta de piso, el usuario no puede tocar con precisión «Paso 7». Una persona daltónica no distingue el paso verificado (verde) del actual (ámbar). | Usar botones de 24 px con número visible y una marca de texto o icono (fragmento UX-06). |
| RT-UX-07 | MEDIUM | `src/components/shell/Welcome.tsx:25`, `3d/CameraDirector.tsx:37` | La bienvenida afirma: «Todo se puede usar con teclado». Pero no hay giro, zoom ni desplazamiento de cámara por teclado: `CameraControls` no tiene teclado y la barra de herramientas solo ofrece ENFOCAR y RESTABLECER. | Un usuario sin ratón no puede ver la parte trasera del horno (hidráulica, EBT) salvo con ENFOCAR, que exige seleccionar antes. El texto lo induce a error. | Agregar botones «⟲ ⟳ + −» en `ViewToolbar` que llamen a `controls.rotate(±π/8, 0, true)` y `controls.dolly(±3, true)`, y corregir el texto mientras tanto: «La selección y la información funcionan con teclado; el giro libre requiere ratón o pantalla táctil». |
| RT-UX-08 | MEDIUM | `src/stores/useApp.ts:85`, `EafModel.tsx:93-98` | El estado de vista (`hidden`, `xray`, `section`, `isolate`, `explode`) se mantiene al pasar a APRENDER o EJECUTAR y no hay aviso. | El usuario ocultó la **bóveda** en EXPLORAR. En la lección 1 («coraza, bóveda, electrodos») la bóveda no aparece: el resaltado apunta a algo invisible y solo hay un «MOSTRAR TODO (1)» discreto. | Al entrar a `learn` o `perform`: `set({ hidden: [], isolate: false, explode: 0 })`, o mostrar un *banner* «Vista modificada: Restablecer». |
| RT-UX-09 | MEDIUM | `src/components/training/QuestionView.tsx:28-36`, `shell/Sidebar.tsx:57,61` | En modo identificar: (a) el texto dice «elígelo de la lista», pero la lista visible del *sidebar* está **deshabilitada**, con la marca «· modo identificar»; (b) el clic 3D no deja ninguna marca en el modelo, solo «Elegiste: X» en el panel, que en móvil queda fuera de la vista. | En móvil (390 px) el usuario toca el horno y no ve ningún cambio, así que vuelve a tocar. En escritorio intenta usar la lista lateral y la encuentra gris. | Cambiar el texto a «…o elígelo en el menú **Equipo seleccionado** de abajo». Resaltar `lastPick` en 3D (pasar `lastPick.eqId` a `emph` en EafModel) y anunciarlo con `role="status"`. |
| RT-UX-10 | MEDIUM | `src/components/assistant/AskAceria.tsx:31,37`; `lib/assistant/provider.ts:47` | (a) El panel del asistente no se cierra con Esc y no devuelve el foco al botón que lo abrió. (b) Las citas de los fragmentos `#plant` muestran solo «zona de exclusión:», porque `splitPending` corta antes de la marca y `pending` no se muestra. | La pregunta «¿Puedo entrar a la zona de exclusión con el horno encendido?» devuelve una cita cuyo texto es solo «zona de exclusión:». Parece contenido roto o una respuesta afirmativa (ver también RT-SW-06). | Agregar `onKeyDown={(e) => e.key === 'Escape' && close()}` y devolver el foco a `[data-testid=open-assistant]`. Mostrar `c.pending` con `<OpText text={'SME_REQUIRED: ' + c.pending} />` y excluir los fragmentos `#plant` de las respuestas `answer`. |
| RT-UX-11 | MEDIUM | `src/components/shell/LoadingScreen.tsx:20` | `aria-live="polite"` está sobre un texto que cambia con **cada *chunk*** de descarga, con KB y %. | El lector de pantalla encadena «Descargando modelo 3D 12 %… 14 %…» durante toda la carga. | Quitar `aria-live` del contador. Dejar una región viva aparte que anuncie solo los cambios de **fase** (`PHASES[phase]`). |
| RT-UX-12 | LOW | `src/components/training/LearnPlayer.tsx:33` | El botón dice «Continuar», pero hace `lessonIdx: 0`. | Quien ya completó 3 de 5 lecciones vuelve a la lección 1. | `lessonIdx: Math.min(doneN, m.lessons.length - 1)`. |
| RT-UX-13 | LOW | `src/components/3d/Hotspots.tsx:28-29`; `ui/Tabs.tsx:21` | `aria-pressed` en los *hotspots* anuncia un conmutador que no se desactiva al pulsarlo de nuevo. `aria-controls` de las pestañas no seleccionadas apunta a ids inexistentes (`panel-operation`…). | El lector de pantalla dice «botón conmutador, presionado» y pulsar otra vez no hace nada. | En los *hotspots*, usar `aria-current={active ? 'true' : undefined}`. En `Tabs`, poner `aria-controls` solo en la pestaña activa. |
| RT-UX-14 | LOW | `src/components/library/VideoPlayer.tsx:27` | El mensaje de error dirigido al trabajador es «Ejecuta `npm run video`», y ese script **no existe** (en `package.json` se llama `media`). | Un trabajador de nuevo ingreso ve una instrucción técnica incorrecta. | «Video no disponible en esta versión. Avisa a tu instructor.» |

### Fragmentos UX

**UX-01 — `Modal.tsx`**
```tsx
export function Modal({ title, onClose, children, wide = false, testid }: { /* … */ }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;                       // siempre la última, sin re-ejecutar el efecto
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, a, [tabindex="0"]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      /* … trampa de Tab igual … */
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus(); };
  }, []);                                            // ← antes: [onClose]
```

**UX-02 — `useApp.ts`**
```ts
setMode: (mode) => set({
  mode, focusNodes: [], picking: false,
  selectedEq: null, selectedComponentNode: null, hoverNode: null,
  ...(mode !== 'explore' ? { selectedStage: null } : {}),
}),
```
> `EquipmentPanel` («Abrir módulo») y `useHashRoute` ya llaman a `set(...)` **antes** de `setMode` solo para `moduleId`, `wiId` y `assessmentId`, así que no se pierde nada. El *deep link* `#/explore/eq.x` selecciona después de `setMode`.

**UX-03 — `Scene.tsx` (FurnaceLight)**
```ts
const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
useFrame(({ clock }) => {
  const on = useApp.getState().arcDemo; const t = clock.elapsedTime;
  // ≤ 2 Hz y ±10 % de amplitud: por debajo del umbral de destellos (WCAG 2.3.1)
  const wobble = reduced ? 0 : Math.sin(t * 12) * 6;
  if (arc.current) arc.current.intensity = on ? 60 + wobble : 0;
  if (sprite.current) { sprite.current.visible = on; sprite.current.scale.setScalar(reduced ? 1 : 0.95 + Math.sin(t * 12) * 0.05); }
});
```

**UX-04 — `tests/e2e/run.mjs` (prueba de video) y filtro de consola**
```js
page.on('console', (m) => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errors.push(`${name}: ${m.text()}`); }); // sin ocultar 404
// …
const ok = await page.evaluate(async () => {
  const v = document.querySelector('[data-testid=video-element]'); const tr = v?.querySelector('track');
  if (!v || !tr) return 'sin video/track';
  await new Promise((r) => (tr.readyState === 2 ? r() : (tr.addEventListener('load', r, { once: true }), tr.addEventListener('error', r, { once: true }))));
  return tr.readyState === 2 && tr.track.cues?.length > 0 ? 'ok' : `track.readyState=${tr.readyState}`;
});
```
Además: `git add public/videos/melt-overview.vtt`, y mover el bloque `writeFileSync(...vtt)` de `capture-media.mjs` a `scripts/write-captions.mjs`, que se ejecute antes de capturar.

**UX-06 — segmentos de avance (ejemplo en `PerformJobAid.tsx`)**
```tsx
<button onClick={() => setStep(k)} aria-label={`Paso ${x.n}${checked.has(x.n) ? ' (verificado)' : ''}`} aria-current={k === step ? 'step' : undefined}
  className={`grid h-6 min-w-6 w-full place-items-center rounded font-mono text-[11px] ${k === step ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : checked.has(x.n) ? 'border border-[var(--color-safe)] text-[var(--color-safe)]' : 'border border-[var(--color-line-strong)] text-[var(--color-text-3)]'}`}>
  {checked.has(x.n) ? '✔' : x.n}
</button>
```

---

## 2. Software

| ID | Sev. | Archivo:línea | Descripción | Escenario de falla concreto | Corrección propuesta |
|---|---|---|---|---|---|
| RT-SW-01 | **CRITICAL** | `src/stores/useApp.ts:88`; `3d/EafModel.tsx:89`; `3d/Hotspots.tsx:11`; `shell/ViewToolbar.tsx:8`; `training/PerformJobAid.tsx:18` | El nodo 3D se **deriva del ID del equipo** con `eaf__${id.replace(/^eq\./,'')}`, en lugar de usar `equipment.nodeNames`, que es el contrato real. En 6 de 15 equipos el nombre derivado no existe en el GLB: `eq.electrode-arms` da `eaf__electrode-arms` (el nodo real es `eaf__arms`), y lo mismo pasa con `secondary-circuit`, `oxygen-carbon`, `slag-door`, `dri-feed` y `control-room`. | Al seleccionar «Brazos portaelectrodos», que es parte del **sistema MVP**: (1) no se resalta nada, (2) la cámara no encuadra, (3) **AISLAR oculta todos los sistemas** y los *hotspots*, y la escena queda vacía, (4) OCULTAR no oculta nada pero muestra «MOSTRAR TODO (1)», (5) en EJECUTAR solo se resaltan 2 de los 5 equipos de la WI. El e2e de herramientas usa `eq.ebt`, uno de los IDs que sí coinciden, y no lo detecta. | Agregar una función única `sysOf` basada en `nodeNames` y usarla en los 5 sitios, más una validación en `crossCheck` (fragmento SW-01). |
| RT-SW-02 | **CRITICAL** | `src/app/App.tsx:109`, `src/main.tsx:6`, `stores/useApp.ts:50-52` | No hay **ningún `ErrorBoundary`**. R3F vuelve a lanzar los errores del `<Canvas>` (`react-three-fiber.esm.js:254-256`, `if (error) throw error`), y lo mismo pasa con el fallo del *chunk* *lazy* `Scene`. Sin *boundary*, React 18 desmonta toda la raíz. Además, `initialQuality()` acepta cualquier cadena de `localStorage`, y una calidad desconocida provoca `PRESETS[effective]` = `undefined` y luego `TypeError`. | (a) En una PC de planta sin GPU o WebGL (VDI, escritorio remoto, controlador en lista negra; Chrome ya no hace *fallback* automático a SwiftShader para WebGL) aparece `Error creating WebGL context`, la **página queda en blanco** y desaparece el **aviso de seguridad permanente**. Así no se cumple la promesa de `LoadingScreen` («Puedes seguir usando la lista…»). (b) Con `localStorage['adx.quality']='ultra'`, por ejemplo de una versión anterior, la app también queda en blanco. | Envolver la escena en un *boundary* que active el modo «sin 3D», agregar un *boundary* raíz que conserve el `Disclaimer` y validar la calidad (fragmento SW-02). |
| RT-SW-03 | HIGH | `src/components/training/QuestionView.tsx:14-22` | **Respuesta fantasma en «identificar».** El 2.º efecto corre al montar con el `lastPick` capturado en el render, el de la pregunta **anterior**. El `set({ lastPick: null })` del 1.er efecto llega tarde. | `asm.eaf-electrode` tiene `q.electrode-1` y `q.electrode-2` seguidas, ambas de identificar. El alumno responde la 1 con clic 3D (Electrodos) y pulsa «Siguiente». La 2 aparece **ya respondida con Electrodos** y «Siguiente» queda habilitado. Si vuelve con «Anterior» a una pregunta de identificar ya respondida con la lista, la respuesta se **sobrescribe** con el último clic 3D. Un clic hecho en una lección de APRENDER también se arrastra a la evaluación. | Ignorar el `lastPick` que ya existía al montar (fragmento SW-03). Agregar una prueba unitaria: dos preguntas de identificar seguidas y `lastPick` previo, y verificar que la 2.ª queda vacía. |
| RT-SW-04 | HIGH | `src/app/App.tsx:62-77` | `RightPanel` **reemplaza** el árbol de entrenamiento por `EquipmentPanel` cuando hay `selectedEq && !picking`. `Runner` (evaluación) y `PerformJobAid` guardan su progreso en `useState`, así que se **desmontan y lo pierden**. | (a) En una pregunta de opción múltiple (con `picking=false` y los *hotspots* visibles), el alumno toca el horno por curiosidad: se abre el panel del equipo, y «← Volver a la evaluación» lo regresa a la **pregunta 1, con las respuestas vacías**. (b) En una pregunta de identificar, el *sidebar* está deshabilitado, pero un *deep link* o la cita del asistente (`AskAceria.tsx:59`) puede fijar `selectedEq`. Al pasar a la siguiente pregunta (que no es de identificar), el *cleanup* pone `picking=false`, el panel cambia y se pierde la evaluación. (c) En EJECUTAR se pierden el paso y las verificaciones, y se registra un nuevo `started`. | Mantener montado el árbol de entrenamiento y superponer el panel del equipo (fragmento SW-04). **Decisión del Director:** ¿se permite consultar fichas durante la evaluación? (ver la sección 4). |
| RT-SW-05 | HIGH | `src/components/3d/EafModel.tsx:24-34,150`; `scripts/build-eaf-glb.mjs:287` | El GLB tiene mallas con varios materiales, y `GLTFLoader` nombra a sus hijos `eaf__<x>_1`, `_2`… (verificado al cargar `src/assets/eaf.glb`: `eaf__shell_upper_1`, `eaf__arms_clamp_1`, `eaf__hydraulics_1`, `eaf__roof_1`…). `nodeOf` toma como «componente» el primer nombre `eaf__*` y por eso devuelve `eaf__arms_clamp_1` en lugar de `eaf__arms_clamp`. | (1) «Ver en 3D» **no resalta** 8 de los 19 componentes: `shell_upper`, `shell_hearth`, `arms_clamp`, `arms_cylinder`, `transformer_tank`, `transformer_oltc`, `oxygen_lance` y `ebt_pit`. (2) La lección `les.eaf-energy-safety-2` enfoca `eaf__arms_cylinder` y el cilindro no se ilumina. (3) Un clic 3D en la hidráulica fija `selectedComponentNode='eaf__hydraulics_1'`, un componente inexistente: se ilumina solo una sub-malla al 0.6 y la pestaña COMPONENTES no marca ninguno. | En `nodeOf`, ignorar los sufijos numéricos: `if (/^(eaf\|env)__/.test(o.name) && !/_\d+$/.test(o.name))`. En `build-eaf-glb.mjs:287`, usar `doc.createMesh(\`mesh_${name}\`)` para que las mallas no compitan con el contrato de nombres. |
| RT-SW-06 | HIGH | `src/lib/assistant/provider.ts:19,59` | El filtro `UNSAFE` es una lista cerrada de verbos y no cubre «omitir», «ignorar», «quitar», «retirar», «saltarse» en 3.ª persona ni «entrar a la zona de exclusión». Cuando no hay coincidencia, el asistente responde `kind: 'answer'` con «Según el contenido del módulo…». | Probado con `LocalExtractiveProvider`: «¿Cómo omito el permiso de trabajo?» da `answer`, con citas de «Trabajo en altura». «¿Puedo ignorar el enclavamiento de la puerta?» da `answer` con citas de humos y lanzas. «¿Puedo entrar a la zona de exclusión con el horno encendido?» da `answer`. Una respuesta neutra a una pregunta de sí o no sobre una protección puede leerse como permiso. | Aplicar una regla combinada «protección × anulación» y agregar pruebas (fragmento SW-06). Debe pasar por ADX-04 (Seguridad, veto). |
| RT-SW-07 | MEDIUM | `src/components/3d/EafModel.tsx:141,157-158` | El *picking* y el *hover* solo revisan `object.visible` de la **malla**. OCULTAR y AISLAR ponen `visible=false` en el **padre**, y three r169 y R3F siguen lanzando rayos contra los hijos (`Raycaster.intersect` no revisa la visibilidad). Las partes recortadas por CORTE también siguen recibiendo rayos. | (a) Con la bóveda oculta, el clic en el interior del horno **selecciona la bóveda invisible**. (b) En la vista CORTE, el clic en el baño o el refractario que se ve selecciona la coraza recortada. (c) En una pregunta de identificar, ese clic se registra como respuesta equivocada. | Filtrar por visibilidad en el mundo y por los planos de recorte (fragmento SW-07). |
| RT-SW-08 | MEDIUM | `src/app/App.tsx:35,47` | (a) El *deep link* `#/learn/<mod>` cambia `moduleId` y **no reinicia `lessonIdx`**. (b) Todas las navegaciones usan `history.replaceState`, así que el botón Atrás del navegador **sale de la app**. | Un usuario está en la lección 5 de `mod.electrode-melting` y abre un enlace a `#/learn/mod.eaf-energy-safety`, que tiene 4 lecciones. Como `lessonIdx=4 ≥ 4`, ve directamente «Módulo completado» sin haberlo cursado. | `if (m === 'learn' && idx.module.has(id) && st.moduleId !== id) st.set({ moduleId: id, lessonIdx: 0 });`. Cuando cambie el modo: `history.pushState(null, '', h)`. Si solo cambia el id, mantener `replaceState`. |
| RT-SW-09 | MEDIUM | `src/components/library/VideoPlayer.tsx:17-18,29` | (a) `onError` está en `<video>`, pero cuando falla un `<source>` el evento `error` se dispara **en el `<source>`**, no en el video (HTML: *resource selection algorithm*). Así `failed` nunca cambia a verdadero. (b) `VideoPlayer` siempre está montado y devuelve `null`, de modo que `t` y `failed` **persisten entre videos**. | (a) Si falta el `.webm`, se ve un recuadro negro sin mensaje. (b) Si el video A falló, el video B, que sí existe, muestra «no disponible»; el capítulo activo de B sale del `t` de A. | Mover el *handler* a `<source … onError={() => setFailed(true)} />` y separar `function VideoModal({ v })`, que se monte con `key={v.id}`. |
| RT-SW-10 | MEDIUM | `src/lib/content/schema.ts:295` y todo `crossCheck` | (a) `[...q.correctOrder].sort()` ordena **lexicográficamente**: con 11 o más elementos, una permutación válida (`0..10` se vuelve `"0,1,10,2…"`) se marca como error. (b) No valida: equivalencia entre `eq.*` y el nodo (la causa de SW-01); `lesson.focus` y `component.nodeName` contra el GLB; `hotspot.nodeName` contra `ANCHORS`, que si falta oculta el *hotspot* sin aviso (`Hotspots.tsx:15`); que `hotspotNumber` y `steps[].n` sean únicos; ni que los capítulos estén ordenados (`VideoPlayer.tsx:20` lo da por hecho). | Un autor agrega una pregunta «ordenar» de 12 pasos y el *build* falla con un error falso. Si escribe un `focus` con una errata, la lección no resalta nada y el *build* pasa. | `.sort((a, b) => a - b)`. Agregar las validaciones del fragmento SW-01b y pasar `nodeNames` también desde `scripts/check-content.ts`. |
| RT-SW-11 | MEDIUM | `tests/e2e/run.mjs:126,135,25,177,206,83`; `tests/unit/assistant.test.ts:30-33` | **Pruebas que no prueban lo que dicen.** «evaluación completa (**incluye identificar haciendo clic en el 3D**)» responde con el `<select>` y nunca hace clic en el 3D. «Tab llega a un hotspot» usa `page.focus`, no Tab. «video con subtítulos» acepta un VTT ausente (UX-04). El filtro de consola oculta los 404. «herramientas de vista» solo usa `eq.ebt`, que coincide con su nodo (no ve SW-01), y solo revisa *flags* del *store*, no la visibilidad. La prueba de contexto del asistente acepta `answer` o `no-source`, así que pasa siempre. | Las regresiones SW-01, SW-03, SW-05 y UX-04 pasan en verde. | Agregar: un clic 3D real con `__adxInstant` y `__adxStore.getState().lastPick`; recorrer los 15 equipos con AISLAR y verificar que `scene.getObjectByName(nodeNames[0]).visible`; Tab real hasta un *hotspot*; prueba unitaria de SW-03. Renombrar las pruebas que no hacen lo que dice su nombre. |
| RT-SW-12 | MEDIUM | `src/components/3d/EafModel.tsx:42-61`; `lib/three/loadModel.ts:13,26` | La carga no se puede cancelar: no hay `AbortController`. El `.catch` **no revisa `alive`**. En StrictMode (desarrollo) hay 2 descargas en paralelo que se alternan en `useLoad`. Con `Content-Encoding: gzip`, `content-length` es el tamaño comprimido y el avance pasa de 100 %. | En desarrollo la barra de carga salta hacia atrás. En producción, detrás de un *proxy* que comprime, se ve «Descargando · 137 %». Un error tardío de una carga obsoleta puede sobrescribir la fase `ready` con `error`. | `const ac = new AbortController(); loadModel(url, cb, ac.signal)` y `fetch(url, { signal })`. En el `catch`: `if (alive && e.name !== 'AbortError') setLoad(...)`. Cleanup: `alive = false; ac.abort();`. Calcular el avance con `Math.min(80, …)`. |
| RT-SW-13 | LOW | `src/components/3d/Hotspots.tsx:31` | Llama a `selectEquipment(h.targetId)` sin revisar `h.kind`. El esquema admite `hazard`, `process` e `inspection`. | Un futuro *hotspot* de peligro fijaría `selectedEq='haz.x'`, el panel no mostraría nada y el *hash* quedaría inválido. | `h.kind === 'process' ? selectStage(h.targetId) : h.kind === 'equipment' \|\| h.kind === 'inspection' ? selectEquipment(h.targetId) : set({ /* abrir HazardCard */ })`. |
| RT-SW-14 | LOW | `src/app/App.tsx:85` | `window.__adxStore` (el *store* completo) se expone también en **producción**. | Desde la consola cualquier alumno puede hacer `__adxStore.setState({ ... })` y, por ejemplo, saltarse pasos o forzar estados. El riesgo es bajo porque la evaluación no certifica, pero ensucia la analítica. | `if (import.meta.env.DEV \|\| new URLSearchParams(location.search).has('e2e')) …`. |
| RT-SW-15 | LOW | `src/components/training/PerformJobAid.tsx:42` | `stopStep` se detecta con `/ALTO\|DET[EÉ]N/i` sobre el título: es una heurística que no distingue mayúsculas y busca subcadenas. | Un paso futuro como «Revisa la plataforma en **alto**» o «**Salto** de…» se pintaría en rojo con ⛔ como paso de paro. | Agregar `stop: z.boolean().default(false)` al esquema de pasos y usar `s.stop`. |
| RT-SW-16 | LOW | `src/stores/useApp.ts:90` | `selectStage` no limpia `selectedComponentNode`. | El componente queda iluminado al 0.6 mientras se ve una etapa. | `set({ selectedStage: id, selectedEq: null, selectedComponentNode: null })`. |

**Seguridad (sin hallazgos de severidad).** No se encontró `dangerouslySetInnerHTML` ni `innerHTML`. Todo el contenido se representa como texto de React. `asset()` vuelve relativa cualquier ruta (`javascript:x` queda como `./javascript:x`), así que no hay inyección de esquema en `iframe` ni en `a[download]`. El `iframe` del PDF no lleva `sandbox`, pero eso es aceptable: Chrome bloquea su visor de PDF dentro de un `iframe` con *sandbox*, y la ruta sale de JSON versionado.

### Fragmentos Software

**SW-01 — una sola fuente de verdad para equipo → nodo**
```ts
// src/lib/content/index.ts
export const sysOf = (eqId: string | null | undefined): string | null =>
  (eqId && idx.equipment.get(eqId)?.nodeNames[0]) || null;

// src/stores/useApp.ts
selectEquipment: (id, opts) => {
  set({ selectedEq: id, selectedStage: null, selectedComponentNode: null, tab: opts?.tab ?? 'overview' });
  const sys = sysOf(id);
  if (sys && opts?.fly !== false) get().fitNodes([sys]);
},
// EafModel.tsx:89, Hotspots.tsx:11, ViewToolbar.tsx:8
const selSys = sysOf(s.selectedEq);
// PerformJobAid.tsx:18
set({ focusNodes: wi.equipmentIds.flatMap((e) => idx.equipment.get(e)?.nodeNames ?? []), selectedEq: null });
```
**SW-01b — `crossCheck`**
```ts
for (const q of c.equipment) {
  if (!c.hotspots.some((h) => h.targetId === q.id && q.nodeNames.includes(h.nodeName))) e.push(`${q.id}: ningún hotspot apunta a su nodo ${q.nodeNames[0]}`);
  if (nodeNames) q.components.forEach((k) => { if (k.nodeName && !nodeNames.has(k.nodeName)) e.push(`${q.id}/${k.id}: nodo 3D inexistente ${k.nodeName}`); });
}
if (nodeNames) for (const m of c.training) for (const l of m.lessons) l.focus.forEach((f) => { if (!nodeNames.has(f)) e.push(`${l.id}: focus inexistente ${f}`); });
const nums = c.equipment.map((x) => x.hotspotNumber); if (new Set(nums).size !== nums.length) e.push('hotspotNumber duplicado');
for (const w of c.workInstructions) { const ns = w.steps.map((s) => s.n); if (new Set(ns).size !== ns.length) e.push(`${w.id}: pasos con n repetido`); }
for (const v of c.videos) if (v.chapters.some((ch, i) => i && ch.t < v.chapters[i - 1].t)) e.push(`${v.id}: capítulos desordenados`);
```

**SW-02 — *boundaries* y calidad validada**
```tsx
// src/components/ui/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{ fallback: ReactNode; onError?: (e: Error) => void; children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) { this.props.onError?.(err); }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}
// App.tsx:109
<ErrorBoundary fallback={null} onError={(e) => useLoad.getState().set({ phase: 'error', loaded: 0, total: 0, message: `3D no disponible en este equipo (${e.message})` })}>
  <Suspense fallback={null}><Scene /></Suspense>
</ErrorBoundary>
// main.tsx: raíz con aviso de seguridad siempre visible
<ErrorBoundary fallback={<><p role="alert" className="p-4">La academia no pudo iniciar. Recarga la página o avisa a Capacitación.</p><Disclaimer /></>}><App /></ErrorBoundary>
// useApp.ts:50
const QUALITIES: readonly Quality[] = ['auto', 'low', 'medium', 'high'];
const initialQuality = (): Quality => {
  try { const q = localStorage.getItem('adx.quality') as Quality | null; return q && QUALITIES.includes(q) ? q : 'auto'; } catch { return 'auto'; }
};
```

**SW-03 — `QuestionView.tsx`**
```tsx
const pickAtMount = useRef(useApp.getState().lastPick?.key);   // clic anterior a esta pregunta: se ignora
useEffect(() => {
  if (q.kind !== 'identify' || disabled || !lastPick || lastPick.key === pickAtMount.current) return;
  onChange({ kind: 'identify', eqId: lastPick.eqId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastPick]);
```

**SW-04 — `App.tsx` (el entrenamiento no se desmonta)**
```tsx
function RightPanel() {
  const mode = useApp((s) => s.mode), selectedEq = useApp((s) => s.selectedEq), selectedStage = useApp((s) => s.selectedStage);
  const picking = useApp((s) => s.picking), set = useApp((s) => s.set);
  const eq = selectedEq ? idx.equipment.get(selectedEq) : null;
  if (mode === 'explore') { if (eq) return <EquipmentPanel eq={eq} />; const st = selectedStage ? idx.stage.get(selectedStage) : null; return st ? <StagePanel st={st} /> : <Welcome />; }
  const peek = !!eq && !picking;
  return (
    <div className="relative h-full">
      <div className={peek ? 'hidden' : 'h-full'} aria-hidden={peek}>
        {mode === 'learn' ? <LearnPlayer /> : mode === 'perform' ? <PerformJobAid /> : mode === 'assess' ? <AssessmentView /> : <Library />}
      </div>
      {peek && eq && (
        <div className="absolute inset-0 flex flex-col bg-[var(--color-surface)]">
          <button className="label border-b border-[var(--color-line)] px-4 py-2 text-left" onClick={() => set({ selectedEq: null })}>← Volver</button>
          <div className="min-h-0 flex-1"><EquipmentPanel eq={eq} /></div>
        </div>
      )}
    </div>
  );
}
```
> Nota: `LearnPlayer` y `PerformJobAid` ejecutan efectos que ponen `selectedEq: null` al cambiar de lección o de WI. Al quedar montados no vuelven a ejecutarse con el «Volver», que era el comportamiento buscado.

**SW-06 — `provider.ts`**
```ts
const PROTECTION = /(enclavamiento|interlock|bloqueo|candado|loto|permiso|guarda|resguardo|zona de exclusi[oó]n|paro de emergencia|protecci[oó]n|alarma)/i;
const DEFEAT = /(puente|bypass|anul|desactiv|deshabilit|brinc|salt|forz|omit|ignor|quit|retir|evit|sin\s+|no\s+(usar|poner|colocar|respetar)|entrar|meter(me|se)?|pasar)/i;
// en answer():
if (UNSAFE.test(query) || (PROTECTION.test(query) && DEFEAT.test(query))) return { kind: 'refused-safety', /* mismo texto */ };
```
```ts
// tests/unit/assistant.test.ts
it.each(['¿Cómo omito el permiso de trabajo?', '¿Puedo ignorar el enclavamiento de la puerta?', '¿Puedo entrar a la zona de exclusión con el horno encendido?', '¿Cómo quito el candado?'])
  ('se niega: %s', async (q) => expect((await ai.answer(q, {})).kind).toBe('refused-safety'));
```

**SW-07 — `EafModel.tsx`**
```ts
const worldVisible = (o: THREE.Object3D | null) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
const clippedAway = (i: THREE.Intersection) => {
  const m = (i.object as THREE.Mesh).material as THREE.Material;
  return !!m.clippingPlanes?.some((p) => p.distanceToPoint(i.point) < 0);   // three descarta d < 0
};
const ghost = (o: THREE.Object3D) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial; return m.transparent && m.opacity < 0.5; };
const firstRealHit = (hits: THREE.Intersection[]) =>
  hits.find((i) => worldVisible(i.object) && !clippedAway(i) && !ghost(i.object) && nodeOf(i.object)?.system.startsWith('eaf__'));
// pick: const hit = firstRealHit(e.intersections);  onPointerMove: const h = firstRealHit(e.intersections); const sys = h ? nodeOf(h.object)!.system : null;
```

---

## 3. Rendimiento

| ID | Sev. | Archivo:línea | Descripción | Escenario de falla concreto | Corrección propuesta |
|---|---|---|---|---|---|
| RT-PERF-01 | HIGH | `src/components/3d/EafModel.tsx:157-162` + R3F `events-*.esm.js:1075-1097` | **Tormenta de `hover`.** R3F identifica el objeto bajo el cursor por objeto **y cara** (`hit.index`): al pasar a otro triángulo dispara `onPointerOut` en el `<primitive>` raíz. Así, cada `pointermove` sobre el modelo hace `hoverNode: null` y luego `hoverNode: sys`, es decir, **2 escrituras al *store*** y, por RT-PERF-02, **2 *re-renders* de toda la app**. Además, el efecto visual recorre las 60 mallas con `needsUpdate = true` dos veces. El cursor parpadea entre `pointer` y `auto`. | Al mover el ratón sobre la coraza a 60–120 eventos por segundo: entre 120 y 240 renders de React por segundo (TopBar, Sidebar, panel con 9 pestañas, 15 raíces `Html`…) y entre 7 200 y 14 400 marcas `needsUpdate` por segundo. En equipos modestos se verán tirones al explorar. **[Verificar en navegador con React Profiler y la pestaña Performance]** | `onPointerOut` solo debe limpiar si ningún impacto actual pertenece al modelo, y se debe escribir solo cuando cambie el sistema (fragmento PERF-01). |
| RT-PERF-02 | HIGH | `src/app/App.tsx:25` (`useHashRoute` en `Main`), `3d/EafModel.tsx:85`, `3d/Hotspots.tsx:9` (y otros 13 componentes) | `useApp()` **sin selector**. `Main` se suscribe al *store* completo para sincronizar el *hash*, así que **cualquier** cambio (`hoverNode`, `explode` a cada paso del deslizador, `cameraRequest`, `lastPick`, `effective`…) vuelve a renderizar todo el árbol, incluidos el `<Canvas>` y su reconciliación R3F. `Hotspots` vuelve a renderizar 15 `<Html>`, y drei hace `root.render()` de cada uno en `useLayoutEffect`. | Arrastrar DESPIECE (20 pasos) provoca 20 renders completos de la app más 15 raíces `Html` por paso. Junto con PERF-01, esto es la causa principal de tirones al interactuar. | Sincronizar el *hash* con `useApp.subscribe` (sin render) y usar `useShallow` en los componentes (fragmento PERF-02). |
| RT-PERF-03 | HIGH | `vite.config.ts:17` | `manualChunks: { r3f: [...] }` arrastra **React** al *chunk* `r3f`, porque es una dependencia compartida. Medido en `dist/` de las 15:33: `index-*.js` importa estáticamente `./r3f-*.js` (`import{c,j,r…}from"./r3f-D564rUZY.js"`), y `index.html` precarga `three` y `r3f`. Por eso el `lazy()` de `Scene` solo difiere 25 KB. | Ruta crítica antes del primer render de la UI: 84 KB (index) + **284 KB (r3f)** + **175 KB (three)** = **≈ 543 KB gzip**, cuando deberían ser ≈ 130 KB. En red de planta o 4G, la bienvenida, la lista de equipos y el aviso tardan varios segundos más. En PCs sin WebGL se descarga el 3D completo sin usarlo. | `manualChunks` como función que separe `react` (fragmento PERF-03). Verificar después que `index.html` ya no tenga `modulepreload` de `three` ni de `r3f`. |
| RT-PERF-04 | MEDIUM | `src/components/3d/Scene.tsx:92-94` | `frameloop="always"`: la escena estática se dibuja a 60 FPS de forma continua, con *bloom*, SMAA, sombras PCFSoft (el mapa de sombras se recalcula **cada cuadro**, `autoUpdate` por defecto) y 15 `Html` que proyectan su posición cada cuadro. Sigue igual con un modal o la Biblioteca encima. | En una laptop de aula, la GPU queda ocupada al 100 % mientras el alumno lee un PDF en el visor: calor, ventilador y batería. **[Verificar en navegador con la pestaña Performance]** | `const paused = useApp((s) => !!s.docId \|\| !!s.videoId);` y `<Canvas frameloop={paused ? 'never' : 'always'}>`. Además, `gl.shadowMap.autoUpdate = false` y `gl.shadowMap.needsUpdate = true` en `useFrame` solo si `explode`, `arcDemo` o la regulación están en movimiento (cuando `o.position.distanceToSquared(target) > 1e-6`). |
| RT-PERF-05 | MEDIUM | `src/components/3d/EafModel.tsx:53,102-118` | (a) `needsUpdate = true` en **las 60 mallas** con cada cambio de estado, aunque el emisivo no lo necesita: obliga a recalcular la clave del programa de cada material. (b) `compileAsync` solo precompila el estado inicial: las variantes `transparent` (RAYOS X) y `clippingPlanes` (CORTE) se compilan **en el primer uso**. | El primer clic en RAYOS X o CORTE congela la escena el tiempo que tarde en compilar los *shaders* nuevos. En GPU integrada puede llegar a cientos de ms. **[Verificar en navegador]** | Marcar `needsUpdate` solo si cambia `transparent`, `depthWrite` o el número de planos (fragmento PERF-05), y precompilar las variantes durante la fase `compile`. |
| RT-PERF-06 | MEDIUM | `index.html:8-10` | Se carga una hoja de estilos **externa y bloqueante** de Google Fonts. La arquitectura dice «sin red» y el *build* `web` se describe como autocontenido. | En la red de planta, si el *firewall* descarta (no rechaza) `fonts.googleapis.com`, el navegador espera el *timeout* (de 20 a 75 s) antes de pintar. Además sale la IP del usuario a un tercero. | Alojar las fuentes en el propio sitio (`@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono`, importadas en `main.tsx`) y quitar los `<link>` externos. |
| RT-PERF-07 | MEDIUM | `src/components/3d/Scene.tsx:97,103-109` | `antialias` solo se lee al crear el contexto WebGL: R3F crea `gl` una vez y ya no puede activar MSAA después. En el modo Auto, si se arranca en `medium` (sin AA y con SMAA) y se baja a `low` (sin post), la imagen queda **sin ningún antialias**. Cada cambio de nivel desmonta y monta `EffectComposer`, regenera el `Environment` y recompila los materiales por el cambio de sombras. Esos tirones ocurren justo cuando el equipo ya iba lento. | Un equipo modesto baja de nivel por FPS bajos y recibe un tirón adicional y bordes dentados. | Fijar `antialias: true` (y `multisampling={0}` en el compositor). Subir `flipflops` a 1 en dispositivos `pointer: coarse` o aplicar el cambio de nivel solo cuando haya un *idle* (`requestIdleCallback`). |
| RT-PERF-08 | LOW | `src/components/3d/EafModel.tsx:133` | `new THREE.Vector3(...)` por nodo con despiece, **en cada cuadro**: 14 asignaciones por cuadro (≈ 840 por segundo) aunque `explode=0`. El bucle de *lerp* también recorre unos 80 nodos sin parar. | Presión menor del recolector de basura, que se suma a PERF-04. | `const dirV = useRef(new THREE.Vector3());` y luego `if (dir && explode) tmp.current.addScaledVector(dirV.current.set(dir[0], dir[1], dir[2]), explode);`. Salir del bucle si la escena ya está en reposo. |

### Fragmentos Rendimiento

**PERF-01 — `EafModel.tsx`**
```tsx
const setHover = (sys: string | null) => {
  if (useApp.getState().hoverNode === sys) return;
  useApp.getState().set({ hoverNode: sys });
  document.body.style.cursor = sys ? 'pointer' : 'auto';
};
<primitive object={root} onClick={pick}
  onPointerMove={(e: ThreeEvent<PointerEvent>) => { const h = firstRealHit(e.intersections); setHover(h ? nodeOf(h.object)!.system : null); }}
  onPointerOut={(e: ThreeEvent<PointerEvent>) => { if (!firstRealHit(e.intersections)) setHover(null); }}   // cambiar de triángulo ya no limpia
/>
useEffect(() => () => { document.body.style.cursor = 'auto'; }, []);
```

**PERF-02 — sin *re-render* por el *hash* y con selectores**
```ts
// App.tsx — useHashRoute: reemplaza `const s = useApp()` y el 2.º useEffect
useEffect(() => useApp.subscribe((s, p) => {
  if (s.mode === p.mode && s.selectedEq === p.selectedEq && s.selectedStage === p.selectedStage && s.moduleId === p.moduleId && s.wiId === p.wiId && s.assessmentId === p.assessmentId) return;
  const id = s.mode === 'explore' ? s.selectedEq ?? s.selectedStage : s.mode === 'learn' ? s.moduleId : s.mode === 'perform' ? s.wiId : s.mode === 'assess' ? s.assessmentId : null;
  const h = `#/${s.mode}${id ? `/${id}` : ''}`;
  if (location.hash !== h) (s.mode !== p.mode ? history.pushState : history.replaceState).call(history, null, '', h);
}), []);
// Hotspots.tsx
import { useShallow } from 'zustand/react/shallow';
const { hotspotsVisible, picking, explode, hidden, isolate, selectedEq, focusNodes, selectEquipment, mode } = useApp(useShallow((s) => ({
  hotspotsVisible: s.hotspotsVisible, picking: s.picking, explode: s.explode, hidden: s.hidden, isolate: s.isolate,
  selectedEq: s.selectedEq, focusNodes: s.focusNodes, selectEquipment: s.selectEquipment, mode: s.mode })));
// EafModel.tsx: igual con useShallow, sin hoverNode; el hover se aplica de forma imperativa:
useEffect(() => useApp.subscribe((s, p) => { if (s.hoverNode !== p.hoverNode) applyHover(p.hoverNode, s.hoverNode); }), [info]);
```

**PERF-03 — `vite.config.ts`**
```ts
rollupOptions: { output: { manualChunks(id) {
  if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
  if (id.includes('node_modules/three/')) return 'three';
  if (/node_modules\/(@react-three|postprocessing|camera-controls|three-stdlib|maath|n8ao|troika)/.test(id)) return 'r3f';
} } },
```

**PERF-05 — `EafModel.tsx`**
```ts
const nextTransparent = ghost ? true : m.base.transparent;
const nextClip = s.section && (SECTIONED.includes(m.system) || m.system === 'env__bath') ? 1 : 0;
const programChange = m.mat.transparent !== nextTransparent || (m.mat.clippingPlanes?.length ?? 0) !== nextClip;
m.mat.transparent = nextTransparent; m.mat.clippingPlanes = nextClip ? [SECTION_PLANE] : null; /* … opacity, depthWrite, emissive … */
if (programChange) m.mat.needsUpdate = true;       // el emisivo y la opacidad son uniforms: no hace falta
// fase 'compile' (después de setRoot): precompilar las variantes de RAYOS X y CORTE
const all = info.meshes.map((m) => m.mat);
all.forEach((mt) => { mt.transparent = true; mt.clippingPlanes = [SECTION_PLANE]; mt.needsUpdate = true; });
await gl.compileAsync(scene, camera);
all.forEach((mt, i) => { const b = info.meshes[i].base; mt.transparent = b.transparent; mt.clippingPlanes = null; mt.needsUpdate = true; });
await gl.compileAsync(scene, camera);
```

---

## 4. Decisión requerida del Director

| # | Tema | Opciones | Recomendación | Riesgo si no se decide | Costo | Fecha límite |
|---|---|---|---|---|---|---|
| 1 | Liberación del MVP | **A)** Liberar ahora con los CRITICAL y HIGH como deuda. **B)** Corregir antes los 2 CRITICAL y los 11 HIGH y volver a correr el e2e con las pruebas reforzadas (RT-SW-11). | **B** | Con A: escena vacía al aislar 6 equipos; app en blanco en PCs sin WebGL; evaluación contaminada por respuestas fantasma; destellos sin control. | ≈ 3–4 días de un desarrollador **[Supuesto]**, sin costo externo. | Antes del piloto con alumnos. |
| 2 | Consulta de fichas durante la evaluación (RT-SW-04) | **A)** Permitirla, como prueba a libro abierto, sin perder el progreso (fragmento SW-04). **B)** Bloquear el clic 3D, los *hotspots* y el *sidebar* mientras haya `assessmentId` activo. | **B**: la evaluación mide conocimiento propio. A también es válida si C&D la define como formativa. | Hoy no aplica ninguna de las dos: el alumno pierde todo el progreso. | Igual con A o con B (< 0.5 día) **[Supuesto]**. | Junto con la decisión 1. |
| 3 | Reglas del asistente ante preguntas de anulación (RT-SW-06) | **A)** Regla combinada «protección × anulación» (fragmento SW-06), con más negativas, incluidas algunas falsas. **B)** Mantener la lista cerrada actual. | **A**, validada por ADX-04 (Seguridad, veto). | Respuestas neutras a «¿puedo ignorar el enclavamiento?». | < 0.5 día. | Antes del piloto. |
