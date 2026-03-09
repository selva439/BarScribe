import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Modal,
  SectionList,
  Pressable,
  TextInput,
  Alert,
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
import { getSetsForWorkout, createSet, deleteSetsForExercise } from '../../database/repositories/setRepository';
import { getActiveUserProgram } from '../../database/repositories/programRepository';
import { getProgramTemplate } from '../../database/repositories/programRepository';
import { getAllPRs } from '../../database/repositories/prRepository';
import { getLastPerformance } from '../../database/repositories/setRepository';
import { useSettings } from '../../contexts/SettingsContext';
import { useActiveWorkout } from '../../contexts/ActiveWorkoutContext';
import { generate531Workout } from '../../utils/programGenerator';
import { formatDisplayDate, toISODate } from '../../utils/dateHelpers';
import { type WorkoutSet, type UserProgram, type Exercise } from '../../types';
import { PROGRAM_IDS } from '../../constants/programs';
import { getMuscleCategory } from '../../constants/muscleGroups';
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

// Muscle categories now come from src/constants/muscleGroups.ts via getMuscleCategory()

function getExerciseSections(exercises: Exercise[], search: string) {
  const q = search.toLowerCase().trim();
  const filtered = q
    ? exercises.filter(e => e.name.toLowerCase().includes(q))
    : exercises;

  const groups = new Map<string, Exercise[]>();
  // Competition lifts first
  const compLifts = filtered.filter(e => e.is_competition_lift === 1);
  if (compLifts.length > 0) groups.set('Competition Lifts', compLifts);

  for (const e of filtered) {
    if (e.is_competition_lift === 1) continue;
    const muscle = getMuscleCategory(e.id);
    if (!groups.has(muscle)) groups.set(muscle, []);
    groups.get(muscle)!.push(e);
  }

  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
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
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');

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

  const handleOpenExercisePicker = async () => {
    const rows = await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises ORDER BY is_competition_lift DESC, name ASC'
    );
    setExercises(rows);
    setExerciseSearch('');
    setShowExercisePicker(true);
  };

  const handlePickExercise = async (exercise: Exercise) => {
    if (!workout) return;
    setShowExercisePicker(false);

    // Find current max set_number for this exercise in this workout
    const existing = groupedSets.find(g => g.exerciseId === exercise.id);
    const startSet = existing ? existing.sets.length + 1 : 1;

    // Create 3 empty sets for the chosen exercise
    const newSetIds: number[] = [];
    for (let i = 0; i < 3; i++) {
      const id = await createSet(db, {
        workout_id: workout.id,
        exercise_id: exercise.id,
        set_number: startSet + i,
      });
      newSetIds.push(id);
    }

    await load();

    // Navigate to log the first new set
    (navigation as any).navigate('LogSet', {
      workoutId: workout.id,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setIds: newSetIds,
      currentSetIndex: 0,
    });
  };

  const handleDeleteExercise = (group: GroupedSets) => {
    if (!workout) return;
    Alert.alert(
      `Remove ${group.exerciseName}?`,
      'All sets for this exercise will be deleted from today\'s workout.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteSetsForExercise(db, workout.id, group.exerciseId);
            load();
          },
        },
      ]
    );
  };

  const handleCreateCustomExercise = async () => {
    const name = exerciseSearch.trim();
    if (!name) return;

    const result = await db.runAsync(
      "INSERT INTO exercises (name, category, is_competition_lift) VALUES (?, 'accessory', 0)",
      name
    );
    const newExercise: Exercise = {
      id: result.lastInsertRowId,
      name,
      category: 'accessory',
      is_competition_lift: 0,
    };
    await handlePickExercise(newExercise);
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
                actionLabel="Add Exercise"
                onAction={handleOpenExercisePicker}
              />
            ) : (
              <>
                {groupedSets.map(group => (
                  <ExerciseCard
                    key={group.exerciseId}
                    exerciseName={group.exerciseName}
                    sets={group.sets}
                    prSetIds={allPRs}
                    onSetPress={(set) => handleSetPress(set, group)}
                    onDelete={() => handleDeleteExercise(group)}
                  />
                ))}

                {/* Show summary button when sets have been logged */}
                {groupedSets.some(g => g.sets.some(s => s.actual_weight != null)) && (
                  <TouchableOpacity
                    style={styles.summaryBtn}
                    onPress={() => (navigation as any).navigate('WorkoutSummary', { workoutId: workout!.id })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="stats-chart" size={18} color={Colors.accent} />
                    <Text style={styles.summaryBtnText}>View Workout Summary</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB — visible when workout is active */}
      {workout && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={handleOpenExercisePicker}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowExercisePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowExercisePicker(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.textMuted}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
                autoCorrect={false}
              />
              {exerciseSearch.length > 0 && (
                <TouchableOpacity onPress={() => setExerciseSearch('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <SectionList
              sections={getExerciseSections(exercises, exerciseSearch)}
              keyExtractor={(item) => String(item.id)}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseRow}
                  onPress={() => handlePickExercise(item)}
                >
                  <Ionicons
                    name={item.is_competition_lift ? 'barbell' : 'fitness'}
                    size={20}
                    color={item.is_competition_lift ? Colors.accent : Colors.textSecondary}
                  />
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  {item.is_competition_lift === 1 && (
                    <View style={styles.compBadge}>
                      <Text style={styles.compBadgeText}>SBD</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              stickySectionHeadersEnabled={false}
              keyboardShouldPersistTaps="handled"
              ListFooterComponent={
                exerciseSearch.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.createCustomRow}
                    onPress={handleCreateCustomExercise}
                  >
                    <Ionicons name="add-circle" size={22} color={Colors.accent} />
                    <Text style={styles.createCustomText}>
                      Create "{exerciseSearch.trim()}"
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        </Pressable>
      </Modal>
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    height: 40,
  },
  sectionHeader: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  exerciseName: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  compBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  createCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  createCustomText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  summaryBtnText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});
