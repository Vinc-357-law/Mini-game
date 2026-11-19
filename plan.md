# Kế hoạch & tiến độ — Web mini game Thôi nôi Giáng sinh

## Mục tiêu
Web mini game cho tiệc thôi nôi của bé vào tháng 12/2026, để MC điều khiển trên máy chiếu.
Concept: **ấm cúng – vui – không ồn ào**. Nền xanh đêm, ánh vàng như nến, tuyết rơi thưa, nhạc hộp nhẹ.

## Phương án đã duyệt (19/11/2026)
- HTML/CSS/JS thuần, không cần server, chạy bằng Live Server trong VS Code. Chạy được cả khi không có mạng (font tải sẵn, không dùng CDN).
- Dữ liệu: cài đặt + tiến độ game lưu `localStorage`; ảnh chụp lưu `IndexedDB`.
- Hình minh họa: tự vẽ bằng SVG (mũ, đạo cụ, viền Noel, cây thông, đồ trang trí, lò, bánh gừng). Có thể thay bằng PNG riêng.
- Âm thanh: tự tạo bằng Web Audio (chuông, "ting", nhạc hộp Silent Night / Jingle Bells). Có thể thay nhạc nền bằng `assets/audio/bgm.mp3`.
- Đèn cây thông: sáng/tối từ từ (chu kỳ 2–4 giây), không chớp gắt.
- Photobooth: làm bản Đơn giản (khung cố định, ô tròn) trước; bản Nâng cao (MediaPipe) làm sau dưới dạng công tắc.

## Lộ trình
| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| 1 | Khung chung: trang chính, cài đặt, lưu trữ, tuyết, nhạc, phím tắt, thư viện hình SVG | ✅ Xong |
| 2 | Game 1 – Photobooth "Con của tương lai" (bản Đơn giản) + Album | ⏳ |
| 3 | Game 2 – Cùng trang trí cây thông | ⏳ |
| 4 | Game 3 – Lò nướng bánh gừng may mắn | ⏳ |
| 5 | Hoàn thiện, README hướng dẫn MC, Photobooth Nâng cao (MediaPipe) | ⏳ |

## Nhật ký tiến độ

### 19/11/2026 — Giai đoạn 1: Khung chung ✅
**Đã làm**
- `index.html`: một trang, 5 màn hình (trang chính, cài đặt, 3 game), điều hướng bằng `#hash`.
- Trang chính: tên bé viết tay phát sáng ánh nến, 3 thẻ game có hình minh họa, gợi ý phím tắt.
- Cài đặt: tên bé, danh sách nghề, các bé, khách, giải thưởng (mỗi dòng một mục, tự lưu, hiện số lượng đã nhận diện); xuất/nhập file sao lưu `.json`; các nút làm lại từng game.
- Nền: gradient xanh đêm, đốm sáng vàng tĩnh, tuyết rơi thưa bằng canvas (tôn trọng chế độ giảm chuyển động).
- Nhạc: nút bật/tắt, hộp nhạc tự tạo; nhớ trạng thái bật/tắt sau khi tải lại.
- Phím tắt: `Space` hành động chính, `Esc` về trang chính, `F` toàn màn hình, `M` nhạc, `1/2/3` mở game.
- `js/art.js`: toàn bộ hình SVG cho 3 game (8 mũ + 8 đạo cụ nghề, vương miện cho nghề khác, 8 đồ trang trí, hộp quà, cây thông có đèn, bánh gừng, viền Noel 1600×1200).
- Font Be Vietnam Pro + Dancing Script (có dấu tiếng Việt) tải về `assets/fonts`.

**Đã kiểm tra**: cú pháp toàn bộ JS (`node --check`), chụp màn hình trang chính + cài đặt bằng Edge headless.
