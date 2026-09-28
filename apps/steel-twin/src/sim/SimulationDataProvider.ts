/**
 * Deterministic educational process values — SIMULATED TRAINING DATA.
 * Numbers follow the reference configuration only as orders of magnitude.
 * They are NOT operating limits of any real plant.
 */
import type { MaterialState, ProcessSnapshot, ProcessValue, SimState } from '../types/process';
import type { EquipmentId } from '../types/equipment';
import { STRAND_RANGE } from '../config/processConfig';
import { metallurgicalLength, shellThickness, surfaceTemperature, SOLID_MODEL } from './solidification';
import type { ProcessDataProvider } from './ProcessDataProvider';

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));
const v = (label: string, value: number, unit: string, decimals = 0): ProcessValue => ({ label, value, unit, decimals, simulated: true });

/** Steel (bath) temperature path, °C. */
const TEMP: Partial<Record<SimState, [number, number]>> = {
  ARC_IGNITION: [25, 400],
  MELTING: [400, 1560],
  REFINING: [1560, 1635],
  TAPPING: [1635, 1590],
  SECONDARY_METALLURGY: [1585, 1600],
  VACUUM_TREATMENT: [1600, 1580],
  TRANSFER: [1600, 1590],
  TURRET: [1590, 1585],
  TUNDISH_FILL: [1570, 1552],
  MOLD_FILL: [1550, 1550],
  SHELL_FORMATION: [1550, 1549],
};

const LOCATION: Record<SimState, string> = {
  IDLE: 'Not started',
  RAW_MATERIALS: 'Scrap yard & DRI silo',
  CHARGING: 'Charging bucket → EAF',
  ARC_IGNITION: 'Inside the EAF',
  MELTING: 'Inside the EAF',
  REFINING: 'EAF bath under foamy slag',
  TAPPING: 'EBT stream → ladle',
  SECONDARY_METALLURGY: 'Ladle at the ladle furnace',
  VACUUM_TREATMENT: 'Ladle at the vacuum station',
  TRANSFER: 'Ladle on the casting crane',
  TURRET: 'Ladle on the turret',
  TUNDISH_FILL: 'Ladle shroud → tundish',
  MOLD_FILL: 'SEN → mold',
  SHELL_FORMATION: 'Copper mold',
  SECONDARY_COOLING: 'Strand — spray zones',
  SOLIDIFICATION: 'Strand — bow',
  STRAIGHTENING: 'Strand — straightening zone',
  FINAL_SOLIDIFICATION: 'Strand — horizontal segments',
  CUTTING: 'Torch cutting machine',
  COMPLETE: 'Run-out table → slab yard',
};

const EQUIPMENT: Record<SimState, EquipmentId | null> = {
  IDLE: null, RAW_MATERIALS: 'rawMaterials', CHARGING: 'eaf', ARC_IGNITION: 'eaf', MELTING: 'eaf', REFINING: 'eaf',
  TAPPING: 'eaf', SECONDARY_METALLURGY: 'ladleFurnace', VACUUM_TREATMENT: 'ladle', TRANSFER: 'crane', TURRET: 'turret',
  TUNDISH_FILL: 'tundish', MOLD_FILL: 'mold', SHELL_FORMATION: 'mold', SECONDARY_COOLING: 'coolingSystem',
  SOLIDIFICATION: 'segments', STRAIGHTENING: 'segments', FINAL_SOLIDIFICATION: 'segments', CUTTING: 'torchCutter', COMPLETE: 'slab',
};

function materialState(state: SimState, p: number, headS: number): MaterialState {
  switch (state) {
    case 'IDLE': case 'RAW_MATERIALS': case 'CHARGING': return 'SOLID_RAW_MATERIAL';
    case 'ARC_IGNITION': return p < 0.5 ? 'SOLID_RAW_MATERIAL' : 'PARTIALLY_MELTED';
    case 'MELTING': return p < 0.8 ? 'PARTIALLY_MELTED' : 'LIQUID_STEEL';
    case 'REFINING': return p < 0.5 ? 'LIQUID_STEEL' : 'REFINED_LIQUID_STEEL';
    case 'TAPPING': return p < 0.3 ? 'REFINED_LIQUID_STEEL' : 'LIQUID_IN_LADLE';
    case 'SECONDARY_METALLURGY': case 'VACUUM_TREATMENT': case 'TRANSFER': case 'TURRET': return 'LIQUID_IN_LADLE';
    case 'TUNDISH_FILL': return p < 0.25 ? 'LIQUID_IN_LADLE' : 'LIQUID_IN_TUNDISH';
    case 'MOLD_FILL': return 'LIQUID_IN_MOLD';
    case 'SHELL_FORMATION': case 'SECONDARY_COOLING': return 'THIN_SHELL_LIQUID_CORE';
    case 'SOLIDIFICATION': case 'STRAIGHTENING': return headS < 10 ? 'THIN_SHELL_LIQUID_CORE' : 'THICK_SHELL_REDUCED_CORE';
    case 'FINAL_SOLIDIFICATION': return headS < metallurgicalLength() - 3 ? 'THICK_SHELL_REDUCED_CORE' : 'FINAL_SOLIDIFICATION';
    default: return 'SOLID_SLAB';
  }
}

export class SimulationDataProvider implements ProcessDataProvider {
  readonly id = 'simulation';
  readonly label = 'Simulated training data';
  readonly simulated = true;

  getSnapshot(state: SimState, progress: number): ProcessSnapshot {
    const p = Math.min(1, Math.max(0, progress));
    const range = STRAND_RANGE[state];
    const castLength = range ? lerp(range[0], range[1], p) : isAfterCaster(state) ? 46 : 0;
    const lm = metallurgicalLength();
    const headS = castLength;
    const temps = TEMP[state];
    const steelT = temps
      ? lerp(temps[0], temps[1], p)
      : state === 'RAW_MATERIALS' || state === 'CHARGING' || state === 'IDLE'
        ? 25
        : Math.round(surfaceTemperature(Math.min(headS, 45)));

    const vars: Record<string, ProcessValue> = {};
    // ── EAF
    const melt = state === 'MELTING' ? p : ['REFINING', 'TAPPING'].includes(state) ? 1 : state === 'ARC_IGNITION' ? 0.03 * p : 0;
    const powerOn = { ARC_IGNITION: lerp(0, 2, p), MELTING: lerp(2, 32, p), REFINING: lerp(32, 42, p) } as Partial<Record<SimState, number>>;
    if (['CHARGING', 'ARC_IGNITION', 'MELTING', 'REFINING', 'TAPPING'].includes(state)) {
      const pon = powerOn[state] ?? (state === 'TAPPING' ? 42 : 0);
      vars['eaf.power'] = v('Active power', state === 'ARC_IGNITION' ? lerp(20, 70, p) : state === 'MELTING' ? 118 : state === 'REFINING' ? 112 : 0, 'MW');
      vars['eaf.powerOnTime'] = v('Power-on time', pon, 'min');
      vars['eaf.energy'] = v('Specific energy', (pon / 42) * 560, 'kWh/t');
      vars['eaf.bathTemperature'] = v('Bath temperature', steelT, '°C');
      vars['eaf.meltedFraction'] = v('Melted fraction', melt * 100, '%');
      vars['eaf.carbon'] = v('Bath carbon', state === 'REFINING' ? lerp(0.25, 0.06, p) : state === 'TAPPING' ? 0.06 : lerp(1.8, 0.25, melt), '%', 2);
      vars['eaf.oxygen'] = v('Oxygen injected', state === 'REFINING' ? lerp(24, 36, p) : lerp(0, 24, melt), 'Nm³/t', 1);
    }
    // ── Ladle / LF
    if (['TAPPING', 'SECONDARY_METALLURGY', 'VACUUM_TREATMENT', 'TRANSFER', 'TURRET', 'TUNDISH_FILL'].includes(state)) {
      const w = state === 'TAPPING' ? lerp(0, 150, (p - 0.2) / 0.7) : state === 'TUNDISH_FILL' ? lerp(150, 110, p) : 150;
      vars['ladle.steelWeight'] = v('Steel in ladle', w, 't');
      vars['ladle.temperature'] = v('Ladle temperature', steelT, '°C');
    }
    if (state === 'SECONDARY_METALLURGY') {
      vars['lf.temperature'] = v('LF temperature', steelT, '°C');
      vars['lf.treatmentTime'] = v('Treatment time', lerp(0, 40, p), 'min');
      vars['lf.sulfur'] = v('Sulfur', lerp(0.03, 0.008, p), '%', 3);
      vars['lf.aluminium'] = v('Soluble aluminium', lerp(0.01, 0.035, p), '%', 3);
      vars['lf.argonFlow'] = v('Argon flow', p < 0.7 ? 450 : 100, 'NL/min');
    }
    // ── Tundish / mold / strand
    if (['TUNDISH_FILL', 'MOLD_FILL', 'SHELL_FORMATION', 'SECONDARY_COOLING', 'SOLIDIFICATION', 'STRAIGHTENING', 'FINAL_SOLIDIFICATION', 'CUTTING'].includes(state)) {
      const castingOn = state !== 'TUNDISH_FILL';
      vars['tundish.weight'] = v('Tundish weight', state === 'TUNDISH_FILL' ? lerp(0, 42, p) : 42, 't');
      vars['tundish.temperature'] = v('Tundish temperature', state === 'TUNDISH_FILL' ? steelT : 1550, '°C');
      vars['cc.superheat'] = v('Superheat', (state === 'TUNDISH_FILL' ? steelT : 1550) - 1525, '°C');
      vars['cc.castingSpeed'] = v('Casting speed', !castingOn ? 0 : state === 'MOLD_FILL' ? 0 : state === 'SHELL_FORMATION' ? lerp(0.3, 1.0, p) : SOLID_MODEL.castingSpeed, 'm/min', 2);
      if (castingOn) {
        vars['mold.level'] = v('Mold level deviation', state === 'MOLD_FILL' ? lerp(-60, 0, p) : 1.2 * Math.sin(p * 40), 'mm', 1);
        vars['mold.waterDeltaT'] = v('Mold water ΔT', state === 'MOLD_FILL' ? lerp(0, 6, p) : 7.5, '°C', 1);
        vars['mold.oscillationFreq'] = v('Oscillation frequency', state === 'MOLD_FILL' ? 0 : 160, 'cpm');
        vars['cc.shellThicknessMoldExit'] = v('Shell at mold exit', shellThickness(0.8), 'mm');
      }
      if (headS > 1) {
        vars['cc.specificWater'] = v('Specific water', 1.0, 'L/kg', 2);
        vars['cc.surfaceTemp'] = v('Surface temp. at strand head', surfaceTemperature(headS), '°C');
        vars['cc.shellAtHead'] = v('Shell thickness at strand head', shellThickness(headS) * 2 >= 230 ? 115 : shellThickness(headS), 'mm');
        vars['cc.solidificationProgress'] = v('Solidified along strand', Math.min(100, (headS / lm) * 100), '%');
        vars['cc.metallurgicalLength'] = v('Metallurgical length', lm, 'm', 1);
      }
    }
    if (state === 'CUTTING' || state === 'COMPLETE') {
      vars['cutter.slabLength'] = v('Slab length', 10, 'm', 1);
      vars['cc.castingSpeed'] = v('Casting speed', SOLID_MODEL.castingSpeed, 'm/min', 2);
      vars['slab.weight'] = v('Slab weight (230 × 1,500 mm)', 0.23 * 1.5 * 10 * 7.8, 't', 1);
    }

    return {
      state,
      progress: p,
      heatId: 'HEAT 26-4718 (simulated)',
      materialState: materialState(state, p, headS),
      location: LOCATION[state],
      currentEquipment: EQUIPMENT[state],
      steelTemperature: v('Steel temperature', steelT, '°C'),
      variables: vars,
      strand: { castLength, solidificationFront: Math.min(castLength, lm), cutCount: state === 'COMPLETE' || (state === 'CUTTING' && p > 0.85) ? 1 : 0 },
    };
  }
}

function isAfterCaster(state: SimState) {
  return state === 'COMPLETE';
}

export const simulationProvider = new SimulationDataProvider();
