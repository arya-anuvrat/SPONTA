/**
 * API Service - Backend API endpoints and helper functions
 */

// Backend API base URL
// 
// ⚠️ IMPORTANT: This IP address is ONLY for development/testing!
// 
// During development:
// - When testing on your phone with Expo Go, you need your computer's IP
// - This lets your phone connect to the backend running on your computer
// - The IP address changes when you switch WiFi networks
//
// In production:
// - The backend will be deployed to a server (e.g., Heroku, AWS, etc.)
// - The app will use a public URL like: https://api.sponta.com
// - All users will connect to the same production backend
// - No IP address needed - just the production URL
//
// Location tracking uses GPS (not IP addresses) - works the same for everyone!
//
// To find your IP for development: 
//   macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
//   Windows: ipconfig | findstr IPv4

// Use your computer's IP when testing on physical device via Expo Go
// Change 'localhost' to your IP (e.g., '10.138.76.68') when testing on phone
const getApiHost = () => {
  if (process.env.EXPO_PUBLIC_API_HOST) {
    return process.env.EXPO_PUBLIC_API_HOST;
  }
  // Default to localhost for simulator, but warn for physical devices
  if (__DEV__) {
    console.warn('⚠️ EXPO_PUBLIC_API_HOST not set. Using localhost. This will NOT work on physical devices!');
    console.warn('⚠️ Set EXPO_PUBLIC_API_HOST=YOUR_IP in frontend/.env for phone testing');
  }
  return 'localhost';
};

const DEV_API_HOST = __DEV__ ? getApiHost() : null;

const API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:3000/api`
  : (process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.com/api');

// Log API URL for debugging
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

/**
 * Helper function to make API requests
 */
const apiRequest = async (endpoint, options = {}) => {
  const { method = 'GET', body, token, ...restOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...restOptions.headers,
  };

  // Add authorization token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...restOptions,
  };

  // Add body for POST/PUT requests
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle non-JSON responses
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error(`Invalid response from server: ${response.status}`);
    }

    if (!response.ok) {
      // Check if it's a "Challenge not found" error and provide better message
      const errorMessage = data.message || data.error || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API Request Error:', error);
    
    // Provide more helpful error messages
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error('Network request timed out. Please check your connection and that the backend is running.');
    }
    if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Make sure the backend is running and your phone is on the same WiFi network.`);
    }
    
    throw error;
  }
};

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Sign up a new user
   * @param {Object} userData - User data (phoneNumber, displayName, dateOfBirth, location, college)
   */
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  },

  /**
   * Sign up with email and password
   * @param {Object} userData - User data (email, displayName, dateOfBirth, location, college)
   */
  signupWithEmail: async (userData) => {
    return apiRequest('/auth/signup-email', {
      method: 'POST',
      body: userData,
    });
  },

  /**
   * Sign in user (requires Firebase ID token)
   * @param {string} token - Firebase ID token
   */
  signin: async (token) => {
    return apiRequest('/auth/signin', {
      method: 'POST',
      token,
    });
  },

  /**
   * Get current user info
   * @param {string} token - Firebase ID token
   */
  getMe: async (token) => {
    return apiRequest('/auth/me', {
      method: 'GET',
      token,
    });
  },

  /**
   * Verify phone number
   * @param {string} token - Firebase ID token
   */
  verifyPhone: async (token) => {
    return apiRequest('/auth/verify-phone', {
      method: 'POST',
      token,
    });
  },

  /**
   * Refresh token
   * @param {string} token - Firebase ID token
   */
  refreshToken: async (token) => {
    return apiRequest('/auth/refresh-token', {
      method: 'POST',
      token,
    });
  },
};

/**
 * User API endpoints (to be implemented)
 */
export const userAPI = {
  // GET /api/users/profile
  getProfile: async (token) => {
    return apiRequest('/users/profile', {
      method: 'GET',
      token,
    });
  },

  // PUT /api/users/profile
  updateProfile: async (token, profileData) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      token,
      body: profileData,
    });
  },

  // GET /api/users/stats
  getStats: async (token) => {
    return apiRequest('/users/stats', {
      method: 'GET',
      token,
    });
  },

  // GET /api/users/completion-history
  getCompletionHistory: async (token) => {
    return apiRequest('/users/completion-history', {
      method: 'GET',
      token,
    });
  },
};

/**
 * Challenge API endpoints (to be implemented)
 */
export const challengeAPI = {
  // GET /api/challenges
  getAll: async (token, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/challenges${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      token,
    });
  },

  // GET /api/challenges/:id
  getById: async (token, challengeId) => {
    return apiRequest(`/challenges/${challengeId}`, {
      method: 'GET',
      token,
    });
  },

  // GET /api/challenges/:id/progress
  getProgress: async (token, challengeId) => {
    return apiRequest(`/challenges/${challengeId}/progress`, {
      method: 'GET',
      token,
    });
  },

  // GET /api/challenges/nearby
  getNearby: async (token, latitude, longitude, radius = 5000) => {
    return apiRequest(`/challenges/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
      method: 'GET',
      token,
    });
  },

  // POST /api/challenges/:id/accept
  accept: async (token, challengeId) => {
    return apiRequest(`/challenges/${challengeId}/accept`, {
      method: 'POST',
      token,
    });
  },

  // POST /api/challenges/:id/complete
  complete: async (token, challengeId, completionData) => {
    return apiRequest(`/challenges/${challengeId}/complete`, {
      method: 'POST',
      token,
      body: completionData,
    });
  },

  // POST /api/challenges/generate - Generate a challenge using AI
  generate: async (token, options = {}) => {
    return apiRequest('/challenges/generate', {
      method: 'POST',
      token,
      body: options,
    });
  },

  // GET /api/challenges/my - Get user's challenges
  getMyChallenges: async (token, status) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/challenges/my${query}`, {
      method: 'GET',
      token,
    });
  },

  // GET /api/challenges/daily - Get today's daily challenge (cached per day)
  getDaily: async (token, timezone, forceRegenerate = false) => {
    const params = new URLSearchParams();
    if (timezone) params.append('timezone', timezone);
    if (forceRegenerate) params.append('forceRegenerate', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/challenges/daily${query}`, {
      method: 'GET',
      token,
    });
  },
};

/**
 * Event API endpoints (to be implemented)
 */
export const eventAPI = {
  // GET /api/events
  getAll: async (token, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/events${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      token,
    });
  },

  // GET /api/events/:id
  getById: async (token, eventId) => {
    return apiRequest(`/events/${eventId}`, {
      method: 'GET',
      token,
    });
  },

  // GET /api/events/nearby
  getNearby: async (token, latitude, longitude, radius = 5000) => {
    return apiRequest(`/events/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`, {
      method: 'GET',
      token,
    });
  },

  // POST /api/events
  create: async (token, eventData) => {
    return apiRequest('/events', {
      method: 'POST',
      token,
      body: eventData,
    });
  },

  // POST /api/events/:id/join
  join: async (token, eventId) => {
    return apiRequest(`/events/${eventId}/join`, {
      method: 'POST',
      token,
    });
  },

  // POST /api/events/:id/leave
  leave: async (token, eventId) => {
    return apiRequest(`/events/${eventId}/leave`, {
      method: 'POST',
      token,
    });
  },
};

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  const baseUrl = API_BASE_URL.replace('/api', '');
  return fetch(`${baseUrl}/health`)
    .then(res => res.json())
    .catch(error => {
      console.error('Health check failed:', error);
      throw error;
    });
};

export default {
  authAPI,
  userAPI,
  challengeAPI,
  eventAPI,
  healthCheck,
};




