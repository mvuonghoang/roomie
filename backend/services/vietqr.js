const QRCode = require('qrcode');
const { getVietQrConfig } = require('../config');

function tlv(id, value) {
  const content = String(value);
  if (content.length > 99) {
    throw new Error(`VietQR field ${id} is longer than 99 characters.`);
  }
  return `${id}${String(content.length).padStart(2, '0')}${content}`;
}

function crc16Ccitt(payload) {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildVietQrPayload({ bankBin, accountNumber, amount, transferCode }) {
  const accountData = tlv('00', bankBin) + tlv('01', accountNumber);
  const merchantAccount =
    tlv('00', 'A000000727') + tlv('01', accountData) + tlv('02', 'QRIBFTTA');
  const additionalData = tlv('08', transferCode);
  const payload =
    tlv('00', '01') +
    tlv('01', '12') +
    tlv('38', merchantAccount) +
    tlv('53', '704') +
    tlv('54', amount) +
    tlv('58', 'VN') +
    tlv('62', additionalData) +
    '6304';

  return `${payload}${crc16Ccitt(payload)}`;
}

async function createVietQr(amount, transferCode) {
  const config = getVietQrConfig();
  if (!config.configured) {
    const demoPayload = `ROOMIE-DEMO|NOT-A-PAYMENT|AMOUNT=${amount}|REF=${transferCode}`;
    const dataUrl = await QRCode.toDataURL(demoPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320
    });

    return {
      ok: true,
      isDemo: true,
      qrDataUrl: dataUrl,
      bank: 'QR demo',
      accountNumber: 'Không áp dụng',
      accountName: 'Không thể nhận tiền'
    };
  }

  const payload = buildVietQrPayload({
    bankBin: config.bankBin,
    accountNumber: config.accountNumber,
    amount,
    transferCode
  });
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320
  });

  return {
    ok: true,
    isDemo: false,
    qrDataUrl: dataUrl,
    bank: config.bankName,
    accountNumber: config.accountNumber,
    accountName: config.accountName
  };
}

module.exports = { buildVietQrPayload, crc16Ccitt, createVietQr };
