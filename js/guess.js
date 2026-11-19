// Game 1 — "Đoán xem bé bốc gì?"
// Khách quét mã QR đoán nghề bé thôi nôi sẽ bốc (lưu vào Google Sheet), màn hình lớn hiện biểu đồ trực tiếp.
// Chủ tiệc: Khoá bình chọn → "Bé bốc đồ!" → bấm nghề bé đã bốc → công bố + danh sách người đoán đúng.
import * as store from './storage.js';
import { sfx } from './audio.js';
import { kidSVG } from './art.js';
import * as gs from './vote.js';
import { $, $$, el, esc, toast } from './ui.js';

const POLL_MS = 4000;
const STEPS = ['guess', 'drum', 'reveal'];
let root, hooks;
let active = false;
let step = '';
let pollTimer = 0;
let last = null;           // trạng thái mới nhất từ Google Sheet
let online = false;
let lastError = '';
let setupDone = false;
let seen = new Set();      // phiếu đã hiện ở dòng "vừa đoán"
let firstLoad = true;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function mount(container, h) {
  root = container;
  hooks = h;      // { showStep, sparkles, makeBabyCard }
  root.appendChild(el(`
    <div class="g1-step gs-guess" data-step="guess" hidden>
      <div class="g1-head">
        <div>
          <h2 class="screen-title">Đoán xem bé bốc gì?</h2>
          <p class="screen-sub gs-status">Đang kết nối…</p>
        </div>
        <div class="g1-actions">
          <button class="btn btn-ghost" data-gact="back">← Thẻ ước mơ</button>
          <button class="btn btn-ghost" data-gact="lock">🔒 Khoá bình chọn</button>
          <button class="btn btn-primary" data-gact="drum">🎁 Bé bốc đồ!</button>
        </div>
      </div>
      <div class="gs-body">
        <div class="gs-qr-card">
          <p class="gs-qr-title">Quét mã để đoán xem<br><b class="gs-baby"></b> sẽ bốc gì!</p>
          <div class="gs-qr"></div>
          <p class="gs-qr-note">Mở camera điện thoại để quét · cần 4G hoặc Wi-Fi</p>
        </div>
        <div class="gs-board">
          <div class="gs-total"><b>0</b> người đã đoán</div>
          <div class="gs-chart"></div>
          <div class="gs-ticker" aria-live="polite"></div>
        </div>
      </div>
    </div>`));
  root.appendChild(el(`
    <div class="g1-step gs-drum" data-step="drum" hidden>
      <div class="drum-stage">
        <div class="drum-ring" aria-hidden="true"></div>
        <h2 class="drum-title"></h2>
        <p class="drum-sub">Bé bốc xong, chủ tiệc bấm vào món bé đã chọn nhé:</p>
        <div class="drum-grid"></div>
      </div>
      <div class="g1-bar">
        <button class="btn btn-ghost" data-gact="undrum">← Quay lại bình chọn</button>
        <span class="drum-note"></span>
        <span></span>
      </div>
    </div>`));
  root.appendChild(el(`
    <div class="g1-step gs-reveal" data-step="reveal" hidden>
      <div class="rv-wrap">
        <div class="rv-kid"></div>
        <div class="rv-info">
          <p class="rv-kicker"></p>
          <h2 class="rv-career"></h2>
          <p class="rv-stat"></p>
          <div class="rv-names"></div>
          <div class="rv-actions">
            <button class="btn btn-primary btn-lg" data-gact="card">✨ Tạo thẻ ước mơ cho bé</button>
            <button class="btn btn-ghost" data-gact="repick">Chọn lại</button>
            <button class="btn btn-ghost" data-gact="back">Xong</button>
          </div>
        </div>
      </div>
    </div>`));
  root.addEventListener('click', onClick);
}

// Mở phần đoán (nút "Đoán bé bốc gì" ở Game 1)
export function open() {
  active = true;
  setupDone = false;
  firstLoad = true;
  seen = new Set();
  const pick = store.getState().pick;
  show(pick.career ? 'reveal' : 'guess');
  render();
  poll();
}

export function leave() {
  active = false;
  clearTimeout(pollTimer);
}

export function onEsc() {
  if (!STEPS.includes(step) || !isVisible()) return false;
  back();
  return true;
}

const isVisible = () => !!root && STEPS.some((s) => !$(`[data-step="${s}"]`, root).hidden);

function show(s) {
  step = s;
  hooks.showStep(s);
  if (s === 'drum') renderDrum();
  if (s === 'reveal') renderReveal();
}

function back() {
  leave();
  step = '';
  hooks.showStep('pick');
}

function onClick(e) {
  const opt = e.target.closest('.drum-opt');
  if (opt) { choose(opt.dataset.career); return; }
  const b = e.target.closest('[data-gact]');
  if (!b || b.disabled) return;
  ({
    back,
    lock: toggleLock,
    drum: startDrum,
    undrum: () => show('guess'),
    repick: () => show('drum'),
    card: () => { leave(); hooks.makeBabyCard(store.getState().pick.career); },
    settings: () => { location.hash = '#settings'; },
  })[b.dataset.gact]?.();
}

// ---------------- Đồng bộ với Google Sheet ----------------
async function poll() {
  clearTimeout(pollTimer);
  if (!active) return;
  if (gs.configured()) {
    try {
      if (!setupDone) { last = await gs.setup(); setupDone = true; }
      else last = await gs.call('state');
      // Đã công bố trên laptop nhưng lần gửi trước bị lỗi mạng → gửi lại
      const pick = store.getState().pick.career;
      if (pick && last.result !== pick && step === 'reveal') last = await gs.call('result', { career: pick });
      online = true;
      lastError = '';
    } catch (err) {
      online = false;
      lastError = err.message;
    }
    if (!active) return;
    render();
  }
  pollTimer = setTimeout(poll, POLL_MS);
}

async function toggleLock() {
  if (!gs.configured()) return;
  const btn = $('[data-gact="lock"]', root);
  btn.disabled = true;
  try {
    last = await gs.call('lock', { value: last && last.locked ? '0' : '1' });
    online = true;
    render();
  } catch (err) {
    toast(`Chưa đổi được: ${err.message}`, 3500);
  } finally {
    btn.disabled = false;
  }
}

async function startDrum() {
  show('drum');
  sfx.jingle();
  if (gs.configured() && !(last && last.locked)) {
    try { last = await gs.call('lock', { value: '1' }); render(); } catch (err) { toast(`Chưa khoá được bình chọn: ${err.message}`, 3500); }
  }
}

async function choose(name) {
  store.update((s) => { s.pick = { career: name, at: Date.now() }; });
  show('reveal');
  sfx.bloom();
  setTimeout(() => { sfx.sparkle(); hooks.sparkles($('.rv-kid', root)); }, 650);
  if (!gs.configured()) return;
  try {
    last = await gs.call('result', { career: name });
    online = true;
  } catch (err) {
    toast(`Chưa gửi được kết quả lên Google, web sẽ tự thử lại: ${err.message}`, 4500);
  }
  render();
}

// ---------------- Hiển thị ----------------
function render() {
  if (!root) return;
  renderGuess();
  if (step === 'drum') renderDrumNote();
  if (step === 'reveal') renderReveal();
}

function renderGuess() {
  const ok = gs.configured();
  $('.gs-baby', root).textContent = store.babyPhrase();
  // Mã QR (vẽ lại khi đổi link)
  const qr = $('.gs-qr', root);
  const link = ok ? gs.url() : '';
  if (qr.dataset.url !== link) {
    qr.dataset.url = link;
    qr.classList.toggle('empty', !ok);
    qr.innerHTML = ok
      ? (gs.qrSVG(link) || '<p>Không tạo được mã QR</p>')
      : `<div class="gs-setup"><b>Chưa nối Google Sheet</b><span>Vào Cài đặt → "Bình chọn bằng mã QR" để bật (làm 1 lần, khoảng 5–10 phút).</span>
         <button class="btn btn-primary btn-sm" data-gact="settings">Mở Cài đặt</button></div>`;
  }
  // Biểu đồ
  const careers = store.careers();
  const counts = (last && last.counts) || {};
  const chart = $('.gs-chart', root);
  const sig = careers.map((c) => c.name).join('|');
  if (chart.dataset.sig !== sig) {
    chart.dataset.sig = sig;
    chart.innerHTML = careers.map((c) => `
      <div class="gs-row" data-name="${esc(c.name)}">
        <span class="gs-ico">${esc(c.emoji || '🎁')}</span>
        <span class="gs-name">${esc(c.name)}</span>
        <span class="gs-bar"><i></i></span>
        <b class="gs-n">0</b>
      </div>`).join('');
  }
  const top = Math.max(0, ...careers.map((c) => counts[c.name] || 0));
  $$('.gs-row', chart).forEach((row) => {
    const n = counts[row.dataset.name] || 0;
    $('.gs-bar i', row).style.width = `${top ? Math.max(3, (n / top) * 100) : 0}%`;
    $('.gs-n', row).textContent = n;
    row.classList.toggle('lead', n > 0 && n === top);
  });
  $('.gs-total b', root).textContent = (last && last.total) || 0;
  // Dòng "vừa đoán"
  const recent = (last && last.recent) || [];
  const fresh = recent.filter((r) => !seen.has(`${r.name}|${r.career}|${r.at}`));
  recent.forEach((r) => seen.add(`${r.name}|${r.career}|${r.at}`));
  if (fresh.length && !firstLoad) {
    const r = fresh[0];
    const c = careers.find((x) => x.name === r.career);
    $('.gs-ticker', root).innerHTML = `<span class="tk">💌 <b>${esc(r.name)}</b> vừa đoán ${esc(r.career)} ${esc((c && c.emoji) || '')}</span>`;
    if (step === 'guess') sfx.pick();
  }
  if (last) firstLoad = false;
  // Trạng thái + nút khoá
  const status = $('.gs-status', root);
  const lockBtn = $('[data-gact="lock"]', root);
  lockBtn.disabled = !ok;
  lockBtn.textContent = last && last.locked ? '🔓 Mở lại bình chọn' : '🔒 Khoá bình chọn';
  if (!ok) status.textContent = 'Chưa nối Google Sheet · vẫn công bố được nghề bé bốc';
  else if (!online && lastError) status.textContent = `⚠️ ${lastError}`;
  else if (!last) status.textContent = 'Đang kết nối Google Sheet…';
  else status.textContent = last.locked ? `🔒 Đã khoá bình chọn · ${last.total} người đã đoán` : `🟢 Đang nhận phiếu · cập nhật mỗi ${POLL_MS / 1000} giây`;
}

function renderDrum() {
  const careers = store.careers();
  $('.drum-ring', root).innerHTML = careers.map((c, i) => `<span style="animation-delay:${(i * 0.14).toFixed(2)}s">${esc(c.emoji || '🎁')}</span>`).join('');
  $('.drum-title', root).textContent = `${cap(store.babyPhrase())} đang bốc đồ…`;
  $('.drum-grid', root).innerHTML = careers.map((c) => `
    <button class="drum-opt" data-career="${esc(c.name)}"><span class="em">${esc(c.emoji || '🎁')}</span>${esc(c.name)}</button>`).join('');
  renderDrumNote();
}
function renderDrumNote() {
  $('.drum-note', root).textContent = !gs.configured() ? '' : last && last.locked ? '🔒 Đã khoá bình chọn' : 'Đang khoá bình chọn…';
}

function renderReveal() {
  const name = store.getState().pick.career;
  if (!name) return;
  const c = store.careers().find((x) => x.name === name) || { name, emoji: '', key: 'generic' };
  const kid = $('.rv-kid', root);
  const sig = `${c.key}|${store.settings().babyGender}`;
  if (kid.dataset.sig !== sig) {
    kid.dataset.sig = sig;
    kid.innerHTML = kidSVG(c.key, store.settings().babyGender === 'boy' ? 'boy' : 'girl', '100%', '100%', true);
  }
  $('.rv-kicker', root).textContent = `${cap(store.babyPhrase())} đã bốc được`;
  $('.rv-career', root).textContent = `${c.name}${c.emoji ? ` ${c.emoji}` : ''}`;
  const stat = $('.rv-stat', root);
  const names = $('.rv-names', root);
  if (!gs.configured()) { stat.textContent = 'Chúc mừng bé! 🎉'; names.innerHTML = ''; return; }
  if (!last || last.result !== name) { stat.textContent = 'Đang đếm người đoán đúng…'; names.innerHTML = ''; return; }
  const n = last.correct.length;
  stat.innerHTML = n
    ? `🎉 <b>${n}</b> / ${last.total} người đoán đúng!`
    : last.total ? `Chưa ai đoán đúng, ${esc(store.babyPhrase())} thật bất ngờ! 😄` : 'Chưa có ai tham gia đoán.';
  const MAX = 24;
  names.innerHTML = last.correct.slice(0, MAX).map((x) => `<span class="chip">${esc(x)}</span>`).join('')
    + (n > MAX ? `<span class="chip more">+${n - MAX} người nữa</span>` : '');
}
