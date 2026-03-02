import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { formatTimer } from '../../utils/dateHelpers';
import { useActiveWorkout } from '../../contexts/ActiveWorkoutContext';

export function RestTimer() {
  const { restTimerActive, restTimerSeconds, skipRestTimer } = useActiveWorkout();

  if (!restTimerActive) return null;

  const progress = Math.max(0, Math.min(1, restTimerSeconds / 180));
  const color = restTimerSeconds <= 10 ? Colors.accent : Colors.success;

  return (
    <View style={styles.container}>
      <View style={styles.timerRow}>
        <View style={styles.timerCircle}>
          <Text style={[styles.timerText, { color }]}>
            {formatTimer(restTimerSeconds)}
          </Text>
          <Text style={styles.timerLabel}>REST</Text>
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={skipRestTimer}>
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerCircle: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -4,
  },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
