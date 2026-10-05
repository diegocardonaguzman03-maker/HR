import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import modelUrl from '../../assets/eaf.glb?url';
import { loadModel } from '../../lib/three/loadModel';
import { useLoad } from '../../stores/useLoad';
import { useApp } from '../../stores/useApp';
import { equipmentForNode } from '../../lib/content';
import { EXPLODE, REGULATION, SECTIONED, Y0 } from './anchors';
import { track } from '../../lib/analytics';

const ACCENT = new THREE.Color('#e8a33d');
const SECTION_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.02);

interface MeshInfo {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  system: string;
  node: string;
  base: { opacity: number; transparent: boolean; depthWrite: boolean; emissive: THREE.Color; emissiveIntensity: number };
}

/** sistema raíz eaf__xxx de un objeto (o env__xxx) */
function nodeOf(o: THREE.Object3D | null): { node: string; system: string } | null {
  let node: string | null = null;
  while (o) {
    if (/^(eaf|env)__/.test(o.name)) {
      if (!node) node = o.name;
      if (/^(eaf|env)__[a-z]+$/.test(o.name)) return { node, system: o.name };
    }
    o = o.parent;
  }
  return null;
}

export function EafModel() {
  const [root, setRoot] = useState<THREE.Group | null>(null);
  const { gl, camera, scene } = useThree();
  const setLoad = useLoad((s) => s.set);
  const setApp = useApp((s) => s.set);

  useEffect(() => {
    let alive = true;
    loadModel(modelUrl, setLoad)
      .then(async (gltf) => {
        if (!alive) return;
        const g = gltf.scene as THREE.Group;
        g.position.y = -Y0;
        setLoad({ phase: 'compile', loaded: 1, total: 1 });
        setRoot(g);
        // compila shaders antes de mostrar (evita tirones en el primer cuadro)
        await new Promise((r) => requestAnimationFrame(r));
        try { await gl.compileAsync(scene, camera); } catch { /* algunos navegadores no lo soportan */ }
        if (!alive) return;
        setLoad({ phase: 'ready', loaded: 1, total: 1 });
        setApp({ loaded: true });
        track('initialized', 'app', { quality: useApp.getState().effective });
      })
      .catch((e: Error) => setLoad({ phase: 'error', loaded: 0, total: 0, message: e.message }));
    return () => { alive = false; };
  }, [gl, camera, scene, setLoad, setApp]);

  const info = useMemo(() => {
    if (!root) return null;
    const meshes: MeshInfo[] = [];
    const nodes = new Map<string, THREE.Object3D>();
    root.traverse((o) => {
      if (/^(eaf|env)__/.test(o.name)) nodes.set(o.name, o);
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const owner = nodeOf(m);
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        m.material = mat;
        m.castShadow = true;
        m.receiveShadow = true;
        if (owner) meshes.push({ mesh: m, mat, system: owner.system, node: owner.node, base: { opacity: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite, emissive: mat.emissive.clone(), emissiveIntensity: mat.emissiveIntensity } });
      }
    });
    const origin = new Map<string, THREE.Vector3>();
    nodes.forEach((o, n) => origin.set(n, o.position.clone()));
    return { meshes, nodes, origin };
  }, [root]);

  // ---- estado visual (xray, sección, aislar, ocultar, resaltar) ----
  const s = useApp();
  useEffect(() => {
    if (!info) return;
    gl.localClippingEnabled = true;
    const selSys = s.selectedEq ? `eaf__${s.selectedEq.replace(/^eq\./, '')}` : null;
    const focus = new Set(s.focusNodes);
    const emph = (m: MeshInfo) => m.system === selSys || focus.has(m.system) || focus.has(m.node);
    const anyEmph = !!selSys || focus.size > 0;
    info.nodes.forEach((o, name) => {
      if (!/^(eaf|env)__[a-z]+$/.test(name)) return;
      let vis = !s.hidden.includes(name);
      if (s.isolate && anyEmph) vis = vis && (name === selSys || focus.has(name) || [...focus].some((f) => f.startsWith(name + '_')));
      o.visible = vis;
    });
    for (const m of info.meshes) {
      const e = emph(m);
      const ghost = s.xray && !e && m.system !== 'env__bath';
      m.mat.transparent = ghost ? true : m.base.transparent;
      m.mat.opacity = ghost ? 0.1 : m.base.opacity;
      m.mat.depthWrite = ghost ? false : m.base.depthWrite;
      m.mesh.castShadow = !ghost;
      m.mat.clippingPlanes = s.section && (SECTIONED.includes(m.system) || m.system === 'env__bath') ? [SECTION_PLANE] : null;
      m.mat.clipShadows = true;
      const hover = s.hoverNode === m.system;
      const isSelComp = s.selectedComponentNode && m.node === s.selectedComponentNode;
      if (m.base.emissiveIntensity > 0 && m.base.emissive.getHex() !== 0) {
        m.mat.emissive.copy(m.base.emissive);
        m.mat.emissiveIntensity = m.base.emissiveIntensity;
      } else {
        const k = isSelComp ? 0.6 : e && anyEmph ? 0.28 : hover ? 0.16 : 0;
        m.mat.emissive.copy(ACCENT).multiplyScalar(k);
        m.mat.emissiveIntensity = 1;
      }
      m.mat.needsUpdate = true;
    }
  }, [info, gl, s.selectedEq, s.focusNodes, s.xray, s.section, s.isolate, s.hidden, s.hoverNode, s.selectedComponentNode]);

  // ---- animación: despiece y regulación demostrativa ----
  const tmp = useRef(new THREE.Vector3());
  useFrame((state, dt) => {
    if (!info) return;
    const { explode, arcDemo } = useApp.getState();
    const t = state.clock.elapsedTime;
    const reg = arcDemo ? Math.sin(t * 1.3) * 0.18 + Math.sin(t * 5.1) * 0.03 : 0;
    info.nodes.forEach((o, name) => {
      const base = info.origin.get(name)!;
      const dir = EXPLODE[name];
      tmp.current.copy(base);
      if (dir) tmp.current.add(new THREE.Vector3(dir[0], dir[1], dir[2]).multiplyScalar(explode));
      if (REGULATION.includes(name)) tmp.current.y += reg;
      o.position.lerp(tmp.current, Math.min(1, dt * 6));
    });
  });

  if (!root) return null;
  const pick = (e: ThreeEvent<MouseEvent>) => {
    const hit = e.intersections.find((i) => i.object.visible && !(((i.object as THREE.Mesh).material as THREE.Material).transparent && ((i.object as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity < 0.5) && nodeOf(i.object)?.system.startsWith('eaf__'));
    if (!hit) return;
    e.stopPropagation();
    const n = nodeOf(hit.object)!;
    const eq = equipmentForNode(n.node) ?? equipmentForNode(n.system);
    if (!eq) return;
    const st = useApp.getState();
    if (st.picking) { st.set({ lastPick: { eqId: eq.id, key: Date.now() } }); return; }
    st.selectEquipment(eq.id, { fly: false });
    if (n.node !== n.system) st.set({ selectedComponentNode: n.node });
    track('opened', eq.id, { via: '3d' });
  };
  return (
    <primitive
      object={root}
      onClick={pick}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        const n = nodeOf(e.object);
        const sys = n && n.system.startsWith('eaf__') ? n.system : null;
        if (useApp.getState().hoverNode !== sys) { setApp({ hoverNode: sys }); document.body.style.cursor = sys ? 'pointer' : 'auto'; }
      }}
      onPointerOut={() => { setApp({ hoverNode: null }); document.body.style.cursor = 'auto'; }}
    />
  );
}

/** Caja envolvente en mundo de varios nodos (para encuadrar la cámara). */
export function boxOfNodes(scene: THREE.Object3D, names: string[]): THREE.Box3 | null {
  const box = new THREE.Box3();
  let found = false;
  for (const n of names) {
    const o = scene.getObjectByName(n);
    if (o) { box.expandByObject(o); found = true; }
  }
  return found && !box.isEmpty() ? box : null;
}
