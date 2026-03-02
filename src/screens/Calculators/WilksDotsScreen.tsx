import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ProGate } from '../../components/ProGate';
import { useSettings } from '../../contexts/SettingsContext';
import {
  wilksScore,
  dotsScore,
  wilksClassification,
  dotsClassification,
} from '../../utils/calculators';
import { type Sex } from '../../types';

export default function WilksDotsScreen() {
  return (
    <ProGate feature="Wilks/DOTS Calculator">
      <WilksDotsContent />
    </ProGate>
  );
}

function WilksDotsContent() {
  const { settings, updateSettings } = useSettings();
  const [bodyweight, setBodyweight] = useState(String(settings.bodyweight));
  const [total, setTotal] = useState('');
  const [sex, setSex] = useState<Sex>(settings.sex);

  const bw = parseFloat(bodyweight);
  const tot = parseFloat(total);
  const hasValues = !isNaN(bw) && !isNaN(tot) && bw > 0 && tot > 0;

  const wilks = hasValues ? wilksScore(tot, bw, sex) : null;
  const dots = hasValues ? dotsScore(tot, bw, sex) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Wilks / DOTS</Text>
        <Text style={styles.subtitle}>Compare strength across weight classes</Text>

        <Card bordered style={styles.inputs}>
          {/* Sex selector */}
          <View style={styles.sexRow}>
            <Text style={styles.inputLabel}>SEX</Text>
            <View style={styles.sexBtns}>
              {(['M', 'F'] as Sex[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sexBtn, sex === s && styles.sexBtnActive]}
                  onPress={() => setSex(s)}
                >
                  <Text style={[styles.sexBtnText, sex === s && styles.sexBtnTextActive]}>
                    {s === 'M' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label={`Bodyweight (${settings.units})`}
            value={bodyweight}
            onChangeText={setBodyweight}
            keyboardType="decimal-pad"
            placeholder="e.g. 83"
            suffix={settings.units}
          />
          <Input
            label={`Total (${settings.units})`}
            value={total}
            onChangeText={setTotal}
            keyboardType="decimal-pad"
            placeholder="Best squat + bench + deadlift"
            suffix={settings.units}
          />
        </Card>

        {/* Results */}
        {hasValues && wilks != null && dots != null && (
          <View style={styles.results}>
            <Card style={[styles.scoreCard, styles.wilksCard]}>
              <Text style={styles.scoreLabel}>WILKS</Text>
              <Text style={styles.scoreValue}>{wilks.toFixed(2)}</Text>
              <Text style={styles.classification}>{wilksClassification(wilks)}</Text>
            </Card>
            <Card style={[styles.scoreCard, styles.dotsCard]}>
              <Text style={styles.scoreLabel}>DOTS</Text>
              <Text style={styles.scoreValue}>{dots.toFixed(2)}</Text>
              <Text style={styles.classification}>{dotsClassification(dots)}</Text>
            </Card>
          </View>
        )}

        {/* Classification guide */}
        <Card bordered style={styles.guide}>
          <Text style={styles.guideTitle}>Wilks Classification Guide</Text>
          {[
            ['Elite', '500+'],
            ['Master', '400–499'],
            ['Advanced', '300–399'],
            ['Intermediate', '200–299'],
            ['Beginner', '< 200'],
          ].map(([level, range]) => (
            <View key={level} style={styles.guideRow}>
              <Text style={styles.guideLevel}>{level}</Text>
              <Text style={styles.guideRange}>{range}</Text>
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
  inputs: { gap: 4 },
  inputLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  sexRow: { gap: 8, marginBottom: 8 },
  sexBtns: { flexDirection: 'row', gap: 8 },
  sexBtn: {
    flex: 1, height: 44, borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  sexBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  sexBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
  sexBtnTextActive: { color: '#FFF', fontWeight: '700' },
  results: { flexDirection: 'row', gap: 12 },
  scoreCard: { flex: 1, alignItems: 'center', paddingVertical: 24, gap: 4 },
  wilksCard: { borderWidth: 1, borderColor: Colors.accent },
  dotsCard: { borderWidth: 1, borderColor: Colors.info },
  scoreLabel: { color: Colors.textDisabled, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  scoreValue: { color: Colors.text, fontSize: 40, fontWeight: '800' },
  classification: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
  guide: { gap: 8 },
  guideTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  guideRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  guideLevel: { color: Colors.textSecondary, fontSize: 14 },
  guideRange: { color: Colors.textMuted, fontSize: 14 },
});
