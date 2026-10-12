// Full-screen scenes: title, Iceberg Map (transition between zones) and Case Notes.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, C = G.CONTENT;

  // ---------- shared: pixel iceberg drawn row by row ----------
  // Control points: [y, leftHalfWidth, rightHalfWidth] relative to the iceberg's centre line.
  const BERG = [
    [0, 4, 3], [10, 14, 10], [22, 22, 26], [32, 30, 34], [44, 44, 46], [54, 70, 74], [70, 104, 110],
    [90, 132, 140], [116, 150, 156], [146, 156, 150], [171, 146, 138], [196, 120, 110], [216, 80, 70], [228, 30, 24],
  ];
  function bergWidth(dy) {
    for (let i = 1; i < BERG.length; i++) {
      const [y1, l1, r1] = BERG[i];
      if (dy <= y1) {
        const [y0, l0, r0] = BERG[i - 1];
        const k = (dy - y0) / (y1 - y0);
        const jag = Math.floor(dy / 3) % 3 === 0 ? 2 : 0;
        return [Math.round(l0 + (l1 - l0) * k) + jag, Math.round(r0 + (r1 - r0) * k) - jag];
      }
    }
    return null;
  }
  const BERG_H = BERG[BERG.length - 1][0];

  // colorAt(y) returns the fill colour for an absolute row y.
  function drawIceberg(ctx, cx, top, scale, colorAt) {
    const h = Math.round(BERG_H * scale);
    for (let y = 0; y <= h; y++) {
      const w = bergWidth(y / scale);
      if (!w) continue;
      const l = Math.round(w[0] * scale), r = Math.round(w[1] * scale);
      const ay = top + y, c = colorAt(ay);
      R.rect(ctx, '#10203a', cx - l - 1, ay, l + r + 2, 1);
      R.rect(ctx, c, cx - l, ay, l + r, 1);
      R.rect(ctx, R.shade(c, 0.35), cx - l, ay, Math.min(4, l), 1);
      R.rect(ctx, R.shade(c, -0.2), cx + r - Math.min(5, r), ay, Math.min(5, r), 1);
    }
    R.rect(ctx, '#10203a', cx - 3 * scale, top - 1, 6 * scale, 1);
  }

  function bands(ctx, colors, y0, y1) {
    const n = colors.length, bh = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const y = Math.round(y0 + i * bh);
      R.rect(ctx, colors[i], 0, y, R.W, Math.ceil(bh) + 1);
      if (i + 1 < n) for (let x = 0; x < R.W; x += 2) R.rect(ctx, colors[i + 1], x + (Math.floor(y) % 2), Math.round(y + bh) - 1, 1, 1);
    }
  }

  // ---------- Title ----------
  class TitleScene {
    constructor() { this.t = 0; this.pausable = false; }
    update(dt) {
      this.t += dt;
      if (this.t > 0.3 && G.input.anyAction()) { G.audio.play('select'); G.fullscreen.enter(); G.next(); }
    }
    draw(ctx) {
      const t = this.t, sea = 160;
      bands(ctx, ['#2b1b4a', '#47235f', '#6e2a6c', '#9c3769', '#c94c62', '#e8705a', '#f39c4a', '#ffc46b'], 0, sea);
      // sun with retro stripes, half set into the sea
      R.disc(ctx, '#ffe7a0', 370, sea, 30);
      for (let i = 0; i < 4; i++) R.rect(ctx, '#ffc46b', 330, sea - 6 - i * 6, 80, 1 + (i < 2 ? 1 : 0));
      // clouds
      for (const [cx, cy, w] of [[60, 90, 50], [250, 70, 70], [430, 110, 40]]) {
        const x = (cx + t * 4) % (R.W + 80) - 40;
        R.rect(ctx, '#f6a3a0', x, cy, w, 4); R.rect(ctx, '#f6a3a0', x + 8, cy - 3, w - 20, 3);
      }
      bands(ctx, ['#2d4f8f', '#25437c', '#1d376a', '#162c58', '#102247', '#0b1a38'], sea, R.H);
      // sun reflection + waves
      for (let y = sea + 3; y < R.H; y += 5) {
        const k = (y - sea) / (R.H - sea);
        const rw = Math.round(40 * (1 - k * 0.6));
        R.rect(ctx, '#f3a65a', 370 - rw / 2 + Math.round(Math.sin(t * 2 + y) * 3), y, rw, 1);
        for (let x = (y * 37) % 60; x < R.W; x += 60) {
          const wx = Math.round((x + t * (8 + k * 10)) % (R.W + 20)) - 10;
          R.rect(ctx, '#5a86c8', wx, y + 1, 6 + Math.round(k * 6), 1);
        }
      }
      // iceberg: small tip above water, huge faint mass below
      drawIceberg(ctx, 120, sea - 52, 0.9, (y) => (y < sea ? '#f4fbff' : '#6f9fd0'));
      ctx.globalAlpha = 0.55; R.rect(ctx, '#1d376a', 0, sea, R.W, R.H - sea); ctx.globalAlpha = 1;
      R.rect(ctx, '#ffffff', 60, sea, 120, 1);

      // logo
      const logo = C.title.logo;
      F.draw(ctx, logo, R.W / 2, 22, { scale: 3, align: 'center', color: '#13235a', outline: '#13235a' });
      F.draw(ctx, logo, R.W / 2, 19, { scale: 3, align: 'center', color: '#bfe9f7', outline: '#0b1430' });
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, R.W, 28); ctx.clip();
      F.draw(ctx, logo, R.W / 2, 19, { scale: 3, align: 'center', color: '#ffffff' });
      ctx.restore();
      F.draw(ctx, C.title.subtitle, R.W / 2, 52, { scale: 2, align: 'center', color: '#ffd166', outline: '#2b1b4a' });

      F.draw(ctx, C.title.tagline, R.W / 2, 206, { align: 'center', color: '#ffffff', shadow: '#0b1430' });
      if (Math.floor(t * 2) % 2 === 0) F.draw(ctx, C.title.start, R.W / 2, 226, { align: 'center', color: '#ffd166', outline: '#0b1430' });
      ctx.globalAlpha = 0.75;
      F.draw(ctx, C.title.credits, R.W / 2, 256, { align: 'center', color: '#bfd0f0' });
      ctx.globalAlpha = 1;
    }
  }

  // ---------- Iceberg Map ----------
  const WATER = 78, CX = 175, TOP = 34;
  const BOUNDS = [[TOP, WATER], [WATER, 124], [124, 262]];
  const CENTRES = [58, 101, 176];
  const LAYER_COL = ['#f4fbff', '#8fc9e6', '#3d5fa8'];

  class MapScene {
    constructor(layer) {
      this.layer = layer;
      this.t = 0;
      this.from = layer === 0 ? 8 : CENTRES[layer - 1];
      this.to = CENTRES[layer];
      this.lines = F.wrap(C.layers[layer].text, 440);
      G.audio.play('whoosh');
    }
    get progress() { return Math.min(1, this.t / 1.6); }
    update(dt) {
      this.t += dt;
      if (G.input.anyAction()) {
        if (this.progress < 1) this.t = 1.6;
        else { G.audio.play('select'); G.next(); }
      }
    }
    layerOf(y) { return y < BOUNDS[0][1] ? 0 : y < BOUNDS[1][1] ? 1 : 2; }
    draw(ctx) {
      const t = this.t;
      bands(ctx, ['#7fd0f5', '#9fdcf7', '#bfe8fa', '#d8f4ff'], 0, WATER);
      R.disc(ctx, '#fff6c8', 430, 22, 10);
      for (const [cx, cy, w] of [[40, 20, 40], [260, 14, 50]]) {
        const x = (cx + t * 3) % (R.W + 60) - 30;
        R.rect(ctx, '#ffffff', x, cy, w, 5); R.rect(ctx, '#ffffff', x + 8, cy - 3, w - 18, 3);
      }
      bands(ctx, ['#1f7fb8', '#1a6aa2', '#15578c', '#114676', '#0d375f', '#0a2a4c', '#081f3c', '#06162e'], WATER, R.H);

      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      drawIceberg(ctx, CX, TOP, 1, (y) => {
        const L = this.layerOf(y);
        let c = LAYER_COL[L];
        if (L === 2) c = R.mix('#3d5fa8', '#2a3f78', (y - 124) / 140);
        return L === this.layer ? R.mix(c, '#ffffff', 0.12 + 0.18 * pulse) : c;
      });
      // underwater tint + waterline
      ctx.globalAlpha = 0.18; R.rect(ctx, '#0a3a7a', 0, WATER + 1, R.W, R.H - WATER); ctx.globalAlpha = 1;
      for (let x = 0; x < R.W; x += 8) R.rect(ctx, '#e8fbff', x + Math.round(Math.sin(t * 2 + x) * 2), WATER, 5, 1);
      // dashed layer boundary inside the iceberg
      for (let x = CX - 150; x < CX + 154; x += 6) R.rect(ctx, 'rgba(255,255,255,0.55)', x, 124, 3, 1);

      // labels
      ['CONSCIOUS', 'PRECONSCIOUS', 'UNCONSCIOUS'].forEach((name, i) => {
        const y = CENTRES[i], active = i === this.layer;
        const edge = CX + (bergWidth(y - TOP) || [0, 0])[1] + 4;
        const col = active ? '#ffd166' : '#eaf2ff';
        for (let x = edge; x < 352; x += 4) R.rect(ctx, col, x, y, 2, 1);
        const w = F.measure(name) + 10;
        R.panel(ctx, 354, y - 7, w, 15, active ? '#3a2a10' : '#14203f', col);
        F.draw(ctx, name, 359, y - 3, { color: col });
      });

      // the two players travel down to the next layer
      const p = this.progress, e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const y = Math.round(this.from + (this.to - this.from) * e) + 10;
      const walking = p < 1;
      const f = walking ? Math.floor(t / 0.13) % 4 : 0;
      for (const [i, dx] of [[0, -11], [1, 11]]) {
        const role = i === 0 ? 'id' : 'superego';
        G.Sprites.auraBack(ctx, role, CX + dx, y, t);
        G.Sprites.drawCharacter(ctx, CX + dx, y, G.game.looks[i], G.Sprites.DOWN, f, walking ? 0 : Math.floor(t / 0.6) % 2);
        G.Sprites.auraFront(ctx, role, CX + dx, y, t);
      }

      F.draw(ctx, 'THE MIND AS AN ICEBERG', 8, 8, { color: '#13235a', shadow: '#ffffff' });

      // explanation panel
      const ph = 16 + this.lines.length * 10 + (p >= 1 ? 12 : 0);
      R.panel(ctx, 8, R.H - ph - 6, R.W - 16, ph, '#14203f', '#eaf2ff');
      this.lines.forEach((ln, i) => F.draw(ctx, ln, 18, R.H - ph + 2 + i * 10, { color: '#ffffff' }));
      if (p >= 1 && Math.floor(t * 2) % 2 === 0)
        F.draw(ctx, C.mapContinue, R.W - 18, R.H - 18, { align: 'right', color: '#ffd166' });
    }
  }

  // ---------- Case Notes: an old notebook spread with the summary (left) and the evaluation (right) ----------
  const INK = '#2b2a4a', RED = '#9a2a2a', GREEN_INK = '#2f7a3e';

  class CaseNotesScene {
    constructor() {
      this.t = 0;
      this.pausable = false;
      G.game.timing = false;
      const N = C.casenotes;
      this.learned = N.learned.map((s) => F.wrap(s, 190));
      this.evals = N.eval.map((e) => ({ ...e, lines: F.wrap(e.text, 196) }));
    }
    update(dt) {
      this.t += dt;
      if (this.t > 1 && G.input.anyAction()) { G.audio.play('select'); G.goTo(0); } // back to the title, characters are kept
    }

    page(ctx, x, y, w, h) {
      R.rect(ctx, '#1e140e', x - 1, y - 1, w + 2, h + 2);
      R.rect(ctx, '#f3e8cc', x, y, w, h);
      for (let ly = y + 24; ly < y + h - 4; ly += 10) R.rect(ctx, '#dccdaa', x + 4, ly, w - 8, 1);
      R.rect(ctx, '#e7d7b2', x, y + h - 3, w, 3);
    }

    draw(ctx) {
      const N = C.casenotes, g = G.game;
      R.rect(ctx, '#4a3424', 0, 0, R.W, R.H);
      for (let y = 0; y < R.H; y += 6) R.rect(ctx, '#432f20', 0, y, R.W, 2);   // wooden desk
      this.page(ctx, 10, 8, 226, 246);
      this.page(ctx, 244, 8, 226, 246);
      for (let y = 16; y < 250; y += 14) { R.rect(ctx, '#1e140e', 236, y, 8, 4); R.rect(ctx, '#bfbfc8', 237, y + 1, 6, 2); } // rings
      R.rect(ctx, '#c0504d', 30, 8, 1, 246);                                                                                // margin line

      // left page: the case
      let y = 14;
      F.draw(ctx, N.title, 123, y, { align: 'center', color: RED });
      y += 14;
      F.draw(ctx, G.fillNames(N.solved), 36, y, { color: INK });
      const s = Math.floor(g.time), mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
      y += 12;
      F.draw(ctx, `${N.time}: ${mm}:${ss}`, 36, y, { color: INK });
      F.draw(ctx, `${N.score}: ${g.stats.firstTry} / ${N.total}`, 228, y, { align: 'right', color: INK });
      y += 12;
      F.draw(ctx, `${N.attacks}: ${g.stats.attacks || 0}`, 36, y, { color: INK });
      y += 12;
      const real = F.wrap(N.realName, 190);
      real.forEach((ln, i) => F.draw(ctx, ln, 36, y + i * 10, { color: '#7a5a3a' }));
      y += real.length * 10 + 6;
      F.draw(ctx, N.learnedTitle, 36, y, { color: RED });
      y += 12;
      for (const lines of this.learned) {
        R.rect(ctx, INK, 37, y + 3, 2, 2);
        lines.forEach((ln, i) => F.draw(ctx, ln, 42, y + i * 10, { color: INK }));
        y += lines.length * 10 + 1;
      }

      // right page: evaluation
      y = 14;
      F.draw(ctx, N.evalTitle, 357, y, { align: 'center', color: RED });
      y += 16;
      for (const e of this.evals) {
        F.draw(ctx, e.good ? '✔' : '✘', 254, y, { color: e.good ? GREEN_INK : RED });
        F.draw(ctx, e.label + ':', 264, y, { color: e.good ? GREEN_INK : RED });
        y += 11;
        e.lines.forEach((ln, i) => F.draw(ctx, ln, 254, y + i * 10, { color: INK }));
        y += e.lines.length * 10 + 5;
      }

      if (this.t > 1 && Math.floor(this.t * 2) % 2 === 0) F.draw(ctx, N.again, R.W / 2, R.H - 12, { align: 'center', color: '#ffd166', outline: '#1e140e' });
    }
  }

  G.TitleScene = TitleScene;
  G.MapScene = MapScene;
  G.CaseNotesScene = CaseNotesScene;
  G.drawIceberg = drawIceberg;
})();
