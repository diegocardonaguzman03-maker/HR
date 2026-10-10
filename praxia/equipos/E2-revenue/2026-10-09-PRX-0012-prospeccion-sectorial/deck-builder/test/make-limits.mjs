// Genera test/limites.json: cada campo de cada tipo al MÁXIMO de caracteres y de elementos,
// en fondo grafito y en ivory. Sirve para comprobar visualmente que ningún límite desborda.
// Uso: node test/make-limits.mjs && node build.mjs --file test/limites.json --out <scratch>/limites.pptx --pdf
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TYPES, DEFAULTS } from "../lib/schema.mjs";

const SRC = "La adopción ocurre cuando cambian decisiones comportamientos procesos métricas y consecuencias en la organización real que opera cada día con evidencia medible y sostenida ";
const fill = (n) => {
  let t = "";
  while (t.length < n) t += SRC;
  t = t.slice(0, n);
  return t.slice(0, -1).trimEnd().padEnd(n - 1, "x") + "Z"; // longitud exacta n
};

function sample(spec, key) {
  if (spec.kind === "text") {
    if (key === "value") return null; // se resuelve aparte
    if (key === "number") return "09";
    return fill(spec.max);
  }
  if (spec.kind === "array") return Array.from({ length: spec.max }, () => sample(spec.item));
  if (spec.kind === "object") return Object.fromEntries(Object.entries(spec.fields).map(([k, s]) => [k, sample(s, k)]));
  if (spec.kind === "int") return spec.max;
  return undefined;
}

const slides = [];
for (const [type, fields] of Object.entries(TYPES)) {
  for (const theme of ["dark", "ivory"]) {
    const sl = { type, theme, label: fill(40), section: fill(28) };
    for (const [k, s] of Object.entries(fields)) {
      const v = sample(s, k);
      if (v !== undefined) sl[k] = v;
    }
    if (type === "stats") sl.stats.forEach((st, i) => (st.value = i % 2 ? "[CIFRA PENDIENTE RES-01 XXX]" : "USD 9M"));
    if (type === "cta") sl.contact = "[CANAL DE CONTACTO — COMPLETAR] " + fill(23);
    slides.push(sl);
  }
}
// 2 cifras grandes (caso mínimo)
slides.push({ type: "stats", label: "Dos cifras", title: fill(90), stats: [
  { value: "~5%", label: fill(90), source: fill(90) }, { value: "1.6×", label: fill(90), source: fill(90) } ] });

const doc = {
  meta: { slug: "limites", title: "Prueba de límites", sector: fill(40), date: fill(24), lang: "es", output: "../00-maestro/_limites.pptx" },
  slides,
};
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "limites.json"), JSON.stringify(doc, null, 2));
console.log(`test/limites.json: ${slides.length} láminas (${Object.keys(DEFAULTS).length} tipos × 2 fondos + 1)`);
