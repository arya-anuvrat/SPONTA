import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomBar from "../../components/BottomBar";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function MyChallengeDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { challenge } = route.params;

    const handleVerify = () => alert("Verification submitted (mock)");
    const handleComplete = () => alert("Challenge marked complete (mock)");

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Challenge Details</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Card Container */}
                <View style={styles.card}>
                    <Text style={styles.title}>{challenge.title}</Text>

                    <Text style={styles.label}>
                        Status:{" "}
                        <Text style={styles.value}>{challenge.status}</Text>
                    </Text>

                    <Text style={styles.label}>
                        Points:{" "}
                        <Text style={styles.points}>{challenge.points}</Text>
                    </Text>

                    {/* Optional description */}
                    <Text style={styles.description}>
                        Complete this challenge to earn points and boost your
                        streak! Step outside your comfort zone and try something
                        spontaneous.
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={handleVerify}
                    >
                        <Text style={styles.btnText}>Verify Challenge</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={handleComplete}
                    >
                        <Text style={styles.btnText}>Mark Complete</Text>
                    </TouchableOpacity>
                </View>
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

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 25,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 10,
    },

    label: {
        fontSize: 16,
        color: "#666",
        marginTop: 8,
    },

    value: {
        fontWeight: "700",
        color: "#333",
    },

    points: {
        color: "#7b3aed",
        fontWeight: "700",
    },

    description: {
        marginTop: 20,
        fontSize: 15,
        lineHeight: 22,
        color: "#444",
    },

    buttonSection: {
        marginTop: 30,
        paddingHorizontal: 20,
    },

    verifyBtn: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 15,
    },

    completeBtn: {
        backgroundColor: "#222",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
