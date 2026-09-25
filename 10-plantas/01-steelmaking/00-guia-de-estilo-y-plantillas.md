# Guía de Estilo y Plantillas — Manuales y Descripciones de Puesto de Planta

Aplica a todos los documentos de `10-plantas/`. Objetivo: que un operador los entienda (**pasos simples**) y que sean **precisos en mediciones y especificaciones**.

## 1. Reglas de redacción
- Español de México, oraciones cortas, verbo en imperativo en los pasos ("Verifica…", "Abre…", "Registra…").
- **Cada medición lleva:** valor objetivo, rango permitido, unidad, instrumento y qué hacer si está fuera de rango. Ejemplo: "ΔT de agua de molde: 6–9 °C (objetivo 7.5 °C), en la HMI del púlpito. Si > 11 °C: baja la velocidad a 0.8 m/min y avisa a C-06".
- Unidades SI: °C, bar, m³/h, L/min, Nm³/h, NL/min, m/min, mm, t, kWh/t, kg/t, ppm, %. Separador decimal: punto.
- Los valores técnicos salen de `00-ficha-tecnica-acería.md`. Si un dato depende del fabricante, márcalo como **[Validar con OEM / Ingeniería de Proceso]**.
- Roles: se citan siempre por código y nombre (p. ej. "S-13 Operador de Plataforma de Colada").
- ★ = **paso crítico** (si se omite o se hace mal puede causar una fatalidad, una explosión, un derrame de metal o un defecto grave). Los pasos ★ entran en la evaluación de certificación (TD-P07).
- ⚠️ = advertencia de seguridad · 🔎 = punto de control de calidad · 🛑 = condición de paro obligatorio.

## 2. Imágenes y diagramas
- **Diagramas de flujo:** mermaid dentro del Markdown.
- **Ilustraciones técnicas** (cortes de equipos, perfiles de máquina, zonas de exclusión, puntos de bloqueo): **SVG** guardado en `10-plantas/01-steelmaking/img/` e insertado así: `![Figura N. Descripción](../../img/archivo.svg)` (ajusta la ruta relativa).
- **Estilo SVG:**
  - `viewBox` definido, ancho de 800–1,000 px y fondo blanco (`<rect width="100%" height="100%" fill="#ffffff"/>`).
  - Fuente: `font-family="Arial, Helvetica, sans-serif"`, 12–16 px.
  - Paleta: acero/estructura `#455A64`, metal líquido `#E65100` / `#FF8F00`, escoria `#6D4C41`, refractario `#8D6E63`, agua `#1E88E5`, gas/O₂ `#43A047`, peligro `#C62828`, texto `#212121`.
  - Cada parte numerada con una **leyenda**. Incluye título, número de figura y cotas o medidas clave cuando aplique (p. ej. "Inmersión SEN 120–160 mm").
  - Sin recursos externos: SVG autocontenido y válido (verifícalo con `python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" archivo.svg`).
- Nombre de archivo: prefijo del catálogo + descripción corta, p. ej. `eaf-corte-horno.svg`, `cc1-perfil-maquina.svg`.

## 3. Plantilla de Manual de Proceso Crítico

````markdown
# [CÓDIGO] — [Nombre del proceso]

| Código | Versión | Estado | Área | Dueño del proceso | Elaboró | Revisión técnica | Revisión de seguridad | Aprobó | Fecha | Próxima revisión |
|---|---|---|---|---|---|---|---|---|---|---|
| MO-XXX-00 | 0.1 | Borrador para validación | | C-xx | [agente] | experto-operativo-metalurgia | experto-seguridad-salud | Pendiente (Gerente de Acería / Director) | AAAA-MM-DD | +12 meses |

## 1. Objetivo y alcance
## 2. Roles y responsabilidades
| Rol | Responsabilidad en este proceso | R/A/C/I |
## 3. Descripción del proceso
Texto breve + figura SVG + diagrama de flujo mermaid.
## 4. Equipos y maquinaria
| Equipo / componente | Función | Especificación clave | Condición para operar (verificación) |
## 5. Parámetros de operación
| Parámetro | Unidad | Objetivo | Rango normal | Alarma / límite | Acción si está fuera de rango | Dónde se mide |
## 6. Seguridad
### 6.1 Peligros y controles críticos
| Peligro | Consecuencia | Control crítico | Verificación |
### 6.2 EPP obligatorio
### 6.3 Permisos, bloqueos y zonas de exclusión
## 7. Calidad
| Variable crítica de calidad | Especificación | Método / frecuencia | Registro | Defecto si falla |
## 8. Procedimiento paso a paso
| # | Paso | Cómo hacerlo (detalle y medición) | Criterio de aceptación | ★ | Rol |
## 9. Condiciones anormales y respuesta
| Síntoma / alarma | Causa probable | Acción inmediata | A quién avisar |
## 10. Registros
## 11. Competencia requerida y certificación
| Rol | Nivel requerido (1–4) | Formación teórica (h) | OJT supervisado (h / eventos) | Evaluación (pasos ★) | Vigencia |
Lista corta de verificación de los pasos ★ para evaluar la competencia.
## 12. Referencias
NOM-STPS aplicables, ficha técnica, manuales OEM [por referenciar], estándares internos.
## 13. Control de cambios
````

## 4. Plantilla de Descripción de Puesto de Planta

````markdown
## [Código] — [Nombre del rol]
| Campo | Valor |
|---|---|
| Tipo de personal | Sindicalizado (categoría/nivel de escalafón) o Confianza (banda) |
| Área / equipo | |
| Reporta a | |
| Supervisa a | |
| Plazas (total y por turno) | |
| Turno | 4x4 de 12 h / administrativo |
### Propósito
### Funciones principales (con % del tiempo)
### Procesos críticos que ejecuta o supervisa (códigos del catálogo, R/A/C/I)
### Responsabilidades de seguridad (controles críticos a su cargo, autoridad para detener el trabajo)
### Responsabilidades de calidad
### Equipos que opera
### Indicadores de desempeño (con meta)
### Perfil: escolaridad, experiencia, conocimientos, certificaciones (DC-3 / NOM, certificación interna TD-P07), condición física y médica
### Ruta de progresión (escalafón / carrera)
### Condiciones de trabajo y riesgos (calor, ruido, metal líquido, EPP)
### Plan de formación para el puesto (inducción, rutas, OJT, certificaciones)
````
