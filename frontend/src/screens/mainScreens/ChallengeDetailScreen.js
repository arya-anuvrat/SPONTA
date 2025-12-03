import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import BottomBar from "../../components/BottomBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChallengeDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { challenge } = route.params;

    const colors = {
        easy: "#4CAF50",
        medium: "#FFC107",
        hard: "#EF5350",
    };

    const acceptChallenge = () => {
        // mock mode for now
        alert("Challenge accepted!");
        navigation.navigate("MyChallenges");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Challenge Details</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.container}>
                <Text style={styles.title}>{challenge.title}</Text>

                <View style={styles.row}>
                    <View
                        style={[
                            styles.pill,
                            {
                                backgroundColor:
                                    colors[challenge.difficulty] + "22",
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.pillText,
                                { color: colors[challenge.difficulty] },
                            ]}
                        >
                            {challenge.difficulty}
                        </Text>
                    </View>

                    <Text style={styles.category}>{challenge.category}</Text>
                </View>

                <Text style={styles.points}>{challenge.points} pts</Text>

                <Text style={styles.description}>
                    {challenge.description || "No description available."}
                </Text>

                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={acceptChallenge}
                >
                    <Text style={styles.acceptText}>Accept Challenge</Text>
                </TouchableOpacity>
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
    title: {
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 10,
        color: "#222",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 10,
    },
    pillText: {
        fontSize: 12,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    category: {
        fontSize: 15,
        color: "#666",
    },
    points: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7b3aed",
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: "#444",
        marginBottom: 30,
        lineHeight: 22,
    },
    acceptButton: {
        backgroundColor: "#7b3aed",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 50,
    },
    acceptText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
