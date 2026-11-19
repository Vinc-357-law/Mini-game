# Kế hoạch & tiến độ — Web mini game Thôi nôi Giáng sinh

## Mục tiêu
Web mini game cho tiệc thôi nôi của bé vào tháng 12/2026, để MC điều khiển trên máy chiếu.
Concept: **ấm cúng – vui – không ồn ào**. Tông đỏ – xanh lá Giáng sinh, ánh vàng như nến, tuyết rơi thưa, nhạc hộp nhẹ.
*(Từ 19/11/2026: đổi từ nền xanh đêm sang đỏ – xanh lá, bỏ webcam. Xem nhật ký cuối.)*

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
| 5 | Hoàn thiện, README hướng dẫn MC, Photobooth Nâng cao (MediaPipe) | ✅ Xong (sau đó bỏ ở giai đoạn 6) |
| 6 | Đổi tông đỏ – xanh lá, bỏ webcam: Game 1 thành "Thẻ ước mơ", nhấp đúp `index.html` là chạy | ✅ Xong |
| 7 | Rà soát & sửa lỗi logic toàn bộ 3 game + Cài đặt; chỉ còn một cách mở web | ✅ Xong |
| 8 | Phong cách "cute" (sticker, sổ tay, chữ tròn) giữ nguyên bảng màu đỏ – xanh lá | 🟡 Trang chính xong · chờ duyệt để làm Game 1, 2, 3 + Cài đặt |
| 9 | Sửa lỗi logic lần 2 (vừa màn hình laptop, tên dài/trống, nút nhạc, phím Space, khay Game 2) | ✅ Xong |
| 10 | Thêm chi tiết Noel cho sinh động (trang chính) | ✅ Xong |
| 11 | Game 1: mã QR cho khách đoán nghề bé bốc + Google Sheet + giao diện chủ tiệc | 🔨 Đang làm |

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

### 19/11/2026 — Giai đoạn 5: Hoàn thiện ✅
**Đã làm**
- **Photobooth nâng cao**: công tắc trong Cài đặt. Bật lên thì MediaPipe Face Detector nhận diện khuôn mặt (~15 lần/giây), mũ tự bám theo đầu bé (chọn mặt to nhất, có làm mượt chuyển động), ô tròn hướng dẫn tự ẩn, dòng nhắc đổi thành "Mũ đang bám theo bé đấy! ✨". Không thấy mặt quá 0,9 giây hoặc không tải được thư viện thì tự quay về khung tròn cố định.
- Thư viện MediaPipe 0.10.14 + model `blaze_face_short_range` **tải sẵn vào `assets/vendor/mediapipe`** (~19MB) để chạy không cần mạng; CDN chỉ là dự phòng.
- `README.md`: hướng dẫn chạy, chuẩn bị dữ liệu, điều khiển cho MC từng game, phím tắt, tuỳ biến hình/nhạc, xử lý sự cố.
- Kiểm tra giao diện ở bề ngang điện thoại (390px): không tràn ngang.

**Đã kiểm tra**: cú pháp toàn bộ JS; bật bản nâng cao → thư viện tải từ máy (không dùng mạng), trạng thái `ready`, chụp vẫn bình thường.
**Chưa kiểm tra được**: độ khớp của mũ với khuôn mặt thật (webcam giả lập không có mặt người) → cần thử với webcam thật, có thể phải tinh chỉnh vị trí/kích thước mũ trong `hatPlacement()` ở `js/game1.js`.

### 19/11/2026 — Sửa lỗi "web chưa chạy" ✅
**Nguyên nhân**: máy chưa cài extension Live Server. Mở `index.html` bằng cách nhấp đúp (`file://`) thì trình duyệt chặn JavaScript module do CORS, nên trang đứng im, không game nào chạy.
**Đã sửa**
- Thêm **`Mo-web.bat`** + `tools/serve.ps1`: server tĩnh viết bằng PowerShell có sẵn trong Windows, không cần cài Node hay VS Code. Nhấp đúp là mở `http://localhost:5500/` (cổng bận thì tự chuyển cổng khác); trả đúng kiểu dữ liệu cho `.js`, `.wasm`, font.
- Mở nhầm bằng `file://` thì trang hiện hộp hướng dẫn mở lại cho đúng, thay vì đứng im.
- README cập nhật cách chạy.

**Đã kiểm tra** qua chính server mới (Edge headless): trang chính → Game 1 chụp và lưu album → Game 2 treo 2 món và thắp sáng → Game 3 nướng, công bố, Tiếp tục; mở bằng `file://` hiện đúng hộp hướng dẫn.

### 19/11/2026 — Giai đoạn 6: Tông đỏ – xanh lá, bỏ webcam ✅
**Yêu cầu**: màu ấm cúng hơn, chủ đạo đỏ – xanh lá cho không khí Giáng sinh; bỏ webcam.
**Đã làm**
- **Bảng màu mới**: nền xanh lá thông đậm, có kẻ caro đỏ rất mờ và quầng sáng vàng ở giữa; nút chính đỏ nhung viền vàng; nút phụ xanh lá; hộp thoại xanh lá có dải đỏ trên đầu; favicon mới.
- **Trang chính**: 3 thẻ game kiểu tấm thiệp giấy kem, viền đỏ, ruy băng đỏ chéo góc, hình minh hoạ trên nền xanh.
- **Cây thông**: phòng khách tường đỏ rượu có sọc mờ, sàn gỗ; hộp quà nằm trên sàn. Hộp quà xanh dương đổi thành xanh lá.
- **Lò nướng**: tường gạch caro đỏ – kem (phủ tối nhẹ cho đỡ chói), lò màu xanh rêu, viền cửa lò đỏ, thẻ "Đang bốc" màu đỏ.
- **Game 1 "Con của tương lai" thành "Thẻ ước mơ"** (không dùng webcam):
  - Thẻ chọn nghề vẽ một bé mặc **đồ của đúng nghề** (áo blouse, đồ phi hành gia, áo đầu bếp, áo lính cứu hoả có sọc phản quang, áo hoạ sĩ, áo ca sĩ lấp lánh, đồng phục cảnh sát, áo len giáo viên; nghề khác mặc áo len Noel), đội mũ, cầm đạo cụ.
  - MC chọn **Bé trai / Bé gái** (bé gái có tóc buộc hai bên với nơ đỏ). Trong Cài đặt có thể ghi `Bin | trai`, `Na | gái` để web tự chọn khi chọn hoặc gõ đúng tên.
  - Bấm **Lật thẻ**: mặt sau thẻ đỏ có ngôi sao vàng, lật chậm 1,1 giây ra thẻ 1600×1200: bé mặc đồ nghề + "MAI NÀY / Bin / là Lính cứu hỏa 🚒" + ruy băng "Thôi nôi bé Na · Giáng sinh 2026" + viền Noel đỏ. Có tiếng chuông và lấp lánh.
  - **Lưu thẻ** (Space) vào album. Album, tải từng thẻ, tải cả bộ .zip, trình chiếu vẫn như cũ.
  - Bố mẹ dùng điện thoại chụp bé đứng cạnh màn hình.
- **Bỏ webcam**: xoá `js/facetrack.js`, thư viện MediaPipe (~19MB) và công tắc "Photobooth nâng cao" trong Cài đặt.
- **Nhấp đúp `index.html` là chạy**: thêm `tools/build.mjs` gộp các file trong `js/` thành `js/app.bundle.js` (script thường, không phải module). Nhạc riêng `bgm.mp3` cũng nạp được khi mở bằng file. `Mo-web.bat` giữ lại làm cách dự phòng. Bỏ hộp cảnh báo "mở sai cách".

**Đã kiểm tra** (Edge headless, mở bằng `file://`): trang chính → chọn 3 nghề, chọn tên từ danh sách, gõ tên, chọn bé gái thủ công → lật thẻ → lưu, album 3 thẻ → cây thông treo 2 món + thắp sáng → lò nướng công bố + Tiếp tục → Cài đặt. Không có lỗi trong Console. Bề ngang 390px không tràn.
**Sửa trong lúc test**: gõ tay tên bé có trong danh sách (vd. "Bin | trai") vẫn ra hình bé gái của bé trước → giờ web tự tra giới tính theo tên.
**Lưu ý khi sửa code**: sửa file trong `js/` xong phải chạy `node tools/build.mjs` để cập nhật `js/app.bundle.js`.

### 19/11/2026 — Giai đoạn 7: Sửa lỗi logic ✅
**Yêu cầu**: sửa các lỗi logic.
**Đã sửa**
| Chỗ | Lỗi | Cách sửa |
|---|---|---|
| Cách mở web | Có 2 cách mở (nhấp đúp `index.html` và `Mo-web.bat` qua localhost) → trình duyệt lưu dữ liệu ở 2 nơi khác nhau, nhập ở cách này không thấy ở cách kia; viền PNG riêng chỉ chạy ở một cách | Bỏ `Mo-web.bat` + `tools/serve.ps1` và tuỳ chọn viền PNG. Chỉ còn nhấp đúp `index.html`. Nhạc `bgm.mp3` vẫn dùng được |
| Game 1 | Bấm "Lưu thẻ" 2 lần nhanh (hoặc `Space` 2 lần) → album lưu trùng 2 thẻ | Khoá nút ngay khi bắt đầu lưu; lưu lỗi thì báo và cho bấm lại |
| Game 1 | Đang sửa tên mà bấm `Esc` → tên bé bị xoá, thẻ vẽ lại không tên | Khi sửa tên: `Esc` / nút **Huỷ** chỉ đóng hộp, giữ tên cũ. Lần đầu mở: `Esc` vẫn là Bỏ qua tên |
| Game 1 | Đổi nghề trong lúc thẻ đang vẽ/lật → thẻ của nghề cũ có thể lật ra, nút Lưu bật với thẻ cũ; mở nghề mới thấy thẻ cũ quay ngược | Mỗi lần lật có số thứ tự, lần cũ tự dừng; úp thẻ lại ngay không chạy hiệu ứng |
| Game 1 | MC bấm Bé trai/Bé gái nhưng bé có trong danh sách với giới tính khác → web tự đổi lại | Lựa chọn của MC được ưu tiên |
| Game 1 | Gõ `bin` thì thẻ ghi "bin" | Tự dùng đúng tên trong danh sách ("Bin") |
| Game 1 | Có thể vẽ chữ tiếng Việt (ư, ơ, ố…) bằng font dự phòng nếu font chưa kịp tải | Nạp font cho đúng các chữ sắp vẽ trước khi vẽ thẻ |
| Cài đặt | Ghi `bé gái`, `con trai`, `nữ`… không được hiểu | Hiểu được nhiều cách ghi |
| Cài đặt | Gõ ô này rồi sang ô khác trong 0,35 giây → ô trước **không được lưu** | Chuyển ô là lưu ngay ô trước; cũng lưu khi rời màn hình, đóng trang |
| Cài đặt | Gõ xong bấm ngay Xuất / Khôi phục mẫu → file xuất thiếu dòng vừa gõ / dữ liệu mẫu bị ghi đè lại | Lưu hết trước khi Xuất, Nhập, Làm lại |
| Cài đặt | Nhập lại đúng file sao lưu vừa nhập → không có gì xảy ra | Cho chọn lại cùng một file |
| Game 2 | Bấm Hoàn tác 2 lần liền → dữ liệu gỡ 2 món nhưng trên cây vẫn còn 1 món | Gỡ đúng món + hộp quà theo mã của từng lượt |
| Game 2 | Đang kéo đồ mà rời màn hình → món đó trong khay bị mờ mãi | Dọn trạng thái kéo khi rời màn hình |
| Game 2 | Đang kéo mà bấm `Space` thắp sáng → vẫn treo được lên cây | Cây đã thắp sáng thì món đồ bay về khay |
| Game 2 | Gõ `bống` thì hộp quà ghi "bống" | Tự dùng đúng tên trong danh sách |
| Game 3 | Đang nướng mà bấm sang màn khác → lò vẫn chạy ngầm và **ghi một người trúng** không ai thấy; quay lại thấy màn công bố cũ | Rời màn hình là huỷ lượt nướng, chưa ai trúng |
| Game 3 | Đang bốc theo thứ tự "người thứ n", sửa số lượng giải giữa chừng → bốc nhầm giải (giải đã đủ người bị bốc thêm, giải thiếu người bị bỏ qua) | Đếm số người đã trúng của từng giải |
| Game 3 | Đông khách (≥31), khách không ghi bàn → bánh hiện "?" | Hiện tên khách |
| Game 3 | Chưa nhập khách nào → báo "Không còn khách nào trong lò" (khó hiểu) | Báo "Chưa có khách — vào Cài đặt" |

**Đã kiểm tra** (Edge headless, mở bằng `file://`, có kịch bản cho từng lỗi trên): Space 2 lần chỉ lưu 1 thẻ; sửa tên + Esc giữ tên; đổi nghề giữa chừng không lật thẻ cũ; `bin` → "Bin" bé trai; Bống + MC bấm Bé trai → bé trai; `Tí | bé gái` → bé gái; Cài đặt gõ 2 ô liên tiếp đều lưu, gõ rồi khôi phục mẫu ngay → đúng dữ liệu mẫu, gõ rồi rời màn → đã lưu; Hoàn tác 2 lần → cây, quà, dữ liệu, bộ đếm đều về 0; rời màn giữa lúc kéo → khay bình thường; rời lò giữa lúc nướng → 0 người trúng, vào lại lò sạch; tăng số lượng Giải A sau khi đã bốc Giải B → đang bốc "Giải A, Lượt 2 / 2"; 32 khách có 1 người không ghi bàn → không có bánh "?". Chạy lại toàn bộ kịch bản cũ: đạt, Console không lỗi.

### 19/11/2026 — Giai đoạn 8 (phần 1): Trang chính phong cách "cute" ✅
**Yêu cầu**: làm nét cute như ảnh mẫu (thẻ công thức kiểu sổ tay, sticker, chữ tròn), giữ nguyên bảng màu. Người dùng duyệt: chữ tròn mập cho tiêu đề, cả 3 con vật (tuần lộc, người tuyết, mèo đội mũ Noel), **làm trang chính trước** để xem.
**Đã làm** (chỉ học phong cách, tự vẽ mới toàn bộ, không dùng nhân vật/chữ trong ảnh mẫu)
- Font mới, tải sẵn để chạy không cần mạng: **Baloo 2** (tiêu đề tròn mập) và **Mali** (chữ viết tay tròn), đều có dấu tiếng Việt. Baloo 2 là font biến thiên nên chỉ cần 1 file cho mỗi bộ chữ.
- **Tên bé**: chữ tròn mập tô vàng chuyển màu, viền nâu đỏ mảnh, viền trắng dày và bóng đỏ, giống chữ sticker. Xung quanh có sao lấp lánh nhấp nháy nhẹ và một trái tim vẽ tay. (Viền nâu đỏ nằm ở lớp dưới chữ vàng để không lộ các nét chồng bên trong font.)
- **"Mừng thôi nôi"** thành nhãn giấy kem có đường khâu và đuôi ruy băng đỏ hai bên. **Dòng phụ** chữ viết tay trên vệt cọ đỏ, hai đầu có bông tuyết.
- **3 thẻ game** thành trang sổ: bìa đỏ nhung, giấy kem kẻ ô mờ, đường chỉ khâu, 3 góc bọc vàng, băng dính washi (đỏ / xanh / vàng), sticker số thứ tự, tờ giấy lệch phía sau. Thẻ nghiêng nhẹ, rê chuột thì dựng thẳng và nhấc lên. Hình minh hoạ có viền trắng kiểu sticker trên vệt màu loang. 3 thẻ luôn cao bằng nhau.
- **Con vật ló ra ở mép**: mèo trắng đốm cam đội mũ Noel (mép phải), tuần lộc mũi đỏ quàng khăn xanh (góc dưới trái), người tuyết đội mũ len đỏ vẫy tay (góc dưới phải). Chúng chuyển động rất chậm và nhẹ. Thêm 8 sticker nhỏ bay lơ lửng: kẹo gậy, bông tuyết, sao, chuông, găng tay, lá nhựa ruồi, trái tim, hộp quà.
- Viền trắng sticker tạo bằng **một bộ lọc SVG dùng chung** (`#sticker` trong `index.html`), không phải vẽ lại từng hình.
- **Mặt bé kiểu chibi** (mắt to 2 đốm sáng, má hồng có vạch, miệng cười há, bé gái có mi) dùng cho hình thẻ 1. Game 1 tạm giữ mặt cũ đến khi làm phần tiếp theo.
- **Mẩu giấy phím tắt** dán băng dính chéo, phím vẽ như nút bấm. **Nút trên cùng** (nhạc, toàn màn hình, cài đặt) thành viên kẹo kem có gờ, bấm thấy lún, bật nhạc thì chuyển đỏ.
- Tự co theo màn hình: 1920×1080, 1600×900, 1366×768, 1280×720, 1024×768 đều vừa một màn không tràn; dưới 1200px ẩn bớt mèo và sticker; điện thoại thì xếp thẻ một cột, ẩn trang trí.

**Đã kiểm tra** (Edge headless, `file://`): chụp 5 cỡ màn hình + tên dài có dấu "Bảo Ngọc"; bấm vào thẻ 1, 2 → mở đúng game; `Space` → Game 1; nút nhạc đổi trạng thái; chạy lại toàn bộ kịch bản 3 game: đạt, không lỗi (trừ thông báo "không có bgm.mp3" khi bật nhạc — bình thường, web chuyển sang hộp nhạc có sẵn).
**Tiếp theo (chờ duyệt)**: áp phong cách này cho Game 1 (thẻ chọn nghề + thẻ ước mơ + album), Game 2, Game 3, Cài đặt và các hộp thoại.

### 19/11/2026 — Giai đoạn 9: Sửa lỗi logic lần 2 ✅
| Chỗ | Lỗi | Cách sửa |
|---|---|---|
| Trang chính | Cửa sổ thấp (laptop 1366×768 trừ thanh trình duyệt ≈ 650px) → mất phần dưới, không cuộn được | Tự thu nhỏ cả khối giữa cho vừa chiều cao (`fitHome` trong `app.js`) |
| Trang chính | Tên bé dài (vd. "Nguyễn Ngọc Bảo Anh") tràn ra ngoài màn hình | Tên luôn một dòng, tự thu nhỏ chữ cho vừa bề ngang |
| Tên bé | Để trống → hiện "bé" và "Thôi nôi bé bé"; gõ "Bé Na" → "Thôi nôi bé Bé Na" | Trống → "Bé yêu"; tên đã có chữ "Bé" thì không thêm ("Thôi nôi Bé Na") |
| Nhạc | Lần trước bật nhạc, lần sau bấm nút nhạc → nhạc vừa bật đã tắt, phải bấm 2 lần | Thao tác đầu tiên là nút nhạc / phím M thì để nút tự xử lý |
| Phím tắt | Dùng Tab chọn thẻ 2 rồi bấm Space → lại mở Game 1 | Space mở đúng thẻ đang được chọn |
| Game 2 | Màn hình hẹp hơn ~1400px → nút "Thắp sáng cây thông" bị cắt mất ở mép phải | Khay đồ trang trí tự co; dưới 1300px chỉ hiện hình món đồ (to, rõ hơn) |

**Đã kiểm tra** (Edge headless, `file://`) ở 1366×657, 1280×720, 1024×768, 1600×900: trang chính vừa khít; tên 19 ký tự nằm gọn; nút nhạc bấm 1 lần là phát; Tab + Space mở đúng thẻ 2; tên trống → "Bé yêu", tên "Bé Na" → tiêu đề "Thôi nôi Bé Na"; khay Game 2 không bị cắt; chạy lại toàn bộ kịch bản 3 game: đạt.

### 19/11/2026 — Giai đoạn 10: Chi tiết Noel cho trang chính ✅
**Yêu cầu**: thêm nhiều chi tiết Giáng sinh cho sinh động (duyệt toàn bộ đề xuất).
**Đã làm**
- **Đầu màn hình**: dây đèn 28 bóng (đỏ, vàng, xanh, kem) vắt 4 nhịp ngang màn hình, các bóng sáng dịu lần lượt, không chớp. Cành thông thắt nơ đỏ ôm 2 góc trên, có quả châu treo. 4 món treo lủng lẳng đung đưa: quả châu đỏ, kẹo gậy, quả châu vàng, ngôi sao.
- **Chân màn hình**: đồi tuyết trắng chạy ngang đáy (cao ở 2 bên, thấp ở giữa) có hàng thông xa phủ tuyết và tuyết lấp lánh. Tuần lộc và người tuyết đứng trong tuyết. Chồng 3 hộp quà ở góc phải.
- **Bầu trời**: tuyết rơi dày hơn khoảng 50% (vẫn nhẹ). Thêm 5 bông tuyết to xoay chậm khi rơi. Khoảng 42 giây một lần, **xe trượt tuyết của ông già Noel** (2 tuần lộc kéo, ông vẫy tay, túi quà) bay vòng cung từ phải sang trái.
- **Trên chữ và thẻ**: mũ Noel đội lệch trên chữ cái đầu của tên bé (thỉnh thoảng lắc nhẹ). Nhãn "Mừng thôi nôi" có cành nhựa ruồi và quả chuông đung đưa. Tuyết đọng có giọt băng trên mép trên 3 thẻ.
- **Tương tác cho các bé** (`js/home.js` mới):
  - Bấm vào mèo / tuần lộc / người tuyết thì con vật nhún nhảy, hiện bong bóng lời chúc có tên bé ("Meo meo! Chúc mừng thôi nôi bé Na!", "Ho ho ho!"…) kèm tiếng chuông leng keng mới (`sfx.jingle`). Mỗi lần bấm một câu khác.
  - Rê chuột để lại vệt lấp lánh vàng nhỏ.
  - Rê vào thẻ game thì hình minh hoạ lắc nhẹ.
- Phần tự co cho vừa màn hình chuyển từ `app.js` sang `home.js`. Trang chính giờ là một màn có `init/enter/leave` như các game.
- Mọi chuyển động chậm, không chớp. Máy bật "giảm chuyển động" thì tự tắt. Điện thoại ẩn phần trang trí.

**Đã kiểm tra** (Edge headless, `file://`): 1920×1080, 1600×900, 1366×657, 1280×720, 1024×768 đều vừa một màn, không tràn ngang. Dừng hiệu ứng xe tuần lộc ở 7% và 27% để chụp: hiện đúng. Bấm tuần lộc → bong bóng "Ho ho ho! Ông già Noel sắp tới rồi!". Chạy lại toàn bộ kịch bản 3 game + thao tác trang chính: đạt, không lỗi.

## Việc cần làm trước ngày tiệc (người dùng)
1. Nhấp đúp `index.html` (luôn dùng cùng một trình duyệt), nhập dữ liệu thật trong Cài đặt (tên bé, danh sách các bé kèm trai/gái, khách, giải thưởng) → Xuất file sao lưu.
2. Thử trên máy chiếu/TV thật: bấm `F` toàn màn hình, kiểm tra màu, cỡ chữ và âm lượng.
3. Chạy thử xong → Cài đặt → Làm lại từ đầu (xoá thẻ ước mơ, cây thông, bốc thăm).
