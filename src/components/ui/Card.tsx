import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
  elevated?: boolean;
}

export function Card({ children, style, bordered = false, elevated = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
