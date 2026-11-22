/**
 * Roomie Match - PostgreSQL Data Access Layer (Supabase Ready)
 * Uses node-postgres (`pg.Pool`) with SSL auto-detection and parameterized SQL.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const { getDatabaseConfig, isDemoLoginEnabled } = require('../config');
const { evaluateQuizSubmission, computeRoommateMatchScore } = require('../services/matching');
const {
  SEED_USERS,
  SEED_ROOMS,
  SEED_ROOMMATES,
  QUIZ_QUESTIONS,
  SEED_NOTIFICATIONS,
  PRICING_PACKAGES
} = require('./seed-data');

const SCHEMA_PATH = path.join(__dirname, 'schema.postgres.sql');
const DEFAULT_USER_ID = 'user-minhthu';
const MAX_CONTACT_SLOTS = 3;
const MAX_PAID_BOOST_HORIZON_MS = 30 * 24 * 60 * 60 * 1000;

const AREA_DIRECTORY = {
  // TP.HCM (17 districts / cities)
  'quan-1': { label: 'Quận 1', city: 'TP.HCM' },
  'quan-3': { label: 'Quận 3', city: 'TP.HCM' },
  'quan-4': { label: 'Quận 4', city: 'TP.HCM' },
  'quan-5': { label: 'Quận 5', city: 'TP.HCM' },
  'quan-6': { label: 'Quận 6', city: 'TP.HCM' },
  'quan-7': { label: 'Quận 7', city: 'TP.HCM' },
  'quan-8': { label: 'Quận 8', city: 'TP.HCM' },
  'quan-10': { label: 'Quận 10', city: 'TP.HCM' },
  'quan-11': { label: 'Quận 11', city: 'TP.HCM' },
  'quan-12': { label: 'Quận 12', city: 'TP.HCM' },
  'binh-tan': { label: 'Quận Bình Tân', city: 'TP.HCM' },
  'binh-thanh': { label: 'Quận Bình Thạnh', city: 'TP.HCM' },
  'go-vap': { label: 'Quận Gò Vấp', city: 'TP.HCM' },
  'phu-nhuan': { label: 'Quận Phú Nhuận', city: 'TP.HCM' },
  'tan-binh': { label: 'Quận Tân Bình', city: 'TP.HCM' },
  'tan-phu': { label: 'Quận Tân Phú', city: 'TP.HCM' },
  'thu-duc': { label: 'TP. Thủ Đức', city: 'TP.HCM' },
  // Hà Nội (12 districts)
  'ba-dinh': { label: 'Quận Ba Đình', city: 'Hà Nội' },
  'bac-tu-liem': { label: 'Quận Bắc Từ Liêm', city: 'Hà Nội' },
  'cau-giay': { label: 'Quận Cầu Giấy', city: 'Hà Nội' },
  'dong-da': { label: 'Quận Đống Đa', city: 'Hà Nội' },
  'ha-dong': { label: 'Quận Hà Đông', city: 'Hà Nội' },
  'hai-ba-trung': { label: 'Quận Hai Bà Trưng', city: 'Hà Nội' },
  'hoan-kiem': { label: 'Quận Hoàn Kiếm', city: 'Hà Nội' },
  'hoang-mai': { label: 'Quận Hoàng Mai', city: 'Hà Nội' },
  'long-bien': { label: 'Quận Long Biên', city: 'Hà Nội' },
  'nam-tu-liem': { label: 'Quận Nam Từ Liêm', city: 'Hà Nội' },
  'tay-ho': { label: 'Quận Tây Hồ', city: 'Hà Nội' },
  'thanh-xuan': { label: 'Quận Thanh Xuân', city: 'Hà Nội' }
};

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

let poolInstance = null;
let readyPromise = null;

function setPoolForTesting(customPool) {
  poolInstance = customPool;
  readyPromise = null;
}

function openDatabaseConnection() {
  if (poolInstance) return poolInstance;
  const config = getDatabaseConfig();
  if (!config.connectionString) {
    const err = new Error(
      'Chưa cấu hình DATABASE_URL (Supabase PostgreSQL). Vui lòng thêm DATABASE_URL vào .env hoặc biến môi trường.'
    );
    err.code = 'MISSING_DATABASE_URL';
    throw err;
  }
  poolInstance = new Pool(config);
  return poolInstance;
}

async function closePool() {
  readyPromise = null;
  if (poolInstance && typeof poolInstance.end === 'function') {
    const active = poolInstance;
    poolInstance = null;
    await active.end();
  }
}

async function queryAll(executor, sql, params = []) {
  const res = await executor.query(sql, params);
  return res?.rows || [];
}

async function queryOne(executor, sql, params = []) {
  const rows = await queryAll(executor, sql, params);
  return rows[0] || null;
}

async function withTransaction(fn) {
  const pool = openDatabaseConnection();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors
    }
    throw err;
  } finally {
    client.release();
  }
}

async function ensureDatabaseReady() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    const pool = openDatabaseConnection();
    const tblRow = await queryOne(pool, "SELECT to_regclass('public.users') AS tbl");
    if (!tblRow || !tblRow.tbl) {
      const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
      await pool.query(schemaSql);
    }
    const existsRow = await queryOne(pool, 'SELECT EXISTS(SELECT 1 FROM users) AS has_users');
    if (!existsRow || !existsRow.has_users) {
      await seedDatabase(pool);
    }
    return pool;
  })().catch((err) => {
    readyPromise = null;
    throw err;
  });
  return readyPromise;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const rawPass = String(password || '');
  const rawHash = String(storedHash || '');
  if (!rawPass || !rawHash.startsWith('scrypt:')) return false;
  const parts = rawHash.split(':');
  if (parts.length !== 3) return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  const actualBuf = crypto.scryptSync(rawPass, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  return actualBuf.length === expectedBuf.length && crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function parseJSONSafe(str, fallback) {
  try {
    if (str !== null && typeof str === 'object') return str;
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function formatVND(num) {
  const n = Number(String(num).replace(/[^\d]/g, '')) || 0;
  return n.toLocaleString('vi-VN') + 'đ';
}

function getVietnamDayStart(timestamp = Date.now()) {
  const offset = 7 * 60 * 60 * 1000;
  return Math.floor((Number(timestamp) + offset) / 86400000) * 86400000 - offset;
}

function buildPlanEntitlements(activePlans = []) {
  const hasAllInOne = activePlans.some((p) => p.id === 'all-in-one');
  const hasExtraPosts = hasAllInOne || activePlans.some((p) => p.id === 'extra-posts-day');
  const hasUnlimitedMatch = hasAllInOne || activePlans.some((p) => p.id === 'unlimited-matches-day');
  return {
    hasAllInOne,
    hasExtraPosts,
    hasUnlimitedMatch,
    unlockedPrediction: hasUnlimitedMatch,
    dailyPostLimit: hasExtraPosts ? 4 : 1
  };
}

async function hasActivePackage(executor, userId, packageId, now = Date.now()) {
  const row = await queryOne(
    executor,
    `SELECT 1 FROM user_plans
     WHERE user_id = $1 AND package_id = $2 AND status = 'active' AND expires_at > $3
     LIMIT 1`,
    [userId, packageId, now]
  );
  return Boolean(row);
}

async function hasPlanFeature(executor, userId, packageId, now = Date.now()) {
  if (!userId) return false;
  if (packageId === 'all-in-one') {
    return hasActivePackage(executor, userId, 'all-in-one', now);
  }
  const row = await queryOne(
    executor,
    `SELECT 1 FROM user_plans
     WHERE user_id = $1 AND package_id IN ($2, 'all-in-one') AND status = 'active' AND expires_at > $3
     LIMIT 1`,
    [userId, packageId, now]
  );
  return Boolean(row);
}

async function hasUnlockedPrediction(userId) {
  if (!userId) return false;
  const pool = await ensureDatabaseReady();
  return hasPlanFeature(pool, userId, 'unlimited-matches-day', Date.now());
}

// ============================================================================
// SEEDER
// ============================================================================

async function seedDatabase(executor = openDatabaseConnection()) {
  const now = Date.now();

  for (const u of SEED_USERS) {
    await executor.query(
      `INSERT INTO users (
         id, name, email, alt_email, password_hash, short_school, school, major,
         gender, id_code, avatar, budget_range, preferred_areas, move_in_time,
         verified_student, role, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO NOTHING`,
      [
        u.id,
        u.name,
        u.email.toLowerCase(),
        u.altEmail || null,
        hashPassword(u.password || crypto.randomBytes(12).toString('hex')),
        u.shortSchool,
        u.school,
        u.major,
        u.gender,
        u.idCode,
        u.avatar,
        u.budgetRange,
        u.preferredAreas,
        u.moveInTime,
        Boolean(u.verifiedStudent),
        u.role || 'student',
        now,
        now
      ]
    );
  }

  for (let idx = 0; idx < SEED_ROOMS.length; idx += 1) {
    const r = SEED_ROOMS[idx];
    await executor.query(
      `INSERT INTO rooms (
         id, owner_id, title, short_title, breadcrumb_title, district_label, area_key, city,
         address, short_address, distance_label, school_distance_badge, price, price_formatted,
         total_room_price, area_sqm, capacity_label, spots_label, badge_text, floor_label,
         deposit_label, type_key, type_label, match_score, is_new_user_post, is_verified_listing,
         is_boosted, status, amenities_json, summary_specs, images_json, map_bg,
         roommate_json, costs_json, description_json, last_ping_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8,
         $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, $19, $20,
         $21, $22, $23, $24, $25, $26,
         $27, $28, $29, $30, $31, $32,
         $33, $34, $35, $36, $37, $38
       )
       ON CONFLICT (id) DO NOTHING`,
      [
        String(r.id),
        r.ownerId || null,
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
        Number(r.matchScore) || 90,
        Boolean(r.isNewUserPost),
        r.isVerifiedListing !== false,
        Boolean(r.isBoosted),
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
      ]
    );
  }

  for (let idx = 0; idx < SEED_ROOMMATES.length; idx += 1) {
    const rm = SEED_ROOMMATES[idx];
    await executor.query(
      `INSERT INTO roommates (
         id, user_id, name, short_name, age, gender, school, short_school, major,
         match_score, match_label, vnu_member, has_room, room_status_title, room_status_detail,
         linked_room_id, area_key, city, budget, avatar, quote, criteria_json,
         tags_json, contact_json, quiz_profile_json, is_boosted, boost_expires_at,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19, $20, $21, $22,
         $23, $24, $25, $26, NULL,
         $27, $28
       )
       ON CONFLICT (id) DO NOTHING`,
      [
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
        Boolean(rm.vnuMember),
        Boolean(rm.hasRoom),
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
        false,
        now - (SEED_ROOMMATES.length - idx) * 60000,
        now
      ]
    );
  }

  const firstRm = SEED_ROOMMATES[0];
  if (firstRm) {
    await executor.query(
      `INSERT INTO connections (
         id, user_id, partner_id, name, meta, avatar, room_id, status,
         note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (user_id, partner_id) DO NOTHING`,
      [
        `conn-${firstRm.id}`,
        DEFAULT_USER_ID,
        firstRm.id,
        firstRm.name,
        `${firstRm.school} • Cùng khu vực ĐHQG`,
        firstRm.avatar,
        firstRm.linkedRoomId || '1',
        'incoming',
        'Chào Minh Thư! Mình thấy tụi mình cùng học HCMUS và cùng quan tâm khu vực Làng ĐHQG. Bạn kết nối để trao đổi xem phòng nhé?',
        '',
        false,
        firstRm.contact?.phone || '',
        firstRm.contact?.zalo || '',
        firstRm.contact?.facebook || '',
        now - 3600000,
        now - 3600000
      ]
    );
  }

  for (const u of SEED_USERS) {
    for (let idx = 0; idx < SEED_NOTIFICATIONS.length; idx += 1) {
      const n = SEED_NOTIFICATIONS[idx];
      await executor.query(
        `INSERT INTO notifications (id, user_id, title, time_label, unread, href, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [`${u.id}-${n.id}`, u.id, n.title, n.time, Boolean(n.unread), n.href, now - idx * 600000]
      );
    }
  }
}

// ============================================================================
// ROW MAPPERS (Privacy & Entitlement Enforced)
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

function mapRoomRow(row, options = {}) {
  if (!row) return null;
  const rawRoommate = parseJSONSafe(row.roommate_json, {});
  const safeRoommate = { ...rawRoommate };
  if (!options.includeContact) {
    delete safeRoommate.contact;
  }

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
    matchScore: options.unlockedPrediction ? Number(row.match_score) || 90 : null,
    isNewUserPost: Boolean(row.is_new_user_post),
    isVerifiedListing: Boolean(row.is_verified_listing),
    isBoosted: Boolean(row.is_boosted),
    status: row.status || 'active',
    amenities: parseJSONSafe(row.amenities_json, []),
    summarySpecs: row.summary_specs || '',
    images: parseJSONSafe(row.images_json, []),
    mapBg: row.map_bg || '/assets/images/phong-chi-tiet/map-1.png',
    roommate: safeRoommate,
    costs: parseJSONSafe(row.costs_json, {}),
    description: parseJSONSafe(row.description_json, []),
    lastPingAt: Number(row.last_ping_at) || 0,
    createdAt: Number(row.created_at) || 0
  };
}

function mapRoommateRow(row, options = {}) {
  if (!row) return null;
  const { userQuizAnswers = null, unlockedPrediction = false, includeMatchDebug = false } = options;
  const quizProfile = parseJSONSafe(row.quiz_profile_json, {});
  const now = Date.now();
  const boostExp = row.boost_expires_at !== null && row.boost_expires_at !== undefined
    ? Number(row.boost_expires_at)
    : null;

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
    matchScore: null,
    matchLabel: null,
    hasPersonalizedMatchScore: false,
    createdAt: Number(row.created_at) || 0,
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
    isBoosted: boostExp === null ? Boolean(row.is_boosted) : boostExp > now,
    boostExpiresAt: boostExp
  };

  if (
    unlockedPrediction &&
    userQuizAnswers &&
    Object.keys(userQuizAnswers).length >= QUIZ_QUESTIONS.length
  ) {
    const dynamicMatch = computeRoommateMatchScore(userQuizAnswers, { ...baseRm, quizProfile });
    const hasPersonal = Boolean(dynamicMatch.isGenderCompatible && dynamicMatch.hasLifestyleData);
    baseRm.matchScore = hasPersonal ? dynamicMatch.matchScore : null;
    baseRm.matchLabel = dynamicMatch.matchLabel;
    baseRm.hasPersonalizedMatchScore = hasPersonal;
    if (includeMatchDebug) {
      baseRm.isGenderCompatible = dynamicMatch.isGenderCompatible;
    }
  }

  return baseRm;
}

function mapConnectionRow(row) {
  if (!row) return null;
  const isUnlocked = row.status === 'accepted' || row.status === 'matched';
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
    phone: isUnlocked ? row.phone || '+84 777 639 593' : null,
    zalo: isUnlocked ? row.zalo || '0777639593' : null,
    facebook: isUnlocked ? row.facebook || 'fb.com/roomie.student' : null,
    createdAt: Number(row.created_at) || 0,
    updatedAt: Number(row.updated_at) || 0
  };
}

// ============================================================================
// AUTHENTICATION & SESSIONS
// ============================================================================

async function createSessionToken(userId, executor = null) {
  const pool = executor || (await ensureDatabaseReady());
  const token = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 3600 * 1000;
  await pool.query(
    'INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)',
    [token, userId, expiresAt, now]
  );
  return token;
}

async function getUserByToken(token) {
  if (!token) return null;
  const pool = await ensureDatabaseReady();
  const row = await queryOne(
    pool,
    `SELECT u.* FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > $2`,
    [token, Date.now()]
  );
  return mapUserRow(row);
}

async function getUserById(userId) {
  if (!userId) return null;
  const pool = await ensureDatabaseReady();
  const row = await queryOne(pool, 'SELECT * FROM users WHERE id = $1', [String(userId)]);
  return mapUserRow(row);
}

async function getAllUsers() {
  const pool = await ensureDatabaseReady();
  const rows = await queryAll(pool, 'SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(mapUserRow);
}

function getDemoAccounts() {
  if (!isDemoLoginEnabled()) return [];
  const allowedIds = new Set(['user-minhthu', 'user-hoangnam', 'user-landlord-q5']);
  return SEED_USERS.filter((u) => allowedIds.has(u.id)).map((u) => ({
    key: u.id === 'user-minhthu' ? 'minhthu' : u.id === 'user-hoangnam' ? 'hoangnam' : 'landlord',
    id: u.id,
    name: u.name,
    shortSchool: u.shortSchool,
    gender: u.gender,
    role: u.role,
    avatar: u.avatar
  }));
}

async function loginDemoAccount(accountKey = '') {
  if (!isDemoLoginEnabled()) {
    return { ok: false, error: 'Chức năng đăng nhập nhanh demo đang tắt.' };
  }
  const key = String(accountKey || '').trim().toLowerCase();
  const keyMap = {
    minhthu: 'user-minhthu',
    'user-minhthu': 'user-minhthu',
    hoangnam: 'user-hoangnam',
    'user-hoangnam': 'user-hoangnam',
    landlord: 'user-landlord-q5',
    'user-landlord-q5': 'user-landlord-q5'
  };
  const targetUserId = keyMap[key];
  if (!targetUserId) {
    return { ok: false, error: 'Tài khoản demo không hợp lệ.' };
  }
  const pool = await ensureDatabaseReady();
  const row = await queryOne(pool, 'SELECT * FROM users WHERE id = $1', [targetUserId]);
  if (!row) {
    return { ok: false, error: 'Không tìm thấy tài khoản demo trong cơ sở dữ liệu.' };
  }
  const token = await createSessionToken(row.id, pool);
  return { ok: true, user: mapUserRow(row), token };
}

async function loginUser(identifier, password) {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();
  if (!cleanId) {
    return { ok: false, error: 'Vui lòng nhập email hoặc mã đăng nhập.' };
  }
  if (!cleanPass) {
    return { ok: false, error: 'Vui lòng nhập mật khẩu.' };
  }

  const pool = await ensureDatabaseReady();
  const row = await queryOne(
    pool,
    `SELECT * FROM users
     WHERE LOWER(email) = $1
        OR LOWER(COALESCE(alt_email, '')) = $1
        OR LOWER(id) = $1
        OR LOWER(name) = $1
     LIMIT 1`,
    [cleanId]
  );

  if (!row) {
    return { ok: false, error: 'Không tìm thấy tài khoản với email này.' };
  }

  if (!verifyPassword(cleanPass, row.password_hash)) {
    return { ok: false, error: 'Mật khẩu chưa chính xác. Vui lòng kiểm tra lại.' };
  }

  const token = await createSessionToken(row.id, pool);
  return { ok: true, user: mapUserRow(row), token };
}

async function registerUser(payload = {}) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const confirmPassword = String(payload.confirmPassword || '');
  const schoolCode = String(payload.schoolCode || payload.shortSchool || 'HCMUS').trim();
  const major = String(payload.major || 'Sinh viên • K23').trim() || 'Sinh viên • K23';
  const gender = payload.gender === 'Nam' ? 'Nam' : 'Nữ';
  const role = payload.role === 'landlord' ? 'landlord' : 'student';

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

  const pool = await ensureDatabaseReady();
  const existing = await queryOne(pool, 'SELECT id FROM users WHERE LOWER(email) = $1', [email]);
  if (existing) {
    return { ok: false, error: 'Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.' };
  }

  const schoolObj =
    role === 'landlord'
      ? { code: 'Chủ nhà', name: String(payload.school || 'Chủ nhà xác thực').trim(), area: 'TP.HCM / Hà Nội' }
      : SCHOOL_DIRECTORY[schoolCode] || {
          code: schoolCode || 'SV',
          name: payload.school || schoolCode || 'Sinh viên Đại học',
          area: 'TP.HCM'
        };
  const isEduEmail = /\.edu(\.vn)?$/i.test(email);
  const randomCode = (role === 'landlord' ? '#CN-' : '#SV-') + Math.floor(1000 + Math.random() * 9000);
  const avatar =
    payload.avatar ||
    (gender === 'Nam' ? '/assets/images/phong-chi-tiet/avatar-1.jpg' : '/assets/images/common/avatar-profile.jpg');
  const now = Date.now();
  const userId = payload.id || `user-${now}-${crypto.randomBytes(3).toString('hex')}`;

  await pool.query(
    `INSERT INTO users (
       id, name, email, alt_email, password_hash, short_school, school, major,
       gender, id_code, avatar, budget_range, preferred_areas, move_in_time,
       verified_student, role, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
    [
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
      isEduEmail || role === 'landlord',
      role,
      now,
      now
    ]
  );

  const firstRm = SEED_ROOMMATES[0];
  if (firstRm && role === 'student') {
    await pool.query(
      `INSERT INTO connections (
         id, user_id, partner_id, name, meta, avatar, room_id, status,
         note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (user_id, partner_id) DO NOTHING`,
      [
        `conn-${userId}-${firstRm.id}`,
        userId,
        firstRm.id,
        firstRm.name,
        `${firstRm.school} • Cùng khu vực ĐHQG`,
        firstRm.avatar,
        firstRm.linkedRoomId || '1',
        'incoming',
        `Chào ${name}! Tụi mình cùng quan tâm khu vực Làng ĐHQG. Bạn kết nối để mình gửi ảnh phòng nhé?`,
        '',
        false,
        firstRm.contact?.phone || '',
        firstRm.contact?.zalo || '',
        firstRm.contact?.facebook || '',
        now,
        now
      ]
    );
  }

  for (let idx = 0; idx < SEED_NOTIFICATIONS.length; idx += 1) {
    const n = SEED_NOTIFICATIONS[idx];
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, time_label, unread, href, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [`${userId}-${n.id}`, userId, n.title, n.time, Boolean(n.unread), n.href, now - idx * 600000]
    );
  }

  const user = await getUserById(userId);
  const token = await createSessionToken(userId, pool);
  return { ok: true, user, token };
}

async function logoutSession(token) {
  if (!token) return;
  const pool = await ensureDatabaseReady();
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
}

// ============================================================================
// ROOMS & SAVED ROOMS
// ============================================================================

async function fetchAllRoomRows(pool) {
  return queryAll(
    pool,
    `SELECT * FROM rooms WHERE status != 'deleted'
     ORDER BY is_new_user_post DESC, is_boosted DESC, created_at DESC`
  );
}

async function getAllRooms(options = {}) {
  const pool = await ensureDatabaseReady();
  const hasExplicitFlag = typeof options.unlockedPrediction === 'boolean';
  const [unlockedPrediction, rows] = await Promise.all([
    hasExplicitFlag
      ? Promise.resolve(options.unlockedPrediction)
      : options.userId
      ? hasUnlockedPrediction(options.userId)
      : Promise.resolve(false),
    fetchAllRoomRows(pool)
  ]);
  return rows.map((row) => mapRoomRow(row, { unlockedPrediction, includeContact: false }));
}

async function getRoomById(id, options = {}) {
  const pool = await ensureDatabaseReady();
  const row = await queryOne(pool, 'SELECT * FROM rooms WHERE id = $1', [String(id)]);
  if (!row) return null;
  const unlockedPrediction = options.userId ? await hasUnlockedPrediction(options.userId) : false;
  return mapRoomRow(row, { unlockedPrediction, includeContact: Boolean(options.includeContact) });
}

async function createRoom(payload = {}, user = null) {
  if (!user || !user.id) {
    return { ok: false, error: 'Vui lòng đăng nhập trước khi đăng tin phòng.' };
  }
  const address = String(payload.address || '').trim();
  const priceNum = Number(String(payload.price || '').replace(/[^\d]/g, '')) || 0;
  const areaKey = String(payload.areaKey || 'thu-duc').trim();
  const areaMeta = AREA_DIRECTORY[areaKey];

  if (!areaMeta) {
    return { ok: false, error: 'Quận/Huyện hoặc khu vực chưa hợp lệ.' };
  }
  if (!address || address.length < 4) {
    return { ok: false, error: 'Vui lòng nhập địa chỉ phòng trọ cụ thể.' };
  }
  if (priceNum < 500000 || priceNum > 50000000) {
    return { ok: false, error: 'Giá thuê/tháng cần nằm trong khoảng 500.000đ – 50.000.000đ.' };
  }

  const pool = await ensureDatabaseReady();
  const now = Date.now();
  const newId = String(payload.id || `room-${now}-${crypto.randomBytes(3).toString('hex')}`);
  const districtLabel = String(payload.districtLabel || areaMeta.label).trim();
  const city = String(payload.city || areaMeta.city).trim();
  const isPrivate = payload.typeKey === 'phong-rieng' || payload.purpose === 'rent';
  const typeKey = payload.typeKey || (isPrivate ? 'phong-rieng' : 'o-ghep');
  const typeLabel = payload.typeLabel || (isPrivate ? 'Phòng riêng' : 'Ở ghép');
  const title =
    String(payload.title || '').trim() ||
    (isPrivate ? `Cho thuê ${typeLabel} chính chủ - ${address}` : `Tìm bạn ở ghép ${typeLabel} - ${address}`);

  const roommateObj = payload.roommate || {
    id: user.id,
    name: user.name,
    age: user.role === 'landlord' ? 'Chính chủ' : '20 tuổi',
    bioTitle:
      user.role === 'landlord'
        ? `Chủ nhà xác thực • ${user.school || districtLabel}`
        : `Sinh viên ${user.shortSchool || 'Roomie'} • Đã xác thực thẻ SV`,
    note: String(payload.message || 'Tìm bạn cùng phòng sạch sẽ, tôn trọng giờ giấc.').trim(),
    avatar: user.avatar || '/assets/images/common/avatar-profile.jpg',
    contact: {
      phone: String(payload.phone || '0901 234 567').trim(),
      zalo: String(payload.zalo || payload.phone || '0901234567').replace(/\s+/g, ''),
      facebook: String(payload.facebook || 'fb.com/roomie.student').trim()
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

  await pool.query(
    `INSERT INTO rooms (
       id, owner_id, title, short_title, breadcrumb_title, district_label, area_key, city,
       address, short_address, distance_label, school_distance_badge, price, price_formatted,
       total_room_price, area_sqm, capacity_label, spots_label, badge_text, floor_label,
       deposit_label, type_key, type_label, match_score, is_new_user_post, is_verified_listing,
       is_boosted, status, amenities_json, summary_specs, images_json, map_bg,
       roommate_json, costs_json, description_json, last_ping_at, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13, $14,
       $15, $16, $17, $18, $19, $20,
       $21, $22, $23, $24, $25, $26,
       $27, $28, $29, $30, $31, $32,
       $33, $34, $35, $36, $37, $38
     )`,
    [
      newId,
      user.id,
      title,
      payload.shortTitle || address,
      payload.breadcrumbTitle || address,
      districtLabel,
      areaKey,
      city,
      address,
      payload.shortAddress || districtLabel,
      payload.distanceLabel || 'Gần trường ĐH',
      payload.schoolDistanceBadge || payload.distanceLabel || 'Gần trường ĐH',
      priceNum,
      payload.priceFormatted || formatVND(priceNum),
      payload.totalRoomPrice || (isPrivate ? `${formatVND(priceNum)}/tháng` : `${formatVND(priceNum * 2)}/tháng`),
      Number(payload.areaSqm) || 28,
      payload.capacityLabel || (isPrivate ? 'Nguyên phòng riêng' : 'Tối đa 2 người'),
      payload.spotsLabel || (isPrivate ? 'Nguyên phòng riêng' : 'Còn 1 chỗ ở ghép'),
      payload.badgeText || (payload.isBoosted ? 'NỔI BẬT' : 'Mới đăng'),
      payload.floorLabel || 'Tầng 2',
      payload.depositLabel || '1 tháng cọc',
      typeKey,
      typeLabel,
      Number(payload.matchScore) || 92,
      true,
      payload.verified !== false,
      Boolean(payload.isBoosted),
      'active',
      JSON.stringify(payload.amenities || ['Máy lạnh', 'Giờ linh hoạt']),
      payload.summarySpecs || `${Number(payload.areaSqm) || 28}m² • Máy lạnh, giờ linh hoạt`,
      JSON.stringify(imagesArr),
      '/assets/images/phong-chi-tiet/map-1.png',
      JSON.stringify(roommateObj),
      JSON.stringify(costsObj),
      JSON.stringify(descArr),
      now,
      now,
      now
    ]
  );

  const created = await getRoomById(newId, { userId: user.id });
  return { ok: true, room: created };
}

async function pingRoomAvailability(roomId, status = 'active', user = null) {
  const pool = await ensureDatabaseReady();
  const room = await queryOne(pool, 'SELECT * FROM rooms WHERE id = $1', [String(roomId)]);
  if (!room) return { ok: false, statusCode: 404, error: 'Không tìm thấy phòng.' };
  if (user && user.role !== 'admin' && String(room.owner_id || '') !== String(user.id)) {
    return { ok: false, statusCode: 403, error: 'Bạn chỉ có thể cập nhật trạng thái tin phòng của chính mình.' };
  }
  const safeStatus = ['active', 'reserved', 'rented'].includes(String(status)) ? String(status) : 'active';
  const now = Date.now();
  await pool.query(
    'UPDATE rooms SET status = $1, last_ping_at = $2, updated_at = $3 WHERE id = $4',
    [safeStatus, now, now, String(roomId)]
  );
  return { ok: true, room: await getRoomById(roomId, { userId: user?.id || null }) };
}

async function deleteRoom(roomId, user = null) {
  const pool = await ensureDatabaseReady();
  const room = await queryOne(pool, 'SELECT id, owner_id FROM rooms WHERE id = $1', [String(roomId)]);
  if (!room) return { ok: false, statusCode: 404, error: 'Không tìm thấy phòng.' };
  if (user && user.role !== 'admin' && String(room.owner_id || '') !== String(user.id)) {
    return { ok: false, statusCode: 403, error: 'Bạn không có quyền xóa tin phòng này.' };
  }
  await pool.query('DELETE FROM rooms WHERE id = $1', [String(roomId)]);
  return { ok: true };
}

async function getSavedRoomIds(userId) {
  if (!userId) return [];
  const pool = await ensureDatabaseReady();
  const rows = await queryAll(
    pool,
    'SELECT room_id FROM saved_rooms WHERE user_id = $1 ORDER BY created_at DESC',
    [String(userId)]
  );
  return rows.map((r) => String(r.room_id));
}

async function toggleSavedRoom(userId, roomId) {
  if (!userId) return { ok: false, error: 'Vui lòng đăng nhập để lưu tin.' };
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  const rid = String(roomId);
  const existing = await queryOne(
    pool,
    'SELECT 1 FROM saved_rooms WHERE user_id = $1 AND room_id = $2',
    [uid, rid]
  );
  if (existing) {
    await pool.query('DELETE FROM saved_rooms WHERE user_id = $1 AND room_id = $2', [uid, rid]);
    return { ok: true, saved: false, savedRoomIds: await getSavedRoomIds(uid) };
  }
  await pool.query(
    'INSERT INTO saved_rooms (user_id, room_id, created_at) VALUES ($1, $2, $3)',
    [uid, rid, Date.now()]
  );
  return { ok: true, saved: true, savedRoomIds: await getSavedRoomIds(uid) };
}

// ============================================================================
// ROOMMATES, QUIZ COMPATIBILITY & PREDICTIONS
// ============================================================================

async function getQuizSubmission(userId) {
  if (!userId) return null;
  const pool = await ensureDatabaseReady();
  const row = await queryOne(pool, 'SELECT * FROM quiz_submissions WHERE user_id = $1', [String(userId)]);
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

async function saveQuizSubmission(userId, answers = {}, explicitResult = null) {
  if (!userId) {
    return { ok: false, error: 'Vui lòng đăng nhập để lưu kết quả trắc nghiệm.' };
  }
  await ensureDatabaseReady();
  const uid = String(userId);
  const evaluated = evaluateQuizSubmission(answers);
  const finalResult = explicitResult
    ? {
        ...evaluated,
        ...explicitResult,
        pillars: explicitResult.pillars || evaluated.pillars
      }
    : evaluated;

  const now = Date.now();
  const isComplete = evaluated.answeredCount === QUIZ_QUESTIONS.length;
  const dayStart = getVietnamDayStart(now);

  const txResult = await withTransaction(async (client) => {
    const hasUnlimitedMatches = await hasPlanFeature(client, uid, 'unlimited-matches-day', now);
    if (isComplete && !hasUnlimitedMatches) {
      const usageRow = await queryOne(
        client,
        `SELECT match_count FROM roommate_match_daily_usage
         WHERE user_id = $1 AND day_start = $2 FOR UPDATE`,
        [uid, dayStart]
      );
      const currentUsage = Number(usageRow?.match_count) || 0;
      if (currentUsage >= 1) {
        return {
          ok: false,
          code: 'daily_match_limit',
          error: 'Bạn đã dùng lượt ghép miễn phí hôm nay. Mua Gói 4 hoặc Gói 5 để ghép không giới hạn và mở khóa dự đoán hợp gu.'
        };
      }
      await client.query(
        `INSERT INTO roommate_match_daily_usage (user_id, day_start, match_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, day_start) DO UPDATE SET
           match_count = roommate_match_daily_usage.match_count + 1`,
        [uid, dayStart]
      );
    }

    await client.query(
      `INSERT INTO quiz_submissions (
         id, user_id, answers_json, gender, preferred_gender, gender_option,
         archetype, match_count, pillars_json, answered_count, completed_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id) DO UPDATE SET
         answers_json = EXCLUDED.answers_json,
         gender = EXCLUDED.gender,
         preferred_gender = EXCLUDED.preferred_gender,
         gender_option = EXCLUDED.gender_option,
         archetype = EXCLUDED.archetype,
         match_count = EXCLUDED.match_count,
         pillars_json = EXCLUDED.pillars_json,
         answered_count = EXCLUDED.answered_count,
         completed_at = EXCLUDED.completed_at,
         updated_at = EXCLUDED.updated_at`,
      [
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
      ]
    );
    return { ok: true, hasUnlimitedMatches };
  });

  if (!txResult.ok) return txResult;
  const saved = await getQuizSubmission(uid);
  const unlocked = Boolean(txResult.hasUnlimitedMatches);
  return {
    ok: true,
    answers: saved?.answers || evaluated.answers,
    result: {
      ...(saved?.result || finalResult),
      locked: !unlocked
    },
    unlockedPrediction: unlocked
  };
}

async function fetchAllRoommateRows(pool, now = Date.now()) {
  return queryAll(
    pool,
    `SELECT * FROM roommates
     ORDER BY
       CASE WHEN boost_expires_at > $1 THEN 0 ELSE 1 END,
       boost_expires_at DESC NULLS LAST,
       created_at DESC`,
    [now]
  );
}

async function getAllRoommates(userId = null, options = {}) {
  const pool = await ensureDatabaseReady();
  const unlockedPrediction =
    typeof options.unlockedPrediction === 'boolean'
      ? options.unlockedPrediction
      : userId
      ? await hasUnlockedPrediction(userId)
      : false;
  const quiz =
    'quiz' in options
      ? options.quiz
      : unlockedPrediction && userId
      ? await getQuizSubmission(userId)
      : null;
  const userAnswers = unlockedPrediction ? quiz?.answers || null : null;

  const rows = await fetchAllRoommateRows(pool, Date.now());

  return rows.map((r) =>
    mapRoommateRow(r, {
      userQuizAnswers: userAnswers,
      unlockedPrediction
    })
  );
}

async function getQuizPredictions(userId) {
  if (!userId) {
    return { ok: false, statusCode: 401, error: 'Vui lòng đăng nhập để xem dự đoán hợp gu.' };
  }
  const pool = await ensureDatabaseReady();
  const unlocked = await hasPlanFeature(pool, String(userId), 'unlimited-matches-day', Date.now());
  if (!unlocked) {
    return {
      ok: false,
      statusCode: 403,
      locked: true,
      code: 'PLAN_REQUIRED',
      error: 'Kết quả dự đoán & điểm % Hợp gu chỉ mở khóa khi kích hoạt Gói 4 (Match không giới hạn) hoặc Gói 5 (Trọn bộ).'
    };
  }
  const quiz = await getQuizSubmission(userId);
  if (!quiz || Number(quiz.result?.answeredCount) < QUIZ_QUESTIONS.length) {
    return {
      ok: false,
      statusCode: 400,
      locked: false,
      code: 'QUIZ_INCOMPLETE',
      error: 'Bạn chưa hoàn thành đủ 9 câu hỏi trắc nghiệm hợp gu.'
    };
  }

  const rows = await queryAll(
    pool,
    `SELECT * FROM roommates
     ORDER BY
       CASE WHEN boost_expires_at > $1 THEN 0 ELSE 1 END,
       boost_expires_at DESC NULLS LAST,
       created_at DESC`,
    [Date.now()]
  );

  const candidates = rows
    .map((r) =>
      mapRoommateRow(r, {
        userQuizAnswers: quiz.answers,
        unlockedPrediction: true,
        includeMatchDebug: true
      })
    )
    .filter((rm) => rm.userId !== userId && rm.hasPersonalizedMatchScore && rm.matchScore !== null)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return {
    ok: true,
    locked: false,
    quizResult: quiz.result,
    predictions: candidates
  };
}

async function getRoommatePostQuotaStatus(userId, options = {}) {
  if (!userId) {
    return { used: 0, dailyLimit: 1, remaining: 1 };
  }
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  const now = Date.now();
  const dayStart = getVietnamDayStart(now);
  const hasExplicitExtra = typeof options.hasExtraPosts === 'boolean';

  const [hasExtraPosts, usageRow, existingRow] = await Promise.all([
    hasExplicitExtra
      ? Promise.resolve(options.hasExtraPosts)
      : hasPlanFeature(pool, uid, 'extra-posts-day', now),
    queryOne(
      pool,
      'SELECT post_count FROM roommate_daily_post_usage WHERE user_id = $1 AND day_start = $2',
      [uid, dayStart]
    ),
    queryOne(
      pool,
      'SELECT COUNT(*) AS count FROM roommates WHERE user_id = $1 AND created_at >= $2 AND created_at < $3',
      [uid, dayStart, dayStart + 86400000]
    )
  ]);
  const dailyLimit = hasExtraPosts ? 4 : 1;
  const used = Math.max(Number(usageRow?.post_count) || 0, Number(existingRow?.count) || 0);
  return {
    used,
    dailyLimit,
    remaining: Math.max(0, dailyLimit - used)
  };
}

async function createRoommateListing(user, payload = {}) {
  if (!user || !user.id || String(user.role || 'student').toLowerCase() !== 'student') {
    return { ok: false, error: 'Chỉ tài khoản sinh viên mới được đăng tin tìm roommate.' };
  }

  const postType = String(payload.postType || '');
  const hasRoom = postType === 'has-room';
  const area = String(payload.area || '').trim().slice(0, 180);
  const areaKey = String(payload.areaKey || '').trim();
  const areaMeta = AREA_DIRECTORY[areaKey];
  const budgetAmount = Number(payload.budget);

  if (
    (!hasRoom && postType !== 'find-room') ||
    !area ||
    !areaMeta ||
    !Number.isFinite(budgetAmount) ||
    budgetAmount < 500000 ||
    budgetAmount > 50000000 ||
    !user.gender
  ) {
    return {
      ok: false,
      error: 'Thông tin khu vực (TP.HCM / Hà Nội) hoặc ngân sách (tối thiểu 500.000đ/tháng) chưa hợp lệ.'
    };
  }

  const budget = `${(budgetAmount / 1000000).toFixed(1)} tr/tháng/người`;
  const roomType = String(payload.roomType || '').trim().slice(0, 60);
  const schoolPreference = String(payload.schoolPreference || '').trim().slice(0, 80);
  const note = String(payload.note || '').trim().slice(0, 500);
  const criteria = Array.isArray(payload.criteria)
    ? payload.criteria.map((c) => String(c || '').trim().slice(0, 50)).filter(Boolean).slice(0, 12)
    : [];

  const statusTitle = hasRoom ? 'Đang tìm bạn ở ghép:' : 'Đang tìm bạn cùng đi tìm phòng:';
  const statusDetail = hasRoom
    ? `${area}${roomType ? ` • ${roomType}` : ''}${schoolPreference ? ` • Gần ${schoolPreference}` : ''} • ${budget}`
    : `Mong muốn tìm phòng tại ${area}${roomType ? ` • ${roomType}` : ''}${schoolPreference ? ` • Ưu tiên ${schoolPreference}` : ''} • Ngân sách ${budget}`;

  const now = Date.now();
  const id = `roommate-${now}-${crypto.randomBytes(5).toString('hex')}`;
  const name = String(user.name || 'Sinh viên Roomie').trim();
  const school = String(user.school || user.shortSchool || 'Sinh viên').trim();
  const shortSchool = String(user.shortSchool || school).trim();
  const isVnuMember = /HCMUS|HCMUT|UIT|UEL|HCMUSSH|HCMIU|ĐHQG/i.test(`${school} ${shortSchool}`);
  const dayStart = getVietnamDayStart(now);
  const city = String(payload.city || areaMeta.city).trim().slice(0, 80);

  await ensureDatabaseReady();

  const txOutcome = await withTransaction(async (client) => {
    const storedUsage = await queryOne(
      client,
      'SELECT post_count FROM roommate_daily_post_usage WHERE user_id = $1 AND day_start = $2 FOR UPDATE',
      [user.id, dayStart]
    );
    const existingPosts = await queryOne(
      client,
      'SELECT COUNT(*) AS count FROM roommates WHERE user_id = $1 AND created_at >= $2 AND created_at < $3',
      [user.id, dayStart, dayStart + 86400000]
    );
    const used = Math.max(Number(storedUsage?.post_count) || 0, Number(existingPosts?.count) || 0);
    const dailyLimit = (await hasPlanFeature(client, user.id, 'extra-posts-day', now)) ? 4 : 1;

    if (used >= dailyLimit) {
      return {
        ok: false,
        code: 'daily_limit',
        error:
          dailyLimit > 1
            ? 'Bạn đã dùng hết 4 lượt đăng roommate hôm nay.'
            : 'Gói miễn phí cho phép đăng 1 tin roommate mỗi ngày. Mua Gói 1 để đăng thêm tối đa 3 tin.'
      };
    }

    const bundlePlan = await queryOne(
      client,
      `SELECT expires_at FROM user_plans
       WHERE user_id = $1 AND package_id = 'all-in-one' AND status = 'active' AND expires_at > $2
       ORDER BY expires_at DESC LIMIT 1`,
      [user.id, now]
    );
    const autoBoostExpiresAt = bundlePlan ? Number(bundlePlan.expires_at) : null;

    const savedQuizRow = await queryOne(
      client,
      'SELECT answers_json FROM quiz_submissions WHERE user_id = $1',
      [user.id]
    );
    const quizProfileStr = savedQuizRow?.answers_json || '{}';

    await client.query(
      `INSERT INTO roommate_daily_post_usage (user_id, day_start, post_count)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, day_start) DO UPDATE SET
         post_count = GREATEST(roommate_daily_post_usage.post_count, EXCLUDED.post_count)`,
      [user.id, dayStart, used + 1]
    );

    await client.query(
      `INSERT INTO roommates (
         id, user_id, name, short_name, age, gender, school, short_school, major,
         match_score, match_label, vnu_member, has_room, room_status_title,
         room_status_detail, linked_room_id, area_key, city, budget, avatar, quote,
         criteria_json, tags_json, contact_json, quiz_profile_json, is_boosted,
         boost_expires_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10, $11, $12, $13, $14,
         $15, NULL, $16, $17, $18, $19, $20,
         $21, $22, '{}', $23, $24,
         $25, $26, $27
       )`,
      [
        id,
        user.id,
        name,
        name,
        Number(user.age) || 20,
        String(user.gender),
        school,
        shortSchool,
        String(user.major || '').trim(),
        90,
        'Chưa có điểm hợp gu',
        isVnuMember,
        hasRoom,
        statusTitle,
        statusDetail,
        areaKey,
        city,
        budget,
        String(user.avatar || '/assets/images/common/avatar-profile.jpg'),
        note,
        JSON.stringify(criteria),
        JSON.stringify(criteria),
        quizProfileStr,
        Boolean(autoBoostExpiresAt && autoBoostExpiresAt > now),
        autoBoostExpiresAt && autoBoostExpiresAt > now ? autoBoostExpiresAt : null,
        now,
        now
      ]
    );

    return { ok: true };
  });

  if (!txOutcome.ok) return txOutcome;

  const pool = openDatabaseConnection();
  const row = await queryOne(pool, 'SELECT * FROM roommates WHERE id = $1', [id]);
  const quota = await getRoommatePostQuotaStatus(user.id);
  return {
    ok: true,
    roommate: mapRoommateRow(row, { unlockedPrediction: false }),
    quota
  };
}

async function deleteRoommateListing(user, roommateId) {
  if (!user || user.role !== 'student' || !user.id || !roommateId) return false;
  const pool = await ensureDatabaseReady();
  const res = await pool.query(
    'DELETE FROM roommates WHERE id = $1 AND user_id = $2',
    [String(roommateId), String(user.id)]
  );
  return Number(res.rowCount || 0) > 0;
}

async function getRoommateById(rmId, userId = null) {
  const pool = await ensureDatabaseReady();
  const unlocked = userId ? await hasUnlockedPrediction(userId) : false;
  const quiz = unlocked && userId ? await getQuizSubmission(userId) : null;
  const row = await queryOne(pool, 'SELECT * FROM roommates WHERE id = $1', [String(rmId)]);
  return mapRoommateRow(row, {
    userQuizAnswers: quiz?.answers || null,
    unlockedPrediction: unlocked
  });
}

// ============================================================================
// DOUBLE OPT-IN CONNECTIONS (MAX 3 ACTIVE SLOTS)
// ============================================================================

async function getConnections(userId) {
  if (!userId) return [];
  const pool = await ensureDatabaseReady();
  const rows = await queryAll(
    pool,
    'SELECT * FROM connections WHERE user_id = $1 ORDER BY updated_at DESC',
    [String(userId)]
  );
  return rows.map(mapConnectionRow);
}

async function getActiveSlotConnections(userId) {
  const list = await getConnections(userId);
  return list.filter((c) => c.status === 'pending' || c.status === 'accepted');
}

async function resolvePartnerContactFromDB(pool, partnerId, partnerName, explicitContact) {
  if (explicitContact && explicitContact.phone) return explicitContact;

  if (partnerId) {
    const rmRow = await queryOne(pool, 'SELECT contact_json FROM roommates WHERE id = $1', [partnerId]);
    if (rmRow) {
      const c = parseJSONSafe(rmRow.contact_json, null);
      if (c && c.phone) return c;
    }
  }

  if (partnerName) {
    const rmRowByName = await queryOne(
      pool,
      'SELECT contact_json FROM roommates WHERE name = $1 OR short_name = $1 LIMIT 1',
      [partnerName]
    );
    if (rmRowByName) {
      const c = parseJSONSafe(rmRowByName.contact_json, null);
      if (c && c.phone) return c;
    }
  }

  // Fallback: check rooms.roommate_json
  const roomRows = await queryAll(pool, "SELECT id, roommate_json FROM rooms WHERE status != 'deleted'");
  for (const r of roomRows) {
    const rm = parseJSONSafe(r.roommate_json, null);
    if (
      rm &&
      rm.contact &&
      rm.contact.phone &&
      ((partnerId && (rm.id === partnerId || `room-${r.id}` === partnerId)) ||
        (partnerName && rm.name === partnerName))
    ) {
      return rm.contact;
    }
  }

  return {
    phone: '+84 777 639 593',
    zalo: '0777639593',
    facebook: 'fb.com/roomie.student'
  };
}

async function upsertConnection(userId, target = {}, status = 'pending', extra = {}) {
  if (!userId) {
    return { ok: false, error: 'Vui lòng đăng nhập để thực hiện kết nối.' };
  }
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  const partnerId = String(target.partnerId || target.id || `partner-${Date.now()}`);
  const partnerName = String(target.name || 'Sinh viên Roomie');

  const existingRow = await queryOne(
    pool,
    'SELECT * FROM connections WHERE user_id = $1 AND (partner_id = $2 OR name = $3)',
    [uid, partnerId, partnerName]
  );

  const isOccupyingSlot = status === 'pending' || status === 'accepted';
  const wasOccupyingSlot = existingRow && (existingRow.status === 'pending' || existingRow.status === 'accepted');
  if (isOccupyingSlot && !wasOccupyingSlot) {
    const activeSlots = await getActiveSlotConnections(uid);
    if (activeSlots.length >= MAX_CONTACT_SLOTS) {
      return {
        ok: false,
        code: 'SLOTS_FULL',
        error: `Đã dùng hết ${MAX_CONTACT_SLOTS}/${MAX_CONTACT_SLOTS} slot liên hệ song song. Hãy giải phóng 1 slot trước.`
      };
    }
  }

  const contact = await resolvePartnerContactFromDB(pool, partnerId, partnerName, target.contact);
  const now = Date.now();
  const connId = existingRow?.id || target.connId || `conn-${uid}-${partnerId}`;

  await pool.query(
    `INSERT INTO connections (
       id, user_id, partner_id, name, meta, avatar, room_id, status,
       note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     ON CONFLICT (user_id, partner_id) DO UPDATE SET
       name = EXCLUDED.name,
       meta = EXCLUDED.meta,
       avatar = EXCLUDED.avatar,
       room_id = EXCLUDED.room_id,
       status = EXCLUDED.status,
       note = EXCLUDED.note,
       release_reason = EXCLUDED.release_reason,
       reverted_once = EXCLUDED.reverted_once,
       phone = EXCLUDED.phone,
       zalo = EXCLUDED.zalo,
       facebook = EXCLUDED.facebook,
       updated_at = EXCLUDED.updated_at`,
    [
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
      extra.revertedOnce !== undefined ? Boolean(extra.revertedOnce) : Boolean(existingRow?.reverted_once),
      contact.phone || '+84 777 639 593',
      contact.zalo || '0777639593',
      contact.facebook || 'fb.com/roomie.student',
      existingRow ? Number(existingRow.created_at) : now,
      now
    ]
  );

  const savedRow = await queryOne(
    pool,
    'SELECT * FROM connections WHERE user_id = $1 AND partner_id = $2',
    [uid, partnerId]
  );
  return {
    ok: true,
    connection: mapConnectionRow(savedRow),
    connections: await getConnections(uid)
  };
}

async function updateConnectionStatusById(userId, connId, nextStatus, extra = {}) {
  if (!userId) {
    return { ok: false, error: 'Vui lòng đăng nhập để cập nhật kết nối.' };
  }
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  const existingRow = await queryOne(
    pool,
    'SELECT * FROM connections WHERE (id = $1 OR partner_id = $1) AND user_id = $2',
    [String(connId), uid]
  );
  if (!existingRow) {
    return { ok: false, error: 'Không tìm thấy kết nối cần cập nhật.' };
  }

  const isOccupyingSlot = nextStatus === 'pending' || nextStatus === 'accepted';
  const wasOccupyingSlot = existingRow.status === 'pending' || existingRow.status === 'accepted';
  if (isOccupyingSlot && !wasOccupyingSlot) {
    const activeSlots = await getActiveSlotConnections(uid);
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
    extra.revertedOnce !== undefined ? Boolean(extra.revertedOnce) : Boolean(existingRow.reverted_once);

  await pool.query(
    `UPDATE connections
     SET status = $1, release_reason = $2, reverted_once = $3, updated_at = $4
     WHERE id = $5 AND user_id = $6`,
    [nextStatus, releaseReason, revertedOnce, now, existingRow.id, uid]
  );

  const updatedRow = await queryOne(pool, 'SELECT * FROM connections WHERE id = $1', [existingRow.id]);
  return {
    ok: true,
    connection: mapConnectionRow(updatedRow),
    connections: await getConnections(uid)
  };
}

// ============================================================================
// PRICING PLANS, CHECKOUT & ANTI-STACKING BOOST
// ============================================================================

async function getUserPlans(userId) {
  if (!userId) return [];
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  const rows = await queryAll(
    pool,
    `SELECT * FROM user_plans
     WHERE user_id = $1 AND status = 'active' AND expires_at > $2
     ORDER BY purchased_at DESC`,
    [uid, Date.now()]
  );
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

async function applyRoommateBoost(client, uid, targetId, durationMs, now = Date.now(), maxCapExpiresAt = null) {
  const listing = await queryOne(
    client,
    'SELECT id, boost_expires_at FROM roommates WHERE id = $1 AND user_id = $2 FOR UPDATE',
    [targetId, uid]
  );
  if (!listing) {
    return { ok: false, error: 'Không tìm thấy bài đăng của bạn để đẩy.' };
  }

  const existingExpiry = Number(listing.boost_expires_at) || 0;
  let expiresAt;
  if (maxCapExpiresAt !== null) {
    // All-in-one bundle boost is bounded by package expiry and rejects repeated same-tier extensions within 1h
    const desiredExpiry = Math.min(now + durationMs, Number(maxCapExpiresAt));
    if (existingExpiry > now && existingExpiry + 60 * 60 * 1000 >= desiredExpiry) {
      return {
        ok: true,
        alreadyBoosted: true,
        expiresAt: existingExpiry
      };
    }
    expiresAt = desiredExpiry;
  } else {
    const baseTime = Math.max(now, existingExpiry);
    expiresAt = Math.min(baseTime + durationMs, now + MAX_PAID_BOOST_HORIZON_MS);
  }

  await client.query(
    'UPDATE roommates SET is_boosted = TRUE, boost_expires_at = $1, updated_at = $2 WHERE id = $3',
    [expiresAt, now, targetId]
  );
  return { ok: true, expiresAt };
}

async function createPlanOrder(userId, request = {}) {
  if (!userId) {
    return { ok: false, error: 'Vui lòng đăng nhập để mua gói dịch vụ.' };
  }
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
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
    const listing = await queryOne(
      pool,
      'SELECT id FROM roommates WHERE id = $1 AND user_id = $2',
      [targetId, uid]
    );
    if (!listing) {
      return { ok: false, error: 'Không tìm thấy bài đăng của bạn để đẩy.' };
    }
  }

  const now = Date.now();
  const id = `order-${now}-${crypto.randomBytes(5).toString('hex')}`;
  const transferCode = `RM${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const expiresAt = now + 30 * 60 * 1000;

  await pool.query(
    `INSERT INTO plan_purchase_orders (
       id, user_id, package_id, amount_vnd, transfer_code, target_id,
       status, created_at, expires_at, confirmed_at
     ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, NULL)`,
    [id, uid, pkgId, canonical.priceVnd, transferCode, targetId || null, now, expiresAt]
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

async function confirmPlanOrder(userId, orderId) {
  if (!userId) {
    return { ok: false, error: 'Vui lòng đăng nhập để xác nhận thanh toán.' };
  }
  await ensureDatabaseReady();
  const uid = String(userId);
  const id = String(orderId || '').trim();
  if (!id) return { ok: false, error: 'Thiếu mã đơn thanh toán.' };

  const outcome = await withTransaction(async (client) => {
    const lockedOrder = await queryOne(
      client,
      'SELECT * FROM plan_purchase_orders WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [id, uid]
    );
    if (!lockedOrder) {
      return { ok: false, error: 'Không tìm thấy đơn thanh toán.' };
    }
    if (lockedOrder.status === 'confirmed') {
      return { ok: true, alreadyConfirmed: true };
    }
    const now = Date.now();
    if (lockedOrder.status !== 'pending' || Number(lockedOrder.expires_at) <= now) {
      if (lockedOrder.status === 'pending') {
        await client.query(`UPDATE plan_purchase_orders SET status = 'expired' WHERE id = $1`, [id]);
      }
      return { ok: false, error: 'Mã thanh toán đã hết hạn. Vui lòng tạo đơn mới.' };
    }

    const canonical = PRICING_PACKAGES.find((p) => p.id === lockedOrder.package_id);
    if (!canonical || canonical.id === 'basic') {
      return { ok: false, error: 'Gói dịch vụ của đơn hàng không còn hợp lệ.' };
    }

    const durationMs = ['extra-posts-day', 'unlimited-matches-day'].includes(canonical.id)
      ? getVietnamDayStart(now) + 86400000 - now
      : canonical.durationMs;

    let expiresAt = now + durationMs;
    if (canonical.id === 'boost-24h' || canonical.id === 'boost-7d') {
      const boost = await applyRoommateBoost(client, uid, lockedOrder.target_id, durationMs, now, null);
      if (!boost.ok) return boost;
      expiresAt = boost.expiresAt;
    } else {
      const currentPlan = await queryOne(
        client,
        `SELECT MAX(expires_at) AS expires_at FROM user_plans
         WHERE user_id = $1 AND package_id = $2 AND status = 'active' AND expires_at > $3`,
        [uid, canonical.id, now]
      );
      if (Number(currentPlan?.expires_at) > now) {
        expiresAt = Number(currentPlan.expires_at) + durationMs;
      }
    }

    await client.query(
      `INSERT INTO user_plans (
         id, user_id, package_id, name, price, period, payment_code,
         status, purchased_at, expires_at, target_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10)`,
      [
        `plan-${lockedOrder.id}`,
        uid,
        canonical.id,
        canonical.name,
        canonical.price,
        canonical.period,
        lockedOrder.transfer_code,
        now,
        expiresAt,
        lockedOrder.target_id
      ]
    );
    await client.query(
      `UPDATE plan_purchase_orders SET status = 'confirmed', confirmed_at = $1 WHERE id = $2`,
      [now, id]
    );

    return { ok: true, alreadyConfirmed: false };
  });

  if (!outcome.ok) return outcome;
  const plans = await getUserPlans(uid);
  const entitlements = buildPlanEntitlements(plans);
  const [roommates, postQuota] = await Promise.all([
    getAllRoommates(uid, { unlockedPrediction: entitlements.unlockedPrediction }),
    getRoommatePostQuotaStatus(uid, { hasExtraPosts: entitlements.hasExtraPosts })
  ]);
  return {
    ok: true,
    alreadyConfirmed: outcome.alreadyConfirmed,
    plans,
    entitlements,
    postQuota,
    roommates
  };
}

async function boostRoommateListing(userId, targetId = '', period = '') {
  if (!userId) {
    return { ok: false, error: 'Vui lòng đăng nhập để đẩy tin.' };
  }
  const durationMs = period === '24h' ? 24 * 60 * 60 * 1000 : period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 0;
  if (!durationMs) return { ok: false, error: 'Thời hạn đẩy tin không hợp lệ.' };

  await ensureDatabaseReady();
  const uid = String(userId);
  const now = Date.now();

  const txResult = await withTransaction(async (client) => {
    const bundlePlan = await queryOne(
      client,
      `SELECT expires_at FROM user_plans
       WHERE user_id = $1 AND package_id = 'all-in-one' AND status = 'active' AND expires_at > $2
       ORDER BY expires_at DESC LIMIT 1`,
      [uid, now]
    );
    if (!bundlePlan) {
      return { ok: false, error: 'Tính năng đẩy tin trong Gói trọn bộ chưa được kích hoạt.' };
    }
    return applyRoommateBoost(
      client,
      uid,
      String(targetId || '').trim(),
      durationMs,
      now,
      Number(bundlePlan.expires_at)
    );
  });

  if (!txResult.ok) return txResult;
  return {
    ...txResult,
    roommates: await getAllRoommates(uid)
  };
}

async function resetUserPlans(userId) {
  if (!userId) return { ok: false, error: 'Vui lòng đăng nhập.' };
  await ensureDatabaseReady();
  const uid = String(userId);

  await withTransaction(async (client) => {
    await client.query('DELETE FROM user_plans WHERE user_id = $1', [uid]);
    await client.query(
      'UPDATE roommates SET is_boosted = FALSE, boost_expires_at = NULL WHERE user_id = $1',
      [uid]
    );
    await client.query(
      `UPDATE plan_purchase_orders SET status = 'cancelled' WHERE user_id = $1 AND status = 'pending'`,
      [uid]
    );
  });

  const [postQuota, roommates] = await Promise.all([
    getRoommatePostQuotaStatus(uid, { hasExtraPosts: false }),
    getAllRoommates(uid, { unlockedPrediction: false, quiz: null })
  ]);
  return {
    ok: true,
    plans: [],
    entitlements: buildPlanEntitlements([]),
    postQuota,
    roommates
  };
}

// ============================================================================
// NOTIFICATIONS, REPORTS & CONTACTS
// ============================================================================

async function getNotifications(userId) {
  if (!userId) return [];
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  const rows = await queryAll(
    pool,
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [uid]
  );
  return rows.map((r) => ({
    id: r.id.replace(`${uid}-`, ''),
    title: r.title,
    time: r.time_label,
    unread: Boolean(r.unread),
    href: r.href
  }));
}

async function markAllNotificationsRead(userId) {
  if (!userId) return [];
  const pool = await ensureDatabaseReady();
  const uid = String(userId);
  await pool.query('UPDATE notifications SET unread = FALSE WHERE user_id = $1', [uid]);
  return getNotifications(uid);
}

async function createReport(payload = {}, userId = null) {
  const pool = await ensureDatabaseReady();
  const now = Date.now();
  const reportId = `rep-${now}-${crypto.randomBytes(3).toString('hex')}`;
  const targetTitle = String(payload.targetTitle || payload.roomTitle || 'Tin đăng phòng trọ').trim();
  const reason = String(payload.reason || 'Nghi ngờ thông tin chưa chính xác').trim();
  const description = String(payload.description || '').trim();
  const reporterContact = String(payload.reporterContact || payload.phone || '').trim();

  await pool.query(
    `INSERT INTO reports (
       id, user_id, target_title, room_id, reason, description, reporter_contact, status, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      reportId,
      userId || null,
      targetTitle,
      payload.roomId ? String(payload.roomId) : null,
      reason,
      description,
      reporterContact,
      'pending',
      now
    ]
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

async function getReports() {
  const pool = await ensureDatabaseReady();
  const rows = await queryAll(pool, 'SELECT * FROM reports ORDER BY created_at DESC LIMIT 50');
  return rows.map((r) => ({
    ...r,
    created_at: Number(r.created_at)
  }));
}

async function createContactTicket(payload = {}, userId = null) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const message = String(payload.message || '').trim();
  if (!name || (!email && !phone) || !message) {
    return { ok: false, error: 'Vui lòng điền đầy đủ họ tên, SĐT/email và nội dung liên hệ.' };
  }

  const pool = await ensureDatabaseReady();
  const now = Date.now();
  const id = `contact-${now}-${crypto.randomBytes(3).toString('hex')}`;
  const ticketId = payload.ticketId || `#RM-${Math.floor(1000 + Math.random() * 9000)}`;
  const topic = String(payload.topic || 'Hỗ trợ chung').trim();
  const city = String(payload.city || 'TP.HCM').trim();
  const district = String(payload.district || '').trim();
  const university = String(payload.university || '').trim();

  await pool.query(
    `INSERT INTO contacts (
       id, ticket_id, user_id, name, email, phone, topic, city, district, university, message, status, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [id, ticketId, userId || null, name, email, phone, topic, city, district, university, message, 'open', now]
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

async function getContactTickets() {
  const pool = await ensureDatabaseReady();
  const rows = await queryAll(pool, 'SELECT * FROM contacts ORDER BY created_at DESC LIMIT 50');
  return rows.map((r) => ({
    ...r,
    created_at: Number(r.created_at)
  }));
}

async function getBootstrapData(userId = null) {
  const pool = await ensureDatabaseReady();
  const uid = userId ? String(userId) : null;
  const now = Date.now();

  if (!uid) {
    const [roomRows, roommateRows] = await Promise.all([
      fetchAllRoomRows(pool),
      fetchAllRoommateRows(pool, now)
    ]);
    return {
      rooms: roomRows.map((row) => mapRoomRow(row, { unlockedPrediction: false, includeContact: false })),
      roommates: roommateRows.map((r) => mapRoommateRow(r, { userQuizAnswers: null, unlockedPrediction: false })),
      plans: [],
      savedRoomIds: [],
      connections: [],
      quiz: null,
      entitlements: buildPlanEntitlements([]),
      postQuota: { used: 0, dailyLimit: 1, remaining: 1 },
      notifications: []
    };
  }

  const dayStart = getVietnamDayStart(now);
  const [
    roomRows,
    roommateRows,
    plans,
    savedRoomIds,
    connections,
    quiz,
    notifications,
    usageRow,
    existingRow
  ] = await Promise.all([
    fetchAllRoomRows(pool),
    fetchAllRoommateRows(pool, now),
    getUserPlans(uid),
    getSavedRoomIds(uid),
    getConnections(uid),
    getQuizSubmission(uid),
    getNotifications(uid),
    queryOne(
      pool,
      'SELECT post_count FROM roommate_daily_post_usage WHERE user_id = $1 AND day_start = $2',
      [uid, dayStart]
    ),
    queryOne(
      pool,
      'SELECT COUNT(*) AS count FROM roommates WHERE user_id = $1 AND created_at >= $2 AND created_at < $3',
      [uid, dayStart, dayStart + 86400000]
    )
  ]);

  const entitlements = buildPlanEntitlements(plans);
  const unlockedPrediction = entitlements.unlockedPrediction;
  const userAnswers = unlockedPrediction ? quiz?.answers || null : null;
  const used = Math.max(Number(usageRow?.post_count) || 0, Number(existingRow?.count) || 0);

  return {
    rooms: roomRows.map((row) => mapRoomRow(row, { unlockedPrediction, includeContact: false })),
    roommates: roommateRows.map((r) => mapRoommateRow(r, { userQuizAnswers: userAnswers, unlockedPrediction })),
    plans,
    savedRoomIds,
    connections,
    quiz,
    entitlements,
    postQuota: {
      used,
      dailyLimit: entitlements.dailyPostLimit,
      remaining: Math.max(0, entitlements.dailyPostLimit - used)
    },
    notifications
  };
}

async function getDatabaseStats() {
  const pool = await ensureDatabaseReady();
  const tableNames = [
    'users',
    'rooms',
    'roommates',
    'roommate_daily_post_usage',
    'roommate_match_daily_usage',
    'saved_rooms',
    'quiz_submissions',
    'connections',
    'user_plans',
    'plan_purchase_orders',
    'notifications',
    'reports',
    'contacts'
  ];
  const tables = {};
  for (const tbl of tableNames) {
    const row = await queryOne(pool, `SELECT COUNT(*) AS c FROM ${tbl}`);
    tables[tbl] = Number(row?.c || 0);
  }
  const cfg = getDatabaseConfig();
  return {
    engine: 'Supabase PostgreSQL (pg Pool)',
    dbTarget: cfg.connectionString ? 'PostgreSQL (DATABASE_URL configured)' : 'Injected Test Pool',
    tables
  };
}

module.exports = {
  MAX_CONTACT_SLOTS,
  DEFAULT_USER_ID,
  AREA_DIRECTORY,
  SCHOOL_DIRECTORY,
  openDatabaseConnection,
  setPoolForTesting,
  closePool,
  ensureDatabaseReady,
  seedDatabase,
  getUserByToken,
  getUserById,
  getAllUsers,
  getDemoAccounts,
  loginDemoAccount,
  loginUser,
  registerUser,
  logoutSession,
  createSessionToken,
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
  getRoommatePostQuotaStatus,
  getQuizSubmission,
  saveQuizSubmission,
  getQuizPredictions,
  hasUnlockedPrediction,
  getConnections,
  getActiveSlotConnections,
  upsertConnection,
  updateConnectionStatusById,
  getUserPlans,
  buildPlanEntitlements,
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
  getBootstrapData,
  getDatabaseStats
};
