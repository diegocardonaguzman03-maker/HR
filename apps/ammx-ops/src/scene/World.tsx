import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, ContactShadows, Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { Facility } from './Facility';
import { Props } from './Props';
import { Agents, Packets } from './Agents';
import { step, BODIES } from '../sim/engine';
import { tickScreens } from './screens';
import { useStore } from '../store/useStore';
import { MEZZANINE_Y, zoneById, FACILITY } from '../data/zones';

function SimDriver() {
  const acc = useRef(0);
  useFrame(({ clock }, dt) => {
    step(dt);
    acc.current += dt;
    if (acc.current > 0.35) {
      acc.current = 0;
      tickScreens(clock.elapsedTime);
    }
  });
  return null;
}

// Targets sit left of center so the floor is framed in the space right of the Command Center panel.
const HOME = { op: { pos: new THREE.Vector3(-9, 62, 74), target: new THREE.Vector3(-9, 0, 4) }, st: { pos: new THREE.Vector3(-8, 108, 40), target: new THREE.Vector3(-8, 0, 2) } };

function CameraRig() {
  const controls = useRef<OrbitImpl>(null);
  const { camera, size } = useThree();
  const focus = useStore((s) => s.focus);
  const view = useStore((s) => s.view);
  const anim = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; t: number } | null>(null);

  const go = (pos: THREE.Vector3, target: THREE.Vector3) => {
    anim.current = { pos, target, t: 0 };
  };

  // Narrow screens need the camera further back to fit the whole floor.
  const fit = size.width < 700 ? 1.55 : size.width < 1100 ? 1.2 : 1;

  useEffect(() => {
    const h = view === 'strategic' ? HOME.st : HOME.op;
    go(h.pos.clone().multiplyScalar(fit), h.target.clone());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (focus.nonce === 0) {
      camera.position.copy(HOME.op.pos.clone().multiplyScalar(fit));
      controls.current?.target.copy(HOME.op.target);
      return;
    }
    if (focus.kind === 'home') {
      const h = view === 'strategic' ? HOME.st : HOME.op;
      go(h.pos.clone().multiplyScalar(fit), h.target.clone());
    } else if (focus.kind === 'zone' && focus.id) {
      const z = zoneById(focus.id as never);
      const d = Math.max(z.size[0], z.size[1]);
      go(new THREE.Vector3(z.center[0], d * 0.95 * fit, z.center[1] + d * 0.95 * fit), new THREE.Vector3(z.center[0], 0, z.center[1]));
    } else if (focus.kind === 'agent' && focus.id) {
      const b = BODIES[focus.id];
      go(new THREE.Vector3(b.x, 11 * fit, b.z + 13 * fit), new THREE.Vector3(b.x, 1.2, b.z));
    } else if (focus.kind === 'director') {
      go(new THREE.Vector3(0, MEZZANINE_Y + 7, 10 * fit), new THREE.Vector3(0, MEZZANINE_Y + 1.4, -2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.nonce]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const a = anim.current;
    if (a) {
      // Frame-rate independent ease toward the goal.
      a.t += dt;
      const k = 1 - Math.exp(-Math.min(dt, 0.25) * 3.2);
      camera.position.lerp(a.pos, k);
      c.target.lerp(a.target, k);
      if (camera.position.distanceTo(a.pos) < 0.15 || a.t > 4) {
        camera.position.copy(a.pos);
        c.target.copy(a.target);
        anim.current = null;
      }
    }
    // keep the orbit target inside the building
    c.target.x = THREE.MathUtils.clamp(c.target.x, FACILITY.minX, FACILITY.maxX);
    c.target.z = THREE.MathUtils.clamp(c.target.z, FACILITY.minZ, FACILITY.maxZ);
    c.target.y = THREE.MathUtils.clamp(c.target.y, 0, MEZZANINE_Y + 2);
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={150}
      minPolarAngle={0.12}
      maxPolarAngle={1.18}
      minAzimuthAngle={-0.9}
      maxAzimuthAngle={0.9}
      screenSpacePanning={false}
      panSpeed={1.2}
      onStart={() => {
        anim.current = null;
      }}
      mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
    />
  );
}

function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <color attach="background" args={['#11161c']} />
      <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 40, 0]} rotation-x={Math.PI / 2} scale={[120, 50, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#cfe0ff" position={[-60, 18, 30]} rotation-y={Math.PI / 3} scale={[60, 12, 1]} />
      <Lightformer form="rect" intensity={1.0} color="#ffd9b0" position={[60, 14, -30]} rotation-y={-Math.PI / 2.5} scale={[60, 10, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, 8, 70]} scale={[140, 8, 1]} />
    </Environment>
  );
}

function Effects({ quality }: { quality: 'high' | 'low' }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {quality === 'high' ? <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={1} halfRes /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.75} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette eskil={false} offset={0.25} darkness={0.5} />
      <SMAA />
    </EffectComposer>
  );
}

// ?q=low forces the light renderer (no post-processing, no soft shadows): used by tests and slow PCs.
const FORCE_LOW = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('q') === 'low';

export function World() {
  const [quality, setQuality] = useState<'high' | 'low'>(() =>
    FORCE_LOW || (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) ? 'low' : 'high',
  );
  return (
    <Canvas
      shadows={FORCE_LOW ? false : 'soft'}
      dpr={FORCE_LOW ? 1 : [1, 1.75]}
      camera={{ position: [-9, 62, 74], fov: 40, near: 0.5, far: 500 }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
      onPointerMissed={() => useStore.getState().hover(null)}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <color attach="background" args={['#161b22']} />
      <fog attach="fog" args={['#161b22', 120, 280]} />
      <hemisphereLight args={['#e3ebf5', '#2a2f36', 0.6]} />
      <directionalLight
        position={[30, 70, 45]}
        intensity={2.1}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={220}
      />
      <directionalLight position={[-50, 30, -35]} intensity={0.6} color="#b9d2ff" />
      <Suspense fallback={null}>
        <StudioEnvironment />
      </Suspense>
      <Facility />
      <Props />
      <Agents />
      <Packets />
      <ContactShadows position={[0, 0.02, 0]} scale={[100, 60]} resolution={1024} blur={2.4} opacity={0.4} far={10} frames={1} />
      <SimDriver />
      <CameraRig />
      <AdaptiveDpr pixelated />
      {!FORCE_LOW && <Effects quality={quality} />}
    </Canvas>
  );
}
