// Dialogue box (§3.5): bottom text box with speaker portrait and typewriter effect.
// Either action key completes the line / advances. Players cannot move while it is open.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, S = G.Sprites;
  const SPEED = 50;      // characters per second
  const TEXT_W = 396;

  // [P1] / [P2] → the players' names.
  G.fillNames = (text) => text.replace(/\[P1\]/g, G.game.names[0]).replace(/\[P2\]/g, G.game.names[1]);

  class Dialogue {
    constructor() { this.queue = []; this.cur = null; this.done = null; }
    get active() { return !!this.cur; }

    // lines: strings (spoken by Freud) or { who, text }.
    start(lines, done) {
      this.queue = lines.map((l) => (typeof l === 'string' ? { who: 'freud', text: l } : l));
      this.done = done || null;
      this.next();
    }

    next() {
      this.cur = this.queue.shift() || null;
      if (!this.cur) {
        const d = this.done;
        this.done = null;
        if (d) d(); // may start the next dialogue
        return;
      }
      this.lines = F.wrap(G.fillNames(this.cur.text), TEXT_W);
      this.total = this.lines.reduce((n, l) => n + l.length, 0);
      this.shown = 0;
      this.t = 0;
    }

    // Returns true if the dialogue was open this tick (so the action key is not used for anything else).
    update(dt) {
      if (!this.cur) return false;
      this.t += dt;
      const before = Math.floor(this.shown);
      this.shown = Math.min(this.total, this.shown + dt * SPEED);
      if (Math.floor(this.shown) !== before && before % 4 === 0) G.audio.play('type');
      if (G.input.anyAction()) {
        if (this.shown < this.total) this.shown = this.total;
        else { G.audio.play('blip'); this.next(); }
      }
      return true;
    }

    // atTop: show the box under the HUD instead (when it would hide the players).
    draw(ctx, voice, atTop) {
      if (!this.cur) return;
      const x = 6, y = atTop ? 30 : R.H - 64, w = R.W - 12, h = 58;
      R.panel(ctx, x, y, w, h, '#1c2340', '#eaf2ff');
      portrait(ctx, this.cur.who, x + 6, y + 7, this.t, voice);
      const name = G.CONTENT.speakers[this.cur.who] || '';
      F.draw(ctx, name, x + 58, y + 6, { color: '#ffd166' });
      let left = Math.floor(this.shown);
      this.lines.forEach((ln, i) => {
        if (left <= 0) return;
        F.draw(ctx, ln.slice(0, left), x + 58, y + 19 + i * 11, { color: '#ffffff' });
        left -= ln.length;
      });
      if (this.shown >= this.total && Math.floor(this.t * 3) % 2 === 0)
        F.draw(ctx, '↓', x + w - 12, y + h - 12, { color: '#ffd166' });
    }
  }

  // 44 x 44 speaker portrait. Freud inside Hans's mind is a "voice" with a soft glow.
  function portrait(ctx, who, x, y, t, voice) {
    const s = 44;
    R.rect(ctx, '#0b0e1c', x, y, s, s);
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 1, y + 1, s - 2, s - 2); ctx.clip();
    if (who === 'freud') {
      R.rect(ctx, voice ? '#2b3a6e' : '#4a3424', x + 1, y + 1, s - 2, s - 2);
      if (voice) {
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 3);
        R.disc(ctx, '#fff1b8', x + s / 2, y + s / 2, 20);
        ctx.globalAlpha = 0.5;
        R.disc(ctx, '#fff8dc', x + s / 2, y + s / 2, 14);
        ctx.globalAlpha = 1;
      }
      ctx.translate(x + s / 2, y + 3);
      ctx.scale(3, 3);
      S.drawFreud(ctx, 0, 25, S.DOWN, 0, Math.floor(t / 0.7) % 2);
    } else if (who === 'repressor') {
      // cracked ice face with a glowing keyhole eye
      R.rect(ctx, '#1a2238', x + 1, y + 1, s - 2, s - 2);
      R.rect(ctx, '#26304a', x + 6, y + 6, 32, 34);
      R.rect(ctx, '#93a7c2', x + 7, y + 7, 30, 32);
      R.rect(ctx, '#d3deec', x + 7, y + 7, 30, 3);
      R.rect(ctx, '#6d7f9c', x + 7, y + 30, 30, 9);
      const eye = R.mix('#7a1010', '#ff3030', 0.6 + 0.4 * Math.sin(t * 5));
      R.disc(ctx, '#1a1f30', x + 22, y + 19, 7);
      R.disc(ctx, eye, x + 22, y + 18, 3);
      R.rect(ctx, eye, x + 21, y + 19, 3, 6);
      R.rect(ctx, '#26304a', x + 12, y + 33, 20, 2);
    } else {
      // engraved stone tablet
      R.rect(ctx, '#3a4560', x + 1, y + 1, s - 2, s - 2);
      R.rect(ctx, '#1a1f30', x + 9, y + 5, 26, 36);
      R.rect(ctx, '#9aa6bd', x + 10, y + 6, 24, 34);
      R.rect(ctx, '#c3cde0', x + 10, y + 6, 24, 3);
      const glow = 0.6 + 0.4 * Math.sin(t * 4);
      for (let i = 0; i < 5; i++) R.rect(ctx, R.mix('#5a6680', '#3B7DD8', glow), x + 14, y + 13 + i * 5, i % 2 ? 12 : 16, 2);
    }
    ctx.restore();
  }

  G.Dialogue = Dialogue;
})();
