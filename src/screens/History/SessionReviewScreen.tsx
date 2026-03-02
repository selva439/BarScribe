import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { type RootStackParamList } from '../../navigation/types';
import { getWorkoutById } from '../../database/repositories/workoutRepository';
import { getSetsForWorkout } from '../../database/repositories/setRepository';
import { type Workout, type WorkoutSet } from '../../types';
import { formatDisplayDate } from '../../utils/dateHelpers';
import { useSettings } from '../../contexts/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionReview'>;

interface GroupedExercise {
  name: string;
  sets: WorkoutSet[];
}

export default function SessionReviewScreen({ route }: Props) {
  const { workoutId } = route.params;
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<GroupedExercise[]>([]);

  useEffect(() => {
    Promise.all([
      getWorkoutById(db, workoutId),
      getSetsForWorkout(db, workoutId),
    ]).then(([w, sets]) => {
      setWorkout(w);
      const groups = new Map<string, WorkoutSet[]>();
      for (const set of sets) {
        const name = set.exercise_name ?? 'Exercise';
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name)!.push(set);
      }
      setExercises(Array.from(groups.entries()).map(([name, s]) => ({ name, sets: s })));
    }).catch(console.warn);
  }, [db, workoutId]);

  if (!workout) return null;

  const completedSets = exercises.flatMap(e => e.sets).filter(s => s.actual_weight != null);
  const totalVolume = completedSets.reduce((sum, s) =>
    sum + (s.actual_weight ?? 0) * (s.actual_reps ?? 0), 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.date}>{formatDisplayDate(workout.date)}</Text>
          {workout.completed === 1 && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completedSets.length}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(totalVolume).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Volume ({settings.units})</Text>
          </View>
        </View>

        {/* Exercises */}
        {exercises.map(exercise => (
          <Card bordered key={exercise.name} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.sets
              .filter(s => s.is_warmup === 0 && s.actual_weight != null)
              .map((set, i) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNum}>{i + 1}</Text>
                  <Text style={styles.setWeight}>
                    {set.actual_weight}{settings.units} × {set.actual_reps}
                  </Text>
                  {set.rpe && <Text style={styles.rpe}>RPE {set.rpe}</Text>}
                </View>
              ))}
          </Card>
        ))}

        {workout.notes && (
          <Card style={styles.notes}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { color: Colors.success, fontSize: 13, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 0 },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
  },
  statValue: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 12 },
  exerciseCard: { gap: 8 },
  exerciseName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  setNum: { color: Colors.textDisabled, fontSize: 13, width: 20 },
  setWeight: { color: Colors.textSecondary, fontSize: 15, flex: 1 },
  rpe: { color: Colors.textMuted, fontSize: 13 },
  notes: {},
  notesLabel: { color: Colors.textDisabled, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  notesText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
