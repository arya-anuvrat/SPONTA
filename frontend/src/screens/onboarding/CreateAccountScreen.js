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

export default function CreateAccountScreen() {
    const navigation = useNavigation();
    const [phone, setPhone] = useState("");

    // 🧠 Format U.S. phone number
    const formatPhone = (text) => {
        const digits = text.replace(/\D/g, "").slice(0, 10);
        if (digits.length < 4) return digits;
        if (digits.length < 7)
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
            6
        )}`;
    };

    const handleContinue = () => {
        const clean = phone.replace(/\D/g, "");
        if (clean.length !== 10) {
            Alert.alert(
                "Invalid Number",
                "Please enter a valid 10-digit U.S. phone number."
            );
            return;
        }
        navigation.navigate("PhoneVerification", { phone: `+1${clean}` });
    };

    const handleGoogleSignIn = () => {
        Alert.alert("Mock Mode", "Simulating Google Sign-In success!");
        navigation.navigate("NameInput");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.subtext}>
                Join Sponta and start exploring spontaneous moments around you!
            </Text>

            {/* 🔹 Phone Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+1</Text>
                <TextInput
                    style={styles.input}
                    placeholder="(555) 123-4567"
                    keyboardType="number-pad"
                    maxLength={14}
                    value={phone}
                    onChangeText={(t) => setPhone(formatPhone(t))}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue with Phone</Text>
            </TouchableOpacity>

            {/* 🔹 Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>

            {/* 🔹 Google Sign-In */}
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

            {/* 🔹 Sign In Link */}
            <Text style={styles.footer}>
                Already have an account?{" "}
                <Text
                    style={styles.link}
                    onPress={() => navigation.navigate("SignIn")}
                >
                    Sign In
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

    header: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 10,
        color: "#1e1e1e",
    },
    subtext: { fontSize: 15, color: "#666", marginBottom: 30 },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    prefix: {
        color: "#7b3aed",
        fontWeight: "600",
        fontSize: 16,
        marginRight: 8,
    },
    input: { flex: 1, paddingVertical: 12, fontSize: 16 },

    button: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 25,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },
    line: { flex: 1, height: 1, backgroundColor: "#ddd" },
    orText: { marginHorizontal: 10, color: "#999", fontSize: 14 },

    googleButton: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    googleIcon: { width: 22, height: 22, marginRight: 10 },
    googleText: { fontSize: 16, color: "#333", fontWeight: "500" },

    footer: { textAlign: "center", color: "#666", marginTop: 25 },
    link: { color: "#7b3aed", fontWeight: "600" },
});
