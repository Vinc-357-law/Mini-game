// Kết nối Google Apps Script (bình chọn bằng mã QR · Game 1).
// Gọi bằng JSONP (thẻ <script>) nên chạy được cả khi mở web bằng file://.
import * as store from './storage.js';

let seq = 0;

export const url = () => (store.settings().voteUrl || '').trim();
export const configured = () => /^https?:\/\/\S+$/.test(url());

// Gọi API: state | setup | lock | result | reset. Trả về trạng thái mới nhất từ Google Sheet.
export function call(api, params = {}, timeout = 12000) {
  if (!configured()) return Promise.reject(new Error('Chưa dán link Google Apps Script trong Cài đặt'));
  return new Promise((resolve, reject) => {
    const cb = `__gsCb${Date.now().toString(36)}${seq++}`;
    const s = document.createElement('script');
    const q = new URLSearchParams({ api, pin: store.settings().ownerPin || '', ...params, callback: cb, _: String(Date.now()) });
    let finished = false;
    const finish = (err, data) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      s.remove();
      window[cb] = () => {};                          // phản hồi đến muộn: bỏ qua
      setTimeout(() => { delete window[cb]; }, 60000);
      if (err) reject(err); else resolve(data);
    };
    const timer = setTimeout(() => finish(new Error('Google phản hồi chậm quá, đang thử lại…')), timeout);
    window[cb] = (data) => (data && data.ok ? finish(null, data) : finish(new Error((data && data.error) || 'Google báo lỗi')));
    s.onerror = () => finish(new Error('Không kết nối được Google. Kiểm tra mạng và link trong Cài đặt.'));
    s.src = `${url()}${url().includes('?') ? '&' : '?'}${q}`;
    document.head.appendChild(s);
  });
}

// Gửi danh sách nghề + tên bé để trang bình chọn của khách hiện đúng
export function setup() {
  const careers = store.careers().map((c) => ({ name: c.name, emoji: c.emoji }));
  return call('setup', { careers: JSON.stringify(careers), baby: store.babyPhrase() });
}

// Mã QR dạng SVG (thư viện qrcode-generator, MIT — assets/vendor/qrcode.js)
export function qrSVG(text) {
  if (typeof window.qrcode !== 'function' || !text) return '';
  const q = window.qrcode(0, 'M');
  q.addData(text);
  q.make();
  return q.createSvgTag({ cellSize: 8, margin: 2, scalable: true }).replace('fill="black"', 'fill="#1f2a22"');
}
