/** Cookie API backed by browser storage (per-viewer conveniences only, e.g. demo mode). */
const KEY = "praxia-cc-cookies";
function readAll(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function writeAll(v: Record<string, string>) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage blocked: keep in memory */ }
  mem = v;
}
let mem: Record<string, string> = readAll();
export async function cookies() {
  return {
    get: (n: string) => (mem[n] !== undefined ? { name: n, value: mem[n] } : undefined),
    set: (n: string, v: string) => writeAll({ ...mem, [n]: v }),
    delete: (n: string) => { const c = { ...mem }; delete c[n]; writeAll(c); },
  };
}
export async function headers() { return new Map<string, string>(); }
