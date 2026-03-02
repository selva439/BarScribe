import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const RPE_VALUES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

interface Props {
  value: number | null;
  onChange: (rpe: number | null) => void;
}

export function RPEPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>RPE (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {RPE_VALUES.map(rpe => {
          const selected = value === rpe;
          return (
            <TouchableOpacity
              key={rpe}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(selected ? null : rpe)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {rpe}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFF',
  },
});
