/**
 * Non-reactive simulation clock. The 3D scene reads it every frame without
 * triggering React renders; the UI store mirrors it at a low rate.
 */
import { enabledSteps } from '../config/processConfig';
import type { ProcessStepConfig } from '../types/process';

export const clock = {
  stepIndex: 0,
  stepTime: 0,
  playing: false,
  speed: 1,
  /** Total elapsed simulated seconds (drives looping animations). */
  elapsed: 0,
};

export const steps = (): ProcessStepConfig[] => enabledSteps();

export function currentStep(): ProcessStepConfig {
  const s = steps();
  return s[Math.min(clock.stepIndex, s.length - 1)];
}

export function stepProgress(): number {
  const st = currentStep();
  return Math.min(1, clock.stepTime / st.duration);
}

/** Index of the first step of a given state; -1 if disabled. */
export function indexOfState(state: string): number {
  return steps().findIndex((s) => s.state === state);
}

/** Whether the current step is at or after the given state. */
export function reached(state: string): boolean {
  const i = indexOfState(state);
  return i >= 0 && clock.stepIndex >= i;
}
