const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

process.env.ROOMIE_DB_PATH = path.join(os.tmpdir(), `roomie-plans-api-${process.pid}.sqlite`);
process.env.ROOMIE_VIETQR_BANK_BIN = '970436';
process.env.ROOMIE_VIETQR_BANK_NAME = 'Ngân hàng kiểm thử';
process.env.ROOMIE_VIETQR_ACCOUNT_NUMBER = '1234567890';
process.env.ROOMIE_VIETQR_ACCOUNT_NAME = 'ROOMIE TEST';

const db = require('../database/db');
const { handleApiRequest } = require('./api');
const registered = db.registerUser({
  name: 'Sinh viên API test',
  email: `roomie-api-${process.pid}@student.hcmus.edu.vn`,
  password: 'testing-pass',
  schoolCode: 'HCMUS',
  gender: 'Nữ'
});
assert.equal(registered.ok, true);
const testUser = registered.user;

async function callApi(method, url, body) {
  const req = {
    method,
    url,
    headers: {
      host: 'localhost',
      'x-user-id': testUser.id
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
      this.body = JSON.parse(bodyText);
    }
  };
  await handleApiRequest(req, response);
  return response;
}

test('checkout returns a local VietQR and does not activate before confirmation', async () => {
  const checkout = await callApi('POST', '/api/plans/checkout', {
    packageId: 'extra-posts-day'
  });

  assert.equal(checkout.statusCode, 201);
  assert.match(checkout.body.payment.qrDataUrl, /^data:image\/png;base64,/);
  assert.equal(checkout.body.order.amountVnd, 49000);
  assert.equal(db.getUserPlans(testUser.id).length, 0);

  const confirmation = await callApi('POST', '/api/plans/confirm', {
    orderId: checkout.body.order.id
  });
  assert.equal(confirmation.statusCode, 200);
  assert.equal(confirmation.body.plans[0].id, 'extra-posts-day');
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
    const checkout = await callApi('POST', '/api/plans/checkout', {
      packageId: 'extra-posts-day'
    });
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
  const result = await callApi('POST', '/api/plans/checkout', {
    packageId: 'boost-24h',
    targetId: 'not-owned'
  });

  assert.equal(result.statusCode, 400);
  assert.match(result.body.error, /bài đăng của bạn/i);
});
