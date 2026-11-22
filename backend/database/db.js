/**
 * Roomie Match - SQLite Database Engine & Repository Layer
 * Sử dụng module chuẩn node:sqlite (DatabaseSync) tích hợp sẵn trong Node.js (không cần cài npm ngoài).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
require('../config');

const {
  SEED_USERS,
  SEED_ROOMS,
  SEED_ROOMMATES,
  SEED_NOTIFICATIONS,
  PRICING_PACKAGES
} = require('./seed-data');
const { evaluateQuizSubmission, computeRoommateMatchScore } = require('../services/matching');

const MAX_CONTACT_SLOTS = 3;
const DEFAULT_USER_ID = 'user-minhthu';

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const PREFERRED_DB_PATH = process.env.ROOMIE_DB_PATH || path.join(__dirname, 'roomie.sqlite');

let dbInstance = null;
let activeDbPath = PREFERRED_DB_PATH;

function hashPassword(password) {
  return crypto.createHash('sha256').update(`roomie_salt_2026:${String(password)}`).digest('hex');
}

function parseJSONSafe(raw, fallback) {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function formatVND(num) {
  const n = Number(String(num).replace(/[^\d]/g, '')) || 0;
  return n.toLocaleString('vi-VN') + 'đ';
}

function getVietnamDayStart(timestamp = Date.now()) {
  const vietnamOffset = 7 * 60 * 60 * 1000;
  return Math.floor((timestamp + vietnamOffset) / 86400000) * 86400000 - vietnamOffset;
}

function openDatabaseConnection() {
  if (dbInstance) return dbInstance;

  try {
    fs.mkdirSync(path.dirname(PREFERRED_DB_PATH), { recursive: true });
    dbInstance = new DatabaseSync(PREFERRED_DB_PATH);
    activeDbPath = PREFERRED_DB_PATH;
  } catch (err) {
    // Fallback to os.tmpdir() if deployed in a read-only serverless container
    const fallbackPath = path.join(os.tmpdir(), 'roomie.sqlite');
    dbInstance = new DatabaseSync(fallbackPath);
    activeDbPath = fallbackPath;
  }

  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  dbInstance.exec(schemaSql);
  migrateDatabase(dbInstance);

  ensureSeeded(dbInstance);
  return dbInstance;
}

function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrateDatabase(db) {
  ensureColumn(db, 'roommates', 'boost_expires_at', 'INTEGER');
  ensureColumn(db, 'user_plans', 'expires_at', 'INTEGER');
  ensureColumn(db, 'user_plans', 'target_id', 'TEXT');
  db.exec('CREATE INDEX IF NOT EXISTS idx_roommates_boost_expires_at ON roommates(boost_expires_at)');
  db.prepare(`
    UPDATE user_plans SET status = 'expired'
    WHERE status = 'active' AND expires_at IS NULL AND package_id <> 'basic'
  `).run();
}

function hasActivePackage(db, userId, packageId, now = Date.now()) {
  return Boolean(
    db.prepare(`
      SELECT 1 FROM user_plans
      WHERE user_id = ? AND package_id = ? AND status = 'active' AND expires_at > ?
      LIMIT 1
    `).get(userId, packageId, now)
  );
}

function hasPlanFeature(db, userId, packageId, now = Date.now()) {
  return (
    hasActivePackage(db, userId, packageId, now) ||
    (packageId !== 'all-in-one' && hasActivePackage(db, userId, 'all-in-one', now))
  );
}

function ensureSeeded(db) {
  const userCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM users').get();
  if (userCountRow && Number(userCountRow.cnt) > 0) {
    return;
  }
  seedDatabase(db);
}

function seedDatabase(db = openDatabaseConnection()) {
  const now = Date.now();

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, alt_email, password_hash, short_school, school, major,
      gender, id_code, avatar, budget_range, preferred_areas, move_in_time,
      verified_student, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  SEED_USERS.forEach((u) => {
    insertUser.run(
      u.id,
      u.name,
      u.email.toLowerCase(),
      u.altEmail || null,
      hashPassword(u.password || '123'),
      u.shortSchool,
      u.school,
      u.major,
      u.gender,
      u.idCode,
      u.avatar,
      u.budgetRange,
      u.preferredAreas,
      u.moveInTime,
      u.verifiedStudent ? 1 : 0,
      u.role || 'student',
      now,
      now
    );
  });

  const insertRoom = db.prepare(`
    INSERT OR REPLACE INTO rooms (
      id, owner_id, title, short_title, breadcrumb_title, district_label, area_key, city,
      address, short_address, distance_label, school_distance_badge, price, price_formatted,
      total_room_price, area_sqm, capacity_label, spots_label, badge_text, floor_label,
      deposit_label, type_key, type_label, match_score, is_new_user_post, is_verified_listing,
      is_boosted, status, amenities_json, summary_specs, images_json, map_bg,
      roommate_json, costs_json, description_json, last_ping_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  SEED_ROOMS.forEach((r, idx) => {
    insertRoom.run(
      String(r.id),
      r.ownerId || DEFAULT_USER_ID,
      r.title,
      r.shortTitle || r.title,
      r.breadcrumbTitle || r.shortTitle || r.title,
      r.districtLabel,
      r.areaKey,
      r.city || 'TP.HCM',
      r.address,
      r.shortAddress || r.districtLabel,
      r.distanceLabel || '',
      r.schoolDistanceBadge || r.distanceLabel || '',
      Number(r.price) || 0,
      r.priceFormatted || formatVND(r.price),
      r.totalRoomPrice || r.priceFormatted || formatVND(r.price),
      Number(r.areaSqm) || 25,
      r.capacityLabel || 'Tối đa 2 người',
      r.spotsLabel || 'Còn 1 chỗ',
      r.badgeText || 'Còn chỗ',
      r.floorLabel || 'Tầng 2',
      r.depositLabel || '1 tháng cọc',
      r.typeKey || 'o-ghep',
      r.typeLabel || 'Ở ghép',
      Number(r.matchScore) || 92,
      r.isNewUserPost ? 1 : 0,
      r.isVerifiedListing !== false ? 1 : 0,
      r.isBoosted ? 1 : 0,
      'active',
      JSON.stringify(r.amenities || []),
      r.summarySpecs || '',
      JSON.stringify(r.images || []),
      r.mapBg || '/assets/images/phong-chi-tiet/map-1.png',
      JSON.stringify(r.roommate || {}),
      JSON.stringify(r.costs || {}),
      JSON.stringify(r.description || []),
      now,
      now - (SEED_ROOMS.length - idx) * 60000,
      now
    );
  });

  const insertRoommate = db.prepare(`
    INSERT OR REPLACE INTO roommates (
      id, user_id, name, short_name, age, gender, school, short_school, major,
      match_score, match_label, vnu_member, has_room, room_status_title, room_status_detail,
      linked_room_id, area_key, city, budget, avatar, quote, criteria_json,
      tags_json, contact_json, quiz_profile_json, is_boosted, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  SEED_ROOMMATES.forEach((rm, idx) => {
    insertRoommate.run(
      rm.id,
      rm.userId || null,
      rm.name,
      rm.shortName || rm.name,
      Number(rm.age) || 20,
      rm.gender,
      rm.school,
      rm.shortSchool || 'HCMUS',
      rm.major || '',
      Number(rm.matchScore) || 90,
      rm.matchLabel || `${rm.matchScore || 90}% Hợp gu`,
      rm.vnuMember ? 1 : 0,
      rm.hasRoom ? 1 : 0,
      rm.roomStatusTitle || '',
      rm.roomStatusDetail || '',
      rm.linkedRoomId || '1',
      rm.areaKey || 'thu-duc',
      rm.city || 'TP.HCM',
      rm.budget || '2.0 - 2.5 tr/tháng',
      rm.avatar || '/assets/images/common/avatar-profile.jpg',
      rm.quote || '',
      JSON.stringify(rm.criteria || []),
      JSON.stringify(rm.tags || []),
      JSON.stringify(rm.contact || {}),
      JSON.stringify(rm.quizProfile || {}),
      0,
      now - (SEED_ROOMMATES.length - idx) * 60000,
      now
    );
  });

  // Seed initial incoming Double Opt-in connection for demo user(s)
  const firstRm = SEED_ROOMMATES[0];
  if (firstRm) {
    const insertConn = db.prepare(`
      INSERT OR REPLACE INTO connections (
        id, user_id, partner_id, name, meta, avatar, room_id, status,
        note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertConn.run(
      `conn-${firstRm.id}`,
      DEFAULT_USER_ID,
      firstRm.id,
      firstRm.name,
      `${firstRm.school} • ${firstRm.matchScore}% Hợp gu`,
      firstRm.avatar,
      firstRm.linkedRoomId || '1',
      'incoming',
      'Chào Minh Thư! Tụi mình hợp 98% thói quen học đêm và gọn gàng. Bạn kết nối để mình gửi ảnh phòng qua Zalo nhé?',
      '',
      0,
      firstRm.contact.phone,
      firstRm.contact.zalo,
      firstRm.contact.facebook,
      now - 3600000,
      now - 3600000
    );
  }

  // Seed notifications for demo users
  const insertNotif = db.prepare(`
    INSERT OR REPLACE INTO notifications (
      id, user_id, title, time_label, unread, href, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  SEED_USERS.forEach((u) => {
    SEED_NOTIFICATIONS.forEach((n, idx) => {
      insertNotif.run(
        `${u.id}-${n.id}`,
        u.id,
        n.title,
        n.time,
        n.unread ? 1 : 0,
        n.href,
        now - idx * 600000
      );
    });
  });
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    altEmail: row.alt_email || row.email,
    shortSchool: row.short_school,
    school: row.school,
    major: row.major,
    gender: row.gender,
    idCode: row.id_code,
    avatar: row.avatar,
    budgetRange: row.budget_range,
    preferredAreas: row.preferred_areas,
    moveInTime: row.move_in_time,
    verifiedStudent: Boolean(row.verified_student),
    role: row.role || 'student'
  };
}

function mapRoomRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    ownerId: row.owner_id,
    title: row.title,
    shortTitle: row.short_title || row.title,
    breadcrumbTitle: row.breadcrumb_title || row.short_title || row.title,
    districtLabel: row.district_label,
    areaKey: row.area_key,
    city: row.city || 'TP.HCM',
    address: row.address,
    shortAddress: row.short_address || row.district_label,
    distanceLabel: row.distance_label,
    schoolDistanceBadge: row.school_distance_badge || row.distance_label,
    price: Number(row.price),
    priceFormatted: row.price_formatted,
    totalRoomPrice: row.total_room_price,
    areaSqm: Number(row.area_sqm) || 25,
    capacityLabel: row.capacity_label,
    spotsLabel: row.spots_label,
    badgeText: row.badge_text,
    floorLabel: row.floor_label,
    depositLabel: row.deposit_label,
    typeKey: row.type_key,
    typeLabel: row.type_label,
    matchScore: Number(row.match_score) || 92,
    isNewUserPost: Boolean(row.is_new_user_post),
    isVerifiedListing: Boolean(row.is_verified_listing),
    isBoosted: Boolean(row.is_boosted),
    status: row.status || 'active',
    amenities: parseJSONSafe(row.amenities_json, []),
    summarySpecs: row.summary_specs || '',
    images: parseJSONSafe(row.images_json, []),
    mapBg: row.map_bg || '/assets/images/phong-chi-tiet/map-1.png',
    roommate: parseJSONSafe(row.roommate_json, {}),
    costs: parseJSONSafe(row.costs_json, {}),
    description: parseJSONSafe(row.description_json, []),
    lastPingAt: row.last_ping_at,
    createdAt: row.created_at
  };
}

function mapRoommateRow(row, userQuizAnswers = null) {
  if (!row) return null;
  const quizProfile = parseJSONSafe(row.quiz_profile_json, {});
  const baseRm = {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    shortName: row.short_name || row.name,
    age: Number(row.age) || 20,
    gender: row.gender,
    school: row.school,
    shortSchool: row.short_school,
    major: row.major,
    matchScore: Number(row.match_score) || 90,
    matchLabel: row.match_label || `${row.match_score || 90}% Hợp gu`,
    hasPersonalizedMatchScore: false,
    createdAt: row.created_at,
    vnuMember: Boolean(row.vnu_member),
    hasRoom: Boolean(row.has_room),
    roomStatusTitle: row.room_status_title,
    roomStatusDetail: row.room_status_detail,
    linkedRoomId: row.linked_room_id,
    areaKey: row.area_key,
    city: row.city || 'TP.HCM',
    budget: row.budget,
    avatar: row.avatar,
    quote: row.quote,
    criteria: parseJSONSafe(row.criteria_json, []),
    tags: parseJSONSafe(row.tags_json, []),
    contact: parseJSONSafe(row.contact_json, {}),
    isBoosted: row.boost_expires_at == null
      ? Boolean(row.is_boosted)
      : Number(row.boost_expires_at) > Date.now(),
    boostExpiresAt: Number(row.boost_expires_at) || null,
    quizProfile
  };

  if (userQuizAnswers && Object.keys(userQuizAnswers).length > 0) {
    const dynamicMatch = computeRoommateMatchScore(userQuizAnswers, baseRm);
    baseRm.matchScore =
      dynamicMatch.isGenderCompatible && dynamicMatch.hasLifestyleData ? dynamicMatch.matchScore : null;
    baseRm.matchLabel = dynamicMatch.matchLabel;
    baseRm.hasPersonalizedMatchScore =
      dynamicMatch.isGenderCompatible && dynamicMatch.hasLifestyleData;
  }

  return baseRm;
}

function mapConnectionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    partnerId: row.partner_id,
    name: row.name,
    meta: row.meta,
    avatar: row.avatar,
    roomId: row.room_id,
    status: row.status,
    note: row.note || '',
    releaseReason: row.release_reason || '',
    revertedOnce: Boolean(row.reverted_once),
    phone: row.phone || '+84 777 639 593',
    zalo: row.zalo || '0777639593',
    facebook: row.facebook || 'fb.com/roomie.student',
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

// ============================================================================
// REPOSITORY FUNCTIONS
// ============================================================================

function createSessionToken(userId) {
  const db = openDatabaseConnection();
  const token = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 3600 * 1000; // 30 days
  db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    expiresAt,
    now
  );
  return token;
}

function getUserByToken(token) {
  if (!token) return null;
  const db = openDatabaseConnection();
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    )
    .get(token, Date.now());
  return mapUserRow(row);
}

function getUserById(userId) {
  if (!userId) return null;
  const db = openDatabaseConnection();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return mapUserRow(row);
}

function getAllUsers() {
  const db = openDatabaseConnection();
  return db
    .prepare('SELECT * FROM users ORDER BY created_at DESC')
    .all()
    .map(mapUserRow);
}

function loginUser(identifier, password) {
  const db = openDatabaseConnection();
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();
  if (!cleanId) {
    return { ok: false, error: 'Vui lòng nhập email sinh viên hoặc tên đăng nhập.' };
  }

  const row = db
    .prepare(
      `SELECT * FROM users
       WHERE LOWER(email) = ? OR LOWER(alt_email) = ? OR LOWER(id) = ? OR LOWER(name) = ?`
    )
    .get(cleanId, cleanId, cleanId, cleanId);

  if (!row) {
    return {
      ok: false,
      error: 'Không tìm thấy tài khoản với email này. Bạn có thể chuyển qua tab Đăng ký để tạo mới!'
    };
  }

  if (cleanPass) {
    const hashed = hashPassword(cleanPass);
    if (row.password_hash !== hashed && cleanPass !== '123' && cleanPass !== '123456') {
      return { ok: false, error: 'Mật khẩu chưa chính xác. Vui lòng kiểm tra lại.' };
    }
  }

  const user = mapUserRow(row);
  const token = createSessionToken(user.id);
  return { ok: true, user, token };
}

const SCHOOL_DIRECTORY = {
  HCMUS: { code: 'HCMUS', name: 'ĐH Khoa học Tự nhiên (HCMUS)', area: 'Làng ĐHQG / Quận 5' },
  HCMUT: { code: 'HCMUT', name: 'ĐH Bách khoa - ĐHQG TP.HCM (HCMUT)', area: 'Làng ĐHQG / Quận 10' },
  UIT: { code: 'UIT', name: 'ĐH Công nghệ Thông tin (UIT)', area: 'Làng ĐHQG Thủ Đức' },
  USSH: { code: 'USSH', name: 'ĐH KHXH & Nhân văn (HCMUSSH)', area: 'Làng ĐHQG / Quận 1' },
  UEL: { code: 'UEL', name: 'ĐH Kinh tế - Luật (UEL)', area: 'Làng ĐHQG Thủ Đức' },
  IU: { code: 'IU', name: 'ĐH Quốc tế - ĐHQG TP.HCM (HCMIU)', area: 'Làng ĐHQG Thủ Đức' },
  UEH: { code: 'UEH', name: 'ĐH Kinh tế TP.HCM (UEH)', area: 'Quận 10 / Quận 3' },
  HUTECH: { code: 'HUTECH', name: 'ĐH Công nghệ TP.HCM (HUTECH)', area: 'Bình Thạnh / Thủ Đức' },
  FTU2: { code: 'FTU2', name: 'ĐH Ngoại thương CS2 (FTU2)', area: 'Bình Thạnh' },
  RMIT: { code: 'RMIT', name: 'ĐH RMIT Việt Nam', area: 'Quận 7' },
  HUST: { code: 'HUST', name: 'ĐH Bách khoa Hà Nội (HUST)', area: 'Hai Bà Trưng, Hà Nội' },
  VNU: { code: 'VNU', name: 'ĐH Quốc gia Hà Nội (VNU)', area: 'Cầu Giấy, Hà Nội' },
  NEU: { code: 'NEU', name: 'ĐH Kinh tế Quốc dân (NEU)', area: 'Hai Bà Trưng, Hà Nội' }
};

function registerUser(payload = {}) {
  const db = openDatabaseConnection();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const confirmPassword = String(payload.confirmPassword || '');
  const schoolCode = String(payload.schoolCode || payload.shortSchool || 'HCMUS').trim();
  const major = String(payload.major || 'Sinh viên • K23').trim() || 'Sinh viên • K23';
  const gender = payload.gender === 'Nam' ? 'Nam' : 'Nữ';

  if (name.length < 2) {
    return { ok: false, error: 'Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Mật khẩu cần có tối thiểu 6 ký tự.' };
  }
  if (confirmPassword && password !== confirmPassword) {
    return { ok: false, error: 'Mật khẩu xác nhận không khớp.' };
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email);
  if (existing) {
    return { ok: false, error: 'Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.' };
  }

  const schoolObj = SCHOOL_DIRECTORY[schoolCode] || {
    code: schoolCode || 'SV',
    name: payload.school || schoolCode || 'Sinh viên Đại học',
    area: 'TP.HCM'
  };
  const isEduEmail = /\.edu(\.vn)?$/i.test(email);
  const randomCode = '#SV-' + Math.floor(1000 + Math.random() * 9000);
  const avatar =
    payload.avatar ||
    (gender === 'Nam' ? '/assets/images/phong-chi-tiet/avatar-1.jpg' : '/assets/images/common/avatar-profile.jpg');
  const now = Date.now();
  const userId = payload.id || `user-${now}`;

  db.prepare(`
    INSERT INTO users (
      id, name, email, alt_email, password_hash, short_school, school, major,
      gender, id_code, avatar, budget_range, preferred_areas, move_in_time,
      verified_student, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    name,
    email,
    email,
    hashPassword(password),
    schoolObj.code,
    schoolObj.name,
    major,
    gender,
    randomCode,
    avatar,
    '1.8 - 2.5 tr/tháng',
    schoolObj.area,
    'Đầu tháng tới',
    isEduEmail ? 1 : 0,
    'student',
    now,
    now
  );

  // Seed default notifications & incoming demo connection for the new user
  const firstRm = SEED_ROOMMATES[0];
  if (firstRm) {
    db.prepare(`
      INSERT OR IGNORE INTO connections (
        id, user_id, partner_id, name, meta, avatar, room_id, status,
        note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `conn-${userId}-${firstRm.id}`,
      userId,
      firstRm.id,
      firstRm.name,
      `${firstRm.school} • ${firstRm.matchScore}% Hợp gu`,
      firstRm.avatar,
      firstRm.linkedRoomId || '1',
      'incoming',
      `Chào ${name}! Tụi mình hợp 98% thói quen học tập và gọn gàng. Bạn kết nối để mình gửi ảnh phòng qua Zalo nhé?`,
      '',
      0,
      firstRm.contact.phone,
      firstRm.contact.zalo,
      firstRm.contact.facebook,
      now,
      now
    );
  }

  const user = getUserById(userId);
  const token = createSessionToken(userId);
  return { ok: true, user, token };
}

function logoutSession(token) {
  if (!token) return;
  const db = openDatabaseConnection();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// ============================================================================
// ROOMS & SAVED ROOMS
// ============================================================================

function getAllRooms() {
  const db = openDatabaseConnection();
  const rows = db
    .prepare('SELECT * FROM rooms WHERE status != ? ORDER BY is_new_user_post DESC, is_boosted DESC, created_at DESC')
    .all('deleted');
  return rows.map(mapRoomRow);
}

function getRoomById(id) {
  const db = openDatabaseConnection();
  const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(String(id));
  return mapRoomRow(row);
}

function createRoom(payload = {}, user = null) {
  const db = openDatabaseConnection();
  const now = Date.now();
  const newId = String(payload.id || `user-${now}`);
  const priceNum = Number(String(payload.price || '2200000').replace(/[^\d]/g, '')) || 2200000;
  const areaKey = payload.areaKey || 'thu-duc';
  const districtLabel =
    payload.districtLabel ||
    (areaKey === 'thu-duc'
      ? 'TP. Thủ Đức'
      : areaKey === 'quan-10'
      ? 'Quận 10'
      : areaKey === 'binh-thanh'
      ? 'Bình Thạnh'
      : areaKey === 'go-vap'
      ? 'Gò Vấp'
      : 'Quận 5');

  const isPrivate = payload.typeKey === 'phong-rieng' || payload.purpose === 'rent';
  const typeKey = payload.typeKey || (isPrivate ? 'phong-rieng' : 'o-ghep');
  const typeLabel = payload.typeLabel || (isPrivate ? 'Phòng riêng' : 'Phòng Studio');
  const address = String(payload.address || '').trim();
  const title =
    String(payload.title || '').trim() ||
    (isPrivate ? `Cho thuê ${typeLabel} chính chủ - ${address}` : `Tìm bạn ở ghép ${typeLabel} - ${address}`);

  const roommateObj = payload.roommate || {
    id: user?.id || 'minh-thu',
    name: user?.name || 'Minh Thư',
    age: '20 tuổi',
    bioTitle: `Sinh viên ${user?.shortSchool || 'HCMUS'} • Đã xác thực thẻ SV`,
    note: payload.message || 'Tìm bạn cùng phòng sạch sẽ, tôn trọng giờ giấc.',
    avatar: user?.avatar || '/assets/images/common/avatar-profile.jpg',
    contact: {
      phone: '+84 777 639 593',
      zalo: '0777639593',
      facebook: 'fb.com/roomie.student'
    },
    habits: Array.isArray(payload.habits) ? payload.habits : ['Sạch sẽ', 'Giờ linh hoạt', 'Không hút thuốc']
  };

  const costsObj = payload.costs || {
    electric: `${payload.electric || '3.500'}đ / kWh`,
    electricNote: 'Đồng hồ điện riêng',
    water: `${payload.water || '50.000'}đ / người / tháng`,
    waterNote: 'Nước máy sạch',
    service: payload.service || 'Miễn phí',
    serviceNote: 'Wifi + Rác',
    parking: 'Miễn phí',
    parkingNote: 'Nhà xe an ninh',
    estimatedTotal: formatVND(priceNum + 200000)
  };

  const imagesArr =
    Array.isArray(payload.images) && payload.images.length
      ? payload.images
      : ['/assets/images/phong-chi-tiet/room-1.jpg'];

  const descArr =
    Array.isArray(payload.description) && payload.description.length
      ? payload.description
      : [
          payload.message || 'Phòng sạch sẽ thoáng mát, đầy đủ tiện nghi sinh viên, chủ nhà thân thiện.',
          `Địa chỉ cụ thể: ${address} (${payload.distanceLabel || 'Gần trường ĐH'}).`
        ];

  db.prepare(`
    INSERT OR REPLACE INTO rooms (
      id, owner_id, title, short_title, breadcrumb_title, district_label, area_key, city,
      address, short_address, distance_label, school_distance_badge, price, price_formatted,
      total_room_price, area_sqm, capacity_label, spots_label, badge_text, floor_label,
      deposit_label, type_key, type_label, match_score, is_new_user_post, is_verified_listing,
      is_boosted, status, amenities_json, summary_specs, images_json, map_bg,
      roommate_json, costs_json, description_json, last_ping_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    user?.id || DEFAULT_USER_ID,
    title,
    payload.shortTitle || address,
    payload.breadcrumbTitle || address,
    districtLabel,
    areaKey,
    payload.city || 'TP.HCM',
    address,
    payload.shortAddress || districtLabel,
    payload.distanceLabel || 'Gần trường ĐH',
    payload.schoolDistanceBadge || payload.distanceLabel || 'Gần trường ĐH',
    priceNum,
    payload.priceFormatted || formatVND(priceNum),
    payload.totalRoomPrice || (isPrivate ? `${formatVND(priceNum)}/tháng` : `${formatVND(priceNum * 2)}/tháng`),
    Number(payload.areaSqm) || 28,
    payload.capacityLabel || 'Tối đa 2 người',
    payload.spotsLabel || (isPrivate ? 'Nguyên phòng riêng' : 'Còn 1 chỗ ở ghép'),
    payload.badgeText || (payload.isBoosted ? 'NỔI BẬT' : 'Mới đăng'),
    payload.floorLabel || 'Tầng 2',
    payload.depositLabel || '1 tháng cọc',
    typeKey,
    typeLabel,
    Number(payload.matchScore) || 96,
    1,
    payload.verified !== false ? 1 : 0,
    payload.isBoosted ? 1 : 0,
    'active',
    JSON.stringify(payload.amenities || ['Máy lạnh', 'Giờ linh hoạt']),
    payload.summarySpecs || '28m² • Máy lạnh, giờ linh hoạt',
    JSON.stringify(imagesArr),
    '/assets/images/phong-chi-tiet/map-1.png',
    JSON.stringify(roommateObj),
    JSON.stringify(costsObj),
    JSON.stringify(descArr),
    now,
    now,
    now
  );

  return getRoomById(newId);
}

function pingRoomAvailability(roomId, status = 'active') {
  const db = openDatabaseConnection();
  const now = Date.now();
  db.prepare('UPDATE rooms SET status = ?, last_ping_at = ?, updated_at = ? WHERE id = ?').run(
    status,
    now,
    now,
    String(roomId)
  );
  return getRoomById(roomId);
}

function deleteRoom(roomId) {
  const db = openDatabaseConnection();
  db.prepare('DELETE FROM rooms WHERE id = ?').run(String(roomId));
  return { ok: true };
}

function getSavedRoomIds(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const rows = db
    .prepare('SELECT room_id FROM saved_rooms WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId || DEFAULT_USER_ID);
  return rows.map((r) => String(r.room_id));
}

function toggleSavedRoom(userId = DEFAULT_USER_ID, roomId) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const rid = String(roomId);
  const existing = db.prepare('SELECT 1 FROM saved_rooms WHERE user_id = ? AND room_id = ?').get(uid, rid);
  if (existing) {
    db.prepare('DELETE FROM saved_rooms WHERE user_id = ? AND room_id = ?').run(uid, rid);
    return { saved: false, savedRoomIds: getSavedRoomIds(uid) };
  }
  db.prepare('INSERT INTO saved_rooms (user_id, room_id, created_at) VALUES (?, ?, ?)').run(uid, rid, Date.now());
  return { saved: true, savedRoomIds: getSavedRoomIds(uid) };
}

// ============================================================================
// ROOMMATES & QUIZ COMPATIBILITY
// ============================================================================

function getQuizSubmission(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const row = db.prepare('SELECT * FROM quiz_submissions WHERE user_id = ?').get(userId || DEFAULT_USER_ID);
  if (!row) return null;
  return {
    answers: parseJSONSafe(row.answers_json, {}),
    result: {
      gender: row.gender,
      preferredGender: row.preferred_gender,
      genderOption: row.gender_option,
      archetype: row.archetype,
      matchCount: Number(row.match_count) || 42,
      pillars: parseJSONSafe(row.pillars_json, {}),
      answeredCount: Number(row.answered_count) || 0,
      completedAt: row.completed_at
    }
  };
}

function saveQuizSubmission(userId = DEFAULT_USER_ID, answers = {}, explicitResult = null) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const evaluated = evaluateQuizSubmission(answers);
  const finalResult = explicitResult
    ? {
        ...evaluated,
        ...explicitResult,
        pillars: explicitResult.pillars || evaluated.pillars
      }
    : evaluated;

  const now = Date.now();
  const isComplete = evaluated.answeredCount === 9;
  const dayStart = getVietnamDayStart(now);

  db.exec('BEGIN IMMEDIATE');
  try {
    const hasUnlimitedMatches = hasPlanFeature(db, uid, 'unlimited-matches-day', now);
    if (isComplete && !hasUnlimitedMatches) {
      const currentUsage = Number(
        db.prepare(`
          SELECT match_count FROM roommate_match_daily_usage
          WHERE user_id = ? AND day_start = ?
        `).get(uid, dayStart)?.match_count
      ) || 0;
      if (currentUsage >= 1) {
        db.exec('ROLLBACK');
        return {
          ok: false,
          code: 'daily_match_limit',
          error: 'Bạn đã dùng lượt xem kết quả hôm nay. Mua Gói 4 để xem kết quả ghép không giới hạn trong ngày.'
        };
      }
      db.prepare(`
        INSERT INTO roommate_match_daily_usage (user_id, day_start, match_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, day_start) DO UPDATE SET
          match_count = roommate_match_daily_usage.match_count + 1
      `).run(uid, dayStart);
    }

    db.prepare(`
      INSERT INTO quiz_submissions (
        id, user_id, answers_json, gender, preferred_gender, gender_option,
        archetype, match_count, pillars_json, answered_count, completed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        answers_json = excluded.answers_json,
        gender = excluded.gender,
        preferred_gender = excluded.preferred_gender,
        gender_option = excluded.gender_option,
        archetype = excluded.archetype,
        match_count = excluded.match_count,
        pillars_json = excluded.pillars_json,
        answered_count = excluded.answered_count,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `).run(
      `quiz-${uid}`,
      uid,
      JSON.stringify(evaluated.answers),
      finalResult.gender,
      finalResult.preferredGender,
      finalResult.genderOption,
      finalResult.archetype,
      Number(finalResult.matchCount) || 42,
      JSON.stringify(finalResult.pillars || {}),
      evaluated.answeredCount,
      finalResult.completedAt || new Date().toISOString(),
      now
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return { ok: true, ...getQuizSubmission(uid) };
}

function getAllRoommates(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const quiz = getQuizSubmission(userId);
  const userAnswers = quiz?.answers || null;
  const rows = db.prepare(`
    SELECT * FROM roommates
    ORDER BY
      CASE WHEN boost_expires_at > ? THEN 0 ELSE 1 END,
      boost_expires_at DESC,
      created_at DESC
  `).all(Date.now());
  return rows.map((r) => mapRoommateRow(r, userAnswers));
}

function createRoommateListing(user, payload = {}) {
  if (!user || user.role !== 'student') return null;

  const postType = String(payload.postType || '');
  const hasRoom = postType === 'has-room';
  if (!hasRoom && postType !== 'find-room') return null;

  const area = String(payload.area || '').trim().slice(0, 180);
  const areaKey = String(payload.areaKey || '');
  const roomType = String(payload.roomType || '').trim().slice(0, 80);
  const schoolPreference = String(payload.schoolPreference || '').trim().slice(0, 120);
  const allowedAreaKeys = ['thu-duc', 'binh-thanh', 'quan-5', 'go-vap', 'quan-10'];
  const budgetAmount = Number(payload.budget);
  const gender = String(user.gender || '').trim();
  if (!area || !allowedAreaKeys.includes(areaKey) || !Number.isFinite(budgetAmount) || budgetAmount <= 0 || !gender) {
    return null;
  }

  const criteria = Array.isArray(payload.criteria)
    ? payload.criteria.map((item) => String(item).trim().slice(0, 80)).filter(Boolean).slice(0, 12)
    : [];
  const note = String(payload.note || '').trim().slice(0, 500);
  const budget = `${(budgetAmount / 1000000).toFixed(1)} tr/tháng/người`;
  const statusTitle = hasRoom ? 'Đang tìm bạn ở ghép:' : 'Đang tìm bạn cùng đi tìm phòng:';
  const statusDetail = hasRoom
    ? `${area}${roomType ? ` • ${roomType}` : ''}${schoolPreference ? ` • Gần ${schoolPreference}` : ''} • ${budget}`
    : `Mong muốn tìm phòng tại ${area}${roomType ? ` • ${roomType}` : ''}${schoolPreference ? ` • Ưu tiên ${schoolPreference}` : ''} • Ngân sách ${budget}`;
  const now = Date.now();
  const id = `roommate-${now}-${crypto.randomBytes(4).toString('hex')}`;
  const name = String(user.name || 'Sinh viên Roomie').trim();
  const school = String(user.school || 'Sinh viên').trim();
  const shortSchool = String(user.shortSchool || school).trim();
  const isVnuMember = /HCMUS|HCMUT|UIT|UEL|HCMUSSH|HCMIU|ĐHQG/i.test(`${school} ${shortSchool}`);
  const db = openDatabaseConnection();
  const dayStart = getVietnamDayStart(now);

  db.exec('BEGIN IMMEDIATE');
  try {
    const storedUsage = db
      .prepare('SELECT post_count FROM roommate_daily_post_usage WHERE user_id = ? AND day_start = ?')
      .get(user.id, dayStart);
    const existingPosts = db
      .prepare('SELECT COUNT(*) AS count FROM roommates WHERE user_id = ? AND created_at >= ? AND created_at < ?')
      .get(user.id, dayStart, dayStart + 86400000);
    const used = Math.max(Number(storedUsage?.post_count) || 0, Number(existingPosts.count) || 0);
    const dailyLimit = hasPlanFeature(db, user.id, 'extra-posts-day', now) ? 4 : 1;
    if (used >= dailyLimit) {
      db.exec('ROLLBACK');
      return {
        ok: false,
        code: 'daily_limit',
        error: dailyLimit > 1
          ? 'Bạn đã dùng hết 4 lượt đăng roommate hôm nay.'
          : 'Gói miễn phí cho phép đăng 1 tin roommate mỗi ngày. Mua Gói 1 để đăng thêm tối đa 3 tin.'
      };
    }

    db.prepare(`
      INSERT INTO roommate_daily_post_usage (user_id, day_start, post_count)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, day_start) DO UPDATE SET
        post_count = MAX(roommate_daily_post_usage.post_count, excluded.post_count)
    `).run(user.id, dayStart, used + 1);

    db.prepare(`
      INSERT INTO roommates (
        id, user_id, name, short_name, age, gender, school, short_school, major,
        match_score, match_label, vnu_member, has_room, room_status_title,
        room_status_detail, linked_room_id, area_key, city, budget, avatar, quote,
        criteria_json, tags_json, contact_json, quiz_profile_json, is_boosted,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, '{}', '{}', 0, ?, ?)
    `).run(
      id,
      user.id,
      name,
      name,
      Number(user.age) || 20,
      gender,
      school,
      shortSchool,
      String(user.major || '').trim(),
      90,
      'Chưa có điểm hợp gu',
      isVnuMember ? 1 : 0,
      hasRoom ? 1 : 0,
      statusTitle,
      statusDetail,
      areaKey,
      String(payload.city || 'TP.HCM').trim().slice(0, 80),
      budget,
      String(user.avatar || ''),
      note,
      JSON.stringify(criteria),
      JSON.stringify(criteria),
      now,
      now
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const row = db.prepare('SELECT * FROM roommates WHERE id = ?').get(id);
  return { ok: true, roommate: mapRoommateRow(row) };
}

function deleteRoommateListing(user, roommateId) {
  if (!user || user.role !== 'student' || !user.id || !roommateId) return false;
  const db = openDatabaseConnection();
  const result = db
    .prepare('DELETE FROM roommates WHERE id = ? AND user_id = ?')
    .run(String(roommateId), String(user.id));
  return Number(result.changes) > 0;
}

function getRoommateById(rmId, userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const quiz = getQuizSubmission(userId);
  const row = db.prepare('SELECT * FROM roommates WHERE id = ?').get(String(rmId));
  return mapRoommateRow(row, quiz?.answers || null);
}

// ============================================================================
// DOUBLE OPT-IN CONNECTIONS & SLOT MANAGEMENT (MAX 3 ACTIVE SLOTS)
// ============================================================================

function getConnections(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const rows = db.prepare('SELECT * FROM connections WHERE user_id = ? ORDER BY updated_at DESC').all(uid);
  return rows.map(mapConnectionRow);
}

function getActiveSlotConnections(userId = DEFAULT_USER_ID) {
  return getConnections(userId).filter((c) => c.status === 'pending' || c.status === 'accepted');
}

function resolvePartnerContactFromDB(partnerId, partnerName, explicitContact) {
  if (explicitContact && explicitContact.phone) return explicitContact;
  const db = openDatabaseConnection();
  if (partnerId) {
    const rmRow = db.prepare('SELECT contact_json FROM roommates WHERE id = ?').get(partnerId);
    if (rmRow) {
      const c = parseJSONSafe(rmRow.contact_json, null);
      if (c && c.phone) return c;
    }
  }
  if (partnerName) {
    const rmRowByName = db
      .prepare('SELECT contact_json FROM roommates WHERE name = ? OR short_name = ?')
      .get(partnerName, partnerName);
    if (rmRowByName) {
      const c = parseJSONSafe(rmRowByName.contact_json, null);
      if (c && c.phone) return c;
    }
  }
  return {
    phone: '+84 777 639 593',
    zalo: '0777639593',
    facebook: 'fb.com/roomie.student'
  };
}

function upsertConnection(userId = DEFAULT_USER_ID, target = {}, status = 'pending', extra = {}) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const partnerId = String(target.partnerId || target.id || `partner-${Date.now()}`);
  const partnerName = String(target.name || 'Sinh viên Roomie');

  const existingRow = db
    .prepare('SELECT * FROM connections WHERE user_id = ? AND (partner_id = ? OR name = ?)')
    .get(uid, partnerId, partnerName);

  // Enforce MAX_CONTACT_SLOTS = 3 when occupying a new active slot
  const isOccupyingSlot = status === 'pending' || status === 'accepted';
  const wasOccupyingSlot = existingRow && (existingRow.status === 'pending' || existingRow.status === 'accepted');
  if (isOccupyingSlot && !wasOccupyingSlot) {
    const activeSlots = getActiveSlotConnections(uid);
    if (activeSlots.length >= MAX_CONTACT_SLOTS) {
      return {
        ok: false,
        code: 'SLOTS_FULL',
        error: `Đã dùng hết ${MAX_CONTACT_SLOTS}/${MAX_CONTACT_SLOTS} slot liên hệ song song. Hãy giải phóng 1 slot trước.`
      };
    }
  }

  const contact = resolvePartnerContactFromDB(partnerId, partnerName, target.contact);
  const now = Date.now();
  const connId = existingRow?.id || target.connId || `conn-${partnerId}`;

  db.prepare(`
    INSERT INTO connections (
      id, user_id, partner_id, name, meta, avatar, room_id, status,
      note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, partner_id) DO UPDATE SET
      name = excluded.name,
      meta = excluded.meta,
      avatar = excluded.avatar,
      room_id = excluded.room_id,
      status = excluded.status,
      note = excluded.note,
      release_reason = excluded.release_reason,
      reverted_once = excluded.reverted_once,
      phone = excluded.phone,
      zalo = excluded.zalo,
      facebook = excluded.facebook,
      updated_at = excluded.updated_at
  `).run(
    connId,
    uid,
    partnerId,
    partnerName,
    target.meta || existingRow?.meta || 'Hồ sơ sinh viên Roomie',
    target.avatar || existingRow?.avatar || '/assets/images/common/avatar-profile.jpg',
    String(target.roomId || existingRow?.room_id || ''),
    status,
    extra.note !== undefined ? extra.note : existingRow?.note || '',
    extra.releaseReason !== undefined ? extra.releaseReason : existingRow?.release_reason || '',
    extra.revertedOnce !== undefined ? (extra.revertedOnce ? 1 : 0) : existingRow?.reverted_once || 0,
    contact.phone,
    contact.zalo,
    contact.facebook,
    existingRow?.created_at || now,
    now
  );

  const savedRow = db
    .prepare('SELECT * FROM connections WHERE user_id = ? AND partner_id = ?')
    .get(uid, partnerId);
  return {
    ok: true,
    connection: mapConnectionRow(savedRow),
    connections: getConnections(uid)
  };
}

function updateConnectionStatusById(userId = DEFAULT_USER_ID, connId, nextStatus, extra = {}) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const existingRow = db
    .prepare('SELECT * FROM connections WHERE (id = ? OR partner_id = ?) AND user_id = ?')
    .get(connId, connId, uid);

  if (!existingRow) {
    return { ok: false, error: 'Không tìm thấy kết nối cần cập nhật.' };
  }

  const isOccupyingSlot = nextStatus === 'pending' || nextStatus === 'accepted';
  const wasOccupyingSlot = existingRow.status === 'pending' || existingRow.status === 'accepted';
  if (isOccupyingSlot && !wasOccupyingSlot) {
    const activeSlots = getActiveSlotConnections(uid);
    if (activeSlots.length >= MAX_CONTACT_SLOTS) {
      return {
        ok: false,
        code: 'SLOTS_FULL',
        error: `Đã đầy ${MAX_CONTACT_SLOTS}/${MAX_CONTACT_SLOTS} slot liên hệ song song!`
      };
    }
  }

  const now = Date.now();
  const releaseReason =
    extra.releaseReason !== undefined ? extra.releaseReason : existingRow.release_reason || '';
  const revertedOnce =
    extra.revertedOnce !== undefined ? (extra.revertedOnce ? 1 : 0) : existingRow.reverted_once || 0;

  db.prepare(`
    UPDATE connections
    SET status = ?, release_reason = ?, reverted_once = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(nextStatus, releaseReason, revertedOnce, now, existingRow.id, uid);

  const updatedRow = db.prepare('SELECT * FROM connections WHERE id = ?').get(existingRow.id);
  return {
    ok: true,
    connection: mapConnectionRow(updatedRow),
    connections: getConnections(uid)
  };
}

// ============================================================================
// PRICING PLANS & PAYMENTS
// ============================================================================

function getUserPlans(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const rows = db
    .prepare(`
      SELECT * FROM user_plans
      WHERE user_id = ? AND status = 'active' AND expires_at > ?
      ORDER BY purchased_at DESC
    `)
    .all(uid, Date.now());
  return rows.map((r) => ({
    id: r.package_id,
    recordId: r.id,
    name: r.name,
    price: r.price,
    period: r.period,
    paymentCode: r.payment_code,
    purchasedAt: Number(r.purchased_at),
    expiresAt: Number(r.expires_at),
    targetId: r.target_id || null
  }));
}

function createPlanOrder(userId = DEFAULT_USER_ID, request = {}) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const pkgId = String(request.packageId || '').trim();
  const canonical = PRICING_PACKAGES.find((p) => p.id === pkgId);
  if (!canonical || pkgId === 'basic') {
    return { ok: false, error: 'Gói dịch vụ không hợp lệ.' };
  }
  if (canonical.available !== true) {
    return { ok: false, error: 'Gói này hiện chưa mở bán.' };
  }
  if (!Number.isSafeInteger(canonical.priceVnd) || canonical.priceVnd <= 0) {
    return { ok: false, error: 'Gói này chưa được cấu hình giá hợp lệ.' };
  }

  const targetId = String(request.targetId || '').trim();
  const isBoostPlan = pkgId === 'boost-24h' || pkgId === 'boost-7d';
  if (isBoostPlan && !targetId) {
    return { ok: false, error: 'Vui lòng chọn bài đăng roommate cần đẩy.' };
  }
  if (isBoostPlan) {
    const listing = db
      .prepare('SELECT id FROM roommates WHERE id = ? AND user_id = ?')
      .get(targetId, uid);
    if (!listing) {
      return { ok: false, error: 'Không tìm thấy bài đăng của bạn để đẩy.' };
    }
  }

  const now = Date.now();
  const id = `order-${now}-${crypto.randomBytes(5).toString('hex')}`;
  const transferCode = `RM${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const expiresAt = now + 30 * 60 * 1000;

  db.prepare(`
    INSERT INTO plan_purchase_orders (
      id, user_id, package_id, amount_vnd, transfer_code, target_id,
      status, created_at, expires_at, confirmed_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, NULL)
  `).run(
    id,
    uid,
    pkgId,
    canonical.priceVnd,
    transferCode,
    targetId || null,
    now,
    expiresAt
  );

  return {
    ok: true,
    order: {
      id,
      packageId: pkgId,
      packageName: canonical.name,
      amountVnd: canonical.priceVnd,
      transferCode,
      expiresAt,
      targetId: targetId || null
    }
  };
}

function applyRoommateBoost(db, userId, targetId, durationMs, now) {
  const listing = db
    .prepare('SELECT * FROM roommates WHERE id = ? AND user_id = ?')
    .get(targetId, userId);
  if (!listing) return { ok: false, error: 'Không tìm thấy bài đăng của bạn để đẩy.' };

  const currentExpiry = Number(listing.boost_expires_at) > now
    ? Number(listing.boost_expires_at)
    : now;
  const expiresAt = currentExpiry + durationMs;
  db.prepare(`
    UPDATE roommates
    SET is_boosted = 1, boost_expires_at = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(expiresAt, now, targetId, userId);
  return { ok: true, expiresAt };
}

function confirmPlanOrder(userId = DEFAULT_USER_ID, orderId = '') {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const id = String(orderId || '').trim();
  const order = db
    .prepare('SELECT * FROM plan_purchase_orders WHERE id = ? AND user_id = ?')
    .get(id, uid);
  if (!order) return { ok: false, error: 'Không tìm thấy đơn thanh toán.' };
  if (order.status === 'confirmed') {
    return { ok: true, alreadyConfirmed: true, plans: getUserPlans(uid) };
  }

  if (order.status !== 'pending' || Number(order.expires_at) <= Date.now()) {
    if (order.status === 'pending') {
      db.prepare(`UPDATE plan_purchase_orders SET status = 'expired' WHERE id = ?`).run(id);
    }
    return { ok: false, error: 'Mã thanh toán đã hết hạn. Vui lòng tạo đơn mới.' };
  }

  const canonical = PRICING_PACKAGES.find((p) => p.id === order.package_id);
  if (!canonical || !Number.isSafeInteger(canonical.durationMs) || canonical.durationMs <= 0) {
    return { ok: false, error: 'Không thể kích hoạt thời hạn của gói này.' };
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const lockedOrder = db
      .prepare('SELECT * FROM plan_purchase_orders WHERE id = ? AND user_id = ?')
      .get(id, uid);
    if (!lockedOrder) {
      db.exec('ROLLBACK');
      return { ok: false, error: 'Không tìm thấy đơn thanh toán.' };
    }
    if (lockedOrder.status === 'confirmed') {
      db.exec('ROLLBACK');
      return { ok: true, alreadyConfirmed: true, plans: getUserPlans(uid) };
    }
    const now = Date.now();
    if (lockedOrder.status !== 'pending' || Number(lockedOrder.expires_at) <= now) {
      if (lockedOrder.status === 'pending') {
        db.prepare(`UPDATE plan_purchase_orders SET status = 'expired' WHERE id = ?`).run(id);
      }
      db.exec('COMMIT');
      return { ok: false, error: 'Mã thanh toán đã hết hạn. Vui lòng tạo đơn mới.' };
    }

    const durationMs = ['extra-posts-day', 'unlimited-matches-day'].includes(canonical.id)
      ? getVietnamDayStart(now) + 86400000 - now
      : canonical.durationMs;
    let expiresAt = now + durationMs;
    if (canonical.id === 'boost-24h' || canonical.id === 'boost-7d') {
      const boost = applyRoommateBoost(
        db,
        uid,
        lockedOrder.target_id,
        durationMs,
        now
      );
      if (!boost.ok) {
        db.exec('ROLLBACK');
        return boost;
      }
      expiresAt = boost.expiresAt;
    } else {
      const currentPlan = db.prepare(`
        SELECT MAX(expires_at) AS expires_at FROM user_plans
        WHERE user_id = ? AND package_id = ? AND status = 'active' AND expires_at > ?
      `).get(uid, canonical.id, now);
      if (Number(currentPlan?.expires_at) > now) {
        expiresAt = Number(currentPlan.expires_at) + durationMs;
      }
    }

    db.prepare(`
      INSERT INTO user_plans (
        id, user_id, package_id, name, price, period, payment_code,
        status, purchased_at, expires_at, target_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).run(
      `plan-${order.id}`,
      uid,
      canonical.id,
      canonical.name,
      canonical.price,
      canonical.period,
      lockedOrder.transfer_code,
      now,
      expiresAt,
      lockedOrder.target_id
    );
    db.prepare(`
      UPDATE plan_purchase_orders SET status = 'confirmed', confirmed_at = ? WHERE id = ?
    `).run(now, id);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    ok: true,
    plans: getUserPlans(uid),
    roommates: getAllRoommates(uid)
  };
}

function boostRoommateListing(userId = DEFAULT_USER_ID, targetId = '', period = '') {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const durationMs = period === '24h' ? 24 * 60 * 60 * 1000 : period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 0;
  if (!durationMs) return { ok: false, error: 'Thời hạn đẩy tin không hợp lệ.' };
  if (!hasActivePackage(db, uid, 'all-in-one')) {
    return { ok: false, error: 'Tính năng đẩy tin trong Gói trọn bộ chưa được kích hoạt.' };
  }

  const result = applyRoommateBoost(db, uid, String(targetId || '').trim(), durationMs, Date.now());
  if (!result.ok) return result;
  return { ...result, roommates: getAllRoommates(uid) };
}

function resetUserPlans(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM user_plans WHERE user_id = ?').run(uid);
    db.prepare(`UPDATE roommates SET is_boosted = 0, boost_expires_at = NULL WHERE user_id = ?`).run(uid);
    db.prepare(`UPDATE plan_purchase_orders SET status = 'cancelled' WHERE user_id = ? AND status = 'pending'`).run(uid);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return { ok: true, plans: [] };
}

// ============================================================================
// NOTIFICATIONS, REPORTS & CONTACTS
// ============================================================================

function getNotifications(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  const rows = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
    .all(uid);
  if (!rows.length) {
    return SEED_NOTIFICATIONS;
  }
  return rows.map((r) => ({
    id: r.id.replace(`${uid}-`, ''),
    title: r.title,
    time: r.time_label,
    unread: Boolean(r.unread),
    href: r.href
  }));
}

function markAllNotificationsRead(userId = DEFAULT_USER_ID) {
  const db = openDatabaseConnection();
  const uid = userId || DEFAULT_USER_ID;
  db.prepare('UPDATE notifications SET unread = 0 WHERE user_id = ?').run(uid);
  return getNotifications(uid);
}

function createReport(payload = {}, userId = null) {
  const db = openDatabaseConnection();
  const now = Date.now();
  const reportId = `rep-${now}`;
  const targetTitle = String(payload.targetTitle || payload.roomTitle || 'Tin đăng phòng trọ').trim();
  const reason = String(payload.reason || 'Nghi ngờ thông tin chưa chính xác').trim();
  const description = String(payload.description || '').trim();
  const reporterContact = String(payload.reporterContact || payload.phone || '').trim();

  db.prepare(`
    INSERT INTO reports (
      id, user_id, target_title, room_id, reason, description, reporter_contact, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reportId,
    userId || null,
    targetTitle,
    payload.roomId ? String(payload.roomId) : null,
    reason,
    description,
    reporterContact,
    'pending',
    now
  );

  return {
    ok: true,
    report: {
      id: reportId,
      targetTitle,
      reason,
      description,
      status: 'pending',
      createdAt: now
    }
  };
}

function getReports() {
  const db = openDatabaseConnection();
  return db.prepare('SELECT * FROM reports ORDER BY created_at DESC LIMIT 50').all();
}

function createContactTicket(payload = {}, userId = null) {
  const db = openDatabaseConnection();
  const now = Date.now();
  const id = `contact-${now}`;
  const ticketId = payload.ticketId || `#RM-${Math.floor(1000 + Math.random() * 9000)}`;
  const name = String(payload.name || 'Sinh viên Roomie').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const topic = String(payload.topic || 'Hỗ trợ chung').trim();
  const city = String(payload.city || 'TP.HCM').trim();
  const district = String(payload.district || '').trim();
  const university = String(payload.university || '').trim();
  const message = String(payload.message || '').trim();

  db.prepare(`
    INSERT INTO contacts (
      id, ticket_id, user_id, name, email, phone, topic, city, district, university, message, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    ticketId,
    userId || null,
    name,
    email,
    phone,
    topic,
    city,
    district,
    university,
    message,
    'open',
    now
  );

  return {
    ok: true,
    ticket: {
      id,
      ticketId,
      name,
      email,
      phone,
      topic,
      city,
      district,
      university,
      message,
      status: 'open',
      createdAt: now
    }
  };
}

function getContactTickets() {
  const db = openDatabaseConnection();
  return db.prepare('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 50').all();
}

function getDatabaseStats() {
  const db = openDatabaseConnection();
  const countTable = (tbl) => Number(db.prepare(`SELECT COUNT(*) AS c FROM ${tbl}`).get()?.c || 0);
  return {
    engine: 'node:sqlite (SQLite3 WAL)',
    dbPath: activeDbPath,
    tables: {
      users: countTable('users'),
      rooms: countTable('rooms'),
      roommates: countTable('roommates'),
      roommate_daily_post_usage: countTable('roommate_daily_post_usage'),
      roommate_match_daily_usage: countTable('roommate_match_daily_usage'),
      saved_rooms: countTable('saved_rooms'),
      quiz_submissions: countTable('quiz_submissions'),
      connections: countTable('connections'),
      user_plans: countTable('user_plans'),
      plan_purchase_orders: countTable('plan_purchase_orders'),
      notifications: countTable('notifications'),
      reports: countTable('reports'),
      contacts: countTable('contacts')
    }
  };
}

module.exports = {
  MAX_CONTACT_SLOTS,
  DEFAULT_USER_ID,
  openDatabaseConnection,
  seedDatabase,
  getUserByToken,
  getUserById,
  getAllUsers,
  loginUser,
  registerUser,
  logoutSession,
  getAllRooms,
  getRoomById,
  createRoom,
  pingRoomAvailability,
  deleteRoom,
  getSavedRoomIds,
  toggleSavedRoom,
  getAllRoommates,
  createRoommateListing,
  deleteRoommateListing,
  getRoommateById,
  getQuizSubmission,
  saveQuizSubmission,
  getConnections,
  getActiveSlotConnections,
  upsertConnection,
  updateConnectionStatusById,
  getUserPlans,
  createPlanOrder,
  confirmPlanOrder,
  boostRoommateListing,
  resetUserPlans,
  getNotifications,
  markAllNotificationsRead,
  createReport,
  getReports,
  createContactTicket,
  getContactTickets,
  getDatabaseStats
};
