import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CAMPUS, DESK, RECEPTION, ROOMS, WALKWAY, seats, type Room } from '../data/campus';
import { M, emissive, mat } from './materials';
import { makeScreen } from './screens';
import { useStore } from '../store/useStore';
import { dayPlans, minuteOfDay, personPose, phaseOf, practicanteSpot, summary, type SessionPlan } from '../sim/campus';
import { getSimMinute } from '../sim/engine';

const WALL = mat('#d8ccb4', 0.85);
const TRIM = mat('#d9772b', 0.6, 0.1);
const TILE = mat('#c9c3b8', 0.6);
const LAWN = mat('#5c8a45', 0.95);
const PAVE = mat('#b9b3a8', 0.8);
const ASPHALT = mat('#4b5058', 0.9);

export function Campus() {
  return (
    <group>
      <Walkway />
      <Grounds />
      <Reception />
      <Comedor />
      {ROOMS.map((r) => (
        <ClassRoom key={r.id} r={r} />
      ))}
      <People />
      <CampusSign />
    </group>
  );
}

// ---------------------------------------------------------------- structure
function Walkway() {
  const len = WALKWAY.x1 - WALKWAY.x0;
  const cx = (WALKWAY.x0 + WALKWAY.x1) / 2;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.03, 0]} material={PAVE} receiveShadow>
        <planeGeometry args={[len, WALKWAY.w]} />
      </mesh>
      <mesh position={[cx, 3.2, 0]} material={M.white} castShadow>
        <boxGeometry args={[len, 0.15, WALKWAY.w + 0.8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx, 3.05, s * (WALKWAY.w / 2 + 0.4)]} material={TRIM}>
          <boxGeometry args={[len, 0.22, 0.08]} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, i) => WALKWAY.x0 + 1 + i * ((len - 2) / 4)).map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 1.6, s * (WALKWAY.w / 2 + 0.25)]} material={M.steel}>
            <boxGeometry args={[0.14, 3.2, 0.14]} />
          </mesh>
        )),
      )}
      <Html position={[cx, 3.9, 0]} center zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
        <div className="walk-tag">Pasillo al Campus de Capacitación</div>
      </Html>
    </group>
  );
}

function Tree({ p, s = 1 }: { p: [number, number]; s?: number }) {
  return (
    <group position={[p[0], 0, p[1]]} scale={s}>
      <mesh position-y={0.9} material={mat('#6b4f35', 0.9)}>
        <cylinderGeometry args={[0.12, 0.16, 1.8, 6]} />
      </mesh>
      <mesh position-y={2.4} material={mat('#3f7d3a', 0.9)} castShadow>
        <icosahedronGeometry args={[1.15, 0]} />
      </mesh>
      <mesh position={[0.4, 2.0, 0.3]} material={mat('#4c8f43', 0.9)}>
        <icosahedronGeometry args={[0.8, 0]} />
      </mesh>
    </group>
  );
}

function Grounds() {
  const trees: [number, number][] = [
    [75, -5.5], [80, 5.8], [88, -5.6], [96, 5.6], [101, -5.6], [109, 5.4],
    [58.5, -8.6], [58.5, 8.6], [117, -23.6], [124, 23.4], [74, 23.4], [86, 23.4], [98, 23.4], [110, 23.4], [74, -23.6], [86, -23.6], [98, -23.6], [110, -23.6],
  ];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[(CAMPUS.x0 + CAMPUS.x1) / 2, 0.005, 0]} material={ASPHALT} receiveShadow>
        <planeGeometry args={[CAMPUS.x1 - CAMPUS.x0, CAMPUS.z1 - CAMPUS.z0]} />
      </mesh>
      {/* courtyard lawn with paved paths */}
      <mesh rotation-x={-Math.PI / 2} position={[92.5, 0.02, 0]} material={LAWN} receiveShadow>
        <planeGeometry args={[40.4, 15.6]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[92.5, 0.03, 0]} material={PAVE}>
        <planeGeometry args={[40.4, 2.6]} />
      </mesh>
      {[[83.5, -4.5], [96.5, -4.5], [109.5, -4.5], [74.7, 4.5], [87.7, 4.5], [100.7, 4.5]].map(([x, z]) => (
        <mesh key={`${x}${z}`} rotation-x={-Math.PI / 2} position={[x, 0.03, z]} material={PAVE}>
          <planeGeometry args={[1.8, 6.6]} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[112.4, 0.03, 0]} material={PAVE}>
        <planeGeometry args={[1.8, 44]} />
      </mesh>
      {/* assembly point */}
      <mesh rotation-x={-Math.PI / 2} position={[92.5, 0.04, -3.4]} material={emissive('#16a34a', 0.6)}>
        <planeGeometry args={[2.4, 2.4]} />
      </mesh>
      <Html position={[92.5, 0.3, -3.4]} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
        <div className="assembly">Punto de reunión</div>
      </Html>
      {/* planters */}
      {[[86, -2.2], [99, 2.2]].map(([x, z]) => (
        <mesh key={x} position={[x, 0.3, z]} material={mat('#9a8f80', 0.8)}>
          <boxGeometry args={[2.6, 0.6, 1.2]} />
        </mesh>
      ))}
      {trees.map((p, i) => (
        <Tree key={i} p={p} s={0.8 + (i % 3) * 0.12} />
      ))}
      {/* parking */}
      <group>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} rotation-x={-Math.PI / 2} position={[59 + i * 2.4, 0.02, 17]} material={M.white}>
            <planeGeometry args={[0.08, 4.4]} />
          </mesh>
        ))}
        {[[60.2, '#e5e7eb'], [62.6, '#1f2937'], [67.4, '#b91c1c'], [69.8, '#64748b']].map(([x, c]) => (
          <group key={x as number} position={[x as number, 0, 17.4]}>
            <mesh position-y={0.45} material={mat(c as string, 0.4, 0.4)} castShadow>
              <boxGeometry args={[1.7, 0.6, 3.8]} />
            </mesh>
            <mesh position={[0, 0.95, -0.2]} material={mat('#111827', 0.2, 0.6)}>
              <boxGeometry args={[1.5, 0.5, 2.0]} />
            </mesh>
          </group>
        ))}
        <Html position={[64.5, 0.3, 22.8]} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
          <div className="assembly park">E · Estacionamiento</div>
        </Html>
      </group>
    </group>
  );
}

function Walls({ x0, x1, z0, z1, gaps, h = 1.35, glassH = 0.9 }: { x0: number; x1: number; z0: number; z1: number; gaps: { side: 'n' | 's' | 'e' | 'w'; at: number; w: number }[]; h?: number; glassH?: number }) {
  // Low masonry walls with an orange band and a glass strip above: the class stays visible from above.
  const sides: { side: 'n' | 's' | 'e' | 'w'; a: number; b: number; fixed: number; alongX: boolean }[] = [
    { side: 'n', a: x0, b: x1, fixed: z0, alongX: true },
    { side: 's', a: x0, b: x1, fixed: z1, alongX: true },
    { side: 'w', a: z0, b: z1, fixed: x0, alongX: false },
    { side: 'e', a: z0, b: z1, fixed: x1, alongX: false },
  ];
  const parts: { cx: number; cz: number; len: number; alongX: boolean }[] = [];
  for (const s of sides) {
    const gs = gaps.filter((g) => g.side === s.side).sort((p, q) => p.at - q.at);
    let cur = s.a;
    for (const g of gs) {
      if (g.at - g.w / 2 > cur) parts.push({ cx: s.alongX ? (cur + g.at - g.w / 2) / 2 : s.fixed, cz: s.alongX ? s.fixed : (cur + g.at - g.w / 2) / 2, len: g.at - g.w / 2 - cur, alongX: s.alongX });
      cur = g.at + g.w / 2;
    }
    if (s.b > cur) parts.push({ cx: s.alongX ? (cur + s.b) / 2 : s.fixed, cz: s.alongX ? s.fixed : (cur + s.b) / 2, len: s.b - cur, alongX: s.alongX });
  }
  return (
    <group>
      {parts.map((p, i) => (
        <group key={i} position={[p.cx, 0, p.cz]} rotation-y={p.alongX ? 0 : Math.PI / 2}>
          <mesh position-y={h / 2} material={WALL} castShadow receiveShadow>
            <boxGeometry args={[p.len, h, 0.22]} />
          </mesh>
          <mesh position-y={h - 0.12} material={TRIM}>
            <boxGeometry args={[p.len, 0.16, 0.26]} />
          </mesh>
          <mesh position-y={h + glassH / 2} material={M.glass}>
            <boxGeometry args={[p.len, glassH, 0.05]} />
          </mesh>
          <mesh position-y={h + glassH} material={M.frame}>
            <boxGeometry args={[p.len, 0.06, 0.1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Chair({ p, r = Math.PI }: { p: [number, number]; r?: number }) {
  return (
    <group position={[p[0], 0, p[1]]} rotation-y={r}>
      <mesh position-y={0.45} material={M.chair}>
        <boxGeometry args={[0.46, 0.07, 0.46]} />
      </mesh>
      <mesh position={[0, 0.72, -0.21]} material={M.chair}>
        <boxGeometry args={[0.46, 0.5, 0.05]} />
      </mesh>
      <mesh position={[0.2, 0.7, 0.12]} material={M.deskTop}>
        <boxGeometry args={[0.3, 0.03, 0.34]} />
      </mesh>
    </group>
  );
}

function ClassRoom({ r }: { r: Room }) {
  const open = useStore((s) => s.open);
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  const tex = useMemo(() => makeScreen('classroom', 512, 288, r.id), [r.id]);
  const st = useMemo(() => seats(r), [r]);
  const gaps = r.x0 >= 113 ? [{ side: 'w' as const, at: r.door[1], w: 1.8 }] : [{ side: (r.z0 < 0 ? 's' : 'n') as 's' | 'n', at: r.door[0], w: 1.8 }];
  const sw = Math.min(5.2, r.x1 - r.x0 - 3);
  return (
    <group>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[cx, 0.03, cz]}
        material={TILE}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          open({ kind: 'live', room: r.id });
        }}
      >
        <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
      </mesh>
      <Walls x0={r.x0} x1={r.x1} z0={r.z0} z1={r.z1} gaps={gaps} />
      {/* screen on the low-z wall facing the seats */}
      <group position={[cx, 0, r.z0 + 0.3]}>
        <mesh position={[0, 1.9, -0.05]} material={M.bezel}>
          <boxGeometry args={[sw + 0.15, sw * 0.5625 + 0.15, 0.08]} />
        </mesh>
        <mesh position-y={1.9}>
          <planeGeometry args={[sw, sw * 0.5625]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {/* instructor podium */}
      <mesh position={[cx - 2.2, 0.55, r.z0 + 1.4]} material={M.navy}>
        <boxGeometry args={[0.7, 1.1, 0.5]} />
      </mesh>
      {st.map((p, i) => (
        <Chair key={i} p={p} />
      ))}
      <Equipment r={r} />
      <RoomSign r={r} />
    </group>
  );
}

// ---------------------------------------------------------------- specialized equipment
function Equipment({ r }: { r: Room }) {
  const [sx, sz] = r.station;
  switch (r.id) {
    case 'loto':
      return (
        <group position={[sx, 0, sz]}>
          {/* energy-isolation panel: breakers, valve, lockout station */}
          <mesh position={[0, 1.1, -1.2]} material={mat('#9ca3af', 0.5, 0.6)} castShadow>
            <boxGeometry args={[2.4, 2.2, 0.3]} />
          </mesh>
          {[-0.8, -0.3, 0.2, 0.7].map((x, i) => (
            <mesh key={x} position={[x, 1.5, -1.03]} material={i === 1 ? emissive('#ef4444', 1.4) : mat('#1f2937', 0.5)}>
              <boxGeometry args={[0.28, 0.5, 0.06]} />
            </mesh>
          ))}
          <mesh position={[0, 0.7, -1.02]} material={mat('#facc15', 0.6)}>
            <boxGeometry args={[1.8, 0.4, 0.04]} />
          </mesh>
          <mesh position={[-1.6, 0.9, -0.6]} rotation-z={Math.PI / 2} material={mat('#6b7280', 0.4, 0.7)}>
            <cylinderGeometry args={[0.12, 0.12, 1.4, 12]} />
          </mesh>
          <mesh position={[-1.6, 1.25, -0.6]} rotation-x={Math.PI / 2} material={mat('#dc2626', 0.5)}>
            <torusGeometry args={[0.22, 0.04, 8, 20]} />
          </mesh>
          {/* lockout station with padlocks */}
          <mesh position={[1.7, 1.3, -0.9]} material={mat('#b91c1c', 0.5)}>
            <boxGeometry args={[0.9, 1.0, 0.1]} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[1.45 + (i % 3) * 0.25, 1.45 - Math.floor(i / 3) * 0.3, -0.83]} material={mat('#fbbf24', 0.4, 0.4)}>
              <boxGeometry args={[0.12, 0.16, 0.05]} />
            </mesh>
          ))}
        </group>
      );
    case 'alturas':
      return (
        <group position={[sx, 0, sz - 0.6]}>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} position={[x, 2.6, z]} material={M.yellow} castShadow>
              <boxGeometry args={[0.1, 5.2, 0.1]} />
            </mesh>
          ))}
          {[1.3, 2.6, 3.9, 5.2].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={M.steelLight}>
              <boxGeometry args={[2.1, 0.06, 2.1]} />
            </mesh>
          ))}
          <mesh position={[0, 5.6, 0]} material={M.orange}>
            <boxGeometry args={[2.6, 0.12, 0.12]} />
          </mesh>
          <mesh position={[0, 3, 0]} material={emissive('#facc15', 0.9)}>
            <cylinderGeometry args={[0.015, 0.015, 5.2, 4]} />
          </mesh>
          {/* harness rack */}
          <mesh position={[-2.2, 1.2, 0.6]} material={M.steel}>
            <boxGeometry args={[0.1, 2.4, 1.6]} />
          </mesh>
          {[0.1, 0.6, 1.1].map((z) => (
            <mesh key={z} position={[-2.1, 1.3, z]} material={M.hiVis}>
              <boxGeometry args={[0.12, 0.7, 0.3]} />
            </mesh>
          ))}
        </group>
      );
    case 'confinados':
      return (
        <group position={[sx, 0, sz]}>
          <mesh position={[0, 1.1, -0.6]} rotation-z={Math.PI / 2} material={mat('#64748b', 0.5, 0.6)} castShadow>
            <cylinderGeometry args={[1.0, 1.0, 3.2, 24]} />
          </mesh>
          <mesh position={[0.4, 2.12, -0.6]} material={M.rubber}>
            <cylinderGeometry args={[0.35, 0.35, 0.06, 20]} />
          </mesh>
          {/* tripod and winch */}
          {[0, 2.1, 4.2].map((a) => (
            <mesh key={a} position={[0.4 + Math.sin(a) * 0.6, 2.9, -0.6 + Math.cos(a) * 0.6]} rotation={[Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]} material={M.yellow}>
              <cylinderGeometry args={[0.04, 0.04, 1.8, 6]} />
            </mesh>
          ))}
          <mesh position={[0.4, 2.6, -0.6]} material={emissive('#facc15', 0.8)}>
            <cylinderGeometry args={[0.012, 0.012, 1.1, 4]} />
          </mesh>
          {/* gas detector stand */}
          <mesh position={[-1.9, 0.8, 0.4]} material={M.steel}>
            <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
          </mesh>
          <mesh position={[-1.9, 1.6, 0.4]} material={emissive('#22c55e', 1.6)}>
            <boxGeometry args={[0.22, 0.32, 0.1]} />
          </mesh>
        </group>
      );
    case 'izaje':
      return (
        <group position={[sx, 0, sz]}>
          {/* gantry with hoist and test load */}
          {[-2.4, 2.4].map((x) => (
            <mesh key={x} position={[x, 1.9, 0]} material={M.orange} castShadow>
              <boxGeometry args={[0.2, 3.8, 0.2]} />
            </mesh>
          ))}
          <mesh position={[0, 3.8, 0]} material={M.orange}>
            <boxGeometry args={[5.0, 0.3, 0.3]} />
          </mesh>
          <mesh position={[0.6, 3.45, 0]} material={M.steelLight}>
            <boxGeometry args={[0.5, 0.4, 0.4]} />
          </mesh>
          <mesh position={[0.6, 2.4, 0]} material={M.rubber}>
            <cylinderGeometry args={[0.02, 0.02, 2.0, 4]} />
          </mesh>
          <mesh position={[0.6, 1.0, 0]} material={mat('#475569', 0.5, 0.6)} castShadow>
            <boxGeometry args={[1.0, 0.8, 0.8]} />
          </mesh>
          {[-0.4, 0.4].map((z) => (
            <mesh key={z} position={[0.6, 1.7, z * 0.6]} rotation-x={z} material={mat('#16a34a', 0.6)}>
              <boxGeometry args={[0.05, 0.9, 0.05]} />
            </mesh>
          ))}
        </group>
      );
    case 'electrica':
      return (
        <group position={[sx, 0, sz]}>
          {[-1.6, -0.2, 1.2].map((x, i) => (
            <group key={x} position={[x, 0, 0.6]}>
              <mesh position-y={1.1} material={mat('#9ca3af', 0.45, 0.6)} castShadow>
                <boxGeometry args={[1.2, 2.2, 0.6]} />
              </mesh>
              <mesh position={[0, 1.6, -0.31]} material={emissive(i === 1 ? '#f59e0b' : '#22c55e', 1.3)}>
                <boxGeometry args={[0.3, 0.12, 0.02]} />
              </mesh>
              <mesh position={[0, 1.0, -0.31]} material={mat('#facc15', 0.6)}>
                <boxGeometry args={[0.8, 0.25, 0.02]} />
              </mesh>
            </group>
          ))}
          <mesh rotation-x={-Math.PI / 2} position={[-0.2, 0.04, -0.4]} material={M.rubber}>
            <planeGeometry args={[4.4, 1.0]} />
          </mesh>
        </group>
      );
    case 'transporte':
      return (
        <group position={[sx, 0, sz]}>
          {/* tractor-trailer mock-up, cones and wheel chocks */}
          <mesh position={[-2.2, 1.2, 0]} material={mat('#1d4ed8', 0.4, 0.4)} castShadow>
            <boxGeometry args={[1.8, 1.9, 1.8]} />
          </mesh>
          <mesh position={[-2.2, 1.65, -0.91]} material={mat('#0f172a', 0.2, 0.6)}>
            <boxGeometry args={[1.5, 0.7, 0.02]} />
          </mesh>
          <mesh position={[0.9, 1.35, 0]} material={mat('#e5e7eb', 0.5, 0.3)} castShadow>
            <boxGeometry args={[4.2, 1.8, 1.9]} />
          </mesh>
          {[-2.6, -1.8, 0.2, 2.2].map((x) =>
            [-0.85, 0.85].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.35, z]} rotation-x={Math.PI / 2} material={M.rubber}>
                <cylinderGeometry args={[0.35, 0.35, 0.25, 14]} />
              </mesh>
            )),
          )}
          {[-3.6, 3.6].map((x) => (
            <mesh key={x} position={[x, 0.35, -1.4]} material={M.hiVis}>
              <coneGeometry args={[0.18, 0.7, 10]} />
            </mesh>
          ))}
        </group>
      );
    case 'induccion':
      return (
        <group position={[r.x1 - 0.6, 0, (r.z0 + r.z1) / 2]}>
          {/* PPE display: helmets and vests */}
          <mesh position-y={1.0} material={M.steel}>
            <boxGeometry args={[0.3, 2.0, 3.0]} />
          </mesh>
          {[-1, 0, 1].map((z) => (
            <group key={z}>
              <mesh position={[-0.2, 1.6, z * 0.9]} material={M.helmet}>
                <sphereGeometry args={[0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              <mesh position={[-0.2, 1.0, z * 0.9]} material={M.hiVis}>
                <boxGeometry args={[0.1, 0.6, 0.45]} />
              </mesh>
            </group>
          ))}
        </group>
      );
    default:
      return (
        <group position={[r.x1 - 1.0, 0, r.z1 - 1.6]}>
          {/* lab bench with instruments */}
          <mesh position-y={0.9} material={M.deskTop}>
            <boxGeometry args={[1.2, 0.06, 2.6]} />
          </mesh>
          <mesh position-y={0.45} material={M.steel}>
            <boxGeometry args={[1.0, 0.9, 2.4]} />
          </mesh>
          {[-0.8, 0, 0.8].map((z) => (
            <mesh key={z} position={[0, 1.08, z]} material={mat('#1f2937', 0.4, 0.5)}>
              <boxGeometry args={[0.35, 0.3, 0.3]} />
            </mesh>
          ))}
        </group>
      );
  }
}

function RoomSign({ r }: { r: Room }) {
  const open = useStore((s) => s.open);
  const view = useStore((s) => s.view);
  useStore((s) => Math.floor(s.simMinute / 2)); // refresh every 2 sim minutes
  useStore((s) => s.campusDay);
  useStore((s) => s.sessions);
  const m = minuteOfDay(getSimMinute());
  const plans = dayPlans().filter((p) => p.room.id === r.id);
  const now = plans.find((p) => m >= p.start - 45 && m <= p.end + 10) ?? plans.find((p) => p.start > m);
  const att = useStore.getState().attendance;
  const sm = now ? summary(now, m, att[`${now.session.id}|${useStore.getState().campusDay}`]) : null;
  const live = now && m >= now.start && m <= now.end;
  const pos: [number, number, number] = r.x0 >= 113 ? [r.x0 + 0.4, 3.0, r.z1 - 0.6] : [r.x0 + 0.4, 3.0, r.z0 < 0 ? r.z1 - 0.4 : r.z0 + 0.4];
  return (
    <Html position={pos} zIndexRange={[7, 0]}>
      <button className={`room-sign ${live ? 'is-live' : ''} ${view}`} style={{ borderLeftColor: r.accent }} onClick={() => open({ kind: 'live', room: r.id })}>
        <span className="rs-name">{live && <i className="rs-dot" />}{r.short}</span>
        {now ? (
          <small>
            {now.session.title} · {now.session.start}
            {live && sm ? ` · ${sm.presente + sm.tarde}/${sm.total}` : m < now.start ? ' · próxima' : ''}
          </small>
        ) : (
          <small>Sin clase hoy</small>
        )}
      </button>
    </Html>
  );
}

function Reception() {
  const { x0, x1, z0, z1 } = RECEPTION;
  const tex = useMemo(() => makeScreen('reception', 512, 288, 'reception'), []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[(x0 + x1) / 2, 0.03, 0]} material={TILE} receiveShadow>
        <planeGeometry args={[x1 - x0, z1 - z0]} />
      </mesh>
      <Walls x0={x0} x1={x1} z0={z0} z1={z1} gaps={[{ side: 'w', at: 0, w: 3.2 }, { side: 'e', at: 0, w: 2.4 }, { side: 's', at: 64, w: 1.8 }]} />
      {/* service counter */}
      <mesh position={[DESK.x, 0.55, 0]} material={M.navy} castShadow>
        <boxGeometry args={[0.6, 1.1, DESK.z1 - DESK.z0]} />
      </mesh>
      <mesh position={[DESK.x, 1.12, 0]} material={M.deskTop}>
        <boxGeometry args={[0.8, 0.05, DESK.z1 - DESK.z0 + 0.2]} />
      </mesh>
      {[-2.4, -0.8, 0.8, 2.4].map((z) => (
        <mesh key={z} position={[DESK.x + 0.1, 1.38, z]} rotation-y={-Math.PI / 2} material={M.bezel}>
          <boxGeometry args={[0.5, 0.32, 0.03]} />
        </mesh>
      ))}
      {/* agenda screen and back office */}
      <group position={[66, 0, z0 + 0.3]}>
        <mesh position={[0, 2.0, -0.05]} material={M.bezel}>
          <boxGeometry args={[4.3, 2.45, 0.08]} />
        </mesh>
        <mesh position-y={2.0}>
          <planeGeometry args={[4.2, 2.36]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {[[70.2, -4.2], [70.2, 3.2]].map(([x, z]) => (
        <mesh key={z} position={[x, 0.75, z]} material={M.deskTop}>
          <boxGeometry args={[1.4, 0.05, 1.6]} />
        </mesh>
      ))}
      {[4.6, 5.4].map((z) =>
        [61, 61.7, 62.4].map((x) => <Chair key={`${x}${z}`} p={[x, z]} r={0} />),
      )}
      <Html position={[x0 + 0.4, 3.2, z1 - 0.2]} zIndexRange={[7, 0]}>
        <button className="room-sign reception" style={{ borderLeftColor: '#F58220' }} onClick={() => useStore.getState().open({ kind: 'agenda' })}>
          <span className="rs-name">Atención al usuario</span>
          <small>Recepción de instructores y listas de asistencia</small>
        </button>
      </Html>
    </group>
  );
}

function Comedor() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[65, 0.03, -16.5]} material={TILE}>
        <planeGeometry args={[13, 13]} />
      </mesh>
      <Walls x0={58.5} x1={71.5} z0={-23} z1={-10} gaps={[{ side: 's', at: 69, w: 1.8 }]} />
      {[[62, -19], [66, -19], [62, -14.5], [66, -14.5]].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <mesh position={[x, 0.75, z]} material={M.wood}>
            <boxGeometry args={[2.4, 0.06, 1.0]} />
          </mesh>
          {[-0.8, 0, 0.8].map((d) => (
            <mesh key={d} position={[x + d, 0.45, z - 0.8]} material={M.chair}>
              <boxGeometry args={[0.4, 0.06, 0.4]} />
            </mesh>
          ))}
        </group>
      ))}
      <Html position={[59, 3.0, -10.4]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="room-sign static"><span className="rs-name">Comedor</span></div>
      </Html>
    </group>
  );
}

function CampusSign() {
  const flyTo = useStore((s) => s.flyTo);
  return (
    <Html position={[92, 6, -24]} center zIndexRange={[6, 0]}>
      <button className="director-tag campus" onClick={() => flyTo('campus')}>
        CAMPUS DE CAPACITACIÓN · LÁZARO CÁRDENAS
      </button>
    </Html>
  );
}

// ---------------------------------------------------------------- people
function People() {
  const day = useStore((s) => s.campusDay);
  const sessions = useStore((s) => s.sessions);
  const participants = useStore((s) => s.participants);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plans = useMemo(() => dayPlans(), [day, sessions, participants]);
  return (
    <group>
      {plans.map((p) => (
        <SessionPeople key={`${p.session.id}|${day}`} plan={p} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <Practicante key={k} k={k} plans={plans} />
      ))}
    </group>
  );
}

function SessionPeople({ plan }: { plan: SessionPlan }) {
  const helmet = plan.room.practical;
  return (
    <group>
      {plan.people.map((p, i) => (
        <Person key={i} segs={p.segs} color={['#64748b', '#475569', '#7c8798', '#334155', '#8b95a3'][i % 5]} helmet={helmet} hiVis={plan.session.audience.startsWith('Contrat') || plan.session.audience === 'Transportistas'} />
      ))}
      <Person segs={plan.instructor} color="#0d2a4f" helmet label={`Instructor · ${plan.session.title}`} />
    </group>
  );
}

function Practicante({ k, plans }: { k: number; plans: SessionPlan[] }) {
  const mine = plans.filter((p) => p.practicante === k);
  const desk = practicanteSpot(k);
  return <Person segs={[]} trips={mine.map((p) => p.practicanteSegs)} home={[desk[0], desk[1], -Math.PI / 2]} color="#db2777" label={`Practicante ${k + 1}`} />;
}

const tmpColor = new THREE.Color();

function Person({ segs, trips, home, color, helmet = false, hiVis = false, label }: { segs: ReturnType<typeof dayPlans>[number]['instructor']; trips?: SessionPlan['practicanteSegs'][]; home?: [number, number, number]; color: string; helmet?: boolean; hiVis?: boolean; label?: string }) {
  const g = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const shirt = useMemo(() => (hiVis ? M.hiVis : mat(tmpColor.set(color).getStyle(), 0.7)), [color, hiVis]);
  useFrame(({ clock }) => {
    const m = minuteOfDay(getSimMinute());
    let pose = personPose(segs, m);
    if (trips) {
      for (const t of trips) {
        const p = personPose(t, m);
        if (p.visible) {
          pose = p;
          break;
        }
      }
      if (!pose.visible && home) pose = { visible: true, x: home[0], z: home[1], h: home[2], seated: false, walking: false };
    }
    const grp = g.current;
    if (!grp) return;
    grp.visible = pose.visible;
    if (!pose.visible) return;
    grp.position.set(pose.x, 0, pose.z);
    grp.rotation.y = pose.h;
    const sw = pose.walking ? Math.sin(clock.elapsedTime * 7 + pose.x) * 0.5 : 0;
    if (body.current) body.current.position.y = pose.seated ? -0.42 : pose.walking ? Math.abs(Math.cos(clock.elapsedTime * 7)) * 0.03 : 0;
    if (legL.current && legR.current) {
      legL.current.rotation.x = pose.seated ? -1.45 : sw;
      legR.current.rotation.x = pose.seated ? -1.45 : -sw;
    }
  });
  return (
    <group ref={g} visible={false}>
      <group ref={body} scale={1.18}>
        <group ref={legL} position={[-0.09, 0.84, 0]}>
          <mesh position-y={-0.4} material={M.chair}>
            <capsuleGeometry args={[0.07, 0.62, 3, 6]} />
          </mesh>
        </group>
        <group ref={legR} position={[0.09, 0.84, 0]}>
          <mesh position-y={-0.4} material={M.chair}>
            <capsuleGeometry args={[0.07, 0.62, 3, 6]} />
          </mesh>
        </group>
        <mesh position-y={1.2} material={shirt} castShadow>
          <capsuleGeometry args={[0.18, 0.4, 4, 8]} />
        </mesh>
        <mesh position-y={1.62} material={mat('#c9a184', 0.6)}>
          <sphereGeometry args={[0.12, 12, 10]} />
        </mesh>
        {helmet && (
          <mesh position-y={1.68} material={label?.startsWith('Instructor') ? mat('#1d4ed8', 0.35) : M.helmet}>
            <sphereGeometry args={[0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        )}
      </group>
      {label && (
        <Html position={[0, 2.5, 0]} center zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`person-tag ${label.startsWith('Practicante') ? 'pr' : 'in'}`}>{label.startsWith('Instructor') ? 'Instructor' : label}</div>
        </Html>
      )}
    </group>
  );
}

export { phaseOf };
