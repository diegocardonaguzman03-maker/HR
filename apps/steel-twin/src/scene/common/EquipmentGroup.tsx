/**
 * Wrapper for every selectable machine.
 * Handles raycast hover/click, highlight, component selection, isolation
 * (component mode), X-ray transparency and the EQUIPMENT layer.
 *
 * Mesh userData flags used by children:
 *   steel      → process material (never highlighted, never hidden by EQUIPMENT layer)
 *   xray       → becomes transparent in X-ray mode
 *   noPick     → ignored by selection
 *   componentId (on any ancestor group) → sub-component for component mode
 */
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useAppStore } from '../../store/useAppStore';
import type { EquipmentId } from '../../types/equipment';

export const equipmentRegistry = new Map<EquipmentId, THREE.Object3D>();

const EquipmentCtx = createContext<EquipmentId | null>(null);
export const useEquipmentId = () => useContext(EquipmentCtx);

const HOVER = new THREE.Color('#5aa9ff');
const SELECT = new THREE.Color('#b8760a');
const COMPONENT = new THREE.Color('#ffd45a');

interface Props {
  id: EquipmentId;
  children: ReactNode;
  position?: [number, number, number];
}

function componentOf(obj: THREE.Object3D | null): string | undefined {
  let o: THREE.Object3D | null = obj;
  while (o) {
    if (o.userData.componentId) return o.userData.componentId as string;
    if (o.userData.equipmentRoot) return undefined;
    o = o.parent;
  }
  return undefined;
}

export function EquipmentGroup({ id, children, position }: Props) {
  const ref = useRef<THREE.Group>(null);
  const selected = useAppStore((s) => s.selected);
  const selectedComponent = useAppStore((s) => s.selectedComponent);
  const hoveredId = useAppStore((s) => s.hovered?.id);
  const hoveredComp = useAppStore((s) => s.hovered?.component);
  const componentMode = useAppStore((s) => s.componentMode);
  const xray = useAppStore((s) => s.xray);
  const showEquipment = useAppStore((s) => s.layers.equipment);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.userData.equipmentRoot = true;
      equipmentRegistry.set(id, ref.current);
    }
    return () => {
      equipmentRegistry.delete(id);
    };
  }, [id]);

  // Apply visual state to every mesh (materials are cloned per mesh on first use).
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const isSel = selected === id;
    const isolated = componentMode && selected !== null && !isSel;
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const ud = mesh.userData;
      if (!ud.baseMaterial) {
        const m = mesh.material as THREE.MeshStandardMaterial;
        ud.baseMaterial = m;
        mesh.material = m.clone();
      }
      const base = ud.baseMaterial as THREE.MeshStandardMaterial;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mesh.visible = ud.hiddenByLogic ? mesh.visible : showEquipment || !!ud.steel || !!ud.alwaysVisible;
      if (ud.steel) return;
      const comp = componentOf(mesh);
      // emissive highlight
      let hl: THREE.Color | null = null;
      if (isSel && componentMode && selectedComponent && comp === selectedComponent) hl = COMPONENT;
      else if (isSel && !componentMode) hl = SELECT;
      else if (hoveredId === id && (!componentMode || hoveredComp === comp)) hl = HOVER;
      if (base.emissive) {
        mat.emissive.copy(hl ?? base.emissive);
        mat.emissiveIntensity = hl ? (hl === HOVER ? 0.22 : 0.3) : base.emissiveIntensity;
      }
      // transparency: isolation or x-ray
      let opacity = base.opacity ?? 1;
      if (isolated) opacity = 0.08;
      else if (xray && ud.xray) opacity = 0.14;
      mat.transparent = opacity < 1 || base.transparent;
      mat.opacity = opacity;
      mat.depthWrite = opacity >= 1 && base.depthWrite !== false;
      mat.needsUpdate = true;
    });
  }, [selected, selectedComponent, hoveredId, hoveredComp, componentMode, xray, showEquipment, id]);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.userData.noPick) return;
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    useAppStore.getState().setHovered({ id, component: componentOf(e.object), x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.userData.noPick) return;
    e.stopPropagation();
    const h = useAppStore.getState().hovered;
    const comp = componentOf(e.object);
    if (!h || h.id !== id || h.component !== comp || Math.abs(h.x - e.nativeEvent.clientX) + Math.abs(h.y - e.nativeEvent.clientY) > 6)
      useAppStore.getState().setHovered({ id, component: comp, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };
  const onOut = () => {
    document.body.style.cursor = 'auto';
    const h = useAppStore.getState().hovered;
    if (h?.id === id) useAppStore.getState().setHovered(null);
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.object.userData.noPick) return;
    e.stopPropagation();
    const st = useAppStore.getState();
    const comp = componentOf(e.object);
    if (st.componentMode && st.selected === id && comp) st.select(id, comp);
    else if (st.componentMode && st.selected !== id) return; // isolated machines are not selectable
    else st.select(id);
  };

  return (
    <EquipmentCtx.Provider value={id}>
      <group ref={ref} position={position} onPointerOver={onOver} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>
        {children}
      </group>
    </EquipmentCtx.Provider>
  );
}

/**
 * Sub-component group. `explode` is the offset applied in exploded view.
 */
export function Part({ id, explode = [0, 0, 0], children, position = [0, 0, 0], rotation }: {
  id: string;
  explode?: [number, number, number];
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const eq = useEquipmentId();
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const st = useAppStore.getState();
    const k = st.componentMode && st.selected === eq ? st.explode : 0;
    g.position.set(position[0] + explode[0] * k, position[1] + explode[1] * k, position[2] + explode[2] * k);
  });
  return (
    <group ref={ref} position={position} rotation={rotation} userData={{ componentId: id }}>
      {children}
    </group>
  );
}
