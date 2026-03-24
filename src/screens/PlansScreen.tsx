import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { READING_PLANS, EMPTY_STATE_MESSAGES } from '../constants/plans';
import type { ReadingPlan, ReadingPlanProgress } from '../types';
import { getPlanDaySchedule, getPlanSchedule } from '../data/readingPlans';

const PLAN_ICON_MAP: Record<string, string> = {
  'genesis-30': 'globe',
  'psalms-30': 'musical-notes',
  'proverbs-31': 'bulb',
  'john-21': 'sparkles',
  'romans-16': 'document-text',
  'matthew-28': 'star',
};

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

  const getPlanIconName = (planId: string): string => {
    return PLAN_ICON_MAP[planId] || 'book';
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
          <Ionicons name="arrow-back" size={20} color={Colors.gold} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.backText}>All Plans</Text>
        </TouchableOpacity>

        <View style={styles.planDetailHeader}>
          <Ionicons
            name={getPlanIconName(selectedPlan.id) as any}
            size={56}
            color={Colors.gold}
            style={{ marginBottom: Spacing.md }}
          />
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
                <Ionicons name="ribbon" size={24} color={Colors.success} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.completeText}>Plan Complete!</Text>
              </View>
            )}
          </Card>
        )}

        {/* Today's Reading Action */}
        {(() => {
          const currentDay = progress?.currentDay || 1;
          const todaySchedule = getPlanDaySchedule(selectedPlan.id, currentDay);
          const chapterLabel = todaySchedule
            ? todaySchedule.chapters.join(', ')
            : `${selectedPlan.book} ${currentDay}`;
          const verseLabel = todaySchedule ? `${todaySchedule.verseCount} verses` : '';

          if (!started) {
            return (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartPlan(selectedPlan)}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start Plan</Text>
              </TouchableOpacity>
            );
          }
          if (!doneToday && !isComplete) {
            return (
              <TouchableOpacity
                style={styles.readTodayButton}
                onPress={() => handleReadToday(selectedPlan)}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.navy} style={{ marginRight: Spacing.md }} />
                <View>
                  <Text style={styles.readTodayText}>Mark Today's Reading</Text>
                  <Text style={styles.readTodaySub}>
                    Day {currentDay}: {chapterLabel} ({verseLabel})
                  </Text>
                  {todaySchedule?.studyNote && (
                    <Text style={[styles.readTodaySub, { marginTop: 4, fontStyle: 'italic' }]}>
                      {todaySchedule.studyNote}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }
          if (doneToday && !isComplete) {
            return (
              <Card style={styles.doneCard}>
                <Ionicons name="checkmark-circle" size={32} color={Colors.success} style={{ marginBottom: Spacing.sm }} />
                <Text style={styles.doneText}>Today's reading is done</Text>
                <Text style={styles.doneSub}>Come back tomorrow for day {currentDay}</Text>
              </Card>
            );
          }
          return null;
        })()}

        {/* Full Reading Schedule */}
        {started && (
          <Card style={[styles.progressCard, { marginTop: Spacing.md }]}>
            <Text style={styles.progressTitle}>Reading Schedule</Text>
            {getPlanSchedule(selectedPlan.id).slice(0, selectedPlan.durationDays).map((scheduleDay) => {
              const dayCompleted = progress ? scheduleDay.day < (progress.currentDay || 1) : false;
              const isCurrent = progress ? scheduleDay.day === (progress.currentDay || 1) : scheduleDay.day === 1;
              return (
                <View
                  key={scheduleDay.day}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.borderLight,
                    opacity: dayCompleted ? 0.5 : 1,
                  }}
                >
                  <Ionicons
                    name={dayCompleted ? 'checkmark-circle' : isCurrent ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={dayCompleted ? Colors.success : isCurrent ? Colors.gold : Colors.textMuted}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.body, { fontWeight: isCurrent ? '700' : '400', fontSize: 14 }]}>
                      Day {scheduleDay.day}: {scheduleDay.chapters.join(', ')}
                    </Text>
                    <Text style={[Typography.bodySmall, { fontSize: 12, fontWeight: '300' }]}>
                      {scheduleDay.verseCount} verses
                      {scheduleDay.studyNote ? ` \u2022 ${scheduleDay.studyNote.substring(0, 60)}...` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
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
                  <Ionicons name={getPlanIconName(plan.id) as any} size={28} color={Colors.gold} />
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
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
          <Ionicons name="library" size={48} color={Colors.textMuted} style={{ marginBottom: Spacing.md }} />
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
              <Ionicons name={getPlanIconName(plan.id) as any} size={28} color={Colors.gold} />
            </View>
            <View style={styles.planCardInfo}>
              <Text style={styles.planCardTitle}>{plan.title}</Text>
              <Text style={styles.planCardDesc} numberOfLines={2}>
                {plan.description}
              </Text>
              <Text style={styles.planCardMeta}>
                {plan.book} {'\u2022'} {plan.durationDays} days
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
    fontWeight: '300',
    lineHeight: 24,
  },
  sectionHeader: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    marginTop: 24,
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
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
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
    fontWeight: '300',
    lineHeight: 24,
  },
  planCardMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
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
  // Detail view
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    minHeight: 44,
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
  planDetailTitle: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  planDetailDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '300',
    lineHeight: 26,
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
    fontVariant: ['tabular-nums'],
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
    paddingTop: 24,
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
    fontVariant: ['tabular-nums'],
  },
  progressDays: {
    ...Typography.bodySmall,
    fontWeight: '300',
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
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
  readTodayText: {
    ...Typography.button,
    color: Colors.navy,
  },
  readTodaySub: {
    fontSize: 13,
    fontWeight: '300',
    color: '#1A1A2E99',
    marginTop: 2,
    lineHeight: 24,
  },
  doneCard: {
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: '#4CAF5030',
  },
  doneText: {
    ...Typography.h3,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  doneSub: {
    ...Typography.bodySmall,
    textAlign: 'center',
    fontWeight: '300',
    lineHeight: 24,
  },
  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    ...Typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    fontWeight: '300',
    lineHeight: 24,
  },
});
