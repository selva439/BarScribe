import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { PRProgressChart } from '../../components/charts/PRProgressChart';
import { ProGate } from '../../components/ProGate';
import { type ProfileStackParamList } from '../../navigation/types';
import {
  getBestPRForExercise,
  getPRHistory,
  getPRsForExercise,
} from '../../database/repositories/prRepository';
import { type PersonalRecord } from '../../types';
import { formatDisplayDate } from '../../utils/dateHelpers';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { EXERCISE_IDS } from '../../constants/programs';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PRsDashboard'>;

const LIFT_TABS = [
  { id: EXERCISE_IDS.SQUAT, name: 'Squat' },
  { id: EXERCISE_IDS.BENCH, name: 'Bench' },
  { id: EXERCISE_IDS.DEADLIFT, name: 'Deadlift' },
  { id: EXERCISE_IDS.OHP, name: 'OHP' },
];

export default function PRsDashboardScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const { isPro } = useSubscription();
  const [selectedLift, setSelectedLift] = useState<number>(EXERCISE_IDS.SQUAT);
  const [bestPR, setBestPR] = useState<PersonalRecord | null>(null);
  const [history, setHistory] = useState<PersonalRecord[]>([]);
  const [topPRs, setTopPRs] = useState<PersonalRecord[]>([]);

  const load = useCallback(async () => {
    const [best, hist, top] = await Promise.all([
      getBestPRForExercise(db, selectedLift),
      isPro ? getPRHistory(db, selectedLift, 50) : Promise.resolve([]),
      getPRsForExercise(db, selectedLift),
    ]);
    setBestPR(best);
    setHistory(hist);
    setTopPRs(top.slice(0, 5));
  }, [db, selectedLift, isPro]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const liftName = LIFT_TABS.find(t => t.id === selectedLift)?.name ?? 'Squat';

  return (
    <SafeAreaView style={styles.container}>
      {/* Lift selector tabs */}
      <View style={styles.tabs}>
        {LIFT_TABS.map(lift => (
          <TouchableOpacity
            key={lift.id}
            style={[styles.tab, selectedLift === lift.id && styles.tabActive]}
            onPress={() => setSelectedLift(lift.id)}
          >
            <Text style={[styles.tabText, selectedLift === lift.id && styles.tabTextActive]}>
              {lift.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Best PR */}
        {bestPR ? (
          <Card style={styles.prHero}>
            <Text style={styles.prLabel}>ALL-TIME BEST</Text>
            <Text style={styles.prWeight}>
              {bestPR.weight}
              <Text style={styles.prUnit}> {settings.units}</Text>
            </Text>
            <Text style={styles.prReps}>
              × {bestPR.reps} {bestPR.reps === 1 ? 'rep' : 'reps'}
              {'   ·   '}
              e1RM: {Math.round(bestPR.estimated_1rm)}{settings.units}
            </Text>
            <Text style={styles.prDate}>{formatDisplayDate(bestPR.date)}</Text>
          </Card>
        ) : (
          <Card style={styles.prHero}>
            <Ionicons name="barbell-outline" size={32} color={Colors.textDisabled} />
            <Text style={styles.noPR}>No {liftName} PRs yet</Text>
            <Text style={styles.noPRSub}>Log your first set to start tracking</Text>
          </Card>
        )}

        {/* Progress chart — Pro only */}
        {isPro ? (
          <Card bordered style={styles.chartCard}>
            <PRProgressChart records={history} exerciseName={liftName} />
          </Card>
        ) : (
          <ProGate feature="Progress Charts" overlay><View /></ProGate>
        )}

        {/* Top 5 PRs */}
        {topPRs.length > 0 && (
          <Card bordered style={styles.topPRs}>
            <Text style={styles.sectionTitle}>Top PRs</Text>
            {topPRs.map((pr, i) => (
              <View key={pr.id} style={styles.prRow}>
                <Text style={styles.prRank}>#{i + 1}</Text>
                <View style={styles.prRowMain}>
                  <Text style={styles.prRowWeight}>{pr.weight}{settings.units} × {pr.reps}</Text>
                  <Text style={styles.prRowDate}>{formatDisplayDate(pr.date)}</Text>
                </View>
                <Text style={styles.prRowE1RM}>{Math.round(pr.estimated_1rm)}kg e1RM</Text>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.bottomLinks}>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={() => navigation.navigate('TrainingGuide')}
          >
            <Ionicons name="book-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.settingsText}>Training Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: Colors.accent, fontWeight: '700' },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  prHero: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  prLabel: { color: Colors.textDisabled, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  prWeight: { color: Colors.accent, fontSize: 64, fontWeight: '900', lineHeight: 70 },
  prUnit: { color: Colors.textMuted, fontSize: 28 },
  prReps: { color: Colors.textSecondary, fontSize: 16 },
  prDate: { color: Colors.textMuted, fontSize: 13 },
  noPR: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  noPRSub: { color: Colors.textMuted, fontSize: 13 },
  chartCard: { padding: 16 },
  topPRs: { gap: 0 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  prRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: Colors.border, gap: 12 },
  prRank: { color: Colors.textDisabled, fontSize: 13, fontWeight: '700', width: 24 },
  prRowMain: { flex: 1 },
  prRowWeight: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  prRowDate: { color: Colors.textMuted, fontSize: 12 },
  prRowE1RM: { color: Colors.textSecondary, fontSize: 13 },
  bottomLinks: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 8 },
  settingsText: { color: Colors.textMuted, fontSize: 14 },
});
