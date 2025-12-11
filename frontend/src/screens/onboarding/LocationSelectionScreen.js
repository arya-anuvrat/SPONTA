import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Linking,
    Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
// MapView may not work in Expo Go - we'll handle it gracefully
let MapView, Marker, PROVIDER_GOOGLE;
try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch (error) {
    console.warn("react-native-maps not available:", error);
    MapView = null;
}
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { authAPI, userAPI } from "../../services/api";
import { auth } from "../../services/firebase";

const { width, height } = Dimensions.get("window");

export default function LocationSelectionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, uid, displayName, firstName, lastName, dateOfBirth } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [region, setRegion] = useState({
        latitude: 40.7128, // Default to NYC
        longitude: -74.0060,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [mapError, setMapError] = useState(false);
    const mapRef = useRef(null);

    // Request location permission and center map on user's location
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    setHasPermission(true);
                    // Get current location
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
                    setSelectedLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    // Center map on location
                    if (mapRef.current) {
                        mapRef.current.animateToRegion(newRegion, 1000);
                    }
                } else {
                    // Permission denied - show alert
                    Alert.alert(
                        "Location Permission",
                        "Please enable location access to find your neighborhood.",
                        [
                            {
                                text: "Open Settings",
                                onPress: () => Linking.openSettings(),
                            },
                            { text: "Continue", style: "cancel" },
                        ]
                    );
                }
            } catch (error) {
                console.error("Location initialization error:", error);
            }
        };

        initializeLocation();
    }, []);

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };

    const handleRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
    };

    const handleCenterOnLocation = async () => {
        try {
            if (!hasPermission) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert(
                        "Location Permission",
                        "Please enable location access in Settings.",
                        [{ text: "OK" }]
                    );
                    return;
                }
                setHasPermission(true);
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05, // Zoom in more
                longitudeDelta: 0.05,
            };
            setRegion(newRegion);
            setSelectedLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }
        } catch (error) {
            console.error("Error centering on location:", error);
            Alert.alert("Error", "Could not get your location. Please try again.");
        }
    };

    const handleZoomIn = () => {
        if (mapRef.current && selectedLocation) {
            const newRegion = {
                ...selectedLocation,
                latitudeDelta: 0.01, // Very zoomed in
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            mapRef.current.animateToRegion(newRegion, 1000);
        }
    };

    const handleComplete = async () => {
        // If no location selected yet, try to get current location
        if (!selectedLocation) {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setSelectedLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    // Continue with signup
                } else {
                    Alert.alert("Location Required", "Please enable location to continue.");
                    return;
                }
            } catch (error) {
                Alert.alert("Error", "Could not get location. Please try again.");
                return;
            }
        }

        setLoading(true);
        try {
            await handleCompleteSignup(selectedLocation);
        } catch (error) {
            console.error("Complete signup error:", error);
            Alert.alert("Error", "Failed to complete signup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async (location) => {
        try {
            // Check if Firebase auth is initialized
            if (!auth) {
                throw new Error("Firebase authentication is not initialized. Please check your Firebase configuration.");
            }

            // Get Firebase ID token
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error("User not authenticated");
            }
            const idToken = await currentUser.getIdToken();

            // Sign in to backend (this will create Firestore document if it doesn't exist)
            const signinResponse = await authAPI.signin(idToken);

            if (!signinResponse.success) {
                throw new Error(signinResponse.message || "Sign in failed");
            }

            // Update user profile with collected data
            const profileData = {
                displayName,
                dateOfBirth,
            };

            if (location) {
                profileData.location = `${location.latitude},${location.longitude}`;
            }

            try {
                await userAPI.updateProfile(idToken, profileData);
            } catch (updateError) {
                console.warn("Profile update error (non-critical):", updateError);
                // Continue even if profile update fails
            }

            // Signup/signin successful, navigate to challenge preferences
            navigation.navigate("ChallengePreferences", {
                email,
                uid: currentUser.uid,
            });
        } catch (error) {
            console.error("Complete signup error:", error);
            throw error;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location" size={40} color="#7b3aed" />
                </View>
                <Text style={styles.title}>Where do you live?</Text>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                {!MapView || mapError ? (
                    <View style={styles.mapErrorContainer}>
                        <Ionicons name="location" size={60} color="#7b3aed" />
                        <Text style={styles.mapErrorText}>
                            {MapView ? "Map not available" : "Map requires development build"}
                        </Text>
                        <Text style={styles.mapErrorSubtext}>
                            Please enable location to continue
                        </Text>
                        <TouchableOpacity
                            style={styles.enableLocationButton}
                            onPress={handleCenterOnLocation}
                        >
                            <Text style={styles.enableLocationButtonText}>
                                Enable Location
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={region}
                        onPress={handleMapPress}
                        onRegionChangeComplete={handleRegionChangeComplete}
                        onMapReady={() => setMapReady(true)}
                        onError={(error) => {
                            console.error("Map error:", error);
                            setMapError(true);
                        }}
                        showsUserLocation={hasPermission}
                        showsMyLocationButton={false}
                    >
                        {selectedLocation && (
                            <Marker
                                coordinate={selectedLocation}
                                pinColor="#7b3aed"
                            />
                        )}
                    </MapView>
                )}

                {/* Zoom in button overlay - only show if map is working */}
                {MapView && !mapError && selectedLocation && (
                    <TouchableOpacity
                        style={styles.zoomButton}
                        onPress={handleZoomIn}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.zoomButtonText}>
                            Zoom in to your neighbourhood
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Center on location button - only show if map is working */}
                {MapView && !mapError && (
                    <TouchableOpacity
                        style={styles.centerButton}
                        onPress={handleCenterOnLocation}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="locate" size={24} color="#7b3aed" />
                    </TouchableOpacity>
                )}

                {/* Disclaimer - only show if map is working */}
                {MapView && !mapError && (
                    <View style={styles.disclaimerContainer}>
                        <Text style={styles.disclaimerText}>
                            Only neighbourhood name is shown.
                        </Text>
                    </View>
                )}
            </View>

            {/* Bottom text and continue button */}
            <View style={styles.bottomContainer}>
                <Text style={styles.bottomText}>
                    Sponta uses your location to help you say <Text style={styles.boldText}>YES</Text> to life around you
                </Text>
                <TouchableOpacity
                    style={[styles.continueButton, (!selectedLocation || loading) && styles.buttonDisabled]}
                    onPress={handleComplete}
                    disabled={!selectedLocation || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.continueButtonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 30,
        alignItems: "center",
    },
    iconContainer: {
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1e1e1e",
        textAlign: "center",
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    zoomButton: {
        position: "absolute",
        bottom: 80,
        left: 20,
        right: 20,
        backgroundColor: "#ff6b35",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    zoomButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    centerButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disclaimerContainer: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    disclaimerText: {
        fontSize: 11,
        color: "#666",
    },
    bottomContainer: {
        paddingHorizontal: 30,
        paddingBottom: 30,
        alignItems: "center",
    },
    bottomText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
    },
    boldText: {
        fontWeight: "700",
        color: "#1e1e1e",
    },
    continueButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        width: "100%",
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    mapErrorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 30,
    },
    mapErrorText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginTop: 15,
        marginBottom: 5,
    },
    mapErrorSubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    enableLocationButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    enableLocationButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
