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
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Card } from '../components/Card';
import { StreakBadge } from '../components/StreakBadge';
import { StorageService } from '../services/storage';
import { VerseService } from '../services/verse';
import { StreakData, Verse } from '../types';
import { StreakIntelligence } from '../services/streakIntelligence';

export function DailyScreen() {
  const insets = useSafeAreaInsets();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [hasRead, setHasRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAnim = useRef(new Animated.Value(0)).current;
  const verseOpacity = useRef(new Animated.Value(0)).current;
  const verseTranslateY = useRef(new Animated.Value(16)).current;

  const loadData = useCallback(async () => {
    const todayVerse = VerseService.getVerseOfTheDay();
    setVerse(todayVerse);

    const streakData = await StorageService.getStreakData();
    setStreak(streakData);

    const readToday = await StorageService.hasReadToday();
    setHasRead(readToday);
    if (readToday) {
      checkAnim.setValue(1);
    }

    setLoading(false);

    // Animate verse in
    Animated.parallel([
      Animated.timing(verseOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(verseTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const previousStreak = streak;
    const updated = await StorageService.recordReading();
    setStreak(updated);
    setHasRead(true);

    Animated.spring(checkAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Request review after first streak day completed (first real value moment)
    // Per Cal AI insights: NEVER during onboarding, only after genuine value
    const wasFirstDay = previousStreak && previousStreak.totalDaysRead === 0 && updated.totalDaysRead === 1;
    if (wasFirstDay) {
      try {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          // Slight delay so the user sees the completion animation first
          setTimeout(() => {
            StoreReview.requestReview();
          }, 1500);
        }
      } catch {
        // Silently fail - review prompt is non-critical
      }
    }
  };

  const handleBookmark = async () => {
    if (!verse) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!bookmarked) {
      await StorageService.addBookmark({
        id: `${verse.book}-${verse.chapter}-${verse.verse}-${Date.now()}`,
        verse,
        date: new Date().toISOString(),
      });
    }
    setBookmarked(!bookmarked);
  };

  const handleShare = async () => {
    if (!verse) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = VerseService.formatForSharing(verse);

    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        await Share.share({
          message: text,
        });
      }
    } catch {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyVerse = async () => {
    if (!verse) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ref = VerseService.formatReference(verse);
    const text = `\u201C${verse.text}\u201D \u2014 ${ref} (${verse.translation})`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Skeleton screens while loading
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.content}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '50%' }]} />
          </View>
          <View style={styles.skeletonVerseCard}>
            <View style={styles.skeletonLineSmall} />
            <View style={styles.skeletonLineLarge} />
            <View style={styles.skeletonLineLarge} />
            <View style={[styles.skeletonLineLarge, { width: '60%' }]} />
          </View>
          <View style={styles.skeletonButton} />
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
          {streak && <StreakBadge count={streak.currentStreak} />}
        </View>
      </View>

      {/* Hero Verse Card */}
      {verse && (
        <Animated.View
          style={{
            opacity: verseOpacity,
            transform: [{ translateY: verseTranslateY }],
          }}
        >
          <Card style={styles.verseCard} elevated>
            <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
            <View style={styles.verseDivider} />
            <Text style={styles.verseText}>
              {'\u201C'}{verse.text}{'\u201D'}
            </Text>
            <Text style={styles.verseRef}>
              {VerseService.formatReference(verse)} ({verse.translation})
            </Text>
            <View style={styles.verseActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleBookmark}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={Colors.primary}
                  style={styles.actionIconStyle}
                />
                <Text style={styles.actionLabel}>
                  {bookmarked ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCopyVerse}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={Colors.primary}
                  style={styles.actionIconStyle}
                />
                <Text style={styles.actionLabel}>
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionDivider} />

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="share-outline"
                  size={16}
                  color={Colors.primary}
                  style={styles.actionIconStyle}
                />
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Mark as Read */}
      {!hasRead ? (
        <TouchableOpacity
          style={styles.readButton}
          onPress={handleMarkAsRead}
          activeOpacity={0.8}
        >
          <View style={styles.readButtonContent}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.textOnDark}
              style={{ marginRight: Spacing.md }}
            />
            <View>
              <Text style={styles.readButtonText}>Mark Today as Read</Text>
              <Text style={styles.readButtonSub}>Keep your streak alive</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <Animated.View
          style={[
            styles.completedCard,
            {
              transform: [{ scale: checkAnim }],
            },
          ]}
        >
          <View style={styles.completedCircle}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
          </View>
          <Text style={styles.completedText}>Today's reading complete</Text>
          <Text style={styles.completedSub}>
            Come back tomorrow to continue your streak
          </Text>
        </Animated.View>
      )}

      {/* Quick Stats */}
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
            <Text style={[styles.quickStatValue, { color: Colors.gold }]}>
              {streak.currentStreak}
            </Text>
            <Text style={styles.quickStatLabel}>Current</Text>
          </View>
        </View>
      )}

      {/* Encouraging message */}
      <View style={styles.encourageCard}>
        <Ionicons name="sparkles" size={20} color={Colors.gold} style={{ marginRight: Spacing.sm }} />
        <Text style={styles.encourageText}>
          {streak ? StreakIntelligence.getEncouragingMessage(streak) : getEncouragingMessage(0)}
        </Text>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function getEncouragingMessage(streak: number): string {
  if (streak === 0) return 'Start your journey today. Every great habit begins with a single step.';
  if (streak === 1) return 'Day one in the books. Tomorrow will make two. You\'ve got this.';
  if (streak < 7) return `${streak} days strong. You're building something beautiful.`;
  if (streak < 30) return `${streak} days of faithfulness. Your consistency is inspiring.`;
  if (streak < 100) return `${streak} days! You're proving that devotion is a daily choice.`;
  return `${streak} days of Scripture. You are a shining example of faithfulness.`;
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
    color: Colors.textSecondary,
    fontWeight: '300',
    lineHeight: 24,
  },
  verseCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  verseLabel: {
    ...Typography.caption,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  verseDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.gold,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  verseText: {
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  verseRef: {
    ...Typography.verseRef,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  verseActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  actionIconStyle: {
    marginRight: Spacing.xs,
  },
  actionLabel: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
  },
  readButton: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  readButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButtonText: {
    ...Typography.button,
    color: Colors.textOnDark,
  },
  readButtonSub: {
    fontSize: 13,
    fontWeight: '300',
    color: '#FFFFFF88',
    marginTop: 2,
    lineHeight: 24,
  },
  completedCard: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#4CAF5030',
  },
  completedCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.textSecondary,
    fontWeight: '300',
    lineHeight: 24,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
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
    fontSize: 48,
    fontWeight: '200',
    color: Colors.navy,
    marginBottom: 2,
    letterSpacing: -2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
    fontVariant: ['tabular-nums'],
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  encourageCard: {
    backgroundColor: Colors.accentMuted,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  encourageText: {
    ...Typography.bodySmall,
    flex: 1,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '300',
    lineHeight: 24,
  },
  // Skeleton styles
  skeletonHeader: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    width: '70%',
  },
  skeletonLineSmall: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    width: '40%',
    alignSelf: 'center',
  },
  skeletonLineLarge: {
    height: 16,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    width: '90%',
    alignSelf: 'center',
  },
  skeletonVerseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  skeletonButton: {
    height: 56,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
  },
});
