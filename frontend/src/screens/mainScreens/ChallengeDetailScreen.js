import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";

export default function ChallengeDetailScreen({ route }) {
    const { challenge } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Challenge Details" />

            <ScrollView style={styles.content}>
                <Text style={styles.title}>{challenge.title}</Text>

                <Text style={styles.category}>{challenge.category}</Text>
                <Text style={styles.points}>{challenge.points} pts</Text>

                <Text style={styles.description}>
                    {challenge.description || "No description provided."}
                </Text>

                <TouchableOpacity style={styles.acceptButton}>
                    <Text style={styles.acceptText}>Accept Challenge</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20 },
    title: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
    category: { color: "#777", fontSize: 16 },
    points: { marginTop: 6, color: "#7B3AED", fontWeight: "700" },
    description: { marginTop: 20, color: "#444", fontSize: 15, lineHeight: 22 },
    acceptButton: {
        backgroundColor: "#7B3AED",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 25,
    },
    acceptText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
