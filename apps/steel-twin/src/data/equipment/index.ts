/** Registry of equipment technical content (single source for the UI). */
import type { EquipmentData, EquipmentId } from '../../types/equipment';
import { rawMaterials } from './rawMaterials';
import { eaf } from './eaf';
import { ladle } from './ladle';
import { ladleFurnace } from './ladleFurnace';
import { crane } from './crane';
import { turret } from './turret';
import { tundish } from './tundish';
import { mold } from './mold';
import { segments } from './segments';
import { coolingSystem } from './coolingSystem';
import { torchCutter } from './torchCutter';
import { slab } from './slab';

export const EQUIPMENT: Record<EquipmentId, EquipmentData> = {
  rawMaterials, eaf, ladle, ladleFurnace, crane, turret, tundish, mold, segments, coolingSystem, torchCutter, slab,
};

export const equipmentName = (id: EquipmentId) => EQUIPMENT[id]?.name ?? id;
