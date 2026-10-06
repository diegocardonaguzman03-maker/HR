// Ambient micro-activity: haul trucks, a utility cart, a cyclist, a survey
// drone and people crossing the plaza. Subtle and slow — never busy.
// Also: "deliverable" parcels that fly from an agent to its project's signage.
import * as THREE from 'three';
import { Kit } from './kit';
import { PLAZA_R, PLINTHS } from './space';

type Mover = { obj: THREE.Object3D; tick: (t: number) => void };

function obj(build: (k: Kit) => void): THREE.Group {
  const k = new Kit();
  build(k);
  const g = k.build().group;
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  return g;
}

function truck(color: 'red' | 'offwhite'): THREE.Group {
  return obj((k) => {
    k.box('graphite', 2.2, 0.16, 0.7, 0, 0.12, 0);
    k.box(color, 0.6, 0.55, 0.68, 0.8, 0.28, 0);
    k.box('glassTint', 0.04, 0.24, 0.6, 1.1, 0.52, 0);
    k.box('steel', 1.5, 0.5, 0.7, -0.3, 0.28, 0);
    k.box('stoneDark', 1.4, 0.12, 0.62, -0.3, 0.78, 0);
    for (const x of [-0.8, -0.2, 0.8]) for (const z of [-0.34, 0.34]) k.cyl('black', 0.14, 0.08, x, 0.14, z, { rx: Math.PI / 2, seg: 10 });
  });
}

function walker(mat: 'extra' | 'extraDark'): THREE.Group {
  return obj((k) => {
    k.box('extraDark', 0.08, 0.38, 0.09, -0.05, 0, 0);
    k.box('extraDark', 0.08, 0.38, 0.09, 0.05, 0, 0);
    k.box(mat, 0.22, 0.32, 0.13, 0, 0.38, 0);
    k.sphere('skin', 0.072, 0, 0.78, 0);
  });
}

/** Closed polyline path follower with constant speed. */
function loop(points: THREE.Vector3[], speed: number, offset = 0) {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const l = a.distanceTo(b);
    lens.push(l);
    total += l;
  }
  return (t: number, out: THREE.Object3D, yaw = 0) => {
    let s = (t * speed + offset * total) % total;
    for (let i = 0; i < points.length; i++) {
      if (s <= lens[i]) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const f = s / lens[i];
        out.position.lerpVectors(a, b, f);
        out.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) + yaw;
        return;
      }
      s -= lens[i];
    }
  };
}

export class AmbientLife {
  readonly group = new THREE.Group();
  private movers: Mover[] = [];

  constructor() {
    const ind = PLINTHS.find((p) => p.id === 'industrial')!;
    const rz = ind.z0 + 2.2;
    // haul trucks shuttle along the perimeter road
    for (let i = 0; i < 2; i++) {
      const tr = truck(i ? 'offwhite' : 'red');
      const x0 = ind.x0 + 4;
      const x1 = ind.x1 - 4;
      const lane = i ? 0.45 : -0.45;
      const pts = [new THREE.Vector3(x0, 0, rz + lane), new THREE.Vector3(x1, 0, rz + lane)];
      const f = loop([pts[0], pts[1], new THREE.Vector3(x1, 0, rz - lane), new THREE.Vector3(x0, 0, rz - lane)], 2.2, i * 0.5);
      this.add(tr, (t) => f(t, tr, -Math.PI / 2));
    }
    // praxia utility cart on a jungle loop
    const px = PLINTHS.find((p) => p.id === 'praxia')!;
    const cart = obj((k) => {
      k.box('green', 0.9, 0.3, 0.5, 0, 0.12, 0);
      k.box('wood', 0.9, 0.04, 0.55, 0, 0.75, 0);
      for (const [x, z] of [[-0.4, -0.24], [0.4, -0.24], [-0.4, 0.24], [0.4, 0.24]] as const) k.post('graphite', x, z, 0.42, 0.75, 0.02);
      k.box('fabricWarm', 0.4, 0.12, 0.45, -0.1, 0.42, 0);
    });
    const cx = (px.x0 + px.x1) / 2;
    const cz = (px.z0 + px.z1) / 2;
    const cartLoop = loop(
      Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return new THREE.Vector3(cx + Math.cos(a) * 20, 0, cz + Math.sin(a) * 18);
      }),
      1.4,
    );
    this.add(cart, (t) => cartLoop(t, cart, -Math.PI / 2));
    // personal: a cyclist on the garden path
    const per = PLINTHS.find((p) => p.id === 'personal')!;
    const bike = obj((k) => {
      k.cyl('black', 0.16, 0.03, -0.25, 0.16, 0, { rx: Math.PI / 2, seg: 14 });
      k.cyl('black', 0.16, 0.03, 0.25, 0.16, 0, { rx: Math.PI / 2, seg: 14 });
      k.bar('steel', -0.25, 0, 0.25, 0, 0.3, 0.03);
      k.box('cyan', 0.18, 0.3, 0.12, -0.05, 0.38, 0);
      k.sphere('skin', 0.07, 0, 0.78, 0);
    });
    const bz = per.z1 - 3.6;
    const bikeLoop = loop([new THREE.Vector3(per.x0 + 5, 0, bz), new THREE.Vector3(per.x1 - 5, 0, bz)], 1.6);
    this.add(bike, (t) => bikeLoop(t, bike, -Math.PI / 2));
    // frontier survey drone
    const fr = PLINTHS.find((p) => p.id === 'frontier')!;
    const drone = obj((k) => {
      k.box('graphite', 0.4, 0.1, 0.4, 0, 0, 0);
      for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]] as const) k.cyl('steel', 0.14, 0.01, x, 0.08, z, { seg: 12 });
      k.box('glowAmber', 0.06, 0.03, 0.03, 0, -0.03, 0.2);
    });
    const fx = (fr.x0 + fr.x1) / 2;
    const fz = (fr.z0 + fr.z1) / 2;
    this.add(drone, (t) => {
      drone.position.set(fx + Math.cos(t * 0.12) * 16, 4 + Math.sin(t * 0.5) * 0.4, fz + Math.sin(t * 0.12) * 12);
      drone.rotation.y = -t * 0.12;
    });
    // people crossing the Command plaza
    for (let i = 0; i < 5; i++) {
      const w = walker(i % 2 ? 'extra' : 'extraDark');
      const r = PLAZA_R - 1.3 - (i % 2) * 0.6;
      const dir = i % 2 ? 1 : -1;
      const ph = i * 1.3;
      this.add(w, (t) => {
        const a = ph + dir * t * (0.55 / r) * 1.6;
        w.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r);
        w.rotation.y = Math.atan2(-Math.sin(a) * dir, Math.cos(a) * dir);
        w.position.y = 0.06 + Math.abs(Math.sin(t * 7 + i)) * 0.02;
      });
    }
  }

  private add(o: THREE.Object3D, tick: (t: number) => void): void {
    this.group.add(o);
    this.movers.push({ obj: o, tick });
  }

  tick(t: number, reduced: boolean): void {
    if (reduced) return;
    for (const m of this.movers) m.tick(t);
  }
}

/** Glowing document parcels: completed output travels to the project's workspace. */
export class Parcels {
  readonly group = new THREE.Group();
  private items: { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; ring?: THREE.Mesh }[] = [];
  private geo = new THREE.BoxGeometry(0.34, 0.04, 0.44);
  private ringGeo = new THREE.RingGeometry(0.4, 0.48, 32).rotateX(-Math.PI / 2);

  launch(from: THREE.Vector3, to: THREE.Vector3): void {
    const mesh = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false }));
    mesh.position.copy(from);
    this.group.add(mesh);
    this.items.push({ mesh, from: from.clone().setY(from.y + 1.1), to: to.clone(), t: 0 });
  }

  tick(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.t += dt / 1.4;
      if (it.t < 1) {
        const e = it.t < 0.5 ? 2 * it.t * it.t : 1 - Math.pow(-2 * it.t + 2, 2) / 2;
        it.mesh.position.lerpVectors(it.from, it.to, e);
        it.mesh.position.y += Math.sin(Math.PI * e) * (2 + it.from.distanceTo(it.to) * 0.15);
        it.mesh.rotation.y += dt * 3;
      } else if (!it.ring) {
        it.mesh.visible = false;
        it.ring = new THREE.Mesh(this.ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, depthWrite: false, toneMapped: false }));
        it.ring.position.copy(it.to).setY(0.05);
        this.group.add(it.ring);
      } else {
        const p = (it.t - 1) / 0.8;
        it.ring.scale.setScalar(1 + p * 4);
        (it.ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 * (1 - p));
        if (p >= 1) {
          this.group.remove(it.mesh, it.ring);
          (it.mesh.material as THREE.Material).dispose();
          (it.ring.material as THREE.Material).dispose();
          this.items.splice(i, 1);
        }
      }
    }
  }
}

