/**
 * Roomie Match - RESTful Backend API Router
 * Xử lý toàn bộ API endpoints dưới /api/* (và /roomie/api/*).
 */

const db = require('../database/db');
const { PRICING_PACKAGES } = require('../database/seed-data');

const MAX_BODY_BYTES = 12 * 1024 * 1024; // 12MB to support Base64 room cover images

function sendJSON(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    ...extraHeaders
  });
  res.end(body);
}

function parseCookies(cookieHeader = '') {
  const out = {};
  String(cookieHeader)
    .split(';')
    .forEach((part) => {
      const idx = part.indexOf('=');
      if (idx > 0) {
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        out[k] = decodeURIComponent(v);
      }
    });
  return out;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      resolve({});
      return;
    }
    // If Vercel / Express already parsed req.body
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    let raw = '';
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      raw += chunk.toString('utf8');
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function resolveRequestAuth(req, reqUrl, body = {}) {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const cookies = parseCookies(req.headers.cookie || '');
  const token = bearerToken || cookies.rm_token || '';

  let user = token ? db.getUserByToken(token) : null;
  const explicitUserId =
    req.headers['x-user-id'] ||
    reqUrl.searchParams.get('userId') ||
    (body && body.userId) ||
    '';

  if (!user && explicitUserId) {
    if (explicitUserId === 'guest') {
      return { token: '', user: null, userId: null };
    }
    user = db.getUserById(explicitUserId);
  }

  if (!user && explicitUserId !== 'guest') {
    user = db.getUserById(db.DEFAULT_USER_ID);
  }

  return {
    token,
    user,
    userId: user ? user.id : db.DEFAULT_USER_ID
  };
}

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[.\-–—_/(),·]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function handleApiRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendJSON(res, 200, { ok: true });
    return true;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname.startsWith('/roomie/api')) {
    pathname = pathname.slice('/roomie'.length);
  }
  if (!pathname.startsWith('/api')) {
    return false;
  }

  // Strip trailing slash except root /api
  if (pathname.length > 4 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  let body = {};
  try {
    body = await readJsonBody(req);
  } catch (err) {
    const status = err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
    sendJSON(res, status, {
      ok: false,
      error: err.message === 'PAYLOAD_TOO_LARGE' ? 'Dữ liệu tải lên vượt quá 12MB.' : 'JSON không hợp lệ.'
    });
    return true;
  }

  const auth = resolveRequestAuth(req, reqUrl, body);
  const method = req.method.toUpperCase();

  try {
    // 1. Health & Database Stats
    if ((pathname === '/api' || pathname === '/api/health' || pathname === '/api/stats') && method === 'GET') {
      const stats = db.getDatabaseStats();
      sendJSON(res, 200, {
        ok: true,
        service: 'Roomie Match Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: stats
      });
      return true;
    }

    // 2. Full Frontend Bootstrap Endpoint
    if (pathname === '/api/bootstrap' && method === 'GET') {
      const uid = auth.userId || db.DEFAULT_USER_ID;
      const requestedUserId = req.headers['x-user-id'] || reqUrl.searchParams.get('userId') || '';
      const quiz =
        auth.user && (!requestedUserId || requestedUserId === auth.user.id)
          ? db.getQuizSubmission(uid)
          : null;
      const connections = db.getConnections(uid);
      const activeSlots = connections.filter((c) => c.status === 'pending' || c.status === 'accepted').length;

      sendJSON(res, 200, {
        ok: true,
        user: auth.user,
        users: db.getAllUsers(),
        rooms: db.getAllRooms(),
        roommates: db.getAllRoommates(uid),
        savedRoomIds: db.getSavedRoomIds(uid),
        connections,
        slots: {
          active: activeSlots,
          max: db.MAX_CONTACT_SLOTS
        },
        activePlans: db.getUserPlans(uid),
        quizAnswers: quiz?.answers || null,
        quizResult: quiz?.result || null,
        notifications: db.getNotifications(uid),
        pricingPackages: PRICING_PACKAGES
      });
      return true;
    }

    // 3. Authentication Routes
    if (pathname === '/api/auth/login' && method === 'POST') {
      const identifier = body.identifier || body.email || '';
      const password = body.password || '';
      const result = db.loginUser(identifier, password);
      if (!result.ok) {
        sendJSON(res, 401, result);
        return true;
      }
      sendJSON(
        res,
        200,
        {
          ok: true,
          user: result.user,
          token: result.token
        },
        {
          'Set-Cookie': `rm_token=${encodeURIComponent(result.token)}; Path=/; Max-Age=${30 * 24 * 3600}; SameSite=Lax`
        }
      );
      return true;
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
      const result = db.registerUser(body);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      sendJSON(
        res,
        201,
        {
          ok: true,
          user: result.user,
          token: result.token
        },
        {
          'Set-Cookie': `rm_token=${encodeURIComponent(result.token)}; Path=/; Max-Age=${30 * 24 * 3600}; SameSite=Lax`
        }
      );
      return true;
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      if (auth.token) db.logoutSession(auth.token);
      sendJSON(
        res,
        200,
        { ok: true },
        {
          'Set-Cookie': 'rm_token=; Path=/; Max-Age=0; SameSite=Lax'
        }
      );
      return true;
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        loggedIn: Boolean(auth.user),
        user: auth.user
      });
      return true;
    }

    // 4. Rooms & Listings Routes
    if (pathname === '/api/rooms' && method === 'GET') {
      let list = db.getAllRooms();
      const city = reqUrl.searchParams.get('city');
      const area = reqUrl.searchParams.get('area');
      const type = reqUrl.searchParams.get('type');
      const q = normalizeSearch(reqUrl.searchParams.get('q'));
      const minPrice = Number(reqUrl.searchParams.get('minPrice')) || 0;
      const maxPrice = Number(reqUrl.searchParams.get('maxPrice')) || 0;
      const savedOnly = reqUrl.searchParams.get('savedOnly') === '1' || reqUrl.searchParams.get('saved') === '1';
      const sort = reqUrl.searchParams.get('sort') || 'newest';

      if (savedOnly) {
        const savedSet = new Set(db.getSavedRoomIds(auth.userId));
        list = list.filter((r) => savedSet.has(String(r.id)));
      }
      if (city) {
        list = list.filter((r) => (r.city || 'TP.HCM').toLowerCase() === city.toLowerCase());
      }
      if (area) {
        const areaKeys = area.split(',').map((s) => s.trim()).filter(Boolean);
        if (areaKeys.length) list = list.filter((r) => areaKeys.includes(r.areaKey));
      }
      if (type && type !== 'all') {
        list = list.filter((r) => r.typeKey === type);
      }
      if (minPrice > 0) {
        list = list.filter((r) => r.price >= minPrice);
      }
      if (maxPrice > 0) {
        list = list.filter((r) => r.price <= maxPrice);
      }
      if (q) {
        list = list.filter((r) => {
          const hay = normalizeSearch(
            `${r.title} ${r.shortTitle} ${r.address} ${r.districtLabel} ${r.distanceLabel} ${(r.description || []).join(' ')}`
          );
          return q.split(' ').every((tok) => hay.includes(tok));
        });
      }
      if (sort === 'price-asc') {
        list = [...list].sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        list = [...list].sort((a, b) => b.price - a.price);
      }

      sendJSON(res, 200, {
        ok: true,
        total: list.length,
        rooms: list
      });
      return true;
    }

    if (pathname === '/api/rooms' && method === 'POST') {
      if (!auth.user || auth.user.role !== 'student') {
        sendJSON(res, 403, {
          ok: false,
          error: 'Chỉ tài khoản sinh viên mới được đăng tin trên Roomie.'
        });
        return true;
      }
      if (!body.address || !body.price) {
        sendJSON(res, 400, {
          ok: false,
          error: 'Vui lòng nhập đầy đủ địa chỉ và tiền phòng hợp lệ.'
        });
        return true;
      }
      const created = db.createRoom(body, auth.user);
      sendJSON(res, 201, {
        ok: true,
        room: created,
        rooms: db.getAllRooms()
      });
      return true;
    }

    const roomSaveMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/save$/);
    if (roomSaveMatch && method === 'POST') {
      const roomId = roomSaveMatch[1];
      const result = db.toggleSavedRoom(auth.userId, roomId);
      sendJSON(res, 200, {
        ok: true,
        roomId,
        ...result
      });
      return true;
    }

    const roomPingMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/ping$/);
    if (roomPingMatch && (method === 'POST' || method === 'PATCH')) {
      const roomId = roomPingMatch[1];
      const updated = db.pingRoomAvailability(roomId, body.status || 'active');
      if (!updated) {
        sendJSON(res, 404, { ok: false, error: 'Không tìm thấy phòng trọ.' });
        return true;
      }
      sendJSON(res, 200, { ok: true, room: updated });
      return true;
    }

    const roomDetailMatch = pathname.match(/^\/api\/rooms\/([^/]+)$/);
    if (roomDetailMatch) {
      const roomId = roomDetailMatch[1];
      if (method === 'GET') {
        const room = db.getRoomById(roomId);
        if (!room) {
          sendJSON(res, 404, { ok: false, error: 'Không tìm thấy phòng trọ.' });
          return true;
        }
        sendJSON(res, 200, { ok: true, room });
        return true;
      }
      if (method === 'DELETE') {
        db.deleteRoom(roomId);
        sendJSON(res, 200, { ok: true, roomId });
        return true;
      }
    }

    // 5. Saved Rooms List
    if (pathname === '/api/saved-rooms' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        savedRoomIds: db.getSavedRoomIds(auth.userId)
      });
      return true;
    }

    // 6. Roommates & Compatibility Matching Routes
    if (pathname === '/api/roommates' && method === 'POST') {
      if (!auth.user || auth.user.role !== 'student') {
        sendJSON(res, 403, {
          ok: false,
          error: 'Chỉ tài khoản sinh viên mới được đăng tin tìm roommate.'
        });
        return true;
      }

      const roommate = db.createRoommateListing(auth.user, body);
      if (!roommate) {
        sendJSON(res, 400, {
          ok: false,
          error: 'Vui lòng kiểm tra loại tin, khu vực và ngân sách trước khi đăng.'
        });
        return true;
      }

      sendJSON(res, 201, {
        ok: true,
        roommate,
        roommates: db.getAllRoommates(auth.userId)
      });
      return true;
    }

    if (pathname === '/api/roommates' && method === 'GET') {
      let list = db.getAllRoommates(auth.userId);
      const gender = reqUrl.searchParams.get('gender');
      const area = reqUrl.searchParams.get('area');
      const tab = reqUrl.searchParams.get('tab');
      const q = normalizeSearch(reqUrl.searchParams.get('q'));

      if (gender && gender !== 'all') {
        list = list.filter((rm) => rm.gender === gender);
      }
      if (area) {
        const areaKeys = area.split(',').map((s) => s.trim()).filter(Boolean);
        if (areaKeys.length) list = list.filter((rm) => areaKeys.includes(rm.areaKey));
      }
      if (tab === 'high') {
        list = list.filter((rm) => rm.matchScore >= 90);
      } else if (tab === 'vnu') {
        list = list.filter((rm) => rm.vnuMember);
      } else if (tab === 'has-room') {
        list = list.filter((rm) => rm.hasRoom);
      }
      if (q) {
        list = list.filter((rm) => {
          const hay = normalizeSearch(
            `${rm.name} ${rm.school} ${rm.major} ${rm.roomStatusDetail} ${(rm.tags || []).join(' ')} ${(rm.criteria || []).join(' ')}`
          );
          return q.split(' ').every((tok) => hay.includes(tok));
        });
      }

      sendJSON(res, 200, {
        ok: true,
        total: list.length,
        roommates: list
      });
      return true;
    }

    const roommateDetailMatch = pathname.match(/^\/api\/roommates\/([^/]+)$/);
    if (roommateDetailMatch && method === 'GET') {
      const rm = db.getRoommateById(roommateDetailMatch[1], auth.userId);
      if (!rm) {
        sendJSON(res, 404, { ok: false, error: 'Không tìm thấy hồ sơ roommate.' });
        return true;
      }
      sendJSON(res, 200, { ok: true, roommate: rm });
      return true;
    }

    // 7. Personality Quiz Submission & Evaluation
    if ((pathname === '/api/quiz' || pathname === '/api/quiz/me') && method === 'GET') {
      const quiz = db.getQuizSubmission(auth.userId);
      sendJSON(res, 200, {
        ok: true,
        quizAnswers: quiz?.answers || {},
        quizResult: quiz?.result || null
      });
      return true;
    }

    if ((pathname === '/api/quiz' || pathname === '/api/quiz/submit') && method === 'POST') {
      const answers = body.answers || body.quizAnswers || {};
      const explicitResult = body.result || body.quizResult || null;
      const savedQuiz = db.saveQuizSubmission(auth.userId, answers, explicitResult);
      sendJSON(res, 200, {
        ok: true,
        quizAnswers: savedQuiz.answers,
        quizResult: savedQuiz.result,
        roommates: db.getAllRoommates(auth.userId)
      });
      return true;
    }

    // 8. Double Opt-in Connections & Active Slot Management (Max 3 Slots)
    if (pathname === '/api/connections' && method === 'GET') {
      const connections = db.getConnections(auth.userId);
      const activeSlots = connections.filter((c) => c.status === 'pending' || c.status === 'accepted').length;
      sendJSON(res, 200, {
        ok: true,
        connections,
        slots: {
          active: activeSlots,
          max: db.MAX_CONTACT_SLOTS
        }
      });
      return true;
    }

    if ((pathname === '/api/connections' || pathname === '/api/connections/invite') && method === 'POST') {
      const status = body.status || 'pending';
      const result = db.upsertConnection(auth.userId, body, status, {
        note: body.note,
        releaseReason: body.releaseReason,
        revertedOnce: body.revertedOnce
      });
      if (!result.ok) {
        sendJSON(res, 409, result);
        return true;
      }
      sendJSON(res, 200, result);
      return true;
    }

    const connUpdateMatch = pathname.match(/^\/api\/connections\/([^/]+)$/);
    if (connUpdateMatch && (method === 'PATCH' || method === 'PUT' || method === 'POST')) {
      const connId = decodeURIComponent(connUpdateMatch[1]);
      const nextStatus = body.status || 'accepted';
      const result = db.updateConnectionStatusById(auth.userId, connId, nextStatus, {
        releaseReason: body.releaseReason,
        revertedOnce: body.revertedOnce
      });
      if (!result.ok) {
        sendJSON(res, result.code === 'SLOTS_FULL' ? 409 : 404, result);
        return true;
      }
      sendJSON(res, 200, result);
      return true;
    }

    // 9. Pricing Plans & VietQR Subscriptions
    if (pathname === '/api/plans' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        packages: PRICING_PACKAGES,
        activePlans: db.getUserPlans(auth.userId)
      });
      return true;
    }

    if ((pathname === '/api/plans' || pathname === '/api/plans/purchase') && method === 'POST') {
      const result = db.purchasePlan(auth.userId, body);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      sendJSON(res, 200, result);
      return true;
    }

    if (pathname === '/api/plans/reset' && (method === 'POST' || method === 'DELETE')) {
      const result = db.resetUserPlans(auth.userId);
      sendJSON(res, 200, result);
      return true;
    }

    // 10. Notifications
    if (pathname === '/api/notifications' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        notifications: db.getNotifications(auth.userId)
      });
      return true;
    }

    if (pathname === '/api/notifications/read-all' && method === 'POST') {
      const notifications = db.markAllNotificationsRead(auth.userId);
      sendJSON(res, 200, {
        ok: true,
        notifications
      });
      return true;
    }

    // 11. Trust & Safety Reports (Báo cáo tin giả / phòng ma / lừa cọc)
    if (pathname === '/api/reports' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        reports: db.getReports()
      });
      return true;
    }

    if (pathname === '/api/reports' && method === 'POST') {
      const result = db.createReport(body, auth.user?.id || null);
      sendJSON(res, 201, result);
      return true;
    }

    // 12. Contact & Support Callback Tickets
    if (pathname === '/api/contacts' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        tickets: db.getContactTickets()
      });
      return true;
    }

    if (pathname === '/api/contacts' && method === 'POST') {
      const result = db.createContactTicket(body, auth.user?.id || null);
      sendJSON(res, 201, result);
      return true;
    }

    // Fallback 404 for unknown /api/* route
    sendJSON(res, 404, {
      ok: false,
      error: `API endpoint không tồn tại: ${method} ${pathname}`
    });
    return true;
  } catch (err) {
    console.error('[Roomie API Error]', err);
    sendJSON(res, 500, {
      ok: false,
      error: 'Lỗi máy chủ nội bộ (Internal Server Error)',
      detail: err.message
    });
    return true;
  }
}

module.exports = {
  handleApiRequest
};
