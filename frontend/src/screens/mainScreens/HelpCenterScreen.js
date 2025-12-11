import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext"; // ✅ use global theme

export default function HelpCenterScreen({ navigation }) {
    const { isDarkMode } = useTheme(); // ✅ global dark mode

    const FAQ = [
        {
            q: "How do I reset my password?",
            a: "Password reset is handled through your login provider.",
        },
        {
            q: "How do challenges work?",
            a: "You can browse, accept, and complete challenges from the Explore tab.",
        },
        {
            q: "How is my data used?",
            a: "We only use your data to provide app functionality.",
        },
    ];

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? "#0d0d0d" : "#f2f2f7" },
            ]}
        >
            {/* HEADER */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color={isDarkMode ? "#fff" : "#000"}
                    />
                </TouchableOpacity>

                <Text
                    style={[
                        styles.headerText,
                        { color: isDarkMode ? "#fff" : "#000" },
                    ]}
                >
                    Help Center
                </Text>

                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {FAQ.map((item, index) => (
                    <View
                        key={index}
                        style={[styles.card, isDarkMode && styles.cardDark]}
                    >
                        <Text
                            style={[
                                styles.question,
                                { color: isDarkMode ? "#fff" : "#000" },
                            ]}
                        >
                            {item.q}
                        </Text>

                        <Text
                            style={[
                                styles.answer,
                                { color: isDarkMode ? "#ccc" : "#555" },
                            ]}
                        >
                            {item.a}
                        </Text>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    headerRow: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    headerText: { fontSize: 26, fontWeight: "700" },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },

    cardDark: { backgroundColor: "#1a1a1a", shadowOpacity: 0 },

    question: { fontSize: 17, fontWeight: "600", marginBottom: 10 },

    answer: { fontSize: 15, lineHeight: 22 },
});
