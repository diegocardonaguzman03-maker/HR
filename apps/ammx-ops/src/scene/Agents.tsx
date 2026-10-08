import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AGENTS, STATUS_META } from '../data/agents';
import { BODIES, packetLanded } from '../sim/engine';
import { useStore } from '../store/useStore';
import { emissive, mat } from './materials';
import type { AgentDef } from '../types';
import { projectById } from '../data/projects';

const SCALE = 1.28;

export function Agents() {
  return (
    <group>
      {AGENTS.map((a) => (
        <Avatar key={a.id} a={a} />
      ))}
    </group>
  );
}

function Avatar({ a }: { a: AgentDef }) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.85, toneMapped: false }), []);
  const selMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#F58220', transparent: true, opacity: 0.0, toneMapped: false, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const beam = useRef<THREE.Mesh>(null);
  const shirt = mat(a.shirt, 0.65);
  const pants = mat(a.pants, 0.75);
  const skin = mat(a.skin, 0.55);
  const hair = mat(a.hair, 0.8);
  const shoe = mat('#15171a', 0.6);
  const accent = useMemo(() => emissive(a.virtual ? '#22d3ee' : '#F58220', a.virtual ? 2.2 : 1.2), [a.virtual]);
  const status = useStore((s) => s.agents[a.id].status);
  const selected = useStore((s) => s.selected === a.id);
  const hovered = useStore((s) => s.hovered === a.id);
  const view = useStore((s) => s.view);
  const select = useStore((s) => s.select);
  const hover = useStore((s) => s.hover);
  const h = a.height;

  useFrame(({ clock }) => {
    const b = BODIES[a.id];
    const g = root.current;
    if (!b || !g) return;
    const t = clock.elapsedTime + a.id.length;
    g.position.set(b.x, 0, b.z);
    g.rotation.y = b.heading;
    const sw = b.walking ? Math.sin(b.walkPhase) : 0;
    const bob = b.walking ? Math.abs(Math.cos(b.walkPhase)) * 0.04 : 0;
    if (torso.current) {
      torso.current.position.y = bob;
      torso.current.rotation.x = b.walking ? 0.06 : b.anim === 'inspect' ? 0.22 + Math.sin(t * 0.7) * 0.05 : 0;
      torso.current.rotation.y = !b.walking && b.anim === 'talk' ? Math.sin(t * 0.9) * 0.15 : 0;
    }
    if (legL.current && legR.current) {
      legL.current.rotation.x = sw * 0.55;
      legR.current.rotation.x = -sw * 0.55;
    }
    if (armL.current && armR.current && head.current) {
      let lx = -sw * 0.5, rx = sw * 0.5, rz = 0, lz = 0;
      let hx = 0, hy = 0;
      if (!b.walking) {
        switch (b.anim) {
          case 'type':
            lx = -0.95 + Math.sin(t * 9) * 0.06;
            rx = -0.95 + Math.sin(t * 9 + 1.7) * 0.06;
            hx = 0.15;
            break;
          case 'screen':
            rx = Math.sin(t * 0.5) > 0.4 ? -1.5 : -0.3;
            rz = -0.1;
            hx = -0.08;
            hy = Math.sin(t * 0.4) * 0.2;
            break;
          case 'present':
            rx = -1.35 + Math.sin(t * 1.3) * 0.12;
            rz = -0.35;
            lx = -0.2;
            hy = 0.25;
            break;
          case 'phone':
            rx = -2.2;
            rz = -0.55;
            lx = -0.4 + Math.sin(t * 2) * 0.15;
            hy = Math.sin(t * 0.8) * 0.15;
            break;
          case 'talk':
            rx = -0.5 + Math.sin(t * 2.4) * 0.25;
            lx = -0.4 + Math.sin(t * 1.9 + 1) * 0.2;
            hy = Math.sin(t * 0.9) * 0.3;
            break;
          case 'inspect':
            rx = -0.7;
            lx = -0.7;
            hx = 0.35;
            break;
          default:
            lx = Math.sin(t * 0.8) * 0.04;
            rx = -Math.sin(t * 0.8) * 0.04;
            hy = Math.sin(t * 0.3) * 0.25;
        }
      }
      armL.current.rotation.set(lx, 0, 0.08 + lz);
      armR.current.rotation.set(rx, 0, -0.08 + rz);
      head.current.rotation.set(hx, hy, 0);
    }
    if (ring.current) {
      const s = 1 + Math.sin(t * 3) * 0.06;
      ring.current.scale.set(s, s, s);
    }
    if (beam.current) {
      const target = selected ? 0.16 : hovered ? 0.08 : 0;
      selMat.opacity += (target - selMat.opacity) * 0.15;
      beam.current.visible = selMat.opacity > 0.01;
    }
  });

  ringMat.color.set(STATUS_META[status].color);

  return (
    <group
      ref={root}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover(a.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        hover(null);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        select(a.id);
      }}
    >
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.04} material={ringMat}>
        <ringGeometry args={[0.55, 0.68, 40]} />
      </mesh>
      <mesh ref={beam} position-y={3} material={selMat}>
        <cylinderGeometry args={[0.18, 0.62, 6, 32, 1, true]} />
      </mesh>
      {/* invisible hit box: easier to click a small figure */}
      <mesh position-y={1.2} visible={false}>
        <boxGeometry args={[1.2, 2.6, 1.2]} />
      </mesh>
      <group scale={[SCALE, SCALE * h, SCALE]}>
        <group ref={legL} position={[-0.1, 0.88, 0]}>
          <mesh position-y={-0.42} material={pants} castShadow>
            <capsuleGeometry args={[0.075, 0.68, 4, 8]} />
          </mesh>
          <mesh position={[0, -0.85, 0.05]} material={shoe}>
            <boxGeometry args={[0.12, 0.07, 0.24]} />
          </mesh>
        </group>
        <group ref={legR} position={[0.1, 0.88, 0]}>
          <mesh position-y={-0.42} material={pants} castShadow>
            <capsuleGeometry args={[0.075, 0.68, 4, 8]} />
          </mesh>
          <mesh position={[0, -0.85, 0.05]} material={shoe}>
            <boxGeometry args={[0.12, 0.07, 0.24]} />
          </mesh>
        </group>
        <group ref={torso}>
          <mesh position-y={0.94} scale={[1.05, 1, 0.75]} material={pants}>
            <capsuleGeometry args={[0.16, 0.06, 4, 10]} />
          </mesh>
          <mesh position-y={1.22} scale={[1.08, 1, 0.72]} material={shirt} castShadow>
            <capsuleGeometry args={[0.19, 0.36, 6, 14]} />
          </mesh>
          {/* badge: orange for people-role agents, cyan glow for virtual agents */}
          <mesh position={[0.09, 1.32, 0.135]} material={accent}>
            <boxGeometry args={[0.07, 0.05, 0.01]} />
          </mesh>
          <group ref={armL} position={[-0.25, 1.43, 0]}>
            <mesh position-y={-0.26} material={shirt} castShadow>
              <capsuleGeometry args={[0.058, 0.42, 4, 8]} />
            </mesh>
            <mesh position-y={-0.55} material={skin}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
          </group>
          <group ref={armR} position={[0.25, 1.43, 0]}>
            <mesh position-y={-0.26} material={shirt} castShadow>
              <capsuleGeometry args={[0.058, 0.42, 4, 8]} />
            </mesh>
            <mesh position-y={-0.55} material={skin}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
          </group>
          <mesh position-y={1.52} material={skin}>
            <cylinderGeometry args={[0.05, 0.06, 0.08, 10]} />
          </mesh>
          <group ref={head} position-y={1.66}>
            <mesh material={skin} castShadow scale={[0.92, 1.05, 0.98]}>
              <sphereGeometry args={[0.125, 20, 16]} />
            </mesh>
            {a.hairStyle !== 'none' && (
              <mesh position={[0, 0.03, -0.015]} material={hair} scale={[1, 0.95, 1.05]}>
                <sphereGeometry args={[0.13, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
              </mesh>
            )}
            {a.hairStyle === 'long' && (
              <mesh position={[0, -0.1, -0.07]} material={hair}>
                <boxGeometry args={[0.24, 0.26, 0.1]} />
              </mesh>
            )}
            {a.hairStyle === 'bun' && (
              <mesh position={[0, 0.08, -0.13]} material={hair}>
                <sphereGeometry args={[0.065, 12, 10]} />
              </mesh>
            )}
            {a.virtual && (
              <mesh position={[0, 0.02, 0.02]} material={accent} rotation-x={Math.PI / 2}>
                <torusGeometry args={[0.135, 0.008, 6, 32, Math.PI]} />
              </mesh>
            )}
          </group>
        </group>
      </group>
      <AgentLabel a={a} status={status} hovered={hovered} selected={selected} view={view} />
    </group>
  );
}

function AgentLabel({ a, status, hovered, selected, view }: { a: AgentDef; status: string; hovered: boolean; selected: boolean; view: string }) {
  const rt = useStore((s) => s.agents[a.id]);
  const meta = STATUS_META[status];
  const p = projectById(rt.project);
  return (
    <Html position={[0, 3.0, 0]} center zIndexRange={hovered ? [40, 30] : [20, 10]} style={{ pointerEvents: 'none' }}>
      <div className="agent-tag-wrap">
        {(view === 'operational' || hovered || selected) && (
          <div className={`agent-tag ${a.virtual ? 'virtual' : ''} ${selected ? 'sel' : ''}`}>
            <span className="dot" style={{ background: meta.color }} />
            {a.name}
          </div>
        )}
        {hovered && (
          <div className="hover-card">
            <div className="hc-name">{a.name}</div>
            <div className="hc-role">{a.role}</div>
            <div className="hc-row"><span>Tarea actual</span>{rt.task}</div>
            <div className="hc-row"><span>Proyecto</span>{p ? `${p.id} · ${p.name}` : rt.project}</div>
            <div className="hc-row"><span>Avance</span>
              <div className="hc-bar"><i style={{ width: `${rt.progress}%` }} /></div>{rt.progress}%
            </div>
            <div className="hc-row"><span>Siguiente entrega</span>{rt.next}</div>
            <div className="hc-row"><span>Estado</span><b style={{ color: meta.color }}>{meta.dot} {meta.label}</b></div>
          </div>
        )}
      </div>
    </Html>
  );
}

/** Task / review packets flying between the Director, agents, ATLAS and AEGIS. */
export function Packets() {
  const packets = useStore((s) => s.packets);
  return (
    <group>
      {packets.map((p) => (
        <PacketMesh key={p.id} id={p.id} from={p.from} to={p.to} color={p.color} label={p.label} />
      ))}
    </group>
  );
}

function PacketMesh({ id, from, to, color, label }: { id: number; from: [number, number, number]; to: string; color: string; label: string }) {
  const g = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);
  const done = useRef(false);
  const m = useMemo(() => emissive(color, 3), [color]);
  const trail = useRef<THREE.Mesh[]>([]);
  const DUR = 2.2;
  useFrame(({ clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime;
    const u = Math.min(1, (clock.elapsedTime - t0.current) / DUR);
    const b = BODIES[to];
    const end = new THREE.Vector3(b.x, 2.2, b.z);
    const start = new THREE.Vector3(...from);
    const pos = (k: number) => {
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = start.clone().lerp(end, e);
      v.y += Math.sin(Math.PI * e) * (6 + start.distanceTo(end) * 0.12);
      return v;
    };
    if (g.current) {
      g.current.position.copy(pos(u));
      g.current.rotation.y += 0.1;
    }
    trail.current.forEach((t, i) => {
      if (t) t.position.copy(pos(Math.max(0, u - (i + 1) * 0.03)));
    });
    if (u >= 1 && !done.current) {
      done.current = true;
      packetLanded(to, label);
      useStore.getState().dropPacket(id);
    }
  });
  return (
    <group>
      <group ref={g}>
        <mesh material={m}>
          <boxGeometry args={[0.45, 0.6, 0.06]} />
        </mesh>
        <pointLight color={color} intensity={6} distance={6} />
      </group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} ref={(r) => { if (r) trail.current[i] = r; }} material={m} scale={1 - i * 0.14}>
          <sphereGeometry args={[0.12, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}
