// Agreement Tiles (§3.2): an answer counts only when BOTH players stand on the same tile for 1 second.
// Correct → chime, green glow, explanation. Wrong → buzz, red flash, Ego Meter push, hint; same question again.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, TS = 16;
  const GREEN = '#3CC46B', RED = '#E8453C', HOLD = 1;

  class Quiz {
    // def: { id, tiles: [{ x, y, w?, h?, label }], questions: [{ q, answer, right, hint, options? }], title?, active? }
    // A question's own `options` replace the tile labels while it is asked (used by the boss).
    constructor(def, room) {
      this.type = 'quiz';
      this.id = def.id;
      this.room = room;
      this.title = def.title || '';
      this.questions = def.questions;
      this.tiles = def.tiles.map((t) => {
        const w = (t.w || 3) * TS, h = (t.h || 2) * TS;
        return { rect: { x: t.x * TS, y: t.y * TS, w, h }, label: t.label, flash: 0, flashCol: null };
      });
      this.active = !!def.active;
      this.done = false;
      this.qi = 0;
      this.hold = 0;
      this.holdTile = null;
      this.offTile = null;   // the tile just answered: players must step off it before it counts again
      this.wrongs = 0;
      this.feedback = null;  // { text, col, t, next }
    }

    start() { this.active = true; this.qi = 0; G.audio.play('select'); }

    tileOf(p) { return this.tiles.find((t) => G.feetIn(p, t.rect)); }

    update(dt) {
      for (const t of this.tiles) t.flash = Math.max(0, t.flash - dt);
      // An explanation can be skipped with either action key after 1 second.
      if (this.feedback && this.feedback.next && this.feedback.t < this.feedback.total - 1 && G.input.anyAction()) this.feedback.t = 0;
      if (this.feedback && (this.feedback.t -= dt) <= 0) {
        const f = this.feedback;
        this.feedback = null;
        if (f.next) this.advance();
      }
      this.hold = 0;
      if (!this.active || this.done || this.room.frozen) { this.holdTile = null; return; }

      const [a, b] = this.room.players.map((p) => this.tileOf(p));
      if (this.offTile && (a !== this.offTile || b !== this.offTile)) this.offTile = null;
      if (a && b && a !== b) for (const p of this.room.players) p.say(G.CONTENT.hints.agree, 0.3);
      const busy = this.feedback && this.feedback.next; // explanation after a right answer
      if (a && a === b && a !== this.offTile && !busy) {
        if (this.holdTile !== a) { this.holdTile = a; this.holdT = 0; }
        this.holdT += dt;
        this.hold = this.holdT / HOLD;
        if (this.holdT >= HOLD) this.answer(a);
      } else this.holdTile = null;
    }

    answer(tile) {
      const q = this.questions[this.qi];
      this.holdTile = null;
      this.offTile = tile;
      tile.flash = 1.2;
      if (this.tiles.indexOf(tile) === q.answer) {
        G.audio.play('chime');
        tile.flashCol = GREEN;
        if (!this.wrongs) G.game.stats.firstTry++;
        this.wrongs = 0;
        this.feedback = { text: q.right, col: GREEN, t: 2 + q.right.length * 0.04, next: true };
        this.feedback.total = this.feedback.t;
        this.room.burst(tile.rect.x + tile.rect.w / 2, tile.rect.y + tile.rect.h / 2, ['#3CC46B', '#b8ffcf', '#ffffff'], 14, 60);
        this.room.emit('quizRight', { quiz: this.id, index: this.qi });
      } else {
        G.audio.play('buzz');
        tile.flashCol = RED;
        this.wrongs++;
        G.Ego.wrong(this.room);
        this.room.shake(0.2);
        this.feedback = { text: q.hint, col: '#ffb15a', t: 2 + q.hint.length * 0.04, next: false };
        this.room.emit('quizWrong', { quiz: this.id, index: this.qi });
      }
    }

    advance() {
      this.qi++;
      if (this.qi >= this.questions.length) { this.done = true; this.room.emit('quizDone', this.id); }
    }

    drawBelow(ctx, t) {
      const on = this.active && !this.done;
      const cur = this.questions[Math.min(this.qi, this.questions.length - 1)];
      for (const [k, tile] of this.tiles.entries()) {
        const lines = F.wrap(cur.options ? cur.options[k] : tile.label, tile.rect.w - 6);
        const r = tile.rect;
        ctx.globalAlpha = on ? 1 : 0.45;
        R.rect(ctx, '#141022', r.x + 1, r.y + 1, r.w - 2, r.h - 1);
        R.rect(ctx, '#3b4a78', r.x + 2, r.y + 2, r.w - 4, r.h - 4);
        R.rect(ctx, '#56679c', r.x + 2, r.y + 2, r.w - 4, r.h - 7);
        R.rect(ctx, '#7f90c4', r.x + 2, r.y + 2, r.w - 4, 1);
        if (tile === this.holdTile) {
          ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 12);
          R.rect(ctx, '#ffd166', r.x + 2, r.y + 2, r.w - 4, r.h - 7);
        }
        if (tile.flash > 0) {
          ctx.globalAlpha = Math.min(1, tile.flash) * (0.5 + 0.3 * Math.sin(t * 20));
          R.rect(ctx, tile.flashCol, r.x + 2, r.y + 2, r.w - 4, r.h - 4);
        }
        ctx.globalAlpha = on ? 1 : 0.45;
        const ly = r.y + (r.h - 5) / 2 - lines.length * 5 + 1;
        lines.forEach((ln, i) => F.draw(ctx, ln, r.x + r.w / 2, ly + i * 10, { align: 'center', color: '#ffffff', shadow: '#141022' }));
        ctx.globalAlpha = 1;
      }
    }

    // The agreement ring fills over 1 second around the shared tile.
    drawAbove(ctx) {
      if (!this.holdTile) return;
      const r = this.holdTile.rect, cx = r.x + r.w / 2, cy = r.y + r.h / 2 - 2;
      const rx = r.w / 2 + 3, ry = r.h / 2 + 3, n = 48, k = Math.floor(this.hold * n);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        R.rect(ctx, i < k ? '#ffd166' : 'rgba(20,16,34,0.5)', cx + Math.cos(a) * rx - 1, cy + Math.sin(a) * ry - 1, 2, 2);
      }
    }

    // Question box at the bottom (doors and gates are usually at the top of the room).
    drawUI(ctx) {
      if (!this.feedback && (!this.active || this.done)) return;
      const fb = this.feedback;
      const q = this.questions[Math.min(this.qi, this.questions.length - 1)];
      const text = fb ? fb.text : q.q;
      const lines = F.wrap(text, 420);
      const h = 20 + lines.length * 10;
      const y = R.H - h - 6;
      R.panel(ctx, 20, y, R.W - 40, h, '#1c2340', fb ? fb.col : '#eaf2ff');
      const head = `${this.title ? this.title + '  ' : ''}${Math.min(this.qi + 1, this.questions.length)}/${this.questions.length}`;
      F.draw(ctx, head, 28, y + 5, { color: '#8fa3cc' });
      lines.forEach((ln, i) => F.draw(ctx, ln, R.W / 2, y + 16 + i * 10, { align: 'center', color: fb ? fb.col : '#ffffff' }));
    }
  }

  G.ObjectTypes.quiz = (def, room) => new Quiz(def, room);
})();
