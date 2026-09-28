import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, AdaptiveDpr, Grid, Environment, Lightformer, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import type CameraControlsImpl from 'camera-controls';
import { useAppStore } from '../store/useAppStore';
import { CAMERA_PRESETS } from '../config/layout';
import { clock, steps } from '../sim/clock';
import { currentPose, heatPosition } from '../sim/kinematics';
import { equipmentRegistry } from './common/EquipmentGroup';
import { keys } from '../ui/game/input';
import { MAT } from './common/materials';
import { RawMaterials } from './equipment/RawMaterials';
import { EAF } from './equipment/EAF';
import { HeatLadle } from './equipment/Ladle';
import { LadleFurnace } from './equipment/LadleFurnace';
import { Crane, Turret } from './equipment/CraneAndTurret';
import { Mold, Tundish } from './equipment/TundishMold';
import { StrandGuide } from './equipment/Strand';
import { CoolingSystem, SlabLine, TorchCutter } from './equipment/CoolingCutterSlab';
import { LayerMarkers, ProcessFlowPath, SectionPlane, SteelMarker , EquipmentLabels } from './overlays/Overlays';

/** Advances the deterministic simulation clock and mirrors it to the UI at ~10 Hz. */
/** Portrait screens (phones) get a wider lens so camera presets keep the machine in frame. */
function ResponsiveLens() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    camera.fov = aspect >= 1.2 ? 42 : Math.min(70, 42 * (1.2 / aspect) * 0.6 + 42 * 0.4);
    camera.updateProjectionMatrix();
  }, [camera, aspect]);
  return null;
}

function SimulationDriver() {
  const acc = useRef(0);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    clock.elapsed += d;
    if (clock.playing) {
      clock.stepTime += d * clock.speed;
      const s = steps();
      const st = s[clock.stepIndex];
      if (clock.stepTime >= st.duration) {
        if (clock.stepIndex < s.length - 1) {
          clock.stepIndex += 1;
          clock.stepTime = 0;
        } else {
          clock.stepTime = st.duration;
          clock.playing = false;
        }
      }
    }
    acc.current += d;
    if (acc.current > 0.1) {
      acc.current = 0;
      useAppStore.getState().syncFromClock();
    }
  });
  return null;
}

/** Smooth camera presets, equipment framing and Follow-the-Steel. */
function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const request = useAppStore((s) => s.cameraRequest);
  const follow = useAppStore((s) => s.followCamera);
  const followOffset = useRef(new THREE.Vector3(10, 7, 14));
  const tmp = useRef(new THREE.Vector3());
  const tgt = useRef(new THREE.Vector3());

  useEffect(() => {
    const c = ref.current;
    if (!c || !request) return;
    if (request.kind === 'preset' && request.preset) {
      const p = CAMERA_PRESETS[request.preset];
      c.setLookAt(...p.position, ...p.target, true);
    } else if (request.kind === 'equipment' && request.equipment) {
      const obj = equipmentRegistry.get(request.equipment);
      if (obj) {
        const box = new THREE.Box3().setFromObject(obj);
        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          // keep huge elements (runways, strand) framed sensibly
          const r = Math.min(Math.max(size.length() * 0.95, 9), 60);
          c.setLookAt(center.x + r * 0.55, center.y + r * 0.42, center.z + r * 0.72, center.x, center.y, center.z, true);
        }
      }
    } else if (request.kind === 'fit') {
      const p = CAMERA_PRESETS.overview;
      c.setLookAt(...p.position, ...p.target, true);
    }
  }, [request]);

  const camPos = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  useFrame((_, dtRaw) => {
    const c = ref.current;
    if (!c) return;
    const dt = Math.min(dtRaw, 0.05);
    const st = useAppStore.getState();
    // attract-mode orbit behind the start screen
    if (!st.started) {
      c.rotate(dt * 0.05, 0, false);
      return;
    }
    // WASD / arrows: horizontal game-style movement; Q/E vertical
    if (keys.size && !follow) {
      const pos = c.getPosition(camPos.current);
      const tg = c.getTarget(tmp.current);
      const dist = pos.distanceTo(tg);
      const boost = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 3 : 1;
      const v = Math.max(6, dist * 0.8) * boost * dt;
      dir.current.subVectors(tg, pos).setY(0).normalize();
      right.current.crossVectors(dir.current, new THREE.Vector3(0, 1, 0)).normalize();
      const m = new THREE.Vector3();
      if (keys.has('KeyW') || keys.has('ArrowUp')) m.add(dir.current);
      if (keys.has('KeyS') || keys.has('ArrowDown')) m.sub(dir.current);
      if (keys.has('KeyD') || keys.has('ArrowRight')) m.add(right.current);
      if (keys.has('KeyA') || keys.has('ArrowLeft')) m.sub(right.current);
      if (keys.has('KeyE')) m.y += 1;
      if (keys.has('KeyQ')) m.y -= 1;
      if (m.lengthSq() > 0) {
        m.normalize().multiplyScalar(v);
        const np = pos.clone().add(m);
        const nt = tg.clone().add(m);
        if (np.y < 1) { nt.y += 1 - np.y; np.y = 1; }
        c.setLookAt(np.x, np.y, np.z, nt.x, nt.y, nt.z, false);
      }
    }
    if (!follow) return;
    const p = heatPosition(currentPose());
    tgt.current.set(p[0], p[1], p[2]);
    const cur = c.getTarget(tmp.current);
    const pos = c.getPosition(camPos.current);
    // preserve the user's orbit offset, move only the focus point
    const offset = pos.clone().sub(cur);
    if (offset.length() > 40) offset.setLength(24);
    if (offset.length() < 6) offset.copy(followOffset.current);
    cur.lerp(tgt.current, Math.min(1, dt * 2.2));
    const np = cur.clone().add(offset);
    c.setLookAt(np.x, np.y, np.z, cur.x, cur.y, cur.z, false);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={2}
      maxDistance={160}
      maxPolarAngle={Math.PI * 0.495}
      smoothTime={0.6}
      draggingSmoothTime={0.15}
    />
  );
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -0.01, 0]} receiveShadow material={MAT.concrete} userData={{ noPick: true }}>
        <planeGeometry args={[170, 70]} />
      </mesh>
      <Grid position={[-4, 0.005, 0]} args={[170, 70]} cellSize={2} cellThickness={0.35} cellColor="#39414b" sectionSize={10} sectionThickness={0.9} sectionColor="#4a5360" fadeDistance={150} fadeStrength={1.5} infiniteGrid={false} />
      {/* safety walkway markings along the process line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.012, 8.5]} userData={{ noPick: true }}>
        <planeGeometry args={[150, 0.25]} />
        <meshBasicMaterial color="#c9a227" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.012, 10.5]} userData={{ noPick: true }}>
        <planeGeometry args={[150, 0.25]} />
        <meshBasicMaterial color="#c9a227" />
      </mesh>
    </>
  );
}

/** Light building frame (columns) to give industrial scale without hiding equipment. */
function Building() {
  // Cut-away building: columns only on the far side so the view stays open.
  const cols: number[] = [];
  for (let x = -70; x <= 60; x += 12) cols.push(x);
  return (
    <group>
      {cols.map((x) => (
        <mesh key={x} position={[x, 13, -14]} material={MAT.structure} userData={{ noPick: true }}>
          <boxGeometry args={[0.6, 26, 0.6]} />
        </mesh>
      ))}
      <mesh position={[-5, 26.2, -14]} material={MAT.structure} userData={{ noPick: true }}>
        <boxGeometry args={[131, 0.5, 0.5]} />
      </mesh>
    </group>
  );
}

function Plant() {
  const layers = useAppStore((s) => s.layers);
  return (
    <>
      <RawMaterials />
      <EAF />
      <HeatLadle />
      <LadleFurnace />
      <Crane />
      <Turret />
      <Tundish />
      <Mold />
      <StrandGuide />
      <CoolingSystem />
      <TorchCutter />
      <SlabLine />
      {layers.processFlow && <ProcessFlowPath />}
      {layers.steelFlow && <SteelMarker />}
      <LayerMarkers />
      <EquipmentLabels />
      <SectionPlane />
    </>
  );
}

function ClearSelectionOnMiss() {
  const { gl } = useThree();
  useEffect(() => {
    gl.domElement.style.touchAction = 'none';
  }, [gl]);
  return null;
}

/** Studio-style image-based lighting built locally (no external HDR download). */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <color attach="background" args={['#0f1318']} />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 40, 0]} rotation-x={Math.PI / 2} scale={[120, 40, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#cfe0ff" position={[-60, 18, 30]} rotation-y={Math.PI / 3} scale={[60, 12, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#ffd9b0" position={[60, 14, -30]} rotation-y={-Math.PI / 2.5} scale={[60, 10, 1]} />
      <Lightformer form="ring" intensity={3} color="#ff9a4a" position={[-38, 6, 12]} scale={6} />
      <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, 8, 60]} scale={[140, 8, 1]} />
    </Environment>
  );
}

/** Post-processing: ambient occlusion for depth, bloom for molten steel and arcs, vignette, SMAA. */
function Effects({ quality }: { quality: 'high' | 'low' }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {quality === 'high' ? <N8AO aoRadius={2.2} intensity={2.4} distanceFalloff={1.2} halfRes /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette eskil={false} offset={0.22} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}

export function Experience() {
  const [quality, setQuality] = useState<'high' | 'low'>(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 'low' : 'high',
  );
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ position: [-10, 42, 62], fov: 42, near: 0.1, far: 600 }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
      onPointerMissed={(e) => {
        if (e.button === 0) {
          const st = useAppStore.getState();
          st.setHovered(null);
          if (!st.componentMode) st.select(null);
        }
      }}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <color attach="background" args={['#1b2129']} />
      <fog attach="fog" args={['#1b2129', 110, 260]} />
      <hemisphereLight args={['#dfe8f3', '#2a2f36', 0.55]} />
      <directionalLight
        position={[35, 70, 40]}
        intensity={2.2}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-85}
        shadow-camera-right={85}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={220}
      />
      <directionalLight position={[-50, 30, -35]} intensity={0.7} color="#b9d2ff" />
      <Suspense fallback={null}>
        <StudioEnvironment />
        <Ground />
        <Building />
        <Plant />
        <ContactShadows position={[-4, 0.02, 0]} scale={[170, 70]} resolution={1024} blur={2.2} opacity={0.55} far={12} frames={1} />
      </Suspense>
      <SimulationDriver />
      <ResponsiveLens />
      <CameraRig />
      <ClearSelectionOnMiss />
      <AdaptiveDpr pixelated />
      <Effects quality={quality} />
    </Canvas>
  );
}
