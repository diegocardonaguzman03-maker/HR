import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { LAYOUT } from '../../config/layout';
import { currentPose, heatPosition } from '../../sim/kinematics';
import { simulationProvider } from '../../sim/SimulationDataProvider';
import { strandAngle, strandPoint } from '../../sim/strandPath';
import { clock } from '../../sim/clock';
import { LAYER_MARKERS } from '../../data/layerMarkers';
import { useAppStore } from '../../store/useAppStore';
import { MATERIAL_STATE_LABEL } from '../../ui/labels';
import { EQUIPMENT } from '../../data/equipment';
import { equipmentRegistry } from '../common/EquipmentGroup';
import type { EquipmentId } from '../../types/equipment';

/** PROCESS FLOW layer: stations linked by an arrowed path. */
export function ProcessFlowPath() {
  const pts = useMemo(() => {
    const raw: [number, number, number][] = [
      [LAYOUT.rawMaterials.position[0], 7, 0],
      [LAYOUT.eaf.position[0], 17, 0],
      [LAYOUT.ladle.tapPosition[0], 8, 0],
      [LAYOUT.ladleFurnace.position[0], 12, 0],
      [LAYOUT.turret.position[0] - LAYOUT.turret.armRadius, 21, 0],
      [LAYOUT.turret.position[0] + LAYOUT.turret.armRadius, 20, 0],
      [LAYOUT.tundish.position[0], 15, 0],
    ];
    for (let s = 0; s <= LAYOUT.strand.cutPosition + 12; s += 1.5) {
      const p = strandPoint(s);
      raw.push([p.x, p.y + 1.6, -1.8]);
    }
    raw.push([LAYOUT.slabYard[0], 2.5, LAYOUT.slabYard[2]]);
    return raw;
  }, []);
  const arrows = useMemo(() => {
    const out: { pos: THREE.Vector3; q: THREE.Quaternion }[] = [];
    for (let i = 0; i < pts.length - 1; i += 3) {
      const a = new THREE.Vector3(...pts[i]);
      const b = new THREE.Vector3(...pts[i + 1]);
      const dir = b.clone().sub(a).normalize();
      out.push({ pos: a.clone().lerp(b, 0.5), q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) });
    }
    return out;
  }, [pts]);
  return (
    <group>
      <Line points={pts} color="#7fb2ff" lineWidth={1.4} dashed dashSize={0.8} gapSize={0.5} transparent opacity={0.8} />
      {arrows.map((a, i) => (
        <mesh key={i} position={a.pos} quaternion={a.q}>
          <coneGeometry args={[0.35, 0.9, 10]} />
          <meshBasicMaterial color="#7fb2ff" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** STEEL FLOW layer: always answers "where is the steel?" */
export function SteelMarker() {
  const g = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const label = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const pose = currentPose();
    const p = heatPosition(pose);
    g.current?.position.set(p[0], p[1], p[2]);
    if (ring.current) {
      const k = 1 + 0.15 * Math.sin(clock.elapsed * 4);
      ring.current.scale.setScalar(k);
    }
    if (label.current) {
      const snap = simulationProvider.getSnapshot(pose.state, pose.p);
      label.current.textContent = `ACERO · ${MATERIAL_STATE_LABEL[snap.materialState]} · ${Math.round(snap.steelTemperature.value)} °C`;
    }
  });
  return (
    <group ref={g}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 8, 40]} />
        <meshBasicMaterial color="#ffb020" toneMapped={false} />
      </mesh>
      <Html position={[0, 2.4, 0]} center zIndexRange={[20, 0]}>
        <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-amber-400/60 bg-[#12151a]/85 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 shadow">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span ref={label}>ACERO</span>
        </div>
      </Html>
    </group>
  );
}

const LAYER_STYLE = {
  safety: 'border-red-400/70 bg-red-950/80 text-red-100',
  quality: 'border-violet-300/70 bg-violet-950/80 text-violet-100',
  maintenance: 'border-sky-300/70 bg-sky-950/80 text-sky-100',
} as const;
const LAYER_TAG = { safety: 'SAFETY', quality: 'QUALITY', maintenance: 'MAINT.' } as const;

/** SAFETY / QUALITY / MAINTENANCE pins. */
export function LayerMarkers() {
  const layers = useAppStore((s) => s.layers);
  const focus = useAppStore((s) => s.markerFocus);
  const setFocus = useAppStore((s) => s.setMarkerFocus);
  const markers = LAYER_MARKERS.filter((m) => layers[m.layer]);
  return (
    <>
      {markers.map((m) => {
        const open = focus?.id === m.id;
        return (
          <Html key={m.id} position={m.position} center zIndexRange={[28, 0]}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFocus(open ? null : { layer: m.layer, id: m.id });
              }}
              className={`max-w-[220px] cursor-pointer rounded-sm border px-1.5 py-0.5 text-left text-[10px] leading-tight shadow ${LAYER_STYLE[m.layer]}`}
            >
              <span className="font-bold tracking-wider opacity-80">{LAYER_TAG[m.layer]}</span> · {m.title}
              {open && <span className="mt-1 block font-normal opacity-90">{m.text}</span>}
            </button>
          </Html>
        );
      })}
    </>
  );
}

/** Cross-section plane along the strand (cross-section viewer position). */
export function SectionPlane() {
  const s = useAppStore((st) => st.sectionS);
  const show = useAppStore((st) => st.sectionOpen);
  const pose = currentPose();
  const snap = simulationProvider.getSnapshot(pose.state, pose.p);
  if (!show) return null;
  const p = strandPoint(Math.min(s, Math.max(0.2, snap.strand.castLength)));
  return (
    <group position={[p.x, p.y, 0]} rotation={[0, 0, strandAngle(s)]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LAYOUT.strand.width + 1.2, 1.4]} />
        <meshBasicMaterial color="#5aa9ff" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html position={[0, 1.2, 0]} center zIndexRange={[25, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-sm border border-sky-400/60 bg-[#12151a]/85 px-1.5 py-0.5 text-[10px] text-sky-200">
          Sección a {s.toFixed(1)} m
        </div>
      </Html>
    </group>
  );
}

/**
 * Floating name tags above every machine (game-style markers). They follow moving
 * equipment (crane, ladle) and open the info panel when clicked.
 */
export function EquipmentLabels() {
  const show = useAppStore((s) => s.layers.equipment && s.started && !s.componentMode);
  const selected = useAppStore((s) => s.selected);
  const refs = useRef<Partial<Record<EquipmentId, THREE.Group | null>>>({});
  const box = useMemo(() => new THREE.Box3(), []);
  const tick = useRef(0);
  useFrame((_, dt) => {
    tick.current += dt;
    if (tick.current < 0.1) return;
    tick.current = 0;
    for (const id of Object.keys(EQUIPMENT) as EquipmentId[]) {
      const g = refs.current[id];
      const obj = equipmentRegistry.get(id);
      if (!g || !obj) continue;
      box.setFromObject(obj);
      if (box.isEmpty()) continue;
      g.position.set((box.min.x + box.max.x) / 2, box.max.y + 1.2, (box.min.z + box.max.z) / 2);
    }
  });
  if (!show) return null;
  return (
    <>
      {(Object.keys(EQUIPMENT) as EquipmentId[]).map((id) => (
        <group key={id} ref={(g) => { refs.current[id] = g; }}>
          <Html center zIndexRange={[15, 0]} style={{ pointerEvents: 'auto' }}>
            <button
              onClick={() => useAppStore.getState().select(id)}
              className={`whitespace-nowrap border px-2 py-0.5 font-hud text-[10px] font-semibold uppercase tracking-[0.14em] shadow-lg backdrop-blur-sm transition hover:scale-105 ${
                selected === id ? 'border-amber-300 bg-amber-400 text-zinc-900' : 'border-white/25 bg-[#0d1015]/75 text-zinc-100 hover:border-amber-300'
              }`}
              style={{ clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)' }}
            >
              {EQUIPMENT[id].shortName}
            </button>
          </Html>
        </group>
      ))}
    </>
  );
}
