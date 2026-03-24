import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
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

  const loadData = useCallback(async () => {
    const data = await StorageService.getStreakData();
    setStreak(data);
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
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <Text style={styles.title}>Your Streaks</Text>
      <Text style={styles.subtitle}>Track your daily scripture reading journey</Text>

      {streak && (
        <>
          <View style={styles.streakHighlight}>
            <View style={styles.streakCircle}>
              <Text style={styles.streakEmoji}>
                {streak.currentStreak >= 7 ? '\uD83D\uDD25' : streak.currentStreak > 0 ? '\u2B50' : '\uD83C\uDF31'}
              </Text>
              <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
            {streak.currentStreak >= 7 && (
              <Text style={styles.streakMessage}>
                Amazing! You are on fire!
              </Text>
            )}
            {streak.currentStreak > 0 && streak.currentStreak < 7 && (
              <Text style={styles.streakMessage}>
                Great start! Keep it going!
              </Text>
            )}
            {streak.currentStreak === 0 && (
              <Text style={styles.streakMessage}>
                Start reading today to begin your streak
              </Text>
            )}
          </View>

          <View style={styles.statsRow}>
            <StatCard
              value={streak.longestStreak}
              label="Best Streak"
              icon={'\uD83C\uDFC6'}
              color={Colors.streakGold}
            />
            <View style={styles.statSpacer} />
            <StatCard
              value={streak.totalDaysRead}
              label="Total Days"
              icon={'\uD83D\uDCD6'}
              color={Colors.success}
            />
            <View style={styles.statSpacer} />
            <StatCard
              value={getWeeklyAverage()}
              label="Weekly Avg"
              icon={'\uD83D\uDCCA'}
              color={Colors.primary}
            />
          </View>

          <Card style={styles.calendarCard}>
            <View style={styles.calendarNav}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>{'\u2039'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
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
                <View style={[styles.legendDot, { backgroundColor: Colors.calendarActive }]} />
                <Text style={styles.legendText}>Read</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { borderWidth: 2, borderColor: Colors.calendarToday }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
              <Text style={styles.monthCount}>{thisMonthDays} days this month</Text>
            </View>
          </Card>

          <Card style={styles.consistencyCard}>
            <Text style={styles.consistencyTitle}>30-Day Consistency</Text>
            <View style={styles.progressBarOuter}>
              <View
                style={[styles.progressBarInner, { width: `${getConsistencyScore()}%` }]}
              />
            </View>
            <Text style={styles.consistencyScore}>{getConsistencyScore()}%</Text>
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
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
  },
  streakHighlight: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  streakCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevated,
    borderWidth: 3,
    borderColor: Colors.accentLight,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakNumber: {
    ...Typography.stat,
    fontSize: 42,
    lineHeight: 48,
  },
  streakLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  streakMessage: {
    ...Typography.body,
    color: Colors.primary,
    marginTop: Spacing.md,
    fontWeight: '600',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.primary,
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
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
  },
  consistencyScore: {
    ...Typography.h2,
    color: Colors.success,
  },
});
