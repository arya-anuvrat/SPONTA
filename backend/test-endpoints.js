/**
 * Simple test script for backend endpoints
 * Run with: node test-endpoints.js
 */

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

// Test function
const testEndpoint = async (method, path, data = null, token = null) => {
  try {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    log(colors.blue, `\n${method} ${path}`);
    if (data) {
      log(colors.yellow, `Body: ${JSON.stringify(data, null, 2)}`);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      log(colors.green, `✅ Status: ${response.status}`);
      log(colors.green, `Response: ${JSON.stringify(result, null, 2)}`);
      return { success: true, data: result };
    } else {
      log(colors.red, `❌ Status: ${response.status}`);
      log(colors.red, `Error: ${JSON.stringify(result, null, 2)}`);
      return { success: false, error: result };
    }
  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Run tests
const runTests = async () => {
  log(colors.blue, '\n🧪 Starting Backend API Tests...\n');
  log(colors.blue, '='.repeat(50));

  // Test 1: Health Check
  log(colors.blue, '\n📋 Test 1: Health Check');
  await testEndpoint('GET', '/health');

  // Test 2: Signup (without Firebase token - will fail but test structure)
  log(colors.blue, '\n📋 Test 2: Signup (Note: Requires Firebase Auth setup)');
  await testEndpoint('POST', '/api/auth/signup', {
    phoneNumber: '+1234567890',
    displayName: 'Test User',
    dateOfBirth: '2000-01-01',
    location: {
      city: 'Test City',
      state: 'Test State',
      country: 'USA',
    },
  });

  // Test 3: Signin without token (should fail)
  log(colors.blue, '\n📋 Test 3: Signin without token (should fail)');
  await testEndpoint('POST', '/api/auth/signin');

  // Test 4: Get me without token (should fail)
  log(colors.blue, '\n📋 Test 4: Get current user without token (should fail)');
  await testEndpoint('GET', '/api/auth/me');

  // Test 5: Invalid endpoint
  log(colors.blue, '\n📋 Test 5: Invalid endpoint (should return 404)');
  await testEndpoint('GET', '/api/invalid');

  log(colors.blue, '\n' + '='.repeat(50));
  log(colors.green, '\n✅ Tests completed!');
  log(colors.yellow, '\n📝 Note: Full authentication tests require Firebase ID tokens from client');
  log(colors.yellow, '   These can be obtained by signing in through the mobile app.\n');
};

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ fetch is not available. Please use Node.js 18+ or install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch(console.error);

