import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { currentPose } from '../../sim/kinematics';
import { clock } from '../../sim/clock';
import { useAppStore } from '../../store/useAppStore';

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export function LadleFurnace() {
  const [x, , z] = LAYOUT.ladleFurnace.position;
  const roof = useRef<THREE.Group>(null);
  const arcs = useRef<(THREE.Mesh | null)[]>([]);
  const wire = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const layers = useAppStore((s) => s.layers);
  const H = LAYOUT.ladle.height;

  useFrame(() => {
    const pose = currentPose();
    const active = pose.state === 'SECONDARY_METALLURGY';
    const down = active ? smooth((pose.p - 0.18) / 0.1) * (1 - smooth((pose.p - 0.9) / 0.08)) : 0;
    if (roof.current) roof.current.position.y = 1.8 * (1 - down);
    const heating = active && pose.p > 0.3 && pose.p < 0.75;
    arcs.current.forEach((m, i) => {
      if (m) m.scale.setScalar(heating ? 0.6 + 0.4 * Math.abs(Math.sin(clock.elapsed * 29 + i)) : 0.0001);
    });
    if (light.current) light.current.intensity = heating ? 70 + 30 * Math.sin(clock.elapsed * 21) : 0;
    if (wire.current) wire.current.scale.y = active && pose.p > 0.75 && pose.p < 0.9 ? 1 : 0.0001;
  });

  return (
    <EquipmentGroup id="ladleFurnace" position={[x, 0, z]}>
      {/* gantry */}
      {[[-3.2, -3.2], [-3.2, 3.2], [3.2, -3.2], [3.2, 3.2]].map(([px, pz]) => (
        <mesh key={`${px}${pz}`} position={[px, 5.5, pz]} material={MAT.structure} userData={{ noPick: false }}>
          <boxGeometry args={[0.5, 11, 0.5]} />
        </mesh>
      ))}
      <mesh position={[0, 11, 0]} material={MAT.structure}>
        <boxGeometry args={[7, 0.5, 7]} />
      </mesh>
      <group ref={roof}>
        <Part id="roof" explode={[0, 3, 0]}>
          <mesh position={[0, H + 0.25, 0]} material={MAT.structure} userData={{ xray: true }}>
            <cylinderGeometry args={[2.3, 2.3, 0.5, 28]} />
          </mesh>
          <mesh position={[0, H + 0.7, 0]} material={MAT.refractory}>
            <cylinderGeometry args={[1.1, 1.3, 0.4, 3]} />
          </mesh>
        </Part>
        <Part id="electrodes" explode={[0, 4, 0]}>
          {[0, 1, 2].map((i) => {
            const a = (i * Math.PI * 2) / 3;
            return (
              <group key={i} position={[Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7]}>
                <mesh position={[0, H + 3, 0]} material={MAT.graphite}>
                  <cylinderGeometry args={[0.23, 0.23, 5, 14]} />
                </mesh>
                <mesh ref={(m) => { arcs.current[i] = m; }} position={[0, H + 0.4, 0]} material={MAT.arc} userData={{ steel: true }}>
                  <sphereGeometry args={[0.28, 8, 6]} />
                </mesh>
              </group>
            );
          })}
          <pointLight ref={light} position={[0, H + 0.3, 0]} color="#cfe6ff" intensity={0} distance={18} />
        </Part>
        <Part id="electrodeArms" explode={[-2, 4, 0]}>
          {[0, 1, 2].map((i) => {
            const a = (i * Math.PI * 2) / 3;
            return (
              <mesh key={i} position={[(Math.cos(a) * 0.7 - 3) / 2, H + 5 + i * 0.3, Math.sin(a) * 0.7]} material={layers.electrical ? MAT.electrical : MAT.steel}>
                <boxGeometry args={[Math.abs(Math.cos(a) * 0.7 + 3), 0.4, 0.4]} />
              </mesh>
            );
          })}
          <mesh position={[-3, H + 3, 0]} material={MAT.structure}>
            <boxGeometry args={[0.6, 6, 0.6]} />
          </mesh>
        </Part>
      </group>
      <Part id="transformer" explode={[0, 0, -3]}>
        <mesh position={[-1, 2.5, -6.5]} material={MAT.structure}>
          <boxGeometry args={[4, 5, 3.5]} />
        </mesh>
      </Part>
      <Part id="argonSystem" explode={[-3, 0, 2]}>
        <mesh position={[-3.5, 0.6, 2.5]} material={layers.gas ? MAT.gas : MAT.steel}>
          <cylinderGeometry args={[0.35, 0.35, 1.2, 12]} />
        </mesh>
      </Part>
      <Part id="wireFeeder" explode={[3, 0, 0]}>
        <mesh position={[3.8, 1.2, 2.2]} material={MAT.paintYellow}>
          <boxGeometry args={[1.4, 2.4, 1.4]} />
        </mesh>
        <mesh ref={wire} position={[1.6, H + 1, 1.2]} rotation={[0, 0, 0.9]} material={MAT.steel} userData={{ steel: true }}>
          <cylinderGeometry args={[0.03, 0.03, 4, 6]} />
        </mesh>
      </Part>
      <Part id="alloyChute" explode={[0, 2, 3]}>
        <mesh position={[1.2, H + 3.5, 2.2]} rotation={[0.5, 0, 0]} material={MAT.steel}>
          <cylinderGeometry args={[0.3, 0.3, 3, 10]} />
        </mesh>
      </Part>
      <Part id="ladleCar">
        <mesh position={[0, 0.05, 0]} material={MAT.concrete} userData={{ noPick: true }}>
          <boxGeometry args={[7.5, 0.1, 7.5]} />
        </mesh>
      </Part>
    </EquipmentGroup>
  );
}
