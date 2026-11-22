# Roomie — Fullstack Website (Frontend + Backend + SQLite Database)

> *"Tìm đúng phòng, ghép đúng người — Sống chung bình yên."*

Nền tảng tìm phòng trọ minh bạch chi phí và ghép đôi bạn cùng phòng tương hợp lối sống dành cho sinh viên (Đồ án học phần CNTT — Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM).

---

## 1. Yêu cầu môi trường

- **Node.js** (bản v22.5+ / v24 LTS trở lên — dự án dùng HTTP thuần, SQLite `node:sqlite`, `dotenv` để nạp cấu hình local và `qrcode` để tạo mã thanh toán VietQR ngay trên server).

## 2. Cách chạy website & database ở local

Clone repository và khởi chạy server bằng một trong các lệnh sau:

```bash
git clone https://github.com/mvuonghoang/roomie.git
cd roomie
npm start
```

Chạy website bằng `npm start` tại `http://localhost:3000/roomie` để dùng được các API; không mở bằng Live Server hoặc preview tĩnh vì các cách đó không có endpoint `/api/*`. Nếu chưa cấu hình ngân hàng, checkout tự tạo **QR demo không thể thanh toán** để thử giao diện và luồng kích hoạt. Muốn tạo VietQR nhận tiền thật, sao chép `.env.example` thành `.env` rồi điền mã BIN, tên ngân hàng, số tài khoản và tên chủ tài khoản. `.env` đã được gitignore; không commit thông tin tài khoản thật.

Các gói hiện có giá 49.000đ (thêm 3 tin/ngày), 19.000đ (đẩy 24 giờ), 69.000đ (đẩy 7 ngày), 35.000đ (match không giới hạn trong ngày Việt Nam) và 149.000đ (trọn bộ 30 ngày). Gói theo ngày hết hạn lúc 00:00 giờ Việt Nam; gói đẩy và trọn bộ dùng thời hạn ghi trên gói. Nút xác nhận thanh toán kích hoạt gói ngay nhưng **không tự đối soát với ngân hàng**; người dùng có thể xác nhận dù chưa chuyển tiền.

Các lệnh quản trị cơ sở dữ liệu SQLite (`backend/database/roomie.sqlite`):

```bash
npm run db:seed    # Khởi tạo schema & nạp dữ liệu mẫu (nếu chưa có)
npm run db:reset   # Xóa trắng & nạp lại toàn bộ dữ liệu mẫu chuẩn ban đầu
```

Sau đó mở trình duyệt tại:
- **Website:** **`http://localhost:3000/roomie`** (truy cập `http://localhost:3000/` sẽ tự chuyển hướng sang `/roomie`).
- **Health & Database Stats API:** **`http://localhost:3000/api/health`**
- **Bootstrap Data API:** **`http://localhost:3000/api/bootstrap`**
- Khi chỉnh sửa file HTML/CSS/JS trong `src/`, chỉ cần **tải lại trang (`F5`)** là thấy thay đổi ngay (server đã tắt cache ở local).

---

## 3. Cấu trúc thư mục

```text
.
├── server.js                  # Node.js Fullstack Server (Static routes + REST API /api/*)
├── api/
│   └── index.js               # Serverless entry point cho Vercel (/api/*)
├── backend/                   # Toàn bộ mã nguồn Backend & Cơ sở dữ liệu
│   ├── database/
│   │   ├── schema.sql         # Định nghĩa 14 bảng quan hệ SQLite (users, rooms, roommates, connections...)
│   │   ├── seed-data.js       # Bộ dữ liệu mẫu chuẩn (phòng trọ, ứng viên, gói dịch vụ, thông báo)
│   │   ├── db.js              # SQLite Database Engine (node:sqlite) & Repository Layer
│   │   ├── seed.js            # CLI script khởi tạo, reset và thống kê bản ghi CSDL
│   │   └── roomie.sqlite      # File cơ sở dữ liệu SQLite lưu trữ bền vững
│   ├── routes/
│   │   └── api.js             # RESTful API Router xử lý toàn bộ endpoints /api/*
│   └── services/
│       └── matching.js        # Thuật toán Compatibility Engine 2 lớp (>85% hợp gu lối sống)
├── vercel.json                # Cấu hình deploy & rewrite cho cả Frontend lẫn Backend API
├── package.json               # Scripts khởi chạy server & quản lý database
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
    │   ├── data.js                # Dữ liệu mẫu fallback & cấu hình điều hướng
    │   ├── core.js                # Đồng bộ REST API (/api/*) + localStorage, Auth, Double Opt-in, Modals
    │   ├── layout.js              # Component Header & Footer dùng chung toàn site
    │   ├── location-picker.js     # Bộ lọc quận/huyện TP.HCM & Hà Nội, autocomplete trường ĐH
    │   ├── pricing-widget.js      # Widget chuyển đổi chu kỳ & trạng thái gói dịch vụ
    │   ├── universities-vn.js     # Danh sách trường ĐH & quận/huyện TP.HCM, Hà Nội
    │   └── pages/                 # Module JS riêng cho từng trang
    ├── styles/
    │   ├── main.css               # Base styles & animation
    │   └── tailwind.config.js     # Token màu sắc, font chữ, spacing theo DESIGN.md
    └── assets/
        ├── docs/                  # Biểu mẫu nội quy PDF tải trực tiếp
        └── images/                # Hình ảnh & logo giao diện theo từng trang
```

---

## 4. Kiến trúc Cơ sở dữ liệu (SQLite) & RESTful API

### 4.1. Các bảng trong CSDL (`backend/database/schema.sql`)
1. **`users`**: Tài khoản sinh viên & chủ trọ (mật khẩu băm SHA-256 + salt, tự động cấp tích xanh `verified_student` cho email `.edu.vn`).
2. **`sessions`**: Quản lý phiên đăng nhập (`Bearer token` & cookie `rm_token`).
3. **`rooms`**: Danh sách phòng trọ & tin đăng tìm bạn ở ghép (tách bạch chi phí điện, nước, dịch vụ, gửi xe, trạng thái `active`/`filled`/`paused`, `last_ping_at` chống "phòng ma").
4. **`roommates`**: Hồ sơ ứng viên tìm bạn cùng phòng & vector thói quen sinh hoạt (`quiz_profile_json`).
5. **`roommate_daily_post_usage`**: Theo dõi quota đăng roommate theo ngày Việt Nam, kể cả khi bài đăng bị xóa.
6. **`roommate_match_daily_usage`**: Giới hạn một lần làm mới kết quả/ngày cho tài khoản chưa có gói match không giới hạn.
7. **`saved_rooms`**: Danh sách phòng yêu thích đã lưu theo từng người dùng.
8. **`quiz_submissions`**: Lưu đáp án trắc nghiệm, cá tính ở trọ (`archetype`) và điểm các trụ cột lối sống.
9. **`connections`**: Quản lý kết nối 2 chiều **Double Opt-in** (`incoming`, `pending`, `accepted`, `matched`, `released`), giới hạn tối đa **3 slot liên hệ song song**.
10. **`user_plans`**: Các quyền lợi đã kích hoạt, thời điểm hết hạn và tin được đẩy.
11. **`plan_purchase_orders`**: Đơn VietQR, mã chuyển khoản, trạng thái và xác nhận kích hoạt.
12. **`notifications`**: Thông báo hệ thống theo người dùng.
13. **`reports`**: Báo cáo tin giả, phòng ma, đòi cọc trước từ trang An toàn & chi tiết phòng.
14. **`contacts`**: Yêu cầu liên hệ & đặt lịch gọi lại Zalo hỗ trợ (kèm mã phiếu `#RM-xxxx`).

### 4.2. Danh sách REST API Endpoints (`backend/routes/api.js`)
- `GET /api/health` — Kiểm tra trạng thái server & số lượng bản ghi của 14 bảng CSDL.
- `GET /api/bootstrap` — Đồng bộ toàn bộ dữ liệu khởi tạo cho Frontend trong 1 request.
- `POST /api/auth/register` | `POST /api/auth/login` | `POST /api/auth/logout` | `GET /api/auth/me` — Xác thực tài khoản sinh viên.
- `GET /api/rooms` | `GET /api/rooms/:id` | `POST /api/rooms` | `DELETE /api/rooms/:id` — Tìm kiếm, lọc, xem chi tiết và đăng tin phòng trọ mới vào CSDL.
- `POST /api/rooms/:id/save` — Lưu / bỏ lưu phòng yêu thích.
- `PATCH /api/rooms/:id/ping` — Chủ trọ xác nhận phòng còn trống định kỳ (chống phòng ma).
- `GET /api/roommates` | `GET /api/roommates/:id` | `POST /api/roommates` | `POST /api/roommates/:id/boost` — Danh sách, quota đăng mỗi ngày và đẩy tin có thời hạn.
- `GET /api/quiz` | `POST /api/quiz/submit` — Chấm điểm Match 2 lớp; Free được làm mới kết quả một lần/ngày, gói 4/5 không giới hạn trong ngày Việt Nam khi còn hạn.
- `GET /api/connections` | `POST /api/connections/invite` | `PATCH /api/connections/:id` — Luồng kết nối 2 chiều Double Opt-in & giải phóng Slot (tối đa 3 slot).
- `GET /api/plans` | `POST /api/plans/checkout` | `POST /api/plans/confirm` | `POST /api/plans/reset` — Tạo đơn VietQR, xác nhận và kích hoạt quyền lợi có thời hạn.
- `GET /api/notifications` | `POST /api/notifications/read-all` — Quản lý thông báo.
- `GET /api/reports` | `POST /api/reports` — Gửi báo cáo tin giả / lừa cọc.
- `GET /api/contacts` | `POST /api/contacts` — Gửi form liên hệ & yêu cầu tư vấn Zalo.

---

## 4. Hướng dẫn nhanh cho thành viên cùng thiết kế UI

- **Sửa bố cục / nội dung từng trang:** Mở file tương ứng trong `src/index.html` hoặc `src/pages/*.html`.
- **Sửa Header / Footer dùng chung toàn website:** Chỉnh trong `src/scripts/layout.js` và cấu trúc link trong `src/scripts/data.js`.
- **Sửa màu sắc / font / kích thước chữ toàn site:** Chỉnh trong `src/styles/tailwind.config.js` và `src/styles/main.css` (tham chiếu chuẩn thiết kế tại `info/DESIGN.md`).
- **Sửa dữ liệu hiển thị (phòng trọ, hồ sơ roommate, câu hỏi trắc nghiệm, gói dịch vụ, thông tin liên hệ):** Chỉnh trong `src/scripts/data.js`.
- **Sửa tương tác chung (modal, Double Opt-in, state) hoặc từng trang:** Chỉnh trong `src/scripts/core.js` hoặc module tương ứng trong `src/scripts/pages/*.js`.
- **Gợi ý làm việc nhóm:** Mỗi thành viên nên tạo nhánh riêng (ví dụ `feat/ui-trang-chu`, `feat/ui-tim-phong`) và pull code từ `main` trước khi chỉnh sửa để tránh xung đột file.
