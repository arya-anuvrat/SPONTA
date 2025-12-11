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
import { auth } from "../../services/firebase";

export default function StreakScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();
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

                // Fetch user stats (includes streak)
                const stats = await userAPI.getStats(idToken);
                if (stats.success && stats.data) {
                    setStreak(stats.data.user?.currentStreak || 0);
                }

                // Fetch completion history
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

    // Get calendar data for current month
    const getCalendarData = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        // First day of month
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Last day of month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get days practiced this month
        const daysPracticed = Object.keys(completionHistory).filter(date => {
            const dateObj = new Date(date);
            return dateObj.getFullYear() === year && dateObj.getMonth() === month;
        }).length;
        
        // Create calendar grid
        const calendarDays = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push(null);
        }
        
        // Add days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
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
            monthName: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
        };
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const calendarData = getCalendarData();
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Streak</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Streak Section */}
                <View style={styles.streakSection}>
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakBadgeText}>STREAK</Text>
                    </View>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>day streak!</Text>
                    <View style={styles.flameIconContainer}>
                        <Ionicons name="flame" size={60} color="#fff" />
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={styles.calendarSection}>
                    {/* Month Header */}
                    <View style={styles.monthHeader}>
                        <Text style={styles.monthTitle}>{calendarData.monthName}</Text>
                        <View style={styles.monthNavigation}>
                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={() => navigateMonth('prev')}
                            >
                                <Ionicons name="chevron-back" size={20} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={() => navigateMonth('next')}
                            >
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Summary Boxes */}
                        <View style={styles.summaryBoxes}>
                        <View style={styles.summaryBox}>
                            <View style={styles.summaryBoxContent}>
                                <Ionicons name="checkmark-circle" size={24} color="#7b3aed" />
                                <View style={styles.summaryBoxText}>
                                    <Text style={styles.summaryBoxNumber}>{calendarData.daysPracticed}</Text>
                                    <Text style={styles.summaryBoxLabel}>Days practiced</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {/* Week day headers */}
                        <View style={styles.weekDayRow}>
                            {weekDays.map((day, index) => (
                                <View key={index} style={styles.weekDayHeader}>
                                    <Text style={styles.weekDayText}>{day}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar days */}
                        <View style={styles.calendarDaysContainer}>
                            {calendarData.calendarDays.map((dayData, index) => {
                                if (dayData === null) {
                                    return <View key={index} style={styles.calendarDay} />;
                                }

                                const { day, isCompleted, isToday } = dayData;

                                return (
                                    <View
                                        key={index}
                                        style={styles.calendarDay}
                                    >
                                        <View
                                            style={[
                                                styles.calendarDayCircle,
                                                isCompleted && styles.calendarDayCompleted,
                                                isToday && !isCompleted && styles.calendarDayTodayCircle,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.calendarDayText,
                                                    isCompleted && styles.calendarDayTextCompleted,
                                                    !isCompleted && isToday && styles.calendarDayTextToday,
                                                    !isCompleted && !isToday && styles.calendarDayText,
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
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
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
        color: "#333",
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    streakSection: {
        backgroundColor: "#7b3aed",
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        position: "relative",
    },
    streakBadge: {
        backgroundColor: "#fff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    streakBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#7b3aed",
        letterSpacing: 0.5,
    },
    streakNumber: {
        fontSize: 72,
        fontWeight: "900",
        color: "#fff",
        marginBottom: 8,
    },
    streakLabel: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
    },
    flameIconContainer: {
        position: "absolute",
        right: 30,
        top: 40,
    },
    calendarSection: {
        backgroundColor: "#fff",
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
        color: "#333",
    },
    monthNavigation: {
        flexDirection: "row",
        gap: 12,
    },
    monthNavButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    summaryBoxes: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    summaryBox: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#eee",
    },
    summaryBoxContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    summaryBoxText: {
        flex: 1,
    },
    summaryBoxNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
    },
    summaryBoxLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    calendarGrid: {
        backgroundColor: "#fff",
    },
    weekDayRow: {
        flexDirection: "row",
        marginBottom: 12,
    },
    weekDayHeader: {
        flex: 1,
        alignItems: "center",
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    calendarDaysContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    calendarDay: {
        width: "14.28%",
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
    },
    calendarDayCircle: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        minWidth: 36,
        minHeight: 36,
    },
    calendarDayCompleted: {
        backgroundColor: "#7b3aed",
    },
    calendarDayTodayCircle: {
        borderWidth: 2,
        borderColor: "#7b3aed",
        backgroundColor: "transparent",
    },
    calendarDayText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    calendarDayTextCompleted: {
        color: "#fff",
        fontWeight: "700",
    },
    calendarDayTextToday: {
        color: "#7b3aed",
        fontWeight: "700",
    },
});

