import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth } from "../../services/firebase";
import { reload } from "firebase/auth";

export default function NameInputScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, uid } = route.params || {};
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    
    // Check email verification status when component mounts
    useEffect(() => {
        const checkVerification = async () => {
            if (auth && auth.currentUser && auth.currentUser.email === email) {
                try {
                    // Reload user to get latest verification status
                    await reload(auth.currentUser);
                    if (!auth.currentUser.emailVerified) {
                        // Block access - email must be verified
                        Alert.alert(
                            "Email Not Verified",
                            "Please verify your email before continuing. Check your inbox for the verification link.",
                            [
                                {
                                    text: "I've Verified",
                                    onPress: async () => {
                                        try {
                                            await reload(auth.currentUser);
                                            if (!auth.currentUser.emailVerified) {
                                                Alert.alert(
                                                    "Still Not Verified",
                                                    "Your email hasn't been verified yet. Please check your inbox and click the verification link.",
                                                    [{ text: "OK" }]
                                                );
                                            }
                                        } catch (error) {
                                            console.error("Error reloading user:", error);
                                        }
                                    }
                                },
                                {
                                    text: "Go Back",
                                    style: "cancel",
                                    onPress: () => navigation.goBack()
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                } catch (error) {
                    console.error("Error checking email verification:", error);
                }
            }
        };
        checkVerification();
    }, [email, navigation]);

    const handleContinue = () => {
        if (!first.trim() || !last.trim()) {
            Alert.alert("Error", "Please enter both first and last name.");
            return;
        }

        navigation.navigate("DateOfBirth", {
            email,
            uid,
            displayName: `${first.trim()} ${last.trim()}`,
            firstName: first.trim(),
            lastName: last.trim(),
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Name</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={first}
                onChangeText={setFirst}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={last}
                onChangeText={setLast}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
            >
                <Text style={styles.buttonText}>Continue</Text>
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
    header: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#7b3aed",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
