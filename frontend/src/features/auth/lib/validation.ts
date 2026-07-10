export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Client-side mirror of the backend's password_strength_validator so users get
 * immediate feedback. The backend remains the source of truth on submit.
 * Returns an error message, or null if the password is strong enough.
 */
export function getPasswordStrengthError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  const missing: string[] = [];
  if (!/[a-z]/.test(password)) missing.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) missing.push("an uppercase letter");
  if (!/\d/.test(password)) missing.push("a number");
  if (missing.length) return `Password must include ${missing.join(", ")}.`;
  return null;
}
