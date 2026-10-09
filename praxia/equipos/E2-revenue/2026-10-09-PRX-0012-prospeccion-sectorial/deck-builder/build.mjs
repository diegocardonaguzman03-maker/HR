#!/usr/bin/env node
// PRAXIA deck builder · PRX-0012 · DSN-01
// Uso:
//   node build.mjs <slug>                 construye content/<slug>.json → meta.output
//   node build.mjs <slug> --pdf           además exporta PDF con LibreOffice (meta.previewPdf o junto al .pptx)
//   node build.mjs --all [--pdf]          construye todos los content/*.json
//   node build.mjs <slug> --fonts=office  usa Arial/Calibri/Consolas en lugar de las fuentes de marca
//   node build.mjs --file ruta.json --out ruta.pptx   entrada/salida explícitas (pruebas)
//   node build.mjs <slug> --check         solo valida el JSON (no genera nada)
//   node build.mjs --schema               imprime la tabla de campos y límites
import pptxgen from "pptxgenjs";
import { readFileSync, readdirSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { join, resolve, dirname, basename, relative, isAbsolute } from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, FONTS } from "./lib/brand.mjs";
import { validate, describe } from "./lib/schema.mjs";
import { createRenderer } from "./lib/render.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && ["--file", "--out", "--fonts"].includes(args[i - 1])));

// Las salidas relativas se resuelven contra deck-builder/ y deben quedar dentro de la carpeta PRX-0012.
const PROJECT = resolve(ROOT, "..");

if (flag("schema")) {
  console.log(describe());
  process.exit(0);
}

const fontMode = opt("fonts") || "brand";
if (!FONTS[fontMode]) {
  console.error(`--fonts debe ser brand u office`);
  process.exit(1);
}

let jobs = [];
if (flag("all")) {
  jobs = readdirSync(join(ROOT, "content")).filter((f) => f.endsWith(".json")).map((f) => ({ file: join(ROOT, "content", f) }));
} else if (opt("file")) {
  jobs = [{ file: resolve(opt("file")), out: opt("out") && resolve(opt("out")) }];
} else if (positional[0]) {
  jobs = [{ file: join(ROOT, "content", `${positional[0].replace(/\.json$/, "")}.json`), out: opt("out") && resolve(opt("out")) }];
} else {
  console.error("Uso: node build.mjs <slug> [--pdf] [--fonts=office] | --all | --schema   (ver README.md)");
  process.exit(1);
}

let failed = 0;
for (const job of jobs) {
  try {
    await buildOne(job);
  } catch (e) {
    failed++;
    console.error(`✗ ${basename(job.file)}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);

async function buildOne({ file, out }) {
  if (!existsSync(file)) throw new Error(`no existe ${file}`);
  const doc = JSON.parse(readFileSync(file, "utf8"));
  const { errors, warns } = validate(doc);
  warns.forEach((w) => console.warn(`  ! ${w}`));
  if (errors.length) throw new Error(`contenido inválido:\n    - ${errors.join("\n    - ")}`);
  if (flag("check")) return console.log(`✓ ${basename(file)} válido (${doc.slides.length} láminas)`);

  const outPath = out || resolve(ROOT, doc.meta.output);
  if (!out) {
    const rel = relative(PROJECT, outPath);
    if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`meta.output debe quedar dentro de ${PROJECT}`);
  }
  mkdirSync(dirname(outPath), { recursive: true });

  const F = FONTS[fontMode];
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "PRAXIA";
  pres.company = "PRAXIA";
  pres.title = doc.meta.title;
  pres.subject = `Preparado para · ${doc.meta.sector}`;
  pres.theme = { headFontFace: F.display, bodyFontFace: F.body };
  if (doc.meta.lang) pres.lang = doc.meta.lang === "en" ? "en-US" : "es-MX";

  const R = createRenderer(pres, F);
  doc.slides.forEach((sd, i) => {
    const s = pres.addSlide();
    R[sd.type](s, sd, i + 1, doc.meta);
  });
  await pres.writeFile({ fileName: outPath });
  console.log(`✓ ${relative(process.cwd(), outPath)}  (${doc.slides.length} láminas, fuentes ${fontMode})`);

  if (flag("pdf")) {
    const pdfTarget = doc.meta.previewPdf && !out ? resolve(ROOT, doc.meta.previewPdf) : outPath.replace(/\.pptx$/i, ".pdf");
    const outDir = dirname(outPath);
    execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", outDir, outPath], { stdio: "ignore", timeout: 180000 });
    const produced = join(outDir, basename(outPath).replace(/\.pptx$/i, ".pdf"));
    if (produced !== pdfTarget) {
      mkdirSync(dirname(pdfTarget), { recursive: true });
      renameSync(produced, pdfTarget);
    }
    console.log(`✓ ${relative(process.cwd(), pdfTarget)}  (PDF de revisión)`);
  }
}
