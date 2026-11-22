const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

function getVietQrConfig() {
  const bankBin = String(process.env.ROOMIE_VIETQR_BANK_BIN || '').trim();
  const bankName = String(process.env.ROOMIE_VIETQR_BANK_NAME || '').trim();
  const accountNumber = String(process.env.ROOMIE_VIETQR_ACCOUNT_NUMBER || '').trim();
  const accountName = String(process.env.ROOMIE_VIETQR_ACCOUNT_NAME || '').trim();
  const configured =
    /^\d{6}$/.test(bankBin) &&
    /^[A-Za-z0-9]{5,30}$/.test(accountNumber) &&
    Boolean(bankName) &&
    Boolean(accountName);

  return {
    configured,
    bankBin,
    bankName,
    accountNumber,
    accountName
  };
}

module.exports = { getVietQrConfig };
