// Self-drawn bitmap pixel font (5x7 caps, descenders on row 8). No external font files needed.
// Each glyph: rows separated by spaces, '#' = pixel on. Glyph width = row length (proportional font).
(function () {
  const G = (window.G = window.G || {});

  const GLYPHS = {
    'A': '.###. #...# #...# ##### #...# #...# #...#',
    'B': '####. #...# #...# ####. #...# #...# ####.',
    'C': '.###. #...# #.... #.... #.... #...# .###.',
    'D': '####. #...# #...# #...# #...# #...# ####.',
    'E': '##### #.... #.... ####. #.... #.... #####',
    'F': '##### #.... #.... ####. #.... #.... #....',
    'G': '.###. #...# #.... #.### #...# #...# .###.',
    'H': '#...# #...# #...# ##### #...# #...# #...#',
    'I': '### .#. .#. .#. .#. .#. ###',
    'J': '..### ...#. ...#. ...#. ...#. #..#. .##..',
    'K': '#...# #..#. #.#.. ##... #.#.. #..#. #...#',
    'L': '#.... #.... #.... #.... #.... #.... #####',
    'M': '#...# ##.## #.#.# #.#.# #...# #...# #...#',
    'N': '#...# #...# ##..# #.#.# #..## #...# #...#',
    'O': '.###. #...# #...# #...# #...# #...# .###.',
    'P': '####. #...# #...# ####. #.... #.... #....',
    'Q': '.###. #...# #...# #...# #.#.# #..#. .##.#',
    'R': '####. #...# #...# ####. #.#.. #..#. #...#',
    'S': '.#### #.... #.... .###. ....# ....# ####.',
    'T': '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
    'U': '#...# #...# #...# #...# #...# #...# .###.',
    'V': '#...# #...# #...# #...# #...# .#.#. ..#..',
    'W': '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.',
    'X': '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    'Y': '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
    'Z': '##### ....# ...#. ..#.. .#... #.... #####',

    'a': '.... .... .##. ...# .### #..# .###',
    'b': '#... #... ###. #..# #..# #..# ###.',
    'c': '.... .... .### #... #... #... .###',
    'd': '...# ...# .### #..# #..# #..# .###',
    'e': '.... .... .##. #..# #### #... .###',
    'f': '..## .#.. ###. .#.. .#.. .#.. .#..',
    'g': '.... .... .### #..# #..# .### ...# .##.',
    'h': '#... #... ###. #..# #..# #..# #..#',
    'i': '# . # # # # #',
    'j': '..# ... .## ..# ..# ..# ..# ##.',
    'k': '#... #... #..# #.#. ##.. #.#. #..#',
    'l': '#. #. #. #. #. #. .#',
    'm': '..... ..... ##.#. #.#.# #.#.# #.#.# #.#.#',
    'n': '.... .... ###. #..# #..# #..# #..#',
    'o': '.... .... .##. #..# #..# #..# .##.',
    'p': '.... .... ###. #..# #..# ###. #... #...',
    'q': '.... .... .### #..# #..# .### ...# ...#',
    'r': '.... .... #.## ##.. #... #... #...',
    's': '.... .... .### #... .##. ...# ###.',
    't': '.#.. .#.. ###. .#.. .#.. .#.. ..##',
    'u': '.... .... #..# #..# #..# #..# .###',
    'v': '..... ..... #...# #...# .#.#. .#.#. ..#..',
    'w': '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    'x': '.... .... #..# #..# .##. #..# #..#',
    'y': '.... .... #..# #..# #..# .### ...# .##.',
    'z': '.... .... #### ..#. .#.. #... ####',

    '0': '.###. #...# #..## #.#.# ##..# #...# .###.',
    '1': '.#. ##. .#. .#. .#. .#. ###',
    '2': '.###. #...# ....# ...#. ..#.. .#... #####',
    '3': '####. ....# ....# .###. ....# ....# ####.',
    '4': '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
    '5': '##### #.... ####. ....# ....# #...# .###.',
    '6': '.###. #.... #.... ####. #...# #...# .###.',
    '7': '##### ....# ...#. ..#.. .#... .#... .#...',
    '8': '.###. #...# #...# .###. #...# #...# .###.',
    '9': '.###. #...# #...# .#### ....# ....# .###.',

    ' ': '... ... ... ... ... ... ...',
    '.': '. . . . . . #',
    ',': '.. .. .. .. .. .# .# #.',
    '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
    "'": '# # . . . . .',
    '"': '#.# #.# ... ... ... ... ...',
    ':': '. . # . . # .',
    ';': '.. .. .# .. .. .# #.',
    '-': '.... .... .... #### .... .... ....',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
    '(': '.# #. #. #. #. #. .#',
    ')': '#. .# .# .# .# .# #.',
    '[': '## #. #. #. #. #. ##',
    ']': '## .# .# .# .# .# ##',
    '/': '....# ...#. ...#. ..#.. .#... .#... #....',
    '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '=': '.... .... #### .... #### .... ....',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#',
    '>': '#... .#.. ..#. ...# ..#. .#.. #...',
    '_': '..... ..... ..... ..... ..... ..... #####',
    '#': '.#.#. ##### .#.#. .#.#. .#.#. ##### .#.#.',
    '·': '. . . # . . .',
    '✔': '..... ....# ...## #.##. ###.. .#... .....',
    '✘': '..... #...# .#.#. ..#.. .#.#. #...# .....',
    '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. .....',
    '↓': '..... ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....',
    '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
  };
  const ALIAS = { '–': '-', '—': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '×': 'x' };
  const CELL_H = 8;

  // Build a white atlas once; tinted copies are cached per colour.
  const info = {};
  let atlasW = 0;
  for (const ch in GLYPHS) {
    const rows = GLYPHS[ch].split(' ');
    info[ch] = { rows, w: rows[0].length, sx: atlasW };
    atlasW += rows[0].length + 1;
  }
  const atlas = document.createElement('canvas');
  atlas.width = atlasW; atlas.height = CELL_H;
  const actx = atlas.getContext('2d');
  actx.fillStyle = '#fff';
  for (const ch in info) {
    const g = info[ch];
    g.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] === '#') actx.fillRect(g.sx + x, y, 1, 1);
    });
  }

  const tints = {};
  function tinted(color) {
    if (tints[color]) return tints[color];
    const c = document.createElement('canvas');
    c.width = atlasW; c.height = CELL_H;
    const g = c.getContext('2d');
    g.drawImage(atlas, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, atlasW, CELL_H);
    return (tints[color] = c);
  }

  function norm(text) {
    text = String(text).replace(/…/g, '...');
    let out = '';
    for (const ch of text) out += ALIAS[ch] || ch;
    return out;
  }
  const glyph = (ch) => info[ch] || info['?'];

  function measure(text, scale = 1) {
    text = norm(text);
    let w = 0;
    for (const ch of text) w += glyph(ch).w + 1;
    return Math.max(0, w - 1) * scale;
  }

  function drawRaw(ctx, text, x, y, color, scale) {
    const img = tinted(color);
    for (const ch of text) {
      const g = glyph(ch);
      ctx.drawImage(img, g.sx, 0, g.w, CELL_H, x, y, g.w * scale, CELL_H * scale);
      x += (g.w + 1) * scale;
    }
  }

  // opt: { color, scale, align: 'left'|'center'|'right', shadow: color, outline: color }
  function draw(ctx, text, x, y, opt = {}) {
    const scale = opt.scale || 1;
    text = norm(text);
    const w = measure(text, scale);
    if (opt.align === 'center') x -= Math.floor(w / 2);
    else if (opt.align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    if (opt.outline) {
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
        drawRaw(ctx, text, x + dx * scale, y + dy * scale, opt.outline, scale);
    } else if (opt.shadow) {
      drawRaw(ctx, text, x, y + scale, opt.shadow, scale);
    }
    drawRaw(ctx, text, x, y, opt.color || '#ffffff', scale);
    return w;
  }

  // Word-wrap into lines that fit maxW pixels. Honours '\n'.
  function wrap(text, maxW, scale = 1) {
    const lines = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const test = line ? line + ' ' + word : word;
        if (line && measure(test, scale) > maxW) { lines.push(line); line = word; }
        else line = test;
      }
      lines.push(line);
    }
    return lines;
  }

  G.Font = { draw, measure, wrap, LINE: 10 };
})();
