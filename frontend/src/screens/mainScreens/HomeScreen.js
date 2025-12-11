import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomBar from "../../components/BottomBar";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { auth } from "../../services/firebase";

export default function HomeScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const [streak, setStreak] = useState(0);
    const [localEvents, setLocalEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <View style={styles.streakCircleContainer}>
                        <View style={styles.streakCircle}>
                            <Text style={styles.streakDays}>{streak}</Text>
                            <Text style={styles.streakLabelSmall}>days</Text>
                            {/* Flame icon at bottom */}
                            <View style={styles.flameContainer}>
                                <Ionicons name="flame" size={16} color="#ff6b35" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* WELCOME MESSAGE */}
                <Text style={styles.welcomeText}>WELCOME TO SPONTA!</Text>

                {/* DAILY CHALLENGE BUTTON */}
                <TouchableOpacity
                    style={styles.dailyChallengeButton}
                    onPress={() => navigation.navigate("DailyChallenge")}
                >
                    <Text style={styles.dailyChallengeButtonText}>
                        Today's Challenge
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#7b3aed" />
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
                    <View style={styles.sectionLabel}>
                        <Text style={styles.sectionLabelText}>COMMUNITY WATCH</Text>
                    </View>
                    <View style={styles.communityPost}>
                        <View style={styles.postHeader}>
                            <View style={styles.postProfile}>
                                <View style={styles.profileImage}>
                                    <Ionicons name="leaf" size={24} color="#4CAF50" />
                                </View>
                                <View>
                                    <Text style={styles.postUsername}>jasperskitchen</Text>
                                    <Text style={styles.postSponsored}>Sponsored</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.postImagePlaceholder}>
                            <Ionicons name="image" size={40} color="#ccc" />
                            <Text style={styles.postImageText}>Community Post</Text>
                        </View>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#7b3aed",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 30,
    },
    dailyChallengeButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignSelf: "flex-start",
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
    communityPost: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    postHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
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
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
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
});
