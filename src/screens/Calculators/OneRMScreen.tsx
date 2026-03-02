import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { WeightInput } from '../../components/workout/WeightInput';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../contexts/SettingsContext';
import { epley1RM, generate1RMTable, trainingMaxFrom1RM } from '../../utils/calculators';
import { getActiveUserProgram, updateUserProgramTMs } from '../../database/repositories/programRepository';

export default function OneRMScreen() {
  const { settings } = useSettings();
  const db = useSQLiteContext();
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);

  const estimated1RM = epley1RM(weight, reps);
  const table = generate1RMTable(weight, reps);
  const tm = trainingMaxFrom1RM(estimated1RM, settings.units);

  const handleSaveAsTM = async () => {
    const program = await getActiveUserProgram(db);
    if (!program) {
      Alert.alert('No active program', 'Start a program first to save training maxes.');
      return;
    }

    Alert.alert(
      'Save as Training Max',
      `Save ${tm}${settings.units} as your training max for which lift?`,
      [
        { text: 'Squat', onPress: () => updateUserProgramTMs(db, program.id, { squat: tm }) },
        { text: 'Bench', onPress: () => updateUserProgramTMs(db, program.id, { bench: tm }) },
        { text: 'Deadlift', onPress: () => updateUserProgramTMs(db, program.id, { deadlift: tm }) },
        { text: 'OHP', onPress: () => updateUserProgramTMs(db, program.id, { ohp: tm }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>1RM Calculator</Text>
        <Text style={styles.subtitle}>Epley formula: W × (1 + R/30)</Text>

        <Card bordered style={styles.inputs}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>WEIGHT</Text>
            <WeightInput value={weight} onChange={setWeight} units={settings.units} />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>REPS</Text>
            <View style={styles.repsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.repChip, reps === r && styles.repChipActive]}
                  onPress={() => setReps(r)}
                >
                  <Text style={[styles.repChipText, reps === r && styles.repChipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Result */}
        <Card style={styles.result}>
          <Text style={styles.resultLabel}>ESTIMATED 1RM</Text>
          <Text style={styles.resultValue}>
            {Math.round(estimated1RM * 10) / 10}
            <Text style={styles.resultUnit}> {settings.units}</Text>
          </Text>
          <Text style={styles.tmLabel}>
            Training Max (90%): <Text style={styles.tmValue}>{tm} {settings.units}</Text>
          </Text>
        </Card>

        <Button label="Save as Training Max" onPress={handleSaveAsTM} variant="secondary" fullWidth />

        {/* 1RM table */}
        <Card bordered style={styles.table}>
          <Text style={styles.tableTitle}>Rep Max Table</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>REPS</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>EST. MAX</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>WEIGHT</Text>
          </View>
          {table.map(row => (
            <View key={row.reps} style={[styles.tableRow, row.reps === reps && styles.tableRowHighlight]}>
              <Text style={[styles.tableCell, row.reps === reps && styles.tableCellHighlight]}>
                {row.reps}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }, row.reps === reps && styles.tableCellHighlight]}>
                {Math.round(row.estimated1RM * 10) / 10} {settings.units}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                {row.reps === reps ? '←' : `${Math.round(row.estimated1RM * 0.9 * 10) / 10}`}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: -8 },
  inputs: { gap: 20 },
  inputRow: { gap: 10 },
  inputLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  repsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  repChip: {
    width: 48, height: 40, borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  repChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  repChipText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
  repChipTextActive: { color: '#FFF' },
  result: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  resultLabel: { color: Colors.textDisabled, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  resultValue: { color: Colors.text, fontSize: 52, fontWeight: '800' },
  resultUnit: { color: Colors.textMuted, fontSize: 24 },
  tmLabel: { color: Colors.textMuted, fontSize: 14 },
  tmValue: { color: Colors.accent, fontWeight: '700' },
  table: { gap: 0 },
  tableTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: Colors.border },
  tableHeaderCell: { flex: 1, color: Colors.textDisabled, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderColor: Colors.border },
  tableRowHighlight: { backgroundColor: Colors.accentMuted, marginHorizontal: -16, paddingHorizontal: 16 },
  tableCell: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  tableCellHighlight: { color: Colors.accent, fontWeight: '700' },
});
