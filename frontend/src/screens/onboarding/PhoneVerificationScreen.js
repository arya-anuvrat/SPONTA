import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function PhoneVerificationScreen() {
    const navigation = useNavigation();
    const { phone } = useRoute().params;
    const [code, setCode] = useState("");
    const [sent, setSent] = useState(false);

    const sendCode = () => {
        setSent(true);
        Alert.alert("Mock Mode", `Pretending to send code to ${phone}`);
    };

    const verifyCode = () => {
        if (code.length !== 6) {
            Alert.alert("Invalid", "Please enter the 6-digit mock code.");
            return;
        }
        Alert.alert("Success", "Mock verification complete!");
        navigation.navigate("NameInput");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Verify Phone</Text>
            <Text style={styles.subtext}>
                We’ve sent a 6-digit code to {phone}
            </Text>

            {!sent ? (
                <TouchableOpacity style={styles.button} onPress={sendCode}>
                    <Text style={styles.buttonText}>Send Code</Text>
                </TouchableOpacity>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={code}
                        onChangeText={setCode}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={verifyCode}
                    >
                        <Text style={styles.buttonText}>Verify</Text>
                    </TouchableOpacity>
                </>
            )}
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
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
