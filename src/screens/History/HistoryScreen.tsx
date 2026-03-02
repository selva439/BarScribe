import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Calendar } from 'react-native-calendars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/colors';
import { getAllWorkoutDates } from '../../database/repositories/workoutRepository';
import { toISODate } from '../../utils/dateHelpers';
import { type HistoryStackParamList, type TabParamList, type RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'History'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'HistoryStack'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export default function HistoryScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean; dotColor: string }>>({});

  useFocusEffect(useCallback(() => {
    getAllWorkoutDates(db).then(dates => {
      const marks: Record<string, { marked: boolean; dotColor: string }> = {};
      for (const date of dates) {
        marks[date] = { marked: true, dotColor: Colors.accent };
      }
      setMarkedDates(marks);
    }).catch(console.warn);
  }, [db]));

  const handleDayPress = (day: { dateString: string }) => {
    if (markedDates[day.dateString]) {
      (navigation as any).navigate('SessionReview', { workoutDate: day.dateString });
    }
  };

  const today = toISODate(new Date());

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        markedDates={{
          ...markedDates,
          [today]: {
            ...(markedDates[today] ?? {}),
            today: true,
          },
        }}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.background,
          textSectionTitleColor: Colors.textMuted,
          selectedDayBackgroundColor: Colors.accent,
          selectedDayTextColor: '#FFF',
          todayTextColor: Colors.accent,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.textDisabled,
          dotColor: Colors.accent,
          selectedDotColor: '#FFF',
          arrowColor: Colors.accent,
          monthTextColor: Colors.text,
          indicatorColor: Colors.accent,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />
      <View style={styles.legend}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>Training day — tap to review session</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  calendar: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  legendText: { color: Colors.textMuted, fontSize: 13 },
});
