// Name entry (one player after the other) and the split-screen Character Creator (both at the same time).
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, S = G.Sprites, U = G.UI, C = G.CONTENT;
  const { ID_ORANGE, SE_WHITE, EGO_GREEN } = U.COLORS;
  const ROLE_COL = [ID_ORANGE, SE_WHITE];

  // ---------- Name entry ----------
  const ALLOWED = /^[A-Za-z0-9 .'!?-]$/;

  class NameScene {
    constructor() {
      this.t = 0;
      this.who = 0;
      // Play again: keep the names that were typed last time.
      this.text = G.game.names.map((n, i) => (n === C.names.defaults[i] ? '' : n));
      this.done = false;
      this.pausable = false;
      G.input.onText = (e) => this.key(e);
    }

    // Consumes every key while typing, so letters like M or D don't trigger global shortcuts.
    key(e) {
      if (this.done) return true;
      const cur = this.text[this.who];
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (!e.repeat) this.confirm(); // a held Enter from the title screen must not confirm an empty name
      } else if (e.code === 'Backspace') {
        if (cur) { this.text[this.who] = cur.slice(0, -1); G.audio.play('blip'); }
      } else if (!e.repeat && e.key.length === 1 && ALLOWED.test(e.key) && cur.length < C.names.maxLen) {
        if (e.key !== ' ' || cur) { this.text[this.who] = cur + e.key; G.audio.play('blip'); }
      }
      return true;
    }

    confirm() {
      G.game.names[this.who] = this.text[this.who].trim() || C.names.defaults[this.who];
      G.audio.play('select');
      if (this.who === 0) { this.who = 1; return; }
      this.done = true;
      G.input.onText = null;
      G.next();
    }

    update(dt) { this.t += dt; }

    draw(ctx) {
      const t = this.t;
      R.rect(ctx, '#101833', 0, 0, R.W, R.H);
      G.drawIceberg(ctx, 400, 96, 0.7, (y) => (y < 120 ? '#22325e' : '#1a2850'));
      R.rect(ctx, '#2a3c6e', 0, 120, R.W, 1);
      F.draw(ctx, C.names.heading, R.W / 2, 22, { scale: 2, align: 'center', color: '#ffd166', outline: '#0b1430' });

      for (let i = 0; i < 2; i++) {
        const y = 70 + i * 72, col = ROLE_COL[i];
        const active = i === this.who && !this.done, confirmed = i < this.who || this.done;
        ctx.globalAlpha = i > this.who ? 0.4 : 1;
        if (i === 0) U.flameIcon(ctx, 60, y, t); else U.haloIcon(ctx, 60, y);
        F.draw(ctx, C.names.prompts[i], 74, y, { color: col, outline: '#141022' });
        R.panel(ctx, 74, y + 14, 200, 26, active ? '#1c2340' : '#141a30', active ? col : '#5a6a90');
        const shown = confirmed ? G.game.names[i] : this.text[i];
        const w = F.draw(ctx, shown, 82, y + 19, { scale: 2, color: '#ffffff' });
        if (active) {
          if (Math.floor(t * 2) % 2 === 0) R.rect(ctx, '#ffd166', 82 + w + (shown ? 2 : 0), y + 19, 2, 14);
          F.draw(ctx, `${shown.length}/${C.names.maxLen}`, 272, y + 43, { align: 'right', color: '#8fa3cc' });
        }
        if (confirmed) F.draw(ctx, 'OK', 282, y + 23, { color: EGO_GREEN, outline: '#141022' });
        ctx.globalAlpha = 1;
      }
      F.draw(ctx, C.names.hint, R.W / 2, 236, { align: 'center', color: '#bfd0f0' });
    }
  }

  // ---------- Character Creator ----------
  const FIELDS = ['body', 'fur', 'hair', 'outfit', 'acc'];
  const ROWS = FIELDS.length + 1; // + READY
  const DIRS = [S.DOWN, S.LEFT, S.UP, S.RIGHT]; // the preview slowly turns around

  class CreatorScene {
    constructor() {
      this.t = 0;
      this.doneT = 0;
      this.leaving = false;
      this.sides = [0, 1].map(() => ({ row: 0, ready: false, flash: 0 }));
    }

    update(dt) {
      this.t += dt;
      if (this.leaving) return;
      const I = G.input;
      this.sides.forEach((s, i) => {
        const p = i + 1, look = G.game.looks[i];
        s.flash = Math.max(0, s.flash - dt);
        if (I.hit(p, 'action')) {
          s.ready = !s.ready;
          if (s.ready) s.row = ROWS - 1;
          G.audio.play(s.ready ? 'select' : 'blip');
          return;
        }
        if (s.ready) return;
        const dy = (I.hit(p, 'down') ? 1 : 0) - (I.hit(p, 'up') ? 1 : 0);
        if (dy) { s.row = (s.row + dy + ROWS) % ROWS; G.audio.play('blip'); }
        const dx = (I.hit(p, 'right') ? 1 : 0) - (I.hit(p, 'left') ? 1 : 0);
        if (dx && s.row < FIELDS.length) {
          const f = FIELDS[s.row], n = S.OPTION_COUNTS[f];
          look[f] = (look[f] + dx + n) % n;
          s.flash = 0.12;
          G.audio.play('blip');
        }
      });

      if (this.sides.every((s) => s.ready)) {
        if (this.doneT === 0) G.audio.play('chime');
        this.doneT += dt;
        if (this.doneT > 1.2) { this.leaving = true; G.next(); }
      } else this.doneT = 0;
    }

    draw(ctx) {
      const t = this.t;
      R.rect(ctx, '#2a1420', 0, 0, 240, R.H);   // warm Id half
      R.rect(ctx, '#121c3a', 240, 0, 240, R.H); // cool Superego half
      for (let y = 0; y < R.H; y += 8)
        for (let x = ((y / 8) % 2) * 8; x < R.W; x += 16) R.rect(ctx, x < 240 ? '#331a28' : '#17244a', x, y, 2, 2);
      R.rect(ctx, '#0b0e1c', 239, 0, 2, R.H);
      this.sides.forEach((s, i) => this.drawSide(ctx, s, i, t));

      if (this.doneT > 0) {
        R.panel(ctx, 170, 238, 140, 26, '#1d4a30', EGO_GREEN);
        F.draw(ctx, C.creator.bothReady, R.W / 2, 243, { scale: 2, align: 'center', color: '#ffffff', shadow: '#0b1c12' });
      }
    }

    drawSide(ctx, s, i, t) {
      const ox = i * 240, look = G.game.looks[i], col = ROLE_COL[i];
      const panelFill = i === 0 ? '#3d1d24' : '#1c2a55';

      // header
      if (i === 0) U.flameIcon(ctx, ox + 8, 4, t); else U.haloIcon(ctx, ox + 8, 4);
      F.draw(ctx, C.creator.heading[i], ox + 19, 5, { color: col, outline: '#141022' });
      F.draw(ctx, G.game.names[i], ox + 232, 5, { align: 'right', color: '#ffffff', outline: '#141022' });

      // large preview (4x) with the role aura on top of the customised character
      R.panel(ctx, ox + 8, 17, 86, 152, panelFill, s.ready ? EGO_GREEN : col);
      R.disc(ctx, R.shade(panelFill, 0.12), ox + 51, 160, 30, 6);
      const role = i === 0 ? 'id' : 'superego';
      const dir = DIRS[Math.floor(t / 1.5) % 4], bob = Math.floor(t / 0.6) % 2;
      ctx.save();
      ctx.translate(ox + 51, 160);
      ctx.scale(4, 4);
      S.auraBack(ctx, role, 0, 0, t);
      S.drawCharacter(ctx, 0, 0, look, dir, 0, bob);
      S.auraFront(ctx, role, 0, 0, t);
      ctx.restore();

      // option rows
      const rx = ox + 102, rw = 130;
      C.creator.rows.forEach((label, r) => {
        const y = 17 + r * 25, sel = s.row === r;
        if (r === FIELDS.length) {
          const fill = s.ready ? '#1d4a30' : '#262c48';
          R.panel(ctx, rx + 10, y + 1, rw - 20, 21, fill, s.ready ? EGO_GREEN : sel ? col : '#5a6a90');
          F.draw(ctx, s.ready ? C.creator.ready : C.creator.readyButton[i], rx + rw / 2, y + 8,
            { align: 'center', color: s.ready ? '#ffffff' : sel ? col : '#bfd0f0' });
          return;
        }
        if (s.ready) ctx.globalAlpha = 0.45;
        if (sel) R.panel(ctx, rx - 4, y - 2, rw + 8, 24, R.shade(panelFill, -0.3), col);
        F.draw(ctx, label, rx, y + 1, { color: sel ? col : '#8fa3cc' });
        const f = FIELDS[r], v = look[f];
        if (f === 'fur' || f === 'outfit') {
          const opts = f === 'fur' ? S.FUR[S.SPECIES[look.body]] : S.OUTFITS;
          const sw = f === 'fur' ? 16 : 14, x0 = rx + Math.round((rw - opts.length * sw) / 2);
          opts.forEach((o, k) => {
            const x = x0 + k * sw, main = f === 'fur' ? o[0] : o;
            if (k === v) R.rect(ctx, '#ffffff', x - 1, y + 10, sw, 12);
            R.rect(ctx, '#0b0e1c', x, y + 11, sw - 2, 10);
            R.rect(ctx, main, x + 1, y + 12, sw - 4, 8);
            if (f === 'fur') R.rect(ctx, o[1], x + 1, y + 18, sw - 4, 2);
          });
        } else {
          const name = f === 'body' ? C.creator.bodies[v]
            : f === 'hair' ? C.creator.hair[S.SPECIES[look.body]][v]
            : C.creator.accessories[v];
          F.draw(ctx, name, rx + rw / 2, y + 12, { align: 'center', color: sel && s.flash > 0 ? '#ffd166' : '#ffffff' });
        }
        if (sel && !s.ready) {
          F.draw(ctx, '←', rx, y + 12, { color: col });
          F.draw(ctx, '→', rx + rw - 5, y + 12, { color: col });
        }
        ctx.globalAlpha = 1;
      });

      // role description + controls
      F.wrap(C.creator.roles[i], 224).forEach((ln, k) => F.draw(ctx, ln, ox + 8, 176 + k * 10, { color: col, outline: '#141022' }));
      F.wrap(C.creator.explain[i], 224).forEach((ln, k) => F.draw(ctx, ln, ox + 8, 198 + k * 10, { color: '#eaf2ff' }));
      F.draw(ctx, C.creator.keys[i], ox + 8, 222, { color: '#8fa3cc' });
    }
  }

  G.NameScene = NameScene;
  G.CreatorScene = CreatorScene;
})();
