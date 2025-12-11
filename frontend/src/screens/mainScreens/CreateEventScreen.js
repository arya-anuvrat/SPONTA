import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { eventAPI } from "../../services/api";
import { storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../../components/Header";

export default function CreateEventScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { isDarkMode, colors } = useTheme();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000)); // 1 hour later
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [location, setLocation] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Get user location on mount
    React.useEffect(() => {
        const getLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const locationData = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setLocation({
                        latitude: locationData.coords.latitude,
                        longitude: locationData.coords.longitude,
                    });
                }
            } catch (error) {
                console.error("Error getting location:", error);
            }
        };
        getLocation();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please grant camera roll permissions to add a photo.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please grant camera permissions to take a photo.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const showImagePicker = () => {
        Alert.alert(
            "Add Event Photo",
            "Choose an option",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Library", onPress: pickImage },
            ]
        );
    };

    const uploadImageToFirebase = async (localUri) => {
        if (!localUri || !storage) {
            return null;
        }

        try {
            const filename = `events/${currentUser.uid}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(storage, filename);

            const response = await fetch(localUri);
            const blob = await response.blob();

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            console.log("✅ Event image uploaded to Firebase Storage:", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("❌ Error uploading image to Firebase Storage:", error);
            throw new Error("Failed to upload image. Please try again.");
        }
    };

    const handleCreateEvent = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter an event title.");
            return;
        }

        if (!currentUser) {
            Alert.alert("Error", "You must be logged in to create an event.");
            return;
        }

        if (!location) {
            Alert.alert("Error", "Please enable location to create an event.");
            return;
        }

        try {
            setUploading(true);
            const idToken = await currentUser.getIdToken();

            // Upload image if there's one
            let imageUrl = null;
            if (imageUri && !imageUri.startsWith('http')) {
                imageUrl = await uploadImageToFirebase(imageUri);
            }

            const eventData = {
                title: title.trim(),
                description: description.trim() || null,
                imageUrl: imageUrl,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                location: {
                    coordinates: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                },
                status: "upcoming",
                isPublic: true,
                participants: [],
            };

            const response = await eventAPI.create(idToken, eventData);

            if (response.success) {
                Alert.alert(
                    "Event Created!",
                    "Your event has been created successfully.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                throw new Error(response.message || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to create event. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Create Event" />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Image Section */}
                <TouchableOpacity
                    style={styles.imageSection}
                    onPress={showImagePicker}
                    activeOpacity={0.8}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.card }]}>
                            <Ionicons name="camera" size={48} color={colors.textSecondary} />
                            <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                                Tap to add photo
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Title */}
                <View style={styles.inputSection}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Event Title *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary }]}
                        placeholder="Enter event title"
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Description */}
                <View style={styles.inputSection}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Description</Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            { backgroundColor: colors.card, color: colors.textPrimary },
                        ]}
                        placeholder="Describe your event..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />
                </View>

                {/* Start Time */}
                <View style={styles.inputSection}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Start Time</Text>
                    <TouchableOpacity
                        style={[styles.dateButton, { backgroundColor: colors.card }]}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
                        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                            {startTime.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startTime}
                            mode="datetime"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowStartPicker(false);
                                if (selectedDate) {
                                    setStartTime(selectedDate);
                                    // Auto-set end time to 1 hour after start
                                    setEndTime(new Date(selectedDate.getTime() + 3600000));
                                }
                            }}
                        />
                    )}
                </View>

                {/* End Time */}
                <View style={styles.inputSection}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>End Time</Text>
                    <TouchableOpacity
                        style={[styles.dateButton, { backgroundColor: colors.card }]}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
                        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                            {endTime.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endTime}
                            mode="datetime"
                            display="default"
                            minimumDate={startTime}
                            onChange={(event, selectedDate) => {
                                setShowEndPicker(false);
                                if (selectedDate) {
                                    setEndTime(selectedDate);
                                }
                            }}
                        />
                    )}
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        { backgroundColor: colors.tabActive },
                        uploading && styles.createButtonDisabled,
                    ]}
                    onPress={handleCreateEvent}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.createButtonText}>Create Event</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    imageSection: {
        marginBottom: 20,
    },
    image: {
        width: "100%",
        height: 300,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
    },
    imagePlaceholder: {
        width: "100%",
        height: 300,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        marginTop: 12,
        fontSize: 16,
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    input: {
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
    },
    textArea: {
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: "top",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        padding: 15,
        gap: 10,
    },
    dateText: {
        fontSize: 16,
    },
    createButton: {
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 10,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});

