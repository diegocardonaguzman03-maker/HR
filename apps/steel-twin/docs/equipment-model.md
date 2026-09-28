# Equipment model

Each machine is a TypeScript object of type `EquipmentData` (`src/types/equipment.ts`) in `src/data/equipment/<id>.ts`, registered in `src/data/equipment/index.ts`.

**Equipment ids:** `rawMaterials`, `eaf`, `ladle`, `ladleFurnace`, `crane`, `turret`, `tundish`, `mold`, `segments`, `coolingSystem`, `torchCutter`, `slab`.

| Field | Used by |
|---|---|
| `name`, `shortName`, `tooltip` | hover tooltip, chips, minimap |
| `description`, `purpose`, `howItWorks[]` | Info panel L1–L2 |
| `inputs`, `outputs` | Info panel L2 |
| `components[]` (`id`, `name`, `function`) | component mode; ids match `<Part id>` in the 3D model |
| `processVariables[]` (`key`, `unit`, `role`, `trainingRange`, `classification`) | Info panel L3; `key` matches a snapshot variable |
| `whatCanGoWrong[]` | L4 |
| `impact` (safety, quality, reliability, productivity), `qualityImpact`, `safetyHazards`, `maintenancePoints` | L5 and layers |
| `specifications[]`, `references[]` | Specs tab |

## Adding a machine
1. Add the id to `EquipmentId`.
2. Create `src/data/equipment/<id>.ts` and register it.
3. Build the 3D proxy inside `<EquipmentGroup id="<id>">`, wrap sub-components in `<Part id="…" explode={[x,y,z]}>`.
4. Reference it in `activeEquipment` of the relevant steps and, optionally, add a camera preset.

## Mesh flags (`userData`)
`steel` (process material, never highlighted) · `xray` (turns transparent in X-ray) · `noPick` (ignored by raycasting) · `alwaysVisible` · `hiddenByLogic`.
