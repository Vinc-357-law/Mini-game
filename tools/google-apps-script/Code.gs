/**
 * =====================================================================
 *  Mini game Thôi nôi · Giáng sinh — "Đoán xem bé bốc gì?"
 *  Mã chạy trên Google Apps Script, gắn với Google Sheet của bạn.
 * =====================================================================
 *  - Khách quét mã QR → mở trang bình chọn (chính trang này) → nhập tên, chọn nghề.
 *    Mỗi điện thoại 1 phiếu (đổi ý được tới khi khoá), lưu ở trang tính "Phiếu".
 *    Trang tính "Thống kê" tự cập nhật sau mỗi phiếu.
 *  - Web trên laptop (màn hình lớn) đọc số liệu, khoá bình chọn, công bố nghề bé bốc
 *    qua địa chỉ  .../exec?api=...  (phải đúng mã PIN chủ tiệc bên dưới).
 *
 *  Cách cài: xem README của web, mục "Bình chọn bằng mã QR".
 *  Sửa mã xong phải triển khai lại: Triển khai → Quản lý các lần triển khai → ✎ → Phiên bản: Phiên bản mới.
 */
const OWNER_PIN = '__OWNER_PIN__';   // web tự điền khi bạn bấm "Chép mã cho Google" trong Cài đặt

const VOTES = 'Phiếu';
const STATS = 'Thống kê';
const props = () => PropertiesService.getScriptProperties();

// ---------------------------------------------------------------------
// Cổng vào: không có ?api → trang bình chọn cho khách; có ?api → API cho màn hình lớn
// ---------------------------------------------------------------------
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.api) return api_(p);
  return HtmlService.createHtmlOutput(VOTE_PAGE)
    .setTitle('Đoán xem bé bốc gì?')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

// API trả về JSONP (callback) để web chạy được cả khi mở bằng file://
function api_(p) {
  let out;
  try {
    if (String(p.pin || '') !== String(OWNER_PIN)) throw new Error('Sai mã PIN chủ tiệc');
    const a = String(p.api);
    if (a === 'setup') setup_(p);
    else if (a === 'lock') setLocked_(p.value !== '0');
    else if (a === 'result') setResult_(String(p.career || ''));
    else if (a === 'reset') resetVotes_();
    else if (a !== 'state') throw new Error('Lệnh không hợp lệ: ' + a);
    out = state_(true);
    out.ok = true;
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  const json = JSON.stringify(out);
  const cb = String(p.callback || '').replace(/[^\w$.]/g, '');
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------
// Cấu hình (danh sách nghề, tên bé, khoá, kết quả) lưu trong Thuộc tính tập lệnh
// ---------------------------------------------------------------------
function getCareers_() {
  try { return JSON.parse(props().getProperty('careers') || '[]'); } catch (e) { return []; }
}

function setup_(p) {
  let list;
  try { list = JSON.parse(p.careers || '[]'); } catch (e) { throw new Error('Danh sách nghề không hợp lệ'); }
  list = list.filter(function (c) { return c && c.name; }).slice(0, 40).map(function (c) {
    return { name: String(c.name).trim().slice(0, 40), emoji: String(c.emoji || '').slice(0, 8) };
  });
  const pr = props();
  if (list.length) pr.setProperty('careers', JSON.stringify(list));
  if (p.baby) pr.setProperty('baby', String(p.baby).slice(0, 60));
  sheets_();
  writeStats_();
}

function setLocked_(on) {
  props().setProperty('locked', on ? '1' : '0');
  writeStats_();
}

function setResult_(career) {
  const pr = props();
  if (career) {
    if (!getCareers_().some(function (c) { return c.name === career; })) throw new Error('Nghề không có trong danh sách: ' + career);
    pr.setProperty('result', career);
    pr.setProperty('locked', '1');
  } else {
    pr.deleteProperty('result');
  }
  writeStats_();
}

function resetVotes_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheets_().votes;
    const n = sh.getLastRow();
    if (n > 1) sh.getRange(2, 1, n - 1, 4).clearContent();
    const pr = props();
    pr.setProperty('locked', '0');
    pr.deleteProperty('result');
    writeStats_();
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------
// Trang tính
// ---------------------------------------------------------------------
function sheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let votes = ss.getSheetByName(VOTES);
  if (!votes) {
    votes = ss.insertSheet(VOTES);
    votes.getRange(1, 1, 1, 4).setValues([['Thời gian', 'Tên khách', 'Đoán bé bốc', 'Mã điện thoại']]);
    votes.setFrozenRows(1);
  }
  let stats = ss.getSheetByName(STATS);
  if (!stats) stats = ss.insertSheet(STATS);
  return { votes: votes, stats: stats };
}

function readVotes_() {
  const sh = sheets_().votes;
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 4).getValues()
    .filter(function (r) { return r[1] !== '' && r[2] !== ''; })
    .map(function (r) {
      const at = r[0] instanceof Date ? r[0].getTime() : (new Date(r[0]).getTime() || 0);
      return { at: at, name: String(r[1]).replace(/^'/, ''), career: String(r[2]), device: String(r[3]) };
    });
}

function state_(full) {
  const pr = props();
  const careers = getCareers_();
  const votes = readVotes_();
  const result = pr.getProperty('result') || '';
  const counts = {};
  careers.forEach(function (c) { counts[c.name] = 0; });
  votes.forEach(function (v) { counts[v.career] = (counts[v.career] || 0) + 1; });
  const s = {
    baby: pr.getProperty('baby') || '',
    careers: careers,
    locked: pr.getProperty('locked') === '1',
    result: result,
    total: votes.length,
    counts: counts,
  };
  if (full) {
    s.recent = votes.slice().sort(function (a, b) { return b.at - a.at; }).slice(0, 8)
      .map(function (v) { return { name: v.name, career: v.career, at: v.at }; });
    s.correct = result
      ? votes.filter(function (v) { return v.career === result; }).sort(function (a, b) { return a.at - b.at; })
        .map(function (v) { return v.name; })
      : [];
  }
  return s;
}

// Trang tính "Thống kê": số người đoán từng nghề, kết quả, người đoán đúng
function writeStats_() {
  const st = sheets_().stats;
  const s = state_(true);
  const rows = [['Nghề', 'Số người đoán', 'Tỉ lệ']];
  s.careers.map(function (c) {
    const n = s.counts[c.name] || 0;
    return [c.name + (c.emoji ? ' ' + c.emoji : ''), n, s.total ? Math.round((n / s.total) * 100) + '%' : '0%'];
  }).sort(function (a, b) { return b[1] - a[1]; }).forEach(function (r) { rows.push(r); });
  rows.push(['', '', '']);
  rows.push(['Tổng số phiếu', s.total, '']);
  rows.push(['Bình chọn', s.locked ? 'Đã khoá' : 'Đang mở', '']);
  rows.push(['Bé đã bốc', s.result || '(chưa)', '']);
  rows.push(['Người đoán đúng', s.result ? s.correct.length : '', s.correct.join(', ')]);
  st.clearContents();
  st.getRange(1, 1, rows.length, 3).setValues(rows);
}

// Chặn chữ bắt đầu bằng = + - @ bị Google Sheet hiểu thành công thức
function safeText_(t) {
  t = String(t || '').trim();
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

// ---------------------------------------------------------------------
// Dành cho trang bình chọn của khách (gọi qua google.script.run)
// ---------------------------------------------------------------------
function getInfo(device) {
  const s = state_(false);
  return { baby: s.baby, careers: s.careers, locked: s.locked, result: s.result, mine: device ? findVote_(String(device)) : null };
}

function findVote_(device) {
  const mine = readVotes_().filter(function (v) { return v.device === device; });
  const v = mine[mine.length - 1];
  return v ? { name: v.name, career: v.career } : null;
}

function submitVote(device, name, career) {
  device = String(device || '').slice(0, 64);
  name = String(name || '').trim().slice(0, 40);
  career = String(career || '');
  if (!device) throw new Error('Thiếu mã điện thoại, bạn tải lại trang giúp nhé');
  if (!name) throw new Error('Bạn nhập tên giúp nhé');
  const pr = props();
  if (pr.getProperty('locked') === '1' || pr.getProperty('result')) throw new Error('Đã khoá bình chọn rồi, cùng chờ bé bốc nhé!');
  if (!getCareers_().some(function (c) { return c.name === career; })) throw new Error('Bạn chọn một nghề giúp nhé');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheets_().votes;
    const n = sh.getLastRow();
    let row = 0;
    if (n > 1) {
      const ids = sh.getRange(2, 4, n - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === device) { row = i + 2; break; }
      }
    }
    const values = [new Date(), safeText_(name), career, device];
    if (row) sh.getRange(row, 1, 1, 4).setValues([values]);
    else sh.appendRow(values);
    writeStats_();
  } finally {
    lock.releaseLock();
  }
  return getInfo(device);
}

// ---------------------------------------------------------------------
// Trang bình chọn trên điện thoại khách
// ---------------------------------------------------------------------
const VOTE_PAGE = `<!doctype html>
<html lang="vi"><head><base target="_top"><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Mali:wght@600;700&display=swap" rel="stylesheet">
<style>
  :root { --pine:#1a4230; --pine2:#10291d; --berry:#b8323a; --berry-d:#8c1f2a; --cream:#fdf3df; --gold:#f2c46d; --ink:#3b2414; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; padding:20px 14px 36px; font-family: Mali, 'Segoe UI', system-ui, sans-serif; color:var(--ink);
    background: radial-gradient(ellipse at 50% -10%, #2f6e50, var(--pine) 55%, var(--pine2)); }
  .lights { height:26px; margin:-6px auto 10px; max-width:520px; background:
    radial-gradient(circle at 50% 70%, #ffd36b 0 5px, transparent 6px) 0 0/44px 26px repeat-x,
    radial-gradient(circle at 50% 70%, #ff6b6b 0 5px, transparent 6px) 22px 0/44px 26px repeat-x; opacity:.9; }
  .card { position:relative; max-width:520px; margin:0 auto; padding:20px 16px 22px; border-radius:22px; background:var(--cream);
    box-shadow:0 0 0 4px #fff, 0 16px 30px rgba(0,0,0,.35); outline:2px dashed rgba(184,50,58,.45); outline-offset:-10px; }
  .tag { display:inline-block; padding:3px 12px; border-radius:999px; background:#fff; color:var(--berry-d);
    font-family:'Baloo 2', sans-serif; font-weight:800; font-size:.8rem; letter-spacing:.12em; text-transform:uppercase; }
  h1 { margin:.35em 0 .15em; font-family:'Baloo 2', sans-serif; font-weight:800; font-size:1.75rem; line-height:1.15; color:var(--berry-d); }
  .sub { margin:0 0 12px; color:#6e5440; font-size:.98rem; }
  .lb { display:block; margin:12px 0 6px; font-family:'Baloo 2', sans-serif; font-weight:800; font-size:1.05rem; }
  input { width:100%; padding:12px 14px; border:2px solid #e8d6b6; border-radius:14px; background:#fff; font:inherit; font-size:1.1rem; outline:none; }
  input:focus { border-color:var(--berry); }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .opt { display:flex; flex-direction:column; align-items:center; gap:2px; padding:12px 6px; border:2px solid #e8d6b6; border-radius:16px;
    background:#fff; color:var(--ink); font:inherit; font-weight:700; font-size:1rem; cursor:pointer; }
  .opt .em { font-size:2rem; line-height:1.15; }
  .opt.on { border-color:var(--berry); background:#fff1ee; box-shadow:0 0 0 3px rgba(184,50,58,.2); }
  .btn { display:block; width:100%; margin-top:16px; padding:13px; border:0; border-radius:999px; cursor:pointer;
    font-family:'Baloo 2', sans-serif; font-weight:800; font-size:1.25rem; color:var(--cream);
    background:linear-gradient(180deg,#d44a50,var(--berry) 55%,var(--berry-d)); box-shadow:0 5px 0 #6a1620, 0 10px 18px rgba(0,0,0,.22); }
  .btn:disabled { opacity:.55; }
  .btn.ghost { color:var(--berry-d); background:#fff; box-shadow:0 4px 0 #e8d6b6; font-size:1.05rem; }
  .msg { margin-top:14px; padding:14px; border-radius:16px; background:#fff; text-align:center; font-weight:700; line-height:1.5; }
  .msg.err { color:var(--berry); }
  .big { font-family:'Baloo 2', sans-serif; font-weight:800; font-size:1.9rem; line-height:1.2; color:var(--berry-d); }
  .hide { display:none !important; }
  .foot { margin:14px 0 0; text-align:center; color:rgba(253,243,223,.85); font-size:.9rem; }
</style></head>
<body>
<div class="lights"></div>
<div class="card">
  <span class="tag">🎄 Mừng thôi nôi</span>
  <h1 id="title">Đoán xem bé sẽ bốc gì?</h1>
  <p class="sub">Chọn món bạn đoán bé sẽ bốc được trong lễ thôi nôi nhé!</p>
  <div id="form" class="hide">
    <label class="lb" for="name">Tên của bạn</label>
    <input id="name" maxlength="40" placeholder="Ví dụ: Cô Lan" autocomplete="name">
    <label class="lb">Bạn đoán bé sẽ bốc:</label>
    <div class="grid" id="grid"></div>
    <button class="btn" id="send" type="button">Gửi dự đoán 🎁</button>
  </div>
  <div class="msg" id="msg">Đang tải…</div>
</div>
<p class="foot">Giáng sinh an lành! ✨</p>
<script>
  var KEY = 'thoinoi-vote-', info = null, chosen = '', editing = false, busy = false;
  function $(id) { return document.getElementById(id); }
  function mem(k, v) {
    try { if (v === undefined) return localStorage.getItem(KEY + k); localStorage.setItem(KEY + k, v); } catch (e) { return null; }
    return null;
  }
  var device = mem('id') || ('d' + Math.random().toString(36).slice(2) + Date.now().toString(36));
  mem('id', device);
  $('name').value = mem('name') || '';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function emo(n) {
    var c = ((info && info.careers) || []).filter(function (x) { return x.name === n; })[0];
    return c && c.emoji ? ' ' + c.emoji : '';
  }
  function show(html, err) { var m = $('msg'); m.className = 'msg' + (err ? ' err' : ''); m.innerHTML = html; }
  function render() {
    if (!info) return;
    var baby = info.baby || 'bé';
    $('title').textContent = 'Đoán xem ' + baby + ' sẽ bốc gì?';
    var grid = $('grid'), sig = JSON.stringify(info.careers);
    if (grid.getAttribute('data-sig') !== sig) {
      grid.setAttribute('data-sig', sig);
      grid.innerHTML = info.careers.map(function (c) {
        return '<button type="button" class="opt" data-n="' + esc(c.name) + '"><span class="em">' + esc(c.emoji || '🎁') + '</span>' + esc(c.name) + '</button>';
      }).join('');
    }
    if (!chosen && info.mine) chosen = info.mine.career;
    Array.prototype.forEach.call(grid.children, function (b) { b.classList.toggle('on', b.getAttribute('data-n') === chosen); });
    var closed = info.locked || !!info.result;
    $('form').classList.toggle('hide', !info.careers.length || closed || (!!info.mine && !editing));
    if (!info.careers.length) return show('Chủ tiệc chưa mở bình chọn.<br>Bạn đợi chút rồi tải lại trang nhé!');
    if (info.result) {
      var right = info.mine && info.mine.career === info.result;
      return show(esc(baby.charAt(0).toUpperCase() + baby.slice(1)) + ' đã bốc được<div class="big">' + esc(info.result + emo(info.result)) + '</div>' +
        (info.mine ? (right ? '🎉 Bạn đoán đúng rồi! Chúc mừng ' + esc(info.mine.name) + '!' : 'Bạn đoán ' + esc(info.mine.career) + '. Cảm ơn bạn đã tham gia nhé!') : ''));
    }
    if (info.locked) {
      return show('Đã khoá bình chọn 🔒<br>' + (info.mine ? 'Bạn đoán: <b>' + esc(info.mine.career + emo(info.mine.career)) + '</b><br>' : '') + 'Cùng chờ bé bốc nhé! 🎁');
    }
    if (info.mine && !editing) {
      return show('Cảm ơn ' + esc(info.mine.name) + '! 💌<br>Bạn đoán bé sẽ bốc: <b>' + esc(info.mine.career + emo(info.mine.career)) + '</b>' +
        '<button class="btn ghost" id="again" type="button">Đổi ý</button>');
    }
    $('msg').className = 'msg hide';
  }
  function load() {
    if (busy) return;
    google.script.run.withSuccessHandler(function (res) { info = res; render(); })
      .withFailureHandler(function (e) { if (!info) show('Chưa tải được: ' + esc(e.message || e), true); })
      .getInfo(device);
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var o = t.closest ? t.closest('.opt') : null;
    if (o) { chosen = o.getAttribute('data-n'); render(); return; }
    if (t.id === 'again') { editing = true; render(); return; }
    if (t.id === 'send') {
      var name = $('name').value.trim();
      if (!name) { $('name').focus(); return show('Bạn nhập tên giúp nhé', true); }
      if (!chosen) return show('Bạn chọn một món giúp nhé', true);
      busy = true; t.disabled = true; t.textContent = 'Đang gửi…';
      google.script.run.withSuccessHandler(function (res) {
        busy = false; t.disabled = false; t.textContent = 'Gửi dự đoán 🎁';
        mem('name', name); editing = false; info = res; render();
      }).withFailureHandler(function (e) {
        busy = false; t.disabled = false; t.textContent = 'Gửi dự đoán 🎁';
        show(esc(e.message || e), true); load();
      }).submitVote(device, name, chosen);
    }
  });
  load();
  setInterval(load, 6000);
</script>
</body></html>`;
