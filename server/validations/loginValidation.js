const { z } = require('zod');

const userNameSchema = z.string().min(3).max(40);
const password = z.string();

const loginSchema = z.object({
  userName: userNameSchema,
  password,
});

const loginValidation = loginSchema.parse;

module.exports = loginValidation;

