# One-pager sectorial de seguimiento · PRX-0013 · DSN-01

**Para qué sirve.** Se envía después de un primer contacto aprobado y deja por escrito el problema del sector y el siguiente paso (el diagnóstico). Hay seis plantillas, una por sector, y de cada una sale una versión por cuenta. [PROPUESTA]

## 1. Formato
PDF carta vertical de una página con las fuentes incrustadas. El .pptx queda como fuente editable. [PROPUESTA]

## 2. Estructura y jerarquía (de arriba abajo)
| # | Zona | Fondo | Contenido | Jerarquía |
|---|---|---|---|---|
| 1 | Encabezado (≈30 %) | Grafito, luz `tr` (el **único** punto de luz) | Lockup provisional, descriptor mono, rótulo `SEGUIMIENTO · <SECTOR>`, titular con una palabra marcada | 1.º: titular en Space Grotesk 30–34 pt |
| 2 | Lo que conversamos (opcional) | Ivory | 2 o 3 viñetas por cuenta | 4.º: Inter 10 pt |
| 3 | Problema y costo | Ivory | Una línea sobre el Adoption Gap y de 2 a 3 cifras con su fuente al pie | 2.º: cifras en Space Grotesk 26 pt |
| 4 | Qué hacemos y método | Ivory | 3 frases y un eje de 4 nodos SENSE·ALIGN·ADOPT·SUSTAIN (el último en clay) | 3.º |
| 5 | Punto de entrada | Panel grafito con corner ticks | Diagnóstico: 4 datos clave y 3 entregables; inversión «Según alcance» | 3.º |
| 6 | Cierre (≈15 %) | Grafito | Línea del Founder, botón clay «Agenda tu diagnóstico →», contacto, pie `PRAXIA · Seguimiento · Confidencial` | Botón: único clay sólido |

El grafito cubre cerca del 55–60 %. Es menos que en el deck a propósito, porque lo denso se lee mejor sobre ivory. Etiquetas en Space Mono 8 pt, fuentes de las cifras en 7 pt, margen de 0.5 in. La idea dominante es **mide tu Adoption Gap**.

## 3. Piezas de marca
Paleta §14.1 desde `lib/brand.mjs`, sin HEX de v2/v3. Logo `assets/lockup-h-graphite-provisional.png` (provisional) con clearspace de 1 anillo. Lenguaje de instrumento §14.5. Sin «™», sin cifras del AGI y sin precios.

## 4. Contenido que se reutiliza del deck sectorial
| Bloque | Origen en `content/<NN-sector>.json` |
|---|---|
| Titular | `cover.title` (marcado incluido) |
| Problema | `statement.statement` o `gap.definition` |
| Cifras | `stats.stats[0..2]` con `source`, más `stats.note` |
| Qué hacemos | `content.title` y `points[].title` |
| Método | `method.stages[].name` y `verb` |
| Punto de entrada | `offer.facts` y `offer.deliverables[0..2]` |
| Founder | `founder.name` y `role` |
| Cierre | `cta.button` y `cta.contact` |

Lo único nuevo es «Lo que conversamos», que redacta SAL-03 a partir del CRM.

## 5. Cómo se generaría con el builder (recomendación, sin código)
1. `meta.format: "onepager-letter"`: `build.mjs` usa `defineLayout` de 8.5 × 11 in en vez de `LAYOUT_WIDE`.
2. Tipo nuevo `onepager` en `lib/schema.mjs`: titular 56, problema 140, cifras 2–3 (`label` 70), puntos 3 × 36, entregables 3 × 60, `recap` 0–3 × 110 y sin `notes`.
3. `from: "<NN-sector>"` toma del deck los campos de la tabla 4. Lo escrito en el one-pager sobrescribe y el builder valida el resultado.
4. `content/onepager-<NN-sector>.json` → `node build.mjs onepager-<NN-sector> --pdf` → `../<NN-sector>/onepager-praxia-<sector>.pdf`.
5. Las versiones por cuenta (con `recap`) se generan con `--file`/`--out` fuera del repositorio, que es público (D-P08).

QA: DSN-01 renderiza con todos los campos al máximo y lo revisa antes de QA-01.

## Decisión requerida del Founder
- **A.** PDF carta vertical con un renderizador nuevo: lo más legible por correo y en papel. Unas 6–8 h de DSN-01.
- **B.** Una lámina 16:9 con el layout actual: unas 3 h, pero se lee mal en el teléfono y en papel.
- **C.** docx con la receta §15.3, fuera del builder: duplica tokens y contenido.

**Recomendación:** A. **Riesgos:** envío por cuenta sin aprobación, `recap` en el repo público y logo provisional. **Fecha límite:** 2026-10-16.

```json
{"brief_id":"PRX-0013","owner":"DSN-01","objective":"Especificar el one-pager sectorial de seguimiento posterior a un primer contacto aprobado","deliverable":"praxia/equipos/E3-marca-demanda/2026-10-09-PRX-0013-consolidacion-crm/DSN-01-onepager.md",
 "evidence_and_sources":["Skill §9.1, §14, §15","deck-builder/CONTENT_SCHEMA.md","deck-builder/README.md","content/01-manufactura.json","Registro de decisiones D-P07, D-P08"],
 "assumptions":["El envío por correo es el canal principal","Las cifras del deck ya pasaron por RES-01"],
 "risks":["Versión por cuenta enviada sin aprobación del Founder","Datos de cuenta en el repo público","Logo provisional"],
 "decisions_needed":["Formato A/B/C del one-pager antes del 2026-10-16"],
 "next_owner":"MKT-01","review_status":"borrador"}
```
