/**
 * Vercel Serverless Function Entry Point for Roomie Match Backend API
 * Chuyển tiếp mọi request /api/* và /roomie/api/* vào backend/routes/api.js
 */

const { handleApiRequest } = require('../backend/routes/api');

module.exports = async (req, res) => {
  await handleApiRequest(req, res);
};
