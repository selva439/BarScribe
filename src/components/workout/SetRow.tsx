import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Badge } from '../ui/Badge';
import { type WorkoutSet } from '../../types';

interface Props {
  set: WorkoutSet;
  setNumber: number;
  isAmrap?: boolean;
  isPR?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function SetRow({ set, setNumber, isAmrap, isPR, onPress, disabled }: Props) {
  const isCompleted = set.actual_weight != null;
  const isWarmup = set.is_warmup === 1;

  return (
    <TouchableOpacity
      style={[styles.row, isCompleted && styles.rowCompleted, disabled && styles.rowDisabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.75}
    >
      {/* Set number / warmup label */}
      <View style={styles.setLabel}>
        {isWarmup ? (
          <Text style={styles.warmupLabel}>W{setNumber}</Text>
        ) : (
          <Text style={[styles.setNumber, isCompleted && styles.setNumberDone]}>
            {setNumber}
          </Text>
        )}
      </View>

      {/* Planned */}
      <View style={styles.planned}>
        <Text style={styles.weight}>
          {set.planned_weight != null ? `${set.planned_weight}` : '—'}
        </Text>
        <Text style={styles.reps}>
          × {set.planned_reps ?? '?'}{isAmrap ? '+' : ''}
        </Text>
      </View>

      {/* Actual */}
      <View style={styles.actual}>
        {isCompleted ? (
          <>
            <Text style={styles.actualWeight}>{set.actual_weight}</Text>
            <Text style={styles.actualReps}>× {set.actual_reps}</Text>
          </>
        ) : (
          <Text style={styles.pending}>Tap to log</Text>
        )}
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        {isPR && <Badge type="pr" />}
        {isAmrap && !isPR && <Badge type="amrap" />}
        {isCompleted && !isPR && (
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowCompleted: {
    opacity: 0.85,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  setLabel: {
    width: 32,
    alignItems: 'center',
  },
  setNumber: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  setNumberDone: {
    color: Colors.success,
  },
  warmupLabel: {
    color: Colors.textDisabled,
    fontSize: 13,
    fontWeight: '600',
  },
  planned: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  weight: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  reps: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  actual: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actualWeight: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  actualReps: {
    color: Colors.accent,
    fontSize: 15,
  },
  pending: {
    color: Colors.textDisabled,
    fontSize: 13,
  },
  badges: {
    width: 48,
    alignItems: 'flex-end',
  },
});
