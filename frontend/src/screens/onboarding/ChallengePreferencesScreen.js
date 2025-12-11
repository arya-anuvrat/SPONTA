import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { userAPI } from "../../services/api";
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

export default function ChallengePreferencesScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, uid } = route.params || {};
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleContinue = async () => {
        if (selectedCategories.length === 0) {
            Alert.alert("Select Categories", "Please select at least one challenge category you're interested in.");
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

            // Navigate to home
            navigation.navigate("Home");
        } catch (error) {
            console.error("Error saving preferences:", error);
            Alert.alert("Error", "Failed to save preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Customize Your Daily Challenges</Text>
            <Text style={styles.subtitle}>
                Choose what types of challenges you want to see. You can change these preferences anytime from the daily challenge screen.
            </Text>
            
            {/* Info Alert */}
            <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#7b3aed" />
                <Text style={styles.infoText}>
                    Don't worry! You can update these preferences later by tapping the filter icon on your daily challenge screen.
                </Text>
            </View>

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

            {/* Continue Button */}
            <TouchableOpacity
                style={[styles.continueButton, loading && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={loading}
            >
                <Text style={styles.continueButtonText}>
                    {loading ? "Saving..." : "Continue"}
                </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        padding: 25,
        paddingTop: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 15,
        lineHeight: 22,
    },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#f0f0ff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 30,
        alignItems: "flex-start",
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
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
    continueButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    continueButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});

