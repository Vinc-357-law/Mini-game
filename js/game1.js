// Game 1 — Photobooth "Con của tương lai"
import * as store from './storage.js';
import { sfx } from './audio.js';
import { careerCardSVG, hatSVG, propSVG, frameSVG, imageWithOverride } from './art.js';
import { addPhoto, allPhotos, deletePhoto, countPhotos } from './db.js';
import { makeZip } from './zip.js';
import { $, $$, el, esc, toast, download, sleep } from './ui.js';
import * as tracker from './facetrack.js';

const W = 1600, H = 1200;
const FACE = { x: 800, y: 640, r: 270 };   // ô tròn đặt mặt (bản Đơn giản)

let root, canvas, ctx, video;
let stream = null;
let step = 'pick';
let career = null;         // { name, emoji, key, slug }
let kidName = '';
let hatImg = null, propImg = null, frameImg = null;
const imgCache = new Map();
let rafId = 0;
let busy = false;
let lastBlob = null, lastUrl = null;
let albumUrls = [];
let photos = [];
// slideshow
let ssIdx = 0, ssTimer = 0, ssPaused = false, ssFront = 0;

export function init(section) {
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
            <svg viewBox="0 0 24 24" class="ico"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-8 7"/></svg>
            Album ảnh · <b class="album-count">0</b>
          </button>
        </div>
        <div class="career-grid"></div>
      </div>

      <div class="g1-step" data-step="camera" hidden>
        <div class="stage"><div class="frame-box">
          <canvas class="cam-canvas" width="${W}" height="${H}"></canvas>
          <div class="cam-guide">Đưa mặt vào khung nhé!</div>
          <div class="cam-glow"></div>
          <div class="countdown"></div>
          <div class="cam-msg" hidden></div>
        </div></div>
        <div class="g1-bar">
          <button class="btn btn-ghost" data-act="back-pick">
            <svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg> Đổi nghề
          </button>
          <button class="g1-who" data-act="rename" title="Đổi tên bé"></button>
          <button class="btn btn-primary btn-lg" data-act="shoot" data-primary>
            <svg viewBox="0 0 24 24" class="ico"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
            Chụp ảnh
          </button>
        </div>
      </div>

      <div class="g1-step" data-step="review" hidden>
        <div class="stage"><div class="frame-box"><img class="review-img" alt="Ảnh vừa chụp"></div></div>
        <div class="g1-bar">
          <button class="btn btn-ghost btn-lg" data-act="retake">
            <svg viewBox="0 0 24 24" class="ico"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg> Chụp lại
          </button>
          <p class="review-note">Ảnh đẹp chưa nào?</p>
          <button class="btn btn-primary btn-lg" data-act="keep" data-primary>
            <svg viewBox="0 0 24 24" class="ico"><path d="M5 12l5 5 9-10"/></svg> Giữ ảnh
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
              <svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg> Chụp tiếp
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
          <input class="text-input name-field" maxlength="24" placeholder="Tên bé…" autocomplete="off">
          <div class="chips name-chips" style="margin-top:16px"></div>
          <div class="modal-actions">
            <button class="btn btn-ghost" data-act="name-skip">Bỏ qua</button>
            <button class="btn btn-primary" data-act="name-ok" data-primary>Tiếp tục</button>
          </div>
        </div>
      </div>

      <div class="slideshow" hidden>
        <img class="ss-img" alt=""><img class="ss-img" alt="">
        <div class="ss-bar">
          <button class="icon-btn" data-act="ss-prev" title="Ảnh trước"><svg viewBox="0 0 24 24" class="ico"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="icon-btn" data-act="ss-pause" data-primary title="Tạm dừng / tiếp tục (Space)"><svg viewBox="0 0 24 24" class="ico ss-ico-pause"><path d="M8 5v14M16 5v14"/></svg><svg viewBox="0 0 24 24" class="ico ss-ico-play"><path d="M7 5l12 7-12 7z"/></svg></button>
          <button class="icon-btn" data-act="ss-next" title="Ảnh sau"><svg viewBox="0 0 24 24" class="ico"><path d="M9 5l7 7-7 7"/></svg></button>
          <span class="ss-count"></span>
          <button class="icon-btn" data-act="ss-close" title="Đóng (Esc)"><svg viewBox="0 0 24 24" class="ico"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </div>
      </div>
    </div>`));

  canvas = $('.cam-canvas', root);
  ctx = canvas.getContext('2d');
  video = document.createElement('video');
  video.playsInline = true;
  video.muted = true;

  root.addEventListener('click', onClick);
  const nameField = $('.name-field', root);
  nameField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmName(nameField.value); }
  });
  window.addEventListener('resize', fitStages);

  imageWithOverride('assets/props/frame.png', frameSVG()).then((img) => { frameImg = img; });
  document.fonts.load('700 70px "Dancing Script"');
  document.fonts.load('600 26px "Be Vietnam Pro"');
}

export function enter() {
  renderCareers();
  showStep('pick');
  refreshCount();
}

export function leave() {
  stopLoop();
  stopCamera();
  closeSlideshow();
  closeName();
}

export function onEsc() {
  if (!$('.slideshow', root).hidden) { closeSlideshow(); return true; }
  if (!$('[data-modal="name"]', root).hidden) { confirmName(''); return true; }
  return false;
}

// ---------------------------------------------------------
function onClick(e) {
  const card = e.target.closest('.career-card');
  if (card) { pickCareer(Number(card.dataset.idx)); return; }
  const chip = e.target.closest('.name-chips .chip');
  if (chip) { confirmName(chip.dataset.name); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const actions = {
    album: openAlbum,
    'back-pick': () => { showStep('pick'); refreshCount(); },
    rename: () => openName(),
    shoot,
    retake: () => { showStep('camera'); },
    keep,
    zip: downloadAll,
    slideshow: openSlideshow,
    'name-skip': () => confirmName(''),
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
  step = name;
  $$('.g1-step', root).forEach((s) => { s.hidden = s.dataset.step !== name; });
  if (name === 'camera') startLoop(); else stopLoop();
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
      <div class="art">${careerCardSVG(c.key)}</div>
      <div class="label">${esc(c.name)} <span class="emoji">${esc(c.emoji)}</span></div>
    </button>`).join('')
    : '<p class="placeholder">Chưa có nghề nào. Vào Cài đặt để thêm danh sách nghề.</p>';
}

async function loadCareerImages(c) {
  const k = c.key === 'generic' ? c.slug : c.key;
  if (!imgCache.has(k)) {
    imgCache.set(k, Promise.all([
      imageWithOverride(`assets/props/${k}-hat.png`, hatSVG(c.key)),
      imageWithOverride(`assets/props/${k}-prop.png`, propSVG(c.key)),
    ]));
  }
  [hatImg, propImg] = await imgCache.get(k);
}

async function pickCareer(idx) {
  career = store.careers()[idx];
  if (!career) return;
  sfx.pick();
  hatImg = propImg = null;
  loadCareerImages(career);
  showStep('camera');
  openName();
  const ok = await startCamera();
  if (ok && store.settings().faceTracking) tracker.start(video);
}

// ---------------- Tên bé ----------------
function openName() {
  const modal = $('[data-modal="name"]', root);
  const field = $('.name-field', root);
  field.value = '';
  $('.name-chips', root).innerHTML = store.kids()
    .map((k) => `<button class="chip" data-name="${esc(k)}">${esc(k)}</button>`).join('');
  modal.hidden = false;
  setTimeout(() => field.focus(), 60);
}
function closeName() {
  const m = root && $('[data-modal="name"]', root);
  if (!m) return;
  $('.name-field', root).blur();   // để phím Space hoạt động ngay sau khi đóng
  m.hidden = true;
}
function confirmName(name) {
  kidName = (name || '').trim();
  closeName();
  updateWho();
}
function updateWho() {
  const who = $('.g1-who', root);
  who.innerHTML = `<span>${kidName ? esc(kidName) : 'Chưa có tên'}</span> · ${esc(career?.name || '')} ${esc(career?.emoji || '')}
    <svg viewBox="0 0 24 24" class="ico"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>`;
}

// ---------------- Webcam ----------------
async function startCamera() {
  hideMsg();
  if (stream) return true;
  if (!navigator.mediaDevices?.getUserMedia) {
    showMsg('Trình duyệt chưa cho dùng webcam ở chế độ này.<br>Hãy mở trang bằng <b>Live Server</b> (địa chỉ http://127.0.0.1:5500…), không mở file trực tiếp.');
    return false;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    return true;
  } catch (err) {
    const msg = {
      NotAllowedError: 'Chưa cho phép dùng webcam.<br>Bấm biểu tượng 🎥 trên thanh địa chỉ → <b>Cho phép</b>, rồi chọn lại nghề.',
      NotFoundError: 'Không tìm thấy webcam. Kiểm tra lại dây cắm hoặc webcam của laptop.',
      NotReadableError: 'Webcam đang được ứng dụng khác dùng (Zoom, Meet…). Hãy tắt ứng dụng đó rồi thử lại.',
    }[err.name] || `Không mở được webcam (${esc(err.name || err.message)}).`;
    showMsg(msg);
    return false;
  }
}
function stopCamera() {
  tracker.stop();
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
  if (video) video.srcObject = null;
}
function showMsg(html) { const m = $('.cam-msg', root); m.innerHTML = html; m.hidden = false; }
function hideMsg() { $('.cam-msg', root).hidden = true; }

// ---------------- Vẽ khung hình ----------------
function startLoop() {
  stopLoop();
  const loop = () => { drawScene(ctx, true); rafId = requestAnimationFrame(loop); };
  rafId = requestAnimationFrame(loop);
}
function stopLoop() { cancelAnimationFrame(rafId); rafId = 0; }

function captionText() {
  if (!career) return '';
  return `Mai này ${kidName || 'bé'} là ${career.name}${career.emoji ? ' ' + career.emoji : ''}`;
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// Vị trí mũ: bám theo khuôn mặt (Nâng cao) hoặc theo ô tròn cố định (Đơn giản)
function hatPlacement() {
  const face = tracker.face(W, H);
  if (face) {
    const w = face.w * 1.55;
    const h = (w * 200) / 300;
    return { x: face.cx - w / 2, y: face.top - h + face.w * 0.32, w, h, tracked: true };
  }
  const w = FACE.r * 2 * 1.12;
  const h = (w * 200) / 300;
  return { x: FACE.x - w / 2, y: FACE.y - FACE.r - h + FACE.r * 0.3, w, h, tracked: false };
}

function drawScene(c, live) {
  c.save();
  c.fillStyle = '#0b1a33';
  c.fillRect(0, 0, W, H);

  // Hình webcam: lấp đầy khung, lật như soi gương
  if (video && video.readyState >= 2 && video.videoWidth) {
    const vw = video.videoWidth, vh = video.videoHeight;
    const scale = Math.max(W / vw, H / vh);
    const dw = vw * scale, dh = vh * scale;
    c.save();
    c.translate(W, 0);
    c.scale(-1, 1);
    c.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
    c.restore();
  }

  const hat = hatPlacement();
  const tracked = hat.tracked;

  // Làm tối nhẹ xung quanh để mặt bé nổi bật + chút ánh vàng ấm
  const vx = tracked ? hat.x + hat.w / 2 : FACE.x;
  const vy = tracked ? hat.y + hat.h + hat.w * 0.25 : FACE.y;
  const g = c.createRadialGradient(vx, vy, FACE.r * 0.9, vx, vy, FACE.r * 2.8);
  g.addColorStop(0, 'rgba(7,16,31,0)');
  g.addColorStop(1, 'rgba(7,16,31,0.5)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255, 190, 110, 0.05)';
  c.fillRect(0, 0, W, H);

  if (live && !tracked) {
    c.save();
    c.strokeStyle = 'rgba(251, 231, 181, 0.9)';
    c.lineWidth = 6;
    c.setLineDash([22, 16]);
    c.beginPath();
    c.arc(FACE.x, FACE.y, FACE.r, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  if (frameImg) c.drawImage(frameImg, 0, 0, W, H);
  if (hatImg) c.drawImage(hatImg, hat.x, hat.y, hat.w, hat.h);
  if (propImg) c.drawImage(propImg, 1190, 690, 310, 310);

  // Dòng chữ
  const text = captionText();
  if (text) {
    let size = 72;
    c.font = `700 ${size}px "Dancing Script", ${'"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji"'}, cursive`;
    let tw = c.measureText(text).width;
    while (tw > 1240 && size > 40) {
      size -= 4;
      c.font = `700 ${size}px "Dancing Script", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", cursive`;
      tw = c.measureText(text).width;
    }
    const bw = Math.max(tw + 150, 640), bh = 150, bx = (W - bw) / 2, by = 1004;
    roundRect(c, bx, by, bw, bh, 34);
    c.fillStyle = 'rgba(11, 26, 51, 0.86)';
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = '#f2c46d';
    c.stroke();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.save();
    c.shadowColor = 'rgba(255, 190, 100, 0.65)';
    c.shadowBlur = 22;
    c.fillStyle = '#ffcf7a';
    c.fillText(text, W / 2, by + 62);
    c.restore();
    c.font = '600 26px "Be Vietnam Pro", sans-serif';
    c.fillStyle = 'rgba(251, 231, 181, 0.82)';
    c.fillText(`Thôi nôi bé ${store.babyName()} · Giáng sinh ${new Date().getFullYear()}`, W / 2, by + 118);
  }
  c.restore();
}

// ---------------- Chụp ----------------
async function shoot() {
  if (busy) return;
  if (!stream) { const ok = await startCamera(); if (!ok) return; }
  busy = true;
  const bar = $('[data-step="camera"] .g1-bar', root);
  $$('button', bar).forEach((b) => { b.disabled = true; });
  const cd = $('.countdown', root);
  for (const n of [3, 2, 1]) {
    cd.textContent = n;
    cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop');
    sfx.tick(n === 1);
    await sleep(1000);
  }
  cd.textContent = '';
  cd.classList.remove('pop');
  sfx.shutter();
  const glow = $('.cam-glow', root);
  glow.classList.remove('on'); void glow.offsetWidth; glow.classList.add('on');

  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  drawScene(off.getContext('2d'), false);
  lastBlob = await new Promise((r) => off.toBlob(r, 'image/jpeg', 0.92));
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = URL.createObjectURL(lastBlob);
  $('.review-img', root).src = lastUrl;

  await sleep(350);
  showStep('review');
  $$('button', bar).forEach((b) => { b.disabled = false; });
  busy = false;
}

async function keep() {
  if (!lastBlob) return;
  await addPhoto({ blob: lastBlob, name: kidName, career: career?.name || '', emoji: career?.emoji || '', ts: Date.now() });
  lastBlob = null;
  sfx.sparkle();
  toast('Đã lưu ảnh vào album ✨');
  showStep('pick');
  refreshCount();
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
  $('.album-sub', root).textContent = photos.length ? `${photos.length} ảnh đã chụp` : 'Chưa có ảnh nào — chụp tấm đầu tiên nhé!';
  $('[data-act="slideshow"]', root).disabled = !photos.length;
  $('[data-act="zip"]', root).disabled = !photos.length;
  $('.album-grid', root).innerHTML = photos.map((p, i) => `
    <figure class="album-item">
      <img src="${albumUrls[i]}" alt="${esc(p.name)} - ${esc(p.career)}" loading="lazy">
      <figcaption>
        <span><b>${esc(p.name || 'Bé')}</b> · ${esc(p.career)} ${esc(p.emoji)}</span>
        <span class="album-tools">
          <button class="icon-btn sm" data-act="dl-one" data-id="${p.id}" title="Tải ảnh"><svg viewBox="0 0 24 24" class="ico"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button>
          <button class="icon-btn sm" data-act="del-one" data-id="${p.id}" title="Xoá ảnh"><svg viewBox="0 0 24 24" class="ico"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg></button>
        </span>
      </figcaption>
    </figure>`).join('');
}

function downloadOne(id) {
  const i = photos.findIndex((p) => p.id === id);
  if (i >= 0) download(photos[i].blob, fileName(photos[i], i));
}

async function removeOne(id) {
  if (!confirm('Xoá ảnh này khỏi album?')) return;
  await deletePhoto(id);
  openAlbum();
}

async function downloadAll() {
  if (!photos.length) return;
  toast('Đang đóng gói ảnh…');
  const files = [];
  for (let i = 0; i < photos.length; i++) {
    files.push({ name: fileName(photos[i], i), data: new Uint8Array(await photos[i].blob.arrayBuffer()) });
  }
  download(makeZip(files), `album-thoi-noi-${store.slug(store.babyName())}.zip`);
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
