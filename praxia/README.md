# PRAXIA — Human & AI Transformation Advisory

> **Turn strategy into adoption.**

Espacio de trabajo para construir PRAXIA como empresa: primero el **equipo** (agentes por función) y después los **entregables por equipo**. Es un proyecto independiente de GASM / Academia GASM, que vive en el resto de este repositorio.

## Estructura

```
praxia/
├── CLAUDE.md              reglas de trabajo para todo lo que se haga en praxia/
├── README.md              este archivo
└── 00-fuentes/            documentos fuente que entregó el usuario (solo lectura)
    ├── paquete-agentes/   especificación del equipo de 28 agentes (agents/, knowledge/, governance/, templates/, workflows/)
    ├── PRAXIA_Skill_Business_Brand_OS.md   skill v1.0 (sistema operativo de la firma)
    ├── originales/        archivos tal como se recibieron
    ├── texto/             extracción a texto/Markdown para que los agentes puedan leerlos
    └── imagenes/          tablero de exploración de marca y símbolo
```

Pendiente de crear cuando terminen de llegar las fuentes: `01-equipo/` (diseño del equipo y agentes) y una carpeta por equipo de entrega.

## Inventario de fuentes

### Lote 1 — recibido el 9 oct 2026

| # | Archivo | Qué es | Vigencia según la skill (§0.1 y §14.7) |
|---|---|---|---|
| 1 | `PRAXIA_Skill_Business_Brand_OS.md` | Skill v1.0: marca, oferta, pricing, playbooks, equipos, delivery, sistema visual y QA | **Rectora**: manda sobre todo lo demás, salvo una instrucción explícita del usuario |
| 2 | `originales/PRAXIA_Master_Business_Brand_System_2026.docx` (texto: `texto/…md`) | Master Business, Brand & Operating System v1.0, 18 secciones | **Vigente** (fuente oficial) |
| 3 | `originales/Praxia_Brand_Strategy.pptx` (texto: `texto/…md`) | Brand Strategy, 57 láminas: mercado, categoría, núcleo, naming, voz, rutas creativas | **Dirección trabajada**: narrativa sí; paleta v2 (Fraunces/#4231D4) **reemplazada** |
| 4 | `originales/Praxia_Sales_Deck.pdf` (texto: `texto/…txt`) | Sales Deck, 16 láminas | **Dirección trabajada**: estructura y mensajes sí; paleta v3 (#5A4BFF/#FF6A70) **reemplazada**; las cifras de BCG, Deloitte y Gartner hay que verificarlas contra la fuente original antes de reutilizarlas |
| 5 | `imagenes/brand-exploration-board-01.jpg` | Brand Exploration Board 01: tres rutas, gana la Ruta 2 «Evolución humana» (The Axis) | **Dirección trabajada**: el concepto del símbolo está vigente; los HEX del tablero (#5A4BFF, #FF6A70) son de la paleta v3 |
| 6 | `imagenes/simbolo-the-axis.jpg` | Render del símbolo The Axis | Referencia visual; **no es el logo oficial** (los PNG oficiales todavía no se reciben) |

Nota: llegaron dos copias del `.docx` Master. Eran idénticas byte a byte (mismo MD5), así que solo se guardó una.

### Lote 2 — recibido el 9 oct 2026 · paquete de agentes (`00-fuentes/paquete-agentes/`)

| # | Archivo | Qué es |
|---|---|---|
| 7 | `README.md` | *PRAXIA AI Organization — Complete Agent Team v1.0*: 28 roles en 17 funciones, directorio con línea de reporte, scorecard y brechas antes de operar |
| 8 | `SYSTEM_ORCHESTRATOR.md` | Orquestador (CEO-01 como mesa de entrada): reglas de ruteo y contrato de delegación |
| 9 | `agents/CEO-01_…md` | Chief of Staff & CEO Strategist (le reporta al Founder) |
| 10 | `agents/COM-01_…md` | Internal Communications & Knowledge Lead (le reporta a OPS-01) |
| 11 | `agents/CX-01_…md` | Client Success & Customer Support Lead (le reporta a DEL-01) |

Estado del paquete: [PROPUESTA] (`status: proposed-operating-design`). Los 3 perfiles comparten plantilla: misión, contexto común, alcance, métodos, reporte, entradas, salidas en formato de handoff, calidad y autoridad.

### Lote 3 — recibido el 9 oct 2026 · conocimiento y gobierno

| # | Archivo | Qué es |
|---|---|---|
| 12 | `knowledge/PRAXIA_MASTER_CONTEXT.md` | Master context en Markdown (469 líneas): el mismo contenido del `.docx` Master, en formato de skill `praxia-master` |
| 13 | `knowledge/BRAND_RULES.md` | Reglas de marca condensadas (Brand Guidelines v1.0) |
| 14 | `knowledge/BUSINESS_AND_CUSTOMERS.md` | Compradores, problemas y tesis comercial |
| 15 | `knowledge/SERVICE_PORTFOLIO.md` | Catálogo de 7 servicios y 5 ofertas con precios exploratorios |
| 16 | `governance/AGENT_CONSTITUTION.md` | Constitución de 10 reglas: el fundador responde por todo, hay puertas de aprobación humana y QA puede bloquear (llegó dos veces; las copias eran idénticas) |
| 17 | `governance/RACI.md` | Derechos de decisión: 9 decisiones, todas con el Founder como responsable final (A) |

### Lote 4 — recibido el 9 oct 2026 · plantillas

| # | Archivo | Qué es |
|---|---|---|
| 18 | `templates/AGENT_TASK.json` | Plantilla de encargo a un agente (JSON válido) |
| 19 | `templates/UNIVERSAL_BRIEF.md` | Brief universal de encargo |
| 20 | `templates/CLIENT_DISCOVERY.md` | Guía de discovery ejecutivo |
| 21 | `templates/EXECUTIVE_ONE_PAGER.md` | One-pager ejecutivo que abre con la decisión requerida |

### Lotes 5 y 6 — recibidos el 9 oct 2026 · flujos de trabajo (`workflows/`)

Son 7 SOP en estado [PROPUESTA] («proposed SOP; configure live permissions before use»). Cada etapa entrega su handoff en JSON y tiene un dueño nombrado; si una puerta falla, el trabajo regresa al dueño anterior.

| # | Archivo | Flujo |
|---|---|---|
| 22 | `01_LEAD_TO_CONTRACT.md` | Del prospecto al contrato |
| 23 | `02_CLIENT_DELIVERY.md` | Entrega al cliente: DEL-01 → RES-01 → DAT-01 → DEL-02 → DEL-03 → COM-01 → CX-01 → DAT-01 → QA-01 → aprobación del Founder y el cliente |
| 24 | `03_CONTENT_TO_DEMAND.md` | Del contenido a la demanda |
| 25 | `04_PRODUCT_BUILD.md` | Construcción de producto |
| 26 | `05_CUSTOMER_SUPPORT.md` | Soporte al cliente |
| 27 | `06_RESEARCH_TO_IP.md` | De la investigación a la PI |
| 28 | `07_INTERNAL_OPERATIONS.md` | Operación interna |

### Lote 7 — recibido el 9 oct 2026 · configuración (`config/`)

| # | Archivo | Qué es |
|---|---|---|
| 29 | `org_chart.json` | Organigrama de los agentes en formato máquina (JSON válido) |
| 30 | `handoff.schema.json` | Esquema del handoff universal entre agentes (JSON válido) |

### Lote 8 en adelante — perfiles de agente (`agents/`)

Los perfiles se van guardando conforme llegan. Los reenvíos de CEO-01, COM-01 y CX-01 eran idénticos a las copias que ya estaban guardadas. El conteo actualizado está en «Faltan del paquete de agentes».

### Inconsistencias detectadas (se resuelven al diseñar el equipo)

- **Nombres de servicios:** `SERVICE_PORTFOLIO.md` usa nombres distintos de los de la skill y el Master. Por ejemplo, «Strategy Execution & Adoption» frente a «Strategy-to-Adoption Advisory», «Leadership & Organizational Effectiveness» frente a «Leadership & Execution System» y «Operating Model & Change Transformation» frente a «Organizational Design & Operating Model». Por precedencia (skill §0.1) se propone usar los nombres de la skill y el Master.
- **Método de entrega:** el portafolio usa 5 pasos (Discover → Diagnose → Design → Activate → Measure & Scale) y la skill usa 4 etapas de marca (SENSE · ALIGN · ADOPT · SUSTAIN). Son compatibles: la skill §6.5 mapea los 5 pasos dentro de las 4 etapas.

### Faltan del paquete de agentes

- **1 perfiles de agente:** missing:

### Otras fuentes por recibir (según la skill)

- Logos oficiales: `praxialogoHdark.png`, `praxialogoHlight.png`, `praxiastackdark.png`, `praxiamonoblack.png`, `praxiamonowhite.png`, `praxiasymbol.png`
- *PRAXIA Brand Guidelines v1.0* (PDF de 18 pp), que es fuente vigente
- Flagship Deck, Deck Estratégico Detallado (72 láminas) y sistema ABM, si existen
