import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { READING_PLANS, EMPTY_STATE_MESSAGES } from '../constants/plans';
import { ReadingPlan, ReadingPlanProgress } from '../types';

export function PlansScreen() {
  const insets = useSafeAreaInsets();
  const [allProgress, setAllProgress] = useState<Record<string, ReadingPlanProgress>>({});
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = useCallback(async () => {
    const progress = await StorageService.getAllReadingPlanProgress();
    setAllProgress(progress);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  }, [loadProgress]);

  const handleStartPlan = async (plan: ReadingPlan) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const today = new Date().toISOString().split('T')[0];
    const progress: ReadingPlanProgress = {
      planId: plan.id,
      startDate: today,
      completedDays: [],
      currentDay: 1,
      lastReadDate: null,
    };
    await StorageService.saveReadingPlanProgress(progress);
    setAllProgress((prev) => ({ ...prev, [plan.id]: progress }));
  };

  const handleReadToday = async (plan: ReadingPlan) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const progress = allProgress[plan.id];
    if (!progress) return;

    const today = new Date().toISOString().split('T')[0];
    if (progress.completedDays.includes(today)) return;

    const updated: ReadingPlanProgress = {
      ...progress,
      completedDays: [...progress.completedDays, today],
      currentDay: Math.min(progress.currentDay + 1, plan.durationDays),
      lastReadDate: today,
    };
    await StorageService.saveReadingPlanProgress(updated);
    setAllProgress((prev) => ({ ...prev, [plan.id]: updated }));
  };

  const getProgressPercent = (plan: ReadingPlan): number => {
    const progress = allProgress[plan.id];
    if (!progress) return 0;
    return Math.round((progress.completedDays.length / plan.durationDays) * 100);
  };

  const hasStarted = (planId: string) => !!allProgress[planId];
  const isCompletedToday = (planId: string) => {
    const progress = allProgress[planId];
    if (!progress) return false;
    const today = new Date().toISOString().split('T')[0];
    return progress.completedDays.includes(today);
  };

  if (selectedPlan) {
    const progress = allProgress[selectedPlan.id];
    const started = hasStarted(selectedPlan.id);
    const doneToday = isCompletedToday(selectedPlan.id);
    const pct = getProgressPercent(selectedPlan);
    const isComplete = progress && progress.completedDays.length >= selectedPlan.durationDays;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => setSelectedPlan(null)}
          style={styles.backRow}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>{'\u2190'}</Text>
          <Text style={styles.backText}>All Plans</Text>
        </TouchableOpacity>

        <View style={styles.planDetailHeader}>
          <Text style={styles.planDetailIcon}>{selectedPlan.icon}</Text>
          <Text style={styles.planDetailTitle}>{selectedPlan.title}</Text>
          <Text style={styles.planDetailDesc}>{selectedPlan.description}</Text>
        </View>

        <Card style={styles.planStatsCard}>
          <View style={styles.planStatRow}>
            <View style={styles.planStatItem}>
              <Text style={styles.planStatValue}>{selectedPlan.book}</Text>
              <Text style={styles.planStatLabel}>Book</Text>
            </View>
            <View style={styles.planStatDivider} />
            <View style={styles.planStatItem}>
              <Text style={styles.planStatValue}>{selectedPlan.totalChapters}</Text>
              <Text style={styles.planStatLabel}>Chapters</Text>
            </View>
            <View style={styles.planStatDivider} />
            <View style={styles.planStatItem}>
              <Text style={styles.planStatValue}>{selectedPlan.durationDays}</Text>
              <Text style={styles.planStatLabel}>Days</Text>
            </View>
          </View>
        </Card>

        {started && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressBarOuter}>
              <View style={[styles.progressBarInner, { width: `${pct}%` }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressPercent}>{pct}%</Text>
              <Text style={styles.progressDays}>
                {progress?.completedDays.length || 0} of {selectedPlan.durationDays} days
              </Text>
            </View>
            {isComplete && (
              <View style={styles.completeBanner}>
                <Text style={styles.completeEmoji}>{'\uD83C\uDF89'}</Text>
                <Text style={styles.completeText}>Plan Complete!</Text>
              </View>
            )}
          </Card>
        )}

        {!started ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartPlan(selectedPlan)}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Plan</Text>
          </TouchableOpacity>
        ) : !doneToday && !isComplete ? (
          <TouchableOpacity
            style={styles.readTodayButton}
            onPress={() => handleReadToday(selectedPlan)}
            activeOpacity={0.8}
          >
            <Text style={styles.readTodayIcon}>{'\u2714\uFE0F'}</Text>
            <View>
              <Text style={styles.readTodayText}>Mark Today's Reading</Text>
              <Text style={styles.readTodaySub}>
                Day {progress?.currentDay || 1}: {selectedPlan.book}{' '}
                {Math.ceil(
                  (selectedPlan.totalChapters / selectedPlan.durationDays) *
                    (progress?.currentDay || 1)
                )}
              </Text>
            </View>
          </TouchableOpacity>
        ) : doneToday && !isComplete ? (
          <Card style={styles.doneCard}>
            <Text style={styles.doneEmoji}>{'\u2705'}</Text>
            <Text style={styles.doneText}>Today's reading is done</Text>
            <Text style={styles.doneSub}>Come back tomorrow for day {(progress?.currentDay || 1)}</Text>
          </Card>
        ) : null}
      </ScrollView>
    );
  }

  // Plans list view
  const activePlans = READING_PLANS.filter((p) => hasStarted(p.id));
  const availablePlans = READING_PLANS.filter((p) => !hasStarted(p.id));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.gold}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Reading Plans</Text>
      <Text style={styles.subtitle}>Guided journeys through Scripture</Text>

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>IN PROGRESS</Text>
          {activePlans.map((plan) => {
            const pct = getProgressPercent(plan);
            const doneToday = isCompletedToday(plan.id);
            return (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => setSelectedPlan(plan)}
                activeOpacity={0.7}
              >
                <View style={styles.planCardLeft}>
                  <Text style={styles.planCardIcon}>{plan.icon}</Text>
                </View>
                <View style={styles.planCardInfo}>
                  <Text style={styles.planCardTitle}>{plan.title}</Text>
                  <View style={styles.planMiniBar}>
                    <View style={[styles.planMiniBarInner, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.planCardMeta}>
                    {pct}% complete {doneToday ? '\u2022 Done today' : ''}
                  </Text>
                </View>
                <Text style={styles.chevron}>{'\u203A'}</Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}

      {/* Available Plans */}
      <Text style={styles.sectionHeader}>
        {activePlans.length > 0 ? 'AVAILABLE PLANS' : 'CHOOSE A PLAN'}
      </Text>

      {availablePlans.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>{EMPTY_STATE_MESSAGES.noPlans.icon}</Text>
          <Text style={styles.emptyTitle}>{EMPTY_STATE_MESSAGES.noPlans.title}</Text>
          <Text style={styles.emptyMessage}>{EMPTY_STATE_MESSAGES.noPlans.message}</Text>
        </Card>
      ) : (
        availablePlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={styles.planCard}
            onPress={() => setSelectedPlan(plan)}
            activeOpacity={0.7}
          >
            <View style={styles.planCardLeft}>
              <Text style={styles.planCardIcon}>{plan.icon}</Text>
            </View>
            <View style={styles.planCardInfo}>
              <Text style={styles.planCardTitle}>{plan.title}</Text>
              <Text style={styles.planCardDesc} numberOfLines={2}>
                {plan.description}
              </Text>
              <Text style={styles.planCardMeta}>
                {plan.book} \u2022 {plan.durationDays} days
              </Text>
            </View>
            <Text style={styles.chevron}>{'\u203A'}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingLeft: Spacing.xs,
    color: Colors.textMuted,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
    minHeight: 80,
  },
  planCardLeft: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  planCardIcon: {
    fontSize: 28,
  },
  planCardInfo: {
    flex: 1,
  },
  planCardTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  planCardDesc: {
    ...Typography.bodySmall,
    fontSize: 13,
    marginBottom: 4,
  },
  planCardMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  planMiniBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  planMiniBarInner: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  // Detail view
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    minHeight: 44,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.gold,
    marginRight: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Colors.gold,
    fontWeight: '600',
  },
  planDetailHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  planDetailIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  planDetailTitle: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  planDetailDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  planStatsCard: {
    marginBottom: Spacing.lg,
  },
  planStatRow: {
    flexDirection: 'row',
  },
  planStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  planStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 2,
  },
  planStatLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  planStatDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  progressBarOuter: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    ...Typography.h3,
    color: Colors.gold,
  },
  progressDays: {
    ...Typography.bodySmall,
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  completeEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  completeText: {
    ...Typography.h3,
    color: Colors.success,
  },
  startButton: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    ...Typography.button,
    color: Colors.textOnDark,
  },
  readTodayButton: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  readTodayIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  readTodayText: {
    ...Typography.button,
    color: Colors.navy,
  },
  readTodaySub: {
    fontSize: 13,
    color: '#1A1A2E99',
    marginTop: 2,
  },
  doneCard: {
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: '#4CAF5030',
  },
  doneEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  doneText: {
    ...Typography.h3,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  doneSub: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    ...Typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
