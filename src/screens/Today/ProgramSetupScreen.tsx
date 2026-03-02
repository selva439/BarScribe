import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { type TodayStackParamList } from '../../navigation/types';
import { createUserProgram } from '../../database/repositories/programRepository';
import { useSettings } from '../../contexts/SettingsContext';
import { trainingMaxFrom1RM } from '../../utils/calculators';
import { toISODate, nextMonday } from '../../utils/dateHelpers';
import { PROGRAM_META } from '../../constants/programs';

type Props = NativeStackScreenProps<TodayStackParamList, 'ProgramSetup'>;

export default function ProgramSetupScreen({ route, navigation }: Props) {
  const { programId } = route.params;
  const db = useSQLiteContext();
  const { settings } = useSettings();

  const [squat1RM, setSquat1RM] = useState('');
  const [bench1RM, setBench1RM] = useState('');
  const [deadlift1RM, setDeadlift1RM] = useState('');
  const [ohp1RM, setOhp1RM] = useState('');
  const [loading, setLoading] = useState(false);

  const programMeta = PROGRAM_META[programId as keyof typeof PROGRAM_META];

  const handleStart = async () => {
    const s = parseFloat(squat1RM);
    const b = parseFloat(bench1RM);
    const d = parseFloat(deadlift1RM);
    const o = parseFloat(ohp1RM);

    if (!s || !b || !d) {
      Alert.alert('Missing values', 'Please enter your squat, bench, and deadlift 1RMs.');
      return;
    }

    setLoading(true);
    try {
      const startDate = toISODate(nextMonday());
      await createUserProgram(db, {
        program_id: programId,
        start_date: startDate,
        tm_squat: trainingMaxFrom1RM(s, settings.units),
        tm_bench: trainingMaxFrom1RM(b, settings.units),
        tm_deadlift: trainingMaxFrom1RM(d, settings.units),
        tm_ohp: o ? trainingMaxFrom1RM(o, settings.units) : undefined,
      });

      Alert.alert(
        'Program Started!',
        `${programMeta?.name ?? 'Program'} starts ${toISODate(nextMonday())}. Training maxes set.`,
        [{ text: 'Let\'s go!', onPress: () => navigation.popToTop() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{programMeta?.name}</Text>
        <Text style={styles.subtitle}>
          Enter your current 1RM for each lift. Training maxes will be calculated at 90%.
        </Text>

        <Card bordered style={styles.card}>
          <Text style={styles.cardTitle}>Enter Your 1RMs ({settings.units})</Text>
          <Input
            label="Squat 1RM"
            value={squat1RM}
            onChangeText={setSquat1RM}
            keyboardType="decimal-pad"
            placeholder="e.g. 140"
            suffix={settings.units}
          />
          <Input
            label="Bench Press 1RM"
            value={bench1RM}
            onChangeText={setBench1RM}
            keyboardType="decimal-pad"
            placeholder="e.g. 100"
            suffix={settings.units}
          />
          <Input
            label="Deadlift 1RM"
            value={deadlift1RM}
            onChangeText={setDeadlift1RM}
            keyboardType="decimal-pad"
            placeholder="e.g. 180"
            suffix={settings.units}
          />
          <Input
            label="Overhead Press 1RM"
            value={ohp1RM}
            onChangeText={setOhp1RM}
            keyboardType="decimal-pad"
            placeholder="e.g. 70 (optional)"
            suffix={settings.units}
          />
        </Card>

        {squat1RM && bench1RM && deadlift1RM && (
          <Card style={styles.tmPreview}>
            <Text style={styles.tmTitle}>Training Maxes (90%)</Text>
            {(
              [
                ['Squat', squat1RM],
                ['Bench', bench1RM],
                ['Deadlift', deadlift1RM],
                ...(ohp1RM ? [['OHP', ohp1RM]] : []),
              ] as [string, string][]
            ).map(([name, val]) => {
              const tm = trainingMaxFrom1RM(parseFloat(val), settings.units);
              return (
                <View key={name} style={styles.tmRow}>
                  <Text style={styles.tmLabel}>{name}</Text>
                  <Text style={styles.tmValue}>{tm} {settings.units}</Text>
                </View>
              );
            })}
          </Card>
        )}

        <Button
          label="Start Program"
          onPress={handleStart}
          loading={loading}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: Colors.textMuted, fontSize: 14, lineHeight: 20 },
  card: { gap: 0 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  tmPreview: { gap: 8 },
  tmTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  tmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  tmLabel: { color: Colors.textSecondary, fontSize: 15 },
  tmValue: { color: Colors.accent, fontSize: 16, fontWeight: '700' },
});
