// Genera la presentación de capacitación (estándar AMMX /presentacion) y la guía del instructor
// a partir de <CODIGO>/contenido.json.
// Uso: AMMX_LIB=/ruta/ammx-presentaciones/scripts/am_brand.js PNG_DIR=/ruta/png node build_deck.js <carpeta-proceso> [...]
const fs = require('fs'), path = require('path');
const AM = require(process.env.AMMX_LIB);
const { C, T, deck } = AM;
const PNG_DIR = process.env.PNG_DIR;
const sharp = require('sharp');

const clip = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');
const hasPend = (s) => /\[(Validar|Supuesto|Verificar)/i.test(s || '');

async function figSize(file) {
  const m = await sharp(file).metadata();
  return { w: m.width, h: m.height };
}
async function addFigure(s, file, x, y, maxW, maxH) {
  const { w, h } = await figSize(file);
  const r = Math.min(maxW / w, maxH / h);
  const iw = w * r, ih = h * r;
  s.addImage({ path: file, x: x + (maxW - iw) / 2, y: y + (maxH - ih) / 2, w: iw, h: ih });
}
function notes(s, como, cerrar, pend) {
  let t = 'CÓMO EXPLICARLA: ' + como + '\n\nPUNTOS A CERRAR: ' + cerrar;
  if (pend && pend.length) t += '\n\n[POR CONFIRMAR] ' + pend.join(' · ');
  s.addNotes(t);
}

async function build(dir) {
  const J = JSON.parse(fs.readFileSync(path.join(dir, 'contenido.json'), 'utf8'));
  const pres = AM.newPres({ title: `${J.code} — ${J.title} · Capacitación` });
  const SRC = `Fuente: manual ${J.code} v${J.manual_version.split(' ')[0]} (Borrador para validación) y FT-ACE-001 v0.3. Material de capacitación; no sustituye al manual.`;
  const tt = J.titulos;
  let page = 1;
  const pend = J.por_confirmar || [];
  const ic = async (n) => AM.icon('fa', n);

  // 1 · Portada
  const cv = deck.cover(pres, {
    eyebrow: `Capacitación técnica · ${J.serie} · ${J.code}`,
    title: J.titulo_corto || J.title,
    subtitle: J.subtitle,
    kpis: J.kpis,
    chain: J.cadena.slice(0, 6),
    audience: J.audiencia,
    source: SRC,
  });
  notes(cv, `Objetivo del curso: ${J.subtitle}. Principio rector: ${J.principio}`, 'Presentar a los participantes, el objetivo y la ruta de certificación (teoría → OJT → evaluación práctica).', pend);

  // 2 · Objetivos y por qué importa
  let s = deck.slide(pres, { num: 1, section: 'Objetivos de aprendizaje', title: tt.objetivos, page: ++page, source: SRC });
  const oi = await Promise.all(['FaClipboardCheck', 'FaUserShield', 'FaFlask', 'FaStopwatch'].map(ic));
  J.objetivos.slice(0, 4).forEach((o, i) => deck.iconRow(s, 0.6, 1.7 + i * 1.28, 6.3, { color: AM.SEQ_DECK[i * 2], iconData: oi[i], title: clip(o.titulo, 48), body: clip(o.detalle, 150) }));
  let py = deck.panel(s, 7.3, 1.6, 5.45, 5.2, 'Por qué importa');
  T(s, J.por_que_importa, { x: 7.6, y: py, w: 4.85, h: 2.6, font: AM.F.deck, fontSize: 12, color: C.navy });
  deck.takeaway(s, 7.6, py + 2.9, 4.85, J.principio, { h: 1.0 });
  notes(s, 'Leer cada objetivo como una conducta observable que se evaluará en campo.', 'Confirmar que cada participante sabe en qué rol ejecutará el proceso.');

  // 3 · Roles
  s = deck.slide(pres, { num: 2, section: 'Roles y responsabilidades', title: tt.roles, page: ++page, source: SRC });
  deck.table(s, 0.6, 1.65, 12.15, J.roles.slice(0, 9), { colW: [3.7, 7.35, 1.1], fontSize: 11, rowH: 0.52 });
  notes(s, 'R = ejecuta · A = dueño y responsable final · C = consultado · I = informado.', 'Cada participante identifica su renglón y a quién escala.');

  // 4 · Flujo
  s = deck.slide(pres, { num: 3, section: 'El proceso', title: tt.flujo, page: ++page, source: SRC });
  const fl = J.flujo.slice(0, 9);
  deck.chevrons(s, 0.6, 1.85, 12.15, fl.map((f) => clip(f.label, 22)), { descs: fl.map((f) => clip(f.desc, 60)), h: 0.7 });
  py = deck.panel(s, 0.6, 4.05, 12.15, 2.75, 'Principio del proceso');
  deck.takeaway(s, 0.9, py + 0.05, 11.5, J.flujo_takeaway || J.principio, { h: 0.7 });
  T(s, J.principio, { x: 0.9, y: py + 0.95, w: 11.5, h: 0.9, font: AM.F.deck, fontSize: 14, color: C.navy });
  notes(s, 'Recorrer el flujo de izquierda a derecha; señalar las compuertas de decisión.', 'Qué pasa si una condición previa no se cumple: no se avanza.');

  // 5–6 · Figuras
  for (const [i, f] of (J.figuras || []).slice(0, 2).entries()) {
    const file = path.join(PNG_DIR, f.svg.replace(/\.svg$/, '.png'));
    s = deck.slide(pres, { num: 3, section: 'El proceso', title: f.titulo || tt.figura, page: ++page, source: SRC + ` Figura: ${f.svg}.` });
    if (fs.existsSync(file)) await addFigure(s, file, 0.6, 1.55, 7.4, 5.3);
    py = deck.panel(s, 8.25, 1.6, 4.5, 5.2, 'Lectura');
    deck.bullets(s, 8.5, py, 4.0, 4.3, f.lectura.slice(0, 4), { fontSize: 11 });
    notes(s, 'Usar la figura para ubicar cada componente en planta.', 'Pedir a un participante que explique la figura con sus palabras.');
  }

  // 7 · Equipos
  s = deck.slide(pres, { num: 4, section: 'Equipos y maquinaria', title: tt.equipos, page: ++page, source: SRC });
  deck.table(s, 0.6, 1.65, 12.15, J.equipos.slice(0, 8), { colW: [2.6, 3.0, 3.6, 2.95], fontSize: 10, rowH: 0.52, highlightCol: 3 });
  notes(s, 'La columna resaltada es lo que se verifica ANTES de operar.', 'Equipo que no pasa la verificación = no se opera; se reporta.', J.equipos.flat().filter(hasPend).length ? ['Especificaciones marcadas en la tabla'] : []);

  // 8 · Parámetros
  s = deck.slide(pres, { num: 5, section: 'Parámetros de operación', title: tt.parametros, page: ++page, source: SRC });
  deck.table(s, 0.6, 1.65, 12.15, J.parametros.slice(0, 9), { colW: [2.55, 1.9, 2.25, 2.3, 3.15], fontSize: 10, rowH: 0.48, highlightCol: 4 });
  if (J.parametros_nota) AM.porConfirmar(s, 0.6, 6.45, 12.15, J.parametros_nota, { font: AM.F.deck, h: 0.4, fontSize: 9.5 });
  notes(s, 'Leer cada renglón: objetivo, rango normal, alarma y la acción (columna resaltada).', 'Ejercicio: dar un valor fuera de rango y pedir la acción correcta.', J.parametros_nota ? [J.parametros_nota] : []);

  // 9 · Seguridad: controles críticos + EPP
  s = deck.slide(pres, { num: 6, section: 'Seguridad', title: tt.seguridad, page: ++page, source: SRC + ' Serie MS-ACE.' });
  const si = await Promise.all(['FaExclamationTriangle', 'FaTint', 'FaHardHat', 'FaWind'].map(ic));
  J.seguridad.controles.slice(0, 4).forEach((c, i) => deck.iconRow(s, 0.6, 1.7 + i * 1.28, 6.6, { color: [C.coral, AM.SEQ_DECK[4], AM.SEQ_DECK[6], C.steel][i], iconData: si[i], title: '★ ' + clip(c.titulo, 45), body: clip(c.detalle, 160) }));
  py = deck.panel(s, 7.6, 1.6, 5.15, 5.2, 'EPP obligatorio');
  deck.bullets(s, 7.9, py, 4.6, 4.3, J.seguridad.epp.slice(0, 7), { fontSize: 11 });
  notes(s, 'Los controles con ★ son críticos: si fallan puede haber una fatalidad. Se evalúan en la certificación.', 'Cualquier persona puede y debe detener el trabajo si un control crítico no está.');

  if (J.seguridad.figura) {
    const file = path.join(PNG_DIR, J.seguridad.figura.replace(/\.svg$/, '.png'));
    s = deck.slide(pres, { num: 6, section: 'Seguridad', title: J.seguridad.figura_titulo || tt.seguridad, page: ++page, source: SRC + ` Figura: ${J.seguridad.figura}.` });
    if (fs.existsSync(file)) await addFigure(s, file, 0.6, 1.55, 7.4, 5.3);
    py = deck.panel(s, 8.25, 1.6, 4.5, 5.2, 'Lectura');
    deck.bullets(s, 8.5, py, 4.0, 4.3, (J.seguridad.figura_lectura || []).slice(0, 4), { fontSize: 11 });
    notes(s, 'Ubicar en la figura dónde está cada persona durante el proceso.', 'Distancias y rutas de escape: preguntar a cada participante la suya.');
  }

  // 10 · Calidad
  s = deck.slide(pres, { num: 7, section: 'Calidad', title: tt.calidad, page: ++page, source: SRC });
  deck.table(s, 0.6, 1.65, 12.15, J.calidad.slice(0, 7), { colW: [2.8, 3.1, 3.3, 2.95], fontSize: 10.5, rowH: 0.5 });
  if (J.calidad_takeaway) deck.takeaway(s, 0.6, 6.15, 12.15, J.calidad_takeaway, { h: 0.6 });
  notes(s, 'Relacionar cada variable con el defecto que causa aguas abajo.', 'Quién registra cada variable y dónde.');

  // 11+ · Paso a paso (7 por lámina)
  const P = J.pasos;
  const per = 7, np = Math.ceil(P.length / per);
  for (let k = 0; k < np; k++) {
    const chunk = P.slice(k * per, (k + 1) * per);
    s = deck.slide(pres, { num: 8, section: 'Paso a paso', title: np > 1 ? `${tt.pasos} (${k + 1}/${np})` : tt.pasos, page: ++page, source: SRC + ' ★ = paso crítico, se evalúa en la certificación.' });
    const rows = [['#', 'Paso', 'Cómo hacerlo y qué medir', 'Criterio', 'Rol']].concat(chunk.map((p) => {
      const hl = p.critico ? { fill: { color: C.peach } } : {};
      return [
        { text: (p.critico ? '★ ' : '') + p.n, options: hl }, { text: clip(p.paso, 40), options: Object.assign({ bold: true }, hl) },
        { text: clip(p.como, 130), options: hl }, { text: clip(p.criterio, 50), options: hl }, { text: clip(p.rol, 22), options: hl },
      ];
    }));
    deck.table(s, 0.6, 1.65, 12.15, rows, { colW: [0.65, 2.35, 5.55, 2.25, 1.35], fontSize: 10, rowH: 0.6 });
    notes(s, 'Leer cada paso y demostrar en campo o simulador los pasos ★ (renglones resaltados).', 'Los pasos ★ no se omiten ni se cambian de orden.');
  }

  // Condiciones anormales
  s = deck.slide(pres, { num: 9, section: 'Condiciones anormales', title: tt.anormales, page: ++page, source: SRC + ' Serie MS-ACE-09 para emergencias.' });
  deck.table(s, 0.6, 1.65, 12.15, J.anormales.slice(0, 9), { colW: [3.0, 7.0, 2.15], fontSize: 10, rowH: 0.52, highlightCol: 1 });
  notes(s, 'Practicar cada renglón como simulacro de mesa: síntoma → acción → a quién avisar.', 'Nadie improvisa: si no está aquí, se detiene y se escala al supervisor.');

  // Competencia (ILUO)
  s = deck.slide(pres, { num: 10, section: 'Competencia y certificación', title: tt.competencia, page: ++page, source: SRC + ' TD-P07. ILUO: I Introducción · L Práctica supervisada · U Ejecución autónoma · O Dominio e instrucción.' });
  Object.entries(AM.ILUO).forEach(([k, v], i) => {
    const x = 0.6 + i * 1.72, on = k === J.competencia.iluo;
    AM.circle(s, x, 1.7, 0.55, on ? v.color : 'D6D8EA', k, { font: AM.F.deck, fontSize: 16 });
    T(s, v.name, { x: x + 0.6, y: 1.66, w: 1.05, h: 0.65, font: AM.F.deck, fontSize: 7.5, bold: on, color: on ? C.navy : C.slate2, valign: 'middle' });
  });
  deck.table(s, 0.6, 2.6, 7.2, J.competencia.roles.slice(0, 7), { colW: [2.3, 0.65, 1.2, 1.9, 1.15], fontSize: 9.5, rowH: 0.42 });
  py = deck.panel(s, 8.1, 1.6, 4.65, 5.2, 'Pasos ★ que se evalúan');
  deck.bullets(s, 8.4, py, 4.1, 4.4, J.competencia.checklist.slice(0, 6), { fontSize: 10.5 });
  notes(s, `Nivel requerido: ${J.competencia.iluo} (${AM.ILUO[J.competencia.iluo].name}). La evaluación es práctica, ante evaluador certificado, sobre los pasos ★.`, 'Quien no demuestra todos los pasos ★ queda "aún no competente" y repite OJT dirigido.');

  // Ruta de certificación (timeline)
  s = deck.slide(pres, { num: 10, section: 'Competencia y certificación', title: 'De la teoría a la certificación en seis pasos', page: ++page, source: SRC + ' Registro de competencia en IMaS; constancia DC-3/SIRCE (obligación STPS).' });
  const r0 = J.competencia.roles[1] || [];
  deck.timeline(s, 0.6, 1.9, 12.15, [
    { label: 'Teoría', date: r0[2] || '' }, { label: 'Autoevaluación', date: '≥ 80 %' }, { label: 'OJT supervisado', date: r0[3] || '' },
    { label: 'Evaluación práctica ★', date: '100 % pasos ★' }, { label: 'Registro IMaS y DC-3/SIRCE', date: '≤ 10 días hábiles' }, { label: 'Recertificación', date: r0[4] || '' },
  ]);
  py = deck.panel(s, 0.6, 3.75, 12.15, 3.05, 'Reglas de la certificación');
  deck.bullets(s, 0.9, py, 11.5, 2.3, [
    'La certificación vale solo para el proceso y el rol evaluados; se suspende tras un incidente grave hasta reevaluar.',
    'El trabajador con experiencia puede solicitar la evaluación directa como examen de suficiencia (LFT art. 153-U).',
    'Sin certificación vigente no se ejecuta la tarea crítica: el permiso de trabajo lo bloquea.',
  ], { fontSize: 11 });
  notes(s, 'Explicar la ruta completa y los tiempos.', 'Aclarar que la evaluación no es sanción: es la evidencia de que la persona puede trabajar segura.');

  // Autoevaluación
  s = deck.slide(pres, { num: 10, section: 'Autoevaluación', title: tt.quiz, page: ++page, source: SRC + ' Respuestas en las notas del orador.' });
  J.quiz.slice(0, 5).forEach((q, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 0.6 + col * 4.1, y = 1.6 + row * 2.65;
    deck.card(s, x, y, 3.95, 2.5, { tag: `Pregunta ${i + 1}`, color: AM.SEQ_DECK[i + 1], title: clip(q.pregunta, 95), body: q.opciones.map((o, j) => `${'abc'[j]}) ${o}`).join('\n') });
  });
  const ci = await ic('FaCheckCircle');
  deck.card(s, 0.6 + 2 * 4.1, 1.6 + 2.65, 3.95, 2.5, { tag: 'Criterio', iconData: ci, color: C.steel, tagColor: C.steel, title: 'Mínimo 4 de 5 correctas', body: 'Con 4 o más pasas al OJT supervisado. Con menos, repasa el manual con tu instructor y repite la autoevaluación.' });
  s.addNotes('RESPUESTAS:\n' + J.quiz.map((q, i) => `${i + 1}) ${'abc'[q.correcta]}) ${q.opciones[q.correcta]} — ${q.explicacion}`).join('\n') + '\n\nCÓMO EXPLICARLA: dar 5 minutos; revisar en grupo. PUNTOS A CERRAR: mínimo 4 de 5 correctas para pasar a OJT.');

  // Cierre
  const cl = deck.closing(pres, { num: 11, section: 'Cierre', title: tt.cierre, page: ++page, items: J.reglas.slice(0, 4).map((r) => ({ title: clip(r.titulo, 52), body: clip(r.detalle, 110) })),
    note: `Siguiente paso: OJT supervisado y evaluación práctica (TD-P07); registro en IMaS y DC-3/SIRCE. Validación: ${valLine(J)}.` });
  notes(cl, 'Cerrar con las reglas que no se negocian; cada participante repite la regla más importante para su rol.', 'Agendar OJT con el supervisor y el evaluador.', pend);

  const out = path.join(dir, `${J.code}_Capacitacion_AMMX.pptx`);
  await pres.writeFile({ fileName: out });
  fs.writeFileSync(path.join(dir, `${J.code}_Guia-Instructor.md`), guide(J));
  return out;
}

function valLine(J) {
  const v = J.validacion || {};
  const k = [['tecnica', 'técnica'], ['seguridad', 'seguridad'], ['laboral', 'laboral'], ['documentacion', 'diseño instruccional']];
  const ok = k.filter(([a]) => v[a] && /visto bueno/i.test(v[a])).map(([, b]) => b);
  return ok.length ? 'visto bueno ' + ok.join(', ') + (ok.length < 4 ? ' (pendientes: ' + k.filter(([a]) => !(v[a] && /visto bueno/i.test(v[a]))).map(([, b]) => b).join(', ') + ')' : '') : 'pendiente';
}
function mdTable(rows) {
  const esc = (c) => String(c).replace(/\|/g, '\\|');
  return [rows[0].map(esc).join(' | '), rows[0].map(() => '---').join(' | '), ...rows.slice(1).map((r) => r.map(esc).join(' | '))].map((l) => `| ${l} |`).join('\n');
}
function guide(J) {
  const L = [];
  L.push(`# ${J.code} — ${J.title}`, '', '## Guía del instructor y contenido del curso', '');
  L.push(mdTable([['Campo', 'Valor'], ['Proceso', `${J.code} — ${J.title}`], ['Área', J.area], ['Serie', J.serie], ['Manual base', `\`${J.manual}\` v${J.manual_version}`], ['Audiencia', J.audiencia], ['Presentación', `${J.code}_Capacitacion_AMMX.pptx (estándar AMMX)`], ['Estado', 'Borrador para validación: no se usa en planta hasta validar los valores marcados']]), '');
  L.push('## 1. Objetivo del curso', '', J.subtitle, '', `**Principio rector:** ${J.principio}`, '', `**Por qué importa:** ${J.por_que_importa}`, '');
  L.push('## 2. Objetivos de aprendizaje', '', ...J.objetivos.map((o, i) => `${i + 1}. **${o.titulo}.** ${o.detalle}`), '');
  if (J.plan_sesion) L.push('## 3. Plan de sesión', '', mdTable(J.plan_sesion), '');
  L.push('## 4. Contenido clave', '', '### 4.1 Roles', '', mdTable(J.roles), '', '### 4.2 Flujo del proceso', '', ...J.flujo.map((f, i) => `${i + 1}. **${f.label}:** ${f.desc}`), '');
  L.push('### 4.3 Equipos', '', mdTable(J.equipos), '', '### 4.4 Parámetros', '', mdTable(J.parametros), '');
  if (J.parametros_nota) L.push(`> ${J.parametros_nota}`, '');
  L.push('### 4.5 Seguridad: controles críticos', '', ...J.seguridad.controles.map((c) => `- ★ **${c.titulo}:** ${c.detalle}`), '', `**EPP:** ${J.seguridad.epp.join(' · ')}`, '');
  L.push('### 4.6 Calidad', '', mdTable(J.calidad), '');
  L.push('### 4.7 Paso a paso', '', mdTable([['#', 'Paso', 'Cómo hacerlo y qué medir', 'Criterio', '★', 'Rol'], ...J.pasos.map((p) => [p.n, p.paso, p.como, p.criterio, p.critico ? '★' : '', p.rol])]), '');
  L.push('### 4.8 Condiciones anormales', '', mdTable(J.anormales), '');
  L.push('## 5. Evaluación', '', '### 5.1 Autoevaluación teórica (mínimo 4 de 5 correctas)', '');
  J.quiz.forEach((q, i) => { L.push(`${i + 1}. ${q.pregunta}`, ...q.opciones.map((o, j) => `   ${'abc'[j]}) ${o}`), ''); });
  L.push('**Clave de respuestas:**', '', ...J.quiz.map((q, i) => `${i + 1}. ${'abc'[q.correcta]}) ${q.opciones[q.correcta]} — ${q.explicacion}`), '');
  L.push('### 5.2 Evaluación práctica de competencia (TD-P07)', '', `Nivel requerido: **${J.competencia.iluo}** (escala ILUO).`, '', mdTable(J.competencia.roles), '', 'Lista de verificación de pasos ★ (todos deben demostrarse correctamente):', '', ...J.competencia.checklist.map((c) => `- [ ] ${c}`), '');
  L.push('Resultado: ☐ Competente (registro en IMaS y DC-3/SIRCE en ≤ 10 días hábiles) · ☐ Aún no competente (OJT dirigido y nueva evaluación).', '');
  L.push('## 6. Reglas que no se negocian', '', ...J.reglas.map((r) => `- **${r.titulo}.** ${r.detalle}`), '');
  if (J.por_confirmar && J.por_confirmar.length) L.push('## 7. Por confirmar', '', ...J.por_confirmar.map((p) => `- ${p}`), '');
  L.push('## 8. Validación', '', mdTable([['Revisión', 'Responsable', 'Estado'], ['Técnica (operación, metalurgia y control de proceso)', 'experto-operativo-metalurgia', J.validacion?.tecnica || 'Pendiente'], ['Seguridad', 'experto-seguridad-salud', J.validacion?.seguridad || 'Pendiente'], ['Laboral (roles, certificación, escalafón)', 'experto-relaciones-laborales', J.validacion?.laboral || 'Pendiente'], ['Diseño instruccional y formato', 'experto-documentacion-mejora', J.validacion?.documentacion || 'Pendiente'], ['Aprobación', 'Director de C&D', 'Pendiente']]), '');
  return L.join('\n') + '\n';
}

(async () => {
  for (const d of process.argv.slice(2)) {
    try { console.log('OK  ', await build(path.resolve(d))); } catch (e) { console.log('FAIL', d, e.message); }
  }
})();
