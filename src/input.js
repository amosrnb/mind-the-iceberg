// Keyboard input for two players on one keyboard. Tracks held keys in a Set (never relies on key-repeat).
(function () {
  const G = window.G;

  const KEYS = {
    1: { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], action: ['KeyF'] },
    2: {
      up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
      action: ['Enter', 'NumpadEnter', 'ShiftRight', 'Numpad0'],
    },
  };
  const PREVENT = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'NumpadEnter',
    'Numpad0', 'ShiftRight', 'Tab', 'Backspace',
  ]);

  const down = new Set();
  const pressed = new Set(); // keys that went down since the last logic tick

  window.addEventListener('keydown', (e) => {
    if (PREVENT.has(e.code)) e.preventDefault();
    if (G.audio) G.audio.unlock();
    if (G.input.onText && G.input.onText(e)) return; // text entry (name screen) can consume keys
    if (!e.repeat && !down.has(e.code)) pressed.add(e.code);
    // Layout-independent music volume keys: the typed character, not the key position.
    if (e.key === '-') pressed.add('VolDown');
    if (e.key === '+' || e.key === '=') pressed.add('VolUp');
    down.add(e.code);
  });
  window.addEventListener('keyup', (e) => { down.delete(e.code); });
  window.addEventListener('blur', () => down.clear());

  const any = (codes, set) => codes.some((c) => set.has(c));

  G.input = {
    KEYS,
    onText: null,
    isDown: (code) => down.has(code),
    wasPressed: (code) => pressed.has(code),
    held: (p, act) => any(KEYS[p][act], down),
    hit: (p, act) => any(KEYS[p][act], pressed),
    // Either player's action key (used to advance dialogue / screens).
    anyAction: () => any(KEYS[1].action, pressed) || any(KEYS[2].action, pressed),
    axis(p) {
      const k = KEYS[p];
      return {
        x: (any(k.right, down) ? 1 : 0) - (any(k.left, down) ? 1 : 0),
        y: (any(k.down, down) ? 1 : 0) - (any(k.up, down) ? 1 : 0),
      };
    },
    endTick: () => pressed.clear(),
  };
})();
