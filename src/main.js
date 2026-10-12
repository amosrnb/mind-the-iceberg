// Game state, scene flow with fade / swirl transitions, pause menu, fixed-timestep loop, global keys and debug mode.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font;
  const STEP = 1 / 60;
  const FADE = 0.15;  // fade out + fade in = 0.3 s
  const SWIRL = 0.6;  // the swirl into Hans's mind (fade out only)

  G.game = {
    names: ['Player 1', 'Player 2'],
    // Indices into the creator options (see Sprites.OPTION_COUNTS). These are the creator's starting looks.
    looks: [
      { body: 1, fur: 0, hair: 0, outfit: 0, acc: 0 },
      { body: 2, fur: 1, hair: 2, outfit: 1, acc: 1 },
    ],
    ego: 0,
    // firstTry: quiz questions / matches answered correctly at the first try; attacks: anxiety attacks (Case Notes)
    stats: { firstTry: 0, attacks: 0 },
    time: 0,
    timing: false,
    debug: /[?&]debug=1/.test(location.search),
  };

  let flowIndex = 0;
  let scene = null;
  const fade = { a: 0, dir: 0, target: 0, style: 'fade' };
  const pause = { on: false, sel: 0 };
  let snapshot = null; // Ego + score when the current scene started (for 'Restart room')
  const [buf, bctx] = R.makeCanvas(R.W, R.H);
  let fps = 60, fpsAcc = 0, fpsFrames = 0;
  let volToast = 0; // shows the volume slider briefly outside rooms (where the HUD has none)

  function makeScene(step) {
    switch (step.scene) {
      case 'title': return new G.TitleScene();
      case 'intro': return new G.IntroScene();
      case 'names': return new G.NameScene();
      case 'creator': return new G.CreatorScene();
      case 'room': return new G.RoomScene(step.id);
      case 'map': return new G.MapScene(step.layer);
      case 'ending': return new G.EndingScene();
      case 'casenotes': return new G.CaseNotesScene();
    }
    throw new Error('Unknown scene ' + step.scene);
  }

  // Background tune per scene: the zone of a room, or the zone a map leads into.
  function musicFor(step) {
    if (step.scene === 'room') return G.ROOMS[step.id].zone;
    if (step.scene === 'map') return ['surface', 'forest', 'deep'][step.layer];
    if (step.scene === 'ending') return 'ending';
    if (step.scene === 'intro') return 'intro';
    if (step.scene === 'casenotes') return 'study';
    return 'title';
  }

  function enter(i) {
    if (i === flowIndex && snapshot) { G.game.ego = snapshot.ego; G.game.stats = { ...snapshot.stats }; } // restart
    flowIndex = i;
    const step = G.FLOW[i];
    if (step.scene === 'title') { G.game.time = 0; G.game.timing = false; G.game.ego = 0; G.game.stats = { firstTry: 0, attacks: 0 }; }
    if (step.scene === 'room' && step.id === 'study') { G.game.time = 0; G.game.timing = true; }
    scene = makeScene(step);
    G.audio.music(musicFor(step));
    snapshot = { ego: G.game.ego, stats: { ...G.game.stats } };
  }

  // style: 'fade' (default) or 'swirl'
  G.goTo = (i, style) => {
    if (fade.dir === 1) return;
    fade.dir = 1;
    fade.target = i;
    fade.style = style || 'fade';
  };
  G.next = (style) => G.goTo((flowIndex + 1) % G.FLOW.length, style);
  G.restartRoom = () => G.goTo(flowIndex);
  G.currentScene = () => scene;

  function update(dt) {
    const I = G.input;
    // Global keys
    if (I.wasPressed('KeyM')) G.audio.toggleMute();
    if (I.wasPressed('KeyN') && !G.game.debug) G.audio.toggleMusic();
    // - / + : music volume (any keyboard layout, number pad too)
    const volDown = I.wasPressed('VolDown'), volUp = I.wasPressed('VolUp');
    if (volDown || volUp) { G.audio.setMusicVolume(G.audio.musicVolume + (volUp ? 0.1 : -0.1)); volToast = 1.5; }
    volToast = Math.max(0, volToast - dt);
    if (I.wasPressed('KeyD') && I.isDown('ShiftLeft')) G.game.debug = !G.game.debug;
    if (G.game.debug && !fade.dir) {
      if (I.wasPressed('KeyN')) G.next();
      if (I.wasPressed('KeyB')) G.goTo(G.FLOW.findIndex((s) => s.id === 'vault'));
    }

    // Pause menu (Esc)
    if (I.wasPressed('Escape') && !fade.dir && scene.pausable !== false) {
      pause.on = !pause.on; pause.sel = 0; G.audio.play('select');
      return;
    }
    if (pause.on) { updatePause(); return; }

    if (fade.dir === 1) {
      fade.a += dt / (fade.style === 'swirl' ? SWIRL : FADE);
      if (fade.a >= 1) { fade.a = 1; enter(fade.target); fade.dir = -1; }
      return; // freeze the old scene while fading out
    }
    if (fade.dir === -1) {
      fade.a -= dt / FADE;
      if (fade.a <= 0) { fade.a = 0; fade.dir = 0; }
    }
    if (G.game.timing && scene.timed) G.game.time += dt;
    scene.update(dt);
  }

  function updatePause() {
    const I = G.input, n = G.CONTENT.pause.items.length;
    const dy = (I.hit(1, 'down') || I.hit(2, 'down') ? 1 : 0) - (I.hit(1, 'up') || I.hit(2, 'up') ? 1 : 0);
    if (dy) { pause.sel = (pause.sel + dy + n) % n; G.audio.play('blip'); }
    if (!I.anyAction()) return;
    G.audio.play('select');
    if (pause.sel === 0) pause.on = false;
    else if (pause.sel === 1) { pause.on = false; G.restartRoom(); }
    else if (pause.sel === 2) G.audio.toggleMute();
    else if (pause.sel === 3) G.audio.toggleMusic();
    else if (pause.sel === 4) G.fullscreen.toggle();
    else { pause.on = false; G.goTo(0); }
  }

  function drawPause(ctx) {
    const P = G.CONTENT.pause;
    ctx.globalAlpha = 0.6; R.rect(ctx, '#05071a', 0, 0, R.W, R.H); ctx.globalAlpha = 1;
    const w = 200, h = 34 + P.items.length * 16 + 16, x = (R.W - w) / 2, y = (R.H - h) / 2;
    R.panel(ctx, x, y, w, h, '#1c2340', '#eaf2ff');
    F.draw(ctx, P.title, R.W / 2, y + 8, { scale: 2, align: 'center', color: '#ffd166', outline: '#0b0e1c' });
    P.items.forEach((item, i) => {
      const label = i === 2 ? item + ': ' + (G.audio.muted ? P.off : P.on)
        : i === 3 ? item + ': ' + (G.audio.musicMuted ? P.off : P.on)
        : i === 4 ? item + ': ' + (G.fullscreen.on ? P.on : P.off) : item;
      const sel = i === pause.sel, iy = y + 32 + i * 16;
      if (sel) R.rect(ctx, '#2f3d70', x + 10, iy - 3, w - 20, 14);
      F.draw(ctx, (sel ? '→ ' : '') + label, R.W / 2, iy, { align: 'center', color: sel ? '#ffffff' : '#9fb0d8' });
    });
    F.draw(ctx, P.hint, R.W / 2, y + h - 13, { align: 'center', color: '#8fa3cc' });
    F.draw(ctx, P.keys, R.W / 2, y + h + 6, { align: 'center', color: '#bfd0f0', outline: '#05071a' });
  }

  function render() {
    const ctx = R.ctx;
    if (fade.style === 'swirl' && fade.dir === 1 && fade.a > 0) {
      // swirl into Hans's mind: the old scene spins and shrinks into the dark
      scene.draw(bctx);
      R.rect(ctx, '#0b0718', 0, 0, R.W, R.H);
      const k = 1 - fade.a * 0.9;
      ctx.save();
      ctx.translate(R.W / 2, R.H / 2);
      ctx.rotate(fade.a * fade.a * Math.PI * 3);
      ctx.scale(k, k);
      ctx.drawImage(buf, -R.W / 2, -R.H / 2);
      ctx.restore();
      ctx.globalAlpha = fade.a * 0.6; R.rect(ctx, '#3a1a5a', 0, 0, R.W, R.H); ctx.globalAlpha = 1;
    } else scene.draw(ctx);
    if (pause.on) drawPause(ctx);
    if (volToast > 0 && !(scene instanceof G.RoomScene)) {
      R.panel(ctx, 2, 2, 54, 15, '#1c2340', '#eaf2ff');
      G.UI.volumeSlider(ctx, 6, 5);
    }
    if (fade.a > 0 && !(fade.style === 'swirl' && fade.dir === 1)) {
      ctx.globalAlpha = fade.a;
      R.rect(ctx, '#000', 0, 0, R.W, R.H);
      ctx.globalAlpha = 1;
    }
    if (G.audio.muted) F.draw(ctx, 'MUTED (M)', R.W - 4, 16, { align: 'right', color: '#ffd166', outline: '#141022' });
    else if (G.audio.musicMuted) F.draw(ctx, 'MUSIC OFF (N)', R.W - 4, 16, { align: 'right', color: '#ffd166', outline: '#141022' });
    if (G.game.debug) {
      const step = G.FLOW[flowIndex];
      F.draw(ctx, `DEBUG  ${step.scene}${step.id ? ':' + step.id : ''}${step.layer !== undefined ? ':' + step.layer : ''}  ${fps} fps  N=next B=boss`,
        4, R.H - 22, { color: '#ffff66', outline: '#000' });
    }
  }

  let last = performance.now(), acc = 0;
  function frame(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;
    acc += elapsed;
    fpsAcc += elapsed; fpsFrames++;
    if (fpsAcc >= 0.5) { fps = Math.round(fpsFrames / fpsAcc); fpsAcc = 0; fpsFrames = 0; }
    let ticks = 0;
    while (acc >= STEP && ticks < 8) {
      update(STEP);
      G.input.endTick();
      acc -= STEP;
      ticks++;
    }
    if (ticks === 8) acc = 0;
    render();
    requestAnimationFrame(frame);
  }

  enter(0);
  requestAnimationFrame(frame);
})();
