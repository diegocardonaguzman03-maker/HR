// Genera los PDF de public/documents/ a partir del contenido JSON (una sola fuente de verdad).
// Todos llevan marca de agua de estado, aviso de seguridad y los campos SME_REQUIRED resaltados.
import fs from 'node:fs';
import path from 'node:path';

const PW = process.env.PLAYWRIGHT_MODULE ?? '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const { chromium } = await import(PW);
const C = (f) => JSON.parse(fs.readFileSync(path.join('src/content', f), 'utf8'));
const [docs, wis, hazards, training, equipment, glossary, sources, processes] = ['documents.json', 'work-instructions.json', 'hazards.json', 'training.json', 'equipment.json', 'glossary.json', 'sources.json', 'processes.json'].map(C);
const byId = (a) => Object.fromEntries(a.map((x) => [x.id, x]));
const H = byId(hazards), E = byId(equipment), S = byId(sources), M = byId(training), P = byId(processes);
const DISCLAIMER = 'Este entorno de capacitación apoya el aprendizaje y no sustituye procedimientos operativos aprobados, instrucciones de trabajo, permisos, supervisión ni requisitos de seguridad.';
const STATUS = { GENERAL_EDUCATIONAL: 'CONTENIDO EDUCATIVO GENERAL', DEMO: 'DEMOSTRACIÓN — NO ES PROCEDIMIENTO', SME_REQUIRED: 'REQUIERE VALIDACIÓN SME', DRAFT_NOT_VALIDATED: 'BORRADOR — NO VALIDADO', PLANT_APPROVED: 'APROBADO POR PLANTA' };
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const MARK = /(SME_REQUIRED|PLACEHOLDER\s*[—-]\s*REQUIRES PLANT VALIDATION)\s*:?\s*/i;
function op(s = '') {
  const m = MARK.exec(s);
  if (!m) return esc(s);
  // SAF-12: texto literal del principio P4
  const kind = /^SME/i.test(m[1]) ? 'PENDIENTE DE VALIDACIÓN DE PLANTA (SME_REQUIRED)' : 'PENDIENTE DE VALIDACIÓN DE PLANTA (PLACEHOLDER)';
  return `${esc(s.slice(0, m.index))}<span class="sme"><b>⚠ ${kind}:</b> ${esc(s.slice(m.index + m[0].length))}</span>`;
}
const ul = (a) => (a?.length ? `<ul>${a.map((x) => `<li>${op(x)}</li>`).join('')}</ul>` : '<p class="muted">—</p>');
const img = (n) => { const p = path.resolve('public/images', n + '.png'); return fs.existsSync(p) ? `<img src="data:image/png;base64,${fs.readFileSync(p).toString('base64')}" alt="">` : ''; };
const SEV = { critical: 'CRÍTICO', high: 'ALTO', medium: 'MEDIO' };
const CT = { elimination: 'Eliminación', substitution: 'Sustitución', engineering: 'Ingeniería', administrative: 'Administrativo', ppe: 'EPP' };

const CSS = `
@page { size: Letter; margin: 16mm 14mm 18mm; }
* { box-sizing: border-box; }
body { font-family: 'IBM Plex Sans', 'DejaVu Sans', Arial, sans-serif; font-size: 10.5pt; color: #1b1f24; line-height: 1.42; }
h1 { font-size: 20pt; margin: 0 0 4pt; } h2 { font-size: 13pt; margin: 16pt 0 6pt; border-bottom: 2px solid #e8a33d; padding-bottom: 3pt; break-after: avoid; }
h3 { font-size: 11pt; margin: 10pt 0 4pt; break-after: avoid; }
.wm { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
.wm img { width: 100%; height: 100%; margin: 0; border-radius: 0; }
.band { background: #0c0e11; color: #fff; padding: 12pt 14pt; border-radius: 6pt; margin-bottom: 10pt; }
.band .k { font-family: monospace; font-size: 8.5pt; color: #e8a33d; letter-spacing: 1pt; }
.status { display: inline-block; border: 1.5pt solid #b4542a; color: #b4542a; font-weight: 700; padding: 2pt 6pt; border-radius: 3pt; font-size: 9pt; }
.warn { border: 1.5pt solid #c9a000; background: #fff8d6; padding: 7pt 9pt; border-radius: 4pt; margin: 6pt 0; }
.danger { border: 1.5pt solid #c62828; background: #fdecea; padding: 7pt 9pt; border-radius: 4pt; margin: 6pt 0; }
.info { border: 1pt solid #9db3cf; background: #eef4fb; padding: 7pt 9pt; border-radius: 4pt; margin: 6pt 0; }
.sme { display: inline; background: #fff3c4; border: 1pt dashed #b38f00; padding: 0 3pt; border-radius: 2pt; }
table { width: 100%; border-collapse: collapse; margin: 4pt 0; } td, th { border: .8pt solid #c9ced6; padding: 4pt 5pt; vertical-align: top; text-align: left; font-size: 9.5pt; } th { background: #eef0f3; }
.step { border: 1pt solid #c9ced6; border-left: 5pt solid #e8a33d; border-radius: 4pt; padding: 7pt 9pt; margin: 7pt 0; break-inside: avoid; }
.step.stop { border-left-color: #c62828; }
.step .n { font-family: monospace; font-weight: 700; color: #b06d00; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6pt 12pt; }
.muted { color: #6b7380; } img { width: 100%; border-radius: 4pt; margin: 4pt 0; }
.cb { display: inline-block; width: 10pt; height: 10pt; border: 1.2pt solid #333; margin-right: 6pt; vertical-align: -1pt; }
.foot { font-size: 8pt; color: #6b7380; border-top: 1pt solid #ddd; margin-top: 14pt; padding-top: 4pt; }
`;
// TRN-15 / SAF-13: marca de agua como imagen SVG decorativa (aria-hidden, sin texto extraíble), alfa 0.16
// para que no se pierda en fotocopia o impresión en grises. El texto del SVG va dentro de una <img>,
// así no se intercala con el contenido al copiar o al leer con lector de pantalla.
const WM_TEXT = 'NO VALIDADO · NO USAR PARA OPERAR';
const WM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="816" height="1056" viewBox="0 0 816 1056"><g transform="rotate(-28 408 528)" fill="rgba(160,40,40,0.16)" font-family="DejaVu Sans, Arial, sans-serif" font-weight="800" text-anchor="middle"><text x="408" y="440" font-size="58">${WM_TEXT.split(' · ')[0]}</text><text x="408" y="530" font-size="58">${WM_TEXT.split(' · ')[1]}</text><text x="408" y="640" font-size="30">DEMO / BORRADOR · NO ES PROCEDIMIENTO APROBADO</text></g></svg>`;
const WM_IMG = `data:image/svg+xml;base64,${Buffer.from(WM_SVG).toString('base64')}`;
const watermark = (doc) => (doc.status === 'PLANT_APPROVED' ? '' : `<div class="wm" aria-hidden="true" role="presentation"><img src="${WM_IMG}" alt=""></div>`);

function shell(doc, body) {
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><title>${esc(doc.title)}</title><style>${CSS}</style></head><body>
${watermark(doc)}
<div class="band"><div class="k">ACERÍA DIGITAL ACADEMY · GASM · ${esc(doc.type)} · ${esc(doc.id)}</div><h1>${esc(doc.title)}</h1>
<div style="font-size:9pt;color:#c9ced6">Versión ${esc(doc.version)} · Dueño: ${esc(doc.owner)} · Aprobación: ${doc.approvalDate ? esc(doc.approvalDate) : 'SIN APROBACIÓN'}</div></div>
<p><span class="status">${STATUS[doc.status]}</span></p>
<div class="danger"><b>⚠ Aviso de seguridad.</b> ${DISCLAIMER} Este documento ${doc.status === 'PLANT_APPROVED' ? '' : '<b>no es un procedimiento aprobado</b> y '}no certifica competencia. Los campos marcados SME_REQUIRED / PLACEHOLDER los define el procedimiento aprobado de la planta.</div>
${body}
<div class="foot">Generado desde <code>src/content</code> (estructura verificada contra el esquema de datos; <b>no es validación de planta</b>). Fuentes y estados en la sección final. Contexto GASM (D-010): EAF con ≈95–100 % DRI de HYL y Midrex por bandas y 5.º agujero, retornos internos ≤5 %, sin chatarra comprada.</div>
</body></html>`;
}
const srcList = (ids) => `<h2>Fuentes</h2><table><tr><th>Fuente</th><th>Estado</th></tr>${ids.map((i) => `<tr><td>${esc(S[i]?.title ?? i)}</td><td>${esc(STATUS[S[i]?.status] ?? '')}</td></tr>`).join('')}</table>`;
const hazTable = (ids) => `<table><tr><th style="width:22%">Peligro</th><th style="width:9%">Nivel</th><th>Controles (jerarquía)</th><th style="width:30%">Datos de planta</th></tr>${ids.map((i) => H[i]).filter(Boolean).map((h) => `<tr><td><b>${esc(h.name)}</b><br><span class="muted">${esc(h.consequence)}</span></td><td>▲ ${SEV[h.severity]}</td><td>${h.controls.map((c) => `<b>${CT[c.type]}:</b> ${op(c.text)}`).join('<br>')}</td><td><b>Zona:</b> ${op(h.exclusionZone)}<br><b>Permiso:</b> ${op(h.permit)}<br><b>Paro:</b> ${op(h.stopCondition)}</td></tr>`).join('')}</table>`;
const signoff = `<h2>Revisión y aprobación (obligatoria para PLANT_APPROVED)</h2><table><tr><th>Función</th><th>Nombre</th><th>Firma</th><th>Fecha</th></tr>${['Seguridad (veto)', 'Operaciones (superintendente EAF)', 'Metalurgia', 'Mantenimiento', 'Capacitación y Desarrollo'].map((r) => `<tr><td>${r}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}</table><p class="muted">Sin firmas de Seguridad y Operaciones este documento no puede usarse para operar.</p>`;

// SAF-08 / RT-SW-15: bandera stop del contenido o título que empieza con ALTO / dice DETENTE (sin «asfalto», «salto»…)
const isStop = (s) => s.stop ?? /^\s*ALTO\b|\bDET[EÉ]NTE\b/.test(s.title);
const builders = {
  'doc.wi-electrode-system-check': (doc) => {
    const w = wis.find((x) => x.id === 'wi.electrode-system-check');
    return shell(doc, `${img('electrodes')}
<h2>Propósito</h2><p>${op(w.purpose)}</p>
<div class="grid2"><div><h3>Rol</h3><p>${esc(w.role)}</p><h3>Requisitos previos</h3>${ul(w.prerequisites)}</div><div><h3>EPP</h3>${ul(w.ppe)}<h3>Herramientas</h3>${ul(w.tools)}</div></div>
<h2>Peligros</h2>${hazTable(w.hazardIds)}
<h2>Pasos</h2>${w.steps.map((s) => `<div class="step ${isStop(s) ? 'stop' : ''}"><div><span class="n">PASO ${s.n}</span> · <b>${esc(s.title)}</b></div>
<p><b>Acción:</b> ${op(s.action)}</p><p><b>Por qué:</b> ${op(s.why)}</p>${s.visual ? `<p class="muted"><b>Apoyo visual:</b> ${op(s.visual)}</p>` : ''}
<p><b>Verifica:</b> ${op(s.check)}</p><p><b>Resultado esperado:</b> ${op(s.expected)}</p>
${s.warning ? `<div class="warn"><b>▲ Advertencia:</b> ${op(s.warning)}</div>` : ''}${s.commonError ? `<p><b>Error común:</b> ${op(s.commonError)}</p>` : ''}${s.escalation ? `<div class="info"><b>☎ Si algo no está bien:</b> ${op(s.escalation)}</div>` : ''}</div>`).join('')}
<h2>Cierre</h2>${ul(w.completion)}${signoff}${srcList(w.sourceIds)}`);
  },
  'doc.jobaid-electrode-system-check': (doc) => {
    const w = wis.find((x) => x.id === 'wi.electrode-system-check');
    return shell(doc, `<div class="grid2"><div>${img('electrodes')}</div><div><h3>Antes de empezar</h3>${ul(w.prerequisites.slice(0, 5))}<h3>EPP</h3>${ul(w.ppe)}</div></div>
<h2>Lista de práctica en simulación</h2><table><tr><th style="width:6%">#</th><th>Paso</th><th>Verifica</th><th style="width:14%">Practicado en simulación</th></tr>${w.steps.map((s) => `<tr><td>${s.n}</td><td><b>${isStop(s) ? '⛔ ' : ''}${esc(s.title)}</b></td><td>${op(s.check)}</td><td><span class="cb"></span></td></tr>`).join('')}</table>
<p class="danger"><b>⛔ No usar en piso.</b> Esta lista es para practicar en la plataforma; en planta solo se usa la lista del procedimiento aprobado.</p>
<div class="danger"><b>⛔ ALTO:</b> si ves agua cerca de metal líquido, un electrodo dañado, una fuga hidráulica, alguien en la zona o cualquier duda sobre el estado de energía: <b>detente, retírate a la zona segura y avisa al supervisor</b>. ${op('SME_REQUIRED: condiciones de paro y forma de reporte del procedimiento aprobado (Seguridad + Operaciones).')}</div>
${signoff}`);
  },
  'doc.guide-eaf-energy-safety': (doc) => {
    const m = M['mod.eaf-energy-safety'];
    const hz = ['haz.electrical', 'haz.stored-energy', 'haz.molten-metal', 'haz.water-molten-metal'];
    return shell(doc, `${img('section')}<h2>Objetivos</h2>${ul(m.objectives)}
${m.lessons.map((l, i) => `<h2>Lección ${i + 1}. ${esc(l.title)}</h2>${l.body.map((b) => `<p>${op(b)}</p>`).join('')}<div class="info"><b>Puntos clave</b>${ul(l.keyPoints)}</div>`).join('')}
<h2>Peligros del módulo</h2>${hazTable(hz)}${srcList(m.sourceIds)}`);
  },
  'doc.guide-electrode-melting': (doc) => {
    const m = M['mod.electrode-melting'];
    const eqs = ['eq.electrodes', 'eq.electrode-arms', 'eq.transformer', 'eq.secondary-circuit'].map((e) => E[e]);
    const melt = P['stage.melt'];
    return shell(doc, `${img('overview')}<h2>Objetivos</h2>${ul(m.objectives)}
${m.lessons.map((l, i) => `<h2>Lección ${i + 1}. ${esc(l.title)}</h2>${l.body.map((b) => `<p>${op(b)}</p>`).join('')}<div class="info"><b>Puntos clave</b>${ul(l.keyPoints)}</div>`).join('')}
<h2>Etapa 03 — ${esc(melt.name)}</h2><p>${op(melt.purpose)}</p><!-- TRN-14: sin la tabla de variables de proceso en la guía del participante (nivel 1–3) -->
<p>${op('Las condiciones de operación de la fusión las define el procedimiento aprobado de la planta. SME_REQUIRED: condiciones de operación de la fusión del procedimiento aprobado; las dan C-07 Ingeniero de Proceso EAF y Operaciones (MO-EAF en borrador).')}</p>
<h2>El sistema de electrodos</h2>${img('secondary')}${eqs.map((e) => `<h3>${String(e.hotspotNumber).padStart(2, '0')} · ${esc(e.name)}</h3><p>${op(e.function)}</p><table><tr><th>Componente</th><th>Función</th></tr>${e.components.map((c) => `<tr><td><b>${esc(c.name)}</b></td><td>${op(c.function)}</td></tr>`).join('')}</table>`).join('')}
<h2>Glosario</h2><table>${glossary.slice(0, 40).map((g) => `<tr><td style="width:24%"><b>${esc(g.term)}</b></td><td>${esc(g.definition)}</td></tr>`).join('')}</table>${srcList(m.sourceIds)}`);
  },
};

fs.mkdirSync('public/documents', { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();
for (const doc of docs) {
  const b = builders[doc.id];
  if (!b) { console.log('sin plantilla:', doc.id); continue; }
  await page.setContent(b(doc), { waitUntil: 'load' });
  const out = path.join('public', doc.file);
  await page.pdf({ path: out, format: 'Letter', printBackground: true, displayHeaderFooter: true, headerTemplate: doc.status === 'PLANT_APPROVED' ? '<span></span>' : `<div style="font-size:7pt;width:100%;padding:0 14mm;color:#a02828;font-weight:700;text-align:center">${WM_TEXT} · ${STATUS[doc.status]} · NO SUSTITUYE PROCEDIMIENTOS APROBADOS</div>`, footerTemplate: `<div style="font-size:7pt;width:100%;padding:0 14mm;color:#777;display:flex;justify-content:space-between"><span>${esc(doc.id)} · v${esc(doc.version)} · ${STATUS[doc.status]}</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`, margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' } });
  console.log(out, (fs.statSync(out).size / 1024).toFixed(0), 'KB');
}
await browser.close();
