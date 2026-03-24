import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface PaywallScreenProps {
  onContinueFree: () => void;
  onSubscribe: () => void;
}

const PREMIUM_FEATURES = [
  { icon: '\uD83D\uDCD6', title: 'Full Bible Access', desc: 'All 66 books, every chapter and verse' },
  { icon: '\uD83D\uDD16', title: 'Unlimited Bookmarks', desc: 'Save as many verses as you want' },
  { icon: '\uD83D\uDCCB', title: 'Reading Plans', desc: 'Guided journeys through Scripture' },
  { icon: '\uD83D\uDCCA', title: 'Advanced Stats', desc: 'Detailed reading analytics and insights' },
  { icon: '\uD83D\uDD14', title: 'Smart Reminders', desc: 'Personalized notification scheduling' },
  { icon: '\u2728', title: 'No Ads Ever', desc: 'Pure, distraction-free reading' },
];

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

        {/* Features */}
        <View style={styles.featuresGrid}>
          {PREMIUM_FEATURES.map((feat, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureIcon}>{feat.icon}</Text>
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
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
              <Text style={styles.planSavings}>$1.67/month \u2014 Save 58%</Text>
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
          Cancel anytime. Subscription auto-renews.{'\n'}
          Restore Purchases | Terms | Privacy
        </Text>
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
  featuresGrid: {
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFFEE',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: '#FFFFFF77',
  },
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
});
