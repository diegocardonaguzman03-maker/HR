// Writes dist-share/ammx-agent-operations.html: the small page for the claude.ai link.
// It inlines the CSS and loads the bundle (dist-share/app.js, a classic script) as a published file.
import { readFileSync, writeFileSync } from 'node:fs';
const css = readFileSync('dist-share/app.css', 'utf8');
const page = `<title>AMMX Agent Operations</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oxanium:wght@500;600;700&display=swap">
<style>${css}</style>
<div id="root"><div style="display:flex;height:100%;align-items:center;justify-content:center;background:#0d1117;font:600 13px/1.4 Oxanium,system-ui,sans-serif;letter-spacing:.3em;color:#F58220">CARGANDO EL CENTRO DE OPERACIONES…</div></div>
<script>
  // If the bundle cannot start, show the reason instead of an empty page.
  function opsFail(msg) {
    var r = document.getElementById('root');
    if (r && !r.dataset.started) r.innerHTML = '<div style="padding:32px 16px;font:14px/1.5 system-ui,sans-serif;color:#e4e4e7;background:#0d1117;height:100%;box-sizing:border-box">No se pudo iniciar la aplicación.<br><span style="color:#a1a1aa">' + String(msg).replace(/</g, '&lt;') + '</span></div>';
  }
  window.addEventListener('error', function (e) { opsFail(e.message || 'No se pudo cargar el script'); });
</script>
<script src="app.js" onerror="opsFail('no se pudo cargar app.js')"></script>
`;
writeFileSync('dist-share/ammx-agent-operations.html', page);
console.log('dist-share/ammx-agent-operations.html');
