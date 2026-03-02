import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

type BadgeType = 'pr' | 'pro' | 'amrap' | 'deload' | 'custom';

interface Props {
  type?: BadgeType;
  label?: string;
  style?: ViewStyle;
}

const BADGE_CONFIG: Record<BadgeType, { bg: string; color: string; defaultLabel: string }> = {
  pr: { bg: Colors.accent, color: '#FFF', defaultLabel: 'PR' },
  pro: { bg: Colors.pro, color: '#000', defaultLabel: 'PRO' },
  amrap: { bg: Colors.info, color: '#FFF', defaultLabel: 'AMRAP' },
  deload: { bg: Colors.textMuted, color: '#FFF', defaultLabel: 'DELOAD' },
  custom: { bg: Colors.surfaceElevated, color: Colors.textSecondary, defaultLabel: '' },
};

export function Badge({ type = 'custom', label, style }: Props) {
  const config = BADGE_CONFIG[type];
  const text = label ?? config.defaultLabel;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.label, { color: config.color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
