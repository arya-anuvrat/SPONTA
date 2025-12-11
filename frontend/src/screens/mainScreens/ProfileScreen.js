// 🌟 BEAUTIFIED + ICON-ENHANCED PROFILE PAGE 🌟
// (ThemeContext-Integrated Version — UI 100% unchanged)

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Switch,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI } from "../../services/api";
import { auth } from "../../services/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileScreen({ navigation }) {
    const { isDarkMode, colors, toggleTheme } = useTheme();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProfile = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const token = await auth.currentUser.getIdToken();
            const response = await userAPI.getProfile(token);
            setUser(response.data);
        } catch (err) {
            console.error("Profile Load Error:", err);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const onRefresh = () => loadProfile(true);

    // Loading state
    if (loading || !user) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: isDarkMode ? "#000" : "#fff" },
                ]}
            >
                <View style={{ marginTop: 40 }}>
                    <ActivityIndicator size="large" color="#7b3aed" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? "#0d0d0d" : "#f2f2f7" },
            ]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#7b3aed"
                    />
                }
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
                        Profile
                    </Text>

                    <View style={{ width: 28 }} />
                </View>

                {/* PROFILE CARD */}
                <View
                    style={[
                        styles.card,
                        { marginTop: 20 },
                        isDarkMode && styles.cardDark,
                    ]}
                >
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarGlow} />
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.displayName
                                    ? user.displayName[0].toUpperCase()
                                    : "U"}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={[
                            styles.name,
                            { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                    >
                        {user.displayName}
                    </Text>

                    <Text
                        style={[
                            styles.email,
                            { color: isDarkMode ? "#ccc" : "#777" },
                        ]}
                    >
                        {user.email}
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statValue,
                                    { color: isDarkMode ? "#fff" : "#000" },
                                ]}
                            >
                                {user.points ?? 0}
                            </Text>
                            <Text
                                style={[
                                    styles.statLabel,
                                    { color: isDarkMode ? "#aaa" : "#555" },
                                ]}
                            >
                                ⭐ Points
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text
                                style={[
                                    styles.statValue,
                                    { color: isDarkMode ? "#fff" : "#000" },
                                ]}
                            >
                                {user.currentStreak ?? 0}
                            </Text>
                            <Text
                                style={[
                                    styles.statLabel,
                                    { color: isDarkMode ? "#aaa" : "#555" },
                                ]}
                            >
                                🔥 Streak
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ACCOUNT OPTIONS */}
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDarkMode && styles.sectionDark,
                        ]}
                    >
                        👤 Account
                    </Text>

                    <OptionRow
                        title="Edit Profile"
                        icon="person-circle-outline"
                        darkMode={isDarkMode}
                        onPress={() =>
                            navigation.navigate("EditProfile", { user })
                        }
                    />

                    <OptionRow
                        title="Privacy Information"
                        icon="shield-checkmark-outline"
                        darkMode={isDarkMode}
                        onPress={() => navigation.navigate("PrivacySettings")}
                    />
                </View>

                {/* APP SETTINGS */}
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDarkMode && styles.sectionDark,
                        ]}
                    >
                        ⚙️ App Settings
                    </Text>

                    <View style={styles.rowBetween}>
                        <View style={styles.rowLeft}>
                            <Ionicons
                                name="moon-outline"
                                size={22}
                                color={isDarkMode ? "#b39cff" : "#444"}
                                style={{ marginRight: 10 }}
                            />
                            <Text
                                style={[
                                    styles.rowText,
                                    { color: isDarkMode ? "#fff" : "#000" },
                                ]}
                            >
                                Dark Mode
                            </Text>
                        </View>

                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            thumbColor={isDarkMode ? "#7b3aed" : "#ccc"}
                            trackColor={{ true: "#b197ff", false: "#888" }}
                        />
                    </View>
                </View>

                {/* SUPPORT */}
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDarkMode && styles.sectionDark,
                        ]}
                    >
                        💬 Support
                    </Text>

                    <OptionRow
                        title="Contact Us"
                        icon="mail-outline"
                        darkMode={isDarkMode}
                        onPress={() => navigation.navigate("ContactUs")}
                    />

                    <OptionRow
                        title="Help Center"
                        icon="help-circle-outline"
                        darkMode={isDarkMode}
                        onPress={() => navigation.navigate("HelpCenter")}
                    />
                </View>

                {/* LOGOUT */}
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            isDarkMode && styles.sectionDark,
                        ]}
                    >
                        🏁 End Session
                    </Text>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => {
                            Alert.alert(
                                "Logout",
                                "Are you sure you want to logout?",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel",
                                    },
                                    {
                                        text: "Logout",
                                        style: "destructive",
                                        onPress: async () => {
                                            try {
                                                await firebaseSignOut(auth);
                                                // Clear AsyncStorage
                                                await AsyncStorage.clear();
                                                // Navigate to login screen
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: "Landing" }],
                                                });
                                            } catch (error) {
                                                console.error("Error signing out:", error);
                                                Alert.alert("Error", "Failed to logout. Please try again.");
                                            }
                                        },
                                    },
                                ]
                            );
                        }}
                    >
                        <View style={styles.rowLeft}>
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color={isDarkMode ? "#ff7b7b" : "#d00"}
                                style={{ marginRight: 12 }}
                            />
                            <Text
                                style={[
                                    styles.rowText,
                                    { color: isDarkMode ? "#ff7b7b" : "#d00" },
                                ]}
                            >
                                Logout
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDarkMode ? "#aaa" : "#999"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// 🔥 Reusable Option Component
function OptionRow({ title, icon, darkMode, onPress }) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={styles.rowLeft}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={darkMode ? "#b39cff" : "#444"}
                    style={{ marginRight: 12 }}
                />
                <Text
                    style={[
                        styles.rowText,
                        { color: darkMode ? "#fff" : "#000" },
                    ]}
                >
                    {title}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={20}
                color={darkMode ? "#aaa" : "#999"}
            />
        </TouchableOpacity>
    );
}

// 🌟 Styles (UNCHANGED)
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
    headerText: { fontSize: 32, fontWeight: "700" },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginBottom: 18,
        padding: 20,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: "#1a1a1a",
        shadowOpacity: 0,
    },

    avatarWrapper: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    avatarGlow: {
        position: "absolute",
        width: 110,
        height: 110,
        borderRadius: 60,
        backgroundColor: "#7b3aed33",
        blurRadius: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 50,
        backgroundColor: "#7b3aed",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 38,
        fontWeight: "bold",
    },

    name: { fontSize: 22, fontWeight: "700", textAlign: "center" },
    email: { fontSize: 15, textAlign: "center", marginTop: 4 },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20,
    },
    statItem: { alignItems: "center" },
    statValue: { fontSize: 24, fontWeight: "700" },
    statLabel: { fontSize: 13, marginTop: 2 },

    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 14,
        opacity: 0.8,
    },
    sectionDark: { color: "#ddd" },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
    },

    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    rowText: {
        fontSize: 16,
        fontWeight: "500",
    },

    logoutButton: {
        paddingVertical: 16,
    },

    logoutText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
