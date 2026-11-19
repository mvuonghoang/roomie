# Roomie — Frontend Website

> *"Tìm đúng phòng, ghép đúng người — Sống chung bình yên."*

Nền tảng tìm phòng trọ minh bạch chi phí và ghép đôi bạn cùng phòng tương hợp lối sống dành cho sinh viên (Đồ án học phần CNTT — Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM).

---

## 1. Yêu cầu môi trường

- **Node.js** (khuyến nghị bản LTS trở lên — dự án dùng server HTTP thuần của Node.js, **không cần cài thêm package npm ngoài**).

## 2. Cách chạy website ở local

Clone repository và khởi chạy server bằng một trong hai lệnh sau:

```bash
git clone https://github.com/mvuonghoang/roomie.git
cd roomie
npm start
```

Hoặc:

```bash
node server.js
```

Sau đó mở trình duyệt tại:
- **`http://localhost:3000/roomie`** (truy cập `http://localhost:3000/` sẽ tự chuyển hướng sang `/roomie`).
- Khi chỉnh sửa file HTML/CSS/JS trong `src/`, chỉ cần **tải lại trang (`F5`)** là thấy thay đổi ngay (server đã tắt cache ở local).

---

## 3. Cấu trúc thư mục

```text
.
├── server.js                  # Node.js static & route server (cổng mặc định 3000)
├── vercel.json                # Cấu hình static deploy & rewrite/redirect cho Vercel
├── package.json               # Script khởi chạy (npm start / npm run dev)
├── info/                      # Tài liệu định hướng sản phẩm & hệ thống thiết kế
│   ├── DESIGN.md              # Bảng màu, typography (Be Vietnam Pro), spacing, components
│   ├── overview.md            # Tổng quan sản phẩm & mô hình hoạt động
│   └── ...
└── src/                       # Toàn bộ mã nguồn Frontend
    ├── index.html             # Trang chủ (/roomie)
    ├── pages/                 # Các trang chức năng
    │   ├── tim-phong.html         # Tìm phòng trọ (/roomie/tim-phong)
    │   ├── phong-chi-tiet.html    # Chi tiết phòng (/roomie/phong-chi-tiet)
    │   ├── trac-nghiem.html       # Trắc nghiệm hợp gu (/roomie/trac-nghiem)
    │   ├── tim-roommate.html      # Kết quả match & tìm roommate (/roomie/tim-roommate)
    │   ├── dang-tin.html          # Đăng tin tìm bạn ghép / cho thuê (/roomie/dang-tin)
    │   ├── bang-gia.html          # Bảng giá & dịch vụ (/roomie/bang-gia)
    │   ├── ve-chung-toi.html      # Về chúng tôi (/roomie/ve-chung-toi)
    │   ├── lien-he.html           # Liên hệ & FAQ (/roomie/lien-he)
    │   └── an-toan.html           # An toàn & hỗ trợ sinh viên (/roomie/an-toan)
    ├── scripts/
    │   ├── data.js                # Dữ liệu mẫu phòng, roommate, câu hỏi quiz, bảng giá, liên hệ, điều hướng
    │   ├── core.js                # State localStorage, modal dùng chung, Double Opt-in, formatters
    │   ├── layout.js              # Component Header & Footer dùng chung toàn site
    │   ├── location-picker.js     # Bộ lọc quận/huyện TP.HCM & Hà Nội, autocomplete trường ĐH
    │   ├── pricing-widget.js      # Widget chuyển đổi chu kỳ & trạng thái gói dịch vụ
    │   ├── universities-vn.js     # Danh sách trường ĐH & quận/huyện TP.HCM, Hà Nội
    │   └── pages/                 # Module JS riêng cho từng trang (home, find-rooms, room-detail, quiz, match-results, post-listing, pricing, safety, contact)
    ├── styles/
    │   ├── main.css               # Base styles & animation
    │   └── tailwind.config.js     # Token màu sắc, font chữ, spacing theo DESIGN.md
    └── assets/
        ├── docs/                  # Biểu mẫu nội quy PDF tải trực tiếp
        └── images/                # Hình ảnh & logo giao diện theo từng trang
```

---

## 4. Hướng dẫn nhanh cho thành viên cùng thiết kế UI

- **Sửa bố cục / nội dung từng trang:** Mở file tương ứng trong `src/index.html` hoặc `src/pages/*.html`.
- **Sửa Header / Footer dùng chung toàn website:** Chỉnh trong `src/scripts/layout.js` và cấu trúc link trong `src/scripts/data.js`.
- **Sửa màu sắc / font / kích thước chữ toàn site:** Chỉnh trong `src/styles/tailwind.config.js` và `src/styles/main.css` (tham chiếu chuẩn thiết kế tại `info/DESIGN.md`).
- **Sửa dữ liệu hiển thị (phòng trọ, hồ sơ roommate, câu hỏi trắc nghiệm, gói dịch vụ, thông tin liên hệ):** Chỉnh trong `src/scripts/data.js`.
- **Sửa tương tác chung (modal, Double Opt-in, state) hoặc từng trang:** Chỉnh trong `src/scripts/core.js` hoặc module tương ứng trong `src/scripts/pages/*.js`.
- **Gợi ý làm việc nhóm:** Mỗi thành viên nên tạo nhánh riêng (ví dụ `feat/ui-trang-chu`, `feat/ui-tim-phong`) và pull code từ `main` trước khi chỉnh sửa để tránh xung đột file.
