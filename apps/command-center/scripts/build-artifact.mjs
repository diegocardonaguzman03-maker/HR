// Builds the claude.ai artifact: dist-artifact/{index.html, app.js, app.css}.
//   node scripts/build-artifact.mjs
// The page is published with the Artifact tool; app.js/app.css are published
// alongside it as supporting files and loaded by relative URL.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

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

execFileSync(path.join(root, 'node_modules/.bin/tailwindcss'), ['-i', 'src/app/globals.css', '-o', path.join(out, 'app.css'), '--minify'], { cwd: root, stdio: 'inherit' });

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

const kb = (f) => (readFileSync(path.join(out, f)).length / 1024).toFixed(0);
console.log(`dist-artifact/index.html ${kb('index.html')} KB (app.js ${kb('app.js')} KB + app.css ${kb('app.css')} KB inlined)`);
