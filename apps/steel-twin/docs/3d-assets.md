# 3D assets

## Current state: procedural proxies
Every machine is built from three.js primitives in `src/scene/equipment/*.tsx`. They are **proxy models**: correct in proportion, position and moving parts, simplified in detail. Shared materials are in `src/scene/common/materials.ts`.

| Asset | File | Moving parts |
|---|---|---|
| Pellet yard, HYL plant, Midrex plant | DirectReduction.tsx | — (static proxies; pellet bed visible in X-ray) |
| DRI belts from HYL/Midrex, day silos, roof conveyor, flux bins, internal-returns bay and bucket | RawMaterials.tsx | DRI particles on belts, returns bucket |
| EAF, electrodes, roof, transformer | EAF.tsx | tilt, roof swing, electrode stroke, arcs, bath level, foamy slag |
| Ladle and car | Ladle.tsx | fill level, argon bubbles |
| Ladle furnace | LadleFurnace.tsx | electrodes, arc |
| Crane, turret | CraneAndTurret.tsx | crane travel, hoist, turret rotation |
| Tundish, mold | TundishMold.tsx | level, flow, mold oscillation |
| Strand, roller segments, spray | Strand.tsx | strand growth, shell/core, temperature colours |
| Cooling, torch cutter, slab line | CoolingCutterSlab.tsx | torch travel, sparks, slab transfer |

## Deliberate exaggerations
- Strand thickness drawn ×1.6 (`LAYOUT.strand.thicknessScale`) so shell and core are readable.
- The solidification section drawing uses ×2 thickness; the numbers are true to scale.
- Plant building is shown as a cut-away (far-side columns only) to keep lines of sight.

## Replacing proxies with GLB
1. Export the model in metres, Y-up, origin at the same reference as `LAYOUT` (`src/config/layout.ts`).
2. Put it in `public/models/<equipmentId>.glb`; name sub-meshes with the component ids in `src/data/equipment/<id>.ts`.
3. Load it with drei `useGLTF` inside the existing `<EquipmentGroup>`; wrap sub-meshes in `<Part>` to keep component mode and exploded view; set `userData.xray` on shells.
4. Keep draw calls low (instancing for rollers, scrap), textures ≤ 2K, Draco compression.
