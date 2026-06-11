const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const needValidation = require('../validations/needValidation');
const recordValidation = require('../validations/recordValidation');

const validNeed = () => ({
  category: 'Walk',
  description: 'Evening walk',
  dateFor: new Date('2026-06-09'),
  duration: { value: 10, unit: 'minutes' },
});

describe('needValidation', () => {
  it('accepts a valid need', () => {
    assert.doesNotThrow(() => needValidation(validNeed()));
  });

  it('rejects a too-short category with a field-level message', () => {
    let error;
    try {
      needValidation({ ...validNeed(), category: 'a' });
    } catch (e) {
      error = e;
    }

    assert.ok(error, 'expected validation to throw');
    const fieldErrors = error.flatten().fieldErrors;
    assert.ok(fieldErrors.category, 'expected a category error');
    assert.match(fieldErrors.category[0], /at least 3 characters/);
  });

  it('rejects an invalid duration unit', () => {
    assert.throws(() =>
      needValidation({ ...validNeed(), duration: { value: 10, unit: 'hours' } }));
  });

  it('rejects a duration over 1440 minutes', () => {
    assert.throws(() =>
      needValidation({ ...validNeed(), duration: { value: 5000, unit: 'minutes' } }));
  });

  it('rejects an invalid quantity unit', () => {
    const need = {
      category: 'Food',
      description: 'Meal',
      dateFor: new Date('2026-06-09'),
      quantity: { value: 100, unit: 'liters' },
    };
    assert.throws(() => needValidation(need));
  });
});

describe('recordValidation', () => {
  it('accepts a valid duration record', () => {
    assert.doesNotThrow(() =>
      recordValidation({ note: '', duration: { value: 10, unit: 'minutes' } }));
  });

  it('accepts a valid quantity record', () => {
    assert.doesNotThrow(() =>
      recordValidation({ note: '', quantity: { value: 100, unit: 'ml' } }));
  });

  it('rejects an invalid quantity unit', () => {
    assert.throws(() =>
      recordValidation({ note: '', quantity: { value: 100, unit: 'liters' } }));
  });
});
