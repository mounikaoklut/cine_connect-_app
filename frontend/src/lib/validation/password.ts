/**
 * Password strength and compliance validator for CineConnect.
 * Requires:
 * 1. At least 8 characters
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one number (0-9)
 * 5. At least one special character (!, @, #, $, %, etc.)
 */

export interface PasswordValidationResult {
  isValid: boolean;
  lengthValid: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number; // 0 to 5
  message: string;
}

export function evaluatePasswordStrength(password: string): PasswordValidationResult {
  const lengthValid = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (lengthValid) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let message = "";
  if (!password) {
    message = "Enter at least 8 characters with upper, lower, number & symbol.";
  } else if (!lengthValid) {
    message = "Too short — use at least 8 characters.";
  } else if (!hasUpper) {
    message = "Add an uppercase letter (A–Z).";
  } else if (!hasLower) {
    message = "Add a lowercase letter (a–z).";
  } else if (!hasNumber) {
    message = "Add a number (0–9).";
  } else if (!hasSpecial) {
    message = "Add a special character (e.g. !, @, #, $).";
  } else if (score < 5) {
    message = "Weak password — please strengthen it.";
  } else {
    message = "Strong password.";
  }

  return {
    isValid: lengthValid && hasUpper && hasLower && hasNumber && hasSpecial,
    lengthValid,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    score,
    message,
  };
}

export function validateStrongPassword(password: string): { isValid: boolean; error?: string } {
  const result = evaluatePasswordStrength(password);
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.message || "Password does not satisfy security requirements.",
    };
  }
  return { isValid: true };
}
