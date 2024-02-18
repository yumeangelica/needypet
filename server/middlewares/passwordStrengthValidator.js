/**
 * @description Validates the strength of a password, only strong passwords are allowed
 * @param {*} request
 * @param {*} response
 * @param {*} next
 * @returns
 */
const passwordStrengthValidator = (request, response, next) => {
  const newPassword = request.body.newPassword;

  if (!newPassword) {
    return response.status(400).json({ error: 'Password is required' });
  }

  // Requirements: at least one lowercase letter, one uppercase letter, one number, one special character and be at least 10 characters long
  const strongPasswordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

  if (!strongPasswordRequirements.test(newPassword)) {
    return response.status(400).json({ error: 'Password does not meet the strength requirements. It must contain at least one lowercase letter, one uppercase letter, one number, one special character and be at least 10 characters long.' });
  }

  next();
};

module.exports = passwordStrengthValidator;
