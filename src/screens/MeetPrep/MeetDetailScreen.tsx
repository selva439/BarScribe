import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { type MeetPrepStackParamList } from '../../navigation/types';
import { getMeetWithAttempts, saveMeetAttempts, updateMeet } from '../../database/repositories/meetRepository';
import { type Meet, type MeetAttempt, type WarmupSet } from '../../types';
import {
  getMeetWarmups,
  getCountdownDays,
  formatCountdown,
  suggestSecondAttempt,
  suggestThirdAttempt,
  projectTotal,
} from '../../utils/meetCalc';
import { wilksScore, dotsScore } from '../../utils/calculators';
import { useSettings } from '../../contexts/SettingsContext';
import { EXERCISE_IDS } from '../../constants/programs';

type Props = NativeStackScreenProps<MeetPrepStackParamList, 'MeetDetail'>;

const LIFTS = [
  { id: EXERCISE_IDS.SQUAT, name: 'Squat' },
  { id: EXERCISE_IDS.BENCH, name: 'Bench' },
  { id: EXERCISE_IDS.DEADLIFT, name: 'Deadlift' },
];

export default function MeetDetailScreen({ route, navigation }: Props) {
  const { meetId } = route.params;
  const db = useSQLiteContext();
  const { settings } = useSettings();

  const [meet, setMeet] = useState<Meet | null>(null);
  const [attempts, setAttempts] = useState<Record<number, [string, string, string]>>({
    [EXERCISE_IDS.SQUAT]: ['', '', ''],
    [EXERCISE_IDS.BENCH]: ['', '', ''],
    [EXERCISE_IDS.DEADLIFT]: ['', '', ''],
  });
  const [selectedLift, setSelectedLift] = useState<number>(EXERCISE_IDS.SQUAT);

  useFocusEffect(useCallback(() => {
    getMeetWithAttempts(db, meetId).then(({ meet: m, attempts: a }) => {
      setMeet(m);
      if (a.length > 0) {
        const atts = { ...attempts };
        for (const attempt of a) {
          if (!atts[attempt.exercise_id]) atts[attempt.exercise_id] = ['', '', ''];
          atts[attempt.exercise_id][attempt.attempt_number - 1] = String(attempt.planned_weight);
        }
        setAttempts(atts);
      }
    }).catch(console.warn);
  }, [db, meetId]));

  const handleOpenerChange = (liftId: number, value: string) => {
    const current = attempts[liftId] ?? ['', '', ''];
    const opener = parseFloat(value);
    const second = opener ? suggestSecondAttempt(opener) : null;
    const third = second ? suggestThirdAttempt(second) : null;
    setAttempts(prev => ({
      ...prev,
      [liftId]: [
        value,
        second ? String(second) : current[1],
        third ? String(third) : current[2],
      ],
    }));
  };

  const handleSave = async () => {
    const meetAttempts: Omit<MeetAttempt, 'id'>[] = [];
    for (const liftId of Object.keys(attempts).map(Number)) {
      const liftAttempts = attempts[liftId];
      for (let i = 0; i < 3; i++) {
        const w = parseFloat(liftAttempts[i]);
        if (!isNaN(w)) {
          meetAttempts.push({
            meet_id: meetId,
            exercise_id: liftId,
            attempt_number: (i + 1) as 1 | 2 | 3,
            planned_weight: w,
            actual_weight: null,
            is_good_lift: null,
          });
        }
      }
    }
    await saveMeetAttempts(db, meetId, meetAttempts);
    Alert.alert('Saved', 'Meet attempts saved.');
  };

  const countdownDays = meet ? getCountdownDays(meet.date) : 0;
  const openers = LIFTS.map(l => parseFloat(attempts[l.id]?.[0] ?? '0')).filter(Boolean);
  const projectedTotal = openers.length === 3 ? projectTotal(openers[0], openers[1], openers[2]) : null;

  const warmups = parseFloat(attempts[selectedLift]?.[0] ?? '0')
    ? getMeetWarmups(parseFloat(attempts[selectedLift][0]))
    : [];

  if (!meet) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Countdown */}
        <Card style={styles.countdown}>
          <Text style={styles.countdownLabel}>MEET DATE</Text>
          <Text style={styles.countdownDays}>{formatCountdown(countdownDays)}</Text>
          <Text style={styles.countdownDate}>{meet.name}</Text>
        </Card>

        {/* Lift tabs */}
        <View style={styles.liftTabs}>
          {LIFTS.map(lift => (
            <TouchableOpacity
              key={lift.id}
              style={[styles.liftTab, selectedLift === lift.id && styles.liftTabActive]}
              onPress={() => setSelectedLift(lift.id)}
            >
              <Text style={[styles.liftTabText, selectedLift === lift.id && styles.liftTabTextActive]}>
                {lift.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attempt inputs */}
        {LIFTS.filter(l => l.id === selectedLift).map(lift => (
          <Card bordered key={lift.id} style={styles.attemptsCard}>
            <Text style={styles.cardTitle}>{lift.name} Attempts</Text>
            {['Opener', '2nd Attempt', '3rd Attempt'].map((label, i) => (
              <View key={label} style={styles.attemptRow}>
                <Text style={styles.attemptLabel}>{label}</Text>
                <Input
                  value={attempts[lift.id]?.[i] ?? ''}
                  onChangeText={v => {
                    if (i === 0) {
                      handleOpenerChange(lift.id, v);
                    } else {
                      const current = [...(attempts[lift.id] ?? ['', '', ''])];
                      current[i] = v;
                      setAttempts(prev => ({ ...prev, [lift.id]: current as [string, string, string] }));
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder={i === 0 ? 'Opener' : 'Auto-calculated'}
                  suffix={settings.units}
                  containerStyle={styles.attemptInput}
                />
              </View>
            ))}
          </Card>
        ))}

        {/* Warmup ladder */}
        {warmups.length > 0 && (
          <Card bordered style={styles.warmupsCard}>
            <Text style={styles.cardTitle}>
              {LIFTS.find(l => l.id === selectedLift)?.name} Warmup Ladder
            </Text>
            <View style={styles.warmupHeader}>
              <Text style={styles.warmupHeaderCell}>%</Text>
              <Text style={styles.warmupHeaderCell}>Weight</Text>
              <Text style={styles.warmupHeaderCell}>Reps</Text>
            </View>
            {warmups.map(w => (
              <View key={w.pct} style={styles.warmupRow}>
                <Text style={styles.warmupCell}>{w.pct}%</Text>
                <Text style={styles.warmupCellBold}>{w.weight}{settings.units}</Text>
                <Text style={styles.warmupCell}>× {w.reps}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Projected total & scores */}
        {projectedTotal && meet.bodyweight && (
          <Card style={styles.projectedCard}>
            <Text style={styles.projectedLabel}>PROJECTED TOTAL</Text>
            <Text style={styles.projectedTotal}>{projectedTotal}{settings.units}</Text>
            <View style={styles.scoresRow}>
              <View style={styles.score}>
                <Text style={styles.scoreLabel}>Wilks</Text>
                <Text style={styles.scoreValue}>
                  {wilksScore(projectedTotal, meet.bodyweight, settings.sex).toFixed(1)}
                </Text>
              </View>
              <View style={styles.score}>
                <Text style={styles.scoreLabel}>DOTS</Text>
                <Text style={styles.scoreValue}>
                  {dotsScore(projectedTotal, meet.bodyweight, settings.sex).toFixed(1)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Button label="Save Attempts" onPress={handleSave} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  countdown: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  countdownLabel: { color: Colors.textDisabled, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  countdownDays: { color: Colors.accent, fontSize: 36, fontWeight: '900' },
  countdownDate: { color: Colors.textSecondary, fontSize: 14 },
  liftTabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: 4, gap: 4 },
  liftTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  liftTabActive: { backgroundColor: Colors.accent },
  liftTabText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  liftTabTextActive: { color: '#FFF', fontWeight: '700' },
  attemptsCard: { gap: 8 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  attemptRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  attemptLabel: { color: Colors.textSecondary, fontSize: 14, width: 90 },
  attemptInput: { flex: 1, marginBottom: 0 },
  warmupsCard: { gap: 0 },
  warmupHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderColor: Colors.border },
  warmupHeaderCell: { flex: 1, color: Colors.textDisabled, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  warmupRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderColor: Colors.border },
  warmupCell: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  warmupCellBold: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '700' },
  projectedCard: { alignItems: 'center', gap: 8 },
  projectedLabel: { color: Colors.textDisabled, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  projectedTotal: { color: Colors.text, fontSize: 40, fontWeight: '900' },
  scoresRow: { flexDirection: 'row', gap: 32 },
  score: { alignItems: 'center' },
  scoreLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  scoreValue: { color: Colors.accent, fontSize: 22, fontWeight: '800' },
});
