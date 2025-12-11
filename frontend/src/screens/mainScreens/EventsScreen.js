import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { eventAPI } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

// MapView may not work in Expo Go - we'll handle it gracefully
let MapView, Marker, Circle, PROVIDER_GOOGLE;
try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Circle = maps.Circle;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch (error) {
    console.warn("react-native-maps not available:", error);
    MapView = null;
}

const { width, height } = Dimensions.get("window");
const RADIUS_STORAGE_KEY = "@sponta_events_radius";
const DEFAULT_RADIUS_MILES = 8;
const MILES_TO_METERS = 1609.34; // 1 mile = 1609.34 meters

export default function EventsScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { isDarkMode, colors } = useTheme();

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS_MILES);
    const [region, setRegion] = useState({
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    const [userLocation, setUserLocation] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const mapRef = useRef(null);

    // Initialize location on mount
    useEffect(() => {
        if (currentUser) {
            initializeLocation();
        }
    }, [currentUser]);

    // Check if user has set radius before
    useEffect(() => {
        const checkRadius = async () => {
            try {
                const savedRadius = await AsyncStorage.getItem(RADIUS_STORAGE_KEY);
                if (savedRadius) {
                    const radius = parseFloat(savedRadius);
                    setRadiusMiles(radius);
                    setShowMap(false);
                } else {
                    // First time - show map
                    setShowMap(true);
                }
            } catch (error) {
                console.error("Error checking radius:", error);
                setShowMap(true);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            checkRadius();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    // Fetch events when userLocation is available and map is not shown
    useEffect(() => {
        if (currentUser && userLocation && !showMap && radiusMiles) {
            fetchEvents(radiusMiles);
        }
    }, [userLocation, showMap, currentUser, radiusMiles]);

    // Initialize location
    const initializeLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                setHasPermission(true);
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const newRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };
                setRegion(newRegion);
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
                if (mapRef.current) {
                    mapRef.current.animateToRegion(newRegion, 1000);
                }
            }
        } catch (error) {
            console.error("Location initialization error:", error);
        }
    };

    // Fetch events within radius
    const fetchEvents = async (radius = radiusMiles) => {
        if (!currentUser || !userLocation) return;

        try {
            setLoading(true);
            const idToken = await currentUser.getIdToken();
            const radiusMeters = radius * MILES_TO_METERS;
            
            const response = await eventAPI.getNearby(
                idToken,
                userLocation.latitude,
                userLocation.longitude,
                radiusMeters
            );

            if (response.success && response.data) {
                setEvents(response.data || []);
            }

            // Also fetch user's events (filter from all events)
            const allEventsResponse = await eventAPI.getAll(idToken);
            if (allEventsResponse.success && allEventsResponse.data) {
                const userOwnedEvents = allEventsResponse.data.filter(
                    event => event.createdBy === currentUser.uid || event.userId === currentUser.uid
                );
                setUserEvents(userOwnedEvents);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            Alert.alert("Error", "Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Save radius and fetch events
    const handleSetRadius = async () => {
        if (!userLocation) {
            Alert.alert("Error", "Please enable location to set radius.");
            return;
        }

        try {
            await AsyncStorage.setItem(RADIUS_STORAGE_KEY, radiusMiles.toString());
            setShowMap(false);
            await fetchEvents(radiusMiles);
        } catch (error) {
            console.error("Error saving radius:", error);
        }
    };

    // Change radius (for map view)
    const handleRadiusChange = (newRadius) => {
        setRadiusMiles(newRadius);
        if (mapRef.current && userLocation) {
            const radiusMeters = newRadius * MILES_TO_METERS;
            const latitudeDelta = (radiusMeters / 111000) * 2; // Approximate conversion
            const longitudeDelta = (radiusMeters / (111000 * Math.cos(userLocation.latitude * Math.PI / 180))) * 2;
            
            mapRef.current.animateToRegion({
                ...userLocation,
                latitudeDelta,
                longitudeDelta,
            }, 500);
        }
    };

    // Reset radius (show map again)
    const handleResetRadius = async () => {
        await AsyncStorage.removeItem(RADIUS_STORAGE_KEY);
        setShowMap(true);
        await initializeLocation();
    };

    if (loading && !showMap) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tabActive} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading events...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show map for first time or when resetting
    if (showMap) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Set Event Radius
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {!MapView ? (
                    <View style={styles.mapErrorContainer}>
                        <Ionicons name="location" size={60} color={colors.tabActive} />
                        <Text style={[styles.mapErrorText, { color: colors.textPrimary }]}>
                            Map requires development build
                        </Text>
                        <Text style={[styles.mapErrorSubtext, { color: colors.textSecondary }]}>
                            Please enable location to set your search radius
                        </Text>
                        <TouchableOpacity
                            style={[styles.enableLocationButton, { backgroundColor: colors.tabActive }]}
                            onPress={async () => {
                                await initializeLocation();
                                if (userLocation) {
                                    Alert.alert(
                                        "Location Enabled",
                                        `Using ${radiusMiles} miles as your search radius. You can adjust this later.`,
                                        [
                                            {
                                                text: "Set Radius",
                                                onPress: handleSetRadius,
                                            },
                                        ]
                                    );
                                }
                            }}
                        >
                            <Text style={styles.enableLocationButtonText}>
                                Enable Location
                            </Text>
                        </TouchableOpacity>
                        {/* Radius Control without map */}
                        <View style={styles.radiusControlsNoMap}>
                            <Text style={[styles.radiusLabel, { color: colors.textPrimary }]}>
                                Search Radius: {radiusMiles} miles
                            </Text>
                            <View style={styles.radiusControls}>
                                <TouchableOpacity
                                    style={[styles.radiusButton, { backgroundColor: colors.card }]}
                                    onPress={() => handleRadiusChange(Math.max(1, radiusMiles - 1))}
                                >
                                    <Ionicons name="remove" size={20} color={colors.textPrimary} />
                                </TouchableOpacity>
                                <View style={[styles.radiusValue, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.radiusValueText, { color: colors.textPrimary }]}>
                                        {radiusMiles} mi
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.radiusButton, { backgroundColor: colors.card }]}
                                    onPress={() => handleRadiusChange(Math.min(50, radiusMiles + 1))}
                                >
                                    <Ionicons name="add" size={20} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.setRadiusButton, { backgroundColor: colors.tabActive }]}
                                onPress={handleSetRadius}
                            >
                                <Text style={styles.setRadiusButtonText}>Set Radius & View Events</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={region}
                            onRegionChangeComplete={setRegion}
                            showsUserLocation={hasPermission}
                            showsMyLocationButton={false}
                        >
                            {userLocation && (
                                <>
                                    <Marker
                                        coordinate={userLocation}
                                        title="Your Location"
                                    >
                                        <View style={styles.userMarker}>
                                            <Ionicons name="person" size={20} color="#fff" />
                                        </View>
                                    </Marker>
                                    <Circle
                                        center={userLocation}
                                        radius={radiusMiles * MILES_TO_METERS}
                                        fillColor="rgba(123, 58, 237, 0.2)"
                                        strokeColor="rgba(123, 58, 237, 0.5)"
                                        strokeWidth={2}
                                    />
                                </>
                            )}
                        </MapView>

                        {/* Radius Control Overlay */}
                        <View style={styles.radiusOverlay}>
                            <Text style={[styles.radiusLabel, { color: colors.textPrimary }]}>
                                Search Radius: {radiusMiles} miles
                            </Text>
                            <View style={styles.radiusControls}>
                                <TouchableOpacity
                                    style={[styles.radiusButton, { backgroundColor: colors.card }]}
                                    onPress={() => handleRadiusChange(Math.max(1, radiusMiles - 1))}
                                >
                                    <Ionicons name="remove" size={20} color={colors.textPrimary} />
                                </TouchableOpacity>
                                <View style={[styles.radiusValue, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.radiusValueText, { color: colors.textPrimary }]}>
                                        {radiusMiles} mi
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.radiusButton, { backgroundColor: colors.card }]}
                                    onPress={() => handleRadiusChange(Math.min(50, radiusMiles + 1))}
                                >
                                    <Ionicons name="add" size={20} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.setRadiusButton, { backgroundColor: colors.tabActive }]}
                                onPress={handleSetRadius}
                            >
                                <Text style={styles.setRadiusButtonText}>Set Radius & View Events</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    // Show events list
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Events ({radiusMiles} mi)
                </Text>
                <TouchableOpacity onPress={handleResetRadius}>
                    <Ionicons name="location" size={24} color={colors.tabActive} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* User's Events Section */}
                {userEvents.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                            My Events
                        </Text>
                        {userEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={[styles.eventCard, { backgroundColor: colors.card }]}
                            >
                                {event.imageUrl && (
                                    <Image
                                        source={{ uri: event.imageUrl }}
                                        style={styles.eventImage}
                                    />
                                )}
                                <View style={styles.eventContent}>
                                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                                        {event.title || event.name}
                                    </Text>
                                    {event.description && (
                                        <Text
                                            style={[styles.eventDescription, { color: colors.textSecondary }]}
                                            numberOfLines={2}
                                        >
                                            {event.description}
                                        </Text>
                                    )}
                                    {event.startTime && (
                                        <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                                            {new Date(event.startTime).toLocaleString()}
                                        </Text>
                                    )}
                                    {event.participants && (
                                        <Text style={[styles.eventParticipants, { color: colors.textSecondary }]}>
                                            {event.participants.length} participants
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Nearby Events Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        Nearby Events ({events.length})
                    </Text>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={[styles.eventCard, { backgroundColor: colors.card }]}
                            >
                                {event.imageUrl && (
                                    <Image
                                        source={{ uri: event.imageUrl }}
                                        style={styles.eventImage}
                                    />
                                )}
                                <View style={styles.eventContent}>
                                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                                        {event.title || event.name}
                                    </Text>
                                    {event.description && (
                                        <Text
                                            style={[styles.eventDescription, { color: colors.textSecondary }]}
                                            numberOfLines={2}
                                        >
                                            {event.description}
                                        </Text>
                                    )}
                                    {event.startTime && (
                                        <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                                            {new Date(event.startTime).toLocaleString()}
                                        </Text>
                                    )}
                                    {event.distance && (
                                        <Text style={[styles.eventDistance, { color: colors.tabActive }]}>
                                            {(event.distance / MILES_TO_METERS).toFixed(1)} miles away
                                        </Text>
                                    )}
                                    {event.participants && (
                                        <Text style={[styles.eventParticipants, { color: colors.textSecondary }]}>
                                            {event.participants.length} participants
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No events found in this area
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                Try adjusting your radius or create an event!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.tabActive }]}
                onPress={() => navigation.navigate("CreateEvent")}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 15,
        fontSize: 14,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        width: width,
        height: height - 200,
    },
    mapErrorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    mapErrorText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    mapErrorSubtext: {
        marginTop: 8,
        fontSize: 14,
        textAlign: "center",
    },
    enableLocationButton: {
        marginTop: 30,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 25,
        alignItems: "center",
    },
    enableLocationButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    radiusControlsNoMap: {
        marginTop: 30,
        width: "100%",
        paddingHorizontal: 20,
    },
    userMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#7b3aed",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    radiusOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    radiusLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
    },
    radiusControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    radiusButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    radiusValue: {
        minWidth: 80,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    radiusValueText: {
        fontSize: 18,
        fontWeight: "700",
    },
    setRadiusButton: {
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: "center",
    },
    setRadiusButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 15,
    },
    eventCard: {
        borderRadius: 15,
        marginBottom: 15,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventImage: {
        width: "100%",
        height: 200,
        backgroundColor: "#f0f0f0",
    },
    eventContent: {
        padding: 15,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    eventTime: {
        fontSize: 12,
        marginBottom: 4,
    },
    eventDistance: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    eventParticipants: {
        fontSize: 12,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

