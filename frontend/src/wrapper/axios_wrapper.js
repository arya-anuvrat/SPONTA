import axios from "axios";

// ------------------------------
// 🔧 CONFIG
// ------------------------------
const API = axios.create({
    baseURL: "http://localhost:3000/api",
});

// ------------------------------
// 🔐 Attach Firebase ID Token Automatically
// ------------------------------
API.interceptors.request.use(async (config) => {
    if (global.authToken) {
        config.headers.Authorization = `Bearer ${global.authToken}`;
    }
    return config;
});

// ------------------------------
// 📦 EXPORT ALL ROUTES
// ------------------------------
export default {
    // ==========================================
    // AUTH ROUTES
    // ==========================================

    // Backend signup AFTER Firebase signup
    signup: (data) => API.post("/auth/signup", data),

    // Backend signin AFTER Firebase signInWithEmailAndPassword
    signin: () => API.post("/auth/signin"),

    // Refresh session (if backend supports)
    refreshToken: () => API.post("/auth/refresh-token"),

    logout: () => API.post("/auth/logout"),

    // ==========================================
    // USER ROUTES
    // ==========================================
    getProfile: () => API.get("/users/profile"),
    updateProfile: (data) => API.put("/users/profile", data),

    getUserStats: () => API.get("/users/stats"),
    getUserBadges: () => API.get("/users/badges"),
    getLeaderboard: (params) => API.get("/users/leaderboard", { params }),

    // Friends
    getFriends: () => API.get("/users/friends"),
    sendFriendRequest: (uid) => API.post(`/users/friends/request`, { uid }),
    acceptFriendRequest: (uid) => API.post(`/users/friends/accept/${uid}`),
    removeFriend: (uid) => API.delete(`/users/friends/${uid}`),

    // ==========================================
    // CHALLENGES
    // ==========================================

    getAllChallenges: (params) => API.get("/challenges", { params }),

    getChallengeById: (id) => API.get(`/challenges/${id}`),

    getNearbyChallenges: (lat, lng, radius = 5000) =>
        API.get("/challenges/nearby", {
            params: { lat, lng, radius },
        }),

    acceptChallenge: (challengeId) =>
        API.post(`/challenges/${challengeId}/accept`),

    completeChallenge: (challengeId, data) =>
        API.post(`/challenges/${challengeId}/complete`, data),

    getMyChallenges: (status) =>
        API.get("/challenges/my", { params: { status } }),

    getChallengeProgress: (id) => API.get(`/challenges/${id}/progress`),

    getChallengeCategories: () => API.get("/challenges/categories"),

    // ==========================================
    // EVENTS
    // ==========================================

    getEvents: () => API.get("/events"),

    getEventById: (id) => API.get(`/events/${id}`),

    getNearbyEvents: (lat, lng, radius = 5000) =>
        API.get("/events/nearby", {
            params: { lat, lng, radius },
        }),

    createEvent: (data) => API.post("/events", data),

    updateEvent: (id, data) => API.put(`/events/${id}`, data),

    deleteEvent: (id) => API.delete(`/events/${id}`),

    joinEvent: (id) => API.post(`/events/${id}/join`),

    leaveEvent: (id) => API.post(`/events/${id}/leave`),

    getEventParticipants: (id) => API.get(`/events/${id}/participants`),

    // ==========================================
    // SOCIAL ROUTES
    // ==========================================

    addReaction: (data) => API.post("/social/reactions", data),

    removeReaction: (reactionId) =>
        API.delete(`/social/reactions/${reactionId}`),

    getFeed: () => API.get("/social/feed"),

    shareAchievement: (data) => API.post("/social/share", data),

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    getNotifications: () => API.get("/notifications"),
    markNotificationRead: (id) => API.post(`/notifications/${id}/read`),
};
