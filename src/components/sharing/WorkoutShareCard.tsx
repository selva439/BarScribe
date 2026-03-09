import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import { MuscleHeatmap } from '../workout/MuscleHeatmap';
import { type WorkoutScore } from '../../types';

interface Props {
  date: string;
  score: WorkoutScore;
  profilePhotoUri?: string | null;
  userName?: string;
}

/**
 * Branded workout share card (1080×1350 ratio).
 * Rendered off-screen, captured via react-native-view-shot.
 */
export const WorkoutShareCard = React.forwardRef<View, Props>(
  ({ date, score, profilePhotoUri, userName }, ref) => {
    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userRow}>
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {(userName ?? 'I')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{userName ?? 'BarScribe Athlete'}</Text>
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>
          <Text style={styles.logo}>BarScribe</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreNumber}>{score.overallScore}</Text>
          <Text style={styles.scoreLabel}>{score.classification}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score.volumeLoad.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score.setsCompleted}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score.exerciseCount}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score.prsHit}</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>
        </View>

        {/* Mini heatmap */}
        <View style={styles.heatmapSection}>
          <MuscleHeatmap muscleVolume={score.muscleGroupVolume} compact />
        </View>

        {/* INOL */}
        <View style={styles.inolRow}>
          <Text style={styles.inolLabel}>Session INOL</Text>
          <Text style={styles.inolValue}>{score.inol.toFixed(2)}</Text>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>barscribe.app</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: 360,
    aspectRatio: 1080 / 1350,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  userName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  logo: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreNumber: {
    color: Colors.accent,
    fontSize: 64,
    fontWeight: '900',
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    marginHorizontal: 3,
    borderRadius: 8,
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  heatmapSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  inolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  inolLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  inolValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  watermark: {
    color: Colors.textDisabled,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
