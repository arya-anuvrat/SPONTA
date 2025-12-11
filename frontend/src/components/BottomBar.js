import React from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { challengeAPI } from "../services/api";

export default function BottomBar() {
    const nav = useNavigation();
    const { currentUser } = useAuth();
    const { isDarkMode } = useTheme();

    const handleSpontaAI = async () => {
        if (!currentUser) {
            Alert.alert(
                "Sign In Required",
                "Please sign in to generate challenges."
            );
            return;
        }

        try {
            Alert.alert("Sponta AI", "Generate a random challenge?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Generate",
                    onPress: async () => {
                        try {
                            const idToken = await currentUser.getIdToken();
                            const response = await challengeAPI.generate(
                                idToken
                            );

                            if (response.success && response.data) {
                                Alert.alert(
                                    "Challenge Generated!",
                                    response.data.title ||
                                        response.data.description,
                                    [
                                        { text: "OK" },
                                        {
                                            text: "View Challenge",
                                            onPress: () =>
                                                nav.navigate(
                                                    "ChallengeDetails",
                                                    {
                                                        challengeId:
                                                            response.data.id ||
                                                            response.data._id,
                                                    }
                                                ),
                                        },
                                    ]
                                );
                            }
                        } catch (error) {
                            console.error("Error generating challenge:", error);
                            Alert.alert(
                                "Error",
                                "Could not generate challenge. Please try again."
                            );
                        }
                    },
                },
            ]);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const iconColor = isDarkMode ? "#f0f0f0" : "#333";

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDarkMode ? "#000" : "#fff",
                    borderTopColor: isDarkMode ? "#222" : "#eee",
                },
            ]}
        >
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => nav.navigate("Home")}
            >
                <Ionicons name="home" size={24} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => nav.navigate("MyChallenges")}
            >
                <Ionicons name="list" size={24} color={iconColor} />
            </TouchableOpacity>

            {/* Sponta AI Main Button */}
            <TouchableOpacity
                style={[
                    styles.spontaAIButton,
                    {
                        shadowColor: isDarkMode ? "#9d68ff" : "#7b3aed",
                        backgroundColor: "#7b3aed",
                    },
                ]}
                onPress={handleSpontaAI}
                activeOpacity={0.8}
            >
                <View style={styles.spontaAIContent}>
                    <Text style={styles.spontaAIText}>Sponta</Text>
                    <Text style={styles.spontaAISubtext}>AI</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => nav.navigate("Challenges")}
            >
                <Ionicons name="location" size={24} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => nav.navigate("Profile")}
            >
                <Ionicons name="person" size={24} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        position: "relative",
    },

    iconButton: {
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
    },

    spontaAIButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
        marginTop: -20,
    },

    spontaAIContent: {
        alignItems: "center",
    },

    spontaAIText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    spontaAISubtext: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "600",
        marginTop: -2,
    },
});
