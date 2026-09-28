# Reducción Directa — Plantas HYL y Midrex

**Complejo Acería Norte (Salinas Victoria, N.L.) · Planta HYL (Energiron ZR, 1.2 Mt/año de DRI) · Planta Midrex (reformador catalítico, 1.3 Mt/año de DRI) · Patio de pelet común · Bandas de DRI a la Acería**

> **Estado: Borrador para validación (v0.1, 2026-09-28).** Primera ola de la documentación de Reducción Directa, por la decisión del Director **D-010** (documentar la cadena completa de GASM). La elaboró `experto-operativo-metalurgia` con el modelo de la Acería (`10-plantas/01-steelmaking/`). **Antes de usarla en planta** deben validarla Ingeniería de Proceso (RC-09, RC-10), Calidad (RC-11), Seguridad de Procesos (RC-18), Control y SIS (RC-19) y los licenciantes (OEM) en todos los valores marcados **[Validar con OEM]** o **[Supuesto]**. Después la aprueba el Director. Los valores son típicos públicos de la industria; **no contiene datos propietarios de los licenciantes**.

## 1. Lugar en la cadena de valor

Mina → concentrado → **Peletizadora Manzanillo** → ferrocarril (≈ 1,000 km) → **patio de pelet** → **HYL / Midrex** → bandas de DRI → **silos de día del EAF** (≈ 95–100 % de la carga) → horno olla → colada continua → laminación. Interfaces de entrada (pelet, §4.1) y de salida (DRI, §4.2) en [CV-GASM-001](../00-cadena-de-valor/CV-GASM-001-cadena-de-valor.md).

## 2. Base común (primera ola)

| Documento | Código | Para qué sirve | Estado |
|---|---|---|---|
| [Ficha técnica de Reducción Directa](00-ficha-tecnica-reduccion-directa.md) | FT-RD-001 v0.1 | Fuente única de parámetros técnicos: alcance y diagramas de flujo, parámetros de HYL y de Midrex por separado, calidad del pelet y del DRI, servicios, límites seguros, KPIs, dotación | Borrador para validación |
| [Catálogo de procesos y roles](00-catalogo-procesos-y-roles.md) | CAT-RD-001 v0.1 | Códigos estables de los **42 roles** (RC-01…19, RS-01…23) y los **41 procesos críticos** (MO-RD, MO-HYL, MO-MDX, MM-RD, MS-RD) con dueño, ejecutores y matriz rol × proceso | Borrador para validación |
| [Organigrama de Reducción Directa](01-organizacion/organigrama-reduccion-directa.md) | ORG-RD-001 v0.1 | Estructura, turno típico (5 mandos y 53 sindicalizados), 408 plazas [Supuesto], tramos de control, rol 4x4 e interfaces | Borrador para validación |
| [Guía de estilo y plantillas](../01-steelmaking/00-guia-de-estilo-y-plantillas.md) | — | Se usa la guía de la Acería, que aplica a todo `10-plantas/` (13 secciones de manual, plantilla de descripción de puesto, reglas SVG) | Vigente |

## 3. Estructura de carpetas (segunda ola)

| Carpeta | Contenido previsto | Códigos |
|---|---|---|
| `01-organizacion/` | Organigrama (hecho) · descripciones de puesto de sindicalizados y de confianza · revisión laboral | ORG-RD-001, DP-RD-S (RS-01…23), DP-RD-C (RC-01…19) |
| `02-operacion/comun/` | Manuales de patio de pelet, bandas de DRI, finos, calidad y servicios | MO-RD-01…07 |
| `02-operacion/hyl/` | Manuales de la planta HYL | MO-HYL-01…08 |
| `02-operacion/midrex/` | Manuales de la planta Midrex | MO-MDX-01…07 |
| `03-mantenimiento/` | Mantenimiento crítico | MM-RD-01…09 |
| `04-seguridad/` | Seguridad crítica | MS-RD-01…10 |
| `05-capacitacion/`, `06-instrucciones-trabajo/`, `07-procedimientos-visuales/` | Presentaciones, instrucciones de trabajo por rol y POV, igual que la Acería | Por proceso y por rol |
| `img/` | Figuras SVG (prefijos `rd-`, `hyl-`, `mdx-`, `mm-`, `ms-`, `org-`) | — |

## 4. Resumen técnico

| Tema | HYL (Energiron ZR) | Midrex |
|---|---|---|
| Producción | 1.2 Mt/año (≈ 150 t/h) | 1.3 Mt/año (≈ 163 t/h) |
| Presión del reactor / horno | 6–8 bar(g) | ≈ 0.5–2.0 bar(g) |
| Gas reductor | Reformado in situ; calentador + O₂; > 1,050 °C; H₂/CO ≈ 4–6 | Reformador con catalizador de Ni; 900–960 °C; H₂/CO ≈ 1.5–1.7 |
| Remoción de CO₂ | Sí (aminas) | No |
| Gas natural | 9.5–10.5 GJ/t [Supuesto] | 10.0–11.0 GJ/t [Supuesto] |
| Metalización / carbono | ≥ 93 % / 3.0–4.5 % | ≥ 93 % / 1.5–2.5 % |
| Entrega a la Acería | Banda cerrada, ≤ 80 °C | Banda cerrada, ≤ 80 °C |

## 5. Revisión cruzada requerida

| Revisor | Qué revisa |
|---|---|
| experto-seguridad-salud | FT-RD-001 §9 (límites seguros, purgas, umbrales de CO y LIE, reserva de N₂), serie MS-RD, guardia y trabajo en pareja |
| experto-relaciones-laborales | Categorías RS nuevas (tablero, sistema de gas), mando (art. 9 LFT), jornada 4x4, certificación cruzada y escalafón |
| experto-documentacion-mejora | Alta en control documental de FT-RD-001, CAT-RD-001 y ORG-RD-001 |
| experto-liderazgo-cambio | Doble línea superintendente por tecnología / jefe de turno común |
| gerente-personal-sindicalizado / gerente-personal-confianza | Dueños de los roles para la segunda ola (descripciones de puesto) |

## 6. Observaciones sobre documentos de otras plantas (no se modificaron)

- **FT-ACE-001 v0.3** aún indica 60 % DRI + 40 % chatarra y DRI caliente a 500–650 °C. Con D-010 y CV-GASM-001, el DRI llega **frío (≤ 80 °C) por banda** y es ≈ 95–100 % de la carga. La Acería debe emitir la v0.4 antes de revisar MO-EAF-03.
- **ORG-ACE-001 §4** describe una sola "Planta DRI" con DRI caliente; actualizar a HYL y Midrex con DRI ≤ 80 °C.
- **Umbral de evacuación por CO:** FT-RD-001 usa 25/50 ppm y queda sujeto a la misma decisión pendiente de la Acería (50 o 200 ppm), para tener un solo criterio en el Complejo.

## 7. Decisión requerida del Director

| # | Tema | Opciones | Recomendación | Riesgos | Costo | Fecha límite |
|---|---|---|---|---|---|---|
| 1 | Liberar CAT-RD-001 como base estable de la segunda ola | **A.** Liberar ya los códigos (roles y procesos) y validar los valores técnicos en paralelo (30–60 días). **B.** Esperar la validación completa de Ingeniería de Proceso y OEM. **C.** Liberar solo MO-RD y MS-RD (comunes) | **A**: los códigos casi no dependen de los valores; lo que cambia con la validación son parámetros de FT-RD-001 | A: retrabajo menor en manuales si cambia un valor. B: retrasa la segunda ola 1–2 meses | Sin costo adicional | 2026-10-09 |
| 2 | Dotación de 408 plazas [Supuesto] frente a ≈ 450 de TD-C-ACN-01 | **A.** Usar 408 y conciliar con RH del Complejo en 30 días. **B.** Redimensionar a 450 | **A** | B: cupos de formación sin sustento | Ninguno | 2026-10-09 |
| 3 | Categorías sindicalizadas nuevas y certificación cruzada HYL ↔ Midrex | **A.** Enviar a experto-relaciones-laborales y a la CMCAP antes de escribir las descripciones de puesto; certificación cruzada voluntaria y ligada al escalafón. **B.** Homologar con categorías existentes de la Acería sin negociar. **C.** Sin certificación cruzada | **A** | B: conflicto con el sindicato por categorías sin tabulador. C: menos flexibilidad para cubrir ausencias | A depende de la negociación; sin costo de C&D | 2026-10-30 |
| 4 | Simulador de operación (OTS) para tableros de HYL y Midrex | **A.** Incluir en el plan de la segunda ola una evaluación de OTS con los licenciantes. **B.** Formar solo con OJT y eventos reales | **A** | B: los arranques y paros son pocos al año; el operador llega sin práctica a su primer evento | Evaluación sin costo; la inversión en OTS se estimará en la propuesta [Supuesto: del orden de MXN 10–20 M por planta, por validar con cotización] | 2026-11-30 |
| 5 | Pedir a la Acería la actualización de FT-ACE-001 v0.4 y ORG-ACE-001 §4 (DRI frío por banda) | **A.** Sí, antes de la segunda ola del EAF. **B.** Al siguiente ciclo de revisión | **A** | B: los manuales del EAF enseñarían DRI caliente y 40 % de chatarra | Ninguno | 2026-10-09 |

## 8. Control de cambios

| Versión | Fecha | Cambio | Elaboró |
|---|---|---|---|
| 0.1 | 2026-09-28 | Creación de la carpeta con FT-RD-001, CAT-RD-001 y ORG-RD-001 (primera ola, D-010) | experto-operativo-metalurgia |
