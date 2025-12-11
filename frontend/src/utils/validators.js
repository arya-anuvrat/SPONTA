/**
 * Validation utilities for email, password, and other inputs
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: "Email is required" };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  // Check for common invalid patterns
  if (trimmedEmail.startsWith("@") || trimmedEmail.endsWith("@")) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes("..")) {
    return { valid: false, error: "Email cannot contain consecutive dots" };
  }

  // Check length (reasonable limits)
  if (trimmedEmail.length > 254) {
    return { valid: false, error: "Email address is too long" };
  }

  return { valid: true };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, error?: string, strength?: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { 
      valid: false, 
      error: "Password must be at least 8 characters long",
      strength: "weak"
    };
  }

  if (password.length < 12) {
    // Check for basic requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const requirementsMet = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (requirementsMet < 3) {
      return {
        valid: false,
        error: "Password must contain at least 3 of: uppercase, lowercase, number, special character",
        strength: "weak"
      };
    }

    return { valid: true, strength: "medium" };
  }

  // Strong password (12+ characters)
  return { valid: true, strength: "strong" };
};

/**
 * Validates password confirmation matches
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }

  return { valid: true };
};

/**
 * Get password strength indicator
 * @param {string} password - Password to check
 * @returns {string} "weak" | "medium" | "strong"
 */
export const getPasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return "weak";
  }

  if (password.length < 12) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const requirementsMet = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    return requirementsMet >= 3 ? "medium" : "weak";
  }

  return "strong";
};

