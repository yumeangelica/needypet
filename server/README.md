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
npm install        # install dependencies
npm run dev        # start the server with nodemon (NODE_ENV=development)
```

## Scripts

| Script            | Description                                               |
| ----------------- | -------------------------------------------------------- |
| `npm start`       | Start the server in production mode.                      |
| `npm run dev`     | Start the server with nodemon in development mode.        |
| `npm test`        | Run the test suite (`node --test`) against the test DB.   |
| `npm run test:coverage` | Run the test suite with Node's built-in coverage report. |

> The test suite (and its coverage variant) connect to `TEST_MONGODB_URI`, so a
> reachable MongoDB instance is required to run them.

## API overview

All `/api` routes require a valid bearer token.

### Auth (`/auth`)

| Method | Path                                  | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| POST   | `/users`                              | Register a new user.                 |
| GET    | `/users/:id`                          | Get a user by id.                    |
| PUT    | `/users/:id`                          | Update a user (profile or password). |
| DELETE | `/users/:id`                          | Delete a user account.               |
| POST   | `/login`                              | Log in and receive a token.          |
| POST   | `/validatetoken`                      | Validate a token.                    |
| POST   | `/verify-email-confirmation-token`    | Verify an email confirmation token.  |
| POST   | `/resend-email-confirmation`          | Resend the confirmation email.       |
| POST   | `/request-password-reset`             | Request a password reset email.      |
| POST   | `/verify-password-reset-token`        | Verify a password reset token.       |
| POST   | `/password-reset`                     | Reset the password.                  |

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

## Security notes and known limitations

This is a portfolio snapshot. A few intentional trade-offs are worth calling out
for anyone reviewing or extending it:

- **Token storage.** Email-confirmation and password-reset tokens are stored in
  the database in plaintext (not hashed). They are short-lived (2 hours), but a
  database compromise would expose any pending tokens.
- **Content Security Policy.** The CSP allows `unsafe-inline` for styles/scripts
  to accommodate the bundled SPA output. This weakens the protection CSP would
  otherwise provide against injected inline content.
- **Rate limiting.** The authentication routes are rate limited, with a stricter
  limit on the email-sending endpoints (`request-password-reset`,
  `resend-email-confirmation`). The limiter is disabled under `NODE_ENV=testing`
  so the test suite is not throttled.

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
