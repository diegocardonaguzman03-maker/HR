import type { Territory, TerritoryId } from '@/types/domain';

// World = 64 × 64 isometric tiles. Two main roads (x = 32, y = 32) cross at the
// Command Citadel. Each quadrant is one territory of Francisco's life.
export const WORLD_SIZE = 64;
export const CITADEL_TILE: [number, number] = [32, 32];

export const TERRITORIES: Territory[] = [
  {
    id: 'industrial',
    name: 'Industrial Citadel',
    tagline: 'Professional work · Heavy industry',
    represents: 'ArcelorMittal / professional work',
    polygon: [[0, 0], [31, 0], [31, 31], [0, 31]],
    center: [16, 16],
    hub: [20, 20],
    palette: { ground: 0x2a2c30, groundAlt: 0x303237, accent: 0xf29a3a, road: 0x45474c },
    plots: [[21, 5], [28, 4], [3, 18], [20, 28], [29, 14]],
  },
  {
    id: 'praxia',
    name: 'Praxia Jungle',
    tagline: 'Entrepreneurship · Intellectual property',
    represents: 'Praxia + personal business building',
    polygon: [[33, 0], [64, 0], [64, 31], [33, 31]],
    center: [48, 15],
    hub: [46, 18],
    palette: { ground: 0x1d3a2a, groundAlt: 0x224331, accent: 0xd8b25a, road: 0x5b5446 },
    plots: [[56, 5], [36, 16], [51, 28], [53, 15]],
  },
  {
    id: 'personal',
    name: 'Personal Sanctuary',
    tagline: 'Life · Health · Finances',
    represents: 'Francisco personally',
    polygon: [[0, 33], [31, 33], [31, 64], [0, 64]],
    center: [16, 48],
    hub: [18, 47],
    palette: { ground: 0x2b3d33, groundAlt: 0x31453a, accent: 0x9fd0c0, road: 0x6b6a60 },
    plots: [[27, 47], [28, 58], [15, 36], [20, 61]],
  },
  {
    id: 'frontier',
    name: 'The Frontier',
    tagline: 'Experiments · Unclassified ideas',
    represents: 'Possibility',
    polygon: [[33, 33], [64, 33], [64, 64], [33, 64]],
    center: [48, 48],
    hub: [45, 46],
    palette: { ground: 0x3a3630, groundAlt: 0x413c35, accent: 0xb8c4cc, road: 0x5c574f },
    plots: [[54, 40], [40, 55], [54, 53], [59, 46], [48, 60], [60, 58]],
  },
];

export const CITADEL_TERRITORY = {
  id: 'citadel' as TerritoryId,
  name: 'Command Citadel',
  center: CITADEL_TILE,
};

/** Road gates where each territory meets the central plaza. */
export const GATES: Record<Exclude<TerritoryId, 'citadel'>, [number, number]> = {
  industrial: [27.6, 27.6],
  praxia: [36.4, 27.6],
  personal: [27.6, 36.4],
  frontier: [36.4, 36.4],
};

/** Plaza ring order (clockwise on screen) — units walk around the Citadel, never through it. */
export const GATE_RING: Exclude<TerritoryId, 'citadel'>[] = ['industrial', 'praxia', 'frontier', 'personal'];

export function territoryById(id: TerritoryId): Territory | undefined {
  return TERRITORIES.find((t) => t.id === id);
}

export function territoryName(id: TerritoryId): string {
  if (id === 'citadel') return CITADEL_TERRITORY.name;
  return territoryById(id)?.name ?? id;
}

export function territoryAt(x: number, y: number): TerritoryId {
  if (Math.abs(x - 32) < 3.5 && Math.abs(y - 32) < 3.5) return 'citadel';
  if (x < 32 && y < 32) return 'industrial';
  if (x >= 32 && y < 32) return 'praxia';
  if (x < 32 && y >= 32) return 'personal';
  return 'frontier';
}
