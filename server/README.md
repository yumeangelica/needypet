# NeedyPet Server

The backend API for NeedyPet, a pet care management application. See the [root README](../README.md) for the full project overview and feature list.

## Tech stack

- [Express 5](https://expressjs.com/) as the web framework
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [jose](https://github.com/panva/jose) for JWT handling and [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing
- [zod](https://zod.dev/) for input validation
- [nodemailer](https://nodemailer.com/) for transactional email
- [node-cron](https://github.com/node-cron/node-cron) for scheduled need updates
- [helmet](https://helmetjs.github.io/) and CORS for security headers
- [Biome](https://biomejs.dev/) for linting and formatting

## Scope

This server is a modern showcase app on the Express 5 / MongoDB / Mongoose stack.
Keep work within this implementation; don't migrate it to Nuxt server routes,
SQLite, or Postgres in place — that belongs to the separate Nuxt 4 rebuild. The
rebuild plan is captured in
[../documentation/migrationReadiness.md](../documentation/migrationReadiness.md).

## Environment variables

The server reads configuration from environment files (gitignored). Copy
[`.env.example`](.env.example) to `.env.development` and/or `.env.production` and
fill in the values. The required variables depend on `NODE_ENV` (`development`,
`production`, or `testing`); the server fails fast on startup if `JWT_SECRET` or
the mode-appropriate MongoDB URI is missing.

| Variable                  | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `NODE_ENV`                | `development`, `production`, or `testing`.            |
| `PORT`                    | Port the HTTP server listens on.                     |
| `DEVELOPMENT_MONGODB_URI` | MongoDB connection string for development.           |
| `PRODUCTION_MONGODB_URI`  | MongoDB connection string for production.            |
| `TEST_MONGODB_URI`        | MongoDB connection string for the test suite.        |
| `JWT_SECRET`              | Secret used to sign and verify JWTs.                 |
| `ALLOWED_ORIGINS`         | Comma-separated list of allowed CORS origins.        |
| `EMAIL_SERVICE`           | Nodemailer email service name.                       |
| `EMAIL_USER`              | SMTP username.                                        |
| `EMAIL_PASS`              | SMTP password.                                        |
| `EMAIL_PORT`              | SMTP port.                                            |
| `EMAIL_FROM`              | From address for outgoing email.                     |

## Getting started

```bash
bun install        # install dependencies
bun run dev        # start the server with Node's watch mode (NODE_ENV=development)
```

## Scripts

| Script            | Description                                               |
| ----------------- | -------------------------------------------------------- |
| `bun run start`   | Start the server in production mode.                      |
| `bun run dev`     | Start the server with Node's watch mode in development.   |
| `bun run test`    | Run the test suite (`node --test`) against the test DB.   |
| `bun run test:coverage` | Run the test suite with Node's built-in coverage report. |

> The test suite (and its coverage variant) connect to `TEST_MONGODB_URI`, so a
> reachable MongoDB instance is required to run them.

## API overview

All `/api` routes require a valid bearer token.

### Auth (`/auth`)

`/auth` contains both public account-flow routes and routes that require a
bearer token.

| Method | Path                               | Access       | Description                          |
| ------ | ---------------------------------- | ------------ | ------------------------------------ |
| POST   | `/users`                           | Public       | Register a new user.                 |
| GET    | `/users/:id`                       | Protected    | Get the current user by id.          |
| PUT    | `/users/:id`                       | Protected    | Update a user (profile or password). |
| DELETE | `/users/:id`                       | Protected    | Delete a user account.               |
| POST   | `/login`                           | Public       | Log in and receive a token.          |
| POST   | `/validatetoken`                   | Bearer token | Validate a token.                    |
| POST   | `/verify-email-confirmation-token` | Public       | Verify an email confirmation token.  |
| POST   | `/resend-email-confirmation`       | Protected    | Resend the confirmation email.       |
| POST   | `/request-password-reset`          | Public       | Request a password reset email.      |
| POST   | `/verify-password-reset-token`     | Public       | Verify a password reset token.       |
| POST   | `/password-reset`                  | Public       | Reset the password.                  |

### Pets and needs (`/api`)

| Method | Path                                      | Description                       |
| ------ | ----------------------------------------- | --------------------------------- |
| GET    | `/pets`                                   | List the current user's pets.     |
| POST   | `/pets`                                   | Add a new pet.                    |
| PUT    | `/pets/:id`                               | Update a pet.                     |
| DELETE | `/pets/:id`                               | Delete a pet.                     |
| POST   | `/pets/:id/newneed`                       | Add a need to a pet.              |
| PUT    | `/pets/:id/needs/:needid`                 | Update a need.                    |
| DELETE | `/pets/:id/needs/:needid`                 | Delete a need.                    |
| PATCH  | `/pets/:id/needs/:needid/togglestatus`    | Toggle a need's active status.    |
| POST   | `/pets/:id/needs/:needid/newrecord`       | Add a care record to a need.     |

## API contracts

- Date-only fields use `YYYY-MM-DD` in request and response payloads.
  `pets.birthday` stores valid values at UTC midnight and can be cleared with
  `null`; `need.dateFor` remains the owner's local care day.
- Needs and care records must include exactly one measurement shape: `duration`
  or `quantity`. Care records must use the same measurement shape as the parent
  need.
- Schema validation failures return **422** with `errorDetails`. Authenticated
  users who lack permission receive **403**. Business-rule failures such as
  completed/archived needs or wrong care-record measurement type remain **400**.
- `/auth/users/:id` is self-only: the route id must match the authenticated
  token user. `/auth/validatetoken` also verifies that the token user still
  exists.
- Email-sending flows roll back pending token/email state if delivery fails, so
  failed profile-email changes, reset requests or confirmation resends do not
  leave stale replacement tokens behind.

## Security notes and known limitations

This is a portfolio showcase app. A few intentional trade-offs are worth calling
out for anyone reviewing or extending it:

- **Token storage.** Email-confirmation and password-reset tokens are stored in
  the database in plaintext (not hashed). They are short-lived (2 hours), but a
  database compromise would expose any pending tokens.
- **Content Security Policy.** The CSP keeps scripts on `self`; inline styles are
  still allowed to accommodate component and bundled SPA styling.
- **Rate limiting.** The authentication routes are rate limited, with a stricter
  limit on the email-sending endpoints (`request-password-reset`,
  `resend-email-confirmation`). The limiter is disabled under `NODE_ENV=testing`
  (requests still succeed — they are simply never throttled) so the test suite is
  deterministic.
- **Transactional email.** Test runs skip real outbound email. In development and
  production, mail delivery errors are returned to the caller instead of being
  swallowed silently.

## Project structure

```
server/
├── controllers/   Request handlers
├── database/      MongoDB connection
├── helper/        Scheduled need-update logic
├── middlewares/   Auth, validation, logging, error handling
├── models/        Mongoose models
├── routes/        Route definitions
├── utils/         Config, CORS, mailer
├── validations/   zod schemas
└── __tests__/     Test suite
```

## Deferred work

Backend improvements consciously left out of the current showcase are recorded so
they don't need re-deriving:

- [../documentation/backendBacklog.md](../documentation/backendBacklog.md) —
  general backend backlog (unused `frequency` field, user optimistic
  concurrency and completed polish-pass notes).
- [ROLLOVER_BACKLOG.md](ROLLOVER_BACKLOG.md) — rollover- and data-model-specific
  items (archived-need retention, recurrence identity, distributed lock, per-tick
  query narrowing).
