import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProGate } from '../../components/ProGate';
import { PROGRAM_META, PROGRAM_IDS } from '../../constants/programs';
import { type TodayStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TodayStackParamList, 'ProgramSelect'>;

export default function ProgramSelectScreen({ navigation }: Props) {
  return (
    <ProGate feature="Training Programs">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.subtitle}>
            Select a program and set your training maxes to get started.
          </Text>

          {Object.entries(PROGRAM_META).map(([id, meta]) => (
            <TouchableOpacity
              key={id}
              onPress={() => navigation.navigate('ProgramSetup', { programId: Number(id) })}
              activeOpacity={0.85}
            >
              <Card style={styles.card} bordered>
                <View style={styles.cardHeader}>
                  <Text style={styles.programName}>{meta.name}</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>{meta.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.subtitle_text}>{meta.subtitle}</Text>
                <Text style={styles.description}>{meta.description}</Text>
                <View style={styles.meta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{meta.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="barbell-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{meta.focus.join(', ')}</Text>
                  </View>
                </View>
                <View style={styles.selectRow}>
                  <Text style={styles.selectText}>Select Program</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ProGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 16 },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 4 },
  card: { gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  programName: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  difficultyBadge: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  subtitle_text: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  description: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  meta: { gap: 6, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: Colors.textMuted, fontSize: 13 },
  selectRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  selectText: { color: Colors.accent, fontWeight: '700', fontSize: 14 },
});
