// Game 3 — Lò nướng bánh gừng may mắn
import * as store from './storage.js';
import { sfx } from './audio.js';
import { gingerSVG } from './art.js';
import { $, $$, el, esc, sleep, randInt, shuffle } from './ui.js';

const TABLE_MODE_FROM = 31;     // trên 30 khách: bánh hiện số bàn
const BAKE_MS = 6000;

let root, tray;
let baking = false;
let shuffleTimer = 0;
let lastWinner = null;          // lượt vừa bốc (để Bốc lại)

export function init(section) {
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

export function enter() {
  if (!baking) render();
}

export function leave() {
  clearInterval(shuffleTimer);
}

export function onEsc() {
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
function currentSlot() {
  const slots = store.prizeSlots();
  return { slot: slots[ovenState().winners.length] || null, total: slots.length };
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
      const t = g.tableNo || g.table || '?';
      if (!seen.has(t)) { seen.add(t); tables.push(g.tableNo ? `Bàn ${g.tableNo}` : (g.table || '?')); }
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
  if (baking) return;
  const { slot } = currentSlot();
  const p = pool();
  if (!slot || !p.length) return;
  baking = true;
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
  clearInterval(shuffleTimer);
  await sleep(600);

  // ting! cửa lò mở
  sfx.ting();
  g3.classList.add('open');
  await sleep(700);

  // chọn người trúng
  const winner = p[randInt(p.length)];
  const label = tableMode() ? (winner.tableNo ? `Bàn ${winner.tableNo}` : winner.table) : winner.name;
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
  bake();
}
