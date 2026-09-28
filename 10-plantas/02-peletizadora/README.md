# Planta Peletizadora Manzanillo — Ficha Técnica, Roles y Procesos Críticos

**Manzanillo, Colima · Recepción de concentrado (ferroducto y ferrocarril) · Filtrado · Peletizado en discos · 2 líneas grate-kiln · Patio, trenes y puerto · 4.2 Mt/año de pelet grado reducción directa**

> **Estado: Borrador para validación (v0.1, 2026-09-28).** Primera ola de la decisión D-010 (documentar la cadena completa de GASM). La elaboró `experto-operativo-metalurgia`. Todavía **no tiene** las revisiones laboral, de seguridad y documental. **Antes de usarla en planta**, Ingeniería de Proceso (PC-08, PC-09), Mantenimiento (PC-11), SSO (PC-18) y los fabricantes (OEM) deben validar todos los valores marcados **[Supuesto]** o **[Validar con OEM]**. Después la aprueba el Director de C&D. La versión vigente es la del repositorio.

## 1. Lugar en la cadena de valor

Mina Cerro Tepehuaje (pulpa por ferroducto) + Mina Sierra Alta (concentrado por ferrocarril) → **Peletizadora Manzanillo** → ferrocarril ≈ 1,000–1,200 km → Reducción Directa HYL y Midrex (Complejo Acería Norte) → Acería. El excedente (≈ 0.65 Mt/año) se vende por el puerto. Las interfaces están en [CV-GASM-001](../00-cadena-de-valor/CV-GASM-001-cadena-de-valor.md); la especificación del pelet, en su §4.1.

## 2. Qué contiene (primera ola)

| Documento | Código | Para qué sirve |
|---|---|---|
| [Ficha técnica](00-ficha-tecnica-peletizadora.md) | FT-PEL-001 v0.1 | Fuente única de parámetros técnicos: flujo, balance, equipos y parámetros por etapa, calidad del pelet, energía, servicios, KPI, dotación y coherencia con CV-GASM-001 |
| [Catálogo de procesos y roles](00-catalogo-procesos-y-roles.md) | CAT-PEL-001 v0.1 | Códigos estables: **24 roles sindicalizados (PS-01 a PS-24)**, **21 de confianza (PC-01 a PC-21)** y **22 procesos críticos** (MO-PEL-01 a 10, MM-PEL-01 a 05, MS-PEL-01 a 07), con dueño (A), ejecutores (R) y matriz rol × proceso |
| [Organigrama](01-organizacion/organigrama-peletizadora.md) | ORG-PEL-001 v0.1 | Estructura, plantilla por área (735 de planta + ≈ 65 de apoyo = ≈ 800), turno típico (5 mandos y 88 sindicalizados), tramos, interfaces y decisiones |
| Guía de estilo | — | Se usa la de la Acería: [00-guia-de-estilo-y-plantillas.md](../01-steelmaking/00-guia-de-estilo-y-plantillas.md), con FT-PEL-001 como fuente de valores |

## 3. Procesos críticos (resumen)

| Serie | Procesos | Carpeta (segunda ola) |
|---|---|---|
| Operación | MO-PEL-01 Recepción de concentrado · 02 Espesamiento y filtrado · 03 HPGR, aditivos y mezcla · 04 Discos y pelet verde · 05 Arranque, paro y paro de emergencia del grate-kiln · 06 Endurecimiento en estado estable · 07 Cribado y recubrimiento · 08 Calidad y liberación · 09 Patio y carga de trenes · 10 Embarque portuario | `02-operacion/` |
| Mantenimiento crítico | MM-PEL-01 Parrilla móvil · 02 Refractario · 03 Mecánica del horno y del enfriador · 04 Bandas · 05 Ventiladores, precipitadores y media tensión | `03-mantenimiento/` |
| Seguridad crítica | MS-PEL-01 Hornos, quemadores y gases · 02 Bandas y equipos rotatorios · 03 Control de energías (LOTO) · 04 Espacios confinados y atrapamiento · 05 Sílice, polvo, químicos, ruido y calor · 06 Ferrocarril, equipo móvil y muelle · 07 Altura e izaje | `04-seguridad/` |

## 4. Segunda ola (pendiente)

| Paquete | Documentos | Responsable sugerido |
|---|---|---|
| Descripciones de puesto | DP-PEL-S (PS-01 a PS-24) y DP-PEL-C (PC-01 a PC-21) | gerente-personal-sindicalizado / gerente-personal-confianza, con revisión laboral |
| Manuales | 10 MO-PEL, 5 MM-PEL y 7 MS-PEL, con la plantilla de 13 secciones | Células + experto-operativo-metalurgia (visto bueno técnico) + experto-seguridad-salud |
| Procedimientos operativos visuales | POV-MO-PEL-01 a 10 | experto-documentacion-mejora |
| Capacitación | Presentaciones e instrucciones de trabajo por rol; simulador de peletizado | TD-S03, TD-IM-05, TD-IS-08, TD-IN-06, TD-09 |

## 5. Hallazgos técnicos de esta ola
1. **Ley del concentrado:** con el concentrado de Fe 66–68 % de CV-GASM-001, el pelet queda en ≈ 64–64.5 % de Fe y **no cumple el Fe ≥ 67.0 %** de la especificación DR. Hace falta un concentrado de Fe ≈ 70 % (FT-PEL-001 §12).
2. **Balance:** el pelet necesita ≈ 4.05–4.10 Mt/año de concentrado; en CV-GASM-001 quedan ≈ 2.4 Mt/año de concentrado sin destino.
3. Faltan valores de **basicidad** y el **punto de aplicación del recubrimiento**; los fija C-07 de RD.

## 6. Decisiones pendientes del Director
1. Especificación del concentrado para pelet DR (Fe ≈ 70 %) o bajar la especificación del pelet (FT-PEL-001 §12). Decide con la Dirección de Operaciones.
2. Modelo de mando en turno, tramo de PC-05 y conciliación de la plantilla con el HRIS (ORG-PEL-001 §7).
3. Crear **MS-PEL-08** (plan de emergencias del sitio: huracán, sismo, tsunami) y definir si PS-23 y PS-24 siguen como plazas propias o pasan a contratista (CAT-PEL-001 §4).
4. Liberar la primera ola a revisión cruzada (laboral, seguridad, documental) y arrancar la segunda ola con estos códigos.

## 7. Control de cambios
| Versión | Fecha | Cambio | Elaboró |
|---|---|---|---|
| 0.1 | 2026-09-28 | Creación de la carpeta: FT-PEL-001, CAT-PEL-001, ORG-PEL-001 y este README (decisión D-010) | experto-operativo-metalurgia |
