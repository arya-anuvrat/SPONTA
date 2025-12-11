import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";

// Debug logging
if (__DEV__) {
  console.log('🚀 App.js: Module loaded');
}

import LandingScreen from "./src/screens/onboarding/LandingScreen";
import SignInScreen from "./src/screens/onboarding/SignInScreen";
import CreateAccountScreen from "./src/screens/onboarding/CreateAccountScreen";
import PhoneVerificationScreen from "./src/screens/onboarding/PhoneVerificationScreen";
import NameInputScreen from "./src/screens/onboarding/NameInputScreen";
import DateOfBirthScreen from "./src/screens/onboarding/DateOfBirthScreen";
import LocationSelectionScreen from "./src/screens/onboarding/LocationSelectionScreen";
import ChallengePreferencesScreen from "./src/screens/onboarding/ChallengePreferencesScreen";
import HomeScreen from "./src/screens/mainScreens/HomeScreen";
import ChallengeScreen from "./src/screens/mainScreens/ChallengeScreen";
import ChallengeDetailScreen from "./src/screens/mainScreens/ChallengeDetailScreen";
import MyChallengesScreen from "./src/screens/mainScreens/MyChallengesScreen";
import MyChallengeDetailScreen from "./src/screens/mainScreens/MyChallengeDetailScreen";
import DailyChallengeScreen from "./src/screens/mainScreens/DailyChallengeScreen";
import ChallengeFilterScreen from "./src/screens/mainScreens/ChallengeFilterScreen";
import CameraVerificationScreen from "./src/screens/mainScreens/CameraVerificationScreen";
import { OnboardingProvider } from "./src/context/OnboardingContext";
import ProfileScreen from "./src/screens/mainScreens/ProfileScreen";
import StreakScreen from "./src/screens/mainScreens/StreakScreen";
import EditProfileScreen from "./src/screens/mainScreens/EditProfileScreen";
import NotificationsScreen from "./src/screens/mainScreens/NotificationScreen";
import PrivacySettingsScreen from "./src/screens/mainScreens/PrivacySettingScreen";
import HelpCenterScreen from "./src/screens/mainScreens/HelpCenterScreen";
import ContactUsScreen from "./src/screens/mainScreens/ContactUsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    if (__DEV__) {
        console.log('🚀 App.js: Rendering App component');
    }

    try {
        return (
            <ThemeProvider>
                <AuthProvider>
                    <OnboardingProvider>
                    <NavigationContainer
                        onReady={() => {
                            if (__DEV__) {
                                console.log('🚀 App.js: Navigation ready');
                            }
                        }}
                    >
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
                        <Stack.Screen
                            name="ChallengePreferences"
                            component={ChallengePreferencesScreen}
                        />
                        <Stack.Screen name="Home" component={HomeScreen} />
                                <Stack.Screen
                                    name="DailyChallenge"
                                    component={DailyChallengeScreen}
                                />
                                <Stack.Screen
                                    name="ChallengeFilter"
                                    component={ChallengeFilterScreen}
                                />
                                <Stack.Screen
                                    name="CameraVerification"
                                    component={CameraVerificationScreen}
                                />
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
                        <Stack.Screen
                            name="Streak"
                            component={StreakScreen}
                        />
                    </Stack.Navigator>
                    </NavigationContainer>
                    </OnboardingProvider>
                </AuthProvider>
            </ThemeProvider>
        );
    } catch (error) {
        console.error('❌ App.js: Fatal error rendering app:', error);
        throw error;
    }
}
