// Elevated architectural camera (30–45°): smooth pan, zoom and orbit with
// damping, cinematic fly-to (0.5–1.2 s, ease-in-out), and view offsets so
// focused objects stay centred in the area not covered by side panels.
import * as THREE from 'three';

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const DEFAULT_AZ = Math.PI / 4;
export const DIST_MIN = 9;
export const DIST_MAX = 230;

interface Flight {
  t: number;
  dur: number;
  from: { target: THREE.Vector3; dist: number; az: number; el: number };
  to: { target: THREE.Vector3; dist: number; az: number; el: number };
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  /** Current (rendered) values. */
  target = new THREE.Vector3();
  dist = 150;
  az = DEFAULT_AZ;
  el = 0.66;
  /** Desired values (damped toward). */
  goal = { target: new THREE.Vector3(), dist: 150, az: DEFAULT_AZ, el: 0.66 };
  insets: Insets = { top: 56, right: 0, bottom: 90, left: 64 };
  private offset = new THREE.Vector2();
  private flight: Flight | null = null;
  private w = 1;
  private h = 1;
  /** Follow a moving point (agent focus) until the user takes over. */
  follow: (() => THREE.Vector3 | null) | null = null;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.5, 1400);
  }

  resize(w: number, h: number): void {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }

  /** Jump without animation. */
  set(target: THREE.Vector3, dist: number, az = this.az, el = this.el): void {
    this.flight = null;
    this.target.copy(target);
    this.goal.target.copy(target);
    this.dist = this.goal.dist = dist;
    this.az = this.goal.az = az;
    this.el = this.goal.el = el;
  }

  flyTo(target: THREE.Vector3, dist: number, opts: { az?: number; el?: number; reduced?: boolean } = {}): void {
    const to = {
      target: target.clone(),
      dist: THREE.MathUtils.clamp(dist, DIST_MIN, DIST_MAX),
      az: opts.az ?? this.goal.az,
      el: opts.el ?? this.goal.el,
    };
    if (opts.reduced) {
      this.set(to.target, to.dist, to.az, to.el);
      return;
    }
    const travel = this.target.distanceTo(to.target) / Math.max(30, this.dist) + Math.abs(Math.log(to.dist / this.dist));
    const dur = THREE.MathUtils.clamp(0.5 + travel * 0.35, 0.5, 1.2);
    this.flight = { t: 0, dur, from: { target: this.target.clone(), dist: this.dist, az: this.az, el: this.el }, to };
    this.goal.target.copy(to.target);
    this.goal.dist = to.dist;
    this.goal.az = to.az;
    this.goal.el = to.el;
  }

  cancelFlight(): void {
    if (!this.flight) return;
    this.flight = null;
    this.goal.target.copy(this.target);
    this.goal.dist = this.dist;
    this.goal.az = this.az;
    this.goal.el = this.el;
  }

  get flying(): boolean {
    return !!this.flight;
  }

  /** Pan by a world-space delta on the ground plane. */
  pan(dx: number, dz: number): void {
    this.cancelFlight();
    this.follow = null;
    this.goal.target.x = THREE.MathUtils.clamp(this.goal.target.x + dx, -90, 90);
    this.goal.target.z = THREE.MathUtils.clamp(this.goal.target.z + dz, -90, 90);
  }

  /** Zoom by a factor toward a ground point (keeps the point under the cursor). */
  zoom(factor: number, toward?: THREE.Vector3): void {
    this.cancelFlight();
    const nd = THREE.MathUtils.clamp(this.goal.dist * factor, DIST_MIN, DIST_MAX);
    const k = 1 - nd / this.goal.dist;
    if (toward && !this.follow) {
      this.goal.target.x += (toward.x - this.goal.target.x) * k;
      this.goal.target.z += (toward.z - this.goal.target.z) * k;
    }
    this.goal.dist = nd;
  }

  orbit(dAz: number, dEl: number): void {
    this.cancelFlight();
    this.goal.az = THREE.MathUtils.clamp(this.goal.az + dAz, DEFAULT_AZ - 1.3, DEFAULT_AZ + 1.3);
    this.goal.el = THREE.MathUtils.clamp(this.goal.el + dEl, 0.46, 1.0);
  }

  /** Horizontal unit vectors (camera right, camera forward on the ground). */
  basis(): { right: THREE.Vector3; fwd: THREE.Vector3 } {
    const fwd = new THREE.Vector3(-Math.sin(this.az), 0, -Math.cos(this.az));
    const right = new THREE.Vector3(Math.cos(this.az), 0, -Math.sin(this.az));
    return { right, fwd };
  }

  /** World units per screen pixel at the target distance. */
  get unitsPerPixel(): number {
    return (2 * this.dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / this.h;
  }

  update(dt: number): void {
    if (this.flight) {
      const f = this.flight;
      f.t = Math.min(1, f.t + dt / f.dur);
      const e = ease(f.t);
      this.target.lerpVectors(f.from.target, f.to.target, e);
      // zoom out a touch mid-flight for long hops (cinematic arc)
      const hop = f.from.target.distanceTo(f.to.target);
      const arc = Math.sin(Math.PI * e) * Math.min(0.35, hop / 200);
      this.dist = Math.exp(THREE.MathUtils.lerp(Math.log(f.from.dist), Math.log(f.to.dist), e)) * (1 + arc);
      this.az = THREE.MathUtils.lerp(f.from.az, f.to.az, e);
      this.el = THREE.MathUtils.lerp(f.from.el, f.to.el, e);
      if (f.t >= 1) this.flight = null;
    } else {
      if (this.follow) {
        const p = this.follow();
        if (p) this.goal.target.set(p.x, 0, p.z);
      }
      const k = 1 - Math.exp(-dt * 9);
      this.target.lerp(this.goal.target, k);
      this.dist += (this.goal.dist - this.dist) * k;
      this.az += (this.goal.az - this.az) * k;
      this.el += (this.goal.el - this.el) * k;
    }
    const c = this.camera;
    c.position.set(
      this.target.x + this.dist * Math.cos(this.el) * Math.sin(this.az),
      this.target.y + this.dist * Math.sin(this.el),
      this.target.z + this.dist * Math.cos(this.el) * Math.cos(this.az),
    );
    c.lookAt(this.target);
    c.near = Math.max(0.3, this.dist * 0.02);
    c.far = this.dist * 6 + 400;
    // centre the focus inside the unobstructed area (smoothly)
    const i = this.insets;
    const ox = (i.left - i.right) / 2;
    const oy = (i.top - i.bottom) / 2;
    const k = 1 - Math.exp(-dt * 6);
    this.offset.x += (ox - this.offset.x) * k;
    this.offset.y += (oy - this.offset.y) * k;
    c.setViewOffset(this.w, this.h, -this.offset.x, -this.offset.y, this.w, this.h);
    c.updateProjectionMatrix();
  }
}
