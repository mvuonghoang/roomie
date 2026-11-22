const { handleApiRequest } = require('../backend/routes/api');

module.exports = async function handler(req, res) {
  const handled = await handleApiRequest(req, res);
  if (!handled && !res.writableEnded) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'Route not handled by API handler.' }));
  }
};
