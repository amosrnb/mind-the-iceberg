// Boss: THE REPRESSOR in front of the Repression Vault (§5 room 7).
// Each of the 3 locks: CHARGE (both plates + balanced Ego for 4 s while dodging forget-fog) → QUESTION (agreement tiles).
// After the third lock the Repressor shatters, the vault opens and white light fills the screen.
(function () {
  const G = window.G;
  const R = G.R, F = G.Font;
  const CHARGE = 4;

  G.ObjectTypes.boss = (def, room) => {
    const C = G.CONTENT.boss;
    const eye = () => ({ x: def.x, y: def.y - 49 });

    const b = {
      type: 'boss', x: def.x, y: def.y, phase: 'intro', phaseT: 0, lock: 0, charge: 0, fireT: 1.2,
      shots: [], hurtT: 0, gone: false, status: '',
      solid: { x: def.x - 26, y: def.y - 12, w: 52, h: 12 },
      get quiz() { return room.find('quiz')[0]; },

      setPhase(p) { this.phase = p; this.phaseT = 0; },

      update(dt) {
        this.phaseT += dt;
        this.hurtT = Math.max(0, this.hurtT - dt);
        for (const p of room.players) p.hitT = Math.max(0, (p.hitT || 0) - dt);
        this.updateShots(dt);
        if (room.frozen) return;
        if (this.phase === 'charge') this.updateCharge(dt);
        else if (this.phase === 'break' && this.phaseT > 1.2 && !this.quiz.feedback) {
          if (this.lock >= 3) this.shatter(); else this.setPhase('charge');
        } else if (this.phase === 'shatter') this.updateShatter(dt);
      },

      updateCharge(dt) {
        const both = room.find('plate').every((p) => p.pressed);
        const ok = both && G.Ego.balanced() && G.Ego.attack <= 0;
        this.status = !both ? C.needPlates : !G.Ego.balanced() ? C.needBalance : C.charging;
        if (ok) this.charge += dt;
        if (this.charge >= CHARGE) {
          this.charge = 0;
          for (const s of this.shots) s.fading = true;
          this.setPhase('question');
          this.quiz.active = true;
          G.audio.play('door');
          const q = this.quiz.questions[this.quiz.qi];
          if (q && q.before) room.say(q.before);
          return;
        }
        if ((this.fireT -= dt) <= 0) { this.fire(); this.fireT = 2.4 - this.lock * 0.3; }
      },

      // A fan of slow fog orbs aimed at one of the players; 3, 4, then 5 per volley.
      fire() {
        const e = eye(), target = room.players[Math.floor(Math.random() * 2)];
        const n = 3 + this.lock, base = Math.atan2(target.y - 10 - e.y, target.x - e.x);
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.24;
          this.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 48, vy: Math.sin(a) * 48, ph: Math.random() * 6, alpha: 1 });
        }
        G.audio.play('fog');
      },

      updateShots(dt) {
        for (const s of this.shots) {
          s.x += s.vx * dt; s.y += s.vy * dt;
          if (s.fading) { s.alpha -= dt * 2; continue; }
          for (const p of room.players) {
            if (p.hitT > 0 || Math.hypot(p.x - s.x, p.y - 10 - s.y) > 10) continue;
            s.alpha = 0;
            p.hitT = 1;
            p.stun = Math.max(p.stun, 0.3);
            G.Ego.add(room, p.role === 'id' ? -20 : 20);
            const d = Math.hypot(s.vx, s.vy) || 1;
            p.moveAxis(room, (s.vx / d) * 14, 0, false);
            p.moveAxis(room, 0, (s.vy / d) * 14, false);
            room.burst(s.x, s.y, ['#8a8f9e', '#c9ced8', '#ffffff'], 8, 40);
            G.audio.play('hit');
            break;
          }
        }
        this.shots = this.shots.filter((s) => s.alpha > 0 && s.x > -10 && s.x < R.W + 10 && s.y > 20 && s.y < R.H + 10);
      },

      // Called by the room script after a correct answer: a chain breaks and the Repressor cracks.
      lockOpened() {
        this.quiz.active = false;
        this.lock++;
        room.state.locksOpen = this.lock;
        this.hurtT = 0.6;
        G.audio.play('smash');
        room.shake(0.5);
        const c = this.chainEnd(this.lock - 1);
        room.burst(c.x, c.y, ['#7a86a3', '#c9a24a', '#ffffff'], 18, 80);
        this.setPhase('break');
      },

      shatter() {
        this.setPhase('shatter');
        this.gone = true;
        this.solid = null;
        G.audio.play('shatter');
        room.shake(1.2);
        for (let i = 0; i < 4; i++) room.burst(this.x + (i - 1.5) * 12, this.y - 30, ['#d3deec', '#93a7c2', '#6d7f9c', '#ffffff'], 18, 110);
        room.tween('vaultOpen', 1, 1.5);
        room.wait(1.4, () => room.tween('light', 1, 2.5));
      },

      updateShatter() {
        if (!this.left && (room.state.light || 0) >= 1) { this.left = true; G.next(); }
      },

      chainEnd(i) {
        return [{ x: def.x - 120, y: def.y - 40 }, { x: def.x + 120, y: def.y - 40 }, { x: def.x, y: def.y - 98 }][i];
      },

      draw(ctx, t) {
        if (this.gone) return;
        const x = this.x, y = this.y + Math.round(Math.sin(t * 1.2)), o = '#26304a';
        const flash = this.hurtT > 0 && Math.floor(this.hurtT * 12) % 2;
        const ice = flash ? '#ffffff' : '#93a7c2', hi = flash ? '#ffffff' : '#d3deec', lo = '#6d7f9c';
        // chains: left wrist, right wrist, neck → walls / vault
        const starts = [{ x: x - 30, y: y - 26 }, { x: x + 30, y: y - 26 }, { x, y: y - 58 }];
        starts.forEach((s, i) => {
          if (i < this.lock) return;
          const e = this.chainEnd(i);
          for (let k = 0; k <= 1; k += 0.08) {
            const qx = s.x + (e.x - s.x) * k, qy = s.y + (e.y - s.y) * k + Math.sin(k * Math.PI) * 6;
            R.rect(ctx, '#1a1f30', qx - 2, qy - 1, 4, 3);
            R.rect(ctx, '#7a86a3', qx - 1, qy, 2, 1);
          }
        });
        R.disc(ctx, 'rgba(10,14,30,0.35)', x, this.y, 28, 5);
        // legs
        for (const lx of [x - 20, x + 8]) { R.rect(ctx, o, lx - 1, y - 15, 14, 15); R.rect(ctx, lo, lx, y - 14, 12, 13); }
        // arms
        for (const ax of [x - 35, x + 24]) { R.rect(ctx, o, ax - 1, y - 39, 13, 27); R.rect(ctx, ice, ax, y - 38, 11, 25); R.rect(ctx, lo, ax, y - 18, 11, 5); }
        // torso of ice blocks
        R.rect(ctx, o, x - 25, y - 41, 50, 30);
        R.rect(ctx, ice, x - 24, y - 40, 48, 28);
        R.rect(ctx, hi, x - 24, y - 40, 48, 3);
        R.rect(ctx, lo, x - 24, y - 26, 48, 1); R.rect(ctx, lo, x - 2, y - 40, 1, 14); R.rect(ctx, lo, x - 12, y - 26, 1, 14); R.rect(ctx, lo, x + 12, y - 26, 1, 14);
        // head with the keyhole eye
        R.rect(ctx, o, x - 15, y - 59, 30, 20);
        R.rect(ctx, ice, x - 14, y - 58, 28, 18);
        R.rect(ctx, hi, x - 14, y - 58, 28, 2);
        const glow = 0.6 + 0.4 * Math.sin(t * 5);
        ctx.globalAlpha = 0.35 * glow; R.disc(ctx, '#ff3030', x, y - 50, 9); ctx.globalAlpha = 1;
        R.disc(ctx, '#1a1f30', x, y - 50, 5);
        R.disc(ctx, R.mix('#7a1010', '#ff3030', glow), x, y - 51, 2);
        R.rect(ctx, R.mix('#7a1010', '#ff3030', glow), x - 1, y - 50, 3, 5);
        // cracks: one more per opened lock
        const cracks = [
          [[x - 18, y - 36], [x - 14, y - 30], [x - 17, y - 24], [x - 12, y - 16]],
          [[x + 8, y - 57], [x + 5, y - 50], [x + 9, y - 44], [x + 6, y - 38]],
          [[x + 20, y - 38], [x + 14, y - 32], [x + 18, y - 25], [x + 10, y - 18]],
        ];
        for (let i = 0; i < this.lock; i++)
          for (let k = 1; k < cracks[i].length; k++) {
            const [ax, ay] = cracks[i][k - 1], [bx, by] = cracks[i][k];
            for (let s = 0; s <= 1; s += 0.2) R.rect(ctx, '#1a1f30', ax + (bx - ax) * s, ay + (by - ay) * s, 1, 1);
          }
      },

      drawAbove(ctx, t) {
        for (const s of this.shots) {
          const w = Math.round(Math.sin(t * 8 + s.ph));
          ctx.globalAlpha = 0.85 * Math.max(0, s.alpha);
          R.disc(ctx, '#5a5f70', s.x, s.y, 6 + w, 6 - w);
          R.disc(ctx, '#a9aebb', s.x, s.y - 1, 4, 3);
          R.rect(ctx, '#e6e9f0', s.x - 2, s.y - 3, 2, 1);
          ctx.globalAlpha = 1;
        }
        // light pouring out of the opening vault
        const open = room.state.vaultOpen || 0;
        if (open > 0) {
          ctx.globalAlpha = Math.min(1, open);
          R.disc(ctx, '#fffbe8', 240, 58, Math.round(6 + open * 26));
          ctx.globalAlpha = 0.4 * open;
          R.disc(ctx, '#ffffff', 240, 58, Math.round(10 + open * 60));
          ctx.globalAlpha = 1;
        }
      },

      drawUI(ctx) {
        if (this.phase === 'charge') {
          const w = 320, x = (R.W - w) / 2, y = R.H - 40;
          R.panel(ctx, x, y, w, 34, '#1c2340', '#eaf2ff');
          F.draw(ctx, `${C.title} ${this.lock + 1}/3`, x + 8, y + 5, { color: '#ffd166' });
          F.draw(ctx, this.status, x + w - 8, y + 5, { align: 'right', color: this.status === C.charging ? '#3CC46B' : '#ffb15a' });
          R.rect(ctx, '#0b0e1c', x + 8, y + 18, w - 16, 9);
          R.rect(ctx, '#3CC46B', x + 9, y + 19, Math.round((w - 18) * (this.charge / CHARGE)), 7);
          R.rect(ctx, 'rgba(255,255,255,0.3)', x + 9, y + 19, Math.round((w - 18) * (this.charge / CHARGE)), 2);
        }
        const light = room.state.light || 0;
        if (light > 0) { ctx.globalAlpha = Math.min(1, light); R.rect(ctx, '#ffffff', 0, 0, R.W, R.H); ctx.globalAlpha = 1; }
      },
    };
    return b;
  };
})();
