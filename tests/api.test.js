import http from 'http';
import app from '../index.js';

let server;
let port;

beforeAll((done) => {
  server = http.createServer(async (req, res) => {
    const workerReq = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.socket
    });
    const workerRes = await app.fetch(workerReq, {}, {});
    res.statusCode = workerRes.status;
    workerRes.headers.forEach((val, key) => res.setHeader(key, val));
    const buffer = await workerRes.arrayBuffer();
    res.end(Buffer.from(buffer));
  });
  server.listen(0, () => {
    port = server.address().port;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

test('GET /health returns healthy', async () => {
  const res = await fetch(`http://localhost:${port}/health`);
  const data = await res.json();
  expect(data.status).toBe('healthy');
  expect(data.runtime).toBe('cloudflare-worker');
});

test('GET /api/v1/providers returns provider list', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/providers`);
  const data = await res.json();
  expect(data.providers).toBeDefined();
  expect(data.providers.length).toBeGreaterThan(0);
});
