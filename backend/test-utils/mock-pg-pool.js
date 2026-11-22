/**
 * In-Memory PostgreSQL Pool Adapter for Offline Unit & API Tests.
 * Implements the exact parameterized SQL operations used by backend/database/db.js.
 */

function createMockPgPool() {
  let tables = {
    users: [],
    sessions: [],
    rooms: [],
    roommates: [],
    roommate_daily_post_usage: [],
    roommate_match_daily_usage: [],
    saved_rooms: [],
    quiz_submissions: [],
    connections: [],
    user_plans: [],
    plan_purchase_orders: [],
    notifications: [],
    reports: [],
    contacts: []
  };

  function norm(sql) {
    return String(sql || '').replace(/\s+/g, ' ').trim();
  }

  function execQuery(sql, params = []) {
    const q = norm(sql);
    const upper = q.toUpperCase();

    if (upper === 'BEGIN' || upper === 'COMMIT' || upper === 'ROLLBACK') {
      return { rows: [], rowCount: 0 };
    }

    if (
      upper.startsWith('--') ||
      upper.startsWith('CREATE TABLE') ||
      upper.startsWith('CREATE INDEX') ||
      upper.includes('CREATE TABLE IF NOT EXISTS')
    ) {
      return { rows: [], rowCount: 0 };
    }

    if (q === "SELECT to_regclass('public.users') AS tbl") {
      return { rows: [{ tbl: 'users' }], rowCount: 1 };
    }

    if (q === 'SELECT EXISTS(SELECT 1 FROM users) AS has_users') {
      return { rows: [{ has_users: tables.users.length > 0 }], rowCount: 1 };
    }

    // COUNT(*)
    let m = q.match(/^SELECT COUNT\(\*\) AS (\w+) FROM (\w+)$/i);
    if (m) {
      const alias = m[1];
      const tbl = m[2];
      return { rows: [{ [alias]: String((tables[tbl] || []).length) }], rowCount: 1 };
    }

    // USERS
    if (q.startsWith('INSERT INTO users (')) {
      const [
        id, name, email, alt_email, password_hash, short_school, school, major,
        gender, id_code, avatar, budget_range, preferred_areas, move_in_time,
        verified_student, role, created_at, updated_at
      ] = params;
      if (q.includes('ON CONFLICT (id) DO NOTHING') && tables.users.some((u) => u.id === id)) {
        return { rows: [], rowCount: 0 };
      }
      tables.users.push({
        id, name, email, alt_email, password_hash, short_school, school, major,
        gender, id_code, avatar, budget_range, preferred_areas, move_in_time,
        verified_student: Boolean(verified_student), role, created_at, updated_at
      });
      return { rows: [], rowCount: 1 };
    }

    if (q === 'SELECT * FROM users WHERE id = $1') {
      const rows = tables.users.filter((u) => u.id === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT id FROM users WHERE LOWER(email) = $1') {
      const rows = tables.users.filter((u) => String(u.email || '').toLowerCase() === params[0]).map((u) => ({ id: u.id }));
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith('SELECT * FROM users WHERE LOWER(email) = $1')) {
      const target = String(params[0] || '').toLowerCase();
      const hit = tables.users.find(
        (u) =>
          String(u.email || '').toLowerCase() === target ||
          String(u.alt_email || '').toLowerCase() === target ||
          String(u.id || '').toLowerCase() === target ||
          String(u.name || '').toLowerCase() === target
      );
      return { rows: hit ? [hit] : [], rowCount: hit ? 1 : 0 };
    }

    if (q === 'SELECT * FROM users ORDER BY created_at DESC') {
      const rows = [...tables.users].sort((a, b) => Number(b.created_at) - Number(a.created_at));
      return { rows, rowCount: rows.length };
    }

    // SESSIONS
    if (q.startsWith('INSERT INTO sessions (')) {
      const [token, user_id, expires_at, created_at] = params;
      tables.sessions.push({ token, user_id, expires_at, created_at });
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('SELECT u.* FROM sessions s JOIN users u')) {
      const [token, now] = params;
      const sess = tables.sessions.find((s) => s.token === token && Number(s.expires_at) > Number(now));
      const user = sess ? tables.users.find((u) => u.id === sess.user_id) : null;
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (q === 'DELETE FROM sessions WHERE token = $1') {
      const before = tables.sessions.length;
      tables.sessions = tables.sessions.filter((s) => s.token !== params[0]);
      return { rows: [], rowCount: before - tables.sessions.length };
    }

    // ROOMS
    if (q.startsWith('INSERT INTO rooms (')) {
      const [
        id, owner_id, title, short_title, breadcrumb_title, district_label, area_key, city,
        address, short_address, distance_label, school_distance_badge, price, price_formatted,
        total_room_price, area_sqm, capacity_label, spots_label, badge_text, floor_label,
        deposit_label, type_key, type_label, match_score, is_new_user_post, is_verified_listing,
        is_boosted, status, amenities_json, summary_specs, images_json, map_bg,
        roommate_json, costs_json, description_json, last_ping_at, created_at, updated_at
      ] = params;
      if (q.includes('ON CONFLICT (id) DO NOTHING') && tables.rooms.some((r) => r.id === id)) {
        return { rows: [], rowCount: 0 };
      }
      tables.rooms.push({
        id, owner_id, title, short_title, breadcrumb_title, district_label, area_key, city,
        address, short_address, distance_label, school_distance_badge, price, price_formatted,
        total_room_price, area_sqm, capacity_label, spots_label, badge_text, floor_label,
        deposit_label, type_key, type_label, match_score,
        is_new_user_post: Boolean(is_new_user_post),
        is_verified_listing: Boolean(is_verified_listing),
        is_boosted: Boolean(is_boosted),
        status, amenities_json, summary_specs, images_json, map_bg,
        roommate_json, costs_json, description_json, last_ping_at, created_at, updated_at
      });
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith("SELECT * FROM rooms WHERE status != 'deleted'")) {
      const rows = tables.rooms
        .filter((r) => r.status !== 'deleted')
        .sort((a, b) => {
          if (Boolean(a.is_new_user_post) !== Boolean(b.is_new_user_post)) return a.is_new_user_post ? -1 : 1;
          if (Boolean(a.is_boosted) !== Boolean(b.is_boosted)) return a.is_boosted ? -1 : 1;
          return Number(b.created_at) - Number(a.created_at);
        });
      return { rows, rowCount: rows.length };
    }

    if (q === "SELECT id, roommate_json FROM rooms WHERE status != 'deleted'") {
      const rows = tables.rooms
        .filter((r) => r.status !== 'deleted')
        .map((r) => ({ id: r.id, roommate_json: r.roommate_json }));
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT * FROM rooms WHERE id = $1') {
      const rows = tables.rooms.filter((r) => r.id === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT id, owner_id FROM rooms WHERE id = $1') {
      const rows = tables.rooms.filter((r) => r.id === params[0]).map((r) => ({ id: r.id, owner_id: r.owner_id }));
      return { rows, rowCount: rows.length };
    }

    if (q === 'UPDATE rooms SET status = $1, last_ping_at = $2, updated_at = $3 WHERE id = $4') {
      let updated = 0;
      tables.rooms.forEach((r) => {
        if (r.id === params[3]) {
          r.status = params[0];
          r.last_ping_at = params[1];
          r.updated_at = params[2];
          updated += 1;
        }
      });
      return { rows: [], rowCount: updated };
    }

    if (q === 'DELETE FROM rooms WHERE id = $1') {
      const before = tables.rooms.length;
      tables.rooms = tables.rooms.filter((r) => r.id !== params[0]);
      return { rows: [], rowCount: before - tables.rooms.length };
    }

    // SAVED ROOMS
    if (q === 'SELECT room_id FROM saved_rooms WHERE user_id = $1 ORDER BY created_at DESC') {
      const rows = tables.saved_rooms
        .filter((s) => s.user_id === params[0])
        .sort((a, b) => Number(b.created_at) - Number(a.created_at))
        .map((s) => ({ room_id: s.room_id }));
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT 1 FROM saved_rooms WHERE user_id = $1 AND room_id = $2') {
      const hit = tables.saved_rooms.some((s) => s.user_id === params[0] && s.room_id === params[1]);
      return { rows: hit ? [{ '?column?': 1 }] : [], rowCount: hit ? 1 : 0 };
    }

    if (q === 'DELETE FROM saved_rooms WHERE user_id = $1 AND room_id = $2') {
      const before = tables.saved_rooms.length;
      tables.saved_rooms = tables.saved_rooms.filter((s) => !(s.user_id === params[0] && s.room_id === params[1]));
      return { rows: [], rowCount: before - tables.saved_rooms.length };
    }

    if (q === 'INSERT INTO saved_rooms (user_id, room_id, created_at) VALUES ($1, $2, $3)') {
      tables.saved_rooms.push({ user_id: params[0], room_id: params[1], created_at: params[2] });
      return { rows: [], rowCount: 1 };
    }

    // ROOMMATES
    if (q.startsWith('INSERT INTO roommates (')) {
      if (params.length === 28) {
        const [
          id, user_id, name, short_name, age, gender, school, short_school, major,
          match_score, match_label, vnu_member, has_room, room_status_title, room_status_detail,
          linked_room_id, area_key, city, budget, avatar, quote, criteria_json,
          tags_json, contact_json, quiz_profile_json, is_boosted, created_at, updated_at
        ] = params;
        if (q.includes('ON CONFLICT (id) DO NOTHING') && tables.roommates.some((r) => r.id === id)) {
          return { rows: [], rowCount: 0 };
        }
        tables.roommates.push({
          id, user_id, name, short_name, age, gender, school, short_school, major,
          match_score, match_label, vnu_member: Boolean(vnu_member), has_room: Boolean(has_room),
          room_status_title, room_status_detail, linked_room_id, area_key, city, budget, avatar, quote,
          criteria_json, tags_json, contact_json, quiz_profile_json,
          is_boosted: Boolean(is_boosted), boost_expires_at: null, created_at, updated_at
        });
      } else {
        const [
          id, user_id, name, short_name, age, gender, school, short_school, major,
          match_score, match_label, vnu_member, has_room, room_status_title, room_status_detail,
          area_key, city, budget, avatar, quote, criteria_json, tags_json,
          quiz_profile_json, is_boosted, boost_expires_at, created_at, updated_at
        ] = params;
        tables.roommates.push({
          id, user_id, name, short_name, age, gender, school, short_school, major,
          match_score, match_label, vnu_member: Boolean(vnu_member), has_room: Boolean(has_room),
          room_status_title, room_status_detail, linked_room_id: null, area_key, city, budget, avatar, quote,
          criteria_json, tags_json, contact_json: '{}', quiz_profile_json,
          is_boosted: Boolean(is_boosted), boost_expires_at, created_at, updated_at
        });
      }
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('SELECT * FROM roommates ORDER BY')) {
      const now = Number(params[0]);
      const rows = [...tables.roommates].sort((a, b) => {
        const aBoost = Number(a.boost_expires_at || 0) > now;
        const bBoost = Number(b.boost_expires_at || 0) > now;
        if (aBoost !== bBoost) return aBoost ? -1 : 1;
        if (Number(b.boost_expires_at || 0) !== Number(a.boost_expires_at || 0)) {
          return Number(b.boost_expires_at || 0) - Number(a.boost_expires_at || 0);
        }
        return Number(b.created_at) - Number(a.created_at);
      });
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT * FROM roommates WHERE id = $1') {
      const rows = tables.roommates.filter((r) => r.id === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith('SELECT id, boost_expires_at FROM roommates WHERE id = $1 AND user_id = $2')) {
      const rows = tables.roommates
        .filter((r) => r.id === params[0] && r.user_id === params[1])
        .map((r) => ({ id: r.id, boost_expires_at: r.boost_expires_at }));
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT id FROM roommates WHERE id = $1 AND user_id = $2') {
      const rows = tables.roommates
        .filter((r) => r.id === params[0] && r.user_id === params[1])
        .map((r) => ({ id: r.id }));
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT contact_json FROM roommates WHERE id = $1') {
      const rows = tables.roommates.filter((r) => r.id === params[0]).map((r) => ({ contact_json: r.contact_json }));
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith('SELECT contact_json FROM roommates WHERE name = $1 OR short_name = $1')) {
      const hit = tables.roommates.find((r) => r.name === params[0] || r.short_name === params[0]);
      return { rows: hit ? [{ contact_json: hit.contact_json }] : [], rowCount: hit ? 1 : 0 };
    }

    if (q === 'SELECT COUNT(*) AS count FROM roommates WHERE user_id = $1 AND created_at >= $2 AND created_at < $3') {
      const cnt = tables.roommates.filter(
        (r) => r.user_id === params[0] && Number(r.created_at) >= Number(params[1]) && Number(r.created_at) < Number(params[2])
      ).length;
      return { rows: [{ count: String(cnt) }], rowCount: 1 };
    }

    if (q === 'UPDATE roommates SET is_boosted = TRUE, boost_expires_at = $1, updated_at = $2 WHERE id = $3') {
      let cnt = 0;
      tables.roommates.forEach((r) => {
        if (r.id === params[2]) {
          r.is_boosted = true;
          r.boost_expires_at = params[0];
          r.updated_at = params[1];
          cnt += 1;
        }
      });
      return { rows: [], rowCount: cnt };
    }

    if (q === 'UPDATE roommates SET is_boosted = FALSE, boost_expires_at = NULL WHERE user_id = $1') {
      let cnt = 0;
      tables.roommates.forEach((r) => {
        if (r.user_id === params[0]) {
          r.is_boosted = false;
          r.boost_expires_at = null;
          cnt += 1;
        }
      });
      return { rows: [], rowCount: cnt };
    }

    if (q === 'DELETE FROM roommates WHERE id = $1 AND user_id = $2') {
      const before = tables.roommates.length;
      tables.roommates = tables.roommates.filter((r) => !(r.id === params[0] && r.user_id === params[1]));
      return { rows: [], rowCount: before - tables.roommates.length };
    }

    // DAILY USAGE TABLES
    if (q.startsWith('SELECT post_count FROM roommate_daily_post_usage WHERE user_id = $1 AND day_start = $2')) {
      const hit = tables.roommate_daily_post_usage.find((u) => u.user_id === params[0] && Number(u.day_start) === Number(params[1]));
      return { rows: hit ? [{ post_count: hit.post_count }] : [], rowCount: hit ? 1 : 0 };
    }

    if (q.startsWith('INSERT INTO roommate_daily_post_usage')) {
      const [user_id, day_start, post_count] = params;
      const hit = tables.roommate_daily_post_usage.find((u) => u.user_id === user_id && Number(u.day_start) === Number(day_start));
      if (hit) {
        hit.post_count = Math.max(Number(hit.post_count), Number(post_count));
      } else {
        tables.roommate_daily_post_usage.push({ user_id, day_start, post_count });
      }
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('SELECT match_count FROM roommate_match_daily_usage WHERE user_id = $1 AND day_start = $2')) {
      const hit = tables.roommate_match_daily_usage.find((u) => u.user_id === params[0] && Number(u.day_start) === Number(params[1]));
      return { rows: hit ? [{ match_count: hit.match_count }] : [], rowCount: hit ? 1 : 0 };
    }

    if (q.startsWith('INSERT INTO roommate_match_daily_usage')) {
      const [user_id, day_start] = params;
      const hit = tables.roommate_match_daily_usage.find((u) => u.user_id === user_id && Number(u.day_start) === Number(day_start));
      if (hit) {
        hit.match_count = Number(hit.match_count) + 1;
      } else {
        tables.roommate_match_daily_usage.push({ user_id, day_start, match_count: 1 });
      }
      return { rows: [], rowCount: 1 };
    }

    // QUIZ SUBMISSIONS
    if (q === 'SELECT * FROM quiz_submissions WHERE user_id = $1') {
      const rows = tables.quiz_submissions.filter((s) => s.user_id === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT answers_json FROM quiz_submissions WHERE user_id = $1') {
      const rows = tables.quiz_submissions.filter((s) => s.user_id === params[0]).map((s) => ({ answers_json: s.answers_json }));
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith('INSERT INTO quiz_submissions (')) {
      const [id, user_id, answers_json, gender, preferred_gender, gender_option, archetype, match_count, pillars_json, answered_count, completed_at, updated_at] = params;
      const idx = tables.quiz_submissions.findIndex((s) => s.user_id === user_id);
      const record = { id, user_id, answers_json, gender, preferred_gender, gender_option, archetype, match_count, pillars_json, answered_count, completed_at, updated_at };
      if (idx >= 0) tables.quiz_submissions[idx] = record;
      else tables.quiz_submissions.push(record);
      return { rows: [], rowCount: 1 };
    }

    // CONNECTIONS
    if (q === 'SELECT * FROM connections WHERE user_id = $1 ORDER BY updated_at DESC') {
      const rows = tables.connections.filter((c) => c.user_id === params[0]).sort((a, b) => Number(b.updated_at) - Number(a.updated_at));
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT * FROM connections WHERE user_id = $1 AND (partner_id = $2 OR name = $3)') {
      const rows = tables.connections.filter((c) => c.user_id === params[0] && (c.partner_id === params[1] || c.name === params[2]));
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT * FROM connections WHERE user_id = $1 AND partner_id = $2') {
      const rows = tables.connections.filter((c) => c.user_id === params[0] && c.partner_id === params[1]);
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT * FROM connections WHERE (id = $1 OR partner_id = $1) AND user_id = $2') {
      const rows = tables.connections.filter((c) => (c.id === params[0] || c.partner_id === params[0]) && c.user_id === params[1]);
      return { rows, rowCount: rows.length };
    }

    if (q === 'SELECT * FROM connections WHERE id = $1') {
      const rows = tables.connections.filter((c) => c.id === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith('INSERT INTO connections (')) {
      const [id, user_id, partner_id, name, meta, avatar, room_id, status, note, release_reason, reverted_once, phone, zalo, facebook, created_at, updated_at] = params;
      const idx = tables.connections.findIndex((c) => c.user_id === user_id && c.partner_id === partner_id);
      if (idx >= 0) {
        if (q.includes('DO NOTHING')) return { rows: [], rowCount: 0 };
        tables.connections[idx] = {
          ...tables.connections[idx],
          name, meta, avatar, room_id, status, note, release_reason, reverted_once: Boolean(reverted_once),
          phone, zalo, facebook, updated_at
        };
      } else {
        tables.connections.push({
          id, user_id, partner_id, name, meta, avatar, room_id, status, note, release_reason,
          reverted_once: Boolean(reverted_once), phone, zalo, facebook, created_at, updated_at
        });
      }
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('UPDATE connections SET status = $1, release_reason = $2, reverted_once = $3, updated_at = $4 WHERE id = $5 AND user_id = $6')) {
      let cnt = 0;
      tables.connections.forEach((c) => {
        if (c.id === params[4] && c.user_id === params[5]) {
          c.status = params[0];
          c.release_reason = params[1];
          c.reverted_once = Boolean(params[2]);
          c.updated_at = params[3];
          cnt += 1;
        }
      });
      return { rows: [], rowCount: cnt };
    }

    // USER PLANS & ORDERS
    if (q.startsWith("SELECT 1 FROM user_plans WHERE user_id = $1 AND package_id IN ($2, 'all-in-one') AND status = 'active' AND expires_at > $3")) {
      const hit = tables.user_plans.some(
        (p) =>
          p.user_id === params[0] &&
          (p.package_id === params[1] || p.package_id === 'all-in-one') &&
          p.status === 'active' &&
          Number(p.expires_at) > Number(params[2])
      );
      return { rows: hit ? [{ '?column?': 1 }] : [], rowCount: hit ? 1 : 0 };
    }

    if (q.startsWith("SELECT 1 FROM user_plans WHERE user_id = $1 AND package_id = $2 AND status = 'active' AND expires_at > $3")) {
      const hit = tables.user_plans.some(
        (p) => p.user_id === params[0] && p.package_id === params[1] && p.status === 'active' && Number(p.expires_at) > Number(params[2])
      );
      return { rows: hit ? [{ '?column?': 1 }] : [], rowCount: hit ? 1 : 0 };
    }

    if (q.startsWith("SELECT * FROM user_plans WHERE user_id = $1 AND status = 'active' AND expires_at > $2")) {
      const rows = tables.user_plans
        .filter((p) => p.user_id === params[0] && p.status === 'active' && Number(p.expires_at) > Number(params[1]))
        .sort((a, b) => Number(b.purchased_at) - Number(a.purchased_at));
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith("SELECT expires_at FROM user_plans WHERE user_id = $1 AND package_id = 'all-in-one'")) {
      const rows = tables.user_plans
        .filter((p) => p.user_id === params[0] && p.package_id === 'all-in-one' && p.status === 'active' && Number(p.expires_at) > Number(params[1]))
        .sort((a, b) => Number(b.expires_at) - Number(a.expires_at))
        .slice(0, 1)
        .map((p) => ({ expires_at: p.expires_at }));
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith("SELECT MAX(expires_at) AS expires_at FROM user_plans WHERE user_id = $1 AND package_id = $2")) {
      const matching = tables.user_plans.filter(
        (p) => p.user_id === params[0] && p.package_id === params[1] && p.status === 'active' && Number(p.expires_at) > Number(params[2])
      );
      const max = matching.length ? Math.max(...matching.map((p) => Number(p.expires_at))) : null;
      return { rows: [{ expires_at: max }], rowCount: 1 };
    }

    if (q.startsWith('INSERT INTO user_plans (')) {
      const [id, user_id, package_id, name, price, period, payment_code, purchased_at, expires_at, target_id] = params;
      tables.user_plans.push({
        id, user_id, package_id, name, price, period, payment_code,
        status: 'active', purchased_at, expires_at, target_id
      });
      return { rows: [], rowCount: 1 };
    }

    if (q === "UPDATE user_plans SET expires_at = $1 WHERE user_id = $2 AND package_id = 'extra-posts-day'") {
      let cnt = 0;
      tables.user_plans.forEach((p) => {
        if (p.user_id === params[1] && p.package_id === 'extra-posts-day') {
          p.expires_at = params[0];
          cnt += 1;
        }
      });
      return { rows: [], rowCount: cnt };
    }

    if (q === 'DELETE FROM user_plans WHERE user_id = $1') {
      const before = tables.user_plans.length;
      tables.user_plans = tables.user_plans.filter((p) => p.user_id !== params[0]);
      return { rows: [], rowCount: before - tables.user_plans.length };
    }

    if (q.startsWith('INSERT INTO plan_purchase_orders (')) {
      const [id, user_id, package_id, amount_vnd, transfer_code, target_id, created_at, expires_at] = params;
      tables.plan_purchase_orders.push({
        id, user_id, package_id, amount_vnd, transfer_code, target_id,
        status: 'pending', created_at, expires_at, confirmed_at: null
      });
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('SELECT * FROM plan_purchase_orders WHERE id = $1 AND user_id = $2')) {
      const rows = tables.plan_purchase_orders.filter((o) => o.id === params[0] && o.user_id === params[1]);
      return { rows, rowCount: rows.length };
    }

    if (q === "UPDATE plan_purchase_orders SET status = 'expired' WHERE id = $1") {
      tables.plan_purchase_orders.forEach((o) => {
        if (o.id === params[0]) o.status = 'expired';
      });
      return { rows: [], rowCount: 1 };
    }

    if (q === "UPDATE plan_purchase_orders SET status = 'confirmed', confirmed_at = $1 WHERE id = $2") {
      tables.plan_purchase_orders.forEach((o) => {
        if (o.id === params[1]) {
          o.status = 'confirmed';
          o.confirmed_at = params[0];
        }
      });
      return { rows: [], rowCount: 1 };
    }

    if (q === "UPDATE plan_purchase_orders SET status = 'cancelled' WHERE user_id = $1 AND status = 'pending'") {
      tables.plan_purchase_orders.forEach((o) => {
        if (o.user_id === params[0] && o.status === 'pending') o.status = 'cancelled';
      });
      return { rows: [], rowCount: 1 };
    }

    // NOTIFICATIONS, REPORTS, CONTACTS
    if (q.startsWith('INSERT INTO notifications (')) {
      const [id, user_id, title, time_label, unread, href, created_at] = params;
      if (q.includes('ON CONFLICT (id) DO NOTHING') && tables.notifications.some((n) => n.id === id)) {
        return { rows: [], rowCount: 0 };
      }
      tables.notifications.push({ id, user_id, title, time_label, unread: Boolean(unread), href, created_at });
      return { rows: [], rowCount: 1 };
    }

    if (q === 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC') {
      const rows = tables.notifications.filter((n) => n.user_id === params[0]).sort((a, b) => Number(b.created_at) - Number(a.created_at));
      return { rows, rowCount: rows.length };
    }

    if (q === 'UPDATE notifications SET unread = FALSE WHERE user_id = $1') {
      tables.notifications.forEach((n) => {
        if (n.user_id === params[0]) n.unread = false;
      });
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('INSERT INTO reports (')) {
      const [id, user_id, target_title, room_id, reason, description, reporter_contact, status, created_at] = params;
      tables.reports.push({ id, user_id, target_title, room_id, reason, description, reporter_contact, status, created_at });
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('SELECT * FROM reports ORDER BY created_at DESC')) {
      const rows = [...tables.reports].sort((a, b) => Number(b.created_at) - Number(a.created_at)).slice(0, 50);
      return { rows, rowCount: rows.length };
    }

    if (q.startsWith('INSERT INTO contacts (')) {
      const [id, ticket_id, user_id, name, email, phone, topic, city, district, university, message, status, created_at] = params;
      tables.contacts.push({ id, ticket_id, user_id, name, email, phone, topic, city, district, university, message, status, created_at });
      return { rows: [], rowCount: 1 };
    }

    if (q.startsWith('SELECT * FROM contacts ORDER BY created_at DESC')) {
      const rows = [...tables.contacts].sort((a, b) => Number(b.created_at) - Number(a.created_at)).slice(0, 50);
      return { rows, rowCount: rows.length };
    }

    throw new Error(`MockPgPool: Unsupported SQL query: ${q}`);
  }

  return {
    async query(sql, params = []) {
      return execQuery(sql, params);
    },
    async connect() {
      let snapshot = null;
      return {
        async query(sql, params = []) {
          const upper = norm(sql).toUpperCase();
          if (upper === 'BEGIN') {
            snapshot = JSON.parse(JSON.stringify(tables));
            return { rows: [], rowCount: 0 };
          }
          if (upper === 'COMMIT') {
            snapshot = null;
            return { rows: [], rowCount: 0 };
          }
          if (upper === 'ROLLBACK') {
            if (snapshot) tables = snapshot;
            snapshot = null;
            return { rows: [], rowCount: 0 };
          }
          return execQuery(sql, params);
        },
        release() {}
      };
    },
    async end() {}
  };
}

module.exports = { createMockPgPool };
