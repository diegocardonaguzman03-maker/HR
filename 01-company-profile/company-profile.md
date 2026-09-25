# Company Profile — Grupo Acero Sierra Madre (GASM)

> **Note:** GASM is a *fictional* company built as a realistic case so the Training & Development (T&D) model in this repository can be designed, costed and tested. The figures are plausible assumptions for a mid-sized integrated Mexican mining and steel group. Replace them with real data when you adapt the model.

## 1. Business overview

| Item | Description |
|---|---|
| Legal name | Grupo Acero Sierra Madre, S.A.B. de C.V. |
| Headquarters | San Pedro Garza García, Nuevo León |
| Business model | Vertically integrated: iron ore mining → beneficiation & pelletizing → direct reduction (DRI) → electric arc furnace (EAF) steelmaking → hot rolling (flat & long products) |
| Annual output | 6.5 Mt iron ore concentrate · 4.2 Mt pellets · 2.2 Mt liquid steel · 2.0 Mt finished steel |
| Main markets | Automotive and appliance suppliers (nearshoring corridor in Bajío and the North), construction (rebar), energy and pipe |
| Certifications | ISO 9001, ISO 14001, ISO 45001; IATF 16949 at the flat-products line |
| Revenue (assumed) | ≈ MXN 48,000 M / year |

## 2. Operating units

| # | Unit | Location | Process | Employees |
|---|---|---|---|---|
| 1 | **Unidad Minera Cerro Tepehuaje** | Colima–Jalisco border | Open-pit iron ore mine, drilling & blasting, 240-t haul fleet, crushing, magnetic concentration | 1,450 |
| 2 | **Unidad Minera Sierra Alta** | Central Coahuila | Mixed open-pit + underground (sublevel stoping) iron ore mine, concentrator | 1,100 |
| 3 | **Planta Peletizadora Manzanillo** | Manzanillo, Colima | Slurry pipeline reception, filtering, pelletizing (grate-kiln), port loading | 800 |
| 4 | **Complejo Acería Norte** | Salinas Victoria, Nuevo León | DRI plant (hydrogen-ready natural gas reactor), 2 EAFs, ladle furnaces, continuous casters, hot strip mill, rebar & merchant bar mill | 3,900 |
| 5 | **Service & distribution centers** | Monterrey, Querétaro, Silao | Slitting, cut-to-length, logistics | 650 |
| 6 | **Corporate** | San Pedro Garza García | Shared services, engineering, commercial, IT/OT | 600 |
| | **Total direct employees** | | | **8,500** |
| | **Contractor workforce (REPSE)** | All sites | Maintenance, mining services, blasting, cleaning, logistics | **≈ 4,000** |

## 3. Workforce demographics (baseline)

| Indicator | Value | Implication for T&D |
|---|---|---|
| Unionized workers (collective bargaining agreement, CCT) | 72% | Training is tied to seniority-based progression (*escalafón*) and CCT clauses; the union co-chairs the Joint Training Commission |
| Non-unionized (salaried / *confianza*) | 28% | Leadership, professional and technical-specialist tracks |
| Average age | 43 years | Knowledge-loss risk |
| Eligible to retire within 7 years | 28% (≈ 2,380 people); **41% of senior maintenance technicians** | Urgent need for knowledge capture and succession planning |
| Women in the workforce | 11% (4% in operational roles) | Diversity target and NMX-R-025 certification |
| Voluntary turnover — technicians < 30 years old | 18% / year | Automotive plants in Nuevo León poach PLC and hydraulics technicians |
| Education — operators | 64% secondary/high school, 22% technical (CONALEP/UT), 14% other | Need for accessible, practical learning, often in Spanish only |
| Shift pattern | 4×4 12-hour shifts (plants), 14×7 rosters (Sierra Alta mine) | Training must be modular and shift-friendly, delivered in the field or on mobile |

## 4. Safety and operational baseline (last 12 months)

| Indicator | Value |
|---|---|
| Man-hours worked (employees + contractors) | ≈ 30 M |
| Lost-Time Injury Frequency Rate (LTIFR, per 1 M h) | 3.2 (≈ 96 LTIs) |
| Total Recordable Injury Frequency Rate (TRIFR) | 7.9 |
| Fatalities (last 3 years) | 2 (one contractor fell from height at the rolling mill; one employee was struck by a mobile vehicle at the Tepehuaje pit) |
| Share of incidents involving contractors | 58% |
| EAF shop availability | 86% (target 89%) |
| Haul-fleet fuel spend | ≈ MXN 520 M / year |
| IMSS work-risk premium (*prima de riesgo de trabajo*) | 4.8% (class V) |

## 5. Current state of training (As-Is diagnosis)

A diagnostic of the six sites (interviews with 64 managers, 22 focus groups, a records audit and a survey of 1,140 workers) found the following:

| # | Finding | Evidence | Root cause |
|---|---|---|---|
| 1 | **Training is fragmented.** Each site has its own "Capacitación" office that reports to local HR. Each uses different vendors, formats and systems. | 6 sites, 4 spreadsheets, 2 legacy LMS, 1 site on paper | No corporate governance or standard model |
| 2 | **Training is driven by compliance, not performance.** About 70% of hours are regulatory courses taught in the classroom. | 38 h per employee per year on average; most of it is NOM-mandated safety content | The needs analysis (DNC) is a wish list, not tied to competencies or to business KPIs |
| 3 | **STPS compliance is at risk.** DC-3 certificates are missing for 23% of sampled critical tasks, and 3 of the 6 Joint Training Commissions (CMCAP) have lapsed. | Internal audit | No owner or calendar for regulatory tasks |
| 4 | **Critical-risk competence is not verified.** Operators are "trained" (they attended) but not *assessed as competent* for tasks such as isolation/LOTO, confined space, heights, suspended loads and mobile equipment. | Both fatalities involved expired or missing authorizations | No certification or re-certification scheme |
| 5 | **Contractor onboarding is weak.** Induction is a 2-hour video, and contractor competence is not verified. | 58% of incidents involve contractors | REPSE contracts do not state competence requirements |
| 6 | **Supervisors are promoted without leadership preparation.** | 81% of first-line supervisors had no leadership training in their first year | No leadership pipeline |
| 7 | **Critical knowledge is walking out the door.** Retiring EAF, reliability and blasting experts do not document what they know. | 41% of senior maintenance technicians are eligible to retire | No knowledge-management or mentoring process |
| 8 | **Few digital and future skills.** Skills are short in PLC/SCADA, predictive maintenance, data analytics and hydrogen/decarbonization technologies. | 17 critical automation vacancies open for more than 90 days | The talent market is competitive and there is no internal pipeline |
| 9 | **There is no measure of impact.** Only attendance and satisfaction are tracked. | No Level 3 or Level 4 evaluation | No analytics capability |
| 10 | **Spending is high and poorly controlled.** Training spend is ≈ MXN 78 M per year (≈ MXN 9,200 per employee), 61% of it with external vendors that were not competitively bid. | Finance ledger | Decentralized purchasing |

## 6. Strategic drivers that the T&D department must support

1. **Zero fatalities (*Cero Fatalidades*)**: the group's safety strategy is built on critical-risk management.
2. **Operational excellence**: EAF availability, yield, and haul-fleet productivity.
3. **Growth from nearshoring**: automotive-grade flat steel requires IATF quality competence.
4. **Decarbonization**: running the DRI plant on hydrogen blends, energy efficiency and scrap quality.
5. **Generational change**: replacing retiring experts and attracting young talent, including women.
6. **Social license and compliance**: STPS, the Mining Law and the communities around the mines.
