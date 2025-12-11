import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    // Load saved preference
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("darkMode");
            if (saved !== null) {
                setDarkMode(saved === "true");
            }
        })();
    }, []);

    const toggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        await AsyncStorage.setItem("darkMode", newValue.toString());
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export const useDarkMode = () => useContext(DarkModeContext);
