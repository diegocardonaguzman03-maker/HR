/**
 * Continuous-casting strand: solid shell + liquid core (X-ray), strand guide
 * (rolls, segments, straightener, dummy bar) and secondary cooling.
 * The key learning visual of the application (brief §34).
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EquipmentGroup, Part } from '../common/EquipmentGroup';
import { MAT, falseColor, glowColor } from '../common/materials';
import { LAYOUT } from '../../config/layout';
import { STRAND, strandPoint, strandAngle } from '../../sim/strandPath';
import { metallurgicalLength, shellThickness, surfaceTemperature, centreTemperature } from '../../sim/solidification';
import { currentPose } from '../../sim/kinematics';
import { simulationProvider } from '../../sim/SimulationDataProvider';
import { useAppStore } from '../../store/useAppStore';

const SCALE = LAYOUT.strand.thicknessScale;
const HALF_T = (LAYOUT.strand.thickness * SCALE) / 2;
const HALF_W = LAYOUT.strand.width / 2;
const DS = 0.2;
const IDX_PER_SECTION = 24;

type SectionFn = (s: number) => { ht: number; hw: number };

/** Rectangular tube swept along the strand path; index buffer ordered by section for drawRange clipping. */
function sweptTube(section: SectionFn, colorFn: (s: number, c: THREE.Color) => THREE.Color, length: number = STRAND.total) {
  const rings = Math.ceil(length / DS) + 1;
  const pos = new Float32Array(rings * 8 * 3);
  const nor = new Float32Array(rings * 8 * 3);
  const col = new Float32Array(rings * 8 * 3);
  const c = new THREE.Color();
  for (let r = 0; r < rings; r++) {
    const s = Math.min(length, r * DS);
    const p = strandPoint(s);
    const nx = -p.ty, ny = p.tx; // in-plane normal
    const { ht, hw } = section(s);
    colorFn(s, c);
    const corners: [number, number, number, number, number, number][] = [
      // face +n
      [p.x + nx * ht, p.y + ny * ht, -hw, nx, ny, 0], [p.x + nx * ht, p.y + ny * ht, hw, nx, ny, 0],
      // face +z
      [p.x + nx * ht, p.y + ny * ht, hw, 0, 0, 1], [p.x - nx * ht, p.y - ny * ht, hw, 0, 0, 1],
      // face -n
      [p.x - nx * ht, p.y - ny * ht, hw, -nx, -ny, 0], [p.x - nx * ht, p.y - ny * ht, -hw, -nx, -ny, 0],
      // face -z
      [p.x - nx * ht, p.y - ny * ht, -hw, 0, 0, -1], [p.x + nx * ht, p.y + ny * ht, -hw, 0, 0, -1],
    ];
    corners.forEach((v, k) => {
      const i = (r * 8 + k) * 3;
      pos[i] = v[0]; pos[i + 1] = v[1]; pos[i + 2] = v[2];
      nor[i] = v[3]; nor[i + 1] = v[4]; nor[i + 2] = v[5];
      col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b;
    });
  }
  const idx: number[] = [];
  for (let r = 0; r < rings - 1; r++) {
    for (let f = 0; f < 4; f++) {
      const a = r * 8 + f * 2, b = a + 1, c2 = a + 8, d = b + 8;
      idx.push(a, c2, b, b, c2, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return { geometry: g, rings };
}

function glowMaterial(opts: THREE.MeshStandardMaterialParameters, boost: number) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, ...opts });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>\n totalEmissiveRadiance += vColor.rgb * ${boost.toFixed(2)};`,
    );
  };
  return m;
}

export function Strand() {
  const xray = useAppStore((s) => s.xray);
  const tempLayer = useAppStore((s) => s.layers.temperature);
  const coolingLayer = useAppStore((s) => s.layers.cooling);
  const lm = metallurgicalLength();

  const shell = useMemo(() => {
    const glow = sweptTube(() => ({ ht: HALF_T, hw: HALF_W }), (s, c) => glowColor(surfaceTemperature(s), c));
    const glowCols = (glow.geometry.getAttribute('color') as THREE.BufferAttribute).array.slice() as Float32Array;
    const temp = sweptTube(() => ({ ht: HALF_T, hw: HALF_W }), (s, c) => falseColor(surfaceTemperature(s), c));
    const tempCols = (temp.geometry.getAttribute('color') as THREE.BufferAttribute).array.slice() as Float32Array;
    temp.geometry.dispose();
    return { ...glow, glowCols, tempCols };
  }, []);

  const core = useMemo(() => {
    const k = SCALE / 1000;
    return sweptTube(
      (s) => {
        const e = shellThickness(s) * k;
        return { ht: Math.max(0.002, HALF_T - e), hw: Math.max(0.002, HALF_W - shellThickness(s) / 1000) };
      },
      (s, c) => falseColor(centreTemperature(s), c).lerp(new THREE.Color('#ff9a2e'), 0.6),
      lm,
    );
  }, [lm]);

  const shellMat = useMemo(() => glowMaterial({ roughness: 0.55, metalness: 0.35, color: '#ffffff' }, 0.85), []);
  const coreMat = useMemo(() => glowMaterial({ roughness: 0.3, metalness: 0, color: '#ff8a1c', toneMapped: false, transparent: true, opacity: 0.95 }, 2.2), []);

  // swap colour scheme for the TEMPERATURE layer
  useEffect(() => {
    const attr = shell.geometry.getAttribute('color') as THREE.BufferAttribute;
    (attr.array as Float32Array).set(tempLayer ? shell.tempCols : shell.glowCols);
    attr.needsUpdate = true;
  }, [tempLayer, shell]);

  useEffect(() => {
    shellMat.transparent = xray;
    shellMat.opacity = xray ? 0.22 : 1;
    shellMat.depthWrite = !xray;
    shellMat.needsUpdate = true;
  }, [xray, shellMat]);

  const headCap = useRef<THREE.Mesh>(null);
  const coreMesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const pose = currentPose();
    const snap = simulationProvider.getSnapshot(pose.state, pose.p);
    const started = !pose.before('SHELL_FORMATION');
    let end = started ? snap.strand.castLength : 0;
    const cut = snap.strand.cutCount > 0;
    if (cut) end = Math.min(end, LAYOUT.strand.cutPosition);
    const sections = Math.floor(end / DS);
    shell.geometry.setDrawRange(0, Math.max(0, sections) * IDX_PER_SECTION);
    const coreSections = Math.floor(Math.min(end, lm) / DS);
    core.geometry.setDrawRange(0, Math.max(0, coreSections) * IDX_PER_SECTION);
    if (coreMesh.current) coreMesh.current.visible = xray && started;
    if (headCap.current) {
      const s = Math.max(0, end);
      const p = strandPoint(s);
      headCap.current.visible = started && end > 0.05;
      headCap.current.position.set(p.x, p.y, 0);
      headCap.current.rotation.z = strandAngle(s);
      const hot = s < lm && !cut;
      (headCap.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hot ? 1.6 : 0.4;
    }
  });

  return (
    <>
      <mesh geometry={shell.geometry} material={shellMat} castShadow userData={{ steel: true }} />
      <mesh ref={coreMesh} geometry={core.geometry} material={coreMat} userData={{ steel: true }} renderOrder={2} />
      <mesh ref={headCap} userData={{ steel: true }}>
        <boxGeometry args={[0.02, HALF_T * 2, HALF_W * 2]} />
        <meshStandardMaterial color="#d2561d" emissive="#ff4a00" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {coolingLayer && <SprayOverlay />}
    </>
  );
}

/** Roll positions along the strand guide. */
function rollStations() {
  const out: { s: number; r: number }[] = [];
  let s = 0.95;
  while (s < 34.5) {
    const r = s < 3 ? 0.075 : s < 12 ? 0.11 : s < 19 ? 0.15 : 0.14;
    out.push({ s, r });
    s += s < 3 ? 0.24 : s < 12 ? 0.32 : 0.42;
  }
  return out;
}

export function StrandGuide() {
  const stations = useMemo(rollStations, []);
  const rolls = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, LAYOUT.strand.width + 0.35, 14);
    const m = new THREE.InstancedMesh(geo, MAT.steel, stations.length * 2);
    const d = new THREE.Object3D();
    stations.forEach(({ s, r }, i) => {
      const p = strandPoint(s);
      const nx = -p.ty, ny = p.tx;
      [-1, 1].forEach((side, k) => {
        const off = HALF_T + r + 0.01;
        d.position.set(p.x + side * nx * off, p.y + side * ny * off, 0);
        d.rotation.set(Math.PI / 2, 0, 0);
        d.scale.set(r, 1, r);
        d.updateMatrix();
        m.setMatrixAt(i * 2 + k, d.matrix);
      });
    });
    m.castShadow = true;
    return m;
  }, [stations]);

  // segments: bender (0.9–3 m) + 14 segments to 34.5 m
  const segs = useMemo(() => {
    const bounds = [0.9, 3];
    const step = (34.5 - 3) / 14;
    for (let k = 1; k <= 14; k++) bounds.push(3 + k * step);
    return bounds.slice(0, -1).map((a, i) => ({ a, b: bounds[i + 1], i }));
  }, []);

  const dummy = useRef<THREE.Group>(null);
  useFrame(() => {
    const pose = currentPose();
    const snap = simulationProvider.getSnapshot(pose.state, pose.p);
    const head = pose.before('SHELL_FORMATION') ? 0.8 : snap.strand.castLength;
    const g = dummy.current;
    if (!g) return;
    const show = !pose.after('STRAIGHTENING') && head < 22;
    g.visible = show;
    g.children.forEach((c, i) => {
      const s = Math.min(STRAND.total, head + 0.25 + i * 0.5);
      const p = strandPoint(s);
      c.position.set(p.x, p.y, 0);
      c.rotation.z = strandAngle(s);
    });
  });

  return (
    <EquipmentGroup id="segments">
      <Strand />
      <Part id="rolls" explode={[0, 0, 2.5]}>
        <primitive object={rolls} />
      </Part>
      {segs.map(({ a, b, i }) => {
        const mid = (a + b) / 2;
        const p = strandPoint(mid);
        const len = b - a - 0.08;
        const isStraightener = b > 14 && a < 18.5;
        const content = (
          <group position={[p.x, p.y, 0]} rotation={[0, 0, strandAngle(mid)]}>
            {[-1, 1].map((sz) => (
              <mesh key={sz} position={[0, 0, sz * (HALF_W + 0.45)]} castShadow material={isStraightener ? MAT.paintYellow : MAT.structure}>
                <boxGeometry args={[len, 1.25, 0.14]} />
              </mesh>
            ))}
            {i % 2 === 0 && (
              <mesh position={[0, -HALF_T - 0.75, HALF_W + 0.85]} material={MAT.darkSteel}>
                <boxGeometry args={[0.5, 0.4, 0.45]} />
              </mesh>
            )}
          </group>
        );
        const id = i === 0 ? 'benderSegment' : isStraightener ? 'straightener' : 'segments';
        return (
          <Part key={i} id={id} explode={[0, 0, (i % 2 ? 1 : -1) * 2]}>
            {content}
          </Part>
        );
      })}
      <Part id="drives" explode={[0, -1.5, 2]}>
        {segs.filter((s) => s.i % 2 === 1).map(({ a, b }) => {
          const p = strandPoint((a + b) / 2);
          return (
            <mesh key={a} position={[p.x, p.y, HALF_W + 1.25]} material={MAT.darkSteel}>
              <cylinderGeometry args={[0.28, 0.28, 0.7, 12]} />
            </mesh>
          );
        })}
      </Part>
      <Part id="dummyBar" explode={[0, -2, 0]}>
        <group ref={dummy}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} material={MAT.darkSteel}>
              <boxGeometry args={[0.46, HALF_T * 1.7, LAYOUT.strand.width * 0.9]} />
            </mesh>
          ))}
        </group>
      </Part>
      <Part id="frame" explode={[0, 0, -3]}>
        {[
          [11, 6.5], [15.5, 4.2], [20, 3], [26, 3], [32, 3],
        ].map(([x, h]) => (
          <mesh key={x} position={[x, h / 2, -HALF_W - 1.2]} material={MAT.structure}>
            <boxGeometry args={[0.5, h, 0.5]} />
          </mesh>
        ))}
      </Part>
    </EquipmentGroup>
  );
}

/** Blue spray cones along the bow (COOLING layer overlay). */
function SprayOverlay() {
  const cones = useMemo(() => {
    const st = rollStations().filter((x, i) => x.s < 26 && i % 2 === 0);
    const geo = new THREE.ConeGeometry(0.28, 0.35, 10, 1, true);
    const m = new THREE.InstancedMesh(geo, MAT.water, st.length * 2);
    m.userData.steel = true;
    return { m, st };
  }, []);
  useFrame(() => {
    const pose = currentPose();
    const snap = simulationProvider.getSnapshot(pose.state, pose.p);
    const head = pose.before('SHELL_FORMATION') ? 0 : snap.strand.castLength;
    const d = new THREE.Object3D();
    cones.st.forEach(({ s }, i) => {
      const p = strandPoint(s + 0.14);
      const nx = -p.ty, ny = p.tx;
      [-1, 1].forEach((side, k) => {
        const off = HALF_T + 0.22;
        d.position.set(p.x + side * nx * off, p.y + side * ny * off, 0);
        d.rotation.set(0, 0, Math.atan2(ny * side, nx * side) - Math.PI / 2);
        d.scale.set(1, s < head ? 1 : 0.0001, 2.6);
        d.updateMatrix();
        cones.m.setMatrixAt(i * 2 + k, d.matrix);
      });
    });
    cones.m.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={cones.m} />;
}
