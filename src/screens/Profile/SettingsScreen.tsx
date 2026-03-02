import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { type Units, type Sex } from '../../types';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { isPro, purchase, restore } = useSubscription();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Subscription */}
        <Card bordered style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>IronLog Pro</Text>
              <Text style={styles.rowSub}>{isPro ? 'Active' : '$4.99/month · 7-day trial'}</Text>
            </View>
            {isPro ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.upgradeBtn} onPress={purchase}>
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
          {!isPro && (
            <TouchableOpacity onPress={() => restore()}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Units */}
        <Card bordered style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Units</Text>
            <View style={styles.segmented}>
              {(['kg', 'lbs'] as Units[]).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.segment, settings.units === u && styles.segmentActive]}
                  onPress={() => updateSettings({ units: u })}
                >
                  <Text style={[styles.segmentText, settings.units === u && styles.segmentTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sex</Text>
            <View style={styles.segmented}>
              {(['M', 'F'] as Sex[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segment, settings.sex === s && styles.segmentActive]}
                  onPress={() => updateSettings({ sex: s })}
                >
                  <Text style={[styles.segmentText, settings.sex === s && styles.segmentTextActive]}>
                    {s === 'M' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Rest Timer</Text>
              <Text style={styles.rowSub}>{settings.restTimerDuration}s default</Text>
            </View>
            <View style={styles.segmented}>
              {[90, 120, 180, 240, 300].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segment, settings.restTimerDuration === s && styles.segmentActive]}
                  onPress={() => updateSettings({ restTimerDuration: s })}
                >
                  <Text style={[styles.segmentText, settings.restTimerDuration === s && styles.segmentTextActive]}>
                    {s / 60}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* About */}
        <Card bordered style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowSub}>1.0.0</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'IronLog',
                'Built for powerlifters. Train hard, lift heavy.'
              )
            }
          >
            <Text style={styles.aboutText}>Made with ❤️ for the platform</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  section: { gap: 16 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  rowSub: { color: Colors.textMuted, fontSize: 13 },
  proBadge: { backgroundColor: Colors.pro, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  proBadgeText: { color: '#000', fontSize: 12, fontWeight: '900' },
  upgradeBtn: { backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  upgradeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  restoreText: { color: Colors.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  segmented: { flexDirection: 'row', gap: 4 },
  segment: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border,
  },
  segmentActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  segmentText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  segmentTextActive: { color: '#FFF', fontWeight: '700' },
  aboutText: { color: Colors.textMuted, fontSize: 13 },
});
