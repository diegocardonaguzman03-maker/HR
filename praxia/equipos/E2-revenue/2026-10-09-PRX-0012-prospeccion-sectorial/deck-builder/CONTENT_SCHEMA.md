# Esquema de contenido de los decks PRAXIA · PRX-0012

> Para **MKT-02** (narrativa y contenido), con SAL-03 (oferta y CTA) y RES-01 (cifras). Dueño del builder: DSN-01. Guardián de marca: MKT-01.
> Un deck = un archivo `content/<slug>.json`. El builder valida cada campo contra estos límites **antes** de generar; si algo se pasa, no genera y te dice qué lámina y qué campo corregir.
> Fuente de verdad de los límites: `lib/schema.mjs`. Si no coinciden, manda el código; puedes imprimir la tabla vigente con `node build.mjs --schema`.

## 1. Flujo de trabajo

1. Copia `content/maestro.json` a `content/<NN-sector>.json`. Por ejemplo, `content/01-manufactura.json`.
2. Cambia `meta` (sector, título, salida) y reescribe el texto de las láminas. Si hace falta, agrega, quita o reordena láminas.
3. Valida sin generar: `node build.mjs 01-manufactura --check`.
4. Genera el deck y su PDF de revisión: `node build.mjs 01-manufactura --pdf`.
5. Abre el PDF y revisa lámina por lámina. Los límites garantizan que el texto quepa, pero no que la lámina sea buena.

Nombres de salida sugeridos (`meta.output`, relativo a `deck-builder/`):

| Sector | `content/` | `meta.output` |
|---|---|---|
| Maestro | `maestro.json` | `../00-maestro/deck-praxia-maestro.pptx` |
| 01 Manufactura e industria | `01-manufactura.json` | `../01-manufactura/deck-praxia-manufactura.pptx` |
| 02 Startups y scale-ups | `02-startups-scaleups.json` | `../02-startups-scaleups/deck-praxia-startups-scaleups.pptx` |
| 03 High tech y software | `03-high-tech-software.json` | `../03-high-tech-software/deck-praxia-high-tech-software.pptx` |
| 04 Servicios financieros | `04-servicios-financieros.json` | `../04-servicios-financieros/deck-praxia-servicios-financieros.pptx` |
| 05 Retail y consumo | `05-retail-consumo.json` | `../05-retail-consumo/deck-praxia-retail-consumo.pptx` |
| 06 Logística | `06-logistica-cadena-suministro.json` | `../06-logistica-cadena-suministro/deck-praxia-logistica.pptx` |

La salida tiene que quedar dentro de la carpeta PRX-0012; si no, el builder la rechaza.

## 2. Estructura del archivo

```json
{
  "meta": { "slug": "01-manufactura", "title": "PRAXIA · Manufactura e industria", "sector": "Manufactura e industria",
            "date": "Octubre 2026", "lang": "es", "confidential": true,
            "output": "../01-manufactura/deck-praxia-manufactura.pptx" },
  "slides": [ { "type": "cover", "title": "…" }, { "type": "statement", "label": "01 — El momento", "statement": "…" } ]
}
```

### `meta`
| Campo | Oblig. | Máx. | Uso |
|---|---|---|---|
| `slug` | sí | 40 | Igual al nombre del archivo |
| `title` | sí | 80 | Título del documento (propiedades del .pptx) |
| `sector` | sí | 40 | Va en la portada: `PREPARADO PARA · <sector>` |
| `date` | sí | 24 | Fecha de la portada, p. ej. `Octubre 2026` |
| `lang` | no | — | `es` (predeterminado en H1) o `en` |
| `output` | sí | 200 | Ruta del .pptx, relativa a `deck-builder/` |
| `previewPdf` | no | 200 | Ruta del PDF de `--pdf`. Si falta, el PDF queda junto al .pptx |
| `confidential` | no | — | `true` (predeterminado) agrega «Confidencial» al pie de la portada |

### Campos comunes a toda lámina
| Campo | Máx. | Uso |
|---|---|---|
| `type` | — | Uno de los 13 tipos de la sección 4 (obligatorio) |
| `label` | 40 | Rótulo mono superior con cuadrito índigo. Convención: `03 — El costo de la brecha` |
| `section` | 28 | Texto del pie `PRAXIA · <section> · NN`. El número se pone solo |
| `theme` | — | `dark` (grafito) o `ivory`. Si falta, usa el valor del tipo |
| `glow` | — | Punto de luz duotono: `tr` `br` `bl` `r` `none`. **Solo en grafito y máximo uno por lámina**; en ivory se ignora |
| `notes` | 2000 | Notas del orador. **El prospecto las ve si recibe el .pptx**: nada interno ahí (etiquetas, dudas, nombres) |

### Marcado dentro del texto
- `*palabra*` pinta la palabra en **índigo** (estrategia, IA, foco).
- `~palabra~` pinta la palabra en **clay** (adopción, acción, lo humano).
- `\n` fuerza un salto de línea (solo en títulos y statements).
- El marcado funciona en títulos (`title`, `statement`, `tagline`, `mantra`, `value`). En el resto se muestra tal cual.
- Regla de marca: una palabra clave por titular, como máximo dos (`Turn *strategy* into ~adoption~.`). Los asteriscos y tildes no cuentan en el límite.

## 3. Reglas editoriales (no negociables)

1. **Una idea por lámina.** Si no cabe en el límite, sobran palabras, no falta espacio.
2. **Cero datos inventados.** Sin clientes, casos, logos, testimonios ni ROI. Toda cifra externa va con fuente verificable y fecha (RES-01). Mientras no esté verificada, usa el marcador `[CIFRA PENDIENTE RES-01]`, que se dibuja como un recuadro clay.
3. **Precios:** solo «Según alcance», salvo que el Founder apruebe el rango del diagnóstico.
4. **Contacto:** `praxia.com` y `hello@praxia.com` están pendientes. Usa `[CANAL DE CONTACTO — COMPLETAR]`. Cualquier texto entre corchetes en `contact` se dibuja como marcador clay punteado, bien visible.
5. **Voz PRAXIA:** frases declarativas, verbos fuertes, evidencia antes que adjetivos. El builder avisa (`!`) si aparece una palabra prohibida: potenciar, sinergia, journey, holístico, world-class, siguiente nivel, empoderar.
6. **Un idioma por deck.** En H1 el deck va en español. La excepción es el tagline `Turn strategy into adoption.` del cierre, que es un activo de marca global (ver la decisión en el README).
7. **Sin «™»** en AGI, Adoption System ni Adoption Gap: no hay registro.
8. **Fundador:** Francisco Cardona — Founder & Principal. Sin nombres de empleadores actuales ni anteriores.
9. **Ritmo sándwich:** grafito para los momentos de peso e ivory para lo denso. El grafito domina (alrededor del 70 % de las láminas). Los valores por defecto de cada tipo ya lo resuelven.

## 4. Tipos de lámina

`*` = obligatorio. Límites en caracteres visibles. Las listas indican el mínimo y el máximo de elementos.

### `cover` — Portada (grafito · luz `tr`)
Logo provisional, descriptor `HUMAN & AI TRANSFORMATION ADVISORY`, título, `PREPARADO PARA · <sector>` y fecha.

| Campo | Máx. | Nota |
|---|---|---|
| `kicker` | 40 | Rótulo sobre el título, p. ej. `Presentación ejecutiva` |
| `title` * | 64 | ≤ 28 car. a 66 pt · ≤ 46 a 56 pt · ≤ 64 a 48 pt |
| `subtitle` | 140 | Una frase |
| `preparedFor` | 40 | Si falta, usa `meta.sector` |
| `date` | 24 | Si falta, usa `meta.date` |

No lleva `label` ni número en el pie.

### `section` — Separador de sección (grafito · luz `bl`)
| Campo | Máx. | Nota |
|---|---|---|
| `number` * | 3 | `01` |
| `title` * | 44 | Nombre de la sección |
| `kicker` | 120 | Una línea de contexto |

### `statement` — Una idea grande (grafito · luz `r`)
| Campo | Máx. | Nota |
|---|---|---|
| `statement` * | 120 | ≤ 50 car. a 56 pt · ≤ 85 a 48 pt · ≤ 120 a 40 pt. Se centra en vertical |
| `support` | 170 | Frase de apoyo en gris niebla |

### `content` — Título + texto + hasta 3 puntos (ivory)
Columna izquierda con título y párrafo; columna derecha con 0–3 paneles numerados con corner ticks.

| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 64 | |
| `body` | 300 | |
| `points` | 0–3 | `{ title * (36), body (110) }` |

### `stats` — Problema con 2–4 cifras grandes y su fuente al pie (grafito)
| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 90 | La tesis que las cifras prueban |
| `stats` * | 2–4 | `{ value *, label *, source * }` |
| `stats[].value` | 28 | **≤ 6 caracteres = cifra grande** (`~5%`, `1.6×`, `47%`, `USD 9M`). Más larga = marcador clay (`[CIFRA PENDIENTE RES-01]`) |
| `stats[].label` | 90 | Qué mide la cifra, en una frase |
| `stats[].source` | 90 | `Organización · año · documento`. Se antepone `FUENTE ·`, salvo que empiece con `[` |
| `note` | 140 | Nota al pie de la lámina |

Con 4 cifras el texto baja a 12 pt; usa 4 solo si las cuatro son igual de fuertes.

### `gap` — The Adoption Gap, esquema conceptual (grafito · luz `r`)
Diagrama sin datos: barra de lo comprado o desplegado, barra de lo adoptado y la brecha marcada en clay. Lleva la leyenda fija `ESQUEMA CONCEPTUAL · NO A ESCALA`.

| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 60 | |
| `definition` | 240 | |
| `leftLabel` * | 30 | Bajo la barra alta |
| `rightLabel` * | 30 | Bajo la barra baja |
| `gapLabel` * | 24 | Dentro de la brecha |

### `comparison` — Comparativo de 3 columnas (ivory)
Pensado para: firmas de estrategia *recomiendan* / RH y cambio *facilitan* / PRAXIA *asegura la adopción*. La columna destacada va en panel grafito con el símbolo y el verbo en clay.

| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 70 | |
| `columns` * | 3 exactas | `{ kicker * (28), verb * (24), body * (150) }` |
| `highlight` | 0–2 | Índice de la columna destacada (predeterminado: 2) |
| `footnote` | 140 | |

### `method` — SENSE · ALIGN · ADOPT · SUSTAIN (ivory)
Eje con 4 nodos (el último en clay), etapa, verbo, descripción y gate.

| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 48 | Una línea |
| `intro` | 110 | Una línea |
| `stages` * | 4 exactas | `{ name * (10), verb * (14), body * (130), gate (40) }` |
| `mantra` | 80 | Línea final; admite marcado |

### `offer` — Punto de entrada / diagnóstico (ivory)
Izquierda: título, texto y hasta 4 datos clave (2×2). Derecha: panel grafito con entregables numerados.

| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 48 | |
| `body` | 220 | |
| `facts` | 0–4 | `{ k * (16), v * (30) }`, p. ej. `Inversión` / `Según alcance` |
| `panelTitle` | 24 | Predeterminado: `Entregables` |
| `deliverables` * | 1–5 | Cada uno de hasta 80 caracteres |

### `services` — Lista de servicios u ofertas (ivory)
Filas numeradas con nombre, descripción y una etiqueta clay opcional.

| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 60 | |
| `items` * | 3–6 | `{ name * (42), body (90), tag (18) }`. `tag` p. ej. `Punto de entrada` |

### `founder` — Quién está detrás (grafito)
Monograma con las iniciales (sin foto hasta tener una aprobada), nombre, rol, bio y hasta 4 credenciales.

| Campo | Máx. | Nota |
|---|---|---|
| `name` * | 26 | |
| `role` * | 40 | `Founder & Principal` |
| `bio` * | 420 | Sin empleadores con nombre ni cifras internas |
| `points` | 0–4 | Cada uno de hasta 70 caracteres |

### `cta` — Siguiente paso (grafito · luz `br`)
| Campo | Máx. | Nota |
|---|---|---|
| `title` * | 40 | |
| `body` | 200 | |
| `steps` | 0–3 | `{ title * (24), body (90) }` |
| `button` * | 26 | `Agenda tu diagnóstico →` (botón clay) |
| `contact` * | 56 | `[CANAL DE CONTACTO — COMPLETAR]` hasta que el Founder lo defina |

### `closing` — Cierre (grafito · luz `tr`)
| Campo | Máx. | Nota |
|---|---|---|
| `tagline` * | 40 | `Turn *strategy* into ~adoption~.` |
| `contact` | 64 | Marcador o canal real |

## 5. Estructura recomendada del deck sectorial (ESPECIFICACIÓN + skill §9.1)

| # | Momento | Tipo sugerido |
|---|---|---|
| 1 | Portada · `PREPARADO PARA · <sector>` | `cover` |
| 2 | El momento del sector | `statement` |
| 3 | El Adoption Gap en ese sector | `gap` o `content` |
| 4 | Costo de la brecha (solo cifras con fuente de RES-01) | `stats` |
| 5 | Qué hacemos | `content` |
| 6 | Por qué distinto | `comparison` |
| 7 | Método | `method` |
| 8 | Punto de entrada: diagnóstico | `offer` |
| 9 | Ofertas relevantes para el sector (3–4, no todas) | `services` |
| 10 | Quién está detrás | `founder` |
| 11 | Siguiente paso | `cta` |
| 12 | Cierre | `closing` |

Entre 8 y 12 láminas. `section` solo hace falta si el deck pasa de 12.
