import React, { createContext, useState, useContext } from "react";

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
    const [onboardingData, setOnboardingData] = useState({
        name: "",
        email: "",
        password: "",
        dateOfBirth: "",
        location: null,
    });

    const updateData = (newData) => {
        setOnboardingData((prev) => ({ ...prev, ...newData }));
    };

    const resetOnboarding = () => {
        setOnboardingData({
            name: "",
            email: "",
            password: "",
            dateOfBirth: "",
            location: null,
        });
    };

    return (
        <OnboardingContext.Provider
            value={{ onboardingData, updateData, resetOnboarding }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => useContext(OnboardingContext);
