// Genera los PNG de assets/ a partir de SVG (solo se corre cuando cambian los assets).
// Requiere la devDependency `sharp` y, para el wordmark, Space Grotesk instalada en el sistema.
// Uso: node scripts/make-assets.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

const C = { graphite: "#0C0D12", ivory: "#F5F2EC", indigo: "#5B4BFF", violet: "#8B5CF6", clay: "#E9663C" };

// Símbolo The Axis: SVG de referencia de la skill §14.3, sin cambios de geometría ni de color.
// PROVISIONAL hasta recibir los PNG oficiales (praxiasymbol.png).
const SYMBOL_DEFS = `
  <linearGradient id="pxA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.indigo}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
  <linearGradient id="pxB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.clay}"/></linearGradient>`;
const SYMBOL_BODY = `
  <circle cx="45" cy="40" r="30" fill="none" stroke="url(#pxA)" stroke-width="7"/>
  <circle cx="75" cy="40" r="30" fill="none" stroke="url(#pxB)" stroke-width="7"/>`;
const symbolSvg = `<svg viewBox="0 0 120 80" width="1200" height="800" xmlns="http://www.w3.org/2000/svg"><defs>${SYMBOL_DEFS}</defs>${SYMBOL_BODY}</svg>`;

// Lockup horizontal PROVISIONAL: símbolo §14.3 + wordmark «Praxia» en Space Grotesk Bold 700, tracking −3% (§14.2).
// Clearspace interno = 1x (ancho del anillo = 7 u).
function lockupSvg(textColor) {
  const fs = 54; // altura de la P ≈ 0.7 × 54 ≈ 38 u (símbolo = 67 u de alto)
  return `<svg viewBox="0 0 330 80" width="1980" height="480" xmlns="http://www.w3.org/2000/svg"><defs>${SYMBOL_DEFS}</defs>
  <g transform="translate(-7.5,0)">${SYMBOL_BODY}</g>
  <text x="112" y="59" font-family="Space Grotesk" font-weight="700" font-size="${fs}" letter-spacing="${(-0.03 * fs).toFixed(2)}" fill="${textColor}">Praxia</text>
</svg>`;
}

// Fondos con retícula fina (lenguaje de instrumento §14.5). 2400×1350 px = 13.333×7.5 in a 180 dpi.
const W = 2400, H = 1350, CELL = 75; // celda = 0.4167 in (32 columnas)
function gridLines(color, opacity) {
  let d = "";
  for (let x = CELL; x < W; x += CELL) d += `M${x} 0V${H}`;
  for (let y = CELL; y < H; y += CELL) d += `M0 ${y}H${W}`;
  return `<path d="${d}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5" fill="none"/>`;
}
// Luz duotono: una sola fuente focal (núcleo índigo que vira a violeta y se apaga en clay).
const GLOWS = {
  tr: { x: 0.86, y: 0.10 },
  br: { x: 0.88, y: 0.92 },
  bl: { x: 0.10, y: 0.95 },
  r:  { x: 0.92, y: 0.50 },
};
function glow(pos) {
  const { x, y } = GLOWS[pos];
  const cx = x * W, cy = y * H;
  // clay desplazado ligeramente hacia el borde: se lee como un solo punto de luz cálido-frío
  const dx = (x > 0.5 ? 1 : -1) * 0.05 * W, dy = (y > 0.5 ? 1 : -1) * 0.07 * H;
  return `
  <radialGradient id="gI" cx="${cx}" cy="${cy}" r="${0.36 * W}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.indigo}" stop-opacity="0.42"/>
    <stop offset="0.35" stop-color="${C.violet}" stop-opacity="0.20"/>
    <stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gC" cx="${cx + dx}" cy="${cy + dy}" r="${0.22 * W}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.clay}" stop-opacity="0.30"/>
    <stop offset="1" stop-color="${C.clay}" stop-opacity="0"/>
  </radialGradient>`;
}
function bgSvg({ base, line, lineOpacity, glowPos }) {
  const defs = glowPos ? glow(glowPos) : "";
  const glowRects = glowPos ? `<rect width="${W}" height="${H}" fill="url(#gI)"/><rect width="${W}" height="${H}" fill="url(#gC)"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>
  <rect width="${W}" height="${H}" fill="${base}"/>${gridLines(line, lineOpacity)}${glowRects}</svg>`;
}

async function png(svg, file) {
  const out = join(OUT, file);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log("ok", file);
}
async function jpg(svg, file) {
  const out = join(OUT, file);
  await sharp(Buffer.from(svg)).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toFile(out);
  console.log("ok", file);
}

await png(symbolSvg, "simbolo-axis-provisional.png");
await png(lockupSvg(C.ivory), "lockup-h-ivory-provisional.png");
await png(lockupSvg(C.graphite), "lockup-h-graphite-provisional.png");
await png(bgSvg({ base: C.graphite, line: "#FFFFFF", lineOpacity: 0.035 }), "bg-graphite.png");
await png(bgSvg({ base: C.ivory, line: C.graphite, lineOpacity: 0.045 }), "bg-ivory.png");
for (const p of Object.keys(GLOWS)) {
  await jpg(bgSvg({ base: C.graphite, line: "#FFFFFF", lineOpacity: 0.035, glowPos: p }), `bg-graphite-glow-${p}.jpg`);
}
writeFileSync(join(OUT, "simbolo-axis-referencia-14.3.svg"), symbolSvg);
