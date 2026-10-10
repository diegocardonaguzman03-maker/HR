# PRX-0013 · Auditoría de UI del CRM y PRAXIA World (UI-01)

**Fecha:** 2026-10-09 · **Estado:** borrador para UX-01 y QA-01
**Método:** revisión de código sin navegador. Los contrastes se calcularon con la fórmula WCAG 2.1 sobre los HEX de `globals.css`. QA-01 debe verificar en navegador.

## Mensaje clave
El CRM se diseñó para decenas de registros y hoy tiene 117 organizaciones y 130 contactos. Sus listas no tienen búsqueda, filtros, orden ni paginación, y los formularios usan un `<select>` de 117 opciones. La marca está bien aplicada. Los riesgos de accesibilidad son tres: controles interactivos anidados, bordes con poco contraste y estados que solo se indican con color.

## Hallazgos [PROPUESTA]

| # | Prioridad | Hallazgo | Recomendación |
|---|---|---|---|
| 1 | Alta | `organizations/page.tsx` y `contacts/page.tsx` muestran todo, sin búsqueda, orden, conteo ni paginación. | Llevar el estado a la URL (`?q=&sort=&page=`) con consulta en el servidor y 50 filas por página. Mostrar «117 organizaciones · 1–50» y usar `aria-sort` en los encabezados. |
| 2 | Alta | No hay filtros por dominio. | Organizaciones: filtrar por ciclo de vida, industria, país, fit y fuente. Contactos: por estado del lead, organización, verificación del correo, DNC y base legal. Mostrar chips activos y una opción «Limpiar». |
| 3 | Alta | En `forms.tsx`, los campos Organization y Primary contact son `<select>` nativos sin búsqueda. | Usar un combobox accesible (ARIA 1.2) que permita escribir para filtrar. |
| 4 | Alta | En `PipelineBoard.tsx` hay un `<Link>` dentro de una tarjeta arrastrable con rol de botón. En `MissionControl.tsx` hay un `<button>` dentro de un `div role="button"`. Ambos incumplen WCAG 4.1.2. | Separar el asa de arrastre del enlace o de la acción. |
| 5 | Media | La paleta de comandos (`CommandPalette.tsx`) solo busca en la navegación, no en los registros. | Añadir búsqueda global de organizaciones, contactos y oportunidades. |
| 6 | Media | En tablas de 117 filas el encabezado no queda fijo y las filas usan dos líneas (unos 52 px). | Fijar el `thead` con `sticky` y ofrecer una densidad compacta. |
| 7 | Media | El borde de `.px-input` (`#2A2B33`) tiene un contraste de 1.28:1 con el fondo. WCAG 1.4.11 pide 3:1. | Crear el token `--color-hair-strong` (≈ `#5A5D68`) para los controles. |
| 8 | Media | El color del equipo E4 (`#5B4BFF`) como texto en Workload da 3.6:1. Las insignias `violet` (4.26:1) y `bad` miden 10 px. | Usar `indigo-soft` (7.9:1) para el texto y llevar las insignias a 11 px con contraste ≥ 4.5:1. |
| 9 | Media | La próxima acción vencida solo se marca con el color clay en la tabla y en la tarjeta del pipeline (WCAG 1.4.1). | Agregar el texto «Vencida» o un ícono con etiqueta, como ya hace MissionControl. |
| 10 | Media | En la ficha de una organización, el botón «+ New» no precarga la organización. | Pasar `?org=<id>` y precargar el formulario. Se ahorra un paso en lead-to-cash. |
| 11 | Media | Las filas `<tr onClick>` de Workload no responden al teclado. | Poner un `<button>` en la celda del agente y del equipo. |
| 12 | Baja | El tablist de MissionControl no tiene `tabpanel` ni navegación con flechas. `CrmTabs` no marca la pestaña activa con `aria-current`. | Completar el patrón ARIA. |
| 13 | Baja | Se muestran enums crudos en minúsculas (`former client`, `unverified`) y fechas en ISO. | Usar un diccionario de etiquetas y un formato de fecha único. |
| 14 | Baja | Los hovers usan HEX fijos (`#6a5cff`, `#f07a54`). Los colores ok, warn y bad no están en las Brand Guidelines v1.0. Clay se usa a la vez para «Demo», vencido y acción humana. | Convertir los hovers en tokens. Registrar ok, warn y bad como colores de apoyo [PENDIENTE]. Reservar clay para la acción humana. |
| 15 | Baja | La UI está en inglés, pero los equipos y el «[Supuesto]» están en español. | Lo decide el Founder (ver abajo). |

**Lo que está bien:** los tokens de §14/§15.1 están en `@theme`. El gradiente solo aparece en `.px-glow`, nunca en botones ni tablas. Se usan Space Grotesk, Inter y Space Mono. Hay un `:focus-visible` índigo y respeto a `prefers-reduced-motion`. El canvas de World tiene `aria-hidden` y una lista `sr-only` equivalente. El pipeline usa `KeyboardSensor`.

## Secuencia para DEV-02
1. Hallazgos 1 a 3: un `DataTable` reutilizable con paginación en el servidor y un `Combobox`. Esfuerzo de 3 a 5 días [Supuesto].
2. Hallazgos 4, 7, 8, 9 y 11: un PR de accesibilidad. Esfuerzo de 1 a 2 días [Supuesto].
3. El resto.

## Decisión requerida del Founder
**Idioma de la interfaz del Command Center.**
- **A.** Todo en inglés.
- **B.** Todo en español.
- **C.** Bilingüe con i18n.

**Recomendación:** B [PROPUESTA]. Es una herramienta interna y la skill (§0.5) pide un solo idioma. **Riesgo y costo:** retrabajo de textos de 1 a 2 días [Supuesto]. La opción C duplica el mantenimiento. **Fecha límite:** antes de que empiece el bloque 1 (sugerido el 2026-10-16).

```json
{"brief_id":"PRX-0013","owner":"UI-01","objective":"Auditoría de UI basada en código del CRM y de PRAXIA World: usabilidad con más de 100 registros, WCAG AA y marca","deliverable":"praxia/equipos/E6-producto-experiencia/2026-10-09-PRX-0013-consolidacion-crm/UI-01-auditoria-ui.md","evidence_and_sources":["apps/praxia-command-center/src/app/(app)/crm/**","apps/praxia-command-center/src/app/(app)/world/MissionControl.tsx","apps/praxia-command-center/src/components/crm/PipelineBoard.tsx","apps/praxia-command-center/src/components/crm/forms.tsx","apps/praxia-command-center/src/components/ui/primitives.tsx","apps/praxia-command-center/src/app/globals.css","apps/praxia-command-center/src/domain/teams.ts","Skill PRAXIA §14 y §15.1","Contrastes calculados con la fórmula WCAG 2.1"],"assumptions":["Sin render en navegador","Volumen de 117 organizaciones y 130 contactos tomado del brief","Esfuerzos en días [Supuesto]"],"risks":["Falta la verificación visual y con lector de pantalla (QA-01)","Paginar en el servidor cambia las consultas; coordinar con DEV-02"],"decisions_needed":["Idioma de la UI: A/B/C (recomendada: B)","Registrar ok, warn y bad como paleta de apoyo"],"next_owner":"UX-01","review_status":"borrador"}
```
