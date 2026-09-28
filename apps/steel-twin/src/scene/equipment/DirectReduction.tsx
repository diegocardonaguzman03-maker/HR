/**
 * Upstream of the melt shop: pellet yard and the two direct-reduction plants.
 * HYL (ZR, no external reformer): reactor tower, process-gas heater, CO₂ absorber.
 * Midrex: shaft furnace, gas reformer box with stack, top-gas scrubber.
 * Proxy geometry (educational), same conventions as the rest of the scene.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT } from '../common/materials';
import { LAYOUT } from '../../config/layout';

const rand = (i: number) => {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const pelletMat = new THREE.MeshStandardMaterial({ color: '#7a4a33', roughness: 0.85, metalness: 0.1 });
const insulated = new THREE.MeshStandardMaterial({ color: '#b9c1c9', metalness: 0.55, roughness: 0.35, envMapIntensity: 1.1 });
const hotBox = new THREE.MeshStandardMaterial({ color: '#8d6e63', emissive: '#ff5a1a', emissiveIntensity: 0.25, roughness: 0.8 });

/** Steel frame: 4 columns + beams at several levels. */
function Frame({ w, d, h, levels = 3 }: { w: number; d: number; h: number; levels?: number }) {
  const cols: [number, number][] = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]];
  return (
    <group>
      {cols.map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow material={MAT.structure}>
          <boxGeometry args={[0.45, h, 0.45]} />
        </mesh>
      ))}
      {Array.from({ length: levels }, (_, k) => (h / levels) * (k + 1)).map((y) => (
        <group key={y}>
          <mesh position={[0, y, -d / 2]} material={MAT.structure}><boxGeometry args={[w, 0.35, 0.35]} /></mesh>
          <mesh position={[0, y, d / 2]} material={MAT.structure}><boxGeometry args={[w, 0.35, 0.35]} /></mesh>
          <mesh position={[-w / 2, y, 0]} material={MAT.structure}><boxGeometry args={[0.35, 0.35, d]} /></mesh>
          <mesh position={[w / 2, y, 0]} material={MAT.structure}><boxGeometry args={[0.35, 0.35, d]} /></mesh>
          <mesh position={[0, y - 0.15, 0]} material={MAT.darkSteel}><boxGeometry args={[w, 0.08, d]} /></mesh>
        </group>
      ))}
    </group>
  );
}

export function PelletYard() {
  const [x, , z] = LAYOUT.pelletYard.position;
  const pile = useMemo(() => {
    const n = 420;
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.32, 6, 5), pelletMat, n);
    const d = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const r = 7 * Math.sqrt(rand(i));
      const a = rand(i + 31) * Math.PI * 2;
      d.position.set(Math.cos(a) * r * 0.6, (1 - r / 7) * 5 * (0.75 + 0.25 * rand(i + 5)) + 0.2, Math.sin(a) * r * 1.6);
      d.scale.setScalar(0.8 + rand(i + 9) * 0.6);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    return m;
  }, []);
  return (
    <EquipmentGroup id="pelletYard" position={[x, 0, z]}>
      <Part id="stockpile" explode={[-4, 0, 0]}>
        <mesh position={[0, 2.3, 0]} scale={[0.6, 1, 1.6]} castShadow receiveShadow material={pelletMat}>
          <coneGeometry args={[7, 4.6, 28]} />
        </mesh>
        <primitive object={pile} />
      </Part>
      <Part id="railUnloading" explode={[-3, 0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-9, 0.08, s * 0.75]} material={MAT.darkSteel}>
            <boxGeometry args={[0.18, 0.16, 40]} />
          </mesh>
        ))}
        {[-12, -4, 4, 12].map((zz) => (
          <mesh key={zz} position={[-9, 1.6, zz]} castShadow material={pelletMat}>
            <boxGeometry args={[3, 2.6, 7]} />
          </mesh>
        ))}
      </Part>
      <Part id="reclaimer" explode={[3, 2, 0]}>
        <mesh position={[5.5, 3.2, 0]} castShadow material={MAT.paintYellow}>
          <boxGeometry args={[1.2, 6.4, 1.2]} />
        </mesh>
        <mesh position={[3.5, 5.6, 0]} rotation={[0, 0, 0.35]} material={MAT.paintYellow}>
          <boxGeometry args={[7, 0.6, 0.8]} />
        </mesh>
      </Part>
    </EquipmentGroup>
  );
}

export function HYLPlant() {
  const [x, , z] = LAYOUT.hyl.position;
  return (
    <EquipmentGroup id="hyl" position={[x, 0, z]}>
      <Part id="reactor" explode={[0, 6, 0]}>
        <Frame w={8} d={8} h={24} levels={4} />
        <mesh position={[0, 16, 0]} castShadow material={insulated} userData={{ xray: true }}>
          <cylinderGeometry args={[2.8, 2.8, 16, 32]} />
        </mesh>
        <mesh position={[0, 25, 0]} material={insulated}>
          <sphereGeometry args={[2.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 7, 0]} material={insulated}>
          <cylinderGeometry args={[2.8, 1.0, 2.5, 32]} />
        </mesh>
        {/* pellet bed seen in X-ray */}
        <mesh position={[0, 16, 0]} material={pelletMat} userData={{ steel: true }}>
          <cylinderGeometry args={[2.5, 2.5, 14, 24]} />
        </mesh>
      </Part>
      <Part id="gasHeater" explode={[-5, 0, 0]}>
        <mesh position={[-9, 5, 0]} castShadow material={hotBox}>
          <boxGeometry args={[5, 10, 6]} />
        </mesh>
        <mesh position={[-9, 14, 0]} material={MAT.darkSteel}>
          <cylinderGeometry args={[0.7, 0.9, 8, 16]} />
        </mesh>
      </Part>
      <Part id="co2Removal" explode={[0, 0, -5]}>
        {[0, 1].map((i) => (
          <mesh key={i} position={[7 + i * 3.4, 9, -2]} castShadow material={insulated}>
            <cylinderGeometry args={[1.3, 1.3, 18, 20]} />
          </mesh>
        ))}
      </Part>
      <Part id="compressor" explode={[0, 0, 5]}>
        <mesh position={[7, 1.6, 5]} castShadow material={MAT.steel}>
          <boxGeometry args={[6, 3.2, 3]} />
        </mesh>
      </Part>
      <Part id="dischargeHYL" explode={[4, 0, 0]}>
        <mesh position={[4, 2, 0]} material={MAT.darkSteel}>
          <boxGeometry args={[2.4, 4, 2.4]} />
        </mesh>
      </Part>
    </EquipmentGroup>
  );
}

export function MidrexPlant() {
  const [x, , z] = LAYOUT.midrex.position;
  return (
    <EquipmentGroup id="midrex" position={[x, 0, z]}>
      <Part id="shaftFurnace" explode={[0, 6, 0]}>
        <Frame w={9} d={9} h={26} levels={4} />
        <mesh position={[0, 17, 0]} castShadow material={insulated} userData={{ xray: true }}>
          <cylinderGeometry args={[3.2, 3.2, 18, 32]} />
        </mesh>
        <mesh position={[0, 7.5, 0]} material={insulated}>
          <cylinderGeometry args={[3.2, 1.1, 3, 32]} />
        </mesh>
        <mesh position={[0, 17, 0]} material={pelletMat} userData={{ steel: true }}>
          <cylinderGeometry args={[2.9, 2.9, 16, 24]} />
        </mesh>
      </Part>
      <Part id="reformer" explode={[-6, 0, 0]}>
        <mesh position={[-13, 4, 0]} castShadow material={hotBox}>
          <boxGeometry args={[14, 8, 7]} />
        </mesh>
        <mesh position={[-19, 14, 0]} castShadow material={MAT.darkSteel}>
          <cylinderGeometry args={[1, 1.3, 20, 16]} />
        </mesh>
      </Part>
      <Part id="topGasScrubber" explode={[0, 0, 5]}>
        <mesh position={[7, 8, 3]} castShadow material={insulated}>
          <cylinderGeometry args={[1.5, 1.5, 16, 20]} />
        </mesh>
      </Part>
      <Part id="dischargeMidrex" explode={[4, 0, 0]}>
        <mesh position={[4, 2, 0]} material={MAT.darkSteel}>
          <boxGeometry args={[2.4, 4, 2.4]} />
        </mesh>
      </Part>
    </EquipmentGroup>
  );
}
