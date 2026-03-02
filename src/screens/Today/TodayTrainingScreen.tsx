import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { type TodayStackParamList, type RootStackParamList } from '../../navigation/types';
import { getTodayWorkout, createWorkout } from '../../database/repositories/workoutRepository';
import { getSetsForWorkout, createSet } from '../../database/repositories/setRepository';
import { getActiveUserProgram } from '../../database/repositories/programRepository';
import { getProgramTemplate } from '../../database/repositories/programRepository';
import { getAllPRs } from '../../database/repositories/prRepository';
import { getLastPerformance } from '../../database/repositories/setRepository';
import { useSettings } from '../../contexts/SettingsContext';
import { useActiveWorkout } from '../../contexts/ActiveWorkoutContext';
import { generate531Workout } from '../../utils/programGenerator';
import { formatDisplayDate, toISODate } from '../../utils/dateHelpers';
import { type WorkoutSet, type UserProgram } from '../../types';
import { PROGRAM_IDS } from '../../constants/programs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { type TabParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TodayStackParamList, 'TodayTraining'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'TodayStack'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

interface GroupedSets {
  exerciseId: number;
  exerciseName: string;
  sets: WorkoutSet[];
}

export default function TodayTrainingScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const { setActiveWorkoutId } = useActiveWorkout();

  const [workout, setWorkout] = useState<{ id: number; date: string; completed: 0 | 1 } | null>(null);
  const [groupedSets, setGroupedSets] = useState<GroupedSets[]>([]);
  const [activeProgram, setActiveProgram] = useState<UserProgram | null>(null);
  const [allPRs, setAllPRs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [program, prs] = await Promise.all([
        getActiveUserProgram(db),
        getAllPRs(db),
      ]);
      setActiveProgram(program);

      const prSetIds = new Set(
        Object.values(prs)
          .filter(pr => pr.workout_set_id != null)
          .map(pr => pr.workout_set_id as number)
      );
      setAllPRs(prSetIds);

      const today = await getTodayWorkout(db);

      if (today) {
        const sets = await getSetsForWorkout(db, today.id);
        const groups = groupByExercise(sets);
        setWorkout(today as any);
        setGroupedSets(groups);
      } else {
        setWorkout(null);
        setGroupedSets([]);
      }
    } catch (e) {
      console.warn('TodayTraining load error:', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStartFreestyle = async () => {
    const id = await createWorkout(db, {});
    setActiveWorkoutId(id);
    setWorkout({ id, date: toISODate(new Date()), completed: 0 });
  };

  const handleStartProgramWorkout = async () => {
    if (!activeProgram) return;

    const id = await createWorkout(db, {
      user_program_id: activeProgram.id,
      program_week: activeProgram.current_week,
      program_day: activeProgram.current_day,
    });
    setActiveWorkoutId(id);

    // Generate planned sets from program template
    const tms = {
      squat: activeProgram.tm_squat ?? 100,
      bench: activeProgram.tm_bench ?? 80,
      deadlift: activeProgram.tm_deadlift ?? 120,
      ohp: activeProgram.tm_ohp ?? 60,
    };

    const planned = generate531Workout(tms, activeProgram.current_week, activeProgram.current_day, settings.units);
    for (const ps of planned) {
      await createSet(db, {
        workout_id: id,
        exercise_id: ps.exercise_id,
        set_number: ps.set_number,
        planned_weight: ps.planned_weight,
        planned_reps: ps.planned_reps,
        is_warmup: ps.is_warmup,
      });
    }

    load();
  };

  const handleSetPress = (set: WorkoutSet, group: GroupedSets) => {
    const setIds = group.sets.map(s => s.id);
    const index = group.sets.indexOf(set);
    (navigation as any).navigate('LogSet', {
      workoutId: workout!.id,
      exerciseId: group.exerciseId,
      exerciseName: group.exerciseName,
      setIds,
      currentSetIndex: index,
    });
  };

  const today = formatDisplayDate(toISODate(new Date()));

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Date header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{today}</Text>
          {activeProgram && (
            <View style={styles.programBadge}>
              <Text style={styles.programBadgeText}>
                Week {activeProgram.current_week} · Day {activeProgram.current_day}
              </Text>
            </View>
          )}
        </View>

        {!workout ? (
          /* No workout yet today */
          <View style={styles.startContainer}>
            {activeProgram ? (
              <Card style={styles.programCard} bordered>
                <Ionicons name="barbell" size={32} color={Colors.accent} />
                <Text style={styles.programName}>5/3/1 — Week {activeProgram.current_week}, Day {activeProgram.current_day}</Text>
                <Text style={styles.programSub}>Ready to train?</Text>
                <Button
                  label="Start Today's Workout"
                  onPress={handleStartProgramWorkout}
                  fullWidth
                  style={{ marginTop: 12 }}
                />
                <Button
                  label="Log Freestyle Instead"
                  onPress={handleStartFreestyle}
                  variant="ghost"
                  fullWidth
                  style={{ marginTop: 8 }}
                />
              </Card>
            ) : (
              <EmptyState
                icon="barbell-outline"
                title="No program active"
                message="Choose a program to get structured training or just start logging freely."
                actionLabel="Start Freestyle"
                onAction={handleStartFreestyle}
              />
            )}

            {!activeProgram && (
              <Button
                label="Choose a Program (Pro)"
                onPress={() => navigation.navigate('ProgramSelect')}
                variant="secondary"
                fullWidth
                style={styles.programBtn}
              />
            )}
          </View>
        ) : (
          /* Workout in progress or done */
          <>
            {groupedSets.length === 0 ? (
              <EmptyState
                icon="add-circle-outline"
                title="Workout started"
                message="No sets yet. Add exercises to begin."
              />
            ) : (
              groupedSets.map(group => (
                <ExerciseCard
                  key={group.exerciseId}
                  exerciseName={group.exerciseName}
                  sets={group.sets}
                  prSetIds={allPRs}
                  onSetPress={(set) => handleSetPress(set, group)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function groupByExercise(sets: WorkoutSet[]): GroupedSets[] {
  const map = new Map<number, GroupedSets>();
  for (const set of sets) {
    if (!map.has(set.exercise_id)) {
      map.set(set.exercise_id, {
        exerciseId: set.exercise_id,
        exerciseName: set.exercise_name ?? 'Exercise',
        sets: [],
      });
    }
    map.get(set.exercise_id)!.sets.push(set);
  }
  return Array.from(map.values());
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  programBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  programBadgeText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  startContainer: {
    padding: 20,
    gap: 12,
  },
  programCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  programName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  programSub: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  programBtn: {
    marginTop: 8,
  },
});
