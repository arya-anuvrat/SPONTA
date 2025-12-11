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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PrivacyInfoScreen({ navigation }) {
    const [darkMode, setDarkMode] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("darkMode");
            if (saved !== null) setDarkMode(saved === "true");
        })();
    }, []);

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: darkMode ? "#0d0d0d" : "#f2f2f7" },
            ]}
        >
            {/* HEADER */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color={darkMode ? "#fff" : "#000"}
                    />
                </TouchableOpacity>

                <Text
                    style={[
                        styles.headerText,
                        { color: darkMode ? "#fff" : "#000" },
                    ]}
                >
                    Privacy Information
                </Text>

                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.card, darkMode && styles.cardDark]}>
                    <Text
                        style={[
                            styles.title,
                            { color: darkMode ? "#fff" : "#000" },
                        ]}
                    >
                        How We Handle Your Data
                    </Text>

                    <Text
                        style={[
                            styles.text,
                            { color: darkMode ? "#ccc" : "#555" },
                        ]}
                    >
                        • We never sell your personal information.
                    </Text>

                    <Text
                        style={[
                            styles.text,
                            { color: darkMode ? "#ccc" : "#555" },
                        ]}
                    >
                        • Your location is stored securely and only used to
                        deliver features.
                    </Text>

                    <Text
                        style={[
                            styles.text,
                            { color: darkMode ? "#ccc" : "#555" },
                        ]}
                    >
                        • You can request account deletion anytime.
                    </Text>
                </View>

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

    title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },

    text: { fontSize: 15, marginBottom: 8, lineHeight: 22 },
});
