import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type CameraControlsImpl from 'camera-controls';
import { HOME, useApp } from '../../stores/useApp';
import { boxOfNodes } from './EafModel';

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function CameraDirector() {
  const ref = useRef<CameraControlsImpl>(null);
  const req = useApp((s) => s.cameraRequest);
  const loaded = useApp((s) => s.loaded);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.setLookAt(...HOME.position, ...HOME.target, false);
  }, []);
  useEffect(() => {
    const c = ref.current;
    if (!c || !req) return;
    const smooth = !reduced() && !(window as unknown as { __adxInstant?: boolean }).__adxInstant;
    if (req.camera) {
      void c.setLookAt(...req.camera.position, ...req.camera.target, smooth);
    } else if (req.fitNodes) {
      const box = boxOfNodes(scene, req.fitNodes);
      if (box) void c.fitToBox(box, smooth, { paddingTop: 1.2, paddingBottom: 1.2, paddingLeft: 1.6, paddingRight: 1.6 });
    }
  }, [req, scene, loaded]);
  return <CameraControls ref={ref} makeDefault minDistance={3} maxDistance={70} maxPolarAngle={Math.PI * 0.49} dollySpeed={0.6} smoothTime={0.45} />;
}
