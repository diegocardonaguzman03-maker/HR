import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { bucketPose, currentPose, type Pose } from '../../sim/kinematics';
import { clock } from '../../sim/clock';
import { useAppStore } from '../../store/useAppStore';

const { shellRadius: RS, shellHeight: HS, platformHeight: PH, tapOffsetX } = LAYOUT.eaf;
const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** Liquid bath depth (m) in the furnace. */
function bathDepth(pose: Pose): number {
  const heel = 0.35;
  switch (pose.state) {
    case 'ARC_IGNITION': return heel + 0.1 * pose.p;
    case 'MELTING': return 0.45 + 1.0 * smooth(pose.p);
    case 'REFINING': return 1.45;
    case 'TAPPING': return 1.45 - 1.1 * smooth((pose.p - 0.15) / 0.7);
    default: return pose.before('ARC_IGNITION') ? heel : heel;
  }
}

function meltedFraction(pose: Pose): number {
  if (pose.before('ARC_IGNITION')) return 0;
  if (pose.state === 'ARC_IGNITION') return 0.05 * pose.p;
  if (pose.state === 'MELTING') return 0.05 + 0.95 * smooth(pose.p);
  return 1;
}

function tilt(pose: Pose): number {
  if (pose.state !== 'TAPPING') return 0;
  const fwd = smooth(pose.p / 0.2) * 0.24 + smooth((pose.p - 0.2) / 0.5) * 0.02;
  const back = smooth((pose.p - 0.85) / 0.15) * 0.3;
  return -(fwd - back);
}

/** Electrode tip height (m above pivot/shell bottom). */
function electrodeTip(pose: Pose): number {
  switch (pose.state) {
    case 'ARC_IGNITION': return 5.8 - 3.8 * smooth(pose.p);
    case 'MELTING': return 2.0 - 0.35 * smooth(pose.p);
    case 'REFINING': return 1.9;
    default: return 6.2;
  }
}

function roofOpen(pose: Pose): number {
  if (pose.state === 'CHARGING') return smooth(pose.p / 0.25) * (1 - smooth((pose.p - 0.85) / 0.15));
  return 0;
}

const arcOn = (pose: Pose) => pose.state === 'ARC_IGNITION' ? pose.p > 0.55 : pose.state === 'MELTING' || pose.state === 'REFINING';

const ELECTRODE_POS: [number, number][] = [0, 1, 2].map((i) => {
  const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
  return [Math.cos(a) * 1.15, Math.sin(a) * 1.15];
});

export function EAF() {
  const [ex, , ez] = LAYOUT.eaf.position;
  const tiltRef = useRef<THREE.Group>(null);
  const roofRef = useRef<THREE.Group>(null);
  const electrodeRef = useRef<THREE.Group>(null);
  const bathRef = useRef<THREE.Mesh>(null);
  const slagRef = useRef<THREE.Mesh>(null);
  const arcRefs = useRef<(THREE.Mesh | null)[]>([]);
  const arcLight = useRef<THREE.PointLight>(null);
  const streamRef = useRef<THREE.Mesh>(null);
  const jetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const layers = useAppStore((s) => s.layers);

  const scrap = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MAT.scrap, 24);
    m.userData.steel = true;
    return m;
  }, []);
  const scrapSeeds = useMemo(
    () => Array.from({ length: 24 }, (_, i) => {
      const r = 2.9 * Math.sqrt(((Math.sin(i * 7.1) + 1) / 2));
      const a = i * 2.39996;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.5 + ((i * 37) % 23) / 8, s: 0.4 + ((i * 13) % 10) / 12, rot: i };
    }),
    [],
  );

  useFrame(() => {
    const pose = currentPose();
    const t = clock.elapsed;
    if (tiltRef.current) tiltRef.current.rotation.z = tilt(pose);
    const open = roofOpen(pose);
    if (roofRef.current) {
      roofRef.current.position.y = 0.9 * open;
      roofRef.current.rotation.y = -1.3 * open;
    }
    if (electrodeRef.current) electrodeRef.current.position.y = electrodeTip(pose);
    const depth = bathDepth(pose);
    if (bathRef.current) {
      bathRef.current.scale.y = depth;
      bathRef.current.position.y = 0.35 + depth / 2;
    }
    const foam = pose.state === 'REFINING' ? 0.12 + 0.45 * smooth(pose.p / 0.4) : pose.state === 'MELTING' ? 0.1 + 0.1 * pose.p : 0.08;
    if (slagRef.current) {
      slagRef.current.scale.y = foam * (1 + 0.06 * Math.sin(t * 7));
      slagRef.current.position.y = 0.35 + depth + (foam * slagRef.current.scale.y) / (2 * foam);
      slagRef.current.visible = pose.after('RAW_MATERIALS');
    }
    // scrap inside furnace
    const b = bucketPose(pose);
    const inFurnace = pose.state === 'CHARGING' ? b.discharge : pose.after('CHARGING') ? 1 : 0;
    const melted = meltedFraction(pose);
    const d = new THREE.Object3D();
    scrapSeeds.forEach((sd, i) => {
      const visible = i / scrapSeeds.length < inFurnace && melted < 0.98;
      const fall = pose.state === 'CHARGING' ? Math.max(0, 1 - (inFurnace * scrapSeeds.length - i) / 6) * 5 : 0;
      d.position.set(sd.x, 0.35 + sd.y * (1 - melted * 0.6) + fall, sd.z);
      d.rotation.set(sd.rot, sd.rot * 1.3, sd.rot * 0.7);
      const k = visible ? sd.s * (1 - melted) : 0.0001;
      d.scale.set(k * 1.3, k * 0.35, k);
      d.updateMatrix();
      scrap.setMatrixAt(i, d.matrix);
    });
    scrap.instanceMatrix.needsUpdate = true;
    // arcs
    const on = arcOn(pose);
    arcRefs.current.forEach((m, i) => {
      if (!m) return;
      const f = on ? 0.7 + 0.5 * Math.abs(Math.sin(t * 31 + i * 2.1)) : 0.0001;
      m.scale.set(f * 0.5, f * 1.4, f * 0.5);
    });
    if (arcLight.current) arcLight.current.intensity = on ? 180 + 90 * Math.sin(t * 23) : 0;
    // oxygen / carbon jets (refining)
    jetRefs.current.forEach((m) => {
      if (m) m.visible = pose.state === 'REFINING' || (pose.state === 'MELTING' && pose.p > 0.3);
    });
    // tapping stream
    if (streamRef.current) {
      const on2 = pose.state === 'TAPPING' && pose.p > 0.15 && pose.p < 0.86;
      streamRef.current.scale.x = streamRef.current.scale.z = on2 ? 1 + 0.08 * Math.sin(t * 40) : 0.0001;
    }
  });

  const streamTop = PH + 0.2;
  const streamBottom = LAYOUT.ladle.height + 0.1;
  const streamX = LAYOUT.ladle.tapPosition[0] - ex;

  return (
    <EquipmentGroup id="eaf" position={[ex, 0, ez]}>
      {/* furnace pit / platform */}
      <mesh position={[-6, PH / 2 - 0.3, 0]} receiveShadow material={MAT.concrete} userData={{ noPick: true }}>
        <boxGeometry args={[6, PH - 0.6, 14]} />
      </mesh>
      <mesh position={[0, PH - 0.35, -6]} receiveShadow material={MAT.structure}>
        <boxGeometry args={[12, 0.3, 2]} />
      </mesh>

      <group ref={tiltRef} position={[0, PH, 0]}>
        <Part id="tiltingMechanism" explode={[0, -2.5, 0]}>
          {[-2.4, 2.4].map((z) => (
            <mesh key={z} position={[0, -0.3, z]} rotation={[0, 0, Math.PI]} material={MAT.darkSteel}>
              <torusGeometry args={[3.2, 0.25, 6, 20, Math.PI * 0.55]} />
            </mesh>
          ))}
          {[-2.4, 2.4].map((z) => (
            <mesh key={`h${z}`} position={[-2.8, -1.8, z]} rotation={[0, 0, 0.5]} material={MAT.steel}>
              <cylinderGeometry args={[0.22, 0.22, 3, 10]} />
            </mesh>
          ))}
        </Part>

        <Part id="shell" explode={[0, 0, 5]}>
          <mesh position={[0, HS / 2, 0]} castShadow material={MAT.darkSteel} userData={{ xray: true }}>
            <cylinderGeometry args={[RS, RS * 0.93, HS, 40, 1, true]} />
          </mesh>
          {/* refractory hearth */}
          <mesh position={[0, 0.2, 0]} material={MAT.refractory} userData={{ xray: true }}>
            <cylinderGeometry args={[RS * 0.93, RS * 0.8, 0.5, 32]} />
          </mesh>
        </Part>

        <Part id="coolingPanels" explode={[0, 1.5, 6]}>
          <mesh position={[0, HS - 1.0, 0]} material={MAT.steel} userData={{ xray: true }}>
            <cylinderGeometry args={[RS + 0.12, RS + 0.12, 2.0, 40, 6, true]} />
          </mesh>
          {layers.cooling && (
            <mesh position={[0, HS - 1.0, 0]} material={MAT.pipeWater} userData={{ xray: true }}>
              <cylinderGeometry args={[RS + 0.2, RS + 0.2, 2.1, 40, 1, true]} />
            </mesh>
          )}
        </Part>

        <Part id="ebt" explode={[4, 0, 0]}>
          <mesh position={[tapOffsetX - 0.1, 0.55, 0]} material={MAT.darkSteel}>
            <boxGeometry args={[1.6, 1.1, 2.2]} />
          </mesh>
          <mesh position={[tapOffsetX + 0.3, -0.15, 0]} material={MAT.refractory}>
            <cylinderGeometry args={[0.35, 0.35, 0.6, 12]} />
          </mesh>
        </Part>

        <Part id="slagDoor" explode={[-4, 0, 0]}>
          <mesh position={[-RS - 0.1, 1.4, 0]} material={MAT.steel}>
            <boxGeometry args={[0.4, 1.3, 1.6]} />
          </mesh>
        </Part>

        {/* process: bath, slag, scrap, arcs */}
        <mesh ref={bathRef} position={[0, 0.5, 0]} material={MAT.molten} userData={{ steel: true }}>
          <cylinderGeometry args={[RS * 0.9, RS * 0.82, 1, 36]} />
        </mesh>
        <mesh ref={slagRef} material={MAT.slag} userData={{ steel: true }}>
          <cylinderGeometry args={[RS * 0.91, RS * 0.91, 1, 36]} />
        </mesh>
        <primitive object={scrap} />
        <pointLight ref={arcLight} position={[0, 2.2, 0]} color="#bfe0ff" distance={30} decay={1.6} intensity={0} />

        <Part id="oxygenLances" explode={[0, 1, -5]}>
          {[0.6, 2.4].map((a, i) => (
            <group key={a} position={[Math.cos(a) * (RS - 0.1), 2.4, Math.sin(a) * (RS - 0.1)]} rotation={[0, -a, 0.9]}>
              <mesh material={layers.gas ? MAT.gas : MAT.steel}>
                <cylinderGeometry args={[0.12, 0.12, 1.4, 8]} />
              </mesh>
              <mesh ref={(m) => { jetRefs.current[i] = m; }} position={[0, -1.4, 0]} material={MAT.oxygenJet} userData={{ steel: true }}>
                <coneGeometry args={[0.25, 1.6, 10, 1, true]} />
              </mesh>
            </group>
          ))}
        </Part>
        <Part id="burners" explode={[0, 1, 5]}>
          {[3.9, 5.2].map((a) => (
            <mesh key={a} position={[Math.cos(a) * (RS + 0.05), 3.0, Math.sin(a) * (RS + 0.05)]} rotation={[0, -a, 0.6]} material={layers.gas ? MAT.gas : MAT.steel}>
              <boxGeometry args={[0.7, 0.45, 0.45]} />
            </mesh>
          ))}
        </Part>
        <Part id="carbonInjection" explode={[0, 1, -5]}>
          <group position={[Math.cos(1.5) * (RS - 0.1), 2.2, Math.sin(1.5) * (RS - 0.1)]} rotation={[0, -1.5, 1.0]}>
            <mesh material={MAT.graphite}>
              <cylinderGeometry args={[0.1, 0.1, 1.3, 8]} />
            </mesh>
            <mesh ref={(m) => { jetRefs.current[2] = m; }} position={[0, -1.2, 0]} material={MAT.slag} userData={{ steel: true }}>
              <coneGeometry args={[0.2, 1.2, 8, 1, true]} />
            </mesh>
          </group>
        </Part>

        {/* roof + electrodes swing together */}
        <group ref={roofRef}>
          <Part id="roof" explode={[0, 3, 0]}>
            <mesh position={[0, HS + 0.25, 0]} castShadow material={MAT.structure} userData={{ xray: true }}>
              <sphereGeometry args={[RS + 0.25, 36, 12, 0, Math.PI * 2, 0, Math.PI * 0.32]} />
            </mesh>
            <mesh position={[0, HS + 0.1, 0]} material={MAT.darkSteel} userData={{ xray: true }}>
              <cylinderGeometry args={[RS + 0.3, RS + 0.3, 0.3, 36, 1, true]} />
            </mesh>
            {/* delta (central refractory) */}
            <mesh position={[0, HS + 1.7, 0]} material={MAT.refractory}>
              <cylinderGeometry args={[1.7, 1.9, 0.4, 3]} />
            </mesh>
          </Part>
          <Part id="offGas" explode={[-2, 3, 0]}>
            <mesh position={[-2.2, HS + 2.3, 1.6]} material={MAT.darkSteel}>
              <cylinderGeometry args={[0.8, 0.8, 1.8, 16]} />
            </mesh>
            <mesh position={[-4.2, HS + 3.0, 1.6]} rotation={[0, 0, Math.PI / 2]} material={MAT.darkSteel}>
              <cylinderGeometry args={[0.8, 0.8, 3.2, 16]} />
            </mesh>
          </Part>
          <Part id="driFeed" explode={[0, 3, -2]}>
            <mesh position={[-1.2, HS + 2.6, -1.2]} material={MAT.steel}>
              <cylinderGeometry args={[0.35, 0.35, 2.4, 12]} />
            </mesh>
          </Part>

          <group ref={electrodeRef}>
            <Part id="electrodes" explode={[0, 4, 0]}>
              {ELECTRODE_POS.map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                  <mesh position={[0, 3.6, 0]} castShadow material={MAT.graphite}>
                    <cylinderGeometry args={[0.305, 0.305, 7.2, 18]} />
                  </mesh>
                  <mesh ref={(m) => { arcRefs.current[i] = m; }} position={[0, -0.25, 0]} material={MAT.arc} userData={{ steel: true }}>
                    <sphereGeometry args={[0.45, 10, 8]} />
                  </mesh>
                </group>
              ))}
            </Part>
            <Part id="electrodeArms" explode={[-3, 4, 0]}>
              {ELECTRODE_POS.map(([x, z], i) => (
                <group key={i}>
                  <mesh position={[(x - 5.2) / 2, 6.6 + i * 0.05, z]} material={layers.electrical ? MAT.electrical : MAT.steel}>
                    <boxGeometry args={[Math.abs(x + 5.2), 0.55, 0.7]} />
                  </mesh>
                  <mesh position={[-5.2, 3.8, z]} material={MAT.structure}>
                    <boxGeometry args={[0.7, 6.4, 0.7]} />
                  </mesh>
                </group>
              ))}
            </Part>
          </group>
        </group>
      </group>

      {/* tapping stream (world-fixed) */}
      <mesh
        ref={streamRef}
        position={[streamX - 0.1, (streamTop + streamBottom) / 2, 0]}
        material={MAT.molten}
        userData={{ steel: true }}
      >
        <cylinderGeometry args={[0.16, 0.24, streamTop - streamBottom, 10]} />
      </mesh>

      <Part id="transformer" explode={[0, 0, -4]}>
        <mesh position={[0, 3.5, LAYOUT.eaf.transformer[2]]} castShadow material={MAT.structure}>
          <boxGeometry args={[7, 7, 5]} />
        </mesh>
        {layers.electrical &&
          [-1.2, 0, 1.2].map((dz) => (
            <mesh key={dz} position={[-2.6, 9, -5 + dz * 0.4]} rotation={[Math.PI / 2, 0, 0]} material={MAT.electrical}>
              <cylinderGeometry args={[0.12, 0.12, 7.5, 8]} />
            </mesh>
          ))}
      </Part>
    </EquipmentGroup>
  );
}
