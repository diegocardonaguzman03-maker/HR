import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { M, emissive, mat } from './materials';
import { useStore } from '../store/useStore';

// Mini-scenes that make each department readable at a glance. All motion is decorative and
// tied to the department's purpose (funnel cards, knowledge pipeline, audit line, furnace…).

/** Small neutral figure for trainees, candidates and operators (not agents). */
export function Figure({ color = '#8b95a3', helmet = false, hiVis = false, seated = false, scale = 0.92 }: { color?: string; helmet?: boolean; hiVis?: boolean; seated?: boolean; scale?: number }) {
  const body = hiVis ? M.hiVis : mat(color, 0.7);
  return (
    <group scale={scale}>
      {!seated && (
        <>
          <mesh position={[-0.1, 0.42, 0]} material={M.chair}>
            <capsuleGeometry args={[0.08, 0.62, 4, 8]} />
          </mesh>
          <mesh position={[0.1, 0.42, 0]} material={M.chair}>
            <capsuleGeometry args={[0.08, 0.62, 4, 8]} />
          </mesh>
        </>
      )}
      <mesh position={[0, seated ? 0.75 : 1.2, 0]} castShadow material={body}>
        <capsuleGeometry args={[0.19, 0.42, 4, 10]} />
      </mesh>
      <mesh position={[0, seated ? 1.18 : 1.63, 0]} material={mat('#c9a184', 0.6)}>
        <sphereGeometry args={[0.13, 14, 12]} />
      </mesh>
      {helmet && (
        <mesh position={[0, seated ? 1.25 : 1.7, 0]} material={M.helmet}>
          <sphereGeometry args={[0.15, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      )}
    </group>
  );
}

function Chair({ p, r = 0 }: { p: [number, number, number]; r?: number }) {
  return (
    <group position={p} rotation-y={r}>
      <mesh position={[0, 0.45, 0]} material={M.chair}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
      </mesh>
      <mesh position={[0, 0.75, -0.22]} material={M.chair}>
        <boxGeometry args={[0.5, 0.55, 0.06]} />
      </mesh>
      <mesh position={[0, 0.22, 0]} material={M.steel}>
        <cylinderGeometry args={[0.04, 0.04, 0.44, 6]} />
      </mesh>
    </group>
  );
}

export function Props() {
  return (
    <group>
      <TalentProps />
      <ODProps />
      <LDProps />
      <OpsProps />
      <AIProps />
      <AuditProps />
      <Vehicles />
    </group>
  );
}

// ---------------- Talent Acquisition ----------------
function TalentProps() {
  const cands = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    cands.current.forEach((g, i) => {
      if (!g) return;
      // Candidates walk in from the corridor door toward the pipeline wall, then fade out.
      const u = (t * 0.06 + i / 4) % 1;
      const a = new THREE.Vector3(-26, 0, 5.6);
      const b = new THREE.Vector3(-28, 0, 8.4);
      const c = new THREE.Vector3(-36, 0, 12.2);
      const p = u < 0.3 ? a.lerp(b, u / 0.3) : b.lerp(c, (u - 0.3) / 0.7);
      g.position.copy(p);
      g.rotation.y = u < 0.3 ? -0.6 : -1.1;
      g.scale.setScalar(0.8 * Math.min(1, (1 - u) * 6, u * 10));
    });
  });
  return (
    <group>
      {/* interview booth */}
      <group position={[-41, 0, 20.9]}>
        <mesh position={[0, 1.25, 1.55]} material={M.glass}>
          <boxGeometry args={[3.4, 2.5, 0.05]} />
        </mesh>
        {[-1.7, 1.7].map((x) => (
          <mesh key={x} position={[x, 1.25, 0.2]} material={M.glass}>
            <boxGeometry args={[0.05, 2.5, 2.7]} />
          </mesh>
        ))}
        <mesh position={[0, 2.5, 0.2]} material={M.frame}>
          <boxGeometry args={[3.5, 0.06, 2.8]} />
        </mesh>
        <mesh position={[0, 0.74, -0.15]} material={M.deskTop}>
          <boxGeometry args={[1.4, 0.05, 0.8]} />
        </mesh>
        <Chair p={[0, 0, -0.95]} />
        <group position={[0, 0, -0.95]}>
          <Figure color="#64748b" seated />
        </group>
      </group>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} ref={(g) => { if (g) cands.current[i] = g; }}>
          <Figure color={['#94a3b8', '#7c8798', '#a3aab5', '#6b7280'][i]} />
        </group>
      ))}
      {/* lounge */}
      <mesh position={[-28.5, 0.3, 22.4]} material={mat('#3b4a63', 0.8)}>
        <boxGeometry args={[3, 0.6, 1]} />
      </mesh>
    </group>
  );
}

// ---------------- Organizational Development ----------------
function ODProps() {
  const g = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const out: { p: THREE.Vector3; parent: number }[] = [{ p: new THREE.Vector3(0, 1.0, 0), parent: -1 }];
    for (let i = 0; i < 3; i++) out.push({ p: new THREE.Vector3(-1.1 + i * 1.1, 0.3, 0), parent: 0 });
    for (let i = 0; i < 6; i++) out.push({ p: new THREE.Vector3(-1.5 + i * 0.6, -0.4, 0), parent: 1 + Math.floor(i / 2) });
    return out;
  }, []);
  const lineGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    nodes.forEach((n) => { if (n.parent >= 0) pts.push(n.p, nodes[n.parent].p); });
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [nodes]);
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) g.current.rotation.y = Math.sin(t * 0.3) * 0.35;
    nodeRefs.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = nodes[i].p.y + Math.sin(t * 1.4 + i) * 0.05;
      const k = 1 + 0.25 * Math.max(0, Math.sin(t * 0.8 + i * 1.7));
      m.scale.setScalar(k);
    });
  });
  const nodeMat = useMemo(() => emissive('#c084fc', 1.8), []);
  const hot = useMemo(() => emissive('#F58220', 2.2), []);
  return (
    <group>
      <group ref={g} position={[-13, 2.1, 18.7]}>
        <lineSegments geometry={lineGeo}>
          <lineBasicMaterial color="#a78bfa" transparent opacity={0.7} />
        </lineSegments>
        {nodes.map((n, i) => (
          <mesh key={i} ref={(m) => { if (m) nodeRefs.current[i] = m; }} position={n.p} material={i === 4 || i === 7 ? hot : nodeMat}>
            <sphereGeometry args={[i === 0 ? 0.16 : 0.1, 16, 12]} />
          </mesh>
        ))}
      </group>
      <mesh position={[-13, 0.06, 18.7]} material={emissive('#7c3aed', 0.8)}>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
      </mesh>
      {/* career path floor track */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-21 + i * 1.5, 0.03, 22.5]} material={emissive(['#a855f7', '#c084fc', '#e9d5ff', '#F58220'][i], 0.5)}>
          <circleGeometry args={[0.4, 24]} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------- Learning & Development ----------------
function LDProps() {
  const climber = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (climber.current) climber.current.position.y = 0.3 + (Math.sin(clock.elapsedTime * 0.25) * 0.5 + 0.5) * 2.6;
  });
  return (
    <group>
      {/* classroom */}
      {[-19.4, -17.8, -16.2].map((z, r) =>
        [-20.5, -19, -17.5, -16, -14.5].map((x, c) => (
          <group key={`${r}${c}`}>
            <Chair p={[x, 0, z]} r={Math.PI} />
            {(r + c) % 2 === 0 && (
              <group position={[x, 0, z]} rotation-y={Math.PI}>
                <Figure seated color={['#6b7280', '#475569', '#94a3b8'][c % 3]} />
              </group>
            )}
          </group>
        )),
      )}
      {/* working at heights tower */}
      <group position={[-10.5, 0, -14.6]}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
          <mesh key={i} position={[x, 2.4, z]} material={M.yellow} castShadow>
            <boxGeometry args={[0.1, 4.8, 0.1]} />
          </mesh>
        ))}
        {[1.2, 2.4, 3.6, 4.8].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={M.steelLight}>
            <boxGeometry args={[2.1, 0.06, 2.1]} />
          </mesh>
        ))}
        <mesh position={[0, 4.95, 0]} material={M.orange}>
          <boxGeometry args={[2.2, 0.08, 0.08]} />
        </mesh>
        <group ref={climber} position={[0, 0.3, 1.05]} rotation-y={Math.PI}>
          <Figure hiVis helmet />
          <mesh position={[0, 3, 0]} material={emissive('#facc15', 1)}>
            <cylinderGeometry args={[0.015, 0.015, 6, 4]} />
          </mesh>
        </group>
      </group>
      {/* OJT zone */}
      <group position={[-20, 0, -11.4]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.6]} material={emissive('#f2c230', 0.25)}>
          <ringGeometry args={[2.0, 2.1, 4, 1]} />
        </mesh>
        <mesh position={[0, 0.65, 0]} material={mat('#2f5d50', 0.5, 0.4)} castShadow>
          <boxGeometry args={[2.2, 1.3, 0.9]} />
        </mesh>
        <mesh position={[0.6, 1.5, 0.1]} material={M.steelLight}>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
        </mesh>
        <mesh position={[-0.5, 1.35, 0.46]} material={emissive('#22c55e', 1.2)}>
          <boxGeometry args={[0.5, 0.3, 0.02]} />
        </mesh>
        {[-1.2, 1.2].map((x) => (
          <group key={x} position={[x, 0, 0.8]} rotation-y={Math.PI + (x < 0 ? 0.4 : -0.4)}>
            <Figure hiVis helmet />
          </group>
        ))}
      </group>
      {/* maintenance academy bench */}
      <group position={[-5.2, 0, -11.2]}>
        <mesh position={[0, 0.9, 0]} material={M.wood} castShadow>
          <boxGeometry args={[2.4, 0.08, 1]} />
        </mesh>
        <mesh position={[0, 0.45, 0]} material={M.steel}>
          <boxGeometry args={[2.2, 0.9, 0.8]} />
        </mesh>
        <mesh position={[-0.4, 1.2, 0]} rotation-z={Math.PI / 2} material={mat('#1f4e8c', 0.4, 0.6)} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.7, 20]} />
        </mesh>
        <mesh position={[0.35, 1.2, 0]} rotation-z={Math.PI / 2} material={M.steelLight}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        </mesh>
        <mesh position={[0.8, 1.15, 0]} material={mat('#6b7280', 0.4, 0.6)}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
        </mesh>
      </group>
      {/* leadership round table */}
      <group position={[-42.5, 0, -10.6]}>
        <mesh position={[0, 0.74, 0]} material={M.deskTop}>
          <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
        </mesh>
        <mesh position={[0, 0.37, 0]} material={M.steel}>
          <cylinderGeometry args={[0.08, 0.08, 0.74, 8]} />
        </mesh>
        {[0, 2.1, 4.2].map((a) => (
          <group key={a} position={[Math.sin(a) * 1.3, 0, Math.cos(a) * 1.3]} rotation-y={a + Math.PI}>
            <Chair p={[0, 0, 0]} />
            <Figure seated color="#475569" />
          </group>
        ))}
      </group>
    </group>
  );
}

// ---------------- Industrial Operations ----------------
function OpsProps() {
  const ore = useRef<THREE.InstancedMesh>(null);
  const truck = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const N = 14;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ore.current) {
      for (let i = 0; i < N; i++) {
        const u = (t * 0.05 + i / N) % 1;
        dummy.position.set(5 + u * 16, 1.02, -11.6 - u * 1.2);
        dummy.rotation.set(i, i * 2, 0);
        dummy.updateMatrix();
        ore.current.setMatrixAt(i, dummy.matrix);
      }
      ore.current.instanceMatrix.needsUpdate = true;
    }
    if (truck.current) {
      const a = t * 0.35;
      truck.current.position.set(17 + Math.cos(a) * 1.3, 1.08, -17 + Math.sin(a) * 0.7);
      truck.current.rotation.y = -a;
    }
    if (glow.current) glow.current.emissiveIntensity = 2.4 + Math.sin(t * 7) * 0.6 + Math.sin(t * 13) * 0.3;
  });
  return (
    <group>
      {/* conveyor feeding the furnace */}
      <group>
        <mesh position={[13, 0.85, -12.2]} rotation-y={0.075} material={M.rubber} castShadow>
          <boxGeometry args={[16.2, 0.12, 0.9]} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[5.5 + i * 1.9, 0.42, -11.65 - i * 0.14]} material={M.steel}>
            <boxGeometry args={[0.1, 0.84, 0.8]} />
          </mesh>
        ))}
        <instancedMesh ref={ore} args={[undefined, undefined, N]} material={mat('#5b3a29', 0.9)}>
          <dodecahedronGeometry args={[0.16, 0]} />
        </instancedMesh>
      </group>
      {/* electric arc furnace model */}
      <group position={[25, 0, -14]}>
        <mesh position={[0, 1.1, 0]} material={mat('#3b3f46', 0.6, 0.6)} castShadow>
          <cylinderGeometry args={[2.1, 1.8, 2.2, 32]} />
        </mesh>
        <mesh position={[0, 2.3, 0]} material={M.steel}>
          <cylinderGeometry args={[2.2, 2.2, 0.25, 32]} />
        </mesh>
        <mesh position={[0, 2.18, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
          <meshStandardMaterial ref={glow} color="#ff7a1a" emissive="#ff5a00" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        {[0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.sin(a) * 0.6, 3.9, Math.cos(a) * 0.6]} material={mat('#22262b', 0.5, 0.3)}>
            <cylinderGeometry args={[0.18, 0.18, 3.2, 12]} />
          </mesh>
        ))}
        <mesh position={[0, 5.3, -0.4]} material={M.orange}>
          <boxGeometry args={[2.6, 0.3, 0.5]} />
        </mesh>
        <pointLight position={[0, 3, 0]} color="#ff7a1a" intensity={18} distance={10} />
      </group>
      {/* mine diorama with a haul truck */}
      <group position={[17, 0, -17]}>
        <mesh position={[0, 0.5, 0]} material={M.darkTop}>
          <boxGeometry args={[4.2, 1, 2.6]} />
        </mesh>
        {[1.5, 1.1, 0.7].map((r, i) => (
          <mesh key={r} position={[0, 1.02 - i * 0.05, 0]} scale={[1, 1, 0.55]} material={mat(['#8a6a4c', '#7a5a3e', '#6a4c33'][i], 0.95)}>
            <cylinderGeometry args={[r, r, 0.06, 32]} />
          </mesh>
        ))}
        <group ref={truck}>
          <mesh material={M.yellow} scale={0.6}>
            <boxGeometry args={[0.5, 0.2, 0.3]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ---------------- AI & Digital Lab ----------------
function AIProps() {
  const docs = useRef<THREE.InstancedMesh>(null);
  const emb = useRef<THREE.InstancedMesh>(null);
  const graph = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ND = 8;
  const NE = 24;
  const graphData = useMemo(() => {
    const pts = Array.from({ length: 18 }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 18);
      const th = Math.PI * (1 + Math.sqrt(5)) * i;
      return new THREE.Vector3(Math.cos(th) * Math.sin(phi), Math.cos(phi), Math.sin(th) * Math.sin(phi)).multiplyScalar(1.3);
    });
    const seg: THREE.Vector3[] = [];
    pts.forEach((p, i) => pts.forEach((q, j) => { if (j > i && p.distanceTo(q) < 1.15) seg.push(p, q); }));
    return { pts, geo: new THREE.BufferGeometry().setFromPoints(seg) };
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (docs.current) {
      for (let i = 0; i < ND; i++) {
        const u = (t * 0.07 + i / ND) % 1;
        dummy.position.set(12.5 + u * 13, 1.25 + Math.sin(u * Math.PI) * 0.2, 10.6);
        dummy.rotation.set(-0.3, 0, 0);
        dummy.scale.setScalar(u > 0.92 ? (1 - u) / 0.08 : 1);
        dummy.updateMatrix();
        docs.current.setMatrixAt(i, dummy.matrix);
      }
      docs.current.instanceMatrix.needsUpdate = true;
    }
    if (emb.current) {
      for (let i = 0; i < NE; i++) {
        const u = (t * 0.25 + i / NE) % 1;
        const a = i * 2.4;
        dummy.position.set(27 + Math.cos(a) * 0.5, 1.2 + u * 3, 10.6 + Math.sin(a) * 0.5);
        dummy.rotation.set(t + i, t, 0);
        dummy.scale.setScalar(0.6 * (1 - u));
        dummy.updateMatrix();
        emb.current.setMatrixAt(i, dummy.matrix);
      }
      emb.current.instanceMatrix.needsUpdate = true;
    }
    if (graph.current) graph.current.rotation.y = t * 0.15;
  });
  const cyan = useMemo(() => emissive('#22d3ee', 2), []);
  return (
    <group>
      {/* ingestion rail */}
      <mesh position={[19, 1.0, 10.6]} material={M.steel}>
        <boxGeometry args={[14, 0.08, 0.5]} />
      </mesh>
      <mesh position={[19, 1.05, 10.6]} material={emissive('#22d3ee', 0.8)}>
        <boxGeometry args={[14, 0.02, 0.06]} />
      </mesh>
      {[13, 19, 25].map((x) => (
        <mesh key={x} position={[x, 0.5, 10.6]} material={M.steel}>
          <boxGeometry args={[0.1, 1, 0.3]} />
        </mesh>
      ))}
      <instancedMesh ref={docs} args={[undefined, undefined, ND]} material={M.white}>
        <boxGeometry args={[0.42, 0.56, 0.02]} />
      </instancedMesh>
      {/* vector database stack */}
      <group position={[27, 0, 10.6]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.35 + i * 0.42, 0]} material={i % 2 ? M.navy : cyan} castShadow>
            <cylinderGeometry args={[0.65, 0.65, 0.34, 32]} />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={emb} args={[undefined, undefined, NE]} material={cyan}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
      </instancedMesh>
      {/* knowledge graph */}
      <group ref={graph} position={[22.5, 2.4, 18.8]}>
        <lineSegments geometry={graphData.geo}>
          <lineBasicMaterial color="#67e8f9" transparent opacity={0.55} />
        </lineSegments>
        {graphData.pts.map((p, i) => (
          <mesh key={i} position={p} material={i % 5 === 0 ? emissive('#F58220', 2) : cyan}>
            <sphereGeometry args={[0.08, 12, 10]} />
          </mesh>
        ))}
      </group>
      <mesh position={[22.5, 0.06, 18.8]} material={emissive('#0e7490', 0.8)}>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 32]} />
      </mesh>
      {/* server racks */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[27.6, 0, 16 + i * 1.3]}>
          <mesh position={[0, 1.1, 0]} material={M.bezel} castShadow>
            <boxGeometry args={[0.9, 2.2, 1.1]} />
          </mesh>
          {[0.5, 0.9, 1.3, 1.7].map((y) => (
            <mesh key={y} position={[-0.46, y, 0]} material={emissive(y > 1.2 ? '#22d3ee' : '#22c55e', 1.5)}>
              <boxGeometry args={[0.01, 0.04, 0.6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ---------------- Quality & Audit ----------------
function AuditProps() {
  const files = useRef<THREE.InstancedMesh>(null);
  const stamp = useRef<THREE.Group>(null);
  const lights = useRef<THREE.MeshStandardMaterial[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const N = 9;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (files.current) {
      for (let i = 0; i < N; i++) {
        const u = (t * 0.06 + i / N) % 1;
        dummy.position.set(34.2 + u * 9.6, 1.0, 14);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        files.current.setMatrixAt(i, dummy.matrix);
        // files turn green after the last gate, a few get flagged red
        const flagged = i % 4 === 1;
        color.set(u > 0.75 ? (flagged ? '#ef4444' : '#22c55e') : u > 0.3 ? '#fbbf24' : '#e5e7eb');
        files.current.setColorAt(i, color);
      }
      files.current.instanceMatrix.needsUpdate = true;
      if (files.current.instanceColor) files.current.instanceColor.needsUpdate = true;
    }
    if (stamp.current) stamp.current.position.y = 1.9 - Math.max(0, Math.sin(t * 2.2)) * 0.6;
    lights.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = 1.2 + Math.max(0, Math.sin(t * 2 + i * 1.3)) * 2.2;
    });
  });
  return (
    <group>
      <mesh position={[39, 0.86, 14]} material={M.rubber} castShadow>
        <boxGeometry args={[10, 0.1, 0.9]} />
      </mesh>
      {[34.5, 39, 43.5].map((x) => (
        <mesh key={x} position={[x, 0.42, 14]} material={M.steel}>
          <boxGeometry args={[0.1, 0.84, 0.8]} />
        </mesh>
      ))}
      <instancedMesh ref={files} args={[undefined, undefined, N]}>
        <boxGeometry args={[0.5, 0.36, 0.05]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      {[36.5, 39, 41.5].map((x, i) => (
        <group key={x} position={[x, 0, 14]}>
          {[-0.6, 0.6].map((z) => (
            <mesh key={z} position={[0, 1.15, z]} material={M.frame}>
              <boxGeometry args={[0.1, 2.3, 0.1]} />
            </mesh>
          ))}
          <mesh position={[0, 2.3, 0]}>
            <boxGeometry args={[0.14, 0.14, 1.3]} />
            <meshStandardMaterial ref={(m) => { if (m) lights.current[i] = m; }} color={['#fbbf24', '#fbbf24', '#22c55e'][i]} emissive={['#fbbf24', '#fbbf24', '#22c55e'][i]} emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <group ref={stamp} position={[43, 1.9, 14]}>
        <mesh material={M.navy}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
        </mesh>
        <mesh position={[0, 0.6, 0]} material={M.steelLight}>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
        </mesh>
      </group>
      <mesh position={[39, 2.85, 8.6]} material={emissive('#10b981', 0.9)}>
        <boxGeometry args={[11, 0.05, 0.05]} />
      </mesh>
    </group>
  );
}

// ---------------- Vehicles ----------------
function Vehicles() {
  const fork = useRef<THREE.Group>(null);
  const agv1 = useRef<THREE.Group>(null);
  const agv2 = useRef<THREE.Group>(null);
  const speed = useStore((s) => s.speed);
  const clock = useRef(0);
  useFrame((_, dt) => {
    clock.current += dt * (speed === 0 ? 0 : 1);
    const t = clock.current;
    if (fork.current) {
      // rectangular loop inside the logistics bay
      const L = [[35, -21], [43, -21], [43, -10], [35, -10]];
      const per = 26;
      const u = (t / per) % 1;
      const seg = Math.floor(u * 4);
      const f = u * 4 - seg;
      const a = L[seg];
      const b = L[(seg + 1) % 4];
      fork.current.position.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f);
      fork.current.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
    }
    if (agv1.current) {
      const x = -24 + Math.sin(t * 0.06) * 18;
      agv1.current.position.set(x, 0, -2.4);
      agv1.current.rotation.y = Math.cos(t * 0.06) > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    if (agv2.current) {
      const x = 24 + Math.sin(t * 0.05 + 2) * 17;
      agv2.current.position.set(x, 0, 2.4);
      agv2.current.rotation.y = Math.cos(t * 0.05 + 2) > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
  });
  return (
    <group>
      <group ref={fork}>
        <mesh position={[0, 0.55, 0]} material={M.orange} castShadow>
          <boxGeometry args={[1.0, 0.8, 1.6]} />
        </mesh>
        <mesh position={[0, 1.4, -0.2]} material={M.frame}>
          <boxGeometry args={[0.9, 0.06, 0.9]} />
        </mesh>
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, 1.0, -0.6]} material={M.frame}>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
          </mesh>
        ))}
        <mesh position={[0, 1.2, 1.1]} material={M.steel}>
          <boxGeometry args={[0.9, 1.9, 0.12]} />
        </mesh>
        <mesh position={[0, 0.5, 1.5]} material={mat('#a0784e', 0.8)}>
          <boxGeometry args={[1.0, 0.7, 1.0]} />
        </mesh>
        {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} rotation-z={Math.PI / 2} material={M.rubber}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
          </mesh>
        ))}
      </group>
      {[agv1, agv2].map((r, i) => (
        <group key={i} ref={r}>
          <mesh position={[0, 0.2, 0]} material={M.white} castShadow>
            <boxGeometry args={[0.8, 0.3, 1.1]} />
          </mesh>
          <mesh position={[0, 0.37, 0.4]} material={emissive('#22d3ee', 2)}>
            <boxGeometry args={[0.6, 0.04, 0.05]} />
          </mesh>
          <mesh position={[0, 0.5, -0.1]} material={mat('#a0784e', 0.8)}>
            <boxGeometry args={[0.6, 0.3, 0.6]} />
          </mesh>
        </group>
      ))}
      {/* pallets and racking in the bay */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[45.2, 0, -21 + i * 4.5]}>
          {[0.1, 1.5, 2.9].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={M.orange}>
              <boxGeometry args={[1.2, 0.08, 3.6]} />
            </mesh>
          ))}
          {[0.6, 2.0].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={mat('#a0784e', 0.8)}>
              <boxGeometry args={[1.0, 0.8, 3.2]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
