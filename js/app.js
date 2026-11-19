// Khung chính: điều hướng màn hình, phím tắt, nhạc, toàn màn hình.
import * as store from './storage.js';
import * as audio from './audio.js';
import { startSnow } from './snow.js';
import { cardArt } from './art.js';
import { $, $$ } from './ui.js';
import * as homeScreen from './home.js';
import * as settingsScreen from './settings.js';
import * as game1 from './game1.js';
import * as game2 from './game2.js';
import * as game3 from './game3.js';

const SCREENS = {
  home: { el: '#screen-home', mod: homeScreen },
  settings: { el: '#screen-settings', mod: settingsScreen },
  photobooth: { el: '#screen-photobooth', mod: game1 },
  tree: { el: '#screen-tree', mod: game2 },
  oven: { el: '#screen-oven', mod: game3 },
};

let current = null;
const inited = new Set();

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
function firstGesture(e) {
  audio.unlock();
  // Thao tác đầu tiên chính là bấm nút nhạc / phím M → để nút đó tự bật (tránh vừa bật đã tắt)
  const onMusicControl = (e.type === 'pointerdown' && e.target.closest?.('#btnMusic'))
    || (e.type === 'keydown' && !isTyping(e.target) && (e.key || '').toLowerCase() === 'm');
  if (!onMusicControl && store.getState().musicOn && !audio.isPlaying()) audio.startMusic();
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
    // Đang chọn một thẻ game bằng phím Tab → Space mở đúng thẻ đó
    const card = current === 'home' && document.activeElement?.closest?.('.game-card');
    if (card) { card.click(); return; }
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
store.onChange(() => { if (current === 'home') homeScreen.refresh(); });
window.addEventListener('hashchange', route);
route();
