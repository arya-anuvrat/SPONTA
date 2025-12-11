import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { challengeAPI } from "../../services/api";
import { storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "../../services/firebase";

export default function CameraVerificationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { challenge, fromDaily = false } = route.params || {};
    const { currentUser } = useAuth();
    const [photo, setPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);

    // Request camera permission on mount
    React.useEffect(() => {
        const requestPermission = async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setCameraPermission(status === "granted");
            if (status === "granted") {
                // Auto-open camera
                handleTakePhoto();
            } else {
                Alert.alert(
                    "Camera Permission Required",
                    "Please enable camera access to verify your challenge.",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        };
        requestPermission();
    }, []);

    const handleTakePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setPhoto(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "Failed to take photo. Please try again.");
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        handleTakePhoto();
    };

    const uploadPhoto = async (uri) => {
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        // Extract challenge ID - handle both direct challenge objects and userChallenge objects
        const challengeId = challenge.id || 
                           challenge._id || 
                           challenge.challengeId || 
                           challenge.challenge?.id ||
                           challenge.challenge?._id || 
                           'unknown';

        try {
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a unique filename
            const filename = `challenge_${challengeId}_${currentUser.uid}_${Date.now()}.jpg`;
            const storageRef = ref(storage, `challenge-photos/${currentUser.uid}/${filename}`);

            // Upload to Firebase Storage
            await uploadBytes(storageRef, blob);
            
            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading photo:", error);
            throw new Error("Failed to upload photo");
        }
    };

    const handleVerify = async () => {
        if (!photo || !currentUser || !challenge) {
            Alert.alert("Error", "Missing required information.");
            return;
        }

        // Extract challenge ID - handle both direct challenge objects and userChallenge objects
        // From "Today's Challenge": challenge.id (direct challenge object)
        // From "My Challenges": challenge.challengeId (userChallenge object with challengeId field)
        // Priority order:
        // 1. challenge.challengeId (from userChallenge - this is the actual challenge ID)
        // 2. challenge.id (direct challenge object)
        // 3. challenge.challenge?.id (nested challenge object)
        // 4. Fallback options
        const challengeId = challenge.challengeId || 
                           challenge.id || 
                           challenge._id || 
                           challenge.challenge?.id ||
                           challenge.challenge?._id;

        if (!challengeId) {
            console.error('Could not extract challenge ID. Challenge object:', JSON.stringify(challenge, null, 2));
            Alert.alert("Error", "Could not find challenge ID. Please try again.");
            return;
        }

        if (__DEV__) {
            console.log('=== Challenge Verification Debug ===');
            console.log('Challenge ID extracted:', challengeId);
            console.log('Challenge object keys:', Object.keys(challenge));
            console.log('challenge.challengeId:', challenge.challengeId);
            console.log('challenge.id:', challenge.id);
            console.log('challenge.challenge?.id:', challenge.challenge?.id);
            console.log('Full challenge object:', JSON.stringify(challenge, null, 2));
        }

        setVerifying(true);
        try {
            // First, accept the challenge if it hasn't been accepted yet
            const idToken = await currentUser.getIdToken();
            try {
                await challengeAPI.accept(idToken, challengeId);
            } catch (acceptError) {
                // Challenge might already be accepted, that's okay - only log if it's a different error
                if (!acceptError.message || !acceptError.message.includes("already accepted")) {
                    console.warn("Challenge accept error:", acceptError.message);
                }
                // Continue with verification even if already accepted
            }
            // Get user's current location (optional but helpful for verification)
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
                // Continue without location
            }

            // Upload photo first
            setUploading(true);
            const photoUrl = await uploadPhoto(photo);
            setUploading(false);

            // Complete challenge with photo and location
            const response = await challengeAPI.complete(idToken, challengeId, {
                photoUrl,
                location: location ? `${location.latitude},${location.longitude}` : null,
            });

            if (response.success) {
                const verified = response.data?.aiVerification?.verified || false;
                
                if (verified) {
                    Alert.alert(
                        "✅ Challenge Verified!",
                        "Great job! Your challenge has been verified and your streak has been updated.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    if (fromDaily) {
                                        navigation.navigate("Home");
                                    } else {
                                        navigation.navigate("MyChallenges");
                                    }
                                },
                            },
                        ]
                    );
                } else {
                    Alert.alert(
                        "❌ Couldn't Verify",
                        response.data?.aiVerification?.reasoning || "We couldn't verify that you completed the challenge. Please try taking another photo.",
                        [
                            {
                                text: "Retake Photo",
                                onPress: () => {
                                    setPhoto(null);
                                    setVerifying(false);
                                    handleTakePhoto();
                                },
                            },
                            {
                                text: "Cancel",
                                style: "cancel",
                                onPress: () => navigation.goBack(),
                            },
                        ]
                    );
                }
            } else {
                throw new Error(response.message || "Failed to verify challenge");
            }
        } catch (error) {
            console.error("Error verifying challenge:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to verify challenge. Please try again.",
                [
                    {
                        text: "Retry",
                        onPress: () => {
                            setPhoto(null);
                            setVerifying(false);
                        },
                    },
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } finally {
            setUploading(false);
            setVerifying(false);
        }
    };

    if (!cameraPermission && !photo) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#7b3aed" />
                    <Text style={styles.loadingText}>Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verify Challenge</Text>
                <View style={{ width: 28 }} />
            </View>

            {!photo ? (
                <View style={styles.centerContent}>
                    <Ionicons name="camera" size={80} color="#7b3aed" />
                    <Text style={styles.instructionText}>
                        Take a photo showing that you completed the challenge
                    </Text>
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleTakePhoto}
                    >
                        <Text style={styles.cameraButtonText}>Open Camera</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.retakeButton}
                            onPress={handleRetake}
                            disabled={uploading || verifying}
                        >
                            <Ionicons name="refresh" size={20} color="#7b3aed" />
                            <Text style={styles.retakeButtonText}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.verifyButton, (uploading || verifying) && styles.buttonDisabled]}
                            onPress={handleVerify}
                            disabled={uploading || verifying}
                        >
                            {uploading || verifying ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.verifyButtonText}>Go Ahead</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {(uploading || verifying) && (
                        <View style={styles.statusContainer}>
                            <Text style={styles.statusText}>
                                {uploading ? "Uploading photo..." : "Verifying with AI..."}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    loadingText: {
        marginTop: 20,
        color: "#666",
        fontSize: 16,
    },
    instructionText: {
        fontSize: 18,
        color: "#333",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 30,
        lineHeight: 24,
    },
    cameraButton: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    cameraButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    photoContainer: {
        flex: 1,
        padding: 20,
    },
    photo: {
        width: "100%",
        height: "60%",
        borderRadius: 12,
        resizeMode: "cover",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        gap: 15,
    },
    retakeButton: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingVertical: 15,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    retakeButtonText: {
        color: "#7b3aed",
        fontSize: 16,
        fontWeight: "600",
    },
    verifyButton: {
        flex: 1,
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    verifyButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    statusContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    statusText: {
        color: "#666",
        fontSize: 14,
    },
});

