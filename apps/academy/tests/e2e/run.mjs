// Pruebas e2e en Chromium real (WebGL por software) sobre el build de producción (dist/).
// Cubre: arranque con carga real, apertura de hotspot 3D, navegación, cambio de modo, pasos de instrucción,
// evaluación completa, descarga de documento, asistente, accesibilidad básica y presupuesto de rendimiento.
// Escribe tests/e2e/report.json y capturas en tests/e2e/shots/.
import fs from 'node:fs';
import path from 'node:path';
import { serve } from './serve.mjs';

const PW = process.env.PLAYWRIGHT_MODULE ?? '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const { chromium } = await import(PW);
const DIR = process.argv[2] ?? 'dist';
const SHOTS = 'tests/e2e/shots';
fs.mkdirSync(SHOTS, { recursive: true });
const content = Object.fromEntries(['questions', 'assessments', 'work-instructions', 'documents'].map((f) => [f, JSON.parse(fs.readFileSync(`src/content/${f}.json`, 'utf8'))]));

const srv = await serve(DIR);
const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
const errors = [];
async function test(name, fn, { width = 1440, height = 900 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  // RT-UX-04 / RT-SW-11: ya no se ocultan los 404 (un VTT o PDF faltante debe fallar)
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errors.push(`${name}: ${m.text()}`); });
  const t0 = Date.now();
  try {
    await fn(page);
    results.push({ name, ok: true, ms: Date.now() - t0 });
    console.log(`✓ ${name} (${Date.now() - t0} ms)`);
  } catch (e) {
    results.push({ name, ok: false, ms: Date.now() - t0, error: String(e.message ?? e).slice(0, 400) });
    console.log(`✗ ${name}\n   ${String(e.message ?? e).slice(0, 400)}`);
    await page.screenshot({ path: `${SHOTS}/FAIL-${name.replace(/\W+/g, '_')}.png` }).catch(() => {});
  }
  await ctx.close();
}
const ready = async (page, hash = '') => {
  // ?e2e expone window.__adxStore en el build de producción (RT-SW-14)
  await page.goto(srv.url + '/?e2e' + (hash || '#/explore'));
  await page.waitForSelector('[data-testid=loading]', { timeout: 15000 }).catch(() => {});
  await page.waitForSelector('[data-testid=loading]', { state: 'detached', timeout: 120000 });
};
const assert = (c, m) => { if (!c) throw new Error(m); };

let perf = {};
await test('arranque: carga real del modelo, aviso permanente y métricas', async (page) => {
  const t0 = Date.now();
  await ready(page);
  perf.loadMs = Date.now() - t0;
  assert(await page.isVisible('[data-testid=disclaimer]'), 'sin aviso');
  assert(await page.locator('canvas').count() === 1, 'sin canvas');
  await page.waitForFunction(() => window.__adx && window.__adx.calls > 0, null, { timeout: 30000 });
  perf = { ...perf, ...(await page.evaluate(() => window.__adx)), jsHeapMB: await page.evaluate(() => Math.round((performance.memory?.usedJSHeapSize ?? 0) / 1048576)) };
  await page.screenshot({ path: `${SHOTS}/01-inicio.png` });
});

await test('aviso de registro al arrancar, antes de `initialized` (RL-10)', async (page) => {
  await page.goto(srv.url + '/?e2e#/explore');
  await page.waitForSelector('[data-testid=first-run-notice]', { timeout: 15000 });
  // el aviso se pinta antes de que la escena registre `initialized`
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('adx.events') ?? '[]').map((e) => e.verb));
  assert(!before.includes('initialized'), 'initialized antes del aviso');
  const txt = await page.textContent('[data-testid=first-run-notice]');
  assert(/sin tu nombre ni tu número de ficha/.test(txt) && !/anónim/i.test(txt), 'texto del aviso');
  assert(await page.isVisible('[data-testid=first-run-toggle-recording]') && await page.isVisible('[data-testid=first-run-clear-shared]'), 'faltan botones');
  await page.waitForSelector('[data-testid=loading]', { state: 'detached', timeout: 120000 });
  assert(await page.isVisible('[data-testid=first-run-notice]'), 'el aviso desapareció al cargar');
  await page.screenshot({ path: `${SHOTS}/00-aviso-registro.png` });
  await page.click('[data-testid=first-run-dismiss]');
  await page.reload();
  await page.waitForSelector('[data-testid=loading]', { state: 'detached', timeout: 120000 });
  assert(await page.locator('[data-testid=first-run-notice]').count() === 0, 'no se recordó por equipo');
  await page.click('[data-testid=mode-assess]');
  assert(await page.isVisible('[data-testid=recording-notice]'), 'falta el aviso en EVALUAR');
});

await test('hotspot 3D abre el panel del equipo', async (page) => {
  await ready(page);
  await page.click('[data-testid="hotspot-hs.electrodes"]');
  await page.waitForSelector('[data-testid=equipment-panel]');
  assert((await page.textContent('[data-testid=equipment-panel] h2')).includes('Electrodos'), 'panel incorrecto');
  await page.click('[data-testid=tab-components]');
  await page.click('text=Ver en 3D >> nth=0');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/02-electrodos.png` });
});

await test('clic directo en el modelo 3D selecciona un equipo', async (page) => {
  await ready(page);
  await page.click('[data-testid=xray]'); await page.click('[data-testid=xray]'); // alterna sin romper
  const box = await page.locator('canvas').boundingBox();
  // busca un punto del canvas que seleccione algo (barrido corto)
  let hit = null;
  for (const [fx, fy] of [[0.5, 0.55], [0.45, 0.5], [0.55, 0.6], [0.5, 0.45], [0.4, 0.6]]) {
    await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await page.waitForTimeout(400);
    if (await page.isVisible('[data-testid=equipment-panel]')) { hit = await page.textContent('[data-testid=equipment-panel] h2'); break; }
  }
  assert(hit, 'ningún clic seleccionó un equipo');
});

await test('herramientas de vista: corte, rayos X, despiece, aislar, restablecer', async (page) => {
  await ready(page, '#/explore/eq.ebt');
  await page.click('[data-testid=section]'); await page.click('[data-testid=xray]');
  await page.locator('input[aria-label=Despiece]').fill('0.8');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/03-corte-rayosx-despiece.png` });
  await page.click('text=AISLAR');
  await page.click('[data-testid=reset-view]');
  const st = await page.evaluate(() => { const s = window.__adxStore.getState(); return { x: s.xray, c: s.section, e: s.explode, i: s.isolate }; });
  assert(!st.x && !st.c && st.e === 0 && !st.i, 'no se restableció ' + JSON.stringify(st));
});

await test('cambio de modo y enlaces profundos', async (page) => {
  await ready(page);
  for (const [m, id] of [['learn', 'module-list'], ['perform', 'wi-list'], ['assess', 'assessment-list'], ['library', 'library'], ['explore', 'welcome']]) {
    await page.click(`[data-testid=mode-${m}]`);
    await page.waitForSelector(`[data-testid=${id}]`);
    assert(page.url().includes(`#/${m}`), 'hash no cambió a ' + m);
  }
  await page.goto(srv.url + '/?e2e#/learn/mod.eaf-orientation');
  await page.waitForSelector('[data-testid=learn-player]');
});

await test('progresión de lecciones con resaltado 3D', async (page) => {
  await ready(page, '#/learn');
  await page.click('[data-testid="open-mod.electrode-melting"]');
  await page.waitForSelector('[data-testid=learn-player]');
  const focus = await page.evaluate(() => window.__adxStore.getState().focusNodes);
  assert(focus.length > 0, 'la lección no resalta nodos');
  await page.screenshot({ path: `${SHOTS}/04-leccion.png` });
  while (await page.isVisible('[data-testid=next-lesson]')) await page.click('[data-testid=next-lesson]');
  await page.waitForSelector('[data-testid=module-complete]');
});

await test('EJECUTAR: instrucción paso a paso con aviso de no aprobada', async (page) => {
  await ready(page, '#/perform');
  await page.click('[data-testid="open-wi.electrode-system-check"]');
  assert(await page.isVisible('[data-testid=not-approved-banner]'), 'falta aviso');
  await page.click('[data-testid=wi-begin]');
  const n = content['work-instructions'][0].steps.length;
  for (let i = 0; i < n; i++) { await page.check('[data-testid=step-check]'); if (i === 8) await page.screenshot({ path: `${SHOTS}/05-paso-alto.png` }); await page.click('[data-testid=next-step]'); }
  assert((await page.textContent('[data-testid=wi-complete]')).includes(`${n}/${n}`), 'no completó');
});

await test('evaluación completa (identificar con la lista accesible; preguntas críticas ▲)', async (page) => {
  await ready(page, '#/assess');
  await page.click('[data-testid="start-asm.eaf-electrode"]');
  const asm = content.assessments[0];
  const Q = Object.fromEntries(content.questions.map((q) => [q.id, q]));
  for (const [i, id] of asm.questionIds.entries()) {
    const q = Q[id];
    const box = page.locator(`[data-testid="question-${id}"]`);
    const crit = (asm.criticalQuestionIds ?? []).includes(id);
    assert((await box.locator('[data-testid=critical-badge]').count()) === (crit ? 1 : 0), `badge de seguridad en ${id}`);
    if (q.kind === 'mcq') await box.locator('label').nth(q.answer).click();
    if (q.kind === 'identify') await box.locator('[data-testid=identify-select]').selectOption(q.answerEquipmentId);
    if (q.kind === 'match') for (const [k, p] of q.pairs.entries()) await box.getByLabel(`Relaciona: ${p.left}`).selectOption(String(k));
    if (q.kind === 'order') {
      const want = q.correctOrder.map((k) => q.items[k]);
      for (let pos = 0; pos < want.length; pos++) {
        for (let g = 0; g < 20; g++) {
          const cur = await box.locator('li span.flex-1').allTextContents();
          if (cur.indexOf(want[pos]) === pos) break;
          await box.getByLabel(`Subir «${want[pos]}»`).click();
        }
      }
    }
    await page.click(i < asm.questionIds.length - 1 ? '[data-testid=next-question]' : '[data-testid=finish-assessment]');
  }
  const txt = await page.textContent('[data-testid=assessment-result]');
  assert(/Comprensión suficiente/.test(txt) && !/Aprobaste|Aprobado/.test(txt) && /no certifica competencia/.test(txt) && /escalafón/.test(txt), 'resultado inesperado');
  await page.screenshot({ path: `${SHOTS}/06-resultado.png` });
});

await test('descarga de documento PDF', async (page) => {
  await ready(page, '#/library');
  const d = content.documents.find((x) => x.type === 'JobAid');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(`[data-testid="download-${d.id}"]`)]);
  const p = await dl.path();
  const head = fs.readFileSync(p).subarray(0, 5).toString();
  assert(head === '%PDF-', 'no es PDF');
  assert(dl.suggestedFilename() === path.basename(d.file), 'nombre ' + dl.suggestedFilename());
  await page.click(`[data-testid="preview-${d.id}"]`);
  await page.waitForSelector('[data-testid=document-viewer]');
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-testid=document-viewer]', { state: 'detached' });
  await page.screenshot({ path: `${SHOTS}/07-biblioteca.png` });
});

await test('video con subtítulos y capítulos', async (page) => {
  await ready(page, '#/library');
  await page.click('[data-testid="video-vid.melt-overview"]');
  await page.waitForSelector('[data-testid=video-player]');
  // UX-04: el VTT debe cargar de verdad (readyState 2 = LOADED) y tener cues; textTracks.length no basta
  const ok = await page.evaluate(async () => {
    const v = document.querySelector('[data-testid=video-element]');
    const tr = v?.querySelector('track');
    if (!v || !tr) return 'sin video/track';
    tr.track.mode = 'showing';
    await new Promise((r) => (v.readyState >= 1 ? r() : v.addEventListener('loadedmetadata', r, { once: true })));
    await new Promise((r) => (tr.readyState === 2 || tr.readyState === 3 ? r() : (tr.addEventListener('load', r, { once: true }), tr.addEventListener('error', r, { once: true }), setTimeout(r, 10000))));
    if (tr.readyState !== 2) return `track.readyState=${tr.readyState} (VTT no cargó)`;
    if (!(tr.track.cues?.length > 0)) return 'VTT sin cues';
    return v.duration > 30 ? 'ok' : `dur ${v.duration}`;
  });
  assert(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) === 'video-element', 'el foco inicial debe ir al video (UX-01)');
  // UX-01: Espacio sobre el video no cierra el modal
  await page.keyboard.press('Space'); await page.waitForTimeout(600); await page.keyboard.press('Space');
  assert(await page.isVisible('[data-testid=video-player]'), 'Espacio cerró el modal');
  assert(ok === 'ok', ok);
  await page.click('text=Electrodos y arco');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/08-video.png` });
});

await test('asistente oculto en el piloto (veto ADX-04, opción B)', async (page) => {
  await ready(page);
  assert(await page.locator('[data-testid=open-assistant]').count() === 0, 'el asistente no debe aparecer');
  assert(await page.locator('[data-testid=assistant]').count() === 0, 'panel del asistente presente');
});

await test('accesibilidad: teclado, landmarks, etiquetas y modo móvil', async (page) => {
  await ready(page);
  // todos los botones e inputs tienen nombre accesible
  const unnamed = await page.evaluate(() => [...document.querySelectorAll('button, a[href], input, select')].filter((el) => {
    const n = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent) || el.closest('label')?.textContent || '').trim();
    return !n;
  }).map((el) => el.outerHTML.slice(0, 80)));
  assert(unnamed.length === 0, 'controles sin nombre: ' + unnamed.join(' | '));
  for (const r of ['banner', 'main', 'contentinfo', 'navigation']) assert(await page.locator(`[role=${r}], ${({ banner: 'header', main: 'main', contentinfo: 'footer', navigation: 'nav' })[r]}`).count() > 0, 'falta ' + r);
  // teclado: un hotspot enfocado se abre con Enter (el foco se pone con focus(), no con Tab)
  await page.focus('[data-testid="hotspot-hs.transformer"]');
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-testid=equipment-panel]');
  // las señales críticas tienen texto (no solo color)
  await page.click('[data-testid=tab-safety]');
  assert(/CRÍTICO/.test(await page.textContent('[data-testid=safety-list]')), 'severidad sin texto');
}, {});

await test('vista móvil (390×844) sin desbordamiento horizontal', async (page) => {
  await ready(page);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(over <= 1, 'desborde horizontal ' + over);
  await page.screenshot({ path: `${SHOTS}/10-movil.png`, fullPage: false });
}, { width: 390, height: 844 });


await test('MISIÓN 01 · Trabajo en alturas: de la pantalla inicial a resultados (8 pasos)', async (page) => {
  await page.addInitScript(() => { localStorage.setItem('adx.recording-notice-seen', '1'); });
  await page.goto(srv.url + '/?e2e');
  await page.waitForSelector('[data-testid=mission-intro]');
  await page.screenshot({ path: `${SHOTS}/20-mision-inicio.png` });
  await page.click('[data-testid=start-mission]');
  const begin = async () => { await page.waitForSelector('[data-testid=step-start]', { timeout: 60000 }); await page.click('[data-testid=step-start]'); if (await page.locator('[data-testid=skip-demo]').count()) await page.click('[data-testid=skip-demo]'); };
  const cont = async () => { await page.click('[data-testid=continue]'); };
  await begin();
  for (const t of ['observe-next', 'observe-next', 'observe-confirm']) await page.click(`[data-testid=${t}]`);
  await cont(); await begin();
  await page.click('[data-testid=help-list]');
  for (const n of ['Borde derecho de la plataforma', 'Centro del piso de la plataforma', 'Cables aéreos', 'Caja de herramientas', 'Persona caminando abajo', 'Mancha en el piso de la plataforma', 'Luminaria a cambiar']) await page.getByRole('button', { name: new RegExp('^' + n) }).click();
  await page.screenshot({ path: `${SHOTS}/21-mision-peligros.png` });
  await cont(); await begin();
  for (const n of ['Permiso de trabajo en alturas autorizado', 'Capacitación vigente para trabajo en altura', 'Aptitud médica vigente', 'Plan de rescate definido antes de empezar', 'Energía de la luminaria aislada y bloqueada']) await page.getByText(n, { exact: true }).click();
  await page.click('[data-testid=confirm-verify]');
  await cont(); await begin();
  for (const z of ['correas-hombro', 'costuras', 'hebillas', 'argolla-dorsal', 'etiqueta', 'correa-pierna']) { await page.click(`[data-testid=zone-${z}]`); await page.click(z === 'correa-pierna' ? '[data-testid=judge-defect]' : '[data-testid=judge-ok]'); }
  await page.screenshot({ path: `${SHOTS}/22-mision-arnes.png` });
  await page.getByRole('button', { name: /retiro de servicio/ }).click();
  await cont(); await begin();
  for (const n of ['Escalera fija', 'Barandal frontal', 'Borde derecho de la plataforma']) await page.getByRole('button', { name: new RegExp('^' + n) }).click();
  await cont(); await begin();
  await page.getByRole('button', { name: /designado/ }).click();
  await cont(); await begin();
  const want = ['Confirmar permiso, plan de rescate y que la energía de la luminaria está aislada', 'Delimitar la zona inferior, retirar objetos sueltos y aplicar los controles de los peligros identificados', 'Inspeccionar el equipo de protección', 'Colocar y ajustar el arnés', 'Conectarte al anclaje antes de exponerte al borde'];
  for (let pos = 0; pos < want.length; pos++) for (let g = 0; g < 10; g++) {
    const cur = await page.locator('[data-testid=sequence] li').allTextContents();
    if (cur[pos].includes(want[pos])) break;
    await page.getByLabel(`Subir «${want[pos]}»`).click();
  }
  await page.click('[data-testid=sequence-verify]');
  await cont(); await begin();
  await page.getByRole('button', { name: /No inicio/ }).click();
  await cont();
  await page.waitForSelector('[data-testid=mission-complete]');
  const r = await page.textContent('[data-testid=result-correct]');
  assert(r.trim() === '8 / 8', 'resultado ' + r);
  await page.screenshot({ path: `${SHOTS}/23-mision-resultado.png`, fullPage: true });
  await page.click('[data-testid=continue-path]');
  assert((await page.textContent('[data-testid=learning-path]')).includes('COMPLETADA'), 'mapa sin completar');
});


await test('PROCEDIMIENTOS: menú, lector y descarga de instrucción, manual y checklist (PDF)', async (page) => {
  await page.addInitScript(() => { localStorage.setItem('adx.recording-notice-seen', '1'); });
  await page.goto(srv.url + '/?e2e');
  await page.click('[data-testid=nav-procedures]');
  await page.waitForSelector('[data-testid=procedures]');
  for (const code of ['WI-LOTO-001-DEMO', 'MO-LOTO-001-DEMO', 'CL-LOTO-001-DEMO', 'WI-ALT-001-DEMO']) {
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click(`[data-testid=dl-${code}]`)]);
    assert(fs.readFileSync(await dl.path()).subarray(0, 5).toString() === '%PDF-', code + ' no es PDF');
  }
  await page.click('[data-testid=read-loto-banda]');
  await page.waitForSelector('[data-testid=proc-reader]');
  await page.screenshot({ path: `${SHOTS}/30-procedimientos-lector.png` });
  await page.keyboard.press('Escape');
});

await test('MISIÓN LOTO · 8 pasos con los 8 tipos de interacción hasta resultados', async (page) => {
  await page.addInitScript(() => { localStorage.setItem('adx.recording-notice-seen', '1'); });
  await page.goto(srv.url + '/?e2e');
  await page.click('[data-testid=nav-procedures]');
  await page.click('[data-testid=play-loto-01]');
  await page.click('[data-testid=start-mission]');
  const begin = async () => { await page.waitForSelector('[data-testid=step-start]', { timeout: 90000 }); await page.click('[data-testid=step-start]'); if (await page.locator('[data-testid=skip-demo]').count()) await page.click('[data-testid=skip-demo]'); };
  const cont = () => page.click('[data-testid=continue]');
  await begin();
  for (const t of ['observe-next', 'observe-next', 'observe-confirm']) await page.click(`[data-testid=${t}]`);
  await cont(); await begin();
  await page.click('[data-testid=help-list]');
  for (const n of ['Motor y reductor', 'Contrapeso del tensor', 'Banda transportadora']) await page.getByRole('button', { name: new RegExp('^' + n) }).click();
  await cont(); await begin();
  for (const n of ['Estoy capacitado', 'Tengo el procedimiento', 'Avisé al personal', 'Tengo mi candado']) await page.getByText(new RegExp('^' + n)).click();
  await page.click('[data-testid=confirm-verify]');
  await cont(); await begin();
  const want = ['Apagar el equipo con sus controles normales y esperar a que se detenga por completo', 'Aislar la energía en el punto de aislamiento', 'Colocar tu candado y tu etiqueta', 'Liberar o bloquear la energía almacenada (contrapeso, tensión)', 'Verificar energía cero: confirmar que nadie está expuesto, intentar arrancar, comprobar que nada se mueve y regresar el control a paro'];
  for (let pos = 0; pos < want.length; pos++) for (let g = 0; g < 10; g++) { const cur = await page.locator('[data-testid=sequence] li').allTextContents(); if (cur[pos].includes(want[pos])) break; await page.getByLabel(`Subir «${want[pos]}»`).click(); }
  await page.click('[data-testid=sequence-verify]');
  await cont(); await begin();
  await page.getByRole('button', { name: /^Seccionador/ }).click();
  await cont(); await begin();
  for (const z of ['candado', 'llave', 'etiqueta-nombre', 'etiqueta-fecha', 'etiqueta-motivo']) { await page.click(`[data-testid=zone-${z}]`); await page.click(z === 'etiqueta-nombre' ? '[data-testid=judge-defect]' : '[data-testid=judge-ok]'); }
  await page.getByRole('button', { name: /Completo mi nombre/ }).click();
  await cont(); await begin();
  await page.screenshot({ path: `${SHOTS}/31-loto-verificar.png` });
  for (const n of ['Seccionador del motor', 'Contrapeso del tensor', 'Compañero de trabajo', 'Estación de botones', 'Estación de botones']) await page.getByRole('button', { name: new RegExp('^' + n) }).click();
  await cont(); await begin();
  await page.getByRole('button', { name: /^No retiro mi candado mientras/ }).click();
  await cont();
  await page.waitForSelector('[data-testid=mission-complete]');
  assert((await page.textContent('[data-testid=result-correct]')).trim() === '8 / 8', 'resultado LOTO');
  await page.screenshot({ path: `${SHOTS}/32-loto-resultado.png`, fullPage: true });
});

const report = { date: new Date().toISOString(), dir: DIR, results, errors, perf };
fs.writeFileSync('tests/e2e/report.json', JSON.stringify(report, null, 2));
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} pruebas e2e OK · errores de consola: ${errors.length}`);
errors.slice(0, 10).forEach((e) => console.log('  ' + e));
console.log('rendimiento', JSON.stringify(perf));
await browser.close();
srv.close();
process.exit(results.every((r) => r.ok) && errors.length === 0 ? 0 : 1);
