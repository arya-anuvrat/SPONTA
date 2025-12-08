import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import BottomBar from "../../components/BottomBar";

export default function MyChallengesScreen({ navigation }) {
    const [myChallenges] = useState([
        {
            id: "1",
            title: "Meditation Session",
            difficulty: "easy",
            category: "wellness",
            points: 10,
            status: "accepted",
        },
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <Header title="My Challenges" />

            <ScrollView style={{ marginTop: 10 }}>
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
                        <Text style={styles.status}>Status: {c.status}</Text>
                        <Text style={styles.points}>{c.points} pts</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    card: {
        backgroundColor: "#fff",
        padding: 18,
        marginHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 15,
    },
    title: { fontSize: 18, fontWeight: "700" },
    status: { color: "#777", marginTop: 4 },
    points: { marginTop: 6, color: "#7B3AED", fontWeight: "600" },
});
