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
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Header";

export default function CreatePostScreen({ route }) {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { currentUserId, editPost } = route.params || {};
    
    const [caption, setCaption] = useState(editPost?.caption || "");
    const [imageUri, setImageUri] = useState(editPost?.imageUrl || null);
    const [uploading, setUploading] = useState(false);
    
    const isEditing = !!editPost;

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
            "Add Photo",
            "Choose an option",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Library", onPress: pickImage },
            ]
        );
    };

    const handlePost = () => {
        if (!caption.trim() && !imageUri) {
            Alert.alert("Error", "Please add a caption or photo to your post.");
            return;
        }

        if (isEditing) {
            // Update existing post
            const updatedPost = {
                ...editPost,
                imageUrl: imageUri,
                caption: caption.trim(),
                timestamp: new Date().toISOString(), // Update timestamp
            };

            // Navigate back and pass the updated post via navigation params
            navigation.navigate("Home", { updatedPost });
            
            Alert.alert(
                "Post Updated!",
                "Your post has been updated.",
                [
                    {
                        text: "OK",
                    },
                ]
            );
        } else {
            // Create new post
            const newPost = {
                id: Date.now().toString(),
                userId: currentUserId || currentUser?.uid || "unknown",
                username: currentUser?.displayName || currentUser?.email?.split("@")[0] || "user",
                userImage: null, // Can add user profile image later
                imageUrl: imageUri,
                caption: caption.trim(),
                likes: 0,
                likedBy: [],
                timestamp: new Date().toISOString(),
                isSponsored: false,
            };

            // Navigate back and pass the new post via navigation params
            navigation.navigate("Home", { newPost });
            
            Alert.alert(
                "Post Created!",
                "Your post has been added to Community Watch.",
                [
                    {
                        text: "OK",
                    },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title={isEditing ? "Edit Post" : "Create Post"} />
            
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Image Section */}
                <TouchableOpacity
                    style={styles.imageSection}
                    onPress={async () => {
                        // Directly open image library
                        try {
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
                        } catch (error) {
                            console.error("Error picking image:", error);
                            Alert.alert("Error", "Could not open image picker. Please try again.");
                        }
                    }}
                    activeOpacity={0.8}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera" size={48} color="#ccc" />
                            <Text style={styles.imagePlaceholderText}>
                                Tap to add photo
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                
                {/* Optional: Add button to take photo directly */}
                {!imageUri && (
                    <TouchableOpacity
                        style={styles.takePhotoButton}
                        onPress={async () => {
                            try {
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
                            } catch (error) {
                                console.error("Error taking photo:", error);
                                Alert.alert("Error", "Could not open camera. Please try again.");
                            }
                        }}
                    >
                        <Ionicons name="camera-outline" size={20} color="#7b3aed" />
                        <Text style={styles.takePhotoButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                )}

                {/* Caption Section */}
                <View style={styles.captionSection}>
                    <Text style={styles.label}>Caption</Text>
                    <TextInput
                        style={styles.captionInput}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={6}
                        value={caption}
                        onChangeText={setCaption}
                        textAlignVertical="top"
                    />
                </View>

                {/* Post Button */}
                <TouchableOpacity
                    style={[styles.postButton, uploading && styles.postButtonDisabled]}
                    onPress={handlePost}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name={isEditing ? "checkmark" : "send"} size={20} color="#fff" />
                            <Text style={styles.postButtonText}>
                                {isEditing ? "Update Post" : "Post to Community"}
                            </Text>
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
        backgroundColor: "#fff",
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
        backgroundColor: "#f5f5f5",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        marginTop: 12,
        color: "#999",
        fontSize: 16,
    },
    takePhotoButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        marginBottom: 20,
    },
    takePhotoButtonText: {
        color: "#7b3aed",
        fontSize: 16,
        fontWeight: "600",
    },
    captionSection: {
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    captionInput: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: "#333",
        minHeight: 120,
        textAlignVertical: "top",
    },
    postButton: {
        backgroundColor: "#7b3aed",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    postButtonDisabled: {
        opacity: 0.6,
    },
    postButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});

