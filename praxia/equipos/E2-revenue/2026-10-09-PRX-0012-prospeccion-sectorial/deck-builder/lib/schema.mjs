// Esquema del contenido (content/<slug>.json). Es la fuente de verdad de CONTENT_SCHEMA.md:
// si cambias un límite aquí, actualiza la tabla del documento (o corre `node build.mjs --schema`).
import { BANNED } from "./brand.mjs";

const T = (max, req = false, extra = {}) => ({ kind: "text", max, req, ...extra });
const A = (min, max, item, req = true) => ({ kind: "array", min, max, item, req });
const O = (fields) => ({ kind: "object", fields });

// Campos comunes a todas las láminas
export const COMMON = {
  type: T(20, true),
  theme: { kind: "enum", values: ["dark", "ivory"] },
  glow: { kind: "enum", values: ["tr", "br", "bl", "r", "none"] },
  section: T(28), // texto del pie «PRAXIA · sección · número»
  label: T(40), // rótulo mono superior, p. ej. «02 — El problema real»
  notes: T(2000), // notas del orador (no se ven en la lámina)
};

// Valores por defecto de cada tipo: fondo y punto de luz (máximo uno por lámina, solo en grafito).
export const DEFAULTS = {
  cover: { theme: "dark", glow: "tr" },
  section: { theme: "dark", glow: "bl" },
  statement: { theme: "dark", glow: "r" },
  content: { theme: "ivory", glow: "none" },
  stats: { theme: "dark", glow: "none" },
  gap: { theme: "dark", glow: "r" },
  comparison: { theme: "ivory", glow: "none" },
  method: { theme: "ivory", glow: "none" },
  offer: { theme: "ivory", glow: "none" },
  services: { theme: "ivory", glow: "none" },
  founder: { theme: "dark", glow: "none" },
  cta: { theme: "dark", glow: "br" },
  closing: { theme: "dark", glow: "tr" },
};

export const TYPES = {
  cover: {
    kicker: T(40),
    title: T(64, true),
    subtitle: T(140),
    preparedFor: T(40), // si falta, usa meta.sector
    date: T(24), // si falta, usa meta.date
  },
  section: {
    number: T(3, true),
    title: T(44, true),
    kicker: T(120),
  },
  statement: {
    statement: T(120, true),
    support: T(170),
  },
  content: {
    title: T(64, true),
    body: T(300),
    points: A(0, 3, O({ title: T(36, true), body: T(130) }), false),
  },
  stats: {
    title: T(90, true),
    stats: A(2, 4, O({ value: T(28, true), label: T(110, true), source: T(90, true) })),
    note: T(140),
  },
  gap: {
    title: T(60, true),
    definition: T(240),
    leftLabel: T(30, true),
    rightLabel: T(30, true),
    gapLabel: T(24, true),
  },
  comparison: {
    title: T(70, true),
    columns: A(3, 3, O({ kicker: T(28, true), verb: T(24, true), body: T(150, true) })),
    highlight: { kind: "int", min: 0, max: 2 },
    footnote: T(140),
  },
  method: {
    title: T(70, true),
    intro: T(110),
    stages: A(4, 4, O({ name: T(10, true), verb: T(16, true), body: T(130, true), gate: T(40) })),
    mantra: T(80),
  },
  offer: {
    title: T(60, true),
    body: T(260),
    facts: A(0, 4, O({ k: T(16, true), v: T(30, true) }), false),
    panelTitle: T(24),
    deliverables: A(1, 5, T(80)),
  },
  services: {
    title: T(60, true),
    items: A(3, 6, O({ name: T(42, true), body: T(110), tag: T(18) })),
  },
  founder: {
    name: T(32, true),
    role: T(40, true),
    bio: T(420, true),
    points: A(0, 4, T(70), false),
  },
  cta: {
    title: T(40, true),
    body: T(200),
    steps: A(0, 3, O({ title: T(30, true), body: T(90) }), false),
    button: T(30, true),
    contact: T(64, true),
  },
  closing: {
    tagline: T(40, true),
    contact: T(64),
  },
};

export const META = {
  slug: T(40, true),
  title: T(80, true),
  sector: T(40, true),
  date: T(24, true),
  lang: { kind: "enum", values: ["es", "en"] },
  output: T(200, true),
  previewPdf: T(200),
  confidential: { kind: "bool" },
};

// Cuenta caracteres visibles: sin los marcadores *…* (índigo) y ~…~ (clay).
export const visibleLength = (s) => String(s).replace(/[*~]/g, "").length;

function checkValue(spec, val, path, errors, warns) {
  if (val === undefined || val === null || val === "") {
    if (spec.req) errors.push(`${path}: campo obligatorio`);
    return;
  }
  switch (spec.kind) {
    case "text": {
      if (typeof val !== "string") return errors.push(`${path}: debe ser texto`);
      const n = visibleLength(val);
      if (n > spec.max) errors.push(`${path}: ${n} caracteres (máximo ${spec.max})`);
      const low = val.toLowerCase();
      for (const w of BANNED) if (low.includes(w)) warns.push(`${path}: palabra prohibida por la voz PRAXIA → «${w}»`);
      if ((val.match(/\*/g) || []).length % 2 || (val.match(/~/g) || []).length % 2)
        warns.push(`${path}: marcador *…* o ~…~ sin cerrar`);
      return;
    }
    case "enum":
      if (!spec.values.includes(val)) errors.push(`${path}: «${val}» no es válido (${spec.values.join(" | ")})`);
      return;
    case "int":
      if (!Number.isInteger(val) || val < spec.min || val > spec.max) errors.push(`${path}: entero entre ${spec.min} y ${spec.max}`);
      return;
    case "bool":
      if (typeof val !== "boolean") errors.push(`${path}: true o false`);
      return;
    case "array":
      if (!Array.isArray(val)) return errors.push(`${path}: debe ser una lista`);
      if (val.length < spec.min || val.length > spec.max) errors.push(`${path}: ${val.length} elementos (entre ${spec.min} y ${spec.max})`);
      val.forEach((v, i) => checkValue(spec.item, v, `${path}[${i}]`, errors, warns));
      return;
    case "object":
      if (typeof val !== "object") return errors.push(`${path}: debe ser un objeto`);
      for (const [k, s] of Object.entries(spec.fields)) checkValue(s, val[k], `${path}.${k}`, errors, warns);
      for (const k of Object.keys(val)) if (!spec.fields[k]) warns.push(`${path}.${k}: campo desconocido (se ignora)`);
      return;
  }
}

export function validate(doc) {
  const errors = [], warns = [];
  if (!doc || typeof doc !== "object") return { errors: ["El archivo no es un objeto JSON"], warns };
  checkValue(O(META), doc.meta, "meta", errors, warns);
  if (!Array.isArray(doc.slides) || !doc.slides.length) errors.push("slides: lista obligatoria con al menos una lámina");
  (doc.slides || []).forEach((s, i) => {
    const p = `slides[${i}]`;
    const fields = TYPES[s?.type];
    if (!fields) return errors.push(`${p}.type: «${s?.type}» no existe (${Object.keys(TYPES).join(", ")})`);
    checkValue(O({ ...COMMON, ...fields }), s, `${p}<${s.type}>`, errors, warns);
    const theme = s.theme || DEFAULTS[s.type].theme;
    if (theme === "ivory" && s.glow && s.glow !== "none") warns.push(`${p}: la luz duotono solo se aplica sobre grafito; se ignora en ivory`);
  });
  return { errors, warns };
}

// Tabla de límites legible (para `node build.mjs --schema`)
export function describe() {
  const lines = [];
  const walk = (spec, name, indent) => {
    const pad = "  ".repeat(indent);
    if (spec.kind === "text") lines.push(`${pad}${name}${spec.req ? " *" : ""}  ≤ ${spec.max} car.`);
    else if (spec.kind === "array") {
      lines.push(`${pad}${name}${spec.req ? " *" : ""}  lista ${spec.min}–${spec.max}`);
      walk(spec.item, "[elemento]", indent + 1);
    } else if (spec.kind === "object") for (const [k, s] of Object.entries(spec.fields)) walk(s, k, indent);
    else if (spec.kind === "enum") lines.push(`${pad}${name}  ${spec.values.join(" | ")}`);
    else lines.push(`${pad}${name}  ${spec.kind}`);
  };
  lines.push("meta:"); walk(O(META), "", 1);
  lines.push("comunes a toda lámina:"); walk(O(COMMON), "", 1);
  for (const [t, f] of Object.entries(TYPES)) {
    lines.push(`${t}  (fondo ${DEFAULTS[t].theme}, luz ${DEFAULTS[t].glow}):`);
    walk(O(f), "", 1);
  }
  return lines.join("\n");
}
