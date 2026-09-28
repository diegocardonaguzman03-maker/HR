import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { cranePose, currentPose, turretAngle } from '../../sim/kinematics';
import { LadleBody } from './Ladle';

/** Overhead bridge crane running along the whole melt shop bay. */
export function Crane() {
  const bridge = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  const cables = useRef<THREE.Mesh>(null);
  const Y = LAYOUT.crane.height;

  useFrame(() => {
    const c = cranePose(currentPose());
    bridge.current?.position.set(c.x, Y, 0);
    const drop = Y - c.hookY;
    hook.current?.position.set(0, -drop, 0);
    if (cables.current) {
      cables.current.scale.y = Math.max(0.1, drop - 0.6);
      cables.current.position.y = -(drop - 0.6) / 2;
    }
  });

  return (
    <EquipmentGroup id="crane">
      {/* runway beams (static) */}
      {[-8, 8].map((z) => (
        <mesh key={z} position={[-26, Y + 0.6, z]} material={MAT.structure} userData={{ noPick: true }}>
          <boxGeometry args={[96, 0.45, 0.35]} />
        </mesh>
      ))}
      <group ref={bridge}>
        <Part id="bridge" explode={[0, 3, 0]}>
          {[-1.2, 1.2].map((dx) => (
            <mesh key={dx} position={[dx, 0.9, 0]} castShadow material={MAT.paintYellow}>
              <boxGeometry args={[0.8, 1.6, 17]} />
            </mesh>
          ))}
        </Part>
        <Part id="trolley" explode={[0, 5, 0]}>
          <mesh position={[0, 2.0, 0]} material={MAT.structure}>
            <boxGeometry args={[3.4, 1.2, 3.4]} />
          </mesh>
        </Part>
        <Part id="hoist">
          <mesh ref={cables} material={MAT.darkSteel}>
            <boxGeometry args={[0.9, 1, 0.1]} />
          </mesh>
        </Part>
        <group ref={hook}>
          <Part id="lifterBeam" explode={[0, -2, 0]}>
            <mesh position={[0, 0, 0]} material={MAT.paintYellow}>
              <boxGeometry args={[0.8, 0.6, 5]} />
            </mesh>
            {[-2.3, 2.3].map((z) => (
              <mesh key={z} position={[0, -0.6, z]} material={MAT.steel}>
                <boxGeometry args={[0.35, 1.3, 0.25]} />
              </mesh>
            ))}
          </Part>
        </group>
      </group>
    </EquipmentGroup>
  );
}

/** Ladle turret with two arms; the standby arm carries the previous (draining) ladle. */
export function Turret() {
  const arms = useRef<THREE.Group>(null);
  const [tx, , tz] = LAYOUT.turret.position;
  const R = LAYOUT.turret.armRadius;
  const Y = LAYOUT.turret.ladleBaseY;

  useFrame(() => {
    if (arms.current) arms.current.rotation.y = turretAngle(currentPose());
  });

  return (
    <EquipmentGroup id="turret" position={[tx, 0, tz]}>
      <Part id="base" explode={[0, -2, 0]}>
        <mesh position={[0, (Y - 1) / 2, 0]} castShadow material={MAT.structure}>
          <cylinderGeometry args={[1.6, 2.2, Y - 1, 24]} />
        </mesh>
      </Part>
      <Part id="rotationDrive" explode={[0, 1, 0]}>
        <mesh position={[0, Y - 0.7, 0]} material={MAT.darkSteel}>
          <cylinderGeometry args={[2.1, 2.1, 0.6, 28]} />
        </mesh>
      </Part>
      <group ref={arms} position={[0, Y - 0.2, 0]}>
        <Part id="arms" explode={[0, 2, 0]}>
          <mesh position={[0, 0, 0]} material={MAT.paintYellow}>
            <boxGeometry args={[2 * R + 3, 0.7, 1.2]} />
          </mesh>
        </Part>
        <Part id="ladleSupports" explode={[0, 2, 2]}>
          {[-R, R].map((dx) => (
            <group key={dx} position={[dx, 0, 0]}>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[0, 0.8, s * (LAYOUT.ladle.radius + 0.35)]} material={MAT.paintYellow}>
                  <boxGeometry args={[1.2, 1.6, 0.4]} />
                </mesh>
              ))}
            </group>
          ))}
        </Part>
        <Part id="loadCells" explode={[0, 3, 0]}>
          {[-R, R].map((dx) => (
            <mesh key={dx} position={[dx, 0.45, 0]} material={MAT.steel}>
              <boxGeometry args={[0.6, 0.25, 0.6]} />
            </mesh>
          ))}
        </Part>
        {/* previous heat ladle, rotating out to the standby side */}
        <group position={[R, -Y + LAYOUT.turret.ladleBaseY + 0.2, 0]}>
          <LadleBody />
        </group>
      </group>
      <Part id="ladleShroud" explode={[0, -2, 2]}>
        <mesh position={[R, Y - 1.3, 0]} material={MAT.refractory}>
          <cylinderGeometry args={[0.16, 0.12, 2.1, 12]} />
        </mesh>
        <mesh position={[R + 1.2, Y - 0.6, 0.9]} rotation={[0, 0, 1.1]} material={MAT.structure}>
          <boxGeometry args={[2.6, 0.25, 0.25]} />
        </mesh>
      </Part>
    </EquipmentGroup>
  );
}
