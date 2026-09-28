# Process flow

The heat moves through a deterministic state machine (`src/config/processConfig.ts`). `IDLE` sits before the first step. The durations are **animation seconds at 1×**, not real process times (a real tap-to-tap cycle is roughly 40 to 60 min **[ASSUMPTION]**).

| # | State | Title | Stage (navigator) | s @1× | Material state (main) |
|---|---|---|---|---|---|
| 1 | RAW_MATERIALS | Raw material preparation | 01 Raw material | 7 | Solid raw material |
| 2 | CHARGING | Charging the EAF | 01 Raw material | 8 | Solid raw material |
| 3 | ARC_IGNITION | Arc ignition | 02 Melting | 6 | Partially melted |
| 4 | MELTING | Melting | 02 Melting | 10 | Partially melted → liquid |
| 5 | REFINING | Refining & foamy slag | 03 Refining | 9 | Liquid steel |
| 6 | TAPPING | Tapping | 04 Tapping | 8 | Liquid steel in ladle |
| 7 | SECONDARY_METALLURGY | Secondary metallurgy (LF) | 05 Ladle furnace | 10 | Refined liquid steel |
| – | VACUUM_TREATMENT | Vacuum treatment (**optional, disabled**) | 05 Ladle furnace | 8 | Refined liquid steel |
| 8 | TRANSFER | Ladle transport | 06 Casting prep | 8 | Liquid steel in ladle |
| 9 | TURRET | Ladle turret | 06 Casting prep | 6 | Liquid steel in ladle |
| 10 | TUNDISH_FILL | Tundish filling | 06 Casting prep | 7 | Liquid steel in tundish |
| 11 | MOLD_FILL | Mold filling | 07 Mold | 6 | Liquid steel in mold |
| 12 | SHELL_FORMATION | Initial shell formation | 07 Mold | 8 | Solid shell + liquid core |
| 13 | SECONDARY_COOLING | Secondary cooling | 08 Solidification | 8 | Solid shell + liquid core |
| 14 | SOLIDIFICATION | Progressive solidification | 08 Solidification | 9 | Solid shell + liquid core |
| 15 | STRAIGHTENING | Straightening | 09 Straightening | 7 | Solid shell + liquid core |
| 16 | FINAL_SOLIDIFICATION | Final solidification | 09 Straightening | 9 | Fully solidified strand |
| 17 | CUTTING | Torch cutting | 10 Cutting | 8 | Fully solidified strand → slab |
| 18 | COMPLETE | Finished slab | 11 Slab | 7 | Slab |

Every step also defines: camera preset, active equipment, `whatHappens`, `why` and the material states it shows. Those feed the mission card, which answers: *where is the steel, what state is it in, which equipment is working, what is happening, why, and what comes next.*

## Strand growth
`STRAND_RANGE` sets the cast length (m from the meniscus) at the start and end of each casting step: mold 0.8 m → shell 2 m → cooling 7 m → solidification 14 m → straightening 18.5 m → final solidification 34 m → cutting 46 m. The metallurgical length (≈ 32.8 m) is reached during *Final solidification*, before the torch cutter at 36 m.

## Modes
- **Guided:** plays the steps automatically, camera goes to each step preset.
- **Explore:** free camera; the clock stays where it is, and the timeline or stage list jumps to any stage.
- **Follow the steel:** plays the steps and the camera tracks `heatPosition()`, keeping the user's orbit offset.
