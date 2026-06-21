const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const supertest = require('supertest');
const { createRateLimiter } = require('../middlewares/rateLimitMiddleware');

// The shared limiters skip throttling during tests so the suite is not blocked.
// Here we exercise the factory directly with throttling forced on and a tiny
// max, to prove the 429 behavior deterministically.
describe('rate limiter middleware', () => {
  const buildApp = () => {
    const app = express();
    const limiter = createRateLimiter({ max: 1, skip: () => false });
    app.use('/limited', limiter, (_request, response) => {
      response.status(200).json({ ok: true });
    });
    return supertest(app);
  };

  it('allows requests up to the limit then responds 429', async () => {
    const api = buildApp();

    const first = await api.get('/limited');
    assert.strictEqual(first.status, 200);

    const second = await api.get('/limited');
    assert.strictEqual(second.status, 429);
    assert.match(second.body.message, /too many requests/i);
  });
});
