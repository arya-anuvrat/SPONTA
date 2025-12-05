import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BottomBar() {
    const nav = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => nav.navigate("Home")}>
                <Ionicons name="home-outline" size={26} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.navigate("MyChallenges")}>
                <Ionicons name="list-outline" size={26} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.navigate("Challenges")}>
                <Ionicons name="flash-outline" size={26} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.navigate("Profile")}>
                <Ionicons name="person-outline" size={26} color="#333" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
});
