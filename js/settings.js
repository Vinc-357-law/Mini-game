// Màn hình Cài đặt
import * as store from './storage.js';
import { clearPhotos } from './db.js';
import { el, esc, toast, download } from './ui.js';

const FIELDS = [
  {
    key: 'careers', label: 'Danh sách nghề (Game 1)',
    hint: 'Mỗi dòng: <code>Tên nghề | biểu tượng</code>. Có sẵn hình cho: Bác sĩ, Phi hành gia, Đầu bếp, Lính cứu hỏa, Họa sĩ, Ca sĩ, Cảnh sát, Giáo viên. Nghề khác dùng vương miện.',
    count: () => `${store.careers().length} nghề`,
  },
  {
    key: 'kids', label: 'Các bé dự tiệc (Game 1 & 2)',
    hint: 'Mỗi dòng một tên. Dùng để gợi ý tên khi chụp ảnh và phát quà ở cây thông.',
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

export function init(section) {
  root = section;
  render();
}

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
        <div class="field wide">
          <label class="toggle-row">
            <input type="checkbox" id="f-faceTracking" ${s.faceTracking ? 'checked' : ''}>
            <span><b>Photobooth nâng cao:</b> mũ tự bám theo đầu bé (nhận diện khuôn mặt bằng MediaPipe)</span>
          </label>
          <p class="hint">Tắt = khung tròn cố định, chạy nhẹ và ổn định nhất. Bật = vui hơn nhưng cần máy đủ khoẻ; nếu không nhận ra mặt, web tự quay về khung tròn.</p>
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
          <button class="btn btn-danger btn-sm" data-reset="photos">Xoá toàn bộ ảnh Photobooth</button>
          <button class="btn btn-danger btn-sm" data-reset="tree">Làm lại cây thông</button>
          <button class="btn btn-danger btn-sm" data-reset="oven">Làm lại bốc thăm</button>
          <button class="btn btn-danger btn-sm" data-reset="sample">Khôi phục dữ liệu mẫu</button>
        </div>
      </div>
    </div>`);
  root.appendChild(wrap);
  refreshCounts();

  let timer;
  const state = wrap.querySelector('#saveState');
  wrap.addEventListener('input', (e) => {
    const key = e.target.dataset.key;
    if (!key) return;
    state.textContent = 'Đang lưu…';
    clearTimeout(timer);
    timer = setTimeout(() => {
      store.update((st) => { st.settings[key] = e.target.value; });
      refreshCounts();
      state.textContent = 'Đã lưu ✓';
    }, 350);
  });

  wrap.querySelector('#f-faceTracking').addEventListener('change', (e) => {
    store.update((st) => { st.settings.faceTracking = e.target.checked; });
    state.textContent = 'Đã lưu ✓';
  });

  wrap.querySelector('#btnExport').addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const d = new Date();
    download(blob, `thoinoi-saoluu-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`);
  });

  wrap.querySelector('#fileImport').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
      photos: 'Xoá toàn bộ ảnh đã chụp trong album? Không thể hoàn tác.',
      tree: 'Gỡ hết đồ trang trí và quà ở cây thông, làm lại từ đầu?',
      oven: 'Xoá kết quả bốc thăm (bảng "Đã trúng") để bốc lại từ đầu?',
      sample: 'Thay toàn bộ danh sách hiện tại bằng dữ liệu mẫu?',
    }[kind];
    if (!confirm(msg)) return;
    if (kind === 'photos') await clearPhotos();
    if (kind === 'tree') store.resetTree();
    if (kind === 'oven') store.resetOven();
    if (kind === 'sample') { store.resetSettingsToSample(); render(); }
    toast('Đã làm lại ✓');
  }));
}

function refreshCounts() {
  FIELDS.forEach((f) => {
    const c = root.querySelector(`[data-count="${f.key}"]`);
    if (c) c.textContent = f.count();
  });
}

export function enter() { render(); }
