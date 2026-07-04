# Backend — deferred backlog

Backend findings from the full audit/polish pass that are intentionally left out
of the pass itself. None are bugs in the current single-instance showcase
deployment; each is harmless dead schema or a design decision that belongs in the
separate Nuxt 4 + Postgres rebuild. The analysis is captured here so it doesn't
need re-deriving. API-contract items found during the audit were implemented in
the polish pass; see the done list below.

The rollover/data-model-specific items live in a sibling file,
[`server/ROLLOVER_BACKLOG.md`](../server/ROLLOVER_BACKLOG.md) (archived-needs
growth, recurrence id, distributed lock, per-tick query narrowing) — those are
referenced, not duplicated, here.

Done in the polish pass (no longer deferred):

- `deleteNeed` now removes a need with an atomic `$pull` instead of a bare
  `pet.save()`, so a legacy need that no longer matches the current schema can no
  longer block an unrelated delete. `save({ validateModifiedOnly: true })` does
  **not** fix this, because pulling from the embedded `needs` array marks the
  whole path modified and Mongoose re-validates every sibling subdoc.
- `verifyPasswordResetToken` now guards a missing `passwordResetExpires` before
  calling `.getTime()`, matching `verifyEmailConfirmToken` /
  `canResendPasswordReset` (was a 500 instead of a 401 on a corrupted/legacy
  record).
- The supported-timezone list is cached once in `helper/index.js`
  (`SUPPORTED_TIMEZONES`) and reused by the helper functions and the `petModel`
  care-record validator, instead of recomputing `Intl.supportedValuesOf` on
  every call/validation.
- `loginValidation` password gained a `.min(1)`, and the bare `.parse` exports in
  `loginValidation` / `needValidation` / `recordValidation` were wrapped in the
  same try/catch-rethrow-ZodError shape as `registerValidation` /
  `updateUserValidation` (behavior-identical; the controllers already catch
  `ZodError`).
- Removed dead local-only artifacts (`server/server_updates/update_records.js`
  and `server/requests/*.rest`) — one-off scripts referencing hardcoded URIs and
  endpoints that no longer exist. They were gitignored, so this does not appear
  in the repo diff.
- **Authorization failures now return 403, not 401.**
  `petOwnerValidationMiddleware` and `petCareTakerValidationMiddleware` return
  **403 Forbidden** with `{ message: 'Forbidden' }` when an authenticated user
  lacks permission on a pet (previously 401). 401 is now reserved for
  authentication failures (missing/invalid/expired token, bad credentials). The
  pet/need integration tests and the two client `pet.spec.ts` authz mocks were
  updated to expect 403; the client surfaces the backend message regardless of
  status, so no runtime client change was needed.
- **Zod validation failures now return 422 everywhere.** The `petController`
  need/record validation branches (`addNewNeed`, `addNewRecord`, `updateNeed`)
  return **422** on a `ZodError`, matching `userController` and the canonical
  `ZodError` branch in `errorHandlerMiddleware`. Business-rule rejections in
  `petController` (need archived/completed, past day, 10-per-day limit, invalid
  caretaker id, caretakers-must-be-array) intentionally **stay 400** — they are
  not schema-validation failures. Tests updated accordingly; the client reads
  `errorDetails` the same way for 400 and 422, so no runtime client change was
  needed.
- **Need and care-record measurements are exclusive and required.** API
  validation now requires exactly one measurement shape (`duration` or
  `quantity`) for both `Need` and `CareRecord`. Care records with the wrong
  measurement type for their target need now fail with a 400 business-rule
  response. Updating a need can still preserve its existing measurement when the
  request only changes text fields, but requests that send both measurement
  shapes are rejected with 422.
- **Pet birthdays are locked to date-only API semantics.** The client sends
  birthday as `YYYY-MM-DD | null`, not a `Date` object. The server normalizes
  valid birthdays to UTC-midnight storage, returns `YYYY-MM-DD`, and rejects
  malformed or future birthdays with 422. `need.dateFor` behavior is unchanged.
- **User-id route contracts are explicit.** `/auth/users/:id` now allows only
  the authenticated user's own id; a token/id mismatch returns 403. The token
  validation endpoint now checks that the JWT user still exists and returns 401
  for a deleted-user token.
- **Email-token flows roll back on delivery failure.** Profile email changes,
  password reset requests and resend-confirmation requests restore their
  previous token/email state if the outgoing email fails. Already confirmed
  users cannot request another confirmation email.
- **Pet API edge cases are hardened.** Missing `request.body.need` now returns
  422 instead of crashing, malformed pet ids surface as 400 `Malformatted id`,
  care-record timezone is always set by the controller, owners cannot be added
  as their own caretakers, and pet updates now respect intentional clearing of
  optional fields.

---

## 1. Unused `frequency` field on the need schema

**Status:** deferred — reserved for a future notifications feature.

**Now:** `petModel.js` defines a rich `frequency` sub-schema
(`times` + `periodicity` with unit/interval/custom days/start/end/reminder/
active) on each need. Nothing writes or reads it; the daily rollover carries
active needs forward by owner-local day and does not use `frequency`. The
`needValidation` schema accepts it as optional but the controllers never set it.

**Why not now:** it is harmless dead schema, and real recurrence is a rebuild
feature (see `migrationReadiness.md` — "Activity scheduling/recurrence design
beyond the current daily rollover model").

**Direction if picked up:** either drop the field from this showcase to keep the
model honest, or design first-class recurrence in the Nuxt 4 rebuild with real
`recurrence`/`reminder` tables (ties into ROLLOVER_BACKLOG #1, recurrence id).

---

## 2. `userModel` has no optimistic concurrency

**Status:** deferred — low risk at showcase scale.

**Now:** `petModel` sets `optimisticConcurrency` (the rollover job relies on the
`__v` `VersionError` retry), but `userModel` does not. Two concurrent profile
updates on the same user could last-write-win silently.

**Why not now:** user writes are single-document saves on a freshly loaded doc
from one authenticated session; concurrent same-user writes are not a real
pattern in this app. Adding it would need a retry story the controllers don't
currently have.

**Direction if picked up:** enable `optimisticConcurrency` on `userModel` and add
a conflict-retry (or a clear 409) to the profile/password update paths. In the
rebuild this is naturally handled by the relational row + `updated_at` / version
column.

---

## Note: integration tests need a reachable MongoDB

Like the rollover suites, every backend integration suite connects to
`TEST_MONGODB_URI` (from `utils/config`) in `before()` and wipes `User` / `Pet`
in `beforeEach` / `after`. They are real-Mongo integration tests, not pure unit
tests. `bun run test` passes only when that DB is reachable (see project docs and
`server/ROLLOVER_BACKLOG.md`). Do not run throwaway scripts with `deleteMany({})`
against a configured database — add a scoped test with proper setup/teardown
instead.
