// Genera los PDF de los procedimientos de las misiones (Instrucción de trabajo, Manual operativo, Checklist)
// a partir de src/content/missions/docs-*.json. Marca de agua rasterizada (no se mezcla con el texto).
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? '/opt/node22/lib/node_modules/playwright/index.mjs');
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const DIR = 'src/content/missions';
const files = fs.readdirSync(DIR).filter((f) => /^docs-.*\.json$/.test(f));
const DISCLAIMER = 'Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad.';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const MARK = /(SME_REQUIRED|PLACEHOLDER\s*[—-]\s*REQUIRES PLANT VALIDATION)\s*:?\s*/i;
const op = (s = '') => esc(s).replace(/(SME_REQUIRED|PLACEHOLDER\s*[—-]\s*REQUIRES PLANT VALIDATION)\s*:?\s*([^.]*\.?)/gi, (_m, _k, rest) => `<span class="sme"><b>⚠ PENDIENTE DE VALIDACIÓN DE PLANTA (SME_REQUIRED):</b> ${rest}</span>`);
const ul = (a = []) => (a.length ? `<ul>${a.map((x) => `<li>${op(x)}</li>`).join('')}</ul>` : '');

const CSS = `
@page { size: Letter; margin: 16mm 14mm 18mm; }
* { box-sizing: border-box; } body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10.3pt; color: #1b1f24; line-height: 1.42; }
h1 { font-size: 19pt; margin: 2pt 0 4pt; } h2 { font-size: 12.5pt; margin: 14pt 0 6pt; border-bottom: 2px solid #e8a33d; padding-bottom: 3pt; break-after: avoid; }
.wm { position: fixed; inset: 0; z-index: -1; pointer-events: none; } .wm img { width: 100%; height: 100%; }
.band { background: #0c0e11; color: #fff; padding: 11pt 14pt; border-radius: 6pt; } .band .k { font-family: monospace; font-size: 8.5pt; color: #e8a33d; letter-spacing: 1pt; }
.meta { font-size: 9pt; color: #c9ced6; } .demo { display: inline-block; margin: 8pt 0 4pt; border: 1.5pt solid #7c3aed; color: #6d28d9; font-weight: 700; padding: 2pt 6pt; border-radius: 3pt; font-size: 9pt; }
.danger { border: 1.5pt solid #c62828; background: #fdecea; padding: 7pt 9pt; border-radius: 4pt; margin: 6pt 0; }
.sme { background: #fff3c4; border: 1pt dashed #b38f00; padding: 0 3pt; border-radius: 2pt; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0; } td, th { border: .8pt solid #c9ced6; padding: 4pt 5pt; vertical-align: top; text-align: left; font-size: 9.5pt; } th { background: #eef0f3; }
.step { border: 1pt solid #c9ced6; border-left: 5pt solid #e8a33d; border-radius: 4pt; padding: 6pt 9pt; margin: 6pt 0; break-inside: avoid; } .n { font-family: monospace; font-weight: 700; color: #b06d00; }
.crit { color: #b91c1c; font-weight: 700; } .cb { display: inline-block; width: 11pt; height: 11pt; border: 1.3pt solid #333; vertical-align: -2pt; }
.foot { font-size: 8pt; color: #6b7380; border-top: 1pt solid #ddd; margin-top: 14pt; padding-top: 4pt; }
`;
const TYPE = { wi: 'INSTRUCCIÓN DE TRABAJO', manual: 'MANUAL OPERATIVO', checklist: 'CHECKLIST DE PRÁCTICA' };
function page(p, kind, d, body, img) {
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><title>${esc(d.title)}</title><style>${CSS}</style></head><body>
<div class="wm" aria-hidden="true"><img src="${img}" alt=""></div>
<div class="band"><div class="k">ACERÍA DIGITAL ACADEMY · ${TYPE[kind]} · ${esc(d.code)}</div><h1>${esc(d.title)}</h1>
<div class="meta">${esc(p.area)} · Versión ${esc(d.version)} · Dueño: ${esc(d.owner)} · Aprobación: SIN APROBACIÓN</div></div>
<span class="demo">◇ DEMOSTRACIÓN — NO ES PROCEDIMIENTO APROBADO</span>
<div class="danger"><b>⚠ Aviso de seguridad.</b> ${DISCLAIMER} Este documento <b>no es un procedimiento aprobado</b>, no certifica competencia y no debe usarse para operar. Los campos SME_REQUIRED los define el procedimiento aprobado de la planta (Operaciones + Seguridad).</div>
${body}
<h2>Revisión y aprobación (obligatoria antes de cualquier uso operativo)</h2>
<table><tr><th>Función</th><th>Nombre</th><th>Firma</th><th>Fecha</th></tr>${['Seguridad (veto)', 'Operaciones', 'Mantenimiento', 'Capacitación y Desarrollo'].map((r) => `<tr><td>${r}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</table>
<div class="foot">Generado desde el contenido de la misión «${esc(p.missionId)}» (estructura verificada contra el esquema; no es validación de planta).</div>
</body></html>`;
}
const wiBody = (w) => `<h2>Propósito</h2><p>${op(w.purpose)}</p><h2>Alcance</h2><p>${op(w.scope)}</p>
<h2>Responsabilidades</h2><table><tr><th style="width:30%">Rol</th><th>Responsabilidad</th></tr>${w.roles.map((r) => `<tr><td><b>${esc(r.role)}</b></td><td>${op(r.responsibility)}</td></tr>`).join('')}</table>
<h2>Equipo de protección personal</h2>${ul(w.ppe)}<h2>Herramientas y materiales</h2>${ul(w.tools)}
<h2>Peligros y controles</h2><table><tr><th style="width:35%">Peligro</th><th>Control</th></tr>${w.hazards.map((h) => `<tr><td><b>${op(h.hazard)}</b></td><td>${op(h.control)}</td></tr>`).join('')}</table>
<h2>Pasos</h2>${w.steps.map((s) => `<div class="step"><span class="n">PASO ${s.n}</span> · <b>${op(s.action)}</b><br><b>Punto clave:</b> ${op(s.keyPoint)}<br><b>Por qué:</b> ${op(s.why)}</div>`).join('')}
<h2>⛔ Condiciones para detenerse y avisar</h2>${ul(w.stopConditions)}<h2>Referencias</h2>${ul(w.references)}`;
const manualBody = (mo) => mo.sections.map((s) => `<h2>${esc(s.title)}</h2>${s.paragraphs.map((p) => `<p>${op(p)}</p>`).join('')}${ul(s.bullets)}`).join('');
const checklistBody = (c) => `<p class="danger"><b>PLANTILLA DE PRÁCTICA — NO ES UN REGISTRO DE PLANTA.</b> No anotes equipos reales ni tu nombre o firma reales, ni la uses como evidencia de bloqueo, de permiso, de inspección ni de capacitación.</p><p>${op(c.instructions)}</p>
<p><b>Equipo / área:</b> ____________________ &nbsp; <b>Fecha:</b> __________ &nbsp; <b>Turno:</b> ______</p>
${c.sections.map((s) => `<h2>${esc(s.title)}</h2><table><tr><th>Verificación</th><th style="width:9%">Sí</th><th style="width:9%">No</th><th style="width:9%">N/A</th></tr>${s.items.map((i) => `<tr><td>${i.critical ? '<span class="crit">▲ CRÍTICO · </span>' : ''}${op(i.text)}</td><td><span class="cb"></span></td><td><span class="cb"></span></td><td>${i.critical && !/cuando aplica/i.test(i.text) ? '—' : '<span class="cb"></span>'}</td></tr>`).join('')}</table>`).join('')}
<p class="crit">▲ Si un punto crítico es «No»: NO se inicia. Detente y avisa a tu supervisor.</p><p class="crit">▲ Un punto crítico no se marca N/A. Si tienes duda, la respuesta es «No».</p>
<h2>Firmas (solo para práctica en aula; no son válidas como registro)</h2><table>${c.signatures.map((s) => `<tr><td style="width:40%">${esc(s)}</td><td>&nbsp;</td></tr>`).join('')}</table>`;

const browser = await chromium.launch({ executablePath: CHROME });
const pg = await browser.newPage();
const WM = `<svg xmlns="http://www.w3.org/2000/svg" width="816" height="1056"><g transform="rotate(-28 408 528)" fill="rgba(124,58,237,0.22)" font-family="DejaVu Sans, Arial" font-weight="800" text-anchor="middle"><text x="408" y="470" font-size="60">DEMOSTRACIÓN</text><text x="408" y="560" font-size="40">NO USAR PARA OPERAR</text></g></svg>`;
await pg.setViewportSize({ width: 816, height: 1056 });
await pg.setContent(`<html><body style="margin:0;background:transparent">${WM}</body></html>`);
const img = `data:image/png;base64,${(await pg.screenshot({ omitBackground: true })).toString('base64')}`;
for (const f of files) {
  const p = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (const [kind, body] of [['wi', wiBody], ['manual', manualBody], ['checklist', checklistBody]]) {
    const d = p[kind];
    await pg.setContent(page(p, kind, d, body(d), img), { waitUntil: 'load' });
    const out = path.join('public', d.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await pg.pdf({ path: out, format: 'Letter', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: `<div style="font-size:7pt;width:100%;padding:0 14mm;color:#777;display:flex;justify-content:space-between"><span>${esc(d.code)} · v${esc(d.version)} · DEMO — no usar para operar</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
      margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' } });
    console.log(out, (fs.statSync(out).size / 1024).toFixed(0), 'KB');
  }
}
await browser.close();
