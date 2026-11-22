const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');
const INFO_DIR = path.join(ROOT_DIR, 'info');
const PREFERRED_PORT = Number(process.env.PORT) || 3000;

const BASE_PREFIX = '/roomie';

const ROUTE_MAP = {
  '/roomie': 'index.html',
  '/roomie/index.html': 'index.html',
  '/roomie/trang-chu': 'index.html',
  '/roomie/tim-phong': 'pages/tim-phong.html',
  '/roomie/khu-vuc-lang-dai-hoc': 'pages/tim-phong.html',
  '/roomie/phong-chi-tiet': 'pages/phong-chi-tiet.html',
  '/roomie/phong-chi-tiet-1': 'pages/phong-chi-tiet.html',
  '/roomie/phong-chi-tiet-2': 'pages/phong-chi-tiet.html',
  '/roomie/phong-chi-tiet-3': 'pages/phong-chi-tiet.html',
  '/roomie/phong-chi-tiet-4': 'pages/phong-chi-tiet.html',
  '/roomie/phong-chi-tiet-5': 'pages/phong-chi-tiet.html',
  '/roomie/phong-chi-tiet-6': 'pages/phong-chi-tiet.html',
  '/roomie/trac-nghiem': 'pages/trac-nghiem.html',
  '/roomie/trac-nghiem-hop-gu': 'pages/trac-nghiem.html',
  '/roomie/trac-nghiem-tinh-cach': 'pages/trac-nghiem.html',
  '/roomie/tim-roommate': 'pages/tim-roommate.html',
  '/roomie/ket-qua-match': 'pages/tim-roommate.html',
  '/roomie/dang-tin': 'pages/dang-tin.html',
  '/roomie/dang-tin-mien-phi': 'pages/dang-tin.html',
  '/roomie/tin-da-dang': 'pages/tin-da-dang.html',
  '/roomie/dich-vu': 'pages/bang-gia.html',
  '/roomie/bang-gia': 'pages/bang-gia.html',
  '/roomie/ve-chung-toi': 'pages/ve-chung-toi.html',
  '/roomie/lien-he': 'pages/lien-he.html',
  '/roomie/an-toan': 'pages/an-toan.html',
  '/roomie/nguyen-tac-an-toan': 'pages/an-toan.html',
  '/roomie/bao-cao-tin-gia': 'pages/an-toan.html',
  '/roomie/lien-he-faq': 'pages/an-toan.html',
  '/roomie/quy-chuan-cong-dong': 'pages/an-toan.html',
};

const LEGACY_REDIRECTS = new Set([
  '/',
  '/index.html',
  '/trang-chu',
  '/tim-phong',
  '/khu-vuc-lang-dai-hoc',
  '/phong-chi-tiet',
  '/phong-chi-tiet-1',
  '/phong-chi-tiet-2',
  '/phong-chi-tiet-3',
  '/phong-chi-tiet-4',
  '/phong-chi-tiet-5',
  '/phong-chi-tiet-6',
  '/trac-nghiem',
  '/trac-nghiem-hop-gu',
  '/trac-nghiem-tinh-cach',
  '/tim-roommate',
  '/ket-qua-match',
  '/dang-tin',
  '/dang-tin-mien-phi',
  '/tin-da-dang',
  '/dich-vu',
  '/bang-gia',
  '/ve-chung-toi',
  '/lien-he',
  '/an-toan',
  '/nguyen-tac-an-toan',
  '/bao-cao-tin-gia',
  '/lien-he-faq',
  '/quy-chuan-cong-dong',
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return ch;
    }
  });
}

function sendFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(err.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error');
      return;
    }
    res.writeHead(statusCode, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    res.end(content);
  });
}

function resolveSafePath(baseDir, relPath) {
  const normalized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(baseDir, normalized);
  if (fullPath !== baseDir && !fullPath.startsWith(baseDir + path.sep)) return null;
  return fullPath;
}

const { handleApiRequest } = require('./backend/routes/api');

const server = http.createServer(async (req, res) => {
  if (await handleApiRequest(req, res)) {
    return;
  }
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // 1. Check canonical /roomie page routes
  if (ROUTE_MAP[pathname]) {
    const targetFile = path.join(SRC_DIR, ROUTE_MAP[pathname]);
    return sendFile(res, targetFile);
  }

  // 1b. Redirect root and legacy non-prefixed page routes to /roomie...
  if (LEGACY_REDIRECTS.has(pathname)) {
    const targetPath = pathname === '/' || pathname === '/index.html' || pathname === '/trang-chu'
      ? BASE_PREFIX
      : `${BASE_PREFIX}${pathname}`;
    res.writeHead(302, {
      Location: `${targetPath}${reqUrl.search || ''}`,
      'Cache-Control': 'no-store',
    });
    res.end();
    return;
  }

  // 2. Serve /info/* assets (e.g. /info/logo.png)
  if (pathname.startsWith('/info/')) {
    const filePath = resolveSafePath(INFO_DIR, pathname.slice('/info/'.length));
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return sendFile(res, filePath);
    }
  }

  // 3. Serve /src/* directly if referenced
  if (pathname.startsWith('/src/')) {
    const filePath = resolveSafePath(SRC_DIR, pathname.slice('/src/'.length));
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return sendFile(res, filePath);
    }
  }

  // 4. Serve static files inside src/ (supports both /assets/... and /roomie/assets/...)
  const staticRel = pathname.startsWith(`${BASE_PREFIX}/`)
    ? pathname.slice(`${BASE_PREFIX}/`.length)
    : pathname.slice(1);
  const srcFile = resolveSafePath(SRC_DIR, staticRel);
  if (srcFile && fs.existsSync(srcFile)) {
    if (fs.statSync(srcFile).isDirectory()) {
      const indexHtml = path.join(srcFile, 'index.html');
      if (fs.existsSync(indexHtml)) return sendFile(res, indexHtml);
    } else {
      return sendFile(res, srcFile);
    }
  }

  // 5. Fallback 404 page
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  res.end(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>404 - Roomie</title><link rel="icon" type="image/png" href="/assets/images/common/favicon.png?v=3" /><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#f9f9ff] min-h-screen flex items-center justify-center p-6 font-sans"><div class="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg"><div class="text-5xl font-bold text-[#493ee5] mb-3">404</div><h1 class="text-xl font-bold text-[#181c23] mb-2">Không tìm thấy trang này</h1><p class="text-sm text-[#464555] mb-6">Đường dẫn <code>${escapeHtml(pathname)}</code> chưa tồn tại trên Roomie.</p><a href="/roomie" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#493ee5] text-white font-semibold text-sm hover:bg-[#635bff]">Về trang chủ</a></div></body></html>`);
});

function startServer(port, attemptsLeft = 5) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.log(`Port ${port} dang ban, thu port ${port + 1}...`);
      startServer(port + 1, attemptsLeft - 1);
    } else {
      console.error('Khong the khoi dong server:', err);
      process.exit(1);
    }
  });

  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    console.log(`\n========================================`);
    console.log(`  Roomie Client-Server dang chay!`);
    console.log(`  Web URL : http://localhost:${port}/roomie`);
    console.log(`  API URL : http://localhost:${port}/api/health`);
    console.log(`  Storage : Supabase PostgreSQL`);
    console.log(`========================================\n`);
  });
}

startServer(PREFERRED_PORT);
