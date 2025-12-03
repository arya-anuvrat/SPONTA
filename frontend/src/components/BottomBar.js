import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BottomBar() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <Ionicons name="home-outline" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Challenges")}>
                <Ionicons name="list-outline" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Generate")}>
                <Ionicons name="flash-outline" size={32} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Location")}>
                <Ionicons name="location-outline" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Ionicons name="person-outline" size={28} color="#333" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
});
