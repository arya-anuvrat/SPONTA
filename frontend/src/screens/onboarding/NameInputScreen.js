import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function NameInputScreen() {
    const navigation = useNavigation();
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");

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
                onPress={() => navigation.navigate("DateOfBirth")}
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
