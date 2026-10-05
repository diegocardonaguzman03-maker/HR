# Nodos 3D del modelo EAF (contrato con `public/models/eaf.nodes.json`)

El GLB `src/assets/eaf.glb` (y la lista `public/models/eaf.nodes.json`) lo genera `npm run model` (`scripts/build-eaf-glb.mjs`). Cada nodo de primer nivel corresponde a un sistema (`eq.*`) y sus hijos a componentes (`cmp.*`).

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

## Reglas de nombres en el GLB (RT-SW-05)
- Cada nodo del contrato es **un solo nodo con una malla**. Si el nodo usa varios materiales, la malla tiene **varias primitivas**; no se crean nodos hijos `_1`, `_2`.
- La malla se llama `mesh_<nodo>` (por ejemplo `mesh_eaf__arms_clamp`), nunca igual que el nodo. Motivo: GLTFLoader de three r169 reserva primero el nombre del nodo y luego nombra cada primitiva con el nombre de la malla mediante `createUniqueName`; si ambos coinciden, las primitivas salen como `eaf__x_1`, `eaf__x_2`… y parecen componentes del contrato.
- Al cargar: con una primitiva, la Mesh toma el nombre del nodo; con varias, el nodo es un `Group` con hijos `mesh_eaf__x`, `mesh_eaf__x_1`… La app (`EafModel › nodeOf`) sube por los padres hasta el primer nombre `eaf__*`/`env__*`.
- `build-eaf-glb.mjs` falla si un componente (`eaf__<sistema>_<componente>`) no tiene geometría.
- Nota: la escena y el nodo raíz se llaman ambos `eaf`; GLTFLoader renombra uno a `eaf_1`. No afecta al contrato (no empieza con `eaf__`).

## Disposición esquemática (OPS-01, opción A)
Ejes de escena en metros; la plataforma del horno está en y = 0 de la escena (y = 3 en el GLB) y el centro de la solera en x = 0, z = 0.

| Elemento | Ubicación |
|---|---|
| Mástiles, brazos y transformador | −x (mástiles en x = −5.6; transformador en x = −12.2) |
| Puerta de escoria y púlpito | +z (puerta en z ≈ 3.3–3.7; púlpito en z ≈ 8–12) |
| EBT | −z: caja x ∈ [−0.95, 0.95], z ∈ [−4.5, −3.0]; piquera en (0, −3.95) |
| Fosa de vaciado | −z: centro (0, −4.0), radio ≤ 1.85 m, del piso (y = −3 de escena) a la plataforma |
| Hueco de la plataforma | x ∈ [−2, 2], z ∈ [−11, −2] (fosa y paso del carro de olla) |
| Basculamiento | Eje paralelo a x: hacia −z para vaciar y hacia +z para desescoriar. Cunas en los planos x = ±1.6; cilindros de basculamiento en (1.6, ±2.6) |
| Barandal | Borde x = 6.9, de z = −11 a 11 |
| Ducto de humos | Sale del 4.º agujero hacia +x a z = −2.6, a 6.8 m sobre la plataforma; soportes en x = 8 y 11 (fuera de la plataforma). No cruza la fosa |
| HPU hidráulica | (−7.5, −7.2), sobre la plataforma oeste; no cruza el hueco |
| Ancla del EBT | `[0.9, 1.5, -4.3]`; despiece `[0, 0, -2.2]` |

Es **GENERAL EDUCATIONAL CONTENT**: no reproduce distancias ni la orientación real de la Acería de GASM (`SME_REQUIRED`). Por OPS-12 se quitaron la lanza y el inyector de carbono que entraban por la puerta; `eaf__oxygen_lance` son las 4 lanzas/quemadores de pared con sus tuberías y `eaf__oxygen_carbon` es solo el tanque dosificador, sin línea al horno (`SME_REQUIRED`: punto de inyección de carbono).
