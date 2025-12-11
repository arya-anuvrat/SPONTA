import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomBar from "../../components/BottomBar";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { userAPI, postAPI } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
export default function HomeScreen({ route }) {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { isDarkMode, colors } = useTheme();

    const [streak, setStreak] = useState(0);
    const [localEvents, setLocalEvents] = useState([]);
    const [communityPosts, setCommunityPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch community posts from backend
    const fetchCommunityPosts = useCallback(async () => {
        if (!currentUser) {
            setCommunityPosts([]);
            return;
        }
        
        try {
            const idToken = await currentUser.getIdToken();
            const response = await postAPI.getAll(idToken);
            
            if (response.success && response.data) {
                console.log(`✅ Loaded ${response.data.length} community posts from backend`);
                setCommunityPosts(response.data || []);
            } else {
                console.warn("⚠️ Failed to fetch posts - response:", response);
                setCommunityPosts([]);
            }
        } catch (error) {
            console.error("❌ Error fetching community posts:", error);
            console.error("Error details:", error.message, error.stack);
            // Set empty array on error so user sees empty state, not stale data
            setCommunityPosts([]);
        }
    }, [currentUser]);

    // Handle new post or updated post from CreatePost screen
    useEffect(() => {
        if (route.params?.newPost || route.params?.updatedPost) {
            // Refresh posts from backend after creating/updating
            fetchCommunityPosts();
            // Clear the params to avoid re-fetching on re-render
            navigation.setParams({ newPost: undefined, updatedPost: undefined });
        }
    }, [route.params?.newPost, route.params?.updatedPost, navigation, fetchCommunityPosts]);

    // Load posts from backend on mount and when user changes
    useEffect(() => {
        fetchCommunityPosts();
    }, [fetchCommunityPosts]);

    // Refresh posts when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (currentUser) {
                fetchCommunityPosts();
            }
        });

        return unsubscribe;
    }, [navigation, currentUser, fetchCommunityPosts]);

    // Fetch all data (stats, events)
    const fetchData = useCallback(async (isRefresh = false) => {
        if (!currentUser) return;

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const idToken = await currentUser.getIdToken();

            // Fetch user stats (includes streak)
            try {
                const stats = await userAPI.getStats(idToken);
                if (stats.success && stats.data) {
                    setStreak(stats.data.currentStreak || 0);
                }
            } catch (error) {
                console.warn("Could not fetch stats:", error);
            }

            // Mock local events for now
            setLocalEvents([
                {
                    id: "1",
                    title: "Barcelona meet up in august! 🇪🇸",
                    imageUrl: null, // Can add image URL later
                    participantCount: 46,
                    location: { name: "Spain" },
                },
                {
                    id: "2",
                    title: "Surf and making friends in Brisbane 🇦🇺",
                    imageUrl: null, // Can add image URL later
                    participantCount: 52,
                    location: { name: "Brisbane" },
                },
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Pull to refresh handler - refreshes all data
    const onRefresh = useCallback(() => {
        fetchData(true);
        fetchCommunityPosts();
    }, [fetchData, fetchCommunityPosts]);

    return (
        <SafeAreaView
            style={[styles.safe, { backgroundColor: colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#7b3aed"
                        colors={["#7b3aed"]}
                    />
                }
            >
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <View style={styles.logoContainer}>
                        <Text
                            style={[
                                styles.logoS,
                                { color: colors.textPrimary },
                            ]}
                        >
                            S
                        </Text>
                        <Text
                            style={[
                                styles.logoPonta,
                                { color: colors.tabActive },
                            ]}
                        >
                            ponta
                        </Text>
                    </View>

                    {/* Streak Bubble */}
                    <TouchableOpacity
                        style={styles.streakCircleContainer}
                        onPress={() => navigation.navigate("Streak")}
                    >
                        <View
                            style={[
                                styles.streakCircle,
                                { borderColor: colors.border },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.streakDays,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                {streak}
                            </Text>
                            <Text
                                style={[
                                    styles.streakLabelSmall,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                days
                            </Text>

                            <View style={styles.flameContainer}>
                                <Ionicons
                                    name="flame"
                                    size={16}
                                    color="#ff6b35"
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* WELCOME */}
                <Text
                    style={[styles.welcomeText, { color: colors.textPrimary }]}
                >
                    WELCOME TO SPONTA!
                </Text>

                {/* DAILY CHALLENGE */}
                <TouchableOpacity
                    style={[
                        styles.dailyChallengeButton,
                        { backgroundColor: colors.tabActive },
                    ]}
                    onPress={() => navigation.navigate("DailyChallenge")}
                >
                    <View style={styles.dailyChallengeButtonContent}>
                        <View style={styles.dailyChallengeButtonLeft}>
                            <View
                                style={[
                                    styles.dailyChallengeIconContainer,
                                    {
                                        backgroundColor:
                                            "rgba(255,255,255,0.2)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="trophy"
                                    size={24}
                                    color="#ffd700"
                                />
                            </View>

                            <View>
                                <Text style={styles.dailyChallengeButtonText}>
                                    Today's Challenge
                                </Text>
                                <Text
                                    style={[
                                        styles.dailyChallengeButtonSubtext,
                                        { color: "#f4f4f4" },
                                    ]}
                                >
                                    Complete your daily challenge
                                </Text>
                            </View>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#fff"
                        />
                    </View>
                </TouchableOpacity>

                {/* LOCAL EVENTS */}
                <View style={styles.section}>
                    <View
                        style={[
                            styles.sectionLabel,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionLabelText,
                                { color: colors.textPrimary },
                            ]}
                        >
                            LOCAL EVENTS
                        </Text>
                    </View>

                    <View style={styles.eventsContainer}>
                        {localEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={[
                                    styles.eventCard,
                                    {
                                        backgroundColor: colors.card,
                                        shadowOpacity: isDarkMode ? 0 : 0.08,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.eventTitle,
                                        { color: colors.textPrimary },
                                    ]}
                                >
                                    {event.title}
                                </Text>

                                <View style={styles.eventDetails}>
                                    <View style={styles.eventDetailItem}>
                                        <Ionicons
                                            name="people"
                                            size={14}
                                            color={colors.textMuted}
                                        />
                                        <Text
                                            style={[
                                                styles.eventDetailText,
                                                { color: colors.textMuted },
                                            ]}
                                        >
                                            {event.participantCount}
                                        </Text>
                                    </View>

                                    <View style={styles.eventDetailItem}>
                                        <Ionicons
                                            name="location"
                                            size={14}
                                            color={colors.textMuted}
                                        />
                                        <Text
                                            style={[
                                                styles.eventDetailText,
                                                { color: colors.textMuted },
                                            ]}
                                        >
                                            {event.location.name}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* COMMUNITY WATCH */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.sectionLabel,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.sectionLabelText,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                COMMUNITY WATCH
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                { backgroundColor: colors.card },
                            ]}
                            onPress={() =>
                                navigation.navigate("CreatePost", {
                                    currentUserId: currentUser?.uid,
                                })
                            }
                        >
                            <Ionicons
                                name="add"
                                size={24}
                                color={colors.tabActive}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.postsContainer}>
                        {communityPosts.map((post) => {
                            const isOwnPost = post.userId === currentUser?.uid;

                            return (
                                <View
                                    key={post.id}
                                    style={[
                                        styles.communityPost,
                                        {
                                            backgroundColor: colors.card,
                                            shadowOpacity: isDarkMode
                                                ? 0
                                                : 0.08,
                                        },
                                    ]}
                                >
                                    {/* Header */}
                                    <View style={styles.postHeader}>
                                        <View style={styles.postProfile}>
                                            <View
                                                style={[
                                                    styles.profileImage,
                                                    {
                                                        backgroundColor:
                                                            colors.tabActive,
                                                    },
                                                ]}
                                            >
                                                <Ionicons
                                                    name="person"
                                                    size={18}
                                                    color="#fff"
                                                />
                                            </View>
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.postUsername,
                                                        {
                                                            color: colors.textPrimary,
                                                        },
                                                    ]}
                                                >
                                                    {post.username}
                                                </Text>

                                                {post.isSponsored && (
                                                    <Text
                                                        style={[
                                                            styles.postSponsored,
                                                            {
                                                                color: colors.textSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        Sponsored
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={styles.postHeaderActions}>
                                                {isOwnPost && (
                                                    <TouchableOpacity
                                                        style={styles.deleteButton}
                                                        onPress={async () => {
                                                            Alert.alert(
                                                                "Delete Post",
                                                                "Are you sure you want to delete this post?",
                                                                [
                                                                    { text: "Cancel", style: "cancel" },
                                                                    {
                                                                        text: "Delete",
                                                                        style: "destructive",
                                                                        onPress: async () => {
                                                                            try {
                                                                                const idToken = await currentUser.getIdToken();
                                                                                await postAPI.delete(idToken, post.id);
                                                                                // Refresh posts from backend
                                                                                fetchCommunityPosts();
                                                                            } catch (error) {
                                                                                console.error("Error deleting post:", error);
                                                                                Alert.alert("Error", "Failed to delete post. Please try again.");
                                                                            }
                                                                        },
                                                                    },
                                                                ]
                                                            );
                                                        }}
                                                    >
                                                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (isOwnPost) {
                                                            // Show edit/delete menu for own posts
                                                            Alert.alert(
                                                                "Post Options",
                                                                "What would you like to do?",
                                                                [
                                                                    { text: "Cancel", style: "cancel" },
                                                                    {
                                                                        text: "Edit",
                                                                        onPress: () => {
                                                                            navigation.navigate("CreatePost", {
                                                                                currentUserId: currentUser?.uid,
                                                                                editPost: post,
                                                                            });
                                                                        },
                                                                    },
                                                                    {
                                                                        text: "Delete",
                                                                        style: "destructive",
                                                                        onPress: () => {
                                                                            Alert.alert(
                                                                                "Delete Post",
                                                                                "Are you sure you want to delete this post?",
                                                                                [
                                                                                    { text: "Cancel", style: "cancel" },
                                                                                    {
                                                                                        text: "Delete",
                                                                                        style: "destructive",
                                                                                        onPress: async () => {
                                                                                            try {
                                                                                                const idToken = await currentUser.getIdToken();
                                                                                                await postAPI.delete(idToken, post.id);
                                                                                                // Refresh posts from backend
                                                                                                fetchCommunityPosts();
                                                                                            } catch (error) {
                                                                                                console.error("Error deleting post:", error);
                                                                                                Alert.alert("Error", "Failed to delete post. Please try again.");
                                                                                            }
                                                                                        },
                                                                                    },
                                                                                ]
                                                                            );
                                                                        },
                                                                    },
                                                                ]
                                                            );
                                                        } else {
                                                            // For other users' posts, show report option
                                                            Alert.alert(
                                                                "Post Options",
                                                                "What would you like to do?",
                                                                [
                                                                    { text: "Cancel", style: "cancel" },
                                                                    {
                                                                        text: "Report",
                                                                        style: "destructive",
                                                                        onPress: () => {
                                                                            Alert.alert("Report Post", "Thank you for reporting. We'll review this post.");
                                                                        },
                                                                    },
                                                                ]
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Options */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                let actions = [
                                                    {
                                                        text: "Cancel",
                                                        style: "cancel",
                                                    },
                                                ];

                                                if (isOwnPost) {
                                                    actions.push(
                                                        {
                                                            text: "Edit",
                                                            onPress: () =>
                                                                navigation.navigate(
                                                                    "CreatePost",
                                                                    {
                                                                        currentUserId:
                                                                            currentUser?.uid,
                                                                        editPost:
                                                                            post,
                                                                    }
                                                                ),
                                                        },
                                                        {
                                                            text: "Delete",
                                                            style: "destructive",
                                                            onPress: () =>
                                                                setCommunityPosts(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                p.id !==
                                                                                post.id
                                                                        )
                                                                ),
                                                        }
                                                    );
                                                } else {
                                                    actions.push({
                                                        text: "Report",
                                                        style: "destructive",
                                                        onPress: () =>
                                                            Alert.alert(
                                                                "Reported",
                                                                "Thanks for your report."
                                                            ),
                                                    });
                                                }

                                                Alert.alert(
                                                    "Post Options",
                                                    "",
                                                    actions
                                                );
                                            }}
                                        >
                                            <Ionicons
                                                name="ellipsis-horizontal"
                                                size={22}
                                                color={colors.textMuted}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Image */}
                                    {post.imageUrl ? (
                                        <Image
                                            source={{ uri: post.imageUrl }}
                                            style={styles.postImage}
                                        />
                                    ) : (
                                        <View
                                            style={[
                                                styles.postImagePlaceholder,
                                                {
                                                    backgroundColor:
                                                        colors.background,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="image"
                                                size={40}
                                                color={colors.textMuted}
                                            />
                                            <Text
                                                style={[
                                                    styles.postImageText,
                                                    { color: colors.textMuted },
                                                ]}
                                            >
                                                No image
                                            </Text>
                                        </View>
                                    )}

                                    {/* Caption */}
                                    {post.caption ? (
                                        <View style={styles.postCaption}>
                                            <Text
                                                style={[
                                                    styles.postCaptionText,
                                                    {
                                                        color: colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={
                                                        styles.postUsernameInline
                                                    }
                                                >
                                                    {post.username}{" "}
                                                </Text>
                                                {post.caption}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Likes */}
                                    <View style={styles.postActions}>
                                        <TouchableOpacity
                                            style={styles.postActionButton}
                                            onPress={async () => {
                                                if (!currentUser) return;
                                                
                                                try {
                                                    const idToken = await currentUser.getIdToken();
                                                    const response = await postAPI.toggleLike(idToken, post.id);
                                                    
                                                    if (response.success && response.data) {
                                                        // Update the post in the list with the response data
                                                        setCommunityPosts(prev =>
                                                            prev.map(p =>
                                                                p.id === post.id ? response.data : p
                                                            )
                                                        );
                                                    }
                                                } catch (error) {
                                                    console.error("Error toggling like:", error);
                                                    Alert.alert("Error", "Failed to like post. Please try again.");
                                                }
                                            }}
                                        >
                                            <Ionicons
                                                name={
                                                    post.likedBy?.includes(
                                                        currentUser?.uid
                                                    )
                                                        ? "heart"
                                                        : "heart-outline"
                                                }
                                                size={24}
                                                color={
                                                    post.likedBy?.includes(
                                                        currentUser?.uid
                                                    )
                                                        ? "#F44336"
                                                        : colors.textPrimary
                                                }
                                            />

                                            <Text
                                                style={[
                                                    styles.postActionText,
                                                    {
                                                        color: colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                {post.likes}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    logoContainer: { flexDirection: "row", alignItems: "center" },
    logoS: { fontSize: 32, fontWeight: "900" },
    logoPonta: { fontSize: 32, fontWeight: "900" },

    streakCircleContainer: { alignItems: "center" },
    streakCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    streakDays: { fontSize: 18, fontWeight: "700" },
    streakLabelSmall: { fontSize: 11 },

    flameContainer: { position: "absolute", bottom: -8, right: -8 },

    welcomeText: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 25,
    },

    dailyChallengeButton: {
        borderRadius: 16,
        marginBottom: 30,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },

    dailyChallengeButtonContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 22,
    },

    dailyChallengeButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },

    dailyChallengeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },

    dailyChallengeButtonText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    dailyChallengeButtonSubtext: {
        fontSize: 14,
        fontWeight: "500",
    },

    section: { marginBottom: 30 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    sectionLabel: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    sectionLabelText: {
        fontSize: 14,
        fontWeight: "700",
    },

    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    eventsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },

    eventCard: {
        flex: 1,
        borderRadius: 12,
        shadowColor: "#000",
        elevation: 3,
    },

    eventTitle: {
        fontSize: 14,
        fontWeight: "600",
        padding: 10,
    },

    eventDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingBottom: 10,
    },

    eventDetailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    eventDetailText: {
        fontSize: 12,
    },

    postsContainer: { gap: 15 },

    communityPost: {
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 15,
        shadowColor: "#000",
    },

    postHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
    },

    postProfile: { flexDirection: "row", alignItems: "center", gap: 10 },

    profileImage: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },

    postUsername: { fontSize: 14, fontWeight: "700" },
    postSponsored: { fontSize: 12 },

    postImage: { width: "100%", height: 260 },

    postImagePlaceholder: {
        width: "100%",
        height: 210,
        alignItems: "center",
        justifyContent: "center",
    },

    postImageText: {
        marginTop: 8,
        fontSize: 14,
    },

    postCaption: { padding: 12 },
    postCaptionText: { fontSize: 14, lineHeight: 20 },

    postUsernameInline: { fontWeight: "700" },

    postActions: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 14,
    },

    postActionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    postActionText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
