// Tokens de marca PRAXIA — Brand Guidelines v1.0 (skill §14.1, §14.2, §15.2). Solo paleta vigente.
// Los HEX de los decks v2/v3 están reemplazados: no agregar aquí ningún otro color.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ASSETS = join(ROOT, "assets");

export const PX = {
  graphite: "0C0D12",
  graphite2: "15161D", // panel sobre grafito (§15.1 --px-graphite-2)
  ivory: "F5F2EC",
  indigo: "5B4BFF",
  violet: "8B5CF6",
  clay: "E9663C",
  niebla: "A7AAB5", // texto secundario sobre grafito
  muteLight: "6B6E78", // texto secundario sobre ivory (§15.2)
  hair: "2A2B33", // filetes sobre grafito (§15.2)
  hairLight: "D9D4CA", // filetes sobre ivory (derivado de #E2DED6 de §15.3, un punto más oscuro para que se lea)
};

// Fuentes de marca y fallback de Office (§14.2): Arial · Calibri · Consolas.
export const FONTS = {
  brand: { display: "Space Grotesk", body: "Inter", mono: "Space Mono" },
  office: { display: "Arial", body: "Calibri", mono: "Consolas" },
};

export const SLIDE = { w: 13.333, h: 7.5, mx: 0.6 };
SLIDE.cw = SLIDE.w - SLIDE.mx * 2; // ancho útil 12.133 in
SLIDE.right = SLIDE.w - SLIDE.mx;

export const ASSET = {
  symbol: join(ASSETS, "simbolo-axis-provisional.png"), // 1200×800 (3:2)
  lockupIvory: join(ASSETS, "lockup-h-ivory-provisional.png"), // 1980×480
  lockupGraphite: join(ASSETS, "lockup-h-graphite-provisional.png"),
  bg: {
    dark: join(ASSETS, "bg-graphite.png"),
    ivory: join(ASSETS, "bg-ivory.png"),
    tr: join(ASSETS, "bg-graphite-glow-tr.jpg"),
    br: join(ASSETS, "bg-graphite-glow-br.jpg"),
    bl: join(ASSETS, "bg-graphite-glow-bl.jpg"),
    r: join(ASSETS, "bg-graphite-glow-r.jpg"),
  },
};
export const LOCKUP_RATIO = 1980 / 480;
export const SYMBOL_RATIO = 1200 / 800;

export const DESCRIPTOR = "HUMAN & AI TRANSFORMATION ADVISORY";

// Palabras prohibidas por la voz PRAXIA (skill §13). El builder avisa si aparecen.
export const BANNED = [
  "potenciar", "potencia", "potenciamos", "sinergia", "journey", "holístico", "holistico", "holística",
  "world-class", "world class", "siguiente nivel", "empoderar", "empoderamos", "empoderamiento",
  "las personas son lo más importante",
];
