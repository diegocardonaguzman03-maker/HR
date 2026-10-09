// Renderizadores de láminas PRAXIA (pptxgenjs, LAYOUT_WIDE 13.333 × 7.5 in).
// Lenguaje de instrumento (skill §14.5): rótulo mono con cuadrito índigo, corner ticks, retícula fina,
// pie «PRAXIA · sección · número». Grafito dominante, ivory para láminas densas, luz duotono en un solo punto.
import { PX, SLIDE, ASSET, LOCKUP_RATIO, SYMBOL_RATIO, DESCRIPTOR } from "./brand.mjs";
import { DEFAULTS } from "./schema.mjs";

const { mx: MX, cw: CW, right: RIGHT, w: SW } = SLIDE;

export function createRenderer(pres, F) {
  // ───────────────────────── primitivas ─────────────────────────
  const text = (s, t, o) => s.addText(t, { margin: 0, isTextBox: true, valign: "top", ...o });

  // Marcado ligero: *palabra* → índigo · ~palabra~ → clay · \n → salto de línea
  function rich(str, base) {
    const runs = [];
    const lines = String(str).split("\n");
    lines.forEach((line, li) => {
      const parts = line.split(/(\*[^*]+\*|~[^~]+~)/g).filter((p) => p !== "");
      if (!parts.length) parts.push(" ");
      parts.forEach((p, pi) => {
        let color = base.color, t = p;
        if (/^\*[^*]+\*$/.test(p)) { color = PX.indigo; t = p.slice(1, -1); }
        else if (/^~[^~]+~$/.test(p)) { color = PX.clay; t = p.slice(1, -1); }
        const o = { ...base, color };
        if (pi === parts.length - 1 && li < lines.length - 1) o.breakLine = true;
        runs.push({ text: t, options: o });
      });
    });
    return runs;
  }
  const len = (s) => String(s || "").replace(/[*~]/g, "").length;
  // Estimación conservadora de alto de texto (ajuste de línea por palabras) para encadenar bloques.
  const CHAR_EM = { display: 0.58, body: 0.52, mono: 0.62 };
  function lines(str, size, w, kind) {
    const cpl = Math.max(4, Math.floor((w * 72) / (size * CHAR_EM[kind])));
    let n = 0;
    for (const para of String(str).replace(/[*~]/g, "").split("\n")) {
      let cur = 0; n++;
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const add = (cur ? 1 : 0) + word.length;
        if (cur + add > cpl && cur) { n++; cur = word.length; } else cur += add;
      }
    }
    return n;
  }
  const titleH = (str, size, w) => (lines(str, size, w, "display") * size * 1.16) / 72;
  const bodyH = (str, size, w, ls = 1.2) => (lines(str, size, w, "body") * size * 1.2 * ls) / 72;
  const pick = (n, tiers) => { for (const [max, size] of tiers) if (n <= max) return size; return tiers[tiers.length - 1][1]; };

  function frame(s, slide, n, opts = {}) {
    const theme = slide.theme || DEFAULTS[slide.type].theme;
    const dark = theme === "dark";
    let glow = slide.glow || DEFAULTS[slide.type].glow;
    if (!dark) glow = "none";
    s.background = { path: glow !== "none" ? ASSET.bg[glow] : dark ? ASSET.bg.dark : ASSET.bg.ivory };
    const fg = dark ? PX.ivory : PX.graphite;
    const mute = dark ? PX.niebla : PX.muteLight;
    // pie
    text(s, "PRAXIA", { x: MX, y: 7.0, w: 1.0, h: 0.25, fontFace: F.mono, fontSize: 8, bold: true, charSpacing: 4, color: fg });
    const sec = opts.footer ?? slide.section ?? "";
    if (sec) text(s, `·   ${sec.toUpperCase()}`, { x: MX + 0.95, y: 7.0, w: 8, h: 0.25, fontFace: F.mono, fontSize: 8, charSpacing: 3, color: mute });
    if (n && !opts.noNumber) text(s, String(n).padStart(2, "0"), { x: RIGHT - 0.8, y: 7.0, w: 0.8, h: 0.25, fontFace: F.mono, fontSize: 8, color: mute, align: "right" });
    if (slide.label && !opts.noLabel) label(s, slide.label, dark);
    if (slide.notes) s.addNotes(slide.notes);
    return { dark, fg, mute, panel: dark ? PX.graphite2 : "FFFFFF", hair: dark ? PX.hair : PX.hairLight };
  }

  function label(s, t, dark, y = 0.55, x = MX) {
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.075, w: 0.09, h: 0.09, fill: { color: PX.indigo }, line: { color: PX.indigo, width: 0 } });
    text(s, t.toUpperCase(), { x: x + 0.2, y, w: 9, h: 0.25, fontFace: F.mono, fontSize: 9, charSpacing: 4, color: dark ? PX.violet : PX.indigo });
  }

  function ticks(s, x, y, w, h, c = PX.indigo, t = 0.16, width = 1.25) {
    const L = (x0, y0, ww, hh) => s.addShape(pres.shapes.LINE, { x: x0, y: y0, w: ww, h: hh, line: { color: c, width } });
    L(x, y, t, 0); L(x, y, 0, t); L(x + w - t, y, t, 0); L(x + w, y, 0, t);
    L(x, y + h, t, 0); L(x, y + h - t, 0, t); L(x + w - t, y + h, t, 0); L(x + w, y + h - t, 0, t);
  }
  const rect = (s, x, y, w, h, fill, line) =>
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: fill ? { color: fill } : { type: "none" }, line: line ? { color: line, width: 0.75 } : { type: "none" } });
  const hline = (s, x, y, w, color, width = 0.75, dash) =>
    s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width, ...(dash ? { dashType: dash } : {}) } });

  const titleStyle = (fg, size) => ({ fontFace: F.display, fontSize: size, bold: true, color: fg, lineSpacingMultiple: 0.95 });
  function title(s, str, x, y, w, h, fg, size) {
    text(s, rich(str, titleStyle(fg, size)), { x, y, w, h, fit: "none" });
  }
  const body = (fg, size = 15) => ({ fontFace: F.body, fontSize: size, color: fg, lineSpacingMultiple: 1.2 });

  // ───────────────────────── tipos de lámina ─────────────────────────
  const R = {};

  R.cover = (s, d, n, meta) => {
    const k = frame(s, d, n, { footer: meta.confidential === false ? "" : "Confidencial", noNumber: true, noLabel: true });
    const lh = 0.52;
    s.addImage({ path: ASSET.lockupIvory, x: MX - 0.02, y: 0.55, w: lh * LOCKUP_RATIO, h: lh, altText: "Praxia (logo provisional)" });
    text(s, DESCRIPTOR, { x: MX, y: 1.2, w: 6, h: 0.22, fontFace: F.mono, fontSize: 8, charSpacing: 5, color: PX.niebla });
    if (d.kicker) label(s, d.kicker, true, 2.25);
    const size = pick(len(d.title), [[28, 66], [46, 56], [64, 48]]);
    title(s, d.title, MX, 2.7, 10.6, 2.45, k.fg, size);
    if (d.subtitle) text(s, d.subtitle, { x: MX, y: 5.2, w: 8.4, h: 0.75, ...body(PX.niebla, 16) });
    const sector = d.preparedFor || meta.sector;
    text(s, [
      { text: "PREPARADO PARA  ·  ", options: { color: PX.niebla } },
      { text: sector.toUpperCase(), options: { color: PX.ivory, bold: true } },
    ], { x: MX, y: 6.35, w: 8, h: 0.28, fontFace: F.mono, fontSize: 10, charSpacing: 3 });
    text(s, (d.date || meta.date).toUpperCase(), { x: RIGHT - 4, y: 6.35, w: 4, h: 0.28, fontFace: F.mono, fontSize: 10, charSpacing: 3, color: PX.niebla, align: "right" });
  };

  R.section = (s, d, n) => {
    const k = frame(s, d, n);
    text(s, `—  ${d.number}`, { x: MX, y: 2.45, w: 3, h: 0.35, fontFace: F.mono, fontSize: 16, color: PX.violet, charSpacing: 2 });
    title(s, d.title, MX, 2.95, 10.4, 1.9, k.fg, pick(len(d.title), [[24, 60], [44, 50]]));
    if (d.kicker) text(s, d.kicker, { x: MX, y: 5.0, w: 8.6, h: 0.9, ...body(PX.niebla, 18) });
  };

  R.statement = (s, d, n) => {
    const k = frame(s, d, n);
    const size = pick(len(d.statement), [[50, 56], [85, 48], [120, 40]]);
    const th = titleH(d.statement, size, 10.9), sh = d.support ? bodyH(d.support, 17, 8.6) : 0;
    const block = th + (sh ? 0.45 + sh : 0);
    const y0 = Math.max(1.3, Math.min(3.75 - block / 2, 6.6 - block));
    title(s, d.statement, MX, y0, 10.9, th + 0.2, k.fg, size);
    if (d.support) text(s, d.support, { x: MX, y: y0 + th + 0.45, w: 8.6, h: sh + 0.15, ...body(k.dark ? PX.niebla : PX.muteLight, 17) });
  };

  R.content = (s, d, n) => {
    const k = frame(s, d, n);
    const ts = pick(len(d.title), [[36, 36], [64, 32]]), th = titleH(d.title, ts, 5.9);
    title(s, d.title, MX, 1.0, 5.9, th + 0.2, k.fg, ts);
    const by = 1.0 + th + 0.4;
    if (d.body) text(s, d.body, { x: MX, y: by, w: 5.6, h: 6.5 - by, ...body(k.fg, 15) });
    const pts = d.points || [];
    const x = 7.05, w = RIGHT - x, gap = 0.2, top = 1.0, bottom = 6.55;
    const h = pts.length ? (bottom - top - gap * (pts.length - 1)) / pts.length : 0;
    pts.forEach((p, i) => {
      const y = top + i * (h + gap);
      if (k.dark) rect(s, x, y, w, h, PX.graphite2);
      ticks(s, x, y, w, h, i === 0 ? PX.indigo : k.dark ? PX.hair : PX.hairLight);
      const ih = Math.min(h - 0.5, 1.4);
      const iy = y + (h - ih) / 2;
      text(s, String(i + 1).padStart(2, "0"), { x: x + 0.3, y: iy, w: 0.6, h: 0.3, fontFace: F.mono, fontSize: 10, color: k.dark ? PX.violet : PX.indigo });
      text(s, p.title, { x: x + 1.0, y: iy, w: w - 1.3, h: 0.4, fontFace: F.display, fontSize: 19, bold: true, color: k.fg });
      if (p.body) text(s, p.body, { x: x + 1.0, y: iy + 0.45, w: w - 1.3, h: ih - 0.45, ...body(k.dark ? PX.niebla : PX.muteLight, 14) });
    });
  };

  R.stats = (s, d, n) => {
    const k = frame(s, d, n);
    title(s, d.title, MX, 1.0, 11.6, 1.3, k.fg, pick(len(d.title), [[45, 36], [90, 30]]));
    const st = d.stats, gap = 0.3, top = 2.6, h = 3.75;
    const w = (CW - gap * (st.length - 1)) / st.length;
    st.forEach((it, i) => {
      const x = MX + i * (w + gap);
      if (k.dark) rect(s, x, top, w, h, PX.graphite2);
      ticks(s, x, top, w, h, k.dark ? PX.hair : PX.hairLight, 0.16, 1);
      const pending = len(it.value) > 8;
      if (pending) {
        rect(s, x + 0.3, top + 0.35, w - 0.6, 1.0, null, PX.clay);
        text(s, it.value, { x: x + 0.42, y: top + 0.42, w: w - 0.84, h: 0.86, fontFace: F.mono, fontSize: 12, bold: true, color: PX.clay, valign: "middle", charSpacing: 1 });
      } else {
        text(s, rich(it.value, { fontFace: F.display, fontSize: st.length > 3 ? 54 : 64, bold: true, color: k.fg }), { x: x + 0.3, y: top + 0.25, w: w - 0.5, h: 1.15, valign: "middle" });
      }
      text(s, it.label, { x: x + 0.3, y: top + 1.6, w: w - 0.6, h: 1.35, ...body(k.fg, 15), lineSpacingMultiple: 1.15 });
      text(s, /^\[/.test(it.source) ? it.source : `FUENTE · ${it.source}`, { x: x + 0.3, y: top + h - 0.75, w: w - 0.6, h: 0.6, fontFace: F.mono, fontSize: 8, color: k.mute, valign: "bottom", lineSpacingMultiple: 1.1 });
    });
    if (d.note) text(s, d.note, { x: MX, y: 6.5, w: CW, h: 0.3, ...body(k.mute, 11) });
  };

  R.gap = (s, d, n) => {
    const k = frame(s, d, n);
    const ts = pick(len(d.title), [[30, 42], [60, 34]]), th = titleH(d.title, ts, 5.9);
    title(s, d.title, MX, 1.0, 5.9, th + 0.2, k.fg, ts);
    const dy = Math.max(1.0 + th + 0.45, 2.6);
    if (d.definition) text(s, d.definition, { x: MX, y: dy, w: 5.6, h: 6.4 - dy, ...body(k.dark ? PX.niebla : PX.muteLight, 16) });
    // diagrama conceptual (sin datos)
    const base = 5.75, bw = 1.55, lx = 7.75, rxb = 10.35, topL = 1.55, topR = 3.95;
    hline(s, 7.3, base, 5.43, k.dark ? PX.niebla : PX.muteLight, 1);
    rect(s, lx, topL, bw, base - topL, k.dark ? PX.graphite2 : "FFFFFF", k.dark ? PX.niebla : PX.muteLight);
    rect(s, rxb, topR, bw, base - topR, k.fg);
    hline(s, lx + bw, topL, rxb + bw - (lx + bw), k.dark ? PX.niebla : PX.muteLight, 0.75, "dash");
    s.addShape(pres.shapes.RECTANGLE, { x: rxb, y: topL, w: bw, h: topR - topL - 0.06, fill: { type: "none" }, line: { color: PX.clay, width: 1.25, dashType: "dash" } });
    // corchete de la brecha
    const bx = rxb + bw + 0.18;
    s.addShape(pres.shapes.LINE, { x: bx, y: topL, w: 0, h: topR - topL - 0.06, line: { color: PX.clay, width: 1.5 } });
    hline(s, bx - 0.1, topL, 0.1, PX.clay, 1.5);
    hline(s, bx - 0.1, topR - 0.06, 0.1, PX.clay, 1.5);
    text(s, d.gapLabel.toUpperCase(), { x: rxb + 0.1, y: topL + 0.15, w: bw - 0.2, h: topR - topL - 0.4, fontFace: F.mono, fontSize: 10, bold: true, color: PX.clay, align: "center", valign: "middle", charSpacing: 2 });
    const lab = { fontFace: F.mono, fontSize: 8.5, color: k.dark ? PX.niebla : PX.muteLight, align: "center", charSpacing: 2 };
    text(s, d.leftLabel.toUpperCase(), { x: lx - 0.35, y: base + 0.15, w: bw + 0.7, h: 0.5, ...lab });
    text(s, d.rightLabel.toUpperCase(), { x: rxb - 0.35, y: base + 0.15, w: bw + 0.7, h: 0.5, ...lab });
    text(s, "ESQUEMA CONCEPTUAL · NO A ESCALA", { x: RIGHT - 4, y: 6.62, w: 4, h: 0.2, fontFace: F.mono, fontSize: 7, color: k.mute, align: "right", charSpacing: 2 });
  };

  R.comparison = (s, d, n) => {
    const k = frame(s, d, n);
    title(s, d.title, MX, 1.0, 11.6, 1.3, k.fg, pick(len(d.title), [[45, 36], [70, 32]]));
    const hi = d.highlight ?? 2, gap = 0.3, top = 2.55, h = 3.8;
    const w = (CW - gap * 2) / 3;
    d.columns.forEach((c, i) => {
      const x = MX + i * (w + gap);
      const on = i === hi;
      const fg = on ? PX.ivory : k.fg;
      if (on) {
        rect(s, x, top, w, h, PX.graphite);
        ticks(s, x - 0.08, top - 0.08, w + 0.16, h + 0.16, PX.indigo);
        s.addImage({ path: ASSET.symbol, x: x + w - 0.3 - 0.45, y: top + 0.3, w: 0.45, h: 0.45 / SYMBOL_RATIO, altText: "Símbolo Praxia" });
      } else {
        if (k.dark) rect(s, x, top, w, h, PX.graphite2);
        ticks(s, x, top, w, h, k.dark ? PX.hair : PX.hairLight, 0.16, 1);
      }
      text(s, c.kicker.toUpperCase(), { x: x + 0.3, y: top + 0.32, w: w - (on ? 1.0 : 0.5), h: 0.4, fontFace: F.mono, fontSize: 9, charSpacing: 2, color: on ? PX.violet : k.mute });
      text(s, c.verb, { x: x + 0.3, y: top + 0.85, w: w - 0.6, h: 1.0, fontFace: F.display, fontSize: 28, bold: true, color: on ? PX.clay : fg, lineSpacingMultiple: 0.95 });
      text(s, c.body, { x: x + 0.3, y: top + 2.0, w: w - 0.6, h: 1.6, ...body(on ? PX.ivory : k.dark ? PX.niebla : PX.graphite, 14) });
    });
    if (d.footnote) text(s, d.footnote, { x: MX, y: 6.55, w: CW, h: 0.3, ...body(k.mute, 11) });
  };

  R.method = (s, d, n) => {
    const k = frame(s, d, n);
    title(s, d.title, MX, 1.0, 11.6, 0.75, k.fg, pick(len(d.title), [[45, 36], [70, 30]]));
    if (d.intro) text(s, d.intro, { x: MX, y: 1.85, w: 10.5, h: 0.6, ...body(k.mute, 15) });
    const gap = 0.3, w = (CW - gap * 3) / 4, axisY = 2.85, top = 3.15;
    hline(s, MX, axisY, CW, k.dark ? PX.niebla : PX.graphite, 0.75);
    d.stages.forEach((st, i) => {
      const x = MX + i * (w + gap);
      const last = i === 3;
      s.addShape(pres.shapes.RECTANGLE, { x, y: axisY - 0.07, w: 0.14, h: 0.14, fill: { color: last ? PX.clay : PX.indigo }, line: { type: "none" } });
      text(s, `${String(i + 1).padStart(2, "0")} · ${st.name.toUpperCase()}`, { x, y: top + 0.05, w, h: 0.3, fontFace: F.mono, fontSize: 10, bold: true, charSpacing: 3, color: k.dark ? PX.violet : PX.indigo });
      text(s, st.verb, { x, y: top + 0.42, w, h: 0.5, fontFace: F.display, fontSize: 24, bold: true, color: k.fg });
      text(s, st.body, { x, y: top + 1.0, w: w - 0.1, h: 1.5, ...body(k.dark ? PX.niebla : PX.graphite, 13) });
      if (st.gate) {
        const gy = 5.7, gh = 0.62;
        ticks(s, x, gy, w, gh, k.dark ? PX.hair : PX.hairLight, 0.12, 1);
        text(s, st.gate.toUpperCase(), { x: x + 0.18, y: gy, w: w - 0.36, h: gh, fontFace: F.mono, fontSize: 8, charSpacing: 1, color: k.mute, valign: "middle" });
      }
    });
    if (d.mantra) text(s, rich(d.mantra, { fontFace: F.display, fontSize: 13, color: k.fg }), { x: MX, y: 6.5, w: CW, h: 0.3 });
  };

  R.offer = (s, d, n) => {
    const k = frame(s, d, n);
    const ts = pick(len(d.title), [[32, 36], [60, 32]]), th = titleH(d.title, ts, 6.3);
    title(s, d.title, MX, 1.0, 6.3, th + 0.2, k.fg, ts);
    const by = 1.0 + th + 0.4;
    if (d.body) text(s, d.body, { x: MX, y: by, w: 6.2, h: 4.45 - by, ...body(k.fg, 15) });
    (d.facts || []).forEach((f, i) => {
      const cw = 3.0, ch = 0.88, x = MX + (i % 2) * (cw + 0.2), y = 4.6 + Math.floor(i / 2) * (ch + 0.15);
      ticks(s, x, y, cw, ch, k.dark ? PX.hair : PX.hairLight, 0.12, 1);
      text(s, f.k.toUpperCase(), { x: x + 0.18, y: y + 0.12, w: cw - 0.36, h: 0.22, fontFace: F.mono, fontSize: 8, charSpacing: 3, color: k.mute });
      text(s, f.v, { x: x + 0.18, y: y + 0.36, w: cw - 0.36, h: 0.48, fontFace: F.display, fontSize: 15, bold: true, color: k.fg, lineSpacingMultiple: 0.95 });
    });
    // panel de entregables (grafito sobre ivory)
    const px = 7.45, pw = RIGHT - px, py = 1.0, ph = 5.45;
    rect(s, px, py, pw, ph, PX.graphite);
    ticks(s, px - 0.08, py - 0.08, pw + 0.16, ph + 0.16, PX.indigo);
    text(s, (d.panelTitle || "Entregables").toUpperCase(), { x: px + 0.4, y: py + 0.4, w: pw - 0.8, h: 0.25, fontFace: F.mono, fontSize: 9, charSpacing: 4, color: PX.violet });
    const items = d.deliverables, top = py + 0.95, rowH = Math.min(0.88, (ph - 1.25) / items.length);
    items.forEach((it, i) => {
      const y = top + i * rowH;
      if (i) hline(s, px + 0.4, y - 0.08, pw - 0.8, PX.hair, 0.75);
      text(s, String(i + 1).padStart(2, "0"), { x: px + 0.4, y: y + 0.02, w: 0.5, h: 0.3, fontFace: F.mono, fontSize: 10, color: PX.violet });
      text(s, it, { x: px + 1.0, y, w: pw - 1.4, h: rowH - 0.12, ...body(PX.ivory, 14), lineSpacingMultiple: 1.1 });
    });
  };

  R.services = (s, d, n) => {
    const k = frame(s, d, n);
    title(s, d.title, MX, 1.0, 11.6, 1.2, k.fg, pick(len(d.title), [[42, 36], [60, 32]]));
    const top = 2.35, bottom = 6.6, rowH = (bottom - top) / d.items.length;
    d.items.forEach((it, i) => {
      const y = top + i * rowH;
      hline(s, MX, y, CW, k.dark ? PX.hair : PX.hairLight, 0.75);
      const ty = y + 0.14;
      text(s, String(i + 1).padStart(2, "0"), { x: MX, y: ty + 0.04, w: 0.6, h: 0.3, fontFace: F.mono, fontSize: 10, color: k.dark ? PX.violet : PX.indigo });
      text(s, it.name, { x: MX + 0.7, y: ty, w: 4.4, h: rowH - 0.22, fontFace: F.display, fontSize: 17, bold: true, color: k.fg, lineSpacingMultiple: 0.95 });
      if (it.body) text(s, it.body, { x: 5.95, y: ty + 0.02, w: 4.9, h: rowH - 0.22, ...body(k.dark ? PX.niebla : PX.graphite, 13), lineSpacingMultiple: 1.1 });
      if (it.tag) text(s, it.tag.toUpperCase(), { x: 11.0, y: ty + 0.05, w: RIGHT - 11.0, h: 0.4, fontFace: F.mono, fontSize: 8, bold: true, charSpacing: 2, color: PX.clay, align: "right" });
    });
  };

  R.founder = (s, d, n) => {
    const k = frame(s, d, n);
    const initials = d.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    const cs = 2.5, cx = MX, cy = 1.55;
    s.addShape(pres.shapes.OVAL, { x: cx, y: cy, w: cs, h: cs, fill: { color: PX.graphite2 }, line: { color: k.dark ? PX.niebla : PX.muteLight, width: 1 } });
    text(s, initials, { x: cx, y: cy, w: cs, h: cs, fontFace: F.display, fontSize: 54, bold: true, color: k.fg, align: "center", valign: "middle" });
    const x = 3.75, w = RIGHT - x;
    text(s, d.name, { x, y: 1.5, w, h: 0.7, fontFace: F.display, fontSize: 40, bold: true, color: k.fg });
    text(s, d.role.toUpperCase(), { x, y: 2.28, w, h: 0.3, fontFace: F.mono, fontSize: 10, charSpacing: 4, color: k.dark ? PX.violet : PX.indigo });
    text(s, d.bio, { x, y: 2.85, w: w - 0.3, h: 2.25, ...body(k.fg, 16) });
    (d.points || []).forEach((p, i) => {
      const pw = (w - 0.3) / 2, px = x + (i % 2) * (pw + 0.3), py = 5.3 + Math.floor(i / 2) * 0.62;
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py + 0.08, w: 0.08, h: 0.08, fill: { color: PX.indigo }, line: { type: "none" } });
      text(s, p, { x: px + 0.22, y: py, w: pw - 0.25, h: 0.55, ...body(k.dark ? PX.niebla : PX.muteLight, 13), lineSpacingMultiple: 1.1 });
    });
  };

  R.cta = (s, d, n) => {
    const k = frame(s, d, n);
    const ts = pick(len(d.title), [[24, 54], [40, 46]]), th = titleH(d.title, ts, 10.5);
    const bh = d.body ? bodyH(d.body, 17, 8.6) : 0;
    const ty = Math.max(1.0, 3.65 - (th + (bh ? 0.3 + bh : 0)));
    title(s, d.title, MX, ty, 10.5, th + 0.2, k.fg, ts);
    if (d.body) text(s, d.body, { x: MX, y: ty + th + 0.3, w: 8.6, h: bh + 0.1, ...body(k.dark ? PX.niebla : PX.muteLight, 17) });
    const steps = d.steps || [];
    const gap = 0.3, w = steps.length ? Math.min(3.9, (CW - gap * (steps.length - 1)) / steps.length) : 0;
    steps.forEach((st, i) => {
      const x = MX + i * (w + gap), y = 4.05;
      ticks(s, x, y, w, 1.45, k.dark ? PX.hair : PX.hairLight, 0.12, 1);
      text(s, String(i + 1).padStart(2, "0"), { x: x + 0.22, y: y + 0.2, w: 0.5, h: 0.25, fontFace: F.mono, fontSize: 10, color: k.dark ? PX.violet : PX.indigo });
      text(s, st.title, { x: x + 0.7, y: y + 0.16, w: w - 0.9, h: 0.35, fontFace: F.display, fontSize: 15, bold: true, color: k.fg });
      if (st.body) text(s, st.body, { x: x + 0.7, y: y + 0.55, w: w - 0.9, h: 0.8, ...body(k.dark ? PX.niebla : PX.muteLight, 12.5), lineSpacingMultiple: 1.1 });
    });
    const by = 5.9, bh = 0.62, bw = 3.7;
    rect(s, MX, by, bw, bh, PX.clay);
    text(s, d.button, { x: MX + 0.25, y: by, w: bw - 0.5, h: bh, fontFace: F.display, fontSize: 15, bold: true, color: PX.graphite, valign: "middle" });
    const cx = MX + bw + 0.35, cw2 = RIGHT - cx - 1.5;
    const marker = /\[.*\]/.test(d.contact);
    if (marker) s.addShape(pres.shapes.RECTANGLE, { x: cx, y: by, w: cw2, h: bh, fill: { type: "none" }, line: { color: PX.clay, width: 1, dashType: "dash" } });
    text(s, d.contact, { x: cx + 0.25, y: by, w: cw2 - 0.5, h: bh, fontFace: F.mono, fontSize: 10.5, bold: marker, charSpacing: 1, color: marker ? PX.clay : k.fg, valign: "middle" });
  };

  R.closing = (s, d, n) => {
    const k = frame(s, d, n);
    const lh = 0.85, lw = lh * LOCKUP_RATIO;
    s.addImage({ path: k.dark ? ASSET.lockupIvory : ASSET.lockupGraphite, x: (SW - lw) / 2, y: 2.35, w: lw, h: lh, altText: "Praxia (logo provisional)" });
    text(s, rich(d.tagline, { fontFace: F.display, fontSize: 30, bold: true, color: k.fg }), { x: 1.5, y: 3.55, w: SW - 3, h: 0.7, align: "center" });
    text(s, DESCRIPTOR, { x: 1.5, y: 4.45, w: SW - 3, h: 0.25, fontFace: F.mono, fontSize: 9, charSpacing: 6, color: k.mute, align: "center" });
    if (d.contact) {
      const marker = /\[.*\]/.test(d.contact);
      text(s, d.contact, { x: 1.5, y: 5.25, w: SW - 3, h: 0.3, fontFace: F.mono, fontSize: 10.5, bold: marker, color: marker ? PX.clay : k.fg, align: "center", charSpacing: 1 });
    }
  };

  return R;
}
