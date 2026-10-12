// HUD (Ego Meter, names, zone title, controls reminder) and speech bubbles.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font;

  const ID_RED = '#E8453C', ID_ORANGE = '#F39C34', SE_BLUE = '#3B7DD8', SE_WHITE = '#EAF2FF', EGO_GREEN = '#3CC46B';

  function flameIcon(ctx, x, y, t = 0) {
    const f = Math.floor(t * 6) % 2;
    R.rect(ctx, '#141022', x + 1, y, 5, 8); R.rect(ctx, '#141022', x, y + 3, 7, 5);
    R.rect(ctx, ID_RED, x + 1, y + 3 + f, 5, 4 - f); R.rect(ctx, ID_RED, x + 2, y + 1, 3, 3);
    R.rect(ctx, ID_ORANGE, x + 2, y + 4, 3, 3); R.rect(ctx, '#ffd166', x + 3, y + 5, 1, 2);
  }
  function haloIcon(ctx, x, y) {
    R.ring(ctx, '#141022', x + 4, y + 2, 4, 2);
    R.ring(ctx, SE_WHITE, x + 4, y + 1, 4, 1);
    R.disc(ctx, SE_BLUE, x + 4, y + 6, 2);
  }

  // Small "stress" zigzag icon for the anxiety attack counter.
  function zigzag(ctx, x, y, hot) {
    const c = hot ? '#E8453C' : '#8fa3cc';
    R.rect(ctx, '#141022', x, y, 8, 8);
    for (const [px, py] of [[1, 5], [2, 3], [3, 5], [4, 1], [5, 6], [6, 3]]) R.rect(ctx, c, x + px, y + py, 1, 2);
  }

  // Mini iceberg next to the zone name; the current layer is highlighted.
  const LAYER_OF = { surface: 0, forest: 1, deep: 2, vault: 2 };
  function layerIcon(ctx, x, y, layer) {
    const rows = [[4, 1, 0], [3, 3, 0], [2, 5, 1], [1, 7, 1], [1, 7, 2], [2, 5, 2], [3, 3, 2]]; // [x offset, width, layer]
    R.rect(ctx, '#3d7fc4', x - 1, y + 2, 11, 1); // waterline
    rows.forEach(([ox, w, l], i) => R.rect(ctx, l === layer ? '#ffd166' : l === 0 ? '#f4fbff' : '#8fc9e6', x + ox, y + i + (i >= 2 ? 1 : 0), w, 1));
  }

  // value: -100 (Id) .. +100 (Superego); green zone -15..+15.
  function egoMeter(ctx, value, t = 0, shake = 0) {
    const x = 170 + (shake ? Math.round(Math.sin(t * 60) * shake) : 0), y = 3, w = 140, h = 9;
    R.rect(ctx, '#0b0e1c', x - 1, y - 1, w + 2, h + 2);
    for (let i = 0; i < w; i++) {
      const v = -100 + (i / (w - 1)) * 200;
      let c;
      if (Math.abs(v) <= 15) c = EGO_GREEN;
      else if (v < 0) c = R.mix('#7a2a2a', ID_RED, Math.min(1, (-v - 15) / 60));
      else c = R.mix('#1f3f72', SE_BLUE, Math.min(1, (v - 15) / 60));
      R.rect(ctx, c, x + i, y, 1, h);
    }
    R.rect(ctx, 'rgba(255,255,255,0.25)', x, y, w, 2);
    F.draw(ctx, 'EGO', x + w / 2, y + 1, { align: 'center', color: '#0e3a26' });
    const mx = x + Math.round(((value + 100) / 200) * (w - 1));
    R.rect(ctx, '#ffffff', mx, y, 1, h);
    R.rect(ctx, '#0b0e1c', mx - 3, y + h, 7, 4);
    R.rect(ctx, '#ffffff', mx - 2, y + h + 1, 5, 1);
    R.rect(ctx, '#ffffff', mx - 1, y + h, 3, 1);
    R.rect(ctx, '#ffffff', mx, y + h - 1, 1, 1);
    F.draw(ctx, 'ID', x - 4, y + 1, { align: 'right', color: ID_ORANGE, outline: '#141022' });
    F.draw(ctx, 'SUPEREGO', x + w + 4, y + 1, { color: SE_WHITE, outline: '#141022' });
  }

  function drawHUD(ctx, room, t) {
    const game = G.game;
    R.rect(ctx, 'rgba(8,10,28,0.6)', 0, 0, R.W, 26);
    R.rect(ctx, 'rgba(255,255,255,0.12)', 0, 26, R.W, 1);
    flameIcon(ctx, 4, 3, t);
    F.draw(ctx, game.names[0], 14, 4, { color: ID_ORANGE, outline: '#141022' });
    // anxiety attack counter (top left, under P1's name)
    volumeSlider(ctx);
    const n = game.stats.attacks || 0;
    zigzag(ctx, 4, 16, n > 0);
    F.draw(ctx, `${G.CONTENT.hud.attacks}: ${n}`, 14, 16, { color: n > 0 ? '#ff9a8a' : '#bfd0f0', outline: '#141022' });
    haloIcon(ctx, R.W - 12, 3);
    F.draw(ctx, game.names[1], R.W - 15, 4, { align: 'right', color: SE_WHITE, outline: '#141022' });
    egoMeter(ctx, game.ego, t, G.Ego.meterShake());
    F.draw(ctx, room.def.title, R.W / 2, 17, { align: 'center', color: '#ffffff', shadow: '#141022' });
    const layer = LAYER_OF[room.zone];
    if (layer !== undefined) layerIcon(ctx, Math.round(R.W / 2 - F.measure(room.def.title) / 2) - 14, 16, layer);
    drawControls(ctx);
  }

  function drawControls(ctx) {
    ctx.globalAlpha = 0.7;
    F.draw(ctx, G.CONTENT.controls.p1, 4, R.H - 10, { color: '#ffd8b0', outline: '#141022' });
    F.draw(ctx, G.CONTENT.controls.p2, R.W - 4, R.H - 10, { align: 'right', color: '#d6e6ff', outline: '#141022' });
    ctx.globalAlpha = 1;
  }

  // Small speech bubble whose tail points down at (x, y).
  function bubble(ctx, text, x, y) {
    const w = F.measure(text) + 8, h = 13;
    let bx = Math.round(x - w / 2);
    bx = Math.max(2, Math.min(R.W - w - 2, bx));
    const by = Math.round(y - h - 3);
    R.rect(ctx, '#141022', bx, by, w, h);
    R.rect(ctx, '#ffffff', bx + 1, by + 1, w - 2, h - 2);
    R.rect(ctx, '#141022', x - 2, by + h - 1, 5, 2); R.rect(ctx, '#ffffff', x - 1, by + h - 1, 3, 1);
    R.rect(ctx, '#141022', x - 1, by + h + 1, 3, 1); R.rect(ctx, '#ffffff', x, by + h, 1, 1);
    R.rect(ctx, '#141022', x, by + h + 2, 1, 1);
    F.draw(ctx, text, bx + 4, by + 3, { color: '#1c2340' });
  }

  // ---------- music volume slider ----------
  const SLIDER = { x: 80, y: 3, w: 46, h: 9 }; // bar area in game pixels (HUD, top left)
  function noteIcon(ctx, x, y, col) {
    R.rect(ctx, '#141022', x, y, 7, 9);
    R.rect(ctx, col, x + 4, y + 1, 1, 6); R.rect(ctx, col, x + 4, y + 1, 2, 1); R.rect(ctx, col, x + 5, y + 2, 1, 1);
    R.rect(ctx, col, x + 2, y + 5, 3, 3);
  }
  function volumeSlider(ctx, x = SLIDER.x, y = SLIDER.y) {
    const v = G.audio.musicVolume, off = G.audio.musicMuted || v === 0;
    noteIcon(ctx, x, y, off ? '#6a7090' : '#ffd166');
    const bx = x + 10, bw = SLIDER.w - 10, by = y + 3;
    R.rect(ctx, '#141022', bx - 1, by - 1, bw + 2, 5);
    R.rect(ctx, '#2a3050', bx, by, bw, 3);
    R.rect(ctx, off ? '#6a7090' : '#ffd166', bx, by, Math.round(bw * v), 3);
    const kx = bx + Math.round((bw - 1) * v);
    R.rect(ctx, '#141022', kx - 2, y, 5, 9);
    R.rect(ctx, '#ffffff', kx - 1, y + 1, 3, 7);
    if (G.audio.musicMuted) { R.rect(ctx, '#E8453C', x - 1, y + 4, 9, 1); }
  }

  // Mouse: click or drag on the slider (only while it is shown in a room).
  (function () {
    const cv = R.canvas;
    let dragging = false;
    const toGame = (e) => {
      const r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * R.W, y: ((e.clientY - r.top) / r.height) * R.H };
    };
    const visible = () => G.RoomScene && G.currentScene && G.currentScene() instanceof G.RoomScene;
    const inside = (q) => q.x >= SLIDER.x - 2 && q.x <= SLIDER.x + SLIDER.w + 3 && q.y >= SLIDER.y - 3 && q.y <= SLIDER.y + SLIDER.h + 3;
    const setFrom = (q) => G.audio.setMusicVolume((q.x - (SLIDER.x + 10)) / (SLIDER.w - 11));
    cv.addEventListener('mousedown', (e) => {
      if (G.audio) G.audio.unlock();
      const q = toGame(e);
      if (visible() && inside(q)) { dragging = true; setFrom(q); e.preventDefault(); }
    });
    window.addEventListener('mousemove', (e) => {
      const q = toGame(e);
      if (dragging) setFrom(q);
      cv.style.cursor = dragging || (visible() && inside(q)) ? 'pointer' : '';
    });
    window.addEventListener('mouseup', () => { dragging = false; });
  })();

  G.UI = { drawHUD, volumeSlider, drawControls, egoMeter, bubble, flameIcon, haloIcon, COLORS: { ID_RED, ID_ORANGE, SE_BLUE, SE_WHITE, EGO_GREEN } };
})();
