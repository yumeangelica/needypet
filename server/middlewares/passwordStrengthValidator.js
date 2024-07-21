const passwordStrengthValidation = require('../validations/passwordStrengthValidation');
const { z } = require('zod');

/**
 * @description Validates the strength of a password, only strong passwords are allowed
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */

const passwordStrengthValidator = (request, response, next) => {
  const { newPassword } = request.body;

  try {
    passwordStrengthValidation(newPassword);
    console.log('Password is strong');
    next();
  } catch (error) {
    console.log('error', error);
    if (error instanceof z.ZodError) {
      return response.status(422).json({
        message: 'Validation error',
        errorDetails: {
          newPassword: error.errors[0].message,
        },
      });
    }

    next(error);
  }
};

module.exports = passwordStrengthValidator;
