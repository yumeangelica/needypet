const { z } = require('zod');

const userNameSchema = z.string().min(3).max(40);
const password = z.string().min(1);

const loginSchema = z.object({
  userName: userNameSchema,
  password,
});

const loginValidation = (data) => {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }

    throw new Error('Unknown error during validation', { cause: error });
  }
};

module.exports = loginValidation;
