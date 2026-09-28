// Writes dist-share/steel-learning-twin.html: the small page for the shareable Artifact link.
// It inlines the CSS and loads the bundle (dist-share/app.js, a classic script) as a published file.
import { readFileSync, writeFileSync } from 'node:fs';
const css = readFileSync('dist-share/app.css', 'utf8');
const page = `<title>Steel Learning Twin</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oxanium:wght@400;500;600;700&display=swap">
<style>${css}</style>
<div id="root"><div style="display:flex;height:100%;align-items:center;justify-content:center;font:600 13px/1.4 Oxanium,system-ui,sans-serif;letter-spacing:.3em;color:#ffc043">LOADING THE MELT SHOP…</div></div>
<script>
  // If the bundle cannot start, show the reason instead of an empty page.
  function twinFail(msg) {
    var r = document.getElementById('root');
    if (r && !r.dataset.started) r.innerHTML = '<div style="padding:32px 16px;font:14px/1.5 system-ui,sans-serif;color:#e4e4e7;background:#15181d;height:100%;box-sizing:border-box">The 3D learning twin could not start.<br><span style="color:#a1a1aa">' + String(msg).replace(/</g, '&lt;') + '</span></div>';
  }
  window.addEventListener('error', function (e) { twinFail(e.message || 'Script failed to load'); });
</script>
<script src="app.js" onerror="twinFail('app.js could not be loaded')"></script>
`;
writeFileSync('dist-share/steel-learning-twin.html', page);
console.log('dist-share/steel-learning-twin.html');
