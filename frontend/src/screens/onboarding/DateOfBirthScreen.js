import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function DateOfBirthScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, uid, displayName, firstName, lastName } = route.params || {};
    // Default date: 18 years ago (so user is 18 by default)
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 18);
    const [date, setDate] = useState(defaultDate);
    const [showPicker] = useState(true); // always visible

    // Calculate maximum date (16 years ago - user must be at least 16)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 16);
        return maxDate;
    };

    // Format date nicely: January 20, 2005
    const formatDOB = (d) =>
        d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    // Age validation (16+)
    const validateAge = () => {
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();

        const hadBirthdayThisYear =
            today.getMonth() > date.getMonth() ||
            (today.getMonth() === date.getMonth() &&
                today.getDate() >= date.getDate());

        if (!hadBirthdayThisYear) age -= 1;

        return age >= 16;
    };

    const handleContinue = () => {
        // Validate age before allowing continue
        const ageValid = validateAge();
        if (!ageValid) {
            const today = new Date();
            let age = today.getFullYear() - date.getFullYear();
            const hadBirthdayThisYear =
                today.getMonth() > date.getMonth() ||
                (today.getMonth() === date.getMonth() &&
                    today.getDate() >= date.getDate());
            if (!hadBirthdayThisYear) age -= 1;

            Alert.alert(
                "Age Restriction",
                `You must be at least 16 years old to use Sponta. You are currently ${age} years old. Please select a different date of birth.`,
                [{ text: "OK" }]
            );
            return;
        }

        // Double-check: ensure date doesn't exceed max date
        const maxDate = getMaxDate();
        if (date > maxDate) {
            Alert.alert(
                "Invalid Date",
                "The selected date makes you under 16 years old. Please select a different date.",
                [{ text: "OK" }]
            );
            setDate(maxDate); // Reset to max allowed date
            return;
        }

        navigation.navigate("LocationSelection", {
            email,
            uid,
            displayName,
            firstName,
            lastName,
            dateOfBirth: date.toISOString(),
        });
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
                    maximumDate={getMaxDate()}
                    onChange={(event, selectedDate) => {
                        if (selectedDate) {
                            // Ensure selected date doesn't exceed max date
                            const maxDate = getMaxDate();
                            if (selectedDate > maxDate) {
                                setDate(maxDate);
                            } else {
                                setDate(selectedDate);
                            }
                        }
                    }}
                    style={{ marginBottom: 20 }}
                />
            )}

            {/* Continue */}
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
