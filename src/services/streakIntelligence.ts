// Streak Intelligence Service
// Calculates advanced streak metrics, milestones, and encouragement.

import { StreakData } from '../types';

export interface StreakMilestone {
  days: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  label: string;
  icon: string; // Ionicons name
  color: string;
  achieved: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysRead: number;
  consistencyLast30: number; // percentage 0-100
  daysThisWeek: number;
  daysThisMonth: number;
  daysThisYear: number;
  averagePerWeek: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  estimatedReadingMinutes: number; // total estimated
  mostReadDayOfWeek: string;
  readingPace: number; // chapters per week estimate
}

const MILESTONES: Omit<StreakMilestone, 'achieved'>[] = [
  { days: 7, tier: 'bronze', label: '1 Week', icon: 'star', color: '#CD7F32' },
  { days: 30, tier: 'silver', label: '1 Month', icon: 'flame', color: '#C0C0C0' },
  { days: 100, tier: 'gold', label: '100 Days', icon: 'diamond', color: '#FFD700' },
  { days: 365, tier: 'diamond', label: '1 Year', icon: 'trophy', color: '#B9F2FF' },
];

const STREAK_BROKEN_MESSAGES = [
  "Every day is a new beginning. Pick up where you left off.",
  "Grace means every morning is a fresh start. You've got this.",
  "A setback is a setup for a comeback. Start again today.",
  "Even the greatest saints had off days. What matters is coming back.",
  "Your past faithfulness isn't erased. Begin again with joy.",
  "God's mercies are new every morning. So is your streak potential.",
  "Missing a day doesn't erase your growth. Keep going.",
  "The best time to restart is right now. You're one day away from a new streak.",
];

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay();
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StreakIntelligence = {
  /**
   * Calculate comprehensive streak stats from raw data.
   */
  calculateStats(streak: StreakData): StreakStats {
    const now = new Date();
    const today = getToday();
    const readSet = new Set(streak.readDates);

    // Days this week (Sunday = start)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    let daysThisWeek = 0;
    for (let i = 0; i <= now.getDay(); i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (readSet.has(ds)) daysThisWeek++;
    }

    // Days this month
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    let daysThisMonth = 0;
    for (const d of streak.readDates) {
      if (d >= monthStart && d <= today) daysThisMonth++;
    }

    // Days this year
    const yearStart = `${now.getFullYear()}-01-01`;
    let daysThisYear = 0;
    for (const d of streak.readDates) {
      if (d >= yearStart && d <= today) daysThisYear++;
    }

    // Consistency last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;
    let last30Count = 0;
    for (const d of streak.readDates) {
      if (d >= thirtyDaysAgoStr && d <= today) last30Count++;
    }
    const consistencyLast30 = Math.round((last30Count / 30) * 100);

    // Average per week
    let averagePerWeek = 0;
    if (streak.readDates.length > 0) {
      const firstDate = new Date(streak.readDates[0] + 'T12:00:00');
      const weeks = Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      averagePerWeek = Math.round((streak.totalDaysRead / weeks) * 10) / 10;
    }

    // Weekly trend (compare this week to last week)
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    let daysLastWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(lastWeekStart);
      d.setDate(lastWeekStart.getDate() + i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (readSet.has(ds)) daysLastWeek++;
    }
    let weeklyTrend: 'up' | 'down' | 'stable' = 'stable';
    if (daysThisWeek > daysLastWeek) weeklyTrend = 'up';
    else if (daysThisWeek < daysLastWeek) weeklyTrend = 'down';

    // Most read day of week
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    for (const d of streak.readDates) {
      dayCount[getDayOfWeek(d)]++;
    }
    const maxDay = dayCount.indexOf(Math.max(...dayCount));
    const mostReadDayOfWeek = streak.readDates.length > 0 ? DAY_NAMES[maxDay] : 'N/A';

    // Estimated reading minutes (avg 3 min per reading session for a daily verse/chapter)
    const estimatedReadingMinutes = streak.totalDaysRead * 5;

    // Reading pace (approximate chapters per week based on reading days)
    const readingPace = Math.round(averagePerWeek * 10) / 10;

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDaysRead: streak.totalDaysRead,
      consistencyLast30,
      daysThisWeek,
      daysThisMonth,
      daysThisYear,
      averagePerWeek,
      weeklyTrend,
      estimatedReadingMinutes,
      mostReadDayOfWeek,
      readingPace,
    };
  },

  /**
   * Get milestones with achieved status.
   */
  getMilestones(totalDaysRead: number): StreakMilestone[] {
    return MILESTONES.map((m) => ({
      ...m,
      achieved: totalDaysRead >= m.days,
    }));
  },

  /**
   * Get the next milestone to achieve.
   */
  getNextMilestone(totalDaysRead: number): StreakMilestone | null {
    const next = MILESTONES.find((m) => totalDaysRead < m.days);
    return next ? { ...next, achieved: false } : null;
  },

  /**
   * Check if streak is broken (last read date is not today or yesterday).
   */
  isStreakBroken(streak: StreakData): boolean {
    if (!streak.lastReadDate) return false; // never started
    const last = streak.lastReadDate;
    const today = getToday();
    const yesterday = getYesterday();
    return last !== today && last !== yesterday && streak.currentStreak > 0;
  },

  /**
   * Get an encouraging message when streak breaks.
   */
  getStreakBrokenMessage(): string {
    const idx = Math.floor(Math.random() * STREAK_BROKEN_MESSAGES.length);
    return STREAK_BROKEN_MESSAGES[idx];
  },

  /**
   * Get streak freeze availability.
   * Free users: 1 per month. Premium: unlimited.
   */
  getStreakFreezeInfo(isPremium: boolean, freezesUsedThisMonth: number): {
    available: boolean;
    remaining: number;
    label: string;
  } {
    if (isPremium) {
      return { available: true, remaining: 999, label: 'Unlimited (Premium)' };
    }
    const remaining = Math.max(0, 1 - freezesUsedThisMonth);
    return {
      available: remaining > 0,
      remaining,
      label: remaining > 0 ? '1 free freeze this month' : 'Upgrade to Premium for unlimited freezes',
    };
  },

  /**
   * Get contextual encouragement based on streak state.
   */
  getEncouragingMessage(streak: StreakData): string {
    if (streak.totalDaysRead === 0) {
      return 'Start your journey today. Every great habit begins with a single step.';
    }
    if (this.isStreakBroken(streak)) {
      return this.getStreakBrokenMessage();
    }
    if (streak.currentStreak === 1) {
      return "Day one in the books. Tomorrow will make two. You've got this.";
    }
    if (streak.currentStreak < 7) {
      return `${streak.currentStreak} days strong. You're building something beautiful.`;
    }
    if (streak.currentStreak === 7) {
      return 'One full week! Bronze milestone unlocked. Keep the momentum going.';
    }
    if (streak.currentStreak < 30) {
      return `${streak.currentStreak} days of faithfulness. Your consistency is inspiring.`;
    }
    if (streak.currentStreak === 30) {
      return "One whole month! Silver milestone achieved. You're proving that devotion is a daily choice.";
    }
    if (streak.currentStreak < 100) {
      return `${streak.currentStreak} days! You're well on your way to the Gold milestone at 100.`;
    }
    if (streak.currentStreak === 100) {
      return '100 DAYS! Gold milestone unlocked. Your dedication is extraordinary.';
    }
    if (streak.currentStreak < 365) {
      return `${streak.currentStreak} days of Scripture. You are a shining example of faithfulness.`;
    }
    return `${streak.currentStreak} days! Diamond status. You are a true champion of the Word.`;
  },
};
