import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { userAPI } from "../../services/api";
import { auth } from "../../services/firebase";

export default function EditProfileScreen({ navigation, route }) {
    const { user } = route.params;

    const [darkMode, setDarkMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        displayName: user.displayName || "",
        dateOfBirth: user.dateOfBirth || "",
        college: user.college || "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    // Load Dark Mode
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("darkMode");
            if (saved !== null) setDarkMode(saved === "true");
        })();
    }, []);

    const formatDisplayDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const saveChanges = async () => {
        try {
            setSaving(true);

            const token = await auth.currentUser.getIdToken();

            await userAPI.updateProfile(token, {
                displayName: profile.displayName,
                dateOfBirth: profile.dateOfBirth,
                college: profile.college,
            });

            navigation.goBack();
        } catch (e) {
            console.log("Save Error:", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: darkMode ? "#0d0d0d" : "#f2f2f7" },
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
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
                        Edit Profile
                    </Text>

                    <View style={{ width: 28 }} />
                </View>

                {/* FORM CARD */}
                <View style={[styles.card, darkMode && styles.cardDark]}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: darkMode ? "#ddd" : "#666" },
                        ]}
                    >
                        Personal Information
                    </Text>

                    {/* DISPLAY NAME */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.label,
                                { color: darkMode ? "#ccc" : "#555" },
                            ]}
                        >
                            Display Name
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: darkMode ? "#222" : "#eee",
                                    color: darkMode ? "#fff" : "#000",
                                },
                            ]}
                            value={profile.displayName}
                            onChangeText={(t) =>
                                setProfile({ ...profile, displayName: t })
                            }
                        />
                    </View>

                    {/* EMAIL - LOCKED */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.label,
                                { color: darkMode ? "#ccc" : "#555" },
                            ]}
                        >
                            Email (locked)
                        </Text>
                        <TextInput
                            editable={false}
                            style={[
                                styles.input,
                                {
                                    backgroundColor: darkMode ? "#333" : "#ddd",
                                    color: darkMode ? "#999" : "#666",
                                },
                            ]}
                            value={user.email}
                        />
                    </View>

                    {/* DOB WITH DATE PICKER */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.label,
                                { color: darkMode ? "#ccc" : "#555" },
                            ]}
                        >
                            Date of Birth
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                        >
                            <View
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: darkMode
                                            ? "#222"
                                            : "#eee",
                                        justifyContent: "center",
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: darkMode ? "#fff" : "#000",
                                    }}
                                >
                                    {profile.dateOfBirth
                                        ? formatDisplayDate(profile.dateOfBirth)
                                        : "Select Date"}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={
                                    profile.dateOfBirth
                                        ? new Date(profile.dateOfBirth)
                                        : new Date()
                                }
                                mode="date"
                                display="spinner"
                                themeVariant={darkMode ? "dark" : "light"}
                                onChange={(event, selected) => {
                                    if (Platform.OS === "android") {
                                        setShowDatePicker(false);
                                    }
                                    if (selected) {
                                        setProfile({
                                            ...profile,
                                            dateOfBirth: selected
                                                .toISOString()
                                                .split("T")[0],
                                        });
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* COLLEGE FIELD */}
                    <View style={styles.fieldGroup}>
                        <Text
                            style={[
                                styles.label,
                                { color: darkMode ? "#ccc" : "#555" },
                            ]}
                        >
                            College
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: darkMode ? "#222" : "#eee",
                                    color: darkMode ? "#fff" : "#000",
                                },
                            ]}
                            value={profile.college}
                            onChangeText={(t) =>
                                setProfile({ ...profile, college: t })
                            }
                        />
                    </View>
                </View>

                {/* SAVE BUTTON */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveChanges}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

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

    headerText: {
        fontSize: 30,
        fontWeight: "700",
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 10,
    },
    cardDark: {
        backgroundColor: "#1a1a1a",
        shadowOpacity: 0,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 14,
    },

    fieldGroup: { marginBottom: 18 },

    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 6,
    },

    input: {
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
    },

    saveButton: {
        backgroundColor: "#7b3aed",
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },

    saveText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});
