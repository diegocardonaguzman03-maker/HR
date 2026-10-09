# PRX-0012-S05 · Notas de investigación · Sector 05 Retail, consumo y e-commerce

> Dueño: SAL-02 · Reporta a: SAL-01 · Siguiente revisión: RISK-01 (datos personales y claims), luego QA-01 · Fecha: 2026-10-09 · Estado: **borrador**
> Archivo de datos: `base-retail-consumo.csv` (22 empresas, 31 filas, 30 contactos con fuente pública).
> **Nada se envía y nada se carga al Command Center** hasta cerrar D-P07 (checklist de RISK-01).

## 1. Mensaje clave
Sí hay cuentas en el sector con trigger activo en 2025–2026. La señal más frecuente es el **relevo de liderazgo**: hubo nuevo CEO en FEMSA, Coppel, Walmex, Alsea, Palacio de Hierro y La Comer, y FEMSA también estrenó CHRO. La segunda señal es una **inversión en tecnología cuyo retorno depende de que la gente la use**: los 34 proyectos de IA de Liverpool, el ERP y el CRM de Sanborns, los copilotos de Bimbo y los CEDIS con IA de Walmex. Las dos encajan con el muro del ICP: «su estrategia está lista; su organización no» [DEFINIDO, skill §3.3]. Las 6 cuentas A son FEMSA/OXXO, Coppel, Liverpool, Palacio de Hierro, La Comer y Alsea [PROPUESTA].

## 2. Método
1. **Universo:** cadenas de autoservicio, departamentales, conveniencia, farmacias, restaurantes multi-unidad, CPG con canal retail y e-commerce con operación en México y 1,000+ empleados (umbral del brief).
2. **Búsqueda de triggers 2024–2026** por empresa: cambio de CEO o CHRO, IA en tienda, supply o servicio, programa omnicanal, expansión acelerada, reorganización o escisión y presión de productividad o rotación (skill §3.3, triggers de compra).
3. **Decision makers:** solo los que aparecen con nombre y cargo en una fuente pública (comunicado corporativo, aviso a la BMV, prensa de negocios). No se consultó LinkedIn ni se hizo scraping. `contacto_linkedin_url` queda `[PENDIENTE]` para que se capture a mano.
4. **Correo:** no se pudo confirmar ningún patrón de dominio con una fuente pública. Por eso todas las filas llevan `[patrón desconocido]@dominio` y `estado_email = NO VERIFICADO`. Hunter (Fase 2) se usa antes de cualquier envío.
5. **Calificación [PROPUESTA]:** `fit_icp_1a5` combina cuatro criterios: escala de primera línea, presencia de sponsor (CEO o CHRO con mandato), fuerza del trigger y que el problema justifique USD 20k. La prioridad aplica la lógica ABM de §8.2 (Fit ICP, presupuesto, acceso y señal), pero de forma cualitativa porque no hay datos de acceso:
   - **A:** trigger de 2025–2026, sponsor identificado y problema de adopción evidente.
   - **B:** fit alto con acceso difícil, trigger indirecto o datos incompletos.
   - **C:** trigger débil o antiguo. Se queda en nurture.

## 3. Consultas realizadas (WebSearch, 2026-10-09)
Walmex nuevo DG 2025 e IA · FEMSA/OXXO DG 2025 · Bimbo IA y transformación 2025 · Liverpool nuevo DG y omnicanal · Coppel DG 2025 y transformación digital · Soriana DG 2025 · Alsea Christian Gurría · Tiendas 3B expansión 2025 · La Comer Héctor de la Barreda · Chedraui y Smart & Final · Sigma y escisión de Alfa · Arca Continental e IA · Kimberly-Clark de México DG · Herdez DG y transformación · Farmacias del Ahorro DG · Grupo Axo omnicanal y adquisiciones · nombramientos de CHRO en retail en México · Mercado Libre México inversión y empleos · Becle DG · Grupo Sanborns transformación · Liverpool IA e inversión · Palacio de Hierro DG · Rappi México DG · Farmacias Guadalajara expansión · líderes de Personas en Walmex, Coppel, Alsea, OXXO, Bimbo, Liverpool y FEMSA.

## 4. Fuentes principales
Las URLs completas están por fila en el CSV (`fuente_trigger_url`, `fuente_contacto_url`).
- **Corporativas y regulatorias:** femsa.com (plan de sucesión, sep-2025), femsa.gcs-web.com (CHRO), files.walmex.mx (aviso de cambio de CEO), corporate.walmart.com (liderazgo), elpuertodeliverpool.mx (comunicado commercetools, feb-2026), grupoherdez.com.mx (resoluciones de dic-2025 e Informe del Director 2026), grupobimbo.com (steering committee), cuervo.com.mx (evento relevante 2025), bmv.com.mx.
- **Prensa de negocios:** Expansión, Bloomberg Línea, El CEO, Milenio, Xataka México, DPL News, Mexico Business News, InformaBTL, The Logistics World, DF (Chile), Modaes, Infobae, MarketBeat/Seeking Alpha (resultados de BBB Foods).
- **Académica:** Harvard Business School, caso «Grupo Coppel: Leading Digital Transformation and Change» (dic-2025), usado como fuente del cargo de Gloria Canales.

## 5. Top-5 cuentas [PROPUESTA]
| # | Cuenta | Trigger (fuente en el CSV) | Problema económico hipotético | Servicio sugerido | Primer interlocutor |
|---|---|---|---|---|---|
| 1 | **Grupo Coppel** | Nuevo DG desde jul-2025, con transición a ene-2026. Inversión de MXN 80 mil millones en transformación digital y expansión. Nueva plataforma de talento y Universidad Corporativa con IA generativa | La inversión digital ya está comprometida. Si las tiendas, la cobranza y el crédito no adoptan las nuevas herramientas, el retorno no llega | A Diagnostic → B Adoption Architecture + C AI Adoption Accelerator | Diego Coppel Sullivan (DG). Champion posible: Dirección de Estrategia Digital |
| 2 | **El Puerto de Liverpool** | 34 proyectos de IA, comercio agéntico con commercetools (feb-2026) y tiendas como centros de fulfillment (95% de la venta digital) | Muchos pilotos de IA y pocos con uso sostenido. El costo es la diferencia entre lo que se despliega y lo que se usa | C AI Adoption Accelerator + F Transformation Analytics | Enrique Güijosa (DG) |
| 3 | **FEMSA / OXXO** | Nuevo CEO de FEMSA (nov-2025), nueva CHRO (ene-2026) y nuevo DG de OXXO México | Con 28,000+ tiendas, cada punto de rotación o de inconsistencia operativa en la primera línea se multiplica | A Diagnostic → E Leadership & Capability (líderes de tienda) | Sara Robles Romero (CHRO) como champion. José Antonio Fernández Garza-Lagüera como economic buyer |
| 4 | **Grupo Palacio de Hierro** | CEO externa desde jun-2025, reposicionamiento hacia lujo experiencial y nuevo equipo directivo desde ago-2026 | El reposicionamiento depende de cómo vende el piso de ventas. Sin rutinas nuevas, el cambio se queda en marca | A Diagnostic → E Leadership & Capability | Eléonore de Boysson (DG) y Alexandra Jeanneau (Ventas Tienda) |
| 5 | **Grupo La Comer** | DG externo desde ene-2026 y relanzamiento del formato de proximidad Sumesa | Un DG nuevo frente a un equipo heredado, con un formato que compite con OXXO y 3B por costo y velocidad | A Diagnostic + D Organizational Effectiveness | Héctor de la Barreda (DG) |

Siguiente en la lista: **Alsea** (A). Tiene nuevo CEO desde jul-2025 y caída de utilidad en 1T25.

**Cómo entrar [PROPUESTA]:** a través de la red del Founder y con una pieza de insight sectorial, no con correo en frío (skill §8.1: «nada de frío masivo»). Ningún mensaje sale sin aprobación del Founder.

## 6. Exclusiones y descartes
- **Kimberly-Clark de México:** no se encontró trigger 2024–2026. El DG sigue sin cambios y la única señal es un aumento de precios.
- **Grupo Elektra:** excluida por riesgo reputacional, a partir de los litigios fiscales que se conocen públicamente. No se consultó fuente en esta ronda, así que hay que verificarlo. No conviene asociar la marca PRAXIA en H1 [PROPUESTA].
- **Grupo Gigante/Toks, Genomma Lab, Grupo Lala, Natura/Avon, Nestlé México, PepsiCo México y Grupo Modelo:** no se investigaron porque se acabó el presupuesto de búsqueda. Quedan como candidatas para una segunda ronda.
- **Nombres detectados sin fuente atribuible** (no se cargaron como contacto): el DG de Grupo Sanborns, la nueva VP de eCommerce de Walmex, el nuevo CEO global de Bimbo (los titulares dan nombres distintos) y un «DG Carlos Marín» de Liverpool que aparece en una nota contradictoria.

## 7. Riesgos, conflictos y deduplicación
- **Posibles conflictos de interés:** el Founder tiene experiencia previa en una fintech (skill §8.1). Hay que confirmar que no existe relación con Spin by OXXO (FEMSA), BanCoppel (Coppel), Mercado Pago (Mercado Libre) ni RappiPay (Rappi). No hay cuentas siderúrgicas en esta base.
- **Sensibilidad:** en Farmacias del Ahorro **no** debe usarse el fallecimiento del cofundador (ago-2026) como gancho de contacto.
- **Duplicados entre sectores:** Bimbo, Sigma, Herdez, Arca Continental y Becle pueden aparecer también en 01 Manufactura. Mercado Libre y Rappi pueden repetirse en 02, 03 o 06. Hay que deduplicar en `00-maestro/`.
- **Umbral de tamaño:** Grupo Nutrisa podría tener menos de 1,000 empleados. Se valida antes de priorizarla.
- **Anti-cliente posible:** Tiendas 3B tiene un modelo de bajo costo y puede preferir resolver todo internamente. Se valida en discovery.

## 8. Limitaciones (leer antes de usar la base)
1. **No se pudo abrir ninguna página.** WebFetch y curl fueron rechazados por la política de red del entorno (ENOTFOUND / 403). Toda la evidencia viene de los resultados y resúmenes del buscador. **Cada URL debe abrirse y confirmarse antes de usar un nombre o un cargo.** Esta advertencia también va en la columna `notas` de cada contacto.
2. **Se agotó el presupuesto de búsqueda** del turno (200 consultas compartidas entre todos los agentes). Por eso faltan:
   - CHRO y COO de la mayoría de las cuentas (solo están FEMSA y Bimbo);
   - plantilla exacta (los tamaños marcados `[Supuesto]` vienen de conocimiento general);
   - dominios web marcados `[verificar]`;
   - las URLs de LinkedIn de empresa (`[PENDIENTE]`).
3. Varias fuentes de contacto son de 2023–2024 (Chedraui, Axo, Fragua, Soriana, Bimbo Digital). Su vigencia a 2026 está marcada `[PENDIENTE]`.
4. Las fechas `fecha_fuente` con solo año y mes son aproximadas porque el buscador no mostró el día.

## 9. Decisión requerida del Founder
**Tema:** cómo completar y usar esta base.

| Opción | Qué implica | Esfuerzo |
|---|---|---|
| **A** | Segunda ronda de SAL-02 con presupuesto de búsqueda propio y acceso de lectura a las URLs. Cubre CHRO/COO de las 6 cuentas A, valida plantillas y dominios y suma las 7 candidatas que no se investigaron | ~1 sesión de agente |
| **B** | Usar solo el top-5 como está. El Founder valida a mano los nombres (abriendo las URLs) y prepara discovery con su red | 1–2 h del Founder |
| **C** | Congelar la base hasta cerrar D-P07 con RISK-01 | Sin costo inmediato. Retrasa la prospección |

**Recomendación [PROPUESTA]: A en paralelo con C.** RISK-01 cierra el checklist mientras se completa la base, y no se contacta a nadie hasta que ambas cosas estén listas.
**Riesgos:**
- Si se usa la base sin verificar, puede haber nombres o cargos desactualizados, con el costo reputacional que eso implica.
- Si existe un conflicto fintech no revisado, el problema es ético y contractual.

**Además, el Founder debe confirmar:**
1. Que no hay conflicto con las cuentas que tienen negocio fintech (sección 7).
2. Que el orden del top-5 le parece correcto.

**Fecha límite sugerida:** 2026-10-16, alineada con D-P03 y D-P07.

## 10. Revisión de calidad (estándar común §7)
- Parte del problema económico: sí. Cada cuenta lleva hipótesis de valor y servicio.
- Datos inventados: no. Lo no verificado lleva `[Supuesto]` o `[PENDIENTE]`.
- Las PROPUESTAS no se presentan como hechos.
- La regla de datos §8.2 se cumple: sin correos inventados, con fuente por nombre y sin LinkedIn.
- Idioma: un solo idioma (español).
- Voz PRAXIA: sin palabras prohibidas.
- Paleta, tipografía y render: no aplican (CSV y Markdown internos).
- Nota legal: la base legal se declara «Interés legítimo B2B — pendiente validación RISK-01/abogado». **Requiere revisión de un abogado en la jurisdicción aplicable** (LFPDPPP, GDPR, CAN-SPAM) antes de cualquier contacto.
