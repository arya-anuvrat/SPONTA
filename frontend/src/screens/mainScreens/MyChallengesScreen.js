import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../components/BottomBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyChallengesScreen() {
    const navigation = useNavigation();

    // 🔥 use the REAL mock challenge (from your Challenge Detail screen)
    const myChallenges = [
        {
            id: "med-001",
            title: "Meditation Session",
            category: "wellness",
            difficulty: "easy",
            points: 10,
            description:
                "Complete a 10-minute meditation or mindfulness session.",
            status: "accepted",
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Challenges</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.container}>
                {myChallenges.map((c) => (
                    <TouchableOpacity
                        key={c.id}
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("MyChallengeDetail", {
                                challenge: c,
                            })
                        }
                    >
                        <Text style={styles.title}>{c.title}</Text>

                        {/* Difficulty + Category Row */}
                        <View style={styles.row}>
                            <View
                                style={[
                                    styles.difficultyPill,
                                    c.difficulty === "easy"
                                        ? { backgroundColor: "#d1f7c4" }
                                        : c.difficulty === "medium"
                                        ? { backgroundColor: "#ffe9a3" }
                                        : { backgroundColor: "#ffb3b3" },
                                ]}
                            >
                                <Text style={styles.pillText}>
                                    {c.difficulty?.charAt(0).toUpperCase() +
                                        c.difficulty?.slice(1)}
                                </Text>
                            </View>

                            <Text style={styles.category}>{c.category}</Text>
                        </View>

                        <Text style={styles.points}>{c.points} pts</Text>

                        <Text style={styles.status}>Status: {c.status}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
    },
    status: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
    },
    points: {
        color: "#7b3aed",
        fontSize: 15,
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },

    difficultyPill: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginRight: 8,
    },

    pillText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
    },

    category: {
        fontSize: 14,
        color: "#777",
    },

    points: {
        color: "#7b3aed",
        fontWeight: "700",
        fontSize: 16,
        marginTop: 10,
    },

    status: {
        marginTop: 6,
        fontSize: 14,
        color: "#666",
    },

    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 14,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
});
