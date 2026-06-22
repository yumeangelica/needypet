export const passwordSpecialCharacters = '!@#$%^&*';

export interface PasswordValidationState {
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  minLength: boolean;
}

export const validatePasswordRules = (password: string): PasswordValidationState => ({
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*]/.test(password),
  minLength: password.length >= 10,
});

export const isPasswordValid = (validation: PasswordValidationState): boolean =>
  Object.values(validation).every(Boolean);
