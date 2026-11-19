// TỰ ĐỘNG TẠO bởi tools/build.mjs — đừng sửa trực tiếp file này.
// Sửa các file trong js/ rồi chạy:  node tools/build.mjs
(() => {
'use strict';
const __m = {};
// ===== js/storage.js =====
__m['storage'] = (() => {
// Lưu & đọc dữ liệu trong localStorage (cài đặt + tiến độ các game).
// Thẻ ước mơ (ảnh) lưu riêng trong IndexedDB (xem db.js) vì dung lượng lớn.

const KEY = 'thoinoi-xmas.v1';

const SAMPLE_GUESTS = [
  'Ông bà nội | Bàn 1', 'Ông bà ngoại | Bàn 1', 'Bác Tâm | Bàn 2', 'Cô Hạnh | Bàn 2',
  'Chú Hùng | Bàn 3', 'Dì Mai | Bàn 3', 'Anh Khoa | Bàn 4', 'Chị Thảo | Bàn 4',
  'Cậu Long | Bàn 5', 'Mợ Lan | Bàn 5', 'Gia đình bé Bin | Bàn 6', 'Gia đình bé Bống | Bàn 6',
  'Anh Tuấn | Bàn 7', 'Chị Ngọc | Bàn 7', 'Chú Phát | Bàn 8', 'Cô Vy | Bàn 8',
];

const SAMPLE = {
  babyName: 'Na',
  careers: [
    'Bác sĩ | 🩺', 'Phi hành gia | 🚀', 'Đầu bếp | 🍳', 'Lính cứu hỏa | 🚒',
    'Họa sĩ | 🎨', 'Ca sĩ | 🎤', 'Cảnh sát | 👮', 'Giáo viên | 📚',
  ].join('\n'),
  kids: [
    'Bin | trai', 'Bống | gái', 'Cà Rốt | trai', 'Su Su | gái', 'Mít | trai', 'Gạo | gái',
    'Tôm | trai', 'Nấm | gái', 'Bơ | trai', 'Kem | gái', 'Sóc | trai', 'Na Na | gái',
  ].join('\n'),
  guests: SAMPLE_GUESTS.join('\n'),
  prizes: [
    'Giải Khuyến khích | 1 phần quà nhỏ | 3',
    'Giải Ba | 1 phần quà | 2',
    'Giải Nhì | 1 hộp quà lớn | 1',
    'Giải Nhất | 1 phần quà đặc biệt | 1',
  ].join('\n'),
};

function freshState() {
  return {
    settings: { ...SAMPLE },
    musicOn: false,
    tree: { items: [], lit: false },
    oven: { winners: [], absent: [] },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const data = JSON.parse(raw);
    const base = freshState();
    return {
      ...base,
      ...data,
      settings: { ...base.settings, ...(data.settings || {}) },
      tree: { ...base.tree, ...(data.tree || {}) },
      oven: { ...base.oven, ...(data.oven || {}) },
    };
  } catch (e) {
    console.warn('Không đọc được dữ liệu, dùng mặc định', e);
    return freshState();
  }
}

let state = load();
const listeners = new Set();

const getState = () => state;
const settings = () => state.settings;

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Không lưu được', e); }
  listeners.forEach((fn) => fn(state));
}
function update(fn) { fn(state); save(); }
function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function resetTree() { update((s) => { s.tree = { items: [], lit: false }; }); }
function resetOven() { update((s) => { s.oven = { winners: [], absent: [] }; }); }
function resetSettingsToSample() { update((s) => { s.settings = { ...SAMPLE }; }); }

function exportJSON() {
  return JSON.stringify({ app: 'thoinoi-xmas', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2);
}
function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !data.settings) throw new Error('File không đúng định dạng');
  const base = freshState();
  state = {
    settings: { ...base.settings, ...data.settings },
    musicOn: !!data.musicOn,
    tree: { ...base.tree, ...(data.tree || {}) },
    oven: { ...base.oven, ...(data.oven || {}) },
  };
  save();
}

// ---------- Bộ đọc danh sách "mỗi dòng một mục" ----------
const lines = (text) => (text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const parts = (line) => line.split('|').map((s) => s.trim());

function normalize(str) {
  return (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
function slug(str) {
  return normalize(str).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'anh';
}

const CAREER_KEYS = [
  ['bac si', 'doctor'], ['y ta', 'doctor'], ['nha si', 'doctor'],
  ['phi hanh gia', 'astronaut'], ['phi cong', 'astronaut'],
  ['dau bep', 'chef'], ['tho lam banh', 'chef'],
  ['cuu hoa', 'firefighter'],
  ['hoa si', 'painter'],
  ['ca si', 'singer'], ['nhac si', 'singer'],
  ['canh sat', 'police'], ['cong an', 'police'],
  ['giao vien', 'teacher'], ['co giao', 'teacher'], ['thay giao', 'teacher'],
];
function careerKey(name) {
  const n = normalize(name);
  const hit = CAREER_KEYS.find(([k]) => n.includes(k));
  return hit ? hit[1] : 'generic';
}

function babyName() {
  return (state.settings.babyName || '').trim() || 'bé';
}

function careers() {
  return lines(state.settings.careers).map((l) => {
    const [name, emoji = ''] = parts(l);
    return { name, emoji, key: careerKey(name), slug: slug(name) };
  });
}

// Mỗi dòng: "Tên bé" hoặc "Tên bé | trai/gái"
function kidInfo() {
  const seen = new Set();
  const out = [];
  lines(state.settings.kids).forEach((l) => {
    const [name, g = ''] = parts(l);
    const k = normalize(name);
    if (!name || seen.has(k)) return;
    seen.add(k);
    // Chấp nhận nhiều cách ghi: "gái", "bé gái", "con gái", "nữ", "girl", "g" / "trai", "bé trai", "nam", "boy", "b"
    const gn = normalize(g);
    const gender = /\b(gai|nu|girl)\b|^g$/.test(gn) ? 'girl' : /\b(trai|nam|boy)\b|^b$/.test(gn) ? 'boy' : '';
    out.push({ name, gender });
  });
  return out;
}
const kids = () => kidInfo().map((k) => k.name);

function guests() {
  const used = new Map();
  return lines(state.settings.guests).map((l) => {
    const [name, tableRaw = ''] = parts(l);
    let table = tableRaw;
    if (/^\d+$/.test(table)) table = `Bàn ${table}`;
    const tableNo = (table.match(/\d+/) || [''])[0];
    let id = normalize(`${name}|${table}`);
    const n = (used.get(id) || 0) + 1;
    used.set(id, n);
    if (n > 1) id += `#${n}`;
    return { id, name, table, tableNo };
  });
}

// Mở rộng danh sách giải thành từng lượt bốc, theo thứ tự nhập (thấp → cao).
function prizeSlots() {
  const slots = [];
  lines(state.settings.prizes).forEach((l, prizeIdx) => {
    const [name, gift = '', qtyRaw = '1'] = parts(l);
    const qty = Math.max(1, parseInt(qtyRaw, 10) || 1);
    for (let i = 0; i < qty; i++) {
      slots.push({ prizeIdx, name, gift, qty, round: i + 1, label: gift ? `${name} – ${gift}` : name });
    }
  });
  return slots;
}
return { save, update, onChange, resetTree, resetOven, resetSettingsToSample, exportJSON, importJSON, normalize, slug, careerKey, babyName, careers, kidInfo, guests, prizeSlots, SAMPLE, getState, settings, lines, kids };
})();

// ===== js/audio.js =====
__m['audio'] = (() => {
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

const sfx = {
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

async function startMusic() {
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

function stopMusic() {
  if (!playing) return;
  playing = false;
  if (mp3) { mp3.pause(); return; }
  if (!ctx) return;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => { if (!playing) clearInterval(timer); }, 900);
}

const isPlaying = () => playing;
function unlock() { ensure(); }
return { startMusic, stopMusic, unlock, sfx, isPlaying };
})();

// ===== js/db.js =====
__m['db'] = (() => {
// Lưu ảnh Photobooth trong IndexedDB (không giới hạn 5MB như localStorage).
const DB_NAME = 'thoinoi-photos';
const STORE = 'photos';
let dbp = null;

function open() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const out = fn(store);
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : out);
    t.onerror = () => reject(t.error);
  });
}

const addPhoto = (photo) => tx('readwrite', (s) => s.add(photo));
const allPhotos = () => tx('readonly', (s) => s.getAll());
const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id));
const clearPhotos = () => tx('readwrite', (s) => s.clear());
const countPhotos = () => tx('readonly', (s) => s.count());
return { addPhoto, allPhotos, deletePhoto, clearPhotos, countPhotos };
})();

// ===== js/ui.js =====
__m['ui'] = (() => {
// Tiện ích giao diện dùng chung
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(msg, ms = 2400) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Số ngẫu nhiên an toàn trong [0, n)
function randInt(n) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
return { el, esc, toast, download, randInt, shuffle, $, $$, sleep };
})();

// ===== js/settings.js =====
__m['settings'] = (() => {
// Màn hình Cài đặt
const store = __m['storage'];
const { clearPhotos } = __m['db'];
const { el, esc, toast, download } = __m['ui'];

const FIELDS = [
  {
    key: 'careers', label: 'Danh sách nghề (Game 1)',
    hint: 'Mỗi dòng: <code>Tên nghề | biểu tượng</code>. Có sẵn hình cho: Bác sĩ, Phi hành gia, Đầu bếp, Lính cứu hỏa, Họa sĩ, Ca sĩ, Cảnh sát, Giáo viên. Nghề khác mặc áo len Noel, đội vương miện.',
    count: () => `${store.careers().length} nghề`,
  },
  {
    key: 'kids', label: 'Các bé dự tiệc (Game 1 & 2)',
    hint: 'Mỗi dòng một tên. Có thể ghi thêm giới tính: <code>Bin | trai</code>, <code>Na | gái</code> để thẻ ước mơ tự chọn hình bé trai/bé gái.',
    count: () => `${store.kids().length} bé`,
  },
  {
    key: 'guests', label: 'Danh sách khách (Game 3)',
    hint: 'Mỗi dòng: <code>Tên khách | Bàn 5</code> (có thể chỉ ghi số bàn). Trên 30 khách, bánh trong lò sẽ hiện số bàn thay vì tên.',
    count: () => {
      const n = store.guests().length;
      return n > 30 ? `${n} khách · hiện số bàn` : `${n} khách`;
    },
  },
  {
    key: 'prizes', label: 'Giải thưởng (Game 3)',
    hint: 'Mỗi dòng: <code>Tên giải | Phần quà | Số lượng</code>. Xếp từ giải <b>thấp</b> đến giải <b>cao</b> — game bốc lần lượt theo thứ tự này.',
    count: () => `${store.prizeSlots().length} lượt bốc`,
  },
];

let root;
// Tự lưu sau khi ngừng gõ 350ms. Ô đang chờ lưu được ghi ngay khi chuyển sang ô khác,
// khi rời màn hình, đóng trang, hoặc trước khi Xuất / Nhập / Khôi phục.
let saveTimer = 0;
let pendingField = null;

function flush() {
  clearTimeout(saveTimer);
  const f = pendingField;
  pendingField = null;
  if (!f) return;
  store.update((st) => { st.settings[f.dataset.key] = f.value; });
  if (root) {
    refreshCounts();
    const s = root.querySelector('#saveState');
    if (s) s.textContent = 'Đã lưu ✓';
  }
}
window.addEventListener('pagehide', flush);

function init(section) {
  root = section;
  render();
}

function leave() { flush(); }

function render() {
  const s = store.settings();
  root.innerHTML = '';
  const wrap = el(`
    <div class="settings">
      <div class="settings-head">
        <div>
          <h2 class="screen-title">Cài đặt</h2>
          <p class="screen-sub">Dán danh sách vào, mỗi dòng một mục. Tự động lưu trong trình duyệt.</p>
        </div>
        <span class="save-state" id="saveState">Đã lưu</span>
      </div>
      <div class="settings-grid">
        <div class="field wide">
          <div class="field-top"><label for="f-babyName">Tên em bé thôi nôi</label></div>
          <input type="text" id="f-babyName" class="name-input" data-key="babyName" value="${esc(s.babyName)}" maxlength="30" autocomplete="off">
        </div>
        ${FIELDS.map((f) => `
          <div class="field">
            <div class="field-top"><label for="f-${f.key}">${f.label}</label><span class="count" data-count="${f.key}"></span></div>
            <p class="hint">${f.hint}</p>
            <textarea id="f-${f.key}" data-key="${f.key}" spellcheck="false">${esc(s[f.key])}</textarea>
          </div>`).join('')}
      </div>

      <div class="settings-actions">
        <button class="btn btn-ghost" id="btnExport">Xuất file sao lưu</button>
        <label class="btn btn-ghost" for="fileImport">Nhập file sao lưu</label>
        <input type="file" id="fileImport" accept="application/json,.json" hidden>
        <span class="spacer"></span>
        <a class="btn btn-primary" href="#home">Xong · Về trang chính</a>
      </div>

      <div class="danger-zone">
        <h3>Làm lại từ đầu</h3>
        <div class="settings-actions" style="margin-top:0">
          <button class="btn btn-danger btn-sm" data-reset="photos">Xoá toàn bộ thẻ ước mơ</button>
          <button class="btn btn-danger btn-sm" data-reset="tree">Làm lại cây thông</button>
          <button class="btn btn-danger btn-sm" data-reset="oven">Làm lại bốc thăm</button>
          <button class="btn btn-danger btn-sm" data-reset="sample">Khôi phục dữ liệu mẫu</button>
        </div>
      </div>
    </div>`);
  root.appendChild(wrap);
  refreshCounts();

  const state = wrap.querySelector('#saveState');
  wrap.addEventListener('input', (e) => {
    if (!e.target.dataset.key) return;
    if (pendingField && pendingField !== e.target) flush();   // ô trước chưa kịp lưu → lưu ngay
    pendingField = e.target;
    state.textContent = 'Đang lưu…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 350);
  });

  wrap.querySelector('#btnExport').addEventListener('click', () => {
    flush();
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const d = new Date();
    download(blob, `thoinoi-saoluu-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`);
  });

  wrap.querySelector('#fileImport').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';      // để chọn lại đúng file đó lần sau vẫn nhập được
    if (!file) return;
    flush();
    try {
      store.importJSON(await file.text());
      render();
      toast('Đã nhập dữ liệu từ file sao lưu');
    } catch (err) {
      toast('Không đọc được file: ' + err.message, 3500);
    }
  });

  wrap.querySelectorAll('[data-reset]').forEach((b) => b.addEventListener('click', async () => {
    const kind = b.dataset.reset;
    const msg = {
      photos: 'Xoá toàn bộ thẻ ước mơ trong album? Không thể hoàn tác.',
      tree: 'Gỡ hết đồ trang trí và quà ở cây thông, làm lại từ đầu?',
      oven: 'Xoá kết quả bốc thăm (bảng "Đã trúng") để bốc lại từ đầu?',
      sample: 'Thay toàn bộ danh sách hiện tại bằng dữ liệu mẫu?',
    }[kind];
    flush();
    if (!confirm(msg)) return;
    if (kind === 'photos') await clearPhotos();
    if (kind === 'tree') store.resetTree();
    if (kind === 'oven') store.resetOven();
    if (kind === 'sample') { store.resetSettingsToSample(); render(); }
    toast('Đã làm lại ✓');
  }));
}

function refreshCounts() {
  if (!root) return;
  FIELDS.forEach((f) => {
    const c = root.querySelector(`[data-count="${f.key}"]`);
    if (c) c.textContent = f.count();
  });
}

function enter() { render(); }
return { init, leave, enter };
})();

// ===== js/art.js =====
__m['art'] = (() => {
// Thư viện hình minh họa SVG (vẽ tay bằng code) — phong cách phẳng, viền nâu ấm.

const O = '#3b2414';            // màu viền
const NS = 'http://www.w3.org/2000/svg';

function svg(viewBox, w, h, inner, extra = '') {
  return `<svg xmlns="${NS}" viewBox="${viewBox}" width="${w}" height="${h}" ${extra}>${inner}</svg>`;
}

function starPath(cx, cy, R, r, n = 5, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }
  return d + 'Z';
}

const tube = (d, color, w = 10) =>
  `<path d="${d}" stroke="${O}" stroke-width="${w + 7}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const sparkle = (x, y, s = 1, c = '#ffd770') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z" fill="${c}"/>`;

// =========================================================
// MŨ NGHỀ — viewBox 0 0 300 200, đáy mũ ở khoảng y = 190
// =========================================================
const HATS = {
  doctor: `
    <defs><radialGradient id="mirD" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#dfe5ee"/><stop offset="1" stop-color="#93a0b4"/></radialGradient></defs>
    <path d="M22 188 Q150 128 278 188 L278 164 Q150 104 22 164 Z" fill="#f4f6fa" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="141" y="102" width="18" height="36" rx="6" fill="#cfd6e2" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="76" r="50" fill="url(#mirD)" stroke="${O}" stroke-width="5"/>
    <circle cx="150" cy="76" r="37" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
    <circle cx="150" cy="76" r="9" fill="#5b6475"/>
    <path d="M122 58 Q132 44 148 42" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".85"/>
    <g transform="translate(224 160) rotate(14)"><rect x="-14" y="-5" width="28" height="10" rx="2.5" fill="#d94b45"/><rect x="-5" y="-14" width="10" height="28" rx="2.5" fill="#d94b45"/></g>`,

  astronaut: `
    <path d="M10 196 A140 140 0 0 1 290 196 L254 196 A104 104 0 0 0 46 196 Z" fill="#f1f3f8" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M30 196 A120 120 0 0 1 270 196" fill="none" stroke="#c9d0dc" stroke-width="5"/>
    <path d="M213 74 L238 26" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="240" cy="22" r="11" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <rect x="130" y="50" width="40" height="16" rx="5" fill="#ffcf7a" stroke="${O}" stroke-width="4"/>
    <circle cx="58" cy="150" r="18" fill="#2a4677" stroke="${O}" stroke-width="4"/>
    <path d="${starPath(58, 151, 10, 4.5)}" fill="#fff"/>
    <rect x="228" y="138" width="30" height="12" rx="3" fill="#d6423a" stroke="${O}" stroke-width="3"/>
    <rect x="230" y="156" width="26" height="10" rx="3" fill="#3f8fd9" stroke="${O}" stroke-width="3"/>
    <path d="M70 92 Q104 66 140 60" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/>`,

  chef: (() => {
    const puffs = [[95, 100, 46], [150, 70, 58], [205, 100, 46], [122, 110, 40], [178, 110, 40]];
    return puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffdf8" stroke="${O}" stroke-width="5"/>`).join('') +
      puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 3}" fill="#fffdf8"/>`).join('') + `
      <path d="M78 96 Q84 72 104 66" stroke="#e7e2d6" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M150 44 Q168 46 178 62" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="68" y="120" width="164" height="64" rx="10" fill="#fffdf8" stroke="${O}" stroke-width="5"/>
      <path d="M110 128 V176 M150 128 V176 M190 128 V176" stroke="#e2ddd0" stroke-width="5" stroke-linecap="round"/>`;
  })(),

  firefighter: `
    <defs><linearGradient id="badgeF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe19a"/><stop offset="1" stop-color="#d9a441"/></linearGradient></defs>
    <ellipse cx="150" cy="178" rx="142" ry="18" fill="#a92e27" stroke="${O}" stroke-width="5"/>
    <path d="M48 178 Q44 64 150 56 Q256 64 252 178 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 60 V176" stroke="#a92e27" stroke-width="16"/>
    <path d="M150 60 V176" stroke="#e85a50" stroke-width="6"/>
    <path d="M86 84 Q74 122 78 168" stroke="#f08a80" stroke-width="8" fill="none" stroke-linecap="round" opacity=".75"/>
    <path d="M116 92 H184 V128 Q184 158 150 172 Q116 158 116 128 Z" fill="url(#badgeF)" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(150, 128, 20, 9)}" fill="#d6423a" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`,

  painter: `
    <path d="M36 168 Q18 118 92 96 Q170 72 248 106 Q292 128 272 160 Q262 176 236 176 L70 178 Q44 180 36 168Z" fill="#b8334a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 166 Q150 186 252 164" stroke="#8c2236" stroke-width="13" fill="none" stroke-linecap="round"/>
    <path d="M150 84 q4 -18 20 -22" stroke="${O}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M90 112 Q140 92 196 98" stroke="#d9566b" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85"/>
    <circle cx="214" cy="126" r="9" fill="#ffc23d" stroke="${O}" stroke-width="3"/>
    <circle cx="236" cy="142" r="7" fill="#3f8fd9" stroke="${O}" stroke-width="3"/>
    <circle cx="196" cy="146" r="6" fill="#4caf6e" stroke="${O}" stroke-width="3"/>`,

  singer: `
    ${tube('M95 140 q-14 -10 0 -20 q14 -10 0 -20 q-14 -10 0 -20 q14 -10 0 -20', '#c9d1dd', 4)}
    ${tube('M205 140 q14 -10 0 -20 q-14 -10 0 -20 q14 -10 0 -20 q-14 -10 0 -20', '#c9d1dd', 4)}
    ${tube('M28 192 Q150 100 272 192', '#e05a9a', 16)}
    <path d="${starPath(95, 44, 34, 15)}" fill="#ffd25e" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <g transform="translate(205 46)">
      <ellipse cx="-6" cy="16" rx="17" ry="13" transform="rotate(-22 -6 16)" fill="#8a5cd6" stroke="${O}" stroke-width="5"/>
      <path d="M9 12 V-30 Q26 -22 32 -4" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${sparkle(50, 92, 0.9)}${sparkle(252, 96, 0.8, '#fbe7b5')}`,

  police: `
    <path d="M58 140 L32 92 Q150 42 268 92 L242 140 Z" fill="#26375f" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 96 Q150 60 240 96" stroke="#3a5088" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="56" y="132" width="188" height="34" rx="6" fill="#141c30" stroke="${O}" stroke-width="5"/>
    <path d="M62 149 H238" stroke="#f2c46d" stroke-width="3"/>
    <path d="M50 162 Q150 212 250 162 Q150 184 50 162 Z" fill="#0d1220" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 72 L174 82 L172 108 Q168 124 150 132 Q132 124 128 108 L126 82 Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(150, 103, 13, 6)}" fill="#26375f"/>`,

  teacher: `
    <path d="M84 104 L84 158 Q150 190 216 158 L216 104 Z" fill="#232a3d" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 40 L292 88 L150 136 L8 88 Z" fill="#2f374f" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 54 L262 88" stroke="#4a5576" stroke-width="5" stroke-linecap="round"/>
    <path d="M150 88 Q228 92 252 102 L252 148" stroke="${O}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 88 Q228 92 252 102 L252 148" stroke="#f2c46d" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="150" cy="88" r="9" fill="#f2c46d" stroke="${O}" stroke-width="3"/>
    <path d="M242 144 H262 L268 180 H236 Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`,

  generic: `
    <defs><linearGradient id="crownG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#e0a940"/></linearGradient></defs>
    <path d="M40 180 L26 78 L92 126 L150 50 L208 126 L274 78 L260 180 Z" fill="url(#crownG)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="38" y="158" width="224" height="26" rx="7" fill="#d9a441" stroke="${O}" stroke-width="5"/>
    <circle cx="26" cy="78" r="11" fill="#fbe7b5" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="50" r="11" fill="#fbe7b5" stroke="${O}" stroke-width="4"/>
    <circle cx="274" cy="78" r="11" fill="#fbe7b5" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="136" r="13" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <circle cx="96" cy="146" r="9" fill="#3f8fd9" stroke="${O}" stroke-width="3.5"/>
    <circle cx="204" cy="146" r="9" fill="#4caf6e" stroke="${O}" stroke-width="3.5"/>`,
};

// =========================================================
// ĐẠO CỤ — viewBox 0 0 200 200
// =========================================================
const PROPS = {
  doctor: `
    <defs><radialGradient id="chestD" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9aa6b8"/></radialGradient></defs>
    ${tube('M58 30 Q50 82 96 106 M142 30 Q150 82 104 106', '#3f4a5e', 9)}
    ${tube('M100 106 Q100 166 140 164 Q178 160 166 124', '#3f4a5e', 9)}
    <circle cx="58" cy="26" r="10" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
    <circle cx="142" cy="26" r="10" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
    <circle cx="100" cy="106" r="11" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
    <circle cx="166" cy="114" r="24" fill="url(#chestD)" stroke="${O}" stroke-width="5"/>
    <circle cx="166" cy="114" r="12" fill="#e8edf3" stroke="#9aa6b8" stroke-width="3"/>`,

  astronaut: `
    <g transform="rotate(32 100 100)">
      <path d="M84 150 Q100 200 116 150 Z" fill="#ffb347" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M92 150 Q100 180 108 150 Z" fill="#fff1a8"/>
      <path d="M76 116 L50 154 L80 148 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M124 116 L150 154 L120 148 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 16 Q138 50 128 150 L72 150 Q62 50 100 16 Z" fill="#f4f6fa" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 16 Q120 32 127 58 L73 58 Q80 32 100 16 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="100" cy="92" r="17" fill="#5fb0e8" stroke="${O}" stroke-width="5"/>
      <circle cx="94" cy="86" r="5" fill="#fff" opacity=".85"/>
      <path d="M80 70 Q78 110 82 140" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
    </g>
    ${sparkle(30, 40)}${sparkle(170, 170, 0.7, '#fbe7b5')}`,

  chef: `
    <rect x="128" y="112" width="70" height="20" rx="10" transform="rotate(-22 128 122)" fill="#7a4e2c" stroke="${O}" stroke-width="5"/>
    <circle cx="84" cy="112" r="64" fill="#2e3440" stroke="${O}" stroke-width="5"/>
    <circle cx="84" cy="112" r="52" fill="#474f5e"/>
    <path d="M54 104 Q50 74 80 74 Q110 70 112 96 Q124 124 96 136 Q60 146 54 120 Z" fill="#fff" stroke="${O}" stroke-width="3.5"/>
    <circle cx="84" cy="106" r="16" fill="#ffc23d" stroke="${O}" stroke-width="3.5"/>
    <circle cx="79" cy="100" r="5" fill="#fff3c4"/>
    ${sparkle(160, 50, 0.8)}`,

  firefighter: `
    ${tube('M112 46 Q176 50 162 112 Q156 142 176 156', '#1d222c', 9)}
    <rect x="170" y="148" width="16" height="26" rx="4" transform="rotate(-20 178 160)" fill="#3f4a5e" stroke="${O}" stroke-width="4"/>
    <rect x="84" y="34" width="28" height="26" rx="5" fill="#3f4a5e" stroke="${O}" stroke-width="4"/>
    ${tube('M86 40 L56 28', '#3f4a5e', 6)}
    <rect x="64" y="56" width="66" height="130" rx="28" fill="#d6423a" stroke="${O}" stroke-width="5"/>
    <path d="M78 74 V168" stroke="#f08a80" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <rect x="86" y="104" width="38" height="40" rx="6" fill="#fdf6e7" stroke="${O}" stroke-width="3"/>
    <path d="M105 136 Q92 130 96 118 Q100 124 104 116 Q108 108 106 104 Q120 116 114 130 Q112 136 105 136Z" fill="#ff8a3d"/>`,

  painter: `
    <path d="M100 30 C40 30 16 80 28 120 C38 156 70 172 104 170 C132 168 130 146 120 136 C110 126 118 114 134 116 C162 120 184 106 182 80 C180 50 146 30 100 30 Z" fill="#e9c48f" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="70" cy="132" rx="14" ry="11" fill="#c99c62" stroke="${O}" stroke-width="3.5"/>
    <circle cx="62" cy="76" r="13" fill="#d6423a" stroke="${O}" stroke-width="3.5"/>
    <circle cx="100" cy="58" r="13" fill="#ffc23d" stroke="${O}" stroke-width="3.5"/>
    <circle cx="140" cy="64" r="13" fill="#3f8fd9" stroke="${O}" stroke-width="3.5"/>
    <circle cx="158" cy="94" r="12" fill="#4caf6e" stroke="${O}" stroke-width="3.5"/>
    <circle cx="46" cy="108" r="11" fill="#8a5cd6" stroke="${O}" stroke-width="3.5"/>
    <g transform="rotate(38 150 150)">
      <rect x="144" y="92" width="13" height="92" rx="6" fill="#8a5a33" stroke="${O}" stroke-width="4"/>
      <rect x="142" y="78" width="17" height="18" rx="3" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
      <path d="M143 80 Q150 46 158 80 Z" fill="#d6423a" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
    </g>`,

  singer: `
    <defs>
      <radialGradient id="micS" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#c9d1dd"/><stop offset="1" stop-color="#7c879a"/></radialGradient>
      <clipPath id="micClip"><circle cx="100" cy="66" r="38"/></clipPath>
    </defs>
    <path d="M86 110 L114 110 L107 188 L93 188 Z" fill="#2a2f3a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="82" y="100" width="36" height="18" rx="5" fill="#f2c46d" stroke="${O}" stroke-width="4"/>
    <circle cx="100" cy="66" r="40" fill="url(#micS)" stroke="${O}" stroke-width="5"/>
    <g clip-path="url(#micClip)" stroke="#7c879a" stroke-width="2.5" fill="none" opacity=".7">
      <path d="M50 46 H150 M50 60 H150 M50 74 H150 M50 88 H150"/>
      <path d="M72 20 V110 M88 20 V110 M104 20 V110 M120 20 V110 M136 20 V110"/>
    </g>
    ${sparkle(36, 40, 1.1)}${sparkle(166, 34, 0.8, '#fbe7b5')}${sparkle(170, 104, 0.7)}`,

  police: `
    <defs><linearGradient id="badgeP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#d49a36"/></linearGradient></defs>
    <path d="M100 18 L166 42 L160 112 Q152 160 100 186 Q48 160 40 112 L34 42 Z" fill="url(#badgeP)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M100 38 L148 55 L144 110 Q138 146 100 166 Q62 146 56 110 L52 55 Z" fill="none" stroke="#b8862f" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(100, 100, 32, 14)}" fill="#26375f" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M64 56 Q70 90 66 118" stroke="#fff6d6" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`,

  teacher: `
    <rect x="28" y="142" width="144" height="30" rx="4" fill="#3f8fd9" stroke="${O}" stroke-width="5"/>
    <rect x="150" y="148" width="16" height="18" fill="#fdf6e7"/>
    <rect x="42" y="114" width="124" height="30" rx="4" fill="#d6423a" stroke="${O}" stroke-width="5"/>
    <rect x="46" y="120" width="14" height="18" fill="#fdf6e7"/>
    <rect x="34" y="88" width="132" height="28" rx="4" fill="#4caf6e" stroke="${O}" stroke-width="5"/>
    <rect x="146" y="94" width="14" height="16" fill="#fdf6e7"/>
    <path d="M100 46 C82 34 60 48 66 70 C70 88 88 92 100 84 C112 92 130 88 134 70 C140 48 118 34 100 46 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M100 46 L97 30" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <path d="M102 42 Q106 26 124 24 Q120 40 102 42 Z" fill="#4caf6e" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 56 Q78 66 84 74" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`,

  generic: giftInner('#d6423a', '#f2c46d', 2, 1),
};

function giftInner(box, ribbon, s = 2, k = 1) {
  // hộp quà trong khung 200x200 (s=2) hoặc 100x100 (s=1)
  const t = (v) => v * s;
  const lid = shade(box, 0.12);
  return `
    <rect x="${t(12)}" y="${t(42)}" width="${t(76)}" height="${t(52)}" rx="${t(4)}" fill="${box}" stroke="${O}" stroke-width="${t(2.2) * k}"/>
    <rect x="${t(44)}" y="${t(42)}" width="${t(12)}" height="${t(52)}" fill="${ribbon}"/>
    <rect x="${t(6)}" y="${t(30)}" width="${t(88)}" height="${t(16)}" rx="${t(4)}" fill="${lid}" stroke="${O}" stroke-width="${t(2.2) * k}"/>
    <rect x="${t(44)}" y="${t(30)}" width="${t(12)}" height="${t(16)}" fill="${ribbon}"/>
    <path d="M${t(50)} ${t(30)} C${t(38)} ${t(10)} ${t(18)} ${t(14)} ${t(28)} ${t(28)} Z" fill="${ribbon}" stroke="${O}" stroke-width="${t(2) * k}" stroke-linejoin="round"/>
    <path d="M${t(50)} ${t(30)} C${t(62)} ${t(10)} ${t(82)} ${t(14)} ${t(72)} ${t(28)} Z" fill="${ribbon}" stroke="${O}" stroke-width="${t(2) * k}" stroke-linejoin="round"/>
    <circle cx="${t(50)}" cy="${t(29)}" r="${t(5)}" fill="${ribbon}" stroke="${O}" stroke-width="${t(2) * k}"/>`;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * amt);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const hatSVG = (key, w = 300, h = 200) => svg('0 0 300 200', w, h, HATS[key] || HATS.generic);
const propSVG = (key, w = 200, h = 200) => svg('0 0 200 200', w, h, PROPS[key] || PROPS.generic);

// =========================================================
// NHÂN VẬT BÉ MẶC ĐỒ NGHỀ — viewBox 0 0 460 540
// gender: 'boy' | 'girl'
// =========================================================
const SKIN = '#f8d6bb', HAIR = '#4a2c1a';

// Áo theo nghề: [màu áo, màu tay áo, chi tiết vẽ thêm trên thân]
const OUTFITS = {
  doctor: ['#f7f9fc', '#e6ebf2', `
    <path d="M172 322 L200 392 L228 322 Z" fill="#9fd0e8" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M160 324 L200 410 M240 324 L200 410" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <rect x="234" y="420" width="44" height="34" rx="6" fill="#fff" stroke="${O}" stroke-width="4"/>
    <rect x="250" y="426" width="12" height="22" rx="2" fill="#d6423a"/><rect x="245" y="431" width="22" height="12" rx="2" fill="#d6423a"/>`],
  astronaut: ['#eef1f6', '#dfe4ec', `
    <ellipse cx="200" cy="328" rx="62" ry="16" fill="#c9d0dc" stroke="${O}" stroke-width="4"/>
    <rect x="160" y="388" width="80" height="54" rx="10" fill="#26375f" stroke="${O}" stroke-width="4"/>
    <circle cx="180" cy="408" r="8" fill="#d6423a"/><circle cx="202" cy="408" r="8" fill="#ffd25e"/><circle cx="224" cy="408" r="8" fill="#4caf6e"/>
    <rect x="172" y="424" width="56" height="8" rx="4" fill="#9fb0cc"/>`],
  chef: ['#fffdf8', '#f1ece0', `
    <path d="M166 322 L200 362 L234 322 Z" fill="#d6423a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 362 L188 392 L212 392 Z" fill="#d6423a" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
    ${[400, 436, 472].map((y) => `<circle cx="178" cy="${y}" r="6" fill="#c9b99a"/><circle cx="222" cy="${y}" r="6" fill="#c9b99a"/>`).join('')}`],
  firefighter: ['#d6423a', '#c43a33', `
    <path d="M100 436 H300 M104 470 H296" stroke="#ffd25e" stroke-width="12"/>
    <path d="M100 436 H300 M104 470 H296" stroke="#fff3c4" stroke-width="3"/>
    <path d="M200 330 V500" stroke="#3b2414" stroke-width="5"/>
    <path d="M170 326 L200 346 L230 326" stroke="#3b2414" stroke-width="5" fill="none" stroke-linejoin="round"/>`],
  painter: ['#3f8f7a', '#357a68', `
    <path d="M200 340 L168 322 Q160 350 176 360 Z M200 340 L232 322 Q240 350 224 360 Z" fill="#d6423a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="200" cy="342" r="10" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="420" r="11" fill="#ffd25e"/><circle cx="246" cy="452" r="9" fill="#fdf6e7"/><circle cx="178" cy="476" r="8" fill="#d6423a"/><circle cx="262" cy="404" r="7" fill="#f2c46d"/>`],
  singer: ['#8a5cd6', '#7a4ec4', `
    <path d="M200 338 L170 322 L170 356 Z M200 338 L230 322 L230 356 Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="200" cy="339" r="8" fill="#f2c46d" stroke="${O}" stroke-width="4"/>
    ${sparkle(150, 420, 0.9)}${sparkle(252, 450, 1.1)}${sparkle(196, 488, 0.7, '#fbe7b5')}`],
  police: ['#26375f', '#1f2e52', `
    <path d="M172 322 L200 358 L228 322 Z" fill="#dfe6f3" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 358 L190 372 L200 452 L210 372 Z" fill="#141c30" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M248 392 L270 400 L268 424 Q264 438 248 444 Q232 438 228 424 L226 400 Z" fill="#f2c46d" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="${starPath(248, 418, 10, 4.5)}" fill="#26375f"/>`],
  teacher: ['#2f7d5b', '#286b4e', `
    <path d="M200 334 L164 322 L172 354 Z M200 334 L236 322 L228 354 Z" fill="#fdf6e7" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 340 V500" stroke="#1e5a40" stroke-width="5"/>
    ${[392, 428, 464].map((y) => `<circle cx="214" cy="${y}" r="6" fill="#fdf6e7"/>`).join('')}`],
  generic: ['#c8473f', '#b63c35', `
    <path d="M104 420 H296" stroke="#fdf6e7" stroke-width="20"/>
    <path d="M104 420 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8" stroke="#2f7d5b" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M168 324 Q200 344 232 324" stroke="#fdf6e7" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="150" cy="466" r="6" fill="#fdf6e7"/><circle cx="200" cy="474" r="6" fill="#fdf6e7"/><circle cx="250" cy="466" r="6" fill="#fdf6e7"/>`],
};

function kidBody(key, gender) {
  const [coat, sleeve, detail] = OUTFITS[key] || OUTFITS.generic;
  const girl = gender === 'girl';
  const hairBack = girl ? `
    <path d="M102 210 Q84 300 116 336 L136 312 Q114 270 118 214 Z" fill="${HAIR}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M298 210 Q316 300 284 336 L264 312 Q286 270 282 214 Z" fill="${HAIR}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` : '';
  const pigtails = girl ? [[78, 262, 1], [322, 262, -1]].map(([x, y, f]) => `
    <circle cx="${x}" cy="${y}" r="30" fill="${HAIR}" stroke="${O}" stroke-width="4"/>
    <g transform="translate(${x + f * 18} ${y - 26})">
      <path d="M0 0 L-20 -14 L-20 14 Z M0 0 L20 -14 L20 14 Z" fill="#d6423a" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle r="6" fill="#d6423a" stroke="${O}" stroke-width="3.5"/>
    </g>`).join('') : '';
  const fringe = girl
    ? `M102 222 Q92 116 200 108 Q308 116 298 222 Q286 166 240 158 Q214 176 200 160 Q184 178 156 162 Q116 170 102 222Z`
    : `M102 222 Q92 118 200 108 Q308 118 298 222 Q290 180 262 168 Q240 186 210 172 Q182 190 154 172 Q124 182 102 222Z`;
  return `
    ${hairBack}
    <path d="M92 500 L96 414 Q100 344 160 322 L240 322 Q300 344 304 414 L308 500 Z" fill="${coat}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    ${detail}
    <path d="M112 352 Q84 400 90 452" stroke="${O}" stroke-width="46" fill="none" stroke-linecap="round"/>
    <path d="M112 352 Q84 400 90 452" stroke="${sleeve}" stroke-width="37" fill="none" stroke-linecap="round"/>
    <circle cx="90" cy="462" r="20" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
    <path d="M288 352 Q322 370 334 404" stroke="${O}" stroke-width="46" fill="none" stroke-linecap="round"/>
    <path d="M288 352 Q322 370 334 404" stroke="${sleeve}" stroke-width="37" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="230" r="17" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
    <circle cx="300" cy="230" r="17" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
    <circle cx="200" cy="222" r="100" fill="${SKIN}" stroke="${O}" stroke-width="5"/>
    <path d="${fringe}" fill="${HAIR}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    ${pigtails}
    <ellipse cx="166" cy="222" rx="9" ry="12" fill="${O}"/><ellipse cx="234" cy="222" rx="9" ry="12" fill="${O}"/>
    <circle cx="169" cy="217" r="3.2" fill="#fff"/><circle cx="237" cy="217" r="3.2" fill="#fff"/>
    <ellipse cx="146" cy="254" rx="17" ry="10" fill="#f29a9a" opacity=".6"/><ellipse cx="254" cy="254" rx="17" ry="10" fill="#f29a9a" opacity=".6"/>
    <path d="M178 262 Q200 284 222 262" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
}

function kidSVG(key, gender = 'boy', w = '100%', h = '100%') {
  const hat = HATS[key] || HATS.generic;
  const prop = PROPS[key] || PROPS.generic;
  return svg('0 0 460 540', w, h, `<g transform="translate(0 40)">
    ${kidBody(key, gender)}
    <svg x="75" y="-8" width="250" height="167" viewBox="0 0 300 200">${hat}</svg>
    <svg x="292" y="296" width="150" height="150" viewBox="0 0 200 200">${prop}</svg>
    <circle cx="338" cy="410" r="20" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
  </g>`);
}

// Thẻ chọn nghề: bé trai/bé gái xen kẽ cho sinh động
const careerCardSVG = (key, i = 0) => kidSVG(key, i % 2 ? 'girl' : 'boy');

// =========================================================
// ĐỒ TRANG TRÍ CÂY THÔNG — viewBox 0 0 100 110, móc treo ở trên
// =========================================================
const hook = `<path d="M50 3 a5 5 0 1 0 0.1 0" fill="none" stroke="#d9a441" stroke-width="3"/>`;
const ORN = {
  'red-ball': `${hook}<rect x="41" y="10" width="18" height="12" rx="3" fill="#d9a441" stroke="${O}" stroke-width="3"/>
    <circle cx="50" cy="60" r="36" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <path d="M16 58 Q50 76 84 58" stroke="#f2c46d" stroke-width="6" fill="none"/>
    <circle cx="32" cy="68" r="3.5" fill="#fbe7b5"/><circle cx="50" cy="73" r="3.5" fill="#fbe7b5"/><circle cx="68" cy="68" r="3.5" fill="#fbe7b5"/>
    <ellipse cx="36" cy="44" rx="7" ry="11" transform="rotate(35 36 44)" fill="#fff" opacity=".45"/>`,
  'gold-ball': `${hook}<rect x="41" y="10" width="18" height="12" rx="3" fill="#c9d1dd" stroke="${O}" stroke-width="3"/>
    <circle cx="50" cy="60" r="36" fill="#f2c46d" stroke="${O}" stroke-width="4"/>
    <path d="M18 50 L30 58 L42 50 L50 58 L58 50 L70 58 L82 50" stroke="#c98a2a" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M18 68 L30 76 L42 68 L50 76 L58 68 L70 76 L82 68" stroke="#c98a2a" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <ellipse cx="36" cy="42" rx="7" ry="11" transform="rotate(35 36 42)" fill="#fff" opacity=".55"/>`,
  bell: `${hook}<path d="M50 14 C30 14 26 38 26 56 C26 72 18 80 12 88 L88 88 C82 80 74 72 74 56 C74 38 70 14 50 14Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="10" y="84" width="80" height="10" rx="5" fill="#d9a441" stroke="${O}" stroke-width="4"/>
    <circle cx="50" cy="100" r="8" fill="#d9a441" stroke="${O}" stroke-width="4"/>
    <path d="M38 30 Q32 46 34 64" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M50 18 C40 6 28 10 34 20 Z M50 18 C60 6 72 10 66 20 Z" fill="#d6423a" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`,
  candy: `<path d="M62 104 L62 40 Q62 14 40 14 Q20 14 20 36" fill="none" stroke="${O}" stroke-width="21" stroke-linecap="round"/>
    <path d="M62 104 L62 40 Q62 14 40 14 Q20 14 20 36" fill="none" stroke="#fffdf8" stroke-width="14" stroke-linecap="round"/>
    <path d="M62 104 L62 40 Q62 14 40 14 Q20 14 20 36" fill="none" stroke="#d6423a" stroke-width="14" stroke-dasharray="9 9"/>`,
  snowman: `<circle cx="50" cy="78" r="25" fill="#fffdf8" stroke="${O}" stroke-width="4"/>
    <circle cx="50" cy="42" r="18" fill="#fffdf8" stroke="${O}" stroke-width="4"/>
    <rect x="35" y="6" width="30" height="20" rx="3" fill="#26375f" stroke="${O}" stroke-width="3.5"/>
    <rect x="28" y="23" width="44" height="7" rx="3.5" fill="#26375f" stroke="${O}" stroke-width="3.5"/>
    <circle cx="44" cy="40" r="2.6" fill="${O}"/><circle cx="56" cy="40" r="2.6" fill="${O}"/>
    <path d="M50 45 L64 48 L50 50 Z" fill="#ff8a3d"/>
    <path d="M32 58 Q50 66 68 58" stroke="#d6423a" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M60 60 L66 76" stroke="#d6423a" stroke-width="7" stroke-linecap="round"/>
    <circle cx="50" cy="74" r="3" fill="${O}"/><circle cx="50" cy="86" r="3" fill="${O}"/>`,
  star: `${hook}<path d="${starPath(50, 60, 42, 19)}" fill="#ffd25e" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 42 L46 54" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`,
  stocking: `<path d="M50 4 Q40 4 40 12" stroke="#d9a441" stroke-width="3" fill="none"/>
    <path d="M30 24 H68 V64 L84 76 Q98 88 86 100 Q76 108 62 98 L38 82 Q30 76 30 66 Z" fill="#d6423a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 76 Q76 86 86 88" stroke="#fffdf8" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>
    <rect x="24" y="10" width="50" height="20" rx="8" fill="#fffdf8" stroke="${O}" stroke-width="4"/>`,
  mitten: `<path d="M50 4 Q44 4 44 10" stroke="#d9a441" stroke-width="3" fill="none"/>
    <ellipse cx="24" cy="56" rx="11" ry="17" transform="rotate(-32 24 56)" fill="#2f7d5b" stroke="${O}" stroke-width="4"/>
    <path d="M30 42 Q30 14 54 14 Q76 14 76 42 L76 84 L30 84 Z" fill="#2f7d5b" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="46" cy="38" r="3" fill="#fffdf8"/><circle cx="60" cy="50" r="3" fill="#fffdf8"/><circle cx="46" cy="62" r="3" fill="#fffdf8"/><circle cx="62" cy="28" r="3" fill="#fffdf8"/>
    <rect x="26" y="80" width="54" height="20" rx="8" fill="#fffdf8" stroke="${O}" stroke-width="4"/>`,
};

const ORNAMENTS = [
  { type: 'red-ball', name: 'Quả châu đỏ' },
  { type: 'gold-ball', name: 'Quả châu vàng' },
  { type: 'bell', name: 'Chuông' },
  { type: 'candy', name: 'Kẹo gậy' },
  { type: 'snowman', name: 'Người tuyết' },
  { type: 'star', name: 'Ngôi sao nhỏ' },
  { type: 'stocking', name: 'Tất Noel' },
  { type: 'mitten', name: 'Găng tay' },
];
const ornamentSVG = (type) => svg('0 0 100 110', '100%', '100%', ORN[type] || ORN['red-ball']);

const GIFT_COLORS = [
  ['#d6423a', '#f2c46d'], ['#f2c46d', '#d6423a'], ['#2f7d5b', '#fbe7b5'], ['#fdf6e7', '#d6423a'],
  ['#1f5a43', '#f2c46d'], ['#b8334a', '#fdf6e7'], ['#e9a23b', '#2f7d5b'],
];
function giftSVG(i = 0) {
  const [box, ribbon] = GIFT_COLORS[i % GIFT_COLORS.length];
  return svg('0 0 100 100', '100%', '100%', giftInner(box, ribbon, 1, 1.4));
}

// =========================================================
// CÂY THÔNG LỚN — viewBox 0 0 600 720
// =========================================================
const TIERS = [
  // [apexY, bottomY, halfWidth]
  [350, 610, 260],
  [230, 460, 190],
  [130, 320, 130],
  [70, 200, 80],
];
const GARLANDS = [
  // [x1,y1, cx,cy, x2,y2, số đèn]
  [242, 170, 300, 205, 352, 158, 4],
  [204, 275, 300, 330, 385, 258, 6],
  [154, 410, 300, 480, 432, 392, 8],
  [94, 560, 300, 640, 488, 540, 10],
];
const LIGHT_COLORS = ['#ffcf7a', '#fff1c4', '#ff9a7a', '#ffd770', '#ffe6b0'];

function treeSVG() {
  const tiers = TIERS.map(([a, b, hw], i) => {
    const d = `M300 ${a} L${300 + hw} ${b} Q300 ${b + 34} ${300 - hw} ${b} Z`;
    const fill = ['#1d5640', '#22604a', '#26684f', '#2b7055'][i];
    const snow = `M${300 - hw * 0.72} ${b - hw * 0.1} Q${300 - hw * 0.45} ${b + 10} ${300 - hw * 0.2} ${b + 6}
                  M${300 + hw * 0.15} ${b + 8} Q${300 + hw * 0.45} ${b + 12} ${300 + hw * 0.7} ${b - hw * 0.08}`;
    const shadeSide = `M300 ${a + 8} L${300 + hw * 0.92} ${b - 2} Q${300 + hw * 0.5} ${b + 18} 300 ${b + 16} Z`;
    return `<path class="tree-hit" d="${d}" fill="${fill}" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="${shadeSide}" fill="#0f2f24" opacity=".22" pointer-events="none"/>
      <path d="${snow}" stroke="#eef4fb" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75" pointer-events="none"/>`;
  }).join('');

  let lights = '';
  let li = 0;
  const garlands = GARLANDS.map(([x1, y1, cx, cy, x2, y2, n]) => {
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2;
      const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
      const c = LIGHT_COLORS[li % LIGHT_COLORS.length];
      const delay = ((li * 0.73) % 3.2).toFixed(2);
      const dur = (2.4 + ((li * 0.37) % 1.6)).toFixed(2);
      lights += `<circle class="light" cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="8" style="--c:${c};--d:${delay}s;--t:${dur}s"/>`;
      li++;
    }
    return `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" stroke="#e8b85a" stroke-width="4" fill="none" stroke-dasharray="1 9" stroke-linecap="round" opacity=".85" pointer-events="none"/>`;
  }).join('');

  return svg('0 0 600 720', '100%', '100%', `
    <ellipse cx="300" cy="700" rx="250" ry="16" fill="#000" opacity=".25"/>
    <rect x="272" y="612" width="56" height="70" rx="6" fill="#6b4428" stroke="${O}" stroke-width="4"/>
    <path d="M244 668 H356 L348 710 H252 Z" fill="#9e2f2a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M244 676 H356" stroke="#f2c46d" stroke-width="5"/>
    ${tiers}
    <g pointer-events="none">${garlands}${lights}</g>
    <g class="tree-star" pointer-events="none">
      <circle class="star-halo" cx="300" cy="60" r="70" fill="url(#halo)"/>
      <path d="${starPath(300, 62, 46, 20)}" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd770" stop-opacity=".75"/><stop offset="1" stop-color="#ffd770" stop-opacity="0"/></radialGradient></defs>
  `, 'class="tree-svg"');
}

// =========================================================
// BÁNH GỪNG — viewBox 0 0 200 240
// =========================================================
function gingerSVG(w = '100%', h = '100%') {
  return svg('0 0 200 240', w, h, `
    <path d="M70 92 Q40 92 26 104 Q12 118 26 130 Q38 138 64 128 L66 160 Q46 196 44 210 Q42 228 60 228 Q74 228 84 206 L100 180 L116 206 Q126 228 140 228 Q158 228 156 210 Q154 196 134 160 L136 128 Q162 138 174 130 Q188 118 174 104 Q160 92 130 92 Z"
      fill="#c8814a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="100" cy="56" r="40" fill="#c8814a" stroke="${O}" stroke-width="5"/>
    <path d="M30 108 q6 6 0 12 M170 108 q-6 6 0 12 M56 206 q6 6 12 0 M132 206 q6 6 12 0" stroke="#fffdf8" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="86" cy="50" r="5.5" fill="${O}"/><circle cx="114" cy="50" r="5.5" fill="${O}"/>
    <circle cx="88" cy="48" r="1.8" fill="#fff"/><circle cx="116" cy="48" r="1.8" fill="#fff"/>
    <ellipse cx="74" cy="66" rx="8" ry="5" fill="#e8a07a" opacity=".9"/><ellipse cx="126" cy="66" rx="8" ry="5" fill="#e8a07a" opacity=".9"/>
    <path d="M86 70 Q100 82 114 70" stroke="#fffdf8" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M86 98 L100 104 L86 110 Z M114 98 L100 104 L114 110 Z" fill="#2f7d5b" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="100" cy="124" r="7" fill="#d6423a" stroke="#fffdf8" stroke-width="3"/>
    <circle cx="100" cy="148" r="7" fill="#f2c46d" stroke="#fffdf8" stroke-width="3"/>`);
}

// =========================================================
// THẺ GAME Ở TRANG CHÍNH
// =========================================================
function cardArt(name) {
  if (name === 'card-photobooth') {
    const back = `<g transform="rotate(-9 110 130)">
        <rect x="46" y="36" width="128" height="176" rx="14" fill="#9e2630" stroke="${O}" stroke-width="5"/>
        <rect x="56" y="46" width="108" height="156" rx="9" fill="none" stroke="#f2c46d" stroke-width="3"/>
        <path d="${starPath(110, 124, 30, 13)}" fill="#f2c46d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      </g>`;
    const front = `<g transform="rotate(7 200 130)">
        <rect x="132" y="28" width="140" height="190" rx="14" fill="#fdf3df" stroke="${O}" stroke-width="5"/>
        <rect x="142" y="38" width="120" height="170" rx="9" fill="#1d4532" stroke="#f2c46d" stroke-width="3"/>
        <circle cx="202" cy="118" r="52" fill="#ffcf7a" opacity=".22"/>
        <svg x="146" y="52" width="116" height="136" viewBox="0 0 460 540">${kidSVG('chef', 'girl').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
        <rect x="158" y="184" width="88" height="14" rx="7" fill="#f2c46d" opacity=".85"/>
      </g>`;
    return svg('0 0 320 240', '100%', '100%', `${back}${front}
      ${sparkle(34, 40, 1.2)}${sparkle(292, 46, 0.9, '#fbe7b5')}${sparkle(296, 206, 0.7)}`);
  }
  if (name === 'card-tree') {
    return svg('0 0 320 240', '100%', '100%', `
      <path d="M160 34 L230 140 Q160 156 90 140 Z" fill="#26684f" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="M160 74 L252 196 Q160 214 68 196 Z" fill="#22604a" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="M160 34 L230 140 Q160 156 90 140 Z" fill="#26684f" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="${starPath(160, 32, 22, 10)}" fill="#ffd25e" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="130" cy="120" r="9" fill="#d6423a" stroke="${O}" stroke-width="3"/>
      <circle cx="184" cy="104" r="8" fill="#f2c46d" stroke="${O}" stroke-width="3"/>
      <circle cx="110" cy="180" r="10" fill="#f2c46d" stroke="${O}" stroke-width="3"/>
      <circle cx="168" cy="168" r="10" fill="#d6423a" stroke="${O}" stroke-width="3"/>
      <circle cx="218" cy="184" r="9" fill="#fbe7b5" stroke="${O}" stroke-width="3"/>
      <svg x="34" y="168" width="64" height="64" viewBox="0 0 100 100">${giftInner('#d6423a', '#f2c46d', 1, 1.4)}</svg>
      <svg x="222" y="176" width="56" height="56" viewBox="0 0 100 100">${giftInner('#f2c46d', '#d6423a', 1, 1.4)}</svg>
      ${sparkle(258, 60, 1)}${sparkle(60, 80, 0.8, '#fbe7b5')}`);
  }
  // card-oven
  return svg('0 0 320 240', '100%', '100%', `
    <rect x="40" y="40" width="200" height="180" rx="20" fill="#4f7a52" stroke="${O}" stroke-width="5"/>
    <rect x="40" y="40" width="200" height="40" rx="20" fill="#3d6342" stroke="${O}" stroke-width="5"/>
    <circle cx="80" cy="60" r="9" fill="#3b2414"/><circle cx="110" cy="60" r="9" fill="#3b2414"/>
    <rect x="160" y="52" width="56" height="16" rx="5" fill="#10291f"/>
    <rect x="62" y="98" width="156" height="100" rx="14" fill="#ff9a4d" stroke="${O}" stroke-width="5"/>
    <rect x="70" y="106" width="140" height="84" rx="10" fill="#ffc27a" opacity=".55"/>
    <rect x="96" y="88" width="88" height="10" rx="5" fill="#d9a441" stroke="${O}" stroke-width="3"/>
    <svg x="186" y="96" width="120" height="144" viewBox="0 0 200 240">${gingerSVG().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
    ${sparkle(282, 70, 1.1)}${sparkle(28, 30, 0.8, '#fbe7b5')}`);
}

// =========================================================
// VIỀN NOEL CHO ẢNH 1600x1200
// =========================================================
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const holly = (x, y, rot, s = 1) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 Q10 -18 20 -10 Q30 -24 40 -12 Q52 -26 60 -10 Q72 -20 84 0 Q72 20 60 10 Q52 26 40 12 Q30 24 20 10 Q10 18 0 0Z" fill="#2f7d5b" stroke="#173f2e" stroke-width="3"/>
    <path d="M4 0 H78" stroke="#173f2e" stroke-width="2.5"/>
  </g>`;
const hollyCluster = (x, y, flip = 1) => `
  ${holly(x, y, flip > 0 ? -30 : 210, 1.25)}${holly(x, y, flip > 0 ? -95 : 275, 1.15)}${holly(x, y, flip > 0 ? 25 : 155, 1.05)}
  <circle cx="${x - 4}" cy="${y - 6}" r="13" fill="#d6423a" stroke="#7a1f1a" stroke-width="3"/>
  <circle cx="${x + 16}" cy="${y + 6}" r="12" fill="#d6423a" stroke="#7a1f1a" stroke-width="3"/>
  <circle cx="${x - 8}" cy="${y + 16}" r="11" fill="#d6423a" stroke="#7a1f1a" stroke-width="3"/>
  <circle cx="${x - 8}" cy="${y - 10}" r="4" fill="#fff" opacity=".6"/>`;
const flake = (x, y, s, o = 0.7) => `
  <g transform="translate(${x} ${y}) scale(${s})" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="${o}">
    <path d="M0 -12 V12 M-10.4 -6 L10.4 6 M-10.4 6 L10.4 -6 M-3 -9 L0 -6 L3 -9 M-3 9 L0 6 L3 9"/>
  </g>`;

function frameSVG() {
  const r = rng(20261225);
  const greens = ['#1f5a43', '#24684d', '#2f7d5b', '#163f30', '#2b7055'];
  let needles = '', lights = '', baubles = '';
  const swags = [[-30, 34, 400, 196, 800, 58], [800, 58, 1200, 196, 1630, 34]];
  const at = ([x1, y1, cx, cy, x2, y2], t) => [
    (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2,
    (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2,
  ];
  swags.forEach((sw, si) => {
    for (let i = 0; i <= 80; i++) {
      const [x, y] = at(sw, i / 80);
      for (let k = 0; k < 4; k++) {
        const ang = Math.round(r() * 360);
        needles += `<ellipse cx="${(x + (r() - 0.5) * 22).toFixed(0)}" cy="${(y + (r() - 0.5) * 18).toFixed(0)}" rx="${(18 + r() * 10).toFixed(0)}" ry="6" transform="rotate(${ang} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${greens[Math.floor(r() * greens.length)]}"/>`;
      }
    }
    for (let i = 1; i < 10; i++) {
      const [x, y] = at(sw, i / 10);
      lights += `<circle cx="${x.toFixed(0)}" cy="${(y + 6).toFixed(0)}" r="16" fill="#ffcf7a" opacity=".28"/><circle cx="${x.toFixed(0)}" cy="${(y + 6).toFixed(0)}" r="6.5" fill="#fff1c4"/>`;
    }
    [0.22, 0.5, 0.78].forEach((t, bi) => {
      const [x, y] = at(sw, t);
      const len = 40 + ((bi + si) % 2) * 34;
      const rad = 22 + ((bi + si) % 3) * 3;
      const col = (bi + si) % 2 ? '#f2c46d' : '#d6423a';
      baubles += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} V${(y + len).toFixed(0)}" stroke="#d9a441" stroke-width="3"/>
        <rect x="${(x - 8).toFixed(0)}" y="${(y + len - 4).toFixed(0)}" width="16" height="10" rx="2" fill="#d9a441"/>
        <circle cx="${x.toFixed(0)}" cy="${(y + len + rad + 2).toFixed(0)}" r="${rad}" fill="${col}" stroke="${O}" stroke-width="3"/>
        <ellipse cx="${(x - rad * 0.35).toFixed(0)}" cy="${(y + len + rad * 0.7).toFixed(0)}" rx="5" ry="8" transform="rotate(30 ${(x - rad * 0.35).toFixed(0)} ${(y + len + rad * 0.7).toFixed(0)})" fill="#fff" opacity=".5"/>`;
    });
  });
  const bow = `<g transform="translate(800 70)">
    <path d="M0 0 C-40 -46 -92 -30 -70 6 C-60 22 -30 16 0 0Z" fill="#d6423a" stroke="#7a1f1a" stroke-width="4"/>
    <path d="M0 0 C40 -46 92 -30 70 6 C60 22 30 16 0 0Z" fill="#d6423a" stroke="#7a1f1a" stroke-width="4"/>
    <path d="M-6 6 L-34 74 L-16 66 L-6 86 L4 10Z" fill="#c43a33" stroke="#7a1f1a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M6 6 L34 74 L16 66 L6 86 L-4 10Z" fill="#c43a33" stroke="#7a1f1a" stroke-width="4" stroke-linejoin="round"/>
    <circle r="16" fill="#e0524a" stroke="#7a1f1a" stroke-width="4"/>
  </g>`;
  const flakes = [[70, 330, 1.4], [44, 520, 1], [92, 700, 1.6], [56, 880, 1.1], [1530, 340, 1.2], [1556, 540, 1.6], [1510, 720, 1], [1548, 900, 1.3], [210, 1150, 0.9], [1390, 1150, 0.9]]
    .map(([x, y, s]) => flake(x, y, s)).join('');
  const mask = 'M0 0H1600V1200H0Z M44 14 H1556 A30 30 0 0 1 1586 44 V1156 A30 30 0 0 1 1556 1186 H44 A30 30 0 0 1 14 1156 V44 A30 30 0 0 1 44 14Z';
  return svg('0 0 1600 1200', 1600, 1200, `
    <path d="${mask}" fill="#7a1d26" fill-rule="evenodd"/>
    <rect x="14" y="14" width="1572" height="1172" rx="30" fill="none" stroke="#f2c46d" stroke-width="8"/>
    <rect x="32" y="32" width="1536" height="1136" rx="20" fill="none" stroke="#fbe7b5" stroke-width="2" opacity=".75"/>
    ${flakes}
    <g>${needles}</g>${lights}${baubles}${bow}
    ${hollyCluster(96, 1100, 1)}${hollyCluster(1504, 1100, -1)}`);
}

// =========================================================
// Tiện ích: SVG → Image (để vẽ lên canvas)
// =========================================================
function svgToImage(str) {
  return loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str));
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
return { svg, starPath, kidSVG, giftSVG, treeSVG, gingerSVG, cardArt, frameSVG, svgToImage, loadImage, hatSVG, propSVG, careerCardSVG, ORNAMENTS, ornamentSVG };
})();

// ===== js/zip.js =====
__m['zip'] = (() => {
// Tạo file .zip đơn giản (không nén — ảnh JPG vốn đã nén sẵn). Không cần thư viện ngoài.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

// files: [{ name: string, data: Uint8Array }]
function makeZip(files) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, date } = dosTime(new Date());

  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);      // tên file UTF-8
    local.setUint16(8, 0, true);           // không nén
    local.setUint16(10, time, true);
    local.setUint16(12, date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true);
    local.setUint32(22, size, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    chunks.push(local, name, f.data);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true);
    cen.setUint16(12, time, true);
    cen.setUint16(14, date, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, size, true);
    cen.setUint32(24, size, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(cen, name);

    offset += 30 + name.length + size;
  }

  const cenSize = central.reduce((s, c) => s + c.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cenSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...chunks, ...central, end], { type: 'application/zip' });
}
return { makeZip };
})();

// ===== js/game1.js =====
__m['game1'] = (() => {
// Game 1 — "Con của tương lai": Thẻ ước mơ (không cần webcam)
// Bé chọn nghề → MC gõ tên, chọn bé trai/bé gái → lật thẻ có hình bé mặc đồ nghề đó.
const store = __m['storage'];
const { sfx } = __m['audio'];
const { careerCardSVG, kidSVG, frameSVG, svgToImage } = __m['art'];
const { addPhoto, allPhotos, deletePhoto, countPhotos } = __m['db'];
const { makeZip } = __m['zip'];
const { $, $$, el, esc, toast, download, sleep } = __m['ui'];

const W = 1600, H = 1200;

let root;
let career = null;         // { name, emoji, key, slug }
let kidName = '';
let gender = 'boy';
let genderTouched = false; // MC tự bấm Bé trai/Bé gái trong lần mở hộp tên này
let renaming = false;      // hộp tên đang mở để sửa tên của thẻ đã lật
let frameImg = null;
let renderSeq = 0;         // tăng mỗi lần lật thẻ mới → lần lật cũ đang chạy dở tự dừng
let saving = false;
let lastBlob = null, lastUrl = null;
let albumUrls = [];
let photos = [];
// slideshow
let ssIdx = 0, ssTimer = 0, ssPaused = false, ssFront = 0;

function init(section) {
  root = section;
  root.innerHTML = '';
  root.appendChild(el(`
    <div class="g1">
      <div class="g1-step" data-step="pick">
        <div class="g1-head">
          <div>
            <h2 class="screen-title">Con của tương lai</h2>
            <p class="screen-sub">Bé thích làm nghề gì nào? Chọn một thẻ nhé!</p>
          </div>
          <button class="btn btn-ghost" data-act="album">
            <svg viewBox="0 0 24 24" class="ico"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 8l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5z"/></svg>
            Album thẻ · <b class="album-count">0</b>
          </button>
        </div>
        <div class="career-grid"></div>
      </div>

      <div class="g1-step" data-step="card" hidden>
        <div class="stage"><div class="frame-box flip-box">
          <div class="flip">
            <div class="flip-face flip-back">
              <div class="back-inner">
                <svg viewBox="0 0 100 100" class="back-star"><path d="M50 6l12.9 26.2 28.9 4.2-20.9 20.4 4.9 28.8L50 72 24.2 85.6l4.9-28.8L8.2 36.4l28.9-4.2z"/></svg>
                <p class="back-title">Thẻ ước mơ</p>
                <p class="back-sub">Mai này con sẽ là…</p>
              </div>
            </div>
            <div class="flip-face flip-front"><img class="card-img" alt="Thẻ ước mơ"></div>
          </div>
        </div></div>
        <div class="g1-bar">
          <button class="btn btn-ghost" data-act="back-pick">
            <svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg> Đổi nghề
          </button>
          <button class="g1-who" data-act="rename" title="Đổi tên bé"></button>
          <button class="btn btn-primary btn-lg" data-act="keep" data-primary disabled>
            <svg viewBox="0 0 24 24" class="ico"><path d="M5 12l5 5 9-10"/></svg> Lưu thẻ
          </button>
        </div>
      </div>

      <div class="g1-step" data-step="album" hidden>
        <div class="g1-head">
          <div>
            <h2 class="screen-title">Album “Con của tương lai”</h2>
            <p class="screen-sub album-sub"></p>
          </div>
          <div class="g1-actions">
            <button class="btn btn-ghost" data-act="back-pick">
              <svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg> Làm thẻ tiếp
            </button>
            <button class="btn btn-ghost" data-act="zip">
              <svg viewBox="0 0 24 24" class="ico"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg> Tải cả bộ
            </button>
            <button class="btn btn-primary" data-act="slideshow" data-primary>
              <svg viewBox="0 0 24 24" class="ico"><path d="M7 5l12 7-12 7z"/></svg> Trình chiếu
            </button>
          </div>
        </div>
        <div class="album-grid"></div>
      </div>

      <div class="modal" data-modal="name" hidden>
        <div class="modal-card">
          <h3>Bé tên là gì nhỉ?</h3>
          <p class="modal-sub">MC gõ tên bé hoặc chọn bên dưới. Có thể bỏ qua.</p>
          <div class="gender-row">
            <button class="chip gender-chip" data-gender="boy">👦 Bé trai</button>
            <button class="chip gender-chip" data-gender="girl">👧 Bé gái</button>
          </div>
          <input class="text-input name-field" maxlength="24" placeholder="Tên bé…" autocomplete="off">
          <div class="chips name-chips" style="margin-top:16px"></div>
          <div class="modal-actions">
            <button class="btn btn-ghost" data-act="name-skip">Bỏ qua</button>
            <button class="btn btn-primary" data-act="name-ok" data-primary>Lật thẻ</button>
          </div>
        </div>
      </div>

      <div class="slideshow" hidden>
        <img class="ss-img" alt=""><img class="ss-img" alt="">
        <div class="ss-bar">
          <button class="icon-btn" data-act="ss-prev" title="Thẻ trước"><svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="icon-btn" data-act="ss-pause" data-primary title="Tạm dừng / tiếp tục (Space)"><svg viewBox="0 0 24 24" class="ico ss-ico-pause"><path d="M8 5v14M16 5v14"/></svg><svg viewBox="0 0 24 24" class="ico ss-ico-play"><path d="M7 5l12 7-12 7z"/></svg></button>
          <button class="icon-btn" data-act="ss-next" title="Thẻ sau"><svg viewBox="0 0 24 24" class="ico"><path d="M9 5l7 7-7 7"/></svg></button>
          <span class="ss-count"></span>
          <button class="icon-btn" data-act="ss-close" title="Đóng (Esc)"><svg viewBox="0 0 24 24" class="ico"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </div>
      </div>
    </div>`));

  root.addEventListener('click', onClick);
  const nameField = $('.name-field', root);
  nameField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmName(nameField.value); }
  });
  window.addEventListener('resize', fitStages);

  svgToImage(frameSVG()).then((img) => { frameImg = img; });
}

function enter() {
  renderCareers();
  showStep('pick');
  refreshCount();
}

function leave() {
  resetFlip();
  closeSlideshow();
  closeName();
}

function onEsc() {
  if (!$('.slideshow', root).hidden) { closeSlideshow(); return true; }
  if (!$('[data-modal="name"]', root).hidden) {
    // Đang sửa tên → Esc chỉ đóng hộp, giữ tên cũ. Lần đầu → Esc = bỏ qua tên.
    if (renaming) closeName(); else confirmName('');
    return true;
  }
  return false;
}

// ---------------------------------------------------------
function onClick(e) {
  const card = e.target.closest('.career-card');
  if (card) { pickCareer(Number(card.dataset.idx)); return; }
  const g = e.target.closest('.gender-chip');
  if (g) { setGender(g.dataset.gender); genderTouched = true; return; }
  const chip = e.target.closest('.name-chips .chip');
  if (chip) { confirmName(chip.dataset.name); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const actions = {
    album: openAlbum,
    'back-pick': () => { resetFlip(); showStep('pick'); refreshCount(); },
    rename: () => openName(true),
    keep,
    zip: downloadAll,
    slideshow: openSlideshow,
    'name-skip': () => (renaming ? closeName() : confirmName('')),
    'name-ok': () => confirmName($('.name-field', root).value),
    'ss-prev': () => ssGo(ssIdx - 1),
    'ss-next': () => ssGo(ssIdx + 1),
    'ss-pause': toggleSsPause,
    'ss-close': closeSlideshow,
    'dl-one': () => downloadOne(Number(btn.dataset.id)),
    'del-one': () => removeOne(Number(btn.dataset.id)),
  };
  actions[act]?.();
}

function showStep(name) {
  $$('.g1-step', root).forEach((s) => { s.hidden = s.dataset.step !== name; });
  requestAnimationFrame(fitStages);
}

// Giữ khung 4:3 vừa khít vùng hiển thị
function fitStages() {
  $$('.stage', root).forEach((stage) => {
    const box = $('.frame-box', stage);
    const sw = stage.clientWidth, sh = stage.clientHeight;
    if (!sw || !sh) return;
    let w = sw, h = (sw * 3) / 4;
    if (h > sh) { h = sh; w = (sh * 4) / 3; }
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;
  });
}

// ---------------- Chọn nghề ----------------
function renderCareers() {
  const list = store.careers();
  const grid = $('.career-grid', root);
  grid.style.setProperty('--cols', list.length <= 6 ? 3 : 4);
  grid.innerHTML = list.length ? list.map((c, i) => `
    <button class="career-card" data-idx="${i}">
      <div class="art">${careerCardSVG(c.key, i)}</div>
      <div class="label">${esc(c.name)} <span class="emoji">${esc(c.emoji)}</span></div>
    </button>`).join('')
    : '<p class="placeholder">Chưa có nghề nào. Vào Cài đặt để thêm danh sách nghề.</p>';
}

function pickCareer(idx) {
  career = store.careers()[idx];
  if (!career) return;
  sfx.pick();
  kidName = '';
  resetFlip();
  updateWho();
  showStep('card');
  openName(false);
}

// ---------------- Tên bé ----------------
function setGender(g) {
  gender = g === 'girl' ? 'girl' : 'boy';
  $$('.gender-chip', root).forEach((c) => c.classList.toggle('selected', c.dataset.gender === gender));
}
function openName(isRename) {
  renaming = !!isRename;
  genderTouched = false;
  const modal = $('[data-modal="name"]', root);
  const field = $('.name-field', root);
  field.value = renaming ? kidName : '';
  setGender(gender);
  $('[data-act="name-skip"]', root).textContent = renaming ? 'Huỷ' : 'Bỏ qua';
  $('.name-chips', root).innerHTML = store.kidInfo()
    .map((k) => `<button class="chip" data-name="${esc(k.name)}">${esc(k.name)}</button>`).join('');
  modal.hidden = false;
  setTimeout(() => field.focus(), 60);
}
function closeName() {
  const m = root && $('[data-modal="name"]', root);
  if (!m) return;
  $('.name-field', root).blur();   // để phím Space hoạt động ngay sau khi đóng
  m.hidden = true;
  renaming = false;
}
function confirmName(name) {
  let n = (name || '').trim();
  // Tên có trong danh sách → dùng đúng cách viết trong danh sách ("bin" → "Bin")
  // và tự chọn hình bé trai/bé gái, trừ khi MC vừa tự bấm chọn.
  const known = n && store.kidInfo().find((k) => store.normalize(k.name) === store.normalize(n));
  if (known) {
    n = known.name;
    if (known.gender && !genderTouched) setGender(known.gender);
  }
  kidName = n;
  closeName();
  updateWho();
  reveal();
}
function updateWho() {
  const who = $('.g1-who', root);
  who.innerHTML = `<span>${kidName ? esc(kidName) : 'Chưa có tên'}</span> · ${esc(career?.name || '')} ${esc(career?.emoji || '')}
    <svg viewBox="0 0 24 24" class="ico"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>`;
}

// ---------------- Lật thẻ ----------------
// Úp thẻ lại ngay (không chạy hiệu ứng lật ngược) và huỷ lần lật đang chạy dở
function resetFlip() {
  if (!root) return;
  renderSeq++;
  const flip = $('.flip', root);
  flip.style.transition = 'none';
  flip.classList.remove('flipped');
  void flip.offsetWidth;
  flip.style.transition = '';
  $('.card-img', root).removeAttribute('src');
  $('[data-act="keep"]', root).disabled = true;
  lastBlob = null;
}

async function reveal() {
  if (!career) return;
  resetFlip();
  const seq = renderSeq;
  let blob;
  try {
    blob = await renderCard();
  } catch (err) {
    console.error(err);
    if (seq === renderSeq) toast('Chưa vẽ được thẻ. Bấm vào tên bé ở dưới để thử lại nhé', 3500);
    return;
  }
  if (seq !== renderSeq) return;      // MC đã đổi tên/nghề trong lúc vẽ
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(blob);
  const img = $('.card-img', root);
  img.src = lastUrl;
  await img.decode().catch(() => {});
  await sleep(450);
  if (seq !== renderSeq) return;
  sfx.bloom();
  $('.flip', root).classList.add('flipped');
  await sleep(900);
  if (seq !== renderSeq) return;
  sfx.sparkle();
  sparkles($('.flip-box', root));
  lastBlob = blob;                    // chỉ cho lưu khi thẻ đã lật xong
  $('[data-act="keep"]', root).disabled = false;
}

function sparkles(box) {
  const r = box.getBoundingClientRect();
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('i');
    s.className = 'spark';
    const a = Math.random() * Math.PI * 2;
    const d = 120 + Math.random() * 220;
    s.style.left = `${r.left + r.width * (0.2 + Math.random() * 0.6)}px`;
    s.style.top = `${r.top + r.height * (0.25 + Math.random() * 0.5)}px`;
    s.style.setProperty('--tx', `${Math.cos(a) * d}px`);
    s.style.setProperty('--ty', `${Math.sin(a) * d}px`);
    s.style.animationDelay = `${Math.random() * 0.25}s`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}

// ---------------- Vẽ thẻ 1600×1200 ----------------
function fitFont(c, text, weight, family, size, maxW, min) {
  c.font = `${weight} ${size}px ${family}`;
  while (c.measureText(text).width > maxW && size > min) {
    size -= 4;
    c.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

async function renderCard() {
  const name = kidName || 'bé yêu';
  const job = `là ${career.name}${career.emoji ? ' ' + career.emoji : ''}`;
  const footer = `Thôi nôi bé ${store.babyName()} · Giáng sinh ${new Date().getFullYear()}`;
  const [kid] = await Promise.all([
    svgToImage(kidSVG(career.key, gender, 460, 540)),
    // Nạp đủ nét chữ tiếng Việt (ư, ơ, ố…) cho đúng các chữ sắp vẽ, tránh canvas vẽ bằng font dự phòng
    document.fonts.load('700 100px "Dancing Script"', name + job).catch(() => {}),
    document.fonts.load('600 40px "Be Vietnam Pro"', `MAI NÀY ${footer}`).catch(() => {}),
  ]);
  if (!frameImg) frameImg = await svgToImage(frameSVG());

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');

  // Nền xanh thông ấm + quầng sáng nến sau lưng bé
  const bg = c.createRadialGradient(560, 640, 80, 700, 600, 1100);
  bg.addColorStop(0, '#2c6447');
  bg.addColorStop(0.55, '#1b4431');
  bg.addColorStop(1, '#0f2a1e');
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(520, 660, 40, 520, 660, 520);
  glow.addColorStop(0, 'rgba(255, 207, 122, 0.42)');
  glow.addColorStop(1, 'rgba(255, 207, 122, 0)');
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);
  // Tuyết lấm tấm
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  c.fillStyle = 'rgba(255, 255, 255, 0.16)';
  for (let i = 0; i < 70; i++) {
    c.beginPath();
    c.arc(80 + rnd() * 1440, 260 + rnd() * 880, 2 + rnd() * 4, 0, Math.PI * 2);
    c.fill();
  }

  // Bé
  const kh = 830, kw = (kh * 460) / 540;
  c.drawImage(kid, 140, 1192 - kh, kw, kh);   // thân bé khuất dưới viền cho tự nhiên

  // Chữ bên phải
  const cx = 1150;
  const emojiFont = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji"';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = '600 40px "Be Vietnam Pro", sans-serif';
  c.fillStyle = '#fbe7b5';
  c.fillText('MAI NÀY', cx, 430);

  const fam = `"Dancing Script", ${emojiFont}, cursive`;
  fitFont(c, name, 700, fam, 170, 740, 80);
  c.save();
  c.shadowColor = 'rgba(255, 190, 100, 0.7)';
  c.shadowBlur = 30;
  c.fillStyle = '#ffcf7a';
  c.fillText(name, cx, 570);
  c.restore();

  fitFont(c, job, 700, fam, 104, 760, 56);
  c.fillStyle = '#fdf3df';
  c.fillText(job, cx, 730);

  // Dải ruy băng đỏ + dòng kỷ niệm
  const rw = 640, ry = 840;
  c.fillStyle = '#b8323a';
  c.beginPath();
  c.moveTo(cx - rw / 2 - 30, ry); c.lineTo(cx + rw / 2 + 30, ry);
  c.lineTo(cx + rw / 2 + 6, ry + 37); c.lineTo(cx + rw / 2 + 30, ry + 74);
  c.lineTo(cx - rw / 2 - 30, ry + 74); c.lineTo(cx - rw / 2 - 6, ry + 37);
  c.closePath();
  c.fill();
  c.strokeStyle = '#f2c46d';
  c.lineWidth = 3;
  c.stroke();
  c.font = '600 30px "Be Vietnam Pro", sans-serif';
  c.fillStyle = '#fdf3df';
  c.fillText(footer, cx, ry + 39);

  if (frameImg) c.drawImage(frameImg, 0, 0, W, H);
  return new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.92));
}

async function keep() {
  if (!lastBlob || saving) return;    // chặn bấm 2 lần liền → lưu trùng
  saving = true;
  const btn = $('[data-act="keep"]', root);
  btn.disabled = true;
  const blob = lastBlob;
  lastBlob = null;
  try {
    await addPhoto({ blob, name: kidName, career: career?.name || '', emoji: career?.emoji || '', ts: Date.now() });
    sfx.sparkle();
    toast('Đã lưu thẻ vào album ✨');
    resetFlip();
    showStep('pick');
    refreshCount();
  } catch (err) {
    console.error(err);
    lastBlob = blob;
    btn.disabled = false;
    toast('Chưa lưu được thẻ, thử bấm Lưu thẻ lần nữa nhé', 3500);
  } finally {
    saving = false;
  }
}

async function refreshCount() {
  try { $('.album-count', root).textContent = await countPhotos(); } catch { /* IndexedDB lỗi */ }
}

// ---------------- Album ----------------
function fileName(p, i) {
  return `${String(i + 1).padStart(2, '0')}-${store.slug(p.name || 'be')}-${store.slug(p.career || 'nghe')}.jpg`;
}

async function loadPhotos() {
  photos = (await allPhotos()).sort((a, b) => a.ts - b.ts);
  albumUrls.forEach((u) => URL.revokeObjectURL(u));
  albumUrls = photos.map((p) => URL.createObjectURL(p.blob));
}

async function openAlbum() {
  showStep('album');
  await loadPhotos();
  $('.album-sub', root).textContent = photos.length ? `${photos.length} thẻ ước mơ` : 'Chưa có thẻ nào, làm thẻ đầu tiên nhé!';
  $('[data-act="slideshow"]', root).disabled = !photos.length;
  $('[data-act="zip"]', root).disabled = !photos.length;
  $('.album-grid', root).innerHTML = photos.map((p, i) => `
    <figure class="album-item">
      <img src="${albumUrls[i]}" alt="${esc(p.name)} - ${esc(p.career)}" loading="lazy">
      <figcaption>
        <span><b>${esc(p.name || 'Bé')}</b> · ${esc(p.career)} ${esc(p.emoji)}</span>
        <span class="album-tools">
          <button class="icon-btn sm" data-act="dl-one" data-id="${p.id}" title="Tải thẻ"><svg viewBox="0 0 24 24" class="ico"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button>
          <button class="icon-btn sm" data-act="del-one" data-id="${p.id}" title="Xoá thẻ"><svg viewBox="0 0 24 24" class="ico"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg></button>
        </span>
      </figcaption>
    </figure>`).join('');
}

function downloadOne(id) {
  const i = photos.findIndex((p) => p.id === id);
  if (i >= 0) download(photos[i].blob, fileName(photos[i], i));
}

async function removeOne(id) {
  if (!confirm('Xoá thẻ này khỏi album?')) return;
  await deletePhoto(id);
  openAlbum();
}

async function downloadAll() {
  if (!photos.length) return;
  toast('Đang đóng gói thẻ…');
  const files = [];
  for (let i = 0; i < photos.length; i++) {
    files.push({ name: fileName(photos[i], i), data: new Uint8Array(await photos[i].blob.arrayBuffer()) });
  }
  download(makeZip(files), `the-uoc-mo-${store.slug(store.babyName())}.zip`);
}

// ---------------- Trình chiếu ----------------
async function openSlideshow() {
  await loadPhotos();
  if (!photos.length) return;
  const ss = $('.slideshow', root);
  ss.hidden = false;
  document.body.classList.add('immersive');
  ssPaused = false;
  ss.classList.remove('paused');
  $$('.ss-img', ss).forEach((im) => { im.classList.remove('show'); im.removeAttribute('src'); });
  ssGo(0);
}
function ssGo(i) {
  if (!photos.length) return;
  ssIdx = (i + photos.length) % photos.length;
  const imgs = $$('.ss-img', root);
  ssFront = 1 - ssFront;
  const next = imgs[ssFront], prev = imgs[1 - ssFront];
  next.src = albumUrls[ssIdx];
  next.classList.add('show');
  prev.classList.remove('show');
  $('.ss-count', root).textContent = `${ssIdx + 1} / ${photos.length}`;
  clearTimeout(ssTimer);
  if (!ssPaused) ssTimer = setTimeout(() => ssGo(ssIdx + 1), 4500);
}
function toggleSsPause() {
  ssPaused = !ssPaused;
  $('.slideshow', root).classList.toggle('paused', ssPaused);
  clearTimeout(ssTimer);
  if (!ssPaused) ssTimer = setTimeout(() => ssGo(ssIdx + 1), 2500);
}
function closeSlideshow() {
  clearTimeout(ssTimer);
  document.body.classList.remove('immersive');
  const ss = root && $('.slideshow', root);
  if (ss) ss.hidden = true;
}

// Thanh điều khiển trình chiếu chỉ hiện khi di chuột
let barTimer = 0;
function wakeBar() {
  const ss = $('.slideshow', root);
  if (!ss || ss.hidden) return;
  ss.classList.add('awake');
  clearTimeout(barTimer);
  barTimer = setTimeout(() => ss.classList.remove('awake'), 2200);
}
window.addEventListener('mousemove', wakeBar);
return { init, enter, leave, onEsc };
})();

// ===== js/game2.js =====
__m['game2'] = (() => {
// Game 2 — Cùng trang trí cây thông
const store = __m['storage'];
const { sfx } = __m['audio'];
const { treeSVG, ornamentSVG, giftSVG, ORNAMENTS } = __m['art'];
const { $, $$, el, esc, toast } = __m['ui'];

let root, treeBox, ornLayer, pile;
let drag = null;        // { type, ghost, startRect }
let pending = null;     // { type, x, y, node }

function init(section) {
  root = section;
  root.innerHTML = '';
  root.appendChild(el(`
    <div class="g2">
      <div class="g2-top">
        <div>
          <h2 class="screen-title">Cùng trang trí cây thông</h2>
          <p class="screen-sub">Kéo một món đồ lên cây — treo xong là có quà!</p>
        </div>
        <div class="g2-counter"><b class="got">0</b> / <span class="total">0</span> bạn nhỏ đã nhận quà</div>
      </div>

      <div class="g2-stage">
        <div class="greet greet-left"><span>Merry</span><span>Christmas</span></div>
        <div class="greet greet-right"><small>&amp; Chúc mừng thôi nôi</small><span class="greet-name"></span></div>
        <div class="tree-box">
          <div class="tree-art">${treeSVG()}</div>
          <div class="ornament-layer"></div>
        </div>
        <div class="gift-pile"></div>
      </div>

      <div class="g2-bottom">
        <button class="btn btn-ghost" data-act="undo" title="Gỡ món vừa treo">
          <svg viewBox="0 0 24 24" class="ico"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg> Hoàn tác
        </button>
        <div class="g2-tray">
          ${ORNAMENTS.map((o) => `
            <div class="tray-item" data-type="${o.type}" title="${esc(o.name)}">
              <div class="tray-orn">${ornamentSVG(o.type)}</div>
              <span>${esc(o.name)}</span>
            </div>`).join('')}
        </div>
        <button class="btn btn-primary" data-act="light" data-primary>
          <svg viewBox="0 0 24 24" class="ico"><path d="M12 3l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 15.4 7 18.2l1.2-5.6L4 8.8l5.6-.6z"/></svg>
          <span class="light-label">Thắp sáng cây thông</span>
        </button>
      </div>

      <div class="modal" data-modal="kid" hidden>
        <div class="modal-card">
          <h3 class="kid-title">Bạn nhỏ nào vừa treo đồ nhỉ?</h3>
          <p class="modal-sub">Chọn tên bé (tên gạch ngang là đã nhận quà) hoặc gõ tên mới.</p>
          <div class="chips kid-chips"></div>
          <div class="kid-new">
            <input class="text-input kid-field" maxlength="24" placeholder="Hoặc gõ tên bạn mới…" autocomplete="off">
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" data-act="kid-cancel">Huỷ · gỡ món đồ</button>
            <button class="btn btn-primary" data-act="kid-ok" data-primary>Tặng quà</button>
          </div>
        </div>
      </div>
    </div>`));

  treeBox = $('.tree-box', root);
  ornLayer = $('.ornament-layer', root);
  pile = $('.gift-pile', root);

  root.addEventListener('click', onClick);
  $$('.tray-item', root).forEach((it) => it.addEventListener('pointerdown', startDrag));
  $('.kid-field', root).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmKid($('.kid-field', root).value); }
  });
  window.addEventListener('resize', fitTree);
}

function enter() {
  renderAll();
  requestAnimationFrame(fitTree);
}

function leave() {
  if (pending) cancelPending();
  endDrag();
}

function onEsc() {
  if (!$('[data-modal="kid"]', root).hidden) { cancelPending(); return true; }
  return false;
}

// ---------------------------------------------------------
function onClick(e) {
  const chip = e.target.closest('.kid-chips .chip');
  if (chip && !chip.disabled) { confirmKid(chip.dataset.name); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  ({
    undo,
    light: toggleLight,
    'kid-ok': () => confirmKid($('.kid-field', root).value),
    'kid-cancel': cancelPending,
  })[btn.dataset.act]?.();
}

// Cây luôn giữ đúng tỉ lệ 600:720 và vừa khung
function fitTree() {
  const stage = $('.g2-stage', root);
  if (!stage || !stage.clientHeight) return;
  const h = Math.min(stage.clientHeight, (stage.clientWidth * 0.5 * 720) / 600);
  treeBox.style.height = `${h}px`;
  treeBox.style.width = `${(h * 600) / 720}px`;
  root.style.setProperty('--gift', `${Math.max(38, Math.min(68, h * 0.095))}px`);
}

// ---------------- Dữ liệu ----------------
const treeState = () => store.getState().tree;
const received = () => treeState().items.map((i) => i.kid);
const isReceived = (name) => received().some((k) => store.normalize(k) === store.normalize(name));

function totals() {
  const list = store.kids();
  const known = new Set(list.map(store.normalize));
  const extra = new Set(received().map(store.normalize).filter((k) => !known.has(k)));
  return { got: treeState().items.length, total: list.length + extra.size };
}

function renderAll() {
  ornLayer.innerHTML = '';
  pile.innerHTML = '';
  treeState().items.forEach((it, i) => {
    ornLayer.appendChild(makeOrnament(it, false));
    pile.appendChild(makeGift(it, i, false));
  });
  $('.greet-name', root).textContent = store.babyName();
  setLit(treeState().lit, false);
  updateCounter();
}

function updateCounter() {
  const { got, total } = totals();
  $('.got', root).textContent = got;
  $('.total', root).textContent = total;
  $('.g2-counter', root).classList.toggle('done', total > 0 && got >= total);
  $('[data-act="undo"]', root).disabled = !treeState().items.length;
}

function makeOrnament(it, animate) {
  const n = el(`
    <div class="orn ${animate ? 'swing' : ''}" ${it.id ? `data-id="${it.id}"` : ''} style="left:${it.x}%;top:${it.y}%">
      <div class="orn-art">${ornamentSVG(it.type)}</div>
      ${it.kid ? `<span class="orn-name">${esc(it.kid)}</span>` : ''}
    </div>`);
  return n;
}

// Xếp quà thành từng hàng dưới gốc cây (hàng dưới nhiều, hàng trên ít dần)
function giftSlot(i) {
  let row = 0, cap = 8, start = 0;
  while (i >= start + cap) { start += cap; row++; cap = Math.max(3, 8 - row); }
  const k = i - start;
  const dx = (k - (cap - 1) / 2) * 1.12 + (row % 2 ? 0.25 : 0);
  return { dx, dy: row * 0.62, row };
}

function makeGift(it, i, animate) {
  const { dx, dy, row } = giftSlot(i);
  const n = el(`
    <div class="gift ${animate ? 'drop' : ''}" data-id="${it.id}" style="--dx:${dx};--dy:${dy};z-index:${50 - row}">
      <div class="gift-art">${giftSVG(it.color ?? i)}</div>
      <span class="gift-tag">${esc(it.kid)}</span>
    </div>`);
  return n;
}

// ---------------- Kéo thả ----------------
function startDrag(e) {
  if (pending || treeState().lit) return;
  e.preventDefault();
  const item = e.currentTarget;
  const rect = $('.tray-orn', item).getBoundingClientRect();
  const size = Math.max(64, treeBox.getBoundingClientRect().width * 0.12);
  const ghost = el(`<div class="drag-ghost" style="width:${size}px;height:${size * 1.1}px">${ornamentSVG(item.dataset.type)}</div>`);
  document.body.appendChild(ghost);
  drag = { type: item.dataset.type, ghost, startRect: rect, size };
  moveGhost(e.clientX, e.clientY);
  item.classList.add('picked');
  sfx.pick();
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd, { once: true });
  window.addEventListener('pointercancel', onDragEnd, { once: true });
}

function moveGhost(x, y) {
  drag.ghost.style.transform = `translate(${x - drag.size / 2}px, ${y - drag.size * 0.55}px)`;
  const over = overTree(x, y);
  drag.ghost.classList.toggle('over', over);
}

function onDragMove(e) { if (drag) moveGhost(e.clientX, e.clientY); }

function overTree(x, y) {
  return document.elementsFromPoint(x, y).some((n) => n.classList && n.classList.contains('tree-hit'));
}

function onDragEnd(e) {
  window.removeEventListener('pointermove', onDragMove);
  if (!drag) return;
  const { type, ghost, startRect, size } = drag;
  $$('.tray-item', root).forEach((t) => t.classList.remove('picked'));
  // (cây đã thắp sáng giữa lúc đang kéo, ví dụ bấm Space → không treo nữa)
  if (e.type === 'pointerup' && !treeState().lit && overTree(e.clientX, e.clientY)) {
    const r = treeBox.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    ghost.remove();
    drag = null;
    placePending(type, x, y);
  } else {
    // không thả trúng cây: món đồ bay về khay
    ghost.classList.add('return');
    ghost.style.transform = `translate(${startRect.left + startRect.width / 2 - size / 2}px, ${startRect.top + startRect.height / 2 - size * 0.55}px) scale(.6)`;
    ghost.style.opacity = '0';
    setTimeout(() => ghost.remove(), 450);
    drag = null;
    if (e.type === 'pointerup') toast('Thả món đồ vào trong cây thông nhé!');
  }
}

// Rời màn hình giữa lúc đang kéo: dọn món đồ đang cầm, trả khay về bình thường
function endDrag() {
  if (!drag) return;
  drag.ghost.remove();
  drag = null;
  window.removeEventListener('pointermove', onDragMove);
  $$('.tray-item', root).forEach((t) => t.classList.remove('picked'));
}

// ---------------- Chọn tên bé ----------------
function placePending(type, x, y) {
  const node = makeOrnament({ type, x, y }, true);
  ornLayer.appendChild(node);
  sfx.drop();
  pending = { type, x, y, node };
  openKid(type);
}

function openKid(type) {
  const orn = ORNAMENTS.find((o) => o.type === type);
  $('.kid-title', root).textContent = `Bạn nhỏ nào vừa treo ${orn ? orn.name.toLowerCase() : 'đồ trang trí'}?`;
  const kids = store.kids();
  $('.kid-chips', root).innerHTML = kids.length
    ? kids.map((k) => `<button class="chip" data-name="${esc(k)}" ${isReceived(k) ? 'disabled' : ''}>${esc(k)}</button>`).join('')
    : '<p class="modal-sub">Chưa có danh sách các bé — gõ tên bên dưới nhé.</p>';
  const field = $('.kid-field', root);
  field.value = '';
  $('[data-modal="kid"]', root).hidden = false;
}

function closeKid() {
  $('.kid-field', root).blur();
  $('[data-modal="kid"]', root).hidden = true;
}

function cancelPending() {
  if (!pending) { closeKid(); return; }
  const n = pending.node;
  n.classList.add('fade-out');
  setTimeout(() => n.remove(), 400);
  pending = null;
  closeKid();
}

function confirmKid(raw) {
  const typed = (raw || '').trim();
  if (!pending) return;
  if (!typed) { $('.kid-field', root).focus(); toast('Chọn hoặc gõ tên bé nhé'); return; }
  // Gõ tay tên có trong danh sách → dùng đúng cách viết trong danh sách ("bin" → "Bin")
  const name = store.kids().find((k) => store.normalize(k) === store.normalize(typed)) || typed;
  if (isReceived(name)) { toast(`Bạn ${name} đã nhận quà rồi`); return; }

  const items = treeState().items;
  const item = {
    id: Date.now(),
    type: pending.type,
    x: +pending.x.toFixed(2),
    y: +pending.y.toFixed(2),
    kid: name,
    color: Math.floor(Math.random() * 7),
  };
  const index = items.length;
  store.update((s) => { s.tree.items.push(item); });

  // gắn tên dưới món đồ vừa treo
  pending.node.dataset.id = item.id;
  pending.node.insertAdjacentHTML('beforeend', `<span class="orn-name">${esc(name)}</span>`);
  pending = null;
  closeKid();

  // hộp quà rơi nhẹ xuống gốc cây
  const gift = makeGift(item, index, true);
  pile.appendChild(gift);
  setTimeout(() => { sfx.drop(); sparkleAt(gift); }, 1050);
  setTimeout(() => sfx.sparkle(), 1250);
  updateCounter();
}

function sparkleAt(node) {
  const r = node.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('i');
    s.className = 'spark';
    const a = (i / 10) * Math.PI * 2;
    s.style.left = `${r.left + r.width / 2}px`;
    s.style.top = `${r.top + r.height / 2}px`;
    s.style.setProperty('--tx', `${Math.cos(a) * (40 + Math.random() * 30)}px`);
    s.style.setProperty('--ty', `${Math.sin(a) * (30 + Math.random() * 30) - 20}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1200);
  }
}

// ---------------- Hoàn tác ----------------
function undo() {
  const items = treeState().items;
  if (!items.length) return;
  const last = items[items.length - 1];
  store.update((s) => { s.tree.items.pop(); });
  // Gỡ đúng món đồ + hộp quà của lượt này (theo id), kể cả khi bấm Hoàn tác liên tục
  [$(`.orn[data-id="${last.id}"]`, ornLayer), $(`.gift[data-id="${last.id}"]`, pile)].forEach((n) => {
    if (!n) return;
    n.removeAttribute('data-id');
    n.classList.add('fade-out');
    setTimeout(() => n.remove(), 400);
  });
  updateCounter();
  toast(`Đã gỡ món đồ của ${last.kid}`);
}

// ---------------- Thắp sáng ----------------
function toggleLight() {
  const on = !treeState().lit;
  store.update((s) => { s.tree.lit = on; });
  setLit(on, true);
}

function setLit(on, withSound) {
  root.querySelector('.g2').classList.toggle('lit', on);
  $('.light-label', root).textContent = on ? 'Tắt đèn cây thông' : 'Thắp sáng cây thông';
  if (on && withSound) sfx.bloom();
}
return { init, enter, leave, onEsc };
})();

// ===== js/game3.js =====
__m['game3'] = (() => {
// Game 3 — Lò nướng bánh gừng may mắn
const store = __m['storage'];
const { sfx } = __m['audio'];
const { gingerSVG } = __m['art'];
const { $, $$, el, esc, sleep, randInt, shuffle } = __m['ui'];

const TABLE_MODE_FROM = 31;     // trên 30 khách: bánh hiện số bàn
const BAKE_MS = 6000;

let root, tray;
let active = false;             // đang ở màn hình lò nướng
let baking = false;
let bakeId = 0;                 // tăng khi huỷ lượt nướng (rời màn hình giữa chừng)
let shuffleTimer = 0;
let lastWinner = null;          // lượt vừa bốc (để Bốc lại)

function init(section) {
  root = section;
  root.innerHTML = '';
  root.appendChild(el(`
    <div class="g3">
      <div class="g3-kitchen">
        <div class="kitchen-lights"></div>
        <div class="oven">
          <div class="oven-panel">
            <span class="knob"></span><span class="knob"></span>
            <div class="oven-display"><span class="temp">0</span>°C</div>
            <span class="knob"></span>
          </div>
          <div class="oven-body">
            <div class="oven-cavity">
              <div class="oven-glow"></div>
              <div class="oven-rack"></div>
              <div class="cookie-tray"></div>
            </div>
            <div class="oven-door">
              <div class="door-handle"></div>
              <div class="door-glass"></div>
            </div>
          </div>
        </div>
        <div class="counter-top"></div>
      </div>

      <aside class="g3-side">
        <h2 class="screen-title">Lò nướng bánh gừng may mắn</h2>
        <div class="prize-card">
          <p class="prize-kicker">Đang bốc</p>
          <h3 class="prize-name"></h3>
          <p class="prize-gift"></p>
          <p class="prize-round"></p>
        </div>
        <button class="btn btn-primary btn-lg bake-btn" data-act="bake" data-primary>
          <svg viewBox="0 0 24 24" class="ico"><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 2 2 2 3 1-2 1-4 1-7z"/></svg>
          Nướng bánh
        </button>
        <div class="winners">
          <h4>Đã trúng</h4>
          <ol class="winner-list"></ol>
          <p class="absent-list"></p>
        </div>
      </aside>

      <div class="reveal" hidden>
        <div class="reveal-cookie">${gingerSVG()}<span class="reveal-cookie-tag"></span></div>
        <div class="reveal-card">
          <p class="reveal-prize"></p>
          <h2 class="reveal-name"></h2>
          <p class="reveal-table"></p>
          <div class="reveal-actions">
            <button class="btn btn-ghost" data-act="redraw" title="Người trúng không có mặt">
              <svg viewBox="0 0 24 24" class="ico"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg> Bốc lại (vắng mặt)
            </button>
            <button class="btn btn-primary" data-act="next" data-primary>Tiếp tục</button>
          </div>
        </div>
      </div>
    </div>`));

  tray = $('.cookie-tray', root);
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    ({ bake, redraw, next: closeReveal })[b.dataset.act]?.();
  });
  window.addEventListener('resize', () => { if (!baking) layoutCookies(); });
}

function enter() {
  active = true;
  render();
}

// Rời màn hình khi đang nướng → huỷ lượt đó (chưa ai trúng), lần sau vào lại nướng từ đầu
function leave() {
  active = false;
  if (baking) { bakeId++; baking = false; }
  clearInterval(shuffleTimer);
}

function onEsc() {
  if (!$('.reveal', root).hidden) { closeReveal(); return true; }
  return baking; // đang nướng thì không thoát ngang
}

// ---------------- Dữ liệu ----------------
const ovenState = () => store.getState().oven;

function pool() {
  const o = ovenState();
  const out = new Set([...o.winners.map((w) => w.id), ...o.absent.map((a) => a.id)]);
  return store.guests().filter((g) => !out.has(g.id));
}
const tableMode = () => store.guests().length >= TABLE_MODE_FROM;
// Chữ trên bánh: số bàn (khi đông khách) hoặc tên. Khách không ghi bàn thì hiện tên.
const cookieLabel = (g) => (tableMode() ? (g.tableNo ? `Bàn ${g.tableNo}` : (g.table || g.name)) : g.name);

// Lượt đang bốc = lượt đầu tiên (theo thứ tự giải thấp → cao) chưa đủ người trúng.
// Đếm theo từng giải nên vẫn đúng khi MC sửa số lượng / thứ tự giải giữa chừng.
function currentSlot() {
  const slots = store.prizeSlots();
  const won = new Map();
  ovenState().winners.forEach((w) => won.set(w.prize, (won.get(w.prize) || 0) + 1));
  const need = new Map();
  const slot = slots.find((s) => {
    const k = (need.get(s.label) || 0) + 1;
    need.set(s.label, k);
    return (won.get(s.label) || 0) < k;
  }) || null;
  return { slot, total: slots.length };
}

// ---------------- Hiển thị ----------------
function render() {
  renderPrize();
  renderWinners();
  renderCookies();
  $('.temp', root).textContent = '0';
  root.querySelector('.g3').classList.remove('baking', 'open');
}

function renderPrize() {
  const { slot } = currentSlot();
  const p = pool();
  const btn = $('[data-act="bake"]', root);
  if (!store.prizeSlots().length) {
    setPrize('Chưa có giải', 'Vào Cài đặt để nhập danh sách giải thưởng', '');
    btn.disabled = true;
  } else if (!store.guests().length) {
    setPrize('Chưa có khách', 'Vào Cài đặt để nhập danh sách khách mời', '');
    btn.disabled = true;
  } else if (!slot) {
    setPrize('Đã trao hết giải 🎉', 'Cảm ơn cả nhà đã tham gia!', '');
    btn.disabled = true;
  } else if (!p.length) {
    setPrize(slot.name, slot.gift, 'Không còn khách nào trong lò');
    btn.disabled = true;
  } else {
    setPrize(slot.name, slot.gift, `${slot.qty > 1 ? `Lượt ${slot.round} / ${slot.qty} · ` : ''}Còn ${p.length} khách trong lò`);
    btn.disabled = false;
  }
}
function setPrize(name, gift, round) {
  $('.prize-name', root).textContent = name;
  $('.prize-gift', root).textContent = gift;
  $('.prize-round', root).textContent = round;
}

function renderWinners() {
  const o = ovenState();
  $('.winner-list', root).innerHTML = o.winners.length
    ? o.winners.slice().reverse().map((w, i) => `
      <li class="${i === 0 ? 'newest' : ''}">
        <span class="w-prize" title="${esc(w.prize)}">${esc(w.prizeName || w.prize)}</span>
        <span class="w-name">${esc(w.name)}</span>
        <span class="w-table">${esc(w.table)}</span>
      </li>`).join('')
    : '<li class="empty">Chưa có ai — bấm “Nướng bánh” để bắt đầu!</li>';
  $('.absent-list', root).textContent = o.absent.length
    ? `Vắng mặt: ${o.absent.map((a) => a.name).join(', ')}` : '';
}

function cookieLabels() {
  const p = pool();
  if (tableMode()) {
    const seen = new Set();
    const tables = [];
    for (const g of shuffle(p)) {
      const l = cookieLabel(g);
      if (!seen.has(l)) { seen.add(l); tables.push(l); }
    }
    return tables.slice(0, 18);
  }
  return shuffle(p).slice(0, 30).map((g) => g.name);
}

function renderCookies() {
  const labels = cookieLabels();
  tray.innerHTML = labels.map((l, i) => `
    <div class="cookie" data-slot="${i}" style="--bob:${(i * 0.13) % 0.6}s">
      <div class="ck-art">${gingerSVG()}</div>
      <span class="ck-tag">${esc(l)}</span>
    </div>`).join('');
  tray.dataset.empty = labels.length ? '' : 'Lò trống';
  layoutCookies();
}

function grid(n) {
  const cols = n <= 4 ? n : n <= 8 ? 4 : n <= 15 ? 5 : 6;
  return { cols: Math.max(cols, 1), rows: Math.max(1, Math.ceil(n / Math.max(cols, 1))) };
}

function layoutCookies(order) {
  const cookies = $$('.cookie', tray);
  const n = cookies.length;
  if (!n) return;
  const { cols, rows } = grid(n);
  const tw = tray.clientWidth, th = tray.clientHeight;
  const cw = Math.min((tw / cols) * 0.78, ((th / rows) * 0.78 * 200) / 240);
  tray.style.setProperty('--cw', `${cw}px`);
  cookies.forEach((c, i) => {
    const s = order ? order[i] : Number(c.dataset.slot);
    const col = s % cols, row = Math.floor(s / cols);
    const inRow = row === rows - 1 ? n - row * cols : cols;      // căn giữa hàng cuối
    const offset = (cols - inRow) / 2;
    c.style.left = `${((col + offset + 0.5) / cols) * 100}%`;
    c.style.top = `${((row + 0.5) / rows) * 100}%`;
  });
}

// ---------------- Nướng & bốc ----------------
async function bake() {
  if (baking || !active) return;
  const { slot } = currentSlot();
  const p = pool();
  if (!slot || !p.length) return;
  baking = true;
  const id = ++bakeId;
  const cancelled = () => id !== bakeId;
  lastWinner = null;
  const g3 = root.querySelector('.g3');
  $('[data-act="bake"]', root).disabled = true;
  g3.classList.remove('open');
  g3.classList.add('baking');
  sfx.bake();

  // nhiệt độ tăng dần
  const temp = $('.temp', root);
  const t0 = performance.now();
  const tick = () => {
    const k = Math.min(1, (performance.now() - t0) / (BAKE_MS - 400));
    temp.textContent = Math.round(180 * (1 - Math.pow(1 - k, 2)));
    if (k < 1 && baking) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // bánh nhún nhảy và đổi chỗ
  const n = $$('.cookie', tray).length;
  shuffleTimer = setInterval(() => layoutCookies(shuffle([...Array(n).keys()])), 650);
  await sleep(BAKE_MS - 600);
  if (cancelled()) return;
  clearInterval(shuffleTimer);
  await sleep(600);
  if (cancelled()) return;

  // ting! cửa lò mở
  sfx.ting();
  g3.classList.add('open');
  await sleep(700);
  if (cancelled()) return;

  // chọn người trúng
  const winner = p[randInt(p.length)];
  const label = cookieLabel(winner);
  const cookies = $$('.cookie', tray);
  let src = cookies.find((c) => $('.ck-tag', c).textContent === label) || cookies[randInt(cookies.length)];
  $('.ck-tag', src).textContent = label;

  lastWinner = { id: winner.id, name: winner.name, table: winner.table, prize: slot.label, prizeName: slot.name, at: Date.now() };
  store.update((s) => { s.oven.winners.push(lastWinner); });

  showReveal(src, lastWinner, label);
  baking = false;
}

function showReveal(src, w, label) {
  const rv = $('.reveal', root);
  const big = $('.reveal-cookie', rv);
  $('.reveal-cookie-tag', rv).textContent = label;
  $('.reveal-prize', rv).textContent = w.prize;
  $('.reveal-name', rv).textContent = w.name;
  $('.reveal-table', rv).textContent = w.table || '';
  rv.hidden = false;
  rv.classList.remove('shown');

  // bánh bay từ trong lò ra giữa màn hình
  const s = src.getBoundingClientRect();
  src.style.visibility = 'hidden';
  big.style.transition = 'none';
  const b = big.getBoundingClientRect();
  const dx = s.left + s.width / 2 - (b.left + b.width / 2);
  const dy = s.top + s.height / 2 - (b.top + b.height / 2);
  big.style.transform = `translate(${dx}px, ${dy}px) scale(${s.width / b.width})`;
  void big.offsetWidth;
  big.style.transition = 'transform 1.1s cubic-bezier(.2,.8,.25,1)';
  big.style.transform = 'none';
  setTimeout(() => { rv.classList.add('shown'); sfx.sparkle(); }, 750);
}

function hideReveal() {
  const rv = $('.reveal', root);
  rv.hidden = true;
  rv.classList.remove('shown');
}

function closeReveal() {
  hideReveal();
  lastWinner = null;
  render();
}

// Người trúng vắng mặt → ghi "vắng", bốc lại cho chính giải này
async function redraw() {
  if (!lastWinner) return;
  const w = lastWinner;
  store.update((s) => {
    s.oven.winners = s.oven.winners.filter((x) => x.at !== w.at);
    s.oven.absent.push({ id: w.id, name: w.name, table: w.table });
  });
  hideReveal();
  lastWinner = null;
  render();
  await sleep(500);
  if (active) bake();
}
return { init, enter, leave, onEsc };
})();

// ===== js/snow.js =====
__m['snow'] = (() => {
// Tuyết rơi thưa, chậm, không nhấp nháy.
function startSnow(canvas) {
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1, flakes = [];

  function makeFlake(randomY = true) {
    const depth = Math.random();            // 0 = xa, 1 = gần
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -10,
      r: 0.8 + depth * 2.6,
      vy: (0.18 + depth * 0.55) * (reduce ? 0.4 : 1),
      sway: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      a: 0.25 + depth * 0.5,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round((w * h) / 26000);   // thưa
    while (flakes.length < target) flakes.push(makeFlake());
    flakes.length = Math.min(flakes.length, target);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last) / 16.7;
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.phase += 0.008 * dt;
      f.y += f.vy * dt;
      f.x += Math.sin(f.phase) * 0.18 * f.sway * dt;
      if (f.y > h + 10) Object.assign(f, makeFlake(false));
      if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 250, 240, ${f.a})`;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}
return { startSnow };
})();

// ===== js/app.js =====
__m['app'] = (() => {
// Khung chính: điều hướng màn hình, phím tắt, nhạc, toàn màn hình.
const store = __m['storage'];
const audio = __m['audio'];
const { startSnow } = __m['snow'];
const { cardArt } = __m['art'];
const { $, $$ } = __m['ui'];
const settingsScreen = __m['settings'];
const game1 = __m['game1'];
const game2 = __m['game2'];
const game3 = __m['game3'];

const SCREENS = {
  home: { el: '#screen-home' },
  settings: { el: '#screen-settings', mod: settingsScreen },
  photobooth: { el: '#screen-photobooth', mod: game1 },
  tree: { el: '#screen-tree', mod: game2 },
  oven: { el: '#screen-oven', mod: game3 },
};

let current = null;
const inited = new Set();

function bindHome() {
  $$('[data-bind="babyName"]').forEach((n) => { n.textContent = store.babyName(); });
  document.title = `Thôi nôi bé ${store.babyName()} · Mini game Giáng sinh`;
}

function go(name) {
  if (!SCREENS[name]) name = 'home';
  if (name === current) return;
  const prev = current && SCREENS[current];
  if (prev?.mod?.leave) prev.mod.leave();
  $$('.screen').forEach((s) => s.classList.remove('active'));

  const scr = SCREENS[name];
  const section = $(scr.el);
  if (scr.mod && !inited.has(name)) { scr.mod.init(section); inited.add(name); }
  section.classList.add('active');
  current = name;
  $('#btnBack').hidden = name === 'home';
  if (name === 'home') bindHome();
  if (scr.mod?.enter) scr.mod.enter();
}

function route() { go((location.hash || '#home').slice(1)); }

// ---------- Nhạc ----------
const btnMusic = $('#btnMusic');
function setMusic(on) {
  store.update((s) => { s.musicOn = on; });
  btnMusic.setAttribute('aria-pressed', String(on));
  if (on) audio.startMusic(); else audio.stopMusic();
}
btnMusic.addEventListener('click', () => setMusic(!audio.isPlaying()));
btnMusic.setAttribute('aria-pressed', String(!!store.getState().musicOn));
// Trình duyệt chỉ cho phát âm thanh sau thao tác đầu tiên của người dùng
function firstGesture() {
  audio.unlock();
  if (store.getState().musicOn && !audio.isPlaying()) audio.startMusic();
  window.removeEventListener('pointerdown', firstGesture);
  window.removeEventListener('keydown', firstGesture);
}
window.addEventListener('pointerdown', firstGesture);
window.addEventListener('keydown', firstGesture);

// ---------- Toàn màn hình ----------
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}
$('#btnFull').addEventListener('click', toggleFullscreen);
$('#btnSettings').addEventListener('click', () => { location.hash = '#settings'; });
$('#btnBack').addEventListener('click', () => { location.hash = '#home'; });

// ---------- Phím tắt ----------
function isTyping(t) {
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}
function visible(n) { return n.getClientRects().length > 0 && !n.closest('[hidden]'); }

window.addEventListener('keydown', (e) => {
  const typing = isTyping(e.target);
  if (e.key === 'Escape') {
    const mod = SCREENS[current]?.mod;
    if (mod?.onEsc && mod.onEsc()) { e.preventDefault(); return; }
    if (typing) e.target.blur();
    if (current !== 'home') location.hash = '#home';
    return;
  }
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    const section = $(SCREENS[current].el);
    const targets = $$('[data-primary]', section).filter((b) => visible(b) && !b.disabled);
    const btn = targets[targets.length - 1];
    if (btn) btn.click();
    else if (current === 'home') location.hash = '#photobooth';
    return;
  }
  const k = e.key.toLowerCase();
  if (k === 'f') { toggleFullscreen(); return; }
  if (k === 'm') { setMusic(!audio.isPlaying()); return; }
  if (current === 'home' && ['1', '2', '3'].includes(e.key)) {
    location.hash = ['#photobooth', '#tree', '#oven'][Number(e.key) - 1];
  }
});

// ---------- Khởi động ----------
$$('[data-art]').forEach((n) => { n.innerHTML = cardArt(n.dataset.art); });
startSnow($('#snow'));
store.onChange(() => { if (current === 'home') bindHome(); });
window.addEventListener('hashchange', route);
route();
return {  };
})();
})();
