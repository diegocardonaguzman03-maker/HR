// Captura imágenes (public/images/*.png) y el video placeholder (public/videos/melt-overview.webm + .vtt)
// desde la propia escena 3D (modo ?capture=1). Requiere `vite build` previo.
// Video: cuadros JPEG deterministas → ffmpeg (el que trae Playwright) → WebM VP8.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { serve } from '../tests/e2e/serve.mjs';

const PW = process.env.PLAYWRIGHT_MODULE ?? '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG = process.env.FFMPEG ?? '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux';
const { chromium } = await import(PW);
const FPS = 6, DUR = 40;
const onlyImages = process.argv.includes('--images');

const srv = await serve('dist');
const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
await page.addInitScript(() => { window.__adxInstant = true; localStorage.setItem('adx.quality', 'medium'); localStorage.setItem('adx.analytics', 'off'); });
await page.goto(srv.url + '/?capture=1');
await page.waitForSelector('[data-testid=loading]', { state: 'detached', timeout: 120000 });
const frame = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const st = (patch) => page.evaluate((p) => window.__adxStore.getState().set(p), patch);
const cam = (position, target) => page.evaluate(([p, t]) => window.__adxStore.getState().flyTo({ position: p, target: t }), [position, target]);
await st({ hotspotsVisible: false });

// ---- imágenes para los documentos ----
fs.mkdirSync('public/images', { recursive: true });
const shots = [
  ['overview', [25, 15, 27], [-3, 2.5, 0], {}],
  ['electrodes', [7, 9.5, 9], [-1.5, 6.5, 0], { selectedEq: 'eq.electrodes' }],
  ['secondary', [-3, 9, 12], [-7.5, 5.5, 0], { selectedEq: 'eq.secondary-circuit' }],
  ['section', [4, 8.5, 12.5], [0, 1.2, 0], { section: true, selectedEq: null }],
];
await page.setViewportSize({ width: 1280, height: 720 });
const badge = (show) => page.evaluate((v) => { const b = document.querySelector('[data-capture-badge]'); if (b) b.style.display = v ? '' : 'none'; }, show);
await badge(false); // las imágenes de los PDF llevan su propio estado en el documento
for (const [name, p, t, patch] of shots) {
  await st({ section: false, xray: false, ...patch });
  await cam(p, t);
  for (let i = 0; i < 4; i++) await frame();
  await page.screenshot({ path: `public/images/${name}.png` });
  console.log('imagen', name);
}
await st({ section: false, selectedEq: null });
if (onlyImages) { await browser.close(); srv.close(); process.exit(0); }

// ---- video ----
await badge(true);
await page.setViewportSize({ width: 768, height: 432 });
fs.mkdirSync('public/videos', { recursive: true });
const out = 'public/videos/melt-overview.webm';
const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', 'pipe:0', '-c:v', 'vp8', '-b:v', '900k', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const lerp = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
const ease = (k) => k * k * (3 - 2 * k);
// capítulos (deben coincidir con videos.json)
const seg = [
  { t0: 0, t1: 10, from: [[25, 15, 27], [-3, 2.5, 0]], to: [[-6, 16, 30], [-3, 3, 0]], state: { arcDemo: false, section: false, selectedEq: null } },
  { t0: 10, t1: 20, from: [[9, 10, 10], [-1, 6, 0]], to: [[5, 4.5, 8], [0, 2.5, 0]], state: { arcDemo: true, selectedEq: 'eq.electrodes' } },
  { t0: 20, t1: 30, from: [[4, 12, 14], [-1.5, 6.5, 2.5]], to: [[-8, 13, 16], [-1.5, 6, 3]], state: { arcDemo: true, selectedEq: 'eq.dri-feed' } },
  { t0: 30, t1: 40, from: [[4, 8.5, 12.5], [0, 1.2, 0]], to: [[10, 6.5, 8], [0, 1.2, 0]], state: { arcDemo: true, section: true, selectedEq: null } },
];
let cur = -1;
for (let f = 0; f < FPS * DUR; f++) {
  const t = f / FPS;
  const si = seg.findIndex((s) => t >= s.t0 && t < s.t1);
  const s = seg[si];
  if (si !== cur) { await st(s.state); cur = si; }
  const k = ease((t - s.t0) / (s.t1 - s.t0));
  await cam(lerp(s.from[0], s.to[0], k), lerp(s.from[1], s.to[1], k));
  await frame();
  const jpg = await page.screenshot({ type: 'jpeg', quality: 82 });
  if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 40 === 0) console.log(`cuadro ${f}/${FPS * DUR}`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
fs.writeFileSync('public/videos/melt-overview.vtt', `WEBVTT

00:00.000 --> 00:05.000
[DEMO] Video placeholder generado del modelo 3D esquemático. No muestra la operación real.

00:05.000 --> 00:10.000
El horno de arco eléctrico: coraza, bóveda, electrodos y equipos alrededor.

00:10.000 --> 00:15.000
Tres electrodos de grafito conducen la corriente y forman el arco eléctrico.

00:15.000 --> 00:20.000
El sistema de regulación sube y baja los electrodos. La animación es ilustrativa, sin valores reales.

00:20.000 --> 00:25.000
En GASM, el DRI de HYL y Midrex llega por bandas y entra por el 5.º agujero de la bóveda.

00:25.000 --> 00:30.000
La tasa de alimentación la define el procedimiento aprobado de la planta (SME_REQUIRED).

00:30.000 --> 00:35.000
Vista en corte: el baño de acero líquido y el refractario.

00:35.000 --> 00:40.000
La escoria espumosa cubre el arco y protege el horno. Este video no sustituye la capacitación en piso.
`);
console.log(out, (fs.statSync(out).size / 1024).toFixed(0), 'KB');
await browser.close();
srv.close();
