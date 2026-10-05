# Sistema de diseño — ACERÍA DIGITAL ACADEMY

**Mensaje clave:** la interfaz es oscura e industrial, con **un solo acento ámbar** para la acción y la selección. Los colores de seguridad (ISO 3864) se reservan para seguridad y van **siempre con icono y texto**.

## Tokens (fuente: `src/styles/index.css`, bloque `@theme`)
| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0C0E11` | Fondo de la escena y de la página |
| `--color-surface` / `-2` / `-3` | `#13161B` / `#1A1E25` / `#232831` | Paneles, tarjetas, estados *hover* |
| `--color-line` / `-strong` | `#2C323C` / `#3A414D` | Bordes |
| `--color-text` / `-2` / `-3` | `#E8EAED` / `#AEB4BD` / `#7D8591` | Texto principal, secundario y etiquetas |
| `--color-accent` | `#E8A33D` | Acción primaria, selección, foco, hotspot activo |
| `--color-danger` | `#E5484D` | Peligro crítico (▲ CRÍTICO), ALTO |
| `--color-warning` | `#F5C518` | Advertencia (▲), aviso permanente |
| `--color-mandatory` | `#3B82F6` | Obligación o escalamiento (☎) |
| `--color-safe` | `#30A46C` | Correcto o completado (✔) |
| Estados | general `#6E9FD8` · demo `#A78BFA` · SME `#F5C518` · borrador `#F08C3A` · aprobado `#30A46C` | Chip de estado de validación |

Contraste: el texto principal y el secundario sobre `surface` superan 4.5:1 (WCAG AA). El acento sobre `bg` llega a 8.9:1.

## Tipografía
- **IBM Plex Sans** para texto, **IBM Plex Mono** para etiquetas, códigos (`03`, `ETAPA 03`, IDs) y datos.
- Escala: 22 / 19 / 18 / 15 / 14 / 13.5 / 12.5 / 11 px. Las etiquetas van en mayúsculas con espaciado de 0.08 em (`.label`).

## Componentes
| Componente | Regla |
|---|---|
| `StatusChip` | Icono + texto corto + color. Nunca se omite en contenido industrial. |
| `OpText` | Muestra el texto educativo y, si hay marca, un recuadro punteado amarillo «SME_REQUIRED — DATO DE PLANTA PENDIENTE». |
| `HazardCard` | Severidad con texto (CRÍTICO, ALTO, MEDIO) e icono ▲; controles por jerarquía; campos de planta pendientes. |
| Hotspot | Botón real, número en mono y etiqueta al pasar el cursor o con el foco; pulso solo si no hay *reduced motion*. |
| Botones | Primario ámbar (una acción principal por vista) y secundario de contorno. |
| `Tabs` | `role=tablist`; navegación con flechas, Inicio y Fin. |
| `Modal` | Foco atrapado, Esc para cerrar, devuelve el foco. |
| Aviso permanente | Pie fijo, no se puede cerrar. |

## Layout
- Escritorio (≥1024 px): barra superior | barra lateral 240 px | escena | panel 360–420 px | pie de aviso.
- Móvil: escena de 46 vh, panel debajo y barra lateral plegable. Sin desplazamiento horizontal (verificado por e2e a 390 px).

## Movimiento
Las transiciones de cámara duran unos 0.45 s. Con `prefers-reduced-motion` la cámara salta y no hay pulso.

## 3D
Materiales PBR sobrios, acento ámbar como emisivo para la selección y luz cálida del baño. El «arco» es una animación ilustrativa marcada DEMO.
