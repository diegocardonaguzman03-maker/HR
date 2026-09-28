# Continuous Caster — Technical Assumptions Register

Scope: CC1 single-strand slab caster, from ladle arrival at the turret to the slab in the yard.
Reference configuration: **FT-ACE-001 v0.3 §4** (`10-plantas/01-steelmaking/00-ficha-tecnica-acería.md`).
The FT-ACE-001 values are a **reference configuration for training**, not verified plant data.

Classification legend (same as `src/types/equipment.ts`):

- **INDUSTRY STANDARD**: generally true for slab casting; physics and metallurgy.
- **CONFIGURABLE**: value of the reference configuration (FT-ACE-001); editable in config.
- **PLANT-SPECIFIC INFORMATION REQUIRED**: must be confirmed with the real plant / OEM before use.
- **ASSUMPTION**: educational simplification chosen for the simulator.

All numeric values shown in the app are **SIMULATED TRAINING DATA**. This register contains no plant safety procedures and no maintenance frequencies.

---

## 1. Ladle arrival

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | The ladle arrives from secondary metallurgy with a target temperature and chemistry; the caster needs it on time to keep the sequence. |
| INDUSTRY STANDARD | Late ladles force speed reduction or end of sequence; early ladles lose temperature. |
| PLANT-SPECIFIC | Heat size, ladle transit time, temperature loss in transit, arrival temperature targets per grade. |
| ASSUMPTION | The simulator places the ladle on the turret with a fixed arrival temperature and no transit loss modelling. |

## 2. Turret

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | A two-arm turret allows a ladle change without stopping the strand; the tundish feeds the mold during the change. |
| INDUSTRY STANDARD | Ladle load cells give remaining steel and help control slag carry-over at end of heat. |
| CONFIGURABLE | Butterfly arms, 2 ladles, independent lift, ladle weighing. |
| PLANT-SPECIFIC | Rotation time, lift stroke, load capacity, emergency drive design, ladle change time. |
| ASSUMPTION | Rotation animation duration is a training value, not the OEM rotation time. |

## 3. Ladle shroud

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | The shroud protects the ladle-to-tundish stream from air; air ingress produces reoxidation (Al2O3) inclusions and nitrogen pick-up. |
| CONFIGURABLE | Shroud with argon seal at the collector nozzle joint. |
| PLANT-SPECIFIC | Argon seal flow, shroud material and preheat practice. |

## 4. Tundish flow

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | The tundish is a buffer, a temperature homogeniser and an inclusion-flotation reactor. Dams, weirs and impact pad lengthen residence time and promote flotation. |
| INDUSTRY STANDARD | Low tundish level can create a vortex and slag entrainment into the SEN. |
| INDUSTRY STANDARD | Superheat = tundish temperature − liquidus temperature. |
| CONFIGURABLE | 45 t capacity; operating level 900–1,100 mm; dams and weirs; superheat 20–30 °C; low-C liquidus ≈ 1,525 °C. |
| PLANT-SPECIFIC | Flow-control device geometry (water model / CFD), tundish flux, minimum level, liquidus per grade (from chemistry). |
| ASSUMPTION | The simulator uses a constant liquidus of 1,525 °C for all grades; tundish temperature training range ≈ 1,545–1,555 °C. |

## 5. Stopper rod and SEN

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Stopper rod throttles flow into the SEN and acts as the actuator of the mold level loop. A rising stopper position at constant speed indicates clogging. |
| INDUSTRY STANDARD | Clogging results from alumina (deoxidation / reoxidation products), temperature and nozzle conditions; partial clogging makes the jet asymmetric. |
| INDUSTRY STANDARD | Argon reduces clogging but excess argon disturbs the meniscus and can cause pinholes/blisters. |
| CONFIGURABLE | SEN immersion 120–160 mm; stopper argon 3–8 NL/min. |
| PLANT-SPECIFIC | SEN port geometry/angle, stopper actuator dynamics, SEN change practice. |

## 6. Mold

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Four water-cooled copper plates; narrow faces tapered to follow shrinkage; most surface defects and breakouts originate in the mold. |
| CONFIGURABLE | Cu-Ag plates with Ni coating; length 900 mm; narrow-face taper ≈ 1.0–1.2 %/m; section 230 × 900–1,650 mm with hot width change. |
| CONFIGURABLE | Mold level: eddy current, ±3 mm normal, alarm ±8 mm. |
| CONFIGURABLE | BOP thermocouples in 3 rows, sticker pattern alarm. |
| PLANT-SPECIFIC | Plate thickness and machining limits, channel design, BOP logic and thresholds, taper per speed/grade. |

## 7. Oscillation

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Oscillation prevents sticking; negative strip time pumps powder into the gap; oscillation marks form each cycle and their roots are crack initiation sites. |
| INDUSTRY STANDARD | Frequency, stroke, waveform (non-sinusoidal) and casting speed together determine negative strip time and mark depth. |
| CONFIGURABLE | Hydraulic, non-sinusoidal, 120–200 cpm, stroke 4–8 mm. |
| PLANT-SPECIFIC | Oscillation tables vs speed, waveform skew factor. |

## 8. Mold powder

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Powder insulates the meniscus, prevents reoxidation, absorbs inclusions, lubricates and moderates heat flux. |
| INDUSTRY STANDARD | Powder choice depends on grade (e.g., peritectic steels need heat-flux moderation) and casting speed. |
| CONFIGURABLE | Consumption 0.3–0.5 kg/t; liquid pool 8–15 mm. |
| PLANT-SPECIFIC | Powder brand/chemistry per grade, feeding method. |

## 9. Meniscus

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | The meniscus is the steel free surface under the powder; first solid forms here. Level fluctuations cause powder entrapment, meniscus hooks and irregular initial shell. |
| INDUSTRY STANDARD | Level fluctuations are multi-causal: clogging, jet asymmetry, argon, speed changes and bulging in the upper strand (level waves). |
| ASSUMPTION | The meniscus is placed ≈ 100 mm below the mold top; effective mold length for shell growth ≈ 0.8 m. |

## 10. Initial solidification

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Shell thickness grows approximately with the square root of time: **e = K·√t**. |
| ASSUMPTION | Simulator uses **K = 22 mm/√min** as a single constant from meniscus to final solidification (**SIMULATED TRAINING DATA**). Real K varies with grade, cooling, superheat and position (typically lower in the mold than below it). |
| ASSUMPTION | Shell at mold exit at 1.2 m/min: t = 0.8 m / 1.2 m/min ≈ 0.667 min → e ≈ 22 × 0.816 ≈ **18 mm** (training range ≈ 15–22 mm over 0.8–1.6 m/min). |
| INDUSTRY STANDARD | Peritectic grades (≈ 0.09–0.17 % C, grade-dependent) shrink unevenly at the meniscus and are prone to longitudinal cracks and depressions. |

## 11. Primary cooling

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Primary cooling is the mold water; heat extraction is monitored by flow and ΔT per face. Loss of mold water near liquid steel is a severe hazard. |
| CONFIGURABLE | Wide faces ≈ 4,200 L/min each; narrow faces ≈ 450 L/min each; ΔT 6–9 °C; alarm ΔT > 11 °C or flow < 90 %. |
| PLANT-SPECIFIC | Water chemistry, inlet temperature, interlock logic. |

## 12. Secondary cooling

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Sprays cool the strand zone by zone; intensity decreases along the strand. Over-cooling can place the surface in the low-ductility range at the straightener; under-cooling causes bulging and longer metallurgical length. |
| CONFIGURABLE | 10 air-mist zones; specific water 0.8–1.2 L/kg. |
| CONFIGURABLE | Emergency water: elevated tower + diesel pumps; automatic entry ≤ 15 s. |
| PLANT-SPECIFIC | Zone lengths, nozzle types, zone tables per grade/speed, dynamic cooling model. |
| ASSUMPTION | Surface temperature displayed along the strand (≈ 900–1,100 °C) is a smooth educational curve, not a thermal model. |
| ASSUMPTION | The simulator does not change K with specific water; cooling effects on shell growth are explained qualitatively. |

## 13. Segments

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Rolls support the shell against ferrostatic pressure; roll gap follows a taper table; misalignment and bulging generate internal cracks and segregation. |
| CONFIGURABLE | Vertical-curved, radius 9.5 m, 14 segments, gap tolerance ±0.5 mm. |
| PLANT-SPECIFIC | Roll pitch and diameter, driven rolls, soft reduction availability, segment lengths. |
| ASSUMPTION | The 3D model distributes 14 segments evenly along the ≈ 32 m path for visual purposes. |

## 14. Withdrawal

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Driven rolls withdraw the strand at the set casting speed; speed stability matters for mold level. At start-up a dummy bar closes the mold and pulls the first steel out. |
| CONFIGURABLE | Casting speed 0.8–1.6 m/min (nominal 1.2); chain dummy bar, bottom insertion. |
| PLANT-SPECIFIC | Start-up speed ramp, dummy bar disconnection point. |

## 15. Straightening

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | The straightener unbends the strand to horizontal; surface strain combined with low ductility (grade-dependent temperature range) and deep oscillation marks causes transverse/corner cracks. |
| PLANT-SPECIFIC | Straightening points (single / multi-point), target surface temperature per grade. |

## 16. Metallurgical length

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Metallurgical length = distance from meniscus to complete solidification of the centre; it increases with casting speed and superheat and decreases with cooling. It must stay within the supported length and upstream of the cutter. |
| CONFIGURABLE | Machine metallurgical length ≈ 32 m. |
| ASSUMPTION | Simulator: t_solid = (h/2 / K)² = (115 / 22)² ≈ 27.3 min; **L = v · t_solid ≈ 1.2 × 27.3 ≈ 32.8 m ≈ 32 m** at nominal speed. At 1.6 m/min the model gives ≈ 43.7 m — beyond the machine: used in training to show why speed is limited. At 0.8 m/min ≈ 21.9 m. |

## 17. Final solidification

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | The last liquid at the centre is solute-enriched; shrinkage and bulging at the final pocket drive central segregation and centreline porosity. |
| INDUSTRY STANDARD | Lower superheat and good support near the end (soft reduction if available) reduce central segregation. |
| ASSUMPTION | Simulator shows progress = 2e/h × 100 %, capped at 100 %. |

## 18. Torch cutting

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Oxy-fuel torches travel with the strand and cut it into slabs; the strand must be fully solid at the cutter. |
| CONFIGURABLE | O2 + natural gas; slab length 8–11 m. |
| PLANT-SPECIFIC | Cutter position along the machine, torch count, kerf, cutting time. |

## 19. Slab exit

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Runout table carries the slab away; burr removed; slab goes to yard or hot charging. |
| PLANT-SPECIFIC | Runout layout, deburrer type, hot charging practice. |
| ASSUMPTION | Max slab weight ≈ 32.6 t (230 × 1,650 × 11,000 mm, ρ ≈ 7.8 t/m³), calculated. |

## 20. Identification

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Each slab is marked (heat, sequence, slab number) and linked to casting data for traceability and quality release. |
| PLANT-SPECIFIC | Marking technology and ID format. |
| ASSUMPTION | Simulator uses a generic ID format (heat ID + slab counter). |

## 21. Transfer

| Class | Statement |
|---|---|
| INDUSTRY STANDARD | Cross-transfer moves slabs to cooling/storage or to the reheating furnace; runout congestion can force the caster to slow down. |
| PLANT-SPECIFIC | Transfer equipment, yard layout, crane capacity. |

---

## 22. Material-state transitions

| # | State | Where | Physical explanation |
|---|---|---|---|
| 1 | `LIQUID_IN_LADLE` | Ladle on turret | Fully liquid refined steel, above liquidus; loses heat through refractory and slag. INDUSTRY STANDARD. |
| 2 | `LIQUID_IN_TUNDISH` | Tundish | Liquid steel at superheat 20–30 °C (CONFIGURABLE); flow calms, inclusions float; temperature homogenises. |
| 3 | `LIQUID_IN_MOLD` | Mold, at the meniscus | Steel enters through the SEN; contact with water-cooled copper starts nucleation of the first solid at the meniscus. INDUSTRY STANDARD. |
| 4 | `THIN_SHELL_LIQUID_CORE` | Mold and upper strand (≈ 0–5 m) | Thin shell (≈ 18 mm at mold exit, ASSUMPTION K = 22) contains a large liquid core; the shell must resist ferrostatic pressure, so close roll support and intense sprays are needed. |
| 5 | `THICK_SHELL_REDUCED_CORE` | Curved and straightening zone | Shell grows ∝ √t; the liquid core narrows; heat is extracted mainly by sprays and radiation; straightening happens while the core is still liquid (surface strain matters). |
| 6 | `FINAL_SOLIDIFICATION` | Near the metallurgical length (≈ 28–32 m at 1.2 m/min, simulator) | The two solidification fronts meet; residual liquid is solute-rich; shrinkage can pull it to the centre → central segregation / porosity. |
| 7 | `SOLID_SLAB` | Cutter and runout | Fully solid section; cut to length; cools further in the yard. Must be solid before cutting. |

Simulator transition rule (ASSUMPTION): state at a strand position x is derived from progress p = 2·K·√(x/v)/h: p < 0.35 → THIN_SHELL_LIQUID_CORE; 0.35 ≤ p < 0.85 → THICK_SHELL_REDUCED_CORE; 0.85 ≤ p < 1 → FINAL_SOLIDIFICATION; p ≥ 1 → SOLID_SLAB. Thresholds are educational, not physical boundaries.

## 23. Open items for the plant

[Validate with OEM / Process Engineering] — heat size and ladle change time; SEN geometry; oscillation tables; powder per grade; zone tables and cooling model; roll pitch and soft reduction; straightening points; cutter position; liquidus per grade; BOP thresholds; emergency water logic.
