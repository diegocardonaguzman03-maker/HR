# RED TEAM UX: misiones (prueba con usuario simulado)

**Fecha:** 2026-10-05 · **Rol:** ADX RED UX · **Producto:** ACERÍA DIGITAL ACADEMY, experiencia de misiones (`apps/academy/src/missions/`)
**Misión probada:** `heights-prep`, «Trabajo en Alturas · Preparación de la tarea» (8 pasos, estado DEMO).
**Método:** recorrido cognitivo como trabajador de nuevo ingreso que no ha visto el producto ni recibió explicación. Leí las 10 capturas de `docs/missions/shots/*.png` como imágenes y el código línea por línea: `src/missions/ui/MissionApp.tsx`, `src/missions/ui/MissionPlayer.tsx`, `src/missions/interactions/index.tsx`, `src/missions/scene/MissionScene.tsx`, `src/missions/scene/kinds.tsx`, más `store.ts`, `schema.ts` y `components/ui/Status.tsx` como apoyo. También revisé el contenido de `src/content/missions/heights-prep.json`. **No se ejecutaron** Playwright, builds ni servidores. Lo que depende del navegador real se marca **[Verificar en navegador]**.

> Contenido de la misión: **GENERAL EDUCATIONAL CONTENT**, no **PLANT-APPROVED OPERATING INSTRUCTIONS**. Esta revisión no propone ni valida parámetros, criterios ni secuencias de seguridad. Donde el texto toca criterios de planta se conserva `SME_REQUIRED`.

## Mensaje clave

La estructura de juego funciona: hay una misión, un paso, un escenario y un progreso. El botón grande, el contador `01 / 08` y el botón «Continuar», que se habilita al terminar, se entienden sin explicación. **Dictamen: REDISEÑAR (acotado, no desde cero).** Hay 1 hallazgo CRITICAL y 7 HIGH:
- El paso 2 da por bueno el ejercicio aunque falte un peligro, y nunca se lo muestra al trabajador.
- No existe «muéstrame»: ningún paso trae demostración.
- Las explicaciones de los errores desaparecen a los 7 s.
- Encontrar el daño del arnés se muestra como si fuera un error.
- En el celular, el panel inferior aplasta el escenario.
- En el 3D no se distingue qué objetos se pueden tocar.
- El mensaje de seguridad clave del paso 8 queda escondido en un cajón opcional.

| Severidad | Cantidad |
|---|---|
| CRITICAL | 1 |
| HIGH | 7 |
| MEDIUM | 9 |
| LOW | 7 |

---

## 1. Las 8 preguntas (usuario simulado, sin explicación previa)

| # | Pregunta | Respuesta | Evidencia | Hallazgos |
|---|---|---|---|---|
| 1 | ¿Sabe en qué hacer clic? | **NO** (en el escenario 3D) / SÍ (en los botones) | Los botones grandes son claros: «COMENZAR MISIÓN» (captura 00), «Comenzar paso →» (captura 01), «Verificar», «Continuar». En el 3D, en cambio, el objeto que se puede tocar solo se ilumina al pasar el cursor encima (`MissionScene.tsx:24-25`). En pantalla táctil no hay *hover*, así que no aparece ninguna señal. En el arnés, las zonas pendientes tienen un tinte de 0.18 que casi no se distingue (`kinds.tsx:243`, captura 04). Nada en la pantalla dice «toca aquí». | RT-MUX-05, RT-MUX-09 |
| 2 | ¿Sabe cuál es el objetivo? | **SÍ** (del paso) / débil (de la misión) | Cada paso tiene una instrucción con verbo: «Haz clic en cada peligro que encuentres». El objetivo de la misión, «Completa correctamente la preparación de una tarea en altura» (`heights-prep.json:7`), repite el título y no dice qué tarea es ni cómo se gana. La tarea (cambiar una luminaria) aparece hasta la vista 1 del paso 1. Durante el juego el objetivo deja de verse. | RT-MUX-14 |
| 3 | ¿Sabe en qué paso está? | **SÍ** | `01 / 08` y 8 puntos en el encabezado (`MissionPlayer.tsx:25-28`), «PASO 1 DE 8 · OBSERVA» en la tarjeta y «PASO 1 · OBSERVA» en el panel (captura 01). El dato se repite 3 veces, lo cual es redundante. En el celular los puntos se ocultan, pero el contador queda. | RT-MUX-20 |
| 4 | ¿Sabe cuándo completó la interacción? | **SÍ** | Aparece el texto verde «✓ Correcto…» (`role="status"`, `MissionPlayer.tsx:183`), un mensaje emergente verde, el botón «Continuar» se activa en ámbar y recibe el foco (`MissionPlayer.tsx:149`, capturas 03, 06 y 08). **Excepción grave:** en el paso 2 se completa con 5 de 6 peligros, y el sexto nunca se señala (ver la pregunta 6 y RT-MUX-01). | RT-MUX-01 |
| 5 | ¿Puede recuperarse de un error? | **SÍ** | Todos los tipos permiten reintentar sin perder avance: el distractor solo suma un error, las casillas se pueden desmarcar y el orden se puede volver a mover. El mensaje rojo dice «↻ … Intenta de nuevo» (captura 02). No se puede regresar al paso anterior para repasar, pero eso no bloquea. | RT-MUX-22 |
| 6 | ¿Entiende por qué una respuesta fue incorrecta? | **NO** (inconsistente) | Las respuestas a elegir sí explican el error («No. El equipo de protección no se repara en campo»). Pero: (a) la explicación vive en un mensaje que se borra solo a los 7 s (`MissionPlayer.tsx:38`) y no queda en ningún lado; (b) en «Confirma», el mensaje solo dice «Falta 1 requisito. Piensa qué te protege…» (`interactions/index.tsx:118`), sin decir cuál ni por qué; (c) en «Ordena», el mensaje dice «2 acciones están fuera de lugar» y repite siempre la misma pista general (`interactions/index.tsx:232`), sin decir por qué ese orden importa; (d) «¿Por qué?» muestra el porqué del paso, no el del error. | RT-MUX-03, RT-MUX-07, RT-MUX-10 |
| 7 | ¿Encuentra el detalle técnico sin salir de la misión? | **SÍ** | «📄 Procedimiento», «? ¿Por qué?» y «✦ Preguntar» abren un cajón encima del escenario con «Volver al paso ✕» (`MissionPlayer.tsx:53-101`). Solo se muestra la sección que corresponde al paso. Advertencia: casi todo el detalle es `SME_REQUIRED`, así que el trabajador encuentra el lugar pero no el dato. Eso es correcto mientras no haya procedimiento aprobado. | RT-MUX-12, RT-MUX-21 |
| 8 | ¿Empieza a aprender en unos 10 segundos? | **NO** (cerca, ≈ 15–25 s) | La primera visita abre con el aviso de registro: un párrafo de 3 líneas y 3 botones encima del botón principal (captura 00). Después siguen «COMENZAR MISIÓN», «Preparando el escenario…», la tarjeta del paso con 3 líneas de «por qué» y «Comenzar paso». Son 2 o 3 clics y unas 60 palabras antes de la primera acción. Esa primera acción es pasiva («Siguiente vista»). | RT-MUX-11, RT-MUX-13 |

**Resultado: 5 SÍ / 3 NO.** Los tres NO (clic en el 3D, explicación del error y arranque en 10 s) son los que el Director definió como la esencia del rediseño. Sin corregirlos no se cumple «muéstrame, explícame, déjame intentarlo, revísame».

---

## 2. Hallazgos

Los números de línea corresponden al archivo indicado.

### CRITICAL

**RT-MUX-01 · CRITICAL · `src/content/missions/heights-prep.json:154` + `src/missions/interactions/index.tsx:71` y `:91-97`. El paso de peligros se aprueba con un peligro sin identificar y nunca se le muestra al trabajador.**
- **Problema:** hay 6 objetivos (`targets`) y `required: 5`. Al encontrar 5, el paso termina con «Bien. Encontraste los peligros principales» y el peligro que faltó, por ejemplo la **línea eléctrica aérea**, no se marca ni en el 3D ni en la lista. Además, el contador «1 de 5 identificados» le hace creer al trabajador que solo hay 5. En formación de seguridad, eso enseña que dejar un peligro sin ver es aceptable.
- **Corrección exacta:**
  1. Contenido: `"required": 6`. Si se quiere tolerancia, conservar 5 pero aplicar la corrección 2 sin falta.
  2. `interactions/index.tsx:71`, al terminar, revelar los faltantes:
  ```tsx
  if (nf.length >= step.required) {
    const missed = step.targets.filter((x) => !nf.includes(x.objectId));
    set({ interactive: [], markers: [
      ...nf.map((oid) => ({ objectId: oid, kind: 'found' as const, label: step.targets.find((z) => z.objectId === oid)!.label })),
      ...missed.map((x) => ({ objectId: x.objectId, kind: 'wrong' as const, label: `No lo viste: ${x.label}` })),
    ] });
    if (missed.length) toast('info', `Te faltó ${missed.length === 1 ? '1 peligro' : `${missed.length} peligros`}`, missed.map((x) => `${x.label}: ${x.why}`).join(' '));
    onDone(mistakes.current + missed.length);
  }
  ```
  3. `interactions/index.tsx:87`: `{found.length} de {step.targets.length} peligros encontrados`.
  4. Texto `done` (`heights-prep.json:208`): «Bien. Revisa la lista: cada peligro necesita un control antes de empezar.»

### HIGH

**RT-MUX-02 · HIGH · `src/missions/ui/MissionPlayer.tsx:125` + `heights-prep.json` (ningún paso tiene `show`). No existe «muéstrame».**
- **Problema:** el esquema prevé `show` (SHOW ME, `schema.ts:44`), pero los 8 pasos lo traen vacío. «▶ Demostración» solo mueve la cámara y vuelve a mostrar el texto de `why` como subtítulo. Ningún paso demuestra la acción antes de pedirla. Además, el botón está en la fila de ayuda: no forma parte del flujo, así que el trabajador nuevo no lo verá.
- **Corrección exacta:**
  1. Agregar `show` a cada paso que no sea `observe`. Por ejemplo, en `identificar-peligros`: `"show": [{ "camera": {…cámara del paso…}, "focus": ["abertura"], "caption": "Así se ve un peligro: una abertura sin cubrir. Haz clic sobre él." }]`. El texto es GENERAL EDUCATIONAL CONTENT y se ilustra con un peligro que el ejercicio ya da como ejemplo.
  2. En `StepIntro` (`MissionPlayer.tsx:113`), poner dos botones en el flujo:
  ```tsx
  <div className="mt-5 flex justify-center gap-2">
    {hasShow && <button onClick={onShow} className="rounded-xl border border-white/25 px-5 py-3 font-semibold">▶ Muéstrame (10 s)</button>}
    <button ref={btn} onClick={onStart} className="rounded-xl bg-[var(--color-accent)] px-6 py-3 font-bold text-[#1a1203]" data-testid="step-start">Déjame intentarlo →</button>
  </div>
  ```
  3. Agregar una regla de validación en `schema.ts`: `type !== 'observe'` ⇒ `show.length >= 1`.

**RT-MUX-03 · HIGH · `src/missions/ui/MissionPlayer.tsx:38` y `:183-186`. La explicación del error se borra sola y no queda en ningún lugar.**
- **Problema:** el mensaje rojo desaparece a los 7 s (y el verde a los 5.5 s). El trabajador que lee despacio o que mira el 3D pierde el «por qué». Además, el contenido cambia por tiempo sin control del usuario, lo que incumple WCAG 2.2.1. El panel del paso no guarda la última retroalimentación.
- **Corrección exacta:**
  1. Línea 38: `if (!fb || fb.kind === 'bad') return;`. Los mensajes rojos no se cierran solos, solo con ✕ o con el siguiente intento.
  2. Guardar la última retroalimentación y mostrarla en el panel, bajo la instrucción:
  ```tsx
  {phase === 'try' && lastBad && <p className="mt-1 rounded-lg border-l-4 border-[#e5484d] bg-[#2a1214] px-3 py-2 text-[14px]" role="status"><strong>Por qué no:</strong> <OpText text={lastBad.text} /></p>}
  ```
  `lastBad` se guarda en el store dentro de `toast()` cuando `kind === 'bad'` y se limpia en `resetStepScene`.

**RT-MUX-04 · HIGH · `src/missions/interactions/index.tsx:153` + `MissionPlayer.tsx:45`. Encontrar el defecto del arnés se presenta como si fuera un error.**
- **Problema:** al revisar la correa dañada aparece un mensaje **rojo** con «↻ Correa de pierna: DAÑO · *Intenta de nuevo*» (captura 04). El trabajador hizo exactamente lo correcto, pero el sistema le dice que lo intente de nuevo. Eso confunde y además castiga visualmente la conducta que se quiere reforzar.
- **Corrección exacta:**
  - Línea 153: `toast(z.defect ? 'info' : 'ok', z.defect ? `¡Bien visto! ${z.label}: DAÑO` : `${z.label}: en buen estado`, z.finding);`.
  - `MissionPlayer.tsx:45`: mostrar «Intenta de nuevo» solo si `fb.kind === 'bad' && !fb.noRetry`. Basta con no usar `bad` para hallazgos.
  - Mantener el chip en rojo con «⚠» para el **estado del arnés**, que sí es correcto.

**RT-MUX-05 · HIGH · `src/missions/scene/MissionScene.tsx:24-25` y `kinds.tsx:243`. En el 3D no se distingue qué se puede tocar, sobre todo con pantalla táctil.**
- **Problema:** el resaltado aparece solo con `hover`, y en tableta o celular no existe. Las zonas del arnés tienen un tinte de 0.18 que no se ve (captura 04). La instrucción «Haz clic en las 6 zonas marcadas» habla de marcas que no se ven.
- **Corrección exacta:**
  - `MissionScene.tsx:24-25`:
  ```tsx
  const tint = marker === 'found' || marker === 'selected' ? GREEN : marker === 'wrong' ? RED : focused ? BLUE : interactive ? AMBER : null;
  const amount = marker ? 0.45 : focused ? 0.35 : interactive ? (hover ? 0.4 : 0.14) : 0;
  ```
  - Durante los primeros 3 s de cada paso interactivo, mostrar un aro pulsante (`mission-hint`) sobre cada objeto tocable.
  - `kinds.tsx:243`: `amount: st === 'pending' ? 0.32 : st ? 0.45 : 0`.
  - Instrucción del paso 4 (`heights-prep.json:303`): «Toca cada parte del arnés que brilla en ámbar (o usa los botones de abajo). Luego decide si se puede usar.»

**RT-MUX-06 · HIGH · `src/missions/ui/MissionPlayer.tsx:159` y `:177`. En el celular (y en la tableta vertical) el panel aplasta el escenario.**
- **Problema:** `main` es `flex-1 min-h-0` y el panel no tiene altura máxima ni desplazamiento. En el paso 2 con lista (9 botones), en el paso 3 (6 casillas con detalle) y en el paso 7 (5 filas), el panel puede ocupar toda la pantalla, el lienzo 3D queda en 0–100 px y la tarjeta `StepIntro` (centrada con `absolute inset-0`) se corta. Además, el aviso de registro de la primera visita resta otros ≈ 150 px (captura 01). **[Verificar en navegador a 360×740 y 768×1024]**
- **Corrección exacta:**
  - Línea 159: `<main className="relative min-h-[45vh] flex-1 sm:min-h-0" …>`.
  - Línea 177: agregar `max-h-[50vh] overflow-y-auto scroll-thin` al `section`.
  - En pantallas angostas (`< sm`), fijar el botón «Continuar» abajo con `sticky bottom-0` para que nunca quede fuera de la vista.

**RT-MUX-07 · HIGH · `src/missions/ui/MissionPlayer.tsx:76` + `heights-prep.json:609`. El mensaje de seguridad clave del paso 8 depende de abrir un cajón opcional.**
- **Problema:** «Cualquier persona puede detener una tarea si una condición no se cumple…» solo aparece si el trabajador abre «? ¿Por qué?». Es la idea más importante de la misión y la mayoría no la verá. Además, la frase «Detenerte por seguridad nunca se sanciona» es una **afirmación de política laboral** sin validar.
- **Corrección exacta:**
  1. Mostrar `step.safety` siempre en el panel al terminar el paso (`MissionPlayer.tsx:183`), con texto e icono y no solo color:
  ```tsx
  {phase === 'done' && step.safety && <p role="note" className="mt-2 rounded-lg border border-[#f5c518]/60 bg-[#f5c518]/10 p-2.5 text-[14px]"><strong>⚠ Importante de seguridad:</strong> <OpText text={step.safety} /></p>}
  ```
  2. Texto (`heights-prep.json:609`): «Cualquier persona puede detener una tarea si una condición no se cumple. SME_REQUIRED: política de la planta sobre el derecho a detener la tarea (Seguridad + Relaciones Laborales).» Así no se promete «nunca se sanciona» sin validación. Debe pasar por `experto-relaciones-laborales` y `experto-seguridad-salud`.

**RT-MUX-08 · HIGH · `src/missions/interactions/index.tsx:91` y `MissionPlayer.tsx:204`. Con teclado o lector de pantalla, el paso 2 depende de encontrar «Usar lista».**
- **Problema:** el lienzo 3D no se puede usar con teclado. En `identify`, la lista de elementos solo aparece si `listMode` está activo, y ese botón es el quinto de la fila de ayuda. Un usuario de lector de pantalla escucha «Haz clic en cada peligro» y no tiene nada que activar. En `select` la lista sí aparece por defecto si falta algún `objectId`, pero en este paso no falta ninguno.
- **Corrección exacta:**
  - Mostrar la lista **siempre**, debajo del 3D, como alternativa equivalente: `{(true) && (…)}` en la línea 91 y `showList = true` en la línea 204 (`select`).
  - Si se quiere conservar el reto visual en el 3D, renderizar la lista como `sr-only focus-within:not-sr-only` para que aparezca al llegar con Tab.
  - Retirar el botón «Usar lista/Usar 3D» (`MissionPlayer.tsx:204`).

### MEDIUM

**RT-MUX-09 · MEDIUM · `src/missions/interactions/index.tsx:155-166`. «Inspecciona» no pide inspeccionar: el sistema da la respuesta.**
- **Problema:** al tocar una zona, el sistema dice «en buen estado» o «DAÑO». El trabajador no hace ningún juicio, solo da clics. Falta el «déjame intentarlo».
- **Corrección:** al tocar la zona, mostrar dos botones, «Se ve bien» y «Tiene daño», y comparar con `z.defect`. Si falla, contar el error y mostrar `z.finding`. El contenido no cambia.

**RT-MUX-10 · MEDIUM · `src/missions/interactions/index.tsx:118` y `:232`. Los mensajes de error en «Confirma» y «Ordena» no explican.**
- **Corrección:**
  - Línea 118, a partir del segundo intento, nombrar el faltante: `mistakes.current >= 2 ? `Falta: «${missing[0].label}». ${missing[0].feedback}` : …`.
  - Línea 232: `toast('bad', …, `${label(order[bad[0]])} va en otro lugar. ${step.hint}`)`.
  - Agregar en el contenido un `why` por acción del orden: GENERAL EDUCATIONAL CONTENT, y la secuencia sigue como `SME_REQUIRED`.

**RT-MUX-11 · MEDIUM · `src/missions/ui/MissionApp.tsx:141`. El aviso de registro compite con el botón principal en los primeros 10 segundos.**
- **Problema:** lo primero que lee un trabajador nuevo es un párrafo de privacidad con 3 botones, encima de «COMENZAR MISIÓN» (captura 00).
- **Corrección:** reducirlo a una línea bajo el botón: «Guardamos tu avance solo en este equipo, sin tu nombre. [Detalles]». El texto completo va en «Privacidad y registro». Antes de cambiar el texto, confirmar con `experto-relaciones-laborales` que la versión corta cumple lo acordado sobre el aviso.

**RT-MUX-12 · MEDIUM · `src/missions/interactions/index.tsx:131`. El texto «SME_REQUIRED: …» aparece en crudo dentro de las casillas.**
- **Problema:** la etiqueta interna se ve tal cual en el paso 3 (captura 03) y no se presenta con el formato de `OpText`. Para un trabajador nuevo es jerga y suma carga cognitiva.
- **Corrección:** `<span className="block text-[11.5px] font-normal text-white/55"><OpText text={it.detail} /></span>`. Mejor aún, mover el detalle `SME_REQUIRED` al cajón «Procedimiento» y dejar en la casilla solo la etiqueta.

**RT-MUX-13 · MEDIUM · `src/missions/ui/MissionPlayer.tsx:104-116`. La tarjeta de inicio del paso explica el «por qué», pero no el «qué vas a hacer».**
- **Problema:** muestra `step.why` (3 líneas) y no `step.instruction`. El trabajador pulsa «Comenzar paso» sin saber qué se le pedirá, y luego tiene que leer otro texto abajo.
- **Corrección (línea 112):** `<p className="… text-[17px] text-white"><OpText text={step.instruction} /></p><p className="mt-2 text-[13.5px] text-white/60">{step.why}</p>`. Además, eliminar la tarjeta en el paso 1 y empezar directo en la vista 1.

**RT-MUX-15 · MEDIUM · `src/missions/ui/MissionPlayer.tsx:199-205`. Hay demasiados elementos persistentes.**
- **Problema:** el Director pidió 4 (Misión, Paso, Escenario y Progreso). Hoy, además, siempre están visibles 4 o 5 botones de ayuda, el texto «Se habilita…», el pie de aviso y el enlace «← Mapa».
- **Corrección:** agrupar en un solo botón «¿Necesitas ayuda?» que despliegue Por qué, Procedimiento y Preguntar. «Muéstrame» pasa a la tarjeta del paso (RT-MUX-02).

**RT-MUX-16 · MEDIUM · `src/missions/interactions/index.tsx:126` y `:240`. En «Confirma» y «Ordena», el error se señala solo con color.**
- **Problema:** la casilla inválida o la fila fuera de lugar solo cambian el borde a rojo. Eso incumple WCAG 1.4.1 y no llega al lector de pantalla.
- **Corrección:** agregar texto e icono: `{wrongAt.includes(i) && <span className="text-[12px] text-[#ff9592]">✗ fuera de lugar</span>}` y `aria-invalid`. Lo mismo en `Confirm` con «✗ no es válido».

**RT-MUX-17 · MEDIUM · `src/missions/ui/MissionPlayer.tsx:67`. El cajón de ayuda no es un diálogo accesible completo.**
- **Problema:** no tiene `aria-modal`, no atrapa el foco y al cerrarlo el foco no regresa al botón que lo abrió.
- **Corrección:** `role="dialog" aria-modal="true"`, guardar `document.activeElement` al abrir y llamar a `.focus()` al cerrar. Atrapar Tab dentro del `aside`.

**RT-MUX-18 · MEDIUM · Carga de texto por paso.**
- **Problema:** el paso 3 suma ≈ 120 palabras visibles: instrucción, pregunta, 6 etiquetas, 6 detalles y el mensaje. El paso 4 suma ≈ 90 palabras, más un mensaje cada vez que se toca una zona.
- **Corrección:** máximo 1 instrucción de ≤ 15 palabras y opciones de ≤ 8 palabras. Ejemplo para el paso 3: instrucción «Marca solo lo que debe estar listo antes de subir.» (se elimina `prompt`, que repite lo mismo).

### LOW

**RT-MUX-14 · LOW · `heights-prep.json:7`. El objetivo de la misión es circular.**
- **Corrección:** «Prepara el cambio de una luminaria a 4 m de altura: encuentra los peligros, revisa tu equipo y decide si se puede empezar.»

**RT-MUX-19 · LOW · `src/missions/ui/MissionPlayer.tsx:194-198`. El botón «Continuar» aparece deshabilitado sin explicación mientras se ve la tarjeta del paso.**
- **Problema:** la leyenda solo aparece en `phase !== 'intro'` (captura 01). Además, el texto «Se habilita…» mide 11.5 px y tiene opacidad de 45 %, lo que da poco contraste.
- **Corrección:** ocultar el botón en `phase === 'intro'` y subir la leyenda a `text-[12.5px] text-white/65`, con `aria-describedby` en el botón.

**RT-MUX-20 · LOW · `src/missions/ui/MissionPlayer.tsx:24`. El aviso de paso para el lector de pantalla no se anuncia.**
- **Problema:** «PASO n» está triplicado en pantalla, pero el `aria-label` se colocó en un `div` sin rol, así que el lector de pantalla lo ignora.
- **Corrección:** `<div role="group" aria-label=…>` o un `<p className="sr-only" aria-live="polite">Paso {i+1} de {n}: {step.title}</p>`. Quitar «PASO n · TIPO» del panel, porque ya está en el encabezado.

**RT-MUX-21 · LOW · `src/missions/ui/MissionPlayer.tsx:203`. «✦ Preguntar» sugiere un asistente de IA, pero muestra preguntas frecuentes fijas.**
- **Corrección:** cambiar la etiqueta a «Preguntas frecuentes» y el icono a «?».

**RT-MUX-22 · LOW · `src/missions/ui/MissionPlayer.tsx:151-154`. No hay forma de volver al paso anterior para repasar.**
- **Corrección:** agregar «← Paso anterior» en modo solo lectura (`phase: 'done'`) cuando `stepIdx > 0`.

**RT-MUX-23 · LOW · `heights-prep.json:287`. Error de redacción.**
- **Corrección:** «Correcto. Con los requisitos confirmados, ahora prepara tu equipo.»

**RT-MUX-24 · LOW · `docs/missions/shots/00-inicio.png`, `01-intro-paso.png`. Las capturas están desactualizadas.**
- **Problema:** muestran «También lo encuentras en EVALUAR» y el aviso dentro del juego, pero el código actual (`MissionApp.tsx:141`) ya lo cambió. Si las capturas se usan como evidencia de liberación, inducen a error.
- **Corrección:** regenerarlas antes de la presentación al Director.

### Revisión transversal solicitada

| Tema | Estado | Hallazgos |
|---|---|---|
| Carga cognitiva | Alta en los pasos 3 y 4. Hay 7 a 9 controles visibles a la vez. | RT-MUX-15, RT-MUX-18 |
| Texto por paso | 60–120 palabras; la meta propuesta es ≤ 40. | RT-MUX-12, RT-MUX-13, RT-MUX-18 |
| Botones deshabilitados sin explicación | «Continuar» se explica durante el intento, pero no en la tarjeta de inicio. Las flechas ↑/↓ en los extremos se entienden solas. | RT-MUX-19 |
| Móvil y tableta | El panel aplasta el 3D; el resaltado por *hover* no existe en pantalla táctil. **[Verificar en navegador]** | RT-MUX-05, RT-MUX-06 |
| Teclado y lector de pantalla | El 3D no tiene alternativa por defecto en «Identifica»; el cajón no atrapa el foco; los mensajes se borran solos. | RT-MUX-03, RT-MUX-08, RT-MUX-17, RT-MUX-20 |
| Seguridad sin depender solo de la vista | Los mensajes llevan texto e icono (bien). Los errores en «Confirma» y «Ordena» solo usan color; el mensaje de «detener la tarea» está oculto; el peligro omitido no se señala. | RT-MUX-01, RT-MUX-07, RT-MUX-16 |

---

## 3. Dictamen: **REDISEÑAR (acotado)**

La arquitectura (misión → paso → escenario → progreso, 8 tipos de interacción y retroalimentación inmediata) es correcta y se conserva. **No se libera** mientras sigan abiertos RT-MUX-01 (CRITICAL) y los 7 HIGH, porque incumplen tres de los cuatro verbos pedidos («muéstrame» no existe y «revísame» se borra solo) y uno de ellos enseña una conducta insegura. Las correcciones son puntuales: no exigen reescribir el motor. Cuando estén aplicadas, hay que repetir esta prueba y una sesión con 5 trabajadores reales de nuevo ingreso.

## Decisión requerida del Director

| Opción | Qué implica | Riesgo |
|---|---|---|
| **A. Rediseño acotado y luego piloto** | Corregir el CRITICAL y los 7 HIGH (código + contenido de `heights-prep.json`). Validar los textos de seguridad y política con `experto-seguridad-salud` y `experto-relaciones-laborales`. Repetir la prueba con 5 trabajadores reales antes del piloto. | Retrasa el piloto ≈ 1–2 semanas **[Supuesto]**. |
| **B. Piloto inmediato tal como está** | Usar la versión actual con la advertencia de que es DEMO. | Se enseña que omitir un peligro es «Bien» (RT-MUX-01). Los usuarios de celular o de lector de pantalla quedan fuera. El requisito «muéstrame» no se cumple, así que el rediseño pedido no se puede evaluar. |

**Recomendación:** **A.** Costo: solo horas internas del equipo de la Academia, sin gasto externo **[Supuesto]**.
**Fecha límite para decidir:** 2026-10-12.
