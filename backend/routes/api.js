/**
 * Roomie Match - REST API Router (Shared between local server.js & Vercel Serverless)
 */

const { getVietQrConfig, isDemoLoginEnabled } = require('../config');
const { createVietQr } = require('../services/vietqr');
const { QUIZ_QUESTIONS, PRICING_PACKAGES } = require('../database/seed-data');
const db = require('../database/db');

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB
const COOKIE_NAME = 'roomie_token';

function sendJSON(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Cookie, Authorization',
    ...extraHeaders
  });
  res.end(body);
}

function parseCookies(req) {
  const raw = String(req?.headers?.cookie || '');
  const map = {};
  if (!raw) return map;
  raw.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx <= 0) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      map[key] = decodeURIComponent(val);
    } catch {
      map[key] = val;
    }
  });
  return map;
}

function isHttpsRequest(req) {
  const proto = String(req?.headers?.['x-forwarded-proto'] || '').toLowerCase();
  return proto === 'https' || Boolean(req?.socket?.encrypted);
}

function buildSessionCookieHeader(req, token, maxAgeSeconds = 30 * 24 * 3600) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`
  ];
  if (isHttpsRequest(req)) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function extractToken(req) {
  const authHeader = String(req?.headers?.authorization || '');
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req);
  return cookies[COOKIE_NAME] || null;
}

async function resolveRequestAuth(req) {
  const token = extractToken(req);
  if (!token) return { token: null, user: null };
  const user = await db.getUserByToken(token);
  return { token, user };
}

async function readJsonBody(req) {
  if (req && req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    const text = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    return text.trim() ? JSON.parse(text) : {};
  }

  return new Promise((resolve, reject) => {
    let totalBytes = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        const err = new Error('Kích thước dữ liệu vượt quá giới hạn 1MB.');
        err.statusCode = 413;
        reject(err);
        req.destroy?.();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        const err = new Error('Body JSON không hợp lệ.');
        err.statusCode = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function normalizeApiUrl(req) {
  const host = req?.headers?.host || 'localhost';
  const reqUrl = new URL(req?.url || '/', `http://${host}`);
  const rewriteRoute = reqUrl.searchParams.get('__route');
  let pathname = rewriteRoute ? String(rewriteRoute) : decodeURIComponent(reqUrl.pathname);

  if (rewriteRoute) {
    reqUrl.searchParams.delete('__route');
  }
  if (pathname === '/roomie/api') {
    pathname = '/api';
  } else if (pathname.startsWith('/roomie/api/')) {
    pathname = pathname.slice('/roomie'.length);
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return { pathname, searchParams: reqUrl.searchParams };
}

function requireAuth(res, auth) {
  if (!auth.user) {
    sendJSON(res, 401, {
      ok: false,
      code: 'AUTH_REQUIRED',
      error: 'Vui lòng đăng nhập để sử dụng tính năng này.'
    });
    return false;
  }
  return true;
}

function requireAdmin(res, auth) {
  if (!requireAuth(res, auth)) return false;
  if (auth.user.role !== 'admin') {
    sendJSON(res, 403, {
      ok: false,
      code: 'FORBIDDEN',
      error: 'Bạn không có quyền truy cập dữ liệu quản trị.'
    });
    return false;
  }
  return true;
}

async function handleApiRequest(req, res) {
  const { pathname, searchParams } = normalizeApiUrl(req);
  if (!pathname.startsWith('/api')) {
    return false;
  }

  const method = String(req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Cache-Control': 'no-store'
    });
    res.end();
    return true;
  }

  let body = {};
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      body = await readJsonBody(req);
    } catch (err) {
      sendJSON(res, err.statusCode || 400, {
        ok: false,
        error: err.message || 'Dữ liệu gửi lên không hợp lệ.'
      });
      return true;
    }
  }

  try {
    // 1. Health Check
    if (pathname === '/api/health' && method === 'GET') {
      const stats = await db.getDatabaseStats();
      sendJSON(res, 200, { ok: true, service: 'roomie-api', stats });
      return true;
    }

    const auth = await resolveRequestAuth(req);
    const vietqrCfg = getVietQrConfig();
    const paymentConfigured = Boolean(vietqrCfg.bankBin && vietqrCfg.accountNumber);

    // 2. Application Bootstrap
    if (pathname === '/api/bootstrap' && method === 'GET') {
      const userId = auth.user?.id || null;
      const bootstrap = await db.getBootstrapData(userId);
      const quizResult = bootstrap.quiz
        ? {
            ...bootstrap.quiz.result,
            locked: !bootstrap.entitlements.unlockedPrediction
          }
        : null;

      sendJSON(res, 200, {
        ok: true,
        authenticated: Boolean(auth.user),
        user: auth.user,
        demoLoginEnabled: isDemoLoginEnabled(),
        demoAccounts: db.getDemoAccounts(),
        rooms: bootstrap.rooms,
        roommates: bootstrap.roommates,
        savedRoomIds: bootstrap.savedRoomIds,
        connections: bootstrap.connections,
        quizAnswers: bootstrap.quiz?.answers || null,
        quizResult,
        unlockedPrediction: bootstrap.entitlements.unlockedPrediction,
        entitlements: bootstrap.entitlements,
        plans: bootstrap.plans,
        postQuota: bootstrap.postQuota,
        notifications: bootstrap.notifications,
        quizQuestions: QUIZ_QUESTIONS,
        pricingPackages: PRICING_PACKAGES,
        paymentConfigured
      });
      return true;
    }

    // 3. Authentication
    if (pathname === '/api/auth/me' && method === 'GET') {
      sendJSON(res, 200, {
        ok: true,
        authenticated: Boolean(auth.user),
        user: auth.user
      });
      return true;
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const result = await db.loginUser(body.identifier || body.email, body.password);
      if (!result.ok) {
        sendJSON(res, 401, result);
        return true;
      }
      sendJSON(
        res,
        200,
        { ok: true, user: result.user },
        { 'Set-Cookie': buildSessionCookieHeader(req, result.token) }
      );
      return true;
    }

    if (pathname === '/api/auth/demo-login' && method === 'POST') {
      const result = await db.loginDemoAccount(body.account || body.id);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      sendJSON(
        res,
        200,
        { ok: true, user: result.user },
        { 'Set-Cookie': buildSessionCookieHeader(req, result.token) }
      );
      return true;
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
      const result = await db.registerUser(body);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      sendJSON(
        res,
        201,
        { ok: true, user: result.user },
        { 'Set-Cookie': buildSessionCookieHeader(req, result.token) }
      );
      return true;
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      await db.logoutSession(auth.token);
      sendJSON(res, 200, { ok: true }, { 'Set-Cookie': buildSessionCookieHeader(req, '', 0) });
      return true;
    }

    // 4. Rooms & Saved Rooms
    if (pathname === '/api/rooms' && method === 'GET') {
      const rooms = await db.getAllRooms({ userId: auth.user?.id || null });
      sendJSON(res, 200, { ok: true, rooms });
      return true;
    }

    if (pathname === '/api/rooms' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.createRoom(body, auth.user);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      sendJSON(res, 201, {
        ok: true,
        room: result.room,
        rooms: await db.getAllRooms({ userId: auth.user.id })
      });
      return true;
    }

    const roomSaveMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/save$/);
    if (roomSaveMatch && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const roomId = decodeURIComponent(roomSaveMatch[1]);
      const result = await db.toggleSavedRoom(auth.user.id, roomId);
      sendJSON(res, 200, result);
      return true;
    }

    if (pathname === '/api/saved-rooms' && method === 'GET') {
      if (!requireAuth(res, auth)) return true;
      sendJSON(res, 200, { ok: true, savedRoomIds: await db.getSavedRoomIds(auth.user.id) });
      return true;
    }

    if (pathname === '/api/saved-rooms/toggle' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      if (!body.roomId) {
        sendJSON(res, 400, { ok: false, error: 'Thiếu roomId.' });
        return true;
      }
      sendJSON(res, 200, await db.toggleSavedRoom(auth.user.id, body.roomId));
      return true;
    }

    const roomPingMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/ping$/);
    if (roomPingMatch && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const roomId = decodeURIComponent(roomPingMatch[1]);
      const result = await db.pingRoomAvailability(roomId, body.status || 'active', auth.user);
      sendJSON(res, result.ok ? 200 : result.statusCode || 400, result);
      return true;
    }

    const roomItemMatch = pathname.match(/^\/api\/rooms\/([^/]+)$/);
    if (roomItemMatch && method === 'GET') {
      const roomId = decodeURIComponent(roomItemMatch[1]);
      const room = await db.getRoomById(roomId, { userId: auth.user?.id || null });
      if (!room) {
        sendJSON(res, 404, { ok: false, error: 'Không tìm thấy phòng trọ.' });
        return true;
      }
      sendJSON(res, 200, { ok: true, room });
      return true;
    }

    if (roomItemMatch && method === 'DELETE') {
      if (!requireAuth(res, auth)) return true;
      const roomId = decodeURIComponent(roomItemMatch[1]);
      const result = await db.deleteRoom(roomId, auth.user);
      sendJSON(res, result.ok ? 200 : result.statusCode || 400, result);
      return true;
    }

    // 5. Roommates, Quota & Boost
    if (pathname === '/api/roommates/quota' && method === 'GET') {
      if (!requireAuth(res, auth)) return true;
      sendJSON(res, 200, { ok: true, quota: await db.getRoommatePostQuotaStatus(auth.user.id) });
      return true;
    }

    if (pathname === '/api/roommates' && method === 'GET') {
      const mineOnly = searchParams.get('mine') === '1';
      if (mineOnly && !requireAuth(res, auth)) return true;
      const list = await db.getAllRoommates(auth.user?.id || null);
      sendJSON(res, 200, {
        ok: true,
        roommates: mineOnly ? list.filter((r) => String(r.userId) === String(auth.user.id)) : list
      });
      return true;
    }

    if (pathname === '/api/roommates' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.createRoommateListing(auth.user, body);
      if (!result.ok) {
        sendJSON(res, result.code === 'daily_limit' ? 429 : 400, result);
        return true;
      }
      sendJSON(res, 201, {
        ...result,
        roommates: await db.getAllRoommates(auth.user.id)
      });
      return true;
    }

    const boostMatch = pathname.match(/^\/api\/roommates\/([^/]+)\/boost$/);
    if (boostMatch && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const targetId = decodeURIComponent(boostMatch[1]);
      const result = await db.boostRoommateListing(auth.user.id, targetId, body.period);
      sendJSON(res, result.ok ? 200 : 400, result);
      return true;
    }

    const rmItemMatch = pathname.match(/^\/api\/roommates\/([^/]+)$/);
    if (rmItemMatch && method === 'GET') {
      const rmId = decodeURIComponent(rmItemMatch[1]);
      const rm = await db.getRoommateById(rmId, auth.user?.id || null);
      if (!rm) {
        sendJSON(res, 404, { ok: false, error: 'Không tìm thấy hồ sơ roommate.' });
        return true;
      }
      sendJSON(res, 200, { ok: true, roommate: rm });
      return true;
    }

    if (rmItemMatch && method === 'DELETE') {
      if (!requireAuth(res, auth)) return true;
      const rmId = decodeURIComponent(rmItemMatch[1]);
      const deleted = await db.deleteRoommateListing(auth.user, rmId);
      if (!deleted) {
        sendJSON(res, 404, { ok: false, error: 'Không tìm thấy bài đăng của bạn để xóa.' });
        return true;
      }
      const [roommates, quota] = await Promise.all([
        db.getAllRoommates(auth.user.id),
        db.getRoommatePostQuotaStatus(auth.user.id)
      ]);
      sendJSON(res, 200, {
        ok: true,
        roommates,
        quota
      });
      return true;
    }

    // 6. Quiz & Gói 4/5 Locked Predictions
    if (pathname === '/api/quiz' && method === 'GET') {
      if (!requireAuth(res, auth)) return true;
      const [quiz, unlocked] = await Promise.all([
        db.getQuizSubmission(auth.user.id),
        db.hasUnlockedPrediction(auth.user.id)
      ]);
      sendJSON(res, 200, {
        ok: true,
        quiz: quiz ? { ...quiz, result: { ...quiz.result, locked: !unlocked } } : null,
        unlockedPrediction: unlocked
      });
      return true;
    }

    if (pathname === '/api/quiz' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.saveQuizSubmission(auth.user.id, body.answers || {}, body.result || null);
      if (!result.ok) {
        sendJSON(res, result.code === 'daily_match_limit' ? 429 : 400, result);
        return true;
      }
      sendJSON(res, 200, {
        ...result,
        roommates: await db.getAllRoommates(auth.user.id, {
          unlockedPrediction: result.unlockedPrediction,
          quiz: { answers: result.answers, result: result.result }
        })
      });
      return true;
    }

    if (pathname === '/api/quiz/predictions' && method === 'GET') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.getQuizPredictions(auth.user.id);
      sendJSON(res, result.ok ? 200 : result.statusCode || 400, result);
      return true;
    }

    // 7. Double Opt-in Connections
    if (pathname === '/api/connections' && method === 'GET') {
      if (!requireAuth(res, auth)) return true;
      const connections = await db.getConnections(auth.user.id);
      sendJSON(res, 200, {
        ok: true,
        connections,
        activeCount: connections.filter((c) => c.status === 'pending' || c.status === 'accepted').length
      });
      return true;
    }

    if (pathname === '/api/connections' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.upsertConnection(
        auth.user.id,
        body.target || body,
        body.status || 'pending',
        body
      );
      if (!result.ok) {
        sendJSON(res, result.code === 'SLOTS_FULL' ? 409 : 400, result);
        return true;
      }
      sendJSON(res, 200, result);
      return true;
    }

    const connStatusMatch = pathname.match(/^\/api\/connections\/([^/]+)(?:\/status)?$/);
    if (connStatusMatch && (method === 'PATCH' || method === 'POST')) {
      if (!requireAuth(res, auth)) return true;
      const connId = decodeURIComponent(connStatusMatch[1]);
      const result = await db.updateConnectionStatusById(auth.user.id, connId, body.status, body);
      if (!result.ok) {
        sendJSON(res, result.code === 'SLOTS_FULL' ? 409 : 400, result);
        return true;
      }
      sendJSON(res, 200, result);
      return true;
    }

    // 8. Pricing Plans & VietQR Checkout
    if (pathname === '/api/plans' && method === 'GET') {
      const activePlans = auth.user ? await db.getUserPlans(auth.user.id) : [];
      sendJSON(res, 200, {
        ok: true,
        packages: PRICING_PACKAGES,
        activePlans,
        entitlements: db.buildPlanEntitlements(activePlans),
        paymentConfigured
      });
      return true;
    }

    if (pathname === '/api/plans/checkout' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.createPlanOrder(auth.user.id, body);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      const payment = await createVietQr(result.order.amountVnd, result.order.transferCode);
      sendJSON(res, 201, { ok: true, order: result.order, payment });
      return true;
    }

    if (pathname === '/api/plans/confirm' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      const result = await db.confirmPlanOrder(auth.user.id, body.orderId);
      if (!result.ok) {
        sendJSON(res, 400, result);
        return true;
      }
      sendJSON(res, 200, result);
      return true;
    }

    if (pathname === '/api/plans/reset' && method === 'POST') {
      if (!requireAuth(res, auth)) return true;
      if (!isDemoLoginEnabled() && auth.user.role !== 'admin') {
        sendJSON(res, 403, { ok: false, error: 'Chức năng đặt lại gói chỉ bật ở chế độ demo.' });
        return true;
      }
      sendJSON(res, 200, await db.resetUserPlans(auth.user.id));
      return true;
    }

    // 9. Notifications, Reports & Contacts
    if (pathname === '/api/notifications' && method === 'GET') {
      if (!requireAuth(res, auth)) return true;
      sendJSON(res, 200, { ok: true, notifications: await db.getNotifications(auth.user.id) });
      return true;
    }

    if (
      (pathname === '/api/notifications/read-all' || pathname === '/api/notifications/read') &&
      method === 'POST'
    ) {
      if (!requireAuth(res, auth)) return true;
      sendJSON(res, 200, { ok: true, notifications: await db.markAllNotificationsRead(auth.user.id) });
      return true;
    }

    if (pathname === '/api/reports' && method === 'GET') {
      if (!requireAdmin(res, auth)) return true;
      sendJSON(res, 200, { ok: true, reports: await db.getReports() });
      return true;
    }

    if (pathname === '/api/reports' && method === 'POST') {
      const result = await db.createReport(body, auth.user?.id || null);
      sendJSON(res, 201, result);
      return true;
    }

    if (pathname === '/api/contacts' && method === 'GET') {
      if (!requireAdmin(res, auth)) return true;
      sendJSON(res, 200, { ok: true, tickets: await db.getContactTickets() });
      return true;
    }

    if (pathname === '/api/contacts' && method === 'POST') {
      const result = await db.createContactTicket(body, auth.user?.id || null);
      sendJSON(res, result.ok ? 201 : 400, result);
      return true;
    }

    sendJSON(res, 404, {
      ok: false,
      error: `API endpoint không tồn tại: ${method} ${pathname}`
    });
    return true;
  } catch (err) {
    console.error('[Roomie API Error]', err);
    const statusCode = err?.code === 'MISSING_DATABASE_URL' ? 503 : 500;
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    sendJSON(res, statusCode, {
      ok: false,
      error:
        err?.code === 'MISSING_DATABASE_URL'
          ? err.message
          : 'Lỗi máy chủ nội bộ (Internal Server Error)',
      ...(isProduction ? {} : { detail: err.message })
    });
    return true;
  }
}

module.exports = {
  handleApiRequest,
  normalizeApiUrl
};
