import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { challengeAPI } from "../../services/api";
import BottomBar from "../../components/BottomBar";

export default function MyChallengesScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [pendingChallenges, setPendingChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState("incomplete");
    const [expandedCards, setExpandedCards] = useState({});

    // -----------------------------------------------------------
    // Helpers for difficulty styling
    // -----------------------------------------------------------
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

    const getDifficultyBackground = (difficulty, dark) => {
        const base = getDifficultyColor(difficulty);
        return dark ? base + "55" : base + "20";
    };

    // -----------------------------------------------------------
    // Fetch user's challenges
    // -----------------------------------------------------------
    useEffect(() => {
        const fetchChallenges = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                const idToken = await currentUser.getIdToken();

                const response = await challengeAPI.getMyChallenges(idToken);
                if (response.success && response.data) {
                    let challenges = response.data;

                    // Populate challenge details if missing
                    const withDetails = await Promise.all(
                        challenges.map(async (challenge) => {
                            if (
                                challenge.title ||
                                challenge.challenge?.title ||
                                challenge.challenge?.description
                            ) {
                                return challenge;
                            }

                            try {
                                const challengeId =
                                    challenge.challengeId || challenge.id;

                                if (challengeId) {
                                    const details = await challengeAPI.getById(
                                        idToken,
                                        challengeId
                                    );

                                    if (details.success && details.data) {
                                        return {
                                            ...challenge,
                                            challenge: details.data,
                                            title: details.data.title,
                                            difficulty: details.data.difficulty,
                                            category: details.data.category,
                                            categories:
                                                details.data.categories ||
                                                (details.data.category
                                                    ? [details.data.category]
                                                    : []),
                                        };
                                    }
                                }
                            } catch (err) {
                                console.warn("details fetch err:", err);
                            }

                            return challenge;
                        })
                    );

                    challenges = withDetails;

                    const completedList = [];
                    const pendingList = [];

                    challenges.forEach((c) => {
                        const isCompleted =
                            c.status === "completed" && c.verified === true;

                        if (isCompleted) completedList.push(c);
                        else pendingList.push(c);
                    });

                    setCompletedChallenges(completedList);
                    setPendingChallenges(pendingList);
                }
            } catch (error) {
                console.error("Error fetching:", error);
                Alert.alert("Error", "Unable to load challenges.");
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [currentUser]);

    // -----------------------------------------------------------
    // Navigation
    // -----------------------------------------------------------
    const handleVerifyChallenge = (challenge) => {
        navigation.navigate("CameraVerification", {
            challenge,
            fromDaily: false,
        });
    };

    // Expand / collapse card
    const toggleCardExpansion = (challengeId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [challengeId]: !prev[challengeId],
        }));
    };

    // -----------------------------------------------------------
    // Render a single challenge card
    // -----------------------------------------------------------
    const renderChallengeCard = (challenge) => {
        const challengeId = challenge.id || challenge._id;
        const isExpanded = expandedCards[challengeId];

        const isIncomplete =
            (challenge.status === "accepted" ||
                challenge.status === "completed") &&
            !challenge.verified;

        const title =
            challenge.title ||
            challenge.challenge?.title ||
            challenge.challenge?.description ||
            "Challenge";

        const difficulty =
            challenge.difficulty || challenge.challenge?.difficulty;

        let categories = [];
        if (Array.isArray(challenge.categories)) {
            categories = challenge.categories;
        } else if (Array.isArray(challenge.challenge?.categories)) {
            categories = challenge.challenge.categories;
        } else if (challenge.category) {
            categories = [challenge.category];
        } else if (challenge.challenge?.category) {
            categories = [challenge.challenge.category];
        }

        return (
            <View
                key={challengeId}
                style={[
                    styles.card,
                    isDarkMode && {
                        backgroundColor: "#1a1a1a",
                        borderColor: "#333",
                    },
                ]}
            >
                {/* Header */}
                <TouchableOpacity
                    onPress={() => toggleCardExpansion(challengeId)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Text
                                style={[
                                    styles.cardTitle,
                                    { color: isDarkMode ? "#fff" : "#333" },
                                ]}
                                numberOfLines={isExpanded ? 0 : 2}
                            >
                                {title}
                            </Text>

                            {difficulty && (
                                <View
                                    style={[
                                        styles.difficultyBadge,
                                        {
                                            backgroundColor:
                                                getDifficultyBackground(
                                                    difficulty,
                                                    isDarkMode
                                                ),
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.difficultyText,
                                            {
                                                color: getDifficultyColor(
                                                    difficulty
                                                ),
                                            },
                                        ]}
                                    >
                                        {difficulty}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={22}
                            color={isDarkMode ? "#aaa" : "#666"}
                        />
                    </View>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <View style={styles.categoriesContainer}>
                            {categories
                                .slice(0, isExpanded ? categories.length : 2)
                                .map((cat, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.categoryTag,
                                            {
                                                backgroundColor: isDarkMode
                                                    ? "#333"
                                                    : "#f0f0f0",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                {
                                                    color: isDarkMode
                                                        ? "#ccc"
                                                        : "#666",
                                                },
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </View>
                                ))}

                            {!isExpanded && categories.length > 2 && (
                                <Text
                                    style={[
                                        styles.moreCategoriesText,
                                        { color: isDarkMode ? "#aaa" : "#999" },
                                    ]}
                                >
                                    +{categories.length - 2} more
                                </Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>

                {/* Expanded Section */}
                {isExpanded && (
                    <View style={styles.expandedSection}>
                        <View style={styles.separator} />

                        {challenge.challenge?.description && (
                            <Text
                                style={[
                                    styles.description,
                                    { color: isDarkMode ? "#ccc" : "#444" },
                                ]}
                            >
                                {challenge.challenge.description}
                            </Text>
                        )}

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

                        {difficulty && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={18}
                                    color={isDarkMode ? "#bbb" : "#666"}
                                />
                                <Text
                                    style={[
                                        styles.detailLabel,
                                        { color: isDarkMode ? "#ddd" : "#555" },
                                    ]}
                                >
                                    Difficulty:{" "}
                                </Text>
                                <Text
                                    style={[
                                        styles.detailValue,
                                        {
                                            color: getDifficultyColor(
                                                difficulty
                                            ),
                                        },
                                    ]}
                                >
                                    {difficulty}
                                </Text>
                            </View>
                        )}

                        {categories.length > 0 && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="pricetag-outline"
                                    size={18}
                                    color={isDarkMode ? "#bbb" : "#666"}
                                />
                                <Text
                                    style={[
                                        styles.detailLabel,
                                        { color: isDarkMode ? "#ddd" : "#555" },
                                    ]}
                                >
                                    Category:{" "}
                                </Text>
                                <Text
                                    style={[
                                        styles.detailValue,
                                        { color: isDarkMode ? "#ccc" : "#333" },
                                    ]}
                                >
                                    {categories.join(", ")}
                                </Text>
                            </View>
                        )}

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

                {/* Collapsed Footer */}
                {!isExpanded && isIncomplete && (
                    <View style={styles.cardFooter}>
                        <Text
                            style={[styles.statusText, styles.statusIncomplete]}
                        >
                            ⏳ Incomplete
                        </Text>

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

    // -----------------------------------------------------------
    // Render Tab Content
    // -----------------------------------------------------------
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#7b3aed" />
                    <Text
                        style={[
                            styles.loadingText,
                            { color: isDarkMode ? "#bbb" : "#666" },
                        ]}
                    >
                        Loading challenges...
                    </Text>
                </View>
            );
        }

        let challenges = [];
        let emptyMessage = "";

        if (activeTab === "completed") {
            challenges = completedChallenges;
            emptyMessage = "No completed challenges yet";
        } else {
            challenges = pendingChallenges;
            emptyMessage = "No incomplete challenges";
        }

        if (challenges.length === 0) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons
                        name="list-outline"
                        size={60}
                        color={isDarkMode ? "#555" : "#ccc"}
                    />
                    <Text
                        style={[
                            styles.emptyText,
                            { color: isDarkMode ? "#777" : "#999" },
                        ]}
                    >
                        {emptyMessage}
                    </Text>
                </View>
            );
        }

        return challenges.map(renderChallengeCard);
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? "#000" : "#fff" },
            ]}
        >
            <View
                style={[
                    styles.header,
                    { borderBottomColor: isDarkMode ? "#222" : "#eee" },
                ]}
            >
                <Text
                    style={[
                        styles.headerTitle,
                        { color: isDarkMode ? "#fff" : "#333" },
                    ]}
                >
                    My Challenges
                </Text>
            </View>

            {/* Tabs */}
            <View
                style={[
                    styles.tabs,
                    { borderBottomColor: isDarkMode ? "#222" : "#eee" },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "completed" &&
                            (isDarkMode
                                ? styles.tabActiveDark
                                : styles.tabActive),
                    ]}
                    onPress={() => setActiveTab("completed")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color:
                                    activeTab === "completed"
                                        ? "#7b3aed"
                                        : isDarkMode
                                        ? "#aaa"
                                        : "#666",
                            },
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
                        activeTab === "incomplete" &&
                            (isDarkMode
                                ? styles.tabActiveDark
                                : styles.tabActive),
                    ]}
                    onPress={() => setActiveTab("incomplete")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color:
                                    activeTab === "incomplete"
                                        ? "#7b3aed"
                                        : isDarkMode
                                        ? "#aaa"
                                        : "#666",
                            },
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
    container: { flex: 1 },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
    },

    tabs: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
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
    tabActiveDark: {
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#333",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
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

    scroll: { flex: 1 },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },

    centerContent: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
    },
    emptyText: {
        marginTop: 15,
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
    cardTitleContainer: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    categoriesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 6,
    },
    categoryTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "500",
    },
    moreCategoriesText: {
        fontSize: 12,
        fontStyle: "italic",
        alignSelf: "center",
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
    },
    detailValue: {
        fontSize: 14,
        flexShrink: 1,
    },

    statusText: {
        fontSize: 15,
        fontWeight: "700",
    },
    statusCompleted: { color: "#4CAF50" },
    statusIncomplete: { color: "#FF9800" },

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

    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start", // <—— prevents full-width stretching
        marginTop: 6,
    },
});
