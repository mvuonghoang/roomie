const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), override: false });

function normalizeText(value) {
  return String(value || '').trim();
}

function getDatabaseConfig() {
  const connectionString =
    normalizeText(process.env.DATABASE_URL) ||
    normalizeText(process.env.POSTGRES_URL) ||
    normalizeText(process.env.SUPABASE_DB_URL);

  const isLocal =
    !connectionString ||
    /localhost|127\.0\.0\.1|sslmode=disable/i.test(connectionString) ||
    normalizeText(process.env.PGSSLMODE).toLowerCase() === 'disable';

  return {
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: Number(process.env.PG_POOL_MAX) || 10,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000
  };
}

function getVietQrConfig() {
  const bankBin = normalizeText(process.env.ROOMIE_VIETQR_BANK_BIN);
  const bankName = normalizeText(process.env.ROOMIE_VIETQR_BANK_NAME);
  const accountNumber = normalizeText(process.env.ROOMIE_VIETQR_ACCOUNT_NUMBER);
  const accountName = normalizeText(process.env.ROOMIE_VIETQR_ACCOUNT_NAME);
  return {
    bankBin,
    bankName,
    accountNumber,
    accountName,
    configured: Boolean(bankBin && bankName && accountNumber && accountName)
  };
}

function isDemoLoginEnabled() {
  return normalizeText(process.env.ROOMIE_ENABLE_DEMO_LOGIN).toLowerCase() !== 'false';
}

module.exports = {
  getDatabaseConfig,
  getVietQrConfig,
  isDemoLoginEnabled
};
