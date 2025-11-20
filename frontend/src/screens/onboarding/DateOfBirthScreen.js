import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

export default function DateOfBirthScreen() {
    const navigation = useNavigation();
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(true); // always visible

    const handleContinue = () => navigation.navigate("LocationSelection");

    const handleDateChange = (event, selectedDate) => {
        // Do NOT close the picker, just update the value
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Date of Birth</Text>

            {/* Always visible DOB */}
            <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
            />

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
    button: {
        backgroundColor: "#7b3aed",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
