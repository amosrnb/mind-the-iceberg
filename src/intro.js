// Animated back-story (between the title and the name entry): how Herbert Graf became "Little Hans".
// Six panels, each an animated pixel scene (240 x 135, drawn 2x) plus a caption with a typewriter effect.
// Figures get the same dark outline as the game's sprites. F / Enter = next, Esc = skip.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, S = G.Sprites;
  const SPEED = 45, PANEL_FADE = 0.25;
  const W = 240, H = 135;

  const [cv, g] = R.makeCanvas(W, H);
  const P = (c, x, y, w, h) => R.rect(g, c, x, y, w, h);
  // checkerboard dither between two colours (soft gradients / light in pixel art)
  function dither(c1, c2, x, y, w, h) {
    P(c1, x, y, w, h);
    g.fillStyle = c2;
    for (let yy = 0; yy < h; yy++) for (let xx = (yy % 2); xx < w; xx += 2) g.fillRect(Math.round(x + xx), Math.round(y + yy), 1, 1);
  }
  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

  const skin = '#f6cfa8', dark = '#1e1a22', white = '#f1efe9';
  const horseC = '#8a5a34', horseD = '#6e4428', horseL = '#a8703e', mane = '#2a1a10', hoof = '#241812', black = '#0e0c12';
  const harness = '#3a2414', brass = '#c9a24a';

  // Outlined sprites, cached (S.compose adds the dark outline like the game's characters).
  const spr = (key, w, h, paint) => S.compose('intro:' + key, w, h, (b) => paint((c, x, y, ww, hh) => R.rect(b, c, x, y, ww, hh), b));

  // ---------- characters ----------
  // Herbert, 4 years old, in a sailor suit (typical for boys in 1908). pose: stand | point | scared
  function herbert(x, y, pose, t) {
    const blink = Math.floor(t * 1.3) % 5 === 0 && pose !== 'scared';
    const img = spr('herbert' + pose + blink, 11, 20, (Q) => {
      const hair = '#e8c25a', navy = '#2b3f7a';
      Q(hair, 2, 0, 6, 1); Q(hair, 1, 1, 8, 2); Q(skin, 2, 2, 6, 5); Q(hair, 1, 2, 1, 3); Q(hair, 8, 2, 1, 2);
      if (blink) { Q(dark, 3, 4, 1, 1); Q(dark, 6, 4, 1, 1); }
      else { Q(dark, 3, 3, 1, 2); Q(dark, 6, 3, 1, 2); }
      Q('#f0a0a0', 2, 5, 1, 1); Q('#f0a0a0', 7, 5, 1, 1);
      if (pose === 'scared') Q('#6a1f1f', 4, 5, 2, 2); else Q('#b04040', 4, 6, 2, 1);
      Q(navy, 2, 7, 6, 6); Q(white, 2, 7, 6, 2); Q(navy, 4, 7, 2, 1); Q('#c0392b', 4, 9, 2, 2);
      if (pose === 'point') { Q(navy, 1, 8, 1, 4); Q(skin, 1, 12, 1, 1); Q(navy, 8, 8, 2, 1); Q(skin, 10, 8, 1, 1); }
      else if (pose === 'scared') { Q(navy, 0, 4, 1, 4); Q(skin, 0, 3, 1, 1); Q(navy, 9, 4, 1, 4); Q(skin, 9, 3, 1, 1); }
      else { Q(navy, 1, 8, 1, 4); Q(skin, 1, 12, 1, 1); Q(navy, 8, 8, 1, 4); Q(skin, 8, 12, 1, 1); }
      Q(navy, 2, 13, 6, 2); Q(skin, 3, 15, 1, 1); Q(skin, 6, 15, 1, 1);
      Q(white, 3, 16, 1, 2); Q(white, 6, 16, 1, 2); Q(dark, 2, 18, 2, 2); Q(dark, 6, 18, 2, 2);
    });
    const shake = pose === 'scared' ? Math.round(Math.sin(t * 40)) : 0;
    g.drawImage(img, Math.round(x) - 1 + shake, Math.round(y) - 21);
  }

  // Max Graf: bowler hat, moustache, dark overcoat.
  function maxGraf(x, y) {
    const img = spr('max', 12, 34, (Q) => {
      const hat = '#1e1a22', coat = '#2a2a3a', hair = '#3a2a20';
      Q(hat, 3, 0, 6, 3); Q(hat, 2, 3, 8, 1);
      Q(skin, 3, 4, 6, 6); Q(hair, 3, 4, 1, 2); Q(hair, 8, 4, 1, 2);
      Q(dark, 4, 6, 1, 1); Q(dark, 7, 6, 1, 1); Q(hair, 4, 8, 4, 1);
      Q(white, 4, 10, 4, 1);
      Q(coat, 1, 11, 10, 15); Q(R.shade(coat, 0.15), 5, 11, 2, 6); Q('#8a8070', 7, 15, 1, 1); Q('#8a8070', 7, 19, 1, 1);
      Q(coat, 0, 12, 1, 10); Q(skin, 0, 22, 1, 2); Q(coat, 11, 12, 1, 9); Q(skin, 11, 21, 1, 1);
      Q('#24212e', 2, 26, 3, 6); Q('#24212e', 7, 26, 3, 6); Q(dark, 1, 32, 4, 2); Q(dark, 7, 32, 4, 2);
    });
    g.drawImage(img, Math.round(x) - 1, Math.round(y) - 35);
  }

  // A horse facing left, walking (frame 0..3). The black blinkers and the black around its mouth are
  // what Hans was most afraid of later (see the Dream Chasm).
  const LEG_LIFT = [[0, 2, 0, 2], [1, 1, 1, 1], [2, 0, 2, 0], [1, 1, 1, 1]];
  function horse(x, y, f) {
    const img = spr('horse' + f, 40, 28, (Q) => {
      Q(mane, 35, 12, 2, 3); Q(mane, 36 + (f % 2), 14, 2, 7);                    // tail
      const lifts = LEG_LIFT[f];
      [15, 18, 29, 32].forEach((lx, i) => {
        const l = lifts[i], c = i % 2 ? horseD : horseC;
        Q(c, lx, 19, 2, 7 - l); Q(hoof, lx, 26 - l, 2, 1);
      });
      Q(horseC, 13, 11, 22, 9); Q(horseD, 14, 18, 20, 2); Q(horseL, 15, 11, 18, 1); // body
      Q(harness, 15, 14, 18, 1); Q(harness, 20, 10, 6, 4); Q(brass, 22, 11, 2, 1);
      Q(horseC, 8, 5, 5, 3); Q(horseC, 9, 8, 6, 8); Q(horseL, 9, 8, 1, 7);        // neck
      Q(mane, 10, 3, 3, 4); Q(mane, 12, 6, 3, 5); Q(mane, 14, 9, 2, 4);
      Q(harness, 12, 9, 3, 9); Q(brass, 13, 10, 1, 7);                            // horse collar
      Q(horseC, 2, 3, 7, 5); Q(horseC, 0, 6, 5, 4); Q(horseC, 6, 0, 2, 3);        // head, ear
      Q(black, 0, 8, 3, 3);                                                        // black around the mouth
      Q('#1a1010', 1, 7, 1, 1);
      Q(black, 4, 2, 4, 4); Q('#ffffff', 6, 3, 1, 1);                              // blinker + eye
      Q(harness, 3, 9, 6, 1);
    });
    g.drawImage(img, Math.round(x) - 1, Math.round(y) - 29);
  }

  // The horse lying on its side after the fall, legs kicking in the air (k = 0/1).
  function fallenHorse(x, y, k) {
    const img = spr('fallen' + k, 46, 24, (Q) => {
      // legs kicking up in the air
      [14, 19, 27, 32].forEach((lx, i) => {
        if ((i + k) % 2) { Q(horseD, lx, 4, 2, 9); Q(hoof, lx, 3, 2, 1); }
        else { Q(horseD, lx, 8, 2, 5); Q(horseD, lx + 2, 5, 2, 4); Q(hoof, lx + 3, 4, 2, 1); }
      });
      Q(mane, 36, 15, 6, 2); Q(mane, 40, 16 + k, 3, 5);                        // tail
      Q(horseC, 10, 12, 27, 10); Q(horseD, 11, 12, 25, 2); Q(horseL, 12, 20, 23, 1); // body (back on the ground)
      Q(harness, 15, 16, 20, 1); Q(harness, 22, 13, 6, 3);
      Q(harness, 10, 12, 3, 10); Q(brass, 11, 13, 1, 8);                       // horse collar
      Q(mane, 6, 12, 5, 3);
      Q(horseC, 2, 14, 9, 7); Q(horseC, 0, 16, 5, 6); Q(horseC, 6, 11, 2, 3);  // head on the ground, ear
      Q(black, 0, 18, 3, 4);                                                    // black around the mouth
      Q(black, 3, 14, 4, 4); Q('#ffffff', 5, 15, 1, 1);                         // blinker + wide eye
    });
    g.drawImage(img, Math.round(x) - 1, Math.round(y) - 25);
  }

  // A Viennese horse omnibus (body cached, wheels drawn live so they can turn).
  function omnibus(x, y, rot, driverUp) {
    const img = spr('bus' + driverUp, 64, 34, (Q) => {
      const body = '#2f5a3e', line = '#e0b84a', roof = '#3a2414';
      // driver on the high bench at the front
      const dy = driverUp ? -3 : 0;
      Q(dark, 2, 0 + dy + 3, 5, 3); Q(dark, 1, 3 + dy + 3, 7, 1);
      Q(skin, 2, 4 + dy + 3, 5, 3); Q('#5a2a2a', 1, 7 + dy + 3, 7, 6);
      if (driverUp) { Q('#5a2a2a', 7, 2, 1, 6); Q(skin, 7, 1, 1, 1); Q('#3a2414', 8, -1 + 3, 1, 1); }
      Q(roof, 0, 13, 9, 2); Q(roof, 1, 15, 7, 9);
      // body
      Q(roof, 6, 6, 58, 3); Q(roof, 9, 2, 52, 1);
      for (let px = 10; px < 60; px += 10) Q(roof, px, 3, 1, 3);
      Q(body, 7, 9, 56, 20); Q(R.shade(body, 0.15), 7, 9, 56, 2);
      Q(line, 7, 11, 56, 1); Q(line, 7, 27, 56, 1); Q(R.shade(body, -0.25), 7, 28, 56, 1);
      for (let i = 0; i < 5; i++) {
        const wx = 11 + i * 10;
        Q(roof, wx - 1, 13, 9, 10); Q('#bfe0ee', wx, 14, 7, 8); Q('#ffffff', wx, 14, 2, 3);
        if (i % 2 === 0) { Q('#3a2a20', wx + 2, 17, 3, 2); Q(skin, wx + 2, 19, 3, 3); }
      }
      Q('#f1efe9', 20, 23, 26, 3); for (let i = 0; i < 6; i++) Q('#2f5a3e', 22 + i * 4, 24, 2, 1);
    });
    g.drawImage(img, Math.round(x) - 1, Math.round(y) - 35);
    for (const [wx, r] of [[x + 14, 6], [x + 52, 7]]) {
      const cy = y - r;
      R.disc(g, '#1a1222', wx, cy, r + 1);
      R.disc(g, harness, wx, cy, r);
      R.disc(g, '#8a5a34', wx, cy, r - 2);
      for (let k = 0; k < 4; k++) {
        const a = rot + (k * Math.PI) / 4;
        for (let d = 1; d < r - 1; d++) P(harness, wx + Math.round(Math.cos(a) * d), cy + Math.round(Math.sin(a) * d), 1, 1);
        for (let d = 1; d < r - 1; d++) P(harness, wx - Math.round(Math.cos(a) * d), cy - Math.round(Math.sin(a) * d), 1, 1);
      }
      R.disc(g, brass, wx, cy, 1);
    }
  }

  // ---------- Vienna street (wider than the screen, scrolls with parallax) ----------
  const FACADES = [
    { c: '#efe3c8', roof: '#8a3f2e', shop: 'CAFE', awning: ['#c0392b', '#f1efe9'] },
    { c: '#e3c79a', roof: '#7a3a2a', shop: 'BAKER', awning: ['#2f5a3e', '#f1efe9'] },
    { c: '#d9b8a0', roof: '#8a3f2e', shop: null },
    { c: '#efe3c8', roof: '#6a3a2a', shop: 'HATS', awning: ['#2b3f7a', '#f1efe9'] },
    { c: '#cfd8c0', roof: '#8a3f2e', shop: null },
    { c: '#e8d0b0', roof: '#7a3a2a', shop: 'TOYS', awning: ['#c0392b', '#e0b84a'] },
  ];
  function street(t, cam, snow) {
    // sky
    const sky = ['#93a8be', '#a3b6ca', '#b3c3d4', '#c3d0de', '#d3dde8'];
    sky.forEach((c, i) => dither(c, sky[Math.min(i + 1, 4)], 0, i * 10, W, 10));
    P('#d3dde8', 0, 50, W, 20);
    // St. Stephen's Cathedral spire in the distance (slow parallax)
    const sx = 170 - cam * 0.25;
    for (let i = 0; i < 44; i++) { const w = Math.max(1, Math.round(i / 5)); P('#8b9db2', sx - w, 6 + i, w * 2 + 1, 1); }
    P('#8b9db2', sx - 10, 50, 21, 20); P('#7d8fa4', sx - 1, 2, 3, 5);
    // distant rooftops
    for (let x = -20; x < W + 40; x += 26) { const rx = Math.round(x - (cam * 0.5) % 26); P('#a9b6c4', rx, 40 + (x % 3) * 3, 24, 30); P('#97a5b5', rx + 6, 34 + (x % 3) * 3, 3, 6); }
    // facades
    for (let i = 0; i < FACADES.length; i++) {
      const f = FACADES[i], x = i * 60 - cam, top = 12 + (i % 3) * 5;
      if (x > W || x < -62) continue;
      P(f.roof, x, top - 4, 60, 5); P(R.shade(f.roof, 0.2), x, top - 4, 60, 1);
      P(f.c, x, top + 1, 59, 78 - top); P(R.shade(f.c, -0.15), x + 58, top + 1, 1, 78 - top);
      // cornices
      for (const cy of [top + 1, top + 25, 58]) { P(R.shade(f.c, 0.25), x, cy, 59, 1); P(R.shade(f.c, -0.25), x, cy + 1, 59, 1); }
      // windows with little pediments
      for (const wy of [top + 6, top + 30]) {
        if (wy > 50) continue;
        for (let k = 0; k < 4; k++) {
          const wx = x + 5 + k * 14;
          P(R.shade(f.c, -0.3), wx - 1, wy - 2, 9, 1); P(R.shade(f.c, -0.3), wx, wy - 3, 7, 1);
          P('#5a3a22', wx - 1, wy - 1, 9, 13); P('#9fc4dc', wx, wy, 7, 11); P('#c9e0ee', wx, wy, 7, 3);
          P('#5a3a22', wx + 3, wy, 1, 11); P('#5a3a22', wx, wy + 5, 7, 1);
          P(R.shade(f.c, 0.2), wx - 1, wy + 12, 9, 1);
        }
      }
      // ground floor: shop window + awning, or a door
      if (f.shop) {
        P('#3a2a20', x + 6, 62, 46, 16); P('#c9e0ee', x + 8, 64, 30, 12); P('#f5e6b0', x + 9, 70, 28, 5);
        P('#5a3a22', x + 41, 64, 9, 14);
        for (let k = 0; k < 12; k++) P(f.awning[k % 2], x + 4 + k * 4, 58, 4, 4);
        P(f.awning[0], x + 4, 62, 48, 1);
        P('#2a1d1a', x + 12, 51, 34, 6); P('#e0b84a', x + 13, 52, 32, 4);
      } else {
        P('#5a3a22', x + 22, 60, 15, 18); P('#6b4426', x + 24, 62, 5, 16); P('#6b4426', x + 30, 62, 5, 16); P(brass, x + 29, 70, 1, 1);
      }
    }
    // sidewalk, curb, snow along the curb
    P('#bdb6aa', 0, 78, W, 10); for (let x = -((cam) % 12); x < W; x += 12) P('#aaa294', x, 78, 1, 10);
    P('#8f877a', 0, 87, W, 2);
    for (let x = -((cam * 1) % 18); x < W; x += 18) { P('#eef3f8', x, 85, 10, 2); P('#eef3f8', x + 2, 84, 6, 1); }
    // gas lamps
    for (let lx = 30 - (cam % 110); lx < W + 20; lx += 110) {
      P('#2a2a2a', lx, 52, 2, 34); P('#2a2a2a', lx - 2, 85, 6, 2);
      P('#2a2a2a', lx - 3, 46, 8, 1); P('#3a3a3a', lx - 2, 47, 6, 5); P('#f5e6b0', lx - 1, 48, 4, 3); P('#2a2a2a', lx - 1, 44, 4, 2);
    }
    // advertising column (Litfass column)
    const ax = 150 - cam;
    if (ax > -20 && ax < W) {
      P('#3f4a3a', ax - 1, 50, 14, 2); R.disc(g, '#3f4a3a', ax + 6, 50, 6, 3);
      P('#5a6a5a', ax, 52, 12, 34); P('#e8d0a0', ax + 1, 55, 10, 12); P('#c0392b', ax + 2, 57, 8, 3); P('#2b3f7a', ax + 2, 61, 6, 4);
      P('#f1efe9', ax + 1, 69, 10, 10); P('#2f5a3e', ax + 3, 71, 6, 2); P('#2a2a2a', ax - 1, 85, 14, 2);
    }
    // road: cobblestones, a tram rail, slush
    P('#7d828f', 0, 89, W, H - 89);
    for (let y = 90; y < H; y += 4) for (let x = -((cam + (y % 8) * 2) % 8); x < W; x += 8) { P('#8a8f9c', x, y, 6, 2); P('#6c717d', x, y + 2, 6, 1); }
    P('#5a5e68', 0, 103, W, 1); P('#b9bec8', 0, 102, W, 1);
    // snowfall (two layers)
    if (snow) for (let i = 0; i < 70; i++) {
      const big = i % 4 === 0;
      const x = ((i * 53 + t * (big ? 14 : 8) + Math.sin(t * 1.3 + i) * 5 - cam * (big ? 1.2 : 0.8)) % W + W) % W;
      const y = (i * 29 + t * (big ? 26 : 15)) % H;
      P('#ffffff', x, y, big ? 2 : 1, big ? 2 : 1);
    }
  }

  // ---------- panels ----------
  const HORSE_HEAD = [ // silhouette for the shadow on the bedroom wall (facing left)
    '..........#...#.......',
    '.........##..##.......',
    '........##########....',
    '.......############...',
    '......#..###########..',
    '.....###############..',
    '....#################.',
    '...##################.',
    '..##########.....#####',
    '.#########........####',
    '########..........####',
    '#######...........####',
    '.####.............####',
    '..................####',
    '.................#####',
    '................######',
  ];

  const PANELS = [
    { // 1: a winter morning in Vienna; Herbert points at the horse omnibus
      paint(t) {
        const cam = ease(Math.min(1, t / 8)) * 30;
        street(t, cam, true);
        maxGraf(74 - cam, 86);
        herbert(62 - cam, 87, 'point', t);
        const bx = ((300 - t * 30) % 440 + 440) % 440 - 110;
        omnibus(bx + 36, 106, -t * 3, false);
        horse(bx, 106, Math.floor(t * 8) % 4);
      },
    },
    { // 2: the horse falls in front of him
      paint(t) {
        const cam = 20;
        street(t, cam, true);
        maxGraf(74 - cam, 86);
        if (t < 1.4) {
          herbert(62 - cam, 87, 'stand', t);
          const bx = 250 - t * 100;
          omnibus(bx + 36, 106, -t * 9, false);
          horse(bx, 106, Math.floor(t * 12) % 4);
        } else {
          omnibus(146, 106, 0, Math.floor(t * 3) % 2 === 0);
          fallenHorse(100, 107, Math.floor(t * 10) % 2);
          herbert(62 - cam, 87, 'scared', t);
          // a speech bubble with a big red !
          const by = 50 + (Math.floor(t * 6) % 2);
          P('#1a1222', 39, by - 1, 12, 13); P('#ffffff', 40, by, 10, 11); P('#1a1222', 43, by + 12, 3, 2); P('#ffffff', 44, by + 11, 1, 2);
          P('#E8453C', 44, by + 2, 2, 5); P('#E8453C', 44, by + 8, 2, 2);
          // dust clouds
          for (let i = 0; i < 7; i++) {
            const a = (t - 1.4) * 1.5;
            g.globalAlpha = Math.max(0, 0.6 - a * 0.25);
            R.disc(g, '#d8d2c8', 104 + i * 6 + Math.sin(t * 2 + i) * 2, 102 - (i % 3) * 3 - a * 3, 3 + (i % 2), 2);
            g.globalAlpha = 1;
          }
        }
      },
      shake: (t) => t > 1.4 && t < 2.1,
      flash: (t) => (t > 1.4 && t < 1.5 ? 0.6 : 0),
      sfx(t, prev) { if (prev < 1.4 && t >= 1.4) { G.audio.play('smash'); G.audio.play('buzz'); } },
    },
    { // 3: night. The moon throws the rocking horse's shadow onto the wall, and it grows.
      paint(t) {
        // wallpaper
        P('#252c58', 0, 0, W, 96);
        for (let x = 0; x < W; x += 8) P('#2a3262', x, 0, 3, 96);
        for (let y = 6; y < 92; y += 12) for (let x = (y % 24 ? 4 : 0); x < W; x += 8) { P('#36407a', x + 1, y, 1, 1); P('#36407a', x, y + 1, 3, 1); P('#36407a', x + 1, y + 2, 1, 1); }
        P('#3a2a22', 0, 94, W, 2); P('#4a362a', 0, 96, W, H - 96);
        for (let y = 100; y < H; y += 6) P('#3a2a22', 0, y, W, 1);
        // window: snowy roofs, stars, moon
        P('#4a3428', 166, 14, 46, 54); P('#0c1232', 169, 17, 40, 48);
        for (let i = 0; i < 9; i++) P('#ffffff', 171 + (i * 13) % 36, 19 + (i * 7) % 18, 1, 1);
        R.disc(g, '#fff6c8', 196, 28, 5); g.globalAlpha = 0.25; R.disc(g, '#fff6c8', 196, 28, 9); g.globalAlpha = 1;
        P('#1a2048', 169, 50, 40, 15); P('#c8d4ee', 169, 49, 18, 2); P('#c8d4ee', 189, 46, 20, 2); P('#1a2048', 191, 40, 4, 8);
        P('#4a3428', 188, 17, 2, 48); P('#4a3428', 169, 40, 40, 2); P('#6a4a38', 164, 66, 50, 3);
        const sway = Math.round(Math.sin(t * 1.2) * 1.5);
        P('#6a3048', 158, 10, 9 + sway, 62); P('#7a3a58', 158, 10, 3, 62); P('#6a3048', 211 - sway, 10, 9 + sway, 62);
        P('#3a2a22', 156, 8, 66, 3);
        // moonlight falling across the room
        g.globalAlpha = 0.18;
        for (let i = 0; i < 40; i++) P('#c8d4ff', 150 - i * 2, 66 + i, 44, 1);
        g.globalAlpha = 1;
        // the rocking horse in the moonlight
        const rock = Math.sin(t * 2.2);
        const rx = 120, ry = 108 + Math.round(rock);
        P('#6b4426', rx - 4, ry, 30, 2); P('#6b4426', rx - 6, ry - 1, 3, 1); P('#6b4426', rx + 25, ry - 1, 3, 1);
        P('#e8dcc0', rx + 4, ry - 12, 16, 7); P('#c0392b', rx + 9, ry - 13, 6, 3);
        P('#e8dcc0', rx + 1, ry - 18, 6, 7); P('#e8dcc0', rx - 2, ry - 16, 4, 3); P('#5a3a22', rx + 4, ry - 19, 3, 6);
        P(dark, rx + 1, ry - 16, 1, 1); P('#5a3a22', rx + 20, ry - 12, 3, 5);
        for (const lx of [rx + 5, rx + 17]) P('#d8ccb0', lx, ry - 5, 2, 5);
        // its shadow on the wall grows and creeps towards the bed
        const s = ease(Math.min(1, t / 3));
        const hs = 2 + Math.round(s * 1), sx = 92 - Math.round(s * 30), sy = 18 - Math.round(s * 8);
        g.globalAlpha = 0.25 + 0.45 * s;
        HORSE_HEAD.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '#') P('#0a0d26', sx + x * hs, sy + y * hs, hs, hs); });
        g.globalAlpha = 1;
        // bed
        P('#5a3622', 18, 66, 5, 40); P('#5a3622', 98, 76, 4, 30); R.disc(g, '#7a4a2a', 20, 65, 3);
        P('#6a4430', 18, 72, 5, 2);
        P('#5a3622', 18, 98, 84, 4);
        P(white, 23, 80, 18, 8); P('#d8d4cc', 23, 86, 18, 2);
        P('#3b6fc4', 33, 84, 66, 14); P('#2f5fb0', 33, 84, 66, 2);
        for (let x = 38; x < 98; x += 8) for (let y = 88; y < 98; y += 5) P('#5a8ad8', x, y, 3, 2);
        // Herbert, blanket pulled up, eyes on the shadow
        const tremble = Math.round(Math.sin(t * 30) * 0.6);
        P('#e8c25a', 27 + tremble, 76, 10, 3); P(skin, 27 + tremble, 78, 10, 6);
        P('#ffffff', 28 + tremble, 79, 3, 3); P('#ffffff', 33 + tremble, 79, 3, 3);
        P(dark, 30 + tremble, 79, 1, 2); P(dark, 35 + tremble, 79, 1, 2);
        P('#3b6fc4', 26, 83, 14, 3);
        if (Math.floor(t * 2) % 3 === 0) P('#9fd0ff', 38 + tremble, 77, 1, 2);
      },
    },
    { // 4: Max Graf writes to Professor Freud at night
      paint(t) {
        P('#3a2a24', 0, 0, W, 92);
        for (let y = 4; y < 90; y += 10) for (let x = (y % 20 ? 5 : 0); x < W; x += 10) { P('#45322a', x + 1, y, 2, 1); P('#45322a', x, y + 1, 4, 2); P('#45322a', x + 1, y + 3, 2, 1); }
        P('#2a1d18', 0, 92, W, H - 92);
        // night window, bookshelf, coat + bowler hat on a hook
        P('#4a3428', 8, 12, 32, 42); P('#0c1232', 11, 15, 26, 36); P('#4a3428', 23, 15, 2, 36); P('#4a3428', 11, 31, 26, 2);
        for (let i = 0; i < 5; i++) P('#ffffff', 13 + (i * 7) % 22, 18 + (i * 5) % 12, 1, 1);
        P('#3a2418', 46, 10, 30, 60);
        const books = ['#8a2c2c', '#2b3f7a', '#c9a24a', '#2f5a3e', '#6a3a8a'];
        for (let r = 0; r < 4; r++) for (let i = 0; i < 8; i++) P(books[(i + r) % 5], 48 + i * 3, 13 + r * 14, 2, 11 - (i % 3));
        P('#c9a24a', 140, 18, 2, 2); P('#2a2a3a', 135, 20, 10, 26); P('#1e1a22', 135, 16, 10, 3); P('#1e1a22', 133, 19, 14, 1);
        // the desk
        P('#5a3a22', 78, 82, 70, 4); P('#6b4426', 76, 80, 74, 3); P('#8a5a34', 76, 80, 74, 1);
        P('#5a3a22', 80, 86, 4, 30); P('#5a3a22', 142, 86, 4, 30); P('#4a3020', 116, 86, 24, 12); P(brass, 127, 91, 2, 1);
        // green banker's lamp + warm light
        g.globalAlpha = 0.14 + 0.03 * Math.sin(t * 7);
        R.disc(g, '#ffe7a0', 118, 76, 44, 26);
        g.globalAlpha = 0.22; R.disc(g, '#ffe7a0', 118, 79, 26, 6); g.globalAlpha = 1;
        P(brass, 124, 66, 2, 14); P(brass, 120, 78, 10, 2);
        P('#1e4a2e', 112, 60, 18, 6); P('#2f6a46', 113, 60, 16, 2); P('#ffe7a0', 114, 66, 14, 1);
        // inkwell, papers, envelopes
        P(dark, 136, 76, 5, 4); P('#2b3f7a', 137, 75, 3, 1);
        P('#f3e8cc', 100, 77, 14, 3); P('#e7d7b2', 102, 76, 12, 1);
        P('#e8dcc0', 140, 78, 8, 2); P('#c0392b', 143, 78, 2, 1);
        // Max Graf at the desk, writing (seen from the side)
        const w = Math.round(Math.sin(t * 9));
        P('#4a3020', 80, 70, 4, 46); P('#4a3020', 80, 92, 18, 3); P('#4a3020', 84, 95, 2, 20); P('#4a3020', 96, 95, 2, 20);
        P('#3a2a20', 86, 48, 10, 4); P(skin, 87, 51, 10, 9); P('#3a2a20', 86, 51, 2, 4);
        P(dark, 94, 54, 1, 1); P('#3a2a20', 94, 57, 4, 1); P(white, 89, 60, 7, 1);
        P('#2a2a3a', 84, 61, 14, 31); P('#353548', 92, 61, 2, 12);
        P('#2a2a3a', 96, 68, 9 + w, 4); P(skin, 104 + w, 70, 3, 3); P(dark, 106 + w, 67, 1, 5);
        P('#24212e', 96, 90, 14, 4); P('#24212e', 108, 94, 3, 18); P(dark, 107, 111, 6, 2);
      },
      overlay(ctx, t) {
        const L = G.CONTENT.intro.letter, x = 312, y = 30;
        R.rect(ctx, 'rgba(0,0,0,0.35)', x + 4, y + 4, 150, 136);
        R.rect(ctx, '#1e140e', x - 1, y - 1, 152, 136);
        R.rect(ctx, '#f3e8cc', x, y, 150, 134);
        R.rect(ctx, '#e7d7b2', x, y, 150, 4);
        for (let ly = y + 18; ly < y + 130; ly += 13) R.rect(ctx, '#dccdaa', x + 6, ly, 138, 1);
        let left = Math.floor(t * 16);
        L.forEach((ln, i) => {
          if (left <= 0) return;
          F.draw(ctx, ln.slice(0, left), x + 8, y + 8 + i * 13, { color: '#2b2a4a' });
          left -= ln.length + 2;
        });
      },
    },
    { // 5: Freud's consulting room. He reads the letters and names the case LITTLE HANS.
      paint(t) {
        P('#4a2e28', 0, 0, W, 90);
        for (let x = 0; x < W; x += 12) P('#52342c', x, 0, 5, 90);
        P('#3a2418', 0, 0, W, 4); P('#2a1a14', 0, 88, W, 2);
        dither('#7a4a2a', '#6b4022', 0, 90, W, H - 90);
        // bookshelf
        P('#3a2418', 4, 14, 44, 70);
        const books = ['#8a2c2c', '#2b3f7a', '#c9a24a', '#2f5a3e', '#6a3a8a', '#d9573b'];
        for (let r = 0; r < 5; r++) { P('#2a1a10', 6, 27 + r * 13, 40, 1); for (let i = 0; i < 12; i++) P(books[(i + r * 2) % 6], 6 + i * 3 + (i > 7 ? 1 : 0), 17 + r * 13, 2, 10 - (i % 3)); }
        // the famous couch with an oriental rug draped over it
        P('#3a2418', 54, 74, 60, 14); P('#5a2a2a', 56, 70, 56, 10); P('#7a3a3a', 56, 70, 56, 2);
        for (let x = 58; x < 110; x += 6) { P('#c9a24a', x, 73, 2, 2); P('#2b3f7a', x + 3, 76, 2, 2); }
        P('#5a2a2a', 54, 62, 10, 14); P('#e8dcc0', 58, 64, 10, 5);
        P('#3a2418', 56, 88, 3, 6); P('#3a2418', 108, 88, 3, 6);
        // antiquities on a shelf (Freud collected small ancient statues)
        P('#3a2418', 60, 38, 50, 3);
        P('#c9b48a', 64, 28, 4, 10); P('#c9b48a', 63, 27, 6, 2); P('#8a9a7a', 74, 30, 6, 8); P('#8a9a7a', 75, 27, 4, 3);
        P('#b08a5a', 86, 32, 8, 6); P('#d8c8a0', 99, 26, 4, 12); P('#d8c8a0', 98, 25, 6, 2);
        // desk with the pile of letters
        P('#5a3a22', 116, 84, 60, 4); P('#6b4426', 114, 82, 64, 3); P('#5a3a22', 118, 88, 4, 30); P('#5a3a22', 170, 88, 4, 30);
        for (let i = 0; i < 6; i++) P(i % 2 ? '#f3e8cc' : '#e7d7b2', 150 + (i % 2), 79 - i * 2, 18, 2);
        P(dark, 128, 78, 4, 4); P('#8a8070', 129, 77, 2, 1);
        // an envelope flies in
        if (t < 1) { const ex = 240 - ease(t) * 88, ey = 22 + t * 52; P('#1a1222', ex - 1, ey - 1, 14, 10); P('#f3e8cc', ex, ey, 12, 8); P('#c9a24a', ex + 4, ey + 3, 4, 2); }
      },
      overlay(ctx, t) {
        ctx.save(); ctx.translate(276, 182); ctx.scale(2, 2); S.drawFreud(ctx, 0, 0, S.DOWN, 0, Math.floor(t / 0.7) % 2); ctx.restore();
        // cigar smoke
        for (let i = 0; i < 4; i++) {
          const k = (t * 0.6 + i / 4) % 1;
          ctx.globalAlpha = 0.5 * (1 - k);
          R.disc(ctx, '#d8d8e0', 290 + Math.sin(k * 6 + i) * 4, 150 - k * 40, 2 + k * 3);
          ctx.globalAlpha = 1;
        }
        // case file: the real name is crossed out, then LITTLE HANS is stamped
        const C = G.CONTENT.intro.file, x = 336, y = 36;
        R.rect(ctx, 'rgba(0,0,0,0.35)', x + 4, y + 4, 130, 106);
        R.rect(ctx, '#1e140e', x - 1, y - 1, 132, 106);
        R.rect(ctx, '#e8c27a', x, y, 130, 104); R.rect(ctx, '#d4ad60', x, y, 130, 10); R.rect(ctx, '#d4ad60', x + 90, y - 6, 34, 7);
        F.draw(ctx, C.title, x + 65, y + 16, { align: 'center', color: '#3a2414' });
        F.draw(ctx, C.real, x + 65, y + 38, { align: 'center', color: '#2b2a4a' });
        const rw = F.measure(C.real) + 8;
        if (t > 0.8) R.rect(ctx, '#9a2a2a', x + 65 - rw / 2, y + 41, Math.min(1, (t - 0.8) / 0.4) * rw, 2);
        if (t > 1.4) {
          const big = t - 1.4 < 0.12;
          ctx.globalAlpha = 0.9;
          F.draw(ctx, C.stamp, x + 65, y + 62 - (big ? 4 : 0), { scale: big ? 3 : 2, align: 'center', color: '#c0504d' });
          ctx.globalAlpha = 1;
          R.rect(ctx, '#c0504d', x + 8, y + 58, 114, 1); R.rect(ctx, '#c0504d', x + 8, y + 80, 114, 1);
        }
      },
      sfx(t, prev) { if (prev < 1.4 && t >= 1.4) G.audio.play('stamp'); },
    },
    { // 6: a knock at the door; two figures wait behind the frosted glass
      paint(t) {
        P('#4a2e28', 0, 0, W, 98);
        for (let x = 0; x < W; x += 12) P('#52342c', x, 0, 5, 98);
        // herringbone parquet
        P('#6b4022', 0, 98, W, H - 98);
        for (let y = 98; y < H; y += 4) for (let x = (y % 8 ? 0 : 4); x < W; x += 8) { P('#7a4a2a', x, y, 4, 2); P('#5a3418', x + 4, y + 2, 4, 2); }
        P('#2a1a14', 0, 96, W, 2);
        // coat stand with Freud's hat and stick
        P('#3a2418', 196, 30, 3, 68); P('#3a2418', 190, 96, 15, 2); P('#3a2418', 190, 32, 15, 2);
        P('#1e1a22', 186, 26, 10, 6); P('#1e1a22', 184, 31, 14, 1); P('#2a2a3a', 199, 34, 9, 30); P('#5a3a22', 205, 50, 1, 46);
        // the door
        const knock = [0.6, 0.9, 1.2].some((k) => t > k && t < k + 0.1);
        const dx = knock ? 1 : 0;
        P('#1e140e', 92, 10, 66, 90); P('#c9a24a', 93, 11, 64, 1);
        P('#6b4426', 95 + dx, 13, 60, 87); P('#7a5030', 95 + dx, 13, 60, 2);
        // frosted glass, lit from the stairwell
        P('#3a2418', 101 + dx, 19, 48, 34); dither('#e8dcb0', '#d8c898', 103 + dx, 21, 44, 30);
        if (t > 0.3) {
          g.globalAlpha = Math.min(0.55, (t - 0.3) * 0.8);
          // two figures behind the glass: the players
          for (const [fx, h] of [[114, 0], [134, 2]]) {
            R.disc(g, '#4a3a3a', fx + dx, 32 + h, 5); P('#4a3a3a', fx - 7 + dx, 38 + h, 15, 13 - h);
          }
          g.globalAlpha = 1;
        }
        P('#5a3a22', 101 + dx, 58, 21, 36); P('#5a3a22', 128 + dx, 58, 21, 36);
        P('#7a5030', 101 + dx, 58, 21, 1); P('#7a5030', 128 + dx, 58, 21, 1);
        P(brass, 146 + dx, 58, 4, 2); P(brass, 147 + dx, 60, 2, 3);
        g.globalAlpha = 0.7; P('#ffe7a0', 95, 99, 60, 1); g.globalAlpha = 1;
      },
      overlay(ctx, t) {
        ctx.save(); ctx.translate(120, 214); ctx.scale(2, 2);
        S.drawFreud(ctx, 0, 0, t > 0.7 ? S.RIGHT : S.DOWN, 0, 0); ctx.restore();
        if (t > 1.4) F.draw(ctx, '?', 136, 132 + Math.round(Math.sin(t * 4)), { scale: 2, color: '#ffd166', outline: '#1e140e' });
        [0.6, 0.9, 1.2].forEach((k, i) => {
          if (t < k) return;
          ctx.globalAlpha = Math.max(0, 1 - (t - k) / 1.5);
          F.draw(ctx, G.CONTENT.intro.knock, 334 + i * 16, 60 + i * 22, { scale: 2, color: '#ffd166', outline: '#1e140e' });
          ctx.globalAlpha = 1;
        });
      },
      sfx(t, prev) { for (const k of [0.6, 0.9, 1.2]) if (prev < k && t >= k) G.audio.play('knock'); },
    },
  ];

  // Soft dark vignette around the picture (old-photo feel).
  function vignette(ctx) {
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.07;
      const k = i * 3;
      R.rect(ctx, '#05030a', k, k, R.W - 2 * k, 3);
      R.rect(ctx, '#05030a', k, R.H - k - 3, R.W - 2 * k, 3);
      R.rect(ctx, '#05030a', k, k + 3, 3, R.H - 2 * k - 6);
      R.rect(ctx, '#05030a', R.W - k - 3, k + 3, 3, R.H - 2 * k - 6);
    }
    ctx.globalAlpha = 1;
  }

  class IntroScene {
    constructor() {
      this.i = 0;
      this.t = 0;          // time in the current panel
      this.fade = 1;       // fade in from black
      this.leaving = false;
      this.pausable = false;
      this.startPanel(0);
    }

    startPanel(i) {
      this.i = i;
      this.t = 0;
      this.lines = F.wrap(G.CONTENT.intro.panels[i], 436);
      this.total = this.lines.reduce((n, l) => n + l.length, 0);
      this.shown = 0;
    }

    update(dt) {
      if (this.leaving) return;
      if (G.input.wasPressed('Escape')) { this.leave(); return; }
      if (this.switching) {
        this.fade = Math.min(1, this.fade + dt / PANEL_FADE);
        if (this.fade >= 1) { this.switching = false; this.startPanel(this.i + 1); }
        return;
      }
      this.fade = Math.max(0, this.fade - dt / PANEL_FADE);
      const prev = this.t;
      this.t += dt;
      const p = PANELS[this.i];
      if (p.sfx) p.sfx(this.t, prev);
      const before = Math.floor(this.shown);
      this.shown = Math.min(this.total, this.shown + dt * SPEED);
      if (Math.floor(this.shown) !== before && before % 4 === 0) G.audio.play('type');
      if (G.input.anyAction()) {
        if (this.shown < this.total) this.shown = this.total;
        else if (this.i < PANELS.length - 1) { G.audio.play('blip'); this.switching = true; }
        else this.leave();
      }
    }

    leave() { this.leaving = true; G.audio.play('select'); G.next(); }

    draw(ctx) {
      const p = PANELS[this.i], t = this.t;
      p.paint(t);
      ctx.save();
      if (p.shake && p.shake(t)) ctx.translate(Math.round((Math.random() - 0.5) * 6), Math.round((Math.random() - 0.5) * 4));
      ctx.drawImage(cv, 0, 0, R.W, R.H);
      if (p.overlay) p.overlay(ctx, t);
      ctx.restore();
      const flash = p.flash ? p.flash(t) : 0;
      if (flash) { ctx.globalAlpha = flash; R.rect(ctx, '#ffffff', 0, 0, R.W, R.H); ctx.globalAlpha = 1; }
      vignette(ctx);

      // caption with typewriter effect
      const h = 18 + this.lines.length * 11, y = R.H - h - 6;
      R.panel(ctx, 14, y, R.W - 28, h, '#1c2340', '#eaf2ff');
      let left = Math.floor(this.shown);
      this.lines.forEach((ln, k) => {
        if (left <= 0) return;
        F.draw(ctx, ln.slice(0, left), 22, y + 7 + k * 11, { color: '#ffffff' });
        left -= ln.length;
      });
      const C = G.CONTENT.intro;
      F.draw(ctx, `${this.i + 1}/${PANELS.length}`, 8, 6, { color: '#ffffff', outline: '#141022' });
      F.draw(ctx, C.skip, R.W - 8, 6, { align: 'right', color: '#ffffff', outline: '#141022' });
      if (this.shown >= this.total && Math.floor(this.t * 3) % 2 === 0)
        F.draw(ctx, C.next, R.W - 22, y + h - 11, { align: 'right', color: '#ffd166' });

      if (this.fade > 0) { ctx.globalAlpha = this.fade; R.rect(ctx, '#000', 0, 0, R.W, R.H); ctx.globalAlpha = 1; }
    }
  }

  G.IntroScene = IntroScene;
})();
