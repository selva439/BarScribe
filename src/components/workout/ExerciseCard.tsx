import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../ui/Card';
import { SetRow } from './SetRow';
import { type WorkoutSet } from '../../types';

interface Props {
  exerciseName: string;
  sets: WorkoutSet[];
  prSetIds?: Set<number>;
  onSetPress?: (set: WorkoutSet, index: number) => void;
  previousBest?: string; // e.g. "120kg × 5 (3 weeks ago)"
}

export function ExerciseCard({ exerciseName, sets, prSetIds, onSetPress, previousBest }: Props) {
  const [expanded, setExpanded] = useState(true);
  const workingSets = sets.filter(s => s.is_warmup === 0);
  const warmupSets = sets.filter(s => s.is_warmup === 1);
  const completedCount = workingSets.filter(s => s.actual_weight != null).length;

  return (
    <Card style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <View style={styles.progress}>
            <Text style={styles.progressText}>
              {completedCount}/{workingSets.length}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
        {previousBest && (
          <Text style={styles.previousBest}>Previous: {previousBest}</Text>
        )}
      </TouchableOpacity>

      {/* Sets */}
      {expanded && (
        <View style={styles.setsContainer}>
          {/* Header row */}
          <View style={styles.setsHeader}>
            <Text style={[styles.headerCell, { width: 32 }]}>#</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>PLANNED</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>LOGGED</Text>
            <View style={{ width: 48 }} />
          </View>

          {warmupSets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              setNumber={i + 1}
              onPress={onSetPress ? () => onSetPress(set, i) : undefined}
            />
          ))}

          {workingSets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              setNumber={i + 1}
              isPR={prSetIds?.has(set.id)}
              onPress={onSetPress ? () => onSetPress(set, sets.indexOf(set)) : undefined}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  previousBest: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  setsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerCell: {
    color: Colors.textDisabled,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
