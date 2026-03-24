import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Card } from '../components/Card';
import { CalendarGrid } from '../components/CalendarGrid';
import { StatCard } from '../components/StatCard';
import { StorageService } from '../services/storage';
import { StreakData } from '../types';

export function StreaksScreen() {
  const insets = useSafeAreaInsets();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const ringScale = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    const data = await StorageService.getStreakData();
    setStreak(data);
    setLoading(false);

    // Animate streak ring
    Animated.sequence([
      Animated.spring(ringScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(numberScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous slow glow rotation
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const goToPreviousMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const thisMonthDays = streak
    ? streak.readDates.filter((d) => {
        const date = new Date(d + 'T00:00:00');
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length
    : 0;

  const getWeeklyAverage = (): string => {
    if (!streak || streak.totalDaysRead === 0) return '0';
    const firstDate = streak.readDates.length > 0 ? new Date(streak.readDates[0] + 'T00:00:00') : new Date();
    const today = new Date();
    const weeks = Math.max(1, Math.ceil((today.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    return (streak.totalDaysRead / weeks).toFixed(1);
  };

  const getConsistencyScore = (): number => {
    if (!streak || streak.readDates.length === 0) return 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentDays = streak.readDates.filter((d) => new Date(d + 'T00:00:00') >= thirtyDaysAgo).length;
    return Math.round((recentDays / 30) * 100);
  };

  const getStreakEmoji = (count: number): string => {
    if (count >= 100) return '\uD83D\uDC51';
    if (count >= 30) return '\uD83D\uDD25';
    if (count >= 7) return '\u2B50';
    if (count > 0) return '\uD83C\uDF31';
    return '\uD83C\uDF3F';
  };

  const getStreakMessage = (count: number): string => {
    if (count >= 100) return 'Legendary dedication!';
    if (count >= 30) return 'On fire! Incredible faithfulness!';
    if (count >= 7) return 'One week strong!';
    if (count > 0) return 'Great start! Keep growing!';
    return 'Start reading today to begin your streak';
  };

  const rotateInterpolation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.content}>
          <View style={styles.skeletonCircle} />
          <View style={[styles.skeletonLine, { width: '50%', alignSelf: 'center' }]} />
        </View>
      </View>
    );
  }

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
      <Text style={styles.title}>Your Streaks</Text>
      <Text style={styles.subtitle}>Track your daily Scripture journey</Text>

      {streak && (
        <>
          {/* Hero Streak Display */}
          <View style={styles.streakHero}>
            <Animated.View
              style={[
                styles.streakRingOuter,
                {
                  transform: [{ scale: ringScale }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.streakRingGlow,
                  {
                    transform: [{ rotate: rotateInterpolation }],
                  },
                ]}
              />
              <View style={styles.streakRingInner}>
                <Text style={styles.streakEmoji}>{getStreakEmoji(streak.currentStreak)}</Text>
                <Animated.Text
                  style={[
                    styles.streakNumber,
                    { transform: [{ scale: numberScale }] },
                  ]}
                >
                  {streak.currentStreak}
                </Animated.Text>
                <Text style={styles.streakLabel}>
                  {streak.currentStreak === 1 ? 'DAY' : 'DAYS'}
                </Text>
              </View>
            </Animated.View>
            <Text style={styles.streakMessage}>
              {getStreakMessage(streak.currentStreak)}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              value={streak.longestStreak}
              label="Best Streak"
              icon={'\uD83C\uDFC6'}
              color={Colors.gold}
            />
            <View style={styles.statSpacer} />
            <StatCard
              value={streak.totalDaysRead}
              label="Total Days"
              icon={'\uD83D\uDCD6'}
              color={Colors.navy}
            />
            <View style={styles.statSpacer} />
            <StatCard
              value={getWeeklyAverage()}
              label="Weekly Avg"
              icon={'\uD83D\uDCCA'}
              color={Colors.primaryLight}
            />
          </View>

          {/* Calendar */}
          <Card style={styles.calendarCard}>
            <View style={styles.calendarNav}>
              <TouchableOpacity
                onPress={goToPreviousMonth}
                style={styles.navButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.navButtonText}>{'\u2039'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToNextMonth}
                style={styles.navButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.navButtonText}>{'\u203A'}</Text>
              </TouchableOpacity>
            </View>
            <CalendarGrid
              readDates={streak.readDates}
              month={currentMonth}
              year={currentYear}
            />
            <View style={styles.calendarFooter}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
                <Text style={styles.legendText}>Read</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { borderWidth: 2, borderColor: Colors.navy }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
              <Text style={styles.monthCount}>{thisMonthDays} days this month</Text>
            </View>
          </Card>

          {/* Consistency */}
          <Card style={styles.consistencyCard}>
            <Text style={styles.consistencyTitle}>30-Day Consistency</Text>
            <View style={styles.progressBarOuter}>
              <View
                style={[styles.progressBarInner, { width: `${getConsistencyScore()}%` }]}
              />
            </View>
            <Text style={styles.consistencyScore}>{getConsistencyScore()}%</Text>
          </Card>

          {/* Milestone badges */}
          <Card style={styles.milestonesCard}>
            <Text style={styles.milestonesTitle}>Milestones</Text>
            <View style={styles.milestoneGrid}>
              {[
                { days: 7, emoji: '\u2B50', label: '1 Week' },
                { days: 30, emoji: '\uD83D\uDD25', label: '1 Month' },
                { days: 100, emoji: '\uD83D\uDC8E', label: '100 Days' },
                { days: 365, emoji: '\uD83D\uDC51', label: '1 Year' },
              ].map((m) => {
                const achieved = streak.totalDaysRead >= m.days;
                return (
                  <View
                    key={m.days}
                    style={[
                      styles.milestoneItem,
                      !achieved && styles.milestoneItemLocked,
                    ]}
                  >
                    <Text style={[styles.milestoneEmoji, !achieved && { opacity: 0.3 }]}>
                      {achieved ? m.emoji : '\uD83D\uDD12'}
                    </Text>
                    <Text style={[styles.milestoneLabel, !achieved && { opacity: 0.4 }]}>
                      {m.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
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
  streakHero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  streakRingOuter: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  streakRingGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.gold,
    borderTopColor: 'transparent',
    borderRightColor: Colors.goldLight,
  },
  streakRingInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.goldMuted,
  },
  streakEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.gold,
    lineHeight: 52,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  streakMessage: {
    ...Typography.body,
    color: Colors.gold,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statSpacer: {
    width: Spacing.sm,
  },
  calendarCard: {
    marginBottom: Spacing.lg,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.navy,
    fontWeight: '600',
    lineHeight: 28,
  },
  calendarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...Typography.bodySmall,
    fontSize: 12,
  },
  monthCount: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '600',
  },
  consistencyCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  consistencyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  progressBarOuter: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.calendarInactive,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
  },
  consistencyScore: {
    ...Typography.h2,
    color: Colors.gold,
  },
  milestonesCard: {
    marginBottom: Spacing.lg,
  },
  milestonesTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  milestoneGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestoneItem: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  milestoneItemLocked: {
    opacity: 0.5,
  },
  milestoneEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  milestoneLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  // Skeleton
  skeletonCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginVertical: Spacing.xl,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
});
