import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

export default function DateOfBirthScreen() {
    const navigation = useNavigation();
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleContinue = () => navigation.navigate("LocationSelection");

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Date of Birth</Text>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}
            >
                <Text style={styles.dateText}>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={(e, d) => {
                        setShowPicker(false);
                        setDate(d || date);
                    }}
                />
            )}
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 30,
        backgroundColor: "#fff",
    },
    header: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
    dateButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    dateText: { fontSize: 16 },
    button: {
        backgroundColor: "#7b3aed",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
