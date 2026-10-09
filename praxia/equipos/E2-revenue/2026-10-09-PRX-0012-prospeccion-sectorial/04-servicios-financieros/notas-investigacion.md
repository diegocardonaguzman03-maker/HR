# PRX-0012-S04 · Notas de investigación — Servicios financieros y fintech

> Dueño: SAL-02 · Fecha: 2026-10-09 · Estado: **borrador para RISK-01** (datos personales y claims) y después QA-01. Uso interno. Nada de esto se envía ni se carga al Command Center hasta cerrar D-P07.

## Mensaje clave
El sector tiene una densidad de triggers poco común. En 2025-2026 coinciden cinco movimientos: relevos de CEO (Banamex, BanBajío, Nu, Citi, Quálitas, Scotiabank), integraciones forzadas por los casos FinCEN (Kapital–Intercam, Multiva–CIBanco), conversiones de fintech a banco (Nu, Plata, Revolut, Klar–Bineo, Mercado Pago en proceso), nuevos cores (Santander Gravity, BanCoppel) y despliegues de IA a escala (GNP–Palantir, BBVA–OpenAI, Banorte). El problema económico común: **la inversión ya está hecha (licencia, core, adquisición o IA) y el valor depende de que la organización opere distinto.** Ese es el Adoption Gap.

**Resultado:** 24 instituciones (8 A · 10 B · 6 C), 31 filas y 30 decision makers nombrados, cada uno con URL pública. BBVA México quedó sin contacto. Archivo: `base-servicios-financieros.csv`.

## Top-5 cuentas [PROPUESTA]
| # | Cuenta | Trigger (fuente en la base) | Hipótesis de problema económico | Servicio sugerido |
|---|---|---|---|---|
| 1 | **Grupo Financiero Banamex** | Nuevo CEO (Edgardo del Rincón, 1-jun-2026) tras la separación de Citi; OPI prevista para inicios de 2027; meta de volver al n.º 1 | Llegar a la OPI con una historia de ejecución creíble: alineación del equipo directivo nuevo y rutinas de gestión que muevan productividad y crecimiento | A Transformation Diagnostic → D Organizational Effectiveness / E Leadership & Capability |
| 2 | **BanBajío** | Nuevo DG (1-may-2026) y reestructura del 29-jul-2026 con DGA de Capital Humano y DGA de Inteligencia de Negocios y Analítica | El nuevo operating model existe en el organigrama; hay que llevarlo a decisiones y rutinas. La DGA de analítica permite medir la adopción | A → D + F Transformation Analytics |
| 3 | **Kapital Grupo Financiero** | Compra de Intercam (banco, casa de bolsa, fondos y 60 sucursales); integración desde oct-2025; USD 100 M invertidos; OPI en un máximo de 3 años | Integrar una red tradicional en una fintech sin perder clientes ni productividad; meta de +20% en 2026 | D Organizational Effectiveness + B Adoption Architecture |
| 4 | **GNP Seguros** | Escala Palantir Foundry y AIP en todas sus líneas (jul-2026); el CEO habla de transformar procesos «más allá de comprar tecnología» | Capturar el valor del caso de fraude, suscripción y siniestros: que ajustadores y suscriptores usen la IA con criterio y trazabilidad | C AI Adoption Accelerator + F Transformation Analytics |
| 5 | **Nu México** | Opera como banco desde ago-2026; cuarto CEO en siete años (Estephany Paulette Ley, nov-2026) | Transición de liderazgo durante el paso a banco regulado: alineación ejecutiva y decision rights en los primeros 90 días | E Leadership & Capability + D Organizational Effectiveness |

En reserva (también A): Multiva (integración del negocio fiduciario de CIBanco con 110–120 personas transferidas), Santander México (core Gravity) y Banorte (IA bajo el COO).

Puerta de entrada sugerida en las cinco: un diagnóstico pagado y acotado. La inversión va «según alcance» y no se cita precio sin aprobación del Founder.

## Método
1. **Universo:** banca múltiple sistémica y mediana, aseguradoras grandes, afores, SOFIPOs/SOFOMES grandes y fintechs Serie B+ con operación en México.
2. **Selección por trigger (skill §3.3, §8.1):** se incluyeron solo instituciones con al menos un trigger fechado entre 2024 y 2026 y una URL de fuente: cambio de CEO, CHRO o estructura, M&A o integración, licencia bancaria, nuevo core o migración, programa de IA o transformación, o ronda grande.
3. **Fit ICP (1–5)** [PROPUESTA de criterio]: 5 = trigger reciente (≤12 meses) que obliga a cambiar la operación + sponsor identificable + escala; 4 = trigger fuerte con una limitante (decisión centralizada en la matriz, estado regulatorio incierto o contacto incompleto); 3 = trigger de liderazgo sin programa de transformación visible; 2 = trigger débil, de cumplimiento o con datos desactualizados.
4. **Prioridad:** A = fit 4–5 con trigger vigente y al menos un decisor con fuente; B = fit 3–4 con una limitante concreta (escrita en `notas`); C = fit 2–3 o trigger débil.
5. **Decision makers:** hasta 3 por cuenta, solo si una fuente pública (comunicado a BMV, nota de prensa de la empresa o medio) los nombra con su cargo. El CFO y el presidente del consejo se incluyeron solo cuando su rol ejecutivo es directo (Quálitas: Presidente Ejecutivo).
6. **Correo:** en todas las filas va `[patrón desconocido]@dominio`, porque no se encontró ninguna fuente que documente el patrón real. `estado_email` = NO VERIFICADO en todos los casos. La verificación queda para Hunter (Fase 2), antes de cualquier envío.

## Consultas realizadas (búsqueda web, 9-oct-2026)
- Banamex separación Citi 2025 director general reestructura nombramiento
- Edgardo del Rincón director general Banamex junio 2026
- BBVA México inteligencia artificial 2025 programa empleados ChatGPT Enterprise
- Santander México migración core Gravity nube 2025
- Banorte nuevo director general 2025 nombramiento transformación digital
- BanBajío Iván Lomelí director general 2026 · BanBajío reestructura julio 2026 Direcciones Generales Adjuntas
- Nu México licencia bancaria CNBV 2025 director general
- Klar adquiere Bineo Banorte licencia bancaria 2025
- Plata fintech licencia bancaria ronda Serie C
- Mercado Pago México licencia bancaria 2026 director general
- Revolut México inicio operaciones banco CEO
- Ualá México ABC Capital director general
- Kapital Bank adquisición Intercam CEO
- Multiva adquiere fideicomisos CIBanco director general
- HSBC México / Scotiabank México / Banco Inbursa nuevo director general 2025 2026
- Banco Azteca nuevo core bancario director general
- GNP Seguros director general inteligencia artificial
- AXA México venta / nuevo director general · Afores nuevo director general 2025 2026
- Openbank México director general · Stori licencia bancaria CEO · Banregio Hey Banco director general IA
- Quálitas nuevo director general · Konfío reestructura CEO · BanCoppel / Grupo Coppel director general · Citi México Luis Brossier

## Fuentes principales
Comunicados a BMV (eventos relevantes de BanBajío, Banorte, Quálitas y Scotiabank) · salas de prensa de Santander, Nu, BBVA y AXA México · Business Wire (Palantir–GNP) · El Financiero, Expansión, Milenio, El CEO, La Razón, Excélsior, Forbes México, Bloomberg, Bloomberg Línea, Xataka México, Descubre, Mexico Business News, Uno TV, EGADE. La URL exacta de cada dato está en la base (`fuente_trigger_url`, `fuente_contacto_url` y `notas`).

## Exclusiones
| Institución | Motivo |
|---|---|
| Banco Inbursa / GF Inbursa | Sin trigger 2024-2026 localizado; DG confirmado solo con fuente de 2023 |
| Konfío | Sin trigger 2025-2026; la única noticia es la salida de un directivo a Nu |
| Profuturo, Afore Sura, Afore XXI Banorte | Sin cambio de dirección ni programa de transformación confirmado en 2025-2026; la reforma de comisiones encontrada era de 2019-2020 |
| Afore Banamex | Se nombró DG en la asamblea del 20-abr-2026, pero sin nombre público; se cubre dentro de la cuenta Banamex |
| Bineo | Absorbido por Klar (en aprobación); se cubre en las filas de Klar y Banorte |
| CIBanco, Intercam (remanentes) | Instituciones intervenidas o vendidas por los señalamientos de FinCEN; fuera de foco por riesgo reputacional y regulatorio |
| Clip y otras fintechs de pagos | No se investigaron por el límite de búsquedas; candidatas para una segunda ronda |

## Limitaciones (leer antes de usar la base)
1. **Lectura directa de páginas no disponible.** WebFetch falló por DNS en todos los dominios probados (elceo.com, expansion.mx, bmv.com.mx, santander.com, nu.com, bloomberglinea.com). Nombres, cargos y fechas provienen de los resúmenes del buscador asociados a cada URL. **Antes de cualquier uso hay que abrir cada URL y confirmar** nombre, cargo y fecha.
2. **Se agotó el presupuesto de búsqueda** (límite compartido de la sesión) antes de buscar CHRO y CDO/CAIO en los bancos grandes. Por eso casi todos los contactos son CEO o DG. Faltan CHRO en Banamex, BBVA, Santander, Banorte, Nu y GNP [PENDIENTE]. La única cuenta con DGA de Capital Humano nombrada es BanBajío.
3. **BBVA México no tiene contacto.** Ningún resultado nombró a su DG con fuente, así que no se agregó a nadie de memoria.
4. **Sitios web y dominios:** se capturaron como dato corporativo conocido, sin verificarlos por fetch. Los dudosos (Kapital, Plata, Stori, sitio local de Citi y de Revolut) están marcados [PENDIENTE]. `linkedin_empresa` y `contacto_linkedin_url` quedan vacíos o [PENDIENTE] porque no se consultó LinkedIn (sin scraping).
5. **Vigencia:** varios nombramientos tenían fecha futura cuando se publicaron (Banamex 1-jun-2026, Citi 1-mar-2026, Quálitas 1-ene-2026, Nu nov-2026). La toma de posesión no está confirmada. AXA México (Daniel Bandle) y Banorte (Marcos Ramírez) se apoyan en fuentes de 2024 y 2025.
6. **Discrepancias marcadas:** el cargo de Javier Valadez (Multiva), el nombre del CEO de Revolut México, la fecha de la licencia de Plata y las cifras de pérdidas de Bineo.
7. Las cifras de terceros (clientes, activos, uso de IA) son autodeclaradas o vienen de prensa. Sirven para calificar la cuenta, no para citarlas en un deck sin pasar por RES-01.

## Conflictos de interés y riesgos para RISK-01
- **Experiencia previa del Founder en una fintech** (skill §8.1, caso de onboarding). No se sabe cuál fue. **El Founder debe confirmar** que ninguna de estas cuentas es un empleador actual o anterior: Nu, Plata, Klar, Mercado Pago, Revolut, Ualá, Stori, Kapital, Openbank, Hey Banco, BanCoppel. Si alguna lo es, se excluye o se maneja con reglas explícitas.
- **Riesgo reputacional:** Kapital y Multiva crecieron absorbiendo negocios de instituciones señaladas por FinCEN (Intercam y CIBanco). Banco Azteca pertenece a un grupo con alta exposición pública. Se recomienda que RISK-01 decida si se aborda a estas cuentas y cómo.
- **Cuentas conectadas:** del Rincón pasó de BanBajío a Banamex, Paulette Ley pasa de BanCoppel a Nu y Banorte vendió Bineo a Klar. Conviene coordinar los mensajes para no mostrar información de una cuenta a otra.
- **Traslape con el sector 05 (Retail):** Grupo Coppel. Hay que deduplicar en `00-maestro`.
- No se usó material de GASM ni de empleadores del Founder.
- **Nota operativa:** el scratchpad es compartido entre agentes. El script de otro sector sobrescribió el archivo temporal de este, y una ejecución escribió por error datos de manufactura en esta base. Se regeneró desde un script propio (`scratchpad/sal02-s04/`) y se validó que las 31 filas son del sector 04. La base del sector 01 no se tocó.

## Nombres de servicios
Las letras A–G siguen la `ESPECIFICACION.md` de PRX-0012. Estos nombres no coinciden del todo con el catálogo de la skill §5.1, y esa diferencia está abierta en D-P02. Ningún servicio está lanzado ni vendido.

## Decisión requerida del Founder
**1. Cómo completar la base antes de usarla**
- **A.** Usarla como está para planear (top-5) y verificar cada URL y cargo solo en las cuentas A antes de cualquier contacto.
- **B.** Abrir una segunda ronda de SAL-02 con presupuesto de búsqueda propio para agregar los CHRO y CDO faltantes, el contacto de BBVA México y la verificación de vigencia.
- **C.** Esperar a Hunter (Fase 2) y verificar todo junto.
- **Recomendación:** B, limitada a las 8 cuentas A. Esfuerzo: una sesión de SAL-02 más la revisión de RISK-01. Fecha límite sugerida: 2026-10-16.

**2. Conflictos de interés:** confirmar si alguna fintech de la lista fue su empleador. Fecha límite: antes de cerrar D-P07.

**3. Cuentas con riesgo reputacional (Kapital, Multiva, Banco Azteca):** A mantenerlas · B mantenerlas solo después del criterio de RISK-01 · C excluirlas. Recomendación: B.
