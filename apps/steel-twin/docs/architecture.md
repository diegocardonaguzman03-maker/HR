# Architecture

**Stack:** Vite 5 · React 18 · TypeScript 5 (strict) · three.js 0.169 · @react-three/fiber 8 · @react-three/drei 9 · zustand 4 · Tailwind CSS 4.

```
src/
  config/      layout.ts (positions, dimensions, camera presets) · processConfig.ts (steps, stages, strand ranges)
  types/       equipment.ts · process.ts
  data/        equipment/*.ts (one file per machine) · layerMarkers.ts
  sim/         clock · kinematics · strandPath · solidification · ProcessDataProvider · SimulationDataProvider
  store/       useAppStore.ts (UI state, zustand)
  scene/       Experience.tsx (canvas, camera rig, driver) · equipment/* · overlays/* · common/*
  ui/          TopBar · Timeline · InfoPanel · Navigator · ViewportOverlays · game/HUD · game/input
```

## Principles
1. **Data separated from 3D.** Descriptions, variables, hazards and specifications live in `src/data`; the scene only reads ids.
2. **Deterministic simulation.** `sim/clock.ts` holds a mutable, non-reactive clock (step index, step time, speed). `SimulationDriver` advances it inside `useFrame`; every animated object derives its pose from `currentPose()` in `sim/kinematics.ts`. The same step and progress always give the same scene, so NEXT / PREV / seek are exact.
3. **UI at 10 Hz.** The driver calls `syncFromClock()` ten times per second; React panels re-render from the store, never per frame.
4. **Pluggable data.** Panels read values through `ProcessDataProvider.getSnapshot(state, progress)`. Today it is `SimulationDataProvider`; `RealtimePlantDataProvider` is the stub for a future plant connection.
5. **Equipment wrapper.** `EquipmentGroup` provides raycast hover/click, highlight, isolation (component mode), X-ray transparency and the Equipment layer. `Part` marks sub-components and their exploded-view offset.

## Frame loop
`SimulationDriver` (advance clock) → equipment components read `currentPose()` → `CameraRig` handles presets, equipment framing, follow mode and WASD flight → every 100 ms `syncFromClock()` updates the HUD.

## Build targets
`npm run build` produces chunked output in `dist/`; `npm run build:share` (vite `--mode share` with `vite-plugin-singlefile`) produces one HTML file for the shareable link.
