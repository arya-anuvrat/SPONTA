/**
 * Debug Setup - Add this to see detailed logs
 * Run: EXPO_DEBUG=true npx expo start
 */

// Enable verbose logging
if (__DEV__) {
  // Log all console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    originalLog('[LOG]', ...args);
  };

  console.error = (...args) => {
    originalError('[ERROR]', ...args);
  };

  console.warn = (...args) => {
    originalWarn('[WARN]', ...args);
  };

  // Log React errors
  const ErrorUtils = require('ErrorUtils');
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[GLOBAL ERROR]', error, 'isFatal:', isFatal);
    originalHandler(error, isFatal);
  });
}

