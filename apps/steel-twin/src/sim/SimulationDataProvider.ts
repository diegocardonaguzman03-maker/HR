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
  IDLE: 'Sin iniciar',
  RAW_MATERIALS: 'Patio de chatarra y silo de HRD',
  CHARGING: 'Canasta de carga → horno',
  ARC_IGNITION: 'Dentro del horno',
  MELTING: 'Dentro del horno',
  REFINING: 'Baño bajo escoria espumosa',
  TAPPING: 'Chorro de piquera EBT → olla',
  SECONDARY_METALLURGY: 'Olla en el horno olla',
  VACUUM_TREATMENT: 'Olla en la estación de vacío',
  TRANSFER: 'Olla en la grúa de colada',
  TURRET: 'Olla en la torreta',
  TUNDISH_FILL: 'Tubo protector → distribuidor',
  MOLD_FILL: 'Buza sumergida → molde',
  SHELL_FORMATION: 'Molde de cobre',
  SECONDARY_COOLING: 'Barra: zonas de aspersión',
  SOLIDIFICATION: 'Barra: arco',
  STRAIGHTENING: 'Barra: zona de enderezado',
  FINAL_SOLIDIFICATION: 'Barra: segmentos horizontales',
  CUTTING: 'Máquina de oxicorte',
  COMPLETE: 'Mesa de salida → patio de planchones',
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
  readonly label = 'Datos simulados de capacitación';
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
      vars['eaf.power'] = v('Potencia activa', state === 'ARC_IGNITION' ? lerp(20, 70, p) : state === 'MELTING' ? 118 : state === 'REFINING' ? 112 : 0, 'MW');
      vars['eaf.powerOnTime'] = v('Tiempo con arco', pon, 'min');
      vars['eaf.energy'] = v('Energía específica', (pon / 42) * 560, 'kWh/t');
      vars['eaf.bathTemperature'] = v('Temperatura del baño', steelT, '°C');
      vars['eaf.meltedFraction'] = v('Fracción fundida', melt * 100, '%');
      vars['eaf.carbon'] = v('Carbono del baño', state === 'REFINING' ? lerp(0.25, 0.06, p) : state === 'TAPPING' ? 0.06 : lerp(1.8, 0.25, melt), '%', 2);
      vars['eaf.oxygen'] = v('Oxígeno inyectado', state === 'REFINING' ? lerp(24, 36, p) : lerp(0, 24, melt), 'Nm³/t', 1);
    }
    // ── Ladle / LF
    if (['TAPPING', 'SECONDARY_METALLURGY', 'VACUUM_TREATMENT', 'TRANSFER', 'TURRET', 'TUNDISH_FILL'].includes(state)) {
      const w = state === 'TAPPING' ? lerp(0, 150, (p - 0.2) / 0.7) : state === 'TUNDISH_FILL' ? lerp(150, 110, p) : 150;
      vars['ladle.steelWeight'] = v('Acero en la olla', w, 't');
      vars['ladle.temperature'] = v('Temperatura en olla', steelT, '°C');
    }
    if (state === 'SECONDARY_METALLURGY') {
      vars['lf.temperature'] = v('Temperatura en horno olla', steelT, '°C');
      vars['lf.treatmentTime'] = v('Tiempo de tratamiento', lerp(0, 40, p), 'min');
      vars['lf.sulfur'] = v('Azufre', lerp(0.03, 0.008, p), '%', 3);
      vars['lf.aluminium'] = v('Aluminio soluble', lerp(0.01, 0.035, p), '%', 3);
      vars['lf.argonFlow'] = v('Flujo de argón', p < 0.7 ? 450 : 100, 'NL/min');
    }
    // ── Tundish / mold / strand
    if (['TUNDISH_FILL', 'MOLD_FILL', 'SHELL_FORMATION', 'SECONDARY_COOLING', 'SOLIDIFICATION', 'STRAIGHTENING', 'FINAL_SOLIDIFICATION', 'CUTTING'].includes(state)) {
      const castingOn = state !== 'TUNDISH_FILL';
      vars['tundish.weight'] = v('Peso en distribuidor', state === 'TUNDISH_FILL' ? lerp(0, 42, p) : 42, 't');
      vars['tundish.temperature'] = v('Temperatura en distribuidor', state === 'TUNDISH_FILL' ? steelT : 1550, '°C');
      vars['cc.superheat'] = v('Sobrecalentamiento', (state === 'TUNDISH_FILL' ? steelT : 1550) - 1525, '°C');
      vars['cc.castingSpeed'] = v('Velocidad de colada', !castingOn ? 0 : state === 'MOLD_FILL' ? 0 : state === 'SHELL_FORMATION' ? lerp(0.3, 1.0, p) : SOLID_MODEL.castingSpeed, 'm/min', 2);
      if (castingOn) {
        vars['mold.level'] = v('Desviación de nivel en molde', state === 'MOLD_FILL' ? lerp(-60, 0, p) : 1.2 * Math.sin(p * 40), 'mm', 1);
        vars['mold.waterDeltaT'] = v('ΔT del agua del molde', state === 'MOLD_FILL' ? lerp(0, 6, p) : 7.5, '°C', 1);
        vars['mold.oscillationFreq'] = v('Frecuencia de oscilación', state === 'MOLD_FILL' ? 0 : 160, 'cpm');
        vars['cc.shellThicknessMoldExit'] = v('Costra a la salida del molde', shellThickness(0.8), 'mm');
      }
      if (headS > 1) {
        vars['cc.specificWater'] = v('Agua específica', 1.0, 'L/kg', 2);
        vars['cc.surfaceTemp'] = v('Temp. superficial en la cabeza', surfaceTemperature(headS), '°C');
        vars['cc.shellAtHead'] = v('Espesor de costra en la cabeza', shellThickness(headS) * 2 >= 230 ? 115 : shellThickness(headS), 'mm');
        vars['cc.solidificationProgress'] = v('Solidificado a lo largo de la barra', Math.min(100, (headS / lm) * 100), '%');
        vars['cc.metallurgicalLength'] = v('Longitud metalúrgica', lm, 'm', 1);
      }
    }
    if (state === 'CUTTING' || state === 'COMPLETE') {
      vars['cutter.slabLength'] = v('Largo del planchón', 10, 'm', 1);
      vars['cc.castingSpeed'] = v('Velocidad de colada', SOLID_MODEL.castingSpeed, 'm/min', 2);
      vars['slab.weight'] = v('Peso del planchón (230 × 1,500 mm)', 0.23 * 1.5 * 10 * 7.8, 't', 1);
    }

    return {
      state,
      progress: p,
      heatId: 'COLADA 26-4718 (simulada)',
      materialState: materialState(state, p, headS),
      location: LOCATION[state],
      currentEquipment: EQUIPMENT[state],
      steelTemperature: v('Temperatura del acero', steelT, '°C'),
      variables: vars,
      strand: { castLength, solidificationFront: Math.min(castLength, lm), cutCount: state === 'COMPLETE' || (state === 'CUTTING' && p > 0.85) ? 1 : 0 },
    };
  }
}

function isAfterCaster(state: SimState) {
  return state === 'COMPLETE';
}

export const simulationProvider = new SimulationDataProvider();
