import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { challengeAPI } from "../../services/api";
import BottomBar from "../../components/BottomBar";
import Header from "../../components/Header";
import { useTheme } from "../../context/ThemeContext"; // ⭐ added

const CHALLENGE_CATEGORIES = [
    { value: "adventure", label: "Adventure" },
    { value: "social", label: "Social" },
    { value: "creative", label: "Creative" },
    { value: "fitness", label: "Fitness" },
    { value: "academic", label: "Academic" },
    { value: "wellness", label: "Wellness" },
    { value: "exploration", label: "Exploration" },
    { value: "test", label: "Test" },
];

const DIFFICULTY_LEVELS = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
];

const PEOPLE_OPTIONS = [
    { value: "1", label: "Solo" },
    { value: "2-5", label: "2-5 people" },
    { value: "6-10", label: "6-10 people" },
    { value: "10+", label: "10+ people" },
    { value: "any", label: "Any" },
];

export default function SpontaAIScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { colors } = useTheme(); // ⭐ added

    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedPeople, setSelectedPeople] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [generatedChallenge, setGeneratedChallenge] = useState(null);
    const [completing, setCompleting] = useState(false);

    const handleGenerate = async () => {
        if (!currentUser) {
            Alert.alert(
                "Sign In Required",
                "Please sign in to generate spontaneous ideas."
            );
            return;
        }

        setGenerating(true);
        try {
            const idToken = await currentUser.getIdToken();

            const options = {};
            if (selectedCategory) options.category = selectedCategory;
            if (selectedDifficulty) options.difficulty = selectedDifficulty;
            if (description.trim())
                options.customDescription = description.trim();
            if (selectedPeople && selectedPeople !== "any") {
                options.peopleCount = selectedPeople;
            }

            const response = await challengeAPI.generate(idToken, options);

            if (response.success && response.data) {
                setGeneratedChallenge(response.data);
            } else {
                Alert.alert(
                    "Error",
                    "Could not generate idea. Please try again."
                );
            }
        } catch (error) {
            console.error("Error generating idea:", error);
            let errorMessage = "Could not generate idea. Please try again.";
            
            if (error.name === 'AbortError' || error.message?.includes('timeout')) {
                errorMessage = "Request timed out. The AI is taking too long. Please try again.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Error", errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        setGeneratedChallenge(null);
        await handleGenerate();
    };

    const handleAcceptAsChallenge = async () => {
        if (!generatedChallenge || !currentUser) return;

        Alert.alert(
            "Accept as Challenge",
            "Accept this spontaneous idea as a challenge? It will be added to your incomplete challenges.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Accept",
                    onPress: async () => {
                        setCompleting(true);
                        try {
                            const idToken = await currentUser.getIdToken();
                            const challengeId =
                                generatedChallenge.id || generatedChallenge._id;

                            const response = await challengeAPI.accept(
                                idToken,
                                challengeId
                            );

                            if (response.success) {
                                Alert.alert(
                                    "Idea Accepted!",
                                    "This spontaneous idea is now one of your incomplete challenges.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                setGeneratedChallenge(null);
                                                setDescription("");
                                                setSelectedCategory(null);
                                                setSelectedDifficulty(null);
                                                setSelectedPeople(null);
                                            },
                                        },
                                    ]
                                );
                            }
                        } catch (error) {
                            console.error("Error accepting challenge:", error);
                            Alert.alert(
                                "Error",
                                "Could not accept idea as challenge. Please try again."
                            );
                        } finally {
                            setCompleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* ⭐ Header updated for dark mode */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.card,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>

                <Text
                    style={[styles.headerTitle, { color: colors.textPrimary }]}
                >
                    Sponta AI
                </Text>

                <View style={{ width: 24 }} />
            </View>
            {/* ⭐ END header */}

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {!generatedChallenge ? (
                    <View style={styles.formContainer}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            What Are You Looking For?
                        </Text>

                        <TextInput
                            style={[
                                styles.descriptionInput,
                                {
                                    backgroundColor: colors.card,
                                    color: colors.textPrimary,
                                },
                            ]}
                            placeholder="E.g., an outdoor adventure with friends..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            Number of People
                        </Text>

                        <View style={styles.optionsContainer}>
                            {PEOPLE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: "transparent",
                                        },
                                        selectedPeople === option.value && {
                                            backgroundColor: colors.tabActive,
                                            borderColor: colors.tabActive,
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedPeople(option.value)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: colors.textSecondary },
                                            selectedPeople === option.value && {
                                                color: "#fff",
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            Type / Category
                        </Text>

                        <View style={styles.optionsContainer}>
                            {CHALLENGE_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.optionButton,
                                        { backgroundColor: colors.card },
                                        selectedCategory === cat.value && {
                                            backgroundColor: colors.tabActive,
                                            borderColor: colors.tabActive,
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedCategory(cat.value)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: colors.textSecondary },
                                            selectedCategory === cat.value && {
                                                color: "#fff",
                                            },
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            Difficulty
                        </Text>

                        <View style={styles.optionsContainer}>
                            {DIFFICULTY_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level.value}
                                    style={[
                                        styles.optionButton,
                                        { backgroundColor: colors.card },
                                        selectedDifficulty === level.value && {
                                            backgroundColor: colors.tabActive,
                                            borderColor: colors.tabActive,
                                        },
                                    ]}
                                    onPress={() =>
                                        setSelectedDifficulty(level.value)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: colors.textSecondary },
                                            selectedDifficulty ===
                                                level.value && {
                                                color: "#fff",
                                            },
                                        ]}
                                    >
                                        {level.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.generateButton,
                                { backgroundColor: colors.tabActive },
                            ]}
                            onPress={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="sparkles"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.generateButtonText}>
                                        Generate Idea
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.challengeContainer}>
                        <View
                            style={[
                                styles.challengeCard,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <View style={styles.challengeHeader}>
                                <Ionicons
                                    name="sparkles"
                                    size={24}
                                    color={colors.tabActive}
                                />
                                <Text
                                    style={[
                                        styles.challengeLabel,
                                        { color: colors.tabActive },
                                    ]}
                                >
                                    GENERATED IDEA
                                </Text>
                            </View>

                            <Text
                                style={[
                                    styles.challengeTitle,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                {generatedChallenge.title ||
                                    generatedChallenge.description ||
                                    "Challenge"}
                            </Text>

                            {generatedChallenge.description &&
                                generatedChallenge.title && (
                                    <Text
                                        style={[
                                            styles.challengeDescription,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {generatedChallenge.description}
                                    </Text>
                                )}

                            <View style={styles.challengeMeta}>
                                {generatedChallenge.category && (
                                    <View
                                        style={[
                                            styles.metaBadge,
                                            { backgroundColor: colors.tabActive + "20" },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.metaText,
                                                { color: colors.tabActive },
                                            ]}
                                        >
                                            {generatedChallenge.category}
                                        </Text>
                                    </View>
                                )}
                                {generatedChallenge.difficulty && (
                                    <View
                                        style={[
                                            styles.metaBadge,
                                            { backgroundColor: colors.tabActive + "20" },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.metaText,
                                                { color: colors.tabActive },
                                            ]}
                                        >
                                            {generatedChallenge.difficulty}
                                        </Text>
                                    </View>
                                )}
                                {generatedChallenge.points && (
                                    <View
                                        style={[
                                            styles.metaBadge,
                                            { backgroundColor: colors.tabActive + "20" },
                                        ]}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={14}
                                            color={colors.tabActive}
                                        />
                                        <Text
                                            style={[
                                                styles.metaText,
                                                { color: colors.tabActive },
                                            ]}
                                        >
                                            {generatedChallenge.points} pts
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.regenerateButton,
                                        { backgroundColor: colors.card, borderColor: colors.border },
                                    ]}
                                    onPress={handleRegenerate}
                                    disabled={generating}
                                >
                                    <Ionicons
                                        name="refresh"
                                        size={20}
                                        color={colors.textPrimary}
                                    />
                                    <Text
                                        style={[
                                            styles.actionButtonText,
                                            { color: colors.textPrimary },
                                        ]}
                                    >
                                        Regenerate
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.acceptButton,
                                        { backgroundColor: colors.tabActive },
                                    ]}
                                    onPress={handleAcceptAsChallenge}
                                    disabled={completing}
                                >
                                    {completing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={20}
                                                color="#fff"
                                            />
                                            <Text style={styles.actionButtonText}>
                                                Accept as Challenge
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    /* ⭐ ONLY header changed */
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },

    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },

    formContainer: { flex: 1 },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 12,
    },

    descriptionInput: {
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 100,
        marginBottom: 10,
        textAlignVertical: "top",
    },

    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 10,
    },

    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
    },

    optionText: {
        fontSize: 14,
        fontWeight: "600",
    },

    generateButton: {
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 30,
    },
    generateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    challengeContainer: {
        flex: 1,
        paddingTop: 20,
    },
    challengeCard: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    challengeHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    challengeLabel: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },
    challengeTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 12,
    },
    challengeDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    challengeMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 24,
    },
    metaBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    regenerateButton: {
        borderWidth: 2,
    },
    acceptButton: {},
    actionButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
});
