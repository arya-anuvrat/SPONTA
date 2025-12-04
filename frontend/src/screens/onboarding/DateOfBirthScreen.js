import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

export default function DateOfBirthScreen() {
    const navigation = useNavigation();
    const [date, setDate] = useState(new Date(2005, 0, 1)); // default: 18-ish
    const [showPicker] = useState(true); // always visible

    // Format date nicely: January 20, 2005
    const formatDOB = (d) =>
        d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    // Age validation (13+)
    const validateAge = () => {
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();

        const hadBirthdayThisYear =
            today.getMonth() > date.getMonth() ||
            (today.getMonth() === date.getMonth() &&
                today.getDate() >= date.getDate());

        if (!hadBirthdayThisYear) age -= 1;

        return age >= 13;
    };

    const handleContinue = () => {
        if (!validateAge()) {
            Alert.alert(
                "Age Restriction",
                "You must be at least 13 years old to use Sponta."
            );
            return;
        }

        navigation.navigate("LocationSelection");
    };

    // Year buttons: <   2005   >
    const adjustYear = (delta) => {
        const newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear() + delta);
        setDate(newDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Date of Birth</Text>

            {/* Formatted DOB display */}
            <Text style={styles.displayText}>{formatDOB(date)}</Text>

            {/* Always-visible date picker */}
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) setDate(selectedDate);
                    }}
                    style={{ marginBottom: 20 }}
                />
            )}

            {/* Continue */}
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            {/* Skip (only during mock mode) */}
            <TouchableOpacity
                onPress={() => navigation.navigate("LocationSelection")}
            >
                <Text style={styles.skipText}>Skip for now</Text>
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

    header: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },

    displayText: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 15,
    },

    yearRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
    },

    yearArrow: {
        fontSize: 28,
        paddingHorizontal: 20,
        color: "#7b3aed",
    },

    yearText: {
        fontSize: 20,
        fontWeight: "600",
        marginHorizontal: 10,
    },

    button: {
        backgroundColor: "#7b3aed",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 10,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },

    skipText: {
        textAlign: "center",
        marginTop: 15,
        color: "#999",
        fontSize: 15,
    },
});
