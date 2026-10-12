// The Deep (unconscious): darkness with player light circles, dream-image plates (manifest ↔ latent)
// and the shadow guards of the Ego.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, TS = 16;

  // ---------- darkness: everything is dark except a light circle (~4 tiles) around each player ----------
  const [dark, dg] = R.makeCanvas(R.W, R.H);
  function darkness(ctx, room, t) {
    dg.globalCompositeOperation = 'source-over';
    dg.clearRect(0, 0, R.W, R.H);
    dg.fillStyle = 'rgba(2,4,18,0.94)';
    dg.fillRect(0, 0, R.W, R.H);
    dg.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { dg.globalAlpha = a; R.disc(dg, '#000', x, y, r); };
    for (const p of room.players) {
      const flick = Math.round(Math.sin(t * 7 + p.idx) * 1.5);
      hole(p.x, p.y - 10, 66 + flick, 0.35);
      hole(p.x, p.y - 10, 58 + flick, 0.5);
      hole(p.x, p.y - 10, 50 + flick, 1);
    }
    // faint bioluminescent plants
    for (let ty = 0; ty < room.tiles.length; ty++)
      for (let tx = 0; tx < room.tiles[0].length; tx++)
        if (room.tiles[ty][tx] === 'p') hole(tx * TS + 8, ty * TS + 8, 9 + Math.round(Math.sin(t * 2 + tx) * 1.5), 0.45);
    dg.globalAlpha = 1;
    ctx.drawImage(dark, 0, 0);
  }

  // ---------- dream images (16 x 16 icons) ----------
  function icon(ctx, kind, x, y) {
    const P = (c, px, py, w, h) => R.rect(ctx, c, x + px, y + py, w, h);
    const horse = '#8a5a34', mane = '#3a2414', blk = '#111016', skin = '#f2c49b';
    if (kind === 'horse' || kind === 'blinkers' || kind === 'mouth') {
      // horse head in profile
      P(mane, 9, 1, 3, 9); P(horse, 4, 2, 7, 6); P(horse, 1, 6, 9, 5); P(horse, 7, 8, 5, 7);
      P('#f1d7b0', 1, 9, 3, 2);
      P(horse, 6, 0, 2, 3);
      P(blk, 6, 4, 1, 1);
      if (kind === 'blinkers') { P(blk, 4, 2, 5, 5); P('#ffffff', 6, 4, 1, 1); }
      if (kind === 'mouth') P(blk, 0, 8, 6, 4);
      if (kind === 'horse') { P(horse, 8, 14, 5, 2); } // bigger neck: a big horse
      return;
    }
    if (kind === 'father') {
      P('#2a1d1a', 4, 1, 8, 3); P(skin, 4, 3, 8, 8); P('#2e2b3a', 2, 11, 12, 5);
      P(blk, 4, 5, 3, 3); P(skin, 5, 6, 1, 1); P(blk, 9, 5, 3, 3); P(skin, 10, 6, 1, 1); P(blk, 7, 6, 2, 1);
      P(blk, 5, 9, 6, 1);
      return;
    }
    if (kind === 'glasses') {
      for (const ox of [1, 9]) { P(blk, ox, 5, 6, 1); P(blk, ox, 10, 6, 1); P(blk, ox, 6, 1, 4); P(blk, ox + 5, 6, 1, 4); P('#bfe8fa', ox + 1, 6, 4, 4); }
      P(blk, 7, 7, 2, 1);
      return;
    }
    if (kind === 'moustache') {
      P(blk, 3, 6, 10, 3); P(blk, 1, 8, 3, 2); P(blk, 12, 8, 3, 2); P(blk, 0, 9, 2, 1); P(blk, 14, 9, 2, 1);
      P('#3a3440', 4, 6, 8, 1);
    }
  }

  // ---------- dream matcher: Superego plates (manifest, left) + Id plates (latent, right) ----------
  // def: { left: [[tx, ty] x3], right: [[tx, ty] x3] }. Plate positions are shuffled each time.
  G.ObjectTypes.matcher = (def, room) => {
    const C = G.CONTENT.dream;
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const mk = (side, pos, pairIdx) => ({
      side, pair: pairIdx, rect: G.tileRect(pos[0], pos[1], 2, 2), matched: false, flash: 0,
      kind: side === 'left' ? C.pairs[pairIdx].manifest : C.pairs[pairIdx].latent,
      label: side === 'left' ? C.pairs[pairIdx].mLabel : C.pairs[pairIdx].lLabel,
    });
    const order = () => shuffle([0, 1, 2]);
    const lo = order(), ro = order();
    const plates = [
      ...def.left.map((pos, i) => mk('left', pos, lo[i])),
      ...def.right.map((pos, i) => mk('right', pos, ro[i])),
    ];
    return {
      type: 'matcher', plates, matched: 0, holdT: 0, hold: null, offPair: null, wrongs: 0, feedback: null,
      plateOf(p, side) { return plates.find((q) => q.side === side && !q.matched && G.feetIn(p, q.rect)); },
      update(dt) {
        for (const q of plates) q.flash = Math.max(0, q.flash - dt);
        if (this.feedback && (this.feedback.t -= dt) <= 0) this.feedback = null;
        if (room.frozen) { this.hold = null; return; }
        const se = room.players.find((p) => p.role === 'superego'), id = room.players.find((p) => p.role === 'id');
        const a = this.plateOf(se, 'left'), b = this.plateOf(id, 'right');
        if (this.offPair && (a !== this.offPair[0] || b !== this.offPair[1])) this.offPair = null;
        if (!a || !b || this.offPair) { this.hold = null; return; }
        if (!this.hold || this.hold[0] !== a || this.hold[1] !== b) { this.hold = [a, b]; this.holdT = 0; }
        this.holdT += dt;
        if (this.holdT >= 1) this.check(a, b);
      },
      check(a, b) {
        this.hold = null;
        this.offPair = [a, b];
        a.flash = b.flash = 1.2;
        if (a.pair === b.pair) {
          a.matched = b.matched = true;
          a.flashCol = b.flashCol = '#ffd166';
          if (!this.wrongs) G.game.stats.firstTry++;
          this.wrongs = 0;
          G.audio.play('chime');
          for (const q of [a, b]) room.burst(q.rect.x + 16, q.rect.y + 12, ['#ffd166', '#fff1b8', '#ffffff'], 12, 50);
          this.feedback = { text: C.right + C.pairs[a.pair].text, col: '#ffd166', t: 3 };
          room.emit('matched', this.matched++);
        } else {
          a.flashCol = b.flashCol = '#E8453C';
          this.wrongs++;
          G.audio.play('buzz');
          G.Ego.wrong(room);
          room.shake(0.2);
          this.feedback = { text: C.hint, col: '#ffb15a', t: 3 };
        }
      },
      drawBelow(ctx, t) {
        for (const q of plates) {
          const r = q.rect, isL = q.side === 'left';
          const base = q.matched ? '#c9a24a' : isL ? '#3B7DD8' : '#E8453C';
          R.rect(ctx, '#05071a', r.x + 1, r.y + 1, r.w - 2, r.h - 1);
          R.rect(ctx, R.shade(base, -0.4), r.x + 2, r.y + 2, r.w - 4, r.h - 4);
          R.rect(ctx, q.matched ? '#ffe8a0' : '#dfe8ff', r.x + 4, r.y + 3, r.w - 8, r.h - 9);
          if (this.hold && this.hold.includes(q)) {
            ctx.globalAlpha = 0.3 + 0.15 * Math.sin(t * 12); R.rect(ctx, '#ffd166', r.x + 2, r.y + 2, r.w - 4, r.h - 4); ctx.globalAlpha = 1;
          }
          if (q.flash > 0) {
            ctx.globalAlpha = Math.min(1, q.flash) * (0.5 + 0.3 * Math.sin(t * 20));
            R.rect(ctx, q.flashCol, r.x + 2, r.y + 2, r.w - 4, r.h - 4);
            ctx.globalAlpha = 1;
          }
          icon(ctx, q.kind, r.x + 8, r.y + 4);
          F.draw(ctx, q.label, r.x + 16, r.y + r.h + 1, { align: 'center', color: isL ? '#bcd6ff' : '#ffc2b0', outline: '#05071a' });
        }
      },
      drawAbove(ctx) {
        if (!this.hold) return;
        const k = Math.floor(this.holdT * 24);
        for (const q of this.hold) {
          const cx = q.rect.x + 16, cy = q.rect.y + 14;
          for (let i = 0; i < 24; i++) {
            const ang = -Math.PI / 2 + (i / 24) * Math.PI * 2;
            R.rect(ctx, i < k ? '#ffd166' : 'rgba(20,16,34,0.5)', cx + Math.cos(ang) * 20 - 1, cy + Math.sin(ang) * 20 - 1, 2, 2);
          }
        }
      },
      drawUI(ctx) {
        if (!this.feedback) return;
        const lines = F.wrap(this.feedback.text, 420), h = 12 + lines.length * 10;
        const y = R.H - h - 6;
        R.panel(ctx, 20, y, R.W - 40, h, '#1c2340', this.feedback.col);
        lines.forEach((ln, i) => F.draw(ctx, ln, R.W / 2, y + 7 + i * 10, { align: 'center', color: this.feedback.col }));
      },
    };
  };

  // ---------- shadow guard: dissolves into smoke when its defence mechanism is named ----------
  G.ObjectTypes.guard = (def, room) => ({
    type: 'guard', id: def.id, label: def.label, x: def.x, y: def.y, fade: 1, dissolving: false, ph: Math.random() * 6,
    solid: { x: def.x - 10, y: def.y - 8, w: 20, h: 8 },
    dissolve() {
      this.dissolving = true;
      this.solid = null;
      G.audio.play('whoosh');
    },
    update(dt) {
      if (!this.dissolving) return;
      this.fade = Math.max(0, this.fade - dt / 0.9);
      if (Math.random() < 0.6) room.burst(this.x + (Math.random() - 0.5) * 18, this.y - Math.random() * 30, ['#3a3458', '#6a5a9a', '#9a8ac8'], 1, 25);
      if (this.fade === 0) this.dead = true;
    },
    draw(ctx, t) {
      const x = Math.round(this.x), y = Math.round(this.y), a = this.fade;
      ctx.globalAlpha = 0.3 * a;
      R.disc(ctx, '#05071a', x, y, 12, 3);
      ctx.globalAlpha = a;
      const o = '#05060f', body = '#1d1f36', plate = '#2c3052', hi = '#454a78';
      const sway = Math.round(Math.sin(t * 1.5 + this.ph));
      R.rect(ctx, o, x - 11, y - 30 + sway, 22, 30 - sway);
      R.rect(ctx, body, x - 10, y - 29 + sway, 20, 28 - sway);
      R.rect(ctx, plate, x - 8, y - 18 + sway, 16, 10);               // breastplate
      R.rect(ctx, hi, x - 8, y - 18 + sway, 16, 1);
      R.rect(ctx, o, x - 7, y - 36 + sway, 14, 12);                     // helmet
      R.rect(ctx, plate, x - 6, y - 35 + sway, 12, 10);
      R.rect(ctx, hi, x - 6, y - 35 + sway, 12, 1);
      R.rect(ctx, o, x - 5, y - 31 + sway, 10, 3);                       // visor
      const glow = 0.6 + 0.4 * Math.sin(t * 3 + this.ph);
      const eye = R.mix('#7a1f6a', '#ff4fd8', glow);
      R.rect(ctx, eye, x - 4, y - 30 + sway, 2, 1); R.rect(ctx, eye, x + 2, y - 30 + sway, 2, 1);
      R.rect(ctx, o, x - 1, y - 40 + sway, 2, 4); R.rect(ctx, '#3ff0e8', x - 1, y - 41 + sway, 2, 1); // crest
      R.rect(ctx, '#5a5f8a', x + 11, y - 34 + sway, 1, 34 - sway);        // spear
      R.rect(ctx, '#c9d3e4', x + 10, y - 38 + sway, 3, 4);
      ctx.globalAlpha = 1;
      if (!this.dissolving) F.draw(ctx, this.label, x, y - 52 + sway, { align: 'center', color: '#ff9ae8', outline: '#05071a' });
    },
  });

  G.Deep = { darkness, icon };
})();
