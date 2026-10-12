// Tiny chiptune sound effects with WebAudio. M toggles mute.
(function () {
  const G = window.G;
  let ac = null, master = null, muted = false;

  function unlock() {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain();
        master.gain.value = 0.18;
        master.connect(ac.destination);
      } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume();
  }

  function tone(freq, dur, type = 'square', vol = 0.5, slideTo = null, delay = 0) {
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol = 0.5, delay = 0) {
    const t = ac.currentTime + delay;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g); g.connect(master);
    s.start(t);
  }

  const SFX = {
    blip: () => tone(880, 0.04, 'square', 0.25),
    select: () => { tone(660, 0.05, 'square', 0.3); tone(990, 0.06, 'square', 0.3, null, 0.05); },
    chime: () => { tone(784, 0.15, 'triangle', 0.6); tone(1175, 0.25, 'triangle', 0.6, null, 0.1); },
    buzz: () => tone(140, 0.3, 'sawtooth', 0.4, 70),
    smash: () => { noise(0.25, 0.7); tone(200, 0.15, 'square', 0.3, 60); },
    build: () => { tone(330, 0.06, 'square', 0.3); tone(440, 0.06, 'square', 0.3, null, 0.07); },
    door: () => { tone(110, 0.5, 'triangle', 0.6, 220); noise(0.3, 0.2); },
    whoosh: () => { noise(0.35, 0.25); tone(600, 0.35, 'sine', 0.2, 150); },
    type: () => tone(520, 0.025, 'square', 0.12),
    knock: () => { noise(0.06, 0.6); tone(90, 0.08, 'square', 0.4, 60); },
    stamp: () => { noise(0.1, 0.5); tone(160, 0.12, 'square', 0.35, 80); },
    step: () => { noise(0.035, 0.07); tone(110, 0.03, 'triangle', 0.08); },
    push: () => { tone(90, 0.12, 'square', 0.35, 60); noise(0.08, 0.15); },
    anxiety: () => { tone(220, 0.5, 'sawtooth', 0.4, 55); tone(233, 0.5, 'sawtooth', 0.3, 58); },
    fog: () => tone(180, 0.35, 'sine', 0.3, 90),
    hit: () => { noise(0.15, 0.4); tone(300, 0.15, 'square', 0.25, 120); },
    shatter: () => { noise(0.8, 0.8); tone(400, 0.8, 'triangle', 0.4, 60); tone(1200, 0.5, 'triangle', 0.3, 2400, 0.3); },
    pickup: () => { tone(988, 0.06, 'square', 0.3); tone(1319, 0.1, 'square', 0.3, null, 0.06); },
  };

  // ---------- quiet looping background music (one short tune per zone) ----------
  // Notes are MIDI numbers per eighth note, 0 = rest. Original little tunes, written for this game.
  const TRACKS = {
    title:   { bpm: 92,  wave: 'triangle', mel: [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 74, 0], bass: [48, 0, 0, 0, 53, 0, 0, 0, 48, 0, 0, 0, 55, 0, 0, 0] },
    study:   { bpm: 120, wave: 'triangle', mel: [67, 71, 74, 72, 71, 69, 67, 71, 74, 76, 74, 72, 71, 67, 69, 0, 66, 69, 72, 71, 69, 67, 66, 69, 72, 74, 72, 71, 67, 0, 0, 0], bass: [43, 0, 0, 50, 0, 0, 43, 0, 0, 48, 0, 0, 43, 0, 0, 0, 38, 0, 0, 50, 0, 0, 38, 0, 0, 50, 0, 0, 43, 0, 0, 0] },
    surface: { bpm: 112, wave: 'square',   mel: [72, 74, 76, 79, 76, 74, 72, 0, 74, 76, 77, 81, 79, 77, 76, 0, 76, 79, 84, 81, 79, 76, 74, 0, 72, 74, 76, 74, 72, 0, 0, 0], bass: [48, 0, 55, 0, 48, 0, 55, 0, 43, 0, 50, 0, 43, 0, 50, 0, 45, 0, 52, 0, 45, 0, 52, 0, 41, 0, 48, 0, 43, 0, 47, 0] },
    forest:  { bpm: 84,  wave: 'triangle', mel: [69, 72, 76, 72, 71, 74, 77, 74, 69, 72, 76, 79, 77, 76, 74, 71], bass: [45, 0, 0, 0, 50, 0, 0, 0, 45, 0, 0, 0, 52, 0, 0, 0] },
    deep:    { bpm: 70,  wave: 'sine',     mel: [57, 0, 60, 0, 64, 0, 63, 0, 57, 0, 60, 0, 62, 0, 58, 0], bass: [33, 0, 0, 0, 0, 0, 0, 0, 34, 0, 0, 0, 0, 0, 0, 0] },
    vault:   { bpm: 132, wave: 'square',   mel: [81, 0, 0, 0, 80, 0, 0, 0, 81, 0, 0, 0, 84, 0, 83, 0], bass: [45, 45, 48, 45, 51, 50, 48, 46, 45, 45, 48, 45, 51, 50, 48, 46] },
    intro:   { bpm: 76,  wave: 'triangle', mel: [69, 0, 72, 71, 69, 0, 64, 0, 65, 0, 69, 67, 65, 64, 62, 0], bass: [45, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0, 40, 0, 0, 0] },
    ending:  { bpm: 96,  wave: 'triangle', mel: [72, 76, 79, 84, 79, 76, 72, 0, 74, 77, 81, 86, 84, 81, 79, 0], bass: [48, 0, 0, 0, 53, 0, 0, 0, 50, 0, 0, 0, 55, 0, 0, 0] },
  };
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  let musicBus = null, track = null, stepN = 0, nextT = 0, musicMuted = false;
  let musicVol = 0.5; // 0..1; 0.5 is the original loudness
  try { const v = parseFloat(localStorage.getItem('mti.musicVolume')); if (v >= 0 && v <= 1) musicVol = v; } catch (e) { /* no storage */ }
  const musicGain = () => (musicMuted ? 0 : musicVol * 0.7);

  function note(n, t, dur, type, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(midi(n), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function schedule() {
    if (!ac || !track || muted || musicMuted || ac.state !== 'running') return;
    if (!musicBus) { musicBus = ac.createGain(); musicBus.gain.value = musicGain(); musicBus.connect(master); }
    const T = TRACKS[track], len = 60 / T.bpm / 2;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05; // after a mute or a hidden tab: don't catch up
    while (nextT < ac.currentTime + 0.25) {
      const i = stepN % T.mel.length;
      if (T.mel[i]) note(T.mel[i], nextT, len * 0.9, T.wave, T.wave === 'square' ? 0.12 : 0.22);
      if (T.bass[i % T.bass.length]) note(T.bass[i % T.bass.length], nextT, len * 1.8, 'triangle', 0.25);
      nextT += len;
      stepN++;
    }
  }
  setInterval(schedule, 60);

  G.audio = {
    unlock,
    play(name) {
      if (muted || !ac || !SFX[name]) return;
      try { SFX[name](); } catch (e) { /* ignore audio errors */ }
    },
    // Switch the background tune (null = silence). Keeps playing if it is already the current tune.
    music(name) {
      if (name === track) return;
      track = TRACKS[name] ? name : null;
      stepN = 0;
      nextT = 0;
    },
    toggleMute() { muted = !muted; return muted; },
    toggleMusic() {
      musicMuted = !musicMuted;
      if (musicBus) musicBus.gain.value = musicGain(); // also silences notes that are already scheduled
      return musicMuted;
    },
    get musicMuted() { return musicMuted; },
    get musicVolume() { return musicVol; },
    setMusicVolume(v) {
      musicVol = Math.max(0, Math.min(1, Math.round(v * 20) / 20));
      if (musicBus) musicBus.gain.value = musicGain();
      try { localStorage.setItem('mti.musicVolume', String(musicVol)); } catch (e) { /* no storage */ }
    },
    get muted() { return muted; },
  };
})();
