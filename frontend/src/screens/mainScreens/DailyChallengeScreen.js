import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../../context/AuthContext";
import { challengeAPI, userAPI } from "../../services/api";
import { auth } from "../../services/firebase";

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function DailyChallengeScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [challengeStatus, setChallengeStatus] = useState(null); // Track if challenge is completed/verified
    const [streak, setStreak] = useState(0);
    const [weeklyStreak, setWeeklyStreak] = useState([false, false, false, false, false, false, false]);
    const [notificationPermission, setNotificationPermission] = useState(false);

    // Request notification permissions on mount
    useEffect(() => {
        const requestPermissions = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                console.warn('Notification permission not granted');
                setNotificationPermission(false);
                return;
            }
            
            setNotificationPermission(true);
            
            // Configure notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#7b3aed',
                });
            }
        };
        
        requestPermissions();
    }, []);

    // Fetch daily challenge function
    const fetchDailyChallenge = React.useCallback(async (forceRefresh = false) => {
        if (!currentUser) {
            navigation.goBack();
            return;
        }

        try {
            setLoading(true);
            const idToken = await currentUser.getIdToken();

            // Fetch user stats (includes streak)
            try {
                const stats = await userAPI.getStats(idToken);
                if (stats.success && stats.data) {
                    setStreak(stats.data.currentStreak || 0);
                    // TODO: Get actual weekly data from backend
                }
            } catch (error) {
                console.warn("Could not fetch stats:", error);
            }

            // Get user's timezone
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            // Fetch today's daily challenge (backend handles caching per day)
            // Use forceRegenerate if forceRefresh is true
            try {
                const response = await challengeAPI.getDaily(idToken, userTimezone, forceRefresh);
                if (response.success && response.data) {
                    setDailyChallenge(response.data);
                    
                    // Check if user has already completed/verified this challenge
                    if (response.data.id) {
                        try {
                            const progressResponse = await challengeAPI.getProgress(idToken, response.data.id);
                            if (progressResponse.success && progressResponse.data?.userChallenge) {
                                const userChallenge = progressResponse.data.userChallenge;
                                
                                // Only mark as completed if BOTH status is "completed" AND verified is strictly true
                                // This ensures we don't treat challenges with status="completed" but verified=false as completed
                                const verifiedValue = userChallenge.verified;
                                const isVerified = verifiedValue === true || verifiedValue === "true"; // Handle string "true" too
                                const isCompleted = userChallenge.status === "completed" && isVerified === true;
                                
                                // Debug logging
                                if (__DEV__) {
                                    console.log('=== Daily Challenge Status Check ===');
                                    console.log('  Challenge ID:', response.data.id);
                                    console.log('  status:', userChallenge.status);
                                    console.log('  verified (raw):', verifiedValue, typeof verifiedValue);
                                    console.log('  isVerified:', isVerified);
                                    console.log('  isCompleted:', isCompleted);
                                    console.log('  Full userChallenge:', JSON.stringify(userChallenge, null, 2));
                                }
                                
                                setChallengeStatus({
                                    status: userChallenge.status,
                                    verified: isVerified,
                                    isCompleted: isCompleted,
                                });
                            }
                        } catch (progressError) {
                            console.warn("Could not fetch challenge progress:", progressError);
                            // Continue without progress data
                        }
                    }
                } else {
                    Alert.alert("No Challenge", "No daily challenge available today.");
                    navigation.goBack();
                }
            } catch (error) {
                console.error("Error fetching daily challenge:", error);
                Alert.alert("Error", "Could not load daily challenge. Please try again.");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, navigation]);

    // Initial fetch on mount
    useEffect(() => {
        fetchDailyChallenge();
    }, [fetchDailyChallenge]);

    // Refresh challenge when screen comes into focus (e.g., after changing filters)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh the challenge when screen is focused
            if (currentUser) {
                fetchDailyChallenge(false);
            }
        });

        return unsubscribe;
    }, [navigation, currentUser, fetchDailyChallenge]);

    // Refresh challenge when screen comes into focus (e.g., after changing filters)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh the challenge when screen is focused
            if (currentUser) {
                fetchDailyChallenge(false);
            }
        });

        return unsubscribe;
    }, [navigation, currentUser]);

    const handleAcceptWithVerification = () => {
        // Navigate to camera verification screen
        navigation.navigate("CameraVerification", {
            challenge: dailyChallenge,
            fromDaily: true,
        });
    };


    const handleRemindLater = async () => {
        if (!notificationPermission) {
            Alert.alert(
                "Notification Permission Required",
                "Please enable notifications in your device settings to receive reminders.",
                [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]
            );
            return;
        }

        if (!dailyChallenge) {
            Alert.alert("Error", "No challenge available to remind about.");
            return;
        }

        try {
            // Schedule notification for 30 seconds later (for testing)
            // In production, this would be a few hours later
            const trigger = {
                seconds: 30, // 30 seconds for testing
            };

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "📅 Daily Challenge Reminder",
                    body: dailyChallenge.title || dailyChallenge.description || "Don't forget to complete today's challenge!",
                    data: {
                        challengeId: dailyChallenge.id || dailyChallenge._id,
                        screen: "DailyChallenge",
                    },
                    sound: true,
                },
                trigger,
            });

            console.log(`✅ Notification scheduled with ID: ${notificationId} for 30 seconds`);

            Alert.alert(
                "Reminder Set!",
                "We'll remind you about this challenge in 30 seconds!",
                [
                    { 
                        text: "OK", 
                        onPress: () => navigation.goBack() 
                    }
                ]
            );
        } catch (error) {
            console.error("Error scheduling notification:", error);
            Alert.alert(
                "Error",
                "Failed to schedule reminder. Please try again.",
                [
                    { text: "OK" }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Today's Challenge</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("ChallengeFilter")}>
                        <Ionicons name="filter" size={24} color="#7b3aed" />
                    </TouchableOpacity>
                </View>

                {/* CHALLENGE CARD */}
                <View style={styles.challengeCard}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#7b3aed" />
                            <Text style={styles.loadingText}>Loading challenge...</Text>
                        </View>
                    ) : dailyChallenge ? (
                        <>
                            <Text style={styles.challengeTitle}>TODAY'S CHALLENGE</Text>
                            <Text style={styles.challengeText}>
                                {dailyChallenge.title || dailyChallenge.description || "No challenge available"}
                            </Text>
                            
                            {dailyChallenge.description && dailyChallenge.title && (
                                <Text style={styles.challengeDescription}>
                                    {dailyChallenge.description}
                                </Text>
                            )}

                            {/* Show completed status if challenge is already completed and verified */}
                            {challengeStatus?.isCompleted ? (
                                <View style={styles.completedContainer}>
                                    <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                                    <Text style={styles.completedText}>✅ Challenge Completed!</Text>
                                    <Text style={styles.completedSubtext}>You've successfully verified this challenge.</Text>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.verifyNowButton}
                                        onPress={handleAcceptWithVerification}
                                    >
                                        <Ionicons name="camera" size={20} color="#fff" />
                                        <Text style={styles.verifyNowButtonText}>Verify</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={styles.remindButton}
                                        onPress={handleRemindLater}
                                    >
                                        <Text style={styles.remindButtonText}>Remind Me Later</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Weekly Streak Visualization */}
                            <View style={styles.weeklyStreakContainer}>
                                <View style={styles.streakRow}>
                                    <Ionicons name="flame" size={20} color="#ff6b35" />
                                    <Text style={styles.streakNumber}>{streak}</Text>
                                    <Text style={styles.streakText}>day streak</Text>
                                </View>
                                <View style={styles.weekCircles}>
                                    {weeklyStreak.map((completed, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.weekCircle,
                                                completed && styles.weekCircleCompleted,
                                            ]}
                                        >
                                            {completed && (
                                                <Ionicons name="checkmark" size={12} color="#fff" />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.challengeText}>No challenge available</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scroll: {
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    challengeCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginBottom: 15,
        textTransform: "uppercase",
    },
    challengeText: {
        fontSize: 28,
        fontWeight: "700",
        color: "#ff4444",
        marginBottom: 15,
        textAlign: "center",
    },
    challengeDescription: {
        fontSize: 16,
        color: "#666",
        marginBottom: 25,
        textAlign: "center",
        lineHeight: 24,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 15,
        color: "#666",
        fontSize: 14,
    },
    verifyNowButton: {
        backgroundColor: "#4A90E2",
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    verifyNowButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    acceptLaterButton: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
        marginBottom: 12,
    },
    acceptLaterButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    remindButton: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
        marginBottom: 20,
    },
    remindButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    completedContainer: {
        alignItems: "center",
        paddingVertical: 30,
        marginBottom: 20,
    },
    completedText: {
        fontSize: 22,
        fontWeight: "700",
        color: "#4CAF50",
        marginTop: 15,
        marginBottom: 8,
    },
    completedSubtext: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    weeklyStreakContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    streakRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    streakNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        marginLeft: 8,
        marginRight: 5,
    },
    streakText: {
        fontSize: 14,
        color: "#666",
    },
    weekCircles: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    weekCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
    },
    weekCircleCompleted: {
        backgroundColor: "#4CAF50",
    },
});

