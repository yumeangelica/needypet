const Pet = require('../models/petModel');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const ROLLOVER_LOOKBACK_MINUTES = 30;
let rolloverJobRunning = false;

/**
 * @description Completes the daily task if the total quantity or duration is greater than or equal to the need quantity or duration
 * @param {*} need
 * @returns
 */
const dailyTaskCompleter = (need) => {
  if (!need.careRecords) {
    // If there are no care records, return false
    return false;
  }

  if (need.completed) {
    // If the need is already completed, return
    return;
  }

  const taskType = need.quantity?.value
    ? 'quantity'
    : need.duration?.value
      ? 'duration'
      : null; // Check if the need is quantity or duration

  switch (taskType) {
    case 'quantity': {
      const totalQuantity = need.careRecords.reduce(
        (total, record) => total + (record.quantity?.value ?? 0),
        0,
      ); // Calculate the total quantity, skipping records without a quantity
      if (totalQuantity >= need.quantity.value) {
        // If the total quantity is greater than or equal to the need quantity, set the need as completed
        need.completed = true;
      }

      break;
    }

    case 'duration': {
      const totalDuration = need.careRecords.reduce(
        (total, record) => total + (record.duration?.value ?? 0),
        0,
      ); // Calculate the total duration, skipping records without a duration
      if (totalDuration >= need.duration.value) {
        // If the total duration is greater than or equal to the need duration, set the
        need.completed = true;
      }

      break;
    }

    default:
      break;
  }
};

/**
 * @description Checks if the given timezone is valid
 * @param {*} timezone
 * @returns true or false
 */
const tzIdentifierChecker = (timezone) => {
  // Timezone is in format 'Europe/Helsinki'
  const timezones = Intl.supportedValuesOf('timeZone');
  return timezones.includes(timezone); // Check if the timezone is valid
};

/**
 * @description Checks the local date by timezone, returns the formatted date
 * @param {*} timezone
 * @returns formatted date in 'YYYY-MM-DD' format
 */
const checkLocalDateByTimezone = (timezone) => {
  if (!Intl.supportedValuesOf('timeZone').includes(timezone)) {
    throw new Error('Invalid timezone');
  }

  const newDate = dayjs().tz(timezone);
  const formattedDate = newDate.format('YYYY-MM-DD');
  return formattedDate;
};

/**
 * @description Returns the IANA timezones whose local calendar date changed
 * during the recent cron window. Comparing local dates instead of requiring
 * local 00:00 also catches DST transitions that skip midnight entirely.
 *
 * NOTE: the production cron no longer gates the rollover on this window - it
 * scans owners every tick and relies on the durable `lastRolledNeedDate` guard
 * (see updatePetNeedstoNextDays). This helper is retained for the DST/offset
 * regression tests that assert the midnight-window logic.
 * @returns {string[]} timezones currently within the post-midnight window
 */
const getMidnightTimezones = (
  referenceTime = dayjs(),
  lookbackMinutes = ROLLOVER_LOOKBACK_MINUTES,
) => {
  const now = dayjs.isDayjs(referenceTime)
    ? referenceTime
    : dayjs(referenceTime);
  const previous = now.subtract(lookbackMinutes, 'minute');
  const timezones = Intl.supportedValuesOf('timeZone');
  return timezones.filter((timezone) => {
    const localNow = now.tz(timezone);
    const localPrevious = previous.tz(timezone);
    return localPrevious.format('YYYY-MM-DD') !== localNow.format('YYYY-MM-DD');
  });
};

/**
 * @description Converts a calendar day to the storage convention used for need
 * dates: UTC midnight of that day (see normalizeNeedDateForStorage in
 * petController). Keeping a single convention means need.dateFor always
 * serializes to the intended 'YYYY-MM-DD' regardless of the server's timezone.
 * @param {dayjs.Dayjs} day - any dayjs instance whose calendar day is wanted
 * @returns {Date} a Date at UTC midnight of that calendar day
 */
const toStoredNeedDate = (day) =>
  new Date(Date.UTC(day.year(), day.month(), day.date()));

const isSameStoredDay = (date, day) =>
  dayjs.utc(date).startOf('day').isSame(day, 'day');

const measureKey = (need) => {
  if (need.duration?.value != null || need.duration?.unit) {
    return {
      type: 'duration',
      value: need.duration?.value,
      unit: need.duration?.unit,
    };
  }

  if (need.quantity?.value != null || need.quantity?.unit) {
    return {
      type: 'quantity',
      value: need.quantity?.value,
      unit: need.quantity?.unit,
    };
  }

  return { type: 'none' };
};

const needTemplateKey = (need) =>
  JSON.stringify({
    category: need.category,
    description: need.description || '',
    measure: measureKey(need),
  });

const hasNeedForTemplateOnDay = (needs, template, day, todayUtc) =>
  needs.some((need) => {
    if (needTemplateKey(need) !== needTemplateKey(template)) {
      return false;
    }

    if (!isSameStoredDay(need.dateFor, day)) {
      return false;
    }

    if (day.isSame(todayUtc, 'day')) {
      return need.isActive && !need.archived;
    }

    return true;
  });

/**
 * @description Rolls a single pet forward to the given local "today": archives
 * active needs whose day has passed and generates a fresh, unfulfilled need for
 * each missing day up to today. Idempotent - needs that already cover today (or
 * the future) are left untouched, so re-running within the same local day is a
 * no-op.
 *
 * Need dates are stored as UTC midnight of the local calendar day, so both the
 * comparison and the generated dates are computed in UTC to stay independent of
 * the server's own timezone.
 *
 * TODO: archived needs are never pruned, so pet.needs grows ~1 entry per
 * recurring template per day and will eventually approach MongoDB's 16 MB
 * document cap. Add a retention sweep (or move history to its own collection)
 * before this runs long-term at scale.
 * @param {*} pet - a Mongoose pet document
 * @param {dayjs.Dayjs} localToday - start of the current day in the pet's timezone
 * @returns {boolean} true if the pet was modified and should be saved
 */
const rollPetNeedsForward = (pet, localToday) => {
  let needsUpdated = false;

  // The current calendar day expressed in the storage convention (UTC midnight).
  const todayUtc = dayjs.utc(toStoredNeedDate(localToday));

  // Durable idempotency guard: if this pet was already rolled for today's local
  // day, skip. Lets a VersionError-skipped roll be safely retried next tick and
  // keeps the job idempotent across multiple Node instances. A future or equal
  // stored value also guards against an owner moving to an earlier timezone.
  if (
    pet.lastRolledNeedDate &&
    dayjs
      .utc(pet.lastRolledNeedDate)
      .startOf('day')
      .isSameOrAfter(todayUtc, 'day')
  ) {
    return false;
  }

  // Archive inactive past needs; collect active ones to evaluate.
  const activeNeeds = pet.needs.reduce((acc, need) => {
    const needDay = dayjs.utc(need.dateFor).startOf('day');

    if (!need.archived && !need.isActive) {
      if (needDay.isBefore(todayUtc, 'day')) {
        need.archived = true;
        needsUpdated = true;
      }
    } else if (!need.archived && need.isActive) {
      acc.push(need);
    }
    return acc;
  }, []);

  activeNeeds.forEach((need) => {
    // Stored dates are UTC midnight, so read them back in UTC.
    const needDay = dayjs.utc(need.dateFor).startOf('day');

    // Need already covers today or a future day - nothing to roll over.
    if (needDay.isSameOrAfter(todayUtc, 'day')) {
      return;
    }

    needsUpdated = true;
    need.archived = true;
    need.isActive = false;

    const template = JSON.parse(JSON.stringify(need)); // Deep copy to seed the new needs
    const daysMissed = todayUtc.diff(needDay, 'day');

    // Generate one need per missed day, anchored on today so the active need
    // lands exactly on today (counting back for earlier gaps).
    for (let i = daysMissed - 1; i >= 0; i--) {
      const isToday = i === 0;
      const targetDay = todayUtc.subtract(i, 'day');

      if (hasNeedForTemplateOnDay(pet.needs, template, targetDay, todayUtc)) {
        continue;
      }

      // Build the new need field-by-field rather than spreading `template`:
      // `frequency` is intentionally not propagated, and care state must reset.
      let newNeed = {
        dateFor: toStoredNeedDate(targetDay),
        archived: !isToday, // Only today's need stays open
        isActive: isToday,
        category: template.category,
        completed: false,
        careRecords: [],
        description: template.description,
      };
      if (template.duration) {
        newNeed = { ...newNeed, duration: template.duration };
      } else if (template.quantity) {
        newNeed = { ...newNeed, quantity: template.quantity };
      }

      pet.needs.push(newNeed);
    }
  });

  // Stamp the durable guard alongside the changes so the same save persists it.
  // Only stamped when work happened; an already-current pet stays a cheap no-op
  // (no save) because its active "today" need already short-circuits the rolls.
  if (needsUpdated) {
    pet.lastRolledNeedDate = toStoredNeedDate(localToday);
  }

  return needsUpdated;
};

/**
 * @description Processes and archives past days' pet needs for users whose
 * timezone has just rolled past midnight, generating fresh tasks for the new
 * day. Shared pets roll over only from the owner's timezone, matching the
 * record-entry date check.
 * @returns {Promise<void>}
 */
const updatePetNeedstoNextDays = async (referenceTime = dayjs()) => {
  const User = require('../models/userModel');

  if (rolloverJobRunning) {
    return;
  }

  rolloverJobRunning = true;

  try {
    const now = dayjs.isDayjs(referenceTime)
      ? referenceTime
      : dayjs(referenceTime);
    // Roll pets by owner timezone only. We intentionally scan owners on every
    // tick instead of relying on a short midnight window: lastRolledNeedDate is
    // the durable idempotency guard, so a delayed cron or server restart after
    // midnight can still catch up the same day.
    const owners = await User.find({}).select('_id timezone');

    if (owners.length === 0) {
      return;
    }

    const ownerTimezone = new Map(
      owners.map((owner) => [owner._id.toString(), owner.timezone]),
    );

    // Precompute each owner timezone's local "today" once.
    const ownerTimezones = [
      ...new Set(owners.map((owner) => owner.timezone).filter(Boolean)),
    ];
    const localTodayByTz = new Map(
      ownerTimezones.map((tz) => [tz, now.tz(tz).startOf('day')]),
    );

    const pets = await Pet.find({
      owner: { $in: owners.map((owner) => owner._id) },
    });

    for (const pet of pets) {
      const tz = ownerTimezone.get(pet.owner.toString());
      const localToday = localTodayByTz.get(tz);
      try {
        if (localToday && rollPetNeedsForward(pet, localToday)) {
          await pet.save({ validateModifiedOnly: true }); // eslint-disable-line no-await-in-loop
        }
      } catch (error) {
        if (error.name === 'VersionError') {
          console.warn('Skipped pet need rollover after concurrent save', {
            petId: pet._id.toString(),
          });
        } else {
          console.error('Error rolling pet needs forward', {
            petId: pet._id.toString(),
            error,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in updatePetNeedstoNextDays', error);
  } finally {
    rolloverJobRunning = false;
  }
};

module.exports = {
  dailyTaskCompleter,
  tzIdentifierChecker,
  updatePetNeedstoNextDays,
  checkLocalDateByTimezone,
  getMidnightTimezones,
  rollPetNeedsForward,
};
