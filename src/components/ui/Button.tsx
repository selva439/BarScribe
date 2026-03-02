import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: Colors.accent },
    text: { color: '#FFFFFF', fontWeight: '700' },
  },
  secondary: {
    container: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
    text: { color: Colors.text, fontWeight: '600' },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Colors.accent, fontWeight: '600' },
  },
  danger: {
    container: { backgroundColor: Colors.error },
    text: { color: '#FFFFFF', fontWeight: '700' },
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: Props) {
  const variantStyle = VARIANT_STYLES[variant];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text.color as string} />
      ) : (
        <Text style={[styles.label, variantStyle.text, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
  },
});
