import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useShallow } from 'zustand/react/shallow';
import * as THREE from 'three';
import modelUrl from '../../assets/eaf.glb?url';
import { isAbort, loadModel } from '../../lib/three/loadModel';
import { useLoad } from '../../stores/useLoad';
import { nodeMatches, nodesForEquipment, useApp } from '../../stores/useApp';
import { equipmentForNode } from '../../lib/content';
import { EXPLODE, REGULATION, SECTIONED, Y0 } from './anchors';
import { track } from '../../lib/analytics';

const ACCENT = new THREE.Color('#e8a33d');
const REDUCED = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const SECTION_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.02);
const PREFIX = /^(eaf|env)__/;
const SYSTEM = /^(eaf|env)__[a-z]+$/;
/** GLTFLoader agrega `_1`, `_2`… a las sub-mallas de una malla con varios materiales (RT-SW-05). */
const stripSuffix = (name: string) => name.replace(/_\d+$/, '');

interface MeshInfo {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  system: string;
  node: string;
  base: { opacity: number; transparent: boolean; depthWrite: boolean; emissive: THREE.Color; emissiveIntensity: number };
  /** estado de resaltado calculado por el efecto visual; el hover se aplica encima sin re-render */
  emph: boolean;
  selComp: boolean;
}

/**
 * Sube por los padres hasta el sistema `eaf__xxx` / `env__xxx` (RT-SW-05).
 * `node` es el primer nombre con contrato encontrado, sin el sufijo numérico de GLTFLoader:
 * `eaf__arms_clamp_1` → `eaf__arms_clamp`; `eaf__hydraulics_3` → `eaf__hydraulics`.
 * Los objetos sin nombre o con nombres fuera del contrato (p. ej. `mesh_*`) se saltan.
 */
export function nodeOf(o: THREE.Object3D | null): { node: string; system: string } | null {
  let node: string | null = null;
  for (; o; o = o.parent) {
    if (!PREFIX.test(o.name)) continue;
    const n = stripSuffix(o.name);
    if (!node) node = n;
    if (SYSTEM.test(n)) return { node, system: n };
  }
  return null;
}

const worldVisible = (o: THREE.Object3D | null) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
const clippedAway = (i: THREE.Intersection) => {
  const m = (i.object as THREE.Mesh).material as THREE.Material | undefined;
  return !!m?.clippingPlanes?.some((p) => p.distanceToPoint(i.point) < 0);
};
const ghosted = (o: THREE.Object3D) => {
  const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
  return !!m && m.transparent && m.opacity < 0.5;
};
/** Primer impacto que el usuario realmente ve: visible en el mundo, no recortado por CORTE ni fantasma de RAYOS X (RT-SW-07). */
const firstRealHit = (hits: THREE.Intersection[]) =>
  hits.find((i) => worldVisible(i.object) && !clippedAway(i) && !ghosted(i.object) && !!nodeOf(i.object)?.system.startsWith('eaf__'));

/** Emisivo de una malla: resaltado del contenido + hover (sin needsUpdate: son uniforms). */
function applyEmissive(m: MeshInfo, anyEmph: boolean, hover: string | null) {
  if (m.base.emissiveIntensity > 0 && m.base.emissive.getHex() !== 0) {
    m.mat.emissive.copy(m.base.emissive);
    m.mat.emissiveIntensity = m.base.emissiveIntensity;
    return;
  }
  const k = m.selComp ? 0.6 : m.emph && anyEmph ? 0.28 : hover === m.system ? 0.16 : 0;
  m.mat.emissive.copy(ACCENT).multiplyScalar(k);
  m.mat.emissiveIntensity = 1;
}

const setHover = (sys: string | null) => {
  const st = useApp.getState();
  if (st.hoverNode === sys) return;
  st.set({ hoverNode: sys });
  document.body.style.cursor = sys ? 'pointer' : 'auto';
};

export function EafModel() {
  const [root, setRoot] = useState<THREE.Group | null>(null);
  /** sube cuando terminan de precompilarse las variantes: obliga a reaplicar el estado visual */
  const [compiled, setCompiled] = useState(0);
  const { gl, camera, scene } = useThree();
  const setLoad = useLoad((s) => s.set);
  const setApp = useApp((s) => s.set);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    loadModel(modelUrl, (p) => { if (alive) setLoad(p); }, ctrl.signal)
      .then(async (gltf) => {
        if (!alive) return;
        const g = gltf.scene as THREE.Group;
        g.position.y = -Y0;
        setLoad({ phase: 'compile', loaded: 1, total: 1 });
        setRoot(g);
        // compila shaders antes de mostrar (evita tirones en el primer cuadro) e incluye las variantes
        // de RAYOS X (transparente) y CORTE (plano de recorte) para que el primer uso no congele (RT-PERF-05)
        await new Promise((r) => requestAnimationFrame(r));
        try {
          await gl.compileAsync(scene, camera);
          const mats: { m: THREE.Material; t: boolean }[] = [];
          g.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if ((o as THREE.Mesh).isMesh && m && !Array.isArray(m)) mats.push({ m, t: m.transparent }); });
          const prevClip = gl.localClippingEnabled;
          gl.localClippingEnabled = true;
          for (const variant of [{ t: true, c: false }, { t: false, c: true }]) {
            if (!alive) break;
            mats.forEach(({ m, t }) => { m.transparent = variant.t || t; m.clippingPlanes = variant.c ? [SECTION_PLANE] : null; m.needsUpdate = true; });
            await gl.compileAsync(scene, camera);
          }
          mats.forEach(({ m, t }) => { m.transparent = t; m.clippingPlanes = null; m.needsUpdate = true; });
          gl.localClippingEnabled = prevClip;
          if (alive) setCompiled((c) => c + 1);
        } catch { /* algunos navegadores no lo soportan */ }
        if (!alive) return;
        gl.shadowMap.needsUpdate = true;
        setLoad({ phase: 'ready', loaded: 1, total: 1 });
        setApp({ loaded: true });
        track('initialized', 'app', { quality: useApp.getState().effective });
      })
      .catch((e: Error) => { if (alive && !isAbort(e)) setLoad({ phase: 'error', loaded: 0, total: 0, message: e.message }); });
    return () => { alive = false; ctrl.abort(); };
  }, [gl, camera, scene, setLoad, setApp]);

  const info = useMemo(() => {
    if (!root) return null;
    const meshes: MeshInfo[] = [];
    const nodes = new Map<string, THREE.Object3D>();
    root.traverse((o) => {
      // solo nombres del contrato (sin las sub-mallas `_1`, `_2`… que agrega GLTFLoader)
      if (PREFIX.test(o.name) && stripSuffix(o.name) === o.name && !nodes.has(o.name)) nodes.set(o.name, o);
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const owner = nodeOf(m);
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        m.material = mat;
        m.castShadow = true;
        m.receiveShadow = true;
        if (owner) meshes.push({ mesh: m, mat, system: owner.system, node: owner.node, emph: false, selComp: false, base: { opacity: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite, emissive: mat.emissive.clone(), emissiveIntensity: mat.emissiveIntensity } });
      }
    });
    const systems = [...nodes].filter(([n]) => SYSTEM.test(n));
    // solo se animan los nodos con despiece o regulación (antes: ~80 nodos por cuadro)
    const animated = [...nodes]
      .filter(([n]) => EXPLODE[n] || REGULATION.includes(n))
      .map(([name, o]) => {
        const d = EXPLODE[name];
        return { o, origin: o.position.clone(), dir: d ? new THREE.Vector3(d[0], d[1], d[2]) : null, reg: REGULATION.includes(name) };
      });
    return { meshes, nodes, systems, animated };
  }, [root]);

  // ---- estado visual (xray, sección, aislar, ocultar, resaltar) ----
  // Selectores con useShallow: hoverNode, explode, cameraRequest… ya no re-renderizan este componente (RT-PERF-02).
  const s = useApp(useShallow((st) => ({
    selectedEq: st.selectedEq, focusNodes: st.focusNodes, xray: st.xray, section: st.section, isolate: st.isolate,
    hidden: st.hidden, selectedComponentNode: st.selectedComponentNode, picking: st.picking, lastPick: st.lastPick,
  })));
  const anyEmphRef = useRef(false);
  useEffect(() => {
    if (!info) return;
    gl.localClippingEnabled = true;
    const sel = nodesForEquipment(s.selectedEq);
    // UX-09: en «identificar» se marca en 3D lo que el alumno eligió
    const picked = s.picking && s.lastPick ? nodesForEquipment(s.lastPick.eqId) : [];
    const focus = [...s.focusNodes, ...picked];
    const emphNodes = [...sel, ...focus];
    const anyEmph = emphNodes.length > 0;
    anyEmphRef.current = anyEmph;
    const scn = s.selectedComponentNode;
    for (const [name, o] of info.systems) {
      let vis = !s.hidden.includes(name);
      // un sistema queda visible al aislar si es (o contiene) un nodo resaltado
      if (s.isolate && anyEmph) vis = vis && emphNodes.some((f) => f === name || f.startsWith(name + '_'));
      o.visible = vis;
    }
    for (const m of info.meshes) {
      // todas las mallas descendientes del nodo resaltado (sistema o componente) se iluminan (RT-SW-05)
      m.emph = nodeMatches(m.node, emphNodes) || emphNodes.includes(m.system);
      m.selComp = !!scn && (m.node === scn || m.node.startsWith(scn + '_') || m.system === scn);
      const ghost = s.xray && !m.emph && m.system !== 'env__bath';
      const nextTransparent = ghost ? true : m.base.transparent;
      const nextClip = s.section && (SECTIONED.includes(m.system) || m.system === 'env__bath');
      // solo hace falta recompilar si cambia la variante del programa (RT-PERF-05); opacidad y emisivo son uniforms
      if (m.mat.transparent !== nextTransparent || !!m.mat.clippingPlanes?.length !== nextClip) m.mat.needsUpdate = true;
      m.mat.transparent = nextTransparent;
      m.mat.opacity = ghost ? 0.1 : m.base.opacity;
      m.mat.depthWrite = ghost ? false : m.base.depthWrite;
      m.mesh.castShadow = !ghost;
      m.mat.clippingPlanes = nextClip ? [SECTION_PLANE] : null;
      m.mat.clipShadows = true;
      applyEmissive(m, anyEmph, useApp.getState().hoverNode);
    }
    gl.shadowMap.needsUpdate = true; // visibilidad, fantasma o recorte cambian la sombra (autoUpdate = false en Scene)
  }, [info, gl, s, compiled]);

  // hover imperativo: sin re-render de React ni needsUpdate (RT-PERF-01)
  useEffect(() => {
    if (!info) return;
    return useApp.subscribe((st, prev) => {
      if (st.hoverNode === prev.hoverNode) return;
      for (const m of info.meshes) if (m.system === st.hoverNode || m.system === prev.hoverNode) applyEmissive(m, anyEmphRef.current, st.hoverNode);
    });
  }, [info]);
  useEffect(() => () => { document.body.style.cursor = 'auto'; }, []);

  // ---- animación: despiece y regulación demostrativa (sin asignaciones por cuadro, RT-PERF-08) ----
  const tmp = useRef(new THREE.Vector3());
  const resting = useRef(false);
  useFrame((state, dt) => {
    if (!info) return;
    const { explode, arcDemo } = useApp.getState();
    const moving = explode !== 0 || arcDemo;
    if (!moving && resting.current) return;
    const t = state.clock.elapsedTime;
    const reg = arcDemo && !REDUCED ? Math.sin(t * 1.3) * 0.18 : 0;
    const a = Math.min(1, dt * 6);
    let maxD = 0;
    for (const n of info.animated) {
      tmp.current.copy(n.origin);
      if (n.dir && explode) tmp.current.addScaledVector(n.dir, explode);
      if (n.reg) tmp.current.y += reg;
      const d = n.o.position.distanceToSquared(tmp.current);
      if (d < 1e-8) n.o.position.copy(tmp.current);
      else { n.o.position.lerp(tmp.current, a); maxD = Math.max(maxD, d); }
    }
    if (maxD > 0) state.gl.shadowMap.needsUpdate = true;
    resting.current = !moving && maxD === 0;
  });
  // cualquier cambio del store puede arrancar una animación: se despierta el bucle
  useEffect(() => useApp.subscribe((st, p) => { if (st.explode !== p.explode || st.arcDemo !== p.arcDemo) resting.current = false; }), []);

  if (!root) return null;
  const pick = (e: ThreeEvent<MouseEvent>) => {
    const hit = firstRealHit(e.intersections);
    if (!hit) return;
    e.stopPropagation();
    const n = nodeOf(hit.object)!;
    const eq = equipmentForNode(n.node) ?? equipmentForNode(n.system);
    if (!eq) return;
    const st = useApp.getState();
    if (st.picking) { st.set({ lastPick: { eqId: eq.id, key: Date.now() } }); return; }
    // RT-SW-04: en EVALUAR un clic 3D sin «identificar» no cambia nada (no se pierde el avance)
    if (st.mode === 'assess') return;
    // en EJECUTAR solo se resalta la pieza; el panel de la instrucción no cambia
    if (st.mode === 'perform') { st.set({ selectedComponentNode: n.node }); return; }
    st.selectEquipment(eq.id, { fly: false });
    if (n.node !== n.system) st.set({ selectedComponentNode: n.node });
    track('opened', eq.id, { via: '3d' });
  };
  return (
    <primitive
      object={root}
      onClick={pick}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        // R3F llama a este handler una vez por cada malla impactada: basta con la primera
        if (e.object !== e.intersections[0]?.object) return;
        const h = firstRealHit(e.intersections);
        setHover(h ? nodeOf(h.object)!.system : null);
      }}
      // cambiar de triángulo dispara pointerout: solo se limpia si el cursor ya no está sobre el modelo
      onPointerOut={(e: ThreeEvent<PointerEvent>) => { if (!firstRealHit(e.intersections)) setHover(null); }}
    />
  );
}

/** Caja envolvente en mundo de varios nodos (para encuadrar la cámara). */
export function boxOfNodes(scene: THREE.Object3D, names: readonly string[]): THREE.Box3 | null {
  const box = new THREE.Box3();
  let found = false;
  for (const n of names) {
    const o = scene.getObjectByName(n);
    if (o) { box.expandByObject(o); found = true; }
  }
  return found && !box.isEmpty() ? box : null;
}
