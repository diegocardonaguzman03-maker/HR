// Capturas de la Misión 01 para revisión (docs/missions/shots). Requiere `vite build`.
import { serve } from '../tests/e2e/serve.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? '/opt/node22/lib/node_modules/playwright/index.mjs');
const OUT = 'docs/missions/shots';
const srv = await serve('dist');
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const run = async (vp, prefix) => {
  const p = await b.newPage({ viewport: vp });
  await p.addInitScript(() => { localStorage.setItem('adx.recording-notice-seen', '1'); });
  await p.goto(srv.url + '/');
  await p.waitForSelector('[data-testid=mission-intro]');
  await p.screenshot({ path: `${OUT}/${prefix}00-inicio.png` });
  await p.click('[data-testid=start-mission]');
  const begin = async (shot) => { await p.waitForSelector('[data-testid=step-start]', { timeout: 90000 }); await p.waitForTimeout(800); if (shot) await p.screenshot({ path: `${OUT}/${prefix}${shot}` }); await p.click('[data-testid=step-start]'); };
  const skip = async (shot) => { await p.waitForTimeout(1800); if (shot) await p.screenshot({ path: `${OUT}/${prefix}${shot}` }); if (await p.locator('[data-testid=skip-demo]').count()) await p.click('[data-testid=skip-demo]'); await p.waitForTimeout(1300); };
  const cont = () => p.click('[data-testid=continue]');
  await begin('01-intro-paso.png');
  for (const t of ['observe-next', 'observe-next', 'observe-confirm']) { await p.click(`[data-testid=${t}]`); await p.waitForTimeout(400); }
  await cont(); await begin('02a-intro-peligros.png'); await skip('02b-demostracion.png');
  await p.screenshot({ path: `${OUT}/${prefix}02c-peligros-tocables.png` });
  await p.click('[data-testid=help-list]');
  for (const n of ['Borde derecho de la plataforma', 'Centro del piso de la plataforma', 'Cables aéreos']) await p.getByRole('button', { name: new RegExp('^' + n) }).click();
  await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/${prefix}02d-peligros-avance.png` });
  for (const n of ['Caja de herramientas', 'Persona caminando abajo', 'Mancha en el piso de la plataforma', 'Luminaria a cambiar']) await p.getByRole('button', { name: new RegExp('^' + n) }).click();
  await cont(); await begin(); await skip();
  for (const n of ['Permiso de trabajo en alturas autorizado', 'Capacitación vigente para trabajo en altura', 'Aptitud médica vigente', 'Plan de rescate definido antes de empezar', 'Energía de la luminaria aislada y bloqueada']) await p.getByText(n, { exact: true }).click();
  await p.click('[data-testid=confirm-verify]'); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/${prefix}03-requisitos.png` });
  await cont(); await begin(); await skip();
  await p.click('[data-testid=zone-correa-pierna]'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${prefix}04a-arnes-juzgar.png` });
  await p.click('[data-testid=judge-defect]'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${prefix}04b-arnes-dano.png` });
  for (const z of ['correas-hombro', 'costuras', 'hebillas', 'argolla-dorsal', 'etiqueta']) { await p.click(`[data-testid=zone-${z}]`); await p.click('[data-testid=judge-ok]'); }
  await p.getByRole('button', { name: /retiro de servicio/ }).click();
  await cont(); await begin(); await skip('05a-demo-acceso.png');
  for (const n of ['Escalera fija', 'Barandal frontal', 'Borde derecho de la plataforma']) await p.getByRole('button', { name: new RegExp('^' + n) }).click();
  await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/${prefix}05b-acceso.png` });
  await cont(); await begin(); await skip();
  await p.getByRole('button', { name: /Tubo conduit/ }).click(); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/${prefix}06a-anclaje-error.png` });
  await p.getByRole('button', { name: /designado/ }).click(); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/${prefix}06b-anclaje.png` });
  await cont(); await begin(); await skip();
  await p.click('[data-testid=sequence-verify]'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${prefix}07-orden-error.png` });
  const want = ['Confirmar permiso, plan de rescate y que la energía de la luminaria está aislada', 'Delimitar la zona inferior, retirar objetos sueltos y aplicar los controles de los peligros identificados', 'Inspeccionar el equipo de protección', 'Colocar y ajustar el arnés', 'Conectarte al anclaje antes de exponerte al borde'];
  for (let pos = 0; pos < want.length; pos++) for (let g = 0; g < 10; g++) { const cur = await p.locator('[data-testid=sequence] li').allTextContents(); if (cur[pos].includes(want[pos])) break; await p.getByLabel(`Subir «${want[pos]}»`).click(); }
  await p.click('[data-testid=sequence-verify]');
  await cont(); await begin(); await skip();
  await p.getByRole('button', { name: /es rápida/ }).click(); await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/${prefix}08-decision.png` });
  await p.getByRole('button', { name: /No inicio/ }).click();
  await cont(); await p.waitForSelector('[data-testid=mission-complete]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${prefix}09-resultado.png`, fullPage: true });
  await p.click('[data-testid=continue-path]'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${prefix}10-mapa.png` });
  await p.close();
};
await run({ width: 1440, height: 860 }, '');
await run({ width: 390, height: 844 }, 'movil-');
await b.close(); srv.close();
console.log('capturas listas');
