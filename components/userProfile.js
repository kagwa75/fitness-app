import { FlatList, Image, SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FitnessItems } from "../Context";
import { useContext, useState } from "react";
import { images } from "../constants";
import { Calendar } from "react-native-calendars";

export default function UserProfile() {
    const { calories, minutes, workout, completed } = useContext(FitnessItems);
    const [selectedDate, setSelectedDate] = useState("");
    const [showCalendar, setShowCalendar] = useState(true);

    const markedDates = completed.reduce((acc, date) => {
        acc[date] = {
            selected: selectedDate === date,
            selectedColor: "#3a86ff",
            dotColor: selectedDate === date ? 'white' : '#3a86ff'
        };
        return acc;
    }, {});

    const workoutsOnSelectedDate = completed.filter(item => item.date === selectedDate);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={workoutsOnSelectedDate.length > 0 ? workoutsOnSelectedDate : completed}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.workoutCard}>
                        <Text style={styles.workoutText}>{item.name || item}</Text>
                        {item.date && <Text style={styles.workoutDate}>{item.date}</Text>}
                    </View>
                )}
                ListHeaderComponent={() => (
                    <View style={styles.headerContainer}>
                        {/* Profile Header */}
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportTitle}>ACTIVITY REPORT</Text>
                            <Text style={styles.reportSubtitle}>Your weekly summary</Text>
                        </View>

                        {/* Stats Cards */}
                        <View style={styles.statsContainer}>
                            <StatCard value={workout} label="WORKOUTS" />
                            <StatCard value={minutes} label="MINUTES" />
                            <StatCard value={calories.toFixed(2)} label="KCAL" />
                        </View>

                        {/* Calendar Section */}
                        <TouchableOpacity
                            onPress={() => setShowCalendar(!showCalendar)}
                            style={styles.calendarToggle}
                        >
                            <Text style={styles.sectionTitle}>
                                WORKOUT CALENDAR {showCalendar ? '▲' : '▼'}
                            </Text>
                        </TouchableOpacity>

                        {showCalendar && (
                            <View style={styles.calendarContainer}>
                                <Calendar
                                    markedDates={markedDates}
                                    theme={calendarTheme}
                                    onDayPress={(day) => setSelectedDate(day.dateString)}
                                    style={styles.calendar}
                                />
                                {selectedDate && workoutsOnSelectedDate.length > 0 && (
                                    <Text style={styles.selectedDateText}>
                                        {workoutsOnSelectedDate.length} workout{workoutsOnSelectedDate.length > 1 ? 's' : ''} on {selectedDate}
                                    </Text>
                                )}
                            </View>
                        )}

                        <Text style={styles.sectionTitle}>WORKOUT HISTORY</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Image
                            source={images.noResult}
                            resizeMode="contain"
                            style={styles.emptyImage}
                        />
                        <Text style={styles.emptyText}>You haven't worked out yet 😉</Text>
                        <Text style={styles.emptySubtext}>Start your fitness journey today!</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const StatCard = ({ value, label }) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    listContent: {
        paddingBottom: 20,
    },
    headerContainer: {
        padding: 20,
        top: 20
    },
    reportHeader: {
        marginBottom: 25,
    },
    reportTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    reportSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 15,
        width: '30%',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statValue: {
        fontWeight: "bold",
        fontSize: 20,
        color: '#3a86ff',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    calendarToggle: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3a86ff',
        marginVertical: 10,
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        elevation: 2,
    },
    calendar: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    selectedDateText: {
        marginTop: 10,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    workoutCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 10,
        elevation: 2,
    },
    workoutText: {
        fontSize: 16,
        fontWeight: '500',
    },
    workoutDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyImage: {
        width: 200,
        height: 200,
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
});

const calendarTheme = {
    todayTextColor: '#3a86ff',
    arrowColor: '#3a86ff',
    selectedDayBackgroundColor: '#3a86ff',
    selectedDayTextColor: '#ffffff',
    textDayFontWeight: '400',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '500',
};