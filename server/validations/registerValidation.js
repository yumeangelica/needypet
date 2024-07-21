const { z } = require('zod');
const { tzIdentifierChecker } = require('../helper');

const userNameSchema = z.string().min(3).max(40, { message: 'Username must be between 3 and 40 characters' });
const emailSchema = z.string().min(6).max(100).email({ message: 'Invalid email format' });
const newPasswordSchema = z.string().min(10).max(100, { message: 'Password must be between 10 and 100 characters' });
const timezoneSchema = z.string().refine(tzIdentifierChecker, {
  message: 'Invalid timezone',
});

const registerSchema = z.object({
  userName: userNameSchema,
  email: emailSchema,
  newPassword: newPasswordSchema,
  timezone: timezoneSchema,
});

const registerValidation = data => {
  try {
    return registerSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }

    throw new Error('Unknown error during validation');
  }
};

module.exports = registerValidation;
