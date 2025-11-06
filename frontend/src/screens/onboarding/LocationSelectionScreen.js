import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LocationSelectionScreen() {
    const navigation = useNavigation();

    const handleEnableLocation = () => {
        Alert.alert("Mock Mode", "Simulating location permission granted.");
        navigation.navigate("Home");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Enable Location</Text>
            <Text style={styles.subtext}>
                SPONTA uses your location to show nearby challenges and events.
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={handleEnableLocation}
            >
                <Text style={styles.buttonText}>Enable Location</Text>
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
    subtext: { color: "#666", marginBottom: 30 },
    button: {
        backgroundColor: "#7b3aed",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
