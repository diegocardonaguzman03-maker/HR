# PRX-0012-S01 · Notas de investigación · Sector 01 Manufactura e industria

**Dueño:** SAL-02 · **Reporta a:** SAL-01 · **Fecha:** 2026-10-09 · **Estado:** borrador para RISK-01 (datos personales) y QA-01
**Entregable asociado:** `base-manufactura.csv` (25 empresas, 28 filas, 26 contactos con URL de fuente pública)

> **Mensaje clave.** La manufactura en México vive tres rupturas a la vez: relevos de CEO, consolidación o cierre de plantas y rampas de capacidad por el nearshoring. En los tres casos ya se decidió y se invirtió; lo que falta es que la organización opere de la nueva forma. Es la definición del Adoption Gap [DEFINIDO]. Las 5 cuentas con mejor combinación de sponsor nuevo y trigger fresco son **Metalsa, Nemak, Heineken México, Volkswagen de México y Nissan Mexicana**. Nada se ha enviado ni cargado al Command Center (D-P07 sigue abierta).

---

## 1. Método

1. **Criterio de entrada** (brief PRX-0012-S01, skill §3.3 y §8.2): operación relevante en México, 500 o más empleados y al menos una señal pública de transformación en 2024–2026 (nuevo CEO o CHRO, M&A o escisión, nueva planta o expansión, cierre o consolidación, programa de transformación o de IA declarado).
2. **Selección por trigger, no por volumen** (§8.1): primero se buscó la señal y después la empresa. Se descartaron las empresas grandes sin un trigger fechado.
3. **Contactos:** solo personas cuyo nombre y cargo aparecen en una fuente pública (comunicado corporativo, prensa de negocios o sitio de la empresa). Se guardó la URL de esa fuente. **No se consultó LinkedIn** (ni scraping ni búsqueda dentro de la plataforma) y no se usaron bases compradas.
4. **Correos:** ninguna fuente pública confirmó el patrón de correo de ninguna empresa. Por eso todas las filas llevan `[patrón desconocido]@dominio` y `estado_email = NO VERIFICADO`. La verificación queda para Hunter en la Fase 2, antes de cualquier envío [DEFINIDO en ESPECIFICACION.md].
5. **Calificación:** `fit_icp_1a5` refleja cuatro criterios del ICP (§3.3): sponsor con mandato, trigger activo, escala que estresa a la organización y presupuesto probable. Prioridad: **A** = fit 4–5 con un sponsor nuevo o un trigger de menos de 12 meses · **B** = fit 3–4 con un trigger claro pero acceso o sponsor inciertos · **C** = nurture. La fórmula ABM de §8.2 no se calculó porque `Fit_Acceso` depende de la red del Founder, que no conozco [PENDIENTE].
6. **Servicio sugerido:** se asoció el tipo de trigger con el catálogo A–G de la especificación. Nuevo CEO → A/D · rampa de planta → B/E · IA o digital → C/F · cierre, consolidación o escisión → D/B.

## 2. Consultas usadas (WebSearch, 9-oct-2026)

- Nemak nuevo director general 2025 adquisición GF Casting Solutions
- Sigma Foods escisión Alfa 2025 director general nuevo
- Cemex nuevo CEO Jaime Muguiro 2025 transformación
- Mabe nueva planta inversión México 2025 director general · Mabe CEO director general 2026
- Grupo Bimbo inteligencia artificial transformación digital 2025 director · Grupo Bimbo nombramiento director general 2026
- Foxconn Guadalajara expansión planta servidores Nvidia 2025 México
- Grupo Industrial Saltillo GIS nuevo director general 2025 reestructura
- Vitro nuevo director general 2025 · Orbia nuevo CEO 2025 transformación · Alpek nuevo director general 2025 escisión
- Arca Continental transformación digital inteligencia artificial 2025 director
- Volkswagen de México nuevo presidente ejecutivo 2025 · BMW San Luis Potosí baterías 2025 presidente planta
- General Motors de México nuevo presidente 2025 2026 · Daimler Truck México nuevo presidente 2025 · Kia México Pesquería nuevo presidente
- Nissan Mexicana cierre CIVAC consolidación Aguascalientes 2025
- Bosch México nueva planta inversión 2025 · Schneider Electric México nueva planta 2025 presidente
- Coca-Cola FEMSA nueva planta 2025 · Grupo Lala nuevo director general · Kimberly-Clark de México nuevo director general
- Safran México Querétaro nueva planta 2025 · Hisense Monterrey expansión 2025 · Grupo Herdez nuevo director general 2025
- Heineken México planta Kanasín 2025 2026 · Lego México Ciénega de Flores expansión · Whirlpool México 2025 planta
- Aumovio México spin-off Continental 2025 · Metalsa nuevo director general 2025 Grupo Proeza

## 3. Fuentes principales (por cuenta prioritaria)

| Cuenta | Fuente del trigger | Fecha |
|---|---|---|
| Metalsa / Proeza | [Comunicado de Metalsa: Leadership Change as Part of its Transformation and Growth Strategy](https://metalsa.com/metalsa-announces-leadership-change-as-part-of-its-transformation-and-growth-strategy/) · [Cluster Industrial](https://clusterindustrial.com.mx/cambios-en-la-direccion-general-fortalecen-a-grupo-proeza-y-metalsa/) | nov-2025 |
| Nemak | [Nemak: Hervé Boyer asume como CEO](https://www.nemak.com/blog/news-3/herve-boyer-assumes-role-as-chief-executive-officer-of-nemak-19) · [Cluster Industrial: cierre de la compra de GF Casting Solutions](https://clusterindustrial.com.mx/nemak-cierra-la-compra-de-gf-casting-solutions-por-336-mdd/) | abr-2026 / feb-2026 |
| Heineken México | [Expansión: nombramiento de Oriol Bonaclocha](https://expansion.mx/empresas/2025/06/04/heineken-nombra-a-oriol-bonaclocha-como-su-ceo-en-mexico) · [Mexico News Daily: planta en Yucatán](https://mexiconewsdaily.com/business/heineken-to-invest-8-7-billion-pesos-in-new-yucatan-plant) | jun-2025 |
| Volkswagen de México | [Milenio: nuevo VP Ejecutivo de RH y Organización](https://amp.milenio.com/negocios/volkswagen-mexico-anuncia-vicepresidente-recursos-humanos) · [Cluster Industrial: producción e inversiones en México](https://clusterindustrial.com.mx/mientras-grupo-volkswagen-hace-recortes-en-europa-en-mexico-acelera-produccion-e-inversiones/) | 2026 |
| Nissan Mexicana | [Cluster Industrial: NP300 en Aguascalientes y cierre de CIVAC](https://clusterindustrial.com.mx/nissan-arranca-produccion-de-np300-en-aguascalientes-y-cierra-ciclo-historico-de-civac/) · [El CEO: confirmación del cierre](https://elceo.com/negocios/nissan-confirma-cierre-de-planta-civac-y-traslado-de-produccion-a-aguascalientes/) | abr-2026 |

Las fuentes de las otras 20 cuentas están en las columnas `fuente_trigger_url`, `fuente_contacto_url` y `notas` del CSV.

## 4. Exclusiones y conflictos de interés

**Regla aplicada:** la especificación prohíbe usar datos o material de los empleadores actuales o anteriores del Founder y de las carpetas GASM. **No se abrió ningún material GASM del repositorio.** Como no conozco los empleadores del Founder, apliqué la regla del brief: siderurgia y minería quedan fuera hasta que él lo confirme.

| Categoría | Empresas | Tratamiento |
|---|---|---|
| Siderurgia y minería (posible conflicto) | Ternium, Deacero, Grupo Simec, AHMSA, ArcelorMittal México, Grupo México, Peñoles, Fresnillo, Minera Frisco, entre otras | **No se investigaron ni se incluyeron en la base.** Requieren la confirmación del Founder antes de cualquier investigación o contacto. |
| Adyacentes (marcadas en el CSV) | **Cemex** (materiales de construcción con extracción de agregados), **GIS/Draxton** (fundición de hierro), **Nemak** (fundición de aluminio) | Están en la base con la marca «confirmar con el Founder» en `notas`. No se contacta hasta que él lo confirme. |
| Trigger débil o sin fuente | Orbia (programa de costos 2024–2027 sin URL confirmada), Vitro (reestructura de ene-2024; no hubo cambio de CEO), GM de México (sin cambio de dirección en 2025–2026), Kimberly-Clark de México y Coca-Cola FEMSA (sin trigger claro en 2024–2026) | Descartadas en esta ronda. Orbia queda en reserva si aparece una fuente. |
| Rol fuera del objetivo | Mabe: el único vocero con fuente es el director general de Asuntos Corporativos | La empresa entra a la base sin contacto [PENDIENTE]. |
| Sin URL exacta | Holger Nestler (presidente de Volkswagen de México según los resultados de búsqueda) | No se incluyó como contacto porque no tengo la URL exacta de la fuente [PENDIENTE]. |

El Founder trae experiencia previa en una fintech (skill §8.1). No tiene relación con este sector y no genera conflicto aquí.

## 5. Limitaciones (leer antes de usar la base)

1. **No pude abrir las páginas.** WebFetch y curl fallaron por la política del proxy de salida. Cada URL viene de resultados de búsqueda que citan esas páginas, pero ninguna se abrió directamente. Por eso cada fila dice «abrir y confirmar antes de usar». Hay que hacer esa revisión antes de la puerta de RISK-01.
2. **Se agotó el presupuesto de búsquedas web de la sesión** (límite compartido entre agentes). Por eso no se completó la segunda pasada para identificar a los CHRO, CIO y Heads of Transformation. **Cobertura actual: 22 de 26 contactos son CEO o directores generales.** Solo hay un líder de RH (VW, Stephan Meier), un líder de RH y Country Head (Aumovio, Alejandro Campos) y dos líderes digitales (Bimbo, José Antonio Parra; Arca, Santiago Herrera). El mapa de decisores de §3.2 (Champion = CHRO o líder de transformación) queda incompleto.
3. **Vigencia de cargos:** seis contactos vienen de fuentes de 2023–2025 y llevan la marca [PENDIENTE] de vigencia: Parra (Bimbo), Puente (Whirlpool), Suárez (Safran), Firsching (Bosch), Campos (Aumovio) y Herrera (Arca, por la atribución de la URL).
4. **Tamaño:** las cifras de `tamano_aprox` son estimaciones de orden de magnitud [PENDIENTE verificar]. Ninguna se tomó de un reporte anual en esta ronda. Todas las empresas superan con claridad los 500 empleados.
5. **Datos con discrepancias entre medios** (no citarlos sin el comunicado oficial): el monto de la compra de GF Casting por Nemak (336 vs 216 mdd), la ubicación de la planta de Foxconn (El Salto vs Tonalá), si Mabe construye plantas nuevas o amplía las existentes y si los 400 mdd de LEGO son adicionales a los 508 mdd.
6. `linkedin_empresa` y `contacto_linkedin_url` quedan como [PENDIENTE] a propósito: no se consultó LinkedIn.
7. Sitio y dominio [PENDIENTE verificar] en BMW SLP, Hisense, Daimler Truck México y Mabe. El dominio de correo puede ser distinto del dominio web (por ejemplo, bmw.com o whirlpool.com).

## 6. Top-5 cuentas recomendadas [PROPUESTA]

| # | Cuenta | Trigger (por qué ahora) | Hipótesis de valor (problema económico) | Servicio PRAXIA sugerido | Puerta de entrada |
|---|---|---|---|---|---|
| 1 | **Metalsa (Grupo Proeza)** | La empresa declaró en público una «Transformation and Growth Strategy». Nuevo director general desde 2026 (Hans Dieltjens) y nuevo CEO del holding (Daniel Martínez-Valle) | Una estrategia nueva con un líder nuevo: el riesgo es que la estrategia se quede en el comité y no llegue a las plantas. El valor está en la velocidad de captura de la estrategia en una operación multinacional de chasis y estructuras | **A Transformation Diagnostic** → **E Leadership & Capability Transformation** | Diagnóstico de la brecha de adopción de la nueva estrategia en los primeros 12 meses del CEO |
| 2 | **Nemak** | Nuevo CEO desde el 1-abr-2026 (primer CEO no mexicano en 40+ años) + integración de 9 plantas y ~2,500 personas de GF Casting Solutions (cierre el 12-feb-2026) | Integración post-M&A en 5 países con un líder nuevo: el riesgo es no capturar los beneficios operativos previstos y perder productividad en las plantas adquiridas | **D Organizational Effectiveness Advisory** (operating model de integración) + **A Diagnostic** | Línea base de adopción del modelo operativo de Nemak en las plantas integradas |
| 3 | **Heineken México** | Nuevo CEO desde jul-2025 + arranque de la octava planta (Kanasín, Yucatán; 8,700 mdp; operación prevista en 2026) | Una planta greenfield con plantilla nueva tarda en llegar a la productividad objetivo. Cada mes de rampa más lenta es capacidad instalada sin retorno | **B Adoption Architecture** + **E Leadership & Capability Transformation** | Arquitectura de adopción de la rampa de la planta (rutinas de primera línea y mandos medios) |
| 4 | **Volkswagen de México** | Nuevo VP Ejecutivo de Recursos Humanos y Organización (Stephan Meier, en el Consejo desde abr-2026) + producción del Golf híbrido a partir de 2027 [PENDIENTE confirmar] | Un cambio tecnológico de producto exige recalificar a miles de personas antes del arranque. Si las capacidades llegan tarde, se retrasa la curva de calidad y de volumen | **E Leadership & Capability Transformation** + **B Adoption Architecture** | Diagnóstico de capacidades críticas para el arranque de 2027, con el nuevo líder de RH como champion |
| 5 | **Nissan Mexicana** | Cierre de CIVAC (27-mar-2026) y consolidación en Aguascalientes bajo Re:Nissan; nueva línea de pick-ups (96 mdd) | Una planta receptora con líneas trasladadas, más volumen y presión de costo: el riesgo es la caída de productividad y calidad durante la estabilización | **D Organizational Effectiveness Advisory** + **B Adoption Architecture** | Diagnóstico de estabilización de la planta receptora (adopción de estándares y rutinas) |

**Por qué no están en el top-5 Bimbo y BMW (las dos son A):** Bimbo tiene un fit alto (nuevo CEO e IA ya desplegada), pero una boutique sin casos difícilmente llega a su CEO global. Conviene entrar por una unidad de negocio o por un caso de uso de IA. En BMW SLP, las decisiones de compra probablemente se toman en Múnich [PENDIENTE].

**Advertencia (modo socio):** las 5 cuentas son grandes y PRAXIA no tiene clientes ni casos que mostrar [DEFINIDO]. Sin un camino cálido (alguien de la red del Founder que lo presente), la probabilidad de respuesta en frío a un CEO es baja. La palanca real es un acceso tibio más un diagnóstico de bajo riesgo, no una secuencia de correos.

## 7. Siguiente paso operativo [PROPUESTA]

1. Pasar la base a RISK-01 para el checklist de datos personales (D-P07).
2. Con el presupuesto de búsqueda repuesto: abrir y confirmar las 26 URL y completar el CHRO y el COO o CIO de las cuentas A (objetivo: 2–3 contactos por cuenta A).
3. El Founder revisa su red para encontrar caminos cálidos hacia las cuentas del top-5 (y en LinkedIn personal, sin extraer datos).
4. Las secuencias de outreach quedan como borrador, sin enviar, hasta que el Founder las apruebe (RACI).

---

## Decisión requerida del Founder

**1. Conflictos de interés en manufactura metalúrgica y extractiva**
- **A.** Mantener fuera la siderurgia y la minería, y aprobar que Cemex, GIS y Nemak sigan en la base.
- **B.** Excluir también Cemex, GIS y Nemak (perderíamos la cuenta #2 del top-5).
- **C.** Revisar caso por caso con la lista de sus empleadores anteriores.
- **Recomendación:** C, y si no hay tiempo, A. Solo el Founder sabe dónde trabajó antes.
- **Riesgos:** contactar a un exempleador o a un competidor directo de él (reputacional y contractual, por ejemplo cláusulas de no competencia). Requiere revisión de un abogado si existe un acuerdo de no competencia.
- **Costo o esfuerzo:** 10 minutos del Founder.
- **Fecha límite:** antes de que RISK-01 cierre D-P07, a más tardar el 2026-10-16.

**2. Siguiente ronda de investigación**
- **A.** Completar el CHRO, COO o CIO y verificar las URL solo de las 9 cuentas A.
- **B.** Hacerlo para las 25 cuentas.
- **C.** Detener aquí y priorizar el acceso por la red del Founder.
- **Recomendación:** A + C en paralelo: precisión, no volumen (§8.1).
- **Riesgos:** con B se gasta esfuerzo en cuentas C de baja probabilidad. Con solo C quedan cuentas sin champion identificado.
- **Costo o esfuerzo:** A ≈ una sesión de SAL-02 (requiere presupuesto de búsqueda web).
- **Fecha límite:** 2026-10-16.

**3. Top-5:** confirmar o cambiar las 5 cuentas antes de que MKT-02 personalice la narrativa del deck de manufactura. **Fecha límite:** 2026-10-16.

---

## Handoff

```json
{
  "brief_id": "PRX-0012-S01",
  "owner": "SAL-02",
  "objective": "Identificar 20–25 empresas de manufactura con operación en México, 500+ empleados y trigger público 2024–2026, con hasta 3 decision makers con fuente pública por empresa, priorizadas A/B/C contra el ICP de la skill §3.",
  "deliverable": "praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/01-manufactura/base-manufactura.csv; praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial/01-manufactura/notas-investigacion.md",
  "evidence_and_sources": [
    "25 empresas con URL de fuente del trigger (prensa de negocios y comunicados corporativos de 2024–2026)",
    "26 contactos con nombre, cargo y URL de fuente pública; fecha de consulta 2026-10-09",
    "Sección 3 de las notas y columnas fuente_* del CSV"
  ],
  "assumptions": [
    "Las URL vienen de resultados de búsqueda; ninguna página se abrió directamente porque el proxy bloqueó WebFetch y curl",
    "tamano_aprox es una estimación de orden de magnitud [PENDIENTE verificar]",
    "Ningún patrón de correo se confirmó; todos son [patrón desconocido]@dominio, NO VERIFICADO",
    "Siderurgia y minería excluidas por un posible conflicto de interés sin confirmar"
  ],
  "risks": [
    "Cargos posiblemente desactualizados en 6 contactos con fuentes de 2023–2025",
    "Cobertura baja de CHRO, CIO y Transformation: 22 de 26 contactos son CEO o directores generales",
    "Datos personales de ejecutivos en UE/MX: requieren base legal validada (LFPDPPP, GDPR) antes de cualquier tratamiento o contacto",
    "Temas sensibles en tres cuentas (cierre de CIVAC, agua en Yucatán, relación sindical en Puebla); no usarlos como gancho"
  ],
  "decisions_needed": [
    "Confirmar los conflictos de interés (Cemex, GIS, Nemak; siderurgia y minería excluidas) antes del 2026-10-16",
    "Aprobar la segunda ronda de investigación solo para las cuentas A",
    "Confirmar el top-5 para la personalización del deck de manufactura",
    "D-P07: no cargar al Command Center hasta cerrar el checklist de RISK-01"
  ],
  "next_owner": "RISK-01",
  "review_status": "borrador"
}
```
