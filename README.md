# Mini game Thôi nôi · Giáng sinh

Web mini game cho tiệc thôi nôi mùa Noel, tông đỏ và xanh lá, gồm 3 trò:

1. **Con của tương lai**: bé chọn một nghề, màn hình lật ra **thẻ ước mơ** có hình bé mặc đồ của nghề đó kèm tên bé.
2. **Cùng trang trí cây thông**: bé treo đồ trang trí lên cây và nhận một hộp quà mang tên mình.
3. **Lò nướng bánh gừng may mắn**: bốc thăm trúng thưởng cho khách mời.

Web viết bằng HTML/CSS/JS thuần, không cần webcam, không cần server và **chạy được khi không có mạng**. Font chữ đã nằm sẵn trong thư mục dự án.

---

## 1. Cách chạy

**Nhấp đúp `index.html`** là xong. Nên mở bằng **Chrome** hoặc **Edge**.

Cách dự phòng nếu máy chặn mở file: nhấp đúp **`Mo-web.bat`**. Trình duyệt sẽ mở `http://localhost:5500/`. Giữ cửa sổ đen mở suốt buổi tiệc, đóng nó là web tắt.

## 2. Chuẩn bị trước tiệc (Cài đặt ⚙)

Bấm biểu tượng ⚙ ở góc trên bên phải. Các ô đều nhập theo kiểu **mỗi dòng một mục**, dán từ Excel hoặc Zalo vào là được:

| Ô | Cách ghi mỗi dòng | Ví dụ |
|---|---|---|
| Tên em bé | (một dòng) | `Na` |
| Danh sách nghề | `Tên nghề \| biểu tượng` | `Bác sĩ \| 🩺` |
| Các bé dự tiệc | `Tên bé` hoặc `Tên bé \| trai/gái` | `Bin \| trai` |
| Danh sách khách | `Tên khách \| Bàn số` | `Chú Hùng \| Bàn 3` |
| Giải thưởng | `Tên giải \| Phần quà \| Số lượng` | `Giải Ba \| 1 phần quà \| 2` |

- Ghi kèm **trai/gái** cho các bé thì thẻ ước mơ tự chọn đúng hình bé trai hoặc bé gái.
- Giải thưởng nên xếp **từ giải thấp đến giải cao**, vì game bốc lần lượt theo đúng thứ tự này.
- Từ **31 khách** trở lên, bánh trong lò hiện **số bàn** thay vì tên để màn hình đỡ rối. Lúc công bố vẫn hiện đầy đủ tên.
- Trang phục có sẵn cho 8 nghề: Bác sĩ, Phi hành gia, Đầu bếp, Lính cứu hỏa, Họa sĩ, Ca sĩ, Cảnh sát, Giáo viên. Nghề khác dùng áo len Noel và vương miện.
- Mọi thay đổi **tự lưu** trong trình duyệt. Tải lại trang không mất dữ liệu.
- **Xuất file sao lưu**: soạn sẵn ở nhà, xuất file `.json`, mang sang máy ở tiệc rồi bấm **Nhập file sao lưu**.

Trước tiệc nhớ bấm các nút **Làm lại** trong Cài đặt để xoá dữ liệu chạy thử: thẻ ước mơ, cây thông, kết quả bốc thăm.

## 3. Điều khiển cho MC

Chỉ cần dùng chuột. Có thêm vài phím tắt:

| Phím | Tác dụng |
|---|---|
| `Space` | Hành động chính của màn hình đang mở: Lật thẻ / Lưu thẻ / Thắp sáng cây / Nướng bánh / Tiếp tục |
| `Esc` | Đóng hộp thoại đang mở. Nếu không có hộp thoại nào thì về màn hình chính |
| `F` | Bật/tắt toàn màn hình |
| `M` | Bật/tắt nhạc nền |
| `1` `2` `3` | Ở màn hình chính: mở thẳng game tương ứng |

### Game 1: Con của tương lai
Bé chọn một thẻ nghề → MC chọn **Bé trai / Bé gái**, gõ tên bé (hoặc chọn nhanh trong danh sách, hoặc **Bỏ qua**) → bấm **Lật thẻ**. Thẻ đỏ lật ra hình bé mặc đồ nghề kèm dòng *"Mai này Bin là Bác sĩ 🩺"*.
Bấm **Lưu thẻ** (hoặc `Space`) để cất vào album. Bấm vào tên bé ở thanh dưới nếu cần sửa tên.
Gợi ý: bố mẹ chụp bé đứng cạnh màn hình lúc thẻ vừa lật.
Nút **Album thẻ** dùng để xem lại, tải từng thẻ, **tải cả bộ (.zip)** hoặc **Trình chiếu** toàn màn hình.

### Game 2: Cùng trang trí cây thông
Bé kéo một món từ khay lên cây. Thả ra ngoài cây thì món đồ tự quay về khay. Treo xong, MC chọn tên bé (tên bé đã nhận quà bị gạch đi) → hộp quà ghi tên bé rơi xuống gốc cây, bé lên nhận quà thật.
Treo nhầm thì bấm **Hoàn tác**. Cuối game bấm **Thắp sáng cây thông** để chụp ảnh tập thể.

### Game 3: Lò nướng bánh gừng may mắn
Bấm **Nướng bánh** (hoặc `Space`): lò sáng dần, bánh nhảy và đổi chỗ, "ting!", rồi người trúng hiện ra giữa màn hình.
- **Tiếp tục**: ghi người trúng vào bảng và chuyển sang lượt tiếp theo.
- **Bốc lại (vắng mặt)**: người trúng không có mặt sẽ được ghi "vắng", web bốc lại cho chính giải đó.

## 4. Tuỳ biến (không bắt buộc)

| File | Dùng cho |
|---|---|
| `assets/audio/bgm.mp3` | Nhạc nền thay cho hộp nhạc có sẵn |
| `assets/props/frame.png` | Viền Noel riêng cho thẻ ước mơ (1600×1200, giữa trong suốt). Chỉ dùng được khi mở bằng `Mo-web.bat` |

## 5. Gặp sự cố?

| Hiện tượng | Cách xử lý |
|---|---|
| Không nghe nhạc | Bấm vào trang một lần (trình duyệt chặn tự phát nhạc), rồi bấm nút ♪ hoặc phím `M` |
| Nhấp đúp `index.html` mà trang trống | Dùng `Mo-web.bat` |
| Muốn chơi lại từ đầu | Cài đặt → Làm lại từ đầu |
| Đổi sang máy khác | Cài đặt → Xuất file sao lưu → sang máy mới bấm Nhập file. Thẻ ước mơ không nằm trong file sao lưu, hãy tải album .zip trước |

## 6. Dành cho người sửa code

Trang chạy file gộp `js/app.bundle.js`. Sửa các file trong `js/` xong thì chạy lệnh sau để gộp lại (cần Node.js):

```
node tools/build.mjs
```

```
index.html          Trang duy nhất (5 màn hình)
css/                main.css (chung, bảng màu) + game1/2/3.css
js/
  app.js            Điều hướng, phím tắt, nhạc, toàn màn hình
  storage.js        Lưu cài đặt + tiến độ (localStorage), đọc danh sách
  db.js             Lưu thẻ ước mơ (IndexedDB)
  art.js            Toàn bộ hình minh hoạ SVG (bé mặc đồ nghề, cây thông, lò...)
  audio.js          Chuông, "ting", nhạc hộp (Web Audio)
  snow.js           Tuyết rơi
  settings.js       Màn hình Cài đặt
  game1.js          Thẻ ước mơ
  game2.js          Cây thông
  game3.js          Lò nướng bánh gừng
  zip.js, ui.js     Tiện ích
  app.bundle.js     (tự tạo) bản gộp mà index.html chạy
tools/              build.mjs (gộp JS), serve.ps1 (server dự phòng cho Mo-web.bat)
assets/             font, favicon, (nhạc/viền tuỳ biến)
plan.md             Kế hoạch & nhật ký tiến độ
```
