// Trang chính: tự co cho vừa màn hình, con vật biết nói lời chúc, vệt lấp lánh theo chuột.
import * as store from './storage.js';
import { sfx } from './audio.js';
import { $, $$ } from './ui.js';

let root;
let active = false;
let fitRaf = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lời chúc của từng con vật (b = "bé Na")
const LINES = {
  cat: (b) => ['Meo~ Giáng sinh vui vẻ!', `Meo meo! Chúc mừng thôi nôi ${b}!`, 'Ai cho mèo một chiếc bánh gừng nào?', 'Mũ Noel của tớ xinh không?'],
  deer: (b) => ['Ho ho ho! Ông già Noel sắp tới rồi!', `Chúc ${b} một tuổi thật khoẻ!`, 'Mũi đỏ của tớ sáng chưa nè?', 'Leng keng leng keng~'],
  snow: (b) => ['Lạnh mà vui quá đi!', 'Giáng sinh an lành nhé cả nhà!', `Thổi nến cùng ${b} nào!`, 'Ôm tớ một cái cho ấm nè!'],
};

export function init(section) {
  root = section;
  $$('.mascot', root).forEach((m) => m.addEventListener('click', () => talk(m)));
  window.addEventListener('pointermove', trail, { passive: true });
  window.addEventListener('resize', () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fit); });
  document.fonts?.ready.then(fit);
}

export function enter() {
  active = true;
  refresh();
}

export function leave() {
  active = false;
  $$('.bubble', root).forEach((b) => b.remove());
}

// Gắn tên bé + căn lại (gọi khi vào trang chính hoặc khi Cài đặt thay đổi)
export function refresh() {
  const name = store.babyName();
  $$('[data-bind="babyName"]', root).forEach((n) => { n.textContent = name; });
  // lớp viền trắng phía sau tên bé (kiểu chữ sticker) lấy chữ từ data-text
  $$('.baby-name', root).forEach((n) => { n.dataset.text = name; });
  document.title = `Thôi nôi ${store.babyPhrase()} · Mini game Giáng sinh`;
  fit();
}

// Trang chính luôn vừa đúng một màn hình (máy chiếu không cuộn được):
// tên bé dài → thu nhỏ chữ cho vừa bề ngang; cửa sổ thấp (laptop) → thu nhỏ cả khối giữa.
function fit() {
  if (!root || !root.classList.contains('active')) return;
  const home = $('.home', root);
  const name = $('.baby-name', home);
  home.style.zoom = '';
  name.style.removeProperty('--name-k');
  const maxW = home.clientWidth;
  if (name.offsetWidth > maxW) name.style.setProperty('--name-k', (maxW / name.offsetWidth).toFixed(3));
  if (window.matchMedia('(max-width: 900px)').matches) return;     // điện thoại: cho cuộn dọc
  const cs = getComputedStyle(root);
  const avail = root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const need = home.offsetHeight + 16;                                // + chỗ cho băng dính, bóng đổ
  if (need > avail) home.style.zoom = Math.max(0.55, avail / need).toFixed(3);
}

// ---------- Bấm vào con vật: nhún nhảy + bong bóng lời chúc + tiếng chuông ----------
function talk(m) {
  const kind = m.dataset.mascot;
  sfx.jingle();
  m.classList.remove('boing');
  void m.offsetWidth;
  m.classList.add('boing');

  $$('.bubble', root).forEach((b) => b.remove());
  const lines = LINES[kind](store.babyPhrase());
  m.dataset.i = (Number(m.dataset.i ?? -1) + 1) % lines.length;     // lần lượt từng câu, không lặp liền
  const b = document.createElement('div');
  b.className = `bubble bubble-${kind}`;
  b.textContent = lines[m.dataset.i];

  const r = m.getBoundingClientRect();
  const W = root.clientWidth, H = root.clientHeight;
  if (kind === 'cat') {
    b.style.right = `${W - r.left - r.width * 0.08}px`;
    b.style.top = `${r.top + r.height * 0.12}px`;
  } else if (kind === 'deer') {
    b.style.left = `${r.left + r.width * 0.62}px`;
    b.style.bottom = `${H - r.top - r.height * 0.14}px`;
  } else {
    b.style.right = `${W - r.left - r.width * 0.42}px`;
    b.style.bottom = `${H - r.top - r.height * 0.06}px`;
  }
  root.appendChild(b);
  setTimeout(() => {
    b.classList.add('out');
    setTimeout(() => b.remove(), 320);
  }, 2800);
}

// ---------- Vệt lấp lánh vàng nhỏ theo chuột ----------
let lastT = 0, lx = -99, ly = -99;
const TRAIL_COLORS = ['#ffd770', '#fff3c4', '#ffd770', '#ffb4b4'];
function trail(e) {
  if (!active || reduceMotion || e.pointerType === 'touch') return;
  const now = performance.now();
  if (now - lastT < 45 || Math.hypot(e.clientX - lx, e.clientY - ly) < 16) return;
  lastT = now; lx = e.clientX; ly = e.clientY;
  const s = document.createElement('i');
  s.className = 'trail';
  s.style.left = `${e.clientX}px`;
  s.style.top = `${e.clientY}px`;
  s.style.setProperty('--sz', `${7 + Math.random() * 9}px`);
  s.style.setProperty('--dx', `${(Math.random() - 0.5) * 24}px`);
  s.style.setProperty('--c', TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)]);
  root.appendChild(s);
  setTimeout(() => s.remove(), 900);
}
