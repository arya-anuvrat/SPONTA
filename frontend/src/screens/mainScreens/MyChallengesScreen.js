import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { challengeAPI } from "../../services/api";
import BottomBar from "../../components/BottomBar";

export default function MyChallengesScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [pendingChallenges, setPendingChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState("incomplete"); // "completed", "incomplete"
    const [expandedCards, setExpandedCards] = useState({}); // Track which cards are expanded

    useEffect(() => {
        const fetchChallenges = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                const idToken = await currentUser.getIdToken();

                // Fetch user's challenges
                const response = await challengeAPI.getMyChallenges(idToken);

                if (response.success && response.data) {
                    let challenges = response.data;

                    // If challenge details are missing, fetch them
                    const challengesWithDetails = await Promise.all(
                        challenges.map(async (challenge) => {
                            // If challenge details are already populated, return as is
                            if (
                                challenge.title ||
                                challenge.challenge?.title ||
                                challenge.challenge?.description
                            ) {
                                return challenge;
                            }

                            // Otherwise, fetch challenge details
                            try {
                                const challengeId =
                                    challenge.challengeId || challenge.id;
                                if (challengeId) {
                                    const challengeDetails =
                                        await challengeAPI.getById(
                                            idToken,
                                            challengeId
                                        );
                                    if (
                                        challengeDetails.success &&
                                        challengeDetails.data
                                    ) {
                                        return {
                                            ...challenge,
                                            challenge: challengeDetails.data,
                                            title:
                                                challengeDetails.data.title ||
                                                challengeDetails.data
                                                    .description,
                                            difficulty:
                                                challengeDetails.data
                                                    .difficulty,
                                            category:
                                                challengeDetails.data.category,
                                            categories:
                                                challengeDetails.data
                                                    .categories ||
                                                (challengeDetails.data.category
                                                    ? [
                                                          challengeDetails.data
                                                              .category,
                                                      ]
                                                    : []),
                                        };
                                    }
                                }
                            } catch (error) {
                                console.warn(
                                    "Error fetching challenge details:",
                                    error
                                );
                            }

                            return challenge;
                        })
                    );

                    challenges = challengesWithDetails;

                    // Separate challenges into categories
                    // Only two categories: Completed (verified) and Incomplete (everything else)
                    const completedList = [];
                    const pendingList = [];

                    challenges.forEach((challenge) => {
                        // Check if challenge is completed AND verified
                        // Both status must be "completed" AND verified must be true (strict check)
                        const isCompleted =
                            challenge.status === "completed" &&
                            challenge.verified === true;

                        // Debug logging for each challenge
                        if (__DEV__) {
                            console.log(
                                `Challenge ${
                                    challenge.id || challenge.challengeId
                                }:`,
                                {
                                    status: challenge.status,
                                    verified: challenge.verified,
                                    verifiedType: typeof challenge.verified,
                                    isCompleted,
                                    willGoTo: isCompleted
                                        ? "Completed"
                                        : "Incomplete",
                                }
                            );
                        }

                        // Categorize challenges - all non-completed go to incomplete
                        if (isCompleted) {
                            // Completed and verified → Completed tab
                            completedList.push(challenge);
                        } else {
                            // Not completed (whether accepted today or in the past) → Incomplete tab
                            // Challenges that aren't verified will show up here and can be verified later
                            pendingList.push(challenge);
                        }
                    });

                    setCompletedChallenges(completedList);
                    setPendingChallenges(pendingList);
                }
            } catch (error) {
                console.error("Error fetching challenges:", error);
                Alert.alert(
                    "Error",
                    "Could not load your challenges. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [currentUser]);

    const handleVerifyChallenge = (challenge) => {
        navigation.navigate("CameraVerification", {
            challenge,
            fromDaily: false,
        });
    };

    const toggleCardExpansion = (challengeId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [challengeId]: !prev[challengeId],
        }));
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "#4CAF50";
            case "medium":
                return "#FF9800";
            case "hard":
                return "#F44336";
            default:
                return "#666";
        }
    };

    const renderChallengeCard = (challenge) => {
        const challengeId = challenge.id || challenge._id;
        const isExpanded = expandedCards[challengeId];
        // A challenge is incomplete if:
        // 1. Status is "accepted" and not verified, OR
        // 2. Status is "completed" but not verified (failed verification)
        const isIncomplete =
            (challenge.status === "accepted" ||
                challenge.status === "completed") &&
            !challenge.verified;

        // Debug logging to see challenge structure
        if (__DEV__) {
            console.log("Challenge data:", {
                id: challengeId,
                title: challenge.title,
                challengeTitle: challenge.challenge?.title,
                difficulty: challenge.difficulty,
                challengeDifficulty: challenge.challenge?.difficulty,
                categories: challenge.categories,
                challengeCategories: challenge.challenge?.categories,
                category: challenge.category,
                challengeCategory: challenge.challenge?.category,
                fullChallenge: challenge.challenge,
            });
        }

        // Try multiple ways to get challenge data
        // 1. Direct properties (from backend population)
        // 2. Nested challenge object
        // 3. Fallback to description or default
        const challengeTitle =
            challenge.title ||
            challenge.challenge?.title ||
            challenge.challenge?.description ||
            challenge.description ||
            "Challenge";

        const challengeDifficulty =
            challenge.difficulty || challenge.challenge?.difficulty;

        // Get categories - try multiple sources
        let challengeCategories = [];
        if (challenge.categories && Array.isArray(challenge.categories)) {
            challengeCategories = challenge.categories;
        } else if (
            challenge.challenge?.categories &&
            Array.isArray(challenge.challenge.categories)
        ) {
            challengeCategories = challenge.challenge.categories;
        } else if (challenge.category) {
            challengeCategories = [challenge.category];
        } else if (challenge.challenge?.category) {
            challengeCategories = [challenge.challenge.category];
        }

        return (
            <View key={challengeId} style={styles.card}>
                {/* Card Header - Always Visible */}
                <TouchableOpacity
                    onPress={() => toggleCardExpansion(challengeId)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Text
                                style={styles.cardTitle}
                                numberOfLines={isExpanded ? 0 : 2}
                            >
                                {challengeTitle}
                            </Text>
                            {challengeDifficulty && (
                                <View
                                    style={[
                                        styles.difficultyBadge,
                                        {
                                            backgroundColor:
                                                getDifficultyColor(
                                                    challengeDifficulty
                                                ) + "20",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.difficultyText,
                                            {
                                                color: getDifficultyColor(
                                                    challengeDifficulty
                                                ),
                                            },
                                        ]}
                                    >
                                        {challengeDifficulty
                                            .charAt(0)
                                            .toUpperCase() +
                                            challengeDifficulty.slice(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#666"
                        />
                    </View>

                    {/* Categories - Always Visible */}
                    {challengeCategories.length > 0 && (
                        <View style={styles.categoriesContainer}>
                            {challengeCategories
                                .slice(
                                    0,
                                    isExpanded ? challengeCategories.length : 2
                                )
                                .map((cat, index) => (
                                    <View
                                        key={index}
                                        style={styles.categoryTag}
                                    >
                                        <Text style={styles.categoryText}>
                                            {cat}
                                        </Text>
                                    </View>
                                ))}
                            {!isExpanded && challengeCategories.length > 2 && (
                                <Text style={styles.moreCategoriesText}>
                                    +{challengeCategories.length - 2} more
                                </Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                    <View style={styles.expandedSection}>
                        {/* Separator */}
                        <View style={styles.separator} />

                        {/* Description */}
                        {challenge.challenge?.description && (
                            <Text style={styles.description}>
                                {challenge.challenge.description}
                            </Text>
                        )}

                        {/* STATUS */}
                        <View style={styles.detailRow}>
                            <Ionicons
                                name={
                                    isIncomplete
                                        ? "hourglass-outline"
                                        : "checkmark-circle-outline"
                                }
                                size={20}
                                color={isIncomplete ? "#FF9800" : "#4CAF50"}
                            />
                            <Text
                                style={[
                                    styles.statusText,
                                    isIncomplete
                                        ? styles.statusIncomplete
                                        : styles.statusCompleted,
                                ]}
                            >
                                {isIncomplete ? "Incomplete" : "Completed"}
                            </Text>
                        </View>

                        {/* DIFFICULTY */}
                        {challengeDifficulty && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={18}
                                    color="#666"
                                />
                                <Text style={styles.detailLabel}>
                                    Difficulty:{" "}
                                </Text>
                                <Text
                                    style={[
                                        styles.detailValue,
                                        {
                                            color: getDifficultyColor(
                                                challengeDifficulty
                                            ),
                                        },
                                    ]}
                                >
                                    {challengeDifficulty}
                                </Text>
                            </View>
                        )}

                        {/* CATEGORIES */}
                        {challengeCategories.length > 0 && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="pricetag-outline"
                                    size={18}
                                    color="#666"
                                />
                                <Text style={styles.detailLabel}>
                                    Category:{" "}
                                </Text>
                                <Text style={styles.detailValue}>
                                    {challengeCategories.join(", ")}
                                </Text>
                            </View>
                        )}

                        {/* Verify Button */}
                        {isIncomplete && (
                            <TouchableOpacity
                                style={styles.verifyBtn}
                                onPress={() => handleVerifyChallenge(challenge)}
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={18}
                                    color="#fff"
                                />
                                <Text style={styles.verifyBtnText}>Verify</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Collapsed Footer - Show verify button if incomplete */}
                {!isExpanded && isIncomplete && (
                    <View style={styles.cardFooter}>
                        <View style={styles.statusBadge}>
                            <Text
                                style={[
                                    styles.statusText,
                                    styles.statusIncomplete,
                                ]}
                            >
                                ⏳ Incomplete
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={() => handleVerifyChallenge(challenge)}
                        >
                            <Ionicons name="camera" size={16} color="#fff" />
                            <Text style={styles.verifyButtonText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#7b3aed" />
                    <Text style={styles.loadingText}>
                        Loading challenges...
                    </Text>
                </View>
            );
        }

        let challenges = [];
        let emptyMessage = "";

        switch (activeTab) {
            case "completed":
                challenges = completedChallenges;
                emptyMessage = "No completed challenges yet";
                break;
            case "incomplete":
                challenges = pendingChallenges;
                emptyMessage = "No incomplete challenges";
                break;
        }

        if (challenges.length === 0) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons name="list-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>{emptyMessage}</Text>
                </View>
            );
        }

        return challenges.map(renderChallengeCard);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Challenges</Text>
            </View>

            {/* Tabs - Only Completed and Incomplete */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "completed" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("completed")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "completed" && styles.tabTextActive,
                        ]}
                    >
                        Completed
                    </Text>
                    {completedChallenges.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {completedChallenges.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "incomplete" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("incomplete")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "incomplete" && styles.tabTextActive,
                        ]}
                    >
                        Incomplete
                    </Text>
                    {pendingChallenges.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {pendingChallenges.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {renderContent()}
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    tabActive: {
        backgroundColor: "#f0f0ff",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    tabTextActive: {
        color: "#7b3aed",
    },
    badge: {
        backgroundColor: "#7b3aed",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 15,
        color: "#666",
        fontSize: 16,
    },
    emptyText: {
        marginTop: 15,
        color: "#999",
        fontSize: 16,
    },
    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        flex: 1,
        marginRight: 10,
    },
    cardPoints: {
        fontSize: 16,
        color: "#7b3aed",
        fontWeight: "700",
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusBadge: {
        flex: 1,
    },
    statusText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    statusCompleted: {
        color: "#4CAF50",
    },
    statusIncomplete: {
        color: "#FF9800",
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 10,
    },
    difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: "600",
    },
    categoriesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 6,
    },
    categoryTag: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    moreCategoriesText: {
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
        alignSelf: "center",
    },
    expandedContent: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    statusRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    verifyButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    verifyButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    descriptionText: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
        marginBottom: 14,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 6,
    },

    detailText: {
        fontSize: 14,
        color: "#555",
        flexShrink: 1,
    },
    expandedSection: {
        marginTop: 10,
        paddingTop: 15,
    },

    separator: {
        height: 1,
        backgroundColor: "#eee",
        marginBottom: 15,
    },

    description: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
        marginBottom: 16,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 6,
    },

    detailLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
    },

    detailValue: {
        fontSize: 14,
        color: "#333",
        flexShrink: 1,
    },

    statusText: {
        fontSize: 15,
        fontWeight: "700",
    },

    statusCompleted: {
        color: "#4CAF50",
    },

    statusIncomplete: {
        color: "#FF9800",
    },

    verifyBtn: {
        backgroundColor: "#7b3aed",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 40,
        marginTop: 18,
        gap: 8,
    },

    verifyBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
