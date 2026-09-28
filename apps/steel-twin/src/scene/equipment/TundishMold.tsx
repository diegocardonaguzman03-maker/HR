import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { currentPose, type Pose } from '../../sim/kinematics';
import { clock } from '../../sim/clock';
import { useAppStore } from '../../store/useAppStore';

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** Tundish level (0..1) */
function tundishLevel(pose: Pose): number {
  if (pose.state === 'TUNDISH_FILL') return smooth(pose.p / 0.9);
  return pose.before('TUNDISH_FILL') ? 0 : 1;
}

export function Tundish() {
  const T = LAYOUT.tundish;
  const level = useRef<THREE.Mesh>(null);
  const shroudStream = useRef<THREE.Mesh>(null);
  const senStream = useRef<THREE.Mesh>(null);
  const stopper = useRef<THREE.Group>(null);
  const flow = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 6, 4), MAT.moltenCore, 36);
    m.userData.steel = true;
    return m;
  }, []);
  const xray = useAppStore((s) => s.xray);

  const localPour = T.pourX - T.position[0];
  const localSen = T.senX - T.position[0];

  useFrame(() => {
    const pose = currentPose();
    const lv = tundishLevel(pose);
    if (level.current) {
      const h = Math.max(0.001, lv * (T.depth - 0.35));
      level.current.scale.y = h;
      level.current.position.y = -T.depth / 2 + 0.2 + h / 2;
    }
    const pouring = !pose.before('TUNDISH_FILL') && !(pose.state === 'COMPLETE' && pose.p > 0.95);
    if (shroudStream.current) shroudStream.current.scale.x = shroudStream.current.scale.z = pouring ? 1 : 0.0001;
    const casting = !pose.before('MOLD_FILL');
    if (senStream.current) senStream.current.scale.x = senStream.current.scale.z = casting ? 1 : 0.0001;
    if (stopper.current) stopper.current.position.y = casting ? 0.18 + 0.02 * Math.sin(clock.elapsed * 3) : 0;
    // flow particles from impact zone to SEN (visible in x-ray)
    const d = new THREE.Object3D();
    for (let i = 0; i < 36; i++) {
      const t = (i / 36 + clock.elapsed * 0.25) % 1;
      const lane = (i % 3) - 1;
      d.position.set(localPour + (localSen - localPour) * t, -T.depth / 2 + 0.35 + 0.35 * Math.sin(t * Math.PI) + lane * 0.05, lane * 0.4);
      d.scale.setScalar(xray && lv > 0.3 && casting ? 1 : 0.0001);
      d.updateMatrix();
      flow.setMatrixAt(i, d.matrix);
    }
    flow.instanceMatrix.needsUpdate = true;
  });

  return (
    <EquipmentGroup id="tundish" position={T.position}>
      <Part id="vessel" explode={[0, 0, 3]}>
        <mesh castShadow material={MAT.darkSteel} userData={{ xray: true }}>
          <boxGeometry args={[T.length, T.depth, T.width]} />
        </mesh>
      </Part>
      <Part id="lining" explode={[0, 0, -3]}>
        <mesh position={[0, 0.1, 0]} material={MAT.refractory} userData={{ xray: true }}>
          <boxGeometry args={[T.length - 0.3, T.depth - 0.1, T.width - 0.3]} />
        </mesh>
      </Part>
      <mesh ref={level} material={MAT.molten} userData={{ steel: true }}>
        <boxGeometry args={[T.length - 0.45, 1, T.width - 0.45]} />
      </mesh>
      <primitive object={flow} />
      <Part id="flowControl" explode={[0, 2, 0]}>
        {[localPour - 1.1, localSen + 1.5].map((dx, i) => (
          <mesh key={dx} position={[dx, i === 0 ? -0.15 : -0.25, 0]} material={MAT.refractory} userData={{ xray: true }}>
            <boxGeometry args={[0.15, i === 0 ? 0.8 : 0.45, T.width - 0.35]} />
          </mesh>
        ))}
        <mesh position={[localPour, -T.depth / 2 + 0.22, 0]} material={MAT.refractory}>
          <boxGeometry args={[0.9, 0.12, 0.9]} />
        </mesh>
      </Part>
      <Part id="cover" explode={[0, 2.5, 0]}>
        <mesh position={[0, T.depth / 2 + 0.08, 0]} material={MAT.structure} userData={{ xray: true }}>
          <boxGeometry args={[T.length, 0.16, T.width]} />
        </mesh>
      </Part>
      <Part id="stopperRod" explode={[0, 3, 0]}>
        <group ref={stopper}>
          <mesh position={[localSen, 0.8, 0]} material={MAT.refractory}>
            <cylinderGeometry args={[0.1, 0.1, 2.4, 12]} />
          </mesh>
          <mesh position={[localSen + 0.7, 2.0, 0]} material={MAT.steel}>
            <boxGeometry args={[1.6, 0.2, 0.2]} />
          </mesh>
        </group>
      </Part>
      <Part id="sen" explode={[0, -1.5, 0]}>
        <mesh position={[localSen, -T.depth / 2 - 0.45, 0]} material={MAT.refractory}>
          <cylinderGeometry args={[0.09, 0.09, 1.1, 12]} />
        </mesh>
        <mesh ref={senStream} position={[localSen, -T.depth / 2 - 0.45, 0]} material={MAT.moltenCore} userData={{ steel: true }}>
          <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
        </mesh>
      </Part>
      <mesh ref={shroudStream} position={[localPour, T.depth / 2 + 0.7, 0]} material={MAT.moltenCore} userData={{ steel: true }}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 8]} />
      </mesh>
      <Part id="tundishCar" explode={[0, -1, 3]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, T.depth / 2 - 0.2, s * (T.width / 2 + 0.25)]} material={MAT.paintYellow}>
            <boxGeometry args={[T.length + 1, 0.3, 0.3]} />
          </mesh>
        ))}
        {[-3, 3].map((dx) => (
          <mesh key={dx} position={[dx, -T.depth / 2 - 5.6, -(T.width / 2 + 1.6)]} material={MAT.structure} userData={{ noPick: false }}>
            <boxGeometry args={[0.4, 10.6, 0.4]} />
          </mesh>
        ))}
      </Part>
    </EquipmentGroup>
  );
}

/** Water-cooled copper mold with hydraulic oscillation. */
export function Mold() {
  const [mx, my] = LAYOUT.mold.meniscus;
  const osc = useRef<THREE.Group>(null);
  const fill = useRef<THREE.Mesh>(null);
  const layers = useAppStore((s) => s.layers);
  const half = (LAYOUT.strand.thickness * LAYOUT.strand.thicknessScale) / 2;
  const W = LAYOUT.strand.width;
  const L = LAYOUT.mold.length;
  const top = my + 0.1;

  useFrame(() => {
    const pose = currentPose();
    const casting = !pose.before('SHELL_FORMATION');
    if (osc.current) osc.current.position.y = casting ? 0.03 * Math.sin(clock.elapsed * 2 * Math.PI * 2.4) : 0;
    // mold filling from the dummy-bar head upward
    if (fill.current) {
      const f = pose.state === 'MOLD_FILL' ? smooth(pose.p) : pose.before('MOLD_FILL') ? 0 : 1;
      const h = Math.max(0.001, f * 0.8);
      fill.current.scale.y = h;
      fill.current.position.y = my - 0.8 + h / 2;
      fill.current.visible = pose.state === 'MOLD_FILL';
    }
  });

  return (
    <EquipmentGroup id="mold" position={[0, 0, 0]}>
      <group ref={osc}>
        <Part id="copperPlates" explode={[0, 0, 2.5]}>
          {[-1, 1].map((s) => (
            <mesh key={`b${s}`} position={[mx + s * (half + 0.05), top - L / 2, 0]} material={MAT.copper} userData={{ xray: true }}>
              <boxGeometry args={[0.1, L, W + 0.2]} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`n${s}`} position={[mx, top - L / 2, s * (W / 2 + 0.05)]} material={MAT.copper} userData={{ xray: true }}>
              <boxGeometry args={[2 * half, L, 0.1]} />
            </mesh>
          ))}
        </Part>
        <Part id="waterJackets" explode={[0, 0, -2.5]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[mx + s * (half + 0.35), top - L / 2, 0]} material={layers.cooling ? MAT.pipeWater : MAT.darkSteel} userData={{ xray: true }}>
              <boxGeometry args={[0.5, L + 0.1, W + 0.6]} />
            </mesh>
          ))}
        </Part>
        <Part id="moldPowder" explode={[0, 1, 0]}>
          <mesh position={[mx, my + 0.02, 0]} material={MAT.moldPowder}>
            <boxGeometry args={[2 * half - 0.02, 0.03, W - 0.04]} />
          </mesh>
        </Part>
        <Part id="levelSensor" explode={[0, 1.5, 1]}>
          <mesh position={[mx + 0.12, top + 0.35, 0.45]} material={MAT.paintYellow}>
            <boxGeometry args={[0.18, 0.3, 0.18]} />
          </mesh>
        </Part>
        <Part id="bopThermocouples" explode={[0, 0, 1.5]}>
          {[0, 1, 2].map((r) =>
            [-0.5, 0, 0.5].map((z) => (
              <mesh key={`${r}${z}`} position={[mx - half - 0.62, top - 0.2 - r * 0.2, z]} material={MAT.electrical}>
                <sphereGeometry args={[0.035, 6, 5]} />
              </mesh>
            )),
          )}
        </Part>
        <Part id="widthAdjust" explode={[0, 0, 3]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[mx, top - L / 2, s * (W / 2 + 0.55)]} rotation={[Math.PI / 2, 0, 0]} material={MAT.steel}>
              <cylinderGeometry args={[0.08, 0.08, 0.8, 10]} />
            </mesh>
          ))}
        </Part>
        <mesh ref={fill} material={MAT.molten} userData={{ steel: true }}>
          <boxGeometry args={[2 * half - 0.02, 1, W - 0.02]} />
        </mesh>
      </group>
      <Part id="oscillator" explode={[0, -2, 0]}>
        <mesh position={[mx, top - L - 0.35, 0]} material={MAT.structure}>
          <boxGeometry args={[2.2, 0.35, W + 1.4]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[mx - 1.2, top - L - 0.9, s * 0.9]} material={MAT.steel}>
            <cylinderGeometry args={[0.12, 0.12, 1.1, 10]} />
          </mesh>
        ))}
      </Part>
    </EquipmentGroup>
  );
}
