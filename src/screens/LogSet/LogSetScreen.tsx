import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WeightInput } from '../../components/workout/WeightInput';
import { RPEPicker } from '../../components/workout/RPEPicker';
import { RestTimer } from '../../components/workout/RestTimer';
import { Badge } from '../../components/ui/Badge';
import { type RootStackParamList } from '../../navigation/types';
import { getSetById, logSet, getLastPerformance } from '../../database/repositories/setRepository';
import { useSettings } from '../../contexts/SettingsContext';
import { useActiveWorkout } from '../../contexts/ActiveWorkoutContext';
import { type WorkoutSet } from '../../types';
import { REST_TIMER_DEFAULTS } from '../../constants/programs';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'LogSet'>;

export default function LogSetScreen({ route, navigation }: Props) {
  const { workoutId, exerciseId, exerciseName, setIds, currentSetIndex: initialIndex } = route.params;
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const { startRestTimer, restTimerActive } = useActiveWorkout();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentSet, setCurrentSet] = useState<WorkoutSet | null>(null);
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(5);
  const [rpe, setRpe] = useState<number | null>(null);
  const [previousSets, setPreviousSets] = useState<WorkoutSet[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [justLoggedPR, setJustLoggedPR] = useState(false);

  const currentSetId = setIds[currentIndex];
  const totalSets = setIds.length;
  const isLastSet = currentIndex === totalSets - 1;

  const loadSet = useCallback(async () => {
    const set = await getSetById(db, currentSetId);
    if (set) {
      setCurrentSet(set);
      if (set.planned_weight) setWeight(set.planned_weight);
      if (set.planned_reps) setReps(set.planned_reps);
    }
    const prev = await getLastPerformance(db, exerciseId, 3);
    setPreviousSets(prev);
  }, [db, currentSetId, exerciseId]);

  useEffect(() => { loadSet(); }, [loadSet]);

  const handleLog = async () => {
    if (!currentSet) return;
    setIsLogging(true);
    try {
      const { isNewPR } = await logSet(db, currentSet.id, weight, reps, rpe);

      if (isNewPR) {
        setJustLoggedPR(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Start rest timer (skip for warmups)
      if (currentSet.is_warmup === 0) {
        startRestTimer(settings.restTimerDuration, exerciseName);
      }

      if (isLastSet) {
        navigation.goBack();
      } else {
        setTimeout(() => {
          setCurrentIndex(i => i + 1);
          setJustLoggedPR(false);
        }, 300);
      }
    } finally {
      setIsLogging(false);
    }
  };

  const handleSkip = () => {
    if (isLastSet) {
      navigation.goBack();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const isWarmup = currentSet?.is_warmup === 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Set indicator */}
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <View style={styles.setIndicator}>
            {setIds.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < currentIndex && styles.dotDone,
                  i === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.setLabel}>
            {isWarmup ? 'Warmup ' : ''}{currentIndex + 1} of {totalSets}
          </Text>
        </View>

        {/* PR flash */}
        {justLoggedPR && (
          <View style={styles.prBanner}>
            <Text style={styles.prBannerText}>🏆 New Personal Record!</Text>
          </View>
        )}

        {/* Rest timer */}
        {restTimerActive && <RestTimer />}

        {/* Planned */}
        {currentSet?.planned_weight != null && (
          <Card style={styles.planned}>
            <Text style={styles.plannedLabel}>PLANNED</Text>
            <Text style={styles.plannedValue}>
              {currentSet.planned_weight}{settings.units} × {currentSet.planned_reps}
              {currentSet.planned_reps === 1 ? '' : ''}
            </Text>
          </Card>
        )}

        {/* Weight input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>WEIGHT</Text>
          <WeightInput
            value={weight}
            onChange={setWeight}
            units={settings.units}
          />
        </View>

        {/* Reps */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>REPS</Text>
          <View style={styles.repsRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(r => (
              <Button
                key={r}
                label={String(r)}
                onPress={() => setReps(r)}
                variant={reps === r ? 'primary' : 'secondary'}
                style={styles.repBtn}
                textStyle={{ fontSize: 15 }}
              />
            ))}
          </View>
        </View>

        {/* RPE */}
        {!isWarmup && <RPEPicker value={rpe} onChange={setRpe} />}

        {/* Previous performance */}
        {previousSets.length > 0 && (
          <View style={styles.previousSection}>
            <Text style={styles.previousLabel}>PREVIOUS</Text>
            {previousSets.slice(0, 3).map((prev, i) => (
              <View key={prev.id} style={styles.prevRow}>
                <Text style={styles.prevText}>
                  {prev.actual_weight}{settings.units} × {prev.actual_reps}
                  {prev.rpe ? ` @${prev.rpe}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Log button */}
        <View style={styles.actions}>
          <Button
            label={isLastSet ? 'Log Set & Finish' : `Log Set →`}
            onPress={handleLog}
            loading={isLogging}
            fullWidth
            style={styles.logBtn}
          />
          <Button
            label="Skip"
            onPress={handleSkip}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 8 },
  exerciseName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  setIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotDone: { backgroundColor: Colors.textMuted },
  dotActive: { backgroundColor: Colors.accent, width: 20 },
  setLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  prBanner: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  prBannerText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  planned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plannedLabel: {
    color: Colors.textDisabled,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  plannedValue: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  inputSection: { gap: 10 },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  repsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repBtn: {
    width: 56,
    height: 44,
    paddingHorizontal: 0,
  },
  previousSection: { gap: 6 },
  previousLabel: {
    color: Colors.textDisabled,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  prevRow: {
    paddingVertical: 4,
  },
  prevText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  actions: { gap: 8, marginTop: 8 },
  logBtn: {},
});
