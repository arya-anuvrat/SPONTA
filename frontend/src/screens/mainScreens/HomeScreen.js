import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
    const navigation = useNavigation();

    const handleLogout = () => {
        // Mock logout for now
        alert("Logged out (mock)");
        navigation.navigate("Landing");
    };

    return (
        <View style={styles.container}>
            {/* 🔹 Top Bar with Logout Button */}
            <View style={styles.topBar}>
                <Text style={styles.logo}>SPONTA</Text>
                <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* 🔹 Main Content */}
            <View style={styles.content}>
                <Text style={styles.header}>Welcome to Sponta 🎉</Text>
                <Text style={styles.subtext}>
                    You’re all set to start discovering spontaneous challenges
                    and experiences around you.
                </Text>

                <Image
                    source={{
                        uri: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
                    }}
                    style={styles.image}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                        alert("This is where your main app flow will begin!")
                    }
                >
                    <Text style={styles.buttonText}>Explore Challenges</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 25,
        paddingTop: 60,
    },

    // 🔹 Top Bar
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    logo: {
        fontSize: 30,
        fontWeight: "800",
        color: "#7b3aed",
    },
    logoutButton: {
        backgroundColor: "#f2f2f2",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    logoutText: {
        color: "#7b3aed",
        fontWeight: "600",
        fontSize: 14,
    },

    // 🔹 Main Content
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        color: "#222",
        marginBottom: 10,
    },
    subtext: {
        fontSize: 15,
        color: "#555",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 22,
    },
    image: {
        width: 160,
        height: 160,
        marginBottom: 30,
    },
    button: {
        backgroundColor: "#7b3aed",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 40,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
