// Game 1 — "Con của tương lai": Thẻ ước mơ (không cần webcam)
// Bé chọn nghề → MC gõ tên, chọn bé trai/bé gái → lật thẻ có hình bé mặc đồ nghề đó.
import * as store from './storage.js';
import { sfx } from './audio.js';
import { careerCardSVG, kidSVG, frameSVG, svgToImage } from './art.js';
import { addPhoto, allPhotos, deletePhoto, countPhotos } from './db.js';
import { makeZip } from './zip.js';
import { $, $$, el, esc, toast, download, sleep } from './ui.js';
import * as guess from './guess.js';

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
          <div class="g1-actions">
            <button class="btn btn-ghost" data-act="album">
              <svg viewBox="0 0 24 24" class="ico"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 8l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5z"/></svg>
              Album thẻ · <b class="album-count">0</b>
            </button>
            <button class="btn btn-primary" data-act="guess">🔮 Đoán bé bốc gì</button>
          </div>
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

  guess.mount($('.g1', root), { showStep, sparkles, makeBabyCard });
  root.addEventListener('click', onClick);
  const nameField = $('.name-field', root);
  nameField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmName(nameField.value); }
  });
  window.addEventListener('resize', fitStages);

  svgToImage(frameSVG()).then((img) => { frameImg = img; });
}

export function enter() {
  renderCareers();
  showStep('pick');
  refreshCount();
}

export function leave() {
  guess.leave();
  resetFlip();
  closeSlideshow();
  closeName();
}

export function onEsc() {
  if (!$('.slideshow', root).hidden) { closeSlideshow(); return true; }
  if (guess.onEsc()) return true;
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
    guess: () => guess.open(),
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

// Từ màn công bố "Bé bốc đồ": tạo thẻ ước mơ cho chính bé thôi nôi với nghề bé vừa bốc
function makeBabyCard(careerName) {
  const c = store.careers().find((x) => x.name === careerName);
  if (!c) { showStep('pick'); return; }
  career = c;
  kidName = store.babyName();
  setGender(store.settings().babyGender === 'boy' ? 'boy' : 'girl');
  updateWho();
  showStep('card');
  reveal();
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
  const footer = `Thôi nôi ${store.babyPhrase()} · Giáng sinh ${new Date().getFullYear()}`;
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
