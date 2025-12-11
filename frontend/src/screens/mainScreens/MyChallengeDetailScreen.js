import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import BottomBar from "../../components/BottomBar";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { challengeAPI } from "../../services/api";
import { storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function MyChallengeDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { challenge } = route.params;
    const { currentUser } = useAuth();
    const [photo, setPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [completing, setCompleting] = useState(false);

    const pickImage = async () => {
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Camera permission is required to upload a photo for verification."
                );
                return;
            }

            // Show options: Camera or Photo Library
            Alert.alert(
                "Select Photo",
                "Choose how you want to add a photo",
                [
                    {
                        text: "Camera",
                        onPress: async () => {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                setPhoto(result.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: "Photo Library",
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                setPhoto(result.assets[0].uri);
                            }
                        },
                    },
                    { text: "Cancel", style: "cancel" },
                ]
            );
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

    const uploadPhoto = async (uri) => {
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        try {
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a unique filename
            const filename = `challenge_${challenge.id || challenge._id}_${currentUser.uid}_${Date.now()}.jpg`;
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

    const handleComplete = async () => {
        if (!photo) {
            Alert.alert(
                "Photo Required",
                "Please upload a photo to verify that you completed the challenge."
            );
            return;
        }

        if (!currentUser) {
            Alert.alert("Error", "You must be logged in to complete challenges.");
            return;
        }

        setCompleting(true);
        try {
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

            // Get Firebase ID token
            const idToken = await currentUser.getIdToken();

            // Complete challenge with photo and location
            const response = await challengeAPI.complete(idToken, challenge.id || challenge._id, {
                photoUrl,
                location: location ? `${location.latitude},${location.longitude}` : null,
            });

            if (response.success) {
                Alert.alert(
                    "Challenge Submitted!",
                    response.data?.aiVerification?.verified
                        ? "Your photo has been verified! Great job completing the challenge."
                        : "Your challenge completion is being reviewed. We'll notify you once it's verified.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate("MyChallenges"),
                        },
                    ]
                );
            } else {
                throw new Error(response.message || "Failed to complete challenge");
            }
        } catch (error) {
            console.error("Error completing challenge:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to complete challenge. Please try again."
            );
        } finally {
            setUploading(false);
            setCompleting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Challenge Details</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Card Container */}
                <View style={styles.card}>
                    <Text style={styles.title}>{challenge.title || challenge.description}</Text>

                    <Text style={styles.label}>
                        Status:{" "}
                        <Text style={styles.value}>{challenge.status || "In Progress"}</Text>
                    </Text>

                    <Text style={styles.label}>
                        Points:{" "}
                        <Text style={styles.points}>{challenge.points || 100}</Text>
                    </Text>

                    {/* Photo Upload Section */}
                    <View style={styles.photoSection}>
                        <Text style={styles.photoLabel}>Verification Photo</Text>
                        {photo ? (
                            <View style={styles.photoContainer}>
                                <Image source={{ uri: photo }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhotoButton}
                                    onPress={() => setPhoto(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={pickImage}
                                disabled={uploading || completing}
                            >
                                <Ionicons name="camera" size={32} color="#7b3aed" />
                                <Text style={styles.uploadButtonText}>
                                    {uploading ? "Uploading..." : "Take or Select Photo"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        Upload a photo showing that you completed this challenge. Our AI will verify your submission and update your streak!
                    </Text>
                </View>

                    {/* Verify Button */}
                <View style={styles.buttonSection}>
                        {!photo ? (
                    <TouchableOpacity
                        style={styles.verifyBtn}
                                onPress={() => navigation.navigate("CameraVerification", {
                                    challenge,
                                    fromDaily: false,
                                })}
                    >
                                <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.btnText}>Verify Challenge</Text>
                    </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.retakeBtn}
                                    onPress={() => setPhoto(null)}
                                >
                                    <Text style={styles.retakeBtnText}>Retake Photo</Text>
                                </TouchableOpacity>
                    <TouchableOpacity
                                    style={[
                                        styles.completeBtn,
                                        (uploading || completing) && styles.buttonDisabled,
                                    ]}
                        onPress={handleComplete}
                                    disabled={uploading || completing}
                                >
                                    {completing || uploading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.btnText}>Submit for Verification</Text>
                                    )}
                    </TouchableOpacity>
                            </>
                        )}
                </View>
            </ScrollView>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 25,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eee",
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        color: "#666",
        marginTop: 8,
    },
    value: {
        fontWeight: "700",
        color: "#333",
    },
    points: {
        color: "#7b3aed",
        fontWeight: "700",
    },
    photoSection: {
        marginTop: 20,
    },
    photoLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    photoContainer: {
        position: "relative",
        width: "100%",
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
    },
    photo: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    removePhotoButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 12,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: "#7b3aed",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
    },
    uploadButtonText: {
        marginTop: 10,
        fontSize: 16,
        color: "#7b3aed",
        fontWeight: "600",
    },
    description: {
        marginTop: 20,
        fontSize: 15,
        lineHeight: 22,
        color: "#444",
    },
    buttonSection: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    completeBtn: {
        backgroundColor: "#7b3aed",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
