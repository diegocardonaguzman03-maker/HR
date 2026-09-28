# Process Assumptions — EAF Steelmaking and Secondary Metallurgy

Scope: raw materials → EAF → tapping → ladle → ladle furnace (LF) → release to casting.
Authors: Agent 1 (EAF process), Agent 2 (secondary metallurgy), Agent 4 (equipment decomposition).
Reference configuration: FT-ACE-001 v0.3 (draft for validation) — 150 t AC EAF, ≈ 60% DRI continuous feed + scrap buckets, EBT, 2 ladle furnaces, 150 t ladles.

> All numbers shown in the app are **SIMULATED TRAINING DATA**. Reference values are not plant setpoints and must be validated by Process Engineering and the OEMs before any operational use. This document contains no plant safety procedures and no maintenance frequencies.

Classification key (matches `Classification` in `src/types/equipment.ts`):

| Heading | Code | Meaning |
|---|---|---|
| INDUSTRY STANDARD | `INDUSTRY_STANDARD` | Generally true for DRI/scrap EAF + LF steelmaking |
| CONFIGURABLE | `CONFIGURABLE` | Reference value from FT-ACE-001; editable in configuration |
| PLANT-SPECIFIC INFORMATION REQUIRED | `PLANT_SPECIFIC` | Must be confirmed with the real plant/OEM |
| ASSUMPTION | `ASSUMPTION` | Educational placeholder chosen by the team |

---

## 1. Agreed process sequence (upstream part)

| # | SimState | Equipment active | Material state(s) | What happens |
|---|---|---|---|---|
| 1 | `RAW_MATERIALS` | rawMaterials | SOLID_RAW_MATERIAL | Scrap sorted and loaded into bucket; DRI in silos; fluxes dosed |
| 2 | `CHARGING` | rawMaterials, eaf, (charging crane) | SOLID_RAW_MATERIAL | Roof opens, bucket discharged onto the hot heel, roof closes |
| 3 | `ARC_IGNITION` | eaf | SOLID_RAW_MATERIAL → PARTIALLY_MELTED | Electrodes lowered, arcs bore into scrap at reduced voltage |
| 4 | `MELTING` | eaf, rawMaterials (DRI conveyor) | PARTIALLY_MELTED → LIQUID_STEEL | Full power, burners, 2nd bucket (optional), flat bath, continuous DRI feed, foamy slag |
| 5 | `REFINING` | eaf | LIQUID_STEEL | O₂/C injection, decarburisation, dephosphorization, temperature and C to tap target, sampling |
| 6 | `TAPPING` | eaf, ladle | LIQUID_STEEL → LIQUID_IN_LADLE | EBT opens, furnace tilts, steel to ladle with Al/alloy additions, argon on, tilt back before slag |
| 7 | `SECONDARY_METALLURGY` | ladle, ladleFurnace | LIQUID_IN_LADLE → REFINED_LIQUID_STEEL | Slag conditioning, arc heating, desulfurization, alloy trim, Al trim, CaSi treatment, soft stirring |
| 8 | `VACUUM_TREATMENT` | — | — | **Optional, disabled** in the reference configuration (no RH/VTD) |
| 9 | `TRANSFER` | crane, ladle | REFINED_LIQUID_STEEL (in ladle) | Ladle released and carried to the caster turret (handover to downstream agents) |

## 2. Material-state transitions (this part)

| From | To | Trigger (educational model) |
|---|---|---|
| SOLID_RAW_MATERIAL | PARTIALLY_MELTED | Arc ignition; `eaf.meltedFraction` > 0% |
| PARTIALLY_MELTED | LIQUID_STEEL | Flat bath formed; `eaf.meltedFraction` = 100% (DRI still being fed continuously into liquid) |
| LIQUID_STEEL | LIQUID_IN_LADLE | EBT tapping (steel leaves the furnace) |
| LIQUID_IN_LADLE | REFINED_LIQUID_STEEL | LF treatment completed: chemistry, S, Al, temperature and soft-stir criteria met |
| REFINED_LIQUID_STEEL | LIQUID_IN_LADLE (release/transfer) | Ladle released to the casting crane, handover to turret/tundish |

Note: the order requested in the brief is SOLID_RAW_MATERIAL → PARTIALLY_MELTED → LIQUID_STEEL → REFINED_LIQUID_STEEL → LIQUID_IN_LADLE. Physically the steel is already in the ladle when it is refined at the LF; the app may show `REFINED_LIQUID_STEEL` during/after LF and `LIQUID_IN_LADLE` as the "ready ladle in transfer" state. **[ASSUMPTION — visual model choice]**

---

## 3. INDUSTRY STANDARD

**Raw materials**
- Scrap is classified by grade because density, cleanliness and residual elements (Cu, Sn, Ni, Cr, Mo) differ; residuals are not removed in the EAF or LF, only diluted.
- DRI dilutes residual elements but brings gangue (SiO₂, Al₂O₃) and unreduced FeO; lower metallization increases energy demand and slag volume and lowers yield.
- DRI can re-oxidise and self-heat when exposed to moisture/air; it is stored dry and monitored.
- Wet scrap, sealed containers and trapped liquids are a major explosion hazard when charged onto molten metal.
- Incoming scrap is screened for radioactive sources.
- Lime (CaO) and dolomite (CaO-MgO) are the main slag formers; hydrated lime carries hydrogen.

**Charging**
- A hot heel of liquid steel and slag is retained to speed melting and ease DRI feeding.
- Scrap bucket layering (light–heavy–light) protects the hearth and allows quick bore-in.
- Charging happens with the power off and the roof swung open; it is a power-off time loss.

**Arc and electrodes**
- AC EAF uses three graphite electrodes; arcs are regulated by moving the electrodes (impedance/current control).
- Bore-in is done at reduced voltage/short arc until electrodes are shielded by scrap.
- Long arcs need slag cover to avoid radiating heat to the walls and roof.
- Electrode consumption comes from tip sublimation, side oxidation and breakage.

**Foamy slag and O₂/C injection**
- Oxygen oxidises C in the bath (CO), and injected carbon reduces FeO in the slag (CO); the CO bubbles foam the slag.
- Foaming requires adequate FeO, basicity, viscosity (MgO saturation, second-phase particles) and temperature.
- Foamy slag shields arcs, improves energy efficiency, protects panels and reduces noise.
- Burners add chemical energy in cold spots during early melting.

**Melting**
- Melting combines electrical energy (majority), chemical energy (oxidation of C, Fe, Si, Mn) and burner energy.
- Continuous DRI feed must be matched to active power; overfeeding cools the bath and forms unmelted DRI accumulations.

**Refining**
- Dephosphorization is favoured by basic, oxidising (FeO-rich) slag at moderate temperature and slag renewal.
- Decarburisation raises dissolved oxygen; C and O at tap are inversely related.
- CO boil helps remove N and H; air ingress increases N.

**Temperature and carbon evolution**
- Temperature rises slowly while solid scrap is present and quickly after flat bath; DRI feeding holds it down.
- Carbon rises from charge carbon/DRI carbon and falls with oxygen injection toward the tap target.

**Tapping**
- EBT tapping minimises slag carry-over; the furnace is tilted back before slag reaches the taphole.
- Deoxidisers and alloys are added into the ladle stream during tapping; argon stirring starts early.
- Slag carry-over is oxidising: it consumes Al, can revert P and hinders desulfurization.

**Ladle**
- Ladles are preheated to limit thermal shock and temperature loss.
- The slag line is the most attacked refractory zone; MgO-C is common there.
- Slide gates with sealing sand in the well are the standard bottom valve; free opening is a key KPI.
- Porous plugs deliver argon for stirring.

**Ladle furnace**
- *Heating*: arc heating through the slag; slag cover protects refractory and roof.
- *Alloying*: additions calculated from sample, weight and expected recovery; recovery depends on oxidation state.
- *Argon*: strong stirring for desulfurization/homogenisation, soft stirring for inclusion flotation; excessive stirring opens an "eye" and re-oxidises the steel.
- *Desulfurization*: requires basic, fluid, reducing slag (low FeO + MnO), low oxygen activity (Al-killed steel), high temperature and good mixing — all simultaneously.
- *Inclusion control*: Al deoxidation forms alumina; flotation to slag needs time and gentle stirring; re-oxidation must be avoided.
- *Ca treatment*: CaSi cored wire modifies solid alumina into liquid calcium aluminates; Ca must be balanced with Al, S and O — excess Ca forms CaS, insufficient Ca leaves solid alumina; both can clog nozzles.
- *Final chemistry*: confirmed by final sample before release.
- *Release to casting*: temperature = liquidus + tundish superheat + transport and casting losses.

**Optional vacuum**
- RH or VTD vacuum degassing removes H, N and enables ultra-low carbon; it is not required for most Al-killed and rebar grades.

## 4. CONFIGURABLE (reference values FT-ACE-001 v0.3)

**Raw materials / charging**
- Metallic charge: ≈ 60% DRI/HBI (continuous 5th-hole feed) + ≈ 40% scrap in 1–2 buckets.
- Scrap bucket: 90 m³, typical load 55–70 t.
- DRI feed rate: 3.5–4.3 t/min (≈ 30–35 kg/min/MW at ≈ 120 MW); up to 5.0 t/min only with validated hot DRI (500–650 °C).
- Lime 30–45 kg/t; dolomite 10–15 kg/t.

**EAF**
- AC, 3 electrodes, EBT; tap weight 150 t; hot heel 20–30 t; shell Ø 7.3 m.
- Transformer 140 MVA, secondary up to 1,200 V, OLTC; ≈ 119 MW active at PF ≈ 0.85 (`eaf.power`).
- Electrodes UHP 610 mm (24"); consumption 1.3–1.6 kg/t.
- 4 wall burners/coherent jets up to 2,500 Nm³/h each; O₂ 30–40 Nm³/t (`eaf.oxygen`).
- Carbon injection 8–12 kg/t.
- Slag: B2 1.8–2.2; FeO 25–35%; MgO 8–10%.
- Energy ≈ 560 kWh/t (520–600) (`eaf.energy`); power-on 42–44 min (`eaf.powerOnTime`); tap-to-tap ≈ 55 min.
- Tap temperature 1,630 ± 15 °C (`eaf.bathTemperature`); tap C 0.04–0.08% (`eaf.carbon`); active O 500–900 ppm; P ≤ 0.015%.
- Off-gas: 4th-hole DES, furnace pressure −5 to −15 Pa.

**Ladle**
- 150 t (`ladle.steelWeight`); fleet 10 (7 in cycle); lining MgO-C slag line, Al₂O₃-MgO-C barrel/bottom; life 60–80 heats.
- Preheat 1,000–1,100 °C hot face.
- Slide gate 2- or 3-plate, chromite sealing sand, free-opening target ≥ 98%; 1–2 porous plugs.

**Ladle furnace**
- 2 units; transformer 25 MVA; electrodes 457 mm (18"); heating 4–5 °C/min.
- Argon strong 400–600 NL/min, soft 50–150 NL/min ≥ 8 min before release (`lf.argonFlow`).
- Wire feeder 2 lines (CaSi, Al, C).
- Targets: S ≤ 0.010% (`lf.sulfur`); Al soluble 0.020–0.045% for Al-killed slab grades (`lf.aluminium`).
- Treatment time 35–45 min (`lf.treatmentTime`).

**Crane**
- 2 ladle cranes 250/63 t with double brakes and redundant limits.

## 5. PLANT-SPECIFIC INFORMATION REQUIRED

- Actual scrap grades, suppliers, residual-element limits per steel grade.
- DRI chemistry: metallization, carbon, gangue, fines; hot vs. cold DRI availability.
- Actual bucket recipes and number of buckets per grade.
- Electrical operating chart: tap/voltage steps, arc current, regulation setpoints (OEM).
- Cooling water flows, alarm and trip thresholds (FT-ACE-001 lists reference values; must be validated with OEM).
- Burner/lance setpoints and gas ratios (OEM).
- Tap temperature and tap chemistry by grade.
- Deoxidation and alloying practice in the tap (additions, sequence, recoveries).
- Slag detection system at EBT (installed or not).
- Ladle dimensions, freeboard, refractory specification and removal criteria.
- LF slag practice (synthetic slag, target FeO + MnO), desulfurization curves.
- Ca treatment window (Ca ppm vs. Al and S) per grade; wire type, length and feed speed.
- Release temperature table (liquidus by grade, superheat and loss allowances by route CC1/CC2).
- Transfer times LF → turret; crane span, lift and speeds.
- All safety procedures, lock-out rules and maintenance frequencies (to be integrated from plant systems, not authored here).

## 6. ASSUMPTION (educational placeholders)

- `eaf.meltedFraction` is an educational indicator (0–100%), not a measured plant variable.
- Simulated ladle temperature at LF arrival ≈ 1,570–1,610 °C and LF temperature ≈ 1,560–1,620 °C (depend on grade, route and practice).
- The simulator shows one bucket plus continuous DRI as the default heat; a second bucket is optional.
- Temperature and carbon curves in the simulator are smooth illustrative profiles (temperature slow rise during solid charge, faster after flat bath, held by DRI; carbon falling with O₂ toward tap target), not a thermodynamic model.
- Vacuum degassing (RH/VTD) is **optional and disabled** in the reference configuration; the `VACUUM_TREATMENT` state is skipped.
- CaSi treatment is shown for Al-killed grades; whether it is applied to every grade is plant-specific.
- The ladle crane is modelled as one representative crane; the charging crane (scrap buckets) is not modelled as separate equipment.
