# Data model

## Types (`src/types/process.ts`)
- `SimState`: the 20 states (IDLE + 19 steps).
- `MaterialState`: 11 states, from *Solid raw material* to *Slab*.
- `ProcessStepConfig`: state, title, stage, enabled/optional, duration, camera, activeEquipment, materialStates, whatHappens, why.
- `ProcessValue`: `{ value, unit, decimals, label, simulated }`.
- `ProcessSnapshot`: `{ state, progress, heatId, materialState, location, currentEquipment, steelTemperature, variables: Record<string, ProcessValue>, strand: { castLength, solidificationFront, cutCount } }`.

## Provider interface (`src/sim/ProcessDataProvider.ts`)
```ts
interface ProcessDataProvider {
  id: string;
  label: string;
  simulated: boolean;          // true → UI shows SIMULATED TRAINING DATA
  getSnapshot(state: SimState, progress: number): ProcessSnapshot;
}
```
`SimulationDataProvider` computes every value from the state and progress only (no randomness), so the same moment always shows the same numbers.

## Variable keys
`eaf.power`, `eaf.powerOnTime`, `eaf.energy`, `eaf.bathTemperature`, `eaf.meltedFraction`, `eaf.carbon`, `eaf.oxygen`, `ladle.steelWeight`, `ladle.temperature`, `lf.*`, `tundish.weight`, `tundish.temperature`, `cc.superheat`, `cc.castingSpeed`, `mold.level`, `mold.waterDeltaT`, `mold.oscillationFreq`, `cc.shellThicknessMoldExit`, `cc.specificWater`, `cc.surfaceTemp`, `cc.shellAtHead`, `cc.solidificationProgress`, `cc.metallurgicalLength`, `cutter.slabLength`, `slab.weight`.

Equipment `processVariables[].key` points at these keys; the Info panel shows the live value next to the training range.

## UI state (`src/store/useAppStore.ts`)
Mode, play/speed/step, selection and hover, component mode and explode factor, X-ray, learning level, layers, camera requests, panels (navigator, help, layers, minimap), solidification section position.
