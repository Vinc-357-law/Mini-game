# Mini game Thôi nôi · Giáng sinh

Web mini game cho tiệc thôi nôi mùa Noel, tông đỏ và xanh lá, gồm 3 trò:

1. **Con của tương lai**: bé chọn một nghề, màn hình lật ra **thẻ ước mơ** có hình bé mặc đồ của nghề đó kèm tên bé.
2. **Cùng trang trí cây thông**: bé treo đồ trang trí lên cây và nhận một hộp quà mang tên mình.
3. **Lò nướng bánh gừng may mắn**: bốc thăm trúng thưởng cho khách mời.

Web viết bằng HTML/CSS/JS thuần, không cần webcam, không cần server và **chạy được khi không có mạng**. Font chữ đã nằm sẵn trong thư mục dự án.

---

## 1. Cách chạy

**Nhấp đúp `index.html`** là xong. Nên mở bằng **Chrome** hoặc **Edge**.

> Dữ liệu (danh sách, thẻ ước mơ, kết quả) lưu **trong trình duyệt đang dùng**. Hãy luôn mở bằng **cùng một trình duyệt trên cùng một máy**. Đổi sang trình duyệt hoặc máy khác thì dùng Xuất / Nhập file sao lưu.

## 2. Chuẩn bị trước tiệc (Cài đặt ⚙)

Bấm biểu tượng ⚙ ở góc trên bên phải. Các ô đều nhập theo kiểu **mỗi dòng một mục**, dán từ Excel hoặc Zalo vào là được:

| Ô | Cách ghi mỗi dòng | Ví dụ |
|---|---|---|
| Tên em bé | (một dòng) | `Na` |
| Danh sách nghề | `Tên nghề \| biểu tượng` | `Bác sĩ \| 🩺` |
| Các bé dự tiệc | `Tên bé` hoặc `Tên bé \| trai/gái` | `Bin \| trai` |
| Danh sách khách | `Tên khách \| Bàn số` | `Chú Hùng \| Bàn 3` |
| Giải thưởng | `Tên giải \| Phần quà \| Số lượng` | `Giải Ba \| 1 phần quà \| 2` |

- Ghi kèm **trai/gái** cho các bé (viết `trai`, `bé trai`, `nam` hay `gái`, `bé gái`, `nữ` đều được) thì thẻ ước mơ tự chọn đúng hình bé trai hoặc bé gái.
- Giải thưởng nên xếp **từ giải thấp đến giải cao**, vì game bốc lần lượt theo đúng thứ tự này.
- Từ **31 khách** trở lên, bánh trong lò hiện **số bàn** thay vì tên để màn hình đỡ rối. Lúc công bố vẫn hiện đầy đủ tên.
- Trang phục có sẵn cho 8 nghề: Bác sĩ, Phi hành gia, Đầu bếp, Lính cứu hỏa, Họa sĩ, Ca sĩ, Cảnh sát, Giáo viên. Nghề khác dùng áo len Noel và vương miện.
- Cạnh ô tên bé có nút chọn **Bé gái / Bé trai**: dùng cho hình của chính bé thôi nôi trên thẻ ước mơ và màn công bố "bé bốc gì".
- **Bình chọn bằng mã QR** (khách đoán bé bốc gì): cần nối Google Sheet một lần, xem **mục 7**.
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
- Bé có trong danh sách kèm trai/gái thì web tự chọn hình. MC bấm Bé trai/Bé gái thì web theo lựa chọn của MC.
- Gõ tên viết thường (vd. `bin`) web tự sửa thành đúng tên trong danh sách (`Bin`).

Bấm **Lưu thẻ** (hoặc `Space`) để cất vào album. Bấm vào tên bé ở thanh dưới nếu cần sửa tên hoặc đổi bé trai/bé gái. Lúc đang sửa tên, bấm **Huỷ** hoặc `Esc` sẽ giữ nguyên tên cũ.
Gợi ý: bố mẹ chụp bé đứng cạnh màn hình lúc thẻ vừa lật.
Nút **Album thẻ** dùng để xem lại, tải từng thẻ, **tải cả bộ (.zip)** hoặc **Trình chiếu** toàn màn hình.

#### Đoán xem bé bốc gì? (nút 🔮 ở Game 1)
Dùng cho lễ bốc đồ của bé thôi nôi. Cần nối Google Sheet trước (mục 7).
1. Bấm **🔮 Đoán bé bốc gì**. Màn hình hiện **mã QR** và biểu đồ. Khách quét mã bằng camera điện thoại, nhập tên, chọn nghề đoán bé sẽ bốc. Biểu đồ tự cập nhật mỗi 4 giây, nghề dẫn đầu có vương miện 👑, có dòng báo ai vừa đoán.
2. Đến giờ bốc đồ, bấm **🎁 Bé bốc đồ!**. Bình chọn tự khoá, màn hình hiện "Bé Na đang bốc đồ…".
3. Bé bốc xong, chủ tiệc **bấm vào món bé đã chọn**. Màn hình công bố "Bé Na đã bốc được Bác sĩ 🩺", số người đoán đúng và tên từng người. Điện thoại của khách cũng báo đúng/sai.
4. Bấm **✨ Tạo thẻ ước mơ cho bé** để làm thẻ cho chính bé thôi nôi với nghề vừa bốc, rồi lưu vào album. Bấm nhầm nghề thì bấm **Chọn lại**.

Chưa nối Google Sheet hoặc mất mạng: vẫn làm được bước 2–4 trên laptop, chỉ không có phần khách đoán.

### Game 2: Cùng trang trí cây thông
Cây thông ở bên trái, bảng **Đồ trang trí** ở bên phải. Bé kéo một món từ bảng lên cây. Thả ra ngoài cây thì món đồ tự quay về bảng. Treo xong, MC chọn tên bé (tên bé đã nhận quà bị gạch đi) → hộp quà ghi tên bé rơi xuống gốc cây, bé lên nhận quà thật.
Treo nhầm thì bấm **Hoàn tác** (dưới bảng). Trang trí xong bấm **Thắp sáng cây thông**: bảng biến mất, cây sáng đèn, hiện lời chúc "Merry Christmas · Chúc mừng thôi nôi bé …" và ông già Noel đi xe tuần lộc bay ngang kéo dải băng **20.12.2026**. Đây là lúc chụp ảnh tập thể. Bấm **Tắt đèn cây thông** để quay lại trang trí tiếp.

### Game 3: Lò nướng bánh gừng may mắn
Bấm **Nướng bánh** (hoặc `Space`): lò sáng dần, bánh nhảy và đổi chỗ, "ting!", rồi người trúng hiện ra giữa màn hình.
- **Tiếp tục**: ghi người trúng vào bảng và chuyển sang lượt tiếp theo.
- **Bốc lại (vắng mặt)**: người trúng không có mặt sẽ được ghi "vắng", web bốc lại cho chính giải đó.
- Lỡ bấm sang màn hình khác khi lò đang nướng thì lượt đó bị huỷ, chưa ai trúng. Vào lại bấm Nướng bánh từ đầu.
- Có thể sửa số lượng hoặc thêm giải giữa chừng. Web đếm số người đã trúng của từng giải để biết đang bốc giải nào.

## 4. Nhạc nền riêng (không bắt buộc)

Muốn dùng nhạc riêng thay cho hộp nhạc có sẵn: đặt file nhạc vào `assets/audio/` và đặt tên là **`bgm.mp3`**.

## 5. Gặp sự cố?

| Hiện tượng | Cách xử lý |
|---|---|
| Không nghe nhạc | Bấm vào trang một lần (trình duyệt chặn tự phát nhạc), rồi bấm nút ♪ hoặc phím `M` |
| Mở lên thấy mất danh sách đã nhập | Kiểm tra có đang mở bằng đúng trình duyệt lúc nhập không (Chrome và Edge lưu riêng) |
| Muốn chơi lại từ đầu | Cài đặt → Làm lại từ đầu |
| Đổi sang máy khác | Cài đặt → Xuất file sao lưu → sang máy mới bấm Nhập file. Thẻ ước mơ không nằm trong file sao lưu, hãy tải album .zip trước |
| Kiểm tra kết nối báo "Sai mã PIN chủ tiệc" | Mã PIN trong web khác mã đã dán vào Google: chép lại mã và triển khai lại (mục 7) |
| Báo "Không kết nối được Google" | Kiểm tra mạng của laptop và link `/exec` (dán đủ, không thừa dấu cách) |
| Khách mở mã QR thấy "Chủ tiệc chưa mở bình chọn" | Trên laptop bấm 🔮 Đoán bé bốc gì một lần để gửi danh sách nghề lên Google, rồi bảo khách tải lại trang |

## 6. Dành cho người sửa code

Trang chạy file gộp `js/app.bundle.js`. Sửa các file trong `js/` xong thì chạy lệnh sau để gộp lại (cần Node.js):

```
node tools/build.mjs
```

```
index.html          Trang duy nhất (5 màn hình)
css/                main.css (chung, bảng màu) + home.css (trang chính kiểu sticker) + game1/2/3.css
js/
  app.js            Điều hướng, phím tắt, nhạc, toàn màn hình
  storage.js        Lưu cài đặt + tiến độ (localStorage), đọc danh sách
  db.js             Lưu thẻ ước mơ (IndexedDB)
  art.js            Toàn bộ hình minh hoạ SVG (bé mặc đồ nghề, cây thông, lò...)
  audio.js          Chuông, "ting", nhạc hộp (Web Audio)
  snow.js           Tuyết rơi
  settings.js       Màn hình Cài đặt
  home.js           Trang chính (tự co màn hình, con vật biết nói, vệt lấp lánh)
  game1.js          Thẻ ước mơ
  guess.js          Game 1 · Đoán xem bé bốc gì (QR, biểu đồ, công bố)
  vote.js           Kết nối Google Apps Script (JSONP) + vẽ mã QR
  gas-code.js       (tự tạo) mã Apps Script để nút "Chép mã cho Google" dùng
  game2.js          Cây thông
  game3.js          Lò nướng bánh gừng
  zip.js, ui.js     Tiện ích
  app.bundle.js     (tự tạo) bản gộp mà index.html chạy
tools/build.mjs     Gộp các file JS thành js/app.bundle.js
tools/google-apps-script/Code.gs   Mã chạy trong Google Sheet (API + trang bình chọn của khách)
assets/vendor/qrcode.js            Thư viện tạo mã QR (qrcode-generator, giấy phép MIT)
assets/             font (Be Vietnam Pro, Dancing Script, Baloo 2, Mali), favicon, (nhạc nền tuỳ biến)
plan.md             Kế hoạch & nhật ký tiến độ
```

## 7. Bình chọn bằng mã QR: nối Google Sheet (làm 1 lần, 5–10 phút)

Phần "Đoán xem bé bốc gì?" lưu phiếu của khách vào **Google Sheet của bạn**. Bạn cần một tài khoản Google. Tên nút trong Google có thể hơi khác tuỳ ngôn ngữ, tên tiếng Anh ghi trong ngoặc.

1. Trong web, vào **Cài đặt ⚙ → Bình chọn bằng mã QR**. Xem (hoặc đổi) **Mã PIN chủ tiệc**, rồi bấm **Chép mã cho Google**.
2. Mở **sheets.new** trên trình duyệt (tạo Google Sheet mới), đặt tên ví dụ "Thôi nôi – Đoán bé bốc gì".
3. Menu **Tiện ích mở rộng (Extensions) → Apps Script**. Xoá hết mã có sẵn trong `Code.gs`, **dán** mã vừa chép (Ctrl+V), bấm biểu tượng 💾 để lưu.
4. Bấm **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)** → bấm ⚙ cạnh "Chọn loại", chọn **Ứng dụng web (Web app)**:
   - Thực thi với tư cách (Execute as): **Tôi (Me)**
   - Người có quyền truy cập (Who has access): **Bất kỳ ai (Anyone)**
   - Bấm **Triển khai (Deploy)**.
5. Google hỏi cấp quyền: chọn tài khoản của bạn → màn "Google chưa xác minh ứng dụng này" (vì là mã tự viết) → **Nâng cao (Advanced)** → **Đi tới … (không an toàn)** → **Cho phép (Allow)**.
6. Chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`) → dán vào ô số 2 trong Cài đặt của web → bấm **Kiểm tra kết nối**. Thấy "Kết nối tốt ✓" là xong.

Lưu ý:
- Trong Google Sheet sẽ có 2 trang tính: **Phiếu** (mỗi khách một dòng: giờ, tên, nghề đoán) và **Thống kê** (số người đoán từng nghề, kết quả, người đoán đúng).
- **Đổi mã PIN** trong web thì phải chép lại mã, dán đè vào Apps Script rồi **triển khai lại**: Triển khai → Quản lý các lần triển khai (Manage deployments) → ✎ → Phiên bản (Version): **Phiên bản mới (New version)** → Triển khai. Link `/exec` giữ nguyên.
- Chạy thử xong, vào **Cài đặt → Làm lại từ đầu → Xoá phiếu đoán bé bốc gì** để xoá phiếu thử (cả trên Google Sheet).
- Ở tiệc cần **Internet**: điện thoại khách dùng 4G/Wi-Fi để mở trang bình chọn, laptop cần mạng để biểu đồ cập nhật. Trang của khách có một dòng chữ nhỏ của Google ở đầu, đó là bình thường.
- Mỗi điện thoại chỉ có 1 phiếu, khách được đổi ý cho tới khi chủ tiệc khoá.
