# Informe Ejecutivo — Procedimientos Operativos Visuales (POV) de la Acería

**Para:** Director de C&D · **De:** sesión principal (consolidación del equipo) · **Fecha:** 2026-09-28 · **Revisado por:** experto-operativo-metalurgia (técnica), experto-seguridad-salud, experto-relaciones-laborales, experto-documentacion-mejora, gerente-personal-sindicalizado (usuario de nuevo ingreso)

## 1. Mensaje clave
> Hay 29 procedimientos visuales, uno por proceso de operación de la Acería. Cada uno trae el paso a paso dibujado, dice qué puesto hace cada paso y tiene un mapa que le indica a cada persona nueva qué leer y en qué orden.
> Los 29 tienen visto bueno de los 5 revisores, con observaciones. Ninguno quedó "No aprobado".
> Recomiendo usarlos ya como material de inducción y OJT (borrador controlado) y aprobarlos como v1.0 cuando Ingeniería corrija los manuales a v0.2. Antes hay que resolver dos temas de puestos: la plaza S-27 y quién hace el escarpeo.

## 2. Qué se entregó
| Entregable | Cantidad | Dónde |
|---|---|---|
| POV en PDF (7–9 páginas cada uno) | 29: EAF 8, Ollas 2, Horno Olla 1, CC1 9, CC2 9 | `10-plantas/01-steelmaking/07-procedimientos-visuales/pdf/` |
| Mapa de procesos y roles (15 páginas) | 1 | `…/pdf/00-MAPA-ACERIA-procesos-y-roles.pdf` |
| Pasos dibujados / pasos críticos ★ | 463 / 177 | Contenido en `…/json/` |
| Puestos ligados | 33 (26 sindicalizados y 7 de confianza) | Matriz y rutas en el mapa |
| Correcciones aplicadas por los revisores | 562 (documentación 178, usuario 155, seguridad 115, laboral 61, técnica 53) | `…/_revisiones/cambios-aplicados.tsv` |
| ZIP de descarga | 12 MB | `10-plantas/01-steelmaking/descargas/Aceria_Procedimientos-Operativos-Visuales.zip` |

**Qué trae cada POV:**
- portada con para qué sirve y por qué importa, y 3 reglas de oro;
- tarjetas de puestos con R/A/C/I y su instrucción de trabajo;
- EPP y zonas de peligro;
- **diagrama de flujo con una columna por puesto**;
- **tarjetas de cada paso** con pictograma, quién lo hace, qué hace, cómo sabe que está bien y "ALTO si…" con a quién avisar;
- recuadro fijo de emergencias (detector de gases, MS-ACE-06);
- "si pasa esto → haz esto → avisa a";
- certificación, glosario, checklist de bolsillo y control documental.

## 3. Análisis (lo que encontraron los revisores)
- **Técnica:** ningún revisor alteró valores del manual. Se corrigieron 5 errores del borrador:
  - el aluminio en coladas de CC2, que van sin Al;
  - la velocidad ante una falla de bombeo en CC1;
  - la repetición de la 2.ª canasta;
  - el método B de electrodos;
  - la referencia a los pasos que se evalúan.
- **Seguridad:** se agregaron 62 ALTO en el paso donde la persona se expone: abrir el EBT o la olla, girar la torreta, izar, retirar LOTO. También la respuesta al detector de gases y 10 EPP que faltaban.
- **Laboral:**
  - queda un solo dueño (A) por proceso;
  - ningún sindicalizado conserva mando, autorización, disposición ni firma (LFT art. 9, verificar con Jurídico Laboral);
  - se quitaron las frases disciplinarias;
  - se completaron las vigencias de 12 meses de los izajes.
- **Documentación:** se unificaron los términos (DRI, HMI, arrestaflamas, sobrecalentamiento), se hicieron medibles 33 criterios de "está bien si" y se corrigieron 11 ligas de la cadena de procesos.
- **Usuario de nuevo ingreso:**
  - la estructura sí se entiende;
  - se agregaron 129 términos al glosario;
  - la falla común era "¿a quién aviso?", y ya se resolvió en el formato;
  - la ruta de cada puesto empieza ahora por seguridad y suma las horas de teoría y OJT.

## 4. Riesgos e implicaciones
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Pasos críticos de izaje y escarpeo sin titular formal (S-27 no existe; el escarpador no tiene código) | Alta | Alto: certificaciones sin dueño; posible reclamo por el art. 86 LFT [verificar con Jurídico Laboral] | Decisiones D-2 y D-3 |
| Los manuales MO v0.1 tienen inconsistencias con los POV (15 temas técnicos, 12 de documentación, 25 R que faltan en el catálogo) | Cierta | Medio: dos versiones de la verdad | D-4: manuales v0.2 antes de emitir los POV v1.0 |
| Valores [Supuesto] o [Validar con OEM] usados en planta como si fueran definitivos | Media | Alto | Leyenda en cada POV y validación de Ingeniería antes de v1.0 |
| Tema de chaleco sintético del señalero en MS-ACE-04, que contradice MS-ACE-01 | Media | Alto | D-5 |

## 5. Recomendaciones
1. Usar los POV desde octubre en la inducción y el OJT como **borrador controlado**, con piloto en 10 ingresos (S-03 y S-14).
2. Que Ingeniería (C-05, C-07, C-08, C-09) corrija los manuales a v0.2 antes del 2026-10-16. Después, emitir los POV v1.0 con aprobación de tres niveles: dueño del proceso, Gerente de Acería y Director.
3. Resolver con Relaciones Laborales la plaza S-27 y el escarpeo antes de certificar los izajes.

## 6. Decisión requerida del Director
| # | Decisión | Opciones | Recomendación | Costo (MXN) | Fecha límite |
|---|---|---|---|---|---|
| D-1 | **Uso de los POV** | **A.** Usarlos ya como borrador controlado para inducción y OJT · **B.** A + mejoras al mapa y piloto con 10 ingresos (S-03 y S-14) en noviembre · **C.** B + módulos en el LMS y videos | **B**: mide el efecto antes de publicarlos en toda la Acería | A ≈ 164,000 · B ≈ 221,000 · C ≈ 800,000 [Supuesto, primer año] | 2026-10-16 |
| D-2 | **Plaza S-27** (operador de grúa de CC y producto) | **A.** Crear el rol (≈ 12–14 plazas, la mayoría por reclasificación) y pagar la categoría superior mientras tanto · **B.** Formalizar los izajes en S-15 y S-17 · **C.** Mantener el supuesto | **A**, con negociación en la CMCAP. Hoy puestos N-3 operan grúas de 25 a 50 t; hay riesgo de reclamo por el art. 86 [verificar con Jurídico Laboral] | Por calcular con Nómina | 2026-10-16 |
| D-3 | **Escarpeo** (MO-CC1-09) | **A.** Lo hace S-18 certificado · **B.** Contratista REPSE | **A**: un contratista puede estar prohibido si la tarea es del objeto social (arts. 12–15 LFT) [verificar con Jurídico Laboral] | Capacitación de S-18 [Supuesto] | 2026-10-16 |
| D-4 | **Orden de emisión** | **A.** Manuales v0.2 (15 temas técnicos, 12 documentales, catálogo y DP con los 25 R, un solo A por proceso) y después POV v1.0 · **B.** Emitir ya los POV v1.0 | **A** | ≈ 24 h de ingeniería de proceso + 8 h del staff [Supuesto] | 2026-10-09 inicio · 2026-10-16 cierre |
| D-5 | **Seguridad** | **a)** En MS-ACE-04 cambiar el chaleco del señalero por brazalete FR · **b)** Certificar a S-09 en todo menos el paso 7 de OLL-02 hasta que el fabricante confirme el peso de la traviesa · **c)** Estudio de zonas de exclusión de la nave en 60 días | Aprobar a, b y c | Estudio de zonas: por cotizar | 2026-10-15 |
| D-6 | **Formato** | **a)** Glosario de máximo 10 términos por POV + un Glosario de la Acería (GL-ACE-001) único · **b)** Nota fija "la certificación no es sanción" · **c)** Renombrar las presentaciones de "AMMX" a "GASM" | Aprobar a, b y c | Sin costo externo | 2026-10-12 |

Cuando decidas, se registra en `equipo-director/decisiones/registro-de-decisiones.md`.

## Anexos
- Índice y guía de uso: `10-plantas/01-steelmaking/07-procedimientos-visuales/README.md`
- Formato: `…/ESPECIFICACION.md`
- Informes de revisión: `…/_revisiones/REVISION-TECNICA.md`, `REVISION-SEGURIDAD.md`, `REVISION-LABORAL.md`, `REVISION-DOCUMENTACION.md`, `REVISION-USUARIO.md`
