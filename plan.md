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
| 2 | Game 1 – Photobooth "Con của tương lai" (bản Đơn giản) + Album | ✅ Xong |
| 3 | Game 2 – Cùng trang trí cây thông | ✅ Xong |
| 4 | Game 3 – Lò nướng bánh gừng may mắn | ✅ Xong |
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

### 19/11/2026 — Giai đoạn 2: Game 1 Photobooth ✅
**Đã làm**
- Lưới 8 thẻ nghề, mỗi thẻ là một bé đội mũ + cầm đạo cụ của nghề đó.
- Chọn nghề → hộp nhập tên (gõ tên, chọn nhanh từ danh sách các bé, hoặc Bỏ qua) → hình webcam lật như soi gương.
- Khung ảnh 1600×1200: hình webcam, ô tròn nét đứt "Đưa mặt vào khung nhé!" (chỉ hiện lúc ngắm, không có trong ảnh), mũ + đạo cụ, viền Noel (dây thông, quả châu, nơ đỏ, lá nhựa ruồi, bông tuyết), dòng chữ "Mai này Na là Bác sĩ 🩺" + "Thôi nôi bé … · Giáng sinh 2026".
- Bấm Chụp (hoặc Space): đếm 3-2-1 kèm tiếng chuông → tiếng chụp + ánh vàng dịu (không chớp trắng) → Xem lại: Giữ ảnh / Chụp lại.
- Album: lưới ảnh, tải từng ảnh, xoá ảnh, **tải cả bộ .zip** (tự viết bộ tạo zip, không cần thư viện).
- Trình chiếu: toàn màn hình, mỗi ảnh 4,5 giây, chuyển mờ dần; thanh điều khiển (trước / dừng / sau / đóng) chỉ hiện khi di chuột; Esc để đóng.
- Báo lỗi webcam dễ hiểu (chưa cho phép, không có webcam, webcam đang bị app khác dùng, mở file trực tiếp không qua Live Server).
- Thay hình riêng: đặt `assets/props/<nghề>-hat.png`, `<nghề>-prop.png`, `frame.png` là web tự dùng.

**Đã kiểm tra** (Edge headless + webcam giả lập): chọn nghề, nhập/bỏ qua tên, chụp bằng Space, giữ ảnh, album 2 ảnh, trình chiếu, Esc đóng trình chiếu.
**Sửa trong lúc test**: phím Space không ăn ngay sau khi đóng hộp nhập tên; bấm Space liên tiếp có thể kích hoạt chụp hai lần; thanh trình chiếu che chữ trên ảnh.

### 19/11/2026 — Giai đoạn 3: Game 2 Cây thông ✅
**Đã làm**
- Cây thông lớn 4 tầng (có tuyết đọng, dây kim tuyến, 28 bóng đèn chưa sáng, ngôi sao trên đỉnh, chậu đỏ).
- Khay 8 món: quả châu đỏ, quả châu vàng, chuông, kẹo gậy, người tuyết, ngôi sao nhỏ, tất Noel, găng tay.
- Kéo thả bằng chuột (cả cảm ứng): món đồ phát sáng khi đang ở trên cây; chỉ dính khi thả trong vùng lá cây (nhận diện đúng hình cây, không phải khung chữ nhật); thả ra ngoài thì bay về khay + nhắc nhẹ.
- Treo xong: món đồ đung đưa nhẹ → hỏi tên bé (chọn từ danh sách, tên đã nhận quà bị gạch và khoá; hoặc gõ tên mới) → tên hiện dưới món đồ → hộp quà ghi tên rơi nhẹ xuống gốc cây + lấp lánh + tiếng chuông.
- Quà xếp thành hàng dưới gốc (hàng dưới nhiều, lên trên ít dần), đủ chỗ cho 30+ bé.
- Bộ đếm "x/y bạn nhỏ đã nhận quà" (tên mới gõ thêm được cộng vào tổng); đủ hết thì viền sáng vàng.
- Hoàn tác: gỡ món vừa treo + hộp quà, trả lại tên cho bé. Huỷ trong hộp hỏi tên cũng gỡ món đồ.
- Thắp sáng (nút hoặc Space): đèn sáng dần và "thở" chậm 2–4 giây mỗi bóng (không chớp), ngôi sao toả sáng, nền tối dịu, hai bên cây hiện "Merry Christmas" và "& Chúc mừng thôi nôi Na"; khay đồ ẩn đi cho ảnh tập thể gọn đẹp. Bấm lại để tắt đèn.
- Toàn bộ trạng thái (đồ đã treo, quà, đèn) lưu lại, tải lại trang không mất.

**Đã kiểm tra** (Edge headless, kéo thả thật bằng chuột giả lập): treo 6 món, thả trượt ra ngoài, tên đã nhận bị khoá, gõ tên mới, hoàn tác, thắp sáng bằng Space, tải lại trang vẫn giữ nguyên.

### 19/11/2026 — Giai đoạn 4: Game 3 Lò nướng bánh gừng ✅
**Đã làm**
- Góc bếp ấm cúng: tường gạch men mờ, dây đèn vàng treo trên cao, mặt bàn gỗ; lò nướng màu kem có núm vặn, đồng hồ nhiệt độ, cửa kính phản chiếu.
- Khay bánh gừng trong lò, mỗi chiếc mang tên khách (≤ 30 khách) hoặc **số bàn** (> 30 khách, tối đa 18 bánh cho đỡ rối). Người trúng luôn bốc ngẫu nhiên trên **toàn bộ** khách còn lại (dùng `crypto.getRandomValues`).
- Cột bên phải: thẻ "Đang bốc" (tên giải, phần quà, lượt x/y, số khách còn trong lò), nút **Nướng bánh**, bảng **Đã trúng** (mới nhất ở trên) + dòng "Vắng mặt".
- Nướng bánh (nút hoặc Space), khoảng 6 giây: lò sáng cam dần, nhiệt độ chạy 0 → 180°C, núm xoay, bánh nhún nhảy và đổi chỗ → tiếng "ting" → cửa lò mở xuống → một chiếc bánh bay ra giữa màn hình, phóng to, kèm tên giải + tên người trúng + số bàn.
- **Tiếp tục** (Space): người trúng rời khỏi khay, ghi vào bảng; tự chuyển sang lượt/giải tiếp theo theo thứ tự thấp → cao; hết giải thì báo "Đã trao hết giải 🎉".
- **Bốc lại (vắng mặt)**: người vừa trúng được ghi "vắng" (không quay lại lò), tự nướng lại cho chính giải đó.
- Kết quả lưu lại, tải lại trang không mất; nút "Làm lại bốc thăm" trong Cài đặt.

**Đã kiểm tra** (Edge headless): nướng → công bố → bốc lại → tiếp tục; bảng Đã trúng + Vắng mặt; chế độ 45 khách hiện số bàn.
**Sửa trong lúc test**: nền màn công bố quá trong làm chữ lẫn với bảng phía sau; tên giải trong bảng bị cắt.
