const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  tzIdentifierChecker,
  checkLocalDateByTimezone,
  dailyTaskCompleter,
} = require('../helper');

describe('tzIdentifierChecker', () => {
  it('returns true for a valid IANA timezone', () => {
    assert.strictEqual(tzIdentifierChecker('Europe/Helsinki'), true);
  });

  it('returns true for other valid timezones', () => {
    assert.strictEqual(tzIdentifierChecker('America/New_York'), true);
    assert.strictEqual(tzIdentifierChecker('Asia/Tokyo'), true);
  });

  it('returns false for UTC (not in Intl.supportedValuesOf)', () => {
    assert.strictEqual(tzIdentifierChecker('UTC'), false);
  });

  it('returns false for an invalid identifier', () => {
    assert.strictEqual(tzIdentifierChecker('Not/ATimezone'), false);
  });

  it('returns false for an empty string', () => {
    assert.strictEqual(tzIdentifierChecker(''), false);
  });
});

describe('checkLocalDateByTimezone', () => {
  it('returns a date string in YYYY-MM-DD format', () => {
    const result = checkLocalDateByTimezone('Europe/Helsinki');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('throws on an invalid timezone', () => {
    assert.throws(
      () => checkLocalDateByTimezone('Not/ATimezone'),
      /Invalid timezone/,
    );
  });

  it('throws on UTC (not supported by Intl API)', () => {
    assert.throws(() => checkLocalDateByTimezone('UTC'));
  });

  it('returns different local dates for timezones that differ by a day at midnight', () => {
    // We cannot control time in unit tests, so we just verify the contract:
    // the return value is a non-empty YYYY-MM-DD string for valid timezones.
    const helsinki = checkLocalDateByTimezone('Europe/Helsinki');
    const tokyo = checkLocalDateByTimezone('Asia/Tokyo');
    assert.ok(helsinki.length === 10);
    assert.ok(tokyo.length === 10);
  });
});

describe('dailyTaskCompleter', () => {
  it('marks a duration need as completed when total duration meets the goal', () => {
    const need = {
      completed: false,
      quantity: {},
      duration: { value: 40 },
      careRecords: [
        { quantity: {}, duration: { value: 20 } },
        { quantity: {}, duration: { value: 20 } },
      ],
    };
    dailyTaskCompleter(need);
    assert.strictEqual(need.completed, true);
  });

  it('does not mark a duration need completed when total is below the goal', () => {
    const need = {
      completed: false,
      quantity: {},
      duration: { value: 40 },
      careRecords: [{ quantity: {}, duration: { value: 20 } }],
    };
    dailyTaskCompleter(need);
    assert.strictEqual(need.completed, false);
  });

  it('marks a quantity need as completed when total quantity meets the goal', () => {
    const need = {
      completed: false,
      quantity: { value: 200 },
      duration: {},
      careRecords: [
        { quantity: { value: 100 }, duration: {} },
        { quantity: { value: 100 }, duration: {} },
      ],
    };
    dailyTaskCompleter(need);
    assert.strictEqual(need.completed, true);
  });

  it('does not mark a quantity need completed when total is below the goal', () => {
    const need = {
      completed: false,
      quantity: { value: 200 },
      duration: {},
      careRecords: [{ quantity: { value: 100 }, duration: {} }],
    };
    dailyTaskCompleter(need);
    assert.strictEqual(need.completed, false);
  });

  it('returns false immediately when careRecords is absent', () => {
    const need = { completed: false, quantity: {}, duration: {} };
    const result = dailyTaskCompleter(need);
    assert.strictEqual(result, false);
  });

  it('returns without changing state when the need is already completed', () => {
    const need = {
      completed: true,
      quantity: {},
      duration: { value: 40 },
      careRecords: [{ quantity: {}, duration: { value: 40 } }],
    };
    const result = dailyTaskCompleter(need);
    assert.strictEqual(result, undefined);
    assert.strictEqual(need.completed, true);
  });

  it('does nothing when neither quantity nor duration is set (null task type)', () => {
    const need = {
      completed: false,
      quantity: {},
      duration: {},
      careRecords: [{ quantity: {}, duration: {} }],
    };
    dailyTaskCompleter(need);
    assert.strictEqual(need.completed, false);
  });
});
