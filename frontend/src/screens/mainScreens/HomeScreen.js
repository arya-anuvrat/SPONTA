import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomBar from "../../components/BottomBar";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { auth } from "../../services/firebase";

const COMMUNITY_POSTS_STORAGE_KEY = "@sponta_community_posts";

export default function HomeScreen({ route }) {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const [streak, setStreak] = useState(0);
    const [localEvents, setLocalEvents] = useState([]);
    const [communityPosts, setCommunityPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Handle new post or updated post from CreatePost screen
    useEffect(() => {
        if (route.params?.newPost) {
            setCommunityPosts(prev => [route.params.newPost, ...prev]);
            // Clear the param to avoid re-adding on re-render
            navigation.setParams({ newPost: undefined });
        }
        if (route.params?.updatedPost) {
            setCommunityPosts(prev =>
                prev.map(p => p.id === route.params.updatedPost.id ? route.params.updatedPost : p)
            );
            // Clear the param to avoid re-updating on re-render
            navigation.setParams({ updatedPost: undefined });
        }
    }, [route.params?.newPost, route.params?.updatedPost, navigation]);


    // Load posts from storage
    useEffect(() => {
        const loadPosts = async () => {
            try {
                const storedPosts = await AsyncStorage.getItem(COMMUNITY_POSTS_STORAGE_KEY);
                if (storedPosts) {
                    const parsedPosts = JSON.parse(storedPosts);
                    setCommunityPosts(parsedPosts);
                } else {
                    // Initial mock post
                    const initialPosts = [
                        {
                            id: "1",
                            username: "jasperskitchen",
                            userId: "mock_user_1",
                            userImage: null,
                            imageUrl: null,
                            caption: "Just completed my daily challenge! 🎉",
                            likes: 24,
                            likedBy: [],
                            timestamp: new Date().toISOString(),
                            isSponsored: true,
                        },
                    ];
                    setCommunityPosts(initialPosts);
                    await AsyncStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify(initialPosts));
                }
            } catch (error) {
                console.error("Error loading posts:", error);
            }
        };

        loadPosts();
    }, []);

    // Save posts to storage whenever they change (including when comments are added)
    useEffect(() => {
        const savePosts = async () => {
            try {
                await AsyncStorage.setItem(COMMUNITY_POSTS_STORAGE_KEY, JSON.stringify(communityPosts));
            } catch (error) {
                console.error("Error saving posts:", error);
            }
        };

        // Only save if we have posts (avoid saving empty array on initial load)
        if (communityPosts.length > 0) {
            savePosts();
        }
    }, [communityPosts]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
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
            }
        };

        fetchData();
    }, [currentUser]);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoS}>S</Text>
                        <Text style={styles.logoPonta}>ponta</Text>
                    </View>
                    {/* Circular Streak Indicator */}
                    <TouchableOpacity
                        style={styles.streakCircleContainer}
                        onPress={() => navigation.navigate("Streak")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.streakCircle}>
                            <Text style={styles.streakDays}>{streak}</Text>
                            <Text style={styles.streakLabelSmall}>days</Text>
                            {/* Flame icon at bottom */}
                            <View style={styles.flameContainer}>
                                <Ionicons name="flame" size={16} color="#ff6b35" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* WELCOME MESSAGE */}
                <Text style={styles.welcomeText}>WELCOME TO SPONTA!</Text>

                {/* DAILY CHALLENGE BUTTON */}
                <TouchableOpacity
                    style={styles.dailyChallengeButton}
                    onPress={() => navigation.navigate("DailyChallenge")}
                    activeOpacity={0.8}
                >
                    <View style={styles.dailyChallengeButtonContent}>
                        <View style={styles.dailyChallengeButtonLeft}>
                            <View style={styles.dailyChallengeIconContainer}>
                                <Ionicons name="trophy" size={24} color="#ffd700" />
                            </View>
                            <View>
                                <Text style={styles.dailyChallengeButtonText}>
                                    Today's Challenge
                                </Text>
                                <Text style={styles.dailyChallengeButtonSubtext}>
                                    Complete your daily challenge
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* LOCAL EVENTS SECTION */}
                <View style={styles.section}>
                    <View style={styles.sectionLabel}>
                        <Text style={styles.sectionLabelText}>LOCAL EVENTS</Text>
                    </View>
                    <View style={styles.eventsContainer}>
                        {localEvents.length > 0 ? (
                            localEvents.map((event, index) => (
                                <TouchableOpacity
                                    key={event.id || index}
                                    style={styles.eventCard}
                                >
                                    {event.imageUrl && (
                                        <Image
                                            source={{ uri: event.imageUrl }}
                                            style={styles.eventImage}
                                        />
                                    )}
                                    <Text style={styles.eventTitle} numberOfLines={2}>
                                        {event.title}
                                    </Text>
                                    <View style={styles.eventDetails}>
                                        <View style={styles.eventDetailItem}>
                                            <Ionicons name="people" size={14} color="#666" />
                                            <Text style={styles.eventDetailText}>
                                                {event.participantCount || 0}
                                            </Text>
                                        </View>
                                        <View style={styles.eventDetailItem}>
                                            <Ionicons name="location" size={14} color="#666" />
                                            <Text style={styles.eventDetailText} numberOfLines={1}>
                                                {typeof event.location === 'string' 
                                                    ? event.location 
                                                    : event.location?.name || event.location?.address || "Location"}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No local events available</Text>
                        )}
                    </View>
                </View>

                {/* COMMUNITY WATCH SECTION */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionLabel}>
                            <Text style={styles.sectionLabelText}>COMMUNITY WATCH</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate("CreatePost", {
                                currentUserId: currentUser?.uid,
                            })}
                        >
                            <Ionicons name="add" size={24} color="#7b3aed" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.postsContainer}>
                        {communityPosts.length > 0 ? (
                            communityPosts.map((post) => {
                                const isOwnPost = post.userId === currentUser?.uid;
                                return (
                                    <View key={post.id} style={styles.communityPost}>
                                        <View style={styles.postHeader}>
                                            <View style={styles.postProfile}>
                                                {post.userImage ? (
                                                    <Image
                                                        source={{ uri: post.userImage }}
                                                        style={styles.profileImage}
                                                    />
                                                ) : (
                                                    <View style={styles.profileImage}>
                                                        <Ionicons name="person" size={20} color="#fff" />
                                                    </View>
                                                )}
                                                <View>
                                                    <Text style={styles.postUsername}>{post.username}</Text>
                                                    {post.isSponsored && (
                                                        <Text style={styles.postSponsored}>Sponsored</Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View style={styles.postHeaderActions}>
                                                {isOwnPost && (
                                                    <TouchableOpacity
                                                        style={styles.deleteButton}
                                                        onPress={() => {
                                                            Alert.alert(
                                                                "Delete Post",
                                                                "Are you sure you want to delete this post?",
                                                                [
                                                                    { text: "Cancel", style: "cancel" },
                                                                    {
                                                                        text: "Delete",
                                                                        style: "destructive",
                                                                        onPress: () => {
                                                                            setCommunityPosts(prev =>
                                                                                prev.filter(p => p.id !== post.id)
                                                                            );
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
                                                                                        onPress: () => {
                                                                                            setCommunityPosts(prev =>
                                                                                                prev.filter(p => p.id !== post.id)
                                                                                            );
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
                                                    <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    {post.imageUrl ? (
                                        <Image
                                            source={{ uri: post.imageUrl }}
                                            style={styles.postImage}
                                        />
                                    ) : (
                                        <View style={styles.postImagePlaceholder}>
                                            <Ionicons name="image" size={40} color="#ccc" />
                                            <Text style={styles.postImageText}>No image</Text>
                                        </View>
                                    )}
                                    {post.caption && (
                                        <View style={styles.postCaption}>
                                            <Text style={styles.postCaptionText}>
                                                <Text style={styles.postUsernameInline}>{post.username}</Text> {post.caption}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.postActions}>
                                        <TouchableOpacity
                                            style={styles.postActionButton}
                                            onPress={() => {
                                                const isLiked = post.likedBy?.includes(currentUser?.uid) || false;
                                                const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
                                                const newLikedBy = isLiked
                                                    ? (post.likedBy || []).filter(uid => uid !== currentUser?.uid)
                                                    : [...(post.likedBy || []), currentUser?.uid];
                                                
                                                setCommunityPosts(prev =>
                                                    prev.map(p =>
                                                        p.id === post.id
                                                            ? { ...p, likes: newLikes, likedBy: newLikedBy }
                                                            : p
                                                    )
                                                );
                                            }}
                                        >
                                            <Ionicons
                                                name={
                                                    post.likedBy?.includes(currentUser?.uid)
                                                        ? "heart"
                                                        : "heart-outline"
                                                }
                                                size={24}
                                                color={
                                                    post.likedBy?.includes(currentUser?.uid)
                                                        ? "#F44336"
                                                        : "#333"
                                                }
                                            />
                                            <Text style={styles.postActionText}>{post.likes || 0}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                );
                            })
                        ) : (
                            <Text style={styles.emptyText}>No community posts yet</Text>
                        )}
                    </View>
                </View>

                {/* spacing so content doesn't overlap bottom bar */}
                <View style={{ height: 120 }} />
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoS: {
        fontSize: 32,
        fontWeight: "900",
        color: "#000",
    },
    logoPonta: {
        fontSize: 32,
        fontWeight: "900",
        color: "#7b3aed",
    },
    streakCircleContainer: {
        alignItems: "center",
    },
    streakCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: "#e0e0e0",
        borderTopColor: "#ff6b35",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    streakDays: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },
    streakLabelSmall: {
        fontSize: 10,
        color: "#666",
    },
    flameContainer: {
        position: "absolute",
        bottom: -8,
        right: -8,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
        marginBottom: 25,
    },
    dailyChallengeButton: {
        backgroundColor: "#7b3aed",
        borderRadius: 16,
        marginBottom: 30,
        shadowColor: "#7b3aed",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dailyChallengeButtonContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    dailyChallengeButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 16,
    },
    dailyChallengeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    dailyChallengeButtonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    dailyChallengeButtonSubtext: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        fontWeight: "500",
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionLabel: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
    },
    sectionLabelText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
        letterSpacing: 0.5,
    },
    eventsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    eventCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventImage: {
        width: "100%",
        height: 120,
        backgroundColor: "#f0f0f0",
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        padding: 10,
        minHeight: 40,
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
        color: "#666",
    },
    emptyText: {
        color: "#999",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 20,
    },
    postsContainer: {
        gap: 15,
    },
    communityPost: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 15,
    },
    postHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
    },
    postHeaderActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    deleteButton: {
        padding: 4,
    },
    postProfile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#7b3aed",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    postUsername: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    postSponsored: {
        fontSize: 12,
        color: "#999",
    },
    postImage: {
        width: "100%",
        height: 300,
        backgroundColor: "#f5f5f5",
    },
    postImagePlaceholder: {
        width: "100%",
        height: 200,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        justifyContent: "center",
    },
    postImageText: {
        marginTop: 10,
        color: "#999",
        fontSize: 14,
    },
    postCaption: {
        padding: 12,
    },
    postCaptionText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    postUsernameInline: {
        fontWeight: "600",
        color: "#333",
    },
    postActions: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 20,
    },
    postActionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    postActionText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
    },
});
