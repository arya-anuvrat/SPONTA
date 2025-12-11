import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword, sendEmailVerification, reload, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { validateEmail, validatePassword, validatePasswordMatch, getPasswordStrength } from "../../utils/validators";
import { authAPI } from "../../services/api";

export default function CreateAccountScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Real-time validation
    const handleEmailChange = (text) => {
        setEmail(text);
        if (text) {
            const validation = validateEmail(text);
            setEmailError(validation.valid ? "" : validation.error);
        } else {
            setEmailError("");
        }
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (text) {
            const validation = validatePassword(text);
            setPasswordError(validation.valid ? "" : validation.error);
        } else {
            setPasswordError("");
        }
    };

    const handleConfirmPasswordChange = (text) => {
        setConfirmPassword(text);
        if (text && password) {
            const validation = validatePasswordMatch(password, text);
            setConfirmPasswordError(validation.valid ? "" : validation.error);
        } else {
            setConfirmPasswordError("");
        }
    };

    const handleCreateAccount = async () => {
        // Reset errors
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        // Validate all fields
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            setEmailError(emailValidation.error);
            Alert.alert("Validation Error", emailValidation.error);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            setPasswordError(passwordValidation.error);
            Alert.alert("Validation Error", passwordValidation.error);
            return;
        }

        const confirmValidation = validatePasswordMatch(password, confirmPassword);
        if (!confirmValidation.valid) {
            setConfirmPasswordError(confirmValidation.error);
            Alert.alert("Validation Error", confirmValidation.error);
            return;
        }

        if (!agreedToTerms) {
            Alert.alert("Terms Required", "Please agree to the Terms of Service and Privacy Policy to continue.");
            return;
        }

        setLoading(true);
        try {
            // Check if Firebase auth is initialized
            if (!auth) {
                throw new Error("Firebase authentication is not initialized. Please check your Firebase configuration.");
            }

            let userCredential;
            let isNewUser = false;

            // Try to create user, but handle if user already exists
            try {
                userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email.trim().toLowerCase(),
                    password
                );
                isNewUser = true;
                console.log("New user created");
            } catch (createError) {
                // If user already exists, sign them in instead
                if (createError.code === "auth/email-already-in-use") {
                    console.log("User already exists, signing in...");
                    try {
                        userCredential = await signInWithEmailAndPassword(
                            auth,
                            email.trim().toLowerCase(),
                            password
                        );
                        // Reload to get latest verification status
                        await reload(userCredential.user);
                        console.log("Signed in existing user");
                    } catch (signInError) {
                        throw new Error("Account exists but password is incorrect. Please sign in instead.");
                    }
                } else {
                    throw createError;
                }
            }
            
            // Check if email is already verified
            if (userCredential.user.emailVerified) {
                // Email already verified, proceed to name input
                navigation.navigate("NameInput", { 
                    email: email.trim().toLowerCase(),
                    uid: userCredential.user.uid 
                });
                setLoading(false);
                return;
            }
            
            // Email not verified - send verification email
            try {
                await sendEmailVerification(userCredential.user);
                console.log("Email verification sent");
            } catch (verificationError) {
                console.warn("Failed to send verification email:", verificationError);
                Alert.alert(
                    "Verification Email Error",
                    "We couldn't send the verification email. Please try again or contact support.",
                    [{ text: "OK" }]
                );
                setLoading(false);
                return;
            }
            
            // BLOCK navigation until email is verified
            const checkVerification = async () => {
                try {
                    await reload(userCredential.user);
                    
                    if (userCredential.user.emailVerified) {
                        navigation.navigate("NameInput", { 
                            email: email.trim().toLowerCase(),
                            uid: userCredential.user.uid 
                        });
                    } else {
                        Alert.alert(
                            "Email Not Verified",
                            "Your email hasn't been verified yet. Please check your inbox and click the verification link.",
                            [
                                {
                                    text: "Check Again",
                                    onPress: checkVerification
                                },
                                {
                                    text: "Resend Email",
                                    onPress: async () => {
                                        try {
                                            await sendEmailVerification(userCredential.user);
                                            Alert.alert("Email Sent", "Verification email has been resent. Please check your inbox.");
                                        } catch (error) {
                                            Alert.alert("Error", "Failed to resend verification email. Please try again.");
                                        }
                                    }
                                }
                            ]
                        );
                    }
                } catch (reloadError) {
                    console.error("Error reloading user:", reloadError);
                    Alert.alert(
                        "Error",
                        "Could not verify email status. Please try again.",
                        [{ text: "OK" }]
                    );
                }
            };
            
            Alert.alert(
                "Verify Your Email",
                isNewUser 
                    ? "We've sent a verification link to your email. Please check your inbox and click the link to verify your email before continuing."
                    : "Your email hasn't been verified yet. We've sent a new verification link. Please check your inbox and click the link to verify your email.",
                [
                    {
                        text: "I've Verified",
                        onPress: checkVerification
                    },
                    {
                        text: "Resend Email",
                        onPress: async () => {
                            try {
                                await sendEmailVerification(userCredential.user);
                                Alert.alert("Email Sent", "Verification email has been resent. Please check your inbox.");
                            } catch (error) {
                                Alert.alert("Error", "Failed to resend verification email. Please try again.");
                            }
                        }
                    }
                ],
                { cancelable: false } // User must verify before continuing
            );
        } catch (error) {
            console.error("Create account error:", error);
            let errorMessage = "Failed to create account. Please try again.";
            
            if (error.code === "auth/email-already-in-use") {
                errorMessage = "An account with this email already exists. Please sign in instead.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak. Please use a stronger password.";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Account Creation Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoS}>S</Text>
                <Text style={styles.logoPonta}>ponta</Text>
            </View>
            <Text style={styles.seekDiscomfort}>SEEK DISCOMFORT</Text>
            <Text style={styles.header}>Create Account</Text>
            

            {/* 🔹 Email Input */}
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

            {/* 🔹 Password Input */}
            <View>
                <TextInput
                    style={[styles.input, passwordError && styles.inputError]}
                    placeholder="Password (min 8 characters)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={handlePasswordChange}
                    editable={!loading}
                />
                {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                ) : password ? (
                    <Text style={[styles.strengthText, styles[`strength${getPasswordStrength(password).charAt(0).toUpperCase() + getPasswordStrength(password).slice(1)}`]]}>
                        Password strength: {getPasswordStrength(password)}
                    </Text>
                ) : null}
            </View>

            {/* 🔹 Confirm Password Input */}
            <TextInput
                style={[styles.input, confirmPasswordError && styles.inputError]}
                placeholder="Confirm Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                editable={!loading}
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleCreateAccount}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
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

            {/* Terms Agreement */}
            <View style={styles.termsContainer}>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                        {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    By tapping 'Create account', you agree to our{" "}
                    <Text style={styles.termsLink} onPress={() => Linking.openURL('https://sponta.app/terms')}>
                        Terms of Service
                    </Text>
                    . Learn how we process your data in our{" "}
                    <Text style={styles.termsLink} onPress={() => Linking.openURL('https://sponta.app/privacy')}>
                        Privacy Policy
                    </Text>
                    {" "}and{" "}
                    <Text style={styles.termsLink} onPress={() => Linking.openURL('https://sponta.app/cookies')}>
                        Cookies Policy
                    </Text>
                    .
                </Text>
            </View>
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
        marginBottom: 20,
        letterSpacing: 1,
    },
    header: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 10,
        color: "#1e1e1e",
    },
    subtext: { fontSize: 15, color: "#666", marginBottom: 20 },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
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
    strengthText: {
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
        fontWeight: "500",
    },
    strengthWeak: {
        color: "#ff4444",
    },
    strengthMedium: {
        color: "#ffaa00",
    },
    strengthStrong: {
        color: "#00aa00",
    },

    button: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 25,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    footer: { textAlign: "center", color: "#666", marginTop: 25 },
    link: { color: "#7b3aed", fontWeight: "600" },
    // 🔹 Terms Agreement
    termsContainer: {
        flexDirection: "row",
        marginTop: 20,
        paddingHorizontal: 5,
    },
    checkboxContainer: {
        marginRight: 10,
        marginTop: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    checkboxChecked: {
        backgroundColor: "#7b3aed",
        borderColor: "#7b3aed",
    },
    checkmark: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    termsText: {
        flex: 1,
        fontSize: 11,
        color: "#999",
        lineHeight: 16,
    },
    termsLink: {
        color: "#7b3aed",
        textDecorationLine: "underline",
    },
});
