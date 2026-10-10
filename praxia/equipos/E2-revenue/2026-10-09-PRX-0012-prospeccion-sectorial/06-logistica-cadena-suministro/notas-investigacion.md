# PRX-0012-S06 · Notas de investigación — 06 Logística y cadena de suministro

> Owner: SAL-02 · Fecha de consulta: 2026-10-09 · Estado: **borrador para RISK-01 y QA-01** · Documento interno (lleva etiquetas de evidencia).
> Base: `base-logistica-cadena-suministro.csv` (24 filas, 21 empresas y 15 contactos con fuente pública).

## Mensaje clave
Logística en México tiene hoy tres tipos de trigger que encajan con el Adoption Gap: **integraciones y cambios de dueño** (Traxión–Solistica, Estafeta tras la cancelación de UPS, CPKC, el carve-out de Solistica Brasil y Colombia), **automatización desplegada a escala** (grúas automatizadas de APM Terminals y robótica e IA en WMS/TMS de DHL Supply Chain) y **expansión física por nearshoring** (Nextlalpan, Manzanillo, Lázaro Cárdenas, frontera norte). Para el Founder hay **4 cuentas A**, 7 B y 10 C. Las C son vigilancia o canal y no se contactan todavía. [PROPUESTA]

## 1. Método
1. Leí la especificación de PRX-0012, el estándar común, la skill (§0, §3.2, §3.3, §8.1, §8.2) y el registro de decisiones.
2. Usé búsqueda web (WebSearch) con consultas por empresa y trigger, en español y en inglés. No consulté LinkedIn ni hice scraping, y no usé bases compradas.
3. Para cada empresa registré el trigger con su URL y fecha. Un nombre de persona entró a la base **solo** cuando la URL fuente lo asocia al cargo. Si la fuente era vieja o un agregador sin fecha, lo marqué en `notas` como vigencia [PENDIENTE].
4. Fit ICP del 1 al 5 según la skill §3.3: sponsor con mandato, escala que estresa a la organización, trigger vivo y capacidad de medir. La prioridad combina fit, recencia del trigger (2024–2026) y decisor identificado:
   - **A:** fit 5, trigger de 2025–2026 y economic buyer nombrado.
   - **B:** fit 4, con trigger, o decisor fuera de México, o contacto pendiente.
   - **C:** fit 3 o menos, trigger fuera de ventana o [PENDIENTE], o plantilla bajo el umbral.
5. Correo: no inferí ningún patrón. Todos los contactos llevan `[patrón desconocido]@dominio` con estado `NO VERIFICADO`. El patrón se determinará con Hunter en la Fase 2, y solo después de D-P07.

## 2. Consultas usadas (muestra representativa)
- «Traxión 2025 adquisición logística director general nombramiento» · «Solistica FEMSA venta 2024 2025» · «Rodolfo Mercado Franco director general Traxión»
- «DHL Supply Chain México inversión 2025 almacenes automatización nearshoring CEO»
- «Estafeta nuevo director general 2025» · «UPS Estafeta adquisición 2024 2025 México»
- «CPKC México integración Kansas City Southern de México 2025 director general»
- «Grupo México Transportes Ferromex 2025 director general inversión»
- «Hutchison Ports México 2025 inversión Lázaro Cárdenas» · «APM Terminals Lázaro Cárdenas 2025 expansión director general» · «SSA México Manzanillo 2025»
- «Maersk México 2025 centro de distribución managing director» · «Ryder México 2025 expansión nearshoring»
- «CEVA Logistics México 2025» · «Kuehne+Nagel México 2025 country manager» · «FM Logistic México 2025»
- «99minutos 2025 financiamiento expansión última milla» · «Paquetexpress 2025» · «Transportes Castores 2025»
- «Vesta Lorenzo Berho Carranza CEO» · «Fibra Prologis Terrafina integración 2024 2025»

## 3. Fuentes principales (trigger)
| Cuenta | Fuente | Fecha |
|---|---|---|
| Traxión | [FEMSA, cierre de la desinversión de Solistica](https://www.femsa.com/en/press-room/press-release/femsa-completes-divestiture-of-certain-of-its-logistics-operations-to-traxion/) · [La Razón](https://www.razon.com.mx/negocios/2025/10/07/traxion-proyecta-ventas-por-mil-millones-de-dolares-para-su-division-logistica-en-2026/) | 2025-07-01 · 2025-10-07 |
| DHL Supply Chain MX | [Cluster Industrial, Mega Campus Nextlalpan](https://clusterindustrial.com.mx/dhl-inaugura-mega-campus-logistico-en-nextlalpan-con-inversion-de-200-mdp/) · [Forbes Colombia, plan LatAm](https://forbes.co/negocios/dhl-supply-chain-inversiones-latinoamerica) | 2025-08 |
| Estafeta | [El Imparcial, ruptura con UPS](https://www.elimparcial.com/dinero/2025/09/19/ups-y-estafeta-rompen-negociaciones-no-habra-venta-de-la-empresa-mexicana/) · [El Financiero, acuerdo original](https://www.elfinanciero.com.mx/empresas/2024/07/22/paquete-completo-ups-acuerda-comprar-estafeta/) | 2025-09-19 · 2024-07-22 |
| APM Terminals MX | [Expansión, Fase II/III Lázaro Cárdenas](https://expansion.mx/empresas/2026/03/20/apm-terminals-invierte-350-mdd-en-lazaro-cardenas-para-ampliar-su-capacidad-logistica) | 2026-03-20 |
| CPKC México | [Expansión, Plan México](https://expansion.mx/empresas/2025/02/10/cpkc-apuesta-plan-mexico-nuevo-mapa-ferroviario) | 2025-02-10 |
| Ferromex / GMXT | [Expansión, nuevo DG de Administración](https://expansion.mx/empresas/2024/07/01/alberto-antonio-vergara-nuevo-director-general-de-ferromex) | 2024-07-01 |
| Hutchison Ports MX | [Cluster Industrial, USD 542 M en Lázaro Cárdenas](https://clusterindustrial.com.mx/puerto-de-lazaro-cardenas-expande-su-infraestructura-con-542-mdd-en-inversion/) | 2025-04 |
| Maersk MX | [MundoMarítimo, depósito Manzanillo](https://www.mundomaritimo.cl/noticias/maersk-inauguro-nuevo-deposito-de-contenedores-en-manzanillo-mexico-con-inversion-de-us15-millones) | 2025-12 |
| Ryder MX | [Business Wire, expansión transfronteriza](https://www.businesswire.com/news/home/20240221427567/en/5600909/Ryder-Expands-Cross-Border-Footprint-in-U.S.-and-Mexico-to-Support-Growth-in-Nearshoring) | 2024-02-21 |
| 99minutos | [Descubre.vc](https://www.descubre.vc/noticia/fintech-impulsa-la-ltima-milla-en-99-minutos-2025-02-03) | 2025-02-03 |
| Solistica BR/CO | [Bloomberg Línea](https://www.bloomberglinea.com/latinoamerica/mexico/traxion-vende-el-antiguo-negocio-logistico-femsa-en-brasil-y-colombia/) | 2025 [mes PENDIENTE] |

Las URL de las cuentas C están en el CSV.

## 4. Top-5 cuentas [PROPUESTA]
| # | Cuenta | Trigger | Problema económico (hipótesis por validar en discovery) | Servicio sugerido | Primer contacto con fuente |
|---|---|---|---|---|---|
| 1 | **Grupo Traxión** (A) | Integración de Solistica desde jul-2025 y meta de >USD 1,000 M en Logística y Tecnología para 2026 | La integración no captura sinergias: dos culturas operativas, procesos duplicados y mandos medios sin rutinas comunes | A Transformation Diagnostic → B Adoption Architecture | Rodolfo Mercado Franco, Director General |
| 2 | **Estafeta** (A) | UPS canceló la compra el 17-sep-2025 tras 14 meses de proceso | Plan de crecimiento congelado durante la venta; riesgo de desalineación directiva y fuga de talento clave | A Diagnostic → G Strategic Advisory Retainer | Jens Grimm, Director General |
| 3 | **DHL Supply Chain México** (A) | Mega Campus Nextlalpan (~1,200 empleos en la fase inicial) y robótica e IA en WMS/TMS | La tecnología instalada no se usa a su capacidad; curva de aprendizaje de supervisores nuevos | C AI Adoption Accelerator + E Leadership & Capability | Mario Rodríguez de la Gala, Presidente DSC México |
| 4 | **APM Terminals México** (A) | Fase II con grúas ARMG automatizadas (mar-2026) y Fase III anunciada | La productividad de la terminal automatizada depende de nuevas rutinas, roles y seguridad en el piso | C AI Adoption Accelerator + E | Beatriz Yera Seibane, Directora General |
| 5 | **CPKC México** (B+) | Cierre de la integración CP-KCS prevista para 2026 y crecimiento transfronterizo | Operating model trinacional con decisiones lentas entre países; adopción desigual de estándares | B Adoption Architecture + D | Óscar del Cueto Cuevas, Presidente y DG |

**Siguiente paso sugerido:** que RISK-01 libere la base y el Founder decida el canal. Después, SAL-02 prepara borradores de outreach solo para las 4 cuentas A, con un mensaje anclado al trigger y sin envío.

## 5. Exclusiones y por qué
- **Mercado Libre (Mercado Envíos)** y **FEMSA**: son retail y consumo (sector 05). FEMSA además ya vendió su negocio logístico.
- **ASIPONA Lázaro Cárdenas y otras autoridades portuarias**: son entidades públicas, fuera del ICP de venta directa.
- **FM Logistic México**: no encontré ninguna señal de México; las noticias eran de España y Rumanía.
- **UPS México**: después de cancelar la compra de Estafeta no encontré ningún trigger local verificable.
- **Penske Logistics México**: la única fuente era de 2007.
- **Urbano e Infinia Logistics (Perú)**: no tienen fecha ni tamaño verificables.
- **Americold y la alianza de frío con CPKC**: sin fecha ni alcance en México verificables.

## 6. Limitaciones (leer antes de usar la base)
1. **El presupuesto de búsqueda web se agotó a mitad del trabajo.** Es un límite compartido de 200 búsquedas por turno entre todos los agentes de PRX-0012. Por eso quedaron sin investigar candidatas previstas (JSL y Ransa en LatAm, GEODIS, Tresguerras, Grupo TUM, Accel, FedEx y operadores aduanales), y la base tiene 21 empresas en lugar de las 25 posibles. Para completar el sector hace falta otra sesión de búsqueda.
2. **WebFetch no resolvió DNS** de ningún dominio (expansion.mx, traxion.global, clusterindustrial.com.mx y otros). Todos los datos vienen de los resúmenes del buscador con su URL. **Ninguna página fuente se abrió directamente.** RISK-01 o el Founder deben abrir cada URL de contacto antes de usarla.
3. Varias notas de *The Logistics World* y *MundoMarítimo* muestran como fecha la de consulta (2026), no la de publicación. Por eso esas fechas quedaron como [PENDIENTE].
4. No tengo cifras de plantilla con fuente para la mayoría de las cuentas. «500+» es un supuesto razonable para operadores nacionales o multinacionales [PENDIENTE].
5. No se llenó `linkedin_empresa` ni `contacto_linkedin_url` porque el brief prohíbe consultar LinkedIn.
6. Las vigencias de cargo con fuente de 2022–2023 (Estafeta, CEVA, 99minutos) pueden haber cambiado.

## 7. Datos personales y conflictos de interés
- La base contiene nombres y cargos de ejecutivos, todos tomados de fuentes públicas de prensa o corporativas. No contiene correos reales, teléfonos ni datos sensibles. Base legal propuesta: interés legítimo B2B, pendiente de validar con RISK-01 y un abogado (LFPDPPP, y GDPR o LGPD en la cuenta Brasil/Colombia). *Requiere revisión de un abogado en la jurisdicción aplicable.*
- Nada se carga al Command Center ni se envía antes de cerrar **D-P07**.
- **Posibles conflictos de interés que el Founder debe revisar:** Ferromex/GMXT pertenece a un grupo minero; CPKC, APM Terminals y Hutchison Ports operan en Lázaro Cárdenas, donde hay industria siderúrgica. Si el Founder trabaja o trabajó en minería o siderurgia, o con proveedores de esos grupos, debe declararlo antes de contactar a estas cuentas. No usé material GASM ni información de empleadores.
- **Posibles duplicados entre sectores:** 99minutos (sector 02) y DHL Express frente a DHL Supply Chain (misma marca, dos unidades). Maersk y APM Terminals son del mismo grupo; conviene coordinar un solo enfoque de cuenta.
