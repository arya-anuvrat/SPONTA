import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

export default function StreakScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
    const { colors, isDarkMode } = useTheme();

    const [streak, setStreak] = useState(0);
    const [completionHistory, setCompletionHistory] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                const idToken = await currentUser.getIdToken();

                const stats = await userAPI.getStats(idToken);
                if (stats.success && stats.data) {
                    setStreak(stats.data.user?.currentStreak || 0);
                }

                const history = await userAPI.getCompletionHistory(idToken);
                if (history.success && history.data) {
                    setCompletionHistory(history.data);
                }
            } catch (error) {
                console.error("Error fetching streak data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    // Build month data
    const getCalendarData = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay();

        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const daysPracticed = Object.keys(completionHistory).filter((date) => {
            const dateObj = new Date(date);
            return (
                dateObj.getFullYear() === year && dateObj.getMonth() === month
            );
        }).length;

        const calendarDays = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push(null);
        }

        const today = new Date();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split("T")[0];

            const isCompleted = completionHistory[dateKey] === true;

            const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

            calendarDays.push({
                day,
                dateKey,
                isCompleted,
                isToday,
            });
        }

        return {
            calendarDays,
            daysPracticed,
            monthName: currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
            }),
        };
    };

    const navigateMonth = (direction) => {
        setCurrentMonth((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
            return newDate;
        });
    };

    const calendarData = getCalendarData();
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={["top"]}
        >
            {/* HEADER */}
            <View
                style={[
                    styles.header,
                    {
                        borderBottomColor: colors.border,
                        backgroundColor: colors.card,
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="close"
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>

                <Text
                    style={[styles.headerTitle, { color: colors.textPrimary }]}
                >
                    Streak
                </Text>

                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* STREAK SECTION */}
                <View
                    style={[
                        styles.streakSection,
                        { backgroundColor: colors.tabActive },
                    ]}
                >
                    <View
                        style={[
                            styles.streakBadge,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        <Text
                            style={[
                                styles.streakBadgeText,
                                { color: colors.tabActive },
                            ]}
                        >
                            STREAK
                        </Text>
                    </View>

                    <Text style={[styles.streakNumber, { color: "#fff" }]}>
                        {streak}
                    </Text>

                    <Text style={[styles.streakLabel, { color: "#fff" }]}>
                        day streak!
                    </Text>

                    <View style={styles.flameIconContainer}>
                        <Ionicons name="flame" size={60} color="#fff" />
                    </View>
                </View>

                {/* CALENDAR SECTION */}
                <View
                    style={[
                        styles.calendarSection,
                        { backgroundColor: colors.background },
                    ]}
                >
                    {/* Month header */}
                    <View style={styles.monthHeader}>
                        <Text
                            style={[
                                styles.monthTitle,
                                { color: colors.textPrimary },
                            ]}
                        >
                            {calendarData.monthName}
                        </Text>

                        <View style={styles.monthNavigation}>
                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={() => navigateMonth("prev")}
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={20}
                                    color={colors.textPrimary}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={() => navigateMonth("next")}
                            >
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.textPrimary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Summary Boxes */}
                    <View style={styles.summaryBoxes}>
                        <View
                            style={[
                                styles.summaryBox,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View style={styles.summaryBoxContent}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={colors.tabActive}
                                />
                                <View style={styles.summaryBoxText}>
                                    <Text
                                        style={[
                                            styles.summaryBoxNumber,
                                            { color: colors.textPrimary },
                                        ]}
                                    >
                                        {calendarData.daysPracticed}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.summaryBoxLabel,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        Days practiced
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Calendar grid */}
                    <View style={styles.calendarGrid}>
                        <View style={styles.weekDayRow}>
                            {weekDays.map((day, index) => (
                                <View key={index} style={styles.weekDayHeader}>
                                    <Text
                                        style={[
                                            styles.weekDayText,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.calendarDaysContainer}>
                            {calendarData.calendarDays.map((d, index) => {
                                if (d === null) {
                                    return (
                                        <View
                                            key={index}
                                            style={styles.calendarDay}
                                        />
                                    );
                                }

                                const { day, isCompleted, isToday } = d;

                                return (
                                    <View
                                        key={index}
                                        style={styles.calendarDay}
                                    >
                                        <View
                                            style={[
                                                styles.calendarDayCircle,
                                                isCompleted && {
                                                    backgroundColor:
                                                        colors.tabActive,
                                                },
                                                isToday &&
                                                    !isCompleted && {
                                                        borderColor:
                                                            colors.tabActive,
                                                        borderWidth: 2,
                                                    },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.calendarDayText,
                                                    {
                                                        color: isCompleted
                                                            ? "#fff"
                                                            : isToday
                                                            ? colors.tabActive
                                                            : colors.textPrimary,
                                                    },
                                                ]}
                                            >
                                                {day}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    placeholder: { width: 40 },

    scrollView: { flex: 1 },

    streakSection: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        position: "relative",
    },
    streakBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    streakBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    streakNumber: {
        fontSize: 72,
        fontWeight: "900",
        marginBottom: 8,
    },
    streakLabel: {
        fontSize: 24,
        fontWeight: "600",
    },
    flameIconContainer: {
        position: "absolute",
        right: 30,
        top: 40,
    },

    calendarSection: {
        paddingVertical: 24,
        paddingHorizontal: 20,
    },

    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    monthNavigation: { flexDirection: "row", gap: 12 },

    monthNavButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },

    summaryBoxes: { flexDirection: "row", gap: 12, marginBottom: 24 },

    summaryBox: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },

    summaryBoxContent: { flexDirection: "row", alignItems: "center", gap: 12 },

    summaryBoxText: { flex: 1 },

    summaryBoxNumber: {
        fontSize: 24,
        fontWeight: "700",
    },
    summaryBoxLabel: {
        fontSize: 14,
        marginTop: 4,
    },

    calendarGrid: {},

    weekDayRow: { flexDirection: "row", marginBottom: 12 },
    weekDayHeader: { flex: 1, alignItems: "center" },
    weekDayText: { fontSize: 12, fontWeight: "600" },

    calendarDaysContainer: { flexDirection: "row", flexWrap: "wrap" },

    calendarDay: {
        width: "14.28%",
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    calendarDayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },

    calendarDayText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
