-- Roomie Match - PostgreSQL Schema (Supabase Ready)
-- Engine: PostgreSQL 15+ (pg)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  alt_email TEXT,
  password_hash TEXT NOT NULL,
  short_school TEXT DEFAULT 'SV',
  school TEXT DEFAULT 'Sinh viên xác thực',
  major TEXT DEFAULT 'Sinh viên đại học',
  gender TEXT DEFAULT 'Nữ',
  id_code TEXT,
  avatar TEXT,
  budget_range TEXT,
  preferred_areas TEXT,
  move_in_time TEXT,
  verified_student BOOLEAN NOT NULL DEFAULT TRUE,
  role TEXT NOT NULL DEFAULT 'student',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
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
  price_formatted TEXT,
  total_room_price TEXT,
  area_sqm INTEGER,
  capacity_label TEXT,
  spots_label TEXT,
  badge_text TEXT,
  floor_label TEXT,
  deposit_label TEXT,
  type_key TEXT NOT NULL,
  type_label TEXT NOT NULL,
  match_score INTEGER DEFAULT 85,
  is_new_user_post BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified_listing BOOLEAN NOT NULL DEFAULT FALSE,
  is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  amenities_json TEXT NOT NULL DEFAULT '[]',
  summary_specs TEXT,
  images_json TEXT NOT NULL DEFAULT '[]',
  map_bg TEXT,
  roommate_json TEXT NOT NULL DEFAULT '{}',
  costs_json TEXT NOT NULL DEFAULT '{}',
  description_json TEXT NOT NULL DEFAULT '[]',
  last_ping_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS roommates (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  age INTEGER DEFAULT 20,
  gender TEXT DEFAULT 'Nữ',
  school TEXT,
  short_school TEXT,
  major TEXT,
  match_score INTEGER DEFAULT 85,
  match_label TEXT,
  vnu_member BOOLEAN NOT NULL DEFAULT FALSE,
  has_room BOOLEAN NOT NULL DEFAULT TRUE,
  room_status_title TEXT,
  room_status_detail TEXT,
  linked_room_id TEXT,
  area_key TEXT,
  city TEXT DEFAULT 'TP.HCM',
  budget TEXT,
  avatar TEXT,
  quote TEXT,
  criteria_json TEXT NOT NULL DEFAULT '[]',
  tags_json TEXT NOT NULL DEFAULT '[]',
  contact_json TEXT NOT NULL DEFAULT '{}',
  quiz_profile_json TEXT NOT NULL DEFAULT '{}',
  is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  boost_expires_at BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS roommate_daily_post_usage (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_start BIGINT NOT NULL,
  post_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day_start)
);

CREATE TABLE IF NOT EXISTS roommate_match_daily_usage (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_start BIGINT NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day_start)
);

CREATE TABLE IF NOT EXISTS saved_rooms (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (user_id, room_id)
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id TEXT NOT NULL,
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  answers_json TEXT NOT NULL,
  gender TEXT,
  preferred_gender TEXT,
  gender_option TEXT,
  archetype TEXT,
  match_count INTEGER NOT NULL DEFAULT 42,
  pillars_json TEXT NOT NULL DEFAULT '{}',
  answered_count INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  meta TEXT,
  avatar TEXT,
  room_id TEXT,
  status TEXT NOT NULL,
  note TEXT DEFAULT '',
  release_reason TEXT DEFAULT '',
  reverted_once BOOLEAN NOT NULL DEFAULT FALSE,
  phone TEXT,
  zalo TEXT,
  facebook TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE (user_id, partner_id)
);

CREATE TABLE IF NOT EXISTS user_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price TEXT,
  period TEXT,
  payment_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  purchased_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  target_id TEXT
);

CREATE TABLE IF NOT EXISTS plan_purchase_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  amount_vnd INTEGER NOT NULL,
  transfer_code TEXT NOT NULL UNIQUE,
  target_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  confirmed_at BIGINT
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_label TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT TRUE,
  href TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  target_title TEXT NOT NULL,
  room_id TEXT,
  reason TEXT NOT NULL,
  description TEXT DEFAULT '',
  reporter_contact TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  topic TEXT NOT NULL,
  city TEXT DEFAULT 'TP.HCM',
  district TEXT DEFAULT '',
  university TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_city_area ON rooms(city, area_key);
CREATE INDEX IF NOT EXISTS idx_roommates_city_area ON roommates(city, area_key);
CREATE INDEX IF NOT EXISTS idx_roommates_user ON roommates(user_id);
CREATE INDEX IF NOT EXISTS idx_roommates_boost_expires_at ON roommates(boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_connections_user ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_user ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
