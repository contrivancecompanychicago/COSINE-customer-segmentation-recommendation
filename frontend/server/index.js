'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { aiRecommend } = require('./ai-recommend');
const root = path.resolve(__dirname, '..');
function createServer({ apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || 'gpt-5-mini', fetchImpl = fetch } = {}) {
  let requests = 0, windowStart = Date.now();
  function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(body)); }
  return http.createServer(async (req, res) => {
    const port = req.socket.localPort;
    const hosts = ['localhost:' + port, '127.0.0.1:' + port];
    if (!hosts.includes(req.headers.host)) return json(res, 403, { error: 'Host not allowed' });
    const origin = req.headers.origin;
    if (origin && !hosts.some(host => origin === 'http://' + host)) return json(res, 403, { error: 'Origin not allowed' });
    const route = new URL(req.url, 'http://localhost').pathname;
    if (route === '/api/config' && req.method === 'GET') return json(res, 200, { aiEnabled: Boolean(apiKey) });
    if (route === '/api/recommend') {
      if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
      if (!(req.headers['content-type'] || '').startsWith('application/json')) return json(res, 415, { error: 'JSON required' });
      const chunks = []; let size = 0;
      try {
        for await (const chunk of req) { size += chunk.length; if (size > 8192) { json(res, 413, { error: 'Request too large' }); return; } chunks.push(chunk); }
        const { messages } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!Array.isArray(messages) || !messages.length || messages.length > 8 || messages.at(-1).role !== 'user' ||
          !messages.every(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim() && m.content.length <= 1000)) return json(res, 400, { error: 'Invalid conversation' });
        if (!apiKey) return json(res, 503, { error: 'AI is not configured' });
        if (Date.now() - windowStart > 60000) { windowStart = Date.now(); requests = 0; }
        if (++requests > 20) return json(res, 429, { error: 'Please wait before trying again' });
        try { return json(res, 200, { mode: 'ai', ...await aiRecommend(messages, { apiKey, model, fetchImpl }) }); }
        catch (_) { return json(res, 503, { error: 'AI is unavailable; use keyword matching' }); }
      } catch (_) { return json(res, 400, { error: 'Invalid JSON request' }); }
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const file = route === '/' ? '/html/recommender.html' : route;
    // Only serve browser assets. Never serve server code, environment files, or arbitrary repository paths.
    if (!/^\/(html|css|js)\/[a-zA-Z0-9_-]+\.(html|css|js|png)$/.test(file)) { res.writeHead(404); return res.end('Not found'); }
    try {
      const bytes = await fs.readFile(path.join(root, file));
      const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' }[path.extname(file)];
      res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch (_) { res.writeHead(404); res.end('Not found'); }
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 8000);
  createServer().listen(port, '127.0.0.1', () => console.log('ContriGameBot: http://localhost:' + port + '/html/recommender.html'));
}
module.exports = { createServer };
