# Academia GASM — Training & Development Department for a Mining and Steel Company in Mexico

This repository holds the full design of a **corporate Training & Development (T&D) department**: research, structure, policy, processes, programs, roadmap, budget, KPIs, an executive proposal and ready-to-use templates. It is designed for **Grupo Acero Sierra Madre (GASM)**, a *fictional* integrated iron-ore mining and steel company with 8,500 employees and about 4,000 contractors, operating in Colima, Coahuila and Nuevo León.

The model follows the Mexican legal framework (Federal Labor Law, Chapter III Bis; STPS formats DC-2/3/4/5 and SIRCE; NOM-STPS safety standards such as NOM-023 for mines; CONOCER competency standards; REPSE rules for contractors) and industry practice (ISO 10015, ISO 45001, ICMM Critical Control Management, Kirkpatrick/Phillips).

## Executive summary

| | |
|---|---|
| **Problem** | 2 fatalities in 3 years, 23% of critical tasks without evidence of competence, fragmented training driven by compliance, lapsed joint training commissions, retirements and nearshoring pulling away talent |
| **Solution** | *Academia GASM*: a hub-and-spoke department (corporate CoE + site teams) with 7 schools/academies, organized on 4 pillars: **Cero Fatalidades certified competence · technical excellence · leaders and pipeline · compliance and impact** |
| **Structure** | 64 people (including 24 full-time instructors) + 150 certified part-time SME instructors |
| **Investment** | Opex MXN 139 M/year at steady state (MXN 61 M incremental) · Capex MXN 134 M over 3 years |
| **Return** | MXN 122 M/year in quantified benefits · steady-state ROI ≈ 64% · payback ≈ 4.1 years |
| **Year-3 targets** | Zero fatalities · LTIFR −30% · 100% of critical tasks performed by certified people · 56 h training per employee · 60% of leaders promoted from within |

## Contents

| # | Document | What you find |
|---|---|---|
| 01 | [Company profile & As-Is diagnosis](01-company-profile/company-profile.md) | Operations, workforce, safety baseline, 10 diagnostic findings |
| 02 | [Regulatory framework (Mexico)](02-research/regulatory-framework-mexico.md) | LFT, STPS formats, NOMs by operation, CONOCER, REPSE, compliance calendar |
| 02 | [Industry benchmarks & trends](02-research/industry-benchmark-and-trends.md) | Sector context, benchmarks, best practices, lessons learned, partners |
| 03 | [Department design](03-department-design/department-design.md) | Mission, operating model, org chart, roles, RACI, governance |
| 03 | [Training & Development Policy](03-department-design/training-and-development-policy.md) | Corporate policy POL-RH-TD-001 |
| 04 | [Process manual](04-processes/process-manual.md) | 12 processes: competencies, needs analysis (DNC), DC-2 plan, design, delivery, evaluation/ROI, certification, onboarding and contractors, STPS records, knowledge capture, CMCAP, vendors and instructors |
| 05 | [Program portfolio](05-programs/program-portfolio.md) | Safety, Mining, Steelmaking, Maintenance, Leadership, Digital/Green Steel, Talent pipeline |
| 06 | [Implementation roadmap](06-implementation/implementation-roadmap.md) | 36-month Gantt chart, 90-day plan, change management, risks |
| 07 | [Budget & business case](07-business-case/budget-and-business-case.md) | Opex, capex, benefits, cash flow, ROI, sensitivity |
| 08 | [KPI scorecard](08-kpis/kpi-scorecard.md) | 30 KPIs with baselines and targets, dashboard design |
| 09 | [Executive proposal](09-proposal/executive-proposal.md) | Board-ready proposal and the decisions requested |

### Templates (`templates/`)
| Template | Process |
|---|---|
| [Training needs questionnaire (DNC)](templates/dnc-training-needs-questionnaire.md) | TD-P02 |
| [Annual training plan (CSV)](templates/annual-training-plan.csv) | TD-P03 |
| [Competency matrix (CSV)](templates/competency-matrix.csv) | TD-P01 |
| [Level 1 reaction evaluation](templates/evaluation-level1-reaction.md) | TD-P06 |
| [Level 3 behavior follow-up](templates/evaluation-level3-behavior.md) | TD-P06 |
| [Critical-task certification checklist (LOTO example)](templates/critical-task-certification-checklist.md) | TD-P07 |
| [Contractor induction checklist](templates/contractor-induction-checklist.md) | TD-P08 |

## Equipo del Director (subagentes de Claude Code)

El Director (el usuario) cuenta con un equipo de 10 subagentes en `.claude/agents/`: 4 expertos (Seguridad y Salud, Liderazgo y Cambio, Documentación y Mejora, Relaciones Laborales), 2 gerentes (personal sindicalizado y personal de confianza) y sus células de Procesos y de Servicio a Clientes Internos. Todos entregan informes, propuestas, presentaciones, planes de acción o mejora y seguimiento de objetivos. **Solo el Director decide.**

| Documento | Contenido |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Reglas del equipo, flujo de trabajo y cuándo usar a cada agente |
| [Organigrama del equipo del Director](equipo-director/organigrama-equipo-director.md) | Estructura v2, responsabilidades y flujo de decisión |
| [Estándar de entregables](equipo-director/estandar-de-entregables.md) | 6 formatos, reglas de calidad, semáforo y cadencia de reportes |
| [Plantillas](equipo-director/plantillas-entregables/) | Informe, propuesta, presentación, plan de acción, A3, seguimiento |
| [Registro de decisiones](equipo-director/decisiones/registro-de-decisiones.md) · [Seguimiento de objetivos](equipo-director/seguimiento-objetivos.md) | Control de decisiones y KPIs del Director |
| [Organigrama detallado de 64 plazas](03-department-design/org/00-organigrama-general.md) | Descripciones de puesto por área |

## How to adapt this model to a real company
1. Replace the figures in `01` (headcount, sites, safety and operating data) with real data.
2. Have labor counsel and HSE validate `02-research/regulatory-framework-mexico.md` against the current DOF publications and STPS guidelines.
3. Recalculate `07` with real payroll, incident costs and operating margins.
4. Co-design the policy and the escalafón links with the union through the CMCAP before approval.

> **Disclaimer:** Company data is fictional. Legal references are a planning aid and are not legal advice.
