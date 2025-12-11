import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LightColors, DarkColors } from "../theme/colors";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("APP_THEME");
            if (saved !== null) setIsDarkMode(saved === "dark");
        })();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        await AsyncStorage.setItem("APP_THEME", newMode ? "dark" : "light");
    };

    const colors = isDarkMode ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
