const rateLimit = require('express-rate-limit');
const { isTesting } = require('../utils/config');

/**
 * @description Builds a rate limiter middleware. Disabled during tests so the
 * suite is not throttled; callers can override options (e.g. a tiny max in a
 * dedicated test) via the overrides argument.
 * @param {object} [overrides] - express-rate-limit options to override defaults
 * @returns configured rate limiter middleware
 */
const createRateLimiter = (overrides = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
    skip: () => isTesting,
    ...overrides,
  });

// Auth endpoints (login, registration, token validation): guards against
// credential brute-forcing.
const authLimiter = createRateLimiter({ max: 100 });

// Email-sending endpoints (password reset, resend confirmation): stricter, to
// limit outbound email abuse.
const emailLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

module.exports = { createRateLimiter, authLimiter, emailLimiter };
