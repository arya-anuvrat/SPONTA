/**
 * Validation Utilities
 */

const { ValidationError } = require('./errors');

/**
 * Validate required fields
 */
const validateRequired = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      missing.map(field => ({ field, message: `${field} is required` }))
    );
  }
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', [
      { field: 'email', message: 'Email format is invalid' }
    ]);
  }
};

/**
 * Validate phone number format (basic)
 */
const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    throw new ValidationError('Invalid phone number format', [
      { field: 'phoneNumber', message: 'Phone number format is invalid' }
    ]);
  }
};

/**
 * Validate date
 */
const validateDate = (date) => {
  if (date && isNaN(Date.parse(date))) {
    throw new ValidationError('Invalid date format', [
      { field: 'date', message: 'Date format is invalid' }
    ]);
  }
};

/**
 * Validate coordinates
 */
const validateCoordinates = (coordinates) => {
  if (!coordinates) return;
  
  const { latitude, longitude } = coordinates;
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new ValidationError('Invalid coordinates', [
      { field: 'coordinates', message: 'Latitude and longitude must be numbers' }
    ]);
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Invalid latitude', [
      { field: 'latitude', message: 'Latitude must be between -90 and 90' }
    ]);
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Invalid longitude', [
      { field: 'longitude', message: 'Longitude must be between -180 and 180' }
    ]);
  }
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  if (pageNum < 1) {
    throw new ValidationError('Page must be greater than 0', [
      { field: 'page', message: 'Page must be a positive integer' }
    ]);
  }
  
  if (limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limit must be between 1 and 100', [
      { field: 'limit', message: 'Limit must be between 1 and 100' }
    ]);
  }
  
  return { page: pageNum, limit: limitNum };
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePhone,
  validateDate,
  validateCoordinates,
  sanitizeString,
  validatePagination,
};

