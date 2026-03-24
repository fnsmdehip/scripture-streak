import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface PaywallScreenProps {
  onContinueFree: () => void;
  onSubscribe: () => void;
}

const COMPARISON_FEATURES = [
  { name: 'Daily Verse', free: true, pro: true },
  { name: 'Basic Streaks', free: true, pro: true },
  { name: 'All Translations', free: false, pro: true },
  { name: 'Reading Plans', free: false, pro: true },
  { name: 'Offline Access', free: false, pro: true },
  { name: 'Advanced Stats', free: false, pro: true },
];

const PRIVACY_URL = 'https://printmaxx.com/privacy';
const TERMS_URL = 'https://printmaxx.com/tos';

export function PaywallScreen({ onContinueFree, onSubscribe }: PaywallScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onContinueFree}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.closeBtnText}>{'\u2715'}</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.title}>Unlock the Full{'\n'}Scripture Experience</Text>
          <Text style={styles.subtitle}>
            Deepen your faith with unlimited access to every feature.
          </Text>
        </View>

        {/* Feature Comparison Table */}
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonFeatureHeader}>Feature</Text>
            <Text style={styles.comparisonPlanHeader}>Free</Text>
            <Text style={[styles.comparisonPlanHeader, styles.comparisonProHeader]}>Pro</Text>
          </View>
          {COMPARISON_FEATURES.map((feat, i) => (
            <View
              key={i}
              style={[
                styles.comparisonRow,
                i === COMPARISON_FEATURES.length - 1 && styles.comparisonRowLast,
              ]}
            >
              <Text style={styles.comparisonFeatureName}>{feat.name}</Text>
              <Text style={styles.comparisonCheck}>
                {feat.free ? '\u2713' : '\u2014'}
              </Text>
              <Text style={[styles.comparisonCheck, styles.comparisonCheckPro]}>
                {feat.pro ? '\u2713' : '\u2014'}
              </Text>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View style={styles.plansSection}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            <View style={styles.planBestValue}>
              <Text style={styles.planBestValueText}>BEST VALUE</Text>
            </View>
            <View style={styles.planRadio}>
              {selectedPlan === 'yearly' && <View style={styles.planRadioDot} />}
            </View>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameActive]}>
                Yearly
              </Text>
              <Text style={styles.planPrice}>$19.99/year</Text>
              <Text style={styles.planSavings}>$1.67/month {'\u2014'} Save 58%</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={styles.planRadio}>
              {selectedPlan === 'monthly' && <View style={styles.planRadioDot} />}
            </View>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planNameActive]}>
                Monthly
              </Text>
              <Text style={styles.planPrice}>$3.99/month</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={onSubscribe}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeBtnText}>
            Start Free Trial
          </Text>
          <Text style={styles.subscribeBtnSub}>
            7 days free, then {selectedPlan === 'yearly' ? '$19.99/year' : '$3.99/month'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={onContinueFree}
          activeOpacity={0.7}
        >
          <Text style={styles.continueBtnText}>Continue with Free Plan</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Cancel anytime. Subscription auto-renews.
        </Text>
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => { Linking.openURL(TERMS_URL); }}>
            <Text style={styles.legalLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>{' | '}</Text>
          <TouchableOpacity onPress={() => { Linking.openURL(PRIVACY_URL); }}>
            <Text style={styles.legalLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>{' | '}</Text>
          <TouchableOpacity onPress={() => { /* Restore purchases placeholder */ }}>
            <Text style={styles.legalLink}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: Spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#FFFFFF66',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  premiumBadge: {
    backgroundColor: Colors.gold,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFBF5',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF99',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Feature Comparison
  comparisonCard: {
    backgroundColor: '#FFFFFF10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
  },
  comparisonFeatureHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF99',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  comparisonPlanHeader: {
    width: 50,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF99',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  comparisonProHeader: {
    color: Colors.gold,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  comparisonRowLast: {
    borderBottomWidth: 0,
  },
  comparisonFeatureName: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFFDD',
  },
  comparisonCheck: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF55',
  },
  comparisonCheckPro: {
    color: Colors.gold,
    fontWeight: '700',
  },
  // Plans
  plansSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: '#FFFFFF20',
  },
  planCardActive: {
    borderColor: Colors.gold,
    backgroundColor: '#E2B53F12',
  },
  planBestValue: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
    backgroundColor: Colors.gold,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  planBestValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: 0.8,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFFCC',
    marginBottom: 2,
  },
  planNameActive: {
    color: Colors.gold,
  },
  planPrice: {
    fontSize: 15,
    color: '#FFFFFF99',
  },
  planSavings: {
    fontSize: 13,
    color: Colors.gold,
    marginTop: 2,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  subscribeBtn: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  subscribeBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.navy,
  },
  subscribeBtnSub: {
    fontSize: 13,
    color: '#1A1A2EAA',
    marginTop: 2,
  },
  continueBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 15,
    color: '#FFFFFF66',
    fontWeight: '500',
  },
  legal: {
    fontSize: 11,
    color: '#FFFFFF44',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: Spacing.xs,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  legalLink: {
    fontSize: 11,
    color: '#FFFFFF66',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 11,
    color: '#FFFFFF44',
  },
});
