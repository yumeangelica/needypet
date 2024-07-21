const { z } = require('zod');

const newPasswordSchema = z.string().regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/,
  {
    message: 'Password does not meet the strength requirements. It must contain at least one lowercase letter, one uppercase letter, one number, one special character and be at least 10 characters long.',
  },
);

const passwordStrengthValidation = password => {
  newPasswordSchema.parse(password);
};

module.exports = passwordStrengthValidation;
