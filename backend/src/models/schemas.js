/**
 * Data Validation Schemas
 */

const { ValidationError } = require('../utils/errors');
const { validateRequired, validateEmail, validatePhone, validateCoordinates, sanitizeString } = require('../utils/validators');

/**
 * User Schema Validation
 */
const validateUserSchema = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    // Required for creation: either phoneNumber OR email must be provided
    if (!data.phoneNumber && !data.email) {
      errors.push({ field: 'phoneNumber', message: 'Either phone number or email is required' });
      errors.push({ field: 'email', message: 'Either phone number or email is required' });
    }
    // Display name and date of birth are always required
    validateRequired(data, ['displayName', 'dateOfBirth']);
  }
  
  // Validate phone number
  if (data.phoneNumber) {
    try {
      validatePhone(data.phoneNumber);
    } catch (error) {
      errors.push(...error.errors);
    }
  }
  
  // Validate email if provided
  if (data.email) {
    try {
      validateEmail(data.email);
    } catch (error) {
      errors.push(...error.errors);
    }
  }
  
  // Validate date of birth
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push({ field: 'dateOfBirth', message: 'Invalid date of birth' });
    } else {
      // Check if user is at least 13 years old
      const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365);
      if (age < 13) {
        errors.push({ field: 'dateOfBirth', message: 'User must be at least 13 years old' });
      }
    }
  }
  
  // Validate location if provided
  if (data.location && data.location.coordinates) {
    try {
      validateCoordinates(data.location.coordinates);
    } catch (error) {
      errors.push(...error.errors);
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError('User validation failed', errors);
  }
  
  // Sanitize string fields
  const sanitized = { ...data };
  if (sanitized.displayName) sanitized.displayName = sanitizeString(sanitized.displayName);
  if (sanitized.college?.name) sanitized.college.name = sanitizeString(sanitized.college.name);
  
  return sanitized;
};

/**
 * Challenge Schema Validation
 */
const validateChallengeSchema = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    validateRequired(data, ['title', 'description', 'category', 'difficulty', 'points']);
  }
  
  // Validate category
  const validCategories = ['adventure', 'social', 'creative', 'fitness', 'academic', 'wellness', 'exploration'];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
  }
  
  // Validate difficulty
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
    errors.push({ field: 'difficulty', message: `Difficulty must be one of: ${validDifficulties.join(', ')}` });
  }
  
  // Validate points
  if (data.points !== undefined && (typeof data.points !== 'number' || data.points < 0)) {
    errors.push({ field: 'points', message: 'Points must be a non-negative number' });
  }
  
  // Validate location if provided
  if (data.location && data.location.coordinates) {
    try {
      validateCoordinates(data.location.coordinates);
    } catch (error) {
      errors.push(...error.errors);
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Challenge validation failed', errors);
  }
  
  // Sanitize string fields
  const sanitized = { ...data };
  if (sanitized.title) sanitized.title = sanitizeString(sanitized.title);
  if (sanitized.description) sanitized.description = sanitizeString(sanitized.description);
  
  return sanitized;
};

/**
 * Event Schema Validation
 */
const validateEventSchema = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    validateRequired(data, ['title', 'description', 'startTime', 'location']);
  }
  
  // Validate start time
  if (data.startTime) {
    const startTime = new Date(data.startTime);
    if (isNaN(startTime.getTime())) {
      errors.push({ field: 'startTime', message: 'Invalid start time' });
    } else if (startTime < new Date()) {
      errors.push({ field: 'startTime', message: 'Start time must be in the future' });
    }
  }
  
  // Validate end time
  if (data.endTime && data.startTime) {
    const endTime = new Date(data.endTime);
    const startTime = new Date(data.startTime);
    if (isNaN(endTime.getTime())) {
      errors.push({ field: 'endTime', message: 'Invalid end time' });
    } else if (endTime <= startTime) {
      errors.push({ field: 'endTime', message: 'End time must be after start time' });
    }
  }
  
  // Validate location coordinates
  if (data.location && data.location.coordinates) {
    try {
      validateCoordinates(data.location.coordinates);
    } catch (error) {
      errors.push(...error.errors);
    }
  }
  
  // Validate participants limits
  if (data.maxParticipants !== undefined && data.minParticipants !== undefined) {
    if (data.maxParticipants < data.minParticipants) {
      errors.push({ field: 'maxParticipants', message: 'Max participants must be greater than or equal to min participants' });
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Event validation failed', errors);
  }
  
  // Sanitize string fields
  const sanitized = { ...data };
  if (sanitized.title) sanitized.title = sanitizeString(sanitized.title);
  if (sanitized.description) sanitized.description = sanitizeString(sanitized.description);
  if (sanitized.location?.name) sanitized.location.name = sanitizeString(sanitized.location.name);
  if (sanitized.location?.address) sanitized.location.address = sanitizeString(sanitized.location.address);
  
  return sanitized;
};

module.exports = {
  validateUserSchema,
  validateChallengeSchema,
  validateEventSchema,
};


