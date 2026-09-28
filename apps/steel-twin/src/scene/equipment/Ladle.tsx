import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { currentPose, ladleFill, ladlePosition } from '../../sim/kinematics';
import { clock } from '../../sim/clock';
import { useAppStore } from '../../store/useAppStore';

const { radius: R, height: H } = LAYOUT.ladle;

/** Ladle geometry (reused by the heat ladle and the standby ladle on the turret). */
export function LadleBody({ fillRef, bubbles }: { fillRef?: React.Ref<THREE.Mesh>; bubbles?: THREE.InstancedMesh }) {
  const gas = useAppStore((s) => s.layers.gas);
  return (
    <>
      <Part id="shell" explode={[0, 0, 3.5]}>
        <mesh position={[0, H / 2, 0]} castShadow material={MAT.darkSteel} userData={{ xray: true }}>
          <cylinderGeometry args={[R, R * 0.9, H, 32, 1, true]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} material={MAT.darkSteel} userData={{ xray: true }}>
          <cylinderGeometry args={[R * 0.9, R * 0.9, 0.16, 32]} />
        </mesh>
        {[0.9, 2.2, 3.5].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={MAT.steel} userData={{ xray: true }}>
            <torusGeometry args={[R * (1 - (0.1 * (H - y)) / H) + 0.04, 0.07, 6, 32]} />
          </mesh>
        ))}
      </Part>
      <Part id="refractoryLining" explode={[0, 0, -3.5]}>
        <mesh position={[0, H / 2 + 0.05, 0]} material={MAT.refractory} userData={{ xray: true }}>
          <cylinderGeometry args={[R - 0.2, R * 0.9 - 0.2, H - 0.1, 28, 1, true]} />
        </mesh>
      </Part>
      <Part id="slagLine" explode={[0, 1.5, 0]}>
        <mesh position={[0, H - 0.55, 0]} material={MAT.graphite} userData={{ xray: true }}>
          <cylinderGeometry args={[R - 0.18, R - 0.2, 0.6, 28, 1, true]} />
        </mesh>
      </Part>
      <Part id="slideGate" explode={[0, -1.5, 0]}>
        <mesh position={[0.7, -0.2, 0]} material={MAT.steel}>
          <boxGeometry args={[0.9, 0.4, 0.7]} />
        </mesh>
      </Part>
      <Part id="porousPlug" explode={[0, -1.5, 1]}>
        <mesh position={[-0.7, -0.15, 0.3]} material={gas ? MAT.gas : MAT.refractory}>
          <cylinderGeometry args={[0.14, 0.18, 0.35, 10]} />
        </mesh>
        {bubbles && <primitive object={bubbles} />}
      </Part>
      <Part id="trunnions" explode={[0, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, H - 0.8, s * (R + 0.25)]} rotation={[Math.PI / 2, 0, 0]} material={MAT.steel}>
            <cylinderGeometry args={[0.3, 0.3, 0.55, 14]} />
          </mesh>
        ))}
      </Part>
      {fillRef && (
        <mesh ref={fillRef} position={[0, 0.2, 0]} material={MAT.molten} userData={{ steel: true }}>
          <cylinderGeometry args={[R - 0.25, R * 0.9 - 0.25, 1, 28]} />
        </mesh>
      )}
    </>
  );
}

/** The heat ladle: travels EAF → LF → crane → turret → casting position. */
export function HeatLadle() {
  const group = useRef<THREE.Group>(null);
  const fill = useRef<THREE.Mesh>(null);
  const car = useRef<THREE.Group>(null);
  const bubbles = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 6, 5), MAT.oxygenJet, 30);
    m.userData.steel = true;
    return m;
  }, []);

  useFrame(() => {
    const pose = currentPose();
    const p = ladlePosition(pose);
    group.current?.position.set(p[0], p[1], p[2]);
    const f = ladleFill(pose);
    if (fill.current) {
      const h = Math.max(0.001, f * (H - 0.9));
      fill.current.scale.y = h;
      fill.current.position.y = 0.25 + h / 2;
    }
    // ladle car follows ladle until the crane picks it up
    if (car.current) {
      const onCar = pose.before('TRANSFER');
      car.current.visible = true;
      car.current.position.set(onCar ? p[0] : LAYOUT.ladleFurnace.position[0], 0, 0);
    }
    // argon bubbles while stirring at the LF
    const stirring = pose.state === 'SECONDARY_METALLURGY' && pose.p > 0.2;
    const d = new THREE.Object3D();
    for (let i = 0; i < 30; i++) {
      const t = (i / 30 + clock.elapsed * 0.6) % 1;
      d.position.set(-0.7 + Math.sin(i * 3.1) * 0.25 * t, 0.2 + t * f * (H - 1), 0.3 + Math.cos(i * 1.7) * 0.25 * t);
      d.scale.setScalar(stirring ? 0.6 + t : 0.0001);
      d.updateMatrix();
      bubbles.setMatrixAt(i, d.matrix);
    }
    bubbles.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <EquipmentGroup id="ladle">
        <group ref={group}>
          <LadleBody fillRef={fill} bubbles={bubbles} />
        </group>
      </EquipmentGroup>
      {/* ladle transfer car + rails (part of ladle furnace handling) */}
      <group ref={car}>
        <mesh position={[0, 0.25, 0]} material={MAT.paintYellow} userData={{ noPick: true }}>
          <boxGeometry args={[4.4, 0.5, 4.4]} />
        </mesh>
      </group>
      {[-1.4, 1.4].map((z) => (
        <mesh key={z} position={[(LAYOUT.ladle.tapPosition[0] + LAYOUT.ladleFurnace.position[0]) / 2, 0.03, z]} material={MAT.steel} userData={{ noPick: true }}>
          <boxGeometry args={[LAYOUT.ladleFurnace.position[0] - LAYOUT.ladle.tapPosition[0] + 5, 0.06, 0.15]} />
        </mesh>
      ))}
    </>
  );
}
