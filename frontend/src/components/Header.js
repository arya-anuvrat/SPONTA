import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Header({ title, hideBack }) {
    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            {!hideBack ? (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
            ) : (
                <View style={{ width: 26 }} />
            )}

            <Text style={styles.title}>{title}</Text>
            <View style={{ width: 26 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },
});
