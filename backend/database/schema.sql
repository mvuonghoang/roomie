-- Roomie Match - Relational Database Schema (SQLite)
-- Thiết kế CSDL cho nền tảng tìm phòng trọ minh bạch chi phí & ghép đôi roommate (>85%)

PRAGMA foreign_keys = ON;

-- 1. Bảng Người dùng (Sinh viên & Chủ trọ)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  alt_email TEXT,
  password_hash TEXT NOT NULL,
  short_school TEXT DEFAULT 'HCMUS',
  school TEXT DEFAULT 'ĐH Khoa học Tự nhiên (HCMUS)',
  major TEXT DEFAULT 'Sinh viên • K23',
  gender TEXT DEFAULT 'Nữ',
  id_code TEXT DEFAULT '#SV-8924',
  avatar TEXT DEFAULT '/assets/images/common/avatar-profile.jpg',
  budget_range TEXT DEFAULT '1.8 - 2.5 tr/tháng',
  preferred_areas TEXT DEFAULT 'Làng ĐHQG / Quận 5',
  move_in_time TEXT DEFAULT 'Đầu tháng tới',
  verified_student INTEGER DEFAULT 1,
  role TEXT DEFAULT 'student',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. Bảng Phiên đăng nhập (Auth Sessions)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bảng Phòng trọ & Tin đăng (Rooms & Listings)
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  title TEXT NOT NULL,
  short_title TEXT,
  breadcrumb_title TEXT,
  district_label TEXT NOT NULL,
  area_key TEXT NOT NULL,
  city TEXT DEFAULT 'TP.HCM',
  address TEXT NOT NULL,
  short_address TEXT,
  distance_label TEXT,
  school_distance_badge TEXT,
  price INTEGER NOT NULL,
  price_formatted TEXT NOT NULL,
  total_room_price TEXT,
  area_sqm REAL DEFAULT 25,
  capacity_label TEXT,
  spots_label TEXT,
  badge_text TEXT,
  floor_label TEXT,
  deposit_label TEXT,
  type_key TEXT NOT NULL DEFAULT 'o-ghep',
  type_label TEXT NOT NULL DEFAULT 'Ở ghép',
  match_score INTEGER DEFAULT 92,
  is_new_user_post INTEGER DEFAULT 0,
  is_verified_listing INTEGER DEFAULT 1,
  is_boosted INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  amenities_json TEXT DEFAULT '[]',
  summary_specs TEXT,
  images_json TEXT DEFAULT '[]',
  map_bg TEXT DEFAULT '/assets/images/phong-chi-tiet/map-1.png',
  roommate_json TEXT DEFAULT '{}',
  costs_json TEXT DEFAULT '{}',
  description_json TEXT DEFAULT '[]',
  last_ping_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 4. Bảng Hồ sơ Ứng viên Roommate
CREATE TABLE IF NOT EXISTS roommates (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  short_name TEXT,
  age INTEGER DEFAULT 20,
  gender TEXT NOT NULL,
  school TEXT NOT NULL,
  short_school TEXT,
  major TEXT,
  match_score INTEGER DEFAULT 90,
  match_label TEXT,
  vnu_member INTEGER DEFAULT 1,
  has_room INTEGER DEFAULT 0,
  room_status_title TEXT,
  room_status_detail TEXT,
  linked_room_id TEXT,
  area_key TEXT,
  city TEXT DEFAULT 'TP.HCM',
  budget TEXT,
  avatar TEXT,
  quote TEXT,
  criteria_json TEXT DEFAULT '[]',
  tags_json TEXT DEFAULT '[]',
  contact_json TEXT DEFAULT '{}',
  quiz_profile_json TEXT DEFAULT '{}',
  is_boosted INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 5. Bảng Phòng đã lưu (Saved / Bookmarked Rooms)
CREATE TABLE IF NOT EXISTS saved_rooms (
  user_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, room_id)
);

-- 6. Bảng Kết quả Trắc nghiệm Tính cách & Lối sống (Quiz Submissions)
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  answers_json TEXT NOT NULL DEFAULT '{}',
  gender TEXT,
  preferred_gender TEXT DEFAULT 'all',
  gender_option TEXT DEFAULT 'A',
  archetype TEXT,
  match_count INTEGER DEFAULT 42,
  pillars_json TEXT DEFAULT '{}',
  answered_count INTEGER DEFAULT 0,
  completed_at TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 7. Bảng Kết nối 2 chiều Double Opt-in & Quản lý Slot (Tối đa 3 slot song song)
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  meta TEXT,
  avatar TEXT,
  room_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- incoming | pending | accepted | matched | released
  note TEXT,
  release_reason TEXT DEFAULT '',
  reverted_once INTEGER DEFAULT 0,
  phone TEXT,
  zalo TEXT,
  facebook TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, partner_id)
);

-- 8. Bảng Gói Dịch vụ & Thanh toán (Active Plans / Subscriptions)
CREATE TABLE IF NOT EXISTS user_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT,
  payment_code TEXT,
  status TEXT DEFAULT 'active',
  purchased_at INTEGER NOT NULL
);

-- 9. Bảng Thông báo người dùng (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  time_label TEXT NOT NULL,
  unread INTEGER DEFAULT 1,
  href TEXT DEFAULT '/roomie',
  created_at INTEGER NOT NULL
);

-- 10. Bảng Báo cáo Tin giả / Phòng ma / Lừa đảo (Trust & Safety Reports)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  target_title TEXT NOT NULL,
  room_id TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  reporter_contact TEXT,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL
);

-- 11. Bảng Liên hệ & Yêu cầu Tư vấn / Hỗ trợ (Contact & Support Tickets)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL UNIQUE,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  topic TEXT NOT NULL,
  city TEXT DEFAULT 'TP.HCM',
  district TEXT,
  university TEXT,
  message TEXT,
  status TEXT DEFAULT 'open',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_area_key ON rooms(area_key);
CREATE INDEX IF NOT EXISTS idx_rooms_type_key ON rooms(type_key);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(price);
CREATE INDEX IF NOT EXISTS idx_roommates_area_key ON roommates(area_key);
CREATE INDEX IF NOT EXISTS idx_roommates_gender ON roommates(gender);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
