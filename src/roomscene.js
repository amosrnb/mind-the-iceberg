// The room scene: one screen of tiles, two players, room objects, exits and the HUD.
(function () {
  const G = window.G;
  const R = G.R, TS = 16;

  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // Room object types. Each factory returns an object that may have:
  // update(dt, room), draw(ctx, t) (y-sorted with players via sortY), drawBelow(ctx, t), solid {x,y,w,h}.
  // More types live in objects.js and quiz.js; milestones 5–6 add guards and the boss.
  G.ObjectTypes = {
    freud(def, room) {
      return {
        type: 'freud',
        x: def.x, y: def.y, sortY: def.y, dir: G.Sprites.DOWN,
        solid: { x: def.x - 7, y: def.y - 7, w: 14, h: 7 },
        update(dt) {
          // Freud turns to look at the nearest player.
          const p = room.players.reduce((a, b) => (Math.hypot(a.x - this.x, a.y - this.y) < Math.hypot(b.x - this.x, b.y - this.y) ? a : b));
          const dx = p.x - this.x, dy = p.y - this.y;
          this.dir = Math.abs(dx) > Math.abs(dy) * 1.5 ? (dx < 0 ? G.Sprites.LEFT : G.Sprites.RIGHT) : G.Sprites.DOWN;
        },
        draw(ctx, t) { G.Sprites.drawFreud(ctx, this.x, this.y, this.dir, 0, Math.floor(t / 0.7) % 2); },
      };
    },
    bridge(def, room) {
      const o = {
        type: 'bridge', id: def.id, tiles: def.tiles, built: false,
        build() { for (const [tx, ty] of this.tiles) room.setTile(tx, ty, '='); this.built = true; },
        // Plank by plank, with sound and sawdust.
        buildAnimated(done) {
          this.tiles.forEach(([tx, ty], i) => room.wait(0.15 * i, () => {
            room.setTile(tx, ty, '=');
            G.audio.play('build');
            room.burst(tx * TS + 8, ty * TS + 8, ['#b07a42', '#e0b070', '#ffffff'], 6, 40);
          }));
          room.wait(0.15 * this.tiles.length + 0.1, () => { this.built = true; if (done) done(); });
        },
      };
      if (def.built) o.build();
      return o;
    },
  };

  class RoomScene {
    constructor(id) {
      this.id = id;
      this.def = G.ROOMS[id];
      this.zone = this.def.zone;
      this.tiles = this.def.map.map((row) => row.split(''));
      this.state = {};
      this.gateBlocks = G.Tiles.findBlocks(this.tiles, 'G');
      this.vaultBlocks = G.Tiles.findBlocks(this.tiles, 'V');
      this.exits = this.def.exits.map((e) => ({ ...e, open: e.open !== false }));
      this.t = 0;
      this.leaving = false;
      this.timed = true;
      this.dirty = true;
      this.timers = [];
      this.tweens = [];
      this.fx = [];
      this.shakeT = 0;
      this.dialogue = new G.Dialogue();
      this.script = (G.ROOM_SCRIPTS && G.ROOM_SCRIPTS[id]) || {};
      G.Ego.reset();

      this.players = [new G.Player(1), new G.Player(2)];
      this.players[0].placeAtTile(...this.def.spawn.p1);
      this.players[1].placeAtTile(...this.def.spawn.p2);
      this.objects = (this.def.objects || [])
        .map((o) => (G.ObjectTypes[o.type] ? G.ObjectTypes[o.type](o, this) : null))
        .filter(Boolean);
      this.particles = makeDecor(this.zone);
      if (this.script.enter) this.script.enter(this);
    }

    // Players cannot move while a dialogue is open.
    get frozen() { return this.dialogue.active; }

    // ---------- helpers used by objects and room scripts ----------
    say(lines, done) { this.dialogue.start(lines, done); }
    wait(sec, fn) { this.timers.push({ t: sec, fn }); }
    tween(key, to, dur) { this.tweens.push({ key, from: this.state[key] || 0, to, dur, t: 0 }); }
    emit(name, data) { if (this.script.event) this.script.event(this, name, data); }
    find(type) { return this.objects.filter((o) => o.type === type && !o.dead); }
    openExits() { for (const e of this.exits) e.open = true; }
    shake(sec) { this.shakeT = Math.max(this.shakeT, sec); }
    burst(x, y, colors, n = 10, speed = 60) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
        this.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.4, life: 0.4 + Math.random() * 0.4,
          c: colors[i % colors.length], size: Math.random() < 0.4 ? 2 : 1 });
      }
    }

    setTile(tx, ty, ch) { this.tiles[ty][tx] = ch; this.dirty = true; }
    tileAt(tx, ty) {
      if (ty < 0 || ty >= this.tiles.length || tx < 0 || tx >= this.tiles[0].length) return '#';
      return this.tiles[ty][tx];
    }
    solidTile(tx, ty) { return G.Tiles.SOLID.has(this.tileAt(tx, ty)); }

    // Is a player's feet box at (x, y) blocked by the screen edge, a solid tile or a solid object?
    blocked(who, x, y) {
      const b = who.box(x, y);
      if (b.x < 0 || b.y < 0 || b.x + b.w > R.W || b.y + b.h > R.H) return true;
      const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w - 0.001) / TS);
      const y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + b.h - 0.001) / TS);
      for (let ty = y0; ty <= y1; ty++)
        for (let tx = x0; tx <= x1; tx++) if (this.solidTile(tx, ty)) return true;
      return !!this.solidObjectAt(who, x, y);
    }
    solidObjectAt(who, x, y) {
      const b = who.box(x, y);
      return this.objects.find((o) => o.solid && o !== who && !o.dead && overlap(b, o.solid));
    }

    // A player walked into something solid (used for pushing tablets).
    bump(who, dx, dy, x, y) {
      const o = this.solidObjectAt(who, x, y);
      if (o && o.onBump) o.onBump(who, dx, dy);
    }

    // Action key: use the object in front of the player (or the one they stand on).
    act(p) {
      const v = [[0, 1], [0, -1], [-1, 0], [1, 0]][p.dir];
      const pts = [[p.x + v[0] * 11, p.y - 3 + v[1] * 11], [p.x, p.y - 3]];
      for (const [px, py] of pts) {
        const o = this.objects.find((q) => q.onAction && q.hit && !q.dead &&
          px >= q.hit.x - 3 && px < q.hit.x + q.hit.w + 3 && py >= q.hit.y - 3 && py < q.hit.y + q.hit.h + 3);
        if (o) { o.onAction(p); return; }
      }
    }

    exitAt(p) {
      const fx = p.x, fy = p.y - 3;
      return this.exits.find((e) => e.open && fx >= e.x * TS && fx < (e.x + e.w) * TS && fy >= e.y * TS && fy < (e.y + e.h) * TS);
    }

    update(dt) {
      this.t += dt;
      this.shakeT = Math.max(0, this.shakeT - dt);
      G.Ego.update(dt);
      for (const tm of this.timers) if ((tm.t -= dt) <= 0) tm.fn();
      this.timers = this.timers.filter((tm) => tm.t > 0);
      for (const tw of this.tweens) {
        tw.t = Math.min(tw.dur, tw.t + dt);
        this.state[tw.key] = tw.from + (tw.to - tw.from) * (tw.t / tw.dur);
      }
      this.tweens = this.tweens.filter((tw) => tw.t < tw.dur);

      const talking = this.dialogue.update(dt); // consumes the action key while open
      for (const p of this.players) p.update(dt, this);
      if (!talking) for (const p of this.players) if (p.stun <= 0 && G.input.hit(p.idx, 'action')) this.act(p);
      for (const o of this.objects) if (o.update) o.update(dt, this);
      this.objects = this.objects.filter((o) => !o.dead);
      for (const q of this.particles) q.update(dt);
      for (const f of this.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 160 * dt; f.life -= dt; }
      this.fx = this.fx.filter((f) => f.life > 0);
      if (this.script.update) this.script.update(this, dt);

      if (!this.leaving && !this.frozen) {
        const [e1, e2] = this.players.map((p) => this.exitAt(p));
        if (e1 && e1 === e2) {
          this.leaving = true;
          G.audio.play('whoosh');
          G.next(e1.transition);
        } else {
          if (e1) this.players[0].say(G.CONTENT.hints.waitPartner, 0.3);
          if (e2) this.players[1].say(G.CONTENT.hints.waitPartner, 0.3);
        }
      }
    }

    draw(ctx) {
      const t = this.t;
      if (this.dirty) { this.static = G.Tiles.renderStatic(this); this.dirty = false; }
      R.rect(ctx, '#000', 0, 0, R.W, R.H);
      ctx.save();
      if (this.shakeT > 0) ctx.translate(Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 4));
      G.Tiles.drawWater(ctx, this, t);
      ctx.drawImage(this.static, 0, 0);
      G.Tiles.drawDynamic(ctx, this, t);
      for (const e of this.exits) if (e.open) drawExit(ctx, e, t);
      for (const o of this.objects) if (o.drawBelow) o.drawBelow(ctx, t);

      for (const p of this.players) p.drawBack(ctx);
      const sorted = [...this.players, ...this.objects.filter((o) => o.draw)];
      sorted.sort((a, b) => (a.sortY ?? a.y) - (b.sortY ?? b.y));
      for (const s of sorted) s.draw(ctx, t);

      for (const f of this.fx) R.rect(ctx, f.c, f.x, f.y, f.size, f.size);
      for (const q of this.particles) q.draw(ctx, t);
      for (const o of this.objects) if (o.drawAbove) o.drawAbove(ctx, t);
      if (this.def.dark) G.Deep.darkness(ctx, this, t);
      for (const p of this.players) p.drawTag(ctx);
      ctx.restore();

      G.UI.drawHUD(ctx, this, t);
      for (const o of this.objects) if (o.drawUI) o.drawUI(ctx, t);
      G.Ego.drawOverlay(ctx, t);
      this.dialogue.draw(ctx, this.zone !== 'study', this.players.some((p) => p.y > R.H - 72));
      if (G.game.debug) this.drawDebug(ctx);
    }

    drawDebug(ctx) {
      ctx.globalAlpha = 0.5;
      for (let ty = 0; ty < this.tiles.length; ty++)
        for (let tx = 0; tx < this.tiles[0].length; tx++)
          if (G.Tiles.SOLID.has(this.tiles[ty][tx])) {
            ctx.strokeStyle = '#ff3b3b';
            ctx.strokeRect(tx * TS + 0.5, ty * TS + 0.5, TS - 1, TS - 1);
          }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#3CC46B';
      for (const e of this.exits) ctx.strokeRect(e.x * TS + 0.5, e.y * TS + 0.5, e.w * TS - 1, e.h * TS - 1);
      ctx.strokeStyle = '#ff4fd8';
      for (const o of this.objects) if (o.solid) ctx.strokeRect(o.solid.x + 0.5, o.solid.y + 0.5, o.solid.w - 1, o.solid.h - 1);
      ctx.strokeStyle = '#ffff00';
      for (const p of this.players) { const b = p.box(); ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1); }
    }
  }

  function drawExit(ctx, e, t) {
    const x = e.x * TS, y = e.y * TS, w = e.w * TS, h = e.h * TS;
    if (e.style === 'hole') {
      const cx = x + w / 2, cy = y + h / 2;
      R.disc(ctx, '#e8fbff', cx, cy, w / 2, Math.max(4, h / 2 - 1));
      R.disc(ctx, '#0a1438', cx, cy + 1, w / 2 - 2, Math.max(3, h / 2 - 3));
      R.disc(ctx, '#03040c', cx, cy + 2, w / 2 - 6, Math.max(2, h / 2 - 5));
    } else if (e.style === 'arrow') {
      const bounce = Math.round(Math.sin(t * 5) * 2);
      const ax = e.dir === 'right' ? x + w - 12 + bounce : x + 4 - bounce;
      G.Font.draw(ctx, e.dir === 'right' ? '→' : '←', ax, y + h / 2 - 4, { color: '#ffd166', outline: '#141022' });
    }
  }

  // Ambient decoration particles per zone.
  function makeDecor(zone) {
    const list = [];
    const add = (n, make) => { for (let i = 0; i < n; i++) list.push(make(i)); };
    if (zone === 'forest') {
      add(7, (i) => ({ // glowing memory bubbles
        x: Math.random() * R.W, y: 40 + Math.random() * 220, r: 3 + (i % 3) * 2, s: 4 + Math.random() * 5, ph: Math.random() * 6,
        update(dt) { this.y -= this.s * dt; if (this.y < 28) { this.y = 270; this.x = Math.random() * R.W; } },
        draw(ctx, t) {
          const x = this.x + Math.sin(t + this.ph) * 6;
          ctx.globalAlpha = 0.35; R.disc(ctx, '#c9a7ff', x, this.y, this.r);
          ctx.globalAlpha = 0.8; R.ring(ctx, '#efe2ff', x, this.y, this.r);
          R.rect(ctx, '#ffffff', x - this.r / 2, this.y - this.r / 2, 1, 1);
          ctx.globalAlpha = 1;
        },
      }));
    } else if (zone === 'deep') {
      add(14, () => ({
        x: Math.random() * R.W, y: Math.random() * R.H, s: 8 + Math.random() * 14, ph: Math.random() * 6,
        update(dt) { this.y -= this.s * dt; if (this.y < 26) { this.y = R.H; this.x = Math.random() * R.W; } },
        draw(ctx, t) { ctx.globalAlpha = 0.6; R.rect(ctx, '#7ff6ff', this.x + Math.sin(t * 2 + this.ph) * 2, this.y, 1, 1); ctx.globalAlpha = 1; },
      }));
    } else if (zone === 'vault' || zone === 'surface') {
      add(zone === 'vault' ? 18 : 8, () => ({
        x: Math.random() * R.W, y: Math.random() * R.H, s: 6 + Math.random() * 8, ph: Math.random() * 6,
        update(dt) { this.y += this.s * dt; if (this.y > R.H) { this.y = 26; this.x = Math.random() * R.W; } },
        draw(ctx, t) { ctx.globalAlpha = 0.7; R.rect(ctx, '#ffffff', this.x + Math.sin(t + this.ph) * 4, this.y, 1, 1); ctx.globalAlpha = 1; },
      }));
    }
    return list;
  }

  G.RoomScene = RoomScene;
})();
