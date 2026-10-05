import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { useApp, type EffectiveQuality } from '../../stores/useApp';
import { EafModel } from './EafModel';
import { Hotspots } from './Hotspots';
import { CameraDirector } from './CameraDirector';
import { Y0 } from './anchors';

/** Presets de calidad (docs/performance-report.md). */
export const PRESETS: Record<EffectiveQuality, { dpr: number; shadows: boolean; post: 'none' | 'basic' | 'full'; envRes: number }> = {
  low: { dpr: 1, shadows: false, post: 'none', envRes: 64 },
  medium: { dpr: 1.5, shadows: true, post: 'basic', envRes: 128 },
  high: { dpr: 2, shadows: true, post: 'full', envRes: 256 },
};
const ORDER: EffectiveQuality[] = ['low', 'medium', 'high'];
const REDUCED = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function Effects({ q }: { q: EffectiveQuality }) {
  if (PRESETS[q].post === 'none') return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {PRESETS[q].post === 'full' ? <N8AO aoRadius={1.2} intensity={2} distanceFalloff={0.8} halfRes /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.8} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      {PRESETS[q].post === 'full' ? <Vignette eskil={false} offset={0.25} darkness={0.5} /> : <></>}
      <SMAA />
    </EffectComposer>
  );
}

/** Luz del baño y del arco (demostrativa: no representa parámetros reales). */
function FurnaceLight() {
  const arc = useRef<THREE.PointLight>(null);
  const sprite = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const on = useApp.getState().arcDemo;
    const t = clock.elapsedTime;
    // Ilustrativo: ≤ 2 Hz y ±10 %, sin destellos (WCAG 2.3.1). No representa parámetros reales.
    if (arc.current) arc.current.intensity = on ? (REDUCED ? 60 : 60 + Math.sin(t * 2 * Math.PI * 1.5) * 6) : 0;
    if (sprite.current) { sprite.current.visible = on; sprite.current.scale.setScalar(REDUCED ? 1 : 1 + Math.sin(t * 2 * Math.PI * 1.2) * 0.05); }
  });
  const tips = [180, 60, 300].map((d) => [Math.cos((d * Math.PI) / 180) * 0.8, 1.25, Math.sin((d * Math.PI) / 180) * 0.8] as [number, number, number]);
  return (
    <>
      <pointLight position={[0, 1.6, 0]} color="#ff7a2a" intensity={8} distance={9} decay={2} />
      <pointLight ref={arc} position={[0, 1.4, 0]} color="#bfd8ff" intensity={0} distance={14} decay={2} />
      <group ref={sprite} visible={false}>
        {tips.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshBasicMaterial color={new THREE.Color(6, 7, 9)} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** Métricas para el informe de rendimiento y las pruebas e2e (sin datos del usuario). */
function Metrics() {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ t: 0, f: 0 });
  useFrame((_, dt) => {
    acc.current.t += dt; acc.current.f++;
    if (acc.current.t >= 1) {
      (window as unknown as { __adx: unknown }).__adx = { fps: Math.round(acc.current.f / acc.current.t), calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, quality: useApp.getState().effective };
      acc.current = { t: 0, f: 0 };
    }
  });
  return null;
}

function Studio({ res }: { res: number }) {
  return (
    <Environment resolution={res} frames={1} background={false}>
      <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 30, 0]} rotation-x={Math.PI / 2} scale={[60, 30, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#cfe0ff" position={[-30, 10, 20]} rotation-y={Math.PI / 3} scale={[40, 10, 1]} />
      <Lightformer form="rect" intensity={1} color="#ffd9b0" position={[30, 8, -20]} rotation-y={-Math.PI / 2.5} scale={[40, 8, 1]} />
      <Lightformer form="ring" intensity={2.5} color="#ff9a4a" position={[0, 3, 0]} scale={3} />
    </Environment>
  );
}

export function Scene() {
  const quality = useApp((s) => s.quality);
  const effective = useApp((s) => s.effective);
  const set = useApp((s) => s.set);
  const p = PRESETS[effective];
  return (
    <Canvas
      data-testid="scene-canvas"
      shadows={p.shadows ? 'soft' : false}
      dpr={[1, p.dpr]}
      camera={{ position: [25, 15, 27], fov: 40, near: 0.1, far: 300 }}
      gl={{ antialias: p.post === 'none', powerPreference: 'high-performance', toneMapping: p.post === 'none' ? THREE.AgXToneMapping : THREE.NoToneMapping, preserveDrawingBuffer: false }}
      onPointerMissed={() => { const s = useApp.getState(); if (!s.picking) s.set({ selectedComponentNode: null }); }}
      aria-label="Modelo 3D esquemático del horno de arco eléctrico"
    >
      <color attach="background" args={['#0c0e11']} />
      <fog attach="fog" args={['#0c0e11', 45, 110]} />
      {quality === 'auto' && (
        <PerformanceMonitor
          bounds={() => [40, 58]}
          flipflops={3}
          onDecline={() => { const i = ORDER.indexOf(useApp.getState().effective); if (i > 0) set({ effective: ORDER[i - 1] }); }}
          onIncline={() => { const i = ORDER.indexOf(useApp.getState().effective); if (i < ORDER.length - 1) set({ effective: ORDER[i + 1] }); }}
        />
      )}
      <hemisphereLight args={['#c9d6e8', '#1a1410', 0.5]} />
      <directionalLight
        position={[14, 22, 10]} intensity={2.2} castShadow={p.shadows}
        shadow-mapSize={[effective === 'high' ? 2048 : 1024, effective === 'high' ? 2048 : 1024]}
        shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-bias={-0.0004}
      />
      <Studio res={p.envRes} />
      <FurnaceLight />
      <mesh rotation-x={-Math.PI / 2} position={[0, -Y0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#1b1d20" roughness={0.95} />
      </mesh>
      <Grid position={[0, -Y0 + 0.01, 0]} args={[80, 80]} cellSize={1} cellThickness={0.5} cellColor="#23272d" sectionSize={5} sectionThickness={0.8} sectionColor="#2e343c" fadeDistance={60} infiniteGrid={false} />
      <Suspense fallback={null}>
        <EafModel />
        <Hotspots />
      </Suspense>
      <CameraDirector />
      <Effects q={effective} />
      <Metrics />
    </Canvas>
  );
}
