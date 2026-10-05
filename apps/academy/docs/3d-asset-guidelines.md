# Lineamientos de activos 3D — ACERÍA DIGITAL ACADEMY

**Mensaje clave:** el 3D es un **contrato de nombres**. Cualquier modelo (procedural hoy; CAD o escaneo de planta mañana) funciona si respeta los nombres de nodo de `docs/nodos-3d.md`, los presupuestos y la escala en metros. La app no depende de cómo se modeló.

## 1. Pipeline
```
Fuente (procedural · CAD STEP · DCC Blender)
  → limpieza (Blender): escala 1 u = 1 m, Y arriba, origen = centro de la solera a nivel de plataforma, normales, sin n-gons
  → nombres de nodos según el contrato (eaf__<sistema>[_<componente>])
  → exportar glTF 2.0 binario (.glb)
  → gltf-transform: dedup · weld · prune · quantize · meshopt (EXT_meshopt_compression)
  → src/assets/eaf.glb + public/models/eaf.nodes.json (lista de nodos)
  → npm run check:content (valida que todo hotspot y equipo apunte a nodos existentes)
```
Hoy `npm run model` (`scripts/build-eaf-glb.mjs`) genera el modelo **esquemático** de forma procedural con three.js y gltf-transform.

## 2. Contrato de nombres
- Sistema: `eaf__<sistema>`, minúsculas, sin acentos (por ejemplo `eaf__electrodes`). Tiene correspondencia 1:1 con `eq.*` y `hs.*`.
- Componente: `eaf__<sistema>_<componente>` como hijo del sistema (por ejemplo `eaf__arms_clamp`).
- Malla: `mesh_<nodo>`, una por nodo, con una primitiva por material. Nunca le pongas a la malla el nombre del nodo (ver `docs/nodos-3d.md`, RT-SW-05).
- Entorno: `env__*` (plataforma, baño). No es seleccionable.
- Los hotspots se anclan en `src/components/3d/anchors.ts` (ADX-09), con coordenadas de escena donde la plataforma está en y = 0.

## 3. Presupuestos (por modelo de equipo principal)
| Métrica | Objetivo | Máximo | MVP actual (2026-10-05, tras OPS-01/OPS-12/RT-SW-05) |
|---|---|---|---|
| Triángulos | ≤ 150 k | 300 k | ≈ 25.3 k |
| Peso del GLB (comprimido) | ≤ 3 MB | 8 MB | ≈ 0.25 MB (252 KB) |
| Materiales | ≤ 24 | 40 | 19 (se quitó `grating`) |
| Texturas | 0–8 (KTX2/BasisU 1k–2k) | 16 | 0 (PBR por factores) |
| Llamadas de dibujo | ≤ 150 | 300 | ver `performance-report.md` (1 por primitiva = 1 por material de cada nodo) |
| Nodos seleccionables | 1 por sistema más los componentes | — | 15 sistemas + 19 componentes |
| Mallas por nodo | 1 (varias primitivas si hay varios materiales) | 1 | 1, nombrada `mesh_<nodo>`; sin hijos `_1`/`_2` con nombre de contrato |

## 4. Materiales
- PBR metal/rugosidad. Los colores son representativos: **no** reproducen el código de colores de tuberías de la planta (si se usara, debe venir de la norma de la planta, `SME_REQUIRED`).
- Emisivos solo para el baño y la punta del electrodo (`KHR_materials_emissive_strength`).
- Doble cara solo en cascarones que se ven en corte (coraza, paneles, refractario).

## 5. Lo que el modelo NO debe representar sin validación de planta
Distancias de zonas de exclusión, posiciones de candados o bloqueos, la lógica de enclavamientos, rutas de evacuación, la ubicación real de válvulas de aislamiento y los colores normativos. Si se agregan, el contenido asociado debe pasar por ADX-04 (Seguridad, veto) y ADX-03 (Operaciones).

## 6. Rendimiento en ejecución
- Carga en streaming con progreso real, `MeshoptDecoder` y compilación de shaders (`compileAsync`) antes de mostrar.
- Calidad: Baja (DPR 1, sin sombras ni postproceso), Media (DPR 1.5, sombras, bloom y SMAA) y Alta (DPR 2, N8AO y viñeta). En Auto, `PerformanceMonitor` sube o baja de nivel.
- Rayos X, corte y despiece no duplican geometría: cambian materiales clonados por malla, usan un plano de recorte y mueven nodos.

## 7. Agregar otro equipo o planta
1. Modela y nombra los nodos según el contrato. 2. Agrega `eq.*`, `hs.*` y anclas. 3. Corre `npm run model` (o exporta tu GLB a `src/assets/`) y `npm run check:content`. 4. Pasa la revisión del Validation Board.
