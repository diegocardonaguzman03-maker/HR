# Plantilla — Equipo (`Equipment` en `equipment.json`)

| Grupo | Campos | Regla |
|---|---|---|
| Identidad | `id` (`eq.*`), `name`, `shortName`, `hotspotNumber`, `nodeNames` (`eaf__*`), `stageIds` | Los nodos deben existir en el GLB (`eaf.nodes.json`) |
| General (pestaña GENERAL) | `summary`, `function`, `howItWorks[]` | Educativo |
| Operación | `inputs`, `outputs`, `movements`, `operationalNotes`, `observableSignals`, `commonMistakes` | Sin límites ni consignas: van como SME_REQUIRED |
| Componentes | `components[]` → `{id: cmp.*, name, function, nodeName?, failureModes[], inspectionPoints[]}` | `nodeName` = subnodo `eaf__<sistema>_<componente>` |
| Seguridad | `hazardIds` | Detalle en `hazards.json` (ADX-04) |
| Control | `energySources`, `actuators`, `sensors`, `controlSignals`, `dependencies` | Sin lógica de enclavamientos |
| Mantenimiento | `maintenance.{failureModes, inspectionPoints, considerations}` | Las frecuencias y los criterios de aceptación son SME_REQUIRED |
| Enlaces | `documentIds`, `videoIds`, `learningModuleIds` | IDs existentes |
| Control documental | `status`, `sourceIds` | Nada PLANT_APPROVED sin firmas |

**Revisan:** ADX-05 Mantenimiento, ADX-02/03 y ADX-04. Agregar un equipo nuevo requiere su nodo en el GLB, su hotspot en `hotspots.json` y su ancla en `anchors.ts`.
