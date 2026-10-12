// Ending (§5 · 10): in the light Hans walks up to his father, who smiles and takes his hand; Freud sums up.
// Then a short scene: Hans in front of the house with a horse and cart, happy. Then the Case Notes.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font;

  // ---------- the street scene (160 x 90 px, drawn 3x = full screen) ----------
  const [street, sg] = R.makeCanvas(160, 90);
  function paintStreet(t) {
    const P = (c, x, y, w, h) => R.rect(sg, c, x, y, w, h);
    const skin = '#f2c49b', dark = '#1e1a22';
    ['#9fdcf7', '#b5e5f9', '#cbeefb', '#e0f6fd'].forEach((c, i) => P(c, 0, i * 18, 160, 18));
    R.disc(sg, '#fff3b0', 140, 14, 7);
    for (const [cx, cy, w] of [[30, 10, 22], [95, 16, 28]]) { const x = (cx + t * 3) % 190 - 15; P('#ffffff', x, cy, w, 3); P('#ffffff', x + 4, cy - 2, w - 9, 2); }
    // Viennese house
    P('#8a3f2e', 4, 18, 66, 6); P('#a8503a', 6, 16, 62, 3);
    P('#efe3c8', 6, 24, 62, 48); P('#d8c8a6', 6, 24, 62, 2);
    for (const wx of [12, 30, 48]) for (const wy of [30, 48]) {
      if (wx === 30 && wy === 48) continue;
      P('#6b4426', wx - 1, wy - 1, 10, 12); P('#7fc4e8', wx, wy, 8, 10); P('#6b4426', wx + 3, wy, 1, 10); P('#ffffff', wx + 1, wy + 1, 2, 2);
    }
    P('#3f6a46', 29, 54, 12, 18); P('#2f5236', 34, 54, 1, 18); P('#c9a24a', 38, 63, 1, 2);
    P('#8a8f9e', 0, 72, 160, 18);
    for (let y = 74; y < 90; y += 4) for (let x = (y % 8) ? 0 : 3; x < 160; x += 6) P('#a9aebb', x, y, 4, 2);
    // father, smiling, next to Hans
    const fx = 50;
    P('#2a1d1a', fx + 1, 39, 7, 2); P(skin, fx + 1, 40, 7, 7);
    P(dark, fx + 1, 42, 3, 2); P(dark, fx + 5, 42, 3, 2); P(skin, fx + 2, 42, 1, 1); P(skin, fx + 6, 42, 1, 1);
    P('#111016', fx + 2, 45, 5, 1); P('#c0504d', fx + 3, 46, 3, 1);
    P('#2e2b3a', fx, 47, 9, 14); P('#2e2b3a', fx + 9, 48, 2, 8); P(skin, fx + 9, 56, 2, 2);
    P('#24212e', fx + 1, 61, 3, 11); P('#24212e', fx + 5, 61, 3, 11);
    // Hans, waving
    const hx = 64, wave = Math.floor(t * 3) % 2;
    P('#e0b84a', hx, 56, 6, 2); P(skin, hx, 57, 6, 5);
    P(dark, hx + 1, 59, 1, 1); P(dark, hx + 4, 59, 1, 1); P('#c0504d', hx + 2, 61, 2, 1);
    P('#d9573b', hx, 62, 6, 5); P(skin, hx - 1, 62, 1, 3);
    P('#d9573b', hx + 6, 59 - wave, 1, 3); P(skin, hx + 6, 57 - wave, 2, 2);
    P('#2f3a5a', hx + 1, 67, 2, 5); P('#2f3a5a', hx + 3, 67, 2, 5);
    // a friendly horse with a cart
    const horse = '#a8703e', mane = '#4a2c18';
    const tail = Math.round(Math.sin(t * 4));
    P(mane, 129, 53 + tail, 2, 8);
    P(horse, 101, 50, 28, 12); P(R.shade(horse, 0.2), 101, 50, 28, 2);
    for (const lx of [103, 108, 121, 126]) { P(horse, lx, 62, 3, 9); P('#3a2414', lx, 70, 3, 2); }
    P(horse, 96, 40, 8, 14); P(horse, 89, 38, 11, 7); P('#f1d7b0', 89, 41, 3, 4);
    P(mane, 101, 37, 4, 14); P(horse, 98, 35, 2, 4);
    P(dark, 94, 40, 1, 1); P('#ffffff', 94, 39, 1, 1); P('#ffffff', 91, 38, 2, 2);
    P('#6b4426', 128, 55, 6, 1);
    P('#8a5a34', 134, 46, 24, 14); P('#a8703e', 134, 46, 24, 2); P('#6b4426', 134, 52, 24, 1);
    for (const wx of [139, 153]) { R.disc(sg, '#3a2414', wx, 63, 6); R.disc(sg, '#c9a24a', wx, 63, 4); R.disc(sg, '#3a2414', wx, 63, 1); }
    return street;
  }

  class EndingScene {
    constructor() {
      this.t = 0;
      this.phase = 'light';
      this.dialogue = new G.Dialogue();
      this.hx = 35;
      this.timed = false;
      G.audio.play('chime');
    }

    update(dt) {
      this.t += dt;
      if (this.phase === 'light') {
        if (this.t > 1.5) this.hx = Math.min(50, 35 + (this.t - 1.5) * 6);
        if (this.hx >= 50 && !this.talked) {
          this.talked = true;
          this.arriveT = this.t;
          G.audio.play('chime');
          this.dialogue.start(G.CONTENT.ending.freud, () => { this.phase = 'street'; this.t2 = 0; G.audio.play('whoosh'); });
        }
        this.dialogue.update(dt);
      } else {
        this.t2 += dt;
        if (!this.left && (this.t2 > 6 || (this.t2 > 1 && G.input.anyAction()))) { this.left = true; G.next(); }
      }
    }

    draw(ctx) {
      const t = this.t;
      if (this.phase === 'light') {
        R.rect(ctx, '#fffbe8', 0, 0, R.W, R.H);
        const glow = 0.5 + 0.5 * Math.sin(t * 2);
        ctx.globalAlpha = 0.5; R.disc(ctx, '#ffffff', 240, 100, 190 + glow * 6, 96 + glow * 3); ctx.globalAlpha = 1;
        const arrived = this.hx >= 50;
        const step = !arrived && this.t > 1.5 ? 1 + (Math.floor(t * 6) % 2) : 0;
        const img = G.Memory.scene(arrived ? 'together' : 'fear', this.hx, step);
        R.rect(ctx, '#e8dcf2', 76, 16, 328, 168);
        ctx.drawImage(img, 80, 20, 320, 160);
        const fadeIn = Math.max(0, 1 - t / 1.2);
        if (fadeIn > 0) { ctx.globalAlpha = fadeIn; R.rect(ctx, '#ffffff', 0, 0, R.W, R.H); ctx.globalAlpha = 1; }
        this.dialogue.draw(ctx, false);
      } else {
        ctx.drawImage(paintStreet(this.t2), 0, 0, R.W, R.H);
        const cap = G.CONTENT.ending.caption, w = F.measure(cap, 2) + 24;
        R.panel(ctx, R.W / 2 - w / 2, 10, w, 28, '#1c2340', '#ffd166');
        F.draw(ctx, cap, R.W / 2, 16, { scale: 2, align: 'center', color: '#ffffff', shadow: '#0b0e1c' });
        const flash = Math.max(0, 1 - this.t2 / 0.8);
        if (flash > 0) { ctx.globalAlpha = flash; R.rect(ctx, '#ffffff', 0, 0, R.W, R.H); ctx.globalAlpha = 1; }
      }
    }
  }

  G.EndingScene = EndingScene;
})();
