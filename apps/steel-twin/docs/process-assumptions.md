# Process assumptions and value classification

All values are **SIMULATED TRAINING DATA**. Each value carries one classification:

| Classification | Meaning |
|---|---|
| **INDUSTRY STANDARD** | Typical range published for EAF / LF / slab casting practice |
| **CONFIGURABLE** | Parameter that changes by plant and grade; set in `src/config` or `src/sim` |
| **PLANT-SPECIFIC** | Must be supplied by GASM Engineering before use in real training |
| **ASSUMPTION** | Value chosen for the learning model; not validated |

Detailed tables written by the expert agents (operations/metallurgy, safety, quality):
- [assumptions/eaf-secondary.md](assumptions/eaf-secondary.md): raw materials, EAF, tapping, LF, crane
- [assumptions/caster.md](assumptions/caster.md): turret, tundish, mold, strand, cooling, cutting, slab
- [equipment/eaf-secondary.md](equipment/eaf-secondary.md) and [equipment/caster.md](equipment/caster.md): equipment notes

## Model-level assumptions (sim/)
| Item | Value | Class |
|---|---|---|
| Slab section | 230 × 1,500 mm | CONFIGURABLE |
| Casting speed | 1.2 m/min | CONFIGURABLE |
| Solidification law | e = K·√t, K = 22 mm/√min | ASSUMPTION (typical K for slabs: 20–30 mm/√min, INDUSTRY STANDARD) |
| Metallurgical length | ≈ 32.8 m (derived: (115/22)² min × 1.2 m/min) | ASSUMPTION |
| Machine radius | 9.5 m, vertical section 0.8 m | CONFIGURABLE |
| Torch cut position | 36 m from meniscus | ASSUMPTION |
| Slab length | 10 m | CONFIGURABLE |
| Heat size | ≈ 150 t | ASSUMPTION |
| Tapping temperature | ≈ 1,635 °C | ASSUMPTION (industry range) |
| Tundish superheat | 20–35 °C | INDUSTRY STANDARD |
| Surface / centre temperature curves | smooth interpolations for visualisation | ASSUMPTION |

## What the app does **not** contain
- No plant operating procedures, alarm limits, maintenance frequencies or lock-out steps. Safety, quality and maintenance layers only name the hazard or check point and refer to the plant's controlled documents.
- Values must be replaced by GASM **PLANT-SPECIFIC** data and validated by `experto-operativo-metalurgia` before use in certification.
