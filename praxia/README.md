# PRAXIA — Human & AI Transformation Advisory

> **Turn strategy into adoption.**

Espacio de trabajo para construir PRAXIA como empresa: primero el **equipo** (agentes por función) y después los **entregables por equipo**. Es un proyecto independiente de GASM / Academia GASM, que vive en el resto de este repositorio.

## Estructura

```
praxia/
├── CLAUDE.md              reglas de trabajo para todo lo que se haga en praxia/
├── README.md              este archivo
└── 00-fuentes/            documentos fuente que entregó el usuario (solo lectura)
    ├── paquete-agentes/   especificación del equipo de 28 agentes (README, orquestador, agents/)
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

### Faltan del paquete de agentes (el README del paquete los menciona)

- **25 perfiles de agente:** STR-01, RES-01, RES-02, SAL-01, SAL-02, SAL-03, MKT-01, MKT-02, MKT-03, PR-01, DEL-01, DEL-02, DEL-03, DEV-01, DEV-02, DEV-03, UX-01, UI-01, DSN-01, OPS-01, FIN-01, HR-01, DAT-01, RISK-01, QA-01
- `knowledge/PRAXIA_MASTER_CONTEXT.md` y `knowledge/BRAND_RULES.md`
- `governance/AGENT_CONSTITUTION.md` y `governance/RACI.md`
- `config/org_chart.json` y `config/handoff.schema.json`
- `templates/AGENT_TASK.json` y `workflows/*.md`

### Otras fuentes por recibir (según la skill)

- Logos oficiales: `praxialogoHdark.png`, `praxialogoHlight.png`, `praxiastackdark.png`, `praxiamonoblack.png`, `praxiamonowhite.png`, `praxiasymbol.png`
- *PRAXIA Brand Guidelines v1.0* (PDF de 18 pp), que es fuente vigente
- Flagship Deck, Deck Estratégico Detallado (72 láminas) y sistema ABM, si existen
