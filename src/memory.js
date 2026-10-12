// The Fixation Grove: ghostly "memory adults" and the memory bubble with Hans, his mother and his father.
// G.Memory.scene() paints the memory (also reused for the ending in milestone 7).
(function () {
  const G = window.G;
  const R = G.R, S = G.Sprites, TS = 16;

  // ---------- the memory scene (80 x 40 px, drawn 2x) ----------
  const SW = 80, SH = 40;
  const cache = {};

  // variant 'fear': the father stands apart, big and stern. 'together': he smiles and holds Hans's hand.
  // hansX (optional) animates Hans walking; such frames are drawn into one shared canvas instead of the cache.
  const [live, liveG] = R.makeCanvas(SW, SH);
  function scene(variant, hansX, step = 0) {
    const animated = hansX !== undefined;
    if (!animated && cache[variant]) return cache[variant];
    const [c, g] = animated ? [live, liveG] : R.makeCanvas(SW, SH);
    const P = (col, x, y, w, h) => R.rect(g, col, x, y, w, h);
    const together = variant === 'together';
    // room: wallpaper, window, floor
    P('#e9d6f2', 0, 0, SW, SH);
    for (let x = 2; x < SW; x += 6) P('#dcc4ea', x, 0, 2, 30);
    P('#7a5a9a', 6, 6, 14, 12); P('#bfe8fa', 7, 7, 12, 10); P('#7a5a9a', 12, 7, 1, 10); P('#7a5a9a', 7, 11, 12, 1);
    P('#b88a6a', 0, 30, SW, 10); P('#a07454', 0, 30, SW, 1);
    for (let x = 0; x < SW; x += 10) P('#a07454', x, 31, 1, 9);

    const skin = '#f2c49b', dark = '#1e1a22';
    // mother (left)
    const mx = 22;
    P('#6a3a1e', mx + 1, 7, 9, 4); P('#6a3a1e', mx + 3, 5, 5, 2);              // hair + bun
    P(skin, mx + 2, 10, 7, 7); P(dark, mx + 3, 12, 1, 1); P(dark, mx + 7, 12, 1, 1);
    P('#e88a8a', mx + 4, 15, 3, 1);
    P('#a0527a', mx + 1, 17, 9, 6); P('#a0527a', mx, 23, 11, 8); P('#8a3f66', mx, 30, 11, 1); // dress
    P(skin, mx - 1, 22, 2, 2);
    // Hans (small, 5 years old)
    const hx = animated ? Math.round(hansX) : together ? 50 : 35;
    P('#e0b84a', hx, 17, 7, 3);
    P(skin, hx, 19, 7, 5);
    P(dark, hx + 1, 21, 1, 1); P(dark, hx + 5, 21, 1, 1);
    if (!together) { P(dark, hx + 1, 20, 2, 1); P(dark, hx + 4, 20, 2, 1); } // worried brows
    else P('#c0504d', hx + 2, 23, 3, 1);
    P('#d9573b', hx, 24, 7, 4); P('#2f3a5a', hx + 1, 28 - (step === 1 ? 1 : 0), 2, 3); P('#2f3a5a', hx + 4, 28 - (step === 2 ? 1 : 0), 2, 3);
    // father (right, big)
    const fx = together ? 60 : 64;
    P('#2a1d1a', fx + 2, 2, 9, 3); P('#2a1d1a', fx + 1, 4, 2, 4); P('#2a1d1a', fx + 10, 4, 2, 4);
    P(skin, fx + 2, 4, 9, 10);
    // round glasses + moustache
    P(dark, fx + 2, 7, 4, 3); P(skin, fx + 3, 8, 2, 1); P(dark, fx + 7, 7, 4, 3); P(skin, fx + 8, 8, 2, 1); P(dark, fx + 6, 8, 1, 1);
    P('#111016', fx + 3, 11, 7, 2);
    if (together) { P('#c0504d', fx + 4, 13, 1, 1); P('#c0504d', fx + 8, 13, 1, 1); }
    else { P(dark, fx + 2, 6, 3, 1); P(dark, fx + 8, 6, 3, 1); P(dark, fx + 5, 13, 3, 1); } // stern brows
    P('#2e2b3a', fx, 14, 13, 13); P('#f1efe9', fx + 5, 14, 3, 3); P('#8a2c2c', fx + 6, 15, 1, 5);
    P('#2e2b3a', fx - 2, 15, 2, 9); P(skin, fx - 2, 24, 2, 2);
    P('#2e2b3a', fx + 13, 15, 2, 9); P(skin, fx + 13, 24, 2, 2);
    P('#24212e', fx + 2, 27, 4, 4); P('#24212e', fx + 7, 27, 4, 4);
    if (together) P(skin, hx + 7, 24, Math.max(1, fx - 2 - hx - 7), 1); // holding hands
    if (!animated) cache[variant] = c;
    return c;
  }

  // Pixel ellipse "bubble" with the memory scene inside. open: 0 (closed) .. 1 (fully open).
  function drawBubble(ctx, cx, cy, open, t, variant) {
    const rx = Math.round(14 + 74 * open), ry = Math.round(14 + 32 * open);
    ctx.globalAlpha = 0.35 + 0.25 * open;
    R.disc(ctx, '#c9a7ff', cx, cy, rx + 3, ry + 3);
    ctx.globalAlpha = 1;
    R.disc(ctx, '#3a2a5a', cx, cy, rx, ry);
    if (open > 0.6) {
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cx, cy, rx - 1, ry - 1, 0, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = Math.min(1, (open - 0.6) / 0.4);
      ctx.drawImage(scene(variant), cx - SW, cy - SH, SW * 2, SH * 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    } else {
      // closed: a slowly swirling glow
      for (let i = 0; i < 6; i++) {
        const a = t * 1.5 + i;
        R.rect(ctx, '#efe2ff', cx + Math.cos(a) * rx * 0.55, cy + Math.sin(a) * ry * 0.55, 2, 2);
      }
    }
    R.ring(ctx, '#efe2ff', cx, cy, rx, ry);
    R.rect(ctx, '#ffffff', cx - rx * 0.5, cy - ry * 0.6, 3, 2);
  }

  G.Memory = { scene, drawBubble };

  // ---------- room objects ----------
  // A memory bubble floating in the room; room.state[def.key] (0..1) controls how far it is open.
  G.ObjectTypes.memorybubble = (def, room) => ({
    type: 'memorybubble',
    drawAbove(ctx, t) {
      const open = room.state[def.key] || 0;
      drawBubble(ctx, def.x, def.y + Math.round(Math.sin(t * 1.5) * 2 * (1 - open)), open, t, def.variant || 'fear');
    },
  });

  // A semi-transparent "memory adult". The one whose quiz question is active glows and floats.
  G.ObjectTypes.ghost = (def, room) => ({
    type: 'ghost', x: def.x, y: def.y, index: def.index, fade: 1, ph: Math.random() * 6,
    solid: { x: def.x - 6, y: def.y - 6, w: 12, h: 6 },
    get quiz() { return room.find('quiz')[0]; },
    update(dt) {
      if (room.state.ghostsGone) {
        this.fade = Math.max(0, this.fade - dt / 1.2);
        if (this.fade === 0) this.dead = true;
      }
    },
    draw(ctx, t) {
      const q = this.quiz;
      const speaking = q && q.active && !q.done && q.qi === this.index;
      const lift = Math.round(Math.sin(t * 2 + this.ph) * (speaking ? 2 : 1));
      ctx.globalAlpha = 0.25 * this.fade;
      R.disc(ctx, speaking ? '#efe2ff' : '#c9a7ff', this.x, this.y - 12 + lift, 12, 16);
      ctx.globalAlpha = (speaking ? 0.85 : 0.5) * this.fade;
      S.drawCharacter(ctx, this.x, this.y + lift, def.look, S.DOWN, 0, Math.floor(t / 0.8) % 2);
      ctx.globalAlpha = 1;
      if (speaking && this.fade === 1) G.Font.draw(ctx, '...', this.x, this.y - 40 + lift, { align: 'center', color: '#efe2ff', outline: '#2a1a4a' });
    },
  });
})();
