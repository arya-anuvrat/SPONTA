import React, { useState, useEffect } from "react";
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
import { useTheme } from "../../context/ThemeContext";

export default function CameraVerificationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { challenge, fromDaily = false } = route.params || {};
    const { currentUser } = useAuth();
    const { colors } = useTheme();

    const [photo, setPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);

    useEffect(() => {
        const requestPermission = async () => {
            const { status } =
                await ImagePicker.requestCameraPermissionsAsync();
            setCameraPermission(status === "granted");
            if (status === "granted") {
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
            Alert.alert("Error", "Failed to take photo. Please try again.");
        }
    };

    const handleRetake = () => {
        setPhoto(null);
        handleTakePhoto();
    };

    const uploadPhoto = async (uri) => {
        const id = currentUser?.uid;
        if (!id) throw new Error("User not authenticated");

        const challengeId =
            challenge.id ||
            challenge._id ||
            challenge.challengeId ||
            challenge.challenge?.id ||
            challenge.challenge?._id ||
            "unknown";

        const response = await fetch(uri);
        const blob = await response.blob();

        const filename = `challenge_${challengeId}_${id}_${Date.now()}.jpg`;
        const storageRef = ref(storage, `challenge-photos/${id}/${filename}`);

        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const handleVerify = async () => {
        if (!photo || !currentUser || !challenge) {
            Alert.alert("Error", "Missing required information.");
            return;
        }

        const challengeId =
            challenge.challengeId ||
            challenge.id ||
            challenge._id ||
            challenge.challenge?.id ||
            challenge.challenge?._id;

        if (!challengeId) {
            Alert.alert("Error", "Could not find challenge ID.");
            return;
        }

        setVerifying(true);

        try {
            const idToken = await currentUser.getIdToken();

            try {
                await challengeAPI.accept(idToken, challengeId);
            } catch (e) {}

            let location = null;
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const loc = await Location.getCurrentPositionAsync();
                    location = `${loc.coords.latitude},${loc.coords.longitude}`;
                }
            } catch (e) {}

            setUploading(true);
            const photoUrl = await uploadPhoto(photo);
            setUploading(false);

            const response = await challengeAPI.complete(idToken, challengeId, {
                photoUrl,
                location,
            });

            const verified = response.data?.aiVerification?.verified;

            if (verified) {
                Alert.alert("Challenge Verified!", "", [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.navigate(
                                fromDaily ? "Home" : "MyChallenges"
                            );
                        },
                    },
                ]);
            } else {
                Alert.alert(
                    "Couldn't Verify",
                    response.data?.aiVerification?.reasoning || "",
                    [
                        {
                            text: "Retake Photo",
                            onPress: () => {
                                setPhoto(null);
                                setVerifying(false);
                                handleTakePhoto();
                            },
                        },
                        { text: "Cancel", style: "cancel" },
                    ]
                );
            }
        } catch (e) {
            Alert.alert("Error", e.message || "Failed to verify challenge.");
        } finally {
            setUploading(false);
            setVerifying(false);
        }
    };

    if (!cameraPermission && !photo) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.tabActive} />
                    <Text
                        style={[
                            styles.loadingText,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Requesting camera permission...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.card,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="close"
                        size={28}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>

                <Text
                    style={[styles.headerTitle, { color: colors.textPrimary }]}
                >
                    Verify Challenge
                </Text>

                <View style={{ width: 28 }} />
            </View>

            {!photo ? (
                <View style={styles.centerContent}>
                    <Ionicons
                        name="camera"
                        size={80}
                        color={colors.tabActive}
                    />
                    <Text
                        style={[
                            styles.instructionText,
                            { color: colors.textPrimary },
                        ]}
                    >
                        Take a photo showing that you completed the challenge
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.cameraButton,
                            { backgroundColor: colors.tabActive },
                        ]}
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
                            style={[
                                styles.retakeButton,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.tabActive,
                                },
                            ]}
                            onPress={handleRetake}
                            disabled={uploading || verifying}
                        >
                            <Ionicons
                                name="refresh"
                                size={20}
                                color={colors.tabActive}
                            />
                            <Text
                                style={[
                                    styles.retakeButtonText,
                                    { color: colors.tabActive },
                                ]}
                            >
                                Retake
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.verifyButton,
                                { backgroundColor: colors.tabActive },
                                (uploading || verifying) && { opacity: 0.6 },
                            ]}
                            onPress={handleVerify}
                            disabled={uploading || verifying}
                        >
                            {uploading || verifying ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.verifyButtonText}>
                                        Go Ahead
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {(uploading || verifying) && (
                        <View style={styles.statusContainer}>
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {uploading
                                    ? "Uploading photo..."
                                    : "Verifying with AI..."}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 20, fontWeight: "700" },

    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    loadingText: { marginTop: 20, fontSize: 16 },

    instructionText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 20,
        marginBottom: 30,
        lineHeight: 24,
    },

    cameraButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    cameraButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

    photoContainer: { flex: 1, padding: 20 },

    photo: {
        width: "100%",
        height: "60%",
        borderRadius: 12,
    },

    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        gap: 15,
    },

    retakeButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1.5,
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    retakeButtonText: { fontSize: 16, fontWeight: "600" },

    verifyButton: {
        flex: 1,
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

    statusContainer: { marginTop: 20, alignItems: "center" },
    statusText: { fontSize: 14 },
});
