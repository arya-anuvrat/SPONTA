import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import BottomBar from "../../components/BottomBar";
import api from "../../wrapper/axios_wrapper";

export default function ChallengeScreen({ navigation }) {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            const res = await api.getAllChallenges();
            setChallenges(res.data.data || []);
        } catch (err) {
            console.log("Failed to load challenges", err);
        }
        setLoading(false);
    };

    const difficultyColor = {
        easy: "#D4F4DD",
        medium: "#FFE9B0",
        hard: "#FFB0B0",
    };

    const difficultyTextColor = {
        easy: "#2E7D32",
        medium: "#B77F00",
        hard: "#C62828",
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Explore Challenges" />

            {loading ? (
                <View style={{ marginTop: 50 }}>
                    <ActivityIndicator size="large" color="#7B3AED" />
                </View>
            ) : (
                <ScrollView style={{ marginTop: 10 }}>
                    {challenges.map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate("ChallengeDetails", {
                                    challenge: c,
                                })
                            }
                        >
                            <Text style={styles.title}>{c.title}</Text>

                            <View style={styles.row}>
                                <View
                                    style={[
                                        styles.difficultyBadge,
                                        {
                                            backgroundColor:
                                                difficultyColor[c.difficulty],
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.difficultyText,
                                            {
                                                color: difficultyTextColor[
                                                    c.difficulty
                                                ],
                                            },
                                        ]}
                                    >
                                        {c.difficulty}
                                    </Text>
                                </View>

                                <Text style={styles.category}>
                                    {c.category}
                                </Text>
                            </View>

                            <Text style={styles.points}>{c.points} pts</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#eee",
    },
    title: { fontSize: 18, fontWeight: "700" },
    row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    difficultyText: { fontSize: 12, fontWeight: "600" },
    category: { fontSize: 14, color: "#777" },
    points: { color: "#7B3AED", fontWeight: "700", marginTop: 6 },
});
