import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import api from "../../wrapper/axios_wrapper";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../components/BottomBar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChallengeScreen() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            const res = await api.getAllChallenges();
            const list = Array.isArray(res.data.data) ? res.data.data : [];
            setChallenges(list);
        } catch (err) {
            console.log("Failed to load challenges", err);
        } finally {
            setLoading(false);
        }
    };

    const DifficultyPill = ({ difficulty }) => {
        const colors = {
            easy: "#4CAF50",
            medium: "#FFC107",
            hard: "#EF5350",
        };

        return (
            <View
                style={[
                    styles.difficultyPill,
                    { backgroundColor: colors[difficulty] + "20" },
                ]}
            >
                <Text
                    style={[
                        styles.difficultyText,
                        { color: colors[difficulty] },
                    ]}
                >
                    {difficulty}
                </Text>
            </View>
        );
    };

    const ChallengeCard = ({ challenge }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate("ChallengeDetails", { challenge })
                }
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>{challenge.title}</Text>
                    <DifficultyPill difficulty={challenge.difficulty} />
                </View>

                <Text style={styles.category}>{challenge.category}</Text>
                <Text style={styles.points}>{challenge.points} pts</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#7b3aed" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* HEADER */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Explore Challenges</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.container}>
                {challenges.map((c) => (
                    <ChallengeCard key={c.id} challenge={c} />
                ))}
            </ScrollView>

            {/* BOTTOM BAR */}
            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },

    headerContainer: {
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
        color: "#222",
    },

    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    title: {
        fontSize: 17,
        fontWeight: "700",
        color: "#222",
        flex: 1,
        paddingRight: 10,
    },

    category: {
        fontSize: 14,
        color: "#777",
        marginBottom: 6,
    },

    points: {
        fontSize: 15,
        fontWeight: "700",
        color: "#7b3aed",
    },

    difficultyPill: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    difficultyText: {
        fontSize: 12,
        fontWeight: "700",
        textTransform: "capitalize",
    },

    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
