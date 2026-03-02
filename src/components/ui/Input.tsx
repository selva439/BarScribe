import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, hint, error, suffix, containerStyle, style, ...props }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, error && styles.inputError, suffix && styles.inputWithSuffix, style]}
          placeholderTextColor={Colors.textDisabled}
          keyboardAppearance="dark"
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputWithSuffix: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  suffix: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: Colors.border,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    lineHeight: 48,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
