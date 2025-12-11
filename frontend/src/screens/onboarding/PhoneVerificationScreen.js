import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { sendOTP, verifyOTP, formatPhoneNumber } from "../../services/phoneAuth";
import { authAPI } from "../../services/api";

export default function PhoneVerificationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { phone, isSignIn = false } = route.params || {};
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [countdown, setCountdown] = useState(0);

    // Send OTP on mount (only if phone is provided)
    // Use a small delay to ensure component is fully mounted
    useEffect(() => {
        if (phone) {
            // Small delay to prevent blocking render
            const timer = setTimeout(() => {
                handleSendCode();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async () => {
        setSending(true);
        try {
            const result = await sendOTP(phone);
            setConfirmationResult(result);
            setCountdown(60); // 60 second cooldown
            Alert.alert("Code Sent", `Verification code sent to ${formatPhoneNumber(phone)}`);
        } catch (error) {
            console.error("Send OTP error:", error);
            let errorMessage = "Failed to send verification code. Please try again.";
            
            if (error.code === "auth/invalid-phone-number") {
                errorMessage = "Invalid phone number. Please check and try again.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many requests. Please try again later.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Error", errorMessage);
        } finally {
            setSending(false);
        }
    };

    const handleVerifyCode = async () => {
        if (code.length !== 6) {
            Alert.alert("Invalid", "Please enter the 6-digit code.");
            return;
        }

        if (!confirmationResult) {
            Alert.alert("Error", "Please request a new code first.");
            return;
        }

        setLoading(true);
        try {
            // Verify OTP code using confirmation result
            const userCredential = await verifyOTP(confirmationResult, code);
            
            // Get Firebase ID token
            const idToken = await userCredential.user.getIdToken();
            
            if (isSignIn) {
                // Sign in flow - call backend
                const response = await authAPI.signin(idToken);
                if (response.success) {
                    navigation.navigate("Home");
                } else {
                    throw new Error(response.message || "Sign in failed");
                }
            } else {
                // Sign up flow - navigate to name input
                navigation.navigate("NameInput", {
                    phoneNumber: phone,
                    uid: userCredential.user.uid,
                });
            }
        } catch (error) {
            console.error("Verify OTP error:", error);
            let errorMessage = "Invalid verification code. Please try again.";
            
            if (error.code === "auth/invalid-verification-code") {
                errorMessage = "Invalid code. Please check and try again.";
            } else if (error.code === "auth/code-expired") {
                errorMessage = "Code expired. Please request a new code.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert("Verification Failed", errorMessage);
            setCode(""); // Clear code on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Verify Phone</Text>
            <Text style={styles.subtext}>
                We've sent a 6-digit code to {formatPhoneNumber(phone)}
            </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={code}
                        onChangeText={setCode}
                editable={!loading && !sending}
                    />

                    <TouchableOpacity
                style={[styles.button, (loading || sending) && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading || sending || !confirmationResult}
                    >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                        <Text style={styles.buttonText}>Verify</Text>
                )}
                    </TouchableOpacity>

            <TouchableOpacity
                style={[styles.resendButton, countdown > 0 && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={sending || countdown > 0}
            >
                {sending ? (
                    <ActivityIndicator color="#7b3aed" />
                ) : countdown > 0 ? (
                    <Text style={styles.resendText}>Resend code in {countdown}s</Text>
                ) : (
                    <Text style={styles.resendText}>Resend Code</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    header: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
    subtext: { color: "#666", marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#7b3aed",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    resendButton: {
        padding: 10,
        alignItems: "center",
    },
    resendText: {
        color: "#7b3aed",
        fontWeight: "600",
        fontSize: 14,
    },
});
