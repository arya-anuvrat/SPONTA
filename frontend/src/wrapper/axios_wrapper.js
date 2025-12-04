import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================
// BASE URL (YOUR BACKEND)
// ============================
// iOS Simulator + macOS: localhost works.
// Physical device: replace with your IP.
const BASE_URL = "http://localhost:3000/api";

// ============================
// AXIOS INSTANCE
// ============================
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

// ============================
// TOKEN IN EVERY REQUEST
// ============================
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ============================
// ERROR HANDLING
// ============================
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.log("❌ API Error:", err?.response?.data || err.message);
        throw err;
    }
);

// ============================
// EXPORT ALL BACKEND ROUTES
// ============================

const wrapper = {
    // -----------------------------------
    // AUTH
    // -----------------------------------
    signup: (payload) => api.post("/auth/signup", payload),
    signin: (payload) => api.post("/auth/signin", payload),
    verifyPhone: (payload) => api.post("/auth/verify-phone", payload),
    refreshToken: () => api.post("/auth/refresh-token"),
    logout: () => api.post("/auth/logout"),
    getCurrentUser: () => api.get("/auth/me"),

    // -----------------------------------
    // USERS
    // -----------------------------------
    getProfile: () => api.get("/users/profile"),
    updateProfile: (payload) => api.put("/users/profile", payload),
    getUserStats: () => api.get("/users/stats"),

    getFriends: () => api.get("/users/friends"),
    sendFriendRequest: (uid) => api.post("/users/friends/request", { uid }),
    acceptFriendRequest: (uid) => api.post(`/users/friends/accept/${uid}`),
    removeFriend: (uid) => api.delete(`/users/friends/${uid}`),

    getUserBadges: () => api.get("/users/badges"),
    getLeaderboard: (params) => api.get("/users/leaderboard", { params }),

    // -----------------------------------
    // CHALLENGES
    // -----------------------------------
    getAllChallenges: (params) => api.get("/challenges", { params }),

    getChallengeById: (id) => api.get(`/challenges/${id}`),

    getNearbyChallenges: (lat, lng, radius) =>
        api.get("/challenges/nearby", {
            params: { lat, lng, radius },
        }),

    acceptChallenge: (id) => api.post(`/challenges/${id}/accept`),

    completeChallenge: (id, payload) =>
        api.post(`/challenges/${id}/complete`, payload),

    getChallengeProgress: (id) => api.get(`/challenges/${id}/progress`),

    getChallengeCategories: () => api.get("/challenges/categories"),

    // -----------------------------------
    // EVENTS
    // -----------------------------------
    getEvents: (params) => api.get("/events", { params }),

    getEventById: (id) => api.get(`/events/${id}`),

    getNearbyEvents: (lat, lng, radius) =>
        api.get("/events/nearby", { params: { lat, lng, radius } }),

    createEvent: (payload) => api.post("/events", payload),

    updateEvent: (id, payload) => api.put(`/events/${id}`, payload),

    deleteEvent: (id) => api.delete(`/events/${id}`),

    joinEvent: (id) => api.post(`/events/${id}/join`),

    leaveEvent: (id) => api.post(`/events/${id}/leave`),

    getEventParticipants: (id) => api.get(`/events/${id}/participants`),

    // -----------------------------------
    // SOCIAL
    // -----------------------------------
    addReaction: (payload) => api.post("/social/reactions", payload),

    removeReaction: (id) => api.delete(`/social/reactions/${id}`),

    getFeed: () => api.get("/social/feed"),

    shareAchievement: (payload) => api.post("/social/share", payload),

    // -----------------------------------
    // PROGRESS / STREAKS
    // -----------------------------------
    getDailyProgress: () => api.get("/progress/daily"),

    getProgressHistory: () => api.get("/progress/history"),

    // -----------------------------------
    // NOTIFICATIONS
    // -----------------------------------
    getNotifications: () => api.get("/notifications"),

    markNotificationRead: (id) => api.post(`/notifications/${id}/read`),

    // -----------------------------------
    // ADMIN
    // -----------------------------------
    adminCreateChallenge: (payload) => api.post("/admin/challenges", payload),

    adminUpdateChallenge: (id, payload) =>
        api.put(`/admin/challenges/${id}`, payload),

    adminDeleteChallenge: (id) => api.delete(`/admin/challenges/${id}`),
};

export default wrapper;
