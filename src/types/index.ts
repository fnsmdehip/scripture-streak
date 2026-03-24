export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface DailyReading {
  date: string;
  verse: Verse;
  completed: boolean;
  bookmarked: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysRead: number;
  readDates: string[];
  lastReadDate: string | null;
  freezesUsedThisMonth?: number;
  lastFreezeMonth?: string; // "YYYY-MM"
}

export interface ReadingProgress {
  currentBook: string;
  currentChapter: number;
  completedBooks: string[];
  completedChapters: Record<string, number[]>;
}

export interface UserSettings {
  notificationTime: string;
  preferredTranslation: string;
  streakReminders: boolean;
  dailyGoalVerses: number;
  isPremium: boolean;
}

export interface OnboardingState {
  completed: boolean;
  translation: string;
  dailyGoal: 'verse' | 'chapter' | 'custom';
  customGoalCount: number;
  notificationTime: string;
  notificationsEnabled: boolean;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  book: string;
  totalChapters: number;
  durationDays: number;
  icon: string;
}

export interface ReadingPlanProgress {
  planId: string;
  startDate: string;
  completedDays: string[];
  currentDay: number;
  lastReadDate: string | null;
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface BookmarkEntry {
  id: string;
  verse: Verse;
  date: string;
  note?: string;
}

export type RootTabParamList = {
  Daily: undefined;
  Streaks: undefined;
  Bible: undefined;
  Plans: undefined;
  Settings: undefined;
};

export type BibleStackParamList = {
  BibleHome: undefined;
  ChapterView: { book: string; chapter: number };
};

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'paywall'
  | 'main';
