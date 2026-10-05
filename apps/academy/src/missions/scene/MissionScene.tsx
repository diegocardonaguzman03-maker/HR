import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Lightformer, PerformanceMonitor } from '@react-three/drei';
import type CameraControlsImpl from 'camera-controls';
import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';
import type { SceneDefT, SceneObjectT } from '../schema';
import { useMission } from '../store';
import { KINDS, TintCtx } from './kinds';

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const AMBER = new THREE.Color('#e8a33d'), GREEN = new THREE.Color('#30a46c'), RED = new THREE.Color('#e5484d'), BLUE = new THREE.Color('#6e9fd8');

/** Un objeto del escenario: solo reacciona si el paso actual lo hace interactivo. */
function SceneItem({ o, register }: { o: SceneObjectT; register: (id: string, g: THREE.Object3D | null) => void }) {
  const Kind = KINDS[o.kind];
  const { interactive, focused, marker, pick } = useMission(useShallow((s) => ({
    interactive: s.interactive.includes(o.id),
    focused: s.focus.includes(o.id),
    marker: s.markers.find((m) => m.objectId === o.id)?.kind,
    pick: s.pick,
  })));
  const [hover, setHover] = useState(false);
  const tint = marker === 'found' || marker === 'selected' ? GREEN : marker === 'wrong' ? RED : focused ? BLUE : hover && interactive ? AMBER : null;
  const amount = marker ? 0.45 : focused ? 0.35 : hover && interactive ? 0.3 : 0;
  return (
    <group
      ref={(g) => register(o.id, g)}
      name={o.id}
      position={o.position}
      rotation={o.rotation}
      scale={o.scale}
      onClick={interactive ? (e) => { e.stopPropagation(); pick(o.id); } : undefined}
      onPointerOver={interactive ? (e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={interactive ? () => { setHover(false); document.body.style.cursor = 'auto'; } : undefined}
    >
      <TintCtx.Provider value={{ color: tint, amount }}>
        <Kind o={o} />
      </TintCtx.Provider>
    </group>
  );
}

/** Marcadores 2D anclados al objeto (encontrado, pista, seleccionado). Solo los del paso actual. */
function Markers({ refs }: { refs: React.MutableRefObject<Map<string, THREE.Object3D>> }) {
  const markers = useMission((s) => s.markers);
  return (
    <>
      {markers.map((m) => {
        const g = refs.current.get(m.objectId);
        if (!g) return null;
        const box = new THREE.Box3().setFromObject(g);
        if (box.isEmpty()) return null;
        const c = box.getCenter(new THREE.Vector3());
        const pos: [number, number, number] = [c.x, Math.min(box.max.y + 0.25, c.y + 2.2), c.z];
        return (
          <Html key={`${m.objectId}-${m.kind}`} position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            {m.kind === 'hint' ? (
              <span className="mission-hint" aria-hidden />
            ) : (
              <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-lg ${m.kind === 'wrong' ? 'bg-[#e5484d] text-white' : 'bg-[#30a46c] text-white'}`}>
                {m.kind === 'wrong' ? '↻ ' : '✓ '}{m.label}
              </span>
            )}
          </Html>
        );
      })}
    </>
  );
}

function CameraRig({ home }: { home: SceneDefT['home'] }) {
  const ref = useRef<CameraControlsImpl>(null);
  const req = useMission((s) => s.camera);
  useEffect(() => { ref.current?.setLookAt(...home.position, ...home.target, false); }, [home]);
  useEffect(() => {
    if (!req || !ref.current) return;
    void ref.current.setLookAt(...req.cam.position, ...req.cam.target, !reduced());
  }, [req]);
  return <CameraControls ref={ref} makeDefault minDistance={1.2} maxDistance={45} maxPolarAngle={Math.PI * 0.49} smoothTime={0.5} dollySpeed={0.6} />;
}

function Readiness({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => { const id = requestAnimationFrame(() => onReady()); return () => cancelAnimationFrame(id); }, [gl, onReady]);
  return null;
}

export default function MissionScene({ scene, onReady }: { scene: SceneDefT; onReady?: () => void }) {
  const refs = useRef(new Map<string, THREE.Object3D>());
  const register = useMemo(() => (id: string, g: THREE.Object3D | null) => { if (g) refs.current.set(id, g); else refs.current.delete(id); }, []);
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      shadows
      dpr={[1, dpr]}
      camera={{ position: scene.home.position, fov: 42, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-label="Escenario 3D de la misión"
      data-testid="mission-canvas"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
      <color attach="background" args={['#1a1f26']} />
      <fog attach="fog" args={['#1a1f26', 40, 90]} />
      <hemisphereLight args={['#e6edf7', '#2a2420', 1.1]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 18, 8]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 20, 0]} rotation-x={Math.PI / 2} scale={[40, 20, 1]} />
        <Lightformer form="rect" intensity={1} color="#cfe0ff" position={[-20, 8, 10]} rotation-y={Math.PI / 3} scale={[30, 8, 1]} />
      </Environment>
      {scene.objects.map((o) => <SceneItem key={o.id} o={o} register={register} />)}
      <Markers refs={refs} />
      <CameraRig home={scene.home} />
      {onReady && <Readiness onReady={onReady} />}
    </Canvas>
  );
}
