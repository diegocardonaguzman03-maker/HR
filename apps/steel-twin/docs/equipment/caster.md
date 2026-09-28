# Continuous Caster — Equipment Decomposition

Data source of truth: `src/data/equipment/{turret,tundish,mold,segments,coolingSystem,torchCutter,slab}.ts`.
Reference configuration: FT-ACE-001 v0.3 §4. Assumptions: `docs/assumptions/caster.md`.
No maintenance frequencies are defined here; they depend on OEM and plant criteria.

## Equipment overview

| Equipment id | Name | Category | Process stages | Key variables |
|---|---|---|---|---|
| `turret` | Ladle Turret | casting | TURRET, TUNDISH_FILL, MOLD_FILL | ladle.weight, tundish.weight |
| `tundish` | Tundish | casting | TUNDISH_FILL, MOLD_FILL, SHELL_FORMATION | tundish.weight, tundish.temperature, cc.superheat |
| `mold` | Continuous Casting Mold | casting | MOLD_FILL, SHELL_FORMATION | mold.level, mold.waterDeltaT, mold.oscillationFreq, cc.shellThicknessMoldExit |
| `segments` | Strand Guide and Segments | casting | SHELL_FORMATION → FINAL_SOLIDIFICATION | cc.castingSpeed, cc.metallurgicalLength, cc.solidificationProgress |
| `coolingSystem` | Caster Cooling System | cooling | SHELL_FORMATION → FINAL_SOLIDIFICATION | cc.specificWater, cc.surfaceTemp |
| `torchCutter` | Torch Cutting Machine | cutting | CUTTING | cutter.slabLength |
| `slab` | Slab and Runout Area | product | CUTTING, COMPLETE | cutter.slabLength, slab.width |

## 1. Turret

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| base | Base and slewing bearing | Carry and rotate the turret | Bearing wear, foundation issues | Cannot change ladles → end of sequence |
| arms | Butterfly arms | Hold and lift ladles | Weld fatigue, lift cylinder drift | Shroud cannot be connected |
| ladleSupports | Ladle supports | Seat ladle trunnions | Seat wear, debris | Nozzle misalignment → air ingress |
| loadCells | Load cells | Weigh ladle | Drift, signal loss | Slag carry-over or yield loss |
| rotationDrive | Rotation drive | Rotate turret (with emergency drive) | Motor/gear/brake failure | Failed ladle change |
| ladleShroud | Ladle shroud | Protect stream (argon seal) | Crack, poor seal, clogging | Reoxidation inclusions |

## 2. Tundish

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| vessel | Steel shell | Contain lining and steel | Distortion, hot spots | Breakthrough |
| lining | Refractory lining | Contain steel, insulate | Erosion, spalling, poor preheat | Inclusions, cold start |
| flowControl | Dams, weirs, impact pad | Increase residence time | Erosion/collapse | Short-circuit flow → inclusions |
| stopperRod | Stopper rod | Throttle flow; level-loop actuator | Clogging, nose erosion, actuator fault | Level fluctuation, overflow |
| sen | Submerged entry nozzle | Deliver steel below meniscus | Clogging, slag-line erosion, crack | Asymmetric flow, entrapment |
| tundishCar | Tundish car | Position and centre tundish | Drive fault, misalignment | Delayed start, asymmetric flow |
| cover | Cover and flux | Insulate, prevent reoxidation | Poor coverage | Heat loss, inclusions |

## 3. Mold

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| copperPlates | Cu-Ag plates, Ni coating | Heat transfer, cavity | Coating wear, meniscus cracks, taper loss | Cracks, breakout risk |
| waterJackets | Water jackets/channels | Carry primary water | Scaling, blockage, leaks | Overheating, explosion hazard |
| oscillator | Hydraulic oscillator | Anti-sticking motion | Servo fault, lateral play | Stickers, marks, transverse cracks |
| levelSensor | Eddy-current sensor | Meniscus level | Drift, noise | Overflow / entrapment |
| bopThermocouples | BOP thermocouples | Sticker detection | Broken/poor contact | Undetected sticker → breakout |
| moldPowder | Mold powder feeding | Insulate, lubricate | Wrong feeding / grade | Stickers, cracks |
| widthAdjust | Narrow-face drives | Width and taper | Drive fault, taper error | Bulging, corner cracks |

## 4. Segments (strand guide)

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| benderSegment | Foot rolls and bender | Support thin shell, bend | Misalignment | Level waves, cracks, breakout |
| segments | 14 segments | Support and guide | Gap out of tolerance | Bulging, internal cracks |
| rolls | Rolls and bearings | Contact support | Seizure, bending, wear | Marks, loss of support |
| drives | Withdrawal drives | Pull strand at speed | Motor/gear failure | Level fluctuation, stop |
| straightener | Straightener | Unbend to horizontal | Strain concentration | Transverse cracks |
| dummyBar | Chain dummy bar | Start-up | Head damage, disconnect failure | Start-up breakout |
| frame | Frame/foundations | Hold radius | Distortion | Recurring internal cracks |

## 5. Cooling system

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| primaryWater | Primary water circuit | Mold cooling | Pump failure, fouling, leaks | Breakout, explosion risk |
| sprayZones | 10 spray zones | Zone cooling | Valve/meter/model error | Cracks, bulging |
| nozzles | Air-mist nozzles | Uniform spray | Clogging, wear | Hot stripes, cracks |
| sprayChamber | Spray chamber | Contain water/steam | Scale, drainage | Spray/roll interference |
| emergencyWater | Emergency water | Backup ≤ 15 s | Fails to start | Severe event on power loss |
| steamExhaust | Steam exhaust | Extract steam | Fan/duct failure | Poor visibility, corrosion |

## 6. Torch cutter

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| torchCar | Torch car | Synchronised travel | Sync loss, drive fault | Length/squareness errors |
| torches | Torches | Preheat and cut | Nozzle wear, flashback | Incomplete cut |
| gasSupply | O2 + natural gas | Supply gases | Leaks, pressure | Cutting stop, fire risk |
| clamps | Clamps | Grip strand | Slip | Crooked cut |
| deburrer | Deburrer | Remove burr | Tool wear | Downstream marks |
| marking | Marking | Slab ID | Illegible / data mismatch | Traceability loss |

## 7. Slab and runout

| Component id | Name | Function | Main failure modes | Process consequence |
|---|---|---|---|---|
| runoutTable | Runout table | Move slabs away | Seized rollers | Caster slowdown |
| slabId | Identification | Traceability | Mismatch | Wrong allocation |
| crossTransfer | Cross-transfer | Side transfer | Hydraulic fault | Congestion |
| slabYard | Slab yard | Store, inspect, condition | Stacking/crane issues | Delays, cooling cracks |

## Cross-equipment quality interactions (summary)

| Defect | Contributing parameters (never single-cause) |
|---|---|
| Breakout | Shell thickness (speed, superheat, mold heat flux), stickers (powder, oscillation, level), taper, mold water |
| Longitudinal cracks | Grade (peritectic), mold heat flux, powder, level stability, SEN symmetry, taper |
| Transverse / corner cracks | Chemistry (Nb, V, Al, N), secondary cooling, straightening temperature, oscillation mark depth |
| Inclusions / slivers | Reoxidation (shroud), slag carry-over, tundish flow, clogging, level fluctuation |
| Central segregation / porosity | Superheat, speed, cooling, roll gap / bulging at final solidification |
| Pinholes / blisters | Argon flow, powder/level, dissolved gases |
