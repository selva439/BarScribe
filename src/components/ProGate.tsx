import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Button } from './ui/Button';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Props {
  children: React.ReactNode;
  feature?: string;
  /** If true, shows a minimal lock overlay instead of full paywall replacement */
  overlay?: boolean;
}

export function ProGate({ children, feature, overlay = false }: Props) {
  const { isPro, isLoading, purchase } = useSubscription();

  if (isLoading) return null;
  if (isPro) return <>{children}</>;

  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <Ionicons name="lock-closed" size={40} color={Colors.pro} />
          <Text style={styles.overlayText}>Pro Feature</Text>
          <Button label="Unlock Pro" onPress={purchase} style={styles.btn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Ionicons name="barbell" size={48} color={Colors.accent} />
        <View style={[styles.proBadgeContainer]}>
          <Text style={styles.proBadge}>PRO</Text>
        </View>
      </View>

      <Text style={styles.headline}>IronLog Pro</Text>
      <Text style={styles.subheadline}>
        {feature ? `${feature} requires Pro` : 'Unlock your full potential'}
      </Text>

      <View style={styles.featureList}>
        {PRO_FEATURES.map(f => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pricing}>
        <Text style={styles.price}>$4.99</Text>
        <Text style={styles.pricePeriod}> / month</Text>
      </View>
      <Text style={styles.trial}>7-day free trial • Cancel anytime</Text>

      <Button
        label="Start Free Trial"
        onPress={purchase}
        fullWidth
        style={styles.purchaseBtn}
      />
      <Button
        label="Restore Purchases"
        onPress={async () => {}}
        variant="ghost"
        fullWidth
      />
    </View>
  );
}

const PRO_FEATURES = [
  'Built-in 5/3/1, Smolov Jr, Texas Method programs',
  'Wilks & DOTS score calculator',
  'Progress graphs & PR history',
  'Meet prep & attempt calculator',
  'iCloud/cloud backup sync',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconRow: {
    position: 'relative',
    marginBottom: 8,
  },
  proBadgeContainer: {
    position: 'absolute',
    bottom: -4,
    right: -12,
    backgroundColor: Colors.pro,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadge: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headline: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  subheadline: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureList: {
    width: '100%',
    gap: 10,
    marginVertical: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: Colors.text,
    fontSize: 15,
    flex: 1,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  price: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '800',
  },
  pricePeriod: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 6,
  },
  trial: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  purchaseBtn: {
    marginTop: 4,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlayText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  btn: {
    minWidth: 160,
  },
});
