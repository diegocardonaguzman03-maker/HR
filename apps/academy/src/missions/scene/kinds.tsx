/**
 * Biblioteca de objetos del escenario (procedurales, livianos). Cada «kind» se dibuja a partir de sus props.
 * El color de resalte (hover, foco, encontrado) llega por contexto para no duplicar materiales.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { SceneObjectT } from '../schema';
import { useMission } from '../store';

export const TintCtx = createContext<{ color: THREE.Color | null; amount: number }>({ color: null, amount: 0 });

/** Material estándar que respeta el resalte del contexto. */
export function M({ color, rough = 0.7, metal = 0.1, emissive, ei = 0, transparent, opacity }: { color: string; rough?: number; metal?: number; emissive?: string; ei?: number; transparent?: boolean; opacity?: number }) {
  const t = useContext(TintCtx);
  const em = t.color && t.amount > 0 ? t.color : new THREE.Color(emissive ?? '#000000');
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={em} emissiveIntensity={t.color && t.amount > 0 ? t.amount : ei} transparent={transparent} opacity={opacity ?? 1} />;
}

const Box = ({ s, p = [0, 0, 0], c, r, m, rot }: { s: [number, number, number]; p?: [number, number, number]; c: string; r?: number; m?: number; rot?: [number, number, number] }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow><boxGeometry args={s} /><M color={c} rough={r} metal={m} /></mesh>
);
const Cyl = ({ rad, h, p = [0, 0, 0], c, rot, seg = 16, m }: { rad: number; h: number; p?: [number, number, number]; c: string; rot?: [number, number, number]; seg?: number; m?: number }) => (
  <mesh position={p} rotation={rot} castShadow><cylinderGeometry args={[rad, rad, h, seg]} /><M color={c} metal={m} /></mesh>
);

/** Textura de texto (sin fuentes externas: funciona sin red). */
export function useLabelTexture(text: string, bg = '#f5c518', fg = '#111', w = 512, h = 128) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    if (g) {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = fg; g.font = `bold ${Math.round(h * 0.38)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, w / 2, h / 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, bg, fg, w, h]);
}
function Label({ text, size, p, bg, fg, rot }: { text: string; size: [number, number]; p: [number, number, number]; bg?: string; fg?: string; rot?: [number, number, number] }) {
  const tex = useLabelTexture(text, bg, fg);
  return <mesh position={p} rotation={rot}><planeGeometry args={size} /><meshStandardMaterial map={tex} roughness={0.8} /></mesh>;
}

const num = (o: SceneObjectT, k: string, d: number) => (typeof o.props[k] === 'number' ? (o.props[k] as number) : d);
const bool = (o: SceneObjectT, k: string, d = false) => (typeof o.props[k] === 'boolean' ? (o.props[k] as boolean) : d);
const str = (o: SceneObjectT, k: string, d: string) => (typeof o.props[k] === 'string' ? (o.props[k] as string) : d);

const STEEL = '#59636e', YELLOW = '#e0b21a', CONCRETE = '#3a3f46';

function Platform({ o }: { o: SceneObjectT }) {
  const w = num(o, 'w', 8), d = num(o, 'd', 6), h = num(o, 'h', 4);
  return (
    <group>
      <Box s={[w, 0.2, d]} p={[0, h - 0.1, 0]} c="#6b7480" r={0.85} m={0.3} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} s={[0.3, h - 0.2, 0.3]} p={[sx * (w / 2 - 0.3), (h - 0.2) / 2, sz * (d / 2 - 0.3)]} c={STEEL} m={0.5} />))}
      {[-1, 1].map((sz) => <Box key={sz} s={[w, 0.3, 0.2]} p={[0, h - 0.35, sz * (d / 2 - 0.3)]} c={STEEL} m={0.5} />)}
    </group>
  );
}

function Ladder({ o }: { o: SceneObjectT }) {
  const h = num(o, 'h', 4), miss = bool(o, 'missingRung');
  const rungs = Math.floor((h + 1) / 0.3);
  return (
    <group>
      {[-0.25, 0.25].map((x) => <Box key={x} s={[0.06, h + 1.1, 0.06]} p={[x, (h + 1.1) / 2, 0]} c={YELLOW} m={0.3} />)}
      {Array.from({ length: rungs }, (_, i) => (miss && (i === 6 || i === 7) ? null : <Cyl key={i} rad={0.02} h={0.5} p={[0, 0.3 + i * 0.3, 0]} rot={[0, 0, Math.PI / 2]} c={YELLOW} m={0.3} />))}
      {miss && <Cyl rad={0.02} h={0.18} p={[0.17, 0.3 + 6 * 0.3, 0]} rot={[0, 0, Math.PI / 2]} c="#7a5a10" />}
    </group>
  );
}

function Guardrail({ o }: { o: SceneObjectT }) {
  const L = num(o, 'length', 6), miss = bool(o, 'missingMidrail');
  const posts = Math.max(2, Math.round(L / 1.5) + 1);
  return (
    <group>
      {Array.from({ length: posts }, (_, i) => <Box key={i} s={[0.06, 1.1, 0.06]} p={[-L / 2 + (i * L) / (posts - 1), 0.55, 0]} c={YELLOW} />)}
      <Box s={[L, 0.06, 0.06]} p={[0, 1.1, 0]} c={YELLOW} />
      {!miss && <Box s={[L, 0.05, 0.05]} p={[0, 0.55, 0]} c={YELLOW} />}
      <Box s={[L, 0.15, 0.03]} p={[0, 0.075, 0]} c={YELLOW} />
    </group>
  );
}

/** Borde sin protección: zona invisible pero seleccionable a lo largo del borde abierto. */
function Edge({ o }: { o: SceneObjectT }) {
  const L = num(o, 'length', 6);
  return (
    <group>
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[L, 1.2, 0.5]} /><M color="#ffffff" transparent opacity={0} /></mesh>
      <Box s={[L, 0.04, 0.12]} p={[0, 0.02, 0]} c="#3a4048" />
    </group>
  );
}

function Opening({ o }: { o: SceneObjectT }) {
  const s = num(o, 'size', 1.2);
  return (
    <group>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[s, s]} /><M color="#050607" rough={1} /></mesh>
      {[[0, s / 2], [0, -s / 2]].map(([x, z], i) => <Box key={i} s={[s + 0.1, 0.04, 0.05]} p={[x, 0.02, z]} c="#3a4048" />)}
      {bool(o, 'covered') ? <Box s={[s + 0.2, 0.05, s + 0.2]} p={[0, 0.03, 0]} c="#c9a227" /> : <Box s={[0.5, 0.04, s * 0.9]} p={[s * 0.35, 0.03, 0]} c="#7a6a4a" rot={[0, 0.25, 0]} />}
    </group>
  );
}

function Powerline({ o }: { o: SceneObjectT }) {
  const h = num(o, 'h', 7), span = num(o, 'span', 12);
  const wires = useMemo(() => [-0.6, 0, 0.6].map((dz) => {
    const pts = Array.from({ length: 21 }, (_, i) => { const t = i / 20; const x = -span / 2 + t * span; return new THREE.Vector3(x, h - 0.1 - Math.sin(t * Math.PI) * 0.6, dz); });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.025, 6, false);
  }), [h, span]);
  return (
    <group>
      {[-span / 2, span / 2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Cyl rad={0.14} h={h} p={[0, h / 2, 0]} c="#6b5a45" />
          <Box s={[0.12, 0.12, 1.6]} p={[0, h - 0.1, 0]} c="#6b5a45" />
        </group>
      ))}
      {wires.map((g, i) => <mesh key={i} geometry={g}><M color="#1c1c1c" metal={0.6} /></mesh>)}
      <mesh position={[0, h - 0.4, 0]}><boxGeometry args={[span, 1.4, 2]} /><M color="#fff" transparent opacity={0} /></mesh>
    </group>
  );
}

function Tools() {
  return (
    <group>
      <Box s={[0.5, 0.22, 0.25]} p={[0, 0.11, 0]} c="#c0392b" />
      <Box s={[0.32, 0.03, 0.05]} p={[0.15, 0.24, 0.2]} c="#9aa3ad" m={0.8} rot={[0, 0.6, 0]} />
      <Cyl rad={0.02} h={0.35} p={[-0.2, 0.03, 0.25]} rot={[Math.PI / 2, 0, 0.8]} c="#8a6a3a" />
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[1, 0.8, 0.9]} /><M color="#fff" transparent opacity={0} /></mesh>
    </group>
  );
}

function Person({ o }: { o: SceneObjectT }) {
  const c = str(o, 'color', '#3b82f6');
  return (
    <group>
      <Box s={[0.18, 0.8, 0.22]} p={[-0.11, 0.4, 0]} c="#2b3440" />
      <Box s={[0.18, 0.8, 0.22]} p={[0.11, 0.4, 0]} c="#2b3440" />
      <Box s={[0.5, 0.7, 0.28]} p={[0, 1.15, 0]} c={c} />
      <Box s={[0.12, 0.62, 0.14]} p={[-0.32, 1.12, 0]} c={c} />
      <Box s={[0.12, 0.62, 0.14]} p={[0.32, 1.12, 0]} c={c} />
      <mesh position={[0, 1.7, 0]} castShadow><sphereGeometry args={[0.15, 16, 12]} /><M color="#c99a78" /></mesh>
      {<mesh position={[0, 1.79, 0]}><sphereGeometry args={[0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><M color={bool(o, 'helmet') ? '#f2f2f2' : '#e8a33d'} /></mesh>}
    </group>
  );
}

function Spill({ o }: { o: SceneObjectT }) {
  const r = num(o, 'r', 0.6);
  return (
    <group>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.7, 1]}><circleGeometry args={[r, 24]} /><M color="#0b0d10" rough={0.05} metal={0.6} /></mesh>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[r * 2, 0.4, r * 1.6]} /><M color="#fff" transparent opacity={0} /></mesh>
    </group>
  );
}

function Luminaire() {
  return (
    <group>
      <Cyl rad={0.01} h={0.6} p={[0, 0.3, 0]} c="#222" />
      <Box s={[1.2, 0.12, 0.3]} p={[0, 0, 0]} c="#d8dde3" m={0.4} />
      <mesh position={[0, -0.065, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1.1, 0.24]} /><meshStandardMaterial color="#fffbe6" emissive="#fff3c4" emissiveIntensity={1.2} /></mesh>
    </group>
  );
}

function Sign({ o }: { o: SceneObjectT }) {
  return (
    <group>
      <Cyl rad={0.04} h={2} p={[0, 1, 0]} c={STEEL} />
      <Label text={str(o, 'text', 'SEÑAL')} size={[1.4, 0.45]} p={[0, 2.1, 0.05]} bg="#1d4ed8" fg="#fff" />
    </group>
  );
}

function Anchor({ o }: { o: SceneObjectT }) {
  return (
    <group>
      <Box s={[0.3, 0.06, 0.3]} p={[0, 0, 0]} c="#c9ced6" m={0.8} />
      <mesh position={[0, -0.13, 0]}><torusGeometry args={[0.09, 0.022, 10, 24]} /><M color="#e6e9ee" metal={0.9} rough={0.3} /></mesh>
      {bool(o, 'tag') && <Label text="ANCLAJE" size={[0.36, 0.1]} p={[0, -0.05, 0.16]} />}
      <mesh position={[0, -0.1, 0]}><boxGeometry args={[0.6, 0.5, 0.6]} /><M color="#fff" transparent opacity={0} /></mesh>
    </group>
  );
}

function Pipe({ o }: { o: SceneObjectT }) {
  const L = num(o, 'length', 6), r = num(o, 'r', 0.05);
  return (
    <group>
      <Cyl rad={r} h={L} c={str(o, 'color', '#9aa3ad')} m={0.6} />
      <mesh><cylinderGeometry args={[0.25, 0.25, L, 8]} /><M color="#fff" transparent opacity={0} /></mesh>
    </group>
  );
}

function CableTray({ o }: { o: SceneObjectT }) {
  const L = num(o, 'length', 6);
  return (
    <group>
      <Box s={[L, 0.03, 0.4]} c="#8a939e" m={0.6} />
      {[-0.2, 0.2].map((z) => <Box key={z} s={[L, 0.12, 0.02]} p={[0, 0.06, z]} c="#8a939e" m={0.6} />)}
      {[-0.1, 0, 0.1].map((z, i) => <Cyl key={z} rad={0.025} h={L} p={[0, 0.04, z]} rot={[0, 0, Math.PI / 2]} c={['#111', '#7f1d1d', '#1e3a8a'][i]} />)}
    </group>
  );
}

function Column({ o }: { o: SceneObjectT }) {
  const h = num(o, 'h', 6), s = num(o, 'size', 0.3);
  return <Box s={[s, h, s]} c={STEEL} m={0.5} />;
}

function Bench() {
  return (
    <group>
      <Box s={[2.4, 0.08, 1.0]} p={[0, 0.88, 0]} c="#3f4650" m={0.4} />
      {[-1.1, 1.1].flatMap((x) => [-0.42, 0.42].map((z) => <Box key={`${x}${z}`} s={[0.06, 0.88, 0.06]} p={[x, 0.44, z]} c={STEEL} />))}
    </group>
  );
}

/** Arnés de cuerpo completo con zonas de inspección seleccionables (eaf de inspección). */
export const HARNESS_ZONES = ['correas-hombro', 'costuras', 'hebillas', 'argolla-dorsal', 'etiqueta', 'correa-pierna'] as const;
function Harness({ o }: { o: SceneObjectT }) {
  const zones = useMission((s) => (s.zones?.objectId === o.id ? s.zones.states : null));
  const pick = useMission((s) => s.pick);
  const defect = str(o, 'defect', '');
  const web = '#d97706', web2 = '#b45309';
  const Zone = ({ id, children }: { id: string; children: ReactNode }) => {
    const st = zones?.[id];
    const tint = st === 'ok' ? new THREE.Color('#30a46c') : st === 'defect' ? new THREE.Color('#e5484d') : st === 'pending' ? new THREE.Color('#e8a33d') : null;
    return (
      <TintCtx.Provider value={{ color: tint, amount: st === 'pending' ? 0.18 : st ? 0.45 : 0 }}>
        <group name={`${o.id}#${id}`} onClick={zones ? (e) => { e.stopPropagation(); pick(`${o.id}#${id}`); } : undefined}
          onPointerOver={zones ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
          onPointerOut={zones ? () => { document.body.style.cursor = 'auto'; } : undefined}>
          {children}
        </group>
      </TintCtx.Provider>
    );
  };
  return (
    <group>
      {/* soporte */}
      <Box s={[0.04, 0.95, 0.04]} p={[0, 0.48, -0.12]} c={STEEL} />
      <Box s={[0.5, 0.04, 0.04]} p={[0, 0.95, -0.12]} c={STEEL} />
      <Zone id="correas-hombro">
        {[-0.12, 0.12].map((x) => <Box key={x} s={[0.06, 0.5, 0.015]} p={[x, 0.7, 0]} c={web} />)}
      </Zone>
      <Zone id="costuras">
        {[-0.12, 0.12].map((x) => <Box key={x} s={[0.064, 0.06, 0.02]} p={[x, 0.86, 0.002]} c="#fde68a" />)}
        <Box s={[0.32, 0.03, 0.02]} p={[0, 0.48, 0.002]} c="#fde68a" />
      </Zone>
      <Zone id="hebillas">
        <Box s={[0.08, 0.05, 0.03]} p={[0, 0.62, 0.01]} c="#cbd5e1" m={0.8} />
        {[-0.14, 0.14].map((x) => <Box key={x} s={[0.06, 0.05, 0.03]} p={[x, 0.35, 0.01]} c="#cbd5e1" m={0.8} />)}
      </Zone>
      <Box s={[0.36, 0.06, 0.015]} p={[0, 0.62, 0]} c={web2} />
      <Box s={[0.4, 0.07, 0.015]} p={[0, 0.45, 0]} c={web2} />
      <Zone id="argolla-dorsal">
        <mesh position={[0, 0.84, -0.03]} rotation={[0, 0, 0]}><torusGeometry args={[0.04, 0.009, 8, 20]} /><M color="#e2e8f0" metal={0.9} rough={0.3} /></mesh>
        <Box s={[0.08, 0.05, 0.01]} p={[0, 0.8, -0.02]} c={web} />
      </Zone>
      <Zone id="etiqueta">
        <Box s={[0.07, 0.04, 0.005]} p={[0.17, 0.42, 0.012]} c="#f8fafc" />
      </Zone>
      <Zone id="correa-pierna">
        {[-0.12, 0.12].map((x) => <mesh key={x} position={[x, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09, 0.016, 8, 24]} /><M color={web} /></mesh>)}
        {defect === 'correa-pierna' && [0, 1, 2, 3].map((i) => <Box key={i} s={[0.012, 0.03, 0.012]} p={[-0.2 + i * 0.008, 0.25 + (i % 2) * 0.01, 0.03]} c="#7c2d12" />)}
      </Zone>
      {zones && <mesh position={[0, 0.55, 0]}><boxGeometry args={[0.001, 0.001, 0.001]} /></mesh>}
    </group>
  );
}

function Lanyard() {
  const g = useMemo(() => {
    const pts = Array.from({ length: 40 }, (_, i) => { const a = i * 0.5; return new THREE.Vector3(Math.cos(a) * 0.12, 0.02 + i * 0.002, Math.sin(a) * 0.12); });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.012, 6, false);
  }, []);
  return (
    <group>
      <mesh geometry={g}><M color="#1e3a8a" /></mesh>
      <Box s={[0.12, 0.08, 0.06]} p={[0.2, 0.05, 0]} c="#111827" />
      <mesh position={[-0.2, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.04, 0.01, 8, 16]} /><M color="#cbd5e1" metal={0.9} /></mesh>
    </group>
  );
}

function Helmet() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.13, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><M color="#f8fafc" /></mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.12, 0.17, 24]} /><M color="#f8fafc" /></mesh>
    </group>
  );
}

function PermitBoard() {
  return (
    <group>
      {[-0.7, 0.7].map((x) => <Box key={x} s={[0.06, 1.6, 0.06]} p={[x, 0.8, 0]} c={STEEL} />)}
      <Box s={[1.6, 1.0, 0.05]} p={[0, 1.6, 0]} c="#1f2937" />
      <Label text="PERMISOS" size={[1.0, 0.2]} p={[0, 2.0, 0.03]} bg="#e8a33d" />
      {[-0.45, 0, 0.45].map((x) => <Box key={x} s={[0.36, 0.48, 0.01]} p={[x, 1.5, 0.03]} c="#f1f5f9" />)}
    </group>
  );
}

function Barricade({ o }: { o: SceneObjectT }) {
  const w = num(o, 'w', 4), d = num(o, 'd', 4);
  const corners: [number, number][] = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  return (
    <group>
      {corners.map(([x, z], i) => <Cyl key={i} rad={0.05} h={1} p={[x, 0.5, z]} c="#f97316" />)}
      <Box s={[w, 0.06, 0.02]} p={[0, 0.9, -d / 2]} c="#facc15" />
      <Box s={[w, 0.06, 0.02]} p={[0, 0.9, d / 2]} c="#facc15" />
      <Box s={[0.02, 0.06, d]} p={[-w / 2, 0.9, 0]} c="#facc15" />
      <Box s={[0.02, 0.06, d]} p={[w / 2, 0.9, 0]} c="#facc15" />
    </group>
  );
}

function Floor({ o }: { o: SceneObjectT }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[num(o, 'w', 40), num(o, 'd', 30)]} /><M color={CONCRETE} rough={0.95} /></mesh>;
}
function Wall({ o }: { o: SceneObjectT }) {
  return <Box s={[num(o, 'w', 40), num(o, 'h', 10), 0.3]} p={[0, num(o, 'h', 10) / 2, 0]} c="#2c3138" r={0.95} />;
}

export const KINDS: Record<SceneObjectT['kind'], (p: { o: SceneObjectT }) => JSX.Element | null> = {
  floor: Floor, wall: Wall, platform: Platform, ladder: Ladder, guardrail: Guardrail, edge: Edge, opening: Opening, powerline: Powerline,
  spill: Spill, tools: Tools, person: Person, barricade: Barricade, anchor: Anchor, pipe: Pipe, cabletray: CableTray, bench: Bench,
  harness: Harness, lanyard: Lanyard, helmet: Helmet, permitboard: PermitBoard, luminaire: Luminaire, sign: Sign, column: Column,
};
