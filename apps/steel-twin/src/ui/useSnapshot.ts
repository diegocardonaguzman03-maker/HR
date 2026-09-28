import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { steps } from '../sim/clock';
import { simulationProvider } from '../sim/SimulationDataProvider';
import type { ProcessDataProvider } from '../sim/ProcessDataProvider';

/** Active data provider. Swap for a RealtimePlantDataProvider in the future. */
export const dataProvider: ProcessDataProvider = simulationProvider;

/** UI-rate snapshot of the process (updates ~10×/s). */
export function useSnapshot() {
  const stepIndex = useAppStore((s) => s.stepIndex);
  const uiTime = useAppStore((s) => s.uiTime);
  return useMemo(() => {
    const all = steps();
    const step = all[Math.min(stepIndex, all.length - 1)];
    const progress = Math.min(1, uiTime / step.duration);
    return { step, stepIndex, total: all.length, progress, snap: dataProvider.getSnapshot(step.state, progress), next: all[stepIndex + 1] ?? null };
  }, [stepIndex, uiTime]);
}

export const fmt = (v: number, d = 0) =>
  v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
