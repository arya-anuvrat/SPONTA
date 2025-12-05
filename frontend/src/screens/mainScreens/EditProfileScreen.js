import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function EditProfileScreen() {
    const navigation = useNavigation();

    // Example preloaded user data
    const [name, setName] = useState("Anuvrat Arya");
    const [email, setEmail] = useState("anuvrat@example.com");
    const [phone, setPhone] = useState("+1 (608) 960-5025");

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    {/* HEADER */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons
                                name="chevron-back"
                                size={28}
                                color="#111"
                            />
                        </TouchableOpacity>
                        <Text style={styles.header}>Edit Profile</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {/* FORM SECTION */}
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder="Enter name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholder="Enter email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            style={styles.input}
                            placeholder="Enter phone"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* ACCOUNT SECTION */}
                    <Text style={[styles.sectionTitle, { marginTop: 35 }]}>
                        Account Settings
                    </Text>

                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowText}>Change Password</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <Text style={[styles.rowText, { color: "#d9534f" }]}>
                            Delete Account
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#d9534f"
                        />
                    </TouchableOpacity>
                </ScrollView>

                {/* SAVE BUTTON (STICKY) */}
                <View style={styles.saveBar}>
                    <TouchableOpacity style={styles.saveButton}>
                        <Text style={styles.saveText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingTop: 10,
        paddingBottom: 40,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    header: {
        flex: 1,
        textAlign: "center",
        fontSize: 28,
        fontWeight: "800",
        color: "#111",
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#777",
        marginBottom: 12,
        marginLeft: 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fafafa",
        borderRadius: 14,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 16,
    },

    row: {
        backgroundColor: "#fff",
        paddingVertical: 18,
        paddingHorizontal: 15,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    rowText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },

    saveBar: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    saveButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
});
