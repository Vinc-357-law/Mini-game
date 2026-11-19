// Màn hình Cài đặt
import * as store from './storage.js';
import { clearPhotos } from './db.js';
import { el, esc, toast, download } from './ui.js';

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

export function init(section) {
  root = section;
  render();
}

export function leave() { flush(); }

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

export function enter() { render(); }
