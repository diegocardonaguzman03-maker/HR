# Motor de misiones — cómo funciona y cómo agregar una misión

**Mensaje clave:** la academia pasó de «explorar información» a **completar una misión**. La pantalla muestra solo cuatro cosas: **Misión**, **Paso**, **Escenario** y **Progreso**. Todo lo demás aparece cuando se necesita. Una misión nueva (LOTO, espacios confinados, grúas, EAF…) es **contenido JSON**, no código.

## La experiencia (Misión 01 — Trabajo en Alturas, Preparación)
1. **Pantalla inicial:** MISIÓN 01, el objetivo, «0 / 8 pasos · ~10 min» y un botón grande: COMENZAR MISIÓN.
2. **Cada paso** sigue cuatro tiempos:
   - **Muéstrame:** demostración corta en el escenario, con subtítulo; se puede saltar.
   - **Explícame:** una frase de por qué importa y «lo que vas a hacer».
   - **Déjame intentarlo:** la interacción, en el escenario o en la lista accesible.
   - **Revísame:** retroalimentación inmediata. Si aciertas, dice por qué es correcto; si te equivocas, qué reconsiderar. El error no se borra solo y siempre puedes reintentar.
3. **CONTINUAR** se habilita solo al completar el paso.
4. **Ayuda sin salir de la misión:**
   - **¿Por qué?** (nivel 2);
   - **Demostración**;
   - **Procedimiento (demo)** (nivel 3);
   - **Preguntas**: respuestas curadas para el paso. El chat libre está desactivado por la decisión de Seguridad.
   Se abren encima del escenario y, al cerrarlas, vuelves al mismo paso.
5. **Resultado:**
   - decisiones correctas al primer intento;
   - tiempo;
   - aciertos por tema;
   - recomendación;
   - lo que fallaste, con lo que elegiste;
   - aviso de **errores críticos** si elegiste algo potencialmente fatal (la misión no se marca como completada).
6. **Mapa de aprendizaje:** las misiones aparecen en orden, con su estado: completadas, la actual y las bloqueadas.

| Paso | Tipo | Interacción |
|---|---|---|
| 1 Entiende la tarea | OBSERVE | Recorrido guiado de 3 vistas y confirmación |
| 2 Identifica los peligros | IDENTIFY | Encontrar los 7 peligros en 3D (con pista) |
| 3 Valida requisitos y autorización | CONFIRM | Lista de verificación con trampas («es rápido…») |
| 4 Inspecciona tu arnés | INSPECT | Juzgar 6 zonas a partir de lo que se ve y decidir qué hacer con el equipo dañado |
| 5 Revisa el acceso y la protección | IDENTIFY | Escalera, barandales y borde |
| 6 Elige el punto de anclaje | SELECT | Punto designado o distractores (conduit, charola, barandal) |
| 7 Ordena la revisión previa | SEQUENCE | Orden de práctica (ilustrativo) |
| 8 Confirma si puedes iniciar | DECIDE | Escenario con los controles aplicados, pero sin rescate disponible: no se inicia |

> **DEMOSTRACIÓN.** La secuencia es ilustrativa. Antes de usarse en operación se reemplaza por el procedimiento aprobado de la planta, validado por Operaciones y Seguridad. Todo dato específico de planta aparece como `SME_REQUIRED`.

## Arquitectura
```
src/missions/
  schema.ts        contrato (zod): Mission, Step (8 tipos), SceneDef y checkMission()
  content.ts       carga y valida src/content/missions/*.json
  store.ts         estado de la misión (paso, fase, resultados, marcadores, retroalimentación); el avance se guarda en el equipo
  scene/kinds.tsx  biblioteca de objetos del escenario (plataforma, escalera, barandal, arnés con zonas…)
  scene/MissionScene.tsx  escenario R3F: solo lo interactivo del paso reacciona; marcadores y cámara
  interactions/    OBSERVE · IDENTIFY · CONFIRM · INSPECT · SELECT · SEQUENCE · DECIDE · DEMONSTRATE
  ui/              MissionApp (inicio, mapa, resultado) y MissionPlayer (encabezado, escenario, panel, ayuda)
src/content/missions/
  heights-prep.json    misión
  scene-heights.json   escenario (objetos con id, tipo, posición, props y descripción)
  course-heights.json  mapa del curso
```

## Agregar una misión nueva
1. **Escenario:** crea `scene-<tema>.json` con objetos de la biblioteca (`kind`). Cada objeto lleva `id`, `label` neutro (que no revele la respuesta) y `desc` (qué se ve; es la alternativa no visual). Si falta un tipo de objeto, agrégalo a `scene/kinds.tsx`.
2. **Misión:** crea `<id>.json` con `steps`. Por paso:
   - `type`, `title` (verbo corto), `instruction` (1–2 frases), `why`, `camera`, `mastery`, `show` (demostración sin revelar la respuesta), `faq`, `reference` (secciones del procedimiento), `done` y `critical`;
   - los campos del tipo: `targets` o `distractors`, `items`, `zones` (`observation` y `defect`), `options` (exactamente una correcta) y `sceneChange`.
3. **Regístrala** en `content.ts` y en el curso.
4. Corre `npm test`: `checkMission` valida objetos, áreas, secciones, una sola opción correcta y que en IDENTIFY haya que encontrar todo.
5. **Revisión obligatoria:**
   - ADX-04 Seguridad (veto);
   - ADX-02/03 Operaciones y Metalurgia;
   - ADX-07 Formación;
   - red team de UX con un usuario simulado (8 preguntas).
   Nada pasa a `PLANT_APPROVED` sin las firmas de Seguridad y Operaciones.

## Reglas de diseño (no negociables)
- En el escenario solo reacciona lo que es parte del **paso actual**. Los puntos ámbar marcan lo que se puede tocar, igual en objetivos y distractores.
- La información crítica nunca va solo por color: siempre lleva texto e icono (✓, ✗, ⚠).
- Sin monedas, avatares, rankings ni insignias. La motivación viene de la progresión, el dominio, el desbloqueo y la retroalimentación.
- Unos 70 % escenario, 20 % instrucción y 10 % estado.
- Aviso permanente: no sustituye procedimientos ni certifica competencia.
