import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
    const navigation = useNavigation();

    const handleLogout = () => {
        alert("Logged out (mock)");
        navigation.navigate("Landing");
    };

    const handleExplore = () => {
        navigation.navigate("Challenges");
    };

    return (
        <View style={styles.container}>
            {/* 🔹 Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.logo}>SPONTA</Text>
                <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* 🔹 Daily Challenge Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Today's Challenge</Text>
                <Text style={styles.cardContent}>
                    Talk to someone new today — step out of your comfort zone
                    and share one interesting fact about yourself!
                </Text>

                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => alert("Challenge Accepted! (mock)")}
                >
                    <Text style={styles.acceptText}>Accept Challenge</Text>
                </TouchableOpacity>
            </View>

            {/* 🔹 BOTTOM BUTTONS */}
            <View style={styles.bottomSection}>
                {/* My Challenges ABOVE explore */}
                <TouchableOpacity
                    style={styles.myChallengesButton}
                    onPress={() => navigation.navigate("MyChallenges")}
                >
                    <Text style={styles.myChallengesText}>My Challenges</Text>
                </TouchableOpacity>

                {/* Explore Challenges */}
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={handleExplore}
                >
                    <Text style={styles.exploreText}>Explore Challenges</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 25,
        paddingTop: 60,
    },

    // Top Bar
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logo: {
        fontSize: 30,
        fontWeight: "800",
        color: "#7b3aed",
    },
    logoutButton: {
        backgroundColor: "#f2f2f2",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    logoutText: {
        color: "#7b3aed",
        fontWeight: "600",
        fontSize: 14,
    },

    // Daily Challenge Card
    card: {
        backgroundColor: "#f9f7ff",
        borderRadius: 16,
        padding: 24,
        marginTop: 50,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#222",
        marginBottom: 10,
    },
    cardContent: {
        fontSize: 16,
        color: "#444",
        lineHeight: 22,
        marginBottom: 20,
    },
    acceptButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    acceptText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },

    // BOTTOM BUTTONS SECTION
    bottomSection: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 40,
        gap: 12,
    },

    // My Challenges
    myChallengesButton: {
        backgroundColor: "#f1e9ff",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
        borderColor: "#d6c4ff",
        borderWidth: 1,
    },
    myChallengesText: {
        color: "#7b3aed",
        fontSize: 16,
        fontWeight: "600",
    },

    // Explore
    exploreButton: {
        backgroundColor: "#7b3aed",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    exploreText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
