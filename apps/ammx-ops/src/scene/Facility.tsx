import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { FACILITY, MEZZANINE_Y, SPOTS, WAR_TABLE, ZONES, type SpotDef } from '../data/zones';
import { M, concreteTexture, emissive, mat } from './materials';
import { makeScreen } from './screens';
import type { ZoneDef } from '../types';
import { useStore } from '../store/useStore';
import { PROJECTS } from '../data/projects';

const W = FACILITY.maxX - FACILITY.minX;
const D = FACILITY.maxZ - FACILITY.minZ;

export function Facility() {
  const floorTex = useMemo(() => {
    const t = concreteTexture();
    t.repeat.set(W / 6, D / 6);
    return t;
  }, []);
  return (
    <group>
      {/* Polished concrete slab */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[W + 30, D + 30]} />
        <meshStandardMaterial map={floorTex} color="#9aa2ad" roughness={0.42} metalness={0.12} />
      </mesh>
      <CorridorMarkings />
      <Shell />
      {ZONES.filter((z) => z.id !== 'pmo').map((z) => (
        <Zone key={z.id} z={z} />
      ))}
      {SPOTS.filter((s) => s.prop !== 'none').map((s) => (
        <SpotProp key={s.id} s={s} />
      ))}
      <ControlTower />
      <WarRoomFurniture />
    </group>
  );
}

function CorridorMarkings() {
  const yellow = emissive('#f2c230', 0.35);
  return (
    <group position-y={0.012}>
      {[-6.6, 6.6].map((z) => (
        <mesh key={z} rotation-x={-Math.PI / 2} position={[0, 0, z]} material={yellow}>
          <planeGeometry args={[W - 4, 0.12]} />
        </mesh>
      ))}
      {Array.from({ length: 22 }, (_, i) => -42 + i * 4).map((x) =>
        Math.abs(x) < 5 ? null : (
          <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0, 0]} material={M.white}>
            <planeGeometry args={[1.6, 0.1]} />
          </mesh>
        ),
      )}
    </group>
  );
}

/** Building envelope: back wall with clerestory light, steel columns, perimeter trusses, gantry crane. */
function Shell() {
  const crane = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (crane.current) crane.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 30;
  });
  const cols = Array.from({ length: 9 }, (_, i) => FACILITY.minX + (i * W) / 8);
  const H = 12;
  return (
    <group>
      {/* back wall */}
      <mesh position={[0, H / 2, FACILITY.minZ - 0.3]} receiveShadow material={mat('#2a3038', 0.8, 0.2)}>
        <boxGeometry args={[W + 2, H, 0.6]} />
      </mesh>
      {/* corrugated rhythm */}
      {Array.from({ length: 47 }, (_, i) => FACILITY.minX + i * 2).map((x) => (
        <mesh key={x} position={[x, H / 2, FACILITY.minZ + 0.02]} material={mat('#323943', 0.7, 0.3)}>
          <boxGeometry args={[0.18, H, 0.08]} />
        </mesh>
      ))}
      {/* clerestory windows */}
      <mesh position={[0, H - 1.6, FACILITY.minZ + 0.1]} material={emissive('#cfe3ff', 0.55)}>
        <boxGeometry args={[W - 6, 1.4, 0.05]} />
      </mesh>
      {/* side walls (low, so the camera can see in) */}
      {[FACILITY.minX - 0.3, FACILITY.maxX + 0.3].map((x) => (
        <mesh key={x} position={[x, 2.5, 0]} material={mat('#2a3038', 0.8, 0.2)} receiveShadow>
          <boxGeometry args={[0.6, 5, D]} />
        </mesh>
      ))}
      {/* columns */}
      {cols.map((x) => (
        <group key={x}>
          <mesh position={[x, H / 2, FACILITY.minZ + 0.5]} castShadow material={M.steel}>
            <boxGeometry args={[0.5, H, 0.5]} />
          </mesh>
          <mesh position={[x, 0.6, FACILITY.minZ + 0.5]} material={M.yellow}>
            <boxGeometry args={[0.56, 1.2, 0.56]} />
          </mesh>
        </group>
      ))}
      {/* perimeter truss + crane runway */}
      <mesh position={[0, H - 0.3, FACILITY.minZ + 1.6]} material={M.steel} castShadow>
        <boxGeometry args={[W, 0.5, 0.4]} />
      </mesh>
      {Array.from({ length: 30 }, (_, i) => FACILITY.minX + 1.5 + i * 3.1).map((x, i) => (
        <mesh key={x} position={[x, H - 1.1, FACILITY.minZ + 1.6]} rotation-z={i % 2 ? 0.7 : -0.7} material={M.steel}>
          <boxGeometry args={[0.12, 1.9, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, H - 1.9, FACILITY.minZ + 1.6]} material={M.steel}>
        <boxGeometry args={[W, 0.3, 0.35]} />
      </mesh>
      <group ref={crane} position={[0, H - 2.4, FACILITY.minZ + 3.4]}>
        <mesh material={M.orange} castShadow>
          <boxGeometry args={[1.2, 0.8, 4.8]} />
        </mesh>
        <mesh position={[0, -0.7, 1.2]} material={M.steelLight}>
          <boxGeometry args={[0.9, 0.6, 0.9]} />
        </mesh>
        <mesh position={[0, -2.4, 1.2]} material={M.rubber}>
          <cylinderGeometry args={[0.03, 0.03, 3, 6]} />
        </mesh>
      </group>
      {/* brand band */}
      <mesh position={[-30, 8.4, FACILITY.minZ + 0.12]} material={M.orange}>
        <boxGeometry args={[14, 0.18, 0.05]} />
      </mesh>
    </group>
  );
}

function Zone({ z }: { z: ZoneDef }) {
  const [cx, cz] = z.center;
  const [w, d] = z.size;
  const edge = useMemo(() => emissive(z.accent, 1.2), [z.accent]);
  const glass = z.id === 'audit' ? M.glassGreen : M.glass;
  const corridorZ = z.side === 'back' ? cz + d / 2 : cz - d / 2;
  const doorX = z.door[0];
  const wallH = z.id === 'audit' ? 2.6 : 1.25;
  const segs: [number, number][] = [
    [cx - w / 2, doorX - 1.1],
    [doorX + 1.1, cx + w / 2],
  ].filter(([a, b]) => b - a > 0.2) as [number, number][];
  return (
    <group>
      {/* inset floor plate */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, z.id === 'audit' ? 0.05 : 0.02, cz]} receiveShadow material={mat(z.floor, 0.5, 0.15)}>
        <planeGeometry args={[w - 0.3, d - 0.3]} />
      </mesh>
      {/* accent edge along the corridor */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.03, corridorZ + (z.side === 'back' ? -0.25 : 0.25)]} material={edge}>
        <planeGeometry args={[w - 0.4, 0.07]} />
      </mesh>
      {/* glass partition on the corridor side, with a door gap */}
      {segs.map(([a, b]) => (
        <group key={a}>
          <mesh position={[(a + b) / 2, wallH / 2, corridorZ]} material={glass}>
            <boxGeometry args={[b - a, wallH, 0.06]} />
          </mesh>
          <mesh position={[(a + b) / 2, wallH, corridorZ]} material={M.frame}>
            <boxGeometry args={[b - a, 0.06, 0.1]} />
          </mesh>
        </group>
      ))}
      {/* side partitions */}
      {[cx - w / 2, cx + w / 2].map((x) => (
        <group key={x}>
          <mesh position={[x, wallH / 2, cz]} material={glass}>
            <boxGeometry args={[0.06, wallH, d - 0.2]} />
          </mesh>
          <mesh position={[x, wallH, cz]} material={M.frame}>
            <boxGeometry args={[0.1, 0.06, d - 0.2]} />
          </mesh>
        </group>
      ))}
      {z.id === 'audit' && (
        <>
          <mesh position={[cx, wallH / 2, cz + d / 2]} material={glass}>
            <boxGeometry args={[w, wallH, 0.06]} />
          </mesh>
          <mesh position={[cx, wallH + 0.05, cz]} material={M.frame}>
            <boxGeometry args={[w, 0.08, 0.08]} />
          </mesh>
        </>
      )}
      {/* door posts */}
      {[doorX - 1.1, doorX + 1.1].map((x) => (
        <mesh key={x} position={[x, 1.25, corridorZ]} material={M.frame}>
          <boxGeometry args={[0.1, 2.5, 0.1]} />
        </mesh>
      ))}
      <mesh position={[doorX, 2.5, corridorZ]} material={edge}>
        <boxGeometry args={[2.3, 0.1, 0.1]} />
      </mesh>
      <ZoneSign z={z} />
    </group>
  );
}

function ZoneSign({ z }: { z: ZoneDef }) {
  const view = useStore((s) => s.view);
  const flyTo = useStore((s) => s.flyTo);
  const agents = useStore((s) => s.agents);
  const [cx, cz] = z.center;
  const pos: [number, number, number] = z.side === 'back' ? [cx - z.size[0] / 2 + 3.5, 0.2, cz + z.size[1] / 2 - 1] : [cx - z.size[0] / 2 + 3, 0.2, cz + z.size[1] / 2 - 1.2];
  if (z.id === 'dock') return null;
  const projs = PROJECTS.filter((p) => z.agents.includes(p.owner));
  const flagged = projs.filter((p) => p.status === 'blocked' || p.status === 'attention' || p.status === 'risk').length;
  const busy = z.agents.filter((a) => agents[a] && agents[a].status !== 'available').length;
  return (
    <Html position={pos} center={false} zIndexRange={[5, 0]}>
      <button onClick={() => flyTo('zone', z.id)} className={`zone-sign ${view}`} style={{ borderLeftColor: z.accent }}>
        <span>{z.name}</span>
        {view === 'strategic' && z.agents.length > 0 && (
          <small>
            {busy}/{z.agents.length} activos · {projs.length} proyectos{flagged ? ` · ${flagged} con atención` : ''}
          </small>
        )}
      </button>
    </Html>
  );
}

function SpotProp({ s }: { s: SpotDef }) {
  const fx = Math.sin(s.face);
  const fz = Math.cos(s.face);
  const tex = useMemo(() => (s.screen ? makeScreen(s.screen) : null), [s.screen]);
  if (s.prop === 'desk') {
    const p: [number, number, number] = [s.pos[0] + fx * 0.75, 0, s.pos[1] + fz * 0.75];
    return (
      <group position={p} rotation-y={s.face + Math.PI}>
        <mesh position={[0, 1.02, 0]} castShadow receiveShadow material={M.deskTop}>
          <boxGeometry args={[1.6, 0.05, 0.75]} />
        </mesh>
        {[-0.72, 0.72].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]} material={M.steel}>
            <boxGeometry args={[0.06, 1.0, 0.6]} />
          </mesh>
        ))}
        <group position={[0, 1.42, -0.18]} rotation-x={-0.08}>
          <mesh material={M.bezel} castShadow>
            <boxGeometry args={[1.0, 0.6, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[0.95, 0.54]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
        <mesh position={[0, 1.15, -0.2]} material={M.bezel}>
          <boxGeometry args={[0.06, 0.25, 0.06]} />
        </mesh>
        <mesh position={[0.1, 1.06, 0.12]} material={M.bezel}>
          <boxGeometry args={[0.45, 0.02, 0.15]} />
        </mesh>
      </group>
    );
  }
  // Wall screen on legs or wall-mounted near the back wall.
  const w = s.width ?? 5;
  const h = w * 0.5625;
  const p: [number, number, number] = [s.pos[0] + fx * 1.7, 0, s.pos[1] + fz * 1.7];
  const back = s.pos[1] < 0;
  const y0 = back ? 2.4 + h / 2 : 0.7 + h / 2;
  return (
    <group position={p} rotation-y={s.face + Math.PI}>
      <mesh position={[0, y0, -0.08]} material={M.bezel} castShadow>
        <boxGeometry args={[w + 0.2, h + 0.2, 0.12]} />
      </mesh>
      <mesh position={[0, y0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {!back &&
        [-w / 2 + 0.3, w / 2 - 0.3].map((x) => (
          <mesh key={x} position={[x, y0 / 2 - 0.1, -0.1]} material={M.steel}>
            <boxGeometry args={[0.1, y0, 0.1]} />
          </mesh>
        ))}
      {!back && (
        <mesh position={[0, 0.04, -0.1]} material={M.steel}>
          <boxGeometry args={[w, 0.08, 0.6]} />
        </mesh>
      )}
      {s.label && (
        <mesh position={[0, y0 + h / 2 + 0.22, -0.02]} material={M.orange}>
          <boxGeometry args={[Math.min(w, 2), 0.06, 0.02]} />
        </mesh>
      )}
    </group>
  );
}

/** PMO / Strategy Control Tower with the Director Command Center on its mezzanine. */
function ControlTower() {
  const ring = useRef<THREE.Group>(null);
  const portfolio = useMemo(() => makeScreen('portfolio'), []);
  const director = useMemo(() => [makeScreen('projectwall'), makeScreen('kpis'), makeScreen('risk')], []);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.y = clock.elapsedTime * 0.08;
  });
  const glow = useMemo(() => emissive('#3b82f6', 1.6), []);
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow material={M.navy}>
        <cylinderGeometry args={[3.5, 3.7, 0.3, 48]} />
      </mesh>
      <mesh position={[0, 0.31, 0]} rotation-x={-Math.PI / 2} material={glow}>
        <ringGeometry args={[3.35, 3.45, 64]} />
      </mesh>
      {/* console ring */}
      <mesh position={[0, 0.95, 0]} castShadow material={M.darkTop}>
        <torusGeometry args={[2.2, 0.2, 10, 48]} />
      </mesh>
      {/* rotating ring of portfolio screens */}
      <group ref={ring} position={[0, 1.9, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation-y={(i * Math.PI) / 2}>
            <mesh position={[0, 0, 2.95]}>
              <planeGeometry args={[2.3, 1.3]} />
              <meshBasicMaterial map={portfolio} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
      {/* central column */}
      <mesh position={[0, MEZZANINE_Y / 2, 0]} castShadow material={M.steel}>
        <cylinderGeometry args={[0.7, 0.9, MEZZANINE_Y, 20]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 3.2, MEZZANINE_Y / 2, Math.sin((i * Math.PI * 2) / 3) * 3.2]} material={M.steel}>
          <cylinderGeometry args={[0.12, 0.12, MEZZANINE_Y, 10]} />
        </mesh>
      ))}
      {/* mezzanine */}
      <group position={[0, MEZZANINE_Y, 0]}>
        <mesh castShadow receiveShadow material={M.darkTop}>
          <cylinderGeometry args={[3.9, 3.9, 0.25, 48]} />
        </mesh>
        <mesh position={[0, 0.14, 0]} rotation-x={-Math.PI / 2} material={emissive('#F58220', 1.4)}>
          <ringGeometry args={[3.75, 3.85, 64]} />
        </mesh>
        <mesh position={[0, 0.65, 0]} material={M.glass}>
          <cylinderGeometry args={[3.85, 3.85, 1.0, 48, 1, true]} />
        </mesh>
        {/* curved Director wall: three angled panels */}
        {director.map((t, i) => {
          const a = (i - 1) * 0.55;
          return (
            <group key={i} position={[Math.sin(a) * 3.1, 1.75, -Math.cos(a) * 3.1]} rotation-y={-a}>
              <mesh position={[0, 0, -0.06]} material={M.bezel}>
                <boxGeometry args={[2.1, 1.3, 0.08]} />
              </mesh>
              <mesh>
                <planeGeometry args={[2.0, 1.12]} />
                <meshBasicMaterial map={t} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
        {/* Director desk and chair (empty: the user is the Director) */}
        <mesh position={[0, 0.85, -1.3]} material={M.deskTop} castShadow>
          <boxGeometry args={[2.2, 0.06, 0.9]} />
        </mesh>
        <mesh position={[0, 0.45, -1.3]} material={M.steel}>
          <boxGeometry args={[0.1, 0.8, 0.6]} />
        </mesh>
        <group position={[0, 0, -0.3]}>
          <mesh position={[0, 0.55, 0]} material={M.chair}>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
          </mesh>
          <mesh position={[0, 0.95, 0.27]} material={M.chair}>
            <boxGeometry args={[0.6, 0.8, 0.08]} />
          </mesh>
        </group>
      </group>
      {/* stair */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={i} position={[3.95 + i * 0.32, MEZZANINE_Y - 0.2 - i * 0.37, 1.2]} material={M.steelLight}>
          <boxGeometry args={[0.35, 0.06, 1.0]} />
        </mesh>
      ))}
      <DirectorTag />
    </group>
  );
}

function DirectorTag() {
  const flyTo = useStore((s) => s.flyTo);
  return (
    <Html position={[0, MEZZANINE_Y + 4.4, -3.4]} center zIndexRange={[6, 0]}>
      <button className="director-tag" onClick={() => flyTo('director')}>
        DIRECTOR COMMAND CENTER
      </button>
    </Html>
  );
}

function WarRoomFurniture() {
  const { x, z, w, d } = WAR_TABLE;
  return (
    <group>
      <mesh position={[x, 0.76, z]} castShadow receiveShadow material={M.darkTop}>
        <boxGeometry args={[w, 0.06, d]} />
      </mesh>
      <mesh position={[x, 0.78, z]} material={emissive('#eab308', 0.6)}>
        <boxGeometry args={[w - 0.6, 0.01, 0.08]} />
      </mesh>
      {[-w / 2 + 0.4, w / 2 - 0.4].map((dx) => (
        <mesh key={dx} position={[x + dx, 0.38, z]} material={M.steel}>
          <boxGeometry args={[0.1, 0.76, d - 0.6]} />
        </mesh>
      ))}
      {/* sticky-note wall on the side */}
      <group position={[-4.6, 0, 16]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 1.6, 0]} material={M.white}>
          <boxGeometry args={[6, 2.4, 0.05]} />
        </mesh>
        {Array.from({ length: 24 }, (_, i) => (
          <mesh key={i} position={[-2.6 + (i % 8) * 0.74, 0.8 + Math.floor(i / 8) * 0.7, 0.04]} material={mat(['#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0'][i % 4], 0.8)}>
            <boxGeometry args={[0.5, 0.5, 0.01]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
