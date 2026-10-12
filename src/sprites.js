// Characters are generated in code: each layer is painted into a small buffer, then a dark outline is
// added automatically around the whole silhouette. Results are cached per look/direction/frame.
(function () {
  const G = window.G;
  const R = G.R;
  const OUTLINE = '#1a1222';
  const cache = new Map();

  function compose(key, w, h, paint) {
    let out = cache.get(key);
    if (out) return out;
    const [buf, b] = R.makeCanvas(w + 2, h + 2);
    b.translate(1, 1);
    paint(b);
    const [sil, s] = R.makeCanvas(w + 2, h + 2);
    s.drawImage(buf, 0, 0);
    s.globalCompositeOperation = 'source-in';
    s.fillStyle = OUTLINE;
    s.fillRect(0, 0, w + 2, h + 2);
    let o;
    [out, o] = R.makeCanvas(w + 2, h + 2);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) o.drawImage(sil, dx, dy);
    o.drawImage(buf, 0, 0);
    cache.set(key, out);
    return out;
  }

  const DOWN = 0, UP = 1, LEFT = 2, RIGHT = 3;
  const STEP = [0, 1, 0, -1];

  // Shared body: legs, torso, arms. Returns the vertical offset used for head/torso.
  function paintBody(g, cols, dir, f, bob) {
    const P = (c, x, y, w, h) => R.rect(g, c, x, y, w, h);
    const step = STEP[f];
    const lift = step !== 0 ? -1 : 0;
    const yo = lift + bob;

    // Legs + shoes
    if (dir === DOWN || dir === UP) {
      const lUp = step > 0 ? 1 : 0, rUp = step < 0 ? 1 : 0;
      P(cols.pants, 5, 19, 2, 4 - lUp); P(cols.shoe, 4, 22 - lUp, 3, 2);
      P(cols.pants, 9, 19, 2, 4 - rUp); P(cols.shoe, 9, 22 - rUp, 3, 2);
    } else {
      const s = dir === LEFT ? -1 : 1;
      P(cols.pants, 6 - step * s, 19, 2, 4); P(cols.shoe, 6 - step * s + (s < 0 ? -1 : 0), 22, 3, 2);
      P(cols.pants, 8 + step * s, 19, 2, 4); P(cols.shoe, 8 + step * s + (s < 0 ? -1 : 0), 22, 3, 2);
    }

    // Torso
    if (dir === DOWN || dir === UP) {
      P(cols.top, 4, 12 + yo, 8, 8 - yo);
      P(R.shade(cols.top, 0.18), 4, 12 + yo, 8, 1);
      P(R.shade(cols.top, -0.25), 4, 18, 8, 1);
      // arms swing opposite to legs
      P(R.shade(cols.top, -0.15), 2, 13 + yo + step, 2, 4); P(cols.skin, 2, 17 + yo + step, 2, 2);
      P(R.shade(cols.top, -0.15), 12, 13 + yo - step, 2, 4); P(cols.skin, 12, 17 + yo - step, 2, 2);
    } else {
      const s = dir === LEFT ? -1 : 1;
      P(cols.top, 5, 12 + yo, 6, 8 - yo);
      P(R.shade(cols.top, 0.18), 5, 12 + yo, 6, 1);
      P(R.shade(cols.top, -0.25), 5, 18, 6, 1);
      P(R.shade(cols.top, -0.15), 7 + step * s, 13 + yo, 2, 4); P(cols.skin, 7 + step * s, 17 + yo, 2, 2);
    }
    return yo;
  }

  function paintHead(g, skin, yo) {
    R.rect(g, skin, 3, 1 + yo, 10, 11);
    R.rect(g, skin, 2, 2 + yo, 12, 9);
    R.rect(g, R.shade(skin, -0.12), 3, 11 + yo, 10, 1);
  }

  function paintFace(g, dir, yo, eye = '#24161e', blush = '#f08a8a') {
    const P = (c, x, y, w, h) => R.rect(g, c, x, y + yo, w, h);
    if (dir === DOWN) { P(eye, 5, 6, 1, 2); P(eye, 10, 6, 1, 2); P(blush, 4, 8, 1, 1); P(blush, 11, 8, 1, 1); }
    else if (dir === LEFT) { P(eye, 4, 6, 1, 2); P(blush, 3, 8, 1, 1); }
    else if (dir === RIGHT) { P(eye, 11, 6, 1, 2); P(blush, 12, 8, 1, 1); }
  }

  // ---------- Player characters: body → fur/skin → outfit → hair/ears → accessory ----------
  const SPECIES = ['cat', 'fox', 'owl', 'human'];
  // 6 colour options per species: [main, accent]. Accent = hair colour for humans, ear tips / tufts for animals.
  const FUR = {
    cat: [['#f4f1ea', '#c9c2b6'], ['#9aa0ad', '#5f6574'], ['#f0a95a', '#b8642a'], ['#3e3848', '#24202a'], ['#e9d3b0', '#a8805a'], ['#c78b5e', '#6e4630']],
    fox: [['#ec7a32', '#3a2420'], ['#d9a45c', '#5a3a26'], ['#f2f0ec', '#8f9bb0'], ['#b8503a', '#2a1a1a'], ['#8f8a96', '#3d3846'], ['#e8c27a', '#7a5226']],
    owl: [['#a8794e', '#6e4a2c'], ['#efe9dc', '#a89c84'], ['#7d8494', '#4f5564'], ['#c9a368', '#8a6534'], ['#5c4a3e', '#2e241e'], ['#b67fd0', '#7a4a9a']],
    human: [['#fbd9be', '#e0b84a'], ['#f2c49b', '#3b2416'], ['#e0a878', '#1d1d2e'], ['#c68a5c', '#7a3a1e'], ['#9a623e', '#1a1418'], ['#6e4430', '#2a1a14']],
  };
  const OUTFITS = ['#d9573b', '#3b6fc4', '#3cb36a', '#f2c23a', '#8a4fc8', '#e86aa8', '#2fb8c0', '#4a4a5a'];
  const OPTION_COUNTS = { body: SPECIES.length, fur: 6, hair: 4, outfit: OUTFITS.length, acc: 6 };

  // Ear / tuft shapes per species and style, as rects for the LEFT side (mirrored for the right).
  // fur = main colour, acc = accent colour, in = inner ear colour.
  const EARS = {
    cat: [
      { fur: [[3, -2, 1, 1], [3, -1, 2, 1], [3, 0, 3, 1]], in: [[4, 0, 1, 1]] },
      { fur: [[3, -1, 3, 1], [2, 0, 5, 1]], in: [[4, 0, 2, 1]] },
      { fur: [[3, 0, 3, 1]], acc: [[2, 0, 1, 3]] },
      { fur: [[3, -2, 1, 1], [3, -1, 2, 1], [3, 0, 3, 1]], in: [[4, 0, 1, 1]], acc: [[7, -1, 1, 2], [6, 0, 2, 1]] },
    ],
    fox: [
      { fur: [[3, -3, 1, 1], [3, -2, 2, 1], [3, -1, 3, 1], [3, 0, 4, 1]], in: [[4, -1, 1, 1], [4, 0, 2, 1]] },
      { fur: [[3, -1, 3, 1], [3, 0, 4, 1]], acc: [[3, -3, 1, 1], [3, -2, 2, 1]], in: [[4, 0, 2, 1]] },
      { fur: [[3, -1, 2, 1], [3, 0, 3, 1]], in: [[4, 0, 1, 1]] },
      { fur: [[3, -3, 1, 1], [3, -2, 2, 1], [3, -1, 3, 1], [3, 0, 4, 1], [1, 7, 1, 4], [0, 8, 1, 2]], in: [[4, -1, 1, 1], [4, 0, 2, 1]] },
    ],
    owl: [
      {},
      { acc: [[3, -1, 1, 1], [3, 0, 2, 1]] },
      { acc: [[2, -2, 1, 1], [2, -1, 2, 1], [3, 0, 3, 1]] },
      { acc: [[7, -2, 1, 1], [6, -1, 2, 1], [5, 0, 3, 1]] },
    ],
  };
  const INNER = { cat: '#f4a0a8', fox: '#fff3e0' };

  function paintPlayer(g, L, dir, f, bob) {
    const sp = SPECIES[L.body] || 'human';
    const [fur, acc] = FUR[sp][L.fur] || FUR[sp][0];
    const top = OUTFITS[L.outfit] || OUTFITS[0];
    const hat = L.acc === 2 || L.acc === 5;
    const tail = sp === 'cat' || sp === 'fox';
    if (tail && dir !== UP) paintTail(g, sp, fur, dir, f);
    const yo = paintBody(g, { skin: fur, top, pants: R.shade(top, -0.55), shoe: '#2a1d1a' }, dir, f, bob);
    if (tail && dir === UP) paintTail(g, sp, fur, dir, f);
    paintHead(g, fur, yo);
    // P paints in "facing left" coordinates and mirrors automatically when facing right.
    const flip = dir === RIGHT;
    const P = (c, x, y, w, h) => R.rect(g, c, flip ? 16 - x - w : x, y + yo, w, h);
    const both = (c, x, y, w, h) => { R.rect(g, c, x, y + yo, w, h); R.rect(g, c, 16 - x - w, y + yo, w, h); };
    if (sp === 'human') {
      paintFace(g, dir, yo);
      paintHair(P, both, dir, L.hair, acc, hat);
    } else {
      if (!hat) {
        const e = EARS[sp][L.hair] || {};
        for (const r of e.fur || []) both(fur, ...r);
        for (const r of e.acc || []) both(acc, ...r);
        if (dir !== UP) for (const r of e.in || []) both(INNER[sp], ...r);
      }
      paintAnimalFace(P, both, sp, dir, fur);
    }
    paintAccessory(P, both, dir, L.acc, top);
  }

  function paintTail(g, sp, fur, dir, f) {
    const P = (c, x, y, w, h) => R.rect(g, c, dir === RIGHT ? 16 - x - w : x, y, w, h);
    const wag = f % 2;
    const tip = sp === 'fox' ? '#fff3e0' : R.shade(fur, -0.2);
    const big = sp === 'fox' ? 1 : 0;
    if (dir === DOWN) { P(fur, 13, 15 - wag, 2 + big, 5); P(tip, 13, 14 - wag, 2 + big, 1); }
    else if (dir === UP) { P(fur, 7 - big, 16, 3 + big, 4); P(fur, 7, 13 - wag, 2 + big, 3); P(tip, 7, 12 - wag, 2 + big, 1 + big); }
    else { P(fur, 11, 15, 3 + big, 3 + big); P(fur, 13, 12 - wag, 2, 3); P(tip, 13, 11 - wag - big, 2, 1 + big); }
  }

  function paintAnimalFace(P, both, sp, dir, fur) {
    if (dir === UP) return;
    const eye = '#24161e', blush = '#f08a8a';
    const side = dir !== DOWN;
    if (sp === 'owl') {
      const white = '#fff8e8', beak = '#f2a03a';
      if (side) { P(white, 2, 4, 4, 4); P(eye, 2, 5, 2, 2); P(beak, 0, 8, 2, 2); }
      else { both(white, 3, 4, 4, 4); both(eye, 4, 5, 2, 2); P(beak, 7, 8, 2, 2); P(R.shade(beak, -0.3), 7, 9, 2, 1); }
      return;
    }
    const muzzle = sp === 'fox' ? '#fff3e0' : R.shade(fur, 0.5);
    const nose = sp === 'fox' ? eye : '#e8788a';
    if (side) {
      if (sp === 'fox') { P(muzzle, 0, 8, 5, 3); P(nose, 0, 8, 1, 1); }
      else { P(muzzle, 2, 8, 3, 2); P(nose, 2, 8, 1, 1); }
      P(eye, 4, 6, 1, 2); P(blush, 5, 9, 1, 1);
    } else {
      if (sp === 'fox') P(muzzle, 4, 8, 8, 3); else P(muzzle, 6, 8, 4, 2);
      P(nose, 7, 8, 2, 1);
      both(eye, 5, 6, 1, 2); both(blush, 4, 8, 1, 1);
    }
  }

  function paintHair(P, both, dir, style, col, hat) {
    const hl = R.shade(col, 0.2);
    // Base for every style: short hair.
    if (dir === UP) { P(col, 2, 1, 12, 9); P(col, 3, 0, 10, 1); }
    else {
      P(col, 3, 0, 10, 1); P(col, 2, 1, 12, 3);
      if (dir === DOWN) { both(col, 2, 4, 1, 4); P(col, 4, 4, 3, 1); P(col, 9, 4, 2, 1); }
      else { P(col, 9, 4, 5, 4); P(col, 2, 4, 2, 1); }
    }
    if (style === 1) { // long
      if (dir === UP) P(col, 1, 3, 14, 10);
      else if (dir === DOWN) both(col, 1, 3, 2, 10);
      else P(col, 9, 4, 6, 9);
    } else if (style === 2) { // spiky
      if (!hat) { both(col, 3, -1, 2, 1); both(col, 6, -2, 1, 2); }
      if (dir === DOWN) P(col, 7, 4, 2, 2);
    } else if (style === 3 && !hat) { // bun
      P(col, 6, -3, 4, 3); P(hl, 7, -3, 2, 1);
    }
    if (dir !== UP) P(hl, 5, 1, 4, 1);
  }

  function paintAccessory(P, both, dir, acc, outfit) {
    if (acc === 1) { // round glasses
      const fr = '#26222a';
      if (dir === DOWN) {
        both(fr, 4, 5, 3, 1); both(fr, 4, 8, 3, 1); both(fr, 4, 6, 1, 2); both(fr, 6, 6, 1, 2); P(fr, 7, 6, 2, 1);
      } else if (dir !== UP) {
        P(fr, 3, 5, 3, 1); P(fr, 3, 8, 3, 1); P(fr, 3, 6, 1, 2); P(fr, 5, 6, 1, 2); P(fr, 6, 6, 5, 1);
      }
    } else if (acc === 2) { // top hat
      const c = '#2a2433';
      P(c, 1, 1, 14, 1); P(c, 4, -4, 8, 5); P('#b8443a', 4, -1, 8, 1); P(R.shade(c, 0.25), 5, -4, 1, 3);
    } else if (acc === 3) { // striped scarf
      const sc = '#e8b83a', st = '#7a4a1e';
      if (dir === DOWN) { P(sc, 3, 11, 10, 2); P(sc, 9, 13, 3, 4); P(st, 9, 15, 3, 1); }
      else if (dir === UP) { P(sc, 3, 11, 10, 2); P(sc, 5, 13, 3, 3); P(st, 5, 14, 3, 1); }
      else { P(sc, 4, 11, 8, 2); P(sc, 10, 13, 3, 4); P(st, 10, 15, 3, 1); }
      P(st, 6, 11, 1, 2);
    } else if (acc === 4) { // flower crown
      P('#4caf50', 2, 1, 12, 1);
      for (const [x, c] of [[3, '#ff8fb8'], [6, '#fff3a0'], [9, '#ffffff'], [12, '#ff8fb8']]) { P(c, x - 1, 0, 2, 1); P('#ffd166', x - 1, 0, 1, 1); }
    } else if (acc === 5) { // cap in the outfit colour
      const dark = R.shade(outfit, -0.3);
      P(outfit, 2, 0, 12, 3); P(R.shade(outfit, 0.25), 4, 0, 4, 1); P(dark, 7, -1, 2, 1);
      if (dir === DOWN) P(dark, 3, 3, 10, 1);
      else if (dir === UP) P(dark, 5, 3, 6, 1);
      else P(dark, 0, 3, 6, 1);
    }
  }

  function paintFreud(g, dir, f, bob) {
    const suit = '#2e2b3a', skin = '#e9bf98', white = '#f1efe9', grey = '#bdbdc4';
    const cols = { skin, top: suit, pants: '#24212e', shoe: '#141018' };
    const yo = paintBody(g, cols, dir, f, bob);
    const P = (c, x, y, w, h) => R.rect(g, c, x, y + yo, w, h);
    if (dir === DOWN) { P(white, 6, 12, 4, 3); P('#8a2c2c', 7, 13, 2, 3); }
    paintHead(g, skin, yo);
    // white hair at the sides and back (bald on top)
    P(white, 2, 3, 2, 5); P(white, 12, 3, 2, 5);
    if (dir === UP) { P(white, 2, 3, 12, 8); P(grey, 3, 10, 10, 1); return; }
    if (dir === DOWN) {
      P(white, 3, 8, 10, 3); P(white, 4, 11, 8, 2); P(white, 6, 13, 4, 1); // beard
      P(grey, 5, 8, 6, 1); // moustache
      P('#26222a', 4, 5, 3, 3); P(skin, 5, 6, 1, 1); P('#26222a', 9, 5, 3, 3); P(skin, 10, 6, 1, 1); // round glasses
      P('#26222a', 7, 6, 2, 1);
      P('#1b1b22', 5, 6, 1, 1); P('#1b1b22', 10, 6, 1, 1);
      P('#7a4a2a', 11, 10, 3, 1); P('#ff8a3a', 14, 10, 1, 1); // cigar
    } else {
      const s = dir === LEFT ? -1 : 1;
      const fx = s < 0 ? 2 : 9;
      P(white, fx, 8, 5, 4); P(white, fx + (s < 0 ? 1 : 0), 12, 4, 1);
      P('#26222a', s < 0 ? 3 : 10, 5, 3, 3); P(skin, s < 0 ? 4 : 11, 6, 1, 1);
      P(white, s < 0 ? 10 : 2, 3, 4, 6);
      P('#7a4a2a', s < 0 ? 0 : 13, 10, 3, 1); P('#ff8a3a', s < 0 ? -1 : 15, 10, 1, 1);
    }
  }

  function spriteFor(kind, look, dir, f, bob) {
    const key = kind + JSON.stringify(look || 0) + dir + f + bob;
    if (kind === 'freud') return compose(key, 16, 24, (g) => paintFreud(g, dir, f, bob));
    // Players get 4 px of headroom for ears, tufts and hats.
    return compose(key, 16, 28, (g) => { g.translate(0, 4); paintPlayer(g, look, dir, f, bob); });
  }

  function shadow(ctx, x, y) {
    R.disc(ctx, 'rgba(10,10,30,0.28)', x, y - 1, 6, 2);
  }

  // Role auras drawn around the customised character so roles stay recognisable (§2).
  function auraBack(ctx, role, x, y, t) {
    if (role === 'id') R.disc(ctx, 'rgba(243,156,52,0.22)', x, y - 1, 9, 3);
    else R.disc(ctx, 'rgba(120,170,255,0.22)', x, y - 1, 9, 3);
    if (role === 'id') flames(ctx, x, y, t, 0);
  }
  function auraFront(ctx, role, x, y, t) {
    if (role === 'id') flames(ctx, x, y, t, 1);
    else {
      const hy = y - 33 + Math.round(Math.sin(t * 3));
      R.ring(ctx, '#3B7DD8', x, hy + 1, 5, 2);
      R.ring(ctx, '#EAF2FF', x, hy, 5, 2);
      const sp = Math.floor(t * 4) % 4;
      R.rect(ctx, '#EAF2FF', x - 9 + sp * 6, y - 18 - sp * 2, 1, 1);
    }
  }
  function flames(ctx, x, y, t, layer) {
    for (let i = layer; i < 6; i += 2) {
      const ph = (t * 1.1 + i / 6) % 1;
      const px = x + Math.round(Math.sin(i * 2.1 + t * 3) * 7);
      const py = Math.round(y - 3 - ph * 20);
      const c = ph < 0.33 ? '#ffd166' : ph < 0.66 ? '#F39C34' : '#E8453C';
      const s = ph < 0.6 ? 2 : 1;
      R.rect(ctx, c, px, py, s, s);
    }
  }

  function tag(ctx, role, x, y) {
    const isId = role === 'id';
    G.Font.draw(ctx, isId ? 'ID' : 'SUPEREGO', x, y - 43, {
      align: 'center', color: isId ? '#F39C34' : '#EAF2FF', outline: '#141022',
    });
  }

  function drawCharacter(ctx, x, y, look, dir, f, bob) {
    shadow(ctx, x, y);
    ctx.drawImage(spriteFor('player', look, dir, f, bob), Math.round(x) - 9, Math.round(y) - 29);
  }

  function drawFreud(ctx, x, y, dir = 0, f = 0, bob = 0) {
    shadow(ctx, x, y);
    ctx.drawImage(spriteFor('freud', null, dir, f, bob), Math.round(x) - 9, Math.round(y) - 25);
  }

  G.Sprites = { DOWN, UP, LEFT, RIGHT, SPECIES, FUR, OUTFITS, OPTION_COUNTS, drawCharacter, drawFreud, auraBack, auraFront, tag, compose };
})();
