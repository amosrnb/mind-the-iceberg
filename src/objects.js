// Interactive room objects (§2 role abilities, §3): crates (SMASH), rule stones (READ), blueprint spots (BUILD),
// desire orbs / rule scrolls (Ego Meter), two-player plates, and stone tablets + pedestals (PUSH).
// Positions in room definitions are in tiles.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font, TS = 16;
  const C = G.CONTENT, H = G.CONTENT.hints;
  const T = G.ObjectTypes;

  const tileRect = (tx, ty, w = 1, h = 1) => ({ x: tx * TS, y: ty * TS, w: w * TS, h: h * TS });
  // A player "stands on" something when their feet point is inside it (same rule as exits).
  const feetIn = (p, r) => p.x >= r.x && p.x < r.x + r.w && p.y - 3 >= r.y && p.y - 3 < r.y + r.h;
  G.feetIn = feetIn;
  G.tileRect = tileRect;

  // ---------- Cracked crate: only the Id can SMASH it ----------
  T.crate = (def, room) => {
    const r = tileRect(def.x, def.y);
    return {
      type: 'crate', solid: r, hit: r, x: r.x + 8, y: r.y + 16,
      onAction(p) {
        if (p.role !== 'id') { p.say(H.crateSuperego, 1.6); return; }
        this.dead = true;
        G.audio.play('smash');
        room.burst(this.x, r.y + 6, ['#b07a42', '#8a5a30', '#e0b070', '#5a3a20'], 16, 80);
        room.shake(0.15);
        room.emit('smash');
      },
      draw(ctx) {
        const x = r.x, y = r.y - 4;
        R.rect(ctx, '#3a2414', x, y, 16, 20);
        R.rect(ctx, '#d9a066', x + 1, y + 1, 14, 5);       // top face
        R.rect(ctx, '#b07a42', x + 1, y + 6, 14, 13);      // front
        R.rect(ctx, '#8a5a30', x + 1, y + 11, 14, 1);
        R.rect(ctx, '#8a5a30', x + 3, y + 6, 1, 13); R.rect(ctx, '#8a5a30', x + 12, y + 6, 1, 13);
        // cracks
        R.rect(ctx, '#3a2414', x + 6, y + 7, 1, 3); R.rect(ctx, '#3a2414', x + 7, y + 9, 1, 3);
        R.rect(ctx, '#3a2414', x + 8, y + 12, 1, 3); R.rect(ctx, '#3a2414', x + 9, y + 14, 2, 1);
      },
    };
  };

  // ---------- Rule Stone: only the Superego can READ it ----------
  T.rulestone = (def, room) => {
    const r = tileRect(def.x, def.y);
    return {
      type: 'rulestone', solid: r, hit: r, x: r.x + 8, y: r.y + 16, read: false,
      onAction(p) {
        if (p.role !== 'superego') { p.say(H.cantRead, 1.6); return; }
        G.audio.play('select');
        room.say([{ who: 'stone', text: def.text }], () => {
          if (this.read) return;
          this.read = true;
          room.emit('read', def.id);
        });
      },
      draw(ctx, t) {
        const x = r.x + 1, y = r.y - 10;
        R.rect(ctx, '#26304a', x + 1, y, 12, 26); R.rect(ctx, '#26304a', x, y + 2, 14, 24);
        R.rect(ctx, '#8d99b2', x + 1, y + 3, 12, 22); R.rect(ctx, '#8d99b2', x + 2, y + 1, 10, 2);
        R.rect(ctx, '#b9c4d8', x + 2, y + 1, 4, 23);
        const glow = this.read ? 0.6 + 0.4 * Math.sin(t * 3) : 0;
        const c = this.read ? R.mix('#5a6680', '#9fd0ff', glow) : '#5a6680';
        for (let i = 0; i < 4; i++) R.rect(ctx, c, x + 4, y + 6 + i * 4, i % 2 ? 6 : 8, 1);
      },
    };
  };

  // ---------- Blueprint spot: the Superego BUILDS the bridge here (after the rule is read) ----------
  T.blueprint = (def, room) => {
    const r = tileRect(def.x, def.y, def.w || 1, def.h || 1);
    return {
      type: 'blueprint', hit: r, active: false, used: false,
      onAction(p) {
        if (this.used) return;
        if (p.role !== 'superego') { p.say(H.cantBuild, 1.6); return; }
        if (!this.active) { p.say(H.blueprintFirst, 1.6); return; }
        this.used = true;
        const bridge = room.objects.find((o) => o.type === 'bridge' && o.id === def.bridge);
        bridge.buildAnimated(() => room.emit('built', def.bridge));
      },
      drawBelow(ctx, t) {
        if (this.used) return;
        const on = this.active;
        ctx.globalAlpha = on ? 0.75 + 0.25 * Math.sin(t * 4) : 0.35;
        R.rect(ctx, on ? '#2f6fd0' : '#7d8ba6', r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        ctx.globalAlpha = 1;
        const lc = on ? '#eaf2ff' : '#c3cde0';
        for (let x = r.x + 1; x < r.x + r.w - 1; x += 3) { R.rect(ctx, lc, x, r.y + 1, 2, 1); R.rect(ctx, lc, x, r.y + r.h - 2, 2, 1); }
        for (let y = r.y + 1; y < r.y + r.h - 1; y += 3) { R.rect(ctx, lc, r.x + 1, y, 1, 2); R.rect(ctx, lc, r.x + r.w - 2, y, 1, 2); }
        // a tiny plank-bridge icon
        for (let i = 0; i < 3; i++) R.rect(ctx, lc, r.x + 4, r.y + r.h / 2 - 5 + i * 4, r.w - 8, 2);
      },
    };
  };

  // ---------- Desire Orbs (Id, -20) and Rule Scrolls (Superego, +20) ----------
  function pickup(kind, role, delta) {
    return (def, room) => ({
      type: kind, x: def.x * TS + 8, y: def.y * TS + 12, ph: Math.random() * 6, gone: 0,
      update(dt) {
        if (this.gone > 0) {
          this.gone = Math.max(0, this.gone - dt);
          if (this.gone === 0) room.burst(this.x, this.y - 6, ['#ffffff', kind === 'orb' ? '#ff8a6a' : '#9fd0ff'], 8, 30); // respawn sparkle
          return;
        }
        if (G.Ego.attack > 0) return;
        const p = room.players.find((q) => q.role === role && Math.abs(q.x - this.x) < 9 && Math.abs(q.y - 3 - this.y) < 9);
        if (!p) return;
        G.Ego.add(room, delta);
        G.audio.play('pickup');
        room.burst(this.x, this.y - 6, kind === 'orb' ? ['#ff6b5a', '#ffd166', '#ffffff'] : ['#6fb0ff', '#eaf2ff', '#ffffff'], 10, 50);
        if (def.respawn) this.gone = def.respawn; else this.dead = true;
        room.emit('pickup', kind);
      },
      draw(ctx, t) {
        if (this.gone > 0) return;
        const y = this.y - 7 + Math.round(Math.sin(t * 4 + this.ph) * 2);
        R.disc(ctx, 'rgba(10,10,30,0.25)', this.x, this.y, 4, 1);
        if (kind === 'orb') {
          ctx.globalAlpha = 0.35; R.disc(ctx, '#ff8a6a', this.x, y, 7); ctx.globalAlpha = 1;
          R.disc(ctx, '#7a1a1a', this.x, y, 5);
          R.disc(ctx, '#E8453C', this.x, y, 4);
          // little cake: sponge, cream, cherry
          R.rect(ctx, '#f6d2a0', this.x - 2, y, 5, 2);
          R.rect(ctx, '#ffffff', this.x - 2, y - 1, 5, 1);
          R.rect(ctx, '#ff2a4a', this.x, y - 2, 1, 1);
          R.rect(ctx, '#ffd0c0', this.x - 3, y - 3, 1, 1);
        } else {
          ctx.globalAlpha = 0.35; R.disc(ctx, '#9fd0ff', this.x, y, 7); ctx.globalAlpha = 1;
          R.rect(ctx, '#1a2a5a', this.x - 6, y - 4, 12, 9);
          R.rect(ctx, '#eaf2ff', this.x - 4, y - 3, 8, 7);
          R.rect(ctx, '#3B7DD8', this.x - 5, y - 4, 2, 9); R.rect(ctx, '#3B7DD8', this.x + 3, y - 4, 2, 9);
          R.rect(ctx, '#9fb6d8', this.x - 2, y - 1, 4, 1); R.rect(ctx, '#9fb6d8', this.x - 2, y + 1, 3, 1);
        }
      },
    });
  }
  T.orb = pickup('orb', 'id', -20);
  T.scroll = pickup('scroll', 'superego', +20);

  // ---------- Two-player plate: only counts while the matching role stands on it ----------
  T.plate = (def, room) => {
    const r = tileRect(def.x, def.y, def.w || 2, def.h || 2);
    const isId = def.role === 'id';
    return {
      type: 'plate', role: def.role, rect: r, pressed: false,
      update() {
        this.pressed = room.players.some((p) => p.role === def.role && feetIn(p, r));
        const wrong = room.players.find((p) => p.role !== def.role && feetIn(p, r));
        if (wrong && !this.pressed) wrong.say(H.plateFor[def.role], 0.3);
      },
      drawBelow(ctx, t) {
        const base = isId ? '#E8453C' : '#3B7DD8', light = isId ? '#F39C34' : '#EAF2FF';
        const d = this.pressed ? 1 : 0;
        R.rect(ctx, '#141022', r.x + 1, r.y + 2, r.w - 2, r.h - 3);
        R.rect(ctx, R.shade(base, -0.35), r.x + 2, r.y + 3 + d, r.w - 4, r.h - 5 - d);
        R.rect(ctx, this.pressed ? light : base, r.x + 2, r.y + 3 + d, r.w - 4, r.h - 8);
        if (this.pressed) { ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 8); R.rect(ctx, '#ffffff', r.x + 2, r.y + 3 + d, r.w - 4, r.h - 8); ctx.globalAlpha = 1; }
        const cx = r.x + r.w / 2 - 4, cy = r.y + r.h / 2 - 5 + d;
        if (isId) G.UI.flameIcon(ctx, cx, cy, t); else G.UI.haloIcon(ctx, cx, cy);
      },
    };
  };

  // ---------- Pedestal: shows "?" until the Superego reads it ----------
  T.pedestal = (def, room) => {
    const r = tileRect(def.x, def.y);
    return {
      type: 'pedestal', tx: def.x, ty: def.y, accept: def.accept, hit: r, revealed: false, filled: null,
      onAction(p) {
        if (p.role !== 'superego') { p.say(H.cantRead, 1.6); return; }
        G.audio.play('select');
        this.revealed = true;
        room.say([{ who: 'pedestal', text: def.text }, ...(def.explain || [])]);
      },
      drawBelow(ctx, t) {
        R.disc(ctx, '#2b3550', r.x + 8, r.y + 9, 8, 5);
        R.disc(ctx, this.filled ? '#ffd166' : '#a7b3c9', r.x + 8, r.y + 8, 7, 4);
        R.disc(ctx, this.filled ? '#fff1b8' : '#c9d3e4', r.x + 8, r.y + 7, 5, 2);
      },
      drawAbove(ctx, t) {
        // once read, the stage name is shown too (until the tablet itself sits on the pedestal)
        const label = !this.revealed ? '?' : this.filled ? 'Age ' + def.short : C.stages.tablets[def.accept] + ' ' + def.short;
        const y = r.y - (this.filled ? 32 : 22) + (this.revealed ? 0 : Math.round(Math.sin(t * 3 + def.x)));
        F.draw(ctx, label, r.x + 8, y, { align: 'center', color: this.filled ? '#ffd166' : this.revealed ? '#eaf2ff' : '#c9a7ff', outline: '#141022' });
      },
    };
  };

  // ---------- Stone tablet: only the Id can PUSH it, one tile per push ----------
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  T.tablet = (def, room) => {
    const o = {
      type: 'tablet', id: def.id, label: C.stages.tablets[def.id] || def.id,
      tx: def.x, ty: def.y, px: def.x * TS, py: def.y * TS,
      anim: null, push: null, locked: false, wrongs: 0, warnT: 0, stuckT: 0, checkT: 0, needRelease: false, bumped: false,
      get solid() { return tileRect(this.tx, this.ty); },
      get x() { return this.px + 8; },
      get y() { return this.py + 16; },

      onBump(p, dx, dy) {
        this.bumped = true;
        if (this.locked || this.anim || this.needRelease || (dx && dy)) return;
        if (p.role !== 'id') {
          if (this.warnT <= 0) { p.say(H.tooHeavy, 1.4); this.warnT = 2; }
          return;
        }
        const k = dx + ',' + dy;
        if (this.push && this.push.k === k) this.push.seen = true;
        else this.push = { k, dx, dy, t: 0, seen: true };
      },

      // Can a tablet occupy this tile?
      free(nx, ny) {
        if (room.solidTile(nx, ny)) return false;
        const r = tileRect(nx, ny);
        const ov = (a) => a.x < r.x + r.w && a.x + a.w > r.x && a.y < r.y + r.h && a.y + a.h > r.y;
        if (room.objects.some((q) => q !== this && q.solid && !q.dead && ov(q.solid))) return false;
        return !room.players.some((p) => ov(p.box()));
      },
      // Can the Id stand here to push? (players don't block, other solids do)
      standable(nx, ny) {
        if (room.solidTile(nx, ny)) return false;
        const r = tileRect(nx, ny);
        return !room.objects.some((q) => q !== this && q.solid && !q.dead && q.solid.x === r.x && q.solid.y === r.y);
      },

      tryMove(dx, dy) {
        const nx = this.tx + dx, ny = this.ty + dy;
        if (!this.free(nx, ny)) return;
        const ped = room.objects.find((q) => q.type === 'pedestal' && q.tx === nx && q.ty === ny);
        if (ped && ped.accept !== this.id) {
          // wrong pedestal: it slides on, then back
          this.anim = { dx, dy, t: 0, bounce: true };
          this.wrongs++;
          this.needRelease = true; // the Id has to let go before the next try
          G.audio.play('buzz');
          G.Ego.wrong(room);
          const id = room.players.find((p) => p.role === 'id');
          id.say(H.checkAge, 2.2);
          room.emit('wrongTablet', this.id);
          return;
        }
        this.anim = { dx, dy, t: 0, fromX: this.tx, fromY: this.ty, ped };
        this.tx = nx; this.ty = ny;
        G.audio.play('push');
      },

      // Is there an empty pedestal this tablet can still be pushed onto? (BFS over push moves)
      canReachPedestal() {
        const goal = new Set(room.objects.filter((q) => q.type === 'pedestal' && !q.filled).map((q) => q.tx + ',' + q.ty));
        const seen = new Set([this.tx + ',' + this.ty]), queue = [[this.tx, this.ty]];
        while (queue.length) {
          const [x, y] = queue.shift();
          if (goal.has(x + ',' + y)) return true;
          for (const [dx, dy] of DIRS) {
            const k = (x + dx) + ',' + (y + dy);
            if (seen.has(k) || !this.standable(x - dx, y - dy) || !this.standable(x + dx, y + dy)) continue;
            seen.add(k);
            queue.push([x + dx, y + dy]);
          }
        }
        return false;
      },

      update(dt) {
        this.warnT -= dt;
        if (!this.bumped) this.needRelease = false;
        this.bumped = false;
        if (this.push) {
          if (!this.push.seen) this.push = null;
          else {
            this.push.seen = false;
            this.push.t += dt;
            if (this.push.t > 0.12) { const { dx, dy } = this.push; this.push = null; this.tryMove(dx, dy); }
          }
        }
        if (this.anim) {
          const a = this.anim;
          a.t = Math.min(1, a.t + dt / 0.16);
          if (a.bounce) {
            const k = Math.sin(a.t * Math.PI) * 0.45;
            this.px = (this.tx + a.dx * k) * TS; this.py = (this.ty + a.dy * k) * TS;
          } else {
            this.px = (a.fromX + (this.tx - a.fromX) * a.t) * TS; this.py = (a.fromY + (this.ty - a.fromY) * a.t) * TS;
          }
          if (a.t >= 1) { this.anim = null; if (a.ped) this.lockOn(a.ped); }
          return;
        }
        // Reset if it can no longer reach any free pedestal (stuck in a corner etc.).
        if (this.locked) return;
        if ((this.checkT -= dt) <= 0) { this.checkT = 0.5; this.reachable = this.canReachPedestal(); }
        if (this.reachable) { this.stuckT = 0; return; }
        if ((this.stuckT += dt) >= 3 && this.free(def.x, def.y)) {
          room.burst(this.x, this.py + 4, ['#c9d3e4', '#ffffff'], 12, 40);
          this.tx = def.x; this.ty = def.y; this.px = def.x * TS; this.py = def.y * TS;
          this.stuckT = 0; this.checkT = 0;
          G.audio.play('whoosh');
        }
      },

      lockOn(ped) {
        this.locked = true;
        ped.filled = this;
        if (!this.wrongs) G.game.stats.firstTry++;
        G.audio.play('chime');
        room.burst(this.x, this.py, ['#ffd166', '#fff1b8', '#ffffff'], 16, 60);
        room.emit('placed', this.id);
      },

      draw(ctx, t) {
        const x = Math.round(this.px), y = Math.round(this.py) - 8;
        if (this.locked) {
          ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 4);
          R.disc(ctx, '#ffd166', x + 8, y + 12, 13, 12);
          ctx.globalAlpha = 1;
        }
        R.rect(ctx, '#1a1f30', x, y, 16, 24);
        R.rect(ctx, this.locked ? '#e8c86a' : '#a7b3c9', x + 1, y + 1, 14, 6);   // top
        R.rect(ctx, this.locked ? '#c9a24a' : '#7d8ba6', x + 1, y + 7, 14, 16);  // front
        R.rect(ctx, this.locked ? '#a8842e' : '#66748f', x + 1, y + 20, 14, 3);
        for (let i = 0; i < 3; i++) R.rect(ctx, this.locked ? '#fff1b8' : '#c9d3e4', x + 4, y + 10 + i * 3, i === 1 ? 6 : 8, 1);
        F.draw(ctx, this.label, x + 8, y - 10, { align: 'center', color: this.locked ? '#ffd166' : '#ffffff', outline: '#141022' });
      },
    };
    return o;
  };
})();
