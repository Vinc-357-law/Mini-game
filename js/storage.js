// Lưu & đọc dữ liệu trong localStorage (cài đặt + tiến độ các game).
// Ảnh chụp lưu riêng trong IndexedDB (xem db.js) vì dung lượng lớn.

const KEY = 'thoinoi-xmas.v1';

const SAMPLE_GUESTS = [
  'Ông bà nội | Bàn 1', 'Ông bà ngoại | Bàn 1', 'Bác Tâm | Bàn 2', 'Cô Hạnh | Bàn 2',
  'Chú Hùng | Bàn 3', 'Dì Mai | Bàn 3', 'Anh Khoa | Bàn 4', 'Chị Thảo | Bàn 4',
  'Cậu Long | Bàn 5', 'Mợ Lan | Bàn 5', 'Gia đình bé Bin | Bàn 6', 'Gia đình bé Bống | Bàn 6',
  'Anh Tuấn | Bàn 7', 'Chị Ngọc | Bàn 7', 'Chú Phát | Bàn 8', 'Cô Vy | Bàn 8',
];

export const SAMPLE = {
  babyName: 'Na',
  careers: [
    'Bác sĩ | 🩺', 'Phi hành gia | 🚀', 'Đầu bếp | 🍳', 'Lính cứu hỏa | 🚒',
    'Họa sĩ | 🎨', 'Ca sĩ | 🎤', 'Cảnh sát | 👮', 'Giáo viên | 📚',
  ].join('\n'),
  kids: ['Bin', 'Bống', 'Cà Rốt', 'Su Su', 'Mít', 'Gạo', 'Tôm', 'Nấm', 'Bơ', 'Kem', 'Sóc', 'Na Na'].join('\n'),
  guests: SAMPLE_GUESTS.join('\n'),
  prizes: [
    'Giải Khuyến khích | 1 phần quà nhỏ | 3',
    'Giải Ba | 1 phần quà | 2',
    'Giải Nhì | 1 hộp quà lớn | 1',
    'Giải Nhất | 1 phần quà đặc biệt | 1',
  ].join('\n'),
  faceTracking: false,
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

export const getState = () => state;
export const settings = () => state.settings;

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Không lưu được', e); }
  listeners.forEach((fn) => fn(state));
}
export function update(fn) { fn(state); save(); }
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function resetTree() { update((s) => { s.tree = { items: [], lit: false }; }); }
export function resetOven() { update((s) => { s.oven = { winners: [], absent: [] }; }); }
export function resetSettingsToSample() { update((s) => { s.settings = { ...SAMPLE }; }); }

export function exportJSON() {
  return JSON.stringify({ app: 'thoinoi-xmas', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2);
}
export function importJSON(text) {
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
export const lines = (text) => (text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const parts = (line) => line.split('|').map((s) => s.trim());

export function normalize(str) {
  return (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
export function slug(str) {
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
export function careerKey(name) {
  const n = normalize(name);
  const hit = CAREER_KEYS.find(([k]) => n.includes(k));
  return hit ? hit[1] : 'generic';
}

export function babyName() {
  return (state.settings.babyName || '').trim() || 'bé';
}

export function careers() {
  return lines(state.settings.careers).map((l) => {
    const [name, emoji = ''] = parts(l);
    return { name, emoji, key: careerKey(name), slug: slug(name) };
  });
}

export function kids() {
  const seen = new Set();
  return lines(state.settings.kids).filter((n) => {
    const k = normalize(n);
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

export function guests() {
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
export function prizeSlots() {
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
