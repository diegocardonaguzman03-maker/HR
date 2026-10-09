# PRAXIA deck builder · PRX-0012

Generador de decks `.pptx` con la marca PRAXIA (Brand Guidelines v1.0, skill §14 y §15.2) a partir de un JSON de contenido. Dueño: **DSN-01**. Guardián de marca: **MKT-01**. Contenido: **MKT-02** (ver `CONTENT_SCHEMA.md`).

Es un borrador interno, sin aprobar para envío. Ningún deck sale a un prospecto sin la revisión de QA-01 y RISK-01 y la aprobación del Founder.

## Uso

```bash
cd praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/deck-builder
npm install                         # una vez (node_modules/ no se versiona)

node build.mjs maestro              # content/maestro.json → ../00-maestro/deck-praxia-maestro.pptx
node build.mjs maestro --pdf        # además exporta el PDF de revisión con LibreOffice (meta.previewPdf)
node build.mjs 01-manufactura --check   # solo valida el JSON
node build.mjs --all --pdf          # todos los content/*.json
node build.mjs maestro --fonts=office   # Arial / Calibri / Consolas en lugar de las fuentes de marca
node build.mjs --schema             # tabla vigente de campos y límites
node build.mjs --file x.json --out /ruta/x.pptx   # entrada/salida explícitas (pruebas)
```

Requisitos: Node ≥ 18. Para `--pdf` hace falta LibreOffice (`soffice`) en el PATH.

Para revisar visualmente:

```bash
pdftoppm -png -r 110 ../00-maestro/preview.pdf /tmp/revision/m
```

Las PNG van fuera del repositorio.

## Estructura

| Ruta | Qué es |
|---|---|
| `build.mjs` | CLI: valida, genera el .pptx y, de forma opcional, el PDF |
| `lib/brand.mjs` | Tokens: paleta vigente, fuentes, medidas y rutas de assets. **Único lugar con colores** |
| `lib/schema.mjs` | Tipos de lámina, campos, límites de caracteres y validación (incluye aviso de palabras prohibidas) |
| `lib/render.mjs` | Los 13 renderizadores de lámina y sus primitivas (rótulo, corner ticks, pie, marcado de color) |
| `content/*.json` | Un deck por archivo. `maestro.json` es el deck maestro de ejemplo |
| `assets/` | PNG/JPG generados: símbolo, lockups, fondos con retícula y luz duotono |
| `scripts/make-assets.mjs` | Regenera `assets/` desde SVG (necesita la devDependency `sharp` y Space Grotesk instalada) |
| `test/make-limits.mjs` | Genera `test/limites.json`: todos los tipos con todos los campos al máximo, en grafito y en ivory |
| `CONTENT_SCHEMA.md` | Contrato para MKT-02 |

## Sistema visual aplicado

- **Paleta (solo la vigente):** Graphite `#0C0D12` · Ivory `#F5F2EC` · Indigo `#5B4BFF` · Violet `#8B5CF6` · Clay `#E9663C` · Niebla `#A7AAB5`. Hay además dos neutros funcionales: `#15161D` (panel sobre grafito, §15.1) y `#6B6E78` (texto secundario sobre ivory, §15.2). Los filetes usan `#2A2B33` sobre grafito y `#D9D4CA` sobre ivory. Ningún HEX de v2/v3.
- **Tipografía:** Space Grotesk Bold para titulares, Inter para el cuerpo y Space Mono para rótulos, pie y datos.
- **Lenguaje de instrumento (§14.5):** retícula fina de fondo, rótulo mono con cuadrito índigo, corner ticks en los paneles y pie `PRAXIA · sección · NN`.
- **Luz duotono:** un solo punto focal por lámina (índigo que vira a violeta con un borde clay), integrado en la imagen de fondo. Solo sobre grafito. No hay degradados en botones, tablas ni rellenos.
- **Ritmo:** grafito en portada, momento, brecha, costo, fundador, CTA y cierre; ivory en qué hacemos, comparativo, método, oferta y servicios. En el maestro son 7 láminas de grafito de 12.
- **Accesibilidad:** el texto secundario en Niebla sobre grafito y el índigo sobre ivory superan 4.5:1. Los rótulos mono sobre grafito usan Violet en vez de Indigo, porque el Indigo da 3.6:1.

## Logo — PROVISIONAL

Todavía no hay PNG oficiales (`praxialogoHdark.png`, `praxiasymbol.png`, etc.). Mientras tanto:

- `assets/simbolo-axis-provisional.png` es el **SVG de referencia de la skill §14.3**, rasterizado sin cambiar geometría ni colores (copia en `assets/simbolo-axis-referencia-14.3.svg`).
- `assets/lockup-h-*-provisional.png` es ese símbolo más el wordmark «Praxia» compuesto en Space Grotesk Bold con tracking −3 % (§14.2). **No es el lockup oficial.** Proporción y espaciado se aproximaron al tablero de exploración.
- Las láminas no dicen «provisional»: el aviso vive aquí. **Cuando lleguen los PNG oficiales**, se reemplazan los archivos de `assets/` con el mismo nombre (o se ajusta `ASSET` en `lib/brand.mjs` y `LOCKUP_RATIO` si cambia la proporción) y se regeneran los decks. Ningún renderizador toca el logo de otra forma.

## Fuentes

- El .pptx **declara** Space Grotesk, Inter y Space Mono, pero no las incrusta (pptxgenjs no lo permite). En un equipo sin esas fuentes, PowerPoint las sustituye y el diseño cambia: el ancho de texto varía y el estilo se pierde.
- El PDF de `--pdf` **sí las incrusta** (verificado con `pdffonts`). Por eso, **para enviar a prospectos se recomienda el PDF** y el .pptx queda como fuente editable.
- `--fonts=office` genera la variante con el fallback de la skill (Arial, Calibri y Consolas) para quien tenga que editar en un equipo sin las fuentes de marca. Se renderizó y cabe.
- Para renderizar aquí, las fuentes se instalaron en `~/.fonts` desde los paquetes npm `@expo-google-fonts/space-grotesk` y `@expo-google-fonts/space-mono` (SIL OFL). Inter ya estaba en el sistema. No se versionan en el repositorio.

## QA hecho (9 oct 2026)

1. `test/limites.json`: 27 láminas, todos los tipos con todos los campos al **máximo** de caracteres y de elementos, en grafito y en ivory. Se renderizó, se revisó y se ajustaron límites y diagramación hasta quedar sin desbordes ni textos cortados.
2. Maestro: renderizado a PDF y PNG y revisado lámina por lámina. Se corrigieron los huecos bajo los títulos, el kicker partido en el comparativo y el prefijo de fuente duplicado.
3. `validate.py` de la skill `pptx`: **All validations PASSED**.
4. Variante `--fonts=office` renderizada y revisada.

## Limitaciones conocidas

- **Ajuste de texto aproximado:** el alto de los bloques encadenados se estima con un ancho promedio de carácter conservador. En títulos cortos puede quedar algo más de aire del necesario, pero no se encima texto. Los límites del esquema se validaron con texto real en español. Palabras muy largas sin espacios (URLs) pueden partir distinto.
- **PowerPoint frente a LibreOffice:** el QA se hizo con LibreOffice y las fuentes de marca instaladas. En PowerPoint con las mismas fuentes el ajuste de línea puede variar un poco; los límites dejan holgura.
- **Imágenes de fondo:** retícula y luz son imágenes (pptxgenjs no soporta degradados). Para cambiar la posición de la luz se usa `glow` (`tr`, `br`, `bl`, `r` o `none`).
- **Founder sin foto:** se usa un monograma hasta tener una fotografía aprobada (§14.4: personas reales, editorial).
- **npm audit:** `pptxgenjs@4.0.1` depende de `image-size@1.x`, con un aviso de denegación de servicio en los lectores JXL, HEIF e ICNS. El builder siempre pasa ancho y alto a `addImage` y solo carga PNG/JPG propios de `assets/`, así que ese código no procesa archivos de terceros. Riesgo aceptado: se revisará cuando pptxgenjs publique la actualización.
