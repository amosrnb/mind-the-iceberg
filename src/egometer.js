// The Ego Meter logic (§3.1): -100 (Id) .. +100 (Superego), balanced zone -15..+15, anxiety attacks at ±100.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font;

  const E = {
    shakeT: 0,   // short shake after every change
    attack: 0,   // seconds left of an anxiety attack
    side: 0,     // -1 = Id, +1 = Superego (side of the current attack)

    balanced: () => Math.abs(G.game.ego) <= 15,

    add(room, d) {
      if (E.attack > 0) return;
      G.game.ego = Math.max(-100, Math.min(100, G.game.ego + d));
      E.shakeT = 0.35;
      if (Math.abs(G.game.ego) >= 100) {
        E.side = Math.sign(G.game.ego);
        E.attack = 2;
        G.game.stats.attacks = (G.game.stats.attacks || 0) + 1;
        for (const p of room.players) p.stun = 2;
        G.audio.play('anxiety');
        room.shake(0.4);
      }
    },

    // Wrong answers push 25 points away from the centre (toward the Id side if at 0).
    wrong(room) { E.add(room, (G.game.ego > 0 ? 1 : -1) * 25); },

    // Value the meter returns to after an anxiety attack (0 by default; a room can change it).
    resetTo: 0,

    reset() { E.shakeT = 0; E.attack = 0; E.resetTo = 0; },

    update(dt) {
      E.shakeT = Math.max(0, E.shakeT - dt);
      if (E.attack > 0 && (E.attack -= dt) <= 0) { E.attack = 0; G.game.ego = E.resetTo; }
    },

    meterShake: () => (E.shakeT > 0 ? 2 : Math.abs(G.game.ego) > 70 ? 1 : 0),

    // Red / blue vignette beyond ±70 and the anxiety attack banner.
    drawOverlay(ctx, t) {
      const v = G.game.ego;
      if (Math.abs(v) > 70 || E.attack > 0) {
        const side = E.attack > 0 ? E.side : Math.sign(v);
        const col = side < 0 ? '#E8453C' : '#3B7DD8';
        const base = (E.attack > 0 ? 0.35 : 0.18) + 0.08 * Math.sin(t * 6);
        for (let i = 0; i < 6; i++) {
          ctx.globalAlpha = base * (1 - i / 6);
          const k = i * 4;
          R.rect(ctx, col, k, 27 + k, R.W - 2 * k, 4);
          R.rect(ctx, col, k, R.H - 4 - k, R.W - 2 * k, 4);
          R.rect(ctx, col, k, 27 + k, 4, R.H - 27 - 2 * k);
          R.rect(ctx, col, R.W - 4 - k, 27 + k, 4, R.H - 27 - 2 * k);
        }
        ctx.globalAlpha = 1;
      }
      if (E.attack > 0) {
        const C = G.CONTENT.anxiety;
        const msg = E.side < 0 ? C.id : C.superego;
        const w = Math.max(F.measure(C.title, 2), F.measure(msg)) + 24;
        R.panel(ctx, R.W / 2 - w / 2, 108, w, 40, '#2a0f1a', E.side < 0 ? '#E8453C' : '#3B7DD8');
        F.draw(ctx, C.title, R.W / 2, 114, { scale: 2, align: 'center', color: '#ffd166', outline: '#141022' });
        F.draw(ctx, msg, R.W / 2, 134, { align: 'center', color: '#ffffff' });
      }
    },
  };

  G.Ego = E;
})();
