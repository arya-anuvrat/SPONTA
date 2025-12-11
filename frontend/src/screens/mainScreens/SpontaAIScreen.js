import React, { useState, useEffect } from "react";
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
    
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedPeople, setSelectedPeople] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [generatedChallenge, setGeneratedChallenge] = useState(null);
    const [completing, setCompleting] = useState(false);

    const handleGenerate = async () => {
        if (!currentUser) {
            Alert.alert("Sign In Required", "Please sign in to generate spontaneous ideas.");
            return;
        }

        setGenerating(true);
        try {
            const idToken = await currentUser.getIdToken();
            
            // Build options object
            const options = {};
            if (selectedCategory) options.category = selectedCategory;
            if (selectedDifficulty) options.difficulty = selectedDifficulty;
            if (description.trim()) {
                // Add custom description to options
                // We'll pass this as a custom parameter
                options.customDescription = description.trim();
            }
            if (selectedPeople && selectedPeople !== "any") {
                options.peopleCount = selectedPeople;
            }

            const response = await challengeAPI.generate(idToken, options);
            
            if (response.success && response.data) {
                setGeneratedChallenge(response.data);
            } else {
                Alert.alert("Error", "Could not generate idea. Please try again.");
            }
        } catch (error) {
            console.error("Error generating idea:", error);
            Alert.alert("Error", "Could not generate idea. Please try again.");
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
                            const challengeId = generatedChallenge.id || generatedChallenge._id;
                            
                            // Accept the challenge (this moves it to incomplete challenges)
                            const response = await challengeAPI.accept(idToken, challengeId);
                            
                            if (response.success) {
                                Alert.alert(
                                    "Idea Accepted as Challenge!",
                                    "This spontaneous idea has been added to your incomplete challenges. You can verify it later if you want (verification won't affect your streaks).",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                setGeneratedChallenge(null);
                                                // Reset form
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
                            if (error.message?.includes("already accepted")) {
                                Alert.alert(
                                    "Already Accepted",
                                    "This idea has already been accepted as a challenge and is in your incomplete challenges.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                setGeneratedChallenge(null);
                                                // Reset form
                                                setDescription("");
                                                setSelectedCategory(null);
                                                setSelectedDifficulty(null);
                                                setSelectedPeople(null);
                                            },
                                        },
                                    ]
                                );
                            } else {
                                Alert.alert("Error", "Could not accept idea as challenge. Please try again.");
                            }
                        } finally {
                            setCompleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Sponta AI" />
            
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {!generatedChallenge ? (
                    // Form View
                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>What Are You Looking For?</Text>
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="E.g., I want to try something adventurous outdoors with friends..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.sectionTitle}>Number of People</Text>
                        <View style={styles.optionsContainer}>
                            {PEOPLE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        selectedPeople === option.value && styles.optionButtonSelected,
                                    ]}
                                    onPress={() => setSelectedPeople(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedPeople === option.value && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Type / Category</Text>
                        <View style={styles.optionsContainer}>
                            {CHALLENGE_CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.value}
                                    style={[
                                        styles.optionButton,
                                        selectedCategory === category.value && styles.optionButtonSelected,
                                    ]}
                                    onPress={() => setSelectedCategory(category.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedCategory === category.value && styles.optionTextSelected,
                                        ]}
                                    >
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Difficulty</Text>
                        <View style={styles.optionsContainer}>
                            {DIFFICULTY_LEVELS.map((difficulty) => (
                                <TouchableOpacity
                                    key={difficulty.value}
                                    style={[
                                        styles.optionButton,
                                        selectedDifficulty === difficulty.value && styles.optionButtonSelected,
                                    ]}
                                    onPress={() => setSelectedDifficulty(difficulty.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedDifficulty === difficulty.value && styles.optionTextSelected,
                                        ]}
                                    >
                                        {difficulty.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
                            onPress={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={20} color="#fff" />
                                    <Text style={styles.generateButtonText}>Generate Idea</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Generated Idea View
                    <View style={styles.challengeContainer}>
                        <View style={styles.challengeCard}>
                            <View style={styles.challengeHeader}>
                                <Ionicons name="sparkles" size={24} color="#7b3aed" />
                                <Text style={styles.challengeTitle}>Spontaneous Idea</Text>
                            </View>
                            
                            <Text style={styles.challengeText}>
                                {generatedChallenge.title || generatedChallenge.description || "No idea available"}
                            </Text>
                            
                            {generatedChallenge.description && generatedChallenge.title && (
                                <Text style={styles.challengeDescription}>
                                    {generatedChallenge.description}
                                </Text>
                            )}

                            {generatedChallenge.difficulty && (
                                <View style={styles.challengeMeta}>
                                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(generatedChallenge.difficulty) + '20' }]}>
                                        <Text style={[styles.difficultyText, { color: getDifficultyColor(generatedChallenge.difficulty) }]}>
                                            {generatedChallenge.difficulty.charAt(0).toUpperCase() + generatedChallenge.difficulty.slice(1)}
                                        </Text>
                                    </View>
                                    {generatedChallenge.points && (
                                        <Text style={styles.pointsText}>{generatedChallenge.points} pts</Text>
                                    )}
                                </View>
                            )}

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.regenerateButton}
                                    onPress={handleRegenerate}
                                    disabled={generating}
                                >
                                    <Ionicons name="refresh" size={18} color="#7b3aed" />
                                    <Text style={styles.regenerateButtonText}>Regenerate</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.completeButton}
                                    onPress={handleAcceptAsChallenge}
                                    disabled={completing}
                                >
                                    {completing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                            <Text style={styles.completeButtonText}>Accept as Challenge</Text>
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

const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return '#4CAF50';
        case 'medium': return '#FF9800';
        case 'hard': return '#F44336';
        default: return '#666';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    formContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginTop: 20,
        marginBottom: 12,
    },
    descriptionInput: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: "#333",
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 10,
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
        backgroundColor: "#f5f5f5",
        borderWidth: 2,
        borderColor: "transparent",
    },
    optionButtonSelected: {
        backgroundColor: "#7b3aed",
        borderColor: "#7b3aed",
    },
    optionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    optionTextSelected: {
        color: "#fff",
    },
    generateButton: {
        backgroundColor: "#7b3aed",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        gap: 10,
    },
    generateButtonDisabled: {
        opacity: 0.6,
    },
    generateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    challengeContainer: {
        flex: 1,
    },
    challengeCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    challengeHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 15,
    },
    challengeTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    challengeText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
        lineHeight: 26,
    },
    challengeDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 15,
    },
    challengeMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: "700",
    },
    pointsText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7b3aed",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 10,
    },
    regenerateButton: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#7b3aed",
    },
    regenerateButtonText: {
        color: "#7b3aed",
        fontSize: 14,
        fontWeight: "600",
    },
    completeButton: {
        flex: 1,
        backgroundColor: "#7b3aed",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    completeButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});

