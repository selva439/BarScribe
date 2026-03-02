import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Button } from './Button';

interface Props {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'barbell-outline', title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={Colors.textDisabled} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    minWidth: 160,
  },
});
