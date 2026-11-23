// Game 2 — Cùng trang trí cây thông
import * as store from './storage.js';
import { sfx } from './audio.js';
import { treeSVG, ornamentSVG, giftSVG, ORNAMENTS, cardArt } from './art.js';

const PARTY_DATE = '20.12.2026';   // dòng chữ trên dải băng xe tuần lộc kéo khi thắp đèn
import { $, $$, el, esc, toast } from './ui.js';

let root, treeBox, ornLayer, pile;
let drag = null;        // { type, ghost, startRect }
let pending = null;     // { type, x, y, node }

export function init(section) {
  root = section;
  root.innerHTML = '';
  root.appendChild(el(`
    <div class="g2">
      <div class="g2-top">
        <!-- Tiêu đề ở giữa; thắp đèn thì mờ đi -->
        <div class="g2-title">
          <h2 class="screen-title">Cùng trang trí cây thông</h2>
          <p class="screen-sub">Kéo một món đồ lên cây — treo xong là có quà!</p>
        </div>
        <div class="g2-counter"><b class="got">0</b> / <span class="total">0</span> bạn nhỏ đã nhận quà</div>
      </div>

      <!-- Thắp đèn: ông già Noel đi xe tuần lộc bay ngang, kéo dải băng ghi ngày tiệc (chạy bằng CSS khi .g2.lit) -->
      <div class="g2-sky" aria-hidden="true">
        <div class="g2-sleigh">
          <div class="g2-sleigh-bob">
            <div class="g2-sleigh-art">${cardArt('deco-sleigh')}</div>
            <div class="g2-banner"><span>${PARTY_DATE}</span></div>
          </div>
        </div>
      </div>

      <!-- Trái: cây thông to + quà dưới gốc · Phải: bảng đồ trang trí 2 cột + nút; thắp đèn thì bảng nhường chỗ cho lời chúc -->
      <div class="g2-main">
        <div class="g2-stage">
          <div class="tree-box">
            <div class="tree-art">${treeSVG()}</div>
            <div class="ornament-layer"></div>
          </div>
          <div class="gift-pile"></div>
        </div>

        <div class="g2-side">
          <div class="g2-panel">
            <div class="g2-tray">
              <i class="tray-holly" aria-hidden="true">${cardArt('st-holly-bunch')}</i>
              <h3 class="tray-title">Đồ trang trí</h3>
              <div class="tray-grid">
                ${ORNAMENTS.map((o) => `
                  <div class="tray-item" data-type="${o.type}" title="${esc(o.name)}">
                    <div class="tray-orn">${ornamentSVG(o.type)}</div>
                    <span>${esc(o.name)}</span>
                  </div>`).join('')}
              </div>
            </div>
            <div class="greet" aria-live="polite">
              <span class="greet-xmas">Merry Christmas</span>
              <span class="greet-baby">Chúc mừng thôi nôi</span>
              <b class="greet-name"></b>
            </div>
          </div>
          <div class="g2-actions">
            <button class="btn btn-ghost" data-act="undo" title="Gỡ món vừa treo">
              <svg viewBox="0 0 24 24" class="ico"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg> Hoàn tác
            </button>
            <button class="btn btn-primary" data-act="light" data-primary>
              <svg viewBox="0 0 24 24" class="ico"><path d="M12 3l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 15.4 7 18.2l1.2-5.6L4 8.8l5.6-.6z"/></svg>
              <span class="light-label">Thắp sáng cây thông</span>
            </button>
          </div>
        </div>
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

export function enter() {
  renderAll();
  requestAnimationFrame(fitTree);
}

export function leave() {
  if (pending) cancelPending();
  endDrag();
}

export function onEsc() {
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

// Cây luôn giữ đúng tỉ lệ 600:720 và vừa khung (khung trái — cây chiếm gần hết)
function fitTree() {
  const stage = $('.g2-stage', root);
  if (!stage || !stage.clientHeight) return;
  const h = Math.min(stage.clientHeight, (stage.clientWidth * 0.9 * 720) / 600);
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
  $('.greet-name', root).textContent = store.babyPhrase();
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
  if (pending) return;               // đang hỏi tên bé thì chưa cho thắp/tắt đèn
  const on = !treeState().lit;
  store.update((s) => { s.tree.lit = on; });
  setLit(on, true);
}

function setLit(on, withSound) {
  root.querySelector('.g2').classList.toggle('lit', on);
  $('.light-label', root).textContent = on ? 'Tắt đèn cây thông' : 'Thắp sáng cây thông';
  if (on && withSound) sfx.bloom();
}
