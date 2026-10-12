// Canvas setup, integer scaling with letterbox, and small pixel-drawing helpers.
(function () {
  const G = window.G;
  const W = 480, H = 270;

  const canvas = document.getElementById('game');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Largest integer scale that fits; the black body background letterboxes the rest.
  function resize() {
    const k = Math.min(window.innerWidth / W, window.innerHeight / H);
    const s = k >= 1 ? Math.floor(k) : k;
    canvas.style.width = W * s + 'px';
    canvas.style.height = H * s + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    return [c, g];
  }

  function rect(g, color, x, y, w, h) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  }
  // amt < 0 darkens toward black, amt > 0 lightens toward white.
  const shadeCache = {};
  function shade(hex, amt) {
    const key = hex + amt;
    if (shadeCache[key]) return shadeCache[key];
    const [r, g, b] = hexToRgb(hex);
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return (shadeCache[key] = rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p));
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }

  // Filled pixel circle / ellipse (crisp, no anti-aliasing).
  function disc(g, color, cx, cy, rx, ry = rx) {
    g.fillStyle = color;
    cx = Math.round(cx); cy = Math.round(cy);
    for (let dy = -ry; dy <= ry; dy++) {
      const dx = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5)))));
      g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
    }
  }
  // Pixel ring (outline of an ellipse).
  function ring(g, color, cx, cy, rx, ry = rx) {
    g.fillStyle = color;
    cx = Math.round(cx); cy = Math.round(cy);
    const steps = Math.max(16, Math.round((rx + ry) * 4));
    let lx = null, ly = null;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
      if (x !== lx || y !== ly) g.fillRect(x, y, 1, 1);
      lx = x; ly = y;
    }
  }

  // Framed UI box: dark outline, fill, light inner bevel.
  function panel(g, x, y, w, h, fill = '#1c2340', border = '#eaf2ff', outline = '#0b0e1c') {
    rect(g, outline, x, y, w, h);
    rect(g, border, x + 1, y + 1, w - 2, h - 2);
    rect(g, fill, x + 2, y + 2, w - 4, h - 4);
    rect(g, shade(fill, 0.12), x + 2, y + 2, w - 4, 1);
  }

  // Deterministic pseudo-random per tile, for texture variation.
  function hash(a, b, c = 0) {
    let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  G.R = { W, H, canvas, ctx, makeCanvas, rect, shade, mix, disc, ring, panel, hash };
})();
