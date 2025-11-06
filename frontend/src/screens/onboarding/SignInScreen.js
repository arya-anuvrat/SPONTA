import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SignInScreen() {
    const navigation = useNavigation();
    const [phone, setPhone] = useState("");

    // 🧠 Format input into (XXX) XXX-XXXX as user types
    const formatPhone = (input) => {
        const digits = input.replace(/\D/g, "").slice(0, 10);
        if (digits.length < 4) return digits;
        if (digits.length < 7)
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
            6
        )}`;
    };

    const handlePhoneChange = (text) => setPhone(formatPhone(text));

    const handleContinuePhone = () => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length !== 10) {
            Alert.alert(
                "Invalid Number",
                "Please enter a valid 10-digit U.S. number."
            );
            return;
        }
        Alert.alert("Mock Mode", "Simulating phone sign-in success!");
        navigation.navigate("Home");
    };

    const handleGoogleSignIn = () => {
        Alert.alert("Mock Mode", "Simulating Google Sign-In success!");
        navigation.navigate("Home");
    };

    const handleCreateAccount = () => navigation.navigate("CreateAccount");

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>SPONTA</Text>
            <Text style={styles.tagline}>
                Seek Discomfort. Stay Spontaneous.
            </Text>

            <View style={styles.phoneContainer}>
                <Text style={styles.prefix}>+1</Text>
                <TextInput
                    style={styles.input}
                    placeholder="(555) 123-4567"
                    keyboardType="number-pad"
                    maxLength={14}
                    value={phone}
                    onChangeText={handlePhoneChange}
                />
            </View>

            <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinuePhone}
            >
                <Text style={styles.continueText}>Continue with Phone</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>

            <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
            >
                <Image
                    source={{
                        uri: "https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png",
                    }}
                    style={styles.googleIcon}
                />
                <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
                New to Sponta?{" "}
                <Text style={styles.link} onPress={handleCreateAccount}>
                    Create Account
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 30,
        justifyContent: "center",
    },

    // 🔹 Header
    logo: {
        fontSize: 44,
        fontWeight: "800",
        color: "#7b3aed",
        textAlign: "center",
        marginBottom: 6,
    },
    tagline: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 40,
    },

    // 🔹 Phone Input
    phoneContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    prefix: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7b3aed",
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: "#222",
    },

    // 🔹 Continue Button
    continueButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 25,
    },
    continueText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    // 🔹 Divider
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    orText: {
        marginHorizontal: 10,
        color: "#999",
        fontSize: 14,
    },

    // 🔹 Google Button
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        justifyContent: "center",
        paddingVertical: 14,
    },
    googleIcon: {
        width: 22,
        height: 22,
        marginRight: 10,
    },
    googleText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },

    // 🔹 Footer
    footer: {
        textAlign: "center",
        color: "#666",
        marginTop: 25,
    },
    link: {
        color: "#7b3aed",
        fontWeight: "600",
    },
});
