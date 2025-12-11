import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Header from "../../components/Header";
import BottomBar from "../../components/BottomBar";
import { eventAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ChallengeScreen({ navigation }) {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLocalEvents();
    }, [currentUser]);

    const loadLocalEvents = async () => {
        try {
            setLoading(true);
            
            // Get user's location for nearby events
            let location = null;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const loc = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    location = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };
                }
            } catch (locError) {
                console.warn("Could not get location:", locError);
            }

            let response;
            if (currentUser && location) {
                // Fetch nearby events if we have location
                const idToken = await currentUser.getIdToken();
                response = await eventAPI.getNearby(idToken, location.latitude, location.longitude, 50000); // 50km radius
            } else {
                // Fallback: fetch all events
                const idToken = currentUser ? await currentUser.getIdToken() : null;
                response = await eventAPI.getAll(idToken || undefined);
            }

            if (response.success && response.data) {
                setEvents(response.data);
            } else {
                // Fallback to empty array if no events
                setEvents([]);
            }
        } catch (err) {
            console.error("Failed to load local events", err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Local Events" />

            {loading ? (
                <View style={{ marginTop: 50 }}>
                    <ActivityIndicator size="large" color="#7B3AED" />
                </View>
            ) : (
                <ScrollView style={{ marginTop: 10 }}>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <View
                                key={event.id || event._id}
                                style={styles.card}
                            >
                                {event.imageUrl && (
                                    <Image
                                        source={{ uri: event.imageUrl }}
                                        style={styles.eventImage}
                                    />
                                )}
                                
                                <Text style={styles.title}>{event.title}</Text>
                                
                                {event.description && (
                                    <Text style={styles.description} numberOfLines={2}>
                                        {event.description}
                                    </Text>
                                )}

                                <View style={styles.eventDetails}>
                                    <View style={styles.eventDetailItem}>
                                        <Ionicons name="people" size={16} color="#666" />
                                        <Text style={styles.eventDetailText}>
                                            {event.participantCount || event.participants?.length || 0} going
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.eventDetailItem}>
                                        <Ionicons name="location" size={16} color="#666" />
                                        <Text style={styles.eventDetailText} numberOfLines={1}>
                                            {typeof event.location === 'string' 
                                                ? event.location 
                                                : event.location?.name || event.location?.address || "Location"}
                                        </Text>
                                    </View>
                                    
                                    {event.date && (
                                        <View style={styles.eventDetailItem}>
                                            <Ionicons name="calendar" size={16} color="#666" />
                                            <Text style={styles.eventDetailText}>
                                                {new Date(event.date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No local events available</Text>
                            <Text style={styles.emptySubtext}>Check back later for new events in your area!</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#f0f0f0",
    },
    title: { 
        fontSize: 18, 
        fontWeight: "700",
        color: "#333",
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
        lineHeight: 20,
    },
    eventDetails: {
        flexDirection: "column",
        gap: 8,
        marginTop: 8,
    },
    eventDetailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    eventDetailText: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#999",
        marginTop: 15,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#ccc",
        textAlign: "center",
    },
});
