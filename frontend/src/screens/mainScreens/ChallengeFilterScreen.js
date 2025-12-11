import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { userAPI, challengeAPI } from "../../services/api";
import { auth } from "../../services/firebase";

const CATEGORIES = [
    { id: "adventure", name: "Adventure", icon: "trail-sign", color: "#4CAF50" },
    { id: "social", name: "Social", icon: "people", color: "#2196F3" },
    { id: "creative", name: "Creative", icon: "brush", color: "#9C27B0" },
    { id: "fitness", name: "Fitness", icon: "fitness", color: "#FF5722" },
    { id: "academic", name: "Academic", icon: "school", color: "#FF9800" },
    { id: "wellness", name: "Wellness", icon: "leaf", color: "#00BCD4" },
    { id: "exploration", name: "Exploration", icon: "map", color: "#E91E63" },
    { id: "test", name: "Test", icon: "flask", color: "#7b3aed" },
];

const DIFFICULTIES = [
    { id: "easy", name: "Easy", description: "Quick & Simple", color: "#4CAF50" },
    { id: "medium", name: "Medium", description: "Moderate Effort", color: "#FF9800" },
    { id: "hard", name: "Hard", description: "Challenging", color: "#F44336" },
];

export default function ChallengeFilterScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = useAuth();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch current preferences
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!currentUser) {
                navigation.goBack();
                return;
            }

            try {
                setFetching(true);
                const idToken = await currentUser.getIdToken();
                const profile = await userAPI.getProfile(idToken);

                if (profile.success && profile.data) {
                    setSelectedCategories(profile.data.preferredCategories || []);
                    setSelectedDifficulty(profile.data.preferredDifficulty || null);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setFetching(false);
            }
        };

        fetchPreferences();
    }, [currentUser]);

    const toggleCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleSave = async () => {
        if (selectedCategories.length === 0) {
            Alert.alert("Select Categories", "Please select at least one challenge category.");
            return;
        }

        if (!selectedDifficulty) {
            Alert.alert("Select Difficulty", "Please select your preferred difficulty level.");
            return;
        }

        setLoading(true);
        try {
            if (!auth || !auth.currentUser) {
                throw new Error("User not authenticated");
            }

            const idToken = await auth.currentUser.getIdToken();

            // Save preferences to user profile
            await userAPI.updateProfile(idToken, {
                preferredCategories: selectedCategories,
                preferredDifficulty: selectedDifficulty,
            });

            // Generate new challenge based on updated preferences
            Alert.alert(
                "Preferences Updated!",
                "Your challenge preferences have been saved. A new daily challenge will be generated based on your selections.",
                [
                    {
                        text: "Generate New Challenge",
                        onPress: async () => {
                            try {
                                // Generate new challenge with forceRegenerate flag
                                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                                const response = await challengeAPI.getDaily(idToken, userTimezone, true);
                                
                                if (response.success) {
                                    Alert.alert(
                                        "New Challenge Generated!",
                                        "Check your daily challenge to see your new personalized challenge!",
                                        [
                                            {
                                                text: "OK",
                                                onPress: () => navigation.goBack(),
                                            },
                                        ]
                                    );
                                } else {
                                    throw new Error(response.message || "Failed to generate challenge");
                                }
                            } catch (error) {
                                console.error("Error generating new challenge:", error);
                                Alert.alert(
                                    "Preferences Saved",
                                    "Your preferences have been saved. A new challenge will be generated at 12:00 AM.",
                                    [{ text: "OK", onPress: () => navigation.goBack() }]
                                );
                            }
                        },
                    },
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error("Error saving preferences:", error);
            Alert.alert("Error", "Failed to save preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7b3aed" />
                    <Text style={styles.loadingText}>Loading preferences...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Filter Challenges</Text>
                    <View style={{ width: 28 }} />
                </View>

                <Text style={styles.title}>Customize Your Daily Challenges</Text>
                <Text style={styles.subtitle}>
                    Update your preferences to get challenges that match your interests. Changes will apply to tomorrow's challenge.
                </Text>

                {/* Categories Section */}
                <Text style={styles.sectionTitle}>Challenge Categories</Text>
                <Text style={styles.sectionSubtitle}>Select all that interest you</Text>
                <View style={styles.categoriesGrid}>
                    {CATEGORIES.map((category) => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    isSelected && styles.categoryCardSelected,
                                    isSelected && { borderColor: category.color },
                                ]}
                                onPress={() => toggleCategory(category.id)}
                            >
                                <Ionicons
                                    name={category.icon}
                                    size={32}
                                    color={isSelected ? category.color : "#999"}
                                />
                                <Text
                                    style={[
                                        styles.categoryName,
                                        isSelected && { color: category.color },
                                    ]}
                                >
                                    {category.name}
                                </Text>
                                {isSelected && (
                                    <View style={[styles.checkmark, { backgroundColor: category.color }]}>
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Difficulty Section */}
                <Text style={styles.sectionTitle}>Preferred Difficulty</Text>
                <Text style={styles.sectionSubtitle}>Choose your comfort level</Text>
                <View style={styles.difficultiesContainer}>
                    {DIFFICULTIES.map((difficulty) => {
                        const isSelected = selectedDifficulty === difficulty.id;
                        return (
                            <TouchableOpacity
                                key={difficulty.id}
                                style={[
                                    styles.difficultyCard,
                                    isSelected && styles.difficultyCardSelected,
                                    isSelected && { borderColor: difficulty.color },
                                ]}
                                onPress={() => setSelectedDifficulty(difficulty.id)}
                            >
                                <Text
                                    style={[
                                        styles.difficultyName,
                                        isSelected && { color: difficulty.color },
                                    ]}
                                >
                                    {difficulty.name}
                                </Text>
                                <Text style={styles.difficultyDescription}>
                                    {difficulty.description}
                                </Text>
                                {isSelected && (
                                    <View style={[styles.checkmark, { backgroundColor: difficulty.color }]}>
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save & Generate New Challenge</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 25,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 15,
        color: "#666",
        fontSize: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginTop: 20,
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#999",
        marginBottom: 15,
    },
    categoriesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    categoryCard: {
        width: "30%",
        aspectRatio: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "transparent",
        position: "relative",
    },
    categoryCardSelected: {
        backgroundColor: "#fff",
    },
    categoryName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
        marginTop: 8,
        textAlign: "center",
    },
    difficultiesContainer: {
        marginBottom: 30,
    },
    difficultyCard: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "transparent",
        position: "relative",
    },
    difficultyCardSelected: {
        backgroundColor: "#fff",
    },
    difficultyName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 5,
    },
    difficultyDescription: {
        fontSize: 14,
        color: "#666",
    },
    checkmark: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});

