// Tile rendering per zone. Room maps are strings of tile characters (see rooms.js for the legend).
// Static tiles are pre-rendered once per room; water, gates and the vault are drawn every frame.
(function () {
  const G = window.G;
  const R = G.R;
  const TS = 16;

  // Tiles that block movement. Everything else is walkable.
  const SOLID = new Set(['#', '~', 'X', 'T', 'r', 'B', 'D', 'S', 'O', 'G', 'V', 'P', ' ']);
  const WALLISH = new Set(['#', 'G', 'V', 'B', 'O']);

  const ZONES = {
    study: {
      wallH: 2, floor: '#9a6236', floorDark: '#84512b', speck: '#a96d3e',
      wallTop: '#3b2a1f', wallFront: '#2f5a3e', wallStripe: '#376a49', trim: '#c9a24a', outline: '#1e140e',
    },
    surface: {
      wallH: 1, floor: '#eef8fc', floorDark: '#d5ecf5', speck: '#bfe0ee',
      wallTop: '#d6f1fb', wallFront: '#8fd0ea', wallStripe: '#bfe9f7', outline: '#2b5e7a',
      water: '#2ec4c9', waterDark: '#1fa6b6', waterLight: '#9ff3ef', bridge: '#b07a42',
    },
    forest: {
      wallH: 1, floor: '#e8f2ec', floorDark: '#d0e2d7', speck: '#b6d0c2',
      wallTop: '#93a3ad', wallFront: '#65737f', wallStripe: '#7d8b96', outline: '#1f3a2e',
      water: '#3a7fa0', waterDark: '#2c6a8a', waterLight: '#a9d8ec', bridge: '#8a5a34',
    },
    deep: {
      wallH: 1, floor: '#18275e', floorDark: '#132050', speck: '#22357a',
      wallTop: '#0a1030', wallFront: '#16204a', wallStripe: '#1d2a5e', outline: '#04061a',
      water: '#0d1a44', waterDark: '#0a1438', waterLight: '#3ff0e8', bridge: '#46c9d8',
      glowA: '#3ff0e8', glowB: '#ff4fd8',
    },
    vault: {
      wallH: 1, floor: '#61718e', floorDark: '#55647f', speck: '#7384a3',
      wallTop: '#d3deec', wallFront: '#93a7c2', wallStripe: '#b5c6dc', outline: '#26304a',
      water: '#2a3a5c', waterDark: '#22304e', waterLight: '#cfe2ff', bridge: '#93a7c2',
    },
  };

  const at = (T, tx, ty) => (ty < 0 || ty >= T.length || tx < 0 || tx >= T[0].length ? '#' : T[ty][tx]);

  // ---------- floors ----------
  function drawFloor(g, Z, zone, T, tx, ty) {
    const x = tx * TS, y = ty * TS;
    const h = R.hash(tx, ty);
    R.rect(g, Z.floor, x, y, TS, TS);
    if (zone === 'study') {
      for (let r = 0; r < 4; r++) {
        R.rect(g, Z.floorDark, x, y + r * 4 + 3, TS, 1);
        const seam = Math.floor(R.hash(tx, ty, r) * 16);
        R.rect(g, Z.floorDark, x + seam, y + r * 4, 1, 3);
      }
    } else if (zone === 'vault') {
      R.rect(g, Z.speck, x, y, TS, 1); R.rect(g, Z.speck, x, y, 1, TS);
      R.rect(g, Z.floorDark, x, y + 15, TS, 1); R.rect(g, Z.floorDark, x + 15, y, 1, TS);
      if (h > 0.8) R.rect(g, Z.floorDark, x + 5, y + 6, 4, 1);
    } else {
      for (let i = 0; i < 3; i++) {
        const sx = Math.floor(R.hash(tx, ty, i + 1) * 15), sy = Math.floor(R.hash(tx, ty, i + 7) * 15);
        R.rect(g, i === 0 ? Z.floorDark : Z.speck, x + sx, y + sy, i === 0 ? 2 : 1, 1);
      }
      if (zone === 'deep' && h > 0.9) R.rect(g, Z.glowA, x + Math.floor(h * 13), y + 9, 1, 1);
      if (zone === 'forest' && h > 0.88) { R.rect(g, '#7fae8c', x + 6, y + 8, 1, 2); R.rect(g, '#7fae8c', x + 8, y + 9, 1, 1); }
    }
    // soft shadow under walls
    if (WALLISH.has(at(T, tx, ty - 1))) R.rect(g, 'rgba(0,0,20,0.18)', x, y, TS, 3);
  }

  // ---------- walls ----------
  function wallMode(T, tx, ty, wallH) {
    for (let i = 1; i <= wallH; i++) if (!WALLISH.has(at(T, tx, ty + i))) return i === 1 ? 'front' : 'frontUpper';
    return 'top';
  }

  function drawWall(g, Z, zone, T, tx, ty) {
    const x = tx * TS, y = ty * TS;
    const mode = wallMode(T, tx, ty, Z.wallH);
    if (mode === 'top') {
      R.rect(g, Z.wallTop, x, y, TS, TS);
      const h = R.hash(tx, ty);
      if (zone === 'deep' && h > 0.75) R.rect(g, h > 0.9 ? Z.glowB : Z.glowA, x + Math.floor(h * 12), y + Math.floor(h * 97) % 12, 1, 1);
      else if (zone !== 'study') R.rect(g, R.shade(Z.wallTop, 0.25), x + Math.floor(h * 10), y + 4, 3, 1);
      else R.rect(g, R.shade(Z.wallTop, 0.08), x, y + 7, TS, 1);
      // dark outline where the wall top meets open floor
      if (!WALLISH.has(at(T, tx - 1, ty)) && !SOLID.has(at(T, tx - 1, ty))) R.rect(g, Z.outline, x, y, 1, TS);
      if (!WALLISH.has(at(T, tx + 1, ty)) && !SOLID.has(at(T, tx + 1, ty))) R.rect(g, Z.outline, x + 15, y, 1, TS);
      if (!WALLISH.has(at(T, tx, ty - 1)) && !SOLID.has(at(T, tx, ty - 1))) R.rect(g, Z.outline, x, y, TS, 1);
      return;
    }
    R.rect(g, Z.wallFront, x, y, TS, TS);
    if (zone === 'study') {
      for (let i = 0; i < 4; i++) R.rect(g, Z.wallStripe, x + i * 4 + 1, y, 2, TS);
      if (mode === 'frontUpper') { R.rect(g, Z.trim, x, y + 1, TS, 1); R.rect(g, Z.wallTop, x, y, TS, 1); }
      else { R.rect(g, '#5a3a22', x, y + 12, TS, 4); R.rect(g, Z.trim, x, y + 12, TS, 1); }
    } else {
      // brick / ice-block courses
      R.rect(g, Z.wallStripe, x, y, TS, 1);
      R.rect(g, R.shade(Z.wallFront, -0.15), x, y + 7, TS, 1);
      R.rect(g, R.shade(Z.wallFront, -0.15), x + ((tx % 2) ? 4 : 11), y, 1, 7);
      R.rect(g, R.shade(Z.wallFront, -0.15), x + ((tx % 2) ? 11 : 4), y + 8, 1, 7);
      if (zone === 'deep' && R.hash(tx, ty, 3) > 0.7) {
        R.rect(g, Z.glowA, x + 6, y + 3, 2, 3); R.rect(g, '#bffcff', x + 6, y + 3, 1, 1);
      }
      if (mode === 'front') R.rect(g, R.shade(Z.wallFront, -0.3), x, y + 14, TS, 2);
    }
    if (mode === 'front') R.rect(g, Z.outline, x, y + 15, TS, 1);
  }

  // ---------- chasm, bridge, decor ----------
  function drawChasm(g, Z, T, tx, ty) {
    const x = tx * TS, y = ty * TS;
    R.rect(g, '#03040c', x, y, TS, TS);
    if (at(T, tx, ty - 1) !== 'X') {
      R.rect(g, '#2a3570', x, y, TS, 6);
      R.rect(g, '#1a2250', x, y + 6, TS, 3);
      R.rect(g, '#4a5ab0', x, y, TS, 1);
    }
    if (at(T, tx - 1, ty) !== 'X') R.rect(g, '#3a4a90', x, y, 1, TS);
    if (at(T, tx + 1, ty) !== 'X') R.rect(g, '#3a4a90', x + 15, y, 1, TS);
    if (R.hash(tx, ty) > 0.8) R.rect(g, '#2b2f5a', x + 7, y + 11, 1, 1);
  }

  function drawBridge(g, Z, T, tx, ty) {
    const x = tx * TS, y = ty * TS;
    const c = Z.bridge || '#b07a42';
    R.rect(g, R.shade(c, -0.45), x, y, TS, TS);
    for (let i = 0; i < 4; i++) {
      R.rect(g, c, x + i * 4, y + 1, 3, 14);
      R.rect(g, R.shade(c, 0.25), x + i * 4, y + 1, 3, 1);
    }
    if (at(T, tx, ty - 1) !== '=') R.rect(g, R.shade(c, -0.6), x, y, TS, 2);
    if (at(T, tx, ty + 1) !== '=') { R.rect(g, R.shade(c, -0.6), x, y + 14, TS, 2); R.rect(g, 'rgba(0,0,0,0.35)', x, y + 16, TS, 3); }
  }

  function drawRock(g, Z, zone, tx, ty) {
    const x = tx * TS, y = ty * TS;
    if (zone === 'deep') { // bioluminescent coral
      R.rect(g, '#5a1a6a', x + 3, y + 12, 10, 3);
      const stalks = [[4, 5, Z.glowB], [7, 2, Z.glowA], [10, 4, Z.glowB], [12, 7, Z.glowA]];
      for (const [sx, sy, c] of stalks) {
        R.rect(g, R.shade(c, -0.45), x + sx, y + sy, 2, 13 - sy);
        R.rect(g, c, x + sx, y + sy - 1, 2, 2);
      }
      return;
    }
    const base = zone === 'forest' ? '#8d99a3' : zone === 'vault' ? '#b5c6dc' : '#a9dcef';
    const out = zone === 'forest' ? '#2c3a44' : '#2b5e7a';
    R.disc(g, out, x + 8, y + 10, 7, 5);
    R.disc(g, base, x + 8, y + 10, 6, 4);
    R.disc(g, R.shade(base, 0.35), x + 6, y + 8, 3, 2);
    R.rect(g, R.shade(base, -0.25), x + 3, y + 13, 10, 1);
    if (zone === 'forest') { R.rect(g, '#ffffff', x + 4, y + 6, 7, 2); }
  }

  function drawPlant(g, Z, zone, tx, ty) {
    const x = tx * TS, y = ty * TS;
    if (zone === 'deep') {
      for (const [sx, h, c] of [[5, 6, Z.glowA], [8, 9, Z.glowA], [11, 5, Z.glowB]]) {
        R.rect(g, '#1d6a6a', x + sx, y + 15 - h, 1, h);
        R.rect(g, c, x + sx - 1, y + 14 - h, 3, 2);
      }
    } else {
      R.rect(g, '#4f9a5e', x + 6, y + 9, 1, 5); R.rect(g, '#4f9a5e', x + 9, y + 10, 1, 4);
      R.rect(g, zone === 'surface' ? '#ffd166' : '#c9a7ff', x + 5, y + 8, 3, 2);
      R.rect(g, '#ff9fb2', x + 8, y + 9, 3, 2);
    }
  }

  function drawTree(g, Z, tx, ty) {
    const x = tx * TS, y = ty * TS;
    const short = R.hash(tx, ty) > 0.6 ? 2 : 0;
    R.rect(g, '#3a2414', x + 6, y + 11, 4, 5);
    R.rect(g, '#5a3a22', x + 7, y + 11, 1, 5);
    const top = y - 7 + short;
    const rows = y + 12 - top;
    for (let r = 0; r < rows; r++) {
      const tier = r < 6 ? r : r < 11 ? r - 3 : r - 6;
      const half = Math.min(8, 1 + Math.floor(tier * 0.9));
      R.rect(g, '#0f2a1c', x + 8 - half - 1, top + r, half * 2 + 2, 1);
      R.rect(g, '#1f5e3b', x + 8 - half, top + r, half * 2, 1);
      R.rect(g, '#2f7d4e', x + 8 - half, top + r, Math.max(1, half - 1), 1);
      if (tier <= 1 || r === 6 || r === 11) R.rect(g, '#f4fbff', x + 8 - Math.min(half, 3), top + r, Math.min(half, 3) * 2, 1);
    }
  }

  // ---------- furniture (multi-tile blocks) ----------
  function findBlocks(T, ch) {
    const out = [], seen = new Set();
    for (let ty = 0; ty < T.length; ty++)
      for (let tx = 0; tx < T[0].length; tx++) {
        if (T[ty][tx] !== ch || seen.has(tx + ',' + ty)) continue;
        let w = 0; while (at(T, tx + w, ty) === ch) w++;
        let h = 0; while (ty + h < T.length && T[ty + h][tx] === ch) h++;
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) seen.add(tx + i + ',' + (ty + j));
        out.push({ x: tx * TS, y: ty * TS, w: w * TS, h: h * TS });
      }
    return out;
  }

  const FURNITURE = {
    ',': (g, b) => { // oriental rug
      R.rect(g, '#5a1c22', b.x, b.y, b.w, b.h);
      R.rect(g, '#c9a24a', b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      R.rect(g, '#8b2f3a', b.x + 3, b.y + 3, b.w - 6, b.h - 6);
      R.rect(g, '#2f5a3e', b.x + 6, b.y + 6, b.w - 12, b.h - 12);
      R.rect(g, '#8b2f3a', b.x + 7, b.y + 7, b.w - 14, b.h - 14);
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      for (let i = 0; i < 14; i++) {
        R.rect(g, '#c9a24a', cx - 14 + i, cy - i / 2, 1, i + 1);
        R.rect(g, '#c9a24a', cx + 14 - i, cy - i / 2, 1, i + 1);
      }
      R.rect(g, '#efe3c8', cx - 3, cy - 2, 6, 4);
      for (let y = b.y + 2; y < b.y + b.h - 2; y += 2) { R.rect(g, '#efe3c8', b.x - 2, y, 2, 1); R.rect(g, '#efe3c8', b.x + b.w, y, 2, 1); }
    },
    'B': (g, b) => { // bookshelf
      R.rect(g, '#1e140e', b.x, b.y, b.w, b.h);
      R.rect(g, '#6b4426', b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      R.rect(g, '#8a5a34', b.x + 1, b.y + 1, b.w - 2, 2);
      const BOOK = ['#8b2f3a', '#2f5a3e', '#c9a24a', '#3b5a8a', '#efe3c8', '#6a3a6a', '#a0522d'];
      for (let sy = b.y + 4; sy + 8 < b.y + b.h; sy += 10) {
        R.rect(g, '#2a1a10', b.x + 3, sy, b.w - 6, 8);
        let x = b.x + 3, i = 0;
        while (x < b.x + b.w - 5) {
          const r = R.hash(x, sy, i++);
          const w = r > 0.7 ? 3 : 2, h = 5 + Math.floor(r * 3);
          if (r > 0.08) R.rect(g, BOOK[Math.floor(r * 97) % BOOK.length], x, sy + 8 - h, w, h);
          x += w + (r > 0.9 ? 2 : 0);
        }
        R.rect(g, '#8a5a34', b.x + 2, sy + 8, b.w - 4, 2);
      }
    },
    'C': (g, b) => { // Freud's couch: chaise with an oriental throw
      const o = '#1e140e';
      R.rect(g, o, b.x + 1, b.y + 3, b.w - 2, b.h - 4);
      R.rect(g, '#6f2430', b.x + 2, b.y + 4, b.w - 4, 9);            // backrest
      R.rect(g, '#8b2f3a', b.x + 2, b.y + 13, b.w - 4, b.h - 19);    // seat
      R.rect(g, '#a33a47', b.x + 2, b.y + 13, b.w - 4, 1);
      R.rect(g, o, b.x, b.y - 3, 14, b.h - 3);                         // raised headrest
      R.rect(g, '#7a2833', b.x + 1, b.y - 2, 12, b.h - 5);
      R.rect(g, '#efe3c8', b.x + 3, b.y + 6, 9, 7);                    // pillow
      R.rect(g, '#d8c8a6', b.x + 3, b.y + 12, 9, 1);
      for (let i = 0; i < b.w - 22; i += 2) {                          // throw
        R.rect(g, ['#c9a24a', '#2f5a3e', '#8b2f3a', '#efe3c8'][(i / 2) % 4], b.x + 16 + i, b.y + 8, 2, b.h - 15);
      }
      R.rect(g, '#4e2f19', b.x + 2, b.y + b.h - 6, b.w - 4, 3);       // frame
      R.rect(g, o, b.x + 3, b.y + b.h - 3, 3, 3); R.rect(g, o, b.x + b.w - 6, b.y + b.h - 3, 3, 3);
    },
    'D': (g, b) => { // desk
      const o = '#1e140e';
      R.rect(g, o, b.x, b.y, b.w, b.h);
      R.rect(g, '#7a4c2a', b.x + 1, b.y + 1, b.w - 2, 12);
      R.rect(g, '#8f5c34', b.x + 1, b.y + 1, b.w - 2, 1);
      R.rect(g, '#4e2f19', b.x + 1, b.y + 13, b.w - 2, b.h - 14);
      for (const dx of [4, b.w - 22]) {
        R.rect(g, '#5e3920', b.x + dx, b.y + 16, 18, 6); R.rect(g, '#c9a24a', b.x + dx + 8, b.y + 18, 2, 2);
        R.rect(g, '#5e3920', b.x + dx, b.y + 24, 18, 6); R.rect(g, '#c9a24a', b.x + dx + 8, b.y + 26, 2, 2);
      }
      R.rect(g, '#f1ead8', b.x + 22, b.y + 4, 10, 7); R.rect(g, '#cfc6b0', b.x + 24, b.y + 6, 6, 1); // papers
      R.rect(g, '#c9a24a', b.x + 8, b.y - 2, 1, 8); R.rect(g, '#2f7a4a', b.x + 4, b.y - 5, 9, 4); // lamp
      R.rect(g, '#9a958c', b.x + 44, b.y - 4, 3, 8); R.rect(g, '#9a958c', b.x + 50, b.y - 2, 4, 6); // antiquities
      R.rect(g, '#1b1b22', b.x + 36, b.y + 5, 3, 3); // inkwell
    },
    'S': (g, b) => { // antique statue on a plinth
      R.rect(g, '#1e140e', b.x + 2, b.y + 6, 12, 10);
      R.rect(g, '#b9b3a8', b.x + 3, b.y + 7, 10, 8);
      R.rect(g, '#d8d2c6', b.x + 3, b.y + 7, 10, 1);
      R.rect(g, '#1e140e', b.x + 4, b.y - 12, 8, 19);
      R.rect(g, '#d8d2c6', b.x + 5, b.y - 11, 6, 17);
      R.disc(g, '#d8d2c6', b.x + 8, b.y - 12, 3);
      R.rect(g, '#aaa398', b.x + 9, b.y - 8, 2, 13);
    },
    'P': (g, b) => { // potted plant
      R.rect(g, '#1e140e', b.x + 3, b.y + 7, 10, 9);
      R.rect(g, '#a0522d', b.x + 4, b.y + 8, 8, 7);
      R.rect(g, '#c06a3a', b.x + 4, b.y + 8, 8, 1);
      for (const [lx, ly, c] of [[2, -6, '#2f7d4e'], [9, -9, '#3f9a5e'], [5, -12, '#2f7d4e'], [10, -3, '#2f7d4e'], [3, 0, '#3f9a5e']]) {
        R.rect(g, '#123a22', b.x + lx - 1, b.y + ly - 1, 6, 6);
        R.rect(g, c, b.x + lx, b.y + ly, 4, 4);
      }
    },
    'O': (g, b) => { // study door in the bottom wall
      R.rect(g, '#1e140e', b.x, b.y, b.w, b.h);
      R.rect(g, '#6b4426', b.x + 2, b.y + 1, b.w - 4, b.h - 1);
      R.rect(g, '#5a3a22', b.x + b.w / 2 - 1, b.y + 1, 2, b.h - 1);
      R.rect(g, '#c9a24a', b.x + b.w / 2 - 4, b.y + 6, 2, 2); R.rect(g, '#c9a24a', b.x + b.w / 2 + 2, b.y + 6, 2, 2);
    },
  };

  // ---------- dynamic: gates and the vault ----------
  function drawGate(ctx, zone, b, open, t) {
    const o = '#10202c';
    if (zone === 'deep') {
      R.rect(ctx, '#05071a', b.x, b.y, b.w, b.h);
      R.rect(ctx, '#2a3268', b.x - 4, b.y - 4, 6, b.h + 4); R.rect(ctx, '#2a3268', b.x + b.w - 2, b.y - 4, 6, b.h + 4);
      const slide = Math.round(open * (b.w / 2 - 2));
      const pw = b.w / 2 - 2;
      ctx.save();
      ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
      for (const side of [0, 1]) {
        const px = side ? b.x + b.w / 2 + slide : b.x + 2 - slide;
        R.rect(ctx, o, px, b.y, pw, b.h);
        R.rect(ctx, '#1d2450', px + 1, b.y + 1, pw - 2, b.h - 1);
        const glow = 0.5 + 0.5 * Math.sin(t * 2 + side);
        R.rect(ctx, R.mix('#1d6a8a', '#3ff0e8', glow), side ? px + 6 : px + pw - 10, b.y + 8, 4, 14);
      }
      ctx.restore();
      return;
    }
    // Ego Gate: ice pillars + crystal sheet that slides up when open
    R.rect(ctx, '#1d5a73', b.x, b.y, b.w, b.h);
    const sheetH = Math.round((b.h - 4) * (1 - open));
    if (sheetH > 0) {
      R.rect(ctx, '#9fdcf2', b.x + 6, b.y + 2, b.w - 12, sheetH);
      R.rect(ctx, '#d8f6ff', b.x + 8, b.y + 3, 2, Math.max(0, sheetH - 3));
      R.rect(ctx, '#e8fbff', b.x + 20, b.y + 8, 12, 1); R.rect(ctx, '#e8fbff', b.x + 30, b.y + 9, 1, 8);
      if (sheetH > 12) G.Font.draw(ctx, 'EGO', b.x + b.w / 2, b.y + 5, { align: 'center', color: '#3CC46B', outline: '#0e3a26' });
    }
    for (const px of [b.x - 2, b.x + b.w - 6]) {
      R.rect(ctx, o, px, b.y - 6, 8, b.h + 6);
      R.rect(ctx, '#bfe9f7', px + 1, b.y - 5, 6, b.h + 4);
      R.rect(ctx, '#ffffff', px + 1, b.y - 5, 2, b.h + 4);
    }
    R.rect(ctx, o, b.x - 2, b.y - 8, b.w + 4, 5);
    R.rect(ctx, '#d6f1fb', b.x - 1, b.y - 7, b.w + 2, 3);
  }

  function drawVault(ctx, b, locksOpen, t) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2 + 2;
    R.disc(ctx, '#26304a', cx, cy, 25);
    R.disc(ctx, '#d3deec', cx, cy, 24);
    R.disc(ctx, '#93a7c2', cx, cy, 21);
    R.ring(ctx, '#b5c6dc', cx, cy, 16);
    R.ring(ctx, '#6d7f9c', cx, cy, 10);
    R.disc(ctx, '#26304a', cx, cy - 2, 3);
    R.rect(ctx, '#26304a', cx - 1, cy, 3, 6);
    const locks = [[cx - 30, cy - 4], [cx, cy + 20], [cx + 30, cy - 4]];
    locks.forEach(([lx, ly], i) => {
      if (i < locksOpen) return;
      // chain from the lock across the door
      for (let k = 0; k <= 1; k += 0.1) {
        const qx = lx + (cx - lx) * k * 0.8, qy = ly + (cy - 8 - ly) * k * 0.8;
        R.rect(ctx, '#1a1f30', qx - 2, qy - 1, 4, 3);
        R.rect(ctx, '#7a86a3', qx - 1, qy, 2, 1);
      }
      R.rect(ctx, '#1a1f30', lx - 5, ly - 4, 10, 9);
      R.rect(ctx, '#c9a24a', lx - 4, ly - 3, 8, 7);
      R.ring(ctx, '#1a1f30', lx, ly - 6, 3, 3);
      R.rect(ctx, '#1a1f30', lx - 1, ly - 1, 2, 3);
    });
  }

  // ---------- public ----------
  function renderStatic(room) {
    const T = room.tiles, zone = room.zone, Z = ZONES[zone];
    const [c, g] = R.makeCanvas(T[0].length * TS, T.length * TS);
    for (let ty = 0; ty < T.length; ty++)
      for (let tx = 0; tx < T[0].length; tx++) {
        const ch = T[ty][tx];
        if (ch === '~') continue; // animated
        if (WALLISH.has(ch)) drawWall(g, Z, zone, T, tx, ty);
        else if (ch === 'X') drawChasm(g, Z, T, tx, ty);
        else if (ch === ' ') R.rect(g, '#000', tx * TS, ty * TS, TS, TS);
        else drawFloor(g, Z, zone, T, tx, ty);
        if (ch === '=') drawBridge(g, Z, T, tx, ty);
      }
    for (const ch of [',', 'B', 'O', 'C', 'D', 'S', 'P']) for (const b of findBlocks(T, ch)) FURNITURE[ch](g, b);
    for (let ty = 0; ty < T.length; ty++)
      for (let tx = 0; tx < T[0].length; tx++) {
        const ch = T[ty][tx];
        if (ch === 'r') drawRock(g, Z, zone, tx, ty);
        else if (ch === 'p') drawPlant(g, Z, zone, tx, ty);
        else if (ch === 'T') drawTree(g, Z, tx, ty);
      }
    return c;
  }

  function drawWater(ctx, room, t) {
    const T = room.tiles, Z = ZONES[room.zone];
    for (let ty = 0; ty < T.length; ty++)
      for (let tx = 0; tx < T[0].length; tx++) {
        if (T[ty][tx] !== '~') continue;
        const x = tx * TS, y = ty * TS;
        R.rect(ctx, Z.water, x, y, TS, TS);
        for (let i = 0; i < 2; i++) {
          const ph = (t * 0.5 + R.hash(tx, ty, i)) % 1;
          const wx = x + Math.floor(ph * 12), wy = y + 4 + i * 7;
          R.rect(ctx, Z.waterLight, wx, wy, 4, 1);
        }
        const above = at(T, tx, ty - 1);
        if (above !== '~' && !SOLID.has(above)) {
          const wob = Math.round(Math.sin(t * 3 + tx) * 1);
          R.rect(ctx, '#ffffff', x, y, TS, 2 + wob);
        } else if (above !== '~') R.rect(ctx, R.shade(Z.waterDark, -0.3), x, y, TS, 3);
        if (at(T, tx, ty + 1) !== '~' && !SOLID.has(at(T, tx, ty + 1))) R.rect(ctx, R.shade(Z.waterDark, -0.2), x, y + 14, TS, 2);
      }
  }

  function drawDynamic(ctx, room, t) {
    for (const b of room.gateBlocks) drawGate(ctx, room.zone, b, room.state.gateOpen || 0, t);
    for (const b of room.vaultBlocks) drawVault(ctx, b, room.state.locksOpen || 0, t);
  }

  G.Tiles = { TS, SOLID, ZONES, renderStatic, drawWater, drawDynamic, findBlocks };
})();
