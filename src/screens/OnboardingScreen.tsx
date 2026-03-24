import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { TRANSLATIONS } from '../constants/bible';
import { OnboardingState } from '../types';
import { StorageService } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 5;

const NOTIFICATION_TIMES = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '9:00 PM', value: '21:00' },
];

const GOALS = [
  { label: '1 Verse / Day', value: 'verse' as const, iconName: 'book-outline', desc: 'Perfect for beginners' },
  { label: '1 Chapter / Day', value: 'chapter' as const, iconName: 'library-outline', desc: 'Steady and consistent' },
  { label: 'Custom', value: 'custom' as const, iconName: 'settings-outline', desc: 'Set your own pace' },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [state, setState] = useState<OnboardingState>({
    completed: false,
    translation: 'NIV',
    dailyGoal: 'verse',
    customGoalCount: 3,
    notificationTime: '08:00',
    notificationsEnabled: true,
  });

  const animateToStep = useCallback((nextStep: number) => {
    Animated.timing(slideAnim, {
      toValue: -nextStep * SCREEN_WIDTH,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setStep(nextStep);
  }, [slideAnim]);

  const handleNext = useCallback(async () => {
    if (step < TOTAL_STEPS - 1) {
      animateToStep(step + 1);
    } else {
      await StorageService.completeOnboarding(state);
      onComplete();
    }
  }, [step, state, onComplete, animateToStep]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      animateToStep(step - 1);
    }
  }, [step, animateToStep]);

  const updateState = (partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const getTimeLabel = (val: string) => {
    const match = NOTIFICATION_TIMES.find((t) => t.value === val);
    return match ? match.label : val;
  };

  // Step 1: Welcome
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.welcomeIconWrap}>
          <Text style={styles.welcomeIcon}>{'\u271E'}</Text>
        </View>
        <Text style={styles.stepTitle}>Build Your Daily{'\n'}Scripture Habit</Text>
        <Text style={styles.stepBody}>
          Start each day with God's Word. Track your reading streak and grow in faith, one verse at a time.
        </Text>
        <View style={styles.welcomeFeatures}>
          {[
            { iconName: 'sunny-outline', text: 'Daily verse with beautiful typography' },
            { iconName: 'flame-outline', text: 'Streak tracking to build consistency' },
            { iconName: 'book-outline', text: 'Full Bible browser with bookmarks' },
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={feat.iconName as any} size={24} color={Colors.gold} style={{ marginRight: Spacing.md }} />
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Step 2: Translation
  const renderTranslation = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <Ionicons name="book" size={56} color={Colors.gold} style={{ marginBottom: Spacing.lg }} />
        <Text style={styles.stepTitle}>Choose Your{'\n'}Translation</Text>
        <Text style={styles.stepBody}>
          Select your preferred Bible translation. You can change this anytime in settings.
        </Text>
        <View style={styles.optionGrid}>
          {TRANSLATIONS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.optionChip,
                state.translation === t && styles.optionChipActive,
              ]}
              onPress={() => updateState({ translation: t })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionChipText,
                  state.translation === t && styles.optionChipTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Step 3: Reading Goal
  const renderGoal = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <Ionicons name="flag" size={56} color={Colors.gold} style={{ marginBottom: Spacing.lg }} />
        <Text style={styles.stepTitle}>Set Your{'\n'}Reading Goal</Text>
        <Text style={styles.stepBody}>
          How much Scripture would you like to read each day?
        </Text>
        <View style={styles.goalList}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[
                styles.goalCard,
                state.dailyGoal === goal.value && styles.goalCardActive,
              ]}
              onPress={() => updateState({ dailyGoal: goal.value })}
              activeOpacity={0.7}
            >
              <Ionicons name={goal.iconName as any} size={28} color={Colors.gold} style={{ marginRight: Spacing.md }} />
              <View style={styles.goalInfo}>
                <Text
                  style={[
                    styles.goalLabel,
                    state.dailyGoal === goal.value && styles.goalLabelActive,
                  ]}
                >
                  {goal.label}
                </Text>
                <Text style={styles.goalDesc}>{goal.desc}</Text>
              </View>
              <View
                style={[
                  styles.goalRadio,
                  state.dailyGoal === goal.value && styles.goalRadioActive,
                ]}
              >
                {state.dailyGoal === goal.value && (
                  <View style={styles.goalRadioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {state.dailyGoal === 'custom' && (
          <View style={styles.customGoalRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                updateState({
                  customGoalCount: Math.max(1, state.customGoalCount - 1),
                })
              }
            >
              <Text style={styles.counterBtnText}>{'\u2212'}</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{state.customGoalCount}</Text>
            <Text style={styles.counterLabel}>verses/day</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                updateState({
                  customGoalCount: Math.min(20, state.customGoalCount + 1),
                })
              }
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  // Step 4: Notifications
  const renderNotifications = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <Ionicons name="notifications" size={56} color={Colors.gold} style={{ marginBottom: Spacing.lg }} />
        <Text style={styles.stepTitle}>When Should We{'\n'}Remind You?</Text>
        <Text style={styles.stepBody}>
          A gentle daily reminder helps build lasting habits.
        </Text>
        <View style={styles.timeGrid}>
          {NOTIFICATION_TIMES.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[
                styles.timeChip,
                state.notificationTime === time.value && styles.timeChipActive,
              ]}
              onPress={() => updateState({ notificationTime: time.value })}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeChipText,
                  state.notificationTime === time.value && styles.timeChipTextActive,
                ]}
              >
                {time.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.skipNotifBtn}
          onPress={() => updateState({ notificationsEnabled: false })}
          activeOpacity={0.7}
        >
          <Text style={styles.skipNotifText}>
            {state.notificationsEnabled ? 'Skip notifications' : 'Notifications disabled'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 5: First Verse
  const renderFirstVerse = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.firstVerseCard}>
          <View style={styles.verseDividerLine} />
          <Text style={styles.firstVerseText}>
            {'\u201C'}Your word is a lamp for my feet, a light on my path.{'\u201D'}
          </Text>
          <Text style={styles.firstVerseRef}>Psalms 119:105 ({state.translation})</Text>
          <View style={styles.verseDividerLine} />
        </View>
        <Text style={styles.firstVerseMessage}>
          Your first verse of the day is waiting.{'\n'}Let the journey begin.
        </Text>
      </View>
    </View>
  );

  const steps = [renderWelcome, renderTranslation, renderGoal, renderNotifications, renderFirstVerse];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Progress Dots */}
      <View style={styles.progressRow}>
        {step > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.gold} />
          </TouchableOpacity>
        )}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && styles.dotActive,
                i < step && styles.dotCompleted,
              ]}
            />
          ))}
        </View>
        {step > 0 && <View style={styles.backBtn} />}
      </View>

      {/* Slides */}
      <Animated.View
        style={[
          styles.slidesContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {steps.map((renderStep, i) => (
          <View key={i} style={{ width: SCREEN_WIDTH }}>
            {renderStep()}
          </View>
        ))}
      </Animated.View>

      {/* Bottom Button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === 0
              ? 'Get Started'
              : step === TOTAL_STEPS - 1
              ? 'Begin Reading'
              : 'Continue'}
          </Text>
        </TouchableOpacity>
        {step === 0 && (
          <View style={styles.termsRow}>
            <Text style={styles.termsText}>By continuing, you agree to our </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://printmaxx.com/tos')}>
              <Text style={styles.termsLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> & </Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://printmaxx.com/privacy')}>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF30',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.gold,
  },
  dotCompleted: {
    backgroundColor: Colors.gold,
    opacity: 0.5,
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  welcomeIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeIcon: {
    fontSize: 36,
    color: Colors.navy,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFBF5',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
    lineHeight: 36,
  },
  stepBody: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF99',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  welcomeFeatures: {
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFFCC',
    flex: 1,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF15',
    borderWidth: 1.5,
    borderColor: '#FFFFFF30',
    minWidth: 80,
    alignItems: 'center',
  },
  optionChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  optionChipText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFFCC',
  },
  optionChipTextActive: {
    color: Colors.navy,
  },
  goalList: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#FFFFFF20',
  },
  goalCardActive: {
    borderColor: Colors.gold,
    backgroundColor: '#E2B53F15',
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFFCC',
    marginBottom: 2,
  },
  goalLabelActive: {
    color: Colors.gold,
  },
  goalDesc: {
    fontSize: 14,
    color: '#FFFFFF66',
  },
  goalRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRadioActive: {
    borderColor: Colors.gold,
  },
  goalRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold,
  },
  customGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.gold,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gold,
    minWidth: 40,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  counterLabel: {
    fontSize: 16,
    color: '#FFFFFF99',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  timeChip: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF15',
    borderWidth: 1.5,
    borderColor: '#FFFFFF30',
  },
  timeChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  timeChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFFCC',
  },
  timeChipTextActive: {
    color: Colors.navy,
  },
  skipNotifBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipNotifText: {
    fontSize: 15,
    color: '#FFFFFF66',
    textDecorationLine: 'underline',
  },
  firstVerseCard: {
    backgroundColor: '#FFFFFF08',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2B53F30',
    marginBottom: Spacing.xl,
  },
  verseDividerLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.gold,
    opacity: 0.4,
    marginVertical: Spacing.md,
  },
  firstVerseText: {
    fontSize: 22,
    color: '#FFFBF5',
    textAlign: 'center',
    lineHeight: 34,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  firstVerseRef: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
    marginTop: Spacing.md,
    letterSpacing: 0.5,
  },
  firstVerseMessage: {
    fontSize: 16,
    color: '#FFFFFF99',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomArea: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  nextButton: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.navy,
    letterSpacing: 0.3,
  },
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  termsText: {
    fontSize: 12,
    color: '#FFFFFF44',
    textAlign: 'center',
  },
  termsLink: {
    fontSize: 12,
    color: '#FFFFFF88',
    textDecorationLine: 'underline',
  },
});
