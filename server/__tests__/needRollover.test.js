const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { mongodbUri } = require('../utils/config');
const User = require('../models/userModel');
const Pet = require('../models/petModel');
const {
  rollPetNeedsForward,
  getMidnightTimezones,
  updatePetNeedstoNextDays,
} = require('../helper');

dayjs.extend(utc);
dayjs.extend(timezone);

before(async () => {
  await mongoose.connect(mongodbUri);
});

after(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
});

// Need dates are stored as UTC midnight of the calendar day (see
// normalizeNeedDateForStorage in petController). Build seed dates the same way
// so tests model real stored data.
const utcDay = (offsetDays = 0) => {
  const d = dayjs.utc().startOf('day').subtract(offsetDays, 'day');
  return new Date(Date.UTC(d.year(), d.month(), d.date()));
};

const storedLocalDay = (referenceTime, tz, offsetDays = 0) => {
  const d = referenceTime.tz(tz).startOf('day').subtract(offsetDays, 'day');
  return new Date(Date.UTC(d.year(), d.month(), d.date()));
};

// The 'YYYY-MM-DD' a stored date serializes to (matches the toJSON transform).
const ymd = (date) => date.toISOString().split('T')[0];

// Builds an in-memory pet document (not saved) with a single active need on the
// given day offset relative to today in UTC (positive = days in the past).
const makePetWithNeed = (daysAgo, overrides = {}, petOverrides = {}) => {
  return new Pet({
    name: 'Milo',
    species: 'Cat',
    ...petOverrides,
    needs: [
      {
        dateFor: utcDay(daysAgo),
        category: 'Walk',
        description: 'Morning walk',
        duration: { value: 40, unit: 'minutes' },
        isActive: true,
        archived: false,
        completed: false,
        careRecords: [],
        ...overrides,
      },
    ],
  });
};

// localToday as the cron passes it: start of day in some timezone. The roll
// logic must normalise this to the UTC-midnight storage convention internally.
const localTodayInTz = (tz = 'UTC') => dayjs().tz(tz).startOf('day');

describe('rollPetNeedsForward', () => {
  it("archives yesterday's need and creates a fresh active need for today", () => {
    const pet = makePetWithNeed(1);

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, true);
    // Original need is now archived and inactive.
    const original = pet.needs[0];
    assert.equal(original.archived, true);
    assert.equal(original.isActive, false);

    // Exactly one fresh active need for today, unfulfilled with no records.
    const activeNeeds = pet.needs.filter((n) => n.isActive && !n.archived);
    assert.equal(activeNeeds.length, 1);
    const todayNeed = activeNeeds[0];
    // Generated date follows the UTC-midnight storage convention.
    assert.equal(ymd(todayNeed.dateFor), ymd(utcDay(0)));
    assert.equal(todayNeed.completed, false);
    assert.equal(todayNeed.careRecords.length, 0);
    assert.equal(todayNeed.category, 'Walk');
    assert.equal(todayNeed.duration.value, 40);
  });

  it('fills a multi-day gap with archived intermediate days and one active today', () => {
    const pet = makePetWithNeed(3); // App "down" for 3 days

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, true);
    // 1 original + 3 generated (days -2, -1, today) = 4 total.
    assert.equal(pet.needs.length, 4);

    const activeNeeds = pet.needs.filter((n) => n.isActive && !n.archived);
    assert.equal(activeNeeds.length, 1);
    assert.equal(ymd(activeNeeds[0].dateFor), ymd(utcDay(0)));

    // The generated days are exactly yesterday, the day before, and today.
    const generatedDays = pet.needs
      .slice(1)
      .map((n) => ymd(n.dateFor))
      .sort();
    assert.deepEqual(
      generatedDays,
      [ymd(utcDay(2)), ymd(utcDay(1)), ymd(utcDay(0))].sort(),
    );

    // All non-active needs are archived.
    const nonActive = pet.needs.filter((n) => !n.isActive);
    assert.equal(
      nonActive.every((n) => n.archived === true),
      true,
    );
  });

  it('is idempotent - a need already covering today is left untouched', () => {
    const pet = makePetWithNeed(0); // Need already for today

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, false);
    assert.equal(pet.needs.length, 1);
    assert.equal(pet.needs[0].isActive, true);
    assert.equal(pet.needs[0].archived, false);
  });

  it('leaves a future need untouched', () => {
    const pet = makePetWithNeed(-2); // Need two days in the future

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, false);
    assert.equal(pet.needs.length, 1);
    assert.equal(pet.needs[0].isActive, true);
  });

  it('archives inactive needs without regenerating them', () => {
    const pet = makePetWithNeed(1, { isActive: false });

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, true);
    assert.equal(pet.needs.length, 1); // No new need generated
    assert.equal(pet.needs[0].archived, true);
  });

  it('does not archive inactive needs for today or the future', () => {
    const pet = makePetWithNeed(0, { isActive: false });
    pet.needs.push({
      dateFor: utcDay(-1),
      category: 'Brush',
      description: 'Evening brush',
      duration: { value: 10, unit: 'minutes' },
      isActive: false,
      archived: false,
      completed: false,
      careRecords: [],
    });

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, false);
    assert.equal(pet.needs[0].archived, false);
    assert.equal(pet.needs[1].archived, false);
  });

  it('does not duplicate today when stale and current active needs already exist', () => {
    const pet = makePetWithNeed(2);
    pet.needs.push({
      dateFor: utcDay(0),
      category: 'Walk',
      description: 'Morning walk',
      duration: { value: 40, unit: 'minutes' },
      isActive: true,
      archived: false,
      completed: false,
      careRecords: [],
    });

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, true);
    const activeWalksToday = pet.needs.filter(
      (need) =>
        need.isActive &&
        !need.archived &&
        need.category === 'Walk' &&
        ymd(need.dateFor) === ymd(utcDay(0)),
    );
    assert.equal(activeWalksToday.length, 1);
    const generatedYesterday = pet.needs.find(
      (need) => ymd(need.dateFor) === ymd(utcDay(1)),
    );
    assert.ok(generatedYesterday);
    assert.equal(generatedYesterday.archived, true);
  });

  it('preserves quantity-type needs when rolling forward', () => {
    const pet = makePetWithNeed(1, {
      duration: undefined,
      quantity: { value: 200, unit: 'ml' },
    });

    rollPetNeedsForward(pet, localTodayInTz());

    const todayNeed = pet.needs.find((n) => n.isActive && !n.archived);
    assert.equal(todayNeed.quantity.value, 200);
    assert.equal(todayNeed.quantity.unit, 'ml');
  });

  it('generates dates in the storage convention for a non-UTC timezone', () => {
    // Even when the cron passes a timezone whose midnight is not UTC midnight,
    // the generated date must still be UTC midnight of that local calendar day.
    const tz = 'Asia/Kolkata'; // UTC+5:30
    const pet = makePetWithNeed(1);

    rollPetNeedsForward(pet, localTodayInTz(tz));

    const todayNeed = pet.needs.find((n) => n.isActive && !n.archived);
    const expected = dayjs().tz(tz).format('YYYY-MM-DD');
    assert.equal(ymd(todayNeed.dateFor), expected);
  });

  it("stamps lastRolledNeedDate with today's stored day after rolling", () => {
    const pet = makePetWithNeed(1);

    rollPetNeedsForward(pet, localTodayInTz());

    assert.ok(pet.lastRolledNeedDate);
    assert.equal(ymd(pet.lastRolledNeedDate), ymd(utcDay(0)));
  });

  it('short-circuits when lastRolledNeedDate already covers today', () => {
    // Simulates a VersionError-skipped pet whose winning save already stamped
    // today: the retry must be a no-op even though a stale active need lingers.
    const pet = makePetWithNeed(1);
    pet.lastRolledNeedDate = utcDay(0);

    const changed = rollPetNeedsForward(pet, localTodayInTz());

    assert.equal(changed, false);
    assert.equal(pet.needs.length, 1);
    assert.equal(pet.needs[0].archived, false);
  });
});

describe('getMidnightTimezones', () => {
  it('returns timezones whose local date changed during the rollover window', () => {
    const now = dayjs();
    const result = getMidnightTimezones(now);
    assert.equal(Array.isArray(result), true);
    result.forEach((tz) => {
      assert.notEqual(
        now.subtract(30, 'minute').tz(tz).format('YYYY-MM-DD'),
        now.tz(tz).format('YYYY-MM-DD'),
      );
    });
  });

  it('catches 45-minute-offset zones at local midnight', () => {
    const result = getMidnightTimezones(dayjs.utc('2026-06-25T18:15:00.000Z'));

    assert.ok(result.includes('Asia/Katmandu'));
  });

  it('catches DST spring-forward days that skip local midnight', () => {
    const result = getMidnightTimezones(dayjs.utc('2026-04-23T22:00:00.000Z'));

    assert.ok(result.includes('Africa/Cairo'));
  });

  it('does not treat a repeated midnight during fall-back as a new day', () => {
    const firstMidnight = getMidnightTimezones(
      dayjs.utc('2026-11-01T04:00:00.000Z'),
    );
    const repeatedMidnight = getMidnightTimezones(
      dayjs.utc('2026-11-01T05:00:00.000Z'),
    );

    assert.ok(firstMidnight.includes('America/Havana'));
    assert.equal(repeatedMidnight.includes('America/Havana'), false);
  });
});

describe('updatePetNeedstoNextDays (integration)', () => {
  it('rolls over pets for an owner whose timezone just passed midnight', async () => {
    const tz = 'Europe/Helsinki';
    const referenceTime = dayjs.utc('2026-06-25T21:00:00.000Z');

    const user = await User.create({
      userName: 'rolloverUser',
      email: 'rollover@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: tz,
    });

    // Seed a need for the local "yesterday" in the storage convention.
    const pet = makePetWithNeed(
      0,
      {
        dateFor: storedLocalDay(referenceTime, tz, 1),
      },
      { owner: user._id },
    );
    await pet.save();
    user.pets = [pet._id];
    await user.save();

    await updatePetNeedstoNextDays(referenceTime);

    const updated = await Pet.findById(pet._id);
    const activeNeeds = updated.needs.filter((n) => n.isActive && !n.archived);
    assert.equal(activeNeeds.length, 1);
    const expectedToday = referenceTime.tz(tz).format('YYYY-MM-DD');
    assert.equal(ymd(activeNeeds[0].dateFor), expectedToday);

    // Running again in the same local day must not create duplicates.
    await updatePetNeedstoNextDays(referenceTime);
    const reChecked = await Pet.findById(pet._id);
    const stillOneActive = reChecked.needs.filter(
      (n) => n.isActive && !n.archived,
    );
    assert.equal(stillOneActive.length, 1);
  });

  it('does not roll a shared pet from a caretaker timezone', async () => {
    const ownerTz = 'America/Los_Angeles';
    const caretakerTz = 'Asia/Tokyo';
    const caretakerMidnight = dayjs.utc('2026-06-25T15:00:00.000Z');
    const ownerMidnight = dayjs.utc('2026-06-26T07:00:00.000Z');

    const owner = await User.create({
      userName: 'ownerUser',
      email: 'owner@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: ownerTz,
    });
    const caretaker = await User.create({
      userName: 'caretakerUser',
      email: 'caretaker@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: caretakerTz,
    });
    const pet = makePetWithNeed(
      0,
      {
        dateFor: storedLocalDay(caretakerMidnight, ownerTz),
      },
      { owner: owner._id, careTakers: [caretaker._id] },
    );
    await pet.save();
    owner.pets = [pet._id];
    caretaker.pets = [pet._id];
    await owner.save();
    await caretaker.save();

    await updatePetNeedstoNextDays(caretakerMidnight);

    const afterCaretakerMidnight = await Pet.findById(pet._id);
    const activeBeforeOwnerMidnight = afterCaretakerMidnight.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(activeBeforeOwnerMidnight.length, 1);
    assert.equal(
      ymd(activeBeforeOwnerMidnight[0].dateFor),
      caretakerMidnight.tz(ownerTz).format('YYYY-MM-DD'),
    );

    await updatePetNeedstoNextDays(ownerMidnight);

    const afterOwnerMidnight = await Pet.findById(pet._id);
    const activeAfterOwnerMidnight = afterOwnerMidnight.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(activeAfterOwnerMidnight.length, 1);
    assert.equal(
      ymd(activeAfterOwnerMidnight[0].dateFor),
      ownerMidnight.tz(ownerTz).format('YYYY-MM-DD'),
    );
  });

  it('rolls over on a DST day that skips local midnight', async () => {
    const tz = 'Africa/Cairo';
    const referenceTime = dayjs.utc('2026-04-23T22:00:00.000Z');

    const user = await User.create({
      userName: 'dstUser',
      email: 'dst@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: tz,
    });
    const pet = makePetWithNeed(
      0,
      {
        dateFor: storedLocalDay(referenceTime, tz, 1),
      },
      { owner: user._id },
    );
    await pet.save();
    user.pets = [pet._id];
    await user.save();

    await updatePetNeedstoNextDays(referenceTime);

    const updated = await Pet.findById(pet._id);
    const activeNeeds = updated.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(activeNeeds.length, 1);
    assert.equal(ymd(activeNeeds[0].dateFor), '2026-04-24');
  });

  it('does not duplicate today across a fall-back repeated midnight', async () => {
    // America/Havana repeats local midnight on 2026-11-01 (00:00 occurs at both
    // 04:00Z and 05:00Z). Both runs land on the same local day, so the second
    // must not create a second active today need.
    const tz = 'America/Havana';
    const firstMidnight = dayjs.utc('2026-11-01T04:00:00.000Z');
    const repeatedMidnight = dayjs.utc('2026-11-01T05:00:00.000Z');

    const user = await User.create({
      userName: 'fallbackUser',
      email: 'fallback@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: tz,
    });
    const pet = makePetWithNeed(
      0,
      { dateFor: storedLocalDay(firstMidnight, tz, 1) },
      { owner: user._id },
    );
    await pet.save();
    user.pets = [pet._id];
    await user.save();

    await updatePetNeedstoNextDays(firstMidnight);
    await updatePetNeedstoNextDays(repeatedMidnight);

    const updated = await Pet.findById(pet._id);
    const activeNeeds = updated.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(activeNeeds.length, 1);
    assert.equal(ymd(activeNeeds[0].dateFor), '2026-11-01');
  });

  it('does not duplicate today across two ticks within the lookback window', async () => {
    // The 30-minute lookback is wider than the 15-minute cron interval, so a
    // zone is flagged on two consecutive ticks (00:00 and 00:15 local). The
    // second tick must be a no-op.
    const tz = 'Europe/Helsinki';
    const firstTick = dayjs.utc('2026-06-25T21:00:00.000Z'); // 00:00 local
    const secondTick = dayjs.utc('2026-06-25T21:15:00.000Z'); // 00:15 local

    const user = await User.create({
      userName: 'overlapUser',
      email: 'overlap@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: tz,
    });
    const pet = makePetWithNeed(
      0,
      { dateFor: storedLocalDay(firstTick, tz, 1) },
      { owner: user._id },
    );
    await pet.save();
    user.pets = [pet._id];
    await user.save();

    await updatePetNeedstoNextDays(firstTick);
    await updatePetNeedstoNextDays(secondTick);

    const updated = await Pet.findById(pet._id);
    const activeNeeds = updated.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(activeNeeds.length, 1);
    assert.equal(
      ymd(activeNeeds[0].dateFor),
      firstTick.tz(tz).format('YYYY-MM-DD'),
    );
  });

  it('rolls over even when the cron resumes after the midnight lookback window', async () => {
    const tz = 'Europe/Helsinki';
    const lateTick = dayjs.utc('2026-06-25T21:31:00.000Z'); // 00:31 local

    assert.equal(getMidnightTimezones(lateTick).includes(tz), false);

    const user = await User.create({
      userName: 'lateUser',
      email: 'late@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: tz,
    });
    const pet = makePetWithNeed(
      0,
      { dateFor: storedLocalDay(lateTick, tz, 1) },
      { owner: user._id },
    );
    await pet.save();
    user.pets = [pet._id];
    await user.save();

    await updatePetNeedstoNextDays(lateTick);

    const updated = await Pet.findById(pet._id);
    const activeNeeds = updated.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(activeNeeds.length, 1);
    assert.equal(
      ymd(activeNeeds[0].dateFor),
      lateTick.tz(tz).format('YYYY-MM-DD'),
    );
  });

  it('uses the new timezone when the owner moves between rollovers', async () => {
    // Owner starts in Tokyo (rolls first), then moves west to Los Angeles. The
    // next rollover must use the new zone without retro-generating or
    // duplicating the active today need.
    const tokyoMidnight = dayjs.utc('2026-06-25T15:00:00.000Z'); // 00:00 Tokyo 06-26
    const laMidnight = dayjs.utc('2026-06-27T07:00:00.000Z'); // 00:00 LA 06-27

    const user = await User.create({
      userName: 'moverUser',
      email: 'mover@example.com',
      passwordHash: 'x'.repeat(20),
      timezone: 'Asia/Tokyo',
    });
    const pet = makePetWithNeed(
      0,
      { dateFor: storedLocalDay(tokyoMidnight, 'Asia/Tokyo', 1) },
      { owner: user._id },
    );
    await pet.save();
    user.pets = [pet._id];
    await user.save();

    await updatePetNeedstoNextDays(tokyoMidnight);

    const afterTokyo = await Pet.findById(pet._id);
    const tokyoActive = afterTokyo.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(tokyoActive.length, 1);
    assert.equal(
      ymd(tokyoActive[0].dateFor),
      tokyoMidnight.tz('Asia/Tokyo').format('YYYY-MM-DD'),
    );

    // Owner relocates; the next local midnight is Los Angeles'.
    user.timezone = 'America/Los_Angeles';
    await user.save();

    await updatePetNeedstoNextDays(laMidnight);

    const afterLa = await Pet.findById(pet._id);
    const laActive = afterLa.needs.filter(
      (need) => need.isActive && !need.archived,
    );
    assert.equal(laActive.length, 1);
    assert.equal(
      ymd(laActive[0].dateFor),
      laMidnight.tz('America/Los_Angeles').format('YYYY-MM-DD'),
    );
  });
});
