import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext"; // ✅ use global theme

export default function ContactUsScreen({ navigation }) {
    const { isDarkMode } = useTheme(); // ✅ global dark mode
    const [message, setMessage] = useState("");

    const submit = () => {
        if (!message.trim())
            return Alert.alert("Error", "Please enter a message.");

        Alert.alert("Message Sent", "We will get back to you shortly.");
        setMessage("");
    };

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
                    Contact Us
                </Text>

                <View style={{ width: 28 }} />
            </View>

            <View style={[styles.card, isDarkMode && styles.cardDark]}>
                <Text
                    style={[
                        styles.label,
                        { color: isDarkMode ? "#ccc" : "#555" },
                    ]}
                >
                    Your Message
                </Text>

                <TextInput
                    style={[styles.input, isDarkMode && styles.inputDark]}
                    multiline
                    numberOfLines={6}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Write your message here..."
                    placeholderTextColor={isDarkMode ? "#777" : "#999"}
                />

                <TouchableOpacity style={styles.button} onPress={submit}>
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
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

    label: { fontSize: 15, fontWeight: "600", marginBottom: 10 },

    input: {
        backgroundColor: "#f4f4f4",
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        height: 150,
        textAlignVertical: "top",
    },

    inputDark: { backgroundColor: "#2a2a2a", color: "#fff" },

    button: {
        backgroundColor: "#7b3aed",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 18,
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
});
