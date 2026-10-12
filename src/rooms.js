// Room data: every room is exactly one screen (30 x 17 tiles of 16 px; the top two rows sit under the HUD).
//
// Tile legend
//   .  floor            ,  rug (study)        ~  water (solid)      X  chasm (solid)
//   #  wall             T  pine tree (solid)  r  rock / coral (solid)
//   p  small plant (walkable decor)           =  bridge (walkable)
//   B  bookshelf  C  couch (walkable)  D  desk  S  statue  P  potted plant  O  door   (study furniture)
//   G  gate / huge door (drawn with state)     V  vault door (drawn with state)
//
// exits: rectangles in tiles. A room is left only when BOTH players stand inside the same exit.
// spawn: tile positions for P1 (Id) and P2 (Superego).
(function () {
  const G = window.G;

  const ROOMS = {
    study: {
      zone: 'study', title: "FREUD'S STUDY · VIENNA 1909",
      map: [
        '##############################',
        '#BBBBBBBBB##########BBBBBBBBB#',
        '#BBBBBBBBB##########BBBBBBBBB#',
        '#S..........................S#',
        '#...CCCC.....................#',
        '#...CCCC..........DDDD.......#',
        '#.................DDDD.......#',
        '#.........,,,,,,,,,,.........#',
        '#.........,,,,,,,,,,.........#',
        '#.........,,,,,,,,,,.........#',
        '#.........,,,,,,,,,,.........#',
        '#............................#',
        '#.P........................P.#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#############OOOO#############',
      ],
      spawn: { p1: [13, 14], p2: [16, 14] },
      exits: [{ x: 4, y: 4, w: 4, h: 2, style: 'none', open: false, transition: 'swirl' }], // the couch, opens after Freud's briefing
      objects: [{ type: 'freud', x: 320, y: 78 }],
    },

    surface: {
      zone: 'surface', title: 'THE SURFACE · CONSCIOUS',
      map: [
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '#.........#.......~~~........#',
        '#..r......#.......~~~...r....#',
        '#.........#.......~~~........#',
        '#.........#.......~~~........#',
        '#.........#.......~~~........#',
        '#.................~~~.........',
        '#.................~~~.........',
        '#.................~~~.........',
        '#.........#.......~~~........#',
        '#....r....#.......~~~.....r..#',
        '#.........#.......~~~........#',
        '#.........#.......~~~........#',
        '#.........#.......~~~........#',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
      spawn: { p1: [2, 9], p2: [6, 9] },
      exits: [{ x: 28, y: 8, w: 2, h: 3, style: 'arrow', dir: 'right', open: false }],
      objects: [
        { type: 'crate', x: 10, y: 8 }, { type: 'crate', x: 10, y: 9 }, { type: 'crate', x: 10, y: 10 },
        { type: 'rulestone', x: 16, y: 7, id: 'bridge', text: G.CONTENT.surface.rule },
        { type: 'blueprint', x: 17, y: 9, w: 1, h: 2, bridge: 'b1' },
        { type: 'bridge', id: 'b1', tiles: [[18, 9], [18, 10], [19, 9], [19, 10], [20, 9], [20, 10]] },
      ],
    },

    egogate: {
      zone: 'surface', title: 'THE EGO GATE · CONSCIOUS',
      map: [
        '##############################',
        '##############################',
        '#############GGGG#############',
        '#############GGGG#############',
        '#............................#',
        '#.r........................r.#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#..r....................r....#',
        '#............................#',
        '##############################',
      ],
      spawn: { p1: [13, 13], p2: [16, 13] },
      exits: [{ x: 13, y: 4, w: 4, h: 1, style: 'hole', open: false }],
      objects: [
        // Items respawn so the Ego can always be rebalanced (otherwise using them all could soft-lock the room).
        { type: 'scroll', x: 3, y: 7, respawn: 6 }, { type: 'scroll', x: 26, y: 7, respawn: 6 },
        { type: 'scroll', x: 5, y: 13, respawn: 6 }, { type: 'scroll', x: 24, y: 13, respawn: 6 },
        { type: 'orb', x: 2, y: 11, respawn: 6 }, { type: 'orb', x: 27, y: 11, respawn: 6 }, { type: 'orb', x: 9, y: 4, respawn: 6 },
        {
          type: 'quiz', id: 'who', title: G.CONTENT.egogate.title, questions: G.CONTENT.egogate.quiz,
          tiles: G.CONTENT.egogate.options.map((label, i) => ({ x: 8 + i * 5.5, y: 7, label })),
        },
      ],
    },

    stages: {
      zone: 'forest', title: 'THE STAGE TABLETS · PRECONSCIOUS',
      map: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T...r....................r...T',
        'T............................T',
        'T............................T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      ],
      spawn: { p1: [2, 9], p2: [6, 9] },
      exits: [{ x: 28, y: 8, w: 2, h: 3, style: 'arrow', dir: 'right', open: false }],
      objects: [
        ...G.CONTENT.stages.pedestals.map((ped, i) => ({ type: 'pedestal', x: 5 + i * 5, y: 5, ...ped })),
        // Each tablet starts a few tiles from its pedestal (never below it), on its own row and column,
        // so the sideways and upward push paths never cross.
        { type: 'tablet', id: 'anal', x: 8, y: 9 }, { type: 'tablet', id: 'oral', x: 13, y: 11 },
        { type: 'tablet', id: 'genital', x: 18, y: 11 }, { type: 'tablet', id: 'phallic', x: 23, y: 10 },
        { type: 'tablet', id: 'latency', x: 27, y: 8 },
      ],
    },

    grove: {
      zone: 'forest', title: 'THE FIXATION GROVE · PRECONSCIOUS',
      map: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T............................T',
        'T............................T',
        'T.p........................p.T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T............................T',
        'T..r......................r..T',
        'T............................T',
        'T............................T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      ],
      spawn: { p1: [13, 14], p2: [16, 14] },
      exits: [{ x: 13, y: 11, w: 4, h: 2, style: 'hole', open: false }], // the floor cracks open at the end
      objects: [
        { type: 'memorybubble', key: 'memory', x: 240, y: 74 },
        { type: 'ghost', index: 0, x: 152, y: 126, look: { body: 3, fur: 1, hair: 0, outfit: 7, acc: 5 } },
        { type: 'ghost', index: 1, x: 240, y: 126, look: { body: 3, fur: 3, hair: 3, outfit: 6, acc: 1 } },
        { type: 'ghost', index: 2, x: 328, y: 126, look: { body: 3, fur: 4, hair: 2, outfit: 5, acc: 2 } },
        {
          type: 'quiz', id: 'fixation', title: G.CONTENT.grove.title, questions: G.CONTENT.grove.quiz,
          tiles: G.CONTENT.grove.options.map((label, i) => ({ x: 8 + i * 5.5, y: 8, label })),
        },
      ],
    },

    dream: {
      zone: 'deep', title: 'THE DREAM CHASM · UNCONSCIOUS',
      map: [
        '##############################',
        '##############################',
        '##############################',
        '#............XXX.............#',
        '#..p.........XXX......p......#',
        '#............XXX.............#',
        '#............XXX.............#',
        '#............XXX.............#',
        '#............XXX..............',
        '#............XXX..............',
        '#............XXX..............',
        '#............XXX.............#',
        '#............XXX.............#',
        '#............XXX.............#',
        '#.......p....XXX..........p..#',
        '#............XXX.............#',
        '##############################',
      ],
      dark: true,
      spawn: { p1: [18, 9], p2: [10, 9] }, // Superego on the left, Id on the right
      exits: [{ x: 28, y: 8, w: 2, h: 3, style: 'arrow', dir: 'right', open: false }],
      // The bridge over the chasm (columns 13–15, rows 9–10) is built piece by piece by matching dream images.
      objects: [{ type: 'matcher', left: [[5, 4], [5, 8], [5, 12]], right: [[21, 4], [21, 8], [21, 12]] }],
    },

    guards: {
      zone: 'deep', title: 'GUARDS OF THE EGO · UNCONSCIOUS',
      map: [
        '##############################',
        '##############################',
        '############GGGGGG############',
        '############GGGGGG############',
        '#######................#######',
        '#######................#######',
        '#######.p............p.#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '#######................#######',
        '##############################',
      ],
      spawn: { p1: [13, 14], p2: [16, 14] },
      exits: [{ x: 12, y: 4, w: 6, h: 1, style: 'none', open: false }],
      objects: [
        ...G.CONTENT.guards.guards.map((label, i) => ({ type: 'guard', id: label, label, x: 160 + i * 80, y: 104 })),
        {
          type: 'quiz', id: 'defence', title: G.CONTENT.guards.title, questions: G.CONTENT.guards.quiz,
          tiles: G.CONTENT.guards.options.map((label, i) => ({ x: 7.5 + i * 5.5, y: 9, w: 4, label })),
        },
      ],
    },

    vault: {
      zone: 'vault', title: 'THE REPRESSION VAULT · UNCONSCIOUS',
      map: [
        '##############################',
        '##############################',
        '############VVVVVV############',
        '#####.......VVVVVV.......#####',
        '###.........VVVVVV.........###',
        '##..........................##',
        '#.r........................r.#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '#............................#',
        '##..........................##',
        '###........................###',
        '#####....................#####',
        '##############################',
      ],
      spawn: { p1: [10, 13], p2: [19, 13] },
      exits: [], // the boss fight ends the room
      objects: [
        { type: 'plate', role: 'id', x: 4, y: 12 }, { type: 'plate', role: 'superego', x: 24, y: 12 },
        { type: 'orb', x: 3, y: 8, respawn: 6 }, { type: 'orb', x: 20, y: 14, respawn: 6 },
        { type: 'scroll', x: 26, y: 8, respawn: 6 }, { type: 'scroll', x: 9, y: 14, respawn: 6 },
        {
          type: 'quiz', id: 'boss', title: G.CONTENT.boss.title, questions: G.CONTENT.boss.quiz,
          tiles: [0, 1, 2].map((i) => ({ x: 7.5 + i * 5.5, y: 10, w: 4, label: '' })),
        },
        { type: 'boss', x: 240, y: 140 },
      ],
    },
  };

  // Linear game flow.
  const FLOW = [
    { scene: 'title' },
    { scene: 'intro' },
    { scene: 'names' },
    { scene: 'creator' },
    { scene: 'room', id: 'study' },
    { scene: 'map', layer: 0 },
    { scene: 'room', id: 'surface' },
    { scene: 'room', id: 'egogate' },
    { scene: 'map', layer: 1 },
    { scene: 'room', id: 'stages' },
    { scene: 'room', id: 'grove' },
    { scene: 'map', layer: 2 },
    { scene: 'room', id: 'dream' },
    { scene: 'room', id: 'guards' },
    { scene: 'room', id: 'vault' },
    { scene: 'ending' },
    { scene: 'casenotes' },
  ];

  // Sanity-check map sizes so a typo can't silently shift a room.
  for (const id in ROOMS) {
    const m = ROOMS[id].map;
    if (m.length !== 17) console.warn(`Room ${id}: ${m.length} rows (expected 17)`);
    m.forEach((row, i) => { if (row.length !== 30) console.warn(`Room ${id} row ${i}: ${row.length} cols (expected 30)`); });
  }

  G.ROOMS = ROOMS;
  G.FLOW = FLOW;
})();
