import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from "../../components/BottomBar";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
    const navigation = useNavigation();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const streak = 4;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <Text style={styles.logo}>SPONTA</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Profile")}
                    >
                        <Text style={styles.profileLink}>Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* GREETING */}
                <Text style={styles.greeting}>{getGreeting()} Anuvrat Arya👋</Text>

                {/* STREAK CARD */}
                <View style={styles.streakCard}>
                    <Text style={styles.streakLabel}>Your Streak</Text>
                    <Text style={styles.streakNumber}>{streak}🔥</Text>
                </View>

                {/* DAILY CHALLENGE */}
                <View style={styles.dailyCard}>
                    <Text style={styles.dailyTitle}>Today's Challenge</Text>
                    <Text style={styles.dailySubtitle}>
                        Step out of your comfort zone today!
                    </Text>
                </View>

                {/* CTA BUTTONS SECTION */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={() => navigation.navigate("MyChallenges")}
                    >
                        <Text style={styles.mainButtonText}>My Challenges</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.mainButton, { marginTop: 15 }]}
                        onPress={() => navigation.navigate("Challenges")}
                    >
                        <Text style={styles.mainButtonText}>
                            Explore Challenges
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* spacing so buttons don’t overlap bottom bar */}
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
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 40, // scroll padding
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    logo: {
        fontSize: 32,
        fontWeight: "900",
        color: "#7b3aed",
    },
    profileLink: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7b3aed",
    },

    greeting: {
        fontSize: 21,
        fontWeight: "700",
        marginBottom: 20,
        color: "#222",
    },

    streakCard: {
        backgroundColor: "#f3e9ff",
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 25,
    },
    streakLabel: {
        fontSize: 14,
        color: "#444",
    },
    streakNumber: {
        fontSize: 32,
        fontWeight: "800",
        color: "#7b3aed",
    },

    dailyCard: {
        backgroundColor: "#f5edff",
        padding: 20,
        borderRadius: 18,
        marginBottom: 35,
    },
    dailyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#222",
    },
    dailySubtitle: {
        marginTop: 5,
        fontSize: 15,
        color: "#666",
    },

    buttonSection: {
        marginTop: 15,
    },

    mainButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        width: "100%",
    },
    mainButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
});
