import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LandingScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>SPONTA</Text>
            <Text style={styles.slogan}>
                Seek Discomfort. Start Spontaneously.
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("CreateAccount")}
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate("SignIn")}
                style={styles.signInLink}
            >
                <Text style={styles.signInText}>
                    Already have an account? Sign In
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 30,
    },
    logo: {
        fontSize: 48,
        fontWeight: "800",
        color: "#7b3aed",
        marginBottom: 10,
    },
    slogan: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 50,
    },
    button: {
        backgroundColor: "#7b3aed",
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 40,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 18,
    },
    signInLink: {
        marginTop: 20,
    },
    signInText: {
        color: "#7b3aed",
        fontSize: 14,
    },
});
