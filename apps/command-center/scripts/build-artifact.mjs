// Builds the claude.ai artifact (dist-artifact/index.html) and the standalone
// web page (web/index.html) — both a single self-contained file.
//   node scripts/build-artifact.mjs
// The page is published with the Artifact tool; app.js/app.css are published
// alongside it as supporting files and loaded by relative URL.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist-artifact');
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/artifact/main.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  outfile: path.join(out, 'app.js'),
  tsconfig: path.join(root, 'tsconfig.json'),
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_AGENT_PROVIDER': '""',
    'process.env.NEXT_PUBLIC_AGENT_WS_URL': '""',
  },
  legalComments: 'none',
  logLevel: 'warning',
});

// Tailwind through PostCSS (same pipeline as Next), minified by esbuild.
const cssIn = path.join(root, 'src/app/globals.css');
const compiled = await postcss([tailwind({ base: root })]).process(readFileSync(cssIn, 'utf8'), { from: cssIn });
const minified = await transform(compiled.css, { loader: 'css', minify: true, legalComments: 'none' });
writeFileSync(path.join(out, 'app.css'), minified.code);

// The Artifact skeleton supplies doctype/head/body; this is the page content.
// Everything is inlined into ONE file: no relative fetches the viewer could block.
const js = readFileSync(path.join(out, 'app.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = readFileSync(path.join(out, 'app.css'), 'utf8').replace(/<\/style/gi, '<\\/style');
writeFileSync(
  path.join(out, 'index.html'),
  `<title>Francisco Command Center</title>
<style>
/* Single dark look by design: the world is a night-lit strategy map. */
:root { --page: #0e0f12; --ink: #ece8df; --muted: #9a978f; --accent: #e2a54a; color-scheme: dark; }
html, body { height: 100%; }
body { margin: 0; background: var(--page); color: var(--ink); overflow: hidden; }
#root { height: 100%; min-height: 560px; }
#root > main { height: 100% !important; }
.boot { height: 100%; display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center; padding: 24px; text-align: center; font: 13px/1.5 ui-sans-serif, system-ui, sans-serif; color: var(--muted); }
.boot b { color: var(--ink); letter-spacing: .25em; font-size: 12px; }
.boot pre { white-space: pre-wrap; max-width: 640px; color: var(--accent); font-size: 12px; }
</style>
<div id="root"><div class="boot" id="boot"><b>FRANCISCO COMMAND CENTER</b><span id="boot-msg">Loading the world…</span></div></div>
<script>
// Boot guard: any startup failure is shown on screen instead of a blank page.
(function () {
  var errors = [];
  function show(msg) {
    if (/ResizeObserver loop/.test(msg)) return; // benign browser notice
    errors.push(msg);
    var root = document.getElementById('root');
    var box = document.getElementById('boot-err');
    if (!box) {
      box = document.createElement('div');
      box.id = 'boot-err';
      box.className = 'boot';
      box.style.cssText = 'position:fixed;inset:auto 0 0 0;height:auto;background:#1b1414;border-top:1px solid #5a2a2a;z-index:99999;padding:12px 16px';
      document.body.appendChild(box);
    }
    box.innerHTML = '<b style="color:#f2a3a3">Startup error</b><pre></pre>';
    box.querySelector('pre').textContent = errors.slice(-4).join('\\n');
  }
  window.__fccBootError = show;
  window.addEventListener('error', function (e) { show((e.message || 'Script error') + (e.filename ? ' @ ' + e.filename.split('/').pop() + ':' + e.lineno : '')); });
  window.addEventListener('unhandledrejection', function (e) { var r = e.reason; show('Unhandled: ' + (r && (r.message || r.code) ? (r.code ? r.code + ' ' : '') + (r.message || '') : String(r))); });
  setTimeout(function () { if (!window.__fccMounted) show('The app script did not start after 12 s.'); }, 12000);
})();
</script>
<style>${css}</style>
<script>${js}</script>
`,
);

// Web build: the same page as a complete standalone document (GitHub Pages, any static host).
// It carries a strict Content-Security-Policy: only the page's own inline scripts
// (pinned by SHA-256) may run, and the page may only talk to the Anthropic API or a
// local/secure gateway — so an injected script cannot run or exfiltrate the API key.
const webDir = path.join(root, 'web');
mkdirSync(webDir, { recursive: true });
const page = readFileSync(path.join(out, 'index.html'), 'utf8');
const scriptHashes = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
const csp = [
  "default-src 'none'",
  `script-src ${scriptHashes.join(' ')}`,
  "style-src 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  'connect-src https://api.anthropic.com wss: ws://localhost:* ws://127.0.0.1:*',
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "manifest-src 'none'",
].join('; ');
writeFileSync(
  path.join(webDir, 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="A living operating system for AI agents, projects and priorities."><meta name="theme-color" content="#0e0f12"></head><body>
${page}</body></html>
`,
);

const kb = (f) => (readFileSync(path.join(out, f)).length / 1024).toFixed(0);
console.log(`dist-artifact/index.html ${kb('index.html')} KB (app.js ${kb('app.js')} KB + app.css ${kb('app.css')} KB inlined)`);
