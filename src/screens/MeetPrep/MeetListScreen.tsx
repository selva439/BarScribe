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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProGate } from '../../components/ProGate';
import { type MeetPrepStackParamList } from '../../navigation/types';
import { getMeets, createMeet } from '../../database/repositories/meetRepository';
import { type Meet } from '../../types';
import { getCountdownDays, formatCountdown } from '../../utils/meetCalc';
import { formatDisplayDate } from '../../utils/dateHelpers';

type Props = NativeStackScreenProps<MeetPrepStackParamList, 'MeetList'>;

export default function MeetListScreen({ navigation }: Props) {
  return (
    <ProGate feature="Meet Prep">
      <MeetListContent navigation={navigation} />
    </ProGate>
  );
}

function MeetListContent({ navigation }: { navigation: Props['navigation'] }) {
  const db = useSQLiteContext();
  const [meets, setMeets] = useState<Meet[]>([]);

  useFocusEffect(useCallback(() => {
    getMeets(db).then(setMeets).catch(console.warn);
  }, [db]));

  const handleNewMeet = () => {
    Alert.prompt(
      'New Meet',
      'Enter meet name:',
      async (name) => {
        if (!name) return;
        const today = new Date();
        // Default to 12 weeks out
        const meetDate = new Date(today);
        meetDate.setDate(today.getDate() + 84);
        const dateStr = `${meetDate.getFullYear()}-${String(meetDate.getMonth() + 1).padStart(2, '0')}-${String(meetDate.getDate()).padStart(2, '0')}`;

        const id = await createMeet(db, { name, date: dateStr });
        navigation.navigate('MeetDetail', { meetId: id });
      },
      'plain-text',
      '',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {meets.length === 0 ? (
          <EmptyState
            icon="trophy-outline"
            title="No meets yet"
            message="Add your next competition to start planning attempts and warmups."
            actionLabel="+ Add Meet"
            onAction={handleNewMeet}
          />
        ) : (
          <>
            {meets.map(meet => {
              const days = getCountdownDays(meet.date);
              const isPast = days < 0;
              return (
                <TouchableOpacity
                  key={meet.id}
                  onPress={() => navigation.navigate('MeetDetail', { meetId: meet.id })}
                  activeOpacity={0.85}
                >
                  <Card bordered style={styles.meetCard}>
                    <View style={styles.meetHeader}>
                      <Text style={styles.meetName}>{meet.name}</Text>
                      {!isPast && (
                        <View style={styles.countdown}>
                          <Text style={styles.countdownText}>{formatCountdown(days)}</Text>
                        </View>
                      )}
                      {isPast && (
                        <Text style={styles.pastText}>Completed</Text>
                      )}
                    </View>
                    <Text style={styles.meetDate}>{formatDisplayDate(meet.date)}</Text>
                    {meet.bodyweight && (
                      <Text style={styles.meetBW}>BW: {meet.bodyweight}kg</Text>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={styles.chevron} />
                  </Card>
                </TouchableOpacity>
              );
            })}
            <Button label="+ Add New Meet" onPress={handleNewMeet} variant="secondary" fullWidth />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  meetCard: { gap: 4, position: 'relative' },
  meetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meetName: { color: Colors.text, fontSize: 18, fontWeight: '700', flex: 1 },
  countdown: { backgroundColor: Colors.accentMuted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  countdownText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  pastText: { color: Colors.textMuted, fontSize: 13 },
  meetDate: { color: Colors.textSecondary, fontSize: 14 },
  meetBW: { color: Colors.textMuted, fontSize: 13 },
  chevron: { position: 'absolute', right: 16, top: 20 },
});
