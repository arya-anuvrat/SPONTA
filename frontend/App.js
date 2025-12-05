import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";
import LandingScreen from "./src/screens/onboarding/LandingScreen";
import SignInScreen from "./src/screens/onboarding/SignInScreen";
import CreateAccountScreen from "./src/screens/onboarding/CreateAccountScreen";
import PhoneVerificationScreen from "./src/screens/onboarding/PhoneVerificationScreen";
import NameInputScreen from "./src/screens/onboarding/NameInputScreen";
import DateOfBirthScreen from "./src/screens/onboarding/DateOfBirthScreen";
import LocationSelectionScreen from "./src/screens/onboarding/LocationSelectionScreen";
import HomeScreen from "./src/screens/mainScreens/HomeScreen";
import ChallengeScreen from "./src/screens/mainScreens/ChallengeScreen";
import ChallengeDetailScreen from "./src/screens/mainScreens/ChallengeDetailScreen";
import MyChallengesScreen from "./src/screens/mainScreens/MyChallengesScreen";
import MyChallengeDetailScreen from "./src/screens/mainScreens/MyChallengeDetailScreen";
import { OnboardingProvider } from "./src/context/OnboardingContext";
import ProfileScreen from "./src/screens/mainScreens/ProfileScreen";
import EditProfileScreen from "./src/screens/mainScreens/EditProfileScreen";
import NotificationsScreen from "./src/screens/mainScreens/NotificationScreen";
import PrivacySettingsScreen from "./src/screens/mainScreens/PrivacySettingScreen";
import HelpCenterScreen from "./src/screens/mainScreens/HelpCenterScreen";
import ContactUsScreen from "./src/screens/mainScreens/ContactUsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <OnboardingProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="Landing"
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen
                            name="Landing"
                            component={LandingScreen}
                        />
                        <Stack.Screen name="SignIn" component={SignInScreen} />
                        <Stack.Screen
                            name="CreateAccount"
                            component={CreateAccountScreen}
                        />
                        <Stack.Screen
                            name="PhoneVerification"
                            component={PhoneVerificationScreen}
                        />
                        <Stack.Screen
                            name="NameInput"
                            component={NameInputScreen}
                        />
                        <Stack.Screen
                            name="DateOfBirth"
                            component={DateOfBirthScreen}
                        />
                        <Stack.Screen
                            name="LocationSelection"
                            component={LocationSelectionScreen}
                        />
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen
                            name="Challenges"
                            component={ChallengeScreen}
                        />
                        <Stack.Screen
                            name="ChallengeDetails"
                            component={ChallengeDetailScreen}
                        />
                        <Stack.Screen
                            name="MyChallenges"
                            component={MyChallengesScreen}
                        />
                        <Stack.Screen
                            name="MyChallengeDetail"
                            component={MyChallengeDetailScreen}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                        />
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                        />
                        <Stack.Screen
                            name="PrivacySettings"
                            component={PrivacySettingsScreen}
                        />
                        <Stack.Screen
                            name="HelpCenter"
                            component={HelpCenterScreen}
                        />
                        <Stack.Screen
                            name="ContactUs"
                            component={ContactUsScreen}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </OnboardingProvider>
        </AuthProvider>
    );
}
