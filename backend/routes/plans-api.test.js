const assert = require('node:assert/strict');
const test = require('node:test');

process.env.ROOMIE_VIETQR_BANK_BIN = '970436';
process.env.ROOMIE_VIETQR_BANK_NAME = 'Ngân hàng kiểm thử';
process.env.ROOMIE_VIETQR_ACCOUNT_NUMBER = '1234567890';
process.env.ROOMIE_VIETQR_ACCOUNT_NAME = 'ROOMIE TEST';

const { createMockPgPool } = require('../test-utils/mock-pg-pool');
const db = require('../database/db');
const { handleApiRequest } = require('./api');

db.setPoolForTesting(createMockPgPool());

let testUser;
let authCookie = '';

async function callApi(method, url, body, extraHeaders = {}) {
  const req = {
    method,
    url,
    headers: {
      host: 'localhost',
      ...extraHeaders
    },
    body
  };
  const response = {
    statusCode: 0,
    headers: {},
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(bodyText) {
      this.body = bodyText ? JSON.parse(bodyText) : null;
    }
  };
  await handleApiRequest(req, response);
  return response;
}

test.before(async () => {
  const res = await callApi('POST', '/api/auth/register', {
    name: 'Sinh viên API test',
    email: `roomie-api-${process.pid}@student.hcmus.edu.vn`,
    password: 'testing-pass',
    schoolCode: 'HCMUS',
    gender: 'Nữ'
  });
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.ok, true);
  testUser = res.body.user;
  const rawSetCookie = String(res.headers['Set-Cookie'] || '');
  authCookie = rawSetCookie.split(';')[0];
  assert.ok(authCookie.startsWith('roomie_token='));
});

test('strict auth rejects unauthenticated and spoofed x-user-id requests with 401', async () => {
  const spoofed = await callApi(
    'POST',
    '/api/plans/checkout',
    { packageId: 'extra-posts-day' },
    { 'x-user-id': testUser.id }
  );
  assert.equal(spoofed.statusCode, 401);
  assert.equal(spoofed.body.code, 'AUTH_REQUIRED');

  const unauthReports = await callApi('GET', '/api/reports');
  assert.equal(unauthReports.statusCode, 401);

  const nonAdminReports = await callApi('GET', '/api/reports', null, { cookie: authCookie });
  assert.equal(nonAdminReports.statusCode, 403);
});

test('bootstrap never exposes passwords, quiz scoring profiles, or partner phones publicly', async () => {
  const boot = await callApi('GET', '/api/bootstrap');
  assert.equal(boot.statusCode, 200);
  assert.equal(boot.body.authenticated, false);
  assert.ok(Array.isArray(boot.body.rooms) && boot.body.rooms.length === 9);
  assert.ok(Array.isArray(boot.body.roommates) && boot.body.roommates.length === 8);
  assert.equal(boot.body.rooms[0].roommate.contact, undefined);
  assert.equal(boot.body.roommates[0].contact, undefined);
  assert.equal(boot.body.roommates[0].quizProfile, undefined);
  assert.equal(boot.body.roommates[0].matchScore, null);
});

test('demo quick-login issues HttpOnly session cookie without exposing passwords', async () => {
  const demo = await callApi('POST', '/api/auth/demo-login', { account: 'minhthu' });
  assert.equal(demo.statusCode, 200);
  assert.equal(demo.body.user.id, 'user-minhthu');
  const demoCookie = String(demo.headers['Set-Cookie'] || '').split(';')[0];
  assert.ok(demoCookie.startsWith('roomie_token='));

  const me = await callApi('GET', '/api/auth/me', null, { cookie: demoCookie });
  assert.equal(me.statusCode, 200);
  assert.equal(me.body.authenticated, true);
  assert.equal(me.body.user.id, 'user-minhthu');
});

test('quiz predictions return 403 locked until Plan 4 or Plan 5 is purchased and confirmed', async () => {
  const submit = await callApi(
    'POST',
    '/api/quiz',
    { answers: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' } },
    { cookie: authCookie }
  );
  assert.equal(submit.statusCode, 200);
  assert.equal(submit.body.unlockedPrediction, false);

  const locked = await callApi('GET', '/api/quiz/predictions', null, { cookie: authCookie });
  assert.equal(locked.statusCode, 403);
  assert.equal(locked.body.locked, true);

  const checkout = await callApi(
    'POST',
    '/api/plans/checkout',
    { packageId: 'unlimited-matches-day' },
    { cookie: authCookie }
  );
  assert.equal(checkout.statusCode, 201);
  const confirm = await callApi(
    'POST',
    '/api/plans/confirm',
    { orderId: checkout.body.order.id },
    { cookie: authCookie }
  );
  assert.equal(confirm.statusCode, 200);

  const unlocked = await callApi('GET', '/api/quiz/predictions', null, { cookie: authCookie });
  assert.equal(unlocked.statusCode, 200);
  assert.equal(unlocked.body.locked, false);
  assert.ok(unlocked.body.predictions.length > 0);
});

test('connections hide partner phone/Zalo while pending and reveal only when accepted', async () => {
  const pendingRes = await callApi(
    'POST',
    '/api/connections',
    { target: { partnerId: 'hoang-nam', name: 'Nguyễn Hoàng Nam', roomId: '1' }, status: 'pending' },
    { cookie: authCookie }
  );
  assert.equal(pendingRes.statusCode, 200);
  assert.equal(pendingRes.body.connection.phone, null);

  const acceptRes = await callApi(
    'PATCH',
    `/api/connections/${encodeURIComponent(pendingRes.body.connection.id)}`,
    { status: 'accepted' },
    { cookie: authCookie }
  );
  assert.equal(acceptRes.statusCode, 200);
  assert.ok(acceptRes.body.connection.phone);
  assert.ok(acceptRes.body.connection.zalo);
});

test('checkout returns a local VietQR and does not activate before confirmation', async () => {
  const checkout = await callApi(
    'POST',
    '/api/plans/checkout',
    { packageId: 'extra-posts-day' },
    { cookie: authCookie }
  );

  assert.equal(checkout.statusCode, 201);
  assert.match(checkout.body.payment.qrDataUrl, /^data:image\/png;base64,/);
  assert.equal(checkout.body.order.amountVnd, 49000);

  const confirmation = await callApi(
    'POST',
    '/api/plans/confirm',
    { orderId: checkout.body.order.id },
    { cookie: authCookie }
  );
  assert.equal(confirmation.statusCode, 200);
  assert.ok(confirmation.body.plans.some((p) => p.id === 'extra-posts-day'));
});

test('checkout returns a demo QR when no bank details are configured', async () => {
  const keys = [
    'ROOMIE_VIETQR_BANK_BIN',
    'ROOMIE_VIETQR_BANK_NAME',
    'ROOMIE_VIETQR_ACCOUNT_NUMBER',
    'ROOMIE_VIETQR_ACCOUNT_NAME'
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];

  try {
    const checkout = await callApi(
      'POST',
      '/api/plans/checkout',
      { packageId: 'extra-posts-day' },
      { cookie: authCookie }
    );
    assert.equal(checkout.statusCode, 201);
    assert.equal(checkout.body.payment.isDemo, true);
    assert.match(checkout.body.payment.qrDataUrl, /^data:image\/png;base64,/);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test('boost checkout rejects listings not owned by the purchaser', async () => {
  const result = await callApi(
    'POST',
    '/api/plans/checkout',
    { packageId: 'boost-24h', targetId: 'not-owned' },
    { cookie: authCookie }
  );

  assert.equal(result.statusCode, 400);
  assert.match(result.body.error, /bài đăng của bạn/i);
});

test('bootstrap and mutation responses stay in sync across create, bundle boost, and reset', async () => {
  const createRes = await callApi(
    'POST',
    '/api/roommates',
    {
      postType: 'find-room',
      area: 'Linh Trung, Thủ Đức',
      areaKey: 'thu-duc',
      city: 'TP.HCM',
      roomType: 'Ở ghép',
      schoolPreference: 'HCMUS',
      budget: 2200000,
      criteria: ['Sạch sẽ']
    },
    { cookie: authCookie }
  );
  assert.equal(createRes.statusCode, 201);
  assert.equal(createRes.body.ok, true);
  assert.ok(createRes.body.roommate?.id);
  assert.equal(createRes.body.quota.remaining, 3);
  assert.ok(Array.isArray(createRes.body.roommates));

  const co = await callApi(
    'POST',
    '/api/plans/checkout',
    { packageId: 'all-in-one' },
    { cookie: authCookie }
  );
  assert.equal(co.statusCode, 201);
  const cf = await callApi(
    'POST',
    '/api/plans/confirm',
    { orderId: co.body.order.id },
    { cookie: authCookie }
  );
  assert.equal(cf.statusCode, 200);
  assert.equal(cf.body.entitlements.hasAllInOne, true);
  assert.equal(cf.body.entitlements.unlockedPrediction, true);

  const boostRes = await callApi(
    'POST',
    `/api/roommates/${encodeURIComponent(createRes.body.roommate.id)}/boost`,
    { period: '24h' },
    { cookie: authCookie }
  );
  assert.equal(boostRes.statusCode, 200);
  assert.equal(boostRes.body.ok, true);
  assert.ok(boostRes.body.roommates.find((r) => r.id === createRes.body.roommate.id)?.isBoosted);

  const bootRes = await callApi('GET', '/api/bootstrap', null, { cookie: authCookie });
  assert.equal(bootRes.statusCode, 200);
  assert.equal(bootRes.body.ok, true);
  assert.equal(bootRes.body.unlockedPrediction, true);
  assert.equal(bootRes.body.postQuota.remaining, 3);

  const resetRes = await callApi('POST', '/api/plans/reset', {}, { cookie: authCookie });
  assert.equal(resetRes.statusCode, 200);
  assert.equal(resetRes.body.ok, true);
  assert.deepEqual(resetRes.body.plans, []);
  assert.equal(resetRes.body.entitlements.unlockedPrediction, false);
  assert.equal(resetRes.body.postQuota.dailyLimit, 1);
  assert.ok(Array.isArray(resetRes.body.roommates));
  assert.equal(
    Boolean(resetRes.body.roommates.find((r) => r.id === createRes.body.roommate.id)?.isBoosted),
    false
  );
});
