# Roomie — Tìm phòng trọ & ghép bạn cùng phòng sinh viên

> *"Tìm đúng phòng, ghép đúng người — Sống chung bình yên."*

Đồ án học phần Nhập môn Công nghệ Thông tin (HCMUS) — Kiến trúc **Client–Server (Frontend tách biệt Database)**:
- **Frontend (`src/`)**: Thuần giao diện HTML/Tailwind CSS/JS, **không lưu database**, không nhúng mật khẩu hay SĐT/Zalo nhạy cảm. Toàn bộ dữ liệu nghiệp vụ được nạp động qua REST API (`/api/*`).
- **Backend (`api/` + `backend/` + `server.js`)**: Node.js REST API + Vercel Serverless Function, kết nối **Supabase PostgreSQL** (`DATABASE_URL`) qua thư viện `pg`.

---

## 1. Kiến trúc & Điểm nổi bật

1. **Không đẩy database lên Frontend (`src/`)**:
   - Danh sách phòng trọ, hồ sơ roommate, câu hỏi trắc nghiệm, bảng giá, tài khoản (`scrypt` salted hash), đơn VietQR và kết nối Double Opt-in lưu **100% trong Supabase PostgreSQL (14 bảng)**.
   - Số điện thoại / Zalo chỉ được trả về sau khi cả hai bên **Đồng ý kết nối (Double Opt-in)**.
2. **Bảo vệ kết quả trắc nghiệm theo Gói 4 / Gói 5**:
   - Endpoint `GET /api/quiz/predictions` kiểm tra gói `unlimited-matches-day` (Gói 4) hoặc `all-in-one` (Gói 5) trực tiếp trong bảng `user_plans` phía server; kết quả `% Hợp gu` bị làm mờ và khóa cho tới khi kích hoạt gói hợp lệ.
3. **Hỗ trợ TP.HCM (17 quận/TP) & Hà Nội (12 quận)**:
   - Tích hợp 117 trường Đại học/Học viện, bộ lọc phòng & tìm roommate, phân quyền Sinh viên vs Chủ nhà (`student` / `landlord`), cùng tính năng **Đăng nhập nhanh Demo (Minh Thư / Hoàng Nam)** qua API cookie `HttpOnly` để giảng viên chấm điểm thuận tiện.

---

## 2. Cấu trúc thư mục

```text
.
├── api/
│   └── handler.js                  # Entry point cho Vercel Serverless (/api/*)
├── backend/
│   ├── config.js                   # Đọc DATABASE_URL (SSL Supabase), VietQR & flags
│   ├── database/
│   │   ├── schema.postgres.sql     # DDL PostgreSQL (14 bảng quan hệ & indexes)
│   │   ├── seed-data.js            # Dữ liệu mẫu chuẩn đồng bộ TP.HCM & Hà Nội
│   │   ├── db.js                   # Repository layer bất đồng bộ dùng pg.Pool
│   │   └── seed.js                 # CLI khởi tạo/reset schema & seed dữ liệu
│   ├── routes/
│   │   └── api.js                  # Router REST API (/api/*), xác thực cookie session
│   └── services/
│       ├── matching.js             # Thuật toán chấm điểm hợp gu 9 câu (lọc cứng + trọng số)
│       └── vietqr.js               # Tạo mã VietQR / Demo QR thanh toán gói
├── server.js                       # Máy chủ chạy local (Static src/ + /api/*)
├── vercel.json                     # Cấu hình deploy Vercel (outputDirectory: src + rewrites /api/*)
├── package.json                    # Dependencies (pg, dotenv, qrcode) & scripts
└── src/                            # Pure Frontend (không chứa database)
    ├── index.html
    ├── pages/*.html
    ├── assets/
    └── scripts/
```

---

## 3. Hướng dẫn chạy Local & Kết nối Supabase (Free)

### Bước 1: Tạo Database miễn phí trên Supabase
1. Đăng ký/đăng nhập [Supabase](https://supabase.com), tạo project mới (chọn region Singapore `ap-southeast-1`).
2. Vào **Connect -> Connection String -> Transaction pooler** (hoặc Session pooler), copy chuỗi kết nối URI dạng:
   ```text
   postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

### Bước 2: Cấu hình môi trường & Seed dữ liệu
```bash
npm install
cp .env.example .env
# Mở .env và dán chuỗi DATABASE_URL của Supabase vào dòng DATABASE_URL=...

npm run db:seed
npm start
```
Mở trình duyệt tại: `http://localhost:3000/roomie`

> Lưu ý: Để reset toàn bộ bảng và nạp lại dữ liệu gốc bất kỳ lúc nào:
> `node backend/database/seed.js --reset`

---

## 4. Deploy lên Vercel để lấy Link chấm điểm (`.txt`)

1. Đẩy source code lên GitHub (file `.env` và `node_modules/` đã được `.gitignore` loại trừ tự động).
2. Đăng nhập [Vercel](https://vercel.com) -> **Add New Project** -> Import repository.
3. Trong **Environment Variables** của project trên Vercel, thêm biến:
   - `DATABASE_URL` = chuỗi kết nối Supabase Pooler URI
   - `ROOMIE_ENABLE_DEMO_LOGIN` = `true` (để giảng viên dùng nút Đăng nhập nhanh demo)
4. Bấm **Deploy**. Khi deploy xong, kiểm tra `https://<ten-project>.vercel.app/api/health` trả về `ok: true` và mở `https://<ten-project>.vercel.app/roomie`.
5. Lưu link vào file `.txt` (ví dụ `link_website.txt`) và nộp cho giảng viên.

---

## 5. Kiểm thử tự động

Chạy toàn bộ unit & API tests (sử dụng In-Memory PostgreSQL Test Pool, không cần internet):
```bash
npm test
```
