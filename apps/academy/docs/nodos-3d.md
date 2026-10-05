# Nodos 3D del modelo EAF (contrato con `public/models/eaf.nodes.json`)

El GLB `public/models/eaf.glb` lo genera `npm run model`. Cada nodo de primer nivel corresponde a un sistema (`eq.*`) y sus hijos a componentes (`cmp.*`).

| Sistema | Nodo | Subnodos de componente |
|---|---|---|
| Coraza y solera | `eaf__shell` | `eaf__shell_upper`, `eaf__shell_hearth` |
| Bóveda | `eaf__roof` | `eaf__roof_delta` |
| Electrodos | `eaf__electrodes` | `eaf__electrodes_column`, `eaf__electrodes_joint`, `eaf__electrodes_tip` |
| Brazos y mástiles | `eaf__arms` | `eaf__arms_clamp`, `eaf__arms_mast`, `eaf__arms_cylinder`, `eaf__arms_busstube` |
| Transformador | `eaf__transformer` | `eaf__transformer_tank`, `eaf__transformer_oltc` |
| Circuito secundario | `eaf__secondary` | `eaf__secondary_cables`, `eaf__secondary_busbar` |
| O₂ y carbono | `eaf__oxygen` | `eaf__oxygen_lance`, `eaf__oxygen_carbon` |
| Puerta de escoria | `eaf__slagdoor` | — |
| EBT | `eaf__ebt` | `eaf__ebt_pit` |
| Hidráulica | `eaf__hydraulics` | — |
| Refractario | `eaf__refractory` | — |
| Paneles enfriados | `eaf__cooling` | — |
| Humos | `eaf__fume` | `eaf__fume_elbow` |
| Alimentación DRI | `eaf__drifeed` | `eaf__drifeed_chute` |
| Púlpito | `eaf__control` | — |
