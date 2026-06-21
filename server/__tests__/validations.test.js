const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const needValidation = require('../validations/needValidation');
const recordValidation = require('../validations/recordValidation');
const loginValidation = require('../validations/loginValidation');
const registerValidation = require('../validations/registerValidation');
const updateUserValidation = require('../validations/updateUserValidation');
const passwordStrengthValidation = require('../validations/passwordStrengthValidation');

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
      needValidation({
        ...validNeed(),
        duration: { value: 10, unit: 'hours' },
      }),
    );
  });

  it('rejects a duration over 1440 minutes', () => {
    assert.throws(() =>
      needValidation({
        ...validNeed(),
        duration: { value: 5000, unit: 'minutes' },
      }),
    );
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

  it('accepts a need with an empty description', () => {
    assert.doesNotThrow(() =>
      needValidation({
        category: 'Walk',
        description: '',
        dateFor: new Date('2026-06-09'),
      }),
    );
  });

  it('accepts a valid quantity need (ml)', () => {
    assert.doesNotThrow(() =>
      needValidation({
        category: 'Feeding',
        description: 'Meal',
        dateFor: new Date('2026-06-09'),
        quantity: { value: 200, unit: 'ml' },
      }),
    );
  });

  it('accepts a valid quantity need (g)', () => {
    assert.doesNotThrow(() =>
      needValidation({
        category: 'Feeding',
        description: 'Meal',
        dateFor: new Date('2026-06-09'),
        quantity: { value: 100, unit: 'g' },
      }),
    );
  });

  it('rejects a category over 50 characters', () => {
    assert.throws(() =>
      needValidation({
        ...validNeed(),
        category: 'a'.repeat(51),
      }),
    );
  });

  it('rejects a duration of exactly 1441 minutes', () => {
    assert.throws(() =>
      needValidation({
        ...validNeed(),
        duration: { value: 1441, unit: 'minutes' },
      }),
    );
  });
});

describe('recordValidation', () => {
  it('accepts a valid duration record', () => {
    assert.doesNotThrow(() =>
      recordValidation({ note: '', duration: { value: 10, unit: 'minutes' } }),
    );
  });

  it('accepts a valid quantity record', () => {
    assert.doesNotThrow(() =>
      recordValidation({ note: '', quantity: { value: 100, unit: 'ml' } }),
    );
  });

  it('rejects an invalid quantity unit', () => {
    assert.throws(() =>
      recordValidation({ note: '', quantity: { value: 100, unit: 'liters' } }),
    );
  });

  it('accepts a record with no note', () => {
    assert.doesNotThrow(() =>
      recordValidation({ duration: { value: 30, unit: 'minutes' } }),
    );
  });

  it('rejects a record with an invalid duration unit', () => {
    assert.throws(() =>
      recordValidation({ duration: { value: 30, unit: 'hours' } }),
    );
  });
});

describe('passwordStrengthValidation', () => {
  it('accepts a valid strong password', () => {
    assert.doesNotThrow(() => passwordStrengthValidation('StrongPass1!'));
  });

  it('rejects a password without an uppercase letter', () => {
    assert.throws(() => passwordStrengthValidation('weakpass1!'));
  });

  it('rejects a password without a lowercase letter', () => {
    assert.throws(() => passwordStrengthValidation('WEAKPASS1!'));
  });

  it('rejects a password without a number', () => {
    assert.throws(() => passwordStrengthValidation('WeakPassword!'));
  });

  it('rejects a password without a special character', () => {
    assert.throws(() => passwordStrengthValidation('WeakPassword1'));
  });

  it('rejects a password shorter than 10 characters', () => {
    assert.throws(() => passwordStrengthValidation('Sh0rt!'));
  });

  it('accepts a password at exactly 10 characters with all requirements', () => {
    assert.doesNotThrow(() => passwordStrengthValidation('Valid123!x'));
  });
});

describe('registerValidation', () => {
  const validData = () => ({
    userName: 'testUser',
    email: 'test@example.com',
    newPassword: 'TestPass123!',
    timezone: 'Europe/Helsinki',
  });

  it('accepts valid registration data', () => {
    assert.doesNotThrow(() => registerValidation(validData()));
  });

  it('rejects a userName shorter than 3 characters', () => {
    let error;
    try {
      registerValidation({ ...validData(), userName: 'ab' });
    } catch (e) {
      error = e;
    }
    assert.ok(error);
    const fieldErrors = error.flatten().fieldErrors;
    assert.ok(fieldErrors.userName, 'expected a userName error');
  });

  it('rejects a userName longer than 40 characters', () => {
    assert.throws(() =>
      registerValidation({ ...validData(), userName: 'a'.repeat(41) }),
    );
  });

  it('rejects an invalid email format', () => {
    let error;
    try {
      registerValidation({ ...validData(), email: 'not-an-email' });
    } catch (e) {
      error = e;
    }
    assert.ok(error);
    const fieldErrors = error.flatten().fieldErrors;
    assert.ok(fieldErrors.email, 'expected an email error');
    assert.match(fieldErrors.email[0], /Invalid email/i);
  });

  it('rejects an invalid timezone', () => {
    let error;
    try {
      registerValidation({ ...validData(), timezone: 'Not/ATimezone' });
    } catch (e) {
      error = e;
    }
    assert.ok(error);
    const fieldErrors = error.flatten().fieldErrors;
    assert.ok(fieldErrors.timezone, 'expected a timezone error');
    assert.match(fieldErrors.timezone[0], /Invalid timezone/i);
  });

  it('rejects UTC as a timezone (not in Intl.supportedValuesOf)', () => {
    assert.throws(() =>
      registerValidation({ ...validData(), timezone: 'UTC' }),
    );
  });

  it('rejects a newPassword shorter than 10 characters', () => {
    assert.throws(() =>
      registerValidation({ ...validData(), newPassword: 'Short1!' }),
    );
  });
});

describe('updateUserValidation', () => {
  const validProfileData = () => ({
    userName: 'testUser',
    email: 'test@example.com',
    timezone: 'Europe/Helsinki',
    currentPassword: 'CurrentPass123!',
  });

  const validPasswordData = () => ({
    currentPassword: 'OldPass123!',
    newPassword: 'NewPass456!',
  });

  it('accepts valid profile update data', () => {
    assert.doesNotThrow(() => updateUserValidation(validProfileData()));
  });

  it('accepts a profile update with only currentPassword (other fields optional)', () => {
    assert.doesNotThrow(() =>
      updateUserValidation({ currentPassword: 'CurrentPass123!' }),
    );
  });

  it('rejects missing currentPassword on profile update', () => {
    assert.throws(() => updateUserValidation({ userName: 'newName' }));
  });

  it('accepts valid password update', () => {
    assert.doesNotThrow(() => updateUserValidation(validPasswordData(), true));
  });

  it('rejects a new password shorter than 10 characters on password update', () => {
    assert.throws(() =>
      updateUserValidation(
        { currentPassword: 'OldPass123!', newPassword: 'Short1!' },
        true,
      ),
    );
  });

  it('rejects an invalid timezone on profile update', () => {
    assert.throws(() =>
      updateUserValidation({ ...validProfileData(), timezone: 'Bad/Zone' }),
    );
  });

  it('rejects an invalid email format on profile update', () => {
    let error;
    try {
      updateUserValidation({ ...validProfileData(), email: 'not-valid' });
    } catch (e) {
      error = e;
    }
    assert.ok(error);
    const fieldErrors = error.flatten().fieldErrors;
    assert.ok(fieldErrors.email, 'expected an email error');
  });
});

describe('loginValidation', () => {
  it('accepts valid login data', () => {
    assert.doesNotThrow(() =>
      loginValidation({ userName: 'testUser', password: 'any' }),
    );
  });

  it('rejects a userName shorter than 3 characters', () => {
    assert.throws(() => loginValidation({ userName: 'ab', password: 'any' }));
  });

  it('rejects a missing password', () => {
    assert.throws(() => loginValidation({ userName: 'testUser' }));
  });

  it('rejects missing userName', () => {
    assert.throws(() => loginValidation({ password: 'any' }));
  });
});
