# Esquema de contenido — ACERÍA DIGITAL ACADEMY

El contenido industrial vive en `src/content/*.json`. El esquema y las referencias cruzadas se validan con `src/lib/content/schema.ts`, que es la fuente de verdad. Para validarlo, corre `npm run check:content`.

## Archivos
| Archivo | Tipo (schema.ts) | Dueño del contenido |
|---|---|---|
| `sources.json` | `Source[]` | ADX-01 |
| `processes.json` | `ProcessStage[]` | ADX-02 (metalurgia) + ADX-03 (operación) |
| `equipment.json` | `Equipment[]` | ADX-05 (mantenimiento), con aportes de 02/03 |
| `hazards.json` | `Hazard[]` | ADX-04 (seguridad, veto) |
| `hotspots.json` | `Hotspot[]` | ADX-09 (3D) |
| `work-instructions.json` | `WorkInstruction[]` | ADX-06 |
| `training.json` | `TrainingModule[]` | ADX-07 |
| `questions.json` | `Question[]` | ADX-07 |
| `assessments.json` | `Assessment[]` | ADX-07 |
| `documents.json` | `DocumentItem[]` | ADX-06 / ADX-11 |
| `videos.json` | `Video[]` | ADX-11 |
| `glossary.json` | `GlossaryTerm[]` | ADX-07 |

## Reglas de redacción
1. **Español de México**, frases cortas, para alguien de nuevo ingreso. Términos técnicos explicados en el glosario.
2. **Nunca inventes datos de planta.** Valores, setpoints, límites, temperaturas, presiones, adiciones, pasos de LOTO, enclavamientos, permisos y secuencias críticas se escriben como `SME_REQUIRED: <qué dato falta y quién lo da>`.
   Ejemplo: `"SME_REQUIRED: distancia de la zona de exclusión del procedimiento de seguridad aprobado (C-16)"`.
3. Una descripción **general de la industria** se puede escribir siempre que lo sea; por ejemplo, «los electrodos de grafito conducen la corriente y forman el arco».
4. **Estado (`status`)** de cada objeto:
   - `GENERAL_EDUCATIONAL`: conocimiento general;
   - `DEMO`: demostración del producto;
   - `DRAFT_NOT_VALIDATED`: viene de un borrador interno de `10-plantas/`;
   - `SME_REQUIRED`: depende sobre todo de datos de planta;
   - `PLANT_APPROVED`: está **prohibido** en el MVP.
5. Toda pieza cita sus fuentes en `sourceIds`.
6. Contexto GASM (D-010):
   - el EAF trabaja con ≈ 95–100 % de DRI de HYL y Midrex, que llega por bandas a silos de día y entra por el 5.º agujero;
   - se recirculan retornos internos ≤ 5 % con canasta ocasional;
   - **no hay chatarra comprada**.

## Catálogo de IDs (contrato fijo entre contenido y 3D)
### Etapas del proceso (`stage.*`)
| ID | Código | Nombre |
|---|---|---|
| `stage.raw` | 01 | Materias primas: DRI y retornos |
| `stage.charge` | 02 | Carga y pie líquido |
| `stage.melt` | 03 | Fusión **(etapa MVP)** |
| `stage.refine` | 04 | Afino y escoria espumosa |
| `stage.tap` | 05 | Vaciado |
| `stage.secondary` | 06 | Metalurgia secundaria (sale del módulo) |

### Equipos y hotspots (`eq.*` ↔ `hs.*` ↔ nodos del GLB)
| N.º | Equipo (`eq.`) | Hotspot (`hs.`) | Nodo GLB | Sistema MVP |
|---|---|---|---|---|
| 01 | `eq.shell` Coraza y solera | `hs.shell` | `eaf__shell` | |
| 02 | `eq.roof` Bóveda y delta | `hs.roof` | `eaf__roof` | |
| 03 | `eq.electrodes` Electrodos de grafito | `hs.electrodes` | `eaf__electrodes` | ★ |
| 04 | `eq.electrode-arms` Brazos, mástiles y regulación | `hs.electrode-arms` | `eaf__arms` | ★ |
| 05 | `eq.transformer` Transformador del horno | `hs.transformer` | `eaf__transformer` | ★ |
| 06 | `eq.secondary-circuit` Barras y cables flexibles | `hs.secondary-circuit` | `eaf__secondary` | ★ |
| 07 | `eq.oxygen-carbon` Lanzas de O₂, quemadores e inyección de carbono | `hs.oxygen-carbon` | `eaf__oxygen` | |
| 08 | `eq.slag-door` Puerta de escoria | `hs.slag-door` | `eaf__slagdoor` | |
| 09 | `eq.ebt` Vaciado EBT y fosa | `hs.ebt` | `eaf__ebt` | |
| 10 | `eq.hydraulics` Sistema hidráulico | `hs.hydraulics` | `eaf__hydraulics` | |
| 11 | `eq.refractory` Refractario | `hs.refractory` | `eaf__refractory` | |
| 12 | `eq.cooling` Paneles enfriados por agua | `hs.cooling` | `eaf__cooling` | |
| 13 | `eq.fume` Extracción de humos (4.º agujero) | `hs.fume` | `eaf__fume` | |
| 14 | `eq.dri-feed` Alimentación de DRI (5.º agujero) | `hs.dri-feed` | `eaf__drifeed` | |
| 15 | `eq.control-room` Púlpito de control | `hs.control-room` | `eaf__control` | |

Los componentes (`cmp.*`) pueden ligarse a subnodos `eaf__<sistema>_<componente>`, por ejemplo `eaf__arms_clamp`, `eaf__electrodes_joint` o `eaf__arms_mast`.

### Peligros (`haz.*`)
`haz.molten-metal` · `haz.water-molten-metal` (incluye DRI húmedo) · `haz.electrical` (arco, circuito secundario y alta tensión) · `haz.stored-energy` (hidráulica, gravedad, resortes) · `haz.oxygen` · `haz.gas-co` (CO, gases del horno, gas natural) · `haz.thermal` · `haz.suspended-load` · `haz.height` · `haz.line-of-fire` · `haz.noise-dust` · `haz.confined-space`

### Fuentes (`src.*`)
| ID | Documento | Estado |
|---|---|---|
| `src.industry-general` | Conocimiento general de la industria del EAF | GENERAL_EDUCATIONAL |
| `src.demo` | Contenido de demostración ADX | DEMO |
| `src.cv-gasm-001` | `10-plantas/00-cadena-de-valor/CV-GASM-001-cadena-de-valor.md` | DRAFT_NOT_VALIDATED |
| `src.ft-ace-001` | `10-plantas/01-steelmaking/00-ficha-tecnica-acería.md` (v0.4) | DRAFT_NOT_VALIDATED |
| `src.mo-eaf-02` … `src.mo-eaf-08` | Manuales `10-plantas/01-steelmaking/02-operacion/eaf/MO-EAF-0N-*.md` | DRAFT_NOT_VALIDATED |
| `src.ms-ace-01` … `src.ms-ace-10` | Manuales de seguridad `10-plantas/01-steelmaking/04-seguridad/MS-ACE-*.md` | DRAFT_NOT_VALIDATED |

### Entrenamiento, documentos y medios
| ID | Qué es |
|---|---|
| `mod.eaf-orientation` | Orientación al EAF: etapas y equipos (niveles 1–2) |
| `mod.electrode-melting` | **MVP**: sistema de electrodos y fusión (niveles 1–3) |
| `mod.eaf-energy-safety` | **MVP seguridad**: energía eléctrica, energía almacenada y metal líquido |
| `wi.electrode-system-check` | **MVP**: revisión del sistema de electrodos antes de reanudar la fusión (DEMO) |
| `asm.eaf-electrode` | **MVP**: evaluación |
| `doc.wi-electrode-system-check` | PDF de la instrucción detallada (`/documents/wi-electrode-system-check.pdf`) |
| `doc.jobaid-electrode-system-check` | PDF del job aid (`/documents/jobaid-electrode-system-check.pdf`) |
| `doc.guide-eaf-energy-safety` | Guía de seguridad del módulo (`/documents/guide-eaf-energy-safety.pdf`) |
| `doc.guide-electrode-melting` | Guía del participante (`/documents/guide-electrode-melting.pdf`) |
| `vid.melt-overview` | Video placeholder de la fusión (`/videos/melt-overview.webm` + `.vtt`) |

Las preguntas usan `q.<tema>-<n>`; las lecciones, `les.<módulo>-<n>`; los componentes, `cmp.<equipo>-<parte>`.

## Cómo agregar contenido
1. Edita el JSON correspondiente con IDs del catálogo o con nuevos IDs que sigan el patrón.
2. Corre `npm run check:content`. Valida forma, referencias cruzadas, nodos 3D y que no haya nada `PLANT_APPROVED` sin firma.
3. Pide la revisión del Validation Board (`docs/validation-checklist.md`).
