// Room logic: what happens when a room starts and how it reacts to events from its objects.
// Hooks: enter(room), update(room, dt), event(room, name, data). All texts come from content.js.
(function () {
  const G = window.G;
  const C = G.CONTENT;

  G.ROOM_SCRIPTS = {
    study: {
      enter(room) { room.wait(0.6, () => room.say(C.study.freud, () => room.openExits())); },
    },

    surface: {
      enter(room) { room.wait(0.5, () => room.say(C.surface.intro)); },
      event(room, name) {
        if (name === 'smash' && room.find('crate').length === 0) room.wait(0.6, () => room.say(C.surface.superego));
        if (name === 'read') for (const b of room.find('blueprint')) b.active = true;
        if (name === 'built') room.wait(0.3, () => room.say(C.surface.done, () => room.openExits()));
      },
    },

    egogate: {
      enter(room) {
        G.game.ego = C.egogate.startEgo;
        room.wait(0.5, () => room.say(C.egogate.intro));
      },
      update(room) {
        const s = room.state;
        if (s.balanced || room.frozen || G.Ego.attack > 0 || !G.Ego.balanced()) return;
        // Balanced: the ice cracks, the gate opens partly and the quiz starts.
        s.balanced = true;
        G.audio.play('door');
        room.shake(0.25);
        room.tween('gateOpen', 0.35, 0.8);
        room.wait(0.8, () => room.say(C.egogate.quizStart, () => room.find('quiz')[0].start()));
      },
      event(room, name) {
        if (name !== 'quizDone') return;
        G.audio.play('door');
        room.tween('gateOpen', 1, 1.2);
        room.wait(1.2, () => room.openExits());
      },
    },

    stages: {
      enter(room) { room.wait(0.5, () => room.say(C.stages.intro)); },
      event(room, name) {
        if (name !== 'placed' || room.find('pedestal').some((p) => !p.filled)) return;
        // All five stages in order: the trees at the exit part.
        room.wait(0.5, () => {
          for (const ty of [8, 9, 10]) {
            room.setTile(29, ty, '.');
            room.burst(29 * 16 + 8, ty * 16 + 4, ['#ffffff', '#d0e2d7', '#2f6b4a'], 10, 50);
          }
          G.audio.play('door');
          room.openExits();
          room.say(C.stages.done);
        });
      },
    },

    grove: {
      enter(room) {
        room.wait(0.5, () => room.say(C.grove.intro, () => room.find('quiz')[0].start()));
      },
      event(room, name) {
        if (name !== 'quizDone') return;
        // The memory adults fade, the memory bubble opens, Freud explains, then the floor cracks.
        room.state.ghostsGone = true;
        room.wait(1.2, () => {
          G.audio.play('whoosh');
          room.tween('memory', 1, 1.2);
          room.wait(1.6, () => room.say(C.grove.memory, () => {
            room.tween('memory', 0, 0.8);
            G.audio.play('smash');
            room.shake(0.6);
            room.burst(240, 192, ['#ffffff', '#d0e2d7', '#1a2a3a'], 24, 90);
            room.openExits();
          }));
        });
      },
    },

    dream: {
      enter(room) { room.wait(0.5, () => room.say(C.dream.intro)); },
      event(room, name, k) {
        if (name !== 'matched') return;
        // one bridge part (a column of planks) per matched pair
        room.wait(0.3, () => {
          for (const ty of [9, 10]) {
            room.setTile(13 + k, ty, '=');
            room.burst((13 + k) * 16 + 8, ty * 16 + 8, ['#46c9d8', '#3ff0e8', '#ffffff'], 8, 40);
          }
          G.audio.play('build');
          if (k === 2) room.wait(0.8, () => room.say(C.dream.done, () => room.openExits()));
        });
      },
    },

    vault: {
      enter(room) {
        room.wait(0.6, () => room.say(C.boss.intro, () => room.find('boss')[0].setPhase('charge')));
      },
      event(room, name) {
        if (name === 'quizRight') room.find('boss')[0].lockOpened();
      },
    },

    guards: {
      enter(room) { room.wait(0.5, () => room.say(C.guards.intro, () => room.find('quiz')[0].start())); },
      event(room, name, data) {
        if (name === 'quizRight') {
          const q = C.guards.quiz[data.index];
          const label = C.guards.options[q.answer];
          const g = room.find('guard').find((o) => o.id === label);
          if (g) g.dissolve();
        }
        if (name === 'quizDone') {
          G.audio.play('door');
          room.tween('gateOpen', 1, 1.5);
          room.wait(1.5, () => room.openExits());
        }
      },
    },
  };
})();
