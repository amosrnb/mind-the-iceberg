// A player character: Player 1 = the ID (fast), Player 2 = the SUPEREGO.
(function () {
  const G = window.G;
  const S = G.Sprites;
  const BASE_SPEED = 78; // px per second

  class Player {
    constructor(idx) {
      this.idx = idx;
      this.role = idx === 1 ? 'id' : 'superego';
      this.speed = BASE_SPEED * (idx === 1 ? 1.25 : 1.0);
      this.x = 0; this.y = 0;            // feet position
      this.dir = S.DOWN;
      this.moving = false;
      this.animT = 0;
      this.t = Math.random() * 3;
      this.stun = 0;
      this.bubble = null;                // { text, time }
    }

    get look() { return G.game.looks[this.idx - 1]; }
    get name() { return G.game.names[this.idx - 1]; }

    placeAtTile(tx, ty) { this.x = tx * 16 + 8; this.y = ty * 16 + 14; }

    // Collision box at the feet (10 x 6 px).
    box(x = this.x, y = this.y) { return { x: x - 5, y: y - 6, w: 10, h: 6 }; }

    say(text, time = 1.2) { this.bubble = { text, time }; }

    update(dt, room) {
      this.t += dt;
      if (this.bubble && (this.bubble.time -= dt) <= 0) this.bubble = null;
      if (this.stun > 0) { this.stun -= dt; this.moving = false; return; }
      if (room.frozen) { this.moving = false; return; }

      const a = G.input.axis(this.idx);
      let dx = a.x, dy = a.y;
      if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
      this.moving = !!(dx || dy);
      if (!this.moving) { this.animT = 0; this.stepT = 0; return; }
      if ((this.stepT = (this.stepT || 0) - dt) <= 0) { this.stepT = this.idx === 1 ? 0.24 : 0.3; G.audio.play('step'); }

      // Facing: keep the current direction while moving diagonally if it still matches.
      const horiz = dx < 0 ? S.LEFT : dx > 0 ? S.RIGHT : -1;
      const vert = dy < 0 ? S.UP : dy > 0 ? S.DOWN : -1;
      if (this.dir !== horiz && this.dir !== vert) this.dir = horiz >= 0 ? horiz : vert;

      const sp = this.speed * dt;
      this.moveAxis(room, dx * sp, 0, !a.y);
      this.moveAxis(room, 0, dy * sp, !a.x);
      this.animT += dt;
    }

    // Move along one axis in <=1px steps; when blocked, gently slide around corners.
    moveAxis(room, mx, my, canNudge) {
      const steps = Math.ceil(Math.abs(mx) + Math.abs(my));
      if (!steps) return;
      const sx = mx / steps, sy = my / steps;
      for (let i = 0; i < steps; i++) {
        if (!room.blocked(this, this.x + sx, this.y + sy)) { this.x += sx; this.y += sy; continue; }
        room.bump(this, Math.sign(sx), Math.sign(sy), this.x + sx, this.y + sy);
        if (canNudge) this.nudge(room, sx, sy);
        break;
      }
    }

    nudge(room, sx, sy) {
      for (let k = 1; k <= 6; k++)
        for (const s of [-1, 1]) {
          const ox = sy ? s * k : 0, oy = sx ? s * k : 0;
          if (room.blocked(this, this.x + ox, this.y + oy)) continue;
          if (room.blocked(this, this.x + ox + sx, this.y + oy + sy)) continue;
          const px = this.x + (sy ? s * 0.75 : 0), py = this.y + (sx ? s * 0.75 : 0);
          if (!room.blocked(this, px, py)) { this.x = px; this.y = py; }
          return;
        }
    }

    get frame() { return this.moving ? Math.floor(this.animT / 0.13) % 4 : 0; }
    get bob() { return this.moving ? 0 : Math.floor(this.t / 0.6) % 2; }

    drawBack(ctx) { S.auraBack(ctx, this.role, this.x, this.y, this.t); }
    draw(ctx) {
      const flash = this.stun > 0 && Math.floor(this.stun * 10) % 2;
      if (flash) ctx.globalAlpha = 0.5;
      S.drawCharacter(ctx, this.x, this.y, this.look, this.dir, this.frame, this.bob);
      ctx.globalAlpha = 1;
      S.auraFront(ctx, this.role, this.x, this.y, this.t);
    }
    drawTag(ctx) {
      S.tag(ctx, this.role, this.x, this.y);
      if (this.bubble) G.UI.bubble(ctx, this.bubble.text, this.x, this.y - 44);
    }
  }

  G.Player = Player;
})();
