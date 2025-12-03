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

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Landing"
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="Landing" component={LandingScreen} />
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
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}
