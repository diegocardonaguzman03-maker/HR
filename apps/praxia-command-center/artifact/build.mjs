/**
 * Builds the PRAXIA Command Center as a single-file Artifact page (dist/command-center.html).
 * Reuses src/ (services, domain, pages, components) unchanged; Next.js/server modules are swapped for shims.
 */
import esbuild from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, "..");
const repo = path.resolve(app, "../..");
const S = (f) => path.join(here, "src/shims", f);

const ALIAS = {
  "next/link": S("next-link.tsx"),
  "next/navigation": S("next-navigation.ts"),
  "next/dynamic": S("next-dynamic.tsx"),
  "next/cache": S("next-cache.ts"),
  "next/headers": S("next-headers.ts"),
  "server-only": S("empty.ts"),
  "node:fs": S("node-fs.ts"), fs: S("node-fs.ts"),
  "node:path": S("node-path.ts"), path: S("node-path.ts"),
  crypto: S("empty.ts"),
  "@/server/session": S("server-session.ts"),
  "@/server/context": S("server-context.ts"),
  "@/server/db/client": S("server-db-client.ts"),
  "@/app/actions/session": S("actions-session.ts"),
};

const aliasPlugin = {
  name: "praxia-alias",
  setup(b) {
    b.onResolve({ filter: /.*/ }, (args) => {
      if (ALIAS[args.path]) return { path: ALIAS[args.path] };
      if (args.path === "./run" && args.importer.includes(path.join("src", "app", "actions"))) return { path: S("actions-run.ts") };
      if (args.path === "./session" && args.importer.includes(path.join("src", "app", "actions"))) return { path: S("actions-session.ts") };
      return undefined;
    });
  },
};

// Data injected at build time
const migrations = fs.readdirSync(path.join(app, "drizzle")).filter((f) => f.endsWith(".sql")).sort().map((f) => fs.readFileSync(path.join(app, "drizzle", f), "utf8"));
const wasm = fs.readFileSync(path.join(app, "node_modules/sql.js/dist/sql-wasm.wasm")).toString("base64");
const agentDir = path.join(repo, ".claude/agents");
const agentFiles = Object.fromEntries(fs.readdirSync(agentDir).filter((f) => /^praxia-[a-z0-9-]+\.md$/.test(f)).map((f) => [`.claude/agents/${f}`, fs.readFileSync(path.join(agentDir, f), "utf8")]));

const js = await esbuild.build({
  entryPoints: [path.join(here, "src/main.tsx")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  write: false,
  jsx: "automatic",
  legalComments: "none",
  tsconfig: path.join(app, "tsconfig.json"),
  plugins: [aliasPlugin],
  inject: [S("process.ts")],
  define: {
    "process.env.NODE_ENV": '"production"',
    __MIGRATIONS__: JSON.stringify(migrations),
    __SQLJS_WASM_B64__: JSON.stringify(wasm),
    __AGENT_FILES__: JSON.stringify(agentFiles),
  },
  logLevel: "warning",
});
let bundle = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

// Tailwind v4 with the app's tokens, scanning the reused sources and the artifact shell.
const globals = fs.readFileSync(path.join(app, "src/app/globals.css"), "utf8").replace('@import "tailwindcss";', `@import "tailwindcss" source(none);\n@source "${path.join(app, "src")}";\n@source "${path.join(here, "src")}";`);
const css = (await postcss([tailwind({ base: app, optimize: { minify: true } })]).process(globals, { from: path.join(app, "src/app/globals.css") })).css;

const html = `<title>PRAXIA Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap">
<style>
:root{--font-space-grotesk:"Space Grotesk";--font-inter:"Inter";--font-space-mono:"Space Mono";color-scheme:dark;background:#0c0d12}
html,body{background:#0c0d12;color:#f5f2ec}
.no-print{display:none!important}
${css}
</style>
<div id="praxia-root"></div>
<script>${bundle}</script>
`;
fs.mkdirSync(path.join(here, "dist"), { recursive: true });
const out = path.join(here, "dist/command-center.html");
fs.writeFileSync(out, html);
console.log(`Built ${path.relative(app, out)} — ${(html.length / 1024 / 1024).toFixed(2)} MB`);
