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
import { StreakBadge } from '../components/StreakBadge';
import { StorageService } from '../services/storage';
import { VerseService } from '../services/verse';
import { StreakData, Verse } from '../types';

export function DailyScreen() {
  const insets = useSafeAreaInsets();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [hasRead, setHasRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const loadData = useCallback(async () => {
    const todayVerse = VerseService.getVerseOfTheDay();
    setVerse(todayVerse);

    const streakData = await StorageService.getStreakData();
    setStreak(streakData);

    const readToday = await StorageService.hasReadToday();
    setHasRead(readToday);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleMarkAsRead = async () => {
    const updated = await StorageService.recordReading();
    setStreak(updated);
    setHasRead(true);
  };

  const handleBookmark = async () => {
    if (!verse) return;
    if (!bookmarked) {
      await StorageService.addBookmark({
        id: `${verse.book}-${verse.chapter}-${verse.verse}-${Date.now()}`,
        verse,
        date: new Date().toISOString(),
      });
    }
    setBookmarked(!bookmarked);
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
          {streak && <StreakBadge count={streak.currentStreak} />}
        </View>
      </View>

      {verse && (
        <Card style={styles.verseCard} elevated>
          <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
          <View style={styles.verseDivider} />
          <Text style={styles.verseText}>{`\u201C${verse.text}\u201D`}</Text>
          <Text style={styles.verseRef}>
            {VerseService.formatReference(verse)} ({verse.translation})
          </Text>
          <View style={styles.verseActions}>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmark}
              activeOpacity={0.7}
            >
              <Text style={styles.bookmarkIcon}>
                {bookmarked ? '\uD83D\uDD16' : '\uD83D\uDCCC'}
              </Text>
              <Text style={styles.bookmarkText}>
                {bookmarked ? 'Saved' : 'Bookmark'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {!hasRead ? (
        <TouchableOpacity
          style={styles.readButton}
          onPress={handleMarkAsRead}
          activeOpacity={0.8}
        >
          <Text style={styles.readButtonIcon}>{'\u2714\uFE0F'}</Text>
          <Text style={styles.readButtonText}>Mark Today as Read</Text>
          <Text style={styles.readButtonSub}>
            Keep your streak alive!
          </Text>
        </TouchableOpacity>
      ) : (
        <Card style={styles.completedCard}>
          <Text style={styles.completedIcon}>{'\u2705'}</Text>
          <Text style={styles.completedText}>
            You have completed today's reading
          </Text>
          <Text style={styles.completedSub}>
            Come back tomorrow to continue your streak
          </Text>
        </Card>
      )}

      {streak && (
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{streak.totalDaysRead}</Text>
            <Text style={styles.quickStatLabel}>Total Days</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{streak.longestStreak}</Text>
            <Text style={styles.quickStatLabel}>Best Streak</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{streak.currentStreak}</Text>
            <Text style={styles.quickStatLabel}>Current</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
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
  header: {
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.bodySmall,
  },
  verseCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  verseLabel: {
    ...Typography.caption,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  verseDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accentLight,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  verseText: {
    ...Typography.verseText,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  verseRef: {
    ...Typography.verseRef,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  verseActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  bookmarkIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  bookmarkText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  readButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.elevated,
  },
  readButtonIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  readButtonText: {
    ...Typography.h3,
    color: Colors.surface,
    marginBottom: Spacing.xs,
  },
  readButtonSub: {
    ...Typography.bodySmall,
    color: Colors.accentLight,
  },
  completedCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: '#F5FAF0',
  },
  completedIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  completedText: {
    ...Typography.h3,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  completedSub: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  quickStatValue: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: 2,
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
});
