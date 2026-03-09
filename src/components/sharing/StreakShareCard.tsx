import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  thisWeek: number;
  consistencyPct: number;
  /** 12-week × 7-day grid for mini heatmap */
  grid: { date: string | null; count: number }[][];
}

interface Props {
  streak: StreakData;
  userName?: string;
}

function getHeatColor(count: number): string {
  if (count === 0) return Colors.surfaceElevated;
  if (count === 1) return '#4A2010';
  if (count === 2) return '#7A3018';
  return Colors.accent;
}

/**
 * Branded streak share card for Instagram Stories (1080×1920 ratio).
 * Rendered off-screen, captured via react-native-view-shot.
 */
export const StreakShareCard = React.forwardRef<View, Props>(
  ({ streak, userName }, ref) => {
    const fireText =
      streak.currentStreak >= 8
        ? '🔥🔥🔥'
        : streak.currentStreak >= 4
          ? '🔥🔥'
          : streak.currentStreak > 0
            ? '🔥'
            : '';

    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BarScribe</Text>
          <Text style={styles.headerSub}>{userName ?? 'Powerlifting Log'}</Text>
        </View>

        {/* Streak Hero */}
        <View style={styles.streakSection}>
          <Text style={styles.fireEmoji}>{fireText}</Text>
          <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
          <Text style={styles.streakLabel}>WEEK STREAK</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak.thisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak.consistencyPct}%</Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </View>
        </View>

        {/* Mini Heatmap */}
        <View style={styles.heatmapSection}>
          <Text style={styles.heatmapTitle}>LAST 12 WEEKS</Text>
          <View style={styles.heatmapRow}>
            {/* Day labels */}
            <View style={styles.dayLabels}>
              {['M', '', 'W', '', 'F', '', 'S'].map((d, i) => (
                <Text key={i} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>
            {/* Grid */}
            <View style={styles.heatmapGrid}>
              {streak.grid.map((week, wi) => (
                <View key={wi} style={styles.heatmapWeek}>
                  {week.map((day, di) => (
                    <View
                      key={`${wi}-${di}`}
                      style={[
                        styles.heatmapCell,
                        { backgroundColor: day.date ? getHeatColor(day.count) : 'transparent' },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={styles.legendText}>Less</Text>
            {[0, 1, 2, 3].map(n => (
              <View key={n} style={[styles.legendCell, { backgroundColor: getHeatColor(n) }]} />
            ))}
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>barscribe.app</Text>
      </View>
    );
  }
);

const CELL_SIZE = 14;

const styles = StyleSheet.create({
  card: {
    width: 360,
    aspectRatio: 9 / 16,
    backgroundColor: Colors.background,
    padding: 28,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  logo: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  streakSection: {
    alignItems: 'center',
    gap: 4,
  },
  fireEmoji: {
    fontSize: 36,
  },
  streakNumber: {
    color: Colors.accent,
    fontSize: 80,
    fontWeight: '900',
    lineHeight: 88,
  },
  streakLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  heatmapSection: {
    gap: 8,
  },
  heatmapTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dayLabels: {
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  dayLabel: {
    color: Colors.textDisabled,
    fontSize: 9,
    fontWeight: '600',
    height: CELL_SIZE + 2,
    lineHeight: CELL_SIZE + 2,
    width: 12,
    textAlign: 'right',
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 2,
  },
  heatmapWeek: {
    gap: 2,
  },
  heatmapCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  legendText: {
    color: Colors.textDisabled,
    fontSize: 9,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  watermark: {
    color: Colors.textDisabled,
    fontSize: 11,
    textAlign: 'center',
  },
});
