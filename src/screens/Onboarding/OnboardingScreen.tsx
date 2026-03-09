import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../contexts/SettingsContext';
import { type RootStackParamList } from '../../navigation/types';
import { type Units } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { updateSettings } = useSettings();
  const [selectedUnit, setSelectedUnit] = useState<Units>('kg');

  const handleContinue = async () => {
    await updateSettings({ units: selectedUnit, isInitialized: true });
    navigation.replace('Tabs', {} as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.hero}>
        <Text style={styles.logo}>BAR</Text>
        <Text style={styles.logoAccent}>SCRIBE</Text>
        <Text style={styles.tagline}>The powerlifter's training companion</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Which units do you use?</Text>

        <View style={styles.options}>
          {(['kg', 'lbs'] as Units[]).map(unit => (
            <TouchableOpacity
              key={unit}
              style={[styles.option, selectedUnit === unit && styles.optionSelected]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedUnit(unit);
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionLabel, selectedUnit === unit && styles.optionLabelSelected]}>
                {unit.toUpperCase()}
              </Text>
              <Text style={[styles.optionSub, selectedUnit === unit && styles.optionSubSelected]}>
                {unit === 'kg' ? 'Kilograms' : 'Pounds'}
              </Text>
              {selectedUnit === unit && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.accent}
                  style={styles.checkmark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.features}>
          {[
            { icon: 'barbell-outline' as const, text: 'Log every set with one tap' },
            { icon: 'stats-chart-outline' as const, text: 'Track PRs automatically' },
            { icon: 'calendar-outline' as const, text: 'Built-in 5/3/1, Smolov Jr, Texas Method' },
            { icon: 'trophy-outline' as const, text: 'Meet prep & attempt calculator' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.feature}>
              <Ionicons name={icon} size={20} color={Colors.accent} />
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Get Started →"
          onPress={handleContinue}
          fullWidth
          style={styles.cta}
        />
        <Text style={styles.disclaimer}>
          Free to use. Pro features unlock with subscription.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
  },
  logo: {
    color: Colors.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
  },
  logoAccent: {
    color: Colors.accent,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
    marginTop: -12,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  question: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  option: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  optionLabel: {
    color: Colors.textSecondary,
    fontSize: 24,
    fontWeight: '800',
  },
  optionLabelSelected: {
    color: Colors.accent,
  },
  optionSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  optionSubSelected: {
    color: Colors.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  features: {
    gap: 12,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  cta: {
    marginBottom: 12,
  },
  disclaimer: {
    color: Colors.textDisabled,
    fontSize: 12,
    textAlign: 'center',
  },
});
