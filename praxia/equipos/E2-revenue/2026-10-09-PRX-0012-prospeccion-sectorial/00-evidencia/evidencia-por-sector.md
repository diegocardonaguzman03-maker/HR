# PRX-0012-E · Evidencia por sector para los decks de prospección

| | |
|---|---|
| Brief | PRX-0012-E · Owner RES-01 (E5) · Encargo aprobado por el Founder (decks por sector + prospección) |
| Consumidores | MKT-02 (narrativa y `deck-builder/content/*.json`), DSN-01 (construcción), SAL-02 (triggers por empresa) |
| Fecha de elaboración y de consulta de todas las fuentes | 2026-10-09 |
| Estado | Borrador para QA-01. **No es material para clientes.** Las etiquetas [DEFINIDO]/[TRABAJADO]/[PROPUESTA]/[PENDIENTE] son internas |
| Regla de uso | MKT-02 copia de la §4 «Cifras aprobadas para decks» **sin reinterpretar**. Lo que no está en la §4 no va a un deck |

---

## 0. Método, alcance y limitaciones (constitución, regla 8)

**Método.**
1. Las cifras que ya usan los decks se rastrearon hasta el editor original (BCG, Deloitte, Gartner/Evanta) y se compararon palabra por palabra con la redacción del deck (`00-fuentes/texto/Praxia_Sales_Deck.txt`, lámina 03; `00-fuentes/texto/Praxia_Brand_Strategy.md`, lámina 7).
2. Para cada sector se buscaron datos de 2024–2026 que muestren la distancia entre lo que se invierte o se declara (IA, digitalización, nearshoring, transformación) y lo que se adopta o se logra. Se dio prioridad a fuentes primarias de México o LatAm (INEGI vía CMD, Secretaría de Economía, KPMG México, LAVCA) y, después, a fuentes globales primarias.
3. Un dato solo cuenta como **VERIFICADO** cuando el texto se localizó en el dominio del editor original (bcg.com, deloitte.com, evanta.com/gartner.com, gob.mx, kpmg.com, etc.). Los datos que solo aparecen en prensa o en agregadores quedan **[PENDIENTE]** y no se usan.

**Limitaciones (leer antes de usar):**
- **Lectura directa bloqueada.** En este entorno, WebFetch no resolvió DNS y la política de red rechazó la descarga directa (p. ej., `web-assets.bcg.com`: CONNECT 403). La verificación se hizo con el buscador restringido al dominio del editor: las citas son **extractos que el buscador devolvió de la página original**, no una lectura de la página o del PDF completo. Riesgo residual: un matiz de redacción o de página. **Mitigación obligatoria:** antes de enviar cualquier deck a un prospecto, QA-01 o el Founder abre cada URL de la §4 y confirma la cita visualmente (unos 15 minutos en total).
- **Presupuesto de búsqueda agotado.** El límite de 200 búsquedas web del turno, compartido con los demás agentes de PRX-0012, se agotó a media investigación. Resultado: los sectores **01 a 03 tienen evidencia sectorial verificada**. Los sectores **04 Servicios financieros, 05 Retail y 06 Logística tienen 0 a 2 datos propios del sector**. Se cubren con evidencia transversal de México que sí aplica, y la lista de fuentes por verificar queda marcada [PENDIENTE] (ver «Decisión requerida del Founder»).
- Varias cifras vienen de **encuestas a ejecutivos** (autorreporte) o de **heurísticas de consultoría** (BCG 10-20-70). Muestran asociación, no causalidad. Así se indica en cada caso.
- Las **predicciones** de Gartner se presentan siempre como predicción, nunca como hecho observado.

**Convención.** En cada dato, **«Fuente dice»** es la afirmación del editor y **«Lectura PRAXIA»** es nuestra interpretación [PROPUESTA]. En los decks, la interpretación nunca se atribuye a la fuente.

---

## 1. Evidencia transversal: verificación de las cifras de los decks actuales (skill §9.1)

### T1 · BCG: ~5% captura ganancias sustanciales de la IA → **VERIFICADO** (con matiz de origen)
| Campo | Detalle |
|---|---|
| Redacción actual del deck | «~5% de las organizaciones captura ganancias sustanciales de la IA. BCG · 2026» |
| Fuente dice (extracto, EN) | «only about 5% of organizations have managed to reap substantial financial gains from AI», definidas como «increases to revenue or cash flow, along with significant process and workflow improvements» |
| Publicación | BCG, *AI Transformation Is a Workforce Transformation*, Julie Bedard y Vinciane Beauchene, **4 feb 2026** |
| URL | https://www.bcg.com/publications/2026/ai-transformation-is-a-workforce-transformation |
| Origen del dato | BCG *Build for the Future x AI 2025 Global Study* (encuesta a ejecutivos C-level sobre madurez en IA). El dato es de 2025 y el artículo que lo cita es de 2026 |
| Fecha de consulta | 2026-10-09 |
| Alcance | Global |
| Matiz | Es una **proporción de empresas**, no una proporción del valor. No se combina con el 70% (T2) en una sola frase |
| Redacción aprobada | «Solo ~5% de las organizaciones obtiene ganancias financieras sustanciales de la IA.» Fuente: BCG, 2026 (Build for the Future 2025) |

### T2 · BCG: 70% del valor de la IA está en las personas → **VERIFICADO** (con matiz metodológico)
| Campo | Detalle |
|---|---|
| Redacción actual | «70% del valor de la IA viene del componente humano —no del algoritmo (10%) ni de la tecnología (20%). BCG, 2026» |
| Fuente dice (extracto, EN) | «about 10% of value from AI comes from the algorithms themselves and another 20% comes from the technology required to implement them. The remaining 70% comes from rethinking the people component.» |
| Publicación, URL y fechas | Las mismas de T1 (4 feb 2026; consulta 2026-10-09) |
| Alcance | Global |
| Matiz | Es la **regla 10-20-70 que BCG deriva de su trabajo con clientes** («in our case work»). Es una heurística de consultoría, no una medición auditada. BCG dice «rethinking the people component» (repensar el componente humano), no «las personas» a secas |
| Redacción aprobada | «En la experiencia de BCG, ~70% del valor de la IA depende de repensar el componente humano; 20%, de la tecnología; 10%, de los algoritmos.» Fuente: BCG, 2026 |

### T3 · Deloitte: tech-first, 1.6× más probable sin retorno → **DIFIERE** (redacción y origen)
| Campo | Detalle |
|---|---|
| Redacción actual | «1.6× más probable no ver retorno con un enfoque "tech-first". Deloitte · 2026» |
| Fuente dice (extracto, EN, página del reporte 2026) | «most organizations (59%) are taking a tech-focused approach when it comes to AI. But those taking a tech-focused approach are 1.6x more likely to *not* realize returns on AI investments that exceed expectations compared to those that take a human-centric approach» |
| Fuente dice (comunicado original, EN) | «59% of surveyed organizations report a tech-focused approach to AI investment», y esas empresas son «1.6x more likely to report their AI investments are not exceeding expectations» |
| URLs | Reporte: https://www.deloitte.com/us/en/insights/topics/talent/human-capital-trends.html (2026 Global Human Capital Trends, *From tensions to tipping points: Choosing the human advantage*; comunicado del reporte: **4 mar 2026**, https://www.deloitte.com/us/en/about/press-room/deloitte-report-winning-organizations-will-build-the-human-advantage.html) · Origen: *Work Redesign Essential to Realize AI Return on Investment*, **27 oct 2025**, https://www.deloitte.com/us/en/about/press-room/work-design-essential-to-ai-roi.html |
| Muestra | «recent Deloitte research with **100 C-suite leaders**» de empresas con más de 5,000 empleados. **No** proviene de la encuesta principal de Human Capital Trends (más de 9,000 líderes) |
| Fecha de consulta | 2026-10-09 |
| Alcance | Global (principalmente EE. UU.) |
| En qué difiere | (1) Deloitte no dice «sin retorno». Dice **«no obtener retornos que superen las expectativas»**: el deck exagera. (2) Deloitte usa «tech-focused», no «tech-first». (3) El dato nace en oct 2025 con n=100 y Deloitte lo retoma en el reporte 2026 |
| Redacción aprobada (corregida) | «Las organizaciones con un enfoque de IA centrado en la tecnología —59% del total— tienen 1.6 veces más probabilidad de no lograr retornos que superen sus expectativas que las que ponen a las personas al centro.» Fuente: Deloitte, 2026 Global Human Capital Trends (estudio con 100 líderes C-suite) |
| Acción | **Retirar la redacción actual** del Sales Deck y de la Brand Strategy |

### T4 · Gartner: change management en el top 3 de los CHRO → **VERIFICADO**
| Campo | Detalle |
|---|---|
| Redacción actual | «#3 prioridad CHRO: change management…» / «Change Management sube al top-3 de prioridades CHRO» |
| Fuente dice (extracto, EN) | «"Change Management & Workforce Resiliency" has advanced to the third most critical priority for 2026, up from fifth last year» |
| Publicación | Gartner C-level Communities (Evanta es la marca de comunidades de Gartner), *Top 3 Priorities for CHROs in 2026* (Leadership Perspective Survey) y la infografía *2026 CHRO Leadership Perspectives* |
| URLs | https://www.evanta.com/resources/chro/survey-report/top-3-priorities-for-chros-in-2026 · https://www.evanta.com/resources/chro/infographic/2026-chro-leadership-perspectives |
| Fecha de publicación | **[PENDIENTE]** confirmar el día exacto. Un extracto ubica la infografía en marzo de 2026 |
| Fecha de consulta | 2026-10-09 |
| Alcance | Global (miembros de la comunidad CHRO de Gartner) |
| Matices | (1) Las dos páginas de Gartner no coinciden en el **2.º lugar** (el reporte pone HR Tech & AI Strategy; la infografía, Culture), pero sí coinciden en que change management es el **3.º**. (2) El tamaño de muestra difiere: 750 en el reporte y «más de 400» en la infografía → **[PENDIENTE]**; no se cita n. (3) No confundir con el comunicado de Gartner HR del 2 oct 2025 sobre prioridades 2026, que tiene otro marco |
| Redacción aprobada | «Gestión del cambio y resiliencia de la fuerza laboral subió al 3.er lugar en las prioridades de los CHRO para 2026 (desde el 5.º).» Fuente: Gartner C-level Communities, 2026 |

### T5 · Gartner: 47% cita la cultura → **DIFIERE** (contexto)
| Campo | Detalle |
|---|---|
| Redacción actual | «47% cita la cultura como el obstáculo» / «47% frena por la cultura» |
| Fuente dice (extracto) | Dentro de la prioridad *Change Management & Workforce Resiliency*, retos principales: **«47% Company culture, 46% Competing priorities, 38% Employee adoption»** |
| URL y fechas | Las mismas del reporte de T4 |
| En qué difiere | El 47% **no** es «el obstáculo» en general. Es el **porcentaje que señala la cultura de la empresa como reto para la gestión del cambio**, y casi empata con «prioridades en competencia» (46%). «Frena por la cultura» no es redacción de la fuente |
| Riesgo de confusión | Existe **otro 47% de Gartner** (encuesta de julio de 2025 a 222 CHRO: 47% dice que su cultura sí impulsa el desempeño). Es otra cifra, con sentido casi opuesto. No verifiqué esa cifra en gartner.com → **[PENDIENTE]**, no usar |
| Verificación visual | El extracto del buscador muestra el texto cortado («Company cultur»). **QA-01 debe confirmarlo visualmente** antes del envío |
| Redacción aprobada (corregida) | «Entre los CHRO que priorizan la gestión del cambio, 47% señala la cultura de la empresa como su principal reto; 46%, las prioridades en competencia; 38%, la adopción de los empleados.» Fuente: Gartner C-level Communities, 2026 |

### T6 · Evidencia transversal adicional verificada (útil para todos los sectores)

| ID | Fuente dice | Fuente · fecha · URL | Alcance |
|---|---|---|---|
| T6.1 | Solo **16%** de las organizaciones ha rediseñado por completo roles, procesos y modelo operativo para integrar la IA; en **39%** TI lidera el rediseño del trabajo y en **12%** lo lidera RH; **51%** reporta desalineación de liderazgo o estratégica como barrera para escalar el valor de la IA | Deloitte, *Work Redesign Essential to Realize AI ROI*, 27 oct 2025, https://www.deloitte.com/us/en/about/press-room/work-design-essential-to-ai-roi.html (encuesta a C-suite de empresas con más de 5,000 empleados) | Global |
| T6.2 | **85%** de los líderes dice que es crítico construir la capacidad de adaptarse a la velocidad requerida, pero solo **7%** dice liderar en ello; solo **6%** avanza en diseñar las interacciones humano-IA; **65%** cree que su cultura debe cambiar de forma significativa por la IA | Deloitte, comunicado del 2026 Global Human Capital Trends, 4 mar 2026, https://www.deloitte.com/us/en/about/press-room/deloitte-report-winning-organizations-will-build-the-human-advantage.html (más de 9,000 líderes, 89 países, con Oxford Economics) | Global |
| T6.3 | **53%** de los líderes dice que la productividad debe aumentar, mientras **80%** de la fuerza laboral (empleados y líderes) dice que le falta tiempo o energía para su trabajo («capacity gap») | Microsoft, *2025 Work Trend Index: The Frontier Firm is born*, 23 abr 2025, https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born (31,000 trabajadores, 31 mercados, feb–mar 2025, Edelman DxI) | Global |
| T6.4 | En México, **56%** de las compañías todavía no identifica con claridad el valor comercial de la IA; solo **27%** tiene una estrategia de IA bien definida y alineada; **40%** no ha implementado proyectos de IA; **54%** destinará menos de 2% de sus ingresos a IA; **48%** necesita personal capacitado en IA generativa; 3 de cada 10 buscan implementar IA sin certeza de cómo hacerlo | KPMG México, *Panorama de la inteligencia artificial en México y Centroamérica 2025*, comunicado del 29 oct 2025, https://kpmg.com/mx/es/sala-de-prensa/comunicados-de-prensa/2025/10/cp-empresas-en-mexico-y-centroamerica-apuestan-por-la-ia.html (138 tomadores de decisiones de México y Centroamérica, ago–sep 2025) | **México** (muestra pequeña: n=138, incluye Centroamérica) |
| T6.5 | Predicción: **más de 40%** de los proyectos de IA agéntica se cancelará para finales de 2027 por costos crecientes, valor de negocio poco claro o controles de riesgo inadecuados | Gartner, comunicado del 25 jun 2025, https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027 | Global (predicción) |

**Lectura PRAXIA [PROPUESTA]:** la evidencia converge en que el cuello de botella no es la compra de tecnología sino el rediseño del trabajo, del liderazgo y del modelo operativo. En México la brecha empieza antes: la mayoría aún no traduce la IA en un caso de negocio (T6.4). Ese es el terreno del Adoption Gap.

---

## 2. Evidencia por sector

> Los dolores y los triggers son **interpretación PRAXIA [PROPUESTA]**: no son datos de la fuente. Los triggers describen señales **observables** que SAL-02 debe confirmar empresa por empresa, con URL y fecha, en las bases. El servicio sugerido usa la lista A–G de la especificación; los nombres de los servicios siguen abiertos (decisión D-P02).

### 01 · Manufactura e industria

**Datos externos**

| ID | Fuente dice | Fuente · fecha · URL | Alcance | Estado |
|---|---|---|---|---|
| M1 | Solo **4.8%** de las empresas manufactureras con más de 10 empleados usa IA (lugar 12 de 19 sectores), contra **8.0%** del promedio nacional y **19.1%** del promedio de la OCDE. Por subsector: equipo de cómputo y electrónicos 15.1%, derivados del petróleo 14.7% y equipo de transporte 13.4% | Centro México Digital (CMD), *La manufactura que produce más y paga mejor: lo que revela la adopción de inteligencia artificial en México*, con datos del **INEGI, Censos Económicos 2024** (33,316 unidades económicas), https://centromexico.digital/la-manufactura-que-produce-mas-y-paga-mejor-lo-que-revela-la-adopcion-de-inteligencia-artificial-en-mexico/ · Publicado a más tardar el 24 jun 2026 (fecha exacta [PENDIENTE]) | **México** | VERIFICADO |
| M2 | Cada 10 puntos porcentuales más de adopción de IA en una industria manufacturera se **asocian** con +18.8% de producción bruta por unidad económica y +5.4% de salario por trabajador | Mismo estudio CMD (M1) | **México** | VERIFICADO. Es una **asociación, no un efecto causal**; usarla solo con esa aclaración |
| M3 | En 2025 México recibió una IED récord de **40,871 mdd** (+10.8% anual). Las **nuevas inversiones** sumaron 7,378 mdd (+132.9%) | Secretaría de Economía, comunicado del 25 feb 2026, https://www.gob.mx/se/prensa/mexico-alcanza-cifra-historica-de-inversion-extranjera-directa-en-2025-40-871-millones-de-dolares-crecio-un-10-8-anual | **México** (no está desglosada por manufactura; cifras preliminares sujetas a revisión) | VERIFICADO |
| M4 | **95%** de los fabricantes ha invertido o planea invertir en IA/ML en los próximos 5 años; **41%** usa IA y automatización para cerrar la brecha de habilidades | Rockwell Automation, *10th State of Smart Manufacturing Report* (aprox. 1,560 respondentes de 17 países, encuesta de marzo de 2025), https://www.rockwellautomation.com/en-gb/company/news/press-releases/Ninety-Five-Percent-of-Manufacturers-Are-Investing-in-AI-to-Navigate-Uncertainty-and-Accelerate-Smart-Manufacturing.html · Fecha del comunicado [PENDIENTE] (2025) | Global | VERIFICADO (cifra); fecha [PENDIENTE] |
| M5 | Deloitte: para más de un tercio de los ejecutivos de manufactura, la principal preocupación es dar a los trabajadores las habilidades para aprovechar la manufactura inteligente; 80% planea destinar al menos 20% de sus presupuestos de mejora a iniciativas de manufactura inteligente | Deloitte 2026 Manufacturing Industry Outlook / 2025 Smart Manufacturing Survey (visto solo en fuente secundaria: manufacturingdigital.com) | Global / EE. UU. | **[PENDIENTE]**: no usar hasta verificarlo en deloitte.com |

Advertencia para MKT-02: M1 (uso real en México) y M4 (intención global de inversión) **miden universos distintos**. Pueden ir en la misma lámina como contraste narrativo («la conversación global es de inversión; en México el uso real es 4.8%»), pero nunca como una resta ni como una «brecha de X puntos».

**Dolores típicos (lenguaje PRAXIA) [PROPUESTA]**
1. **Adoption Gap en piso de planta:** se compran MES, sensores, visión artificial o mantenimiento predictivo, pero supervisores y operadores siguen decidiendo con la hoja de turno de siempre. El tablero existe; la rutina no cambió.
2. **Transformation Theater del nearshoring:** la planta nueva arranca en tiempo, pero el ramp-up de productividad y calidad se alarga porque el modelo operativo, los roles y los mandos medios se copiaron sin adaptarlos.
3. **Capacitación sin desempeño:** las horas de formación técnica crecen y la variabilidad de calidad, el OEE o la seguridad no se mueven. Nadie mide comportamiento ni impacto (Scorecard niveles 4–5).

**Triggers de compra observables (México/LatAm) [PROPUESTA]**
1. Anuncio de nueva planta, ampliación o relocalización (comunicados de la SE o de los gobiernos estatales, prensa de negocios), sobre todo en los subsectores de M1 que ya usan IA (electrónica, equipo de transporte).
2. Arranque o relanzamiento de un programa de digitalización o Industria 4.0 (ERP/MES, mantenimiento predictivo, calidad con IA) anunciado por la empresa o por su proveedor tecnológico.
3. Nombramiento de un nuevo director de planta, COO, VP de Operaciones o CHRO regional (LinkedIn, comunicados).

**Servicio PRAXIA más pertinente [PROPUESTA]:** **A Transformation Diagnostic** como entrada, con continuidad en **E Leadership & Capability Transformation** (mandos medios y supervisores como palanca de adopción en planta).

---

### 02 · Startups y scale-ups tecnológicas

**Datos externos**

| ID | Fuente dice | Fuente · fecha · URL | Alcance | Estado |
|---|---|---|---|---|
| S1 | En 2025 las startups con sede en México levantaron **21% más capital** que el año anterior y quedaron solo 14% por debajo de Brasil en financiamiento total. Las rondas early-stage sumaron USD 2.2 mil millones (52% del total regional) | LAVCA, *2026 LAVCA Trends in Tech*, https://www.lavca.org/research/2026-lavca-trends-in-tech/ · Fecha [PENDIENTE] (2026, sobre datos de 2025) | **México / LatAm** | VERIFICADO (cifra); fecha [PENDIENTE] |
| S2 | México captó **USD 440.8 millones** de capital de riesgo en el 2T 2026 y fue el mercado de LatAm con más financiamiento del trimestre (1T 2026: USD 461 millones). Datos de PitchBook | KPMG México, comunicado del 18 ago 2026, https://kpmg.com/mx/es/sala-de-prensa/comunicados-de-prensa/2026/08/cp-mexico-capta-usd-440-millones-en-capital-de-riesgo-y-reafirma-su-relevancia-en-america-latina.html | **México** | VERIFICADO |
| S3 | Capacity gap: **53%** de los líderes dice que la productividad debe aumentar y **80%** de la fuerza laboral dice que le falta tiempo o energía | Microsoft Work Trend Index 2025 (ver T6.3) | Global | VERIFICADO |
| S4 | Las startups mexicanas adoptan IA por encima del promedio nacional (41% contra 38%) y 29% de las que la usan llega a aplicaciones avanzadas (contra 7% nacional) | AWS / Strand Partners, *Unlocking AI Potential in Mexico 2025* (visto solo en prensa: Mexico Business News y otros) | México | **[PENDIENTE]**: no usar hasta tener el reporte original |
| S5 | «55% de las startups de LatAm que levantaron su primera ronda en el 1S 2026 son de IA» | Atribuido a LAVCA, *Startup Ecosystem Insights 2026* (solo en un blog secundario) | LatAm | **NO ENCONTRADO** en lavca.org. No usar |

**Dolores típicos (lenguaje PRAXIA) [PROPUESTA]**
1. **La ronda llega antes que la organización:** el capital permite duplicar la plantilla en 12–18 meses, pero los derechos de decisión, los rituales de gestión y los primeros managers siguen funcionando como cuando eran 40 personas. Adoption Gap del propio modelo operativo.
2. **Transformation Theater de cultura:** valores en la wiki y all-hands inspiradores, sin traducción a conductas, incentivos ni a cómo se toman decisiones en los equipos.
3. **Capacity gap con IA:** el equipo ya usa herramientas de IA por su cuenta, sin flujos rediseñados ni métricas, y el liderazgo no puede saber si la productividad realmente cambió (T6.3).

**Triggers de compra observables (México/LatAm) [PROPUESTA]**
1. Ronda Serie B o posterior, o ronda grande anunciada (KPMG Venture Pulse, LAVCA, prensa especializada).
2. Contratación de un primer CHRO/CPO, COO o VP de Engineering con experiencia de escala (LinkedIn).
3. Entrada a un nuevo país de LatAm o lanzamiento de una segunda línea de negocio; también despidos o reestructura después de crecer rápido.

**Servicio PRAXIA más pertinente [PROPUESTA]:** **D Organizational Effectiveness Advisory** (diseño organizacional, derechos de decisión y cadencia de gestión para escalar), con **A** como entrada corta.

---

### 03 · High tech, software y servicios TI

**Datos externos**

| ID | Fuente dice | Fuente · fecha · URL | Alcance | Estado |
|---|---|---|---|---|
| H1 | **84%** de los desarrolladores usa o planea usar herramientas de IA en su proceso (76% en 2024); **46%** desconfía de la precisión de sus resultados (31% el año previo) y solo **33%** confía; 3% confía «mucho» | Stack Overflow, *2025 Developer Survey*, sección IA: https://survey.stackoverflow.co/2025/ai · comunicado: https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/ · Fecha [PENDIENTE] (2025) | Global | VERIFICADO (cifras); fecha [PENDIENTE] |
| H2 | En **39%** de las organizaciones TI lidera el rediseño del trabajo con IA y solo en **12%** lo lidera RH; solo **16%** ha rediseñado por completo roles, procesos y modelo operativo | Deloitte, 27 oct 2025 (ver T6.1) | Global | VERIFICADO |
| H3 | Predicción: **más de 40%** de los proyectos de IA agéntica se cancelará para finales de 2027 | Gartner, 25 jun 2025 (ver T6.5) | Global (predicción) | VERIFICADO |
| H4 | Predicción de 2024: al menos 30% de los proyectos de IA generativa se abandonaría tras la prueba de concepto para finales de 2025 | Gartner, 29 jul 2024, https://www.gartner.com/en/newsroom/press-releases/2024-07-29-gartner-predicts-30-percent-of-generative-ai-projects-will-be-abandoned-after-proof-of-concept-by-end-of-2025 | Global | VERIFICADO, pero **no se recomienda**: el plazo ya venció y no se encontró la confirmación de Gartner (otra página de Gartner habla de «al menos 50%» sin fecha clara → [PENDIENTE]) |
| H5 | Ensayo controlado (16 desarrolladores, 246 tareas): con IA tardaron 19% más, aunque creían haber ido 20% más rápido | METR, 10 jul 2025, https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | Global | VERIFICADO, pero **no usar en decks**: el propio METR (24 feb 2026) dice que ya no refleja el efecto actual de la IA |

**Dolores típicos (lenguaje PRAXIA) [PROPUESTA]**
1. **AI investment is not AI adoption, en casa propia:** licencias de copilotos para toda la ingeniería, uso alto y confianza baja (H1). Nadie mide si cambiaron el lead time, la calidad del código o el retrabajo.
2. **Transformation Theater de pilotos:** decenas de pruebas de concepto de IA (también agéntica) sin dueño de negocio, sin criterio para salir del piloto y sin rediseño del flujo de trabajo (H2, H3).
3. **Modelo de servicio desfasado:** las firmas de servicios TI venden «IA» a sus clientes mientras su propio modelo de entrega, sus roles y su forma de cotizar (por hora o por FTE) siguen igual.

**Triggers de compra observables (México/LatAm) [PROPUESTA]**
1. Despliegue anunciado de copilotos o agentes de IA a toda la organización, o alianza con un hyperscaler o un proveedor de modelos (comunicados, eventos de partners).
2. Cambio de modelo de negocio (de staffing a servicios gestionados o productos) o integración después de una adquisición.
3. Nombramiento de un Chief AI Officer, un nuevo CTO o un líder de transformación (LinkedIn).

**Servicio PRAXIA más pertinente [PROPUESTA]:** **C AI Adoption Accelerator** (caso de uso priorizado, piloto por función y medición de uso e impacto), con **F Transformation Analytics** para la línea base de productividad.

---

### 04 · Servicios financieros y fintech

**Datos externos**

| ID | Fuente dice | Fuente · fecha · URL | Alcance | Estado |
|---|---|---|---|---|
| F1 | La mayor operación de capital de riesgo de México en el 4T 2025 fue Plata Card (USD 250 millones), y Klar estuvo entre las cinco empresas que concentraron cerca de 25% del capital de riesgo de LatAm en 2025 | KPMG, *Venture Pulse Q4 2025*, https://kpmg.com/us/en/articles/2026/venture-pulse-q4-2025.html · LAVCA, *2026 Trends in Tech* (S1) | México / LatAm | VERIFICADO. Es un **dato de trigger** (rondas grandes en fintech); **no** es dato de brecha y no va a la lámina de evidencia |
| F2 | Transversales aplicables a la banca y las fintech en México: T6.4 (KPMG México: 56% sin valor de negocio claro de la IA; 27% con estrategia definida) y T6.1/T6.2 (Deloitte: rediseño del trabajo) | Ver §1 | México / Global | VERIFICADO |
| F3 | Datos propios del sector (uso real de canales digitales frente a cuentas abiertas, adopción de IA en banca, productividad de centros de atención) | **[PENDIENTE]**. Fuentes primarias por verificar en la segunda ronda: CNBV/INEGI *ENIF 2024*; CMD, artículo sobre IA en el sistema financiero y de seguros (https://centromexico.digital/como-puede-la-inteligencia-artificial-ampliar-la-inclusion-y-la-confianza-en-el-sistema-financiero-y-de-seguros/; sin cifras extraídas); KPMG *Pulse of Fintech*; Finnovista *Fintech Radar México* | México | **[PENDIENTE]**: no se extrajo ninguna cifra |

**Dolores típicos (lenguaje PRAXIA) [PROPUESTA]**
1. **Adoption Gap del cliente y del empleado:** apps y canales digitales lanzados, con sucursales y centros de atención que siguen absorbiendo la operación. La adopción interna (ejecutivos, cobranza, riesgo) va detrás de la externa.
2. **Transformation Theater regulado:** pilotos de IA (scoring, atención, cumplimiento) que no salen de la prueba porque riesgo, cumplimiento y negocio no comparten derechos de decisión ni criterios de evidencia.
3. **Fintech que crece más rápido que su sistema de gestión:** después de una ronda grande, la cultura de «startup» choca con las exigencias de un regulado (procesos, controles, liderazgo intermedio).

**Triggers de compra observables (México/LatAm) [PROPUESTA]**
1. Ronda grande o crecimiento de cartera anunciado (F1); obtención o trámite de una licencia bancaria o regulatoria (comunicados de la empresa o de la CNBV).
2. Programa de transformación digital o de IA anunciado (core bancario, IA en atención o en crédito), o alianza con un hyperscaler.
3. Fusión o integración, o nuevo director general, CHRO o COO.

**Servicio PRAXIA más pertinente [PROPUESTA]:** **C AI Adoption Accelerator** para casos de uso con dueño y medición, con **F Transformation Analytics** porque un sector regulado exige evidencia auditable del uso y del impacto.

---

### 05 · Retail, consumo y e-commerce

**Datos externos**

| ID | Fuente dice | Fuente · fecha · URL | Alcance | Estado |
|---|---|---|---|---|
| R1 | Predicción (según el título del comunicado): «**50%** de las organizaciones abandonará sus planes de reducir la fuerza laboral de servicio al cliente debido a la IA» | Gartner, comunicado del 10 jun 2025, https://www.gartner.com/en/newsroom/press-releases/2025-06-10-gartner-predicts-50-percent-of-organizations-will-abandon-plans-to-reduce-customer-service-workforce-due-to-ai | Global (predicción) | VERIFICADO (título). El horizonte de tiempo y el cuerpo del texto quedan [PENDIENTE] de lectura visual |
| R2 | Predicción (según el título): «**60%** de las marcas usará IA agéntica para ofrecer interacciones uno a uno simplificadas para 2028» | Gartner, comunicado del 15 ene 2026, https://www.gartner.com/en/newsroom/press-releases/2026-01-15-gartner-predicts-60-percent-of-brands-will-use-agentic-ai-to-deliver-streamlined-one-to-one-interactions-by-2028 | Global (predicción) | VERIFICADO (título) |
| R3 | Transversal aplicable: T6.4 (KPMG México) y T6.3 (capacity gap) | Ver §1 | México / Global | VERIFICADO |
| R4 | Proporción de establecimientos que venden por internet (3.0% en 2018 → 5.5% en 2023) y uso de IA o robótica avanzada (2.1% de las unidades económicas) | Atribuido al INEGI, Censos Económicos 2024 (visto solo en un análisis secundario, «Apuntes de Datos»). Fuente primaria por revisar: https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2025/ce/CE2024_def.pdf, sección VIII | México | **[PENDIENTE]**: no usar hasta leer el PDF del INEGI |
| R5 | Datos propios del sector (participación del comercio electrónico en las ventas minoristas, adopción de herramientas en tienda, rotación de personal en tienda) | **[PENDIENTE]**. Fuentes primarias por verificar: AMVO, *Estudio de Venta Online 2026*; INEGI, EMEC; ANTAD; NRF/Deloitte Retail Outlook | México / Global | **[PENDIENTE]** |

**Dolores típicos (lenguaje PRAXIA) [PROPUESTA]**
1. **Omnicanal en el deck, canal único en la tienda:** se lanzan app, clic y recoge, CRM y pricing dinámico, pero el gerente de tienda opera con los incentivos y los rituales de siempre. Adoption Gap en el último metro.
2. **Transformation Theater de IA en atención:** chatbots y agentes que se lanzan para reducir costo y que acaban con escalamientos, retrabajo y una experiencia peor. La plantilla de servicio no se rediseñó (R1).
3. **Rotación que borra la capacidad:** con la alta rotación de primera línea, cada despliegue tecnológico se «re-capacita» sin cesar y nunca llega al nivel de comportamiento.

**Triggers de compra observables (México/LatAm) [PROPUESTA]**
1. Lanzamiento o relanzamiento de un programa omnicanal, de e-commerce, de lealtad o de CRM (comunicados, reportes a la BMV en el caso de las emisoras).
2. Despliegue de IA en atención al cliente, pricing o surtido anunciado con un proveedor.
3. Plan de aperturas o de remodelación de formatos, cambio de CEO o COO, o integración después de una adquisición.

**Servicio PRAXIA más pertinente [PROPUESTA]:** **B Adoption Architecture** (diseño de la adopción de herramientas y procesos en la red de tiendas y en atención), con **E** para los gerentes de tienda.

---

### 06 · Logística y cadena de suministro

**Datos externos**

| ID | Fuente dice | Fuente · fecha · URL | Alcance | Estado |
|---|---|---|---|---|
| L1 | IED récord de 40,871 mdd en 2025; nuevas inversiones +132.9%. Es el contexto de demanda de nearshoring para la logística | Secretaría de Economía, 25 feb 2026 (ver M3) | **México** | VERIFICADO (contexto, no es dato de brecha) |
| L2 | Transversales aplicables: T6.4 (KPMG México), T6.5 (Gartner, cancelación de proyectos agénticos) y T6.1 (Deloitte, rediseño del trabajo) | Ver §1 | México / Global | VERIFICADO |
| L3 | Datos propios del sector (adopción de WMS/TMS e IA en la cadena de suministro, escasez de operadores, desempeño logístico de México) | **[PENDIENTE]**. Fuentes primarias por verificar: MHI, *Annual Industry Report 2025/2026*; Gartner Supply Chain (comunicados 2025–2026); Banco Mundial, *Logistics Performance Index 2023*; IRU, *Driver Shortage Report*; CANACAR y AMTI | México / Global | **[PENDIENTE]** |

**Dolores típicos (lenguaje PRAXIA) [PROPUESTA]**
1. **Adoption Gap del sistema:** WMS, TMS o torre de control implementados, mientras supervisores y despachadores siguen trabajando en Excel y por WhatsApp. El sistema registra, pero no gobierna la operación.
2. **Transformation Theater del nearshoring:** capacidad nueva (naves, rutas, cruces) más rápida que la capacidad de gestión. Los mandos medios se promueven desde la operación sin un sistema de liderazgo.
3. **Capacidad que no llega al turno:** alta rotación de operadores y almacenistas, con capacitación medida en asistencia y no en errores de surtido, seguridad o cumplimiento de entregas.

**Triggers de compra observables (México/LatAm) [PROPUESTA]**
1. Apertura de un centro de distribución, parque logístico o ruta transfronteriza (comunicados, prensa especializada).
2. Implementación anunciada de WMS, TMS, automatización de almacén o IA de planeación de demanda.
3. Contrato grande con un cliente de nearshoring, fusión, adquisición, o nuevo COO o director de Operaciones.

**Servicio PRAXIA más pertinente [PROPUESTA]:** **B Adoption Architecture** (adopción del sistema en la operación diaria), con **E** para supervisores de turno.

---

## 3. Cifras descartadas o en espera (no usar)

| Cifra | Motivo |
|---|---|
| Deloitte «1.6× más probable no ver retorno» (redacción actual) | DIFIERE: la fuente habla de retornos que superen las expectativas. Usar T3 corregida |
| Gartner «47% frena por la cultura» (redacción actual) | DIFIERE: es el principal reto dentro de la gestión del cambio. Usar T5 corregida |
| Gartner 47% «la cultura impulsa el desempeño» (jul 2025, n=222) | Otra cifra, no verificada en gartner.com |
| LAVCA «55% de las startups con primera ronda en el 1S 2026 son de IA» | NO ENCONTRADO en la fuente original |
| AWS/Strand México (38% de adopción, 7% avanzada, startups 41%/29%, 55% sin talento) | Solo prensa; reporte original no consultado → [PENDIENTE] |
| ManpowerGroup, escasez de talento en México (68–70%) | Solo prensa; ediciones y años confusos → [PENDIENTE] |
| Deloitte Manufacturing Outlook 2026 (más de un tercio, 80%) | Solo fuente secundaria → [PENDIENTE] |
| Deloitte/Manufacturing Institute (1.9 millones de puestos sin cubrir) | Solo EE. UU.; no verificado → no usar |
| INEGI CE 2024 (2.1% IA o robótica; menos de 3% tecnologías avanzadas; ventas por internet 5.5%) | Solo análisis secundario → [PENDIENTE] (leer CE2024_def.pdf) |
| Microsoft WTI «24% despliega IA en toda la organización / 12% en piloto» | Solo prensa secundaria → [PENDIENTE] |
| Gartner «30% de GenAI abandonado tras la PoC para 2025» | Predicción vencida y sin confirmación → no recomendada |
| METR «19% más lentos» | El propio METR la declara superada (feb 2026) → no usar |
| Maquetas del Flagship (Transformation Debt 66%, AGI 68, N=1,240, etc.) | Ilustrativas según la skill §9.1; no son evidencia |

---

## 4. Cifras aprobadas para decks (solo VERIFICADAS, copiar sin reinterpretar)

> Condición de liberación: antes del **primer envío externo**, QA-01 o el Founder abre cada URL y confirma la cita visualmente (ver §0). Formato de crédito en la lámina: «Fuente: [editor], [año]». La URL va en las notas del orador o en la lámina de referencias.

| # | Texto para la lámina (ES) | Crédito en la lámina | Fecha de publicación | URL | Alcance | Sectores sugeridos |
|---|---|---|---|---|---|---|
| A1 | Solo ~5% de las organizaciones obtiene ganancias financieras sustanciales de la IA. | BCG, 2026 | 4 feb 2026 | https://www.bcg.com/publications/2026/ai-transformation-is-a-workforce-transformation | Global | Todos |
| A2 | En la experiencia de BCG, ~70% del valor de la IA depende de repensar el componente humano; 20%, de la tecnología; 10%, de los algoritmos. | BCG, 2026 | 4 feb 2026 | Igual que A1 | Global | Todos |
| A3 | Las organizaciones con un enfoque de IA centrado en la tecnología (59%) tienen 1.6 veces más probabilidad de no lograr retornos que superen sus expectativas que las que ponen a las personas al centro. | Deloitte, 2026 | 4 mar 2026 (dato de oct 2025, n=100 C-suite) | https://www.deloitte.com/us/en/insights/topics/talent/human-capital-trends.html | Global | Todos |
| A4 | Gestión del cambio y resiliencia de la fuerza laboral subió al 3.er lugar en las prioridades de los CHRO para 2026 (desde el 5.º). | Gartner, 2026 | 2026 (día [PENDIENTE]) | https://www.evanta.com/resources/chro/survey-report/top-3-priorities-for-chros-in-2026 | Global | Todos (audiencia CHRO) |
| A5 | Entre los CHRO que priorizan la gestión del cambio, 47% señala la cultura de la empresa como su principal reto. | Gartner, 2026 | 2026 (día [PENDIENTE]) | Igual que A4 | Global | Todos (audiencia CHRO) |
| A6 | Solo 16% de las organizaciones ha rediseñado por completo roles, procesos y modelo operativo para integrar la IA. | Deloitte, 2025 | 27 oct 2025 | https://www.deloitte.com/us/en/about/press-room/work-design-essential-to-ai-roi.html | Global | Todos; 03 |
| A7 | El rediseño del trabajo con IA lo lidera TI en 39% de las organizaciones y RH solo en 12%. | Deloitte, 2025 | 27 oct 2025 | Igual que A6 | Global | 03, 04 |
| A8 | 85% de los líderes considera crítico adaptarse a la velocidad requerida; solo 7% dice liderar en ello. | Deloitte, 2026 | 4 mar 2026 | https://www.deloitte.com/us/en/about/press-room/deloitte-report-winning-organizations-will-build-the-human-advantage.html | Global | Todos |
| A9 | 65% de las organizaciones cree que su cultura debe cambiar significativamente por la IA. | Deloitte, 2026 | 4 mar 2026 | Igual que A8 | Global | Todos |
| A10 | 53% de los líderes dice que la productividad debe aumentar; 80% de la fuerza laboral dice que le falta tiempo o energía. | Microsoft Work Trend Index, 2025 | 23 abr 2025 | https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born | Global | 02, 03, 05 |
| A11 | En México, 56% de las empresas aún no identifica con claridad el valor de negocio de la IA, y solo 27% tiene una estrategia de IA bien definida. | KPMG México, 2025 | 29 oct 2025 | https://kpmg.com/mx/es/sala-de-prensa/comunicados-de-prensa/2025/10/cp-empresas-en-mexico-y-centroamerica-apuestan-por-la-ia.html | **México** (n=138 MX y CA) | Todos |
| A12 | En México, 40% de las empresas no ha implementado proyectos de IA y 54% destinará menos de 2% de sus ingresos a IA. | KPMG México, 2025 | 29 oct 2025 | Igual que A11 | **México** | Todos |
| A13 | Solo 4.8% de las empresas manufactureras mexicanas (más de 10 empleados) usa IA, contra 8.0% del promedio nacional y 19.1% del promedio de la OCDE. | CMD con datos del INEGI (Censos Económicos 2024) | 2026 (a más tardar 24 jun; día [PENDIENTE]) | https://centromexico.digital/la-manufactura-que-produce-mas-y-paga-mejor-lo-que-revela-la-adopcion-de-inteligencia-artificial-en-mexico/ | **México** | 01 |
| A14 | En manufactura, cada 10 puntos más de adopción de IA se asocian con 18.8% más de producción bruta por empresa (asociación, no causalidad). | CMD con datos del INEGI | Igual que A13 | Igual que A13 | **México** | 01 |
| A15 | México recibió una IED récord de 40,871 mdd en 2025; las nuevas inversiones crecieron 132.9%. | Secretaría de Economía, 2026 | 25 feb 2026 | https://www.gob.mx/se/prensa/mexico-alcanza-cifra-historica-de-inversion-extranjera-directa-en-2025-40-871-millones-de-dolares-crecio-un-10-8-anual | **México** | 01, 06 |
| A16 | 95% de los fabricantes ha invertido o planea invertir en IA/ML en los próximos cinco años. | Rockwell Automation, 2025 | 2025 (día [PENDIENTE]) | https://www.rockwellautomation.com/en-gb/company/news/press-releases/Ninety-Five-Percent-of-Manufacturers-Are-Investing-in-AI-to-Navigate-Uncertainty-and-Accelerate-Smart-Manufacturing.html | Global | 01 |
| A17 | 84% de los desarrolladores usa o planea usar IA; 46% desconfía de la precisión de sus resultados. | Stack Overflow Developer Survey, 2025 | 2025 (día [PENDIENTE]) | https://survey.stackoverflow.co/2025/ai | Global | 03 |
| A18 | Gartner prevé que más de 40% de los proyectos de IA agéntica se cancelará para finales de 2027. | Gartner, 2025 (predicción) | 25 jun 2025 | https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027 | Global | 03, 04, 06 |
| A19 | Las startups con sede en México levantaron 21% más capital en 2025 que en 2024. | LAVCA, 2026 | 2026 (día [PENDIENTE]) | https://www.lavca.org/research/2026-lavca-trends-in-tech/ | **México** | 02 |
| A20 | México captó USD 440.8 millones de capital de riesgo en el 2T 2026, el mayor monto de LatAm en el trimestre. | KPMG México, 2026 | 18 ago 2026 | https://kpmg.com/mx/es/sala-de-prensa/comunicados-de-prensa/2026/08/cp-mexico-capta-usd-440-millones-en-capital-de-riesgo-y-reafirma-su-relevancia-en-america-latina.html | **México** | 02, 04 |
| A21 | Gartner prevé que 50% de las organizaciones abandonará sus planes de reducir la fuerza laboral de servicio al cliente debido a la IA. | Gartner, 2025 (predicción) | 10 jun 2025 | https://www.gartner.com/en/newsroom/press-releases/2025-06-10-gartner-predicts-50-percent-of-organizations-will-abandon-plans-to-reduce-customer-service-workforce-due-to-ai | Global | 04, 05 |

**Reglas de uso para MKT-02:**
- A3 y A5 **sustituyen** la redacción de los decks actuales (Sales Deck, lámina 03; Brand Strategy, lámina 7).
- A1 y A2 no se combinan en una sola cifra ni en una sola frase causal.
- A13 (uso real en México) y A16 (intención global) no se restan ni se presentan como una «brecha de X puntos».
- A14 siempre va con la nota «asociación, no causalidad».
- A18 y A21 llevan siempre la palabra «prevé»: son predicciones.
- Los sectores 04, 05 y 06 no tienen todavía una cifra propia del sector verificada. Su lámina «costo de la brecha» usa A3, A6, A11 y A12 hasta la segunda ronda de investigación.

---

## Decisión requerida del Founder

**Tema:** cómo completar la evidencia de los sectores 04 Servicios financieros, 05 Retail y 06 Logística, que hoy solo tienen evidencia transversal porque se agotó el presupuesto de búsqueda web del turno.

| Opción | Qué implica | Riesgo | Esfuerzo |
|---|---|---|---|
| **A** | Segunda ronda de RES-01 dedicada a 04–06, con las fuentes primarias ya listadas (ENIF 2024, AMVO, INEGI CE 2024, MHI, LPI) y la verificación visual de A1–A21. Requiere una sesión nueva o subir `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` | Retrasa los decks 04–06 alrededor de un día | Bajo (unas 40 búsquedas) |
| **B** | Construir los seis decks ya con la §4. Los decks 04–06 usan solo cifras transversales (A3, A6, A11, A12) y se actualizan después | Decks 04–06 menos específicos y con menor tracción con el comprador del sector | Nulo ahora |
| **C** | Priorizar 01–03 (con evidencia sectorial) para la primera ola de prospección y posponer 04–06 | Se pierde cobertura sectorial en la primera ola | Nulo |

**Recomendación [PROPUESTA]:** **B + A en paralelo**. DSN-01 y MKT-02 avanzan con la §4 y RES-01 completa 04–06 sin bloquearlos. Ningún deck sale a un prospecto antes de la verificación visual de la §4 (que de todos modos exige D-P07).
**Costo:** sin gasto externo; solo tiempo de agentes.
**Fecha límite sugerida para decidir:** 2026-10-13, antes de que MKT-02 cierre el contenido de los decks.

---

## Revisión de calidad (estándar común, §7) · autoevaluación de RES-01
- Problema económico: cada sector parte de inversión o estrategia sin captura de valor. ✔
- Datos inventados: ninguno. Las cifras dudosas quedan en [PENDIENTE] o en la §3. ✔
- PROPUESTA no presentada como hecho: dolores, triggers y servicios van etiquetados [PROPUESTA]. ✔
- Voz y palabras prohibidas: revisadas. ✔ · Un solo idioma (español; las citas de la fuente van en inglés como evidencia). ✔
- Sin material GASM ni de empleadores. ✔
- No aplica: paleta, render ni notas legales (documento interno en Markdown).
- Pendiente de QA-01: la verificación visual de las URL de la §4 (limitación del entorno, §0).
