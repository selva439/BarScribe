import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { type RootStackParamList } from '../../navigation/types';
import { getWorkoutById } from '../../database/repositories/workoutRepository';
import { getSetsForWorkout } from '../../database/repositories/setRepository';
import { getAllPRs } from '../../database/repositories/prRepository';
import { type Workout, type WorkoutSet, type WorkoutScore } from '../../types';
import { scoreWorkout } from '../../utils/workoutScoring';
import { formatDisplayDate } from '../../utils/dateHelpers';
import { useSettings } from '../../contexts/SettingsContext';
import { MuscleHeatmap } from '../../components/workout/MuscleHeatmap';
import { WorkoutShareCard } from '../../components/sharing/WorkoutShareCard';
import { captureAndShare } from '../../utils/shareUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSummary'>;

export default function WorkoutSummaryScreen({ route }: Props) {
  const { workoutId } = route.params;
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const shareCardRef = useRef<View>(null);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [score, setScore] = useState<WorkoutScore | null>(null);

  useEffect(() => {
    async function load() {
      const [w, s, prs] = await Promise.all([
        getWorkoutById(db, workoutId),
        getSetsForWorkout(db, workoutId),
        getAllPRs(db),
      ]);
      setWorkout(w);
      setSets(s);

      // Build exerciseId → estimated1RM map from PRs
      const prMap: Record<number, number> = {};
      for (const pr of Object.values(prs)) {
        prMap[pr.exercise_id] = pr.estimated_1rm;
      }

      // Count PRs hit in this workout
      const prSetIds = new Set<number>();
      for (const pr of Object.values(prs)) {
        if (pr.workout_set_id != null) {
          const belongsToWorkout = s.some(set => set.id === pr.workout_set_id);
          if (belongsToWorkout) prSetIds.add(pr.workout_set_id);
        }
      }

      const result = scoreWorkout(s, prMap, 0, prSetIds.size);
      setScore(result);
    }
    load().catch(console.warn);
  }, [db, workoutId]);

  if (!workout || !score) return null;

  const handleShare = async () => {
    await captureAndShare(shareCardRef);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Date Header */}
        <Text style={styles.date}>{formatDisplayDate(workout.date)}</Text>

        {/* Score Circle */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score.overallScore}</Text>
          </View>
          <Text style={styles.classification}>{score.classification}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBox label="Volume" value={`${score.volumeLoad.toLocaleString()} ${settings.units}`} />
          <StatBox label="INOL" value={score.inol.toFixed(2)} />
          <StatBox label="Sets" value={String(score.setsCompleted)} />
          <StatBox label="PRs" value={String(score.prsHit)} accent={score.prsHit > 0} />
        </View>

        {/* Muscle Heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscles Worked</Text>
          <MuscleHeatmap muscleVolume={score.muscleGroupVolume} />
        </View>

        {/* INOL Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exercises</Text>
            <Text style={styles.detailValue}>{score.exerciseCount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Working Sets</Text>
            <Text style={styles.detailValue}>{score.setsCompleted}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Volume</Text>
            <Text style={styles.detailValue}>{score.volumeLoad.toLocaleString()} {settings.units}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Session INOL</Text>
            <Text style={styles.detailValue}>{score.inol.toFixed(2)}</Text>
          </View>
          <View style={styles.inolGuide}>
            <Text style={styles.inolGuideText}>
              INOL 0.4–1.0 per exercise = optimal | Session 2–4 = productive
            </Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color="#FFF" />
          <Text style={styles.shareBtnText}>Share Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Hidden share card for capture */}
      <View style={styles.offscreen}>
        <WorkoutShareCard
          ref={shareCardRef}
          date={formatDisplayDate(workout.date)}
          score={score}
        />
      </View>
    </SafeAreaView>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, accent && { color: Colors.accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  date: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },

  scoreSection: { alignItems: 'center', paddingVertical: 8 },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  scoreNumber: {
    color: Colors.accent,
    fontSize: 48,
    fontWeight: '900',
  },
  classification: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
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
  statValue: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },

  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: { color: Colors.textMuted, fontSize: 14 },
  detailValue: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  inolGuide: {
    marginTop: 8,
    paddingTop: 8,
  },
  inolGuideText: {
    color: Colors.textDisabled,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  shareBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  offscreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
});
