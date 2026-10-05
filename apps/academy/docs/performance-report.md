# Informe de rendimiento — ACERÍA DIGITAL ACADEMY (MVP 0.1)

**Mensaje clave:** la interfaz se pinta con **≈ 143 KB gzip** de JavaScript crítico. El 3D se carga después, con progreso real. El modelo pesa **252 KB** (25 k triángulos, 57 primitivas, 0 texturas), muy por debajo del presupuesto: hay margen de sobra para un modelo de planta real.
Fecha: 2026-10-05. Fuente: `vite build`, `tests/e2e/report.json` y análisis del GLB con gltf-transform.

## 1. Bundle (`npm run build`)
| Archivo | Tamaño | gzip | Cuándo carga |
|---|---|---|---|
| `react-*.js` | 154 KB | 50 KB | Inicio (precargado) |
| `index-*.js` (app, contenido y esquemas) | 351 KB | 93 KB | Inicio |
| `index-*.css` | 30 KB | 6 KB | Inicio |
| `Scene-*.js` | 15 KB | 7 KB | Diferido (`lazy`) |
| `three-*.js` | 752 KB | 195 KB | Diferido |
| `r3f-*.js` (R3F, drei, postprocessing) | 566 KB | 234 KB | Diferido |
| `eaf-*.glb` | 258 KB | — (meshopt) | Diferido, en streaming con progreso |
| **Ruta crítica** | | **≈ 150 KB** | Antes de la corrección PERF-03 eran ≈ 543 KB |

## 2. Modelo 3D (`npm run model`)
| Métrica | MVP | Presupuesto (`3d-asset-guidelines.md`) |
|---|---|---|
| Triángulos | 25 328 | ≤ 150 k (máx. 300 k) |
| Primitivas (≈ llamadas de dibujo del modelo, sin sombras) | 57 | ≤ 150 |
| Materiales | 19 | ≤ 24 |
| Texturas | 0 | ≤ 8 |
| Peso | 252 KB | ≤ 3 MB |
| Nodos del contrato | 15 sistemas + 19 componentes | — |

## 3. Medición en navegador (Chromium sin GPU, SwiftShader)
| Métrica | Valor | Nota |
|---|---|---|
| Carga hasta escena lista (descarga, decodificación, compilación de shaders y variantes) | 2.1 s | Servidor local, CPU sin GPU |
| Memoria JS | 21 MB | Después de la carga |
| FPS | 4 | **No representativo:** renderizado por software en un contenedor sin GPU. En equipo con GPU integrada el objetivo es ≥ 30 FPS en Media; falta medirlo en el piloto (ver §5) |
| Errores de consola | 0 funcionales | Los 2 404 eran el favicon, ya corregido |

## 4. Estrategia aplicada
- **Calidad:** Baja (DPR 1, sin sombras ni postproceso), Media (DPR 1.5, sombras, bloom y SMAA), Alta (DPR 2, N8AO y viñeta). En Auto, `PerformanceMonitor` sube o baja el nivel, y el valor desconocido de `localStorage` cae a Auto.
- **Render bajo demanda:** el bucle se detiene en reposo y se pausa con un PDF o video abierto. Las sombras se actualizan solo cuando cambia la escena.
- **Sin asignaciones por cuadro:** los vectores se reutilizan. El *hover* no provoca re-render de React, y los selectores de zustand evitan re-renders globales.
- **Precompilación** de las variantes de rayos X y corte (`compileAsync`) para que el primer uso no se congele.
- **Carga cancelable** (`AbortController`) con el progreso limitado a 100 %.

## 5. Pendiente (piloto)
| # | Acción | Responsable |
|---|---|---|
| P1 | Medir FPS en 3 equipos reales (PC de capacitación, laptop de supervisor y tableta de piso), en Auto/Media/Baja | ADX-13 en el piloto |
| P2 | Medir el tiempo de carga en la red de planta (Wi-Fi de piso) | ADX-13 + TI |
| P3 | Con el modelo CAD real: LODs y KTX2 si se pasa de 150 k triángulos | ADX-09 (F2-13) |
