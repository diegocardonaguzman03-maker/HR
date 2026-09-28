/**
 * Data-provider abstraction (section 28).
 * The UI and the 3D scene only depend on this interface, never on the source.
 *   - SimulationDataProvider  → deterministic educational values (today)
 *   - RealtimePlantDataProvider → future: PLC / Level 2 / historian / MES / APIs (not connected)
 */
import type { ProcessSnapshot, SimState } from '../types/process';

export interface ProcessDataProvider {
  readonly id: string;
  readonly label: string;
  /** true when values are synthetic training data. */
  readonly simulated: boolean;
  getSnapshot(state: SimState, progress: number): ProcessSnapshot;
}

/**
 * Placeholder for a future real-time provider. Intentionally not implemented:
 * no production system is connected in this prototype.
 */
export class RealtimePlantDataProvider implements ProcessDataProvider {
  readonly id = 'realtime';
  readonly label = 'Real-time plant data (not connected)';
  readonly simulated = false;
  getSnapshot(): ProcessSnapshot {
    throw new Error('RealtimePlantDataProvider is not connected in this prototype (see docs/future-integrations.md).');
  }
}
