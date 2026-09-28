import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { bucketPose, currentPose } from '../../sim/kinematics';
import { clock } from '../../sim/clock';

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Scrap pile made of instanced pieces (cheap, realistic silhouette). */
function ScrapPile({ count = 220, radius = 5 }: { count?: number; radius?: number }) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MAT.scrap, count);
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const r = radius * Math.sqrt(rand(i));
      const a = rand(i + 99) * Math.PI * 2;
      const h = (1 - r / radius) * 3.2 * rand(i + 7) + 0.2;
      d.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
      d.rotation.set(rand(i + 3) * 3, rand(i + 5) * 3, rand(i + 11) * 3);
      d.scale.set(0.3 + rand(i + 13) * 1.4, 0.08 + rand(i + 17) * 0.35, 0.2 + rand(i + 19) * 0.8);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    return m;
  }, [count, radius]);
  return <primitive object={mesh} />;
}

export function RawMaterials() {
  const [x, , z] = LAYOUT.rawMaterials.position;
  const silo = LAYOUT.rawMaterials.driSilo;
  const bucket = useRef<THREE.Group>(null);
  const bucketLoad = useRef<THREE.Mesh>(null);
  const driBelt = useRef<THREE.InstancedMesh>(null);

  const eaf = LAYOUT.eaf.position;
  // conveyor from silo top to EAF roof (5th hole)
  const conv = useMemo(() => {
    const a = new THREE.Vector3(silo[0], 14, silo[2]);
    const b = new THREE.Vector3(eaf[0] - 1.2, LAYOUT.eaf.platformHeight + LAYOUT.eaf.shellHeight + 3.2, -1.2);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const dir = b.clone().sub(a).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    return { a, b, mid, len, q };
  }, [silo, eaf]);

  const driMesh = useMemo(() => new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 6, 5), MAT.dri, 40), []);

  useFrame(() => {
    const pose = currentPose();
    const b = bucketPose(pose);
    if (bucket.current) {
      bucket.current.position.set(b.pos[0] - x, b.pos[1], b.pos[2] - z);
      bucket.current.rotation.z = -1.1 * b.discharge;
    }
    if (bucketLoad.current) bucketLoad.current.scale.setScalar(Math.max(0.001, 1 - b.discharge));
    // DRI flowing on the conveyor while the EAF melts / refines
    const flowing = pose.state === 'MELTING' || pose.state === 'REFINING';
    const d = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      const t = ((i / 40 + clock.elapsed * 0.08) % 1 + 1) % 1;
      const p = conv.a.clone().lerp(conv.b, t);
      d.position.set(p.x - x, p.y + 0.3, p.z - z);
      d.scale.setScalar(flowing ? 1 : 0.0001);
      d.updateMatrix();
      driMesh.setMatrixAt(i, d.matrix);
    }
    driMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <EquipmentGroup id="rawMaterials" position={[x, 0, z]}>
      <Part id="scrapYard" explode={[0, 0, -4]}>
        <ScrapPile />
        <mesh position={[0, 0.05, 0]} receiveShadow material={MAT.concrete}>
          <boxGeometry args={[16, 0.1, 14]} />
        </mesh>
      </Part>
      <Part id="scrapBucket" explode={[0, 4, 0]}>
        <group ref={bucket}>
          <mesh position={[0, 2, 0]} castShadow material={MAT.darkSteel}>
            <cylinderGeometry args={[2.3, 1.9, 4, 20, 1, true]} />
          </mesh>
          <mesh ref={bucketLoad} position={[0, 2.4, 0]} material={MAT.scrap}>
            <cylinderGeometry args={[2.1, 1.8, 3.2, 12]} />
          </mesh>
          <mesh position={[0, 4.2, 0]} material={MAT.structure}>
            <torusGeometry args={[2.3, 0.12, 6, 24]} />
          </mesh>
        </group>
      </Part>
      <Part id="driSilo" explode={[0, 3, -3]}>
        <group position={[silo[0] - x, 0, silo[2] - z]}>
          <mesh position={[0, 9, 0]} castShadow material={MAT.structure}>
            <cylinderGeometry args={[2.6, 2.6, 10, 24]} />
          </mesh>
          <mesh position={[0, 3, 0]} material={MAT.structure}>
            <cylinderGeometry args={[2.6, 0.5, 2, 24]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 2, 2, Math.sin((i * Math.PI) / 2) * 2]} material={MAT.darkSteel}>
              <boxGeometry args={[0.3, 4, 0.3]} />
            </mesh>
          ))}
        </group>
      </Part>
      <Part id="conveyor" explode={[0, 2, -2]}>
        <group position={[conv.mid.x - x, conv.mid.y, conv.mid.z - z]} quaternion={conv.q}>
          <mesh material={MAT.darkSteel}>
            <boxGeometry args={[conv.len, 0.4, 1.2]} />
          </mesh>
          <mesh position={[0, 0.5, 0]} material={MAT.structure}>
            <boxGeometry args={[conv.len, 0.6, 0.08]} />
          </mesh>
        </group>
        <primitive object={driMesh} ref={driBelt} />
      </Part>
      <Part id="fluxBins" explode={[4, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[8, 3, -5 + i * 3.2]} castShadow material={MAT.paintYellow}>
            <boxGeometry args={[2.6, 6, 2.6]} />
          </mesh>
        ))}
      </Part>
      <Part id="radiationPortal" explode={[-4, 0, 0]}>
        <group position={[-9, 0, 5]}>
          {[-1.8, 1.8].map((dz) => (
            <mesh key={dz} position={[0, 2.2, dz]} material={MAT.structure}>
              <boxGeometry args={[0.5, 4.4, 0.5]} />
            </mesh>
          ))}
          <mesh position={[0, 4.5, 0]} material={MAT.paintYellow}>
            <boxGeometry args={[0.5, 0.4, 4.1]} />
          </mesh>
        </group>
      </Part>
    </EquipmentGroup>
  );
}
