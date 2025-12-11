import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";

export default function ProfileScreen() {
    const navigation = useNavigation();

    const user = {
        name: "Anuvrat Arya",
        email: "anuvrat@example.com",
        streak: 4,
        challengesCompleted: 27,
        points: 340,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Profile</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* PROFILE HERO CARD */}
                <View style={styles.heroCard}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarRing} />
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.name[0]}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>

                    <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={18} color="#ff6a00" />
                        <Text style={styles.streakText}>
                            {user.streak}-Day Streak
                        </Text>
                    </View>
                </View>

                {/* STATS */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {user.challengesCompleted}
                        </Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{user.points}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{user.streak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                </View>

                {/* ACCOUNT SETTINGS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <Text style={styles.rowText}>Edit Profile</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => navigation.navigate("Notifications")}
                    >
                        <Text style={styles.rowText}>Notifications</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => navigation.navigate("PrivacySettings")}
                    >
                        <Text style={styles.rowText}>Privacy Settings</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>

                {/* SUPPORT */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => navigation.navigate("HelpCenter")}
                    >
                        <Text style={styles.rowText}>Help Center</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => navigation.navigate("ContactUs")}
                    >
                        <Text style={styles.rowText}>Contact Us</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>

                {/* LOGOUT */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={async () => {
                        Alert.alert(
                            "Log Out",
                            "Are you sure you want to log out?",
                            [
                                {
                                    text: "Cancel",
                                    style: "cancel",
                                },
                                {
                                    text: "Log Out",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            // Sign out from Firebase
                                            if (auth && auth.currentUser) {
                                                await signOut(auth);
                                                console.log("✅ Signed out from Firebase");
                                            }
                                        } catch (error) {
                                            console.error("Error signing out:", error);
                                            Alert.alert("Error", "Failed to sign out. Please try again.");
                                            return;
                                        }
                                        // Navigate to landing screen
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: "Landing" }],
                                        });
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingTop: 10,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },

    header: {
        flex: 1,
        textAlign: "center",
        fontSize: 28,
        fontWeight: "800",
        color: "#111",
    },

    heroCard: {
        backgroundColor: "#f5f0ff",
        borderRadius: 30,
        paddingVertical: 40,
        alignItems: "center",
        marginBottom: 30,
    },

    avatarWrapper: {
        width: 110,
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    avatarRing: {
        position: "absolute",
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: "#7b3aed",
        opacity: 0.3,
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#7b3aed",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "800",
    },

    name: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 3,
    },

    email: {
        fontSize: 15,
        color: "#666",
        marginBottom: 15,
    },

    streakBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffe8d9",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 40,
    },

    streakText: {
        marginLeft: 6,
        fontSize: 15,
        fontWeight: "600",
        color: "#d45a00",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 35,
    },

    statBox: {
        flex: 1,
        backgroundColor: "#fafafa",
        borderRadius: 18,
        paddingVertical: 18,
        marginHorizontal: 5,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
    },

    statValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#7b3aed",
    },

    statLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 3,
    },

    section: {
        marginBottom: 28,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#777",
        marginBottom: 12,
        marginLeft: 4,
        textTransform: "uppercase",
    },

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

    rowText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },

    logoutButton: {
        backgroundColor: "#ffe6e6",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
    },

    logoutText: {
        color: "#d9534f",
        fontSize: 17,
        fontWeight: "700",
    },
});
