// An agent as a miniature figure: uniform in the agent's colour, a small
// identifying accessory, a status ring at the feet, and a subtle marker when
// Francisco needs to intervene. Walks along routed paths; sits at desks.
import * as THREE from 'three';
import type { Agent, AgentLook, AgentState, ID } from '@/types/domain';
import { MAT, STATE_HEX, blobTexture } from './materials';

const LEG = new THREE.BoxGeometry(0.085, 0.4, 0.1).translate(0, -0.2, 0);
const TORSO = new THREE.CapsuleGeometry(0.12, 0.22, 3, 10).scale(1, 1, 0.72);
const HEAD = new THREE.SphereGeometry(0.085, 16, 12);
const ARM = new THREE.CapsuleGeometry(0.035, 0.24, 2, 6).translate(0, -0.13, 0);
const RING = new THREE.RingGeometry(0.2, 0.26, 32).rotateX(-Math.PI / 2);
const HIT = new THREE.CylinderGeometry(0.42, 0.42, 1.3, 8).translate(0, 0.65, 0);
const PIN = new THREE.SphereGeometry(0.22, 12, 8);

const MARKER_SHAPE = new THREE.Vector3(1, 1.5, 1);
const muted = (hex: number) => new THREE.Color(hex).lerp(new THREE.Color(0x9a9a96), 0.22);

export class Agent3D {
  readonly group = new THREE.Group();
  readonly hit: THREE.Mesh;
  /** Live world position (path following). */
  readonly pos = new THREE.Vector3();
  private body = new THREE.Group();
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private armL: THREE.Mesh;
  private armR: THREE.Mesh;
  private ring: THREE.Mesh;
  private shadow: THREE.Mesh;
  private marker: THREE.Mesh;
  private pin: THREE.Mesh;
  private path: THREE.Vector3[] = [];
  private faceAt: number | null = null;
  private seated = false;
  private wantSeated = false;
  private heading = 0;
  private walkPhase = Math.random() * 10;
  private sit = 0;
  state: AgentState = 'idle';
  /** Where this unit is currently "inside" (building id) — for routing. */
  at: ID | null = null;
  destKey = '';
  selected = false;
  hovered = false;
  placed = false;

  constructor(public agent: Agent) {
    const uniform = new THREE.MeshStandardMaterial({ color: muted(agent.color), roughness: 0.7 });
    const trousers = new THREE.MeshStandardMaterial({ color: 0x3d4046, roughness: 0.85 });
    this.legL = new THREE.Mesh(LEG, trousers);
    this.legR = new THREE.Mesh(LEG, trousers);
    this.legL.position.set(-0.055, 0.42, 0);
    this.legR.position.set(0.055, 0.42, 0);
    const torso = new THREE.Mesh(TORSO, uniform);
    torso.position.y = 0.6;
    const head = new THREE.Mesh(HEAD, MAT.skin);
    head.position.y = 0.86;
    this.armL = new THREE.Mesh(ARM, uniform);
    this.armR = new THREE.Mesh(ARM, uniform);
    this.armL.position.set(-0.15, 0.74, 0);
    this.armR.position.set(0.15, 0.74, 0);
    this.body.add(this.legL, this.legR, torso, head, this.armL, this.armR);
    this.addLook(agent.look, agent.color);
    for (const o of this.body.children) {
      o.castShadow = true;
    }
    this.group.add(this.body);

    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, toneMapped: false }));
    this.shadow.position.y = 0.015;
    this.group.add(this.shadow);
    this.ring = new THREE.Mesh(RING, new THREE.MeshBasicMaterial({ color: STATE_HEX.idle, transparent: true, opacity: 0.85, depthWrite: false }));
    this.ring.position.y = 0.02;
    this.group.add(this.ring);

    this.marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), MAT.glowAmber);
    this.marker.scale.y = 1.5;
    this.marker.position.y = 1.25;
    this.marker.visible = false;
    this.group.add(this.marker);

    // far-zoom pin: a soft coloured bead that keeps agents findable
    this.pin = new THREE.Mesh(PIN, new THREE.MeshBasicMaterial({ color: muted(agent.color), toneMapped: false }));
    this.pin.position.y = 2.2;
    this.pin.visible = false;
    this.group.add(this.pin);

    this.hit = new THREE.Mesh(HIT, new THREE.MeshBasicMaterial());
    this.hit.visible = false;
    this.hit.userData.pick = { kind: 'agent', id: agent.id };
    this.apply(agent);
  }

  private addLook(look: AgentLook, color: number): void {
    const accent = new THREE.MeshStandardMaterial({ color: muted(color).offsetHSL(0, -0.05, -0.12), roughness: 0.6 });
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.x = rx;
      this.body.add(m);
      return m;
    };
    switch (look) {
      case 'halo':
        add(new THREE.TorusGeometry(0.1, 0.012, 6, 24), MAT.amber, 0, 1.02, 0, Math.PI / 2);
        break;
      case 'cape':
        add(new THREE.BoxGeometry(0.24, 0.42, 0.02), accent, 0, 0.5, -0.1, 0.08);
        break;
      case 'hardhat':
        add(new THREE.SphereGeometry(0.1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), MAT.amber, 0, 0.88, 0);
        add(new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16), MAT.amber, 0, 0.88, 0.01);
        break;
      case 'visor':
        add(new THREE.BoxGeometry(0.16, 0.035, 0.05), MAT.cyan, 0, 0.88, 0.07);
        break;
      case 'tie':
        add(new THREE.BoxGeometry(0.04, 0.18, 0.02), MAT.red, 0, 0.6, 0.09);
        break;
      case 'cube':
        add(new THREE.BoxGeometry(0.09, 0.09, 0.09), accent, 0.2, 1.0, 0).rotation.set(0.6, 0.6, 0);
        break;
      case 'leaf':
        add(new THREE.ConeGeometry(0.05, 0.12, 6), MAT.grassDeep, 0.04, 0.99, 0).rotation.z = -0.4;
        break;
      case 'coin':
        add(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), MAT.amber, 0.2, 1.0, 0, Math.PI / 2);
        break;
    }
  }

  apply(a: Agent): void {
    this.agent = a;
    this.state = a.state;
    (this.ring.material as THREE.MeshBasicMaterial).color.setHex(STATE_HEX[a.state]);
    this.marker.visible = a.state === 'waiting' || a.state === 'blocked';
    this.marker.material = a.state === 'blocked' ? MAT.glowRed : MAT.glowAmber;
  }

  /** Place instantly (first sync). */
  place(p: THREE.Vector3, ry: number, seated: boolean): void {
    this.pos.copy(p);
    this.path = [];
    this.heading = ry;
    this.faceAt = ry;
    this.wantSeated = seated;
    this.seated = seated;
    this.sit = seated ? 1 : 0;
    this.placed = true;
    this.sync();
  }

  /** Walk a route; face `ry` and sit (or stand) on arrival. */
  walk(points: THREE.Vector3[], ry: number, seated: boolean): void {
    this.path = points.map((p) => p.clone());
    this.faceAt = ry;
    this.wantSeated = seated;
    this.seated = false;
  }

  hold(): void {
    this.path = [];
    this.wantSeated = this.seated;
  }

  get moving(): boolean {
    return this.path.length > 0;
  }

  tick(t: number, dt: number, reduced: boolean, far: boolean, camDist: number): void {
    const speed = this.agent.state === 'paused' ? 0 : 5.2;
    let walking = false;
    if (this.path.length && speed > 0) {
      // stand up before walking
      if (this.sit > 0.01) this.sit = Math.max(0, this.sit - dt * 4);
      else {
        let step = speed * dt;
        while (step > 0 && this.path.length) {
          const next = this.path[0];
          const dx = next.x - this.pos.x;
          const dz = next.z - this.pos.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.001) this.heading = turn(this.heading, Math.atan2(dx, dz), Math.min(1, dt * 10));
          if (dist <= step) {
            this.pos.set(next.x, next.y, next.z);
            this.path.shift();
            step -= dist;
          } else {
            this.pos.x += (dx / dist) * step;
            this.pos.z += (dz / dist) * step;
            this.pos.y += (next.y - this.pos.y) * Math.min(1, step / Math.max(dist, 0.001));
            step = 0;
          }
        }
        walking = true;
      }
    } else {
      if (this.faceAt !== null) this.heading = turn(this.heading, this.faceAt, Math.min(1, dt * 6));
      this.seated = this.wantSeated;
      const target = this.seated ? 1 : 0;
      this.sit += (target - this.sit) * Math.min(1, dt * 5);
    }

    // pose
    const busy = ['working', 'researching', 'reviewing', 'collaborating'].includes(this.state);
    if (walking && !reduced) {
      this.walkPhase += dt * 11;
      const s = Math.sin(this.walkPhase) * 0.55;
      this.legL.rotation.x = s;
      this.legR.rotation.x = -s;
      this.armL.rotation.x = -s * 0.7;
      this.armR.rotation.x = s * 0.7;
      this.body.position.y = Math.abs(Math.cos(this.walkPhase)) * 0.025;
    } else {
      const sitA = this.sit * 1.45;
      this.legL.rotation.x = -sitA;
      this.legR.rotation.x = -sitA;
      const typing = busy && this.sit > 0.5 && !reduced ? Math.sin(t * 9 + this.walkPhase) * 0.06 : 0;
      this.armL.rotation.x = -this.sit * 0.9 + typing;
      this.armR.rotation.x = -this.sit * 0.9 - typing;
      const breathe = reduced ? 0 : Math.sin(t * 1.8 + this.walkPhase) * 0.006;
      this.body.position.y = -this.sit * 0.2 + breathe;
    }
    this.body.rotation.y = this.heading;
    if (this.marker.visible) {
      this.marker.position.y = 1.25 + (reduced ? 0 : Math.sin(t * 2.4) * 0.05);
      this.marker.rotation.y = t;
    }
    // far zoom: show a bead instead of a tiny figure
    this.pin.visible = far;
    if (far) this.pin.scale.setScalar(Math.min(4, camDist / 70));
    this.body.visible = !far;
    const rm = this.ring.material as THREE.MeshBasicMaterial;
    const rs = this.selected ? 1.5 : this.hovered ? 1.25 : 1;
    this.ring.scale.setScalar(rs);
    rm.opacity = this.selected ? 1 : 0.8;
    this.marker.scale.setScalar(far ? Math.min(5, camDist / 40) : 1).multiply(MARKER_SHAPE);
    this.sync();
  }

  private sync(): void {
    this.group.position.copy(this.pos);
    this.hit.position.copy(this.pos);
  }

  dispose(): void {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.material !== MAT.skin && !Object.values(MAT).includes(m.material as never)) (m.material as THREE.Material).dispose();
    });
  }
}

function turn(a: number, b: number, k: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}
