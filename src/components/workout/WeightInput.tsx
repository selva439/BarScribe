import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { type Units } from '../../types';

interface Props {
  value: number;
  onChange: (value: number) => void;
  units: Units;
  increment?: number;
  min?: number;
  max?: number;
}

export function WeightInput({ value, onChange, units, increment, min = 0, max = 999 }: Props) {
  const step = increment ?? (units === 'kg' ? 2.5 : 5);

  const adjust = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    Haptics.selectionAsync();
    onChange(next);
  };

  const handleTextChange = (text: string) => {
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => adjust(-step)}
        onLongPress={() => adjust(-step * 4)}
        activeOpacity={0.7}
      >
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={handleTextChange}
          keyboardType="decimal-pad"
          selectTextOnFocus
          keyboardAppearance="dark"
        />
        <Text style={styles.unit}>{units}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => adjust(+step)}
        onLongPress={() => adjust(+step * 4)}
        activeOpacity={0.7}
      >
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    width: 110,
    height: 60,
    textAlign: 'center',
  },
  unit: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
