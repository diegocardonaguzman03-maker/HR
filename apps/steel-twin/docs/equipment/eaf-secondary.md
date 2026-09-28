# Equipment Decomposition — EAF Steelmaking and Secondary Metallurgy

Agent 4 (mechanical/equipment decomposition), with Agents 1 and 2. Source data: `src/data/equipment/{rawMaterials,eaf,ladle,ladleFurnace,crane}.ts`.
Reference configuration FT-ACE-001 v0.3 (draft). No maintenance frequencies and no plant procedures are given; all criteria must come from OEM and plant systems.

## 1. Raw Materials (`rawMaterials`)

| Component id | Name | Function | Main failure modes | Inspection points | Process consequence |
|---|---|---|---|---|---|
| `scrapYard` | Scrap Yard | Receive, classify and store scrap by grade | Grade mix-up; wet scrap / sealed containers; non-metallics | Incoming load inspection; bay segregation; drainage | Residuals, slag volume, explosion risk |
| `scrapBucket` | Scrap Bucket | Carry layered scrap charge and discharge into EAF | Clamshell not opening; hinge/latch wear; bridging | Hinges/pins; lifting lugs; shell; load cell | Charging delays, roof/shell damage |
| `driSilo` | DRI Silo | Store DRI/HBI and feed conveyor | Re-oxidation/self-heating; bridging; fines | Temperature/gas monitoring; outlet gates; level | Lower metallization, irregular feed |
| `conveyor` | DRI Conveyor + Weigh Hopper | Transport and meter DRI to EAF roof | Belt damage; scale drift; chute blockage | Tracking; scale calibration; chute liners | Irregular DRI rate, bath temperature swings |
| `fluxBins` | Flux Bins and Dosing | Store and dose lime/dolomite | Hydrated lime; feeder blockage; weighing error | Levels; feeder operation; lime quality | Wrong basicity/MgO; refractory wear |
| `radiationPortal` | Radiation Portal | Detect radioactive sources in scrap | Calibration drift; alarm bypass; power loss | Functional check with source; alarm log | Contamination of steel, dust and plant |

## 2. Electric Arc Furnace (`eaf`)

| Component id | Name | Function | Main failure modes | Inspection points | Process consequence |
|---|---|---|---|---|---|
| `shell` | Shell and Hearth | Contain charge, bath and slag | Refractory erosion; hot spots; deformation | Refractory profile; thermography; gunning | Breakout of liquid steel |
| `roof` | Water-cooled Roof + Delta | Close furnace; hold electrode, 4th- and 5th-hole ports | Water leak; delta cracking; lift/swing fault | Flow balance; delta; port seals | Steam explosion risk; electrode breakage |
| `electrodes` | Graphite Electrodes | Conduct current, strike arcs | Breakage; oxidation; loose joints | Joints; column length; consumption | Delays; carbon pick-up |
| `electrodeArms` | Arms, Masts, Regulation | Hold and regulate electrodes | Unstable regulation; clamp slip; insulation fault | Response; clamp pressure; arm cooling | Arc instability, flicker, lower power |
| `transformer` | Furnace Transformer | Supply arc power (OLTC) | Tap changer fault; overheating; secondary circuit damage | Oil/winding temps; tap changer; flexible cables | Power cap or full stop |
| `oxygenLances` | O₂ Lances / Coherent Jets | Decarburisation, foaming, chemical energy | Nozzle blockage; water leak; valve fault | Flow/pressure trends; nozzles; water balance | Slow decarb/foaming, or high FeO |
| `burners` | Wall Burners | Gas–O₂ energy to cold spots | Flame instability; nozzle blockage; gas valve fault | Flame supervision; ratio; nozzles | Cold spots, longer melting |
| `carbonInjection` | Carbon Injection | Inject carbon fines for foaming/FeO reduction | Line blockage; irregular flow; nozzle wear | Rate; carrier pressure; line wear | No foamy slag, lower efficiency |
| `slagDoor` | Slag Door | Slag overflow, sampling, lancing access | Jamming; air ingress; sill build-up | Movement; sill; frame cooling | N pick-up, energy loss, poor de-P |
| `ebt` | EBT Taphole | Tap steel with little slag | Non-free opening; erosion; sand sintering | Tube/end-block; tapping time; sand | Slag carry-over, re-oxidation |
| `tiltingMechanism` | Tilting Mechanism | Tilt for tapping and deslagging | Hydraulic leak; rocker damage; position error | Cylinders/hoses; accumulators; limits | Cannot tap; uncontrolled slag carry-over |
| `coolingPanels` | Water-cooled Panels | Remove heat from upper shell | Leak/rupture; scaling; arc damage | Flow balance; outlet temps; slag coating | Critical safety stop |
| `offGas` | 4th-hole Off-gas | Extract/burn CO, capture dust | Loss of draft; duct leaks; build-up | Furnace pressure; duct temps; fan/damper | Fume emission, CO exposure |
| `driFeed` | 5th-hole DRI Feed | Deliver DRI continuously into arc zone | Chute blockage/burn-through; rate mismatch | Rate vs. power; chute refractory; gates | DRI icebergs or wasted power |

## 3. Ladle (`ladle`)

| Component id | Name | Function | Main failure modes | Inspection points | Process consequence |
|---|---|---|---|---|---|
| `shell` | Ladle Shell | Hold lining; carry load to trunnions | Hot spots; weld cracks; deformation | Thermography; NDT of welds | Loss of containment |
| `refractoryLining` | Working + Safety Lining | Contain and insulate steel | Erosion/corrosion; joint penetration; spalling | Visual per heat; residual thickness; heat count | Breakout risk; exogenous inclusions |
| `slagLine` | Slag Line (MgO-C) | Resist slag at steel–slag interface | Chemical wear; arc flare; C oxidation | Thickness; local wear | Limits campaign life |
| `slideGate` | Slide Gate | Open/throttle/close flow to tundish | Non-free opening; plate erosion; leakage; cylinder fault | Plates/nozzle per turnaround; clamping; hydraulics | Lancing, re-oxidation, lost heat, breakout |
| `porousPlug` | Porous Plug | Argon stirring from bottom | Blockage; gas leak; erosion | Flow vs. pressure; visual after emptying | Poor homogenisation, de-S, flotation |
| `trunnions` | Trunnions | Crane lifting interface | Wear; cracks; weld degradation | Dimensional wear; NDT | Catastrophic drop |

## 4. Ladle Furnace (`ladleFurnace`)

| Component id | Name | Function | Main failure modes | Inspection points | Process consequence |
|---|---|---|---|---|---|
| `roof` | Water-cooled LF Roof | Contain heat/fume; hold ports | Water leak; skull; lift fault | Flow balance; skull; port refractory | Water–metal risk; H pick-up |
| `electrodes` | Graphite Electrodes | Arc heating | Breakage; tip consumption; dipping | Column length; joints; consumption | Delays; C pick-up |
| `electrodeArms` | Arms + Regulation | Position/regulate electrodes | Unstable regulation; clamp slip; insulation | Response; clamps; cooling | Slow heating; arc flare to refractory |
| `transformer` | LF Transformer (25 MVA ref.) | Supply heating power | Tap changer fault; overheating | Temps; tap changer | Longer treatment; sequence risk |
| `argonSystem` | Argon Stirring | Control plug and backup lance flow | Controller fault; leaks; undetected blocked plug | Flow vs. pressure; couplings; backup lance | Poor de-S, inhomogeneity, re-oxidation |
| `wireFeeder` | Cored Wire Feeder | Feed CaSi/Al/C wire | Jamming; wrong speed; guide wear | Pinch rolls; guide tube; counter | Low recovery; clogging risk |
| `alloyChute` | Alloy/Flux Addition | Weigh and add ferroalloys and fluxes | Weighing error; blockage; wet/wrong material | Scale; bin ID; chute | Off-spec chemistry; H pick-up |
| `ladleCar` | Ladle Transfer Car | Move ladle EAF ↔ LF ↔ crane point | Drive/wheel fault; cable damage; positioning | Wheels/rails; cable reel; sensors | Route blocked; delays |

## 5. Ladle (Casting) Crane (`crane`)

| Component id | Name | Function | Main failure modes | Inspection points | Process consequence |
|---|---|---|---|---|---|
| `bridge` | Bridge | Span bay, travel on runway | Fatigue cracks; wheel/rail wear; drive/brake fault | Welds (NDT); wheels/rails; brakes | Crane out of service; casting stop |
| `trolley` | Main + Auxiliary Trolleys | Carry hoists across bridge | Drive/brake fault; rail wear; limit collision | Drives; rails; limit switches | Positioning inaccuracy |
| `hoist` | Main Hoist (redundant) | Raise/lower ladle | Rope wear; brake degradation; gearbox damage; overload | Ropes; service + emergency brakes; limits; load cell | Catastrophic if failure under load |
| `lifterBeam` | Lifter Beam (Ladle Hook) | Engage trunnions | Hook wear/cracks; wrong engagement; heat damage | Hook surfaces; NDT; heat shields | Ladle drop or tilt |

## 6. Process variable keys (produced by the simulator)

| Key | Unit | Equipment | Classification |
|---|---|---|---|
| `eaf.power` | MW | eaf | CONFIGURABLE |
| `eaf.energy` | kWh/t | eaf | CONFIGURABLE |
| `eaf.bathTemperature` | °C | eaf | CONFIGURABLE |
| `eaf.carbon` | % | eaf | CONFIGURABLE |
| `eaf.oxygen` | Nm³/t | eaf | CONFIGURABLE |
| `eaf.powerOnTime` | min | eaf | CONFIGURABLE |
| `eaf.meltedFraction` | % | eaf | ASSUMPTION |
| `ladle.steelWeight` | t | ladle | CONFIGURABLE |
| `ladle.temperature` | °C | ladle | ASSUMPTION |
| `lf.temperature` | °C | ladleFurnace | ASSUMPTION |
| `lf.sulfur` | % | ladleFurnace | CONFIGURABLE |
| `lf.argonFlow` | NL/min | ladleFurnace | CONFIGURABLE |
| `lf.treatmentTime` | min | ladleFurnace | CONFIGURABLE |
| `lf.aluminium` | % | ladleFurnace | CONFIGURABLE |

Additional descriptive keys (not required from the simulator): `raw.*`, `eaf.driFeedRate`, `eaf.slagFeO`, `eaf.slagBasicity`, `eaf.dissolvedOxygen`, `ladle.preheatTemperature`, `ladle.heatCount`, `ladle.freeboard`, `lf.heatingRate`, `lf.calcium`, `lf.softStirTime`, `lf.slagFeOMnO`, `crane.load`, `crane.transferTime`.
