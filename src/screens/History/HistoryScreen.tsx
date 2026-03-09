import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Calendar } from 'react-native-calendars';
import { BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import {
  getAllWorkoutDates,
  getWorkoutsByDateRange,
  getWeeklyWorkoutCounts,
  getTrainingStreak,
} from '../../database/repositories/workoutRepository';
import { toISODate } from '../../utils/dateHelpers';
import { type HistoryStackParamList, type TabParamList, type RootStackParamList } from '../../navigation/types';
import { StreakShareCard } from '../../components/sharing/StreakShareCard';
import { captureAndShare } from '../../utils/shareUtils';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'History'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'HistoryStack'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

const SCREEN_WIDTH = Dimensions.get('window').width;

// GitHub-style contribution heatmap colors
function getHeatColor(count: number): string {
  if (count === 0) return Colors.surfaceElevated;
  if (count === 1) return '#4A2010';
  if (count === 2) return '#7A3018';
  return Colors.accent; // 3+
}

export default function HistoryScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean; dotColor: string }>>({});
  const [weeklyCounts, setWeeklyCounts] = useState<{ week: string; count: number }[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalWorkouts: 0, thisWeek: 0 });
  const [allDates, setAllDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const shareCardRef = useRef<View>(null);

  useFocusEffect(useCallback(() => {
    Promise.all([
      getAllWorkoutDates(db),
      getWeeklyWorkoutCounts(db, 12),
      getTrainingStreak(db),
    ]).then(([dates, weekly, streakData]) => {
      const marks: Record<string, { marked: boolean; dotColor: string }> = {};
      for (const date of dates) {
        marks[date] = { marked: true, dotColor: Colors.accent };
      }
      setMarkedDates(marks);
      setWeeklyCounts(weekly);
      setStreak(streakData);
      setAllDates(dates);
    }).catch(console.warn);
  }, [db]));

  const handleDayPress = async (day: { dateString: string }) => {
    if (markedDates[day.dateString]) {
      const workouts = await getWorkoutsByDateRange(db, day.dateString, day.dateString);
      if (workouts.length > 0) {
        (navigation as any).navigate('SessionReview', { workoutId: workouts[0].id });
      }
    }
  };

  const today = toISODate(new Date());

  // Build 12-week contribution grid (like GitHub)
  const contributionGrid = buildContributionGrid(allDates);

  // Bar chart data
  const barData = weeklyCounts.map(w => ({
    value: w.count,
    label: `W${w.week.split('-W')[1] ?? ''}`,
    frontColor: w.count >= 3 ? Colors.accent : w.count >= 2 ? '#FF8C00' : '#FFD700',
    topLabelComponent: () => (
      <Text style={{ color: Colors.textMuted, fontSize: 9, marginBottom: 2 }}>{w.count}</Text>
    ),
  }));

  // Calculate consistency %
  const weeksWithWorkouts = weeklyCounts.filter(w => w.count > 0).length;
  const consistencyPct = weeklyCounts.length > 0 ? Math.round((weeksWithWorkouts / weeklyCounts.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Streak Hero */}
        <View style={styles.streakHero}>
          <View style={styles.streakMain}>
            <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>WEEK STREAK</Text>
          </View>
          <View style={styles.streakFire}>
            {streak.currentStreak > 0 && (
              <Text style={styles.fireEmoji}>
                {streak.currentStreak >= 8 ? '🔥🔥🔥' : streak.currentStreak >= 4 ? '🔥🔥' : '🔥'}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{streak.thisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{streak.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{consistencyPct}%</Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </Card>
        </View>

        {/* Contribution Heatmap */}
        <Card bordered style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>TRAINING ACTIVITY</Text>
          <Text style={styles.heatmapSubtitle}>Each box = 1 day. Brighter = more sessions that day.</Text>
          <View style={styles.heatmapRow}>
            {/* Day labels */}
            <View style={styles.dayLabelsColumn}>
              {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
                <Text key={i} style={styles.dayLabelText}>{d}</Text>
              ))}
            </View>
            {/* Grid */}
            <View style={styles.heatmapContainer}>
              {contributionGrid.map((week, wi) => (
                <View key={wi} style={styles.heatmapWeek}>
                  {week.map((day, di) => (
                    <View
                      key={`${wi}-${di}`}
                      style={[
                        styles.heatmapCell,
                        { backgroundColor: day.date ? getHeatColor(day.count) : 'transparent' },
                        day.date === today && styles.heatmapToday,
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={styles.heatmapLegendText}>Less</Text>
            {[0, 1, 2, 3].map(n => (
              <View key={n} style={[styles.heatmapCell, { backgroundColor: getHeatColor(n) }]} />
            ))}
            <Text style={styles.heatmapLegendText}>More</Text>
          </View>
        </Card>

        {/* Weekly Frequency Bar Chart */}
        {barData.length > 0 && (
          <Card bordered style={styles.chartCard}>
            <Text style={styles.sectionTitle}>SESSIONS PER WEEK</Text>
            <View style={styles.chartTarget}>
              <Text style={styles.chartTargetText}>Target: 3-4 sessions/week</Text>
            </View>
            <BarChart
              data={barData}
              height={100}
              barWidth={16}
              spacing={6}
              noOfSections={4}
              maxValue={Math.max(...barData.map(d => d.value), 5)}
              barBorderRadius={3}
              xAxisColor={Colors.border}
              yAxisColor={Colors.border}
              yAxisTextStyle={{ color: Colors.textMuted, fontSize: 9 }}
              xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 8 }}
              backgroundColor="transparent"
              rulesColor={Colors.border}
              hideRules={false}
              isAnimated
            />
          </Card>
        )}

        {/* Progress Tips */}
        <Card bordered style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>PROGRESSION PROTOCOL</Text>
          <View style={styles.tipRow}>
            <Ionicons name="trending-up" size={16} color={Colors.accent} />
            <Text style={styles.tipText}>Add +2.5kg upper / +5kg lower each cycle</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="repeat" size={16} color={Colors.accent} />
            <Text style={styles.tipText}>3-4 sessions per week for optimal strength</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="moon" size={16} color={Colors.accent} />
            <Text style={styles.tipText}>48-72h rest between same muscle groups</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="pulse" size={16} color={Colors.accent} />
            <Text style={styles.tipText}>Deload every 4th week at 50-60% volume</Text>
          </View>
        </Card>

        {/* Share Streak Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => captureAndShare(shareCardRef)}
        >
          <Ionicons name="share-social" size={18} color={Colors.text} />
          <Text style={styles.shareButtonText}>Share Streak to Instagram</Text>
        </TouchableOpacity>

        {/* Full Calendar Toggle */}
        <TouchableOpacity style={styles.calendarToggle} onPress={() => setShowCalendar(!showCalendar)}>
          <Ionicons name={showCalendar ? 'chevron-up' : 'calendar-outline'} size={18} color={Colors.textMuted} />
          <Text style={styles.calendarToggleText}>
            {showCalendar ? 'Hide Calendar' : 'Show Full Calendar'}
          </Text>
        </TouchableOpacity>

        {showCalendar && (
          <Calendar
            markedDates={{
              ...markedDates,
              [today]: { ...(markedDates[today] ?? {}), today: true },
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
        )}
      </ScrollView>

      {/* Off-screen share card for capture */}
      <View style={styles.offScreen}>
        <StreakShareCard
          ref={shareCardRef}
          streak={{
            ...streak,
            consistencyPct,
            grid: contributionGrid,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

/** Build a 12-week × 7-day contribution grid */
function buildContributionGrid(allDates: string[]): { date: string | null; count: number }[][] {
  const dateCountMap = new Map<string, number>();
  for (const d of allDates) {
    dateCountMap.set(d, (dateCountMap.get(d) ?? 0) + 1);
  }

  const grid: { date: string | null; count: number }[][] = [];
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0

  // Start from 12 weeks ago, aligned to Monday
  const start = new Date(today);
  start.setDate(today.getDate() - (11 * 7 + dayOfWeek));

  for (let w = 0; w < 12; w++) {
    const week: { date: string | null; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + w * 7 + d);

      if (cellDate > today) {
        week.push({ date: null, count: 0 });
      } else {
        const dateStr = cellDate.toISOString().split('T')[0];
        week.push({ date: dateStr, count: dateCountMap.get(dateStr) ?? 0 });
      }
    }
    grid.push(week);
  }

  return grid;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  // Streak Hero
  streakHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  streakMain: { alignItems: 'center' },
  streakNumber: { color: Colors.accent, fontSize: 56, fontWeight: '900', lineHeight: 60 },
  streakLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  streakFire: { marginTop: -8 },
  fireEmoji: { fontSize: 28 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 6 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // Heatmap
  heatmapCard: { padding: 16 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heatmapSubtitle: {
    color: Colors.textDisabled,
    fontSize: 11,
    marginBottom: 12,
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayLabelsColumn: {
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  dayLabelText: {
    color: Colors.textDisabled,
    fontSize: 9,
    fontWeight: '600',
    height: (SCREEN_WIDTH - 100) / 13 + 3,
    lineHeight: (SCREEN_WIDTH - 100) / 13 + 3,
    width: 14,
    textAlign: 'right',
  },
  heatmapContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  heatmapWeek: { gap: 3 },
  heatmapCell: {
    width: (SCREEN_WIDTH - 100) / 13,
    height: (SCREEN_WIDTH - 100) / 13,
    borderRadius: 3,
  },
  heatmapToday: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  heatmapLegendText: { color: Colors.textDisabled, fontSize: 10 },

  // Chart
  chartCard: { padding: 16 },
  chartTarget: { marginBottom: 8 },
  chartTargetText: { color: Colors.textMuted, fontSize: 11 },

  // Tips
  tipsCard: { padding: 16, gap: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },

  // Share button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  // Off-screen capture
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },

  // Calendar toggle
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  calendarToggleText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  calendar: { borderRadius: 12, overflow: 'hidden' },
});
