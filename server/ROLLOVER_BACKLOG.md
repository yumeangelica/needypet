# Need rollover — deferred backlog

Items consciously left out of the rollover bug-fix pass. They are not bugs in the
current single-instance deployment; each is a future improvement with the
analysis already done so it doesn't need re-deriving. Pick up if/when the need
arises.

Related code:
- `helper/index.js` — `rollPetNeedsForward`, `updatePetNeedstoNextDays`, `getMidnightTimezones`
- `models/petModel.js` — embedded `needs[]`, `lastRolledNeedDate`
- `controllers/petController.js` — `addNewRecord`, `normalizeNeedDateForStorage`
- `__tests__/needRollover.test.js`

---

## 1. Recurrence id instead of template-key de-dupe

**Status:** deferred — needs a data-model change, not a minimal fix.

**Now:** generated/duplicate "today" needs are matched by a template key of
`category + description + measure (duration|quantity)` (`needTemplateKey` in
`helper/index.js`). This is the only signal available without a real recurrence
identity.

**Limitation (both directions):**
- Too broad: two genuinely distinct needs that happen to share category +
  description + measure collapse into one (e.g. two separate "Walk / Morning
  walk / 40 min" entries).
- Too narrow: editing a need's description/measure before the rollover makes the
  template stop matching, so a duplicate "today" can be generated.

**Direction if picked up:** add a `recurrenceId` (or `seriesId`) to each need in
`petModel.js`, set it when a recurring need is first created, copy it onto
generated needs, and key `hasNeedForTemplateOnDay` / de-dupe on it instead of
the string template. Migration: backfill existing needs (group by current
template key per pet). Update `needRollover.test.js` to assert de-dupe by id, and
add a case for "same template, different recurrence id → not merged".

**Why not now:** touches the schema, the generator, the controller create path,
and needs a data migration — out of scope for a bug-fix pass.

---

## 2. Mongo-backed distributed lock for the cron job

**Status:** deferred — only worth it if we move to multi-instance deploy.

**Now:** two guards exist:
- in-process `rolloverJobRunning` flag (`helper/index.js`) — protects a single
  Node process from overlapping runs.
- durable per-pet `lastRolledNeedDate` (added in the fix pass) — makes the roll
  idempotent across processes/instances and lets a `VersionError`-skipped pet be
  safely retried on the next cron tick.

The cron is registered for every non-test process (`app.js`), so if the app ever
runs with >1 replica, every replica runs the job. `lastRolledNeedDate` already
makes that safe (idempotent), so a lock is not required for correctness.

**Direction if picked up (only if needed):** a single advisory-lock document with
a TTL (e.g. `rolloverLocks` collection, `findOneAndUpdate` with upsert + expiry)
acquired around the whole `updatePetNeedstoNextDays` run, so only one instance
does the scan per tick. Heavier than the per-pet guard; adds an operational
moving part.

**Why not now:** `lastRolledNeedDate` covers multi-instance idempotency far more
cheaply. A full lock is premature until a multi-instance deployment is an actual
decision.

---

## 3. `needs[]` retention / history offload

**Status:** deferred — own feature. A `TODO` marker is in
`rollPetNeedsForward`'s docblock (`helper/index.js`).

**Now:** archived needs are never pruned. `pet.needs` grows ~1 entry per
recurring template per day (a pet with 3 daily needs accrues ~1,095
subdocuments/year) and will eventually approach MongoDB's 16 MB document cap;
large embedded arrays slow every `findById`/save well before that. Acceptable
short-term for a showcase.

**Direction if picked up, two options:**
- **Retention sweep:** a scheduled job that `$pull`s archived needs older than N
  days from `pet.needs`. Simplest; keeps the embedded model. Decide N and whether
  history is needed at all.
- **History collection:** move archived needs to a separate `needHistory`
  collection keyed by pet + date; keep only active/recent needs embedded. More
  work, but bounds the pet document and preserves full history.

**Why not now:** the rollover correctness work doesn't depend on it, and either
option is a standalone feature with its own product decision (how much history to
keep).

---

## 4. Narrow the per-tick rollover query

**Status:** deferred — scale optimisation only, no correctness impact.

**Now:** `updatePetNeedstoNextDays` (`helper/index.js`) loads every owner and then
every pet for those owners on each cron tick (every 15 min), even though most pets
already have an up-to-date `lastRolledNeedDate` and are an immediate no-op in
`rollPetNeedsForward`. Fine at showcase scale; wasteful once pet/owner counts grow.

**Direction if picked up:** filter `Pet.find` to only pets that could still need
rolling, e.g.
`$or: [{ lastRolledNeedDate: { $exists: false } }, { lastRolledNeedDate: { $lt: maxLocalTodayUtc } }]`,
where `maxLocalTodayUtc` is the latest local-today (UTC-midnight) across all owner
timezones. Any pet that still needs a roll has
`lastRolledNeedDate < its owner's todayUtc <= maxLocalTodayUtc`, so it is always
included; the in-loop per-pet guard still re-checks, so over-inclusion stays safe.

**Why not now:** do not touch the just-fixed catch-up path for a non-issue at
current scale — the change carries regression risk (it gates the scan) for no
real-world benefit yet. Existing `needRollover.test.js` integration cases must all
stay green if/when this lands, and add a case asserting a pet with a stale
`lastRolledNeedDate` is still rolled after the narrowed query.

---

## Note: integration tests need a reachable MongoDB

`__tests__/needRollover.test.js` (and other integration suites) connect to
`mongodbUri` from `utils/config` in `before()` and wipe `User` / `Pet` in
`beforeEach` / `after`. They are **not** pure unit tests — they need a real test
database reachable via `TEST_MONGODB_URI` (see project memory:
"Server test & need-model gotchas"). `npm test` passes only when that DB is
reachable.

When probing rollover behavior ad hoc, do **not** run throwaway scripts against
the configured DB with `deleteMany({})` — that risks wiping real data. Add a
scoped test to `needRollover.test.js` (which has proper setup/teardown) instead,
or stand up a disposable local Mongo and point `TEST_MONGODB_URI` at it.
