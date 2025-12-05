import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HelpCenterScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Help Center</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowText}>FAQ</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowText}>Troubleshooting</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowText}>App Guide</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 25, paddingTop: 10 },

    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    header: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "800" },

    section: { marginTop: 10 },

    row: {
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },

    rowText: { fontSize: 16, fontWeight: "500", color: "#333" },
});
