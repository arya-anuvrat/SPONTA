import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { authAPI } from "../../services/api";
import { validateEmail } from "../../utils/validators";

export default function SignInScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    const handleEmailChange = (text) => {
        setEmail(text);
        if (text) {
            const validation = validateEmail(text);
            setEmailError(validation.valid ? "" : validation.error);
        } else {
            setEmailError("");
        }
    };

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        // Validate email format
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            setEmailError(emailValidation.error);
            Alert.alert("Validation Error", emailValidation.error);
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            // Check if Firebase auth is initialized
            if (!auth) {
                throw new Error("Firebase authentication is not initialized. Please check your Firebase configuration.");
            }

            // Normalize email to lowercase and trim
            const normalizedEmail = email.trim().toLowerCase();
            
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                normalizedEmail,
                password
            );
            
            // Get Firebase ID token
            const idToken = await userCredential.user.getIdToken();
            
            // Call backend API to sign in
            const response = await authAPI.signin(idToken);
            
            if (response.success) {
                // Navigation will happen automatically via AuthContext
                navigation.navigate("Home");
            } else {
                throw new Error(response.message || "Sign in failed");
            }
        } catch (error) {
            console.error("Sign in error:", error);
            let errorMessage = "Failed to sign in. Please try again.";
            
            if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            } else if (error.code === "auth/invalid-credential") {
                errorMessage = "Invalid email or password. Please check your credentials and try again.";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Sign In Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => navigation.navigate("CreateAccount");

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoS}>S</Text>
                <Text style={styles.logoPonta}>ponta</Text>
            </View>
            <Text style={styles.seekDiscomfort}>SEEK DISCOMFORT</Text>
            <Text style={styles.tagline}>
                Stay Spontaneous.
            </Text>

            <View>
                <TextInput
                    style={[styles.input, emailError && styles.inputError]}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={handleEmailChange}
                    editable={!loading}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.continueButton, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.continueText}>Sign In</Text>
                )}
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
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    logoS: {
        fontSize: 44,
        fontWeight: "800",
        color: "#000",
    },
    logoPonta: {
        fontSize: 44,
        fontWeight: "800",
        color: "#7b3aed",
    },
    seekDiscomfort: {
        fontSize: 32,
        fontWeight: "900",
        color: "#000",
        textAlign: "center",
        marginBottom: 10,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },

    // 🔹 Input
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#222",
        marginBottom: 5,
    },
    inputError: {
        borderColor: "#ff4444",
    },
    errorText: {
        color: "#ff4444",
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
    },

    // 🔹 Continue Button
    continueButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 25,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    continueText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
