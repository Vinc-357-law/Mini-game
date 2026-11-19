// Âm thanh: hiệu ứng chuông + nhạc nền kiểu hộp nhạc, tạo bằng Web Audio.
// Nếu có file assets/audio/bgm.mp3 thì nhạc nền ưu tiên dùng file đó.

let ctx = null;
let bus, musicGain, sfxGain;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    // Tiếng vang nhẹ cho ấm
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.31;
    const fb = ctx.createGain(); fb.gain.value = 0.26;
    const wet = ctx.createGain(); wet.gain.value = 0.32;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);

    bus = ctx.createGain(); bus.connect(master); bus.connect(delay);
    musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(bus);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(bus);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const BELL = [[1, 1], [2, 0.32], [3.01, 0.12], [4.2, 0.05]];
const BOX = [[1, 1], [2, 0.22], [4, 0.06]];

function tone(dest, freq, t, { dur = 1.6, vol = 0.3, partials = BELL, attack = 0.006 } = {}) {
  partials.forEach(([m, a]) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq * m;
    const g = ctx.createGain();
    const d = dur / (0.5 + m * 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol * a, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + d + 0.05);
  });
}

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function freqOf(n) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  if (!m) return 0;
  const midi = 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const sfx = {
  tick(high = false) {
    if (!ensure()) return;
    tone(sfxGain, high ? 1318.5 : 880, ctx.currentTime, { dur: 1.2, vol: 0.28 });
  },
  shutter() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(sfxGain, 1568, t, { dur: 0.9, vol: 0.22 });
    tone(sfxGain, 2093, t + 0.09, { dur: 1.2, vol: 0.18 });
  },
  ting() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(sfxGain, 1975.5, t, { dur: 2.6, vol: 0.34 });
    tone(sfxGain, 2637, t + 0.01, { dur: 2.0, vol: 0.12 });
  },
  sparkle() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    ['E6', 'G6', 'B6', 'E7'].forEach((n, i) => tone(sfxGain, freqOf(n), t + i * 0.07, { dur: 0.8, vol: 0.09 }));
  },
  pick() {
    if (!ensure()) return;
    tone(sfxGain, 1046.5, ctx.currentTime, { dur: 0.35, vol: 0.1, partials: BOX });
  },
  drop() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(sfxGain, 392, t, { dur: 0.6, vol: 0.18, partials: BOX });
    tone(sfxGain, 784, t + 0.05, { dur: 0.6, vol: 0.08, partials: BOX });
  },
  bloom() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) =>
      tone(sfxGain, freqOf(n), t + i * 0.13, { dur: 2.4, vol: 0.13 }));
  },
  bake() {
    // tiếng "rè rè" rất nhỏ khi lò nóng: một hợp âm trầm ấm
    if (!ensure()) return;
    const t = ctx.currentTime;
    ['C4', 'G4', 'E5'].forEach((n, i) => tone(sfxGain, freqOf(n), t + i * 0.18, { dur: 2.2, vol: 0.08, partials: BOX }));
  },
};

// ---------- Nhạc nền ----------
// Giai điệu dân gian / hết bản quyền: Jingle Bells (điệp khúc), Silent Night.
const JINGLE = {
  beat: 0.36, shift: 0,
  notes: [
    ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
    ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5], ['E5', 1], ['D5', 1], ['D5', 1], ['E5', 1], ['D5', 2], ['G5', 2],
    ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
    ['F5', 1], ['F5', 1], ['F5', 1], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5], ['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1], ['C5', 4],
  ],
};
const SILENT = {
  beat: 0.27, shift: 12,
  notes: [
    ['G4', 3], ['A4', 1], ['G4', 2], ['E4', 6], ['G4', 3], ['A4', 1], ['G4', 2], ['E4', 6],
    ['D5', 4], ['D5', 2], ['B4', 6], ['C5', 4], ['C5', 2], ['G4', 6],
    ['A4', 4], ['A4', 2], ['C5', 3], ['B4', 1], ['A4', 2], ['G4', 3], ['A4', 1], ['G4', 2], ['E4', 6],
    ['A4', 4], ['A4', 2], ['C5', 3], ['B4', 1], ['A4', 2], ['G4', 3], ['A4', 1], ['G4', 2], ['E4', 6],
    ['D5', 4], ['D5', 2], ['F5', 3], ['D5', 1], ['B4', 2], ['C5', 6], ['E5', 6],
    ['C5', 3], ['G4', 1], ['E4', 2], ['G4', 3], ['F4', 1], ['D4', 2], ['C4', 12],
  ],
};
const SONGS = [SILENT, JINGLE];

let playing = false;
let timer = null;
let songIdx = 0, noteIdx = 0, nextTime = 0;
let mp3 = null;          // HTMLAudioElement nếu có file riêng
let mp3Checked = false;

function scheduler() {
  while (nextTime < ctx.currentTime + 0.5) {
    const song = SONGS[songIdx];
    const [n, beats] = song.notes[noteIdx];
    const f = freqOf(n) * Math.pow(2, song.shift / 12);
    tone(musicGain, f, nextTime, { dur: 1.8, vol: 0.16, partials: BOX });
    nextTime += beats * song.beat;
    noteIdx++;
    if (noteIdx >= song.notes.length) {
      noteIdx = 0;
      songIdx = (songIdx + 1) % SONGS.length;
      nextTime += 2.4; // nghỉ giữa hai bài
    }
  }
}

async function checkMp3() {
  if (mp3Checked) return;
  mp3Checked = true;
  // Thử nạp file nhạc riêng (chạy được cả khi mở bằng file://). Không có file → dùng hộp nhạc.
  const a = new Audio();
  const ok = await new Promise((resolve) => {
    const t = setTimeout(() => resolve(false), 2500);
    a.addEventListener('canplay', () => { clearTimeout(t); resolve(true); }, { once: true });
    a.addEventListener('error', () => { clearTimeout(t); resolve(false); }, { once: true });
    a.preload = 'auto';
    a.src = 'assets/audio/bgm.mp3';
  });
  if (ok) {
    a.loop = true;
    a.volume = 0.35;
    mp3 = a;
  }
}

export async function startMusic() {
  if (playing) return;
  playing = true;
  if (!ensure()) return;
  await checkMp3();
  if (!playing) return;
  if (mp3) {
    try { await mp3.play(); } catch { /* cần thao tác người dùng */ }
    return;
  }
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5);
  nextTime = ctx.currentTime + 0.2;
  clearInterval(timer);
  timer = setInterval(scheduler, 120);
  scheduler();
}

export function stopMusic() {
  if (!playing) return;
  playing = false;
  if (mp3) { mp3.pause(); return; }
  if (!ctx) return;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => { if (!playing) clearInterval(timer); }, 900);
}

export const isPlaying = () => playing;
export function unlock() { ensure(); }
