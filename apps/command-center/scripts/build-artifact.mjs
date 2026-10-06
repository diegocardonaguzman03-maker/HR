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
writeFileSync(
  path.join(out, 'index.html'),
  `<title>Francisco Command Center</title>
<meta name="description" content="A living operating system for AI agents, projects and priorities.">
<style>
/* Single dark look by design: the world is a night-lit strategy map. */
:root { --page: #0e0f12; --ink: #ece8df; color-scheme: dark; }
html, body { height: 100%; }
body { margin: 0; background: var(--page); color: var(--ink); overflow: hidden; }
#root { height: 100%; }
#root > main { height: 100% !important; }
.boot { height: 100%; display: flex; align-items: center; justify-content: center; font: 600 11px/1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .3em; color: #6b6a66; }
</style>
<link rel="stylesheet" href="app.css">
<div id="root"><div class="boot">FRANCISCO COMMAND CENTER</div></div>
<script src="app.js"></script>
`,
);

const kb = (f) => (readFileSync(path.join(out, f)).length / 1024).toFixed(0);
console.log(`dist-artifact: app.js ${kb('app.js')} KB · app.css ${kb('app.css')} KB · index.html ${kb('index.html')} KB`);
