/**
 * Content of the SAFETY / QUALITY / MAINTENANCE layers.
 * Generic industry-level statements only: no plant procedures, no maintenance
 * frequencies, no operating limits (brief §18–20).
 */
import type { EquipmentId } from '../types/equipment';
import type { LayerId } from '../store/useAppStore';

export interface LayerMarker {
  id: string;
  layer: Extract<LayerId, 'safety' | 'quality' | 'maintenance'>;
  equipment: EquipmentId;
  position: [number, number, number];
  title: string;
  text: string;
}

export const LAYER_MARKERS: LayerMarker[] = [
  // SAFETY — hazard categories
  { id: 's-eaf-molten', layer: 'safety', equipment: 'eaf', position: [-38, 12.5, 4.5], title: 'Molten metal & high temperature', text: 'Liquid steel and slag above 1,600 °C, splashing and radiant heat around the furnace, especially at tapping and slag door operations.' },
  { id: 's-eaf-elec', layer: 'safety', equipment: 'eaf', position: [-42, 13.5, -5], title: 'Electrical energy', text: 'High-voltage furnace transformer and high-current secondary circuit (arms, cables, electrodes). Isolation and energy verification are required before intervention.' },
  { id: 's-eaf-water', layer: 'safety', equipment: 'eaf', position: [-34, 9.5, -4.2], title: 'Water / molten-metal interaction', text: 'Water-cooled panels and roof: a leak into the bath can cause a steam explosion. Wet scrap or wet additions are an equivalent hazard.' },
  { id: 's-eaf-o2', layer: 'safety', equipment: 'eaf', position: [-33.5, 7.8, 3.5], title: 'Oxygen & fuel gas', text: 'Oxygen enrichment increases fire intensity; natural gas burners add explosion hazards. Carbon monoxide is generated in the process.' },
  { id: 's-tap-zone', layer: 'safety', equipment: 'ladle', position: [-33.8, 5.5, 3], title: 'Tapping exclusion zone', text: 'Steel stream and ladle filling: nobody inside the red zone during tapping. Plant-specific distances are defined separately.' },
  { id: 's-crane', layer: 'safety', equipment: 'crane', position: [-6, 20, 3], title: 'Suspended loads', text: 'Full ladles weigh well above 200 t: never stand under a suspended load; crane brakes and limits are safety-critical.' },
  { id: 's-lf-elec', layer: 'safety', equipment: 'ladleFurnace', position: [-18, 10.5, 3], title: 'Electrical energy & arcs', text: 'Ladle furnace arcs, transformer and moving electrode columns.' },
  { id: 's-lf-gas', layer: 'safety', equipment: 'ladleFurnace', position: [-21.5, 2.5, 4], title: 'Inert gas (argon)', text: 'Argon displaces oxygen: accumulation in pits or confined spaces creates an asphyxiation hazard.' },
  { id: 's-tundish', layer: 'safety', equipment: 'tundish', position: [13, 14.5, 2.5], title: 'Molten metal at the casting floor', text: 'Ladle opening, tundish and shroud manipulation expose operators to liquid steel and radiant heat.' },
  { id: 's-mold-bo', layer: 'safety', equipment: 'mold', position: [7, 10.2, 2], title: 'Breakout hazard', text: 'If the shell ruptures below the mold, liquid steel escapes: the area under the mold is an exclusion zone during casting.' },
  { id: 's-mold-water', layer: 'safety', equipment: 'coolingSystem', position: [5, 8, 4], title: 'Loss of mold cooling', text: 'Loss of mold water with liquid steel inside is a critical hazard: emergency water and casting stop logic are safety systems.' },
  { id: 's-segments', layer: 'safety', equipment: 'segments', position: [22, 3.5, 2.5], title: 'Moving machinery & stored energy', text: 'Driven rolls, pinch points, hydraulic pressure and the weight of segments and dummy bar (gravity).' },
  { id: 's-hydraulic', layer: 'safety', equipment: 'mold', position: [7.8, 9.2, -1.8], title: 'Hydraulic systems', text: 'Oscillation and segment hydraulics store energy that must be released before intervention.' },
  { id: 's-cutter', layer: 'safety', equipment: 'torchCutter', position: [38.8, 3.6, 2.2], title: 'Oxy-fuel gases & hot slag', text: 'Oxygen and fuel gas lines, cutting sparks and slag, moving torch car.' },
  { id: 's-slab', layer: 'safety', equipment: 'slab', position: [50, 2.8, 2], title: 'Hot, heavy product', text: 'Slabs of several tonnes at high temperature on moving tables and transfers.' },

  // QUALITY — multi-parameter relationships
  { id: 'q-eaf-chem', layer: 'quality', equipment: 'eaf', position: [-40, 10.5, 3.5], title: 'Chemistry & residuals', text: 'Scrap selection, DRI share and slag practice together define residual elements, phosphorus and nitrogen at tapping.' },
  { id: 'q-tap-slag', layer: 'quality', equipment: 'ladle', position: [-31.5, 6.2, -2.5], title: 'Slag carry-over', text: 'Furnace slag reaching the ladle can revert phosphorus and increase oxide inclusions; tapping practice, taphole condition and slag detection interact.' },
  { id: 'q-lf', layer: 'quality', equipment: 'ladleFurnace', position: [-15, 7.5, 2.5], title: 'Cleanliness & castability', text: 'Deoxidation, desulfurization, argon stirring and calcium treatment together control inclusions and nozzle clogging downstream.' },
  { id: 'q-tundish', layer: 'quality', equipment: 'tundish', position: [8, 14.6, -2], title: 'Superheat & flow', text: 'Superheat, tundish level and flow control devices influence inclusion flotation and the solidification structure.' },
  { id: 'q-mold', layer: 'quality', equipment: 'mold', position: [10.6, 12.6, 1.5], title: 'Mold level, powder & oscillation', text: 'Level stability, powder behaviour, oscillation, casting speed and superheat interact to form the initial shell and the slab surface.' },
  { id: 'q-cooling', layer: 'quality', equipment: 'coolingSystem', position: [14, 4, 2.5], title: 'Secondary cooling', text: 'Spray intensity and uniformity affect surface temperature, reheating and crack sensitivity; no single parameter explains a defect.' },
  { id: 'q-straight', layer: 'quality', equipment: 'segments', position: [19, 3.2, -2.5], title: 'Straightening & roll alignment', text: 'Surface temperature at straightening, roll gap and alignment act together on transverse cracks, bulging and internal cracks.' },
  { id: 'q-centre', layer: 'quality', equipment: 'segments', position: [32, 2.6, 2], title: 'Final solidification', text: 'Position and conditions of final solidification influence centre segregation and porosity.' },
  { id: 'q-slab', layer: 'quality', equipment: 'slab', position: [47, 2.6, -2], title: 'Inspection & traceability', text: 'Slab identification links surface and internal quality to the heat chemistry and casting conditions.' },

  // MAINTENANCE — critical components (no frequencies)
  { id: 'm-electrodes', layer: 'maintenance', equipment: 'eaf', position: [-37, 16.5, 1.2], title: 'Electrodes & joints', text: 'Joint integrity, breakage and consumption; column clamps and regulation hydraulics.' },
  { id: 'm-panels', layer: 'maintenance', equipment: 'eaf', position: [-41.8, 8.6, 0], title: 'Water-cooled panels', text: 'Leaks, cracks and slag build-up; flow and temperature monitoring of every circuit.' },
  { id: 'm-ebt', layer: 'maintenance', equipment: 'eaf', position: [-34.2, 6.8, 1.5], title: 'EBT & hearth refractory', text: 'Taphole wear, filling sand behaviour and hearth refractory condition.' },
  { id: 'm-ladle', layer: 'maintenance', equipment: 'ladle', position: [-18, 6.5, -3], title: 'Ladle refractory, slide gate & plug', text: 'Lining wear, slide gate plates and porous plug permeability.' },
  { id: 'm-crane', layer: 'maintenance', equipment: 'crane', position: [-10, 23.5, -3], title: 'Crane hooks, ropes & brakes', text: 'Safety-critical hoisting components with defined rejection criteria (OEM / standards).' },
  { id: 'm-turret', layer: 'maintenance', equipment: 'turret', position: [5, 15.5, -2.5], title: 'Turret bearing & load cells', text: 'Slewing bearing, drive, locking and weighing accuracy.' },
  { id: 'm-mold', layer: 'maintenance', equipment: 'mold', position: [8.2, 12.9, -1.5], title: 'Copper plates & taper', text: 'Plate wear, coating condition and taper; water channels and thermocouples.' },
  { id: 'm-rolls', layer: 'maintenance', equipment: 'segments', position: [15, 7.6, -2.2], title: 'Rolls, bearings & gap', text: 'Roll gap, alignment, bearing condition and roll surface.' },
  { id: 'm-nozzles', layer: 'maintenance', equipment: 'coolingSystem', position: [12.5, 6.4, -2.5], title: 'Spray nozzles', text: 'Clogging and pattern deviation directly change local cooling.' },
  { id: 'm-emergency', layer: 'maintenance', equipment: 'coolingSystem', position: [2, 19.5, 9], title: 'Emergency water system', text: 'Automatic switchover, tank level and backup pumps must be proven by testing.' },
  { id: 'm-cutter', layer: 'maintenance', equipment: 'torchCutter', position: [37.5, 4.2, -1.5], title: 'Torches & gas train', text: 'Nozzle condition, gas train integrity and car synchronisation.' },
];
