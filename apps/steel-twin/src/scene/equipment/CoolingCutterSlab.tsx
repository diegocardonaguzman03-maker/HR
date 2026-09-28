import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { strandAngle, strandPoint } from '../../sim/strandPath';
import { currentPose, slabPosition } from '../../sim/kinematics';
import { clock } from '../../sim/clock';
import { useAppStore } from '../../store/useAppStore';

const HALF_T = (LAYOUT.strand.thickness * LAYOUT.strand.thicknessScale) / 2;
const HALF_W = LAYOUT.strand.width / 2;
const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** Secondary cooling system, primary mold water circuit and emergency water. */
export function CoolingSystem() {
  const cooling = useAppStore((s) => s.layers.cooling);
  const headers = useMemo(() => {
    const out: { x: number; y: number; a: number }[] = [];
    for (let s = 1.2; s < 26; s += 1.3) {
      const p = strandPoint(s);
      out.push({ x: p.x, y: p.y, a: strandAngle(s) });
    }
    return out;
  }, []);
  const pipeMat = cooling ? MAT.pipeWater : MAT.steel;
  const [mx, my] = LAYOUT.mold.meniscus;

  return (
    <EquipmentGroup id="coolingSystem">
      <Part id="sprayZones" explode={[0, 0, 3]}>
        {headers.map((h, i) => (
          <group key={i} position={[h.x, h.y, 0]} rotation={[0, 0, h.a]}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[0, side * (HALF_T + 0.42), 0]} material={pipeMat}>
                <boxGeometry args={[0.08, 0.08, LAYOUT.strand.width + 0.6]} />
              </mesh>
            ))}
          </group>
        ))}
      </Part>
      <Part id="nozzles" explode={[0, 0, -3]}>
        {headers.filter((_, i) => i % 3 === 0).map((h, i) => (
          <mesh key={i} position={[h.x, h.y, HALF_W + 0.75]} rotation={[Math.PI / 2, 0, 0]} material={pipeMat}>
            <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
          </mesh>
        ))}
      </Part>
      <Part id="sprayChamber" explode={[0, 2, 0]}>
        {/* open frame so the strand stays visible */}
        {[[10.6, 6, 0.3], [27, 3.2, 0.3]].map(([x, h]) => (
          <group key={x}>
            {[-1, 1].map((sz) => (
              <mesh key={sz} position={[x, h / 2 + 0.2, sz * (HALF_W + 1.7)]} material={MAT.structure} userData={{ xray: true }}>
                <boxGeometry args={[0.3, h, 0.3]} />
              </mesh>
            ))}
          </group>
        ))}
        {[-1, 1].map((sz) => (
          <mesh key={sz} position={[18.8, 6.4, sz * (HALF_W + 1.7)]} material={MAT.structure} userData={{ xray: true }}>
            <boxGeometry args={[16.8, 0.3, 0.3]} />
          </mesh>
        ))}
      </Part>
      <Part id="steamExhaust" explode={[0, 3, 0]}>
        <mesh position={[17, 9.5, -HALF_W - 1.7]} material={MAT.darkSteel}>
          <cylinderGeometry args={[0.6, 0.6, 6, 14]} />
        </mesh>
      </Part>
      <Part id="primaryWater" explode={[0, 0, 2]}>
        <mesh position={[mx - 1.2, my - 3, 1.4]} material={pipeMat}>
          <cylinderGeometry args={[0.18, 0.18, 6, 10]} />
        </mesh>
        <mesh position={[mx - 5, my - 6, 1.4]} rotation={[0, 0, Math.PI / 2]} material={pipeMat}>
          <cylinderGeometry args={[0.18, 0.18, 7.6, 10]} />
        </mesh>
      </Part>
      <Part id="emergencyWater" explode={[0, 3, 3]}>
        <group position={[2, 0, 9]}>
          <mesh position={[0, 16, 0]} material={cooling ? MAT.pipeWater : MAT.structure}>
            <cylinderGeometry args={[1.8, 1.8, 4, 20]} />
          </mesh>
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => (
            <mesh key={`${a}${b}`} position={[a * 1.3, 7, b * 1.3]} material={MAT.structure}>
              <boxGeometry args={[0.25, 14, 0.25]} />
            </mesh>
          ))}
          <mesh position={[3, 10, -3]} rotation={[0.6, 0, -0.8]} material={pipeMat}>
            <cylinderGeometry args={[0.15, 0.15, 11, 8]} />
          </mesh>
        </group>
      </Part>
    </EquipmentGroup>
  );
}

/** Oxy-gas torch cutting machine travelling with the strand. */
export function TorchCutter() {
  const cut = strandPoint(LAYOUT.strand.cutPosition);
  const car = useRef<THREE.Group>(null);
  const flames = useRef<(THREE.Mesh | null)[]>([]);
  const sparks = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 4, 3), MAT.molten, 60);
    m.userData.steel = true;
    return m;
  }, []);

  useFrame(() => {
    const pose = currentPose();
    const cutting = pose.state === 'CUTTING' && pose.p > 0.35 && pose.p < 0.85;
    const travel = pose.state === 'CUTTING' ? smooth((pose.p - 0.3) / 0.55) * 1.6 : 0;
    const traverse = cutting ? Math.sin(((pose.p - 0.35) / 0.5) * Math.PI) * HALF_W * 0.95 : 0;
    car.current?.position.set(cut.x + travel, cut.y, 0);
    flames.current.forEach((f, i) => {
      if (!f) return;
      f.visible = cutting;
      f.position.z = (i === 0 ? -1 : 1) * Math.abs(traverse) * 0.9;
    });
    const d = new THREE.Object3D();
    for (let i = 0; i < 60; i++) {
      const t = (i / 60 + clock.elapsed * 1.7) % 1;
      const zz = (i % 2 ? 1 : -1) * Math.abs(traverse) * 0.9;
      d.position.set(travel + (Math.sin(i * 7.3) * 0.5) * t, -HALF_T - t * 1.4, zz + Math.cos(i * 3.1) * 0.4 * t);
      d.scale.setScalar(cutting ? 1 - t * 0.7 : 0.0001);
      d.updateMatrix();
      sparks.setMatrixAt(i, d.matrix);
    }
    sparks.instanceMatrix.needsUpdate = true;
  });

  return (
    <EquipmentGroup id="torchCutter">
      <group position={[cut.x, cut.y, 0]}>
        <primitive object={sparks} />
      </group>
      <group ref={car}>
        <Part id="torchCar" explode={[0, 2.5, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0.9, s * (HALF_W + 0.5)]} castShadow material={MAT.paintYellow}>
              <boxGeometry args={[1.2, 2.2, 0.3]} />
            </mesh>
          ))}
          <mesh position={[0, 2.1, 0]} material={MAT.paintYellow}>
            <boxGeometry args={[1.3, 0.4, LAYOUT.strand.width + 1.4]} />
          </mesh>
        </Part>
        <Part id="torches" explode={[0, 1.5, 0]}>
          {[0, 1].map((i) => (
            <group key={i}>
              <mesh position={[0.2, 1.1, (i === 0 ? -1 : 1) * 0.4]} material={MAT.steel}>
                <cylinderGeometry args={[0.06, 0.06, 1.4, 8]} />
              </mesh>
              <mesh ref={(m) => { flames.current[i] = m; }} position={[0.2, HALF_T + 0.1, 0]} rotation={[Math.PI, 0, 0]} material={MAT.flame} userData={{ steel: true }}>
                <coneGeometry args={[0.06, 0.35, 8]} />
              </mesh>
            </group>
          ))}
        </Part>
        <Part id="clamps" explode={[0, 0, 2]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[-0.3, 0, s * (HALF_W + 0.15)]} material={MAT.darkSteel}>
              <boxGeometry args={[0.4, 0.5, 0.25]} />
            </mesh>
          ))}
        </Part>
      </group>
      <Part id="gasSupply" explode={[0, 0, -3]}>
        {[['#56b36a', -0.3], ['#9aa4ad', 0.3]].map(([c, dz]) => (
          <mesh key={String(c)} position={[cut.x - 1.5, 1.4, -HALF_W - 1.4 + Number(dz)]}>
            <cylinderGeometry args={[0.22, 0.22, 2.4, 10]} />
            <meshStandardMaterial color={String(c)} metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
      </Part>
    </EquipmentGroup>
  );
}

/** Run-out table, deburring/marking and the finished slab. */
export function SlabLine() {
  const cut = strandPoint(LAYOUT.strand.cutPosition);
  const slab = useRef<THREE.Group>(null);
  const label = useRef<HTMLDivElement>(null);
  const L = LAYOUT.strand.slabLength;
  const rollerXs = useMemo(() => Array.from({ length: 28 }, (_, i) => cut.x - 1 + i * 0.85), [cut.x]);

  useFrame(() => {
    const pose = currentPose();
    const cutDone = (pose.state === 'CUTTING' && pose.p > 0.85) || pose.state === 'COMPLETE';
    const g = slab.current;
    if (!g) return;
    g.visible = cutDone;
    const p = slabPosition(pose);
    g.position.set(p[0], p[1], p[2]);
    if (label.current) label.current.style.opacity = cutDone ? '1' : '0';
  });

  return (
    <EquipmentGroup id="slab">
      <Part id="runoutTable" explode={[0, -1.5, 0]}>
        {rollerXs.map((x) => (
          <mesh key={x} position={[x, cut.y - HALF_T - 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.steel}>
            <cylinderGeometry args={[0.12, 0.12, LAYOUT.strand.width + 0.3, 10]} />
          </mesh>
        ))}
        <mesh position={[cut.x + 11, (cut.y - HALF_T - 0.3) / 2, 0]} material={MAT.structure} userData={{ noPick: false }}>
          <boxGeometry args={[25, cut.y - HALF_T - 0.3, LAYOUT.strand.width + 0.6]} />
        </mesh>
      </Part>
      <Part id="slabId" explode={[0, 2, 0]}>
        <mesh position={[cut.x + 15, cut.y + 1.3, -HALF_W - 0.7]} material={MAT.paintYellow}>
          <boxGeometry args={[1.2, 2.2, 0.8]} />
        </mesh>
      </Part>
      <Part id="crossTransfer" explode={[0, -1, 2]}>
        {[-2, 2].map((dx) => (
          <mesh key={dx} position={[LAYOUT.slabYard[0] + dx, 0.6, 3]} material={MAT.darkSteel}>
            <boxGeometry args={[0.5, 1.2, 8]} />
          </mesh>
        ))}
      </Part>
      <Part id="slabYard" explode={[0, 0, 3]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[LAYOUT.slabYard[0], 0.2 + i * 0.4, LAYOUT.slabYard[2] + 4]} castShadow material={MAT.darkSteel}>
            <boxGeometry args={[L, HALF_T * 2, LAYOUT.strand.width]} />
          </mesh>
        ))}
      </Part>
      <group ref={slab}>
        <mesh castShadow userData={{ steel: true }}>
          <boxGeometry args={[L, HALF_T * 2, LAYOUT.strand.width]} />
          <meshStandardMaterial color="#6a3a28" emissive="#8a2a0a" emissiveIntensity={0.5} metalness={0.4} roughness={0.6} />
        </mesh>
        <Html position={[0, 1.1, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
          <div ref={label} className="pointer-events-none whitespace-nowrap rounded border border-white/15 bg-black/70 px-2 py-1 font-mono text-[10px] text-white/90">
            COLADA 26-4718 · PLANCHÓN 01 · 230×1500×10 000 mm
          </div>
        </Html>
      </group>
    </EquipmentGroup>
  );
}
