# Mini game Thôi nôi · Giáng sinh

Web mini game cho tiệc thôi nôi mùa Noel, gồm 3 trò:

1. **Con của tương lai**: photobooth, bé chọn nghề rồi chụp ảnh có mũ, đạo cụ và viền Noel.
2. **Cùng trang trí cây thông**: bé treo đồ trang trí lên cây và nhận một hộp quà mang tên mình.
3. **Lò nướng bánh gừng may mắn**: bốc thăm trúng thưởng cho khách mời.

Web viết bằng HTML/CSS/JS thuần, không cần server riêng và **chạy được khi không có mạng**. Font chữ và thư viện đều đã nằm sẵn trong thư mục dự án.

---

## 1. Cách chạy

**Cách 1 (dễ nhất, không cần cài gì):** nhấp đúp **`Mo-web.bat`**.
Một cửa sổ đen hiện ra và trình duyệt tự mở `http://localhost:5500/`. **Giữ cửa sổ đen mở** suốt buổi tiệc, vì đóng nó là tắt web.

**Cách 2 (VS Code):** cài extension **Live Server** (tác giả Ritwick Dey), rồi chuột phải `index.html` → **Open with Live Server**.

Nên dùng **Chrome** hoặc **Edge**.

> ⚠️ Không mở `index.html` bằng cách nhấp đúp vào file. Trình duyệt sẽ chặn game và webcam, trang chỉ hiện hướng dẫn mở lại cho đúng.

Lần đầu vào Photobooth, trình duyệt hỏi quyền dùng camera. Bấm **Cho phép**.

## 2. Chuẩn bị trước tiệc (Cài đặt ⚙)

Bấm biểu tượng ⚙ ở góc trên bên phải. Các ô đều nhập theo kiểu **mỗi dòng một mục**, dán từ Excel hoặc Zalo vào là được:

| Ô | Cách ghi mỗi dòng | Ví dụ |
|---|---|---|
| Tên em bé | (một dòng) | `Na` |
| Danh sách nghề | `Tên nghề \| biểu tượng` | `Bác sĩ \| 🩺` |
| Các bé dự tiệc | tên bé | `Bin` |
| Danh sách khách | `Tên khách \| Bàn số` | `Chú Hùng \| Bàn 3` |
| Giải thưởng | `Tên giải \| Phần quà \| Số lượng` | `Giải Ba \| 1 phần quà \| 2` |

- Giải thưởng nên xếp **từ giải thấp đến giải cao**, vì game bốc lần lượt theo đúng thứ tự này.
- Từ **31 khách** trở lên, bánh trong lò hiện **số bàn** thay vì tên để màn hình đỡ rối. Lúc công bố vẫn hiện đầy đủ tên.
- Hình mũ và đạo cụ có sẵn cho 8 nghề: Bác sĩ, Phi hành gia, Đầu bếp, Lính cứu hỏa, Họa sĩ, Ca sĩ, Cảnh sát, Giáo viên. Nghề khác sẽ dùng mũ vương miện.
- Mọi thay đổi **tự lưu** trong trình duyệt. Tải lại trang không mất dữ liệu.
- **Xuất file sao lưu**: soạn sẵn ở nhà, xuất file `.json`, mang sang máy ở tiệc rồi bấm **Nhập file sao lưu**.
- **Photobooth nâng cao**: bật công tắc để mũ tự bám theo đầu bé. Nếu máy yếu hoặc không nhận ra mặt, web tự quay về khung tròn cố định.

Trước tiệc nhớ bấm các nút **Làm lại** trong Cài đặt để xoá dữ liệu chạy thử: ảnh, cây thông, kết quả bốc thăm.

## 3. Điều khiển cho MC

Chỉ cần dùng chuột. Có thêm vài phím tắt:

| Phím | Tác dụng |
|---|---|
| `Space` | Hành động chính của màn hình đang mở: Chụp ảnh / Giữ ảnh / Thắp sáng cây / Nướng bánh / Tiếp tục |
| `Esc` | Đóng hộp thoại đang mở. Nếu không có hộp thoại nào thì về màn hình chính |
| `F` | Bật/tắt toàn màn hình |
| `M` | Bật/tắt nhạc nền |
| `1` `2` `3` | Ở màn hình chính: mở thẳng game tương ứng |

### Game 1: Con của tương lai
Bé chọn nghề → MC gõ tên bé (hoặc chọn nhanh, hoặc **Bỏ qua**) → bé đưa mặt vào ô tròn → bấm **Chụp ảnh** (hoặc `Space`). Web đếm ngược 3-2-1 rồi chụp → **Giữ ảnh** hoặc **Chụp lại**.
Nút **Album ảnh** dùng để xem lại, tải từng ảnh, **tải cả bộ (.zip)** hoặc **Trình chiếu** toàn màn hình.

### Game 2: Cùng trang trí cây thông
Bé kéo một món từ khay lên cây. Thả ra ngoài cây thì món đồ tự quay về khay. Treo xong, MC chọn tên bé (tên bé đã nhận quà bị gạch đi) → hộp quà ghi tên bé rơi xuống gốc cây, bé lên nhận quà thật.
Treo nhầm thì bấm **Hoàn tác**. Cuối game bấm **Thắp sáng cây thông** để chụp ảnh tập thể.

### Game 3: Lò nướng bánh gừng may mắn
Bấm **Nướng bánh** (hoặc `Space`): lò sáng dần, bánh nhảy và đổi chỗ, "ting!", rồi người trúng hiện ra giữa màn hình.
- **Tiếp tục**: ghi người trúng vào bảng và chuyển sang lượt tiếp theo.
- **Bốc lại (vắng mặt)**: người trúng không có mặt sẽ được ghi "vắng", web bốc lại cho chính giải đó.

## 4. Tuỳ biến hình ảnh và âm thanh (không bắt buộc)

Web đã có sẵn toàn bộ hình vẽ và âm thanh. Nếu muốn dùng hình hoặc nhạc riêng, đặt file vào đúng chỗ và đúng tên, web sẽ tự dùng:

| File | Dùng cho |
|---|---|
| `assets/props/<nghề>-hat.png` | Mũ (PNG nền trong suốt, tỉ lệ 3:2, đáy mũ ở mép dưới) |
| `assets/props/<nghề>-prop.png` | Đạo cụ (PNG vuông) |
| `assets/props/frame.png` | Viền Noel cho ảnh (1600×1200, giữa trong suốt) |
| `assets/audio/bgm.mp3` | Nhạc nền thay cho hộp nhạc có sẵn |

`<nghề>` là một trong các tên: `doctor`, `astronaut`, `chef`, `firefighter`, `painter`, `singer`, `police`, `teacher`.

> Khi chưa thêm file PNG riêng, trình duyệt sẽ ghi lỗi 404 cho các file này trong Console. Đó là bình thường, web tự dùng hình vẽ sẵn.

## 5. Gặp sự cố?

| Hiện tượng | Cách xử lý |
|---|---|
| Không thấy webcam | Mở qua Live Server. Bấm biểu tượng 🎥 trên thanh địa chỉ → Cho phép. Tắt Zoom/Meet nếu đang dùng camera |
| Không nghe nhạc | Bấm vào trang một lần (trình duyệt chặn tự phát nhạc), rồi bấm nút ♪ hoặc phím `M` |
| Muốn chơi lại từ đầu | Cài đặt → Làm lại từ đầu |
| Đổi sang máy khác | Cài đặt → Xuất file sao lưu → sang máy mới bấm Nhập file. Ảnh chụp không nằm trong file sao lưu, hãy tải album .zip trước |

## 6. Cấu trúc thư mục

```
index.html          Trang duy nhất (5 màn hình)
css/                main.css (chung) + game1/2/3.css
js/
  app.js            Điều hướng, phím tắt, nhạc, toàn màn hình
  storage.js        Lưu cài đặt + tiến độ (localStorage), đọc danh sách
  db.js             Lưu ảnh (IndexedDB)
  art.js            Toàn bộ hình minh hoạ SVG
  audio.js          Chuông, "ting", nhạc hộp (Web Audio)
  snow.js           Tuyết rơi
  settings.js       Màn hình Cài đặt
  game1.js          Photobooth  · facetrack.js: bám khuôn mặt (MediaPipe)
  game2.js          Cây thông
  game3.js          Lò nướng bánh gừng
  zip.js, ui.js     Tiện ích
assets/             font, favicon, thư viện MediaPipe, (hình/nhạc tuỳ biến)
plan.md             Kế hoạch & nhật ký tiến độ
```
