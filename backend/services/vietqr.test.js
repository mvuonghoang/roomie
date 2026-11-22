const assert = require('node:assert/strict');
const test = require('node:test');
const { buildVietQrPayload, crc16Ccitt, createVietQr } = require('./vietqr');

test('builds a VietQR transfer payload with the expected amount and transfer code', () => {
  const payload = buildVietQrPayload({
    bankBin: '970436',
    accountNumber: '1234567890',
    amount: 49000,
    transferCode: 'RMABC123'
  });

  assert.ok(payload.includes('540549000'));
  assert.ok(payload.includes('08RMABC123'));
  assert.equal(payload.slice(-4), crc16Ccitt(payload.slice(0, -4)));
});

test('generates the QR image locally from configured bank details', async () => {
  const keys = {
    ROOMIE_VIETQR_BANK_BIN: '970436',
    ROOMIE_VIETQR_BANK_NAME: 'Ngân hàng kiểm thử',
    ROOMIE_VIETQR_ACCOUNT_NUMBER: '1234567890',
    ROOMIE_VIETQR_ACCOUNT_NAME: 'ROOMIE TEST'
  };
  const previous = {};
  for (const [key, value] of Object.entries(keys)) {
    previous[key] = process.env[key];
    process.env[key] = value;
  }

  try {
    const result = await createVietQr(49000, 'RMABC123');
    assert.equal(result.ok, true);
    assert.match(result.qrDataUrl, /^data:image\/png;base64,/);
    assert.equal(result.accountNumber, keys.ROOMIE_VIETQR_ACCOUNT_NUMBER);
  } finally {
    for (const key of Object.keys(keys)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test('generates a clearly marked non-payment QR when bank details are not configured', async () => {
  const keys = [
    'ROOMIE_VIETQR_BANK_BIN',
    'ROOMIE_VIETQR_BANK_NAME',
    'ROOMIE_VIETQR_ACCOUNT_NUMBER',
    'ROOMIE_VIETQR_ACCOUNT_NAME'
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];

  try {
    const result = await createVietQr(49000, 'RMABC123');
    assert.equal(result.ok, true);
    assert.equal(result.isDemo, true);
    assert.match(result.qrDataUrl, /^data:image\/png;base64,/);
    assert.equal(result.bank, 'QR demo');
    assert.equal(result.accountName, 'Không thể nhận tiền');
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
