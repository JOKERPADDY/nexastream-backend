const http = require('http');
const express = require('express');
const apiRoutes = require('../src/routes/apiRoutes');

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

let server;
let port;

beforeAll((done) => {
  server = http.createServer(app);
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
});

test('GET /api/v1/providers returns provider list', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/providers`);
  const data = await res.json();
  expect(data.providers).toBeDefined();
  expect(data.providers.length).toBeGreaterThan(0);
});

test('POST /api/v1/resolve blocks SSRF / private IP', async () => {
  const res = await fetch(`http://localhost:${port}/api/v1/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'streamwish', url: 'http://127.0.0.1/secret' })
  });
  expect(res.status).toBe(403);
  const data = await res.json();
  expect(data.error).toBeDefined();
});
